/**
 * Alerting (AUDIT_2026-10-30 item 8) — webhook paging on top of Sentry.
 * Fail-safe by construction: never throws, dedupes repeats within a
 * 15-minute window (flapping guard), logs loudly when unconfigured.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sendAlert, resetAlertHistoryForTests } from '../lib/alerting';

describe('alerting', () => {
  beforeEach(() => {
    resetAlertHistoryForTests();
    vi.useFakeTimers();
    delete process.env['ALERT_WEBHOOK_URL'];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('dedupes the same key within the 15-minute window', async () => {
    process.env['ALERT_WEBHOOK_URL'] = 'https://hooks.example.com/x';
    const fetchMock = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await sendAlert('queue-stall', 'Queues stalling', 'gob-media stalled')).toBe(true);
    expect(await sendAlert('queue-stall', 'Queues stalling', 'gob-media stalled')).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(16 * 60_000);
    expect(await sendAlert('queue-stall', 'Queues stalling', 'gob-media stalled')).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('different keys fire independently', async () => {
    process.env['ALERT_WEBHOOK_URL'] = 'https://hooks.example.com/x';
    const fetchMock = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendAlert('disk-80', 'Disk', '80% used');
    await sendAlert('queue-stall', 'Queues', 'stalled');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('degrades to a log (returns false, never throws) when unconfigured', async () => {
    await expect(sendAlert('disk-80', 'Disk', '80% used', 'critical')).resolves.toBe(false);
  });

  it('swallows webhook delivery failures', async () => {
    process.env['ALERT_WEBHOOK_URL'] = 'https://hooks.example.com/x';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    await expect(sendAlert('disk-80', 'Disk', '80% used')).resolves.toBe(false);
  });
});
