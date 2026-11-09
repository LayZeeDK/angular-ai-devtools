// Tests for apps/angular-ai-devtools/src/app/panel-error-boundary.ts — the display half of M042 T005
// (INTENT.md SC1, SC2, SC4). The join itself is `extension/error-boundary.js` (T004, landed
// `7ceb997`): this suite runs that join inside a bare `node:vm` context and feeds its answers
// straight into the pane, so the two halves are pinned against each other rather than against a
// hand-written copy of an answer.
//
// Every record below is built from T001's recording (`research/raw/m042-error-boundary.json`), and
// every name in it is read out of that file rather than written here:
//
//   the two views     the `onViewError` quotations keep `"declarationType"` and `"boundaryType"`
//                     as two recorded answers. The pair whose two values differ is the
//                     change-detection catch — the throwing view and the declaring view as two
//                     different LViews — and the pair whose values match is the construction catch,
//                     where they are one view. Both are pinned apart from each other.
//   the error         its name is the recorded `"errorCtor"`, and its message is the recorded
//                     `@error` content with the recorded `caught: ` prefix removed.
//   the fallback      the content the boundary rendered instead, kept whole and reported under its
//                     own name. It and the error's message disagree here because the recording says
//                     they did (`hook.fallback.neverTheError`), which is the interesting case.
//   the reset         `"hasReset":true` from the same quotation: the boundary's `reset()` was
//                     carried, so the pane may say so.
//   caught by         the recorded `details.measured.keys` list, which carries `caughtBy` on the
//                     change-detection path and not on the construction path.
//   the version       `version.declares.coreVersion`, and `version.declares.onAPage` (null), which
//                     is why `no-core-version` travels beside every answer.
//
// The pane's job is separation. The declaring component and the throwing component print on their
// own labelled lines and never on one line that could be either; the error prints its own name and
// message; the fallback prints under its own label and never as the error; the replaced subtree
// prints as the named absence and nothing else, with no node, tag, content or count anywhere; and
// each of the ten named absences prints its own sentence in its own cell and never another's. A
// state the pane was not written for prints that state and nothing else, and `cannot-tell` is never
// an empty pane.
//
// Every criterion is proven non-vacuously: each pin runs against the untouched module first, then
// the same pin runs against a copy of the module source carrying one anchored mutation, which is
// asserted to change the source, must redden that pin, and must redden it by a name that quotes the
// defect. A mutant that survives its pin, or reddens with a message that does not name the defect,
// fails here.
//
// What this suite does not cover, stated so the evidence is not read as wider than it is: the pane
// is rendered as its own text, its own lines and its own cells, not as DOM. The demo's markup — the
// `section.panel-demo[data-surface][data-state]`, `h2`, `p.state` and `p.line` hooks this surface's
// lines flow through — is the demo component's, pinned by `scripts/panel-styles.test.mjs` and the
// app suite, and this task adds no CSS and no markup of its own.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';
import { pathToFileURL } from 'node:url';

const SURFACE_URL = new URL(
  '../apps/angular-ai-devtools/src/app/panel-error-boundary.ts',
  import.meta.url,
);
const SURFACE_SRC = readFileSync(SURFACE_URL, 'utf8');
const SURFACE = await import(SURFACE_URL.href);

const JOIN_SRC = readFileSync(
  new URL('../extension/error-boundary.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m042-error-boundary.json', import.meta.url),
    'utf8',
  ),
);

// ------------------------------------------------------------------ measured fixture ----

/** The two component answers one recorded `onViewError` quotation carries, in its own words. */
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
        text,
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

/** The content the boundary's error view rendered, and the thrown message behind its prefix. */
const RENDERED_TEXT = RECORDING.hook.fallback.text;
const RENDERED_PREFIX = RECORDING.hook.fallback.prefix;
const THROWN_MESSAGE = RENDERED_TEXT.slice(RENDERED_PREFIX.length);

/** The version this surface works against, as the recording declares it. */
const WORKED_AGAINST = RECORDING.version.declares.coreVersion;

/** Whether the change-detection payload the recording measured carried the caught-by mechanism. */
const CARRIES_CAUGHT_BY =
  RECORDING.hook.details.measured.keys.includes('caughtBy');

/**
 * Whether the recorded error view's context carried a reset. The `hasReset` reading sits in a
 * quotation the type pair above does not come from, so every quotation is searched.
 */
function carriesReset() {
  return RECORDING.hook.quotations.some((quotation) =>
    quotation.contains.some((line) => line.includes('"hasReset":true')),
  );
}

/** A record the page agent publishes, with the arrivals a test supplies. */
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

/** One arrival by the hook: the details the payload carried, and the error it carried. */
function hookArrival(details, error) {
  return {
    route: 'hook',
    error: error ?? { name: ERROR_NAME, message: THROWN_MESSAGE },
    details,
    at: 4,
  };
}

/** One delivery by the handler: the error with no `details` at all. */
function deliveryArrival() {
  return {
    route: 'handler',
    error: { name: ERROR_NAME, message: 'raw window error' },
    details: null,
    at: 4,
  };
}

/** The change-detection path's details: the throwing view and the declaring view apart. */
const DIFFERING_DETAILS = {
  declarationType: DIFFERING_PAIR.declarationType,
  declarationInstanceName: 'child',
  caughtBy: CARRIES_CAUGHT_BY ? true : null,
  boundaryType: DIFFERING_PAIR.boundaryType,
  boundaryReset: carriesReset() ? true : null,
};

/** The construction path's details: one view, so the same type twice, and no `caughtBy`. */
const SAME_DETAILS = {
  declarationType: SAME_PAIR.declarationType,
  declarationInstanceName: 'host',
  caughtBy: null,
  boundaryType: SAME_PAIR.boundaryType,
  boundaryReset: carriesReset() ? true : null,
};

/** A hook arrival whose payload carried no boundary at all. */
const BOUNDARY_LESS_DETAILS = {
  ...DIFFERING_DETAILS,
  boundaryType: null,
  boundaryReset: null,
};

/**
 * The value the boundary wrapped. CONSTRUCTED: no recording in this milestone carries a thrown
 * non-Error, so this is a caller input and the expectation built on it is an input echo.
 */
const WRAPPED_CAUSE = { type: 'Object', keys: 0 };

/** A record whose boundary wrapped a thrown value that is not `Error`-like. */
function wrappedRecord() {
  return recordOf({
    entries: [
      hookArrival(DIFFERING_DETAILS, {
        name: 'BoundaryError',
        message: 'an error was thrown inside the template',
        cause: WRAPPED_CAUSE,
      }),
    ],
  });
}

function caughtRecord() {
  return recordOf({ entries: [hookArrival(DIFFERING_DETAILS)] });
}

function sameRecord() {
  return recordOf({ entries: [hookArrival(SAME_DETAILS)] });
}

function noBoundaryRecord() {
  return recordOf({ entries: [hookArrival(BOUNDARY_LESS_DETAILS)] });
}

function deliveryRecord() {
  return recordOf({ entries: [deliveryArrival()] });
}

function mixedRecord() {
  return recordOf({
    entries: [hookArrival(DIFFERING_DETAILS), deliveryArrival()],
  });
}

/** The frame the boundary's rendered content is recorded on, as content and never as the error. */
function fallbackRecord(extra) {
  return recordOf({
    errorView: { state: 'rendered', text: RENDERED_TEXT },
    entries: [hookArrival(DIFFERING_DETAILS)],
    ...extra,
  });
}

/** The same frame, with the view reader holding an error and no rendered view. */
function noErrorViewRecord() {
  return fallbackRecord({
    errorView: { state: 'no-error-view-rendered', text: null },
  });
}

/** A page that declares no browser global error listeners (SC5). */
function noListenersRecord() {
  return fallbackRecord({ globalListeners: 'no-global-error-listeners' });
}

/** A page that caught nothing: the hook is installed and the window is empty (E5). */
function nothingCaughtRecord() {
  return recordOf({});
}

/** A record whose state is the page agent's own machinery absence. */
function machineryRecord(absence) {
  return {
    state: 'cannot-tell',
    absence,
    chained: false,
    globalListeners: null,
    version: WORKED_AGAINST,
    coreVersion: null,
    entries: [],
  };
}

/** Every frame this suite pins, with the name the failure messages use for it. */
function everyRecord() {
  return [
    ['caught', caughtRecord()],
    ['the construction path', sameRecord()],
    ['an arrival with no boundary', noBoundaryRecord()],
    ['a delivery with no details', deliveryRecord()],
    ['a boundary beside a delivery', mixedRecord()],
    ['the rendered fallback', fallbackRecord()],
    ['a wrapped value', wrappedRecord()],
    ['nothing caught', nothingCaughtRecord()],
    ['no rendered error view', noErrorViewRecord()],
    ['no global listeners', noListenersRecord()],
    ['no boundary declared', {}],
    ['machinery unconfirmed', machineryRecord('machinery-unconfirmed')],
    ['handler unresolved', machineryRecord('handler-unresolved')],
    ['hook refused', machineryRecord('hook-refused')],
  ];
}

// --------------------------------------------------------------------------- the join ----

/** `extension/error-boundary.js` run in a bare context, publishing its own namespace. */
function joinApi() {
  const context = createContext({});
  runInContext(JOIN_SRC, context);
  const api = context.angularAiErrorBoundary;
  assert.ok(api, 'extension/error-boundary.js must publish its namespace');
  assert.equal(typeof api.readErrorBoundary, 'function');
  return api;
}

const JOIN = joinApi();

/** A value from the vm context carries that context's own prototypes, so it is copied here first. */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The join's own answer for one record, copied into this realm. */
function answerOf(record) {
  return clone(JOIN.readErrorBoundary(record));
}

/** The join's own answer for each frame, with the name the failure messages use for it. */
const ANSWERS = everyRecord().map(([name, record]) => [name, answerOf(record)]);

/** A synthetic answer carrying one absence and nothing else, for the per-cell pins below. */
function isolatedAnswer(absence) {
  return {
    state: 'cannot-tell',
    absence,
    findings: [],
    absences: [absence],
    version: WORKED_AGAINST,
    coreVersion: null,
    fallback: null,
  };
}

/** The absence sentences, in the pane's own order, as its own exports state them. */
const ABSENCE_TEXTS = SURFACE.ABSENCE_TEXTS;
const ABSENCES = SURFACE.ABSENCES;

// ---------------------------------------------------------------------- mutant plumbing ----

let mutantDir = null;
let mutantCount = 0;

/**
 * A copy of the surface source with one anchored replacement applied. The anchor must occur exactly
 * once, so a mutation cannot silently rewrite a different branch, and the result must differ from
 * the source, so a no-op mutation is a failure rather than a green mutant.
 */
async function loadMutant(anchor, replacement) {
  assert.ok(
    SURFACE_SRC.includes(anchor),
    `mutation anchor not found in panel-error-boundary.ts: ${JSON.stringify(anchor)}`,
  );
  assert.equal(
    SURFACE_SRC.split(anchor).length - 1,
    1,
    `mutation anchor must occur exactly once: ${JSON.stringify(anchor)}`,
  );
  const source = SURFACE_SRC.replace(anchor, replacement);
  assert.notEqual(
    source,
    SURFACE_SRC,
    `the mutation must change the source: ${JSON.stringify(anchor)}`,
  );
  mutantDir ??= mkdtempSync(join(tmpdir(), 'panel-error-boundary-'));
  mutantCount += 1;
  const file = join(mutantDir, `mutant-${mutantCount}.ts`);
  writeFileSync(file, source, 'utf8');
  return { module: await import(pathToFileURL(file).href), source };
}

after(() => {
  if (mutantDir) rmSync(mutantDir, { recursive: true, force: true });
});

/**
 * Three phases of a non-vacuous pin, with the untouched module's pass asserted by the caller: the
 * mutated copy is run through the same pin, the pin reddens, and the failure names the defect.
 */
function reddens(name, render) {
  let failure = null;
  try {
    render();
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    `${name}: the mutated copy must redden the pin`,
  );
  assert.match(
    failure.message,
    new RegExp(name),
    `${name}: the pin must fail by name, got: ${failure.message}`,
  );
  console.log(
    `mutant ${name} reddens: ${failure.message.replace(/\s+/g, ' ').trim()}`,
  );
  return failure;
}

// ------------------------------------------------------------- the pane's own answer ----

/** The find lines of one rendered surface, by label. */
function linesUnder(surface, label) {
  return surface.lines.filter((line) => line.startsWith(`${label}: `));
}

/** The one line a label appears on, and a failure naming the label when it appears on none or many. */
function oneLineUnder(surface, label, name) {
  const found = linesUnder(surface, label);
  assert.equal(
    found.length,
    1,
    `${name}: the pane must print exactly one \`${label}:\` line; it printed ${JSON.stringify(found)} in ${JSON.stringify(surface.lines)}`,
  );
  return found[0];
}

/** Every non-empty cell, as the lines the flat rendering must also carry. */
function nonEmptyCells(surface) {
  return Object.entries(surface.cells).filter(([, text]) => text !== '');
}

// --------------------------------------------------------------------------- the pins ----

/**
 * AC1: each state renders its own text and no other's. The four states are the caught answer, a
 * cannot-tell answer, the pane before any answer arrives, and a word the pane was not written for.
 */
function pinStatesApart(pane) {
  const caught = pane.errorBoundaryPanel(answerOf(fallbackRecord()));
  assert.equal(
    caught.state,
    'caught',
    'AC1 caught-state-is-the-answers: the pane answers the state the join answered',
  );
  assert.equal(
    caught.lines[0],
    'state: caught',
    'AC1 caught-state-line-first: the state word opens the pane',
  );
  assert.ok(
    caught.lines.includes(pane.CAUGHT_TEXT),
    'AC1 caught-renders-its-own-text: the caught state prints its own sentence',
  );
  assert.equal(
    caught.text.includes(pane.CANNOT_TELL_TEXT),
    false,
    'AC1 caught-does-not-borrow-cannot-tell: a caught pane prints no cannot-tell text',
  );

  for (const [name, answer] of ANSWERS) {
    if (answer.state !== 'caught') continue;
    const surface = pane.errorBoundaryPanel(answer);
    assert.equal(
      surface.text.includes(pane.CANNOT_TELL_TEXT),
      false,
      `AC1 caught-does-not-borrow-cannot-tell: ${name}`,
    );
  }

  const cannotTell = pane.errorBoundaryPanel(isolatedAnswer('no-error-caught'));
  assert.equal(
    cannotTell.lines[0],
    'state: cannot-tell',
    'AC1 cannot-tell-state-line: a cannot-tell answer says so first',
  );
  assert.ok(
    cannotTell.lines.includes(pane.CANNOT_TELL_TEXT),
    'AC1 cannot-tell-renders-its-own-text: the cannot-tell state prints its own sentence',
  );
  assert.equal(
    cannotTell.text.includes(pane.CAUGHT_TEXT),
    false,
    'AC1 cannot-tell-does-not-borrow-caught: a cannot-tell pane prints no caught text',
  );

  const idle = pane.errorBoundaryPanel(undefined);
  assert.equal(
    idle.state,
    'idle',
    'AC1 idle-before-any-answer: nothing has arrived',
  );
  assert.deepEqual(
    idle.lines,
    [pane.IDLE_MESSAGE],
    'AC1 idle-renders-its-own-text: the idle pane prints its own message and nothing else',
  );
  assert.deepEqual(
    idle.cells,
    Object.fromEntries(Object.keys(idle.cells).map((key) => [key, ''])),
    'AC1 idle-establishes-no-state: every cell is the empty string before an answer',
  );

  // A state the pane was not written for renders that state and nothing else: it borrows no
  // finding, no fallback and no absence sentence, because it has no field to fill in for it.
  for (const word of ['watched', 'halted', 'installed']) {
    const given = pane.errorBoundaryPanel({
      ...isolatedAnswer('no-error-caught'),
      state: word,
    });
    assert.equal(given.state, word, `AC1 given-state-is-echoed: ${word}`);
    assert.deepEqual(
      given.lines,
      [`state: ${word}`],
      `AC1 given-state-renders-itself-and-nothing-else: ${word}`,
    );
    assert.equal(
      given.text.includes(pane.CANNOT_TELL_TEXT),
      false,
      `AC1 given-state-borrows-no-cannot-tell: ${word}`,
    );
    assert.deepEqual(
      nonEmptyCells(given),
      [],
      `AC1 given-state-fills-no-cell: ${word}`,
    );
  }

  console.log(
    `pane states: ${JSON.stringify(['caught', 'cannot-tell', 'idle', 'watched'])} each rendered apart`,
  );
  return caught;
}

/**
 * AC2: the declaring component and the throwing component are two facts on their own labelled
 * lines, never one line that could be either — and the construction path, where both answers are the
 * same view, still prints them as two labelled facts rather than collapsing them.
 */
function pinFactsApart(pane) {
  const answer = answerOf(caughtRecord());
  const surface = pane.errorBoundaryPanel(answer);
  const finding = answer.findings[0];
  assert.ok(finding, 'AC2 the recorded catch answers one finding');

  const declaring = oneLineUnder(
    surface,
    pane.DECLARING_LABEL,
    'AC2 declaring-component-labelled',
  );
  const throwing = oneLineUnder(
    surface,
    pane.THROWING_LABEL,
    'AC2 throwing-component-labelled',
  );
  assert.equal(
    declaring,
    `${pane.DECLARING_LABEL}: ${finding.declaringType}`,
    'AC2 declaring-component-is-the-boundary: the line carries the declaring view and nothing else',
  );
  assert.equal(
    throwing,
    `${pane.THROWING_LABEL}: ${finding.throwingType}`,
    'AC2 throwing-component-is-the-declaration: the line carries the throwing view and nothing else',
  );
  assert.notEqual(
    declaring,
    throwing,
    'AC2 two-facts-two-lines: the two answers are not one line',
  );
  assert.equal(
    declaring.includes(finding.throwingType),
    false,
    `AC2 declaring-line-is-not-the-thrower: the declaring line reads ${JSON.stringify(declaring)} and must not name ${JSON.stringify(finding.throwingType)}`,
  );
  assert.equal(
    throwing.includes(finding.declaringType),
    false,
    `AC2 throwing-line-is-not-the-declarer: the throwing line reads ${JSON.stringify(throwing)} and must not name ${JSON.stringify(finding.declaringType)}`,
  );

  // The construction path: one view, so the same name twice, on two labelled lines — the same
  // answer twice is one answer, never a parent invented for it and never one merged line.
  const sameAnswer = answerOf(sameRecord());
  const sameSurface = pane.errorBoundaryPanel(sameAnswer);
  const sameFinding = sameAnswer.findings[0];
  assert.ok(sameFinding, 'AC2 the construction catch answers one finding');
  assert.equal(
    oneLineUnder(
      sameSurface,
      pane.DECLARING_LABEL,
      'AC2 construction-declaring-labelled',
    ),
    `${pane.DECLARING_LABEL}: ${sameFinding.declaringType}`,
    'AC2 construction-declaring-line: the construction catch names the declaring view',
  );
  assert.equal(
    oneLineUnder(
      sameSurface,
      pane.THROWING_LABEL,
      'AC2 construction-throwing-labelled',
    ),
    `${pane.THROWING_LABEL}: ${sameFinding.throwingType}`,
    'AC2 construction-throwing-line: and the declaration it carried is the same view',
  );
  assert.equal(
    sameFinding.declaringType,
    sameFinding.throwingType,
    'AC2 one-type-is-one-answer-twice: the construction path names one view twice',
  );
  assert.equal(
    sameSurface.lines.filter((line) =>
      line.startsWith(`${pane.DECLARING_LABEL}: `),
    ).length,
    1,
    'AC2 construction-one-declaring-line: a merged line would redden the throwing pin above',
  );

  console.log(
    `pane facts apart: ${JSON.stringify(declaring)} | ${JSON.stringify(throwing)}`,
  );
  return surface;
}

/**
 * AC2: the error is the thrown value — its own name, its own message, and the cause only where the
 * record carried one. The content the boundary rendered instead prints under its own fallback label
 * and never as the error.
 */
function pinErrorIsNotTheFallback(pane) {
  const answer = answerOf(fallbackRecord());
  const surface = pane.errorBoundaryPanel(answer);
  const finding = answer.findings[0];
  assert.ok(finding, 'AC2 the recorded catch answers one finding');

  assert.equal(
    linesUnder(surface, 'error message').some((line) =>
      line.includes(answer.fallback),
    ),
    false,
    `AC2 fallback-is-not-the-error: no line labelled \`error message:\` may carry the rendered content ${JSON.stringify(answer.fallback)}; the pane reads ${JSON.stringify(surface.lines)}`,
  );
  assert.equal(
    surface.lines.some((line) => line === `error message: ${answer.fallback}`),
    false,
    `AC2 fallback-is-never-the-errors-message: the rendered content ${JSON.stringify(answer.fallback)} must never stand as the error's own message`,
  );

  assert.equal(
    oneLineUnder(surface, 'error', 'AC2 error-name-labelled'),
    `error: ${finding.errorName}`,
    'AC2 error-name-is-the-thrown-name',
  );
  assert.equal(
    oneLineUnder(surface, 'error message', 'AC2 error-message-labelled'),
    `error message: ${finding.errorMessage}`,
    'AC2 error-message-is-the-thrown-message',
  );
  assert.notEqual(
    finding.errorMessage,
    answer.fallback,
    'AC2 the-error-and-the-fallback-disagree-here: the recorded case is the interesting one',
  );

  const fallback = oneLineUnder(
    surface,
    pane.FALLBACK_LABEL,
    'AC2 fallback-labelled',
  );
  assert.equal(
    fallback,
    `${pane.FALLBACK_LABEL}: ${answer.fallback}`,
    'AC2 fallback-is-the-rendered-content: the fallback line carries the rendered content whole',
  );
  assert.equal(
    surface.text.includes(`error message: ${answer.fallback}`),
    false,
    `AC2 fallback-is-not-the-error: the rendered content must not stand as the error's message; the pane reads ${JSON.stringify(surface.lines)}`,
  );
  assert.equal(
    linesUnder(surface, 'error message').some((line) =>
      line.includes(answer.fallback),
    ),
    false,
    'AC2 no-error-line-carries-the-fallback: not on the error message line, and not on the error name line',
  );
  // The fallback appears exactly once, and under its own label.
  const occurrences = surface.lines.filter((line) =>
    line.includes(answer.fallback),
  );
  assert.deepEqual(
    occurrences,
    [fallback],
    'AC2 fallback-printed-once-under-its-own-label',
  );

  // The cause, where the record carried one, and nothing where it did not.
  const wrapped = pane.errorBoundaryPanel(answerOf(wrappedRecord()));
  const wrappedFinding = answerOf(wrappedRecord()).findings[0];
  assert.ok(wrappedFinding, 'AC2 the wrapped arrival answers one finding');
  assert.equal(
    oneLineUnder(wrapped, 'cause', 'AC2 cause-labelled-where-carried'),
    `cause: ${JSON.stringify(WRAPPED_CAUSE)}`,
    'AC2 the-cause-is-the-records-own-value',
  );
  assert.deepEqual(
    linesUnder(surface, 'cause'),
    [],
    'AC2 cause-printed-only-where-carried: an error the app threw itself carries none',
  );

  // A delivery that carried no details prints no declaring component, no caught-by and no reset.
  const delivery = pane.errorBoundaryPanel(answerOf(deliveryRecord()));
  for (const label of [
    pane.DECLARING_LABEL,
    pane.THROWING_LABEL,
    'caught by',
    'reset',
  ]) {
    assert.deepEqual(
      linesUnder(delivery, label),
      [],
      `AC2 delivery-prints-no-${label.replace(/\s+/g, '-')}: an arrival with no details names no boundary`,
    );
  }
  assert.equal(
    linesUnder(delivery, 'error').length,
    1,
    'AC2 delivery-still-prints-the-error: no details means no boundary, not no error',
  );

  console.log(
    `pane error and fallback apart: ${JSON.stringify(finding.errorMessage)} | ${JSON.stringify(fallback)}`,
  );
  return surface;
}

/**
 * AC5: each named absence renders its own sentence in its own cell, and never another state's
 * text, never an empty string, never "no errors occurred" and never a boundary it does not have.
 */
function pinAbsenceSentences(pane) {
  const sentences = Object.values(ABSENCE_TEXTS);
  assert.equal(
    new Set(sentences).size,
    sentences.length,
    'AC5 every-absence-has-its-own-sentence: two absences sharing one sentence would be indistinguishable in the pane',
  );
  for (const absence of ABSENCES) {
    const sentence = ABSENCE_TEXTS[absence];
    assert.equal(
      typeof sentence,
      'string',
      `AC5 every-absence-has-a-sentence: ${absence}`,
    );
    assert.notEqual(
      sentence.trim(),
      '',
      `AC5 never-an-empty-string: ${absence} must not render as the empty string`,
    );
    assert.equal(
      sentence.startsWith(`${absence}:`),
      true,
      `AC5 the-sentence-names-its-own-absence: ${absence} renders ${JSON.stringify(sentence)}`,
    );
    assert.equal(
      /no errors/i.test(sentence),
      false,
      `AC5 never-no-errors-occurred: ${absence}`,
    );
    assert.equal(
      /\bzero\b/i.test(sentence),
      false,
      `AC5 never-a-count: ${absence}`,
    );
  }

  for (const absence of ABSENCES) {
    const surface = pane.errorBoundaryPanel(isolatedAnswer(absence));
    assert.equal(
      surface.cells[absence],
      ABSENCE_TEXTS[absence],
      `AC5 the-absences-own-cell: ${absence} must fill its own cell and no other`,
    );
    for (const other of ABSENCES) {
      if (other === absence) continue;
      assert.equal(
        surface.cells[other],
        '',
        `AC5 no-other-cell: ${absence} must leave ${other}'s cell empty, or one state is rendering another's text`,
      );
      assert.equal(
        surface.text.includes(ABSENCE_TEXTS[other]),
        false,
        `AC5 no-other-sentence: ${absence} must not render ${other}'s sentence; the pane reads ${JSON.stringify(surface.lines)}`,
      );
    }
    assert.ok(
      surface.lines.includes(ABSENCE_TEXTS[absence]),
      `AC5 the-sentence-is-a-line: ${absence} must render as a line of the pane`,
    );
    // An absence is not a boundary, not an error and not a fallback.
    for (const label of [
      pane.DECLARING_LABEL,
      pane.THROWING_LABEL,
      'error',
      'error message',
      pane.FALLBACK_LABEL,
      'replaced subtree',
    ]) {
      assert.deepEqual(
        linesUnder(surface, label),
        [],
        `AC5 an-absence-is-not-a-${label.replace(/\s+/g, '-')}: ${absence}`,
      );
    }
  }

  // The join's vocabulary and the pane's are one vocabulary: across the recorded frames the join
  // answers with exactly these ten absences, so a pane that invented or dropped one reddens here.
  const seen = new Set();
  for (const [, answer] of ANSWERS) {
    if (answer.absence !== null) seen.add(answer.absence);
    for (const absence of answer.absences) seen.add(absence);
  }
  assert.deepEqual(
    [...seen].sort(),
    [...ABSENCES].sort(),
    'AC5 the-pane-names-the-joins-vocabulary: the ten absences the join answers with are the ten cells',
  );

  // And a real answer carrying several absences fills each of their cells and no other.
  const caught = pane.errorBoundaryPanel(answerOf(fallbackRecord()));
  for (const absence of ABSENCES) {
    const carried = answerOf(fallbackRecord()).absences.includes(absence);
    assert.equal(
      caught.cells[absence],
      carried ? ABSENCE_TEXTS[absence] : '',
      `AC5 carried-absences-fill-their-cells: ${absence}`,
    );
  }

  console.log(
    `pane absences: ten sentences, each in its own cell (${JSON.stringify(caught.cells['no-replaced-subtree'] ?? '')})`,
  );
  return caught;
}

/** AC1, AC5: a cannot-tell answer is never an empty pane, with or without an absence beside it. */
function pinCannotTellNeverEmpty(pane) {
  const cases = [
    ['a named absence', isolatedAnswer('no-error-caught')],
    [
      'no absence at all',
      { ...isolatedAnswer('no-error-caught'), absence: null, absences: [] },
    ],
    ...ANSWERS.filter(([, answer]) => answer.state === 'cannot-tell'),
  ];
  for (const [name, answer] of cases) {
    const surface = pane.errorBoundaryPanel(answer);
    assert.equal(
      surface.state,
      'cannot-tell',
      `AC1 cannot-tell-is-rendered-as-cannot-tell: ${name}`,
    );
    assert.ok(
      surface.lines.length > 0,
      `AC1 never-an-empty-list: a cannot-tell pane must print at least one line (${name})`,
    );
    assert.notEqual(surface.text.trim(), '', `AC1 never-a-blank-pane: ${name}`);
    assert.equal(
      surface.text.includes('cannot-tell') || surface.text.includes('no-error'),
      true,
      `AC1 cannot-tell-names-itself-or-its-absence: ${name} reads ${JSON.stringify(surface.lines)}`,
    );
  }
  // The bare cannot-tell answer, with nothing beside it, still prints the state's own sentence.
  const bare = pane.errorBoundaryPanel({
    ...isolatedAnswer('no-error-caught'),
    absence: null,
    absences: [],
  });
  assert.ok(
    bare.lines.includes(pane.CANNOT_TELL_TEXT),
    'AC1 cannot-tell-with-no-absence-prints-its-own-sentence',
  );

  console.log(
    `pane cannot-tell: ${cases.length} answers, each with at least ${JSON.stringify(bare.lines[1])}`,
  );
  return bare;
}

/** AC4: the replaced subtree is the named absence, and no node, tag, content or count appears. */
function pinNoSubtree(pane) {
  const answer = answerOf(fallbackRecord());
  const surface = pane.errorBoundaryPanel(answer);
  const finding = answer.findings[0];
  assert.ok(finding, 'AC4 the recorded catch answers one finding');
  assert.equal(
    finding.replacedSubtree,
    'no-replaced-subtree',
    'AC4 the-join-carries-the-absence: the replaced subtree is recorded nowhere',
  );
  assert.equal(
    oneLineUnder(surface, 'replaced subtree', 'AC4 replaced-subtree-labelled'),
    'replaced subtree: no-replaced-subtree',
    'AC4 the-subtree-renders-as-its-absence: the field carries the absence and nothing else',
  );
  assert.ok(
    surface.lines.includes(ABSENCE_TEXTS['no-replaced-subtree']),
    'AC4 the-absence-renders-its-sentence: the named absence has its own line',
  );

  const claims = [
    ['a tag', /<\/?[a-z]/i],
    ['a node', /\bnodes?\b/i],
    ['a tag word', /\btags?\b/i],
    ['content', /\btexts?\b/i],
    ['a count', /\bcounts?\b/i],
    ['children', /\bchildren\b/i],
  ];
  for (const [name, answer2] of ANSWERS) {
    const rendered = pane.errorBoundaryPanel(answer2).text;
    for (const [what, pattern] of claims) {
      assert.equal(
        pattern.test(rendered),
        false,
        `AC4 no-replaced-${name.replace(/\s+/g, '-')}: the pane must describe no ${what} of the replaced primary view; it reads ${JSON.stringify(rendered)}`,
      );
    }
  }

  console.log(
    'pane subtree: no-replaced-subtree, and nothing of the primary view',
  );
  return surface;
}

/** AC1: every non-empty cell is a line of the flat rendering, and `text` is the lines joined. */
function pinCellsAreTheLines(pane) {
  for (const [name, answer] of [
    ...ANSWERS,
    [
      'a given state',
      { ...isolatedAnswer('no-error-caught'), state: 'halted' },
    ],
  ]) {
    const surface = pane.errorBoundaryPanel(answer);
    for (const [cell, text] of nonEmptyCells(surface)) {
      assert.ok(
        surface.lines.includes(text),
        `AC1 every-non-empty-cell-is-a-line: ${cell} holds ${JSON.stringify(text)}, which the pane does not print (${name})`,
      );
    }
    assert.equal(
      surface.text,
      surface.lines.join('\n'),
      `AC1 text-is-the-lines-joined: ${name}`,
    );
    assert.equal(surface.state, surface.kind, `AC1 kind-is-the-state: ${name}`);
    assert.equal(
      surface.message,
      surface.lines[0],
      `AC1 message-is-the-first-line: ${name}`,
    );
  }
  console.log(
    'pane cells: every non-empty cell is a line, and text is the lines',
  );
}

/** The pane is a display half: no runtime imports, no join, no DOM, no clock, no console. */
function pinPure(source) {
  assert.equal(
    /^\s*import\s/m.test(source),
    false,
    'the pane must import nothing at runtime: the route reaches it lazily through the demo',
  );
  for (const [what, pattern] of [
    ['a join call', /\breadErrorBoundary\b/],
    ['the join namespace', /angularAiErrorBoundary/],
    ['a DOM read', /\b(document|window)\s*\./],
    ['a clock read', /\b(Date|performance|setTimeout|setInterval)\b/],
    ['a console call', /\bconsole\b/],
    ['a network call', /\b(fetch|XMLHttpRequest)\b/],
    ['a DOM query', /\b(querySelector|getElementById|createElement)\b/],
    ['a page read', /\bng\.\w+|\bgetContext\b/],
  ]) {
    assert.equal(
      pattern.test(
        source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, ''),
      ),
      false,
      `the pane must contain no ${what}: ${pattern}`,
    );
  }
  for (const part of ['state', 'message', 'lines', 'text', 'cells']) {
    assert.ok(
      new RegExp(`readonly ${part}:`).test(source),
      `the pane's answer must carry \`${part}\``,
    );
  }
  console.log('pane purity: no imports, no join, no DOM, no clock, no console');
}

// --------------------------------------------------------------------------- the pins ----

describe('the pane renders the join’s answer', () => {
  it('AC1: each state renders its own text and no other state’s', () => {
    pinStatesApart(SURFACE);
  });

  it('AC2: the declaring component and the throwing component are two labelled facts', () => {
    pinFactsApart(SURFACE);
  });

  it('AC2: the error is the thrown value and the fallback is fallback content', () => {
    pinErrorIsNotTheFallback(SURFACE);
  });

  it('AC5: each named absence renders its own sentence in its own cell', () => {
    pinAbsenceSentences(SURFACE);
  });

  it('AC1: a cannot-tell answer is never an empty pane', () => {
    pinCannotTellNeverEmpty(SURFACE);
  });

  it('AC4: the replaced subtree is the named absence and nothing else', () => {
    pinNoSubtree(SURFACE);
  });

  it('AC1: every cell the pane fills is a line it prints', () => {
    pinCellsAreTheLines(SURFACE);
  });

  it('the pane is a display half: no imports, no join, no DOM and no clock', () => {
    pinPure(SURFACE_SRC);
  });
});

// --------------------------------------------------------------------------- mutants ----

describe('mutants redden by name', () => {
  it('reddens by name: a cell rendering another state’s text', async () => {
    pinAbsenceSentences(SURFACE);

    const anchor = [
      '  for (const absence of carried) {',
      '    if (isAbsenceName(absence)) cells[absence] = ABSENCE_TEXTS[absence];',
      '  }',
    ].join('\n');
    const mutant = await loadMutant(
      anchor,
      anchor +
        "\n  if (carried.length > 0) cells['no-error-caught'] = ABSENCE_TEXTS['no-error-caught'];",
    );

    // The mutated pane fills one absent state's cell with another state's sentence.
    const rendered = mutant.module.errorBoundaryPanel(
      isolatedAnswer('no-boundary-details'),
    );
    assert.equal(
      rendered.cells['no-error-caught'],
      ABSENCE_TEXTS['no-error-caught'],
      'the mutant lets no-boundary-details render no-error-caught’s sentence',
    );

    reddens('AC5 no-other-cell', () => pinAbsenceSentences(mutant.module));
    console.log(
      `  the mutant named ${JSON.stringify(ABSENCE_TEXTS['no-error-caught'])} beside ${JSON.stringify(ABSENCE_TEXTS['no-boundary-details'])}`,
    );
  });

  it('reddens by name: the declaring and the throwing types collapsed into one line', async () => {
    pinFactsApart(SURFACE);

    const anchor = [
      "  if (finding.declaringType !== '')",
      '    lines.push(`${DECLARING_LABEL}: ${finding.declaringType}`);',
      "  if (finding.throwingType !== '')",
      '    lines.push(`${THROWING_LABEL}: ${finding.throwingType}`);',
    ].join('\n');
    const mutant = await loadMutant(
      anchor,
      [
        "  if (finding.declaringType !== '' || finding.throwingType !== '')",
        '    lines.push(',
        '      `${DECLARING_LABEL}: ${finding.declaringType} / ${finding.throwingType}`,',
        '    );',
      ].join('\n'),
    );

    const collapsed = mutant.module.errorBoundaryPanel(
      answerOf(caughtRecord()),
    );
    const merged = collapsed.lines.filter((line) =>
      line.startsWith(`${SURFACE.DECLARING_LABEL}: `),
    );
    assert.equal(
      merged.length,
      1,
      'the mutant prints one merged component line',
    );
    assert.ok(
      merged[0].includes(DIFFERING_PAIR.declarationType) &&
        merged[0].includes(DIFFERING_PAIR.boundaryType),
      'the merged line carries both names, so a reader cannot say which question it answers',
    );

    reddens('AC2 throwing-component-labelled', () =>
      pinFactsApart(mutant.module),
    );
    console.log(`  the mutant printed ${JSON.stringify(merged[0])}`);
  });

  it('reddens by name: the fallback rendered as the error', async () => {
    pinErrorIsNotTheFallback(SURFACE);

    const anchor = [
      "  if (read.fallback !== '') lines.push(`${FALLBACK_LABEL}: ${read.fallback}`);",
    ].join('\n');
    const mutant = await loadMutant(
      anchor,
      "  if (read.fallback !== '') lines.push(`error message: ${read.fallback}`);",
    );

    const quoted = mutant.module.errorBoundaryPanel(answerOf(fallbackRecord()));
    assert.ok(
      quoted.lines.includes(`error message: ${RENDERED_TEXT}`),
      'the mutant quotes the rendered fallback as the error’s own message',
    );

    reddens('AC2 fallback-is-not-the-error', () =>
      pinErrorIsNotTheFallback(mutant.module),
    );
    console.log(
      `  the mutant printed ${JSON.stringify(RENDERED_TEXT)} as the error`,
    );
  });

  it('reddens by name: an absence rendered as an empty list', async () => {
    pinCannotTellNeverEmpty(SURFACE);

    const anchor = [
      '  for (const absence of ABSENCES) {',
      "    const sentence = cells[absence] ?? '';",
      "    if (sentence !== '') lines.push(sentence);",
      '  }',
    ].join('\n');
    const mutant = await loadMutant(
      anchor,
      [
        '  for (const absence of ABSENCES) {',
        "    const sentence = cells[absence] ?? '';",
        "    if (sentence !== '' && absence === 'no-replaced-subtree') lines.push(sentence);",
        '  }',
      ].join('\n'),
    );

    const emptied = mutant.module.errorBoundaryPanel(
      isolatedAnswer('no-error-caught'),
    );
    assert.equal(
      emptied.lines.includes(ABSENCE_TEXTS['no-error-caught']),
      false,
      'the mutant renders the absence’s cell but never its sentence as a line',
    );

    reddens('AC5 the-sentence-is-a-line', () =>
      pinAbsenceSentences(mutant.module),
    );
    console.log(
      `  the mutant left ${JSON.stringify(ABSENCE_TEXTS['no-error-caught'])} out of the pane while its cell still held it`,
    );
  });

  it('reddens by name: a replaced subtree described though nothing recorded it', async () => {
    pinNoSubtree(SURFACE);

    const anchor =
      "    replacedSubtree: nonEmptyString(raw['replacedSubtree']) ?? '',";
    const mutant = await loadMutant(
      anchor,
      "    replacedSubtree: 'the replaced <div> and its 2 nodes',",
    );

    const described = mutant.module.errorBoundaryPanel(
      answerOf(fallbackRecord()),
    );
    assert.ok(
      described.lines.includes(
        'replaced subtree: the replaced <div> and its 2 nodes',
      ),
      'the mutant describes a subtree the boundary recorded nowhere',
    );

    reddens('AC4 the-subtree-renders-as-its-absence', () =>
      pinNoSubtree(mutant.module),
    );
    console.log(
      '  the mutant printed "the replaced <div> and its 2 nodes" where the absence belongs',
    );
  });
});
