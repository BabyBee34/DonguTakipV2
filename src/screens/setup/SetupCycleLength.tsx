import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { setPrefs } from '../../store/slices/prefsSlice';
import { setOnboardingCompleted, setSetupCompleted } from '../../store/slices/appSlice';
import { useTranslation } from 'react-i18next';
import { clampNumber } from '../../utils/validation';

export default function SetupCycleLength({ navigation, route }: any) {
  const { colors, typography, borderRadius, gradients } = useTheme();
  const dispatch = useDispatch();
  const [days, setDays] = useState(28);
  const { lastPeriodStart, avgPeriodDays } = route.params || {};
  const { t } = useTranslation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleComplete = () => {
    // Redux store'a verileri kaydet
    dispatch(
      setPrefs({
        lastPeriodStart,
        avgPeriodDays,
        avgCycleDays: days,
      })
    );
    dispatch(setOnboardingCompleted(true));
    dispatch(setSetupCompleted(true));

    // Ana ekrana yönlendir
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <LinearGradient
      colors={['#f3e7ed', '#fde9f2']}
      style={styles.container}
    >
      {/* Back Button */}
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Geri"
      >
        <Text style={[styles.backButtonText, { color: colors.ink }]}>
          ← Geri
        </Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Rotating Circle Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.rotatingCircle, { borderColor: colors.primary + '30' }]}>
            <Text style={[styles.daysNumber, { color: colors.primary }]}>
              {days}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.ink }]}>
          Döngü süreni seç 🔄
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
          Genellikle döngün kaç gün sürüyor?{'\n'}(Ortalama: 28 gün)
        </Text>

        {/* Slider */}
        <View style={styles.sliderContainer}>
          <Slider
            minimumValue={21}
            maximumValue={35}
            step={1}
            value={days}
            onValueChange={(v: any) => setDays(clampNumber(Math.round(v), 21, 35))}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.primary + '30'}
            thumbTintColor={colors.primary}
            style={styles.slider}
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: colors.inkSoft }]}>
              21 gün
            </Text>
            <Text style={[styles.sliderLabel, { color: colors.inkSoft }]}>
              35 gün
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Progress Dots */}
        <View style={styles.progressDots}>
          <View style={[styles.dot, { backgroundColor: colors.primary + '30' }]} />
          <View style={[styles.dot, { backgroundColor: colors.primary + '30' }]} />
          <View style={[styles.dot, styles.dotActive, { backgroundColor: colors.primary }]} />
        </View>

        {/* Complete Button */}
        <TouchableOpacity
          onPress={handleComplete}
          accessibilityRole="button"
          accessibilityLabel={t('common.done')}
          accessibilityHint={t('common.start')}
          style={styles.buttonWrapper}
        >
          <LinearGradient
            colors={['#F472B6', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.completeButton}
          >
            <Text style={styles.completeButtonText}>Başla 🌸</Text>
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
  backButton: {
    paddingTop: 48,
    paddingLeft: 24,
    paddingBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  rotatingCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  daysNumber: {
    fontSize: 64,
    fontWeight: '700',
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
    alignSelf: 'center',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: '500',
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
  completeButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

