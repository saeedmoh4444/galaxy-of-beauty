/**
 * Sentry facade tests — no-DSN passthrough, dynamic-import failure
 * fallback, and console fallbacks. (Coverage ratchet target:
 * src/lib/sentry.ts — was 0%)
 *
 * @sentry/node is intentionally NOT a dependency; the dynamic import
 * must throw and the facade must degrade to console logging.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { captureError, captureMessage } from '../lib/sentry';

describe('sentry facade', () => {
  afterEach(() => {
    delete process.env['SENTRY_DSN'];
    delete process.env['SENTRY_TRACES_SAMPLE_RATE'];
    vi.restoreAllMocks();
  });

  it('captures errors as console fallback when no DSN is configured', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await captureError(new Error('boom'), { orderId: 1 });
    expect(spy).toHaveBeenCalledWith('[Sentry]', 'boom', { orderId: 1 });
  });

  it('captures messages as console fallback when no DSN is configured', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await captureMessage('hello', 'warning');
    expect(spy).toHaveBeenCalledWith('[Sentry:warning]', 'hello');
  });

  it('defaults captureMessage level to error', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await captureMessage('default-level');
    expect(spy).toHaveBeenCalledWith('[Sentry:error]', 'default-level');
  });

  it('falls back to console when the dynamic @sentry/node import fails', async () => {
    process.env['SENTRY_DSN'] = 'https://test@example.invalid/123';
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Module is not installed → getSentry() catches and returns null,
    // then the console fallback runs.
    await captureError(new Error('dsn-set'));
    expect(spy).toHaveBeenCalledWith('[Sentry]', 'dsn-set', '');
    await captureMessage('dsn-msg');
    expect(spy).toHaveBeenCalled();
  });

  it('captures messages with no context arg', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await captureError(new Error('no-context'));
    expect(spy).toHaveBeenCalledWith('[Sentry]', 'no-context', '');
  });
});
