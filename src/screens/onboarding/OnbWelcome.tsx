import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Path, Defs, RadialGradient, Stop, G } from 'react-native-svg';

export default function OnbWelcome() {
  const { colors, typography, gradients } = useTheme();
  const { t } = useTranslation();
  const [reduceMotion, setReduceMotion] = useState(false);
  
  // Animasyonlar
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;
  const sparkle4 = useRef(new Animated.Value(0)).current;
  const sparkle5 = useRef(new Animated.Value(0)).current;
  const sparkle6 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check reduced motion preference
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      setReduceMotion(enabled);
    });
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      // Skip animations
      fadeAnim.setValue(1);
      return;
    }
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Breath animation for flower
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1.03,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sparkle animations with different delays
    const sparkleAnimation = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1750,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1750,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    sparkleAnimation(sparkle1, 0);
    sparkleAnimation(sparkle2, 1200);
    sparkleAnimation(sparkle3, 2200);
    sparkleAnimation(sparkle4, 700);
    sparkleAnimation(sparkle5, 1800);
    sparkleAnimation(sparkle6, 3000);
  }, []);

  const sparkleTransform = (anim: Animated.Value) => ({
    opacity: anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 0],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.5, 1.2, 0.5],
        }),
      },
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -25],
        }),
      },
      {
        rotate: anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  });

  return (
    <LinearGradient
      colors={gradients.onboardingWelcome}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Sparkles */}
        <Animated.View style={[styles.sparkle, styles.sparkle1, sparkleTransform(sparkle1)]}>
          <View style={[styles.sparkleCircle, { backgroundColor: '#A7F3D0' }]} />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle2, sparkleTransform(sparkle2)]}>
          <View style={[styles.sparkleCircle, { backgroundColor: '#FBBF24' }]} />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle3, sparkleTransform(sparkle3)]}>
          <View style={[styles.sparkleCircle, { backgroundColor: '#BFDBFE' }]} />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle4, sparkleTransform(sparkle4)]}>
          <View style={[styles.sparkleCircle, { backgroundColor: '#FBCFE8' }]} />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle5, sparkleTransform(sparkle5)]}>
          <View style={[styles.sparkleCircle, { backgroundColor: '#FDD2BF' }]} />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle6, sparkleTransform(sparkle6)]}>
          <View style={[styles.sparkleCircle, { backgroundColor: '#E9D5FF' }]} />
        </Animated.View>

        {/* Flower SVG with breath animation */}
        <Animated.View style={[styles.flowerContainer, { transform: [{ scale: breathAnim }] }]}>
          <Svg width={280} height={280} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="petalGradient" cx="50%" cy="50%" fx="50%" fy="50%" r="50%">
                <Stop offset="0%" stopColor="#FBCFE8" stopOpacity="1" />
                <Stop offset="100%" stopColor="#F472B6" stopOpacity="1" />
              </RadialGradient>
            </Defs>
            <G transform="translate(100, 100)">
              {/* Petals */}
              {[0, 60, 120, 180, 240, 300].map((rotation, index) => (
                <Path
                  key={index}
                  d="M0 -80 C 40 -80, 40 -40, 0 0 C -40 -40, -40 -80, 0 -80"
                  fill="url(#petalGradient)"
                  rotation={rotation}
                  origin="0, 0"
                />
              ))}
              {/* Center */}
              <Circle cx="0" cy="0" r="25" fill="#FBBF24" />
            </G>
          </Svg>
        </Animated.View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.ink }]}>
          {t('onboarding.welcome.title')}
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
          {t('onboarding.welcome.description')}
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
  flowerContainer: {
    marginBottom: 48,
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    width: 12,
    height: 12,
  },
  sparkleCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  sparkle1: {
    top: '15%',
    left: '10%',
  },
  sparkle2: {
    top: '25%',
    right: '5%',
  },
  sparkle3: {
    bottom: '35%',
    left: '20%',
  },
  sparkle4: {
    bottom: '45%',
    right: '15%',
  },
  sparkle5: {
    top: '5%',
    right: '45%',
  },
  sparkle6: {
    bottom: '25%',
    left: '40%',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
  },
});
