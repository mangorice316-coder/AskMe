import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform, Image } from 'react-native';
import Svg, {
  Path,
  Circle,
  Ellipse,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
} from 'react-native-svg';
import { MapPin, FileText, Sparkles, CheckCircle2, Camera } from 'lucide-react-native';
import { THEME } from '../theme/tokens';

export default function HeroIllustration() {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cardsReveal = useRef(new Animated.Value(0)).current;

  // Mouse tilt on desktop
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 1. Entrance reveal
    Animated.timing(cardsReveal, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // 2. Continuous 3D floating movement
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // 3. Slow orbital rotation
    Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 16000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // 4. Subtle core pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const orbitRotation = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleMouseMove = (e: any) => {
    if (Platform.OS !== 'web') return;
    const rect = e.currentTarget?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX || 0;
    const clientY = e.clientY || 0;
    const x = ((clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    if (Platform.OS !== 'web') return;
    setTilt({ x: 0, y: 0 });
  };

  return (
    <View
      style={styles.container}
      {...(Platform.OS === 'web'
        ? {
            onMouseMove: handleMouseMove,
            onMouseLeave: handleMouseLeave,
          }
        : {})}
    >
      {/* Dynamic 3D Composition Container */}
      <Animated.View
        style={[
          styles.compositionBox,
          {
            transform: [
              { translateY: floatAnim },
              ...(Platform.OS === 'web'
                ? [
                    { perspective: 1000 } as any,
                    { rotateX: `${tilt.y}deg` } as any,
                    { rotateY: `${tilt.x}deg` } as any,
                  ]
                : []),
            ],
          },
        ]}
      >
        {/* Ambient Orange Radiant Glow Field */}
        <View style={styles.ambientGlow} />

        {/* Dynamic Concentric Orbital Light Rings */}
        <Animated.View
          style={[
            styles.orbitalRingsWrapper,
            {
              transform: [{ rotate: orbitRotation }],
            },
          ]}
        >
          <Svg width={460} height={460} viewBox="0 0 460 460" fill="none">
            {/* Outer thin ellipse ring */}
            <Ellipse
              cx="230"
              cy="230"
              rx="210"
              ry="110"
              stroke="#F47738"
              strokeWidth="1"
              strokeOpacity="0.28"
              strokeDasharray="6 8"
              transform="rotate(-22 230 230)"
            />
            {/* Mid orbital ring */}
            <Ellipse
              cx="230"
              cy="230"
              rx="170"
              ry="85"
              stroke="#FF8C42"
              strokeWidth="1.2"
              strokeOpacity="0.4"
              transform="rotate(18 230 230)"
            />
            {/* Inner close ring */}
            <Ellipse
              cx="230"
              cy="230"
              rx="130"
              ry="65"
              stroke="#FFAE68"
              strokeWidth="1"
              strokeOpacity="0.3"
              transform="rotate(-40 230 230)"
            />
            {/* Orbiting light particles */}
            <Circle cx="80" cy="180" r="3" fill="#F47738" fillOpacity="0.9" />
            <Circle cx="370" cy="270" r="2.5" fill="#FFAE68" fillOpacity="0.8" />
            <Circle cx="210" cy="115" r="2" fill="#FFFFFF" fillOpacity="0.9" />
            <Circle cx="290" cy="340" r="3" fill="#F47738" fillOpacity="0.75" />
          </Svg>
        </Animated.View>

        {/* Central Signature 3D Ceramic Civic Signal Emblem */}
        <View style={styles.centralEmblemWrapper}>
          <Svg width={280} height={280} viewBox="0 0 200 200" fill="none">
            <Defs>
              <LinearGradient id="heroCeramic" x1="0.15" y1="0" x2="0.85" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="35%" stopColor="#F7F5F0" />
                <Stop offset="70%" stopColor="#DDD8CE" />
                <Stop offset="100%" stopColor="#A8A294" />
              </LinearGradient>

              <LinearGradient id="heroRimHighlight" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <Stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </LinearGradient>

              <RadialGradient id="heroAmberCore" cx="46%" cy="42%" r="58%">
                <Stop offset="0%" stopColor="#FFF4DE" />
                <Stop offset="20%" stopColor="#FF9B42" />
                <Stop offset="60%" stopColor="#F47738" />
                <Stop offset="88%" stopColor="#C9400D" />
                <Stop offset="100%" stopColor="#661902" />
              </RadialGradient>

              <RadialGradient id="heroCentralSphere" cx="38%" cy="36%" r="62%">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="60%" stopColor="#EFECE3" />
                <Stop offset="100%" stopColor="#C2BCAB" />
              </RadialGradient>
            </Defs>

            {/* Ambient Occlusion Drop Shadow */}
            <Path
              d="M 100 24 C 60 24 32 52 32 88 C 32 122 70 152 96 180 C 98 182 102 182 104 180 C 130 152 168 122 168 88 C 168 52 140 24 100 24 Z"
              fill="rgba(0, 0, 0, 0.65)"
              transform="translate(4, 12)"
            />

            {/* 3D Ceramic Outer Shell */}
            <Path
              d="M 100 20 C 58 20 28 50 28 88 C 28 124 68 156 96 184 C 98 186 102 186 104 184 C 132 156 172 124 172 88 C 172 50 142 20 100 20 Z"
              fill="url(#heroCeramic)"
            />

            {/* Specular Glaze Reflection */}
            <Path
              d="M 100 24 C 62 24 34 52 32 86 C 42 56 68 40 100 40 C 132 40 158 56 168 86 C 166 52 138 24 100 24 Z"
              fill="url(#heroRimHighlight)"
            />

            {/* Recessed Amber Cavity */}
            <Circle cx="100" cy="88" r="50" fill="#1A1510" />
            <Circle cx="100" cy="88" r="46" fill="url(#heroAmberCore)" />

            {/* Inner Glowing Amber Resonance Rings */}
            <Circle
              cx="100"
              cy="88"
              r="34"
              stroke="#FFE2B0"
              strokeWidth="2.5"
              strokeOpacity="0.8"
              fill="none"
            />
            <Circle
              cx="100"
              cy="88"
              r="26"
              stroke="#FFAA5C"
              strokeWidth="1.5"
              strokeOpacity="0.5"
              fill="none"
            />

            {/* Central Floating Ceramic Core Sphere */}
            <Circle cx="100" cy="88" r="18" fill="url(#heroCentralSphere)" />
            {/* Specular Dot */}
            <Circle cx="94" cy="82" r="5" fill="#FFFFFF" fillOpacity="0.95" />
          </Svg>
        </View>

        {/* FLOATING TELEMETRY CARD 1: Evidence Photo (Top-Left) */}
        <Animated.View
          style={[
            styles.telemetryCard,
            styles.cardEvidencePhoto,
            { opacity: cardsReveal },
          ]}
        >
          <View style={styles.thumbnailBox}>
            <View style={styles.samplePhoto}>
              <Camera size={14} color="#F47738" />
            </View>
          </View>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardHeader}>Evidence</Text>
            <Text style={styles.cardSub}>Photo Captured</Text>
          </View>
        </Animated.View>

        {/* FLOATING TELEMETRY CARD 2: AI Analysis (Mid-Left) */}
        <Animated.View
          style={[
            styles.telemetryCard,
            styles.cardAiAnalysisLeft,
            { opacity: cardsReveal },
          ]}
        >
          <View style={styles.iconCircle}>
            <MapPin size={13} color="#F47738" />
          </View>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardHeader}>AI Analysis</Text>
            <Text style={styles.cardSub}>In Progress</Text>
          </View>
        </Animated.View>

        {/* FLOATING TELEMETRY CARD 3: Location Detected (Top-Right) */}
        <Animated.View
          style={[
            styles.telemetryCard,
            styles.cardLocationRight,
            { opacity: cardsReveal },
          ]}
        >
          <View style={styles.iconCircle}>
            <MapPin size={13} color="#F47738" />
          </View>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardHeader}>Location</Text>
            <Text style={styles.cardSub}>Detected & Verified</Text>
          </View>
        </Animated.View>

        {/* FLOATING TELEMETRY CARD 4: AI Analysis Right (Mid-Right) */}
        <Animated.View
          style={[
            styles.telemetryCard,
            styles.cardAiAnalysisRight,
            { opacity: cardsReveal },
          ]}
        >
          <View style={styles.iconCircle}>
            <Sparkles size={13} color="#F47738" />
          </View>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardHeader}>AI Classification</Text>
            <Text style={styles.cardSub}>Statutory Match</Text>
          </View>
        </Animated.View>

        {/* FLOATING TELEMETRY CARD 5: Authority Municipal Corp. (Bottom-Right) */}
        <Animated.View
          style={[
            styles.telemetryCard,
            styles.cardAuthorityRight,
            { opacity: cardsReveal },
          ]}
        >
          <View style={styles.iconCircle}>
            <FileText size={13} color="#F47738" />
          </View>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardHeader}>Authority</Text>
            <Text style={styles.cardSub}>Municipal Corp.</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    position: 'relative',
    minHeight: 460,
  },
  compositionBox: {
    width: '100%',
    maxWidth: 620,
    height: 440,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(244, 119, 56, 0.16)',
    top: '18%',
    left: '26%',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
  },
  orbitalRingsWrapper: {
    position: 'absolute',
    width: 460,
    height: 460,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralEmblemWrapper: {
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    filter: Platform.OS === 'web' ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.65))' : undefined,
  },
  telemetryCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 9,
    paddingHorizontal: 13,
    backgroundColor: 'rgba(26, 26, 24, 0.78)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
  cardEvidencePhoto: {
    top: 24,
    left: '6%',
  },
  thumbnailBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1E1E1C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.3)',
  },
  samplePhoto: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#26221D',
  },
  cardAiAnalysisLeft: {
    top: 210,
    left: '2%',
  },
  cardLocationRight: {
    top: 36,
    right: '4%',
  },
  cardAiAnalysisRight: {
    top: 185,
    right: '2%',
  },
  cardAuthorityRight: {
    bottom: 30,
    right: '8%',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(244, 119, 56, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.3)',
  },
  cardTextCol: {
    justifyContent: 'center',
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: 9,
    fontWeight: '600',
    color: THEME.colors.secondaryText,
    fontFamily: THEME.fonts.mono,
    marginTop: 1,
  },
});
