/**
 * The companion package's one global: E4 (exactly one own string key differs), E5 (a second load
 * is a no-op that throws nothing), and the source rules that keep it that way (AC2, AC8; AR-3,
 * AR-6, N3, N7).
 *
 * Three properties decide the shape of this file.
 *
 * 1. **The writer is exercised without loading Angular.** `src/facade.ts` imports nothing, so the
 *    test compiles the package with its own `tsconfig.json` into a `mkdtempSync` directory and
 *    imports the emitted `facade.js` from there. Nothing is written into the checkout, and a
 *    package that stops compiling fails here rather than in a build nobody ran.
 * 2. **A key-count snapshot cannot tell a replacement from a no-op, and a symbol key is invisible
 *    to a string-key snapshot.** The probe therefore snapshots own string key names and own symbol
 *    keys separately before and after, and compares the entries across a second install with
 *    `Object.is` (SYNTHESIS.md decision 2).
 * 3. **The probe must bite.** The same `evaluateInstall` that the passing cases assert true is run
 *    against three deliberately broken writers — one that adds a second own string key, one that
 *    writes an own symbol key, one that replaces the object on a second install — and each is
 *    asserted to be rejected for its own reason. An assertion list that accepts a mutant is a
 *    weakened check (N6).
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** The package root and the repository root, resolved from this file — never a host path. */
const PACKAGE_ROOT = resolve(here, '..');
const REPO_ROOT = resolve(PACKAGE_ROOT, '..', '..');

const PACKAGE_JSON_PATH = join(PACKAGE_ROOT, 'package.json');
const PROJECT_JSON_PATH = join(PACKAGE_ROOT, 'project.json');
const TSCONFIG_PATH = join(PACKAGE_ROOT, 'tsconfig.json');
const SOURCE_ROOT = join(PACKAGE_ROOT, 'src');

/** The TypeScript entry point this checkout installs; driving it directly keeps the test
 * independent of PATH and of the shell. */
const TSC = join(REPO_ROOT, 'node_modules', 'typescript', 'bin', 'tsc');

/** The three peers the package may name, and the only dependency field it may carry. */
const PEER_DEPENDENCIES = ['@angular/core', '@angular/platform-browser', '@angular/router'];

/** The vetted vocabulary this milestone fixes (INTENT.md, the interface contract). */
const PACKAGE_VERSION = '0.2202.0';
const VETTED_ANGULAR_VERSION = '22.2.2';
const VETTED_SYMBOLS = [
  { pkg: '@angular/platform-browser', name: 'Meta' },
  { pkg: '@angular/router', name: 'Router' },
];

const ENTRY_KEY = 'ngAiDevTools';

// ---------------------------------------------------------------------------
// Building the writer into a temporary directory
// ---------------------------------------------------------------------------

function displayPath(absolutePath) {
  return relative(REPO_ROOT, absolutePath).split(sep).join('/');
}

/**
 * Compiles the package with its own tsconfig into a fresh temp directory and imports the emitted
 * `facade.js`. The emit flags mirror the `build` target's, so this also proves the same source
 * compiles under the declaration the project carries.
 */
async function compileWriter() {
  assert.ok(existsSync(TSC), `the facade test compiles with ${TSC}; a missing TypeScript would make every assertion below vacuous`);

  const temp = mkdtempSync(join(tmpdir(), 'companion-facade-'));
  assert.ok(temp.startsWith(tmpdir()), `the compile output must live under os.tmpdir(): ${temp}`);

  const result = spawnSync(
    process.execPath,
    [
      TSC,
      '-p',
      TSCONFIG_PATH,
      '--noEmit',
      'false',
      '--outDir',
      temp,
      '--declaration',
      'false',
      '--declarationMap',
      'false',
      '--sourceMap',
      'false',
    ],
    { cwd: REPO_ROOT, encoding: 'utf8', timeout: 300_000 },
  );
  assert.ok(!result.error, `the package compile must be runnable: ${result.error?.message ?? 'unknown spawn failure'}`);
  assert.equal(
    result.status,
    0,
    `the package's own tsconfig must compile before the writer can be exercised: ${String(result.stdout ?? '')}${String(result.stderr ?? '')}`,
  );
  assert.ok(existsSync(join(temp, 'facade.js')), 'the compile must emit facade.js into the temp directory');
  assert.ok(existsSync(join(temp, 'index.js')), 'the compile must emit index.js into the temp directory');

  // The emitted files are ESM; the temp directory carries no package.json of its own, so it says so.
  writeFileSync(join(temp, 'package.json'), `${JSON.stringify({ type: 'module' }, null, 2)}\n`, 'utf8');

  const module = await import(pathToFileURL(join(temp, 'facade.js')).href);
  return { module, temp };
}

const compiled = await compileWriter();
const { FACADE_KEY, installFacade } = compiled.module;

test.after(() => {
  rmSync(compiled.temp, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// The probe: snapshots, an install, and the problems it finds
// ---------------------------------------------------------------------------

let facadeCount = 0;

/** A shape-valid entry whose symbol values are distinguishable class objects. */
function makeFacade() {
  facadeCount += 1;
  return {
    version: PACKAGE_VERSION,
    '@angular/platform-browser': { Meta: class Meta {} },
    '@angular/router': { Router: class Router {} },
    // A tag the probe never reads: it exists only so two entries are never structurally equal.
    marker: facadeCount,
  };
}

function snapshotOwnKeys() {
  return {
    strings: Object.getOwnPropertyNames(globalThis),
    symbols: Object.getOwnPropertySymbols(globalThis),
  };
}

/**
 * Runs one install protocol — a first install, then a second one — and returns the problems found
 * rather than throwing, so the same function proves both the real writer and the mutants.
 */
function evaluateInstall(write) {
  const problems = [];
  const baseline = snapshotOwnKeys();
  const firstFacade = makeFacade();
  const secondFacade = makeFacade();

  let first;
  let second;
  let threw = null;
  try {
    first = write(firstFacade);
    second = write(secondFacade);
  } catch (error) {
    threw = error;
    problems.push('second-install-threw');
  }

  const after = snapshotOwnKeys();
  const addedStrings = after.strings.filter((key) => !baseline.strings.includes(key));
  const removedStrings = baseline.strings.filter((key) => !after.strings.includes(key));
  const addedSymbols = after.symbols.filter((symbol) => !baseline.symbols.includes(symbol));

  try {
    if (!threw) {
      if (addedStrings.length !== 1 || addedStrings[0] !== ENTRY_KEY) {
        problems.push('own-string-key-delta');
      }
      if (removedStrings.length !== 0) {
        problems.push('own-string-key-removed');
      }
      if (addedSymbols.length !== 0 || after.symbols.length !== baseline.symbols.length) {
        problems.push('own-symbol-keys');
      }
      if (!Object.is(second, first)) {
        problems.push('second-install-identity');
      }
      if (!Object.is(globalThis[ENTRY_KEY], first)) {
        problems.push('second-install-value');
      }
    }
  } finally {
    for (const key of addedStrings) {
      if (key !== ENTRY_KEY) {
        delete globalThis[key];
      }
    }
    for (const symbol of addedSymbols) {
      delete globalThis[symbol];
    }
    delete globalThis[ENTRY_KEY];
  }

  return {
    problems,
    addedStrings,
    removedStrings,
    addedSymbols,
    identity: !threw && Object.is(second, first),
  };
}

// ---------------------------------------------------------------------------
// E4 — exactly one own string key differs, no own symbol key does
// ---------------------------------------------------------------------------

test('the install adds exactly the one entry name to the own string keys and no own symbol key (E4)', () => {
  // A module-scope write would already be visible here: this assertion runs after the package's
  // module was imported (AC2's "never at module scope", observed rather than read).
  assert.equal(
    Object.hasOwn(globalThis, FACADE_KEY),
    false,
    'importing the package must write nothing: the only write belongs inside provideAiDevTools()',
  );

  const evaluation = evaluateInstall((facade) => installFacade(facade));
  assert.deepEqual(evaluation.problems, [], `the real writer must satisfy the probe: ${JSON.stringify(evaluation.problems)}`);
  assert.deepEqual(evaluation.addedStrings, [FACADE_KEY]);
  assert.deepEqual(evaluation.removedStrings, []);
  assert.deepEqual(evaluation.addedSymbols, []);
  assert.equal(evaluation.identity, true);

  console.log(
    `facade: own string key delta ${JSON.stringify(evaluation.addedStrings)}, ` +
      `removed ${JSON.stringify(evaluation.removedStrings)}, added symbol keys ${evaluation.addedSymbols.length}`,
  );
});

// ---------------------------------------------------------------------------
// E5 — a second load is a no-op that throws nothing
// ---------------------------------------------------------------------------

test('a second install returns the entry already in place, unchanged and throwing nothing (E5)', () => {
  const firstFacade = makeFacade();
  const secondFacade = makeFacade();
  const baseline = snapshotOwnKeys();

  delete globalThis[FACADE_KEY];
  const first = installFacade(firstFacade);
  let second;
  assert.doesNotThrow(() => {
    second = installFacade(secondFacade);
  });

  try {
    assert.equal(first, firstFacade, 'the first install returns the facade it wrote');
    assert.equal(second, firstFacade, 'the second install returns the existing entry, not its argument');
    assert.ok(Object.is(second, first), 'the two installs must return the same object');
    assert.ok(Object.is(globalThis[FACADE_KEY], firstFacade), 'the entry must be the first facade after both installs');

    const after = snapshotOwnKeys();
    assert.deepEqual(
      after.strings.filter((key) => !baseline.strings.includes(key)),
      [FACADE_KEY],
      'two installs add one own string key, not two',
    );
    assert.deepEqual(after.symbols, baseline.symbols, 'a second install adds no own symbol key');
  } finally {
    delete globalThis[FACADE_KEY];
  }

  console.log('facade: second install is a no-op, Object.is identity held, no throw');
});

// ---------------------------------------------------------------------------
// The probe bites — three mutants, three refusals
// ---------------------------------------------------------------------------

test('the probe rejects a second own string key, an own symbol key and a replaced entry (N6)', () => {
  const mutants = [
    {
      name: 'a second own string key',
      reason: 'own-string-key-delta',
      write: (facade) => {
        const installed = installFacade(facade);
        globalThis.ngAiDevToolsExtra = true;
        return installed;
      },
    },
    {
      name: 'an own symbol key',
      reason: 'own-symbol-keys',
      write: (facade) => {
        const installed = installFacade(facade);
        globalThis[Symbol.for('ngAiDevTools')] = true;
        return installed;
      },
    },
    {
      name: 'a replacement on the second install',
      reason: 'second-install-identity',
      write: (facade) => {
        globalThis[FACADE_KEY] = facade;
        return facade;
      },
    },
  ];

  for (const mutant of mutants) {
    const evaluation = evaluateInstall(mutant.write);
    assert.ok(
      evaluation.problems.includes(mutant.reason),
      `the probe must reject ${mutant.name} for ${mutant.reason}; found ${JSON.stringify(evaluation.problems)}`,
    );
  }

  console.log(`facade: probe rejected ${mutants.length} mutants for ${JSON.stringify(mutants.map((mutant) => mutant.reason))}`);
});

// ---------------------------------------------------------------------------
// AC2 / AC8 — the write's shape, and the names the package may not use
// ---------------------------------------------------------------------------

/** Every `.ts` file under `src/`, sorted. */
function sourceFiles(directory = SOURCE_ROOT) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...sourceFiles(path));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      found.push(path);
    }
  }
  return found.sort();
}

/** A source file's executable text — comments dropped, so prose that names a forbidden API (as
 * this package's own comments do) cannot satisfy or violate a rule about code. */
function codeOf(path) {
  const text = readFileSync(path, 'utf8');
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
    if (character === "'" || character === '"' || character === '`') {
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
      while (index < text.length && !(text[index] === '*' && text[index + 1] === '/')) {
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

test('the package writes its one global from inside provideAiDevTools() under isDevMode() (AC2)', () => {
  const sources = sourceFiles();
  assert.deepEqual(
    sources.map((path) => relative(SOURCE_ROOT, path).split(sep).join('/')),
    ['facade.ts', 'index.ts', 'vetted.ts'],
    'the package carries exactly the three source modules the declaration lists',
  );

  const facadeCode = codeOf(join(SOURCE_ROOT, 'facade.ts'));
  const indexCode = codeOf(join(SOURCE_ROOT, 'index.ts'));
  const allCode = sources.map(codeOf).join('\n');

  // One property assignment in the whole package, spelled with the member the contract names.
  const assignments = allCode.match(/globalThis\s*\.\s*ngAiDevTools\s*=/g) ?? [];
  assert.equal(assignments.length, 1, `the package must hold exactly one global property assignment; found ${assignments.length}`);

  // It lives inside the writer function, not at module scope.
  const writerStart = facadeCode.indexOf('export function installFacade');
  assert.ok(writerStart >= 0, 'facade.ts must export installFacade');
  const assignmentIndex = facadeCode.search(/globalThis\s*\.\s*ngAiDevTools\s*=/);
  assert.ok(assignmentIndex > writerStart, 'the one assignment must sit inside installFacade, never at module scope');

  // The call is guarded by isDevMode() and lives in the provider the app installs.
  assert.match(
    indexCode,
    /export function provideAiDevTools\(\)\s*:\s*Provider\[\]\s*\{/,
    'index.ts must export provideAiDevTools() returning the provider list',
  );
  assert.match(
    indexCode,
    /if \(isDevMode\(\)\) \{\s*installFacade\(facade\);\s*\}/,
    'the install must be the guarded body of isDevMode() inside provideAiDevTools()',
  );
  assert.equal(
    (indexCode.match(/installFacade\(/g) ?? []).length,
    1,
    'provideAiDevTools() must be the only caller of the writer in index.ts',
  );
  assert.match(indexCode, /from '@angular\/core'/);

  console.log(`facade: one assignment at facade.ts:${assignmentIndex}, guarded call in provideAiDevTools()`);
});

test('the package uses no DOM API, no page dialog, no defineProperty, no forwardRef and no other global (AC8)', () => {
  const allCode = sourceFiles().map(codeOf).join('\n');

  const forbidden = [
    ['a DOM document read', /\bdocument\s*[.[]/],
    ['a window read', /\bwindow\s*[.[]/],
    ['a DOM query', /\bquerySelector(All)?\s*\(/],
    ['an element creation', /\bcreateElement\s*\(/],
    ['an event listener', /\baddEventListener\s*\(/],
    ['a page alert', /\balert\s*\(/],
    ['a page confirm', /\bconfirm\s*\(/],
    ['a page prompt', /\bprompt\s*\(/],
    ['web storage', /\b(localStorage|sessionStorage)\b/],
    ['an object property definition', /\bdefineProperty\b/],
    ['a symbol-keyed global', /\bSymbol\s*\.\s*for\b/],
    ['the impurity-prone identifier this builder marks pure', /\bforwardRef\b/],
  ];
  for (const [what, pattern] of forbidden) {
    assert.equal(pattern.test(allCode), false, `the package must not contain ${what}: ${pattern}`);
  }

  // Every global name the code touches, spelled out: one read of the entry, one write of it.
  const globals = [...allCode.matchAll(/\bglobalThis\s*(?:\.\s*([A-Za-z_$][\w$]*)|\[\s*'([^']+)'\s*\])/g)].map(
    (match) => match[1] ?? match[2],
  );
  assert.deepEqual([...new Set(globals)], ['ngAiDevTools'], `the package may touch one global name; touched ${JSON.stringify(globals)}`);

  console.log(`facade: no DOM, no dialog, no defineProperty, no forwardRef; globalThis names touched: ${JSON.stringify([...new Set(globals)])}`);
});

// ---------------------------------------------------------------------------
// The vetted table and the package's declarations
// ---------------------------------------------------------------------------

test('the vetted table is executable code carrying exactly the two symbols, and the package declares its shape (AC1)', () => {
  const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  assert.equal(packageJson.name, 'ai-devtools-companion');
  assert.equal(packageJson.version, PACKAGE_VERSION);
  assert.equal(packageJson.private, true, 'the package stays unpublished');
  assert.equal(packageJson.type, 'module');
  assert.equal('dependencies' in packageJson, false, 'the package may carry no dependencies field at all');
  assert.deepEqual(
    Object.keys(packageJson.peerDependencies ?? {}).sort(),
    [...PEER_DEPENDENCIES].sort(),
    'the three @angular peers, and no other peer',
  );
  for (const peer of PEER_DEPENDENCIES) {
    assert.equal(typeof packageJson.peerDependencies[peer], 'string', `${peer} must carry a version range`);
  }
  assert.equal(packageJson.exports['.'].default, './dist/index.js', 'the entry point is the file under the package dist');
  assert.equal(packageJson.exports['.'].types, './dist/index.d.ts');

  const projectJson = JSON.parse(readFileSync(PROJECT_JSON_PATH, 'utf8'));
  assert.equal(projectJson.name, 'ai-devtools-companion');
  assert.equal(projectJson.root, 'packages/ai-devtools-companion');
  const build = projectJson.targets?.build;
  assert.ok(build, 'project.json must declare a build target');
  assert.match(build.options?.command ?? '', /^tsc -p packages\/ai-devtools-companion\/tsconfig\.json/, 'the build target runs the package tsc');
  assert.match(build.options?.command ?? '', /--outDir packages\/ai-devtools-companion\/dist/, 'the build target writes the package dist');
  assert.deepEqual(build.outputs, ['{projectRoot}/dist'], 'the build target declares its own dist as its output');

  const tsconfig = JSON.parse(readFileSync(TSCONFIG_PATH, 'utf8').replace(/^\uFEFF/, '').replace(/^\s*\/\/.*$/gm, ''));
  assert.equal(tsconfig.compilerOptions?.noEmit, true, 'the shared tsconfig must emit nothing on its own, so the check stage writes no build output');
  assert.equal(tsconfig.compilerOptions?.outDir, 'dist');
  assert.deepEqual(tsconfig.include, ['src/**/*.ts']);

  // The table: real class imports, the two groups and no others, versioned by the package.
  const vettedCode = codeOf(join(SOURCE_ROOT, 'vetted.ts'));
  assert.match(vettedCode, /import \{ Meta \} from '@angular\/platform-browser';/);
  assert.match(vettedCode, /import \{ Router \} from '@angular\/router';/);
  assert.match(vettedCode, new RegExp(`export const PACKAGE_VERSION = '${PACKAGE_VERSION}';`));
  assert.match(vettedCode, new RegExp(`export const VETTED_ANGULAR_VERSION = '${VETTED_ANGULAR_VERSION}';`));
  const groups = [...vettedCode.matchAll(/'(@angular\/[a-z-]+)': \{/g)].map((match) => match[1]).sort();
  assert.deepEqual(groups, VETTED_SYMBOLS.map((symbol) => symbol.pkg).sort(), 'exactly the two vetted groups');
  for (const symbol of VETTED_SYMBOLS) {
    assert.match(vettedCode, new RegExp(`'${symbol.pkg}': \\{ ${symbol.name} \\}`), `the entry must carry ${symbol.pkg}#${symbol.name}`);
  }
  assert.equal(
    /from '[^']*\.json'/.test(vettedCode),
    false,
    'the table must not be generated data: a data file can only carry names',
  );
  const angularImports = [...vettedCode.matchAll(/from '(@angular\/[a-z-]+)'/g)].map((match) => match[1]).sort();
  assert.deepEqual(angularImports, [VETTED_SYMBOLS[0].pkg, VETTED_SYMBOLS[1].pkg].sort(), 'the table imports its peers and nothing else');

  console.log(
    `facade: package ${packageJson.name}@${packageJson.version}, peers ${JSON.stringify(Object.keys(packageJson.peerDependencies).sort())}, ` +
      `vetted ${VETTED_SYMBOLS.map((symbol) => `${symbol.pkg}#${symbol.name}`).join(', ')} against Angular ${VETTED_ANGULAR_VERSION}`,
  );
});

/** The package's manifest is also read for the dist it never tracks: the entry point a consumer
 * resolves must be the emitted file, and the tracked tree must not carry a second copy of it. */
test('the package exposes its dist entry and nothing in the package root shadows it', () => {
  const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  const entry = resolve(PACKAGE_ROOT, packageJson.exports['.'].default.replace('./', ''));
  assert.ok(entry.startsWith(join(PACKAGE_ROOT, 'dist')), `the exported entry must live under the package's dist: ${displayPath(entry)}`);
  assert.equal(/node_modules/.test(displayPath(entry)), false);
});
