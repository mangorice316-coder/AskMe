import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Camera, Sparkles, Building2, FileCheck } from 'lucide-react-native';
import { THEME } from '../theme/tokens';

const STAGES = [
  {
    num: '01',
    title: 'REPORT',
    sub: 'Show us what’s happening.',
    desc: 'Capture a photo, speak in your mother tongue, or type a simple description of the problem.',
    icon: Camera,
  },
  {
    num: '02',
    title: 'UNDERSTAND',
    sub: 'AI analyzes your complaint and evidence.',
    desc: 'Multimodal intelligence separates facts from visual observations and assesses civic severity.',
    icon: Sparkles,
  },
  {
    num: '03',
    title: 'IDENTIFY',
    sub: 'Find the appropriate authority.',
    desc: 'Resolves exact administrative jurisdiction (NHAI vs PWD vs Municipal Ward) using verified records.',
    icon: Building2,
  },
  {
    num: '04',
    title: 'PREPARE',
    sub: 'Generate your complaint letter.',
    desc: 'Builds a statutory formal petition with legal references, PDF export, and verified portal routing.',
    icon: FileCheck,
  },
];

export default function HowItWorks() {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <View style={styles.eyebrowBadge}>
          <Text style={styles.eyebrowText}>SYSTEM WORKFLOW</Text>
        </View>
        <Text style={styles.headline}>From Problem to Action.</Text>
        <Text style={styles.subheadline}>
          A guided four-stage workflow that transforms an everyday civic hazard into a formal, legally grounded government representation.
        </Text>
      </View>

      {/* Progress Track */}
      <View style={styles.trackLine}>
        <View
          style={[
            styles.trackFill,
            { width: `${((activeStage + 1) / STAGES.length) * 100}%` },
          ]}
        />
      </View>

      {/* Double-Bezel Nested Stages Grid */}
      <View style={styles.stagesRow}>
        {STAGES.map((st, idx) => {
          const isActive = idx === activeStage;
          const StageIcon = st.icon;

          return (
            <TouchableOpacity
              key={st.num}
              style={[
                styles.bezelShell,
                isActive && styles.bezelShellActive,
              ]}
              onPress={() => setActiveStage(idx)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Stage ${st.num}: ${st.title}`}
            >
              <View
                style={[
                  styles.bezelCore,
                  isActive && styles.bezelCoreActive,
                ]}
              >
                <View style={styles.cardTop}>
                  <Text
                    style={[
                      styles.stageNum,
                      isActive && styles.stageNumActive,
                    ]}
                  >
                    {st.num}
                  </Text>
                  <View
                    style={[
                      styles.iconCircle,
                      isActive && styles.iconCircleActive,
                    ]}
                  >
                    <StageIcon
                      size={15}
                      color={isActive ? '#FFFFFF' : THEME.colors.secondaryText}
                    />
                  </View>
                </View>

                <Text
                  style={[
                    styles.stageTitle,
                    isActive && styles.stageTitleActive,
                  ]}
                >
                  {st.title}
                </Text>
                <Text style={styles.stageSub}>{st.sub}</Text>
                <Text style={styles.stageDesc}>{st.desc}</Text>

                {isActive && (
                  <View style={styles.activeFooter}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeText}>ACTIVE PHASE</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 64,
    paddingHorizontal: 20,
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
  },
  headerBlock: {
    marginBottom: 36,
  },
  eyebrowBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: THEME.radii.pill,
    backgroundColor: THEME.colors.softOrange,
    borderWidth: 1,
    borderColor: THEME.colors.softOrangeBorder,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  eyebrowText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1,
    color: THEME.colors.brandOrange,
    fontFamily: THEME.fonts.mono,
  },
  headline: {
    fontSize: 34,
    fontWeight: '900',
    color: THEME.colors.primaryText,
    letterSpacing: -0.8,
    marginBottom: 10,
    fontFamily: THEME.fonts.heading,
  },
  subheadline: {
    fontSize: 16,
    color: THEME.colors.secondaryText,
    lineHeight: 25,
    maxWidth: 620,
    fontFamily: THEME.fonts.body,
  },
  trackLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#EAE5DD',
    borderRadius: 1.5,
    marginBottom: 28,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: THEME.colors.brandOrange,
    borderRadius: 1.5,
  },
  stagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  bezelShell: {
    flex: 1,
    minWidth: 200,
    padding: 3,
    borderRadius: THEME.radii.xl,
    backgroundColor: 'rgba(21, 21, 20, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(21, 21, 20, 0.05)',
  },
  bezelShellActive: {
    backgroundColor: 'rgba(244, 119, 56, 0.12)',
    borderColor: 'rgba(244, 119, 56, 0.25)',
  },
  bezelCore: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radii.lg,
    padding: 22,
    height: '100%',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  bezelCoreActive: {
    borderColor: THEME.colors.softOrangeBorder,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  stageNum: {
    fontSize: 26,
    fontWeight: '900',
    color: '#D4CEBF',
    fontFamily: THEME.fonts.mono,
  },
  stageNumActive: {
    color: THEME.colors.brandOrange,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F3ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    backgroundColor: THEME.colors.brandOrange,
  },
  stageTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.colors.secondaryText,
    letterSpacing: 0.6,
    marginBottom: 4,
    fontFamily: THEME.fonts.heading,
  },
  stageTitleActive: {
    color: THEME.colors.primaryText,
  },
  stageSub: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primaryText,
    marginBottom: 8,
    lineHeight: 18,
    fontFamily: THEME.fonts.body,
  },
  stageDesc: {
    fontSize: 12,
    color: THEME.colors.secondaryText,
    lineHeight: 17,
    fontFamily: THEME.fonts.body,
  },
  activeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.brandOrange,
  },
  activeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: THEME.colors.brandOrange,
    fontFamily: THEME.fonts.mono,
  },
});
