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
const meta = files.filter((f) => /package\.json$|pnpm-lock\.yaml$/.test(f));
const src = files.filter((f) => !/package\.json$|pnpm-lock\.yaml$/.test(f));
const groups = {};
for (const f of src) {
  const m = f.match(/^(packages\/ui|packages\/api|packages\/shared|packages\/db|apps\/web|apps\/mobile)/);
  (groups[m ? m[1] : 'other'] ??= []).push(f);
}
const order = ['apps/mobile', 'packages/ui', 'apps/web', 'packages/api', 'packages/shared', 'packages/db', 'other'];
const chunks = [{ area: 'manifests+lock', paths: meta }];
for (const g of order) {
  const list = groups[g] || [];
  for (let i = 0; i < list.length; i += 50) chunks.push({ area: g, paths: list.slice(i, i + 50) });
}

let commits = 0;
const poison = [];
const msgBase = (n) =>
  `refactor(types): import JSX namespace from react — 19.2 types removed the global (${n})\n\n` +
  `Adds 'import type { JSX } from \"react\"' to files referencing JSX.*\n` +
  `(react 19.2 types removed the deprecated global JSX namespace).\n\n` +
  'Co-Authored-By: Claude Code <noreply@anthropic.com>';

const tryCommit = (paths) => {
  const listFile = `${root}/.sweep-tmp/jsx2-list.txt`;
  fs.writeFileSync(listFile, paths.join('\n'));
  try {
    git('-c core.literalpathspecs=true add --pathspec-from-file=' + listFile);
    const staged = git('diff --cached --name-only').trim().split(/\r?\n/).filter(Boolean).length;
    if (staged !== paths.length) throw new Error(`staged ${staged} != ${paths.length}`);
    git('commit -F ' + root + '/.sweep-tmp/jsx2-msg.txt');
    commits++;
    return true;
  } catch {
    try { git('reset -q'); } catch {}
    return false;
  }
};

const commitGroup = (paths, depth = 0) => {
  if (paths.length === 0) return;
  if (paths.length === 1) {
    if (tryCommit(paths)) {
      console.log(`  ok (bisected): ${paths[0]}`);
    } else {
      poison.push(paths[0]);
      console.log(`  POISON: ${paths[0]}`);
    }
    return;
  }
  fs.writeFileSync(root + '/.sweep-tmp/jsx2-msg.txt', msgBase(commits + 1));
  if (tryCommit(paths)) {
    console.log(`commit ${paths.length} files (area batch, depth ${depth})`);
    return;
  }
  const mid = Math.floor(paths.length / 2);
  commitGroup(paths.slice(0, mid), depth + 1);
  commitGroup(paths.slice(mid), depth + 1);
};

for (const c of chunks) {
  if (c.paths.length === 0) continue;
  fs.writeFileSync(root + '/.sweep-tmp/jsx2-msg.txt', msgBase(commits + 1));
  if (c.area === 'manifests+lock') {
    tryCommit(c.paths) ? console.log('manifests+lock committed') : poison.push(...c.paths);
    continue;
  }
  commitGroup(c.paths);
}
console.log(`DONE commits=${commits} poison=[${poison.join(', ')}]`);
