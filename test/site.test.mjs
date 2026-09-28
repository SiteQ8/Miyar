import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { root, read } from './helpers.mjs';

const html = readFileSync(join(root, 'docs/index.html'), 'utf8');
const ui = read('data/ui.json');

test('index.html references assets that exist and only local resources', () => {
  for (const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const p = m[1];
    if (p.startsWith('http')) assert.fail(`external resource ${p}`);
    assert.ok(existsSync(join(root, 'docs', p)), `missing ${p}`);
  }
});

test('every data-t key in the page exists in ui.json', () => {
  for (const m of html.matchAll(/data-[tp]="([^"]+)"/g)) assert.ok(ui[m[1]], `ui key ${m[1]}`);
});

test('the bundle is valid JavaScript carrying the expected shape', () => {
  const js = readFileSync(join(root, 'docs/data/bundle.js'), 'utf8');
  assert.ok(js.startsWith('window.CHECKLISTS = '));
  const d = JSON.parse(js.slice('window.CHECKLISTS = '.length, -2));
  assert.ok(d.data.kw.controls.length === 875);
  assert.ok(d.ui.guide_steps.length === 6);
});

test('the app reads and writes browser storage only inside try blocks', () => {
  const js = readFileSync(join(root, 'docs/assets/app.js'), 'utf8');
  const uses = js.match(/localStorage\.\w+/g) || [];
  assert.ok(uses.length >= 3);
  for (const m of js.matchAll(/localStorage\.\w+/g)) {
    const before = js.slice(Math.max(0, m.index - 60), m.index);
    assert.match(before, /try \{/, `unguarded storage call near ${m.index}`);
  }
});
