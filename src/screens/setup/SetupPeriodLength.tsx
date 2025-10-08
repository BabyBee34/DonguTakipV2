import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Balloon scale-in animation
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={gradients.setup2}
      style={styles.container}
    >
      {/* Back Button */}
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Geri"
      >
        <Text style={styles.backButtonText}>
          ← Geri
        </Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>
          {t('setup.periodLength.title')}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {t('setup.periodLength.description')}
        </Text>

        {/* Days Display Balloon with Animation */}
        <Animated.View style={[styles.daysDisplay, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.daysNumber}>
            {days}
          </Text>
          <Text style={styles.daysLabel}>gün</Text>
        </Animated.View>

        {/* Slider with labels */}
        <View style={styles.sliderContainer}>
          <Slider
            minimumValue={3}
            maximumValue={10}
            step={1}
            value={days}
            onValueChange={(v: any) => setDays(clampNumber(Math.round(v), 3, 10))}
            minimumTrackTintColor="#FF99CC"
            maximumTrackTintColor="#FFD6EB"
            thumbTintColor="#FF66B2"
            style={styles.slider}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>3 gün</Text>
            <Text style={styles.sliderLabel}>10 gün</Text>
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
          style={{ width: '85%', alignSelf: 'center' }}
        >
          <LinearGradient
            colors={['#FF66B2', '#FF8FC8']}
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
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
    color: '#333',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 22,
    maxWidth: 320,
    alignSelf: 'center',
    color: '#777',
  },
  daysDisplay: {
    alignItems: 'center',
    marginBottom: 32,
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    backgroundColor: '#FFD6EB',
  },
  daysNumber: {
    fontSize: 38,
    fontWeight: '700',
    color: '#FF1493',
  },
  daysLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    color: '#777',
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
    color: '#777',
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

