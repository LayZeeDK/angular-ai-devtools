// @ts-check
// Run: node --test scripts/chunk-failure-copy.test.mjs
//
// M064 T003 pins the chunk-failure surface (INTENT.md SC4, E8): the pane
// (`apps/angular-ai-devtools/src/app/panel-chunk-failure.ts`), the route and loader key that reach
// it, the sample fact the demo renders, and the copy the pane does not declare.
//
// The premise is the one this milestone is written against: a panel surface may render the seven
// fields the join answers with — `state`, `specifier`, `routePath`, `status`, `hash`,
// `consideredCount`, `reason` — and nothing beside them. So this suite holds the pane to five
// properties rather than to its own word:
//
//   1. The route, the loader key and the sample fact are the tree's: one entry of `PANEL_SURFACES`,
//      one `LOADERS` key pointing at this module, and a `FACTS` sample that is the shipped join's own
//      answer over the two attempts T001's recording carries — not a value written beside it.
//   2. The vocabulary is the join's: the four states and the seven fields the pane names are the
//      words the shipped join answers with, and every answer the record can produce reaches one of
//      the four.
//   3. Every line is a label the pane enumerates and a value the answer carries: a field the answer
//      does not carry renders no line at all, and a seventh field handed to the pane renders nothing
//      (E8 — no fix, no schematic, no cause, no identity it was not given).
//   4. A hash the record truncated renders truncated, two failures of one navigation render as two
//      rows in router order, and a request with no response renders its absence and never a 404
//      (E2, E3, E4).
//   5. The pane declares no sentence and reads no page: its code is scanned with comments stripped,
//      so the doc comments cannot hide a literal the digest would have to explain, and no module
//      read of the document, the network or a `import()` survives that scan (N2, N3).
//
// Every pin carries a mutant, applied in memory to a copy of the source it pins, that must redden it
// by name: a remedy sentence added to the pane (AC1, E8), the two rows collapsed onto the last (E2),
// the hash completed from the attempt's chunk filename (E4), and the loader key dropped from
// `panel-demo.ts` so the surface has a route and nothing to render (AC2, E6).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import ts from 'typescript';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** The pane this suite pins. */
const SURFACE = 'apps/angular-ai-devtools/src/app/panel-chunk-failure.ts';

/** The three files beside it: the route table, the loader map and the join. */
const ROUTES = 'apps/angular-ai-devtools/src/app/app.routes.ts';
const DEMO = 'apps/angular-ai-devtools/src/app/panel-demo.ts';
const JOIN = 'extension/chunk-failure.js';

/** The recording the sample fact and every state are read from. */
const RECORD = 'research/raw/m064-import-failure.json';

/** The surface's name, which is its route path, its `data.surface` and its `LOADERS` key. */
const SURFACE_NAME = 'chunk-failure';

/** The control file: a surface that declares copy, so a scan that went blind reddens below. */
const COPY_DECLARING_SURFACE =
  'apps/angular-ai-devtools/src/app/panel-components.ts';

/** The pane the suite pins, imported the way every panel surface is loaded by its own suite. */
const pane = await import(pathToFileURL(join(ROOT, SURFACE)).href);
const record = JSON.parse(readFileSync(join(ROOT, RECORD), 'utf8'));

/** One file's whole text, read once per call: a path the tree does not hold throws here. */
/** @param {string} path */
function sourceText(path) {
  return readFileSync(join(ROOT, path), 'utf8');
}

/** A value out of a vm realm, so two answers compare as data and not as prototypes. */
/** @param {unknown} value */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * The join `extension/chunk-failure.js` publishes, evaluated from its own committed text in a bare
 * realm: nothing of this suite's is in scope for it, which is what proves it reads no page and no
 * caller's global.
 */
function chunkFailureJoin() {
  const context = createContext({});
  runInContext(sourceText(JOIN), context);
  const api = context.angularAiChunkFailure;
  assert.equal(
    typeof api?.chunkFailure,
    'function',
    'extension/chunk-failure.js publishes chunkFailure on globalThis.angularAiChunkFailure',
  );
  return api.chunkFailure;
}

/**
 * The pane's own module, evaluated from a given source: the committed text for the green runs, a
 * mutated copy for the mutants, so a mutant is scanned and executed by the pin rather than by hope.
 * `typescript` is this repository's own dev dependency — `scripts/after-render-fixture.test.mjs`
 * transpiles the same way — and only the type syntax is stripped, so the code that runs is the code
 * the builder runs.
 * @param {string} source
 */
function loadPane(source) {
  const { outputText, diagnostics } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      isolatedModules: true,
    },
    fileName: SURFACE,
  });
  assert.deepEqual(
    (diagnostics ?? []).map((diagnostic) => diagnostic.messageText),
    [],
    'the pane must transpile without diagnostics',
  );
  const moduleRecord = { exports: {} };
  new Function('exports', 'module', outputText)(
    moduleRecord.exports,
    moduleRecord,
  );
  return moduleRecord.exports;
}

/** One mutation applied to a copy of a source, or a named failure when its anchor is gone. */
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
      ' mutation target is gone — restate the bite in scripts/chunk-failure-copy.test.mjs',
  );
  return mutated;
}

/** The failure a pin raises on a mutant, or a named failure when the mutant passed the pin. */
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

/**
 * One file's code with its comments stripped: the doc comments are prose and render nothing, so a
 * scan for rendered copy has to read the code and not the file.
 * @param {string} path
 */
function codeOf(path) {
  return sourceText(path)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
}

/**
 * What one literal the pane writes is: a `label` is a prefix a value is appended to — everything
 * after its `:` is an interpolation or nothing — a `word` is a single token, and a `sentence` is
 * anything with whitespace in it that is not a label.
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

/** The sentence-shaped literals one source writes, with its comments stripped. */
/** @param {string} source */
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

/** Every attempt the recording carries, in its own order. */
function recordedAttempts() {
  const attempts = record.samples.map(
    (/** @type {{attempt: unknown}} */ sample) => sample.attempt,
  );
  assert.ok(
    attempts.length >= 2,
    'the recording carries the attempts this suite is written over',
  );
  return attempts;
}

/** The two attempts the demo's sample fact is the join's answer over, in the recording's order. */
function sampleAttempts() {
  return recordedAttempts().slice(0, 2);
}

/**
 * The rows a pane renders, read the way a reader reads it: the blocks where the pane rendered its
 * parts apart, and the flat pane where there was one row to render.
 * @param {any} rendered
 */
function rowsOf(rendered) {
  return rendered.blocks.length > 0 ? rendered.blocks : [rendered];
}

/** Applies one mutation to the pane's source and loads the copy. */
/**
 * @param {string} defect
 * @param {string} anchor
 * @param {string} replacement
 */
function mutatedPane(defect, anchor, replacement) {
  return loadPane(mutate(sourceText(SURFACE), defect, anchor, replacement));
}

// ------------------------------------------------------------------ the entry ----

test('the route, the loader key and the sample fact are the tree’s, and the fact is the join’s own answer', () => {
  const routes = sourceText(ROUTES);
  const demo = sourceText(DEMO);

  const surfaces = routes.slice(
    routes.indexOf('const PANEL_SURFACES = ['),
    routes.indexOf('\n];', routes.indexOf('const PANEL_SURFACES = [')),
  );
  assert.equal(
    `${surfaces}\n`.split(`  '${SURFACE_NAME}',\n`).length - 1,
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

  const loaderEntry = `  '${SURFACE_NAME}': () => import('./panel-chunk-failure') as never,`;
  assert.equal(
    demo.split(loaderEntry).length - 1,
    1,
    `the demo carries exactly one LOADERS entry for ${SURFACE_NAME}, importing this module`,
  );

  // The sample fact is the join's own answer over the first two attempts, field for field.
  const expected = plain(chunkFailureJoin()(sampleAttempts()));
  const fact = plain(demoFact());
  assert.deepEqual(
    fact,
    expected,
    'the demo’s sample fact is the join’s own answer over the recording’s first two attempts',
  );
  for (const answer of fact) {
    for (const key of Object.keys(answer))
      assert.ok(
        [...pane.FIELDS].includes(key),
        `${key} is one of the seven fields the pane enumerates`,
      );
    assert.ok(
      [...pane.STATES].includes(answer.state),
      `${answer.state} is one of the four states the join answers`,
    );
    assert.equal(
      answer.consideredCount,
      2,
      'each answer states the two attempts it walked',
    );
  }
});

/**
 * The demo's `FACTS['chunk-failure']` value, read out of the committed demo source: the literal is
 * evaluated rather than imported, because the demo module carries Angular decorators and this suite
 * is a node one.
 */
function demoFact() {
  const demo = sourceText(DEMO);
  const marker = `FACTS['${SURFACE_NAME}'] = [`;
  const start = demo.indexOf(marker);
  assert.ok(start >= 0, 'the demo carries a sample fact for the surface');
  const end = demo.indexOf('\n];', start);
  assert.ok(end > start, 'the sample fact is one list literal');
  const block = demo.slice(start + marker.length - 1, end) + '\n]';
  return evalLiteral(block);
}

/** One JavaScript literal evaluated in a bare realm, so a fact is read rather than re-typed. */
/** @param {string} text */
function evalLiteral(text) {
  const context = createContext({});
  runInContext(`result = (${text});`, context);
  return context.result;
}

// ------------------------------------------------------------------ the pane ----

test('the four states and the seven fields are the words the shipped join answers with', () => {
  const join = chunkFailureJoin();
  const joinSource = sourceText(JOIN);

  assert.deepEqual(
    [...pane.STATES],
    ['missing-import', 'never-completed', 'resolved', 'cannot-tell'],
    'the pane enumerates the join’s four states, in the contract’s order',
  );
  assert.deepEqual(
    [...pane.FIELDS],
    [
      'state',
      'specifier',
      'routePath',
      'status',
      'hash',
      'consideredCount',
      'reason',
    ],
    'the pane enumerates the join’s seven fields, in the contract’s order',
  );
  for (const state of [...pane.STATES])
    assert.ok(
      joinSource.includes(`'${state}'`),
      `the join answers the state "${state}" the pane renders`,
    );

  // Every state is reachable from the record's own attempts, so the vocabulary is the whole of what
  // the pane must render rather than a list written beside it.
  const seen = new Set();
  for (const attempt of recordedAttempts()) {
    const answer = plain(join(attempt));
    assert.ok(
      [...pane.STATES].includes(answer.state),
      `${JSON.stringify(attempt)} answers "${answer.state}", which is one of the four states`,
    );
    for (const key of Object.keys(answer))
      assert.ok(
        [...pane.FIELDS].includes(key),
        `the join answers no field the pane does not enumerate: ${key}`,
      );
    seen.add(answer.state);
  }
  assert.deepEqual(
    [...seen].sort(),
    [...pane.STATES].sort(),
    'the recording reaches all four states, so the pane’s vocabulary is the whole of what it must render',
  );
});

test('every line is a label the pane enumerates and a value the answer carries, and a field it lacks renders no line', () => {
  const join = chunkFailureJoin();
  const labels = Object.values(pane.LABELS);
  const lineShape = new RegExp(`^(${labels.join('|')}): (.*)$`);

  for (const attempt of recordedAttempts()) {
    const answer = plain(join(attempt));
    const rendered = pane.chunkFailurePanel(answer);
    assert.equal(
      rendered.state,
      answer.state,
      'the pane renders the answer’s state',
    );
    assert.equal(
      rendered.kind,
      answer.state,
      'the pane names its own state as its kind',
    );
    assert.equal(
      rendered.text,
      rendered.lines.join('\n'),
      'the text is the lines joined',
    );
    for (const line of rowsOf(rendered).flatMap(
      (/** @type {any} */ row) => row.lines,
    )) {
      const match = lineShape.exec(line);
      assert.ok(
        match !== null,
        `every line is a label the pane enumerates and a value beside it; it rendered "${line}"`,
      );
      assert.ok(
        (match[2] ?? '').trim().length > 0,
        `a label with no value behind it is a blank line, and the pane renders none ("${line}")`,
      );
    }
    // A field the answer does not carry renders no line at all, and a field it does carry renders
    // exactly one — so the pane neither invents a value nor drops one.
    const fieldLabels = {
      specifier: pane.LABELS.specifier,
      routePath: pane.LABELS.routePath,
      status: pane.LABELS.status,
      hash: pane.LABELS.hash,
      consideredCount: pane.LABELS.consideredCount,
      reason: pane.LABELS.reason,
    };
    for (const [key, label] of Object.entries(fieldLabels)) {
      const lines = rendered.lines.filter((line) =>
        line.startsWith(`${label}: `),
      );
      assert.equal(
        lines.length,
        key in answer ? 1 : 0,
        `${key}: the ${label} line renders exactly where the answer carries one (${JSON.stringify(answer)})`,
      );
      if (key in answer)
        assert.equal(
          lines[0].slice(label.length + 2),
          valueSpelling(answer[key]),
          `${key}: the line prints the value the answer carries and no other`,
        );
    }
  }
});

/** A value as the pane spells it: an empty string as its own JSON, an object as its own JSON. */
/** @param {unknown} value */
function valueSpelling(value) {
  if (typeof value === 'string') return value === '' ? '""' : value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  return JSON.stringify(value);
}

test('a truncated hash renders truncated, two failures render two rows in router order, and no response is never a 404', () => {
  const join = chunkFailureJoin();
  const attempts = sampleAttempts();

  // E4: the hash the record carried is the hash the pane prints, to the byte, and no completion from
  // the attempt's own chunk filename is made — the specifier names that filename and the hash does
  // not.
  const withHash = record.samples.find(
    (/** @type {any} */ sample) => sample.attempt.hash !== undefined,
  );
  assert.ok(withHash, 'the recording carries an attempt whose hash it states');
  const resolved = plain(join(withHash.attempt));
  const resolvedPane = pane.chunkFailurePanel(resolved);
  assert.equal(resolved.state, 'resolved', 'a loaded import is a resolution');
  assert.deepEqual(
    resolvedPane.lines.filter((line) =>
      line.startsWith(`${pane.LABELS.hash}: `),
    ),
    [`${pane.LABELS.hash}: ${withHash.attempt.hash}`],
    'the hash line is the bytes the record carried, truncated where it truncated them',
  );
  assert.ok(
    withHash.attempt.hash.length < 64,
    'the recorded hash is a truncated one, which is the case this pin exists for',
  );

  // E3: a request that produced no status renders its own absence and no status line, and the word
  // 404 appears nowhere in the pane.
  const never = plain(join(attempts[1]));
  assert.equal(never.state, 'never-completed');
  const neverPane = pane.chunkFailurePanel(never);
  assert.equal(
    neverPane.lines.some((line) => line.startsWith(`${pane.LABELS.status}: `)),
    false,
    'a never-completed attempt renders no status line',
  );
  assert.equal(
    neverPane.lines.includes(`${pane.LABELS.reason}: no-response`),
    true,
    'the attempt names the one fact it knows',
  );
  assert.equal(
    neverPane.text.includes('404'),
    false,
    'the pane never writes a 404 it did not read',
  );

  // E2: two failures of one navigation are two rows, in the order the record holds them.
  const two = plain(join([attempts[0], attempts[1]]));
  const twoPane = pane.chunkFailurePanel(two);
  assert.equal(
    twoPane.blocks.length,
    2,
    'two answers render as two rows, not one',
  );
  assert.deepEqual(
    twoPane.blocks.map((/** @type {any} */ row) => row.state),
    ['missing-import', 'never-completed'],
    'the rows are in the order the router attempted them',
  );
  assert.deepEqual(
    twoPane.lines.filter((line) =>
      line.startsWith(`${pane.LABELS.specifier}: `),
    ),
    [
      `${pane.LABELS.specifier}: ${two[0].specifier}`,
      `${pane.LABELS.specifier}: ${two[1].specifier}`,
    ],
    'each row keeps its own specifier, and neither is lent the other’s',
  );

  // A seventh field on an answer renders nothing: the pane reads the seven fields and no other, so a
  // remedy smuggled in beside them has no label to appear under and no line to be printed on (E8).
  const smuggled = {
    ...plain(join(attempts[0])),
    remedy: 'fix the chunk by redeploying',
  };
  assert.deepEqual(
    pane.chunkFailurePanel(smuggled).lines,
    pane.chunkFailurePanel(plain(join(attempts[0]))).lines,
    'a seventh field on the answer adds no line to the pane',
  );
  assert.equal(
    pane.chunkFailurePanel(smuggled).text.includes('redeploy'),
    false,
    'the pane prints no value the seven fields do not carry',
  );
});

test('the pane declares no sentence and reads no page', () => {
  const scan = sentencesOf(sourceText(SURFACE));
  assert.deepEqual(
    scan,
    [],
    `the pane writes no sentence-shaped literal; it carries ${JSON.stringify(scan)}`,
  );
  // The control: the same scan finds the sentences a surface that declares copy carries, so a scan
  // that had gone blind would redden here rather than pass quietly.
  assert.ok(
    sentencesOf(sourceText(COPY_DECLARING_SURFACE)).length >= 5,
    'the same scan finds the sentences a surface declares',
  );

  const code = codeOf(SURFACE);
  for (const pattern of [
    /\bdocument\b/,
    /\bwindow\b/,
    /\bfetch\b/,
    /\bXMLHttpRequest\b/,
    /\bnavigator\b/,
    /\bperformance\b/,
    /\blocalStorage\b/,
    /\binnerText\b/,
    /\btextContent\b/,
    /\bimport\s*\(/,
  ])
    assert.equal(
      pattern.test(code),
      false,
      `the pane contains no page read and no import of its own: ${String(pattern)}`,
    );
});

// ------------------------------------------------------------------ the mutants ----

test('mutants redden by name: a remedy sentence, two rows collapsed, a hash completed, a loader key dropped', () => {
  // Green first, on the real files: a mutant that reddens a pin already red proves nothing.
  assert.deepEqual(sentencesOf(sourceText(SURFACE)), []);
  assert.equal(
    pane.chunkFailurePanel(
      plain(chunkFailureJoin()([sampleAttempts()[0], sampleAttempts()[1]])),
    ).blocks.length,
    2,
  );

  // AC1, E8: a remedy the join did not produce. A comment renders nothing, so the scan must not
  // redden for prose; the literal is the mutant that matters, because the pane would print it.
  const sentence = 'redeploy the chunk and clear the service worker cache';
  const anchor = 'export const MISSING_IMPORT';
  const withComment = mutate(
    sourceText(SURFACE),
    'a comment stating a remedy',
    anchor,
    `// ${sentence}\nexport const MISSING_IMPORT`,
  );
  assert.deepEqual(
    sentencesOf(withComment),
    [],
    'a sentence in a comment renders nothing and does not redden the scan',
  );
  const adviceSource = mutate(
    sourceText(SURFACE),
    'a remedy sentence',
    anchor,
    `export const PANE_ADVICE = '${sentence}';\nexport const MISSING_IMPORT`,
  );
  // The mutated copy loads, so the defect is a module that would ship, not a broken file.
  assert.equal(
    typeof loadPane(adviceSource).chunkFailurePanel,
    'function',
    'the remedy mutant is a module that still renders, which is what makes it a defect',
  );
  const adviceFailure = reddens(
    () =>
      assert.deepEqual(
        sentencesOf(adviceSource),
        [],
        `the pane writes no sentence-shaped literal; it carries ${JSON.stringify(sentencesOf(adviceSource))}`,
      ),
    'a remedy sentence',
  );
  assert.match(
    adviceFailure.message,
    /the pane writes no sentence-shaped literal/,
    'the remedy mutant must redden the no-sentence pin: ' +
      adviceFailure.message,
  );
  assert.match(
    adviceFailure.message,
    /redeploy the chunk/,
    'the remedy mutant must name the sentence it wrote: ' +
      adviceFailure.message,
  );

  // E2: the rows collapsed onto the last, which is the defect "both failures rendered as one" is.
  const collapsed = mutatedPane(
    'the rows collapsed onto the last',
    '    const rows = answer.map((entry) =>',
    '    const rows = answer.slice(-1).map((entry) =>',
  );
  const collapseFailure = reddens(
    () =>
      assert.equal(
        collapsed.chunkFailurePanel(
          plain(chunkFailureJoin()([sampleAttempts()[0], sampleAttempts()[1]])),
        ).blocks.length,
        2,
        'two answers render as two rows, not one',
      ),
    'the rows collapsed onto the last',
  );
  assert.match(
    collapseFailure.message,
    /two answers render as two rows, not one/,
    'the collapse mutant must redden naming the row it dropped: ' +
      collapseFailure.message,
  );

  // E4: the hash completed from the attempt's chunk filename — the defect a hash is written against.
  const completed = mutatedPane(
    'a hash completed from the filename',
    'function valueText(value: unknown): string {',
    "function valueText(value: unknown): string {\n  if (typeof value === 'string' && value.startsWith('sha256-') && value.length < 64)\n    return value + '0'.repeat(64 - value.length);",
  );
  const withHash = record.samples.find(
    (/** @type {any} */ sample) => sample.attempt.hash !== undefined,
  );
  assert.ok(withHash, 'the recording carries an attempt whose hash it states');
  const hashFailure = reddens(
    () =>
      assert.deepEqual(
        completed
          .chunkFailurePanel(plain(chunkFailureJoin()(withHash.attempt)))
          .lines.filter((/** @type {string} */ line) =>
            line.startsWith(`${pane.LABELS.hash}: `),
          ),
        [`${pane.LABELS.hash}: ${withHash.attempt.hash}`],
        'the hash line is the bytes the record carried, truncated where it truncated them',
      ),
    'a hash completed from the filename',
  );
  assert.match(
    hashFailure.message,
    /the hash line is the bytes the record carried/,
    'the hash mutant must redden naming the line it completed: ' +
      hashFailure.message,
  );

  // AC2, E6: the route without a loader key — the surface has a path and nothing to render.
  const demoSource = sourceText(DEMO);
  const withoutLoader = demoSource.replace(
    "  'chunk-failure': () => import('./panel-chunk-failure') as never,\n",
    '',
  );
  assert.notEqual(
    withoutLoader,
    demoSource,
    'the loader mutant must change panel-demo.ts',
  );
  const loaderFailure = reddens(
    () =>
      assert.equal(
        withoutLoader.split(
          "  'chunk-failure': () => import('./panel-chunk-failure') as never,",
        ).length - 1,
        1,
        `the demo carries exactly one LOADERS entry for ${SURFACE_NAME}, importing this module`,
      ),
    'the loader key dropped',
  );
  assert.match(
    loaderFailure.message,
    /the demo carries exactly one LOADERS entry for chunk-failure/,
    'the dropped-loader mutant must redden naming the key: ' +
      loaderFailure.message,
  );
  assert.ok(
    loaderFailure.message.includes(SURFACE_NAME),
    'the dropped-loader failure reads the surface it names: ' +
      loaderFailure.message,
  );
});
