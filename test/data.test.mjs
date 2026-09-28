import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { root, read, arabicSentence, arabicLabel, pair, DASHES, FORBIDDEN, textFiles } from './helpers.mjs';
import { build, LISTS, LEVELS } from '../scripts/build.mjs';

const { bundle, files } = build({ write: false });
const kw = bundle.data.kw;
const active = bundle.jurisdictions.jurisdictions.filter((j) => j.status === 'active').map((j) => j.id);

test('Kuwait structure matches the CORF body: 27 domains, 93 sub-domains, 199 areas, 875 controls', () => {
  assert.equal(kw.domains.length, 27);
  assert.equal(kw.subdomains.length, 93);
  assert.equal(kw.areas.length, 199);
  assert.equal(kw.controls.length, 875);
  assert.equal(new Set(kw.controls.map((c) => c.id)).size, 875);
});

test('every control sits in at least one checklist with a valid level and known profiles', () => {
  const profiles = new Set(bundle.profiles.profiles.map((p) => p.id));
  for (const c of kw.controls) {
    const lists = Object.keys(c.lists);
    assert.ok(lists.length, `${c.id} is in no checklist`);
    for (const l of lists) {
      assert.ok(LISTS.includes(l), `${c.id}: bad list ${l}`);
      assert.ok(LEVELS.includes(c.lists[l].level), `${c.id}: bad level`);
      for (const p of c.lists[l].profiles) assert.ok(profiles.has(p), `${c.id}: unknown profile ${p}`);
    }
  }
  // Post quantum controls are base in every checklist, never hidden behind a profile.
  for (const ref of ['7.1.4.1', '7.1.4.2', '7.1.4.4']) {
    const c = kw.controls.find((x) => x.id === 'crb:' + ref);
    for (const l of LISTS) assert.deepEqual(c.lists[l].profiles, [], `${ref} must be base in ${l}`);
  }
  // Cloud only areas never leak into the on-premises checklist.
  for (const c of kw.controls.filter((x) => x.area.startsWith('crb:7.2'))) assert.ok(!c.lists.onprem, `${c.id} is cloud only`);
});

test('titles and area summaries are bilingual and follow the Arabic rules', () => {
  for (const d of [...kw.baselines, ...kw.domains, ...kw.subdomains]) { assert.ok(d.title_ar, `${d.id}: title_ar`); arabicLabel(d.title_ar, d.id); }
  for (const a of kw.areas) {
    assert.ok(a.title_ar && a.summary_en && a.summary_ar, `${a.id}: bilingual title and summary`);
    arabicLabel(a.title_ar, a.id);
    arabicSentence(a.summary_ar, a.id);
    pair(a.summary_en, a.summary_ar, a.id);
  }
});

test('control level checks, extensions and gates are bilingual sentences', () => {
  for (const c of kw.controls.filter((x) => x.check)) {
    assert.ok(c.check.en.trim().endsWith('.'), `${c.id}: English check ends with a period`);
    arabicSentence(c.check.ar, c.id);
    pair(c.check.en, c.check.ar, c.id);
  }
  const refs = new Set(kw.controls.map((c) => c.ref));
  for (const e of kw.extensions.checks) {
    assert.match(e.id, /^ARCH-[A-Z]+-\d+$/);
    arabicSentence(e.ar, e.id); pair(e.en, e.ar, e.id);
    for (const r of e.relates) assert.ok(refs.has(r), `${e.id}: relates to unknown control ${r}`);
    for (const l of e.lists) assert.ok(LISTS.includes(l));
  }
  for (const g of kw.extensions.groups) arabicLabel(g.ar, g.id);
  for (const g of kw.gates) {
    arabicSentence(g.ar, g.id); pair(g.en, g.ar, g.id);
    for (const k of Object.keys(g.when)) assert.ok(['lists', 'profiles', 'cover', 'status'].includes(k), `${g.id}: bad condition ${k}`);
  }
});

test('profiles, interface strings and jurisdictions are bilingual', () => {
  const seen = new Set();
  for (const p of bundle.profiles.profiles) {
    assert.ok(!seen.has(p.id), `duplicate profile ${p.id}`); seen.add(p.id);
    arabicLabel(p.ar, p.id, p.en); arabicLabel(p.desc_ar, p.id + ' desc'); pair(p.desc_en, p.desc_ar, p.id);
    assert.ok(bundle.profiles.groups.some((g) => g.id === p.group), `${p.id}: unknown group`);
  }
  for (const [k, v] of Object.entries(bundle.ui)) {
    const items = Array.isArray(v) ? v : [v];
    for (const it of items) {
      assert.ok(it.en && it.ar, `ui ${k}: both languages`);
      if (k === 'lang_switch') continue;
      pair(it.en, it.ar, `ui ${k}`);
      if (it.en.trim().endsWith('.')) arabicSentence(it.ar, `ui ${k}`); else if (k !== 'lang_switch') arabicLabel(it.ar, `ui ${k}`, it.en);
    }
  }
  const orders = bundle.jurisdictions.jurisdictions.map((j) => j.order);
  assert.deepEqual(orders, [1, 2, 3, 4, 5, 6, 7, 8], 'the agreed build order');
  for (const j of bundle.jurisdictions.jurisdictions) {
    arabicLabel(j.ar, j.id);
    for (const f of [...(j.frameworks || []), ...(j.members || []).flatMap((m) => m.frameworks)]) { arabicLabel(f.ar, f.id); pair(f.en, f.ar, f.id); assert.match(f.url, /^https:\/\//); }
    if (j.status === 'active') assert.ok(existsSync(join(root, `data/${j.id}/structure.json`)), `${j.id} is active without data`);
  }
  assert.deepEqual(active, ['kw']);
});

test('no dashes, no forbidden names, no attribution anywhere in the repo', () => {
  for (const f of textFiles()) {
    const s = readFileSync(join(root, f), 'utf8');
    assert.ok(!DASHES.test(s), `${f}: contains a dash`);
    for (const re of FORBIDDEN) assert.ok(!re.test(s), `${f}: matches ${re}`);
  }
});

test('generated files on disk match a fresh build byte for byte', () => {
  for (const [p, content] of Object.entries(files)) {
    assert.equal(readFileSync(join(root, p), 'utf8'), content, `${p} is stale: run npm run build`);
  }
});
