// @ts-check
// Run: node --test scripts/component-search.test.mjs
//
// M047 T001 measures what the page agent can name and where it can name nothing.
// `research/raw/m047-names-and-absences.json` names, per source, the text the agent yields and the
// path:line that produces it, and names the absence cases with the same precision, because the
// milestone's premise — that the page agent already captures a component tree — is worth nothing
// if it is asserted rather than read. A record nobody re-reads drifts the way a comment does, so
// this suite holds it to the tree: every quoted line must be the line its number names, and every
// `yieldsName` claim must be the kind of line its citation carries. A record that claims a name
// over a line that yields none is the failure this suite exists for (INTENT.md SC1, SC2; T001 AC2).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RECORD = 'research/raw/m047-names-and-absences.json';
const AGENT = 'extension/agent-main.js';
const ROUTES = 'apps/angular-ai-devtools/src/app/app.routes.ts';

/**
 * @typedef {object} Citation a line in the tree that produces, or names, a text.
 * @property {string} file the repository-relative posix path the line is in.
 * @property {number} line the 1-indexed line.
 * @property {string} lineText that line, as a substring of it, with its indent trimmed.
 */

/**
 * @typedef {object} Entry one source the agent reads a name from, or one case it names nothing in.
 * @property {string} id what the entry is, named once across the record.
 * @property {string} [source] what a source reads.
 * @property {string} [case] what an absence is a case of.
 * @property {string} function the function the producer line sits in.
 * @property {Citation} producer the line that produces, or refuses, the text.
 * @property {Citation[]} also every other line the entry leans on.
 * @property {string|null} yields the text the producer yields, or null when it yields none.
 * @property {string} yieldsKind which of the measured shapes the producer line has.
 * @property {boolean} yieldsName whether that text is a name read from the page.
 * @property {string|null} [state] the state word, for a named-state entry.
 * @property {string} why what the producer line does, in words.
 */

const record = JSON.parse(readFileSync(join(ROOT, RECORD), 'utf8'));

/**
 * The lines of a repository file, split the way a line number counts them. A path the tree does not
 * hold throws here, which is the check that the record cites a real file.
 * @param {string} path
 * @returns {readonly string[]}
 */
function sourceLines(path) {
  return readFileSync(join(ROOT, path), 'utf8').split('\n');
}

/**
 * The cited line, trimmed, read out of the file it names — or an assertion failure when the file
 * holds no such line. Nothing here trusts the record's own quotation: this is the read.
 * @param {Citation} citation
 * @param {string} where
 * @returns {string}
 */
function citedLine(citation, where) {
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
    citation.lineText.trim().length > 0,
    `${where}.lineText is a line that says something`,
  );

  const lines = sourceLines(citation.file);
  assert.ok(
    citation.line <= lines.length,
    `${where} cites ${citation.file}:${citation.line} and the file holds ${
      lines.length
    } lines`,
  );
  return (lines[citation.line - 1] ?? '').replace(/\r$/, '').trim();
}

/**
 * One citation, held to the file and the line it names: the file exists, the line is one that file
 * has, and the record's quotation is a substring of it — so a citation that slid off its line
 * reddens here rather than in review.
 * @param {Citation} citation
 * @param {string} where
 */
function assertCitation(citation, where) {
  const line = citedLine(citation, where);
  assert.ok(
    line.includes(citation.lineText.trim()),
    `${where} quotes ${citation.file}:${citation.line} as "${citation.lineText.trim()}"`,
  );
}

/**
 * The shapes a producer line can have, each with the rule that says what it may yield. A record that
 * puts a name on a line of another shape is refused here, which is the whole of AC2.
 * @type {Map<string, (entry: Entry, line: string, where: string) => void>}
 */
const KINDS = new Map([
  [
    'page-name',
    (entry, line, where) => {
      assert.equal(
        typeof entry.yields,
        'string',
        `${where}.yields is the text a name reader yields`,
      );
      assert.ok(
        String(entry.yields).trim().length > 0,
        `${where}.yields says something`,
      );
      assert.doesNotMatch(
        line,
        /return null;/,
        `${where} cites a line that yields only null and cannot be a name`,
      );
      assert.doesNotMatch(
        line,
        /return \[\];/,
        `${where} cites a line that yields only an empty list and cannot be a name`,
      );
      assert.ok(
        !line.includes('status:'),
        `${where} cites a descriptor's named state and cannot be a page name`,
      );
      assert.doesNotMatch(
        line,
        /return '[^']*';\s*$/,
        `${where} cites a state word and cannot be a page name`,
      );
    },
  ],
  [
    'fallback-word',
    (entry, line, where) => {
      assert.equal(
        typeof entry.yields,
        'string',
        `${where}.yields is the word the fallback substitutes`,
      );
      assert.ok(
        line.includes(`'${entry.yields}'`),
        `${where} cites the line that writes the word ${entry.yields}`,
      );
    },
  ],
  [
    'null',
    (entry, line, where) => {
      assert.equal(entry.yields, null, `${where}.yields is null: no text`);
      assert.match(line, /\bnull\b/, `${where} cites a line that answers null`);
    },
  ],
  [
    'empty-list',
    (entry, line, where) => {
      assert.equal(entry.yields, null, `${where}.yields is null: no text`);
      assert.ok(
        line.includes('[]'),
        `${where} cites a line that answers an empty list`,
      );
    },
  ],
  [
    'named-state',
    (entry, line, where) => {
      assert.equal(entry.yields, null, `${where}.yields is null: no text`);
      assert.equal(
        typeof entry.state,
        'string',
        `${where}.state is the word the line answers with`,
      );
      assert.ok(
        line.includes(`'${entry.state}'`),
        `${where} cites the line that answers ${entry.state}`,
      );
    },
  ],
]);

/**
 * One entry: named once, cited in full, and a `yieldsName` claim that is the shape of its producer
 * line — the only place the two can be tied together without running the page.
 * @param {Entry} entry
 * @param {string} where
 */
function assertEntry(entry, where) {
  assert.equal(typeof entry.id, 'string', `${where} carries an id`);
  assert.ok(entry.id.trim().length > 0, `${where} has a non-empty id`);
  assert.equal(
    typeof entry.function,
    'string',
    `${where}.function names the function its producer sits in`,
  );
  assert.equal(
    typeof entry.why,
    'string',
    `${where}.why says what the line does`,
  );
  assert.ok(entry.why.trim().length > 0, `${where}.why says something`);

  const subject = typeof entry.case === 'string' ? entry.case : entry.source;
  assert.equal(
    typeof subject,
    'string',
    `${where} names what it is a case of or a source of`,
  );
  assert.ok(subject.trim().length > 0, `${where} names something`);

  assert.ok(Array.isArray(entry.also), `${where}.also is a list of citations`);
  for (const [index, citation] of entry.also.entries())
    assertCitation(citation, `${where}.also[${index}]`);

  assert.equal(
    typeof entry.yieldsName,
    'boolean',
    `${where}.yieldsName is a boolean`,
  );
  assert.ok(
    KINDS.has(entry.yieldsKind),
    `${where}.yieldsKind is one of ${[...KINDS.keys()].join(', ')}`,
  );
  assert.equal(
    entry.yieldsName,
    entry.yieldsKind === 'page-name',
    `${where} counts a name exactly when its line is a page-name line`,
  );
  if (entry.yieldsKind !== 'named-state')
    assert.equal(
      entry.state ?? null,
      null,
      `${where}.state belongs to a named-state entry`,
    );

  const line = citedLine(entry.producer, `${where}.producer`);
  assertCitation(entry.producer, `${where}.producer`);
  const rule = KINDS.get(entry.yieldsKind);
  assert.ok(rule !== undefined, `${where}.yieldsKind names a kind`);
  rule(entry, line, where);
}

/**
 * The record's shape and every entry's claim. Kept callable so a doctored record can be put through
 * the same check the record itself passes.
 * @param {any} candidate
 */
function validate(candidate) {
  for (const key of [
    'schema',
    'head',
    'sources',
    'absences',
    'callGraph',
    'tree',
    'panelRoutes',
    'corrections',
    'notCaptured',
  ])
    assert.ok(key in candidate, `the record carries ${key}`);
  assert.equal(
    candidate.schema,
    'm047-names-and-absences/v1',
    'the record declares its schema',
  );
  assert.equal(typeof candidate.head, 'string', 'head is a string');
  assert.match(
    candidate.head,
    /^[0-9a-f]{40}$/,
    'head is one commit sha, not a branch name',
  );

  assert.ok(Array.isArray(candidate.sources), 'sources is a list');
  assert.ok(candidate.sources.length >= 1, 'at least one source is measured');
  assert.ok(Array.isArray(candidate.absences), 'absences is a list');
  assert.ok(
    candidate.absences.length >= 1,
    'at least one absence case is recorded',
  );

  for (const entry of candidate.sources)
    assertEntry(entry, `sources[${entry.id}]`);
  for (const entry of candidate.absences)
    assertEntry(entry, `absences[${entry.id}]`);

  const ids = [...candidate.sources, ...candidate.absences].map(
    (entry) => entry.id,
  );
  assert.equal(new Set(ids).size, ids.length, 'each entry is named once');

  for (const absence of candidate.absences)
    assert.equal(
      absence.yieldsName,
      false,
      `absences[${absence.id}] is an absence and names nothing`,
    );

  assert.ok(Array.isArray(candidate.notCaptured), 'notCaptured is a list');
  assert.ok(
    candidate.notCaptured.length >= 1,
    'the record states what it does not claim',
  );
  for (const claim of candidate.notCaptured)
    assert.ok(
      typeof claim === 'string' && claim.trim().length > 0,
      'every notCaptured entry says something',
    );
}

/**
 * Every citation the record makes, with the place it sits, so one walk holds the whole record to the
 * tree.
 * @param {any} candidate
 * @returns {Generator<[string, Citation]>}
 */
function* allCitations(candidate) {
  yield ['agent.lastContentLine', candidate.agent.lastContentLine];
  yield ['agent.ngSource', candidate.agent.ngSource];
  yield ['agent.handle', candidate.agent.handle];
  for (const list of ['sources', 'absences'])
    for (const entry of candidate[list] ?? []) {
      yield [`${list}[${entry.id}].producer`, entry.producer];
      for (const [index, citation] of (entry.also ?? []).entries())
        yield [`${list}[${entry.id}].also[${index}]`, citation];
    }
  for (const site of candidate.callGraph ?? [])
    for (const citation of site.callSites ?? [])
      yield [`callGraph[${site.function}]`, citation];
  for (const citation of candidate.tree?.citations ?? [])
    yield ['tree.citations', citation];
  for (const citation of candidate.tree?.parentLines ?? [])
    yield ['tree.parentLines', citation];
  for (const correction of candidate.corrections ?? [])
    for (const citation of correction.citations ?? [])
      yield ['corrections.citations', citation];
  yield ['panelRoutes.declaration', candidate.panelRoutes.declaration];
}

/**
 * The lines of the agent that call a function, the definition line excluded: the measurement the
 * call-graph claims below are read from.
 * @param {string} name
 * @returns {number[]}
 */
function callSitesOf(name) {
  const definition = new RegExp(`function\\s+${name}\\s*\\(`);
  const call = new RegExp(`\\b${name}\\(`);
  const sites = [];
  const lines = sourceLines(AGENT);
  for (let index = 0; index < lines.length; index += 1) {
    const line = (lines[index] ?? '').replace(/\r$/, '');
    if (definition.test(line)) continue;
    if (call.test(line)) sites.push(index + 1);
  }
  return sites;
}

/**
 * The record with one entry patched, for the refusals below.
 * @param {string} id
 * @param {object} patch
 */
function doctored(id, patch) {
  return {
    ...record,
    absences: record.absences.map((entry) =>
      entry.id === id ? { ...entry, ...patch } : entry,
    ),
  };
}

test('the record is a head, its sources, its absences and what it does not claim', () => {
  validate(record);
  assert.ok(
    record.sources.length + record.absences.length >= 2,
    'both lists carry entries',
  );
  assert.ok(
    record.sources.some((entry) => entry.yieldsName === true),
    'at least one source yields a name',
  );
  assert.ok(
    record.absences.length >= 1,
    'at least one absence case is recorded, because the agent can name nothing',
  );
});

test('every cited path and line is the one the record read', () => {
  let citations = 0;
  for (const [where, citation] of allCitations(record)) {
    assertCitation(citation, where);
    citations += 1;
  }
  assert.ok(citations >= 30, `the record cites ${citations} lines`);
});

test('every yieldsName claim is the shape of the line it cites', () => {
  for (const entry of [...record.sources, ...record.absences]) {
    assert.equal(
      entry.yieldsName,
      entry.yieldsKind === 'page-name',
      `${entry.id} ties its name claim to its line's shape`,
    );
  }
  assert.equal(
    record.sources.filter((entry) => entry.yieldsName === false).length,
    1,
    'one source yields no name: the fallback word',
  );
  assert.equal(
    record.sources.find((entry) => entry.yieldsName === false)?.yieldsKind,
    'fallback-word',
    'the source that yields no name is the one that substitutes a word',
  );
});

test('the fallback word is on a path a null instance cannot reach', () => {
  for (const site of record.callGraph) {
    assert.equal(
      typeof site.function,
      'string',
      'a call graph entry names a function',
    );
    assert.equal(
      typeof site.note,
      'string',
      'a call graph entry says what it means',
    );
    const recorded = site.callSites.map((citation) => citation.line);
    assert.deepEqual(
      recorded,
      callSitesOf(site.function),
      `callGraph[${site.function}] lists every caller and no other line`,
    );
  }
  const fallback = record.callGraph.find(
    (site) => site.function === 'componentNameFor',
  );
  assert.ok(fallback !== undefined, 'the fallback reader is in the call graph');
  assert.equal(
    fallback.callSites.some((citation) => citation.line === 700),
    false,
    'the frame-level entry does not call the reader that substitutes a word',
  );
});

test('the record does not claim a component tree the measured file does not hold', () => {
  const agentSource = readFileSync(join(ROOT, AGENT), 'utf8');
  const children = (agentSource.match(/\bchildren\b/g) ?? []).length;
  assert.equal(
    children,
    record.tree.childrenOccurrences,
    'no field in the agent names a component’s children',
  );
  assert.equal(
    record.tree.childrenOccurrences,
    0,
    'the record states that count as zero',
  );

  const parents = sourceLines(AGENT)
    .map((line) => line.replace(/\r$/, '').trim())
    .filter((line) => /\bparent\b/.test(line));
  assert.deepEqual(
    parents,
    record.tree.parentLines.map((citation) => citation.lineText),
    'the only lines that mention a parent are the picker’s DOM walk',
  );
});

test('the route table lists no components', () => {
  const routesSource = readFileSync(join(ROOT, ROUTES), 'utf8');
  const count = (/** @type {RegExp} */ pattern) =>
    [...routesSource.matchAll(pattern)].length;
  assert.equal(
    count(/\bcomponents:/g),
    record.panelRoutes.componentsKeyRoutes,
    'no route in the table carries a components key',
  );
  assert.equal(
    count(/\bchildren:/g),
    record.panelRoutes.childrenKeyRoutes,
    'no route in the table carries a children key',
  );
  assert.equal(
    record.panelRoutes.componentsKeyRoutes,
    0,
    'the record states none lists components',
  );
  assert.equal(
    record.panelRoutes.childrenKeyRoutes,
    0,
    'the record states none nests routes',
  );
  assert.equal(
    record.panelRoutes.routes,
    record.panelRoutes.componentKeyRoutes +
      record.panelRoutes.loadComponentKeyRoutes,
    'every route installs its component through one of the two keys',
  );
});

test('a record that names a component where the code names none is refused', () => {
  const claimsAName = {
    yields: 'app-counter',
    yieldsKind: 'page-name',
    yieldsName: true,
    state: null,
  };
  assert.throws(
    () => validate(doctored('no-dev-context', claimsAName)),
    /no-dev-context/,
    'the picked element with no context is a named state and not a name',
  );
  assert.throws(
    () => validate(doctored('profiler-passed-no-instance', claimsAName)),
    /profiler-passed-no-instance/,
    'a line that yields only null is not a name',
  );
  assert.throws(
    () => validate(doctored('enumerate-without-getter', claimsAName)),
    /enumerate-without-getter/,
    'a line that yields only an empty list is not a name',
  );
  assert.throws(
    () => validate(doctored('no-dev-context', { yieldsName: true })),
    /no-dev-context/,
    'a name claim over a named-state line is refused on the flag alone',
  );
});

test('a citation that slid off its line is refused', () => {
  const [first] = record.sources;
  assert.ok(first !== undefined, 'there is a source to move');
  const slid = {
    ...record,
    sources: [
      {
        ...first,
        producer: { ...first.producer, line: first.producer.line + 1 },
      },
      ...record.sources.slice(1),
    ],
  };
  assert.throws(
    () => validate(slid),
    /sources\[per-check-host-tag\]/,
    'a citation one line off is not the line the record read',
  );
});
