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
  let interactions = 0;
  let listeners = 0;
  for (const file of files) {
    const source = sourceLines(`${EXTENSION}/${file}`).join('\n');
    interactions += [...source.matchAll(/interaction/g)].length;
    listeners += [
      ...source.matchAll(/addEventListener\(\s*.(?:click|pointer|mouse|key)/g),
    ].length;
  }
  assert.equal(
    interactions,
    0,
    `the ${files.length} extension/*.js files record no interaction`,
  );
  assert.equal(
    listeners,
    0,
    'no extension file registers a click, pointer, mouse or key listener',
  );
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
