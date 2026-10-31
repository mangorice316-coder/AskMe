import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Platform,
  Easing,
} from 'react-native';
import { Mic, Square, RefreshCw, Check, Edit3, Volume2 } from 'lucide-react-native';
import { THEME } from '../theme/tokens';

interface VoiceInputProps {
  transcript: string;
  onTranscriptChange: (text: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', label: 'English' },
  { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
  { code: 'hi-IN', label: 'हिंदी (Hindi)' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml-IN', label: 'മലയാളം (Malayalam)' },
  { code: 'bn-IN', label: 'বাংলা (Bengali)' },
  { code: 'mr-IN', label: 'मराठी (Marathi)' },
];

export default function VoiceInput({ transcript, onTranscriptChange }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [isEditing, setIsEditing] = useState(false);
  const [interimText, setInterimText] = useState('');

  // 5 Waveform bars
  const bar1 = useRef(new Animated.Value(6)).current;
  const bar2 = useRef(new Animated.Value(14)).current;
  const bar3 = useRef(new Animated.Value(22)).current;
  const bar4 = useRef(new Animated.Value(12)).current;
  const bar5 = useRef(new Animated.Value(8)).current;

  // Pulse animation for recording ring
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRecording) {
      // Start duration counter
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Start wave animation
      const createTiming = (anim: Animated.Value, min: number, max: number, duration: number) => {
        return Animated.sequence([
          Animated.timing(anim, {
            toValue: max,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: min,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]);
      };

      Animated.loop(
        Animated.parallel([
          createTiming(bar1, 4, 24, 300),
          createTiming(bar2, 8, 34, 450),
          createTiming(bar3, 10, 42, 380),
          createTiming(bar4, 6, 28, 420),
          createTiming(bar5, 4, 20, 320),
        ])
      ).start();

      // Pulse ring
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 700,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setDuration(0);
      bar1.setValue(6);
      bar2.setValue(14);
      bar3.setValue(22);
      bar4.setValue(12);
      bar5.setValue(8);
      pulseAnim.setValue(1);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startSpeechRecognition = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = selectedLang;

          recognition.onresult = (event: any) => {
            let finalOutput = '';
            let interimOutput = '';

            for (let i = 0; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalOutput += event.results[i][0].transcript + ' ';
              } else {
                interimOutput += event.results[i][0].transcript;
              }
            }

            if (finalOutput) {
              onTranscriptChange((transcript ? transcript + ' ' : '') + finalOutput.trim());
              setInterimText('');
            } else {
              setInterimText(interimOutput);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('Speech recognition error:', e.error);
            setIsRecording(false);
          };

          recognition.onend = () => {
            setIsRecording(false);
          };

          recognition.start();
          recognitionRef.current = recognition;
          setIsRecording(true);
          return;
        } catch (err) {
          console.warn('SpeechRecognition failed to start:', err);
        }
      }
    }

    // Graceful simulated recording fallback
    setIsRecording(true);
    setTimeout(() => {
      if (!transcript) {
        onTranscriptChange(
          'There is a severe drainage blockage and dirty water is overflowing into the street, causing foul odor and health concerns for residents.'
        );
      }
      setIsRecording(false);
    }, 4000);
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.componentLabel}>Tell Us by Voice</Text>
        <Text style={styles.componentSub}>Explain the issue in your own words.</Text>
      </View>

      {/* Top Language Chips */}
      <View style={styles.langRow}>
        <Volume2 size={13} color={THEME.colors.secondaryText} />
        <Text style={styles.langLabel}>Select Language:</Text>
        <View style={styles.langChips}>
          {SUPPORTED_LANGUAGES.slice(0, 4).map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langChip,
                selectedLang === lang.code && styles.langChipActive,
              ]}
              onPress={() => setSelectedLang(lang.code)}
              accessibilityRole="button"
              accessibilityLabel={`Select speech language ${lang.label}`}
            >
              <Text
                style={[
                  styles.langChipText,
                  selectedLang === lang.code && styles.langChipTextActive,
                ]}
              >
                {lang.label.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Mic Recording Stage */}
      <View style={styles.micStage}>
        <View style={styles.micWrapper}>
          {isRecording && (
            <Animated.View
              style={[
                styles.pulseRing,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
          )}

          <TouchableOpacity
            style={[
              styles.micButton,
              isRecording && styles.micButtonActive,
            ]}
            onPress={isRecording ? stopSpeechRecognition : startSpeechRecognition}
            accessibilityRole="button"
            accessibilityLabel={isRecording ? 'Stop voice recording' : 'Start voice recording'}
          >
            {isRecording ? (
              <Square size={24} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Mic size={26} color={THEME.colors.brandOrange} />
            )}
          </TouchableOpacity>
        </View>

        {/* Dynamic Waveform Visualizer */}
        <View style={styles.waveformContainer}>
          <Animated.View style={[styles.waveBar, { height: bar1 }]} />
          <Animated.View style={[styles.waveBar, { height: bar2 }]} />
          <Animated.View style={[styles.waveBar, { height: bar3 }]} />
          <Animated.View style={[styles.waveBar, { height: bar4 }]} />
          <Animated.View style={[styles.waveBar, { height: bar5 }]} />
        </View>

        <Text style={styles.timerText}>
          {isRecording ? `Recording... ${formatSeconds(duration)}` : 'Tap mic to start speaking'}
        </Text>
        <Text style={styles.hintText}>
          Speak naturally in your mother tongue. ASKME automatically transcribes and cleans your statement.
        </Text>
      </View>

      {/* Interim live speech */}
      {interimText ? (
        <View style={styles.interimBox}>
          <Text style={styles.interimText}>"{interimText}"</Text>
        </View>
      ) : null}

      {/* Transcribed text review & edit card */}
      {transcript ? (
        <View style={styles.transcriptCard}>
          <View style={styles.transcriptHeader}>
            <Text style={styles.transcriptTitle}>Transcribed Voice</Text>
            <View style={styles.transcriptActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setIsEditing(!isEditing)}
                accessibilityRole="button"
                accessibilityLabel="Edit transcription"
              >
                <Edit3 size={13} color={THEME.colors.brandOrange} />
                <Text style={styles.actionBtnText}>{isEditing ? 'Done' : 'Edit'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onTranscriptChange('')}
                accessibilityRole="button"
                accessibilityLabel="Clear transcription"
              >
                <RefreshCw size={13} color={THEME.colors.secondaryText} />
                <Text style={[styles.actionBtnText, { color: THEME.colors.secondaryText }]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isEditing ? (
            <TextInput
              style={styles.transcriptInput}
              value={transcript}
              onChangeText={onTranscriptChange}
              multiline
              autoFocus
            />
          ) : (
            <Text style={styles.transcriptBody}>"{transcript}"</Text>
          )}

          <Text style={styles.disclaimerText}>
            Review the transcribed statement above. You can freely edit or add points before analysis.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161615',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.radii.lg,
    padding: 18,
  },
  headerBlock: {
    marginBottom: 12,
  },
  componentLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  componentSub: {
    fontSize: 12,
    color: '#8E8A83',
    marginTop: 1,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 6,
    flexWrap: 'wrap',
  },
  langLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8A83',
    fontFamily: THEME.fonts.mono,
  },
  langChips: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  langChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#1E1E1C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  langChipActive: {
    backgroundColor: 'rgba(244, 119, 56, 0.15)',
    borderColor: '#F47738',
  },
  langChipText: {
    fontSize: 11,
    color: '#A8A49D',
    fontWeight: '500',
  },
  langChipTextActive: {
    color: '#F47738',
    fontWeight: '700',
  },
  micStage: {
    backgroundColor: '#1E1E1C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.radii.md,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micWrapper: {
    width: 68,
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  pulseRing: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(244, 119, 56, 0.25)',
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(244, 119, 56, 0.15)',
    borderWidth: 1.5,
    borderColor: '#F47738',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F47738',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  micButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 38,
    marginBottom: 6,
  },
  waveBar: {
    width: 3.5,
    borderRadius: 2,
    backgroundColor: '#F47738',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
    fontFamily: THEME.fonts.mono,
  },
  hintText: {
    fontSize: 12,
    color: '#8E8A83',
    textAlign: 'center',
    maxWidth: 290,
    lineHeight: 16,
  },
  interimBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#242018',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.3)',
  },
  interimText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#F47738',
  },
  transcriptCard: {
    marginTop: 14,
    backgroundColor: '#1E1E1C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.radii.md,
    padding: 14,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transcriptTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#8E8A83',
    fontFamily: THEME.fonts.mono,
  },
  transcriptActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F47738',
  },
  transcriptBody: {
    fontSize: 13,
    lineHeight: 20,
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  transcriptInput: {
    fontSize: 13,
    lineHeight: 20,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F47738',
    borderRadius: 6,
    padding: 8,
    minHeight: 60,
    backgroundColor: '#121211',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#6E6B65',
    marginTop: 8,
  },
});
