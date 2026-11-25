import assert from 'node:assert/strict';
import { test } from 'node:test';
import { entries, findEntry } from './image-digest.mjs';
import {
  MILESTONE_BUDGET_MOVE,
  MILESTONE_INITIAL_KB,
  PRE_MILESTONE_INITIAL_KB,
  measureInitialTotal,
  assertWithinBaseline,
  PANEL_OUTPUT_DIR,
  PANEL_OUTPUT_RELATIVE,
  formatKb,
} from './panel-bundle-budget.test.mjs';

const { imageBudget, imageBudgetSurface } =
  await import('../apps/angular-ai-devtools/src/app/image-budget.ts');

const SAMPLE_FINDING = {
  code: 'NG2952',
  image: 'hero.png',
  binding: 'sizes="100px"',
};

test('empty state when no finding is recorded', () => {
  assert.equal(imageBudget(null).kind, 'empty');
  assert.equal(imageBudget(null).state, 'empty');
  assert.match(imageBudget(null).message, /no image finding/i);
  // mutant: a finding must not be rendered
  assert.equal('code' in imageBudget(null), false);
});

test('loading state shows the fact list being assembled', () => {
  const facts = ['fact one', 'fact two'];
  const result = imageBudget({ loading: true, facts });
  assert.equal(result.kind, 'loading');
  assert.equal(result.state, 'loading');
  assert.deepEqual(result.facts, facts);
  assert.match(result.message, /assembl/i);
});

test('unknown code renders the unknown state, naming the code', () => {
  const result = imageBudget({ code: 'NG9999', binding: 'x' });
  assert.equal(result.kind, 'unknown');
  assert.equal(result.state, 'unknown');
  assert.equal(result.code, 'NG9999');
  assert.match(result.message, /NG9999/);
  assert.match(result.message, /no entry/i);
  // mutant: must not invent a fix
  assert.equal('fix' in result, false);
});

test('held-out E5: an unknown code renders unknown rather than invented text', () => {
  const result = imageBudget('NG0000');
  assert.equal(result.kind, 'unknown');
  assert.equal(result.code, 'NG0000');
});

test('success renders finding, code, binding and fix from the digest entry', () => {
  const entry = findEntry('NG2952');
  const result = imageBudget(SAMPLE_FINDING, entries);
  assert.equal(result.kind, 'success');
  assert.equal(result.state, 'success');
  assert.equal(result.code, 'NG2952');
  assert.equal(result.binding, SAMPLE_FINDING.binding);
  assert.equal(result.fix, entry.fix);
  assert.equal(result.finding.code, 'NG2952');
  assert.ok(result.text.includes('NG2952'));
  assert.ok(result.text.includes(SAMPLE_FINDING.binding));
});

test('success fix comes from the digest entry, not invented (mutant)', () => {
  // mutate digest entry fix and confirm surface follows it
  const mutated = entries.map((e) =>
    e.code === 'NG2952' ? { ...e, fix: 'MUTATED_FIX' } : e,
  );
  const result = imageBudget(SAMPLE_FINDING, mutated);
  assert.equal(result.fix, 'MUTATED_FIX');
});

test('alias export works', () => {
  assert.equal(typeof imageBudgetSurface, 'function');
  assert.equal(imageBudgetSurface(null).kind, 'empty');
});

test('unknown when digest lacks the code even with a finding', () => {
  const result = imageBudget({ code: 'NG1234', binding: 'b' }, entries);
  assert.equal(result.kind, 'unknown');
  assert.equal(result.code, 'NG1234');
});

// ---------------------------------------------------------------------------
// Bundle budget — image-budget surface/route added; initial total must not grow
// ---------------------------------------------------------------------------
test('image-budget: the initial total stays inside the declared ceiling', () => {
  const measurement = measureInitialTotal(PANEL_OUTPUT_DIR);
  if (measurement.state !== 'measured') {
    console.log(`image-budget: skip — ${measurement.reason}`);
    return;
  }
  assertWithinBaseline(
    measurement.kb,
    PANEL_OUTPUT_RELATIVE,
    measurement.files,
  );
  const margin = MILESTONE_INITIAL_KB - measurement.kb;
  console.log(
    `image-budget: measured initial total ${formatKb(measurement.kb)} (${measurement.bytes} B over ` +
      `${measurement.files.length} eager files) against the ${formatKb(MILESTONE_INITIAL_KB)} ceiling ` +
      `(${formatKb(PRE_MILESTONE_INITIAL_KB)} measured + ${MILESTONE_BUDGET_MOVE.milestone}'s declared move); ` +
      `margin ${formatKb(margin)}`,
  );
  console.log(
    `image-budget: eager files: ${measurement.files.map((f) => `${f.file} ${f.bytes} B`).join(', ')}`,
  );
});

test('image-budget: the budget assertion reddens when the total exceeds the ceiling', () => {
  assert.throws(
    () =>
      assertWithinBaseline(
        MILESTONE_INITIAL_KB + 0.001,
        'image-budget mutant',
        [],
      ),
    /exceeds the pre-milestone baseline/,
    'a total above the ceiling must fail the comparison',
  );
});
