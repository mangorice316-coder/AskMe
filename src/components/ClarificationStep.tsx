import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { HelpCircle, ArrowRight, MessageSquare, Sparkles } from 'lucide-react-native';
import { THEME } from '../theme/tokens';

interface ClarificationStepProps {
  questions: string[];
  missingFields: string[];
  onConfirmClarifications: (answers: Record<string, string>) => void;
  onSkip: () => void;
}

export default function ClarificationStep({
  questions,
  missingFields,
  onConfirmClarifications,
  onSkip,
}: ClarificationStepProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleTextChange = (q: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [q]: val }));
  };

  const handleDone = () => {
    onConfirmClarifications(answers);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Sparkles size={20} color={THEME.colors.brandOrange} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Just a little more information.</Text>
          <Text style={styles.subtitle}>
            Answering these ensures your grievance routes to the exact statutory department without rejection.
          </Text>
        </View>
      </View>

      {/* Clarification Questions list */}
      <View style={styles.questionsList}>
        {questions.map((q, idx) => (
          <View key={idx} style={styles.qCard}>
            <View style={styles.qHeaderRow}>
              <MessageSquare size={13} color={THEME.colors.brandOrange} />
              <Text style={styles.qText}>
                {q}
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Your answer or clarification..."
              placeholderTextColor={THEME.colors.mutedText}
              value={answers[q] || ''}
              onChangeText={(txt) => handleTextChange(q, txt)}
            />
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip clarification questions"
        >
          <Text style={styles.skipText}>Skip & Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleDone}
          accessibilityRole="button"
          accessibilityLabel="Save answers and generate formal letter"
        >
          <Text style={styles.continueText}>Generate Letter</Text>
          <ArrowRight size={15} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.secondaryBackground,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.xl,
    padding: 24,
    marginVertical: 16,
    maxWidth: 720,
    alignSelf: 'center',
    width: '92%',
    shadowColor: THEME.colors.primaryText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
    paddingBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.softOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: THEME.colors.primaryText,
    letterSpacing: -0.4,
    fontFamily: Platform.OS === 'web' ? 'Sora, Space Grotesk, sans-serif' : undefined,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.secondaryText,
    marginTop: 2,
    lineHeight: 18,
  },
  questionsList: {
    gap: 14,
    marginBottom: 24,
  },
  qCard: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.md,
    padding: 14,
  },
  qHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  qText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primaryText,
    flex: 1,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.primaryText,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.secondaryText,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.brandOrange,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: THEME.radii.md,
  },
  continueText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
