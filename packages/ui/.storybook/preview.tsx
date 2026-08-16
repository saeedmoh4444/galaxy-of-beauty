import type { Preview } from '@storybook/react';
import './preview.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    darkMode: {
      classTarget: 'html',
    },
    backgrounds: {
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#111827' },
      ],
      default: 'light',
    },
  },
  decorators: [
    (Story) => (
      <div dir="rtl" className="p-6">
        <Story />
      </div>
    ),
  ],
};

export default preview;
