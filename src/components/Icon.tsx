import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { ViewStyle } from 'react-native';

interface IconProps {
  name: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export default function Icon({ name, size = 24, color, style }: IconProps) {
  const { colors } = useTheme();
  return <MaterialIcons name={name} size={size} color={color || colors.ink} style={style} />;
}


