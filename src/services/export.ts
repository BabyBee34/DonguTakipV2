// Veri Export/Import İşlemleri
import { AppState } from '../types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export interface ExportData {
  version: string;
  exportDate: string;
  data: Partial<AppState>;
}

// Verileri JSON olarak dışa aktar
export async function exportData(appState: Partial<AppState>): Promise<void> {
  try {
    const exportData: ExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        prefs: appState.prefs,
        logs: appState.logs,
        periods: appState.periods,
        notifications: appState.notifications,
        settings: appState.settings,
      },
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const fileName = `cyclemate_backup_${Date.now()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonString);

    // Dosyayı paylaş
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'CycleMate Yedek Dosyasını Kaydet',
      });
    } else {
      throw new Error('Paylaşım bu cihazda desteklenmiyor');
    }
  } catch (error) {
    console.error('Export hatası:', error);
    throw error;
  }
}

// JSON dosyasından verileri içe aktar
export async function importData(): Promise<Partial<AppState> | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.type === 'cancel' || !result.uri) {
      return null;
    }

    const fileContent = await FileSystem.readAsStringAsync(result.uri);
    const importData: ExportData = JSON.parse(fileContent);

    // Versiyon kontrolü
    if (!importData.version || !importData.data) {
      throw new Error('Geçersiz yedek dosyası formatı');
    }

    // Veri doğrulama
    validateImportData(importData.data);

    return importData.data;
  } catch (error) {
    console.error('Import hatası:', error);
    throw error;
  }
}

// İçe aktarılan verileri doğrula
function validateImportData(data: Partial<AppState>): void {
  // Temel veri yapısı kontrolü
  if (data.prefs && typeof data.prefs !== 'object') {
    throw new Error('Geçersiz tercihler verisi');
  }

  if (data.logs && !Array.isArray(data.logs)) {
    throw new Error('Geçersiz günlük verisi');
  }

  if (data.periods && !Array.isArray(data.periods)) {
    throw new Error('Geçersiz dönem verisi');
  }

  // Tarih formatı kontrolü
  if (data.logs) {
    for (const log of data.logs) {
      if (!log.date || !log.id) {
        throw new Error('Günlük verilerinde eksik alanlar var');
      }
    }
  }

  if (data.periods) {
    for (const period of data.periods) {
      if (!period.start || !period.id) {
        throw new Error('Dönem verilerinde eksik alanlar var');
      }
    }
  }
}

