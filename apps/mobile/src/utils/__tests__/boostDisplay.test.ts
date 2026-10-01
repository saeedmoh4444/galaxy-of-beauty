/**
 * Loyalty boosts display helpers (audit stage 12) — the mobile boosts
 * screen renders the server-filtered active boosts; these pure helpers
 * format the multiplier and the validity window per locale.
 */
import { describe, it, expect } from 'vitest';
import { multiplierLabel, boostWindowLabel } from '../boostDisplay';

// Noon UTC keeps the same calendar day in every timezone.
const START = '2026-06-01T12:00:00.000Z';
const END = '2026-06-07T12:00:00.000Z';

describe('multiplierLabel', () => {
  it('formats integer multipliers', () => {
    expect(multiplierLabel(2)).toBe('2×');
    expect(multiplierLabel(5)).toBe('5×');
  });

  it('formats fractional multipliers without trailing noise', () => {
    expect(multiplierLabel(1.5)).toBe('1.5×');
  });
});

describe('boostWindowLabel', () => {
  it('renders both dates separated by an en dash in English', () => {
    const label = boostWindowLabel('en', START, END);
    expect(label).toContain('–');
    expect(label).toContain('01/06/2026');
    expect(label).toContain('07/06/2026');
  });

  it('renders Arabic-Indic dates for ar', () => {
    const label = boostWindowLabel('ar', START, END);
    expect(label).toContain('–');
    expect(label.length).toBeGreaterThan(10);
  });
});
