// @ts-check
// Run: node --test scripts/copy-to-agent.test.mjs
// M046 T001 measures both halves of the hand-off. `research/raw/m046-pane-and-copy.json` names, per
// subject, the text the console pane renders and the text a copy path composes, each with the file:line
// that produces it, because the milestone's premise — that what the agent is handed is what the pane
// drew — is worth nothing if it is asserted rather than read. A record nobody re-reads drifts the way a
// comment does, so this suite holds it to the tree: every quoted line must be the line its number names,
// and every `differ` claim must be the comparison of the two texts its subject carries. A record that
// claims the two agree over texts that differ is the failure this suite exists for (INTENT.md SC1, AC2).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RECORD = 'research/raw/m046-pane-and-copy.json';

/**
 * @typedef {object} Side one half of a subject: the text, and the line that produces it.
 * @property {string} path the repository-relative file the line is in.
 * @property {number} line the 1-indexed line that produces `text`.
 * @property {string} quoted that line, exactly, as the file holds it.
 * @property {string} text the text the path produces for this subject.
 */

/**
 * @typedef {object} Subject one finding measured through both halves.
 * @property {string} id what the subject is, named once.
 * @property {Side} pane the text the console pane renders, and its producer.
 * @property {Side} copy the text the copy path composes, and its producer.
 * @property {boolean} differ whether those two texts differ.
 */

const record = JSON.parse(readFileSync(join(ROOT, RECORD), 'utf8'));

/**
 * The lines of a repository file, split the way a line number counts them. A path the tree does not
 * hold throws here, which is the check that the record cites a real file.
 * @param {string} path
 * @returns {readonly string[]}
 */
function sourceLines(path) {
  return readFileSync(join(ROOT, path), 'utf8').split('\n');
}

/**
 * The verdict a subject's own two texts give. This is the only comparison `differ` may report, and the
 * suite reads it from the recorded texts rather than from the claim.
 * @param {Subject} subject
 * @returns {boolean}
 */
function verdict(subject) {
  return subject.pane.text !== subject.copy.text;
}

/**
 * One recorded side, held to the file and the line it names: the path is a repository-relative posix
 * path the tree holds, the line is one that file has, and `quoted` is that line and nothing else — so a
 * record whose citation slid off the line it was read from reddens here rather than in review.
 * @param {Side} side
 * @param {string} where
 */
function assertSide(side, where) {
  assert.equal(typeof side.path, 'string', `${where}.path is a string`);
  assert.ok(side.path.length > 0, `${where}.path is not empty`);
  assert.ok(!side.path.startsWith('/'), `${where}.path is repository-relative`);
  assert.ok(!side.path.includes('\\'), `${where}.path is posix`);
  assert.ok(
    Number.isInteger(side.line) && side.line >= 1,
    `${where}.line is a 1-indexed line number`,
  );
  assert.equal(typeof side.text, 'string', `${where}.text is a string`);
  assert.ok(side.text.length > 0, `${where}.text says something`);

  const lines = sourceLines(side.path);
  assert.ok(
    side.line <= lines.length,
    `${where} cites ${side.path}:${side.line} and the file holds ${lines.length} lines`,
  );
  const source = (lines[side.line - 1] ?? '').replace(/\r$/, '').trimEnd();
  assert.equal(
    side.quoted,
    source,
    `${where} quotes ${side.path}:${side.line}`,
  );
  assert.ok(
    side.quoted.trim().length > 0,
    `${where}.quoted is a line that says something`,
  );
}

/**
 * One subject: the four fields and nothing else, both sides cited, and a `differ` claim that is the
 * comparison of the two texts beside it.
 * @param {Subject} subject
 */
function assertSubject(subject) {
  assert.equal(typeof subject.id, 'string', 'a subject carries an id');
  assert.ok(subject.id.length > 0, 'a subject id is not empty');
  assert.deepEqual(
    Object.keys(subject).sort(),
    ['copy', 'differ', 'id', 'pane'],
    `${subject.id} carries its four fields and nothing else`,
  );
  assertSide(subject.pane, `${subject.id}.pane`);
  assertSide(subject.copy, `${subject.id}.copy`);

  assert.equal(
    typeof subject.differ,
    'boolean',
    `${subject.id}.differ is a boolean`,
  );
  const differ = verdict(subject);
  assert.equal(
    subject.differ,
    differ,
    `${subject.id} claims differ=${subject.differ} where its two texts ${
      differ ? 'differ' : 'agree'
    }`,
  );
}

test('the record carries measured subjects, not an empty list', () => {
  assert.deepEqual(
    Object.keys(record).sort(),
    ['head', 'notCaptured', 'subjects'],
    'the record is a head, its subjects and what it does not claim',
  );
  assert.equal(typeof record.head, 'string', 'head is a string');
  assert.match(
    record.head,
    /^[0-9a-f]{40}$/,
    'head is one commit sha, not a branch name',
  );
  assert.ok(Array.isArray(record.subjects), 'subjects is a list');
  assert.ok(record.subjects.length >= 1, 'at least one subject is measured');
  assert.ok(Array.isArray(record.notCaptured), 'notCaptured is a list');
  assert.ok(
    record.notCaptured.length >= 1,
    'the record states what it does not claim',
  );
  for (const claim of record.notCaptured)
    assert.ok(
      typeof claim === 'string' && claim.trim().length > 0,
      'every notCaptured entry says something',
    );

  const ids = record.subjects.map(
    (/** @type {Subject} */ subject) => subject.id,
  );
  assert.equal(
    new Set(ids).size,
    ids.length,
    'each subject is named once, so a citation names one subject',
  );
  for (const subject of record.subjects) assertSubject(subject);
});

test('every cited path and line is the one the record read', () => {
  for (const subject of record.subjects) {
    for (const [half, side] of [
      ['pane', subject.pane],
      ['copy', subject.copy],
    ])
      assertSide(side, `${subject.id}.${half}`);
  }
});

test('every differ claim is the comparison of the two recorded texts', () => {
  for (const subject of record.subjects)
    assert.equal(
      subject.differ,
      verdict(subject),
      `${subject.id} reports the comparison its own two texts give`,
    );
});

test('a claim of agreement over texts that differ is refused', () => {
  const first = record.subjects[0];
  assert.ok(first !== undefined, 'there is a subject to mutate');
  const agreeing = {
    ...first,
    pane: { ...first.pane, text: 'the pane drew this' },
    copy: { ...first.copy, text: 'the copy path composed that' },
    differ: false,
  };
  assert.throws(
    () => assertSubject(agreeing),
    /claims differ=false/,
    'a false agreement is the failure the suite exists for',
  );
  assert.doesNotThrow(() => assertSubject({ ...agreeing, differ: true }));
});

test('a citation to a path the tree does not hold is refused', () => {
  const first = record.subjects[0];
  assert.ok(first !== undefined, 'there is a subject to mutate');
  assert.throws(() =>
    assertSubject({
      ...first,
      pane: {
        ...first.pane,
        path: 'apps/angular-ai-devtools/src/app/no-such-pane.ts',
      },
    }),
  );
});
