import { describe, it, expect } from 'vitest';
import { isPersistedQueryKey } from '../persistConfig';

// tRPC v11 query keys are [ [router, procedure], { input } ].
describe('isPersistedQueryKey', () => {
  it('persists public catalog reads', () => {
    expect(isPersistedQueryKey([['services', 'list'], { input: { limit: 10 } }])).toBe(true);
    expect(isPersistedQueryKey([['categories', 'list'], { input: {} }])).toBe(true);
    expect(isPersistedQueryKey([['giftCardMarket', 'list'], {}])).toBe(true);
    expect(isPersistedQueryKey([['beautyDiscovery', 'feed'], {}])).toBe(true);
    expect(isPersistedQueryKey([['flashDeals', 'list'], {}])).toBe(true);
    expect(isPersistedQueryKey([['clinics', 'list'], {}])).toBe(true);
  });

  it('never persists user-scoped or mutation data', () => {
    expect(isPersistedQueryKey([['bookings', 'list'], { input: { page: 1 } }])).toBe(false);
    expect(isPersistedQueryKey([['loyalty', 'myAccount'], {}])).toBe(false);
    expect(isPersistedQueryKey([['wallet', 'getBalance'], {}])).toBe(false);
    expect(isPersistedQueryKey([['auth', 'me'], {}])).toBe(false);
  });

  it('rejects malformed keys', () => {
    expect(isPersistedQueryKey(undefined)).toBe(false);
    expect(isPersistedQueryKey(null)).toBe(false);
    expect(isPersistedQueryKey([])).toBe(false);
    expect(isPersistedQueryKey(['services'])).toBe(false);
    expect(isPersistedQueryKey({})).toBe(false);
  });
});
