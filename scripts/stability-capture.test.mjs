// @ts-check
//
// M043 T004 - the re-capture behind an opt-in switch, the two-page session, the claim list and the
// recording's bytes.
//
// Three things this suite owns that no earlier one could:
//
//   E11   Two pages, one session. `research/raw/m043-stability.json` measures the *mechanism* a
//         transition needs; it drives one subject at a time. SC6's failure mode is a property of two
//         subjects, so it is driven here: the shipped page agent is booted twice - two isolated page
//         realms in one process, each with its own `ng`, its own `document`, its own clock and its own
//         record - and one realm's last pending task ends after attach while the other's never does.
//         Each page must answer its own state and its own settle reading through the shipped join, and
//         no emission published on one page may reach the other's answer. The mutant that shares the
//         two pages' listener list is driven below and reddens the assertion that says so.
//         This is not two browser tabs: the realms are `node:vm` contexts, which is the two-page
//         session this repository can drive with no browser, no server and no port. SYNTHESIS names
//         that limit rather than letting the word "session" hide it.
//
//   claims `research/raw/m043-verdict-claims.json` rules SC1 to SC6, and each row quotes the intent
//         character for character. The quotation is held to the milestone's own intent with the
//         overlay suite's own `intentCriteria` routine - extracted from
//         `scripts/overlay-verdict-claims.test.mjs` and run here, so no criterion is retyped and the
//         two suites cannot drift apart - and a row that differs by one character reddens the row.
//
//   bytes  The recording is one tracked file four suites read, and a suite that rewrote it on every
//         `npm test` would move the working tree under a reviewer. So a default run is a read: it
//         prints the recording's sha256 before and after, asserts they are equal, and names every file
//         an armed run would write. `M043_CAPTURE=1` re-captures: T001's derivation - which owns every
//         section - is run twice at this head, and the second pass must change no byte.
//
// Read-only by default: no browser, no server, no port, no write. The armed path's only write is the
// armed measure suite's own, which is the file this suite names rather than writes.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createContext, runInContext } from 'node:vm';

import { intentPathForMilestone } from './verdict-claims-intent.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const SELF_PATH = fileURLToPath(import.meta.url);

const RECORD_PATH = join(ROOT, 'research', 'raw', 'm043-stability.json');
const CLAIMS_PATH = join(ROOT, 'research', 'raw', 'm043-verdict-claims.json');
const AGENT_PATH = join(ROOT, 'extension', 'agent-main.js');
const NARRATOR_PATH = join(ROOT, 'extension', 'stability-narrator.js');
const OVERLAY_PATH = join(ROOT, 'scripts', 'overlay-verdict-claims.test.mjs');
const MEASURE_SUITE = join(ROOT, 'scripts', 'stability-measure.test.mjs');

const MILESTONE = 'M043';
const RECORDED = 'research/raw/m043-stability.json';
const SCRIPT = 'scripts/stability-capture.test.mjs';

/** The one artefact an armed run writes, named here rather than written here. */
const WOULD_WRITE = [
  {
    path: RECORD_PATH,
    why: "T001's measurement, re-derived in place by the armed measure suite",
    command: `set "M043_CAPTURE=1"&& node --experimental-strip-types --test "scripts/stability-measure.test.mjs"`,
  },
];

/** The two page realms one session holds, each with its own clock so no reading can be borrowed. */
const PAGES = [
  { name: 'settling', clock: 1000, sync: [false], later: [true] },
  { name: 'never-settling', clock: 5000, sync: [false], later: [] },
];

// ---------------------------------------------------------------- helpers ----

/** @param {string} path @returns {string} */
function displayPath(path) {
  return relative(ROOT, path).split(sep).join('/');
}

/**
 * @param {string} path
 * @returns {string | null}
 */
function sha256Of(path) {
  return existsSync(path)
    ? createHash('sha256').update(readFileSync(path)).digest('hex')
    : null;
}

/** @param {string} message @returns {never} */
function fail(message) {
  throw new Error(message);
}

/** @param {unknown} value @returns {boolean} */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** @param {unknown} value @returns {boolean} */
function filled(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * @param {unknown} value
 * @returns {any}
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** @param {string} text @returns {string} */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * @param {unknown} record
 * @returns {string}
 */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/**
 * @param {string} path
 * @param {string} why
 * @returns {string}
 */
function readText(path, why) {
  if (!existsSync(path)) fail(`${displayPath(path)} is missing - ${why}`);
  return readFileSync(path, 'utf8');
}

/**
 * @param {string} path
 * @param {string} why
 * @returns {any}
 */
function readJson(path, why) {
  const text = stripBom(readText(path, why));
  try {
    return JSON.parse(text);
  } catch (error) {
    return fail(
      `${displayPath(path)} is not JSON (${error instanceof Error ? error.message : error})`,
    );
  }
}

/** The 1-indexed line numbers of a text that carry `needle`. @param {string} text @param {string} needle @returns {number[]} */
function linesHolding(text, needle) {
  const found = [];
  text.split(/\r?\n/).forEach((line, index) => {
    if (line.includes(needle)) found.push(index + 1);
  });
  return found;
}

/**
 * The source of one top-level `function name(...)` in a file, by brace matching, so a routine can be
 * run rather than copied.
 *
 * @param {string} path
 * @param {string} name
 * @returns {string}
 */
function routineSource(path, name) {
  const text = readFileSync(path, 'utf8');
  const at = text.indexOf(`function ${name}(`);
  if (at < 0) fail(`${displayPath(path)} declares no function ${name}`);
  let depth = 0;
  let opened = false;
  for (let index = at; index < text.length; index += 1) {
    const character = text[index];
    if (character === '{') {
      depth += 1;
      opened = true;
    } else if (character === '}') {
      depth -= 1;
      if (opened && depth === 0) return text.slice(at, index + 1);
    }
  }
  return fail(`${displayPath(path)}'s function ${name} never closes`);
}

// ------------------------------------------- the overlay suite's own parse ----

/**
 * The numbered success criteria of the milestone's intent, read by
 * `scripts/overlay-verdict-claims.test.mjs`'s own `intentCriteria` routine: the routine is taken out
 * of that file and run here with the globals it closes over. A copy would be a second definition, and
 * a second definition can drift from the one the gate compares against; this cannot.
 *
 * @param {string} path
 * @returns {Record<string, string>}
 */
function intentCriteria(path) {
  const build = new Function(
    'stripBom',
    'readFileSync',
    'assert',
    `return (${routineSource(OVERLAY_PATH, 'intentCriteria')});`,
  );
  return build(stripBom, readFileSync, assert)(path);
}

/** The milestone's own intent: the archive's copy once it is archived, the live file while it binds. */
function milestoneIntent() {
  return intentPathForMilestone(ROOT, MILESTONE);
}

// ------------------------------------------------------------- the claim list ----

/**
 * One claim list ruled against one set of criteria. Every row must name a criterion the intent
 * declares, quote it exactly, count its characters, name the artefact carrying it and the command
 * that proves it, and every criterion must be ruled by some row: a criterion left unruled is the
 * absence this list exists to name.
 *
 * @param {unknown} recording
 * @param {Record<string, string>} criteria
 * @returns {void}
 */
function checkClaims(recording, criteria) {
  if (!isObject(recording)) fail('the claim list is not one JSON object');
  if (recording.milestone !== MILESTONE) {
    fail(
      `the claim list names the milestone ${JSON.stringify(recording.milestone)} and this suite captures ${MILESTONE}`,
    );
  }
  const claims = recording.claims;

  if (!Array.isArray(claims) || claims.length === 0) {
    fail('the claim list carries no claims array');
  }

  /** @type {Set<string>} */
  const seen = new Set();

  for (const row of claims) {
    const id = isObject(row) ? row.criterion : null;

    if (typeof id !== 'string' || !Object.hasOwn(criteria, id)) {
      fail(`${JSON.stringify(id)} is not a criterion the intent declares`);
    }
    if (seen.has(id)) fail(`${id} is ruled more than once`);
    seen.add(id);

    if (row.criterionText !== criteria[id]) {
      fail(
        `${id} must quote the INTENT criterion character for character: the row reads ${JSON.stringify(row.criterionText)} and the intent reads ${JSON.stringify(criteria[id])}`,
      );
    }
    if (row.criterionCharacters !== String(criteria[id]).length) {
      fail(
        `${id} records ${JSON.stringify(row.criterionCharacters)} characters and the intent's text is ${String(criteria[id]).length}`,
      );
    }
    if (!filled(row.artefact)) fail(`${id} names no artefact carrying it`);
    if (!filled(row.proves)) fail(`${id} names no command that proves it`);
    assert.match(
      String(row.proves),
      /\b(node|npx|npm)\b/,
      `${id} must name the command that proves it`,
    );
    if (!['required', 'not-required'].includes(String(row.ruling))) {
      fail(`${id} must rule required or not-required`);
    }
    if (!filled(row.reason)) fail(`${id} states no reason`);

    if (row.ruling === 'not-required') {
      if (String(row.reason).trim().length < 60) {
        fail(
          `${id} must state why the charter's portal clause does not reach it`,
        );
      }
      assert.match(
        String(row.reason),
        /portal/i,
        `${id} must answer the charter's portal clause by name`,
      );
      continue;
    }

    if (!['insurance-portal', 'counter-fixture'].includes(String(row.source))) {
      fail(`${id} must name the insurance portal or the counter fixture`);
    }
    assert.match(
      String(row.sourcePage ?? ''),
      /^https?:\/\//,
      `${id} must name the page or route that produces its facts`,
    );
    for (const field of ['route', 'serve', 'driver', 'instance']) {
      if (!filled(row[field])) fail(`${id} must name its ${field}`);
    }
    assert.match(
      String(row.verdictPath ?? ''),
      /^\.project\/build\/verify\/[a-z0-9]+(-[a-z0-9]+)*\/verdict\.json$/,
      `${id} must name the verdict path the wave gate cites`,
    );
    if (!Array.isArray(row.readings) || row.readings.length === 0) {
      fail(`${id} must name the readings that produce its facts`);
    }
  }

  for (const id of Object.keys(criteria)) {
    if (!seen.has(id)) {
      fail(
        `${id} is declared by the intent and ruled by no row, which is the absence this list exists to name`,
      );
    }
  }
}

// ---------------------------------------------------- the recording's bytes ----

/**
 * The first byte at which a text stops being its own record's canonical serialisation, or -1.
 *
 * @param {string} text
 * @param {string} expected
 * @returns {number}
 */
function firstDrift(text, expected) {
  const limit = Math.min(text.length, expected.length);
  for (let index = 0; index < limit; index += 1) {
    if (text[index] !== expected[index]) return index;
  }
  return text.length === expected.length ? -1 : limit;
}

/**
 * Holds a recorded text to the canonical serialisation of the record it holds. A file that parses to
 * the right values but is not what its own derivation writes is a memory of an edit, and the next
 * armed run is the only thing that would notice.
 *
 * @param {string} text
 * @param {unknown} record
 * @returns {void}
 */
function checkCanonical(text, record) {
  const expected = canonical(record);
  const at = firstDrift(text, expected);

  if (at === -1) return;

  /** @param {string} source @returns {string} */
  const window = (source) =>
    JSON.stringify(source.slice(Math.max(0, at - 24), at + 24));

  fail(
    `the recording drifted from its canonical serialisation at byte ${at}: the file reads ${window(text)} and its own record serialises as ${window(expected)}`,
  );
}

// ------------------------------------------------- the two pages, one session ----

const AGENT_SOURCE = readText(
  AGENT_PATH,
  'the page agent is what records the stability section',
);

/** The instance a frame is driven for: an identity a `WeakMap` accepts as a key. */
const INSTANCE = { constructor: { name: 'Counter' } };

/**
 * One page realm: its own global object, its own `ng`, its own clock and its own record list, so two
 * of them in one process are two pages rather than one page read twice. Everything a page *is* comes
 * from this object and from the shipped agent's own source; nothing else differs between the boots.
 *
 * @param {{ name: string, clock: number, sync: boolean[], later: boolean[] }} shape
 * @param {boolean[] | null} sharedListeners a mutant's one listener list, shared by both pages
 * @returns {Record<string, any>}
 */
function bootPage(shape, sharedListeners) {
  /** @type {boolean[]} */
  const listeners = sharedListeners ?? [];
  const page = {
    name: shape.name,
    clock: shape.clock,
    /** The clock band this page's readings must fall in: no other page can produce one there. */
    band: [shape.clock, shape.clock + 999],
    dispatched: [],
    timers: [],
    queued: [],
    listeners,
    emitted: [],
  };

  const appRef = {
    constructor: { name: 'ApplicationRef' },
    get isStable() {
      return {
        /** @param {(value: boolean) => void} listener */
        subscribe(listener) {
          listeners.push(listener);
          for (const value of shape.sync) {
            page.emitted.push(value);
            listener(value);
          }
          return { unsubscribe() {} };
        },
      };
    },
  };
  const element = { tagName: 'APP-ROOT', __ngContext__: 0 };
  const environment = {
    records: [
      { token: { name: 'Router' } },
      { token: { name: 'ApplicationRef' } },
    ],
    /** @param {any} token */
    get: (token) =>
      isObject(token) && token.name === 'ApplicationRef' ? appRef : null,
  };
  const elementInjector = {
    records: [{ token: { name: 'ElementInjectorDependency' } }],
    get: () => null,
  };
  const ng = {
    VERSION: { full: '22.2.2', major: 22, minor: 2, patch: 2 },
    ɵsetProfiler() {
      return () => {};
    },
    ɵgetSignalGraph: () => ({
      nodes: [{ id: 'n0', kind: 'template', label: 'app', epoch: 1 }],
      edges: [],
    }),
    getHostElement: () => ({ tagName: 'APP-ROOT' }),
    getDirectiveMetadata: () => ({ changeDetection: 1 }),
    getComponent: () => ({ constructor: { name: 'Counter' } }),
    getInjector: () => elementInjector,
    ɵgetInjectorResolutionPath: () => [elementInjector, environment],
    ɵgetInjectorProviders: (/** @type {any} */ entry) =>
      entry ? entry.records : null,
  };

  const sandbox = {
    ng,
    /** @param {string} type @param {any} init */
    CustomEvent: function (type, init) {
      return { type, detail: init && init.detail };
    },
    /** @param {any} event */
    dispatchEvent: (event) => {
      page.dispatched.push(event);
    },
    performance: { now: () => (page.clock += 1) },
    /** @param {() => void} callback */
    queueMicrotask: (callback) => {
      page.queued.push(callback);
    },
    /** @param {() => void} fn */
    setTimeout: (fn) => {
      page.timers.push({ fn });
      return page.timers.length;
    },
    clearTimeout: () => {},
    /** @param {() => void} fn */
    setInterval: (fn) => {
      page.timers.push({ fn });
      return page.timers.length;
    },
    clearInterval: () => {},
    document: {
      activeElement: null,
      body: element,
      documentElement: element,
      /** @param {string} selector */
      querySelector: (selector) => (selector === 'app-root' ? element : null),
      querySelectorAll: () => [element],
    },
  };

  const context = createContext(sandbox);
  runInContext(AGENT_SOURCE, context, { filename: 'agent-main.js' });

  const recorder = context.__ngRecorder;
  if (recorder === undefined) {
    fail('extension/agent-main.js published no `__ngRecorder` handle');
  }
  const subscriber = recorder.getSubscriber();
  if (typeof subscriber !== 'function') {
    fail('extension/agent-main.js installed no profiler subscriber');
  }

  page.records = () =>
    page.dispatched.filter(
      (/** @type {any} */ event) => event.type === 'angular-ai:record',
    );
  page.drain = () => {
    while (page.queued.length > 0) {
      const run = /** @type {() => void} */ (page.queued.shift());
      run();
    }
  };
  /** The install path's own initial snapshot, run now. */
  page.snapshot = () => {
    while (page.timers.length > 0) {
      const timer = /** @type {{ fn: () => void }} */ (page.timers.shift());
      timer.fn();
    }
    page.drain();
    return page.records().at(-1) ?? null;
  };
  /** One change-detection pass: a template-update pair, then the frame close. */
  page.frame = () => {
    subscriber(2, INSTANCE);
    subscriber(3, INSTANCE);
    page.drain();
    return page.records().at(-1) ?? null;
  };
  /** One `isStable` emission, published on this page's own listeners. */
  page.emit = (/** @type {boolean} */ value) => {
    page.emitted.push(value);
    for (const listener of listeners) {
      /** @type {(value: boolean) => void} */ (listener)(value);
    }
  };
  /** The `stability` section this page's last record carries. */
  page.stability = () => {
    const record = page.records().at(-1);
    const section = record?.detail?.stability;
    if (!isObject(section)) {
      fail(`the ${page.name} page's record carries no stability section`);
    }
    return section;
  };
  return page;
}

/**
 * One session: two pages booted side by side, each driven through its own shape. `crossWired` is the
 * mutant - one listener list shared by both pages - and it is the defect the assertions exist for: a
 * stability emission published on one page reaching the other page's answer.
 *
 * @param {{ crossWired?: boolean }} [options]
 * @returns {Record<string, any>}
 */
function driveSession(options = {}) {
  const shared = options.crossWired === true ? [] : null;
  /** @type {Record<string, any>} */
  const pages = {};

  // Both pages attach first - two pages open side by side in one session - and only then does one
  // page's last pending task end. Booting the second page after the first one's emission would make
  // the two pages sequential and hide the defect this session is here to catch.
  for (const shape of PAGES) {
    const page = bootPage(shape, shared);
    page.snapshot();
    pages[shape.name] = page;
  }

  for (const shape of PAGES) {
    for (const value of shape.later) pages[shape.name].emit(value);
  }

  for (const shape of PAGES) pages[shape.name].frame();

  return { pages, shared };
}

// ---------------------------------------------------------- the shipped join ----

/** The join, loaded into a bare context so the answer is the shipped one. */
let narrator;
function shippedJoin() {
  if (narrator === undefined) {
    const context = createContext({});
    runInContext(
      readText(NARRATOR_PATH, 'the join is part of this repository'),
      context,
    );
    narrator = context.angularAiStabilityNarrator;
    if (!isObject(narrator) || typeof narrator.stability !== 'function') {
      fail('extension/stability-narrator.js publishes no `stability` function');
    }
  }
  return narrator;
}

/** The join's answer for one page's last record, read in the shipped module. */
function answerOf(/** @type {Record<string, any>} */ page) {
  return shippedJoin().stability(page.records().at(-1)?.detail);
}

/**
 * The two pages' answers are their own. Each page's state, reading and settle time are its own; every
 * record in a page's own list carries a reading inside that page's own clock band; and the emission
 * the settling page published is the emission that page alone read.
 *
 * @param {Record<string, any>} session
 * @returns {void}
 */
function assertIndependent(session) {
  const settling = session.pages.settling;
  const silent = session.pages['never-settling'];
  if (!isObject(settling) || !isObject(silent)) {
    fail('the session must hold both pages');
  }

  const settled = answerOf(settling);
  const unsettled = answerOf(silent);

  assert.equal(
    settled.state,
    'stable',
    `the page whose last task ended after attach must answer stable from its own emission; it answered ${settled.state}`,
  );
  assert.equal(
    settled.settle.state,
    'settled',
    'and it must report the settle reading its own emission produced',
  );
  assert.ok(
    Number(settled.settle.sinceAttachMs) > 0,
    `the settling page's settle is ${settled.settle.sinceAttachMs} ms after attach, so no transition was measured`,
  );
  assert.equal(
    settled.reading.value,
    true,
    'the state must name the emission it read',
  );
  assert.equal(
    unsettled.state,
    'unstable',
    `the page that never emitted true must answer unstable; it answered ${unsettled.state}, so a stability emission reached a page it was not published on`,
  );
  assert.equal(
    unsettled.settle.state,
    'no-settle-observed',
    'and it must carry no settle reading at all',
  );
  assert.equal(
    unsettled.reading.value,
    false,
    'its reading is its own last emission, not another page`s',
  );

  // Each page's readings fall in its own clock band, and the bands do not overlap: a reading taken on
  // one page cannot be the other's.
  const [low, high] = settling.band;
  const [otherLow, otherHigh] = silent.band;
  assert.ok(otherLow > high, 'the two pages must read disjoint clocks');
  for (const page of [settling, silent]) {
    const [from, to] = page.band;
    const section = page.stability();
    assert.ok(
      section.attachAt >= from && section.attachAt <= to,
      `the ${page.name} page attached at ${section.attachAt} ms and its own clock band is ${from}-${to}`,
    );
    for (const record of page.records()) {
      const carried = record?.detail?.stability;
      assert.ok(
        isObject(carried) && carried.attachAt >= from && carried.attachAt <= to,
        `a record in the ${page.name} page's own list carries the attach reading ${carried?.attachAt}, which is not this page's`,
      );
    }
  }
  assert.notEqual(
    settling.records(),
    silent.records(),
    'the two pages must not share one record list',
  );
  assert.deepEqual(
    settling.emitted,
    [false, true],
    'the settling page published two emissions, the last of them true',
  );
  assert.deepEqual(
    silent.emitted,
    [false],
    'the page that never settled published one emission',
  );
}

// ----------------------------------------------------------------- the gate ----

/** True when the run is armed: `M043_CAPTURE=1`, in either shell's spelling. */
function armed() {
  return String(process.env.M043_CAPTURE ?? '').trim() === '1';
}

/** How much of a child's output to quote when it fails. */
function tail(result) {
  const text = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  return text.split(/\r?\n/).slice(-8).join(' | ');
}

/**
 * T001's derivation, armed: the measure suite owns every section of the recording, so re-capturing is
 * running that suite rather than re-implementing it here. It writes the recording itself when a
 * derived value moved, which is why the caller hashes before and after.
 *
 * @returns {import('node:child_process').SpawnSyncReturns<string>}
 */
function derive() {
  return spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--test', displayPath(MEASURE_SUITE)],
    {
      cwd: ROOT,
      encoding: 'utf8',
      env: { ...process.env, M043_CAPTURE: '1' },
    },
  );
}

/** The recording's bytes as this run found them, so a default run can prove it wrote nothing. */
let baseline = sha256Of(RECORD_PATH);
const AT_LOAD = baseline;

// ---------------------------------------------------------- the armed capture ----
//
// Declared first, so an armed run captures before the read-only pins read the file back: the same pins
// then prove the freshly derived recording is still the one this head carries.

if (armed()) {
  test('armed: T001`s derivation runs twice at this head and produces the same bytes', (t) => {
    const bytes = existsSync(RECORD_PATH)
      ? readFileSync(RECORD_PATH).length
      : 0;
    t.diagnostic(
      `${RECORDED} before the armed run: ${bytes} bytes, sha256 ${baseline}`,
    );

    const first = derive();
    assert.equal(
      first.status,
      0,
      `the first armed derivation failed: ${tail(first)}`,
    );
    const afterFirst = sha256Of(RECORD_PATH);
    const second = derive();
    assert.equal(
      second.status,
      0,
      `the second armed derivation failed: ${tail(second)}`,
    );
    const afterSecond = sha256Of(RECORD_PATH);

    t.diagnostic(
      `${RECORDED} after the first armed derivation: sha256 ${afterFirst}`,
    );
    t.diagnostic(
      `${RECORDED} after the second armed derivation: sha256 ${afterSecond}`,
    );

    assert.equal(
      afterSecond,
      afterFirst,
      'a second armed derivation changed the recording, so the re-capture is not idempotent',
    );
    assert.equal(
      afterFirst,
      baseline,
      'the armed derivation moved the recording, so the recording this head carries is not the derivation - commit the re-captured file',
    );

    // The armed run is the only writer this suite has; the pins below hold the bytes it left.
    baseline = afterSecond;
    validate(JSON.parse(readText(RECORD_PATH, 'no recording')));
  });
}

// ------------------------------------------------------------- the freshness ----

/**
 * The whole check of one recording: its own canonical bytes, and the facts this suite can re-derive
 * from the agent's source rather than quote.
 *
 * @param {any} record
 * @returns {any}
 */
function validate(record) {
  if (!isObject(record)) fail('the recording is not an object');
  if (record.schema !== 'm043-stability/v1') {
    fail(`the recording schema is ${JSON.stringify(record.schema)}`);
  }
  if (record.milestone !== 'stability-explainer') {
    fail(`the recording milestone is ${JSON.stringify(record.milestone)}`);
  }
  if (record.task !== 'T001') {
    fail(
      `the recording task is ${JSON.stringify(record.task)}: T001 took this measurement, and a re-capture does not re-attribute it`,
    );
  }
  return record;
}

test('a default run is a read: the recording hashes the same before and after', (t) => {
  const now = sha256Of(RECORD_PATH);
  const bytes = existsSync(RECORD_PATH) ? readFileSync(RECORD_PATH).length : 0;

  t.diagnostic(`${RECORDED} at load: ${bytes} bytes, sha256 ${AT_LOAD}`);
  t.diagnostic(`${RECORDED} after the run: sha256 ${now}`);

  assert.equal(
    now,
    baseline,
    `${RECORDED} changed during this run, so the suite is not read-only`,
  );
  assert.equal(WOULD_WRITE.length, 1, 'the file list must name what it writes');
  assert.equal(WOULD_WRITE[0]?.path, RECORD_PATH);
  t.diagnostic(
    `an armed run would write: ${WOULD_WRITE.map((file) => displayPath(file.path)).join(', ')} - ${WOULD_WRITE[0]?.command}`,
  );
});

test('the arming gate guards every side effect this suite could have', () => {
  const source = readText(SELF_PATH, 'this file');
  // Assembled so this check does not find its own needles.
  const gate = source.indexOf(['if (armed', '()) {'].join(''));
  assert.notEqual(gate, -1, 'the arming gate is not in this file');

  // A default run spawns nothing: every derivation call sits behind the gate.
  const call = ['derive', '();'].join('');
  let calls = 0;
  let at = source.indexOf(call);
  while (at !== -1) {
    calls += 1;
    assert.ok(
      at > gate,
      `${call} is called outside the M043_CAPTURE gate, so a default run would re-capture`,
    );
    at = source.indexOf(call, at + call.length);
  }
  assert.ok(calls >= 2, 'the gate must actually derive, twice');

  // This suite writes nothing itself: the armed measure suite writes its own recording.
  const write = ['writeFile', 'Sync', '('].join('');
  assert.equal(
    source.split(write).length - 1,
    0,
    'this suite must write no file; the armed measure suite owns the only write',
  );

  // And it opens no browser and no port: the two pages are realms, not tabs. The needles are
  // assembled so this check does not match itself.
  for (const needle of [
    ['puppe', 'teer'].join(''),
    ['play', 'wright'].join(''),
    ['chrome-remote', '-interface'].join(''),
    ['connect', '('].join(''),
    ['createServer', '('].join(''),
  ]) {
    assert.equal(
      source.includes(needle),
      false,
      `this suite must drive no browser and bind no port, and it names ${needle}`,
    );
  }
});

test('every value this suite checks is re-derived from the agent, not pinned here', () => {
  const agent = readText(
    AGENT_PATH,
    'the page agent is part of this repository',
  );
  const record = validate(
    readJson(RECORD_PATH, 'the measurement has not been recorded'),
  );

  const token = /var STABILITY_TOKEN_NAME = '([^']+)';/.exec(agent)?.[1];
  assert.ok(filled(token), 'the agent declares no STABILITY_TOKEN_NAME');
  assert.equal(
    record.reach.token.name,
    token,
    'the token the recording says the walk resolved is not the agent`s own constant',
  );

  const version = /var STABILITY_VERSION = '([^']+)';/.exec(agent)?.[1];
  assert.ok(filled(version), 'the agent declares no STABILITY_VERSION');
  assert.equal(
    record.record.version,
    version,
    'the version the recording says the surface works against is not the agent`s own constant',
  );

  // The section's fields, in order: the object literal `stabilityField()` builds.
  const fieldSource = routineSource(AGENT_PATH, 'stabilityField');
  const keys = [...fieldSource.matchAll(/^\s{6}([A-Za-z]+):/gm)].map(
    (match) => match[1],
  );
  assert.ok(
    keys.length > 0,
    '`stabilityField()` builds no fields this reader can name',
  );
  assert.deepEqual(
    record.record.keys,
    keys,
    'the recording`s section fields are not the fields the agent builds',
  );

  // The two places the section is carried, and the two the install path arms it, by line.
  const fields = linesHolding(agent, 'stability: stabilityField(),');
  assert.equal(
    fields.length,
    2,
    'the section must sit on the frame and the snapshot',
  );
  assert.equal(
    record.record.frameFieldAt,
    `extension/agent-main.js:${fields[0]}`,
  );
  assert.equal(
    record.record.snapshotFieldAt,
    `extension/agent-main.js:${fields[1]}`,
  );

  const armedLines = linesHolding(agent, '    installStability();');
  assert.ok(armedLines.length >= 1, 'the install path arms no stability read');
  assert.equal(
    record.record.armedAt,
    `extension/agent-main.js:${armedLines[0]}`,
    'the install line the recording cites is not the line the agent arms on',
  );
});

test('the recording is its own canonical serialisation, and a drifted byte reddens it', () => {
  const text = readText(RECORD_PATH, 'the measurement has not been recorded');
  const record = validate(JSON.parse(text));

  assert.doesNotThrow(
    () => checkCanonical(text, record),
    'the recording is not the canonical serialisation of its record, so a re-capture would not reproduce these bytes',
  );

  // The mutant: the smallest drift a serialisation can carry - one separator's spacing.
  const needle = '"schema":';
  assert.equal(
    text.split(needle).length - 1,
    1,
    'the drift mutant needs one `"schema":` to move',
  );
  const drifted = text.replace(needle, '"schema" :');

  assert.throws(
    () => checkCanonical(drifted, record),
    /drifted from its canonical serialisation at byte \d+/,
    'a recording that drifted from its canonical serialisation must redden the pin that holds it',
  );
});

test('the claim list quotes the milestone`s own intent character for character', () => {
  const claims = readJson(
    CLAIMS_PATH,
    'the gate reads this list, so it may not be absent',
  );
  const criteria = intentCriteria(milestoneIntent());

  assert.deepEqual(
    Object.keys(criteria).sort(),
    ['SC1', 'SC2', 'SC3', 'SC4', 'SC5', 'SC6'],
    'the intent must declare the six criteria this list rules',
  );
  assert.doesNotThrow(() => checkClaims(claims, criteria));

  // A one-character drift is the smallest change the rule must catch.
  const drifted = clone(claims);
  const text = String(drifted.claims[0].criterionText);
  const at = Math.floor(text.length / 2);
  const replacement = text[at] === 'e' ? 'a' : 'e';
  drifted.claims[0].criterionText = `${text.slice(0, at)}${replacement}${text.slice(at + 1)}`;
  assert.throws(
    () => checkClaims(drifted, criteria),
    new RegExp(`${drifted.claims[0].criterion} must quote`),
    'a one-character mismatch must redden the quote',
  );

  // The count is the same fact by another route, and it drifts on its own.
  const miscounted = clone(claims);
  miscounted.claims[0].criterionCharacters =
    Number(miscounted.claims[0].criterionCharacters) + 1;
  assert.throws(
    () => checkClaims(miscounted, criteria),
    new RegExp(`${miscounted.claims[0].criterion} records`),
    'a row whose character count is off by one must redden',
  );

  // A criterion the intent declares and no row rules is the absence this list exists to name.
  const short = clone(claims);
  short.claims = short.claims.filter(
    (/** @type {any} */ row) => row.criterion !== 'SC6',
  );
  assert.throws(
    () => checkClaims(short, criteria),
    /SC6 is declared by the intent and ruled by no row/,
  );
});

test('two pages in one session answer their own state and their own settle reading', () => {
  assert.doesNotThrow(() => assertIndependent(driveSession()));
});

test('the two pages are not cross-attributed: a shared listener list reddens the pin', () => {
  // The mutant: one listener list for both pages, so the settling page's last emission reaches the
  // page that never settled - a stability emission attributed to a page it was never published on.
  assert.throws(
    () => assertIndependent(driveSession({ crossWired: true })),
    /the page that never emitted true must answer unstable/,
    'a shared listener list must redden the attribution pin, and it did not',
  );
});
