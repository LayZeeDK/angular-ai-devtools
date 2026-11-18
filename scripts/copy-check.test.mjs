// @ts-check
// Run: node --test scripts/copy-check.test.mjs
//
// M048 T001 measures the copy each panel surface declares for itself, and the one surface that
// declares none. `research/raw/m048-surface-copy.json` names, per surface, the map or constant its
// sentences live in, every declared sentence with the key it is declared under, every sentence the
// surface writes inline where no map can reach it, and every label it builds a line from. The
// milestone's premise — that the panel compares a page's rendered strings against its own digest —
// is worth nothing if it is asserted rather than read, and a record nobody re-reads drifts the way
// a comment does. So this suite holds the record to the tree: a cited path must exist, the cited
// line must be the line its number names, and that line must contain the sentence the record quotes
// from it. A record that claims a location holds a sentence the cited line does not contain is the
// failure this suite exists for (INTENT.md SC1, SC2; T001 AC2).
//
// T001's half is the measurement above its own section marker. T002's half is below that marker: the
// digest (`extension/copy-digest.json`), the join that explains the declared sentences against it
// (`extension/copy-check.js`), and the four mutants that prove the pins can fail. Nothing above the
// marker reads either file, so T001's ten tests stay the record's own.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RECORD = 'research/raw/m048-surface-copy.json';
const APP = 'apps/angular-ai-devtools/src/app';

/** The four ways a surface can, or cannot, declare the copy it renders. */
const DECLARES = ['map', 'constants', 'inline-only', 'nothing'];

/** The three kinds of line a surface builds inline. */
const INLINE_KINDS = ['sentence', 'label', 'word'];

/**
 * @typedef {object} Citation a line the record read, quoted back with the line's own text.
 * @property {string} file the repository-relative posix path the line is in.
 * @property {number} line the 1-indexed line.
 * @property {string} lineText that line, trimmed, and nothing else removed.
 */

/**
 * @typedef {object} Sentence one sentence a surface declares, with the key it is declared under.
 * @property {string} key the id or constant name the sentence is declared under.
 * @property {string} text the sentence, verbatim.
 * @property {string} kind where the sentence sits and what it is.
 * @property {string} file the file that declares it.
 * @property {number} line the 1-indexed line the sentence's own text sits on.
 * @property {string} lineText that line, trimmed.
 */

/**
 * @typedef {object} Inline one line a surface builds inside a function or a component template.
 * @property {string} text the literal as it is written, interpolations included.
 * @property {string} kind one of `INLINE_KINDS`.
 * @property {boolean} interpolated whether the literal states a `${slot}`.
 * @property {string} file the file the literal is in.
 * @property {number} line the 1-indexed line.
 * @property {string} lineText that line, trimmed.
 */

/**
 * @typedef {object} Absence the case a surface states no sentence at all.
 * @property {string} statement what the surface is.
 * @property {string} why what the record read before stating the absence.
 * @property {string} consequence what a join has to answer for it.
 * @property {Citation[]} evidence the lines the absence rests on.
 */

/**
 * @typedef {object} Surface one panel surface: the copy it declares and where it declares it.
 * @property {string} id the surface's name in this record.
 * @property {string} file the panel-*.ts file it is.
 * @property {string} renderer the function or component that renders it.
 * @property {string} declares one of `DECLARES`.
 * @property {{kind: string, name: string} & Citation|null} declaration where the map or
 *   constant is, or null for a surface that declares none or declares no map.
 * @property {({name: string} & Citation)[]} [alsoDeclares] the other maps and constants the
 *   same surface declares.
 * @property {Sentence[]} sentences every sentence the surface declares.
 * @property {Inline[]} inline every line the surface builds inline.
 * @property {Absence} [absence] present only on a surface that declares nothing.
 * @property {string[]} notes what the entry does and does not enumerate.
 */

const record = JSON.parse(readFileSync(join(ROOT, RECORD), 'utf8'));

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

/** The whole text of one repository file, for the verbatim search. */
/**
 * @param {string} path
 * @returns {string}
 */
function sourceText(path) {
  const cached = lineCache.get(`#text:${path}`);
  if (typeof cached === 'string') return cached;
  const text = readFileSync(join(ROOT, path), 'utf8');
  lineCache.set(`#text:${path}`, text);
  return text;
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
  assert.ok(!citation.file.includes('..'), `${where}.file is in the tree`);
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
 * has, the record's quotation is exactly that line, and — where the record also quotes text — the
 * line contains it. A citation that slid off its line, or that claims a line holds a sentence it
 * does not, reddens here rather than in review.
 * @param {Citation} citation
 * @param {string} where
 * @param {string} [contains] the text the record says that line holds.
 */
function assertCitation(citation, where, contains) {
  const line = citedLine(citation, where);
  assert.equal(
    line,
    citation.lineText.trim(),
    `${where} quotes ${citation.file}:${citation.line} as "${citation.lineText.trim()}" and the line reads "${line}"`,
  );
  if (contains !== undefined)
    assert.ok(
      line.includes(contains),
      `${where} says ${citation.file}:${citation.line} holds "${contains}" and the line reads "${line}"`,
    );
}

/**
 * One declared sentence: quoted verbatim, cited, and found in the file the record names. The
 * verbatim search runs over the whole file, so a sentence whose key and text sit on different
 * lines is still held to the file that declares it.
 * @param {Sentence} sentence
 * @param {string} where
 */
function assertSentence(sentence, where) {
  assert.equal(typeof sentence.key, 'string', `${where} carries a key`);
  assert.ok(sentence.key.trim().length > 0, `${where}.key names the entry`);
  assert.equal(typeof sentence.text, 'string', `${where}.text is a string`);
  assert.ok(sentence.text.trim().length > 0, `${where}.text says something`);
  assert.equal(
    sentence.text,
    sentence.text.trim(),
    `${where}.text carries no leading or trailing whitespace`,
  );
  assert.match(
    sentence.kind,
    /^(sentence|label|word|fragment)-(in-registry|from-constant)$/,
    `${where}.kind says where the sentence sits and what it is`,
  );
  assert.ok(
    !/<[a-z]+>/.test(sentence.text),
    `${where}.text is a sentence and not markup`,
  );
  assertCitation(sentence, where, sentence.text);
  assert.ok(
    sourceText(sentence.file).includes(sentence.text),
    `${where} says ${sentence.file} declares "${sentence.text}" and the file does not carry it`,
  );
}

/**
 * One inline line: cited, quoted, and classified as the kind of line it is. A `label` must carry
 * the label it prefixes a line with, and an `interpolated` flag must be exactly whether the
 * literal states a slot — the two checks that keep the record's three kinds apart.
 * @param {Inline} entry
 * @param {string} where
 */
function assertInline(entry, where) {
  assert.ok(INLINE_KINDS.includes(entry.kind), `${where}.kind is measured`);
  assert.equal(typeof entry.text, 'string', `${where}.text is a string`);
  assert.ok(entry.text.trim().length > 0, `${where}.text says something`);
  assert.equal(
    typeof entry.interpolated,
    'boolean',
    `${where}.interpolated is a boolean`,
  );
  assert.equal(
    entry.interpolated,
    entry.text.includes('${'),
    `${where}.interpolated is exactly whether the text states a slot`,
  );
  if (entry.kind === 'label')
    assert.ok(
      entry.text.includes(':') || entry.text.includes('${'),
      `${where} is a label and carries the label it prefixes the line with`,
    );
  if (entry.kind === 'sentence')
    assert.ok(
      entry.text.trim().length > 8,
      `${where} is a sentence and says more than a label does`,
    );
  assertCitation(entry, where, entry.text);
}

/**
 * One surface: named once, its declaration cited, its sentences and inline lines each held to the
 * line they name, and its `declares` claim made true of what the entry actually carries.
 * @param {Surface} surface
 * @param {string} where
 */
function assertSurface(surface, where) {
  assert.equal(typeof surface.id, 'string', `${where} carries an id`);
  assert.ok(surface.id.trim().length > 0, `${where}.id names the surface`);
  assert.match(
    surface.file,
    /^apps\/angular-ai-devtools\/src\/app\/panel-[a-z-]+\.ts$/,
    `${where}.file is a panel surface`,
  );
  assert.equal(
    typeof surface.renderer,
    'string',
    `${where}.renderer names the function that renders it`,
  );
  assert.ok(
    DECLARES.includes(surface.declares),
    `${where}.declares is measured`,
  );
  assert.ok(
    Array.isArray(surface.notes),
    `${where}.notes is a list, even when empty`,
  );

  assert.ok(Array.isArray(surface.sentences), `${where}.sentences is a list`);
  assert.ok(Array.isArray(surface.inline), `${where}.inline is a list`);
  for (const sentence of surface.sentences)
    assertSentence(sentence, `${where}.sentences[${sentence.key}]`);
  for (const entry of surface.inline)
    assertInline(entry, `${where}.inline[${entry.text}]`);

  if (surface.declaration !== null) {
    assert.equal(
      typeof surface.declaration.kind,
      'string',
      `${where}.declaration says what shape the declaration is`,
    );
    assert.equal(
      typeof surface.declaration.name,
      'string',
      `${where}.declaration names the map or constant`,
    );
    assertCitation(
      surface.declaration,
      `${where}.declaration`,
      surface.declaration.name,
    );
  }
  for (const [index, citation] of (surface.alsoDeclares ?? []).entries()) {
    assert.equal(
      typeof citation.name,
      'string',
      `${where}.alsoDeclares[${index}] names a declaration`,
    );
    assertCitation(citation, `${where}.alsoDeclares[${index}]`, citation.name);
  }

  // Where the copy lives, made true of what the entry carries. A surface recorded as declaring a
  // map must name one, a surface recorded as declaring nothing must carry no sentence and no
  // inline line at all, and a surface recorded as writing its copy inline must declare none.
  if (surface.declares === 'map')
    assert.ok(
      surface.declaration !== null,
      `${where} declares its copy in a map and names it`,
    );
  if (surface.declares === 'constants')
    assert.equal(
      surface.sentences.filter((sentence) =>
        sentence.kind.endsWith('-in-registry'),
      ).length,
      0,
      `${where} declares its copy in constants, so no sentence of it sits in a registry`,
    );
  if (surface.declares === 'inline-only') {
    assert.deepEqual(
      surface.sentences,
      [],
      `${where} declares no sentence outside its own template and functions`,
    );
    assert.equal(
      surface.declaration,
      null,
      `${where} declares no map and no constant`,
    );
  }
  if (surface.declares !== 'nothing')
    assert.ok(
      surface.sentences.length + surface.inline.length > 0,
      `${where} renders copy and the record carries it`,
    );

  const absence = surface.absence;
  if (surface.declares === 'nothing') {
    assert.deepEqual(surface.sentences, [], `${where} declares no sentence`);
    assert.deepEqual(surface.inline, [], `${where} writes no line inline`);
    assert.ok(absence !== undefined, `${where} states the absence it is`);
    assert.ok(
      absence.evidence.length > 0,
      `${where} cites the lines it read before stating the absence`,
    );
    for (const [index, citation] of absence.evidence.entries())
      assertCitation(citation, `${where}.absence.evidence[${index}]`);
    assert.ok(
      absence.statement.trim().length > 0,
      `${where}.absence.statement says what the surface is`,
    );
    assert.ok(
      absence.why.trim().length > 0,
      `${where}.absence.why says what was read`,
    );
    assert.ok(
      absence.consequence.trim().length > 0,
      `${where}.absence.consequence says what follows for a join`,
    );
  } else
    assert.equal(
      absence,
      undefined,
      `${where} declares copy and is not an absence case`,
    );
}

/**
 * The counts the record states, recomputed from the entries it carries: a count that drifted from
 * its own list is a red test rather than a footnote nobody re-reads.
 * @param {Surface[]} surfaces
 * @returns {Record<string, number>}
 */
function measure(surfaces) {
  /** @param {(surface: Surface) => boolean} rule */
  const count = (rule) => surfaces.filter(rule).length;
  /** @param {(sentence: Sentence) => boolean} rule */
  const declared = (rule) =>
    surfaces.reduce(
      (total, surface) => total + surface.sentences.filter(rule).length,
      0,
    );
  /** @param {(entry: Inline) => boolean} rule */
  const inline = (rule) =>
    surfaces.reduce(
      (total, surface) => total + surface.inline.filter(rule).length,
      0,
    );
  return {
    surfaces: surfaces.length,
    surfacesWithMap: count((surface) => surface.declares === 'map'),
    surfacesWithConstantsOnly: count(
      (surface) => surface.declares === 'constants',
    ),
    surfacesWithInlineOnly: count(
      (surface) => surface.declares === 'inline-only',
    ),
    surfacesWithNothing: count((surface) => surface.declares === 'nothing'),
    declaredSentences: declared(
      (sentence) =>
        sentence.kind === 'sentence-in-registry' ||
        sentence.kind === 'sentence-from-constant',
    ),
    declaredLabels: declared(
      (sentence) => sentence.kind === 'label-from-constant',
    ),
    declaredWordsAndFragments: declared(
      (sentence) =>
        sentence.kind === 'word-from-constant' ||
        sentence.kind === 'fragment-from-constant',
    ),
    inlineSentences: inline((entry) => entry.kind === 'sentence'),
    inlineLabels: inline((entry) => entry.kind === 'label'),
    inlineWords: inline((entry) => entry.kind === 'word'),
  };
}

/**
 * Every citation the record makes, with the place it sits and the text it says that line holds, so
 * one walk holds the whole record to the tree.
 * @param {any} candidate
 * @returns {Generator<[string, Citation, (string|undefined)]>}
 */
function* allCitations(candidate) {
  for (const surface of candidate.surfaces ?? []) {
    if (surface.declaration)
      yield [
        `surfaces[${surface.id}].declaration`,
        surface.declaration,
        surface.declaration.name,
      ];
    for (const [index, citation] of (surface.alsoDeclares ?? []).entries())
      yield [
        `surfaces[${surface.id}].alsoDeclares[${index}]`,
        citation,
        citation.name,
      ];
    for (const sentence of surface.sentences ?? [])
      yield [
        `surfaces[${surface.id}].sentences[${sentence.key}]`,
        sentence,
        sentence.text,
      ];
    for (const entry of surface.inline ?? [])
      yield [
        `surfaces[${surface.id}].inline[${entry.text}]`,
        entry,
        entry.text,
      ];
    for (const [index, citation] of (surface.absence?.evidence ?? []).entries())
      yield [
        `surfaces[${surface.id}].absence.evidence[${index}]`,
        citation,
        undefined,
      ];
  }
  for (const correction of candidate.corrections ?? [])
    for (const [index, citation] of (correction.citations ?? []).entries())
      yield [`corrections.citations[${index}]`, citation, undefined];
  for (const entry of candidate.excluded ?? [])
    yield [`excluded[${entry.file}]`, entry, undefined];
}

/**
 * One file's code with its comments removed: the doc comments in these modules are prose and render
 * nothing, so a scan for rendered copy has to read the code and not the file. Returns the quoted
 * string literals it finds and whether it carries a template literal.
 * @param {string} path
 * @returns {{literals: string[], sentences: string[], templates: number}}
 */
function codeScan(path) {
  const code = sourceText(path)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  const literals = [...code.matchAll(/(['"])([^'"\n]*)\1/g)].map(
    (match) => match[2] ?? '',
  );
  return {
    literals,
    sentences: literals.filter((literal) => /\s/.test(literal)),
    templates: [...code.matchAll(/`/g)].length,
  };
}

/**
 * The record's whole shape and every entry's claim. Kept callable so a doctored record can be put
 * through the same check the record itself passes — which is what makes AC2 a pin and not a hope.
 * @param {any} candidate
 */
function validate(candidate) {
  for (const key of [
    'schema',
    'milestone',
    'task',
    'head',
    'measuredAt',
    'lineTextConvention',
    'counts',
    'surfaces',
    'absences',
    'mapSurfaces',
    'noMapSurfaces',
    'excluded',
    'corrections',
    'notCaptured',
    'verdict',
  ])
    assert.ok(key in candidate, `the record carries ${key}`);
  assert.equal(
    candidate.schema,
    'm048-surface-copy/v1',
    'the record declares its schema',
  );
  assert.match(
    String(candidate.head),
    /^[0-9a-f]{40}$/,
    'head is one commit sha, not a branch name',
  );
  assert.ok(
    typeof candidate.measuredAt === 'string' &&
      candidate.measuredAt.trim().length > 0,
    'measuredAt says what was read and what was not',
  );

  assert.ok(Array.isArray(candidate.surfaces), 'surfaces is a list');
  assert.ok(candidate.surfaces.length >= 1, 'at least one surface is measured');
  for (const surface of candidate.surfaces)
    assertSurface(surface, `surfaces[${surface.id}]`);

  /** @type {Surface[]} */
  const surfaces = candidate.surfaces;
  const ids = surfaces.map((surface) => surface.id);
  assert.equal(new Set(ids).size, ids.length, 'each surface is named once');
  const files = surfaces.map((surface) => surface.file);
  assert.equal(
    new Set(files).size,
    files.length,
    'each surface file is recorded once',
  );

  // The absence case SC2 rests on: the surfaces that declare nothing are exactly the record's
  // absences, so a surface cannot be dropped by being left out of one list and not the other.
  assert.deepEqual(
    candidate.absences,
    surfaces.filter((s) => s.declares === 'nothing').map((s) => s.id),
    'the record’s absences are exactly the surfaces that declare nothing',
  );
  assert.deepEqual(
    candidate.mapSurfaces,
    surfaces.filter((s) => s.declares === 'map').map((s) => s.id),
    'the record’s map surfaces are exactly the surfaces that declare a map',
  );
  assert.deepEqual(
    candidate.noMapSurfaces,
    surfaces.filter((s) => s.declares !== 'map').map((s) => s.id),
    'the surfaces left off the map list are exactly the ones that declare no map',
  );

  const measured = measure(surfaces);
  for (const [key, value] of Object.entries(measured))
    assert.equal(
      candidate.counts[key],
      value,
      `counts.${key} is the number its entries carry`,
    );
  assert.equal(
    typeof candidate.counts.citations,
    'number',
    'the record counts the lines it cites',
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
  assert.ok(
    Array.isArray(candidate.excluded) && candidate.excluded.length >= 1,
    'the files that match panel-*.ts and are not surfaces are named',
  );

  // A number the record states about a file outside the panel carries the command that produced
  // it, so a reader can re-run the count instead of trusting the sentence around it.
  assert.ok(
    Array.isArray(candidate.measurements),
    'the record carries the commands its off-record numbers came from',
  );
  for (const [index, measurement] of candidate.measurements.entries()) {
    for (const key of ['what', 'command'])
      assert.ok(
        typeof measurement[key] === 'string' &&
          measurement[key].trim().length > 0,
        `measurements[${index}].${key} says something`,
      );
    assert.ok(
      Array.isArray(measurement.output) && measurement.output.length > 0,
      `measurements[${index}] carries the output it was read from`,
    );
    for (const line of measurement.output)
      assert.equal(
        typeof line,
        'string',
        `measurements[${index}].output is text`,
      );
  }
}

/** The record with one surface patched, for the refusals below. */
/**
 * @param {string} id
 * @param {object} patch
 */
function doctored(id, patch) {
  return {
    ...record,
    surfaces: record.surfaces.map((/** @type {Surface} */ surface) =>
      surface.id === id ? { ...surface, ...patch } : surface,
    ),
  };
}

/** One surface of the record, which every refusal below needs. */
/**
 * @param {string} id
 * @returns {Surface}
 */
function surfaceOf(id) {
  const found = record.surfaces.find(
    (/** @type {Surface} */ surface) => surface.id === id,
  );
  assert.ok(found !== undefined, `the record carries ${id}`);
  return found;
}

test('the record is every panel surface, the copy each declares, and the absence', () => {
  validate(record);
  assert.ok(
    record.surfaces.length >= 2,
    'the record measures more than one surface',
  );
  assert.ok(
    record.counts.surfacesWithMap >= 1,
    'at least one surface declares its sentences in a map',
  );
  assert.ok(
    record.counts.declaredSentences >= 1,
    'at least one sentence is declared where a digest can read it',
  );
  assert.ok(
    record.counts.inlineSentences >= 1,
    'at least one sentence is written inline, which is the finding this record carries',
  );
  assert.ok(
    record.absences.length >= 1,
    'at least one surface declares no sentence at all, because that is SC2',
  );
  console.log(
    `T001 surfaces: ${record.counts.surfaces} surfaces, ` +
      `${record.counts.declaredSentences} declared sentences, ` +
      `${record.counts.inlineSentences} inline sentences, ` +
      `${record.absences.length} absence`,
  );
});

test('every cited path and line is the one the record read', () => {
  let citations = 0;
  for (const [where, citation, contains] of allCitations(record)) {
    assertCitation(citation, where, contains);
    citations += 1;
  }
  assert.equal(
    citations,
    record.counts.citations,
    `the record says it cites ${record.counts.citations} lines and this walk read every one`,
  );
  assert.ok(citations >= 100, `the record cites ${citations} lines`);
  console.log(`T001 citations: ${citations} lines re-read`);
});

test('every declared sentence appears verbatim in the file it is cited in', () => {
  let sentences = 0;
  for (const surface of record.surfaces) {
    const text = sourceText(surface.file);
    for (const sentence of surface.sentences) {
      assert.ok(
        text.includes(sentence.text),
        `${surface.id} declares "${sentence.text}" in ${surface.file}, which does not carry it`,
      );
      sentences += 1;
    }
  }
  assert.ok(
    sentences >= 50,
    `the record carries ${sentences} declared sentences`,
  );
  console.log(`T001 verbatim: ${sentences} sentences found in their files`);
});

test('every surface on disk is in the record, and the specs are named as excluded', () => {
  const onDisk = readdirSync(join(ROOT, APP))
    .filter((name) => /^panel-.*\.ts$/.test(name))
    .map((name) => `${APP}/${name}`)
    .sort();
  const specs = onDisk.filter((file) => file.endsWith('.spec.ts'));
  const surfaces = onDisk.filter((file) => !file.endsWith('.spec.ts'));

  assert.deepEqual(
    record.surfaces
      .map((/** @type {Surface} */ surface) => surface.file)
      .sort(),
    surfaces,
    'the record measures every panel-*.ts surface and no other file',
  );
  assert.deepEqual(
    record.excluded.map((/** @type {any} */ entry) => entry.file).sort(),
    specs,
    'the panel-*.ts files that are specs are named as excluded, not dropped',
  );
  for (const file of specs)
    assert.match(
      sourceText(file),
      /from 'vitest'/,
      `${file} is a spec and the record says so`,
    );
  console.log(
    `T001 coverage: ${surfaces.length} surfaces and ${specs.length} specs on disk`,
  );
});

test('the counts the record states are the counts its entries carry', () => {
  const measured = measure(record.surfaces);
  for (const [key, value] of Object.entries(measured))
    assert.equal(record.counts[key], value, `counts.${key} is not a claim`);
  assert.deepEqual(
    Object.keys(record.counts).sort(),
    [...Object.keys(measured), 'citations'].sort(),
    'the record counts nothing it does not measure and omits nothing it does',
  );
  const kinds = record.surfaces.flatMap((/** @type {Surface} */ surface) =>
    surface.sentences.map((/** @type {Sentence} */ sentence) => sentence.kind),
  );
  assert.ok(
    kinds.some((/** @type {string} */ kind) => kind.endsWith('-in-registry')),
    'at least one sentence is declared in a registry',
  );
  assert.ok(
    kinds.some((/** @type {string} */ kind) => kind.endsWith('-from-constant')),
    'at least one sentence is declared as a module constant',
  );
  assert.ok(
    record.counts.surfacesWithMap >= 1,
    'some surfaces declare their copy in a map',
  );
  assert.ok(
    record.noMapSurfaces.length >= 1,
    'and some declare no map, which is the shape of the finding',
  );
});

test('a surface that declares no sentences is recorded as an absence, not skipped', () => {
  const absent = record.surfaces.filter(
    (/** @type {Surface} */ surface) => surface.declares === 'nothing',
  );
  assert.ok(
    absent.length >= 1,
    'at least one surface declares no sentences at all',
  );
  for (const surface of absent) {
    assert.deepEqual(surface.sentences, [], `${surface.id} declares nothing`);
    assert.deepEqual(surface.inline, [], `${surface.id} writes nothing inline`);
    assert.ok(
      surface.absence.evidence.length > 0,
      `${surface.id} cites the lines it read before stating the absence`,
    );
    // The absence is measured over the file and not taken from the surface's own word: a template
    // literal, or a quoted string containing a space, anywhere in its code would contradict the
    // claim. The doc comments are prose and are stripped first, which is why the scan reads the
    // code and not the file.
    const scan = codeScan(surface.file);
    assert.equal(
      scan.templates,
      0,
      `${surface.id} declares no template literal, which is why it writes no line`,
    );
    assert.deepEqual(
      scan.sentences,
      [],
      `${surface.id} declares no sentence-shaped literal`,
    );
    assert.ok(
      scan.literals.length > 0,
      `${surface.id} carries literals and they are all single tokens`,
    );
    // The control: the same scan over a surface that does declare copy finds its sentences, so a
    // scan that had gone blind would redden here rather than pass quietly.
    assert.ok(
      codeScan(surfaceOf('components').file).sentences.length >= 5,
      'the same scan finds the sentences a surface declares',
    );
    console.log(
      `T001 absence: ${surface.id} declares nothing, ` +
        `${scan.literals.length} single-token literals, ${scan.templates} templates, ` +
        `and cites ${surface.absence.evidence.length} lines`,
    );
  }
});

test('the record states what it does not claim', () => {
  const claims = record.notCaptured.join(' ');
  assert.match(
    claims,
    /no page text was read/i,
    'the record does not claim to have read a page',
  );
  assert.match(
    claims,
    /no browser was opened/i,
    'the record does not claim a browser was opened',
  );
  assert.match(
    claims,
    /does not measure what a surface renders at runtime/i,
    'the record does not claim to have rendered a surface',
  );
  assert.match(
    record.measuredAt,
    /no browser was opened/i,
    'the measurement itself says no browser was opened',
  );
  assert.match(
    record.verdict,
    /panel-context\.ts/,
    'the verdict names the surface that declares nothing',
  );
});

test('a citation that slid off its line, or lost its text, is refused', () => {
  const components = surfaceOf('components');
  const [first] = components.sentences;
  assert.ok(first !== undefined, 'there is a sentence to move');

  // One line off: the cited line is a real line of the file and is not the one quoted.
  assert.throws(
    () =>
      validate(
        doctored('components', {
          sentences: [
            { ...first, line: first.line + 1 },
            ...components.sentences.slice(1),
          ],
        }),
      ),
    /surfaces\[components\]/,
    'a citation one line off is not the line the record read',
  );

  // A location that is right and a sentence it does not hold: the failure AC2 names.
  assert.throws(
    () =>
      validate(
        doctored('components', {
          sentences: [
            { ...first, text: 'listed: this sentence is in no file' },
            ...components.sentences.slice(1),
          ],
        }),
      ),
    /surfaces\[components\]\.sentences\[state-listed\]/,
    'a location that does not hold the sentence the record quotes is refused',
  );

  // The quotation itself doctored: the line exists, the record's copy of it is an edit.
  assert.throws(
    () =>
      validate(
        doctored('components', {
          sentences: [
            { ...first, lineText: `${first.lineText} (edited)` },
            ...components.sentences.slice(1),
          ],
        }),
      ),
    /surfaces\[components\]\.sentences\[state-listed\]/,
    'a quotation that is an edit of the line is refused',
  );

  // An inline label moved onto a line that carries no such label.
  const inline = components.inline[0];
  assert.ok(inline !== undefined, 'there is an inline line to move');
  assert.throws(
    () =>
      validate(
        doctored('components', {
          inline: [{ ...inline, line: 1 }, ...components.inline.slice(1)],
        }),
      ),
    /surfaces\[components\]\.inline/,
    'an inline line cited where it is not written is refused',
  );
});

test('a surface that declares copy cannot be recorded as declaring nothing', () => {
  const consolePane = surfaceOf('console');
  assert.ok(
    consolePane.sentences.length > 0,
    'the console pane declares sentences',
  );
  assert.throws(
    () =>
      validate(
        doctored('console', {
          declares: 'nothing',
          sentences: [],
          inline: [],
          absence: {
            statement: 'declared nothing',
            why: 'declared nothing',
            consequence: 'declared nothing',
            evidence: [],
          },
        }),
      ),
    /surfaces\[console\]/,
    'a surface recorded as an absence while its file declares sentences is refused',
  );
  assert.throws(
    () => validate(doctored('console', { declaration: null })),
    /surfaces\[console\]/,
    'a surface recorded as declaring a map must name the map',
  );
  assert.throws(
    () => validate(doctored('context', { declares: 'map' })),
    /surfaces\[context\]/,
    'a surface that renders nothing cannot be recorded as declaring a map',
  );
});

test('the record names the task that authors the digest, and measures no join itself', () => {
  // T001's half ends at the measurement: the join and the digest are T002's, and neither exists at
  // this head. This test asserts what the record says about itself and nothing about a file T002
  // will add, so T002 can append its own section to this suite without reddening this one.
  assert.match(
    record.verdict,
    /T002/,
    'the record names the task the digest belongs to',
  );
  assert.match(
    record.verdict,
    /will be the first one that holds it/,
    'the record states that no digest of this copy exists yet, rather than implying one does',
  );
  assert.ok(
    record.notCaptured.some((claim) =>
      /does not measure what a surface renders at runtime/i.test(claim),
    ),
    'the record states that it measured no rendered pane',
  );
  console.log(
    'T001 boundary: the copy is measured and the digest is T002’s, not this record’s',
  );
});

// ------------------------------------------------------------------------------------------------
// T002 — the copy digest, and the join that explains the declared sentences against it.
//
// T001 measured 19 surfaces, 79 sentences declared in a map or a module constant and 34 written
// inline where no map can reach them. `extension/copy-digest.json` is authored from that record and
// nothing else, and `extension/copy-check.js` is the pure join that reads it. This section holds the
// three together, and each of its claims is a pin rather than a paragraph:
//
// 1. The digest is the record's sentences. Every row names a sentence the record carries, under the
//    surface and the key the record gives it; the digest carries no row for a string no surface
//    renders, and no row is a copy of the record's citations (E1, N1).
// 2. The join explains exactly those strings and nothing else. A sentence one word from a digest row,
//    or the record's U+2019 apostrophe spelled with an ASCII one, is reported rather than explained:
//    the comparison is `===` on the digest's own text (E2, N1).
// 3. The record’s answer is decided in the contract’s order: a missing digest is `cannot-tell` with
//    `no-digest`; zero strings compared is `cannot-tell` with `surface-declares-nothing`; one string
//    the digest does not explain is `unexplained`; otherwise `clean`. A surface that renders no copy
//    is `cannot-tell` in its own row and does not decide the record, so a page whose read copy is
//    explained reads `clean` while the absence stays visible in the row that carries it (E3, E4, N2).
//    E4 is asserted here and nowhere else, and the case it is written about is asserted beside it, so
//    "nothing to compare" cannot pass for "nothing wrong".
// 4. The same record and digest answer identical rows in identical order, and the join writes
//    neither input (E6).
//
// The module is evaluated in a bare `node:vm` context, the way `console-join.test.mjs` loads its own:
// it is a classic extension script publishing `globalThis.angularAiCopyCheck`, so it holds no imports
// and can be read from disk as the bytes that ship. Each of the four defects T002 names is a mutation
// of those bytes applied in memory, so the checkout is never written by this file and the mutation
// cannot drift from the file it mutates.

/** The two declared kinds T001 counts as a sentence, and the one inline kind that is one. */
const SENTENCE_KINDS = ['sentence-in-registry', 'sentence-from-constant'];
const INLINE_SENTENCE_KIND = 'sentence';

const COPY_SOURCE = readFileSync(join(ROOT, 'extension/copy-check.js'), 'utf8');
const DIGEST_PATH = 'extension/copy-digest.json';
const DIGEST_TEXT = readFileSync(join(ROOT, DIGEST_PATH), 'utf8');
const shippedDigest = JSON.parse(DIGEST_TEXT);
const RECORD_BYTES = readFileSync(join(ROOT, RECORD)).length;

/**
 * The sentences one surface declares, recomputed from T001's record rather than asked of the module:
 * a module that read the wrong kinds must not also rewrite the expectation it is held to.
 * @param {Surface} surface
 * @returns {{key: string|null, text: string}[]}
 */
function recordSentences(surface) {
  /** @type {{key: string|null, text: string}[]} */
  const rows = [];
  for (const sentence of surface.sentences)
    if (SENTENCE_KINDS.includes(sentence.kind))
      rows.push({ key: sentence.key, text: sentence.text });
  for (const line of surface.inline)
    if (line.kind === INLINE_SENTENCE_KIND)
      rows.push({ key: null, text: line.text });
  return rows;
}

/**
 * Every sentence the record carries, in the record's own order, with the surface that declares it.
 * @returns {{surface: string, key: string|null, text: string}[]}
 */
function recordSentenceRows() {
  return record.surfaces.flatMap((/** @type {Surface} */ surface) =>
    recordSentences(surface).map((row) => ({ ...row, surface: surface.id })),
  );
}

/**
 * One declared sentence's text, read from the record by the key it is declared under — with the
 * read asserted, so a probe built on it cannot quietly become a probe of the empty string.
 * @param {string} id
 * @param {string} key
 * @returns {string}
 */
function recordSentenceText(id, key) {
  const found = surfaceOf(id).sentences.find(
    (/** @type {Sentence} */ sentence) =>
      sentence.key === key && SENTENCE_KINDS.includes(sentence.kind),
  );
  assert.ok(found !== undefined, `the record declares ${id}/${key}`);
  return found.text;
}

/** A vm-realm value as a plain value, so a deepEqual compares data and not two realms' prototypes. */
/** @param {any} value */
function copyOf(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * The module as it sits on disk, evaluated in a bare context: no DOM, no clock, no filesystem.
 * @param {string} [source]
 */
function loadCopy(source = COPY_SOURCE) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiCopyCheck;
  assert.ok(api, 'extension/copy-check.js publishes angularAiCopyCheck');
  for (const name of ['copyCheck', 'explainedTexts'])
    assert.equal(
      typeof api[name],
      'function',
      `extension/copy-check.js exports ${name}`,
    );
  return api;
}

/** The shipped digest with the rows declared under these keys removed — a stale digest. */
/** @param {string[]} keys */
function digestWithout(keys) {
  const drop = new Set(keys);
  return {
    ...shippedDigest,
    entries: shippedDigest.entries.filter(
      (/** @type {{key: string|null}} */ entry) => !drop.has(entry.key),
    ),
  };
}

test('T002 — the digest is the record’s sentences, under the surface and key each is declared under', () => {
  assert.equal(
    shippedDigest.schema,
    'copy-digest/v1',
    'the digest declares its own schema',
  );
  assert.equal(
    typeof shippedDigest.version,
    'string',
    'the digest declares the version it was authored at',
  );
  assert.equal(
    shippedDigest.source,
    RECORD,
    'the digest names the record it was authored from',
  );
  assert.deepEqual(
    Object.keys(shippedDigest).sort(),
    ['entries', 'schema', 'source', 'version'],
    'the digest is a digest and not the record: no citations, no lineText, no notes',
  );

  const entries = shippedDigest.entries;
  assert.ok(Array.isArray(entries), 'the digest carries an entries list');
  assert.equal(
    entries.length,
    record.counts.declaredSentences + record.counts.inlineSentences,
    'the digest carries one row per sentence the record declares, declared and inline, and none besides',
  );

  // Every row is a sentence the record carries, under the surface and the key the record gives it.
  // One `find` over all three fields, so a row attributed to the wrong surface, filed under a key no
  // surface declares, or invented outright is one failure with the row's own text in it (E1, N1).
  const declared = recordSentenceRows();
  for (const [index, entry] of entries.entries()) {
    const where = `entries[${index}]`;
    assert.deepEqual(
      Object.keys(entry).sort(),
      ['key', 'surface', 'text'],
      `${where} carries the surface that renders it, the key it came from, and its text`,
    );
    assert.ok(
      typeof entry.text === 'string' && entry.text.trim().length > 0,
      `${where}.text is a sentence`,
    );
    assert.equal(
      entry.text,
      entry.text.trim(),
      `${where}.text is the sentence as it is written, with no padding added`,
    );
    const row = declared.find(
      (candidate) =>
        candidate.surface === entry.surface &&
        candidate.key === entry.key &&
        candidate.text === entry.text,
    );
    assert.ok(
      row !== undefined,
      `${where} names "${entry.text}" under ${entry.surface}/${entry.key}, and the record carries no such sentence`,
    );
  }

  const texts = entries.map(
    (/** @type {{text: string}} */ entry) => entry.text,
  );
  assert.equal(
    new Set(texts).size,
    texts.length,
    'no sentence is digested twice, so no row is a second explanation of one string',
  );
  assert.equal(
    new Set(
      entries
        .filter((/** @type {{key: string|null}} */ entry) => entry.key !== null)
        .map(
          (/** @type {{surface: string, key: string|null}} */ entry) =>
            `${entry.surface}\u0000${entry.key}`,
        ),
    ).size,
    entries.filter(
      (/** @type {{key: string|null}} */ entry) => entry.key !== null,
    ).length,
    'each declared key is one row',
  );
  assert.equal(
    entries.filter(
      (/** @type {{key: string|null}} */ entry) => entry.key === null,
    ).length,
    record.counts.inlineSentences,
    'a sentence written inline is declared under no key, so its row carries null and there is one per inline sentence the record measured',
  );

  // A digest, not the corpus copied wholesale: it is smaller than the record it was authored from,
  // and it is a digest of sentences rather than of every literal the record cites.
  const digestBytes = Buffer.byteLength(DIGEST_TEXT);
  assert.ok(
    digestBytes < RECORD_BYTES,
    `the digest (${digestBytes} bytes) is authored from the record (${RECORD_BYTES} bytes) and is not a copy of it`,
  );
  assert.ok(
    texts.length >= 100,
    `the digest carries ${texts.length} sentences, which is the copy this milestone measured`,
  );
  console.log(
    `T002 digest: ${texts.length} sentences, ${digestBytes} bytes against the record's ${RECORD_BYTES}`,
  );
});

test('T002 — the scope reads the sentences and reads past the labels and value words by count', () => {
  const api = loadCopy();
  const scope = copyOf(api.SCOPE);
  assert.deepEqual(
    scope.declared.read,
    SENTENCE_KINDS,
    'the declared kinds the join reads are the kinds T001 counts as sentences',
  );
  assert.deepEqual(
    scope.inline.read,
    [INLINE_SENTENCE_KIND],
    'the one inline kind the join reads is the one T001 counts as a sentence',
  );

  /** @param {(surface: Surface) => number} rule */
  const total = (rule) =>
    record.surfaces.reduce(
      (/** @type {number} */ sum, /** @type {Surface} */ surface) =>
        sum + rule(surface),
      0,
    );

  // Nothing the record carries is unaccounted for: every literal kind is either read or read past by
  // name, and the two halves add up to the counts T001 states. A kind added to the record without a
  // line here would be a literal nobody reads, not a silent miss.
  const declaredRead = total(
    (surface) =>
      surface.sentences.filter((sentence) =>
        scope.declared.read.includes(sentence.kind),
      ).length,
  );
  const declaredPassedOver = total(
    (surface) =>
      surface.sentences.filter((sentence) =>
        scope.declared.passedOver.includes(sentence.kind),
      ).length,
  );
  const inlineRead = total(
    (surface) =>
      surface.inline.filter((entry) => scope.inline.read.includes(entry.kind))
        .length,
  );
  const inlinePassedOver = total(
    (surface) =>
      surface.inline.filter((entry) =>
        scope.inline.passedOver.includes(entry.kind),
      ).length,
  );

  assert.equal(
    declaredRead,
    record.counts.declaredSentences,
    'the declared sentences the join reads are the count the record states',
  );
  assert.equal(
    inlineRead,
    record.counts.inlineSentences,
    'the inline sentences the join reads are the count the record states',
  );
  assert.equal(
    declaredPassedOver,
    record.counts.declaredLabels + record.counts.declaredWordsAndFragments,
    'the declared labels, words and fragments the join reads past are the count the record states',
  );
  assert.equal(
    inlinePassedOver,
    record.counts.inlineLabels + record.counts.inlineWords,
    'the inline labels and words the join reads past are the count the record states',
  );
  assert.equal(
    declaredRead + declaredPassedOver,
    total((surface) => surface.sentences.length),
    'every declared literal the record carries is either read or read past: none is unaccounted for',
  );
  assert.equal(
    inlineRead + inlinePassedOver,
    total((surface) => surface.inline.length),
    'every inline literal the record carries is either read or read past: none is unaccounted for',
  );
  console.log(
    `T002 scope: ${declaredRead} declared + ${inlineRead} inline sentences read, ` +
      `${declaredPassedOver + inlinePassedOver} labels and value words read past`,
  );
});

test('T002 — the pluralised word the pane never renders whole is a recorded decision, not a digest row', () => {
  const api = loadCopy();
  const decisions = copyOf(api.NOT_DIGESTED);
  const reasons = copyOf(api.NOT_DIGESTED_REASONS);
  assert.ok(
    decisions.length >= 1,
    'the decision not to digest a string the pane never renders whole is carried as data',
  );
  for (const decision of decisions) {
    assert.ok(
      reasons.includes(decision.reason),
      `"${decision.reason}" is one of the reasons a string is deliberately not digested`,
    );

    // The decision is about a string the record really carries, so it is read off T001's measurement
    // and not invented to excuse a hole in the digest.
    const surface = surfaceOf(decision.surface);
    const carried = [...surface.sentences, ...surface.inline].some(
      (/** @type {{text: string}} */ entry) => entry.text === decision.text,
    );
    assert.ok(
      carried,
      `the record carries "${decision.text}" in ${decision.surface}, and the decision names it`,
    );
    assert.ok(
      !shippedDigest.entries.some(
        (/** @type {{text: string}} */ entry) => entry.text === decision.text,
      ),
      `the digest holds no row for "${decision.text}", which no surface renders as a whole string`,
    );

    // And the join does not manufacture an unexplained row for it either: the decision is a scope,
    // not a defect the pane is asked to report on itself.
    const answer = copyOf(
      api.copyCheck(copyOf([surface]), copyOf(shippedDigest)),
    );
    assert.deepEqual(
      answer.unexplained.filter(
        (/** @type {{string: string}} */ row) => row.string === decision.text,
      ),
      [],
      'the join reports no row for a string the pane never renders whole',
    );
    console.log(
      `T002 not digested: ${decision.surface} "${decision.text}" (${decision.reason})`,
    );
  }

  // The record's own note says why, so the decision rests on T001's measurement of `counted()` and
  // not on this suite's reading of the source.
  assert.ok(
    surfaceOf('sanitizer').notes.some((/** @type {string} */ note) =>
      /pluralis/i.test(note),
    ),
    'the record states that panel-sanitizer.ts:180 is a pluraliser',
  );
});

test('T002 — every sentence a surface declares is explained, and the surface that renders no copy is cannot-tell', () => {
  const api = loadCopy();
  const lines = [];
  let copyBearing = 0;
  for (const surface of record.surfaces) {
    const sentences = recordSentences(surface);
    const answer = copyOf(
      api.copyCheck(copyOf([surface]), copyOf(shippedDigest)),
    );
    if (sentences.length === 0) {
      assert.equal(
        answer.state,
        'cannot-tell',
        `${surface.id} renders no copy and is an input like any other, and its answer is "${answer.state}" rather than a clean one with nothing in it`,
      );
      assert.equal(
        answer.reason,
        'surface-declares-nothing',
        `${surface.id} renders no copy, and the reason is "${answer.reason}"`,
      );
      assert.equal(
        answer.checked,
        0,
        `${surface.id} declares no sentence, so nothing was compared`,
      );
      assert.deepEqual(
        answer.unexplained,
        [],
        'an absence is not a list of unexplained strings',
      );
      lines.push(`${surface.id}: cannot-tell (surface-declares-nothing)`);
      continue;
    }
    copyBearing += 1;
    const first = answer.unexplained[0];
    assert.equal(
      answer.state,
      'clean',
      `${surface.id}: every sentence it declares is in the digest, and the answer is "${answer.state}"` +
        (first === undefined
          ? ''
          : ` naming "${first.string}" as one the digest does not carry`),
    );
    assert.equal(
      answer.checked,
      sentences.length,
      `${surface.id} declares ${sentences.length} sentences and ${answer.checked} were compared`,
    );
    lines.push(`${surface.id}: clean, ${answer.checked} sentences`);
  }
  assert.equal(
    copyBearing,
    record.surfaces.length - record.absences.length,
    'every surface but the record’s one absence declares copy this join can check',
  );
  assert.ok(
    copyBearing >= 2,
    `the sweep read ${copyBearing} copy-bearing surfaces`,
  );
  console.log(`T002 per surface: ${lines.join(' | ')}`);
});

test('T002 — the record as measured is clean, and the surface that renders no copy is its own row', () => {
  const api = loadCopy();
  const answer = copyOf(
    api.copyCheck(copyOf(record.surfaces), copyOf(shippedDigest)),
  );
  assert.equal(
    answer.state,
    'clean',
    `the whole record answers "${answer.state}": every sentence the record declares is in the digest, and panel-context.ts renders no copy in its row rather than deciding the record`,
  );
  assert.equal(answer.reason, undefined, 'a clean answer states no reason');
  assert.equal(
    answer.checked,
    record.counts.declaredSentences + record.counts.inlineSentences,
    'every sentence the record declares was compared',
  );
  assert.deepEqual(
    answer.unexplained,
    [],
    `the shipped digest explains all ${answer.checked} sentences`,
  );

  // The absence is still visible, in the row that carries it: the record reads clean and the surface
  // that renders no copy still answers cannot-tell on its own, so neither answer hides the other.
  const row = copyOf(
    api.copyCheck([copyOf(surfaceOf('context'))], copyOf(shippedDigest)),
  );
  assert.equal(
    row.state,
    'cannot-tell',
    `context renders no copy and its own row answers "${row.state}"`,
  );
  assert.equal(
    row.reason,
    'surface-declares-nothing',
    `context’s row states the reason "${row.reason}"`,
  );
  assert.equal(
    row.checked,
    0,
    'context declares no sentence, so nothing was compared',
  );
  console.log(
    `T002 record: clean, ${answer.checked} sentences compared, ${answer.unexplained.length} unexplained; ` +
      'context row: cannot-tell (surface-declares-nothing)',
  );
});

// The contract states the order the record's own answer is decided in. Each of the four cases is
// pinned below on the record that carries a surface declaring no copy, so the pins cannot pass by
// leaving that surface out — and each pin states the case that loses, not only the one that wins.

test('T002 / precedence 1 — a missing digest is cannot-tell with "no-digest", before anything else', () => {
  const api = loadCopy();

  // The record carries panel-context.ts, the surface that renders no copy: it did decide the record
  // under the old order. It does not decide this one — the digest is the first absence, and the
  // record with no digest and a surface with nothing to declare together answer "no-digest".
  for (const digest of [undefined, null, {}, { entries: [] }]) {
    const answer = copyOf(
      api.copyCheck(
        copyOf(record.surfaces),
        digest === undefined ? undefined : copyOf(digest),
      ),
    );
    assert.equal(
      answer.state,
      'cannot-tell',
      `a record with no digest is cannot-tell, and this answered "${answer.state}"`,
    );
    assert.equal(
      answer.reason,
      'no-digest',
      `the first absence is the digest, so the reason is "no-digest"; this said "${answer.reason}"`,
    );
    assert.equal(
      answer.checked,
      0,
      'nothing was compared against a digest that is not there, so checked is 0',
    );
    assert.deepEqual(
      answer.unexplained,
      [],
      'nothing was compared, so no string is reported',
    );
  }
  console.log(
    'T002 precedence: no digest → cannot-tell (no-digest), checked 0',
  );
});

test('T002 / precedence 2 — zero strings compared is cannot-tell with "surface-declares-nothing"', () => {
  const api = loadCopy();

  // Zero strings compared is the same answer whether the record carried the one surface that
  // renders nothing or no surface at all: the state is decided by the comparison, not by counting
  // surfaces, and a record with nothing to compare is never clean.
  const zero = [
    ['the only surface renders no copy', [copyOf(surfaceOf('context'))]],
    ['the record carries no surface', []],
    ['no surface list was handed over', undefined],
  ];
  for (const [what, surfaces] of zero) {
    const answer = copyOf(api.copyCheck(surfaces, copyOf(shippedDigest)));
    assert.equal(
      answer.state,
      'cannot-tell',
      `a record with zero strings (${what}) is cannot-tell, and this answered "${answer.state}"`,
    );
    assert.equal(
      answer.reason,
      'surface-declares-nothing',
      `zero strings compared states "surface-declares-nothing" (${what}); this said "${answer.reason}"`,
    );
    assert.equal(
      answer.checked,
      0,
      `nothing was compared (${what}), so checked is 0`,
    );
    assert.deepEqual(
      answer.unexplained,
      [],
      'zero comparisons is not a list of unexplained strings',
    );
  }
  console.log(
    'T002 precedence: zero strings → cannot-tell (surface-declares-nothing), checked 0',
  );
});

test('T002 / precedence 3 — one unexplained string is "unexplained" even when a surface renders no copy', () => {
  const api = loadCopy();
  const dropped = recordSentenceText('components', 'state-listed');
  const answer = copyOf(
    api.copyCheck(
      copyOf(record.surfaces),
      copyOf(digestWithout(['state-listed'])),
    ),
  );
  assert.equal(
    answer.state,
    'unexplained',
    `a record carrying panel-context.ts and one string the digest does not explain is "unexplained", and this answered "${answer.state}"`,
  );
  assert.equal(
    answer.reason,
    undefined,
    'an unexplained answer states no reason: it names the strings instead',
  );
  assert.deepEqual(
    answer.unexplained,
    [{ string: dropped, surface: 'components' }],
    'the one string the digest does not explain is named with the surface that renders it',
  );
  assert.equal(
    answer.checked,
    record.counts.declaredSentences + record.counts.inlineSentences,
    'every sentence the record declares was compared, so the unexplained one is found rather than inferred',
  );
  console.log(
    `T002 precedence: one unexplained string → unexplained, naming "${dropped.slice(0, 24)}…" (components)`,
  );
});

test('T002 / precedence 4 — a fully explained record with an absent surface is clean, and its absent row is cannot-tell', () => {
  const api = loadCopy();

  // Every sentence is explained and one surface renders no copy: the record is clean, and the
  // absence is still visible in the row that carries it.
  const answer = copyOf(
    api.copyCheck(copyOf(record.surfaces), copyOf(shippedDigest)),
  );
  assert.equal(
    answer.state,
    'clean',
    `a fully explained record is clean whatever its rows declare nothing, and this answered "${answer.state}"`,
  );
  assert.equal(
    answer.checked,
    record.counts.declaredSentences + record.counts.inlineSentences,
    'every sentence the record declares was compared',
  );
  assert.deepEqual(
    answer.unexplained,
    [],
    'no string is reported when the digest explains them all',
  );

  // The rows are each surface's own answer, in record order, and the record's answer is that order
  // over them: checked is what they compared, unexplained is what they reported, and the one row
  // that declares nothing is still cannot-tell.
  const rows = record.surfaces.map((/** @type {Surface} */ surface) =>
    copyOf(api.copyCheck([copyOf(surface)], copyOf(shippedDigest))),
  );
  assert.equal(
    answer.checked,
    rows.reduce((sum, row) => sum + row.checked, 0),
    'the record compared exactly what its rows compared',
  );
  assert.deepEqual(
    answer.unexplained,
    rows.flatMap(
      (/** @type {{unexplained: {string: string, surface: string}[]}} */ row) =>
        row.unexplained,
    ),
    'the record reports exactly what its rows reported, in record order',
  );
  for (const [index, surface] of record.surfaces.entries()) {
    const row = rows[index];
    if (surface.declares !== 'nothing') {
      assert.equal(
        row.state,
        'clean',
        `${surface.id} declares copy the digest explains, and its row answers "${row.state}"`,
      );
      continue;
    }
    assert.equal(
      row.state,
      'cannot-tell',
      `${surface.id} renders no copy and its row answers "${row.state}", not the record's clean`,
    );
    assert.equal(
      row.reason,
      'surface-declares-nothing',
      `${surface.id}’s row states the reason "${row.reason}"`,
    );
    assert.equal(
      row.checked,
      0,
      `${surface.id} declares no sentence, so its row compared nothing`,
    );
  }
  console.log(
    `T002 precedence: fully explained record → clean (${answer.checked} compared), ` +
      `context row → cannot-tell (surface-declares-nothing)`,
  );
});

test('T002 — the states and the reasons are closed lists the module publishes', () => {
  const api = loadCopy();
  assert.deepEqual(
    copyOf(api.STATES),
    ['clean', 'unexplained', 'cannot-tell'],
    'the three states the contract names, in the order the contract lists them',
  );
  const reasons = copyOf(api.REASONS);
  assert.ok(
    reasons.length >= 1,
    'the module publishes the reasons it can state',
  );
  assert.equal(
    new Set(reasons).size,
    reasons.length,
    'no reason is listed twice',
  );
  for (const reason of reasons)
    assert.match(
      reason,
      /^[a-z]+(-[a-z]+)*$/,
      `"${reason}" is a word a surface renders and not a sentence it would have to explain`,
    );
  assert.ok(
    Object.isFrozen(api.REASONS) && Object.isFrozen(api.STATES),
    'the lists are frozen: a caller cannot add a word the surface has no sentence for',
  );

  // Every cannot-tell the join can answer states one of those words, and a reason is present exactly
  // where the state is cannot-tell: never on a clean answer, never on an unexplained one.
  const inputs = [
    [undefined, shippedDigest],
    [copyOf([surfaceOf('context')]), shippedDigest],
    [copyOf([surfaceOf('components')]), undefined],
    [copyOf([surfaceOf('components')]), {}],
    [copyOf(record.surfaces), shippedDigest],
    [copyOf([surfaceOf('components')]), copyOf(shippedDigest)],
    [copyOf([surfaceOf('components')]), digestWithout(['state-listed'])],
  ];
  for (const [surfaces, digest] of inputs) {
    const answer = copyOf(
      api.copyCheck(
        surfaces === undefined ? undefined : copyOf(surfaces),
        digest === undefined ? undefined : copyOf(digest),
      ),
    );
    assert.ok(
      copyOf(api.STATES).includes(answer.state),
      `"${answer.state}" is one of the states the module publishes`,
    );
    if (answer.state === 'cannot-tell')
      assert.ok(
        reasons.includes(answer.reason),
        `a cannot-tell answer states a published reason, and this one stated "${answer.reason}"`,
      );
    else
      assert.equal(
        answer.reason,
        undefined,
        'a reason is present only where the state is cannot-tell',
      );
  }
});

test('T002 / E4 — a surface with strings and no digest is cannot-tell, and the same surface beside a stale digest is reported', () => {
  const api = loadCopy();
  const components = copyOf(surfaceOf('components'));

  // (a) Nothing to compare. A missing digest, an object carrying no entries list and an entry-less
  // digest are one answer: nobody compared the strings, so the answer is cannot-tell and not clean.
  const absent = [
    undefined,
    null,
    {},
    { entries: [] },
    { entries: [{ surface: 'components' }] },
  ];
  for (const digest of absent) {
    const answer = copyOf(
      api.copyCheck(
        copyOf([components]),
        digest === undefined ? undefined : copyOf(digest),
      ),
    );
    assert.equal(
      answer.state,
      'cannot-tell',
      `a surface with strings and no digest reports cannot-tell with the reason "no-digest", because nobody compared the strings; this reported "${answer.state}"`,
    );
    assert.equal(
      answer.reason,
      'no-digest',
      `the digest ${JSON.stringify(digest)} holds nothing to compare, and the reason this reported was "${answer.reason}"`,
    );
    assert.equal(
      answer.checked,
      0,
      'nothing was compared, so nothing is counted as compared',
    );
    assert.deepEqual(
      answer.unexplained,
      [],
      'the absence of a comparison reports no string: it is the reason that says so',
    );
  }

  // (b) The same surface and the same strings beside a digest that lacks one of them: reported, with
  // the surface that renders it. Asserted here, beside (a), so "nothing to compare" cannot pass for
  // "nothing wrong" (held-out E4).
  const [first] = recordSentences(surfaceOf('components'));
  assert.ok(first !== undefined, 'the components pane declares a sentence');
  const answer = copyOf(
    api.copyCheck(
      copyOf([components]),
      copyOf(digestWithout([/** @type {string} */ (first.key)])),
    ),
  );
  assert.equal(
    answer.state,
    'unexplained',
    `the same surface beside a digest that lacks "${first.text}" is reported and not clean, and this answered "${answer.state}"`,
  );
  assert.equal(
    answer.reason,
    undefined,
    'an unexplained answer states no reason: it names the strings instead',
  );
  assert.deepEqual(
    answer.unexplained,
    [{ string: first.text, surface: 'components' }],
    'the reported string is the digest’s missing sentence, with the surface that renders it',
  );
  assert.equal(
    answer.checked,
    recordSentences(surfaceOf('components')).length,
    'every sentence of the surface was compared, not only the reported one',
  );
});

test('T002 — a match is the digest’s own text: a near-miss sentence and a respelled apostrophe are reported', () => {
  const api = loadCopy();

  // One word edited in a declared sentence: the copy drifted and the digest did not. A similarity
  // rule would explain it; the digest's own text does not contain it.
  const original = recordSentenceText('components', 'state-filtered');
  const nearMiss = original.replace('rows matched', 'rows match');
  assert.notEqual(
    nearMiss,
    original,
    'the near-miss probe differs from the sentence the digest carries',
  );
  const drifted = copyOf(surfaceOf('components'));
  drifted.sentences = drifted.sentences.map(
    (/** @type {Sentence} */ sentence) =>
      sentence.key === 'state-filtered'
        ? { ...sentence, text: nearMiss }
        : sentence,
  );
  const reported = copyOf(
    api.copyCheck(copyOf([drifted]), copyOf(shippedDigest)),
  );
  assert.equal(
    reported.state,
    'unexplained',
    `a sentence is explained by the digest's own text and never by similarity, and this near-miss was explained: "${nearMiss}" (components)`,
  );
  assert.deepEqual(
    reported.unexplained,
    [{ string: nearMiss, surface: 'components' }],
    `the near-miss "${nearMiss}" is the one string the digest does not carry, and the answer names it`,
  );

  // The record's own warning about normalisation: the stability pane spells `page’s` with U+2019, so
  // a digest that carried an ASCII apostrophe would hold a different string than the pane renders.
  const typographic = recordSentenceText('stability', 'unstable');
  const ascii = typographic.replace(/\u2019/g, "'");
  assert.notEqual(
    ascii,
    typographic,
    'the probe sentence really carries the typographic apostrophe',
  );
  const respelled = {
    ...shippedDigest,
    entries: shippedDigest.entries.map(
      (
        /** @type {{surface: string, key: string|null, text: string}} */ entry,
      ) =>
        entry.surface === 'stability' && entry.key === 'unstable'
          ? { ...entry, text: ascii }
          : entry,
    ),
  };
  const apostrophe = copyOf(
    api.copyCheck(copyOf([surfaceOf('stability')]), copyOf(respelled)),
  );
  assert.equal(
    apostrophe.state,
    'unexplained',
    `a digest entry respelled with an ASCII apostrophe explains nothing, and this answered "${apostrophe.state}" for "${typographic}" (stability)`,
  );
  assert.deepEqual(
    apostrophe.unexplained,
    [{ string: typographic, surface: 'stability' }],
    'the sentence the pane renders is reported, and the digest’s respelling is not accepted in its place',
  );
  console.log(
    `T002 exact text: "${nearMiss}" and "${ascii}" are reported rather than explained`,
  );
});

test('T002 / E6 — the same record and digest answer identical rows in identical order, and the join writes neither', () => {
  const api = loadCopy();
  const records = copyOf(record.surfaces);
  const stale = digestWithout(['no-reason', 'cannot-tell', 'state-empty']);
  const digest = copyOf(stale);
  const before = JSON.stringify([records, digest]);

  const first = copyOf(api.copyCheck(copyOf(records), copyOf(digest)));
  const second = copyOf(api.copyCheck(copyOf(records), copyOf(digest)));

  assert.equal(
    JSON.stringify(second),
    JSON.stringify(first),
    'the same inputs twice answer the same rows in the same order',
  );
  assert.deepEqual(second, first, 'the second answer is the first answer');
  assert.equal(
    JSON.stringify([records, digest]),
    before,
    'the join reads its inputs and writes neither of them',
  );

  // The order is the record's: surface order, then the order each surface declares its sentences in.
  const explained = new Set(
    digest.entries.map((/** @type {{text: string}} */ entry) => entry.text),
  );
  const expected = recordSentenceRows()
    .filter((row) => !explained.has(row.text))
    .map((row) => ({ string: row.text, surface: row.surface }));
  assert.deepEqual(
    first.unexplained,
    expected,
    'the rows are the record’s order, surface by surface and sentence by sentence',
  );
  assert.ok(
    first.unexplained.length > 1,
    `the stale digest leaves ${first.unexplained.length} strings to report, so the order is not tested by one row`,
  );
  assert.equal(
    first.state,
    'unexplained',
    `the stale digest leaves ${first.unexplained.length} strings unexplained, so the record is unexplained and the rows name them`,
  );
  console.log(
    `T002 idempotency: ${first.unexplained.length} rows, twice, identical and in record order`,
  );
});

test('T002 — the join is one implementation, reads no page, and reads no file', () => {
  assert.doesNotMatch(
    COPY_SOURCE,
    /\bdocument\b|\bchrome\b|\binnerText\b|\btextContent\b/,
    'the join reads neither a page nor the extension API: its inputs are the record and the digest',
  );
  assert.doesNotMatch(
    COPY_SOURCE,
    /\breadFileSync\b|\brequire\(|\bimport\s/,
    'the join takes both sides as arguments and reads no file of its own',
  );
  const extension = new URL('../extension/', import.meta.url);
  const implementers = readdirSync(extension)
    .filter((name) => name.endsWith('.js') && name !== 'copy-check.js')
    .filter((name) =>
      readFileSync(
        new URL(`../extension/${name}`, import.meta.url),
        'utf8',
      ).includes('copyCheck'),
    );
  assert.deepEqual(implementers, [], 'no other file implements copyCheck');
  const digestReaders = readdirSync(extension)
    .filter((name) => name.endsWith('.js') && name !== 'copy-check.js')
    .filter((name) =>
      readFileSync(
        new URL(`../extension/${name}`, import.meta.url),
        'utf8',
      ).includes('copy-digest.json'),
    );
  assert.deepEqual(
    digestReaders,
    [],
    'the digest is read by the join’s caller and not by a second reader of it',
  );
});

// Each mutation is one edit of the shipped source, applied in memory by this file. `defect` is the
// word the failing pin must be shown to name, `names` the string in its failure text: a mutant that
// reddens with a stack and no sentence would prove nothing about the copy.
const COPY_MUTATIONS = [
  {
    id: 'digest-entry-dropped',
    // A string the surface renders becomes unexplained, and the pin says which string.
    defect: 'unexplained',
    names: 'listed: the record names these components',
    anchor: '    const explained = new Set(explainedTexts(digest));',
    replacement:
      "    const explained = new Set(\n      explainedTexts(digest).filter((text) => !text.startsWith('listed:')),\n    );",
  },
  {
    id: 'similarity-match',
    // The comparison, replaced by a prefix rule: a near-miss sentence is wrongly explained. The
    // precedence moved this comparison into `surfaceRow`, one level less deeply nested than it was,
    // so the anchor names it there.
    defect: 'similarity',
    names: 'how many rows match',
    anchor: '      if (!explained.has(text))',
    replacement:
      '        const near = [...explained].some(\n          (candidate) => candidate.slice(0, 24) === text.slice(0, 24),\n        );\n        if (!near)',
  },
  {
    id: 'invented-row',
    // N1 built into the module: the digest-reading step answers with a row the digest does not carry.
    defect: 'invented',
    names: 'cannot tell: no panel copy can be named',
    anchor: '      const entry = entries[i];',
    replacement:
      "      const entry =\n        i === 0\n          ? { text: 'cannot tell: no panel copy can be named' }\n          : entries[i];",
  },
  {
    id: 'missing-digest-reported-clean',
    // E4 built backwards: nothing to compare is answered as nothing wrong.
    defect: 'cannot-tell',
    names: 'no-digest',
    anchor:
      '    if (explained.size === 0) {\n      return {\n        state: CANNOT_TELL,\n        unexplained: [],\n        checked: 0,\n        reason: NO_DIGEST,\n      };\n    }',
    replacement:
      '    if (explained.size === 0) {\n      return { state: CLEAN, unexplained: [], checked: 0 };\n    }',
  },
];

/** One mutation, written into the source on disk's bytes — and asserted to have changed them. */
/** @param {{anchor: string, replacement: string}} mutation */
function mutatedCopy(mutation) {
  const mutated = COPY_SOURCE.replace(mutation.anchor, mutation.replacement);
  assert.notEqual(
    mutated,
    COPY_SOURCE,
    `mutation ${mutation.anchor} must change the source it is applied to`,
  );
  return mutated;
}

/** The pin the digest-explanations of the whole record are held to: every sentence explained. */
/** @param {any} api */
function pinCleanOnTheRecord(api) {
  const surfaces = record.surfaces.filter(
    (/** @type {Surface} */ surface) => surface.declares !== 'nothing',
  );
  const answer = copyOf(api.copyCheck(copyOf(surfaces), copyOf(shippedDigest)));
  const first = answer.unexplained[0];
  assert.equal(
    answer.state,
    'clean',
    `every sentence the copy-bearing surfaces declare is in the digest, and the answer is "${answer.state}"` +
      (first === undefined
        ? ''
        : ` naming "${first.string}" (${first.surface}) as unexplained`),
  );
  assert.deepEqual(
    answer.unexplained,
    [],
    'no string is reported when the digest explains them all',
  );
  assert.equal(
    answer.checked,
    record.counts.declaredSentences + record.counts.inlineSentences,
    'every sentence the record declares was compared',
  );
}

/** The pin the exact-text rule is held to: a near-miss and a respelling are reported. */
/** @param {any} api */
function pinExactText(api) {
  const original = recordSentenceText('components', 'state-filtered');
  const nearMiss = original.replace('rows matched', 'rows match');
  const drifted = copyOf(surfaceOf('components'));
  drifted.sentences = drifted.sentences.map(
    (/** @type {Sentence} */ sentence) =>
      sentence.key === 'state-filtered'
        ? { ...sentence, text: nearMiss }
        : sentence,
  );
  const answer = copyOf(
    api.copyCheck(copyOf([drifted]), copyOf(shippedDigest)),
  );
  assert.equal(
    answer.state,
    'unexplained',
    `a sentence is explained by the digest's own text and never by similarity, and this near-miss was explained: "${nearMiss}" (components)`,
  );
  assert.deepEqual(
    answer.unexplained,
    [{ string: nearMiss, surface: 'components' }],
    `the near-miss "${nearMiss}" is the one string the digest does not carry`,
  );

  const typographic = recordSentenceText('stability', 'unstable');
  const ascii = typographic.replace(/\u2019/g, "'");
  const respelled = {
    ...shippedDigest,
    entries: shippedDigest.entries.map(
      (
        /** @type {{surface: string, key: string|null, text: string}} */ entry,
      ) =>
        entry.surface === 'stability' && entry.key === 'unstable'
          ? { ...entry, text: ascii }
          : entry,
    ),
  };
  const apostrophe = copyOf(
    api.copyCheck(copyOf([surfaceOf('stability')]), copyOf(respelled)),
  );
  assert.equal(
    apostrophe.state,
    'unexplained',
    `a digest entry respelled with an ASCII apostrophe explains nothing, and this answered "${apostrophe.state}" for "${typographic}" (stability)`,
  );
  assert.deepEqual(
    apostrophe.unexplained,
    [{ string: typographic, surface: 'stability' }],
    'the sentence the pane renders is reported, and the digest’s respelling is not accepted in its place',
  );
}

/** The pin the digest-reading step is held to: it explains the digest's own texts and no others. */
/** @param {any} api */
function pinNoInventedRow(api) {
  const explained = copyOf(api.explainedTexts(copyOf(shippedDigest)));
  const declared = new Set(recordSentenceRows().map((row) => row.text));
  const invented = explained.filter((text) => !declared.has(text));
  assert.deepEqual(
    invented,
    [],
    `an invented row is not an explanation, and this module explains ` +
      (invented.length > 0
        ? `"${invented[0]}", which no surface in the record renders`
        : 'nothing it was not given'),
  );
  assert.deepEqual(
    explained,
    shippedDigest.entries.map(
      (/** @type {{text: string}} */ entry) => entry.text,
    ),
    'the module explains the digest’s own texts, in the digest’s order, and adds none of its own',
  );
  // The digest as shipped is held to the same rule: a row the record does not carry is invented
  // whatever wrote it.
  const unrendered = shippedDigest.entries
    .map(
      (
        /** @type {{surface: string, key: string|null, text: string}} */ entry,
      ) => entry,
    )
    .filter(
      (entry) =>
        !recordSentenceRows().some(
          (row) =>
            row.surface === entry.surface &&
            row.key === entry.key &&
            row.text === entry.text,
        ),
    );
  assert.deepEqual(
    unrendered,
    [],
    `the digest carries a row no surface renders: ${JSON.stringify(unrendered[0] ?? null)}`,
  );
}

/** The pin E4 is written about: no digest is cannot-tell, never clean. */
/** @param {any} api */
function pinNoDigestIsCannotTell(api) {
  const components = copyOf(surfaceOf('components'));
  for (const digest of [undefined, null, {}, { entries: [] }]) {
    const answer = copyOf(
      api.copyCheck(
        copyOf([components]),
        digest === undefined ? undefined : copyOf(digest),
      ),
    );
    assert.equal(
      answer.state,
      'cannot-tell',
      `a surface with strings and no digest reports cannot-tell with the reason "no-digest", because nobody compared the strings; this reported "${answer.state}"`,
    );
    assert.equal(
      answer.reason,
      'no-digest',
      `nothing to compare states the reason "no-digest", and this reported "${answer.reason}"`,
    );
    assert.equal(
      answer.checked,
      0,
      'nothing was compared, so nothing is counted as compared',
    );
    assert.deepEqual(
      answer.unexplained,
      [],
      'the absence of a comparison reports no string',
    );
  }
}

/** The pin each mutation is held to, by the mutation it exists for. */
const COPY_PINS = {
  'digest-entry-dropped': pinCleanOnTheRecord,
  'similarity-match': pinExactText,
  'invented-row': pinNoInventedRow,
  'missing-digest-reported-clean': pinNoDigestIsCannotTell,
};

test('T002 mutants — every anchor is one place in the shipped module and really changes it', () => {
  assert.ok(
    COPY_MUTATIONS.length === 4,
    'the four defects T002 names are armed',
  );
  for (const mutation of COPY_MUTATIONS) {
    assert.equal(
      COPY_SOURCE.split(mutation.anchor).length - 1,
      1,
      `mutation ${mutation.id} anchors on exactly one place in extension/copy-check.js`,
    );
    mutatedCopy(mutation);
    assert.equal(
      typeof COPY_PINS[mutation.id],
      'function',
      `mutation ${mutation.id} has a pin`,
    );
  }
});

test('T002 mutants — each defect reddens its pin, and the failure names the defect by string', () => {
  const lines = [];
  for (const mutation of COPY_MUTATIONS) {
    const pin = COPY_PINS[mutation.id];

    // The pin is green on the module as it sits on disk first, so a failure below is the mutation's
    // and not a pin that was already red — and a pin that never loaded the module would fail here.
    pin(loadCopy());

    let failure = null;
    try {
      pin(loadCopy(mutatedCopy(mutation)));
    } catch (error) {
      failure = /** @type {Error} */ (error);
    }
    assert.ok(
      failure !== null,
      `mutation ${mutation.id} must redden the pin that names it, and it reddened nothing`,
    );
    assert.match(
      failure.message,
      new RegExp(mutation.defect),
      `mutation ${mutation.id} must redden a pin naming "${mutation.defect}", and it said: ${failure.message.split('\n')[0]}`,
    );
    assert.ok(
      failure.message.includes(mutation.names),
      `mutation ${mutation.id} must redden naming "${mutation.names}", and it said: ${failure.message.split('\n')[0]}`,
    );
    lines.push(`${mutation.id}: ${failure.message.split('\n')[0]}`);
  }
  console.log(`T002 mutants: ${lines.join(' || ')}`);
});
