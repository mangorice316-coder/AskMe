import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform, Alert, Linking } from 'react-native';
import { Check, ArrowRight, ExternalLink, ShieldCheck, Copy, Cpu, Sparkles, Mail } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { THEME } from '../theme/tokens';
import { soundFx } from '../utils/soundEffects';
import { CivicSummaryResult } from '../services/openSourceSummarizer';

interface SuccessScreenProps {
  authorityName?: string;
  complaintId?: string;
  officialEmail?: string;
  grievancePortal?: string;
  letterText?: string;
  summaryResult?: CivicSummaryResult | null;
  onReportAnother: () => void;
  onGoToVault: () => void;
}

export default function SuccessScreen({
  authorityName = 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
  complaintId = 'ASKME-2026-001234',
  officialEmail,
  grievancePortal,
  letterText,
  summaryResult,
  onReportAnother,
  onGoToVault,
}: SuccessScreenProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseGlow = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    soundFx.playChime();

    // Scale spring in
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 60,
      useNativeDriver: false,
    }).start();

    // Radiant green pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseGlow, {
          toValue: 1.25,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseGlow, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const handleCopyId = async () => {
    soundFx.playClick();
    await Clipboard.setStringAsync(complaintId);
    Alert.alert('Copied to Clipboard', `Complaint ID ${complaintId} copied.`);
  };

  return (
    <View style={styles.container}>
      {/* Background Ambient Glow */}
      <View style={styles.ambientGreenGlow} />

      {/* Main Confirmation Container (Matches concept1_submission_confirmation.jpg) */}
      <Animated.View style={[styles.dialogCard, { transform: [{ scale: scaleAnim }] }]}>
        {/* Glowing Green Check Circle */}
        <View style={styles.checkCircleWrapper}>
          <Animated.View
            style={[
              styles.checkGlowHalo,
              { transform: [{ scale: pulseGlow }] },
            ]}
          />
          <View style={styles.checkCircleCore}>
            <Check size={38} color="#FFFFFF" strokeWidth={3.5} />
          </View>
        </View>

        {/* Headlines */}
        <Text style={styles.title}>Your Complaint Has Been Sent!</Text>
        <Text style={styles.subtitle}>
          Your complaint has been successfully prepared and queued for submission to the{' '}
          <Text style={styles.authorityHighlight}>{authorityName}</Text>.
        </Text>

        {/* Complaint ID Card */}
        <View style={styles.idCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.idLabel}>Complaint ID</Text>
            <Text style={styles.idValue}>{complaintId}</Text>
          </View>

          <TouchableOpacity
            style={styles.trackButton}
            onPress={handleCopyId}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Copy Complaint Tracking ID"
          >
            <Copy size={12} color="#FFFFFF" />
            <Text style={styles.trackButtonText}>Copy ID</Text>
          </TouchableOpacity>
        </View>

        {/* AI Action Executive Summary Briefing */}
        {summaryResult && (
          <View style={styles.aiBriefingBox}>
            <View style={styles.aiBriefingHeader}>
              <View style={styles.aiBriefingTag}>
                <Cpu size={12} color="#F47738" />
                <Text style={styles.aiBriefingTagText}>{summaryResult.modelIdentifier}</Text>
              </View>
              <View style={styles.aiBriefingBadge}>
                <Sparkles size={10} color="#22C55E" />
                <Text style={styles.aiBriefingBadgeText}>AI Action Verified</Text>
              </View>
            </View>
            <Text style={styles.aiBriefingText}>{summaryResult.summaryText}</Text>
          </View>
        )}

        {/* Dispatched Authority Channels */}
        {(grievancePortal || officialEmail) && (
          <View style={styles.channelsBox}>
            <Text style={styles.channelsTitle}>Dispatched Official Channels:</Text>
            <View style={styles.channelsRow}>
              {grievancePortal && (
                <TouchableOpacity
                  style={styles.channelPill}
                  onPress={() => {
                    soundFx.playClick();
                    if (Platform.OS === 'web') {
                      window.open(grievancePortal, '_blank');
                    } else {
                      Linking.openURL(grievancePortal);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <ExternalLink size={12} color="#F47738" />
                  <Text style={styles.channelPillText}>Open Grievance Portal</Text>
                </TouchableOpacity>
              )}

              {officialEmail && (
                <TouchableOpacity
                  style={styles.channelPill}
                  onPress={() => {
                    soundFx.playClick();
                    const mailto = `mailto:${officialEmail}?subject=${encodeURIComponent(
                      `Urgent Grievance Follow-up [Ref: ${complaintId}]`
                    )}&body=${encodeURIComponent(letterText || '')}`;
                    if (Platform.OS === 'web') {
                      window.location.href = mailto;
                    } else {
                      Linking.openURL(mailto);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Mail size={12} color="#22C55E" />
                  <Text style={styles.channelPillText}>Official Email: {officialEmail}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <Text style={styles.noticeText}>
          You will receive updates on your complaint status via email and official portal notifications.
        </Text>

        {/* Action Buttons (Matches concept1_submission_confirmation.jpg) */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.primaryReportBtn}
            onPress={() => {
              soundFx.playClick();
              onReportAnother();
            }}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Report another issue"
          >
            <Text style={styles.primaryReportBtnText}>Report Another Issue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryVaultBtn}
            onPress={() => {
              soundFx.playClick();
              onGoToVault();
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go to dashboard or vault"
          >
            <Text style={styles.secondaryVaultBtnText}>Go to Vault</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0C',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
  },
  ambientGreenGlow: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    filter: Platform.OS === 'web' ? 'blur(90px)' : undefined,
  },
  dialogCard: {
    maxWidth: 580,
    width: '100%',
    backgroundColor: 'rgba(26, 26, 24, 0.92)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 36,
    alignItems: 'center',
    textAlign: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 10,
    zIndex: 10,
  },
  checkCircleWrapper: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  checkGlowHalo: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(34, 197, 94, 0.35)',
  },
  checkCircleCore: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  subtitle: {
    fontSize: 14,
    color: '#A8A49D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 460,
  },
  authorityHighlight: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  idCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161615',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  idLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#77736E',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: THEME.fonts.mono,
  },
  idValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: THEME.fonts.mono,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: THEME.radii.pill,
  },
  trackButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aiBriefingBox: {
    width: '100%',
    backgroundColor: '#161615',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.25)',
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  aiBriefingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  aiBriefingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(244, 119, 56, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  aiBriefingTagText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'web' ? 'JetBrains Mono, monospace' : 'monospace',
    color: '#F47738',
    fontWeight: '600',
  },
  aiBriefingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  aiBriefingBadgeText: {
    fontSize: 10,
    color: '#22C55E',
    fontWeight: '600',
  },
  aiBriefingText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#D8D2C7',
    textAlign: 'left',
  },
  channelsBox: {
    width: '100%',
    backgroundColor: 'rgba(244, 119, 56, 0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.2)',
    padding: 14,
    marginBottom: 16,
  },
  channelsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A8A49D',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  channelsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  channelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E1E1C',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  channelPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noticeText: {
    fontSize: 12,
    color: '#77736E',
    textAlign: 'center',
    marginBottom: 28,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryReportBtn: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#F47738',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: THEME.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F47738',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryReportBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryVaultBtn: {
    flex: 1,
    minWidth: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: THEME.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryVaultBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
