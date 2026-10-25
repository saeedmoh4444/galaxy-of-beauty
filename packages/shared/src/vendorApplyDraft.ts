/**
 * G1 — vendor onboarding wizard persistence (Wave 6).
 *
 * Pure helpers for the localStorage draft of the /vendor-portal apply
 * wizard: a versioned draft envelope, tolerant parsing, and the
 * step-completeness meter (name + required documents per venue type)
 * that the resume banner surfaces. UI code (VendorPortal) calls these;
 * localStorage stays a UI concern.
 */

export const DRAFT_KEY = 'gob:vendor-apply-draft';

export interface VendorApplyDraft {
  applyType: string; // 'store' | 'clinic' | 'gym' | 'nail_bar' | 'athome'
  applyName: string;
  applyBio: string;
  applyLogo: string;
  applyLicense: string;
  applyAgency: string;
  applyClinicType: string;
  applyGymType: string;
  applyGymCity: string;
  applyGymAddress: string;
  applyNailBarType: string;
  applyNailBarCity: string;
  applyNailBarAddress: string;
  docCr: string;
  docNationalId: string;
  docBankLetter: string;
  docMedicalLicense: string;
  docGymLicense: string;
}

const DRAFT_VERSION = 1;

export function buildVendorApplyDraft(fields: Record<string, unknown>): string {
  return JSON.stringify({ v: DRAFT_VERSION, fields });
}

export function parseVendorApplyDraft(
  raw: string | null | undefined,
): Partial<VendorApplyDraft> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { v?: unknown; fields?: unknown };
    if (parsed.v !== DRAFT_VERSION || typeof parsed.fields !== 'object' || parsed.fields === null) {
      return null;
    }
    return parsed.fields as Partial<VendorApplyDraft>;
  } catch {
    return null;
  }
}

/** Fields each venue type requires to submit (name is always first). */
const REQUIRED_DOCS: Record<string, Array<keyof VendorApplyDraft>> = {
  store: ['docCr', 'docNationalId', 'docBankLetter'],
  clinic: ['docMedicalLicense', 'docCr', 'docNationalId'],
  gym: ['docGymLicense', 'docCr', 'docNationalId'],
  nail_bar: ['docGymLicense', 'docCr', 'docNationalId'],
  athome: ['docGymLicense', 'docCr', 'docNationalId'],
};

/**
 * 0–100 completeness: name (25) + each required document (75 / n).
 * Non-document fields (bio, logo, license number) don't block submission
 * and don't count — the meter reflects what the submit button enforces.
 */
export function vendorApplyCompleteness(draft: Partial<VendorApplyDraft>): number {
  const required = REQUIRED_DOCS[draft.applyType ?? 'store'] ?? REQUIRED_DOCS['store']!;
  let score = draft.applyName && draft.applyName.trim() !== '' ? 25 : 0;
  const docWeight = 75 / required.length;
  for (const key of required) {
    if (draft[key] && String(draft[key]).trim() !== '') score += docWeight;
  }
  return Math.round(score);
}
