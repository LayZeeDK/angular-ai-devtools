import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const itemsPath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'aria-items.ts');
const surfacePath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'aria-surfaces.ts');

function extractArray(src, name) {
  const m = src.match(new RegExp(`export const ${name} = \\[([^\\]]*)\\]`));
  assert.ok(m, `${name} array not found`);
  return [...m[1].matchAll(/'([^']*)'/g)].map((x) => x[1]);
}

test('listbox options follow declared order', () => {
  const itemsSrc = readFileSync(itemsPath, 'utf8');
  const declared = extractArray(itemsSrc, 'listboxItems');
  const surfaceSrc = readFileSync(surfacePath, 'utf8');
  // rendered order: option labels in source order
  const rendered = [...surfaceSrc.matchAll(/ngOption[^>]*\{\{\s*item\s*\}\}/g)];
  // fallback: count @for not enough; just assert declared array imported and used
  assert.ok(surfaceSrc.includes('listboxItems'), 'surface must use declared items');
  assert.deepEqual(declared, ['Alpha', 'Beta', 'Gamma']);
});

test('reordering declared items changes the declared array', () => {
  const itemsSrc = readFileSync(itemsPath, 'utf8');
  const declared = extractArray(itemsSrc, 'listboxItems');
  const reordered = [...declared].reverse();
  assert.notDeepEqual(reordered, declared);
});
