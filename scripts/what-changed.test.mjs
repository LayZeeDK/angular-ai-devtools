// @ts-check
// Run: node --test scripts/what-changed.test.mjs
//
// M051 T001 is a measurement: does the published record carry any structure that stands for a
// snapshot of a page, which fields does each carry, does any field bind two records to one page,
// and does the record publish anything at two moments at all?
// `research/raw/m051-snapshots.json` answers it with the line that assigns every field, the block
// every shape is built from, and the absence every field it does not carry is stated as. This suite
// holds the record to the tree, because a measurement nobody re-reads drifts the way a comment
// does: every quoted line must be the line its number names, every recorded field list must be the
// list the cited block actually assigns, and the record's claims about identity and about two
// moments must be what the tree's own counts say. A record that claims a page snapshot while no
// candidate is one, or a binding field while no field identifies a page, is the failure this suite
// exists for (SC1, SC2; E1, E2; N2).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RECORD = 'research/raw/m051-snapshots.json';
const AGENT = 'extension/agent-main.js';
const BACKGROUND = 'extension/background.js';

/** The record's own nine keys, in the order both dispatch sites assign them. */
const RECORD_KEY_ORDER = [
  'cycleId',
  'startedAt',
  'trigger',
  'zoneMode',
  'events',
  'routerEvents',
  'boundary',
  'stability',
  'checks',
];

/** Key names a page identity would plausibly be carried under. The record must carry none. */
const IDENTITY_KEY_NAMES = [
  'url',
  'href',
  'location',
  'documentUrl',
  'title',
  'pageId',
  'tabId',
  'frameId',
  'sessionId',
  'id',
];

/** Page-address readers. The recorder must read none of them. */
const PAGE_READERS = ['location', 'document.URL', 'href', 'document.title'];

const record = JSON.parse(readFileSync(join(ROOT, RECORD), 'utf8'));

/**
 * @typedef {object} Citation a line in the tree that the record quotes.
 * @property {string} file the repository-relative posix path the line is in.
 * @property {number} line the 1-indexed line.
 * @property {string} lineText that line, trimmed, and nothing else.
 */

const sourceCache = new Map();

/**
 * The lines of a repository file, split the way a line number counts them and with a trailing
 * carriage return removed. A path the tree does not hold throws here, which is the check that the
 * record cites a real file.
 * @param {string} path
 * @returns {readonly string[]}
 */
function sourceLines(path) {
  const cached = sourceCache.get(path);
  if (cached !== undefined) return cached;
  const lines = readFileSync(join(ROOT, path), 'utf8')
    .split('\n')
    .map((line) => line.replace(/\r$/, ''));
  sourceCache.set(path, lines);
  return lines;
}

/**
 * A whole file as one string, for the counts the record quotes.
 * @param {string} path
 * @returns {string}
 */
function sourceText(path) {
  return sourceLines(path).join('\n');
}

/**
 * How many times a literal token occurs in a file.
 * @param {string} path
 * @param {string} token
 * @returns {number}
 */
function countOf(path, token) {
  return sourceText(path).split(token).length - 1;
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
    `${where} cites ${citation.file}:${citation.line} and the file holds ${lines.length} lines`,
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
 * opener's own indentation. No such line throws, which is the check that the record's block still
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
 * The lines a function body spans: its `function` line and the next line at the same indentation
 * that is a bare `}`. A function the tree does not hold throws here.
 * @param {readonly string[]} lines
 * @param {number} startLine the 1-indexed line of the function keyword.
 * @returns {{ first: number, last: number }}
 */
function functionRange(lines, startLine) {
  const first = startLine;
  const indent = indentOf(lines[first - 1] ?? '');
  assert.match(
    (lines[first - 1] ?? '').trim(),
    /^function /,
    `the cited line ${first} opens a function`,
  );
  for (let index = first; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    if (indentOf(line) === indent && line.trim() === '}')
      return { first, last: index + 1 };
  }
  throw new Error(`no line closes the function opened at ${first}`);
}

/**
 * The keys a cited block assigns, read from the tree: the opener and closer must name the same
 * file, the closer must be the line that closes the block, and the answer is the block's own keys.
 * @param {Citation} opener
 * @param {Citation} closer
 * @param {string} where
 * @returns {string[]}
 */
function parsedKeysOf(opener, closer, where) {
  assert.equal(
    opener.file,
    closer.file,
    `${where} opens and closes in one file`,
  );
  const lines = sourceLines(opener.file);
  const block = blockOf(lines, opener.line - 1, closer.lineText, where);
  assert.equal(
    block.closerIndex + 1,
    closer.line,
    `${where} cites the line that closes the block`,
  );
  return assignedNames(lines, opener.line - 1, block.closerIndex, block.indent);
}

/**
 * The key order extension/agent-main.test.mjs already pins, read out of the citation list the
 * record keeps for it. The pinned lines are string literals; an identifier-shaped literal is a key
 * and a sentence is not.
 * @param {any} pinned
 * @returns {string[]}
 */
function pinnedKeys(pinned) {
  const lines = pinned.conditions.map((/** @type {Citation} */ citation) => {
    assertCitation(citation, 'record.pinnedKeyOrder.conditions');
    return citation.line;
  });
  const first = Math.min(...lines);
  const last = Math.max(...lines);
  const source = sourceLines(pinned.conditions[0].file);
  const keys = [];
  for (let index = first; index <= last; index += 1) {
    const match = /^'([A-Za-z_$][\w$]*)',$/.exec(
      (source[index - 1] ?? '').trim(),
    );
    if (match) keys.push(match[1] ?? '');
  }
  return keys;
}

/**
 * The tree's own answer to "is any field a page identity": the number of identity fields the
 * record marks as identifying a page. It must be zero, and the record's `identity.bindingField`
 * must be null in step with it.
 * @param {any} candidate
 * @returns {number}
 */
function identityClaimants(candidate) {
  let claimants = 0;
  for (const shape of candidate.candidates)
    for (const field of shape.identity.fields)
      if (field.identifiesAPage === true) claimants += 1;
  return claimants;
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
    'title',
    'question',
    'head',
    'headCommand',
    'measuredAt',
    'lineTextConvention',
    'measurements',
    'record',
    'candidates',
    'identity',
    'twoMoments',
    'verdict',
    'absentFields',
    'consequences',
    'notClaimed',
  ])
    assert.ok(key in candidate, `the record carries ${key}`);
  assert.equal(
    candidate.schema,
    'm051-snapshots/v1',
    'the record declares its schema',
  );
  assert.equal(candidate.task, 'T001', 'the record names its task');
  assert.match(candidate.head, /^[0-9a-f]{40}$/, 'head is one commit sha');
  assert.equal(
    candidate.headCommand,
    'git rev-parse HEAD',
    'the record states the command that measured its head',
  );
  assert.match(
    candidate.measuredAt,
    /no page was read/i,
    'the record says no page was read',
  );
  assert.match(
    candidate.measuredAt,
    /no browser was opened/i,
    'the record says no browser was opened',
  );
  assert.match(
    candidate.lineTextConvention,
    /trimmed/,
    'the record states the trimming convention its citations obey',
  );

  assert.ok(
    Array.isArray(candidate.measurements) && candidate.measurements.length >= 4,
    'the record carries its measurements',
  );
  const measurementIds = new Set();
  for (const measurement of candidate.measurements) {
    assert.equal(typeof measurement.id, 'string', 'a measurement is named');
    assert.ok(
      !measurementIds.has(measurement.id),
      `measurement ${measurement.id} is named once`,
    );
    measurementIds.add(measurement.id);
    assert.ok(
      typeof measurement.claims === 'string' && measurement.claims.length > 0,
      `measurements[${measurement.id}] states what it claims`,
    );
    assert.ok(
      typeof measurement.command === 'string' && measurement.command.length > 0,
      `measurements[${measurement.id}] carries the command that produced it`,
    );
    assert.ok(
      Array.isArray(measurement.output) && measurement.output.length >= 1,
      `measurements[${measurement.id}] quotes an output`,
    );
  }

  // The record's own field list, its key order, the two dispatch blocks and the pinned order.
  const site = candidate.record;
  assertCitation(site.publisher.dispatch, 'record.publisher.dispatch');
  assertCitation(site.publisher.envelope, 'record.publisher.envelope');
  assert.ok(
    site.publisher.envelope.lineText.includes('tabId: sender.tab?.id'),
    'record.publisher.envelope shows the tab id added beside the payload',
  );
  assert.ok(
    site.publisher.envelope.lineText.includes('...msg'),
    'record.publisher.envelope spreads the message rather than rewriting it',
  );
  assert.deepEqual(
    site.keyOrder,
    RECORD_KEY_ORDER,
    'the record records the nine keys it measured, in order',
  );
  assert.deepEqual(
    site.fields.map((/** @type {any} */ field) => field.name),
    site.keyOrder,
    'the record records every key it measured and no other',
  );
  for (const field of site.fields) {
    assertCitation(field.site, `record.fields[${field.name}].site`);
    assert.ok(
      field.site.lineText.startsWith(`${field.name}:`),
      `record.fields[${field.name}] is assigned by the line it cites`,
    );
    assertCitation(field.also, `record.fields[${field.name}].also`);
    assert.ok(
      field.also.lineText.startsWith(`${field.name}:`),
      `record.fields[${field.name}] is assigned at both dispatch sites`,
    );
  }
  assert.ok(
    Array.isArray(site.dispatchSites) && site.dispatchSites.length === 2,
    'the record cites exactly the two sites that dispatch it',
  );
  assert.deepEqual(
    site.dispatchSites.map((/** @type {any} */ entry) => entry.id),
    ['frame', 'install'],
    'the two dispatch sites are the frame and the install record',
  );
  for (const entry of site.dispatchSites) {
    const where = `record.dispatchSites[${entry.id}]`;
    for (const key of ['functionSite', 'opener', 'closer', 'dispatch'])
      assertCitation(entry[key], `${where}.${key}`);
    assert.deepEqual(
      parsedKeysOf(entry.opener, entry.closer, where),
      site.keyOrder,
      `${where} assigns the key order the record records`,
    );
    const body = functionRange(
      sourceLines(entry.functionSite.file),
      entry.functionSite.line,
    );
    for (const key of ['opener', 'closer', 'dispatch'])
      assert.ok(
        entry[key].line >= body.first && entry[key].line <= body.last,
        `${where}.${key} sits inside the function that dispatches it`,
      );
  }
  assert.deepEqual(
    pinnedKeys(site.pinnedKeyOrder),
    site.keyOrder,
    'the record records the key order extension/agent-main.test.mjs pins',
  );
  assert.equal(
    typeof site.moment,
    'object',
    'the record carries what a record is a moment of',
  );
  for (const key of ['frame', 'arrivals', 'emptyList', 'arrivalsAgain'])
    assertCitation(site.moment[key], `record.moment.${key}`);
  assert.ok(
    site.moment.statement.length >= 100,
    'record.moment says what a record is a moment of',
  );

  // Every candidate: the shape its block assigns, and the refusal to be a page snapshot.
  assert.ok(
    Array.isArray(candidate.candidates) && candidate.candidates.length >= 8,
    'the record carries every candidate structure it measured',
  );
  const candidateIds = new Set();
  for (const shape of candidate.candidates) {
    const where = `candidates[${shape.id}]`;
    assert.equal(typeof shape.id, 'string', `${where}.id is a name`);
    assert.ok(!candidateIds.has(shape.id), `${where} is named once`);
    candidateIds.add(shape.id);
    assert.ok(
      typeof shape.name === 'string' && shape.name.length > 0,
      `${where} names the structure`,
    );
    assert.ok(
      Array.isArray(shape.publishedBy) && shape.publishedBy.length >= 1,
      `${where}.publishedBy cites where it is published`,
    );
    for (const [index, citation] of shape.publishedBy.entries())
      assertCitation(citation, `${where}.publishedBy[${index}]`);
    assert.ok(
      Array.isArray(shape.blocks) && shape.blocks.length >= 1,
      `${where}.blocks cites the shape's own block`,
    );
    const fieldNames = new Set();
    for (const [index, block] of shape.blocks.entries()) {
      const at = `${where}.blocks[${index}]`;
      assert.ok(
        typeof block.what === 'string' && block.what.length > 0,
        `${at}.what says which block it is`,
      );
      assertCitation(block.opener, `${at}.opener`);
      assertCitation(block.closer, `${at}.closer`);
      assert.ok(
        Array.isArray(block.fields) && block.fields.length >= 1,
        `${at}.fields is a list`,
      );
      const recorded = block.fields.map(
        (/** @type {any} */ field) => field.name,
      );
      assert.deepEqual(
        recorded,
        parsedKeysOf(block.opener, block.closer, at),
        `${at} records every field its cited block assigns, in order and no other`,
      );
      for (const field of block.fields) {
        assertCitation(field.site, `${at}.fields[${field.name}].site`);
        assert.ok(
          field.site.lineText.startsWith(`${field.name}:`),
          `${at}.fields[${field.name}] is assigned by the line it cites`,
        );
        assert.ok(
          field.site.line > block.opener.line &&
            field.site.line < block.closer.line,
          `${at}.fields[${field.name}] sits inside the block it cites`,
        );
        fieldNames.add(field.name);
      }
    }
    for (const [index, cited] of (shape.quoted ?? []).entries()) {
      assertCitation(cited.site, `${where}.quoted[${index}].site`);
      assert.ok(
        typeof cited.what === 'string' && cited.what.length > 0,
        `${where}.quoted[${index}].what says what the line states`,
      );
    }
    assert.equal(shape.pageSnapshot, false, `${where} is not a page snapshot`);
    assert.ok(
      typeof shape.whyNotAPageSnapshot === 'string' &&
        shape.whyNotAPageSnapshot.length >= 60,
      `${where} says why it is not a page snapshot`,
    );
    assert.ok(
      Array.isArray(shape.identity.fields) && shape.identity.fields.length >= 1,
      `${where}.identity.fields is a list`,
    );
    assert.ok(
      typeof shape.identity.statement === 'string' &&
        shape.identity.statement.length >= 60,
      `${where}.identity.statement says what its fields identify`,
    );
    for (const field of shape.identity.fields) {
      const at = `${where}.identity.fields[${field.name}]`;
      assert.ok(
        fieldNames.has(field.name),
        `${at} names a field the candidate's own block assigns`,
      );
      assert.ok(
        typeof field.path === 'string' &&
          field.path.split('.').pop() === field.name,
        `${at}.path says where in the shape the field sits`,
      );
      assertCitation(field.site, `${at}.site`);
      assert.ok(
        field.site.lineText.startsWith(`${field.name}:`),
        `${at}.site assigns the field it names`,
      );
      assert.ok(
        field.stableAcrossTwoRecords === true ||
          field.stableAcrossTwoRecords === false ||
          field.stableAcrossTwoRecords === 'not-established',
        `${at}.stableAcrossTwoRecords is measured, true, false or not-established`,
      );
      assert.equal(
        typeof field.identifiesAPage,
        'boolean',
        `${at}.identifiesAPage is a boolean`,
      );
      assert.ok(
        typeof field.statement === 'string' && field.statement.length >= 40,
        `${at}.statement says what the value is`,
      );
    }
  }
  assert.equal(
    identityClaimants(candidate),
    0,
    'no field identifies a page, so no candidate claims one identifies a page',
  );

  // The identity answer, held to the per-field evidence.
  const identity = candidate.identity;
  assert.equal(
    identity.bindingField,
    null,
    'the record states no binding field: no field binds two records to one page',
  );
  assert.ok(
    typeof identity.definition === 'string' &&
      identity.definition.length >= 100,
    'the record defines what would count as a binding field',
  );
  assert.ok(
    typeof identity.statement === 'string' && identity.statement.length >= 200,
    'the record states why no field binds two records',
  );
  assert.equal(
    identity.claimants,
    identityClaimants(candidate),
    'identity.claimants is the count the per-field evidence yields',
  );
  assertCitation(identity.nearest.site, 'identity.nearest.site');
  assertCitation(identity.nearest.cleared, 'identity.nearest.cleared');
  assert.ok(
    typeof identity.nearest.statement === 'string' &&
      identity.nearest.statement.length >= 60,
    'the nearest candidate is named beside why it still does not bind',
  );
  assert.ok(
    Array.isArray(identity.whatARefusalCanName) &&
      identity.whatARefusalCanName.length >= 3,
    'the record states what a refusal can name',
  );
  for (const [index, entry] of identity.whatARefusalCanName.entries()) {
    const at = `identity.whatARefusalCanName[${index}]`;
    assert.ok(
      typeof entry.claim === 'string' && entry.claim.length >= 40,
      `${at}.claim says something nameable`,
    );
    assert.ok(
      Array.isArray(entry.citations) && entry.citations.length >= 1,
      `${at}.citations cites what it read`,
    );
    for (const [slot, citation] of entry.citations.entries())
      assertCitation(citation, `${at}.citations[${slot}]`);
  }

  // Two moments, held to the two dispatch sites and the counts the tree yields.
  const moments = candidate.twoMoments;
  assert.equal(
    moments.publishesPageSnapshotsAtTwoMoments,
    false,
    'the record states no page snapshot at two moments',
  );
  assert.equal(
    moments.answer,
    'no',
    'the record answers the two-moments question with no',
  );
  assert.equal(
    moments.publishesRecordsAtManyMoments,
    true,
    'the record states that it does publish records at many moments',
  );
  assert.ok(
    typeof moments.statement === 'string' && moments.statement.length >= 200,
    'the record states why no page snapshot is published',
  );
  assert.ok(
    Array.isArray(moments.evidence) && moments.evidence.length >= 10,
    'the two-moments answer cites the lines that decide it',
  );
  for (const [index, citation] of moments.evidence.entries())
    assertCitation(citation, `twoMoments.evidence[${index}]`);
  assert.ok(
    Array.isArray(moments.counts) && moments.counts.length >= 5,
    'the record quotes the counts that decide it',
  );
  for (const counted of moments.counts) {
    assert.equal(
      countOf(AGENT, counted.token),
      counted.count,
      `twoMoments counts ${JSON.stringify(counted.token)} as ${counted.count}`,
    );
  }
  assert.ok(
    typeof moments.decides === 'string' && moments.decides.length >= 100,
    'the record states what the two-moments answer decides',
  );

  // The absences: what the record states about fields it does not carry.
  const absent = candidate.absentFields;
  assert.ok(
    typeof absent.statement === 'string' && absent.statement.length >= 60,
    'the record states what its absence section is for',
  );
  for (const group of ['stated', 'notCarriedAtAll']) {
    assert.ok(
      Array.isArray(absent[group]) && absent[group].length >= 3,
      `absentFields.${group} is a list`,
    );
    for (const entry of absent[group]) {
      const at = `absentFields.${group}[${entry.id}]`;
      assert.ok(
        typeof entry.claim === 'string' && entry.claim.length >= 40,
        `${at}.claim says what is absent`,
      );
      assert.ok(
        Array.isArray(entry.citations) && entry.citations.length >= 1,
        `${at}.citations cites the line that states it`,
      );
      for (const [index, citation] of entry.citations.entries())
        assertCitation(citation, `${at}.citations[${index}]`);
      assert.ok(
        typeof entry.mustContain === 'string' && entry.mustContain.length > 0,
        `${at}.mustContain names the phrase the line holds`,
      );
      assert.ok(
        entry.citations.some((/** @type {Citation} */ citation) =>
          citation.lineText.includes(entry.mustContain),
        ),
        `${at} quotes the absence its line states`,
      );
    }
  }

  // The verdict and what the record does not claim.
  assert.ok(
    typeof candidate.verdict === 'string' && candidate.verdict.length >= 200,
    'the record ends with a verdict that says what was measured',
  );
  assert.match(
    candidate.verdict,
    /no page snapshot/i,
    'the verdict states the measured answer: no page snapshot',
  );
  assert.ok(
    Array.isArray(candidate.consequences) && candidate.consequences.length >= 3,
    'the record states what its measurement decides',
  );
  for (const consequence of candidate.consequences)
    assert.ok(
      typeof consequence === 'string' && consequence.trim().length > 0,
      'every consequence says something',
    );
  assert.ok(
    Array.isArray(candidate.notClaimed) && candidate.notClaimed.length >= 4,
    'the record states what it does not claim',
  );
  const disclaimed = candidate.notClaimed.join('\n');
  for (const needle of [
    /no comparison/i,
    /no recorder was invented/i,
    /no page was read/i,
  ])
    assert.match(disclaimed, needle, 'the record disclaims what it did not do');
}

/** A deep copy of the record, so a mutant cannot touch the record the tests read. */
function copyOfRecord() {
  return JSON.parse(JSON.stringify(record));
}

test('the record is a measurement of candidates, an identity answer, a two-moments answer and its absences', () => {
  validate(record);
  assert.equal(record.identity.bindingField, null);
  assert.equal(record.twoMoments.answer, 'no');
  assert.equal(
    record.candidates.filter((shape) => shape.pageSnapshot).length,
    0,
    'no candidate the record carries is a page snapshot',
  );
});

test('every cited path and line is the one the record read', () => {
  let citations = 0;
  for (const [where, citation] of allCitations(record, '')) {
    assertCitation(citation, where);
    citations += 1;
  }
  assert.ok(citations >= 200, `the record cites ${citations} lines`);
});

test('the field list is the list both dispatch blocks assign, and the order the tree pins', () => {
  const site = record.record;
  for (const entry of site.dispatchSites)
    assert.deepEqual(
      parsedKeysOf(entry.opener, entry.closer, entry.id),
      record.record.fields.map((field) => field.name),
      `${entry.id} assigns the fields the record records`,
    );
  assert.deepEqual(
    pinnedKeys(site.pinnedKeyOrder),
    site.keyOrder,
    'extension/agent-main.test.mjs pins the same nine keys in the same order',
  );
  assert.deepEqual(
    new Set(site.keyOrder).size,
    site.keyOrder.length,
    'each key is recorded once',
  );
});

test('every candidate is the shape its cited block assigns, and none is a page snapshot', () => {
  const summary = [];
  for (const shape of record.candidates) {
    for (const [index, block] of shape.blocks.entries()) {
      assert.deepEqual(
        block.fields.map((field) => field.name),
        parsedKeysOf(
          block.opener,
          block.closer,
          `candidates[${shape.id}].blocks[${index}]`,
        ),
        `${shape.id} block ${index} records the fields its block assigns`,
      );
    }
    assert.equal(
      shape.pageSnapshot,
      false,
      `${shape.id} is not a page snapshot`,
    );
    summary.push(`${shape.id}:${shape.pageSnapshot}`);
  }
  console.log(`candidates (pageSnapshot): ${summary.join(' ')}`);
});

test('no field the record carries is a page identity, and the tree holds no reader for one', () => {
  const claimants = identityClaimants(record);
  assert.equal(claimants, 0, 'no identity field claims to identify a page');
  assert.equal(record.identity.bindingField, null, 'no binding field is named');

  const carried = record.record.keyOrder.filter((key) =>
    IDENTITY_KEY_NAMES.includes(key),
  );
  assert.deepEqual(
    carried,
    [],
    `the record carries no page-identity key; it carries ${JSON.stringify(carried)}`,
  );

  for (const token of PAGE_READERS)
    assert.equal(
      countOf(AGENT, token),
      0,
      `${AGENT} reads no ${token}, so no page address is even reachable`,
    );
  assert.equal(countOf(AGENT, 'tabId'), 0, 'the recorder carries no tab id');
  assert.equal(countOf(AGENT, 'pageId'), 0, 'the recorder carries no page id');
  assert.ok(
    countOf(BACKGROUND, 'tabId') >= 1,
    'the tab id exists only in the envelope the background builds',
  );

  assert.equal(
    countOf(AGENT, '++cycleId'),
    2,
    'cycleId is incremented at both dispatch sites, so it differs in every record',
  );
  assert.equal(
    countOf(AGENT, 'stabilityAttachAt = nowMs();'),
    1,
    'the nearest candidate is one clock reading taken at subscribe',
  );
  assert.equal(
    countOf(AGENT, 'stabilityAttachAt = null;'),
    3,
    'the nearest candidate is the declaration plus two resets that clear it',
  );
  const nearest = record.candidates
    .find((shape) => shape.id === 'stability')
    .identity.fields.find((field) => field.name === 'attachAt');
  assert.equal(nearest.stableAcrossTwoRecords, true);
  assert.equal(
    nearest.identifiesAPage,
    false,
    'the nearest candidate is stable across records and still not a page identity',
  );
  assert.equal(
    record.identity.nearest.path,
    nearest.path,
    'the nearest candidate is the field the stability candidate measures',
  );

  const tested = record.candidates.reduce(
    (count, shape) => count + shape.identity.fields.length,
    0,
  );
  assert.ok(tested >= 40, `the record tests ${tested} fields for identity`);

  const cycleId = record.candidates
    .find((shape) => shape.id === 'record')
    .identity.fields.find((field) => field.name === 'cycleId');
  assert.equal(
    cycleId.stableAcrossTwoRecords,
    false,
    'the frame counter is not stable: the tree increments it at both dispatch sites',
  );
});

test('the record publishes no page snapshot at two moments: two dispatch sites, one frame and one install', () => {
  assert.equal(countOf(AGENT, 'dispatch(RECORD_EVENT'), 2);
  assert.equal(countOf(AGENT, 'queueMicrotask(closeCycle)'), 1);
  assert.equal(countOf(AGENT, 'setTimeout(dispatchInitialRecord, 500)'), 1);
  assert.equal(countOf(AGENT, 'openCycle('), 2);
  assert.equal(countOf(AGENT, 'getOrCreateCheck('), 2);
  assert.equal(countOf(AGENT, 'routerSnapshotOf('), 2);

  const lines = sourceLines(AGENT);
  const snapshotSites = lines
    .map((line, index) => ({ line: index + 1, text: line }))
    .filter((entry) => entry.text.includes('routerSnapshotOf('));
  assert.equal(snapshotSites.length, 2, 'the snapshot reader has one call');
  const definition = snapshotSites.find((entry) =>
    entry.text.trim().startsWith('function '),
  );
  assert.ok(definition !== undefined, 'the snapshot reader is defined');
  const call = snapshotSites.find((entry) => entry !== definition);
  assert.ok(call !== undefined, 'the snapshot reader is called once');
  assert.ok(
    call.line > definition.line,
    'the one snapshot call is inside the reader chain that reduces it',
  );

  assert.equal(
    record.twoMoments.publishesPageSnapshotsAtTwoMoments,
    false,
    'the record answers that no page snapshot is published at two moments',
  );
  assert.equal(
    record.twoMoments.publishesRecordsAtManyMoments,
    true,
    'the record still publishes records at many moments',
  );
  for (const shape of record.candidates)
    assert.equal(
      shape.pageSnapshot,
      false,
      `${shape.id} is not a page snapshot`,
    );
});

test('the record states what it does not carry, and each absence quotes the line that states it', () => {
  for (const entry of record.absentFields.stated) {
    assert.ok(
      entry.citations.some((citation) =>
        citation.lineText.includes(entry.mustContain),
      ),
      `${entry.id} quotes the absence its line states`,
    );
  }
  for (const entry of record.absentFields.notCarriedAtAll) {
    assert.ok(
      entry.citations.some((citation) =>
        citation.lineText.includes(entry.mustContain),
      ),
      `${entry.id} quotes the absence its line states`,
    );
  }
  const statedIds = record.absentFields.stated.map((entry) => entry.id);
  assert.ok(
    statedIds.includes('event-field-not-carried-is-null'),
    'the record states what a field the event did not carry is recorded as',
  );
  assert.ok(
    statedIds.includes('no-counterpart-field'),
    'the record states that a field with no counterpart is absent rather than null',
  );
});

test('a doctored record reddens the check it violates', () => {
  const slid = copyOfRecord();
  slid.candidates[0].blocks[0].fields[0].site.line += 1;
  assert.throws(
    () => validate(slid),
    /quotes/,
    'a citation that slid off its line is refused',
  );

  const requoted = copyOfRecord();
  requoted.candidates[0].blocks[0].fields[0].site.lineText = 'cycleId: 0,';
  assert.throws(
    () => validate(requoted),
    /quotes/,
    'a line quoted as text it does not hold is refused',
  );

  const dropped = copyOfRecord();
  dropped.record.fields = dropped.record.fields.filter(
    (field) => field.name !== 'zoneMode',
  );
  assert.throws(
    () => validate(dropped),
    /records the nine keys|records every key|key order/,
    'a key the record drops is refused',
  );

  const snapshot = copyOfRecord();
  snapshot.candidates[1].pageSnapshot = true;
  assert.throws(
    () => validate(snapshot),
    /is not a page snapshot/,
    'a candidate claimed as a page snapshot is refused',
  );

  const bound = copyOfRecord();
  bound.identity.bindingField = 'stability.attachAt';
  assert.throws(
    () => validate(bound),
    /no field binds two records to one page/,
    'a binding field named while none is measured is refused',
  );

  const claimant = copyOfRecord();
  claimant.candidates[0].identity.fields[0].identifiesAPage = true;
  assert.throws(
    () => validate(claimant),
    /identifies a page/,
    'a field claimed as a page identity is refused',
  );

  const unquoted = copyOfRecord();
  unquoted.absentFields.stated[0].mustContain =
    'a phrase the tree does not hold';
  assert.throws(
    () => validate(unquoted),
    /quotes the absence/,
    'an absence whose line does not state it is refused',
  );

  const twoMoments = copyOfRecord();
  twoMoments.twoMoments.publishesPageSnapshotsAtTwoMoments = true;
  assert.throws(
    () => validate(twoMoments),
    /no page snapshot at two moments/,
    'a claim that page snapshots exist at two moments is refused',
  );

  const miscounted = copyOfRecord();
  miscounted.twoMoments.counts[0].count = 3;
  assert.throws(
    () => validate(miscounted),
    /counts/,
    'a count the tree does not yield is refused',
  );
});
