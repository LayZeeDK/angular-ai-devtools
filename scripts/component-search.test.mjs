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
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

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

// ---------------------------------------------------------------------------
// T002 — componentSearch(record, query): the pure join from the record to rows
// ---------------------------------------------------------------------------
//
// T001 measured what the agent can name; T002 filters that list and states every absence. Each pin
// below is proven the way every join in this tree is proven: the pin runs against the untouched
// module first, then against a copy mutated at one anchor, and the mutant's failure must name the
// defect the pin is about. A mutant that survives its pin would make the pin decoration, so a
// surviving mutant fails the test rather than passing quietly.

const SEARCH = 'extension/component-search.js';
const SEARCH_SRC = readFileSync(
  new URL('../extension/component-search.js', import.meta.url),
  'utf8',
);

/** Each mutant's defect, as the phrase its pin's failure names — the same phrase the record states. */
const DEFECTS = Object.freeze({
  'case-sensitivity': 'matches a case-insensitive substring',
  'framework-completion': 'never completes a name from framework knowledge',
  'invented-row': 'emits no row the record does not carry',
  'invented-count': 'a count the record does not state is null',
  'invented-cause': 'never repeats a cause the record invented',
  'empty-for-unreadable': 'an unreadable source is cannot-tell with its reason',
  'order-defect': 'identical rows in identical order',
  'dom-read': 'the list is read from the record',
});

/**
 * The filter booted the way the panel boots it: the shipped file evaluated in a bare realm, the
 * namespace read off that realm's global. Nothing below re-implements the filter.
 * @param {string} [source]
 */
function loadSearch(source = SEARCH_SRC) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiComponentSearch;
  assert.ok(api, `${SEARCH} publishes angularAiComponentSearch in its realm`);
  return api;
}

/** The module with one anchor replaced — a copy, never the file on disk. */
function mutatedSource(anchor, replacement) {
  const source = SEARCH_SRC.replace(anchor, replacement);
  assert.notEqual(
    source,
    SEARCH_SRC,
    `the mutation must find its anchor: ${anchor}`,
  );
  return source;
}

/** One mutant, booted. */
function mutated(anchor, replacement) {
  return loadSearch(mutatedSource(anchor, replacement));
}

/**
 * A value the filter answered with, copied into this realm. The filter runs in its own realm, whose
 * `Object.prototype` and `Array.prototype` are not this file's, so a strict deep comparison of two
 * realms' objects fails on the prototype alone — the copy is what makes the comparison about the
 * answer rather than about which realm built it.
 * @param {any} value
 */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The failure a pin raises, or a failure naming the pin that let the mutant through. */
function failureOf(pin) {
  try {
    pin();
  } catch (error) {
    assert.ok(error instanceof Error, 'the pin must fail with an Error');
    return error;
  }
  assert.fail('the mutant must redden its pin, but the pin passed');
}

/**
 * The three-phase proof: the pin on the untouched module, then each mutant reddening it and naming
 * its defect by string. Returns one line per mutant, for the run's own log.
 * @param {(api: any) => void} pin
 * @param {{what: string, anchor: string, replacement: string, names: string}[]} mutations
 */
function proveNonVacuous(pin, mutations) {
  pin(loadSearch());
  const failures = [];
  for (const mutation of mutations) {
    const failure = failureOf(() =>
      pin(mutated(mutation.anchor, mutation.replacement)),
    );
    assert.ok(
      failure.message.includes(mutation.names),
      `the mutant must redden naming the defect: ${mutation.what} failed with ${failure.message.split('\n')[0]}`,
    );
    failures.push(`${mutation.what} -> ${failure.message.split('\n')[0]}`);
  }
  return failures;
}

/**
 * The two names this record carries are the two texts T001 measured for the demo fixture — the
 * counter's host tag and the `App` class name (`sources[per-check-host-tag]`,
 * `sources[per-check-class-name]`). The counts are fixture data. The record is deep-frozen: a
 * filter that writes to the list it was handed throws instead of quietly editing it.
 */
const NAMED = Object.freeze({
  components: Object.freeze([
    Object.freeze({ name: 'app-counter', instanceCount: 3 }),
    Object.freeze({ name: 'app', instanceCount: 1 }),
  ]),
  source: Object.freeze({ state: 'read' }),
});

/** The same list with one count stated and one not: a count the record does not carry. */
const PARTLY_COUNTED = Object.freeze({
  components: Object.freeze([
    Object.freeze({ name: 'app-counter' }),
    Object.freeze({ name: 'app', instanceCount: 1 }),
  ]),
  source: Object.freeze({ state: 'read' }),
});

/** One list, no components: the record's statement, which two sources read two ways (E4). */
const NO_COMPONENTS = Object.freeze([]);

/** Pin: the query is a case-insensitive substring of the recorded name, and of nothing else. */
function pinMatchIsASubstring(api) {
  const upper = api.componentSearch(NAMED, 'APP');
  assert.deepEqual(
    plain(upper.rows.map((row) => row.name)),
    ['app-counter', 'app'],
    'the filter matches a case-insensitive substring: APP keeps app-counter, and app',
  );
  assert.equal(upper.matched, 2, 'matched counts the rows the query kept');
  const narrowed = api.componentSearch(NAMED, 'counter');
  assert.deepEqual(
    plain(narrowed),
    {
      state: 'listed',
      rows: [{ name: 'app-counter', instanceCount: 3 }],
      matched: 1,
    },
    'a substring of one recorded name keeps that row and no other',
  );
}

/** Pin: a readable list that keeps nothing is still listed, and no name is completed. */
function pinNothingMatchedIsListed(api) {
  const absent = api.componentSearch(NAMED, 'zzz');
  assert.deepEqual(
    plain(absent),
    { state: 'listed', rows: [], matched: 0 },
    'a query that matches no recorded name keeps no row and still reports the list as listed',
  );
  assert.equal(
    'reason' in absent,
    false,
    'a listed answer states no reason, even when nothing matched',
  );
  const frameworkName = api.componentSearch(NAMED, 'root');
  assert.deepEqual(
    plain(frameworkName),
    { state: 'listed', rows: [], matched: 0 },
    'the filter never completes a name from framework knowledge: a query for the framework’s app-root keeps nothing, because this record does not carry it',
  );
}

/** Pin: the rows are the record's rows — its names, its order, and only the counts it states. */
function pinRowsAreTheRecords(api) {
  const listed = api.componentSearch(NAMED, 'app');
  assert.deepEqual(
    plain(listed.rows),
    [
      { name: 'app-counter', instanceCount: 3 },
      { name: 'app', instanceCount: 1 },
    ],
    'the filter emits no row the record does not carry, and copies the count the record states',
  );
  assert.equal(
    listed.matched,
    listed.rows.length,
    'matched is the number of rows after filtering',
  );
  const uncounted = api.componentSearch(PARTLY_COUNTED, '');
  assert.deepEqual(
    plain(uncounted.rows),
    [
      { name: 'app-counter', instanceCount: null },
      { name: 'app', instanceCount: 1 },
    ],
    'a count the record does not state is null, never a count the record lacks',
  );
}

/** Pin: an unreadable source is cannot-tell with a cause from the closed set, never a list. */
function pinCannotTellIsStated(api) {
  const absent = api.componentSearch(
    {
      components: NO_COMPONENTS,
      source: { state: 'unreadable', reason: 'agent-not-installed' },
    },
    '',
  );
  assert.equal(
    absent.state,
    'cannot-tell',
    'an unreadable source is cannot-tell rather than a list',
  );
  assert.deepEqual(
    plain(absent.rows),
    [],
    'a cannot-tell answer offers no rows in place of an answer',
  );
  assert.equal(
    absent.matched,
    0,
    'a cannot-tell answer matched nothing, because nothing was read',
  );
  assert.equal(
    absent.reason,
    'agent-not-installed',
    'the reason is the cause the record states',
  );

  const invented = api.componentSearch(
    {
      components: NO_COMPONENTS,
      source: { state: 'unreadable', reason: 'framework-not-detected' },
    },
    '',
  );
  assert.ok(
    api.reasons.indexOf(invented.reason) !== -1,
    'the filter never repeats a cause the record invented: the reason is a member of the closed set',
  );
  assert.notEqual(
    invented.reason,
    'framework-not-detected',
    'a cause nobody measured is not repeated as one',
  );

  const bare = api.componentSearch({ components: NO_COMPONENTS }, '');
  assert.equal(
    bare.reason,
    'unreadable-source',
    'a record that states no source at all is unreadable-source',
  );
  const nothing = api.componentSearch(null, '');
  assert.equal(
    nothing.state,
    'cannot-tell',
    'a record that is not a record is cannot-tell',
  );
  assert.equal(
    nothing.reason,
    'unreadable-record',
    'the reason names the record itself as what could not be read',
  );
}

/**
 * Held-out E4: one record shape, two sources. `components: []` beside a readable source is the page
 * rendering nothing; the same empty list beside an unreadable source is a read that did not happen.
 * Both are asserted here so the two states cannot drift into one.
 */
function pinEmptyBesideCannotTell(api) {
  const stated = api.componentSearch(
    { components: NO_COMPONENTS, source: { state: 'read' } },
    'nodata',
  );
  const unstated = api.componentSearch(
    {
      components: NO_COMPONENTS,
      source: { state: 'unreadable', reason: 'enumerate-without-getter' },
    },
    'nodata',
  );
  assert.deepEqual(
    plain(stated),
    { state: 'empty', rows: [], matched: 0 },
    'a record that states the page rendered no components answers empty, with no reason',
  );
  assert.equal(
    unstated.state,
    'cannot-tell',
    'an unreadable source is cannot-tell with its reason, never an empty list presented as a result',
  );
  assert.equal(
    unstated.reason,
    'enumerate-without-getter',
    'the reason is the measured cause: the page published no component getter (agent-main.js:862)',
  );
  assert.deepEqual(
    plain(unstated.rows),
    [],
    'a cannot-tell answer carries no rows',
  );
  assert.notEqual(
    stated.state,
    unstated.state,
    'the same empty list, one stated and one unstated, cannot collapse into one state',
  );
  assert.equal(
    'reason' in stated,
    false,
    'the stated empty answer names no cause, because there is none to name',
  );
}

/** Pin: the same record and query answer identically, row for row and order for order. */
function pinIdempotent(api) {
  const first = api.componentSearch(NAMED, 'app');
  const second = api.componentSearch(NAMED, 'app');
  assert.deepEqual(
    plain(second),
    plain(first),
    'the same record and query answer identically',
  );
  assert.deepEqual(
    plain(first.rows.map((row) => row.name)),
    ['app-counter', 'app'],
    'identical rows in identical order, in the order the record carries them',
  );
  assert.notEqual(
    second.rows,
    first.rows,
    'each answer is its own list, so a caller cannot edit the next answer',
  );
  const other = api.componentSearch(NAMED, 'APP');
  assert.deepEqual(
    plain(other),
    plain(first),
    'the same query in another case answers identically',
  );
}

test('T002 — a query keeps the names the record carries, matched case-insensitively', () => {
  const failures = proveNonVacuous(pinMatchIsASubstring, [
    {
      what: 'a case-sensitive match',
      anchor:
        "    return typeof query === 'string' ? query.trim().toLowerCase() : '';",
      replacement: "    return typeof query === 'string' ? query.trim() : '';",
      names: DEFECTS['case-sensitivity'],
    },
  ]);
  console.log(`T002 substring: ${failures.join(' | ')}`);
});

test('T002 — a query that names no recorded name matches nothing and invents none', () => {
  const failures = proveNonVacuous(pinNothingMatchedIsListed, [
    {
      what: 'a name completed from framework knowledge',
      anchor: '    return name.toLowerCase().indexOf(query) !== -1;',
      replacement: [
        '    // mutant: every Angular app has an app-root, so a query for it is completed from knowledge',
        "    if (query === 'root' || query === 'app-root') return true;",
        '    return name.toLowerCase().indexOf(query) !== -1;',
      ].join('\n'),
      names: DEFECTS['framework-completion'],
    },
  ]);
  console.log(`T002 nothing matched: ${failures.join(' | ')}`);
});

test('T002 — the rows are the record’s rows, and no row or count is invented', () => {
  const failures = proveNonVacuous(pinRowsAreTheRecords, [
    {
      what: 'a row the record does not carry',
      anchor:
        '      rows.push({ name: name, instanceCount: recordedCount(entry) });',
      replacement: [
        '      rows.push({ name: name, instanceCount: recordedCount(entry) });',
        "      rows.push({ name: 'app-root', instanceCount: recordedCount(entry) });",
      ].join('\n'),
      names: DEFECTS['invented-row'],
    },
    {
      what: 'a count the record does not state',
      anchor: '    return stated ? count : null;',
      replacement: '    return stated ? count : 1;',
      names: DEFECTS['invented-count'],
    },
  ]);
  console.log(`T002 rows: ${failures.join(' | ')}`);
});

test('T002 — an unreadable source is cannot-tell with a reason from the closed set', () => {
  const failures = proveNonVacuous(pinCannotTellIsStated, [
    {
      what: 'a cause the record invented, repeated as though measured',
      anchor: "    return 'unreadable-source';",
      replacement: [
        '    return readable && typeof source.reason === ' +
          "'string' ? source.reason : 'unreadable-source';",
      ].join('\n'),
      names: DEFECTS['invented-cause'],
    },
  ]);
  console.log(`T002 cannot-tell: ${failures.join(' | ')}`);
});

test('E4 — an empty list that is stated is not a source that could not be read', () => {
  const failures = proveNonVacuous(pinEmptyBesideCannotTell, [
    {
      what: 'empty reported where the source is unreadable',
      anchor:
        '    return { state: CANNOT_TELL, rows: [], matched: 0, reason: reason };',
      replacement: '    return { state: EMPTY, rows: [], matched: 0 };',
      names: DEFECTS['empty-for-unreadable'],
    },
  ]);
  console.log(`E4 empty beside cannot-tell: ${failures.join(' | ')}`);
});

test('T002 — the same record and query answer identical rows in identical order', () => {
  const failures = proveNonVacuous(pinIdempotent, [
    {
      what: 'rows reordered out of the record’s order',
      anchor: '    return { state: LISTED, rows: kept, matched: kept.length };',
      replacement:
        '    kept.reverse();\n    return { state: LISTED, rows: kept, matched: kept.length };',
      names: DEFECTS['order-defect'],
    },
  ]);
  console.log(`T002 idempotency: ${failures.join(' | ')}`);
});

test('T002 — the filter is one implementation and it reads the record, never the page', () => {
  const pinNoDom = (/** @type {string} */ text) => {
    assert.doesNotMatch(
      text,
      /\bdocument\b/,
      'the list is read from the record, and no caller reads the DOM to build it',
    );
  };
  pinNoDom(SEARCH_SRC);
  const failure = failureOf(() =>
    pinNoDom(
      mutatedSource(
        '  function componentSearch(record, query) {',
        "  function componentSearch(record, query) {\n    document.querySelectorAll('*');",
      ),
    ),
  );
  assert.ok(
    failure.message.includes(DEFECTS['dom-read']),
    `the DOM-reading mutant must redden naming the defect: ${failure.message.split('\n')[0]}`,
  );

  const extension = new URL('../extension/', import.meta.url);
  const implementers = readdirSync(extension)
    .filter((name) => name.endsWith('.js') && name !== 'component-search.js')
    .filter((name) =>
      readFileSync(
        new URL(`../extension/${name}`, import.meta.url),
        'utf8',
      ).includes('componentSearch'),
    );
  assert.deepEqual(
    implementers,
    [],
    'no other file implements componentSearch',
  );
  console.log(`T002 one implementation: ${failure.message.split('\n')[0]}`);
});

test('T002 — the closed reason set is the one the record names, and every cause is measured', () => {
  const api = loadSearch();
  assert.deepEqual(
    plain(api.reasons),
    record.search.reasons.map((reason) => reason.id),
    'the module states exactly the reasons the record states, in the same order',
  );
  assert.deepEqual(
    plain(api.states),
    record.search.states.map((state) => state.id),
    'the module states exactly the states the record states, in the same order',
  );

  // Two of the five are this file's own, and say so: they name the record's unreadability, not a
  // page's cause. The other three must be absence ids this record already measured (N3).
  const own = record.search.reasons
    .filter((reason) => reason.producer === null)
    .map((reason) => reason.id);
  assert.deepEqual(
    own,
    ['unreadable-source', 'unreadable-record'],
    'exactly two reasons are the filter’s own, because they are not a page’s causes',
  );
  const absenceIds = record.absences.map((entry) => entry.id);
  const measured = api.reasons.filter((id) => own.indexOf(id) === -1);
  assert.deepEqual(
    measured.length,
    3,
    `three reasons are measured causes and two are the filter's own, not ${measured.length} and ${own.length}`,
  );
  for (const id of measured)
    assert.ok(
      absenceIds.includes(id),
      `the reason ${id} is an absence case this record measured, not a cause the filter invented`,
    );
  for (const reason of record.search.reasons)
    if (reason.producer !== null)
      assertCitation(reason.producer, `search.reasons[${reason.id}].producer`);

  // The record's mutants are the ones this suite runs, and each names its defect by the phrase the
  // failure carries — so a record that quietly drops a mutant is a red test.
  assert.deepEqual(
    record.search.mutants.map((mutant) => mutant.id),
    Object.keys(DEFECTS),
    'the record lists the mutants this suite runs, in the same order',
  );
  for (const mutant of record.search.mutants)
    assert.equal(
      mutant.names,
      DEFECTS[mutant.id],
      `mutants[${mutant.id}] names the defect by the phrase its pin's failure carries`,
    );
  assert.equal(
    api.reasons.indexOf('framework-not-detected'),
    -1,
    'a cause nobody measured is not in the vocabulary',
  );
  console.log(
    `T002 closed set: ${api.reasons.length} reasons, ${own.length} of them the filter’s own`,
  );
});
