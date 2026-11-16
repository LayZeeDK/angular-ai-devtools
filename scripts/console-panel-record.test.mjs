// console-panel-record.test.mjs — M045 T004. `research/raw/m045-console-panel.json` is the console
// pane's behaviour, recorded case by case: for each case the state the join answered, every finding
// the answer carried (`text`, and `code` / `title` / `reason` exactly where the join's contract puts
// them), and the pane's own rendering of that answer. What this file derives — and holds the
// recording to, so a change to either module reddens it instead of drifting silently — is those
// values: the join (`extension/console-join.js`) run over the shipped digest
// (`extension/error-digest.json`), and the pane (`apps/angular-ai-devtools/src/app/panel-console.ts`)
// run over the join's answer. Each case's `input` — the diagnostics the fixture hands over, or the
// absence of a capture — and its `why` are this suite's own constants, not values read from the
// tree; so are the record's schema, milestone, task, title, question, the `contract` block and the
// capture prose (see `derive`), and `contract.states` restates the join's three state words rather
// than reading the namespace the join publishes.
//
// The fixture's shape and codes are measured; its message texts are exemplars. The payload keys are
// the ones `research/raw/m045-console-shapes.json` records `captureErrorPayload` dispatching,
// `NG0100` is a code the digest carries with a title of its own, and `NG04002` is a code the capture's
// own `/NG0\d{3,}/` regex extracts and the digest does not carry, so the named absence below is real.
// The message strings in `MATCHED` / `UNMATCHED` / `UNCODED` / `TITLED` are written in that shape and
// are not output any capture recorded: what the record measures about them is the payload key set,
// the code extraction and the digest lookup.
//
// The recorded surface is held to the vocabulary the record itself states
// (`contract.lineLabels`, `contract.prohibitedWording`), not to a snapshot of today's pane: a pane
// that started rendering a `cause:` line would write it into the recording on the next armed run, and
// the unarmed suite still reddens, because `cause` is not a label the contract carries.
//
// `contract.lineLabels` is itself held to the pane, in both directions. That field is a statement
// about the shipped module and not about the recorded subset — the labels no recorded case renders
// are counted from the record's own bytes by `labelsTheRecordRenders` and logged by the vocabulary
// test, never fixed in this comment — and nothing read it against the module, so it drifted: the pane
// gained a `case-difference:` sentence and the list stayed at fourteen, and the record's own vocabulary
// pin then refused a line the pane legitimately writes. `pinTheVocabularyIsThePane` reads the labels the
// module can write — from the lines it renders for the answers in `PANE_PROBES`, from the sentences it
// exports, and from the `lines.push(`label: ...`)` calls in its own source — and fails naming the
// labels when the record's list and the pane disagree either way. The pin's own limits are stated at
// the block that holds it.
//
// `contract.sentenceRegistry` is a second statement of the same kind, and it is held the same way
// (T019). The pane's own sentences are enumerated in the module (`PANE_SENTENCES`): the three state
// sentences, the six named absences and the two wordings the one difference a folded match states takes
// — the row carrying the digest's title (T015) and, from T025, the row whose digest entry states no
// title — each with an id and its exact text. The record carries a copy of that registry, and
// `pinTheSentenceRegistryIsThePanes` fails naming the entry when the pane's registry and the record's
// copy disagree in either direction — an entry the pane states and the record lacks, an entry the record
// carries and the pane does not write, or an entry whose text, slots or state word moved on one side
// only. The recorded lines are held to the same copy: `pinRecordedLinesAreRegistrySentences` reads the
// recording's own bytes, so every pane-written line of a recorded surface is a labelled fact the
// recorded answer states or an entry of the record's own copy, and an armed re-capture cannot bless a
// sentence the pane has no entry for.
// That is what makes a fifth wording impossible to smuggle past the absence rule rather than merely
// unlikely to be caught: the rule is kept as a secondary check on the registry's text, and the
// enumeration is what refuses a sentence it has not seen.
//
// The wording list polices only the lines the pane writes itself — the state line, the three state
// sentences and its named absences. A `title:` value is the digest's word, a `text:` value the
// capture's, and `code:` and `reason:` are the answer's, so none of those four is this pane's
// attribution and none is refused here: the digest's own title for `NG0910` states "element" and a
// captured message may say "because". Each word is matched as a whole word, with its own
// inflections, so a pane-written "because" reddens while `fix` never fires on "prefix" and `count`
// never on "account". The word `fix` is on the list: word-boundary matching is what clears "prefix",
// and a pane that writes "to fix this" states a remedy without ever spelling "remedy".
//
// The wording list is not the only prohibition the recording is held to. The same lines are held to
// the absence rule the record's own `contract.absenceStatement` states, and that rule is a property
// of the sentence rather than a list of phrasings: an absence statement may say what was read and
// what that means for the panel, and may never assert what the page did — its clauses take a thing
// the pane read as their subject, and the page is named only inside a denial. `the page emitted no
// diagnostic at all` reddens here as it does in the render suite, on the recording's own bytes, so an
// armed re-capture cannot bless a sentence the surface pins refuse. The rule is stated once, in the
// record's contract; both suites read it from there, and the matcher that applies it is copied between
// them and pinned byte-identical, so the two cannot drift.
//
// Two defects the milestone is written about (INTENT.md SC3, SC4 — held-out E7) are armed as
// in-memory rewrites of the pane's own source, each loaded from this run's own temp directory and
// shown to redden the pin that names it:
//
//   absence-as-count             the pane prints `no-digest-entry: 1 code the digest does not carry`
//                                instead of naming `NG04002` — the pin fails with "named-absence ...
//                                a count is not a name".
//   captured-nothing-as-empty-   the pane answers `captured-nothing` with no line at all — the pin
//   list                         fails with "captured-nothing ... never an empty list".
//
// Two more probes run in memory and never touch the recording: a pane-written sentence carrying a
// prohibited word reddens naming the state, the line and the word, and the positive case is armed
// from the other side — removing the exemption and policing the digest's title reddens on the very
// bytes that pass with it, so a later edit cannot quietly re-widen the list.
//
// The record is compared on a default run and written only behind `M045_CAPTURE=1`, so a default run
// is a read and an armed run with nothing moved changes no byte. Armed, on Windows cmd.exe (a bare
// `set M045_CAPTURE=1 &&` puts the space inside the variable and disarms it):
//
//   set "M045_CAPTURE=1"&& node --test scripts/console-panel-record.test.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createContext, runInContext } from 'node:vm';

import { intentPathForMilestone } from './verdict-claims-intent.mjs';

const SELF_PATH = fileURLToPath(import.meta.url);
const HERE = dirname(SELF_PATH);
const ROOT = join(HERE, '..');

/**
 * The one file an armed run writes. What it records about the tree — each case's state, its findings
 * and the pane's rendering — is derived from the sources named under `sources`; everything else in it
 * (its schema, milestone, task, title, question, contract and prose, and each case's `input` and
 * `why`) is one of this suite's own constants.
 */
const RECORD_REL = 'research/raw/m045-console-panel.json';
const RECORD_PATH = join(ROOT, RECORD_REL);
const SCRIPT_REL = 'scripts/console-panel-record.test.mjs';
const RENDER_REL = 'scripts/console-panel-render.test.mjs';
const SURFACE_REL = 'apps/angular-ai-devtools/src/app/panel-console.ts';
const JOIN_REL = 'extension/console-join.js';
const DIGEST_REL = 'extension/error-digest.json';
const SHAPES_REL = 'research/raw/m045-console-shapes.json';

const CHECK_COMMAND = `node --test ${SCRIPT_REL}`;
const ARMED_COMMAND = `set "M045_CAPTURE=1"&& ${CHECK_COMMAND}`;

/** The record's own shape and provenance, which no reading of the tree can settle. */
const SCHEMA = 'm045-console-panel/v1';
const MILESTONE = 'M045 console-read';
const TASK = 'T004';
const TITLE = 'Record the surface and run the project verify';
const QUESTION =
  'what does the console pane render, case by case, from the join the extension ships?';

/** The join's contract, stated once here and quoted into the record rather than retyped. */
const STATES = ['joined', 'captured-nothing', 'no-diagnostics'];
const FINDING_FIELDS = ['text', 'code', 'title', 'reason', 'carriedCode'];
const OPTIONAL_FINDING_FIELDS = ['code', 'title', 'reason', 'carriedCode'];
/** The contract's own spelling: `text`, then every field the join carries only sometimes, with `?`. */
const FINDING_CONTRACT = FINDING_FIELDS.map((field) =>
  OPTIONAL_FINDING_FIELDS.includes(field) ? `${field}?` : field,
);
const JOINED = 'joined';
const CAPTURED_NOTHING = 'captured-nothing';
const NO_DIGEST_ENTRY = 'no-digest-entry';

/**
 * The labels the pane can write: the state word, a finding's four carried fields, the pane's own named
 * absences and the one difference it states about a match. A cause, an element, a remedy, a word about
 * the framework or a count is not a label here. The record states this list, every recorded
 * `surface.lines` entry is held to it — a label outside the list reddens whether the recording was
 * made by hand or by an armed re-capture — and `pinTheVocabularyIsThePane` holds the list itself to
 * the shipped module in both directions, so this constant is a statement about the pane rather than a
 * sample of what the recorded cases happen to render.
 */
const LINE_LABELS = [
  'state',
  'code',
  'title',
  'reason',
  'text',
  'no-code',
  'no-title',
  'no-digest-entry',
  'case-difference',
  'case-difference-no-title',
  'no-finding',
  'no-console-answer',
  'unreadable-finding',
  JOINED,
  CAPTURED_NOTHING,
  'no-diagnostics',
];

/**
 * The wording the pane may not write of its own, matched as whole words: `because` is a word of its
 * own beside `cause`, so a pane-written "because" reddens, while `fix` never fires on "prefix" and
 * `count` never on "account". An entry is a word a pane could write to state the thing, and no entry
 * is dropped on the argument that a more general word covers it: `fix` is carried beside `remedy`
 * because a pane can write "to fix this, edit the binding" without ever spelling "remedy", and
 * word-boundary matching is what clears "prefix" — never the absence of the word. The families are
 * the four SC5 prohibitions — a cause, an element, a remedy and a word of the pane's own naming
 * Angular — plus the count SC3 refuses in place of a name.
 */
const PROHIBITED_WORDING = [
  'cause',
  'because',
  'due to',
  'since',
  'element',
  'component',
  'dom',
  'node',
  'remedy',
  'fix',
  'solution',
  'repair',
  'angular',
  'framework',
  'count',
  'number',
];

/**
 * The pane's own sentences, as `contract.sentenceRegistry` carries them (T019): the three state
 * sentences, the six named absences and the two wordings the one difference a folded match states takes
 * — `case-difference` for the row carrying the digest's title, and `case-difference-no-title` (T025) for
 * the row whose digest entry states none — each with the id it is registered under, its exact text, the
 * `{slot}` its text states, and the state word it answers where it answers one. This is the record's
 * copy of the module's `PANE_SENTENCES`, and it is a statement about the shipped pane rather than a
 * sample of the recorded subset: `pinTheSentenceRegistryIsThePanes` holds it to the module in both
 * directions, so an entry either side gains alone reddens naming the entry, and an entry whose wording
 * moved on one side reddens naming the field.
 *
 * The three entries with a slot are one sentence each, not a family: `no-digest-entry` names the code it
 * states, and the two folded sentences name the two spellings a folded match produced, and none of them
 * exists in the pane outside the text written here.
 */
const SENTENCE_REGISTRY = [
  {
    id: 'state-joined',
    text: "joined: the capture held at least one diagnostic, and every finding below is one diagnostic in the capture's own order",
    slots: [],
    state: JOINED,
  },
  {
    id: 'state-captured-nothing',
    text: 'captured-nothing: a capture was read and carried no diagnostic, and a capture whose own attempt failed also emits nothing, so this states what was read and never that the page was silent',
    slots: [],
    state: CAPTURED_NOTHING,
  },
  {
    id: 'state-no-diagnostics',
    text: 'no-diagnostics: no capture was handed to the join at all, so no capture was read',
    slots: [],
    state: 'no-diagnostics',
  },
  {
    id: 'no-console-answer',
    text: 'no-console-answer: no console join answer was handed over, so no state and no finding are reported',
    slots: [],
    state: null,
  },
  {
    id: 'no-finding',
    text: 'no-finding: the answer reported joined and carried no finding, so no finding is rendered',
    slots: [],
    state: null,
  },
  {
    id: 'no-code',
    text: 'no-code: the captured message carried no code, so this finding carries no code and no title',
    slots: [],
    state: null,
  },
  {
    id: 'no-title',
    text: 'no-title: the digest carries the code this message carried and states no title for it, so no title is rendered',
    slots: [],
    state: null,
  },
  {
    id: 'unreadable-finding',
    text: 'unreadable-finding: the answer carried a list entry that is not a finding, so it is named here and nothing is filled in for it',
    slots: [],
    state: null,
  },
  {
    id: 'no-digest-entry',
    text: 'no-digest-entry: the digest carries no entry for {code}, so this finding is named by the code it carried and no title is rendered',
    slots: ['code'],
    state: null,
  },
  {
    id: 'case-difference',
    text: "case-difference: the message carried {carriedCode} and the digest carries {digestCode}, so this finding carries the digest's own spelling and title",
    slots: ['carriedCode', 'digestCode'],
    state: null,
  },
  {
    id: 'case-difference-no-title',
    text: "case-difference-no-title: the message carried {carriedCode} and the digest carries {digestCode}, so this finding carries the digest's own spelling and no title is stated for it",
    slots: ['carriedCode', 'digestCode'],
    state: null,
  },
];

/**
 * The four finding fields that render as a labelled line of their own: the capture's `text` and
 * `code`, the digest's `title`, the join's `reason`. The wording list does not police them — the
 * digest's own title for `NG0910` states "element", and a capture that says "because" is the page's
 * word — so this suite refuses only what the pane writes itself. The join's fifth field,
 * `carriedCode`, has no label of its own: the pane states it inside the `case-difference` sentence,
 * which is the pane's own wording and is policed as such.
 */
const CARRIED_FIELDS = ['text', 'code', 'title', 'reason'];

/**
 * The absence-statement rule, stated here once and written into the record's own contract, from where
 * both this suite and `scripts/console-panel-render.test.mjs` read it. It is not a phrase list. An
 * absence sentence may say what was read and what that means for the panel, and may never assert what
 * the page did: each clause takes as its subject one of the things the pane read, and states one of
 * the actions the read or the pane performs. A clause a denial introduces is the pane saying what it
 * did not find, and the page may be named only inside such a denial. That is why `the page emitted no
 * diagnostic at all`, `the app ran clean`, `nothing was logged` and `there was nothing to read` are
 * refused while `a capture whose own attempt failed also emits nothing` passes — the rule reads the
 * sentence's subjects and actions, and no list of page verbs could enumerate them.
 *
 * The two lists below the prose are the rule's vocabulary, and they are closed on purpose: they are
 * the things this pane reads and the actions it and the read perform, not the open set of things a
 * page can be said to do. `readSubjects` may head a clause; `readActions` may be its verb;
 * `paneActions` are the acts of rendering that let an indeterminate subject stand; `placeholders` are
 * the indeterminates; `pageWords` are the words that name the page and may appear only in a denial;
 * `denials` are the words that introduce one.
 */
const ABSENCE_STATEMENT = {
  rule: 'an absence statement says what was read and what that means for the panel, and never what the page did: each clause takes as its subject a thing the pane read — the capture, the answer, the join, the digest, the message, the finding, the list, the state, the code, the title or the reason, or the sentence itself — and states an action the read or the pane performs; a clause a denial introduces says what was not found, and the page is named only inside a denial, because a sentence that takes the page, or an indeterminate standing where the page would be, as the subject of what happened is a claim about the page in whatever words it chooses',
  readSubjects: [
    'capture',
    'captures',
    'answer',
    'answers',
    'join',
    'joins',
    'digest',
    'digests',
    'message',
    'messages',
    'finding',
    'findings',
    'list',
    'lists',
    'entry',
    'entries',
    'state',
    'states',
    'diagnostic',
    'diagnostics',
    'code',
    'codes',
    'title',
    'titles',
    'reason',
    'reasons',
    'sentence',
    'sentences',
    'line',
    'lines',
    'statement',
    'statements',
    'pane',
    'panel',
    'surface',
  ],
  readActions: [
    'read',
    'reads',
    'capture',
    'captures',
    'captured',
    'carry',
    'carries',
    'carried',
    'hold',
    'holds',
    'held',
    'hand',
    'hands',
    'handed',
    'join',
    'joins',
    'joined',
    'record',
    'records',
    'recorded',
    'list',
    'lists',
    'listed',
    'name',
    'names',
    'named',
    'state',
    'states',
    'stated',
    'render',
    'renders',
    'rendered',
    'print',
    'prints',
    'printed',
    'fill',
    'fills',
    'filled',
    'report',
    'reports',
    'reported',
    'match',
    'matches',
    'matched',
    'find',
    'finds',
    'found',
    'digest',
    'digests',
    'digested',
    'extract',
    'extracts',
    'extracted',
    'fail',
    'fails',
    'failed',
    'give',
    'gives',
    'given',
    'contain',
    'contains',
    'contained',
  ],
  paneActions: [
    'render',
    'renders',
    'rendered',
    'state',
    'states',
    'stated',
    'name',
    'names',
    'named',
    'carry',
    'carries',
    'carried',
    'read',
    'reads',
    'fill',
    'fills',
    'filled',
    'list',
    'lists',
    'listed',
    'print',
    'prints',
    'printed',
    'record',
    'records',
    'recorded',
    'hold',
    'holds',
    'held',
    'hand',
    'hands',
    'handed',
    'join',
    'joins',
    'joined',
  ],
  placeholders: ['nothing', 'none', 'it', 'this', 'that'],
  pageWords: [
    'page',
    'pages',
    'app',
    'apps',
    'application',
    'applications',
    'browser',
    'browsers',
    'tab',
    'tabs',
    'window',
    'windows',
    'site',
    'sites',
    'document',
    'documents',
    'dom',
    'framework',
    'angular',
  ],
  denials: [
    'never',
    'not',
    'nor',
    'cannot',
    'without',
    "isn't",
    "wasn't",
    "aren't",
    "doesn't",
    "don't",
    "didn't",
  ],
};

/** The one switch that arms the write; nothing else in this file writes into the checkout. */
const CAPTURE = String(process.env.M045_CAPTURE ?? '').trim() === '1';

const SURFACE_SRC = readFileSync(join(ROOT, SURFACE_REL), 'utf8');
const SURFACE = await import(pathToFileURL(join(ROOT, SURFACE_REL)).href);
const JOIN_SRC = readFileSync(join(ROOT, JOIN_REL), 'utf8');
const DIGEST = JSON.parse(readFileSync(join(ROOT, DIGEST_REL), 'utf8'));
const SHAPES = JSON.parse(readFileSync(join(ROOT, SHAPES_REL), 'utf8'));

// ------------------------------------------------------------------ the fixture ----

/**
 * Three diagnostics in the payload shape the shapes record states — `{ code, message, component,
 * timestamp }` — plus a second message carrying the same code as the first. `component` and
 * `timestamp` are written because the capture writes them; only `code` and `message` reach the join.
 * The message texts are exemplars in that shape, not output any capture recorded: what is measured
 * about them is the key set, the code extraction and the digest lookup.
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
const SECOND_SAME_CODE = {
  code: 'NG0100',
  message: 'NG0100: second report',
  component: null,
  timestamp: 4,
};
/**
 * A code the digest carries with a title that states a word the pane may not write of its own, and a
 * captured message that says "because" — the positive case the wording list must not refuse: the
 * title is the digest's word and the text is the capture's, and neither is the pane's attribution.
 */
const TITLED = {
  code: 'NG0910',
  message:
    'NG0910: unsanitized HTML was stripped because the binding bypassed the sanitizer',
  component: null,
  timestamp: 5,
};

/**
 * A code the digest matches only after folding case, and the message that carries it. The shipped
 * digest carries `NG01002` ("Missing Control Value") and no lowercase spelling of any code, so this
 * message is one the digest joins by folding — the answer that makes the pane write its
 * `case-difference` sentence. The fixture is the render suite's and this record's, and the join is
 * what decides the match, so the sentence is never assembled here.
 */
const FOLDED = {
  code: 'ng01002',
  message: 'ng01002: Missing control value for the input',
  component: null,
  timestamp: 6,
};

/**
 * The cases the record carries. Each one names the diagnostics the capture would have handed over —
 * or that no capture was handed over at all — and why the case is in the record. `input` and `why`
 * are this suite's own constants; the state, the findings and the rendered lines are derived.
 */
const CASES = [
  {
    id: 'joined',
    why: 'a matched code, a code the digest lacks and a message that carried none, in capture order',
    handedOver: true,
    diagnostics: [MATCHED, UNMATCHED, UNCODED],
  },
  {
    id: 'shared-code',
    why: 'two diagnostics sharing one code are two findings, in capture order, with the one title',
    handedOver: true,
    diagnostics: [MATCHED, SECOND_SAME_CODE],
  },
  {
    id: 'digest-title-and-captured-wording',
    why: 'a code the digest carries whose own title states "element" and whose captured message says "because": both are the answer’s words, and neither is refused as the pane’s',
    handedOver: true,
    diagnostics: [TITLED],
  },
  {
    id: 'case-folded-match',
    why: 'a code the digest carries only in another case: the digest’s spelling and title with the message’s own spelling beside them, and the pane states the difference it made',
    handedOver: true,
    diagnostics: [FOLDED],
  },
  {
    id: 'captured-nothing',
    why: 'a capture that was read and carried no diagnostic: a statement, never an empty list',
    handedOver: true,
    diagnostics: [],
  },
  {
    id: 'no-diagnostics',
    why: 'no capture handed to the join at all, which is a different absence from an empty one',
    handedOver: false,
    diagnostics: null,
  },
];

// ------------------------------------------------------------------- the source ----

/** The join, in a bare context: no DOM, no clock, no console, publishing its own namespace. */
function joinApi() {
  const context = createContext({});
  runInContext(JOIN_SRC, context);
  const api = context.angularAiConsoleJoin;
  assert.ok(api, `${JOIN_REL} must publish its namespace`);
  assert.equal(
    typeof api.consoleJoin,
    'function',
    `${JOIN_REL} must export consoleJoin`,
  );
  return api;
}

const JOIN = joinApi();

/** A value from the vm context carries that context's prototypes, so it is copied here first. */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The shipped digest's own title for one code, read rather than restated. */
function shippedTitle(code) {
  const entry = DIGEST.entries.find((candidate) => candidate.code === code);
  return entry === undefined ? null : entry.title;
}

/**
 * The join's fold, re-stated only to read an expected match: ASCII A–Z lowered and nothing else. A
 * Unicode `toLowerCase()` would call U+212A KELVIN SIGN a case spelling of `k`, and the join refuses
 * that fold, so a pin that measured a match with the wider one would expect an answer the join does
 * not give.
 */
function asciiFolded(code) {
  return String(code).replace(/[A-Z]/g, (letter) => letter.toLowerCase());
}

/** The join's own answer for one case: a capture's diagnostics, or the absence of a capture. */
function answerFor(entry) {
  return entry.handedOver
    ? clone(JOIN.consoleJoin(entry.diagnostics, DIGEST))
    : clone(JOIN.consoleJoin(undefined, DIGEST));
}

/** One finding as the record states it: `text`, then every optional field that was carried. */
function findingRecord(finding) {
  const record = { text: finding.text };
  if (finding.code !== undefined) record.code = finding.code;
  if (finding.title !== undefined) record.title = finding.title;
  if (finding.reason !== undefined) record.reason = finding.reason;
  if (finding.carriedCode !== undefined)
    record.carriedCode = finding.carriedCode;
  return record;
}

/** One case recorded: what was handed over, what the join answered, and what the pane rendered. */
function caseRecord(entry) {
  const answer = answerFor(entry);
  const surface = clone(SURFACE.consolePanel(answer));
  return {
    id: entry.id,
    why: entry.why,
    input: entry.handedOver
      ? { handedOver: true, diagnostics: entry.diagnostics }
      : { handedOver: false },
    state: answer.state,
    findings: answer.findings.map(findingRecord),
    surface: {
      state: surface.state,
      kind: surface.kind,
      message: surface.message,
      lines: surface.lines,
      text: surface.text,
    },
  };
}

/**
 * The whole record this head derives. Each case's state, findings and rendered lines are read from
 * the four files named under `sources` — the join over the shipped digest, the pane over the join's
 * answer, and the shapes record for the capture's own regex — and the fixture's measured fields are
 * read the same way. Each case's `input` (the diagnostics the fixture hands over, or the absence of a
 * capture) and its `why` are this suite's own constants, and so are `schema`, `milestone`, `task`,
 * `title`, `question`, the whole of `contract` and the capture prose: quoted into the record rather
 * than derived from the tree. No clock, no commit, no run count and no absolute path is written, so a
 * second run at the same path re-derives the same bytes.
 */
function derive() {
  const regex = SHAPES.capture.codeExtraction.regex;
  return {
    schema: SCHEMA,
    milestone: MILESTONE,
    task: TASK,
    title: TITLE,
    question: QUESTION,
    contract: {
      returns: '{ state, findings[] }',
      states: STATES,
      finding: FINDING_CONTRACT,
      reason:
        'reason is present only when the digest lacks the code the message carried, and code is absent only when the message carried none',
      carriedCode:
        'carriedCode is present only where the digest matched the code the message carried after folding case, and it is the spelling the message used: it folds to the finding’s code and is never a second code',
      rendered:
        'the pane renders state and findings and nothing else: no cause, no element, no remedy and no unattributed wording',
      lineLabels: LINE_LABELS,
      sentenceRegistry: SENTENCE_REGISTRY,
      sentenceRegistryProvenance:
        'contract.sentenceRegistry is the pane’s own registry, copied here from the pane’s PANE_SENTENCES so the recording can be held to the sentences the pane writes without re-reading the module: the pane’s registry is the source, this copy is a statement about it, and both suites pin the two equal in both directions, so an entry either side gains alone reddens',
      prohibitedWording: PROHIBITED_WORDING,
      absenceStatement: ABSENCE_STATEMENT,
    },
    sources: {
      surface: SURFACE_REL,
      join: JOIN_REL,
      digest: DIGEST_REL,
      shapes: SHAPES_REL,
    },
    capture: {
      command: ARMED_COMMAND,
      check: CHECK_COMMAND,
      records: RECORD_REL,
      write:
        'an armed run re-derives every case from the join and the pane and writes this file only when a value moved, so a default run is a read and a second armed run writes no byte',
      reproduces:
        'each case’s state, its findings and its rendered lines below are derived at the head that carries them from the four files named under sources — the join over the shipped digest, and the pane over the join’s answer — so a second run at the same path re-derives the same bytes, and this record carries no clock, no commit and no absolute path; every cases[].input and every cases[].why are this suite’s own fixture constants, not values read from the tree, and so are schema, milestone, task, title, question, the whole contract and this prose, and contract.states restates the join’s three state words rather than reading the namespace the join publishes',
    },
    fixture: {
      payloadKeys: SHAPES.capture.payload.keys,
      matchedCode: MATCHED.code,
      matchedTitle: shippedTitle(MATCHED.code),
      unmatchedCode: UNMATCHED.code,
      unmatchedTitle: shippedTitle(UNMATCHED.code),
      digestEntries: DIGEST.entries.length,
      digestCarriesUnmatchedCode: DIGEST.entries.some(
        (entry) => entry.code === UNMATCHED.code,
      ),
      captureRegex: regex,
      unmatchedExtractedByTheCaptureRegex: new RegExp(regex.slice(1, -1)).test(
        UNMATCHED.message,
      ),
      caseInputs:
        'every cases[].input — the diagnostics the fixture hands over, or the absence of a capture — and every cases[].why are this suite’s own fixture constants, not values read from the tree; what this record derives about a case is its state, its findings and its rendered lines',
      messageTexts:
        'the message texts are exemplars written in the capture’s payload shape, not strings a capture recorded: what this record measures about them is the payload key set, the code extraction and the digest lookup, so a capture that read different text would move the recorded text and not the shape',
    },
    cases: CASES.map(caseRecord),
  };
}

// -------------------------------------------------------- the record and its write ----

/** The sha256 of the bytes given, as the hex a diagnostic prints. */
function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** The one canonical serialisation: an armed run that changes nothing cannot change a byte. */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

const SHA_AT_LOAD = existsSync(RECORD_PATH)
  ? sha256(readFileSync(RECORD_PATH))
  : null;

/**
 * The bytes a read-only pin holds the file to. An armed run moves the recording on purpose, so it
 * re-bases this after its own write; a default run leaves it exactly where the file was at load.
 */
let baseline = SHA_AT_LOAD;

/** The recording as it stands on disk, parsed. */
function recorded() {
  return JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
}

/**
 * The one write this suite has. It re-derives the record, writes it only when a value moved, and
 * answers whether the bytes changed so an armed run can prove its own idempotence.
 */
function capture() {
  const derived = derive();
  const bytes = canonical(derived);
  const before = existsSync(RECORD_PATH)
    ? readFileSync(RECORD_PATH, 'utf8')
    : null;
  if (before !== bytes) writeFileSync(RECORD_PATH, bytes, 'utf8');
  const after = readFileSync(RECORD_PATH, 'utf8');
  assert.equal(
    after,
    bytes,
    `${RECORD_REL} must carry the derivation this run just made`,
  );
  baseline = sha256(readFileSync(RECORD_PATH));
  return { changed: before !== bytes, bytes };
}

if (CAPTURE) {
  const first = capture();
  const second = capture();
  assert.equal(
    second.changed,
    false,
    'a second armed run at the same head moves no value, so it writes no byte',
  );
  void first.bytes;
}

/** The first path at which two records disagree, written the way a failing assertion reads it. */
function firstDifference(recordedValue, derivedValue, path = '<record>') {
  if (Array.isArray(recordedValue) || Array.isArray(derivedValue)) {
    if (!Array.isArray(recordedValue) || !Array.isArray(derivedValue)) {
      return `${path}: ${JSON.stringify(recordedValue)} -> ${JSON.stringify(derivedValue)}`;
    }
    if (recordedValue.length !== derivedValue.length) {
      return `${path}: ${recordedValue.length} entry(ies) -> ${derivedValue.length} entry(ies)`;
    }
    for (let index = 0; index < recordedValue.length; index += 1) {
      const difference = firstDifference(
        recordedValue[index],
        derivedValue[index],
        `${path}[${index}]`,
      );
      if (difference !== null) return difference;
    }
    return null;
  }
  if (
    recordedValue !== null &&
    derivedValue !== null &&
    typeof recordedValue === 'object' &&
    typeof derivedValue === 'object'
  ) {
    const keys = new Set([
      ...Object.keys(recordedValue),
      ...Object.keys(derivedValue),
    ]);
    for (const key of keys) {
      const difference = firstDifference(
        recordedValue[key],
        derivedValue[key],
        `${path}.${key}`,
      );
      if (difference !== null) return difference;
    }
    return null;
  }
  return recordedValue === derivedValue
    ? null
    : `${path}: ${JSON.stringify(recordedValue)} -> ${JSON.stringify(derivedValue)}`;
}

/** One recorded case by id, so a pin can be run against the record and against a mutant alike. */
function recordedCase(id) {
  const entry = recorded().cases.find((candidate) => candidate.id === id);
  assert.ok(
    entry,
    `the record must carry the case ${id}, or this pin proves nothing`,
  );
  return entry;
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

// -------------------------------------------------------------------------- the pins ----

/** A list of field names as a failure reads them: each quoted, comma-separated. */
function quotedFields(names) {
  return names.map((name) => JSON.stringify(name)).join(', ');
}

/**
 * T023/AC2: the record's finding contract is every field the join can return, pinned in both
 * directions. The probe is the join itself over four diagnostics chosen so that every field a
 * finding can carry is produced by a real answer and every optional field is left off at least one —
 * a code the digest carries, a code it carries only after folding case, a code it lacks, and a
 * message that carried none — so the union of the findings' keys is what the join can return at this
 * head, not a list written here.
 *
 * Fails naming the field when the join returns one `contract.finding` omits (so a join field the
 * record does not list reddens), when the contract lists a field the join never returns, and when a
 * field's `?` marker disagrees with whether the join can leave it off a finding.
 */
function pinTheFindingContractIsTheJoins(contract) {
  const declared = contract.finding;
  assert.ok(
    Array.isArray(declared) && declared.length > 0,
    `finding-contract: the record must state the fields a finding can carry; its contract.finding is ${JSON.stringify(declared)}`,
  );
  const fields = declared.map((entry) => {
    assert.match(
      String(entry),
      /^[a-z][a-zA-Z]*\??$/,
      `finding-contract: ${JSON.stringify(entry)} is not a field name, optionally marked optional with "?"`,
    );
    return entry.endsWith('?')
      ? { name: entry.slice(0, -1), optional: true }
      : { name: entry, optional: false };
  });
  const answer = clone(
    JOIN.consoleJoin([MATCHED, FOLDED, UNMATCHED, UNCODED], DIGEST),
  );
  assert.equal(
    answer.state,
    JOINED,
    `finding-contract: the probe must reach a joined answer, or it reads no finding; the join answered ${JSON.stringify(answer)}`,
  );
  const returned = new Set(
    answer.findings.flatMap((finding) => Object.keys(finding)),
  );
  const declaredNames = fields.map((field) => field.name);
  const omitted = [...returned]
    .filter((name) => !declaredNames.includes(name))
    .sort();
  assert.deepEqual(
    omitted,
    [],
    `finding-contract: the join returns ${omitted.length} field(s) the record's contract.finding does not carry: ${quotedFields(omitted)} — the record states every field a finding can carry, so a field the join returns and the record omits is drift; contract.finding would have to carry ${quotedFields([...FINDING_CONTRACT].sort())}`,
  );
  const invented = declaredNames.filter((name) => !returned.has(name)).sort();
  assert.deepEqual(
    invented,
    [],
    `finding-contract: the record's contract.finding carries ${invented.length} field(s) the join never returns: ${quotedFields(invented)} — a contract field the join cannot produce is a claim about an answer the pane is never handed; the join returns ${quotedFields([...returned].sort())}`,
  );
  for (const field of fields) {
    const onEvery = answer.findings.every((finding) =>
      Object.hasOwn(finding, field.name),
    );
    const onSome = answer.findings.some((finding) =>
      Object.hasOwn(finding, field.name),
    );
    assert.equal(
      onSome,
      true,
      `finding-contract: the record lists ${JSON.stringify(field.name)}, and no finding the probe reaches carries it; the probe answered ${JSON.stringify(answer.findings)}`,
    );
    assert.equal(
      field.optional,
      !onEvery,
      `finding-contract: the record marks ${JSON.stringify(field.name)} ${field.optional ? 'optional' : 'required'}, and the join ${onEvery ? 'carries it on every finding' : 'leaves it off at least one finding'} — the "?" is the contract's only statement about whether a field can be absent`,
    );
  }
  return fields;
}

/**
 * SC3/SC4: the pane reports the state the answer carried, and reports the same word as its kind.
 * `captured-nothing` and `no-diagnostics` are two different states, never one collapse.
 */
function pinReportsTheRecordedState(entry, rendered) {
  assert.ok(
    STATES.includes(entry.state),
    `state: ${entry.id} records ${JSON.stringify(entry.state)}, and the join answers only ${STATES.join(', ')}`,
  );
  assert.equal(
    rendered.state,
    entry.state,
    `state: ${entry.id} recorded ${JSON.stringify(entry.state)} and the pane reported ${JSON.stringify(rendered.state)}`,
  );
  assert.equal(
    rendered.kind,
    entry.state,
    `state: ${entry.id} recorded ${JSON.stringify(entry.state)} and the pane's kind reported ${JSON.stringify(rendered.kind)}`,
  );
}

/**
 * SC3: a code the digest lacks is named. The pane prints the code the message carried and a sentence
 * carrying that same code, and never a count in place of the name.
 */
function pinNamesTheAbsenceByCode(entry, rendered) {
  const absent = entry.findings.filter(
    (finding) => finding.reason === NO_DIGEST_ENTRY,
  );
  assert.ok(
    absent.length > 0,
    `named-absence: ${entry.id} must carry a code the digest lacks, or this pin proves nothing`,
  );
  for (const finding of absent) {
    assert.ok(
      rendered.lines.includes(`code: ${finding.code}`),
      `named-absence: a code the digest lacks must be rendered by name (${finding.code}) — a count is not a name; the pane rendered ${JSON.stringify(rendered.lines)}`,
    );
    const stated = rendered.lines.filter((line) =>
      line.startsWith(`${NO_DIGEST_ENTRY}: `),
    );
    const sentence = stated.find((line) => line.includes(finding.code));
    assert.ok(
      sentence,
      `named-absence: the pane must state the absence in one sentence naming the code the message carried (${finding.code}) — a count is not a name; it rendered ${JSON.stringify(stated)}`,
    );
    assert.doesNotMatch(
      sentence,
      /\b\d+\s+(code|codes|entry|entries|finding|findings)\b/i,
      `named-absence: a count is not a name — the absence must name the code the message carried; the pane rendered ${JSON.stringify(sentence)}`,
    );
    assert.match(
      sentence,
      /NG0\d{3,}/,
      `named-absence: the absence must name the code the capture carried, never a blank; the pane rendered ${JSON.stringify(sentence)}`,
    );
  }
}

/**
 * SC4/E7: `captured-nothing` is a statement. The pane says a capture was read and carried no
 * diagnostic; it never renders the state word with no line beside it, and never an empty list.
 */
function pinCapturedNothingStatesIt(entry, rendered) {
  assert.equal(
    entry.state,
    CAPTURED_NOTHING,
    `captured-nothing: ${entry.id} recorded ${JSON.stringify(entry.state)}, and this pin holds ${CAPTURED_NOTHING}`,
  );
  assert.ok(
    rendered.lines.length > 1,
    `captured-nothing: the pane renders that statement, never an empty list; it rendered ${JSON.stringify(rendered.lines)}`,
  );
  assert.ok(
    rendered.lines.some((line) => line.startsWith(`${CAPTURED_NOTHING}: `)),
    `captured-nothing: the pane states the absence in its own sentence, never an empty list; it rendered ${JSON.stringify(rendered.lines)}`,
  );
  assert.equal(
    rendered.lines.some((line) => line.startsWith('text: ')),
    false,
    `captured-nothing: a capture that carried no diagnostic has no message to print, so no text line is rendered; the pane rendered ${JSON.stringify(rendered.lines)}`,
  );
}

/**
 * SC4/E7: the recorded surface states what was read and never what the page did. The rule is the
 * record's own (`contract.absenceStatement`), so an armed re-capture cannot bless a sentence the
 * render suite refuses: the recording's own bytes — `cases[i].surface.lines` — are read here and held
 * to the same property the pane is held to. The state line is the answer's word and a finding's four
 * fields are the answer's words, so neither is policed; every other line is the pane's own sentence.
 */
function pinRecordedAbsenceStatement(entry, contract) {
  const rule = contract.absenceStatement;
  assert.ok(
    rule !== null && typeof rule === 'object',
    `absence-statement: ${RECORD_REL} must state the rule its surfaces are held to; its contract carries ${JSON.stringify(rule)}`,
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
      `absence-statement: ${RECORD_REL} must state the rule's ${JSON.stringify(key)}, or the rule is incomplete`,
    );
  }
  for (const [index, line] of entry.surface.lines.entries()) {
    const at = line.indexOf(': ');
    const label = at < 0 ? line : line.slice(0, at);
    if (label === 'state' || CARRIED_FIELDS.includes(label)) continue;
    assertAbsenceStatement(
      at < 0 ? line : line.slice(at + 2),
      `${entry.state} surface line ${index} (${entry.id})`,
      rule,
    );
  }
}

/**
 * SC1/SC2/SC3/E6, field for field: every finding the record states is one the pane rendered, with the
 * text it carried, the code it carried named or its absence stated, the digest's title where the
 * digest has one, the message's spelling where the match folded case, and no third thing invented for
 * a finding that carries none of the optional fields.
 */
function pinRendersEachRecordedFinding(entry, rendered) {
  for (const [index, finding] of entry.findings.entries()) {
    const where = `${entry.id} finding ${index}`;
    assert.equal(
      typeof finding.text,
      'string',
      `text: ${where} records no text, and every finding carries the captured message`,
    );
    for (const key of Object.keys(finding)) {
      assert.ok(
        FINDING_FIELDS.includes(key),
        `finding-fields: ${where} records ${JSON.stringify(key)}, and a finding carries only ${FINDING_FIELDS.join(', ')}`,
      );
    }
    assert.ok(
      rendered.lines.includes(`text: ${finding.text}`),
      `text: ${where} must render its captured text verbatim: ${JSON.stringify(`text: ${finding.text}`)}; the pane rendered ${JSON.stringify(rendered.lines)}`,
    );
    if ('code' in finding) {
      assert.equal(
        typeof finding.code,
        'string',
        `code: ${where} records ${JSON.stringify(finding.code)}, and a code is a string or absent`,
      );
      assert.ok(
        rendered.lines.includes(`code: ${finding.code}`),
        `code: ${where} must render the code the message carried by name: ${JSON.stringify(`code: ${finding.code}`)}; the pane rendered ${JSON.stringify(rendered.lines)}`,
      );
    } else {
      assert.equal(
        rendered.lines.some((line) => /^code: ?$/.test(line)),
        false,
        `code: ${where} records no code, so the pane must leave no blank code line for it; the pane rendered ${JSON.stringify(rendered.lines)}`,
      );
      for (const invented of ['code: undefined', 'code: null']) {
        assert.equal(
          rendered.lines.includes(invented),
          false,
          `code: ${where} records no code, so the pane must invent none for it; the pane rendered ${JSON.stringify(invented)}`,
        );
      }
      assert.ok(
        rendered.lines.some((line) => line.startsWith('no-code: ')),
        `code: ${where} records no code, so the pane states that absence by name; the pane rendered ${JSON.stringify(rendered.lines)}`,
      );
    }
    if ('title' in finding) {
      assert.equal(
        finding.title,
        shippedTitle(finding.code),
        `title: ${where} records a title the shipped digest does not carry for ${finding.code}`,
      );
      assert.ok(
        rendered.lines.includes(`title: ${finding.title}`),
        `title: ${where} must render the digest's own title: ${JSON.stringify(`title: ${finding.title}`)}; the pane rendered ${JSON.stringify(rendered.lines)}`,
      );
    }
    if ('carriedCode' in finding) {
      assert.equal(
        typeof finding.carriedCode,
        'string',
        `carriedCode: ${where} records ${JSON.stringify(finding.carriedCode)}, and the message's spelling is a string or absent`,
      );
      assert.notEqual(
        finding.carriedCode,
        finding.code,
        `carriedCode: ${where} records the spelling ${JSON.stringify(finding.carriedCode)} as a difference from the digest's code, and the two are the same spelling — a difference the fold did not make`,
      );
      assert.equal(
        asciiFolded(finding.carriedCode),
        asciiFolded(finding.code),
        `carriedCode: ${where} records ${JSON.stringify(finding.carriedCode)} beside ${JSON.stringify(finding.code)}, and the two do not fold together, so the pane would state a difference that is not a case difference`,
      );
      const sentence = SURFACE.caseFoldedMatchText(
        finding.carriedCode,
        finding.code,
      );
      assert.ok(
        rendered.lines.includes(sentence),
        `carriedCode: ${where} must render the difference the fold made in the pane's own sentence: ${JSON.stringify(sentence)}; the pane rendered ${JSON.stringify(rendered.lines)}`,
      );
    }
    if ('reason' in finding) {
      assert.equal(
        finding.reason,
        NO_DIGEST_ENTRY,
        `reason: ${where} records ${JSON.stringify(finding.reason)}, and the join's one reason is ${NO_DIGEST_ENTRY}`,
      );
      assert.equal(
        'title' in finding,
        false,
        `reason: ${where} names a code the digest lacks, so it carries no title and the pane renders none`,
      );
    }
  }
  // The case-difference sentence is rendered once per finding whose match folded case, and never for
  // a finding that carries no second spelling: a line stated for a difference the answer did not
  // carry would be the pane inventing one.
  const differences = rendered.lines.filter((line) =>
    line.startsWith(`${SURFACE.CASE_DIFFERENCE}: `),
  );
  const folded = entry.findings.filter(
    (finding) =>
      typeof finding.carriedCode === 'string' &&
      typeof finding.code === 'string',
  );
  assert.equal(
    differences.length,
    folded.length,
    `carriedCode: ${entry.id} records ${folded.length} folded match(es) and the pane rendered ${differences.length} case-difference line(s); the sentence states the difference a folded finding carries, and no other`,
  );
}

/** A regular expression metacharacter, escaped so a word is matched as itself and nothing else. */
function escaped(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * One protected word's own forms: the word, its plural or third person, its past and its participle.
 * A pane that writes "caused" has written the word as surely as one that writes "cause", so the forms
 * are matched with it; a form that is not an English word matches nothing and costs nothing.
 */
function wordForms(word) {
  const forms = new Set([word, `${word}s`, `${word}ed`, `${word}ing`]);
  if (word.endsWith('e')) {
    const stem = word.slice(0, -1);
    forms.add(`${stem}es`);
    forms.add(`${stem}ed`);
    forms.add(`${stem}ing`);
  }
  if (word.endsWith('y')) forms.add(`${word.slice(0, -1)}ies`);
  return [...forms];
}

/**
 * One prohibited entry as a whole-word pattern. The entries are words and not substrings, so `cause`
 * never matches "because", `fix` never matches "prefix" and `count` never matches "account"; a word's
 * own inflections are matched with it, and an entry spelled with a space is matched as that phrase.
 */
function prohibitedPattern(word) {
  const words = word.split(/\s+/);
  const last = words.pop() ?? word;
  const head = words.map((part) => `${escaped(part)}\\s+`);
  const tail = wordForms(last).map(escaped).join('|');
  return new RegExp(`\\b${head.join('')}(?:${tail})\\b`, 'i');
}

/**
 * SC5/E7: the recorded surface is the vocabulary the record states, and nothing else. This reads the
 * recording's own bytes — `cases[i].surface.lines` — rather than the pane's current output, so a pane
 * that started rendering a `cause:` line cannot be blessed by an armed re-capture: the re-captured
 * line is still labelled `cause`, and `cause` is not a label the record's contract carries.
 *
 * Every line is a labelled fact (`label: sentence`) and the label is one of `contract.lineLabels`.
 * The wording list then polices only what the pane writes itself: a line labelled with one of
 * `carried` — a finding's `text`, `code`, `title` and `reason` — states a word the answer carried,
 * the digest's title or the capture's text, and is not this pane's attribution, so it is exempt. Every
 * other line is the pane's own sentence, and its words are matched whole.
 *
 * `carried` is a parameter so the exemption itself can be armed: called with no exempt label, the
 * same recorded bytes redden on the digest's title.
 */
function pinRecordsOnlyTheContractVocabulary(
  entry,
  contract,
  carried = CARRIED_FIELDS,
) {
  const labels = contract.lineLabels;
  const prohibited = contract.prohibitedWording;
  assert.ok(
    Array.isArray(labels) && labels.length > 0,
    `recorded-vocabulary: the record must state the labels its surface lines may carry; its contract carries ${JSON.stringify(labels)}`,
  );
  assert.ok(
    Array.isArray(prohibited) && prohibited.length > 0,
    `recorded-vocabulary: the record must state the wording it forbids; its contract carries ${JSON.stringify(prohibited)}`,
  );
  for (const word of prohibited) {
    assert.equal(
      labels.includes(word),
      false,
      `recorded-vocabulary: ${JSON.stringify(word)} is forbidden wording and cannot also be a label the record states`,
    );
  }
  const patterns = prohibited.map((word) => [word, prohibitedPattern(word)]);
  for (const [index, line] of entry.surface.lines.entries()) {
    const where = `${entry.id} surface line ${index}`;
    assert.equal(
      typeof line,
      'string',
      `recorded-vocabulary: ${where} must be a line of text; it records ${JSON.stringify(line)}`,
    );
    assert.equal(
      line,
      line.trim(),
      `recorded-vocabulary: ${where} must carry no padding; it records ${JSON.stringify(line)}`,
    );
    assert.match(
      line,
      /^[a-z][a-z-]*: /,
      `recorded-vocabulary: ${where} must be a labelled fact — a state, a finding's field or one of the pane's own named absences; it records ${JSON.stringify(line)}`,
    );
    const label = line.slice(0, line.indexOf(': '));
    assert.ok(
      labels.includes(label),
      `recorded-vocabulary: ${where} is labelled ${JSON.stringify(label)}, which the record's contract does not carry; it records ${JSON.stringify(line)}`,
    );
    if (carried.includes(label)) continue;
    const sentence = line.slice(label.length + 2);
    for (const [word, pattern] of patterns) {
      assert.equal(
        pattern.test(sentence),
        false,
        `recorded-vocabulary: ${where} is policed as the pane's own ${JSON.stringify(label)} line and carries ${JSON.stringify(word)}, and the contract states that the pane renders no ${JSON.stringify(word)}; it records ${JSON.stringify(line)} (matched the word ${JSON.stringify(word)} as a whole word)`,
      );
    }
  }
}

// -------------------------------------------------- the vocabulary, held to the pane ----
//
// `contract.lineLabels` is a statement about the shipped pane and not about the recorded subset: the
// labels no recorded case renders are counted from the record's own bytes by `labelsTheRecordRenders`
// and logged by the vocabulary test, never fixed here, so comparing the list to the recording could not
// keep it true, and that is how it drifted — the pane gained a `case-difference:` sentence (T015) and the
// list stayed at fourteen. The list is held to the module instead, which needs three readings because
// no single one covers the pane:
//
//   the probes    every line the shipped module renders for the answers in `PANE_PROBES`, chosen so
//                 that each branch the pane can take is taken. This is the pane's real output — the
//                 only reading that sees a label computed rather than written down — and it is what
//                 the record's list is compared against.
//   the exports   every labelled sentence the module exports (`STATE_TEXTS` and the `NO_*` /
//                 `UNREADABLE_FINDING` sentences) and the two exported sentence builders, called
//                 with the codes the join really produces.
//   the pushes    every `lines.push(`label: ...`)` in the module's own source, which reads a label
//                 written on a branch no probe answer reaches.
//
// The exports and the pushes are asserted to lie inside what the probes render, so a sentence or a
// pushed label this suite does not render reddens here as an unread label rather than passing unseen.
// Three of the sixteen labels come from branches the shipped digest cannot reach: it states a title for
// every code it carries and the join states its one reason for every code it lacks, so `no-title` and an
// unmodelled `reason` are reached by two answers written below rather than read from the join, and
// `case-difference-no-title` (T025) is reached by the join's own answer over a digest whose folded entry
// states no title — the shape the shipped digest cannot produce, written below beside them. No recorded
// case renders any of the three, which is why all three are in the list with no case behind them. The
// honest limit: this reading is these three, so a label the pane starts writing from a helper this suite
// does not call, on a branch no probe reaches, would be invisible to it. At this head no label is in
// that position, and the completeness check fails rather than letting one slip.
//
// What this does not do is widen the vocabulary to let a sentence pass. It compares two sets of
// *labels*: the words inside a sentence are policed by `contract.prohibitedWording` and by the absence
// rule, neither of which is relaxed here, and an entry added to the record's list reddens this pin
// because the pane writes no line that carries it.

/** The label a line carries: everything before its first `: `. */
function lineLabel(line) {
  const at = line.indexOf(': ');
  return at < 0 ? line : line.slice(0, at);
}

/** The join's own answer for one diagnostic: exactly what the pane is handed for it. */
function answerForDiagnostic(diagnostic) {
  return clone(JOIN.consoleJoin([diagnostic], DIGEST));
}

/** The join's own answer for the case-folded diagnostic: the digest's spelling beside the message's. */
function foldedAnswer() {
  return answerForDiagnostic(FOLDED);
}

/**
 * The code the folded fixture lands on in the digest, read from the join's own answer rather than
 * written here.
 */
const FOLDED_DIGEST_CODE = foldedAnswer().findings[0].code;

/**
 * The shipped digest with the one entry the folded fixture lands on reduced to its code: the code and
 * no title. Every one of the shipped entries states a title, so this is the shape the shipped digest
 * cannot produce and the join still answers — a finding with the digest's spelling, no `title`, and the
 * message's spelling beside it (T025). Nothing is recorded from it: `derive()` reads the shipped digest,
 * and this digest is read only by the label-vocabulary probe below, which needs the sentence the pane
 * writes for that row.
 */
const TITLELESS_DIGEST = {
  version: DIGEST.version,
  entries: DIGEST.entries.map((entry) =>
    entry.code === FOLDED_DIGEST_CODE ? { code: entry.code } : entry,
  ),
};

/** The join's own answer for the folded diagnostic where the digest states no title for its code. */
function titlelessFoldedAnswer() {
  return clone(JOIN.consoleJoin([FOLDED], TITLELESS_DIGEST));
}

/**
 * The answers this suite hands the pane so that every branch it can take is taken, each named by what
 * it reaches. Two of them — the titleless finding and the unmodelled reason — are this suite's own and
 * not the join's, for the reason stated above the block: no answer the join can give reaches those two
 * branches at this head. The third, the folded row with no title, is the join's own over a digest that
 * states no title for the folded code, which is the shape T025 repaired and no recorded case carries.
 */
const PANE_PROBES = [
  ['a joined answer that carried no finding', { state: JOINED, findings: [] }],
  [
    'a capture that was read and carried no diagnostic',
    { state: CAPTURED_NOTHING, findings: [] },
  ],
  [
    'no capture handed to the join at all',
    { state: 'no-diagnostics', findings: [] },
  ],
  ['no answer at all', undefined],
  ['an answer that carried no state word', { findings: [] }],
  [
    'a code the digest carries, with its own title',
    answerForDiagnostic(MATCHED),
  ],
  ['a message that carried no code', answerForDiagnostic(UNCODED)],
  [
    'a code the digest lacks, with the join’s one reason',
    answerForDiagnostic(UNMATCHED),
  ],
  ['a code the digest matched only by folding case', foldedAnswer()],
  [
    'a code the digest matched only by folding case, with no title in the digest',
    titlelessFoldedAnswer(),
  ],
  [
    'a list entry that is not a finding',
    { state: JOINED, findings: ['not a finding'] },
  ],
  [
    'a finding the digest carries no title for',
    {
      state: JOINED,
      findings: [
        {
          text: 'NG0100: a message with no title beside it',
          code: MATCHED.code,
        },
      ],
    },
  ],
  [
    'a reason the join was not written for',
    {
      state: JOINED,
      findings: [
        {
          text: 'NG0100: a message with a reason beside it',
          code: MATCHED.code,
          title: shippedTitle(MATCHED.code),
          reason: 'a-reason-the-join-does-not-state',
        },
      ],
    },
  ],
];

/** The labels the pane writes, read off the lines it renders for the probe answers. */
function labelsThePaneWrites(module) {
  const labels = new Set();
  for (const [reaches, answer] of PANE_PROBES) {
    const surface = module.consolePanel(answer);
    assert.ok(
      Array.isArray(surface.lines) && surface.lines.length > 0,
      `label-vocabulary: the probe ${JSON.stringify(reaches)} must render at least one line, or this reading reads nothing`,
    );
    for (const line of surface.lines) labels.add(lineLabel(line));
  }
  return labels;
}

/**
 * The labels the recording's own bytes render, read off every recorded `surface.lines` entry. This is
 * a fact about the record and not about the pane: the labels it leaves unrendered are whichever ones
 * no case in `cases[]` writes, so the broad rationale above states no number that the record's bytes
 * could move away from.
 */
function labelsTheRecordRenders() {
  const labels = new Set();
  for (const entry of recorded().cases)
    for (const line of entry.surface.lines) labels.add(lineLabel(line));
  return labels;
}

/**
 * The labels of the sentences the pane exports, as `[label, where it was read]` pairs: every exported
 * string that is itself a labelled sentence, every one inside an exported table of sentences
 * (`STATE_TEXTS`), and the two exported sentence builders run with the codes the join produces.
 */
function labelsThePaneExports(module) {
  const labels = new Map();
  const sentence = (value) =>
    typeof value === 'string' && /^[a-z][a-z-]*: /.test(value);
  for (const [name, value] of Object.entries(module)) {
    if (sentence(value)) labels.set(lineLabel(value), `the sentence ${name}`);
    else if (value !== null && typeof value === 'object')
      for (const [key, inner] of Object.entries(value))
        if (sentence(inner))
          labels.set(
            lineLabel(inner),
            `the sentence ${name}[${JSON.stringify(key)}]`,
          );
  }
  const absent = answerForDiagnostic(UNMATCHED).findings[0];
  const folded = foldedAnswer().findings[0];
  for (const [name, built] of [
    ['noDigestEntryText', module.noDigestEntryText?.(absent.code)],
    [
      'caseFoldedMatchText',
      module.caseFoldedMatchText?.(folded.carriedCode, folded.code),
    ],
  ]) {
    assert.ok(
      sentence(built),
      `label-vocabulary: the pane must export ${name} as a builder of a labelled sentence, or this reading proves nothing; it built ${JSON.stringify(built)}`,
    );
    labels.set(lineLabel(built), `the sentence ${name} builds`);
  }
  assert.ok(
    labels.size > 0,
    'label-vocabulary: the pane must state at least one sentence of its own, or this reading proves nothing',
  );
  return labels;
}

/**
 * The labels the pane writes into a line in its own body — `lines.push(`code: ${code}`)` — read off
 * the module's source rather than off a rendering, so a label written on a branch no probe answer
 * reaches is still read. A sentence built in a helper is read by the export reading above.
 */
function labelsThePanePushes(source) {
  const labels = new Map();
  for (const match of source.matchAll(/lines\.push\(\s*`([a-z][a-z-]*): /g))
    labels.set(match[1], 'a labelled line the pane pushes itself');
  return labels;
}

/**
 * SC5/E7: the record's label vocabulary is the pane's, in both directions. The record states which
 * labels the pane can write; this reads the labels the shipped module can write and fails naming what
 * the record omits and what it carries that the pane cannot write, so drift of this kind reddens at the
 * moment it is introduced rather than when a case first renders the missing label. The module and its
 * source are parameters so a mutated copy can be held to the same pin, which is how the two directions
 * are proven to be live.
 */
function pinTheVocabularyIsThePane(
  contract,
  module = SURFACE,
  source = SURFACE_SRC,
) {
  const labels = contract.lineLabels;
  assert.ok(
    Array.isArray(labels) && labels.length > 0,
    `label-vocabulary: the record must state the labels the pane can write; its contract carries ${JSON.stringify(labels)}`,
  );
  assert.equal(
    new Set(labels).size,
    labels.length,
    `label-vocabulary: the record's list must state each label once; it carries ${JSON.stringify(labels)}`,
  );

  const written = labelsThePaneWrites(module);
  const exported = labelsThePaneExports(module);
  const pushed = labelsThePanePushes(source);

  for (const [label, where] of [...exported, ...pushed]) {
    assert.ok(
      written.has(label),
      `label-vocabulary: the pane states a sentence labelled ${JSON.stringify(label)} (${where}), and no answer in this suite's probes renders it, so the comparison below could pass while that label went unread; add the answer that reaches it`,
    );
  }

  const named = (set) =>
    [...set]
      .sort()
      .map((label) => JSON.stringify(label))
      .join(', ');
  const added = [...written].filter((label) => !labels.includes(label)).sort();
  const missing = labels.filter((label) => !written.has(label)).sort();
  assert.deepEqual(
    added,
    [],
    `label-vocabulary: the pane writes ${added.length} label(s) the record's contract.lineLabels does not carry: ${named(added)} — the record states which labels the pane writes, so a label the pane writes and the record omits is drift; the list would have to carry ${named(new Set([...labels, ...written]))}`,
  );
  assert.deepEqual(
    missing,
    [],
    `label-vocabulary: the record's contract.lineLabels carries ${missing.length} label(s) the pane writes no line for: ${named(missing)} — the record states which labels the pane writes, so a label it carries and the pane cannot write is drift; the list would have to carry ${named(written)}`,
  );
  for (const word of contract.prohibitedWording ?? []) {
    assert.equal(
      labels.includes(word),
      false,
      `label-vocabulary: ${JSON.stringify(word)} is forbidden wording and cannot also be a label the record states`,
    );
  }
  return written;
}

/**
 * T019: the registry's label, read off its own text so the two cannot disagree. Every registry entry
 * carries a labelled sentence, and its label is one of the labels the record states — the two
 * vocabularies are about the same lines, so a registry entry labelled with a word
 * `contract.lineLabels` does not carry would be a sentence the record could not record.
 */
function sentenceLabel(sentence) {
  return lineLabel(sentence.text);
}

/**
 * T019/AC4: the record's `contract.sentenceRegistry` and the pane's `PANE_SENTENCES` are one registry,
 * read in both directions — the same shape `pinTheVocabularyIsThePane` uses for the labels.
 *
 * Fails naming what moved: an entry the pane states and the record's copy lacks (so a sentence added
 * to the pane alone cannot be rendered until the record carries it too), an entry the record carries
 * and the pane does not write (so the record cannot bless a sentence the pane has no entry for), an
 * entry whose text, slots or state word differ on one side, and a registry label the record's own
 * label vocabulary does not carry. The module is a parameter so a mutated copy can be held to the same
 * pin, which is how both directions are proven live.
 */
function pinTheSentenceRegistryIsThePanes(
  contract,
  module = SURFACE,
  source = SURFACE_SRC,
) {
  const carried = contract.sentenceRegistry;
  assert.ok(
    Array.isArray(carried) && carried.length > 0,
    `sentence-registry: ${RECORD_REL} must carry the pane's own sentences in contract.sentenceRegistry, or the record cannot say which sentences the pane writes; its contract carries ${JSON.stringify(carried)}`,
  );
  const pane = module.PANE_SENTENCES;
  assert.ok(
    Array.isArray(pane) && pane.length > 0,
    `sentence-registry: the pane must enumerate its own sentences in PANE_SENTENCES, or this pin reads nothing; the module exports ${JSON.stringify(pane)}`,
  );
  const labelled = (ids) => ids.map((id) => JSON.stringify(id)).join(', ');
  const paneIds = pane.map((entry) => entry.id);
  const recordIds = carried.map((entry) => entry.id);
  assert.equal(
    new Set(recordIds).size,
    recordIds.length,
    `sentence-registry: the record's copy states each sentence once; its ids are ${JSON.stringify(recordIds)}`,
  );
  assert.equal(
    new Set(paneIds).size,
    paneIds.length,
    `sentence-registry: the pane registers each sentence once; its ids are ${JSON.stringify(paneIds)}`,
  );
  const added = paneIds.filter((id) => !recordIds.includes(id));
  assert.deepEqual(
    added,
    [],
    `sentence-registry: the pane states ${added.length} sentence(s) the record's contract.sentenceRegistry does not carry: ${labelled(added)} — the record states the sentences the pane writes, so an entry added to the pane alone is drift, and a sentence the record does not carry cannot be rendered by a pane this suite passes; the record would have to carry ${labelled(paneIds)}`,
  );
  const missing = recordIds.filter((id) => !paneIds.includes(id));
  assert.deepEqual(
    missing,
    [],
    `sentence-registry: the record's contract.sentenceRegistry carries ${missing.length} sentence(s) the pane does not write: ${labelled(missing)} — a recording cannot stand on a sentence the pane has no entry for; the pane states ${labelled(paneIds)}`,
  );
  for (const entry of pane) {
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
    const label = sentenceLabel(entry);
    assert.ok(
      (contract.lineLabels ?? []).includes(label),
      `sentence-registry: the entry ${JSON.stringify(entry.id)} renders the line ${JSON.stringify(label)}, and the record's contract.lineLabels does not carry that label; a registry whose labels the record cannot record is a registry it does not state`,
    );
    assert.equal(
      entry.state === null ? null : label,
      entry.state,
      `sentence-registry: the entry ${JSON.stringify(entry.id)} answers the state word ${JSON.stringify(entry.state)} and its line is labelled ${JSON.stringify(label)}, so a reader would read one state and the pane report another`,
    );
  }
  // The pane's own reading of its registry is the record's copy, so the two are not two lists that
  // happen to agree: the module's `PANE_SENTENCES` is what must equal the copy, and the source names
  // it, so a pane that resolved its sentences from somewhere else would redden here.
  assert.ok(
    source.includes('export const PANE_SENTENCES'),
    'sentence-registry: the pane must declare the registry this pin reads as `export const PANE_SENTENCES`, or the module and its source could disagree about where the sentences come from',
  );
  return carried;
}

/**
 * T019/AC1 and AC4, on the recording's own bytes: every pane-written line of a recorded surface is a
 * labelled fact the recorded answer states or an entry of the registry the record's own contract
 * carries, with its slots filled from the recorded findings. A line that is neither is a sentence the
 * recording blessed and the pane has no entry for, and the failure names the line and the case.
 *
 * The two exemptions are the ones the prohibitions already use: the state line is the answer's word,
 * and a `code` / `title` / `text` / `reason` line is the answer's field. A recorded fact that is not
 * one the recorded answer states reddens too, so the exemption cannot be widened by writing one.
 *
 * The slot values are the recorded findings' own, so a sentence naming a code the recording does not
 * carry is not a line this pin will accept. `case-difference` is filled from a finding that carries
 * both `code` and `carriedCode` — the record's finding shape gained `carriedCode` (T023), which is
 * what lets the folded case this record now carries render its own sentence; a line whose two
 * spellings are not a recorded finding's reddens as a sentence outside the recording's registry. The
 * second wording a folded match takes, `case-difference-no-title` (T025), is filled only from a finding
 * of the shape it is written for — both spellings and no `title` — so no recording can bless the title
 * claim on a row that carries none, or the absence of one on a row that does.
 */
function pinRecordedLinesAreRegistrySentences(entry, contract) {
  const carried = contract.sentenceRegistry;
  assert.ok(
    Array.isArray(carried) && carried.length > 0,
    `sentence-registry: ${RECORD_REL} must carry the pane's sentences in contract.sentenceRegistry, or the recording cannot be held to them; its contract carries ${JSON.stringify(carried)}`,
  );
  const texts = new Set();
  for (const sentence of carried) {
    if (sentence.slots.length === 0) {
      texts.add(sentence.text);
      continue;
    }
    if (sentence.id === 'no-digest-entry') {
      for (const finding of entry.findings)
        if (
          finding.reason === NO_DIGEST_ENTRY &&
          typeof finding.code === 'string'
        )
          texts.add(sentence.text.split('{code}').join(finding.code));
      continue;
    }
    if (sentence.id === 'case-difference') {
      for (const finding of entry.findings)
        if (
          typeof finding.carriedCode === 'string' &&
          typeof finding.code === 'string'
        )
          texts.add(
            sentence.text
              .split('{carriedCode}')
              .join(finding.carriedCode)
              .split('{digestCode}')
              .join(finding.code),
          );
      continue;
    }
    if (sentence.id === 'case-difference-no-title') {
      // T025: the wording for a folded row that carries no title. It is filled only from a recorded
      // finding of that shape, so a recording that blessed the titled wording on a titleless row — or
      // this wording on a row that does carry a title — reddens as a sentence outside its registry.
      for (const finding of entry.findings)
        if (
          typeof finding.carriedCode === 'string' &&
          typeof finding.code === 'string' &&
          typeof finding.title !== 'string'
        )
          texts.add(
            sentence.text
              .split('{carriedCode}')
              .join(finding.carriedCode)
              .split('{digestCode}')
              .join(finding.code),
          );
    }
  }
  const facts = new Set([`state: ${entry.state}`]);
  for (const finding of entry.findings) {
    if (typeof finding.text === 'string') facts.add(`text: ${finding.text}`);
    if (typeof finding.code === 'string') facts.add(`code: ${finding.code}`);
    if (typeof finding.title === 'string') facts.add(`title: ${finding.title}`);
    if (
      typeof finding.reason === 'string' &&
      finding.reason !== NO_DIGEST_ENTRY
    )
      facts.add(`reason: ${finding.reason}`);
  }
  for (const [index, line] of entry.surface.lines.entries()) {
    const label = lineLabel(line);
    if (label === 'state' || CARRIED_FIELDS.includes(label)) {
      assert.ok(
        facts.has(line),
        `renders-from-the-registry: ${entry.id} surface line ${index} is ${JSON.stringify(line)}, and the recorded answer states no such fact; a line labelled ${JSON.stringify(label)} carries the answer's own words, so it cannot be one the recording invented`,
      );
      continue;
    }
    assert.ok(
      texts.has(line),
      `renders-from-the-registry: ${entry.id} surface line ${index} is ${JSON.stringify(line)}, and that line is neither a labelled fact the recorded answer states nor one of the sentences the record's contract.sentenceRegistry carries — the recording cannot bless a sentence the pane has no registry entry for; the registry records ${JSON.stringify([...texts])}`,
    );
  }
}

/**
 * The join's contract, held against the diagnostics the case handed over: one finding per diagnostic
 * in capture order, `code` present exactly when the message carried one, `reason` present exactly
 * when the digest lacks the code it carried, and `carriedCode` present exactly where the digest
 * matched that code only by folding case.
 */
function pinHoldsTheJoinContract(entry) {
  if (!entry.input.handedOver) {
    assert.deepEqual(
      entry.findings,
      [],
      `findings: ${entry.id} handed no capture over, so it carries no finding`,
    );
    return;
  }
  assert.equal(
    entry.findings.length,
    entry.input.diagnostics.length,
    `findings: ${entry.id} handed over ${entry.input.diagnostics.length} diagnostic(s) and records ${entry.findings.length} finding(s); the join answers one finding per diagnostic`,
  );
  entry.findings.forEach((finding, index) => {
    const diagnostic = entry.input.diagnostics[index];
    const carried = diagnostic.code;
    const carriesCode = typeof carried === 'string' && carried.trim() !== '';
    assert.equal(
      'code' in finding,
      carriesCode,
      `code: ${entry.id} finding ${index} ${carriesCode ? `must carry ${carried} because the message carried it` : 'must carry no code because the message carried none'}`,
    );
    assert.equal(
      finding.text.startsWith(String(diagnostic.message)),
      true,
      `text: ${entry.id} finding ${index} must carry the message the fixture states; it records ${JSON.stringify(finding.text)}`,
    );
    if (carriesCode) {
      const spelling = carried.trim();
      const exactEntry =
        DIGEST.entries.find((candidate) => candidate.code === spelling) ?? null;
      const foldedEntry =
        exactEntry === null
          ? (DIGEST.entries.find(
              (candidate) =>
                typeof candidate.code === 'string' &&
                asciiFolded(candidate.code) === asciiFolded(spelling),
            ) ?? null)
          : null;
      const matched = exactEntry ?? foldedEntry;
      const folded = foldedEntry !== null;
      assert.equal(
        'carriedCode' in finding,
        folded,
        `carriedCode: ${entry.id} finding ${index} carries the code ${spelling}, which the digest ${folded ? `matched only after folding case, so the message's spelling belongs beside the digest's` : 'did not reach only by folding case, so no second spelling belongs on it'}`,
      );
      if (folded) {
        assert.equal(
          finding.code,
          foldedEntry.code,
          `carriedCode: ${entry.id} finding ${index} must carry the digest's own spelling ${foldedEntry.code} as its code; it records ${JSON.stringify(finding.code)}`,
        );
        assert.equal(
          finding.carriedCode,
          spelling,
          `carriedCode: ${entry.id} finding ${index} must carry the spelling the message used ${spelling}; it records ${JSON.stringify(finding.carriedCode)}`,
        );
      }
      assert.equal(
        'reason' in finding,
        matched === null,
        `reason: ${entry.id} finding ${index} carries the code ${spelling}, which the digest ${matched === null ? 'lacks, so the reason belongs on it' : 'carries, so no reason belongs on it'}`,
      );
      assert.equal(
        'title' in finding,
        matched !== null && typeof matched.title === 'string',
        `title: ${entry.id} finding ${index} carries the code ${spelling}, which the digest ${matched !== null && typeof matched.title === 'string' ? 'carries with a title, so its title belongs on the finding' : 'does not carry with a title, so no title belongs on it'}`,
      );
    }
  });
}

/** SC4: the two absences the join distinguishes are two different statements, not one pane. */
function pinTheTwoAbsencesDiffer(nothing, none) {
  assert.equal(
    nothing.state,
    CAPTURED_NOTHING,
    `two-absences: the empty capture is ${CAPTURED_NOTHING}; it recorded ${JSON.stringify(nothing.state)}`,
  );
  assert.equal(
    none.state,
    'no-diagnostics',
    `two-absences: the capture that was never handed over is no-diagnostics; it recorded ${JSON.stringify(none.state)}`,
  );
  assert.notEqual(
    nothing.surface.text,
    none.surface.text,
    `two-absences: captured-nothing and no-diagnostics are different statements, and the pane rendered ${JSON.stringify(nothing.surface.text)} for both`,
  );
  assert.equal(
    nothing.surface.text.includes('no-diagnostics'),
    false,
    'two-absences: a capture that was read and carried nothing is never reported as one that was never read',
  );
  assert.equal(
    none.surface.text.includes(CAPTURED_NOTHING),
    false,
    'two-absences: a capture that was never handed over is never reported as one that came back empty',
  );
}

// ---------------------------------------------------------------------- the mutants ----

let mutantDir = null;
let mutantCount = 0;

/**
 * A copy of the pane's source with one anchored replacement applied. The anchor must occur exactly
 * once, so a mutation cannot silently rewrite a different branch, and the result must differ from the
 * source, so a no-op mutation is a failure rather than a green mutant. The copy is written under this
 * run's own temp directory, never into the checkout.
 */
async function loadMutant(anchor, replacement) {
  assert.ok(
    SURFACE_SRC.includes(anchor),
    `mutation anchor not found in the pane: ${JSON.stringify(anchor)}`,
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
    `the mutation must change the pane: ${JSON.stringify(anchor)}`,
  );
  mutantDir ??= mkdtempSync(join(tmpdir(), 'console-panel-record-'));
  mutantCount += 1;
  const file = join(mutantDir, `mutant-${mutantCount}.ts`);
  writeFileSync(file, source, 'utf8');
  return { module: await import(pathToFileURL(file).href), source };
}

after(() => {
  if (mutantDir) rmSync(mutantDir, { recursive: true, force: true });
});

/** The pane's rendering of one recorded answer: the shipped module, or a mutated copy of it. */
function renderedBy(module, entry) {
  return clone(
    module.consolePanel({ state: entry.state, findings: entry.findings }),
  );
}

/**
 * The non-vacuous half of a mutant: the mutated copy is run through the same pin, the pin reddens,
 * and the failure names the defect. Every caller runs the pin against the shipped pane first, so the
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
  return failure;
}

/**
 * The two defects the record is written to catch, each one anchored edit of the pane's own source.
 * `caseId` is the case the pin is run on, and `exhibits` asserts the mutated copy really carries the
 * defect, so a mutation that fails to reproduce it is a failure rather than a green mutant.
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
    caseId: 'joined',
    pin: pinNamesTheAbsenceByCode,
    exhibits: (module) =>
      assert.ok(
        renderedBy(module, recordedCase('joined')).text.includes(
          '1 code the digest does not carry',
        ),
        'the mutant really renders a count where the code belongs',
      ),
    names: /a count is not a name/,
  },
  {
    id: 'captured-nothing-as-empty-list',
    defect: 'captured-nothing',
    anchor: '  if (state !== JOINED) return surface(state, lines);',
    replacement: '  if (state !== JOINED) return surface(state, []);',
    caseId: 'captured-nothing',
    pin: pinCapturedNothingStatesIt,
    exhibits: (module) =>
      assert.deepEqual(
        renderedBy(module, recordedCase('captured-nothing')).lines,
        [],
        'the mutant really renders an empty list for captured-nothing',
      ),
    names: /never an empty list/,
  },
  {
    id: 'remedy-spelled-fix',
    defect: 'recorded-vocabulary',
    anchor:
      "    text: 'no-diagnostics: no capture was handed to the join at all, so no capture was read',",
    replacement:
      "    text: 'no-diagnostics: no capture was handed to the join at all, so no capture was read, and to fix this, edit the binding',",
    caseId: 'no-diagnostics',
    pin: (entry, rendered) =>
      pinRecordsOnlyTheContractVocabulary(
        { ...entry, surface: rendered },
        recorded().contract,
      ),
    exhibits: (module) =>
      assert.ok(
        renderedBy(module, recordedCase('no-diagnostics')).text.includes(
          'to fix this',
        ),
        'the mutant really states a remedy without spelling "remedy"',
      ),
    names: /carries "fix"/,
  },
];

// -------------------------------------------------------------------------- the record ----

describe('the record is the derivation this head makes', () => {
  test('is the canonical serialisation of one JSON document', () => {
    const bytes = readFileSync(RECORD_PATH, 'utf8');
    assert.equal(
      canonical(recorded()),
      bytes,
      `${RECORD_REL} must be the canonical serialisation of its own content`,
    );
  });

  test('re-derives from the join, the digest and the pane this head carries', () => {
    const difference = firstDifference(recorded(), derive());
    assert.equal(
      difference,
      null,
      `${RECORD_REL} disagrees with this head at ${difference} (re-capture with M045_CAPTURE=1 after naming what moved)`,
    );
  });

  test('carries the command that writes it and the command that reads it', () => {
    const record = recorded();
    assert.equal(record.schema, SCHEMA);
    assert.equal(record.milestone, MILESTONE);
    assert.equal(record.task, TASK);
    assert.equal(record.capture.command, ARMED_COMMAND);
    assert.equal(record.capture.check, CHECK_COMMAND);
    assert.equal(record.capture.records, RECORD_REL);
    assert.deepEqual(record.contract.states, STATES);
    // T023/AC2: the finding contract is the join's, in both directions. `derive()` is what writes it
    // and `pinTheFindingContractIsTheJoins` reads the join over an answer that reaches every branch a
    // finding can take, so a field the join returns and the record omits reddens naming the field.
    // The pin runs first so its failure names the field rather than a bare deep-equal diff.
    pinTheFindingContractIsTheJoins(record.contract);
    assert.deepEqual(record.contract.finding, FINDING_CONTRACT);
    assert.deepEqual(record.contract.finding, derive().contract.finding);
    // T023/AC4: the record says whose registry `sentenceRegistry` is, and why the copy exists there.
    const provenance = record.contract.sentenceRegistryProvenance;
    assert.equal(
      typeof provenance,
      'string',
      `the record must state whose registry contract.sentenceRegistry is; its contract carries ${JSON.stringify(provenance)}`,
    );
    for (const fact of ['pane', 'PANE_SENTENCES', 'copied']) {
      assert.ok(
        provenance.includes(fact),
        `the record's sentenceRegistry provenance must name ${JSON.stringify(fact)}, and it states ${JSON.stringify(provenance)}`,
      );
    }
  });

  test('records no clock, no commit and no absolute path a second run would not reproduce', () => {
    const text = readFileSync(RECORD_PATH, 'utf8');
    const record = recorded();
    assert.equal(
      text.includes(ROOT),
      false,
      `${RECORD_REL} must carry no absolute path of the checkout it was measured in`,
    );
    for (const key of [
      'measuredAt',
      'recordedAt',
      'capturedAt',
      'commit',
      'head',
      'branch',
      'runId',
      'durationMs',
    ]) {
      assert.equal(
        Object.hasOwn(record, key),
        false,
        `${RECORD_REL} must carry no ${key}: a value a second run at the same path would re-derive differently`,
      );
    }
    assert.equal(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text),
      false,
      `${RECORD_REL} must carry no timestamp: the record is a reading of the tree, not of the run`,
    );
    // The only `timestamp` values are the fixture's own ordering, written as the small constants the
    // capture's payload shape has a slot for — not clock readings that a re-run would move.
    const stamps = record.cases.flatMap((entry) =>
      (entry.input.diagnostics ?? []).map((diagnostic) => diagnostic.timestamp),
    );
    assert.ok(
      stamps.length > 0 &&
        stamps.every(
          (value) => Number.isInteger(value) && value > 0 && value < 10,
        ),
      `every recorded timestamp must be one of the fixture's own constants; the record carries ${JSON.stringify(stamps)}`,
    );
  });

  test('a default run reads the recording and writes no byte', (t) => {
    if (CAPTURE) {
      t.skip('armed: this run writes the recording on purpose');
      return;
    }
    assert.equal(
      sha256(readFileSync(RECORD_PATH)),
      baseline,
      `${RECORD_REL} must carry the bytes it carried at load: a default run is a read`,
    );
  });

  test('the arming gate guards the one write to the recording', () => {
    const source = readFileSync(SELF_PATH, 'utf8');
    // The needle is assembled rather than written out, so this guard's own search does not read as a
    // second write in the file it is counting.
    const write = ['writeFileSync', '(', 'RECORD_PATH', ','].join('');
    const writes = source.split(write).length - 1;
    assert.equal(
      writes,
      1,
      `this suite must write the recording in exactly one place, and it names it ${writes} time(s)`,
    );
    const writer = source.indexOf('function capture()');
    assert.ok(
      writer >= 0 && source.indexOf(write) > writer,
      'the one write to the recording must sit inside capture(), which is the function an armed run calls',
    );
    const guard = source.indexOf('if (CAPTURE) {');
    assert.ok(
      guard >= 0 && source.indexOf('capture()', guard) > guard,
      'capture() must be called inside `if (CAPTURE) {`, so a default run could not write',
    );
    assert.ok(
      source.includes('mkdtempSync(join(tmpdir()'),
      'the mutant copies are written into this run’s own temp directory, never into the checkout',
    );
    assert.ok(
      source.includes('rmSync(mutantDir'),
      'the temp directory the mutant copies are written into is removed when the run ends',
    );
  });
});

describe('every case states what the join answered and what the pane rendered', () => {
  for (const id of CASES.map((entry) => entry.id)) {
    test(`${id}: state, findings and rendered lines`, () => {
      const entry = recordedCase(id);
      const rendered = renderedBy(SURFACE, entry);

      pinReportsTheRecordedState(entry, rendered);
      pinRendersEachRecordedFinding(entry, rendered);
      pinHoldsTheJoinContract(entry);
      // The recording, not the pane: the lines written into the file are held to the vocabulary the
      // file's own contract states, so an armed re-capture cannot bless a line the pane should not
      // have written.
      pinRecordsOnlyTheContractVocabulary(entry, recorded().contract);
      // The absence rule on the recorded bytes as well as on the pane's current output, so a
      // re-capture cannot bless a claim about the page that the render suite refuses.
      pinRecordedAbsenceStatement(entry, recorded().contract);
      // T019: and every pane-written line of the recorded surface is an entry of the registry the
      // record itself carries, or a labelled fact of the recorded answer — so the recording cannot
      // bless a sentence the pane has no entry for, armed re-capture or not.
      pinRecordedLinesAreRegistrySentences(entry, recorded().contract);

      assert.deepEqual(
        rendered.lines,
        entry.surface.lines,
        `${id}: the pane must render the lines the record states; it rendered ${JSON.stringify(rendered.lines)}`,
      );
      assert.equal(
        rendered.text,
        entry.surface.text,
        `${id}: the pane's text is its lines joined`,
      );
      console.log(`console pane ${id}: ${JSON.stringify(entry.surface.lines)}`);
    });
  }

  test('captured-nothing is that statement, never an empty list', () => {
    const entry = recordedCase('captured-nothing');
    pinCapturedNothingStatesIt(entry, renderedBy(SURFACE, entry));
  });

  test('a code the digest lacks is named, and a count instead would redden', () => {
    const entry = recordedCase('joined');
    pinNamesTheAbsenceByCode(entry, renderedBy(SURFACE, entry));
  });

  test('the two absences are two statements', () => {
    pinTheTwoAbsencesDiffer(
      recordedCase('captured-nothing'),
      recordedCase('no-diagnostics'),
    );
  });

  test('the digest’s own title and a captured "because" pass, and the exemption is what lets them', () => {
    const entry = recordedCase('digest-title-and-captured-wording');
    const rendered = renderedBy(SURFACE, entry);
    const title = shippedTitle(TITLED.code);
    // The positive case is not vacuous: the shipped digest's own title for the code really states a
    // word the pane may not write, and the captured message really says "because".
    assert.equal(
      typeof title,
      'string',
      `the shipped digest must carry a title for ${TITLED.code}, or this pin proves nothing`,
    );
    assert.match(
      title,
      prohibitedPattern('element'),
      `the digest's own title for ${TITLED.code} must carry a prohibited word (${JSON.stringify(title)}), or this pin proves nothing`,
    );
    assert.ok(
      rendered.lines.includes(`title: ${title}`),
      `the pane must render the digest's own title for ${TITLED.code}: ${JSON.stringify(`title: ${title}`)}; it rendered ${JSON.stringify(rendered.lines)}`,
    );
    assert.ok(
      rendered.lines.some(
        (line) =>
          line.startsWith('text: ') && prohibitedPattern('because').test(line),
      ),
      `a captured message saying "because" must render verbatim in a text line; the pane rendered ${JSON.stringify(rendered.lines)}`,
    );
    // Green on the recorded bytes: the title is the digest's word and the text is the capture's.
    pinRecordsOnlyTheContractVocabulary(entry, recorded().contract);
    console.log(
      `console pane ${entry.id}: ${JSON.stringify(entry.surface.lines)}`,
    );

    // The same bytes with the exemption removed: the list polices the digest's title and refuses a
    // correct pane, which is the defect this exemption exists to prevent.
    const widened = reddens('recorded-vocabulary', () =>
      pinRecordsOnlyTheContractVocabulary(entry, recorded().contract, []),
    );
    assert.match(widened.message, /carries "element"/);
    console.log(
      `exemption removed reddens: ${widened.message.replace(/\s+/g, ' ').trim()}`,
    );
  });

  test('every case carries a finding whose own text is the message the fixture states', () => {
    for (const entry of recorded().cases) {
      assert.equal(
        Object.keys(entry).includes('findings'),
        true,
        `${entry.id} must record the findings its answer carried`,
      );
      assert.ok(
        STATES.includes(entry.state),
        `${entry.id} records ${JSON.stringify(entry.state)}, which is not a state the join answers`,
      );
    }
  });
});

/**
 * The sentences wave 3's cycle-4 review measured passing the absence rule and then blessed into the
 * recording with an armed capture, plus the one the older phrase list policed — each with what it
 * states and why the rule cannot see it. None of them is a sentence the pane may render: a wording
 * exists in the pane only as an entry of `PANE_SENTENCES`, and this record refuses to carry an entry
 * the pane writes.
 *
 * The last is `the digest states the page's silence`, and it is settled in
 * `scripts/console-panel-render.test.mjs`: it is *impossible to render* rather than refused by the
 * rule — the rule passes it, because `digest` is both a read subject and a read action and `page's` is
 * not a word the rule carries — and what refuses it is the enumeration on this side too.
 */
const UNRENDERABLE_SENTENCES = [
  [
    "the capture reflects the page's silence",
    'a possessive nominalisation, whose verb the rule decides by "capture"',
  ],
  [
    'no diagnostic was reported',
    'an agentless passive whose participle is one of the read actions',
  ],
  [
    'this is never a claim that the page was silent, and it rendered nothing',
    'a lawful denial, then a pronoun that stands because "rendered" is a pane action',
  ],
  [
    'the capture was not empty before the page ran clean',
    'a denial about the capture, taken to govern the page word after it',
  ],
  [
    "the digest states the page's silence",
    'a page possessive as the object of a read action, which the rule does not read',
  ],
];

describe('the record’s label vocabulary is the pane’s, read both ways', () => {
  test('the record states exactly the labels the pane can write', () => {
    const written = pinTheVocabularyIsThePane(recorded().contract);
    assert.deepEqual(
      [...written].sort(),
      [...LINE_LABELS].sort(),
      `label-vocabulary: this suite writes ${JSON.stringify([...LINE_LABELS].sort())} into the record and the pane writes ${JSON.stringify([...written].sort())}; the two must be one vocabulary`,
    );
    assert.equal(
      written.size,
      LINE_LABELS.length,
      `label-vocabulary: the pane writes ${written.size} label(s) and the record states ${LINE_LABELS.length}; the two are one vocabulary or they are not`,
    );
    console.log(
      `pane label vocabulary (${written.size}): ${[...written].sort().join(', ')}`,
    );
    // T023/AC3: the labels the recording's own bytes leave unrendered are a fact about the record,
    // counted here rather than asserted as a fixed number in the rationale above. Every label is
    // either rendered by a recorded case or named as one no case renders, so the count is the
    // record's own: the list and the cases cannot disagree about it.
    const renderedLabels = labelsTheRecordRenders();
    const unrendered = LINE_LABELS.filter(
      (label) => !renderedLabels.has(label),
    ).sort();
    assert.deepEqual(
      [...renderedLabels].filter((label) => !LINE_LABELS.includes(label)),
      [],
      `label-vocabulary: the record renders ${JSON.stringify([...renderedLabels].filter((label) => !LINE_LABELS.includes(label)))} label(s) its contract.lineLabels does not carry; the record's own bytes are held to the vocabulary it states`,
    );
    assert.ok(
      renderedLabels.has(SURFACE.CASE_DIFFERENCE),
      `label-vocabulary: the record must render ${JSON.stringify(SURFACE.CASE_DIFFERENCE)} from a recorded case, or the count logged below describes a record that cannot hold the folded match; it renders ${JSON.stringify([...renderedLabels].sort())}`,
    );
    console.log(
      `the record renders ${renderedLabels.size} of ${LINE_LABELS.length} labels; no recorded case renders: ${unrendered.length === 0 ? 'none' : unrendered.join(', ')}`,
    );
    // T019: the record's copy of the pane's sentences is the pane's, and it is this suite's constant
    // that writes it — so the record, the constant and the module are one registry, read both ways.
    const sentences = pinTheSentenceRegistryIsThePanes(recorded().contract);
    assert.deepEqual(
      sentences,
      SENTENCE_REGISTRY,
      'sentence-registry: the contract.sentenceRegistry this suite writes into the record must be the constant above, or the record and this suite state two registries',
    );
    assert.equal(
      sentences.length,
      SENTENCE_REGISTRY.length,
      `sentence-registry: the record states ${sentences.length} sentence(s) and this suite writes ${SENTENCE_REGISTRY.length}; the two are one registry or they are not`,
    );
    console.log(
      `pane sentence registry (${sentences.length}): ${sentences.map((sentence) => sentence.id).join(', ')}`,
    );
  });

  test('a case-difference line the pane really renders passes the record’s pins, and the fourteen-label list reddened on it', () => {
    const answer = foldedAnswer();
    const finding = answer.findings[0];
    assert.equal(
      typeof finding.carriedCode,
      'string',
      `case-difference: the join must hand the pane a spelling the digest did not carry, or this probe proves nothing; it answered ${JSON.stringify(answer)}`,
    );
    const rendered = clone(SURFACE.consolePanel(answer));
    const sentence = rendered.lines.find((line) =>
      line.startsWith(`${SURFACE.CASE_DIFFERENCE}: `),
    );
    assert.ok(
      sentence,
      `case-difference: the shipped pane must state the folded match in a sentence of its own, labelled ${JSON.stringify(SURFACE.CASE_DIFFERENCE)}; it rendered ${JSON.stringify(rendered.lines)}`,
    );
    // The sentence names both spellings, so it is the difference the row shows and not a restatement.
    assert.ok(sentence.includes(finding.carriedCode));
    assert.ok(sentence.includes(finding.code));
    const entry = {
      id: 'case-difference',
      state: answer.state,
      findings: answer.findings.map(findingRecord),
      surface: {
        state: rendered.state,
        kind: rendered.kind,
        message: rendered.message,
        lines: rendered.lines,
        text: rendered.text,
      },
    };
    // Green on the record's own contract: a case that rendered this sentence does not redden the
    // record's pin. The list it is held to is the repaired one, read from the file.
    pinRecordsOnlyTheContractVocabulary(entry, recorded().contract);
    pinRecordedAbsenceStatement(entry, recorded().contract);
    // And the line is load-bearing: the fourteen-label list the review measured reddens on it, in the
    // record's own words, so the entry is what lets the sentence be recorded and not a widening.
    const before = recorded().contract.lineLabels.filter(
      (label) => label !== SURFACE.CASE_DIFFERENCE,
    );
    assert.equal(before.length, recorded().contract.lineLabels.length - 1);
    const failure = reddens('recorded-vocabulary', () =>
      pinRecordsOnlyTheContractVocabulary(entry, {
        ...recorded().contract,
        lineLabels: before,
      }),
    );
    assert.match(
      failure.message,
      /is labelled "case-difference", which the record's contract does not carry/,
    );
    console.log(
      `case-difference line reddens the fourteen-label list: ${failure.message.replace(/\s+/g, ' ').trim()}`,
    );
    // T023/AC1: the record now carries the folded case end to end, rather than this probe being the
    // only place the sentence is rendered. The recorded case's findings are the join's own answer for
    // the diagnostic it hands over, one of them carries `carriedCode`, and its pane lines include the
    // `case-difference:` sentence built from that recorded finding — so the unarmed suite's pins are
    // what hold the recording, not a probe standing beside it.
    const recordedFolded = recordedCase('case-folded-match');
    const joinAnswer = answerFor({
      handedOver: true,
      diagnostics: [FOLDED],
    });
    assert.deepEqual(
      recordedFolded.findings,
      joinAnswer.findings.map(findingRecord),
      `case-difference: the recorded folded case must be the join's own answer; it records ${JSON.stringify(recordedFolded.findings)} and the join answers ${JSON.stringify(joinAnswer.findings)}`,
    );
    const recordedDifference = recordedFolded.findings.find(
      (candidate) =>
        typeof candidate.carriedCode === 'string' &&
        typeof candidate.code === 'string',
    );
    assert.ok(
      recordedDifference,
      `case-difference: the recorded folded case must carry the message's spelling beside the digest's; it records ${JSON.stringify(recordedFolded.findings)}`,
    );
    const recordedSentence = SURFACE.caseFoldedMatchText(
      recordedDifference.carriedCode,
      recordedDifference.code,
    );
    assert.ok(
      recordedFolded.surface.lines.includes(recordedSentence),
      `case-difference: the recorded folded case's pane lines must include ${JSON.stringify(recordedSentence)}; it records ${JSON.stringify(recordedFolded.surface.lines)}`,
    );
    console.log(
      `the record carries the folded case: ${JSON.stringify(recordedFolded.surface.lines.find((line) => line.startsWith(`${SURFACE.CASE_DIFFERENCE}: `)))}`,
    );
  });

  test('a label added to the pane alone reddens the record, and a label added to the record alone reddens too', async () => {
    const contract = recorded().contract;
    // Green on the shipped pane and the record's own list first, so both failures below are the
    // mutation's and not a defect this head already carries.
    pinTheVocabularyIsThePane(contract);
    pinTheSentenceRegistryIsThePanes(contract);

    // (1) The pane gains a line the record's list does not carry. Nothing is written into the
    // recording: the mutant is a copy in this run's temp directory, and it is the pin that reads it.
    const pane = await loadMutant(
      '  lines.push(`text: ${text}`);',
      '  lines.push(`text: ${text}`);\n  lines.push(`cause: the message states one`);',
    );
    const paneFailure = reddens('label-vocabulary', () =>
      pinTheVocabularyIsThePane(contract, pane.module, pane.source),
    );
    assert.match(paneFailure.message, /does not carry/);
    assert.ok(
      paneFailure.message.includes('"cause"'),
      `the failure must name the label the pane gained; it failed with ${paneFailure.message}`,
    );
    console.log(
      `a label added to the pane alone reddens: ${paneFailure.message.replace(/\s+/g, ' ').trim()}`,
    );

    // (2) The record gains a label the pane cannot write, in memory: the same pin names it as the
    // record's own, so the list cannot be widened to let a sentence pass either.
    const recordFailure = reddens('label-vocabulary', () =>
      pinTheVocabularyIsThePane({
        ...contract,
        lineLabels: [...contract.lineLabels, 'cause'],
      }),
    );
    assert.match(recordFailure.message, /writes no line for/);
    assert.ok(
      recordFailure.message.includes('"cause"'),
      `the failure must name the label the record gained; it failed with ${recordFailure.message}`,
    );
    console.log(
      `a label added to the record alone reddens: ${recordFailure.message.replace(/\s+/g, ' ').trim()}`,
    );

    // (3) T019: the pane's registry gains a whole entry the record's copy does not carry. This is the
    // half that makes a new sentence impossible to smuggle in — the pane can render one only by
    // registering it, and the record refuses to stand on an entry it does not state itself.
    const registryPane = await loadMutant(
      [
        "    slots: ['carriedCode', 'digestCode'],",
        '    state: null,',
        '  },',
        '];',
      ].join('\n'),
      [
        "    slots: ['carriedCode', 'digestCode'],",
        '    state: null,',
        '  },',
        '  {',
        "    id: 'a-sentence-the-record-lacks',",
        "    text: 'a-sentence-the-record-lacks: no capture was handed over, so nothing was read',",
        '    slots: [],',
        '    state: null,',
        '  },',
        '];',
      ].join('\n'),
    );
    const registryFailure = reddens('sentence-registry', () =>
      pinTheSentenceRegistryIsThePanes(
        contract,
        registryPane.module,
        registryPane.source,
      ),
    );
    assert.match(registryFailure.message, /does not carry/);
    assert.ok(
      registryFailure.message.includes('"a-sentence-the-record-lacks"'),
      `the failure must name the entry the pane gained; it failed with ${registryFailure.message}`,
    );
    console.log(
      `a sentence added to the pane alone reddens the record: ${registryFailure.message.replace(/\s+/g, ' ').trim()}`,
    );

    // (4) The record's copy gains a sentence the pane has no entry for, in memory: the same pin names
    // it as the record's own, so the copy cannot be widened to let a sentence pass either.
    const recordRegistry = reddens('sentence-registry', () =>
      pinTheSentenceRegistryIsThePanes({
        ...contract,
        sentenceRegistry: [
          ...contract.sentenceRegistry,
          {
            id: 'a-sentence-nobody-writes',
            text: 'a-sentence-nobody-writes: the page logged nothing',
            slots: [],
            state: null,
          },
        ],
      }),
    );
    assert.match(recordRegistry.message, /the pane does not write/);
    assert.ok(
      recordRegistry.message.includes('"a-sentence-nobody-writes"'),
      `the failure must name the entry the record gained; it failed with ${recordRegistry.message}`,
    );
    console.log(
      `a sentence added to the record alone reddens: ${recordRegistry.message.replace(/\s+/g, ' ').trim()}`,
    );

    // (5) T019/AC2: each of the four sentences wave 3's cycle-4 review measured, and the one the older
    // phrase list policed, is refused on this side too. The pane registers the wording — which is the
    // only way it could render it — and the record refuses to bless the entry, naming the sentence it
    // does not carry. So a re-capture cannot make any of them true.
    for (const [sentence, what] of UNRENDERABLE_SENTENCES) {
      const line = `no-diagnostics: ${sentence}`;
      const pane = await loadMutant(
        "    text: 'no-diagnostics: no capture was handed to the join at all, so no capture was read',",
        `    text: ${JSON.stringify(line)},`,
      );
      assert.equal(
        pane.module.PANE_SENTENCES.find(
          (entry) => entry.id === 'state-no-diagnostics',
        ).text,
        line,
        `the mutant must really register ${JSON.stringify(line)}, or this probe proves nothing`,
      );
      const failure = reddens('sentence-registry', () =>
        pinTheSentenceRegistryIsThePanes(contract, pane.module, pane.source),
      );
      assert.ok(
        failure.message.includes(line),
        `the record must refuse ${JSON.stringify(line)} naming the sentence it does not carry; it failed with ${failure.message}`,
      );
      console.log(
        `the pane's new sentence is refused by the record: ${JSON.stringify(sentence)} — ${what}; ${failure.message.replace(/\s+/g, ' ').trim()}`,
      );
    }

    // (6) And the recording's own bytes: a case whose surface carries one of those sentences — exactly
    // what an armed re-capture writes once the pane renders one — reddens the pin that holds every
    // pane-written line to the report's own registry, so the file itself cannot bless the wording.
    const nothing = recordedCase('no-diagnostics');
    const blessed = {
      ...nothing,
      surface: {
        ...nothing.surface,
        lines: [
          nothing.surface.lines[0],
          `no-diagnostics: ${UNRENDERABLE_SENTENCES[0][0]}`,
        ],
      },
    };
    const blessedFailure = reddens('renders-from-the-registry', () =>
      pinRecordedLinesAreRegistrySentences(blessed, contract),
    );
    assert.ok(
      blessedFailure.message.includes(UNRENDERABLE_SENTENCES[0][0]),
      `the failure must name the sentence the recording blessed; it failed with ${blessedFailure.message}`,
    );
    console.log(
      `a blessed sentence reddens on the recorded bytes: ${blessedFailure.message.replace(/\s+/g, ' ').trim()}`,
    );
  });
});

describe('the absence rule is the record’s, and the recording cannot bless a claim about the page', () => {
  test('the record states the rule once, and this suite is what writes it', () => {
    const rule = recorded().contract.absenceStatement;
    assert.deepEqual(
      rule,
      ABSENCE_STATEMENT,
      'the record and this suite must state the same absence rule, or the pin proves a rule nobody states',
    );
    assert.ok(
      typeof rule.rule === 'string' && rule.rule.length > 200,
      `the record must state the property and not only its vocabulary; it states ${JSON.stringify(rule.rule)}`,
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
    // The words the Sibling task added to the wording list are a different rule and stay where they
    // are: the absence rule reads subjects and actions, and it refuses or allows a word by its place
    // in the sentence, not by its presence.
    for (const word of [
      'since',
      'dom',
      'node',
      'solution',
      'repair',
      'framework',
      'number',
    ])
      assert.ok(
        recorded().contract.prohibitedWording.includes(word),
        `the wording list must still carry ${JSON.stringify(word)}: the absence rule is a different rule`,
      );
    assert.ok(recorded().contract.prohibitedWording.includes('fix'));
  });

  test('the shipped sentences pass, including the one that says a failed capture emits nothing', () => {
    const contract = recorded().contract;
    const nothing = recordedCase('captured-nothing');
    pinRecordedAbsenceStatement(nothing, contract);
    assert.ok(
      nothing.surface.lines.some((line) =>
        line.includes('a capture whose own attempt failed also emits nothing'),
      ),
      `the recorded captured-nothing sentence must still say what a failed capture did: ${JSON.stringify(nothing.surface.lines)}`,
    );
    assert.ok(
      nothing.surface.lines.some((line) =>
        line.includes('never that the page was silent'),
      ),
      `the recorded captured-nothing sentence must still carry its denial: ${JSON.stringify(nothing.surface.lines)}`,
    );
    // A pane-written sentence that merely describes what was read passes, in words the record does
    // not carry: the rule is not a snapshot of the recorded sentences.
    const none = recordedCase('no-diagnostics');
    const written = {
      ...none,
      surface: {
        ...none.surface,
        lines: [
          none.surface.lines[0],
          'no-diagnostics: no capture was handed to the join at all, so no capture was read and no finding is rendered',
        ],
      },
    };
    pinRecordedAbsenceStatement(written, contract);
    // And the denial is the other side of the boundary: the same claim, denied, passes.
    pinRecordedAbsenceStatement(
      {
        ...none,
        surface: {
          ...none.surface,
          lines: [
            none.surface.lines[0],
            'no-diagnostics: no capture was handed to the join at all, and this is never a claim that the page emitted nothing',
          ],
        },
      },
      contract,
    );
  });

  test('a claim about the page reddens, in three wordings the old phrase list never matched, across three states', () => {
    const contract = recorded().contract;
    const oldPhraseList = [
      /\bsilen(ce|t)\b/gi,
      /\bthe page (produced|reported|logged|said|showed) nothing\b/gi,
      /\bnothing (was|has been) (logged|captured|reported)\b/gi,
      /\bno console (output|activity|messages?)\b/gi,
      /\bthe page (did not|didn't) (log|report|complain)\b/gi,
    ];
    for (const [id, sentence, phrase] of [
      [
        'no-diagnostics',
        'no-diagnostics: the page emitted no diagnostic at all, so no capture was handed to the join',
        'the page emitted no diagnostic at all',
      ],
      [
        'captured-nothing',
        'captured-nothing: the page ran clean, so a capture was read and carried no diagnostic',
        'the page ran clean',
      ],
      [
        'joined',
        'joined: the capture held at least one diagnostic, and the page had nothing else to say',
        'the page had nothing else to say',
      ],
    ]) {
      assert.equal(
        oldPhraseList.some((pattern) => {
          pattern.lastIndex = 0;
          return pattern.test(sentence);
        }),
        false,
        `the probe ${JSON.stringify(sentence)} must be a wording the old phrase list never matched, or it proves nothing`,
      );
      const entry = recordedCase(id);
      const written = {
        ...entry,
        surface: {
          ...entry.surface,
          lines: [entry.surface.lines[0], sentence],
        },
      };
      const failure = reddens('absence-statement', () =>
        pinRecordedAbsenceStatement(written, contract),
      );
      assert.ok(
        failure.message.includes(entry.state),
        `the failure must name the state ${JSON.stringify(entry.state)}; it failed with ${failure.message}`,
      );
      assert.ok(
        failure.message.includes(phrase),
        `the failure must name the phrase ${JSON.stringify(phrase)}; it failed with ${failure.message}`,
      );
      console.log(
        `recorded surface reddens, old phrase list missed: ${failure.message.replace(/\s+/g, ' ').trim()}`,
      );
    }
  });

  test('the matcher here is the render suite’s matcher, so the two suites cannot drift', () => {
    const here = readFileSync(SELF_PATH, 'utf8');
    const there = readFileSync(join(ROOT, RENDER_REL), 'utf8');
    assert.equal(
      absenceMatcherSource(here),
      absenceMatcherSource(there),
      'the absence-statement matcher must be the same code in both suites, or the rule can drift between the surface and the recording',
    );
    assert.ok(
      absenceMatcherSource(here).includes('function absenceBreaches('),
      'the drift pin must compare the matcher and not an empty block',
    );
  });
});

describe('provenance: the record stands on the shapes T001 measured', () => {
  test('every fixture diagnostic is written in the capture’s own payload shape', () => {
    assert.deepEqual(
      SHAPES.capture.payload.keys,
      Object.keys(MATCHED),
      'the fixture must be written in the payload shape the capture dispatches',
    );
    assert.deepEqual(recorded().fixture.payloadKeys, Object.keys(MATCHED));
  });

  test('the matched code is the shipped digest’s, and the unmatched code is not', () => {
    assert.equal(typeof shippedTitle(MATCHED.code), 'string');
    assert.notEqual(shippedTitle(MATCHED.code), '');
    assert.equal(SHAPES.digest.codes.includes(UNMATCHED.code), false);
    assert.equal(
      DIGEST.entries.some((entry) => entry.code === UNMATCHED.code),
      false,
      `the shipped digest must lack ${UNMATCHED.code} for the named absence to be real`,
    );
    assert.equal(recorded().fixture.digestCarriesUnmatchedCode, false);
    assert.equal(recorded().fixture.matchedTitle, shippedTitle(MATCHED.code));
    assert.equal(recorded().fixture.unmatchedTitle, null);
  });

  test('the capture’s own regex extracts the code the digest lacks', () => {
    const regex = SHAPES.capture.codeExtraction.regex;
    assert.equal(recorded().fixture.captureRegex, regex);
    assert.equal(
      new RegExp(regex.slice(1, -1)).test(UNMATCHED.message),
      true,
      `the capture's own regex must extract ${UNMATCHED.code} from the message the fixture states`,
    );
    assert.equal(recorded().fixture.unmatchedExtractedByTheCaptureRegex, true);
  });

  test('the digest the record was made from is the digest the extension ships', () => {
    assert.equal(recorded().fixture.digestEntries, DIGEST.entries.length);
    assert.equal(recorded().fixture.digestEntries, SHAPES.digest.entryCount);
    assert.equal(
      recorded().fixture.digestEntries,
      new Set(DIGEST.entries.map((entry) => entry.code)).size,
      'every digest entry carries a code of its own, so a join on the code is total over it',
    );
  });
});

describe('mutants: each defect reddens the pin that names it', () => {
  for (const mutation of MUTATIONS) {
    test(`${mutation.id} reddens naming "${mutation.defect}"`, async () => {
      const entry = recordedCase(mutation.caseId);
      // The pin is green on the shipped pane first, so the failure below is the mutation's.
      mutation.pin(entry, renderedBy(SURFACE, entry));

      const mutant = await loadMutant(mutation.anchor, mutation.replacement);
      mutation.exhibits(mutant.module);
      const failure = reddens(mutation.defect, () =>
        mutation.pin(entry, renderedBy(mutant.module, entry)),
      );
      assert.match(failure.message, mutation.names);
      console.log(
        `mutant ${mutation.id} reddens: ${failure.message.replace(/\s+/g, ' ').trim()}`,
      );
    });
  }

  test('applies every mutation to a source that really changed, and a recorded cause line reddens even after an armed capture', () => {
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

    // The wave-5 probe, in memory and without writing the recording: a record whose joined case
    // carries a `cause:` line — exactly what an armed re-capture writes when the pane starts
    // rendering one — reddens the vocabulary pin, because `cause` is not a label the record's
    // contract carries. This is the half a snapshot cannot give: the recording is a reading of the
    // pane, so the rule has to be the record's own vocabulary rather than yesterday's bytes.
    const joined = recordedCase('joined');
    const blessed = {
      ...joined,
      surface: {
        ...joined.surface,
        lines: [
          ...joined.surface.lines,
          'cause: the application modified a bound value during change detection',
        ],
      },
    };
    const failure = reddens('recorded-vocabulary', () =>
      pinRecordsOnlyTheContractVocabulary(blessed, recorded().contract),
    );
    assert.match(failure.message, /the record's contract does not carry/);
    console.log(
      `recorded-vocabulary probe: ${failure.message.replace(/\s+/g, ' ').trim()}`,
    );
  });

  test('a word the pane writes itself reddens, and a word the digest or the capture carries does not', () => {
    const contract = recorded().contract;
    const none = recordedCase('no-diagnostics');

    // The matching is by word, not by substring: none of the three words the earlier list policed
    // inside a longer one is refused, and each reddens when it is the word itself.
    for (const [word, inside, whole] of [
      ['fix', 'the prefix of the message', 'the fix is to add a check'],
      ['count', 'an account of the message', 'one count of the findings'],
      ['cause', 'a message saying because', 'the cause is the write'],
    ]) {
      assert.equal(
        prohibitedPattern(word).test(inside),
        false,
        `recorded-vocabulary: ${JSON.stringify(word)} must not fire inside ${JSON.stringify(inside)} — the matching is by word and not by substring`,
      );
      assert.equal(
        prohibitedPattern(word).test(whole),
        true,
        `recorded-vocabulary: ${JSON.stringify(word)} must fire on ${JSON.stringify(whole)}, or the rule proves nothing`,
      );
    }
    // A word's own inflections are the word: a pane that writes "caused" or "elements" has written it.
    assert.equal(prohibitedPattern('cause').test('caused by the write'), true);
    assert.equal(prohibitedPattern('element').test('no elements here'), true);
    assert.equal(
      prohibitedPattern('due to').test('this is due  to the write'),
      true,
    );

    // A pane-written sentence carrying a word reddens, naming the state, the line and the word.
    const written = {
      ...none,
      surface: {
        ...none.surface,
        lines: [
          none.surface.lines[0],
          'no-diagnostics: no capture was handed to the join at all because none was made',
        ],
      },
    };
    const reddened = reddens('recorded-vocabulary', () =>
      pinRecordsOnlyTheContractVocabulary(written, contract),
    );
    assert.match(
      reddened.message,
      /no-diagnostics surface line 1 is policed as the pane's own "no-diagnostics" line and carries "because"/,
    );
    console.log(
      `pane-written wording probe: ${reddened.message.replace(/\s+/g, ' ').trim()}`,
    );

    // And the same kinds of word in a pane-written sentence are not refused when they are not words
    // the list carries: `prefix` and `account` pass the pane's own sentence too.
    const harmless = {
      ...none,
      surface: {
        ...none.surface,
        lines: [
          none.surface.lines[0],
          'no-diagnostics: no capture was handed to the join at all, so an account of the prefix is not given',
        ],
      },
    };
    pinRecordsOnlyTheContractVocabulary(harmless, contract);
  });

  test('a pane-written remedy spelled "fix" reddens, and "prefix" and "affix" pass', () => {
    const contract = recorded().contract;
    assert.equal(
      contract.prohibitedWording.includes('fix'),
      true,
      'the contract must carry "fix": a pane can state a remedy without spelling "remedy"',
    );
    // The sentence wave 5's cycle-3 review constructed, and the longer words word-boundary
    // matching must leave alone.
    assert.equal(
      prohibitedPattern('fix').test('to fix this, edit the binding'),
      true,
    );
    assert.equal(prohibitedPattern('fix').test('the prefix'), false);
    assert.equal(prohibitedPattern('fix').test('the affix'), false);

    const none = recordedCase('no-diagnostics');
    const written = {
      ...none,
      surface: {
        ...none.surface,
        lines: [
          none.surface.lines[0],
          'no-diagnostics: no capture was handed to the join at all, and to fix this, edit the binding',
        ],
      },
    };
    const failure = reddens('recorded-vocabulary', () =>
      pinRecordsOnlyTheContractVocabulary(written, contract),
    );
    assert.match(
      failure.message,
      /no-diagnostics surface line 1 is policed as the pane's own "no-diagnostics" line/,
    );
    assert.ok(
      failure.message.includes('carries "fix"'),
      `the pin must name the word "fix"; it failed with ${failure.message}`,
    );
    assert.match(failure.message, /matched the word "fix" as a whole word/);
    console.log(
      `pane-written "fix" probe: ${failure.message.replace(/\s+/g, ' ').trim()}`,
    );

    // The same pin passes the sentence with "prefix" and "account" in it, so the rule is the word
    // and not a substring of it.
    const harmless = {
      ...none,
      surface: {
        ...none.surface,
        lines: [
          none.surface.lines[0],
          'no-diagnostics: no capture was handed to the join at all, so an account of the prefix is not given',
        ],
      },
    };
    pinRecordsOnlyTheContractVocabulary(harmless, contract);
  });

  test('every prohibited entry catches a demonstrably bad sentence', () => {
    const contract = recorded().contract;
    assert.deepEqual(
      contract.prohibitedWording,
      PROHIBITED_WORDING,
      'the record and this suite must carry the same list, or the pin proves a list nobody states',
    );
    const bad = {
      cause: 'the cause is the write',
      because: 'the page was silent because nothing was captured',
      'due to': 'the binding was skipped due to the write',
      since: 'the page was silent since nothing was captured',
      element: 'the element was not found',
      component: 'the component was not rendered',
      dom: 'the DOM was not updated',
      node: 'the node was not found',
      remedy: 'the remedy is to hand it one',
      fix: 'to fix this, edit the binding',
      solution: 'the solution is to edit the binding',
      repair: 'to repair this, edit the binding',
      angular: 'angular reported nothing',
      framework: 'the framework reported nothing',
      count: 'one count of the findings',
      number: 'the number of findings is one',
    };
    assert.deepEqual(
      Object.keys(bad).sort(),
      [...PROHIBITED_WORDING].sort(),
      'every entry needs a demonstrably bad sentence here, and this table must prove no entry it does not carry',
    );
    const none = recordedCase('no-diagnostics');
    for (const word of PROHIBITED_WORDING) {
      const written = {
        ...none,
        surface: {
          ...none.surface,
          lines: [none.surface.lines[0], `no-diagnostics: ${bad[word]}`],
        },
      };
      const failure = reddens('recorded-vocabulary', () =>
        pinRecordsOnlyTheContractVocabulary(written, contract),
      );
      assert.match(failure.message, /no-diagnostics surface line 1/);
      assert.ok(
        failure.message.includes(`carries "${word}"`),
        `the pin must name ${JSON.stringify(word)}; it failed with ${failure.message}`,
      );
      assert.match(failure.message, /as a whole word/);
    }
    console.log(
      `every prohibited entry reddened: ${PROHIBITED_WORDING.join(', ')}`,
    );
  });
});

/**
 * The milestone's verdict-claims file is this task's other declaration, and a claim is only as good
 * as the artefact it cites. `scripts/overlay-verdict-claims.test.mjs` holds the list to the intent
 * and the charter's portal clause; the pins below hold it to the tree: every path it names exists,
 * every criterion it rules is one the intent declares with the intent's own characters, and every
 * test name it quotes is a line the artefact it cites actually carries. An invented path, a
 * paraphrase or a reading the artefact does not state reddens here.
 */
describe('the verdict claims cite artefacts this head carries', () => {
  const CLAIMS_REL = 'research/raw/m057-verdict-claims.json';
  const CLAIMS_MILESTONE = 'M057';
  const CLAIMS = JSON.parse(readFileSync(join(ROOT, CLAIMS_REL), 'utf8'));
  const INTENT = readFileSync(
    intentPathForMilestone(ROOT, CLAIMS_MILESTONE),
    'utf8',
  );

  test('rules the milestone STATE.md binds, and quotes its own intent', () => {
    assert.equal(CLAIMS.milestone, CLAIMS_MILESTONE);
    const criteriaSection = INTENT.slice(
      INTENT.indexOf('## Success criteria'),
      INTENT.indexOf('## Edge coverage'),
    );
    const declared = [...criteriaSection.matchAll(/^(\d+)\.\s/gm)].map(
      (match) => `SC${match[1]}`,
    );
    assert.ok(
      declared.length > 0,
      'the intent must declare its success criteria as a numbered list',
    );
    assert.deepEqual(
      CLAIMS.claims.map((row) => row.criterion),
      declared,
      `the claim list must rule every criterion the intent declares, ${declared.join(', ')}`,
    );
    const collapsed = INTENT.replace(/\s+/g, ' ');
    for (const row of CLAIMS.claims) {
      assert.ok(
        collapsed.includes(row.criterionText),
        `${row.criterion} must quote the intent character for character; the intent carries no such text`,
      );
      assert.equal(
        row.criterionCharacters,
        row.criterionText.length,
        `${row.criterion} states ${row.criterionCharacters} characters and its own text is ${row.criterionText.length}`,
      );
      assert.equal(
        row.ruling,
        'not-required',
        `${row.criterion} is ruled ${JSON.stringify(row.ruling)}, and this milestone owes no driver`,
      );
    }
    assert.equal(
      CLAIMS.driver ?? null,
      null,
      'a claim list with no required row must name no driver it cannot run',
    );
  });

  test('every artefact it cites exists, and every edge it names is the intent’s for its criterion', () => {
    for (const path of CLAIMS.evidence.recordings) {
      assert.ok(
        existsSync(join(ROOT, path)),
        `${CLAIMS_REL} records the recording ${path}, which this head does not carry`,
      );
    }
    // The edge each criterion owns is the intent's to assign, so the table is read here rather than
    // taken from the claims file: a row that names an edge the intent gives another criterion is
    // citing evidence for someone else's claim, and one that names no edge is citing none at all.
    const assigned = new Map();
    for (const match of INTENT.matchAll(/^\|\s*(E\d+)\s*\|\s*(SC\d+)\s*\|/gm)) {
      const [, edge, criterion] = match;
      assigned.set(criterion, [...(assigned.get(criterion) ?? []), edge]);
    }
    assert.ok(
      assigned.size > 0,
      'the intent must assign its edges to criteria in the first two columns of its own table',
    );
    for (const row of CLAIMS.claims) {
      const path = row.artefactPath;
      assert.ok(
        existsSync(join(ROOT, path)),
        `${row.criterion} cites ${path}, which this head does not carry`,
      );
      const named = [
        ...new Set(
          [...String(row.artefact ?? '').matchAll(/\bE\d+\b/g)].map(
            (match) => match[0],
          ),
        ),
      ].sort();
      const owed = [...(assigned.get(row.criterion) ?? [])].sort();
      assert.deepEqual(
        named,
        owed,
        `${row.criterion} names the edge(s) ${named.join(', ') || 'none'}, and the intent assigns it ${owed.join(', ') || 'none'}`,
      );
      const proves = row.proves ?? [];
      assert.ok(
        proves.length > 0,
        `${row.criterion} names no command that proves it, so its reading is unverified`,
      );
      assert.ok(
        proves.some((command) => String(command).includes(path)),
        `${row.criterion} cites ${path}, and none of the commands it proves with runs it`,
      );
    }
  });

  test('cites suites, and the counts it states are the counts those suites carry', () => {
    // A claim's evidence is a suite, not any file: `scripts/navigation-blocking.test.mjs` holds every
    // row to a suite whose own test titles carry the edge it claims, so a row that cited a module
    // would name evidence nobody can open.
    for (const suite of CLAIMS.evidence.suites) {
      const source = readFileSync(join(ROOT, suite.path), 'utf8');
      const tests = (source.match(/^[ \t]*(?:test|it)\(/gm) ?? []).length;
      const groups = (source.match(/^[ \t]*describe\(/gm) ?? []).length;
      assert.equal(
        tests,
        suite.tests,
        `${suite.path} carries ${tests} test declaration(s) and ${CLAIMS_REL} states ${suite.tests}`,
      );
      assert.equal(
        groups,
        suite.groups,
        `${suite.path} carries ${groups} group(s) and ${CLAIMS_REL} states ${suite.groups}`,
      );
    }
    for (const row of CLAIMS.claims) {
      assert.ok(
        CLAIMS.evidence.suites.some((suite) => suite.path === row.artefactPath),
        `${row.criterion} cites ${row.artefactPath}, and the evidence lists no such suite`,
      );
      assert.match(
        row.artefact ?? '',
        /edge \[[^\]]*"E\d+"/,
        `${row.criterion} names no edge id in its artefact, so the suite it cites cannot be held to one`,
      );
    }
    assert.equal(
      CLAIMS.capture.records,
      CLAIMS_REL,
      `${CLAIMS_REL} must name itself as the file its capture writes`,
    );
    assert.equal(
      CLAIMS.ruling.required,
      0,
      'no row is required, so the ruling states no required row',
    );
  });
});
