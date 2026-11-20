// @ts-check
// Run: node --test scripts/interaction-story.test.mjs
//
// M049 T001 measures the three arrival-ordered streams a page records — `routerEvents`,
// `pendingWorkEvents` (published as the frame's `events`) and `boundaryEntries` — and decides
// whether one merged story can be honest about their order.
// `research/raw/m049-streams.json` names, per stream, every entry field with the line that
// assigns it, the bound and what happens above it, the sentence that states the order, and the
// comparable field if there is one. This suite holds the record to the tree, because a record
// nobody re-reads drifts the way a comment does: every quoted line must be the line its number
// names, every recorded field list must be the list the cited builder actually assigns, and the
// answer `sharedOrder` must be what the per-stream evidence says — a record that claims a shared
// clock while no stream cites a shared field is the failure this suite exists for (SC1, SC3; N3).
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { createContext, runInContext } from 'node:vm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RECORD = 'research/raw/m049-streams.json';
const AGENT = 'extension/agent-main.js';
const EXTENSION = 'extension';
const STREAM_IDS = ['router', 'work', 'boundary'];

const record = JSON.parse(readFileSync(join(ROOT, RECORD), 'utf8'));

/**
 * @typedef {object} Citation a line in the tree that the record quotes.
 * @property {string} file the repository-relative posix path the line is in.
 * @property {number} line the 1-indexed line.
 * @property {string} lineText that line, trimmed, and nothing else.
 */

/**
 * @typedef {object} Field one key a stream's entry assigns.
 * @property {string} name the key.
 * @property {string} kind 'derived' or 'literal'.
 * @property {string} from what the assigned value is.
 * @property {Citation} site the line that assigns it.
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
 * Every citation the record makes, with the place it sits, so one walk holds the whole record to
 * the tree. A citation is any object carrying a `file`, a `line` and a `lineText`; nothing else in
 * the record is asked to cite.
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
 * The number of leading spaces a line has, so a field at one nesting depth can be told from a
 * field at the next.
 * @param {string} line
 * @returns {number}
 */
function indentOf(line) {
  return line.length - line.trimStart().length;
}

/**
 * The index of the first line after an opener whose trimmed text is the given closer, and the
 * opener's own indentation. No such line throws, which is the check that the record's builder
 * still has the shape it was measured in.
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
 * The keys a block assigns directly: the lines at the opener's indentation plus two, from the
 * opener to its closer, in order.
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
 * The shared field names the record cites, each with the ids of the streams that cite it as
 * shared. This is the record's own evidence read back, so the answer cannot outrun it.
 * @param {any} candidate
 * @returns {Map<string, Set<string>>}
 */
function sharedFieldsOf(candidate) {
  /** @type {Map<string, Set<string>>} */
  const shared = new Map();
  for (const stream of candidate.streams ?? [])
    for (const field of stream.comparable?.fields ?? []) {
      if (field.shared !== true) continue;
      const carriers = shared.get(field.name) ?? new Set();
      carriers.add(stream.id);
      shared.set(field.name, carriers);
    }
  return shared;
}

/**
 * One stream, held to the file: the cited lines exist and quote themselves, the recorded field
 * list is the list the cited builder assigns, the bound is the bound the cited constant states, the
 * order is the cited sentence, and a shared comparable field is read by the one clock reader.
 * @param {any} stream
 * @param {any} candidate
 */
function validateStream(stream, candidate) {
  const where = `streams[${stream.id}]`;
  for (const key of [
    'id',
    'stream',
    'file',
    'declaration',
    'entry',
    'bound',
    'order',
    'comparable',
    'reader',
  ])
    assert.ok(key in stream, `${where} carries ${key}`);
  assert.equal(typeof stream.stream, 'string', `${where}.stream is a name`);
  assert.equal(
    stream.declaration.file,
    stream.file,
    `${where}.declaration is in the stream's own file`,
  );
  assert.ok(
    stream.declaration.lineText.includes(`var ${stream.stream} = [];`),
    `${where}.declaration declares the stream variable`,
  );

  const lines = sourceLines(stream.file);
  const entry = stream.entry;
  assertCitation(entry.builder, `${where}.entry.builder`);
  assertCitation(entry.opener, `${where}.entry.opener`);
  assertCitation(entry.closer, `${where}.entry.closer`);
  assert.equal(
    entry.builder.file,
    stream.file,
    `${where}.entry.builder is in the stream's own file`,
  );
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

  assert.ok(
    Array.isArray(entry.fields) && entry.fields.length >= 1,
    `${where}.entry.fields is a list`,
  );
  const recorded = entry.fields.map((field) => field.name);
  const parsed = assignedNames(
    lines,
    entry.opener.line - 1,
    direct.closerIndex,
    direct.indent,
  );
  assert.deepEqual(
    recorded,
    parsed,
    `${where} records every field its cited builder assigns, in order and no other`,
  );
  assert.equal(
    new Set(recorded).size,
    recorded.length,
    `${where} names each field once`,
  );

  for (const field of entry.fields) {
    const at = `${where}.entry.fields[${field.name}]`;
    assert.ok(
      field.kind === 'derived' || field.kind === 'literal',
      `${at}.kind is derived or literal`,
    );
    assert.equal(typeof field.from, 'string', `${at}.from says what it is`);
    assert.ok(field.from.length > 0, `${at}.from says something`);
    assertCitation(field.site, `${at}.site`);
    assert.equal(
      field.site.file,
      stream.file,
      `${at}.site is in the stream file`,
    );
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
    assert.ok(
      parent.kind === 'derived',
      `${at} is the nested object a derived field assigns`,
    );
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
    assert.ok(
      Array.isArray(nested.fields) && nested.fields.length >= 1,
      `${at}.fields is a list`,
    );
    const recordedNested = nested.fields.map((field) => field.name);
    assert.deepEqual(
      recordedNested,
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

  const bound = stream.bound;
  assert.ok(
    Number.isInteger(bound.limit) && bound.limit > 0,
    `${where}.bound.limit is a positive integer`,
  );
  assertCitation(bound.limitSite, `${where}.bound.limitSite`);
  assert.ok(
    bound.limitSite.lineText.includes(String(bound.limit)),
    `${where}.bound.limitSite states the bound it records`,
  );
  assert.ok(
    Array.isArray(bound.enforced) && bound.enforced.length >= 1,
    `${where}.bound.enforced cites the line that applies the bound`,
  );
  assert.equal(
    typeof bound.above,
    'string',
    `${where}.bound.above is a string`,
  );
  assert.ok(bound.above.length > 0, `${where}.bound.above says what happens`);

  const order = stream.order;
  assert.equal(
    typeof order.stated,
    'boolean',
    `${where}.order.stated is a boolean`,
  );
  if (order.stated) {
    assert.equal(
      typeof order.statement,
      'string',
      `${where}.order has a sentence`,
    );
    assertCitation(order.site, `${where}.order.site`);
    assert.ok(
      order.site.lineText.includes(order.statement),
      `${where}.order.site holds the sentence the record quotes`,
    );
  } else {
    assert.equal(order.statement, null, `${where}.order quotes no sentence`);
    assert.equal(order.site, null, `${where}.order cites no sentence`);
  }

  const comparable = stream.comparable;
  assert.ok(
    Array.isArray(comparable.fields) && comparable.fields.length >= 1,
    `${where}.comparable.fields is a list`,
  );
  assert.equal(
    typeof comparable.statement,
    'string',
    `${where}.comparable.statement says what the fields mean`,
  );
  for (const field of comparable.fields) {
    const at = `${where}.comparable.fields[${field.name}]`;
    assert.ok(
      recorded.includes(field.name),
      `${at} names a field the entry assigns`,
    );
    assert.equal(typeof field.shared, 'boolean', `${at}.shared is a boolean`);
    assertCitation(field.site, `${at}.site`);
    assert.ok(
      field.site.lineText.startsWith(`${field.name}:`),
      `${at}.site assigns ${field.name}`,
    );
    if (field.shared) {
      assert.equal(
        field.reader,
        candidate.clock.reader,
        `${at} is shared by the one clock reader the record names`,
      );
      assert.ok(
        field.site.lineText.includes(`${field.reader}(`),
        `${at}.site calls the reader it claims`,
      );
    }
  }

  const reader = stream.reader;
  assert.equal(
    typeof reader.function,
    'string',
    `${where}.reader names a function`,
  );
  assertCitation(reader.site, `${where}.reader.site`);
  assert.ok(
    reader.site.lineText.includes(`function ${reader.function}(`),
    `${where}.reader.site defines the reader it names`,
  );
  assertCitation(reader.yields, `${where}.reader.yields`);
  assert.equal(
    typeof reader.cumulative,
    'boolean',
    `${where}.reader.cumulative is a boolean`,
  );
  assert.ok(
    Array.isArray(reader.callSites) && reader.callSites.length >= 1,
    `${where}.reader.callSites cites where it is used`,
  );
}

/**
 * The record's shape and every claim it makes, callable so a doctored record can be put through
 * the same checks the record itself passes.
 * @param {any} candidate
 */
function validate(candidate) {
  for (const key of [
    'schema',
    'milestone',
    'task',
    'question',
    'head',
    'headCommand',
    'measuredAt',
    'lineTextConvention',
    'measurements',
    'clock',
    'streams',
    'answer',
    'notClaimed',
    'verdict',
  ])
    assert.ok(key in candidate, `the record carries ${key}`);
  assert.equal(
    candidate.schema,
    'm049-streams/v1',
    'the record declares its schema',
  );
  assert.equal(candidate.task, 'T001', 'the record names its task');
  assert.equal(typeof candidate.head, 'string', 'head is a string');
  assert.match(
    candidate.head,
    /^[0-9a-f]{40}$/,
    'head is one commit sha, not a branch name',
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
  }

  // The clock: one reader, cited, and the fallback beside it.
  assert.equal(
    typeof candidate.clock.reader,
    'string',
    'the record names the clock reader',
  );
  assertCitation(candidate.clock.site, 'clock.site');
  assert.ok(
    candidate.clock.site.lineText.startsWith(
      `function ${candidate.clock.reader}(`,
    ),
    'clock.site defines the reader it names',
  );
  assert.ok(
    Array.isArray(candidate.clock.reads) && candidate.clock.reads.length >= 1,
    'clock.reads cites what the reader answers',
  );

  // Three streams, one of each, and no others.
  assert.ok(Array.isArray(candidate.streams), 'streams is a list');
  assert.deepEqual(
    candidate.streams.map((stream) => stream.id),
    STREAM_IDS,
    'the record carries exactly the three measured streams',
  );
  for (const stream of candidate.streams) validateStream(stream, candidate);

  // The answer is the per-stream evidence, and never more than it.
  const answer = candidate.answer;
  assert.equal(
    typeof answer.sharedOrder,
    'boolean',
    'answer.sharedOrder is a boolean',
  );
  assert.equal(
    typeof answer.statement,
    'string',
    'answer.statement says what was measured',
  );
  assert.ok(
    Array.isArray(answer.consequence) && answer.consequence.length >= 1,
    'answer.consequence states what the narration must obey',
  );
  for (const rule of answer.consequence)
    assert.ok(
      typeof rule === 'string' && rule.trim().length > 0,
      'every consequence says something',
    );
  assert.ok(
    answer.tiebreak !== null && typeof answer.tiebreak === 'object',
    'answer.tiebreak states whether a tie can be broken',
  );
  assert.equal(
    typeof answer.tiebreak.exists,
    'boolean',
    'answer.tiebreak.exists is a boolean',
  );
  if (answer.tiebreak.exists === false) {
    assert.ok(
      Array.isArray(answer.tiebreak.citations) &&
        answer.tiebreak.citations.length >= 1,
      'a stated absence of a tiebreak cites what it looked at',
    );
    for (const [index, citation] of answer.tiebreak.citations.entries())
      assertCitation(citation, `answer.tiebreak.citations[${index}]`);
  }

  assert.ok(Array.isArray(answer.evidence), 'answer.evidence is a list');
  const shared = sharedFieldsOf(candidate);
  if (answer.sharedOrder === true) {
    assert.ok(
      typeof answer.sharedField === 'string' && answer.sharedField.length > 0,
      'a shared order names the field it is shared on',
    );
    assert.equal(
      answer.sharedKind,
      'timestamp',
      'the shared field is a timestamp',
    );
    const carriers = shared.get(answer.sharedField);
    assert.ok(
      carriers !== undefined && carriers.size >= 2,
      `answer.sharedField is cited as shared by at least two streams; the record cites ${JSON.stringify(
        answer.sharedField,
      )}`,
    );
    assert.ok(
      answer.evidence.length >= 2,
      'a shared order cites the line that makes it shared, per stream',
    );
    const citedStreams = new Set();
    for (const [index, citation] of answer.evidence.entries()) {
      const where = `answer.evidence[${index}]`;
      assertCitation(citation, where);
      assert.ok(
        carriers.has(citation.stream),
        `${where} cites a stream that records the shared field`,
      );
      assert.ok(
        !citedStreams.has(citation.stream),
        `${where} is the one citation for its stream`,
      );
      citedStreams.add(citation.stream);
      assert.ok(
        citation.lineText.startsWith(`${answer.sharedField}:`),
        `${where} assigns the shared field`,
      );
      assert.ok(
        citation.lineText.includes(`${candidate.clock.reader}(`),
        `${where} reads the shared field from the one clock`,
      );
    }
    assert.equal(
      citedStreams.size,
      carriers.size,
      'every stream that records the shared field is cited',
    );
  } else {
    assert.equal(
      answer.sharedField,
      null,
      'no field is named shared when the streams do not share an order',
    );
    assert.equal(
      answer.evidence.length,
      0,
      'no evidence is recited for a shared order that was refused',
    );
    for (const [name, carriers] of shared)
      assert.ok(
        carriers.size < 2,
        `answer refuses a shared order while ${JSON.stringify(
          name,
        )} is cited as shared by ${carriers.size} streams`,
      );
  }

  // What the record does not claim, and that it says so.
  assert.ok(Array.isArray(candidate.notClaimed), 'notClaimed is a list');
  assert.ok(
    candidate.notClaimed.length >= 3,
    'the record states what it does not claim',
  );
  for (const claim of candidate.notClaimed)
    assert.ok(
      typeof claim === 'string' && claim.trim().length > 0,
      'every notClaimed entry says something',
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
    /interaction/i,
    'the record says no interaction was recorded',
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

/**
 * The record with one stream patched, for the refusals below.
 * @param {string} id
 * @param {object} patch
 */
function streamPatched(id, patch) {
  return {
    ...record,
    streams: record.streams.map((stream) =>
      stream.id === id ? { ...stream, ...patch } : stream,
    ),
  };
}

/**
 * A deep copy of the record, so a mutant cannot touch the record the tests read.
 * @returns {any}
 */
function copyOfRecord() {
  return JSON.parse(JSON.stringify(record));
}

test('the record is three streams, one clock, an answer and what it does not claim', () => {
  validate(record);
  assert.equal(record.streams.length, 3, 'three streams are measured');
  assert.equal(
    record.answer.sharedOrder,
    true,
    'the measured answer is an order',
  );
  assert.equal(record.answer.sharedField, 'at', 'the shared field is `at`');
  assert.equal(record.clock.reader, 'nowMs', 'one reader answers the clock');
});

test('every cited path and line is the one the record read', () => {
  let citations = 0;
  for (const [where, citation] of allCitations(record, '')) {
    assertCitation(citation, where);
    citations += 1;
  }
  assert.ok(citations >= 60, `the record cites ${citations} lines`);
});

test('every stream records exactly the fields its cited builder assigns', () => {
  for (const stream of record.streams) {
    const lines = sourceLines(stream.file);
    const entry = stream.entry;
    const direct = blockOf(
      lines,
      entry.opener.line - 1,
      entry.closer.lineText,
      stream.id,
    );
    assert.deepEqual(
      entry.fields.map((field) => field.name),
      assignedNames(
        lines,
        entry.opener.line - 1,
        direct.closerIndex,
        direct.indent,
      ),
      `${stream.id} records the builder's own field list`,
    );
  }
});

test('the shared field is read from one clock at every receipt', () => {
  const sites = record.streams.map((stream) => {
    const field = stream.comparable.fields.find(
      (candidate) =>
        candidate.name === record.answer.sharedField && candidate.shared,
    );
    assert.ok(
      field !== undefined,
      `${stream.id} records ${record.answer.sharedField} as a shared field`,
    );
    return field.site;
  });
  assert.deepEqual(
    sites.map((site) => `${site.file}:${site.line}`),
    record.answer.evidence.map((site) => `${site.file}:${site.line}`),
    'the answer cites the field sites the streams record',
  );
  for (const site of sites) {
    assert.ok(
      site.lineText.includes(`${record.clock.reader}(`),
      `${site.file}:${site.line} reads the receipt from ${record.clock.reader}`,
    );
    const line = sourceLines(site.file)[site.line - 1] ?? '';
    assert.ok(
      line.includes(`${record.clock.reader}()`),
      `${site.file}:${site.line} calls the clock reader the record names`,
    );
  }
  assert.deepEqual(
    record.clock.reads.map((read) => read.lineText),
    ['return globalThis.performance.now();', 'return Date.now();'],
    'the clock reader answers performance.now() and falls back to Date.now()',
  );
});

// ------------------------------------------------------------------------------------------------
// The recorder census: what a recorder writes, and the two files that are not recorders.
// ------------------------------------------------------------------------------------------------

// T002 adds extension/interaction-story.js: a pure reader of the record, named by the surface it
// narrates, with no listener and no page read. The measurement counts what a recorder writes, so the
// narration's own name is excluded from the word count; every file is still held to the listener
// count, and the narration registers none.
const NARRATION = 'interaction-story.js';

// M055 T002 adds extension/tutor-index.js: the authored question index, which is data and not a
// recorder. One question it authors reads 'does every step of the interaction story quote an event
// the record carries, in the order it arrived?' (`extension/tutor-index.js:72`, first landed by
// `f5f70284`), so the word is in the file while the file records nothing at all — an authored
// question is not a recording, and the word count is a count of recordings. The exclusion is by file
// name, the census is held to exactly these two names, and the mutant below puts the word into a
// recorder to prove every other file is still measured.
const AUTHORED_INDEX = 'tutor-index.js';

/** The two files excluded from the recorder word count, and the only two. */
const READERS = [NARRATION, AUTHORED_INDEX];

/**
 * Every `extension/*.js` file's text, by base name — the census's input, so a mutant can hand the
 * census a tree that is not the one on disk.
 * @returns {Map<string, string>}
 */
function extensionSources() {
  /** @type {Map<string, string>} */
  const sources = new Map();
  for (const file of readdirSync(join(ROOT, EXTENSION)))
    if (file.endsWith('.js'))
      sources.set(file, sourceLines(`${EXTENSION}/${file}`).join('\n'));
  return sources;
}

/**
 * The recorder census: how many `extension/*.js` files are recorders, which of them write the word
 * `interaction`, and how many click, pointer, mouse or key listeners every file registers. The two
 * readers are excluded from the word count and from the recorder count alone; every file is still
 * read for listeners.
 * @param {Map<string, string>} [sources] every extension script's text, by base name; by default read
 *   from disk
 */
function recorderCensus(sources = extensionSources()) {
  /** @type {string[]} */
  const files = [...sources.keys()].sort();
  /** @type {string[]} */
  const offenders = [];
  let recorders = 0;
  let listeners = 0;
  for (const file of files) {
    const source = sources.get(file) ?? '';
    listeners += [
      ...source.matchAll(/addEventListener\(\s*.(?:click|pointer|mouse|key)/g),
    ].length;
    if (READERS.includes(file)) continue;
    recorders += 1;
    if (source.includes('interaction')) offenders.push(file);
  }
  return { files, offenders, recorders, listeners, excluded: READERS };
}

/**
 * The pin: no recorder writes the word `interaction`, whatever the two readers are named, and no
 * extension file registers a UI listener. The offenders are named rather than counted, so a file that
 * gains the word is the failure's own subject and not an anonymous `1 !== 0`.
 * @param {ReturnType<typeof recorderCensus>} [census] the census, by default read from disk
 */
function pinNoRecordedInteraction(census = recorderCensus()) {
  const writing =
    census.offenders.length === 0
      ? 'none of them'
      : census.offenders.join(', ');
  assert.deepEqual(
    census.offenders,
    [],
    `the ${census.recorders} extension/*.js recorder files record no interaction, and the file(s) writing the word are: ${writing} (${NARRATION} is a reader and ${AUTHORED_INDEX} is the authored index — an authored question is not a recording — so both are excluded from the word count, and no third file is)`,
  );
  assert.equal(
    census.listeners,
    0,
    'no extension file registers a click, pointer, mouse or key listener',
  );
}

test('no stream records a user interaction, and the record says so', () => {
  const agent = sourceLines(AGENT).join('\n');
  assert.equal(
    [...agent.matchAll(/interaction/g)].length,
    0,
    'extension/agent-main.js records no interaction',
  );
  const files = readdirSync(join(ROOT, EXTENSION)).filter((file) =>
    file.endsWith('.js'),
  );
  assert.ok(files.length >= 1, 'the extension holds files to read');
  const census = recorderCensus();
  assert.deepEqual(
    census.files,
    files.slice().sort(),
    'the census reads every extension/*.js file on disk, so a file added later is measured rather than skipped',
  );
  pinNoRecordedInteraction(census);
  const measured = record.measurements.find(
    (measurement) => measurement.id === 'no-ui-capture',
  );
  assert.ok(measured !== undefined, 'the record carries the measurement');
  assert.ok(
    measured.output.join('\n').includes('interaction 0'),
    'the record quotes a measurement of 0 interactions',
  );
  assert.ok(
    measured.output.join('\n').includes('uiListenerNames 0'),
    'the record quotes a measurement of 0 UI listeners',
  );
});

test('the recorder census is narrow: a recorder that gains the word reddens it', () => {
  const clean = recorderCensus();
  assert.deepEqual(
    clean.excluded,
    [NARRATION, AUTHORED_INDEX],
    'exactly two files are excluded from the word count: the narration and the authored index',
  );
  assert.equal(
    clean.recorders,
    clean.files.length - clean.excluded.length,
    'every extension script that is not one of the two readers is counted as a recorder',
  );

  const recorder = 'agent-main.js';
  const doctored = extensionSources();
  assert.ok(
    doctored.has(recorder),
    `${recorder} is one of the files the census reads`,
  );
  doctored.set(
    recorder,
    `${doctored.get(recorder)}\nconst interactionStory = 'an interaction story';\n`,
  );
  const failure = reddens(
    () => pinNoRecordedInteraction(recorderCensus(doctored)),
    'a recorder that gains the word',
  );
  assert.match(
    failure.message,
    /agent-main\.js/,
    `the enumeration names the recorder that gained the word: ${failure.message.split('\n')[0]}`,
  );

  const wordedReaders = extensionSources();
  for (const reader of READERS)
    wordedReaders.set(
      reader,
      `${wordedReaders.get(reader)}\n// the interaction story, again\n`,
    );
  pinNoRecordedInteraction(recorderCensus(wordedReaders));
  pinNoRecordedInteraction(clean);
  console.log(`recorder census mutant: ${failure.message.split('\n')[0]}`);
});

test('no stream records a cross-stream sequence number', () => {
  const agent = sourceLines(AGENT).join('\n');
  for (const name of ['seq', 'sequence', 'arrivalIndex'])
    assert.equal(
      [...agent.matchAll(new RegExp(name, 'g'))].length,
      0,
      `extension/agent-main.js records no ${name}`,
    );
  assert.equal(
    record.answer.tiebreak.exists,
    false,
    'the record refuses a tiebreak between equal receipts',
  );
});

test('a doctored record reddens the check it violates', () => {
  const slid = copyOfRecord();
  slid.streams[0].entry.fields.find((field) => field.name === 'at').site.line +=
    1;
  assert.throws(
    () => validate(slid),
    /quotes/,
    'a citation that slid off its line is refused',
  );

  const requoted = copyOfRecord();
  requoted.streams[1].entry.fields[0].site.lineText = 'type: event';
  assert.throws(
    () => validate(requoted),
    /quotes/,
    'a line quoted as text it does not hold is refused',
  );

  const dropped = copyOfRecord();
  dropped.streams[0].entry.fields = dropped.streams[0].entry.fields.filter(
    (field) => field.name !== 'id',
  );
  assert.throws(
    () => validate(dropped),
    /records every field/,
    'a field the builder assigns and the record drops is refused',
  );

  const invented = copyOfRecord();
  invented.streams[2].entry.fields.push({
    name: 'sequence',
    kind: 'derived',
    from: 'invented',
    site: { file: AGENT, line: 2073, lineText: 'at: nowMs(),' },
  });
  assert.throws(
    () => validate(invented),
    /records every field/,
    'a field the record invents is refused',
  );

  const claimed = copyOfRecord();
  for (const stream of claimed.streams)
    for (const field of stream.comparable.fields) field.shared = false;
  assert.throws(
    () => validate(claimed),
    /at least two streams/,
    'a shared order no stream cites is refused',
  );

  const refused = copyOfRecord();
  refused.answer = {
    ...refused.answer,
    sharedOrder: false,
    sharedField: null,
    evidence: [],
  };
  assert.throws(
    () => validate(refused),
    /refuses a shared order/,
    'a refusal while a stream cites a shared field is refused',
  );

  const silent = copyOfRecord();
  silent.notClaimed = [];
  assert.throws(
    () => validate(silent),
    /states what it does not claim/,
    'a record that does not say what it does not claim is refused',
  );

  const short = copyOfRecord();
  short.streams = short.streams.slice(0, 2);
  assert.throws(
    () => validate(short),
    /three measured streams/,
    'a stream dropped from the record is refused',
  );
});

// ================================================ T002 — narrate the record, or refuse ====
//
// T001 measured that the three streams share one field, `at`, written by one reader, and that no
// stream records a sequence number. T002 turns that measurement into
// `extension/interaction-story.js`: the union of the three streams sorted by `at`, each step
// quoting its event's own fields, the equal-`at` group emitted as one instant, and every missing
// or unorderable case refused rather than guessed.
//
// The module is evaluated in a bare `node:vm` context; the checkout is never written. Every fact
// below is either read from the T001 record or built from the entry shapes the record cites.

const STORY_SRC = readFileSync(
  new URL('../extension/interaction-story.js', import.meta.url),
  'utf8',
);

/** The four fields the interface contract names, and no others. */
const ANSWER_KEYS = ['cannotTell', 'reason', 'state', 'steps'];

/** The three fields one step carries, and no others. */
const STEP_KEYS = ['at', 'fields', 'stream'];

// ---------------------------------------------------------------- plumbing ----

/** The standalone module: a bare context holding the source and whatever the caller puts in it. */
function storySource(source = STORY_SRC, sandbox = {}) {
  const context = createContext(sandbox);
  runInContext(source, context);
  const api = context.angularAiInteractionStory;
  assert.ok(
    api,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  assert.equal(
    typeof api.interactionStory,
    'function',
    'the module publishes the narration',
  );
  return { api, context };
}

function storyApi() {
  return storySource().api;
}

/**
 * A value from the vm context carries that context's own prototypes, so it is copied into this
 * realm before a structural assertion reads it. It is also how every answer is cloned, so a test
 * can never mutate a fixture for the next one.
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** One answer, copied into this realm. */
function storyOf(api, input) {
  return clone(api.interactionStory(input));
}

/** The keys an object carries, in the one order an assertion can compare. */
function keysOf(value) {
  return Object.keys(value).sort();
}

// ----------------------------------------------------------------- fixtures ----
//
// The three entry shapes are the ones extension/agent-main.js builds and T001 cites: the router's
// eleven keys at :1636–:1648, the work entry's five at :695–:701, and the boundary entry's four
// with its nested `details` at :2051–:2074. Every value below is a value those builders write.

/** One router entry, with a null for every field the event in the fixture does not carry. */
function routerEntry(fields) {
  return {
    type: fields.type,
    at: fields.at,
    id: fields.id === undefined ? null : fields.id,
    url: fields.url === undefined ? null : fields.url,
    urlAfterRedirects:
      fields.urlAfterRedirects === undefined ? null : fields.urlAfterRedirects,
    route: fields.route === undefined ? null : fields.route,
    reason: fields.reason === undefined ? null : fields.reason,
    code: fields.code === undefined ? null : fields.code,
    error: fields.error === undefined ? null : fields.error,
    shouldActivate:
      fields.shouldActivate === undefined ? null : fields.shouldActivate,
    matchedPaths: fields.matchedPaths === undefined ? [] : fields.matchedPaths,
  };
}

/** One work entry, shaped like the one the frame publishes in its `events` list. */
function workEntry(fields) {
  return {
    type: fields.type,
    pair: fields.pair,
    end: fields.end,
    at: fields.at,
    componentName:
      fields.componentName === undefined ? null : fields.componentName,
  };
}

/** The boundary entry's nested `details` object, every key a presence-tested null. */
function emptyDetails() {
  return {
    declarationType: null,
    declarationInstanceName: null,
    caughtBy: null,
    boundaryType: null,
    boundaryReset: null,
  };
}

/** One boundary entry, shaped like the one extension/agent-main.js:2051–:2074 records. */
function boundaryEntry(fields) {
  return {
    route: fields.route,
    error: fields.error === undefined ? null : fields.error,
    details: fields.details === undefined ? emptyDetails() : fields.details,
    at: fields.at,
  };
}

/**
 * The page record extension/agent-main.js publishes: `events` is the frame's own work, and
 * `routerEvents` and `boundary.entries` are the two cumulative streams. The other fields are ones
 * the narration must ignore.
 */
function pageRecord(lists) {
  return {
    cycleId: 7,
    startedAt: 0,
    trigger: { kind: 'unknown', listenerName: null },
    zoneMode: 'zoneless',
    events: lists.events === undefined ? [] : lists.events,
    routerEvents: lists.routerEvents === undefined ? [] : lists.routerEvents,
    boundary: {
      entries: lists.boundaryEntries === undefined ? [] : lists.boundaryEntries,
    },
    stability: { reachedBy: null, absence: null },
    checks: [],
  };
}

/**
 * The streams recorded out of `at` order: the record lists the router's arrivals first, but the
 * work entry at 10 was held before the frame opened and was adopted later (T001, `work.reader`),
 * so sorting by `at` moves it in front. The order this fixture is listed in is not the order any
 * stream-name, type or list-position sort would produce.
 */
function interleavedRecord() {
  return pageRecord({
    routerEvents: [
      routerEntry({
        type: 'NavigationEnd',
        at: 30,
        id: 1,
        url: '/a',
        urlAfterRedirects: '/a',
        matchedPaths: [],
      }),
      routerEntry({
        type: 'RoutesRecognized',
        at: 31,
        id: 2,
        url: '/b',
        matchedPaths: [''],
      }),
    ],
    events: [
      workEntry({
        type: 1,
        pair: 'TemplateUpdate',
        end: false,
        at: 10,
        componentName: '_App',
      }),
      workEntry({
        type: 2,
        pair: 'TemplateUpdate',
        end: true,
        at: 11,
        componentName: '_App',
      }),
    ],
    boundaryEntries: [
      boundaryEntry({
        route: 'hook',
        error: { name: 'TypeError', message: 'boom' },
        at: 20,
      }),
    ],
  });
}

/**
 * One instant shared by four events, bracketed by entries at 1 and 9 so the group is visible.
 * The router carries two arrivals at the same reading in its own arrival order, the work entry
 * and the boundary entry share it, and the record's read order for the group is neither the
 * stream-name order nor the type order.
 */
function tieRecord() {
  return pageRecord({
    routerEvents: [
      routerEntry({ type: 'NavigationEnd', at: 5, id: 1, url: '/a' }),
      routerEntry({ type: 'NavigationStart', at: 5, id: 2, url: '/b' }),
    ],
    events: [
      workEntry({
        type: 1,
        pair: 'TemplateUpdate',
        end: false,
        at: 1,
        componentName: '_App',
      }),
      workEntry({
        type: 2,
        pair: 'TemplateUpdate',
        end: false,
        at: 5,
        componentName: '_Counter',
      }),
    ],
    boundaryEntries: [
      boundaryEntry({ route: 'hook', at: 5 }),
      boundaryEntry({ route: 'handler', at: 9 }),
    ],
  });
}

/** Every stream empty: the absence SC2 asks for, never an empty story. */
function allEmptyRecord() {
  return pageRecord({});
}

/** The boundary stream empty, the other two populated: held-out E4. */
function oneEmptyRecord() {
  return pageRecord({
    routerEvents: [
      routerEntry({ type: 'NavigationEnd', at: 10, id: 1, url: '/a' }),
    ],
    events: [
      workEntry({
        type: 1,
        pair: 'TemplateUpdate',
        end: false,
        at: 5,
        componentName: '_App',
      }),
    ],
    boundaryEntries: [],
  });
}

/** Two streams empty: the story of the one that is populated, and both empties named. */
function twoEmptyRecord() {
  return pageRecord({
    routerEvents: [
      routerEntry({ type: 'NavigationEnd', at: 10, id: 1, url: '/a' }),
    ],
  });
}

/** One populated entry with no measured `at`: no merged order is recorded. */
function noAtRecord() {
  return pageRecord({
    routerEvents: [
      routerEntry({ type: 'NavigationEnd', at: null, id: 1, url: '/a' }),
    ],
    events: [
      workEntry({
        type: 1,
        pair: 'TemplateUpdate',
        end: false,
        at: 5,
        componentName: '_App',
      }),
    ],
    boundaryEntries: [boundaryEntry({ route: 'hook', at: 20 })],
  });
}

/** Every populated stream's every entry has no measured `at`. */
function noAtAnywhereRecord() {
  return pageRecord({
    routerEvents: [routerEntry({ type: 'NavigationEnd', at: null })],
    events: [
      workEntry({ type: 1, pair: 'TemplateUpdate', end: false, at: null }),
    ],
    boundaryEntries: [boundaryEntry({ route: 'hook', at: null })],
  });
}

/** A record whose `boundary` section it does not carry: unreadable, not empty. */
function unreadableRecord() {
  return { routerEvents: [], events: [], boundary: null };
}

/**
 * The steps the record itself supports: every entry of every stream, its own fields with `at`
 * hoisted, in the order the streams are listed. The narration's own answer is compared against
 * this, so a step it invents, reorders or paraphrases cannot pass.
 */
function expectedSteps(input) {
  const lists = [
    ['routerEvents', input.routerEvents],
    ['pendingWorkEvents', input.events],
    ['boundaryEntries', input.boundary.entries],
  ];
  const steps = [];
  for (const [stream, entries] of lists) {
    for (const entry of entries) {
      const fields = {};
      for (const key of Object.keys(entry)) {
        if (key === 'at') continue;
        fields[key] = entry[key];
      }
      steps.push({ stream: stream, at: entry.at, fields: fields });
    }
  }
  return steps;
}

/** One step quoted as the event it came from: the keys, the stream, the reading and the fields. */
function assertStepQuotes(step, expected) {
  assert.deepEqual(
    keysOf(step),
    STEP_KEYS,
    'a step carries exactly `stream`, `at` and `fields`',
  );
  assert.equal(
    step.stream,
    expected.stream,
    'a step names the stream it came from',
  );
  assert.equal(step.at, expected.at, 'a step carries the measured `at`');
  assert.equal(
    'at' in step.fields,
    false,
    'the measured `at` is hoisted beside `fields`, not left inside it',
  );
  assert.deepEqual(
    step.fields,
    expected.fields,
    'every step quotes the event’s own recorded fields, and no field is a paraphrase',
  );
}

// ------------------------------------------------------------------- the pins ----

/**
 * SC1. Every recorded event is one step, the steps are ordered by `at` ascending — never by the
 * order the streams are listed, by stream name or by type — and each step quotes its own event.
 */
function pinStory(api) {
  const input = interleavedRecord();
  const answer = storyOf(api, input);
  assert.deepEqual(
    keysOf(answer),
    ANSWER_KEYS,
    'the answer carries the four contract fields and no others',
  );
  assert.equal(answer.state, api.STEPS, 'a populated record is a story');
  assert.deepEqual(
    answer.cannotTell,
    [],
    'a populated record misses no stream',
  );
  assert.equal(answer.reason, null, 'a populated record has nothing to refuse');

  const expected = expectedSteps(input);
  assert.equal(
    answer.steps.length,
    expected.length,
    'the story invents a step for an event the record does not carry',
  );

  const ats = answer.steps.map((step) => step.at);
  assert.deepEqual(
    ats,
    ats.slice().sort((left, right) => left - right),
    'the story is in the order the measurement supports: every step is ordered by `at`, ascending',
  );
  assert.deepEqual(
    ats,
    [10, 11, 20, 30, 31],
    'the story interleaves the streams by `at`, not by the order the record lists them',
  );

  const remaining = expected.slice();
  for (const step of answer.steps) {
    const index = remaining.findIndex(
      (candidate) =>
        candidate.stream === step.stream &&
        candidate.at === step.at &&
        isDeepStrictEqual(candidate.fields, step.fields),
    );
    assert.notEqual(
      index,
      -1,
      'every step quotes the event’s own recorded fields, and no field is a paraphrase',
    );
    assertStepQuotes(step, remaining[index]);
    remaining.splice(index, 1);
  }
  assert.deepEqual(
    remaining,
    [],
    'every recorded event is a step and no recorded event is dropped',
  );

  assert.equal(
    JSON.stringify(storyOf(api, input)),
    JSON.stringify(answer),
    'narrating the same record twice returns identical steps in identical order',
  );
}

/**
 * SC2 and held-out E4, in one pin so the two cannot collapse: one or two empty streams leave a
 * story of the populated ones with the empty ones named, and an all-empty record is the absence,
 * never an empty story.
 */
function pinEmptyCases(api) {
  const oneEmpty = storyOf(api, oneEmptyRecord());
  assert.deepEqual(
    keysOf(oneEmpty),
    ANSWER_KEYS,
    'E4 the answer carries the four contract fields',
  );
  assert.equal(
    oneEmpty.state,
    api.STEPS,
    'E4 one empty stream still leaves a story of the populated ones',
  );
  assert.deepEqual(
    oneEmpty.steps.map((step) => step.stream),
    ['pendingWorkEvents', 'routerEvents'],
    'E4 the story renders the two populated streams, in `at` order',
  );
  assert.deepEqual(
    oneEmpty.cannotTell,
    ['boundaryEntries'],
    'E4 the empty stream is named as empty',
  );
  assert.equal(
    oneEmpty.reason,
    api.STREAM_EMPTY,
    'E4 the reason names the empty stream',
  );

  const twoEmpty = storyOf(api, twoEmptyRecord());
  assert.equal(
    twoEmpty.state,
    api.STEPS,
    'E4 two empty streams still leave a story of the populated one',
  );
  assert.deepEqual(
    twoEmpty.steps.map((step) => step.stream),
    ['routerEvents'],
    'E4 the story renders the one populated stream',
  );
  assert.deepEqual(
    twoEmpty.cannotTell,
    ['pendingWorkEvents', 'boundaryEntries'],
    'E4 both empty streams are named',
  );
  assert.equal(
    twoEmpty.reason,
    api.STREAM_EMPTY,
    'E4 the reason names the empty streams',
  );

  const allEmpty = storyOf(api, allEmptyRecord());
  assert.deepEqual(
    keysOf(allEmpty),
    ANSWER_KEYS,
    'SC2 the answer carries the four contract fields',
  );
  assert.equal(
    allEmpty.state,
    api.CANNOT_TELL,
    'an all-empty record is cannot-tell, never an empty story',
  );
  assert.deepEqual(allEmpty.steps, [], 'an all-empty record renders no step');
  assert.deepEqual(
    allEmpty.cannotTell,
    ['routerEvents', 'pendingWorkEvents', 'boundaryEntries'],
    'the absence names every stream the record carries empty',
  );
  assert.equal(
    allEmpty.reason,
    api.ALL_STREAMS_EMPTY,
    'the absence is the named all-streams-empty one',
  );

  assert.notEqual(
    oneEmpty.state,
    allEmpty.state,
    'a story with one empty stream is not the all-empty absence',
  );
}

/**
 * SC3. A populated stream holding an entry with no measured `at` is refused: no order is
 * recorded, and no stream's reading is lent to the entry that carries none.
 */
function pinNoSharedOrder(api) {
  const mixed = storyOf(api, noAtRecord());
  assert.deepEqual(
    keysOf(mixed),
    ANSWER_KEYS,
    'SC3 the refusal carries the four contract fields',
  );
  assert.equal(
    mixed.state,
    api.CANNOT_TELL,
    'a record whose entries carry no `at` is refused, never ordered',
  );
  assert.deepEqual(mixed.steps, [], 'the refusal renders no step');
  assert.deepEqual(
    mixed.cannotTell,
    ['routerEvents'],
    'the refusal names the stream whose entry carries no `at`',
  );
  assert.equal(
    mixed.reason,
    api.NO_SHARED_ORDER,
    'the refusal is the named no-shared-order one',
  );

  const none = storyOf(api, noAtAnywhereRecord());
  assert.equal(
    none.state,
    api.CANNOT_TELL,
    'a record whose every entry carries no `at` is refused',
  );
  assert.deepEqual(none.steps, [], 'the refusal renders no step');
  assert.deepEqual(
    none.cannotTell,
    ['routerEvents', 'pendingWorkEvents', 'boundaryEntries'],
    'the refusal names every stream whose entries carry no `at`',
  );
  assert.equal(
    none.reason,
    api.NO_SHARED_ORDER,
    'the refusal is the named no-shared-order one',
  );
}

/**
 * Rule 1. Two entries with equal `at` are one instant: they are emitted contiguously, keep each
 * stream's own recorded order, and are never reordered by a stream-name, type or position
 * tie-break. The fixture's instant is deliberately not in either sort's order, so an invented
 * tie-break is visible rather than plausible.
 */
function pinEqualAt(api) {
  const input = tieRecord();
  const answer = storyOf(api, input);
  assert.equal(answer.state, api.STEPS, 'the tie fixture is a story');
  assert.deepEqual(
    keysOf(answer),
    ANSWER_KEYS,
    'the answer carries four fields',
  );

  const group = answer.steps.filter((step) => step.at === 5);
  assert.equal(group.length, 4, 'four recorded events share one `at`');
  const indices = answer.steps
    .map((step, index) => (step.at === 5 ? index : -1))
    .filter((index) => index !== -1);
  assert.deepEqual(
    indices,
    [1, 2, 3, 4],
    'equal `at` events are emitted together, as one instant',
  );
  assert.deepEqual(
    group.map((step) => step.stream),
    ['routerEvents', 'routerEvents', 'pendingWorkEvents', 'boundaryEntries'],
    'equal `at` events are one instant and are never ordered by an invented tie-break from stream name or type',
  );
  assert.deepEqual(
    group.map((step) => ('type' in step.fields ? step.fields.type : null)),
    ['NavigationEnd', 'NavigationStart', 2, null],
    'the instant keeps each stream’s own recorded order',
  );

  const byStream = group
    .slice()
    .sort((left, right) => left.stream.localeCompare(right.stream));
  assert.notDeepEqual(
    group.map((step) => step.stream),
    byStream.map((step) => step.stream),
    'the fixture’s instant is not already in stream-name order, so an invented tie-break would be visible',
  );
  const byType = group
    .slice()
    .sort((left, right) =>
      String(left.fields.type).localeCompare(String(right.fields.type)),
    );
  assert.notDeepEqual(
    group.map((step) => step.fields.type),
    byType.map((step) => step.fields.type),
    'the fixture’s instant is not already in type order, so an invented tie-break would be visible',
  );
}

/** A record this narration cannot read is refused, not read as a story with empty streams. */
function pinUnreadable(api) {
  const missing = storyOf(api, unreadableRecord());
  assert.deepEqual(
    keysOf(missing),
    ANSWER_KEYS,
    'the refusal carries the four contract fields',
  );
  assert.equal(
    missing.state,
    api.CANNOT_TELL,
    'a record this narration cannot read is refused, never read as empty',
  );
  assert.deepEqual(missing.steps, [], 'the refusal renders no step');
  assert.deepEqual(
    missing.cannotTell,
    ['boundaryEntries'],
    'the refusal names the stream the record does not carry',
  );
  assert.equal(
    missing.reason,
    api.RECORD_UNREADABLE,
    'the refusal is the named record-unreadable one',
  );

  const nothing = storyOf(api, null);
  assert.equal(nothing.state, api.CANNOT_TELL, 'no record at all is refused');
  assert.deepEqual(
    nothing.cannotTell,
    ['routerEvents', 'pendingWorkEvents', 'boundaryEntries'],
    'no record names every stream it did not carry',
  );
  assert.equal(
    nothing.reason,
    api.RECORD_UNREADABLE,
    'no record is the named record-unreadable refusal',
  );
}

// ------------------------------------------------------------- mutant tools ----

/**
 * A copy of the module with one anchored replacement applied. The anchor must occur exactly once,
 * so a mutation cannot silently rewrite a different branch, and the result must differ from the
 * source, so a no-op mutation is a failure rather than a green mutant.
 */
function mutant(anchor, replacement) {
  assert.ok(
    STORY_SRC.includes(anchor),
    `mutation anchor not found in extension/interaction-story.js — restate the bite: ${JSON.stringify(
      anchor,
    )}`,
  );
  const occurrences = STORY_SRC.split(anchor).length - 1;
  assert.equal(
    occurrences,
    1,
    `mutation anchor must occur exactly once, found ${occurrences}: ${JSON.stringify(
      anchor,
    )}`,
  );
  const mutated = STORY_SRC.replace(anchor, replacement);
  assert.notEqual(
    mutated,
    STORY_SRC,
    'the mutation must change the module source',
  );
  return storySource(mutated).api;
}

/** A pin that a value reddens: returns the failure the pin raises on it. */
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
 * The four phases, per criterion. `pin` is the same function for the untouched module and for
 * every mutant; a mutation that survives it, or that reddens with a message not naming its
 * defect, fails. Returns one `mutant -> failure` line per mutation so the run prints its own
 * evidence.
 */
function proveNonVacuous(pin, mutations) {
  pin(storyApi());

  const caught = [];
  for (const mutation of mutations) {
    const api = mutant(mutation.anchor, mutation.replacement);
    mutation.defect(api);

    const failure = reddens(() => pin(api), mutation.what);
    assert.match(
      failure.message,
      mutation.message,
      `${mutation.what} must redden naming the defect ${mutation.message}: ${failure.message}`,
    );
    caught.push(`${mutation.what} -> ${failure.message.split('\n')[0]}`);
  }

  pin(storyApi());
  return caught;
}

// ------------------------------------------------------------------- tests ----

test('the narration carries the measured vocabulary and states its bound', () => {
  const api = storyApi();
  assert.deepEqual(
    clone(api.STREAM_NAMES),
    record.streams.map((stream) => stream.stream),
    'the narration names the three streams T001 measured',
  );
  assert.equal(
    api.SHARED_FIELD,
    record.answer.sharedField,
    'the shared field is the one T001 measured',
  );
  assert.equal(
    api.SHARED_READER,
    record.clock.reader,
    'the shared field is read by the one clock reader T001 measured',
  );
  assert.deepEqual(
    clone(api.BOUNDS),
    {
      routerEvents: 512,
      pendingWorkEvents: 64,
      boundaryEntries: 128,
    },
    'the bounds are the ones T001 measured',
  );
  for (const stream of record.streams)
    assert.equal(
      api.BOUNDS[stream.stream],
      stream.bound.limit,
      `the ${stream.stream} bound matches the measurement`,
    );
  for (const needle of [
    'what the record kept',
    'not what the page did',
    'incomplete',
    '512',
    '64',
    '128',
  ])
    assert.ok(
      api.BOUNDED_STATEMENT.includes(needle),
      `the bounded statement states ${JSON.stringify(needle)}: ${
        api.BOUNDED_STATEMENT
      }`,
    );
  assert.deepEqual(
    clone(api.REASONS),
    [
      'all-streams-empty',
      'stream-empty',
      'no-shared-order',
      'record-unreadable',
    ],
    'the reason set is closed and exported',
  );
  assert.equal(api.STEPS, 'steps');
  assert.equal(api.CANNOT_TELL, 'cannot-tell');

  const answer = storyOf(api, interleavedRecord());
  assert.deepEqual(
    keysOf(answer),
    ANSWER_KEYS,
    'the answer carries the four contract fields and no completeness claim',
  );
  assert.equal(
    'complete' in answer,
    false,
    'the answer never claims the story is complete',
  );
});

test('SC1 — the story is every recorded event in `at` order, each step quoting its own fields', () => {
  const caught = proveNonVacuous(pinStory, [
    {
      what: 'M1 a step is reordered out of `at` order',
      anchor: '    steps.sort(byAt);',
      replacement: '    steps.sort(byAt).reverse();',
      message: /in the order the measurement supports/,
      defect(api) {
        const answer = storyOf(api, interleavedRecord());
        assert.notDeepEqual(
          answer.steps.map((step) => step.at),
          [10, 11, 20, 30, 31],
          'the mutant answers a story `at` does not support',
        );
      },
    },
    {
      what: 'M2 a step paraphrases its event instead of quoting it',
      anchor: '      fields[key] = entry[key];',
      replacement: '      fields[key] = String(entry[key]);',
      message: /quotes the event’s own recorded fields/,
      defect(api) {
        const answer = storyOf(api, interleavedRecord());
        const step = answer.steps[0];
        const expected = expectedSteps(interleavedRecord()).find(
          (candidate) =>
            candidate.stream === step.stream && candidate.at === step.at,
        );
        assert.notDeepEqual(
          step.fields,
          expected.fields,
          'the mutant paraphrases the fields it was handed',
        );
      },
    },
    {
      what: 'M3 a step is invented for an event the record does not carry',
      anchor: '    return answer(STEPS, steps, empty, reason);',
      replacement:
        '    steps.push({ stream: ROUTER, at: 0, fields: { type: "NavigationStart" } });\n' +
        '    return answer(STEPS, steps, empty, reason);',
      message: /invents a step for an event the record does not carry/,
      defect(api) {
        const answer = storyOf(api, interleavedRecord());
        assert.equal(
          answer.steps.length,
          6,
          'the mutant mints a sixth step for five recorded events',
        );
        assert.equal(
          answer.steps[5].fields.type,
          'NavigationStart',
          'the invented step is not an event the record carries',
        );
      },
    },
  ]);
  console.log(`SC1 non-vacuous:\n  ${caught.join('\n  ')}`);
});

test('SC2/E4 — an empty stream is named beside a story, and all-empty is not an empty story', () => {
  const caught = proveNonVacuous(pinEmptyCases, [
    {
      what: 'M4 an all-empty record is reported as an empty story',
      anchor: '      return answer(CANNOT_TELL, [], empty, ALL_STREAMS_EMPTY);',
      replacement: '      return answer(STEPS, [], [], null);',
      message: /all-empty record is cannot-tell, never an empty story/,
      defect(api) {
        const answer = storyOf(api, allEmptyRecord());
        assert.equal(
          answer.state,
          'steps',
          'the mutant reports the all-empty record as a story',
        );
        assert.deepEqual(answer.steps, [], 'the mutant’s story has no step');
      },
    },
  ]);
  console.log(`SC2/E4 non-vacuous:\n  ${caught.join('\n  ')}`);
});

test('SC3 — a record whose entries carry no `at` is refused, never ordered', () => {
  const caught = proveNonVacuous(pinNoSharedOrder, [
    {
      what: 'M5 a record whose entries carry no `at` is ordered anyway',
      anchor:
        '      return answer(CANNOT_TELL, [], withoutAt, NO_SHARED_ORDER);',
      replacement:
        '      if (false) return answer(CANNOT_TELL, [], withoutAt, NO_SHARED_ORDER);',
      message: /a record whose entries carry no `at` is refused, never ordered/,
      defect(api) {
        const answer = storyOf(api, noAtRecord());
        assert.equal(
          answer.state,
          'steps',
          'the mutant orders a record whose entries carry no `at`',
        );
        assert.equal(
          answer.steps.length,
          3,
          'the mutant emits a step for every entry anyway',
        );
      },
    },
  ]);
  console.log(`SC3 non-vacuous:\n  ${caught.join('\n  ')}`);
});

test('equal `at` is one instant: no tie-break by stream name or type is invented', () => {
  const caught = proveNonVacuous(pinEqualAt, [
    {
      what: 'M6 equal `at` events are ordered by an invented tie-break',
      anchor: '    steps.sort(byAt);',
      replacement:
        '    steps.sort(function (left, right) {\n' +
        '      return (\n' +
        '        left.at - right.at ||\n' +
        '        String(left.stream).localeCompare(String(right.stream))\n' +
        '      );\n' +
        '    });',
      message:
        /equal `at` events are one instant and are never ordered by an invented tie-break/,
      defect(api) {
        const answer = storyOf(api, tieRecord());
        const group = answer.steps.filter((step) => step.at === 5);
        assert.deepEqual(
          group.map((step) => step.stream),
          [
            'boundaryEntries',
            'pendingWorkEvents',
            'routerEvents',
            'routerEvents',
          ],
          'the mutant orders the instant by stream name',
        );
      },
    },
    {
      what: 'M7 equal `at` events are ordered by an invented type tie-break',
      anchor: '    steps.sort(byAt);',
      replacement:
        '    steps.sort(function (left, right) {\n' +
        '      return (\n' +
        '        left.at - right.at ||\n' +
        '        String(left.fields.type).localeCompare(String(right.fields.type))\n' +
        '      );\n' +
        '    });',
      message:
        /equal `at` events are one instant and are never ordered by an invented tie-break/,
      defect(api) {
        const answer = storyOf(api, tieRecord());
        const group = answer.steps.filter((step) => step.at === 5);
        assert.deepEqual(
          group.map((step) =>
            'type' in step.fields ? step.fields.type : null,
          ),
          [2, 'NavigationEnd', 'NavigationStart', null],
          'the mutant orders the instant by type',
        );
      },
    },
  ]);
  console.log(`equal-at non-vacuous:\n  ${caught.join('\n  ')}`);
});

test('a record this narration cannot read is refused rather than read as empty', () => {
  const api = storyApi();
  pinUnreadable(api);
});

test('a step quotes nested recorded values and drops no key the event carries', () => {
  const api = storyApi();
  const input = interleavedRecord();
  const answer = storyOf(api, input);
  const boundary = answer.steps.find(
    (step) => step.stream === 'boundaryEntries',
  );
  const source = input.boundary.entries[0];
  assert.deepEqual(
    boundary.fields.error,
    source.error,
    'the error is the error the record carries, not a summary of it',
  );
  assert.deepEqual(
    boundary.fields.details,
    source.details,
    'the details are the details the record carries',
  );
  assert.deepEqual(
    Object.keys(boundary.fields).sort(),
    Object.keys(source)
      .filter((key) => key !== 'at')
      .sort(),
    'every key the event carries is quoted once and no key is invented',
  );
});

test('narrating the same record twice returns identical steps in identical order', () => {
  const api = storyApi();
  for (const [what, input] of [
    ['an interleaved record', interleavedRecord()],
    ['a record with one empty stream', oneEmptyRecord()],
    ['a record whose instant is shared', tieRecord()],
    ['an all-empty record', allEmptyRecord()],
    ['a record whose entries carry no `at`', noAtRecord()],
  ]) {
    const first = storyOf(api, input);
    const second = storyOf(api, input);
    assert.deepEqual(second, first, `${what} answers identically twice`);
    assert.deepEqual(
      second.steps,
      first.steps,
      `${what} keeps identical steps in identical order`,
    );
  }
});

// ------------------------------------------------------------------- purity ----

const HOST_GLOBALS = [
  'document',
  'window',
  'console',
  'Date',
  'performance',
  'setTimeout',
  'setInterval',
  'fetch',
  'XMLHttpRequest',
];

/** A global that throws when read, called or constructed, naming itself in the error. */
function tripwire(name) {
  const reached = () => {
    throw new Error(`the module reached for ${name}`);
  };
  return new Proxy(function tripwire() {}, {
    get: reached,
    set: reached,
    has: reached,
    apply: reached,
    construct: reached,
  });
}

test('the narration is pure over the record: no DOM, no clock, no console and no network', () => {
  for (const needle of [
    ['im', 'port '].join(''),
    ['req', 'uire('].join(''),
    ['docu', 'ment'].join(''),
    ['win', 'dow.'].join(''),
    ['cons', 'ole.'].join(''),
    ['Date', '.now'].join(''),
    ['fe', 'tch('].join(''),
    ['XMLHttp', 'Request'].join(''),
  ]) {
    assert.equal(
      STORY_SRC.includes(needle),
      false,
      `the module carries ${JSON.stringify(
        needle,
      )}, and it must read the record it is handed and nothing else`,
    );
  }

  const { context } = storySource();
  for (const name of [
    'document',
    'window',
    'performance',
    'setTimeout',
    'setInterval',
    'fetch',
    'XMLHttpRequest',
  ]) {
    assert.equal(
      runInContext(`typeof ${name}`, context),
      'undefined',
      `the module must not run with a ${name} in scope`,
    );
  }

  const traps = createContext({});
  for (const name of HOST_GLOBALS) traps[name] = tripwire(name);
  assert.throws(
    () => runInContext('Date.now()', traps),
    /the module reached for Date/,
    'the Date trap must bite, or the guard is decoration',
  );
  assert.throws(
    () => runInContext('console.log("x")', traps),
    /the module reached for console/,
    'the console trap must bite, or the guard is decoration',
  );

  const sandbox = { __record: interleavedRecord() };
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  const { context: guardedContext } = storySource(STORY_SRC, sandbox);
  const guarded = clone(
    runInContext(
      'angularAiInteractionStory.interactionStory(__record)',
      guardedContext,
    ),
  );
  assert.equal(
    guarded.steps.length,
    5,
    'the narration answers while every host global in scope is a trap',
  );
  assert.equal(
    guarded.steps[0].at,
    10,
    'the guarded answer is the measured order',
  );
});

test('the module republishes in place on a second run in the same world', () => {
  const context = createContext({});
  runInContext(STORY_SRC, context);
  const first = context.angularAiInteractionStory;
  runInContext(STORY_SRC, context);
  const second = context.angularAiInteractionStory;
  assert.equal(
    first,
    second,
    'a second run must republish the same namespace, so a caller’s reference stays valid',
  );
  assert.equal(typeof second.interactionStory, 'function');
});
