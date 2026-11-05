import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, relative, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(here, '..', '..');
const FIXTURE_ROOT = join(REPO_ROOT, 'spikes', 'ng222-app');
const FIXTURE_NG_CLI = join(
  FIXTURE_ROOT,
  'node_modules',
  '@angular',
  'cli',
  'bin',
  'ng.js',
);
const FIXTURE_PACKAGE_JSON = join(FIXTURE_ROOT, 'package.json');

const CYCLE_ONE_OUTPUT = join(REPO_ROOT, 'tmp', 'rebuild-idempotent-cycle-1');
const CYCLE_TWO_OUTPUT = join(REPO_ROOT, 'tmp', 'rebuild-idempotent-cycle-2');

const SUITE = 'fixture-rebuild-idempotent.test.mjs';
const SERVE_HOST = '127.0.0.1';

const COMPONENT_PACKAGES = [
  '@angular/aria',
  '@angular/cdk',
  '@angular/material',
  '@angular/core',
];

function displayPath(absolutePath) {
  return relative(REPO_ROOT, absolutePath).split(sep).join('/');
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: 600_000,
    ...options,
  });
  assert.ok(
    !result.error,
    `${command} ${args.join(' ')} must be runnable: ${result.error?.message ?? 'unknown spawn failure'}`,
  );
  return {
    status: result.status,
    output: `${String(result.stdout ?? '')}${String(result.stderr ?? '')}`,
  };
}

function filesUnder(directory) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...filesUnder(path));
    } else if (entry.isFile()) {
      found.push(path);
    }
  }
  return found.sort();
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

/** Collect every install occurrence of each component package under the fixture's node_modules. */
function componentInstallOccurrences() {
  const occurrences = [];
  const nodeModules = join(FIXTURE_ROOT, 'node_modules');
  if (!existsSync(nodeModules)) return occurrences;
  const wanted = new Set(COMPONENT_PACKAGES);
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (!entry.isDirectory()) continue;
      const packageJsonPath = join(path, 'package.json');
      if (existsSync(packageJsonPath)) {
        try {
          const pkg = readJson(packageJsonPath);
          if (typeof pkg.name === 'string' && wanted.has(pkg.name)) {
            occurrences.push({
              name: pkg.name,
              version: pkg.version,
              path: displayPath(path),
            });
          }
        } catch {
          // ignore unreadable package.json
        }
      }
      walk(path);
    }
  }
  walk(nodeModules);
  return occurrences.sort(
    (a, b) => a.name.localeCompare(b.name) || a.path.localeCompare(b.path),
  );
}

function componentInstallSet(occurrences = componentInstallOccurrences()) {
  const grouped = {};
  for (const name of COMPONENT_PACKAGES) grouped[name] = [];
  for (const occurrence of occurrences) {
    grouped[occurrence.name].push({
      version: occurrence.version,
      path: occurrence.path,
    });
  }
  for (const name of COMPONENT_PACKAGES) {
    grouped[name].sort((a, b) => a.path.localeCompare(b.path));
  }
  return grouped;
}

/**
 * A duplicate install is a second on-disk occurrence of the same component package, so it is named by
 * package, version and both paths rather than by an opaque diff of two objects.
 */
function assertSingleInstall(moment, occurrences) {
  for (const name of COMPONENT_PACKAGES) {
    const matching = occurrences.filter(
      (occurrence) => occurrence.name === name,
    );
    assert.equal(
      matching.length,
      1,
      `${SUITE}: ${name} must be installed exactly once ${moment}, found ${matching.length}: ${JSON.stringify(matching)}`,
    );
  }
}

/** One install-set measurement: the occurrences, the duplicate check, and the grouped set. */
function measureComponentInstallSet(moment) {
  const occurrences = componentInstallOccurrences();
  assertSingleInstall(moment, occurrences);
  return { occurrences, installSet: componentInstallSet(occurrences) };
}

function buildCycle(outputDirectory) {
  rmSync(outputDirectory, { recursive: true, force: true });
  const result = run(
    process.execPath,
    [
      FIXTURE_NG_CLI,
      'build',
      '--configuration',
      'production',
      '--output-path',
      relative(FIXTURE_ROOT, outputDirectory).split(sep).join('/'),
    ],
    { cwd: FIXTURE_ROOT },
  );
  assert.equal(
    result.status,
    0,
    `ng build --configuration production of ${displayPath(FIXTURE_ROOT)} must succeed: ${result.output}`,
  );
  assert.match(
    result.output,
    /Application bundle generation complete/,
    `the build must report a completed bundle: ${result.output}`,
  );
  const browserDirectory = join(outputDirectory, 'browser');
  assert.ok(
    existsSync(browserDirectory),
    `the build must emit ${displayPath(browserDirectory)}`,
  );
  const entryDocumentPath = join(browserDirectory, 'index.html');
  assert.ok(
    existsSync(entryDocumentPath),
    `the served entry document must exist: ${displayPath(entryDocumentPath)}`,
  );
  const entryDocument = readFileSync(entryDocumentPath);
  const browserFiles = readdirSync(browserDirectory)
    .filter((name) => name.endsWith('.js'))
    .sort();
  assert.ok(
    browserFiles.length > 0,
    'the build must emit at least one browser bundle',
  );
  return { browserDirectory, entryDocument, browserFiles };
}

function contentTypeFor(path) {
  if (path.endsWith('.html')) return 'text/html; charset=utf-8';
  if (path.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (path.endsWith('.css')) return 'text/css; charset=utf-8';
  if (path.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
}

/** The module bundle the served entry document loads, taken from the document itself. */
function entryScriptName(documentText, label, origin) {
  const match = /<script[^>]*\ssrc="([^"]+)"/i.exec(documentText);
  assert.ok(
    match !== null,
    `${SUITE}: the entry served after the ${label} cycle (GET ${origin}/) must reference a script bundle: ${documentText}`,
  );
  const scriptName = match[1].replace(/^\.?\//, '');
  assert.ok(
    !scriptName.includes('..'),
    `${SUITE}: the entry served after the ${label} cycle (GET ${origin}/) must reference a bundle inside the build output, got ${scriptName}`,
  );
  return scriptName;
}

/**
 * Serve the build output over a real socket and fetch the built entry through it: one port, one entry
 * document request, one bundle request, and a close in `finally` so no port is left held.
 */
async function serveAndFetch(browserDirectory, label) {
  const server = createServer((request, response) => {
    const requestPath = decodeURIComponent(
      new URL(request.url ?? '/', 'http://127.0.0.1').pathname,
    );
    const candidate = resolve(
      browserDirectory,
      `.${requestPath === '/' ? '/index.html' : requestPath}`,
    );
    const served = relative(browserDirectory, candidate);
    const insideOutput =
      !served.startsWith('..') && !served.includes(`..${sep}`);
    const isFile =
      insideOutput && existsSync(candidate) && statSync(candidate).isFile();
    if (!isFile) {
      response.writeHead(404, {
        'content-type': 'text/plain; charset=utf-8',
        connection: 'close',
      });
      response.end('not found');
      return;
    }
    const body = readFileSync(candidate);
    response.writeHead(200, {
      'content-type': contentTypeFor(candidate),
      'content-length': String(body.length),
      connection: 'close',
    });
    response.end(body);
  });

  try {
    await new Promise((listening, failed) => {
      server.once('error', failed);
      server.listen(0, SERVE_HOST, listening);
    });
    const address = server.address();
    assert.ok(
      address !== null && typeof address === 'object',
      `${SUITE}: the ${label} static server must bind a port, got ${JSON.stringify(address)}`,
    );
    const origin = `http://${SERVE_HOST}:${address.port}`;

    async function fetchPath(path) {
      const response = await fetch(`${origin}${path}`, {
        redirect: 'error',
        signal: AbortSignal.timeout(30_000),
      });
      const body = Buffer.from(await response.arrayBuffer());
      return {
        path,
        status: response.status,
        contentType: response.headers.get('content-type') ?? '',
        body,
      };
    }

    const entry = await fetchPath('/');
    assert.equal(
      entry.status,
      200,
      `${SUITE}: GET ${origin}/ after the ${label} cycle must answer 200, got ${entry.status}`,
    );
    assert.match(
      entry.contentType,
      /text\/html/,
      `${SUITE}: GET ${origin}/ after the ${label} cycle must serve the entry document, got ${entry.contentType}`,
    );
    assert.ok(
      entry.body.length > 0,
      `${SUITE}: GET ${origin}/ after the ${label} cycle must serve a non-empty entry document`,
    );

    const scriptName = entryScriptName(
      entry.body.toString('utf8'),
      label,
      origin,
    );
    const bundle = await fetchPath(`/${scriptName}`);
    assert.equal(
      bundle.status,
      200,
      `${SUITE}: GET ${origin}/${scriptName} after the ${label} cycle must answer 200, got ${bundle.status}`,
    );
    assert.deepEqual(
      bundle.body,
      readFileSync(join(browserDirectory, scriptName)),
      `${SUITE}: GET ${origin}/${scriptName} after the ${label} cycle must serve the bundle the build emitted`,
    );

    return {
      origin,
      entryDocument: entry.body,
      entryDocumentHash: sha256(entry.body),
      scriptName,
      scriptLength: bundle.body.length,
      scriptHash: sha256(bundle.body),
    };
  } finally {
    await new Promise((closed) => {
      server.close(() => closed());
      server.closeAllConnections();
    });
  }
}

const MISSING_FIXTURE_INSTALL =
  existsSync(FIXTURE_NG_CLI) &&
  COMPONENT_PACKAGES.every((name) =>
    existsSync(join(FIXTURE_ROOT, 'node_modules', ...name.split('/'))),
  )
    ? false
    : `the fixture install is absent (${displayPath(join(FIXTURE_ROOT, 'node_modules'))}); run npm --prefix spikes/ng222-app ci --include=dev`;

function requirePrerequisite(missing) {
  assert.equal(
    missing,
    false,
    `${SUITE}: the rebuild-idempotency proof cannot run: ${missing}`,
  );
}

test('fixture rebuild idempotent: same entry served and no duplicate component-package install', async () => {
  requirePrerequisite(MISSING_FIXTURE_INSTALL);

  // No duplicate component-package entry in the manifest's raw text.
  const manifestText = readFileSync(FIXTURE_PACKAGE_JSON, 'utf8');
  for (const name of COMPONENT_PACKAGES) {
    const key = `"${name}"`;
    const count = manifestText.split(key).length - 1;
    assert.equal(
      count,
      1,
      `${displayPath(FIXTURE_PACKAGE_JSON)} must declare ${name} exactly once, found ${count}`,
    );
  }

  // Each component package must be installed exactly once before the first cycle.
  const before = measureComponentInstallSet(
    'before the first build and serve cycle',
  );

  // First build and serve cycle: the build runs, then the built entry is served and fetched.
  const cycleOne = buildCycle(CYCLE_ONE_OUTPUT);
  const servedOne = await serveAndFetch(cycleOne.browserDirectory, 'first');
  assert.deepEqual(
    servedOne.entryDocument,
    cycleOne.entryDocument,
    `${SUITE}: the entry served from ${servedOne.origin}/ after the first cycle must be the document the first build emitted ` +
      `(served ${sha256(servedOne.entryDocument)}, emitted ${sha256(cycleOne.entryDocument)})`,
  );

  // Measurement BETWEEN the cycles: a duplicate left behind by the first build is visible here,
  // because the second cycle's build has not run yet.
  const afterOne = measureComponentInstallSet(
    'between the first and second build and serve cycles, after the first build and before the second',
  );
  assert.deepEqual(
    afterOne.installSet,
    before.installSet,
    `${SUITE}: the component-package install set must be unchanged by the first build and serve cycle; ` +
      `a duplicate component-package entry introduced during the first cycle (the T016 mutant adds a duplicate ` +
      `@angular/cdk install here) must redden this assertion, found ${JSON.stringify(afterOne.installSet)}`,
  );

  // Second build and serve cycle: the build runs between the two install-set measurements.
  const cycleTwo = buildCycle(CYCLE_TWO_OUTPUT);
  const servedTwo = await serveAndFetch(cycleTwo.browserDirectory, 'second');
  assert.deepEqual(
    servedTwo.entryDocument,
    cycleTwo.entryDocument,
    `${SUITE}: the entry served from ${servedTwo.origin}/ after the second cycle must be the document the second build emitted ` +
      `(served ${sha256(servedTwo.entryDocument)}, emitted ${sha256(cycleTwo.entryDocument)})`,
  );

  // The served entry document must be byte-identical across both cycles.
  assert.equal(
    servedOne.entryDocument.length,
    servedTwo.entryDocument.length,
    `${SUITE}: the served entry document length must match across cycles ` +
      `(first ${servedOne.entryDocument.length} bytes from ${servedOne.origin}/, ` +
      `second ${servedTwo.entryDocument.length} bytes from ${servedTwo.origin}/)`,
  );
  assert.equal(
    servedTwo.entryDocumentHash,
    servedOne.entryDocumentHash,
    `${SUITE}: the entry served after the second cycle (${servedTwo.origin}/) must be byte-identical to the entry ` +
      `served after the first cycle (${servedOne.origin}/), got ${servedTwo.entryDocumentHash} against ${servedOne.entryDocumentHash}`,
  );
  assert.equal(
    servedTwo.scriptName,
    servedOne.scriptName,
    `${SUITE}: the same entry must load the same bundle after each cycle, got ${servedTwo.scriptName} against ${servedOne.scriptName}`,
  );
  assert.equal(
    servedTwo.scriptHash,
    servedOne.scriptHash,
    `${SUITE}: the bundle served after the second cycle must be byte-identical to the bundle served after the first cycle, ` +
      `got ${servedTwo.scriptHash} (${servedTwo.scriptLength} bytes) against ${servedOne.scriptHash} (${servedOne.scriptLength} bytes)`,
  );
  assert.deepEqual(
    cycleOne.browserFiles,
    cycleTwo.browserFiles,
    'the served browser bundle set must be identical across the two build and serve cycles',
  );

  // The component-package install set must be identical after the second cycle.
  const afterTwo = measureComponentInstallSet(
    'after the second build and serve cycle',
  );
  assert.deepEqual(
    afterTwo.installSet,
    before.installSet,
    `${SUITE}: the component-package install set must be unchanged after the second build and serve cycle, ` +
      `found ${JSON.stringify(afterTwo.installSet)}`,
  );
  assert.deepEqual(
    afterTwo.installSet,
    afterOne.installSet,
    `${SUITE}: the component-package install set after the second build and serve cycle must be identical to the set ` +
      `measured between the cycles, found ${JSON.stringify(afterTwo.installSet)} against ${JSON.stringify(afterOne.installSet)}`,
  );
  assertSingleInstall(
    'after the second build and serve cycle',
    afterTwo.occurrences,
  );

  console.log(
    `rebuild-idempotent: served ${servedOne.origin}/ (${servedOne.entryDocument.length} bytes) and ${servedTwo.origin}/ ` +
      `(${servedTwo.entryDocument.length} bytes) — same entry ${servedOne.entryDocumentHash}, same bundle ${servedTwo.scriptName}; ` +
      `component install set measured before (${before.occurrences.length} occurrences), between the cycles ` +
      `(${afterOne.occurrences.length}) and after the second (${afterTwo.occurrences.length})`,
  );
});
