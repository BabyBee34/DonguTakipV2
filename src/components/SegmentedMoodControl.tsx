import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../theme';

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
            <Pressable
              key={mood.key}
              onPress={() => {
                Haptics.selectionAsync();
                onSelect(mood.key as MoodKey);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Ruh hali: ${mood.label}`}
              accessibilityState={{ selected: isSelected }}
              style={{
                flex: 1,
                minWidth: 74,
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
