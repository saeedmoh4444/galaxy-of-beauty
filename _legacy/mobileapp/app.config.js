/**
 * Expo dynamic config — reads from environment for dev vs production.
 *
 * Development:
 *   expo start  →  uses localhost fallback (or set API_URL / WS_URL env vars)
 *
 * Production (EAS Build):
 *   eas build --profile production  →  picks up API_URL / WS_URL from CI secrets
 */
const API_URL = process.env.API_URL || 'http://localhost:4000/api';
const WS_URL = process.env.WS_URL || 'http://localhost:4000';

export default {
  expo: {
    name: 'Galaxy of Beauty',
    slug: 'galaxy-of-beauty',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      backgroundColor: '#7C3AED',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'sa.galaxyofbeauty.app',
      infoPlist: {
        NSCameraUsageDescription: 'لتصوير المستندات للتوثيق',
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#7C3AED',
      },
      package: 'sa.galaxyofbeauty.app',
      permissions: ['CAMERA', 'NOTIFICATIONS'],
    },
    plugins: [
      'expo-notifications',
      'expo-secure-store',
    ],
    extra: {
      apiUrl: API_URL,
      wsUrl: WS_URL,
    },
  },
};
