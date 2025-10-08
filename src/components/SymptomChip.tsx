import React, { useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
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
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          onPress();
        }}
        onLongPress={() => {
          if (onLongPress) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onLongPress();
          }
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
      {/* Şiddet rozeti - sağ üst sabit konum */}
      {selected && severity > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            flexDirection: 'row',
            gap: 2,
          }}
        >
          {Array.from({ length: severity }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: 2.5,
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
    </Animated.View>
  );
}
