import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  Sparkles,
  ArrowRight,
  Shield,
  User,
  Phone,
  Mail,
  Home,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react-native';
import { THEME } from '../theme/tokens';
import PhotoUploader, { PhotoItem } from './PhotoUploader';
import VoiceInput from './VoiceInput';
import TextInputCard from './TextInputCard';
import LocationSelector from './LocationSelector';
import { LocationCoordinates } from '../services/locationService';
import { UserComplaintInput } from '../services/aiEngine';

interface ReportingWorkspaceProps {
  onAnalyze: (input: UserComplaintInput) => void;
  isAnalyzing: boolean;
}

export default function ReportingWorkspace({ onAnalyze, isAnalyzing }: ReportingWorkspaceProps) {
  // Input states
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [textDescription, setTextDescription] = useState('');

  // Location states
  const [problemAddress, setProblemAddress] = useState('Anna Salai, Chennai, Tamil Nadu');
  const [problemCity, setProblemCity] = useState('Chennai');
  const [problemDistrict, setProblemDistrict] = useState('Chennai');
  const [problemState, setProblemState] = useState('Tamil Nadu');
  const [problemCoords, setProblemCoords] = useState<LocationCoordinates | undefined>({
    latitude: 13.0604,
    longitude: 80.2496,
  });

  // Optional citizen correspondence details
  const [showPersonalDetails, setShowPersonalDetails] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderAddress, setSenderAddress] = useState('');

  // Tone and Language preferences
  const [preferredTone, setPreferredTone] = useState<'Formal' | 'Assertive' | 'Urgent' | 'Legal'>('Formal');
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  const hasAtLeastOneInput =
    photos.length > 0 || voiceTranscript.trim().length > 0 || textDescription.trim().length > 0;

  const handleAnalyzeClick = () => {
    if (!hasAtLeastOneInput) {
      Alert.alert(
        'Missing Input',
        'Please provide at least one form of evidence: upload a photo, record a voice description, or type your complaint.'
      );
      return;
    }

    if (!problemAddress.trim()) {
      Alert.alert('Missing Location', 'Please specify the problem location so ASKME can find the correct authority.');
      return;
    }

    onAnalyze({
      photos,
      voiceTranscript,
      textDescription,
      problemLocation: {
        address: problemAddress,
        city: problemCity,
        district: problemDistrict,
        state: problemState,
        coordinates: problemCoords,
      },
      senderDetails: {
        name: senderName.trim() || undefined,
        phone: senderPhone.trim() || undefined,
        email: senderEmail.trim() || undefined,
        residentialAddress: senderAddress.trim() || undefined,
      },
      preferredTone,
      preferredLanguage,
    });
  };

  const handleExifGpsDiscovered = (coords: LocationCoordinates, formattedAddr: string) => {
    Alert.alert(
      'Photo GPS Detected',
      `Would you like to use the photograph's embedded GPS location for this complaint?\n\n"${formattedAddr}"`,
      [
        { text: 'Keep Current', style: 'cancel' },
        {
          text: 'Use Photo Location',
          onPress: () => {
            setProblemAddress(formattedAddr);
            setProblemCoords(coords);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Step Indicator Bar (Section 07) */}
      <View style={styles.stepIndicatorBar}>
        <View style={styles.stepItemActive}>
          <View style={styles.stepBadgeActive}>
            <Text style={styles.stepBadgeTextActive}>1</Text>
          </View>
          <Text style={styles.stepLabelActive}>REPORT</Text>
        </View>

        <View style={styles.stepConnector} />

        <View style={styles.stepItem}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>2</Text>
          </View>
          <Text style={styles.stepLabel}>ANALYZE</Text>
        </View>

        <View style={styles.stepConnector} />

        <View style={styles.stepItem}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>3</Text>
          </View>
          <Text style={styles.stepLabel}>REVIEW</Text>
        </View>

        <View style={styles.stepConnector} />

        <View style={styles.stepItem}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>4</Text>
          </View>
          <Text style={styles.stepLabel}>GENERATE</Text>
        </View>
      </View>

      {/* 2. Workspace Headline */}
      <View style={styles.header} testID="askme-reveal">
        <Text style={styles.headline}>What's happening in your area?</Text>
        <Text style={styles.description}>
          Provide evidence through photo, voice, text, or any combination. All inputs are combined by AI into a single verified report.
        </Text>
      </View>

      {/* INPUT 1: Photo Reporting (Upload a Photo / Show us what happened) */}
      <View style={styles.inputSection} testID="askme-reveal">
        <PhotoUploader
          photos={photos}
          onPhotosChange={setPhotos}
          onGpsDiscovered={handleExifGpsDiscovered}
        />
      </View>

      {/* INPUT 2: Voice Reporting (Tell Us by Voice / Explain the issue in your own words) */}
      <View style={styles.inputSection} testID="askme-reveal">
        <VoiceInput
          transcript={voiceTranscript}
          onTranscriptChange={setVoiceTranscript}
        />
      </View>

      {/* INPUT 3: Text Reporting (Describe the Problem / Write a short explanation) */}
      <View style={styles.inputSection} testID="askme-reveal">
        <TextInputCard
          value={textDescription}
          onChangeText={setTextDescription}
        />
      </View>

      {/* DEDICATED LOCATION SELECTOR */}
      <View style={styles.inputSection} testID="askme-reveal">
        <LocationSelector
          problemAddress={problemAddress}
          problemCity={problemCity}
          problemDistrict={problemDistrict}
          problemState={problemState}
          problemCoords={problemCoords}
          onProblemLocationChange={(loc) => {
            setProblemAddress(loc.address);
            if (loc.city) setProblemCity(loc.city);
            if (loc.district) setProblemDistrict(loc.district);
            if (loc.state) setProblemState(loc.state);
            if (loc.coordinates) setProblemCoords(loc.coordinates);
          }}
          senderAddress={senderAddress}
          onSenderAddressChange={setSenderAddress}
          showSenderAddressField={showPersonalDetails}
        />
      </View>

      {/* OPTIONAL CITIZEN DETAILS ACCORDION */}
      <View style={styles.accordionContainer}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setShowPersonalDetails(!showPersonalDetails)}
          accessibilityRole="button"
          accessibilityLabel="Toggle optional personal information for formal letter"
        >
          <View style={styles.accordionTitleRow}>
            <User size={16} color={THEME.colors.brandOrange} />
            <Text style={styles.accordionTitle}>Optional Citizen Details for Letter</Text>
          </View>
          {showPersonalDetails ? (
            <ChevronUp size={18} color={THEME.colors.secondaryText} />
          ) : (
            <ChevronDown size={18} color={THEME.colors.secondaryText} />
          )}
        </TouchableOpacity>

        {showPersonalDetails && (
          <View style={styles.accordionBody}>
            <Text style={styles.accordionHint}>
              Supplying contact details adds credibility to your formal petition, but you may report completely anonymously.
            </Text>

            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Anand Kumar"
                placeholderTextColor={THEME.colors.mutedText}
                value={senderName}
                onChangeText={setSenderName}
              />
            </View>

            <View style={styles.splitRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={THEME.colors.mutedText}
                  keyboardType="phone-pad"
                  value={senderPhone}
                  onChangeText={setSenderPhone}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="anand@example.com"
                  placeholderTextColor={THEME.colors.mutedText}
                  keyboardType="email-address"
                  value={senderEmail}
                  onChangeText={setSenderEmail}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* PRIMARY CTA: ANALYZE MY COMPLAINT */}
      <View style={styles.submitSection}>
        <TouchableOpacity
          style={[
            styles.analyzeBtn,
            !hasAtLeastOneInput && styles.analyzeBtnDisabled,
          ]}
          onPress={handleAnalyzeClick}
          disabled={!hasAtLeastOneInput || isAnalyzing}
          accessibilityRole="button"
          accessibilityLabel="Analyze my complaint"
        >
          {isAnalyzing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.analyzeBtnText}>Analyze My Complaint →</Text>
              <Sparkles size={17} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        {!hasAtLeastOneInput && (
          <Text style={styles.validationNotice}>
            Attach a photograph, record your voice, or type a description to enable AI analysis.
          </Text>
        )}
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
    padding: 20,
    paddingBottom: 64,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    gap: 18,
  },
  stepIndicatorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#161615',
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 6,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#262624',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F47738',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8A83',
    fontFamily: THEME.fonts.mono,
  },
  stepBadgeTextActive: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: THEME.fonts.mono,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8A83',
    letterSpacing: 0.5,
    fontFamily: THEME.fonts.mono,
  },
  stepLabelActive: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontFamily: THEME.fonts.mono,
  },
  stepConnector: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 8,
  },
  header: {
    marginTop: 4,
    marginBottom: 4,
  },
  headline: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 6,
    fontFamily: Platform.OS === 'web' ? 'Sora, Space Grotesk, sans-serif' : undefined,
  },
  description: {
    fontSize: 15,
    color: '#A8A49D',
    lineHeight: 22,
  },
  inputSection: {
    gap: 8,
  },
  accordionContainer: {
    backgroundColor: '#161615',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.radii.lg,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accordionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  accordionBody: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  accordionHint: {
    fontSize: 11,
    color: '#8E8A83',
    marginTop: 8,
  },
  inputRow: {
    gap: 4,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A8A49D',
    fontFamily: THEME.fonts.mono,
  },
  fieldInput: {
    backgroundColor: '#1E1E1C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#FFFFFF',
  },
  submitSection: {
    marginTop: 8,
    alignItems: 'center',
    gap: 8,
  },
  analyzeBtn: {
    width: '100%',
    backgroundColor: '#F47738',
    paddingVertical: 16,
    borderRadius: THEME.radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F47738',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  analyzeBtnDisabled: {
    backgroundColor: '#383632',
    shadowOpacity: 0,
    elevation: 0,
  },
  analyzeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  validationNotice: {
    fontSize: 12,
    color: '#8E8A83',
    textAlign: 'center',
  },
});
