/**
 * W6-5 — Sentry cron-monitor heartbeat tests. Scheduled work must emit
 * check-ins so a silent scheduler death is visible; the facade stays
 * DSN-gated (console-only without a DSN, like the rest of lib/sentry).
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  captureCheckIn,
  withHeartbeat,
  loadSentryNode,
  _setSentryLoaderForTests,
} from '../lib/sentry';

describe('sentry heartbeats (W6-5)', () => {
  afterEach(() => {
    delete process.env['SENTRY_DSN'];
    _setSentryLoaderForTests(loadSentryNode);
    vi.restoreAllMocks();
  });

  it('captureCheckIn logs a console heartbeat without a DSN', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await captureCheckIn('token-cleanup', 'in_progress');
    expect(spy).toHaveBeenCalledWith('[Sentry:checkin:in_progress]', 'token-cleanup');
  });

  it('routes check-ins through the SDK when the DSN is set', async () => {
    process.env['SENTRY_DSN'] = 'https://test@o4508855274176512.ingest.sentry.io/123';
    const fakeSdk = {
      init: vi.fn(),
      captureException: vi.fn(),
      captureCheckIn: vi.fn(),
    };
    _setSentryLoaderForTests(
      async () => fakeSdk as unknown as Awaited<ReturnType<typeof loadSentryNode>>,
    );
    vi.spyOn(console, 'log').mockImplementation(() => {});
    await captureCheckIn('daily-stats', 'ok');
    expect(fakeSdk.captureCheckIn).toHaveBeenCalledWith({
      monitorSlug: 'daily-stats',
      status: 'ok',
    });
  });

  it('withHeartbeat emits in_progress → ok around a successful run', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const fn = vi.fn(async () => 42);
    const result = await withHeartbeat('payout-sweep', fn);
    expect(result).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
    const calls = spy.mock.calls.map((c) => c[0]);
    const progressIdx = calls.indexOf('[Sentry:checkin:in_progress]');
    const okIdx = calls.indexOf('[Sentry:checkin:ok]');
    expect(progressIdx).toBeGreaterThanOrEqual(0);
    expect(okIdx).toBeGreaterThan(progressIdx);
  });

  it('withHeartbeat emits in_progress → error and rethrows on failure', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const boom = new Error('sweep failed');
    await expect(
      withHeartbeat('sla-sweep', async () => {
        throw boom;
      }),
    ).rejects.toBe(boom);
    const calls = spy.mock.calls.map((c) => c[0]);
    expect(calls).toContain('[Sentry:checkin:in_progress]');
    expect(calls).toContain('[Sentry:checkin:error]');
  });
});
