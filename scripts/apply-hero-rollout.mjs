/**
 * Hero rollout — mechanical transform for category landing clients.
 * Wraps each page's plain header with the shared HeroSection and
 * converts the page container into a nested wrapper (hero full-bleed,
 * content constrained). Structure errors (if any) are caught by tsc.
 *
 * Usage: node scripts/apply-hero-rollout.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';

const DRY = process.argv.includes('--dry-run');

const PAGES = [
  {
    file: 'apps/web/src/app/(public)/clinics/ClinicsClient.tsx',
    titleKey: 'clinics.title',
    subtitleKey: 'clinics.subtitle',
    gradient: 'from-brand-50 via-surface to-brand-50',
    eyebrow: '🏥',
  },
  {
    file: 'apps/web/src/app/(public)/gyms/GymsClient.tsx',
    titleKey: 'gyms.title',
    subtitleKey: 'gyms.subtitle',
    gradient: 'from-accent-50 via-surface to-brand-50',
    eyebrow: '💪',
  },
  {
    file: 'apps/web/src/app/(public)/nail-bars/NailBarsClient.tsx',
    titleKey: 'nailBars.title',
    subtitleKey: 'nailBars.subtitle',
    gradient: 'from-brand-50 via-surface to-accent-50',
    eyebrow: '💅',
  },
  {
    file: 'apps/web/src/app/(public)/stores/StoresClient.tsx',
    titleKey: 'stores.title',
    subtitleKey: 'stores.subtitle',
    gradient: 'from-accent-50 via-surface to-brand-50',
    eyebrow: '🛍️',
  },
  {
    file: 'apps/web/src/app/(public)/trainers/TrainersClient.tsx',
    titleKey: 'trainers.title',
    subtitleKey: 'trainers.subtitle',
    gradient: 'from-brand-50 via-surface to-accent-50',
    eyebrow: '🏋️‍♀️',
  },
];

for (const page of PAGES) {
  const original = readFileSync(page.file, 'utf8');
  let content = original;

  // 1. Add HeroSection to the @galaxy/ui import.
  content = content.replace(
    /(import \{[^}]*) } from '@galaxy\/ui';/,
    "$1, HeroSection } from '@galaxy/ui';",
  );

  // 2. Replace the header block with HeroSection + nested container.
  const header = new RegExp(
    `<div className="mx-auto max-w-5xl space-y-6 px-4 py-8">\\s*<div>\\s*<h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">\\s*\\{t\\('${page.titleKey}'\\)\\}\\s*</h1>\\s*<p className="mt-1 text-sm text-text-secondary">\\{t\\('${page.subtitleKey}'\\)\\}</p>\\s*</div>`,
  );
  const hero = `<div>
      <HeroSection
        eyebrow="${page.eyebrow}"
        title={t('${page.titleKey}')}
        subtitle={t('${page.subtitleKey}')}
        gradient="${page.gradient}"
        className="mb-2"
      />
      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-8">`;
  if (!header.test(content)) {
    console.log(`SKIP ${page.file} — header pattern not found`);
    continue;
  }
  content = content.replace(header, hero);

  // 3. Close the new outer wrapper: find the return's final
  //    "    </div>\n  );\n}" and add one more </div>.
  //    Target: the LAST occurrence of the 4-space-indented close before
  //    the 2-space-indented ");" that ends the main return.
  const closes = [...content.matchAll(/^    <\/div>\r?\n  \);\r?\n\}$/gm)];
  if (closes.length === 0) {
    console.log(`SKIP ${page.file} — closing pattern not found`);
    continue;
  }
  const last = closes[closes.length - 1];
  content =
    content.slice(0, last.index) +
    `      </div>\n    </div>\n  );\n}` +
    content.slice(last.index + last[0].length);

  if (!DRY) writeFileSync(page.file, content, 'utf8');
  console.log(`OK ${page.file}`);
}
