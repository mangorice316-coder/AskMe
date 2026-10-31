import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import Svg, { Circle, Ellipse, Path, Defs, RadialGradient, LinearGradient, Stop } from 'react-native-svg';
import { Check, Clock, Sparkles, Shield, MapPin, Building2, FileText, Camera } from 'lucide-react-native';
import { THEME } from '../theme/tokens';

export type ProcessingStage =
  | 'understanding'
  | 'analyzing'
  | 'locating'
  | 'identifying'
  | 'preparing';

interface AIProcessingScreenProps {
  currentStage: ProcessingStage;
}

const STAGES: {
  id: ProcessingStage;
  num: number;
  title: string;
  desc: string;
}[] = [
  {
    id: 'understanding',
    num: 1,
    title: 'Understanding your report',
    desc: 'Parsing citizen statement and voice audio...',
  },
  {
    id: 'analyzing',
    num: 2,
    title: 'Examining the evidence',
    desc: 'Classifying hazard severity and physical defects...',
  },
  {
    id: 'locating',
    num: 3,
    title: 'Checking the location',
    desc: 'Verifying GPS boundaries and jurisdiction limits...',
  },
  {
    id: 'identifying',
    num: 4,
    title: 'Identifying the authority',
    desc: 'Matching statutory department (BBMP, GCC, MCD, NHAI)...',
  },
  {
    id: 'preparing',
    num: 5,
    title: 'Preparing the letter',
    desc: 'Generating formal legal grievance representation...',
  },
];

export default function AIProcessingScreen({ currentStage }: AIProcessingScreenProps) {
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0.2)).current;

  const currentStageIndex = STAGES.findIndex((s) => s.id === currentStage);
  const activeStageNum = currentStageIndex >= 0 ? currentStageIndex + 1 : 1;

  useEffect(() => {
    // 1. Orbital rotation
    Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // 2. Central float
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    // Smooth progress bar movement
    const targetProgress = activeStageNum / 5;
    Animated.timing(progressAnim, {
      toValue: targetProgress,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [activeStageNum]);

  const orbitRotation = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressPercent = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const currentStageObj = STAGES[currentStageIndex] || STAGES[0];

  return (
    <View style={styles.container}>
      {/* Background Ambient Radial Glow */}
      <View style={styles.ambientGlow} />

      <View style={styles.contentGrid}>
        {/* ================= LEFT COLUMN: 5-STEP PIPELINE ================= */}
        {/* Matches concept2_ai_analysis_screen.jpg left */}
        <View style={styles.pipelineCol}>
          <Text style={styles.pipelineMainTitle}>
            <Text style={{ color: '#F47738' }}>AI</Text> Analysis{'\n'}In Progress
          </Text>

          <View style={styles.stepsList}>
            {STAGES.map((s, idx) => {
              const isPast = activeStageNum > s.num;
              const isCurrent = activeStageNum === s.num;

              return (
                <View key={s.id} style={styles.stepItemRow}>
                  {/* Stepper icon column */}
                  <View style={styles.stepIndicatorCol}>
                    <View
                      style={[
                        styles.stepBadgeCircle,
                        isCurrent && styles.stepBadgeCircleCurrent,
                        isPast && styles.stepBadgeCirclePast,
                      ]}
                    >
                      {isPast ? (
                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                      ) : (
                        <View
                          style={[
                            styles.stepInnerDot,
                            isCurrent && styles.stepInnerDotCurrent,
                          ]}
                        />
                      )}
                    </View>
                    {idx < STAGES.length - 1 && (
                      <View
                        style={[
                          styles.stepConnectorLine,
                          isPast && styles.stepConnectorLinePast,
                        ]}
                      />
                    )}
                  </View>

                  {/* Step label text */}
                  <View style={styles.stepTextWrapper}>
                    <Text
                      style={[
                        styles.stepTitleText,
                        isCurrent && styles.stepTitleTextCurrent,
                        isPast && styles.stepTitleTextPast,
                      ]}
                    >
                      {s.title}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.stepSubDesc}>{s.desc}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ================= CENTER / RIGHT: 3D EMBLEM & ORBITS ================= */}
        {/* Matches concept2_ai_analysis_screen.jpg center */}
        <View style={styles.emblemCol}>
          <Animated.View
            style={[
              styles.emblemContainer,
              { transform: [{ translateY: floatAnim }] },
            ]}
          >
            {/* Concentric Rotating Orbital Rings */}
            <Animated.View
              style={[
                styles.orbitalRings,
                { transform: [{ rotate: orbitRotation }] },
              ]}
            >
              <Svg width={380} height={380} viewBox="0 0 380 380" fill="none">
                <Ellipse
                  cx="190"
                  cy="190"
                  rx="170"
                  ry="90"
                  stroke="#F47738"
                  strokeWidth="1.2"
                  strokeOpacity="0.4"
                  strokeDasharray="6 8"
                  transform="rotate(-25 190 190)"
                />
                <Ellipse
                  cx="190"
                  cy="190"
                  rx="140"
                  ry="70"
                  stroke="#FFAE68"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  transform="rotate(20 190 190)"
                />
                <Circle cx="60" cy="150" r="3" fill="#F47738" fillOpacity="0.9" />
                <Circle cx="310" cy="220" r="2.5" fill="#FFAE68" fillOpacity="0.8" />
              </Svg>
            </Animated.View>

            {/* Central 3D Ceramic Pin with Glowing Amber Core */}
            <View style={styles.centerEmblem}>
              <Svg width={220} height={220} viewBox="0 0 200 200" fill="none">
                <Defs>
                  <LinearGradient id="procCeramic" x1="0.1" y1="0" x2="0.9" y2="1">
                    <Stop offset="0%" stopColor="#FFFFFF" />
                    <Stop offset="40%" stopColor="#F6F4EF" />
                    <Stop offset="80%" stopColor="#D9D5CC" />
                    <Stop offset="100%" stopColor="#A8A397" />
                  </LinearGradient>
                  <RadialGradient id="procAmberCore" cx="48%" cy="45%" r="56%">
                    <Stop offset="0%" stopColor="#FFF2D4" />
                    <Stop offset="25%" stopColor="#FF9638" />
                    <Stop offset="65%" stopColor="#F47738" />
                    <Stop offset="90%" stopColor="#C9400D" />
                    <Stop offset="100%" stopColor="#6E1B02" />
                  </RadialGradient>
                  <RadialGradient id="procSphere" cx="38%" cy="36%" r="62%">
                    <Stop offset="0%" stopColor="#FFFFFF" />
                    <Stop offset="60%" stopColor="#EFECE3" />
                    <Stop offset="100%" stopColor="#C2BCAB" />
                  </RadialGradient>
                </Defs>

                {/* 3D Shell Drop Shadow */}
                <Path
                  d="M 100 22 C 60 22 30 50 30 88 C 30 122 70 154 96 182 C 98 184 102 184 104 182 C 130 154 170 122 170 88 C 170 50 140 22 100 22 Z"
                  fill="rgba(0, 0, 0, 0.65)"
                  transform="translate(4, 10)"
                />

                {/* Outer Ceramic Shell */}
                <Path
                  d="M 100 18 C 58 18 26 48 26 88 C 26 124 68 158 96 186 C 98 188 102 188 104 186 C 132 158 174 124 174 88 C 174 48 142 18 100 18 Z"
                  fill="url(#procCeramic)"
                />

                {/* Recessed Glowing Amber Core */}
                <Circle cx="100" cy="88" r="48" fill="#181410" />
                <Circle cx="100" cy="88" r="45" fill="url(#procAmberCore)" />

                {/* Inner Glowing Torus Rings */}
                <Circle
                  cx="100"
                  cy="88"
                  r="32"
                  stroke="#FFE2B0"
                  strokeWidth="2.5"
                  strokeOpacity="0.85"
                  fill="none"
                />
                <Circle
                  cx="100"
                  cy="88"
                  r="24"
                  stroke="#FFAA5C"
                  strokeWidth="1.5"
                  strokeOpacity="0.55"
                  fill="none"
                />

                {/* Central Floating Sphere */}
                <Circle cx="100" cy="88" r="16" fill="url(#procSphere)" />
                <Circle cx="95" cy="83" r="4.5" fill="#FFFFFF" fillOpacity="0.95" />
              </Svg>
            </View>

            {/* Orbiting Satellite Data Tiles */}
            <View style={[styles.orbitTile, styles.tilePhoto]}>
              <Camera size={14} color="#F47738" />
            </View>

            <View style={[styles.orbitTile, styles.tileRadar]}>
              <MapPin size={14} color="#F47738" />
            </View>

            <View style={[styles.orbitTile, styles.tileAuthority]}>
              <Building2 size={14} color="#F47738" />
            </View>
          </Animated.View>
        </View>
      </View>

      {/* ================= BOTTOM STATUS CAPSULE ================= */}
      {/* Matches concept2_ai_analysis_screen.jpg bottom capsule */}
      <View style={styles.statusCapsuleWrapper}>
        <View style={styles.statusCapsule}>
          <View style={styles.statusTextRow}>
            <View style={styles.statusIconWrap}>
              <Clock size={15} color="#F47738" />
            </View>
            <Text style={styles.statusHeadline}>
              {currentStageObj.desc}
            </Text>
            <Text style={styles.stageCountText}>{activeStageNum}/5</Text>
          </View>

          {/* Glowing Orange Progress Bar */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressPercent }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A09',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
    minHeight: 580,
  },
  ambientGlow: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(244, 119, 56, 0.14)',
    top: '25%',
    right: '25%',
    filter: Platform.OS === 'web' ? 'blur(80px)' : undefined,
  },
  contentGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 960,
    width: '100%',
    gap: 40,
    zIndex: 10,
  },
  pipelineCol: {
    flex: 1,
    maxWidth: 420,
    width: '100%',
  },
  pipelineMainTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    lineHeight: 40,
    marginBottom: 32,
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  stepsList: {
    gap: 0,
  },
  stepItemRow: {
    flexDirection: 'row',
    gap: 14,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 24,
  },
  stepBadgeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E1E1C',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeCircleCurrent: {
    backgroundColor: 'rgba(244, 119, 56, 0.2)',
    borderColor: '#F47738',
  },
  stepBadgeCirclePast: {
    backgroundColor: '#F47738',
    borderColor: '#F47738',
  },
  stepInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  stepInnerDotCurrent: {
    backgroundColor: '#F47738',
  },
  stepConnectorLine: {
    width: 2,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 4,
  },
  stepConnectorLinePast: {
    backgroundColor: '#F47738',
  },
  stepTextWrapper: {
    flex: 1,
    paddingTop: 2,
    paddingBottom: 16,
  },
  stepTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#77736E',
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  stepTitleTextCurrent: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepTitleTextPast: {
    color: '#A8A49D',
    fontWeight: '600',
  },
  stepSubDesc: {
    fontSize: 12,
    color: '#F47738',
    marginTop: 4,
    fontFamily: THEME.fonts.mono,
  },
  emblemCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 320,
  },
  emblemContainer: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orbitalRings: {
    position: 'absolute',
    width: 380,
    height: 380,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerEmblem: {
    zIndex: 10,
    filter: Platform.OS === 'web' ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.7))' : undefined,
  },
  orbitTile: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(26, 26, 24, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  tilePhoto: {
    top: 24,
    left: 20,
  },
  tileRadar: {
    bottom: 40,
    left: 30,
  },
  tileAuthority: {
    top: 60,
    right: 15,
  },
  statusCapsuleWrapper: {
    maxWidth: 680,
    width: '100%',
    marginTop: 36,
    zIndex: 20,
  },
  statusCapsule: {
    backgroundColor: 'rgba(26, 26, 24, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 6,
  },
  statusTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  statusIconWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusHeadline: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  stageCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F47738',
    fontFamily: THEME.fonts.mono,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#F47738',
    borderRadius: 2,
  },
});
