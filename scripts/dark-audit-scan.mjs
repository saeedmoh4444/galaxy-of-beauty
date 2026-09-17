/**
 * Dark-mode audit scanner (ENHANCEMENT_PLAN 5.3).
 *
 * Finds className attributes containing light-only hardcoded colors
 * (bg-/text- white|black|gray|amber|green|red|pink|blue|yellow|purple)
 * with NO dark: variant on the same className. Run:
 *   node scripts/dark-audit-scan.mjs
 */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT = 'apps/web/src';
const LIGHT_ONLY =
  /(?:bg|text)-(?:white|black|gray-\d00|gray-\d50|amber-\d00|amber-\d50|green-\d00|green-\d50|red-\d00|red-\d50|pink-\d00|pink-\d50|blue-\d00|blue-\d50|yellow-\d00|yellow-\d50|purple-\d00|purple-\d50)/;
// Intentional in both themes — the sweeps never touch these:
//   text-white/bg-black (on solid brand/colored surfaces + overlays),
//   saturated solid bgs (progress bars, badges, buttons),
//   text-*-400 (mid-tone, readable on light AND dark).
const INTENTIONAL =
  /\b(?:text-white|bg-black|bg-(?:red|green|amber|blue|pink|purple|yellow)-[456]\d\d?|text-(?:red|green|amber|blue|pink|purple|yellow)-400)/;

const hits = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      const lines = readFileSync(p, 'utf8').split('\n');
      lines.forEach((line, i) => {
        const m = line.match(/className=(?:"[^"]+"|`[^`]+`)/g) ?? [];
        for (const cls of m) {
          if (!/dark:/.test(cls) && LIGHT_ONLY.test(cls) && !INTENTIONAL.test(cls)) {
            hits.push(`${p} :${i + 1}  ${cls.slice(0, 120)}`);
          }
        }
      });
    }
  }
}

walk(ROOT);
console.log(`light-only hardcoded colors (no dark: variant): ${hits.length}`);
for (const h of hits) console.log(' ', h);
