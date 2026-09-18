import { describe, it, expect } from 'vitest';
import { formatHijriDate } from '@galaxy/shared';

const SAMPLE = new Date('2026-09-18T10:00:00Z');

describe('formatHijriDate', () => {
  it('renders the Umm al-Qura date in Arabic with Arabic-Indic digits', () => {
    const out = formatHijriDate(SAMPLE, 'ar');
    expect(out).toBeTruthy();
    // Arabic-Indic digit block (٠-٩) — the Islamic year is numeric.
    expect(out).toMatch(/[٠-٩]/);
    expect(out).not.toContain('2026'); // never the Gregorian year
  });

  it('renders an English form ending in the Hijri era marker', () => {
    const out = formatHijriDate(SAMPLE, 'en');
    expect(out).toBeTruthy();
    expect(out).toMatch(/AH$/);
  });

  it('renders via the fallback islamic calendar when requested (umalqura-less runtimes)', () => {
    const out = formatHijriDate(SAMPLE, 'en', 'islamic');
    expect(out).toBeTruthy();
    expect(out).toMatch(/AH$/);
  });
});
