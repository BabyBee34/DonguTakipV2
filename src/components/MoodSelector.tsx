import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Mood } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

interface MoodSelectorProps {
  selectedMood?: Mood;
  onSelect: (mood: Mood) => void;
}

const MOODS: { mood: Mood; icon: string; label: string }[] = [
  { mood: 'ecstatic', icon: 'star', label: 'Muhteşem' },
  { mood: 'happy', icon: 'happy-outline', label: 'Mutlu' },
  { mood: 'calm', icon: 'flower-outline', label: 'Sakin' },
  { mood: 'neutral', icon: 'remove-circle-outline', label: 'Normal' },
  { mood: 'tired', icon: 'moon-outline', label: 'Yorgun' },
  { mood: 'sad', icon: 'sad-outline', label: 'Üzgün' },
  { mood: 'angry', icon: 'flame', label: 'Öfkeli' },
  { mood: 'anxious', icon: 'alert-circle-outline', label: 'Endişeli' },
  { mood: 'irritable', icon: 'warning-outline', label: 'Sinirli' },
];

function MoodSelector({ selectedMood, onSelect }: MoodSelectorProps) {
  const { colors, spacing, borderRadius } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink, marginBottom: spacing.md }}>
        {t('dailyLog.mood.title')}
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: spacing.xs }}
      >
        {MOODS.map(({ mood, icon, label }) => {
          const isSelected = selectedMood === mood;
          
          return (
            <TouchableOpacity
              key={mood}
              onPress={() => onSelect(mood)}
              style={{
                alignItems: 'center',
                marginRight: spacing.md,
                padding: spacing.md,
                borderRadius: borderRadius.card,
                backgroundColor: isSelected ? colors.primary200 : colors.bgSoft,
                borderWidth: isSelected ? 2 : 0,
                borderColor: isSelected ? colors.primary : 'transparent',
                minWidth: 72,
                transform: [{ scale: isSelected ? 1.05 : 1 }],
              }}
              accessibilityRole="button"
              accessibilityLabel={t(`moods.${mood}`)}
              accessibilityState={{ selected: isSelected }}
            >
              <Icon 
                name={icon} 
                size={36} 
                color={isSelected ? colors.primary : colors.inkSoft}
                style={{ marginBottom: spacing.xs }}
              />
              <Text 
                style={{ 
                  fontSize: 11, 
                  color: isSelected ? colors.primary : colors.inkSoft,
                  fontWeight: isSelected ? '600' : '400',
                  textAlign: 'center',
                }}
              >
                {t(`moods.${mood}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default memo(MoodSelector);

