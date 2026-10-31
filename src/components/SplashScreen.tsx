import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import AskMeLogo from './AskMeLogo';
import { THEME } from '../theme/tokens';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: false,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start(() => {
        onFinish();
      });
    });
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* Curved glowing energy lines in background (concept2_logo_loading_animation.jpg) */}
      <View style={styles.energyLinesWrapper}>
        <Svg width="100%" height={260} viewBox="0 0 600 260" fill="none">
          <Path
            d="M 0 200 Q 300 240 600 200"
            stroke="#F47738"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
          <Path
            d="M 20 220 Q 300 180 580 220"
            stroke="#FF8C42"
            strokeWidth="2"
            strokeOpacity="0.6"
          />
        </Svg>
      </View>

      <View style={styles.centerBox}>
        {/* Animated 3D ASKME Ceramic Emblem */}
        <AskMeLogo size={74} showText={true} animated={true} />

        {/* Tagline text (concept2_logo_loading_animation.jpg) */}
        <Animated.View style={[styles.taglineBox, { opacity: textOpacity }]}>
          <Text style={styles.taglineLine1}>
            Analyzing. Identifying. Writing. Sending.
          </Text>
          <Text style={styles.taglineLine2}>
            Your voice. Our responsibility.
          </Text>
        </Animated.View>

        {/* Loading Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressText}>Loading civic intelligence...</Text>
            <Text style={styles.progressPercentText}>100%</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0D0D0C',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  energyLinesWrapper: {
    position: 'absolute',
    width: '100%',
    bottom: '15%',
    alignItems: 'center',
    opacity: 0.8,
  },
  centerBox: {
    alignItems: 'center',
    width: 320,
    zIndex: 10,
  },
  taglineBox: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 28,
  },
  taglineLine1: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A8A49D',
    marginBottom: 4,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  taglineLine2: {
    fontSize: 12,
    color: '#77736E',
    fontFamily: THEME.fonts.mono,
  },
  progressContainer: {
    width: 240,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#F47738',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 10,
    color: '#77736E',
    fontFamily: THEME.fonts.mono,
  },
  progressPercentText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F47738',
    fontFamily: THEME.fonts.mono,
  },
});
