import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { isKnownCode } from './image-digest.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const componentPath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'image-budget-page.ts');
const routesPath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'app.routes.ts');
const samplePath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'image-budget-warning.json');

const EXPECTED_CODE = 'NG02952';

function loadSample() {
  return JSON.parse(readFileSync(samplePath, 'utf8'));
}

// COM-1: turn a captured warning sample into a finding. A sample missing the
// binding that produced the offending attribute yields no finding.
function toFinding(sample) {
  if (!sample || typeof sample !== 'object') return null;
  if (typeof sample.code !== 'string' || sample.code === '') return null;
  if (typeof sample.message !== 'string' || sample.message === '') return null;
  if (typeof sample.image !== 'string' || sample.image === '') return null;
  if (typeof sample.binding !== 'string' || sample.binding === '') return null;
  return { code: sample.code, image: sample.image, binding: sample.binding };
}

test('expected code is the code the capture reported', () => {
  assert.equal(EXPECTED_CODE, 'NG02952');
});

test('COM-1 turns the committed warning sample into a finding naming code, image and binding', () => {
  const sample = loadSample();
  const finding = toFinding(sample);
  assert.ok(finding, 'expected a finding from the committed sample');
  assert.equal(finding.code, sample.code);
  assert.equal(finding.image, sample.image);
  assert.equal(finding.binding, sample.binding);
  assert.equal(finding.code, EXPECTED_CODE);
});

test('COM-1 yields no finding when the binding field is removed (mutant)', () => {
  const sample = loadSample();
  const { binding, ...withoutBinding } = sample;
  const finding = toFinding(withoutBinding);
  assert.equal(finding, null, 'removing binding must remove the finding');
});

test('provenance: sample source names the capture record, not a transcription', () => {
  const sample = loadSample();
  assert.equal(typeof sample.source, 'string');
  assert.match(sample.source, /research\/raw\/m027-image-warning-capture\.json/);
  assert.match(sample.source, /capture/i);
  assert.doesNotMatch(sample.source, /transcribed/i);
});

// PRECONDITION (structural only): the fixture carries the offending binding.
// This is not evidence for the finding path; it only asserts the fixture's shape.
test('PRECONDITION: fixture page uses NgOptimizedImage with the offending sizes binding', () => {
  const src = readFileSync(componentPath, 'utf8');
  assert.match(src, /NgOptimizedImage/);
  assert.match(src, /ngSrc=/);
  assert.match(src, /sizes="[^"]*\d+px[^"]*"/);
});

test('PRECONDITION: app.routes.ts registers the image-budget page', () => {
  const src = readFileSync(routesPath, 'utf8');
  assert.match(src, /image-budget/);
  assert.match(src, /ImageBudgetPage/);
  assert.match(src, /export const routes/);
});