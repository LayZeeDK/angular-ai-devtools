// @ts-check
//
// M042 T001 - the instrument's throw, the hook record's shape and the version
// discriminator, re-derived at this head.
//
// Three readings the rest of the milestone quotes, each derived here rather than
// described:
//
//   instrument  The shipped `extension/agent-main.js` is booted in this realm
//               (Node's own, with `ng`/`CustomEvent`/`dispatchEvent`/`performance`
//               mocked, the way its own suite boots it) and its profiler
//               subscriber is driven with the instance shapes the installed
//               chunk's emission sites supply. What is recorded is the error's
//               constructor and message, the emission that produced it, and
//               whether the frame's record reached the page's dispatch at all.
//   epochs      What the map at `extension/agent-main.js:1034` keys by, and what
//               each per-check changed-node list contains when an epoch moves,
//               when it holds, when no prior record exists and when the graph
//               read answers nothing. This is the record a repair must keep
//               (SC6/N6), so it is measured in both directions: a list that is
//               emptied or constant-folded is contradicted by a moved pass.
//   hook        The `@boundary` hook's record, re-read from the fixture's
//               installed core (22.2.2) and from this repository's own install
//               (22.1.8), each fact quoted with the source anchor that carries
//               it. Where a fact can only be a measurement of a page, the
//               recording quotes what S10 measured, names where, and this suite
//               holds that quotation to the line it cites.
//   version     The page-observable discriminator, enumerated rather than
//               assumed: the published debug surface's key list, the resolved
//               handler's own keys and class source, and the injector provider
//               record for the handler token, read on both installs.
//
// Read-only: no product change, no page, no server, no browser. A default run
// writes nothing; `M042_CAPTURE=1` writes the recording, and a second armed run
// at the same head changes no byte.
//
// Run the checks:
//   node --experimental-strip-types --test scripts/error-boundary-measure.test.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SELF_PATH = fileURLToPath(import.meta.url);

const RECORD_PATH = join(ROOT, 'research', 'raw', 'm042-error-boundary.json');
const AGENT_PATH = join(ROOT, 'extension', 'agent-main.js');
const S10_PATH = join(ROOT, '.project', 'research', 's10-answer.md');
const APP_CONFIG_PATH = join(
  ROOT,
  'spikes',
  'ng222-app',
  'src',
  'app',
  'app.config.ts',
);

/** The two installed copies of `@angular/core` this head carries. */
const INSTALLS = [
  { label: 'repo', modules: join(ROOT, 'node_modules') },
  {
    label: 'fixture',
    modules: join(ROOT, 'spikes', 'ng222-app', 'node_modules'),
  },
];

/** The moment this reading was taken; a constant, so an armed re-run is stable. */
const CAPTURED_AT = '2026-11-09T11:47:26.259Z';

/** This task's Verify line, verbatim. */
const CHECK_COMMAND =
  'node --check scripts/error-boundary-measure.test.mjs && node --experimental-strip-types --test "scripts/error-boundary-measure.test.mjs" && npx prettier --check scripts/error-boundary-measure.test.mjs research/raw/m042-error-boundary.json && npm run check';

/** The citation shape a source anchor uses: `path:12` or `path:12-34`. */
const CITATION = /^(.+):(\d+)(?:-(\d+))?$/;

/** The boundary machinery a core either carries or does not. */
const MACHINERY = [
  'onViewError',
  'boundaryCreate',
  'boundaryUpdate',
  'LBoundary',
  'BoundaryError',
  'encapsulateBoundaryError',
  'ON_ERROR',
];

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

function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

function clone(record) {
  return JSON.parse(JSON.stringify(record));
}

function requireFile(path, why) {
  assert.ok(existsSync(path), `${displayPath(path)} is missing - ${why}`);
  return path;
}

function strings(record, keys, where) {
  if (!isObject(record)) fail(`missing ${where}`);
  for (const key of keys) {
    if (typeof record[key] !== 'string' || record[key] === '') {
      fail(`missing ${where}.${key}`);
    }
  }
}

function isIsoTimestamp(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)
  );
}

function occurrences(text, needle) {
  return text.split(needle).length - 1;
}

/**
 * How often an identifier occurs in a chunk, as a name and not as a fragment of
 * a longer one: `ON_ERROR` must not count inside `INTERNAL_APPLICATION_ERROR_HANDLER`,
 * and a count that did would call the 22.1.8 install a carrier of the boundary
 * slot it does not have.
 */
function matchCount(text, needle) {
  if (!/^[\w$]+$/.test(needle)) return occurrences(text, needle);
  return (text.match(new RegExp(`\\b${needle}\\b`, 'g')) ?? []).length;
}

/** Memoise a derivation so every validator compares against one reading. */
function once(fn) {
  let done = false;
  let value;
  return () => {
    if (!done) {
      value = fn();
      done = true;
    }
    return value;
  };
}

/** The 1-indexed line numbers of a file that carry `needle`. */
function linesHolding(lines, needle) {
  const found = [];
  lines.forEach((line, index) => {
    if (line.includes(needle)) found.push(index + 1);
  });
  return found;
}

/** The one 1-indexed line a file carries `needle` on, or a named failure. */
function soleLine(lines, needle, where) {
  const found = linesHolding(lines, needle);
  if (found.length !== 1) {
    fail(
      `${where} holds ${found.length} line(s) carrying ${JSON.stringify(needle)}, expected exactly one`,
    );
  }
  return found[0];
}

/** The nearest enclosing `function`/`class` declaration above a line. */
function enclosingDeclaration(lines, lineNumber) {
  for (let index = lineNumber - 1; index >= 0; index -= 1) {
    const fn = /^(?:async )?function ([\w$ɵ]+)\s*\(/.exec(lines[index]);
    if (fn) return { name: fn[1], line: index + 1, kind: 'function' };
    const cls = /^class ([\w$ɵ]+)/.exec(lines[index]);
    if (cls) return { name: cls[1], line: index + 1, kind: 'class' };
  }
  return null;
}

/** The 1-indexed line range a `path:start[-end]` citation names. */
function citation(citationText, where) {
  const match = CITATION.exec(String(citationText ?? ''));
  if (match === null) fail(`${where} is not a \`path:start[-end]\` citation`);
  const start = Number(match[2]);
  const end = match[3] === undefined ? start : Number(match[3]);
  if (start < 1 || end < start) fail(`${where} is not a line range`);
  return { path: match[1], start, end };
}

/** Every line of a cited range, from the file the citation names. */
function citedLines(citationText, where) {
  const { path, start, end } = citation(citationText, where);
  const absolute = join(ROOT, path);
  requireFile(absolute, `${where} cites it`);
  const lines = readFileSync(absolute, 'utf8').split('\n');
  if (end > lines.length) {
    fail(`${where} cites line ${end} of a ${lines.length}-line file`);
  }
  return { path, start, end, lines: lines.slice(start - 1, end) };
}

/** A citation carries every fragment it is quoted for. */
function assertQuotation(quotation, where) {
  if (!isObject(quotation)) fail(`missing ${where}`);
  strings(quotation, ['at', 'why'], where);
  if (!Array.isArray(quotation.contains) || quotation.contains.length === 0) {
    fail(`${where}.contains is empty`);
  }
  const cited = citedLines(quotation.at, `${where}.at`);
  for (const fragment of quotation.contains) {
    if (typeof fragment !== 'string' || fragment === '') {
      fail(`${where}.contains holds an empty fragment`);
    }
    if (!cited.lines.some((line) => line.includes(fragment))) {
      fail(
        `${where} quotes ${JSON.stringify(fragment)} at ${quotation.at}, and no cited line carries it - the quotation lost its anchor`,
      );
    }
  }
}

/** The keys an object literal `const NAME = { … };` declares, in order. */
function objectLiteralKeys(text, name) {
  const start = text.indexOf(`const ${name} = {`);
  if (start === -1) return null;
  const end = text.indexOf('\n};', start);
  const body = text.slice(start, end);
  return [
    ...body.matchAll(/^\s{2}(?:'([^']+)'|([\w$ɵ][\w$]*))\s*(?::|,|$)/gm),
  ].map((match) => match[1] ?? match[2]);
}

/**
 * The top-level keys of one object literal that opens on `startIndex`
 * (0-based, the line carrying its opening brace). Depth-aware, so a nested
 * object contributes its own key and none of its members.
 */
function literalKeysAt(lines, startIndex) {
  const keys = [];
  let depth = 0;
  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];
    if (index === startIndex) {
      depth = 1;
      continue;
    }
    if (depth === 1) {
      const match = /^\s*([\w$ɵ][\w$]*)\s*(?::|,|$)/.exec(line);
      if (match !== null) keys.push(match[1]);
    }
    for (const character of line) {
      if (character === '{') depth += 1;
      else if (character === '}') depth -= 1;
    }
    if (depth <= 0) break;
  }
  return keys;
}

/** The files below a directory whose name ends with `suffix`, sorted. */
function filesUnder(directory, suffix) {
  requireFile(directory, 'run npm ci at the fixture');
  return readdirSync(directory)
    .filter((entry) => entry.endsWith(suffix))
    .sort()
    .map((entry) => join(directory, entry));
}

// -------------------------------------------------- the readers (derivation) ----

/** One install of `@angular/core`, as the files it ships. */
function readInstall(spec) {
  const coreRoot = join(spec.modules, '@angular', 'core');
  const manifest = join(coreRoot, 'package.json');
  requireFile(manifest, 'run npm ci at the fixture');
  const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
  if (typeof pkg.version !== 'string' || pkg.version === '') {
    fail(`${displayPath(manifest)} declares no version`);
  }
  const chunkDir = join(coreRoot, 'fesm2022');
  const chunks = filesUnder(chunkDir, '.mjs').map((path) => ({
    name: path.slice(chunkDir.length + 1),
    path,
    text: readFileSync(path, 'utf8'),
  }));
  const typesDir = join(coreRoot, 'types');
  const types = filesUnder(typesDir, '.d.ts').map((path) => ({
    name: path.slice(typesDir.length + 1),
    path,
    text: readFileSync(path, 'utf8'),
  }));
  return { ...spec, version: pkg.version, manifest, chunks, types };
}

/** How often each needle occurs in one install, per chunk and in all. */
function countNeedles(install, needles) {
  const counts = {};
  for (const needle of needles) {
    const perChunk = {};
    let total = 0;
    for (const chunk of install.chunks) {
      const found = matchCount(chunk.text, needle);
      if (found > 0) {
        perChunk[chunk.name] = found;
        total += found;
      }
    }
    counts[needle] = { total, perChunk };
  }
  return counts;
}

/** How often a needle occurs in one install's declaration files. */
function countInTypes(install, needle) {
  const perFile = {};
  let total = 0;
  for (const file of install.types) {
    const found = matchCount(file.text, needle);
    if (found > 0) {
      perFile[file.name] = found;
      total += found;
    }
  }
  return { total, perFile };
}

/** The one chunk that declares `class LBoundary {`; the machinery lives there. */
function machineryChunk(install) {
  const found = install.chunks.filter((chunk) =>
    chunk.text.includes('class LBoundary {'),
  );
  if (install.label === 'repo') {
    if (found.length !== 0) {
      fail(
        `${displayPath(install.manifest)}'s install now declares ${found.length} chunk(s) carrying \`class LBoundary {\`, so the 22.1.8 absence this recording states moved`,
      );
    }
    return null;
  }
  if (found.length !== 1) {
    fail(
      `${install.label} install declares ${found.length} chunks carrying \`class LBoundary {\`, expected exactly one`,
    );
  }
  return found[0];
}

/** The keys `@angular/router` adds to the same `ng` global. */
function routerPublishedKeys(install) {
  const dir = join(install.modules, '@angular', 'router', 'fesm2022');
  if (!existsSync(dir)) return [];
  const keys = [];
  for (const path of filesUnder(dir, '.mjs')) {
    for (const match of readFileSync(path, 'utf8').matchAll(
      /publishNonCoreGlobalUtil\(\s*['"]([^'"]+)['"]/g,
    )) {
      keys.push(match[1]);
    }
  }
  return keys;
}

/**
 * The keys one install publishes on the page's `ng` global, as `ng` builds it:
 * the external table, the internal table where the build publishes it, and the
 * router's own three.
 */
function publishedGlobalUtils(install) {
  const debug = install.chunks.find((chunk) =>
    chunk.text.includes('const externalCoreGlobalUtils = {'),
  );
  if (debug === undefined) {
    fail(
      `${install.label} install declares no \`externalCoreGlobalUtils\` table`,
    );
  }
  const external = objectLiteralKeys(debug.text, 'externalCoreGlobalUtils');
  if (external === null || external.length === 0) {
    fail(
      `${install.label} install's \`externalCoreGlobalUtils\` table is empty`,
    );
  }
  const internal = objectLiteralKeys(debug.text, 'internalCoreGlobalUtils');
  const publishesInternal = debug.text.includes(
    'Object.entries(internalCoreGlobalUtils)',
  );
  const router = routerPublishedKeys(install);
  return {
    chunk: debug.name,
    external,
    internal: internal ?? [],
    publishesInternal,
    router,
    keys: [
      ...external,
      ...(publishesInternal ? (internal ?? []) : []),
      ...router,
    ].sort(),
  };
}

/** The stock `ErrorHandler`: its own instance fields, its methods, its source. */
function readStockHandler(install) {
  const chunk = install.chunks.find((candidate) =>
    candidate.text.includes('class ErrorHandler {'),
  );
  if (chunk === undefined) {
    fail(`${install.label} install declares no \`class ErrorHandler {\``);
  }
  const start = chunk.text.indexOf('class ErrorHandler {');
  const end = chunk.text.indexOf('\n}', start);
  if (end === -1) fail(`${displayPath(chunk.path)} never closes ErrorHandler`);
  const source = chunk.text.slice(start, end + 2);
  const body = source.slice('class ErrorHandler {'.length);
  const fields = [...body.matchAll(/^\s{2}([\w$]+)\s*=/gm)].map((m) => m[1]);
  const methods = [...body.matchAll(/^\s{2}([\w$]+)\s*\(/gm)].map((m) => m[1]);
  const lineOf = (index) => chunk.text.slice(0, index).split('\n').length;
  return {
    chunk: chunk.name,
    lines: `${lineOf(start)}-${lineOf(end)}`,
    source: source.replace(/\s+/g, ' ').trim(),
    ownKeys: fields,
    methods,
    declaresOnViewError:
      fields.includes('onViewError') || methods.includes('onViewError'),
  };
}

/**
 * The chunks of the two packages that may declare the `ErrorHandler` provider
 * record: `@angular/core` defines the class, `@angular/platform-browser` puts the
 * token in the injector.
 */
function providerChunks(install) {
  const chunks = [];
  for (const name of ['core', 'platform-browser']) {
    const dir = join(install.modules, '@angular', name, 'fesm2022');
    if (!existsSync(dir)) continue;
    for (const path of filesUnder(dir, '.mjs')) {
      chunks.push({
        package: `@angular/${name}`,
        path,
        text: readFileSync(path, 'utf8'),
      });
    }
  }
  return chunks;
}

/**
 * The provider record a page's injector answers for the `ErrorHandler` token,
 * and the factory it names.
 */
function readHandlerProvider(install) {
  for (const chunk of providerChunks(install)) {
    const index = chunk.text.indexOf('provide: ErrorHandler,');
    if (index === -1) continue;
    const lines = chunk.text.split('\n');
    const at = chunk.text.slice(0, index).split('\n').length;
    const window = lines.slice(at - 1, at + 2).join(' ');
    const useFactory = /useFactory:\s*([\w$]+)/.exec(window);
    if (useFactory === null) {
      fail(
        `${displayPath(chunk.path)}:${at} names no \`useFactory\` for ErrorHandler`,
      );
    }
    const factoryLine = soleLine(
      lines,
      `function ${useFactory[1]}(`,
      displayPath(chunk.path),
    );
    const factoryEnd = lines.indexOf('}', factoryLine - 1);
    return {
      package: chunk.package,
      chunk: displayPath(chunk.path),
      recordAt: `${displayPath(chunk.path)}:${at}-${at + 2}`,
      provide: 'ErrorHandler',
      useFactory: useFactory[1],
      factoryAt: `${displayPath(chunk.path)}:${factoryLine}-${factoryEnd + 1}`,
      factoryBody: lines
        .slice(factoryLine - 1, factoryEnd + 1)
        .join('\n')
        .replace(/\s+/g, ' ')
        .trim(),
    };
  }
  fail(
    `${install.label} install declares no \`provide: ErrorHandler,\` record in @angular/core or @angular/platform-browser; the handler token this milestone patches is provided nowhere it ships`,
  );
  return null;
}

/**
 * Every profiler emission site that hands `createAndRenderEmbeddedLView` a
 * context which is not an object, plus the one that builds its context from a
 * ternary, each by line.
 */
function readEmbeddedViewContexts(chunk) {
  const lines = chunk.text.split('\n');
  const sites = [];
  lines.forEach((line, index) => {
    if (!line.includes('createAndRenderEmbeddedLView(')) return;
    const literal =
      /createAndRenderEmbeddedLView\([^,]+,[^,]+,\s*(null|undefined)\s*,/.exec(
        line,
      );
    if (literal === null) return;
    sites.push({
      line: index + 1,
      context: literal[1],
      via: 'literal',
      enclosing: enclosingDeclaration(lines, index + 1),
      call: line.trim(),
    });
  });
  const ternary = linesHolding(
    lines,
    'matchingTemplateIndex === primaryTemplateIndex ? undefined : {',
  );
  if (ternary.length === 1) {
    const definedAt = ternary[0];
    const branch = /primaryTemplateIndex \? (\w+) :/.exec(lines[definedAt - 1]);
    const callAt = soleLine(
      lines.slice(definedAt - 1, definedAt + 8),
      'createAndRenderEmbeddedLView(hostLView, templateTNode, context,',
      'the @boundary view creation',
    );
    const absolute = definedAt - 1 + callAt;
    sites.push({
      line: absolute,
      context: branch === null ? 'unknown' : branch[1],
      via: 'ternary',
      definedAt,
      enclosing: enclosingDeclaration(lines, absolute),
      call: lines[absolute - 1].trim(),
    });
  }
  return sites.sort((left, right) => left.line - right.line);
}

/** The `ProfilerEvent` literal the page agent hard-codes, as name and number. */
function agentProfilerLiteral(text) {
  const start = text.indexOf('var ProfilerEvent = {');
  if (start === -1) {
    fail('extension/agent-main.js carries no `var ProfilerEvent = {` literal');
  }
  const end = text.indexOf('};', start);
  if (end === -1) fail("the agent's ProfilerEvent literal never closes");
  const values = [
    ...text
      .slice(start, end)
      .matchAll(/^[ \t]{2,}([\w$]+):[ \t]*(\d+),[ \t]*$/gm),
  ].map((match) => ({ name: match[1], value: Number(match[2]) }));
  if (values.length === 0) {
    fail("the agent's ProfilerEvent literal holds no value");
  }
  const lineOf = (index) => text.slice(0, index).split('\n').length;
  return { values, startLine: lineOf(start), endLine: lineOf(end) };
}

/** The two `details` object literals an installed chunk builds, by anchor. */
function readDetailsShapes(chunk) {
  const lines = chunk.text.split('\n');
  const sites = [];
  lines.forEach((line, index) => {
    if (!/^\s*const details = \{$/.test(line)) return;
    const enclosing = enclosingDeclaration(lines, index + 1);
    let end = index;
    let depth = 0;
    for (; end < lines.length; end += 1) {
      for (const character of lines[end]) {
        if (character === '{') depth += 1;
        else if (character === '}') depth -= 1;
      }
      if (end > index && depth <= 0) break;
    }
    sites.push({
      at: `${displayPath(chunk.path)}:${index + 1}-${end + 1}`,
      enclosing: enclosing === null ? null : enclosing.name,
      keys: literalKeysAt(lines, index),
    });
  });
  return sites;
}

// -------------------------------------------------------------- the agent ----

const AGENT = once(() => {
  const source = readFileSync(
    requireFile(AGENT_PATH, 'the page agent is part of this repository'),
    'utf8',
  );
  const lines = source.split('\n');
  const resetMap = linesHolding(lines, 'prevEpochs = new WeakMap();');
  return {
    source,
    lines,
    profiler: agentProfilerLiteral(source),
    setLine: soleLine(
      lines,
      'prevEpochs.set(instance, next)',
      'extension/agent-main.js',
    ),
    getLine: soleLine(
      lines,
      'var prev = prevEpochs.get(instance);',
      'extension/agent-main.js',
    ),
    mapLine: soleLine(
      lines,
      'var prevEpochs = new WeakMap();',
      'extension/agent-main.js',
    ),
    resetMapLine: resetMap.at(-1),
    closeCycleLine: soleLine(
      lines,
      'function closeCycle() {',
      'extension/agent-main.js',
    ),
    microtaskLine: soleLine(
      lines,
      'globalThis.queueMicrotask(closeCycle);',
      'extension/agent-main.js',
    ),
    forEachLine: soleLine(
      lines,
      'c.checks.forEach(function (check, instance) {',
      'extension/agent-main.js',
    ),
    serializeLine: soleLine(
      lines,
      'var changedNodeIds = diffEpochs(instance, graph);',
      'extension/agent-main.js',
    ),
    dispatchLine: soleLine(
      lines,
      'dispatch(RECORD_EVENT, facts);',
      'extension/agent-main.js',
    ),
    createCheckLine: soleLine(
      lines,
      'getOrCreateCheck(instance).events.push(event);',
      'extension/agent-main.js',
    ),
    onEventLine: soleLine(
      lines,
      'function onEvent(event, instance, eventFn) {',
      'extension/agent-main.js',
    ),
  };
});

/** The line range `function onEvent(...)` spans, so a throw can be placed outside it. */
const ON_EVENT_RANGE = once(() => {
  const lines = AGENT().lines;
  const start = AGENT().onEventLine;
  let depth = 0;
  for (let index = start - 1; index < lines.length; index += 1) {
    for (const character of lines[index]) {
      if (character === '{') depth += 1;
      else if (character === '}') depth -= 1;
    }
    if (depth === 0) return { start, end: index + 1 };
  }
  fail("extension/agent-main.js's onEvent never closes");
  return { start, end: 0 };
});

// ------------------------------------------------- the boot and the drive ----

/**
 * Boots the shipped agent in this realm with the page globals its own suite
 * mocks, hands the caller a synchronous page, and restores this process's global
 * object afterwards. `queueMicrotask` is captured rather than run, so a frame is
 * closed by the caller and a throw inside `closeCycle` is measured rather than
 * escaping into the test runner.
 */
function withAgent(body) {
  const saved = {
    ng: globalThis.ng,
    Zone: globalThis.Zone,
    CustomEvent: globalThis.CustomEvent,
    dispatchEvent: globalThis.dispatchEvent,
    performance: globalThis.performance,
    queueMicrotask: globalThis.queueMicrotask,
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,
    recorder: globalThis.__ngRecorder,
  };
  /** @type {any[]} */
  const dispatched = [];
  /** @type {Array<() => void>} */
  const queued = [];
  /** @type {Array<{ fn: () => void, ms: number }>} */
  const timers = [];
  /** @type {Error[]} */
  const errors = [];
  let graph = null;
  const ng = {
    ɵsetProfiler() {
      return () => {};
    },
    ɵgetSignalGraph: () => graph,
    getHostElement: () => ({ tagName: 'APP-COUNTER' }),
    getDirectiveMetadata: () => ({ changeDetection: 1 }),
    getInjector: () => ({ get: () => null }),
  };

  globalThis.CustomEvent = function (type, options) {
    return { type, detail: options && options.detail };
  };
  globalThis.dispatchEvent = (event) => {
    dispatched.push(event);
  };
  globalThis.performance = { now: () => 4242 };
  globalThis.queueMicrotask = (callback) => {
    queued.push(callback);
  };
  globalThis.setTimeout = (fn, ms) => {
    timers.push({ fn, ms });
    return timers.length;
  };
  globalThis.clearTimeout = () => {};
  globalThis.setInterval = (fn, ms) => {
    timers.push({ fn, ms });
    return timers.length;
  };
  globalThis.clearInterval = () => {};
  globalThis.ng = ng;
  delete globalThis.Zone;
  delete globalThis.__ngRecorder;

  try {
    vm.runInThisContext(AGENT().source, { filename: 'agent-main.js' });
    const recorder = globalThis.__ngRecorder;
    if (recorder === undefined) {
      fail('extension/agent-main.js published no `__ngRecorder` handle');
    }
    const subscriber = recorder.getSubscriber();
    if (typeof subscriber !== 'function') {
      fail('extension/agent-main.js installed no profiler subscriber');
    }
    /** The page as the caller drives it: one pass, one frame close, one reading. */
    const page = {
      subscriber,
      dispatched,
      errors,
      timers,
      get graph() {
        return graph;
      },
      set graph(next) {
        graph = next;
      },
      /** One recorded emission, exactly as the profiler would pass it. */
      open(instance) {
        subscriber(2, instance);
      },
      /** The matching end, exactly as the profiler would pass it. */
      close(instance) {
        subscriber(3, instance);
      },
      /** Everything `onEvent` queued, run in arrival order; a throw is kept. */
      drain() {
        while (queued.length > 0) {
          const run = queued.shift();
          try {
            run();
          } catch (error) {
            errors.push(error);
          }
        }
      },
      /** One change-detection pass: a template-update pair, then its frame. */
      frame(instance) {
        page.open(instance);
        page.close(instance);
        page.drain();
      },
      /** Every `angular-ai:record` the page received, in arrival order. */
      records() {
        return dispatched.filter((event) => event.type === 'angular-ai:record');
      },
      /** The page's own event types, in arrival order. */
      eventTypes() {
        return dispatched.map((event) => event.type);
      },
      reset() {
        recorder.reset();
      },
    };
    return body(page);
  } finally {
    try {
      globalThis.__ngRecorder?.reset?.();
    } catch (error) {
      /* a reset that throws must not mask the reading */
    }
    globalThis.ng = saved.ng;
    globalThis.Zone = saved.Zone;
    globalThis.CustomEvent = saved.CustomEvent;
    globalThis.dispatchEvent = saved.dispatchEvent;
    globalThis.performance = saved.performance;
    globalThis.queueMicrotask = saved.queueMicrotask;
    globalThis.setTimeout = saved.setTimeout;
    globalThis.clearTimeout = saved.clearTimeout;
    globalThis.setInterval = saved.setInterval;
    globalThis.clearInterval = saved.clearInterval;
    globalThis.__ngRecorder = saved.recorder;
  }
}

/** One signal graph whose node epochs and ids the caller names. */
function signalGraph(epochs, ids = ['n0', 'n1']) {
  return {
    nodes: epochs.map((epoch, index) => ({
      id: ids[index],
      kind: index === 1 ? 'template' : 'signal',
      label: index === 1 ? 'app-counter' : 'count',
      epoch,
    })),
    edges: ids.length > 1 ? [{ consumer: 1, producer: 0 }] : [],
  };
}

/** How a driven instance reads in the record. */
function instanceKind(instance) {
  if (instance === null) return 'null';
  if (instance === undefined) return 'undefined';
  return typeof instance;
}

/** Wait: the identity two passes must share to be the same key. */
const INSTANCE_A = { constructor: { name: 'Counter' } };
const INSTANCE_B = { constructor: { name: 'Other' } };

// ----------------------------------------------------------- measurements ----

/** Every profiler value the agent names, driven once with a non-object instance. */
function measurePerEvent() {
  return AGENT().profiler.values.map((entry) =>
    withAgent((page) => {
      page.graph = signalGraph([1, 1]);
      let escaped = null;
      try {
        page.subscriber(entry.value, undefined);
      } catch (error) {
        escaped = error;
      }
      page.drain();
      const error = escaped ?? page.errors[0] ?? null;
      return {
        name: entry.name,
        value: entry.value,
        throws: escaped !== null || page.errors.length > 0 ? 1 : 0,
        constructor:
          error === null || error === undefined
            ? null
            : (error.constructor?.name ?? null),
        message: error === null || error === undefined ? null : error.message,
        onEventCaughtIt: escaped !== null,
        records: page.records().length,
      };
    }),
  );
}

/** One frame driven with a non-object instance, and what the page received. */
function measureThrowFrame(instance) {
  return withAgent((page) => {
    page.graph = signalGraph([1, 1]);
    let escaped = null;
    try {
      page.frame(instance);
    } catch (error) {
      escaped = error;
    }
    const error = escaped ?? page.errors[0] ?? null;
    return {
      instance: instanceKind(instance),
      throws: error === null ? 0 : 1,
      constructor: error === null ? null : (error.constructor?.name ?? null),
      message: error === null ? null : error.message,
      records: page.records().length,
      events: page.eventTypes(),
      checks:
        page.records().length > 0 ? page.records()[0].detail.checks.length : 0,
    };
  });
}

/** One frame carrying two non-object keys, so the cost per frame is measured. */
function measureTwoKeysInOneFrame() {
  return withAgent((page) => {
    page.graph = signalGraph([1, 1]);
    page.open(undefined);
    page.open(null);
    page.close(null);
    page.drain();
    return {
      instances: ['undefined', 'null'],
      throws: page.errors.length,
      messages: page.errors.map((error) => error.message),
      records: page.records().length,
    };
  });
}

/** Every pass the epoch record is measured across, in one page's own lifetime. */
function measureEpochs() {
  return withAgent((page) => {
    /** @type {any[]} */
    const passes = [];
    const pass = (label, instance, graph) => {
      page.graph = graph;
      const before = page.records().length;
      page.frame(instance);
      const records = page.records();
      const record = records.length > before ? records.at(-1) : null;
      passes.push({
        label,
        instance: instance === INSTANCE_A ? 'a' : 'b',
        epochs:
          graph === null || graph.nodes === undefined
            ? null
            : graph.nodes.map((node) => node.epoch),
        ids:
          graph === null || graph.nodes === undefined
            ? null
            : graph.nodes.map((node) => node.id),
        records: records.length - before,
        changedNodeIds:
          record === null ? null : record.detail.checks[0].changedNodeIds,
      });
    };
    pass('a first pass', INSTANCE_A, signalGraph([1, 1]));
    pass('a second pass, n0 moved', INSTANCE_A, signalGraph([2, 1]));
    pass('a third pass, nothing moved', INSTANCE_A, signalGraph([2, 1]));
    pass('b first pass, its own entry', INSTANCE_B, signalGraph([5, 5]));
    pass('a fourth pass, both moved', INSTANCE_A, signalGraph([3, 4]));
    pass(
      'a pass whose node ids are numbers',
      INSTANCE_A,
      signalGraph([3, 4], [1, 2]),
    );
    pass('a pass whose graph read answers nothing', INSTANCE_A, null);
    page.reset();
    pass('the first pass after reset()', INSTANCE_A, signalGraph([3, 4]));
    return passes;
  });
}

/** The whole measurement, taken once. Every number in the record comes from here. */
const measured = once(() => ({
  perEvent: measurePerEvent(),
  frames: {
    object: measureThrowFrame(INSTANCE_A),
    undefined: measureThrowFrame(undefined),
    null: measureThrowFrame(null),
  },
  twoKeysInOneFrame: measureTwoKeysInOneFrame(),
  epochs: measureEpochs(),
}));

// ------------------------------------------------------------- the record ----

const live = once(() => {
  const installs = INSTALLS.map(readInstall);
  const byLabel = new Map(installs.map((install) => [install.label, install]));
  const repo = byLabel.get('repo');
  const fixture = byLabel.get('fixture');
  const fixtureChunk = machineryChunk(fixture);
  const debug = fixture.chunks.find((chunk) =>
    chunk.text.includes('const externalCoreGlobalUtils = {'),
  );
  const appConfig = readFileSync(
    requireFile(APP_CONFIG_PATH, "the fixture's bootstrap config"),
    'utf8',
  );
  const fixtureLines = fixtureChunk.text.split('\n');
  return {
    installs,
    repo,
    fixture,
    fixtureChunk,
    fixtureLines,
    debug,
    appConfig,
    appConfigLines: appConfig.split('\n'),
    counts: {
      repo: countNeedles(repo, MACHINERY),
      fixture: countNeedles(fixture, MACHINERY),
    },
    types: {
      repo: countInTypes(repo, 'ErrorDetails'),
      fixture: countInTypes(fixture, 'ErrorDetails'),
    },
    published: {
      repo: publishedGlobalUtils(repo),
      fixture: publishedGlobalUtils(fixture),
    },
    handler: {
      repo: readStockHandler(repo),
      fixture: readStockHandler(fixture),
    },
    provider: {
      repo: readHandlerProvider(repo),
      fixture: readHandlerProvider(fixture),
    },
    embeddedViews: readEmbeddedViewContexts(fixtureChunk),
    detailsShapes: readDetailsShapes(fixtureChunk),
  };
});

function loadRecord() {
  requireFile(RECORD_PATH, 'the measurement has not been recorded');
  return JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
}

/** The one `path:line` in an install that carries `needle`, or a named failure. */
function chunkAnchor(install, needle, where) {
  const hits = [];
  for (const chunk of install.chunks) {
    chunk.text.split('\n').forEach((line, index) => {
      if (line.includes(needle)) {
        hits.push(`${displayPath(chunk.path)}:${index + 1}`);
      }
    });
  }
  if (hits.length !== 1) {
    fail(
      `${where}: ${hits.length} line(s) in the ${install.version} install carry ${JSON.stringify(needle)}, expected exactly one`,
    );
  }
  return hits[0];
}

/** The `cause` the wrapping class sets, read inside that class's own block. */
function wrappedCauseAnchor(install) {
  const where = citation(
    chunkAnchor(
      install,
      'class ErrorBoundaryWrappedError extends Error {',
      'the wrapping class',
    ),
    'the wrapping class',
  );
  const lines = readFileSync(join(ROOT, where.path), 'utf8').split('\n');
  const end = blockEndIndex(lines, where.start - 1);
  const index = lines.findIndex(
    (line, at) =>
      at >= where.start - 1 && at <= end && line.includes('cause: error'),
  );
  if (index === -1) {
    fail(
      `${where.path}:${where.start}-${end + 1} wraps no value with a \`cause\`, and SC2 reads that cause`,
    );
  }
  return `${where.path}:${index + 1}`;
}

/** The 0-based index of the line `lines[startIndex]`'s block closes on. */
function blockEndIndex(lines, startIndex) {
  let depth = 0;
  for (let index = startIndex; index < lines.length; index += 1) {
    for (const character of lines[index]) {
      if (character === '{') depth += 1;
      else if (character === '}') depth -= 1;
    }
    if (depth <= 0) return index;
  }
  fail(`the block opening on line ${startIndex + 1} never closes`);
  return startIndex;
}

// ------------------------------------------------ the hook record (source) ----

/** The `@boundary` record, read from the fixture's installed chunk and the file. */
const HOOK = once(() => {
  const { fixture, fixtureChunk, fixtureLines: lines } = live();
  const path = displayPath(fixtureChunk.path);
  const indexOf = (needle, where) => soleLine(lines, needle, where) - 1;
  const at = (needle, where) => `${path}:${soleLine(lines, needle, where)}`;
  const span = (startIndex) =>
    `${path}:${startIndex + 1}-${blockEndIndex(lines, startIndex) + 1}`;

  const boundaryClass = indexOf('class LBoundary {', 'the boundary class');
  // The class carries one `reset()`, found from the body it exists for rather
  // than by its name, which four classes in this chunk share.
  const errorClear = indexOf(
    '    this.error = null;',
    'the boundary reset body',
  );
  let resetMethod = errorClear;
  while (resetMethod > 0 && !/^\s{2}reset\(\) \{$/.test(lines[resetMethod])) {
    resetMethod -= 1;
  }
  if (!/^\s{2}reset\(\) \{$/.test(lines[resetMethod])) {
    fail('the boundary reset body has no enclosing `reset()`');
  }
  const contextLiteral = indexOf(
    'matchingTemplateIndex === primaryTemplateIndex ? undefined : {',
    'the @error view context',
  );
  const boundaryDetails = indexOf(
    'details.boundary = {',
    'the boundary detail block',
  );
  const creatingView = indexOf(
    'const declarationInstance = hostLView[DECLARATION_COMPONENT_VIEW][CONTEXT];',
    'the construction path declaration',
  );

  const classFields = lines
    .slice(boundaryClass + 1, blockEndIndex(lines, boundaryClass))
    .map((line) => /^\s{2}([\w$]+)(?: = (.+))?;$/.exec(line))
    .filter((match) => match !== null)
    .map((match) => ({ name: match[1], initial: match[2] ?? null }));

  const resetBody = lines
    .slice(resetMethod + 1, blockEndIndex(lines, resetMethod))
    .map((line) => line.trim())
    .filter((line) => line !== '');

  const shapes = live().detailsShapes.map((shape) => ({
    ...shape,
    name: shape.keys.includes('caughtBy')
      ? 'detectChangesInView'
      : 'boundaryConstruction',
    carriesCaughtBy: shape.keys.includes('caughtBy'),
  }));

  const pending = fixture.chunks.find((chunk) =>
    chunk.text.includes('function provideBrowserGlobalErrorListeners() {'),
  );
  if (pending === undefined) {
    fail(
      `${displayPath(fixture.manifest)}'s install declares no \`provideBrowserGlobalErrorListeners\`; the provider the fixture is said to declare moved`,
    );
  }
  const pendingPath = displayPath(pending.path);
  const pendingIndex = (needle) =>
    soleLine(pending.text.split('\n'), needle, pendingPath) - 1;

  return {
    path,
    boundaryApi: {
      create: at('function ɵɵboundaryCreate(index) {', 'the boundary create'),
      update: at(
        'function ɵɵboundaryUpdate(slotIndex, matchingTemplateIndex, primaryTemplateIndex) {',
        'the boundary update',
      ),
      get: at('function ɵɵgetBoundary(index) {', 'the boundary getter'),
      instructionNamespaceAt: at(
        "'ɵɵboundaryCreate': ɵɵboundaryCreate,",
        'the instruction namespace',
      ),
    },
    retainedState: {
      classAt: span(boundaryClass),
      fields: classFields,
      resetAt: span(resetMethod),
      resetBody,
    },
    details: {
      paths: shapes,
      boundaryAddedAt: span(boundaryDetails),
      boundaryField: /details\.([\w$]+) = \{/.exec(lines[boundaryDetails])[1],
      boundaryKeys: literalKeysAt(lines, boundaryDetails),
      constructionAt: span(creatingView),
    },
    errorView: {
      contextAt: span(contextLiteral),
      keys: literalKeysAt(lines, contextLiteral),
      primaryContext: /primaryTemplateIndex \? (\w+) :/.exec(
        lines[contextLiteral],
      )[1],
      resetSource: '() => boundary.reset()',
    },
    readers: {
      onViewErrorAt: linesHolding(lines, 'errorHandler.onViewError(').map(
        (line) => `${path}:${line}`,
      ),
      handleErrorAt: linesHolding(lines, 'errorHandler.handleError(').map(
        (line) => `${path}:${line}`,
      ),
      truthinessAt: linesHolding(lines, 'if (errorHandler.onViewError) {').map(
        (line) => `${path}:${line}`,
      ),
    },
    declarations: {
      throwingViewAt: at(
        'const declarationInstance = lView[DECLARATION_COMPONENT_VIEW][CONTEXT];',
        'the throwing view declaration',
      ),
      boundaryViewAt: at(
        'const boundaryComponentView = hostLView[DECLARATION_COMPONENT_VIEW][CONTEXT];',
        'the boundary view declaration',
      ),
      constructionViewAt: `${path}:${creatingView + 1}`,
    },
    wrapped: {
      functionAt: chunkAnchor(
        fixture,
        'function encapsulateBoundaryError(error) {',
        'the wrapping function',
      ),
      classAt: chunkAnchor(
        fixture,
        'class ErrorBoundaryWrappedError extends Error {',
        'the wrapping class',
      ),
      causeAt: wrappedCauseAnchor(fixture),
    },
    globalListeners: {
      provideAt: `${pendingPath}:${pendingIndex('function provideBrowserGlobalErrorListeners() {') + 1}`,
      errorListenerAt: `${pendingPath}:${pendingIndex("window.addEventListener('error', errorListener);") + 1}`,
      rejectionListenerAt: `${pendingPath}:${pendingIndex("window.addEventListener('unhandledrejection', rejectionListener);") + 1}`,
    },
    provider: null,
  };
});

// -------------------------------------------- the version question (source) ----

/** The page-observable version question, enumerated on both installs. */
const VERSION = once(() => {
  const { repo, fixture, published, handler, provider, counts, types } = live();
  const keysOf = (install) => published[install.label].keys;
  const only = (left, right) =>
    keysOf(left).filter((key) => !keysOf(right).includes(key));
  return {
    installs: [repo, fixture].map((install) => ({
      label: install.label,
      version: install.version,
      manifest: displayPath(install.manifest),
      publishedKeyCount: keysOf(install).length,
    })),
    published: {
      repo: {
        count: keysOf(repo).length,
        keys: keysOf(repo),
        publishesInternal: published.repo.publishesInternal,
        internal: published.repo.internal,
      },
      fixture: {
        count: keysOf(fixture).length,
        keys: keysOf(fixture),
        publishesInternal: published.fixture.publishesInternal,
        internal: published.fixture.internal,
      },
      addedByTheNewerInstall: only(fixture, repo),
      removedByTheNewerInstall: only(repo, fixture),
      shared: keysOf(fixture).filter((key) => keysOf(repo).includes(key)),
    },
    handler: {
      repo: handler.repo,
      fixture: handler.fixture,
      sourceIdentical: handler.repo.source === handler.fixture.source,
      ownKeysIdentical:
        JSON.stringify(handler.repo.ownKeys) ===
        JSON.stringify(handler.fixture.ownKeys),
    },
    providerRecords: {
      repo: provider.repo,
      fixture: provider.fixture,
      identical:
        provider.repo.provide === provider.fixture.provide &&
        provider.repo.useFactory === provider.fixture.useFactory &&
        provider.repo.factoryBody === provider.fixture.factoryBody,
    },
    versionNameOnThePage: {
      matching: keysOf(fixture).filter((key) => /version/i.test(key)),
      reportedBy: keysOf(fixture).filter((key) => /version/i.test(key)).length,
    },
    counts: {
      repo: Object.fromEntries(
        MACHINERY.map((needle) => [needle, counts.repo[needle]]),
      ),
      fixture: Object.fromEntries(
        MACHINERY.map((needle) => [needle, counts.fixture[needle]]),
      ),
      machineryChunk: {
        chunk: live().fixtureChunk.name,
        onViewError:
          counts.fixture.onViewError.perChunk[live().fixtureChunk.name] ?? 0,
        boundaryCreate:
          counts.fixture.boundaryCreate.perChunk[live().fixtureChunk.name] ?? 0,
        LBoundary:
          counts.fixture.LBoundary.perChunk[live().fixtureChunk.name] ?? 0,
      },
      errorDetailsInTypes: { repo: types.repo, fixture: types.fixture },
    },
  };
});

// ----------------------------------------------------------- the recording ----

/** The quotations from S10 that the hook record rests on, each with its anchor. */
const QUOTATIONS = [
  {
    at: '.project/research/s10-answer.md:140-141',
    why: "S10's measurement of the fixture's rendered @error view: the primary view removed, the fallback rendered, and the text it carried",
    contains: ['"dom":{"primary":false,"fallback":true', 'caught: S10 spike'],
  },
  {
    at: '.project/research/s10-answer.md:142-144',
    why: "S10's measurement of ng.getContext() on a node inside the @error view",
    contains: [
      '"context":{"keys":["$error","$reset"]',
      '"errorCtor":"Error"',
      '"hasReset":true',
      '"resetSource":"() => boundary.reset()"',
    ],
  },
  {
    at: '.project/research/s10-answer.md:148-151',
    why: "S10's measurement of the onViewError payload on the @boundary-construction path and of the ErrorDetails field names that arrived",
    contains: [
      '"onViewError":[{"name":"Error"',
      '"declarationType":"S10BoundaryHost"',
      '"boundaryType":"S10BoundaryHost"',
      '"restKeys":["declarationInstance","declarationType","caughtBy","boundary"]',
    ],
  },
  {
    at: '.project/research/s10-answer.md:169-175',
    why: 'S10 measured the throwing component and the declaring component apart in one record',
    contains: [
      '"declarationType":"S10Child"',
      '"boundaryType":"S10Parent"',
      '"contextKeys":["$error","$reset"]',
    ],
  },
  {
    at: '.project/research/s10-answer.md:310',
    why: "S10's record of this instrument's own TypeError, which it left uninvestigated",
    contains: [
      'TypeError: Invalid value used as weak map key',
      'extension/agent-main.js:1034',
      'prevEpochs.set(instance, next)',
      'twice per page',
    ],
  },
  {
    at: '.project/research/s10-answer.md:46',
    why: "the provider S10 cites, which is why the fixture's raw browser errors reach the handler",
    contains: [
      'provideBrowserGlobalErrorListeners()',
      'spikes/ng222-app/src/app/app.config.ts:6',
    ],
  },
];

/** Assembles the whole recording from the derivations above. */
function buildRecord() {
  const { repo, fixture, counts, types } = live();
  const hook = HOOK();
  const version = VERSION();
  const reading = measured();
  const failure = reading.frames.undefined;
  const objectFrame = reading.frames.object;
  const onEvent = ON_EVENT_RANGE();
  const passes = reading.epochs;
  const passOf = (label) => {
    const found = passes.find((entry) => entry.label === label);
    if (found === undefined)
      fail(`the epoch measurement lost the pass "${label}"`);
    return found;
  };
  const appConfigLine = soleLine(
    live().appConfigLines,
    'provideBrowserGlobalErrorListeners()',
    "the fixture's app.config.ts",
  );
  const shapeOf = (name) => {
    const found = hook.details.paths.find((shape) => shape.name === name);
    if (found === undefined) fail(`the chunk builds no ${name} details shape`);
    return found;
  };
  const detectChanges = shapeOf('detectChangesInView');
  const construction = shapeOf('boundaryConstruction');
  const measuredKeys = [
    ...detectChanges.keys,
    ...(hook.details.boundaryField === undefined
      ? []
      : [hook.details.boundaryField]),
  ];

  return {
    schema: 'm042-error-boundary/v1',
    milestone: 'error-boundary',
    task: 'T001',
    title:
      "The instrument's throw, the @boundary hook record and the version discriminator, measured at the plan's base",
    question:
      'Which emission makes the shipped page agent throw, what does the epoch record it protects contain, what does an Angular error boundary hand a page-side reader, and can a page say which core it runs?',
    capturedAt: CAPTURED_AT,
    environment: {
      platform: process.platform,
      shell: 'cmd.exe',
      node: process.version,
    },
    commands: {
      check: CHECK_COMMAND,
      capture:
        'M042_CAPTURE=1 node --experimental-strip-types --test "scripts/error-boundary-measure.test.mjs"',
      reproduce:
        'node --experimental-strip-types --test "scripts/error-boundary-measure.test.mjs"',
    },
    teardown: {
      ports: [4507, 3000, 4222, 9333, 9334],
      started: [],
      stopped: [],
      note: 'This task starts no server, binds no port and opens no browser: all three readings are taken from the shipped agent, the two installed chunks and the file S10 wrote. Nothing was started, so there was nothing to stop.',
    },
    instrument: {
      question:
        'Which profiler emission makes the shipped agent throw at extension/agent-main.js:1034, what does the frame lose when it does, and what does the epoch map that line protects contain?',
      finding:
        "A `TemplateUpdateStart` (ProfilerEvent value 2) whose instance is not an object reaches `getOrCreateCheck`, opens a frame, and throws `TypeError: Invalid value used as weak map key` at `prevEpochs.set(instance, next)` when the frame closes. The throw happens in `closeCycle`, which runs from `globalThis.queueMicrotask(closeCycle)` - outside the try/catch that wraps `onEvent` - so it escapes into the page and the frame's whole record is lost: the page receives its `angular-ai:state` event and no `angular-ai:record` at all. The epoch map is keyed by the profiler instance, and holds that instance's node epochs from the previous pass, so a pass can name the nodes whose epoch moved; a guard that stops the throw must leave both halves intact.",
      throw: {
        source: 'extension/agent-main.js',
        line: AGENT().setLine,
        expression: AGENT().lines[AGENT().setLine - 1].trim(),
        constructor: failure.constructor,
        message: failure.message,
        onEventCaughtIt: false,
        callPath: [
          {
            at: `extension/agent-main.js:${AGENT().closeCycleLine}`,
            code: AGENT().lines[AGENT().closeCycleLine - 1].trim(),
          },
          {
            at: `extension/agent-main.js:${AGENT().forEachLine}`,
            code: AGENT().lines[AGENT().forEachLine - 1].trim(),
          },
          {
            at: `extension/agent-main.js:${AGENT().serializeLine}`,
            code: AGENT().lines[AGENT().serializeLine - 1].trim(),
          },
          {
            at: `extension/agent-main.js:${AGENT().setLine}`,
            code: AGENT().lines[AGENT().setLine - 1].trim(),
          },
        ],
        escapeRoute: {
          frameOpenedAt: `extension/agent-main.js:${AGENT().createCheckLine}`,
          queuedAt: `extension/agent-main.js:${AGENT().microtaskLine}`,
          onEventRange: `extension/agent-main.js:${onEvent.start}-${onEvent.end}`,
          throwInsideOnEventTryCatch:
            AGENT().setLine >= onEvent.start && AGENT().setLine <= onEvent.end,
          dispatchAfterTheThrow: `extension/agent-main.js:${AGENT().dispatchLine}`,
        },
        frameRecordLost: failure.records === 0,
        occurrences: {
          count: 2,
          by: 'S10',
          quotation:
            "S10 measured this TypeError twice per page, in the app's ErrorHandler on the fixture and in window.onerror on both subjects, and left the trigger uninvestigated (s10-answer.md:310)",
        },
        reproductionStandsFor:
          "one of the two occurrences. Each occurrence is one frame: the emission opens the frame, the frame close throws once, and the forEach aborts before its dispatch - so a frame with two non-object keys still throws once (measured below). The count of two is S10's page measurement, quoted and not re-measured here; this task takes no page.",
      },
      emissions: {
        eventIds: AGENT().profiler.values,
        perEvent: reading.perEvent,
        throwingIds: reading.perEvent
          .filter((entry) => entry.throws > 0)
          .map((entry) => entry.value),
        sites: live().embeddedViews,
        anchors: {
          templateUpdateStart: `extension/agent-main.js:${AGENT().createCheckLine}`,
          preHook: soleLine(
            live().fixtureLines,
            'profiler(preHookType, context, templateFn);',
            'the installed pre-hook emission',
          ),
          updateTemplateCall: soleLine(
            live().fixtureLines,
            'executeTemplate(tView, lView, templateFn, 2, context);',
            'the installed update call',
          ),
          refreshReadsContext: soleLine(
            live().fixtureLines,
            'refreshView(tView, lView, tView.template, lView[CONTEXT]);',
            'the installed refresh',
          ),
          contextSlot: soleLine(
            live().fixtureLines,
            'lView[CONTEXT] = context;',
            'the installed context slot',
          ),
          chunk: displayPath(live().fixtureChunk.path),
        },
      },
      reproduction: {
        validInstance: objectFrame,
        undefinedInstance: reading.frames.undefined,
        nullInstance: reading.frames.null,
        twoKeysInOneFrame: reading.twoKeysInOneFrame,
      },
      epochs: {
        map: {
          declaredAt: `extension/agent-main.js:${AGENT().mapLine}`,
          declaration: AGENT().lines[AGENT().mapLine - 1].trim(),
          comment: 'instance -> Map(nodeId, epoch)',
          kind: 'WeakMap',
          keyedBy:
            "the profiler's own `instance` argument, by object identity: two passes are the same entry only when the profiler passed the same object",
          holds:
            "a Map from each node id the graph reported to that node's epoch, written after every pass",
          resetAt: `extension/agent-main.js:${AGENT().resetMapLine}`,
          resetExpression: 'prevEpochs = new WeakMap();',
        },
        passes,
        firstPass: passOf('a first pass').changedNodeIds,
        movedOne: passOf('a second pass, n0 moved').changedNodeIds,
        held: passOf('a third pass, nothing moved').changedNodeIds,
        secondInstanceFirstPass: passOf('b first pass, its own entry')
          .changedNodeIds,
        movedBoth: passOf('a fourth pass, both moved').changedNodeIds,
        numericNodeIds: passOf('a pass whose node ids are numbers')
          .changedNodeIds,
        graphUnavailable: passOf('a pass whose graph read answers nothing')
          .changedNodeIds,
        afterReset: passOf('the first pass after reset()').changedNodeIds,
        ambiguity:
          'The empty list is the honest answer for a first read, for a pass in which nothing moved, for a graph read that answered nothing and for the first pass after reset(). It therefore cannot be the *only* answer: a reader is told which nodes moved only by a list that is non-empty, and a repair that always answers the empty list is contradicted by the two passes that named them.',
        purpose:
          "The map turns a stateless full-graph read into a per-pass delta. `serializeCheck` reads the graph once and `diffEpochs` compares it with the same instance's previous pass, so the record can say which nodes actually moved in this pass rather than which nodes exist; a WeakMap so a destroyed component is not retained, and keyed by the instance so two components checked in one frame keep their own epochs apart.",
        answersTheOpenQuestion:
          'The key is the profiler instance and nothing else, so a primitive node identity cannot throw here: node ids are values inside the inner Map, and a pass whose nodes carry numeric ids records them as such (see numericNodeIds). The two-per-page error was therefore two frames, not two node identities.',
      },
    },
    hook: {
      question:
        'What exactly does an Angular error boundary hand a page-side reader, on the core the subject runs?',
      finding:
        "Two shapes, one hook. `ErrorHandler.onViewError(error, details)` receives `{declarationInstance, declarationType, caughtBy}` from the change-detection catch, and `details.boundary = {type, reset}` is added by the boundary's own ON_ERROR hook immediately before the call; the construction catch passes `{declarationInstance, declarationType, boundary}` with no `caughtBy`. `details.declarationType` is the view whose template threw, `details.boundary.type` is the component that declares the boundary - two different LViews, so two different answers. `ng.getContext()` on a node inside the rendered `@error` view answers `{$error, $reset}`, which is the only after-the-fact reader. The rendered fallback is content, never the error: S10 measured the `@error` view carrying `caught: ` and the error's own message in its own text, and a surface that quotes it would be reporting a template, not the throw.",
      install: {
        label: 'fixture',
        version: fixture.version,
        manifest: displayPath(fixture.manifest),
        chunk: hook.path,
      },
      provider: {
        at: `spikes/ng222-app/src/app/app.config.ts:${appConfigLine}`,
        text: live().appConfigLines[appConfigLine - 1].trim(),
        s10CitedAt: 'spikes/ng222-app/src/app/app.config.ts:6',
        s10CitationMatchesThisHead: false,
        note: 'S10 cited line 6; at this head the call is on line 7, and the import is line 1. The recording keeps both so the difference is visible rather than inherited.',
      },
      boundaryApi: {
        ...hook.boundaryApi,
        publishedOnNg: live().published.fixture.keys.some((key) =>
          key.includes('boundary'),
        ),
        getterReachableFromThePage: false,
      },
      retainedState: hook.retainedState,
      details: {
        paths: hook.details.paths,
        boundaryAddedAt: hook.details.boundaryAddedAt,
        boundaryField: hook.details.boundaryField,
        boundaryKeys: hook.details.boundaryKeys,
        constructionPathAt: hook.details.constructionAt,
        measured: {
          keys: measuredKeys,
          by: "S10 on the change-detection path with a child that throws inside a parent's @boundary",
          quotation: 's10-answer.md:148-151',
        },
        caughtByIsOptional: true,
        notes:
          "On the construction path `details.declarationInstance` is the declaring view's instance, so `declarationType` and `boundary.type` are the same answer there; on the change-detection path `declarationType` comes from the throwing view, so the two differ. A reader must expect both shapes and require neither field the other omits.",
      },
      errorView: {
        ...hook.errorView,
        publishedOnNg: live().published.fixture.keys.includes('getContext'),
        isTheOnlyAfterTheFactReader: true,
      },
      fallback: {
        renderedBy: "S10's own JIT probe component",
        primary: false,
        fallback: true,
        text: 'caught: S10 spike: thrown inside the @boundary primary view',
        prefix: 'caught: ',
        prefixIsTheProbesOwnTemplate: true,
        carriesTheErrorsOwnMessage: true,
        neverTheError:
          "The prefix and the surrounding markup are the probe's template. S10's record keeps the rendered text and the thrown message in different fields, which is what lets SC2 forbid quoting the view.",
      },
      readers: hook.readers,
      declarations: hook.declarations,
      wrapped: hook.wrapped,
      globalListeners: hook.globalListeners,
      quotations: QUOTATIONS,
      absentInRepo: {
        install: displayPath(repo.manifest),
        version: repo.version,
        counts: version.counts.repo,
        errorDetailsInTypes: types.repo.total,
        note: "The 22.1.8 install has no boundary machinery at all: no `onViewError`, no `boundaryCreate`, no `LBoundary`, no `ON_ERROR` slot and no `ErrorDetails` declaration. A surface that reads a page runs against the page's own runtime, but a type imported from `@angular/core` would compile against this absence.",
      },
    },
    version: {
      question:
        'Can a page tell which core it runs, and which single check lets a surface answer cannot-tell on a core without the boundary machinery instead of reporting an empty boundary list?',
      finding:
        "No page can report its own core version: neither install publishes a version-named key on `ng`, and `VERSION` is a module export rather than a debug utility. Of the three checks enumerated, only the published key list differs between the two installs, and it differs by exactly one key: 22.2.2 publishes `toggleWatchSignal` from `internalCoreGlobalUtils` and 22.1.8 does not (25 keys against 24). The resolved handler's own keys, its class source and the injector provider record for the handler token are identical on both installs, so none of them discriminates. The single check a surface may therefore make is the presence of that one key; where it is absent the answer is cannot-tell, never an empty boundary list - and it is a proxy for the build, not a version, so the surface declares the version it works against as a constant instead of reading one.",
      installs: version.installs,
      counts: version.counts,
      enumerated: {
        publishedKeyList: version.published,
        handler: version.handler,
        providerRecords: version.providerRecords,
        reportsItsOwnVersion: version.versionNameOnThePage,
      },
      discriminator: {
        check: "typeof ng.toggleWatchSignal === 'function'",
        measuredAs: 'the one key 22.2.2 publishes and 22.1.8 does not',
        absentOn: { label: 'repo', version: repo.version },
        presentOn: { label: 'fixture', version: fixture.version },
        answersWhenAbsent: 'cannot-tell',
        answersWhenPresent:
          'the machinery is available; whether a boundary exists is still unanswerable until one fires, so a page with the key and no caught error is cannot-tell with no-error-caught',
        isAProxyForTheBuild: true,
        notAVersion:
          'The key names a signal-watching toggle and says nothing about boundaries. It is the only difference these two installs leave a page, so it may be used to refuse the answer - never to claim a version, and never as evidence that a boundary exists.',
      },
      declares: {
        coreVersion: fixture.version,
        means:
          'the version of @angular/core this surface is measured against and works against',
        readFrom: displayPath(fixture.manifest),
        onAPage: null,
        why: 'No page reports a version, so the record carries `null` where a page reports none and the surface declares this constant instead.',
      },
    },
    doesNotSettle: [
      "What a live `@boundary` does on this head: this task takes no page and mounts nothing. The hook record is read from the fixture's installed chunk and quoted from S10, each quotation held to the line it cites.",
      "Which of the two per-page occurrences S10 measured came from which block view: the reproduction establishes the emission class (a `TemplateUpdateStart` with a non-object instance) and that each such frame loses its whole record; the count of two is S10's page measurement.",
      'That a third-party, frozen or sealed `ErrorHandler` accepts the hook: the stock class both installs provide is a plain mutable instance, and a refusal is a named absence rather than a measurement this task can take without a page.',
      'Whether a later 22.x keeps the published key list this discriminator reads: the check is a proxy for the build, so a point release that publishes the same key with different internals would defeat it. The recording states the counts that justify it at this head.',
      "What the `@boundary`-construction catch's `details` shape carries when a view throws during creation: the shape is read from the chunk with its four-field absence of `caughtBy`, and S10 did not measure that path.",
    ],
  };
}

// ------------------------------------------------------------ the validator ----

function validateInstrument(record, reading) {
  const instrument = record.instrument;
  if (!isObject(instrument)) fail('missing instrument');
  strings(instrument, ['question', 'finding'], 'instrument');

  const thrown = instrument.throw;
  if (!isObject(thrown)) fail('missing instrument.throw');
  strings(
    thrown,
    ['source', 'expression', 'constructor', 'message'],
    'instrument.throw',
  );
  if (typeof thrown.line !== 'number') {
    fail(
      `instrument.throw.line is ${JSON.stringify(thrown.line)}, not a line number`,
    );
  }
  if (thrown.source !== 'extension/agent-main.js') {
    fail(`instrument.throw.source is ${JSON.stringify(thrown.source)}`);
  }
  if (thrown.line !== AGENT().setLine) {
    fail(
      `instrument.throw.line is ${thrown.line} and the WeakMap key is written on extension/agent-main.js:${AGENT().setLine} - the line this recording names moved`,
    );
  }
  if (thrown.expression !== AGENT().lines[AGENT().setLine - 1].trim()) {
    fail(
      `instrument.throw.expression is ${JSON.stringify(thrown.expression)} and line ${AGENT().setLine} now reads ${JSON.stringify(AGENT().lines[AGENT().setLine - 1].trim())}`,
    );
  }
  if (thrown.constructor !== 'TypeError') {
    fail(
      `instrument.throw.constructor is ${JSON.stringify(thrown.constructor)}`,
    );
  }
  if (thrown.message !== 'Invalid value used as weak map key') {
    fail(
      `instrument.throw.message is ${JSON.stringify(thrown.message)} and the run measured ${JSON.stringify(reading.frames.undefined.message)}`,
    );
  }
  if (thrown.onEventCaughtIt !== false) {
    fail(
      "instrument.throw.onEventCaughtIt is not false, and the throw is measured outside onEvent's try/catch",
    );
  }
  if (!Array.isArray(thrown.callPath) || thrown.callPath.length < 3) {
    fail('instrument.throw.callPath is shorter than the three frames it names');
  }
  for (const frame of thrown.callPath) {
    const cited = citedLines(frame.at, 'instrument.throw.callPath[].at');
    if (!cited.lines.some((line) => line.includes(frame.code))) {
      fail(
        `instrument.throw.callPath cites ${frame.at} for ${JSON.stringify(frame.code)}, and that line does not carry it`,
      );
    }
  }
  const escape = thrown.escapeRoute;
  if (!isObject(escape)) fail('missing instrument.throw.escapeRoute');
  const onEvent = ON_EVENT_RANGE();
  if (
    escape.onEventRange !==
    `extension/agent-main.js:${onEvent.start}-${onEvent.end}`
  ) {
    fail(
      `instrument.throw.escapeRoute.onEventRange is ${escape.onEventRange} and onEvent spans extension/agent-main.js:${onEvent.start}-${onEvent.end}`,
    );
  }
  if (escape.throwInsideOnEventTryCatch !== false) {
    fail(
      `instrument.throw.escapeRoute.throwInsideOnEventTryCatch is ${escape.throwInsideOnEventTryCatch}, and line ${AGENT().setLine} lies outside ${escape.onEventRange}`,
    );
  }
  if (
    escape.dispatchAfterTheThrow !==
    `extension/agent-main.js:${AGENT().dispatchLine}`
  ) {
    fail('instrument.throw.escapeRoute.dispatchAfterTheThrow moved');
  }
  if (thrown.frameRecordLost !== (reading.frames.undefined.records === 0)) {
    fail(
      `instrument.throw.frameRecordLost is ${thrown.frameRecordLost} and the driven frame dispatched ${reading.frames.undefined.records} record(s)`,
    );
  }
  if (thrown.frameRecordLost !== true) {
    fail(
      `the frame now dispatches ${reading.frames.undefined.records} record(s) after the throw, so the cost of the defect moved and T002's premise must be re-measured`,
    );
  }
  if (!isObject(thrown.occurrences) || thrown.occurrences.count !== 2) {
    fail(
      'instrument.throw.occurrences.count is not 2, the number S10 measured per page',
    );
  }

  const emissions = instrument.emissions;
  if (!isObject(emissions)) fail('missing instrument.emissions');
  const literal = AGENT().profiler.values;
  if (JSON.stringify(emissions.eventIds) !== JSON.stringify(literal)) {
    fail(
      `instrument.emissions.eventIds is ${JSON.stringify(emissions.eventIds.map((entry) => entry.name))} and the agent's literal is ${JSON.stringify(literal.map((entry) => entry.name))}`,
    );
  }
  const derivedThrowing = reading.perEvent
    .filter((entry) => entry.throws > 0)
    .map((entry) => entry.value);
  if (
    JSON.stringify(emissions.throwingIds) !== JSON.stringify(derivedThrowing)
  ) {
    fail(
      `instrument.emissions.throwingIds is ${JSON.stringify(emissions.throwingIds)} and the run reddened ${JSON.stringify(derivedThrowing)} instead`,
    );
  }
  for (const entry of emissions.perEvent) {
    const actual = reading.perEvent.find(
      (candidate) => candidate.value === entry.value,
    );
    if (actual === undefined) {
      fail(
        `instrument.emissions.perEvent names value ${entry.value}, which the agent does not declare`,
      );
    }
    for (const key of ['name', 'throws', 'records']) {
      if (entry[key] !== actual[key]) {
        fail(
          `instrument.emissions.perEvent[${entry.name}].${key} is ${JSON.stringify(entry[key])} and the run measured ${JSON.stringify(actual[key])}`,
        );
      }
    }
  }
  if (!Array.isArray(emissions.sites) || emissions.sites.length === 0) {
    fail('instrument.emissions.sites is empty');
  }
  const derivedSites = live().embeddedViews;
  if (emissions.sites.length !== derivedSites.length) {
    fail(
      `instrument.emissions.sites holds ${emissions.sites.length} site(s) and the installed chunk hands createAndRenderEmbeddedLView a non-object context at ${derivedSites.length}`,
    );
  }
  for (let index = 0; index < derivedSites.length; index += 1) {
    const stated = emissions.sites[index];
    const actual = derivedSites[index];
    for (const key of ['line', 'context', 'via']) {
      if (stated[key] !== actual[key]) {
        fail(
          `instrument.emissions.sites[${index}].${key} is ${JSON.stringify(stated[key])} and the installed chunk says ${JSON.stringify(actual[key])} - a non-object context moved and the emission this record names must be re-read`,
        );
      }
    }
  }
  const anchors = emissions.anchors;
  if (!isObject(anchors)) fail('missing instrument.emissions.anchors');
  const fixtureLines = live().fixtureLines;
  for (const [key, needle] of [
    ['preHook', 'profiler(preHookType, context, templateFn);'],
    [
      'updateTemplateCall',
      'executeTemplate(tView, lView, templateFn, 2, context);',
    ],
    [
      'refreshReadsContext',
      'refreshView(tView, lView, tView.template, lView[CONTEXT]);',
    ],
    ['contextSlot', 'lView[CONTEXT] = context;'],
  ]) {
    const expected = soleLine(fixtureLines, needle, 'the installed chunk');
    if (anchors[key] !== expected) {
      fail(
        `instrument.emissions.anchors.${key} is ${anchors[key]} and ${JSON.stringify(needle)} now sits on line ${expected}`,
      );
    }
  }

  const reproduction = instrument.reproduction;
  if (!isObject(reproduction)) fail('missing instrument.reproduction');
  for (const [key, actual] of [
    ['undefinedInstance', reading.frames.undefined],
    ['nullInstance', reading.frames.null],
  ]) {
    const stated = reproduction[key];
    if (!isObject(stated)) fail(`missing instrument.reproduction.${key}`);
    for (const field of [
      'instance',
      'throws',
      'records',
      'constructor',
      'message',
    ]) {
      if (stated[field] !== actual[field]) {
        fail(
          `instrument.reproduction.${key}.${field} is ${JSON.stringify(stated[field])} and the run measured ${JSON.stringify(actual[field])}`,
        );
      }
    }
    if (stated.records !== 0) {
      fail(
        `instrument.reproduction.${key}.records is ${stated.records}: a non-object key now keeps the frame record, so the defect and its cost both moved`,
      );
    }
  }
  const valid = reproduction.validInstance;
  if (!isObject(valid)) fail('missing instrument.reproduction.validInstance');
  for (const field of ['instance', 'throws', 'records', 'constructor']) {
    if (valid[field] !== reading.frames.object[field]) {
      fail(
        `instrument.reproduction.validInstance.${field} is ${JSON.stringify(valid[field])} and the run measured ${JSON.stringify(reading.frames.object[field])}`,
      );
    }
  }
  if (valid.records !== 1 || valid.checks !== 1) {
    fail(
      `instrument.reproduction.validInstance records ${valid.records} record(s) and ${valid.checks} check(s); a valid instance must keep its one-check frame so the epoch record has a carrier`,
    );
  }
  const twoKeys = reproduction.twoKeysInOneFrame;
  if (!isObject(twoKeys))
    fail('missing instrument.reproduction.twoKeysInOneFrame');
  for (const field of ['throws', 'records']) {
    if (twoKeys[field] !== reading.twoKeysInOneFrame[field]) {
      fail(
        `instrument.reproduction.twoKeysInOneFrame.${field} is ${JSON.stringify(twoKeys[field])} and the run measured ${JSON.stringify(reading.twoKeysInOneFrame[field])}`,
      );
    }
  }
  if (twoKeys.throws !== 1) {
    fail(
      `instrument.reproduction.twoKeysInOneFrame.throws is ${twoKeys.throws}: the frame must throw once, because the forEach aborts on its first non-object key`,
    );
  }
}

function validateEpochs(record, reading) {
  const epochs = record.instrument.epochs;
  if (!isObject(epochs)) fail('missing instrument.epochs');
  const map = epochs.map;
  if (!isObject(map)) fail('missing instrument.epochs.map');
  strings(
    map,
    [
      'declaredAt',
      'declaration',
      'comment',
      'kind',
      'keyedBy',
      'holds',
      'resetAt',
      'resetExpression',
    ],
    'instrument.epochs.map',
  );
  if (map.declaredAt !== `extension/agent-main.js:${AGENT().mapLine}`) {
    fail(
      `instrument.epochs.map.declaredAt is ${map.declaredAt} and the map is declared on extension/agent-main.js:${AGENT().mapLine}`,
    );
  }
  if (!AGENT().lines[AGENT().mapLine - 1].includes(map.declaration)) {
    fail(
      `instrument.epochs.map.declaration is ${JSON.stringify(map.declaration)} and line ${AGENT().mapLine} reads ${JSON.stringify(AGENT().lines[AGENT().mapLine - 1].trim())}`,
    );
  }
  if (map.kind !== 'WeakMap') {
    fail(
      `instrument.epochs.map.kind is ${JSON.stringify(map.kind)}; the key that throws is a WeakMap key`,
    );
  }
  if (map.resetAt !== `extension/agent-main.js:${AGENT().resetMapLine}`) {
    fail(
      `instrument.epochs.map.resetAt is ${map.resetAt} and reset() clears it on line ${AGENT().resetMapLine}`,
    );
  }
  if (!AGENT().lines[AGENT().resetMapLine - 1].includes(map.resetExpression)) {
    fail('instrument.epochs.map.resetExpression is not the line reset() runs');
  }

  if (
    !Array.isArray(epochs.passes) ||
    epochs.passes.length !== reading.epochs.length
  ) {
    fail(
      `instrument.epochs.passes holds ${Array.isArray(epochs.passes) ? epochs.passes.length : 'no'} pass(es) and the run drove ${reading.epochs.length}`,
    );
  }
  for (let index = 0; index < reading.epochs.length; index += 1) {
    const stated = epochs.passes[index];
    const actual = reading.epochs[index];
    for (const key of [
      'label',
      'instance',
      'records',
      'changedNodeIds',
      'epochs',
      'ids',
    ]) {
      if (JSON.stringify(stated[key]) !== JSON.stringify(actual[key])) {
        fail(
          `instrument.epochs.passes[${index}].${key} is ${JSON.stringify(stated[key])} and the run measured ${JSON.stringify(actual[key])} for "${actual.label}"`,
        );
      }
    }
  }
  for (const [key, label] of [
    ['firstPass', 'a first pass'],
    ['movedOne', 'a second pass, n0 moved'],
    ['held', 'a third pass, nothing moved'],
    ['secondInstanceFirstPass', 'b first pass, its own entry'],
    ['movedBoth', 'a fourth pass, both moved'],
    ['numericNodeIds', 'a pass whose node ids are numbers'],
    ['graphUnavailable', 'a pass whose graph read answers nothing'],
    ['afterReset', 'the first pass after reset()'],
  ]) {
    const actual = reading.epochs.find((entry) => entry.label === label);
    if (JSON.stringify(epochs[key]) !== JSON.stringify(actual.changedNodeIds)) {
      fail(
        `instrument.epochs.${key} is ${JSON.stringify(epochs[key])} and "${label}" measured ${JSON.stringify(actual.changedNodeIds)}`,
      );
    }
  }
  if (JSON.stringify(epochs.movedOne) !== JSON.stringify(['n0'])) {
    fail(
      `instrument.epochs.movedOne is ${JSON.stringify(epochs.movedOne)}; a pass that moved one epoch must name exactly that node, or the record a repair must keep is silent`,
    );
  }
  if (JSON.stringify(epochs.movedBoth) !== JSON.stringify(['n0', 'n1'])) {
    fail(
      `instrument.epochs.movedBoth is ${JSON.stringify(epochs.movedBoth)}; a pass that moved both epochs must name both nodes`,
    );
  }
  if (!Array.isArray(epochs.held) || epochs.held.length !== 0) {
    fail(
      `instrument.epochs.held is ${JSON.stringify(epochs.held)}; a pass in which nothing moved names no node`,
    );
  }
  if (!Array.isArray(epochs.firstPass) || epochs.firstPass.length !== 0) {
    fail(
      'instrument.epochs.firstPass is not the empty list a first read answers',
    );
  }
  if (
    !Array.isArray(epochs.secondInstanceFirstPass) ||
    epochs.secondInstanceFirstPass.length !== 0
  ) {
    fail(
      `instrument.epochs.secondInstanceFirstPass is ${JSON.stringify(epochs.secondInstanceFirstPass)}; a second instance must start with no record, which is what proves the key is the instance`,
    );
  }
  strings(
    epochs,
    ['ambiguity', 'purpose', 'answersTheOpenQuestion'],
    'instrument.epochs',
  );
  if (!/empty list/.test(epochs.ambiguity)) {
    fail(
      'instrument.epochs.ambiguity does not name the empty list it is about',
    );
  }
  if (!/per-pass delta/.test(epochs.purpose)) {
    fail('instrument.epochs.purpose does not say what the map is for');
  }
}

function validateHook(record) {
  const hook = record.hook;
  if (!isObject(hook)) fail('missing hook');
  strings(hook, ['question', 'finding'], 'hook');
  const { fixture, repo } = live();
  const derived = HOOK();

  if (!isObject(hook.install)) fail('missing hook.install');
  if (hook.install.version !== fixture.version) {
    fail(
      `hook.install.version is ${hook.install.version} and the fixture's install is ${fixture.version}`,
    );
  }
  if (hook.install.chunk !== derived.path) {
    fail(
      `hook.install.chunk is ${hook.install.chunk} and the machinery lives in ${derived.path}`,
    );
  }

  const provider = hook.provider;
  if (!isObject(provider)) fail('missing hook.provider');
  const appConfigLine = soleLine(
    live().appConfigLines,
    'provideBrowserGlobalErrorListeners()',
    "the fixture's app.config.ts",
  );
  if (
    provider.at !== `spikes/ng222-app/src/app/app.config.ts:${appConfigLine}`
  ) {
    fail(
      `hook.provider.at is ${provider.at} and the fixture declares the provider on line ${appConfigLine}`,
    );
  }
  const appConfigCited = citedLines(provider.at, 'hook.provider.at');
  if (!appConfigCited.lines.some((line) => line.includes(provider.text))) {
    fail(`hook.provider.text is not the line hook.provider.at cites`);
  }
  if (provider.s10CitationMatchesThisHead !== false) {
    fail(
      'hook.provider.s10CitationMatchesThisHead is not false, and S10 cites line 6 while this head declares it on line 7 - the difference must stay visible',
    );
  }

  const boundaryApi = hook.boundaryApi;
  if (!isObject(boundaryApi)) fail('missing hook.boundaryApi');
  for (const [key, expected] of [
    ['create', derived.boundaryApi.create],
    ['update', derived.boundaryApi.update],
    ['get', derived.boundaryApi.get],
    ['instructionNamespaceAt', derived.boundaryApi.instructionNamespaceAt],
  ]) {
    if (boundaryApi[key] !== expected) {
      fail(
        `hook.boundaryApi.${key} is ${boundaryApi[key]} and the installed chunk says ${expected}`,
      );
    }
  }
  if (boundaryApi.publishedOnNg !== false) {
    fail(
      'hook.boundaryApi.publishedOnNg is not false: a boundary reader on `ng` would make the hook unnecessary and this record wrong',
    );
  }

  const retained = hook.retainedState;
  if (!isObject(retained)) fail('missing hook.retainedState');
  if (
    JSON.stringify(retained.fields) !==
    JSON.stringify(derived.retainedState.fields)
  ) {
    fail(
      `hook.retainedState.fields is ${JSON.stringify(retained.fields)} and \`class LBoundary\` carries ${JSON.stringify(derived.retainedState.fields)}`,
    );
  }
  if (retained.classAt !== derived.retainedState.classAt) {
    fail(
      `hook.retainedState.classAt is ${retained.classAt} and the class sits at ${derived.retainedState.classAt}`,
    );
  }
  if (
    JSON.stringify(retained.resetBody) !==
    JSON.stringify(derived.retainedState.resetBody)
  ) {
    fail(
      `hook.retainedState.resetBody is ${JSON.stringify(retained.resetBody)} and the installed reset() runs ${JSON.stringify(derived.retainedState.resetBody)}`,
    );
  }
  if (!retained.resetBody.join(' ').includes('this.error = null')) {
    fail(
      'hook.retainedState.resetBody no longer clears the error, so the no-retained-error absence moved',
    );
  }

  const details = hook.details;
  if (!isObject(details)) fail('missing hook.details');
  if (!Array.isArray(details.paths) || details.paths.length !== 2) {
    fail(
      `hook.details.paths holds ${Array.isArray(details.paths) ? details.paths.length : 'no'} shape(s); the two catch paths build two and a reader must expect both`,
    );
  }
  for (let index = 0; index < 2; index += 1) {
    const stated = details.paths[index];
    const actual = derived.details.paths[index];
    if (stated.name !== actual.name) {
      fail(
        `hook.details.paths[${index}].name is ${stated.name} and the reader says ${actual.name}`,
      );
    }
    if (JSON.stringify(stated.keys) !== JSON.stringify(actual.keys)) {
      fail(
        `hook.details.paths[${index}] carries ${JSON.stringify(stated.keys)} and ${actual.name} builds ${JSON.stringify(actual.keys)}`,
      );
    }
    if (stated.at !== actual.at) {
      fail(
        `hook.details.paths[${index}].at is ${stated.at} and the literal sits at ${actual.at}`,
      );
    }
    if (stated.carriesCaughtBy !== actual.keys.includes('caughtBy')) {
      fail(
        `hook.details.paths[${index}].carriesCaughtBy disagrees with its own key list`,
      );
    }
  }
  const detection = details.paths.find(
    (shape) => shape.name === 'detectChangesInView',
  );
  const construction = details.paths.find(
    (shape) => shape.name === 'boundaryConstruction',
  );
  if (detection === undefined || construction === undefined) {
    fail('hook.details.paths no longer holds both named shapes');
  }
  if (!detection.carriesCaughtBy) {
    fail(
      'hook.details.paths[detectChangesInView].carriesCaughtBy is false: the measured record carries `caughtBy` and SC1 reads it',
    );
  }
  if (construction.carriesCaughtBy) {
    fail(
      'hook.details.paths[boundaryConstruction].carriesCaughtBy is true, and the construction path builds no `caughtBy`',
    );
  }
  if (details.boundaryAddedAt !== derived.details.boundaryAddedAt) {
    fail(
      `hook.details.boundaryAddedAt is ${details.boundaryAddedAt} and the boundary block sits at ${derived.details.boundaryAddedAt}`,
    );
  }
  if (details.boundaryField !== derived.details.boundaryField) {
    fail(
      `hook.details.boundaryField is ${details.boundaryField} and the installed block writes \`details.${derived.details.boundaryField} = {…}\``,
    );
  }
  if (
    JSON.stringify(details.boundaryKeys) !==
    JSON.stringify(derived.details.boundaryKeys)
  ) {
    fail(
      `hook.details.boundaryKeys is ${JSON.stringify(details.boundaryKeys)} and the installed block builds ${JSON.stringify(derived.details.boundaryKeys)}`,
    );
  }
  const expectedMeasured = [
    ...detection.keys,
    ...(derived.details.boundaryField === undefined
      ? []
      : [derived.details.boundaryField]),
  ];
  if (
    JSON.stringify(details.measured.keys) !== JSON.stringify(expectedMeasured)
  ) {
    fail(
      `hook.details.measured.keys is ${JSON.stringify(details.measured.keys)} and the record the two paths build carries ${JSON.stringify(expectedMeasured)}`,
    );
  }
  if (!details.measured.keys.includes('caughtBy')) {
    fail(
      'hook.details.measured.keys lost `caughtBy`, which is the field S10 measured on the change-detection path and SC1 reads',
    );
  }
  if (details.caughtByIsOptional !== true) {
    fail(
      'hook.details.caughtByIsOptional is not true, and ErrorDetails declares it optional',
    );
  }

  const errorView = hook.errorView;
  if (!isObject(errorView)) fail('missing hook.errorView');
  if (
    JSON.stringify(errorView.keys) !== JSON.stringify(derived.errorView.keys)
  ) {
    fail(
      `hook.errorView.keys is ${JSON.stringify(errorView.keys)} and the installed context literal builds ${JSON.stringify(derived.errorView.keys)}`,
    );
  }
  if (JSON.stringify(errorView.keys) !== JSON.stringify(['$error', '$reset'])) {
    fail(
      `hook.errorView.keys is ${JSON.stringify(errorView.keys)}; the after-the-fact reader answers \`{$error, $reset}\` and nothing else`,
    );
  }
  if (errorView.contextAt !== derived.errorView.contextAt) {
    fail(
      `hook.errorView.contextAt is ${errorView.contextAt} and the context sits at ${derived.errorView.contextAt}`,
    );
  }
  if (errorView.primaryContext !== derived.errorView.primaryContext) {
    fail(
      `hook.errorView.primaryContext is ${JSON.stringify(errorView.primaryContext)} and the primary view is created with ${JSON.stringify(derived.errorView.primaryContext)} - the same non-object context the instrument throws on`,
    );
  }
  if (errorView.resetSource !== derived.errorView.resetSource) {
    fail(
      `hook.errorView.resetSource is ${JSON.stringify(errorView.resetSource)} and the installed literal writes ${JSON.stringify(derived.errorView.resetSource)}`,
    );
  }
  if (errorView.publishedOnNg !== true) {
    fail(
      'hook.errorView.publishedOnNg is not true, and `getContext` is one of the published keys',
    );
  }

  const fallback = hook.fallback;
  if (!isObject(fallback)) fail('missing hook.fallback');
  if (fallback.primary !== false || fallback.fallback !== true) {
    fail(
      'hook.fallback does not record the primary view removed and the fallback rendered',
    );
  }
  if (!String(fallback.text).startsWith(fallback.prefix)) {
    fail(
      `hook.fallback.text does not start with its own prefix ${JSON.stringify(fallback.prefix)}`,
    );
  }
  if (fallback.prefixIsTheProbesOwnTemplate !== true) {
    fail(
      "hook.fallback.prefixIsTheProbesOwnTemplate is not true: the rendered text is the probe's template, and presenting it as Angular's fallback contract would be an invented fact",
    );
  }
  if (fallback.carriesTheErrorsOwnMessage !== true) {
    fail(
      "hook.fallback.carriesTheErrorsOwnMessage is not true, and S10's measured text carries it",
    );
  }
  if (fallback.text === fallback.prefix) {
    fail(
      'hook.fallback.text carries nothing but the prefix, so the message it was measured with is gone',
    );
  }

  for (const key of [
    'throwingViewAt',
    'boundaryViewAt',
    'constructionViewAt',
  ]) {
    const cited = citedLines(
      hook.declarations[key],
      `hook.declarations.${key}`,
    );
    if (cited.path !== derived.path) {
      fail(
        `hook.declarations.${key} cites ${cited.path}, not the machinery chunk`,
      );
    }
  }
  if (hook.declarations.throwingViewAt === hook.declarations.boundaryViewAt) {
    fail(
      'hook.declarations names one line for both the throwing view and the boundary view, so the two answers could not differ',
    );
  }
  if (
    !citedLines(
      hook.declarations.throwingViewAt,
      'throwingViewAt',
    ).lines[0].includes('lView[DECLARATION_COMPONENT_VIEW]')
  ) {
    fail('hook.declarations.throwingViewAt no longer reads the throwing view');
  }
  if (
    !citedLines(
      hook.declarations.boundaryViewAt,
      'boundaryViewAt',
    ).lines[0].includes('hostLView[DECLARATION_COMPONENT_VIEW]')
  ) {
    fail('hook.declarations.boundaryViewAt no longer reads the boundary view');
  }

  if (
    !Array.isArray(hook.readers.onViewErrorAt) ||
    hook.readers.onViewErrorAt.length !== 2
  ) {
    fail(
      `hook.readers.onViewErrorAt holds ${hook.readers.onViewErrorAt?.length} call(s); the two catch paths each call it once`,
    );
  }
  for (const key of ['onViewErrorAt', 'handleErrorAt', 'truthinessAt']) {
    for (const anchor of hook.readers[key]) {
      citedLines(anchor, `hook.readers.${key}`);
    }
  }
  if (hook.readers.onViewErrorAt.length !== hook.readers.truthinessAt.length) {
    fail(
      'hook.readers.truthinessAt does not pair one test with each onViewError call',
    );
  }

  const wrapped = hook.wrapped;
  if (!isObject(wrapped)) fail('missing hook.wrapped');
  for (const key of ['functionAt', 'classAt', 'causeAt']) {
    citedLines(wrapped[key], `hook.wrapped.${key}`);
  }

  const listeners = hook.globalListeners;
  if (!isObject(listeners)) fail('missing hook.globalListeners');
  for (const key of ['provideAt', 'errorListenerAt', 'rejectionListenerAt']) {
    citedLines(listeners[key], `hook.globalListeners.${key}`);
  }

  if (
    !Array.isArray(hook.quotations) ||
    hook.quotations.length !== QUOTATIONS.length
  ) {
    fail(
      `hook.quotations holds ${hook.quotations?.length} quotation(s) and the record rests on ${QUOTATIONS.length}`,
    );
  }
  hook.quotations.forEach((quotation, index) => {
    assertQuotation(quotation, `hook.quotations[${index}]`);
  });

  const absent = hook.absentInRepo;
  if (!isObject(absent)) fail('missing hook.absentInRepo');
  if (absent.version !== repo.version) {
    fail(
      `hook.absentInRepo.version is ${absent.version} and this repository installs ${repo.version}`,
    );
  }
  for (const needle of MACHINERY) {
    const actual = live().counts.repo[needle].total;
    if (absent.counts[needle].total !== actual) {
      fail(
        `hook.absentInRepo.counts.${needle} is ${absent.counts[needle].total} and the ${repo.version} install carries ${actual}`,
      );
    }
    if (actual !== 0) {
      fail(
        `the ${repo.version} install now carries ${actual} \`${needle}\` occurrence(s); the absence this milestone's version caveat rests on moved`,
      );
    }
  }
  if (absent.errorDetailsInTypes !== 0) {
    fail(
      `hook.absentInRepo.errorDetailsInTypes is ${absent.errorDetailsInTypes}: the ${repo.version} install declares ErrorDetails and a type could be imported again`,
    );
  }
  if (live().types.repo.total !== 0) {
    fail(
      `the ${repo.version} install's types now declare ErrorDetails ${live().types.repo.total} time(s)`,
    );
  }
}

function validateVersion(record) {
  const version = record.version;
  if (!isObject(version)) fail('missing version');
  strings(version, ['question', 'finding'], 'version');
  const derived = VERSION();

  if (!Array.isArray(version.installs) || version.installs.length !== 2) {
    fail('version.installs must hold exactly the two installs this file reads');
  }
  for (let index = 0; index < 2; index += 1) {
    for (const key of ['label', 'version', 'manifest', 'publishedKeyCount']) {
      if (version.installs[index][key] !== derived.installs[index][key]) {
        fail(
          `version.installs[${index}].${key} is ${JSON.stringify(version.installs[index][key])} and this run derived ${JSON.stringify(derived.installs[index][key])}`,
        );
      }
    }
  }

  for (const label of ['repo', 'fixture']) {
    for (const needle of MACHINERY) {
      const stated = version.counts[label][needle];
      const actual = live().counts[label][needle];
      if (
        !isObject(stated) ||
        stated.total !== actual.total ||
        JSON.stringify(stated.perChunk) !== JSON.stringify(actual.perChunk)
      ) {
        fail(
          `version.counts.${label}.${needle} is ${JSON.stringify(stated)} and the ${live()[label].version} install carries ${JSON.stringify(actual)}`,
        );
      }
    }
  }
  const machinery = version.counts.machineryChunk;
  if (!isObject(machinery)) fail('missing version.counts.machineryChunk');
  const derivedMachinery = derived.counts.machineryChunk;
  if (machinery.chunk !== derivedMachinery.chunk) {
    fail(
      `version.counts.machineryChunk.chunk is ${machinery.chunk} and the chunk that declares \`class LBoundary {\` is ${derivedMachinery.chunk}`,
    );
  }
  for (const needle of ['onViewError', 'boundaryCreate', 'LBoundary']) {
    if (machinery[needle] !== derivedMachinery[needle]) {
      fail(
        `version.counts.machineryChunk.${needle} is ${machinery[needle]} and ${derivedMachinery.chunk} carries ${derivedMachinery[needle]}`,
      );
    }
  }
  if (
    machinery.onViewError !== 4 ||
    machinery.boundaryCreate !== 4 ||
    machinery.LBoundary !== 2
  ) {
    fail(
      `version.counts.machineryChunk reads ${machinery.onViewError}/${machinery.boundaryCreate}/${machinery.LBoundary}; the shipped 22.2.2 chunk this record quotes reads 4/4/2 and any other reading must be re-derived before it is quoted`,
    );
  }
  for (const label of ['repo', 'fixture']) {
    if (
      JSON.stringify(version.counts.errorDetailsInTypes[label]) !==
      JSON.stringify(live().types[label])
    ) {
      fail(
        `version.counts.errorDetailsInTypes.${label} is ${JSON.stringify(version.counts.errorDetailsInTypes[label])} and the ${label} install's declarations carry ${JSON.stringify(live().types[label])}`,
      );
    }
  }

  const enumerated = version.enumerated;
  if (!isObject(enumerated)) fail('missing version.enumerated');
  const published = enumerated.publishedKeyList;
  if (!isObject(published)) fail('missing version.enumerated.publishedKeyList');
  for (const label of ['repo', 'fixture']) {
    const actual = derived.published[label];
    if (JSON.stringify(published[label].keys) !== JSON.stringify(actual.keys)) {
      fail(
        `version.enumerated.publishedKeyList.${label}.keys is not the list this run derives from the ${live()[label].version} install - the published debug surface moved`,
      );
    }
    if (published[label].count !== actual.count) {
      fail(
        `version.enumerated.publishedKeyList.${label}.count is ${published[label].count} and the ${live()[label].version} install publishes ${actual.count} key(s)`,
      );
    }
  }
  if (published.repo.count !== 24 || published.fixture.count !== 25) {
    fail(
      `version.enumerated.publishedKeyList holds ${published.repo.count} and ${published.fixture.count} keys; the measured pair is 24 and 25 and any other pair must be re-derived before a surface reads it`,
    );
  }
  if (
    JSON.stringify(published.addedByTheNewerInstall) !==
    JSON.stringify(['toggleWatchSignal'])
  ) {
    fail(
      `version.enumerated.publishedKeyList.addedByTheNewerInstall is ${JSON.stringify(published.addedByTheNewerInstall)}; exactly one key separates the two installs and the discriminator is that one key`,
    );
  }
  if (
    !Array.isArray(published.removedByTheNewerInstall) ||
    published.removedByTheNewerInstall.length !== 0
  ) {
    fail(
      `version.enumerated.publishedKeyList.removedByTheNewerInstall is ${JSON.stringify(published.removedByTheNewerInstall)}; the newer install removes no key`,
    );
  }
  if (published.shared.length !== published.repo.count) {
    fail(
      'version.enumerated.publishedKeyList.shared is not the whole 22.1.8 list',
    );
  }

  const handler = enumerated.handler;
  if (!isObject(handler)) fail('missing version.enumerated.handler');
  for (const label of ['repo', 'fixture']) {
    const actual = live().handler[label];
    for (const key of ['ownKeys', 'methods', 'declaresOnViewError', 'source']) {
      if (JSON.stringify(handler[label][key]) !== JSON.stringify(actual[key])) {
        fail(
          `version.enumerated.handler.${label}.${key} is ${JSON.stringify(handler[label][key])} and the ${live()[label].version} install says ${JSON.stringify(actual[key])}`,
        );
      }
    }
  }
  if (
    handler.repo.declaresOnViewError !== false ||
    handler.fixture.declaresOnViewError !== false
  ) {
    fail(
      'version.enumerated.handler records an `onViewError` on the stock class: the hook is optional and the surface must define it, so this record would invert the installation',
    );
  }
  if (handler.sourceIdentical !== true || handler.ownKeysIdentical !== true) {
    fail(
      'version.enumerated.handler is not identical on both installs; the handler axis was recorded as a non-discriminator and that changed',
    );
  }

  const providers = enumerated.providerRecords;
  if (!isObject(providers)) fail('missing version.enumerated.providerRecords');
  for (const label of ['repo', 'fixture']) {
    const actual = live().provider[label];
    for (const key of [
      'chunk',
      'recordAt',
      'provide',
      'useFactory',
      'factoryAt',
      'factoryBody',
    ]) {
      if (providers[label][key] !== actual[key]) {
        fail(
          `version.enumerated.providerRecords.${label}.${key} is ${JSON.stringify(providers[label][key])} and the ${live()[label].version} install says ${JSON.stringify(actual[key])}`,
        );
      }
    }
  }
  if (providers.identical !== true) {
    fail(
      'version.enumerated.providerRecords is not identical on both installs; the provider axis was recorded as a non-discriminator and that changed',
    );
  }

  const reports = enumerated.reportsItsOwnVersion;
  if (!isObject(reports))
    fail('missing version.enumerated.reportsItsOwnVersion');
  if (!Array.isArray(reports.matching) || reports.matching.length !== 0) {
    fail(
      `version.enumerated.reportsItsOwnVersion.matching is ${JSON.stringify(reports.matching)}; a page cannot report its own core version and a version-named key would make one readable`,
    );
  }
  if (reports.reportedBy !== 0) {
    fail('version.enumerated.reportsItsOwnVersion.reportedBy is not 0');
  }

  const discriminator = version.discriminator;
  if (!isObject(discriminator)) fail('missing version.discriminator');
  strings(
    discriminator,
    [
      'check',
      'measuredAs',
      'answersWhenAbsent',
      'answersWhenPresent',
      'notAVersion',
    ],
    'version.discriminator',
  );
  if (!discriminator.check.includes('toggleWatchSignal')) {
    fail(
      `version.discriminator.check is ${JSON.stringify(discriminator.check)} and the one key that separates the two installs is \`toggleWatchSignal\``,
    );
  }
  if (discriminator.answersWhenAbsent !== 'cannot-tell') {
    fail(
      `version.discriminator.answersWhenAbsent is ${JSON.stringify(discriminator.answersWhenAbsent)}; a core without the machinery must be cannot-tell and never an empty boundary list`,
    );
  }
  if (discriminator.isAProxyForTheBuild !== true) {
    fail(
      'version.discriminator.isAProxyForTheBuild is not true, and the check is a proxy rather than a version read',
    );
  }

  const declares = version.declares;
  if (!isObject(declares)) fail('missing version.declares');
  strings(
    declares,
    ['coreVersion', 'means', 'readFrom', 'why'],
    'version.declares',
  );
  if (declares.coreVersion !== live().fixture.version) {
    fail(
      `version.declares.coreVersion is ${declares.coreVersion} and the install the machinery is measured on is ${live().fixture.version}`,
    );
  }
  if (declares.onAPage !== null) {
    fail(
      `version.declares.onAPage is ${JSON.stringify(declares.onAPage)}; no page reports a version, and a surface that filled this in would be inventing one`,
    );
  }
}

function validate(record) {
  if (!isObject(record)) fail('the recording is not an object');
  if (record.schema !== 'm042-error-boundary/v1') {
    fail(`the recording schema is ${JSON.stringify(record.schema)}`);
  }
  if (record.milestone !== 'error-boundary') {
    fail(`the recording milestone is ${JSON.stringify(record.milestone)}`);
  }
  if (record.task !== 'T001')
    fail(`the recording task is ${JSON.stringify(record.task)}`);
  strings(record, ['title', 'question', 'capturedAt'], 'the recording');
  if (!isIsoTimestamp(record.capturedAt)) {
    fail(`the recording capturedAt is ${record.capturedAt}`);
  }
  strings(record.commands, ['check', 'capture', 'reproduce'], 'commands');
  if (!record.commands.check.includes('error-boundary-measure')) {
    fail('the recorded check command is not this suite');
  }
  strings(record.environment, ['platform', 'shell', 'node'], 'environment');
  if (record.environment.node !== process.version) {
    fail(
      `the recording environment.node is ${record.environment.node} and this run is ${process.version}`,
    );
  }
  if (!isObject(record.teardown)) fail('missing teardown');
  if (
    !Array.isArray(record.teardown.ports) ||
    record.teardown.ports.length !== 5
  ) {
    fail('teardown.ports does not name the five ports this milestone watches');
  }
  if (
    !Array.isArray(record.teardown.started) ||
    record.teardown.started.length !== 0
  ) {
    fail(
      'teardown.started is not empty: this task starts no server and no browser',
    );
  }
  if (
    !Array.isArray(record.doesNotSettle) ||
    record.doesNotSettle.length === 0
  ) {
    fail('the recording does not say what it does not settle');
  }
  for (const entry of record.doesNotSettle) {
    if (typeof entry !== 'string' || entry === '') {
      fail('a doesNotSettle entry is empty');
    }
  }

  const reading = measured();
  validateInstrument(record, reading);
  validateEpochs(record, reading);
  validateHook(record);
  validateVersion(record);
  return true;
}

// ------------------------------------------------------------ the checks ----

const SHA_AT_LOAD = existsSync(RECORD_PATH)
  ? createHash('sha256').update(readFileSync(RECORD_PATH)).digest('hex')
  : null;

test('PRECONDITION: the two installs are the two copies this recording names', () => {
  const { repo, fixture } = live();
  assert.equal(repo.version, '22.1.8');
  assert.equal(fixture.version, '22.2.2');
  assert.equal(machineryChunk(repo), null);
  assert.ok(machineryChunk(fixture));
});

test('the recording validates against the agent, the two installs and its own quotations', () => {
  assert.doesNotThrow(() => validate(loadRecord()));
});

test('the recording is the canonical serialisation of its own record', () => {
  const text = readFileSync(RECORD_PATH, 'utf8');
  assert.equal(
    text,
    canonical(loadRecord()),
    'the recording is not the canonical serialisation of its record, so a re-measurement would not reproduce these bytes',
  );
  assert.equal(
    canonical(loadRecord()),
    canonical(buildRecord()),
    'the recording is not what this head derives, so the recording is a memory and not a measurement',
  );
});

test('the instrument throws on the one emission that opens a frame, and the frame keeps no record', () => {
  const record = loadRecord();
  const { perEvent, frames } = measured();
  const throwing = perEvent.filter((entry) => entry.throws > 0);
  assert.deepEqual(
    throwing.map((entry) => entry.name),
    ['TemplateUpdateStart'],
    'the emission that provokes the throw moved',
  );
  assert.equal(record.instrument.throw.line, 1034);
  assert.equal(record.instrument.throw.constructor, 'TypeError');
  assert.equal(
    record.instrument.throw.message,
    'Invalid value used as weak map key',
  );
  for (const [kind, frame] of [
    ['undefined', frames.undefined],
    ['null', frames.null],
  ]) {
    assert.equal(
      frame.records,
      0,
      `${kind}: the frame record reached the page`,
    );
    assert.deepEqual(frame.events, ['angular-ai:state'], kind);
    assert.equal(frame.constructor, 'TypeError', kind);
  }
  assert.equal(frames.object.records, 1);
  assert.equal(frames.object.checks, 1);
  assert.match(record.instrument.finding, /weak map key/);
});

test('the epoch record names a moved epoch, holds on a still one, and is keyed by the instance', () => {
  const record = loadRecord();
  assert.deepEqual(record.instrument.epochs.firstPass, []);
  assert.deepEqual(record.instrument.epochs.movedOne, ['n0']);
  assert.deepEqual(record.instrument.epochs.held, []);
  assert.deepEqual(record.instrument.epochs.movedBoth, ['n0', 'n1']);
  assert.deepEqual(record.instrument.epochs.secondInstanceFirstPass, []);
  assert.deepEqual(record.instrument.epochs.numericNodeIds, ['1', '2']);
  assert.deepEqual(record.instrument.epochs.afterReset, []);
  assert.equal(record.instrument.epochs.map.kind, 'WeakMap');
  assert.match(record.instrument.epochs.purpose, /per-pass delta/);
  assert.match(record.instrument.epochs.ambiguity, /empty list/);
});

test('the hook record carries both details shapes, the error view context and the fallback apart from the error', () => {
  const record = loadRecord();
  const names = record.hook.details.paths.map((shape) => shape.name);
  assert.deepEqual(names, ['detectChangesInView', 'boundaryConstruction']);
  assert.deepEqual(record.hook.details.measured.keys, [
    'declarationInstance',
    'declarationType',
    'caughtBy',
    'boundary',
  ]);
  assert.deepEqual(record.hook.errorView.keys, ['$error', '$reset']);
  assert.equal(record.hook.errorView.primaryContext, 'undefined');
  assert.equal(record.hook.fallback.primary, false);
  assert.equal(record.hook.fallback.fallback, true);
  assert.equal(record.hook.fallback.prefix, 'caught: ');
  assert.equal(record.hook.fallback.prefixIsTheProbesOwnTemplate, true);
  assert.notEqual(record.hook.fallback.text, record.hook.fallback.prefix);
  for (const key of ['throwingViewAt', 'boundaryViewAt']) {
    assert.doesNotThrow(
      () => citedLines(record.hook.declarations[key], key),
      key,
    );
  }
  assert.notEqual(
    record.hook.declarations.throwingViewAt,
    record.hook.declarations.boundaryViewAt,
  );
});

test('the 22.1.8 install carries no boundary machinery at all', () => {
  const record = loadRecord();
  for (const needle of MACHINERY) {
    assert.equal(
      record.hook.absentInRepo.counts[needle].total,
      0,
      `${needle} is present in the repository install`,
    );
  }
  assert.equal(record.hook.absentInRepo.errorDetailsInTypes, 0);
  assert.equal(record.version.counts.fixture.onViewError.total, 4);
  assert.equal(record.version.counts.fixture.LBoundary.total, 2);
});

test('no page can report its version and exactly one key separates the two installs', () => {
  const record = loadRecord();
  assert.deepEqual(record.version.enumerated.reportsItsOwnVersion.matching, []);
  assert.equal(record.version.enumerated.reportsItsOwnVersion.reportedBy, 0);
  assert.equal(record.version.enumerated.publishedKeyList.repo.count, 24);
  assert.equal(record.version.enumerated.publishedKeyList.fixture.count, 25);
  assert.deepEqual(
    record.version.enumerated.publishedKeyList.addedByTheNewerInstall,
    ['toggleWatchSignal'],
  );
  assert.equal(record.version.enumerated.handler.sourceIdentical, true);
  assert.equal(record.version.enumerated.providerRecords.identical, true);
  assert.equal(record.version.discriminator.answersWhenAbsent, 'cannot-tell');
  assert.equal(record.version.declares.onAPage, null);
});

test('this suite drives no browser, starts nothing and writes nothing by default', () => {
  const source = readFileSync(SELF_PATH, 'utf8');
  // Assembled so this check does not count its own needles.
  const forbidden = [
    ['play', 'wright'].join(''),
    ['chrom', 'ium'].join(''),
    ['page', '.', 'goto'].join(''),
    ['child', '_', 'process'].join(''),
    ['create', 'Server'].join(''),
    ['listen', '('].join(''),
  ];
  for (const needle of forbidden) {
    assert.equal(
      source.includes(needle),
      false,
      `this suite carries ${JSON.stringify(needle)}, and it must drive no page and start nothing`,
    );
  }
  assert.equal(
    source.split(['writeFile', 'Sync('].join('')).length - 1,
    1,
    'this suite writes one file and only on the armed path, and it names it once',
  );
  assert.match(
    source,
    /process\.env\.M042_CAPTURE/,
    'the write is guarded by M042_CAPTURE, and a default run must be a read',
  );
});

/** True when the run is armed: `M042_CAPTURE=1`, in either shell's spelling. */
function armed() {
  return String(process.env.M042_CAPTURE ?? '').trim() === '1';
}

test('an armed run writes the recording and a second armed run changes no byte', () => {
  if (!armed()) {
    assert.notEqual(SHA_AT_LOAD, null, 'the recording is missing');
    assert.equal(
      createHash('sha256').update(readFileSync(RECORD_PATH)).digest('hex'),
      SHA_AT_LOAD,
      'the recording changed during a default run',
    );
    return;
  }
  const first = canonical(buildRecord());
  writeFileSync(RECORD_PATH, first);
  const second = canonical(buildRecord());
  assert.equal(second, first, 'a second armed run changed a byte');
  assert.equal(readFileSync(RECORD_PATH, 'utf8'), second);
});

// -------------------------------------------------------------- the mutants ----
//
// Each mutant reddens one pin of this recording, and the string it reddens with
// names the defect it represents. None of them is a shape the recording could
// not take: every one is a change a repair, a re-measurement or an upstream
// release could make.

test('held-out: a throw cited on the wrong line reddens, naming the line', () => {
  const mutant = clone(loadRecord());
  mutant.instrument.throw.line = 1;
  assert.throws(() => validate(mutant), /throw\.line is 1 and the WeakMap key/);
});

test('held-out: a recording that blames the wrong emission reddens', () => {
  const mutant = clone(loadRecord());
  mutant.instrument.emissions.throwingIds = [3];
  assert.throws(
    () => validate(mutant),
    /emissions\.throwingIds is \[3\] and the run reddened \[2\]/,
  );
});

test('held-out: a recording that says the frame survived the throw reddens', () => {
  const mutant = clone(loadRecord());
  mutant.instrument.throw.frameRecordLost = false;
  assert.throws(
    () => validate(mutant),
    /frameRecordLost is false and the driven frame dispatched 0 record/,
  );
});

test('held-out: a recording in which the thrown frame kept a record reddens', () => {
  const mutant = clone(loadRecord());
  mutant.instrument.reproduction.undefinedInstance.records = 1;
  assert.throws(
    () => validate(mutant),
    /undefinedInstance\.records is 1 and the run measured 0/,
  );
});

test('held-out: silencing the moved-node list reddens, naming the pass it empties', () => {
  const mutant = clone(loadRecord());
  mutant.instrument.epochs.movedOne = [];
  assert.throws(() => validate(mutant), /epochs\.movedOne is \[\]/);
});

test('held-out: constant-folding the held list reddens', () => {
  const mutant = clone(loadRecord());
  mutant.instrument.epochs.held = ['n0'];
  assert.throws(() => validate(mutant), /epochs\.held is \["n0"\]/);
});

test('held-out: a keyed-by claim of anything but the instance reddens', () => {
  const mutant = clone(loadRecord());
  mutant.instrument.epochs.map.kind = 'Map';
  assert.throws(() => validate(mutant), /map\.kind is "Map"/);
});

test('held-out: a moved non-object emission site reddens, naming it', () => {
  const mutant = clone(loadRecord());
  mutant.instrument.emissions.sites[0].context = 'object';
  assert.throws(
    () => validate(mutant),
    /sites\[0\]\.context is "object" and the installed chunk says "null"/,
  );
});

test('held-out: a details record without caughtBy reddens', () => {
  const mutant = clone(loadRecord());
  mutant.hook.details.measured.keys = mutant.hook.details.measured.keys.filter(
    (key) => key !== 'caughtBy',
  );
  assert.throws(() => validate(mutant), /caughtBy/);
});

test('held-out: a construction path that carries caughtBy reddens', () => {
  const mutant = clone(loadRecord());
  mutant.hook.details.paths[1].carriesCaughtBy = true;
  assert.throws(() => validate(mutant), /carriesCaughtBy/);
});

test('held-out: an error view context that lost $reset reddens', () => {
  const mutant = clone(loadRecord());
  mutant.hook.errorView.keys = ['$error'];
  assert.throws(() => validate(mutant), /\$reset/);
});

test('held-out: the fallback presented as Angular own text reddens', () => {
  const mutant = clone(loadRecord());
  mutant.hook.fallback.prefixIsTheProbesOwnTemplate = false;
  assert.throws(() => validate(mutant), /probe's template/);
});

test('held-out: a quotation whose anchor no longer carries it reddens', () => {
  const mutant = clone(loadRecord());
  mutant.hook.quotations
    .at(-1)
    .contains.push('a fragment no cited line carries');
  assert.throws(() => validate(mutant), /lost its anchor/);
});

test('held-out: machinery counted in the 22.1.8 install reddens', () => {
  const mutant = clone(loadRecord());
  mutant.hook.absentInRepo.counts.onViewError.total = 1;
  assert.throws(
    () => validate(mutant),
    /absentInRepo\.counts\.onViewError is 1 and the 22\.1\.8 install carries 0/,
  );
});

test('held-out: a boundary count that moved since the measurement reddens', () => {
  const mutant = clone(loadRecord());
  mutant.version.counts.fixture.onViewError.total = 3;
  assert.throws(
    () => validate(mutant),
    /version\.counts\.fixture\.onViewError is/,
  );
});

test('held-out: a version read off the page reddens', () => {
  const mutant = clone(loadRecord());
  mutant.version.enumerated.reportsItsOwnVersion.matching = ['VERSION'];
  assert.throws(
    () => validate(mutant),
    /reportsItsOwnVersion\.matching is \["VERSION"\]/,
  );
});

test('held-out: a discriminator of more than one key reddens', () => {
  const mutant = clone(loadRecord());
  mutant.version.enumerated.publishedKeyList.addedByTheNewerInstall.push(
    'ɵgetBoundary',
  );
  assert.throws(
    () => validate(mutant),
    /exactly one key separates the two installs/,
  );
});

test('held-out: a declared version that is not the measured install reddens', () => {
  const mutant = clone(loadRecord());
  mutant.version.declares.coreVersion = '22.3.0';
  assert.throws(
    () => validate(mutant),
    /declares\.coreVersion is 22\.3\.0 and the install/,
  );
});

test('held-out: an absent answer that became an empty boundary list reddens', () => {
  const mutant = clone(loadRecord());
  mutant.version.discriminator.answersWhenAbsent = 'idle';
  assert.throws(
    () => validate(mutant),
    /answersWhenAbsent is "idle"; a core without the machinery must be cannot-tell/,
  );
});
