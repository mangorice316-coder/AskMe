import { Platform } from 'react-native';

export const THEME = {
  colors: {
    // Master Palette (Prompt Section 02)
    primaryBackground: '#0A0A09',
    secondaryBackground: '#11110F',
    darkBackground: '#0A0A09',
    darkSection: '#11110F',
    cardDark: 'rgba(255, 255, 255, 0.035)',
    cardBackground: 'rgba(255, 255, 255, 0.035)',
    cardDarkElevated: 'rgba(255, 255, 255, 0.055)',
    
    // Primary Brand Accents
    brandOrange: '#FF7135',
    secondaryOrange: '#FF8A50',
    softOrange: 'rgba(255, 113, 53, 0.12)',
    softOrangeBorder: 'rgba(255, 113, 53, 0.28)',

    // Typography & Contrast
    primaryText: '#F7F7F5',
    secondaryText: '#A6A39E',
    mutedText: '#77736F',
    pureWhite: '#FFFFFF',

    // Semantic Status Tokens
    success: '#38D982',
    successBg: 'rgba(56, 217, 130, 0.12)',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.12)',
    error: '#EF4444',
    errorBg: 'rgba(239, 68, 68, 0.12)',
    info: '#3B82F6',

    // Architectural Borders & Glass
    border: 'rgba(255, 255, 255, 0.09)',
    borderSubtle: 'rgba(255, 255, 255, 0.05)',
    borderFocus: '#FF7135',
    borderDark: 'rgba(255, 255, 255, 0.09)',
    borderDarkSubtle: 'rgba(255, 255, 255, 0.05)',

    // Ambient Lighting & Glows
    glowOrange: 'rgba(255, 113, 53, 0.35)',
    glowOrangeSubtle: 'rgba(255, 113, 53, 0.12)',
    glowGreen: 'rgba(56, 217, 130, 0.35)',
  },
  fonts: {
    heading: Platform.select({
      web: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      default: 'System',
    }),
    body: Platform.select({
      web: "'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      default: 'System',
    }),
    editorial: Platform.select({
      web: "'Instrument Serif', Georgia, serif",
      default: 'System',
    }),
    mono: Platform.select({
      web: "'JetBrains Mono', monospace",
      default: 'monospace',
    }),
  },
  radii: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    xxl: 36,
    pill: 9999,
  },
};

export default THEME;
