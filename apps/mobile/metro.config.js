/**
 * Metro config for the mobile app.
 *
 * RN 0.87 removed `react-native/rn-get-polyfills`, but @expo/metro-config
 * 57.0.13 (the final SDK 57 line) still requires it in its default
 * `serializer.getPolyfills` — so `expo export` / EAS release bundling
 * crashes with "Cannot find module .../react-native/rn-get-polyfills".
 *
 * Metro merges user config OVER the defaults, so providing our own
 * getPolyfills (the same file list RN now ships as @react-native/js-polyfills)
 * replaces the broken default for dev, export, and EAS builds alike.
 */
const { getDefaultConfig } = require('expo/metro-config');
const rnPolyfills = require('@react-native/js-polyfills');

const config = getDefaultConfig(__dirname);

config.serializer.getPolyfills = ({ platform }) => (platform ? rnPolyfills() : []);

module.exports = config;
