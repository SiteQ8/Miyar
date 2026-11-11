import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
export const ARABIC = /[\u0600-\u06FF]/;
// Decimal references such as 4.0.1 or 5.7.1.3 are numbers, not sentence punctuation.
const stripVersions = (s) => s.replace(/\d+(?:\.\d+)+/g, '');
export const sentencePeriods = (s) => (stripVersions(s).match(/\./g) || []).length;
export const digits = (s) => (s.match(/\d+/g) || []).sort();
const latinTokens = (s) => stripVersions(s).match(/[A-Za-z][A-Za-z0-9/&+-]*/g) || [];

// An Arabic sentence: one period, at the end; clauses joined by connectives, never by commas or Latin punctuation.
export function arabicSentence(ar, where) {
  assert.ok(ARABIC.test(ar), `${where}: Arabic text expected`);
  assert.ok(ar.trim().endsWith('.'), `${where}: must end with a period`);
  assert.equal(sentencePeriods(ar), 1, `${where}: a period may only close the sentence`);
  assert.ok(!/[،؛]/.test(ar), `${where}: no Arabic comma or semicolon`);
  assert.ok(!/[,;:]/.test(ar), `${where}: join clauses with connectives, not punctuation`);
  for (const tok of latinTokens(ar)) assert.match(tok, /^[A-Z0-9]/, `${where}: stray lowercase Latin word "${tok}"`);
}
// An Arabic label: no period, same punctuation rules. Acronyms identical in both languages pass through.
export function arabicLabel(ar, where, en) {
  if (en !== undefined && ar === en && !ARABIC.test(ar)) return;
  assert.ok(ARABIC.test(ar), `${where}: Arabic text expected`);
  assert.equal(sentencePeriods(ar), 0, `${where}: a label carries no period`);
  assert.ok(!/[،؛]/.test(ar), `${where}: no Arabic comma or semicolon`);
  assert.ok(!/[,;:]/.test(ar), `${where}: no punctuation in a label`);
  for (const tok of latinTokens(ar)) assert.match(tok, /^[A-Z0-9]/, `${where}: stray lowercase Latin word "${tok}"`);
}
export function pair(en, ar, where) {
  assert.ok(en && ar, `${where}: both languages required`);
  assert.ok(!ARABIC.test(en), `${where}: English text contains Arabic`);
  assert.deepEqual(digits(ar), digits(en), `${where}: every number must survive translation`);
}
export const DASHES = /[\u2012\u2013\u2014\u2015]/;
// Names that must never appear in the project, kept as SHA-256 digests so this list is not itself a place they appear.
const BLOCKED = new Set([
  '6afd038687a96730d65753ed0d292878e819324ab3470585c4558861126be9a5',
  'c70eca6b0f88f44d81a41311647e50fda1ac454ec04ffd442b0eb4743a993131',
  'c857d09db23e6822e3600bc06ad8d58f92ed62bc8efd81c753f77048662cb97d'
]);
const digest = (w) => createHash('sha256').update(w).digest('hex');
const blockedWords = {
  test: (s) => [...new Set(s.toLowerCase().match(/[a-z0-9]+/g) || [])].some((w) => BLOCKED.has(digest(w))),
  toString: () => 'a blocked name',
};
export const FORBIDDEN = [blockedWords];

const TEXT = new Set(['.js', '.mjs', '.json', '.md', '.html', '.css', '.txt', '.xml', '.svg', '.yml', '']);
export function textFiles(dir = root) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (['node_modules', 'source', 'media'].includes(name) || (name.endsWith('-lock.json') && name !== 'package-lock.json')) continue;
    if (name.startsWith('.') && statSync(join(dir, name)).isDirectory()) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...textFiles(p));
    else if (TEXT.has(extname(name)) || ['LICENSE', 'CNAME', '.gitignore', '.nojekyll'].includes(name)) out.push(relative(root, p));
  }
  return out;
}
