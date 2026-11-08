// @ts-check
//
// M038 T001 — which node label the signal graph gives a linked signal on the
// Angular version the fixture builds, whether the source it follows is reachable
// from that graph, and what the two fixture states hold.
//
// The question this file settles: a linked signal arrives in the graph labelled
// with the field it is assigned to ("agreeing", "differing"), and that label is
// not the runtime's work. The graph builds a node's `label` out of
// `consumer.debugName`; `@angular/core`'s `linkedSignal` only copies the
// `debugName` option it is handed; and the *compiler* is what hands it over, by
// rewriting every `signal(...)`, `computed(...)` and `linkedSignal(...)` in a
// development build to pass the field name as `debugName`. A plain computed
// therefore comes out labelled with its own field name too ("plainComputed"), so
// the label does not say "linked signal" — the node `kind` does
// (`'linkedSignal'` versus `'computed'`).
//
// Run the checks (read-only: no build, no browser, no write):
//   node --experimental-strip-types --test scripts/linked-state-capture.test.mjs
//
// Re-capture. On Windows cmd.exe this is the only arming form that works — a
// bare `set M038_CAPTURE=1 &&` leaves the space inside the variable and arms
// nothing:
//   set "M038_CAPTURE=1"&& node --experimental-strip-types --test "scripts/linked-state-capture.test.mjs"
//
// Point the checks at another recording:
//   set "M038_RECORD=<path>"&& node --experimental-strip-types --test "scripts/linked-state-capture.test.mjs"
//
// The capture drives a development build of the fixture into the git-ignored
// `tmp/` directory, serves that output, and reads the graph off the element
// injector of the routed page. It never uses a bare `ng build`: the fixture's
// default configuration is production.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, extname, join, normalize, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const APP = join(ROOT, 'spikes', 'ng222-app');
const SELF_PATH = fileURLToPath(import.meta.url);

const ROUTE_PATH = '/linked-state';
const ELEMENT = 'app-linked-state-page';
const COMPONENT = 'LinkedStatePage';
const RECORD_PATH =
  process.env.M038_RECORD ??
  join(ROOT, 'research', 'raw', 'm038-linked-state.json');

const OUTPUT_DIR = join(ROOT, 'tmp', 'm038-linked-build');
const BROWSER_DIR = join(OUTPUT_DIR, 'browser');
const NG_CLI = join(APP, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');

const ROUTES_PATH = join(APP, 'src', 'app', 'app.routes.ts');
const PAGE_PATH = join(APP, 'src', 'app', 'linked-state-page.ts');

const CORE_PACKAGE = join(APP, 'node_modules', '@angular', 'core');
const CORE_FESM_DIR = join(CORE_PACKAGE, 'fesm2022');
const CORE_TYPES = join(CORE_PACKAGE, 'types', 'core.d.ts');
const DEBUG_CHUNK = join(CORE_FESM_DIR, '_debug_node-chunk.mjs');
const LINKED_SIGNAL_CHUNK = join(CORE_FESM_DIR, '_untracked-chunk.mjs');
const LINKED_SIGNAL_WRAPPER_CHUNK = join(CORE_FESM_DIR, '_resource-chunk.mjs');

/** The two states the fixture authors, plus the two signals that frame them. */
const SOURCE_VALUE = 7;
const WRITTEN_AWAY_VALUE = SOURCE_VALUE + 1;
const COMPUTED_VALUE = SOURCE_VALUE * 2;
const SOURCE_SELECTOR = '#linked-state-source';
const HEADING_TEXT = 'linked state';

const SUBJECTS = [
  {
    key: 'agreeing',
    field: 'agreeing',
    element: '#linked-state-agreeing',
    writtenAway: false,
    expectedValue: SOURCE_VALUE,
  },
  {
    key: 'differing',
    field: 'differing',
    element: '#linked-state-differing',
    writtenAway: true,
    expectedValue: WRITTEN_AWAY_VALUE,
  },
];

const ARMED_CAPTURE_COMMAND =
  'set "M038_CAPTURE=1"&& node --experimental-strip-types --test "scripts/linked-state-capture.test.mjs"';
const CHECK_COMMAND =
  'node --experimental-strip-types --test "scripts/linked-state-capture.test.mjs"';
const BUILD_COMMAND =
  'node spikes/ng222-app/node_modules/@angular/cli/bin/ng.js build --configuration development --output-path tmp/m038-linked-build  (cwd spikes/ng222-app)';

// ------------------------------------------------------------- the pins ----
//
// Each pin is the value the armed capture measured at this head. A moved value is
// evidence that a recording was re-measured: re-cut it from a fresh capture,
// never widen it and never hand-edit a recorded number to make it pass.

/**
 * The label the graph gives each subject: the field it is assigned to, injected
 * by the compiler as the `debugName` option, not derived by the runtime.
 */
const PINNED_LABELS = {
  agreeing: 'agreeing',
  differing: 'differing',
  plainComputed: 'plainComputed',
  source: 'source',
};

/** Whether the label alone says the node is a linked signal. It does not. */
const PINNED_LABEL_IDENTIFIES_A_LINKED_SIGNAL = false;

/** Whether the source a linked signal follows is reachable from the graph. */
const PINNED_SOURCE_REACHABLE = true;

/** The SHA-256 of the recording's bytes; two default runs must both match it. */
const PINNED_RECORD_SHA256 =
  'b7bd843a30ce9c49f5d14eaf72e5e26179e9105fa65f9d1debe644e04a9375a1';

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

// ---------------------------------------------------------------- helpers ----

function fail(message) {
  throw new Error(message);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function displayPath(path) {
  return relative(ROOT, path).split(sep).join('/');
}

/** `--output-path` wants a slash-separated path, as the other build proofs pass it. */
function posixPath(path) {
  return path.split(sep).join('/');
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** The bytes the recording is written as, and re-read as, on every run. */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

function collapse(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function checkStrings(record, keys, where) {
  if (!isObject(record)) fail(`missing ${where}`);
  for (const key of keys) {
    if (typeof record[key] !== 'string' || record[key] === '') {
      fail(`missing ${where}.${key}`);
    }
  }
}

/** The installed version of the package that owns a directory. */
function installedPackage(packagePath) {
  const pkg = JSON.parse(
    readFileSync(join(packagePath, 'package.json'), 'utf8'),
  );
  return {
    version: pkg.version,
    source: displayPath(join(packagePath, 'package.json')),
  };
}

/** The declared range of one dependency in a package.json. */
function declaredRange(packageJsonPath, name) {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const range = pkg[field]?.[name];
    if (typeof range === 'string') return range;
  }
  return null;
}

// ------------------------------------------------- the static reads ----

/**
 * The graph's own linked-signal branch, and the line that reads the label out of
 * it — read from the shipped chunk, so the recording names where the label comes
 * from rather than asserting it.
 */
function graphLabelSource() {
  assert.ok(
    existsSync(DEBUG_CHUNK),
    `${displayPath(DEBUG_CHUNK)} is missing — run npm ci at the fixture`,
  );
  const lines = readFileSync(DEBUG_CHUNK, 'utf8').split('\n');
  const branchIndex = lines.findIndex((line) =>
    line.includes('isLinkedSignalNode(consumer)'),
  );
  if (branchIndex === -1) {
    fail(`${displayPath(DEBUG_CHUNK)} carries no linked-signal branch`);
  }
  let labelIndex = -1;
  for (let index = branchIndex + 1; index < lines.length; index += 1) {
    if (lines[index].includes('label: consumer.debugName')) {
      labelIndex = index;
      break;
    }
    if (lines[index].includes('} else if (')) break;
  }
  if (labelIndex === -1) {
    fail(
      'the linked-signal branch carries no `label: consumer.debugName` line',
    );
  }
  return {
    source: displayPath(DEBUG_CHUNK),
    branch: {
      lineNumber: branchIndex + 1,
      declaration: lines[branchIndex].trim(),
    },
    label: {
      lineNumber: labelIndex + 1,
      declaration: lines[labelIndex].trim(),
    },
  };
}

/** The node kind a linked signal carries, from the chunk that creates it. */
function linkedSignalNodeKind() {
  assert.ok(
    existsSync(LINKED_SIGNAL_CHUNK),
    `${displayPath(LINKED_SIGNAL_CHUNK)} is missing — run npm ci at the fixture`,
  );
  const lines = readFileSync(LINKED_SIGNAL_CHUNK, 'utf8').split('\n');
  const index = lines.findIndex((line) =>
    line.includes("kind: 'linkedSignal'"),
  );
  if (index === -1) {
    fail(`${displayPath(LINKED_SIGNAL_CHUNK)} declares no linkedSignal kind`);
  }
  return {
    source: displayPath(LINKED_SIGNAL_CHUNK),
    lineNumber: index + 1,
    declaration: lines[index].trim(),
  };
}

/** Every write to a node's `debugName` in one shipped chunk. */
function debugNameAssignments(filename) {
  const path = join(CORE_FESM_DIR, filename);
  const lines = readFileSync(path, 'utf8').split('\n');
  const assignments = [];
  lines.forEach((line, index) => {
    if (/\.debugName\s*=/.test(line)) {
      assignments.push({ lineNumber: index + 1, declaration: line.trim() });
    }
  });
  return {
    source: displayPath(path),
    assignmentCount: assignments.length,
    assignments,
  };
}

/**
 * The public `linkedSignal` wrapper: it copies the caller's `debugName` option
 * onto the node and derives nothing. Both call sites and the single assignment
 * are recorded verbatim, so the claim is re-derivable from the package.
 */
function linkedSignalWrapper() {
  assert.ok(
    existsSync(LINKED_SIGNAL_WRAPPER_CHUNK),
    `${displayPath(LINKED_SIGNAL_WRAPPER_CHUNK)} is missing — run npm ci at the fixture`,
  );
  const lines = readFileSync(LINKED_SIGNAL_WRAPPER_CHUNK, 'utf8').split('\n');
  const start = lines.findIndex((line) =>
    line.includes('function upgradeLinkedSignalGetter('),
  );
  if (start === -1) {
    fail(
      `${displayPath(LINKED_SIGNAL_WRAPPER_CHUNK)} carries no upgradeLinkedSignalGetter`,
    );
  }
  let depth = 0;
  let end = -1;
  for (let index = start; index < lines.length; index += 1) {
    const line = lines[index];
    depth += (line.match(/\{/g) ?? []).length;
    depth -= (line.match(/\}/g) ?? []).length;
    if (depth === 0 && index > start) {
      end = index;
      break;
    }
  }
  if (end === -1) fail('upgradeLinkedSignalGetter never closes');
  const body = lines.slice(start, end + 1);
  const assignments = [];
  body.forEach((line, offset) => {
    if (/\.debugName\s*=/.test(line)) {
      assignments.push({
        lineNumber: start + offset + 1,
        declaration: line.trim(),
      });
    }
  });
  const callSites = [];
  lines.forEach((line, index) => {
    if (
      line.includes('upgradeLinkedSignalGetter(') &&
      !line.includes('function upgradeLinkedSignalGetter(')
    ) {
      callSites.push({ lineNumber: index + 1, declaration: line.trim() });
    }
  });
  return {
    source: displayPath(LINKED_SIGNAL_WRAPPER_CHUNK),
    functionDeclaration: {
      lineNumber: start + 1,
      declaration: lines[start].trim(),
    },
    assignments,
    callSites,
    derivesAName: assignments.some(
      (assignment) =>
        !/\.debugName\s*=\s*debugName;$/.test(assignment.declaration),
    ),
  };
}

/**
 * Every place a shipped chunk *installs* a post-producer-created hook. The
 * definition and the export list are not installations; anything else would be a
 * framework-derived debug name, and the label would stop being the caller's.
 */
function postProducerCreatedHookInstallations() {
  const installations = [];
  for (const name of readdirSync(CORE_FESM_DIR)
    .filter((entry) => entry.endsWith('.mjs'))
    .sort()) {
    const path = join(CORE_FESM_DIR, name);
    readFileSync(path, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        if (!line.includes('setPostProducerCreatedFn(')) return;
        if (/function\s+setPostProducerCreatedFn\s*\(/.test(line)) return;
        if (/^\s*export\s*\{/.test(line)) return;
        installations.push({
          source: displayPath(path),
          lineNumber: index + 1,
          declaration: line.trim().slice(0, 160),
        });
      });
  }
  return {
    hook: 'setPostProducerCreatedFn',
    installationCount: installations.length,
    installations,
  };
}

/** The `debugName` option the `linkedSignal` declarations offer, if they do. */
function debugNameOptionOnLinkedSignal() {
  assert.ok(
    existsSync(CORE_TYPES),
    `${displayPath(CORE_TYPES)} is missing — run npm ci at the fixture`,
  );
  const lines = readFileSync(CORE_TYPES, 'utf8').split('\n');
  const start = lines.findIndex((line) =>
    line.includes('declare function linkedSignal<D>'),
  );
  if (start === -1) fail(`${displayPath(CORE_TYPES)} declares no linkedSignal`);
  let found = null;
  for (
    let index = start;
    index < start + 8 && index < lines.length;
    index += 1
  ) {
    if (lines[index].includes('debugName?: string;')) {
      found = { lineNumber: index + 1, declaration: lines[index].trim() };
      break;
    }
  }
  return {
    source: displayPath(CORE_TYPES),
    declaredOnLinkedSignalOptions: found !== null,
    lineNumber: found === null ? null : found.lineNumber,
    declaration: found === null ? null : found.declaration,
  };
}

/** What the fixture page itself declares, so the capture states its subject. */
function pageSourceFacts() {
  const text = readFileSync(PAGE_PATH, 'utf8');
  return {
    source: displayPath(PAGE_PATH),
    importsLinkedSignal:
      /import \{[^}]*\blinkedSignal\b[^}]*\} from '@angular\/core'/.test(text),
    declaresLinkedSignals: (text.match(/linkedSignal\(/g) ?? []).length,
    declaresPlainComputeds: (text.match(/computed\(/g) ?? []).length,
    mentionsADebugName: text.includes('debugName'),
    writesTheDifferingSubject: /differing\.set\(/.test(text),
    templateReadsTheSourceDirectly: /\{\{\s*source\(\)\s*\}\}/.test(text),
  };
}

/**
 * The compiled class of the fixture page: from `var <Component> = class` to the
 * `};` that closes it. Scoping the search matters — the same bundle holds
 * `source = ...` assignments in framework code.
 */
function compiledClass(bundleText) {
  const at = bundleText.indexOf(`var ${COMPONENT} = class`);
  if (at === -1) return null;
  const end = bundleText.indexOf('\n};', at);
  if (end === -1) return null;
  return { start: at, text: bundleText.slice(at, end + 3) };
}

/**
 * One field initializer as the compiler emitted it, read out of the development
 * bundle that carries the page: the evidence that the label the graph reports
 * was passed in by the compiler and not derived by the runtime.
 */
function compiledInitializer(bundle, field) {
  const compiled = compiledClass(bundle.text);
  if (compiled === null) return null;
  const match = new RegExp(`\\n\\s*${field} = `).exec(compiled.text);
  if (match === null) return null;
  const at = match.index + 1;
  const open = compiled.text.indexOf('(', at);
  if (open === -1) return null;
  let depth = 0;
  for (let index = open; index < compiled.text.length; index += 1) {
    if (compiled.text[index] === '(') depth += 1;
    else if (compiled.text[index] === ')') {
      depth -= 1;
      if (depth === 0) {
        const text = compiled.text.slice(at, index + 1);
        const literal = /debugName: "([^"]+)"/.exec(text);
        const absolute = compiled.start + at;
        return {
          field,
          bundle: bundle.name,
          lineNumber: bundle.text.slice(0, absolute).split('\n').length,
          passesADebugName: literal !== null,
          debugNameLiteral: literal === null ? null : literal[1],
          injectedOnlyInDevMode: text.includes('...ngDevMode ? [{'),
          call: collapse(text).slice(0, 240),
        };
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------- capture ----

function runBuild() {
  assert.ok(
    existsSync(NG_CLI),
    `the fixture must carry its own install for ${displayPath(NG_CLI)} — run npm --prefix spikes/ng222-app ci --include=dev`,
  );
  rmBuildOutput();
  const result = spawnSync(
    process.execPath,
    [
      NG_CLI,
      'build',
      '--configuration',
      'development',
      '--output-path',
      posixPath(relative(APP, OUTPUT_DIR)),
    ],
    { cwd: APP, encoding: 'utf8' },
  );
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  assert.equal(
    result.status,
    0,
    `ng build --configuration development of ${displayPath(APP)} must succeed: ${output}`,
  );
  assert.match(
    output,
    /Application bundle generation complete/,
    `the build must report a completed bundle: ${output}`,
  );
  assert.ok(
    existsSync(BROWSER_DIR),
    `the build must emit ${displayPath(BROWSER_DIR)}`,
  );
  const bundles = readdirSync(BROWSER_DIR)
    .filter((name) => name.endsWith('.js'))
    .sort();
  assert.ok(bundles.length > 0, 'the build must emit a browser bundle');
  const sources = bundles.map((name) => ({
    name,
    text: readFileSync(join(BROWSER_DIR, name), 'utf8'),
  }));
  return {
    bundles,
    sources,
    text: sources.map((source) => source.text).join('\n'),
  };
}

function rmBuildOutput() {
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
}

/** A static file server for the emitted bundle, falling back to index.html. */
function startStaticServer(directory) {
  const server = createServer((request, response) => {
    let path = '/';
    try {
      path = decodeURIComponent(
        new URL(request.url ?? '/', 'http://127.0.0.1').pathname,
      );
    } catch {
      path = '/';
    }
    let file = normalize(join(directory, path));
    if (!file.startsWith(normalize(directory))) {
      response.writeHead(403).end('forbidden');
      return;
    }
    if (!existsSync(file) || statSync(file).isDirectory()) {
      file = join(directory, 'index.html');
    }
    if (!existsSync(file)) {
      response.writeHead(404).end('not found');
      return;
    }
    response.writeHead(200, {
      'content-type':
        CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
    });
    response.end(readFileSync(file));
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

/** The graph node as the recording stores it: four fields and an index. */
function slimNode(node) {
  return {
    index: node.index,
    id: node.id,
    kind: node.kind,
    label: node.label,
    value: node.value,
  };
}

function producersOf(edges, consumerIndex) {
  return edges
    .filter((edge) => edge.consumer === consumerIndex)
    .map((edge) => edge.producer);
}

function kindsOf(nodes) {
  return [...new Set(nodes.map((node) => node.kind))].sort();
}

function labelsOf(nodes) {
  return [...new Set(nodes.map((node) => node.label))].sort((a, b) => {
    if (a === b) return 0;
    if (a === null) return -1;
    if (b === null) return 1;
    return String(a).localeCompare(String(b));
  });
}

function valuesOf(nodes) {
  return nodes.map((node) => node.value);
}

async function runCapture() {
  const requireApp = createRequire(join(APP, 'package.json'));
  let chromium;
  try {
    ({ chromium } = requireApp('playwright'));
  } catch (error) {
    throw new Error(
      `playwright is not installed for the fixture (${APP}); run: npm --prefix spikes/ng222-app ci --include=dev. ${error}`,
    );
  }
  const playwrightVersion = requireApp('playwright/package.json').version;

  const build = runBuild();
  const pageBundle = build.sources.find(
    (source) => compiledClass(source.text) !== null,
  );
  if (pageBundle === undefined) {
    fail(`the development bundle carries no ${COMPONENT} class`);
  }
  const compiled = {};
  for (const subject of SUBJECTS) {
    const entry = compiledInitializer(pageBundle, subject.field);
    if (entry === null) {
      fail(
        `the development bundle carries no ${subject.field} initializer for ${COMPONENT}`,
      );
    }
    compiled[subject.key] = entry;
  }
  compiled.plainComputed = compiledInitializer(pageBundle, 'plainComputed');
  compiled.source = compiledInitializer(pageBundle, 'source');

  const server = await startStaticServer(BROWSER_DIR);
  const port = server.address().port;
  const pageUrl = `http://127.0.0.1:${port}${ROUTE_PATH}`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const browserBuild = browser.version();
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => {
      pageErrors.push(`${error.name}: ${error.message}`);
    });
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForFunction(
      () => document.querySelectorAll('[ng-version]').length > 0,
      null,
      { timeout: 120000 },
    );
    await page.waitForFunction(
      () =>
        !!window.ng &&
        typeof window.ng.getComponent === 'function' &&
        typeof window.ng.ɵgetSignalGraph === 'function',
      null,
      { timeout: 60000 },
    );
    await page.waitForTimeout(1000);

    const captured = await page.evaluate((elementName) => {
      const ng = window.ng;
      const element = document.querySelector(elementName);
      if (!element) throw new Error(`no <${elementName}> on the page`);
      const scalar = (value) =>
        value === null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
          ? value
          : null;
      const instance = ng.getComponent(element);
      const injector = ng.getInjector(element);
      const hook = typeof ng.ɵgetSignalGraph;
      const graph = ng.ɵgetSignalGraph(injector);
      const nodes = graph.nodes.map((node, index) => ({
        index,
        id: typeof node.id === 'string' ? node.id : null,
        kind: typeof node.kind === 'string' ? node.kind : null,
        label: typeof node.label === 'string' ? node.label : null,
        epoch: typeof node.epoch === 'number' ? node.epoch : null,
        value: scalar(node.value),
      }));
      const edges = graph.edges.map((edge) => ({
        consumer: edge.consumer,
        producer: edge.producer,
      }));
      const text = (selector) => {
        const found = document.querySelector(selector);
        return found ? found.textContent : null;
      };
      return {
        ngVersion:
          document.querySelector('[ng-version]')?.getAttribute('ng-version') ??
          null,
        headingText: text('#linked-state-heading'),
        sourceText: text('#linked-state-source'),
        texts: {
          agreeing: text('#linked-state-agreeing'),
          differing: text('#linked-state-differing'),
          plainComputed: text('#linked-state-computed'),
        },
        hook,
        nodeCount: nodes.length,
        edgeCount: edges.length,
        nodes,
        edges,
        read: {
          source: scalar(instance.source()),
          agreeing: scalar(instance.agreeing()),
          differing: scalar(instance.differing()),
          plainComputed: scalar(instance.plainComputed()),
        },
      };
    }, ELEMENT);

    const nodes = captured.nodes;
    const edges = captured.edges;
    const nodeAt = (index) =>
      nodes.find((node) => node.index === index) ?? null;
    const linkedNodes = nodes.filter((node) => node.kind === 'linkedSignal');
    const computedNodes = nodes.filter((node) => node.kind === 'computed');

    // Each subject is the one linked-signal node holding the value the page's
    // own getter returned. Two distinct values, so the match is unambiguous; if
    // it ever stops being so, the capture says so instead of guessing.
    const subjects = {};
    for (const subject of SUBJECTS) {
      const value = captured.read[subject.field];
      const candidates = linkedNodes.filter((node) => node.value === value);
      if (candidates.length !== 1) {
        fail(
          `the graph returned ${candidates.length} linkedSignal nodes with value ${JSON.stringify(value)}; the ${subject.key} subject needs exactly one`,
        );
      }
      const node = candidates[0];
      subjects[subject.key] = {
        key: subject.key,
        field: subject.field,
        element: subject.element,
        instanceValue: value,
        writtenAway: subject.writtenAway,
        agreesWithItsSource: value === captured.read.source,
        label: node.label,
        node: slimNode(node),
        producers: producersOf(edges, node.index)
          .map(nodeAt)
          .filter((producer) => producer !== null)
          .map(slimNode),
      };
    }

    // The source: the signal both linked signals were computed from. It is only
    // reachable at all because the linked signals read it during their own
    // computation — the template never reads it.
    const agreeingIndex = subjects.agreeing.node.index;
    const differingIndex = subjects.differing.node.index;
    const agreeingProducers = producersOf(edges, agreeingIndex);
    const differingProducers = producersOf(edges, differingIndex);
    const sharedProducers = agreeingProducers.filter((index) =>
      differingProducers.includes(index),
    );
    const sourceCandidates = sharedProducers
      .map(nodeAt)
      .filter(
        (node) =>
          node !== null &&
          node.kind === 'signal' &&
          node.value === captured.read.source,
      );
    if (sourceCandidates.length !== 1) {
      fail(
        `the graph returned ${sourceCandidates.length} shared signal producers holding the source value ${JSON.stringify(captured.read.source)}; the capture needs exactly one`,
      );
    }
    const sourceNode = sourceCandidates[0];

    const linkedSignalLabels = labelsOf(linkedNodes);
    const computedLabels = labelsOf(computedNodes);
    const linkedSignalKinds = kindsOf(linkedNodes);
    const computedKinds = kindsOf(computedNodes);
    const labelIsTheFieldName = SUBJECTS.every(
      (subject) => subjects[subject.key].label === subject.field,
    );
    const observation = `the graph returned ${linkedNodes.length} node(s) of kind ${linkedSignalKinds
      .map((kind) => JSON.stringify(kind))
      .join('/')} carrying label ${linkedSignalLabels
      .map((label) => JSON.stringify(label))
      .join('/')} and value(s) ${valuesOf(linkedNodes)
      .map((value) => JSON.stringify(value))
      .join('/')}, and ${computedNodes.length} node(s) of kind ${computedKinds
      .map((kind) => JSON.stringify(kind))
      .join('/')} carrying label ${computedLabels
      .map((label) => JSON.stringify(label))
      .join('/')} and value(s) ${valuesOf(computedNodes)
      .map((value) => JSON.stringify(value))
      .join('/')}`;

    const fixturePackage = installedPackage(CORE_PACKAGE);
    const labelSource = graphLabelSource();
    const wrapper = linkedSignalWrapper();
    const answer = {
      labelEachLinkedSignalCarries: Object.fromEntries(
        SUBJECTS.map((subject) => [subject.key, subjects[subject.key].label]),
      ),
      labelIsTheFieldName,
      labelIdentifiesALinkedSignal: !labelIsTheFieldName,
      theNodeKindIdentifiesALinkedSignal: linkedSignalKinds.some(
        (kind) => !computedKinds.includes(kind),
      ),
      linkedSignalKinds,
      plainComputedKinds: computedKinds,
      sourceReachableFromTheGraph: true,
      sourceNode: slimNode(sourceNode),
      sourceValue: captured.read.source,
      values: {
        source: captured.read.source,
        agreeing: subjects.agreeing.instanceValue,
        differing: subjects.differing.instanceValue,
        plainComputed: captured.read.plainComputed,
      },
      observation,
      finding: `a linked signal carries the label of the field it is assigned to: the ${linkedNodes.length} nodes of kind 'linkedSignal' report label ${linkedSignalLabels
        .map((label) => JSON.stringify(label))
        .join(
          ' and ',
        )}. The runtime does not derive that label — the graph reads label: consumer.debugName (${labelSource.source}:${labelSource.label.lineNumber}, "${labelSource.label.declaration}"), the public linkedSignal copies whatever debugName option it is handed (${wrapper.source}:${wrapper.assignments[0]?.lineNumber}, "${wrapper.assignments[0]?.declaration}"), and the Angular compiler is what hands the field name over: it rewrote each initializer in the development build to \`...ngDevMode ? [{ debugName: "${subjects.agreeing.label}" }] : []\` (${compiled.agreeing.call}). The plain computed in the same graph is labelled ${JSON.stringify(computedLabels[0] ?? null)} the same way, so the label does not say "linked signal" — the node kind does ('linkedSignal' versus 'computed'). The source signal is reachable from the graph only as the producer both linked signals share (node ${sourceNode.index}, kind 'signal', label ${JSON.stringify(sourceNode.label)}, value ${JSON.stringify(sourceNode.value)}); the page template never reads it. The agreeing subject holds ${JSON.stringify(subjects.agreeing.instanceValue)} and its source holds ${JSON.stringify(captured.read.source)}; the differing subject was written once to ${JSON.stringify(subjects.differing.instanceValue)}, so it no longer equals its source.`,
    };

    return {
      capturedAt: new Date().toISOString(),
      instance: 'headless',
      browser: `headless Playwright Chromium (build ${browserBuild})`,
      browserBuild,
      playwright: playwrightVersion,
      url: pageUrl,
      pageUrl,
      commands: {
        install: 'npm ci --include=dev',
        installApp: 'npm --prefix spikes/ng222-app ci --include=dev',
        build: BUILD_COMMAND,
        capture: ARMED_CAPTURE_COMMAND,
        check: CHECK_COMMAND,
      },
      environment: {
        platform: process.platform,
        shell: 'cmd.exe',
        node: process.version,
      },
      angular: {
        runtimeReportedByThePage: captured.ngVersion,
        fixtureDependency: {
          declared: declaredRange(join(APP, 'package.json'), '@angular/core'),
          installed: fixturePackage.version,
          source: fixturePackage.source,
        },
        whichOneTheCaptureRead:
          'the runtime graph below was produced by the @angular/core installed in spikes/ng222-app/node_modules, whose version the served page reports; the static reads name the same package on disk',
      },
      build: {
        configuration: 'development',
        command: BUILD_COMMAND,
        outputPath: displayPath(BROWSER_DIR),
        bundles: build.bundles,
        carriesThePage: build.text.includes('linked-state-heading'),
      },
      fixture: {
        route: ROUTE_PATH,
        routeTable: 'spikes/ng222-app/src/app/app.routes.ts',
        page: 'spikes/ng222-app/src/app/linked-state-page.ts',
        component: COMPONENT,
        element: ELEMENT,
        subjects: SUBJECTS.map((subject) => subject.key),
        avoidedElement: SOURCE_SELECTOR,
        avoidedElementWhy:
          'the page renders no element for the source signal: the template reads only the two linked signals and the plain computed, so the source can only be reached through them',
        values: {
          source: SOURCE_VALUE,
          agreeing: SOURCE_VALUE,
          differing: WRITTEN_AWAY_VALUE,
          plainComputed: COMPUTED_VALUE,
        },
        writes: {
          where: 'spikes/ng222-app/src/app/linked-state-page.ts, constructor',
          verbatim: 'this.differing.set(this.source() + 1);',
          why: 'one write, so the stored value differs from the source and the state is the differing one',
        },
      },
      compiled: {
        readFrom: `the development bundle that carries the page (${pageBundle.name}), built and served by the capture`,
        why: 'the compiler passes the field name as the debugName option in a development build; the runtime only copies that option onto the node, so the label is a compile-time artefact',
        perSubject: Object.fromEntries(
          SUBJECTS.map((subject) => [subject.key, compiled[subject.key]]),
        ),
        plainComputed: compiled.plainComputed,
        source: compiled.source,
      },
      graph: {
        reading: `ɵgetSignalGraph(ng.getInjector(<${ELEMENT}>))`,
        hook: captured.hook,
        nodeCount: captured.nodeCount,
        edgeCount: captured.edgeCount,
        nodes,
        edges,
        templateConsumerCandidates: nodes
          .filter(
            (node) =>
              !['signal', 'computed', 'linkedSignal'].includes(node.kind ?? ''),
          )
          .map(slimNode),
      },
      labels: {
        question:
          'which node label does the graph give a linked signal at this head?',
        answeredBy: {
          source: labelSource.source,
          branchLine: labelSource.branch,
          labelLine: labelSource.label,
        },
        observed: {
          linkedSignalNodeCount: linkedNodes.length,
          linkedSignalKinds,
          linkedSignalLabels,
          computedNodeCount: computedNodes.length,
          computedKinds,
          computedLabels,
        },
        labelEachLinkedSignalCarries: answer.labelEachLinkedSignalCarries,
        labelIsTheFieldName: answer.labelIsTheFieldName,
        labelIdentifiesALinkedSignal: answer.labelIdentifiesALinkedSignal,
        theNodeKindIdentifiesALinkedSignal:
          answer.theNodeKindIdentifiesALinkedSignal,
        observation,
      },
      sources: {
        branch: labelSource.branch,
        label: labelSource.label,
        nodeKind: linkedSignalNodeKind(),
        createLinkedSignal: debugNameAssignments('_untracked-chunk.mjs'),
        wrapper,
        postProducerCreatedHook: postProducerCreatedHookInstallations(),
        debugNameOption: debugNameOptionOnLinkedSignal(),
        page: pageSourceFacts(),
      },
      subjects,
      source: {
        key: 'source',
        field: 'source',
        instanceValue: captured.read.source,
        reachable: true,
        node: slimNode(sourceNode),
        evidence: {
          templateReadsTheSourceDirectly:
            pageSourceFacts().templateReadsTheSourceDirectly,
          producersOfAgreeing: agreeingProducers
            .map(nodeAt)
            .filter(Boolean)
            .map(slimNode),
          producersOfDiffering: differingProducers
            .map(nodeAt)
            .filter(Boolean)
            .map(slimNode),
          producerIndicesSharedByBothLinkedSignals: sharedProducers,
          nodesWithTheSourceValueAndKindSignal: nodes
            .filter(
              (node) =>
                node.kind === 'signal' && node.value === captured.read.source,
            )
            .map(slimNode),
        },
      },
      page: {
        pageLoads: 1,
        ngVersion: captured.ngVersion,
        headingText: captured.headingText,
        sourceText: captured.sourceText,
        texts: captured.texts,
        uncaughtPageErrors: pageErrors.length,
        pageErrorMessages: pageErrors,
      },
      answers: answer,
    };
  } finally {
    if (browser) await browser.close().catch(() => {});
    await new Promise((resolve) => server.close(resolve));
  }
}

// ---------------------------------------------------------------- validation ----

function validate(record) {
  checkStrings(
    record,
    [
      'capturedAt',
      'instance',
      'browser',
      'browserBuild',
      'playwright',
      'url',
      'pageUrl',
    ],
    'the recording',
  );
  if (record.instance !== 'headless') fail(`instance is ${record.instance}`);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(record.capturedAt)) {
    fail(`bad capturedAt ${record.capturedAt}`);
  }
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(record.browserBuild)) {
    fail(`bad browserBuild ${record.browserBuild}`);
  }
  if (!record.browser.includes(record.browserBuild)) {
    fail('the browser string does not name its build');
  }
  if (record.url !== record.pageUrl) fail('url/pageUrl disagree');
  if (!record.url.endsWith(ROUTE_PATH)) {
    fail(`url is not the route: ${record.url}`);
  }

  // The gate, in the cmd.exe form that actually arms.
  checkStrings(
    record.commands,
    ['install', 'installApp', 'build', 'capture', 'check'],
    'commands',
  );
  if (record.commands.capture !== ARMED_CAPTURE_COMMAND) {
    fail(
      `the recorded capture command is not the armed command: ${JSON.stringify(record.commands.capture)}`,
    );
  }
  if (!record.commands.capture.includes('set "M038_CAPTURE=1"&&')) {
    fail('the capture command does not carry the quoted cmd.exe arming form');
  }
  if (!record.commands.check.includes('linked-state-capture')) {
    fail('the recorded check command is not this suite');
  }
  if (!record.commands.build.includes('--configuration development')) {
    fail('the build command does not name the development configuration');
  }
  checkStrings(
    record.environment,
    ['platform', 'shell', 'node'],
    'environment',
  );

  if (!isObject(record.angular)) fail('missing angular');
  checkStrings(
    record.angular,
    ['runtimeReportedByThePage', 'whichOneTheCaptureRead'],
    'angular',
  );
  checkStrings(
    record.angular.fixtureDependency,
    ['declared', 'installed', 'source'],
    'angular.fixtureDependency',
  );
  const installed = installedPackage(CORE_PACKAGE);
  if (record.angular.fixtureDependency.installed !== installed.version) {
    fail(
      `the fixture install moved since the capture: recorded ${record.angular.fixtureDependency.installed}, installed ${installed.version}`,
    );
  }
  if (record.angular.runtimeReportedByThePage !== installed.version) {
    fail(
      `the page reported ${record.angular.runtimeReportedByThePage} and the fixture installs ${installed.version}`,
    );
  }

  if (!isObject(record.build)) fail('missing build');
  if (record.build.configuration !== 'development') fail('build configuration');
  if (
    !Array.isArray(record.build.bundles) ||
    record.build.bundles.length === 0
  ) {
    fail('build bundles empty');
  }
  if (record.build.carriesThePage !== true) {
    fail('the built bundle does not carry the fixture page');
  }

  if (!isObject(record.fixture)) fail('missing fixture');
  if (record.fixture.route !== ROUTE_PATH) fail('fixture.route');
  if (record.fixture.element !== ELEMENT) fail('fixture.element');
  if (record.fixture.component !== COMPONENT) fail('fixture.component');
  const values = record.fixture.values;
  if (!isObject(values)) fail('missing fixture.values');
  if (values.source !== SOURCE_VALUE) {
    fail(`fixture.values.source is ${JSON.stringify(values.source)}`);
  }
  if (values.agreeing !== values.source) {
    fail('the agreeing subject does not hold its source value');
  }
  if (values.differing === values.source) {
    fail('the differing subject holds its source value');
  }
  if (values.plainComputed !== COMPUTED_VALUE) {
    fail(
      `fixture.values.plainComputed is ${JSON.stringify(values.plainComputed)}`,
    );
  }

  // The compiled initializers: the evidence that the label came from the build.
  if (!isObject(record.compiled)) fail('missing compiled');
  if (!isObject(record.compiled.perSubject))
    fail('missing compiled.perSubject');
  for (const subject of SUBJECTS) {
    const entry = record.compiled.perSubject[subject.key];
    const where = `compiled.perSubject.${subject.key}`;
    if (!isObject(entry)) fail(`missing ${where}`);
    if (entry.field !== subject.field) fail(`${where}.field`);
    if (
      typeof entry.bundle !== 'string' ||
      !record.build.bundles.includes(entry.bundle)
    ) {
      fail(`${where}.bundle is not one of the recorded bundles`);
    }
    if (entry.passesADebugName !== true) {
      fail(
        `${where}: the compiler passed no debugName, so the label is not this`,
      );
    }
    if (entry.debugNameLiteral !== PINNED_LABELS[subject.field]) {
      fail(
        `${where}: the compiler passed debugName ${JSON.stringify(entry.debugNameLiteral)}, measured ${JSON.stringify(PINNED_LABELS[subject.field])}`,
      );
    }
    if (entry.injectedOnlyInDevMode !== true) {
      fail(`${where}: the option is not the dev-mode form`);
    }
    checkStrings(entry, ['call'], where);
    if (!entry.call.includes(`debugName: "${subject.field}"`)) {
      fail(`${where}.call does not carry the field name as a debugName`);
    }
    if (typeof entry.lineNumber !== 'number' || entry.lineNumber < 1) {
      fail(`${where}.lineNumber is not a line`);
    }
  }
  for (const [label, expected] of [
    ['plainComputed', PINNED_LABELS.plainComputed],
    ['source', PINNED_LABELS.source],
  ]) {
    const entry = record.compiled[label];
    if (!isObject(entry)) fail(`missing compiled.${label}`);
    if (entry.debugNameLiteral !== expected) {
      fail(
        `compiled.${label} carries debugName ${JSON.stringify(entry.debugNameLiteral)}, measured ${JSON.stringify(expected)}`,
      );
    }
  }

  // The graph itself.
  if (!isObject(record.graph)) fail('missing graph');
  if (record.graph.hook !== 'function') {
    fail(`ɵgetSignalGraph is ${record.graph.hook}, not a function`);
  }
  if (!Array.isArray(record.graph.nodes) || record.graph.nodes.length === 0) {
    fail('the graph holds no nodes');
  }
  if (!Array.isArray(record.graph.edges) || record.graph.edges.length === 0) {
    fail('the graph holds no edges');
  }
  if (record.graph.nodeCount !== record.graph.nodes.length) {
    fail('graph.nodeCount disagrees with the recorded nodes');
  }
  if (record.graph.edgeCount !== record.graph.edges.length) {
    fail('graph.edgeCount disagrees with the recorded edges');
  }
  for (const node of record.graph.nodes) {
    if (typeof node.index !== 'number') fail('a graph node carries no index');
    if (typeof node.kind !== 'string' || node.kind === '') {
      fail(`graph node ${node.index} carries no kind`);
    }
    if (node.label !== null && typeof node.label !== 'string') {
      fail(`graph node ${node.index} carries an unreadable label`);
    }
  }
  const nodesByIndex = new Map(
    record.graph.nodes.map((node) => [node.index, node]),
  );
  for (const edge of record.graph.edges) {
    if (!nodesByIndex.has(edge.consumer) || !nodesByIndex.has(edge.producer)) {
      fail(
        `graph edge ${edge.consumer}->${edge.producer} names a node that is not recorded`,
      );
    }
  }
  const linkedNodes = record.graph.nodes.filter(
    (node) => node.kind === 'linkedSignal',
  );
  const computedNodes = record.graph.nodes.filter(
    (node) => node.kind === 'computed',
  );
  if (linkedNodes.length !== SUBJECTS.length) {
    fail(
      `the graph holds ${linkedNodes.length} linked signals, not ${SUBJECTS.length}`,
    );
  }
  if (computedNodes.length === 0)
    fail('the graph holds no plain computed control');

  // The label answer, checked against the nodes rather than taken on trust.
  if (!isObject(record.labels)) fail('missing labels');
  if (!isObject(record.labels.labelEachLinkedSignalCarries)) {
    fail('missing labels.labelEachLinkedSignalCarries');
  }
  for (const subject of SUBJECTS) {
    const expected = PINNED_LABELS[subject.field];
    const stated = record.labels.labelEachLinkedSignalCarries[subject.key];
    if (stated !== expected) {
      fail(
        `the recording states the ${subject.key} label ${JSON.stringify(stated)}, measured ${JSON.stringify(expected)}`,
      );
    }
    const node = record.subjects?.[subject.key]?.node;
    if (!isObject(node)) fail(`missing subjects.${subject.key}.node`);
    if (node.label !== expected) {
      fail(
        `linked-signal node ${node.index} carries label ${JSON.stringify(node.label)}, measured ${JSON.stringify(expected)}`,
      );
    }
    const sameNode = nodesByIndex.get(node.index);
    if (!isObject(sameNode) || sameNode.label !== node.label) {
      fail(
        `subjects.${subject.key}.node is not the graph node with that index: the graph says ${JSON.stringify(sameNode?.label)}, the subject says ${JSON.stringify(node.label)}`,
      );
    }
  }
  for (const node of computedNodes) {
    if (node.label !== PINNED_LABELS.plainComputed) {
      fail(
        `computed node ${node.index} carries label ${JSON.stringify(node.label)}, measured ${JSON.stringify(PINNED_LABELS.plainComputed)}`,
      );
    }
  }
  const labelIsTheFieldName = SUBJECTS.every(
    (subject) => record.subjects?.[subject.key]?.node?.label === subject.field,
  );
  if (record.labels.labelIsTheFieldName !== labelIsTheFieldName) {
    fail('labels.labelIsTheFieldName disagrees with the nodes');
  }
  if (record.labels.labelIdentifiesALinkedSignal !== !labelIsTheFieldName) {
    fail('labels.labelIdentifiesALinkedSignal disagrees with the labels');
  }
  if (
    record.labels.labelIdentifiesALinkedSignal !==
    PINNED_LABEL_IDENTIFIES_A_LINKED_SIGNAL
  ) {
    fail(
      `the label now identifies a linked signal: recorded ${record.labels.labelIdentifiesALinkedSignal}, measured ${PINNED_LABEL_IDENTIFIES_A_LINKED_SIGNAL}`,
    );
  }
  if (record.labels.theNodeKindIdentifiesALinkedSignal !== true) {
    fail(
      'the recording claims the node kind does not separate a linked signal',
    );
  }
  if (
    typeof record.labels.observation !== 'string' ||
    record.labels.observation === ''
  ) {
    fail('missing labels.observation');
  }
  const answeredBy = record.labels.answeredBy;
  if (!isObject(answeredBy)) fail('missing labels.answeredBy');
  checkStrings(answeredBy, ['source'], 'labels.answeredBy');
  for (const [label, entry] of [
    ['branchLine', answeredBy.branchLine],
    ['labelLine', answeredBy.labelLine],
  ]) {
    if (!isObject(entry)) fail(`missing labels.answeredBy.${label}`);
    if (typeof entry.lineNumber !== 'number' || entry.lineNumber < 1) {
      fail(`labels.answeredBy.${label}.lineNumber is not a line`);
    }
    if (typeof entry.declaration !== 'string' || entry.declaration === '') {
      fail(`labels.answeredBy.${label}.declaration is empty`);
    }
  }
  if (answeredBy.labelLine.declaration !== 'label: consumer.debugName,') {
    fail(
      `the graph no longer reads the label out of debugName: ${answeredBy.labelLine.declaration}`,
    );
  }
  if (
    answeredBy.branchLine.declaration !==
    '} else if (isLinkedSignalNode(consumer)) {'
  ) {
    fail(
      `the graph no longer branches on a linked-signal node: ${answeredBy.branchLine.declaration}`,
    );
  }

  // The subjects: each one is a linked signal holding its recorded value.
  for (const subject of SUBJECTS) {
    const entry = record.subjects?.[subject.key];
    const where = `subjects.${subject.key}`;
    if (!isObject(entry)) fail(`missing ${where}`);
    if (entry.key !== subject.key) fail(`${where}.key`);
    if (entry.element !== subject.element) fail(`${where}.element`);
    if (entry.writtenAway !== subject.writtenAway) {
      fail(`${where}.writtenAway is not ${subject.writtenAway}`);
    }
    if (entry.instanceValue !== subject.expectedValue) {
      fail(
        `${where} holds ${JSON.stringify(entry.instanceValue)}, measured ${JSON.stringify(subject.expectedValue)}`,
      );
    }
    if (!isObject(entry.node)) fail(`missing ${where}.node`);
    if (entry.node.kind !== 'linkedSignal') {
      fail(`${where}.node is a ${entry.node.kind}, not a linked signal`);
    }
    if (entry.node.value !== entry.instanceValue) {
      fail(
        `${where}: the graph node holds ${JSON.stringify(entry.node.value)} and the page's getter returns ${JSON.stringify(entry.instanceValue)}`,
      );
    }
    if (
      entry.agreesWithItsSource !==
      (entry.instanceValue === record.source?.instanceValue)
    ) {
      fail(`${where}.agreesWithItsSource disagrees with the recorded values`);
    }
    if (subject.writtenAway && entry.agreesWithItsSource) {
      fail(
        `${where} was written away from its source and still agrees with it`,
      );
    }
    if (!subject.writtenAway && !entry.agreesWithItsSource) {
      fail(`${where} was never written and does not agree with its source`);
    }
    if (!Array.isArray(entry.producers) || entry.producers.length === 0) {
      fail(`${where} records no producer`);
    }
  }

  // The source: reachable, and reached through both linked signals.
  if (!isObject(record.source)) fail('missing source');
  if (record.source.reachable !== PINNED_SOURCE_REACHABLE) {
    fail(
      `the recording states the source reachable ${record.source.reachable}, measured ${PINNED_SOURCE_REACHABLE}`,
    );
  }
  if (!isObject(record.source.node)) fail('missing source.node');
  if (record.source.node.kind !== 'signal') {
    fail(`source.node is a ${record.source.node.kind}, not a signal`);
  }
  if (record.source.node.label !== PINNED_LABELS.source) {
    fail(
      `the source node carries label ${JSON.stringify(record.source.node.label)}, measured ${JSON.stringify(PINNED_LABELS.source)}`,
    );
  }
  if (record.source.node.value !== record.source.instanceValue) {
    fail('source.node does not hold the value the page source holds');
  }
  const consumersOfSource = record.graph.edges
    .filter((edge) => edge.producer === record.source.node.index)
    .map((edge) => edge.consumer);
  for (const subject of SUBJECTS) {
    const index = record.subjects[subject.key].node.index;
    if (!consumersOfSource.includes(index)) {
      fail(`the source is not recorded as a producer of ${subject.key}`);
    }
  }
  for (const computedNode of computedNodes) {
    if (!consumersOfSource.includes(computedNode.index)) {
      fail('the source is not recorded as a producer of the plain computed');
    }
  }
  if (record.source.evidence?.templateReadsTheSourceDirectly !== false) {
    fail(
      'the page template reads the source directly, so the reachability proves nothing',
    );
  }
  const shared =
    record.source.evidence?.producerIndicesSharedByBothLinkedSignals;
  if (!Array.isArray(shared) || !shared.includes(record.source.node.index)) {
    fail('the source is not the producer both linked signals share');
  }

  // The static reads the label answer rests on.
  if (!isObject(record.sources)) fail('missing sources');
  const createLinkedSignal = record.sources.createLinkedSignal;
  if (!isObject(createLinkedSignal)) {
    fail('missing sources.createLinkedSignal');
  }
  if (createLinkedSignal.assignmentCount !== 0) {
    fail(
      `createLinkedSignal now writes a debug name ${createLinkedSignal.assignmentCount} time(s)`,
    );
  }
  const wrapper = record.sources.wrapper;
  if (!isObject(wrapper)) fail('missing sources.wrapper');
  if (wrapper.derivesAName !== false) {
    fail('the linkedSignal wrapper now derives a name of its own');
  }
  if (!Array.isArray(wrapper.assignments) || wrapper.assignments.length !== 1) {
    fail('the linkedSignal wrapper records no single debug-name assignment');
  }
  if (
    wrapper.assignments[0].declaration !==
    'getter[SIGNAL].debugName = debugName;'
  ) {
    fail(
      `the wrapper no longer copies the option: ${wrapper.assignments[0].declaration}`,
    );
  }
  if (!Array.isArray(wrapper.callSites) || wrapper.callSites.length !== 2) {
    fail('the linkedSignal wrapper records no two call sites');
  }
  for (const callSite of wrapper.callSites) {
    if (!callSite.declaration.includes('debugName')) {
      fail(`a wrapper call site passes no debugName: ${callSite.declaration}`);
    }
  }
  const hook = record.sources.postProducerCreatedHook;
  if (!isObject(hook)) fail('missing sources.postProducerCreatedHook');
  if (hook.installationCount !== 0) {
    fail(
      `a core bundle now installs ${hook.hook}, so a name would be derived for the node`,
    );
  }
  const option = record.sources.debugNameOption;
  if (!isObject(option)) fail('missing sources.debugNameOption');
  if (option.declaredOnLinkedSignalOptions !== true) {
    fail('the linkedSignal declarations no longer offer a debugName option');
  }
  checkStrings(option, ['declaration'], 'sources.debugNameOption');
  const kindSource = record.sources.nodeKind;
  if (!isObject(kindSource)) fail('missing sources.nodeKind');
  if (kindSource.declaration !== "kind: 'linkedSignal',") {
    fail(`the linked-signal kind declaration moved: ${kindSource.declaration}`);
  }
  const pageFacts = record.sources.page;
  if (!isObject(pageFacts)) fail('missing sources.page');
  if (pageFacts.importsLinkedSignal !== true) {
    fail('the fixture page does not import linkedSignal');
  }
  if (pageFacts.declaresLinkedSignals !== SUBJECTS.length) {
    fail(
      `the fixture page declares ${pageFacts.declaresLinkedSignals} linked signals, not ${SUBJECTS.length}`,
    );
  }
  if (pageFacts.mentionsADebugName !== false) {
    fail('the fixture page passes a debugName, so the label is the page’s');
  }
  if (pageFacts.writesTheDifferingSubject !== true) {
    fail('the fixture page never writes the differing subject');
  }
  if (pageFacts.templateReadsTheSourceDirectly !== false) {
    fail('the fixture template reads the source directly');
  }

  // The page.
  if (!isObject(record.page)) fail('missing page');
  if (record.page.pageLoads !== 1) fail('pageLoads');
  if (record.page.ngVersion !== record.angular.runtimeReportedByThePage) {
    fail('page.ngVersion disagrees with the runtime version');
  }
  if (typeof record.page.headingText !== 'string') fail('page.headingText');
  if (record.page.headingText.trim() !== HEADING_TEXT) {
    fail(`page.headingText is ${JSON.stringify(record.page.headingText)}`);
  }
  if (record.page.uncaughtPageErrors !== 0) {
    fail(`the page threw ${record.page.uncaughtPageErrors} error(s)`);
  }
  for (const subject of SUBJECTS) {
    const text = record.page.texts?.[subject.key];
    if (
      typeof text !== 'string' ||
      !text.includes(String(subject.expectedValue))
    ) {
      fail(
        `page.texts.${subject.key} is ${JSON.stringify(text)}, which does not render ${subject.expectedValue}`,
      );
    }
  }

  // The template consumer is the page element itself.
  const templateConsumers = record.graph.templateConsumerCandidates;
  if (!Array.isArray(templateConsumers) || templateConsumers.length === 0) {
    fail('the graph holds no template consumer');
  }
  if (templateConsumers[0].label !== ELEMENT) {
    fail(
      `the template consumer is labelled ${JSON.stringify(templateConsumers[0].label)}, not ${ELEMENT}`,
    );
  }

  // The answers, checked against what they summarise.
  if (!isObject(record.answers)) fail('missing answers');
  if (
    JSON.stringify(record.answers.labelEachLinkedSignalCarries) !==
    JSON.stringify(record.labels.labelEachLinkedSignalCarries)
  ) {
    fail('answers.labelEachLinkedSignalCarries disagrees with labels');
  }
  if (record.answers.sourceReachableFromTheGraph !== record.source.reachable) {
    fail('answers.sourceReachableFromTheGraph disagrees with source.reachable');
  }
  if (record.answers.sourceNode?.index !== record.source.node.index) {
    fail('answers.sourceNode is not the recorded source node');
  }
  const answerValues = record.answers.values;
  if (!isObject(answerValues)) fail('missing answers.values');
  for (const [key, value] of Object.entries({
    source: record.source.instanceValue,
    agreeing: record.subjects.agreeing.instanceValue,
    differing: record.subjects.differing.instanceValue,
    plainComputed: record.fixture.values.plainComputed,
  })) {
    if (answerValues[key] !== value) {
      fail(`answers.values.${key} disagrees with the recording`);
    }
  }
  if (
    record.answers.labelIdentifiesALinkedSignal !==
    PINNED_LABEL_IDENTIFIES_A_LINKED_SIGNAL
  ) {
    fail('answers.labelIdentifiesALinkedSignal');
  }
  if (record.answers.theNodeKindIdentifiesALinkedSignal !== true) {
    fail('answers does not separate a linked signal from a computed by kind');
  }
  if (record.answers.linkedSignalKinds.join(',') !== 'linkedSignal') {
    fail('answers.linkedSignalKinds');
  }
  if (record.answers.plainComputedKinds.join(',') !== 'computed') {
    fail('answers.plainComputedKinds');
  }
  if (
    typeof record.answers.finding !== 'string' ||
    record.answers.finding === ''
  ) {
    fail('missing answers.finding');
  }
  return true;
}

function loadRecord(path = RECORD_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function clone(record) {
  return JSON.parse(JSON.stringify(record));
}

// ---------------------------------------------------------------- read-only checks ----

test('the recording validates against its own graph, subjects and static reads', () => {
  assert.doesNotThrow(() => validate(loadRecord()));
});

test('two default runs leave the recording byte-identical (pinned SHA-256)', (t) => {
  const bytes = readFileSync(RECORD_PATH);
  const actual = sha256(bytes);
  t.diagnostic(`recording sha256 ${actual}`);
  assert.equal(
    bytes.toString('utf8'),
    canonical(loadRecord()),
    'the recording is not the canonical serialisation of its record, so a re-capture would not reproduce these bytes',
  );
  if (process.env.M038_CAPTURE === '1') {
    t.diagnostic(
      'armed run: this run re-records, so the pinned hash is reported, not asserted',
    );
    return;
  }
  assert.equal(
    actual,
    PINNED_RECORD_SHA256,
    'the recording moved since it was pinned — re-capture and re-cut the pin, never hand-edit it',
  );
});

test('the label each linked signal carries is its field name', () => {
  const record = loadRecord();
  for (const subject of SUBJECTS) {
    assert.equal(
      record.subjects[subject.key].node.label,
      subject.field,
      `${subject.key} does not carry its field name`,
    );
    assert.equal(
      record.labels.labelEachLinkedSignalCarries[subject.key],
      subject.field,
    );
  }
  assert.equal(record.labels.labelIsTheFieldName, true);
});

test('a linked signal is not identified by its label, only by its node kind', () => {
  const record = loadRecord();
  const computed = record.graph.nodes.filter(
    (node) => node.kind === 'computed',
  );
  assert.ok(computed.length > 0, 'the graph carries no plain computed control');
  for (const node of computed) {
    assert.equal(
      node.label,
      'plainComputed',
      `computed node ${node.index} does not carry its field name`,
    );
  }
  assert.deepEqual(
    [
      ...new Set(
        record.graph.nodes
          .filter((n) => n.kind === 'linkedSignal')
          .map((n) => n.kind),
      ),
    ],
    ['linkedSignal'],
  );
  assert.deepEqual(
    [...new Set(computed.map((node) => node.kind))],
    ['computed'],
  );
  assert.equal(record.labels.labelIdentifiesALinkedSignal, false);
  assert.equal(record.labels.theNodeKindIdentifiesALinkedSignal, true);
  assert.match(record.answers.finding, /the node kind does/);
});

test('the label comes from the compiler, not from the runtime', () => {
  const record = loadRecord();
  for (const subject of SUBJECTS) {
    const entry = record.compiled.perSubject[subject.key];
    assert.equal(entry.passesADebugName, true);
    assert.equal(entry.debugNameLiteral, subject.field);
    assert.equal(entry.injectedOnlyInDevMode, true);
    assert.ok(
      entry.call.includes(`...ngDevMode ? [{ debugName: "${subject.field}" }]`),
      `the compiled ${subject.key} initializer is not the dev-mode debugName form`,
    );
  }
  assert.equal(record.sources.page.mentionsADebugName, false);
  assert.equal(record.sources.createLinkedSignal.assignmentCount, 0);
  assert.equal(record.sources.wrapper.derivesAName, false);
  assert.equal(record.sources.postProducerCreatedHook.installationCount, 0);
  assert.match(
    record.answers.finding,
    /the Angular compiler is what hands the field name over/,
  );
});

test('the source is reachable from the graph, and only through the linked signals', () => {
  const record = loadRecord();
  assert.equal(record.source.reachable, true);
  assert.equal(record.source.node.kind, 'signal');
  assert.equal(record.source.node.label, 'source');
  assert.equal(record.source.evidence.templateReadsTheSourceDirectly, false);
  const consumers = record.graph.edges
    .filter((edge) => edge.producer === record.source.node.index)
    .map((edge) => edge.consumer);
  for (const subject of SUBJECTS) {
    assert.ok(
      consumers.includes(record.subjects[subject.key].node.index),
      `the source is not a producer of ${subject.key}`,
    );
  }
  assert.match(
    record.answers.finding,
    /reachable from the graph only as the producer/,
  );
});

test('the agreeing state agrees and the differing state was written away', () => {
  const record = loadRecord();
  assert.equal(record.subjects.agreeing.agreesWithItsSource, true);
  assert.equal(record.subjects.agreeing.writtenAway, false);
  assert.equal(
    record.subjects.agreeing.instanceValue,
    record.source.instanceValue,
  );
  assert.equal(record.subjects.differing.agreesWithItsSource, false);
  assert.equal(record.subjects.differing.writtenAway, true);
  assert.notEqual(
    record.subjects.differing.instanceValue,
    record.source.instanceValue,
  );
  assert.equal(
    record.subjects.differing.instanceValue,
    record.source.instanceValue + 1,
  );
});

test('the recording names the exact armed command string it expects', () => {
  const record = loadRecord();
  assert.equal(record.commands.capture, ARMED_CAPTURE_COMMAND);
  assert.equal(
    record.commands.capture,
    'set "M038_CAPTURE=1"&& node --experimental-strip-types --test "scripts/linked-state-capture.test.mjs"',
  );
  const source = readFileSync(SELF_PATH, 'utf8');
  assert.ok(
    source.includes("process.env.M038_CAPTURE === '1'"),
    'the armed command names a gate this file does not carry',
  );
});

test('PRECONDITION: the route is registered and the page authors both states', () => {
  const routes = readFileSync(ROUTES_PATH, 'utf8');
  assert.ok(existsSync(PAGE_PATH), 'the linked-state page is missing');
  assert.ok(
    routes.includes(`path: '${ROUTE_PATH.slice(1)}'`),
    'the linked-state route is not in the route table',
  );
  assert.ok(routes.includes(COMPONENT), `${COMPONENT} is not routed`);
  const page = readFileSync(PAGE_PATH, 'utf8');
  assert.match(page, /linkedSignal\(/, 'the page authors no linked signal');
  assert.match(page, /\.set\(/, 'the page writes no linked signal');
  assert.ok(
    page.includes('linked-state-heading'),
    'the page renders no heading',
  );
  assert.ok(
    !page.includes('getSignalGraph') && !page.includes('window.ng'),
    'the page reads the graph itself',
  );
});

test('the only write in this file sits behind the M038_CAPTURE gate', () => {
  const source = readFileSync(SELF_PATH, 'utf8');
  // Assembled so this check does not count its own needle as a write.
  const call = ['writeFileSync', '('].join('');
  const gate = source.indexOf("process.env.M038_CAPTURE === '1'");
  const writes = source.split(call).length - 1;
  assert.notEqual(gate, -1, 'the arming gate is not in this file');
  assert.equal(writes, 1, 'this file does not write exactly once');
  assert.ok(gate < source.indexOf(call), 'the write is not behind the gate');
});

// A default run must not touch the recording: the file hashes the same at the end
// of the run as at its start, which is what makes two default runs identical.
if (process.env.M038_CAPTURE !== '1') {
  const SHA_AT_LOAD = existsSync(RECORD_PATH)
    ? sha256(readFileSync(RECORD_PATH))
    : null;
  test('this run wrote nothing: the recording hashes the same before and after', () => {
    assert.notEqual(SHA_AT_LOAD, null, 'the recording is missing');
    assert.equal(
      sha256(readFileSync(RECORD_PATH)),
      SHA_AT_LOAD,
      'the recording changed during a default run',
    );
  });
}

// ---------------------------------------------------------------- held-out ----

test('held-out: a recording whose linked signal claims a foreign label reddens', () => {
  const mutant = clone(loadRecord());
  const node = mutant.graph.nodes.find(
    (entry) => entry.kind === 'linkedSignal',
  );
  node.label = 'linked-state.agreeing';
  mutant.subjects.agreeing.node.label = 'linked-state.agreeing';
  assert.throws(() => validate(mutant), /carries label/);
});

test('held-out: a recording that says the label identifies a linked signal reddens', () => {
  const mutant = clone(loadRecord());
  mutant.labels.labelIdentifiesALinkedSignal = true;
  assert.throws(
    () => validate(mutant),
    /label now identifies|labelIdentifiesALinkedSignal/,
  );
});

test('held-out: a recording that claims the source unreachable reddens', () => {
  const mutant = clone(loadRecord());
  mutant.source.reachable = false;
  assert.throws(() => validate(mutant), /reachable/);
});

test('held-out: a recording whose agreeing subject drifted from its source reddens', () => {
  const mutant = clone(loadRecord());
  mutant.subjects.agreeing.instanceValue = mutant.source.instanceValue + 1;
  assert.throws(() => validate(mutant), /subjects\.agreeing/);
});

test('held-out: a recording with a linked signal removed reddens', () => {
  const mutant = clone(loadRecord());
  const victim = mutant.subjects.differing.node.index;
  mutant.graph.nodes = mutant.graph.nodes.filter(
    (node) => node.index !== victim,
  );
  mutant.graph.edges = mutant.graph.edges.filter(
    (edge) => edge.consumer !== victim && edge.producer !== victim,
  );
  mutant.graph.nodeCount = mutant.graph.nodes.length;
  mutant.graph.edgeCount = mutant.graph.edges.length;
  assert.throws(() => validate(mutant), /linked signals|graph holds/);
});

test('held-out: a recording that claims the runtime derives the label reddens', () => {
  const mutant = clone(loadRecord());
  mutant.sources.wrapper.derivesAName = true;
  assert.throws(() => validate(mutant), /derives a name/);
});

test('held-out: a recording whose compiled initializer lost its debugName reddens', () => {
  const mutant = clone(loadRecord());
  mutant.compiled.perSubject.agreeing.passesADebugName = false;
  assert.throws(() => validate(mutant), /passed no debugName/);
});

// ---------------------------------------------------------------- opt-in capture ----

if (process.env.M038_CAPTURE === '1') {
  test('capture the linked signals’ labels, nodes and values from a development build', async (t) => {
    const record = await runCapture();
    validate(record);
    writeFileSync(RECORD_PATH, canonical(record));
    t.diagnostic(
      `linked signals: labels ${JSON.stringify(record.labels.labelEachLinkedSignalCarries)}, kinds ${record.labels.observed.linkedSignalKinds.join(',')}, values ${record.graph.nodes
        .filter((node) => node.kind === 'linkedSignal')
        .map((node) => node.value)
        .join(
          ', ',
        )}; computed label ${JSON.stringify(record.graph.nodes.find((node) => node.kind === 'computed')?.label)}; source reachable ${record.source.reachable} (node ${record.source.node.index}, label ${JSON.stringify(record.source.node.label)}, value ${record.source.node.value}); recording sha256 ${sha256(canonical(record))}`,
    );
  });
}
