// @ts-check
// Run: node --test scripts/panel-copy.test.mjs
//
// M061 T003 pins the copy of the locale-correctness surface: the record this task writes
// (`research/raw/m061-surface.json`), the pane it records (`panel-locale-correctness.ts`), the route
// and loader key that reach the pane, and the copy the pane does not declare.
//
// M062 T003 extends the same record with the second surface it pins — `panel-outlet.ts`, the outlet
// answer's pane — and the last test below holds that row to the pane, because a copy record that
// names a surface it does not describe is a count rather than a measurement. The row lives in this
// record and not in `research/raw/m048-surface-copy.json` for the reason the locale-correctness row
// does: that record's own pins state that every surface it carries but `panel-context.ts` declares
// copy the copy join can check, and a pane whose whole copy is a label table declares none.
//
// The premise of this suite is the one the milestone is built on: a panel surface may render the six
// fields the join answers with and nothing beside them. The join is `extension/locale-correctness.js`
// (T002), and every sentence a pane writes for itself has to be explained by the shipped copy digest
// — so a pane that declares no sentence at all is the strongest form of the property, and this suite
// holds the surface to it rather than taking its word:
//
//   1. The record's citations are the lines they name. Every `{ file, line, lineText }` in the record
//      is re-read from the tree and compared with the quotation, and the text it says the line holds
//      is found on that line — a record that slid off its line, or that quotes a line it does not
//      carry, is refused by the citation's own name.
//   2. The record names the route, the loader key and the sample fact the tree carries: one entry of
//      `PANEL_SURFACES`, one `LOADERS` key pointing at this module, one `FACTS` entry whose keys are
//      exactly the six contract fields.
//   3. The vocabulary is the join's: the four states and the four absences the record and the pane
//      name are the words the shipped join answers with, so a pane that invented a state or an
//      absence reddens here by word.
//   4. The pane declares no sentence. Its code is scanned with comments stripped — the doc comments
//      are prose and render nothing — and every string literal it writes is a label or a word, never
//      a sentence; then the pane is executed over the join's four answers and every line it renders
//      is checked to be one of its own labels joined to a value the answer carries, so a line the
//      join did not produce has nowhere to come from. A seventh field handed to the pane renders no
//      line at all, which is what "adds no remedy, no cause and no identity" means at the renderer.
//   5. The copy record does not grow by this surface: no digest row is this pane's, and the shipped
//      copy join, handed the labels the pane declares, answers `cannot-tell / surface-declares-nothing`
//      rather than `clean` — "nothing to compare" never passes for "nothing wrong".
//
// Every pin carries a mutant, applied in memory to a copy of the source it pins, that must redden it
// by name: a sentence added to the pane (AC1), a page read added to the pane (AC2), a citation one
// line off, a state word the join does not answer, and a label the answer does not carry. A mutant
// that survived its pin would prove the pin vacuous, so each one is asserted to change the text it
// mutates and to fail the pin naming its defect.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** The record this task writes: the surface's route, states, absences, answer and copy. */
const RECORD = 'research/raw/m061-surface.json';

/** The pane the record is about. */
const SURFACE = 'apps/angular-ai-devtools/src/app/panel-locale-correctness.ts';

/** The three files the record cites beside the pane. */
const ROUTES = 'apps/angular-ai-devtools/src/app/app.routes.ts';
const DEMO = 'apps/angular-ai-devtools/src/app/panel-demo.ts';
const JOIN = 'extension/locale-correctness.js';

/** The two records the answer and the copy rest on. */
const RECORD_SHAPES = 'research/raw/m061-record-shapes.json';
const DIGEST = 'extension/copy-digest.json';
const COPY_RECORD = 'research/raw/m048-surface-copy.json';

/** The surface's name, which is its route path, its `data.surface` and its `LOADERS` key. */
const SURFACE_NAME = 'locale-correctness';

/** The second surface this record pins: M062 T003's pane, and the file it is. */
const OUTLET_SURFACE = 'apps/angular-ai-devtools/src/app/panel-outlet.ts';
const OUTLET_SPEC = 'apps/angular-ai-devtools/src/app/panel-outlet.spec.ts';

/** The third surface this record pins: M063 T003's pane, and the file it is. */
const GUARD_PHASE_SURFACE =
  'apps/angular-ai-devtools/src/app/panel-guard-phase.ts';
const GUARD_PHASE_SPEC =
  'apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts';

const record = JSON.parse(readFileSync(join(ROOT, RECORD), 'utf8'));
const panel = await import(pathToFileURL(join(ROOT, SURFACE)).href);

/** The lines of one repository file, read once: a path the tree does not hold throws here. */
const lineCache = new Map();
/**
 * @param {string} path
 * @returns {readonly string[]}
 */
function sourceLines(path) {
  const cached = lineCache.get(path);
  if (cached !== undefined) return cached;
  const lines = readFileSync(join(ROOT, path), 'utf8').split('\n');
  lineCache.set(path, lines);
  return lines;
}

/** The whole text of one repository file, for the verbatim reads. */
/**
 * @param {string} path
 * @returns {string}
 */
function sourceText(path) {
  return readFileSync(join(ROOT, path), 'utf8');
}

/**
 * Every citation in the record, with the place it sits: one `find` over the record's own tree of
 * objects, so a citation added anywhere is read by the walk rather than by a list of paths kept
 * beside it.
 * @param {any} node
 * @param {string} where
 * @returns {{where: string, citation: any}[]}
 */
function allCitations(node, where = 'record') {
  const found = [];
  if (Array.isArray(node)) {
    node.forEach((entry, index) =>
      found.push(...allCitations(entry, `${where}[${index}]`)),
    );
    return found;
  }
  if (node === null || typeof node !== 'object') return found;
  if (
    typeof node.file === 'string' &&
    typeof node.line === 'number' &&
    typeof node.lineText === 'string'
  ) {
    found.push({ where, citation: node });
    return found;
  }
  for (const [key, value] of Object.entries(node))
    found.push(...allCitations(value, `${where}.${key}`));
  return found;
}

/**
 * One citation, held to the file and the line it names: the file is repository-relative and in the
 * tree, the line is one that file has, and the record's quotation is exactly that line. Where the
 * citation also says what the line holds, that text is found in the line — so a quotation that is
 * the line's text but the wrong line is caught by the line number, and a right line quoted as
 * something it does not say is caught here.
 * @param {any} citation
 * @param {string} where
 */
function assertCitation(citation, where) {
  assert.equal(typeof citation.file, 'string', `${where}.file is a string`);
  assert.ok(
    !citation.file.startsWith('/') &&
      !citation.file.includes('\\') &&
      !citation.file.includes('..'),
    `${where}.file is a repository-relative posix path in the tree: ${String(citation.file)}`,
  );
  assert.ok(
    Number.isInteger(citation.line) && citation.line >= 1,
    `${where}.line is a 1-indexed line number`,
  );
  const lines = sourceLines(citation.file);
  assert.ok(
    citation.line <= lines.length,
    `${where} cites ${citation.file}:${citation.line} and the file holds ${lines.length} lines`,
  );
  const line = (lines[citation.line - 1] ?? '').replace(/\r$/, '').trim();
  assert.equal(
    line,
    citation.lineText.trim(),
    `${where} quotes ${citation.file}:${citation.line} as "${citation.lineText.trim()}" and the line reads "${line}"`,
  );
  if (typeof citation.holds === 'string')
    assert.ok(
      line.includes(citation.holds),
      `${where} says ${citation.file}:${citation.line} holds "${citation.holds}" and the line reads "${line}"`,
    );
}

/**
 * What one literal the pane writes is, in the three kinds T001's copy record names: a `label` is a
 * prefix a value is appended to — everything after its `:` is an interpolation or nothing — a `word`
 * is a single token, and a `sentence` is anything with whitespace in it that is not a label. That
 * last case is the one this pane must not carry: a sentence the join did not produce is prose the
 * copy digest has no row for.
 * @param {string} text
 * @returns {'label'|'word'|'sentence'}
 */
function kindOf(text) {
  const colon = text.indexOf(':');
  if (colon < 0) return /\s/.test(text) ? 'sentence' : 'word';
  const tail = text
    .slice(colon + 1)
    .replace(/\$\{[^}]*\}/g, '')
    .trim();
  return tail === '' ? 'label' : 'sentence';
}

/**
 * One file's code with its comments removed: the doc comments in this module are prose and render
 * nothing, so a scan for rendered copy has to read the code and not the file.
 * @param {string} path
 * @returns {{literals: string[], sentences: string[], templates: string[]}}
 */
function codeScan(path) {
  const code = sourceText(path)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  const literals = [...code.matchAll(/(['"])([^'"\n]*)\1/g)].map(
    (match) => match[2] ?? '',
  );
  const templates = [...code.matchAll(/`([^`\n]*)`/g)].map(
    (match) => match[1] ?? '',
  );
  const shaped = [...literals, ...templates].filter((text) => text !== '');
  return {
    literals: shaped,
    sentences: shaped.filter((text) => kindOf(text) === 'sentence'),
    templates,
  };
}

/** The join `extension/locale-correctness.js` publishes, evaluated from its own committed text. */
function localeCorrectnessJoin() {
  const context = createContext({});
  runInContext(sourceText(JOIN), context);
  const join = context.angularAiLocaleCorrectness;
  assert.equal(
    typeof join,
    'function',
    'extension/locale-correctness.js publishes the join on globalThis.angularAiLocaleCorrectness',
  );
  return join;
}

/** The copy join `extension/copy-check.js` publishes, evaluated the same way. */
function copyCheckJoin() {
  const context = createContext({});
  runInContext(sourceText('extension/copy-check.js'), context);
  const join = context.angularAiCopyCheck?.copyCheck;
  assert.equal(
    typeof join,
    'function',
    'extension/copy-check.js publishes copyCheck on globalThis.angularAiCopyCheck',
  );
  return join;
}

/** The provider entries T001 measured, which the demo's sample fact is the join's answer over. */
function measuredEntries() {
  return JSON.parse(readFileSync(join(ROOT, RECORD_SHAPES), 'utf8')).providers
    .entries;
}

/** A plain value out of a vm realm, so two answers compare as data and not as prototypes. */
/** @param {any} value */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The four answers the pane is held to, each the shipped join's own over one record. */
function answers() {
  const join = localeCorrectnessJoin();
  return {
    'the measured entries': plain(join(measuredEntries())),
    'a record whose entries carry no locale token': plain(
      join({
        providers: [
          {
            token: 'ErrorHandler',
            isViewProvider: false,
            provider: 'class',
            importPath: 'AppConfig',
          },
        ],
      }),
    ),
    'a record that states no formatter': plain(join({ formatter: null })),
    'a record that states nothing usable': plain(join({})),
  };
}

/** Applies one mutation to a copy of a source, or stops with a named failure. */
/**
 * @param {string} source
 * @param {string} defect
 * @param {string} anchor
 * @param {string} replacement
 */
function mutate(source, defect, anchor, replacement) {
  const mutated = source.replace(anchor, replacement);
  assert.notEqual(
    mutated,
    source,
    'the ' +
      defect +
      ' mutation target is gone — restate the bite in scripts/panel-copy.test.mjs',
  );
  return mutated;
}

/** A pin that must redden on a mutant: returns the failure the pin raises on it. */
/**
 * @param {() => void} pin
 * @param {string} defect
 */
function reddens(pin, defect) {
  let failure = null;
  try {
    pin();
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    '"' +
      defect +
      '" passed its pin on the mutant, so the mutation is not caught',
  );
  return failure;
}

// ------------------------------------------------------------------ the record ----

test('every citation the record makes is the line it names, and the line says what the record says it does', () => {
  const citations = allCitations(record);
  assert.ok(
    citations.length >= 30,
    `the record cites ${citations.length} lines, and a record that cited nothing would pass a walk of nothing`,
  );
  for (const { where, citation } of citations) assertCitation(citation, where);
  // The record is a record and not a dump: its own shape and the head it was measured at.
  assert.equal(
    record.schema,
    'm061-surface/v1',
    'the record declares its schema',
  );
  assert.match(
    String(record.head),
    /^[0-9a-f]{40}$/,
    'head is one commit sha, not a branch name',
  );
  assert.match(record.milestone, /M061/, 'the record names its milestone');
  assert.match(
    record.measuredAt,
    /no browser was opened/i,
    'the measurement itself says no browser was opened',
  );
  assert.ok(
    Array.isArray(record.notCaptured) && record.notCaptured.length >= 3,
    'the record states what it does not claim',
  );
});

test('the record names the route, the loader key and the sample fact the tree carries', () => {
  const routes = sourceText(ROUTES);
  const demo = sourceText(DEMO);

  // The record's own name is the route's path, the route's `data.surface` and the loader's key.
  assert.equal(record.route.name, SURFACE_NAME, 'the route names the surface');
  assert.equal(
    record.loader.key,
    SURFACE_NAME,
    'the loader key names the surface',
  );
  assert.equal(
    record.loader.module,
    SURFACE,
    'the loader key resolves to this surface module',
  );

  const surfaces = routes.slice(
    routes.indexOf('const PANEL_SURFACES = ['),
    routes.indexOf('\n];', routes.indexOf('const PANEL_SURFACES = [')),
  );
  assert.equal(
    surfaces.split(`  '${SURFACE_NAME}',\n`).length - 1,
    1,
    'the route is one entry of PANEL_SURFACES, and one only',
  );
  assert.ok(
    routes.includes('...PANEL_SURFACES.map(') &&
      routes.includes('path: surface,') &&
      routes.includes('loadComponent: loadPanelDemo,') &&
      routes.includes('data: { surface },'),
    'the route is installed by the one mapped literal, lazily, with its own name in route data',
  );

  const loaderEntry = `  '${SURFACE_NAME}': () => import('./panel-locale-correctness') as never,`;
  assert.equal(
    demo.split(loaderEntry).length - 1,
    1,
    'the demo carries exactly one LOADERS entry for the surface, importing this module',
  );

  // The sample fact is the join's own answer, key for key: a seventh key anywhere in the fact is a
  // field the pane would have nothing to render for.
  const marker = `FACTS['${SURFACE_NAME}'] = {`;
  const start = demo.indexOf(marker);
  assert.ok(start >= 0, 'the demo carries a sample fact for the surface');
  const end = demo.indexOf('\n};', start);
  assert.ok(end > start, 'the sample fact is one object literal');
  const block = demo.slice(start, end);
  const keys = [...block.matchAll(/^ {2}([A-Za-z]+):/gm)].map(
    (match) => match[1],
  );
  assert.deepEqual(
    keys,
    [...panel.FIELDS],
    'the fact carries exactly the six contract fields, in the contract order and no seventh',
  );

  // The same fact, field for field, is the join's own answer over the measured entries.
  const expected = plain(localeCorrectnessJoin()(measuredEntries()));
  assert.deepEqual(
    Object.keys(expected),
    [...panel.FIELDS],
    'the join answers the six fields the pane enumerates',
  );
  for (const field of [...panel.FIELDS])
    assert.ok(
      block.includes(`${field}:`),
      `the fact carries the ${field} field the join answers with`,
    );
  assert.deepEqual(
    record.measurement.output.map((line) => JSON.parse(line)),
    [expected],
    'the record’s measurement output is the join’s answer over the measured entries',
  );
});

test('the four states and the four absences are the words the shipped join answers with', () => {
  const joinSource = sourceText(JOIN);

  assert.deepEqual(
    [...panel.STATES],
    record.states.map(/** @param {any} entry */ (entry) => entry.word),
    'the pane’s state list, in its own order, is the record’s state list',
  );
  assert.deepEqual(
    [...panel.ABSENCES],
    record.absences.map(/** @param {any} entry */ (entry) => entry.word),
    'the pane’s absence list, in its own order, is the record’s absence list',
  );
  for (const entry of record.states)
    assert.ok(
      joinSource.includes(`'${entry.word}'`),
      `the join answers the state "${entry.word}" the record records`,
    );
  for (const entry of record.absences)
    assert.ok(
      joinSource.includes(`'${entry.word}'`),
      `the join names the absence "${entry.word}" the record records`,
    );

  // The states the record names are the states the join can answer, measured rather than asserted:
  // every answer the pane was written for is reachable from a record, and no answer is a fifth word.
  const seen = new Set();
  for (const [what, answer] of Object.entries(answers())) {
    assert.ok(
      panel.STATES.includes(answer.state),
      `${what} answers "${answer.state}", which is one of the four states`,
    );
    assert.deepEqual(
      Object.keys(answer).sort(),
      [...panel.FIELDS].sort(),
      `${what} answers exactly the six contract fields`,
    );
    for (const absence of answer.absences)
      assert.ok(
        panel.ABSENCES.includes(absence),
        `${what} names "${absence}", which is one of the four absences`,
      );
    seen.add(answer.state);
  }
  assert.deepEqual(
    [...seen].sort(),
    [...panel.STATES].sort(),
    'the records reach all four states, so the pane’s vocabulary is the whole of what it must render',
  );
});

test('the pane declares no sentence: every line it writes is a label and a value the answer carries', () => {
  const scan = codeScan(SURFACE);
  assert.deepEqual(
    scan.sentences,
    [],
    `the pane writes no sentence-shaped literal; it carries ${JSON.stringify(scan.sentences)}`,
  );
  assert.deepEqual(
    record.copy.sentences,
    [],
    'the record states that the pane declares no sentence',
  );
  assert.ok(
    scan.literals.length > 0,
    'the pane carries literals and they are all single tokens — labels and words, not prose',
  );
  // The control: the same scan finds the sentences a surface that declares copy carries, so a scan
  // that had gone blind would redden here rather than pass quietly.
  assert.ok(
    codeScan('apps/angular-ai-devtools/src/app/panel-components.ts').sentences
      .length >= 5,
    'the same scan finds the sentences a surface declares',
  );

  const labels = Object.values(panel.LABELS);
  const lineShape = new RegExp(
    `^(${labels.map((label) => `${label}`).join('|')}): (.*)$`,
  );
  for (const [what, answer] of Object.entries(answers())) {
    const pane = panel.localeCorrectnessPanel(answer);
    assert.equal(
      pane.state,
      answer.state,
      `${what} renders the state word the join answered`,
    );
    assert.equal(
      pane.kind,
      answer.state,
      'the surface names its own state as its kind',
    );
    assert.equal(
      pane.text,
      pane.lines.join('\n'),
      'the text is the lines joined, so a reader of either reads the same pane',
    );
    // Every line is one of the pane's own labels and one of the six fields' values.
    for (const line of pane.lines) {
      const match = lineShape.exec(line);
      assert.ok(
        match !== null,
        `${what}: every line is a label the pane enumerates and a value beside it; it rendered "${line}"`,
      );
      const value = match[2] ?? '';
      assert.ok(
        value.trim().length > 0,
        `${what}: a label with no value behind it is a blank line, and the pane renders none ("${line}")`,
      );
      assert.ok(
        [
          answer.state,
          answer.token,
          answer.provider,
          answer.importPath,
          ...answer.absences,
          ...answer.claims.flatMap((/** @type {any} */ claim) => [
            claim.claim,
            claim.artefactPath,
          ]),
        ].includes(value),
        `${what}: "${value}" is a value the answer carries, and the pane renders no other`,
      );
    }
    // The state is the first line, and the absences are one line each, never folded.
    assert.equal(
      pane.lines[0],
      `state: ${answer.state}`,
      'the state is the first line',
    );
    assert.equal(
      pane.lines.filter((line) => line.startsWith('absence: ')).length,
      answer.absences.length,
      `${what}: one absence line per absence the join decided`,
    );
    for (const absence of answer.absences)
      assert.ok(
        pane.lines.includes(`absence: ${absence}`),
        `${what}: the absence "${absence}" has its own line`,
      );
    // An entry field the answer does not carry renders no line at all — never a blank, never a word.
    for (const field of ['token', 'provider', 'importPath'])
      assert.equal(
        pane.lines.some((line) => line.startsWith(`${field}: `)),
        answer[field] !== null,
        `${what}: the ${field} line renders exactly where the answer carries one`,
      );
    assert.equal(
      pane.lines.some((line) => line.startsWith('claim: ')),
      answer.claims.length > 0,
      `${what}: a claim line renders exactly where the answer cites a claim`,
    );
  }
});

test('the pane renders no locale value, no remedy and no identity the answer did not carry', () => {
  const sample = panel.localeCorrectnessPanel(
    plain(localeCorrectnessJoin()(measuredEntries())),
  );
  assert.deepEqual(sample.lines, [
    'state: locale-provider-entry',
    'token: InjectionToken LocaleId',
    'provider: value',
    'importPath: AppConfig',
    'absence: locale-value-not-recorded',
    'absence: no-formatter-named',
  ]);

  // A seventh field on the answer renders nothing: the pane reads the six fields and no other, so a
  // value smuggled in beside them has no label to appear under and no line to be printed on. The
  // probe's value is a string no record carries — the value the walk discards is exactly what this
  // pin is about, and the pane must never be the place it is recovered from.
  const smuggled = {
    ...plain(localeCorrectnessJoin()(measuredEntries())),
    value: 'zz-ZZ',
  };
  const smuggledPane = panel.localeCorrectnessPanel(smuggled);
  assert.deepEqual(
    smuggledPane.lines,
    sample.lines,
    'a seventh field on the answer adds no line to the pane',
  );
  assert.equal(
    smuggledPane.text.includes('zz-ZZ'),
    false,
    'the pane prints no value the six fields do not carry',
  );

  // No remedy, no cause and no schematic: the words a pane would have to write for itself. The scan
  // reads all four states, so a word that appeared in one of them could not hide behind the other
  // three.
  const everyState = Object.values(answers())
    .map((answer) => panel.localeCorrectnessPanel(answer).text)
    .join('\n');
  for (const word of [
    'fix',
    'remedy',
    'schematic',
    'cause',
    'because',
    'should',
  ])
    assert.equal(
      new RegExp(`\\b${word}\\b`, 'i').test(everyState),
      false,
      `no line of any state states "${word}"`,
    );

  // The pane reaches for no page: the scan reads code, not comments, so a read added anywhere in the
  // module is caught where the doc comments cannot hide it.
  const code = sourceText(SURFACE)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  for (const pattern of [
    /\bnavigator\b/,
    /\bIntl\b/,
    /\bdocument\b/,
    /\bwindow\b/,
    /\blocalStorage\b/,
    /\binnerText\b/,
    /\btextContent\b/,
    /\btoLocaleString\b/,
  ])
    assert.equal(
      pattern.test(code),
      false,
      `the pane contains no page read: ${String(pattern)}`,
    );
});

/**
 * One file's code, comments stripped, with the sentences it writes: the same read `codeScan` makes,
 * taken over a mutated copy of a file so a mutant is scanned by the pin and not by a hope.
 * @param {string} source
 * @returns {string[]}
 */
function sentencesOf(source) {
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  const literals = [...code.matchAll(/(['"])([^'"\n]*)\1/g)].map(
    (match) => match[2] ?? '',
  );
  const templates = [...code.matchAll(/`([^`\n]*)`/g)].map(
    (match) => match[1] ?? '',
  );
  return [...literals, ...templates].filter(
    (text) => text !== '' && kindOf(text) === 'sentence',
  );
}

test('the copy record does not grow by this surface, and the digest holds no row for it', () => {
  const copyRecord = JSON.parse(readFileSync(join(ROOT, COPY_RECORD), 'utf8'));
  const digest = JSON.parse(readFileSync(join(ROOT, DIGEST), 'utf8'));

  assert.equal(
    record.counts.copyRecordSurfaces,
    copyRecord.counts.surfaces,
    'the record states the copy record’s surface count and the copy record states the same',
  );
  assert.equal(
    record.counts.copyRecordSentencesCompared,
    copyRecord.counts.declaredSentences + copyRecord.counts.inlineSentences,
    'the record states the copy record’s sentence count and the copy record states the same',
  );
  assert.equal(
    record.counts.copyRecordSurfacesBefore,
    record.counts.copyRecordSurfaces,
    'this surface adds no surface to the copy record, and the record says so',
  );

  // No digest row is this pane's, and the pane's own sentence count is zero, so no row was invented.
  const rows = digest.entries.filter(
    (/** @type {{surface: string}} */ entry) => entry.surface === SURFACE_NAME,
  );
  assert.deepEqual(
    rows,
    [],
    'the digest holds no row rendered by this surface',
  );
  assert.equal(
    record.copy.digestRows,
    rows.length,
    'the record states that count',
  );
  assert.equal(
    record.copy.sentences.length,
    record.counts.paneSentences,
    'the record’s sentence count is the sentence list it carries',
  );

  // The labels the pane declares are the record's inline lines, each read where the record says.
  for (const entry of record.copy.inline) {
    const lines = sourceLines(entry.file);
    const line = (lines[entry.line - 1] ?? '').replace(/\r$/, '').trim();
    assert.equal(
      line,
      entry.lineText.trim(),
      `the copy line at ${entry.file}:${entry.line} is the line the record quotes`,
    );
    assert.ok(
      line.includes(entry.text),
      `the copy line at ${entry.file}:${entry.line} carries the literal ${JSON.stringify(entry.text)}`,
    );
    assert.ok(
      entry.kind === 'label' || entry.kind === 'word',
      'every literal this pane writes is a label or a word, never a sentence',
    );
  }
  assert.deepEqual(
    record.copy.labels,
    Object.values(panel.LABELS),
    'the labels the record lists are the labels the pane renders under',
  );

  // The shipped copy join, handed the labels this pane declares, compares no sentence and says so:
  // `cannot-tell / surface-declares-nothing` is the answer, never `clean`.
  const answer = plain(
    copyCheckJoin()(
      [
        {
          id: SURFACE_NAME,
          file: SURFACE,
          sentences: record.copy.sentences,
          inline: record.copy.inline,
        },
      ],
      digest,
    ),
  );
  assert.equal(
    answer.state,
    'cannot-tell',
    `the pane declares no sentence, so the copy join answers "${answer.state}" and not a clean one`,
  );
  assert.equal(
    answer.reason,
    'surface-declares-nothing',
    `the reason is "${answer.reason}"`,
  );
  assert.equal(
    answer.checked,
    0,
    'nothing was compared, and that is not zero defects',
  );
  assert.deepEqual(
    answer.unexplained,
    [],
    'an absence is not a list of unexplained strings',
  );
});

test('the record’s second surface is the outlet pane, and its row is measured rather than counted', async () => {
  // M062 T003's pane: the row this record carries for it, held to the pane itself. The copy record
  // that precedes this one states a surface that declares no sentence only as an absence, so a pane
  // whose whole copy is a label table is recorded here — and this pin is what keeps the two records
  // from each deciding the other's rule: the surface row is this file's, the spec row is that one's.
  const outlet = record.surfaces.find(
    (surface) => surface.file === OUTLET_SURFACE,
  );
  assert.ok(outlet, 'the record carries a row for the outlet pane');
  assert.equal(outlet.id, 'outlet', 'the row is named by the surface’s key');
  assert.equal(
    outlet.declares,
    'inline-only',
    'the pane declares its copy inline and in no map, and the record says so',
  );
  assert.equal(
    outlet.sentences,
    0,
    'the pane declares no sentence, so the digest has nothing to explain for it',
  );
  assert.equal(
    record.surfaces.filter((surface) => surface.file === OUTLET_SURFACE).length,
    1,
    'one row per surface: a second would be a second measurement of one pane',
  );

  // The copy record states no surface row for the pane, and names its spec instead: a surface that
  // declares no sentence has no row in a record whose pins say every surface it carries declares one.
  const copyRecord = JSON.parse(readFileSync(join(ROOT, COPY_RECORD), 'utf8'));
  assert.deepEqual(
    copyRecord.surfaces.filter((surface) => surface.file === OUTLET_SURFACE),
    [],
    'the copy record carries no row for a surface that declares no sentence',
  );
  assert.equal(
    copyRecord.excluded.filter((entry) => entry.file === OUTLET_SPEC).length,
    1,
    'the copy record names the spec that measures the pane, rather than dropping it',
  );
  assert.equal(
    copyRecord.counts.surfaces,
    record.counts.copyRecordSurfaces,
    'the record states the copy record’s surface count and the copy record states the same',
  );

  // No digest row is the outlet pane's, so the digest gained none for a sentence it does not write.
  const digest = JSON.parse(readFileSync(join(ROOT, DIGEST), 'utf8'));
  assert.deepEqual(
    digest.entries.filter((entry) => entry.surface === 'outlet'),
    [],
    'the digest holds no row rendered by the outlet pane',
  );

  // The seven labels the outlet pane renders under are the labels its row enumerates, so the copy
  // this surface does declare is described here rather than left to the pane's own word.
  const outletPanelModule = await import(
    pathToFileURL(join(ROOT, OUTLET_SURFACE)).href
  );
  assert.deepEqual(
    Object.values(outletPanelModule.LABELS),
    [
      'state',
      'requested',
      'matched',
      'path',
      'absence',
      'absencePath',
      'reason',
    ],
    'the outlet pane renders under exactly these seven labels',
  );
  assert.deepEqual(
    [...outletPanelModule.FIELDS],
    ['state', 'requested', 'matched', 'path', 'absences'],
    'the outlet pane enumerates the join’s five fields and no sixth',
  );
});

test('the record’s third surface is the guard-phase pane, and its row is measured rather than counted', async () => {
  // M063 T003's pane: the row this record carries for it, held to the pane itself. The two rows
  // before it state the same shape — a pane whose whole copy is a label table is recorded here, and
  // only here — so this pin keeps the three records from each deciding another's rule.
  const guardPhase = record.surfaces.find(
    (surface) => surface.file === GUARD_PHASE_SURFACE,
  );
  assert.ok(guardPhase, 'the record carries a row for the guard-phase pane');
  assert.equal(
    guardPhase.id,
    'guard-phase',
    'the row is named by the surface’s key',
  );
  assert.equal(
    guardPhase.declares,
    'inline-only',
    'the pane declares its copy inline and in no map, and the record says so',
  );
  assert.equal(
    guardPhase.sentences,
    0,
    'the pane declares no sentence, so the digest has nothing to explain for it',
  );
  assert.equal(
    record.surfaces.filter((surface) => surface.file === GUARD_PHASE_SURFACE)
      .length,
    1,
    'one row per surface: a second would be a second measurement of one pane',
  );

  // The copy record states no surface row for the pane, and names its spec instead: a surface that
  // declares no sentence has no row in a record whose pins say every surface it carries declares one.
  const copyRecord = JSON.parse(readFileSync(join(ROOT, COPY_RECORD), 'utf8'));
  assert.deepEqual(
    copyRecord.surfaces.filter(
      (surface) => surface.file === GUARD_PHASE_SURFACE,
    ),
    [],
    'the copy record carries no row for a surface that declares no sentence',
  );
  assert.equal(
    copyRecord.excluded.filter((entry) => entry.file === GUARD_PHASE_SPEC)
      .length,
    1,
    'the copy record names the spec that measures the pane, rather than dropping it',
  );
  assert.equal(
    copyRecord.counts.surfaces,
    record.counts.copyRecordSurfaces,
    'the record states the copy record’s surface count and the copy record states the same',
  );

  // No digest row is the guard-phase pane's, so the digest gained none for a sentence it does not
  // write.
  const digest = JSON.parse(readFileSync(join(ROOT, DIGEST), 'utf8'));
  assert.deepEqual(
    digest.entries.filter((entry) => entry.surface === 'guard-phase'),
    [],
    'the digest holds no row rendered by the guard-phase pane',
  );

  // The seven labels the pane renders under are the labels its row describes, so the copy this
  // surface does declare is described here rather than left to the pane's own word.
  const guardPhaseModule = await import(
    pathToFileURL(join(ROOT, GUARD_PHASE_SURFACE)).href
  );
  assert.deepEqual(
    Object.values(guardPhaseModule.LABELS),
    ['state', 'phase', 'guard', 'verdict', 'absence', 'absencePath', 'reason'],
    'the guard-phase pane renders under exactly these seven labels',
  );
  assert.deepEqual(
    [...guardPhaseModule.FIELDS],
    ['state', 'phase', 'guard', 'verdict', 'absences'],
    'the guard-phase pane enumerates the join’s five fields and no sixth',
  );
  assert.deepEqual(
    [...guardPhaseModule.STATES],
    ['guard-cancelled', 'guard-phase-only', 'guard-allowed', 'cannot-tell'],
    'the guard-phase pane enumerates the join’s four states and no fifth',
  );
});

test('the counts the record states are the counts the tree carries', () => {
  const routes = sourceText(ROUTES);
  const demo = sourceText(DEMO);
  const digest = JSON.parse(readFileSync(join(ROOT, DIGEST), 'utf8'));

  const surfaces = routes.slice(
    routes.indexOf('const PANEL_SURFACES = ['),
    routes.indexOf('];', routes.indexOf('const PANEL_SURFACES = [')),
  );
  const panelSurfaces = surfaces
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith("'") && line.endsWith(',')).length;
  assert.equal(
    record.counts.panelSurfaces,
    panelSurfaces,
    'panelSurfaces is the number of entries PANEL_SURFACES carries',
  );
  assert.equal(
    record.counts.panelSurfacesBefore + 1,
    record.counts.panelSurfaces,
    'this surface adds exactly one entry, and the record says which number it moved',
  );

  const loaders = demo.slice(
    demo.indexOf('const LOADERS'),
    demo.indexOf('const FACTS', demo.indexOf('const LOADERS')),
  );
  const loaderKeys = loaders
    .split('\n')
    .filter((line) => line.includes('import(')).length;
  assert.equal(
    record.counts.loaderKeys,
    loaderKeys,
    'loaderKeys is the number of LOADERS entries that import a module',
  );
  assert.equal(
    record.counts.loaderKeysBefore + 1,
    record.counts.loaderKeys,
    'this key adds exactly one loader, and the record says which number it moved',
  );

  // The ordered paths are the nine named routes the table writes out plus one per surface: the
  // mapped literal builds the rest from the list, so the sum is the whole table.
  const written = [...routes.matchAll(/path: '/g)].length;
  assert.equal(written, 9, 'the table writes out the nine non-surface routes');
  assert.equal(
    record.counts.orderedPaths,
    written + panelSurfaces,
    'orderedPaths is the routes the table writes out plus one per surface',
  );
  assert.equal(
    record.counts.orderedPathsBefore + 1,
    record.counts.orderedPaths,
    'this route adds exactly one ordered path, and the record says which number it moved',
  );

  assert.equal(
    record.counts.digestRows,
    digest.entries.length,
    'digestRows is the number of rows the shipped digest carries',
  );
  assert.equal(
    record.counts.digestRowsForThisSurface,
    digest.entries.filter(
      (/** @type {{surface: string}} */ entry) =>
        entry.surface === SURFACE_NAME,
    ).length,
    'digestRowsForThisSurface is the number of rows this surface renders',
  );
});

// -------------------------------------------------------------------- the mutants ----

test('mutants redden by name: a sentence, a page read, a citation off its line, an invented state, an unlabelled field', () => {
  // Green first, on the real files: a mutant that reddens a pin that was already red proves nothing.
  assert.deepEqual(codeScan(SURFACE).sentences, []);

  // AC1: a sentence the join did not produce. The pane would render prose the copy digest cannot
  // explain, which is the defect the surface is written against.
  const sentence =
    'the locale is probably wrong, so set the provider in the bootstrap module';
  const withComment = mutate(
    sourceText(SURFACE),
    'a sentence the join did not produce',
    'export const LOCALE_PROVIDER_ENTRY =',
    `// ${sentence}\nexport const LOCALE_PROVIDER_ENTRY =`,
  );
  // A comment is prose and renders nothing, so the scan must not redden for it: the mutant that
  // matters is the one that writes the sentence as a literal the pane would print.
  assert.deepEqual(
    sentencesOf(withComment),
    [],
    'a sentence in a comment renders nothing and does not redden the scan',
  );
  const literalSentence = mutate(
    sourceText(SURFACE),
    'a sentence the join did not produce',
    'export const LOCALE_PROVIDER_ENTRY =',
    `export const PANE_NOTE = '${sentence}';\nexport const LOCALE_PROVIDER_ENTRY =`,
  );
  const sentenceFailure = reddens(
    () =>
      assert.deepEqual(
        sentencesOf(literalSentence),
        [],
        `the pane writes no sentence-shaped literal; it carries ${JSON.stringify(sentencesOf(literalSentence))}`,
      ),
    'a sentence the join did not produce',
  );
  assert.match(
    sentenceFailure.message,
    /the locale is probably wrong/,
    'the sentence mutant must redden the no-sentence pin naming the sentence it wrote: ' +
      sentenceFailure.message,
  );

  // AC2: the page read the pane must never make. `navigator.language` is the read a pane would use
  // to fill the gap the record leaves, and it is caught in code with the comments stripped.
  const withPageRead = mutate(
    sourceText(SURFACE),
    'a page read',
    'export const LOCALE_PROVIDER_ENTRY =',
    'export const PANE_LANGUAGE = navigator.language;\nexport const LOCALE_PROVIDER_ENTRY =',
  );
  const codeOf = (/** @type {string} */ source) =>
    source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const pageFailure = reddens(
    () =>
      assert.equal(
        /\bnavigator\b/.test(codeOf(withPageRead)),
        false,
        'the pane contains no page read: /\\bnavigator\\b/',
      ),
    'a page read',
  );
  assert.match(
    pageFailure.message,
    /navigator/,
    'the page-read mutant must redden the purity pin naming the read: ' +
      pageFailure.message,
  );

  // A citation one line off: the line is real and is not the one the record quotes.
  const off = JSON.parse(JSON.stringify(record));
  off.route.path.line += 1;
  const citationFailure = reddens(() => {
    for (const { where, citation } of allCitations(off))
      assertCitation(citation, where);
  }, 'a citation one line off');
  assert.match(
    citationFailure.message,
    /route\.path/,
    'the moved citation must redden the walk naming the citation it moved: ' +
      citationFailure.message,
  );

  // A state word the join does not answer: the record would name a fifth state.
  const invented = JSON.parse(JSON.stringify(record));
  invented.states[0].word = 'locale-guessed';
  const stateFailure = reddens(
    () =>
      assert.deepEqual(
        [...panel.STATES],
        invented.states.map(/** @param {any} entry */ (entry) => entry.word),
        'the pane’s state list, in its own order, is the record’s state list',
      ),
    'a state word the join does not answer',
  );
  assert.ok(
    stateFailure instanceof Error,
    'the invented state reddens the vocabulary pin',
  );
  assert.match(
    stateFailure.message,
    /locale-guessed|\+ actual - expected/,
    'the invented-state mutant must redden the vocabulary pin naming the word: ' +
      stateFailure.message,
  );

  // A label the answer does not carry: a pane that grew a line for a seventh field would print a
  // value under a label no field of the answer names.
  const labels = Object.values(panel.LABELS);
  const lineShape = new RegExp(`^(${labels.join('|')}): (.*)$`);
  const withSeventh = {
    ...plain(localeCorrectnessJoin()(measuredEntries())),
    value: 'zz-ZZ',
  };
  const smuggledLine = `value: ${withSeventh.value}`;
  const labelFailure = reddens(
    () =>
      assert.ok(
        lineShape.test(smuggledLine),
        `the pane enumerates every label it renders under; it rendered "${smuggledLine}"`,
      ),
    'a label the answer does not carry',
  );
  assert.match(
    labelFailure.message,
    /value: zz-ZZ/,
    'the unlabelled-field mutant must redden the label pin naming the line: ' +
      labelFailure.message,
  );
});
