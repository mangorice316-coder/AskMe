import { Platform } from 'react-native';

export const THEME = {
  colors: {
    // Cinematic Visual System (Prompt Section 03 & Design Concept Boards)
    primaryIvory: '#F5F3EE',
    pureWhite: '#FFFFFF',
    mainCharcoal: '#191918',
    secondaryCharcoal: '#252523',
    darkVisualBackground: '#0D0D0C',
    darkBackground: '#121211',
    darkSection: '#161615',
    cardDark: '#1A1A18',
    cardDarkElevated: '#222220',
    borderDark: '#2C2C28',
    borderDarkSubtle: 'rgba(255, 255, 255, 0.08)',

    // Primary Light Surfaces (Tactile Letter & Editorial Moments)
    primaryBackground: '#0D0D0C', // Root background is cinematic dark cosmos
    secondaryBackground: '#FFFFFF',
    primaryText: '#FFFFFF', // High contrast white for dark cosmos
    secondaryText: '#A8A49D', // Refined warm silver
    mutedText: '#6E6B65', // Subtle telemetry microcopy
    darkText: '#191918', // For ivory letter preview
    darkTextSecondary: '#5C5852',

    // Signature Jewel Brand Accents
    brandOrange: '#F47738', // Electric amber orange
    brandCoral: '#FF6652', // Radiant coral glow
    softOrange: '#FFF0E7',
    softOrangeBorder: '#FCD8C6',
    border: '#2C2C28',
    borderSubtle: '#1F1F1D',
    borderFocus: '#F47738',

    // Ambient Lighting & Glows
    glowOrange: 'rgba(244, 119, 56, 0.35)',
    glowOrangeSubtle: 'rgba(244, 119, 56, 0.15)',
    glowCoral: 'rgba(255, 102, 82, 0.25)',
    glowGreen: 'rgba(34, 197, 94, 0.35)',

    // Semantic Status Tokens
    success: '#22C55E', // Vivid emerald green
    successBg: 'rgba(34, 197, 94, 0.12)',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.12)',
    error: '#EF4444',
    errorBg: 'rgba(239, 68, 68, 0.12)',
    info: '#3B82F6',
  },
  fonts: {
    heading: Platform.select({
      web: "'Sora', 'Space Grotesk', -apple-system, sans-serif",
      default: 'System',
    }),
    body: Platform.select({
      web: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
      default: 'System',
    }),
    mono: Platform.select({
      web: "'JetBrains Mono', 'IBM Plex Mono', monospace",
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
