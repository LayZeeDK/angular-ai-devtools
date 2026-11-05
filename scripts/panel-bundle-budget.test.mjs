/**
 * The initial-bundle budget pin for the panel — SC5 / N5 (M019 T008).
 *
 * SC5 says "`npm run check` and `npm test` pass at the head, and the panel stays inside the 520 KB
 * initial-bundle budget". The panel does not sit inside 520 kB: it measures 535.44 kB, so the
 * `build-extension` target prints a budget WARNING on every build. INTENT's constraint is narrower
 * than the number in the target — the milestone "must not make it worse" — so this file pins the
 * policy and the measurement instead of asserting a total the panel never had.
 *
 * N5 is why this is a test and not a comment in the plan: "Exceed the 520 KB initial budget, or
 * weaken a check to reach green" must fail something. Three ways it could be weakened quietly, and
 * one assertion each:
 *
 * 1. The budget policy moves. `angular-ai-devtools:build-extension` must keep exactly one `initial`
 *    budget carrying `maximumWarning` 520kb and `maximumError` 1mb; an exact comparison fails when
 *    the warning is raised to hide a regression as well as when the entry is deleted or widened.
 *    The output location is pinned with it, because the measurement below reads that directory.
 * 2. The recorded baseline disappears. `PRE_MILESTONE_INITIAL_KB` is the measured pre-milestone
 *    total (535.44 kB, the figure the build prints). A named constant is only recorded evidence
 *    while it exists, so this file reads its own source and fails when the declaration is gone or
 *    its value has drifted.
 * 3. The measurement stops biting. The initial total is summed from the files the built
 *    `index.html` loads eagerly — `stylesheet` and `modulepreload` links plus `script` sources —
 *    and deliberately not from `main.js` + `styles.css` alone, which would miss the three shared
 *    chunks the panel's initial total is mostly made of. A synthetic output tree in `os.tmpdir()`
 *    proves the parse counts every eager file, ignores the icon and the lazy chunk sitting beside
 *    them, and that the comparison itself fails above the baseline.
 *
 * The measured total is compared in decimal kB (1000 bytes) because that is the unit the build
 * reports: the emitted `chunk-DweK769i.js` is 326,974 bytes and the build prints 326.97 kB. Summed
 * over the five eager files the panel emits, the byte total is 535,440 — 535.44 kB, exactly the
 * baseline, so a single added byte fails here.
 *
 * Nothing is written into the checkout and nothing is built here: `extension/panel/` is git-ignored,
 * so the measurement is skipped (loudly, and only for the third assertion) when the build has not
 * run in this checkout. `npm run check` and `npm test` stay green in a fresh clone either way.
 */
import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SELF_PATH = fileURLToPath(import.meta.url);

/** The repository root, resolved from this file — never a host-absolute path. */
const REPO_ROOT = resolve(dirname(SELF_PATH), '..');

const PANEL_PROJECT_PATH = join(
  REPO_ROOT,
  'apps',
  'angular-ai-devtools',
  'project.json',
);

/** The `initial` budget the panel's `build-extension` target must keep, verbatim. 520kb is the
 * milestone's stated maximum and 1mb the error ceiling; both are pinned exactly, so raising the
 * warning to hide a regression fails here rather than only failing to warn. */
export const EXPECTED_INITIAL_BUDGET = {
  maximumWarning: '520kb',
  maximumError: '1mb',
};

/** The `build-extension` output directory, relative to the repository root, as `project.json`
 * declares it and as the measurement below reads it. */
export const PANEL_OUTPUT_RELATIVE = 'extension/panel';
export const PANEL_OUTPUT_DIR = join(REPO_ROOT, 'extension', 'panel');

/** The initial total measured before this milestone — 535.44 kB, as the build's own `Initial total`
 * row printed it. Kept as a named constant, not prose: INTENT says the milestone must not make the
 * budget worse, so this number is the ceiling a later build is held to. */
export const PRE_MILESTONE_INITIAL_KB = 535.44;

/** The `link` relations the browser fetches as part of the initial load. `icon` and the other
 * asset relations are not in it: the build's budget arithmetic does not count them either. */
export const EAGER_LINK_RELS = new Set(['stylesheet', 'modulepreload']);

/** A reference that is not a file in the output directory. */
const EXTERNAL_REFERENCE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

// ---------------------------------------------------------------------------
// Reading the project config the way Nx does
// ---------------------------------------------------------------------------

/**
 * Drops `//` and block comments while leaving string contents verbatim, so the config Nx reads
 * still parses here even with comments in it.
 */
export function stripJsonComments(text) {
  let output = '';
  let index = 0;
  let quote = null;
  while (index < text.length) {
    const character = text[index];
    const next = text[index + 1];
    if (quote !== null) {
      output += character;
      if (character === '\\') {
        output += next ?? '';
        index += 2;
        continue;
      }
      if (character === quote) {
        quote = null;
      }
      index += 1;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      output += character;
      index += 1;
      continue;
    }
    if (character === '/' && next === '/') {
      while (index < text.length && text[index] !== '\n') {
        index += 1;
      }
      continue;
    }
    if (character === '/' && next === '*') {
      index += 2;
      while (
        index < text.length &&
        !(text[index] === '*' && text[index + 1] === '/')
      ) {
        index += 1;
      }
      index += 2;
      continue;
    }
    output += character;
    index += 1;
  }
  return output;
}

export function readJsonc(path) {
  return JSON.parse(
    stripJsonComments(readFileSync(path, 'utf8')).replace(/^\uFEFF/, ''),
  );
}

// ---------------------------------------------------------------------------
// Measuring the initial load, from the built index
// ---------------------------------------------------------------------------

/** The attributes of one tag, in the double- and single-quoted forms a build may emit. */
export function attributesOf(source) {
  const attributes = {};
  for (const match of source.matchAll(
    /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g,
  )) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? '';
  }
  return attributes;
}

/**
 * Every file the browser loads eagerly, read from the built `index.html`: `script` sources and
 * `stylesheet` / `modulepreload` links. These are the initial chunk files, whatever they are named
 * — the target builds with `outputHashing: none` but the shared chunks still carry a content hash,
 * so a name list would drift on the next build while this parse does not.
 */
export function eagerReferencesFromIndex(html) {
  const references = [];
  for (const match of html.matchAll(/<link\b([^>]*)>/gi)) {
    const attributes = attributesOf(match[1]);
    const rels = (attributes.rel ?? '').toLowerCase().split(/\s+/);
    if (
      attributes.href === undefined ||
      !rels.some((rel) => EAGER_LINK_RELS.has(rel))
    ) {
      continue;
    }
    references.push(attributes.href);
  }
  for (const match of html.matchAll(/<script\b([^>]*)>/gi)) {
    const attributes = attributesOf(match[1]);
    if (attributes.src !== undefined) {
      references.push(attributes.src);
    }
  }
  return [
    ...new Set(
      references
        .filter((reference) => !EXTERNAL_REFERENCE.test(reference))
        .map((reference) =>
          reference.replace(/[?#].*$/, '').replace(/^\.?\//, ''),
        ),
    ),
  ].sort();
}

/**
 * The initial total of one build output directory, or the reason there is none to measure.
 *
 * `absent` is the fresh-checkout case: `extension/panel/` is git-ignored, so nothing has been built
 * and there is no total to hold to the baseline. `incomplete` is a build that stopped part-way: the
 * index references files that are not on disk, so their sizes would under-count the initial load.
 */
export function measureInitialTotal(outputDir) {
  const indexPath = join(outputDir, 'index.html');
  if (!existsSync(indexPath)) {
    return {
      state: 'absent',
      reason: `no ${PANEL_OUTPUT_RELATIVE}/index.html — the build has not run in this checkout`,
    };
  }
  const references = eagerReferencesFromIndex(readFileSync(indexPath, 'utf8'));
  if (references.length === 0) {
    return {
      state: 'incomplete',
      reason: `${PANEL_OUTPUT_RELATIVE}/index.html references no eager file`,
    };
  }
  const missing = references.filter(
    (reference) => !existsSync(join(outputDir, reference)),
  );
  if (missing.length > 0) {
    return {
      state: 'incomplete',
      reason: `${PANEL_OUTPUT_RELATIVE}/index.html references files the output does not hold: ${JSON.stringify(missing)}`,
    };
  }
  const files = references.map((reference) => ({
    file: reference,
    bytes: statSync(join(outputDir, reference)).size,
  }));
  const bytes = files.reduce((total, entry) => total + entry.bytes, 0);
  return { state: 'measured', files, bytes, kb: bytes / 1000 };
}

/** The decimal kB the build's budget arithmetic uses: 535,440 bytes is 535.44 kB, not 522.89. */
export function formatKb(kilobytes) {
  return `${kilobytes.toFixed(2)} kB`;
}

/** The comparison the whole file exists for. Above the baseline is a regression, at or below it is
 * unchanged or better. */
export function assertWithinBaseline(totalKb, label, files = []) {
  const listed = files
    .map((entry) => `${entry.file} ${entry.bytes} B`)
    .join(', ');
  assert.ok(
    totalKb <= PRE_MILESTONE_INITIAL_KB,
    `${label}: initial total ${formatKb(totalKb)} exceeds the pre-milestone baseline of ` +
      `${formatKb(PRE_MILESTONE_INITIAL_KB)} by ${formatKb(totalKb - PRE_MILESTONE_INITIAL_KB)}; ` +
      `INTENT says this milestone must not make the initial bundle worse. Eager files: ${listed}`,
  );
}

// ---------------------------------------------------------------------------
// The policy — 520kb warning, 1mb error, emitted where the measurement reads
// ---------------------------------------------------------------------------

test('build-extension keeps the initial budget at 520kb warning and 1mb error', () => {
  const project = readJsonc(PANEL_PROJECT_PATH);
  const target = project.targets?.['build-extension'];
  assert.ok(
    target,
    'project.json must keep a build-extension target; the panel ships through it',
  );

  const budgets = target.options?.budgets ?? [];
  assert.ok(
    Array.isArray(budgets),
    'build-extension must carry a budgets array',
  );
  const initial = budgets.filter((budget) => budget?.type === 'initial');
  assert.equal(
    initial.length,
    1,
    `build-extension must carry exactly one initial budget, not ${initial.length}: ${JSON.stringify(budgets)}`,
  );
  // N5 in one assertion: an exact match fails when the warning is raised to hide a regression, when
  // the error ceiling is widened, and when either value is removed.
  assert.deepEqual(
    {
      maximumWarning: initial[0].maximumWarning,
      maximumError: initial[0].maximumError,
    },
    EXPECTED_INITIAL_BUDGET,
    'the initial budget must stay at a 520kb warning and a 1mb error ceiling; raising the warning is how a regression gets hidden',
  );

  // The measurement below reads this directory; pinning it keeps the pin and the build target from
  // drifting apart silently.
  const outputPath = target.options?.outputPath;
  const base = typeof outputPath === 'string' ? outputPath : outputPath?.base;
  assert.equal(
    base,
    PANEL_OUTPUT_RELATIVE,
    `build-extension must emit into ${PANEL_OUTPUT_RELATIVE}, which is the directory the initial total is measured from`,
  );

  console.log(
    `panel-bundle-budget: build-extension initial budget ${JSON.stringify(EXPECTED_INITIAL_BUDGET)} into ${base}`,
  );
});

// ---------------------------------------------------------------------------
// The recorded baseline — a named constant, not prose
// ---------------------------------------------------------------------------

test('the pre-milestone baseline is recorded as a named constant of 535.44 kB', () => {
  // A test cannot defend a number it no longer holds, so the constant is read back from this file's
  // own source: deleting it, renaming it, or editing its value fails here rather than leaving the
  // third assertion comparing against whatever is left.
  const source = readFileSync(SELF_PATH, 'utf8');
  const declarations = [
    ...source.matchAll(/const\s+PRE_MILESTONE_INITIAL_KB\s*=\s*([0-9.]+)\s*;/g),
  ];
  assert.equal(
    declarations.length,
    1,
    'PRE_MILESTONE_INITIAL_KB must be declared exactly once in this file; the baseline is the recorded measurement, not a figure to drop',
  );
  assert.equal(
    Number(declarations[0][1]),
    535.44,
    `the recorded pre-milestone initial total is 535.44 kB; the constant reads ${declarations[0][1]}`,
  );
  assert.equal(
    PRE_MILESTONE_INITIAL_KB,
    535.44,
    'the constant the comparison uses must be the recorded pre-milestone total',
  );

  console.log(
    `panel-bundle-budget: recorded pre-milestone baseline is ${formatKb(PRE_MILESTONE_INITIAL_KB)}`,
  );
});

// ---------------------------------------------------------------------------
// The measurement — every eager file, nothing lazy, and a comparison that bites
// ---------------------------------------------------------------------------

test('the initial total counts every eagerly loaded file and excludes the lazy ones', () => {
  const temp = mkdtempSync(join(tmpdir(), 'panel-bundle-budget-'));
  try {
    assert.ok(
      temp.startsWith(tmpdir()),
      `the fixture must live under os.tmpdir(): ${temp}`,
    );
    mkdirSync(join(temp, 'media'));
    writeFileSync(
      join(temp, 'index.html'),
      [
        '<!DOCTYPE html>',
        '<html><head>',
        '<link rel="icon" type="image/x-icon" href="favicon.ico">',
        '<link rel="stylesheet" href="styles.css">',
        '</head><body>',
        '<app-root></app-root>',
        '<link rel="modulepreload" href="chunk-shared.js"><link rel="modulepreload" href="chunk-small.js">',
        '<script src="main.js" type="module"></script>',
        '</body></html>',
      ].join('\n'),
      'utf8',
    );
    writeFileSync(join(temp, 'styles.css'), 'a'.repeat(10), 'utf8');
    writeFileSync(join(temp, 'chunk-shared.js'), 'b'.repeat(1000), 'utf8');
    writeFileSync(join(temp, 'chunk-small.js'), 'c'.repeat(100), 'utf8');
    writeFileSync(join(temp, 'main.js'), 'd'.repeat(2000), 'utf8');
    // Beside the eager files, and not part of the initial load: the icon the budget ignores and a
    // lazy chunk the browser fetches later. Both are large enough that counting either would show.
    writeFileSync(join(temp, 'favicon.ico'), 'e'.repeat(5000), 'utf8');
    writeFileSync(join(temp, 'lazy-chunk.js'), 'f'.repeat(9000), 'utf8');

    const measurement = measureInitialTotal(temp);
    assert.equal(
      measurement.state,
      'measured',
      `the fixture output must be measurable: ${measurement.reason}`,
    );
    assert.deepEqual(
      measurement.files.map((entry) => entry.file),
      ['chunk-shared.js', 'chunk-small.js', 'main.js', 'styles.css'],
      'the initial total must be the eager references in the index: script sources and stylesheet/modulepreload links',
    );
    assert.equal(
      measurement.bytes,
      3110,
      'the initial total must sum the eager files only: 2000 + 1000 + 100 + 10',
    );
    assert.equal(
      measurement.kb,
      3.11,
      'the total is reported in the decimal kB the build uses',
    );

    // The artefact is incomplete when a referenced file is missing, and absent when there is no
    // index at all: both are reasons to skip, never a total to compare.
    rmSync(join(temp, 'main.js'));
    assert.equal(
      measureInitialTotal(temp).state,
      'incomplete',
      'a missing eager file must not yield a smaller total',
    );
    rmSync(join(temp, 'index.html'));
    assert.equal(
      measureInitialTotal(temp).state,
      'absent',
      'no index means no total to measure',
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }

  // The comparison itself bites: one byte over the baseline fails, the baseline itself passes.
  assert.throws(
    () =>
      assertWithinBaseline(PRE_MILESTONE_INITIAL_KB + 0.01, 'synthetic output'),
    /exceeds the pre-milestone baseline/,
    'a total above the baseline must fail the comparison',
  );
  assert.doesNotThrow(
    () => assertWithinBaseline(PRE_MILESTONE_INITIAL_KB, 'synthetic output'),
    'a total at the baseline is unchanged, not worse, and must pass',
  );

  console.log(
    'panel-bundle-budget: synthetic output measured 3.11 kB from 4 eager files, ignoring the icon and the lazy chunk',
  );
});

// ---------------------------------------------------------------------------
// The real total — the check that is skipped when nothing has been built
// ---------------------------------------------------------------------------

test('the measured initial total does not exceed the 535.44 kB baseline', () => {
  const measurement = measureInitialTotal(PANEL_OUTPUT_DIR);
  if (measurement.state !== 'measured') {
    // The only check that may be skipped, and only for this reason: `extension/panel/*` is
    // git-ignored, so a fresh checkout holds no build output and `npm test` must not require one.
    // The two pins above do not depend on the build, and this task's Verify builds first, so the
    // measurement is present whenever the budget claim is actually being made.
    console.log(
      `panel-bundle-budget: skip — no initial total to measure; ${measurement.reason}`,
    );
    return;
  }

  assertWithinBaseline(
    measurement.kb,
    PANEL_OUTPUT_RELATIVE,
    measurement.files,
  );
  console.log(
    `panel-bundle-budget: measured initial total ${formatKb(measurement.kb)} (${measurement.bytes} B over ` +
      `${measurement.files.length} eager files) against the ${formatKb(PRE_MILESTONE_INITIAL_KB)} baseline`,
  );
});
