/**
 * ENHANCEMENT_PLAN 5.3 — dark-mode email templates.
 *
 * Drives: emailShell() — every outbound template declares light/dark
 * color-scheme support and swaps hardcoded light surfaces under
 * prefers-color-scheme: dark.
 */
import { describe, expect, it } from 'vitest';
import { emailShell } from '../lib/email';

describe('emailShell (dark-mode email templates)', () => {
  it('declares color-scheme support for dark email clients', () => {
    const html = emailShell('<p>hi</p>');
    expect(html).toContain('<meta name="color-scheme" content="light dark" />');
    expect(html).toContain(':root { color-scheme: light dark; }');
  });

  it('sets direction and language from the dir argument', () => {
    const ar = emailShell('<p>مرحبا</p>');
    expect(ar).toContain('dir="rtl"');
    expect(ar).toContain('lang="ar"');

    const en = emailShell('<p>hi</p>', 'ltr');
    expect(en).toContain('dir="ltr"');
    expect(en).toContain('lang="en"');
  });

  it('embeds the inner body unchanged', () => {
    const html = emailShell('<p id="x">body</p>');
    expect(html).toContain('<p id="x">body</p>');
  });

  it('carries dark-mode surface overrides (shell, card, text, divider)', () => {
    const html = emailShell('<div class="gob-card"></div>');
    expect(html).toContain('@media (prefers-color-scheme: dark)');
    expect(html).toContain('.gob-shell { background: #1f1235; }');
    expect(html).toContain('.gob-card { background: #2d1b4e; }');
    expect(html).toContain('.gob-text-strong { color: #f5f3ff; }');
  });
});
