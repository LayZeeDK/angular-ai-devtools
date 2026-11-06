/**
 * The reach guard for the page-read port — E4 / N2 (M018).
 *
 * SC3 says `app_facts` and the five read wrappers are reachable through the registry "and no caller
 * reaches around it". A convention cannot be observed, so this file makes it an observation: it
 * walks `apps/angular-ai-devtools/src/**\/*.ts`, reads every static `from '…'`, `export … from '…'`
 * and dynamic `import('…')` specifier, resolves the relative ones against the file that wrote them,
 * and reports every file that resolves to `page-reads.ts` outside the allowlist.
 *
 * The allowlist is exactly two files: `read-tools.ts` (the registration) and its spec. Anything
 * else — a component, a service, a future explainer — fails the check with its file and specifier.
 *
 * Two properties this check is built to keep:
 *
 * 1. **It cannot be vacuous.** The real-tree run prints the allowlist it accepted and the number of
 *    files it scanned, and asserts that count is greater than zero and that the page-reads module
 *    exists. A check that scanned nothing, or resolved against a module that is not there, fails
 *    instead of passing quietly.
 * 2. **It is the same code path for the fixture and the repository.** `checkRegistryReach(root)` is
 *    a function of a root, so E4's temporary fixture tree under `os.tmpdir()` and the real checkout
 *    run the identical scanner. The fixture is the red side: a module importing a page reader
 *    directly is reported, while the same module going through `TOOL_REGISTRY` passes.
 *
 * N2 is the second half: `tool-registry.ts` must neither import nor re-export the page-reads module
 * and must not export any of the five reader names or `PAGE_HOST`. An export from the registry's
 * own module would let a caller bypass the execute path while still "importing through the
 * registry", which is exactly the vacuous pass the criterion forbids.
 *
 * Nothing here writes into the checkout: fixtures are built under `os.tmpdir()` and removed in a
 * `finally`, and the real tree is only read.
 */
import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** The repository root, resolved from this file — never a host-absolute path. */
export const REPO_ROOT = resolve(here, '..');

/** Where the application's TypeScript lives, relative to a root. */
const SOURCE_ROOT = ['apps', 'angular-ai-devtools', 'src'];

/** The module this milestone's guard exists to protect. */
const PAGE_READS_RELATIVE = [
  'apps',
  'angular-ai-devtools',
  'src',
  'app',
  'page-reads.ts',
];

/** The only files allowed to import `page-reads.ts`: the registration and its spec. */
const ALLOWLIST_RELATIVE = [
  [
    'apps',
    'angular-ai-devtools',
    'src',
    'app',
    'tool-registry',
    'read-tools.ts',
  ],
  [
    'apps',
    'angular-ai-devtools',
    'src',
    'app',
    'tool-registry',
    'read-tools.spec.ts',
  ],
];

/** The registry's own module, which N2 says must not reach around its own execute path. */
const REGISTRY_MODULE_RELATIVE = [
  'apps',
  'angular-ai-devtools',
  'src',
  'app',
  'tool-registry',
  'tool-registry.ts',
];

/** Names the registry module must not export: an export there would be a documented bypass. */
const FORBIDDEN_REGISTRY_EXPORTS = [
  'PAGE_HOST',
  'PAGE_READERS',
  'readComponents',
  'readComponent',
  'readSignals',
  'readDirectiveMetadata',
  'readPageComponent',
];

/** Directories a source walk never descends into. */
const SKIPPED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.nx',
  '.angular',
  'out-tsc',
  'tmp',
]);

/** The path of the guarded module under `root`. */
export function pageReadsModulePath(root) {
  return join(root, ...PAGE_READS_RELATIVE);
}

/** The allowlist under `root`, as absolute paths. */
export function allowlistedImporters(root) {
  return ALLOWLIST_RELATIVE.map((segments) => join(root, ...segments));
}

/** Repo-relative, forward-slash form — the form a failure message names. */
function displayPath(root, absolutePath) {
  return relative(root, absolutePath).split(sep).join('/');
}

function samePath(left, right) {
  const normalise = (value) =>
    process.platform === 'win32'
      ? resolve(value).toLowerCase()
      : resolve(value);
  return normalise(left) === normalise(right);
}

/** Every `.ts` file under `root`, sorted, skipping the directories that hold no source. */
function walkTypeScriptFiles(directory) {
  const found = [];
  const entries = readdirSync(directory, { withFileTypes: true }).sort(
    (left, right) =>
      left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
  );
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIPPED_DIRECTORIES.has(entry.name)) {
        continue;
      }
      found.push(...walkTypeScriptFiles(join(directory, entry.name)));
      continue;
    }
    if (
      entry.isFile() &&
      entry.name.endsWith('.ts') &&
      !entry.name.endsWith('.d.ts')
    ) {
      found.push(join(directory, entry.name));
    }
  }
  return found;
}

/**
 * Drops comments while leaving every string and template literal intact, so a specifier quoted in
 * a comment cannot be mistaken for an import and a specifier in code survives verbatim. A regex
 * literal containing `//` would be misread as a comment; no source in this repository has one, and
 * a false negative here is still caught by the fixture's red side below.
 */
function stripComments(source) {
  let output = '';
  let index = 0;
  let quote = null;
  while (index < source.length) {
    const character = source[index];
    const next = source[index + 1];
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
    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      output += character;
      index += 1;
      continue;
    }
    if (character === '/' && next === '/') {
      while (index < source.length && source[index] !== '\n') {
        index += 1;
      }
      continue;
    }
    if (character === '/' && next === '*') {
      index += 2;
      while (
        index < source.length &&
        !(source[index] === '*' && source[index + 1] === '/')
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

const STATIC_SPECIFIER_PATTERNS = [
  // `import … from '…'`, `export … from '…'`, `import type { X } from '…'`, `export * from '…'`.
  /^[ \t]*(?:import|export)\b[^;]*?\bfrom\s*['"]([^'"]+)['"]/gm,
  // `import '…'` — a side-effect import still reaches the module it names.
  /^[ \t]*import\s*['"]([^'"]+)['"]/gm,
];

const DYNAMIC_SPECIFIER_PATTERN = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

/** Every module specifier a file names, de-duplicated in first-seen order. */
export function moduleSpecifiers(source) {
  const code = stripComments(source);
  const found = [];
  for (const pattern of STATIC_SPECIFIER_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of code.matchAll(pattern)) {
      found.push(match[1]);
    }
  }
  for (const match of code.matchAll(DYNAMIC_SPECIFIER_PATTERN)) {
    found.push(match[1]);
  }
  return [...new Set(found)];
}

const RESOLUTION_SUFFIXES = ['', '.ts', '.tsx', '/index.ts'];

/** Resolves a relative specifier to a file on disk; `null` for a bare or unresolvable specifier. */
export function resolveSpecifier(fromFile, specifier) {
  if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
    return null;
  }
  const base = resolve(dirname(fromFile), specifier);
  for (const suffix of RESOLUTION_SUFFIXES) {
    const candidate = `${base}${suffix}`;
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

/**
 * The whole check as a function of a root. Returns what it scanned, what it accepted and what it
 * rejected, so a caller can both assert and print — and so the fixture tree and the repository run
 * the same scanner.
 */
export function checkRegistryReach(root = REPO_ROOT) {
  const sourceRoot = join(root, ...SOURCE_ROOT);
  const guarded = pageReadsModulePath(root);
  const allowlist = allowlistedImporters(root);
  const allowlistDisplay = allowlist.map((entry) => displayPath(root, entry));

  const violations = [];
  const accepted = [];
  let scannedFiles = 0;

  if (existsSync(sourceRoot)) {
    for (const file of walkTypeScriptFiles(sourceRoot)) {
      scannedFiles += 1;
      for (const specifier of moduleSpecifiers(readFileSync(file, 'utf8'))) {
        const resolved = resolveSpecifier(file, specifier);
        if (resolved === null || !samePath(resolved, guarded)) {
          continue;
        }
        const fileDisplay = displayPath(root, file);
        if (allowlistDisplay.includes(fileDisplay)) {
          accepted.push({ file: fileDisplay, specifier });
        } else {
          violations.push({
            file: fileDisplay,
            specifier,
            resolved: displayPath(root, resolved),
          });
        }
      }
    }
  }

  return {
    root,
    pageReadsModule: displayPath(root, guarded),
    pageReadsModuleExists: existsSync(guarded),
    scannedFiles,
    allowlist: allowlistDisplay,
    allowlistMissing: allowlistDisplay.filter(
      (entry) => !existsSync(join(root, ...entry.split('/'))),
    ),
    accepted,
    violations,
  };
}

/** Every name a module exports, from its export statements. */
export function exportedNames(source) {
  const code = stripComments(source);
  const names = [];
  const declarations =
    /^[ \t]*export\s+(?:declare\s+)?(?:abstract\s+)?(?:default\s+)?(?:async\s+)?(?:const|let|var|function|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/gm;
  for (const match of code.matchAll(declarations)) {
    names.push(match[1]);
  }
  const lists = /^[ \t]*export\s*\{([^}]*)\}/gm;
  for (const match of code.matchAll(lists)) {
    for (const piece of match[1].split(',')) {
      const name = piece
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (name !== undefined && /^[A-Za-z_$][\w$]*$/.test(name)) {
        names.push(name);
      }
    }
  }
  const star =
    /^[ \t]*export\s*\*\s*(?:as\s+([A-Za-z_$][\w$]*)\s+)?from\s*['"]([^'"]+)['"]/gm;
  for (const match of code.matchAll(star)) {
    names.push(match[1] ?? '*');
  }
  return [...new Set(names)];
}

/** N2: the registry module neither reaches the readers by import nor re-exports them by name. */
export function checkRegistryModule(root = REPO_ROOT) {
  const registryPath = join(root, ...REGISTRY_MODULE_RELATIVE);
  const guarded = pageReadsModulePath(root);
  const source = readFileSync(registryPath, 'utf8');
  const importViolations = [];
  for (const specifier of moduleSpecifiers(source)) {
    const resolved = resolveSpecifier(registryPath, specifier);
    if (
      specifier.includes('page-reads') ||
      (resolved !== null && samePath(resolved, guarded))
    ) {
      importViolations.push({
        file: displayPath(root, registryPath),
        specifier,
      });
    }
  }
  const exports = exportedNames(source);
  const forbiddenExports = exports.filter((name) =>
    FORBIDDEN_REGISTRY_EXPORTS.includes(name),
  );
  return {
    registryModule: displayPath(root, registryPath),
    importViolations,
    exports,
    forbiddenExports,
  };
}

/** A failure message that names the file and the specifier, so neither has to be guessed. */
function describeViolation(violation) {
  return `${violation.file} imports "${violation.specifier}", which resolves to the page-reads module — write it through TOOL_REGISTRY instead`;
}

test('every page-read import in the repository goes through the registry', () => {
  const result = checkRegistryReach(REPO_ROOT);

  // The check must observe something: a renamed, deleted or unread module fails here, so a green
  // run can never mean "nothing was scanned".
  assert.ok(
    result.pageReadsModuleExists,
    `${result.pageReadsModule} must exist for this check to mean anything`,
  );
  assert.ok(
    result.scannedFiles > 0,
    'the source walk must scan at least one file',
  );
  assert.deepEqual(
    result.allowlistMissing,
    [],
    'both allowlisted importers must exist',
  );

  console.log(
    `registry-reach: scanned ${result.scannedFiles} files under apps/angular-ai-devtools/src`,
  );
  console.log(
    `registry-reach: allowlist accepted ${JSON.stringify(result.allowlist)}`,
  );
  console.log(
    `registry-reach: accepted imports ${JSON.stringify(result.accepted)}`,
  );

  assert.deepEqual(
    result.violations.map((violation) => describeViolation(violation)),
    [],
    'no file outside the allowlist may import the page-reads module',
  );

  // The allowlist is real: both entries import the module and were recognised as such.
  assert.deepEqual(
    result.accepted.map((entry) => entry.file).sort(),
    [...result.allowlist].sort(),
  );

  // Two consecutive runs agree, and neither writes into the checkout.
  assert.deepEqual(checkRegistryReach(REPO_ROOT), result);
});

test('N2 the registry module neither imports nor re-exports a page reader', () => {
  const result = checkRegistryModule(REPO_ROOT);

  assert.deepEqual(
    result.importViolations.map(
      (violation) => `${violation.file} imports "${violation.specifier}"`,
    ),
    [],
    'tool-registry.ts must not import or re-export the page-reads module',
  );
  assert.deepEqual(
    result.forbiddenExports,
    [],
    `tool-registry.ts must not export any of ${FORBIDDEN_REGISTRY_EXPORTS.join(', ')}`,
  );
  // The module is still the envelope the check is about: an empty read would pass vacuously.
  assert.ok(
    result.exports.includes('TOOL_REGISTRY'),
    'tool-registry.ts must still export TOOL_REGISTRY',
  );
  assert.ok(
    result.exports.length > 10,
    'tool-registry.ts must still export the envelope',
  );
});

test('E4 a module importing a page reader directly fails and the same module going through the registry passes', () => {
  const fixtureRoot = join(
    tmpdir(),
    `registry-reach-fixture-${process.pid}-${Date.now()}`,
  );
  const app = join(fixtureRoot, 'apps', 'angular-ai-devtools', 'src', 'app');
  const toolRegistry = join(app, 'tool-registry');

  const write = (path, contents) => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, contents, 'utf8');
  };

  try {
    // The guarded module, the registry and the two allowlisted importers: the fixture is a small
    // but complete copy of the shape the real tree has.
    write(
      join(app, 'page-reads.ts'),
      'export const PAGE_HOST = "page-host";\n',
    );
    write(
      join(toolRegistry, 'tool-registry.ts'),
      'export const TOOL_REGISTRY = "tool-registry";\n',
    );
    write(
      join(toolRegistry, 'read-tools.ts'),
      "import { PAGE_HOST } from '../page-reads';\n\nexport const readTools = [PAGE_HOST];\n",
    );
    write(
      join(toolRegistry, 'read-tools.spec.ts'),
      "import { PAGE_HOST } from '../page-reads';\n\nexport const host = PAGE_HOST;\n",
    );

    // The red side: three shapes of direct reach — a static import, a re-export and a dynamic one.
    write(
      join(app, 'rogue-reader.ts'),
      "import { PAGE_HOST } from './page-reads';\n\nexport const rogue = PAGE_HOST;\n",
    );
    write(join(app, 'rogue-reexport.ts'), "export * from './page-reads';\n");
    write(
      join(app, 'rogue-dynamic.ts'),
      "export async function loadReader() {\n  return import('./page-reads');\n}\n",
    );

    // The green side: the same read, reached through the registry's execute path.
    write(
      join(app, 'through-registry.ts'),
      [
        "import { TOOL_REGISTRY } from './tool-registry/tool-registry';",
        '',
        'export async function findComponents(registry) {',
        "  return registry.execute('find_components');",
        '}',
        '',
        `export const registryToken = TOOL_REGISTRY;`,
        '',
      ].join('\n'),
    );

    const result = checkRegistryReach(fixtureRoot);

    assert.ok(
      result.pageReadsModuleExists,
      'the fixture must contain the guarded module',
    );
    assert.ok(
      result.scannedFiles > 0,
      'the fixture walk must scan at least one file',
    );
    assert.deepEqual(
      result.allowlistMissing,
      [],
      'both allowlisted importers exist in the fixture',
    );

    const reported = result.violations
      .map((violation) => `${violation.file} :: ${violation.specifier}`)
      .sort();
    assert.deepEqual(reported, [
      'apps/angular-ai-devtools/src/app/rogue-dynamic.ts :: ./page-reads',
      'apps/angular-ai-devtools/src/app/rogue-reader.ts :: ./page-reads',
      'apps/angular-ai-devtools/src/app/rogue-reexport.ts :: ./page-reads',
    ]);

    const flagged = result.violations.map((violation) => violation.file);
    assert.ok(
      !flagged.includes('apps/angular-ai-devtools/src/app/through-registry.ts'),
    );
    assert.deepEqual(
      result.accepted.map((entry) => entry.file).sort(),
      [...result.allowlist].sort(),
    );

    // A failure names the offending file and the specifier, not just the fact of a failure.
    const firstViolation = result.violations[0];
    const message = describeViolation(firstViolation);
    assert.ok(
      message.includes(firstViolation.file),
      'the failure must name the file',
    );
    assert.ok(
      message.includes(`"${firstViolation.specifier}"`),
      'the failure must name the specifier',
    );

    // The same module that failed above passes once it goes through the registry: one fixture,
    // two verdicts, so the check cannot be satisfied by scanning nothing.
    write(
      join(app, 'rogue-reader.ts'),
      [
        "import { TOOL_REGISTRY } from './tool-registry/tool-registry';",
        '',
        'export async function findComponents(registry) {',
        "  return registry.execute('find_components');",
        '}',
        '',
        'export const registryToken = TOOL_REGISTRY;',
        '',
      ].join('\n'),
    );

    const afterRewrite = checkRegistryReach(fixtureRoot);
    const stillFlagged = afterRewrite.violations.map(
      (violation) => violation.file,
    );
    assert.ok(
      !stillFlagged.includes(
        'apps/angular-ai-devtools/src/app/rogue-reader.ts',
      ),
    );
    assert.equal(afterRewrite.scannedFiles, result.scannedFiles);
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});
