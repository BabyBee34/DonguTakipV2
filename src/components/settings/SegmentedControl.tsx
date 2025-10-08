import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export default function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  const handleChange = (newValue: string) => {
    if (newValue !== value) {
      Haptics.selectionAsync();
      onChange(newValue);
    }
  };

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleChange(option.value)}
            style={[
              styles.option,
              isSelected && styles.selectedOption,
              isFirst && styles.firstOption,
              isLast && styles.lastOption,
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: '#E94FA1',
    borderRadius: 8,
  },
  firstOption: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  lastOption: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedLabel: {
    color: '#FFF',
  },
});

