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
 * Export storage adapter for use in other services
 */
export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await storageAdapter.getItem(key);
    } catch (error) {
      console.error('[Storage] getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await storageAdapter.setItem(key, value);
    } catch (error) {
      console.error('[Storage] setItem error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await storageAdapter.removeItem(key);
    } catch (error) {
      console.error('[Storage] removeItem error:', error);
    }
  },
  clear: async (): Promise<void> => {
    try {
      await storageAdapter.clear();
    } catch (error) {
      console.error('[Storage] clear error:', error);
    }
  },
  getAllKeys: async (): Promise<string[]> => {
    try {
      return await storageAdapter.getAllKeys();
    } catch (error) {
      console.error('[Storage] getAllKeys error:', error);
      return [];
    }
  }
};

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

