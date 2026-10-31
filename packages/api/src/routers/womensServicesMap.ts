// E-womens (audit 2026-10-30, wave E) — the 289-item static women's
// catalog was a marketing facade whose `book` always returned
// NOT_CREATED. This module maps every facade item onto a real seeded
// `Service` row so womensServices.book can create a real booking.
//
// Resolution order:
//   1. whole-category override (every item in the category belongs to
//      one real service),
//   2. ordered keyword rules (first match wins),
//   3. 'Beauty Consultation' fallback (seeded E1 row) — sessions,
//      packages and consultations without a dedicated service.
//
// The requested facade item always travels in the booking notes, so the
// technician sees exactly what the customer asked for.

export const WOMENS_CATEGORY_OVERRIDES: Record<string, string> = {
  henna: 'Henna Art',
  hijab_care: 'Under-Hijab Scalp Treatment',
  mature_skin: 'Anti-Aging Facial',
  luxury_spa: 'Full Spa Day',
  body_contouring: 'Lymphatic Drainage',
  intimate_care: 'Full Body Scrub',
  post_surgery: 'Lymphatic Drainage',
  bridal_prep: 'Bridal Trial Package',
  bridal_party: 'Bridal Party Package',
  mother_of_bride: 'Bridal Trial Package',
  grandmother_bride: 'Bridal Trial Package',
  new_bride: 'Bridal Trial Package',
};

// Ordered — first match wins. Targets are exact `titleJson.en` values of
// seeded services (pre-existing rows or the E1 catalog-gap rows).
// `inCategory` (optional) scopes a rule to a facade category.
const KEYWORD_RULES: ReadonlyArray<{ re: RegExp; target: string; inCategory?: RegExp }> = [
  // --- specialized treatments first ---
  { re: /henna/i, target: 'Henna Art' },
  { re: /hijab/i, target: 'Under-Hijab Scalp Treatment' },
  { re: /keratin|protein/i, target: 'Keratin Treatment' },
  { re: /extensions/i, target: 'Hair Extensions' },
  { re: /laser/i, target: 'Laser Hair Removal Session' },
  { re: /sugar/i, target: 'Sugaring' },
  { re: /hydrafacial/i, target: 'HydraFacial' },
  { re: /chemical peel/i, target: 'Chemical Peel' },
  { re: /acne/i, target: 'Acne Treatment' },
  { re: /anti.?aging|wrinkle|collagen|dryness/i, target: 'Anti-Aging Facial' },
  { re: /brighten|glow/i, target: 'Brightening Facial' },
  { re: /stretch mark|scar/i, target: 'Full Body Scrub' },
  { re: /pregnan.*massage|prenatal/i, target: 'Prenatal Massage' },
  // --- bridal / event ---
  { re: /wedding|bridal|bride|bridesmaid/i, target: 'Bridal Trial Package' },
  { re: /eid/i, target: 'Evening Makeup' },
  // --- nails & feet ---
  { re: /pedicure|foot care|foot reflexology/i, target: 'Classic Pedicure' },
  { re: /nail art/i, target: 'Nail Art' },
  { re: /manicure/i, target: 'Manicure' },
  { re: /hand care|hand &|hands/i, target: 'Manicure' },
  // --- brows & lashes ---
  { re: /microblading/i, target: 'Microblading Eyebrows' },
  { re: /brow.*tinting|tinting/i, target: 'Brow Tinting' },
  { re: /brow.*lamin|lamination/i, target: 'Brow Lamination' },
  { re: /brow/i, target: 'Brow Shaping' },
  { re: /lash refill/i, target: 'Lash Refill' },
  { re: /lash lift/i, target: 'Lash Lift & Tint' },
  { re: /lash extension|lash/i, target: 'Classic Lash Extensions' },
  // --- hair ---
  { re: /hair loss|scalp/i, target: 'Scalp Treatment' },
  { re: /conditioning|hair mask|oil treatment/i, target: 'Deep Conditioning Treatment' },
  { re: /hair dye|hair color|plant.?based/i, target: 'Hair Color' },
  { re: /styling|hairstyle|blow.?dry|haircut|style transform/i, target: 'Hairstyling' },
  { re: /hair care|marine hair|volumiz/i, target: 'Deep Conditioning Treatment' },
  // --- face & skin ---
  {
    re: /facial|skincare|skin care|complexion|hydrat|mask|exfoliat|cleansing|dark circle|eye care/i,
    target: 'Facial Cleansing',
  },
  { re: /refresh/i, target: 'Express Facial' },
  // --- body & wellness ---
  { re: /wax|hair removal|thread/i, target: 'Waxing' },
  { re: /lymphatic/i, target: 'Lymphatic Drainage' },
  { re: /scrub/i, target: 'Full Body Scrub' },
  { re: /meditation|breathwork/i, target: 'Meditation Session' },
  { re: /spa day|half.?day|spa$/i, target: 'Full Spa Day' },
  { re: /bath|steam|moroccan/i, target: 'Moroccan Bath' },
  { re: /essential oil|therapy/i, target: 'Aromatherapy Massage' },
  { re: /massage|recovery/i, target: 'Postpartum Recovery Massage', inCategory: /^postpartum$/ },
  {
    re: /massage|relax|recovery|back|neck|shoulder|muscle|tension|reflexology|compress|cramp|relief|pamper/i,
    target: 'Relaxation Massage',
  },
  { re: /nutrition|diet/i, target: 'Nutrition Consultation' },
  // --- sessions, packages, consultations ---
  { re: /makeup|look|glam|ready|stage|shoot|premiere/i, target: 'Evening Makeup' },
];

export const WOMENS_FALLBACK_SERVICE = 'Beauty Consultation';

/**
 * Resolves a facade item to the `titleJson.en` of the real seeded
 * service that should carry its bookings. Never returns null — unmapped
 * items fall back to the consultation service.
 */
export function resolveWomensService(itemNameEn: string, categoryKey: string): string {
  const override = WOMENS_CATEGORY_OVERRIDES[categoryKey];
  if (override) return override;

  for (const rule of KEYWORD_RULES) {
    if (rule.inCategory && !rule.inCategory.test(categoryKey)) continue;
    if (rule.re.test(itemNameEn)) return rule.target;
  }
  return WOMENS_FALLBACK_SERVICE;
}
