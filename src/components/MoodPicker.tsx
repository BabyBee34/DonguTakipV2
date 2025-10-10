import React, { useRef, useEffect } from 'react';
import { Modal, Pressable, View, Text, Animated } from 'react-native';

const MOODS = [
  { key: 'harika', label: 'Harika', emoji: '😄', line: 'Harika görünüyorsun! 💖' },
  { key: 'iyi', label: 'İyi', emoji: '🙂', line: 'Tatlı bir gün olsun!' },
  { key: 'idare', label: 'İdare eder', emoji: '😌', line: 'Kendine nazik ol.' },
  { key: 'yorgun', label: 'Yorgun', emoji: '😴', line: 'Kısa molalar işe yarar.' },
  { key: 'agrili', label: 'Ağrılı', emoji: '🤕', line: 'Nazikçe ilerleyelim.' },
];

export type Mood = typeof MOODS[number]['key'];

interface MoodPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (mood: Mood) => void;
}

export default function MoodPicker({ visible, onClose, onSelect }: MoodPickerProps) {
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(a, {
      toValue: visible ? 1 : 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.15)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            width: '86%',
            maxWidth: 400,
            backgroundColor: '#fff',
            borderRadius: 18,
            padding: 16,
            transform: [
              {
                scale: a.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.96, 1],
                }),
              },
            ],
            opacity: a,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text style={{ fontWeight: '700', marginBottom: 10, fontSize: 16 }}>Bugün nasılsın?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {MOODS.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => {
                  onSelect(m.key as Mood);
                  onClose();
                }}
                style={{
                  width: '48%',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#F1E2F7',
                  paddingVertical: 12,
                  alignItems: 'center',
                  marginBottom: 8,
                  backgroundColor: '#FDFCFE',
                }}
              >
                <Text style={{ fontSize: 24 }}>{m.emoji}</Text>
                <Text style={{ marginTop: 4, fontWeight: '600', fontSize: 13 }}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ color: '#777', fontSize: 12, marginTop: 6, lineHeight: 18 }}>
            Seçimin ileride AI önerilerini kişiselleştirmek için kullanılacak.
          </Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

export function moodLine(key: Mood): string {
  const f = MOODS.find((m) => m.key === key);
  return f ? f.line : '';
}





