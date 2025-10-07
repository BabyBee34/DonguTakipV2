import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

export default function OnbReminders() {
  const { colors, typography } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;

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

    // Floating animations with different patterns
    const floatAnimation = (anim: Animated.Value, delay: number, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -25,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    floatAnimation(float1, 0, 4000);
    floatAnimation(float2, 500, 5000);
    floatAnimation(float3, 1000, 6000);
  }, []);

  const floatTransform = (anim: Animated.Value, scale: number = 1.05) => ({
    transform: [
      { translateY: anim },
      {
        scale: anim.interpolate({
          inputRange: [-25, 0],
          outputRange: [scale, 1],
        }),
      },
    ],
  });

  return (
    <LinearGradient
      colors={['#d4f2e9', '#fde8ed']}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Heart SVG with pulse */}
        <View style={styles.heartContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Svg width={256} height={256} viewBox="0 0 200 200">
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

          {/* Floating emojis */}
          <Animated.Text style={[styles.floatingEmoji, styles.emoji1, floatTransform(float1)]}>
            🍫
          </Animated.Text>
          <Animated.Text style={[styles.floatingEmoji, styles.emoji2, floatTransform(float2)]}>
            💧
          </Animated.Text>
          <Animated.Text style={[styles.floatingEmoji, styles.emoji3, floatTransform(float3, 1.08)]}>
            🌙
          </Animated.Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.ink }]}>
          Kendine küçük hatırlatmalar 💕
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
          Çikolata zamanı mı? Su içme vakti mi? Senin yanında olacağım.
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
    marginBottom: 48,
    width: 256,
    height: 256,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 36,
    opacity: 0.8,
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
    fontSize: 34,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 340,
  },
});
