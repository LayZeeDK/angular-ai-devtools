// Tests for extension/chunk-failure.js — the join M064's panel renders: the record
// `extension/import-failure.js` writes, read as the one state each dynamic-import attempt ended in.
//
// Run: node --test scripts/chunk-failure.test.mjs
//
// The module is run in a bare `node:vm` context: nothing in that world but the source, so a module
// that imported anything, read `document`, `window`, `performance`, `fetch` or the extension API, or
// opened a request of its own would throw here rather than pass. Every case below executes the
// shipped module and asserts on what it answered; nothing here stands in for behaviour by reading a
// source file as prose.
//
// The join stands on three facts this tree carries, and each is read off the tree on every run
// rather than trusted from a comment:
//
//   - `extension/import-failure.js` writes the attempt record, and the fields this join reads are the
//     fields that module states — one list, asserted in one place (INTENT SC3). The record it
//     publishes, `research/raw/m064-import-failure.json`, carries six attempts and the answers the
//     record module gives them; this join answers the same six the same way, so the join and the
//     record state one vocabulary.
//   - `extension/navigation-narrator.js:16` states that `RouteConfigLoadStart` and `RouteConfigLoadEnd`
//     carry `{route, type}` and no navigation id, and that the two loads are told apart by
//     `route.path`: the classes this join reads are the router's own statement of what it attempted.
//   - `extension/agent-main.js:1642` writes `route: routerRoutePathOf(event)`, and
//     `routerRoutePathOf` (1527-1537) returns that route config's own `path` when it is a string and
//     null otherwise: the stream's `route` is the route path, not a chunk, a url or an id.
//
// Eight mutants, each one edit of the shipped source applied in memory and each one a defect this
// task is written against:
//
//   1. status-worsened-into-missing-import  a stub that reads a status as a verdict
//   2. version-drift-from-status            a stub that names a drift from a status
//   3. remedy-added                         a stub that offers a remedy
//   4. cause-added                          a stub that names a cause
//   5. hash-from-chunk-name                 a stub that completes a truncated hash from the filename
//   6. last-failure-collapsed               a stub that collapses one navigation's two failures to the
//                                           last
//   7. unattempted-route-named              a stub that attributes a failure to a route the router
//                                           never attempted
//   8. resolved-reported-as-failure         a stub that reports a loaded import as a failure
//
// Each mutant is run through the very pin the unmutated module passes, and each pin's failure must
// name the field or the string that moved. A test that passes in every mutant would be decoration, so
// the pin is asserted green on the shipped source first inside every mutant case, and the count of
// assertions this file executes is reported by the last test rather than claimed in prose.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The module, the suite, the record module it joins and the record that module publishes. */
const MODULE_REL = 'extension/chunk-failure.js';
const SUITE_REL = 'scripts/chunk-failure.test.mjs';
const RECORD_MODULE_REL = 'extension/import-failure.js';
const RECORD_REL = 'research/raw/m064-import-failure.json';
const NARRATOR_REL = 'extension/navigation-narrator.js';
const AGENT_REL = 'extension/agent-main.js';
const NAMESPACE = 'angularAiChunkFailure';
const RECORD_NAMESPACE = 'angularAiImportFailure';

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

/**
 * A value built inside the vm realm as a plain value, so a deepEqual compares data and not two
 * realms' prototypes.
 * @param {unknown} value
 */
function host(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * The module in a bare `node:vm` context: a world with nothing in it, so the answer read back is the
 * answer the file publishes rather than a copy of it.
 * @param {string} [source]
 * @param {string} [rel]
 */
function loadBare(source = MODULE_SOURCE, rel = MODULE_REL) {
  const context = createContext({});
  runInContext(source, context, { filename: rel });
  return context;
}

/** The join, as the file on disk publishes it. */
function shippedApi(source = MODULE_SOURCE) {
  const context = loadBare(source);
  const api = context[NAMESPACE];
  assert.ok(
    api,
    `${MODULE_REL} must publish ${NAMESPACE} on the global object of whatever world it runs in`,
  );
  return api;
}

const BARE_API = shippedApi();

/** The record module, read the same way: the writer whose record this join reads. */
const RECORD_API = (() => {
  const api = loadBare(read(RECORD_MODULE_REL), RECORD_MODULE_REL)[
    RECORD_NAMESPACE
  ];
  assert.ok(
    api,
    `${RECORD_MODULE_REL} must publish ${RECORD_NAMESPACE}, or this join has no record to read`,
  );
  return api;
})();

/** The closed sets, read from the namespace the module publishes rather than written here. */
const FIELDS = host(BARE_API.FIELDS);
const STATES = host(BARE_API.STATES);
const REASONS = host(BARE_API.REASONS);
const ATTEMPT_FIELDS = host(BARE_API.ATTEMPT_FIELDS);
const OUTCOMES = host(BARE_API.OUTCOMES);

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
  return { api: context[NAMESPACE], calls: calls };
}

// ------------------------------------------------------------------ fixtures ----

/**
 * The eight attempts the join is measured on, as the record module writes them. Every route path
 * below is a fixture route the navigation stream M041 recorded (`claim`, `contract`, `list`), `''` is
 * the componentless root — a route path, not an absence — and `invoices` is the one path the router's
 * stream never names.
 */
const ATTEMPT_CLAIM_404 = {
  specifier: './chunk-claim-4f2a.js',
  routePath: 'claim',
  status: 404,
  outcome: 'failed',
};
const ATTEMPT_CONTRACT_500 = {
  specifier: './chunk-contract-7b31.js',
  routePath: 'contract',
  status: 500,
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
  hash: 'sha256-2c9f57a1d0e64b18',
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
  status: 500,
};
const ATTEMPT_SPECIFIER_ABSENT = {
  routePath: 'claim',
  status: 500,
  outcome: 'failed',
};
const ATTEMPT_UNATTEMPTED_ROUTE = {
  specifier: './chunk-claims-3a1c.js',
  routePath: 'invoices',
  status: 503,
  outcome: 'failed',
};

/**
 * The router's own stream, as `agent-main.js` publishes it: route-config entries carry `{route, type}`
 * and the other classes carry no route at all. `claim`, `contract`, `''` and `list` were attempted, in
 * that order; `invoices` and `guard-only` are named by entries of other classes, and a class that is
 * not a route-config load says nothing about what the router attempted.
 */
const NAVIGATION = {
  routerEvents: [
    { type: 'NavigationStart', at: 91.2, id: 3, url: '/claim' },
    { type: 'RouteConfigLoadStart', at: 120.4, route: 'claim' },
    { type: 'RouteConfigLoadEnd', at: 180.9, route: 'claim' },
    { type: 'GuardsCheckStart', at: 200.1, route: null },
    { type: 'RouteConfigLoadStart', at: 210.7, route: 'contract' },
    { type: 'RouteConfigLoadEnd', at: 246.3, route: 'contract' },
    { type: 'RouteConfigLoadStart', at: 250.1, route: '' },
    { type: 'RouteConfigLoadEnd', at: 265.8, route: '' },
    { type: 'RouteConfigLoadStart', at: 300.2, route: 'list' },
    { type: 'RouteConfigLoadEnd', at: 337.8, route: 'list' },
    {
      type: 'NavigationError',
      at: 352.4,
      id: 3,
      url: '/claim',
      error: { name: 'TypeError', message: 'dynamic import failed' },
    },
    null,
    'not an event',
  ],
};

/**
 * The eight attempts, each with the exact answer the contract requires: the state, the fields the
 * attempt's own record carried, and — for a `never-completed` attempt — the one reason it names. The
 * expected answers state no `consideredCount`, because a single attempt is one attempt and says so by
 * carrying no count.
 */
const SAMPLES = [
  {
    what: 'a failed import whose response arrived',
    attempt: ATTEMPT_CLAIM_404,
    answer: {
      state: 'missing-import',
      specifier: './chunk-claim-4f2a.js',
      routePath: 'claim',
      status: 404,
    },
  },
  {
    what: 'a second failed import of the same navigation',
    attempt: ATTEMPT_CONTRACT_500,
    answer: {
      state: 'missing-import',
      specifier: './chunk-contract-7b31.js',
      routePath: 'contract',
      status: 500,
    },
  },
  {
    what: 'a failed import whose request produced no response',
    attempt: ATTEMPT_NEVER_COMPLETED,
    answer: {
      state: 'never-completed',
      specifier: './chunk-contract-7b31.js',
      routePath: 'contract',
      reason: 'no-response',
    },
  },
  {
    what: 'a resolved import carrying a truncated hash',
    attempt: ATTEMPT_RESOLVED,
    answer: {
      state: 'resolved',
      specifier: './chunk-list-91bd.js',
      routePath: 'list',
      status: 200,
      hash: 'sha256-2c9f57a1d0e64b18',
    },
  },
  {
    what: 'a resolved import whose componentless route path is empty',
    attempt: ATTEMPT_RESOLVED_WITHOUT_HASH,
    answer: {
      state: 'resolved',
      specifier: './chunk-list-91bd.js',
      routePath: '',
      status: 200,
    },
  },
  {
    what: 'an attempt the record does not say failed',
    attempt: ATTEMPT_OUTCOME_ABSENT,
    answer: { state: 'cannot-tell', reason: 'outcome-not-recorded' },
  },
  {
    what: 'a failed attempt that names no specifier',
    attempt: ATTEMPT_SPECIFIER_ABSENT,
    answer: { state: 'cannot-tell', reason: 'specifier-not-recorded' },
  },
  {
    what: 'a failure on a route the router never attempted',
    attempt: ATTEMPT_UNATTEMPTED_ROUTE,
    answer: {
      state: 'missing-import',
      specifier: './chunk-claims-3a1c.js',
      status: 503,
    },
  },
];

/** The answers of one navigation that failed twice, in the order the router attempted them. */
const TWO_FAILURES = [ATTEMPT_CLAIM_404, ATTEMPT_CONTRACT_500];

/** One answer, read through the module in a bare context. @param {unknown} record */
function answerOf(record, navigation) {
  return host(BARE_API.chunkFailure(record, navigation));
}

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
 * The pin one answer is held to, and the same pin every mutant below is run through. It states the
 * field that moved in its own message, which is what makes a mutant's failure legible.
 * @param {Record<string, unknown>} written
 * @param {Record<string, unknown>} expected
 * @param {string} what
 */
function assertAnswer(written, expected, what) {
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

  // 2. The state the record warrants, and never one it does not: a loaded import is a resolution, a
  // failed one is a failure only where a response arrived, and the rest are the named absences.
  assert.equal(
    written.state,
    expected.state,
    `${what} states \`state\` ${JSON.stringify(written.state)}, and the record warrants ${JSON.stringify(expected.state)}: a loaded import is \`resolved\`, a failed one is \`missing-import\` only where a response arrived, and a record that does not say what the import returned is \`cannot-tell\``,
  );

  // 3. Every field the record produced is present and is that value, and no field it did not produce
  // is present at all — not null, not a placeholder, not a value lent by another attempt.
  for (const key of ['specifier', 'routePath', 'status', 'hash', 'reason']) {
    if (key in expected) {
      assert.ok(
        key in written,
        `${what} must carry \`${key}\` ${JSON.stringify(expected[key])}, the value the record produced, and it carries no \`${key}\` at all`,
      );
      assert.equal(
        written[key],
        expected[key],
        `${what} states \`${key}\` ${JSON.stringify(written[key])}, and the record produced ${JSON.stringify(expected[key])}`,
      );
    } else {
      assert.ok(
        !(key in written),
        `${what} carries \`${key}\` ${JSON.stringify(written[key])}, and the record produced no \`${key}\`: a field the record does not carry is absent, not null and never filled from anything else`,
      );
    }
  }

  // 4. The count a list states, and never the count a single attempt has not walked.
  if ('consideredCount' in expected) {
    assert.equal(
      written.consideredCount,
      expected.consideredCount,
      `${what} states \`consideredCount\` ${JSON.stringify(written.consideredCount)}, and it walked ${String(expected.consideredCount)} attempt(s)`,
    );
  } else {
    assert.ok(
      !('consideredCount' in written),
      `${what} carries \`consideredCount\` ${JSON.stringify(written.consideredCount)}, and a single attempt is one attempt and says so by carrying no count`,
    );
  }

  // 5. A reason is a token from the closed set, and only a cannot-tell or a never-completed names one.
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
      `${what} is cannot-tell and states no \`reason\`, so the absence it reports is unreadable`,
    );
  }

  // 6. Nothing that reads as a cause, a remedy or a version drift.
  assertNamesNoCause(written, what);

  // 7. Every field present is a value, not a placeholder: no null survives the join.
  for (const key of Object.keys(written)) {
    assert.notEqual(
      written[key],
      null,
      `${what} carries \`${key}\` as null, so the field is present and empty rather than absent`,
    );
  }
}

/**
 * The pin one answer or one list of answers is held to. A list is pinned row by row, so a row that
 * was collapsed onto its neighbour is named by the field that moved on that row.
 * @param {unknown} written
 * @param {unknown} expected
 * @param {string} what
 */
function assertAnswerish(written, expected, what) {
  if (Array.isArray(expected)) {
    assert.ok(
      Array.isArray(written),
      `${what} must answer one answer per attempt of a list, and it answered ${JSON.stringify(written)}`,
    );
    assert.equal(
      written.length,
      expected.length,
      `${what} must answer one answer per attempt, ${String(expected.length)} of them, and it answered ${String(written.length)}: no attempt is dropped and none stands in for another`,
    );
    for (let index = 0; index < expected.length; index += 1) {
      assertAnswer(
        /** @type {Record<string, unknown>} */ (written[index]),
        expected[index],
        `${what} row ${String(index)}`,
      );
    }
    return;
  }
  assertAnswer(
    /** @type {Record<string, unknown>} */ (written),
    /** @type {Record<string, unknown>} */ (expected),
    what,
  );
}

/** One answer's expected shape, with the count a list adds. @param {Record<string, unknown>} answer */
function countedAnswer(answer, consideredCount) {
  const written = {};
  for (const key of ['state', 'specifier', 'routePath', 'status', 'hash']) {
    if (key in answer) written[key] = answer[key];
  }
  written.consideredCount = consideredCount;
  if ('reason' in answer) written.reason = answer.reason;
  return written;
}

// ------------------------------------------------------------------- mutants ----

/**
 * The eight mutants, each one edit of the shipped source applied in memory. `defect` is the word the
 * failing pin must be shown to name — the field or the string that moved — and `record` is the
 * fixture the defect is visible on.
 */
const MUTATIONS = [
  {
    id: 'status-worsened-into-missing-import',
    defect: 'state',
    what: 'a stub that reads a status as a verdict',
    record: ATTEMPT_OUTCOME_ABSENT,
    navigation: NAVIGATION,
    expected: SAMPLES[5].answer,
    anchor: '    if (entry.outcome !== FAILED) return CANNOT_TELL;',
    replacement:
      '    if (entry.outcome !== FAILED) {\n' +
      '      return entry.status !== null && entry.status >= 400\n' +
      '        ? MISSING_IMPORT\n' +
      '        : CANNOT_TELL;\n' +
      '    }',
  },
  {
    id: 'version-drift-from-status',
    defect: 'versionDrift',
    what: 'a stub that names a drift from a status',
    record: ATTEMPT_CLAIM_404,
    navigation: NAVIGATION,
    expected: SAMPLES[0].answer,
    anchor: '    if (state === NEVER_COMPLETED) written.reason = NO_RESPONSE;',
    replacement:
      '    if (state === NEVER_COMPLETED) written.reason = NO_RESPONSE;\n' +
      "    if (entry.status === 404) written.versionDrift = 'angular-version-mismatch';",
  },
  {
    id: 'remedy-added',
    defect: 'remedy',
    what: 'a stub that offers a remedy',
    record: ATTEMPT_SPECIFIER_ABSENT,
    navigation: NAVIGATION,
    expected: SAMPLES[6].answer,
    anchor: '    return { state: CANNOT_TELL, reason: reason };',
    replacement:
      "    return { state: CANNOT_TELL, reason: reason, remedy: 'reload the page' };",
  },
  {
    id: 'cause-added',
    defect: 'cause',
    what: 'a stub that names a cause',
    record: ATTEMPT_NEVER_COMPLETED,
    navigation: NAVIGATION,
    expected: SAMPLES[2].answer,
    anchor: "    put(written, 'hash', entry.hash);",
    replacement:
      "    put(written, 'hash', entry.hash);\n" +
      "    if (state === NEVER_COMPLETED) written.cause = 'the request never arrived';",
  },
  {
    id: 'hash-from-chunk-name',
    defect: 'hash',
    what: 'a stub that completes a truncated hash from the filename',
    record: ATTEMPT_RESOLVED,
    navigation: NAVIGATION,
    expected: SAMPLES[3].answer,
    anchor:
      "    put(written, 'status', entry.status);\n    put(written, 'hash', entry.hash);",
    replacement:
      "    put(written, 'status', entry.status);\n" +
      "    put(written, 'hash', entry.hash);\n" +
      '    if (entry.hash !== null) {\n' +
      "      written.hash = entry.specifier.split('/').pop();\n" +
      '    }',
  },
  {
    id: 'last-failure-collapsed',
    defect: 'specifier',
    what: 'a stub that collapses one navigation to its last failure',
    record: TWO_FAILURES,
    navigation: NAVIGATION,
    expected: [
      countedAnswer(SAMPLES[0].answer, 2),
      countedAnswer(SAMPLES[1].answer, 2),
    ],
    anchor: '    return answers;',
    replacement:
      '    return answers.map(function () {\n' +
      '      return answers[answers.length - 1];\n' +
      '    });',
  },
  {
    id: 'unattempted-route-named',
    defect: 'routePath',
    what: 'a stub that attributes a failure to a route the router never attempted',
    record: ATTEMPT_UNATTEMPTED_ROUTE,
    navigation: NAVIGATION,
    expected: SAMPLES[7].answer,
    anchor:
      '    return attempted.indexOf(routePath) === -1 ? null : routePath;',
    replacement: '    return routePath;',
  },
  {
    id: 'resolved-reported-as-failure',
    defect: 'resolved',
    what: 'a stub that reports a loaded import as a failure',
    record: ATTEMPT_RESOLVED,
    navigation: NAVIGATION,
    expected: SAMPLES[3].answer,
    anchor: '    if (entry.outcome === LOADED) return RESOLVED;',
    replacement: '    if (entry.outcome === LOADED) return MISSING_IMPORT;',
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

// --------------------------------------------------------------------- tests ----

test('the module runs in a bare context and publishes one join and the closed sets it writes', () => {
  const context = createContext({});
  runInContext(MODULE_SOURCE, context, { filename: MODULE_REL });
  const api = context[NAMESPACE];
  assert.ok(
    api,
    `${MODULE_REL} must publish ${NAMESPACE} on the global object of whatever world it runs in`,
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
      'chunkFailure',
    ],
    `the namespace must be one join and the closed sets it writes, and it published ${JSON.stringify(Object.keys(api).sort())}`,
  );
  assert.equal(
    typeof api.chunkFailure,
    'function',
    'the namespace must publish one function, and the join is it',
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

  // A second run in the same world republishes in place, so a caller's reference stays valid.
  const before = api;
  runInContext(MODULE_SOURCE, context, { filename: MODULE_REL });
  assert.equal(
    context[NAMESPACE],
    before,
    'a second run in the same world must republish in place, so a caller\u2019s reference stays valid',
  );
});

test('the module reads no page, no clock, no network and no extension API', () => {
  const { calls } = loadWithProbes();
  assert.deepEqual(
    calls,
    [],
    `the module must read neither a page nor a clock nor a request while it loads: it touched ${JSON.stringify(calls)}`,
  );
  const used = answerOf(ATTEMPT_CLAIM_404, NAVIGATION);
  assert.equal(
    used.state,
    'missing-import',
    'the module must answer in a probed world',
  );
  assert.deepEqual(
    calls,
    [],
    `the module must read neither a page nor a clock nor a request while it joins: it touched ${JSON.stringify(calls)}`,
  );

  // The source's own words, with its comments dropped: it imports nothing, wraps no `import()` and
  // opens no request of its own — it joins what the caller's tap wrote down.
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
      `${MODULE_REL} must not name ${JSON.stringify(token)} in its code: it is one pure function, and it reads nothing but the records it is handed`,
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

test('the join and the record read one list of fields, and the record module publishes it', () => {
  // The record's fields and this join's inputs are the same list, asserted in one place (INTENT SC3).
  assert.deepEqual(
    ATTEMPT_FIELDS,
    host(RECORD_API.ATTEMPT_FIELDS),
    `${MODULE_REL} must read exactly the attempt fields ${RECORD_MODULE_REL} writes`,
  );
  assert.deepEqual(
    STATES,
    host(RECORD_API.STATES),
    `${MODULE_REL} must answer in exactly the four states ${RECORD_MODULE_REL} publishes`,
  );
  assert.deepEqual(
    REASONS,
    host(RECORD_API.REASONS),
    `${MODULE_REL} must name exactly the absences ${RECORD_MODULE_REL} publishes`,
  );
  assert.deepEqual(
    FIELDS,
    host(RECORD_API.FIELDS),
    `${MODULE_REL} must answer in exactly the interface ${RECORD_MODULE_REL} states`,
  );
  assert.deepEqual(
    OUTCOMES,
    host(RECORD_API.OUTCOMES),
    `${MODULE_REL} must read exactly the outcomes ${RECORD_MODULE_REL} records`,
  );

  // The record the record module publishes states the same interface, so a reader and this module
  // cannot drift apart silently.
  const recorded = JSON.parse(read(RECORD_REL));
  assert.deepEqual(
    recorded.interface.fields,
    FIELDS,
    `${RECORD_REL} must state the interface this join answers in`,
  );
  assert.deepEqual(
    recorded.interface.reasons,
    REASONS,
    `${RECORD_REL} must state the absences this join names`,
  );
  assert.deepEqual(
    recorded.interface.attemptFields,
    ATTEMPT_FIELDS,
    `${RECORD_REL} must state the attempt fields this join reads`,
  );
  assert.deepEqual(
    recorded.interface.outcomes,
    OUTCOMES,
    `${RECORD_REL} must state the outcomes this join reads`,
  );

  // The join reproduces every answer the record published for its six attempts: one vocabulary, one
  // set of answers, two modules.
  assert.equal(
    recorded.samples.length,
    6,
    'the record must carry the six attempt samples this pin walks',
  );
  for (const sample of recorded.samples) {
    assert.deepEqual(
      answerOf(sample.attempt),
      sample.answer,
      `the join must answer the record's own sample ${JSON.stringify(sample.attempt)} with the answer the record published, and it answered ${JSON.stringify(answerOf(sample.attempt))}`,
    );
  }
});

test('the route paths this join reads are the ones the router\u2019s own stream names', () => {
  // `extension/navigation-narrator.js:16` states that the two route-config classes carry
  // `{route, type}` and no navigation id, and that the loads are told apart by `route.path`.
  const narratorLine = read(NARRATOR_REL).split(/\r?\n/)[15] ?? '';
  assert.ok(
    narratorLine.includes('{route, type}'),
    `${NARRATOR_REL}:16 must still state that the route-config payloads carry {route, type}, and it reads ${JSON.stringify(narratorLine)}`,
  );
  for (const className of ['RouteConfigLoadStart', 'RouteConfigLoadEnd']) {
    assert.ok(
      read(NARRATOR_REL).includes(className),
      `${NARRATOR_REL} must still name ${className}, or the classes this join reads are ones the stream never recorded`,
    );
  }

  // `extension/agent-main.js:1642` writes the event's route as `routerRoutePathOf(event)`, which
  // answers the route config's own `path` when it is a string and null otherwise.
  const agent = read(AGENT_REL).split(/\r?\n/);
  assert.ok(
    (agent[1641] ?? '').includes('route: routerRoutePathOf(event)'),
    `${AGENT_REL}:1642 must still write the route as routerRoutePathOf(event), and it reads ${JSON.stringify(agent[1641] ?? '')}`,
  );
  const pathOf = agent.slice(1526, 1537).join('\n');
  assert.ok(
    pathOf.includes('route.path'),
    `${AGENT_REL}:1527-1537 must still answer the route config's own path, and it reads ${JSON.stringify(pathOf.slice(0, 240))}`,
  );
  assert.ok(
    pathOf.includes("typeof path === 'string' ? path : null"),
    `${AGENT_REL}:1536 must still answer null for a route whose path is not a string, or this join's string test is a second rule nobody measured`,
  );
});

test('SC1 - each of the four states is produced by its own input', () => {
  const reached = new Set();
  for (const sample of SAMPLES) {
    const written = answerOf(sample.attempt, NAVIGATION);
    assert.deepEqual(
      written,
      sample.answer,
      `the answer for ${sample.what} must be the record it warrants, and it answered ${JSON.stringify(written)}`,
    );
    assert.deepEqual(
      Object.keys(written),
      Object.keys(sample.answer),
      `the answer for ${sample.what} must state exactly the fields the record produced, in the interface's order`,
    );
    assertAnswer(written, sample.answer, `the answer for ${sample.what}`);
    reached.add(written.state);
  }
  assert.deepEqual(
    [...reached].sort(),
    [...STATES].sort(),
    `the eight fixtures must reach every one of the four states, and they reached ${JSON.stringify([...reached].sort())}`,
  );

  // Every field an answer states is one the interface names, over every fixture that answered.
  const stated = new Set();
  for (const sample of SAMPLES) {
    for (const key of Object.keys(answerOf(sample.attempt, NAVIGATION))) {
      stated.add(key);
    }
  }
  for (const key of stated) {
    assert.ok(
      FIELDS.includes(key),
      `every field an answer states must be one of the interface's fields, and ${JSON.stringify(key)} is not`,
    );
  }
  assert.deepEqual(
    [...stated].sort(),
    [...FIELDS.filter((field) => field !== 'consideredCount')].sort(),
    `the fixtures must reach every field of the interface except \`consideredCount\`, which only a list states; they reached ${JSON.stringify([...stated].sort())}`,
  );
});

test('SC1 - a failed import answers the status it produced, and a truncated hash stays truncated', () => {
  const written = answerOf(ATTEMPT_CLAIM_404, NAVIGATION);
  assert.deepEqual(
    written,
    {
      state: 'missing-import',
      specifier: './chunk-claim-4f2a.js',
      routePath: 'claim',
      status: 404,
    },
    'a failed import whose response arrived answers the specifier, the owning route path and the status',
  );
  assert.ok(
    !('hash' in written),
    'the answer must carry no `hash`: the attempt recorded none, and its chunk filename is not one',
  );
  assert.ok(
    !('reason' in written),
    'a missing import that has a status must not also name a reason: the two are different records',
  );

  // The hash the record carried is the hash the answer states, character for character — a value the
  // record truncated is reported truncated and never completed from the chunk's filename (E4).
  const resolved = answerOf(ATTEMPT_RESOLVED, NAVIGATION);
  assert.equal(
    resolved.hash,
    ATTEMPT_RESOLVED.hash,
    'the hash must be the record\u2019s own, so a truncated hash is reported truncated',
  );
  const filename = ATTEMPT_RESOLVED.specifier.split('/').pop();
  assert.notEqual(
    resolved.hash,
    filename,
    'a hash must never be the chunk filename the specifier names',
  );
  assert.ok(
    !resolved.hash.includes(filename),
    `the hash must not be completed from the chunk filename: it reads ${JSON.stringify(resolved.hash)}`,
  );
});

test('SC2 - a request that produced no status is never-completed, and is never written as a 404', () => {
  const written = answerOf(ATTEMPT_NEVER_COMPLETED, NAVIGATION);
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
  assert.ok(
    !('status' in written),
    'no `status` may be reported where no response arrived: 404 is a measurement, not a default',
  );
  assert.ok(
    !JSON.stringify(written).includes('404'),
    `the answer must name no 404 anywhere: it reads ${JSON.stringify(written)}`,
  );
  assert.equal(
    written.reason,
    'no-response',
    'the never-completed answer names the one fact it knows',
  );
});

test('SC1 - a resolved import reports no failure, and the absence of a hash as absent', () => {
  const written = answerOf(ATTEMPT_RESOLVED, NAVIGATION);
  assert.deepEqual(
    written,
    {
      state: 'resolved',
      specifier: './chunk-list-91bd.js',
      routePath: 'list',
      status: 200,
      hash: 'sha256-2c9f57a1d0e64b18',
    },
    'a resolved import is reported as resolved, not omitted and not as an empty failure',
  );

  const withoutHash = answerOf(ATTEMPT_RESOLVED_WITHOUT_HASH, NAVIGATION);
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

  // A resolution is not a failure and carries no reason: an empty failure that reads as a success is
  // exactly what this state exists to prevent (E1).
  for (const answer of [written, withoutHash]) {
    assert.ok(
      !('reason' in answer),
      `a resolved import must name no \`reason\`: it reads ${JSON.stringify(answer)}`,
    );
  }
});

test('SC2 - a record that does not say what the import returned is cannot-tell, never a failure', () => {
  const noOutcome = answerOf(ATTEMPT_OUTCOME_ABSENT, NAVIGATION);
  assert.deepEqual(
    noOutcome,
    { state: 'cannot-tell', reason: 'outcome-not-recorded' },
    'an attempt whose record does not say what it returned is not called a failure, however bad its status looks',
  );
  assertAnswer(noOutcome, SAMPLES[5].answer, 'the outcome-not-recorded answer');

  const noSpecifier = answerOf(ATTEMPT_SPECIFIER_ABSENT, NAVIGATION);
  assert.deepEqual(
    noSpecifier,
    { state: 'cannot-tell', reason: 'specifier-not-recorded' },
    'a failed attempt that names no specifier has no missing import to name',
  );
  assertAnswer(
    noSpecifier,
    SAMPLES[6].answer,
    'the specifier-not-recorded answer',
  );

  // A value that is not an attempt record at all is a different answer from one that says nothing.
  for (const value of [null, undefined, 'claim', 42, {}]) {
    assert.deepEqual(
      answerOf(value, NAVIGATION),
      { state: 'cannot-tell', reason: 'record-unreadable' },
      `${JSON.stringify(value)} is not an attempt record, so the answer is record-unreadable`,
    );
  }

  // A status is never a verdict: a 500 response on an attempt the record does not call failed stays a
  // named absence, and no drift, cause or remedy is named from it.
  assertNamesNoCause(noOutcome, 'the outcome-not-recorded answer');
  assert.ok(
    !JSON.stringify(noOutcome).includes('500'),
    'the answer must not state the status of an attempt it cannot read as a failure',
  );
});

test('SC1 - both failures of one navigation are named, in the order the router attempted them', () => {
  const answers = answerOf(TWO_FAILURES, NAVIGATION);
  assert.equal(
    answers.length,
    2,
    'two failed imports of one navigation are two answers, and one of them was dropped',
  );
  assert.deepEqual(
    answers.map((answer) => answer.state),
    ['missing-import', 'missing-import'],
    'both failures of one navigation are missing imports',
  );
  assert.deepEqual(
    answers.map((answer) => answer.specifier),
    ['./chunk-claim-4f2a.js', './chunk-contract-7b31.js'],
    'both failures must be named by their own `specifier`, in the order the router attempted them, and never collapsed to the last',
  );
  assert.deepEqual(
    answers.map((answer) => answer.routePath),
    ['claim', 'contract'],
    'both failures must be attributed to their own `routePath`, in router order',
  );
  assert.deepEqual(
    answers.map((answer) => answer.status),
    [404, 500],
    'both failures must state their own `status`: no answer is lent a neighbour\u2019s response',
  );
  assert.deepEqual(
    answers.map((answer) => answer.consideredCount),
    [2, 2],
    'each answer of a list states the `consideredCount` it walked',
  );

  // The record the record module writes answers the same two, in the same order, when it is handed
  // over as the list it carries.
  assert.deepEqual(
    answerOf({ importAttempts: TWO_FAILURES }, NAVIGATION),
    answers,
    'the record\u2019s own `importAttempts` list must answer exactly as the bare list does',
  );

  // Joining one attempt at a time answers the same two answers, in the same order, with the count a
  // single attempt does not carry.
  const oneAtATime = TWO_FAILURES.map((attempt) =>
    answerOf(attempt, NAVIGATION),
  );
  assert.deepEqual(
    oneAtATime,
    answers.map((answer) => {
      const without = { ...answer };
      delete without.consideredCount;
      return without;
    }),
    'joining each attempt of the navigation answers the same answers the list does, in the same order',
  );

  // The order is the record's, not a ranking: a list that holds the failures the other way round
  // answers them the other way round.
  const reversed = answerOf(
    [ATTEMPT_CONTRACT_500, ATTEMPT_CLAIM_404],
    NAVIGATION,
  );
  assert.deepEqual(
    reversed.map((answer) => answer.routePath),
    ['contract', 'claim'],
    'the join must keep the order it was handed, and it re-sorted the answers',
  );
});

test('SC1 - a failure attributed to a route the router never attempted is refused', () => {
  const written = answerOf(ATTEMPT_UNATTEMPTED_ROUTE, NAVIGATION);
  assert.deepEqual(
    written,
    {
      state: 'missing-import',
      specifier: './chunk-claims-3a1c.js',
      status: 503,
    },
    'a failure on a route the router never attempted keeps the failure it states and drops the attribution it cannot',
  );
  assert.ok(
    !('routePath' in written),
    'the answer must carry no `routePath`: `invoices` is not a route the router attempted, and the join must not report the failure as that route\u2019s',
  );
  assert.ok(
    !JSON.stringify(written).includes('invoices'),
    `the answer must name no route the router never attempted: it reads ${JSON.stringify(written)}`,
  );
  assertAnswer(written, SAMPLES[7].answer, 'the unattributed answer');

  // The same record, with a stream that names the route: the attribution is admitted and carried.
  const attempted = {
    routerEvents: [
      { at: 12.5, route: 'invoices', type: 'RouteConfigLoadStart' },
    ],
  };
  assert.equal(
    answerOf(ATTEMPT_UNATTEMPTED_ROUTE, attempted).routePath,
    'invoices',
    'a route path the router did attempt must be carried as the record stated it',
  );

  // The join reads `RouteConfigLoadStart` and `RouteConfigLoadEnd` and no other class: a guard or a
  // resolve entry naming a path says nothing about what the router attempted.
  const otherClasses = {
    routerEvents: [
      { route: 'invoices', type: 'GuardsCheckEnd' },
      { route: 'invoices', type: 'ResolveStart' },
      { route: 42, type: 'RouteConfigLoadStart' },
      { route: null, type: 'RouteConfigLoadEnd' },
      null,
      'not an event',
    ],
  };
  assert.ok(
    !('routePath' in answerOf(ATTEMPT_UNATTEMPTED_ROUTE, otherClasses)),
    'only a route-config load names an attempted route: a guard, a resolve, a non-string path and an entry that is not an event must not admit one',
  );

  // An empty stream attempted nothing, so nothing is attributed; and with no stream handed over there
  // is nothing to compare against, so the record's own path is carried as the record's statement.
  assert.ok(
    !('routePath' in answerOf(ATTEMPT_UNATTEMPTED_ROUTE, { routerEvents: [] })),
    'an empty router stream attempted no route, so no `routePath` may be attributed from it',
  );
  assert.equal(
    answerOf(ATTEMPT_UNATTEMPTED_ROUTE).routePath,
    'invoices',
    'with no router stream handed over, the record\u2019s own `routePath` is carried as the record\u2019s own statement',
  );
  assert.equal(
    answerOf(ATTEMPT_CLAIM_404, { routerEvents: [] }).routePath,
    undefined,
    'a stream that attempted nothing refuses every attribution, including one the record states',
  );
});

test('a record that holds no attempt answers no-import-recorded rather than a clean stream', () => {
  for (const empty of [[], { importAttempts: [] }]) {
    const answers = answerOf(empty, NAVIGATION);
    assert.deepEqual(
      answers,
      [
        {
          state: 'cannot-tell',
          consideredCount: 0,
          reason: 'no-import-recorded',
        },
      ],
      `a record holding no attempt (${JSON.stringify(empty)}) must answer no-import-recorded with a count of zero, not an empty list that reads as a clean stream`,
    );
    assertAnswer(
      answers[0],
      {
        state: 'cannot-tell',
        consideredCount: 0,
        reason: 'no-import-recorded',
      },
      'the no-import-recorded answer',
    );
  }

  // An unreadable entry is answered in its own row, counted among the attempts walked, and never
  // dropped and never lent a neighbour's fields.
  const mixed = answerOf([ATTEMPT_CLAIM_404, 'not an attempt'], NAVIGATION);
  assert.equal(
    mixed.length,
    2,
    'an unreadable entry is one row of the answer, not a row that disappears',
  );
  assert.equal(
    mixed[0].state,
    'missing-import',
    'the readable entry keeps the failure it states',
  );
  assert.deepEqual(
    mixed[1],
    {
      state: 'cannot-tell',
      consideredCount: 2,
      reason: 'record-unreadable',
    },
    'the unreadable entry answers record-unreadable in its own row, with the count the list walked',
  );
});

test('the join writes nothing into the records it is handed and answers the same bytes twice', () => {
  const record = {
    importAttempts: [ATTEMPT_CLAIM_404, ATTEMPT_NEVER_COMPLETED],
  };
  const navigation = { routerEvents: NAVIGATION.routerEvents.slice() };
  const frozenRecord = JSON.parse(JSON.stringify(record));
  const frozenNavigation = JSON.parse(JSON.stringify(navigation));
  const first = answerOf(record, navigation);
  const second = answerOf(record, navigation);
  assert.deepEqual(first, second, 'the join holds no state between calls');
  assert.deepEqual(
    record,
    frozenRecord,
    'the join must not write into the record it was handed',
  );
  assert.deepEqual(
    navigation,
    frozenNavigation,
    'the join must not write into the router stream it was handed',
  );

  // The answers are copies: an edit to what a caller was handed does not reach the record.
  first[0].state = 'resolved';
  assert.equal(
    answerOf(record, navigation)[0].state,
    'missing-import',
    'a caller editing an answer must not rewrite the record it was read from',
  );

  // A frozen record answers as well as an unfrozen one: nothing here assigns to what it reads.
  const frozen = Object.freeze({ ...ATTEMPT_CLAIM_404 });
  const frozenAnswer = answerOf(
    frozen,
    Object.freeze({
      routerEvents: Object.freeze([
        { type: 'RouteConfigLoadStart', route: 'claim' },
      ]),
    }),
  );
  assert.equal(
    frozenAnswer.state,
    'missing-import',
    'a frozen attempt record must answer as an unfrozen one does',
  );
});

test('the eight mutant anchors are each one place in the shipped source, and each really changes it', () => {
  assert.equal(
    MUTATIONS.length,
    8,
    'the battery carries the eight defects this task names',
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
      FIELDS.includes(mutation.defect) ||
        ['versionDrift', 'cause', 'remedy', 'resolved'].includes(
          mutation.defect,
        ),
      `mutation ${mutation.id} must name a field of the interface or the string it invents, and it names ${JSON.stringify(mutation.defect)}`,
    );
    assert.equal(
      typeof mutation.what,
      'string',
      `mutation ${mutation.id} must say what defect it is`,
    );
  }
  assert.deepEqual(
    MUTATIONS.map((mutation) => mutation.id),
    [
      'status-worsened-into-missing-import',
      'version-drift-from-status',
      'remedy-added',
      'cause-added',
      'hash-from-chunk-name',
      'last-failure-collapsed',
      'unattempted-route-named',
      'resolved-reported-as-failure',
    ],
    'the battery is the eight defects the brief names, in its own order',
  );
});

test('each of the eight mutants reddens the same pin the shipped source passes, naming what moved', () => {
  const lines = [];
  for (const mutation of MUTATIONS) {
    const source = mutated(MODULE_SOURCE, mutation);
    const mutant = shippedApi(source).chunkFailure;

    // The pin is green on the module as it sits on disk first, so a failure below is the mutation's
    // and not a pin that was already red.
    assertAnswerish(
      answerOf(mutation.record, mutation.navigation),
      mutation.expected,
      `the shipped module\u2019s answer (${mutation.id} premise)`,
    );

    // The mutant really moved the answer: an anchor that changed the source and nothing else would
    // leave this assertion failing rather than proving anything.
    const shipped = answerOf(mutation.record, mutation.navigation);
    const changed = host(mutant(mutation.record, mutation.navigation));
    assert.notDeepEqual(
      changed,
      shipped,
      `mutation ${mutation.id} (${mutation.what}) must change the answer the module writes, and it wrote the same answer`,
    );

    const failure = failureOf(() =>
      assertAnswerish(
        changed,
        mutation.expected,
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
  assert.equal(
    lines.length,
    8,
    'each of the eight mutants must be shown red by its own message',
  );
  console.log(`M064 chunk-failure mutants: ${lines.join(' || ')}`);
});

test('the assertions this file made are counted, so a test that measured nothing would show', () => {
  assert.ok(
    ASSERTIONS > 200,
    `this suite must make real assertions rather than declare tests: it made ${String(ASSERTIONS)}`,
  );
  console.log(
    `${SUITE_REL}: ${MODULE_REL} is ${String(MODULE_SOURCE.split(/\r?\n/).length)} lines, ` +
      `${String(STATES.length)} states, ${String(REASONS.length)} reasons, ` +
      `${String(SAMPLES.length)} attempt samples, ${String(MUTATIONS.length)} mutants, ` +
      `${String(ASSERTIONS)} assertions`,
  );
});
