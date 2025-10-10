import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  percentage: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  borderRadius?: number;
}

export default function ProgressBar({
  percentage,
  color = '#E94FA1',
  backgroundColor = 'rgba(0, 0, 0, 0.1)',
  height = 6,
  borderRadius = 4,
}: ProgressBarProps) {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          height,
          borderRadius,
        },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedPercentage}%`,
            backgroundColor: color,
            borderRadius,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});



