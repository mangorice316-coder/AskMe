import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar as NativeStatusBar,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen from './src/components/SplashScreen';
import Navbar from './src/components/Navbar';
import LandingPage from './src/components/LandingPage';
import ReportingWorkspace from './src/components/ReportingWorkspace';
import AIProcessingScreen, { ProcessingStage } from './src/components/AIProcessingScreen';
import ClarificationStep from './src/components/ClarificationStep';
import AnalysisResults from './src/components/AnalysisResults';
import HistoryList, { HistoryItem } from './src/components/HistoryList';
import { PhotoItem } from './src/components/PhotoUploader';

import {
  analyzeAndGenerateComplaint,
  UserComplaintInput,
  ComplaintAnalysisResult,
} from './src/services/aiEngine';
import {
  generateCivicActionSummary,
  CivicWorkflowTelemetry,
} from './src/services/openSourceSummarizer';
import { THEME } from './src/theme/tokens';

const HISTORY_STORAGE = '@complaint_history';
const MAX_HISTORY_ITEMS = 30;

// Inject luxury web typography and global resets
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  if (!document.getElementById('askme-google-fonts')) {
    const link = document.createElement('link');
    link.id = 'askme-google-fonts';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  if (!document.getElementById('askme-global-styles')) {
    const style = document.createElement('style');
    style.id = 'askme-global-styles';
    style.innerHTML = `
      :root {
        --bg: #000000;
        --text-main: #ffffff;
        --text-muted: #ededed;
        --text-subtle: rgba(237, 237, 237, 0.72);
        --panel: #181818;
        --btn-white: #fdfdfd;
        --btn-text: #050505;
        --glass-fill: rgba(0, 0, 0, 0.78);
        --glass-border: rgba(255, 255, 255, 0.09);
        --glass-border-hover: rgba(255, 255, 255, 0.22);
        --font-heading: 'Saibex', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --font-body: 'Rabios Diemo', 'Rabios DEMO', 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --font-family: var(--font-body);
      }

      @font-face {
        font-family: 'Saibex';
        src: local('Saibex'), local('Saibex-Regular'), local('Saibex Regular'), local('Saibex Bold');
        font-display: swap;
      }
      @font-face {
        font-family: 'Rabios Diemo';
        src: local('Rabios Diemo'), local('Rabios DEMO'), local('Rabios-DEMO'), local('Rabios');
        font-display: swap;
      }

      h1, h2, h3, h4, h5, h6,
      .hero-headline,
      .sectionTitle,
      .modal-title,
      .brand-logo,
      .bentoTitle,
      .stageTitle,
      .cardTitle,
      .statNumber,
      .closingHeadline,
      .bentoQuadTitle,
      .authority-name,
      .modal-label,
      [data-font-heading],
      [data-heading] {
        font-family: var(--font-heading) !important;
        letter-spacing: -0.02em;
      }

      p,
      span:not([data-font-heading]):not(.stageStepNumber):not(.bentoTagText):not(.radarVisualText):not(.brand-logo),
      div:not([data-font-heading]),
      body,
      button,
      input,
      textarea,
      .hero-subtitle,
      .hero-description,
      .sectionSubtitle,
      .stageDesc,
      .bentoDesc,
      .closingSubtext,
      .bentoQuadDesc,
      .statMicro,
      .statLabel,
      .authority-meta,
      .modal-subtitle,
      [data-font-body] {
        font-family: var(--font-body);
      }

      /* =========================================================================
         BIDIRECTIONAL TEXT FADE IN & FADE OUT ENGINE
         Text smoothly fades in entering viewport, fades out when scrolling away
         ========================================================================= */
      .fade-text,
      [data-text-fade],
      [data-fade-text],
      p,
      .hero-subtitle,
      .hero-description,
      .sectionSubtitle,
      .stageDesc,
      .bentoDesc,
      .closingSubtext,
      .bentoQuadDesc,
      .statMicro {
        transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
                    transform 0.65s cubic-bezier(0.16, 1, 0.3, 1),
                    filter 0.65s cubic-bezier(0.16, 1, 0.3, 1) !important;
        will-change: opacity, transform, filter;
      }

      /* Initial state below viewport */
      .text-below-view {
        opacity: 0 !important;
        transform: translateY(18px) !important;
        filter: blur(2.5px) !important;
      }

      /* In viewport: crystal clear & illuminated */
      .text-in-view {
        opacity: 1 !important;
        transform: translateY(0) !important;
        filter: blur(0px) !important;
      }

      /* Scrolled past the viewport (above top): subtle dimmed fade out */
      .text-out-view {
        opacity: 0.16 !important;
        transform: translateY(-10px) !important;
        filter: blur(1.5px) !important;
      }

      /* Micro-hover subtle illumination on text */
      p:hover, .fade-text:hover, [data-text-fade]:hover, .hero-description:hover, .hero-subtitle:hover {
        color: #ffffff !important;
        text-shadow: 0 0 14px rgba(255, 255, 255, 0.32);
      }

      html {
        scroll-behavior: smooth;
      }
      html, body, #root {
        height: 100%;
        margin: 0;
        padding: 0;
        background-color: #000000;
        font-family: var(--font-family);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #ffffff;
        overflow-x: hidden;
      }
      * {
        box-sizing: border-box;
      }
      ::selection {
        background-color: rgba(255, 255, 255, 0.25);
        color: #ffffff;
      }

      /* Custom luxury dark scrollbar */
      ::-webkit-scrollbar {
        width: 7px;
        height: 7px;
      }
      ::-webkit-scrollbar-track {
        background: #000000;
      }
      ::-webkit-scrollbar-thumb {
        background: #1c1c1c;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      /* Sellix Video Viewport */
      .video-viewport {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 0;
        pointer-events: none;
      }
      .video-layer {
        position: absolute;
        top: 50%;
        left: 50%;
        min-width: 100%;
        min-height: 100%;
        width: auto;
        height: auto;
        transform: translate(-50%, -50%);
        object-fit: cover;
        opacity: 0;
        transition: opacity 1.3s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: opacity;
      }
      .video-layer.active {
        opacity: 1;
      }
      .video-vignette {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        background-image:
          radial-gradient(circle at center, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.45) 55%, rgba(0, 0, 0, 0.92) 100%),
          linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 20%, transparent 75%, rgba(0, 0, 0, 0.96) 100%);
      }

      /* Masked typography entrance */
      .line-mask {
        overflow: hidden;
        display: block;
      }
      .line-inner {
        display: block;
        transform: translateY(115%);
        opacity: 0;
        transition: transform 0.95s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.95s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: transform, opacity;
      }
      .line-inner.revealed {
        transform: translateY(0);
        opacity: 1;
      }

      .hero-subtitle-anim {
        opacity: 0;
        transform: translateY(16px);
        filter: blur(6px);
        transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: opacity, transform, filter;
      }
      .hero-subtitle-anim.revealed {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
      }

      .hero-desc-anim {
        opacity: 0;
        transform: translateY(16px);
        filter: blur(4px);
        transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: opacity, transform, filter;
      }
      .hero-desc-anim.revealed {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
      }

      .hero-cta-anim {
        opacity: 0;
        transform: translateY(18px) scale(0.97);
        transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: opacity, transform;
      }
      .hero-cta-anim.revealed {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      /* Exact Sellix Hero Styles */
      .hero-container {
        position: relative;
        z-index: 10;
        width: 100%;
        height: 100vh;
        height: 100dvh;
        min-height: 700px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 0 24px;
      }
      .hero-content {
        max-width: 900px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: -12px;
      }
      .hero-headline {
        font-size: clamp(48px, 6.2vw, 84px);
        font-weight: 800;
        line-height: 1.04;
        letter-spacing: -0.04em;
        color: var(--text-main);
        margin-bottom: 22px;
        font-family: var(--font-family);
      }
      .hero-subtitle {
        font-size: 20px;
        font-weight: 400;
        letter-spacing: -0.015em;
        color: var(--text-muted);
        margin-bottom: 14px;
        font-family: var(--font-family);
      }
      .hero-description {
        font-size: 15px;
        font-weight: 400;
        line-height: 1.6;
        letter-spacing: -0.01em;
        color: var(--text-subtle);
        max-width: 610px;
        margin: 0 auto 34px auto;
        font-family: var(--font-family);
      }
      .hero-cta-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 13px 28px;
        border-radius: 9999px;
        font-size: 14.5px;
        text-decoration: none;
        cursor: pointer;
        transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, background-color 0.22s ease, border-color 0.22s ease;
        outline: none;
        border: 1px solid transparent;
        user-select: none;
        font-family: var(--font-family);
      }
      .btn-primary {
        background: var(--btn-white);
        color: var(--btn-text);
        font-weight: 600;
        border-color: var(--btn-white);
      }
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 28px rgba(255, 255, 255, 0.22);
      }
      .btn-secondary {
        background: var(--glass-fill);
        color: var(--text-main);
        font-weight: 500;
        border-color: var(--glass-border);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      }
      .btn-secondary:hover {
        background: rgba(24, 24, 24, 0.92);
        border-color: var(--glass-border-hover);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      }

      @media (max-width: 860px) {
        .hero-headline {
          font-size: clamp(34px, 8.4vw, 52px);
          line-height: 1.08;
          letter-spacing: -0.035em;
          margin-bottom: 18px;
        }
        .hero-subtitle {
          font-size: 17px;
          padding: 0 10px;
          margin-bottom: 12px;
        }
        .hero-description {
          font-size: 13.5px;
          line-height: 1.5;
          padding: 0 12px;
          margin-bottom: 28px;
        }
        .hero-cta-row {
          flex-direction: column;
          width: 100%;
          max-width: 320px;
          gap: 12px;
        }
        .btn {
          width: 100%;
        }
      }

      /* Fluid Bidirectional Fade In / Fade Out on Scroll */
      [data-scroll-fade] {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: opacity, transform;
      }
      [data-scroll-fade].is-visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
      [data-scroll-fade].is-faded-out {
        opacity: 0.25 !important;
        transform: translateY(-12px) !important;
      }

      /* Hover Interactions & Transitions */
      .btn-primary-sellix {
        background-color: var(--btn-white) !important;
        color: var(--btn-text) !important;
        transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, opacity 0.2s ease !important;
      }
      .btn-primary-sellix:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 10px 28px rgba(255, 255, 255, 0.24) !important;
        opacity: 0.95 !important;
      }

      .btn-secondary-sellix {
        background-color: var(--glass-fill) !important;
        color: var(--text-main) !important;
        border: 1px solid var(--glass-border) !important;
        backdrop-filter: blur(14px) !important;
        -webkit-backdrop-filter: blur(14px) !important;
        transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, background-color 0.22s ease, border-color 0.22s ease !important;
      }
      .btn-secondary-sellix:hover {
        background-color: rgba(24, 24, 24, 0.94) !important;
        border-color: var(--glass-border-hover) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6) !important;
      }

      .card-sellix-interactive {
        background-color: var(--panel) !important;
        border: 1px solid var(--glass-border) !important;
        transition: transform 0.26s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.26s ease, box-shadow 0.26s ease, background-color 0.26s ease !important;
      }
      .card-sellix-interactive:hover {
        transform: translateY(-3px) !important;
        border-color: var(--glass-border-hover) !important;
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.75) !important;
        background-color: rgba(28, 28, 28, 0.95) !important;
      }

      .nav-link-sellix {
        transition: color 0.2s ease, opacity 0.2s ease !important;
      }
      .nav-link-sellix:hover {
        color: #ffffff !important;
        opacity: 1 !important;
      }

      /* Liquid Glass Architecture */
      .liquid-glass {
        background: rgba(255, 255, 255, 0.035) !important;
        backdrop-filter: blur(14px) !important;
        -webkit-backdrop-filter: blur(14px) !important;
        border: 1px solid rgba(255, 255, 255, 0.09) !important;
      }

      /* Legacy reveal support */
      [data-testid="askme-reveal"], .askme-reveal {
        opacity: 0;
        transform: translateY(14px);
        transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: opacity, transform;
      }
      [data-testid="askme-reveal"].is-revealed, .askme-reveal.is-revealed {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }

      @media (prefers-reduced-motion: reduce) {
        .line-inner, .hero-subtitle-anim, .hero-desc-anim, .hero-cta-anim, [data-scroll-fade] {
          transform: none !important;
          opacity: 1 !important;
          filter: none !important;
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

function isHistoryItem(value: unknown): value is HistoryItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<HistoryItem>;
  return (
    typeof item.id === 'string' &&
    typeof item.category === 'string' &&
    typeof item.location === 'string' &&
    typeof item.authorityName === 'string' &&
    typeof item.date === 'string' &&
    typeof item.urgency === 'string' &&
    typeof item.letterText === 'string'
  );
}

/** Error boundary with matching luxury aesthetics */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message || 'An unexpected error occurred.' };
  }

  componentDidCatch(error: Error) {
    console.error('ASKME ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorBoundaryStyles.container}>
          <View style={errorBoundaryStyles.card}>
            <Text style={errorBoundaryStyles.icon}>🏛️</Text>
            <Text style={errorBoundaryStyles.title}>Application Notice</Text>
            <Text style={errorBoundaryStyles.message}>{this.state.error}</Text>
            <TouchableOpacity
              style={errorBoundaryStyles.button}
              onPress={() => this.setState({ hasError: false, error: '' })}
            >
              <Text style={errorBoundaryStyles.buttonText}>Restart ASKME</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorBoundaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: THEME.colors.secondaryBackground,
    padding: 32,
    borderRadius: THEME.radii.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    maxWidth: 440,
    width: '100%',
  },
  icon: {
    fontSize: 42,
    marginBottom: 16,
  },
  title: {
    color: THEME.colors.primaryText,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  message: {
    color: THEME.colors.secondaryText,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: THEME.colors.darkBackground,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: THEME.radii.pill,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

type AppScreen = 'landing' | 'report' | 'processing' | 'clarification' | 'results' | 'history';

function AppContent() {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [showSplash, setShowSplash] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('understanding');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Active workflow data
  const [currentInput, setCurrentInput] = useState<UserComplaintInput | null>(null);
  const [currentPhotos, setCurrentPhotos] = useState<PhotoItem[]>([]);
  const [analysisResult, setAnalysisResult] = useState<ComplaintAnalysisResult | null>(null);

  const historyRef = useRef(history);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // High-performance hardware-accelerated scroll reveal & fade in/out for web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // 1. One-time reveals
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -20px 0px', threshold: 0.05 }
    );

    // 2. Bidirectional fluid fade in / fade out on scroll
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            entry.target.classList.remove('is-faded-out');
          } else {
            // Fade out when scrolling away
            if (entry.boundingClientRect.top < 0) {
              entry.target.classList.remove('is-visible');
              entry.target.classList.add('is-faded-out');
            }
          }
        });
      },
      { rootMargin: '-20px 0px -20px 0px', threshold: 0.12 }
    );

    // 3. Bidirectional fluid text fade in / fade out on scroll
    const textFadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const rect = entry.boundingClientRect;
          if (entry.isIntersecting) {
            entry.target.classList.add('text-in-view');
            entry.target.classList.remove('text-below-view', 'text-out-view');
          } else {
            if (rect.top < 0) {
              // Scrolled past the top
              entry.target.classList.add('text-out-view');
              entry.target.classList.remove('text-in-view', 'text-below-view');
            } else {
              // Below the viewport
              entry.target.classList.add('text-below-view');
              entry.target.classList.remove('text-in-view', 'text-out-view');
            }
          }
        });
      },
      { rootMargin: '-10px 0px -10px 0px', threshold: [0, 0.15, 0.5] }
    );

    const observeTargets = () => {
      const revealTargets = document.querySelectorAll(
        '[data-testid="askme-reveal"]:not(.is-revealed), .askme-reveal:not(.is-revealed)'
      );
      revealTargets.forEach((el) => revealObserver.observe(el));

      const fadeTargets = document.querySelectorAll('[data-scroll-fade]');
      fadeTargets.forEach((el) => fadeObserver.observe(el));

      const textTargets = document.querySelectorAll(
        '.fade-text, [data-text-fade], [data-fade-text], p, .hero-subtitle, .hero-description, .sectionSubtitle, .stageDesc, .bentoDesc, .closingSubtext, .bentoQuadDesc, .statMicro'
      );
      textTargets.forEach((el) => {
        if (!el.classList.contains('text-in-view') && !el.classList.contains('text-out-view')) {
          const rect = el.getBoundingClientRect();
          const winHeight = window.innerHeight || document.documentElement.clientHeight;
          if (rect.top > winHeight) {
            el.classList.add('text-below-view');
          } else if (rect.bottom < 0) {
            el.classList.add('text-out-view');
          } else {
            el.classList.add('text-in-view');
          }
        }
        textFadeObserver.observe(el);
      });
    };

    // 3. Staggered Entrance Sequence for Hero Elements
    const triggerEntrance = () => {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const lines = document.querySelectorAll('.line-inner');
      const subtitle = document.querySelector('.hero-subtitle-anim');
      const desc = document.querySelector('.hero-desc-anim');
      const ctaRow = document.querySelector('.hero-cta-anim');

      if (isReduced) {
        lines.forEach((l) => l.classList.add('revealed'));
        if (subtitle) subtitle.classList.add('revealed');
        if (desc) desc.classList.add('revealed');
        if (ctaRow) ctaRow.classList.add('revealed');
        return;
      }

      lines.forEach((line, idx) => {
        setTimeout(() => {
          line.classList.add('revealed');
        }, 180 + idx * 115);
      });

      setTimeout(() => {
        if (subtitle) subtitle.classList.add('revealed');
      }, 640);

      setTimeout(() => {
        if (desc) desc.classList.add('revealed');
      }, 780);

      setTimeout(() => {
        if (ctaRow) ctaRow.classList.add('revealed');
      }, 920);
    };

    const timer = setTimeout(() => {
      observeTargets();
      triggerEntrance();
    }, 40);

    const mutationObs = new MutationObserver(() => {
      observeTargets();
    });
    mutationObs.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      revealObserver.disconnect();
      fadeObserver.disconnect();
      textFadeObserver.disconnect();
      mutationObs.disconnect();
    };
  }, [screen]);

  useEffect(() => {
    loadHistory();
  }, []);

  const saveHistory = useCallback(async (items: HistoryItem[]) => {
    setHistory(items);
    await AsyncStorage.setItem(HISTORY_STORAGE, JSON.stringify(items));
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem(HISTORY_STORAGE);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setHistory(parsed.filter(isHistoryItem).slice(0, MAX_HISTORY_ITEMS));
        }
      }
    } catch (err) {
      console.error('Failed to load initial history storage', err);
    }
  };

  const handleStartAnalysis = async (input: UserComplaintInput) => {
    setIsAnalyzing(true);
    setCurrentInput(input);
    setCurrentPhotos((input.photos as PhotoItem[]) || []);
    setScreen('processing');
    setProcessingStage('understanding');

    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

      const result = await analyzeAndGenerateComplaint(input, apiKey, (stage) => {
        setProcessingStage(stage);
      });

      setAnalysisResult(result);

      // Generate AI Action Summary via open-source model engine
      const initialTelemetry: CivicWorkflowTelemetry = {
        complaintId: `ASKME-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        mainIssue: result.mainIssue,
        category: result.category,
        severity: result.severity,
        location: input.problemLocation.address || 'Unspecified location',
        photoCount: input.photos?.length || 0,
        authorityName: result.authorityMatch.primaryAuthority.name,
        authorityJurisdiction: result.authorityMatch.primaryAuthority.jurisdiction,
        authorityPortal: result.authorityMatch.primaryAuthority.grievancePortal,
        letterSubject: result.letterSubject,
        status: 'Draft',
      };
      const initialSummary = await generateCivicActionSummary(initialTelemetry);

      // Save initial draft into history
      const newDraft: HistoryItem = {
        id: Date.now().toString(),
        category: result.category,
        location: input.problemLocation.address,
        authorityName: result.authorityMatch.primaryAuthority.name,
        date: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        urgency: result.severity,
        letterText: result.formalLetter,
        aiSummary: initialSummary.summaryText,
        authorityEmail: result.authorityMatch.primaryAuthority.officialEmail,
        language: input.preferredLanguage || 'English',
        tone: input.preferredTone || 'Formal',
        status: 'Draft',
      };

      const updated = [newDraft, ...historyRef.current].slice(0, MAX_HISTORY_ITEMS);
      await saveHistory(updated);

      // If missing fields or clarification questions were identified, give user the option
      if (result.clarificationQuestions && result.clarificationQuestions.length > 0) {
        setScreen('clarification');
      } else {
        setScreen('results');
      }
    } catch (err: any) {
      console.error('Analysis failed:', err);
      Alert.alert(
        'Analysis Notice',
        err?.message || 'Could not complete AI analysis. Returning to reporting workspace.'
      );
      setScreen('report');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClarificationComplete = (answers: Record<string, string>) => {
    if (!analysisResult) {
      setScreen('results');
      return;
    }

    const extraLines = Object.entries(answers)
      .filter(([_, ans]) => ans.trim().length > 0)
      .map(([q, ans]) => `• ${q}: ${ans}`)
      .join('\n');

    if (extraLines) {
      const updatedLetter = `${analysisResult.formalLetter}\n\nADDITIONAL PARTICULARS PROVIDED BY CITIZEN:\n${extraLines}`;
      setAnalysisResult({
        ...analysisResult,
        formalLetter: updatedLetter,
        userProvidedFacts: [
          ...analysisResult.userProvidedFacts,
          ...Object.values(answers).filter((a) => a.trim().length > 0),
        ],
      });
    }

    setScreen('results');
  };

  const handleRegenerateLetter = async (
    tone: 'Formal' | 'Assertive' | 'Urgent' | 'Legal',
    language: string
  ) => {
    if (!currentInput || !analysisResult) return;

    const updatedInput: UserComplaintInput = {
      ...currentInput,
      preferredTone: tone,
      preferredLanguage: language,
    };
    setCurrentInput(updatedInput);

    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    const result = await analyzeAndGenerateComplaint(updatedInput, apiKey);
    setAnalysisResult(result);
  };

  const handleSaveToHistory = async (letterText: string, status: 'Draft' | 'Submitted') => {
    if (!analysisResult) return;

    // Generate summary for submission status
    const telemetry: CivicWorkflowTelemetry = {
      complaintId: `ASKME-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      mainIssue: analysisResult.mainIssue,
      category: analysisResult.category,
      severity: analysisResult.severity,
      location: analysisResult.authorityMatch.primaryAuthority.jurisdiction,
      photoCount: currentPhotos.length,
      authorityName: analysisResult.authorityMatch.primaryAuthority.name,
      authorityJurisdiction: analysisResult.authorityMatch.primaryAuthority.jurisdiction,
      authorityPortal: analysisResult.authorityMatch.primaryAuthority.grievancePortal,
      letterSubject: analysisResult.letterSubject,
      status,
    };
    const summary = await generateCivicActionSummary(telemetry);

    const newDraft: HistoryItem = {
      id: Date.now().toString(),
      category: analysisResult.category,
      location: analysisResult.authorityMatch.primaryAuthority.jurisdiction,
      authorityName: analysisResult.authorityMatch.primaryAuthority.name,
      date: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      urgency: analysisResult.severity,
      letterText,
      aiSummary: summary.summaryText,
      authorityEmail: analysisResult.authorityMatch.primaryAuthority.officialEmail,
      status,
    };

    const updated = [newDraft, ...historyRef.current].slice(0, MAX_HISTORY_ITEMS);
    await saveHistory(updated);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    const syntheticAnalysis: ComplaintAnalysisResult = {
      normalizedDescription: item.letterText.slice(0, 160) + '...',
      userProvidedFacts: [
        `Category: ${item.category}`,
        `Location: ${item.location}`,
        `Filed on: ${item.date}`,
      ],
      observedEvidence: ['Archived grievance record retrieved from citizen vault.'],
      aiInterpretation: `Jurisdictional representation for ${item.authorityName}.`,
      mainIssue: item.category,
      category: item.category,
      severity: (item.urgency as any) || 'Moderate',
      severityExplanation: `Recorded under ${item.urgency} priority dispatch.`,
      publicImpact: 'Reported civic issue affecting neighborhood residents and community safety.',
      missingInfo: [],
      clarificationQuestions: [],
      authorityMatch: {
        primaryAuthority: {
          id: item.authorityName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: item.authorityName,
          category: item.category,
          level: 'Municipal',
          jurisdiction: item.location,
          responsibility: `Public municipal and statutory civic management for ${item.category}`,
          officialWebsite: 'https://pgportal.gov.in',
          grievancePortal: 'https://pgportal.gov.in',
          officialEmail: item.authorityEmail || 'grievance-support@pgportal.gov.in',
          officialPhone: '1905 / 1800-11-4000',
          verificationSource: 'Citizen Vault Archive',
          lastVerifiedDate: item.date,
          status: 'Active',
          submissionType: 'portal',
        },
        reason: `Retrieved from local grievance records for ${item.authorityName}.`,
        confidence: 'High confidence',
      },
      formalLetter: item.letterText,
      letterSubject: `Grievance Representation: ${item.category} at ${item.location}`,
    };

    setAnalysisResult(syntheticAnalysis);
    setCurrentPhotos([]);
    setScreen('results');
  };

  const handleDeleteHistory = async (id: string) => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this grievance record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = history.filter((item) => item.id !== id);
          await saveHistory(updated);
        },
      },
    ]);
  };

  const handleUpdateStatus = async (
    id: string,
    status: 'Draft' | 'Submitted' | 'In Progress' | 'Resolved'
  ) => {
    const updated = history.map((item) => (item.id === id ? { ...item, status } : item));
    await saveHistory(updated);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NativeStatusBar backgroundColor="#0A0A09" barStyle="light-content" />

      {/* Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <View style={styles.rootContainer}>
        {/* Floating Luxury Island Navbar */}
        <Navbar
          currentScreen={screen}
          onNavigate={(target) => setScreen(target)}
          historyCount={history.length}
        />

        {/* Dynamic View Router */}
        <View style={styles.mainContent}>
          {screen === 'landing' && (
            <LandingPage
              onStartReport={() => setScreen('report')}
            />
          )}

          {screen === 'report' && (
            <ReportingWorkspace
              onAnalyze={handleStartAnalysis}
              isAnalyzing={isAnalyzing}
            />
          )}

          {screen === 'processing' && (
            <AIProcessingScreen currentStage={processingStage} />
          )}

          {screen === 'clarification' && analysisResult && (
            <ClarificationStep
              questions={analysisResult.clarificationQuestions}
              missingFields={analysisResult.missingInfo}
              onConfirmClarifications={handleClarificationComplete}
              onSkip={() => setScreen('results')}
            />
          )}

          {screen === 'results' && analysisResult && (
            <AnalysisResults
              analysis={analysisResult}
              photos={currentPhotos}
              onRegenerateLetter={handleRegenerateLetter}
              onBackToEdit={() => setScreen('report')}
              onSaveToHistory={handleSaveToHistory}
            />
          )}

          {screen === 'history' && (
            <HistoryList
              history={history}
              onSelect={handleSelectHistoryItem}
              onDelete={handleDeleteHistory}
              onUpdateStatus={handleUpdateStatus}
              onClose={() => setScreen('landing')}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.primaryBackground,
  },
  rootContainer: {
    flex: 1,
    backgroundColor: THEME.colors.primaryBackground,
  },
  mainContent: {
    flex: 1,
    backgroundColor: THEME.colors.primaryBackground,
  },
});
