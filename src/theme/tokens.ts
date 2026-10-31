import { Platform } from 'react-native';

export const THEME = {
  colors: {
    // Sellix Reference Monochrome Palette
    bg: '#000000',
    primaryBackground: '#000000',
    secondaryBackground: '#181818',
    panel: '#181818',
    darkBackground: '#000000',
    darkSection: '#181818',
    cardDark: 'rgba(255, 255, 255, 0.035)',
    cardBackground: 'rgba(255, 255, 255, 0.035)',
    cardDarkElevated: 'rgba(255, 255, 255, 0.065)',
    
    // High-Contrast Button & Glass Tokens
    btnWhite: '#fdfdfd',
    btnText: '#050505',
    glassFill: 'rgba(0, 0, 0, 0.78)',
    glassBorder: 'rgba(255, 255, 255, 0.09)',
    glassBorderHover: 'rgba(255, 255, 255, 0.22)',

    // Primary Brand Accents
    brandOrange: '#FF7135',
    secondaryOrange: '#FF8A50',
    softOrange: 'rgba(255, 113, 53, 0.12)',
    softOrangeBorder: 'rgba(255, 113, 53, 0.28)',

    // Typography & Contrast
    textMain: '#ffffff',
    primaryText: '#ffffff',
    textMuted: '#ededed',
    secondaryText: '#ededed',
    textSubtle: 'rgba(237, 237, 237, 0.72)',
    mutedText: 'rgba(237, 237, 237, 0.72)',
    pureWhite: '#ffffff',

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
    borderFocus: '#ffffff',
    borderDark: 'rgba(255, 255, 255, 0.09)',
    borderDarkSubtle: 'rgba(255, 255, 255, 0.05)',

    // Ambient Lighting & Glows
    glowWhite: 'rgba(255, 255, 255, 0.22)',
    glowOrange: 'rgba(255, 113, 53, 0.35)',
    glowOrangeSubtle: 'rgba(255, 113, 53, 0.12)',
    glowGreen: 'rgba(56, 217, 130, 0.35)',
  },
  fonts: {
    heading: Platform.select({
      web: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      default: 'System',
    }),
    body: Platform.select({
      web: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
    lg: 18,
    xl: 28,
    xxl: 36,
    pill: 9999,
  },
};

export default THEME;
