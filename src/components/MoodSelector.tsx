import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Mood } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';

interface MoodSelectorProps {
  selectedMood?: Mood;
  onSelect: (mood: Mood) => void;
}

const MOODS: { mood: Mood; emoji: string; label: string }[] = [
  { mood: 'ecstatic', emoji: '🤩', label: 'Muhteşem' },
  { mood: 'happy', emoji: '😊', label: 'Mutlu' },
  { mood: 'calm', emoji: '😌', label: 'Sakin' },
  { mood: 'neutral', emoji: '😐', label: 'Normal' },
  { mood: 'tired', emoji: '😴', label: 'Yorgun' },
  { mood: 'sad', emoji: '😢', label: 'Üzgün' },
  { mood: 'angry', emoji: '😠', label: 'Öfkeli' },
  { mood: 'anxious', emoji: '😰', label: 'Endişeli' },
  { mood: 'irritable', emoji: '😤', label: 'Sinirli' },
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
        {MOODS.map(({ mood, emoji, label }) => {
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
            >
              <Text style={{ fontSize: 32, marginBottom: spacing.xs }}>
                {emoji}
              </Text>
              <Text 
                style={{ 
                  fontSize: 11, 
                  color: isSelected ? colors.primary : colors.inkSoft,
                  fontWeight: isSelected ? '600' : '400',
                  textAlign: 'center',
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default memo(MoodSelector);

