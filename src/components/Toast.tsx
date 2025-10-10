import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import Icon from './Icon';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onHide?: () => void;
  style?: ViewStyle;
}

export default function Toast({
  message,
  type = 'info',
  duration = 3000,
  onHide,
  style,
}: ToastProps) {
  const { colors, spacing, borderRadius, shadows } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const slideValue = useRef(new Animated.Value(-100)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(slideValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();

    // Auto hide
    const timer = setTimeout(() => {
      hideToast();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(slideValue, {
        toValue: -100,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success,
          borderColor: colors.success,
        };
      case 'error':
        return {
          backgroundColor: colors.danger,
          borderColor: colors.danger,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          borderColor: colors.warning,
        };
      default: // info
        return {
          backgroundColor: colors.info,
          borderColor: colors.info,
        };
    }
  };

  const typeStyles = getTypeStyles();

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default: // info
        return 'info';
    }
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: Math.max(50, insets.top + 10),
        left: spacing.lg,
        right: spacing.lg,
        backgroundColor: typeStyles.backgroundColor,
        borderRadius: borderRadius.card,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        opacity: animatedValue,
        transform: [{ translateY: slideValue }],
        ...shadows.card,
        ...style,
      }}
    >
      <Icon name={getIconName()} size={24} color="#fff" style={{ marginRight: spacing.sm }} />
      <Text style={{
        flex: 1,
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
      }}>
        {message}
      </Text>
    </Animated.View>
  );
}
