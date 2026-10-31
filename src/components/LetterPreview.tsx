import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  ScrollView,
  Linking,
  Animated,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Clipboard as CopyIcon, Share2, ArrowLeft, Check, Edit2, Mail, MessageSquare, Printer, RefreshCw } from 'lucide-react-native';

interface LetterPreviewProps {
  letterText: string;
  authorityEmail?: string;
  category?: string;
  location?: string;
  onBack: () => void;
  onRegenerate?: () => void;
  generating?: boolean;
}

export default function LetterPreview({ 
  letterText, 
  authorityEmail, 
  category, 
  location, 
  onBack,
  onRegenerate,
  generating
}: LetterPreviewProps) {
  const [editedText, setEditedText] = useState(letterText);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(editedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      Alert.alert('Error', 'Failed to copy to clipboard.');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: editedText,
        title: 'Civic Complaint Letter',
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to share letter.');
    }
  };

  const handleEmail = async () => {
    try {
      const subject = `Civic Complaint: ${category || 'Civic Issue'} at ${location || 'Local Area'}`;
      const mailtoUrl = `mailto:${authorityEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(editedText)}`;
      await Linking.openURL(mailtoUrl);
    } catch (err) {
      Alert.alert('Email Client Error', 'Could not open your device email application. Please copy the text and send manually.');
    }
  };

  const handleWhatsApp = async () => {
    try {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(editedText)}`;
      await Linking.openURL(whatsappUrl);
    } catch (err) {
      Alert.alert('WhatsApp Error', 'Could not launch WhatsApp. Please copy the text and share manually.');
    }
  };

  const handlePrintPDF = async () => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Civic Complaint</title>
            <style>
              body {
                font-family: 'Courier New', Courier, monospace;
                padding: 40px;
                color: #1e293b;
                line-height: 1.6;
                font-size: 14px;
              }
              .letter-body {
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              .letterhead-seal {
                width: 48px;
                height: 48px;
                border: 2px dashed #94a3b8;
                border-radius: 24px;
                float: right;
                margin-bottom: 30px;
              }
            </style>
          </head>
          <body>
            <div class="letterhead-seal"></div>
            <div style="clear: both;"></div>
            <div class="letter-body">${editedText}</div>
          </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        await Print.printAsync({ html: htmlContent });
      } else {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri);
      }
    } catch (err) {
      Alert.alert('PDF Export Error', 'Failed to generate PDF. Please try again.');
    }
  };

  const wordCount = editedText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = editedText.length;
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });



  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          disabled={generating}
          accessibilityRole="button"
          accessibilityLabel="Go back to edit details"
        >
          <ArrowLeft size={20} color="#ffffff" />
          <Text style={styles.backButtonText}>Edit Details</Text>
        </TouchableOpacity>
        
        <View style={styles.rightHeaderActions}>
          {onRegenerate && (
            <TouchableOpacity 
              style={[styles.iconButton, generating && { opacity: 0.5 }]} 
              onPress={onRegenerate}
              disabled={generating}
              accessibilityRole="button"
              accessibilityLabel="Regenerate letter"
            >
              <RefreshCw size={18} color="#ffffff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.iconButton, isEditing && styles.activeIconButton]} 
            onPress={() => setIsEditing(!isEditing)}
            disabled={generating}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? "Stop editing letter" : "Edit letter text"}
          >
            <Edit2 size={18} color={isEditing ? "#2dd4bf" : "#ffffff"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit mode indicator bar */}
      {isEditing && (
        <View style={styles.editIndicatorBar}>
          <Edit2 size={14} color="#2dd4bf" />
          <Text style={styles.editIndicatorText}>Editing mode — tap the letter text to make changes</Text>
        </View>
      )}

      <Text style={styles.infoLabel}>
        {generating ? "✨ AI is regenerating your letter..." : !isEditing ? "🔍 Review your generated letter. Tap the edit icon to modify." : ""}
      </Text>

      {/* Realistic Paper Layout */}
      <View style={{ flex: 1, opacity: generating ? 0.6 : 1 }}>
        <View style={styles.paperShadowWrap}>
          {/* Top paper fold effect */}
          <View style={styles.paperFoldShadow} />
          <ScrollView style={styles.paperWrapper} contentContainerStyle={styles.paperContent}>
            <View style={styles.paperHeaderBlock}>
              <View>
                <Text style={styles.paperCategoryTag}>{category || 'Civic Complaint'}</Text>
                <Text style={styles.paperDateText}>{formattedDate}</Text>
              </View>
              <View style={styles.letterheadSeal} />
            </View>
            
            <TextInput
              style={[styles.paperTextInput, isEditing ? styles.editableInput : styles.readOnlyInput]}
              multiline={true}
              value={editedText}
              onChangeText={setEditedText}
              editable={isEditing}
              scrollEnabled={false} // Managed by outer ScrollView
              accessibilityLabel="Letter content"
            />
            
            <View style={styles.paperWatermark}>
              <Text style={styles.watermarkText}>OFFICIAL COMPLAINT</Text>
            </View>
          </ScrollView>
        </View>
      </View>
      
      {/* Stats pill */}
      <View style={styles.statsContainer}>
        <View style={styles.statsPill}>
          <Text style={styles.statsText}>{wordCount} words</Text>
          <View style={styles.statsDivider} />
          <Text style={styles.statsText}>{charCount} chars</Text>
        </View>
      </View>

      {/* Action Buttons — 2-column grid */}
      <View style={styles.actionFooter}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCopy}
            disabled={generating}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={copied ? "Copied to clipboard" : "Copy letter text"}
          >
            {copied ? (
              <>
                <Check size={16} color="#2dd4bf" style={styles.actionIcon} />
                <Text style={[styles.actionButtonText, { color: '#2dd4bf' }]}>Copied!</Text>
              </>
            ) : (
              <>
                <CopyIcon size={16} color="#e4e4e7" style={styles.actionIcon} />
                <Text style={styles.actionButtonText}>Copy Text</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Share letter via system share"
          >
            <Share2 size={16} color="#e4e4e7" style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          {authorityEmail ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.emailButton]}
              onPress={handleEmail}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Send letter as email"
            >
              <Mail size={16} color="#ffffff" style={styles.actionIcon} />
              <Text style={styles.actionButtonTextFilled}>Email</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.pdfButton]}
              onPress={handlePrintPDF}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Export letter as PDF"
            >
              <Printer size={16} color="#ffffff" style={styles.actionIcon} />
              <Text style={styles.actionButtonTextFilled}>Export PDF</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.whatsappButton]}
            onPress={handleWhatsApp}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Share letter on WhatsApp"
          >
            <MessageSquare size={16} color="#ffffff" style={styles.actionIcon} />
            <Text style={styles.actionButtonTextFilled}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {authorityEmail && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.pdfButton, { flex: 1 }]}
              onPress={handlePrintPDF}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Export letter as PDF"
            >
              <Printer size={16} color="#ffffff" style={styles.actionIcon} />
              <Text style={styles.actionButtonTextFilled}>Export PDF</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  rightHeaderActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 38,
    height: 38,
    backgroundColor: '#27272a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3f3f46',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activeIconButton: {
    borderColor: '#0d9488',
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
  },
  editIndicatorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 8,
  },
  editIndicatorText: {
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  infoLabel: {
    color: '#a1a1aa',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
    minHeight: 16,
  },
  paperShadowWrap: {
    flex: 1,
    position: 'relative',
    marginBottom: 8,
  },
  paperFoldShadow: {
    position: 'absolute',
    top: 0,
    left: 4,
    right: 4,
    height: 6,
    backgroundColor: '#e8e8ea',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    zIndex: 0,
    opacity: 0.6,
  },
  paperWrapper: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    marginTop: 3,
    zIndex: 1,
  },
  paperContent: {
    padding: 24,
    paddingTop: 36,
    minHeight: 500,
  },
  paperHeaderBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 16,
  },
  paperCategoryTag: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0d9488',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  paperDateText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Courier',
  },
  letterheadSeal: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignSelf: 'flex-end',
    marginBottom: 16,
    borderStyle: 'dashed',
  },
  paperTextInput: {
    color: '#1e293b',
    fontSize: 14,
    fontFamily: 'Courier', // Gives a classic typewritten official feel
    lineHeight: 22,
    padding: 0,
    margin: 0,
    minHeight: 400,
    width: '100%',
    textAlignVertical: 'top',
  },
  readOnlyInput: {
    backgroundColor: 'transparent',
  },
  editableInput: {
    backgroundColor: 'rgba(13, 148, 136, 0.03)',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#2dd4bf',
    padding: 10,
    marginHorizontal: -10,
  },
  paperWatermark: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.03,
    transform: [{ rotate: '-30deg' }],
  },
  watermarkText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 2,
  },
  statsContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: 6,
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  statsDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#3f3f46',
    marginHorizontal: 10,
  },
  statsText: {
    fontSize: 11,
    color: '#a1a1aa',
    fontWeight: '600',
  },
  actionFooter: {
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 10,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailButton: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  whatsappButton: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  pdfButton: {
    backgroundColor: 'rgba(13, 148, 136, 0.8)',
    borderColor: '#0d9488',
  },
  actionIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    color: '#e4e4e7',
    fontSize: 13,
    fontWeight: 'bold',
  },
  actionButtonTextFilled: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
