/**
 * W3-4 — biometric login outcome decision (pure, unit-tested).
 *
 * The old flow stopped at a success toast. The real flow:
 *   device auth → stored refresh token → auth.refresh → session + routing.
 */
export type BiometricFlowOutcome =
  | 'device-unavailable'
  | 'no-stored-session'
  | 'session-refreshed'
  | 'session-expired'
  | 'refresh-error';

export function biometricLoginOutcome(
  deviceAuthed: boolean,
  hasStoredToken: boolean,
  refreshResult: 'ok' | 'unauthorized' | 'error',
): BiometricFlowOutcome {
  if (!deviceAuthed) return 'device-unavailable';
  if (!hasStoredToken) return 'no-stored-session';
  if (refreshResult === 'ok') return 'session-refreshed';
  if (refreshResult === 'unauthorized') return 'session-expired';
  return 'refresh-error';
}
