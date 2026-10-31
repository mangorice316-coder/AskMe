import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import {
  History,
  Volume2,
  VolumeX,
  ArrowRight,
  Menu,
  X,
  Shield,
  Sparkles,
  Compass,
} from 'lucide-react-native';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleToggleSound = () => {
    const newState = soundFx.toggle();
    setAudioEnabled(newState);
  };

  const handleNavClick = (target: 'landing' | 'report' | 'history') => {
    soundFx.playClick();
    setMobileMenuOpen(false);
    onNavigate(target);
  };

  const handleSectionClick = (sectionId: string) => {
    soundFx.playClick();
    setMobileMenuOpen(false);
    if (currentScreen !== 'landing') {
      onNavigate('landing');
      setTimeout(() => onScrollToSection?.(sectionId), 120);
    } else {
      onScrollToSection?.(sectionId);
    }
  };

  return (
    <View style={styles.floatingWrapper}>
      <View style={styles.navBarGlass}>
        {/* 1. Brand Identity with Live Connectivity Dot */}
        <TouchableOpacity
          style={styles.logoBtn}
          onPress={() => handleNavClick('landing')}
          accessibilityRole="button"
          accessibilityLabel="Go to AskMe home"
          activeOpacity={0.82}
        >
          <AskMeLogo size={34} showText={true} />
          <View style={styles.networkPulsePill}>
            <View style={styles.networkPulseDot} />
            <Text style={styles.networkPulseText}>ONLINE</Text>
          </View>
        </TouchableOpacity>

        {/* 2. Desktop Center Navigation (Visible on wider screens) */}
        <View style={styles.centerNav}>
          <TouchableOpacity
            style={[styles.navItem, currentScreen === 'landing' && styles.navItemActive]}
            onPress={() => handleNavClick('landing')}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.navText,
                currentScreen === 'landing' && styles.navTextActive,
              ]}
            >
              Home
            </Text>
            {currentScreen === 'landing' && <View style={styles.activeGlowPill} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleSectionClick('how-it-works')}
            activeOpacity={0.75}
          >
            <Text style={styles.navText}>How It Works</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleSectionClick('report-your-way')}
            activeOpacity={0.75}
          >
            <Text style={styles.navText}>Features</Text>
          </TouchableOpacity>

          {/* Citizen Vault Link with Counter Badge */}
          <TouchableOpacity
            style={[
              styles.navItem,
              currentScreen === 'history' && styles.navItemActive,
            ]}
            onPress={() => handleNavClick('history')}
            activeOpacity={0.75}
          >
            <View style={styles.vaultRow}>
              <History size={13} color={currentScreen === 'history' ? '#F47738' : '#8E8A83'} />
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
            {currentScreen === 'history' && <View style={styles.activeGlowPill} />}
          </TouchableOpacity>
        </View>

        {/* 3. Right Action Tools (Sound FX + CTA + Mobile Hamburger) */}
        <View style={styles.rightActions}>
          {/* Audio FX Switcher */}
          <TouchableOpacity
            style={[styles.soundBtn, audioEnabled && styles.soundBtnActive]}
            onPress={handleToggleSound}
            accessibilityRole="button"
            accessibilityLabel={audioEnabled ? 'Mute acoustic audio feedback' : 'Enable acoustic audio feedback'}
            activeOpacity={0.8}
          >
            {audioEnabled ? (
              <Volume2 size={14} color="#F47738" />
            ) : (
              <VolumeX size={14} color="#6E6B65" />
            )}
          </TouchableOpacity>

          {/* Primary Action Button */}
          {currentScreen !== 'report' ? (
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => handleNavClick('report')}
              accessibilityRole="button"
              accessibilityLabel="Report a civic problem"
              activeOpacity={0.88}
            >
              <Text style={styles.primaryCtaText}>Report Problem</Text>
              <View style={styles.arrowIconBubble}>
                <ArrowRight size={12} color="#FFFFFF" strokeWidth={2.6} />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.secondaryHomeBtn}
              onPress={() => handleNavClick('landing')}
              activeOpacity={0.82}
            >
              <Text style={styles.secondaryHomeBtnText}>Back to Overview</Text>
            </TouchableOpacity>
          )}

          {/* Mobile Hamburger Button */}
          <TouchableOpacity
            style={styles.mobileMenuToggle}
            onPress={() => {
              soundFx.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            accessibilityRole="button"
            accessibilityLabel="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X size={18} color="#FFFFFF" />
            ) : (
              <Menu size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Mobile Responsive Drawer Sheet */}
      {mobileMenuOpen && (
        <View style={styles.mobileDrawer}>
          <TouchableOpacity
            style={styles.mobileNavItem}
            onPress={() => handleNavClick('landing')}
          >
            <Compass size={16} color={currentScreen === 'landing' ? '#F47738' : '#A8A49D'} />
            <Text
              style={[
                styles.mobileNavText,
                currentScreen === 'landing' && styles.mobileNavTextActive,
              ]}
            >
              Home Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mobileNavItem}
            onPress={() => handleSectionClick('how-it-works')}
          >
            <Sparkles size={16} color="#A8A49D" />
            <Text style={styles.mobileNavText}>How It Works</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mobileNavItem}
            onPress={() => handleSectionClick('report-your-way')}
          >
            <Shield size={16} color="#A8A49D" />
            <Text style={styles.mobileNavText}>Multimodal Features</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mobileNavItem}
            onPress={() => handleNavClick('history')}
          >
            <History size={16} color={currentScreen === 'history' ? '#F47738' : '#A8A49D'} />
            <Text
              style={[
                styles.mobileNavText,
                currentScreen === 'history' && styles.mobileNavTextActive,
              ]}
            >
              Citizen Vault ({historyCount})
            </Text>
          </TouchableOpacity>

          <View style={styles.mobileDrawerDivider} />

          <TouchableOpacity
            style={styles.mobileCtaBtn}
            onPress={() => handleNavClick('report')}
          >
            <Text style={styles.mobileCtaText}>Start Grievance Report</Text>
            <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    zIndex: 9999,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  navBarGlass: {
    maxWidth: 1160,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 15, 14, 0.88)',
    borderRadius: THEME.radii.pill,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }
      : {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.6,
          shadowRadius: 24,
          elevation: 10,
        }),
  },
  logoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  networkPulsePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.28)',
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  networkPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  networkPulseText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: 0.8,
    fontFamily: THEME.fonts.mono,
  },
  centerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  navItem: {
    position: 'relative',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: THEME.radii.pill,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  navText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A8A49D',
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
    letterSpacing: -0.1,
  },
  navTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeGlowPill: {
    position: 'absolute',
    bottom: -2,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: '#F47738',
    borderRadius: 1,
    shadowColor: '#F47738',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  vaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vaultBadge: {
    backgroundColor: '#F47738',
    borderRadius: 8,
    minWidth: 17,
    height: 17,
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
    gap: 10,
  },
  soundBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundBtnActive: {
    backgroundColor: 'rgba(244, 119, 56, 0.15)',
    borderColor: 'rgba(244, 119, 56, 0.45)',
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F47738',
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 10,
    borderRadius: THEME.radii.pill,
    shadowColor: '#F47738',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 4,
    ...(Platform.OS === 'web'
      ? {
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }
      : {}),
  },
  primaryCtaText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
  arrowIconBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryHomeBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  secondaryHomeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mobileMenuToggle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    display: Platform.OS === 'web' ? 'none' : 'flex',
  },
  mobileDrawer: {
    width: '100%',
    maxWidth: 1160,
    marginTop: 8,
    backgroundColor: '#151514',
    borderRadius: THEME.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
        }
      : {}),
  },
  mobileNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: THEME.radii.md,
  },
  mobileNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A8A49D',
  },
  mobileNavTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mobileDrawerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 4,
  },
  mobileCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F47738',
    paddingVertical: 12,
    borderRadius: THEME.radii.pill,
  },
  mobileCtaText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
