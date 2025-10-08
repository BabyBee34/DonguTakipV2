import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Drop, Footprints, Armchair, Shower } from 'phosphor-react-native';

const HABITS = [
  { key: 'water', label: 'Su içtim', Icon: Drop },
  { key: 'walk', label: 'Kısa yürüyüş', Icon: Footprints },
  { key: 'rest', label: 'Dinlenme molası', Icon: Armchair },
  { key: 'shower', label: 'Ilık duş', Icon: Shower },
];

export type HabitKey = typeof HABITS[number]['key'];

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
            <Pressable
              key={habit.key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onToggle(habit.key as HabitKey);
              }}
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
          );
        })}
      </View>
    </View>
  );
}
