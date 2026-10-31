import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Cpu,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Scale,
  Globe,
  Brain,
  Zap,
} from 'lucide-react-native';
import { THEME } from '../theme/tokens';
import { CivicSummaryResult, OPEN_SOURCE_MODELS } from '../services/openSourceSummarizer';
import { soundFx } from '../utils/soundEffects';

interface CivicActionSummaryCardProps {
  summaryResult: CivicSummaryResult;
  complaintId?: string;
  isCompact?: boolean;
  selectedModelId?: string;
  onSelectModel?: (modelId: string) => void;
}

export default function CivicActionSummaryCard({
  summaryResult,
  complaintId,
  isCompact = false,
  selectedModelId = 'qwen-2.5-7b',
  onSelectModel,
}: CivicActionSummaryCardProps) {
  const [copied, setCopied] = useState(false);
  const [showCheckpoints, setShowCheckpoints] = useState(!isCompact);
  const [showReasoning, setShowReasoning] = useState(true);

  const activeModel =
    OPEN_SOURCE_MODELS.find((m) => m.id === (summaryResult.modelId || selectedModelId)) ||
    OPEN_SOURCE_MODELS[0];

  const handleCopy = async () => {
    soundFx.playClick();
    try {
      await Clipboard.setStringAsync(summaryResult.summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Notice', 'Could not copy summary to clipboard.');
    }
  };

  return (
    <View style={styles.cardContainer} testID="askme-reveal">
      {/* 1. Header with Model Metadata & Provider */}
      <View style={styles.headerRow}>
        <View style={styles.modelTag}>
          <Cpu size={13} color="#F47738" />
          <Text style={styles.modelTagText}>{summaryResult.modelIdentifier}</Text>
        </View>

        <View style={styles.telemetryGroup}>
          <View style={styles.paramBadge}>
            <Text style={styles.paramBadgeText}>{summaryResult.parameters || activeModel.parameters}</Text>
          </View>
          <View style={styles.licenseBadge}>
            <Text style={styles.licenseBadgeText}>{summaryResult.license || activeModel.license}</Text>
          </View>
          <View style={styles.modeBadge}>
            <Sparkles size={11} color="#22C55E" />
            <Text style={styles.modeBadgeText}>
              {summaryResult.executionMode.replace(/-/g, ' ')} • {summaryResult.latencyMs}ms
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Title & Copy Button */}
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Open-Source Civic Intelligence Summary</Text>
          <Text style={styles.cardSubtitle}>
            {activeModel.badge} • {activeModel.specialization}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.copyBtn}
          onPress={handleCopy}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Copy AI Summary"
        >
          {copied ? <Check size={12} color="#22C55E" /> : <Copy size={12} color="#D8D2C7" />}
          <Text style={[styles.copyBtnText, copied && { color: '#22C55E' }]}>
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. INTERACTIVE OPEN-SOURCE MODEL SWITCHER */}
      <View style={styles.modelSwitcherSection}>
        <Text style={styles.switcherLabel}>SWITCH OPEN-SOURCE FOUNDATION MODEL:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modelChipsRow}>
          {OPEN_SOURCE_MODELS.map((m) => {
            const isSelected = (summaryResult.modelId || selectedModelId) === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.modelChip, isSelected && styles.modelChipActive]}
                onPress={() => {
                  soundFx.playClick();
                  onSelectModel?.(m.id);
                }}
                activeOpacity={0.8}
              >
                {m.id === 'qwen-2.5-7b' && <Globe size={11} color={isSelected ? '#F47738' : '#8E8A83'} />}
                {m.id === 'llama-3.2-3b' && <Zap size={11} color={isSelected ? '#F47738' : '#8E8A83'} />}
                {m.id === 'mistral-7b' && <Scale size={11} color={isSelected ? '#F47738' : '#8E8A83'} />}
                {m.id === 'phi-3.5-mini' && <Cpu size={11} color={isSelected ? '#F47738' : '#8E8A83'} />}
                {m.id === 'deepseek-r1-distill-7b' && <Brain size={11} color={isSelected ? '#F47738' : '#8E8A83'} />}
                {m.id.startsWith('flan-t5') && <Sparkles size={11} color={isSelected ? '#F47738' : '#8E8A83'} />}
                <Text style={[styles.modelChipText, isSelected && styles.modelChipTextActive]}>
                  {m.name.split(' ')[0]} {m.parameters}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Executive Summary Block */}
      <View style={styles.summaryBox}>
        <View style={styles.accentBar} />
        <Text style={styles.summaryText}>{summaryResult.summaryText}</Text>
      </View>

      {/* 5. Vernacular Translation (Qwen 2.5) */}
      {summaryResult.bilingualSummary && (
        <View style={styles.bilingualBox}>
          <View style={styles.bilingualHeader}>
            <Globe size={13} color="#22C55E" />
            <Text style={styles.bilingualTitle}>
              Vernacular Indian Language Brief ({summaryResult.bilingualSummary.language})
            </Text>
          </View>
          <Text style={styles.bilingualText}>{summaryResult.bilingualSummary.text}</Text>
        </View>
      )}

      {/* 6. Statutory Legal Citations (Mistral 7B) */}
      {summaryResult.statutoryCitations && summaryResult.statutoryCitations.length > 0 && (
        <View style={styles.legalBox}>
          <View style={styles.legalHeader}>
            <Scale size={13} color="#F47738" />
            <Text style={styles.legalTitle}>Statutory Act & Section References (Mistral 7B)</Text>
          </View>
          <View style={styles.citationList}>
            {summaryResult.statutoryCitations.map((cite, idx) => (
              <View key={idx} style={styles.citationPill}>
                <Text style={styles.citationText}>§ {cite}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 7. Chain-of-Thought Verification (DeepSeek R1) */}
      {summaryResult.reasoningSteps && summaryResult.reasoningSteps.length > 0 && (
        <View style={styles.reasoningBox}>
          <TouchableOpacity
            style={styles.reasoningHeader}
            onPress={() => setShowReasoning(!showReasoning)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Brain size={13} color="#A855F7" />
              <Text style={styles.reasoningTitle}>Jurisdictional Chain-of-Thought Audit (DeepSeek R1)</Text>
            </View>
            {showReasoning ? <ChevronUp size={13} color="#A8A39A" /> : <ChevronDown size={13} color="#A8A39A" />}
          </TouchableOpacity>
          {showReasoning && (
            <View style={styles.reasoningContent}>
              {summaryResult.reasoningSteps.map((step, idx) => (
                <Text key={idx} style={styles.reasoningStepText}>
                  {step}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 8. Accordion toggle for Step-by-Step Action Trail */}
      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => {
          soundFx.playClick();
          setShowCheckpoints((prev) => !prev);
        }}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={13} color="#F47738" />
          <Text style={styles.toggleText}>
            Civic Pipeline Audit Trail ({summaryResult.actionCheckpoints.length} verification milestones)
          </Text>
        </View>
        {showCheckpoints ? (
          <ChevronUp size={14} color="#A8A39A" />
        ) : (
          <ChevronDown size={14} color="#A8A39A" />
        )}
      </TouchableOpacity>

      {/* 9. Checkpoints list */}
      {showCheckpoints && (
        <View style={styles.checkpointsContainer}>
          {summaryResult.actionCheckpoints.map((step, idx) => {
            const isLast = idx === summaryResult.actionCheckpoints.length - 1;
            return (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.timelineColumn}>
                  <View
                    style={[
                      styles.statusDot,
                      step.completed ? styles.statusDotCompleted : styles.statusDotPending,
                    ]}
                  >
                    {step.completed ? (
                      <CheckCircle2 size={13} color="#22C55E" />
                    ) : (
                      <Clock size={13} color="#D8D2C7" />
                    )}
                  </View>
                  {!isLast && <View style={styles.timelineLine} />}
                </View>

                <View style={styles.stepContent}>
                  <View style={styles.stepHeader}>
                    <Text style={styles.stepStage}>{step.stage}</Text>
                    <Text style={styles.stepTime}>{step.timestamp}</Text>
                  </View>
                  <Text style={styles.stepDesc}>{step.description}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#161615',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 4,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  modelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(244, 119, 56, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.3)',
  },
  modelTagText: {
    fontFamily: Platform.OS === 'web' ? 'JetBrains Mono, monospace' : 'monospace',
    fontSize: 11,
    fontWeight: '700',
    color: '#F47738',
  },
  telemetryGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  paramBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paramBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D8D2C7',
  },
  licenseBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  licenseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A8A49D',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#22C55E',
  },

  /* Title & Copy */
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#8E8A83',
    marginTop: 3,
    lineHeight: 18,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: THEME.radii.pill,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D8D2C7',
  },

  /* Model Switcher */
  modelSwitcherSection: {
    backgroundColor: '#1E1E1C',
    borderRadius: 12,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  switcherLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8A83',
    letterSpacing: 0.5,
  },
  modelChipsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  modelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#161615',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modelChipActive: {
    backgroundColor: 'rgba(244, 119, 56, 0.15)',
    borderColor: '#F47738',
  },
  modelChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A8A49D',
  },
  modelChipTextActive: {
    color: '#F47738',
    fontWeight: '800',
  },

  /* Executive Summary Box */
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  accentBar: {
    width: 3,
    backgroundColor: '#F47738',
    borderRadius: 2,
  },
  summaryText: {
    flex: 1,
    fontSize: 13,
    color: '#E8E5DF',
    lineHeight: 21,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },

  /* Bilingual Translation */
  bilingualBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.06)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    gap: 6,
  },
  bilingualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bilingualTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22C55E',
  },
  bilingualText: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 20,
  },

  /* Legal Citations */
  legalBox: {
    backgroundColor: 'rgba(244, 119, 56, 0.06)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.2)',
    gap: 6,
  },
  legalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legalTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F47738',
  },
  citationList: {
    gap: 4,
    marginTop: 2,
  },
  citationPill: {
    backgroundColor: '#161615',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.15)',
  },
  citationText: {
    fontSize: 11,
    color: '#F47738',
    fontWeight: '600',
  },

  /* DeepSeek CoT Reasoning */
  reasoningBox: {
    backgroundColor: 'rgba(168, 85, 247, 0.06)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
    gap: 6,
  },
  reasoningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reasoningTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A855F7',
  },
  reasoningContent: {
    gap: 4,
    marginTop: 4,
  },
  reasoningStepText: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 17,
  },

  /* Accordion Toggle */
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A8A39A',
  },

  /* Checkpoints */
  checkpointsContainer: {
    marginTop: 4,
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 20,
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDotCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  statusDotPending: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  timelineLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  stepStage: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepTime: {
    fontSize: 10,
    color: '#77736E',
    fontFamily: Platform.OS === 'web' ? 'JetBrains Mono, monospace' : undefined,
  },
  stepDesc: {
    fontSize: 12,
    color: '#8E8A83',
    lineHeight: 18,
  },
});
