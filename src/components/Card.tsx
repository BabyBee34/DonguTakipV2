import React, { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

export interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: boolean;
  backgroundColor?: string;
  gradient?: string[]; // Gradient colors array
  gradientDirection?: { start: { x: number; y: number }; end: { x: number; y: number } };
}

export default function Card({
  children,
  style,
  padding = 'medium',
  shadow = true,
  backgroundColor,
  gradient,
  gradientDirection = { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
}: CardProps) {
  const { colors, spacing, borderRadius, shadows } = useTheme();

  const getPaddingValue = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return spacing.sm;
      case 'large':
        return spacing.xl;
      default: // medium
        return spacing.lg;
    }
  };

  const cardStyle: ViewStyle = {
    borderRadius: borderRadius.card,
    padding: getPaddingValue(),
    ...(shadow ? shadows.card : {}),
    ...style,
  };

  // Gradient varsa LinearGradient kullan
  if (gradient && gradient.length >= 2) {
    return (
      <LinearGradient
        colors={gradient}
        start={gradientDirection.start}
        end={gradientDirection.end}
        style={cardStyle}
      >
        {children}
      </LinearGradient>
    );
  }

  // Gradient yoksa normal View
  const normalCardStyle: ViewStyle = {
    backgroundColor: backgroundColor || colors.bg,
    ...cardStyle,
  };

  return <View style={normalCardStyle}>{children}</View>;
}