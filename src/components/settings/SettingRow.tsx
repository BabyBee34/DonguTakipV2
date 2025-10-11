import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SettingRowProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  disabled?: boolean;
  disabledText?: string;
  isLast?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function SettingRow({
  icon,
  title,
  description,
  value,
  onPress,
  rightElement,
  switchValue,
  onSwitchChange,
  disabled = false,
  disabledText,
  isLast = false,
  accessibilityLabel,
  accessibilityHint,
}: SettingRowProps) {
  const handlePress = () => {
    if (!disabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const handleSwitchChange = (value: boolean) => {
    Haptics.selectionAsync();
    onSwitchChange?.(value);
  };

  const content = (
    <View
      style={[
        styles.container,
        !isLast && styles.borderBottom,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.leftContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
          {disabled && disabledText && (
            <Text style={styles.disabledText}>{disabledText}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.rightContent}>
        {value && <Text style={styles.value}>{value}</Text>}
        {rightElement}
        {switchValue !== undefined && onSwitchChange && (
          <Switch
            value={switchValue}
            onValueChange={handleSwitchChange}
            trackColor={{ false: '#E5E7EB', true: '#FFB6EC' }}
            thumbColor={switchValue ? '#E94FA1' : '#FFF'}
            disabled={disabled}
          />
        )}
        {onPress && !rightElement && !onSwitchChange && (
          <Text style={styles.chevron}>›</Text>
        )}
      </View>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole={switchValue !== undefined ? 'switch' : 'text'}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 56,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  disabled: {
    opacity: 0.4,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  disabledText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    fontStyle: 'italic',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  value: {
    fontSize: 15,
    color: '#6B7280',
    marginRight: 8,
  },
  chevron: {
    fontSize: 20,
    color: '#9CA3AF',
  },
});




