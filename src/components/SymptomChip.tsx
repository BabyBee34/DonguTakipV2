import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SymptomChipProps {
  label: string;
  selected: boolean;
  severity?: number; // 1, 2, 3
  onPress: () => void;
  onLongPress?: () => void;
}

export default function SymptomChip({
  label,
  selected,
  severity = 0,
  onPress,
  onLongPress,
}: SymptomChipProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={`Semptom: ${label}${selected ? `, şiddet ${severity}, seçili` : ''}`}
      accessibilityState={{ selected }}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        backgroundColor: selected ? '#FFE1EE' : '#F7F7F8',
        borderColor: selected ? '#FFB6D4' : 'transparent',
        position: 'relative',
      }}
    >
      {/* Şiddet rozeti */}
      {selected && severity > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            flexDirection: 'row',
            gap: 2,
          }}
        >
          {Array.from({ length: severity }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: '#FF5BA6',
              }}
            />
          ))}
        </View>
      )}

      <Text
        style={{
          fontSize: 13,
          fontWeight: selected ? '600' : '500',
          color: selected ? '#1F1F1F' : '#6C6C6C',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
