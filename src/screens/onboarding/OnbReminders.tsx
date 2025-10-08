import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

export default function OnbReminders() {
  const { colors, typography, gradients } = useTheme();
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scale1 = useRef(new Animated.Value(0)).current;
  const scale2 = useRef(new Animated.Value(0)).current;
  const scale3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Heart pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scale animations for emojis with staggered delays (200ms apart)
    const scaleAnimation = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    scaleAnimation(scale1, 0);
    scaleAnimation(scale2, 200);
    scaleAnimation(scale3, 400);
  }, []);

  const scaleTransform = (anim: Animated.Value) => ({
    opacity: anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 1, 0.5],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.9, 1.1, 0.9],
        }),
      },
    ],
  });

  return (
    <LinearGradient
      colors={gradients.onboardingReminders}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Heart SVG with pulse */}
        <View style={styles.heartContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }], opacity: 0.95 }}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
              <Defs>
                <SvgLinearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FFB6C1" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#C8A2C8" stopOpacity="1" />
                </SvgLinearGradient>
              </Defs>
              <Path
                d="M174.5,31.5 C155.5,12.5 128.5,12.5 109.5,31.5 L100,41 L90.5,31.5 C71.5,12.5 44.5,12.5 25.5,31.5 C6.5,50.5 6.5,77.5 25.5,96.5 L100,171 L174.5,96.5 C193.5,77.5 193.5,50.5 174.5,31.5 Z"
                fill="url(#heartGradient)"
              />
            </Svg>
          </Animated.View>

          {/* Floating emojis with scale animation */}
          <Animated.Text style={[styles.floatingEmoji, styles.emoji1, scaleTransform(scale1)]}>
            🍫
          </Animated.Text>
          <Animated.Text style={[styles.floatingEmoji, styles.emoji2, scaleTransform(scale2)]}>
            💧
          </Animated.Text>
          <Animated.Text style={[styles.floatingEmoji, styles.emoji3, scaleTransform(scale3)]}>
            🌙
          </Animated.Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {t('onboarding.reminders.title')}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {t('onboarding.reminders.description')}
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 32,
  },
  heartContainer: {
    position: 'relative',
    marginBottom: 40,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 36,
  },
  emoji1: {
    top: '15%',
    left: '10%',
  },
  emoji2: {
    top: '50%',
    right: '5%',
  },
  emoji3: {
    bottom: '10%',
    left: '20%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 30,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    color: '#666',
    marginTop: 8,
  },
});
