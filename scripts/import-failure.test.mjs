// Tests for extension/import-failure.js — the record M064 writes: one entry per dynamic-import attempt
// the router makes, carrying the specifier the import was given, the route path whose configuration
// requested it, and either the response the request produced (its status and the content hash of its
// body) or the fact that the attempt never completed.
//
// Run: node --test scripts/import-failure.test.mjs
// Armed (the only writer this milestone has):
//   M064_CAPTURE=1 node --test scripts/import-failure.test.mjs
// On Windows, where the shell is cmd.exe:
//   set "M064_CAPTURE=1"&& node --test scripts/import-failure.test.mjs
//
// The module is run in a bare `node:vm` context: nothing in that world but the source, so a module
// that imported anything, read `document`, `window`, `performance`, `fetch` or the extension API, or
// opened a request of its own would throw here rather than pass. Every case below executes the shipped
// module and asserts on what it answered; nothing here stands in for behaviour by reading a source
// file as prose.
//
// The facts this record is built on are the ones T001 measured, and both are asserted here rather than
// trusted from a comment:
//
//   - `grep -c "chunk" extension/agent-main.js` is 0: the agent's own record names no chunk, so the
//     specifier this record carries cannot be read back out of that record.
//   - `extension/navigation-narrator.js:26` states that the navigation payloads carry `{route, type}`
//     and no chunk: the stream that already exists does not name what was imported.
//
// The record is measured, not typed. `derive()` loads the module, hands it the attempt fixtures below,
// records what it answered and states the closed sets the namespace exports. `research/raw/
// m064-import-failure.json` must be exactly that serialization: a default run derives the whole record
// again and compares bytes, so a value that moved is named by field and path rather than found by a
// reader. An armed run (`M064_CAPTURE=1`) derives the same record and writes it only when a value
// moved, so two armed runs in a row are byte-identical and a default run writes nothing at all.
//
// Five mutants, each one edit of the shipped source applied in memory and each one a defect this task
// is written against (T001's five):
//
//   1. version-drift-from-status  a stub that infers a version drift from a status
//   2. hash-from-chunk-name       a stub that fills a hash from the chunk filename
//   3. route-path-dropped         a stub that drops the route path
//   4. resolved-as-failure        a stub that records a resolved import as a failure
//   5. missing-status-as-404      a stub that reports a missing status as a 404
//
// Each mutant is run through the very pin the unmutated module passes, and each pin's failure must name
// the field that moved. A test that passes in every mutant would be decoration, so the pin is asserted
// green on the shipped source first inside every mutant case, and the count of assertions this file
// executes is reported by the last test rather than claimed in prose.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The module, the suite and the record this file writes, each named as a literal. */
const MODULE_REL = 'extension/import-failure.js';
const SUITE_REL = 'scripts/import-failure.test.mjs';
const RECORD_REL = 'research/raw/m064-import-failure.json';
const RECORD_PATH = join(ROOT, ...RECORD_REL.split('/'));

/** The milestone, the task and the schema the record states. */
const MILESTONE = 'M064';
const TASK = 'T001';
const SCHEMA = 'm064-import-failure/v1';
const TITLE = 'Record the import failures the router produces';

/** The commands this record is held to, recorded in it so a reader runs what produced it. */
const CHECK_COMMAND = `node --test ${SUITE_REL}`;
const ARMED_COMMAND = `${MILESTONE}_CAPTURE=1 ${CHECK_COMMAND}`;
const ARMED_COMMAND_WINDOWS = `set "${MILESTONE}_CAPTURE=1"&& ${CHECK_COMMAND}`;
const CAPTURE_ENV = `${MILESTONE}_CAPTURE`;

/** True when this run is armed: `M064_CAPTURE=1`, in either shell's spelling. */
const ARMED = String(process.env[CAPTURE_ENV] ?? '').trim() === '1';

/** The navigation stream the record joins against, and the module whose line is cited above. */
const NARRATOR_REL = 'extension/navigation-narrator.js';
const AGENT_REL = 'extension/agent-main.js';

/**
 * The one module that reads this record: M064's join. It names this record's vocabulary because it
 * answers in it, and its own suite (`scripts/chunk-failure.test.mjs`) asserts that the fields it reads
 * are the fields this record states and that it reads no page — so it is the specifier's single reader
 * and not a second producer of one.
 */
const JOIN_REL = 'extension/chunk-failure.js';

/**
 * The modules this census must be the whole of: the record that produces an import specifier and the
 * one join that reads it, in the order the walk over the tree finds them.
 */
const CENSUS_MODULES = [MODULE_REL, JOIN_REL].sort();

const MODULE_SOURCE = read(MODULE_REL);

/** Every assertion this file executes, counted by wrapping the assertion methods before any test. */
let ASSERTIONS = 0;
/** How deep the wrapper is: a nested call through the same object is one assertion, not two. */
let ASSERTION_DEPTH = 0;
for (const name of Object.keys(assert)) {
  const original = assert[name];
  if (typeof original !== 'function' || name === 'strict') continue;
  assert[name] = function (...args) {
    if (ASSERTION_DEPTH === 0) ASSERTIONS += 1;
    ASSERTION_DEPTH += 1;
    try {
      return original.apply(assert, args);
    } finally {
      ASSERTION_DEPTH -= 1;
    }
  };
}

// ------------------------------------------------------------------- reading ----

/**
 * One committed file, as text. A missing file is named with the path a reader can open.
 * @param {string} rel
 * @returns {string}
 */
function read(rel) {
  const path = join(ROOT, ...rel.split('/'));
  assert.ok(existsSync(path), `${rel} is a file this tree carries`);
  return readFileSync(path, 'utf8');
}

/**
 * One file's code with its comments removed: the doc comments are prose and decide nothing, and a
 * scan that counted them would report a word the code never names.
 * @param {string} source
 * @returns {string}
 */
function codeOf(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/** @param {string} text */
function digest(text) {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * A value built inside the vm realm as a plain value, so a deepEqual compares data and not two
 * realms' prototypes.
 * @param {unknown} value
 */
function host(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The bytes the recording is written as, and read back as, on every run. */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/**
 * The first place two values differ, as `path: recorded -> derived`, so a stale value is named rather
 * than reported as a mismatch somewhere in the record.
 * @param {unknown} left
 * @param {unknown} right
 * @param {string} at
 * @returns {string}
 */
function firstDifference(left, right, at) {
  if (JSON.stringify(left) === JSON.stringify(right)) return '';
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return `${at}: ${String(left.length)} row(s) -> ${String(right.length)} row(s)`;
    }
    for (let index = 0; index < left.length; index += 1) {
      const found = firstDifference(
        left[index],
        right[index],
        `${at}[${String(index)}]`,
      );
      if (found !== '') return found;
    }
    return at;
  }
  if (
    left !== null &&
    right !== null &&
    typeof left === 'object' &&
    typeof right === 'object'
  ) {
    const leftRecord = /** @type {Record<string, unknown>} */ (left);
    const rightRecord = /** @type {Record<string, unknown>} */ (right);
    const keys = [
      ...new Set([...Object.keys(leftRecord), ...Object.keys(rightRecord)]),
    ];
    for (const key of keys) {
      const found = firstDifference(
        leftRecord[key],
        rightRecord[key],
        at === '' ? key : `${at}.${key}`,
      );
      if (found !== '') return found;
    }
    return at;
  }
  return `${at}: ${JSON.stringify(left)} -> ${JSON.stringify(right)}`;
}

/**
 * The module in a bare `node:vm` context: a world with nothing in it, so the answer read back is the
 * answer the file publishes rather than a copy of it.
 * @param {string} [source]
 */
function loadBare(source = MODULE_SOURCE) {
  const context = createContext({});
  runInContext(source, context, { filename: MODULE_REL });
  const api = context.angularAiImportFailure;
  assert.ok(
    api,
    `${MODULE_REL} must publish angularAiImportFailure on the global object of whatever world it runs in`,
  );
  return api;
}

/**
 * The module in a world that has a page, a clock, a network and an extension API, each with a tap
 * counter: loading and using the module must read none of them.
 */
function loadWithProbes() {
  const calls = [];
  /**
   * @param {string} name
   * @returns {(...args: unknown[]) => undefined}
   */
  const tap =
    (name) =>
    (...args) => {
      calls.push({ name: name, args: args.length });
      return undefined;
    };
  const context = createContext({
    console: {
      log: tap('console.log'),
      warn: tap('console.warn'),
      error: tap('console.error'),
    },
    performance: { now: tap('performance.now') },
    document: {
      querySelector: tap('document.querySelector'),
      addEventListener: tap('document.addEventListener'),
    },
    window: { addEventListener: tap('window.addEventListener') },
    fetch: tap('fetch'),
    XMLHttpRequest: tap('XMLHttpRequest'),
    chrome: { runtime: { getURL: tap('chrome.runtime.getURL') } },
  });
  runInContext(MODULE_SOURCE, context, { filename: MODULE_REL });
  return { api: context.angularAiImportFailure, calls: calls };
}

const BARE_API = loadBare();

/** The closed sets, read from the namespace the module publishes rather than written here. */
const FIELDS = host(BARE_API.FIELDS);
const STATES = host(BARE_API.STATES);
const REASONS = host(BARE_API.REASONS);

// ------------------------------------------------------------------- fixtures ----

/**
 * The six attempts the record is measured on, as the tap would write them. Every route path below is a
 * fixture route the navigation stream M041 recorded (`claim`, `contract`, `list`), and `''` is the
 * componentless root — a route path, not an absence.
 */
const ATTEMPT_MISSING_IMPORT = {
  specifier: './chunk-claim-4f2a.js',
  routePath: 'claim',
  status: 404,
  outcome: 'failed',
};
const ATTEMPT_NEVER_COMPLETED = {
  specifier: './chunk-contract-7b31.js',
  routePath: 'contract',
  outcome: 'failed',
};
const ATTEMPT_RESOLVED = {
  specifier: './chunk-list-91bd.js',
  routePath: 'list',
  status: 200,
  hash: 'sha256-2c9f57a1d0e64b18f3c7a9be2d54e8c1',
  outcome: 'loaded',
};
const ATTEMPT_RESOLVED_WITHOUT_HASH = {
  specifier: './chunk-list-91bd.js',
  routePath: '',
  status: 200,
  outcome: 'loaded',
};
const ATTEMPT_OUTCOME_ABSENT = {
  specifier: './chunk-claim-4f2a.js',
  routePath: 'claim',
};
const ATTEMPT_SPECIFIER_ABSENT = {
  routePath: 'claim',
  status: 500,
  outcome: 'failed',
};

/**
 * The six attempts, each with the exact answer the contract requires: the state, the fields the
 * attempt's own record carried, and — for a `never-completed` attempt — the one reason it names. This
 * table is the answer's shape and nothing else: no cause, no remedy, no version drift.
 */
const ANSWERS = [
  {
    attempt: ATTEMPT_MISSING_IMPORT,
    answer: {
      state: 'missing-import',
      specifier: './chunk-claim-4f2a.js',
      routePath: 'claim',
      status: 404,
    },
  },
  {
    attempt: ATTEMPT_NEVER_COMPLETED,
    answer: {
      state: 'never-completed',
      specifier: './chunk-contract-7b31.js',
      routePath: 'contract',
      reason: 'no-response',
    },
  },
  {
    attempt: ATTEMPT_RESOLVED,
    answer: {
      state: 'resolved',
      specifier: './chunk-list-91bd.js',
      routePath: 'list',
      status: 200,
      hash: 'sha256-2c9f57a1d0e64b18f3c7a9be2d54e8c1',
    },
  },
  {
    attempt: ATTEMPT_RESOLVED_WITHOUT_HASH,
    answer: {
      state: 'resolved',
      specifier: './chunk-list-91bd.js',
      routePath: '',
      status: 200,
    },
  },
  {
    attempt: ATTEMPT_OUTCOME_ABSENT,
    answer: { state: 'cannot-tell', reason: 'outcome-not-recorded' },
  },
  {
    attempt: ATTEMPT_SPECIFIER_ABSENT,
    answer: { state: 'cannot-tell', reason: 'specifier-not-recorded' },
  },
];

/** One answer, read through the module in a bare context. @param {unknown} attempt */
function answerOf(attempt) {
  return host(BARE_API.importFailure(attempt));
}

/** Every field a pin may see on an answer: the interface's list, by name. */
const FIELD_NAMES = [
  'state',
  'specifier',
  'routePath',
  'status',
  'hash',
  'reason',
];

/** The words an answer may never use: a cause, a remedy, a verdict or a drift. */
const FORBIDDEN = [
  'cause',
  'because',
  'fix',
  'remedy',
  'should',
  'drift',
  'mismatch',
  'version',
  'hypothesis',
  'expected',
];

/**
 * Every string an answer states, lowercased, with the two strings the page wrote dropped: the
 * `specifier` and the `hash` are the page's own words, repeated rather than composed.
 * @param {Record<string, unknown>} written
 * @param {string} what
 */
function assertNamesNoCause(written, what) {
  const text = JSON.stringify(written, (key, entry) =>
    key === 'specifier' || key === 'hash' ? undefined : entry,
  ).toLowerCase();
  for (const word of FORBIDDEN) {
    assert.ok(
      !text.includes(word),
      `${what} must not say "${word}": the record carries what the attempt produced, and no cause, remedy or drift — ${text}`,
    );
  }
}

/**
 * The pin one attempt's answer is held to, and the same pin every mutant below is run through. It
 * states the field that moved in its own message, which is what makes a mutant's failure legible.
 * @param {Record<string, unknown>} written
 * @param {Record<string, unknown>} attempt
 * @param {string} what
 */
function assertWritten(written, attempt, what) {
  // 1. An answer states the interface's fields and nothing else: no invented field, no invented key.
  for (const key of Object.keys(written)) {
    assert.ok(
      FIELDS.includes(key),
      `${what} carries \`${key}\`, and \`${key}\` is not one of the interface's fields ${JSON.stringify(FIELDS)}`,
    );
  }
  assert.ok(
    STATES.includes(written.state),
    `${what} states \`state\` ${JSON.stringify(written.state)}, which is not one of the four states ${JSON.stringify(STATES)}`,
  );

  // 2. A resolved import is recorded as resolved, never as a failure and never omitted.
  if (attempt.outcome === 'loaded') {
    assert.equal(
      written.state,
      'resolved',
      `${what} must record a loaded import as \`resolved\`; it recorded \`state\` ${JSON.stringify(written.state)}`,
    );
  }

  // 3. The specifier is the record's own, and only a record that carried one is named.
  if ('specifier' in written) {
    assert.equal(
      written.specifier,
      attempt.specifier,
      `${what} states \`specifier\` ${JSON.stringify(written.specifier)}, and the record carried ${JSON.stringify(attempt.specifier)}`,
    );
  }

  // 4. The owning route path the record carried is the one written. A dropped path is a failure.
  if (written.state !== 'cannot-tell') {
    assert.equal(
      written.routePath,
      attempt.routePath,
      `${what} must carry the owning \`routePath\` the record states (${JSON.stringify(attempt.routePath)}); it carried ${JSON.stringify(written.routePath)}`,
    );
  }

  // 5. A status is present only where one arrived, and it is that status.
  if ('status' in written) {
    assert.equal(
      written.status,
      attempt.status,
      `${what} states \`status\` ${JSON.stringify(written.status)}, and the record carried no status of that value: ${JSON.stringify(attempt.status)}`,
    );
  }

  // 6. A hash is present only where the record carried one, and it is that hash.
  if ('hash' in written) {
    assert.equal(
      written.hash,
      attempt.hash,
      `${what} states \`hash\` ${JSON.stringify(written.hash)}, and the record carried none: ${JSON.stringify(attempt.hash)}`,
    );
  }

  // 7. A reason is a token from the closed set, and only a cannot-tell or a never-completed names one.
  if ('reason' in written) {
    assert.ok(
      REASONS.includes(written.reason),
      `${what} states \`reason\` ${JSON.stringify(written.reason)}, which is not one of the named absences ${JSON.stringify(REASONS)}`,
    );
    assert.ok(
      written.state === 'cannot-tell' || written.state === 'never-completed',
      `${what} states \`reason\` on the state ${JSON.stringify(written.state)}, and only cannot-tell and never-completed name one`,
    );
  } else {
    assert.notEqual(
      written.state,
      'cannot-tell',
      `${what} is cannot-tell and names no \`reason\``,
    );
  }

  // 8. Nothing that reads as a cause, a remedy or a version drift.
  assertNamesNoCause(written, what);

  // 9. Every field present is a value, not a placeholder: no null survives the writer.
  for (const key of Object.keys(written)) {
    assert.notEqual(
      written[key],
      null,
      `${what} carries \`${key}\` as null, so the field is present and empty rather than absent`,
    );
  }
}

/** The pin a list's answer is held to: the same fields, plus the count it walked. */
function assertSummary(written, consideredCount, what) {
  for (const key of Object.keys(written)) {
    assert.ok(
      FIELDS.includes(key),
      `${what} carries \`${key}\`, and \`${key}\` is not one of the interface's fields ${JSON.stringify(FIELDS)}`,
    );
  }
  assert.equal(
    written.consideredCount,
    consideredCount,
    `${what} states \`consideredCount\` ${JSON.stringify(written.consideredCount)}, and it walked ${String(consideredCount)} attempt(s)`,
  );
  assert.ok(
    STATES.includes(written.state),
    `${what} states \`state\` ${JSON.stringify(written.state)}, which is not one of the four states ${JSON.stringify(STATES)}`,
  );
  assertNamesNoCause(written, what);
}

// ------------------------------------------------------------------- mutants ----

/**
 * The five mutants, each one edit of the shipped source applied in memory. `defect` is the word the
 * failing pin must be shown to name — the field or the string that moved — and `attempt` is the fixture
 * the defect is visible on.
 */
const MUTATIONS = [
  {
    id: 'version-drift-from-status',
    defect: 'versionDrift',
    attempt: ATTEMPT_MISSING_IMPORT,
    what: 'a stub that infers a version drift from a status',
    anchor: '    if (state === NEVER_COMPLETED) written.reason = NO_RESPONSE;',
    replacement:
      '    if (state === NEVER_COMPLETED) written.reason = NO_RESPONSE;\n' +
      "    if (entry.status === 404) written.versionDrift = 'angular-version-mismatch';",
  },
  {
    id: 'hash-from-chunk-name',
    defect: 'hash',
    attempt: ATTEMPT_MISSING_IMPORT,
    what: 'a stub that fills a hash from the chunk filename',
    anchor: "    putCarried(written, 'hash', entry.hash);",
    replacement:
      "    putCarried(written, 'hash', entry.hash);\n" +
      "    putCarried(written, 'hash', (entry.specifier ?? '').split('/').pop());",
  },
  {
    id: 'route-path-dropped',
    defect: 'routePath',
    attempt: ATTEMPT_MISSING_IMPORT,
    what: 'a stub that drops the route path',
    anchor: "    putCarried(written, 'routePath', entry.routePath);",
    replacement: "    putCarried(written, 'routePath', null);",
  },
  {
    id: 'resolved-as-failure',
    defect: 'state',
    attempt: ATTEMPT_RESOLVED,
    what: 'a stub that records a resolved import as a failure',
    anchor: '    if (entry.outcome === LOADED) return RESOLVED;',
    replacement: '    if (entry.outcome === LOADED) return MISSING_IMPORT;',
  },
  {
    id: 'missing-status-as-404',
    defect: 'status',
    attempt: ATTEMPT_NEVER_COMPLETED,
    what: 'a stub that reports a missing status as a 404',
    anchor: "    putCarried(written, 'status', entry.status);",
    replacement: "    putCarried(written, 'status', entry.status ?? 404);",
  },
];

/**
 * One mutation, written into the source's bytes in memory — and asserted to have changed them, or the
 * case would prove nothing.
 * @param {string} source
 * @param {{ anchor: string, replacement: string }} mutation
 */
function mutated(source, mutation) {
  const changed = source.replace(mutation.anchor, mutation.replacement);
  assert.notEqual(
    changed,
    source,
    `mutation ${JSON.stringify(mutation.anchor)} must change the source it is applied to`,
  );
  return changed;
}

/**
 * The failure a pin raises, or null where it stayed green.
 * @param {() => void} pin
 * @returns {Error | null}
 */
function failureOf(pin) {
  try {
    pin();
  } catch (error) {
    return /** @type {Error} */ (error);
  }
  return null;
}

// ------------------------------------------------------------------ derivation ----

/** What one attempt's record carries, in the record's own words, and what it never carries. */
const CARRIES =
  'one answer per dynamic-import attempt: `missing-import` for an import that failed and names its specifier, with the response status and the content hash when the attempt produced them; `never-completed` for an attempt whose request produced no status, with `no-response` named; `resolved` for an import that loaded, recorded as resolved rather than omitted; and `cannot-tell` with one named reason where the record does not say what happened. An answer produced from a list also states `consideredCount`, the number of attempts it walked.';
const DOES_NOT_CARRY =
  'no cause, no remedy, no version drift and no identity the attempt did not produce: a chunk filename is never read back as a specifier, a hash is never derived from a filename or a status, and a missing status is never written as a 404.';

/**
 * The two facts this record is built on, read off the tree rather than typed into it: the agent's own
 * record names no chunk, and the navigation payloads carry `{route, type}` and no chunk.
 * @returns {Record<string, unknown>[]}
 */
function measuredFacts() {
  const agentChunks = read(AGENT_REL).match(/chunk/g) ?? [];
  const narratorLine = (read(NARRATOR_REL).split(/\r?\n/)[25] ?? '').trim();
  return [
    {
      claim:
        'the agent\u2019s own record names no chunk, so the specifier this record carries has no second source in it',
      command: `grep -c "chunk" ${AGENT_REL}`,
      output: String(agentChunks.length),
    },
    {
      claim:
        'the navigation payloads carry `{route, type}` and no chunk, so the stream that already exists does not name what was imported',
      command: `${NARRATOR_REL}:26`,
      output: narratorLine,
    },
  ];
}

/** The one record this milestone's suite derives, and the answers it is derived from. */
function derive() {
  const api = loadBare();
  const samples = [];
  for (const sample of ANSWERS) {
    samples.push({
      attempt: sample.attempt,
      answer: host(api.importFailure(sample.attempt)),
    });
  }

  // The observer, over the same fixtures: one answer per attempt, in the order they arrived, and the
  // one answer the run warrants with the number of attempts it considered.
  const observer = api.observeImportFailures();
  for (const attempt of [
    ATTEMPT_RESOLVED,
    ATTEMPT_MISSING_IMPORT,
    ATTEMPT_NEVER_COMPLETED,
  ]) {
    observer.observe(attempt);
  }
  const observed = host(observer.answers());
  const summary = host(observer.summary());

  const census = censusOf();
  const measured = measuredFacts();

  return {
    schema: SCHEMA,
    milestone: MILESTONE,
    task: TASK,
    title: TITLE,
    module: {
      path: MODULE_REL,
      namespace: 'angularAiImportFailure',
      exports: ['importFailure', 'observeImportFailures'],
      joinedAgainst: NARRATOR_REL,
    },
    interface: {
      fields: host(api.FIELDS),
      states: host(api.STATES),
      reasons: host(api.REASONS),
      attemptFields: host(api.ATTEMPT_FIELDS),
      outcomes: host(api.OUTCOMES),
    },
    carries: CARRIES,
    doesNotCarry: DOES_NOT_CARRY,
    measured: measured,
    samples: samples,
    observer: {
      attempts: observed.length,
      answers: observed,
      summary: summary,
      totalConsidered: host(observer.size()),
    },
    census: census,
    capture: {
      task: TASK,
      command: ARMED_COMMAND,
      windowsCommand: ARMED_COMMAND_WINDOWS,
      check: CHECK_COMMAND,
      records: RECORD_REL,
      reads:
        'the shipped module is run in a bare `node:vm` context and its own answers read back: one answer per attempt fixture, the observer\u2019s answer list and the summary it warrants, and the closed sets the namespace exports. No page is opened, no request is made and no browser is started.',
      reading:
        'a default run derives the whole record again and asserts the committed bytes are exactly that serialization, so a value that moved is named by field and path rather than found by a reader; an armed run derives the same record and writes it only when a value moved, so two armed runs in a row are byte-identical and a default run writes nothing at all.',
    },
    counts: {
      fields: host(api.FIELDS).length,
      states: host(api.STATES).length,
      reasons: host(api.REASONS).length,
      attemptFields: host(api.ATTEMPT_FIELDS).length,
      outcomes: host(api.OUTCOMES).length,
      samples: samples.length,
      observerAttempts: observed.length,
      censusSources: census.specifierSources.length,
    },
  };
}

/**
 * The census SC3 is written about: the modules directly under `extension/` whose code names an import
 * specifier, the attempt record, or one of this record's state words. This record is the only
 * *producer* of an import specifier and `extension/chunk-failure.js` is its single *reader*, so each
 * list below is exactly those two — the producer and its one reader — and a third module naming any of
 * the three tokens is the second source this census refuses.
 *
 * Each module is read once per run and its code kept, so the walk is one read of the tree rather than
 * one per token — a census that re-read the directory for every word would cost more the more modules
 * the tree carries, which is exactly the shape of a scan that grows without measuring anything new.
 * @returns {Record<string, unknown>}
 */
function censusOf() {
  if (CENSUS === null) CENSUS = takeCensus();
  return JSON.parse(JSON.stringify(CENSUS));
}

/** The census, taken once per run: the tree does not change under a running suite. */
let CENSUS = null;

/**
 * One walk of the tree's top-level modules, with each module's code read once.
 * @returns {Record<string, unknown>}
 */
function takeCensus() {
  const names = readdirSync(join(ROOT, 'extension'))
    .filter((name) => name.endsWith('.js'))
    .sort();
  const codes = names.map((name) => codeOf(read(`extension/${name}`)));
  /**
   * @param {string} token
   * @returns {string[]}
   */
  const naming = (token) =>
    names
      .filter((name, index) => codes[index].includes(token))
      .map((name) => `extension/${name}`);
  return {
    rule: 'the record is the only producer of an import specifier under `extension/`, and `extension/chunk-failure.js` \u2014 this milestone\u2019s join \u2014 is its single reader: exactly these two modules name an import specifier (the token `specifier`) in their code, and exactly these two name the attempt record (`importAttempts`) and this record\u2019s state word (`missing-import`). The join names that vocabulary because it answers in it \u2014 its own suite asserts the fields it reads are the fields this record states, and that it reads no page \u2014 so it is the specifier\u2019s one reader and not a second producer of one. A third module naming any of the three tokens is the second source this census refuses (SC3).',
    scanned: 'every top-level `.js` module under `extension/`',
    producer: MODULE_REL,
    readers: [JOIN_REL],
    specifierSources: naming('specifier'),
    attemptRecordSources: naming('importAttempts'),
    stateWordSources: naming('missing-import'),
  };
}

/** The record as bytes, exactly as the capture writes them. */
function serialize() {
  return canonical(derive());
}

/** @returns {Record<string, unknown>} */
function loadRecord() {
  assert.ok(
    existsSync(RECORD_PATH),
    `${RECORD_REL} is missing - the record has never been captured: run \`${ARMED_COMMAND}\` once, then keep the file`,
  );
  return JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
}

/**
 * The read pin: the committed bytes are exactly what this head derives, and the first field that moved
 * is named. Callable on a doctored copy, so a mutant is caught by the same pin the file passes.
 * @param {unknown} record
 */
function assertDerived(record) {
  const difference = firstDifference(record, derive(), '');
  assert.equal(
    difference,
    '',
    `${RECORD_REL} is not what this head derives: ${difference} - re-capture with ${ARMED_COMMAND}`,
  );
  assert.equal(
    canonical(record),
    serialize(),
    `${RECORD_REL} is not serialized as the capture writes it, so a re-capture would move bytes the values do not`,
  );
}

/** The armed capture: derive, compare, write only when a value moved. */
function capture() {
  const present = existsSync(RECORD_PATH);
  const before = present ? readFileSync(RECORD_PATH, 'utf8') : '';
  const candidate = serialize();
  if (present && before === candidate) {
    return { wrote: false, moved: '', after: digest(before) };
  }
  const moved = present
    ? `the record moved: ${JSON.stringify(
        firstDifference(JSON.parse(before), JSON.parse(candidate), ''),
      )}`
    : 'the record had not been written';
  // Never write a record that would fail its own derivation.
  assertDerived(JSON.parse(candidate));
  writeFileSync(RECORD_PATH, candidate);
  return {
    wrote: true,
    moved: moved,
    after: digest(readFileSync(RECORD_PATH, 'utf8')),
  };
}

const CAPTURED = ARMED ? capture() : null;

if (CAPTURED !== null) {
  console.log(
    CAPTURED.wrote
      ? `armed run wrote ${RECORD_REL} (${CAPTURED.moved})`
      : 'armed run: nothing moved, nothing written',
  );
}

// --------------------------------------------------------------------- tests ----

test('the module runs in a bare context and publishes one writer and one observer', () => {
  const context = createContext({});
  runInContext(MODULE_SOURCE, context, { filename: MODULE_REL });
  const api = context.angularAiImportFailure;
  assert.ok(
    api,
    `${MODULE_REL} must publish angularAiImportFailure on the global object of whatever world it runs in`,
  );
  assert.deepEqual(
    Object.keys(api).sort(),
    [
      'ATTEMPT_FIELDS',
      'CANNOT_TELL',
      'FIELDS',
      'MISSING_IMPORT',
      'NEVER_COMPLETED',
      'NO_IMPORT_RECORDED',
      'NO_RESPONSE',
      'OUTCOMES',
      'OUTCOME_NOT_RECORDED',
      'REASONS',
      'RECORD_UNREADABLE',
      'RESOLVED',
      'SPECIFIER_NOT_RECORDED',
      'STATES',
      'importFailure',
      'observeImportFailures',
    ],
    `the namespace must be one writer, one observer and the closed sets they write, and it published ${JSON.stringify(Object.keys(api).sort())}`,
  );
  assert.equal(
    typeof api.importFailure,
    'function',
    'the namespace must publish the pure writer',
  );
  assert.equal(
    typeof api.observeImportFailures,
    'function',
    'the namespace must publish the one observer',
  );

  // The interface's field list, its four states, its five absences and the attempt record's fields,
  // read from the module rather than written here.
  assert.deepEqual(
    host(api.FIELDS),
    [
      'state',
      'specifier',
      'routePath',
      'status',
      'hash',
      'consideredCount',
      'reason',
    ],
    'the interface is exactly the seven fields the contract states',
  );
  assert.deepEqual(
    host(api.STATES),
    ['missing-import', 'never-completed', 'resolved', 'cannot-tell'],
    'the four states are the ones the contract names',
  );
  assert.deepEqual(
    host(api.REASONS),
    [
      'record-unreadable',
      'no-import-recorded',
      'specifier-not-recorded',
      'no-response',
      'outcome-not-recorded',
    ],
    'the absences are named tokens, in one closed set',
  );
  assert.deepEqual(
    host(api.ATTEMPT_FIELDS),
    ['specifier', 'routePath', 'status', 'hash', 'outcome'],
    'the attempt record is the specifier, the route path, the response and the outcome',
  );
  assert.deepEqual(
    host(api.OUTCOMES),
    ['loaded', 'failed'],
    'the attempt states what the import returned, and only that',
  );

  // Two runs of the source in the same world republish in place rather than replacing the namespace.
  const before = api;
  runInContext(MODULE_SOURCE, context, { filename: MODULE_REL });
  assert.equal(
    context.angularAiImportFailure,
    before,
    'a second run in the same world must republish in place, so a caller\u2019s reference stays valid',
  );
});

test('the module reads no page, no clock, no network and no extension API', () => {
  const { calls } = loadWithProbes();
  const used = BARE_API.importFailure(ATTEMPT_MISSING_IMPORT);
  assert.equal(
    used.state,
    'missing-import',
    'the module must answer in a probed world',
  );
  assert.deepEqual(
    calls,
    [],
    `the module must read neither a page nor a clock nor a request: it touched ${JSON.stringify(calls)}`,
  );

  // The source's own words, with its comments dropped: it imports nothing, wraps no `import()` and
  // opens no request of its own — it writes down what the caller's tap saw (no second network read).
  const code = codeOf(MODULE_SOURCE);
  for (const token of [
    'import ',
    'import(',
    'require(',
    'document',
    'window',
    'performance',
    'fetch',
    'XMLHttpRequest',
    'chrome',
    'process',
    'console',
  ]) {
    assert.ok(
      !code.includes(token),
      `${MODULE_REL} must not name ${JSON.stringify(token)} in its code: it is a writer and one observer, and it reads nothing`,
    );
  }

  // The bare world it runs in carries none of them, so the two assertions above are the same fact
  // measured twice: the context has no page global to read.
  const bare = createContext({});
  for (const name of ['document', 'window', 'fetch', 'chrome', 'process']) {
    assert.equal(
      typeof bare[name],
      'undefined',
      `the bare context this suite runs the module in must hold no ${name}`,
    );
  }
});

test('the two facts this record is built on still hold in this tree', () => {
  // `grep -c "chunk" extension/agent-main.js` is 0: the agent's record names no chunk, so the
  // specifier this record carries cannot be read back out of it.
  const agentChunks = read(AGENT_REL).match(/chunk/g) ?? [];
  assert.deepEqual(
    agentChunks,
    [],
    `${AGENT_REL} must name no chunk, and it names ${String(agentChunks.length)}: the specifier this record carries has no second source`,
  );

  // `extension/navigation-narrator.js:26` states that the payloads carry `{route, type}` and no chunk.
  const narratorLine = read(NARRATOR_REL).split(/\r?\n/)[25] ?? '';
  assert.ok(
    narratorLine.includes('{route, type}'),
    `${NARRATOR_REL}:26 must still state that the route-config payloads carry {route, type}, and it reads ${JSON.stringify(narratorLine)}`,
  );
  assert.ok(
    narratorLine.includes('chunk'),
    `${NARRATOR_REL}:26 must still state that no payload names a chunk, and it reads ${JSON.stringify(narratorLine)}`,
  );
});

test('SC1 - a failed import records the specifier, the route path and the status, and nothing else', () => {
  const written = answerOf(ATTEMPT_MISSING_IMPORT);
  assert.deepEqual(
    written,
    {
      state: 'missing-import',
      specifier: './chunk-claim-4f2a.js',
      routePath: 'claim',
      status: 404,
    },
    'a failed import whose response arrived must record the specifier, the owning route path and the status',
  );
  assertWritten(written, ATTEMPT_MISSING_IMPORT, 'the missing-import answer');

  // The record carried no hash, so the answer carries none: a hash is never derived from the filename.
  assert.ok(
    !('hash' in written),
    'the answer must carry no `hash`: the attempt recorded none, and its chunk filename is not one',
  );
  assert.ok(
    !('reason' in written),
    'a missing import that has a status must not also name a reason: the two are different records',
  );

  // The specifier is the record's own string, character for character, and never a chunk name rebuilt
  // from anything else.
  assert.equal(
    written.specifier,
    ATTEMPT_MISSING_IMPORT.specifier,
    'the specifier must be the record\u2019s own specifier, as the page stated it',
  );
});

test('a resolved import is recorded as resolved, with the hash the record carried', () => {
  const written = answerOf(ATTEMPT_RESOLVED);
  assert.deepEqual(
    written,
    {
      state: 'resolved',
      specifier: './chunk-list-91bd.js',
      routePath: 'list',
      status: 200,
      hash: 'sha256-2c9f57a1d0e64b18f3c7a9be2d54e8c1',
    },
    'a resolved import is recorded as resolved, not omitted and not turned into a failure',
  );
  assertWritten(written, ATTEMPT_RESOLVED, 'the resolved answer');

  // A resolution with no hash stays a resolution with no hash: the field is the record's, not a guess.
  const withoutHash = answerOf(ATTEMPT_RESOLVED_WITHOUT_HASH);
  assert.equal(
    withoutHash.state,
    'resolved',
    'an import that loaded is resolved whether or not a hash was computed',
  );
  assert.ok(
    !('hash' in withoutHash),
    'no `hash` may be synthesised for a resolved import whose response produced none',
  );
  assert.equal(
    withoutHash.routePath,
    '',
    '`\u0027\u0027` is a route path - the componentless root - and it must be carried as stated',
  );
});

test('an attempt with no response is never-completed, names no-response and carries no status', () => {
  const written = answerOf(ATTEMPT_NEVER_COMPLETED);
  assert.deepEqual(
    written,
    {
      state: 'never-completed',
      specifier: './chunk-contract-7b31.js',
      routePath: 'contract',
      reason: 'no-response',
    },
    'a failed attempt whose request produced no status is never-completed, with its reason and no status',
  );
  assertWritten(written, ATTEMPT_NEVER_COMPLETED, 'the never-completed answer');
  assert.ok(
    !('status' in written),
    'no `status` may be reported where no response arrived: 404 is a measurement, not a default',
  );
});

test('no field is synthesised: every fixture answers with the fields its own record carried', () => {
  for (const sample of ANSWERS) {
    const written = answerOf(sample.attempt);
    assert.deepEqual(
      written,
      sample.answer,
      `the answer for ${JSON.stringify(sample.attempt)} must be the record it warrants`,
    );
    assert.deepEqual(
      Object.keys(written),
      Object.keys(sample.answer),
      `the answer for ${JSON.stringify(sample.attempt)} must state exactly the fields the record produced, in the interface's order`,
    );
    assertWritten(
      written,
      sample.attempt,
      `the answer for ${sample.answer.state}`,
    );
  }

  // Every field an answer states is one the interface names, over every fixture that answered.
  const stated = new Set();
  for (const sample of ANSWERS) {
    for (const key of Object.keys(answerOf(sample.attempt))) stated.add(key);
  }
  for (const key of stated) {
    assert.ok(
      FIELDS.includes(key),
      `every field an answer states must be one of the interface's fields, and ${JSON.stringify(key)} is not`,
    );
  }
  assert.deepEqual(
    [...stated].sort(),
    [...FIELD_NAMES].sort(),
    `the six fixtures must reach every field of the interface except \`consideredCount\`, which only a list states; they reached ${JSON.stringify([...stated].sort())}`,
  );
});

test('a record that names no specifier answers cannot-tell, and names nothing it was not given', () => {
  const noSpecifier = answerOf(ATTEMPT_SPECIFIER_ABSENT);
  assert.deepEqual(
    noSpecifier,
    { state: 'cannot-tell', reason: 'specifier-not-recorded' },
    'a failed attempt that names no specifier has no missing import to name',
  );
  assertWritten(
    noSpecifier,
    ATTEMPT_SPECIFIER_ABSENT,
    'the specifier-not-recorded answer',
  );

  const noOutcome = answerOf(ATTEMPT_OUTCOME_ABSENT);
  assert.deepEqual(
    noOutcome,
    { state: 'cannot-tell', reason: 'outcome-not-recorded' },
    'an attempt that does not say what it returned is not called a failure',
  );
  assertWritten(
    noOutcome,
    ATTEMPT_OUTCOME_ABSENT,
    'the outcome-not-recorded answer',
  );

  // A value that is not an attempt record at all is a different answer from one that says nothing.
  for (const value of [null, undefined, 'claim', 42, {}, []]) {
    assert.deepEqual(
      answerOf(value),
      { state: 'cannot-tell', reason: 'record-unreadable' },
      `${JSON.stringify(value)} is not an attempt record, so the answer is record-unreadable`,
    );
  }

  // An empty list is a record with no attempt in it, which is the absence it names rather than a zero
  // that reads as a clean stream.
  const empty = host(BARE_API.importFailure({ importAttempts: [] }));
  assert.deepEqual(
    empty,
    {
      state: 'cannot-tell',
      consideredCount: 0,
      reason: 'no-import-recorded',
    },
    'a record that carries no attempt answers no-import-recorded with the count it walked',
  );
  assertSummary(empty, 0, 'the no-import-recorded answer');
});

test('the join answers a whole record: a failure outranks a resolution, and the count it walked is stated', () => {
  const resolved = ATTEMPT_RESOLVED;
  const failed = ATTEMPT_MISSING_IMPORT;
  const mixed = host(
    BARE_API.importFailure({ importAttempts: [resolved, failed, resolved] }),
  );
  assert.deepEqual(
    mixed,
    {
      state: 'missing-import',
      specifier: './chunk-claim-4f2a.js',
      routePath: 'claim',
      status: 404,
      consideredCount: 3,
    },
    'a record holding a failure and two resolutions answers the failure, with the count it considered',
  );
  assertSummary(mixed, 3, 'the mixed record\u2019s answer');

  const allResolved = host(
    BARE_API.importFailure({
      importAttempts: [resolved, ATTEMPT_RESOLVED_WITHOUT_HASH],
    }),
  );
  assert.deepEqual(
    allResolved,
    {
      state: 'resolved',
      specifier: './chunk-list-91bd.js',
      routePath: 'list',
      status: 200,
      hash: 'sha256-2c9f57a1d0e64b18f3c7a9be2d54e8c1',
      consideredCount: 2,
    },
    'a record in which every import loaded answers the first resolution, with its count',
  );
  assertSummary(allResolved, 2, 'the all-resolved record\u2019s answer');

  // A never-completed attempt outranks a resolution and is outranked by a missing import.
  const neverCompleted = host(
    BARE_API.importFailure({
      importAttempts: [resolved, ATTEMPT_NEVER_COMPLETED],
    }),
  );
  assert.equal(
    neverCompleted.state,
    'never-completed',
    'a never-completed attempt outranks a resolution: what failed outranks what worked',
  );
  assert.equal(
    neverCompleted.reason,
    'no-response',
    'the never-completed answer keeps its own reason through the join',
  );
  assert.equal(
    neverCompleted.consideredCount,
    2,
    'the join states every attempt it walked, not only the one it answered with',
  );

  // An unreadable entry is answered as an absence, not dropped and not lent a neighbour's fields.
  const withJunk = host(
    BARE_API.importFailure({ importAttempts: [resolved, 'not an attempt'] }),
  );
  assert.equal(
    withJunk.state,
    'resolved',
    'a resolution beside an unreadable entry is still the resolution it is',
  );
  assert.equal(
    withJunk.consideredCount,
    2,
    'the unreadable entry is counted among the attempts considered',
  );
  const onlyJunk = host(
    BARE_API.importFailure({ importAttempts: ['not an attempt'] }),
  );
  assert.deepEqual(
    onlyJunk,
    { state: 'cannot-tell', consideredCount: 1, reason: 'record-unreadable' },
    'a record whose only entry is unreadable answers record-unreadable with its count',
  );
  assertSummary(onlyJunk, 1, 'the unreadable list\u2019s answer');

  // The join reads the record and writes nothing into it: the same record answers the same bytes twice.
  const record = { importAttempts: [resolved, failed] };
  const frozen = JSON.parse(JSON.stringify(record));
  const first = host(BARE_API.importFailure(record));
  const second = host(BARE_API.importFailure(record));
  assert.deepEqual(first, second, 'the writer holds no state between calls');
  assert.deepEqual(
    record,
    frozen,
    'the join must not write into the record it was handed',
  );
});

test('the observer records each attempt in arrival order and answers the run it saw', () => {
  const observer = BARE_API.observeImportFailures();
  const observed = [
    observer.observe(ATTEMPT_RESOLVED),
    observer.observe(ATTEMPT_MISSING_IMPORT),
    observer.observe(ATTEMPT_NEVER_COMPLETED),
  ];
  assert.equal(
    host(observer.size()),
    3,
    'the observer must keep every attempt it was handed',
  );
  assert.deepEqual(
    host(observed[1]),
    ANSWERS[0].answer,
    'the answer an observation returns is the pure writer\u2019s answer for that attempt',
  );

  const answers = host(observer.answers());
  assert.deepEqual(
    answers,
    [ANSWERS[2].answer, ANSWERS[0].answer, ANSWERS[1].answer],
    'the observer states one answer per attempt, in the order they arrived, and sorts nothing',
  );
  assert.equal(answers.length, 3, 'three observations are three answers');

  const summary = host(observer.summary());
  assert.equal(
    summary.state,
    'missing-import',
    'the summary answers the first failure the run recorded',
  );
  assert.equal(
    summary.consideredCount,
    3,
    'the summary states how many attempts the run considered',
  );
  assertSummary(summary, 3, 'the observer\u2019s summary');

  // The list is handed out as copies: a caller cannot edit the record by editing what it was handed.
  answers[0].state = 'missing-import';
  assert.equal(
    host(observer.answers())[0].state,
    'resolved',
    'the observer must hand out copies, so an edit to one does not rewrite the record',
  );

  // Two observers are two records, and an observer that saw nothing answers the absence.
  const other = BARE_API.observeImportFailures();
  assert.equal(
    host(other.size()),
    0,
    'a second observer starts with no attempt',
  );
  assert.deepEqual(
    host(other.summary()),
    { state: 'cannot-tell', consideredCount: 0, reason: 'no-import-recorded' },
    'an observer that saw no attempt answers no-import-recorded with the count it walked',
  );
  assert.equal(
    host(observer.size()),
    3,
    'a second observer must not share the first one\u2019s record',
  );

  // Every answer the observer wrote is held to the same pin as the pure writer's.
  const pinned = host(observer.answers());
  const attempts = [
    ATTEMPT_RESOLVED,
    ATTEMPT_MISSING_IMPORT,
    ATTEMPT_NEVER_COMPLETED,
  ];
  for (let index = 0; index < pinned.length; index += 1) {
    assertWritten(
      pinned[index],
      attempts[index],
      `the observer\u2019s answer ${String(index)}`,
    );
  }
});

test('SC3 - the record is the only producer of an import specifier under extension/, and one join reads it', () => {
  const census = censusOf();

  // The roles, stated as the census states them: the record produces the specifier and the join is its
  // single reader. They are a partition of what the walk found, so the two names below are measured
  // against the tree rather than kept as a roster beside it.
  assert.equal(
    census.producer,
    MODULE_REL,
    `${MODULE_REL} must be the module this census names as the one producer of an import specifier, and it names ${JSON.stringify(census.producer)}`,
  );
  assert.deepEqual(
    census.readers,
    [JOIN_REL],
    `${MODULE_REL} must have exactly one reader and no second, and the census names ${JSON.stringify(census.readers)}`,
  );
  assert.deepEqual(
    [census.producer].concat(census.readers).sort(),
    CENSUS_MODULES,
    `the producer and its readers must be the two modules this census accounts for, and they are ${JSON.stringify([census.producer].concat(census.readers).sort())}`,
  );

  // Each list is the producer and its one reader and no third module: a second producer of a specifier,
  // or a second reader of this record, arrives here as a third name and reddens this pin.
  for (const [list, what] of [
    ['specifierSources', 'name an import specifier'],
    ['attemptRecordSources', 'name the attempt record'],
    ['stateWordSources', 'name a missing import'],
  ]) {
    assert.deepEqual(
      census[list],
      CENSUS_MODULES,
      `exactly ${MODULE_REL} and its one reader ${JOIN_REL} must ${what}, and these do: ${JSON.stringify(census[list])}`,
    );
  }

  // The scan is not vacuous: the module it names does carry the word, so a census that found nothing
  // because it read nothing would fail here.
  const code = codeOf(MODULE_SOURCE);
  const occurrences = code.split('specifier').length - 1;
  assert.ok(
    occurrences > 1,
    `${MODULE_REL} must name the specifier in its code, and its code names it ${String(occurrences)} time(s)`,
  );

  // The modules the census walked are the tree's own top-level modules, not a list this suite keeps.
  const names = readdirSync(join(ROOT, 'extension'))
    .filter((name) => name.endsWith('.js'))
    .sort();
  assert.ok(
    names.includes('import-failure.js'),
    'the census must walk the module this task wrote',
  );
  assert.ok(
    names.includes('chunk-failure.js'),
    'the census must walk the join that reads this record, or its reader would be accounted for by a list rather than by the tree',
  );
  assert.ok(
    names.length > 20,
    `the census must walk the tree's modules rather than a handful, and it walked ${String(names.length)}`,
  );
  assert.ok(
    !names.includes('panel'),
    'the census walks the top-level modules, not the generated bundle directory',
  );
});

test('the five mutant anchors are each one place in the shipped source, and each really changes it', () => {
  assert.equal(
    MUTATIONS.length,
    5,
    'the battery carries the five defects this task names',
  );
  for (const mutation of MUTATIONS) {
    assert.equal(
      MODULE_SOURCE.split(mutation.anchor).length - 1,
      1,
      `mutation ${mutation.id} must anchor on exactly one place in ${MODULE_REL}`,
    );
    mutated(MODULE_SOURCE, mutation);
    assert.equal(
      typeof mutation.defect,
      'string',
      `mutation ${mutation.id} must name the field its failure has to name`,
    );
    assert.ok(
      FIELDS.includes(mutation.defect) || mutation.defect === 'versionDrift',
      `mutation ${mutation.id} must name a field of the interface or the field it invents, and it names ${JSON.stringify(mutation.defect)}`,
    );
    assert.ok(
      ANSWERS.some((sample) => sample.attempt === mutation.attempt),
      `mutation ${mutation.id} must be visible on an attempt fixture this suite carries`,
    );
  }
});

test('each of the five mutants reddens the same pin the shipped source passes, naming the field that moved', () => {
  const lines = [];
  for (const mutation of MUTATIONS) {
    const source = mutated(MODULE_SOURCE, mutation);
    const mutant = loadBare(source).importFailure;

    // The pin is green on the module as it sits on disk first, so a failure below is the mutation's
    // and not a pin that was already red.
    assertWritten(
      host(BARE_API.importFailure(mutation.attempt)),
      mutation.attempt,
      `the shipped module's answer (${mutation.id} premise)`,
    );

    // The mutant really moved the answer: an anchor that changed the source and nothing else would
    // leave this assertion failing rather than proving anything.
    const shipped = host(BARE_API.importFailure(mutation.attempt));
    const changed = host(mutant(mutation.attempt));
    assert.notDeepEqual(
      changed,
      shipped,
      `mutation ${mutation.id} (${mutation.what}) must change the answer the module writes, and it wrote the same answer`,
    );

    const failure = failureOf(() =>
      assertWritten(
        changed,
        mutation.attempt,
        `mutation ${mutation.id} (${mutation.what})`,
      ),
    );
    assert.ok(
      failure instanceof Error,
      `mutation ${mutation.id} (${mutation.what}) must redden the pin, and it passed`,
    );
    assert.ok(
      failure.message.includes(mutation.defect),
      `mutation ${mutation.id} must redden a pin naming ${JSON.stringify(mutation.defect)}, and it said: ${failure.message.split('\n')[0]}`,
    );
    lines.push(`${mutation.id}: ${failure.message.split('\n')[0]}`);
  }
  console.log(`M064 mutants: ${lines.join(' || ')}`);
});

test('the record is exactly what this head derives, and a moved field is named', () => {
  const recorded = loadRecord();
  if (CAPTURED !== null) {
    const after = digest(readFileSync(RECORD_PATH, 'utf8'));
    assert.equal(
      after,
      CAPTURED.after,
      'the bytes the armed run reports are not the bytes on disk',
    );
    assert.equal(
      capture().wrote,
      false,
      'a second armed run wrote, and nothing had moved',
    );
    assert.equal(
      digest(readFileSync(RECORD_PATH, 'utf8')),
      after,
      'a second armed run changed the record, so the re-capture is not idempotent',
    );
  }
  assertDerived(recorded);
  assert.equal(
    readFileSync(RECORD_PATH, 'utf8'),
    canonical(recorded),
    `${RECORD_REL} must be serialized the way the neighbouring records are: two-space indent and a trailing newline`,
  );

  // The mutant the read pin is written about: one counted field moved, without a re-capture. The
  // unmutated record passes the same pin above, so the red below is the mutation and not drift.
  const planted = structuredClone(recorded);
  assert.ok(
    planted.counts && typeof planted.counts.states === 'number',
    'the record must carry the counted field the mutant moves',
  );
  planted.counts.states += 1;
  assert.notEqual(
    firstDifference(planted, recorded, ''),
    '',
    'the planted record must differ from the captured one, or the mutant is a no-op',
  );
  const failure = failureOf(() => assertDerived(planted));
  assert.ok(
    failure instanceof Error,
    'a moved counted field must redden, and it passed',
  );
  assert.ok(
    failure.message.includes(RECORD_REL),
    `the refusal must name the record it refuses; it said ${JSON.stringify(failure.message.slice(0, 240))}`,
  );
  assert.ok(
    failure.message.includes('counts.states'),
    `the refusal must name the field that moved; it said ${JSON.stringify(failure.message.slice(0, 240))}`,
  );
  console.log(`counted-field mutant: ${failure.message.split('\n')[0]}`);
});

test('the record states what it carries, what it never carries, and the facts it is measured on', () => {
  const recorded = loadRecord();
  const carries = String(recorded.carries);
  for (const state of STATES) {
    assert.ok(
      carries.includes(state),
      `the record's statement of what it carries must name the ${state} state: ${JSON.stringify(carries)}`,
    );
  }
  assert.ok(
    carries.includes('consideredCount'),
    'the statement must name the count an answer produced from a list states',
  );

  const never = String(recorded.doesNotCarry);
  for (const word of [
    'cause',
    'remedy',
    'version drift',
    'chunk filename',
    '404',
  ]) {
    assert.ok(
      never.includes(word),
      `the record must state that it carries no ${JSON.stringify(word)}: ${JSON.stringify(never)}`,
    );
  }

  // The two measured facts are read off this tree on every run, not typed into the record: a fact that
  // moved between the record and the tree is named here rather than found by a reader.
  assert.deepEqual(
    host(recorded.measured),
    measuredFacts(),
    'the record must state the facts this run reads off the tree',
  );
  assert.equal(
    recorded.measured[0].output,
    '0',
    `${AGENT_REL} must still name no chunk, or the specifier this record carries would have a second source`,
  );
  assert.ok(
    String(recorded.measured[1].output).includes('{route, type}'),
    `${NARRATOR_REL}:26 must still be the line that says what the navigation payloads carry`,
  );
});

test('the record states the command that writes it, and that command names this suite and its flag', () => {
  const recorded = loadRecord();
  assert.equal(
    recorded.capture.command,
    ARMED_COMMAND,
    `${RECORD_REL} must name the command that armed this suite as its capture`,
  );
  assert.equal(
    recorded.capture.windowsCommand,
    ARMED_COMMAND_WINDOWS,
    `${RECORD_REL} must state the cmd.exe spelling of the same command`,
  );
  assert.equal(
    recorded.capture.check,
    CHECK_COMMAND,
    'the record must state the unarmed command that reads it',
  );
  assert.equal(
    recorded.capture.records,
    RECORD_REL,
    'the record must name the file it is',
  );
  assert.ok(
    String(recorded.capture.command).includes(SUITE_REL),
    `the capture command must name the suite that writes the record, and it names ${JSON.stringify(recorded.capture.command)}`,
  );
  assert.ok(
    String(recorded.capture.command).includes(CAPTURE_ENV),
    `the capture command must arm the flag the suite reads, and it names ${JSON.stringify(recorded.capture.command)}`,
  );

  // The census the record states is the census this run takes: the record cannot claim one producer
  // and one reader while the tree has two of either.
  const census = censusOf();
  assert.deepEqual(
    recorded.census.producer,
    census.producer,
    'the record must name the producer of an import specifier this run finds',
  );
  assert.deepEqual(
    recorded.census.readers,
    census.readers,
    'the record must name the readers of an import specifier this run finds',
  );
  assert.deepEqual(
    recorded.census.specifierSources,
    census.specifierSources,
    'the record must state the specifier sources this run finds',
  );
  assert.deepEqual(
    recorded.census.attemptRecordSources,
    census.attemptRecordSources,
    'the record must state the attempt-record sources this run finds',
  );
  assert.deepEqual(
    recorded.census.stateWordSources,
    census.stateWordSources,
    'the record must state the state-word sources this run finds',
  );
});

test('the only write in this file sits behind the M064_CAPTURE gate, so an unarmed run writes nothing', () => {
  const source = readFileSync(new URL(import.meta.url), 'utf8');
  const gate = `String(process.env[CAPTURE_ENV] ?? '').trim() === '1'`;
  assert.equal(
    CAPTURE_ENV,
    `${MILESTONE}_CAPTURE`,
    'the flag this suite reads must be this milestone\u2019s own',
  );
  assert.ok(
    source.includes(gate),
    `the write must be armed by ${CAPTURE_ENV}, and the gate this file states is ${JSON.stringify(gate)}`,
  );

  // Every write in this file is the capture's, and the capture runs only when the gate is armed: one
  // call sits at the start of its own line, and the ones this test's own strings spell are not calls.
  const calls = source.match(/^[ \t]+writeFileSync\(/gm) ?? [];
  assert.equal(
    calls.length,
    1,
    `this file must hold exactly one write, and it holds ${String(calls.length)}`,
  );
  const writeAt = source.indexOf('writeFileSync(RECORD_PATH');
  const gateAt = source.indexOf(gate);
  assert.ok(
    writeAt !== -1,
    'the one write must write the record this suite owns',
  );
  assert.ok(
    gateAt !== -1 && gateAt < writeAt,
    'the write must sit after the gate, so a run that is not armed cannot reach it',
  );
  const calledAt = source.indexOf('const CAPTURED = ARMED ? capture() : null;');
  assert.ok(
    calledAt !== -1,
    'the capture must run only through a ternary on ARMED, so the unarmed path never calls it',
  );
  assert.ok(
    calledAt > writeAt,
    'the capture function must be defined before the armed call that runs it',
  );
});

test('the assertions this file made are counted, so a test that measured nothing would show', () => {
  assert.ok(
    ASSERTIONS > 100,
    `this suite must make real assertions rather than declare tests: it made ${String(ASSERTIONS)}`,
  );
  console.log(
    `${RECORD_REL}: ${String(readFileSync(RECORD_PATH, 'utf8').length)} characters, ` +
      `${String(STATES.length)} states, ${String(REASONS.length)} reasons, ` +
      `${String(ANSWERS.length)} attempt samples, ${String(MUTATIONS.length)} mutants, ` +
      `${String(ASSERTIONS)} assertions`,
  );
});
