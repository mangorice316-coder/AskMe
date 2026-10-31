import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Sparkles, User, Phone, Mail, Home, ChevronRight, ChevronLeft, Camera, X, Check, AlertCircle } from 'lucide-react-native';
import AddressLookup, { SelectedAddress } from './AddressLookup';
import { ComplaintDetails, ToneType } from '../utils/generators';

const DRAFT_STORAGE_KEY = '@complaint_draft';
const PROFILE_STORAGE_KEY = '@user_profile';

interface ComplaintFormProps {
  onGenerate: (details: ComplaintDetails) => void;
  generating: boolean;
}

const CATEGORIES = [
  { label: 'Roads & Pavement', icon: '🛣️' },
  { label: 'Waste & Sanitation', icon: '🗑️' },
  { label: 'Water & Sewage', icon: '💧' },
  { label: 'Street Lighting', icon: '💡' },
  { label: 'Public Safety & Health', icon: '🛡️' },
  { label: 'Official Misconduct / Negligence', icon: '⚖️' },
  { label: 'Other', icon: '📝' },
];

const URGENCY_LEVELS = [
  { label: 'Low', value: 'Low', color: '#14b8a6' },
  { label: 'Medium', value: 'Medium', color: '#f59e0b' },
  { label: 'High', value: 'High', color: '#f97316' },
  { label: 'Critical', value: 'Critical', color: '#ef4444' },
];

const LANGUAGES = [
  { code: 'English', label: 'English' },
  { code: 'Tamil', label: 'தமிழ் (Tamil)' },
  { code: 'Hindi', label: 'हिंदी (Hindi)' },
  { code: 'Telugu', label: 'తెలుగు (Telugu)' },
  { code: 'Kannada', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'Malayalam', label: 'മലയാളം (Malayalam)' },
  { code: 'Bengali', label: 'বাংলা (Bengali)' },
  { code: 'Marathi', label: 'मराठी (Marathi)' },
  { code: 'Gujarati', label: 'ગુજરાતી (Gujarati)' },
  { code: 'Arabic', label: 'العربية (Arabic)' },
  { code: 'Spanish', label: 'Español (Spanish)' },
  { code: 'French', label: 'Français (French)' },
];

const TONES: { label: string; value: ToneType; icon: string }[] = [
  { label: 'Formal', value: 'Formal', icon: '👔' },
  { label: 'Assertive', value: 'Assertive', icon: '⚖️' },
  { label: 'Urgent', value: 'Urgent', icon: '🚨' },
  { label: 'Legal', value: 'Legal', icon: '🏛️' },
];

const ISSUE_PRESETS = [
  {
    id: 'pothole',
    label: '🕳️ Road Pothole',
    category: 'Roads & Pavement',
    description: 'A deep pothole has opened up in the middle of the road. It poses a severe safety hazard to passing vehicles and commuters, especially at night when visibility is low. Several cars have scraped their chassis.',
  },
  {
    id: 'garbage',
    label: '🗑️ Trash Pile',
    category: 'Waste & Sanitation',
    description: 'A large, unsanitary pile of domestic waste has accumulated and has not been cleared for over a week. It creates a foul odor, attracts pests and stray dogs, and presents an active public health risk.',
  },
  {
    id: 'streetlight',
    label: '💡 Broken Streetlight',
    category: 'Street Lighting',
    description: 'The streetlights on this block are completely burned out and have been broken for several days. This makes the area pitch black at night, causing safety hazards and raising security concerns for residents.',
  },
  {
    id: 'waterleak',
    label: '💧 Pipe Leak',
    category: 'Water & Sewage',
    description: 'A water pipe is broken or leaking, causing drinking water to pool on the street. This has reduced water pressure in surrounding homes and created muddy transit conditions.',
  },
  {
    id: 'dogs',
    label: '🐕 Stray Animal Pack',
    category: 'Public Safety & Health',
    description: 'A pack of aggressive stray animals has been creating a nuisance in this area. They are chasing two-wheelers and posing a significant physical threat, especially to young children playing outside.',
  },
];

const SUGGESTIONS: Record<string, string[]> = {
  'Roads & Pavement': ['Deep pothole causing vehicle damage.', 'Road surface washed away by rain.', 'Uneven pavement tripping hazard.'],
  'Waste & Sanitation': ['Garbage uncollected for over a week.', 'Overflowing dustbins causing odor.', 'Stray animals scattering waste.'],
  'Water & Sewage': ['Underground water pipe burst flooding road.', 'Sewage overflowing from manhole.', 'No drinking water for 3 days.'],
  'Street Lighting': ['Street is pitch dark at night.', 'Streetlight pole damaged and leaning.', 'Lights blinking continuously.'],
  'Public Safety & Health': ['Stray dogs chasing two-wheelers.', 'Stagnant water breeding mosquitoes.', 'Open drain posing risk to children.'],
  'Official Misconduct / Negligence': ['Refused to register complaint.', 'Demanded bribe for public service.', 'Dereliction of duty.'],
  Other: ['Immediate action required.', 'Persistent issue for months.', 'Severe resident inconvenience.'],
};

const RECOMMENDATIONS: Record<string, { officer: string; dept: string; emailPrefix: string }> = {
  'Roads & Pavement': { officer: 'Chief Engineer (Roads)', dept: 'Department of Roads & Pavements', emailPrefix: 'roads.complaints' },
  'Waste & Sanitation': { officer: 'Chief Sanitation Inspector', dept: 'Solid Waste Management Division', emailPrefix: 'sanitation' },
  'Water & Sewage': { officer: 'Executive Engineer', dept: 'Water Supply and Sewerage Board', emailPrefix: 'water.sewage' },
  'Street Lighting': { officer: 'Assistant Engineer (Electrical)', dept: 'Electrical and Public Lighting Division', emailPrefix: 'streetlights' },
  'Public Safety & Health': { officer: 'Chief Health Inspector', dept: 'Public Health Department', emailPrefix: 'publichealth' },
  'Official Misconduct / Negligence': { officer: 'Chief Vigilance Officer', dept: 'Vigilance and Anti-Corruption Bureau', emailPrefix: 'vigilance' },
  Other: { officer: 'Municipal Commissioner', dept: 'Grievance Redressal Cell', emailPrefix: 'complaints' },
};

export default function ComplaintForm({ onGenerate, generating }: ComplaintFormProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Sender Details
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderAddress, setSenderAddress] = useState('');

  // Step 2: Issue Details
  const [category, setCategory] = useState(CATEGORIES[0].label);
  const [description, setDescription] = useState('');
  const [issueLocation, setIssueLocation] = useState('');
  const [issueLatitude, setIssueLatitude] = useState<number>();
  const [issueLongitude, setIssueLongitude] = useState<number>();
  const [issueAccuracy, setIssueAccuracy] = useState<number>();
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState<ToneType>('Formal');
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // Step 3: Authority Details
  const [cityOrTown, setCityOrTown] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [stateName, setStateName] = useState('');
  const [postcode, setPostcode] = useState('');
  const [authorityName, setAuthorityName] = useState('');
  const [authorityAddress, setAuthorityAddress] = useState('');
  const [authorityEmail, setAuthorityEmail] = useState('');
  const [isAuthorityEdited, setIsAuthorityEdited] = useState(false);

  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Load Saved Draft & Profile
  useEffect(() => {
    (async () => {
      try {
        const draftStr = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
        if (draftStr) {
          const d = JSON.parse(draftStr);
          if (d.senderName) setSenderName(d.senderName);
          if (d.senderPhone) setSenderPhone(d.senderPhone);
          if (d.senderEmail) setSenderEmail(d.senderEmail);
          if (d.senderAddress) setSenderAddress(d.senderAddress);
          if (d.category) setCategory(d.category);
          if (d.description) setDescription(d.description);
          if (d.issueLocation) setIssueLocation(d.issueLocation);
          if (d.urgency) setUrgency(d.urgency);
          if (d.language) setLanguage(d.language);
          if (d.tone) setTone(d.tone);
          if (d.provider) setProvider(d.provider);
        }

        const profileStr = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (profileStr) {
          const p = JSON.parse(profileStr);
          if (p.senderName) setSenderName(p.senderName);
          if (p.senderPhone) setSenderPhone(p.senderPhone);
          if (p.senderEmail) setSenderEmail(p.senderEmail);
          if (p.senderAddress) setSenderAddress(p.senderAddress);
        }
      } catch (err) {
        console.error('Failed to load draft/profile:', err);
      }
    })();
  }, []);

  // Auto-save Draft
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const draft = { senderName, senderPhone, senderEmail, senderAddress, category, description, issueLocation, urgency, language, tone, provider };
        await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        const profile = { senderName, senderPhone, senderEmail, senderAddress };
        await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      } catch (err) {
        console.error('Failed to save draft:', err);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [senderName, senderPhone, senderEmail, senderAddress, category, description, issueLocation, urgency, language, tone, provider]);

  // Authority recommendation
  useEffect(() => {
    if (!cityOrTown || isAuthorityEdited) return;
    const match = RECOMMENDATIONS[category] || RECOMMENDATIONS['Other'];
    const safeCity = cityOrTown.toLowerCase().replace(/\s+/g, '');
    const cleanDist = districtName && districtName !== cityOrTown ? `, ${districtName} District` : '';

    setAuthorityName(`${match.officer}, ${match.dept} (${cityOrTown})`);
    setAuthorityAddress(`${cityOrTown} Corporation / Municipal Office, Dept. of Public Works${cleanDist}, ${stateName}${postcode ? ', PIN: ' + postcode : ''}`);
    setAuthorityEmail(`${match.emailPrefix}@${safeCity}municipal.gov`);
  }, [category, cityOrTown, districtName, stateName, postcode, isAuthorityEdited]);

  const handleLocationSelect = (data: SelectedAddress) => {
    setIssueLocation(data.address);
    setCityOrTown(data.cityOrTown);
    if (data.district) setDistrictName(data.district);
    setStateName(data.state);
    setPostcode(data.postcode);
    setIssueLatitude(data.latitude);
    setIssueLongitude(data.longitude);
    setIssueAccuracy(data.accuracy);
    setIsAuthorityEdited(false);
    if (errors.issueLocation) {
      setErrors((prev) => { const n = { ...prev }; delete n.issueLocation; return n; });
    }
  };

  const handlePresetSelect = (preset: typeof ISSUE_PRESETS[0]) => {
    setCategory(preset.category);
    setDescription(preset.description);
    if (errors.description) {
      setErrors((prev) => { const n = { ...prev }; delete n.description; return n; });
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permissions are required to select photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        setImageUri(result.assets[0].uri);
        setImageBase64(result.assets[0].base64 || null);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!senderName.trim()) errs.senderName = 'Name is required';
      if (!senderAddress.trim()) errs.senderAddress = 'Your address is required';
      if (senderPhone.trim() && !/^\+?[0-9\s\-()]{7,15}$/.test(senderPhone)) errs.senderPhone = 'Invalid phone number format';
      if (senderEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) errs.senderEmail = 'Invalid email address';
    } else if (step === 2) {
      if (!issueLocation.trim()) errs.issueLocation = 'Issue location is required';
      if (!description.trim()) errs.description = 'Please describe the problem';
      else if (description.trim().length < 20) errs.description = 'Please provide more details (min 20 chars)';
    } else if (step === 3) {
      if (!authorityName.trim()) errs.authorityName = 'Authority name is required';
      if (!authorityAddress.trim()) errs.authorityAddress = 'Authority office address is required';
      if (authorityEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorityEmail)) errs.authorityEmail = 'Invalid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const performTransition = (fn: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      fn();
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const handleSubmit = () => {
    if (!validateStep(3)) return;
    const formattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    onGenerate({
      senderName: senderName.trim(),
      senderPhone: senderPhone.trim() || 'N/A',
      senderEmail: senderEmail.trim() || 'N/A',
      senderAddress: senderAddress.trim(),
      authorityName: authorityName.trim(),
      authorityAddress: authorityAddress.trim(),
      authorityEmail: authorityEmail.trim() || undefined,
      category,
      description: description.trim(),
      issueLocation: issueLocation.trim(),
      latitude: issueLatitude,
      longitude: issueLongitude,
      accuracy: issueAccuracy,
      urgency,
      date: formattedDate,
      language,
      tone,
      provider,
      imageBase64: imageBase64 || undefined,
    });
  };

  return (
    <View style={styles.outerContainer}>
      {/* Stepper Header */}
      <View style={styles.wizardHeader}>
        <View style={styles.progressTrackContainer}>
          <View style={styles.progressTrackBg} />
          <View style={[styles.progressFill, { width: `${((currentStep - 1) / 2) * 100}%` }]} />
        </View>
        <View style={styles.stepsContainer}>
          {[{ step: 1, label: 'Contact' }, { step: 2, label: 'Issue' }, { step: 3, label: 'Review' }].map((item) => {
            const isCompleted = currentStep > item.step;
            const isActive = currentStep === item.step;
            const CircleView = isActive ? Animated.View : View;
            return (
              <View key={item.step} style={styles.stepIndicator}>
                <CircleView style={[styles.stepCircle, isCompleted && styles.stepCircleCompleted, isActive && styles.stepCircleActive, isActive && { transform: [{ scale: pulseAnim }] }]}>
                  {isCompleted ? <Check size={14} color="#ffffff" strokeWidth={3} /> : <Text style={[styles.stepNumberText, isActive && styles.stepNumberTextActive]}>{item.step}</Text>}
                </CircleView>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive, isCompleted && styles.stepLabelCompleted]}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        {/* Step 1: User Info */}
        {currentStep === 1 && (
          <View style={styles.card}>
            <Text style={styles.stepTitle}>Your Contact Information</Text>
            <Text style={styles.stepSubtitle}>Authorities require your name and address to process official complaints.</Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={[styles.inputContainer, focusedInput === 'name' && styles.inputFocused]}>
              <User size={16} color={focusedInput === 'name' ? '#0d9488' : '#a1a1aa'} style={styles.inputIcon} />
              <TextInput style={styles.textInput} placeholder="e.g. John Doe" placeholderTextColor="#71717a" value={senderName} onChangeText={setSenderName} onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput(null)} />
            </View>
            {errors.senderName && <Text style={styles.errorText}>{errors.senderName}</Text>}

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.inputLabel}>Phone (Optional)</Text>
                <View style={[styles.inputContainer, focusedInput === 'phone' && styles.inputFocused]}>
                  <Phone size={16} color={focusedInput === 'phone' ? '#0d9488' : '#a1a1aa'} style={styles.inputIcon} />
                  <TextInput style={styles.textInput} placeholder="Phone" placeholderTextColor="#71717a" keyboardType="phone-pad" value={senderPhone} onChangeText={setSenderPhone} onFocus={() => setFocusedInput('phone')} onBlur={() => setFocusedInput(null)} />
                </View>
                {errors.senderPhone && <Text style={styles.errorText}>{errors.senderPhone}</Text>}
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={styles.inputLabel}>Email (Optional)</Text>
                <View style={[styles.inputContainer, focusedInput === 'email' && styles.inputFocused]}>
                  <Mail size={16} color={focusedInput === 'email' ? '#0d9488' : '#a1a1aa'} style={styles.inputIcon} />
                  <TextInput style={styles.textInput} placeholder="Email" placeholderTextColor="#71717a" keyboardType="email-address" value={senderEmail} onChangeText={setSenderEmail} onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)} />
                </View>
                {errors.senderEmail && <Text style={styles.errorText}>{errors.senderEmail}</Text>}
              </View>
            </View>

            <Text style={styles.inputLabel}>Your Residential Address</Text>
            <View style={[styles.inputContainer, { minHeight: 70 }, focusedInput === 'address' && styles.inputFocused]}>
              <Home size={16} color={focusedInput === 'address' ? '#0d9488' : '#a1a1aa'} style={[styles.inputIcon, { marginTop: 12 }]} />
              <TextInput style={[styles.textInput, { height: 60, textAlignVertical: 'top', paddingTop: 8 }]} placeholder="Street, area, city, pincode" placeholderTextColor="#71717a" multiline value={senderAddress} onChangeText={setSenderAddress} onFocus={() => setFocusedInput('address')} onBlur={() => setFocusedInput(null)} />
            </View>
            {errors.senderAddress && <Text style={styles.errorText}>{errors.senderAddress}</Text>}
          </View>
        )}

        {/* Step 2: Civic Issue */}
        {currentStep === 2 && (
          <View style={styles.card}>
            <Text style={styles.stepTitle}>Describe the Civic Issue</Text>
            <Text style={styles.stepSubtitle}>Provide details of the problem and its location.</Text>

            <AddressLookup onAddressSelected={handleLocationSelect} />
            {issueLocation ? (
              <View style={styles.locationTag}>
                <Text style={styles.locationTagText} numberOfLines={2}>📍 {issueLocation}</Text>
                <TouchableOpacity onPress={() => { setIssueLocation(''); setCityOrTown(''); setStateName(''); setPostcode(''); }}>
                  <X size={16} color="#2dd4bf" />
                </TouchableOpacity>
              </View>
            ) : null}
            {errors.issueLocation && <Text style={styles.errorText}>{errors.issueLocation}</Text>}

            <Text style={styles.inputLabel}>Quick Fill Common Issues</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {ISSUE_PRESETS.map((preset) => (
                <TouchableOpacity key={preset.id} style={styles.presetChip} onPress={() => handlePresetSelect(preset)}>
                  <Text style={styles.presetChipText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const active = category === cat.label;
                return (
                  <TouchableOpacity key={cat.label} style={[styles.categoryCard, active && styles.categoryCardActive]} onPress={() => setCategory(cat.label)}>
                    <Text style={styles.categoryCardIcon}>{cat.icon}</Text>
                    <Text style={[styles.categoryCardText, active && styles.categoryCardTextActive]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Attach Photo Evidence (Optional)</Text>
            <View style={styles.photoContainer}>
              {imageUri ? (
                <View style={styles.thumbnailContainer}>
                  <Image source={{ uri: imageUri }} style={styles.thumbnailImage} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => { setImageUri(null); setImageBase64(null); }}>
                    <X size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadBtn} onPress={handlePickImage}>
                  <Camera size={18} color="#0d9488" style={{ marginRight: 8 }} />
                  <Text style={styles.uploadBtnText}>Select Photo Evidence</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.inputLabel}>Urgency Priority</Text>
            <View style={styles.row}>
              {URGENCY_LEVELS.map((lvl) => {
                const active = urgency === lvl.value;
                return (
                  <TouchableOpacity key={lvl.value} style={[styles.pillBtn, active && { backgroundColor: lvl.color, borderColor: lvl.color }]} onPress={() => setUrgency(lvl.value as any)}>
                    <Text style={[styles.pillBtnText, active && styles.pillBtnTextActive]}>{lvl.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>AI Engine</Text>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.pillBtn, provider === 'gemini' && styles.providerActive]} onPress={() => setProvider('gemini')}>
                <Sparkles size={14} color={provider === 'gemini' ? '#ffffff' : '#0d9488'} style={{ marginRight: 6 }} />
                <Text style={[styles.pillBtnText, provider === 'gemini' && styles.pillBtnTextActive]}>Google Gemini</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pillBtn, provider === 'openai' && styles.providerActive]} onPress={() => setProvider('openai')}>
                <AlertCircle size={14} color={provider === 'openai' ? '#ffffff' : '#0d9488'} style={{ marginRight: 6 }} />
                <Text style={[styles.pillBtnText, provider === 'openai' && styles.pillBtnTextActive]}>OpenAI GPT-4o</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Letter Tone</Text>
            <View style={styles.row}>
              {TONES.map((t) => {
                const active = tone === t.value;
                return (
                  <TouchableOpacity key={t.value} style={[styles.pillBtn, active && styles.toneActive]} onPress={() => setTone(t.value)}>
                    <Text style={[styles.pillBtnText, active && styles.toneActiveText]}>{t.icon} {t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Output Language</Text>
            <View style={styles.languageContainer}>
              {LANGUAGES.map((lang) => {
                const active = language === lang.code;
                return (
                  <TouchableOpacity key={lang.code} style={[styles.langChip, active && styles.langChipActive]} onPress={() => setLanguage(lang.code)}>
                    <Text style={[styles.langChipText, active && styles.langChipTextActive]}>{lang.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.inputLabel}>Problem Description</Text>
              <Text style={styles.charCount}>{description.length} chars</Text>
            </View>
            <TextInput style={[styles.textArea, focusedInput === 'desc' && styles.inputFocused]} placeholder="Describe what is wrong in detail..." placeholderTextColor="#71717a" multiline numberOfLines={4} value={description} onChangeText={setDescription} onFocus={() => setFocusedInput('desc')} onBlur={() => setFocusedInput(null)} />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

            {SUGGESTIONS[category] && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {SUGGESTIONS[category].map((s, idx) => (
                  <TouchableOpacity key={idx} style={styles.suggestionChip} onPress={() => setDescription((prev) => (prev ? `${prev} ${s}` : s))}>
                    <Sparkles size={12} color="#2dd4bf" style={{ marginRight: 4 }} />
                    <Text style={styles.suggestionChipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Step 3: Target Authority */}
        {currentStep === 3 && (
          <View style={styles.card}>
            <Text style={styles.stepTitle}>Review Target Authority</Text>
            <Text style={styles.stepSubtitle}>Recommended authority matched by issue category and location.</Text>

            {cityOrTown ? (
              <View style={styles.recommendationCard}>
                <Sparkles size={16} color="#0d9488" style={{ marginRight: 8 }} />
                <Text style={styles.recommendationText}>
                  Matched <Text style={{ fontWeight: 'bold', color: '#ffffff' }}>{category}</Text> for <Text style={{ fontWeight: 'bold', color: '#ffffff' }}>{cityOrTown}</Text>.
                </Text>
              </View>
            ) : null}

            <Text style={styles.inputLabel}>Authority / Office Name</Text>
            <TextInput style={[styles.plainInput, focusedInput === 'authName' && styles.inputFocused]} placeholder="e.g. Municipal Commissioner" placeholderTextColor="#71717a" value={authorityName} onChangeText={(t) => { setAuthorityName(t); setIsAuthorityEdited(true); }} onFocus={() => setFocusedInput('authName')} onBlur={() => setFocusedInput(null)} />
            {errors.authorityName && <Text style={styles.errorText}>{errors.authorityName}</Text>}

            <Text style={styles.inputLabel}>Office Address</Text>
            <TextInput style={[styles.plainInput, { height: 60, textAlignVertical: 'top', paddingTop: 8 }, focusedInput === 'authAddress' && styles.inputFocused]} placeholder="e.g. City Corporation HQ" placeholderTextColor="#71717a" multiline value={authorityAddress} onChangeText={(t) => { setAuthorityAddress(t); setIsAuthorityEdited(true); }} onFocus={() => setFocusedInput('authAddress')} onBlur={() => setFocusedInput(null)} />
            {errors.authorityAddress && <Text style={styles.errorText}>{errors.authorityAddress}</Text>}

            <Text style={styles.inputLabel}>Office Email Address (Optional)</Text>
            <View style={[styles.inputContainer, focusedInput === 'authEmail' && styles.inputFocused]}>
              <Mail size={16} color={focusedInput === 'authEmail' ? '#0d9488' : '#a1a1aa'} style={styles.inputIcon} />
              <TextInput style={styles.textInput} placeholder="complaints@corporation.gov" placeholderTextColor="#71717a" keyboardType="email-address" value={authorityEmail} onChangeText={(t) => { setAuthorityEmail(t); setIsAuthorityEdited(true); }} onFocus={() => setFocusedInput('authEmail')} onBlur={() => setFocusedInput(null)} />
            </View>
            {errors.authorityEmail && <Text style={styles.errorText}>{errors.authorityEmail}</Text>}
          </View>
        )}

        {/* Stepper Navigation */}
        <View style={styles.navRow}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => performTransition(() => setCurrentStep((s) => s - 1))} disabled={generating}>
              <ChevronLeft size={20} color="#e4e4e7" style={{ marginRight: 4 }} />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}

          {currentStep < 3 ? (
            <TouchableOpacity style={[styles.nextBtn, { marginLeft: currentStep > 1 ? 12 : 0 }]} onPress={() => { if (validateStep(currentStep)) performTransition(() => setCurrentStep((s) => s + 1)); }} disabled={generating}>
              <Text style={styles.nextBtnText}>Next Step</Text>
              <ChevronRight size={20} color="#ffffff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.submitBtn, { marginLeft: currentStep > 1 ? 12 : 0 }]} onPress={handleSubmit} disabled={generating}>
              {generating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Sparkles size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Write with {provider === 'gemini' ? 'Gemini' : 'OpenAI'}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1 },
  wizardHeader: { backgroundColor: '#18181b', paddingVertical: 14, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: '#27272a', position: 'relative' },
  progressTrackContainer: { position: 'absolute', left: '20%', right: '20%', top: 32, height: 3, zIndex: 1 },
  progressTrackBg: { ...StyleSheet.absoluteFill, backgroundColor: '#27272a', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#0d9488', borderRadius: 2 },
  stepsContainer: { flexDirection: 'row', justifyContent: 'space-between', zIndex: 3 },
  stepIndicator: { alignItems: 'center', width: 60 },
  stepCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#18181b', borderWidth: 2, borderColor: '#3f3f46', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  stepCircleActive: { borderColor: '#0d9488', backgroundColor: '#0d9488' },
  stepCircleCompleted: { borderColor: '#0d9488', backgroundColor: '#0d9488' },
  stepNumberText: { color: '#a1a1aa', fontSize: 13, fontWeight: 'bold' },
  stepNumberTextActive: { color: '#ffffff' },
  stepLabel: { color: '#71717a', fontSize: 11, fontWeight: '600' },
  stepLabelActive: { color: '#0d9488', fontWeight: 'bold' },
  stepLabelCompleted: { color: '#2dd4bf' },
  container: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#18181b', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#27272a' },
  stepTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  stepSubtitle: { color: '#a1a1aa', fontSize: 13, lineHeight: 18, marginBottom: 16 },
  inputLabel: { color: '#e4e4e7', fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#27272a', borderRadius: 8, borderWidth: 1.5, borderColor: '#3f3f46', height: 48, paddingHorizontal: 12, marginBottom: 4 },
  inputFocused: { borderColor: '#0d9488', backgroundColor: 'rgba(13, 148, 136, 0.05)' },
  inputIcon: { marginRight: 8 },
  textInput: { flex: 1, color: '#ffffff', fontSize: 14, height: '100%' },
  plainInput: { backgroundColor: '#27272a', borderRadius: 8, borderWidth: 1.5, borderColor: '#3f3f46', color: '#ffffff', fontSize: 14, height: 48, paddingHorizontal: 12, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  charCount: { fontSize: 11, color: '#71717a' },
  locationTag: { backgroundColor: 'rgba(13, 148, 136, 0.15)', borderRadius: 8, padding: 10, marginTop: 4, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(13, 148, 136, 0.3)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locationTagText: { color: '#2dd4bf', fontSize: 13, flex: 1, marginRight: 8 },
  chipScroll: { marginBottom: 10, marginHorizontal: -4 },
  presetChip: { backgroundColor: '#27272a', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, borderWidth: 1, borderColor: '#3f3f46' },
  presetChipText: { color: '#e4e4e7', fontSize: 13 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, marginBottom: 8 },
  categoryCard: { width: '31%', aspectRatio: 1.2, backgroundColor: '#27272a', borderRadius: 12, padding: 8, margin: '1%', borderWidth: 1.5, borderColor: '#3f3f46', alignItems: 'center', justifyContent: 'center' },
  categoryCardActive: { backgroundColor: 'rgba(13, 148, 136, 0.15)', borderColor: '#2dd4bf' },
  categoryCardIcon: { fontSize: 20, marginBottom: 4 },
  categoryCardText: { color: '#d4d4d8', fontSize: 10, textAlign: 'center', lineHeight: 13 },
  categoryCardTextActive: { color: '#2dd4bf', fontWeight: 'bold' },
  photoContainer: { marginBottom: 12 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(39, 39, 42, 0.5)', borderWidth: 1.5, borderColor: '#3f3f46', borderStyle: 'dashed', borderRadius: 12, height: 64 },
  uploadBtnText: { color: '#e4e4e7', fontSize: 14, fontWeight: '500' },
  thumbnailContainer: { position: 'relative', width: 120, height: 120, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#0d9488' },
  thumbnailImage: { width: '100%', height: '100%' },
  removeImageBtn: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0, 0, 0, 0.7)', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  pillBtn: { flex: 1, backgroundColor: '#27272a', borderRadius: 8, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1, borderColor: '#3f3f46' },
  pillBtnText: { color: '#d4d4d8', fontSize: 12, fontWeight: '600' },
  pillBtnTextActive: { color: '#ffffff', fontWeight: 'bold' },
  providerActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
  toneActive: { backgroundColor: 'rgba(13, 148, 136, 0.2)', borderColor: '#2dd4bf' },
  toneActiveText: { color: '#2dd4bf', fontWeight: 'bold' },
  languageContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3, marginBottom: 10 },
  langChip: { backgroundColor: '#27272a', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, margin: 3, borderWidth: 1, borderColor: '#3f3f46' },
  langChipActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
  langChipText: { color: '#d4d4d8', fontSize: 12 },
  langChipTextActive: { color: '#ffffff', fontWeight: 'bold' },
  textArea: { backgroundColor: '#27272a', borderRadius: 8, borderWidth: 1.5, borderColor: '#3f3f46', color: '#ffffff', fontSize: 14, minHeight: 90, padding: 12, textAlignVertical: 'top', marginBottom: 4 },
  suggestionChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(13, 148, 136, 0.1)', borderWidth: 1, borderColor: 'rgba(13, 148, 136, 0.3)', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 10, marginRight: 6 },
  suggestionChipText: { color: '#2dd4bf', fontSize: 12 },
  recommendationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(13, 148, 136, 0.12)', borderWidth: 1, borderColor: 'rgba(13, 148, 136, 0.3)', borderRadius: 10, padding: 12, marginBottom: 12 },
  recommendationText: { color: '#a1a1aa', fontSize: 13, flex: 1, lineHeight: 18 },
  errorText: { color: '#f87171', fontSize: 12, marginTop: 2, marginBottom: 4, paddingLeft: 4 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  backBtn: { flex: 1, backgroundColor: '#27272a', borderWidth: 1, borderColor: '#3f3f46', borderRadius: 10, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { color: '#e4e4e7', fontSize: 15, fontWeight: 'bold' },
  nextBtn: { flex: 2, backgroundColor: '#0d9488', borderRadius: 10, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  submitBtn: { flex: 2, backgroundColor: '#0d9488', borderRadius: 10, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
});
