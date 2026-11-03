import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const pagePath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'components-page.ts');

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
  assert.equal(tags.length, 2);
});

test('the two probe hosts match attribute by attribute except id', () => {
  const src = readFileSync(pagePath, 'utf8');
  const [a, b] = hostStartTags(src).map(readAttrs);
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  assert.deepEqual(keysA, keysB);
  for (const k of keysA) {
    if (k === 'id') continue;
    assert.equal(a[k], b[k], `attribute ${k} differs`);
  }
  assert.notEqual(a.id, b.id);
});
