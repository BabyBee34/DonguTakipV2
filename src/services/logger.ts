/**
 * Logger Service - Merkezi Loglama Sistemi
 * 
 * Tüm hataları, uyarıları ve bilgilendirmeleri merkezi olarak yönetir.
 * Geliştirme sırasında console'a, production'da AsyncStorage'a kaydeder.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
// import { mmkvStorageAdapter } from './mmkvStorage'; // Build sırasında aktif

// TODO: Build sırasında mmkvStorageAdapter'a çevir
const storageAdapter = AsyncStorage;

const LOG_STORAGE_KEY = 'cyclemate_logs';
const MAX_LOGS = 100; // Maksimum log sayısı

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  stackTrace?: string;
}

/**
 * Log seviyesine göre renk kodları (console için)
 */
const LOG_COLORS = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m', // Yellow
  info: '\x1b[36m', // Cyan
  debug: '\x1b[37m', // White
  reset: '\x1b[0m',
};

/**
 * Log entry oluştur
 */
function createLogEntry(level: LogLevel, message: string, data?: any, error?: Error): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
    stackTrace: error?.stack,
  };
}

/**
 * Console'a logla (development)
 */
function logToConsole(entry: LogEntry): void {
  const color = LOG_COLORS[entry.level];
  const reset = LOG_COLORS.reset;
  const timestamp = new Date(entry.timestamp).toLocaleTimeString('tr-TR');
  
  const prefix = `${color}[${entry.level.toUpperCase()}] ${timestamp}${reset}`;
  
  console.log(`${prefix} ${entry.message}`);
  
  if (entry.data) {
    console.log('Data:', entry.data);
  }
  
  if (entry.stackTrace) {
    console.log('Stack:', entry.stackTrace);
  }
}

/**
 * AsyncStorage'a kaydet (production)
 */
async function logToStorage(entry: LogEntry): Promise<void> {
  try {
    const existingLogsJson = await storageAdapter.getItem(LOG_STORAGE_KEY);
    const existingLogs: LogEntry[] = existingLogsJson ? JSON.parse(existingLogsJson) : [];
    
    // Yeni log'u ekle
    existingLogs.push(entry);
    
    // Maksimum sayıyı aşarsa eski logları sil
    if (existingLogs.length > MAX_LOGS) {
      existingLogs.splice(0, existingLogs.length - MAX_LOGS);
    }
    
    await storageAdapter.setItem(LOG_STORAGE_KEY, JSON.stringify(existingLogs));
  } catch (error) {
    // Storage hatası - sadece console'a yaz
    console.error('Logger storage error:', error);
  }
}

/**
 * Ana log fonksiyonu
 */
async function log(level: LogLevel, message: string, data?: any, error?: Error): Promise<void> {
  const entry = createLogEntry(level, message, data, error);
  
  // Her zaman console'a yaz (development için)
  logToConsole(entry);
  
  // Production'da veya error seviyesindeyse storage'a kaydet
  if (level === 'error' || level === 'warn') {
    await logToStorage(entry);
  }
}

/**
 * Public API
 */
export const logger = {
  /**
   * Hata logu - Her zaman kaydedilir
   */
  error: (message: string, error?: Error | any) => {
    const errorData = error instanceof Error 
      ? { name: error.name, message: error.message }
      : error;
    log('error', message, errorData, error instanceof Error ? error : undefined);
  },

  /**
   * Uyarı logu - Önemli durumlar için
   */
  warn: (message: string, data?: any) => {
    log('warn', message, data);
  },

  /**
   * Bilgi logu - Genel bilgilendirme
   */
  info: (message: string, data?: any) => {
    log('info', message, data);
  },

  /**
   * Debug logu - Geliştirme için detaylı bilgi
   */
  debug: (message: string, data?: any) => {
    if (__DEV__) {
      log('debug', message, data);
    }
  },

  /**
   * Kaydedilen logları getir
   */
  getLogs: async (): Promise<LogEntry[]> => {
    try {
      const logsJson = await storageAdapter.getItem(LOG_STORAGE_KEY);
      return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
      console.error('Get logs error:', error);
      return [];
    }
  },

  /**
   * Tüm logları temizle
   */
  clearLogs: async (): Promise<void> => {
    try {
      await storageAdapter.removeItem(LOG_STORAGE_KEY);
    } catch (error) {
      console.error('Clear logs error:', error);
    }
  },

  /**
   * Belirli bir seviyedeki logları getir
   */
  getLogsByLevel: async (level: LogLevel): Promise<LogEntry[]> => {
    const logs = await logger.getLogs();
    return logs.filter(log => log.level === level);
  },

  /**
   * Son N tane logu getir
   */
  getRecentLogs: async (count: number = 20): Promise<LogEntry[]> => {
    const logs = await logger.getLogs();
    return logs.slice(-count);
  },

  /**
   * Logları export et (debug için)
   */
  exportLogs: async (): Promise<string> => {
    const logs = await logger.getLogs();
    return JSON.stringify(logs, null, 2);
  },
};

/**
 * Global error handler - Yakalanmayan hataları logla
 */
export function setupGlobalErrorHandler(): void {
  const originalErrorHandler = ErrorUtils.getGlobalHandler();
  
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    logger.error(
      `Global ${isFatal ? 'FATAL' : 'Non-Fatal'} Error`,
      error
    );
    
    // Orijinal handler'ı çağır
    if (originalErrorHandler) {
      originalErrorHandler(error, isFatal);
    }
  });
}

