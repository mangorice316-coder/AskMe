import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
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
          <AskMeLogo size={32} showText={true} />
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
            onPress={() => handleSectionClick('features')}
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
              <History size={13} color={currentScreen === 'history' ? '#FF7135' : '#A6A39E'} />
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
              <Volume2 size={14} color="#FF7135" />
            ) : (
              <VolumeX size={14} color="#77736F" />
            )}
          </TouchableOpacity>

          {/* Primary Action Button with Button-in-Button Arrow */}
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
                <ArrowRight size={12} color="#FFFFFF" strokeWidth={2.8} />
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

      {/* 4. Full-Screen Mobile Drawer Overlay (Prompt Section 04) */}
      {mobileMenuOpen && (
        <View style={styles.mobileDrawer}>
          <View style={styles.mobileDrawerHeader}>
            <AskMeLogo size={28} showText={true} />
            <TouchableOpacity
              style={styles.mobileCloseBtn}
              onPress={() => setMobileMenuOpen(false)}
            >
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.mobileLinksStack}>
            <TouchableOpacity
              style={styles.mobileNavItem}
              onPress={() => handleNavClick('landing')}
            >
              <Compass size={18} color={currentScreen === 'landing' ? '#FF7135' : '#A6A39E'} />
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
              <Sparkles size={18} color="#A6A39E" />
              <Text style={styles.mobileNavText}>How It Works</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mobileNavItem}
              onPress={() => handleSectionClick('features')}
            >
              <Shield size={18} color="#A6A39E" />
              <Text style={styles.mobileNavText}>Features & Capabilities</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mobileNavItem}
              onPress={() => handleNavClick('history')}
            >
              <History size={18} color={currentScreen === 'history' ? '#FF7135' : '#A6A39E'} />
              <Text
                style={[
                  styles.mobileNavText,
                  currentScreen === 'history' && styles.mobileNavTextActive,
                ]}
              >
                Citizen Vault ({historyCount})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mobileDrawerDivider} />

          <TouchableOpacity
            style={styles.mobileCtaBtn}
            onPress={() => handleNavClick('report')}
          >
            <Text style={styles.mobileCtaText}>Report a Problem</Text>
            <View style={styles.arrowIconBubble}>
              <ArrowRight size={13} color="#FFFFFF" strokeWidth={2.6} />
            </View>
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
    paddingTop: 14,
    paddingBottom: 6,
    zIndex: 9999,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  navBarGlass: {
    maxWidth: 1140,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    borderRadius: THEME.radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderBottomColor: 'rgba(255, 255, 255, 0.09)',
    borderBottomWidth: 1,
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 18px 40px -6px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
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
    backgroundColor: 'rgba(56, 217, 130, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 217, 130, 0.28)',
    borderRadius: THEME.radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  networkPulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#38D982',
  },
  networkPulseText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38D982',
    letterSpacing: 0.6,
    fontFamily: THEME.fonts.mono,
  },
  centerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...(Platform.OS === 'web'
      ? {}
      : {
          display: 'none',
        }),
  },
  navItem: {
    position: 'relative',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.radii.pill,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  navText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A6A39E',
    letterSpacing: -0.1,
    fontFamily: THEME.fonts.heading,
  },
  navTextActive: {
    color: '#F7F7F5',
    fontWeight: '700',
  },
  activeGlowPill: {
    position: 'absolute',
    bottom: 2,
    left: '20%',
    right: '20%',
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FF7135',
  },
  vaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vaultBadge: {
    backgroundColor: '#FF7135',
    borderRadius: 10,
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
    gap: 8,
  },
  soundBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundBtnActive: {
    borderColor: 'rgba(255, 113, 53, 0.3)',
    backgroundColor: 'rgba(255, 113, 53, 0.08)',
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fdfdfd',
    borderRadius: THEME.radii.pill,
    paddingVertical: 7,
    paddingLeft: 16,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: '#fdfdfd',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 4px 14px rgba(255, 255, 255, 0.16)',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }
      : {}),
  },
  primaryCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#050505',
    letterSpacing: -0.1,
    fontFamily: THEME.fonts.heading,
  },
  arrowIconBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryHomeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryHomeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F7F7F5',
  },
  mobileMenuToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    ...(Platform.OS === 'web'
      ? {
          display: 'none',
        }
      : {}),
  },

  /* Mobile Full-Screen Drawer */
  mobileDrawer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(17, 17, 15, 0.96)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 20,
    gap: 16,
    zIndex: 99999,
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 24px 50px rgba(0, 0, 0, 0.85)',
        }
      : {}),
  },
  mobileDrawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  mobileCloseBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  mobileLinksStack: {
    gap: 10,
  },
  mobileNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  mobileNavText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#A6A39E',
    fontFamily: THEME.fonts.heading,
  },
  mobileNavTextActive: {
    color: '#F7F7F5',
  },
  mobileDrawerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  mobileCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF7135',
    paddingVertical: 14,
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  mobileCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
