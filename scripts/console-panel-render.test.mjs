// console-panel-render.test.mjs — M045 T003. The console pane renders the join's `{ state, findings[] }`
// and nothing else (INTENT.md SC3, SC4, SC5; held-out E7).
//
// The join itself is `extension/console-join.js` (T002), and this suite runs it in a bare `node:vm`
// context over the digest the extension actually ships (`extension/error-digest.json`) and the
// payload shape `research/raw/m045-console-shapes.json` records `captureErrorPayload` dispatching, so
// the pane is held against the join's own answers rather than against answers written here. Both
// codes the fixture uses are measured ones: `NG0100` is a digest code with a title of its own, and
// `NG04002` is a code the capture's own `/NG0\d{3,}/` regex extracts and the digest does not carry,
// which is why it reaches the pane as a code named by hand and a `no-digest-entry` absence.
//
// What the pane may render: the state word, and for each finding the code it carried, the digest's
// title for it where the digest has one, the join's reason where the digest lacks it, and the
// captured text verbatim. What it may not render (E7): a cause, an element reference, a remedy, an
// unattributed word about the framework, an empty list standing in for `captured-nothing`, or a count
// standing in for a code the digest lacks. Each of those six defects is armed as a mutation of the
// pane's own source and shown to redden the pin that names it — a mutant that survives its pin, or
// reddens with a message that does not name the defect, fails this suite.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';
import { pathToFileURL } from 'node:url';

const SURFACE_URL = new URL(
  '../apps/angular-ai-devtools/src/app/panel-console.ts',
  import.meta.url,
);
const SURFACE_SRC = readFileSync(SURFACE_URL, 'utf8');
const SURFACE = await import(SURFACE_URL.href);

const JOIN_SRC = readFileSync(
  new URL('../extension/console-join.js', import.meta.url),
  'utf8',
);
const DIGEST = JSON.parse(
  readFileSync(
    new URL('../extension/error-digest.json', import.meta.url),
    'utf8',
  ),
);
const RECORD = JSON.parse(
  readFileSync(
    new URL('../research/raw/m045-console-shapes.json', import.meta.url),
    'utf8',
  ),
);

// ------------------------------------------------------------------ the fixture ----

/**
 * Two diagnostics in the payload shape the record states — `{ code, message, component, timestamp }`
 * — plus one whose message carried no code at all. `component` and `timestamp` are written because
 * the capture writes them; only `code` and `message` reach the join, and the pane renders neither of
 * the other two.
 */
const MATCHED = {
  code: 'NG0100',
  message: 'NG0100: Expression has changed after it was checked.',
  component: null,
  timestamp: 1,
};
const UNMATCHED = {
  code: 'NG04002',
  message:
    'NG04002: Cannot match any routes. URL Segment: this-route-does-not-exist',
  component: null,
  timestamp: 2,
};
const UNCODED = {
  code: null,
  message: 'the app failed',
  component: null,
  timestamp: 3,
};

/** The join, in a bare context: no DOM, no clock, no console, publishing its own namespace. */
function joinApi() {
  const context = createContext({});
  runInContext(JOIN_SRC, context);
  const api = context.angularAiConsoleJoin;
  assert.ok(api, 'extension/console-join.js must publish its namespace');
  assert.equal(typeof api.consoleJoin, 'function');
  return api;
}

const JOIN = joinApi();

/** A value from the vm context carries that context's prototypes, so it is copied here first. */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The join's own answer for three diagnostics: matched, unmatched and uncoded, in capture order. */
function joinedAnswer() {
  return clone(JOIN.consoleJoin([MATCHED, UNMATCHED, UNCODED], DIGEST));
}

/** The join's own answer for a capture that was read and carried no diagnostic. */
function capturedNothingAnswer() {
  return clone(JOIN.consoleJoin([], DIGEST));
}

/** The join's own answer for a capture that was never handed over at all. */
function noDiagnosticsAnswer() {
  return clone(JOIN.consoleJoin(undefined, DIGEST));
}

/**
 * The joined answer with its one finding fattened by the fields the capture does not record for it: a
 * cause, an element reference, a remedy, the capture's own `component` and a count. The pane may
 * render none of them, which is what E7 is written about.
 */
function fattenedAnswer() {
  const answer = clone(JOIN.consoleJoin([MATCHED], DIGEST));
  answer.findings[0] = {
    ...answer.findings[0],
    cause: 'the navigation the page cancelled',
    element: '<app-root class="shell">',
    remedy: 'add a check before the write',
    component: 'AppComponent',
    count: 3,
  };
  return answer;
}

/** The shipped digest's own title for one code, read rather than restated. */
function shippedTitle(code) {
  const entry = DIGEST.entries.find((candidate) => candidate.code === code);
  return entry === undefined ? null : entry.title;
}

// ---------------------------------------------------------------------- mutant plumbing ----

let mutantDir = null;
let mutantCount = 0;

/**
 * A copy of the pane's source with one anchored replacement applied. The anchor must occur exactly
 * once, so a mutation cannot silently rewrite a different branch, and the result must differ from the
 * source, so a no-op mutation is a failure rather than a green mutant.
 */
async function loadMutant(anchor, replacement) {
  assert.ok(
    SURFACE_SRC.includes(anchor),
    `mutation anchor not found in panel-console.ts: ${JSON.stringify(anchor)}`,
  );
  assert.equal(
    SURFACE_SRC.split(anchor).length - 1,
    1,
    `mutation anchor must occur exactly once: ${JSON.stringify(anchor)}`,
  );
  const source = SURFACE_SRC.replace(anchor, () => replacement);
  assert.notEqual(
    source,
    SURFACE_SRC,
    `the mutation must change the source: ${JSON.stringify(anchor)}`,
  );
  mutantDir ??= mkdtempSync(join(tmpdir(), 'console-panel-'));
  mutantCount += 1;
  const file = join(mutantDir, `mutant-${mutantCount}.ts`);
  writeFileSync(file, source, 'utf8');
  return { module: await import(pathToFileURL(file).href), source };
}

after(() => {
  if (mutantDir) rmSync(mutantDir, { recursive: true, force: true });
});

/**
 * The non-vacuous half of a pin: the mutated copy is run through the same pin, the pin reddens, and
 * the failure names the defect. Every caller runs the pin against the shipped pane first, so the
 * failure is the mutation's.
 */
function reddens(name, pin) {
  let failure = null;
  try {
    pin();
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

// -------------------------------------------------------------------------- the pins ----

/** Every sentence the pane may write of its own for one answer, read from the module itself. */
function ownSentences(answer) {
  const sentences = new Set(Object.values(SURFACE.STATE_TEXTS));
  sentences.add(SURFACE.NO_ANSWER_TEXT);
  sentences.add(SURFACE.NO_FINDING_TEXT);
  sentences.add(SURFACE.NO_CODE_TEXT);
  sentences.add(SURFACE.NO_TITLE_TEXT);
  sentences.add(SURFACE.UNREADABLE_FINDING_TEXT);
  for (const finding of answer.findings) {
    if (typeof finding.code === 'string')
      sentences.add(SURFACE.noDigestEntryText(finding.code));
  }
  return sentences;
}

/**
 * SC4/E7: every line is the state word, a field of a finding, or one of the pane's own named
 * absences — nothing else reaches the surface. Every finding is rendered, once each, in the capture's
 * own order, and no finding is collapsed or repeated.
 */
function pinRendersTheAnswerAndNothingElse(surface, answer) {
  assert.equal(
    surface.state,
    answer.state,
    `renders-the-answer: the pane reports the state the answer carried (${answer.state}); it reported ${surface.state}`,
  );
  assert.equal(
    surface.kind,
    answer.state,
    'renders-the-answer: the kind is the word',
  );
  const sentences = ownSentences(answer);
  const fields = new Set([`state: ${answer.state}`]);
  for (const finding of answer.findings) {
    if (typeof finding.text === 'string') fields.add(`text: ${finding.text}`);
    if (typeof finding.code === 'string') fields.add(`code: ${finding.code}`);
    if (typeof finding.title === 'string')
      fields.add(`title: ${finding.title}`);
    if (
      typeof finding.reason === 'string' &&
      finding.reason !== SURFACE.NO_DIGEST_ENTRY
    )
      fields.add(`reason: ${finding.reason}`);
  }
  for (const line of surface.lines) {
    assert.ok(
      fields.has(line) || sentences.has(line),
      `renders-the-answer-and-nothing-else: the line ${JSON.stringify(line)} is neither a field of the answer nor one of the pane's own named absences; the pane rendered ${JSON.stringify(surface.lines)}`,
    );
  }
  assert.deepEqual(
    surface.lines.filter((line) => line.startsWith('text: ')),
    answer.findings.map((finding) => `text: ${finding.text}`),
    `renders-the-answer-and-nothing-else: one text line per finding, in the capture's own order, and no finding collapsed or dropped; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
  assert.equal(
    surface.text,
    surface.lines.join('\n'),
    'renders-the-answer: the text is the lines',
  );
}

/**
 * SC3/N4/E7: a code the digest lacks is named. The pane states the absence in a sentence of its own,
 * that sentence carries the code the message carried, and no line reports the absence as a count.
 */
function pinNamesTheAbsenceByCode(surface, answer) {
  const absent = answer.findings.filter(
    (finding) => finding.reason === SURFACE.NO_DIGEST_ENTRY,
  );
  assert.ok(
    absent.length > 0,
    'the fixture must carry a code the digest lacks, or this pin proves nothing',
  );
  assert.equal(
    surface.lines.filter((line) => line.startsWith('title: ')).length,
    answer.findings.filter((finding) => typeof finding.title === 'string')
      .length,
    `named-absence: a finding whose code the digest lacks carries no title, so the pane prints one title line per finding that has one — never a blank title for the code it could not join; it rendered ${JSON.stringify(surface.lines)}`,
  );
  for (const finding of absent) {
    assert.ok(
      surface.lines.includes(`code: ${finding.code}`),
      `named-absence: a code the digest lacks is rendered by name, so the pane must print ${JSON.stringify(`code: ${finding.code}`)}; it rendered ${JSON.stringify(surface.lines)}`,
    );
    assert.equal(
      typeof finding.title,
      'undefined',
      'the join carries no title for a code the digest lacks, so the pin below is not vacuous',
    );
    const stated = surface.lines.filter((line) =>
      line.startsWith(`${SURFACE.NO_DIGEST_ENTRY}: `),
    );
    const sentence = stated.find((line) => line.includes(finding.code));
    assert.ok(
      sentence,
      `named-absence: the pane must state the absence in one sentence naming the code the message carried (${finding.code}) — a count is not a name; it rendered ${JSON.stringify(stated)}`,
    );
    assert.doesNotMatch(
      sentence,
      /\b\d+\s+(code|codes|entry|entries|finding|findings)\b/i,
      `named-absence: a count is not a name — the absence must name the code the message carried and never count codes; the pane rendered ${JSON.stringify(sentence)}`,
    );
    assert.match(
      sentence,
      /NG0\d{3,}/,
      `named-absence: the absence must name the code the capture carried, never a blank; the pane rendered ${JSON.stringify(sentence)}`,
    );
  }
}

/**
 * SC3/E7: `captured-nothing` is a statement, never an empty list. The pane says a capture was read and
 * carried no diagnostic, and says nothing about the page's silence.
 */
function pinCapturedNothingStatesIt(surface) {
  assert.equal(
    surface.state,
    SURFACE.CAPTURED_NOTHING,
    `captured-nothing: the answer's own word is ${SURFACE.CAPTURED_NOTHING}; the pane reported ${surface.state}`,
  );
  assert.ok(
    surface.lines.length > 1,
    `captured-nothing: the pane renders that statement, never an empty list and never the bare word; it rendered ${JSON.stringify(surface.lines)}`,
  );
  assert.ok(
    surface.lines.some((line) =>
      line.startsWith(`${SURFACE.CAPTURED_NOTHING}: `),
    ),
    `captured-nothing: the pane states the absence in its own sentence; it rendered ${JSON.stringify(surface.lines)}`,
  );
  assert.equal(
    surface.lines.some((line) => line.startsWith('text: ')),
    false,
    `captured-nothing: a capture that carried no diagnostic has no message to print, so no text line is rendered; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
  for (const line of surface.lines) {
    assert.notEqual(
      line.trim(),
      '',
      `captured-nothing: never a blank line standing in for the statement; the pane rendered ${JSON.stringify(surface.lines)}`,
    );
    assert.doesNotMatch(
      line,
      /^[-–—]+$/,
      `captured-nothing: never a dash standing in for the statement; the pane rendered ${JSON.stringify(surface.lines)}`,
    );
  }
}

/**
 * SC3: the two absences the join distinguishes are two different panes. A capture that was read and
 * carried nothing is not a capture that was never handed over.
 */
function pinTheTwoAbsencesDiffer(nothing, none) {
  assert.equal(none.state, SURFACE.NO_DIAGNOSTICS);
  assert.notEqual(
    nothing.text,
    none.text,
    `two-absences: captured-nothing and no-diagnostics are different statements; the pane rendered ${JSON.stringify(nothing.text)} for both`,
  );
  assert.equal(
    nothing.text.includes(SURFACE.NO_DIAGNOSTICS),
    false,
    'two-absences: a capture that was read and carried nothing is never reported as a capture that was never read',
  );
  assert.equal(
    none.text.includes(SURFACE.CAPTURED_NOTHING),
    false,
    'two-absences: a capture that was never handed over is never reported as a capture that came back empty',
  );
}

/**
 * E7/N3: no cause, no element and no remedy. The capture records none of the three, the digest carries
 * no field for them, and a finding that carries them renders none of them.
 */
function pinNoCauseElementRemedy(surface, answer) {
  for (const name of ['cause', 'element', 'remedy']) {
    assert.equal(
      surface.lines.some((line) => line.startsWith(`${name}: `)),
      false,
      `no-${name}: the pane must render no ${name} — the capture records none and the answer carries none; it rendered ${JSON.stringify(surface.lines)}`,
    );
  }
  const own = surface.lines.filter((line) => !line.startsWith('text: '));
  const written = own.join('\n');
  for (const pattern of [
    /\bthe cause is\b/i,
    /\bcaused by\b/i,
    /\bbecause\b/i,
    /\bdue to\b/i,
    /\bthe fix is\b/i,
    /\bfix it\b/i,
    /\bremedy\b/i,
    /\belement\b/i,
  ]) {
    assert.equal(
      pattern.test(written),
      false,
      `no-cause-element-remedy: the pane's own lines name no ${pattern}; it rendered ${JSON.stringify(own)}`,
    );
  }
  // The fields the pane does render are still rendered: dropping the extras is a filter, not a blank.
  assert.equal(
    surface.lines.filter((line) => line.startsWith('text: ')).length,
    answer.findings.length,
    'no-unrendered-field: every finding still renders its own text beside the dropped fields',
  );
}

/**
 * E7: no unattributed wording. Every line the pane writes of its own is a labelled fact, and none of
 * them names the framework — only a captured message (a `text:` line) may, because the page wrote it.
 */
function pinNoUnattributedAngularWording(surface) {
  for (const line of surface.lines) {
    if (line.startsWith('text: ')) continue;
    assert.doesNotMatch(
      line,
      /angular/i,
      `no-unattributed-wording: the pane writes no wording of its own naming Angular; it rendered ${JSON.stringify(line)} in ${JSON.stringify(surface.lines)}`,
    );
    assert.match(
      line,
      /^[a-z][a-z-]*: /,
      `no-unattributed-wording: every line the pane writes of its own is a labelled fact — a state, a finding's field or a named absence; it rendered ${JSON.stringify(line)}`,
    );
  }
  for (const key of Object.keys(surface)) {
    assert.ok(
      ['state', 'kind', 'message', 'lines', 'text'].includes(key),
      `no-unattributed-wording: the pane answers the fields a surface answers and nothing beside them; it carried ${JSON.stringify(key)}`,
    );
  }
}

/** SC4: a state word the pane was not written for is rendered as the word it was given, and alone. */
function pinGivenState(surface, word) {
  assert.equal(surface.state, word, `given-state: got ${surface.state}`);
  assert.deepEqual(
    [...surface.lines],
    [`state: ${word}`],
    `given-state: a word the pane was not written for renders that word and nothing else; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
}

/** E7: an answer the pane was not handed renders `no-console-answer`, never an empty pane. */
function pinNoAnswerNamed(surface) {
  assert.equal(
    surface.state,
    SURFACE.NO_CONSOLE_ANSWER,
    `no-console-answer: an answer the pane was not handed renders ${SURFACE.NO_CONSOLE_ANSWER}; it rendered ${surface.state}`,
  );
  assert.deepEqual(
    [...surface.lines],
    [SURFACE.NO_ANSWER_TEXT],
    `no-console-answer: the absence is stated in a sentence of its own, never an empty pane; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
}

/** N1, N2, N3: the pane reads no clock, joins nothing, reads no digest and touches no DOM. */
function pinReadsNoDerivedValue(source) {
  const forbidden = [
    ['the digest file', 'error-digest'],
    ['the document', 'document.'],
    ['a query', 'querySelector'],
    ['a wall clock', 'Date.now('],
    ['the page clock', 'performance.now('],
    ['a fresh date', 'new Date('],
    ['markup', 'innerHTML'],
    ['a component decorator', '@Component'],
    ['a template', 'template:'],
  ];
  for (const [what, needle] of forbidden) {
    assert.equal(
      source.includes(needle),
      false,
      `reads-no-derived-value: the pane must not read ${what}; its source names ${needle}`,
    );
  }
  assert.equal(
    /^import\s/m.test(source),
    false,
    'reads-no-derived-value: the pane imports nothing at runtime, so its suite executes it',
  );
}

// -------------------------------------------------------------------------- the cases ----

describe('the fixture is the join’s, measured from the shipped digest', () => {
  it('reads the digest the record measured, and the payload shape the capture dispatches', () => {
    assert.equal(DIGEST.entries.length, RECORD.digest.entryCount);
    assert.equal(
      new Set(DIGEST.entries.map((entry) => entry.code)).size,
      RECORD.digest.uniqueCodeCount,
    );
    assert.deepEqual(RECORD.capture.payload.keys, [
      'code',
      'message',
      'component',
      'timestamp',
    ]);
    assert.equal(
      typeof shippedTitle(MATCHED.code),
      'string',
      `the shipped digest must carry a title for ${MATCHED.code}`,
    );
    console.log(
      `console fixture: ${DIGEST.entries.length} digest entries, ${MATCHED.code} "${shippedTitle(MATCHED.code)}"`,
    );
  });

  it('uses a code the capture can extract and the digest does not carry', () => {
    const regex = new RegExp(
      RECORD.capture.codeExtraction.regex.replace(/^\//, '').replace(/\/$/, ''),
    );
    assert.equal(
      regex.test(UNMATCHED.message),
      true,
      `the capture's own regex must extract ${UNMATCHED.code}`,
    );
    assert.equal(RECORD.digest.codes.includes(UNMATCHED.code), false);
    assert.equal(
      DIGEST.entries.some((entry) => entry.code === UNMATCHED.code),
      false,
      `the shipped digest must lack ${UNMATCHED.code} for the named absence to be real`,
    );
  });

  it('the join answers the three states this pane renders', () => {
    assert.equal(joinedAnswer().state, SURFACE.JOINED);
    assert.equal(capturedNothingAnswer().state, SURFACE.CAPTURED_NOTHING);
    assert.equal(noDiagnosticsAnswer().state, SURFACE.NO_DIAGNOSTICS);
    assert.equal(
      joinedAnswer().findings[1].reason,
      SURFACE.NO_DIGEST_ENTRY,
      'the unmatched code must reach the pane as the join’s own reason',
    );
  });
});

describe('the pane renders the join’s state and findings (SC3, SC4, E7)', () => {
  it('AC1: the state and every finding, field for field, and nothing else', () => {
    const answer = joinedAnswer();
    const surface = SURFACE.consolePanel(answer);

    pinRendersTheAnswerAndNothingElse(surface, answer);
    pinNoCauseElementRemedy(surface, answer);
    pinNoUnattributedAngularWording(surface);
    pinNamesTheAbsenceByCode(surface, answer);
    assert.deepEqual(
      [...surface.lines],
      [
        `state: ${SURFACE.JOINED}`,
        SURFACE.STATE_TEXTS[SURFACE.JOINED],
        `code: ${MATCHED.code}`,
        `title: ${shippedTitle(MATCHED.code)}`,
        `text: ${MATCHED.message}`,
        `code: ${UNMATCHED.code}`,
        SURFACE.noDigestEntryText(UNMATCHED.code),
        `text: ${UNMATCHED.message}`,
        SURFACE.NO_CODE_TEXT,
        `text: ${UNCODED.message} (this message carried no code)`,
      ],
      'the pane renders the state, then one block per finding in capture order, and nothing beside them',
    );
    console.log(`console pane: ${JSON.stringify(surface.lines)}`);
  });

  it('AC1: captured-nothing is that statement, never an empty list', () => {
    const answer = capturedNothingAnswer();
    const surface = SURFACE.consolePanel(answer);
    pinCapturedNothingStatesIt(surface);
    pinNoUnattributedAngularWording(surface);
    pinRendersTheAnswerAndNothingElse(surface, answer);
  });

  it('AC1: the two absences are two statements, and neither is an empty pane', () => {
    const nothing = SURFACE.consolePanel(capturedNothingAnswer());
    const none = SURFACE.consolePanel(noDiagnosticsAnswer());
    pinTheTwoAbsencesDiffer(nothing, none);
    assert.equal(none.lines.length, 2);
    assert.equal(none.lines[1], SURFACE.STATE_TEXTS[SURFACE.NO_DIAGNOSTICS]);
  });

  it('AC2: a code the digest lacks renders by name, and a count instead reddens', () => {
    const answer = joinedAnswer();
    const surface = SURFACE.consolePanel(answer);
    pinNamesTheAbsenceByCode(surface, answer);

    // The control for the counting mutant below: the pane's own sentence names the code and states
    // no number of codes at all.
    const absence = surface.lines.find((line) =>
      line.startsWith(`${SURFACE.NO_DIGEST_ENTRY}: `),
    );
    assert.ok(absence.includes(UNMATCHED.code));
    assert.equal(
      /\b\d+\s+(code|codes|entry|entries)\b/i.test(absence),
      false,
      'the absence names the code and counts nothing',
    );
  });

  it('AC2: a finding with no code renders its absence by name, never a blank', () => {
    const answer = joinedAnswer();
    const surface = SURFACE.consolePanel(answer);
    const bare = answer.findings.find(
      (finding) => typeof finding.code !== 'string',
    );
    assert.ok(bare, 'the fixture must carry a message with no code');
    assert.ok(
      surface.lines.includes(SURFACE.NO_CODE_TEXT),
      `no-code: the pane states that the message carried no code; it rendered ${JSON.stringify(surface.lines)}`,
    );
    assert.ok(
      surface.lines.includes(`text: ${bare.text}`),
      'no-code: the finding’s own text still renders, so the absence is reported beside it',
    );
    assert.equal(
      surface.lines.includes('code: undefined'),
      false,
      'no-code: no invented code is rendered for a message that carried none',
    );
  });

  it('E7: a finding carrying a cause, an element, a remedy or a count renders none of them', () => {
    const answer = fattenedAnswer();
    const surface = SURFACE.consolePanel(answer);
    pinNoCauseElementRemedy(surface, answer);
    pinNoUnattributedAngularWording(surface);
    for (const value of [
      'the navigation the page cancelled',
      '<app-root class="shell">',
      'add a check before the write',
      'AppComponent',
    ]) {
      assert.equal(
        surface.text.includes(value),
        false,
        `E7: the pane must not render ${JSON.stringify(value)}; it rendered ${surface.text}`,
      );
    }
    assert.equal(
      surface.lines.some((line) => line.startsWith('component: ')),
      false,
      'E7: the capture’s component field is never rendered as an element reference',
    );
    assert.equal(
      surface.lines.some((line) => line.startsWith('count: ')),
      false,
      'E7: a count a finding carries is never rendered beside the absence it states',
    );
  });

  it('E7: two diagnostics sharing a code are two findings, in capture order', () => {
    const answer = clone(
      JOIN.consoleJoin(
        [MATCHED, { ...MATCHED, message: 'NG0100: second report' }],
        DIGEST,
      ),
    );
    const surface = SURFACE.consolePanel(answer);
    pinRendersTheAnswerAndNothingElse(surface, answer);
    assert.equal(
      surface.lines.filter((line) => line === `code: ${MATCHED.code}`).length,
      2,
      'a shared code is not a duplicate to collapse: two findings render two code lines',
    );
    assert.equal(
      surface.lines.filter((line) => line.startsWith('text: ')).length,
      2,
    );
  });

  it('E7: a page the pane has no answer for renders no-console-answer', () => {
    for (const input of [
      undefined,
      null,
      {},
      [],
      'console',
      7,
      { state: '' },
    ]) {
      pinNoAnswerNamed(SURFACE.consolePanel(input));
    }
    // A capture is not an answer: handed the diagnostics the join reads, the pane answers
    // `no-console-answer` rather than joining them itself.
    pinNoAnswerNamed(SURFACE.consolePanel([MATCHED]));
  });

  it('E7: a joined answer with no finding states that absence, never an empty list', () => {
    const surface = SURFACE.consolePanel({
      state: SURFACE.JOINED,
      findings: [],
    });
    assert.deepEqual(
      [...surface.lines],
      [
        `state: ${SURFACE.JOINED}`,
        SURFACE.STATE_TEXTS[SURFACE.JOINED],
        SURFACE.NO_FINDING_TEXT,
      ],
      `no-finding: a joined answer that carried no finding states so; the pane rendered ${JSON.stringify(surface.lines)}`,
    );
  });

  it('AC2: a state word the pane was not written for renders that word and nothing else', () => {
    pinGivenState(
      SURFACE.consolePanel({
        state: 'wedged',
        findings: [
          {
            text: 'x',
            code: 'NG0100',
            title: shippedTitle(MATCHED.code),
          },
        ],
      }),
      'wedged',
    );
    pinGivenState(
      SURFACE.consolePanel({ state: 'not-yet-named' }),
      'not-yet-named',
    );
  });

  it('AC5: the pane derives nothing — no clock, no digest, no join, no DOM, no markup', () => {
    pinReadsNoDerivedValue(SURFACE_SRC);
  });

  it('the same answer rendered twice is byte-identical', () => {
    const answer = joinedAnswer();
    const once = SURFACE.consolePanel(answer);
    const twice = SURFACE.consolePanel(answer);
    assert.equal(once.text, twice.text);
    assert.deepEqual([...once.lines], [...twice.lines]);
  });
});

// ---------------------------------------------------------------- the mutants ----

/**
 * The six defects E7 names, each one anchored edit of the pane's own source. `exhibits` asserts the
 * mutated copy really carries the defect, so a mutation that fails to reproduce it is a failure
 * rather than a green mutant.
 */
const MUTATIONS = [
  {
    id: 'absence-as-count',
    defect: 'named-absence',
    anchor: [
      '  else if (code !== null && reason === NO_DIGEST_ENTRY)',
      '    lines.push(noDigestEntryText(code));',
    ].join('\n'),
    replacement: [
      '  else if (code !== null && reason === NO_DIGEST_ENTRY)',
      "    lines.push('no-digest-entry: 1 code the digest does not carry');",
    ].join('\n'),
    check: (api) => {
      const answer = joinedAnswer();
      return () => pinNamesTheAbsenceByCode(api.consolePanel(answer), answer);
    },
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(joinedAnswer())
          .text.includes('1 code the digest does not carry'),
        'the mutant really renders a count where the code belongs',
      ),
    names: /a count is not a name/,
  },
  {
    id: 'captured-nothing-as-empty-list',
    defect: 'captured-nothing',
    anchor: '  if (state !== JOINED) return surface(state, lines);',
    replacement: '  if (state !== JOINED) return surface(state, []);',
    check: (api) => {
      return () =>
        pinCapturedNothingStatesIt(api.consolePanel(capturedNothingAnswer()));
    },
    exhibits: (module) =>
      assert.deepEqual(
        module.consolePanel(capturedNothingAnswer()).lines,
        [],
        'the mutant really renders an empty list for captured-nothing',
      ),
    names: /never an empty list/,
  },
  {
    id: 'cause-added',
    defect: 'no-cause',
    anchor: '  const sentence = STATE_TEXTS[state];',
    replacement: [
      '  const sentence = STATE_TEXTS[state];',
      "  lines.push('cause: the console.error call the page made');",
    ].join('\n'),
    check: (api) => {
      const answer = joinedAnswer();
      return () => pinNoCauseElementRemedy(api.consolePanel(answer), answer);
    },
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(joinedAnswer())
          .text.includes('cause: the console.error call'),
        'the mutant really names a cause',
      ),
    names: /must render no cause/,
  },
  {
    id: 'element-added',
    defect: 'no-element',
    anchor: '  lines.push(`text: ${text}`);',
    replacement: [
      "  lines.push(`element: ${String(raw['component'] ?? 'none')}`);",
      '  lines.push(`text: ${text}`);',
    ].join('\n'),
    check: (api) => {
      const answer = joinedAnswer();
      return () => pinNoCauseElementRemedy(api.consolePanel(answer), answer);
    },
    exhibits: (module) =>
      assert.ok(
        module.consolePanel(joinedAnswer()).text.includes('element: '),
        'the mutant really renders an element reference',
      ),
    names: /must render no element/,
  },
  {
    id: 'remedy-added',
    defect: 'no-remedy',
    anchor: '  if (findings.length === 0) {',
    replacement: [
      "  lines.push('remedy: read the digest entry and fix the check');",
      '  if (findings.length === 0) {',
    ].join('\n'),
    check: (api) => {
      const answer = joinedAnswer();
      return () => pinNoCauseElementRemedy(api.consolePanel(answer), answer);
    },
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(joinedAnswer())
          .text.includes('remedy: read the digest entry'),
        'the mutant really states a remedy',
      ),
    names: /must render no remedy/,
  },
  {
    id: 'unattributed-wording',
    defect: 'no-unattributed-wording',
    anchor: '  const lines: string[] = [`state: ${state}`];',
    replacement: [
      '  const lines: string[] = [`state: ${state}`];',
      "  lines.push('angular: the framework reported this');",
    ].join('\n'),
    check: (api) => {
      return () =>
        pinNoUnattributedAngularWording(api.consolePanel(joinedAnswer()));
    },
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(joinedAnswer())
          .text.includes('angular: the framework reported this'),
        'the mutant really adds wording of its own naming Angular',
      ),
    names: /naming Angular/,
  },
];

describe('panel-console mutants', () => {
  for (const mutation of MUTATIONS) {
    it(`${mutation.id} reddens naming "${mutation.defect}"`, async () => {
      // The pin is green on the shipped pane first, so the failure below is the mutation's.
      mutation.check(SURFACE)();
      const mutant = await loadMutant(mutation.anchor, mutation.replacement);
      mutation.exhibits(mutant.module);
      const failure = reddens(mutation.defect, mutation.check(mutant.module));
      assert.match(failure.message, mutation.names);
    });
  }

  it('applies every mutation to a source that really changed', () => {
    for (const mutation of MUTATIONS) {
      assert.equal(
        SURFACE_SRC.split(mutation.anchor).length - 1,
        1,
        `mutation anchor must occur exactly once: ${JSON.stringify(mutation.anchor)}`,
      );
      assert.notEqual(
        SURFACE_SRC.replace(mutation.anchor, mutation.replacement),
        SURFACE_SRC,
        `mutation ${mutation.id} must change the pane`,
      );
    }
  });
});
