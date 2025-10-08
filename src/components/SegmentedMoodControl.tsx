import React, { useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../theme';

const MoodButton = ({ mood, isSelected, onPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  return (
    <Animated.View style={{ flex: 1, minWidth: 74, transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`Ruh hali: ${mood.label}`}
        accessibilityState={{ selected: isSelected }}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 14,
          borderWidth: 1,
          backgroundColor: isSelected ? '#FFE1EE' : '#F7F7F8',
          borderColor: isSelected ? '#FFB6D4' : 'transparent',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 20, marginBottom: 2 }}>{mood.emoji}</Text>
        <Text
          style={{
            fontSize: 13,
            fontWeight: isSelected ? '700' : '600',
            color: isSelected ? '#1F1F1F' : '#6C6C6C',
          }}
        >
          {mood.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const MOODS = [
  { key: 'harika', label: 'Harika', emoji: '😄' },
  { key: 'iyi', label: 'İyi', emoji: '🙂' },
  { key: 'sakin', label: 'Sakin', emoji: '😌' },
  { key: 'normal', label: 'Normal', emoji: '😐' },
  { key: 'yorgun', label: 'Yorgun', emoji: '😴' },
  { key: 'agrili', label: 'Ağrılı', emoji: '😣' },
];

export type MoodKey = typeof MOODS[number]['key'];

interface SegmentedMoodControlProps {
  selected?: MoodKey;
  onSelect: (mood: MoodKey) => void;
}

export default function SegmentedMoodControl({ selected, onSelect }: SegmentedMoodControlProps) {
  const c = useThemeColors();

  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 12 }}>
        Ruh Halim
      </Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {MOODS.map((mood) => {
          const isSelected = selected === mood.key;
          return (
            <MoodButton
              key={mood.key}
              mood={mood}
              isSelected={isSelected}
              onPress={() => onSelect(mood.key as MoodKey)}
            />
          );
        })}
      </View>

      {selected && (
        <Text style={{ fontSize: 12, color: '#6C6C6C', marginTop: 8, fontStyle: 'italic' }}>
          Bugün: {MOODS.find((m) => m.key === selected)?.label}
        </Text>
      )}

      <Text style={{ fontSize: 13, color: '#6C6C6C', marginTop: 6 }}>
        Seçimin, kişisel önerileri şekillendirmemize yardımcı olur.
      </Text>
    </View>
  );
}
