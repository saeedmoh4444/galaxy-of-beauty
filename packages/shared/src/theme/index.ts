/**
 * Galaxy of Beauty — Design Tokens
 * Shared theme for web (Tailwind) and mobile (StyleSheet).
 */

// ---- Brand Colors ----
// Rose Blush direction (2026-09-09): warm cream surfaces, rose primary,
// champagne gold accent, warm rose-tinted neutrals. Replaces the stock
// violet/gray "generic startup" palette.
export const colors = {
  brand: {
    50: '#fdf2f8', // blush wash (heroes, highlights)
    100: '#fbe3ee',
    200: '#f6c9de',
    300: '#ef9dc4',
    400: '#e268a0',
    500: '#d13d80',
    600: '#c2255c', // primary — rich rose
    700: '#a01b4c',
    800: '#841741',
    900: '#6c1437',
    950: '#42081f',
  },
  accent: {
    50: '#fdf8f0',
    100: '#faeedd',
    200: '#f4dbb9',
    300: '#ebc08c',
    400: '#e2a766',
    500: '#d98e4a', // champagne gold (VIP, rewards)
    600: '#c27333',
    700: '#a05b28',
    800: '#824a25',
    900: '#6a3d21',
    950: '#391d0c',
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#e5484d',
  info: '#3b82f6',
  // Warm rose-tinted neutrals — 900/950 are warm near-blacks, never pure.
  gray: {
    50: '#fbf8f9',
    100: '#f4ecef',
    200: '#eadde2',
    300: '#d8c9ce',
    400: '#b3a0ab',
    500: '#8a6e78',
    600: '#6f5a62',
    700: '#57454d',
    800: '#413138',
    900: '#2d1b22',
    950: '#1f1418',
  },
} as const;

// ---- Typography ----
export const typography = {
  fontFamily: {
    sans: 'Inter, Tajawal, system-ui, sans-serif',
    arabic: 'Tajawal, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

// ---- Spacing ----
export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

// ---- Border Radius ----
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  '4xl': '2rem',
  full: '9999px',
} as const;

// ---- Shadows ----
// Warm-tinted, soft, generous blur — "soft premium" over harsh grays.
export const shadows = {
  sm: '0 1px 2px 0 rgb(45 27 34 / 0.06)',
  md: '0 4px 12px -2px rgb(45 27 34 / 0.08), 0 2px 4px -2px rgb(194 37 92 / 0.05)',
  lg: '0 12px 24px -4px rgb(45 27 34 / 0.1), 0 4px 8px -4px rgb(194 37 92 / 0.06)',
  xl: '0 24px 48px -8px rgb(45 27 34 / 0.14), 0 8px 16px -8px rgb(194 37 92 / 0.08)',
  card: '0 1px 3px rgb(194 37 92 / 0.06), 0 1px 2px rgb(45 27 34 / 0.05)',
} as const;

// ---- Breakpoints ----
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ---- Full Theme ----
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
} as const;

export type Theme = typeof theme;
export default theme;
