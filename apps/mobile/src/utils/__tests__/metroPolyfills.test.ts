import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);

// Regression: RN 0.87 removed react-native/rn-get-polyfills and Expo's
// default metro serializer falls back to an EMPTY list — which left
// ErrorUtils undefined in native bundles and crashed Expo Go at startup
// ("Cannot read property ... of undefined" in expo's Expo.fx.tsx, which
// calls ErrorUtils.getGlobalHandler()). apps/mobile/metro.config.js must
// override serializer.getPolyfills with this exact list.
describe('@react-native/js-polyfills contract', () => {
  it('provides the error-guard polyfill that defines ErrorUtils', () => {
    const list = require('@react-native/js-polyfills')() as string[];
    expect(list.length).toBeGreaterThan(0);

    const errorGuard = list.find((f) => f.endsWith('error-guard.js'));
    expect(errorGuard).toBeDefined();
    expect(existsSync(errorGuard as string)).toBe(true);

    // The polyfill is Flow-typed (Metro strips the annotations; plain node
    // cannot execute it), so assert on the exact handlers Expo.fx.tsx calls
    // at startup — missing setGlobalHandler was the red-screen crash.
    const source = readFileSync(errorGuard as string, 'utf8');
    expect(source).toContain('setGlobalHandler');
    expect(source).toContain('getGlobalHandler');
  });
});
