/**
 * A recording's stated byte counts must agree with the byte totals that recording records itself —
 * M035 T005 (INTENT.md SC1, SC5).
 *
 * The M035 wave-2 review found `research/raw/m022-ng-context.json` stating
 * `builds.development.bytes` as 2180767 while its own `reconciliation.note` read "at the same
 * 2176374 bytes". The claim was true in substance and the number was stale prose, so every
 * existing suite stayed green: nothing compared a sentence with the field beside it.
 *
 * Scope, stated exactly: this file compares `N bytes`-shaped counts found in the prose of
 * `research/raw/*.json` against that same file's own recorded byte totals. Nothing more.
 *
 * The corpus is those recordings, and only those that record at least one numeric `bytes` field —
 * `builds.development.bytes`, `build.bytesObserved`. A recording that measures no bytes has no
 * total for prose to contradict, so it is not scanned; and the scan asserts, per file, that it
 * actually examined a mention, so an empty scan cannot pass as a clean one.
 *
 * A count is in scope only when the sentence says "byte"/"bytes" and the count is written as a
 * count — `NNN bytes`, comma-grouped or not. That count is held to the recording's *current*
 * totals, not its history, so "at the same 2176374 bytes" is a finding when 2176374 is only the
 * old total. Three refinements, each of them a judgement this file does make:
 *
 *   - A movement — "the total byte count moved 472550 -> 473611" — names both ends, and each end
 *     must be a total the recording records, current or historical. The movement is the project's
 *     own idiom for its history, so the endpoints are held to the recorded set rather than to the
 *     current one.
 *   - A bound is not a measurement. A count standing as a tolerance or a limit — "the development
 *     byte tolerance stays 2000 bytes" — is skipped, because a bound is stated and not measured;
 *     `scripts/ng-context-dev-build.test.mjs` carries the real `DEV_BYTES_TOLERANCE`, and this file
 *     has no business reading it as a bundle size.
 *   - A sentence in which no "byte"/"bytes" word appears is not read at all, even when it states a
 *     number that is plainly a size.
 *
 * Out of scope: what a green run here does *not* mean. This is a narrow check, not a
 * prose-drift gate, and it proves nothing about the following — all of which can carry a stale or
 * invented number through it:
 *
 *   - a count written without the word "bytes" — "the same 2176374", "1.9 MB" — is not matched, so
 *     a stale byte count stated that way passes;
 *   - a number that is not a byte count at all — probe counts, node counts, timings, versions, ids,
 *     error codes — is never read, whatever its magnitude;
 *   - prose outside `research/raw/*.json` is not read: `research/*.md`, `.project/**` (task
 *     contracts, reviews, the plan) and every other file in the repository are outside this scan
 *     entirely, so a recording's numbers quoted into markdown drift unwatched;
 *   - a `research/raw/*.json` recording with no numeric `bytes` field is skipped, so any other
 *     recorded quantity — a node total, a signal count — is unchecked in it;
 *   - the shape of the totals it does use is assumed, not proven: it looks for `bytes`-named
 *     numeric fields for current totals and `growth.*.{was,now,delta}` for history. A recording
 *     that states its history in some new shape has that history read as nothing.
 *
 * Nothing here reads a build, opens a browser or needs a network: the corpus is committed text, so
 * the check costs milliseconds and runs in the default suite (`npm test`).
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** The repository root, resolved from this file — never a host-absolute path. */
const REPO_ROOT = resolve(here, '..');
const RESEARCH_RAW = join(REPO_ROOT, 'research', 'raw');

/** A key that records a byte total, by the name the recordings give it. */
const BYTES_KEY = /bytes/i;

/** The one shape a recording's history takes: `growth.<build>.{was,now,delta}`. */
const HISTORY_KEY = /^(?:was|now|delta)$/;
const HISTORY_ROOT = /^growth(?:\.|\[)/;

/** A byte count stated as a count: `NNN bytes`, comma-grouped numbers included. */
const STATED_BYTES = /(?<![\w.,])(\d[\d,]*)\s+bytes?\b/gi;

/** A movement narrative: `A -> B` in a sentence that is about bytes. */
const MOVEMENT = /(?<![\w.,])(\d[\d,]*)\s*(?:->|→)\s*(\d[\d,]*)/g;

/** A word that makes the count after it a bound rather than a measurement. */
const BOUND_WORD = /\b(?:tolerance|limit|bound|threshold|maximum|minimum)\b/i;

/** How far before a count a bound word may sit and still govern it. */
const BOUND_WINDOW = 40;

/** `byte` / `bytes` as a word, which is what makes a sentence in scope at all. */
const BYTE_WORD = /\bbytes?\b/i;

/** Every numeric field under a key that records a byte total. */
function currentByteTotals(recording) {
  const totals = new Set();
  walkEntries(recording, '', (key, value) => {
    if (BYTES_KEY.test(key) && typeof value === 'number') totals.add(value);
  });
  return totals;
}

/** Every numeric field under the recording's `growth` history keys. */
function historicalByteTotals(recording) {
  const totals = new Set();
  walkEntries(recording, '', (key, value, path) => {
    if (HISTORY_KEY.test(key) && HISTORY_ROOT.test(path)) {
      if (typeof value === 'number') totals.add(value);
    }
  });
  return totals;
}

/** Every `[key, value]` pair in a parsed recording, with the path it sits at. */
function walkEntries(value, path, visit) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      walkEntries(entry, `${path}[${index}]`, visit),
    );
    return;
  }
  if (value === null || typeof value !== 'object') return;
  for (const [key, entry] of Object.entries(value)) {
    const next = path === '' ? key : `${path}.${key}`;
    visit(key, entry, next);
    walkEntries(entry, next, visit);
  }
}

/** Every prose string in a parsed recording, with the path it sits at. */
function proseStrings(recording) {
  const found = [];
  const walk = (value, path) => {
    if (typeof value === 'string') {
      found.push({ path, text: value });
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry, index) => walk(entry, `${path}[${index}]`));
      return;
    }
    if (value === null || typeof value !== 'object') return;
    for (const [key, entry] of Object.entries(value)) {
      walk(entry, path === '' ? key : `${path}.${key}`);
    }
  };
  walk(recording, '');
  return found;
}

/** A comma-grouped count as a number: `2,180,767` and `2180767` are the same count. */
function asNumber(text) {
  return Number(text.replace(/,/g, ''));
}

/** Whether a bound word governs the count starting at `index` in `chunk`. */
function namesABound(chunk, index) {
  const window = chunk.slice(Math.max(0, index - BOUND_WINDOW), index);
  return BOUND_WORD.test(window);
}

/**
 * The sentences in a prose string that are about bytes. A sentence ends at `;` or `:` — the
 * separators the recordings write between a statement and its consequence — so a movement in one
 * clause cannot excuse a plain count in the next.
 */
function byteSentences(text) {
  return text.split(/[;:]/).filter((sentence) => BYTE_WORD.test(sentence));
}

/**
 * One recording's disagreements with itself: every prose byte count that is not a byte total the
 * recording records. `checked` counts the mentions examined, so a caller can refuse an empty scan.
 */
export function byteCountFindings(recording, file = '<recording>') {
  const current = currentByteTotals(recording);
  const history = historicalByteTotals(recording);
  const recorded = new Set([...current, ...history]);
  const findings = [];
  let checked = 0;

  for (const { path, text } of proseStrings(recording)) {
    for (const sentence of byteSentences(text)) {
      for (const match of sentence.matchAll(STATED_BYTES)) {
        const count = asNumber(match[1]);
        if (namesABound(sentence, match.index)) continue;
        checked += 1;
        if (!current.has(count)) {
          findings.push({
            file,
            path,
            stated: count,
            kind: 'stated',
            sentence: sentence.trim(),
            recorded: [...current].sort((a, b) => a - b),
          });
        }
      }
      for (const match of sentence.matchAll(MOVEMENT)) {
        for (const end of [match[1], match[2]]) {
          const count = asNumber(end);
          checked += 1;
          if (!recorded.has(count)) {
            findings.push({
              file,
              path,
              stated: count,
              kind: 'movement',
              sentence: sentence.trim(),
              recorded: [...recorded].sort((a, b) => a - b),
            });
          }
        }
      }
    }
  }

  return { current, history, findings, checked };
}

/** One finding, written the way a failing assertion should read it. */
function describeFinding(finding) {
  const bytes = finding.recorded.map((count) => count.toLocaleString('en-US'));
  return (
    `${finding.file}: ${finding.path} states ${finding.stated.toLocaleString('en-US')} bytes ` +
    `(${finding.kind}), and the recording's byte totals are ${bytes.join(', ') || 'none'} — ` +
    `"${finding.sentence}"`
  );
}

/**
 * Every recording this file scans: committed JSON that records at least one byte total. Files that
 * are not one JSON document are returned separately rather than dropped, so the caller can say
 * which ones it could not read.
 */
export function scannedRecordings() {
  const scanned = [];
  const unreadable = [];
  for (const name of readdirSync(RESEARCH_RAW).sort()) {
    if (!name.endsWith('.json')) continue;
    const file = join(RESEARCH_RAW, name);
    const text = readFileSync(file, 'utf8');
    let recording;
    try {
      recording = JSON.parse(text);
    } catch {
      unreadable.push(name);
      continue;
    }
    const current = currentByteTotals(recording);
    if (current.size === 0) continue;
    scanned.push({ name, recording, current });
  }
  return { scanned, unreadable };
}

test('every byte count a recording states in prose is a byte total the recording records', () => {
  const { scanned, unreadable } = scannedRecordings();

  // A file this scan cannot parse is named, not dropped: `stale-view-counter.json` predates this
  // check, is not a JSON document, and records no byte total, so it is the one file allowed here.
  // Anything else joining it is a recording whose prose went unread, and that is a failure.
  assert.deepEqual(
    unreadable,
    ['stale-view-counter.json'],
    `only the pre-existing non-JSON artifact may go unscanned; these could not be parsed: ${unreadable.join(', ')}`,
  );

  // Non-vacuity, both ways: the recordings that measure bytes are in the scan, and each one was
  // actually read for mentions. A scan that examined nothing passes nothing.
  const names = scanned.map((entry) => entry.name);
  assert.ok(
    names.includes('m022-ng-context.json'),
    `the scan must reach research/raw/m022-ng-context.json; it read ${names.join(', ')}`,
  );
  assert.ok(
    names.includes('companion-dev-build.json'),
    `the scan must reach research/raw/companion-dev-build.json; it read ${names.join(', ')}`,
  );

  const problems = [];
  for (const { name, recording, current } of scanned) {
    const { findings, checked } = byteCountFindings(recording, name);
    assert.ok(
      checked > 0,
      `${name} records ${[...current].length} byte total(s) and states none in prose: the scan ` +
        `examined nothing in it, so its silence proves nothing`,
    );
    problems.push(...findings.map(describeFinding));
  }

  assert.deepEqual(problems, [], problems.join('\n'));
});

/**
 * The mutant: the exact sentence the M035 review found, in a recording shaped like the one that
 * carried it. If the rule ever widens to "any count the recording mentions anywhere", this case
 * goes green — the number below is a recorded historical total, and accepting it is the defect.
 */
test('reports the stale reconciliation note the M035 recording carried', () => {
  const recording = {
    growth: { development: { was: 2176374, now: 2180767, delta: 4393 } },
    builds: {
      development: { bytes: 2180767 },
      production: { bytes: 473611 },
    },
    reconciliation: {
      note:
        'A clean build emits the same three development bundles as companion-dev-build, at the ' +
        'same 2176374 bytes: two recordings agree name for name and byte for byte.',
    },
  };

  const { findings } = byteCountFindings(recording, 'synthetic.json');
  assert.equal(findings.length, 1, JSON.stringify(findings));
  assert.equal(findings[0].path, 'reconciliation.note');
  assert.equal(findings[0].stated, 2176374);
  assert.equal(findings[0].kind, 'stated');
});

test('accepts the corrected note, which states the total the recording measures', () => {
  const recording = {
    growth: { development: { was: 2176374, now: 2180767, delta: 4393 } },
    builds: { development: { bytes: 2180767 } },
    reconciliation: {
      note:
        'A clean build emits the same three development bundles at the same 2180767 bytes: two ' +
        'recordings agree byte for byte.',
    },
  };

  assert.deepEqual(byteCountFindings(recording, 'synthetic.json').findings, []);
});

/** A movement may name both ends only when the recording records both ends. */
test('holds a movement narrative to the totals the recording records', () => {
  const base = {
    builds: { development: { bytes: 2180767 } },
    growth: { development: { was: 2176374, now: 2180767, delta: 4393 } },
  };

  const recorded = {
    ...base,
    remeasurement: {
      proof:
        'The development byte count moved 2176374 -> 2180767; its chunk names are stable.',
    },
  };
  assert.deepEqual(byteCountFindings(recorded, 'synthetic.json').findings, []);

  const invented = {
    ...base,
    remeasurement: {
      proof:
        'The development byte count moved 2176374 -> 9000001; its chunk names are stable.',
    },
  };
  const { findings } = byteCountFindings(invented, 'synthetic.json');
  assert.equal(findings.length, 1, JSON.stringify(findings));
  assert.equal(findings[0].stated, 9000001);
  assert.equal(findings[0].kind, 'movement');
});

/** A count no field anywhere records is a fabricated number, whichever sentence carries it. */
test('rejects a stated count that no field of the recording records', () => {
  const recording = {
    builds: { development: { bytes: 2180767 } },
    reconciliation: {
      note: 'the same build, at 1999999 bytes, measured twice',
    },
  };

  const { findings } = byteCountFindings(recording, 'synthetic.json');
  assert.equal(findings.length, 1, JSON.stringify(findings));
  assert.equal(findings[0].stated, 1999999);
});

/** A tolerance is a bound the task sets, not a size the build measured. */
test('does not read a byte tolerance as a measurement of the bundle', () => {
  const recording = {
    builds: { development: { bytes: 2180767 } },
    growth: {
      tolerance:
        'the development byte tolerance stays 2000 bytes (DEV_BYTES_TOLERANCE); it was not widened',
    },
  };

  assert.deepEqual(byteCountFindings(recording, 'synthetic.json').findings, []);
});

/** The scan reads the committed corpus, not a fixture: the paths below exist at this head. */
test('scans the committed recordings, not a fixture beside this file', () => {
  for (const { name } of scannedRecordings().scanned) {
    const file = join(RESEARCH_RAW, name);
    assert.equal(
      relative(RESEARCH_RAW, file),
      name,
      'a scanned recording must sit directly in research/raw',
    );
    assert.doesNotThrow(() => readFileSync(file, 'utf8'));
  }
});
