import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { clampNumber } from '../../utils/validation';

export default function SetupPeriodLength({ navigation, route }: any) {
  const { colors, typography, borderRadius, gradients } = useTheme();
  const [days, setDays] = useState(5);
  const { lastPeriodStart } = route.params || {};
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={gradients.setup}
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
        {/* Animated Flower with Glow */}
        <View style={styles.iconContainer}>
          <View style={[styles.glowCircle, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.emoji}>🌸</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.ink }]}>
          Adet süreni seç ⏳
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
          Genellikle adet günlerin kaç gün sürüyor? (Ortalama: 5 gün)
        </Text>

        {/* Days Display Circle */}
        <View style={[styles.daysDisplay, { borderColor: colors.primary }]}>
          <Text style={[styles.daysNumber, { color: colors.primary }]}>
            {days}
          </Text>
          <Text style={[styles.daysLabel, { color: colors.inkSoft }]}>GÜN</Text>
        </View>

        {/* Slider with labels */}
        <View style={styles.sliderContainer}>
          <Slider
            minimumValue={3}
            maximumValue={10}
            step={1}
            value={days}
            onValueChange={(v: any) => setDays(clampNumber(Math.round(v), 3, 10))}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.primary + '30'}
            thumbTintColor={colors.primary}
            style={styles.slider}
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: colors.inkSoft }]}>3 gün</Text>
            <Text style={[styles.sliderLabel, { color: colors.inkSoft }]}>10 gün</Text>
          </View>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { paddingBottom: Math.max(24, insets.bottom + 24) }]}>
        {/* Progress Dots */}
        <View style={styles.progressDots}>
          <View 
            accessible={true}
            accessibilityLabel={`${t('common.step')} 1 / 3`}
            style={[styles.dot, { backgroundColor: colors.primary + '30' }]} 
          />
          <View 
            accessible={true}
            accessibilityLabel={`${t('common.step')} 2 / 3`}
            accessibilityRole="progressbar"
            style={[styles.dot, styles.dotActive, { backgroundColor: colors.primary }]} 
          />
          <View 
            accessible={true}
            accessibilityLabel={`${t('common.step')} 3 / 3`}
            style={[styles.dot, { backgroundColor: colors.primary + '30' }]} 
          />
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('SetupCycleLength', {
              lastPeriodStart,
              avgPeriodDays: days,
            })
          }
          accessibilityRole="button"
          accessibilityLabel={t('common.continue')}
          style={styles.buttonWrapper}
        >
          <LinearGradient
            colors={gradients.setupButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButton}
          >
            <Text style={styles.buttonText}>{t('common.continue')}</Text>
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
  glowCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 72,
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
  daysDisplay: {
    alignItems: 'center',
    marginBottom: 32,
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  daysNumber: {
    fontSize: 56,
    fontWeight: '700',
  },
  daysLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
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

