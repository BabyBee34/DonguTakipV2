﻿import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Slider from '@react-native-community/slider';
import { useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Slide from right to left animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      colors={gradients.setup3}
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

      <Animated.View style={[styles.content, { transform: [{ translateX: slideAnim }] }]}>
        {/* Title */}
        <Text style={styles.title}>
          {t('setup.cycleLength.title')}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {t('setup.cycleLength.description')}
        </Text>

        {/* Days Display Balloon with Animation */}
        <Animated.View style={[styles.daysDisplay, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.daysNumber}>
            {days}
          </Text>
          <Text style={styles.daysLabel}>gün</Text>
        </Animated.View>

        {/* Slider */}
        <View style={styles.sliderContainer}>
          <Slider
            minimumValue={21}
            maximumValue={35}
            step={1}
            value={days}
            onValueChange={(v: any) => setDays(clampNumber(Math.round(v), 21, 35))}
            minimumTrackTintColor="#C8A8FF"
            maximumTrackTintColor="#F4D9FF"
            thumbTintColor="#A44DFF"
            style={styles.slider}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>
              21 gün
            </Text>
            <Text style={styles.sliderLabel}>
              35 gün
            </Text>
          </View>
        </View>
      </Animated.View>

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
            style={[styles.dot, { backgroundColor: colors.primary + '30' }]} 
          />
          <View 
            accessible={true}
            accessibilityLabel={`${t('common.step')} 3 / 3`}
            accessibilityRole="progressbar"
            style={[styles.dot, styles.dotActive, { backgroundColor: colors.primary }]} 
          />
        </View>

        {/* Complete Button */}
        <TouchableOpacity
          onPress={handleComplete}
          accessibilityRole="button"
          accessibilityLabel={t('common.done')}
          accessibilityHint={t('common.start')}
          style={{ width: '85%', alignSelf: 'center' }}
        >
          <LinearGradient
            colors={gradients.setupButton3}
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
    backgroundColor: '#F4D9FF',
  },
  daysNumber: {
    fontSize: 38,
    fontWeight: '700',
    color: '#A44DFF',
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
  completeButton: {
    height: 56,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

