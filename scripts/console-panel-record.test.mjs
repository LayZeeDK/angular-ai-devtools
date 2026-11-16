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
// The wording list polices only the lines the pane writes itself — the state line, the three state
// sentences and its named absences. A `title:` value is the digest's word, a `text:` value the
// capture's, and `code:` and `reason:` are the answer's, so none of those four is this pane's
// attribution and none is refused here: the digest's own title for `NG0910` states "element" and a
// captured message may say "because". Each word is matched as a whole word, with its own
// inflections, so a pane-written "because" reddens while `fix` never fires on "prefix" and `count`
// never on "account".
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
const FINDING_FIELDS = ['text', 'code', 'title', 'reason'];
const JOINED = 'joined';
const CAPTURED_NOTHING = 'captured-nothing';
const NO_DIGEST_ENTRY = 'no-digest-entry';

/**
 * The vocabulary the pane's lines carry: the state word, a finding's four fields, and the pane's own
 * named absences are the labels; a cause, an element, a remedy, a word about the framework or a count
 * is not. The record states both lists, and every recorded `surface.lines` entry is held to them — a
 * label outside the list reddens whether the recording was made by hand or by an armed re-capture.
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
 * `count` never on "account". One entry per word family, and no entry subsumed by a more general one
 * — `fix` is dropped because a fix is a remedy and `remedy` is the general word the record's own
 * `contract.rendered` states.
 */
const PROHIBITED_WORDING = [
  'cause',
  'because',
  'due to',
  'element',
  'component',
  'remedy',
  'angular',
  'count',
];

/**
 * The four fields a finding carries, whose values are the answer's words and not this pane's: the
 * capture's `text` and `code`, the digest's `title`, the join's `reason`. The wording list does not
 * police them — the digest's own title for `NG0910` states "element", and a capture that says
 * "because" is the page's word — so this suite refuses only what the pane writes itself.
 */
const CARRIED_FIELDS = ['text', 'code', 'title', 'reason'];

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

/** The join's own answer for one case: a capture's diagnostics, or the absence of a capture. */
function answerFor(entry) {
  return entry.handedOver
    ? clone(JOIN.consoleJoin(entry.diagnostics, DIGEST))
    : clone(JOIN.consoleJoin(undefined, DIGEST));
}

/** One finding as the record states it: `text`, then `code` / `title` / `reason` only when carried. */
function findingRecord(finding) {
  const record = { text: finding.text };
  if (finding.code !== undefined) record.code = finding.code;
  if (finding.title !== undefined) record.title = finding.title;
  if (finding.reason !== undefined) record.reason = finding.reason;
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
      finding: ['text', 'code?', 'title?', 'reason?'],
      reason:
        'reason is present only when the digest lacks the code the message carried, and code is absent only when the message carried none',
      rendered:
        'the pane renders state and findings and nothing else: no cause, no element, no remedy and no unattributed wording',
      lineLabels: LINE_LABELS,
      prohibitedWording: PROHIBITED_WORDING,
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

// -------------------------------------------------------------------------- the pins ----

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
 * SC1/SC2/SC3, field for field: every finding the record states is one the pane rendered, with the
 * text it carried, the code it carried named or its absence stated, the digest's title where the
 * digest has one, and no third thing invented for a finding that carries neither.
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

/**
 * The contract's own two rules, held against the diagnostics the case handed over: one finding per
 * diagnostic in capture order, `code` present exactly when the message carried one, and `reason`
 * present exactly when the digest lacks the code it carried.
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
      const known = DIGEST.entries.some(
        (candidate) => candidate.code === carried,
      );
      assert.equal(
        'reason' in finding,
        !known,
        `reason: ${entry.id} finding ${index} carries the code ${carried}, which the digest ${known ? 'carries, so no reason belongs on it' : 'lacks, so the reason belongs on it'}`,
      );
      assert.equal(
        'title' in finding,
        known,
        `title: ${entry.id} finding ${index} carries the code ${carried}, which the digest ${known ? 'carries, so its title belongs on the finding' : 'lacks, so no title belongs on it'}`,
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
    assert.deepEqual(record.contract.finding, [
      'text',
      'code?',
      'title?',
      'reason?',
    ]);
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
          'no-diagnostics: no capture was handed to the join at all, so no account of a prefix is given',
        ],
      },
    };
    pinRecordsOnlyTheContractVocabulary(harmless, contract);
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
