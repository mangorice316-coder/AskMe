import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { History, Volume2, VolumeX, ArrowRight } from 'lucide-react-native';
import AskMeLogo from './AskMeLogo';
import { THEME } from '../theme/tokens';
import { soundFx } from '../utils/soundEffects';

interface NavbarProps {
  currentScreen: 'landing' | 'report' | 'processing' | 'clarification' | 'results' | 'history';
  onNavigate: (screen: 'landing' | 'report' | 'history') => void;
  onScrollToSection?: (sectionId: string) => void;
  historyCount: number;
}

export default function Navbar({
  currentScreen,
  onNavigate,
  onScrollToSection,
  historyCount,
}: NavbarProps) {
  const [audioEnabled, setAudioEnabled] = useState(soundFx.isEnabled());

  const handleToggleSound = () => {
    const newState = soundFx.toggle();
    setAudioEnabled(newState);
  };

  const handleNavClick = (target: 'landing' | 'report' | 'history') => {
    soundFx.playClick();
    onNavigate(target);
  };

  return (
    <View style={styles.floatingWrapper}>
      <View style={styles.navBarGlass}>
        {/* Brand Logo */}
        <TouchableOpacity
          style={styles.logoBtn}
          onPress={() => handleNavClick('landing')}
          accessibilityRole="button"
          accessibilityLabel="Go to AskMe home"
          activeOpacity={0.8}
        >
          <AskMeLogo size={36} showText={true} />
        </TouchableOpacity>

        {/* Center Navigation Links (from concept2_landing_hero.jpg) */}
        <View style={styles.centerNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleNavClick('landing')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.navText,
                currentScreen === 'landing' && styles.navTextActive,
              ]}
            >
              Home
            </Text>
            {currentScreen === 'landing' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              if (currentScreen !== 'landing') onNavigate('landing');
              onScrollToSection?.('how-it-works');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.navText}>How it Works</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              if (currentScreen !== 'landing') onNavigate('landing');
              onScrollToSection?.('report-your-way');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.navText}>Features</Text>
          </TouchableOpacity>

          {/* Vault Link with Count */}
          <TouchableOpacity
            style={[
              styles.navItem,
              currentScreen === 'history' && styles.navItemActive,
            ]}
            onPress={() => handleNavClick('history')}
            activeOpacity={0.7}
          >
            <View style={styles.vaultRow}>
              <Text
                style={[
                  styles.navText,
                  currentScreen === 'history' && styles.navTextActive,
                ]}
              >
                Vault
              </Text>
              {historyCount > 0 && (
                <View style={styles.vaultBadge}>
                  <Text style={styles.vaultBadgeText}>{historyCount}</Text>
                </View>
              )}
            </View>
            {currentScreen === 'history' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          {/* Optional Audio FX Toggle (Prompt Section 18) */}
          <TouchableOpacity
            style={[styles.soundBtn, audioEnabled && styles.soundBtnActive]}
            onPress={handleToggleSound}
            accessibilityRole="button"
            accessibilityLabel={audioEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {audioEnabled ? (
              <Volume2 size={15} color="#F47738" />
            ) : (
              <VolumeX size={15} color="#77736E" />
            )}
          </TouchableOpacity>

          {/* Primary CTA: "Report a Problem →" (Concept Board Button) */}
          {currentScreen !== 'report' ? (
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => handleNavClick('report')}
              accessibilityRole="button"
              accessibilityLabel="Report a civic problem"
              activeOpacity={0.88}
            >
              <Text style={styles.primaryCtaText}>Report a Problem</Text>
              <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.secondaryHomeBtn}
              onPress={() => handleNavClick('landing')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryHomeBtnText}>Back to Overview</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    zIndex: 999,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  navBarGlass: {
    maxWidth: 1140,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18, 18, 17, 0.82)',
    borderRadius: THEME.radii.pill,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  logoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  navItem: {
    position: 'relative',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  navItemActive: {},
  navText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A8A49D',
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  navTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: '#F47738',
    borderRadius: 1,
  },
  vaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vaultBadge: {
    backgroundColor: '#F47738',
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  vaultBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: THEME.fonts.mono,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  soundBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundBtnActive: {
    backgroundColor: 'rgba(244, 119, 56, 0.15)',
    borderColor: 'rgba(244, 119, 56, 0.4)',
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F47738',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: THEME.radii.pill,
    shadowColor: '#F47738',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryCtaText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  secondaryHomeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryHomeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
