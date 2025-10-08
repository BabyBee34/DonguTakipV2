import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setPrefs } from '../../store/slices/prefsSlice';
import { isValidISODate, isDateWithinRange } from '../../utils/validation';
import Icon from '../../components/Icon';

export default function SetupLastPeriod({ navigation }: any) {
  const { colors, typography, borderRadius, gradients, spacing } = useTheme();
  const dispatch = useDispatch();
  const prefs = useSelector((state: RootState) => state.prefs);
  const [date, setDate] = useState('');
  const canNext = Boolean(date);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

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
      colors={gradients.setup}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Flower Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.emoji}>🌸</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {t('setup.lastPeriod.title')}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {t('setup.lastPeriod.description')}
        </Text>

        {/* Date Picker Button with Help */}
        <View style={{ width: '85%', alignSelf: 'center' }}>
          <TouchableOpacity
            onPress={openPicker}
            style={styles.datePickerButton}
            accessibilityRole="button"
            accessibilityLabel="Tarih seçici"
            accessibilityHint="Son adet başlangıç tarihini seç"
          >
            <Text style={[styles.dateText, { color: date ? '#333' : '#999' }]}>
              {date ? formatDate(date) : t('setup.lastPeriod.selectDate')}
            </Text>
            <Icon name="event" size={24} color="#FF99CC" />
          </TouchableOpacity>
          
          {/* Help Button */}
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => {
              Alert.alert(
                t('setup.lastPeriod.helpTitle'),
                t('setup.lastPeriod.helpMessage')
              );
            }}
            accessibilityRole="button"
            accessibilityLabel="Yardım"
          >
            <Text style={styles.helpText}>?</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { paddingBottom: Math.max(24, insets.bottom + 24) }]}>
        {/* Helper Text */}
        {!canNext && (
          <View style={{ 
            paddingHorizontal: spacing.lg, 
            paddingVertical: spacing.md, 
            marginBottom: spacing.lg,
            backgroundColor: '#FFE6EC',
            borderRadius: borderRadius.card,
          }}>
            <Text style={{ fontSize: 14, color: '#FF3366', textAlign: 'center' }}>
              ℹ️ {t('setup.lastPeriod.helperText')}
            </Text>
          </View>
        )}
        
        {/* Progress Dots */}
        <View style={styles.progressDots}>
          <View 
            accessible={true}
            accessibilityLabel={`${t('common.step')} 1 / 3`}
            accessibilityRole="progressbar"
            style={[styles.dot, styles.dotActive, { backgroundColor: colors.primary }]} 
          />
          <View 
            accessible={true}
            accessibilityLabel={`${t('common.step')} 2 / 3`}
            style={[styles.dot, { backgroundColor: colors.primary + '30' }]} 
          />
          <View 
            accessible={true}
            accessibilityLabel={`${t('common.step')} 3 / 3`}
            style={[styles.dot, { backgroundColor: colors.primary + '30' }]} 
          />
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={() => {
            // Redux store'a kaydet
            if (date) {
              dispatch(setPrefs({ ...prefs, lastPeriodStart: date }));
            }
            navigation.navigate('SetupPeriodLength', { lastPeriodStart: date });
          }}
          disabled={!canNext}
          accessibilityRole="button"
          accessibilityLabel={t('common.continue')}
          style={{ width: '85%', alignSelf: 'center' }}
        >
          {canNext ? (
            <LinearGradient
              colors={['#FF66B2', '#FF8FC8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButton}
            >
              <Text style={styles.buttonText}>{t('common.continue')}</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.nextButton, { backgroundColor: '#E0E0E0' }]}>
              <Text style={[styles.buttonText, { color: '#999' }]}>{t('common.continue')}</Text>
            </View>
          )}
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
  emoji: {
    fontSize: 120,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 30,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 40,
    lineHeight: 24,
    maxWidth: 320,
    color: '#666',
  },
  datePickerButton: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#FF99CC',
    borderRadius: 14,
    backgroundColor: '#FFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
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
    fontWeight: '500',
    flex: 1,
  },
  helpButton: {
    position: 'absolute',
    right: -32,
    top: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF99CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
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
  nextButton: {
    height: 56,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});


