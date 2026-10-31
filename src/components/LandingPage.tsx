import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  ArrowRight,
  Play,
  Camera,
  Mic,
  FileText,
  Search,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';
import { THEME } from '../theme/tokens';
import AskMeLogo from './AskMeLogo';
import HeroIllustration from './HeroIllustration';
import Footer from './Footer';
import { soundFx } from '../utils/soundEffects';

interface LandingPageProps {
  onStartReport: () => void;
  onExploreHowItWorks?: () => void;
}

export default function LandingPage({ onStartReport }: LandingPageProps) {
  const scrollRef = useRef<ScrollView>(null);

  const scrollToHowItWorks = () => {
    soundFx.playClick();
    scrollRef.current?.scrollTo({ y: 700, animated: true });
  };

  const handleStart = () => {
    soundFx.playClick();
    onStartReport();
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ================= 1. ULTRA CINEMATIC HERO SECTION ================= */}
      {/* Matches concept2_landing_hero.jpg exactly */}
      <View style={styles.heroSection}>
        <View style={styles.heroGrid}>
          {/* Left Column: Headlines & Actions */}
          <View style={styles.heroLeftCol}>
            {/* Display Headline */}
            <Text style={styles.heroHeadline}>
              Your City{'\n'}
              Has a Problem.{'\n'}
              Let's Make It{'\n'}
              <Text style={styles.heroHeadlineOrange}>Heard.</Text>
            </Text>

            {/* Concise Supporting Subtitle */}
            <Text style={styles.heroSubtext}>
              One photo, one voice, or one simple description. Let ASKME help you
              reach the right authority.
            </Text>

            {/* Call to Actions */}
            <View style={styles.heroCtaRow}>
              <TouchableOpacity
                style={styles.primaryReportBtn}
                onPress={handleStart}
                accessibilityRole="button"
                accessibilityLabel="Report a civic problem"
                activeOpacity={0.88}
              >
                <Text style={styles.primaryReportBtnText}>Report a Problem</Text>
                <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.discoverBtn}
                onPress={scrollToHowItWorks}
                accessibilityRole="button"
                accessibilityLabel="Discover how ASKME works"
                activeOpacity={0.8}
              >
                <Text style={styles.discoverBtnText}>Discover ASKME</Text>
                <View style={styles.playIconCircle}>
                  <Play size={10} color="#FFFFFF" fill="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Citizen Trust Accreditation */}
            <Text style={styles.trustIntro}>Trusted by citizens. Powered by AI.</Text>
          </View>

          {/* Right Column: Signature 3D Civic Signal Core with Orbiting Telemetry */}
          <View style={styles.heroRightCol}>
            <HeroIllustration />
          </View>
        </View>

        {/* Bottom Metrics Ticker Strip (concept2_landing_hero.jpg bottom row) */}
        <View style={styles.statsStrip}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>500K+</Text>
            <Text style={styles.statLabel}>Complaints Filed</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>200+</Text>
            <Text style={styles.statLabel}>Cities Covered</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>95%</Text>
            <Text style={styles.statLabel}>Resolution Rate</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>24x7</Text>
            <Text style={styles.statLabel}>AI Assistance</Text>
          </View>
        </View>
      </View>

      {/* ================= 2. HOW ASKME WORKS (5 CONNECTED STAGES) ================= */}
      {/* Matches askme_full_concept_board_2.png bottom-left */}
      <View style={styles.howItWorksSection} id="how-it-works">
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            How <Text style={{ color: '#F47738' }}>ASKME</Text> Works
          </Text>
          <Text style={styles.sectionSubtitle}>
            From neighborhood hazard to verified statutory submission in five seamless steps.
          </Text>
        </View>

        <View style={styles.stagesPipeline}>
          {/* Step 1: Report */}
          <View style={styles.stageCard}>
            <View style={styles.stageIconBox}>
              <Camera size={18} color="#F47738" />
            </View>
            <Text style={styles.stageTitle}>Report</Text>
            <Text style={styles.stageDesc}>
              Share the problem via photo, voice, or text description.
            </Text>
          </View>

          <View style={styles.pipelineArrow}>
            <ArrowRight size={14} color="#77736E" />
          </View>

          {/* Step 2: Analyze */}
          <View style={styles.stageCard}>
            <View style={styles.stageIconBox}>
              <Sparkles size={18} color="#F47738" />
            </View>
            <Text style={styles.stageTitle}>Analyze</Text>
            <Text style={styles.stageDesc}>
              AI analyzes and classifies severity and hazard impact.
            </Text>
          </View>

          <View style={styles.pipelineArrow}>
            <ArrowRight size={14} color="#77736E" />
          </View>

          {/* Step 3: Identify */}
          <View style={styles.stageCard}>
            <View style={styles.stageIconBox}>
              <Search size={18} color="#F47738" />
            </View>
            <Text style={styles.stageTitle}>Identify</Text>
            <Text style={styles.stageDesc}>
              We find the exact statutory authority with real jurisdiction.
            </Text>
          </View>

          <View style={styles.pipelineArrow}>
            <ArrowRight size={14} color="#77736E" />
          </View>

          {/* Step 4: Generate */}
          <View style={styles.stageCard}>
            <View style={styles.stageIconBox}>
              <FileText size={18} color="#F47738" />
            </View>
            <Text style={styles.stageTitle}>Generate</Text>
            <Text style={styles.stageDesc}>
              We draft a formal grievance letter with legal citations.
            </Text>
          </View>

          <View style={styles.pipelineArrow}>
            <ArrowRight size={14} color="#77736E" />
          </View>

          {/* Step 5: Send */}
          <View style={styles.stageCard}>
            <View style={styles.stageIconBox}>
              <Send size={18} color="#F47738" />
            </View>
            <Text style={styles.stageTitle}>Send</Text>
            <Text style={styles.stageDesc}>
              Submit to official portals (CPGRAMS, Swachhata, BBMP, NHAI).
            </Text>
          </View>
        </View>
      </View>

      {/* ================= 3. REPORT IT YOUR WAY (3-CARD BENTO) ================= */}
      {/* Matches concept2_reporting_method_cards.jpg */}
      <View style={styles.reportYourWaySection} id="report-your-way">
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Report It <Text style={{ color: '#F47738' }}>Your Way</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>
            Your voice. Your choice. Your impact. Choose how you want to document the issue.
          </Text>
        </View>

        <View style={styles.bentoRow}>
          {/* Card 1: Photo */}
          <TouchableOpacity
            style={styles.methodCard}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <View style={styles.methodCardHeader}>
              <View style={styles.methodIconCircle}>
                <Camera size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodCardTitle}>Photo</Text>
                <Text style={styles.methodCardSub}>Capture or upload a photo</Text>
              </View>
            </View>

            <View style={styles.methodPreviewArea}>
              <View style={styles.mockViewfinder}>
                <View style={styles.crosshair} />
                <Text style={styles.mockViewfinderText}>EXIF GPS AUTO-DETECTION</Text>
              </View>
            </View>

            <View style={styles.cardFooterAction}>
              <Text style={styles.cardActionLabel}>Upload Evidence</Text>
              <View style={styles.circleActionArrow}>
                <ArrowRight size={12} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2: Voice */}
          <TouchableOpacity
            style={styles.methodCard}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <View style={styles.methodCardHeader}>
              <View style={[styles.methodIconCircle, styles.voiceActiveGlow]}>
                <Mic size={18} color="#F47738" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodCardTitle}>Voice</Text>
                <Text style={styles.methodCardSub}>Record your complaint</Text>
              </View>
            </View>

            <View style={styles.methodPreviewArea}>
              <View style={styles.mockWaveform}>
                {[12, 28, 42, 18, 36, 48, 22, 38, 14, 30].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      { height: h, backgroundColor: i % 2 === 0 ? '#F47738' : '#FF8C42' },
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.cardFooterAction}>
              <Text style={styles.cardActionLabel}>Speak in Native Language</Text>
              <View style={styles.circleActionArrow}>
                <ArrowRight size={12} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 3: Text */}
          <TouchableOpacity
            style={styles.methodCard}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <View style={styles.methodCardHeader}>
              <View style={styles.methodIconCircle}>
                <FileText size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodCardTitle}>Text</Text>
                <Text style={styles.methodCardSub}>Type your problem</Text>
              </View>
            </View>

            <View style={styles.methodPreviewArea}>
              <View style={styles.mockNote}>
                <Text style={styles.mockNoteText}>
                  "Street lights not working in our area for the past week, creating serious public safety risks..."
                </Text>
              </View>
            </View>

            <View style={styles.cardFooterAction}>
              <Text style={styles.cardActionLabel}>Write Short Note</Text>
              <View style={styles.circleActionArrow}>
                <ArrowRight size={12} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= 4. CINEMATIC CLOSING BANNER ================= */}
      <View style={styles.closingBanner}>
        <AskMeLogo size={60} showText={false} animated={true} />
        <Text style={styles.closingHeadline}>
          Your Voice Deserves to Be Heard.
        </Text>
        <Text style={styles.closingSubtext}>
          Join thousands of active citizens transforming civic problems into legally
          sound petitions submitted directly to verified authorities.
        </Text>
        <TouchableOpacity
          style={styles.closingCta}
          onPress={handleStart}
          accessibilityRole="button"
          accessibilityLabel="Start your grievance complaint"
          activeOpacity={0.88}
        >
          <Text style={styles.closingCtaText}>Start Your Complaint</Text>
          <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* ================= 5. MINIMAL DECLASSIFIED FOOTER ================= */}
      <Footer
        onNavigateHome={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        onNavigateHowItWorks={scrollToHowItWorks}
        onNavigateReport={onStartReport}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0C',
  },
  content: {
    paddingBottom: 0,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 44,
    maxWidth: 1180,
    width: '100%',
    alignSelf: 'center',
  },
  heroGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
  },
  heroLeftCol: {
    flex: 1,
    maxWidth: 560,
    zIndex: 2,
  },
  heroHeadline: {
    fontSize: Platform.OS === 'web' ? 52 : 36,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: Platform.OS === 'web' ? 58 : 42,
    letterSpacing: -1.2,
    marginBottom: 20,
    fontFamily: Platform.OS === 'web' ? 'Sora, Space Grotesk, sans-serif' : undefined,
  },
  heroHeadlineOrange: {
    color: '#F47738',
  },
  heroSubtext: {
    fontSize: 16,
    color: '#A8A49D',
    lineHeight: 26,
    marginBottom: 32,
    maxWidth: 480,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  heroCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  primaryReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F47738',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: THEME.radii.pill,
    shadowColor: '#F47738',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 6,
  },
  primaryReportBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  discoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  discoverBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  playIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustIntro: {
    fontSize: 12,
    fontWeight: '600',
    color: '#77736E',
    letterSpacing: 0.4,
    fontFamily: THEME.fonts.mono,
  },
  heroRightCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 320,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 40,
    paddingVertical: 20,
    paddingHorizontal: 28,
    backgroundColor: 'rgba(26, 26, 24, 0.65)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
    minWidth: 110,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A8A49D',
    marginTop: 3,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  howItWorksSection: {
    paddingHorizontal: 24,
    paddingVertical: 64,
    maxWidth: 1180,
    width: '100%',
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  sectionHeader: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 44,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginBottom: 10,
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#A8A49D',
    textAlign: 'center',
    maxWidth: 580,
    lineHeight: 23,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  stagesPipeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  stageCard: {
    flex: 1,
    minWidth: 170,
    backgroundColor: 'rgba(26, 26, 24, 0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stageIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(244, 119, 56, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  stageDesc: {
    fontSize: 12,
    color: '#8E8A83',
    lineHeight: 18,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  pipelineArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  reportYourWaySection: {
    paddingHorizontal: 24,
    paddingVertical: 64,
    maxWidth: 1180,
    width: '100%',
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  bentoRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 20,
  },
  methodCard: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 24, 0.7)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'space-between',
    minHeight: 280,
  },
  methodCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  methodIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  voiceActiveGlow: {
    backgroundColor: 'rgba(244, 119, 56, 0.15)',
    borderColor: 'rgba(244, 119, 56, 0.4)',
  },
  methodCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  methodCardSub: {
    fontSize: 12,
    color: '#8E8A83',
    marginTop: 2,
  },
  methodPreviewArea: {
    height: 100,
    backgroundColor: '#121211',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 20,
  },
  mockViewfinder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  crosshair: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: '#F47738',
    borderRadius: 4,
    marginBottom: 8,
  },
  mockViewfinderText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F47738',
    letterSpacing: 1,
    fontFamily: THEME.fonts.mono,
  },
  mockWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: '100%',
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  mockNote: {
    width: '100%',
    justifyContent: 'center',
  },
  mockNoteText: {
    fontSize: 11,
    color: '#A8A49D',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  cardFooterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 14,
  },
  cardActionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  circleActionArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closingBanner: {
    marginHorizontal: 24,
    marginVertical: 48,
    padding: 48,
    borderRadius: 28,
    backgroundColor: '#161615',
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.25)',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: 1000,
    width: '92%',
    alignSelf: 'center',
  },
  closingHeadline: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.6,
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  closingSubtext: {
    fontSize: 15,
    color: '#A8A49D',
    textAlign: 'center',
    maxWidth: 580,
    lineHeight: 24,
    marginBottom: 32,
  },
  closingCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F47738',
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: THEME.radii.pill,
    shadowColor: '#F47738',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 6,
  },
  closingCtaText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
