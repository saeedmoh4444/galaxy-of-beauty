/**
 * E2 — push hardening: invalid device tokens must be pruned.
 *
 * Expo reports per-ticket statuses aligned with the message array; a
 * DeviceNotRegistered ticket means the app was uninstalled (or the token
 * rotated) and every future send to it is wasted — and counted against the
 * circuit breaker. The pure classifier maps tickets to token indexes so
 * the sender can delete exactly the dead rows.
 */
import { describe, expect, it } from 'vitest';
import { invalidTokenIndexes } from '../lib/push';

describe('invalidTokenIndexes (Expo ticket classifier)', () => {
  it('returns no indexes when every ticket is ok', () => {
    const tickets = [
      { status: 'ok' as const, id: '1' },
      { status: 'ok' as const, id: '2' },
    ];
    expect(invalidTokenIndexes(tickets)).toEqual([]);
  });

  it('flags DeviceNotRegistered tickets by their index', () => {
    const tickets = [
      { status: 'ok' as const },
      { status: 'error' as const, details: { error: 'DeviceNotRegistered' } },
      { status: 'error' as const, details: { error: 'DeviceNotRegistered' } },
    ];
    expect(invalidTokenIndexes(tickets)).toEqual([1, 2]);
  });

  it('keeps other ticket errors (transient) — only unregistered devices are pruned', () => {
    const tickets = [
      { status: 'error' as const, details: { error: 'MessageTooBig' } },
      { status: 'error' as const, details: { error: 'DeviceNotRegistered' } },
      { status: 'error' as const, message: 'no details' },
    ];
    expect(invalidTokenIndexes(tickets)).toEqual([1]);
  });

  it('handles a missing ticket list defensively', () => {
    expect(invalidTokenIndexes([])).toEqual([]);
  });
});
