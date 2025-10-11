/**
 * Theme Storage - MMKV ile Tema Persist
 * 
 * Tema ayarlarını cihazda saklar, migration destekler.
 */

import { storage } from '../services/storage';
import { ThemeTokens, LIGHT_PRESET, validateTheme, ThemeTokensSchema } from './tokens';
import { logger } from '../services/logger';

const THEME_KEY = 'cm.theme.v2';
const OLD_THEME_KEY = 'settings.theme'; // Migration için

// Tema yükle
export async function loadTheme(): Promise<ThemeTokens | null> {
  try {
    // Yeni şemayı dene
    const stored = await storage.getItem(THEME_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      
      if (validateTheme(parsed)) {
        logger.debug('[ThemeStorage] Theme loaded from storage');
        return parsed;
      } else {
        logger.warn('[ThemeStorage] Invalid theme in storage, using default');
        return LIGHT_PRESET;
      }
    }
    
    // Migration: eski tema ayarını kontrol et
    const oldTheme = await storage.getItem(OLD_THEME_KEY);
    if (oldTheme) {
      logger.info('[ThemeStorage] Migrating old theme to v2');
      const migrated = migrateOldTheme(oldTheme);
      await saveTheme(migrated);
      return migrated;
    }
    
    return null;
    
  } catch (error) {
    logger.error('[ThemeStorage] Failed to load theme', error);
    return LIGHT_PRESET; // Fallback
  }
}

// Tema kaydet
export async function saveTheme(theme: ThemeTokens): Promise<void> {
  try {
    // Validate
    ThemeTokensSchema.parse(theme);
    
    await storage.setItem(THEME_KEY, JSON.stringify(theme));
    logger.debug('[ThemeStorage] Theme saved');
    
    // Callback'leri tetikle
    notifyThemeChange(theme);
    
  } catch (error) {
    logger.error('[ThemeStorage] Failed to save theme', error);
  }
}

// Eski tema migration
function migrateOldTheme(oldTheme: string): ThemeTokens {
  const migrated: ThemeTokens = { ...LIGHT_PRESET };
  
  try {
    const old = JSON.parse(oldTheme);
    
    // Eski 'system' | 'light' | 'dark' değerini yeni şemaya taşı
    if (old === 'system' || old === 'light' || old === 'dark') {
      migrated.mode = old;
    } else if (typeof old === 'object' && old.mode) {
      migrated.mode = old.mode;
    }
    
    logger.info('[ThemeStorage] Old theme migrated successfully');
  } catch (error) {
    logger.warn('[ThemeStorage] Migration failed, using defaults', error);
  }
  
  return migrated;
}

// Theme change listeners
type ThemeChangeCallback = (theme: ThemeTokens) => void;
const listeners: ThemeChangeCallback[] = [];

export function onThemeChange(callback: ThemeChangeCallback): () => void {
  listeners.push(callback);
  
  // Unsubscribe fonksiyonu döndür
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

function notifyThemeChange(theme: ThemeTokens): void {
  listeners.forEach(callback => {
    try {
      callback(theme);
    } catch (error) {
      logger.warn('[ThemeStorage] Listener error', error);
    }
  });
}

// Tema sıfırla
export async function resetTheme(): Promise<void> {
  await saveTheme(LIGHT_PRESET);
  logger.info('[ThemeStorage] Theme reset to default');
}

// Export all for convenience
export { LIGHT_PRESET, THEME_PRESETS } from './tokens';
