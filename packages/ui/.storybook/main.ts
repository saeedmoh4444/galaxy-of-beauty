import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  async viteFinal(viteConfig) {
    // The ui package ships "use client" directives for Next.js; strip them
    // so Vite can bundle the components for Storybook.
    viteConfig.plugins?.unshift({
      name: 'strip-use-client',
      enforce: 'pre',
      transform(code: string, id: string) {
        if (/\.(ts|tsx)$/.test(id) && code.includes('use client')) {
          return code.replace(/^['"]use client['"];\s*/m, '');
        }
        return code;
      },
    });
    return viteConfig;
  },
};

export default config;
