import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import Svg, {
  Path,
  Circle,
  Ellipse,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { MapPin, FileText, Sparkles, Camera } from 'lucide-react-native';
import { THEME } from '../theme/tokens';

export default function HeroIllustration() {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  const card4Anim = useRef(new Animated.Value(0)).current;

  // Subtle mouse tilt for web
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Staggered entrance for the 4 floating cards
    Animated.stagger(140, [
      Animated.timing(card1Anim, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(card2Anim, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(card3Anim, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(card4Anim, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();

    // Continuous 3D floating movement
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Slow orbital rotation
    Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 24000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // Subtle breathing glow on central target
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
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
    const x = ((clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((clientY - rect.top) / rect.height - 0.5) * -12;
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
        {/* Atmospheric Radial Ambient Glow */}
        <View style={styles.ambientGlow} />

        {/* Animated Orbital Paths */}
        <Animated.View
          style={[
            styles.orbitalRingsWrapper,
            { transform: [{ rotate: orbitRotation }] },
          ]}
        >
          <Svg width={460} height={460} viewBox="0 0 460 460" fill="none">
            {/* Outer Orbital Ellipse */}
            <Ellipse
              cx="230"
              cy="230"
              rx="215"
              ry="105"
              stroke="#FF7135"
              strokeWidth="1"
              strokeOpacity="0.25"
              strokeDasharray="6 8"
              transform="rotate(-24 230 230)"
            />
            {/* Mid Orbital Ellipse */}
            <Ellipse
              cx="230"
              cy="230"
              rx="175"
              ry="85"
              stroke="#FF8A50"
              strokeWidth="1.2"
              strokeOpacity="0.35"
              transform="rotate(18 230 230)"
            />
            {/* Inner Orbital Ellipse */}
            <Ellipse
              cx="230"
              cy="230"
              rx="135"
              ry="65"
              stroke="#FFAE68"
              strokeWidth="1"
              strokeOpacity="0.25"
              transform="rotate(-42 230 230)"
            />

            {/* Orbiting Telemetry Particles */}
            <Circle cx="80" cy="180" r="3" fill="#FF7135" fillOpacity="0.9" />
            <Circle cx="370" cy="270" r="2.5" fill="#FF8A50" fillOpacity="0.8" />
            <Circle cx="210" cy="115" r="2" fill="#FFFFFF" fillOpacity="0.95" />
            <Circle cx="290" cy="340" r="3" fill="#38D982" fillOpacity="0.85" />
          </Svg>
        </Animated.View>

        {/* Central Signature 3D Ceramic Location Pin */}
        <View style={styles.centralPinWrapper}>
          <Svg width={270} height={270} viewBox="0 0 200 200" fill="none">
            <Defs>
              <LinearGradient id="ceramicBodyGrad" x1="0.15" y1="0" x2="0.85" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="30%" stopColor="#F7F7F5" />
                <Stop offset="70%" stopColor="#D8D5CD" />
                <Stop offset="100%" stopColor="#9E998E" />
              </LinearGradient>

              <LinearGradient id="ceramicRimGlint" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <Stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </LinearGradient>

              <RadialGradient id="orangeTargetCavity" cx="46%" cy="42%" r="58%">
                <Stop offset="0%" stopColor="#FFF4EE" />
                <Stop offset="22%" stopColor="#FF9B60" />
                <Stop offset="62%" stopColor="#FF7135" />
                <Stop offset="88%" stopColor="#D44A14" />
                <Stop offset="100%" stopColor="#6E2204" />
              </RadialGradient>

              <RadialGradient id="ceramicInnerCore" cx="38%" cy="36%" r="62%">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="65%" stopColor="#EFECE3" />
                <Stop offset="100%" stopColor="#BDB7A5" />
              </RadialGradient>
            </Defs>

            {/* Drop Shadow Base */}
            <Path
              d="M 100 24 C 60 24 32 52 32 88 C 32 122 70 152 96 180 C 98 182 102 182 104 180 C 130 152 168 122 168 88 C 168 52 140 24 100 24 Z"
              fill="rgba(0, 0, 0, 0.65)"
              transform="translate(4, 14)"
            />

            {/* White Ceramic Outer Body */}
            <Path
              d="M 100 20 C 58 20 28 50 28 88 C 28 124 68 156 96 184 C 98 186 102 186 104 184 C 132 156 172 124 172 88 C 172 50 142 20 100 20 Z"
              fill="url(#ceramicBodyGrad)"
            />

            {/* Specular Rim Highlight */}
            <Path
              d="M 100 24 C 62 24 34 52 32 86 C 42 56 68 40 100 40 C 132 40 158 56 168 86 C 166 52 138 24 100 24 Z"
              fill="url(#ceramicRimGlint)"
            />

            {/* Recessed Dark Border Cavity */}
            <Circle cx="100" cy="88" r="50" fill="#11110F" />
            <Circle cx="100" cy="88" r="46" fill="url(#orangeTargetCavity)" />

            {/* Glowing Orange Resonance Rings */}
            <Circle
              cx="100"
              cy="88"
              r="34"
              stroke="#FFE3D4"
              strokeWidth="2.4"
              strokeOpacity="0.85"
              fill="none"
            />
            <Circle
              cx="100"
              cy="88"
              r="26"
              stroke="#FF8A50"
              strokeWidth="1.5"
              strokeOpacity="0.5"
              fill="none"
            />

            {/* Central Ceramic Core Sphere */}
            <Circle cx="100" cy="88" r="18" fill="url(#ceramicInnerCore)" />
            <Circle cx="94" cy="82" r="5" fill="#FFFFFF" fillOpacity="0.95" />
          </Svg>
        </View>

        {/* ================= 4 FLOATING LIQUID-GLASS CARDS (PROMPT SECTION 06) ================= */}

        {/* CARD 1 — EVIDENCE (Top-Left) */}
        <Animated.View
          style={[
            styles.liquidCard,
            styles.cardEvidence,
            {
              opacity: card1Anim,
              transform: [
                {
                  translateY: card1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.cardIconBox}>
            <Camera size={14} color="#FF7135" strokeWidth={2.4} />
          </View>
          <View style={styles.cardTextStack}>
            <Text style={styles.cardHeader}>Evidence</Text>
            <Text style={styles.cardSub}>Photo Captured</Text>
          </View>
        </Animated.View>

        {/* CARD 2 — LOCATION (Bottom-Left) */}
        <Animated.View
          style={[
            styles.liquidCard,
            styles.cardLocation,
            {
              opacity: card2Anim,
              transform: [
                {
                  translateY: card2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.cardIconBox}>
            <MapPin size={14} color="#FF7135" strokeWidth={2.4} />
          </View>
          <View style={styles.cardTextStack}>
            <Text style={styles.cardHeader}>Location</Text>
            <Text style={styles.cardSub}>Location Detected</Text>
          </View>
        </Animated.View>

        {/* CARD 3 — AI ANALYSIS (Top-Right) */}
        <Animated.View
          style={[
            styles.liquidCard,
            styles.cardAiAnalysis,
            {
              opacity: card3Anim,
              transform: [
                {
                  translateY: card3Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.cardIconBox}>
            <Sparkles size={14} color="#FF7135" strokeWidth={2.4} />
          </View>
          <View style={styles.cardTextStack}>
            <Text style={styles.cardHeader}>AI Analysis</Text>
            <Text style={styles.cardSub}>AI Classification</Text>
          </View>
        </Animated.View>

        {/* CARD 4 — AUTHORITY (Bottom-Right) */}
        <Animated.View
          style={[
            styles.liquidCard,
            styles.cardAuthority,
            {
              opacity: card4Anim,
              transform: [
                {
                  translateY: card4Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.cardIconBox}>
            <FileText size={14} color="#FF7135" strokeWidth={2.4} />
          </View>
          <View style={styles.cardTextStack}>
            <Text style={styles.cardHeader}>Authority</Text>
            <Text style={styles.cardSub}>Municipal Corporation</Text>
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
    paddingVertical: 14,
    position: 'relative',
    minHeight: 460,
  },
  compositionBox: {
    width: '100%',
    maxWidth: 600,
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
    backgroundColor: 'rgba(255, 113, 53, 0.14)',
    top: '18%',
    left: '24%',
    ...(Platform.OS === 'web'
      ? {
          filter: 'blur(75px)',
          pointerEvents: 'none',
        }
      : {}),
  },
  orbitalRingsWrapper: {
    position: 'absolute',
    width: 460,
    height: 460,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralPinWrapper: {
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? {
          filter: 'drop-shadow(0 24px 44px rgba(0, 0, 0, 0.75))',
        }
      : {}),
  },

  /* Liquid Glass Information Cards */
  liquidCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(17, 17, 15, 0.82)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    zIndex: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 8,
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
        }
      : {}),
  },
  cardEvidence: {
    top: 32,
    left: '4%',
  },
  cardLocation: {
    bottom: 44,
    left: '6%',
  },
  cardAiAnalysis: {
    top: 40,
    right: '4%',
  },
  cardAuthority: {
    bottom: 38,
    right: '4%',
  },
  cardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 113, 53, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 113, 53, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextStack: {
    justifyContent: 'center',
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F7F7F5',
    fontFamily: THEME.fonts.heading,
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A6A39E',
    fontFamily: THEME.fonts.mono,
    marginTop: 1,
  },
});
