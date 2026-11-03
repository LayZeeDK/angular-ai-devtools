import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { ariaRules, parseSurface } from './aria-rules.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const surfacePath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'aria-surfaces.ts');

test('all aria rules pass on the fixture surface', () => {
  const src = readFileSync(surfacePath, 'utf8');
  const surface = parseSurface(src);
  for (const rule of ariaRules) {
    const verdict = rule.evaluate(surface);
    assert.equal(verdict.pass, true, `${rule.id} should pass: ${verdict.detail}`);
  }
});

test('removing one rule attribute reddens only that rule', () => {
  const src = readFileSync(surfacePath, 'utf8');
  for (const rule of ariaRules) {
    const attr = rule.attribute;
    const needle = rule.surface === 'listbox' ? 'ngListbox' : 'ngMenuTrigger';
    // locate the start tag containing the surface marker and remove the attribute there
    const tagRe = new RegExp(`<[^>]*${needle}[^>]*>`);
    const tagMatch = src.match(tagRe);
    assert.ok(tagMatch, `surface tag for ${rule.id}`);
    const originalTag = tagMatch[0];
    const attrRe = new RegExp(`\\s${attr}="[^"]*"`);
    const mutatedTag = originalTag.replace(attrRe, '');
    assert.notEqual(mutatedTag, originalTag, `mutation for ${rule.id} must change tag`);
    const mutated = src.replace(originalTag, mutatedTag);
    const surface = parseSurface(mutated);
    const verdicts = ariaRules.map((r) => ({ id: r.id, ...r.evaluate(surface) }));
    const target = verdicts.find((v) => v.id === rule.id);
    assert.equal(target.pass, false, `${rule.id} should fail after removing ${attr}`);
    for (const v of verdicts) {
      if (v.id !== rule.id) {
        assert.equal(v.pass, true, `${v.id} should stay green when ${attr} removed`);
      }
    }
  }
});

test('a wrong accessible name reddens the accessible-name rule', () => {
  const src = readFileSync(surfacePath, 'utf8');
  for (const id of ['listbox-accessible-name', 'menu-trigger-accessible-name']) {
    const rule = ariaRules.find((r) => r.id === id);
    const needle = rule.surface === 'listbox' ? 'ngListbox' : 'ngMenuTrigger';
    const tagRe = new RegExp(`<[^>]*${needle}[^>]*>`);
    const tagMatch = src.match(tagRe);
    assert.ok(tagMatch, `surface tag for ${id}`);
    const originalTag = tagMatch[0];
    const mutatedTag = originalTag.replace(/aria-label="[^"]*"/, 'aria-label="Wrong name"');
    assert.notEqual(mutatedTag, originalTag, `mutation for ${id} must change aria-label`);
    const mutated = src.replace(originalTag, mutatedTag);
    const surface = parseSurface(mutated);
    const verdict = rule.evaluate(surface);
    assert.equal(verdict.pass, false, `${id} should fail on a wrong accessible name: ${verdict.detail}`);
  }
});
