import React, { useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Drop, Footprints, Armchair, Shower } from 'phosphor-react-native';
import { HabitKey } from '../types';

const HabitButton = ({ habit, isSelected, onPress }: any) => {
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
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={habit.label}
        accessibilityState={{ selected: isSelected }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          borderWidth: 1,
          backgroundColor: isSelected ? '#FFE1EE' : '#F7F7F8',
          borderColor: isSelected ? '#FFB6D4' : 'transparent',
        }}
      >
        <habit.Icon
          size={18}
          weight={isSelected ? 'fill' : 'regular'}
          color={isSelected ? '#FF5BA6' : '#6C6C6C'}
        />
        <Text
          style={{
            fontSize: 12,
            fontWeight: isSelected ? '600' : '500',
            color: isSelected ? '#1F1F1F' : '#6C6C6C',
          }}
        >
          {habit.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const HABITS = [
  { key: 'water' as HabitKey, label: 'Su içtim', Icon: Drop },
  { key: 'walk' as HabitKey, label: 'Kısa yürüyüş', Icon: Footprints },
  { key: 'rest' as HabitKey, label: 'Dinlenme molası', Icon: Armchair },
  { key: 'shower' as HabitKey, label: 'Ilık duş', Icon: Shower },
];

interface QuickHabitsProps {
  selected: HabitKey[];
  onToggle: (habit: HabitKey) => void;
}

export default function QuickHabits({ selected, onToggle }: QuickHabitsProps) {
  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F1F1F', marginBottom: 12 }}>
        Hızlı Alışkanlıklar
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {HABITS.map((habit) => {
          const isSelected = selected.includes(habit.key as HabitKey);
          return (
            <HabitButton
              key={habit.key}
              habit={habit}
              isSelected={isSelected}
              onPress={() => onToggle(habit.key as HabitKey)}
            />
          );
        })}
      </View>
    </View>
  );
}
