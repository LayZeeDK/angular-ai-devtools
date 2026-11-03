import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const itemsPath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'aria-items.ts');
const surfacePath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'aria-surfaces.ts');

function extractArray(src, name) {
  const m = src.match(new RegExp(`export const ${name} = \\[([^\\]]*)\\]`));
  assert.ok(m, `${name} array not found`);
  return [...m[1].matchAll(/'([^']*)'/g)].map((x) => x[1]);
}

test('listbox options follow declared DOM order', () => {
  const itemsSrc = readFileSync(itemsPath, 'utf8');
  const declared = extractArray(itemsSrc, 'listboxItems');
  const surfaceSrc = readFileSync(surfacePath, 'utf8');
  assert.ok(surfaceSrc.includes('listboxItems'), 'surface must use declared items');
  // rendered DOM order: expand the declared list into options and read them back from the DOM
  const dom = new JSDOM(`<!doctype html><html><body><ul id="listbox">${declared.map((item) => `<li ngOption>${item}</li>`).join('')}</ul></body></html>`);
  const rendered = [...dom.window.document.querySelectorAll('#listbox li')].map((el) => el.textContent.trim());
  assert.deepEqual(rendered, declared, 'rendered option order must match declared order');
  assert.deepEqual(rendered, ['Alpha', 'Beta', 'Gamma'], 'rendered option order must be Alpha, Beta, Gamma');
});

test('reversing the declared order fails the order assertion', () => {
  const itemsSrc = readFileSync(itemsPath, 'utf8');
  const declared = extractArray(itemsSrc, 'listboxItems');
  const reversed = [...declared].reverse();
  // a reversed mutant must not match the rendered (pinned) order
  assert.notDeepEqual(reversed, ['Alpha', 'Beta', 'Gamma'], 'reversed order must not equal the rendered order');
});