import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 42, showText = true }: LogoProps) {
  return (
    <View style={[styles.container, { height: size }]}>
      <View style={[styles.iconWrapper, { width: size, height: size, borderRadius: size / 3 }]}>
        <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#2dd4bf" />
              <Stop offset="1" stopColor="#0ea5e9" />
            </LinearGradient>
          </Defs>
          {/* A glowing broadcast / megaphone icon representing "Voice" (Kurali) */}
          <Path 
            d="M11 5L6 9H2V15H6L11 19V5Z" 
            stroke="url(#grad)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <Path 
            d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" 
            stroke="url(#grad)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <Path 
            d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" 
            stroke="url(#grad)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </Svg>
      </View>
      
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.tamilText, { fontSize: size * 0.48 }]}>ஊர் குரலி</Text>
          <Text style={[styles.englishText, { fontSize: size * 0.22 }]}>OOR KURALI</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(45, 212, 191, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2dd4bf',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  textContainer: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  tamilText: {
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: 0.5,
    includeFontPadding: false,
    lineHeight: undefined,
  },
  englishText: {
    color: '#2dd4bf',
    fontWeight: 'bold',
    letterSpacing: 3,
    marginTop: 2,
    includeFontPadding: false,
  },
});
