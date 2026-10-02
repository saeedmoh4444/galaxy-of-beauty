import { describe, expect, it } from 'vitest';

import { getSaudiSeason } from './saudiCalendar';

// NOON-UTC anchors: the calendar day is stable in every timezone.
const noon = (iso: string) => new Date(`${iso}T12:00:00Z`);

describe('getSaudiSeason — Hajj season (derived from the Eid al-Adha table)', () => {
  it('is true from Arafah (adha-2) through the final tawaf days (adha+3), 2026', () => {
    expect(getSaudiSeason(noon('2026-05-25')).isHajj).toBe(true); // 8th Dhul-Hijjah
    expect(getSaudiSeason(noon('2026-05-27')).isHajj).toBe(true); // Eid al-Adha
    expect(getSaudiSeason(noon('2026-05-30')).isHajj).toBe(true); // 13th
    expect(getSaudiSeason(noon('2026-05-24')).isHajj).toBe(false);
    expect(getSaudiSeason(noon('2026-05-31')).isHajj).toBe(false);
  });

  it('tracks the 2027 and 2028 table rows', () => {
    expect(getSaudiSeason(noon('2027-05-16')).isHajj).toBe(true);
    expect(getSaudiSeason(noon('2028-05-05')).isHajj).toBe(true);
    expect(getSaudiSeason(noon('2028-04-28')).isHajj).toBe(false);
  });

  it('is false on ordinary days', () => {
    expect(getSaudiSeason(noon('2026-07-01')).isHajj).toBe(false);
  });
});

describe('getSaudiSeason — National Day (fixed Sept 23)', () => {
  it('is true only on Sept 23 of any year', () => {
    expect(getSaudiSeason(noon('2026-09-23')).isNationalDay).toBe(true);
    expect(getSaudiSeason(noon('2028-09-23')).isNationalDay).toBe(true);
    expect(getSaudiSeason(noon('2026-09-22')).isNationalDay).toBe(false);
    expect(getSaudiSeason(noon('2026-09-24')).isNationalDay).toBe(false);
    expect(getSaudiSeason(noon('2026-10-23')).isNationalDay).toBe(false);
  });
});

describe('getSaudiSeason — existing occasions still behave', () => {
  it('keeps Ramadan and Eid al-Adha detection intact', () => {
    expect(getSaudiSeason(noon('2026-02-18')).isRamadan).toBe(true);
    expect(getSaudiSeason(noon('2026-05-27')).isEidAlAdha).toBe(true);
    expect(getSaudiSeason(noon('2026-06-01')).isEidAlAdha).toBe(false);
  });
});
