import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

interface FABProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'center';
  size?: number;
  color?: string;
}

export default function FAB({
  icon,
  onPress,
  position = 'bottom-right',
  size = 56,
}: FABProps) {
  const { colors, gradients } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const positionStyle: ViewStyle = {
    position: 'absolute',
    ...(position === 'bottom-right' && { bottom: 16, right: 16 }),
    ...(position === 'bottom-left' && { bottom: 16, left: 16 }),
    ...(position === 'center' && {
      bottom: 16,
      left: '50%',
      marginLeft: -size / 2,
    }),
  };

  return (
    <Animated.View
      style={[
        positionStyle,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Floating action button"
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.fab,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <MaterialIcons name={icon} size={24} color={colors.textOnPrimary} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
