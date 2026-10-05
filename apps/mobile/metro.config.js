// RN 0.87 removed react-native/rn-get-polyfills; the polyfill list now lives
// in @react-native/js-polyfills. Expo's default serializer falls back to []
// when the old entry is missing, which leaves ErrorUtils undefined and
// crashes Expo Go at startup (expo's Expo.fx.tsx calls
// ErrorUtils.getGlobalHandler). Provide the new list explicitly.
// (The @expo/metro-config patch that papered over this was removed in
// favor of this app-level override.)
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.serializer.getPolyfills = (ctx) => {
  // Web keeps its proven behavior (no RN polyfills — react-native-web
  // provides its own). Native platforms need the js-polyfills list so
  // ErrorUtils (and console) exist before the bundle runs.
  if (ctx && ctx.platform === 'web') return [];
  try {
    return require('@react-native/js-polyfills')();
  } catch {
    return [];
  }
};

module.exports = config;
