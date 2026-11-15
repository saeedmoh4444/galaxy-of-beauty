/**
 * W3-3 — the mobile vendor-portal had NO guard: any deep link renders
 * vendor chrome (empty states for non-vendors, since the API rejects
 * their queries). The group layout now gates every screen:
 *   guests → login · non-vendors (myStore NOT_FOUND) → home · vendors → allow
 *
 * The decision is a pure function so the contract is pinned by unit tests
 * (mobile pure-logic suite, node env).
 */
import { describe, expect, it } from 'vitest';
import { vendorPortalGate } from '../vendorPortalGate';

describe('vendorPortalGate (W3-3)', () => {
  it('redirects guests to login', () => {
    expect(vendorPortalGate(false, false, false)).toBe('login');
  });

  it('holds (allow) while the store check is still loading', () => {
    expect(vendorPortalGate(true, true, false)).toBe('allow');
  });

  it('redirects authenticated non-vendors to home', () => {
    expect(vendorPortalGate(true, false, true)).toBe('home');
  });

  it('allows authenticated vendors', () => {
    expect(vendorPortalGate(true, false, false)).toBe('allow');
  });

  it('never sends a guest to home or allows them', () => {
    expect(vendorPortalGate(false, true, true)).toBe('login');
    expect(vendorPortalGate(false, false, true)).toBe('login');
  });
});
