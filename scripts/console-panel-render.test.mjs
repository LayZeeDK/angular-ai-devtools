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
// T022 keeps that exemption for `text` and `title` — the capture's and the digest's words by contract —
// and closes the one field of it that is the join's own: `reason`, which this module writes itself. The
// join enumerates it (`REASONS`) and this suite holds the two sets to each other in both directions.
// Every reason the join can state must render as one of the pane's own known absences, and an answer
// whose `reason` or `state` is outside those closed sets is refused by name instead of being read as an
// answer the join could have given. That closes the channel wave 3's cycle-5 review found, where
// `reason: "the page was silent; to fix this, edit the element"` or an arbitrary `state` word supplied
// with an answer reached the surface as prose no pin inspected.
//
// E6 is the one match the pane must state as a difference: where the join found a digest entry by
// folding case, the finding carries the digest's spelling as its `code` and the message's spelling as
// `carriedCode`, and the pane renders one sentence naming both. That sentence is the pane's own, so it
// is held to the same prohibitions as the absences — no cause, no element, no remedy, no wording of the
// pane's own naming Angular, and no claim about the page — and the pin that holds it reddens when the
// sentence stops naming the difference.
//
// T025: that sentence carries a second claim, the digest's title, and it may state that claim only
// where the row carries a title. A folded row whose digest entry carries the code and no title renders
// the absence in the `no-title` sentence and the difference in a sentence of its own that says no title
// is stated, and `pinFoldedRowWithoutTitleStatesNoTitle` holds the two to each other — the defect wave
// 10's review reproduced was those two sentences contradicting each other on one surface, and the pin
// reddens on the claim rather than on the branch.
//
// The E7 prohibitions are a rule and not a snapshot of the `joined` surface: `pinE7OnEveryState` runs
// them on `joined`, `captured-nothing`, `no-diagnostics` and a state word the pane was not written
// for, so a cause, an element, a remedy or an unattributed word about the framework added to any one
// of those surfaces reddens a pin that names both the state and the phrase.
//
// The pane's own sentences are enumerated, not policed (T019). Every sentence it writes for itself is
// an entry of `PANE_SENTENCES` in the module — the three state sentences, the six named absences and the
// two wordings the one difference a folded match states takes (the row carrying the digest's title and
// the row carrying none), each with an id and its exact text — and the pane renders from that registry
// and from nothing else. The pins below hold the registry to the rendered output in both
// directions: `pinEveryRegistryEntryRenders` requires an answer that renders each entry where it
// belongs, and `pinNoRenderedLineIsOutsideTheRegistry` requires every rendered pane-written line to be
// a labelled fact of the answer or an entry of the registry, naming the line when it is neither.
// `pinOnlyTheRegistryWritesSentences` reads the module's own source, so a sentence written beside the
// registry — even the registry's own wording — reddens too. `pinTheRegistryIsTheRecords` holds the
// registry to the copy in `research/raw/m045-console-panel.json`'s `contract.sentenceRegistry`, in
// both directions, which is why an entry added to the pane alone is not enough to render a new
// sentence: the record has to carry it as well, and the record suite refuses the same disagreement.
//
// The absence rule is kept as a secondary check over the registry's own text
// (`pinNoModuleSentenceClaimsSilence`): a registry entry that claims what the page did still reddens.
// It is a closed list of subjects and actions decided by a clause's first matching token, not a
// property of meaning, and this suite does not ask it to catch wording it has not seen — the
// enumeration is what refuses a new sentence. The four sentences wave 3's cycle-4 review measured, and
// `the digest states the page's silence`, are refused by the enumeration and not by the matcher, and
// `pinTheReviewEvasionsAreRefused` measures both halves of that refusal for each of them. The rule
// itself is stated once, in `research/raw/m045-console-panel.json`'s contract, and read here and in
// the record suite; the matcher that reads a sentence with it is duplicated and pinned byte-identical
// in both. The no-code absence may never become a count, and the state sentence is looked up as an own
// property, so a word such as `constructor` renders itself and not a function's source.
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

/**
 * A code that matches a digest entry only after folding case (E6): the shipped digest carries
 * `NG01002` ("Missing Control Value") and no lowercase spelling of any code, so this message carries a
 * code the digest joins only by folding. The fold and the fixture are asserted below, so the pane is
 * never handed a difference that does not exist.
 */
const FOLDED = {
  code: 'ng01002',
  message: 'ng01002: Missing control value for the input',
  component: null,
  timestamp: 4,
};

/** The join, in a bare context: no DOM, no clock, no console, publishing its own namespace. */
function joinApi(source = JOIN_SRC) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiConsoleJoin;
  assert.ok(api, 'extension/console-join.js must publish its namespace');
  assert.equal(typeof api.consoleJoin, 'function');
  return api;
}

/**
 * A copy of the join's source with one anchored replacement applied, loaded the same bare way. This
 * suite's two vocabulary pins are about words the join writes (`reason`) and words it answers with
 * (`state`), so the mutant that arms each of them is the join's own: the anchor must occur exactly
 * once, the result must differ from the source, and nothing is written to the checkout.
 */
function joinMutant(anchor, replacement) {
  assert.ok(
    JOIN_SRC.includes(anchor),
    `mutation anchor not found in console-join.js: ${JSON.stringify(anchor)}`,
  );
  assert.equal(
    JOIN_SRC.split(anchor).length - 1,
    1,
    `mutation anchor must occur exactly once: ${JSON.stringify(anchor)}`,
  );
  const source = JOIN_SRC.replace(anchor, () => replacement);
  assert.notEqual(
    source,
    JOIN_SRC,
    `the mutation must change the join: ${JSON.stringify(anchor)}`,
  );
  return { api: joinApi(source), source };
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

/**
 * The join's own answer for the case-folded diagnostic: the digest's code and title, with the
 * message's spelling beside them. The join decides that, not this suite, so the pane is held to the
 * answer it would really be handed.
 */
function foldedAnswer() {
  return clone(JOIN.consoleJoin([FOLDED], DIGEST));
}

/** The join's own answer for a capture that was never handed over at all. */
function noDiagnosticsAnswer() {
  return clone(JOIN.consoleJoin(undefined, DIGEST));
}

/**
 * The code the folded fixture lands on in the digest, read from the join's own answer rather than
 * written here.
 */
const FOLDED_DIGEST_CODE = foldedAnswer().findings[0].code;

/**
 * The shipped digest with the one entry the folded fixture lands on reduced to its code: `NG01002`
 * carrying no title. Every one of the shipped entries states a title, so this is the one shape the
 * shipped digest cannot produce and the join's contract still answers — a finding with the digest's
 * spelling, no `title`, and the message's spelling beside it. The pane is held to the answer the join
 * really gives for it, not to one written here.
 */
const TITLELESS_DIGEST = {
  version: DIGEST.version,
  entries: DIGEST.entries.map((entry) =>
    entry.code === FOLDED_DIGEST_CODE ? { code: entry.code } : entry,
  ),
};

/**
 * The join's own answer for the case-folded diagnostic where the digest carries that code and states
 * no title for it: the digest's spelling beside the message's, and no `title` on the finding.
 */
function titlelessFoldedAnswer() {
  return clone(JOIN.consoleJoin([FOLDED], TITLELESS_DIGEST));
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

/**
 * Every sentence the pane may write of its own for one answer, read from the module's own registry
 * (T019) rather than restated here: the entries whose text is fixed, plus the two that name a code,
 * filled from the findings the answer carried — so a pane that named a spelling the answer does not
 * carry still reddens.
 */
function ownSentences(answer) {
  const sentences = new Set();
  for (const entry of SURFACE.PANE_SENTENCES)
    if (entry.slots.length === 0) sentences.add(entry.text);
  for (const finding of answer.findings) {
    if (typeof finding.code === 'string')
      sentences.add(SURFACE.noDigestEntryText(finding.code));
    // E6: the difference sentence names the two spellings, so it is read off the finding rather than
    // written out here — a pane that named a spelling the answer does not carry still reddens. T025:
    // the sentence the folded row states depends on the title the row carries, so it is read off that
    // too; the titled wording claims a title only a titled row may claim.
    if (
      typeof finding.carriedCode === 'string' &&
      typeof finding.code === 'string'
    )
      sentences.add(
        typeof finding.title === 'string'
          ? SURFACE.caseFoldedMatchText(finding.carriedCode, finding.code)
          : SURFACE.caseFoldedMatchWithoutTitleText(
              finding.carriedCode,
              finding.code,
            ),
      );
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
 * SC3/E6: a code the digest matched only after folding case is rendered as the digest carries it, and
 * the row states the difference in one sentence of the pane's own. The code line is the digest's
 * spelling and never the message's; the sentence names both spellings; and no absence sentence is
 * rendered for a match, because a folded match is a match.
 */
function pinCaseDifferenceIsNamed(surface, answer) {
  const folded = answer.findings.filter(
    (finding) =>
      typeof finding.carriedCode === 'string' &&
      typeof finding.code === 'string',
  );
  assert.equal(
    folded.length,
    1,
    `case-difference: the fixture must carry exactly one case-folded match, or this pin proves nothing; the answer carried ${JSON.stringify(answer.findings)}`,
  );
  const finding = folded[0];
  assert.equal(
    finding.carriedCode.toLowerCase(),
    finding.code.toLowerCase(),
    `case-difference: the two spellings the row states must fold together (${finding.carriedCode} and ${finding.code}), or the pin is naming a difference the digest did not match`,
  );
  assert.notEqual(
    finding.carriedCode,
    finding.code,
    'case-difference: the two spellings must differ, or there is no difference to state',
  );
  assert.ok(
    surface.lines.includes(`code: ${finding.code}`),
    `case-difference (E6): the row must report the code as the digest carries it — ${JSON.stringify(`code: ${finding.code}`)}; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
  assert.equal(
    surface.lines.includes(`code: ${finding.carriedCode}`),
    false,
    `case-difference (E6): the row must not report the message's spelling as the code — ${JSON.stringify(`code: ${finding.carriedCode}`)} is the spelling the digest does not carry; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
  assert.ok(
    surface.lines.includes(`title: ${finding.title}`),
    `case-difference (E6): the row must carry the digest's own title for the folded match — ${JSON.stringify(`title: ${finding.title}`)}; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
  const stated = surface.lines.filter(
    (line) => line.slice(0, line.indexOf(': ')) === SURFACE.CASE_DIFFERENCE,
  );
  assert.equal(
    stated.length,
    1,
    `case-difference: the pane must state the difference in exactly one sentence of its own, labelled ${JSON.stringify(SURFACE.CASE_DIFFERENCE)}; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
  const [sentence] = stated;
  assert.ok(
    sentence.includes(finding.carriedCode),
    `case-difference: the sentence must name the spelling the message carried (${finding.carriedCode}), or the difference it states is not the one the row shows; it rendered ${JSON.stringify(sentence)}`,
  );
  assert.ok(
    sentence.includes(finding.code),
    `case-difference: the sentence must name the spelling the digest carries (${finding.code}), or a reader cannot see which spelling the row uses; it rendered ${JSON.stringify(sentence)}`,
  );
  assert.match(
    sentence,
    /NG0\d{3,}/i,
    `case-difference: the sentence names codes rather than a count or a blank; it rendered ${JSON.stringify(sentence)}`,
  );
  // T025/AC1: the row carries the digest's title, so the sentence that states the difference states that
  // claim too. It is the claim only a titled row may make — `pinFoldedRowWithoutTitleStatesNoTitle` holds
  // the other shape to the other wording — and the assertion is here so neither shape can borrow the
  // other's sentence.
  assert.match(
    sentence,
    /\b(?:own|the digest's) spelling and title\b/,
    `case-difference: the row carries the digest's own title, so the sentence states the difference and that title claim; it rendered ${JSON.stringify(sentence)}`,
  );
  assert.equal(
    surface.lines.filter((line) =>
      line.startsWith(`${SURFACE.NO_DIGEST_ENTRY}: `),
    ).length,
    0,
    `case-difference: a folded match is a match, so no absence sentence is rendered for it; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
}

/**
 * T025, AC1 and AC2: a folded match whose digest entry carries the code and states no title. The row
 * carries the digest's spelling and no title, so the pane may claim no title anywhere on that surface:
 * no `title:` line is rendered, the absence is stated in the `no-title` sentence, and the difference is
 * stated in the sentence registered for exactly this shape — the two sentences agree, and neither says
 * the row carries a title it does not carry.
 *
 * The failure names the claim rather than the branch, so the mutant that renders the titled sentence on
 * a titleless row reddens with `states-no-title` and not with a diff of lines: what the pin reads is the
 * sentence the surface states, which is what the defect was.
 */
function pinFoldedRowWithoutTitleStatesNoTitle(surface, answer) {
  const folded = answer.findings.filter(
    (finding) =>
      typeof finding.carriedCode === 'string' &&
      typeof finding.code === 'string',
  );
  assert.equal(
    folded.length,
    1,
    `states-no-title: the fixture must carry exactly one case-folded match, or this pin proves nothing; the answer carried ${JSON.stringify(answer.findings)}`,
  );
  const [finding] = folded;
  assert.equal(
    Object.hasOwn(finding, 'title'),
    false,
    `states-no-title: this pin holds the folded row whose digest entry states no title, and the finding carries one (${JSON.stringify(finding.title)}); a titled row is the other shape, held by pinCaseDifferenceIsNamed`,
  );
  assert.equal(
    folded[0].carriedCode.toLowerCase(),
    folded[0].code.toLowerCase(),
    `states-no-title: the two spellings the row states must fold together (${finding.carriedCode} and ${finding.code}), or the pin is naming a difference the digest did not match`,
  );
  assert.equal(
    surface.lines.some((line) => line.startsWith('title: ')),
    false,
    `states-no-title: the row carries no title, so the pane prints no title line for it; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
  const claims = surface.lines.filter((line) =>
    /\b(?:own|the digest's) spelling and title\b/.test(line),
  );
  assert.deepEqual(
    claims,
    [],
    `states-no-title: a folded row the digest carries no title for must claim no title, and the pane claimed one on ${JSON.stringify(claims)} — a surface may state what the row carries and nothing more; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
  const absence = surface.lines.filter(
    (line) => renderedLabel(line) === SURFACE.NO_TITLE,
  );
  assert.equal(
    absence.length,
    1,
    `states-no-title: the digest carries the code and states no title for it, so the pane states that absence in exactly one sentence labelled ${JSON.stringify(SURFACE.NO_TITLE)}; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
  const stated = surface.lines.filter(
    (line) => renderedLabel(line) === SURFACE.CASE_DIFFERENCE_NO_TITLE,
  );
  assert.equal(
    stated.length,
    1,
    `states-no-title: the pane must state the difference in exactly one sentence labelled ${JSON.stringify(SURFACE.CASE_DIFFERENCE_NO_TITLE)}, which is the wording for a folded row with no title; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
  const [sentence] = stated;
  assert.ok(
    sentence.includes(finding.carriedCode),
    `states-no-title: the sentence must name the spelling the message carried (${finding.carriedCode}), or the difference it states is not the one the row shows; it rendered ${JSON.stringify(sentence)}`,
  );
  assert.ok(
    sentence.includes(finding.code),
    `states-no-title: the sentence must name the spelling the digest carries (${finding.code}), or a reader cannot see which spelling the row uses; it rendered ${JSON.stringify(sentence)}`,
  );
  assert.match(
    sentence,
    /NG0\d{3,}/i,
    `states-no-title: the sentence names codes rather than a count or a blank; it rendered ${JSON.stringify(sentence)}`,
  );
  // AC2, the half the review measured: the two sentences on that surface agree. Both say the row has no
  // title, and neither claims one.
  for (const line of [...absence, sentence])
    assert.match(
      line,
      /\bno title\b/,
      `states-no-title: the absence and the difference both say the row carries no title, so the two sentences on this surface agree; the pane rendered ${JSON.stringify(line)} of ${JSON.stringify(surface.lines)}`,
    );
  assert.equal(
    surface.lines.some(
      (line) => renderedLabel(line) === SURFACE.CASE_DIFFERENCE,
    ),
    false,
    `states-no-title: the sentence labelled ${JSON.stringify(SURFACE.CASE_DIFFERENCE)} claims a title, and this row carries none, so it is not rendered beside ${JSON.stringify(SURFACE.CASE_DIFFERENCE_NO_TITLE)}; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
  assert.equal(
    surface.lines.filter((line) =>
      line.startsWith(`${SURFACE.NO_DIGEST_ENTRY}: `),
    ).length,
    0,
    `states-no-title: a folded match is a match, so no absence sentence is rendered for it; the pane rendered ${JSON.stringify(surface.lines)}`,
  );
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
 * SC4/E7/T019: the same rule over the registry's own text, so it covers the sentences a given answer
 * does not render — including an entry written for an id no answer in this suite reaches, which is the
 * one case a surface pin cannot see. Every entry of `PANE_SENTENCES` is read by the label its line
 * carries, so a registry entry that claims what the page did reddens naming the entry.
 *
 * This is the secondary check the task keeps and not the guard: the rule decides a clause by its first
 * matching token, so a wording it has not seen passes it, and the enumeration is what refuses that
 * wording. `pinTheReviewEvasionsAreRefused` measures exactly that boundary.
 */
function pinNoModuleSentenceClaimsSilence(api) {
  const rule = absenceRule();
  for (const entry of sentenceRegistry(api)) {
    const sentence = registryText(api, entry);
    assert.equal(
      typeof sentence,
      'string',
      `absence-statement: the pane must state a sentence for ${JSON.stringify(entry.id)}, or this pin proves nothing`,
    );
    assertAbsenceStatement(
      absenceBody(sentence),
      `${registryLabel(entry)} sentence`,
      rule,
    );
  }
}

// ---------------------------------------------------- the pane's sentence registry (T019) ----
//
// The pane writes no sentence that is not an entry of `PANE_SENTENCES`, and this block is what holds
// that: the registry's own shape, its reach into the rendered output, the output's reach back into it,
// the record's copy of it, and the module's source beside it.
//
// The values the two parameterised entries are filled with come from the join's own answers, never
// from a string written here, so a pin cannot bless a spelling the join would not produce.

/** The pane's registry, asserted to be one. */
function sentenceRegistry(api) {
  const registry = api.PANE_SENTENCES;
  assert.ok(
    Array.isArray(registry) && registry.length > 0,
    `sentence-registry: the pane must enumerate its own sentences in PANE_SENTENCES, because a sentence outside it is one no pin can hold; the module exports ${JSON.stringify(registry)}`,
  );
  return registry;
}

/** The label a line carries: everything before its first `: `. */
function renderedLabel(line) {
  const at = line.indexOf(': ');
  return at < 0 ? line : line.slice(0, at);
}

/** The label one registry entry's text carries, read off the text so the two cannot disagree. */
function registryLabel(entry) {
  return renderedLabel(entry.text);
}

/**
 * The value each slot of one parameterised entry is filled with, read from the join's own answers: the
 * code the digest lacks, and the two spellings a folded match produced.
 */
function slotValues(api, entry) {
  if (entry.id === 'no-digest-entry') {
    const absent = joinedAnswer().findings.find(
      (finding) => finding.reason === api.NO_DIGEST_ENTRY,
    );
    assert.ok(
      typeof absent?.code === 'string',
      'sentence-registry: the join must answer a code the digest lacks, or the no-digest-entry sentence cannot be filled and this pin would read a hole',
    );
    return { code: absent.code };
  }
  if (
    entry.id === 'case-difference' ||
    entry.id === 'case-difference-no-title'
  ) {
    // Both wordings name the same two spellings: the titled row's and the titleless row's are the same
    // fold, stated with and without the title claim, so the values are read from the answer of the
    // shape the entry is worded for.
    const answer =
      entry.id === 'case-difference' ? foldedAnswer() : titlelessFoldedAnswer();
    const folded = answer.findings[0];
    assert.ok(
      typeof folded?.carriedCode === 'string' &&
        typeof folded.code === 'string' &&
        folded.carriedCode !== folded.code,
      `sentence-registry: the join must answer a folded match with two spellings for ${JSON.stringify(entry.id)}, or this sentence cannot be filled and this pin would read a hole`,
    );
    return { carriedCode: folded.carriedCode, digestCode: folded.code };
  }
  assert.deepEqual(
    [...entry.slots],
    [],
    `sentence-registry: the entry ${JSON.stringify(entry.id)} states the slot(s) ${JSON.stringify([...entry.slots])} and this suite fills none of them, so the text it reads would carry a hole; a new slot needs a value here before a pin can read the sentence`,
  );
  return {};
}

/** One registry entry's text with its slots filled, exactly as the pane must render it. */
function registryText(api, entry) {
  const values = slotValues(api, entry);
  let text = entry.text;
  for (const slot of entry.slots)
    text = text.split(`{${slot}}`).join(values[slot]);
  return text;
}

/**
 * T019/AC1: the registry is a registry — each id once, each entry a labelled sentence whose label is
 * the state word it answers where it answers one, each slot a hole its own text states, and the three
 * state sentences keyed to the join's three states in the join's order. A table that repeated an id,
 * stated a slot it never used, or labelled a line with a word the module does not answer would be a
 * registry that could not be held to the output at all.
 */
function pinTheRegistryIsWellFormed(api) {
  const registry = sentenceRegistry(api);
  const ids = registry.map((entry) => entry.id);
  assert.deepEqual(
    [...new Set(ids)],
    ids,
    `sentence-registry: each sentence is registered once; the ids are ${JSON.stringify(ids)}`,
  );
  for (const entry of registry) {
    assert.match(
      String(entry.id),
      /^[a-z][a-z-]*$/,
      `sentence-registry: the id ${JSON.stringify(entry.id)} must be a kebab-case name, so a pin can name the entry it reads`,
    );
    const label = registryLabel(entry);
    assert.match(
      label,
      /^[a-z][a-z-]*$/,
      `sentence-registry: the entry ${JSON.stringify(entry.id)} must state a labelled sentence — "label: text" — because every line the pane renders is a labelled fact; its text is ${JSON.stringify(entry.text)}`,
    );
    const holes = [...String(entry.text).matchAll(/\{([a-zA-Z]+)\}/g)]
      .map((match) => match[1])
      .sort();
    assert.deepEqual(
      holes,
      [...entry.slots].sort(),
      `sentence-registry: the entry ${JSON.stringify(entry.id)} states the slot(s) ${JSON.stringify([...entry.slots])} and its text carries ${JSON.stringify(holes)}; a slot is a hole in the text and nowhere else`,
    );
    assert.ok(
      entry.state === null || typeof entry.state === 'string',
      `sentence-registry: the entry ${JSON.stringify(entry.id)} must state the state word it answers or null; it states ${JSON.stringify(entry.state)}`,
    );
    if (entry.state !== null)
      assert.equal(
        label,
        entry.state,
        `sentence-registry: the entry ${JSON.stringify(entry.id)} answers the state word ${JSON.stringify(entry.state)} and its line is labelled ${JSON.stringify(label)}, so a reader would read one state and the pane report another`,
      );
  }
  assert.deepEqual(
    registry
      .filter((entry) => entry.state !== null)
      .map((entry) => entry.state),
    [...api.STATES],
    `sentence-registry: the state sentences are the join's three states in its own order; the registry carries ${JSON.stringify(registry.filter((entry) => entry.state !== null).map((entry) => entry.state))}`,
  );
  assert.deepEqual(
    Object.keys(api.STATE_TEXTS).sort(),
    [...api.STATES].sort(),
    `sentence-registry: the state table is the registry's state entries and nothing else; it carries ${JSON.stringify(Object.keys(api.STATE_TEXTS))}`,
  );
}

/**
 * The answers this suite hands the pane so that every branch it can take is taken, each named by what
 * it reaches. The registry's two directions both run over this list. A sentence rendered on a branch
 * no answer here reaches would be invisible to both, which is what the module's source pin is for.
 */
const PANE_ANSWERS = [
  [
    'a joined answer of three diagnostics, one per digest case',
    () => joinedAnswer(),
  ],
  [
    'a capture that was read and carried no diagnostic',
    () => capturedNothingAnswer(),
  ],
  ['no capture handed to the join at all', () => noDiagnosticsAnswer()],
  ['no answer at all', () => undefined],
  ['an answer that carried no state word', () => ({ findings: [] })],
  [
    'a joined answer that carried no finding',
    () => ({ state: SURFACE.JOINED, findings: [] }),
  ],
  ['a code the digest matched only by folding case', () => foldedAnswer()],
  [
    'a code the digest matched only by folding case, with no title in the digest',
    () => titlelessFoldedAnswer(),
  ],
  [
    'a list entry that is not a finding',
    () => ({ state: SURFACE.JOINED, findings: ['not a finding'] }),
  ],
  [
    'a finding the digest carries no title for',
    () => ({
      state: SURFACE.JOINED,
      findings: [{ text: 'NG0100: no title beside it', code: MATCHED.code }],
    }),
  ],
  [
    'a reason the join was not written for',
    () => ({
      state: SURFACE.JOINED,
      findings: [
        {
          text: 'NG0100: a reason beside it',
          code: MATCHED.code,
          title: shippedTitle(MATCHED.code),
          reason: 'a-reason-the-join-does-not-state',
        },
      ],
    }),
  ],
  ['a word the pane was not written for', () => ({ state: 'wedged' })],
  [
    'a finding carrying a cause, an element, a remedy, a component and a count',
    () => fattenedAnswer(),
  ],
];

/**
 * The lines one answer is allowed to write through the pane beside the registry: its state word, and
 * the four fields a finding carries. They are the answer's words and not this pane's, which is the
 * same exemption the prohibitions use.
 */
function answerFacts(answer) {
  const facts = new Set();
  if (answer === null || typeof answer !== 'object') return facts;
  if (typeof answer.state === 'string') facts.add(`state: ${answer.state}`);
  for (const finding of Array.isArray(answer.findings) ? answer.findings : []) {
    if (finding === null || typeof finding !== 'object') continue;
    if (typeof finding.text === 'string') facts.add(`text: ${finding.text}`);
    if (typeof finding.code === 'string') facts.add(`code: ${finding.code}`);
    if (typeof finding.title === 'string') facts.add(`title: ${finding.title}`);
    if (
      typeof finding.reason === 'string' &&
      finding.reason !== SURFACE.NO_DIGEST_ENTRY
    )
      facts.add(`reason: ${finding.reason}`);
  }
  return facts;
}

/**
 * T019/AC1, one direction: every entry of the registry is reachable. An answer in `PANE_ANSWERS`
 * renders the entry's exact text, and a state sentence renders on its own state's surface and never
 * beside another. An entry no answer renders is a sentence the pane states and never writes, which is
 * what a registry that had drifted from the pane would look like.
 */
function pinEveryRegistryEntryRenders(api) {
  const rendered = PANE_ANSWERS.map(([reaches, answer]) => [
    reaches,
    api.consolePanel(answer()),
  ]);
  for (const entry of sentenceRegistry(api)) {
    const text = registryText(api, entry);
    const reaches = rendered
      .filter(([, surface]) => paneWrittenLines(surface).includes(text))
      .map(([reaches]) => reaches);
    assert.ok(
      reaches.length > 0,
      `registry-reach: the registry states ${JSON.stringify(entry.id)} as ${JSON.stringify(text)}, and no answer this suite hands the pane renders it, so the registry carries a sentence the pane never writes; the pane rendered ${JSON.stringify(rendered.map(([reaches, surface]) => [reaches, surface.lines]))}`,
    );
    for (const [reaches, surface] of rendered)
      if (entry.state !== null && paneWrittenLines(surface).includes(text))
        assert.equal(
          surface.state,
          entry.state,
          `registry-reach: the registry states ${JSON.stringify(entry.id)} as the ${JSON.stringify(entry.state)} sentence, and it rendered on the ${JSON.stringify(surface.state)} surface (${reaches}); a reader would read a state the answer did not carry`,
        );
    console.log(`registry entry ${entry.id} renders: ${reaches.join('; ')}`);
  }
}

/**
 * T019/AC1, the other direction: no rendered pane-written line falls outside the registry. A line
 * that is a labelled fact the answer carried is allowed, because its words are the answer's; anything
 * else must be an entry of the registry, and the failure names the line it read.
 */
function pinNoRenderedLineIsOutsideTheRegistry(api) {
  const registry = sentenceRegistry(api);
  const registryTexts = new Set(
    registry.map((entry) => registryText(api, entry)),
  );
  for (const [reaches, answer] of PANE_ANSWERS) {
    const value = answer();
    const surface = api.consolePanel(value);
    const facts = answerFacts(value);
    for (const line of paneWrittenLines(surface)) {
      if (facts.has(line)) continue;
      assert.ok(
        registryTexts.has(line),
        `renders-from-the-registry: the ${JSON.stringify(surface.state)} surface rendered the line ${JSON.stringify(line)} (${reaches}), and that line is neither a labelled fact the answer carried nor an entry of PANE_SENTENCES — every sentence the pane writes for itself is a registry entry, so a new sentence is an edit to the registry and not a literal beside it; the registry is ${JSON.stringify([...registryTexts])}`,
      );
    }
  }
}

/**
 * T019/AC4: the record's contract carries the pane's registry, and the two are one registry in both
 * directions — the shape `contract.lineLabels` already uses. A sentence added to the pane alone
 * reddens here naming the entry the record does not carry; a sentence the record carries and the pane
 * does not write reddens too; and an entry whose text, slots or state word differ from the pane's
 * reddens naming the field. The record suite holds the same pin against the same record, so an armed
 * re-capture cannot bless a sentence the pane does not write.
 */
function pinTheRegistryIsTheRecords(api) {
  const carried = PANEL_RECORD?.contract?.sentenceRegistry;
  assert.ok(
    Array.isArray(carried) && carried.length > 0,
    `sentence-registry: ${PANEL_RECORD_REL} must carry the pane's sentences in contract.sentenceRegistry, or the record cannot say which sentences the pane writes; its contract carries ${JSON.stringify(carried)}`,
  );
  const registry = sentenceRegistry(api);
  const named = (ids) => ids.map((id) => JSON.stringify(id)).join(', ');
  const paneIds = registry.map((entry) => entry.id);
  const recordIds = carried.map((entry) => entry.id);
  const added = paneIds.filter((id) => !recordIds.includes(id));
  assert.deepEqual(
    added,
    [],
    `sentence-registry: the pane states ${added.length} sentence(s) the record's contract.sentenceRegistry does not carry: ${named(added)} — the record states the sentences the pane writes, so an entry added to the pane alone is drift, and a sentence cannot be rendered until the record carries it too; the record would have to carry ${named(paneIds)}`,
  );
  const missing = recordIds.filter((id) => !paneIds.includes(id));
  assert.deepEqual(
    missing,
    [],
    `sentence-registry: the record's contract.sentenceRegistry carries ${missing.length} sentence(s) the pane does not write: ${named(missing)} — the record cannot bless a sentence the pane has no entry for; the pane states ${named(paneIds)}`,
  );
  for (const entry of registry) {
    const copy = carried.find((candidate) => candidate.id === entry.id);
    assert.deepEqual(
      Object.keys(copy).sort(),
      ['id', 'slots', 'state', 'text'],
      `sentence-registry: the record's copy of ${JSON.stringify(entry.id)} carries the field(s) ${JSON.stringify(Object.keys(copy).sort())}, and a registry entry is an id, its text, its slots and its state word`,
    );
    for (const field of ['text', 'slots', 'state'])
      assert.deepEqual(
        copy[field],
        entry[field],
        `sentence-registry: the record's copy of ${JSON.stringify(entry.id)} states the ${field} ${JSON.stringify(copy[field])}, and the pane states ${JSON.stringify(entry[field])} — the record states the sentences the pane writes, so the two are one registry or they are not`,
      );
  }
}

// ------------------------------------------------- the join's reason vocabulary (T022) ----
//
// Wave 3's cycle-5 review attacked the sentence registry with 23 mutations and found one channel every
// pin in both suites left open: a `reason:` value the join supplies. A finding carrying
// `reason: "the page was silent; to fix this, edit the element"` rendered as-is, because this suite's
// prohibitions and the registry's reach both treat "the answer's words" as carried — the finding's
// `text`, `code`, `title` and `reason` are somebody else's words, and only what the *pane* writes is
// policed. The same holds for a `state` word taken from the answer: an unknown word renders as
// `state: <word>` and nothing else.
//
// That exemption is right for `text` (the capture's string) and `title` (the digest's), and it stays
// exactly as it was: the positive cases below hand the pane a digest title that states "element" and a
// captured message that says "because", and neither is refused. What changes is the join's *own*
// vocabulary: `reason` is the one field of a finding this module writes itself, so the join enumerates
// it (`REASONS`, in `extension/console-join.js`) and this suite holds the two sets to each other in
// both directions —
//
//   join-to-pane   every reason the join can state is one this pane renders as a known absence, an
//                  entry of `PANE_SENTENCES` labelled with the reason itself;
//   answer-to-set  an answer whose `reason` or `state` is outside those closed sets is refused by
//                  name, rather than accepted as an answer this suite renders.
//
// The limit is stated where it lies: the pane still echoes a word it is handed by hand (it renders
// `state: wedged` and `reason: …`, which `pinGivenStates` and the `PANE_ANSWERS` probes pin on
// purpose), and no pane edit is in this task's gift. What refuses the channel is the enumeration plus
// `pinAnswerVocabularyIsClosed`: no answer the join can give carries a word outside the sets, and an
// answer that does is refused naming the word instead of being read as the join's.

/**
 * T022, one direction: every reason the join can state is one this pane renders as a known absence.
 *
 * For each entry of the join's `REASONS`, the pane is handed the answer the join gives for a code the
 * digest lacks — `code` named, `reason` the entry — and the pane must render the registry sentence
 * whose own label is that reason, with its slot filled. A reason with no such entry is a word the pane
 * would print under a `reason:` label of its own (the channel the review found), so it reddens here
 * naming the reason. The join is a parameter so a mutated copy can be held to the same pin, which is
 * how the direction is proven live.
 */
function pinEveryJoinReasonIsAKnownAbsence(api, join = JOIN) {
  const reasons = join.REASONS;
  assert.ok(
    Array.isArray(reasons) && reasons.length > 0,
    `reason-vocabulary: extension/console-join.js must enumerate the reasons it can state in REASONS, or the pane can be written against no set at all; it exports ${JSON.stringify(reasons)}`,
  );
  const registry = sentenceRegistry(api);
  for (const reason of reasons) {
    const entry = registry.find(
      (candidate) => registryLabel(candidate) === reason,
    );
    assert.ok(
      entry,
      `reason-vocabulary: the join states the reason ${JSON.stringify(reason)}, and this pane has no registry sentence labelled ${JSON.stringify(reason)} — a reason no entry answers is a word the pane prints as ${JSON.stringify(`reason: ${reason}`)} under its own label, which the carried-value exemption leaves unpoliced, so it is refused here rather than rendered; the pane states ${JSON.stringify(registry.map(registryLabel))}`,
    );
    const text = registryText(api, entry);
    const answer = {
      state: SURFACE.JOINED,
      findings: [
        {
          text: `${UNMATCHED.code}: a code the digest lacks, with the join's reason beside it`,
          code: UNMATCHED.code,
          reason: reason,
        },
      ],
    };
    const surface = api.consolePanel(answer);
    assert.ok(
      surface.lines.includes(text),
      `reason-vocabulary: the reason ${JSON.stringify(reason)} must render as the pane's known absence — ${JSON.stringify(text)} — so every reason the join can state has a sentence the surface states; the pane rendered ${JSON.stringify(surface.lines)}`,
    );
    assert.equal(
      surface.lines.includes(`reason: ${reason}`),
      false,
      `reason-vocabulary: a reason the pane has a sentence for is rendered as that sentence and never echoed as the raw line ${JSON.stringify(`reason: ${reason}`)}; the pane rendered ${JSON.stringify(surface.lines)}`,
    );
  }
}

/**
 * T022, the other direction: an answer whose `state` or `reason` is outside the closed sets is refused
 * by name rather than rendered.
 *
 * The two sets are the pane's three state words (`STATES`, each with a sentence of its own) and the
 * join's enumerated reasons (`REASONS`). A state word outside the first renders as `state: <word>` and
 * nothing else, and a reason outside the second prints under a `reason:` label — both are a word taken
 * from the answer reaching the surface through a channel the pane's prohibitions exempt, which is what
 * this pin refuses. `text`, `code`, `title` and `carriedCode` are not read: they are the capture's,
 * the digest's and the message's words by contract, and the exemption for them is not touched here.
 */
function pinAnswerVocabularyIsClosed(answer) {
  assert.ok(
    answer !== null && typeof answer === 'object',
    `answer-vocabulary: an answer is an object with a state word; it is ${JSON.stringify(answer)}`,
  );
  const states = SURFACE.STATES;
  assert.ok(
    states.includes(answer.state),
    `answer-vocabulary: the answer carried the state ${JSON.stringify(answer.state)}, and the pane has a sentence for ${JSON.stringify([...states])} and for no other word — a state word taken from the answer is rendered as ${JSON.stringify(`state: ${answer.state}`)} and nothing else, so this answer is refused rather than rendered`,
  );
  const reasons = JOIN.REASONS;
  for (const finding of Array.isArray(answer.findings) ? answer.findings : []) {
    if (finding === null || typeof finding !== 'object') continue;
    if (!('reason' in finding)) continue;
    assert.ok(
      reasons.includes(finding.reason),
      `answer-vocabulary: the answer's finding carried the reason ${JSON.stringify(finding.reason)}, and the join states only ${JSON.stringify([...reasons])} — a reason outside that list is prose the pane would print under its own "reason:" label, which the carried-value exemption leaves unpoliced, so this answer is refused rather than rendered`,
    );
  }
}

/**
 * T022: the two sets closed, both directions proven live, and the review's two constructions measured.
 *
 * Green first, then armed: the shipped join's reasons all render as known absences and the answers it
 * really gives are all in vocabulary; a join that enumerates a reason the pane has no sentence for
 * reddens naming it; the joined answer that carries a page claim as its `reason` reddens naming the
 * claim, after the existing prohibitions are shown to pass it (the exemption, measured); and the answer
 * that carries a page claim as its `state` reddens naming the word. Last, the exemption itself: a
 * digest title stating "element" and a captured message saying "because" stay in vocabulary, which is
 * what keeps this pin from becoming a second, wider set of prohibitions.
 */
function pinTheJoinedVocabularyIsClosed() {
  pinEveryJoinReasonIsAKnownAbsence(SURFACE);
  for (const answer of [
    joinedAnswer(),
    foldedAnswer(),
    capturedNothingAnswer(),
    noDiagnosticsAnswer(),
  ])
    pinAnswerVocabularyIsClosed(answer);

  // (1) A join that enumerates a reason this pane has no sentence for: the join-to-pane direction is
  // refused naming the word, rather than rendered as a `reason:` line.
  const unrendered = 'the-page-was-silent';
  const enumerated = joinMutant(
    "  const REASONS = Object.freeze(['no-digest-entry']);",
    `  const REASONS = Object.freeze(['no-digest-entry', ${JSON.stringify(unrendered)}]);`,
  );
  assert.ok(
    enumerated.api.REASONS.includes(unrendered),
    `the mutant join must really enumerate ${JSON.stringify(unrendered)}, or this probe proves nothing`,
  );
  const onUnrendered = reddens('reason-vocabulary', () =>
    pinEveryJoinReasonIsAKnownAbsence(SURFACE, enumerated.api),
  );
  assert.ok(
    onUnrendered.message.includes(unrendered),
    `the pin must name the reason it refused; it failed with ${onUnrendered.message}`,
  );

  // (2) The review's first construction: a `reason` carrying a page claim, supplied by the join. The
  // existing pins are measured green on it first, so what reddens below is the new one and not a pin
  // that was already covering the channel.
  const pageClaim = 'the page was silent; to fix this, edit the element';
  const claimJoin = joinMutant(
    'findings.push({ text: text, code: code, reason: NO_DIGEST_ENTRY });',
    `findings.push({ text: text, code: code, reason: ${JSON.stringify(pageClaim)} });`,
  );
  const claimAnswer = clone(claimJoin.api.consoleJoin([UNMATCHED], DIGEST));
  assert.equal(
    claimAnswer.findings[0].reason,
    pageClaim,
    `the mutant join must really state the page claim as its reason, or this construction proves nothing; it answered ${JSON.stringify(claimAnswer.findings[0])}`,
  );
  const claimSurface = SURFACE.consolePanel(claimAnswer);
  assert.ok(
    claimSurface.lines.includes(`reason: ${pageClaim}`),
    `the construction reaches the surface under a "reason:" label — that is the channel the review found; the pane rendered ${JSON.stringify(claimSurface.lines)}`,
  );
  pinNoCauseElementRemedy(claimSurface, claimAnswer);
  pinNoAbsenceClaimsSilence(claimSurface);
  const onClaim = reddens('answer-vocabulary', () =>
    pinAnswerVocabularyIsClosed(claimAnswer),
  );
  assert.ok(
    onClaim.message.includes(pageClaim),
    `the pin must name the reason it refused; it failed with ${onClaim.message}`,
  );

  // (3) The review's second construction: a `state` word taken from the answer. The pane renders it as
  // `state: <word>` and stops, so the claim is on the surface under the state's own label — measured,
  // then refused naming the word.
  const spokenState = 'the page was silent';
  const stateJoin = joinMutant(
    "  const NO_DIAGNOSTICS = 'no-diagnostics';",
    `  const NO_DIAGNOSTICS = ${JSON.stringify(spokenState)};`,
  );
  const stateAnswer = clone(stateJoin.api.consoleJoin(undefined, DIGEST));
  assert.equal(
    stateAnswer.state,
    spokenState,
    `the mutant join must really answer with the word ${JSON.stringify(spokenState)}, or this construction proves nothing`,
  );
  const stateSurface = SURFACE.consolePanel(stateAnswer);
  assert.deepEqual(
    [...stateSurface.lines],
    [`state: ${spokenState}`],
    `the construction reaches the surface as the state word itself and nothing else, which is the second channel the review found; the pane rendered ${JSON.stringify(stateSurface.lines)}`,
  );
  pinNoAbsenceClaimsSilence(stateSurface);
  const onState = reddens('answer-vocabulary', () =>
    pinAnswerVocabularyIsClosed(stateAnswer),
  );
  assert.ok(
    onState.message.includes(spokenState),
    `the pin must name the state it refused; it failed with ${onState.message}`,
  );

  // (4) The carried-value exemption is untouched: only the join's own vocabulary is closed, so a digest
  // title that states "element" and a captured message that says "because" are in vocabulary however
  // they read — policing them is what the prohibitions already refuse to do, for the good reason that
  // they are the answer's words and not the pane's.
  assert.match(
    String(shippedTitle('NG0910')),
    /\belement\b/i,
    `the positive case needs a shipped digest title that states a prohibited word; ${JSON.stringify(shippedTitle('NG0910'))} does not`,
  );
  pinAnswerVocabularyIsClosed({
    state: SURFACE.JOINED,
    findings: [
      {
        text: 'NG0910: unsanitized HTML was stripped because the binding bypassed the sanitizer',
        code: 'NG0910',
        title: shippedTitle('NG0910'),
      },
    ],
  });

  console.log(
    `join reason vocabulary: ${JSON.stringify(JOIN.REASONS)} is one set with the pane's absence sentences; a join reason outside it is refused: ${onUnrendered.message.replace(/\s+/g, ' ').trim()}`,
  );
  console.log(
    `answer vocabulary: a page claim as the reason is refused: ${onClaim.message.replace(/\s+/g, ' ').trim()}; as the state: ${onState.message.replace(/\s+/g, ' ').trim()}`,
  );
}

/** The pane's source with its comments taken out, so a sentence quoted in prose is not read as a line. */
function codeWithoutComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
}

/** The labels whose value is a labelled fact of the answer, and so not a sentence of this pane's. */
const CARRIED_LABELS = ['state', 'code', 'title', 'text', 'reason'];

/**
 * T019/AC1: the pane renders from the registry and from nothing else, read off its own source. The
 * registry's own entries are cut out of the source first; every other string in the module that opens
 * a labelled line — `'no-code: …'`, `` `cause: ${cause}` `` — is then read, and the only labels allowed
 * there are the five whose value is a fact the answer carried. So a sentence written beside the
 * registry reddens with the label and the text around it, even when it is the registry's own wording
 * copied out — which the rendered-output pins could not see, because such a line is a registry text.
 */
function pinOnlyTheRegistryWritesSentences(source) {
  const code = codeWithoutComments(source);
  const open = code.indexOf('export const PANE_SENTENCES');
  assert.ok(
    open >= 0,
    'renders-from-the-registry: the pane must declare its sentence registry as `export const PANE_SENTENCES`, or this pin reads a file that has no registry in it',
  );
  const close = code.indexOf('\n];', open);
  assert.ok(
    close > open,
    'renders-from-the-registry: the registry must end with a closing `];`, or this pin would cut the module at the wrong place',
  );
  const body = `${code.slice(0, open)}${code.slice(close)}`;
  const written = [...body.matchAll(/(['"`])([a-z][a-z-]*): /g)];
  const labels = new Set(written.map((match) => match[2]));
  for (const label of CARRIED_LABELS)
    assert.ok(
      labels.has(label),
      `renders-from-the-registry: the scan must read the pane's own labelled lines, and it found none labelled ${JSON.stringify(label)}; it read ${JSON.stringify([...labels])}`,
    );
  for (const match of written) {
    assert.ok(
      CARRIED_LABELS.includes(match[2]),
      `renders-from-the-registry: the pane writes the sentence labelled ${JSON.stringify(match[2])} in its own body (${JSON.stringify(body.slice(Math.max(0, match.index - 40), match.index + 80).replace(/\s+/g, ' '))}), and every sentence the pane writes for itself is an entry of PANE_SENTENCES — a sentence's text lives in the registry, so the wording belongs there and not beside it`,
    );
  }
  return written;
}

/**
 * The four sentences wave 3's cycle-4 review measured passing the absence rule and then blessed into
 * the recording by an armed capture, and what each of them states. Each keeps a read subject and a
 * read action in place and puts the claim about the page beside them, which is why a matcher that
 * decides a clause by its first matching token cannot see any of them.
 */
const REVIEW_EVASIONS = [
  [
    "the capture reflects the page's silence",
    'a possessive nominalisation: the page is named in a possessive the rule\'s word list does not carry, and the clause\'s verb is decided by "capture"',
  ],
  [
    'no diagnostic was reported',
    'an agentless passive whose participle is one of the read actions, so the agent it elides is never read',
  ],
  [
    'this is never a claim that the page was silent, and it rendered nothing',
    'a lawful denial in the first clause, and a pronoun in the second that stands because "rendered" is a pane action',
  ],
  [
    'the capture was not empty before the page ran clean',
    'a denial about the capture, which the rule takes to govern the page word after it',
  ],
];

/**
 * T019/AC2 and item 5 of the task: each of the review's four evasions is refused by construction, and
 * both halves are measured on the pane's own source in this run's temp directory.
 *
 *   (a) rendered without a registry entry — a literal pushed beside the state sentence — the output
 *       pin refuses it and names the line, and the module's own source pin refuses the literal too. So
 *       the sentence cannot reach a surface without an edit to `PANE_SENTENCES`.
 *   (b) added to the registry, the record's copy refuses it: the pane states a sentence
 *       `contract.sentenceRegistry` does not carry, and the failure names the entry and both texts. The
 *       record has to carry it as well — a deliberate edit a reviewer sees — and the record suite
 *       refuses the same disagreement from its own side.
 *
 * The rule's reach is measured beside each, because the honest statement of why these are refused is
 * the enumeration and not the matcher: if the rule were later widened to catch one of them, this pin
 * would redden and the settlement in this file would have to be re-worded.
 */
async function pinTheReviewEvasionsAreRefused(api) {
  const rule = absenceRule();
  for (const [evasion, what] of REVIEW_EVASIONS) {
    const line = `${api.NO_DIAGNOSTICS}: ${evasion}`;
    assert.deepEqual(
      absenceBreaches(absenceBody(line), rule),
      [],
      `the review's evasion ${JSON.stringify(evasion)} is refused by the enumeration and not by the absence rule, and the rule's reach is measured here rather than claimed: if this reddens, the matcher has been widened and this file's settlement has to say so`,
    );
    // (a) rendered without a registry entry.
    const rendered = await loadMutant(
      '  lines.push(sentence);',
      `  lines.push(sentence);\n  lines.push(${JSON.stringify(line)});`,
    );
    assert.equal(
      rendered.module.consolePanel(noDiagnosticsAnswer()).lines.includes(line),
      true,
      `the mutant must really render ${JSON.stringify(line)}, or this probe proves nothing`,
    );
    const onSurface = reddens('renders-from-the-registry', () =>
      pinNoRenderedLineIsOutsideTheRegistry(rendered.module),
    );
    assert.ok(
      onSurface.message.includes(line),
      `the pin must name the line it read; it failed with ${onSurface.message}`,
    );
    const onSource = reddens('renders-from-the-registry', () =>
      pinOnlyTheRegistryWritesSentences(rendered.source),
    );
    assert.ok(
      onSource.message.includes(`"${api.NO_DIAGNOSTICS}"`),
      `the source pin must name the label the literal carries; it failed with ${onSource.message}`,
    );
    // (b) added to the registry, which the record's own copy refuses.
    const added = await loadMutant(
      "    text: 'no-diagnostics: no capture was handed to the join at all, so no capture was read',",
      `    text: ${JSON.stringify(line)},`,
    );
    assert.equal(
      added.module.PANE_SENTENCES.find(
        (entry) => entry.id === 'state-no-diagnostics',
      ).text,
      line,
      `the mutant must really register ${JSON.stringify(line)}, or this probe proves nothing`,
    );
    const onRecord = reddens('sentence-registry', () =>
      pinTheRegistryIsTheRecords(added.module),
    );
    assert.ok(
      onRecord.message.includes(line),
      `the record's pin must name the sentence the record does not carry; it failed with ${onRecord.message}`,
    );
    console.log(
      `the review's evasion is refused by construction: ${JSON.stringify(evasion)} — ${what}; without an entry: ${onSurface.message.replace(/\s+/g, ' ').trim()}; with one: ${onRecord.message.replace(/\s+/g, ' ').trim()}`,
    );
  }
}

/**
 * T019/AC5: `the digest states the page's silence` — the wording the absence rule lost when it
 * replaced the older phrase list — is settled here, and the settlement is *impossible to render*, not
 * *refused by the rule*:
 *
 *   · the rule alone reads it and passes it (measured below on the rule's own vocabulary), because
 *     `digest` is both a read subject and a read action and `page's` is not a word the rule carries;
 *   · a pane that renders it as a literal is refused by the output pin, which names the line, and by
 *     the source pin, which names the label — so it cannot reach a surface without an edit to
 *     `PANE_SENTENCES`;
 *   · that edit is refused until the record carries the same sentence, in both suites.
 *
 * So the sentence needs a deliberate, reviewable change to two files and no wording of it can slip
 * past a matcher. This test says which of the acceptance criterion's two answers applies instead of
 * letting a reader assume the classifier sees the sentence.
 */
async function pinTheDigestSilenceSentenceIsSettled(api) {
  const sentence = "the digest states the page's silence";
  const line = `${api.NO_DIAGNOSTICS}: ${sentence}`;
  assert.deepEqual(
    absenceBreaches(absenceBody(line), absenceRule()),
    [],
    `the digest sentence is settled as impossible to render and not as refused by the absence rule: the rule passes ${JSON.stringify(sentence)}, because "digest" is both a read subject and a read action and "page's" is not a word it carries. If this reddens, the rule has been widened and this settlement must say "refused by the rule" instead`,
  );
  const rendered = await loadMutant(
    '  lines.push(sentence);',
    `  lines.push(sentence);\n  lines.push(${JSON.stringify(line)});`,
  );
  const onSurface = reddens('renders-from-the-registry', () =>
    pinNoRenderedLineIsOutsideTheRegistry(rendered.module),
  );
  assert.ok(
    onSurface.message.includes(line),
    `the pin must name the line it read; it failed with ${onSurface.message}`,
  );
  const added = await loadMutant(
    "    text: 'no-diagnostics: no capture was handed to the join at all, so no capture was read',",
    `    text: ${JSON.stringify(line)},`,
  );
  const onRecord = reddens('sentence-registry', () =>
    pinTheRegistryIsTheRecords(added.module),
  );
  assert.ok(
    onRecord.message.includes(line),
    `the record's pin must name the sentence the record does not carry; it failed with ${onRecord.message}`,
  );
  console.log(
    `the digest sentence is impossible to render and not refused by the rule: ${JSON.stringify(sentence)}; without an entry: ${onSurface.message.replace(/\s+/g, ' ').trim()}`,
  );
}

/**
 * T021: the join used to append ` (this message carried no code)` to the captured text, so the pane
 * said the absence twice — once in its own `no-code:` sentence and once inside a string it claimed to
 * quote verbatim. The join now reports the capture's string byte for byte, and this pin proves the
 * removal loses nothing the surface showed: the pane's absence sentence is byte-identical with and
 * without the old note, the two surfaces differ in exactly the one `text:` line, and a coded finding
 * whose text happens to contain the note-shaped wording still gets no no-code sentence — the sentence
 * is selected by the finding having no `code`, never by the words in its text.
 */
function pinTheRemovedNoteLosesNothing(surface, answer) {
  const bare = answer.findings.find(
    (finding) => typeof finding.code !== 'string',
  );
  assert.ok(
    bare,
    'the fixture must carry a finding with no code, or this pin proves nothing',
  );
  assert.equal(
    bare.text,
    UNCODED.message,
    `the captured text is rendered verbatim: the join reports ${JSON.stringify(UNCODED.message)} for a message that carried no code, and the pane must render it without a note appended; it rendered ${JSON.stringify(bare.text)}`,
  );
  const textLines = surface.lines.filter((line) => line.startsWith('text: '));
  assert.ok(
    textLines.includes(`text: ${UNCODED.message}`),
    `the pane renders the captured text verbatim: ${JSON.stringify(`text: ${UNCODED.message}`)} must be a line; it rendered ${JSON.stringify(surface.lines)}`,
  );
  assert.equal(
    textLines.some((line) => line.includes('carried no code')),
    false,
    `the pane states the absence in its own sentence and never inside the string it quotes: no text line may carry the join's old note; it rendered ${JSON.stringify(textLines)}`,
  );
  const statements = surface.lines.filter((line) =>
    line.startsWith(`${SURFACE.NO_CODE}: `),
  );
  assert.deepEqual(
    statements,
    [SURFACE.NO_CODE_TEXT],
    `the pane states the absence once, in its own no-code sentence; it rendered ${JSON.stringify(statements)}`,
  );
  // The answer the join used to give for the same capture: the note, in the one finding that carried
  // no code. Nothing but that text line may move, because the pane selects its sentence by the
  // missing `code`.
  const previous = clone(answer);
  const index = previous.findings.findIndex(
    (finding) => typeof finding.code !== 'string',
  );
  previous.findings[index] = {
    ...previous.findings[index],
    text: `${UNCODED.message} (this message carried no code)`,
  };
  const previousSurface = SURFACE.consolePanel(previous);
  assert.deepEqual(
    previousSurface.lines.filter((line) =>
      line.startsWith(`${SURFACE.NO_CODE}: `),
    ),
    statements,
    "the pane's own no-code sentence is selected by the finding having no code, not by the note: it is byte-identical with the old answer, so removing the note loses nothing the surface showed",
  );
  const at = surface.lines.lastIndexOf(`text: ${UNCODED.message}`);
  assert.deepEqual(
    previousSurface.lines,
    surface.lines.map((line, position) =>
      position === at
        ? `text: ${UNCODED.message} (this message carried no code)`
        : line,
    ),
    `the two surfaces differ in exactly the captured text line and nowhere else, so the note added no information the pane does not state in its own sentence; the old answer rendered ${JSON.stringify(previousSurface.lines)} and the new one ${JSON.stringify(surface.lines)}`,
  );
  // And the sentence is not selected by the note-shaped wording: a coded finding whose text carries
  // the same words renders no no-code sentence at all.
  const coded = {
    state: SURFACE.JOINED,
    findings: [
      {
        text: `${UNCODED.message} (this message carried no code)`,
        code: MATCHED.code,
        title: shippedTitle(MATCHED.code),
      },
    ],
  };
  const codedSurface = SURFACE.consolePanel(coded);
  assert.equal(
    codedSurface.lines.some((line) => line.startsWith(`${SURFACE.NO_CODE}: `)),
    false,
    `the no-code sentence is selected by the finding having no code, never by the words in its text; the pane rendered ${JSON.stringify(codedSurface.lines)}`,
  );
  assert.ok(
    codedSurface.lines.includes(
      `text: ${UNCODED.message} (this message carried no code)`,
    ),
    "the pane renders a coded finding's text verbatim, note-shaped or not, because that string is the answer's word and not the pane's sentence",
  );
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
  it('AC1/E6: the state and every finding, field for field, and nothing else', () => {
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
        `text: ${UNCODED.message}`,
      ],
      'the pane renders the state, then one block per finding in capture order, and nothing beside them',
    );
    console.log(`console pane: ${JSON.stringify(surface.lines)}`);

    // E6, beside AC1's rule because it is that rule on a code the join matched by folding case: the
    // join's own answer for the folded diagnostic, rendered as the digest carries it, with one
    // sentence of the pane's own naming both spellings — and held to the same prohibitions.
    const folded = foldedAnswer();
    const foldedSurface = SURFACE.consolePanel(folded);
    const foldedFinding = folded.findings[0];
    assert.equal(foldedFinding.code, 'NG01002');
    assert.equal(foldedFinding.carriedCode, FOLDED.code);
    assert.equal(shippedTitle(foldedFinding.code), foldedFinding.title);
    assert.equal(
      DIGEST.entries.some((entry) => entry.code === FOLDED.code),
      false,
      `the shipped digest must carry no ${FOLDED.code}, or the fold is not what decided the match`,
    );
    pinCaseDifferenceIsNamed(foldedSurface, folded);
    pinRendersTheAnswerAndNothingElse(foldedSurface, folded);
    pinNoCauseElementRemedy(foldedSurface, folded);
    pinNoUnattributedAngularWording(foldedSurface);
    pinNoAbsenceClaimsSilence(foldedSurface);
    pinNoModuleSentenceClaimsSilence(SURFACE);
    assert.deepEqual(
      [...foldedSurface.lines],
      [
        `state: ${SURFACE.JOINED}`,
        SURFACE.STATE_TEXTS[SURFACE.JOINED],
        `code: ${foldedFinding.code}`,
        `title: ${foldedFinding.title}`,
        SURFACE.caseFoldedMatchText(
          foldedFinding.carriedCode,
          foldedFinding.code,
        ),
        `text: ${foldedFinding.text}`,
      ],
      `case-difference: the pane renders the folded match as the digest carries it, then the one sentence naming both spellings, then the captured text; it rendered ${JSON.stringify(foldedSurface.lines)}`,
    );
    console.log(
      `console pane case-folded: ${JSON.stringify(foldedSurface.lines)}`,
    );

    // T025/AC2, the shape wave 10's review reproduced: the same fold, where the digest carries the code
    // and states no title for it. The row carries the digest's spelling and no title, so the titled
    // sentence's claim is one this surface cannot support — the pane states the absence and the
    // difference, and `pinFoldedRowWithoutTitleStatesNoTitle` holds those two sentences to each other.
    const titleless = titlelessFoldedAnswer();
    const titlelessFinding = titleless.findings[0];
    assert.deepEqual(
      TITLELESS_DIGEST.entries.find(
        (entry) => entry.code === FOLDED_DIGEST_CODE,
      ),
      { code: FOLDED_DIGEST_CODE },
      'the titleless digest must carry the code and no title, or this shape proves nothing',
    );
    assert.equal(
      Object.hasOwn(titlelessFinding, 'title'),
      false,
      `the join must carry no title for a digest entry that states none; it answered ${JSON.stringify(titlelessFinding)}`,
    );
    assert.equal(titlelessFinding.code, FOLDED_DIGEST_CODE);
    assert.equal(titlelessFinding.carriedCode, FOLDED.code);
    const titlelessSurface = SURFACE.consolePanel(titleless);
    pinFoldedRowWithoutTitleStatesNoTitle(titlelessSurface, titleless);
    pinRendersTheAnswerAndNothingElse(titlelessSurface, titleless);
    pinNoCauseElementRemedy(titlelessSurface, titleless);
    pinNoUnattributedAngularWording(titlelessSurface);
    pinNoAbsenceClaimsSilence(titlelessSurface);
    assert.deepEqual(
      [...titlelessSurface.lines],
      [
        `state: ${SURFACE.JOINED}`,
        SURFACE.STATE_TEXTS[SURFACE.JOINED],
        `code: ${titlelessFinding.code}`,
        SURFACE.NO_TITLE_TEXT,
        SURFACE.caseFoldedMatchWithoutTitleText(
          titlelessFinding.carriedCode,
          titlelessFinding.code,
        ),
        `text: ${titlelessFinding.text}`,
      ],
      `states-no-title: a folded row whose digest entry carries no title renders the digest's spelling, the absence and the difference, and no title claim; it rendered ${JSON.stringify(titlelessSurface.lines)}`,
    );
    console.log(
      `console pane case-folded without a title: ${JSON.stringify(titlelessSurface.lines)}`,
    );
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

  it('E7/SC4: every state the pane renders carries no cause, element, remedy or unattributed wording, and the two absences stay two statements', async () => {
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
    // The absence rule at the source as well as at the surface, and over the registry's own text: every
    // entry the pane states is read by the label its line carries, so a claim in `no-diagnostics`, in
    // the no-code sentence, or in an entry no answer renders reddens naming the sentence.
    pinNoModuleSentenceClaimsSilence(SURFACE);
    // And the rule itself, proved as a property rather than as the phrase list it replaced: every
    // shipped sentence passes, the wordings that list never matched redden naming the sentence and
    // the phrase, and the matcher here is the record suite's, so the two cannot drift.
    pinShippedAbsenceSentencesPass();
    pinThePhraseListMissedNothing();
    pinAbsenceRuleIsTheRecords();
    // T019: the sentences the pane writes for itself are one registry, and the pins below hold it to
    // the rendered output in both directions, to the record's own copy of it, and to the module's
    // source beside it — then measure that the four sentences wave 3's cycle-4 review found, and the
    // one the older phrase list policed, are refused by the enumeration rather than by the matcher.
    pinTheRegistryIsWellFormed(SURFACE);
    pinEveryRegistryEntryRenders(SURFACE);
    pinNoRenderedLineIsOutsideTheRegistry(SURFACE);
    pinTheRegistryIsTheRecords(SURFACE);
    pinOnlyTheRegistryWritesSentences(SURFACE_SRC);
    // T022: the one field of a finding the join writes itself is closed — every reason it can state is
    // a sentence this pane renders as a known absence, and an answer whose `reason` or `state` is
    // outside those sets is refused by name, with the review's two constructions armed below.
    pinTheJoinedVocabularyIsClosed();
    await pinTheReviewEvasionsAreRefused(SURFACE);
    await pinTheDigestSilenceSentenceIsSettled(SURFACE);
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
    // T022: the vocabulary these answers are written in is closed, and it is read here on the four
    // answers the join really gives — a `reason` that is not one of the join's own words, or a state
    // word the pane has no sentence for, reddens naming it instead of being accepted as one of the
    // join's. `pinTheJoinedVocabularyIsClosed` arms this pin with the review's two constructions.
    pinAnswerVocabularyIsClosed(answer);
    for (const other of [
      foldedAnswer(),
      capturedNothingAnswer(),
      noDiagnosticsAnswer(),
    ])
      pinAnswerVocabularyIsClosed(other);
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
    // T021: the captured text stays the capture's, and the absence is still stated — by the pane's
    // own sentence, selected by the finding carrying no code.
    pinTheRemovedNoteLosesNothing(surface, answer);
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
      'case-difference sentence',
      SURFACE.caseFoldedMatchText(FOLDED.code, 'NG01002'),
    ],
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
  // And the rule is not dead: the two wordings wave 3's cycle-4 review found still refused are still
  // refused, so what the review measured is a rule narrower than its prose rather than a matcher that
  // says nothing. `no diagnostic was emitted` states "emitted" and `nothing was emitted` leaves the
  // indeterminate standing; both redden by the clause that carries them.
  for (const control of ['no diagnostic was emitted', 'nothing was emitted']) {
    let failure = null;
    try {
      assertAbsenceStatement(
        absenceBody(`no-diagnostics: ${control}`),
        'no-diagnostics sentence',
        rule,
      );
    } catch (error) {
      failure = error;
    }
    assert.ok(
      failure instanceof Error,
      `the control ${JSON.stringify(control)} must still redden the rule, or the rule refuses nothing and the sentences it does refuse prove nothing`,
    );
    assert.match(failure.message, /absence-statement: the /);
    assert.ok(
      failure.message.includes(control),
      `the control's failure must name the wording it read; it failed with ${failure.message}`,
    );
    console.log(
      `the control is still refused: ${failure.message.replace(/\s+/g, ' ').trim()}`,
    );
  }
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
      "    id: 'no-code',",
      "    text: 'no-code: the captured message carried no code, so this finding carries no code and no title',",
    ].join('\n'),
    replacement: [
      "    id: 'no-code',",
      "    text: 'no-code: 1 captured message carried no code, so this finding carries no code and no title',",
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
    id: 'no-code-sentence-dropped',
    // T021: the join no longer writes the absence into the captured text, so the pane's own `no-code:`
    // sentence is the only place it is stated. A pane that drops that sentence loses the fact the
    // surface used to carry twice, and the pin below reddens naming the sentence it lost.
    defect: 'no-code',
    anchor: '  if (code === null) lines.push(NO_CODE_TEXT);',
    replacement: "  if (code === null) lines.push('');",
    check: (api) => {
      const answer = joinedAnswer();
      return () =>
        pinTheRemovedNoteLosesNothing(api.consolePanel(answer), answer);
    },
    exhibits: (module) =>
      assert.equal(
        module
          .consolePanel(joinedAnswer())
          .lines.includes(SURFACE.NO_CODE_TEXT),
        false,
        'the mutant really drops the pane’s no-code sentence',
      ),
    names: /no-code/,
  },
  {
    id: 'captured-nothing-claims-silence',
    defect: 'never what the page did',
    anchor: [
      "    id: 'state-captured-nothing',",
      "    text: 'captured-nothing: a capture was read and carried no diagnostic, and a capture whose own attempt failed also emits nothing, so this states what was read and never that the page was silent',",
    ].join('\n'),
    replacement: [
      "    id: 'state-captured-nothing',",
      "    text: 'captured-nothing: the page was silent, so no diagnostic was captured',",
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
      "    id: 'state-captured-nothing',",
      "    text: 'captured-nothing: a capture was read and carried no diagnostic, and a capture whose own attempt failed also emits nothing, so this states what was read and never that the page was silent',",
    ].join('\n'),
    replacement: [
      "    id: 'state-captured-nothing',",
      "    text: 'captured-nothing: ',",
    ].join('\n'),
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
      "    id: 'state-captured-nothing',",
      "    text: 'captured-nothing: a capture was read and carried no diagnostic, and a capture whose own attempt failed also emits nothing, so this states what was read and never that the page was silent',",
    ].join('\n'),
    replacement: [
      "    id: 'state-captured-nothing',",
      "    text: 'captured-nothing: the page ran clean, so a capture was read and carried no diagnostic',",
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
      "    id: 'state-joined',",
      '    text: "joined: the capture held at least one diagnostic, and every finding below is one diagnostic in the capture\'s own order",',
    ].join('\n'),
    replacement: [
      "    id: 'state-joined',",
      '    text: "joined: the capture held at least one diagnostic, and the page had nothing else to say",',
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
      "    id: 'state-no-diagnostics',",
      "    text: 'no-diagnostics: no capture was handed to the join at all, so no capture was read',",
    ].join('\n'),
    replacement: [
      "    id: 'state-no-diagnostics',",
      "    text: 'no-diagnostics: no capture was handed to the join at all, so no capture was read, and a remedy is to hand it one',",
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
      "    id: 'state-no-diagnostics',",
      "    text: 'no-diagnostics: no capture was handed to the join at all, so no capture was read',",
    ].join('\n'),
    replacement: [
      "    id: 'state-no-diagnostics',",
      "    text: 'no-diagnostics: no capture was handed to the join at all, so no capture was read because every console hook failed to install',",
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
      "    id: 'state-no-diagnostics',",
      "    text: 'no-diagnostics: no capture was handed to the join at all, so no capture was read',",
    ].join('\n'),
    replacement: [
      "    id: 'state-no-diagnostics',",
      "    text: 'no-diagnostics: the page was silent, so no capture was handed to the join at all',",
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
      "    id: 'state-no-diagnostics',",
      "    text: 'no-diagnostics: no capture was handed to the join at all, so no capture was read',",
    ].join('\n'),
    replacement: [
      "    id: 'state-no-diagnostics',",
      "    text: 'no-diagnostics: the page emitted no diagnostic at all, so no capture was handed to the join',",
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
      "    id: 'no-console-answer',",
      "    text: 'no-console-answer: no console join answer was handed over, so no state and no finding are reported',",
    ].join('\n'),
    replacement: [
      "    id: 'no-console-answer',",
      "    text: 'no-console-answer: the page logged nothing, so no console join answer was handed over',",
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
  {
    id: 'case-difference-dropped',
    defect: 'case-difference',
    // E6 built backwards: the row still carries the digest's code and title, and the pane still writes
    // a `case-difference:` line — but the sentence no longer says which spelling each side carried, so
    // the difference the row reports is never stated. The pin above reddens on the sentence, not on
    // the prefix, which is why the mutant keeps the prefix.
    anchor:
      '    text: "case-difference: the message carried {carriedCode} and the digest carries {digestCode}, so this finding carries the digest\'s own spelling and title",',
    replacement:
      '    text: "case-difference: the finding carries the digest\'s own code and title",',
    check: (api) => {
      const answer = foldedAnswer();
      return () => pinCaseDifferenceIsNamed(api.consolePanel(answer), answer);
    },
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(foldedAnswer())
          .lines.some((line) => line.startsWith('case-difference: ')),
        'the mutant really keeps the case-difference line and drops the spellings from it',
      ),
    names: /case-difference/,
  },
  {
    // T025: the shape wave 10's review reproduced — a folded row whose digest entry carries the code and
    // no title, rendered with the sentence that claims the digest's title. The claim is what reddens, not
    // the branch, so the mutant keeps the sentence and drops the condition it is read under; the pane
    // then states two sentences that contradict each other on one surface.
    id: 'title-claimed-without-a-title',
    defect: 'states-no-title',
    anchor: [
      '    lines.push(',
      '      title === null',
      '        ? caseFoldedMatchWithoutTitleText(carriedCode, code)',
      '        : caseFoldedMatchText(carriedCode, code),',
      '    );',
    ].join('\n'),
    replacement: '    lines.push(caseFoldedMatchText(carriedCode, code));',
    check: (api) => {
      const answer = titlelessFoldedAnswer();
      return () =>
        pinFoldedRowWithoutTitleStatesNoTitle(api.consolePanel(answer), answer);
    },
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(titlelessFoldedAnswer())
          .lines.some((line) => /\bown spelling and title\b/.test(line)),
        'the mutant really claims the digest’s title on a row that carries none',
      ),
    names: /states-no-title/,
  },
  {
    // T019: the registry is what a sentence is, so writing one of its texts again beside the entries
    // is the same defect as writing a new one — and it is the one the rendered-output pins cannot see,
    // because a line that equals a registry entry is a registry entry. Only the module's own source is
    // read here, and the sentence inlined below is the shipped `joined` sentence verbatim.
    id: 'sentence-inlined-beside-the-registry',
    defect: 'renders-from-the-registry',
    anchor: '  lines.push(sentence);',
    replacement:
      '  lines.push("joined: the capture held at least one diagnostic, and every finding below is one diagnostic in the capture\'s own order");',
    check:
      (api, source = SURFACE_SRC) =>
      () =>
        pinOnlyTheRegistryWritesSentences(source),
    exhibits: (module) =>
      assert.ok(
        module
          .consolePanel(noDiagnosticsAnswer())
          .lines.some((line) => line.startsWith(`${SURFACE.JOINED}: `)),
        'the mutant really writes the registry’s own joined sentence in the body of consolePanel',
      ),
    names:
      /renders-from-the-registry: the pane writes the sentence labelled "joined"/,
  },
  {
    // T019: the absence rule kept as a secondary check over the registry's own text. This entry is
    // rendered by no answer in this suite, so no surface pin reads it and the module's export reading
    // does not either; the rule over the registry does, which is why it is measured on the entry
    // rather than on a surface.
    id: 'registry-entry-claims-the-page',
    defect: 'the page logged nothing',
    anchor: [
      "    slots: ['carriedCode', 'digestCode'],",
      '    state: null,',
      '  },',
      '];',
    ].join('\n'),
    replacement: [
      "    slots: ['carriedCode', 'digestCode'],",
      '    state: null,',
      '  },',
      '  {',
      "    id: 'a-sentence-nothing-renders',",
      "    text: 'a-sentence-nothing-renders: the page logged nothing, so nothing was reported',",
      '    slots: [],',
      '    state: null,',
      '  },',
      '];',
    ].join('\n'),
    check: (api) => () => pinNoModuleSentenceClaimsSilence(api),
    exhibits: (module) => {
      assert.ok(
        module.PANE_SENTENCES.some(
          (entry) => entry.id === 'a-sentence-nothing-renders',
        ),
        'the mutant really registers a sentence that claims what the page did',
      );
      assert.equal(
        module
          .consolePanel(noDiagnosticsAnswer())
          .text.includes('the page logged nothing'),
        false,
        'the entry is one no answer in this suite renders, which is why the surface pins cannot see it',
      );
    },
    names: /the page logged nothing/,
  },
];

describe('panel-console mutants', () => {
  for (const mutation of MUTATIONS) {
    it(`${mutation.id} reddens naming "${mutation.defect}"`, async () => {
      // The pin is green on the shipped pane first, so the failure below is the mutation's.
      mutation.check(SURFACE, SURFACE_SRC)();
      const mutant = await loadMutant(mutation.anchor, mutation.replacement);
      mutation.exhibits(mutant.module);
      const failure = reddens(
        mutation.defect,
        mutation.check(mutant.module, mutant.source),
      );
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
