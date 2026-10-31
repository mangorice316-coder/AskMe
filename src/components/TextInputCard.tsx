import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../theme/tokens';
import { FileText, Sparkles } from 'lucide-react-native';

interface TextInputCardProps {
  value: string;
  onChangeText: (text: string) => void;
}

const CIVIC_EXAMPLES = [
  {
    label: '🛣️ Road Damage',
    desc: 'Deep pothole on the main avenue near the signal junction. Vehicles are swerving abruptly and scraping underside, risking two-wheeler accidents.',
  },
  {
    label: '🗑️ Garbage Not Collected',
    desc: 'Large accumulation of household and vegetable market garbage left uncollected for 5 days. Foul smell and stray animal menace.',
  },
  {
    label: '💧 Water Leakage',
    desc: 'Underground drinking water supply pipeline fractured, leading to continuous clean water loss and flooding the street with slush.',
  },
  {
    label: '🌊 Blocked Drainage',
    desc: 'Stormwater drain is completely clogged with silt and plastic debris. Sewage is backing up onto the pedestrian footpath.',
  },
  {
    label: '💡 Streetlight Broken',
    desc: 'Three consecutive streetlights on this block have been non-functional for two weeks. Pitch dark at night, endangering women and elders.',
  },
  {
    label: '🏛️ Public Infrastructure',
    desc: 'Concrete footpath slabs broken and missing over an open trench. Severe tripping hazard for school children and senior citizens.',
  },
];

export default function TextInputCard({ value, onChangeText }: TextInputCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <View style={styles.titleRow}>
          <Text style={styles.componentLabel}>Describe the Problem</Text>
          <Text style={styles.charCount}>{value.length} characters</Text>
        </View>
        <Text style={styles.componentSub}>Write a short explanation.</Text>
      </View>

      <TextInput
        style={styles.textArea}
        placeholder="Tell us what happened, where it happened, and when you noticed it..."
        placeholderTextColor={THEME.colors.mutedText}
        multiline
        numberOfLines={4}
        value={value}
        onChangeText={onChangeText}
        textAlignVertical="top"
      />

      {/* Helpful Clickable Examples */}
      <View style={styles.examplesSection}>
        <View style={styles.presetsHeader}>
          <Sparkles size={12} color={THEME.colors.brandOrange} />
          <Text style={styles.examplesLabel}>Clickable examples (click to load & personalize):</Text>
        </View>
        <View style={styles.chipsRow}>
          {CIVIC_EXAMPLES.map((ex) => (
            <TouchableOpacity
              key={ex.label}
              style={styles.chip}
              onPress={() => onChangeText(ex.desc)}
              accessibilityRole="button"
              accessibilityLabel={`Insert preset ${ex.label}`}
            >
              <Text style={styles.chipText}>{ex.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  componentLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  charCount: {
    fontSize: 11,
    color: '#8E8A83',
    fontFamily: THEME.fonts.mono,
  },
  componentSub: {
    fontSize: 12,
    color: '#8E8A83',
    marginTop: 1,
  },
  textArea: {
    backgroundColor: '#1E1E1C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: THEME.radii.md,
    padding: 12,
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 96,
    lineHeight: 20,
  },
  examplesSection: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  presetsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  examplesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8A83',
    fontFamily: THEME.fonts.mono,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#1E1E1C',
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipText: {
    fontSize: 11,
    color: '#A8A49D',
    fontWeight: '600',
  },
});
