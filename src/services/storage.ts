/**
 * Storage service for data export/import
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AppState } from '../types';

const STORAGE_KEY = 'cyclemate_data';

/**
 * Export all app data to JSON file
 */
export async function exportDataToJSON(state: any): Promise<string> {
  try {
    const dataToExport = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      data: state,
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const fileName = `cyclemate_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonString);

    // Check if sharing is available
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'CycleMate Verileri Dışa Aktar',
        UTI: 'public.json',
      });
    }

    return fileUri;
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Veri dışa aktarılamadı');
  }
}

/**
 * Import data from JSON file
 */
export async function importDataFromJSON(fileUri: string): Promise<any> {
  try {
    const jsonString = await FileSystem.readAsStringAsync(fileUri);
    const importedData = JSON.parse(jsonString);

    // Validate data structure
    if (!importedData.data || !importedData.version) {
      throw new Error('Geçersiz veri formatı');
    }

    return importedData.data;
  } catch (error) {
    console.error('Import error:', error);
    throw new Error('Veri içe aktarılamadı');
  }
}

/**
 * Delete all app data from AsyncStorage
 */
export async function deleteAllData(): Promise<void> {
  try {
    await AsyncStorage.clear();
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
    const keys = await AsyncStorage.getAllKeys();
    let totalSize = 0;

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
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

