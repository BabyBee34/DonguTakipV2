/**
 * Gelişmiş Backup/Export/Import Servisi
 */
import * as FileSystem from 'expo-file-system';
import { BackupData, validateBackupSchema } from '../types/backup';
import { RootState } from '../store';

/**
 * Tüm uygulama verisini export et
 */
export async function exportDataToFile(state: RootState): Promise<string> {
  try {
    const backupData: BackupData = {
      version: 1,
      settings: {
        periodAvg: state.prefs.avgPeriodDays,
        cycleAvg: state.prefs.avgCycleDays,
        lastPeriodStart: state.prefs.lastPeriodStart,
        theme: state.settings.theme as 'system' | 'light' | 'dark',
        notifications: {
          enabled: state.notification.enabled,
          dailyTime: state.notification.reminderTime 
            ? `${state.notification.reminderTime.hour}:${state.notification.reminderTime.minute}` 
            : undefined,
          prePeriodDays: (state.notification.upcomingPeriodDays || 2) as 0 | 1 | 2 | 3 | 5 | 7,
        },
      },
      journals: state.logs.map(log => ({
        id: log.id,
        date: log.date,
        mood: log.mood as any,
        symptoms: log.symptoms || [],
        notes: log.notes,
        flow: log.flow,
      })),
      cycles: state.periods.map(period => ({
        id: period.id,
        start: period.start,
        end: period.end,
        cycleLengthDays: period.cycleLengthDays,
        periodLengthDays: period.periodLengthDays,
      })),
      exportDate: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const fileName = `cyclemate_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonString);

    return fileUri;
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Veri dışa aktarılamadı');
  }
}

/**
 * JSON dosyasından veri import et (birleştirme ile)
 */
export async function importDataFromFile(fileUri: string): Promise<{
  success: boolean;
  data?: BackupData;
  error?: string;
  stats?: {
    journals: number;
    cycles: number;
  };
}> {
  try {
    const jsonString = await FileSystem.readAsStringAsync(fileUri);
    const data = JSON.parse(jsonString);

    // Şema validasyonu
    if (!validateBackupSchema(data)) {
      return {
        success: false,
        error: 'Dosya formatı geçersiz. Lütfen geçerli bir CycleMate yedek dosyası seçin.',
      };
    }

    // Versiyon kontrolü
    if (data.version !== 1) {
      return {
        success: false,
        error: `Desteklenmeyen versiyon: ${data.version}. Uygulama güncellemeniz gerekebilir.`,
      };
    }

    return {
      success: true,
      data,
      stats: {
        journals: data.journals.length,
        cycles: data.cycles.length,
      },
    };
  } catch (error: any) {
    console.error('Import error:', error);
    return {
      success: false,
      error: error.message || 'Dosya okunamadı',
    };
  }
}

/**
 * Import edilen veriyi mevcut verilerle birleştir
 */
export function mergeImportedData(currentState: RootState, importedData: BackupData): Partial<RootState> {
  // Ayarları doğrudan al (en son import edilen geçerli)
  const mergedPrefs = {
    ...currentState.prefs,
    avgPeriodDays: importedData.settings.periodAvg,
    avgCycleDays: importedData.settings.cycleAvg,
    lastPeriodStart: importedData.settings.lastPeriodStart,
  };

  // Günlükleri birleştir (aynı ID varsa güncelle, yoksa ekle)
  const existingJournalIds = new Set(currentState.logs.map(l => l.id));
  const mergedJournals = [
    ...currentState.logs.filter(log => {
      // Mevcut günlükleri tut, import edilenler tarafından güncellenecekler hariç
      return !importedData.journals.some(ij => ij.id === log.id);
    }),
    ...importedData.journals.map(ij => ({
      id: ij.id,
      date: ij.date,
      mood: ij.mood,
      symptoms: ij.symptoms,
      notes: ij.notes,
      flow: ij.flow,
    })),
  ];

  // Döngüleri birleştir
  const existingCycleIds = new Set(currentState.periods.map(p => p.id));
  const mergedCycles = [
    ...currentState.periods.filter(period => {
      return !importedData.cycles.some(ic => ic.id === period.id);
    }),
    ...importedData.cycles.map(ic => ({
      id: ic.id,
      start: ic.start,
      end: ic.end,
      cycleLengthDays: ic.cycleLengthDays,
      periodLengthDays: ic.periodLengthDays,
    })),
  ];

  return {
    prefs: mergedPrefs,
    logs: mergedJournals,
    periods: mergedCycles,
    settings: {
      ...currentState.settings,
      theme: importedData.settings.theme,
    },
    notification: {
      ...currentState.notification,
      enabled: importedData.settings.notifications.enabled,
      reminderTime: importedData.settings.notifications.dailyTime
        ? {
            hour: parseInt(importedData.settings.notifications.dailyTime.split(':')[0]),
            minute: parseInt(importedData.settings.notifications.dailyTime.split(':')[1]),
          }
        : currentState.notification.reminderTime,
      upcomingPeriodDays: importedData.settings.notifications.prePeriodDays,
    },
  };
}
