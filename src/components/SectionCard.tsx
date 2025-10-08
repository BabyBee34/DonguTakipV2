import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
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
          borderRadius: isCompact ? 16 : 20,
          padding: spacing(2),
          marginBottom: spacing(2),
          shadowColor: '#FFB6C1',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isCompact ? 0.08 : 0.15,
          shadowRadius: isCompact ? 8 : 12,
          elevation: isCompact ? 2 : 4,
        },
        props.style,
      ]}
    />
  );
}

