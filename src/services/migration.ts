/**
 * Storage Migration Service
 * AsyncStorage -> MMKV Migration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { mmkvStorageAdapter, mmkv } from './mmkvStorage';
import { logger } from './logger';

const MIGRATION_KEY = 'storage_migration_completed';
const MIGRATION_VERSION = '1.0.0';

export interface MigrationResult {
  success: boolean;
  migratedKeys: number;
  failedKeys: string[];
  totalSize: number;
  duration: number;
}

/**
 * Migration yapılmış mı kontrol et
 */
export function isMigrationCompleted(): boolean {
  return mmkv.getBoolean(MIGRATION_KEY) === true;
}

/**
 * Migration version bilgisi
 */
export function getMigrationVersion(): string | undefined {
  return mmkv.getString(`${MIGRATION_KEY}_version`);
}

/**
 * AsyncStorage'dan MMKV'ye veri migrate et
 */
export async function migrateAsyncStorageToMMKV(): Promise<MigrationResult> {
  const startTime = Date.now();
  const failedKeys: string[] = [];
  let totalSize = 0;
  
  try {
    logger.info('Storage migration başlatıldı: AsyncStorage -> MMKV');

    // Tüm AsyncStorage key'lerini al
    const allKeys = await AsyncStorage.getAllKeys();
    logger.info(`AsyncStorage'da ${allKeys.length} key bulundu`);

    if (allKeys.length === 0) {
      logger.info('AsyncStorage boş, migration atlandı');
      markMigrationCompleted();
      return {
        success: true,
        migratedKeys: 0,
        failedKeys: [],
        totalSize: 0,
        duration: Date.now() - startTime,
      };
    }

    // Tüm verileri al
    const allData = await AsyncStorage.multiGet(allKeys);
    
    // Her key-value çiftini MMKV'ye kopyala
    for (const [key, value] of allData) {
      if (value !== null) {
        try {
          await mmkvStorageAdapter.setItem(key, value);
          totalSize += value.length;
          logger.debug(`Migrated: ${key} (${value.length} bytes)`);
        } catch (error) {
          logger.error(`Migration failed for key: ${key}`, error);
          failedKeys.push(key);
        }
      }
    }

    const migratedKeys = allKeys.length - failedKeys.length;
    const duration = Date.now() - startTime;

    logger.info('Migration tamamlandı', {
      migratedKeys,
      failedKeys: failedKeys.length,
      totalSize,
      duration: `${duration}ms`,
    });

    // Migration başarılı olarak işaretle
    if (failedKeys.length === 0) {
      markMigrationCompleted();
    }

    return {
      success: failedKeys.length === 0,
      migratedKeys,
      failedKeys,
      totalSize,
      duration,
    };
  } catch (error) {
    logger.error('Migration kritik hata', error);
    throw error;
  }
}

/**
 * Migration'ı tamamlandı olarak işaretle
 */
function markMigrationCompleted(): void {
  mmkv.setBoolean(MIGRATION_KEY, true);
  mmkv.setString(`${MIGRATION_KEY}_version`, MIGRATION_VERSION);
  mmkv.setString(`${MIGRATION_KEY}_timestamp`, new Date().toISOString());
  logger.info('Migration tamamlandı olarak işaretlendi');
}

/**
 * Migration'ı sıfırla (test için)
 */
export function resetMigration(): void {
  mmkv.delete(MIGRATION_KEY);
  mmkv.delete(`${MIGRATION_KEY}_version`);
  mmkv.delete(`${MIGRATION_KEY}_timestamp`);
  logger.warn('Migration sıfırlandı');
}

/**
 * AsyncStorage'ı temizle (migration sonrası)
 * 
 * UYARI: Sadece migration başarılı olduktan sonra çağırın!
 */
export async function clearAsyncStorageAfterMigration(): Promise<void> {
  try {
    if (!isMigrationCompleted()) {
      logger.warn('Migration tamamlanmadan AsyncStorage temizlenemez');
      return;
    }

    logger.info('AsyncStorage temizleniyor (migration sonrası)...');
    await AsyncStorage.clear();
    logger.info('AsyncStorage temizlendi');
  } catch (error) {
    logger.error('AsyncStorage temizleme hatası', error);
    throw error;
  }
}

/**
 * Migration durumu
 */
export interface MigrationStatus {
  completed: boolean;
  version?: string;
  timestamp?: string;
  mmkvStats: {
    totalKeys: number;
    totalSize: number;
  };
}

/**
 * Migration durumunu getir
 */
export function getMigrationStatus(): MigrationStatus {
  const completed = isMigrationCompleted();
  const version = mmkv.getString(`${MIGRATION_KEY}_version`);
  const timestamp = mmkv.getString(`${MIGRATION_KEY}_timestamp`);
  const allKeys = mmkv.getAllKeys();
  
  let totalSize = 0;
  allKeys.forEach(key => {
    const value = mmkv.getString(key);
    if (value) {
      totalSize += value.length;
    }
  });

  return {
    completed,
    version,
    timestamp,
    mmkvStats: {
      totalKeys: allKeys.length,
      totalSize,
    },
  };
}

/**
 * Rollback - MMKV'den AsyncStorage'a geri dön
 * 
 * UYARI: Acil durumlar için, normalde kullanılmamalı
 */
export async function rollbackToAsyncStorage(): Promise<void> {
  try {
    logger.warn('ROLLBACK başlatıldı: MMKV -> AsyncStorage');

    const allKeys = mmkv.getAllKeys();
    const keyValuePairs: [string, string][] = [];

    allKeys.forEach(key => {
      const value = mmkv.getString(key);
      if (value) {
        keyValuePairs.push([key, value]);
      }
    });

    await AsyncStorage.multiSet(keyValuePairs);
    
    // Migration flag'ini sil
    resetMigration();

    logger.warn(`ROLLBACK tamamlandı: ${keyValuePairs.length} key geri yüklendi`);
  } catch (error) {
    logger.error('Rollback hatası', error);
    throw error;
  }
}



