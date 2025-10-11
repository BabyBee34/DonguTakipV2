// Backup/Export veri şeması
export interface BackupSettings {
  periodAvg: number;
  cycleAvg: number;
  lastPeriodStart?: string;
  theme: 'system' | 'light' | 'dark';
  notifications: {
    enabled: boolean;
    dailyTime?: string;
    prePeriodDays: 0 | 1 | 2 | 3 | 5 | 7;
  };
}

export type BackupMood =
  | 'ecstatic'
  | 'happy'
  | 'calm'
  | 'neutral'
  | 'tired'
  | 'sad'
  | 'angry'
  | 'anxious'
  | 'irritable';

export interface BackupSymptom {
  id: string;
  severity: number;
}

export interface BackupJournalEntry {
  id: string;
  date: string;
  mood?: BackupMood;
  symptoms: BackupSymptom[];
  note?: string;
  habits?: string[];
  flow?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackupCycleRecord {
  id: string;
  start: string;
  end?: string;
  cycleLengthDays?: number;
  periodLengthDays?: number;
}

export interface BackupData {
  version: 1;
  settings: BackupSettings;
  journals: BackupJournalEntry[];
  cycles: BackupCycleRecord[];
  exportDate: string;
}

// Şema validasyon fonksiyonu
export function validateBackupSchema(data: any): data is BackupData {
  if (!data || typeof data !== 'object') return false;
  if (data.version !== 1) return false;
  if (!data.settings || typeof data.settings !== 'object') return false;
  if (!Array.isArray(data.journals)) return false;
  if (!Array.isArray(data.cycles)) return false;
  return true;
}




