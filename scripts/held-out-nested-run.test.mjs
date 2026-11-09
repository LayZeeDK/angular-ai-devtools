// @ts-check
// The pin for `scripts/held-out-nested-run.mjs`: the bound, the tail, the exit-status message, the leg
// report and both guards' source contract, each held to a source of its own rather than to a literal
// this file writes down.
//
// Every claim below is derived from the thing it is about — `package.json`'s own `test` script, the
// words `scripts/held-out-corpus.mjs` actually prints, a 100-line fixture, the real guard files — so a
// change to any of them reddens this suite instead of passing behind a copy. The two mutants that
// matter most are recorded shapes: the aborted `&&` chain `.project/research/e3-diagnosis.md` confirmed
// (one block, the chain's announcement, nothing after it) must produce a message naming the leg that
// stopped the chain, and a guard copy with the bound dropped must fail naming the bound.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  DEPTH_ENV,
  blockCountMessage,
  boundedChild,
  childDepth,
  exitStatusMessage,
  guardSourceProblems,
  legReport,
  nestedLegs,
  nestingNotice,
  ownerRefusal,
  parentDepth,
  tailLines,
} from './held-out-nested-run.mjs';

/** `package.json` beside this suite: the `test` chain is the subject of the leg report, not a fixture. */
const PKG = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);
const CHAIN = PKG.scripts.test;

/** The corpus runner, whose nesting line the module's notice is held to and whose refusal backs the bound. */
const CORPUS_SOURCE = readFileSync(
  new URL('./held-out-corpus.mjs', import.meta.url),
  'utf8',
);

/** The two guards the source contract is enforced over, read as they are on disk. */
const E3_SOURCE = readFileSync(
  new URL('../tests/held-out/e3-zero-skipped.test.mjs', import.meta.url),
  'utf8',
);
const E4_SOURCE = readFileSync(
  new URL('../tests/held-out/e4-idempotent-checks.test.mjs', import.meta.url),
  'utf8',
);

/** The module itself, so the pin can prove it does not restate a threshold the guard owns. */
const MODULE_SOURCE = readFileSync(
  new URL('./held-out-nested-run.mjs', import.meta.url),
  'utf8',
);

/** A guard's problems as one greppable string. */
function problems(text, role) {
  return guardSourceProblems(text, role).join('\n');
}

test('the marker reads as an integer and an absent or unreadable one reads as 0', () => {
  assert.equal(DEPTH_ENV, 'HELD_OUT_CORPUS_DEPTH');
  assert.equal(parentDepth({}), 0);
  assert.equal(parentDepth({ [DEPTH_ENV]: '' }), 0);
  assert.equal(parentDepth({ [DEPTH_ENV]: 'two' }), 0);
  assert.equal(parentDepth({ [DEPTH_ENV]: '0' }), 0);
  assert.equal(parentDepth({ [DEPTH_ENV]: '-1' }), 0);
  assert.equal(parentDepth({ [DEPTH_ENV]: '3' }), 3);
});

test('a bounded child is max(parent + 1, 1), never lower, and never mutates its argument', () => {
  assert.equal(childDepth({}), 1);
  assert.equal(childDepth({ [DEPTH_ENV]: '0' }), 1);
  assert.equal(childDepth({ [DEPTH_ENV]: '1' }), 2);
  assert.equal(childDepth({ [DEPTH_ENV]: '7' }), 8);

  const parent = { [DEPTH_ENV]: '2', KEPT: 'yes' };
  const child = boundedChild(parent);
  assert.equal(child[DEPTH_ENV], '3');
  assert.equal(child.KEPT, 'yes');
  assert.equal(
    parent[DEPTH_ENV],
    '2',
    'the parent environment must not be mutated',
  );
  assert.equal(boundedChild({})[DEPTH_ENV], '1');
});

test('the nesting notice is the corpus runner its own words for that depth', () => {
  const spoken = CORPUS_SOURCE.match(
    /`([^`]*held-out corpus: nested run[^`]*)`/s,
  );
  assert.ok(
    spoken,
    'scripts/held-out-corpus.mjs must still print a nesting notice for a bounded child',
  );
  const template = spoken[1]
    .replace('${DEPTH_ENV}', DEPTH_ENV)
    .replace('${depth}', '2');
  assert.equal(
    nestingNotice(2),
    template,
    'the module expects the exact line the corpus runner prints',
  );
  assert.match(nestingNotice(2), /HELD_OUT_CORPUS_DEPTH=2/);
});

test('the tail keeps the last forty lines of a hundred and names the sixty it dropped', () => {
  const fixture = Array.from({ length: 100 }, (_, i) => `line ${i + 1}`).join(
    '\n',
  );
  const tail = tailLines(fixture);
  const lines = tail.split('\n');
  assert.equal(lines.length, 41);
  assert.equal(lines[0], '... 60 earlier line(s) omitted ...');
  assert.equal(lines[1], 'line 61');
  assert.equal(lines[40], 'line 100');
  assert.equal(tailLines('one\ntwo'), 'one\ntwo');
  assert.equal(tailLines(''), '');
  assert.equal(tailLines('a\r\nb\r\nc').split('\n').length, 3);
});

test('the legs are derived from package.json and each names the evidence it should leave', () => {
  const legs = nestedLegs(CHAIN);
  const commands = CHAIN.split('&&').map((part) => part.trim());
  assert.deepEqual(
    legs.map((leg) => leg.command),
    commands,
    'the report must describe the chain package.json states, in its own order',
  );
  assert.deepEqual(
    legs.map((leg) => leg.index),
    commands.map((_, position) => position + 1),
  );
  assert.ok(
    legs.length >= 5,
    `the chain must still have the legs the block count was derived from, found ${legs.length}`,
  );

  const byCommand = new Map(legs.map((leg) => [leg.command, leg]));
  assert.equal(legs[0].evidence, 'summary');
  assert.equal(byCommand.get('npm run test:app').evidence, 'vitest');
  assert.equal(byCommand.get('npm run test:held-out').evidence, 'corpus');
  const userScope = legs.filter((leg) =>
    leg.command.includes('run-user-scope-tests.mjs'),
  );
  assert.equal(userScope.length, 1);
  assert.equal(userScope[0].evidence, 'summary');
  for (const leg of legs) {
    assert.equal(typeof leg.expected, 'string');
    assert.notEqual(leg.expected, '');
  }
});

test('the confirmed aborted chain names the leg that stopped it', () => {
  // The shape `.project/research/e3-diagnosis.md` §2.5 confirmed: leg 1 reported, npm announced the
  // chain, and legs 2-5 printed nothing at all.
  const aborted = [
    'ℹ tests 1182',
    'ℹ pass 1158',
    'ℹ fail 24',
    'npm notice run test',
    `npm notice run ${CHAIN}`,
    '',
  ].join('\n');
  const report = legReport(aborted, CHAIN);

  assert.equal(report.legs[0].left, 'ℹ pass 1158');
  assert.equal(report.firstMissing.index, 2);
  assert.equal(
    report.firstMissing.command,
    'node scripts/run-user-scope-tests.mjs',
  );
  assert.match(report.text, /run-user-scope-tests\.mjs/);
  assert.match(report.text, /the first leg that left no evidence/);
  assert.ok(
    !report.text.split('\n')[1].includes('the chain stopped here'),
    'leg 1 left its summary, so it must not be marked as the leg that stopped the chain',
  );
  assert.equal(report.legs.length, nestedLegs(CHAIN).length);

  const message = blockCountMessage(
    'E3: expected at least 3 pass summary blocks, got 1',
    aborted,
    CHAIN,
  );
  assert.ok(
    message.startsWith('E3: expected at least 3 pass summary blocks, got 1\n'),
    'the guard sentence stays the message first line',
  );
  assert.match(message, /run-user-scope-tests\.mjs/);
  assert.match(message, /ℹ pass 1158/);
});

test('a green chain leaves no leg without evidence', () => {
  const green = [
    'ℹ pass 1182',
    'ℹ pass 60',
    'ℹ pass 628',
    'Tests 345 passed (345)',
    'npm notice run test',
    `npm notice run ${CHAIN}`,
    nestingNotice(2),
  ].join('\n');
  const report = legReport(green, CHAIN);
  assert.equal(report.firstMissing, null);
  assert.equal(report.legs.length, nestedLegs(CHAIN).length);
  assert.equal(report.legs[0].left, 'ℹ pass 1182');
  assert.equal(report.legs[1].left, 'ℹ pass 60');
  assert.equal(report.legs[2].left, 'ℹ pass 628');
  assert.equal(report.legs[3].left, 'Tests 345 passed');
  assert.equal(report.legs[4].left.trim(), nestingNotice(2));
});

test('a run that printed nothing blames its first leg, not a later one', () => {
  const report = legReport('', CHAIN);
  assert.equal(report.firstMissing.index, 1);
  assert.match(report.text, /npm test` legs \(\d+\)/);
});

test('the exit-status message carries the label, the status, the signal and the tail', () => {
  const exited = exitStatusMessage(
    'E3: npm test',
    { status: 1, signal: null },
    'first\nlast',
  );
  assert.equal(exited, 'E3: npm test exited 1\nfirst\nlast');
  const killed = exitStatusMessage(
    'E3: npm test',
    { status: null, signal: 'SIGTERM' },
    'kept',
  );
  assert.equal(
    killed.split('\n')[0],
    'E3: npm test exited null on signal SIGTERM',
  );
  assert.match(killed, /kept/);
});

test('E3 refuses a run no outer corpus owns, naming the marker, the bound and the runner', () => {
  assert.equal(ownerRefusal({ [DEPTH_ENV]: '1' }), null);
  assert.equal(ownerRefusal({ [DEPTH_ENV]: '2' }), null);
  for (const env of [{}, { [DEPTH_ENV]: '0' }, { [DEPTH_ENV]: 'nope' }]) {
    const refusal = ownerRefusal(env);
    assert.equal(typeof refusal, 'string');
    assert.match(refusal, /HELD_OUT_CORPUS_DEPTH/);
    assert.match(refusal, /max\(parent \+ 1, 1\)/);
    assert.match(refusal, /scripts\/held-out-corpus\.mjs/);
  }
});

test('both guards conform to the source contract at this head', () => {
  assert.deepEqual(guardSourceProblems(E3_SOURCE, 'e3'), []);
  assert.deepEqual(guardSourceProblems(E4_SOURCE, 'e4'), []);
  assert.deepEqual(guardSourceProblems(E3_SOURCE, 'not-a-guard'), [
    "no guard contract is defined for role 'not-a-guard'",
  ]);
  assert.ok(MODULE_SOURCE.length > 0);
  const rendered = blockCountMessage(
    'E3: expected at least 3 pass summary blocks, got 1',
    '',
    CHAIN,
  );
  assert.ok(
    !rendered.includes('>= 3') && !rendered.includes('>= 500'),
    'the guard passes its own sentence, so the block-count message must not restate a threshold',
  );
});

test('a guard copy with the bound dropped fails naming the bound', () => {
  const mutated = E3_SOURCE.replace('env: boundedChild(env)', 'env');
  assert.notEqual(mutated, E3_SOURCE, 'the mutation must change the source');
  assert.match(problems(mutated, 'e3'), /HELD_OUT_CORPUS_DEPTH/);

  const e4Mutated = E4_SOURCE.replace('env: boundedChild(env)', 'env');
  assert.notEqual(e4Mutated, E4_SOURCE);
  assert.match(problems(e4Mutated, 'e4'), /HELD_OUT_CORPUS_DEPTH/);
});

test('widened thresholds and a relaxed regex each redden the contract naming what moved', () => {
  const blockWidened = E3_SOURCE.replace(
    'passMatches.length >= 3',
    'passMatches.length >= 2',
  );
  assert.notEqual(blockWidened, E3_SOURCE);
  assert.ok(problems(blockWidened, 'e3').includes('passMatches.length >= 3'));

  const totalWidened = E3_SOURCE.replace(
    'totalPass >= 500',
    'totalPass >= 400',
  );
  assert.notEqual(totalWidened, E3_SOURCE);
  assert.ok(problems(totalWidened, 'e3').includes('totalPass >= 500'));

  const regexRelaxed = E3_SOURCE.replace(
    '/ℹ pass (\\d+)/g',
    '/ℹ pass\\s+(\\d+)/g',
  );
  assert.notEqual(regexRelaxed, E3_SOURCE);
  assert.ok(problems(regexRelaxed, 'e3').includes('/ℹ pass (\\d+)/g'));

  const e4Widened = E4_SOURCE.replace(
    'passCount(out1) > 0',
    'passCount(out1) >= 0',
  );
  assert.notEqual(e4Widened, E4_SOURCE);
  assert.ok(problems(e4Widened, 'e4').includes('passCount(out1) > 0'));

  const e4Regex = E4_SOURCE.replace('/ℹ pass (\\d+)/g', '/ℹ pass\\s+(\\d+)/g');
  assert.notEqual(e4Regex, E4_SOURCE);
  assert.ok(problems(e4Regex, 'e4').includes('/ℹ pass (\\d+)/g'));
});

test('the status assertion is held ahead of the counts', () => {
  const reordered = [
    'passMatches.length >= 3',
    'totalPass >= 500',
    'result.status',
  ].join('\n');
  assert.match(problems(reordered, 'e3'), /evaluated before/);
});

test('the report, the tail, the refusal and the notice are each held by a mutant that removes it', () => {
  const reportDropped = E3_SOURCE.replace('blockCountMessage(', 'String(');
  assert.notEqual(reportDropped, E3_SOURCE);
  assert.ok(problems(reportDropped, 'e3').includes('blockCountMessage('));

  const refusalDropped = E3_SOURCE.replace('ownerRefusal(env)', 'null');
  assert.notEqual(refusalDropped, E3_SOURCE);
  assert.ok(problems(refusalDropped, 'e3').includes('ownerRefusal(env)'));

  const noticeDropped = E3_SOURCE.replace(
    'nestingNotice(childDepth(env))',
    "''",
  );
  assert.notEqual(noticeDropped, E3_SOURCE);
  assert.ok(
    problems(noticeDropped, 'e3').includes('nestingNotice(childDepth(env))'),
  );

  const timeoutShortened = E3_SOURCE.replace(
    'timeout: 20 * 60 * 1000',
    'timeout: 5 * 60 * 1000',
  );
  assert.notEqual(timeoutShortened, E3_SOURCE);
  assert.ok(
    problems(timeoutShortened, 'e3').includes('timeout: 20 * 60 * 1000'),
  );

  const tailDropped = E4_SOURCE.replace('exitStatusMessage(', 'String(');
  assert.notEqual(tailDropped, E4_SOURCE);
  assert.match(problems(tailDropped, 'e4'), /expected 4/);

  const zeroSkipDropped = E3_SOURCE.replace(
    'assert.deepEqual(bad, []',
    'void (',
  );
  assert.notEqual(zeroSkipDropped, E3_SOURCE);
  assert.ok(
    problems(zeroSkipDropped, 'e3').includes('assert.deepEqual(bad, []'),
  );
});
