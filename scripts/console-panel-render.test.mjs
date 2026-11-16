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
// unattributed word about the framework, an empty list standing in for `captured-nothing`, a claim
// that the page was silent, or a count standing in for a code the digest lacks. Each of those defects
// is armed as a mutation of the pane's own source and shown to redden the pin that names it — a
// mutant that survives its pin, or reddens with a message that does not name the defect, fails this
// suite.
//
// The prohibitions are rules about what the pane writes itself, and not about the words it is handed.
// A `title:` value is the digest's word, a `text:` value the capture's, and `code:` and `reason:` are
// the answer's, so none of the four is this pane's attribution: a pane that renders the digest's own
// title for `NG0910` — "Unsafe bindings on an element" — and a captured message saying "because" must
// pass, and that is asserted here rather than assumed.
//
// The E7 prohibitions are a rule and not a snapshot of the `joined` surface: `pinE7OnEveryState` runs
// them on `joined`, `captured-nothing`, `no-diagnostics` and a state word the pane was not written
// for, so a cause, an element, a remedy or an unattributed word about the framework added to any one
// of those surfaces reddens a pin that names both the state and the phrase. The absence rule reaches
// every state as well, and it is a property of the sentence rather than a list of silence phrases: a
// pane-written sentence may say what was read and what that means for the panel, and may never assert
// what the page did. Its clauses take as their subject a thing the pane read, and the page may be
// named only inside a denial — so "the page emitted no diagnostic at all" reddens where "never that
// the page was silent" passes, in whatever words the claim is written. The rule itself is stated once,
// in `research/raw/m045-console-panel.json`'s contract, and read here and in the record suite; the
// matcher that reads a sentence with it is duplicated and pinned byte-identical in both. The no-code
// absence may never become a count, and the state sentence is looked up as an own property, so a word
// such as `constructor` renders itself and not a function's source.
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
/**
 * The console panel's own record, whose contract states the absence-statement rule. It is read here
 * rather than restated, so the surface suite and the recording suite hold the pane to one rule.
 */
const PANEL_RECORD_REL = 'research/raw/m045-console-panel.json';
const PANEL_RECORD = JSON.parse(
  readFileSync(new URL(`../${PANEL_RECORD_REL}`, import.meta.url), 'utf8'),
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
 * The four fields a finding carries, whose values are the answer's words and not this pane's: the
 * capture's `text` and `code`, the digest's `title`, the join's `reason`. The pane writes the label
 * and prints the value, and only the value is somebody else's — so a line labelled with one of these
 * four is exempt from the prohibitions below, while every other line is the pane's own sentence.
 */
const CARRIED_FIELDS = ['code', 'title', 'text', 'reason'];

/** The lines the pane writes itself on one surface: every line but a finding's four fields. */
function paneWrittenLines(surface, carried = CARRIED_FIELDS) {
  return surface.lines.filter(
    (line) => !carried.includes(line.slice(0, line.indexOf(': '))),
  );
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
 * E7/N3: no cause, no element and no remedy, on whichever state the surface renders. The capture
 * records none of the three, the digest carries no field for them, and a finding that carries them
 * renders none of them — so an absence sentence that gained an "because …" clause, a `remedy:` line
 * or an element reference reddens here with the state word and the offending phrase both named.
 *
 * Only the pane's own lines are read. A `title:` value is the digest's word and a `text:` value the
 * capture's, and the digest's own title for `NG0910` states "element", so policing those two would
 * refuse a correct pane for rendering exactly what the join handed it.
 *
 * @param surface the pane's rendering of one state
 * @param answer the join's answer behind it, where the surface has one; the finding count is held to
 *   it, because dropping the extras is a filter and not a blank
 * @param carried the labels whose values are the answer's words, so the exemption itself can be armed:
 *   called with none, the same correct pane reddens on the digest's own title
 */
function pinNoCauseElementRemedy(surface, answer, carried = CARRIED_FIELDS) {
  const state = surface.state;
  for (const name of ['cause', 'element', 'remedy']) {
    assert.equal(
      surface.lines.some((line) => line.startsWith(`${name}: `)),
      false,
      `no-${name}: the ${state} surface must render no ${name} — the capture records none and the answer carries none; it rendered ${JSON.stringify(surface.lines)}`,
    );
  }
  const own = paneWrittenLines(surface, carried);
  const written = own.join('\n');
  for (const [defect, pattern] of [
    ['cause', /\bthe cause is\b/i],
    ['cause', /\bcaused by\b/i],
    ['cause', /\bbecause\b/i],
    ['cause', /\bdue to\b/i],
    ['remedy', /\bthe fix is\b/i],
    ['remedy', /\bfix it\b/i],
    ['remedy', /\bfix\b/i],
    ['remedy', /\bremedy\b/i],
    ['element', /\belement\b/i],
  ]) {
    assert.equal(
      pattern.test(written),
      false,
      `no-cause-element-remedy: the ${state} surface must render no ${defect} — none of its own lines names one; it rendered ${JSON.stringify(own)} (matched ${pattern})`,
    );
  }
  // The fields the pane does render are still rendered: dropping the extras is a filter, not a blank.
  if (answer !== undefined) {
    assert.equal(
      surface.lines.filter((line) => line.startsWith('text: ')).length,
      answer.findings.length,
      `no-unrendered-field: every finding on the ${state} surface still renders its own text beside the dropped fields`,
    );
  }
}

/**
 * E7: no unattributed wording, on whichever state the surface renders. Every line the pane renders is
 * a labelled fact, and none of the sentences it writes of its own names the framework — only a finding
 * field may: a captured message (a `text:` line) and the digest's title (a `title:` line) are the
 * answer's words, and the page and the digest may name Angular where the pane may not.
 */
function pinNoUnattributedAngularWording(surface) {
  const state = surface.state;
  for (const line of surface.lines) {
    assert.match(
      line,
      /^[a-z][a-z-]*: /,
      `no-unattributed-wording: every line the ${state} surface renders is a labelled fact — a state, a finding's field or a named absence; it rendered ${JSON.stringify(line)}`,
    );
  }
  for (const line of paneWrittenLines(surface)) {
    assert.doesNotMatch(
      line,
      /angular/i,
      `no-unattributed-wording: the ${state} surface writes no wording of its own naming Angular; it rendered ${JSON.stringify(line)} in ${JSON.stringify(surface.lines)}`,
    );
  }
  for (const key of Object.keys(surface)) {
    assert.ok(
      ['state', 'kind', 'message', 'lines', 'text'].includes(key),
      `no-unattributed-wording: the ${state} surface answers the fields a surface answers and nothing beside them; it carried ${JSON.stringify(key)}`,
    );
  }
}

/**
 * E7 on every state the pane renders: `joined`, `captured-nothing`, `no-diagnostics` and a word the
 * pane was not written for. The rules that make E7 a rule rather than a snapshot of today's wording
 * are run on each of the four surfaces, so a cause, an element reference, a remedy, a word of the
 * pane's own about the framework or a claim that the page was silent, added to *any* of them, reddens
 * naming that state.
 */
function pinE7OnEveryState(api) {
  for (const [word, answer] of [
    [SURFACE.JOINED, joinedAnswer()],
    [SURFACE.CAPTURED_NOTHING, capturedNothingAnswer()],
    [SURFACE.NO_DIAGNOSTICS, noDiagnosticsAnswer()],
    ['wedged', undefined],
  ]) {
    const surface = api.consolePanel(answer ?? { state: word });
    assert.equal(
      surface.state,
      word,
      `every-state: the ${word} surface must report the word it was given; it reported ${surface.state}`,
    );
    pinNoCauseElementRemedy(surface, answer);
    pinNoUnattributedAngularWording(surface);
    pinNoAbsenceClaimsSilence(surface);
  }
}

// >>> absence-statement-matcher
//
// The matcher for the rule the record states (`contract.absenceStatement`). The rule itself — what
// an absence sentence may take as its subject, which actions are the read's and the pane's, which
// words name the page — is data in `research/raw/m045-console-panel.json`, so this block is only the
// syntax that reads a sentence with it. It is copied verbatim into the other suite and the two copies
// are pinned equal, so the property cannot drift between the surface and the recording.

/** Where a sentence's clauses end: punctuation, and the subordinators this pane writes with. */
const ABSENCE_CLAUSE_SPLIT =
  /\s*[,;:]\s*|\s+(?:so|but|and|then|because|yet|while)\s+/i;

/** The conjunction a clause may open with, which is not part of its subject. */
const ABSENCE_CLAUSE_LEAD = /^(?:and|but|so|then|also|yet|or|while)\s+/i;

/** The words that may precede a clause's subject without being it: determiners, and its adjectives. */
const ABSENCE_PREMODIFIERS = new Set([
  'the',
  'a',
  'an',
  'its',
  'their',
  'our',
  'my',
  'your',
  'his',
  'her',
  'every',
  'each',
  'all',
  'no',
  'any',
  'some',
  'both',
  'either',
  'neither',
  'one',
  'two',
  'three',
  'first',
  'second',
  'last',
  'next',
  'own',
  'whole',
  'single',
  'other',
  'same',
  'above',
  'below',
  'remaining',
  'captured',
  'carried',
  'handed',
  'joined',
  'recorded',
  'printed',
  'rendered',
  'named',
  'stated',
  'read',
  'held',
  'listed',
  'digest',
  'join',
  'console',
  'unreadable',
  'new',
  'old',
  'full',
  'empty',
  'given',
  'only',
  'very',
]);

/** The copulas and auxiliaries: where one governs a participle, the participle is the clause's verb. */
const ABSENCE_AUXILIARIES = new Set([
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'has',
  'have',
  'had',
  'does',
  'do',
  'did',
]);

/** The negations an auxiliary may take before the participle it governs. */
const ABSENCE_NEGATIONS = new Set(['not', 'never', 'no', 'nor']);

/** The word endings that mark a verb this rule does not otherwise know: it is read, and refused. */
const ABSENCE_VERB_ENDINGS = /(?:ed|en|ing)$/;

/** The rule read as sets, so one sentence is read in one pass. */
function absenceSets(rule) {
  return {
    readSubjects: new Set(rule.readSubjects),
    readActions: new Set(rule.readActions),
    paneActions: new Set(rule.paneActions),
    placeholders: new Set(rule.placeholders),
    pageWords: new Set(rule.pageWords),
    denials: new Set(rule.denials),
  };
}

/** The sentence a pane-written line states, with its `label: ` taken off. */
function absenceBody(line) {
  const at = line.indexOf(': ');
  return at < 0 ? line : line.slice(at + 2);
}

/** The clauses one sentence states, each stripped of its closing punctuation and opening conjunction. */
function absenceClauses(sentence) {
  return String(sentence)
    .split(ABSENCE_CLAUSE_SPLIT)
    .map((clause) =>
      clause
        .replace(ABSENCE_CLAUSE_LEAD, '')
        .replace(/[.!?]+$/, '')
        .trim(),
    )
    .filter((clause) => clause !== '');
}

/** A clause's words, lowercased, with the punctuation dropped. */
function absenceTokens(clause) {
  return clause.toLowerCase().match(/[a-z0-9']+/g) ?? [];
}

/**
 * The subject a clause states: the head of the noun phrase it opens with, or `null` where the clause
 * elides its subject and inherits the clause before it.
 */
function absenceSubject(tokens, sets) {
  let index = 0;
  while (index < tokens.length && ABSENCE_PREMODIFIERS.has(tokens[index]))
    index += 1;
  const head = tokens[index];
  if (head === undefined) return null;
  if (ABSENCE_AUXILIARIES.has(head)) return null;
  if (sets.readActions.has(head)) return null;
  // An indeterminate is a subject even where it ends like a participle: `nothing` ends in `ing`.
  if (sets.placeholders.has(head)) return head;
  if (ABSENCE_VERB_ENDINGS.test(head) && !sets.readSubjects.has(head))
    return null;
  return head;
}

/**
 * The verb a clause states, or `null` where it states none: a noun list, or a copula linking a noun
 * or an adjective. Where an auxiliary governs a participle, the participle is the verb, so
 * `no diagnostic was emitted` states "emitted" and is refused while `no capture was read` states
 * "read" and passes.
 */
function absenceVerb(tokens, sets) {
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (ABSENCE_AUXILIARIES.has(token)) {
      let next = index + 1;
      while (next < tokens.length && ABSENCE_NEGATIONS.has(tokens[next]))
        next += 1;
      const governed = tokens[next];
      if (governed === undefined) return null;
      if (sets.readActions.has(governed)) return governed;
      if (sets.readSubjects.has(governed)) return null;
      if (sets.placeholders.has(governed)) return null;
      if (ABSENCE_VERB_ENDINGS.test(governed)) return governed;
      return null;
    }
    if (sets.readActions.has(token)) return token;
    if (
      ABSENCE_VERB_ENDINGS.test(token) &&
      !sets.readSubjects.has(token) &&
      !sets.placeholders.has(token)
    )
      return token;
  }
  return null;
}

/**
 * Every clause of one sentence that breaks the property, with what broke it: `page` where the page is
 * named outside a denial, `placeholder` where an indeterminate stands where the page would be and the
 * clause states no act of the pane's own, `subject` where a clause takes as its subject something the
 * pane did not read, `verb` where it asserts an action the read and the pane do not perform.
 */
function absenceBreaches(sentence, rule) {
  const sets = absenceSets(rule);
  const breaches = [];
  for (const clause of absenceClauses(sentence)) {
    const tokens = absenceTokens(clause);
    if (tokens.length === 0) continue;
    // A clause a denial introduces is the pane saying what it did *not* find — the one place the
    // shipped `captured-nothing` sentence, and any sentence like it, may name the page.
    if (sets.denials.has(tokens[0])) continue;
    const pageAt = tokens.findIndex((token) => sets.pageWords.has(token));
    if (pageAt >= 0) {
      // A denial before the page word governs it — `never that the page was silent`, `this is never
      // a claim that the page emitted nothing` — and is how the pane names the page at all. A page
      // word its clause does not deny is a claim about the page, whichever verb it carries.
      const denied = tokens
        .slice(0, pageAt)
        .some((token) => sets.denials.has(token));
      if (!denied) breaches.push({ clause, page: tokens[pageAt] });
      continue;
    }
    const subject = absenceSubject(tokens, sets);
    if (subject !== null && sets.placeholders.has(subject)) {
      if (!tokens.some((token) => sets.paneActions.has(token))) {
        breaches.push({ clause, placeholder: subject });
      }
      continue;
    }
    if (subject !== null && !sets.readSubjects.has(subject)) {
      breaches.push({ clause, subject });
      continue;
    }
    const verb = absenceVerb(tokens, sets);
    if (verb !== null && !sets.readActions.has(verb)) {
      breaches.push({ clause, verb });
    }
  }
  return breaches;
}

/** What one breach broke, in the words its pin fails with. */
function absenceBreachReason(breach) {
  if (breach.page !== undefined)
    return `it names the page (${JSON.stringify(breach.page)}) outside a denial`;
  if (breach.placeholder !== undefined)
    return `its clause ${JSON.stringify(breach.clause)} leaves the indeterminate ${JSON.stringify(breach.placeholder)} standing where the page would be, and states no act of the pane's own`;
  if (breach.subject !== undefined)
    return `its clause ${JSON.stringify(breach.clause)} takes ${JSON.stringify(breach.subject)} as its subject, and the pane reads no such thing`;
  return `its clause ${JSON.stringify(breach.clause)} asserts ${JSON.stringify(breach.verb)}, which the read and the pane do not do`;
}

/**
 * The property as a pin: an absence statement may say what was read and what that means for the
 * panel, and may never assert what the page did. The failure names the surface (or the sentence) it
 * was written in and the phrase that broke the rule.
 */
function assertAbsenceStatement(sentence, where, rule) {
  const [breach] = absenceBreaches(sentence, rule);
  if (breach === undefined) return;
  assert.fail(
    `absence-statement: the ${where} says what was read and what it means for the panel, and never what the page did — ${absenceBreachReason(breach)}; it rendered ${JSON.stringify(sentence)} (claimed ${JSON.stringify(breach.clause)})`,
  );
}

/**
 * The matcher block as one file states it, for the pin that holds the two copies equal. The markers
 * are found at the start of a line, because this function names them in its own source.
 */
function absenceMatcherSource(source) {
  const open = source.indexOf('\n// >>> absence-statement-matcher');
  const close = source.indexOf('\n// <<< absence-statement-matcher');
  assert.ok(
    open >= 0 && close > open,
    'the absence-statement matcher must sit between its two markers, or the drift pin proves nothing',
  );
  return source.slice(open + 1, close + 1);
}
// <<< absence-statement-matcher

/**
 * The absence-statement rule, stated once in the record's own contract and read here as well as in
 * `scripts/console-panel-record.test.mjs`: `research/raw/m045-console-panel.json` is the artefact that
 * says what an absence sentence may state, so neither suite can hold the pane to a rule the record
 * does not carry.
 */
function absenceRule() {
  const rule = PANEL_RECORD?.contract?.absenceStatement;
  assert.ok(
    rule !== null && typeof rule === 'object',
    `${PANEL_RECORD_REL} must state the absence-statement rule the pane's sentences are held to; its contract carries ${JSON.stringify(rule)}`,
  );
  for (const key of [
    'rule',
    'readSubjects',
    'readActions',
    'paneActions',
    'placeholders',
    'pageWords',
    'denials',
  ]) {
    assert.ok(
      Object.hasOwn(rule, key),
      `${PANEL_RECORD_REL} must state the absence-statement rule's ${JSON.stringify(key)}, or the rule is incomplete`,
    );
  }
  return rule;
}

/**
 * SC4/E7: no sentence the pane writes on this surface asserts what the page did. The rule is the
 * record's, not a list of wordings: each clause takes as its subject a thing the pane read, and the
 * page may be named only inside a denial. The state line is the answer's own word and a finding's
 * four fields are the answer's words, so neither is policed here.
 */
function pinNoAbsenceClaimsSilence(surface) {
  const rule = absenceRule();
  for (const line of paneWrittenLines(surface)) {
    if (line.startsWith('state: ')) continue;
    assertAbsenceStatement(absenceBody(line), `${surface.state} surface`, rule);
  }
}

/**
 * SC4/E7: the same rule at the source, so it covers the sentences a given answer does not render.
 * Every sentence the module states for a state or an absence is read, naming the state or the
 * absence it belongs to.
 */
function pinNoModuleSentenceClaimsSilence(api) {
  const rule = absenceRule();
  for (const [name, sentence] of [
    [api.JOINED, api.STATE_TEXTS[api.JOINED]],
    [api.CAPTURED_NOTHING, api.STATE_TEXTS[api.CAPTURED_NOTHING]],
    [api.NO_DIAGNOSTICS, api.STATE_TEXTS[api.NO_DIAGNOSTICS]],
    [api.NO_CONSOLE_ANSWER, api.NO_ANSWER_TEXT],
    [api.NO_FINDING, api.NO_FINDING_TEXT],
    [api.NO_CODE, api.NO_CODE_TEXT],
    [api.NO_TITLE, api.NO_TITLE_TEXT],
    [api.UNREADABLE_FINDING, api.UNREADABLE_FINDING_TEXT],
    [api.NO_DIGEST_ENTRY, api.noDigestEntryText('NG04002')],
  ]) {
    assert.equal(
      typeof sentence,
      'string',
      `absence-statement: the pane must state a sentence for ${JSON.stringify(name)}, or this pin proves nothing`,
    );
    assertAbsenceStatement(absenceBody(sentence), `${name} sentence`, rule);
  }
}

/**
 * SC4/E7: `captured-nothing` states what was read. The sentence it renders is read whole, so a pane
 * that kept the `captured-nothing: ` prefix while changing the claim — to "the page was silent", or
 * to nothing at all — reddens here rather than passing on its prefix.
 */
function pinCapturedNothingNeverClaimsSilence(surface) {
  const prefix = `${SURFACE.CAPTURED_NOTHING}: `;
  const sentence = surface.lines.find((line) => line.startsWith(prefix));
  assert.ok(
    sentence,
    `absence-statement: the ${SURFACE.CAPTURED_NOTHING} surface states its absence in a sentence of its own; it rendered ${JSON.stringify(surface.lines)}`,
  );
  const body = sentence.slice(prefix.length);
  assertAbsenceStatement(
    body,
    `${SURFACE.CAPTURED_NOTHING} surface`,
    absenceRule(),
  );
  assert.ok(
    /\bread\b/i.test(body),
    `says what was read: the sentence says what was read — the check reads the sentence and not only its prefix; it rendered ${JSON.stringify(sentence)}`,
  );
}

/**
 * SC3/N4: the second absence is named too, and in a sentence of its own. A finding whose message
 * carried no code states that absence by name — never a blank, a dash or a count — and the guard
 * that forbids a count reaches this sentence as well as the digest-miss one.
 */
function pinNoCodeAbsenceIsNamed(surface, answer) {
  const bare = answer.findings.filter(
    (finding) => typeof finding.code !== 'string',
  );
  assert.ok(
    bare.length > 0,
    'the fixture must carry a message with no code, or this pin proves nothing',
  );
  const prefix = `${SURFACE.NO_CODE}: `;
  const sentence = surface.lines.find((line) => line.startsWith(prefix));
  assert.ok(
    sentence,
    `no-code: a message that carried no code is named in a sentence of its own, never a blank and never a count; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
  assert.doesNotMatch(
    sentence,
    /\d/,
    `no-code: a count is not a name — the sentence states that the capture's message carried no code, never how many did; the pane rendered ${JSON.stringify(sentence)}`,
  );
  assert.match(
    sentence.slice(prefix.length),
    /\bno code\b/i,
    `no-code: the sentence must say the message carried no code, and state the absence in words rather than as a blank; the pane rendered ${JSON.stringify(sentence)}`,
  );
}

/**
 * SC4: a state word the pane was not written for is rendered as the word it was given, and alone.
 * The state sentence is looked up as an own property, so the words that collide with an
 * `Object.prototype` key are such words: they render themselves and nothing else.
 */
function pinGivenState(surface, word) {
  assert.equal(surface.state, word, `given-state: got ${surface.state}`);
  assert.deepEqual(
    [...surface.lines],
    [`state: ${word}`],
    `given-state: a word the pane was not written for — ${JSON.stringify(word)} — renders that word and nothing else, because the state sentence is looked up as an own property; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
}

/** Every word the pane was not written for this pin tries, the prototype keys among them. */
const GIVEN_WORDS = [
  'wedged',
  'not-yet-named',
  'constructor',
  'toString',
  'hasOwnProperty',
  '__proto__',
];

/** SC4/E7: the given words, one surface each, rendered as the word and nothing else. */
function pinGivenStates(api) {
  for (const word of GIVEN_WORDS) {
    pinGivenState(api.consolePanel({ state: word }), word);
  }
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

  it('AC1: captured-nothing is that statement, never an empty list, and never a claim of silence', () => {
    const answer = capturedNothingAnswer();
    const surface = SURFACE.consolePanel(answer);
    pinCapturedNothingStatesIt(surface);
    pinCapturedNothingNeverClaimsSilence(surface);
    // The sentence is pinned where it lives as well as where it renders: the module's own text for
    // the state is read whole and states what was read, so a pane that kept the prefix while changing
    // the sentence cannot pass on the prefix alone.
    assertAbsenceStatement(
      absenceBody(SURFACE.STATE_TEXTS[SURFACE.CAPTURED_NOTHING]),
      `${SURFACE.CAPTURED_NOTHING} sentence`,
      absenceRule(),
    );
    pinNoCauseElementRemedy(surface, answer);
    pinNoUnattributedAngularWording(surface);
    pinRendersTheAnswerAndNothingElse(surface, answer);
  });

  it('E7/SC4: every state the pane renders carries no cause, element, remedy or unattributed wording, and the two absences stay two statements', () => {
    const nothing = SURFACE.consolePanel(capturedNothingAnswer());
    const none = SURFACE.consolePanel(noDiagnosticsAnswer());
    pinTheTwoAbsencesDiffer(nothing, none);
    assert.equal(none.lines.length, 2);
    assert.equal(none.lines[1], SURFACE.STATE_TEXTS[SURFACE.NO_DIAGNOSTICS]);
    // The rule, not a snapshot of one state: joined, captured-nothing, no-diagnostics and a word the
    // pane was not written for are each held to E7, so a cause, an element, a remedy, a word of the
    // pane's own about the framework or a claim about what the page did, added to any one of them,
    // reddens naming that state.
    pinE7OnEveryState(SURFACE);
    // The absence rule at the source as well as at the surface: every sentence the module states for a
    // state or a named absence is read, so a claim in `no-diagnostics` or in the no-code sentence
    // reddens naming the sentence it was written in.
    pinNoModuleSentenceClaimsSilence(SURFACE);
    // And the rule itself, proved as a property rather than as the phrase list it replaced: every
    // shipped sentence passes, the wordings that list never matched redden naming the sentence and
    // the phrase, and the matcher here is the record suite's, so the two cannot drift.
    pinShippedAbsenceSentencesPass();
    pinThePhraseListMissedNothing();
    pinAbsenceRuleIsTheRecords();
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
    // The same prohibition the digest miss is held to, on the other absence: a count is not a name.
    pinNoCodeAbsenceIsNamed(surface, answer);
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

    // The other half of the same rule: a pane that renders the words the answer carried is correct,
    // and must not be refused. NG0910's digest title states "element" and this captured message says
    // "because" — the title is the digest's word and the text is the capture's, so the prohibitions
    // above read only the pane's own lines and both of these render untouched.
    const carried = clone(
      JOIN.consoleJoin(
        [
          {
            code: 'NG0910',
            message:
              'NG0910: unsanitized HTML was stripped because the binding bypassed the sanitizer',
            component: null,
            timestamp: 4,
          },
        ],
        DIGEST,
      ),
    );
    const titled = SURFACE.consolePanel(carried);
    const title = shippedTitle('NG0910');
    assert.match(
      String(title),
      /\belement\b/i,
      `the shipped digest's own title for NG0910 must state a prohibited word (${JSON.stringify(title)}), or this pin proves nothing`,
    );
    assert.ok(
      titled.lines.includes(`title: ${title}`),
      `E7: the digest's own title for NG0910 renders verbatim: ${JSON.stringify(`title: ${title}`)}; the pane rendered ${JSON.stringify(titled.lines)}`,
    );
    assert.ok(
      titled.lines.some(
        (line) => line.startsWith('text: ') && /\bbecause\b/i.test(line),
      ),
      `E7: a captured message saying "because" renders verbatim; the pane rendered ${JSON.stringify(titled.lines)}`,
    );
    pinNoCauseElementRemedy(titled, carried);
    pinNoUnattributedAngularWording(titled);
    pinNoAbsenceClaimsSilence(titled);
    pinNoModuleSentenceClaimsSilence(SURFACE);

    // And the exemption is what lets them through: with the captured text policed as if the pane had
    // written it, the same correct pane reddens on "because"; with the digest's title policed as well,
    // it reddens on the "element" the digest itself wrote.
    const onText = reddens('no-cause-element-remedy', () =>
      pinNoCauseElementRemedy(titled, carried, []),
    );
    assert.match(onText.message, /must render no cause/);
    const onTitle = reddens('no-cause-element-remedy', () =>
      pinNoCauseElementRemedy(titled, carried, ['text']),
    );
    assert.match(onTitle.message, /must render no element/);

    // The remedy wave 5's cycle-3 review constructed: a pane that writes "to fix this" states a remedy
    // without spelling "remedy", so `fix` is matched as a whole word — "prefix" and "affix" are not it.
    const none = SURFACE.consolePanel(noDiagnosticsAnswer());
    const withFix = {
      ...none,
      lines: [
        none.lines[0],
        'no-diagnostics: no capture was handed to the join at all, and to fix this, edit the binding',
      ],
    };
    const fixFailure = reddens('no-cause-element-remedy', () =>
      pinNoCauseElementRemedy(withFix, noDiagnosticsAnswer()),
    );
    assert.match(fixFailure.message, /must render no remedy/);
    assert.match(fixFailure.message, /matched \/\\bfix\\b\/i/);
    console.log(
      `pane-written "fix" probe: ${fixFailure.message.replace(/\s+/g, ' ').trim()}`,
    );
    const withPrefix = {
      ...none,
      lines: [
        none.lines[0],
        'no-diagnostics: no capture was handed to the join at all, so an account of the prefix is not given',
      ],
    };
    pinNoCauseElementRemedy(withPrefix, noDiagnosticsAnswer());
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
    // A word that collides with an `Object.prototype` key is a word the pane was not written for: the
    // state sentence is looked up as an own property, so `constructor` renders `state: constructor`
    // and not a function's source, and `__proto__` renders itself and not a prototype object.
    pinGivenStates(SURFACE);
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

/**
 * AC3: a pane-written sentence that merely describes what was read passes, whatever its words. Every
 * shipped sentence is the positive case, and each is read here by name — including the one that
 * legitimately says a capture whose own attempt failed also emits nothing, and the denial beside it
 * that is the only place this pane names the page.
 */
function pinShippedAbsenceSentencesPass() {
  const rule = absenceRule();
  for (const [where, sentence] of [
    ['joined sentence', SURFACE.STATE_TEXTS[SURFACE.JOINED]],
    [
      'captured-nothing sentence',
      SURFACE.STATE_TEXTS[SURFACE.CAPTURED_NOTHING],
    ],
    ['no-diagnostics sentence', SURFACE.STATE_TEXTS[SURFACE.NO_DIAGNOSTICS]],
    ['no-console-answer sentence', SURFACE.NO_ANSWER_TEXT],
    ['no-finding sentence', SURFACE.NO_FINDING_TEXT],
    ['no-code sentence', SURFACE.NO_CODE_TEXT],
    ['no-title sentence', SURFACE.NO_TITLE_TEXT],
    ['unreadable-finding sentence', SURFACE.UNREADABLE_FINDING_TEXT],
    ['no-digest-entry sentence', SURFACE.noDigestEntryText('NG04002')],
    [
      'no-diagnostics sentence',
      'no-diagnostics: no capture was handed to the join at all, so no capture was read and no finding is rendered',
    ],
    [
      'captured-nothing sentence',
      'captured-nothing: a capture was read and carried no diagnostic, so the pane states that and no finding is rendered',
    ],
  ]) {
    assertAbsenceStatement(absenceBody(sentence), where, rule);
  }
  // And the sentence the task names: a capture whose own attempt failed also emits nothing is a
  // statement about the capture, and the denial beside it is how the page is named at all.
  assert.ok(
    SURFACE.STATE_TEXTS[SURFACE.CAPTURED_NOTHING].includes(
      'a capture whose own attempt failed also emits nothing',
    ),
    'the shipped captured-nothing sentence must still say what a failed capture did, or this positive proves nothing',
  );
  assert.ok(
    SURFACE.STATE_TEXTS[SURFACE.CAPTURED_NOTHING].includes(
      'never that the page was silent',
    ),
    'the shipped captured-nothing sentence must still carry its denial, or the rule’s boundary is untested',
  );
}

/**
 * AC1: the page named outside a denial reddens, in wordings the five-pattern lexicon the rule replaced
 * never matched — so these are the property's and not the old list surviving under a new name — and
 * each failure names the sentence it was written in and the phrase.
 */
function pinThePhraseListMissedNothing() {
  const rule = absenceRule();
  const phraseList = [
    /\bsilen(ce|t)\b/gi,
    /\bthe page (produced|reported|logged|said|showed) nothing\b/gi,
    /\bnothing (was|has been) (logged|captured|reported)\b/gi,
    /\bno console (output|activity|messages?)\b/gi,
    /\bthe page (did not|didn't) (log|report|complain)\b/gi,
  ];
  for (const [where, sentence, phrase] of [
    [
      'no-diagnostics sentence',
      'no-diagnostics: the page emitted no diagnostic at all, so no capture was handed to the join',
      'the page emitted no diagnostic at all',
    ],
    [
      'captured-nothing sentence',
      'captured-nothing: the page ran clean, so a capture was read and carried no diagnostic',
      'the page ran clean',
    ],
    [
      'joined sentence',
      'joined: the capture held at least one diagnostic, and the page had nothing else to say',
      'the page had nothing else to say',
    ],
    [
      'no-console-answer sentence',
      'no-console-answer: the browser had nothing to say, so no console join answer was handed over',
      'the browser had nothing to say',
    ],
  ]) {
    // The wording really is outside the five patterns the rule used to be, so a pass here would not
    // be the old check surviving under a new name.
    assert.equal(
      phraseList.some((pattern) => {
        pattern.lastIndex = 0;
        return pattern.test(sentence);
      }),
      false,
      `the probe ${JSON.stringify(sentence)} must be a wording the old phrase list never matched, or it proves nothing`,
    );
    let failure = null;
    try {
      assertAbsenceStatement(absenceBody(sentence), where, rule);
    } catch (error) {
      failure = error;
    }
    assert.ok(
      failure instanceof Error,
      `${where} must redden on ${JSON.stringify(phrase)}`,
    );
    assert.match(failure.message, /absence-statement: the /);
    assert.ok(
      failure.message.includes(where),
      `the failure must name the sentence it was written in; it failed with ${failure.message}`,
    );
    assert.ok(
      failure.message.includes(phrase),
      `the failure must name the phrase; it failed with ${failure.message}`,
    );
    console.log(
      `old phrase list missed, the rule catches: ${failure.message.replace(/\s+/g, ' ').trim()}`,
    );
  }
  // The denial is the other side of the same boundary: the same claim, denied, passes.
  assertAbsenceStatement(
    absenceBody(
      'no-diagnostics: no capture was handed to the join at all, and this is never a claim that the page emitted nothing',
    ),
    'no-diagnostics sentence',
    rule,
  );
}

/** AC4: the record states the rule, and the matcher here is the record suite’s, so the two cannot drift. */
function pinAbsenceRuleIsTheRecords() {
  const rule = absenceRule();
  assert.ok(
    typeof rule.rule === 'string' && rule.rule.length > 200,
    `the record must state the property, not only its vocabulary; it states ${JSON.stringify(rule.rule)}`,
  );
  for (const key of [
    'readSubjects',
    'readActions',
    'paneActions',
    'placeholders',
    'pageWords',
    'denials',
  ]) {
    assert.ok(
      Array.isArray(rule[key]) && rule[key].length > 0,
      `the record's absence-statement rule must carry ${JSON.stringify(key)}`,
    );
  }
  const here = readFileSync(new URL(import.meta.url), 'utf8');
  const there = readFileSync(
    new URL('./console-panel-record.test.mjs', import.meta.url),
    'utf8',
  );
  assert.equal(
    absenceMatcherSource(there),
    absenceMatcherSource(here),
    'the absence-statement matcher must be the same code in both suites, or the two can drift',
  );
  assert.ok(
    absenceMatcherSource(here).includes('function absenceBreaches('),
    'the drift pin must compare the matcher and not an empty block',
  );
}

// ---------------------------------------------------------------- the mutants ----

/**
 * The defects E7 and SC3/SC4 name, each one anchored edit of the pane's own source. `exhibits`
 * asserts the mutated copy really carries the defect, so a mutation that fails to reproduce it is a
 * failure rather than a green mutant.
 *
 * Five groups. The defects a joined answer could carry: a count for the digest miss, an empty list
 * for `captured-nothing`, a cause, an element, a remedy and a word of the pane's own naming Angular.
 * The same prohibitions proved on the states besides `joined` — an element on `captured-nothing`, a
 * remedy and a "because" clause on `no-diagnostics`, and Angular wording on a word the pane was not
 * written for — one per state, each reddening a pin whose message names that state and the phrase.
 * The state sentence's own rules: the own-property lookup, a sentence that is only its prefix, and
 * the count guard extended to the no-code absence. And the absence rule in six wordings: the three a
 * phrase list could be written against ("the page was silent", "the page logged nothing", "the page
 * was silent" on `captured-nothing`) and three it never matched — "the page emitted no diagnostic at
 * all", "the page ran clean" and "the page had nothing else to say" — across `no-diagnostics`,
 * `captured-nothing`, `joined` and the `no-console-answer` sentence. Each reddens a pin whose failure
 * names the state and the phrase, which is what makes the rule a property of the sentence and not of
 * a list.
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
    id: 'no-code-as-count',
    defect: 'no-code',
    anchor: [
      'export const NO_CODE_TEXT =',
      "  'no-code: the captured message carried no code, so this finding carries no code and no title';",
    ].join('\n'),
    replacement: [
      'export const NO_CODE_TEXT =',
      "  'no-code: 1 captured message carried no code, so this finding carries no code and no title';",
    ].join('\n'),
    check: (api) => {
      const answer = joinedAnswer();
      return () => pinNoCodeAbsenceIsNamed(api.consolePanel(answer), answer);
    },
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(joinedAnswer())
          .text.includes('1 captured message carried no code'),
        'the mutant really renders a count where the no-code absence belongs',
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
    id: 'captured-nothing-claims-silence',
    defect: 'never what the page did',
    anchor: [
      "  'captured-nothing':",
      "    'captured-nothing: a capture was read and carried no diagnostic, and a capture whose own attempt failed also emits nothing, so this states what was read and never that the page was silent',",
    ].join('\n'),
    replacement: [
      "  'captured-nothing':",
      "    'captured-nothing: the page was silent, so no diagnostic was captured',",
    ].join('\n'),
    check: (api) => {
      return () =>
        pinCapturedNothingNeverClaimsSilence(
          api.consolePanel(capturedNothingAnswer()),
        );
    },
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(capturedNothingAnswer())
          .text.includes('the page was silent'),
        'the mutant really replaces the statement with a claim that the page was silent',
      ),
    names: /the captured-nothing surface .*\(claimed "the page was silent/,
  },
  {
    id: 'captured-nothing-as-a-prefix',
    defect: 'says what was read',
    anchor: [
      "  'captured-nothing':",
      "    'captured-nothing: a capture was read and carried no diagnostic, and a capture whose own attempt failed also emits nothing, so this states what was read and never that the page was silent',",
    ].join('\n'),
    replacement: ["  'captured-nothing':", "    'captured-nothing: ',"].join(
      '\n',
    ),
    check: (api) => {
      return () =>
        pinCapturedNothingNeverClaimsSilence(
          api.consolePanel(capturedNothingAnswer()),
        );
    },
    exhibits: (module) =>
      assert.equal(
        module.consolePanel(capturedNothingAnswer()).lines[1],
        'captured-nothing: ',
        'the mutant really keeps the prefix and drops the sentence behind it',
      ),
    names: /says what was read/,
  },
  {
    id: 'captured-nothing-page-ran-clean',
    defect: 'never what the page did',
    anchor: [
      "  'captured-nothing':",
      "    'captured-nothing: a capture was read and carried no diagnostic, and a capture whose own attempt failed also emits nothing, so this states what was read and never that the page was silent',",
    ].join('\n'),
    replacement: [
      "  'captured-nothing':",
      "    'captured-nothing: the page ran clean, so a capture was read and carried no diagnostic',",
    ].join('\n'),
    check: (api) => {
      return () =>
        pinNoAbsenceClaimsSilence(api.consolePanel(capturedNothingAnswer()));
    },
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(capturedNothingAnswer())
          .text.includes('the page ran clean'),
        'the mutant really replaces the statement with a claim about the page, in words the old phrase list never matched',
      ),
    names: /the captured-nothing surface .*\(claimed "the page ran clean/,
  },
  {
    id: 'joined-page-had-nothing-to-say',
    defect: 'never what the page did',
    anchor: [
      '  joined:',
      '    "joined: the capture held at least one diagnostic, and every finding below is one diagnostic in the capture\'s own order",',
    ].join('\n'),
    replacement: [
      '  joined:',
      '    "joined: the capture held at least one diagnostic, and the page had nothing else to say",',
    ].join('\n'),
    check: (api) => {
      return () => pinNoAbsenceClaimsSilence(api.consolePanel(joinedAnswer()));
    },
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(joinedAnswer())
          .text.includes('the page had nothing else to say'),
        'the mutant really appends a claim about the page to the joined sentence, in words the old phrase list never matched',
      ),
    names: /the joined surface .*\(claimed "the page had nothing else to say/,
  },
  {
    id: 'cause-added',
    defect: 'no-cause',
    anchor: [
      '  if (sentence === undefined) return surface(state, lines);',
      '  lines.push(sentence);',
    ].join('\n'),
    replacement: [
      '  if (sentence === undefined) return surface(state, lines);',
      '  lines.push(sentence);',
      "  lines.push('cause: the console.error call the page made');",
    ].join('\n'),
    check: (api) => () => pinE7OnEveryState(api),
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(joinedAnswer())
          .text.includes('cause: the console.error call'),
        'the mutant really names a cause',
      ),
    names: /the joined surface must render no cause/,
  },
  {
    id: 'element-added',
    defect: 'no-element',
    anchor: '  lines.push(`text: ${text}`);',
    replacement: [
      "  lines.push(`element: ${String(raw['component'] ?? 'none')}`);",
      '  lines.push(`text: ${text}`);',
    ].join('\n'),
    check: (api) => () => pinE7OnEveryState(api),
    exhibits: (module) =>
      assert.ok(
        module.consolePanel(joinedAnswer()).text.includes('element: '),
        'the mutant really renders an element reference',
      ),
    names: /the joined surface must render no element/,
  },
  {
    id: 'remedy-added',
    defect: 'no-remedy',
    anchor: '  if (findings.length === 0) {',
    replacement: [
      "  lines.push('remedy: read the digest entry and fix the check');",
      '  if (findings.length === 0) {',
    ].join('\n'),
    check: (api) => () => pinE7OnEveryState(api),
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(joinedAnswer())
          .text.includes('remedy: read the digest entry'),
        'the mutant really states a remedy',
      ),
    names: /the joined surface must render no remedy/,
  },
  {
    id: 'remedy-spelled-fix',
    defect: 'no-cause-element-remedy',
    anchor: 'in the capture\'s own order",',
    replacement:
      'in the capture\'s own order, and to fix this, edit the binding",',
    check: (api) => () => pinE7OnEveryState(api),
    exhibits: (module) =>
      assert.ok(
        module.consolePanel(joinedAnswer()).text.includes('to fix this'),
        'the mutant really states a remedy without spelling "remedy"',
      ),
    names: /the joined surface must render no remedy/,
  },
  {
    id: 'unattributed-wording',
    defect: 'no-unattributed-wording',
    anchor: '  const lines: string[] = [`state: ${state}`];',
    replacement: [
      '  const lines: string[] = [`state: ${state}`];',
      "  lines.push('angular: the framework reported this');",
    ].join('\n'),
    check: (api) => () => pinE7OnEveryState(api),
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(joinedAnswer())
          .text.includes('angular: the framework reported this'),
        'the mutant really adds wording of its own naming Angular',
      ),
    names: /the joined surface writes no wording of its own naming Angular/,
  },
  {
    id: 'element-on-captured-nothing',
    defect: 'must render no element',
    anchor: '  if (state !== JOINED) return surface(state, lines);',
    replacement: [
      '  if (state === CAPTURED_NOTHING) {',
      '    lines.push(\'element: <app-root class="shell">\');',
      '  }',
      '  if (state !== JOINED) return surface(state, lines);',
    ].join('\n'),
    check: (api) => () => pinE7OnEveryState(api),
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(capturedNothingAnswer())
          .lines.some((line) => line.startsWith('element: ')),
        'the mutant really renders an element reference on captured-nothing',
      ),
    names: /the captured-nothing surface must render no element/,
  },
  {
    id: 'remedy-on-no-diagnostics',
    defect: 'must render no remedy',
    anchor: [
      "  'no-diagnostics':",
      "    'no-diagnostics: no capture was handed to the join at all, so no capture was read',",
    ].join('\n'),
    replacement: [
      "  'no-diagnostics':",
      "    'no-diagnostics: no capture was handed to the join at all, so no capture was read, and a remedy is to hand it one',",
    ].join('\n'),
    check: (api) => () => pinE7OnEveryState(api),
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(noDiagnosticsAnswer())
          .text.includes('a remedy is to hand it one'),
        'the mutant really states a remedy on no-diagnostics',
      ),
    names: /the no-diagnostics surface must render no remedy/,
  },
  {
    id: 'because-on-no-diagnostics',
    defect: 'must render no cause',
    anchor: [
      "  'no-diagnostics':",
      "    'no-diagnostics: no capture was handed to the join at all, so no capture was read',",
    ].join('\n'),
    replacement: [
      "  'no-diagnostics':",
      "    'no-diagnostics: no capture was handed to the join at all, so no capture was read because every console hook failed to install',",
    ].join('\n'),
    check: (api) => () => pinE7OnEveryState(api),
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(noDiagnosticsAnswer())
          .text.includes('because every console hook failed to install'),
        'the mutant really appends a cause clause to no-diagnostics',
      ),
    names: /the no-diagnostics surface must render no cause/,
  },
  {
    id: 'no-diagnostics-claims-silence',
    defect: 'never what the page did',
    anchor: [
      "  'no-diagnostics':",
      "    'no-diagnostics: no capture was handed to the join at all, so no capture was read',",
    ].join('\n'),
    replacement: [
      "  'no-diagnostics':",
      "    'no-diagnostics: the page was silent, so no capture was handed to the join at all',",
    ].join('\n'),
    check: (api) => {
      return () =>
        pinNoAbsenceClaimsSilence(api.consolePanel(noDiagnosticsAnswer()));
    },
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(noDiagnosticsAnswer())
          .text.includes('the page was silent'),
        'the mutant really replaces the no-diagnostics statement with a claim that the page was silent',
      ),
    names: /the no-diagnostics surface .*\(claimed "the page was silent/,
  },
  {
    id: 'no-diagnostics-emitted-no-diagnostic',
    defect: 'never what the page did',
    anchor: [
      "  'no-diagnostics':",
      "    'no-diagnostics: no capture was handed to the join at all, so no capture was read',",
    ].join('\n'),
    replacement: [
      "  'no-diagnostics':",
      "    'no-diagnostics: the page emitted no diagnostic at all, so no capture was handed to the join',",
    ].join('\n'),
    check: (api) => {
      return () =>
        pinNoAbsenceClaimsSilence(api.consolePanel(noDiagnosticsAnswer()));
    },
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(noDiagnosticsAnswer())
          .text.includes('the page emitted no diagnostic at all'),
        'the mutant really states what the page emitted, in a wording the old phrase list never matched',
      ),
    names:
      /the no-diagnostics surface .*\(claimed "the page emitted no diagnostic at all/,
  },
  {
    id: 'no-console-answer-claims-silence',
    defect: 'never what the page did',
    anchor: [
      'export const NO_ANSWER_TEXT =',
      "  'no-console-answer: no console join answer was handed over, so no state and no finding are reported';",
    ].join('\n'),
    replacement: [
      'export const NO_ANSWER_TEXT =',
      "  'no-console-answer: the page logged nothing, so no console join answer was handed over';",
    ].join('\n'),
    check: (api) => () => pinNoModuleSentenceClaimsSilence(api),
    exhibits: (module) =>
      assert.ok(
        module.consolePanel(undefined).text.includes('the page logged nothing'),
        'the mutant really replaces the no-console-answer sentence with a claim about the page',
      ),
    names:
      /the no-console-answer sentence .*\(claimed "the page logged nothing/,
  },
  {
    id: 'angular-on-a-given-word',
    defect: 'naming Angular',
    anchor: '  if (sentence === undefined) return surface(state, lines);',
    replacement: [
      '  if (sentence === undefined) {',
      "    lines.push('angular: the framework reported this');",
      '    return surface(state, lines);',
      '  }',
    ].join('\n'),
    check: (api) => () => pinE7OnEveryState(api),
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel({ state: 'wedged' })
          .text.includes('angular: the framework reported this'),
        'the mutant really adds wording of its own naming Angular to a given state',
      ),
    names: /the wedged surface writes no wording of its own naming Angular/,
  },
  {
    id: 'state-looked-up-through-the-prototype',
    defect: 'looked up as an own property',
    anchor: [
      '  const sentence = Object.hasOwn(STATE_TEXTS, state)',
      '    ? STATE_TEXTS[state]',
      '    : undefined;',
    ].join('\n'),
    replacement: '  const sentence = STATE_TEXTS[state];',
    check: (api) => () => pinGivenStates(api),
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel({ state: 'constructor' })
          .text.includes('native code'),
        'the mutant really renders the prototype’s function source for the word constructor',
      ),
    names: /looked up as an own property/,
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
