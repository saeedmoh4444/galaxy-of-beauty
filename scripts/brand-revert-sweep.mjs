// Brand revert sweep: Dalal → Galaxy of Beauty (en) / جالكسي بيوتي (ar).
// 2026-09-17 — user decision: "my brand name is: galaxy of beauty".
// Skips FakeNameGenerator (دلال there is a legitimate Arabic personal name).
// Special-cases the AI advisor welcome (persona phrasing, not brand name).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const roots = [
  'apps/web/src',
  'packages/shared/src',
  'apps/mobile/src',
  'packages/ui/src',
  'packages/api/src',
];
const extraFiles = [];

const files = new Set();
for (const dir of roots) {
  for (const f of execFileSync('git', ['ls-files', '--', dir], { encoding: 'utf8' }).split('\n')) {
    if (/\.(tsx|ts)$/.test(f)) files.add(f);
  }
}
extraFiles.forEach((f) => files.add(f));

const SPECIAL_AI_WELCOME =
  'Hello! I am Dalal, your personal beauty advisor. Ask me anything about skincare, makeup, hair, or any beauty tip!';
const SPECIAL_AI_WELCOME_NEW =
  'Hello! I am your personal beauty advisor at Galaxy of Beauty. Ask me anything about skincare, makeup, hair, or any beauty tip!';

const SKIP = ['packages/ui/src/components/FakeNameGenerator.tsx'];

let changed = 0;
let skipped = 0;
for (const file of files) {
  if (SKIP.includes(file)) {
    skipped++;
    continue;
  }
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  if (!/دلال|Dalal/.test(text)) continue;
  const before = text;
  // AI persona welcome — special phrasing (persona, not brand tile)
  text = text.replaceAll(SPECIAL_AI_WELCOME, SPECIAL_AI_WELCOME_NEW);
  // generic brand replacements
  text = text.replaceAll('Dalal', 'Galaxy of Beauty');
  text = text.replaceAll('دلال', 'جالكسي بيوتي');
  if (text !== before) {
    writeFileSync(file, text);
    changed++;
  }
}
console.log(`swept: ${changed} files changed, ${skipped} skipped (FakeNameGenerator)`);
