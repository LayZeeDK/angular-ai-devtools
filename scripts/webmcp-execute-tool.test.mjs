// @ts-check
// Run: node --test scripts/webmcp-execute-tool.test.mjs
//
// M053 T001 measures the half of the WebMCP surface nothing in this tree had ever called:
// `document.modelContext.executeTool`. `research/raw/m053-execute-tool.json` records what it needs,
// what it answers and through which shape, what it answers where no model is available, and whether
// a tool can be invoked at all on a page that declares none. Its static claims each carry
// `{ at: 'path:line', lineText }` and its live claims carry the instrument's own metadata, because
// the honest answer here is narrower than the milestone's premise: the surface exists, it refuses
// every call this task could make, and the no-model answer was not observed.
//
// This suite holds the record to the tree rather than to itself. Every cited line is re-read from
// the working tree at the head the suite runs against, so a citation that slid onto a neighbouring
// line, a line that was edited under a quotation, or a path that no longer exists reddens here. The
// recorded `head` is the head the measurement was taken at and is not compared with the current
// one: a recording is a snapshot, and what must still hold is every line it quotes.
//
// It also holds the record to its own absences, which is the part this milestone cannot afford to
// lose: a recording that upgrades "unobserved" to an answer, or claims an invocation succeeded on a
// page that declares no tool, reddens here naming the claim it broke.
//
// Scope, stated exactly: this file pins the measurement. It does not read a page, call the API,
// register a tool or start a browser, and it does not read the evidence files the live half names —
// those live under the skill's git-ignored evidence directory, so the record must carry its own
// expression and answer text and this suite requires that it does.

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RECORD = 'research/raw/m053-execute-tool.json';

/** The one instance and page the live half was measured on. */
const INSTANCE = 'chrome-beta-nano';
const BROWSER = /^Chrome\/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/;
const PAGE = 'https://example.com/';

/** The four questions the interface contract fixes, in the order the answer reads. */
const MEMBERS = ['arguments', 'answerShape', 'noModel', 'invocation'];

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
 * The lines each decisive claim rests on. The record must cite all of them, so a recording that
 * stops quoting the line its verdict depends on reddens here rather than in review.
 */
const DECISIVE = [
  {
    at: 'research/00-browser-probe.md:121',
    why: 'the prototype member list M052 shipped, `executeTool` among them',
  },
  {
    at: 'research/01-built-in-ai-apis.md:187',
    why: 'registration is how a tool comes to exist',
  },
  {
    at: 'research/01-built-in-ai-apis.md:188',
    why: 'the documented `executeTool(tool, args, { signal })` signature',
  },
  {
    at: 'research/14-ai-devtools-prior-art.md:327',
    why: 'the documented resolution, `execute`’s own return value',
  },
  {
    at: 'research/raw/m052-webmcp-observation.json:55',
    why: 'M052’s live member list in this instance and version',
  },
  {
    at: 'research/raw/m052-webmcp-api.json:55',
    why: 'the tree holds no type declaration of the surface',
  },
  {
    at: 'scripts/webmcp-api.test.mjs:496',
    why: 'the first of the three name-only occurrences, none of them a call',
  },
  {
    at: 'scripts/webmcp-audit.test.mjs:379',
    why: 'the second name-only occurrence',
  },
  {
    at: 'scripts/webmcp-audit.test.mjs:601',
    why: 'the third name-only occurrence',
  },
  {
    at: '.commandcode/skills/control-ai-browsers/scripts/control.mjs:1953',
    why: 'the canary answers presence and nothing else',
  },
];

/** A line that is blank, or reads as a blank after trimming, is not a claim. */
const isText = (/** @type {unknown} */ value) =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value === value.trim();

/**
 * A claim, as the record writes one: a question, an answer in words, and an explicit statement of
 * whether it was observed here.
 * @param {any} claim
 * @param {string} where
 */
function assertClaim(claim, where) {
  assert.equal(typeof claim, 'object', `${where} is a claim`);
  assert.ok(claim !== null, `${where} is not null`);
  assert.ok(isText(claim.question), `${where}.question asks what was measured`);
  assert.ok(
    isText(claim.statement) && claim.statement.length >= 60,
    `${where}.statement says what was measured, in a sentence`,
  );
  assert.equal(
    typeof claim.observedHere,
    'boolean',
    `${where}.observedHere states whether this claim was observed here`,
  );

  // The static half of a live claim is never observed here: it is read from the tree.
  assert.equal(
    claim.static.observedHere,
    false,
    `${where}.static is read, not observed`,
  );
  assert.ok(
    isText(claim.static.statement),
    `${where}.static.statement says what the tree records`,
  );
  assert.ok(
    Array.isArray(claim.static.citations) && claim.static.citations.length >= 2,
    `${where}.static cites at least two lines`,
  );
}

/**
 * The whole record, held to the tree and to what it says about itself. One function, used unchanged
 * for the committed recording and for every doctored copy below, so a mutant cannot pass a weaker
 * check than the record does.
 * @param {any} record
 */
function validate(record) {
  // -- what the record is ------------------------------------------------------------------
  assert.equal(record.schema, 'm053-execute-tool/v1', 'the schema is named');
  assert.equal(record.task, 'T001', 'the record belongs to T001');
  assert.equal(record.branch, 'gsd-path/M053', 'the record names its branch');
  assert.match(record.head, /^[0-9a-f]{40}$/, 'the head is a full commit id');
  assert.ok(
    isText(record.measuredAt) &&
      /static/i.test(record.measuredAt) &&
      /live/i.test(record.measuredAt) &&
      /nothing here is simulated/i.test(record.measuredAt),
    'the record states, in `measuredAt`, that it has a static and a live half and that nothing is simulated',
  );
  assert.ok(
    isText(record.citationConvention),
    'the record states how a citation is written',
  );

  // -- the four questions, each a claim with citations --------------------------------------
  assert.equal(
    typeof record.measurement,
    'object',
    'the record has a `measurement` object',
  );
  assert.ok(record.measurement !== null, '`measurement` is not null');
  assert.deepEqual(
    Object.keys(record.measurement).sort(),
    [...MEMBERS].sort(),
    'the measurement answers exactly the four questions the contract fixes',
  );
  for (const member of MEMBERS)
    assertClaim(record.measurement[member], `measurement.${member}`);

  // what it needs: one required argument, of type Tool
  const needs = record.measurement.arguments;
  assert.equal(
    needs.observedHere,
    true,
    'the argument’s shape was observed here',
  );
  assert.equal(
    needs.requiredArguments,
    1,
    'executeTool declares one required argument',
  );
  assert.equal(needs.handleArgument, 'Tool', 'the required argument is a Tool');
  assert.equal(
    needs.inputAndSignalObserved,
    false,
    'the record does not claim the input object or the signal was reached',
  );
  assert.match(
    needs.statement,
    /parameter 1 is not of type 'Tool'/,
    'the record quotes the refusal that fixes the argument’s type',
  );

  // what it answers, and through which shape
  const answers = record.measurement.answerShape;
  assert.equal(answers.returns, 'Promise', 'executeTool answers a Promise');
  assert.equal(
    answers.synchronousThrowObserved,
    false,
    'no call threw synchronously',
  );
  assert.equal(
    answers.resolvedValueObserved,
    false,
    'measurement.answerShape.resolvedValueObserved states that no resolved value was seen',
  );
  assert.match(
    answers.statement,
    /rejection/i,
    'the record names the shape of its answers',
  );

  // where no model is available: the absence is stated, not filled in
  const noModel = record.measurement.noModel;
  assert.equal(
    noModel.observedHere,
    false,
    'measurement.noModel.observedHere states that the no-model answer was not observed here',
  );
  assert.equal(
    noModel.observedInstead.observedHere,
    true,
    'measurement.noModel.observedInstead states what was observed instead',
  );
  assert.match(
    noModel.statement,
    /[Nn]ot observed|[Uu]nobserved/,
    'measurement.noModel says in words that the answer is unobserved',
  );
  assert.match(
    noModel.statement,
    /no model|model unavailable/i,
    'measurement.noModel names the state it did not observe',
  );

  // whether a tool can be invoked at all on a page that declares none
  const invocation = record.measurement.invocation;
  assert.equal(
    invocation.observedHere,
    true,
    'the invocation question was observed here',
  );
  assert.equal(invocation.toolsListedOnThePage, 0, 'the page listed no tool');
  assert.equal(
    invocation.handleAvailable,
    false,
    'no Tool handle was available',
  );
  assert.equal(
    invocation.handleConstructible,
    false,
    'the Tool interface cannot be constructed',
  );
  assert.ok(
    Array.isArray(invocation.toolPrototypeMembers) &&
      invocation.toolPrototypeMembers.includes('name') &&
      invocation.toolPrototypeMembers.includes('inputSchema'),
    'the record names the members a Tool carries',
  );

  // -- the live half, held to its instrument ------------------------------------------------
  const instrument = record.instrument;
  assert.equal(
    instrument.skill,
    'control-ai-browsers',
    'the instrument is named',
  );
  assert.equal(instrument.instance, INSTANCE, 'the instance is named');
  assert.match(
    instrument.browserVersion,
    BROWSER,
    `the browser version is recorded, and it reads ${instrument.browserVersion}`,
  );
  assert.ok(
    isText(instrument.session) && instrument.session.includes(INSTANCE),
    'the session is recorded and belongs to the instance',
  );
  assert.equal(typeof instrument.port, 'number', 'the CDP port is recorded');
  assert.ok(
    Array.isArray(instrument.evidence) && instrument.evidence.length >= 5,
    'the evidence directories are named',
  );
  assert.ok(
    instrument.launches.some((/** @type {any} */ launch) =>
      String(launch.what).includes('--no-ai-features'),
    ),
    'the launch without the AI features is recorded as its own launch',
  );
  assert.match(
    instrument.notes,
    /superseded/i,
    'the instrument states which run it superseded and why',
  );
  assert.match(
    instrument.notes,
    /stopped/,
    'the instrument states that every instance was closed and reported stopped',
  );

  // eight expressions, each carrying its own instrument metadata
  assert.equal(
    Array.isArray(record.observations) && record.observations.length,
    8,
    'the live half records eight expressions',
  );
  const ids = new Set();
  for (const [index, observation] of record.observations.entries()) {
    const where = `observations[${index}]`;
    assert.ok(isText(observation.id), `${where}.id is named`);
    assert.ok(
      !ids.has(observation.id),
      `${where}.id ${observation.id} is unique`,
    );
    ids.add(observation.id);
    assert.ok(isText(observation.question), `${where} asks a question`);
    assert.ok(
      isText(observation.expression) && observation.expression.length >= 40,
      `${where}.expression is the verbatim expression that was evaluated`,
    );
    assert.equal(
      typeof observation.answer,
      'object',
      `${where}.answer is the answer that expression gave`,
    );
    assert.ok(observation.answer !== null, `${where}.answer is not null`);
    assert.equal(
      observation.instance,
      INSTANCE,
      `${where}.instance is the measured instance`,
    );
    assert.equal(
      observation.browserVersion,
      instrument.browserVersion,
      `${where}.browserVersion is the instrument’s version`,
    );
    assert.match(
      observation.browserVersion,
      BROWSER,
      `${where} names a browser version`,
    );
    assert.equal(observation.page, PAGE, `${where}.page is the measured page`);
    assert.match(
      String(observation.at),
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      `${where}.at is a timestamp, and it reads ${observation.at}`,
    );
    assert.match(
      String(observation.command),
      /control\.mjs run chrome-beta-nano/,
      `${where}.command is the command that ran it`,
    );
    assert.match(
      String(observation.evidence),
      /evidence[\\/]\d{8}-\d{6}[\\/]chrome-beta-nano-run-\d+\.json$/,
      `${where}.evidence names the run’s own evidence file`,
    );
  }

  // each claim points at recorded observations, and none is recorded without a home
  const referenced = new Set();
  for (const member of MEMBERS) {
    const claim = record.measurement[member];
    assert.ok(
      Array.isArray(claim.observations) && claim.observations.length >= 2,
      `measurement.${member} names at least two observations`,
    );
    for (const id of claim.observations) {
      assert.ok(
        ids.has(id),
        `measurement.${member} names observation ${id}, and the live half records it`,
      );
      referenced.add(id);
    }
  }
  assert.ok(
    Array.isArray(record.controls) && record.controls.length >= 1,
    'the record carries the control that restored the measured launch',
  );
  for (const [index, control] of record.controls.entries()) {
    const where = `controls[${index}]`;
    assert.ok(isText(control.id), `${where}.id is named`);
    assert.ok(
      ids.has(control.observation),
      `${where} names observation ${control.observation}, and the live half records it`,
    );
    assert.ok(isText(control.what), `${where} says what it controlled`);
    referenced.add(control.observation);
  }
  for (const observation of record.observations) {
    assert.ok(
      referenced.has(observation.id),
      `observation ${observation.id} is referenced by a claim or a control`,
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

  // -- the verdict, held to the measurement it rests on -------------------------------------
  assert.equal(
    record.answer.canAToolBeInvokedOnAPageThatDeclaresNone,
    false,
    'answer.canAToolBeInvokedOnAPageThatDeclaresNone states that a tool cannot be invoked on a page that declares none',
  );
  assert.equal(
    record.answer.doesItNeedAModel,
    false,
    'the answer states that executeTool does not need a model',
  );
  assert.match(
    String(record.answer.whereNoModelIsAvailable),
    /unobserved/i,
    'the answer states that the no-model answer is unobserved',
  );
  assert.ok(
    isText(record.answer.needs) && /Tool/.test(record.answer.needs),
    'the answer says what executeTool needs',
  );
  assert.ok(
    isText(record.answer.statement) && record.answer.statement.length >= 200,
    'the answer is a paragraph, not a label',
  );

  // -- what the record does not claim ------------------------------------------------------
  assert.ok(Array.isArray(record.notClaimed), 'the record states its absences');
  assert.ok(
    record.notClaimed.length >= 5,
    `the record states ${record.notClaimed.length} absences`,
  );
  for (const [index, absence] of record.notClaimed.entries()) {
    assert.ok(
      isText(absence) && absence.length >= 60,
      `notClaimed[${index}] is a sentence, not a placeholder`,
    );
  }
  const absences = record.notClaimed.join('\n');
  assert.match(
    absences,
    /no page that declares a tool was measured/i,
    'notClaimed states that no page declaring a tool was measured',
  );
  assert.match(
    absences,
    /registerTool/,
    'notClaimed states that nothing was registered to observe an invocation',
  );
  assert.match(
    absences,
    /one instance/i,
    'notClaimed states the single instance and page',
  );
  assert.match(
    absences,
    /no model is available/i,
    'notClaimed states that the no-model answer was not observed',
  );

  // -- the unknowns, each answerable only with a browser ------------------------------------
  assert.ok(
    Array.isArray(record.unknowns) && record.unknowns.length >= 4,
    'the record names what it could not establish',
  );
  for (const [index, unknown] of record.unknowns.entries()) {
    assert.ok(isText(unknown.id), `unknowns[${index}].id is named`);
    assert.ok(isText(unknown.question), `unknowns[${index}] asks a question`);
    assert.ok(
      isText(unknown.statement) && unknown.statement.length >= 60,
      `unknowns[${index}] states the absence`,
    );
    assert.ok(
      Array.isArray(unknown.citations) && unknown.citations.length >= 1,
      `unknowns[${index}] cites the lines that bound it`,
    );
  }
  const unknownIds = record.unknowns.map(
    (/** @type {any} */ unknown) => unknown.id,
  );
  for (const needed of [
    'resolved-value-shape',
    'no-model-answer',
    'tool-handle-provenance',
  ])
    assert.ok(unknownIds.includes(needed), `the unknowns name \`${needed}\``);
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

test('the recording answers the four questions the milestone rests on', () => {
  validate(record);
  assert.equal(record.task, 'T001');
  assert.deepEqual(Object.keys(record.measurement), MEMBERS);
  assert.equal(record.measurement.arguments.requiredArguments, 1);
  assert.equal(record.measurement.answerShape.returns, 'Promise');
  assert.equal(record.measurement.noModel.observedHere, false);
  assert.equal(record.measurement.invocation.observedHere, true);
});

test('every cited path and line is the one the record read', () => {
  const citations = [...allCitations(record, '')];
  assert.ok(
    citations.length >= 25,
    `the record cites ${citations.length} lines`,
  );
  for (const [where, citation] of citations) assertCitation(citation, where);

  // The walk must reach every part of the record that cites, not a subset of them.
  const reached = new Set(citations.map(([where]) => where.split(/[.[]/)[0]));
  assert.deepEqual(
    [...reached].sort(),
    ['measurement', 'static', 'unknowns'],
    'the citation walk covers each part of the record that cites',
  );
});

test('the static half records what the tree says, and nothing it does not', () => {
  const measurements = record.static.measurements;
  assert.ok(Array.isArray(measurements) && measurements.length >= 5);
  const byId = new Map(measurements.map((/** @type {any} */ m) => [m.id, m]));

  // no call site: the three occurrences are names, not calls
  const noCall = byId.get('no-call-site');
  assert.ok(noCall, 'the static half records that the tree holds no call site');
  assert.equal(noCall.output.length, 3, 'three occurrences are recorded');
  for (const line of noCall.output) {
    assert.doesNotMatch(
      String(line),
      /\.executeTool\s*\(/,
      `the recorded occurrence is not a call: ${line}`,
    );
  }

  // no type declaration: three greps, three recorded absences
  const noTypes = byId.get('no-type-declaration');
  assert.ok(
    noTypes,
    'the static half records that the tree holds no type declaration',
  );
  assert.deepEqual(noTypes.output, [
    '(no matches)',
    '(no matches)',
    '(no matches)',
  ]);

  // the prototype record exists and lists the member
  const prototype = byId.get('prototype-record');
  assert.ok(prototype, 'the static half records the prototype record');
  assert.ok(
    prototype.citations.some((/** @type {Citation} */ c) =>
      c.lineText.includes('`executeTool`'),
    ),
    'the prototype citation quotes the line that names executeTool',
  );

  // the canary answers presence only
  const canary = byId.get('only-presence-is-executable');
  assert.ok(canary, 'the static half records the canary');
  assert.equal(canary.output.length, 5, 'the five canary lines are recorded');
  assert.ok(
    canary.output.every(
      (/** @type {any} */ line) => !String(line).includes('executeTool'),
    ),
    'no canary line calls executeTool',
  );
});

test('the live half names one instance, one page and eight verbatim expressions', () => {
  assert.equal(record.instrument.instance, INSTANCE);
  assert.equal(record.instrument.browserVersion, 'Chrome/159.0.8154.13');
  assert.equal(record.instrument.port, 9333);
  assert.equal(record.observations.length, 8);
  for (const observation of record.observations) {
    assert.equal(observation.instance, INSTANCE);
    assert.equal(observation.page, PAGE);
    assert.match(observation.expression, /document\.modelContext/);
    assert.ok(
      observation.answer.href === PAGE ||
        observation.answer.outcome === undefined,
      `observation ${observation.id} answered on the measured page`,
    );
  }
});

test('the recording states its own absences, and refuses to fill them in', () => {
  // The no-model answer is the state SC2 renders distinctly, and it was not observed.
  assert.equal(record.measurement.noModel.observedHere, false);
  assert.match(record.measurement.noModel.why, /model/);
  assert.match(record.answer.whereNoModelIsAvailable, /unobserved/i);

  // The invocation answer is observed, and it is a refusal.
  assert.equal(record.answer.canAToolBeInvokedOnAPageThatDeclaresNone, false);
  assert.equal(record.measurement.invocation.handleAvailable, false);
  assert.equal(record.measurement.invocation.handleConstructible, false);

  // A successful call was never seen, and the record says so in both halves.
  assert.equal(record.measurement.answerShape.resolvedValueObserved, false);
  assert.match(
    record.answer.statement,
    /cannot be invoked at all on a page that declares none/,
  );

  // Nothing was registered to make an invocation observable.
  assert.match(record.notClaimed.join('\n'), /never handed to registerTool/);
});

test('a doctored citation reddens naming the claim it breaks', (t) => {
  // The mutant this task exists to catch: one citation slid off its line by a single line, which is
  // how a recording drifts when the tree around it is edited.
  const slid = copyOf(record);
  const first = slid.measurement.arguments.static.citations[0];
  const [, file, line] = /^(.*):(\d+)$/.exec(first.at);
  first.at = `${file}:${Number(line) + 1}`;
  const slidMessage = reddens(slid, /quotes/);
  assert.ok(
    slidMessage.includes('measurement.arguments.static.citations[0]'),
    `the failure names the claim that slid: ${slidMessage}`,
  );
  assert.ok(
    slidMessage.includes(`${file}:${Number(line) + 1}`),
    `the failure names the citation that slid: ${slidMessage}`,
  );
  t.diagnostic(`mutant slid-citation: ${slidMessage}`);

  // A quotation edited under its line — the record disagreeing with the line it cites.
  const requoted = copyOf(record);
  requoted.measurement.invocation.static.citations[1].lineText =
    'The prototype has no such member, and this line says so.';
  const requotedMessage = reddens(requoted, /quotes/);
  assert.ok(
    requotedMessage.includes('measurement.invocation.static.citations[1]'),
    `the failure names the requoted claim: ${requotedMessage}`,
  );
  t.diagnostic(`mutant requoted-citation: ${requotedMessage}`);

  // A citation of a file the tree does not hold.
  const invented = copyOf(record);
  invented.unknowns[0].citations[0].at = 'research/99-not-here.md:1';
  const inventedMessage = reddens(invented, /holds no file/);
  assert.ok(
    inventedMessage.includes('unknowns[0].citations[0]'),
    `the failure names the invented citation's claim: ${inventedMessage}`,
  );
  t.diagnostic(`mutant invented-file: ${inventedMessage}`);
});

test('a recording that fills in the absences reddens naming the claim', (t) => {
  // The no-model answer cannot be promoted to an observation.
  const claimed = copyOf(record);
  claimed.measurement.noModel.observedHere = true;
  const claimedMessage = reddens(claimed, /measurement\.noModel\.observedHere/);
  assert.ok(
    claimedMessage.includes('measurement.noModel.observedHere'),
    `the failure names the no-model claim: ${claimedMessage}`,
  );
  t.diagnostic(`mutant observed-the-unobserved: ${claimedMessage}`);

  // An invocation cannot be claimed where the page declares no tool.
  const invoked = copyOf(record);
  invoked.answer.canAToolBeInvokedOnAPageThatDeclaresNone = true;
  const invokedMessage = reddens(invoked, /declares none/);
  assert.ok(
    invokedMessage.includes('canAToolBeInvokedOnAPageThatDeclaresNone'),
    `the failure names the verdict it broke: ${invokedMessage}`,
  );
  t.diagnostic(`mutant claimed-the-invocation: ${invokedMessage}`);

  // A resolved value cannot be claimed from a run that only saw rejections.
  const resolved = copyOf(record);
  resolved.measurement.answerShape.resolvedValueObserved = true;
  const resolvedMessage = reddens(resolved, /resolved value/);
  assert.ok(
    resolvedMessage.includes('measurement.answerShape'),
    `the failure names the answer-shape claim: ${resolvedMessage}`,
  );
  t.diagnostic(`mutant claimed-a-resolution: ${resolvedMessage}`);

  // A live expression cannot be recorded without its instrument's metadata.
  const bare = copyOf(record);
  delete bare.observations[0].browserVersion;
  const bareMessage = reddens(bare, /browserVersion is the instrument/);
  assert.ok(
    bareMessage.includes('observations[0]'),
    `the failure names the observation that lost its metadata: ${bareMessage}`,
  );
  t.diagnostic(`mutant metadata-dropped: ${bareMessage}`);

  // A claim cannot point at an observation the live half does not record.
  const dangling = copyOf(record);
  dangling.measurement.invocation.observations = [
    'empty-handle',
    'not-recorded',
  ];
  const danglingMessage = reddens(dangling, /not-recorded/);
  assert.ok(
    danglingMessage.includes('measurement.invocation'),
    `the failure names the claim that dangles: ${danglingMessage}`,
  );
  t.diagnostic(`mutant dangling-observation: ${danglingMessage}`);
});
