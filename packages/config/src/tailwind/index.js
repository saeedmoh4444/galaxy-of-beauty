/**
 * Tailwind CSS configuration for Galaxy of Beauty.
 *
 * SYNC NOTICE: Brand and accent color values must stay in sync with
 * packages/shared/src/theme/index.ts — these are the canonical
 * design tokens used by both Tailwind and the JS theme system.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  // Class strategy: the app toggles `.dark` on <html> (ThemeToggle +
  // pre-paint init script). 'media' (the Tailwind default) would make
  // every dark: variant follow the OS preference instead.
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf2f8',
          100: '#fbe3ee',
          200: '#f6c9de',
          300: '#ef9dc4',
          400: '#e268a0',
          500: '#d13d80',
          600: '#c2255c',
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
          500: '#d98e4a',
          600: '#c27333',
          700: '#a05b28',
          800: '#824a25',
          900: '#6a3d21',
          950: '#391d0c',
        },
        // Warm rose-tinted neutrals — overrides Tailwind's default cool gray,
        // so even unswept gray-* classes stay on-palette.
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
        // Semantic tokens — CSS custom properties for automatic dark mode.
        // Consumed by apps/web and packages/ui (Storybook) alike.
        surface: {
          DEFAULT: 'var(--color-surface)',
          muted: 'var(--color-surface-muted)',
          elevated: 'var(--color-surface-elevated)',
        },
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        edge: {
          DEFAULT: 'var(--color-border-default)',
          muted: 'var(--color-border-muted)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          subtle: 'var(--color-success-subtle)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          subtle: 'var(--color-warning-subtle)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          subtle: 'var(--color-danger-subtle)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          subtle: 'var(--color-info-subtle)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Tajawal', 'system-ui', 'sans-serif'],
        arabic: ['Tajawal', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
