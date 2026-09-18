/**
 * Beauty DNA profile (ENHANCEMENT_PLAN 3.1) — shared option catalogs and
 * the form-state → beautyProfile.upsert input builder, used by both the
 * web editor and the mobile Beauty DNA editor so the two stay in sync.
 */

export const BEAUTY_PROFILE_OPTIONS = {
  skinTypes: ['oily', 'dry', 'combination', 'sensitive', 'normal'] as const,
  hairTypes: ['straight', 'wavy', 'curly', 'coily'] as const,
  hairLengths: ['short', 'medium', 'long'] as const,
  skinTones: ['fair', 'medium', 'olive', 'tan', 'deep'] as const,
  makeupStyles: ['natural', 'glam', 'soft', 'bold'] as const,
  concerns: ['acne', 'aging', 'dark_spots', 'redness', 'dryness', 'large_pores', 'uneven_texture'],
  scents: ['floral', 'citrus', 'woody', 'fresh', 'sweet', 'oriental'],
} as const;

export interface BeautyProfileFormState {
  skinType: string;
  hairType: string;
  hairLength: string;
  skinTone: string;
  makeupStyle: string;
  concerns: string[];
  scents: string[];
  notes: string;
  heightCm: string;
  weightKg: string;
  waistCm: string;
  fitnessGoals: string[];
}

export interface BeautyProfileUpsertInput {
  skinType?: (typeof BEAUTY_PROFILE_OPTIONS.skinTypes)[number];
  hairType?: (typeof BEAUTY_PROFILE_OPTIONS.hairTypes)[number];
  hairLength?: (typeof BEAUTY_PROFILE_OPTIONS.hairLengths)[number];
  skinTone?: (typeof BEAUTY_PROFILE_OPTIONS.skinTones)[number];
  makeupStyle?: (typeof BEAUTY_PROFILE_OPTIONS.makeupStyles)[number];
  concerns?: string[];
  preferredScents?: string[];
  notes?: string;
  measurements?: {
    heightCm?: number;
    weightKg?: number;
    waistCm?: number;
  };
  fitnessGoals?: string[];
}

function toPositiveNumber(raw: string): number | undefined {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Trim blank entries out of multi-select arrays. */
function cleanList(values: string[]): string[] {
  return values.map((v) => v.trim()).filter((v) => v.length > 0);
}

/**
 * Map raw form state (strings for measurements, empty strings for
 * untouched selects) onto the beautyProfile.upsert input — omitting
 * everything the user left empty so partial saves never wipe fields.
 */
export function buildBeautyProfileInput(form: BeautyProfileFormState): BeautyProfileUpsertInput {
  const input: BeautyProfileUpsertInput = {
    measurements: {
      heightCm: toPositiveNumber(form.heightCm),
      weightKg: toPositiveNumber(form.weightKg),
      waistCm: toPositiveNumber(form.waistCm),
    },
  };

  if (form.skinType) input.skinType = form.skinType as BeautyProfileUpsertInput['skinType'];
  if (form.hairType) input.hairType = form.hairType as BeautyProfileUpsertInput['hairType'];
  if (form.hairLength) {
    input.hairLength = form.hairLength as BeautyProfileUpsertInput['hairLength'];
  }
  if (form.skinTone) input.skinTone = form.skinTone as BeautyProfileUpsertInput['skinTone'];
  if (form.makeupStyle) {
    input.makeupStyle = form.makeupStyle as BeautyProfileUpsertInput['makeupStyle'];
  }

  const concerns = cleanList(form.concerns);
  if (concerns.length > 0) input.concerns = concerns;

  const scents = cleanList(form.scents);
  if (scents.length > 0) input.preferredScents = scents;

  const notes = form.notes.trim();
  if (notes.length > 0) input.notes = notes;

  const goals = cleanList(form.fitnessGoals);
  if (goals.length > 0) input.fitnessGoals = goals;

  return input;
}
