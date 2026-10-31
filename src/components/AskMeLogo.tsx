import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
  Filter,
  FeDropShadow,
} from 'react-native-svg';
import { THEME } from '../theme/tokens';

interface AskMeLogoProps {
  size?: number;
  showText?: boolean;
  animated?: boolean;
  tagline?: boolean;
  dark?: boolean;
  mode?: 'reveal' | 'idle' | 'action';
}

export default function AskMeLogo({
  size = 40,
  showText = true,
  animated = true,
  tagline = false,
  mode = 'idle',
}: AskMeLogoProps) {
  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const wordmarkAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (!animated) return;

    // Wordmark fade in
    Animated.timing(wordmarkAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Idle gentle floating movement (Mode B)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -3,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(floatAnim, {
          toValue: 2,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Internal amber core glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [animated]);

  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  return (
    <View style={[styles.container, { height: size }]}>
      {/* 3D Ceramic Civic Signal Emblem */}
      <Animated.View
        style={[
          styles.emblemWrapper,
          {
            width: size,
            height: size,
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Defs>
            {/* Ceramic outer bevel gradient */}
            <LinearGradient id="ceramicBevel" x1="0.2" y1="0" x2="0.8" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="45%" stopColor="#F5F3EF" />
              <Stop offset="85%" stopColor="#D8D4CC" />
              <Stop offset="100%" stopColor="#B3AEA3" />
            </LinearGradient>

            {/* Specular rim light */}
            <LinearGradient id="specularRim" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </LinearGradient>

            {/* Radiant translucent amber/coral glass core */}
            <RadialGradient id="amberCore" cx="48%" cy="45%" r="55%">
              <Stop offset="0%" stopColor="#FFF2D6" />
              <Stop offset="25%" stopColor="#FF8C38" />
              <Stop offset="65%" stopColor="#F47738" />
              <Stop offset="90%" stopColor="#D94E1A" />
              <Stop offset="100%" stopColor="#8A2304" />
            </RadialGradient>

            {/* Central ceramic floating bead */}
            <RadialGradient id="ceramicBead" cx="40%" cy="38%" r="60%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="60%" stopColor="#F4F0E8" />
              <Stop offset="100%" stopColor="#D4CEBF" />
            </RadialGradient>
          </Defs>

          {/* Ambient drop shadow behind 3D pin */}
          <Path
            d="M 50 14 C 30 14 16 28 16 46 C 16 63 35 78 48 92 C 49 93 51 93 52 92 C 65 78 84 63 84 46 C 84 28 70 14 50 14 Z"
            fill="rgba(0, 0, 0, 0.45)"
            transform="translate(0, 4)"
          />

          {/* Outer Ceramic Teardrop Body (Speech Bubble + Location Marker) */}
          <Path
            d="M 50 10 C 28 10 12 26 12 46 C 12 65 33 82 48 95 C 49 96 51 96 52 95 C 67 82 88 65 88 46 C 88 26 72 10 50 10 Z"
            fill="url(#ceramicBevel)"
          />

          {/* Crisp Specular Top-Light Reflection */}
          <Path
            d="M 50 12 C 30 12 16 26 14 44 C 20 28 34 20 50 20 C 66 20 80 28 86 44 C 84 26 70 12 50 12 Z"
            fill="url(#specularRim)"
          />

          {/* Inner Recessed Amber Core Dish */}
          <Circle cx="50" cy="46" r="26" fill="#1C1814" />
          <Circle cx="50" cy="46" r="24" fill="url(#amberCore)" />

          {/* Inner Glowing Torus Ring */}
          <Circle
            cx="50"
            cy="46"
            r="16"
            stroke="#FFE4B8"
            strokeWidth="2"
            strokeOpacity="0.8"
            fill="none"
          />

          {/* Central Ceramic Intelligent Core Bead */}
          <Circle cx="50" cy="46" r="10" fill="url(#ceramicBead)" />

          {/* Micro Highlight on Center Bead */}
          <Circle cx="47" cy="43" r="3" fill="#FFFFFF" fillOpacity="0.9" />
        </Svg>
      </Animated.View>

      {/* Brand Typography */}
      {showText && (
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: wordmarkAnim,
            },
          ]}
        >
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>ASK</Text>
            <Text style={[styles.brandTitle, styles.brandTitleAccent]}>ME</Text>
          </View>
          {tagline && (
            <Text style={styles.taglineText}>CIVIC ACTION PLATFORM</Text>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emblemWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'web' ? 'Sora, Space Grotesk, sans-serif' : undefined,
  },
  brandTitleAccent: {
    color: '#F47738',
  },
  taglineText: {
    fontSize: 8,
    fontWeight: '800',
    color: THEME.colors.secondaryText,
    letterSpacing: 1.2,
    fontFamily: THEME.fonts.mono,
    marginTop: -1,
  },
});
