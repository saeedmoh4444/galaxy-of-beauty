/**
 * B2 — ambient request context: correlation ids readable anywhere in a
 * procedure/job chain without signature threading.
 */
import { describe, it, expect } from 'vitest';
import { requestContext, getCorrelationId } from '../lib/requestContext';

describe('requestContext', () => {
  it('is null outside any run', () => {
    expect(getCorrelationId()).toBeNull();
  });

  it('exposes the value inside run, including across awaits', async () => {
    await requestContext.run({ correlationId: 'cid-1' }, async () => {
      await Promise.resolve();
      expect(getCorrelationId()).toBe('cid-1');
    });
    expect(getCorrelationId()).toBeNull();
  });

  it('restores the outer store after a nested run', async () => {
    await requestContext.run({ correlationId: 'outer' }, async () => {
      await requestContext.run({ correlationId: 'inner' }, async () => {
        expect(getCorrelationId()).toBe('inner');
      });
      expect(getCorrelationId()).toBe('outer');
    });
    expect(getCorrelationId()).toBeNull();
  });
});
