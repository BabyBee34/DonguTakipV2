/**
 * PIN Kilidi Servisi
 */
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

const PIN_KEY = 'cyclemate_pin';
const PIN_ATTEMPTS_KEY = 'cyclemate_pin_attempts';
const MAX_ATTEMPTS = 6;

/**
 * PIN var mı kontrol et
 */
export async function hasPIN(): Promise<boolean> {
  try {
    const pin = await SecureStore.getItemAsync(PIN_KEY);
    return pin !== null;
  } catch (error) {
    console.error('PIN check error:', error);
    return false;
  }
}

/**
 * PIN kaydet
 */
export async function savePIN(pin: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(PIN_KEY, pin);
    await SecureStore.setItemAsync(PIN_ATTEMPTS_KEY, '0');
    return true;
  } catch (error) {
    console.error('PIN save error:', error);
    return false;
  }
}

/**
 * PIN doğrula
 */
export async function verifyPIN(pin: string): Promise<boolean> {
  try {
    const storedPIN = await SecureStore.getItemAsync(PIN_KEY);
    if (!storedPIN) return false;

    const isValid = storedPIN === pin;

    if (!isValid) {
      // Başarısız deneme sayısını artır
      const attempts = await getPINAttempts();
      await SecureStore.setItemAsync(PIN_ATTEMPTS_KEY, (attempts + 1).toString());
    } else {
      // Başarılı girişte deneme sayısını sıfırla
      await SecureStore.setItemAsync(PIN_ATTEMPTS_KEY, '0');
    }

    return isValid;
  } catch (error) {
    console.error('PIN verify error:', error);
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
    return true;
  } catch (error) {
    console.error('PIN remove error:', error);
    return false;
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
    console.error('PIN attempts error:', error);
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
  } catch (error) {
    console.error('PIN reset attempts error:', error);
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
    console.error('Biometric check error:', error);
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
    console.error('Biometric auth error:', error);
    return false;
  }
}

