import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const pagePath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'components-page.ts');
const SUITE = 'fixture-harness-ambiguity.test.mjs';

function readAttrs(tag) {
  const attrs = {};
  const re = /([A-Za-z_:][\w:.-]*)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(tag)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function hostStartTags(src) {
  const tags = [];
  const re = /<app-harness-probe\b[^>]*>/g;
  let m;
  while ((m = re.exec(src)) !== null) tags.push(m[0]);
  return tags;
}

test('components page renders two app-harness-probe hosts', () => {
  const src = readFileSync(pagePath, 'utf8');
  const tags = hostStartTags(src);
  assert.equal(tags.length, 2, `${SUITE}: expected 2 probe hosts`);
});

test('the two probe hosts match in every attribute the harness matches on (id excluded)', () => {
  const src = readFileSync(pagePath, 'utf8');
  const [a, b] = hostStartTags(src).map(readAttrs);
  // id is NOT part of the harness match set, so it is excluded from comparison.
  const matchedA = Object.fromEntries(Object.entries(a).filter(([k]) => k !== 'id'));
  const matchedB = Object.fromEntries(Object.entries(b).filter(([k]) => k !== 'id'));
  assert.deepEqual(Object.keys(matchedA).sort(), Object.keys(matchedB).sort(), `${SUITE}: mutant (distinguishing attribute added to one host) — matched attribute key sets differ`);
  for (const k of Object.keys(matchedA)) {
    assert.equal(matchedA[k], matchedB[k], `${SUITE}: mutant (distinguishing attribute added to one host) — matched attribute ${k} differs`);
  }
  // id is excluded: the hosts legitimately differ only in id.
  assert.ok('id' in a && 'id' in b, `${SUITE}: both hosts must carry an id`);
  assert.notEqual(a.id, b.id, `${SUITE}: hosts must differ in id (the excluded attribute)`);
});