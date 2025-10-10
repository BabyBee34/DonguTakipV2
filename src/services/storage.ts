/**
 * Storage service for device data management
 * 
 * NOT: Export/Import işlemleri için backupService.ts kullanılmaktadır.
 * Bu dosya sadece low-level storage utilities içerir.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
// import { mmkvStorageAdapter } from './mmkvStorage'; // Build sırasında aktif

// TODO: Build sırasında mmkvStorageAdapter'a çevir
const storageAdapter = AsyncStorage;

/**
 * Delete all app data from AsyncStorage
 */
export async function deleteAllData(): Promise<void> {
  try {
    await storageAdapter.clear();
  } catch (error) {
    console.error('Delete all data error:', error);
    throw new Error('Veri silinemedi');
  }
}

/**
 * Get storage size (in KB)
 */
export async function getStorageSize(): Promise<number> {
  try {
    const keys = await storageAdapter.getAllKeys();
    let totalSize = 0;

    for (const key of keys) {
      const value = await storageAdapter.getItem(key);
      if (value) {
        // String byte size calculation (UTF-16)
        totalSize += value.length * 2;
      }
    }

    return Math.round(totalSize / 1024); // KB
  } catch (error) {
    console.error('Get storage size error:', error);
    return 0;
  }
}

