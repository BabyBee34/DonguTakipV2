import React, { useRef } from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  enableHaptics?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  enableHaptics = true,
}: ButtonProps) {
  const { colors, spacing, borderRadius, gradients } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: 40,
          paddingHorizontal: spacing.md,
          fontSize: 14,
        };
      case 'large':
        return {
          height: 56,
          paddingHorizontal: spacing.xl,
          fontSize: 18,
        };
      default: // medium
        return {
          height: 48,
          paddingHorizontal: spacing.lg,
          fontSize: 16,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const getVariantStyles = () => {
    if (disabled) {
      // Disabled state: neutral background for all variants
      return {
        backgroundColor: colors.bgGray,
        borderWidth: 0,
        borderColor: 'transparent',
        textColor: colors.inkLight,
      };
    }
    
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.primary,
          textColor: colors.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderColor: 'transparent',
          textColor: colors.primary,
        };
      default: // primary
        return {
          backgroundColor: colors.primary,
          borderWidth: 0,
          borderColor: 'transparent',
          textColor: colors.textOnPrimary,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const buttonStyle: ViewStyle = {
    height: sizeStyles.height,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variantStyles.backgroundColor,
    borderWidth: variantStyles.borderWidth,
    borderColor: variantStyles.borderColor,
    minWidth: 48, // WCAG AA touch target minimum
    ...style,
  };

  const textStyleFinal: TextStyle = {
    fontSize: sizeStyles.fontSize,
    fontWeight: '600',
    color: variantStyles.textColor,
    ...textStyle,
  };

  const accessibilityProps = {
    accessible: true,
    accessibilityLabel: accessibilityLabel || title,
    accessibilityHint,
    accessibilityRole: 'button' as const,
    accessibilityState: { disabled },
  };

  const handlePressIn = () => {
    if (!disabled) {
      // Haptic feedback
      if (enableHaptics) {
        const impact = variant === 'primary' 
          ? Haptics.ImpactFeedbackStyle.Medium 
          : Haptics.ImpactFeedbackStyle.Light;
        Haptics.impactAsync(impact);
      }
      
      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }).start();
    }
  };

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  if (variant === 'primary' && !disabled) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={buttonStyle}
          activeOpacity={0.9}
          {...accessibilityProps}
        >
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              borderRadius: borderRadius.button,
            }}
          />
          <Text style={textStyleFinal}>{title}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={buttonStyle}
        activeOpacity={0.9}
        {...accessibilityProps}
      >
        <Text style={textStyleFinal}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}