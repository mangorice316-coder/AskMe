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
      'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@400;600;700;800&display=swap';
    document.head.appendChild(link);
  }

  if (!document.getElementById('askme-global-styles')) {
    const style = document.createElement('style');
    style.id = 'askme-global-styles';
    style.innerHTML = `
      html, body, #root {
        height: 100%;
        margin: 0;
        padding: 0;
        background-color: #F6F5F1;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #151514;
      }
      * {
        box-sizing: border-box;
      }
      ::selection {
        background-color: #FCD8C6;
        color: #151514;
      }
      /* Custom luxury scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: #F6F5F1;
      }
      ::-webkit-scrollbar-thumb {
        background: #D8D2C7;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #F47738;
      }
      /* ================= SUBTLE SCROLL FADE ANIMATIONS ================= */
      [data-testid="askme-reveal"], .askme-reveal {
        opacity: 0;
        transform: translateY(14px);
        transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: opacity, transform;
      }
      [data-testid="askme-reveal"].is-revealed, .askme-reveal.is-revealed {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
      @media (prefers-reduced-motion: reduce) {
        [data-testid="askme-reveal"], .askme-reveal {
          opacity: 1 !important;
          transform: none !important;
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

  // Subtle, elegant scroll fade reveal for web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    let observer: IntersectionObserver | null = null;

    const setupObserver = () => {
      if (observer) observer.disconnect();

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '0px 0px -30px 0px',
          threshold: 0.08,
        }
      );

      const targets = document.querySelectorAll(
        '[data-testid="askme-reveal"], .askme-reveal'
      );

      targets.forEach((el) => {
        if (!el.classList.contains('is-revealed')) {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('is-revealed');
          } else {
            observer?.observe(el);
          }
        }
      });
    };

    const timer = setTimeout(setupObserver, 60);

    const mutationObs = new MutationObserver(() => {
      setupObserver();
    });
    mutationObs.observe(document.body, { childList: true, subtree: true });

    const handleScroll = () => {
      setupObserver();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
      mutationObs.disconnect();
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll, true);
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
      <NativeStatusBar backgroundColor="#F6F5F1" barStyle="dark-content" />

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
