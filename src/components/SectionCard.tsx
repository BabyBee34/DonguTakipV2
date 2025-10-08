import React from 'react';
import { View, ViewProps, ViewStyle, Platform } from 'react-native';
import { themeColors, spacing } from '../theme';

interface SectionCardProps extends ViewProps {
  style?: ViewStyle;
  variant?: 'default' | 'compact';
}

export default function SectionCard({ variant = 'default', ...props }: SectionCardProps) {
  const isCompact = variant === 'compact';

  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: themeColors.white,
          borderRadius: 20,
          padding: spacing(2),
          marginBottom: spacing(2),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0,
          shadowRadius: 12,
          elevation: Platform.OS === 'android' ? 8 : 0,
          borderWidth: 1,
          borderColor: 'rgba(255, 182, 212, 0.35)',
        },
        props.style,
      ]}
    />
  );
}

