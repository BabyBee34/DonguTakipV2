import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

interface IconProps {
  name: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  color?: string;
}

export default function Icon({ name, size = 24, color }: IconProps) {
  const { colors } = useTheme();
  return <MaterialIcons name={name} size={size} color={color || colors.ink} />;
}


