// @ts-check
//
// M042 T006 - the two-subject capture, the claim list's rulings and the recording's bytes.
//
// Three things this suite owns that no earlier one could:
//
//   E10   One raw window error, two subjects. On a subject whose injector carries the browser
//         global error listeners' own provider record, the throw reaches the app's ErrorHandler
//         and the finding carries the error itself through the handler route. On a subject whose
//         injector does not carry that record — the portal's shape — nothing delivers it, and the
//         answer is cannot-tell carrying `no-global-error-listeners`. Neither answer is ever
//         rendered as "no errors occurred". Both halves are read from the shipped page agent
//         (`boundaryWalk`, whose answer is `declared` or `no-global-error-listeners`) and the
//         shipped join (`readErrorBoundary`), not from a record written here by hand: the two
//         subjects differ by exactly one provider record, and everything else about them is
//         identical because it is the same code booted twice.
//
//   claims  `research/raw/m042-verdict-claims.json` rules SC1 to SC6, and each row quotes the
//         intent character for character. The quotation is held to `.project/intent/INTENT.md`
//         with the same parse the overlay suite uses, so a row that drifts by one character
//         reddens the row and not a copy of it.
//
//   bytes   The recording is one tracked file five suites read, and a suite that rewrote it on
//         every `npm test` would move the working tree under a reviewer. So a default run is a
//         read: it prints the recording's sha256 before and after and asserts they are equal, and
//         it names the one file an armed run would write. `M042_CAPTURE=1` re-captures: the
//         derivation that owns every section (`scripts/error-boundary-measure.test.mjs`, armed) is
//         run twice, and the second pass must change no byte.
//
// Read-only by default: no browser, no server, no port, no write. The armed path's only write is
// the armed measure suite's own, which is the file this suite names rather than writes.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

const RECORD_PATH = join(ROOT, 'research', 'raw', 'm042-error-boundary.json');
const CLAIMS_PATH = join(ROOT, 'research', 'raw', 'm042-verdict-claims.json');
const INTENT_PATH = join(
  ROOT,
  '.project',
  'archive',
  '042-error-boundary',
  'intent',
  'INTENT.md',
);
const AGENT_PATH = join(ROOT, 'extension', 'agent-main.js');
const JOIN_PATH = join(ROOT, 'extension', 'error-boundary.js');
const MEASURE_SUITE = join(ROOT, 'scripts', 'error-boundary-measure.test.mjs');

const MILESTONE = 'M042';
/** The one artefact an armed run writes, named here rather than written here. */
const WRITTEN_BY_AN_ARMED_RUN = [displayPath(RECORD_PATH)];

/** The recording's bytes when this run started, so a default run can prove it wrote nothing. */
const SHA_AT_LOAD = sha256Of(RECORD_PATH);

function displayPath(path) {
  return relative(ROOT, path).split(sep).join('/');
}

/** @param {string} path */
function sha256Of(path) {
  return existsSync(path)
    ? createHash('sha256').update(readFileSync(path)).digest('hex')
    : null;
}

function fail(message) {
  throw new Error(message);
}

/** @param {unknown} value */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** @param {unknown} value */
function filled(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/** @param {string} path @param {string} why */
function requireFile(path, why) {
  assert.ok(existsSync(path), `${displayPath(path)} is missing - ${why}`);
  return path;
}

/** @param {string} text */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * The numbered success criteria of an intent, read as `SC1`, `SC2`, ... The same routine
 * `scripts/overlay-verdict-claims.test.mjs` uses, so the two check identical strings: a
 * continuation line is joined with one space and every run of whitespace collapses.
 *
 * @param {string} path
 * @returns {Record<string, string>}
 */
function intentCriteria(path) {
  const source = stripBom(readFileSync(path, 'utf8'));
  const heading = '## Success criteria';
  const at = source.indexOf(heading);

  assert.ok(at >= 0, 'INTENT.md must carry a "## Success criteria" section');

  const rest = source.slice(at + heading.length);
  const end = rest.indexOf('\n## ');
  const section = end >= 0 ? rest.slice(0, end) : rest;
  /** @type {Record<string, string>} */
  const criteria = {};
  /** @type {string[] | null} */
  let current = null;
  let currentId = '';

  const flush = () => {
    if (current)
      criteria[currentId] = current.join(' ').replace(/\s+/g, ' ').trim();
    current = null;
    currentId = '';
  };

  for (const line of section.split(/\r?\n/)) {
    const match = line.match(/^(\d+)\.\s+(.+?)\s*$/);

    if (match) {
      flush();
      currentId = `SC${match[1]}`;
      current = [match[2] ?? ''];
      continue;
    }

    if (current && line.trim() !== '' && /^\s/.test(line)) {
      current.push(line.trim());
      continue;
    }

    flush();
  }

  flush();

  assert.ok(
    Object.keys(criteria).length > 0,
    'INTENT.md must list its success criteria as a numbered list',
  );

  return criteria;
}

// ------------------------------------------------------------- the claim list ----

/**
 * One claim list ruled against one set of criteria. Every row must name a criterion the intent
 * declares, quote it exactly, name the artefact carrying it and the command that proves it, and
 * every criterion must be ruled by some row: a criterion left unruled is the absence this list
 * exists to name.
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
        `${id} does not quote the INTENT criterion character for character: the row reads ${JSON.stringify(row.criterionText)} and the intent reads ${JSON.stringify(criteria[id])}`,
      );
    }
    if (!filled(row.artefact)) {
      fail(`${id} names no artefact carrying it`);
    }
    if (!filled(row.proves)) {
      fail(`${id} names no command that proves it`);
    }
    assert.match(
      String(row.proves),
      /\b(node|npx|npm)\b/,
      `${id} must name the command that proves it`,
    );
    if (!filled(row.reason)) {
      fail(`${id} states no reason`);
    }
    if (row.ruling === 'not-required' && !/portal/i.test(String(row.reason))) {
      fail(`${id} does not answer the charter's portal clause by name`);
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

/** @returns {Record<string, string>} */
function liveCriteria() {
  return intentCriteria(
    requireFile(INTENT_PATH, "the intent this milestone's claims are held to"),
  );
}

/** @returns {any} */
function loadClaims() {
  const text = stripBom(
    readFileSync(
      requireFile(
        CLAIMS_PATH,
        'the gate reads this list, so it may not be absent',
      ),
      'utf8',
    ),
  );

  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`the claim list is not JSON (${error?.message ?? error})`);
  }
}

/** @returns {any} */
function loadRecord() {
  return JSON.parse(
    stripBom(
      readFileSync(
        requireFile(
          RECORD_PATH,
          'the recording is the artefact five suites read',
        ),
        'utf8',
      ),
    ),
  );
}

// ------------------------------------------------------- the recording's bytes ----

/** @param {unknown} record */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/**
 * The byte at which a text stops being its own record's canonical serialisation, or -1.
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
 * Holds a recorded text to the canonical serialisation of the record it holds. This is the
 * check a re-capture is worth: a file that parses to the right values but is not what its own
 * derivation writes is a memory of an edit, and the next armed run is the only thing that would
 * notice.
 *
 * @param {string} text
 * @param {unknown} record
 * @returns {void}
 */
function checkCanonical(text, record) {
  const expected = canonical(record);
  const at = firstDrift(text, expected);

  if (at === -1) return;

  const window = (source) =>
    JSON.stringify(source.slice(Math.max(0, at - 24), at + 24));

  fail(
    `the recording drifted from its canonical serialisation at byte ${at}: the file reads ${window(text)} and its own record serialises as ${window(expected)}`,
  );
}

// ------------------------------------------------------------- the two subjects ----

const AGENT_SOURCE = readFileSync(
  requireFile(AGENT_PATH, 'the page agent is what records the route'),
  'utf8',
);
const JOIN_SOURCE = readFileSync(
  requireFile(JOIN_PATH, 'the join is what answers the route'),
  'utf8',
);

/** The component the frame is driven for: an identity a `WeakMap` accepts as a key. */
const INSTANCE = { constructor: { name: 'Counter' } };

/**
 * Boots the shipped page agent and the shipped join in this realm against one subject, and
 * hands the caller a page it can drive. Everything a subject *is* comes from its injector: the
 * `ErrorHandler` record both subjects carry, and the browser global error listeners' record only
 * the declaring one carries. Nothing else differs between the two boots.
 *
 * @param {{ declaresListeners: boolean }} options
 * @param {(page: any) => any} body
 */
function withSubject(options, body) {
  const saved = {
    ng: globalThis.ng,
    Zone: globalThis.Zone,
    CustomEvent: globalThis.CustomEvent,
    dispatchEvent: globalThis.dispatchEvent,
    performance: globalThis.performance,
    queueMicrotask: globalThis.queueMicrotask,
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,
    document: globalThis.document,
    addEventListener: globalThis.addEventListener,
    removeEventListener: globalThis.removeEventListener,
    recorder: globalThis.__ngRecorder,
    join: globalThis.angularAiErrorBoundary,
    consoleError: console.error,
  };
  /** @type {any[]} */
  const dispatched = [];
  /** @type {Array<() => void>} */
  const queued = [];
  /** The app's handler, as the stock class is: a plain mutable instance. */
  const handler = {
    handleError() {},
  };
  const injector = {
    /** @param {any} token */
    get: (token) =>
      isObject(token) && token.name === 'ErrorHandler' ? handler : null,
  };
  /** The provider records the walk reads, in the order the injector lists them. */
  const providers = [];
  if (options.declaresListeners) {
    providers.push({ token: { name: 'GlobalErrorListeners' } });
  }
  providers.push({ token: { name: 'ErrorHandler' } });
  let graph = {
    nodes: [{ id: 'n0', kind: 'template', label: 'app-counter', epoch: 1 }],
    edges: [],
  };
  const root = { tagName: 'APP-ROOT' };
  const ng = {
    ɵsetProfiler() {
      return () => {};
    },
    ɵgetSignalGraph: () => graph,
    getHostElement: () => ({ tagName: 'APP-COUNTER' }),
    getDirectiveMetadata: () => ({ changeDetection: 1 }),
    getInjector: () => injector,
    ɵgetInjectorResolutionPath: () => [injector],
    ɵgetInjectorProviders: () => providers,
    toggleWatchSignal() {},
  };

  globalThis.CustomEvent = function (type, init) {
    return { type, detail: init && init.detail };
  };
  /** @param {any} event */
  globalThis.dispatchEvent = (event) => {
    dispatched.push(event);
  };
  globalThis.performance = { now: () => 4242 };
  /** @param {() => void} callback */
  globalThis.queueMicrotask = (callback) => {
    queued.push(callback);
  };
  globalThis.setTimeout = () => 0;
  globalThis.clearTimeout = () => {};
  globalThis.setInterval = () => 0;
  globalThis.clearInterval = () => {};
  globalThis.document = {
    body: root,
    documentElement: root,
    querySelector: () => root,
    querySelectorAll: () => [],
  };
  // No listener is registered on this realm's own event target: the agent is a content script,
  // and the browser's delivery is the subject's, not this process's.
  globalThis.addEventListener = () => {};
  globalThis.removeEventListener = () => {};
  globalThis.ng = ng;
  delete globalThis.Zone;
  delete globalThis.__ngRecorder;
  delete globalThis.angularAiErrorBoundary;

  try {
    vm.runInThisContext(AGENT_SOURCE, { filename: 'agent-main.js' });
    vm.runInThisContext(JOIN_SOURCE, { filename: 'error-boundary.js' });

    const recorder = globalThis.__ngRecorder;
    if (recorder === undefined) {
      fail('extension/agent-main.js published no `__ngRecorder` handle');
    }
    const join = globalThis.angularAiErrorBoundary;
    if (!isObject(join) || typeof join.readErrorBoundary !== 'function') {
      fail('extension/error-boundary.js published no `readErrorBoundary`');
    }
    const subscriber = recorder.getSubscriber();
    if (typeof subscriber !== 'function') {
      fail('extension/agent-main.js installed no profiler subscriber');
    }

    /** Everything `onEvent` queued, run in arrival order. */
    const drain = () => {
      while (queued.length > 0) {
        const run = /** @type {() => void} */ (queued.shift());
        run();
      }
    };
    const page = {
      handler,
      injector,
      /** Every `angular-ai:record` the page received, in arrival order. */
      records: () =>
        dispatched.filter((event) => event.type === 'angular-ai:record'),
      /** One change-detection pass: a template-update pair, then its frame close. */
      frame(instance) {
        subscriber(2, instance);
        subscriber(3, instance);
        drain();
      },
      /** The boundary section the page's last record carried, or a named failure. */
      boundary() {
        const list = page.records();
        if (list.length === 0) {
          fail(
            'the page dispatched no `angular-ai:record`, so it carried no boundary section',
          );
        }
        const section = list.at(-1).detail?.boundary;
        if (!isObject(section)) {
          fail("the page's record carries no boundary section");
        }
        return section;
      },
      /**
       * Delivers one thrown value to the hook the agent installed on the app's handler: the
       * arrival point this file owns, and the route the record calls `handler` because the
       * delivery carried no `ErrorDetails`.
       */
      deliver(error) {
        if (typeof handler.onViewError !== 'function') {
          fail(
            "the agent installed no `onViewError` hook on the app's handler, so this subject has no delivery point",
          );
        }
        handler.onViewError(error);
      },
      /** The join's answer for one boundary section. */
      read: join.readErrorBoundary,
    };

    return body(page);
  } finally {
    console.error = saved.consoleError;
    globalThis.ng = saved.ng;
    globalThis.Zone = saved.Zone;
    globalThis.CustomEvent = saved.CustomEvent;
    globalThis.dispatchEvent = saved.dispatchEvent;
    globalThis.performance = saved.performance;
    globalThis.queueMicrotask = saved.queueMicrotask;
    globalThis.setTimeout = saved.setTimeout;
    globalThis.clearTimeout = saved.clearTimeout;
    globalThis.setInterval = saved.setInterval;
    globalThis.clearInterval = saved.clearInterval;
    globalThis.document = saved.document;
    globalThis.addEventListener = saved.addEventListener;
    globalThis.removeEventListener = saved.removeEventListener;
    globalThis.__ngRecorder = saved.recorder;
    globalThis.angularAiErrorBoundary = saved.join;
  }
}

/** The raw error the browser raises once, on both subjects' pages. */
const RAW_ERROR = new TypeError(
  "Cannot read properties of undefined (reading 'total')",
);

/**
 * The same throw on two subjects: on the one that declares the browser global error listeners
 * the error reaches the handler and the hook records it; on the one that declares none nothing
 * delivers it, and the page's own walk says so.
 */
function captureSubjects() {
  const declared = withSubject({ declaresListeners: true }, (page) => {
    page.deliver(RAW_ERROR);
    page.frame(INSTANCE);
    const record = page.boundary();
    return { record, answer: page.read(record) };
  });
  const absent = withSubject({ declaresListeners: false }, (page) => {
    page.frame(INSTANCE);
    const record = page.boundary();
    return { record, answer: page.read(record) };
  });
  return { declared, absent, error: RAW_ERROR };
}

/**
 * E10's pin, as one function over the captured pair, so the pins below can be reddened by a
 * mutant pair and the real pair is checked by the same code.
 *
 * @param {{ declared: any, absent: any, error: Error }} pair
 * @returns {void}
 */
function checkTwoSubjects(pair) {
  const { declared, absent, error } = pair;

  for (const [label, side] of [
    ['declared', declared],
    ['absent', absent],
  ]) {
    if (!isObject(side) || !isObject(side.record) || !isObject(side.answer)) {
      fail(`${label}: the capture produced no record and answer`);
    }
    if (side.record.state !== 'installed') {
      fail(
        `${label}: the boundary record's state is ${JSON.stringify(side.record.state)} - the hook was not installed, so this subject measured the install and not the route`,
      );
    }
  }

  if (declared.record.globalListeners !== 'declared') {
    fail(
      `declared: the page agent answered ${JSON.stringify(declared.record.globalListeners)} for a subject whose injector carries the global-listeners record`,
    );
  }
  if (absent.record.globalListeners !== 'no-global-error-listeners') {
    fail(
      `absent: the page agent answered ${JSON.stringify(absent.record.globalListeners)} for a subject that declares no global listeners`,
    );
  }

  // The declaring subject: one finding, through the handler, carrying the error itself.
  if (declared.answer.findings.length !== 1) {
    fail(
      `declared: the answer carries ${declared.answer.findings.length} finding(s) for one delivered error; the same throw must reach the finding on a subject whose listeners deliver it`,
    );
  }
  const finding = declared.answer.findings[0];
  if (finding.route !== 'handler') {
    fail(
      `declared: the finding's route is ${JSON.stringify(finding.route)} and the delivery carried no ErrorDetails, so the route is the handler's`,
    );
  }
  if (
    finding.errorName !== error.name ||
    finding.errorMessage !== error.message
  ) {
    fail(
      `declared: the finding reports ${JSON.stringify([finding.errorName, finding.errorMessage])} and the raw error raised was ${JSON.stringify([error.name, error.message])}`,
    );
  }
  if (finding.declaringType !== null) {
    fail(
      `declared: the finding names ${JSON.stringify(finding.declaringType)} as its declaring component, and the global listener is not a boundary: a delivery names no declaring component`,
    );
  }

  // The subject that declares none: no finding, and the absence is the answer.
  if (absent.answer.findings.length !== 0) {
    fail(
      `absent: the answer carries ${absent.answer.findings.length} finding(s) for a subject that declares no global listeners and delivered nothing; an absence is not a finding`,
    );
  }
  if (absent.answer.state === 'caught') {
    fail(
      'absent: the answer is `caught` on a subject that declares no global listeners, which is a raw error attributed to a page that never received it',
    );
  }
  if (!absent.answer.absences.includes('no-global-error-listeners')) {
    fail(
      `absent: the answer's absences are ${JSON.stringify(absent.answer.absences)} and do not carry no-global-error-listeners, which is the whole of what this subject's answer may say`,
    );
  }
  if (declared.answer.absences.includes('no-global-error-listeners')) {
    fail(
      'declared: the answer carries no-global-error-listeners on a subject that declares them',
    );
  }

  for (const [label, side] of [
    ['declared', declared],
    ['absent', absent],
  ]) {
    const rendered = JSON.stringify(side.answer);
    if (/no errors occurred/i.test(rendered)) {
      fail(
        `${label}: the answer reads "no errors occurred", which the absence of an error is never evidence for`,
      );
    }
  }
}

/** One capture, taken once: every pin below compares against the same reading. */
const SUBJECTS = (() => {
  let done = false;
  /** @type {{ declared: any, absent: any, error: Error } | null} */
  let value = null;
  return () => {
    if (!done) {
      value = captureSubjects();
      done = true;
    }
    return /** @type {{ declared: any, absent: any, error: Error }} */ (value);
  };
})();

/** A deep copy of the captured pair, so a mutant changes nothing the real pins read. */
function cloneSubjects() {
  const pair = SUBJECTS();
  return JSON.parse(
    JSON.stringify({
      declared: pair.declared,
      absent: pair.absent,
      error: { name: pair.error.name, message: pair.error.message },
    }),
  );
}

// ---------------------------------------------------------------- the armed path ----

/** True when the run is armed: `M042_CAPTURE=1`, in either shell's spelling. */
function armed() {
  return String(process.env.M042_CAPTURE ?? '').trim() === '1';
}

/**
 * Runs the derivation that owns the recording's every section, armed, in its own process, and
 * reports what it wrote. The suite does not re-derive those sections itself: duplicating a
 * 700-line derivation is how two copies of one measurement drift apart, so the armed path runs
 * the one that owns them and judges its output by the byte.
 *
 * @returns {{ status: number | null, sha: string | null, tests: number, pass: number, fail: number, tail: string }}
 */
function captureOnce() {
  const env = { ...process.env, M042_CAPTURE: '1' };
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(
    process.execPath,
    [
      '--experimental-strip-types',
      '--test',
      'scripts/error-boundary-measure.test.mjs',
    ],
    { cwd: ROOT, env, encoding: 'utf8', timeout: 5 * 60 * 1000 },
  );
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  /** @param {string} key */
  const count = (key) => {
    const pattern = new RegExp(`^\\s*(?:ℹ|#)?\\s*${key}\\s+(\\d+)\\s*$`, 'gm');
    let total = 0;
    for (const match of output.matchAll(pattern)) total += Number(match[1]);
    return total;
  };

  return {
    status: result.status,
    sha: sha256Of(RECORD_PATH),
    tests: count('tests'),
    pass: count('pass'),
    fail: count('fail'),
    tail: output.replace(/\r\n/g, '\n').split('\n').slice(-12).join('\n'),
  };
}

// -------------------------------------------------------------------- the pins ----

test('PRECONDITION: the recording, the claim list and the intent are the three files this suite reads', () => {
  requireFile(MEASURE_SUITE, 'the derivation that owns the recording');
  requireFile(RECORD_PATH, 'the recording');
  requireFile(CLAIMS_PATH, 'the claim list');
  requireFile(INTENT_PATH, 'the intent the claims are held to');
  assert.equal(typeof SHA_AT_LOAD, 'string');
  assert.notEqual(SHA_AT_LOAD, null, 'the recording is missing');
});

test('held-out E10: one raw window error is one finding where the listeners are declared, and no-global-error-listeners where they are not', () => {
  checkTwoSubjects(SUBJECTS());
});

test('the two subjects differ by one provider record, so the difference in the answer is the difference in the subject', () => {
  const pair = SUBJECTS();
  // The same throw drove both, so the error is one value and the answers are comparable.
  assert.equal(
    pair.declared.error,
    undefined,
    "the error is the pair's, not the subject's",
  );
  assert.equal(pair.error.name, 'TypeError');
  // The two records agree on everything the install answers and differ in the walk's answer.
  for (const field of ['state', 'version', 'coreVersion', 'chained']) {
    if (!Object.hasOwn(pair.declared.record, field)) continue;
    assert.deepEqual(
      pair.declared.record[field],
      pair.absent.record[field],
      `${field}: the two subjects must agree on everything but the listeners`,
    );
  }
  assert.notDeepEqual(
    pair.declared.record.globalListeners,
    pair.absent.record.globalListeners,
  );
  assert.equal(
    pair.declared.record.entries.length,
    1,
    'the declared subject recorded one arrival',
  );
  assert.equal(
    pair.absent.record.entries.length,
    0,
    'the absent subject recorded none',
  );
  assert.equal(pair.declared.record.entries[0].route, 'handler');
});

test('the claim list rules SC1 to SC6 and quotes each criterion character for character out of INTENT.md', () => {
  const criteria = liveCriteria();
  const recording = loadClaims();

  checkClaims(recording, criteria);

  assert.deepEqual(
    Object.keys(criteria),
    ['SC1', 'SC2', 'SC3', 'SC4', 'SC5', 'SC6'],
    'the intent must declare the six criteria this milestone rules',
  );
  for (const row of recording.claims) {
    assert.ok(
      row.criterionText.length > 100,
      `${row.criterion} quotes ${row.criterionText.length} characters, which is a fragment rather than a criterion`,
    );
  }
});

test('a default run is a read: the recording is byte-identical before and after, and the file an armed run writes is named', () => {
  const before = SHA_AT_LOAD;
  const after = sha256Of(RECORD_PATH);

  console.log(
    `m042-capture: ${displayPath(RECORD_PATH)} sha256 before ${before} after ${after}`,
  );

  assert.equal(after, before, 'the recording changed during a default run');
  assert.deepEqual(WRITTEN_BY_AN_ARMED_RUN, [
    'research/raw/m042-error-boundary.json',
  ]);

  if (armed()) return;

  // The read is the whole run: nothing below this line writes, and the file it would write is
  // the one named above.
  assert.equal(
    existsSync(join(ROOT, WRITTEN_BY_AN_ARMED_RUN[0])),
    true,
    'the file an armed run writes is the recording that is already here',
  );
  assert.equal(
    sha256Of(join(ROOT, WRITTEN_BY_AN_ARMED_RUN[0])),
    before,
    'the named file is not the file this suite just hashed',
  );
});

test('the recording is the canonical serialisation of its own record', () => {
  const text = stripBom(readFileSync(RECORD_PATH, 'utf8'));

  checkCanonical(text, JSON.parse(text));
});

test('an armed run re-captures every section and a second armed run changes no byte', () => {
  if (!armed()) {
    console.log(
      `m042-capture: not armed, so nothing was re-captured; an armed run would write ${WRITTEN_BY_AN_ARMED_RUN.join(', ')}`,
    );
    assert.equal(sha256Of(RECORD_PATH), SHA_AT_LOAD);
    return;
  }

  const first = captureOnce();

  assert.equal(
    first.status,
    0,
    `the armed derivation exited ${first.status}: ${first.tail}`,
  );
  assert.ok(
    first.tests > 0,
    'the armed derivation reported no tests, and a run that proves nothing may not pass',
  );
  assert.equal(
    first.fail,
    0,
    `the armed derivation reported ${first.fail} failing test(s)`,
  );
  assert.equal(
    first.pass,
    first.tests,
    'the armed derivation did not pass every test it ran',
  );

  const second = captureOnce();

  assert.equal(
    second.status,
    0,
    `the second armed run exited ${second.status}: ${second.tail}`,
  );
  assert.equal(
    second.sha,
    first.sha,
    'a second armed run changed the recording, so the derivation is not stable at this head',
  );

  const text = stripBom(readFileSync(RECORD_PATH, 'utf8'));

  checkCanonical(text, JSON.parse(text));

  console.log(
    `m042-capture: re-captured ${displayPath(RECORD_PATH)} at sha256 ${first.sha} over two armed runs`,
  );
});

// ---------------------------------------------------------------- the mutants ----
//
// Each mutant reddens one pin of this suite, and the string it reddens with names the defect it
// represents. None of them is a shape the artefacts could not take: every one is a change a
// re-worded criterion, a hand-edited recording or a wrong subject could make.

test('held-out: a claim row that differs from the intent by one character reddens, naming the row', () => {
  const criteria = liveCriteria();
  const recording = loadClaims();
  const row = recording.claims.find((claim) => claim.criterion === 'SC3');
  const original = row.criterionText;
  const at = original.indexOf('handler');

  assert.ok(at > 0, 'SC3 must name the handler it is about');

  const drifted =
    original.slice(0, at) +
    (original[at] === 'X' ? 'Y' : 'X') +
    original.slice(at + 1);

  assert.equal(drifted.length, original.length);
  let differences = 0;
  for (let index = 0; index < original.length; index += 1) {
    if (original[index] !== drifted[index]) differences += 1;
  }
  assert.equal(
    differences,
    1,
    'the mutant must differ from the criterion by one character',
  );

  row.criterionText = drifted;

  assert.throws(
    () => checkClaims(recording, criteria),
    /SC3 does not quote the INTENT criterion character for character/,
  );
});

test('held-out: a criterion no row rules reddens', () => {
  const criteria = liveCriteria();
  const recording = loadClaims();

  recording.claims = recording.claims.filter(
    (claim) => claim.criterion !== 'SC5',
  );

  assert.throws(
    () => checkClaims(recording, criteria),
    /SC5 is declared by the intent and ruled by no row/,
  );
});

test('held-out: a row that names no command reddens', () => {
  const criteria = liveCriteria();
  const recording = loadClaims();

  recording.claims[0].proves = 'it was looked at';

  assert.throws(
    () => checkClaims(recording, criteria),
    /SC1 must name the command that proves it/,
  );
});

test('held-out: a recording that drifted from its canonical serialisation reddens, naming the byte', () => {
  const text = stripBom(readFileSync(RECORD_PATH, 'utf8'));
  const record = JSON.parse(text);
  const drifted = text.replace('  "schema"', '   "schema"');

  assert.notEqual(drifted, text, 'the mutant must change a byte');
  assert.throws(
    () => checkCanonical(drifted, record),
    /the recording drifted from its canonical serialisation at byte 4/,
  );
});

test('held-out: a declaring subject whose answer carries the absence reddens', () => {
  const pair = cloneSubjects();

  pair.declared.answer.absences.push('no-global-error-listeners');

  assert.throws(
    () => checkTwoSubjects(pair),
    /declared: the answer carries no-global-error-listeners on a subject that declares them/,
  );
});

test('held-out: a subject that declares none answering with a finding reddens', () => {
  const pair = cloneSubjects();

  pair.absent.answer.findings.push(pair.declared.answer.findings[0]);

  assert.throws(
    () => checkTwoSubjects(pair),
    /absent: the answer carries 1 finding|absent: the answer is `caught`/,
  );
});

test('held-out: a subject whose walk answered the other way reddens', () => {
  const pair = cloneSubjects();

  pair.absent.record.globalListeners = 'declared';

  assert.throws(
    () => checkTwoSubjects(pair),
    /absent: the page agent answered "declared" for a subject that declares no global listeners/,
  );
});
