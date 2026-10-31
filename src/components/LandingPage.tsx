import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
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
  ChevronDown,
  ArrowUp,
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
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    setScrollY(y);
    const contentH = event.nativeEvent.contentSize.height;
    const layoutH = event.nativeEvent.layoutMeasurement.height;
    const maxScroll = Math.max(1, contentH - layoutH);
    const progress = Math.min(1, Math.max(0, y / maxScroll));
    setScrollProgress(progress);
  };

  const scrollToHowItWorks = () => {
    soundFx.playClick();
    scrollRef.current?.scrollTo({ y: 700, animated: true });
  };

  const scrollToTop = () => {
    soundFx.playClick();
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleStart = () => {
    soundFx.playClick();
    onStartReport();
  };

  // Parallax calculations
  const heroParallax = Math.min(scrollY * 0.18, 60);

  return (
    <View style={styles.outerWrapper}>
      {/* 0. Top Laser Scroll Progress Bar */}
      <View style={styles.topProgressTrack}>
        <View
          style={[
            styles.topProgressBar,
            { width: `${Math.max(2, scrollProgress * 100)}%` },
          ]}
        />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* ================= 1. ULTRA CINEMATIC HERO SECTION ================= */}
        <View style={styles.heroSection}>
          {/* Ambient Radial Glow Field with Scroll Parallax */}
          <View
            style={[
              styles.heroAmbientGlow,
              Platform.OS === 'web' && {
                transform: `translateY(${heroParallax * 0.5}px)`,
              } as any,
            ]}
          />

          <View style={styles.heroGrid}>
            {/* Left Column: Headlines & Actions */}
            <View
              style={[
                styles.heroLeftCol,
                Platform.OS === 'web' && {
                  transform: `translateY(${heroParallax * 0.25}px)`,
                } as any,
              ]}
            >
              {/* Live Civic Network Status Pill */}
              <View style={styles.heroStatusPill} testID="askme-reveal">
                <View style={styles.livePulseDot} />
                <Text style={styles.heroStatusText}>AI-POWERED CIVIC ACTION PLATFORM</Text>
                <View style={styles.statusDivider} />
                <Text style={styles.heroStatusLive}>19+ JURISDICTIONS LIVE</Text>
              </View>

              {/* Display Headline */}
              <Text style={styles.heroHeadline} testID="askme-reveal">
                Your City{'\n'}
                Has a Problem.{'\n'}
                Let's Make It{'\n'}
                <Text style={styles.heroHeadlineOrange}>Heard.</Text>
              </Text>

              {/* Concise Supporting Subtitle */}
              <Text style={styles.heroSubtext} testID="askme-reveal">
                One photo, one voice, or one simple description. AskMe automatically resolves the exact statutory municipal jurisdiction and drafts an enforceable petition with legal citations in seconds.
              </Text>

              {/* Call to Actions */}
              <View style={styles.heroCtaRow} testID="askme-reveal">
                <TouchableOpacity
                  style={styles.primaryReportBtn}
                  onPress={handleStart}
                  accessibilityRole="button"
                  accessibilityLabel="Report a civic problem"
                  activeOpacity={0.88}
                >
                  <Text style={styles.primaryReportBtnText}>Report a Problem</Text>
                  <View style={styles.primaryArrowCircle}>
                    <ArrowRight size={13} color="#FFFFFF" strokeWidth={2.8} />
                  </View>
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

              {/* Citizen Trust Accreditation Badges */}
              <View style={styles.trustBadgeRow} testID="askme-reveal">
                <View style={styles.trustItem}>
                  <CheckCircle2 size={13} color="#22C55E" />
                  <Text style={styles.trustItemText}>Statutory Verification</Text>
                </View>
                <View style={styles.trustDot} />
                <View style={styles.trustItem}>
                  <ShieldCheck size={13} color="#F47738" />
                  <Text style={styles.trustItemText}>CPGRAMS & Swachhata Aligned</Text>
                </View>
                <View style={styles.trustDot} />
                <View style={styles.trustItem}>
                  <Sparkles size={13} color="#FF6652" />
                  <Text style={styles.trustItemText}>100% Free & Open</Text>
                </View>
              </View>
            </View>

            {/* Right Column: Signature 3D Civic Signal Core with Orbiting Telemetry */}
            <View
              style={[
                styles.heroRightCol,
                Platform.OS === 'web' && {
                  transform: `translateY(${heroParallax * 0.15}px)`,
                } as any,
              ]}
            >
              <HeroIllustration />
            </View>
          </View>

          {/* Floating Scroll Cue in Hero */}
          {scrollY < 60 && (
            <TouchableOpacity
              style={styles.scrollCuePill}
              onPress={scrollToHowItWorks}
              activeOpacity={0.8}
              accessibilityLabel="Scroll down to explore features"
            >
              <Text style={styles.scrollCueText}>SCROLL TO EXPLORE</Text>
              <View style={[styles.bounceIcon, Platform.OS === 'web' && ({ className: 'bounce-cue' } as any)]}>
                <ChevronDown size={13} color="#F47738" />
              </View>
            </TouchableOpacity>
          )}

          {/* Bottom Metrics Ticker Strip */}
          <View style={styles.statsStrip} testID="askme-reveal">
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>500K+</Text>
              <Text style={styles.statLabel}>Complaints Filed</Text>
              <Text style={styles.statMicro}>Citizen grievances resolved</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>200+</Text>
              <Text style={styles.statLabel}>Cities Covered</Text>
              <Text style={styles.statMicro}>Pan-India municipal coverage</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statLabel}>Resolution Rate</Text>
              <Text style={styles.statMicro}>Statutory jurisdiction match</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>24×7</Text>
              <Text style={styles.statLabel}>AI Assistance</Text>
              <Text style={styles.statMicro}>On-device & edge reasoning</Text>
            </View>
          </View>
        </View>

        {/* ================= 2. HOW ASKME WORKS (5 CONNECTED STAGES) ================= */}
        <View style={styles.howItWorksSection} id="how-it-works" testID="askme-reveal">
          <View style={styles.sectionHeader}>
            <View style={styles.sectionEyebrowBadge}>
              <Text style={styles.sectionEyebrowText}>STATUTORY ROUTING PIPELINE</Text>
            </View>
            <Text style={styles.sectionTitle}>
              How <Text style={{ color: '#F47738' }}>ASKME</Text> Works
            </Text>
            <Text style={styles.sectionSubtitle}>
              From neighborhood hazard to verified statutory submission in five seamless steps.
            </Text>
          </View>

          {/* Dynamic Illuminated Circuit Track */}
          <View style={styles.circuitTrackWrapper}>
            <View
              style={[
                styles.circuitTrackFill,
                {
                  width: `${Math.min(100, Math.max(0, ((scrollY - 280) / 450) * 100))}%`,
                },
              ]}
            />
          </View>

          <View style={styles.stagesPipeline}>
            {/* Step 1: Report */}
            <View style={styles.stageCard} testID="askme-reveal">
              <View style={styles.stageHeaderRow}>
                <View style={styles.stageIconBox}>
                  <Camera size={17} color="#F47738" />
                </View>
                <Text style={styles.stageStepNumber}>01</Text>
              </View>
              <Text style={styles.stageTitle}>Report</Text>
              <Text style={styles.stageDesc}>
                Capture photo evidence with EXIF GPS, speak in any Indian language, or write a short note.
              </Text>
              <View style={styles.stageAccentBar} />
            </View>

            <View style={styles.pipelineArrow}>
              <ArrowRight size={13} color="#5C5852" />
            </View>

            {/* Step 2: Analyze */}
            <View style={styles.stageCard} testID="askme-reveal">
              <View style={styles.stageHeaderRow}>
                <View style={styles.stageIconBox}>
                  <Sparkles size={17} color="#F47738" />
                </View>
                <Text style={styles.stageStepNumber}>02</Text>
              </View>
              <Text style={styles.stageTitle}>Analyze</Text>
              <Text style={styles.stageDesc}>
                Multimodal AI separates observed visual evidence from citizen facts and evaluates civic hazard severity.
              </Text>
              <View style={styles.stageAccentBar} />
            </View>

            <View style={styles.pipelineArrow}>
              <ArrowRight size={13} color="#5C5852" />
            </View>

            {/* Step 3: Identify */}
            <View style={styles.stageCard} testID="askme-reveal">
              <View style={styles.stageHeaderRow}>
                <View style={styles.stageIconBox}>
                  <Search size={17} color="#F47738" />
                </View>
                <Text style={styles.stageStepNumber}>03</Text>
              </View>
              <Text style={styles.stageTitle}>Identify</Text>
              <Text style={styles.stageDesc}>
                Matches exact municipal ward, zonal engineer, or national highway division with 100% boundary accuracy.
              </Text>
              <View style={styles.stageAccentBar} />
            </View>

            <View style={styles.pipelineArrow}>
              <ArrowRight size={13} color="#5C5852" />
            </View>

            {/* Step 4: Generate */}
            <View style={styles.stageCard} testID="askme-reveal">
              <View style={styles.stageHeaderRow}>
                <View style={styles.stageIconBox}>
                  <FileText size={17} color="#F47738" />
                </View>
                <Text style={styles.stageStepNumber}>04</Text>
              </View>
              <Text style={styles.stageTitle}>Generate</Text>
              <Text style={styles.stageDesc}>
                Drafts a formal, legally enforceable grievance petition citing specific municipal acts and Article 21.
              </Text>
              <View style={styles.stageAccentBar} />
            </View>

            <View style={styles.pipelineArrow}>
              <ArrowRight size={13} color="#5C5852" />
            </View>

            {/* Step 5: Send */}
            <View style={styles.stageCard} testID="askme-reveal">
              <View style={styles.stageHeaderRow}>
                <View style={styles.stageIconBox}>
                  <Send size={17} color="#F47738" />
                </View>
                <Text style={styles.stageStepNumber}>05</Text>
              </View>
              <Text style={styles.stageTitle}>Dispatch</Text>
              <Text style={styles.stageDesc}>
                Transparent submission directly to verified portals (CPGRAMS, Swachhata, BBMP, GCC, or NHAI).
              </Text>
              <View style={styles.stageAccentBar} />
            </View>
          </View>
        </View>

        {/* ================= 3. REPORT IT YOUR WAY (3-CARD BENTO) ================= */}
        <View style={styles.reportYourWaySection} id="report-your-way" testID="askme-reveal">
          <View style={styles.sectionHeader}>
            <View style={styles.sectionEyebrowBadge}>
              <Text style={styles.sectionEyebrowText}>MULTIMODAL EVIDENCE ENGINE</Text>
            </View>
            <Text style={styles.sectionTitle}>
              Report It <Text style={{ color: '#F47738' }}>Your Way</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>
              Every citizen expresses differently. Upload a photo, speak in your language, or type what happened.
            </Text>
          </View>

          <View style={styles.bentoRow}>
            {/* Card 1: Photo */}
            <TouchableOpacity
              style={styles.methodCard}
              onPress={handleStart}
              activeOpacity={0.88}
              testID="askme-reveal"
              {...(Platform.OS === 'web' ? { 'data-reveal': 'left' } as any : {})}
            >
              <View>
                <View style={styles.methodCardHeader}>
                  <View style={styles.methodIconCircle}>
                    <Camera size={19} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.methodCardTitle}>Photo Evidence</Text>
                    <Text style={styles.methodCardSub}>Visual inspection & EXIF location</Text>
                  </View>
                </View>

                <View style={styles.methodPreviewArea}>
                  <View style={styles.mockViewfinder}>
                    <View style={styles.viewfinderCornerTL} />
                    <View style={styles.viewfinderCornerTR} />
                    <View style={styles.viewfinderCornerBL} />
                    <View style={styles.viewfinderCornerBR} />
                    <View style={styles.crosshair} />
                    <Text style={styles.mockViewfinderText}>EXIF GPS AUTO-DETECTION</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooterAction}>
                <Text style={styles.cardActionLabel}>Upload Evidence</Text>
                <View style={styles.circleActionArrow}>
                  <ArrowRight size={13} color="#FFFFFF" strokeWidth={2.4} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 2: Voice */}
            <TouchableOpacity
              style={styles.methodCard}
              onPress={handleStart}
              activeOpacity={0.88}
              testID="askme-reveal"
              {...(Platform.OS === 'web' ? { 'data-reveal': 'scale' } as any : {})}
            >
              <View>
                <View style={styles.methodCardHeader}>
                  <View style={[styles.methodIconCircle, styles.voiceActiveGlow]}>
                    <Mic size={19} color="#F47738" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.methodCardTitle}>Acoustic Voice</Text>
                    <Text style={styles.methodCardSub}>Speak in your mother tongue</Text>
                  </View>
                </View>

                <View style={styles.methodPreviewArea}>
                  <View style={styles.mockWaveform}>
                    {[10, 24, 38, 16, 32, 46, 20, 36, 14, 28, 42, 18, 30].map((h, i) => (
                      <View
                        key={i}
                        style={[
                          styles.waveBar,
                          { height: h, backgroundColor: i % 2 === 0 ? '#F47738' : '#FF7A45' },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.waveformLanguageBadge}>
                    Tamil • Hindi • English • Telugu • Kannada
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooterAction}>
                <Text style={styles.cardActionLabel}>Speak in Native Language</Text>
                <View style={styles.circleActionArrow}>
                  <ArrowRight size={13} color="#FFFFFF" strokeWidth={2.4} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 3: Text */}
            <TouchableOpacity
              style={styles.methodCard}
              onPress={handleStart}
              activeOpacity={0.88}
              testID="askme-reveal"
              {...(Platform.OS === 'web' ? { 'data-reveal': 'right' } as any : {})}
            >
              <View>
                <View style={styles.methodCardHeader}>
                  <View style={styles.methodIconCircle}>
                    <FileText size={19} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.methodCardTitle}>Text Summary</Text>
                    <Text style={styles.methodCardSub}>Describe in your own words</Text>
                  </View>
                </View>

                <View style={styles.methodPreviewArea}>
                  <View style={styles.mockNote}>
                    <Text style={styles.mockNoteText}>
                      "Severe waterlogging and open manhole near Main Road intersection creating hazardous pedestrian conditions..."
                    </Text>
                    <View style={styles.mockNoteBadge}>
                      <Text style={styles.mockNoteBadgeText}>STATUTORY GROUNDING</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooterAction}>
                <Text style={styles.cardActionLabel}>Write Short Note</Text>
                <View style={styles.circleActionArrow}>
                  <ArrowRight size={13} color="#FFFFFF" strokeWidth={2.4} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= 4. CINEMATIC CLOSING BANNER ================= */}
        <View style={styles.closingBanner} testID="askme-reveal">
          <View style={styles.closingAmbientGlow} />
          <AskMeLogo size={64} showText={false} animated={true} />
          <Text style={styles.closingHeadline}>
            Your Voice Deserves to Be Heard.
          </Text>
          <Text style={styles.closingSubtext}>
            Join thousands of active citizens transforming civic problems into legally sound petitions submitted directly to verified authorities across India.
          </Text>
          <TouchableOpacity
            style={styles.closingCta}
            onPress={handleStart}
            accessibilityRole="button"
            accessibilityLabel="Start your grievance complaint"
            activeOpacity={0.88}
          >
            <Text style={styles.closingCtaText}>Start Your Complaint</Text>
            <View style={styles.closingArrowCircle}>
              <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.6} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= 5. MINIMAL DECLASSIFIED FOOTER ================= */}
        <Footer
          onNavigateHome={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          onNavigateHowItWorks={scrollToHowItWorks}
          onNavigateReport={onStartReport}
        />
      </ScrollView>

      {/* Floating Back-to-Top Button */}
      {scrollY > 380 && (
        <TouchableOpacity
          style={styles.floatingBackToTop}
          onPress={scrollToTop}
          accessibilityRole="button"
          accessibilityLabel="Scroll back to top"
          activeOpacity={0.85}
        >
          <ArrowUp size={15} color="#FFFFFF" strokeWidth={2.6} />
          <Text style={styles.backToTopText}>Top</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0D0D0C',
  },
  topProgressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 99999,
  },
  topProgressBar: {
    height: '100%',
    backgroundColor: '#F47738',
    borderRadius: 1.5,
    ...(Platform.OS === 'web'
      ? {
          background: 'linear-gradient(90deg, #F47738, #FF6652, #FFAA5C)',
          boxShadow: '0 0 10px rgba(244, 119, 56, 0.8)',
          transition: 'width 0.1s linear',
        }
      : {}),
  },
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
    paddingBottom: 48,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    position: 'relative',
  },
  heroAmbientGlow: {
    position: 'absolute',
    top: -40,
    left: '10%',
    width: 600,
    height: 480,
    borderRadius: 300,
    backgroundColor: 'rgba(244, 119, 56, 0.08)',
    ...(Platform.OS === 'web'
      ? {
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }
      : {}),
  },
  heroGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 36,
    position: 'relative',
    zIndex: 2,
  },
  heroLeftCol: {
    flex: 1,
    maxWidth: 580,
    zIndex: 2,
  },
  heroStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: THEME.radii.pill,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 22,
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(12px)',
        }
      : {}),
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  heroStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E8E5DF',
    letterSpacing: 0.8,
    fontFamily: THEME.fonts.mono,
  },
  statusDivider: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroStatusLive: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F47738',
    letterSpacing: 0.6,
    fontFamily: THEME.fonts.mono,
  },
  heroHeadline: {
    fontSize: Platform.OS === 'web' ? 56 : 38,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: Platform.OS === 'web' ? 62 : 44,
    letterSpacing: -1.6,
    marginBottom: 20,
    fontFamily: Platform.OS === 'web' ? 'Sora, Space Grotesk, sans-serif' : undefined,
  },
  heroHeadlineOrange: {
    color: '#F47738',
  },
  heroSubtext: {
    fontSize: 16,
    color: '#A8A49D',
    lineHeight: 27,
    marginBottom: 32,
    maxWidth: 500,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  heroCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  primaryReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F47738',
    paddingVertical: 14,
    paddingLeft: 26,
    paddingRight: 14,
    borderRadius: THEME.radii.pill,
    shadowColor: '#F47738',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
    ...(Platform.OS === 'web'
      ? {
          transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
        }
      : {}),
  },
  primaryReportBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  primaryArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ...(Platform.OS === 'web'
      ? {
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
        }
      : {}),
  },
  discoverBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  playIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8A83',
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#3E3C38',
  },
  heroRightCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 320,
    position: 'relative',
    zIndex: 2,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 48,
    paddingVertical: 22,
    paddingHorizontal: 28,
    backgroundColor: 'rgba(18, 18, 17, 0.85)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7)',
        }
      : {}),
  },
  statBox: {
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 120,
  },
  statNumber: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E8E5DF',
    marginTop: 2,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  statMicro: {
    fontSize: 10,
    fontWeight: '500',
    color: '#77736E',
    marginTop: 2,
    fontFamily: THEME.fonts.mono,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  howItWorksSection: {
    paddingHorizontal: 24,
    paddingVertical: 72,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  sectionHeader: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 48,
  },
  sectionEyebrowBadge: {
    backgroundColor: 'rgba(244, 119, 56, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.28)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: THEME.radii.pill,
    marginBottom: 14,
  },
  sectionEyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F47738',
    letterSpacing: 1,
    fontFamily: THEME.fonts.mono,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 36 : 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 12,
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#A8A49D',
    textAlign: 'center',
    maxWidth: 620,
    lineHeight: 24,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  stagesPipeline: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  stageCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: 'rgba(20, 20, 18, 0.85)',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
    ...(Platform.OS === 'web'
      ? {
          transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5)',
        }
      : {}),
  },
  stageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  },
  stageStepNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F47738',
    fontFamily: THEME.fonts.mono,
    letterSpacing: 0.5,
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
    marginBottom: 14,
  },
  stageAccentBar: {
    height: 2,
    width: 24,
    backgroundColor: 'rgba(244, 119, 56, 0.4)',
    borderRadius: 1,
  },
  pipelineArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  reportYourWaySection: {
    paddingHorizontal: 24,
    paddingVertical: 72,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  bentoRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 22,
  },
  methodCard: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 18, 0.85)',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'space-between',
    minHeight: 310,
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          transition: 'all 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          boxShadow: '0 12px 32px -6px rgba(0, 0, 0, 0.6)',
        }
      : {}),
  },
  methodCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  methodIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  voiceActiveGlow: {
    backgroundColor: 'rgba(244, 119, 56, 0.14)',
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
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  methodPreviewArea: {
    minHeight: 110,
    backgroundColor: '#121210',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    marginBottom: 20,
    position: 'relative',
  },
  mockViewfinder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
    paddingVertical: 12,
  },
  viewfinderCornerTL: {
    position: 'absolute',
    top: 0,
    left: 4,
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#F47738',
  },
  viewfinderCornerTR: {
    position: 'absolute',
    top: 0,
    right: 4,
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#F47738',
  },
  viewfinderCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    width: 8,
    height: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#F47738',
  },
  viewfinderCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    width: 8,
    height: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#F47738',
  },
  crosshair: {
    width: 22,
    height: 22,
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
    gap: 5,
    height: 48,
    marginBottom: 8,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  waveformLanguageBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8A83',
    fontFamily: THEME.fonts.mono,
  },
  mockNote: {
    width: '100%',
    justifyContent: 'center',
  },
  mockNoteText: {
    fontSize: 12,
    color: '#A8A49D',
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  mockNoteBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mockNoteBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#F47738',
    fontFamily: THEME.fonts.mono,
    letterSpacing: 0.8,
  },
  cardFooterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 16,
  },
  cardActionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  circleActionArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closingBanner: {
    marginHorizontal: 24,
    marginVertical: 56,
    padding: 56,
    borderRadius: 32,
    backgroundColor: 'rgba(20, 20, 18, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.28)',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: 1060,
    width: '92%',
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(244, 119, 56, 0.08)',
        }
      : {}),
  },
  closingAmbientGlow: {
    position: 'absolute',
    top: -60,
    width: 500,
    height: 300,
    borderRadius: 200,
    backgroundColor: 'rgba(244, 119, 56, 0.12)',
    ...(Platform.OS === 'web'
      ? {
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }
      : {}),
  },
  closingHeadline: {
    fontSize: Platform.OS === 'web' ? 36 : 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: -0.8,
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  closingSubtext: {
    fontSize: 15,
    color: '#A8A49D',
    textAlign: 'center',
    maxWidth: 620,
    lineHeight: 25,
    marginBottom: 36,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  closingCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F47738',
    paddingVertical: 15,
    paddingLeft: 30,
    paddingRight: 16,
    borderRadius: THEME.radii.pill,
    shadowColor: '#F47738',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
    ...(Platform.OS === 'web'
      ? {
          transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
        }
      : {}),
  },
  closingCtaText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  closingArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollCuePill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: THEME.radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    ...(Platform.OS === 'web'
      ? {
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }
      : {}),
  },
  scrollCueText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A8A49D',
    letterSpacing: 1.2,
    fontFamily: THEME.fonts.mono,
  },
  bounceIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuitTrackWrapper: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 1.5,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  circuitTrackFill: {
    height: '100%',
    backgroundColor: '#F47738',
    borderRadius: 1.5,
    ...(Platform.OS === 'web'
      ? {
          background: 'linear-gradient(90deg, #F47738, #FF6652, #FFAE68)',
          boxShadow: '0 0 12px rgba(244, 119, 56, 0.9)',
          transition: 'width 0.15s ease-out',
        }
      : {}),
  },
  floatingBackToTop: {
    position: 'absolute',
    bottom: 28,
    right: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E1E1C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.4)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 9999,
    ...(Platform.OS === 'web'
      ? {
          cursor: 'pointer',
          boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.7), 0 0 15px rgba(244, 119, 56, 0.25)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }
      : {}),
  },
  backToTopText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: THEME.fonts.mono,
    letterSpacing: 0.5,
  },
});
