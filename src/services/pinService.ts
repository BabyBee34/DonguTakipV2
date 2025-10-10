/**
 * PIN Kilidi Servisi
 * 
 * GÜVENLİK:
 * - PIN SHA256 hash ile saklanır
 * - Başarısız denemeler loglanır
 * - Geçici kilitleme mekanizması var
 */
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { logger } from './logger';

const PIN_KEY = 'cyclemate_pin_hash';
const PIN_KEY_OLD = 'cyclemate_pin'; // Eski plain text key
const PIN_ATTEMPTS_KEY = 'cyclemate_pin_attempts';
const LOCKOUT_UNTIL_KEY = 'cyclemate_lockout_until';
const MAX_ATTEMPTS = 6;

/**
 * Eski plain text PIN'leri hash formatına migrate et
 */
async function migrateOldPIN(): Promise<void> {
  try {
    const oldPIN = await SecureStore.getItemAsync(PIN_KEY_OLD);
    if (oldPIN) {
      // Eski PIN var, hash'le ve yeni key'e kaydet
      const hashedPIN = await hashPIN(oldPIN);
      await SecureStore.setItemAsync(PIN_KEY, hashedPIN);
      // Eski key'i sil
      await SecureStore.deleteItemAsync(PIN_KEY_OLD);
      logger.info('PIN migrated from plain text to hash');
    }
  } catch (error) {
    logger.error('PIN migration error', error);
  }
}

/**
 * PIN'i SHA256 ile hash'le
 */
async function hashPIN(pin: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin
  );
}

/**
 * PIN var mı kontrol et
 */
export async function hasPIN(): Promise<boolean> {
  try {
    // Önce migration kontrol
    await migrateOldPIN();
    
    const pin = await SecureStore.getItemAsync(PIN_KEY);
    return pin !== null;
  } catch (error) {
    logger.error('PIN check error', error);
    return false;
  }
}

/**
 * PIN kaydet (hash'lenerek)
 */
export async function savePIN(pin: string): Promise<boolean> {
  try {
    const hashedPIN = await hashPIN(pin);
    await SecureStore.setItemAsync(PIN_KEY, hashedPIN);
    await SecureStore.setItemAsync(PIN_ATTEMPTS_KEY, '0');
    // Lockout varsa temizle
    await SecureStore.deleteItemAsync(LOCKOUT_UNTIL_KEY);
    return true;
  } catch (error) {
    logger.error('PIN save error', error);
    return false;
  }
}

/**
 * PIN doğrula (hash karşılaştırması)
 */
export async function verifyPIN(pin: string): Promise<boolean> {
  try {
    // Önce lockout kontrolü
    if (await isLocked()) {
      return false;
    }

    const storedHashedPIN = await SecureStore.getItemAsync(PIN_KEY);
    if (!storedHashedPIN) return false;

    const inputHashedPIN = await hashPIN(pin);
    const isValid = storedHashedPIN === inputHashedPIN;

    if (!isValid) {
      // Başarısız deneme sayısını artır
      const attempts = await getPINAttempts();
      const newAttempts = attempts + 1;
      await SecureStore.setItemAsync(PIN_ATTEMPTS_KEY, newAttempts.toString());
      
      // Geçici kilitleme kontrolü
      await applyLockout(newAttempts);
    } else {
      // Başarılı girişte deneme sayısını sıfırla ve lockout'u temizle
      await SecureStore.setItemAsync(PIN_ATTEMPTS_KEY, '0');
      await SecureStore.deleteItemAsync(LOCKOUT_UNTIL_KEY);
    }

    return isValid;
  } catch (error) {
    logger.error('PIN verify error', error);
    return false;
  }
}

/**
 * PIN'i kaldır
 */
export async function removePIN(): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(PIN_KEY);
    await SecureStore.deleteItemAsync(PIN_ATTEMPTS_KEY);
    await SecureStore.deleteItemAsync(LOCKOUT_UNTIL_KEY);
    return true;
  } catch (error) {
    logger.error('PIN remove error', error);
    return false;
  }
}

/**
 * Geçici kilitleme uygula (deneme sayısına göre)
 */
async function applyLockout(attempts: number): Promise<void> {
  let lockoutMinutes = 0;
  
  if (attempts >= 8) {
    lockoutMinutes = 60; // 1 saat
  } else if (attempts >= 6) {
    lockoutMinutes = 15; // 15 dakika
  } else if (attempts >= 4) {
    lockoutMinutes = 5; // 5 dakika
  }
  
  if (lockoutMinutes > 0) {
    const lockoutUntil = Date.now() + (lockoutMinutes * 60 * 1000);
    await SecureStore.setItemAsync(LOCKOUT_UNTIL_KEY, lockoutUntil.toString());
  }
}

/**
 * Kilitleme durumunu kontrol et
 */
export async function isLocked(): Promise<boolean> {
  try {
    const lockoutUntilStr = await SecureStore.getItemAsync(LOCKOUT_UNTIL_KEY);
    if (!lockoutUntilStr) return false;
    
    const lockoutUntil = parseInt(lockoutUntilStr, 10);
    const now = Date.now();
    
    if (now < lockoutUntil) {
      return true; // Hala kilitli
    } else {
      // Süre dolmuş, lockout'u temizle
      await SecureStore.deleteItemAsync(LOCKOUT_UNTIL_KEY);
      return false;
    }
  } catch (error) {
    logger.error('Lockout check error', error);
    return false;
  }
}

/**
 * Kilitleme bitiş süresini al (ms cinsinden)
 */
export async function getLockoutTime(): Promise<number | null> {
  try {
    const lockoutUntilStr = await SecureStore.getItemAsync(LOCKOUT_UNTIL_KEY);
    if (!lockoutUntilStr) return null;
    
    const lockoutUntil = parseInt(lockoutUntilStr, 10);
    const now = Date.now();
    const remaining = lockoutUntil - now;
    
    return remaining > 0 ? remaining : null;
  } catch (error) {
    logger.error('Get lockout time error', error);
    return null;
  }
}

/**
 * Başarısız deneme sayısını al
 */
export async function getPINAttempts(): Promise<number> {
  try {
    const attempts = await SecureStore.getItemAsync(PIN_ATTEMPTS_KEY);
    return attempts ? parseInt(attempts, 10) : 0;
  } catch (error) {
    logger.error('PIN attempts error', error);
    return 0;
  }
}

/**
 * Maksimum deneme sayısına ulaşıldı mı?
 */
export async function isMaxAttemptsReached(): Promise<boolean> {
  const attempts = await getPINAttempts();
  return attempts >= MAX_ATTEMPTS;
}

/**
 * Deneme sayısını sıfırla
 */
export async function resetPINAttempts(): Promise<void> {
  try {
    await SecureStore.setItemAsync(PIN_ATTEMPTS_KEY, '0');
    await SecureStore.deleteItemAsync(LOCKOUT_UNTIL_KEY);
  } catch (error) {
    logger.error('PIN reset attempts error', error);
  }
}

/**
 * Biyometrik kimlik doğrulama mevcut mu?
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  } catch (error) {
    logger.error('Biometric check error', error);
    return false;
  }
}

/**
 * Biyometrik kimlik doğrulama yap
 */
export async function authenticateWithBiometric(): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'CycleMate\'i aç',
      fallbackLabel: 'PIN kullan',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (error) {
    logger.error('Biometric auth error', error);
    return false;
  }
}

