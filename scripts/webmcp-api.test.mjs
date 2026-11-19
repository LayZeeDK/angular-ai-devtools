// @ts-check
// Run: node --test scripts/webmcp-api.test.mjs
//
// M052 T001 measures what the WebMCP surface exposes to a page: a registration function, a readable
// tool list, or neither. `research/raw/m052-webmcp-api.json` records the answer with a citation for
// every claim — `{ at: 'path:line', lineText }`, where `lineText` is that line trimmed — and says
// plainly what it does not claim, because the honest answer here is narrower than the milestone's
// premise: the tree records that a list getter exists, and no code in the tree has ever called it.
//
// This suite holds the record to the tree rather than to itself. Every cited line is re-read from
// the working tree at the head the suite runs against, so a citation that slid onto a neighbouring
// line, a line that was edited under a quotation, or a path that no longer exists reddens here. The
// recorded `head` is the head the measurement was taken at and is not compared with the current one:
// a recording is a snapshot, and what must still hold is every line it quotes.
//
// It also re-derives the one claim the whole record rests on — that the tree's only executable
// knowledge of the surface is a `typeof` test — from `control.mjs` and the page-world agent the
// extension ships, instead of trusting the record's own measurement notes.
//
// Scope, stated exactly: this file pins the measurement. It does not read a page, call the API,
// register a tool, start a browser, pin T002's reader (`extension/webmcp-audit.js` does not exist at
// this head) or say anything about the canary's semantics, which this task must not weaken.

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RECORD = 'research/raw/m052-webmcp-api.json';

/** The canary the milestone must not change, and the page-world code the extension ships. */
const CANARY = '.commandcode/skills/control-ai-browsers/scripts/control.mjs';
const PAGE_AGENT = 'extension/agent-main.js';

/** The closed vocabulary the interface contract fixes for the tool list's state. */
const STATES = ['readable', 'empty', 'absent'];

/** A citation's `at`: a repository-relative posix path, a colon, a 1-indexed line. */
const AT = /^([^:]+):([1-9][0-9]*)$/;

/**
 * The lines of a repository file, split the way a line number counts them and with a trailing
 * carriage return removed. A path the tree does not hold throws here, which is the check that a
 * citation names a real file.
 * @param {string} path
 * @returns {readonly string[]}
 */
function sourceLines(path) {
  return readFileSync(join(ROOT, path), 'utf8')
    .split('\n')
    .map((line) => line.replace(/\r$/, ''));
}

/**
 * @typedef {object} Citation a line in the tree that the record quotes.
 * @property {string} at `path:line`.
 * @property {string} lineText that line, trimmed, and nothing else.
 */

/**
 * One citation, held to the file and the line it names: the path is repository-relative and posix,
 * the file exists, the line is one the file has, and the record's quotation is exactly that line,
 * trimmed. Every failure message names the claim (`where`) and the citation, so a red test says
 * which claim drifted.
 * @param {Citation} citation
 * @param {string} where
 */
function assertCitation(citation, where) {
  assert.equal(typeof citation, 'object', `${where} is a citation`);
  assert.ok(citation !== null, `${where} is not null`);
  assert.equal(typeof citation.at, 'string', `${where}.at is a string`);
  assert.equal(
    typeof citation.lineText,
    'string',
    `${where}.lineText is a string`,
  );

  const match = AT.exec(citation.at);
  assert.ok(match, `${where}.at is "path:line", and it reads ${citation.at}`);
  const file = match[1];
  const line = Number(match[2]);

  assert.ok(
    !file.startsWith('/') && !file.includes('\\'),
    `${where}.at is a repository-relative posix path, and it reads ${file}`,
  );
  assert.ok(
    existsSync(join(ROOT, file)),
    `${where} cites ${citation.at} and the tree holds no file ${file}`,
  );
  assert.equal(
    citation.lineText,
    citation.lineText.trim(),
    `${where}.lineText is already trimmed`,
  );
  assert.ok(
    citation.lineText.length > 0,
    `${where}.lineText is a line that says something`,
  );

  const lines = sourceLines(file);
  assert.ok(
    line <= lines.length,
    `${where} cites ${citation.at} and ${file} holds ${lines.length} lines`,
  );
  const actual = (lines[line - 1] ?? '').trim();
  assert.equal(
    citation.lineText,
    actual,
    `${where} quotes ${citation.at} as "${citation.lineText}", and that line reads "${actual}"`,
  );
}

/**
 * Every citation the record makes, with the place it sits, so one walk holds the whole record to
 * the tree. A citation is any object carrying an `at` and a `lineText`; nothing else in the record
 * is asked to cite.
 * @param {unknown} value
 * @param {string} where
 * @returns {Generator<[string, Citation]>}
 */
function* allCitations(value, where) {
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries())
      yield* allCitations(item, `${where}[${index}]`);
    return;
  }
  if (value === null || typeof value !== 'object') return;
  const candidate = /** @type {Record<string, unknown>} */ (value);
  if (
    typeof candidate.at === 'string' &&
    typeof candidate.lineText === 'string'
  ) {
    yield [where, /** @type {Citation} */ (candidate)];
    return;
  }
  for (const [key, child] of Object.entries(candidate))
    yield* allCitations(child, where === '' ? key : `${where}.${key}`);
}

/**
 * The lines each decisive claim rests on. The record's `exposure` and `answer` must cite these, so a
 * recording that stops citing the line its verdict depends on reddens here rather than in review.
 */
const DECISIVE = [
  // the canary's own answer: a `typeof` equality, and nothing else
  {
    at: `${CANARY}:1953`,
    why: 'the canary computes `pass` from a typeof test',
  },
  {
    at: `${CANARY}:1886`,
    why: 'the availability snippet computes two typeofs',
  },
  { at: `${CANARY}:3606`, why: 'the doctor gates the check on the pass bit' },
  // the browser measurement that a list getter exists
  {
    at: 'research/00-browser-probe.md:121',
    why: 'the prototype member list, `getTools` among them',
  },
  // the documented return shape the field names come from
  {
    at: 'research/01-built-in-ai-apis.md:188',
    why: '`getTools` and the descriptor fields',
  },
];

/** A line that is blank, or reads as a blank after trimming, is not a claim. */
const isText = (value) =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value === value.trim();

/**
 * The whole record, held to the tree and to what it says about itself. One function, used unchanged
 * for the committed recording and for every doctored copy below, so a mutant cannot pass a weaker
 * check than the record does.
 * @param {any} record
 */
function validate(record) {
  // -- what the record is ------------------------------------------------------------------
  assert.equal(record.schema, 'm052-webmcp-api/v1', 'the schema is named');
  assert.equal(record.task, 'T001', 'the record belongs to T001');
  assert.match(record.head, /^[0-9a-f]{40}$/, 'the head is a full commit id');
  assert.ok(
    isText(record.measuredAt) &&
      /no browser was started/i.test(record.measuredAt),
    'the record states, in `measuredAt`, that no browser was started',
  );
  assert.ok(
    isText(record.citationConvention),
    'the record states how a citation is written',
  );

  // -- the three exposure questions, each with citations -----------------------------------
  const exposure = record.exposure;
  assert.equal(
    typeof exposure,
    'object',
    'the record has an `exposure` object',
  );
  assert.ok(exposure !== null, '`exposure` is not null');

  for (const member of ['present', 'registration', 'toolList']) {
    assert.equal(
      typeof exposure[member],
      'object',
      `exposure.${member} is answered`,
    );
    assert.ok(
      Array.isArray(exposure[member].citations) &&
        exposure[member].citations.length >= 2,
      `exposure.${member} cites at least two lines`,
    );
    assert.ok(
      isText(exposure[member].statement),
      `exposure.${member}.statement says what was measured`,
    );
  }

  // presence: the canary's own answer, which this milestone must not weaken
  assert.equal(exposure.present.value, 'object', 'the surface is an object');
  assert.equal(
    exposure.present.observedHere,
    false,
    'nothing here observed the object itself',
  );

  // registration: a function the tree records
  assert.equal(
    exposure.registration.exposes,
    true,
    'the API exposes a registration function',
  );
  assert.equal(
    exposure.registration.function,
    'registerTool',
    'the registration function is named',
  );
  assert.equal(
    exposure.registration.observedHere,
    false,
    'registration was not observed here',
  );

  // the tool list: a state from the closed vocabulary, and the field names a tool carries
  assert.ok(
    STATES.includes(exposure.toolList.state),
    `exposure.toolList.state is one of ${STATES.join(', ')}, and it reads ${exposure.toolList.state}`,
  );
  assert.ok(
    isText(exposure.toolList.nameField),
    'exposure.toolList names the field a tool name is read from',
  );
  assert.ok(
    isText(exposure.toolList.descriptionField),
    'exposure.toolList names the field a tool description is read from',
  );
  assert.ok(
    Array.isArray(exposure.toolList.fields) &&
      exposure.toolList.fields.includes(exposure.toolList.nameField) &&
      exposure.toolList.fields.includes(exposure.toolList.descriptionField),
    'the field list holds the name and description fields it names',
  );
  assert.equal(
    exposure.toolList.observedHere,
    false,
    'exposure.toolList.observedHere states that no list was read here',
  );
  assert.equal(
    exposure.toolList.needsBrowserToConfirm,
    true,
    'exposure.toolList.needsBrowserToConfirm keeps the answer open for a browser',
  );

  // The field names are not the record's invention: each must occur on a line the record cites for
  // this claim, so a field list that drifts from the documented shape reddens.
  const shape = exposure.toolList.citations
    .map((/** @type {Citation} */ citation) => citation.lineText)
    .join('\n');
  for (const field of exposure.toolList.fields) {
    assert.ok(
      shape.includes(field),
      `exposure.toolList.field ${field} occurs on a cited line; the cited lines read: ${shape}`,
    );
  }

  // -- every citation holds ----------------------------------------------------------------
  let citations = 0;
  for (const [where, citation] of allCitations(record, '')) {
    assertCitation(citation, where);
    citations += 1;
  }
  assert.ok(citations >= 25, `the record cites ${citations} lines`);

  const cited = new Set(
    [...allCitations(record, '')].map(([, citation]) => citation.at),
  );
  for (const decisive of DECISIVE) {
    assert.ok(
      cited.has(decisive.at),
      `the record still cites ${decisive.at} — ${decisive.why}`,
    );
  }

  // -- what the record does not claim ------------------------------------------------------
  assert.ok(Array.isArray(record.notClaimed), 'the record states its absences');
  assert.ok(
    record.notClaimed.length >= 5,
    `the record states ${record.notClaimed.length} absences`,
  );
  for (const [index, absence] of record.notClaimed.entries()) {
    assert.ok(
      isText(absence) && absence.length >= 40,
      `notClaimed[${index}] is a sentence, not a placeholder`,
    );
  }
  const absences = record.notClaimed.join('\n');
  assert.match(
    absences,
    /no browser was started/i,
    'notClaimed states that no browser was started',
  );
  assert.match(
    absences,
    /has ever called `getTools\(\)`/,
    'notClaimed states that no code in the tree has ever called `getTools`',
  );
  assert.match(
    absences,
    /observedHere/,
    'notClaimed states what `observedHere: false` does not claim',
  );
  assert.match(
    absences,
    /re-?measures? the 2026-10-11/i,
    'notClaimed states that the prototype member list was not re-measured',
  );

  // -- the unknowns, each answerable only with a browser ------------------------------------
  assert.ok(
    Array.isArray(record.unknowns) && record.unknowns.length >= 3,
    'the record names what it could not establish',
  );
  for (const [index, unknown] of record.unknowns.entries()) {
    assert.ok(isText(unknown.id), `unknowns[${index}].id is named`);
    assert.ok(isText(unknown.question), `unknowns[${index}] asks a question`);
    assert.ok(
      isText(unknown.statement) && unknown.statement.length >= 40,
      `unknowns[${index}] states the absence`,
    );
    assert.ok(
      Array.isArray(unknown.citations) && unknown.citations.length >= 1,
      `unknowns[${index}] cites the lines that bound it`,
    );
  }

  // -- the answer, and its instrument -------------------------------------------------------
  assert.equal(
    record.answer.toolListState,
    exposure.toolList.state,
    'answer.toolListState agrees with exposure.toolList.state',
  );
  assert.equal(
    record.answer.confirmedByInstrument,
    false,
    'answer.confirmedByInstrument states that no instrument in the tree confirms the list',
  );
  assert.equal(
    record.answer.needsBrowserToConfirm,
    true,
    'the answer stays open for a browser',
  );
  assert.ok(
    isText(record.answer.statement) &&
      /not determinable/i.test(record.answer.statement),
    'the answer says what is not determinable',
  );

  // -- the canary's own result type carries no tool list ------------------------------------
  const instrument = record.instrument;
  assert.equal(instrument.name, 'canary.webmcp', 'the instrument is named');
  for (const part of ['proves', 'doesNotProve']) {
    assert.ok(
      isText(instrument[part].statement) &&
        Array.isArray(instrument[part].citations) &&
        instrument[part].citations.length >= 2,
      `instrument.${part} states and cites its answer`,
    );
  }
}

/** A deep copy, so a doctored copy cannot touch the record the tests read. */
function copyOf(record) {
  return JSON.parse(JSON.stringify(record));
}

/**
 * The failure a doctored recording raises, or null when it passes. A mutant that passes is a hole
 * in the check, and its caller says so.
 * @param {any} doctored
 * @returns {string | null}
 */
function failureOf(doctored) {
  try {
    validate(doctored);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  return null;
}

/**
 * A doctored recording must fail, and the failure must match the pattern the defect predicts.
 * @param {any} doctored
 * @param {RegExp} pattern
 * @returns {string} the failure message, so a caller can name the claim it carries
 */
function reddens(doctored, pattern) {
  const message = failureOf(doctored);
  assert.notEqual(message, null, 'the doctored recording passed validation');
  assert.match(message ?? '', pattern);
  return message ?? '';
}

const record = JSON.parse(readFileSync(join(ROOT, RECORD), 'utf8'));

test('the recording answers the three exposure questions and names the canary', () => {
  validate(record);
  assert.equal(record.task, 'T001');
  assert.equal(record.head, '2401982b1ef8a461c8eccfeda9fb9dd2af55018c');
  assert.deepEqual(Object.keys(record.exposure).sort(), [
    'present',
    'registration',
    'toolList',
  ]);
  assert.equal(record.answer.toolListState, 'readable');
});

test('every cited path and line is the one the record read', () => {
  const citations = [...allCitations(record, '')];
  assert.ok(
    citations.length >= 25,
    `the record cites ${citations.length} lines`,
  );
  for (const [where, citation] of citations) assertCitation(citation, where);

  // The walk must reach every claim that carries one, not a subset of them.
  const reached = new Set(citations.map(([where]) => where.split(/[.[]/)[0]));
  assert.deepEqual(
    [...reached].sort(),
    ['answer', 'exposure', 'instrument', 'unknowns'],
    'the citation walk covers each part of the record that cites',
  );
});

test('the tool list is readable by the recorded surface, and never read by anything here', () => {
  const toolList = record.exposure.toolList;
  assert.equal(toolList.state, 'readable');
  assert.equal(toolList.getter, 'getTools');
  assert.equal(toolList.nameField, 'name');
  assert.equal(toolList.descriptionField, 'description');
  assert.equal(toolList.observedHere, false);
  assert.equal(toolList.needsBrowserToConfirm, true);
  assert.equal(toolList.emptyStateObserved, false);

  // The absence is not only a flag: the answer sentence says it in words.
  assert.match(
    record.answer.statement,
    /nothing in this tree has ever called it/,
  );
  assert.match(record.answer.statement, /not determinable without a browser/);
});

test('the canary asks only for a typeof, and still does', () => {
  const lines = sourceLines(CANARY);
  const hits = lines
    .map((line, index) => [index + 1, line])
    .filter(([, line]) => /modelContext/.test(line))
    .map(([line]) => line);
  assert.deepEqual(
    hits,
    [1886, 1953],
    'the canary mentions the model context on exactly the two lines the record cites',
  );
  assert.match(
    lines[1952],
    /pass: typeof document\.modelContext === 'object'/,
    'the canary still answers presence with a typeof test',
  );
  for (const member of [
    'getTools',
    'registerTool',
    'executeTool',
    'ontoolchange',
  ]) {
    assert.ok(
      !lines.some((line) => line.includes(member)),
      `the canary does not call ${member}: it lists no tool and cannot`,
    );
  }
});

test('the page-world agent the extension ships reads no model context', () => {
  const source = readFileSync(join(ROOT, PAGE_AGENT), 'utf8');
  assert.doesNotMatch(
    source,
    /modelContext/,
    `${PAGE_AGENT} reads no model context, so no shipped relay could have produced a tool list`,
  );
});

test('a doctored citation reddens naming the claim it breaks', () => {
  // The mutant this task exists to catch: one citation slid off its line by a single line, which is
  // how a recording drifts when the tree around it is edited.
  const slid = copyOf(record);
  const first = slid.exposure.toolList.citations[0];
  const [, file, line] = /^(.*):(\d+)$/.exec(first.at);
  first.at = `${file}:${Number(line) + 1}`;
  const slidMessage = reddens(slid, /quotes/);
  assert.ok(
    slidMessage.includes('exposure.toolList.citations[0]'),
    `the failure names the claim that slid: ${slidMessage}`,
  );
  assert.ok(
    slidMessage.includes(`${file}:${Number(line) + 1}`),
    `the failure names the citation that slid: ${slidMessage}`,
  );

  // A quotation edited under its line — the record disagreeing with the line it cites.
  const requoted = copyOf(record);
  requoted.exposure.registration.citations[0].lineText =
    'The prototype has no such member.';
  const requotedMessage = reddens(requoted, /quotes/);
  assert.ok(
    requotedMessage.includes('exposure.registration.citations[0]'),
    `the failure names the requoted claim: ${requotedMessage}`,
  );

  // A citation of a file the tree does not hold.
  const invented = copyOf(record);
  invented.exposure.present.citations[1].at = 'research/99-not-here.md:1';
  const inventedMessage = reddens(invented, /holds no file/);
  assert.ok(
    inventedMessage.includes('exposure.present.citations[1]'),
    `the failure names the invented citation's claim: ${inventedMessage}`,
  );

  // The absences cannot be dropped: a recording that stops saying `getTools` was never called reads
  // as a measurement and must not pass, even with every other sentence left in place.
  const claimed = copyOf(record);
  claimed.notClaimed = claimed.notClaimed.map((absence) =>
    /has ever called `getTools\(\)`/.test(absence)
      ? 'The tree was not edited by this task, and no file outside the two it names was written.'
      : absence,
  );
  assert.equal(
    claimed.notClaimed.length,
    record.notClaimed.length,
    'the mutant keeps every absence except the one it drops',
  );
  const claimedMessage = reddens(
    claimed,
    /notClaimed states that no code in the tree has ever called/,
  );
  assert.ok(
    claimedMessage.includes('notClaimed'),
    `the failure names the absences: ${claimedMessage}`,
  );

  // The tool list cannot be recorded as observed here.
  const observed = copyOf(record);
  observed.exposure.toolList.observedHere = true;
  const observedMessage = reddens(observed, /observedHere/);
  assert.ok(
    observedMessage.includes('exposure.toolList.observedHere'),
    `the failure names the flag: ${observedMessage}`,
  );

  // The answer cannot claim an instrument confirmed it.
  const confirmed = copyOf(record);
  confirmed.answer.confirmedByInstrument = true;
  reddens(confirmed, /confirmedByInstrument/);
});
