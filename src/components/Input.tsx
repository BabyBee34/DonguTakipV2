import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  showCharCount?: boolean;
  maxLength?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Input({
  label,
  error,
  helperText,
  containerStyle,
  showCharCount,
  maxLength,
  value,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: InputProps) {
  const { colors, spacing, borderRadius } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const sanitize = (text?: string) => {
    if (!text) return text;
    // Basit XSS önlemi: kontrol dışı karakterleri temizle
    return text.replace(/[\u0000-\u001F\u007F]/g, '');
  };

  const borderColor = error
    ? colors.danger
    : isFocused
    ? colors.primary
    : colors.bgGray;

  // Accessibility
  const a11yLabel = accessibilityLabel || label || props.placeholder || 'Metin girişi';
  const a11yHint = accessibilityHint || helperText || '';
  const a11yState = { disabled: props.editable === false, error: !!error };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: colors.ink, marginBottom: spacing.xs },
          ]}
          accessibilityRole="text"
        >
          {label}
        </Text>
      )}

      <TextInput
        {...props}
        value={sanitize(value as string)}
        maxLength={maxLength}
        style={[
          styles.input,
          {
            borderColor,
            borderWidth: 2,
            borderRadius: borderRadius.card,
            padding: spacing.md,
            fontSize: 16,
            color: colors.ink,
            backgroundColor: colors.bg,
          },
          props.style,
        ]}
        placeholderTextColor={colors.inkLight}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        // Accessibility
        accessible={true}
        accessibilityLabel={a11yLabel}
        accessibilityHint={a11yHint}
        accessibilityState={a11yState}
        accessibilityRole="none"
      />

      {(error || helperText || (showCharCount && maxLength)) && (
        <View
          style={[
            styles.footer,
            { marginTop: spacing.xs, flexDirection: 'row', justifyContent: 'space-between' },
          ]}
        >
          <Text
            style={[
              styles.helperText,
              { color: error ? colors.danger : colors.inkSoft },
            ]}
          >
            {error || helperText || ''}
          </Text>

          {showCharCount && maxLength && (
            <Text style={[styles.charCount, { color: colors.inkLight }]}>
              {value?.length || 0}/{maxLength}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    minHeight: 48,
  },
  footer: {
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    flex: 1,
  },
  charCount: {
    fontSize: 12,
  },
});

