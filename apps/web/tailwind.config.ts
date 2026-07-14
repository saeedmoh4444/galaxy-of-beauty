import type { Config } from 'tailwindcss';
import shared from '@galaxy/config/tailwind';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared/src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [shared],
  theme: {
    extend: {
      ...shared.theme?.extend,
      animation: {
        indeterminate: 'indeterminate 1.5s ease-in-out infinite',
      },
      keyframes: {
        indeterminate: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
    },
  },
  plugins: [...(shared.plugins ?? [])],
};

export default config;
