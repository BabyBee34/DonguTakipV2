import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Lock, Fingerprint } from 'phosphor-react-native';
import { 
  verifyPIN, 
  getPINAttempts, 
  isMaxAttemptsReached,
  isBiometricAvailable,
  authenticateWithBiometric,
  removePIN,
  isLocked,
  getLockoutTime,
} from '../services/pinService';

interface AuthGateProps {
  onSuccess: () => void;
  onForgotPIN: () => void;
}

export default function AuthGate({ onSuccess, onForgotPIN }: AuthGateProps) {
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [maxReached, setMaxReached] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);

  useEffect(() => {
    checkBiometric();
    checkAttempts();
    checkLockoutStatus();
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (!locked || !lockoutRemaining) return;

    const interval = setInterval(async () => {
      const remaining = await getLockoutTime();
      if (remaining && remaining > 0) {
        setLockoutRemaining(remaining);
      } else {
        // Lockout süresi doldu
        setLocked(false);
        setLockoutRemaining(null);
        await checkAttempts(); // Deneme sayısını güncelle
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [locked, lockoutRemaining]);

  const checkBiometric = async () => {
    const available = await isBiometricAvailable();
    setBiometricAvailable(available);
    
    // Biyometrik varsa otomatik dene
    if (available) {
      const success = await authenticateWithBiometric();
      if (success) {
        onSuccess();
      }
    }
  };

  const checkAttempts = async () => {
    const currentAttempts = await getPINAttempts();
    setAttempts(currentAttempts);
    
    const maxed = await isMaxAttemptsReached();
    setMaxReached(maxed);
  };

  const checkLockoutStatus = async () => {
    const isCurrentlyLocked = await isLocked();
    setLocked(isCurrentlyLocked);
    
    if (isCurrentlyLocked) {
      const remaining = await getLockoutTime();
      setLockoutRemaining(remaining);
    }
  };

  const handlePinChange = (value: string) => {
    // Lockout durumunda giriş yapılamaz
    if (locked) {
      setPin('');
      return;
    }
    
    if (value.length <= 4) {
      setPin(value);
      if (value.length === 4) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        verifyPINAsync(value);
      }
    }
  };

  const verifyPINAsync = async (pinValue: string) => {
    const isValid = await verifyPIN(pinValue);
    
    if (isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPin('');
      
      const newAttempts = await getPINAttempts();
      setAttempts(newAttempts);
      
      // Lockout kontrolü
      await checkLockoutStatus();
      
      const maxed = await isMaxAttemptsReached();
      setMaxReached(maxed);
      
      if (maxed && !locked) {
        Alert.alert(
          'Maksimum Deneme Aşıldı',
          'PIN\'inizi unuttunuz mu? PIN\'i kaldırmak tüm verilerinizi silecektir.',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'PIN\'i Unut', style: 'destructive', onPress: onForgotPIN },
          ]
        );
      }
    }
  };

  // Kalan süreyi formatla
  const formatLockoutTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes} dakika ${seconds} saniye`;
    }
    return `${seconds} saniye`;
  };

  const handleBiometricPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const success = await authenticateWithBiometric();
    if (success) {
      onSuccess();
    }
  };

  const remainingAttempts = 6 - attempts;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFB6EC', '#D6A3FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Lock size={48} color="#FFF" weight="fill" />
          </View>

          <Text style={styles.title}>CycleMate</Text>
          <Text style={styles.subtitle}>PIN ile giriş yap</Text>

          <View style={styles.pinDisplay}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.pinDot,
                  pin.length > index && styles.pinDotFilled,
                ]}
              />
            ))}
          </View>

          <TextInput
            style={styles.hiddenInput}
            value={pin}
            onChangeText={handlePinChange}
            keyboardType="number-pad"
            maxLength={4}
            autoFocus
            secureTextEntry
            editable={!maxReached && !locked}
          />

          {/* Lockout Durumu */}
          {locked && lockoutRemaining && (
            <View style={styles.lockoutContainer}>
              <Text style={styles.lockoutTitle}>⏳ Geçici Kilitleme</Text>
              <Text style={styles.lockoutText}>
                Çok fazla yanlış deneme yaptınız.{'\n'}
                Lütfen {formatLockoutTime(lockoutRemaining)} bekleyin.
              </Text>
            </View>
          )}

          {/* Deneme Sayısı */}
          {!locked && attempts > 0 && !maxReached && (
            <Text style={styles.attemptsText}>
              Kalan deneme: {remainingAttempts}
            </Text>
          )}

          {/* Maksimum Deneme */}
          {!locked && maxReached && (
            <Text style={styles.errorText}>
              Maksimum deneme sayısına ulaştınız
            </Text>
          )}

          {/* Biyometrik (Lockout sırasında da kullanılabilir) */}
          {biometricAvailable && (
            <TouchableOpacity
              onPress={handleBiometricPress}
              style={styles.biometricButton}
              activeOpacity={0.7}
            >
              <Fingerprint size={24} color="#FFF" />
              <Text style={styles.biometricText}>Biyometrik ile Aç</Text>
            </TouchableOpacity>
          )}

          {/* Forgot PIN (Lockout sırasında disable) */}
          {!locked && (
            <TouchableOpacity
              onPress={onForgotPIN}
              style={styles.forgotButton}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>PIN'imi Unuttum</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 40,
  },
  pinDisplay: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  pinDotFilled: {
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
  },
  attemptsText: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 16,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  biometricText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  forgotButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  forgotText: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8,
    textDecorationLine: 'underline',
  },
  lockoutContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    alignItems: 'center',
  },
  lockoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  lockoutText: {
    fontSize: 15,
    color: '#FFF',
    opacity: 0.95,
    textAlign: 'center',
    lineHeight: 22,
  },
});

