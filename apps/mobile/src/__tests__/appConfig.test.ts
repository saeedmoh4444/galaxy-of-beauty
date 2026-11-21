import { describe, it, expect } from 'vitest';
import appConfig from '../../app.config';

/**
 * EAS Update contract: `eas update` requires a runtimeVersion on the
 * dynamic config (app.config.js). With a static app.json the CLI used to
 * auto-write `{ "policy": "appVersion" }` into the (ephemeral) CI
 * checkout; a dynamic config cannot be written, so the OTA job hard-fails
 * with "Cannot automatically write to dynamic config" (2026-11-21).
 * The policy is appVersion so updates bind to the release version
 * (2.0.0), not the SDK or a build-number.
 */
describe('app.config.js (EAS Update contract)', () => {
  it('declares a runtimeVersion so eas update can publish', () => {
    expect(appConfig.expo.runtimeVersion).toEqual({ policy: 'appVersion' });
  });

  it('points EAS Update at the project url', () => {
    expect(appConfig.expo.updates?.url).toBe(
      'https://u.expo.dev/fe529822-25a6-4c65-9bec-38fe925d1ae3',
    );
  });
});
