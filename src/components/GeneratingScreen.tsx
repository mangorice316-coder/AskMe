import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Sparkles, Cpu, FileText } from 'lucide-react-native';

export default function GeneratingScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Pulsing central icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Rotating outer ring effect
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // Scanning line effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Loading dots sequence
    const animateDot = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.delay(400),
        ])
      ).start();
    };

    animateDot(dot1Opacity, 0);
    animateDot(dot2Opacity, 300);
    animateDot(dot3Opacity, 600);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scanTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 30],
  });

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        {/* Outer rotating dashed ring */}
        <Animated.View style={[styles.outerRing, { transform: [{ rotate: spin }] }]} />
        
        {/* Inner pulsing container */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Cpu size={40} color="#2dd4bf" strokeWidth={1.5} />
          
          {/* Scanning line overlay */}
          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanTranslateY }] }]} />
        </Animated.View>

        {/* Orbiting particles */}
        <Animated.View style={[styles.particle, styles.particle1, { transform: [{ rotate: spin }] }]} />
        <Animated.View style={[styles.particle, styles.particle2, { transform: [{ rotate: spin }] }]} />
      </View>

      <Text style={styles.title}>AI is Drafting Your Complaint</Text>
      
      <View style={styles.loadingDotsRow}>
        <Text style={styles.subtitle}>Analyzing details and legal references</Text>
        <View style={styles.dotsContainer}>
          <Animated.Text style={[styles.dot, { opacity: dot1Opacity }]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dot2Opacity }]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dot3Opacity }]}>.</Animated.Text>
        </View>
      </View>

      <View style={styles.processSteps}>
        <View style={styles.processStep}>
          <Sparkles size={16} color="#0d9488" style={styles.stepIcon} />
          <Text style={styles.stepText}>Structuring formal letter</Text>
        </View>
        <View style={styles.processStep}>
          <FileText size={16} color="#0d9488" style={styles.stepIcon} />
          <Text style={styles.stepText}>Injecting civic codes</Text>
        </View>
        <View style={styles.processStep}>
          <Sparkles size={16} color="#0d9488" style={styles.stepIcon} />
          <Text style={styles.stepText}>Applying requested tone</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  animationContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  outerRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(13, 148, 136, 0.3)',
    borderStyle: 'dashed',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#2dd4bf',
    shadowColor: '#2dd4bf',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2dd4bf',
  },
  particle1: {
    top: 0,
    left: 66,
  },
  particle2: {
    bottom: 0,
    right: 66,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  loadingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  subtitle: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 2,
    width: 20,
  },
  dot: {
    color: '#a1a1aa',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  processSteps: {
    width: '100%',
    maxWidth: 240,
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    gap: 12,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    marginRight: 12,
  },
  stepText: {
    color: '#d4d4d8',
    fontSize: 13,
  },
});
