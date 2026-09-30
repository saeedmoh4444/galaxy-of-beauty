import type { StorybookConfig } from '@storybook/react-vite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'node:url';

const config: StorybookConfig = {
  stories: ['../src/**/*.Stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: (viteConfig) => {
    return {
      ...viteConfig,
      resolve: {
        ...viteConfig.resolve,
        alias: {
          ...viteConfig.resolve?.alias,
          '@': join(dirname(fileURLToPath(import.meta.url)), 'src'),
        },
      },
    };
  },
};

export default config;
