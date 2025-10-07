import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Chip({
  children,
  selected = false,
  onPress,
  style,
  textStyle,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}: ChipProps) {
  const { colors, spacing, borderRadius } = useTheme();

  const chipStyle: ViewStyle = {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.chip,
    backgroundColor: selected ? colors.primary : colors.bgGray,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36, // WCAG AA touch target minimum
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  const textStyleFinal: TextStyle = {
    fontSize: 14,
    fontWeight: '500',
    color: selected ? colors.textOnPrimary : colors.inkSoft,
    ...textStyle,
  };

  const accessibilityProps = {
    accessible: true,
    accessibilityLabel: accessibilityLabel || (typeof children === 'string' ? children : 'Chip'),
    accessibilityHint,
    accessibilityRole: onPress ? 'button' as const : 'text' as const,
    accessibilityState: { selected, disabled },
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={chipStyle}
        {...accessibilityProps}
      >
        <Text style={textStyleFinal}>{children}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={chipStyle} {...accessibilityProps}>
      <Text style={textStyleFinal}>{children}</Text>
    </View>
  );
}