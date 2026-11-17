/**
 * W3-4 — biometric login was cosmetic: device auth succeeded → success
 * toast → nothing else. The flow now actually signs the user in:
 *   device auth → stored refresh token → auth.refresh → session + routing.
 *
 * biometricLoginOutcome is the pure decision pinned here; the screen
 * wires device auth, the refresh mutation and the token store around it.
 */
import { describe, expect, it } from 'vitest';
import { biometricLoginOutcome } from '../biometricLogin';

describe('biometricLoginOutcome (W3-4)', () => {
  it('device auth failure → device-unavailable', () => {
    expect(biometricLoginOutcome(false, true, 'ok')).toBe('device-unavailable');
  });

  it('no stored session → no-stored-session (log in with password first)', () => {
    expect(biometricLoginOutcome(true, false, 'ok')).toBe('no-stored-session');
  });

  it('refresh ok → session-refreshed', () => {
    expect(biometricLoginOutcome(true, true, 'ok')).toBe('session-refreshed');
  });

  it('refresh UNAUTHORIZED → session-expired (clear the stored token)', () => {
    expect(biometricLoginOutcome(true, true, 'unauthorized')).toBe('session-expired');
  });

  it('refresh network error → refresh-error (retryable, keep the token)', () => {
    expect(biometricLoginOutcome(true, true, 'error')).toBe('refresh-error');
  });
});
