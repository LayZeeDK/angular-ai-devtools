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
// It does not test T002's join. No copy digest and no join exist at this head — this record is the
// measurement they will be authored against — so the last test here holds the record's own
// statement of that boundary and nothing about a file T002 will add.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

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
