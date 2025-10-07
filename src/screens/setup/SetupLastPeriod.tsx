import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { isValidISODate, isDateWithinRange } from '../../utils/validation';

export default function SetupLastPeriod({ navigation }: any) {
  const { colors, typography, borderRadius } = useTheme();
  const [date, setDate] = useState('');
  const canNext = Boolean(date);
  const { t } = useTranslation();

  const openPicker = () => {
    const initial = date ? new Date(date) : new Date();
    const maxDate = new Date(); // Bugünden ileri tarih seçilemez
    
    DateTimePickerAndroid.open({
      value: initial,
      mode: 'date',
      is24Hour: true,
      maximumDate: maxDate,
      onChange: (_event, selected) => {
        if (selected) {
          const iso = new Date(selected).toISOString().slice(0, 10);
          const todayISO = new Date().toISOString().slice(0, 10);
          // min 2 yıl geriye izin verelim
          const minISO = new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString().slice(0, 10);
          if (isValidISODate(iso) && isDateWithinRange(iso, minISO, todayISO)) {
            setDate(iso);
          }
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <LinearGradient
      colors={['#fde8f2', '#e6e6fa']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Animated Calendar Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.emoji}>🌸</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.ink }]}>
          Son adet başlangıcını seç 🌸
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
          Döngünü hesaplayabilmem için son adetinin başladığı günü seç.
        </Text>

        {/* Date Picker Button */}
        <TouchableOpacity
          onPress={openPicker}
          style={[
            styles.datePickerButton,
            {
              borderColor: date ? colors.primary : colors.primary + '30',
              backgroundColor: colors.bg + 'CC',
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Tarih seçici"
          accessibilityHint="Son adet başlangıç tarihini seç"
        >
          <Text style={[styles.dateText, { color: date ? colors.ink : colors.inkSoft }]}>
            {date ? formatDate(date) : 'Tarih seç'}
          </Text>
          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Progress Dots */}
        <View style={styles.progressDots}>
          <View style={[styles.dot, styles.dotActive, { backgroundColor: colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: colors.primary + '30' }]} />
          <View style={[styles.dot, { backgroundColor: colors.primary + '30' }]} />
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('SetupPeriodLength', { lastPeriodStart: date })}
          disabled={!canNext}
          accessibilityRole="button"
          accessibilityLabel={t('common.continue')}
          style={styles.buttonWrapper}
        >
          <LinearGradient
            colors={['#F472B6', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.nextButton,
              { opacity: canNext ? 1 : 0.5 },
            ]}
          >
            <Text style={styles.buttonText}>Devam Et 🌸</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
    maxWidth: 320,
  },
  datePickerButton: {
    width: '100%',
    maxWidth: 340,
    height: 56,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  calendarIcon: {
    fontSize: 24,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  buttonWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  nextButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});


