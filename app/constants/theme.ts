// SvaraLab Design System
// Inspired by Amy Food Journal & Luna Budgeting

export const colors = {
  // Backgrounds
  background: '#FAFAF8',
  backgroundAlt: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#F5F5F3',

  // Primary brand
  primary: '#6366F1', // Indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',

  // Accent colors for modes
  repeat: '#22C55E', // Green
  respond: '#6366F1', // Indigo
  listen: '#F59E0B', // Amber
  situation: '#EC4899', // Pink

  // Functional
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#0EA5E9',

  // Text
  textPrimary: '#1C1C1E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLight: '#FFFFFF',

  // Borders & Shadows
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  shadow: 'rgba(0, 0, 0, 0.05)',
  shadowMedium: 'rgba(0, 0, 0, 0.08)',
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
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};
