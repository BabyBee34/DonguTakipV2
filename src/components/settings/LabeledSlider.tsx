import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

interface LabeledSliderProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onValueChange: (value: number) => void;
  accessibilityLabel?: string;
}

export default function LabeledSlider({
  label,
  description,
  value,
  min,
  max,
  step = 1,
  unit,
  onValueChange,
  accessibilityLabel,
}: LabeledSliderProps) {
  const handleValueChange = (newValue: number) => {
    if (newValue !== value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onValueChange(newValue);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueBadge}>
          <Text style={styles.valueText}>
            {value} {unit}
          </Text>
        </View>
      </View>
      
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={handleValueChange}
          minimumTrackTintColor="#E94FA1"
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor="#E94FA1"
          accessibilityLabel={accessibilityLabel || `${label} ${value} ${unit}`}
        />
        <View style={styles.labels}>
          <Text style={styles.labelText}>{min}</Text>
          <Text style={styles.labelText}>{max}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  valueBadge: {
    backgroundColor: '#FFE8F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E94FA1',
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  sliderContainer: {
    marginTop: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  labelText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
