/**
 * Expo app config (app.config.js) — replaces the static app.json so the
 * Sentry native plugin can be enabled conditionally.
 *
 * Fail-closed policy (same as the web sentry configs, fix #705): the
 * @sentry/react-native plugin's build phase runs sentry-cli, which HARD-
 * FAILS native EAS builds when organization/project are missing
 * (2026-11-21: both iOS and Android builds failed with "An organization ID
 * or slug is required"). The plugin is therefore included ONLY when
 * SENTRY_ORG + SENTRY_PROJECT are provided (EAS env vars or local env).
 * Runtime Sentry remains DSN-gated and works without the plugin.
 */
/**
 * Local plugin: R8 keep-rules for react-native-webrtc (libwebrtc JNI).
 * Release minification strips org.webrtc.Dav1dDecoder$Natives — referenced
 * reflectively via Dav1dDecoderJni.get() — and R8 fails the build
 * (2026-11-21 EAS failure after the Sentry chain was fixed). The webrtc
 * packages ship no consumer proguard rules for the JNI classes.
 */
import { withDangerousMod } from 'expo/config-plugins';

const WEBRTC_KEEP_RULES = `
# react-native-webrtc (libwebrtc JNI) — R8 keep rules
-keep class org.webrtc.** { *; }
-dontwarn org.webrtc.**
`;

const withWebrtcProguardRules = (config) =>
  withDangerousMod(config, [
    'android',
    async (cfg) => {
      const fs = await import('node:fs/promises');
      const path = await import('node:path');
      const file = path.join(cfg.modRequest.platformProjectRoot, 'app', 'proguard-rules.pro');
      const existing = await fs.readFile(file, 'utf8').catch(() => '');
      if (!existing.includes('org.webrtc.**')) {
        await fs.appendFile(file, WEBRTC_KEEP_RULES);
      }
      return cfg;
    },
  ]);

export default {
  expo: {
    name: 'Galaxy of Beauty',
    slug: 'galaxy-of-beauty',
    version: '2.0.0',
    orientation: 'portrait',
    scheme: 'galaxyofbeauty',
    platforms: ['ios', 'android', 'web'],
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#c2255c',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'sa.galaxyofbeauty.app',
      infoPlist: {
        NSCameraUsageDescription: 'لتجربة المكياج الافتراضية والتقاط الصور',
        NSPhotoLibraryUsageDescription: 'لتحميل صوركِ لتحليل البشرة',
        NSLocationWhenInUseUsageDescription: 'لعرض الصالونات القريبة من موقعك',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-foreground.png',
        backgroundColor: '#c2255c',
      },
      package: 'sa.galaxyofbeauty.app',
      permissions: ['CAMERA', 'ACCESS_FINE_LOCATION', 'VIBRATE'],
      statusBar: {
        backgroundColor: '#c2255c',
        barStyle: 'light-content',
      },
    },
    web: {
      favicon: './assets/icon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      'expo-camera',
      'expo-location',
      'expo-notifications',
      '@config-plugins/react-native-webrtc',
      'expo-status-bar',
      'expo-video',
      withWebrtcProguardRules,
      // Sentry native upload — included only when the full upload chain is
      // configured (org + project + auth token). Partial configuration is
      // worse than none: sentry-cli exits non-zero mid-build (2026-11-21:
      // org/project present without SENTRY_AUTH_TOKEN still killed the
      // Android build at SentryUpload). Builds must never fail on Sentry.
      ...(process.env.SENTRY_ORG && process.env.SENTRY_PROJECT && process.env.SENTRY_AUTH_TOKEN
        ? [
            [
              '@sentry/react-native',
              { organization: process.env.SENTRY_ORG, project: process.env.SENTRY_PROJECT },
            ],
          ]
        : []),
    ],
    extra: {
      eas: {
        projectId: 'fe529822-25a6-4c65-9bec-38fe925d1ae3',
      },
    },
    notification: {
      icon: './assets/notification-icon.png',
      color: '#c2255c',
    },
    updates: {
      url: 'https://u.expo.dev/fe529822-25a6-4c65-9bec-38fe925d1ae3',
      enabled: true,
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 30000,
    },
  },
};
