/**
 * W4-9 — three customer screens hardcoded DEFAULT_SAUDI_CITY with TODOs.
 * The honest default is the customer's REAL primary address (their saved
 * city), falling back to Riyadh only when they have none.
 */
import { describe, expect, it } from 'vitest';
import { pickPrimaryCity, pickPrimaryAddress, DEFAULT_CITY } from '../primaryLocation';

const riyadh = { city: 'الرياض', label: 'المنزل' };
const jeddah = { city: 'جدة', label: 'العمل' };

describe('pickPrimaryCity / pickPrimaryAddress (W4-9)', () => {
  it('returns the first address city when the customer has one', () => {
    expect(pickPrimaryCity([riyadh, jeddah])).toBe('الرياض');
  });

  it('falls back to the default city when there are no addresses', () => {
    expect(pickPrimaryCity([])).toBe(DEFAULT_CITY);
    expect(pickPrimaryCity(null)).toBe(DEFAULT_CITY);
    expect(pickPrimaryCity(undefined)).toBe(DEFAULT_CITY);
  });

  it('ignores blank cities', () => {
    expect(pickPrimaryCity([{ city: '  ', label: 'x' }])).toBe(DEFAULT_CITY);
  });

  it('composes an address line from city + label', () => {
    expect(pickPrimaryAddress([riyadh])).toBe('الرياض — المنزل');
  });

  it('falls back to the default when no address exists', () => {
    expect(pickPrimaryAddress([])).toBe(DEFAULT_CITY);
  });
});
