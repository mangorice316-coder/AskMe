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
  CheckCircle2,
  ArrowUp,
  MapPin,
  Building2,
  ShieldCheck,
  Activity,
  Layers,
  Database,
  Smartphone,
} from 'lucide-react-native';
import { THEME } from '../theme/tokens';
import AskMeLogo from './AskMeLogo';
import HeroIllustration from './HeroIllustration';
import SellixHeroVideo from './SellixHeroVideo';
import Footer from './Footer';
import { soundFx } from '../utils/soundEffects';

interface LandingPageProps {
  onStartReport: () => void;
  onExploreHowItWorks?: () => void;
}

export default function LandingPage({ onStartReport }: LandingPageProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;

    // Toggle back to top button without layout thrashing
    if (y > 400 && !showBackToTop) {
      setShowBackToTop(true);
    } else if (y <= 400 && showBackToTop) {
      setShowBackToTop(false);
    }

    // Direct DOM progress bar update & scroll animations on web (zero React re-renders, 120fps fluid)
    if (Platform.OS === 'web') {
      const contentH = event.nativeEvent.contentSize.height;
      const layoutH = event.nativeEvent.layoutMeasurement.height;
      const maxScroll = Math.max(1, contentH - layoutH);
      const progress = Math.min(100, Math.max(2, (y / maxScroll) * 100));
      const el = document.getElementById('askme-scroll-progress-bar');
      if (el) {
        el.style.width = `${progress}%`;
      }

      // 1. Hero Content Scroll Parallax & Dissolve
      const heroContent = document.querySelector('.hero-content') as HTMLElement | null;
      if (heroContent) {
        if (y < 650) {
          const heroOpacity = Math.max(0, 1 - (y / 460));
          const heroTranslateY = y * 0.32;
          heroContent.style.opacity = `${heroOpacity}`;
          heroContent.style.transform = `translateY(${heroTranslateY}px) scale(${1 - y * 0.00025})`;
        } else {
          heroContent.style.opacity = '0';
        }
      }

      // 2. Circuit Track Progress Fill in "How It Works"
      const circuitTrack = document.getElementById('askme-circuit-fill');
      if (circuitTrack) {
        const circuitStart = 380;
        const circuitEnd = 860;
        const circuitProgress = Math.min(100, Math.max(0, ((y - circuitStart) / (circuitEnd - circuitStart)) * 100));
        circuitTrack.style.width = `${circuitProgress}%`;
      }

      // 3. Fast viewport intersection check on scroll for cards & sections
      const revealNodes = document.querySelectorAll(
        '.scroll-reveal, [data-scroll-reveal], [data-reveal], [data-testid="askme-reveal"]'
      );
      const winH = window.innerHeight || document.documentElement.clientHeight;
      revealNodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.top < winH - 50 && rect.bottom > 40) {
          node.classList.add('is-in-view', 'is-revealed');
          node.classList.remove('is-scrolled-past');
        } else if (rect.bottom <= 40) {
          node.classList.add('is-scrolled-past');
          node.classList.remove('is-in-view');
        } else {
          node.classList.remove('is-in-view', 'is-scrolled-past');
        }
      });
    }
  };

  const scrollToHowItWorks = () => {
    soundFx.playClick();
    scrollRef.current?.scrollTo({ y: 720, animated: true });
  };

  const scrollToFeatures = () => {
    soundFx.playClick();
    scrollRef.current?.scrollTo({ y: 1320, animated: true });
  };

  const scrollToTop = () => {
    soundFx.playClick();
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleStart = () => {
    soundFx.playClick();
    onStartReport();
  };

  return (
    <View style={styles.outerWrapper}>
      {/* 0. Top Laser Scroll Progress Bar */}
      <View style={styles.topProgressTrack}>
        <View
          nativeID="askme-scroll-progress-bar"
          style={styles.topProgressBar}
          {...(Platform.OS === 'web' ? { id: 'askme-scroll-progress-bar' } as any : {})}
        />
      </View>

      {/* Desktop Structural Architectural Gridlines (Prompt Section 05) */}
      {Platform.OS === 'web' && (
        <View style={styles.desktopGridLines}>
          <View style={styles.gridLine} />
          <View style={styles.gridLine} />
          <View style={styles.gridLine} />
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* ================= 1. SELLIX REFERENCE RECREATION HERO ================= */}
        <View style={styles.sellixHeroWrapper}>
          {/* Exact Background Video with Earth Animation Crossfade & Ambient Vignette */}
          <SellixHeroVideo />

          {Platform.OS === 'web' ? (
            <main className="hero-container">
              <div className="hero-content">
                {/* 4-Line Masked Headline: Exact Sellix Placement with Saibex heading font */}
                <h1 className="hero-headline" data-font-heading="">
                  <span className="line-mask"><span className="line-inner">Your City</span></span>
                  <span className="line-mask"><span className="line-inner">Has a Problem.</span></span>
                  <span className="line-mask"><span className="line-inner">Let's Make It</span></span>
                  <span className="line-mask"><span className="line-inner">Heard.</span></span>
                </h1>

                {/* Subtitle with Rabios Diemo and Bidirectional Fade in / Fade out */}
                <p className="hero-subtitle hero-subtitle-anim fade-text" data-font-body="" data-text-fade="">
                  One photo, one voice, or one simple description.
                </p>

                {/* Description with Rabios Diemo and Bidirectional Fade in / Fade out */}
                <p className="hero-description hero-desc-anim fade-text" data-font-body="" data-text-fade="">
                  ASKME identifies the responsible municipal jurisdiction, analyzes your evidence, and helps generate a structured civic petition backed by relevant statutory references.
                </p>

                {/* CTAs */}
                <div className="hero-cta-row hero-cta-anim">
                  <button
                    className="btn btn-primary"
                    id="hero-primary-cta"
                    onClick={handleStart}
                    data-font-heading=""
                  >
                    Report a Problem
                  </button>
                  <button
                    className="btn btn-secondary"
                    id="hero-secondary-cta"
                    onClick={scrollToHowItWorks}
                    data-font-heading=""
                  >
                    Discover ASKME
                  </button>
                </div>
              </div>
            </main>
          ) : (
            <View style={styles.nativeHeroContainer}>
              <Text style={styles.nativeHeroHeadline}>
                Your City{'\n'}Has a Problem.{'\n'}Let's Make It Heard.
              </Text>
              <Text style={styles.nativeHeroSubtitle}>
                One photo, one voice, or one simple description.
              </Text>
              <Text style={styles.nativeHeroDescription}>
                ASKME identifies the responsible municipal jurisdiction, analyzes your evidence, and helps generate a structured civic petition backed by relevant statutory references.
              </Text>
              <View style={styles.nativeHeroCtaRow}>
                <TouchableOpacity style={styles.nativeBtnPrimary} onPress={handleStart}>
                  <Text style={styles.nativeBtnPrimaryText}>Report a Problem</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nativeBtnSecondary} onPress={scrollToHowItWorks}>
                  <Text style={styles.nativeBtnSecondaryText}>Discover ASKME</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ================= 2. STATISTICS SECTION ================= */}
        <View
          style={styles.statsStrip}
          testID="askme-reveal"
          {...(Platform.OS === 'web' ? { className: 'statsStrip scroll-reveal', 'data-scroll-reveal': '' } as any : {})}
        >
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

        {/* ================= 3. HOW IT WORKS (PROMPT SECTION 09) ================= */}
        <View style={styles.howItWorksSection} id="how-it-works" testID="askme-reveal">
          <View
            style={styles.sectionHeader}
            {...(Platform.OS === 'web' ? { className: 'scroll-reveal', 'data-scroll-reveal': '' } as any : {})}
          >
            <View style={styles.sectionEyebrowBadge}>
              <Text style={styles.sectionEyebrowText}>STATUTORY ROUTING PIPELINE</Text>
            </View>
            <Text style={styles.sectionTitle}>
              From Problem to <Text style={{ color: '#FF7135' }}>Action.</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>
              Turning everyday civic problems into structured, actionable petitions.
            </Text>
          </View>

          {/* Dynamic Laser Pulse Circuit Track */}
          <View style={styles.circuitTrackWrapper}>
            <View
              style={styles.circuitTrackFill}
              {...(Platform.OS === 'web' ? { id: 'askme-circuit-fill', className: 'circuitTrackFill' } as any : {})}
            />
          </View>

          <View style={styles.stagesPipeline}>
            {/* Step 1: Capture Evidence */}
            <View
              style={styles.stageCard}
              testID="askme-reveal"
              {...(Platform.OS === 'web' ? { className: 'stageCard scroll-reveal stagger-1', 'data-scroll-reveal': '' } as any : {})}
            >
              <View style={styles.stageHeaderRow}>
                <View style={styles.stageIconBox}>
                  <Camera size={17} color="#FF7135" />
                </View>
                <Text style={styles.stageStepNumber}>01</Text>
              </View>
              <Text style={styles.stageTitle}>Capture Evidence</Text>
              <Text style={styles.stageDesc}>
                Provide photographic evidence with EXIF GPS, record acoustic voice in your regional language, or type what happened.
              </Text>
              <View style={styles.stageAccentBar} />
            </View>

            <View style={styles.pipelineArrow}>
              <ArrowRight size={13} color="#77736F" />
            </View>

            {/* Step 2: Detect Location */}
            <View
              style={styles.stageCard}
              testID="askme-reveal"
              {...(Platform.OS === 'web' ? { className: 'stageCard scroll-reveal stagger-2', 'data-scroll-reveal': '' } as any : {})}
            >
              <View style={styles.stageHeaderRow}>
                <View style={styles.stageIconBox}>
                  <MapPin size={17} color="#FF7135" />
                </View>
                <Text style={styles.stageStepNumber}>02</Text>
              </View>
              <Text style={styles.stageTitle}>Detect Location</Text>
              <Text style={styles.stageDesc}>
                Geospatial lock on the affected area, isolating physical incident coordinates from private residential addresses.
              </Text>
              <View style={styles.stageAccentBar} />
            </View>

            <View style={styles.pipelineArrow}>
              <ArrowRight size={13} color="#77736F" />
            </View>

            {/* Step 3: AI Analysis */}
            <View
              style={styles.stageCard}
              testID="askme-reveal"
              {...(Platform.OS === 'web' ? { className: 'stageCard scroll-reveal stagger-3', 'data-scroll-reveal': '' } as any : {})}
            >
              <View style={styles.stageHeaderRow}>
                <View style={styles.stageIconBox}>
                  <Sparkles size={17} color="#FF7135" />
                </View>
                <Text style={styles.stageStepNumber}>03</Text>
              </View>
              <Text style={styles.stageTitle}>AI Analysis</Text>
              <Text style={styles.stageDesc}>
                Dual-engine visual classification evaluates severity, structural hazard, and citizen claims into verified facts.
              </Text>
              <View style={styles.stageAccentBar} />
            </View>

            <View style={styles.pipelineArrow}>
              <ArrowRight size={13} color="#77736F" />
            </View>

            {/* Step 4: Verify Authority */}
            <View
              style={styles.stageCard}
              testID="askme-reveal"
              {...(Platform.OS === 'web' ? { className: 'stageCard scroll-reveal stagger-4', 'data-scroll-reveal': '' } as any : {})}
            >
              <View style={styles.stageHeaderRow}>
                <View style={styles.stageIconBox}>
                  <Search size={17} color="#FF7135" />
                </View>
                <Text style={styles.stageStepNumber}>04</Text>
              </View>
              <Text style={styles.stageTitle}>Verify Authority</Text>
              <Text style={styles.stageDesc}>
                Resolves exact municipal ward, zonal engineer, NHAI division, or Indian Railways jurisdiction with 100% boundary accuracy.
              </Text>
              <View style={styles.stageAccentBar} />
            </View>

            <View style={styles.pipelineArrow}>
              <ArrowRight size={13} color="#77736F" />
            </View>

            {/* Step 5: Generate Petition */}
            <View
              style={styles.stageCard}
              testID="askme-reveal"
              {...(Platform.OS === 'web' ? { className: 'stageCard scroll-reveal stagger-5', 'data-scroll-reveal': '' } as any : {})}
            >
              <View style={styles.stageHeaderRow}>
                <View style={styles.stageIconBox}>
                  <FileText size={17} color="#FF7135" />
                </View>
                <Text style={styles.stageStepNumber}>05</Text>
              </View>
              <Text style={styles.stageTitle}>Generate Petition</Text>
              <Text style={styles.stageDesc}>
                Drafts a formal, legally enforceable grievance petition citing Section 133 CrPC, RTI Act, and official portal routing.
              </Text>
              <View style={styles.stageAccentBar} />
            </View>
          </View>
        </View>

        {/* ================= 4. FEATURES SECTION — ASYMMETRIC BENTO GRID (PROMPT SECTION 10) ================= */}
        <View style={styles.featuresSection} id="features" testID="askme-reveal">
          <View
            style={styles.sectionHeader}
            {...(Platform.OS === 'web' ? { className: 'scroll-reveal', 'data-scroll-reveal': '' } as any : {})}
          >
            <View style={styles.sectionEyebrowBadge}>
              <Text style={styles.sectionEyebrowText}>SYSTEM CAPABILITIES</Text>
            </View>
            <Text style={styles.sectionTitle}>
              Engineered for <Text style={{ color: '#FF7135' }}>Civic Impact.</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>
              Every feature designed to give citizens the precision and statutory backing of an institutional liaison.
            </Text>
          </View>

          {/* Asymmetric Bento Architecture */}
          <View style={styles.bentoContainer}>
            {/* Row 1: Wide Card (Multimodal Capture) + Compact Card (Location Radar) */}
            <View style={styles.bentoRow}>
              {/* Bento 1: Multimodal Evidence Capture (Wide) */}
              <TouchableOpacity
                style={[styles.bentoCard, styles.bentoCardWide]}
                onPress={handleStart}
                activeOpacity={0.88}
                testID="askme-reveal"
                {...(Platform.OS === 'web' ? { className: 'bentoCard bentoCardWide scroll-reveal', 'data-reveal': 'left' } as any : {})}
              >
                <View style={styles.bentoHeaderRow}>
                  <View style={styles.bentoIconBox}>
                    <Camera size={18} color="#FF7135" />
                  </View>
                  <View style={styles.bentoTag}>
                    <Text style={styles.bentoTagText}>MULTIMODAL EVIDENCE</Text>
                  </View>
                </View>
                <Text style={styles.bentoTitle}>Multimodal Evidence Capture</Text>
                <Text style={styles.bentoDesc}>
                  Combine photographs, regional voice recordings in your native language, or typed statements. AskMe blends all inputs into a single verified complaint dossier.
                </Text>

                {/* Interactive Visual Representation */}
                <View style={styles.bentoVisualSlot}>
                  <View style={styles.visualModalityRow}>
                    <View style={styles.modalityChip}>
                      <Camera size={11} color="#FF7135" />
                      <Text style={styles.modalityChipText}>EXIF GPS Photo</Text>
                    </View>
                    <View style={styles.modalityChip}>
                      <Mic size={11} color="#38D982" />
                      <Text style={styles.modalityChipText}>Acoustic Speech</Text>
                    </View>
                    <View style={styles.modalityChip}>
                      <FileText size={11} color="#A6A39E" />
                      <Text style={styles.modalityChipText}>Verified Text</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Bento 2: Intelligent Location Detection & Tactical GIS Radar (Compact) */}
              <TouchableOpacity
                style={[styles.bentoCard, styles.bentoCardCompact]}
                onPress={handleStart}
                activeOpacity={0.88}
                testID="askme-reveal"
                {...(Platform.OS === 'web' ? { className: 'bentoCard bentoCardCompact scroll-reveal', 'data-reveal': 'right' } as any : {})}
              >
                <View style={styles.bentoHeaderRow}>
                  <View style={styles.bentoIconBox}>
                    <MapPin size={18} color="#38D982" />
                  </View>
                  <View style={[styles.bentoTag, { borderColor: 'rgba(56, 217, 130, 0.3)' }]}>
                    <Text style={[styles.bentoTagText, { color: '#38D982' }]}>GIS RADAR</Text>
                  </View>
                </View>
                <Text style={styles.bentoTitle}>Intelligent Location Detection</Text>
                <Text style={styles.bentoDesc}>
                  Locks coordinates against statutory municipal boundaries so your grievance never gets rejected for wrong jurisdiction.
                </Text>

                <View style={styles.bentoVisualSlot}>
                  <View style={styles.radarVisualRow}>
                    <View style={styles.liveGreenDot} />
                    <Text style={styles.radarVisualText}>19+ MUNICIPAL BOUNDARIES LOCKED</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Row 2: Compact Card (Problem Classification) + Wide Card (Statutory Jurisdiction Matching) */}
            <View style={styles.bentoRow}>
              {/* Bento 3: AI-Powered Problem Classification (Compact) */}
              <TouchableOpacity
                style={[styles.bentoCard, styles.bentoCardCompact]}
                onPress={handleStart}
                activeOpacity={0.88}
                testID="askme-reveal"
                {...(Platform.OS === 'web' ? { className: 'bentoCard bentoCardCompact scroll-reveal', 'data-reveal': 'left' } as any : {})}
              >
                <View style={styles.bentoHeaderRow}>
                  <View style={styles.bentoIconBox}>
                    <Sparkles size={18} color="#FF7135" />
                  </View>
                  <View style={styles.bentoTag}>
                    <Text style={styles.bentoTagText}>CV & NLP REASONING</Text>
                  </View>
                </View>
                <Text style={styles.bentoTitle}>AI-Powered Classification</Text>
                <Text style={styles.bentoDesc}>
                  Evaluates hazardous asphalt damage, drainage overflows, and street light outages with high-confidence civic severity scoring.
                </Text>

                <View style={styles.bentoVisualSlot}>
                  <View style={styles.classificationBarRow}>
                    <Text style={styles.classLabel}>Severity Index</Text>
                    <View style={styles.classTrack}>
                      <View style={styles.classFillHigh} />
                    </View>
                    <Text style={styles.classScore}>98.4% Match</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Bento 4: Statutory Jurisdiction Matching (Wide Accent Card) */}
              <TouchableOpacity
                style={[styles.bentoCard, styles.bentoCardWide, styles.bentoCardAccent]}
                onPress={handleStart}
                activeOpacity={0.88}
                testID="askme-reveal"
                {...(Platform.OS === 'web' ? { className: 'bentoCard bentoCardWide scroll-reveal', 'data-reveal': 'right' } as any : {})}
              >
                <View style={styles.bentoHeaderRow}>
                  <View style={[styles.bentoIconBox, { backgroundColor: '#FF7135' }]}>
                    <Building2 size={18} color="#FFFFFF" />
                  </View>
                  <View style={[styles.bentoTag, { backgroundColor: 'rgba(255, 113, 53, 0.15)', borderColor: '#FF7135' }]}>
                    <Text style={[styles.bentoTagText, { color: '#FF7135' }]}>19+ STATUTORY BODIES</Text>
                  </View>
                </View>
                <Text style={styles.bentoTitle}>Statutory Jurisdiction Matching</Text>
                <Text style={styles.bentoDesc}>
                  Automatically routes between Municipal Corporations (GCC, BBMP, NDMC, BMC, GHMC, KMC), National Highways Authority (NHAI), and Indian Railways RailMadad.
                </Text>

                <View style={styles.bentoVisualSlot}>
                  <View style={styles.authorityPillsRow}>
                    <Text style={styles.authorityPill}>Greater Chennai Corporation</Text>
                    <Text style={styles.authorityPill}>BBMP Bengaluru</Text>
                    <Text style={styles.authorityPill}>NDMC Delhi</Text>
                    <Text style={styles.authorityPill}>NHAI Highways</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Row 3: 4 Equal Grid Capabilities */}
            <View style={styles.bentoQuadRow}>
              {/* Bento 5: Legal Petition Generation */}
              <View
                style={styles.bentoQuadCard}
                testID="askme-reveal"
                {...(Platform.OS === 'web' ? { className: 'bentoQuadCard scroll-reveal stagger-1', 'data-scroll-reveal': '' } as any : {})}
              >
                <View style={styles.bentoIconBox}>
                  <FileText size={16} color="#FF7135" />
                </View>
                <Text style={styles.bentoQuadTitle}>Legal Petition Generation</Text>
                <Text style={styles.bentoQuadDesc}>
                  Incorporates Section 133 CrPC, RTI Act, and Citizen Charter statutory clauses into an official enforceable draft.
                </Text>
              </View>

              {/* Bento 6: Complaint History & Citizen Vault */}
              <View
                style={styles.bentoQuadCard}
                testID="askme-reveal"
                {...(Platform.OS === 'web' ? { className: 'bentoQuadCard scroll-reveal stagger-2', 'data-scroll-reveal': '' } as any : {})}
              >
                <View style={styles.bentoIconBox}>
                  <Database size={16} color="#38D982" />
                </View>
                <Text style={styles.bentoQuadTitle}>Encrypted Citizen Vault</Text>
                <Text style={styles.bentoQuadDesc}>
                  Stores complaint tracking references, official authority responses, and downloadable statutory PDF dossiers on device.
                </Text>
              </View>

              {/* Bento 7: Real-Time Telemetry Terminal */}
              <View
                style={styles.bentoQuadCard}
                testID="askme-reveal"
                {...(Platform.OS === 'web' ? { className: 'bentoQuadCard scroll-reveal stagger-3', 'data-scroll-reveal': '' } as any : {})}
              >
                <View style={styles.bentoIconBox}>
                  <Activity size={16} color="#FF8A50" />
                </View>
                <Text style={styles.bentoQuadTitle}>Real-Time Telemetry</Text>
                <Text style={styles.bentoQuadDesc}>
                  Live streaming terminal telemetry visualizing neural reasoning steps and authority matching confidence.
                </Text>
              </View>

              {/* Bento 8: Responsive Citizen Interface */}
              <View
                style={styles.bentoQuadCard}
                testID="askme-reveal"
                {...(Platform.OS === 'web' ? { className: 'bentoQuadCard scroll-reveal stagger-4', 'data-scroll-reveal': '' } as any : {})}
              >
                <View style={styles.bentoIconBox}>
                  <Smartphone size={16} color="#3B82F6" />
                </View>
                <Text style={styles.bentoQuadTitle}>Responsive Interface</Text>
                <Text style={styles.bentoQuadDesc}>
                  Native 120fps fluid scrolling, zero layout shifts, and accessible contrast engineered for mobile and desktop.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================= 5. CINEMATIC CLOSING BANNER ================= */}
        <View
          style={styles.closingBanner}
          testID="askme-reveal"
          {...(Platform.OS === 'web' ? { className: 'closingBanner scroll-reveal', 'data-scroll-reveal': '' } as any : {})}
        >
          <View style={styles.closingAmbientGlow} />
          <AskMeLogo size={58} showText={false} animated={true} />
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
            accessibilityLabel="Report a problem"
            activeOpacity={0.88}
          >
            <Text style={styles.closingCtaText}>Report a Problem</Text>
            <View style={styles.closingArrowCircle}>
              <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.8} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= 6. MINIMAL DECLASSIFIED FOOTER ================= */}
        <Footer
          onNavigateHome={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          onNavigateHowItWorks={scrollToHowItWorks}
          onNavigateReport={onStartReport}
        />
      </ScrollView>

      {/* Floating Back-to-Top Button */}
      {showBackToTop && (
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
    backgroundColor: '#000000',
  },
  desktopGridLines: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: '100%',
    maxWidth: 1220,
    transform: [{ translateX: '-50%' } as any],
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    pointerEvents: 'none',
    zIndex: 1,
  },
  gridLine: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  topProgressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 99999,
  },
  topProgressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 1,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
          transition: 'width 0.1s linear',
        }
      : {}),
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingBottom: 0,
  },

  /* Sellix Hero Section */
  sellixHeroWrapper: {
    width: '100%',
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : 600,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  nativeHeroContainer: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  nativeHeroHeadline: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 16,
    fontFamily: THEME.fonts.heading,
  },
  nativeHeroSubtitle: {
    fontSize: 18,
    color: '#ededed',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: THEME.fonts.body,
  },
  nativeHeroDescription: {
    fontSize: 14,
    color: 'rgba(237, 237, 237, 0.72)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 500,
    marginBottom: 28,
    fontFamily: THEME.fonts.body,
  },
  nativeHeroCtaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nativeBtnPrimary: {
    backgroundColor: '#fdfdfd',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
  },
  nativeBtnPrimaryText: {
    color: '#050505',
    fontWeight: '700',
    fontSize: 14,
  },
  nativeBtnSecondary: {
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
  },
  nativeBtnSecondaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },

  /* Legacy Hero Section compatibility */
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 48,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    position: 'relative',
    zIndex: 2,
  },
  heroAmbientGlow: {
    position: 'absolute',
    top: -50,
    left: '10%',
    width: 650,
    height: 520,
    borderRadius: 300,
    backgroundColor: 'rgba(255, 113, 53, 0.08)',
    ...(Platform.OS === 'web'
      ? {
          filter: 'blur(95px)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderRadius: THEME.radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 24,
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
    backgroundColor: '#38D982',
  },
  heroStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F7F7F5',
    letterSpacing: 0.8,
    fontFamily: THEME.fonts.mono,
  },
  heroHeadline: {
    fontSize: Platform.OS === 'web' ? 68 : 40,
    fontWeight: '900',
    color: '#F7F7F5',
    lineHeight: Platform.OS === 'web' ? 74 : 46,
    letterSpacing: -1.8,
    marginBottom: 22,
    fontFamily: THEME.fonts.heading,
  },
  heroHeadlineOrange: {
    color: '#FF7135',
  },
  heroSubtext: {
    fontSize: 16,
    color: '#A6A39E',
    lineHeight: 26,
    marginBottom: 34,
    maxWidth: 520,
    fontFamily: THEME.fonts.body,
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
    gap: 12,
    backgroundColor: '#FF7135',
    paddingVertical: 14,
    paddingLeft: 26,
    paddingRight: 12,
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#FF7135',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage: 'linear-gradient(135deg, #FF7135 0%, #FF8A50 100%)',
          boxShadow: '0 8px 24px rgba(255, 113, 53, 0.45)',
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
    fontFamily: THEME.fonts.heading,
  },
  primaryArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(12px)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
        }
      : {}),
  },
  discoverBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F7F7F5',
    fontFamily: THEME.fonts.heading,
  },
  playIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    color: '#A6A39E',
    fontFamily: THEME.fonts.body,
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

  /* Statistics Section */
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 24,
    paddingVertical: 24,
    paddingHorizontal: 28,
    backgroundColor: '#181818',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    maxWidth: 1140,
    width: '100%',
    alignSelf: 'center',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(18px)',
          boxShadow: '0 18px 40px -10px rgba(0, 0, 0, 0.75)',
        }
      : {}),
  },
  statBox: {
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 120,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
    fontFamily: THEME.fonts.heading,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ededed',
    marginTop: 2,
    fontFamily: THEME.fonts.heading,
  },
  statMicro: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(237, 237, 237, 0.72)',
    marginTop: 2,
    fontFamily: THEME.fonts.body,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  /* How It Works Section */
  howItWorksSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
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
    backgroundColor: 'rgba(255, 113, 53, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 113, 53, 0.28)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: THEME.radii.pill,
    marginBottom: 14,
  },
  sectionEyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF7135',
    letterSpacing: 1,
    fontFamily: THEME.fonts.mono,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 42 : 30,
    fontWeight: '900',
    color: '#F7F7F5',
    letterSpacing: -1.2,
    marginBottom: 12,
    fontFamily: THEME.fonts.heading,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#A6A39E',
    textAlign: 'center',
    maxWidth: 620,
    lineHeight: 25,
    fontFamily: THEME.fonts.body,
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
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 0 12px rgba(255, 255, 255, 0.8)',
        }
      : {}),
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
    backgroundColor: '#181818',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(12px)',
          transition: 'all 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageStepNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: THEME.fonts.mono,
    letterSpacing: 0.5,
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    fontFamily: THEME.fonts.heading,
  },
  stageDesc: {
    fontSize: 12.5,
    color: 'rgba(237, 237, 237, 0.72)',
    lineHeight: 18,
    fontFamily: THEME.fonts.body,
    marginBottom: 14,
  },
  stageAccentBar: {
    height: 2,
    width: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 1,
  },
  pipelineArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },

  /* Features Section (Bento Grid) */
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  bentoContainer: {
    gap: 18,
  },
  bentoRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 18,
  },
  bentoCard: {
    backgroundColor: '#181818',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    justifyContent: 'space-between',
    minHeight: 250,
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(16px)',
          transition: 'all 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          boxShadow: '0 12px 32px -6px rgba(0, 0, 0, 0.65)',
        }
      : {}),
  },
  bentoCardWide: {
    flex: 1.5,
  },
  bentoCardCompact: {
    flex: 1,
  },
  bentoCardAccent: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  bentoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bentoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bentoTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#A6A39E',
    letterSpacing: 0.6,
    fontFamily: THEME.fonts.mono,
  },
  bentoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F7F7F5',
    marginBottom: 6,
    fontFamily: THEME.fonts.heading,
  },
  bentoDesc: {
    fontSize: 13,
    color: '#A6A39E',
    lineHeight: 20,
    fontFamily: THEME.fonts.body,
    marginBottom: 16,
  },
  bentoVisualSlot: {
    marginTop: 'auto',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  visualModalityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  modalityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalityChipText: {
    fontSize: 11,
    color: '#F7F7F5',
    fontWeight: '600',
    fontFamily: THEME.fonts.body,
  },
  radarVisualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38D982',
  },
  radarVisualText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38D982',
    fontFamily: THEME.fonts.mono,
  },
  classificationBarRow: {
    gap: 4,
  },
  classLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#77736F',
    fontFamily: THEME.fonts.mono,
  },
  classTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  classFillHigh: {
    height: '100%',
    width: '98%',
    backgroundColor: '#FF7135',
    borderRadius: 3,
  },
  classScore: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF7135',
    fontFamily: THEME.fonts.mono,
    alignSelf: 'flex-end',
  },
  authorityPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  authorityPill: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A6A39E',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  bentoQuadRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 16,
  },
  bentoQuadCard: {
    flex: 1,
    backgroundColor: '#181818',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    gap: 8,
    ...(Platform.OS === 'web'
      ? {
          transition: 'all 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5)',
        }
      : {}),
  },
  bentoQuadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: THEME.fonts.heading,
  },
  bentoQuadDesc: {
    fontSize: 12,
    color: 'rgba(237, 237, 237, 0.72)',
    lineHeight: 18,
    fontFamily: THEME.fonts.body,
  },

  /* Closing Banner */
  closingBanner: {
    marginHorizontal: 24,
    marginVertical: 64,
    padding: 56,
    borderRadius: 24,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
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
          boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.8)',
        }
      : {}),
  },
  closingAmbientGlow: {
    position: 'absolute',
    top: -60,
    width: 500,
    height: 300,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    ...(Platform.OS === 'web'
      ? {
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }
      : {}),
  },
  closingHeadline: {
    fontSize: Platform.OS === 'web' ? 40 : 28,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: -1,
    fontFamily: THEME.fonts.heading,
  },
  closingSubtext: {
    fontSize: 15,
    color: 'rgba(237, 237, 237, 0.72)',
    textAlign: 'center',
    maxWidth: 620,
    lineHeight: 25,
    marginBottom: 36,
    fontFamily: THEME.fonts.body,
  },
  closingCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fdfdfd',
    paddingVertical: 14,
    paddingLeft: 28,
    paddingRight: 12,
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: '#fdfdfd',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 10px 28px rgba(255, 255, 255, 0.22)',
          transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
        }
      : {}),
  },
  closingCtaText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#050505',
    letterSpacing: 0.1,
    fontFamily: THEME.fonts.heading,
  },
  closingArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Floating Back to Top Button */
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
    borderColor: 'rgba(255, 113, 53, 0.4)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 9999,
    ...(Platform.OS === 'web'
      ? {
          cursor: 'pointer',
          boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.7), 0 0 15px rgba(255, 113, 53, 0.25)',
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
