// W6-1 one-shot sweep helper: converts a client page.tsx into a
// server-wrapper page.tsx + <Name>Client.tsx with locale-aware metadata.
// Run: node scripts/w6-seo-wrap.mjs <dir> <ClientName> <page> <titleKey> <subtitleKey> <path>
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const [, , dir, clientName, pageName, titleKey, subtitleKey, routePath] = process.argv;
const page = join(dir, 'page.tsx');
const client = join(dir, `${clientName}.tsx`);

if (!existsSync(page)) throw new Error(`no page.tsx in ${dir}`);

let src = readFileSync(page, 'utf8');
if (!/^['"]use client['"]/.test(src)) throw new Error(`${page} is not a client page`);
const re = new RegExp(`export default function ${pageName}\\b`);
if (!re.test(src)) throw new Error(`${page}: default export ${pageName} not found`);

src = src.replace(re, `export function ${clientName}`);

renameSync(page, client);
writeFileSync(client, src);

const wrapper = `import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { ${clientName} } from './${clientName}';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('${titleKey}', 'ar'),
    titleEn: t('${titleKey}', 'en'),
    descriptionAr: t('${subtitleKey}', 'ar'),
    descriptionEn: t('${subtitleKey}', 'en'),
    path: '${routePath}',
  });
}

export default function ${pageName}(): JSX.Element {
  return <${clientName} />;
}
`;
writeFileSync(page, wrapper);
console.log(`wrapped ${dir} → ${clientName} (${titleKey} / ${subtitleKey})`);
