import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import {
  Camera,
  Mic,
  MapPin,
  Building2,
  ShieldCheck,
  FileCheck,
} from 'lucide-react-native';
import { THEME } from '../theme/tokens';

export default function FeatureGrid() {
  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <View style={styles.eyebrowBadge}>
          <Text style={styles.eyebrowText}>SYSTEM CAPABILITIES</Text>
        </View>
        <Text style={styles.headline}>Visual clarity. Purposeful intelligence.</Text>
        <Text style={styles.subheadline}>
          Engineered to give everyday citizens the structural capability of a seasoned municipal liaison.
        </Text>
      </View>

      {/* Asymmetrical Bento Grid with Double-Bezel Architecture */}
      <View style={styles.bentoGrid}>
        {/* Bento Card 1: Wide Card - Photo Intelligence */}
        <View style={[styles.bentoShell, styles.wideShell]}>
          <View style={styles.bentoCore}>
            <View style={styles.cardTopRow}>
              <View style={styles.iconCircle}>
                <Camera size={17} color={THEME.colors.brandOrange} />
              </View>
              <View style={styles.microPill}>
                <Text style={styles.microPillText}>MULTIMODAL COMPUTER VISION</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>Photo Intelligence</Text>
            <Text style={styles.cardSub}>Understand civic problems directly from images.</Text>
            <Text style={styles.cardDesc}>
              Deep visual models evaluate road craters, hazardous asphalt cracks, and uncollected waste heaps, measuring damage scale and civic severity without requiring manual measurements.
            </Text>
          </View>
        </View>

        {/* Bento Card 2: Compact Card - Voice Reporting */}
        <View style={[styles.bentoShell, styles.compactShell]}>
          <View style={styles.bentoCore}>
            <View style={styles.cardTopRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#EBF6F0' }]}>
                <Mic size={17} color={THEME.colors.success} />
              </View>
              <View style={[styles.microPill, { backgroundColor: '#EBF6F0', borderColor: '#CDEBDD' }]}>
                <Text style={[styles.microPillText, { color: THEME.colors.success }]}>ACOUSTIC SPEECH</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>Voice Reporting</Text>
            <Text style={styles.cardSub}>Explain the issue naturally.</Text>
            <Text style={styles.cardDesc}>
              Speak in regional Indian languages. Dynamic acoustic spectrum processing transcribes, structures, and converts conversational audio into statutory points.
            </Text>
          </View>
        </View>

        {/* Bento Card 3: Compact Card - Smart Location */}
        <View style={[styles.bentoShell, styles.compactShell]}>
          <View style={styles.bentoCore}>
            <View style={styles.cardTopRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                <MapPin size={17} color="#2563EB" />
              </View>
              <View style={[styles.microPill, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <Text style={[styles.microPillText, { color: '#2563EB' }]}>GEOSPATIAL EXIF</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>Smart Location</Text>
            <Text style={styles.cardSub}>Identify where the problem happened.</Text>
            <Text style={styles.cardDesc}>
              Extracts precise EXIF GPS metadata from your photographs or device telemetry, strictly separating problem coordinates from private residential addresses.
            </Text>
          </View>
        </View>

        {/* Bento Card 4: Wide Card - Authority Detection (Highlighted Accent) */}
        <View style={[styles.bentoShell, styles.wideShell]}>
          <View style={[styles.bentoCore, styles.accentBentoCore]}>
            <View style={styles.cardTopRow}>
              <View style={[styles.iconCircle, { backgroundColor: THEME.colors.brandOrange }]}>
                <Building2 size={17} color="#FFFFFF" />
              </View>
              <View style={[styles.microPill, { backgroundColor: '#FFF5EF', borderColor: THEME.colors.brandOrange }]}>
                <Text style={[styles.microPillText, { color: THEME.colors.brandOrange }]}>STATUTORY JURISDICTION</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>Authority Detection Engine</Text>
            <Text style={styles.cardSub}>Find the exact statutory department responsible.</Text>
            <Text style={styles.cardDesc}>
              Our hybrid directory algorithm resolves bureaucratic confusion between National Highways (NHAI), State Highways (PWD), and Municipal Ward Engineering divisions, routing directly to official portals.
            </Text>
          </View>
        </View>

        {/* Bento Card 5: Compact Card - Evidence Assistance */}
        <View style={[styles.bentoShell, styles.compactShell]}>
          <View style={styles.bentoCore}>
            <View style={styles.cardTopRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF8EA' }]}>
                <ShieldCheck size={17} color={THEME.colors.warning} />
              </View>
              <View style={[styles.microPill, { backgroundColor: '#FEF8EA', borderColor: '#FDE68A' }]}>
                <Text style={[styles.microPillText, { color: '#B45309' }]}>FACT SEPARATION</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>Evidence Assistance</Text>
            <Text style={styles.cardSub}>Know what extra information is needed.</Text>
            <Text style={styles.cardDesc}>
              Conversational clarification requests prompt for crucial missing landmarks or road classification details only when genuinely needed to prevent rejection.
            </Text>
          </View>
        </View>

        {/* Bento Card 6: Compact Card - AI Letter Generation */}
        <View style={[styles.bentoShell, styles.compactShell]}>
          <View style={styles.bentoCore}>
            <View style={styles.cardTopRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#FAF5FF' }]}>
                <FileCheck size={17} color="#9333EA" />
              </View>
              <View style={[styles.microPill, { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' }]}>
                <Text style={[styles.microPillText, { color: '#9333EA' }]}>STATUTORY PETITION</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>AI Letter Generation</Text>
            <Text style={styles.cardSub}>Prepare a formal complaint.</Text>
            <Text style={styles.cardDesc}>
              Assembles dignified, legally sound formal petitions complete with statutory references, tone adjustments (*Formal, Assertive, Urgent, Legal*), and PDF downloads.
            </Text>
          </View>
        </View>
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
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  bentoShell: {
    padding: 3,
    borderRadius: THEME.radii.xl,
    backgroundColor: 'rgba(21, 21, 20, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(21, 21, 20, 0.05)',
  },
  wideShell: {
    flex: 2,
    minWidth: 320,
  },
  compactShell: {
    flex: 1,
    minWidth: 260,
  },
  bentoCore: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radii.lg,
    padding: 24,
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  accentBentoCore: {
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.brandOrange,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.softOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  microPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radii.xs,
    backgroundColor: THEME.colors.softOrange,
    borderWidth: 1,
    borderColor: THEME.colors.softOrangeBorder,
  },
  microPillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: THEME.colors.brandOrange,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.primaryText,
    marginBottom: 4,
    fontFamily: THEME.fonts.heading,
  },
  cardSub: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.secondaryText,
    marginBottom: 10,
    fontFamily: THEME.fonts.body,
  },
  cardDesc: {
    fontSize: 13,
    color: THEME.colors.secondaryText,
    lineHeight: 20,
    fontFamily: THEME.fonts.body,
  },
});
