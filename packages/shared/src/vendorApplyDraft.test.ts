/**
 * G1 — vendor onboarding wizard persistence (VENDOR_DASHBOARD_ENHANCEMENT_PLAN
 * Wave 6). Pure helpers for the localStorage draft: build/parse and the
 * step-completeness meter the resume banner shows.
 */
import { describe, it, expect } from 'vitest';
import {
  DRAFT_KEY,
  buildVendorApplyDraft,
  parseVendorApplyDraft,
  vendorApplyCompleteness,
} from './vendorApplyDraft';

const FULL_STORE = {
  applyType: 'store',
  applyName: 'متجري',
  applyBio: 'نبذة',
  applyLogo: '',
  applyLicense: '12345',
  applyAgency: 'MISA',
  docCr: 'cr-url',
  docNationalId: 'nid-url',
  docBankLetter: 'bank-url',
} as const;

describe('G1 — vendor apply draft helpers', () => {
  it('builds and parses a draft round-trip', () => {
    const json = buildVendorApplyDraft(FULL_STORE as never);
    const parsed = parseVendorApplyDraft(json);
    expect(parsed).toEqual(FULL_STORE);
  });

  it('returns null for a corrupt or wrong-version draft', () => {
    expect(parseVendorApplyDraft('not json')).toBeNull();
    expect(parseVendorApplyDraft('{"v":999}')).toBeNull();
    expect(parseVendorApplyDraft(null as never)).toBeNull();
  });

  it('scores completeness: store needs name + 3 docs for 100', () => {
    expect(vendorApplyCompleteness(FULL_STORE as never)).toBe(100);
    const missingDoc = { ...FULL_STORE, docBankLetter: '' };
    expect(vendorApplyCompleteness(missingDoc as never)).toBeLessThan(100);
    const empty = {
      ...FULL_STORE,
      applyName: '',
      docCr: '',
      docNationalId: '',
      docBankLetter: '',
    };
    expect(vendorApplyCompleteness(empty as never)).toBe(0);
  });

  it('exposes the stable localStorage key', () => {
    expect(DRAFT_KEY).toMatch(/^gob:/);
  });
});
