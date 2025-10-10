/**
 * Cache Service - Veri Önbellekleme Sistemi
 * 
 * İstatistik hesaplamalarını ve ağır işlemleri cache'ler.
 * TTL (Time To Live) ile otomatik expiry yönetimi.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
// import { mmkvStorageAdapter } from './mmkvStorage'; // Build sırasında aktif
import { logger } from './logger';

// TODO: Build sırasında mmkvStorageAdapter'a çevir
const storageAdapter = AsyncStorage;

const CACHE_PREFIX = 'cache_';
const DEFAULT_TTL = 3600000; // 1 saat (ms)

export interface CacheEntry<T> {
  data: T;
  expiry: number;
  createdAt: number;
}

/**
 * Cache key oluştur
 */
function getCacheKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

/**
 * Cache'den veri al
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cacheKey = getCacheKey(key);
    const cached = await storageAdapter.getItem(cacheKey);
    
    if (!cached) {
      logger.debug(`Cache MISS: ${key}`);
      return null;
    }
    
    const entry: CacheEntry<T> = JSON.parse(cached);
    
    // Expiry kontrolü
    if (Date.now() > entry.expiry) {
      logger.debug(`Cache EXPIRED: ${key}`);
      await storageAdapter.removeItem(cacheKey);
      return null;
    }
    
    logger.debug(`Cache HIT: ${key}`);
    return entry.data;
  } catch (error) {
    logger.error('Cache get error', error);
    return null;
  }
}

/**
 * Cache'e veri kaydet
 */
export async function setCache<T>(
  key: string, 
  data: T, 
  ttl: number = DEFAULT_TTL
): Promise<void> {
  try {
    const cacheKey = getCacheKey(key);
    const now = Date.now();
    
    const entry: CacheEntry<T> = {
      data,
      expiry: now + ttl,
      createdAt: now,
    };
    
    await storageAdapter.setItem(cacheKey, JSON.stringify(entry));
    logger.debug(`Cache SET: ${key} (TTL: ${ttl}ms)`);
  } catch (error) {
    logger.error('Cache set error', error);
  }
}

/**
 * Cache'den veri sil
 */
export async function removeCache(key: string): Promise<void> {
  try {
    const cacheKey = getCacheKey(key);
    await storageAdapter.removeItem(cacheKey);
    logger.debug(`Cache REMOVE: ${key}`);
  } catch (error) {
    logger.error('Cache remove error', error);
  }
}

/**
 * Tüm cache'i temizle
 */
export async function clearCache(): Promise<void> {
  try {
    const keys = await storageAdapter.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await storageAdapter.multiRemove(cacheKeys);
    logger.info(`Cache cleared: ${cacheKeys.length} items`);
  } catch (error) {
    logger.error('Cache clear error', error);
  }
}

/**
 * Cache'i invalidate et (pattern ile)
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await storageAdapter.getAllKeys();
    const matchingKeys = keys.filter(key => 
      key.startsWith(CACHE_PREFIX) && key.includes(pattern)
    );
    await storageAdapter.multiRemove(matchingKeys);
    logger.debug(`Cache invalidated: ${matchingKeys.length} items matching "${pattern}"`);
  } catch (error) {
    logger.error('Cache invalidate error', error);
  }
}

/**
 * Expire olan cache'leri temizle
 */
export async function cleanupExpiredCache(): Promise<void> {
  try {
    const keys = await storageAdapter.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    let removed = 0;
    const now = Date.now();
    
    for (const key of cacheKeys) {
      const cached = await mmkvStorageAdapter.getItem(key);
      if (cached) {
        const entry: CacheEntry<any> = JSON.parse(cached);
        if (now > entry.expiry) {
          await mmkvStorageAdapter.removeItem(key);
          removed++;
        }
      }
    }
    
    if (removed > 0) {
      logger.info(`Cleanup: ${removed} expired cache items removed`);
    }
  } catch (error) {
    logger.error('Cache cleanup error', error);
  }
}

/**
 * Cache istatistikleri
 */
export async function getCacheStats(): Promise<{
  totalItems: number;
  activeItems: number;
  expiredItems: number;
  totalSize: number; // bytes
}> {
  try {
    const keys = await storageAdapter.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    let activeItems = 0;
    let expiredItems = 0;
    let totalSize = 0;
    const now = Date.now();
    
    for (const key of cacheKeys) {
      const cached = await storageAdapter.getItem(key);
      if (cached) {
        // React Native'de Blob yok, byte length kullan
        totalSize += cached.length * 2; // UTF-16 için yaklaşık
        const entry: CacheEntry<any> = JSON.parse(cached);
        if (now > entry.expiry) {
          expiredItems++;
        } else {
          activeItems++;
        }
      }
    }
    
    return {
      totalItems: cacheKeys.length,
      activeItems,
      expiredItems,
      totalSize,
    };
  } catch (error) {
    logger.error('Cache stats error', error);
    return { totalItems: 0, activeItems: 0, expiredItems: 0, totalSize: 0 };
  }
}

/**
 * Cache wrapper - Fonksiyon sonucunu cache'le
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T> | T,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  // Önce cache'e bak
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // Cache'te yoksa hesapla
  const data = await fetcher();
  
  // Cache'e kaydet
  await setCache(key, data, ttl);
  
  return data;
}

