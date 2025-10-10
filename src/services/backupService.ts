/**
 * Gelişmiş Backup/Export/Import Servisi
 */
import * as FileSystem from 'expo-file-system';
import { BackupData, validateBackupSchema, BackupSymptom } from '../types/backup';
import { RootState } from '../store';
import { normalizeSymptomEntries } from './symptomUtils';
import { encryptJSON, decryptJSON, EncryptedData } from './encryption';
import { logger } from './logger';

/**
 * Tüm uygulama verisini export et
 * @param state Redux state
 * @param encrypt Şifreleme kullanılacak mı?
 * @param password Şifreleme password'ü (encrypt=true ise zorunlu)
 */
export async function exportDataToFile(
  state: RootState,
  encrypt: boolean = false,
  password?: string
): Promise<string> {
  try {
    const backupData: BackupData = {
      version: 1,
      settings: {
        periodAvg: state.prefs.avgPeriodDays,
        cycleAvg: state.prefs.avgCycleDays,
        lastPeriodStart: state.prefs.lastPeriodStart,
        theme: state.settings.theme as 'system' | 'light' | 'dark',
        notifications: {
          enabled: state.notification.settings?.enabled ?? false,
          dailyTime: state.notification.settings?.reminderTime
            ? `${state.notification.settings.reminderTime.hour}:${state.notification.settings.reminderTime.minute}`
            : undefined,
          prePeriodDays: (state.notification.settings?.upcomingPeriodDays ?? 2) as 0 | 1 | 2 | 3 | 5 | 7,
        },
      },
      journals: state.logs.map(log => {
        const normalizedSymptoms = normalizeSymptomEntries(log.symptoms);
        const backupSymptoms: BackupSymptom[] = normalizedSymptoms.map(item => ({
          id: item.id,
          severity: item.severity,
        }));

        return {
          id: log.id,
          date: log.date,
          mood: log.mood,
          symptoms: backupSymptoms,
          note: log.note,
          habits: Array.isArray(log.habits) ? log.habits : undefined,
          flow: log.flow,
        };
      }),
      cycles: state.periods.map(period => ({
        id: period.id,
        start: period.start,
        end: period.end,
        cycleLengthDays: period.cycleLengthDays,
        periodLengthDays: period.periodLengthDays,
      })),
      exportDate: new Date().toISOString(),
    };

    let fileContent: string;
    let fileName: string;

    if (encrypt) {
      if (!password) {
        throw new Error('Şifreleme için password gerekli');
      }

      logger.info('Backup şifreleniyor...');
      const encryptedData = await encryptJSON(backupData, password);
      
      if (!encryptedData) {
        throw new Error('Veri şifrelenemedi');
      }

      fileContent = JSON.stringify(encryptedData, null, 2);
      fileName = `cyclemate_backup_encrypted_${new Date().toISOString().slice(0, 10)}.json`;
    } else {
      fileContent = JSON.stringify(backupData, null, 2);
      fileName = `cyclemate_backup_${new Date().toISOString().slice(0, 10)}.json`;
    }

    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, fileContent);

    logger.info('Backup başarıyla oluşturuldu', { encrypted: encrypt, fileName });
    return fileUri;
  } catch (error) {
    logger.error('Export error', error);
    throw new Error('Veri dışa aktarılamadı');
  }
}

/**
 * JSON dosyasından veri import et (birleştirme ile)
 * @param fileUri Dosya URI
 * @param password Şifreli dosya için password (opsiyonel)
 */
export async function importDataFromFile(
  fileUri: string,
  password?: string
): Promise<{
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
    let parsedData = JSON.parse(jsonString);

    // Şifreli mi kontrol et
    if (parsedData.encrypted && parsedData.iv && parsedData.salt) {
      // Şifreli dosya
      if (!password) {
        return {
          success: false,
          error: 'Şifreli dosya için password gerekli',
        };
      }

      logger.info('Şifreli backup tespit edildi, çözülüyor...');
      const decryptedData = await decryptJSON(parsedData as EncryptedData, password);
      
      if (!decryptedData) {
        return {
          success: false,
          error: 'Şifre çözme başarısız. Yanlış password?',
        };
      }

      parsedData = decryptedData;
    }

    const data = parsedData;

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
    logger.error('Import error', error);
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
      symptoms: normalizeSymptomEntries(ij.symptoms),
      note: ij.note ?? '',
      habits: Array.isArray(ij.habits) ? ij.habits : [],
      flow: ij.flow,
      createdAt: ij.createdAt ?? currentState.logs.find(l => l.id === ij.id)?.createdAt ?? new Date().toISOString(),
      updatedAt: ij.updatedAt ?? new Date().toISOString(),
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
      settings: {
        ...currentState.notification.settings,
        enabled: importedData.settings.notifications.enabled,
        reminderTime: importedData.settings.notifications.dailyTime
          ? {
              hour: parseInt(importedData.settings.notifications.dailyTime.split(':')[0], 10),
              minute: parseInt(importedData.settings.notifications.dailyTime.split(':')[1], 10),
            }
          : currentState.notification.settings.reminderTime,
        upcomingPeriodDays: importedData.settings.notifications.prePeriodDays,
      },
    },
  };
}
