/**
 * A2 — static moderation triage (PLATFORM_IMPROVEMENT_PLAN).
 *
 * A conservative, substring-based blocklist applied to UGC text at
 * report time: when reported content matches, the report is actioned
 * automatically (target hidden, `autoAction: true`) instead of waiting
 * for a human — but the row still lands in the admin queue's history.
 *
 * Deliberately minimal: these are terms where a false positive is far
 * cheaper than a false negative (hard spam/scam/illegal-service bait).
 * Expanded with product input in A2c, where an optional AI classifier
 * sits behind a feature flag.
 */
const TERMS: readonly string[] = [
  // English
  'casino',
  'betting site',
  'free money',
  'get rich quick',
  'scam',
  // Arabic (as commonly typed, no diacritics)
  'كازينو',
  'قمار',
  'مراهنات',
  'مراهنة',
  'ربح سريع',
  'احتيال',
  'نصب',
];

const NORMALIZED = TERMS.map((t) => t.toLowerCase().replace(/\s+/g, ' '));

/**
 * True when the text contains any blocklisted term. Case-insensitive;
 * whitespace is collapsed so multi-word terms match regardless of
 * internal spacing. Diacritics are NOT normalized — the list entries
 * are written the way users actually type.
 */
export function matchesBlocklist(text: string | null | undefined): boolean {
  if (!text) return false;
  const hay = text.toLowerCase().replace(/\s+/g, ' ');
  return NORMALIZED.some((term) => hay.includes(term));
}
