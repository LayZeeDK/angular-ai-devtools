// Tests for extension/error-routing.js — the join T002 publishes on
// `globalThis.angularAiErrorRouting`, answering purely from the two error records T001
// measured (`research/raw/m060-record-shapes.json`): the global listener's arrivals and
// M042's boundary entries, beside whether an ErrorHandler resolved.
//
// The module is evaluated in a bare `node:vm` context, and the purity pins are made
// *inside* that context: a read of the sandbox from this side never forwards intrinsics,
// so the only pins that can bite are traps armed on the names the join must never reach
// for — the DOM, the window, the console, the clock, the network.
//
// Every mutant is applied to a copy of the module source, after the unmutated module is
// pinned with the same function, and must redden that pin by name: a mutant that survived
// its pin would prove the pin vacuous. Each `it` below first pins the shipped behaviour,
// then mutates, then asserts the failure names the defect by string.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const SRC = readFileSync(
  new URL('../extension/error-routing.js', import.meta.url),
  'utf8',
);

/** The module with its comments removed, so a token scan reads code and not prose. */
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/**
 * The module in a bare context. No DOM, no clock, no console and no network are installed
 * by `node:vm` beyond the two every JavaScript context has (`Date`, and Node's
 * `console`), which the guarded pins below handle. Whatever the caller puts in the
 * sandbox is all the world the module gets.
 */
function standalone(source = SRC, sandbox = {}) {
  const context = createContext(sandbox);
  runInContext(source, context);
  const join = context.angularAiErrorRouting;
  assert.equal(
    typeof join,
    'function',
    'the module must publish the join itself on globalThis.angularAiErrorRouting',
  );
  return join;
}

/**
 * A value from the vm context carries that context's own prototypes, so it is copied into
 * this realm before a structural assertion reads it.
 */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * The globals the join must never reach for. `document`, `window`, `performance`, the two
 * timers, `fetch` and `XMLHttpRequest` are absent from a `node:vm` context altogether;
 * `Date` and `console` are in every context there is, so only a trap can catch a module
 * that used them.
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
 * A global that throws when it is read, called or constructed, naming itself in the
 * error. A module that reached for the clock or the page inside the context hits this on
 * the first touch, which is what makes the guard a guard rather than a decoration.
 */
function tripwire(name) {
  const reached = () => {
    throw new Error('the module reached for ' + name);
  };
  return new Proxy(function tripwire() {}, {
    get: reached,
    set: reached,
    has: reached,
    apply: reached,
    construct: reached,
  });
}

/** The armed-traps context, for the assertions that prove the guard is live. */
function armedContext() {
  const sandbox = {};
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  return createContext(sandbox);
}

/**
 * Runs the join *inside* a context where every one of `HOST_GLOBALS` is a trap, and
 * returns the answer it produced. The record is handed in through the sandbox, so nothing
 * about the call crosses from this realm except the data.
 */
function guarded(input) {
  const sandbox = { __frame: input };
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  const context = createContext(sandbox);
  runInContext(SRC, context);
  return plain(runInContext('angularAiErrorRouting(__frame)', context));
}

/** Applies one mutation to a copy of the module source, or stops with a named failure. */
function mutate(defect, anchor, replacement) {
  const mutated = SRC.replace(anchor, replacement);
  assert.notEqual(
    mutated,
    SRC,
    'the ' +
      defect +
      ' mutation target is gone from extension/error-routing.js — restate the bite in scripts/error-routing.test.mjs',
  );
  return mutated;
}

/** A pin that must redden on a mutant: returns the failure the pin raises on it. */
function reddens(pin, defect) {
  let failure = null;
  try {
    pin();
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    '"' +
      defect +
      '" passed its pin on the mutant, so the mutation is not caught',
  );
  return failure;
}

// ------------------------------------------------- the records the join is handed ----

/**
 * The two artefact paths the record-shapes record names: the global listener's arrivals
 * at agent-main.js:2550-2561 and the boundary entries at agent-main.js:1904-1944. The
 * fixtures carry them the way a recorded record would, so a claim can cite them.
 */
const ERROR_PATH = 'extension/agent-main.js#L2550-L2561';
const BOUNDARY_PATH = 'extension/agent-main.js#L1904-L1944';

/** The uncaught arrival's message, and the message a boundary entry carries. */
const UNCAUGHT_TEXT = 'NG0910: No provider found for InjectionToken WIRE_TOKEN';
const CARRIED_TEXT = 'NG0201: No provider found for InjectionToken OTHER_TOKEN';

/**
 * One listener arrival, in the shape `captureErrorPayload` reduces an arrival to:
 * `{ code, message, component, timestamp }`. The `code` field is the record's own; the
 * join re-derives the code from the message and from nothing else.
 */
function arrival(message, extra = {}) {
  return {
    message,
    code: null,
    component: null,
    timestamp: null,
    artefactPath: ERROR_PATH,
    ...extra,
  };
}

/**
 * One boundary entry, in the M042 shape: the caught error's text, either flat or behind
 * the entry's own `error`, beside the route and the caught-by the payload carried.
 */
function boundaryEntry(message, extra = {}) {
  return {
    message,
    route: 'hook',
    caughtBy: true,
    artefactPath: BOUNDARY_PATH,
    ...extra,
  };
}

/** The frame the join answers: the two error records and whether a handler resolved. */
function frame(extra = {}) {
  return {
    errors: [arrival(UNCAUGHT_TEXT, { component: 'AlphaComponent' })],
    boundaries: [boundaryEntry(CARRIED_TEXT)],
    handler: { name: 'ProxyErrorHandler', artefactPath: BOUNDARY_PATH },
    ...extra,
  };
}

/** The frame whose error text a boundary entry carries: the reached-handler case. */
function reachedFrame() {
  return frame({
    boundaries: [boundaryEntry(UNCAUGHT_TEXT, { component: 'BetaComponent' })],
  });
}

/**
 * The frame with two arrivals: the first uncaught, the last carried. Two identical
 * messages are indistinguishable in the record (E2), so the owner can only ever come from
 * the arrival the finding is about — never from whichever arrival happened to be last.
 */
function twoArrivalsFrame() {
  return frame({
    errors: [
      arrival(UNCAUGHT_TEXT, { component: 'AlphaComponent' }),
      arrival(CARRIED_TEXT, { component: 'ZetaComponent' }),
    ],
  });
}

// ------------------------------------------------- the vocabulary, as the contract names it ----

/** The eight fields an answer carries, and the only fields it carries. */
const ANSWER_KEYS = [
  'absences',
  'claims',
  'code',
  'detail',
  'message',
  'owner',
  'phase',
  'state',
];

/** The four states, and the only states. */
const STATES = [
  'uncaught-with-handler',
  'reached-handler',
  'no-handler-provided',
  'cannot-tell',
];

// ---------------------------------------------------------------- the pins ----

/** The key pin: every answer carries exactly the eight contract fields, in every state. */
function pinEveryFieldInEveryState(join, label) {
  const frames = [
    ['the uncaught frame', frame()],
    ['the reached frame', reachedFrame()],
    ['the no-handler frame', frame({ handler: null })],
    ['no records at all', undefined],
    ['no arrivals recorded', frame({ errors: [] })],
    [
      'a message that names no code',
      frame({ errors: [arrival('Something failed')] }),
    ],
    [
      'a record that carries a phase',
      frame({ errors: [arrival(UNCAUGHT_TEXT, { phase: 'construction' })] }),
    ],
    ['two arrivals', twoArrivalsFrame()],
  ];
  for (const [what, input] of frames) {
    const answer = plain(join(input));
    assert.deepEqual(
      Object.keys(answer).sort(),
      ANSWER_KEYS,
      label +
        ': every answer carries exactly the eight contract fields and no ninth (' +
        what +
        ')',
    );
    assert.equal(
      STATES.includes(answer.state),
      true,
      label +
        ': the state is one of the four the contract names (' +
        what +
        ')',
    );
    assert.equal(
      typeof answer.detail,
      'string',
      label + ': the detail is a string in every state (' + what + ')',
    );
    assert.notEqual(
      answer.detail,
      '',
      label + ': the detail says something in every state (' + what + ')',
    );
    assert.equal(
      Array.isArray(answer.absences) && Array.isArray(answer.claims),
      true,
      label +
        ': the absences and the claims are lists in every state (' +
        what +
        ')',
    );
  }
}

/**
 * SC1's pin: an error whose text no boundary entry carries, with a handler in force, is
 * `uncaught-with-handler`, naming the message, the code the message matches, the handler
 * state, and the owner the arrival's own record carries.
 */
function pinUncaughtWithHandler(join, label) {
  const answer = plain(join(frame()));
  assert.equal(
    answer.state,
    'uncaught-with-handler',
    label +
      ': an error no boundary entry carries beside a handler in force is uncaught-with-handler',
  );
  assert.equal(answer.message, UNCAUGHT_TEXT, label + ': the message is named');
  assert.equal(
    answer.code,
    'NG0910',
    label + ': the code the message matches is named',
  );
  assert.equal(
    answer.owner,
    'AlphaComponent',
    label + ": the owner is the arrival's own component field",
  );
  assert.match(
    answer.detail,
    /in force/,
    label + ': the handler state is named in the detail',
  );
  assert.match(
    answer.detail,
    /ProxyErrorHandler/,
    label +
      ": the handler's own name, from the handler record, is named in the detail",
  );
  assert.equal(
    answer.phase,
    'phase-not-recorded',
    label + ': the phase is the absence, which no record in the tree answers',
  );
  assert.deepEqual(
    answer.absences,
    ['phase-not-recorded'],
    label + ': the phase absence is carried, and no other absence applies here',
  );
  assert.deepEqual(
    answer.claims.map((claim) => claim.kind).sort(),
    ['boundary-entry', 'error-arrival', 'handler'],
    label + ': the answer cites the records it answered from',
  );
  for (const claim of answer.claims) {
    assert.equal(
      typeof claim.artefactPath,
      'string',
      label + ': every claim carries an artefactPath',
    );
    assert.notEqual(
      claim.artefactPath,
      '',
      label + ': no claim carries an empty artefactPath',
    );
  }
  assert.equal(
    answer.claims.some(
      (claim) =>
        claim.kind === 'error-arrival' && claim.artefactPath === ERROR_PATH,
    ),
    true,
    label + ': the error arrival is cited by its own artefactPath',
  );
  assert.deepEqual(
    Object.keys(answer).sort(),
    ANSWER_KEYS,
    label + ': the answer carries exactly the eight contract fields',
  );

  // A message with no NG0NNN in it answers a null code, and never a guess.
  const uncoded = plain(join(frame({ errors: [arrival('Something failed')] })));
  assert.equal(
    uncoded.code,
    null,
    label + ': a message that carries no NG0NNN answers a null code',
  );

  // The owner comes from the arrival the finding is about, and from no other arrival.
  const two = plain(join(twoArrivalsFrame()));
  assert.equal(
    two.state,
    'uncaught-with-handler',
    label + ': the first text no entry carries is the finding',
  );
  assert.equal(
    two.owner,
    'AlphaComponent',
    label +
      ": the owner is the uncaught arrival's own component, never the last arrival's",
  );
  const anonymous = plain(join(frame({ errors: [arrival(UNCAUGHT_TEXT)] })));
  assert.equal(
    anonymous.owner,
    null,
    label +
      ': an arrival that names no component answers null and never borrows one',
  );
  return answer;
}

/**
 * SC2's pin: an error whose text a boundary entry carries is `reached-handler` — no
 * finding — with the boundary entry cited among the claims.
 */
function pinReachedHandler(join, label) {
  const answer = plain(join(reachedFrame()));
  assert.equal(
    answer.state,
    'reached-handler',
    label + ': an error whose text a boundary entry carries is reached-handler',
  );
  assert.match(
    answer.detail,
    /no finding/,
    label + ': the reached answer carries no finding and says so',
  );
  assert.equal(answer.message, UNCAUGHT_TEXT, label + ': the message is named');
  assert.equal(
    answer.code,
    'NG0910',
    label + ': the code the message matches is named',
  );
  assert.equal(
    answer.owner,
    'AlphaComponent',
    label + ": the owner is the arrival's own component field",
  );
  assert.equal(
    answer.claims.some(
      (claim) =>
        claim.kind === 'boundary-entry' && claim.artefactPath === BOUNDARY_PATH,
    ),
    true,
    label +
      ': the boundary entry that carries the text is cited by its own artefactPath',
  );
  assert.deepEqual(
    Object.keys(answer).sort(),
    ANSWER_KEYS,
    label + ': the answer carries exactly the eight contract fields',
  );
  return answer;
}

/**
 * SC3's pin: an uncaught error recorded while no handler resolved is
 * `no-handler-provided` — the absence is named, and no handler name is invented for it,
 * whatever falsy word the record used for the handler.
 */
function pinNoHandlerProvided(join, label) {
  for (const [what, handler] of [
    ['null', null],
    ['false', false],
    ['zero', 0],
    ['an empty string', ''],
  ]) {
    const answer = plain(join(frame({ handler: handler })));
    assert.equal(
      answer.state,
      'no-handler-provided',
      label +
        ': a handler the record carries as ' +
        what +
        ' is no-handler-provided',
    );
    assert.equal(
      answer.message,
      UNCAUGHT_TEXT,
      label + ': the message is named (' + what + ')',
    );
    assert.equal(
      answer.code,
      'NG0910',
      label + ': the code the message matches is named (' + what + ')',
    );
    assert.match(
      answer.detail,
      /no ErrorHandler resolved/,
      label + ': the absence is named, never papered over (' + what + ')',
    );
    assert.doesNotMatch(
      answer.detail,
      /"[A-Za-z]*ErrorHandler"/,
      label +
        ': no handler name is invented where none resolved (' +
        what +
        ')',
    );
    assert.doesNotMatch(
      JSON.stringify(answer),
      /in force/,
      label +
        ': no handler state is claimed where none resolved (' +
        what +
        ')',
    );
    assert.equal(
      answer.owner,
      'AlphaComponent',
      label +
        ": the owner is still the arrival's own component field (" +
        what +
        ')',
    );
    assert.deepEqual(
      Object.keys(answer).sort(),
      ANSWER_KEYS,
      label +
        ': the answer carries exactly the eight contract fields (' +
        what +
        ')',
    );
  }
  return plain(join(frame({ handler: null })));
}

/**
 * SC4's pin: the phase is the absence unless a record itself carries a phase field, and
 // is never derived from the message text.
 */
function pinPhaseIsTheRecordsOrTheAbsence(join, label) {
  const answer = plain(join(frame()));
  assert.equal(
    answer.phase,
    'phase-not-recorded',
    label + ': no record carries a phase, so the answer carries the absence',
  );
  assert.equal(
    answer.absences.includes('phase-not-recorded'),
    true,
    label + ': the phase absence is carried in the absences',
  );

  const onArrival = plain(
    join(
      frame({
        errors: [
          arrival(UNCAUGHT_TEXT, {
            component: 'AlphaComponent',
            phase: 'change-detection',
          }),
        ],
      }),
    ),
  );
  assert.equal(
    onArrival.phase,
    'change-detection',
    label + ': a phase a record itself carries is echoed',
  );
  assert.equal(
    onArrival.absences.includes('phase-not-recorded'),
    false,
    label + ': where a record states the phase, the absence is not claimed',
  );

  const onEntry = plain(
    join(
      frame({
        boundaries: [boundaryEntry(CARRIED_TEXT, { phase: 'construction' })],
      }),
    ),
  );
  assert.equal(
    onEntry.phase,
    'construction',
    label + ': a phase a boundary record carries is echoed too',
  );

  // The message carries NG0910 and names no phase, and the phase stays the absence: the
  // message text is never mined for a phase.
  const fromMessage = plain(join(frame()));
  assert.equal(
    fromMessage.phase,
    'phase-not-recorded',
    label + ': the phase is never derived from the message',
  );
  assert.doesNotMatch(
    String(fromMessage.phase),
    /change|construction/,
    label + ': no phase word the message could suggest appears in the phase',
  );
  return fromMessage;
}

/**
 * The boundary absences pin: a boundary record that is present and empty carries
 * `no-boundary-entry` beside the state, a boundary record the records do not name carries
 * no such absence, and where both questions go unanswered the two absences are carried
 * each in its own name.
 */
function pinNoBoundaryEntry(join, label) {
  const empty = plain(join(frame({ boundaries: [] })));
  assert.equal(
    empty.state,
    'uncaught-with-handler',
    label +
      ': a boundary record that carries no entry leaves the text determinately uncarried',
  );
  assert.deepEqual(
    empty.absences,
    ['phase-not-recorded', 'no-boundary-entry'],
    label + ': both absences are carried, each in its own name',
  );

  const emptyNoHandler = plain(
    join({ errors: frame().errors, boundaries: [], handler: null }),
  );
  assert.equal(
    emptyNoHandler.state,
    'no-handler-provided',
    label +
      ': the same emptiness beside a falsy handler stays no-handler-provided',
  );
  assert.deepEqual(
    emptyNoHandler.absences,
    ['phase-not-recorded', 'no-boundary-entry'],
    label + ': both absences travel beside that state too',
  );

  const unknown = plain(join({ errors: frame().errors, handler: null }));
  assert.equal(
    unknown.state,
    'cannot-tell',
    label +
      ': a boundary record the records do not name cannot be compared against',
  );
  assert.equal(
    unknown.absences.includes('no-boundary-entry'),
    false,
    label +
      ': a boundary record the records do not name is unknown, not empty, and claims no absence',
  );
  return empty;
}

/** The unknown-input pin: whatever the records do not name is `cannot-tell`, never a guess. */
function pinCannotTell(join, label) {
  for (const [what, input] of [
    ['no records at all', undefined],
    ['a null record', null],
    ['an empty record', {}],
    [
      'errors that is not a list',
      { errors: 'NG0910 somewhere', boundaries: [], handler: true },
    ],
    [
      'a handler key the records do not carry',
      { errors: frame().errors, boundaries: frame().boundaries },
    ],
    ['no arrivals recorded', { errors: [], boundaries: [], handler: true }],
  ]) {
    const answer = plain(join(input));
    assert.equal(
      answer.state,
      'cannot-tell',
      label + ': ' + what + ' is cannot-tell',
    );
    assert.match(
      answer.detail,
      /cannot tell/,
      label + ': ' + what + ' says why it cannot tell',
    );
    assert.deepEqual(
      Object.keys(answer).sort(),
      ANSWER_KEYS,
      label +
        ': even a cannot-tell answer carries exactly the eight contract fields (' +
        what +
        ')',
    );
  }
  return plain(join({}));
}

// ---------------------------------------------------------------- the shipped join ----

describe('error-routing.js is pure', () => {
  it('evaluates in a bare context and publishes the join itself, and nothing else of its own', () => {
    const context = createContext({});
    runInContext(SRC, context);
    assert.equal(
      typeof context.angularAiErrorRouting,
      'function',
      'the module publishes the join on the global object of whatever world it runs in',
    );
    assert.equal(
      context.angularAiErrorRouting.length,
      1,
      'the join takes the one record it reads',
    );
    assert.deepEqual(
      Object.getOwnPropertyNames(context).filter((name) =>
        /^angularAi/.test(name),
      ),
      ['angularAiErrorRouting'],
      'the module publishes the join and nothing else of its own',
    );
  });

  it('reaches for no host global when the join runs, and no live page value', () => {
    // The traps are armed, and they are proven armed before anything is asserted through
    // them: a guard that did not throw would make every pin below pass on any module.
    const armed = armedContext();
    assert.throws(
      () => runInContext('Date.now()', armed),
      /reached for Date/,
      'the Date trap must bite, or the guard is decoration',
    );
    assert.throws(
      () => runInContext('document.title', armed),
      /reached for document/,
      'the document trap must bite, or the guard is decoration',
    );
    // The pin, on the unmutated module, run wholly inside the guarded context.
    assert.deepEqual(
      guarded(frame()),
      plain(standalone()(frame())),
      'the join answers identically with every host global in scope a trap',
    );
    const body = code(SRC);
    for (const [what, pattern] of [
      ['a document read', /\bdocument\b/],
      ['a window read', /\bwindow\b/],
      ['a console call', /\bconsole\b/],
      ['a clock read', /\b(Date|performance|setTimeout|setInterval)\b/],
      ['a DOM query', /\b(querySelector|getElementById|createElement)\b/],
      ['a network call', /\b(fetch|XMLHttpRequest)\b/],
      ['a live page read', /\b(getOwningComponent|ng\.getContext)\b/],
    ]) {
      assert.equal(
        pattern.test(body),
        false,
        'error-routing.js must contain no ' + what,
      );
    }

    // SC5's mutant: an owner read from the live page reddens. In a bare context the live
    // page value is absent, so the mutant answers null; hand it the value and it borrows
    // it; the pin reddens either way, by name.
    pinUncaughtWithHandler(standalone(), 'the unmutated module');
    const mutated = mutate(
      'owner read from the live page',
      "      const owner = textOf(fieldOf(uncaught, 'component'));",
      '      const owner = textOf(globalThis.__M060_LIVE_OWNER__);',
    );
    const bare = standalone(mutated);
    assert.equal(
      plain(bare(frame())).owner,
      null,
      'in a bare context the live page value is absent, so the mutant answers null',
    );
    const live = standalone(mutated, {
      __M060_LIVE_OWNER__: 'LivePageComponent',
    });
    assert.equal(
      plain(live(frame())).owner,
      'LivePageComponent',
      'the mutant borrows the owner from the live page',
    );
    const failure = reddens(
      () => pinUncaughtWithHandler(live, 'the purity pin'),
      'owner read from the live page',
    );
    assert.match(
      failure.message,
      /owner/,
      'the live-page mutant must redden the purity pin by name: ' +
        failure.message,
    );
  });

  it('answers the same record twice with the same value', () => {
    const join = standalone();
    assert.deepEqual(plain(join(frame())), plain(join(frame())));
    assert.deepEqual(plain(join(reachedFrame())), plain(join(reachedFrame())));
  });
});

describe('the shipped join answers the two error records', () => {
  it('carries exactly the eight contract fields in every state', () => {
    pinEveryFieldInEveryState(standalone(), 'the shipped module');
  });

  it('SC1 — an uncaught text beside a handler in force is uncaught-with-handler', () => {
    pinUncaughtWithHandler(standalone(), 'the shipped module');
  });

  it('SC2 — a text a boundary entry carries is reached-handler, with no finding', () => {
    pinReachedHandler(standalone(), 'the shipped module');
  });

  it('SC3 — no handler resolved is no-handler-provided, and never a handler name', () => {
    pinNoHandlerProvided(standalone(), 'the shipped module');
  });

  it('SC4 — the phase is the record\u2019s or the absence, never the message\u2019s', () => {
    pinPhaseIsTheRecordsOrTheAbsence(standalone(), 'the shipped module');
  });

  it('SC5 — an empty boundary record is its own absence, and unknown input is cannot-tell', () => {
    pinNoBoundaryEntry(standalone(), 'the shipped module');
    pinCannotTell(standalone(), 'the shipped module');
  });
});

describe('mutants redden by name', () => {
  it('M1 — boundary comparison dropped reports cannot-tell and reddens the uncaught pin', () => {
    pinUncaughtWithHandler(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'boundary comparison dropped',
        '    return carriedAny;',
        '    return null;',
      ),
    );
    const dropped = plain(join(frame()));
    assert.equal(
      dropped.state,
      'cannot-tell',
      'the mutant can no longer decide that no entry carries the text, and must answer cannot-tell',
    );

    const failure = reddens(
      () =>
        pinUncaughtWithHandler(join, 'mutant M1 boundary comparison dropped'),
      'boundary comparison dropped',
    );
    assert.match(
      failure.message,
      /uncaught-with-handler/,
      'the boundary-comparison mutant must redden the uncaught pin by name: ' +
        failure.message,
    );
  });

  it('M2 — every global error treated as uncaught reddens the reached pin', () => {
    pinReachedHandler(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'every global error treated as uncaught',
        '      if (entryText === text) return true;',
        '      if (entryText === text) return false;',
      ),
    );
    const treated = plain(join(reachedFrame()));
    assert.equal(
      treated.state,
      'uncaught-with-handler',
      'the mutant treats a text a boundary entry carries as uncaught',
    );

    const failure = reddens(
      () =>
        pinReachedHandler(
          join,
          'mutant M2 every global error treated as uncaught',
        ),
      'every global error treated as uncaught',
    );
    assert.match(
      failure.message,
      /reached-handler/,
      'the all-uncaught mutant must redden the reached pin by name: ' +
        failure.message,
    );
  });

  it('M3 — a handler name invented where none resolved reddens the no-handler pin', () => {
    pinNoHandlerProvided(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'a handler name invented when none resolved',
        'no ErrorHandler resolved, so the error "',
        'the handler "ZonedErrorHandler" resolved, so the error "',
      ),
    );
    const invented = plain(join(frame({ handler: null })));
    assert.match(
      invented.detail,
      /ZonedErrorHandler/,
      'the mutant names a handler the records never carried',
    );

    const failure = reddens(
      () =>
        pinNoHandlerProvided(
          join,
          'mutant M3 a handler name invented when none resolved',
        ),
      'a handler name invented when none resolved',
    );
    assert.match(
      failure.message,
      /no ErrorHandler resolved|no handler name is invented|the absence is named/,
      'the invented-handler mutant must redden the no-handler pin by name: ' +
        failure.message,
    );
  });

  it('M4 — phase derived from the message reddens the phase pin', () => {
    pinPhaseIsTheRecordsOrTheAbsence(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'phase derived from the message',
        '    return PHASE_NOT_RECORDED;',
        "    return /NG0\\d/.test(textOf(fieldOf(errors[0], 'message')) || '')\n      ? 'change-detection'\n      : 'construction';",
      ),
    );
    const derived = plain(join(frame()));
    assert.equal(
      derived.phase,
      'change-detection',
      'the mutant mines the message text for a phase word',
    );

    const failure = reddens(
      () =>
        pinPhaseIsTheRecordsOrTheAbsence(
          join,
          'mutant M4 phase derived from the message',
        ),
      'phase derived from the message',
    );
    assert.match(
      failure.message,
      /phase-not-recorded|never derived from the message/,
      'the message-phase mutant must redden the phase pin by name: ' +
        failure.message,
    );
  });

  it('M5 — a key dropped from the answer reddens the every-field pin', () => {
    pinEveryFieldInEveryState(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'a key dropped from the returned object',
        '      owner: owner,\n',
        '',
      ),
    );
    const thinned = plain(join(frame()));
    assert.equal(
      Object.keys(thinned).length,
      7,
      'the mutant drops the owner field from the answer',
    );

    const failure = reddens(
      () =>
        pinEveryFieldInEveryState(
          join,
          'mutant M5 a key dropped from the returned object',
        ),
      'a key dropped from the returned object',
    );
    assert.match(
      failure.message,
      /eight contract fields/,
      'the dropped-key mutant must redden the every-field pin by name: ' +
        failure.message,
    );
  });

  it('M6 — the two absences folded into one reddens the boundary-absence pin', () => {
    pinNoBoundaryEntry(standalone(), 'the unmutated module');

    const anchor = [
      '    if (phase === PHASE_NOT_RECORDED) {',
      '      absences.push(PHASE_NOT_RECORDED);',
      '    }',
      '    if (boundaries !== null && boundaries.length === 0) {',
      '      absences.push(NO_BOUNDARY_ENTRY);',
      '    }',
    ].join('\n');
    const replacement = [
      '    if (phase === PHASE_NOT_RECORDED) {',
      '      absences.push(PHASE_NOT_RECORDED);',
      '    } else if (boundaries !== null && boundaries.length === 0) {',
      '      absences.push(PHASE_NOT_RECORDED);',
      '    }',
    ].join('\n');
    const join = standalone(
      mutate('the two absences folded into one', anchor, replacement),
    );
    const folded = plain(join(frame({ boundaries: [] })));
    assert.deepEqual(
      folded.absences,
      ['phase-not-recorded'],
      'the mutant answers two unanswered questions with one absence',
    );

    const failure = reddens(
      () =>
        pinNoBoundaryEntry(join, 'mutant M6 the two absences folded into one'),
      'the two absences folded into one',
    );
    assert.match(
      failure.message,
      /no-boundary-entry/,
      'the folded-absences mutant must redden the boundary-absence pin by name: ' +
        failure.message,
    );
  });

  it('M7 — owner borrowed from the last arrival reddens the uncaught pin', () => {
    pinUncaughtWithHandler(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'owner borrowed from the last arrival',
        "      const owner = textOf(fieldOf(uncaught, 'component'));",
        "      const owner = textOf(fieldOf(errors[errors.length - 1], 'component'));",
      ),
    );
    const borrowed = plain(join(twoArrivalsFrame()));
    assert.equal(
      borrowed.owner,
      'ZetaComponent',
      'the mutant borrows the owner from whichever arrival happened to be last',
    );

    const failure = reddens(
      () =>
        pinUncaughtWithHandler(
          join,
          'mutant M7 owner borrowed from the last arrival',
        ),
      'owner borrowed from the last arrival',
    );
    assert.match(
      failure.message,
      /owner/,
      'the borrowed-owner mutant must redden the uncaught pin by name: ' +
        failure.message,
    );
  });
});
