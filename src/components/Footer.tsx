import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import AskMeLogo from './AskMeLogo';
import { THEME } from '../theme/tokens';
import { ShieldCheck, ExternalLink } from 'lucide-react-native';

interface FooterProps {
  onNavigateHome?: () => void;
  onNavigateReport?: () => void;
  onNavigateHowItWorks?: () => void;
}

export default function Footer({
  onNavigateHome,
  onNavigateReport,
  onNavigateHowItWorks,
}: FooterProps) {
  return (
    <View style={styles.footerContainer}>
      <View style={styles.innerContent}>
        {/* Brand Column */}
        <View style={styles.brandCol}>
          <AskMeLogo size={36} showText={true} dark={true} tagline={true} />
          <Text style={styles.brandDesc}>
            AI-powered civic complaint and grievance assistance platform. Connecting citizen voices to the appropriate statutory authorities across India.
          </Text>
          <View style={styles.trustBadge}>
            <ShieldCheck size={14} color={THEME.colors.brandOrange} />
            <Text style={styles.trustBadgeText}>VERIFIED STATUTORY JURISDICTIONS</Text>
          </View>
        </View>

        {/* Links Column 1: Platform */}
        <View style={styles.linksCol}>
          <Text style={styles.linksHeader}>PLATFORM</Text>
          <TouchableOpacity style={styles.linkItem} onPress={onNavigateHome}>
            <Text style={styles.linkItemText}>Home Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem} onPress={onNavigateHowItWorks}>
            <Text style={styles.linkItemText}>How It Works</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem} onPress={onNavigateReport}>
            <Text style={styles.linkItemText}>Report a Problem</Text>
          </TouchableOpacity>
        </View>

        {/* Links Column 2: Government Portals */}
        <View style={styles.linksCol}>
          <Text style={styles.linksHeader}>OFFICIAL PORTALS</Text>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => Linking.openURL('https://pgportal.gov.in')}
          >
            <Text style={styles.linkItemText}>CPGRAMS Portal ↗</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => Linking.openURL('https://swachh.city')}
          >
            <Text style={styles.linkItemText}>Swachhata Urban ↗</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => Linking.openURL('https://nhai.gov.in')}
          >
            <Text style={styles.linkItemText}>NHAI Highways ↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Legal & Closing Statement */}
      <View style={styles.bottomBar}>
        <Text style={styles.closingText}>
          "Making civic voices easier to hear."
        </Text>
        <Text style={styles.copyText}>
          © {new Date().getFullYear()} ASKME. Non-partisan civic action assistant. Not an official government body.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#0A0A09',
    paddingTop: 64,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  innerContent: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 48,
    marginBottom: 48,
  },
  brandCol: {
    flex: 2,
    minWidth: 280,
  },
  brandDesc: {
    color: '#8E8A83',
    fontSize: 13,
    lineHeight: 22,
    marginTop: 16,
    marginBottom: 20,
    maxWidth: 420,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(244, 119, 56, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radii.pill,
    alignSelf: 'flex-start',
  },
  trustBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: THEME.colors.brandOrange,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 0.8,
  },
  linksCol: {
    flex: 1,
    minWidth: 150,
  },
  linksHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#FFFFFF',
    marginBottom: 18,
    fontFamily: THEME.fonts.mono,
  },
  linkItem: {
    marginBottom: 12,
  },
  linkItemText: {
    fontSize: 13,
    color: '#A8A49D',
    fontWeight: '500',
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  bottomBar: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingTop: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
  },
  closingText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: THEME.colors.brandOrange,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  copyText: {
    fontSize: 11,
    color: '#6E6B65',
    fontFamily: THEME.fonts.mono,
  },
});

