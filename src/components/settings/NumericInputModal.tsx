import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface NumericInputModalProps {
  visible: boolean;
  title: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onConfirm: (value: number) => void;
  onCancel: () => void;
}

export default function NumericInputModal({
  visible,
  title,
  value,
  min,
  max,
  unit,
  onConfirm,
  onCancel,
}: NumericInputModalProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleConfirm = () => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onConfirm(numValue);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setInputValue(value.toString());
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.range}>
            {min} - {max} {unit}
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="number-pad"
              selectTextOnFocus
              maxLength={2}
              autoFocus
            />
            <Text style={styles.unit}>{unit}</Text>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.button, styles.confirmButton]}
            >
              <Text style={styles.confirmText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  range: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  input: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E94FA1',
    borderBottomWidth: 2,
    borderBottomColor: '#E94FA1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    textAlign: 'center',
  },
  unit: {
    fontSize: 18,
    color: '#6B7280',
    marginLeft: 8,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
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
