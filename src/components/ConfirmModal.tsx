import React, { useEffect } from 'react';
import { Modal, View, Text, Pressable, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { brand } from '../theme';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Evet',
  cancelText = 'İptal',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Android geri tuşu
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancel();
      return true;
    });
    return () => sub.remove();
  }, [visible, onCancel]);

  return (
    <Modal
      visible={visible}
      onRequestClose={onCancel}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: brand.overlay,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 360,
            borderRadius: 20,
            backgroundColor: '#fff',
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {/* Header gradient */}
          <LinearGradient
            colors={[brand.pinkFrom, brand.pinkTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 14, paddingHorizontal: 16 }}
          >
            <Text style={{ color: brand.pinkText, fontWeight: '700', fontSize: 16 }}>
              {title}
            </Text>
          </LinearGradient>

          {/* Body */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
            <Text style={{ color: brand.gray900, fontSize: 15, lineHeight: 22 }}>
              {message}
            </Text>
          </View>

          {/* Actions */}
          <View
            style={{
              flexDirection: 'row',
              padding: 12,
              gap: 10,
              justifyContent: 'flex-end',
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cancelText}
              onPress={onCancel}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E9E9E9',
                backgroundColor: '#fff',
              }}
            >
              <Text style={{ color: brand.gray600, fontWeight: '600', fontSize: 14 }}>
                {cancelText}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmText}
              onPress={onConfirm}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: brand.pinkTo,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}





