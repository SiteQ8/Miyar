// Preflight: refuse to ship stale generated files or forbidden text.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { build } from './build.mjs';
import { root, textFiles, DASHES, FORBIDDEN } from '../test/helpers.mjs';

const { files } = build({ write: false });
let bad = 0;
for (const [p, content] of Object.entries(files)) {
  let disk = '';
  try { disk = readFileSync(join(root, p), 'utf8'); } catch (e) {}
  if (disk !== content) { console.error(`stale: ${p}`); bad++; }
}
for (const f of textFiles()) {
  const s = readFileSync(join(root, f), 'utf8');
  if (DASHES.test(s)) { console.error(`dash in ${f}`); bad++; }
  for (const re of FORBIDDEN) if (re.test(s)) { console.error(`forbidden text in ${f}: ${re}`); bad++; }
}
if (process.argv.includes('--links')) {
  const urls = new Set();
  for (const f of textFiles()) for (const m of readFileSync(join(root, f), 'utf8').matchAll(/https?:\/\/[^\s"')<>\]]+/g)) urls.add(m[0].replace(/[.,]$/, ''));
  for (const u of urls) {
    try { const r = await fetch(u, { method: 'HEAD', redirect: 'follow' }); if (r.status >= 400) { console.error(`link ${r.status}: ${u}`); bad++; } }
    catch (e) { console.error(`link unreachable: ${u}`); bad++; }
  }
}
if (bad) { console.error(`preflight failed with ${bad} problem(s)`); process.exit(1); }
console.log('preflight clean');
