// SvaraLab Design System
// Notion-inspired clean, minimal design

export const colors = {
  // Backgrounds
  background: '#FFFFFF',
  backgroundAlt: '#F7F7F5',
  card: '#FFFFFF',
  cardAlt: '#F7F7F5',

  // Primary brand (dark slate)
  primary: '#0f172a',
  primaryHover: '#334155',

  // Notion-style color palette
  notion: {
    bg: '#FFFFFF',
    bgSecondary: '#F7F7F5',
    border: '#E3E2E0',
    text: '#37352F',
    textLight: '#787774',

    // Accent backgrounds and text
    blue: '#EBF5FE',
    blueText: '#2B5F8C',
    green: '#EDFDF3',
    greenText: '#2B8C55',
    orange: '#FAEBDD',
    orangeText: '#D9730D',
    red: '#FBE4E4',
    redText: '#D44C47',
    purple: '#F6F3F9',
    purpleText: '#6940A5',
  },

  // Game mode colors (Notion-style)
  repeat: '#D9730D',      // Orange - Ucapkan/Speed
  repeatBg: '#FAEBDD',
  respond: '#2B5F8C',     // Blue - Jawab/Logic
  respondBg: '#EBF5FE',
  listen: '#2B8C55',      // Green - Simak/Focus
  listenBg: '#EDFDF3',
  situation: '#D44C47',   // Red - Situasi/Real World
  situationBg: '#FBE4E4',

  // Functional
  success: '#2B8C55',
  successBg: '#EDFDF3',
  warning: '#D9730D',
  warningBg: '#FAEBDD',
  error: '#D44C47',
  errorBg: '#FBE4E4',
  info: '#2B5F8C',
  infoBg: '#EBF5FE',

  // Text
  textPrimary: '#37352F',
  textSecondary: '#787774',
  textTertiary: '#9CA3AF',
  textMuted: '#9CA3AF',
  textLight: '#FFFFFF',

  // Borders & Shadows
  border: '#E3E2E0',
  borderLight: '#F0F0F0',
  shadow: 'rgba(15, 15, 15, 0.05)',
  shadowMedium: 'rgba(15, 15, 15, 0.1)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,

  // Font weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  notion: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  notionFloat: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};
