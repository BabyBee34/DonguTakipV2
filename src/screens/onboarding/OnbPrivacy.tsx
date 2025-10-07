import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import Svg, { Path } from 'react-native-svg';

export default function OnbPrivacy() {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lockAnim = useRef(new Animated.Value(1)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const float4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Lock animation with rotation and scale
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(lockAnim, {
            toValue: 1.05,
            duration: 750,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(lockAnim, {
            toValue: 1.1,
            duration: 750,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(lockAnim, {
            toValue: 1.05,
            duration: 750,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(lockAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating sparkles/flowers
    const floatAnimation = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -20,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    floatAnimation(float1, 0);
    floatAnimation(float2, 500);
    floatAnimation(float3, 1000);
    floatAnimation(float4, 1500);
  }, []);

  return (
    <LinearGradient
      colors={['#E1D5F8', '#FFD6E8']}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Floating elements */}
        <Animated.Text style={[styles.floatEmoji, styles.float1, { transform: [{ translateY: float1 }] }]}>
          🌸
        </Animated.Text>
        <Animated.Text style={[styles.floatEmoji, styles.float2, { transform: [{ translateY: float2 }] }]}>
          ✨
        </Animated.Text>
        <Animated.Text style={[styles.floatEmoji, styles.float3, { transform: [{ translateY: float3 }] }]}>
          🌸
        </Animated.Text>
        <Animated.Text style={[styles.floatEmoji, styles.float4, { transform: [{ translateY: float4 }] }]}>
          ✨
        </Animated.Text>

        {/* Lock Icon with animation */}
        <View style={styles.lockContainer}>
          <Animated.View
            style={{
              transform: [{ scale: lockAnim }],
            }}
          >
            <Svg width={192} height={192} viewBox="0 0 20 20">
              <Path
                d="M10 2a4 4 0 00-4 4v2H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zm-2 4V6a2 2 0 114 0v2H8z"
                fill="#FFFFFF"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </Svg>
            
            {/* Heart overlay */}
            <Svg width={48} height={48} viewBox="0 0 20 20" style={styles.heartOverlay}>
              <Path
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                fill="#F472B6"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </Svg>
          </Animated.View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.ink }]}>
          Verilerin sende 🔒
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
          Tüm bilgiler cihazında güvende, kimseyle paylaşılmaz.
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
    marginBottom: 48,
    width: 192,
    height: 192,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartOverlay: {
    position: 'absolute',
    top: '55%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
  floatEmoji: {
    position: 'absolute',
    fontSize: 28,
    opacity: 0.5,
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
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
});
