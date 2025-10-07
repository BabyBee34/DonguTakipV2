import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import Button from './Button';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description: string;
  actionTitle?: string;
  onActionPress?: () => void;
}

export default function EmptyState({ 
  emoji, 
  title, 
  description, 
  actionTitle, 
  onActionPress 
}: EmptyStateProps) {
  const { colors, spacing } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[
      styles.container, 
      { padding: spacing.xl, opacity: fadeAnim }
    ]}>
      {emoji && (
        <Text style={{ fontSize: 64, marginBottom: spacing.lg }}>
          {emoji}
        </Text>
      )}
      
      <Text style={[
        styles.title, 
        { color: colors.ink, marginBottom: spacing.md }
      ]}>
        {title}
      </Text>
      
      <Text style={[
        styles.description, 
        { color: colors.inkSoft, marginBottom: spacing.xl }
      ]}>
        {description}
      </Text>
      
      {actionTitle && onActionPress && (
        <Button
          title={actionTitle}
          onPress={onActionPress}
          variant="primary"
          size="medium"
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
});
