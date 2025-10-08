import React from 'react';
import { Text, TouchableOpacity, ViewStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, shadow, brand, z } from '../theme';

interface GradientButtonProps {
  title: string;
  onPress?: () => void;
  left?: React.ReactNode;
  colorsPair?: string[];
  textColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

export default function GradientButton({
  title,
  onPress,
  left,
  colorsPair = [brand.pinkFrom, brand.pinkTo],
  textColor = brand.pinkText,
  style,
  disabled = false,
}: GradientButtonProps) {
  return (
    <TouchableOpacity 
      activeOpacity={0.92} 
      onPress={onPress} 
      disabled={disabled} 
      style={[{ borderRadius: z.btn }, style]}
      accessibilityRole="button"
      accessibilityLabel={`Buton: ${title}`}
    >
      <LinearGradient
        colors={colorsPair}
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }}
        style={{ 
          borderRadius: z.btn, 
          paddingVertical: spacing(1.6), 
          paddingHorizontal: spacing(2),
          alignItems: 'center', 
          ...shadow, 
          opacity: disabled ? 0.6 : 1 
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {left}
          <Text style={{ 
            color: textColor, 
            fontWeight: '700', 
            fontSize: 15 
          }}>
            {title}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

