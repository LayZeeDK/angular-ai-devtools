// Tests for extension/lint-core.js — the join between a captured console diagnostic and the
// construct the message's own text names.
//
// The module is evaluated in a bare `node:vm` context: no `document`, no `window`, no layout, and no
// `console` unless a probe supplies one. Every case below executes that module and asserts on what it
// returns, so nothing here stands in for behaviour by scanning a source file.
//
// The inputs are T001's real recording (`research/raw/m032-console-diagnostics.json`) and the real
// digest (`extension/error-digest.json`), not a hand-built pair. The suite first pins the measurement
// it is joining against, so a recording that changed shape reddens here instead of quietly making the
// join look right:
//
//   - the load emitted exactly one NG-coded message, `NG0950`, and the digest carries that code;
//   - the message body names the input (`requiredLabel`) and no element and no component — the
//     component's name appears only in a stack frame, which is not part of the body;
//   - the compile-time required-input diagnostic (`NG8008`) never reached a console and the digest
//     does not carry it, so a code outside the digest has nothing here to say.
//
//   E1 — an empty set of captured messages produces no finding: the absence is reported as an
//        absence, never as "nothing was wrong" (M4 must redden it).
//   E2 — with the captured messages withheld no finding is produced, and the module reads no console
//        of its own: it installs no reader, and a probe counts every call (N1).
//   E3 — a message whose code the digest does not carry yields `cannot-tell` with its reason and no
//        construct, even when the body names an input (M3 must redden it).
//
// The finding itself is a pin too, because "always cannot-tell" would satisfy E1, E2 and E3 and
// measure nothing: a carried code whose body names an input must name that input, the body's own
// code, and the body (M1, M2, M5 must each redden it).
//
// The mutants are applied to an in-memory copy of the module's source, one change each, and the
// module on disk is never written. Each mutant case first runs its pin against the untouched module
// and shows it passing, then shows the mutation failing it by name, then reloads the module from
// disk and shows the pin passing again.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { describe, it } from 'node:test';

const SRC = readFileSync(
  new URL('../extension/lint-core.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m032-console-diagnostics.json', import.meta.url),
    'utf8',
  ),
);
const DIGEST = JSON.parse(
  readFileSync(
    new URL('../extension/error-digest.json', import.meta.url),
    'utf8',
  ),
);

/** The codes `extension/error-digest.json` carries, read from the file rather than written here. */
const DIGEST_CODES = (DIGEST.entries ?? [])
  .map((entry) => entry?.code)
  .filter((code) => typeof code === 'string');

/** What the caller knows: the digest's codes, and nothing this module is allowed to attribute with. */
const FACTS = { digestCodes: DIGEST_CODES };

/**
 * Facts that also carry the page's own elements and components — a caller knows these. The module
 * must answer exactly as it does without them: the nearest element is not the one a message names.
 */
const FACTS_WITH_PAGE = {
  digestCodes: DIGEST_CODES,
  elements: [{ selector: 'app-lint-page', component: 'LintObservabilityPage' }],
  components: ['LintObservabilityPage'],
};

/** The one NG-coded console message the fixture page produced. */
const DIAGNOSTIC = RECORDING.ngCodedMessages[0];

/** The component the recording's stack names — and its body does not. */
const COMPONENT = RECORDING.fixture.component;

/** The input the message names, read from the recording rather than written here. */
const INPUT = DIAGNOSTIC.namesElementOrComponent.namesTheInputInstead;

/** The code the message carries. */
const CODE = DIAGNOSTIC.code;

/**
 * The message body, re-derived here from the recorded text: everything before the first stack frame.
 * The recording defines the body that way, so the pin asserts against a recomputation of the text
 * and not against a field the recording could have got wrong.
 */
function bodyOf(text) {
  const at = text.search(/\n\s+at\s/);
  return (at === -1 ? text : text.slice(0, at)).trim();
}

const DIAGNOSTIC_BODY = bodyOf(DIAGNOSTIC.text);

/**
 * The module in a bare context: nothing in the world but the source. A module that reached for
 * `document`, `window`, `performance` or an import would throw here rather than pass.
 */
function loadBare(source = SRC) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiLintCore;
  assert.ok(
    api,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  return { api, context };
}

/**
 * The module in a world that has a console, a document, a window and a clock of its own, each with a
 * tap counter: loading and using the module must install and read nothing (N1, E2).
 */
function loadWithProbes() {
  const calls = [];
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
      info: tap('console.info'),
      debug: tap('console.debug'),
    },
    performance: { now: tap('performance.now') },
    document: {
      querySelector: tap('document.querySelector'),
      addEventListener: tap('document.addEventListener'),
    },
    window: {
      addEventListener: tap('window.addEventListener'),
      getComputedStyle: tap('window.getComputedStyle'),
    },
  });
  runInContext(SRC, context);
  return { api: context.angularAiLintCore, context, calls };
}

/** A value built inside the vm context carries that context's prototypes; copy it into this realm. */
function host(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * A mutant: one textual change to an in-memory copy of the module. The anchor must change the
 * source, or the mutation would be vacuous and the case would prove nothing.
 */
function mutant(anchor, replacement) {
  const source = SRC.replace(anchor, replacement);
  assert.notEqual(
    source,
    SRC,
    `the mutation must change the module: ${JSON.stringify(anchor)}`,
  );
  return loadBare(source).api;
}

/** The failure a pin raises on a mutant; a failing assertion when the mutant slips past it. */
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

/**
 * The failure a mutant raises, matched against the assertion it must hit — so a mutant that reddens
 * an unrelated pin, or throws for its own reasons, is a failure here rather than a pass.
 */
function reddensBy(pin, what, assertion) {
  const failure = reddens(pin, what);
  assert.match(
    failure.message,
    assertion,
    `${what} must redden the ${assertion} assertion, not an unrelated one: ${failure.message}`,
  );
  return failure;
}

/**
 * The console messages the capture hands over: every message the page its window produced, code
 * included. `withCapture: false` is the console read removed — the page still emitted its
 * diagnostic, and it reaches no list, which is the capture boundary E2 is about.
 */
function capturedMessages(withCapture) {
  if (!withCapture) return [];
  return RECORDING.messages.map((message) => ({
    code: message.code,
    text: message.text,
  }));
}

/**
 * The words an answer may never use: a cause, a fix, an element or a component — none of which the
 * message body states. A `construct` is dropped before the scan, because when the module names one
 * it is the body's own word for the input, and a `message` is dropped because it is the console's
 * own text, which the module repeats rather than composes.
 */
const FORBIDDEN = [
  'because',
  'cause',
  'fix',
  'should',
  'element',
  'component',
  'selector',
  '<',
  '>',
];

/** Every string an answer states, lowercased, with the body the console wrote dropped. */
function stated(value) {
  return JSON.stringify(host(value), (key, entry) =>
    key === 'message' ? undefined : entry,
  ).toLowerCase();
}

/** The prohibition itself, as one assertion every answer is run through (N2). */
function assertNamesNoCause(value, what) {
  const text = stated(value);
  for (const word of FORBIDDEN) {
    assert.ok(
      !text.includes(word),
      `${what} must not say "${word}": the message names an input and nothing else, so the finding names nothing it did not state — ${text}`,
    );
  }
}

/** The words a reported absence may never use: it is the absence of a capture, not a verdict. */
const CLEAN = [
  'clean',
  'fine',
  'safe',
  'ok',
  'nothing',
  'passed',
  'no problem',
  'no-problem',
  'unaffected',
  'healthy',
];

/**
 * The absence-of-a-message pin: "no captured message" is the absence of a capture, never a page on
 * which nothing was wrong (E1). Applied to every absence result, so no reason can read as a verdict.
 */
function assertAbsenceIsNotClean(result, what) {
  const text = JSON.stringify(host(result)).toLowerCase();
  for (const word of CLEAN) {
    assert.ok(
      !text.includes(word),
      `${what} must not be reported as "${word}": a capture that observed nothing is an absence, not a clean page — ${text}`,
    );
  }
}

/** The finding pin, as a function so a mutant is run through the very assertion this pin makes. */
function assertFinding(result, expected) {
  assert.equal(
    result.state,
    'finding',
    'a carried code whose body names an input must be a finding',
  );
  assert.equal(
    result.construct,
    expected.construct,
    'the finding must name the input the message names',
  );
  assert.equal(
    result.code,
    expected.code,
    'the finding must carry the code the message carries',
  );
  assert.equal(
    result.message,
    expected.message,
    'the finding must carry the message body the console showed, and not its stack',
  );
  assert.deepEqual(
    Object.keys(result).sort(),
    ['code', 'construct', 'message', 'state'],
    'a finding states the construct, the code, the message and its state, and nothing else',
  );
  assert.ok(
    !JSON.stringify(result).includes(COMPONENT),
    `the finding must name no component: "${COMPONENT}" appears only in a stack frame, which is not part of the message`,
  );
  assertNamesNoCause(result, 'the finding');
}

/** The absence pin, as a function so a mutant is run through the very assertion E1 and E3 make. */
function assertCannotTell(result, reason, what) {
  assert.equal(result.state, 'cannot-tell', `${what} must be cannot-tell`);
  assert.equal(result.reason, reason, `${what} must name the absence it found`);
  assert.ok(
    !('construct' in result),
    `${what} must name no construct: the module names only what the message states`,
  );
  assert.ok(
    !('code' in result) && !('message' in result),
    `${what} carries the reason and nothing else`,
  );
  assert.deepEqual(
    Object.keys(result).sort(),
    ['reason', 'state'],
    `${what} states the absence and nothing that reads as an attribution or a cause`,
  );
  assertAbsenceIsNotClean(result, what);
}

// ----------------------------------------------------------------------- the measurement ----

describe('the measurement the join is built to', () => {
  it("is T001's recording: one NG-coded message, and the digest carries its code", () => {
    assert.equal(
      RECORDING.fixture.route,
      '/lint-observability',
      'the recording must be a capture of the fixture route',
    );
    assert.equal(RECORDING.page.pageLoads, 1, 'it must describe one page load');
    assert.equal(
      RECORDING.ngCodedMessages.length,
      1,
      'the page console produced exactly one NG-coded message',
    );
    assert.equal(CODE, 'NG0950', 'the message carries NG0950');
    assert.ok(
      DIGEST_CODES.includes(CODE),
      'the digest must carry the console code, or there is nothing to join',
    );
    assert.equal(DIAGNOSTIC.digestCarriesCode, true);
  });

  it('records a message that names the input, no element and no component', () => {
    assert.equal(DIAGNOSTIC.namesElementOrComponent.any, false);
    assert.equal(DIAGNOSTIC.namesElementOrComponent.elementSelector, null);
    assert.equal(DIAGNOSTIC.namesElementOrComponent.component, null);
    assert.ok(
      DIAGNOSTIC_BODY.includes(`"${INPUT}"`),
      'the body must name the input in the shape this module reads',
    );
    assert.ok(
      !DIAGNOSTIC_BODY.includes(COMPONENT),
      'the body must name no component; the name is in a stack frame only',
    );
    assert.equal(
      DIAGNOSTIC.namesElementOrComponent.stackNamesTheComponent,
      COMPONENT,
      'the stack is where the component is named',
    );
    assert.equal(
      DIAGNOSTIC.namesElementOrComponent.stackCountsAsTheMessageNamingIt,
      false,
      'a stack frame is not the message naming anything',
    );
  });

  it('records the compile-time diagnostic as one that never reached the console and the digest does not carry', () => {
    const [observation] = RECORDING.buildObservations;
    assert.ok(observation, 'the recording must hold its build observation');
    assert.equal(observation.reachedThePageConsole, false);
    assert.equal(observation.digestCarriesCode, false);
    assert.ok(
      !DIGEST_CODES.includes('NG8008'),
      'the digest must not carry NG8008, or E3 would be about a code it does carry',
    );
  });
});

// ----------------------------------------------------------------------- purity ----

describe('extension/lint-core.js is a pure module', () => {
  it('loads in a context with no DOM, no window, no console and no clock', () => {
    const { api, context } = loadBare();
    assert.equal(
      context.document,
      undefined,
      'the module must not need a document',
    );
    assert.equal(
      context.window,
      undefined,
      'the module must not need a window',
    );
    assert.equal(
      context.performance,
      undefined,
      'the module must not read a clock',
    );
    assert.equal(
      context.console,
      undefined,
      'the module must not need a console',
    );
    assert.equal(
      typeof api.lintCore,
      'function',
      'the module must export the join',
    );
    assert.equal(api.FINDING, 'finding');
    assert.equal(api.CANNOT_TELL, 'cannot-tell');
    assert.equal(api.NO_CAPTURED_MESSAGES, 'no-captured-messages');
    assert.equal(api.NO_CODED_DIAGNOSTIC, 'no-coded-diagnostic');
    assert.equal(api.CODE_NOT_IN_DIGEST, 'code-not-in-digest');
    assert.equal(api.MESSAGE_NAMES_NO_CONSTRUCT, 'message-names-no-construct');
  });

  it('leaves the messages and the facts exactly as it received them', () => {
    const messages = capturedMessages(true);
    const facts = JSON.parse(JSON.stringify(FACTS_WITH_PAGE));
    const messagesBefore = JSON.stringify(messages);
    const factsBefore = JSON.stringify(facts);
    const { api } = loadBare();
    host(api.lintCore(messages, facts));
    host(api.lintCore([], facts));
    assert.equal(
      JSON.stringify(messages),
      messagesBefore,
      'joining must not write to the message list',
    );
    assert.equal(
      JSON.stringify(facts),
      factsBefore,
      'joining must not write to the facts',
    );
  });
});

// ----------------------------------------------------------------------- E1 ----

describe('E1 — an empty set of captured messages', () => {
  it('produces no finding and reports the absence it observed', () => {
    const { api } = loadBare();
    for (const messages of [[], undefined, null]) {
      const result = host(api.lintCore(messages, FACTS));
      assertCannotTell(result, 'no-captured-messages', 'an empty capture');
      assert.notEqual(
        result.state,
        'finding',
        'nothing may be found in nothing',
      );
    }
  });

  it('reports messages that carry no code as a capture with no diagnostic in it', () => {
    const { api } = loadBare();
    const withoutCodes = RECORDING.messages.filter(
      (message) => message.code === null,
    );
    assert.ok(
      withoutCodes.length > 0,
      'the recording must carry messages without a code, or the case proves nothing',
    );
    const result = host(api.lintCore(withoutCodes, FACTS));
    assertCannotTell(
      result,
      'no-coded-diagnostic',
      'a capture whose messages carry no NG code',
    );
  });

  it('says the same thing with no facts at all', () => {
    const { api } = loadBare();
    assertCannotTell(
      host(api.lintCore([], undefined)),
      'no-captured-messages',
      'an empty capture with no facts',
    );
  });
});

// ----------------------------------------------------------------------- E2 ----

describe('E2 — the captured messages withheld', () => {
  it('produces no finding from the facts alone', () => {
    const { api } = loadBare();
    const withCapture = capturedMessages(true);
    const withheld = capturedMessages(false);
    assert.ok(
      withCapture.length > 0,
      'the capture must be what carries the diagnostic',
    );
    assert.deepEqual(
      withheld,
      [],
      'with the console read removed nothing else supplies a message',
    );

    assertFinding(host(api.lintCore(withCapture, FACTS)), {
      construct: INPUT,
      code: CODE,
      message: DIAGNOSTIC_BODY,
    });

    for (const facts of [FACTS, FACTS_WITH_PAGE, undefined]) {
      const result = host(api.lintCore(withheld, facts));
      assertCannotTell(
        result,
        'no-captured-messages',
        'a capture with the console read withheld',
      );
    }
  });

  it('reads no console, clock or DOM of its own, with all of them in reach (N1)', () => {
    const { api, calls } = loadWithProbes();
    assert.deepEqual(
      calls,
      [],
      'loading the module must install nothing and read nothing',
    );
    host(api.lintCore(capturedMessages(true), FACTS));
    host(api.lintCore(capturedMessages(false), FACTS));
    host(api.lintCore([], undefined));
    assert.deepEqual(
      calls,
      [],
      'joining must not read the console, the clock or the DOM: the captured list is the whole input (N1, E2)',
    );
  });
});

// ----------------------------------------------------------------------- E3 ----

describe('E3 — a code the digest does not carry', () => {
  it('yields cannot-tell with its reason and no construct, even when the body names an input', () => {
    const { api } = loadBare();
    const text = `ERROR RuntimeError: NG0999: Input "${INPUT}" is required but no value is available yet.`;
    const result = host(api.lintCore([{ code: 'NG0999', text }], FACTS));
    assertCannotTell(
      result,
      'code-not-in-digest',
      'a code the digest does not carry',
    );
  });

  it('yields cannot-tell for the compile-time diagnostic that never reached a console', () => {
    const { api } = loadBare();
    const [observation] = RECORDING.buildObservations;
    assert.equal(observation.digestCarriesCode, false);
    const result = host(
      api.lintCore([{ code: null, text: observation.text }], FACTS),
    );
    assertCannotTell(
      result,
      'code-not-in-digest',
      'the build-time NG8008 message',
    );
  });

  it('names no construct when the carried code’s body names one', () => {
    const { api } = loadBare();
    const text = `ERROR RuntimeError: NG0950: unused import "UnusedThing" in the page.`;
    const result = host(api.lintCore([{ code: 'NG0950', text }], FACTS));
    assertCannotTell(
      result,
      'message-names-no-construct',
      'a carried code whose body names no input',
    );
    assert.ok(
      !JSON.stringify(result).includes('UnusedThing'),
      'a quoted token that is not an `Input "…"` is not a construct the message named',
    );
  });

  it('answers the observed diagnostic when the capture also holds a code it cannot speak about', () => {
    const { api } = loadBare();
    const [observation] = RECORDING.buildObservations;
    const result = host(
      api.lintCore(
        [
          { code: 'NG8008', text: observation.text },
          ...capturedMessages(true).filter((message) => message.code === CODE),
        ],
        FACTS,
      ),
    );
    assertFinding(result, {
      construct: INPUT,
      code: CODE,
      message: DIAGNOSTIC_BODY,
    });
  });
});

// ----------------------------------------------------------------------- the finding ----

describe('the finding — the construct the message names', () => {
  it('names the input, the code and the message body from the recorded console list', () => {
    const { api } = loadBare();
    assertFinding(host(api.lintCore(capturedMessages(true), FACTS)), {
      construct: INPUT,
      code: CODE,
      message: DIAGNOSTIC_BODY,
    });
  });

  it('answers the same with the page’s own elements and components in the facts', () => {
    const { api } = loadBare();
    for (const facts of [FACTS, FACTS_WITH_PAGE]) {
      assertFinding(host(api.lintCore(capturedMessages(true), facts)), {
        construct: INPUT,
        code: CODE,
        message: DIAGNOSTIC_BODY,
      });
    }
  });

  it('reads the code from the message’s own text, not from the entry’s field', () => {
    const { api } = loadBare();
    // An entry claiming a code its text does not carry is not a diagnostic of that code.
    const claimedOnly = host(
      api.lintCore(
        [{ code: 'NG0950', text: 'ERROR something else entirely' }],
        FACTS,
      ),
    );
    assertCannotTell(
      claimedOnly,
      'no-coded-diagnostic',
      'a message whose text carries no code',
    );
    // The recorded text carries the code, whether or not the entry states it.
    const textOnly = host(
      api.lintCore([{ code: null, text: DIAGNOSTIC.text }], FACTS),
    );
    assertFinding(textOnly, {
      construct: INPUT,
      code: CODE,
      message: DIAGNOSTIC_BODY,
    });
  });
});

// ----------------------------------------------------------------------- mutants ----

// The pieces of the module the mutants rewrite. Each appears once in the source, and each mutant
// changes exactly one of them, so the failing pin names the property that was broken.
const FINDING_RETURN = 'return finding(construct, code, body);';
const BODY_RETURN = [
  '    const frame = text.search(STACK_FRAME);',
  '    return (frame === -1 ? text : text.slice(0, frame)).trim();',
].join('\n');
const DIGEST_BRANCH =
  'if (digest.indexOf(code) === -1) return cannotTell(CODE_NOT_IN_DIGEST);';
const EMPTY_BRANCH =
  'if (list.length === 0) return cannotTell(NO_CAPTURED_MESSAGES);';
const INPUT_MATCH = 'const found = body.match(NAMED_INPUT);';

/** The finding pin, run the way every mutant case runs it: given a result, it passes or throws. */
function pinFinding(result) {
  assertFinding(host(result), {
    construct: INPUT,
    code: CODE,
    message: DIAGNOSTIC_BODY,
  });
}

describe('mutants — each applied to a copy, then the module restored', () => {
  it('M1: matching the diagnostic to the nearest element reddens the attribution pin (AC5, N3)', (t) => {
    // The pin first, on the module as it stands: the construct is the input the message names.
    pinFinding(
      loadBare().api.lintCore(capturedMessages(true), FACTS_WITH_PAGE),
    );

    // The mutant prefers the nearest element the caller knows about over the input the body names.
    const api = mutant(
      FINDING_RETURN,
      [
        'const nearest =',
        '      facts && Array.isArray(facts.elements) ? facts.elements[0] : null;',
        '    return finding(nearest ? nearest.selector : construct, code, body);',
      ].join('\n'),
    );
    const result = host(api.lintCore(capturedMessages(true), FACTS_WITH_PAGE));
    assert.equal(
      result.state,
      'finding',
      'the mutant must still answer, so the red comes from the attribution and not from a throw',
    );
    assert.equal(
      result.construct,
      'app-lint-page',
      "the mutant must name the nearest element's selector instead of the input",
    );
    const failure = reddensBy(
      () => pinFinding(result),
      'matching the diagnostic to the nearest element',
      /the finding must name the input the message names/,
    );
    t.diagnostic(`M1 reddens AC5/N3: ${failure.message.split('\n')[0]}`);

    // The file on disk was never written, so reloading it restores the pin.
    pinFinding(
      loadBare().api.lintCore(capturedMessages(true), FACTS_WITH_PAGE),
    );
  });

  it('M2: carrying the stack as the message reddens the no-component pin (N2)', (t) => {
    pinFinding(loadBare().api.lintCore(capturedMessages(true), FACTS));

    // The mutant keeps the stack frames, so the component's name rides out on the finding.
    const api = mutant(BODY_RETURN, '    return text.trim();');
    const result = host(api.lintCore(capturedMessages(true), FACTS));
    assert.ok(
      result.message.includes(COMPONENT),
      'the mutant must carry the component name out of the stack, or it is not the mutation N2 exists to catch',
    );
    const failure = reddensBy(
      () => pinFinding(result),
      'carrying the message stack',
      /the finding must carry the message body the console showed/,
    );
    t.diagnostic(`M2 reddens N2: ${failure.message.split('\n')[0]}`);

    pinFinding(loadBare().api.lintCore(capturedMessages(true), FACTS));
  });

  it('M3: attributing a code the digest does not carry reddens the cannot-tell pin (E3)', (t) => {
    const text = `ERROR RuntimeError: NG0999: Input "${INPUT}" is required but no value is available yet.`;
    const pin = (result) =>
      assertCannotTell(
        host(result),
        'code-not-in-digest',
        'a code the digest does not carry',
      );
    pin(loadBare().api.lintCore([{ code: 'NG0999', text }], FACTS));

    // The mutant never asks the digest, so any code is a code it will speak about.
    const api = mutant(
      DIGEST_BRANCH,
      'if (digest.indexOf(code) === -2) return cannotTell(CODE_NOT_IN_DIGEST);',
    );
    const result = host(api.lintCore([{ code: 'NG0999', text }], FACTS));
    assert.equal(
      result.state,
      'finding',
      'the mutant must answer for a code outside the digest',
    );
    const failure = reddensBy(
      () => pin(result),
      'attributing a code outside the digest',
      /a code the digest does not carry must be cannot-tell/,
    );
    t.diagnostic(`M3 reddens E3: ${failure.message.split('\n')[0]}`);

    pin(loadBare().api.lintCore([{ code: 'NG0999', text }], FACTS));
  });

  it('M4: reporting an empty capture as "nothing was wrong" reddens the absence pin (E1)', (t) => {
    const pin = (result) =>
      assertCannotTell(
        host(result),
        'no-captured-messages',
        'an empty capture',
      );
    pin(loadBare().api.lintCore([], FACTS));

    // The mutant turns the absence into a verdict about the page.
    const api = mutant(
      EMPTY_BRANCH,
      "if (list.length === 0) return cannotTell('nothing-was-wrong');",
    );
    const result = host(api.lintCore([], FACTS));
    assert.match(
      JSON.stringify(result),
      /nothing-was-wrong/,
      'the mutant must report the absence as a clean page, or it is not the mutation E1 exists to catch',
    );
    const failure = reddensBy(
      () => pin(result),
      'reporting the absence as a clean page',
      /an empty capture must name the absence it found/,
    );
    t.diagnostic(`M4 reddens E1: ${failure.message.split('\n')[0]}`);

    pin(loadBare().api.lintCore([], FACTS));
  });

  it('M5: reading any quoted token as a named input reddens the no-construct pin (N2, N3)', (t) => {
    const text =
      'ERROR RuntimeError: NG0950: unused import "UnusedThing" in the page.';
    const pin = (result) =>
      assertCannotTell(
        host(result),
        'message-names-no-construct',
        'a carried code whose body names no input',
      );
    pin(loadBare().api.lintCore([{ code: 'NG0950', text }], FACTS));

    // The mutant takes the first quoted token anywhere in the body as the construct.
    const api = mutant(
      INPUT_MATCH,
      'const found = body.match(NAMED_INPUT) || body.match(/"([^"]+)"/);',
    );
    const result = host(api.lintCore([{ code: 'NG0950', text }], FACTS));
    assert.equal(
      result.construct,
      'UnusedThing',
      'the mutant must name a quoted token the message did not state as an input',
    );
    const failure = reddensBy(
      () => pin(result),
      'reading a quoted token as a named input',
      /a carried code whose body names no input must be cannot-tell/,
    );
    t.diagnostic(`M5 reddens N2/N3: ${failure.message.split('\n')[0]}`);

    pin(loadBare().api.lintCore([{ code: 'NG0950', text }], FACTS));
  });
});
