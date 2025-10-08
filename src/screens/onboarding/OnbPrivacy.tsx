import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

export default function OnbPrivacy() {
  const { colors, gradients } = useTheme();
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lockScaleAnim = useRef(new Animated.Value(0)).current;
  const lockPulseAnim = useRef(new Animated.Value(1)).current;
  const flicker1 = useRef(new Animated.Value(0.5)).current;
  const flicker2 = useRef(new Animated.Value(0.5)).current;
  const flicker3 = useRef(new Animated.Value(0.5)).current;
  const flicker4 = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Scale-in animation for lock (initial)
    Animated.timing(lockScaleAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Lock pulse animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(lockPulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(lockPulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Opacity flicker animations for sparkles/flowers
    const flickerAnimation = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    flickerAnimation(flicker1, 0);
    flickerAnimation(flicker2, 300);
    flickerAnimation(flicker3, 600);
    flickerAnimation(flicker4, 900);
  }, []);

  return (
    <LinearGradient
      colors={gradients.onboardingPrivacy}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Flickering sparkles/flowers */}
        <Animated.Text style={[styles.floatEmoji, styles.float1, { opacity: flicker1 }]}>
          🌸
        </Animated.Text>
        <Animated.Text style={[styles.floatEmoji, styles.float2, { opacity: flicker2 }]}>
          ✨
        </Animated.Text>
        <Animated.Text style={[styles.floatEmoji, styles.float3, { opacity: flicker3 }]}>
          🌸
        </Animated.Text>
        <Animated.Text style={[styles.floatEmoji, styles.float4, { opacity: flicker4 }]}>
          ✨
        </Animated.Text>

        {/* Lock Icon with scale-in animation */}
        <View style={styles.lockContainer}>
          <Animated.View
            style={{
              transform: [
                { scale: lockScaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                })},
                { scale: lockPulseAnim }
              ],
            }}
          >
            <Svg width={160} height={160} viewBox="0 0 20 20">
              <Path
                d="M10 2a4 4 0 00-4 4v2H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zm-2 4V6a2 2 0 114 0v2H8z"
                fill="#FFFFFF"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </Svg>
            
            {/* Heart overlay */}
            <Svg width={40} height={40} viewBox="0 0 20 20" style={styles.heartOverlay}>
              <Path
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                fill="#FF66B2"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </Svg>
          </Animated.View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {t('onboarding.privacy.title')}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {t('onboarding.privacy.description')}
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
  lockContainer: {
    position: 'relative',
    marginBottom: 40,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartOverlay: {
    position: 'absolute',
    top: '55%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  floatEmoji: {
    position: 'absolute',
    fontSize: 28,
  },
  float1: {
    top: '10%',
    left: '10%',
  },
  float2: {
    top: '50%',
    right: '8%',
  },
  float3: {
    bottom: '25%',
    left: '16%',
  },
  float4: {
    top: '5%',
    right: '20%',
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
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    color: '#666',
    marginTop: 6,
  },
});
