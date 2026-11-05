/**
 * The ten suites `tests/held-out/` could not carry, kept as claims instead of as permanently red files.
 *
 * Ten of the thirty-two suites failed in every fresh checkout (`.project/plan/MEASUREMENT.md`): six read a
 * review-round record that git never tracked, four drove one browser instance and one on-device model. The
 * claim each of them made is the asset (INTENT prohibition N3), so the record
 * `.project/plan/RETIRED-SUITES.md` holds every claim with its subject, why it could never pass, and what
 * carries it now - and this check is the guard that keeps that record honest:
 *
 *   - the record has one row for each of the ten and no other row, and every row fills the claim, the
 *     subject, the reason and a named successor, so a suite retired without its claim is named here (E5);
 *   - none of the ten files is still under `tests/held-out/`;
 *   - no other file in the repository names a retired basename, so a reference to a suite that no longer
 *     exists cannot be left behind in a runner, a doc or a skill.
 *
 * The check fails and never skips: a missing record is the absence it exists to name. It reads no path under
 * `.project/` that a checkout is not expected to carry - the record is the one artifact it resolves, from the
 * plan while the milestone is live and from the archive once the ship flow has moved the directory.
 */

import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RECORD = join(ROOT, '.project', 'plan', 'RETIRED-SUITES.md');
const HELD_OUT = join(ROOT, 'tests', 'held-out');

/** The ten suites this milestone retired, in the record's own order. */
const RETIRED = [
  'e1-zero-defects-recorded',
  'e5-unverifiable-recorded',
  'e6-portal-dependency',
  'e10-spec-present',
  'e11-rerun-stable',
  'e12-clean-worktree',
  'chrome-beta-gemma4-panel',
  'chrome-beta-nano-panel',
  'chrome-stable-nano-panel',
  'edge-phi4mini-panel',
];

/** What every record row must state, as the column it occupies after the suite and as the word a failure uses. */
const REQUIRED = [
  { column: 1, missing: 'no claim' },
  { column: 2, missing: 'no subject it read or drove' },
  { column: 3, missing: 'no reason it could not pass in a fresh checkout' },
  { column: 4, missing: 'no successor that carries the claim' },
];

/** The successors a row may name: the review grammar, or the skill that drives one browser instance and model. */
const SUCCESSORS = [
  /gsd review-check/,
  /gsd final-check/,
  /verify-ai-browsers/,
];

/** Directories a repository walk never descends into: dependencies, generated output and shared browser state. */
const SKIPPED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.nx',
  '.angular',
  'out-tsc',
  'tmp',
  'test-results',
  'playwright-report',
  '.playwright-cli',
  '.browsers',
  '.audit',
  '__screenshots__',
  'worktrees',
]);

/**
 * Paths allowed to name a retired suite, each for the reason it must. Everything else the walk reaches is a
 * live reference to a file that no longer exists, which is the defect this check names.
 */
const NAMING_ALLOWED = [
  // this check names every suite it refuses, so it must name each of the ten.
  ['scripts', 'retired-suites.test.mjs'],
  // the record itself, and the measurement that measured the ten red and retired them.
  ['.project', 'plan'],
  // append-only history: the milestones that authored these suites name them, and they are the provenance of
  // the claim the record now carries. Editing them would rewrite the record of what happened.
  ['.project', 'archive'],
  // this milestone's own task files, which name the ten because retiring them is the task, and which the ship
  // flow moves into the archive above.
  ['.project', 'tasks'],
  // this milestone's review artifacts, which name the ten because a review records what it reviewed: quoting a
  // retired suite there is the record working, not a live reference, and the ship flow moves it into the archive.
  ['.project', 'review'],
];

/**
 * The record for the milestone under work: the plan while it is live, its own archive copy once the ship flow
 * has moved `.project/plan` away. A milestone must never be left without a record, so this asserts rather
 * than returning an empty table that would fail every row for the wrong reason.
 *
 * @returns {string}
 */
function recordPath() {
  if (existsSync(RECORD)) {
    return RECORD;
  }

  const archives = join(ROOT, '.project', 'archive');
  const copies = existsSync(archives)
    ? readdirSync(archives)
        .sort()
        .reverse()
        .map((name) => join(archives, name, 'plan', 'RETIRED-SUITES.md'))
        .filter((path) => existsSync(path))
    : [];

  assert.ok(
    copies.length > 0,
    `no retired-suite record at ${RECORD} or in any archive; the check fails rather than skipping`,
  );

  return copies[0];
}

/**
 * The record's table as rows of cells, the suite name stripped of its backticks. The header and the `|---|`
 * separator are not rows.
 *
 * @param {string} text
 * @returns {{ suite: string, cells: string[] }[]}
 */
function recordRows(text) {
  /** @type {{ suite: string, cells: string[] }[]} */
  const rows = [];

  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith('|')) {
      continue;
    }

    const trimmed = line.endsWith('|') ? line.slice(1, -1) : line.slice(1);
    const cells = trimmed.split('|').map((cell) => cell.trim());
    const suite = cells[0].replaceAll('`', '').trim();

    if (suite === 'Suite' || /^:?-+:?$/.test(suite)) {
      continue;
    }

    rows.push({ suite, cells });
  }

  return rows;
}

/**
 * Every file the repository holds, minus the directories that carry no source.
 *
 * @param {string} directory
 * @param {string[]} [found]
 * @returns {string[]}
 */
function walk(directory, found = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort(
    (left, right) => (left.name < right.name ? -1 : 1),
  )) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!SKIPPED_DIRECTORIES.has(entry.name)) {
        walk(path, found);
      }

      continue;
    }

    if (entry.isFile()) {
      found.push(path);
    }
  }

  return found;
}

/**
 * `root`-relative, forward-slash form - the form a failure message names and the form `NAMING_ALLOWED` uses.
 *
 * @param {string} path
 * @returns {string}
 */
function displayPath(path) {
  return relative(ROOT, path).split(sep).join('/');
}

/**
 * @param {string} path
 * @returns {boolean}
 */
function namingAllowed(path) {
  const segments = displayPath(path).split('/');

  return NAMING_ALLOWED.some((prefix) =>
    prefix.every((segment, index) => segments[index] === segment),
  );
}

test('the record carries one row for each retired suite and no other row', () => {
  const rows = recordRows(readFileSync(recordPath(), 'utf8'));
  const named = rows.map((row) => row.suite);
  const duplicated = named.filter(
    (suite, index) => named.indexOf(suite) !== index,
  );

  assert.deepEqual(duplicated, [], 'a suite has more than one row');
  assert.deepEqual(
    [...named].sort(),
    [...RETIRED].sort(),
    'the rows must be exactly the ten retired suites',
  );
});

test('every retired row states its claim, its subject, why it could not pass, and what carries it now', () => {
  const rows = recordRows(readFileSync(recordPath(), 'utf8'));
  const incomplete = rows
    .map((row) => ({
      suite: row.suite,
      missing: REQUIRED.filter(
        ({ column, missing }) => (row.cells[column] ?? '').length === 0,
      ).map(({ missing }) => missing),
    }))
    .filter((row) => row.missing.length > 0)
    .map((row) => `${row.suite}: ${row.missing.join(', ')}`);
  const successorless = rows
    .filter(
      (row) =>
        !SUCCESSORS.some((successor) => successor.test(row.cells[4] ?? '')),
    )
    .map((row) => row.suite);

  assert.deepEqual(
    incomplete,
    [],
    'a retired suite with no recorded claim is named here',
  );
  assert.deepEqual(
    successorless,
    [],
    'a retired row must name what carries its claim now: the review grammar or verify-ai-browsers',
  );
});

test('none of the ten retired suites is still under tests/held-out', () => {
  const present = RETIRED.filter((suite) =>
    existsSync(join(HELD_OUT, suite + '.test.mjs')),
  );
  const corpus = existsSync(HELD_OUT)
    ? readdirSync(HELD_OUT).filter((name) => name.endsWith('.test.mjs'))
    : [];

  assert.deepEqual(
    present,
    [],
    'a suite the record lists as retired is still in the corpus',
  );
  assert.ok(
    corpus.length > 0,
    `the corpus at ${HELD_OUT} still holds the suites this milestone kept, so an empty directory cannot pass this check`,
  );
});

test('no file outside the record names a retired suite', () => {
  /** @type {string[]} */
  const hits = [];

  for (const path of walk(ROOT)) {
    if (namingAllowed(path)) {
      continue;
    }

    let text;

    try {
      text = readFileSync(path, 'utf8');
    } catch (error) {
      // The corpus runs in parallel with suites that write and remove their own fixtures. A file that is
      // gone by the time it is read cannot be a live reference; any other failure is a real one.
      if (error.code !== 'ENOENT') {
        throw error;
      }

      continue;
    }

    for (const suite of RETIRED) {
      if (text.includes(suite)) {
        hits.push(`${displayPath(path)}: ${suite}`);
      }
    }
  }

  assert.deepEqual(
    hits,
    [],
    'a file names a retired suite that no longer exists; the claim belongs in .project/plan/RETIRED-SUITES.md',
  );
});
