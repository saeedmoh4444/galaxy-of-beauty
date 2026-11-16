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
    expect(vendorPortalGate(false, false, false, false)).toBe('login');
  });

  it('holds while the auth token is still restoring', () => {
    expect(vendorPortalGate(true, true, false, false)).toBe('hold');
    expect(vendorPortalGate(false, true, false, false)).toBe('hold');
  });

  it('holds (allow) while the store check is still loading', () => {
    expect(vendorPortalGate(true, false, true, false)).toBe('hold');
  });

  it('redirects authenticated non-vendors to home', () => {
    expect(vendorPortalGate(true, false, false, true)).toBe('home');
  });

  it('allows authenticated vendors', () => {
    expect(vendorPortalGate(true, false, false, false)).toBe('allow');
  });

  it('never sends a guest to home or allows them', () => {
    expect(vendorPortalGate(false, false, true, true)).toBe('login');
    expect(vendorPortalGate(false, false, false, true)).toBe('login');
  });
});
