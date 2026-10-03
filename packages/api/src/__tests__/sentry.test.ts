/**
 * Sentry facade tests — no-DSN passthrough, dynamic-import failure
 * fallback, SDK initialization, and console fallbacks. (Coverage ratchet
 * target: src/lib/sentry.ts — was 0%)
 *
 * @sentry/node IS a dependency; the loader seam (_setSentryLoaderForTests)
 * simulates a missing/broken module deterministically.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  captureError,
  captureMessage,
  loadSentryNode,
  _setSentryLoaderForTests,
} from '../lib/sentry';

describe('sentry facade', () => {
  afterEach(() => {
    delete process.env['SENTRY_DSN'];
    delete process.env['SENTRY_TRACES_SAMPLE_RATE'];
    _setSentryLoaderForTests(loadSentryNode);
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
    // Simulate a failed module load — the facade must catch it and
    // degrade to console logging.
    _setSentryLoaderForTests(async () => {
      throw new Error('ERR_MODULE_NOT_FOUND');
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
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

  it('initializes the SDK and routes captures through it when the DSN is set', async () => {
    process.env['SENTRY_DSN'] = 'https://test@o4508855274176512.ingest.sentry.io/123';
    // Fake the loaded module at the seam — the real @sentry/node path is
    // covered by the activation smoke test (raw Node, outside vitest).
    const fakeSdk = { init: vi.fn(), captureException: vi.fn() };
    _setSentryLoaderForTests(
      async () => fakeSdk as unknown as Awaited<ReturnType<typeof loadSentryNode>>,
    );
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await captureError(new Error('dsn-set-real'));
    expect(fakeSdk.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://test@o4508855274176512.ingest.sentry.io/123',
      }),
    );
    expect(fakeSdk.captureException).toHaveBeenCalled();
    // Console fallback always runs, SDK or not.
    expect(spy).toHaveBeenCalledWith('[Sentry]', 'dsn-set-real', '');
  });
});
