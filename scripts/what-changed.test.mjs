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
//
// The second half of the suite is T002's: the comparison itself, `extension/what-changed.js`. It is
// loaded in a bare `node:vm` context and every claim is asserted on what it returns, so nothing stands
// in for behaviour by scanning the source. The fixtures are real recordings from `research/raw/` — two
// records of one page session, in the shape the agent dispatches — and every pair the panel can bind
// is passed the panel's own inspected tab, because no field of the record binds two records to one
// page (T001) and the plan's Correction 2 rules that the binding is the panel's.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

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

// ---------------------------------------------------------------------------
// M051 T002 — the comparison: compare the pair, or refuse it
// ---------------------------------------------------------------------------

const COMPARISON = 'extension/what-changed.js';
const COMPARISON_SRC = readFileSync(join(ROOT, COMPARISON), 'utf8');

/** Two real records of one page session, as M029 captured them (`profiler.records`). */
const WARNING_RECORDS = JSON.parse(
  readFileSync(join(ROOT, 'research/raw/m029-sanitizer-warning.json'), 'utf8'),
).profiler.records;

/** Two real records in the M043 vintage: ten keys, three of which T001 did not measure. */
const SETTLE_RECORDS = JSON.parse(
  readFileSync(join(ROOT, 'research/raw/m043-settle-page.json'), 'utf8'),
).capture.records;

/** The panel's own inspected tab: the only thing that binds a pair, and the caller's to supply. */
const PANEL_TAB = { tabId: 7 };

/**
 * Loads the comparison in a bare `node:vm` context, so the world holds nothing but the module's own
 * `globalThis`: no `require`, no `process`, no `fetch` and no DOM. A read of anything but the two
 * records would throw there rather than pass.
 * @param {string} [source]
 * @param {object} [extra] globals to put in the world — used to poison the clock.
 */
function loadComparison(source = COMPARISON_SRC, extra = {}) {
  const context = createContext(extra);
  runInContext(source, context);
  const api = context.angularAiWhatChanged;
  assert.ok(api, 'the comparison publishes globalThis.angularAiWhatChanged');
  assert.equal(
    typeof api.whatChanged,
    'function',
    'the module answers whatChanged',
  );
  return { api, context };
}

/** A value built in the vm realm carries that realm's prototypes, so it is copied into this one. */
function host(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The comparison of a pair the panel has bound to its own inspected tab. */
function bound(api, before, after) {
  return host(api.whatChanged(before, after, PANEL_TAB));
}

/**
 * One edit of the shipped source, loaded as the module it edits. The anchor must appear exactly once,
 * so the mutant changes one behaviour, and the file on disk is never written.
 * @param {string} anchor
 * @param {string} replacement
 */
function mutantOf(anchor, replacement) {
  const occurrences = COMPARISON_SRC.split(anchor).length - 1;
  assert.equal(
    occurrences,
    1,
    `the mutation anchor must appear once in ${COMPARISON}: ${anchor}`,
  );
  const source = COMPARISON_SRC.replace(anchor, replacement);
  assert.notEqual(
    source,
    COMPARISON_SRC,
    'the mutation must change the source',
  );
  return loadComparison(source).api;
}

/** Runs a pin against a mutated module and returns the failure it must produce. */
function reddens(pin) {
  try {
    pin();
  } catch (error) {
    assert.ok(
      error instanceof Error,
      'the mutant must be caught by a failing assertion',
    );
    return error;
  }
  assert.fail('the mutant must redden the pin, but the pin passed');
}

/**
 * A differing field is reported exactly once, with the before and after values the records carry. The
 * field is asserted before the state, so a mutant that drops the finding reddens naming the field.
 */
function assertDifferingFieldReported(result, before, after) {
  const findings = result.changes.filter((change) => change.field === 'checks');
  assert.equal(
    findings.length,
    1,
    'checks differs between the two records and must be reported exactly once',
  );
  assert.deepEqual(
    findings[0].before,
    before.checks,
    "checks is quoted from the before record's own value",
  );
  assert.deepEqual(
    findings[0].after,
    after.checks,
    "checks is quoted from the after record's own value",
  );
  assert.equal(
    result.state,
    'changes',
    'a pair whose checks differ is not unchanged',
  );
}

/** An equal field is not a finding, and the findings are exactly the fields that differ. */
function assertEqualFieldNotReported(result) {
  const fields = result.changes.map((change) => change.field);
  assert.ok(
    !fields.includes('zoneMode'),
    'zoneMode agrees in both records and must not be reported as a change',
  );
  assert.deepEqual(
    fields,
    ['cycleId', 'startedAt', 'trigger', 'checks'],
    'the findings are the fields that differ, in the order T001 measured',
  );
}

/** Every finding quotes the two records' own field values, and nothing else (N1). */
function assertFindingsQuoteTheRecords(result, before, after) {
  for (const change of result.changes) {
    assert.deepEqual(
      change.before,
      before[change.field],
      `${change.field} is reported with the before record's own value`,
    );
    assert.deepEqual(
      change.after,
      after[change.field],
      `${change.field} is reported with the after record's own value`,
    );
  }
}

/** A refused pair: the state, no findings, nothing compared, and both facts in the reason (SC2). */
function assertRefused(result) {
  assert.equal(
    result.state,
    'cannot-tell',
    'a pair with no panel binding must be refused: cannot-tell',
  );
  assert.deepEqual(result.changes, [], 'a refused pair reports no findings');
  assert.deepEqual(result.compared, [], 'a refused pair compares nothing');
  assert.equal(
    typeof result.reason,
    'string',
    'a refusal states its reason verbatim',
  );
  assert.match(
    result.reason,
    /no page identity/,
    'the reason names that the record carries no page identity',
  );
  assert.match(
    result.reason,
    /panel's inspected tab/,
    "the reason names that the binding is the panel's inspected tab",
  );
}

test('T002 — the comparison answers four keys over exactly the fields T001 measured', () => {
  const { api } = loadComparison();
  assert.deepEqual(
    host(api.FIELDS),
    record.record.keyOrder,
    'the compared fields are the nine keys T001 measured, in the order it recorded',
  );

  const result = bound(api, WARNING_RECORDS[1], WARNING_RECORDS[1]);
  assert.deepEqual(
    Object.keys(result).sort(),
    ['changes', 'compared', 'reason', 'state'],
    'the answer carries the state, the findings, the fields compared and the reason',
  );
  assert.equal(result.reason, null, 'a compared pair states no refusal');
  assert.equal(api.CHANGES, 'changes', 'the state a comparison names');
  assert.equal(api.UNCHANGED, 'unchanged', 'the state an agreeing pair names');
  assert.equal(api.CANNOT_TELL, 'cannot-tell', 'the state a refusal names');
});

test('T002 — a real pair: differing fields are quoted from the records, the equal field is not reported', () => {
  const { api } = loadComparison();
  const before = WARNING_RECORDS[0];
  const after = WARNING_RECORDS[1];
  const result = bound(api, before, after);

  assert.deepEqual(
    result.compared,
    ['cycleId', 'startedAt', 'trigger', 'zoneMode', 'checks'],
    'exactly the measured fields both records carry are compared, in the measured order',
  );
  assertDifferingFieldReported(result, before, after);
  assertEqualFieldNotReported(result);
  assertFindingsQuoteTheRecords(result, before, after);
  assert.equal(
    result.changes.length,
    4,
    'four fields differ — cycleId, startedAt, trigger and checks — and no fifth',
  );

  // The keys both records carry that T001 did not measure are not compared: this reads the named
  // fields the record states, not whatever two objects happen to share.
  for (const unmeasured of ['order', 't'])
    assert.ok(
      !result.compared.includes(unmeasured),
      `${unmeasured} is carried by both records and is not a field T001 measured`,
    );
});

test('T002 — a key both records carry that T001 did not measure is not compared', () => {
  const { api } = loadComparison();
  const [before, after] = SETTLE_RECORDS;
  const result = bound(api, before, after);

  assert.deepEqual(
    result.compared,
    [
      'cycleId',
      'startedAt',
      'trigger',
      'zoneMode',
      'events',
      'stability',
      'checks',
    ],
    'the measured fields both records carry are compared, and no other',
  );
  for (const unmeasured of ['dispatchedAt', 'path', 'routerEventTypes'])
    assert.ok(
      !result.compared.includes(unmeasured),
      `${unmeasured} is carried by both records and was not measured by T001`,
    );
  assert.deepEqual(
    result.changes.map((change) => change.field),
    ['cycleId', 'startedAt', 'events', 'stability', 'checks'],
    'the fields that differ, in the measured order',
  );
  assertFindingsQuoteTheRecords(result, before, after);
  assert.ok(
    !result.changes.some((change) => change.field === 'zoneMode'),
    'zoneMode agrees in the two records and is reported nowhere',
  );
});

test('E4 — a pair identical except in one field renders one finding, and the identical pair renders unchanged', () => {
  const { api } = loadComparison();
  // Both values are real recorded values: the later record, and the same record carrying the earlier
  // record's `checks` list and nothing else.
  const before = host(WARNING_RECORDS[1]);
  const after = {
    ...host(WARNING_RECORDS[1]),
    checks: host(WARNING_RECORDS[0].checks),
  };

  const oneField = bound(api, before, after);
  assert.equal(
    oneField.changes.length,
    1,
    `exactly one field differs, so exactly one finding renders: ${JSON.stringify(oneField.changes.map((change) => change.field))}`,
  );
  assert.equal(
    oneField.changes[0].field,
    'checks',
    'the one finding names checks',
  );
  assert.deepEqual(
    oneField.changes[0].before,
    before.checks,
    "the finding quotes the before record's own checks",
  );
  assert.deepEqual(
    oneField.changes[0].after,
    after.checks,
    "the finding quotes the after record's own checks",
  );
  assert.equal(oneField.state, 'changes', 'one differing field is a change');

  // The other half of the same suite: the identical pair is `unchanged` with the count compared, so
  // "one change" cannot collapse into "no comparison".
  const identical = bound(api, before, before);
  assert.equal(identical.state, 'unchanged', 'an identical pair is unchanged');
  assert.deepEqual(
    identical.changes,
    [],
    'an identical pair renders no finding',
  );
  assert.equal(
    identical.compared.length,
    5,
    'the unchanged state carries how many fields it compared',
  );
  assert.deepEqual(
    identical.compared,
    oneField.compared,
    'the same fields are compared in both states',
  );
});

/**
 * A recording with one measured field taken out, so a pair can differ by presence rather than by
 * value — the boundary E1 names.
 * @param {any} recordValue
 * @param {string} field
 * @returns {any}
 */
function without(recordValue, field) {
  const copy = host(recordValue);
  delete copy[field];
  return copy;
}

test('E1 — a field present in one record and absent from the other is added or removed, never a change of value', () => {
  const { api } = loadComparison();

  // The names the module gives the three kinds of finding, pinned here so a surface renders the words
  // the suite reads.
  assert.equal(api.CHANGED, 'changed', 'a value that moved between two values');
  assert.equal(api.ADDED, 'added', 'a value only the later record carries');
  assert.equal(
    api.REMOVED,
    'removed',
    'a value only the earlier record carries',
  );

  // Removed: the same recording, once carrying `checks` and once with it taken out. Nothing else
  // differs, so the only thing the pair states is that checks is on one side and not the other.
  const present = host(WARNING_RECORDS[1]);
  const missing = without(present, 'checks');
  const removed = bound(api, present, missing);

  assert.deepEqual(
    removed.compared,
    ['cycleId', 'startedAt', 'trigger', 'zoneMode', 'checks'],
    'the one-sided field is read, and sits where T001 measured it',
  );
  assert.equal(
    removed.state,
    'changes',
    'a field the pair does not share is a difference, not an unchanged pair',
  );
  assert.equal(
    removed.changes.length,
    1,
    `presence is the only difference, so exactly one finding renders: ${JSON.stringify(removed.changes)}`,
  );
  const gone = removed.changes.filter((change) => change.field === 'checks');
  assert.equal(
    gone.length,
    1,
    'checks is carried by the before record only, so it must be reported, naming checks',
  );
  assert.deepEqual(
    gone[0],
    { field: 'checks', kind: 'removed', before: present.checks },
    'a removed field names checks, carries the value that exists, and has no after key at all: the counterpart is not invented, and not null',
  );

  // Added: the mirror image — the later record carries `events`, which the earlier one does not.
  const carries = { ...present, events: host(SETTLE_RECORDS[0].events) };
  const added = bound(api, present, carries);

  assert.deepEqual(
    added.compared,
    ['cycleId', 'startedAt', 'trigger', 'zoneMode', 'events', 'checks'],
    'a field only the after record carries is read too, in the measured order',
  );
  assert.equal(
    added.state,
    'changes',
    'a field only the later record carries is a difference, not an unchanged pair',
  );
  assert.equal(
    added.changes.length,
    1,
    `presence is the only difference here too: ${JSON.stringify(added.changes.map((change) => change.field))}`,
  );
  const appeared = added.changes.filter((change) => change.field === 'events');
  assert.equal(
    appeared.length,
    1,
    'events is carried by the after record only, so it must be reported, naming events',
  );
  assert.deepEqual(
    appeared[0],
    { field: 'events', kind: 'added', after: carries.events },
    'an added field names events, carries the value that exists, and has no before key at all: the counterpart is not invented, and not null',
  );

  // The distinction E1 draws: the same field on both sides with two values is a change, and says so.
  const moved = bound(api, WARNING_RECORDS[0], WARNING_RECORDS[1]);
  const changed = moved.changes.filter((change) => change.field === 'checks');
  assert.equal(
    changed.length,
    1,
    'checks differs between two values in the real pair, so it is reported once',
  );
  assert.deepEqual(
    changed[0],
    {
      field: 'checks',
      kind: 'changed',
      before: WARNING_RECORDS[0].checks,
      after: WARNING_RECORDS[1].checks,
    },
    'a change quotes both values the records carry, and its kind says it is not a presence',
  );

  // E1 does not widen the refusal: a pair that shares no field but where one record carries a
  // measured field states a difference and is compared, while the pair carrying none is still
  // refused (asserted above, and unchanged here).
  const oneSidedOnly = host(api.whatChanged({ cycleId: 1 }, {}, PANEL_TAB));
  assert.equal(
    oneSidedOnly.state,
    'changes',
    'a pair sharing no field, where one record carries a measured field, is compared',
  );
  assert.deepEqual(
    oneSidedOnly.changes,
    [{ field: 'cycleId', kind: 'removed', before: 1 }],
    'the field the pair does not share is removed, with the value that exists',
  );
});

test("SC2 — a pair the panel cannot bind is refused, naming the record's absent page identity and the panel's binding", () => {
  const { api } = loadComparison();
  const before = WARNING_RECORDS[0];
  const after = WARNING_RECORDS[1];

  for (const binding of [undefined, null, {}, { tabId: 'seven' }, 1.5]) {
    const result = host(api.whatChanged(before, after, binding));
    assertRefused(result);
    assert.match(
      result.reason,
      /caller supplied no binding/,
      'the refusal states that no binding was supplied',
    );
  }

  // The reason is the module's own constant, so a surface renders the words the suite pins.
  assert.equal(
    host(api.whatChanged(before, after, undefined)).reason,
    api.NO_BINDING_REASON,
    'the refusal is the constant the module publishes',
  );

  // T001 measured the absence the sentence names: no field of the record binds two of its records to
  // one page, so the binding cannot come from the record.
  assert.equal(
    record.identity.bindingField,
    null,
    'the recording states that no record field binds two records to one page',
  );
  assert.equal(
    record.identity.claimants,
    0,
    'and that no field it measured identifies a page',
  );

  // A supplied tab binds the same pair, and then the pair is compared.
  assert.equal(
    bound(api, before, after).state,
    'changes',
    "the same pair is compared once the panel's tab is supplied",
  );
  assert.equal(
    host(api.whatChanged(before, after, 7)).state,
    'changes',
    'a bare tab id binds as well as an object',
  );
  assert.equal(
    host(api.whatChanged(before, after, { tabId: 0 })).state,
    'changes',
    'tab id 0 is a binding, not an absent one',
  );
});

test('one snapshot alone, and two records sharing no measured field, are refused rather than reported as no change', () => {
  const { api } = loadComparison();
  const only = WARNING_RECORDS[1];

  const noAfter = host(api.whatChanged(only, undefined, PANEL_TAB));
  assert.equal(noAfter.state, 'cannot-tell', 'one snapshot is not a pair');
  assert.match(
    noAfter.reason,
    /the after snapshot is absent/,
    'the refusal names the snapshot that is missing',
  );
  assert.deepEqual(
    noAfter.changes,
    [],
    'one snapshot renders its own state rather than an empty finding list',
  );

  const noBefore = host(api.whatChanged(undefined, only, PANEL_TAB));
  assert.match(
    noBefore.reason,
    /the before snapshot is absent/,
    'the refusal names the missing before snapshot',
  );

  const neither = host(api.whatChanged(undefined, undefined, PANEL_TAB));
  assert.match(
    neither.reason,
    /neither snapshot was supplied/,
    'a pair of absences is named as such',
  );

  const noCommon = host(
    api.whatChanged({ order: 0, t: 1 }, { order: 1, t: 2 }, PANEL_TAB),
  );
  assert.equal(
    noCommon.state,
    'cannot-tell',
    'two records that share no measured field are refused',
  );
  assert.match(
    noCommon.reason,
    /none of the fields T001 measured/,
    'the refusal names the absence of a compared field',
  );
  assert.deepEqual(noCommon.compared, [], 'nothing was compared');
});

test('SC3 — the comparison reads no file, no clock and no third record', () => {
  const before = host(WARNING_RECORDS[0]);
  const after = host(WARNING_RECORDS[1]);
  const plain = loadComparison();
  const expected = bound(plain.api, before, after);

  // The world holds a poisoned clock and no reader of any kind: a clock reading, a `require`, a
  // `fetch` or a DOM read would throw here rather than pass.
  const touched = [];
  const trap = (name) => () => {
    touched.push(name);
    throw new Error(`the comparison read ${name}`);
  };
  function PoisonedDate() {
    trap('Date')();
  }
  PoisonedDate.now = trap('Date.now');
  PoisonedDate.parse = trap('Date.parse');
  const poisoned = loadComparison(COMPARISON_SRC, {
    Date: PoisonedDate,
    performance: { now: trap('performance.now') },
    fetch: trap('fetch'),
    require: trap('require'),
  });
  const clockless = host(poisoned.api.whatChanged(before, after, PANEL_TAB));
  assert.deepEqual(touched, [], 'no clock and no reader was touched');
  assert.deepEqual(
    clockless,
    expected,
    'the same pair answers the same thing with the clock out of reach',
  );

  // The poison is not vacuous: the source names no reader and the bare world holds none.
  for (const token of [
    'readFileSync',
    'require(',
    'import ',
    'import(',
    'fetch(',
    'XMLHttpRequest',
    'document',
    'window',
    'performance',
    'localStorage',
    'Math.random',
    'Date',
  ])
    assert.ok(
      !COMPARISON_SRC.includes(token),
      `the comparison's source names no ${token}`,
    );
  for (const name of [
    'process',
    'document',
    'window',
    'localStorage',
    'chrome',
  ])
    assert.equal(
      plain.context[name],
      undefined,
      `the module runs with no ${name} in reach`,
    );

  // Two calls, the same inputs, the same answer: nothing is read between them.
  assert.deepEqual(
    bound(plain.api, before, after),
    expected,
    'the same inputs answer the same thing twice',
  );
  assert.deepEqual(
    before,
    host(WARNING_RECORDS[0]),
    'the before record is unmodified by the comparison',
  );
  assert.deepEqual(
    after,
    host(WARNING_RECORDS[1]),
    'the after record is unmodified by the comparison',
  );

  // The answer is not a live view: writing to a record after the call cannot rewrite a finding.
  const result = bound(plain.api, before, after);
  const quoted = JSON.stringify(result.changes);
  after.checks[0].componentName = 'written-after-the-call';
  before.trigger.kind = 'written-after-the-call';
  assert.equal(
    JSON.stringify(result.changes),
    quoted,
    'the findings quote the values the records carried, not references to them',
  );
  assert.ok(
    !JSON.stringify(result.changes).includes('written-after-the-call'),
    'no finding can be made to say something the records did not say at the call',
  );
});

// The four mutations the task names. Each pin is run against the untouched module first, then against
// one edit of the shipped source, and then against the module reloaded from disk — the file is never
// written, so the reload proves the mutation was the only cause of the red.

/** The differing-field pin, over the real pair. */
function pinDifferingField(api) {
  const before = WARNING_RECORDS[0];
  const after = WARNING_RECORDS[1];
  const result = bound(api, before, after);
  assertDifferingFieldReported(result, before, after);
  assertFindingsQuoteTheRecords(result, before, after);
  return result;
}

/** The equal-field pin, over the same real pair. */
function pinEqualField(api) {
  const result = bound(api, WARNING_RECORDS[0], WARNING_RECORDS[1]);
  assertEqualFieldNotReported(result);
  return result;
}

/** The unbound-pair pin: the same pair with no binding must be refused. */
function pinUnboundRefusal(api) {
  const result = host(api.whatChanged(WARNING_RECORDS[0], WARNING_RECORDS[1]));
  assertRefused(result);
  return result;
}

/** The quoting pin: every finding carries the records' own before and after values. */
function pinQuotesTheRecords(api) {
  const before = WARNING_RECORDS[0];
  const after = WARNING_RECORDS[1];
  const result = bound(api, before, after);
  assertFindingsQuoteTheRecords(result, before, after);
  return result;
}

test('mutant M1 — a differing field reported as equal reddens the pin, naming `checks`', () => {
  pinDifferingField(loadComparison().api);

  const api = mutantOf(
    'if (!sameValue(beforeValue, afterValue)) {',
    'if (false) {',
  );
  const mutated = bound(api, WARNING_RECORDS[0], WARNING_RECORDS[1]);
  assert.deepEqual(
    mutated.changes,
    [],
    'the mutation must actually report the differing pair as equal',
  );

  const failure = reddens(() => pinDifferingField(api));
  assert.match(
    failure.message,
    /checks/,
    'the failure names the field the mutation broke',
  );
  console.log(`T002 M1 reddens: ${failure.message.split('\n')[0]}`);

  // The file on disk was never written, so reloading it restores the pin.
  pinDifferingField(loadComparison().api);
});

test('mutant M2 — an equal field reported as a change reddens the pin, naming `zoneMode`', () => {
  pinEqualField(loadComparison().api);

  const api = mutantOf(
    'if (!sameValue(beforeValue, afterValue)) {',
    'if (true) {',
  );
  const mutated = bound(api, WARNING_RECORDS[0], WARNING_RECORDS[1]);
  assert.ok(
    mutated.changes.length > 4,
    'the mutation must report more findings than there are differing fields',
  );

  const failure = reddens(() => pinEqualField(api));
  assert.match(
    failure.message,
    /zoneMode/,
    'the failure names the equal field the mutation invented a change for',
  );
  console.log(`T002 M2 reddens: ${failure.message.split('\n')[0]}`);

  pinEqualField(loadComparison().api);
});

test('mutant M3 — an unbound pair compared as one page reddens the refusal', () => {
  pinUnboundRefusal(loadComparison().api);

  const api = mutantOf(
    'if (!bindingSupplied(binding)) return cannotTell(NO_BINDING_REASON);',
    'if (false) return cannotTell(NO_BINDING_REASON);',
  );
  const mutated = host(api.whatChanged(WARNING_RECORDS[0], WARNING_RECORDS[1]));
  assert.equal(
    mutated.state,
    'changes',
    'the mutation must compare the unbound pair as one page',
  );

  const failure = reddens(() => assertRefused(mutated));
  assert.match(
    failure.message,
    /no panel binding/,
    'the failure names the binding the mutation took for granted',
  );
  console.log(`T002 M3 reddens: ${failure.message.split('\n')[0]}`);

  pinUnboundRefusal(loadComparison().api);
});

test('mutant M4 — an invented after value reddens the pin, naming the field it was invented for', () => {
  pinQuotesTheRecords(loadComparison().api);

  // The finding reports the before record's value as the after one: a difference diffed against
  // itself, which is the invented change N1 forbids.
  const api = mutantOf(
    'after: copyOf(afterValue),',
    'after: copyOf(beforeValue),',
  );
  const mutated = bound(api, WARNING_RECORDS[0], WARNING_RECORDS[1]);
  assert.ok(
    mutated.changes.some(
      (change) =>
        JSON.stringify(change.after) !==
        JSON.stringify(WARNING_RECORDS[1][change.field]),
    ),
    'the mutation must report an after value the after record does not carry',
  );

  const failure = reddens(() => pinQuotesTheRecords(api));
  assert.match(
    failure.message,
    /(cycleId|checks) is reported with the after record's own value/,
    'the failure names the field whose after value was invented',
  );
  console.log(`T002 M4 reddens: ${failure.message.split('\n')[0]}`);

  pinQuotesTheRecords(loadComparison().api);
});

/**
 * The one-sided branch as the module spells it, so the dropped-field mutant edits exactly that block
 * and nothing else. `mutantOf` asserts the anchor occurs once, so a reflow reddens here rather than
 * mutating the wrong line.
 */
const ONE_SIDED_BRANCH = `      if (inBefore !== inAfter) {
        changes.push(
          inAfter
            ? { field: field, kind: ADDED, after: copyOf(after[field]) }
            : { field: field, kind: REMOVED, before: copyOf(before[field]) },
        );
        continue;
      }`;

/** The E1 pin: a field only one record carries is added or removed, carrying the value that exists. */
function pinOneSidedField(api) {
  const present = host(WARNING_RECORDS[1]);

  const missing = without(present, 'checks');
  const gone = bound(api, present, missing).changes.filter(
    (change) => change.field === 'checks',
  );
  assert.equal(
    gone.length,
    1,
    'checks is carried by the before record only, so it must be reported as removed, naming checks',
  );
  assert.deepEqual(
    gone[0],
    { field: 'checks', kind: 'removed', before: present.checks },
    'a removed field names checks, carries the one value that exists, and invents no after value',
  );

  const carries = { ...present, events: host(SETTLE_RECORDS[0].events) };
  const appeared = bound(api, present, carries).changes.filter(
    (change) => change.field === 'events',
  );
  assert.equal(
    appeared.length,
    1,
    'events is carried by the after record only, so it must be reported as added, naming events',
  );
  assert.deepEqual(
    appeared[0],
    { field: 'events', kind: 'added', after: carries.events },
    'an added field names events, carries the one value that exists, and invents no before value',
  );
}

test('mutant M5 — a one-sided field dropped, or reported as a change of value, reddens the pin naming `checks`', () => {
  pinOneSidedField(loadComparison().api);

  const present = host(WARNING_RECORDS[1]);
  const missing = without(present, 'checks');

  // M5a: the one-sided branch is skipped, so a field only one record carries falls through to the
  // value comparison and is reported as a change of value against a side the other record lacks.
  const asChange = mutantOf('if (inBefore !== inAfter) {', 'if (false) {');
  const misreported = bound(asChange, present, missing);
  assert.equal(
    misreported.changes.length,
    1,
    'the mutation must still report the field, so the pin cannot be saved by the field vanishing',
  );
  assert.equal(
    misreported.changes[0].kind,
    'changed',
    'the mutation must report the one-sided field as a change of value',
  );

  const asChangeFailure = reddens(() => pinOneSidedField(asChange));
  assert.match(
    asChangeFailure.message,
    /checks/,
    'the failure names the field the mutation reported as a change of value',
  );
  console.log(`T002 M5a reddens: ${asChangeFailure.message.split('\n')[0]}`);

  // M5b: the finding is not pushed at all, so a pair that differs by the presence of a field is
  // reported as unchanged — the dropped-field half of the same boundary.
  const asDropped = mutantOf(
    ONE_SIDED_BRANCH,
    `      if (inBefore !== inAfter) {
        0;
        continue;
      }`,
  );
  const dropped = bound(asDropped, present, missing);
  assert.equal(
    dropped.state,
    'unchanged',
    'the mutation must lose the difference, so the pair reads as unchanged',
  );

  const asDroppedFailure = reddens(() => pinOneSidedField(asDropped));
  assert.match(
    asDroppedFailure.message,
    /checks/,
    'the failure names the field the mutation dropped',
  );
  console.log(`T002 M5b reddens: ${asDroppedFailure.message.split('\n')[0]}`);

  // The file on disk was never written, so reloading it restores the pin.
  pinOneSidedField(loadComparison().api);
});
