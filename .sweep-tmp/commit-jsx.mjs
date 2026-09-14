import fs from 'fs';
import { execSync } from 'child_process';
const root = 'C:/Users/saeed/Desktop/under_working/beauty_project';
const git = (args, opts = {}) =>
  execSync('git -C ' + JSON.stringify(root) + ' ' + args, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    ...opts,
  });

const files = git('diff --name-only').trim().split(/\r?\n/).filter(Boolean).sort();
// manifest/lock files first in their own commit
const meta = files.filter((f) => /package\.json$|pnpm-lock\.yaml$/.test(f));
const src = files.filter((f) => !/package\.json$|pnpm-lock\.yaml$/.test(f));
const groups = {};
for (const f of src) {
  const m = f.match(/^(packages\/ui|packages\/api|packages\/shared|packages\/db|apps\/web|apps\/mobile)/);
  const g = m ? m[1] : 'other';
  (groups[g] ??= []).push(f);
}
const order = ['apps/mobile', 'packages/ui', 'apps/web', 'packages/api', 'packages/shared', 'packages/db', 'other'];
const CHUNK = 50;
const chunks = [{ area: 'manifests+lock', paths: meta }];
for (const g of order) {
  const list = groups[g] || [];
  for (let i = 0; i < list.length; i += CHUNK) chunks.push({ area: g, paths: list.slice(i, i + CHUNK) });
}
console.log(`chunks=${chunks.length} files=${files.length}`);

for (let i = 0; i < chunks.length; i++) {
  const { area, paths } = chunks[i];
  const listFile = `${root}/.sweep-tmp/jsx-chunk-${String(i + 1).padStart(2, '0')}.txt`;
  fs.writeFileSync(listFile, paths.join('\n'));
  git('-c core.literalpathspecs=true add --pathspec-from-file=' + listFile);
  const staged = git('diff --cached --name-only').trim().split(/\r?\n/).filter(Boolean).length;
  if (staged !== paths.length) {
    console.error(`ABORT: chunk ${i + 1} staged ${staged} but expected ${paths.length}`);
    process.exit(1);
  }
  const msg =
    i === 0
      ? `chore(deps): apply minor-patch group with react 19 types pin (JSX migration enabler)\n\n` +
        `Dependabot #103: minor/patch bumps + web/ui react 19.2.8 + types ^19.2.18;\n` +
        `mobile RN/expo majors reverted (RN 0.87 migration deferred).\n\n` +
        'Co-Authored-By: Claude Code <noreply@anthropic.com>'
      : `refactor(types): import JSX namespace from react — 19.2 types removed the global (${i}/${chunks.length - 1})\n\n` +
        `Adds 'import type { JSX } from \"react\"' to files referencing JSX.*\n` +
        `(react 19.2 types removed the deprecated global JSX namespace).\n` +
        `Area: ${area} (${paths.length} files).\n\n` +
        'Co-Authored-By: Claude Code <noreply@anthropic.com>';
  fs.writeFileSync(root + '/.sweep-tmp/jsx-msg.txt', msg);
  let out;
  try {
    out = git('commit -F .sweep-tmp/jsx-msg.txt');
  } catch (e) {
    console.log(`commit ${i + 1} failed (hook?) — retrying once`);
    git('-c core.literalpathspecs=true add --pathspec-from-file=' + listFile);
    out = git('commit -F .sweep-tmp/jsx-msg.txt');
  }
  const short = (out.match(/\[[^\]]+\]/) || ['[ok]'])[0];
  console.log(`commit ${i + 1}/${chunks.length} ${short} (${paths.length} files, ${area})`);
}
console.log('DONE');
