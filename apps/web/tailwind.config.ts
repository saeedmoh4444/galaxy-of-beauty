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
    },
  },
  plugins: [...(shared.plugins ?? [])],
};

export default config;
