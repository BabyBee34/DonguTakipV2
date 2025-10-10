/**
 * MMKV Storage - Yüksek Performanslı Storage Çözümü
 * 
 * AsyncStorage'a göre 30x daha hızlı
 * Senkron API (async wrapper ile)
 * Key-value storage
 */

import { MMKV } from 'react-native-mmkv';
import { logger } from './logger';

/**
 * MMKV instance - tüm app verileri için
 */
export const mmkvStorage = new MMKV({
  id: 'cyclemate-storage',
  encryptionKey: 'cyclemate-encryption-key-2025', // Basit encryption
});

/**
 * AsyncStorage benzeri API (Redux Persist uyumluluğu için)
 */
export const mmkvStorageAdapter = {
  /**
   * Veri kaydet
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      mmkvStorage.set(key, value);
      logger.debug(`MMKV SET: ${key} (${value.length} bytes)`);
    } catch (error) {
      logger.error(`MMKV setItem error for key: ${key}`, error);
      throw error;
    }
  },

  /**
   * Veri al
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = mmkvStorage.getString(key);
      logger.debug(`MMKV GET: ${key} -> ${value ? 'found' : 'null'}`);
      return value ?? null;
    } catch (error) {
      logger.error(`MMKV getItem error for key: ${key}`, error);
      return null;
    }
  },

  /**
   * Veri sil
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      mmkvStorage.delete(key);
      logger.debug(`MMKV DELETE: ${key}`);
    } catch (error) {
      logger.error(`MMKV removeItem error for key: ${key}`, error);
      throw error;
    }
  },

  /**
   * Tüm key'leri getir
   */
  getAllKeys: async (): Promise<string[]> => {
    try {
      const keys = mmkvStorage.getAllKeys();
      logger.debug(`MMKV getAllKeys: ${keys.length} keys`);
      return keys;
    } catch (error) {
      logger.error('MMKV getAllKeys error', error);
      return [];
    }
  },

  /**
   * Birden fazla veriyi sil
   */
  multiRemove: async (keys: string[]): Promise<void> => {
    try {
      keys.forEach(key => mmkvStorage.delete(key));
      logger.debug(`MMKV multiRemove: ${keys.length} keys`);
    } catch (error) {
      logger.error('MMKV multiRemove error', error);
      throw error;
    }
  },

  /**
   * Birden fazla veri al
   */
  multiGet: async (keys: string[]): Promise<[string, string | null][]> => {
    try {
      const result: [string, string | null][] = keys.map(key => [
        key,
        mmkvStorage.getString(key) ?? null,
      ]);
      logger.debug(`MMKV multiGet: ${keys.length} keys`);
      return result;
    } catch (error) {
      logger.error('MMKV multiGet error', error);
      return keys.map(key => [key, null]);
    }
  },

  /**
   * Birden fazla veri kaydet
   */
  multiSet: async (keyValuePairs: [string, string][]): Promise<void> => {
    try {
      keyValuePairs.forEach(([key, value]) => {
        mmkvStorage.set(key, value);
      });
      logger.debug(`MMKV multiSet: ${keyValuePairs.length} keys`);
    } catch (error) {
      logger.error('MMKV multiSet error', error);
      throw error;
    }
  },

  /**
   * Tümünü temizle
   */
  clear: async (): Promise<void> => {
    try {
      mmkvStorage.clearAll();
      logger.info('MMKV storage cleared');
    } catch (error) {
      logger.error('MMKV clear error', error);
      throw error;
    }
  },
};

/**
 * Direct MMKV API (senkron, daha hızlı)
 */
export const mmkv = {
  /**
   * String kaydet
   */
  setString: (key: string, value: string): void => {
    mmkvStorage.set(key, value);
  },

  /**
   * String al
   */
  getString: (key: string): string | undefined => {
    return mmkvStorage.getString(key);
  },

  /**
   * Number kaydet
   */
  setNumber: (key: string, value: number): void => {
    mmkvStorage.set(key, value);
  },

  /**
   * Number al
   */
  getNumber: (key: string): number | undefined => {
    return mmkvStorage.getNumber(key);
  },

  /**
   * Boolean kaydet
   */
  setBoolean: (key: string, value: boolean): void => {
    mmkvStorage.set(key, value);
  },

  /**
   * Boolean al
   */
  getBoolean: (key: string): boolean | undefined => {
    return mmkvStorage.getBoolean(key);
  },

  /**
   * JSON kaydet
   */
  setJSON: <T>(key: string, value: T): void => {
    mmkvStorage.set(key, JSON.stringify(value));
  },

  /**
   * JSON al
   */
  getJSON: <T>(key: string): T | undefined => {
    const value = mmkvStorage.getString(key);
    if (!value) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`MMKV JSON parse error for key: ${key}`, error);
      return undefined;
    }
  },

  /**
   * Veri sil
   */
  delete: (key: string): void => {
    mmkvStorage.delete(key);
  },

  /**
   * Tüm key'leri getir
   */
  getAllKeys: (): string[] => {
    return mmkvStorage.getAllKeys();
  },

  /**
   * Tümünü temizle
   */
  clearAll: (): void => {
    mmkvStorage.clearAll();
  },

  /**
   * Key var mı kontrol et
   */
  contains: (key: string): boolean => {
    return mmkvStorage.contains(key);
  },
};

/**
 * MMKV istatistikleri
 */
export function getMMKVStats(): {
  totalKeys: number;
  totalSize: number; // bytes
} {
  const keys = mmkvStorage.getAllKeys();
  let totalSize = 0;

  keys.forEach(key => {
    const value = mmkvStorage.getString(key);
    if (value) {
      totalSize += value.length;
    }
  });

  return {
    totalKeys: keys.length,
    totalSize,
  };
}

/**
 * MMKV debug - tüm verileri logla
 */
export function debugMMKV(): void {
  const keys = mmkvStorage.getAllKeys();
  logger.info('MMKV Debug', {
    totalKeys: keys.length,
    keys: keys.slice(0, 10), // İlk 10 key
  });

  keys.slice(0, 5).forEach(key => {
    const value = mmkvStorage.getString(key);
    logger.debug(`  ${key}: ${value?.substring(0, 100)}...`);
  });
}


