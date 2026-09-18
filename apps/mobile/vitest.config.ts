import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Mobile unit tests run in the node environment: only pure logic under
// src/utils (storage-mocked queues, clipboard wrapper, persist config).
// Components and screens stay covered by the API integration suite and
// the Detox e2e specs — importing react-native here would crash vitest.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
  },
});
