// @ts-check
// Run: node --test scripts/dead-click.test.mjs
//
// M050 T001 measures the three consequence chains `extension/agent-main.js` records and the window a
// finding may be judged over: the profiler work pairs, the router's `NavigationStart` and its
// terminal, and a boundary arrival carrying `boundaryReset`.
// `research/raw/m050-chains.json` names, per chain, the start marker, the consequent, the field that
// pairs them (or says there is none), whether two starts of one kind can be told apart, whether a
// start whose consequent never arrived survives into the published record, and what bounds the
// window. This suite holds the record to the tree, because a record nobody re-reads drifts the way a
// comment does: every quoted line must be the line its number names, every recorded field list must
// be the list the cited builder assigns, every pairing field must be a field the entry really
// assigns, and the survival answer must be the one the recorder's own removals support — a record
// that claims a dangling start survives while the recorder empties the list without publishing it is
// the failure this suite exists for (SC1, SC3; N3).
//
// The suite stops at the measurement. T002's judgement does not exist at this head and nothing here
// pins a finding, a step or a panel.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RECORD = 'research/raw/m050-chains.json';
const AGENT = 'extension/agent-main.js';
const CHAIN_IDS = ['work', 'router', 'boundary'];

/**
 * The only field of the three entry shapes that identifies an individual event rather than
 * classifying it: the event's own navigation id. A chain whose pairing field is anything else pairs
 * a family (`pair`) or a side (`end`) or describes one arrival (`boundaryReset`), and never one start
 * to one consequent.
 */
const IDENTITY_FIELDS = ['id'];

/**
 * The line each chain's verdict rests on, and the text it must hold. The record's `answer.evidence`
 * is held to this table, so a verdict that stops citing its decisive line reddens here.
 */
const DECISIVE = [
  {
    chain: 'work',
    file: AGENT,
    line: 637,
    lineText:
      '// boundary. Nothing here pairs a start with its end: the pairing rule belongs to the narrator that',
  },
  {
    chain: 'router',
    file: AGENT,
    line: 1639,
    lineText: "id: routerPrimitiveOf(event, 'id'),",
  },
  {
    chain: 'boundary',
    file: AGENT,
    line: 2069,
    lineText: 'boundaryReset: hasBoundary',
  },
];

const record = JSON.parse(readFileSync(join(ROOT, RECORD), 'utf8'));

/**
 * @typedef {object} Citation a line in the tree that the record quotes.
 * @property {string} file the repository-relative posix path the line is in.
 * @property {number} line the 1-indexed line.
 * @property {string} lineText that line, trimmed, and nothing else.
 */

/**
 * The lines of a repository file, split the way a line number counts them and with a trailing
 * carriage return removed. A path the tree does not hold throws here, which is the check that the
 * record cites a real file.
 * @param {string} path
 * @returns {readonly string[]}
 */
function sourceLines(path) {
  return readFileSync(join(ROOT, path), 'utf8')
    .split('\n')
    .map((line) => line.replace(/\r$/, ''));
}

/**
 * One citation, held to the file and the line it names: the file exists, the line is one that file
 * has, and the record's quotation is exactly that line, trimmed. A quotation that slid onto a
 * neighbour reddens here rather than in review.
 * @param {Citation} citation
 * @param {string} where
 */
function assertCitation(citation, where) {
  assert.equal(typeof citation, 'object', `${where} is a citation`);
  assert.ok(citation !== null, `${where} is not null`);
  assert.equal(typeof citation.file, 'string', `${where}.file is a string`);
  assert.ok(citation.file.length > 0, `${where}.file is not empty`);
  assert.ok(
    !citation.file.startsWith('/'),
    `${where}.file is repository-relative`,
  );
  assert.ok(!citation.file.includes('\\'), `${where}.file is posix`);
  assert.ok(
    Number.isInteger(citation.line) && citation.line >= 1,
    `${where}.line is a 1-indexed line number`,
  );
  assert.equal(
    typeof citation.lineText,
    'string',
    `${where}.lineText is a string`,
  );
  assert.ok(
    citation.lineText.length > 0,
    `${where}.lineText is a line that says something`,
  );
  assert.equal(
    citation.lineText,
    citation.lineText.trim(),
    `${where}.lineText is already trimmed`,
  );

  const lines = sourceLines(citation.file);
  assert.ok(
    citation.line <= lines.length,
    `${where} cites ${citation.file}:${citation.line} and the file holds ${
      lines.length
    } lines`,
  );
  assert.equal(
    (lines[citation.line - 1] ?? '').trim(),
    citation.lineText,
    `${where} quotes ${citation.file}:${citation.line} as "${citation.lineText}"`,
  );
}

/**
 * Every citation the record makes, with the place it sits, so one walk holds the whole record to the
 * tree. A citation is any object carrying a `file`, a `line` and a `lineText`; nothing else in the
 * record is asked to cite.
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
    typeof candidate.file === 'string' &&
    Number.isInteger(candidate.line) &&
    typeof candidate.lineText === 'string'
  ) {
    yield [where, /** @type {Citation} */ (candidate)];
    return;
  }
  for (const [key, child] of Object.entries(candidate))
    yield* allCitations(child, where === '' ? key : `${where}.${key}`);
}

/**
 * The number of leading spaces a line has, so a field at one nesting depth can be told from a field
 * at the next.
 * @param {string} line
 * @returns {number}
 */
function indentOf(line) {
  return line.length - line.trimStart().length;
}

/**
 * The index of the first line after an opener whose trimmed text is the given closer, and the
 * opener's own indentation. No such line throws, which is the check that the record's builder still
 * has the shape it was measured in.
 * @param {readonly string[]} lines
 * @param {number} openerIndex
 * @param {string} closerText
 * @param {string} where
 * @returns {{ indent: number, closerIndex: number }}
 */
function blockOf(lines, openerIndex, closerText, where) {
  const indent = indentOf(lines[openerIndex] ?? '');
  for (let index = openerIndex + 1; index < lines.length; index += 1)
    if ((lines[index] ?? '').trim() === closerText)
      return { indent, closerIndex: index };
  throw new Error(`${where}: no line "${closerText}" closes the block`);
}

/**
 * The keys a block assigns directly: the lines at the opener's indentation plus two, from the opener
 * to its closer, in order.
 * @param {readonly string[]} lines
 * @param {number} openerIndex
 * @param {number} closerIndex
 * @param {number} indent
 * @returns {string[]}
 */
function assignedNames(lines, openerIndex, closerIndex, indent) {
  const pattern = new RegExp(`^ {${indent + 2}}([A-Za-z_$][\\w$]*):`);
  const names = [];
  for (let index = openerIndex + 1; index < closerIndex; index += 1) {
    const match = pattern.exec(lines[index] ?? '');
    if (match) names.push(match[1] ?? '');
  }
  return names;
}

/**
 * What the recorder's own lines say about publishing and removal, read from the tree rather than
 * taken from the record. Every survival claim is held to these facts, so a record cannot decide on
 * its own whether a dangling start reaches the published record.
 */
function recorderFacts() {
  const lines = sourceLines(AGENT);
  const trimmed = lines.map((line) => line.trim());
  /** @param {string} needle */
  const has = (needle) => trimmed.includes(needle);
  return {
    lines: trimmed,
    splices: trimmed.filter((line) => line.includes('splice(')),
    /** Entries are dropped for a missing consequent only if a removal says so. */
    removesForMissingConsequent: trimmed.some(
      (line) =>
        line.includes('splice(') && /\b(end|terminal|consequent)\b/.test(line),
    ),
    /** The frame's own list is cleared at close instead of published. */
    clearsFrameList: trimmed.some((line) =>
      /^(c\.events|cycle\.events)\s*=\s*\[\]/.test(line),
    ),
    /** The frame publishes a copy of its own list. */
    publishesFrameList: has('events: c.events.slice(),'),
    /** The held list is published as itself only if some line assigns it out. */
    publishesHeldList: trimmed.some((line) =>
      /:\s*pendingWorkEvents\b/.test(line),
    ),
    /** The held list is created once and emptied twice, so its declaration is not a clear. */
    emptiesHeldList: trimmed.filter(
      (line) =>
        /pendingWorkEvents\s*=\s*\[\]/.test(line) && !line.startsWith('var '),
    ).length,
    adoptsHeldList: has('events: adoptPendingWorkEvents(),'),
    publishesRouterList: has('return routerEvents.slice();'),
    publishesBoundaryList: has('entries: boundaryEntries.slice(),'),
    boundaryPushLines: trimmed.filter((line) =>
      line.includes('boundaryEntries.push('),
    ),
    boundaryResetAssignments: trimmed.filter((line) =>
      /boundaryReset:/.test(line),
    ),
    /** Any marker at all that a list or the record is final or complete. */
    declaresFinal: trimmed.some((line) =>
      /(final|complete)\s*:\s*true/.test(line),
    ),
  };
}

/**
 * The fields an entry assigns, its nested object included, so a pairing-field claim is held to an
 * entry that really carries the field.
 * @param {any} chain
 * @returns {string[]}
 */
function entryFieldNames(chain) {
  const names = chain.entry.fields.map((field) => field.name);
  if (chain.entry.nested)
    for (const field of chain.entry.nested.fields) names.push(field.name);
  return names;
}

/**
 * Whether the chain is judgeable, read off the record's own three answers: a complete pairing field,
 * a consequent the record keeps, and a start that survives to be reported.
 * @param {any} chain
 * @returns {boolean}
 */
function judgeableOf(chain) {
  return (
    chain.pairingField.complete === true &&
    chain.consequent.recorded === true &&
    chain.survival.survives === true
  );
}

/**
 * One chain, held to the file: the cited lines exist and quote themselves, the recorded field list is
 * the list the cited builder assigns, the pairing field is a field the entry assigns and is complete
 * exactly when it names an identity, and the survival and window answers are the ones the recorder's
 * code supports.
 * @param {any} chain
 * @param {ReturnType<typeof recorderFacts>} facts
 */
function validateChain(chain, facts) {
  const where = `chains[${chain.id}]`;
  for (const key of [
    'id',
    'stream',
    'publishedAs',
    'file',
    'declaration',
    'entry',
    'start',
    'consequent',
    'pairingField',
    'ambiguity',
    'survival',
    'window',
    'judgeable',
    'judgeableReason',
  ])
    assert.ok(key in chain, `${where} carries ${key}`);
  assert.equal(typeof chain.stream, 'string', `${where}.stream is a name`);
  assert.equal(
    chain.declaration.file,
    chain.file,
    `${where}.declaration is in the chain's own file`,
  );
  assert.ok(
    chain.declaration.lineText.includes(`var ${chain.stream} = [];`),
    `${where}.declaration declares the stream variable`,
  );

  const lines = sourceLines(chain.file);
  const entry = chain.entry;
  assertCitation(entry.builder, `${where}.entry.builder`);
  assertCitation(entry.opener, `${where}.entry.opener`);
  assertCitation(entry.closer, `${where}.entry.closer`);
  assert.ok(
    entry.builder.lineText.startsWith('function '),
    `${where}.entry.builder is a function`,
  );
  assert.equal(
    entry.opener.lineText,
    'var entry = {',
    `${where}.entry.opener opens the entry`,
  );

  const direct = blockOf(
    lines,
    entry.opener.line - 1,
    entry.closer.lineText,
    `${where}.entry`,
  );
  assert.equal(
    entry.closer.line,
    direct.closerIndex + 1,
    `${where}.entry.closer is the line that closes the entry`,
  );
  const recorded = entry.fields.map((field) => field.name);
  assert.deepEqual(
    recorded,
    assignedNames(
      lines,
      entry.opener.line - 1,
      direct.closerIndex,
      direct.indent,
    ),
    `${where} records every field its cited builder assigns, in order and no other`,
  );

  for (const field of entry.fields) {
    const at = `${where}.entry.fields[${field.name}]`;
    assertCitation(field.site, `${at}.site`);
    assert.ok(
      field.site.lineText.startsWith(`${field.name}:`),
      `${at}.site assigns ${field.name}`,
    );
    assert.ok(
      field.site.line > entry.opener.line &&
        field.site.line < entry.closer.line,
      `${at}.site sits inside the entry the builder opens`,
    );
  }

  if (entry.nested) {
    const nested = entry.nested;
    const at = `${where}.entry.nested`;
    const parent = entry.fields.find((field) => field.name === nested.parent);
    assert.ok(parent !== undefined, `${at}.parent is a field of the entry`);
    assertCitation(nested.opener, `${at}.opener`);
    assertCitation(nested.closer, `${at}.closer`);
    assert.equal(
      nested.opener.line,
      parent.site.line,
      `${at}.opener is the parent field's own line`,
    );
    const inner = blockOf(
      lines,
      nested.opener.line - 1,
      nested.closer.lineText,
      at,
    );
    assert.equal(
      nested.closer.line,
      inner.closerIndex + 1,
      `${at}.closer is the line that closes the nested object`,
    );
    assert.deepEqual(
      nested.fields.map((field) => field.name),
      assignedNames(
        lines,
        nested.opener.line - 1,
        inner.closerIndex,
        inner.indent,
      ),
      `${at} records every key it cites, in order and no other`,
    );
    for (const field of nested.fields) {
      const nestedAt = `${at}.fields[${field.name}]`;
      assertCitation(field.site, `${nestedAt}.site`);
      assert.ok(
        field.site.lineText.startsWith(`${field.name}:`),
        `${nestedAt}.site assigns ${field.name}`,
      );
      assert.ok(
        field.site.line > nested.opener.line &&
          field.site.line < nested.closer.line,
        `${nestedAt}.site sits inside the nested object`,
      );
    }
  }

  for (const part of ['start', 'consequent', 'ambiguity']) {
    const block = chain[part];
    assert.equal(
      typeof block.what === 'string' || typeof block.statement === 'string',
      true,
      `${where}.${part} says what it is`,
    );
    assert.ok(
      Array.isArray(block.citations) && block.citations.length >= 1,
      `${where}.${part} cites what it read`,
    );
    for (const [index, citation] of block.citations.entries())
      assertCitation(citation, `${where}.${part}.citations[${index}]`);
  }
  assert.equal(
    typeof chain.consequent.recorded,
    'boolean',
    `${where}.consequent.recorded is a boolean`,
  );

  // The pairing field is a field the entry assigns, and it is complete exactly when it is an
  // identity: a family, a side or a presence bit joins nothing.
  const pairing = chain.pairingField;
  assert.equal(
    typeof pairing.name,
    'string',
    `${where}.pairingField names a field`,
  );
  assertCitation(pairing.site, `${where}.pairingField.site`);
  assert.ok(
    pairing.site.lineText.startsWith(`${pairing.name}:`),
    `${where}.pairingField.site assigns ${pairing.name}`,
  );
  assert.ok(
    entryFieldNames(chain).includes(pairing.name),
    `${where}.pairingField names a field its entry assigns`,
  );
  assert.equal(
    typeof pairing.complete,
    'boolean',
    `${where}.pairingField.complete is a boolean`,
  );
  assert.equal(
    pairing.complete,
    IDENTITY_FIELDS.includes(pairing.name),
    `${where}.pairingField.complete is true exactly when ${pairing.name} identifies one event; the record says ${pairing.complete}`,
  );
  assert.ok(
    Array.isArray(pairing.citations) && pairing.citations.length >= 1,
    `${where}.pairingField cites what it read`,
  );
  for (const [index, citation] of pairing.citations.entries())
    assertCitation(citation, `${where}.pairingField.citations[${index}]`);

  assert.equal(
    typeof chain.ambiguity.distinguishable,
    'boolean',
    `${where}.ambiguity.distinguishable is a boolean`,
  );

  // Survival: the answer is the recorder's, not the record's own preference.
  const survival = chain.survival;
  assert.equal(
    typeof survival.survives,
    'boolean',
    `${where}.survival.survives is a boolean`,
  );
  if (survival.survives === false)
    assert.fail(
      `${where}.survival claims a recorded start does not survive into the published record; it must cite the line that drops it (survival.drops) and the recorder has no such line`,
    );
  assertCitation(survival.publishedAt, `${where}.survival.publishedAt`);
  assert.match(
    survival.publishedAt.lineText,
    /^(events|routerEvents|entries): .+(slice\(\)|List\(\)|Field\(\)),$/,
    `${where}.survival.publishedAt is the line that publishes the chain's list`,
  );
  assert.equal(
    survival.removedBy.missingConsequent,
    facts.removesForMissingConsequent,
    `${where}.survival.removedBy.missingConsequent: the record says a consequent-less entry is dropped only if the recorder's removals do; they do not`,
  );
  assert.equal(
    survival.removedBy.frameClose,
    facts.clearsFrameList,
    `${where}.survival.removedBy.frameClose: the frame's close publishes its list; it does not clear it`,
  );
  assertCitation(survival.removedBy.bound, `${where}.survival.removedBy.bound`);
  assertCitation(survival.removedBy.reset, `${where}.survival.removedBy.reset`);
  assert.ok(
    survival.removedBy.reset.lineText.endsWith('= [];'),
    `${where}.survival.removedBy.reset is the line that clears the list`,
  );
  if (survival.held !== null) {
    const held = survival.held;
    assert.equal(
      held.applies,
      true,
      `${where}.survival.held applies to this chain`,
    );
    assert.equal(
      held.published,
      facts.publishesHeldList,
      `${where}.survival.held.published must be false: the recorder never publishes the held list (no line assigns pendingWorkEvents into a record)`,
    );
    assert.equal(
      facts.emptiesHeldList >= 1,
      true,
      'the held list is emptied somewhere',
    );
    assertCitation(
      held.emptiedByAdoption,
      `${where}.survival.held.emptiedByAdoption`,
    );
    assert.ok(
      held.emptiedByAdoption.lineText.includes('pendingWorkEvents = [];'),
      `${where}.survival.held.emptiedByAdoption is the line that empties it`,
    );
    assertCitation(held.adoptedAt, `${where}.survival.held.adoptedAt`);
    assertCitation(held.bound, `${where}.survival.held.bound`);
  }

  // The window: a list the record publishes, and no marker claiming the list is final.
  const window = chain.window;
  assert.ok(
    window.kind === 'union-of-frames' || window.kind === 'published-list',
    `${where}.window.kind is a window this record can name`,
  );
  assert.equal(
    typeof window.field,
    'string',
    `${where}.window names its field`,
  );
  assertCitation(window.site, `${where}.window.site`);
  assert.ok(
    window.site.lineText.startsWith(`${window.field.split('.')[0]}:`),
    `${where}.window.site publishes ${window.field}`,
  );
  assert.equal(
    typeof window.final,
    'boolean',
    `${where}.window.final is a boolean`,
  );
  assert.equal(
    window.final,
    facts.declaresFinal,
    `${where}.window.final is true only if the recorder marks a list as final; the record says ${window.final}`,
  );
  assert.ok(
    Array.isArray(window.also) && window.also.length >= 1,
    `${where}.window cites the lines around it`,
  );
  for (const [index, citation] of window.also.entries())
    assertCitation(citation, `${where}.window.also[${index}]`);

  assert.equal(
    typeof chain.judgeableReason,
    'string',
    `${where}.judgeableReason names the reason`,
  );
  assert.equal(
    chain.judgeable,
    judgeableOf(chain),
    `${where}.judgeable is ${judgeableOf(chain)} on the record's own pairing, consequent and survival answers; the record says ${chain.judgeable}`,
  );
  assert.equal(
    chain.judgeable,
    chain.judgeableReason === 'paired-by-id',
    `${where}.judgeableReason is the reason the judgement is possible or not`,
  );
}

/**
 * The record's shape and every claim it makes, callable so a doctored record can be put through the
 * same checks the record itself passes.
 * @param {any} candidate
 */
function validate(candidate) {
  for (const key of [
    'schema',
    'milestone',
    'task',
    'title',
    'question',
    'head',
    'headCommand',
    'measuredAt',
    'lineTextConvention',
    'measurements',
    'chains',
    'answer',
    'notClaimed',
    'verdict',
  ])
    assert.ok(key in candidate, `the record carries ${key}`);
  assert.equal(
    candidate.schema,
    'm050-chains/v1',
    'the record declares its schema',
  );
  assert.equal(candidate.task, 'T001', 'the record names its task');
  assert.match(
    candidate.head,
    /^[0-9a-f]{40}$/,
    'head is one commit sha, not a branch name',
  );
  assert.equal(
    candidate.headCommand,
    'git rev-parse HEAD',
    'the record says how the head was read',
  );
  assert.match(
    candidate.measuredAt,
    /no browser was opened/i,
    'the record says how it was measured: no browser was opened',
  );
  assert.match(
    candidate.measuredAt,
    /nothing was rendered/i,
    'the record says nothing was rendered',
  );

  assert.ok(
    Array.isArray(candidate.measurements) && candidate.measurements.length >= 1,
    'the record carries its measurements',
  );
  for (const measurement of candidate.measurements) {
    assert.equal(typeof measurement.id, 'string', 'a measurement is named');
    assert.ok(
      Array.isArray(measurement.output) && measurement.output.length >= 1,
      `measurements[${measurement.id}] quotes an output`,
    );
    assert.ok(
      typeof measurement.command === 'string' ||
        Array.isArray(measurement.commands),
      `measurements[${measurement.id}] quotes the command it ran`,
    );
  }

  assert.ok(Array.isArray(candidate.chains), 'chains is a list');
  assert.deepEqual(
    candidate.chains.map((chain) => chain.id),
    CHAIN_IDS,
    'the record carries exactly the three measured chains',
  );
  const facts = recorderFacts();
  for (const chain of candidate.chains) validateChain(chain, facts);

  // The answer is the per-chain evidence, and never more than it.
  const answer = candidate.answer;
  assert.ok(Array.isArray(answer.judgeable), 'answer.judgeable is a list');
  assert.ok(
    Array.isArray(answer.notJudgeable),
    'answer.notJudgeable is a list',
  );
  assert.deepEqual(
    answer.judgeable,
    candidate.chains.filter(judgeableOf).map((chain) => chain.id),
    'answer.judgeable is exactly the chains the per-chain evidence makes judgeable',
  );
  assert.deepEqual(
    answer.notJudgeable.map((entry) => entry.chain),
    candidate.chains
      .filter((chain) => !judgeableOf(chain))
      .map((chain) => chain.id),
    'answer.notJudgeable names every chain the evidence refuses',
  );
  for (const entry of answer.notJudgeable) {
    const chain = candidate.chains.find(
      (candidateChain) => candidateChain.id === entry.chain,
    );
    assert.equal(
      entry.reason,
      chain.judgeableReason,
      `answer.notJudgeable[${entry.chain}] gives the reason the chain states`,
    );
  }
  assert.equal(
    answer.survival.danglingStartsSurvive,
    candidate.chains.every((chain) => chain.survival.survives === true),
    'answer.survival.danglingStartsSurvive is what the chains measured',
  );
  assert.equal(
    typeof answer.survival.statement,
    'string',
    'answer.survival says what survives',
  );
  assert.equal(
    answer.narrowing.narrowed,
    answer.judgeable.length < candidate.chains.length,
    'answer.narrowing.narrowed says whether the judgeable set is narrower',
  );
  assert.deepEqual(
    answer.narrowing.to,
    answer.judgeable,
    'answer.narrowing names the judgeable chains',
  );
  assert.ok(
    answer.notJudgeable.some(
      (entry) => entry.reason === answer.narrowing.cause,
    ),
    'answer.narrowing.cause is a refusal the record states',
  );

  assert.deepEqual(
    answer.windows.map((window) => window.chain),
    CHAIN_IDS,
    'answer.windows names one window per chain',
  );
  for (const [index, window] of answer.windows.entries()) {
    const chain = candidate.chains[index];
    assert.deepEqual(
      window.site,
      chain.window.site,
      `answer.windows[${window.chain}] cites the window the chain measures`,
    );
    assert.equal(
      window.fields.includes(chain.window.field),
      true,
      `answer.windows[${window.chain}] names the field the chain publishes`,
    );
  }

  assert.equal(
    answer.evidence.length,
    candidate.chains.length,
    'answer.evidence cites one decisive line per chain',
  );
  for (const decisive of DECISIVE) {
    const cited = answer.evidence.find(
      (citation) => citation.chain === decisive.chain,
    );
    assert.ok(cited !== undefined, `answer.evidence cites ${decisive.chain}`);
    assert.deepEqual(
      {
        file: cited.file,
        line: cited.line,
        lineText: cited.lineText,
      },
      { file: decisive.file, line: decisive.line, lineText: decisive.lineText },
      `answer.evidence for ${decisive.chain} is the line its verdict rests on`,
    );
  }
  assert.equal(
    typeof answer.statement,
    'string',
    'answer.statement says what was measured',
  );

  // What the record does not claim, and that it says so.
  assert.ok(
    Array.isArray(candidate.notClaimed) && candidate.notClaimed.length >= 3,
    'the record states what it does not claim',
  );
  const disclaimed = candidate.notClaimed.join('\n');
  assert.match(
    disclaimed,
    /no page was read/i,
    'the record says no page was read',
  );
  assert.match(
    disclaimed,
    /no browser was opened/i,
    'the record says no browser was opened',
  );
  assert.match(
    disclaimed,
    /nothing was rendered/i,
    'the record says nothing was rendered',
  );
  assert.match(
    disclaimed,
    /T002/,
    'the record says the judgement is not written',
  );
  assert.equal(
    typeof candidate.verdict,
    'string',
    'the record ends with a verdict',
  );
  assert.ok(
    candidate.verdict.length >= 100,
    'the verdict says what was measured',
  );
}

/** A deep copy of the record, so a mutant cannot touch the record the tests read. */
function copyOfRecord() {
  return JSON.parse(JSON.stringify(record));
}

/** One chain, patched, for the refusals below. */
function chainPatched(id, patch) {
  return {
    ...copyOfRecord(),
    chains: record.chains.map((chain) =>
      chain.id === id
        ? { ...JSON.parse(JSON.stringify(chain)), ...patch }
        : chain,
    ),
  };
}

test('the record is three chains, three windows, an answer and what it does not claim', () => {
  validate(record);
  assert.equal(record.chains.length, 3, 'three chains are measured');
  assert.deepEqual(
    record.answer.judgeable,
    ['router'],
    'one chain is judgeable',
  );
  assert.equal(
    record.answer.survival.danglingStartsSurvive,
    true,
    'a dangling start survives into the published record',
  );
});

test('every cited path and line is the one the record read', () => {
  let citations = 0;
  for (const [where, citation] of allCitations(record, '')) {
    assertCitation(citation, where);
    citations += 1;
  }
  assert.ok(citations >= 100, `the record cites ${citations} lines`);
});

test('every chain records exactly the fields its cited builder assigns', () => {
  for (const chain of record.chains) {
    const lines = sourceLines(chain.file);
    const entry = chain.entry;
    const direct = blockOf(
      lines,
      entry.opener.line - 1,
      entry.closer.lineText,
      chain.id,
    );
    assert.deepEqual(
      entry.fields.map((field) => field.name),
      assignedNames(
        lines,
        entry.opener.line - 1,
        direct.closerIndex,
        direct.indent,
      ),
      `${chain.id} records the builder's own field list`,
    );
  }
});

test('only the router pairs a start with its consequent on an identity field', () => {
  const pairing = Object.fromEntries(
    record.chains.map((chain) => [
      chain.id,
      { name: chain.pairingField.name, complete: chain.pairingField.complete },
    ]),
  );
  assert.deepEqual(pairing, {
    work: { name: 'pair', complete: false },
    router: { name: 'id', complete: true },
    boundary: { name: 'boundaryReset', complete: false },
  });
  const work = record.chains.find((chain) => chain.id === 'work');
  assert.ok(
    work.pairingField.citations.some((citation) =>
      citation.lineText.includes('pairs a start with its end'),
    ),
    'the refused work pairing cites the file saying it pairs nothing',
  );
  const boundary = record.chains.find((chain) => chain.id === 'boundary');
  assert.equal(
    boundary.entry.nested.fields.find((field) => field.name === 'boundaryReset')
      .site.lineText,
    'boundaryReset: hasBoundary',
    'the boundary pairing field is a presence bit on the arrival that carries it',
  );
});

test('the survival answer is the recorder’s, not the record’s preference', () => {
  const facts = recorderFacts();
  assert.equal(facts.publishesFrameList, true, 'the frame publishes its list');
  assert.equal(
    facts.publishesHeldList,
    false,
    'the held list is never published',
  );
  assert.equal(
    facts.emptiesHeldList,
    2,
    'the held list is emptied in two places',
  );
  assert.equal(
    facts.removesForMissingConsequent,
    false,
    'no removal reads an end',
  );
  assert.equal(
    facts.splices.length,
    3,
    'three bounds are the only entry removals',
  );
  for (const chain of record.chains)
    assert.equal(
      chain.survival.survives,
      true,
      `${chain.id} records that a start without its consequent reaches the record`,
    );
  assert.equal(
    facts.boundaryPushLines.length,
    1,
    'one arrival recorder writes the boundary list',
  );
  assert.equal(
    facts.boundaryResetAssignments.length,
    1,
    'boundaryReset is assigned once, inside that arrival',
  );
});

test('the brief’s interaction count does not reproduce, and the record says so', () => {
  const agent = sourceLines(AGENT).join('\n');
  assert.equal(
    [...agent.matchAll(/interaction/g)].length,
    0,
    'extension/agent-main.js records no interaction',
  );
  const measured = record.measurements.find(
    (measurement) => measurement.id === 'interaction-recount',
  );
  assert.ok(measured !== undefined, 'the record carries the recount');
  const output = measured.output.join('\n');
  assert.match(output, /agentMain 0/, 'the recorder’s count is 0, as measured');
  assert.match(
    output,
    /interaction-story\.js 7/,
    'the extension-wide count is not 0 at this head: the M049 narration holds the word',
  );
  assert.match(
    measured.note,
    /does not reproduce/i,
    'the record states that the brief’s count does not reproduce',
  );
  const disclaimed = record.notClaimed.join('\n');
  assert.match(
    disclaimed,
    /does not reproduce/i,
    'what the record does not claim includes the count',
  );
});

test('no window is claimed final, and the recorder marks none', () => {
  const facts = recorderFacts();
  assert.equal(facts.declaresFinal, false, 'no line marks a list final');
  for (const chain of record.chains)
    assert.equal(
      chain.window.final,
      false,
      `${chain.id} is judged over a window that is not marked final`,
    );
});

test('a doctored record reddens the check it violates', () => {
  const slid = copyOfRecord();
  slid.chains[0].pairingField.site.line += 1;
  assert.throws(
    () => validate(slid),
    /quotes/,
    'a citation that slid off its line is refused',
  );

  const requoted = copyOfRecord();
  requoted.chains[1].window.site.lineText = 'return routerEvents.slice();';
  assert.throws(
    () => validate(requoted),
    /quotes/,
    'a line quoted as text it does not hold is refused',
  );

  const invented = copyOfRecord();
  invented.chains[0].entry.fields.push({
    name: 'instance',
    kind: 'derived',
    from: 'invented',
    site: {
      file: AGENT,
      line: 700,
      lineText: 'componentName: instanceNameFor(instance),',
    },
  });
  assert.throws(
    () => validate(invented),
    /records every field/,
    'a field the record invents is refused',
  );

  const paired = chainPatched('work', {
    pairingField: {
      ...record.chains[0].pairingField,
      complete: true,
    },
  });
  assert.throws(
    () => validate(paired),
    /complete is true exactly when/,
    'a pair name is not a pairing field, however the record reads it',
  );

  const judged = chainPatched('work', { judgeable: true });
  assert.throws(
    () => validate(judged),
    /judgeable is false/,
    'a chain with no pairing field cannot be judged judgeable',
  );

  const dropped = chainPatched('work', {
    survival: {
      ...record.chains[0].survival,
      survives: false,
    },
  });
  assert.throws(
    () => validate(dropped),
    /must cite the line that drops it/,
    'a record claiming a dangling start is dropped is refused while the frame publishes its list',
  );

  const heldClaimed = chainPatched('work', {
    survival: {
      ...record.chains[0].survival,
      held: { ...record.chains[0].survival.held, published: true },
    },
  });
  assert.throws(
    () => validate(heldClaimed),
    /never publishes the held list/,
    'a record claiming the emptied held list is published is refused',
  );

  const consequentDropped = chainPatched('router', {
    consequent: { ...record.chains[1].consequent, recorded: false },
  });
  assert.throws(
    () => validate(consequentDropped),
    /judgeable is false/,
    'a chain whose consequent the record does not keep cannot stay judgeable',
  );

  const everyChain = copyOfRecord();
  everyChain.answer.judgeable = CHAIN_IDS;
  assert.throws(
    () => validate(everyChain),
    /answer.judgeable is exactly the chains/,
    'an answer that judges a chain the evidence refuses is refused',
  );

  const movedEvidence = copyOfRecord();
  movedEvidence.answer.evidence = movedEvidence.answer.evidence.map((entry) =>
    entry.chain === 'router'
      ? { ...entry, line: 1637, lineText: 'type: routerClassNameOf(event),' }
      : entry,
  );
  assert.throws(
    () => validate(movedEvidence),
    /answer.evidence for router is the line its verdict rests on/,
    'a verdict that stops citing its decisive line is refused',
  );

  const notSurviving = copyOfRecord();
  notSurviving.answer.survival.danglingStartsSurvive = false;
  assert.throws(
    () => validate(notSurviving),
    /danglingStartsSurvive is what the chains measured/,
    'an answer that contradicts the per-chain survival is refused',
  );

  const silent = copyOfRecord();
  silent.notClaimed = [];
  assert.throws(
    () => validate(silent),
    /states what it does not claim/,
    'a record that does not say what it does not claim is refused',
  );

  const short = copyOfRecord();
  short.chains = short.chains.slice(0, 2);
  assert.throws(
    () => validate(short),
    /three measured chains/,
    'a chain dropped from the record is refused',
  );
});
