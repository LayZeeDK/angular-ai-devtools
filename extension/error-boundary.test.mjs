// Tests for extension/error-boundary.js — the join between the boundary record the page agent
// carries (`extension/agent-main.js`, T003) and what a surface renders.
//
// The module is evaluated in a bare `node:vm` context, and the purity pins are made *inside* that
// context: a read of the sandbox object from this side never forwards intrinsics, so
// `context.Date === undefined` would be true of every module ever written, including one that called
// `Date.now()`. Inside a real context `typeof console` is `object` and `typeof Date` is `function`,
// so the only pin that can bite is a context in which each of those names is a trap.
//
// What is measured and what is derived, stated for what it is:
//
//   - The two component types are the recording's. `research/raw/m042-error-boundary.json` keeps
//     S10's onViewError payloads as quotations, and the two pairs below are read out of them: one
//     pair whose `declarationType` and `boundaryType` differ (the change-detection path, where the
//     throwing view and the declaring view are two different LViews) and one pair where they are the
//     same (the construction path, where they are one view). No component name in this file is
//     written by hand.
//   - The error and the fallback are the recording's too. The thrown message is that recording's
//     `hook.fallback.text` minus the `caught: ` prefix it records as the probe's own template, which
//     is why the two can disagree here without either being invented — the interesting case, not a
//     trap (`hook.fallback.neverTheError`).
//   - The record's field names are the shipped agent's: `RECORD_FIELDS` and `ENTRY_FIELDS` are held
//     against T003's own section of `extension/agent-main.js`, so a reader written against a record
//     the agent does not publish reddens here and not in a browser.
//   - The cause, the wrapped error's own name and the timestamps are constructed record values: no
//     recording in this milestone carries a thrown non-Error, so every expectation built on one is
//     an echo of an input and is stated as one.
//
// The states this join can answer, pinned exactly:
//
//   caught        `state: caught`, no absence of its own, one finding per arrival, and the absences
//                 every answer carries beside it: `no-replaced-subtree` (E8), `no-boundary-details`
//                 where a delivery arrived beside a boundary (E7), `no-global-error-listeners` where
//                 the record says the page declares none (SC5) and `no-core-version` where the page
//                 reported no version.
//   cannot-tell   one named absence decides it: `no-error-boundary-declared` (E2),
//                 `no-boundary-details` (E7), `no-error-caught` (E5), or the page agent's own
//                 `machinery-unconfirmed` / `handler-unresolved` / `hook-refused`, which is never an
//                 empty boundary list.
//   idle          a word this reader was not written for travels through: nothing about a state it
//                 does not know is claimed, so no finding and no absence is attached to it.
//
// Every mutant is applied to a copy of the module source, after the unmutated module is pinned with
// the same function, and must redden that pin by name: a mutant that survived its pin would prove the
// pin vacuous.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const SRC = readFileSync(
  new URL('../extension/error-boundary.js', import.meta.url),
  'utf8',
);
const AGENT = readFileSync(
  new URL('../extension/agent-main.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m042-error-boundary.json', import.meta.url),
    'utf8',
  ),
);

/** The module with its comments removed, so a token scan reads code and not prose. */
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/**
 * The standalone module: a bare context holding the source and whatever the caller puts in it. No
 * DOM, no clock, no console and no network are installed by `node:vm` beyond the two every JavaScript
 * context has (`Date`, and Node's `console`), which the purity pins below handle.
 */
function standalone(source = SRC, sandbox = {}) {
  const context = createContext(sandbox);
  runInContext(source, context);
  const module = context.angularAiErrorBoundary;
  assert.ok(
    module,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  assert.equal(typeof module.readErrorBoundary, 'function');
  return { boundary: module, context };
}

/**
 * A value from the vm context carries that context's own `Array` and `Object` prototypes, so it is
 * copied into this realm before a structural assertion reads it.
 */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * The globals the module must never reach for. `document`, `window`, `performance`, the two timers,
 * `fetch` and `XMLHttpRequest` are absent from a `node:vm` context altogether; `Date` and `console`
 * are in every context there is, so only a trap can catch a module that used them.
 */
const HOST_GLOBALS = [
  'document',
  'window',
  'console',
  'Date',
  'performance',
  'setTimeout',
  'setInterval',
  'fetch',
  'XMLHttpRequest',
];

/**
 * A global that throws when it is read, called or constructed, naming itself in the error. A module
 * that reached for the clock or the console inside the context hits this on the first touch, which
 * is what makes the guard a guard rather than a decoration.
 */
function tripwire(name) {
  const reached = () => {
    throw new Error(`the module reached for ${name}`);
  };
  return new Proxy(function tripwire() {}, {
    get: reached,
    set: reached,
    has: reached,
    apply: reached,
    construct: reached,
  });
}

/**
 * Runs the join *inside* a context where every one of `HOST_GLOBALS` is a trap, and returns the
 * answer it produced. The record is handed in through the sandbox, so nothing about the call crosses
 * from this realm except the data.
 */
function guarded(source, record) {
  const sandbox = { __record: record };
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  const { context } = standalone(source, sandbox);
  return plain(
    runInContext('angularAiErrorBoundary.readErrorBoundary(__record)', context),
  );
}

/** The armed-traps context on its own, for the assertions that prove the guard is live. */
function guardedContext() {
  const sandbox = {};
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  return createContext(sandbox);
}

// ------------------------------------------------- the recording, read as a record ----

/**
 * The two component-type answers one recorded quotation carries, as S10's `onViewError` payload
 * recorded them. The change-detection catch and the construction catch pass different `details`
 * shapes (`hook.details.paths`), and the two pairs below are the two shapes' answers, not this
 * suite's opinion of what a boundary would name.
 */
function recordedTypePairs() {
  const pairs = [];
  for (const quotation of RECORDING.hook.quotations) {
    const text = quotation.contains.join('\n');
    const declaration = /"declarationType":"([^"]+)"/.exec(text);
    const boundary = /"boundaryType":"([^"]+)"/.exec(text);
    if (declaration !== null && boundary !== null) {
      pairs.push({
        at: quotation.at,
        declarationType: declaration[1],
        boundaryType: boundary[1],
      });
    }
  }
  return pairs;
}

const TYPE_PAIRS = recordedTypePairs();

/** The recorded pair whose two answers differ: the throwing view is not the declaring view. */
const DIFFERING_PAIR = TYPE_PAIRS.find(
  (pair) => pair.declarationType !== pair.boundaryType,
);

/** The recorded pair whose two answers are the same: the construction path's one view. */
const SAME_PAIR = TYPE_PAIRS.find(
  (pair) => pair.declarationType === pair.boundaryType,
);

/** The error's own name, as the recording's `@error` context quotation records it. */
function recordedErrorName() {
  for (const quotation of RECORDING.hook.quotations) {
    const match = /"errorCtor":"([^"]+)"/.exec(quotation.contains.join('\n'));
    if (match !== null) return match[1];
  }
  return null;
}

const ERROR_NAME = recordedErrorName();

/**
 * The text the boundary's `@error` view rendered, exactly as the recording keeps it, and the thrown
 * message it carries behind the probe's own `caught: ` prefix. S10's record keeps the rendered text
 * and the thrown message in different fields (`hook.fallback`), which is what lets SC2 forbid quoting
 * the view: the prefix and the surrounding markup are the probe's template.
 */
const RENDERED_TEXT = RECORDING.hook.fallback.text;
const RENDERED_PREFIX = RECORDING.hook.fallback.prefix;
const THROWN_MESSAGE = RENDERED_TEXT.slice(RENDERED_PREFIX.length);

/** The version this surface works against, as the recording declares it. */
const WORKED_AGAINST = RECORDING.version.declares.coreVersion;

/**
 * The page agent's own boundary section: the record this reader is written against. T003 landed it
 * at `022cdd5`, and every field name below is read out of that section rather than restated here.
 */
const AGENT_BOUNDARY = (() => {
  const start = AGENT.indexOf("// --- The boundary hook's record");
  assert.notEqual(
    start,
    -1,
    'extension/agent-main.js carries no boundary section: T003 landed it beside the profiler and router subscriptions at 022cdd5',
  );
  return AGENT.slice(start);
})();

/** The name the page agent gives the error it wraps a non-Error thrown value in. */
const WRAPPED_NAME = (() => {
  const match = /BOUNDARY_WRAPPED_ERROR_NAME = '([^']+)'/.exec(AGENT_BOUNDARY);
  assert.ok(
    match,
    'extension/agent-main.js names no wrapped-error constant: the reader cannot know what the boundary wraps a non-Error as',
  );
  return match[1];
})();

/** The fields the record and one entry carry, as the contract states them (T003, T004). */
const RECORD_FIELDS = [
  'state',
  'absence',
  'chained',
  'globalListeners',
  'version',
  'coreVersion',
  'entries',
];
const ENTRY_FIELDS = [
  'route',
  'error',
  'details',
  'at',
  'declarationType',
  'declarationInstanceName',
  'caughtBy',
  'boundaryType',
  'boundaryReset',
];

// ------------------------------------------------- the frames the join is handed ----

/**
 * The record the page agent publishes: `boundaryField()`'s own shape, with the arrivals a test
 * supplies. `coreVersion` is `null` because no page reports one (`version.declares.onAPage`) and the
 * record may not invent one.
 */
function recordOf(extra) {
  return {
    state: 'installed',
    absence: null,
    chained: false,
    globalListeners: 'declared',
    version: WORKED_AGAINST,
    coreVersion: null,
    entries: [],
    ...extra,
  };
}

/** One arrival by the hook, with the details the payload carried and the error it carried. */
function hookArrival(details, error) {
  return {
    route: 'hook',
    error: error ?? { name: ERROR_NAME, message: THROWN_MESSAGE },
    details,
    at: 4,
  };
}

/** One delivery by the handler: the error with no `details` at all (T003's `handler` route). */
function deliveryArrival(error) {
  return {
    route: 'handler',
    error: error ?? { name: ERROR_NAME, message: 'raw window error' },
    details: null,
    at: 4,
  };
}

/** The change-detection path's details: the throwing view and the declaring view apart. */
const DIFFERING_DETAILS = {
  declarationType: DIFFERING_PAIR.declarationType,
  declarationInstanceName: 'child',
  caughtBy: true,
  boundaryType: DIFFERING_PAIR.boundaryType,
  boundaryReset: true,
};

/** The construction path's details: one view, so the same type twice, and no `caughtBy`. */
const SAME_DETAILS = {
  declarationType: SAME_PAIR.declarationType,
  declarationInstanceName: 'host',
  caughtBy: null,
  boundaryType: SAME_PAIR.boundaryType,
  boundaryReset: true,
};

/** A hook arrival whose payload carried no boundary: no declaration of one reached the hook. */
const BOUNDARY_LESS_DETAILS = {
  ...DIFFERING_DETAILS,
  boundaryType: null,
  boundaryReset: null,
};

/** The caught frame: one arrival, a boundary named, the throwing view apart from it. */
function caughtRecord() {
  return recordOf({ entries: [hookArrival(DIFFERING_DETAILS)] });
}

/** The frame the boundary's rendered fallback is recorded on, as content and never as the error. */
function fallbackRecord(extra) {
  return recordOf({
    errorView: { state: 'rendered', text: RENDERED_TEXT },
    entries: [hookArrival(DIFFERING_DETAILS)],
    ...extra,
  });
}

/** A record that names no boundary, for either reason the record can carry. */
function noBoundaryRecord() {
  return recordOf({ entries: [hookArrival(BOUNDARY_LESS_DETAILS)] });
}

/** A delivery that reached the handler with no `ErrorDetails`. */
function deliveryRecord() {
  return recordOf({ entries: [deliveryArrival()] });
}

/** A record with a boundary arrival beside a delivery: the boundary's finding is not overwritten. */
function mixedRecord() {
  return recordOf({
    entries: [hookArrival(DIFFERING_DETAILS), deliveryArrival()],
  });
}

/** A record whose boundary wrapped a thrown value that is not `Error`-like. */
function wrappedRecord() {
  return recordOf({
    entries: [
      hookArrival(DIFFERING_DETAILS, {
        name: WRAPPED_NAME,
        message: 'an error was thrown inside the template',
        cause: WRAPPED_CAUSE,
      }),
    ],
  });
}

/**
 * The value the boundary wrapped. CONSTRUCTED: no recording in this milestone carries a thrown
 * non-Error, so this is a caller input and every expectation built on it is an input echo.
 */
const WRAPPED_CAUSE = { type: 'Object', keys: 0 };

/** A record whose state is the page agent's own machinery absence. */
function machineryRecord(absence) {
  return {
    state: 'cannot-tell',
    absence: absence,
    chained: false,
    globalListeners: null,
    version: WORKED_AGAINST,
    coreVersion: null,
    entries: [],
  };
}

// ------------------------------------------------- the vocabulary, as contracts name it ----

/** The nine fields a finding carries, and the only fields it carries. */
const FINDING_KEYS = [
  'caughtBy',
  'cause',
  'declaringType',
  'errorMessage',
  'errorName',
  'replacedSubtree',
  'reset',
  'route',
  'throwingType',
];

/** The seven fields an answer carries, and the only fields it carries. */
const ANSWER_KEYS = [
  'absence',
  'absences',
  'coreVersion',
  'fallback',
  'findings',
  'state',
  'version',
];

/** Every named absence the join can answer with, exactly (INTENT.md's scope, T003's, and the version). */
const ABSENCES = [
  'no-error-boundary-declared',
  'no-error-caught',
  'no-boundary-details',
  'no-error-view-rendered',
  'no-replaced-subtree',
  'no-global-error-listeners',
  'machinery-unconfirmed',
  'handler-unresolved',
  'hook-refused',
  'no-core-version',
];

/** A pin that a value reddens: returns the failure the pin raises on it. */
function reddens(pin, what) {
  let failure = null;
  try {
    pin();
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    `${what} passed on the mutant, so the mutation is not caught`,
  );
  return failure;
}

describe('error-boundary.js is pure', () => {
  it('evaluates in a context with no DOM, no clock, no console and no network, read from inside', () => {
    const { context } = standalone();
    for (const name of [
      'document',
      'window',
      'performance',
      'setTimeout',
      'setInterval',
      'fetch',
      'XMLHttpRequest',
    ]) {
      assert.equal(
        runInContext(`typeof ${name}`, context),
        'undefined',
        `the module must not run with a ${name} in scope`,
      );
    }
    // Two names no JavaScript context withholds: V8 installs `Date` in every realm and Node installs
    // `console` in every context it creates. This records what is really in scope, and the next test
    // pins that the module reaches for neither.
    assert.equal(
      runInContext('typeof Date', context),
      'function',
      'a vm context carries V8\u2019s Date whatever the sandbox says, so the clock cannot be withheld',
    );
    assert.equal(
      runInContext('typeof console', context),
      'object',
      'a vm context carries Node\u2019s console whatever the sandbox says, so the console cannot be withheld',
    );
    assert.deepEqual(
      Object.keys(context.angularAiErrorBoundary),
      ['readErrorBoundary'],
      'the module publishes one function and nothing else',
    );
  });

  it('reaches for no host global when the join runs: each of them is a trap inside the context', () => {
    // The traps are armed, and they are proven armed before anything is asserted through them: a
    // guard that did not throw would make every pin below pass on any module.
    const context = guardedContext();
    assert.throws(
      () => runInContext('Date.now()', context),
      /the module reached for Date/,
      'the Date trap must bite, or the guard is decoration',
    );
    assert.throws(
      () => runInContext('console.log("x")', context),
      /the module reached for console/,
      'the console trap must bite, or the guard is decoration',
    );
    assert.throws(
      () => runInContext('document.createElement("div")', context),
      /the module reached for document/,
      'the DOM trap must bite, or the guard is decoration',
    );
    // The pin, on the unmutated module, run wholly inside the guarded context.
    assert.deepEqual(guarded(SRC, caughtRecord()), plain(caughtAnswer(SRC)));
    const idle = guarded(SRC, recordOf({ state: 'idle' }));
    assert.equal(
      idle.state,
      'idle',
      'a state the reader was not written for travels through while every host global in scope is a trap',
    );
    console.log(
      'error-boundary guarded: the join answers with no host global in scope',
    );
  });

  it('holds no DOM read, no clock, no console and no network call in its code', () => {
    const body = code(SRC);
    for (const [what, pattern] of [
      ['a document read', /\bdocument\b/],
      ['a window read', /\bwindow\b/],
      ['a console call', /\bconsole\b/],
      ['a clock read', /\b(Date|performance|setTimeout|setInterval)\b/],
      ['a DOM query', /\b(querySelector|getElementById|createElement)\b/],
      ['a network call', /\b(fetch|XMLHttpRequest)\b/],
      ['a page read', /\bgetContext\b|\bng\.\w+/],
      ['a second tap', /\bsetProfiler\b|ɵ/],
    ]) {
      assert.equal(
        pattern.test(body),
        false,
        `error-boundary.js must contain no ${what}: ${pattern}`,
      );
    }
  });

  it('answers the same record twice with the same value, and reads no receipt time', () => {
    const { boundary } = standalone();
    assert.deepEqual(
      plain(boundary.readErrorBoundary(caughtRecord())),
      plain(boundary.readErrorBoundary(caughtRecord())),
    );
    // The arrival's own receipt time is the record's, and the answer carries none of it: an answer
    // that moved with `at` would be reading a clock, which is the one thing this file may not do.
    const later = plain(
      boundary.readErrorBoundary(
        recordOf({
          entries: [{ ...hookArrival(DIFFERING_DETAILS), at: 999999 }],
        }),
      ),
    );
    assert.deepEqual(later, plain(boundary.readErrorBoundary(caughtRecord())));
    for (const finding of later.findings) {
      assert.equal('at' in finding, false, 'a finding carries no receipt time');
    }
  });
});

/** The caught answer, derived the same way inside and outside the guarded context. */
function caughtAnswer(source) {
  return standalone(source).boundary.readErrorBoundary(caughtRecord());
}

describe('the record shape this reader consumes is the one the page agent publishes', () => {
  it('reads only the fields T003 records', () => {
    for (const field of RECORD_FIELDS) {
      assert.equal(
        AGENT_BOUNDARY.includes(`${field}:`),
        true,
        `extension/agent-main.js publishes no \`${field}\` in its boundary record: the reader is written against a record the agent does not carry`,
      );
    }
    for (const field of ENTRY_FIELDS) {
      assert.equal(
        AGENT_BOUNDARY.includes(`${field}:`),
        true,
        `extension/agent-main.js publishes no \`${field}\` on a boundary arrival`,
      );
    }
    // The route words, the install states and the three absences the agent answers with, as its own
    // source spells them: the join's vocabulary at record level is the agent's, not its own.
    for (const word of [
      'installed',
      'cannot-tell',
      'hook',
      'handler',
      'declared',
      'no-global-error-listeners',
      'machinery-unconfirmed',
      'handler-unresolved',
      'hook-refused',
    ]) {
      assert.equal(
        AGENT_BOUNDARY.includes(`'${word}'`),
        true,
        `extension/agent-main.js never spells \`${word}\`: the record this reader consumes cannot carry it`,
      );
    }
    console.log(
      `error-boundary record: ${RECORD_FIELDS.length} section fields and ${ENTRY_FIELDS.length} entry fields held to extension/agent-main.js`,
    );
  });

  it('states the absence names this join can answer with', () => {
    const body = code(SRC);
    for (const absence of ABSENCES) {
      assert.equal(
        body.includes(`'${absence}'`),
        true,
        `error-boundary.js cannot answer \`${absence}\`, which the milestone names`,
      );
    }
  });
});

describe('the recording the frames are derived from', () => {
  it('carries the throwing view and the declaring view as two recorded answers', () => {
    assert.ok(
      DIFFERING_PAIR,
      `no recorded onViewError payload names two different views: ${JSON.stringify(TYPE_PAIRS)}`,
    );
    assert.ok(
      SAME_PAIR,
      `no recorded onViewError payload names one view twice: ${JSON.stringify(TYPE_PAIRS)}`,
    );
    assert.equal(
      typeof ERROR_NAME,
      'string',
      'the recording names no error constructor',
    );
    assert.equal(
      RECORDING.hook.fallback.prefixIsTheProbesOwnTemplate,
      true,
      'the recording no longer says the rendered prefix is the probe\u2019s own template',
    );
    assert.equal(
      RECORDING.hook.fallback.carriesTheErrorsOwnMessage,
      true,
      'the recording no longer says the rendered text carries the error\u2019s own message',
    );
    assert.equal(
      RENDERED_TEXT.startsWith(RENDERED_PREFIX),
      true,
      'the recorded fallback text does not begin with the prefix the recording names',
    );
    assert.notEqual(
      THROWN_MESSAGE,
      RENDERED_TEXT,
      'the thrown message and the rendered text must differ here, or the case this suite pins is not the case',
    );
    assert.equal(
      RECORDING.version.declares.onAPage,
      null,
      'the recording now says some page reports its own core version, which the reader must not assume',
    );
    assert.equal(
      RECORDING.version.enumerated.reportsItsOwnVersion.reportedBy,
      0,
      'the recording now counts a page that reports its own version',
    );
    console.log(
      `error-boundary recording: throwing ${DIFFERING_PAIR.declarationType} / declaring ${DIFFERING_PAIR.boundaryType}, and one view ${SAME_PAIR.declarationType}; rendered "${RENDERED_TEXT}"`,
    );
  });
});

// ---------------------------------------------------------------- the pins ----

/**
 * E1's pin: the throwing view and the declaring view are two facts, and the record whose two types
 * are the same type renders that one type once, with no parent invented for it.
 */
function pinTwoFactsApart(boundary) {
  const answer = plain(boundary.readErrorBoundary(caughtRecord()));
  assert.equal(
    answer.state,
    'caught',
    'E1 catch-is-a-finding: a boundary that caught an error is a caught answer',
  );
  assert.equal(answer.absence, null, 'E1 caught-names-no-absence-of-its-own');
  assert.equal(answer.findings.length, 1, 'E1 one-arrival-one-finding');
  const finding = answer.findings[0];
  assert.equal(
    finding.declaringType,
    DIFFERING_PAIR.boundaryType,
    'E1 declaring-type-from-boundary: the component that declares the boundary is read from the boundary\u2019s own type and from nowhere else',
  );
  assert.equal(
    finding.throwingType,
    DIFFERING_PAIR.declarationType,
    'E1 throwing-type-from-declaration: the component whose template threw is read from the declaration the catch carried',
  );
  assert.notEqual(
    finding.declaringType,
    finding.throwingType,
    'E1 thrower-is-not-the-boundary: the two facts are reported apart, and neither stands in for the other',
  );
  assert.equal(
    finding.caughtBy,
    true,
    'E1 caught-by-beside-them: the caught-by mechanism the payload carried is reported beside the two types',
  );
  assert.equal(
    finding.reset,
    true,
    'E1 reset-where-carried: a reset is reported as available where the record carries one',
  );
  assert.equal(finding.route, 'hook', 'E1 the-route-the-error-arrived-by');

  // The construction path: one view, so the same type twice, and no invented parent.
  const same = plain(
    boundary.readErrorBoundary(
      recordOf({ entries: [hookArrival(SAME_DETAILS)] }),
    ),
  );
  assert.equal(same.state, 'caught', 'E1 construction-is-a-catch');
  const once = same.findings[0];
  assert.equal(
    once.declaringType,
    SAME_PAIR.boundaryType,
    'E1 construction-declaring-type: the construction catch names the declaring view',
  );
  assert.equal(
    once.throwingType,
    SAME_PAIR.declarationType,
    'E1 construction-throwing-type: and the declaration it carried is the same view',
  );
  assert.equal(
    once.declaringType,
    once.throwingType,
    'E1 one-type-renders-once: the same type is one answer, twice',
  );
  assert.equal(
    once.caughtBy,
    null,
    'E1 construction-carries-no-caught-by: the construction shape omits the field, and nothing fills it in',
  );
  assert.deepEqual(
    Object.keys(once).sort(),
    FINDING_KEYS,
    'E1 no-invented-parent: a finding carries the nine contract fields and no tenth — no parent type, no node, no tag',
  );
  return answer;
}

/**
 * E2's pin: a subject record with no boundary answers `no-error-boundary-declared`, names no
 * boundary, no declaring component and no reset, and never stands an empty string in for a boundary.
 */
function pinNoBoundaryDeclared(boundary) {
  for (const [what, record] of [
    ['no record at all', undefined],
    ['an empty record', {}],
    ['a record carrying only an entries list', { entries: [] }],
    ['a record whose state is not a word', { state: null }],
  ]) {
    const answer = plain(boundary.readErrorBoundary(record));
    assert.equal(
      answer.state,
      'cannot-tell',
      `E2 no-boundary-is-cannot-tell: ${what}`,
    );
    assert.equal(
      answer.absence,
      'no-error-boundary-declared',
      `E2 no-error-boundary-declared: ${what}`,
    );
    assert.equal(
      answer.absences.includes('no-error-boundary-declared'),
      true,
      `E2 the-absence-is-carried: ${what}`,
    );
    assert.deepEqual(
      answer.findings,
      [],
      `E2 names-no-declaring-component: ${what}`,
    );
    assert.equal(
      JSON.stringify(answer).includes('""'),
      false,
      `E2 never-an-empty-string: no field of the answer stands an empty string in for a boundary (${what})`,
    );
  }

  // A hook arrival whose payload carried no boundary is the other shape of the same answer: the
  // record itself named no boundary, so none is named here.
  const arrival = plain(boundary.readErrorBoundary(noBoundaryRecord()));
  assert.equal(
    arrival.state,
    'cannot-tell',
    'E2 a-hook-arrival-without-a-boundary-is-cannot-tell',
  );
  assert.equal(
    arrival.absence,
    'no-error-boundary-declared',
    'E2 a-hook-arrival-without-a-boundary-names-the-absence',
  );
  const finding = arrival.findings[0];
  assert.equal(
    finding.declaringType,
    null,
    'E2 no-empty-string-for-a-boundary: a boundary the record did not name is null and never an empty string',
  );
  assert.equal(finding.reset, null, 'E2 names-no-reset');
  assert.equal(
    finding.caughtBy,
    true,
    'E2 the-caught-by-the-payload-carried-is-still-reported',
  );
  assert.equal(
    JSON.stringify(arrival).includes('""'),
    false,
    'E2 never-an-empty-string: not in the finding either',
  );
  return plain(boundary.readErrorBoundary({}));
}

/**
 * E4's pin: the error is the thrown value's own name and message, the fallback's rendered text is
 * content reported under its own name, and that text appears in no field of the finding.
 */
function pinErrorIsNotTheView(boundary) {
  const answer = plain(boundary.readErrorBoundary(fallbackRecord()));
  const finding = answer.findings[0];
  assert.equal(
    finding.errorName,
    ERROR_NAME,
    'E4 error-name-is-the-thrown-name: the error\u2019s own name is reported',
  );
  assert.equal(
    finding.errorMessage,
    THROWN_MESSAGE,
    'E4 error-message-is-the-thrown-message: the error\u2019s own message is reported',
  );
  assert.notEqual(
    finding.errorMessage,
    RENDERED_TEXT,
    'E4 fallback-is-not-the-error: the rendered text never stands as the error\u2019s message',
  );
  const text = JSON.stringify(finding);
  assert.equal(
    text.includes(RENDERED_TEXT),
    false,
    'E4 rendered-text-in-no-finding-field: no field of the finding carries the text the @error view rendered',
  );
  assert.equal(
    text.includes(RENDERED_PREFIX),
    false,
    'E4 probe-template-in-no-finding-field: not even the prefix the probe\u2019s own template wrote',
  );
  assert.equal(
    answer.fallback,
    RENDERED_TEXT,
    'E4 fallback-reported-as-content: the rendered text is reported as fallback content and under no other name',
  );
  return answer;
}

/**
 * E5's pin: an installed hook that caught nothing and a view reader that found no rendered error
 * view answer two different absences, and neither is rendered as zero errors.
 */
function pinTheTwoAbsencesStayDistinct(boundary) {
  const nothingCaught = plain(boundary.readErrorBoundary(recordOf({})));
  assert.equal(
    nothingCaught.state,
    'cannot-tell',
    'E5 nothing-caught-is-cannot-tell: an installed hook that caught nothing cannot tell',
  );
  assert.equal(
    nothingCaught.absence,
    'no-error-caught',
    'E5 no-error-caught: the absence names what did not happen, and not that no boundary exists',
  );
  assert.deepEqual(nothingCaught.findings, [], 'E5 nothing-to-find');

  const noView = plain(
    boundary.readErrorBoundary(
      fallbackRecord({
        errorView: { state: 'no-error-view-rendered', text: null },
      }),
    ),
  );
  assert.equal(
    noView.absences.includes('no-error-view-rendered'),
    true,
    'E5 no-error-view-rendered: a view reader holding an error and no @error view names that absence',
  );
  assert.equal(
    noView.state,
    'caught',
    'E5 a-view-absence-beside-a-finding: the error is still a caught finding',
  );
  assert.equal(
    noView.absence,
    null,
    'E5 the-view-absence-is-not-the-answer-absence: the finding is not overwritten by the view absence',
  );
  assert.notEqual(
    nothingCaught.absence,
    'no-error-view-rendered',
    'E5 the-two-absences-stay-distinct: a window that caught nothing is not a view that rendered nothing',
  );

  for (const [what, answer] of [
    ['no-error-caught', nothingCaught],
    ['no-error-view-rendered', noView],
  ]) {
    const text = JSON.stringify(answer).toLowerCase();
    for (const zero of ['zero', 'no errors', 'none', ':0', ' 0 ']) {
      assert.equal(
        text.includes(zero),
        false,
        `E5 nothing-is-a-count: the ${what} answer must not read as a count (${zero}): ${text}`,
      );
    }
  }
  console.log(
    `error-boundary E5: ${JSON.stringify(nothingCaught.absence)} and ${JSON.stringify(noView.absences)}`,
  );
  return nothingCaught;
}

/**
 * E6's pin: a thrown value that is not `Error`-like is reported as the boundary's own wrapped error
 * with its cause, and a thrown `Error` is reported as itself — never coerced to a string, never
 * re-wrapped.
 */
function pinTheWrappedValueAndTheThrownError(boundary) {
  const wrapped = plain(boundary.readErrorBoundary(wrappedRecord()));
  const wrapper = wrapped.findings[0];
  assert.equal(
    wrapper.errorName,
    WRAPPED_NAME,
    'E6 the-wrapped-value: a non-Error thrown value is reported as the boundary\u2019s own wrapped error',
  );
  assert.deepEqual(
    wrapper.cause,
    WRAPPED_CAUSE,
    'E6 the-wrapped-cause: the cause the record carried is reported as it arrived',
  );

  const thrown = plain(boundary.readErrorBoundary(caughtRecord()));
  const error = thrown.findings[0];
  assert.equal(
    error.errorName,
    ERROR_NAME,
    'E6 an-error-is-reported-as-itself: a thrown Error keeps its own name, even where the boundary also wrapped something',
  );
  assert.equal(
    error.errorMessage,
    THROWN_MESSAGE,
    'E6 an-error-is-not-coerced-to-a-string: the message is the record\u2019s, not String(error)',
  );
  assert.equal(
    error.cause,
    null,
    'E6 an-error-is-not-re-wrapped: a thrown Error carries no cause and the reader adds none',
  );
  return thrown;
}

/**
 * E7's pin: an error delivered with no details has no boundary and no caught-by mechanism, and a
 * record that also carries a boundary is not overwritten by that absence.
 */
function pinADeliveryHasNoBoundary(boundary) {
  const delivery = plain(boundary.readErrorBoundary(deliveryRecord()));
  assert.equal(
    delivery.state,
    'cannot-tell',
    'E7 a-delivery-with-no-details-is-cannot-tell: an arrival with no ErrorDetails is cannot-tell',
  );
  assert.equal(
    delivery.absence,
    'no-boundary-details',
    'E7 no-boundary-details: the absence names the details that did not arrive',
  );
  const finding = delivery.findings[0];
  assert.equal(finding.declaringType, null, 'E7 names-no-boundary');
  assert.equal(finding.caughtBy, null, 'E7 names-no-caught-by');
  assert.equal(finding.reset, null, 'E7 names-no-reset');
  assert.equal(finding.route, 'handler', 'E7 the-route-the-error-arrived-by');
  assert.equal(
    finding.errorName,
    ERROR_NAME,
    'E7 the-error-is-still-the-error: no details means no boundary, not no error',
  );

  const mixed = plain(boundary.readErrorBoundary(mixedRecord()));
  assert.equal(
    mixed.state,
    'caught',
    'E7 a-boundary-arrival-is-not-overwritten: a record that also carries a boundary keeps its finding',
  );
  assert.equal(
    mixed.absence,
    null,
    'E7 a-boundary-arrival-keeps-its-answer: the delivery\u2019s absence does not become the answer\u2019s absence',
  );
  assert.equal(mixed.findings.length, 2, 'E7 every-arrival-is-a-finding');
  const boundaryFinding = mixed.findings[0];
  assert.equal(
    boundaryFinding.declaringType,
    DIFFERING_PAIR.boundaryType,
    'E7 a-boundary-arrival-keeps-its-boundary: the boundary named by its own arrival is not replaced',
  );
  assert.equal(
    boundaryFinding.caughtBy,
    true,
    'E7 a-boundary-arrival-keeps-its-caught-by',
  );
  assert.equal(
    mixed.absences.includes('no-boundary-details'),
    true,
    'E7 the-delivery-absence-is-still-named: beside the finding, the absence of that arrival is answered',
  );
  return delivery;
}

/** The claims a replaced subtree would be made of: a node, a tag, a text or a count. */
const SUBTREE_CLAIMS = [
  ['node', /\bnodes?\b/i],
  ['tag', /<\/?[a-z]|\btags?\b/i],
  ['text', /\btexts?\b/i],
  ['count', /\bcounts?\b|\bchildren\b|\d+ (?:nodes?|elements?)\b/i],
];

/**
 * E8's pin: the substituted subtree is the named absence, and no node, tag, text or count of the
 * replaced primary view appears anywhere in the answer.
 */
function pinNoSubtree(boundary) {
  const answer = plain(boundary.readErrorBoundary(fallbackRecord()));
  const finding = answer.findings[0];
  assert.equal(
    finding.replacedSubtree,
    'no-replaced-subtree',
    'E8 no-replaced-subtree: the subtree the boundary replaced is the named absence',
  );
  assert.equal(
    answer.absences.includes('no-replaced-subtree'),
    true,
    'E8 the-absence-is-carried: every answer with a finding names the absence',
  );
  const text = JSON.stringify(answer);
  for (const [what, pattern] of SUBTREE_CLAIMS) {
    assert.equal(
      pattern.test(text),
      false,
      `E8 no-replaced-${what}: no ${what} of the replaced primary view appears in any field of the answer: ${text}`,
    );
  }
  return answer;
}

/**
 * The machinery pin: a record whose state is the page agent's own absence propagates as
 * `cannot-tell` with that absence, and never as an empty boundary list.
 */
function pinMachineryAbsence(boundary) {
  for (const absence of [
    'machinery-unconfirmed',
    'handler-unresolved',
    'hook-refused',
  ]) {
    const answer = plain(boundary.readErrorBoundary(machineryRecord(absence)));
    assert.equal(
      answer.state,
      'cannot-tell',
      `the-machinery-absence-is-cannot-tell: ${absence}`,
    );
    assert.equal(
      answer.absence,
      absence,
      `the-machinery-absence-is-named: the page agent\u2019s own absence travels through as itself (${absence})`,
    );
    assert.equal(
      answer.absences.includes(absence),
      true,
      `the-machinery-absence-is-carried: ${absence}`,
    );
    assert.notEqual(
      answer.absence,
      'no-error-boundary-declared',
      `the-machinery-absence-is-its-own: ${absence} is not the boundary absence`,
    );
  }
  // A record whose absence the reader was not written for still says the one thing it established.
  const unnamed = plain(boundary.readErrorBoundary(machineryRecord(null)));
  assert.equal(
    unnamed.absence,
    'machinery-unconfirmed',
    'the-machinery-absence-is-named: a record naming no reason is answered with the one absence it established, never with nothing',
  );
  console.log(
    `error-boundary machinery: ${JSON.stringify(machineryRecord('machinery-unconfirmed').absence)} -> cannot-tell`,
  );
  return unnamed;
}

describe('E1 — the throwing view and the declaring view are two facts', () => {
  it('E1 — reports the boundary\u2019s own type and the declaration the catch carried apart', () => {
    const { boundary } = standalone();
    const answer = pinTwoFactsApart(boundary);
    assert.deepEqual(Object.keys(answer).sort(), ANSWER_KEYS);
    console.log(
      `error-boundary caught: declaring ${JSON.stringify(answer.findings[0].declaringType)} throwing ${JSON.stringify(answer.findings[0].throwingType)}`,
    );
  });
});

describe('E2 — a record with no boundary names no boundary', () => {
  it('E2 — answers cannot-tell/no-error-boundary-declared and stands no empty string in for one', () => {
    const { boundary } = standalone();
    const answer = pinNoBoundaryDeclared(boundary);
    console.log(`error-boundary no boundary: ${JSON.stringify(answer)}`);
  });
});

describe('E4 — the error is the thrown value, never the view\u2019s text', () => {
  it('E4 — reports the thrown name and message and the rendered text as fallback content', () => {
    const { boundary } = standalone();
    const answer = pinErrorIsNotTheView(boundary);
    console.log(
      `error-boundary E4: error ${JSON.stringify(THROWN_MESSAGE)} fallback ${JSON.stringify(answer.fallback)}`,
    );
  });
});

describe('E5 — nothing caught and no error view rendered stay distinct', () => {
  it('E5 — answers no-error-caught and no-error-view-rendered, and neither as zero errors', () => {
    const { boundary } = standalone();
    pinTheTwoAbsencesStayDistinct(boundary);
  });
});

describe('E6 — a wrapped value and a thrown Error', () => {
  it('E6 — reports the boundary\u2019s wrapper with its cause and a thrown Error as itself', () => {
    const { boundary } = standalone();
    const thrown = pinTheWrappedValueAndTheThrownError(boundary);
    console.log(
      `error-boundary E6: ${WRAPPED_NAME} + cause, and ${JSON.stringify(thrown.findings[0].errorName)} as itself`,
    );
  });
});

describe('E7 — an arrival with no details has no boundary', () => {
  it('E7 — answers no-boundary-details and does not overwrite a boundary beside it', () => {
    const { boundary } = standalone();
    const delivery = pinADeliveryHasNoBoundary(boundary);
    console.log(`error-boundary E7: ${JSON.stringify(delivery.absence)}`);
  });
});

describe('E8 — the replaced subtree is the named absence', () => {
  it('E8 — carries no-replaced-subtree and no node, tag, text or count', () => {
    const { boundary } = standalone();
    pinNoSubtree(boundary);
    console.log(
      'error-boundary E8: no-replaced-subtree, and nothing of the primary view',
    );
  });
});

describe('a state the reader was not written for travels through', () => {
  it('passes the word through and claims nothing about it', () => {
    const { boundary } = standalone();
    for (const state of ['idle', 'watching', 'halted']) {
      const answer = plain(boundary.readErrorBoundary(recordOf({ state })));
      assert.equal(
        answer.state,
        state,
        `a-state-not-written-for-travels-through: ${state} is echoed and not coerced into a neighbouring state`,
      );
      assert.equal(answer.absence, null, 'a-passthrough-claims-no-absence');
      assert.deepEqual(answer.findings, [], 'a-passthrough-claims-no-finding');
      assert.deepEqual(
        answer.absences,
        [],
        'a-passthrough-claims-no-absence-beside-it',
      );
      assert.equal(
        answer.version,
        WORKED_AGAINST,
        'the-version-is-the-surface\u2019s-own',
      );
      assert.equal(
        answer.coreVersion,
        null,
        'the-version-the-page-reported-is-echoed',
      );
    }
  });

  it('keeps every named absence inside the vocabulary the milestone states', () => {
    const { boundary } = standalone();
    const seen = new Set();
    for (const record of [
      caughtRecord(),
      recordOf({}),
      undefined,
      noBoundaryRecord(),
      deliveryRecord(),
      mixedRecord(),
      machineryRecord('machinery-unconfirmed'),
      machineryRecord('handler-unresolved'),
      machineryRecord('hook-refused'),
      fallbackRecord({ errorView: { state: 'no-error-view-rendered' } }),
      fallbackRecord({ globalListeners: 'no-global-error-listeners' }),
    ]) {
      const answer = plain(boundary.readErrorBoundary(record));
      for (const absence of answer.absences) seen.add(absence);
      if (answer.absence !== null) seen.add(answer.absence);
    }
    for (const absence of seen) {
      assert.equal(
        ABSENCES.includes(absence),
        true,
        `an unexpected absence was emitted: ${absence}`,
      );
    }
    assert.deepEqual([...seen].sort(), [...ABSENCES].sort());
    console.log(`error-boundary absences: ${[...seen].sort().join(', ')}`);
  });
});

describe('the machinery absence propagates', () => {
  it('answers cannot-tell with the page agent\u2019s own absence and never an empty boundary list', () => {
    const { boundary } = standalone();
    const answer = pinMachineryAbsence(boundary);
    assert.equal(
      JSON.stringify(answer).includes('no errors'),
      false,
      'the-machinery-absence-is-not-no-errors: an unconfirmed page is not a page without errors',
    );
  });
});

describe('mutants redden by name', () => {
  it('reddens by name: the throwing view presented as the boundary', () => {
    // Pin the unmutated module first, so the mutation below is the only cause of a red pin.
    pinTwoFactsApart(standalone().boundary);

    const anchor =
      "      declaringType: textOf(fieldOf(details, 'boundaryType')),\n" +
      '      // The *throwing* view: the declaration the catch carried. On the construction path this is the\n' +
      '      // declaring view itself \u2014 the same name, never a parent derived from it.\n' +
      "      throwingType: textOf(fieldOf(details, 'declarationType')),";
    const mutated = SRC.replace(
      anchor,
      "      declaringType: textOf(fieldOf(details, 'declarationType')),\n" +
        '      // The *throwing* view: the declaration the catch carried. On the construction path this is the\n' +
        '      // declaring view itself \u2014 the same name, never a parent derived from it.\n' +
        "      throwingType: textOf(fieldOf(details, 'boundaryType')),",
    );
    assert.notEqual(
      mutated,
      SRC,
      'the swap mutation target is gone from error-boundary.js — restate the bite in extension/error-boundary.test.mjs',
    );
    const mutant = standalone(mutated).boundary;
    const swapped = plain(mutant.readErrorBoundary(caughtRecord())).findings[0];
    assert.equal(
      swapped.declaringType,
      DIFFERING_PAIR.declarationType,
      'the mutant names the throwing view as the boundary',
    );

    const failure = reddens(
      () => pinTwoFactsApart(mutant),
      'the two-facts pin',
    );
    assert.match(
      failure.message,
      /E1 declaring-type-from-boundary/,
      `the swap mutant must redden the two-facts pin by name: ${failure.message}`,
    );
    console.log(
      `error-boundary M1 (thrower as the boundary) -> declaring ${JSON.stringify(swapped.declaringType)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: the fallback quoted as the error', () => {
    pinErrorIsNotTheView(standalone().boundary);

    const anchor =
      '    const findings = [];\n' +
      '    for (const entry of list) {\n' +
      '      const finding = findingOf(entry);\n' +
      '      if (finding !== null) findings.push(finding);\n' +
      '    }';
    const mutated = SRC.replace(
      anchor,
      '    const findings = [];\n' +
        '    for (const entry of list) {\n' +
        '      const finding = findingOf(entry);\n' +
        '      if (finding !== null) {\n' +
        '        finding.errorMessage = fallbackOf(read);\n' +
        '        findings.push(finding);\n' +
        '      }\n' +
        '    }',
    );
    assert.notEqual(
      mutated,
      SRC,
      'the fallback mutation target is gone from error-boundary.js — restate the bite in extension/error-boundary.test.mjs',
    );
    const mutant = standalone(mutated).boundary;
    const quoted = plain(mutant.readErrorBoundary(fallbackRecord()))
      .findings[0];
    assert.equal(
      quoted.errorMessage,
      RENDERED_TEXT,
      'the mutant quotes the rendered fallback as the error message',
    );

    const failure = reddens(
      () => pinErrorIsNotTheView(mutant),
      'the error-is-not-the-view pin',
    );
    assert.match(
      failure.message,
      /E4 error-message-is-the-thrown-message|E4 fallback-is-not-the-error/,
      `the fallback mutant must redden the error pin by name: ${failure.message}`,
    );
    console.log(
      `error-boundary M2 (fallback as the error) -> errorMessage ${JSON.stringify(quoted.errorMessage)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: the replaced subtree reported though nothing recorded it', () => {
    pinNoSubtree(standalone().boundary);

    const anchor = '      replacedSubtree: NO_REPLACED_SUBTREE,';
    const mutated = SRC.replace(
      anchor,
      "      replacedSubtree: 'the replaced <div> and its 2 nodes',",
    );
    assert.notEqual(
      mutated,
      SRC,
      'the subtree mutation target is gone from error-boundary.js — restate the bite in extension/error-boundary.test.mjs',
    );
    const mutant = standalone(mutated).boundary;
    const reported = plain(mutant.readErrorBoundary(fallbackRecord()))
      .findings[0];
    assert.equal(
      reported.replacedSubtree,
      'the replaced <div> and its 2 nodes',
      'the mutant invents a subtree the boundary recorded nowhere',
    );

    const failure = reddens(() => pinNoSubtree(mutant), 'the no-subtree pin');
    assert.match(
      failure.message,
      /E8 no-replaced-subtree/,
      `the subtree mutant must redden the no-subtree pin by name: ${failure.message}`,
    );
    console.log(
      `error-boundary M3 (subtree invented) -> replacedSubtree ${JSON.stringify(reported.replacedSubtree)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: an empty list where the machinery is unconfirmed', () => {
    pinMachineryAbsence(standalone().boundary);

    const anchor = '    if (state === CANNOT_TELL) {';
    const mutated = SRC.replace(anchor, "    if (state === 'unreachable') {");
    assert.notEqual(
      mutated,
      SRC,
      'the machinery mutation target is gone from error-boundary.js — restate the bite in extension/error-boundary.test.mjs',
    );
    const mutant = standalone(mutated).boundary;
    const emptied = plain(
      mutant.readErrorBoundary(machineryRecord('machinery-unconfirmed')),
    );
    assert.equal(
      emptied.absence,
      null,
      'the mutant answers an unconfirmed page with no absence at all',
    );
    assert.deepEqual(
      emptied.absences,
      [],
      'the mutant answers an unconfirmed page with an empty absence list',
    );

    const failure = reddens(
      () => pinMachineryAbsence(mutant),
      'the machinery pin',
    );
    assert.match(
      failure.message,
      /the-machinery-absence-is-named/,
      `the machinery mutant must redden the machinery pin by name: ${failure.message}`,
    );
    console.log(
      `error-boundary M4 (unconfirmed machinery answered empty) -> ${JSON.stringify(emptied)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a boundary named on a handler-only arrival', () => {
    pinADeliveryHasNoBoundary(standalone().boundary);

    const anchor =
      "      declaringType: textOf(fieldOf(details, 'boundaryType')),";
    const mutated = SRC.replace(
      anchor,
      '      declaringType:\n' +
        "        textOf(fieldOf(details, 'boundaryType')) ||\n" +
        "        textOf(fieldOf(error, 'name')),",
    );
    assert.notEqual(
      mutated,
      SRC,
      'the handler mutation target is gone from error-boundary.js — restate the bite in extension/error-boundary.test.mjs',
    );
    const mutant = standalone(mutated).boundary;
    const named = plain(mutant.readErrorBoundary(deliveryRecord())).findings[0];
    assert.equal(
      named.declaringType,
      ERROR_NAME,
      'the mutant names a boundary on an arrival that carried no details, out of the error\u2019s own name',
    );

    const failure = reddens(
      () => pinADeliveryHasNoBoundary(mutant),
      'the delivery pin',
    );
    assert.match(
      failure.message,
      /E7 a-delivery-with-no-details-is-cannot-tell|E7 names-no-boundary/,
      `the handler mutant must redden the delivery pin by name: ${failure.message}`,
    );
    console.log(
      `error-boundary M5 (boundary named on a delivery) -> declaringType ${JSON.stringify(named.declaringType)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: the two absences collapsed into one', () => {
    pinTheTwoAbsencesStayDistinct(standalone().boundary);

    const anchor = '        NO_ERROR_CAUGHT,\n        findings,';
    const mutated = SRC.replace(
      anchor,
      '        NO_ERROR_VIEW_RENDERED,\n        findings,',
    );
    assert.notEqual(
      mutated,
      SRC,
      'the two-absences mutation target is gone from error-boundary.js — restate the bite in extension/error-boundary.test.mjs',
    );
    const mutant = standalone(mutated).boundary;
    const collapsed = plain(mutant.readErrorBoundary(recordOf({})));
    assert.equal(
      collapsed.absence,
      'no-error-view-rendered',
      'the mutant answers a window that caught nothing with the view absence',
    );

    const failure = reddens(
      () => pinTheTwoAbsencesStayDistinct(mutant),
      'the two-absences pin',
    );
    assert.match(
      failure.message,
      /E5 no-error-caught|E5 the-two-absences-stay-distinct/,
      `the collapse mutant must redden the two-absences pin by name: ${failure.message}`,
    );
    console.log(
      `error-boundary M6 (absences collapsed) -> ${JSON.stringify(collapsed.absence)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: every error reported as the boundary\u2019s wrapper', () => {
    pinTheWrappedValueAndTheThrownError(standalone().boundary);

    const anchor = "      errorName: textOf(fieldOf(error, 'name')),";
    const mutated = SRC.replace(anchor, `      errorName: '${WRAPPED_NAME}',`);
    assert.notEqual(
      mutated,
      SRC,
      'the wrapper mutation target is gone from error-boundary.js — restate the bite in extension/error-boundary.test.mjs',
    );
    const mutant = standalone(mutated).boundary;
    const rewritten = plain(mutant.readErrorBoundary(caughtRecord()))
      .findings[0];
    assert.equal(
      rewritten.errorName,
      WRAPPED_NAME,
      'the mutant re-wraps an Error the app threw itself',
    );

    const failure = reddens(
      () => pinTheWrappedValueAndTheThrownError(mutant),
      'the wrapper pin',
    );
    assert.match(
      failure.message,
      /E6 an-error-is-reported-as-itself/,
      `the wrapper mutant must redden the wrapper pin by name: ${failure.message}`,
    );
    console.log(
      `error-boundary M7 (an Error re-wrapped) -> errorName ${JSON.stringify(rewritten.errorName)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: an empty string standing in for a boundary', () => {
    pinNoBoundaryDeclared(standalone().boundary);

    const anchor =
      "    return typeof value === 'string' && value !== '' ? value : null;";
    const mutated = SRC.replace(
      anchor,
      "    return typeof value === 'string' ? value : '';",
    );
    assert.notEqual(
      mutated,
      SRC,
      'the empty-string mutation target is gone from error-boundary.js — restate the bite in extension/error-boundary.test.mjs',
    );
    const mutant = standalone(mutated).boundary;
    const stood = plain(mutant.readErrorBoundary(noBoundaryRecord()))
      .findings[0];
    assert.equal(
      stood.declaringType,
      '',
      'the mutant stands an empty string in for the boundary the record did not name',
    );

    const failure = reddens(
      () => pinNoBoundaryDeclared(mutant),
      'the no-boundary pin',
    );
    assert.match(
      failure.message,
      /E2 no-empty-string-for-a-boundary|E2 never-an-empty-string/,
      `the empty-string mutant must redden the no-boundary pin by name: ${failure.message}`,
    );
    console.log(
      `error-boundary M8 (empty string as a boundary) -> declaringType ${JSON.stringify(stood.declaringType)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a clock read inside the join', () => {
    guarded(SRC, caughtRecord());

    const anchor = '  function findingOf(entry) {';
    const mutated = SRC.replace(
      anchor,
      anchor + '\n    const readAt = Date.now();',
    );
    assert.notEqual(
      mutated,
      SRC,
      'the clock mutation target is gone from error-boundary.js — restate the bite in extension/error-boundary.test.mjs',
    );
    // The point of the guard: a bare context cannot see this mutant at all. It answers exactly as the
    // clean module does, so a purity pin that read the sandbox from outside could never catch it.
    assert.deepEqual(
      plain(standalone(mutated).boundary.readErrorBoundary(caughtRecord())),
      plain(standalone().boundary.readErrorBoundary(caughtRecord())),
      'a bare context answers a clock-using module exactly as it answers the clean one',
    );

    const failure = reddens(
      () => guarded(mutated, caughtRecord()),
      'the no-host-global pin',
    );
    assert.match(
      failure.message,
      /reached for Date/,
      `the clock mutant must redden the purity pin by name: ${failure.message}`,
    );
    console.log(
      `error-boundary M9 (Date.now() inside the join) -> reddened: ${failure.message.split('\n')[0]}`,
    );
  });
});
