import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import Svg, { Circle, Path, Line, Defs, RadialGradient, Stop } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  Building2,
  ExternalLink,
  Copy,
  Download,
  Edit3,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Compass,
  Mail,
  Send,
} from 'lucide-react-native';
import { THEME } from '../theme/tokens';
import { ComplaintAnalysisResult } from '../services/aiEngine';
import { PhotoItem } from './PhotoUploader';
import SuccessScreen from './SuccessScreen';
import CivicActionSummaryCard from './CivicActionSummaryCard';
import {
  generateCivicActionSummary,
  CivicSummaryResult,
  CivicWorkflowTelemetry,
} from '../services/openSourceSummarizer';
import { soundFx } from '../utils/soundEffects';

interface AnalysisResultsProps {
  analysis: ComplaintAnalysisResult;
  photos: PhotoItem[];
  onRegenerateLetter: (tone: 'Formal' | 'Assertive' | 'Urgent' | 'Legal', language: string) => Promise<void>;
  onBackToEdit: () => void;
  onSaveToHistory: (letterText: string, status: 'Draft' | 'Submitted') => void;
}

export default function AnalysisResults({
  analysis,
  photos,
  onRegenerateLetter,
  onBackToEdit,
  onSaveToHistory,
}: AnalysisResultsProps) {
  const [editedLetter, setEditedLetter] = useState(analysis.formalLetter);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedComplaintId] = useState(
    `ASKME-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [civicSummary, setCivicSummary] = useState<CivicSummaryResult | null>(null);

  const { authorityMatch } = analysis;
  const primaryAuth = authorityMatch.primaryAuthority;

  useEffect(() => {
    let isMounted = true;
    const telemetry: CivicWorkflowTelemetry = {
      complaintId: generatedComplaintId,
      mainIssue: analysis.mainIssue,
      category: analysis.category,
      severity: analysis.severity,
      location: primaryAuth.jurisdiction || 'Local Municipal Ward',
      photoCount: photos.length,
      authorityName: primaryAuth.name,
      authorityJurisdiction: primaryAuth.jurisdiction,
      authorityPortal: primaryAuth.grievancePortal,
      letterSubject: analysis.letterSubject,
      status: isSubmitted ? 'Submitted' : 'Prepared',
    };

    generateCivicActionSummary(telemetry).then((result) => {
      if (isMounted) setCivicSummary(result);
    });

    return () => {
      isMounted = false;
    };
  }, [analysis, photos.length, generatedComplaintId, isSubmitted]);

  const handleCopyLetter = async () => {
    soundFx.playClick();
    try {
      await Clipboard.setStringAsync(editedLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Copy Notice', 'Could not copy letter to clipboard.');
    }
  };

  const handlePrintPdf = async () => {
    soundFx.playClick();
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${analysis.letterSubject}</title>
            <style>
              body {
                font-family: 'Times New Roman', Times, serif;
                padding: 48px;
                color: #191918;
                line-height: 1.6;
                font-size: 14px;
                max-width: 800px;
                margin: 0 auto;
              }
              .header {
                border-bottom: 2px solid #F47738;
                padding-bottom: 12px;
                margin-bottom: 24px;
              }
              .brand {
                font-size: 20px;
                font-weight: bold;
                color: #F47738;
              }
              .subject {
                font-size: 16px;
                font-weight: bold;
                margin: 20px 0;
              }
              .content {
                white-space: pre-wrap;
              }
              .stamp {
                margin-top: 40px;
                display: inline-block;
                border: 2px dashed #2563EB;
                color: #2563EB;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="brand">ASKME — OFFICIAL CITIZEN GRIEVANCE PETITION</div>
              <div>Statutory Redressal Reference: ${generatedComplaintId}</div>
            </div>
            <div class="content">${editedLetter}</div>
            <div class="stamp">
              VERIFIED CITIZEN PETITION<br/>
              DIGITALLY CERTIFIED FOR JURISDICTION
            </div>
          </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        const printWin = window.open('', '_blank');
        if (printWin) {
          printWin.document.write(html);
          printWin.document.close();
          printWin.focus();
          printWin.print();
        }
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri);
      }
    } catch {
      Alert.alert('PDF Notice', 'Unable to create PDF representation.');
    }
  };

  const handleSendToAuthority = async () => {
    soundFx.playChime();
    setIsSubmitting(true);
    onSaveToHistory(editedLetter, 'Submitted');

    // 1. Automatically copy formal letter to clipboard for instant use in any portal form
    try {
      await Clipboard.setStringAsync(editedLetter);
    } catch {
      // ignore clipboard error
    }

    // 2. Prepare official email dispatch
    const targetEmail = primaryAuth.officialEmail || 'grievance@municipal.gov.in';
    const emailSubject = encodeURIComponent(`${analysis.letterSubject} [Ref: ${generatedComplaintId}]`);
    const emailBody = encodeURIComponent(
      `${editedLetter}\n\n---\nTransmitted via ASKME Citizen Grievance Redressal Assistant (Digital Reference: ${generatedComplaintId})`
    );
    const mailtoUrl = `mailto:${targetEmail}?subject=${emailSubject}&body=${emailBody}`;

    // 3. Automatically dispatch: Open official portal and launch email client
    try {
      if (Platform.OS === 'web') {
        if (primaryAuth.grievancePortal) {
          window.open(primaryAuth.grievancePortal, '_blank');
        }
        if (primaryAuth.officialEmail) {
          setTimeout(() => {
            window.location.href = mailtoUrl;
          }, 350);
        }
      } else {
        if (primaryAuth.officialEmail) {
          await Linking.openURL(mailtoUrl);
        } else if (primaryAuth.grievancePortal) {
          await Linking.openURL(primaryAuth.grievancePortal);
        }
      }
    } catch (e) {
      console.warn('Auto dispatch error', e);
    }

    // 4. Update FLAN-T5 Civic Action Summary with Submitted status
    const submittedTelemetry: CivicWorkflowTelemetry = {
      complaintId: generatedComplaintId,
      mainIssue: analysis.mainIssue,
      category: analysis.category,
      severity: analysis.severity,
      location: primaryAuth.jurisdiction || 'Local Municipal Ward',
      photoCount: photos.length,
      authorityName: primaryAuth.name,
      authorityJurisdiction: primaryAuth.jurisdiction,
      authorityPortal: primaryAuth.grievancePortal,
      letterSubject: analysis.letterSubject,
      status: 'Submitted',
    };
    const updatedSummary = await generateCivicActionSummary(submittedTelemetry);
    setCivicSummary(updatedSummary);

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  // If user completed submission, render the radiant SuccessScreen (concept1_submission_confirmation.jpg)
  if (isSubmitted) {
    return (
      <SuccessScreen
        authorityName={primaryAuth.name}
        complaintId={generatedComplaintId}
        officialEmail={primaryAuth.officialEmail}
        grievancePortal={primaryAuth.grievancePortal}
        letterText={editedLetter}
        summaryResult={civicSummary}
        onReportAnother={onBackToEdit}
        onGoToVault={onBackToEdit}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ================= 0. AI ACTION EXECUTIVE SUMMARY ================= */}
      {civicSummary && (
        <CivicActionSummaryCard
          summaryResult={civicSummary}
          complaintId={generatedComplaintId}
        />
      )}

      {/* ================= 1. RESPONSIBLE AUTHORITY VIEW ================= */}
      {/* Matches concept2_authority_identification.jpg */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Responsible Authority</Text>
          <Text style={styles.sectionSubtitle}>
            Statutory department identified through municipal jurisdiction matching.
          </Text>
        </View>

        <View style={styles.authorityGrid}>
          {/* Left: Dark Radar Map with Road Network and Pin */}
          <View style={styles.mapTileBox}>
            <View style={styles.radarMap}>
              <Svg width="100%" height={220} viewBox="0 0 340 220" fill="none">
                <Defs>
                  <RadialGradient id="authPingGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#F47738" stopOpacity="0.45" />
                    <Stop offset="70%" stopColor="#F47738" stopOpacity="0.1" />
                    <Stop offset="100%" stopColor="#F47738" stopOpacity="0" />
                  </RadialGradient>
                </Defs>

                {/* Dark road network grid */}
                <Path d="M 20 40 L 320 60" stroke="#262623" strokeWidth="2.5" />
                <Path d="M 10 120 L 330 110" stroke="#262623" strokeWidth="2.5" />
                <Path d="M 30 190 L 310 180" stroke="#262623" strokeWidth="2" />
                <Path d="M 80 10 L 110 210" stroke="#262623" strokeWidth="2" />
                <Path d="M 230 10 L 210 210" stroke="#262623" strokeWidth="2" />

                {/* Road labels */}
                <Text style={styles.svgMapLabel1}>MG ROAD</Text>
                <Text style={styles.svgMapLabel2}>KORAMANGALA</Text>
                <Text style={styles.svgMapLabel3}>DOMLUR</Text>
                <Text style={styles.svgMapLabel4}>INDIRANAGAR</Text>

                {/* Glowing Orange Arterial Ray pointing to authority card */}
                <Path
                  d="M 160 110 Q 240 90 340 80"
                  stroke="#F47738"
                  strokeWidth="2"
                  strokeOpacity="0.9"
                  fill="none"
                />

                {/* Concentric Ping Rings */}
                <Circle cx="160" cy="110" r="48" fill="url(#authPingGlow)" />
                <Circle
                  cx="160"
                  cy="110"
                  r="36"
                  stroke="#F47738"
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                  strokeDasharray="4 4"
                  fill="none"
                />
                <Circle
                  cx="160"
                  cy="110"
                  r="18"
                  stroke="#F47738"
                  strokeWidth="2"
                  strokeOpacity="0.8"
                  fill="none"
                />

                {/* Dropped Location Pin Marker */}
                <Circle cx="160" cy="110" r="9" fill="#F47738" />
                <Circle cx="160" cy="110" r="3.5" fill="#FFFFFF" />
              </Svg>
            </View>

            {/* Why This Authority Box */}
            <View style={styles.whyBox}>
              <Text style={styles.whyTitle}>Why this authority?</Text>
              <Text style={styles.whyText}>
                {authorityMatch.reason ||
                  `This issue falls under ${primaryAuth.name}'s statutory jurisdiction as per the location and category of your complaint.`}
              </Text>
            </View>
          </View>

          {/* Right: Verified Authority Dark Glass Card */}
          <View style={styles.authCard}>
            <View style={styles.authEmblemRow}>
              <View style={styles.authMonumentIcon}>
                <Building2 size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.authNameText}>{primaryAuth.name}</Text>
                <Text style={styles.authDeptText}>
                  {primaryAuth.category || 'Building & Infrastructure Department'}
                </Text>
              </View>
            </View>

            <View style={styles.authDivider} />

            {/* Official Website */}
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => {
                if (primaryAuth.officialWebsite) {
                  Linking.openURL(primaryAuth.officialWebsite);
                }
              }}
            >
              <View style={styles.linkDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.linkLabel}>Official Website</Text>
                <Text style={styles.linkValue}>
                  {primaryAuth.officialWebsite.replace(/^https?:\/\//, '')}
                </Text>
              </View>
              <ExternalLink size={13} color="#F47738" />
            </TouchableOpacity>

            {/* Grievance Redressal Portal */}
            <TouchableOpacity
              style={styles.linkRow}
              onPress={handleSendToAuthority}
              activeOpacity={0.8}
            >
              <View style={[styles.linkDot, { backgroundColor: '#F47738' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.linkLabel}>Grievance Redressal</Text>
                <Text style={styles.linkValue}>
                  {primaryAuth.grievancePortal.replace(/^https?:\/\//, '')}
                </Text>
              </View>
              <ExternalLink size={13} color="#F47738" />
            </TouchableOpacity>

            {/* Official Grievance Email */}
            {primaryAuth.officialEmail && (
              <TouchableOpacity
                style={styles.linkRow}
                onPress={handleSendToAuthority}
                activeOpacity={0.8}
              >
                <View style={[styles.linkDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.linkLabel}>Email Department</Text>
                  <Text style={styles.linkValue}>{primaryAuth.officialEmail}</Text>
                </View>
                <Mail size={13} color="#22C55E" />
              </TouchableOpacity>
            )}

            {/* Verified Badge */}
            <View style={styles.verifiedRow}>
              <CheckCircle2 size={16} color="#22C55E" />
              <Text style={styles.verifiedText}>Verified Authority</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ================= 2. YOUR COMPLAINT LETTER (TACTILE DOCUMENT) ================= */}
      {/* Matches concept2_complaint_document.jpg */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Complaint Letter</Text>
          <Text style={styles.sectionSubtitle}>
            Review and edit your formal complaint letter before sending.
          </Text>
        </View>

        <View style={styles.letterGrid}>
          {/* Left: Tactile Formal Ivory Paper Sheet */}
          <View style={styles.paperSheetWrapper}>
            <View style={styles.paperSheet}>
              {/* Blue Official Statutory Stamp Seal (matches concept2_complaint_document.jpg) */}
              <View style={styles.stampSeal}>
                <Svg width={64} height={64} viewBox="0 0 80 80" fill="none">
                  <Circle cx="40" cy="40" r="36" stroke="#2563EB" strokeWidth="2" strokeDasharray="3 2" />
                  <Circle cx="40" cy="40" r="30" stroke="#2563EB" strokeWidth="1" />
                  <Path d="M 22 45 Q 40 28 58 40" stroke="#2563EB" strokeWidth="1.5" fill="none" />
                  <Path d="M 28 50 Q 42 35 52 48" stroke="#2563EB" strokeWidth="1.2" fill="none" />
                </Svg>
                <Text style={styles.stampText}>SEAL</Text>
              </View>

              {isEditing ? (
                <TextInput
                  style={styles.paperInput}
                  value={editedLetter}
                  onChangeText={setEditedLetter}
                  multiline
                  autoFocus
                />
              ) : (
                <Text style={styles.paperText}>{editedLetter}</Text>
              )}
            </View>
          </View>

          {/* Right: Actions Tray (matches concept2_complaint_document.jpg right side) */}
          <View style={styles.letterActionsCol}>
            {/* Edit Letter */}
            <TouchableOpacity
              style={styles.actionPill}
              onPress={() => {
                soundFx.playClick();
                setIsEditing(!isEditing);
              }}
              activeOpacity={0.8}
            >
              <Edit3 size={15} color="#FFFFFF" />
              <Text style={styles.actionPillText}>
                {isEditing ? 'Save Letter' : 'Edit Letter'}
              </Text>
            </TouchableOpacity>

            {/* Download PDF */}
            <TouchableOpacity
              style={styles.actionPill}
              onPress={handlePrintPdf}
              activeOpacity={0.8}
            >
              <Download size={15} color="#F47738" />
              <Text style={styles.actionPillText}>Download PDF</Text>
            </TouchableOpacity>

            {/* Copy Letter */}
            <TouchableOpacity
              style={styles.actionPill}
              onPress={handleCopyLetter}
              activeOpacity={0.8}
            >
              <Copy size={15} color="#F47738" />
              <Text style={styles.actionPillText}>
                {copied ? 'Copied!' : 'Copy Letter'}
              </Text>
            </TouchableOpacity>

            {/* Radiant Orange Primary Button: "Send to Authority →" */}
            <TouchableOpacity
              style={[styles.sendAuthorityBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSendToAuthority}
              activeOpacity={0.88}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Send formal complaint to authority"
            >
              <Send size={15} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.sendAuthorityBtnText}>
                {isSubmitting ? 'Sending to Authority...' : 'Send to Authority'}
              </Text>
              <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0C',
  },
  content: {
    padding: 24,
    paddingBottom: 72,
    maxWidth: 1120,
    width: '100%',
    alignSelf: 'center',
    gap: 36,
  },
  sectionCard: {
    backgroundColor: '#161615',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 28,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8E8A83',
    marginTop: 3,
  },
  authorityGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 20,
  },
  mapTileBox: {
    flex: 1,
    gap: 12,
  },
  radarMap: {
    height: 220,
    backgroundColor: '#0F0F0E',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
  },
  svgMapLabel1: {
    position: 'absolute',
    top: 50,
    left: 40,
    fontSize: 8,
    fontWeight: '800',
    color: '#6E6B65',
    fontFamily: THEME.fonts.mono,
  },
  svgMapLabel2: {
    position: 'absolute',
    bottom: 40,
    left: 80,
    fontSize: 8,
    fontWeight: '800',
    color: '#6E6B65',
    fontFamily: THEME.fonts.mono,
  },
  svgMapLabel3: {
    position: 'absolute',
    top: 60,
    right: 40,
    fontSize: 8,
    fontWeight: '800',
    color: '#6E6B65',
    fontFamily: THEME.fonts.mono,
  },
  svgMapLabel4: {
    position: 'absolute',
    top: 20,
    right: 80,
    fontSize: 8,
    fontWeight: '800',
    color: '#6E6B65',
    fontFamily: THEME.fonts.mono,
  },
  whyBox: {
    backgroundColor: '#1E1E1C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
  },
  whyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  whyText: {
    fontSize: 12,
    color: '#A8A49D',
    lineHeight: 18,
  },
  authCard: {
    flex: 1,
    backgroundColor: '#1E1E1C',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
    justifyContent: 'space-between',
  },
  authEmblemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  authMonumentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  authNameText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 22,
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  authDeptText: {
    fontSize: 12,
    color: '#8E8A83',
    marginTop: 2,
  },
  authDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  linkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A8A49D',
  },
  linkLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#77736E',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontFamily: THEME.fonts.mono,
  },
  linkValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#22C55E',
  },
  letterGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 20,
    alignItems: 'flex-start',
  },
  paperSheetWrapper: {
    flex: 3,
    width: '100%',
  },
  paperSheet: {
    backgroundColor: '#F5F3EE',
    borderRadius: 18,
    padding: 32,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
    minHeight: 380,
  },
  stampSeal: {
    position: 'absolute',
    bottom: 24,
    right: 28,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.85,
  },
  stampText: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '900',
    color: '#2563EB',
    fontFamily: THEME.fonts.mono,
  },
  paperText: {
    fontSize: 13,
    lineHeight: 22,
    color: '#191918',
    fontFamily: THEME.fonts.mono,
  },
  paperInput: {
    fontSize: 13,
    lineHeight: 22,
    color: '#191918',
    fontFamily: THEME.fonts.mono,
    minHeight: 340,
  },
  letterActionsCol: {
    flex: 1,
    minWidth: 200,
    width: '100%',
    gap: 12,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E1E1C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sendAuthorityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F47738',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: '#F47738',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 6,
    marginTop: 6,
  },
  sendAuthorityBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
