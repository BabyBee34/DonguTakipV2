import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface PINSetupModalProps {
  visible: boolean;
  mode: 'setup' | 'change' | 'remove';
  onConfirm: (pin: string) => void;
  onCancel: () => void;
}

export default function PINSetupModal({
  visible,
  mode,
  onConfirm,
  onCancel,
}: PINSetupModalProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');

  const handlePinChange = (value: string) => {
    if (value.length <= 4) {
      setPin(value);
      setError('');
      if (value.length === 4) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleConfirmPinChange = (value: string) => {
    if (value.length <= 4) {
      setConfirmPin(value);
      setError('');
      if (value.length === 4) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleNext = () => {
    if (pin.length !== 4) {
      setError('PIN 4 haneli olmalıdır');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (step === 'enter') {
      setStep('confirm');
      Haptics.selectionAsync();
    } else {
      if (pin === confirmPin) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onConfirm(pin);
        resetState();
      } else {
        setError('PIN\'ler eşleşmiyor');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setConfirmPin('');
      }
    }
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const resetState = () => {
    setPin('');
    setConfirmPin('');
    setStep('enter');
    setError('');
  };

  const titles = {
    setup: step === 'enter' ? 'PIN Oluştur' : 'PIN\'i Onayla',
    change: step === 'enter' ? 'Yeni PIN' : 'Yeni PIN\'i Onayla',
    remove: 'PIN\'i Kaldır',
  };

  const descriptions = {
    setup: step === 'enter' ? '4 haneli PIN girin' : 'PIN\'i tekrar girin',
    change: step === 'enter' ? '4 haneli yeni PIN girin' : 'Yeni PIN\'i tekrar girin',
    remove: 'Mevcut PIN\'inizi girin',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#FFB6EC', '#D6A3FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Text style={styles.title}>{titles[mode]}</Text>
            <Text style={styles.description}>{descriptions[mode]}</Text>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.pinDisplay}>
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.pinDot,
                    (step === 'enter' ? pin : confirmPin).length > index && styles.pinDotFilled,
                  ]}
                />
              ))}
            </View>

            <TextInput
              style={styles.hiddenInput}
              value={step === 'enter' ? pin : confirmPin}
              onChangeText={step === 'enter' ? handlePinChange : handleConfirmPinChange}
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
              secureTextEntry
            />

            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}

            <View style={styles.buttons}>
              <TouchableOpacity
                onPress={handleCancel}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.cancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNext}
                style={[styles.button, styles.confirmButton]}
                disabled={step === 'enter' ? pin.length !== 4 : confirmPin.length !== 4}
              >
                <Text style={styles.confirmText}>
                  {step === 'enter' ? 'Devam' : 'Tamam'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  content: {
    padding: 24,
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  pinDotFilled: {
    backgroundColor: '#E94FA1',
    borderColor: '#E94FA1',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
  },
  error: {
    fontSize: 13,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#E94FA1',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});

