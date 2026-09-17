// Scans web/ui sources for STRAY U+200D (ZWJ) / U+FE0F (VS16) chars:
// - FE0F not preceded by a non-ASCII char (lone variation selector)
// - ZWJ not flanked by two non-ASCII chars (broken emoji sequence)
// Valid emoji like 🛍️ (FE0F after base) or 👩‍👧 (ZWJ between glyphs) pass.
// Usage: node scripts/zwj-stray-scan.mjs [root]
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const roots = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['apps/web/src', 'packages/ui/src'];

const list = (dir) =>
  execFileSync('git', ['ls-files', '--', dir], { encoding: 'utf8' })
    .split('\n')
    .filter((f) => /\.(tsx|ts|jsx|js)$/.test(f));

const isAscii = (ch) => ch.codePointAt(0) <= 0x7f;

let hits = 0;
for (const dir of roots) {
  for (const file of list(dir)) {
    let text;
    try {
      text = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      for (let k = 0; k < line.length; k++) {
        const cp = line.codePointAt(k);
        if (cp !== 0x200d && cp !== 0xfe0f) continue;
        const prev = k > 0 ? line[k - 1] : '';
        const next = k + 1 < line.length ? line[k + 1] : '';
        let stray = false;
        // FE0F valid: after a non-ASCII base, OR in a keycap sequence (followed by U+20E3)
        if (cp === 0xfe0f) {
          const after = line.codePointAt(k + 1);
          stray = isAscii(prev) && after !== 0x20e3;
        }
        if (cp === 0x200d && !(prev && next && !isAscii(prev) && !isAscii(next))) stray = true;
        if (stray) {
          // context with visible markers
          const ctx = `${line.slice(Math.max(0, k - 24), k)}«${line[k]}»${line.slice(k + 1, k + 25)}`;
          console.log(`${file}:${i + 1}: ${ctx.replace(/\t/g, '\\t')}`);
          hits++;
        }
      }
    });
  }
}
console.log(`--- stray hits: ${hits} ---`);
