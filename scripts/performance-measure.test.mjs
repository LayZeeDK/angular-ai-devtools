// @ts-check
//
// M040 T001 — what each paired profiler work event carries, and whether both
// ends of a pair land inside one frame, re-derived at this head.
//
// The two questions this file settles, and the negative it must keep honest:
//
//   identity  For `TemplateUpdate` 2/3, `LifecycleHook` 4/5, `ChangeDetection`
//             12/13, `Component` 18/19 and `HostBindingsUpdate` 24/25, what does
//             each emission site in the chunk the page loads actually pass? The
//             reader below walks every `profiler(...)` call site of both
//             installed `@angular/core` builds and records the argument list as
//             written, resolving a local constant only from its own `const`
//             line. It never infers an argument from a neighbouring call, so a
//             point release that starts or stops passing an instance reddens
//             this file instead of leaving the milestone asserting a fact about
//             an older install.
//   frames    Does one call bracket both ends of a pair, and does the page
//             agent`s microtask-delimited frame hold both? The bracketed-call
//             answer is derived from the sites; the frame answer is derived
//             from the recording`s witness — the three ticks each page
//             produced — and from the agent`s own source, which is where the
//             frame`s opener and closer live. Where the two answers differ, the
//             recording carries both and the rule the narrator must obey.
//
// The negative is the milestone`s answer for SC3, not a gap: `ChangeDetection`
// passes no instance and no function on either end, so the profiler brackets
// work and names nothing. The recording says so with its evidence, and this
// file reddens if a claim that it names a component is ever added.
//
// Read-only: no build, no browser, no page, no write. The live witness belongs
// to the recording`s provenance; re-taking it is the capture task`s armed run.
//
// Run the checks:
//   node --experimental-strip-types --test scripts/performance-measure.test.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SELF_PATH = fileURLToPath(import.meta.url);

const RECORD_PATH = join(ROOT, 'research', 'raw', 'm040-work-events.json');
const AGENT_PATH = join(ROOT, 'extension', 'agent-main.js');

/** The five pairs, by the names the enum declares. Numbers are derived. */
const PAIR_SPECS = [
  ['TemplateUpdate', 'TemplateUpdateStart', 'TemplateUpdateEnd'],
  ['LifecycleHook', 'LifecycleHookStart', 'LifecycleHookEnd'],
  ['ChangeDetection', 'ChangeDetectionStart', 'ChangeDetectionEnd'],
  ['Component', 'ComponentStart', 'ComponentEnd'],
  ['HostBindingsUpdate', 'HostBindingsUpdateStart', 'HostBindingsUpdateEnd'],
];

/** The two installed copies of `@angular/core` this head carries. */
const SOURCES = [
  {
    label: 'panel',
    package: 'panel: the @angular/core the extension panel builds against',
    root: 'node_modules/@angular/core',
  },
  {
    label: 'fixture',
    package: 'fixture: the @angular/core the counter page loads',
    root: 'spikes/ng222-app/node_modules/@angular/core',
  },
];

const CHUNK = 'fesm2022/_debug_node-chunk.mjs';
const MANIFEST = 'package.json';
const AGENT_SOURCE = 'extension/agent-main.js';

// ---------------------------------------------------------------- helpers ----

/** @param {string} message */
function fail(message) {
  throw new Error(message);
}

/** @param {unknown} value */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** @param {string} path */
function displayPath(path) {
  return relative(ROOT, path).split(sep).join('/');
}

/** @param {unknown} record */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/** @param {unknown} record */
function clone(record) {
  return JSON.parse(JSON.stringify(record));
}

/**
 * @param {string} path
 * @param {string} why
 */
function requireFile(path, why) {
  assert.ok(existsSync(path), `${displayPath(path)} is missing — ${why}`);
  return path;
}

/**
 * @param {unknown} record
 * @param {string[]} keys
 * @param {string} where
 */
function strings(record, keys, where) {
  if (!isObject(record)) fail(`missing ${where}`);
  for (const key of keys) {
    if (typeof record[key] !== 'string' || record[key] === '') {
      fail(`missing ${where}.${key}`);
    }
  }
}

/** @param {unknown} value */
function isIsoTimestamp(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)
  );
}

/** @param {string} text */
function splitTopLevel(text) {
  /** @type {string[]} */
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of text) {
    if (ch === '(' || ch === '[' || ch === '{') depth += 1;
    if (ch === ')' || ch === ']' || ch === '}') depth -= 1;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim() !== '') parts.push(current.trim());
  return parts;
}

/** A line that opens a function, method or arrow-function block. */
const OPENER = [
  /^function\s+[A-Za-z_$][\w$]*\s*\(.*\)\s*\{$/,
  /^[A-Za-z_$][\w$]*\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{$/,
  /^[A-Za-z_$][\w$]*\s*=\s*function\s*[\w$]*\s*\(.*\)\s*\{$/,
  /^(?!if\b|for\b|while\b|switch\b|catch\b|do\b|else\b|with\b)(?:async\s+)?[A-Za-z_$][\w$]*\s*\([^;]*\)\s*\{$/,
];

/** @param {string} line */
function braceDelta(line) {
  let delta = 0;
  for (const ch of line) {
    if (ch === '{') delta += 1;
    if (ch === '}') delta -= 1;
  }
  return delta;
}

/**
 * The brace discipline of every line in a chunk, as the depth a line starts at.
 * @param {string[]} lines
 */
function lineDepths(lines) {
  /** @type {number[]} */
  const depths = [];
  let depth = 0;
  for (const line of lines) {
    depths.push(depth);
    depth += braceDelta(line);
  }
  return depths;
}

// -------------------------------------------------- the readers (derivation) ----

/**
 * Every `ProfilerEvent` value one installed chunk declares, by name and number.
 *
 * The enum is a runtime IIFE in the shipped chunk, so this reads what the
 * browser would execute rather than a declaration file. The same reader is
 * applied to both packages; nothing here quotes a list.
 * @param {string} text
 */
function readProfilerEvents(text) {
  const start = text.indexOf('var ProfilerEvent;');
  if (start === -1) fail('the chunk carries no `var ProfilerEvent;`');
  const end = text.indexOf('})(ProfilerEvent ||', start);
  if (end === -1) fail('the chunk closes no ProfilerEvent IIFE');
  const pattern =
    /ProfilerEvent\[ProfilerEvent\["([A-Za-z]+)"\] = (\d+)\] = "([A-Za-z]+)";/g;
  /** @type {{ name: string, value: number }[]} */
  const values = [];
  let match;
  while ((match = pattern.exec(text.slice(start, end))) !== null) {
    if (match[1] !== match[3]) {
      fail(`the chunk declares ${match[1]} as ${match[3]}`);
    }
    values.push({ name: match[1], value: Number(match[2]) });
  }
  if (values.length === 0) fail('the chunk declares no ProfilerEvent value');
  return values;
}

/**
 * Every `profiler(...)` emission site one chunk carries: the line, the call as
 * written, the event the first argument names, and the argument list after it.
 * A first argument that is a local constant is resolved from that constant`s
 * own declaration, at most eight lines above — never from a neighbour`s call.
 * @param {string} text
 * @param {string} source
 * @param {string} chunk
 */
function readSites(text, source, chunk) {
  const lines = text.split('\n');
  const depths = lineDepths(lines);
  /** @type {any[]} */
  const sites = [];
  lines.forEach((line, index) => {
    if (!line.includes('profiler(')) return;
    if (line.includes('const profiler =')) return;
    if (line.includes('function setProfiler(')) return;
    const open = line.indexOf('profiler(');
    const inner = line.slice(open + 'profiler('.length, line.lastIndexOf(')'));
    const parts = splitTopLevel(inner);
    const eventArg = parts[0] ?? '';
    const args = parts.slice(1);
    /** @type {string[]} */
    let events = [];
    /** @type {{ line: number, text: string } | null} */
    let resolvedFrom = null;
    const direct = /^ProfilerEvent\.([A-Za-z]+)$/.exec(eventArg);
    if (direct !== null) {
      events = [direct[1]];
    } else {
      for (let back = index - 1; back >= Math.max(0, index - 8); back -= 1) {
        const candidate = lines[back] ?? '';
        if (
          new RegExp(`(?:const|let|var)\\s+${eventArg}\\s*=`).test(candidate)
        ) {
          events = [...candidate.matchAll(/ProfilerEvent\.([A-Za-z]+)/g)].map(
            (m) => m[1],
          );
          resolvedFrom = { line: back + 1, text: candidate.trim() };
          break;
        }
      }
    }
    if (events.length === 0) {
      fail(`line ${index + 1} of ${chunk} names no ProfilerEvent`);
    }
    /** @type {{ line: number, text: string } | null} */
    let enclosing = null;
    for (let back = index - 1; back >= 0; back -= 1) {
      const trimmed = (lines[back] ?? '').trim();
      const depth = depths[back] ?? 0;
      if (depth < (depths[index] ?? 0)) {
        if (OPENER.some((pattern) => pattern.test(trimmed))) {
          enclosing = { line: back + 1, text: trimmed };
          break;
        }
      }
    }
    sites.push({
      source,
      chunk,
      line: index + 1,
      call: line.trim(),
      eventArg,
      events,
      resolvedFrom,
      args: args.map((text) => ({
        text,
        identifier: /^[A-Za-z_$][\w$]*$/.test(text),
      })),
      enclosing,
    });
  });
  return { lines, sites };
}

/**
 * Whether a start and its end sit in one bracketed call: `try {` between them
 * when the start is outside the try, or only the `} finally {` when the start
 * is the try`s first statement.
 * @param {string[]} lines
 * @param {number} startLine
 * @param {number} endLine
 */
function bracketedShape(lines, startLine, endLine) {
  const between = lines
    .slice(startLine, endLine - 1)
    .map((line) => line.trim());
  const hasFinally = between.includes('} finally {');
  const hasTry = between.includes('try {');
  if (!hasFinally) return 'no-try-finally-between';
  return hasTry ? 'start-then-try-finally' : 'one-try-finally';
}

// ------------------------------------------------ derivation: the identity ----

/**
 * The value one `identity` side of a pair records: what the call passes, and
 * the one thing that argument list can be said to be — an instance or nothing.
 * @param {any[]} sites
 */
function identitySide(sites) {
  return sites.map((site) => ({
    source: site.source,
    line: site.line,
    argCount: site.args.length,
    expression: site.args.length === 0 ? null : (site.args[0]?.text ?? null),
    identity: site.args.length === 0 ? 'none' : 'instance',
  }));
}

/**
 * The five pairs `identity.perPair` records: each side`s sites, the argument
 * list they pass, and — for a pair whose start and end sit in one function —
 * the bracketing that function gives them.
 * @param {any[]} sites
 * @param {Map<string, { lines: string[] }>} bySource
 * @param {(name: string) => number} valueOf
 */
function pairSites(sites, bySource, valueOf) {
  return PAIR_SPECS.map(([label, startName, endName]) => {
    const starts = sites.filter((site) => site.events[0] === startName);
    const ends = sites.filter((site) => site.events[0] === endName);
    if (starts.length === 0) fail(`${label} has no ${startName} emission site`);
    if (ends.length === 0) fail(`${label} has no ${endName} emission site`);
    const startDetail = identitySide(starts);
    const endDetail = identitySide(ends);
    const startCarries = startDetail.every((s) => s.identity !== 'none');
    const endCarries = endDetail.every((s) => s.identity !== 'none');
    const carriesIdentity =
      startCarries && endCarries
        ? 'both'
        : startCarries
          ? 'start-only'
          : endCarries
            ? 'end-only'
            : 'none';
    /** @type {any[]} */
    const sitePairs = [];
    for (const startSite of starts) {
      const candidate = ends
        .filter(
          (end) =>
            end.source === startSite.source &&
            end.line > startSite.line &&
            startSite.enclosing !== null &&
            end.enclosing !== null &&
            end.enclosing.text === startSite.enclosing.text,
        )
        .sort((a, b) => a.line - b.line)[0];
      if (candidate === undefined) continue;
      const source = bySource.get(startSite.source);
      if (source === undefined) {
        fail(`the ${startSite.source} chunk was not read`);
      }
      sitePairs.push({
        source: startSite.source,
        startLine: startSite.line,
        endLine: candidate.line,
        sameEnclosingFunction: true,
        shape: bracketedShape(source.lines, startSite.line, candidate.line),
      });
    }
    return {
      label,
      start: valueOf(startName),
      end: valueOf(endName),
      startSites: startDetail,
      endSites: endDetail,
      carriesIdentity,
      sharesAnEnclosingFunction:
        startDetail.length > 0 && sitePairs.length === startDetail.length,
      sitePairs,
    };
  });
}

// ------------------------------------------------- the live facts, built once ----

const live = (() => {
  /** @type {Map<string, { lines: string[], sites: any[], values: { name: string, value: number }[] }>} */
  const bySource = new Map();
  /** @type {any[]} */
  const sources = [];
  /** @type {any[]} */
  const sites = [];
  for (const spec of SOURCES) {
    const chunkPath = `${spec.root}/${CHUNK}`;
    const manifestPath = `${spec.root}/${MANIFEST}`;
    requireFile(join(ROOT, chunkPath), 'run npm ci at the fixture');
    requireFile(join(ROOT, manifestPath), 'run npm ci');
    const text = readFileSync(join(ROOT, chunkPath), 'utf8');
    const values = readProfilerEvents(text);
    const read = readSites(text, spec.label, chunkPath);
    bySource.set(spec.label, { lines: read.lines, sites: read.sites, values });
    sites.push(...read.sites);
    const pkg = JSON.parse(readFileSync(join(ROOT, manifestPath), 'utf8'));
    if (typeof pkg.version !== 'string' || pkg.version === '') {
      fail(`${manifestPath} declares no version`);
    }
    sources.push({
      package: spec.package,
      manifest: manifestPath,
      version: pkg.version,
      chunk: chunkPath,
      count: values.length,
      values,
      pairs: PAIR_SPECS.map(([label, startName, endName]) => ({
        label,
        start: { ...values.find((v) => v.name === startName) },
        end: { ...values.find((v) => v.name === endName) },
      })),
    });
  }
  const perPair = pairSites(sites, bySource, (name) => {
    const values = sources[0]?.values ?? [];
    const found = values.find((value) => value.name === name);
    if (found === undefined) fail(`${name} is not a ProfilerEvent value`);
    return found.value;
  });
  return {
    bySource,
    sources,
    sites,
    perPair,
    valuesFor: (/** @type {string} */ name) => {
      const values = sources[0]?.values ?? [];
      const found = values.find((value) => value.name === name);
      if (found === undefined) fail(`${name} is not a ProfilerEvent value`);
      return found.value;
    },
    agent: readAgent(),
  };
})();

/** The page agent`s frame boundary and its one profiler tap, from its source. */
function readAgent() {
  requireFile(AGENT_PATH, 'the page agent is part of this repository');
  const lines = readFileSync(AGENT_PATH, 'utf8').split('\n');
  /**
   * @param {string} needle
   * @param {number} [from]
   */
  const lineOf = (needle, from = 0) => {
    const index = lines.findIndex(
      (line, at) => at >= from && line.includes(needle),
    );
    if (index === -1)
      fail(`${AGENT_SOURCE} carries no ${JSON.stringify(needle)}`);
    return index + 1;
  };
  const literalStart = lines.findIndex((line) =>
    line.includes('var ProfilerEvent = {'),
  );
  if (literalStart === -1) {
    fail(`${AGENT_SOURCE} carries no \`var ProfilerEvent = {\` literal`);
  }
  const literalEnd = lines.findIndex(
    (line, at) => at > literalStart && line.trim() === '};',
  );
  if (literalEnd === -1) fail('the agent`s ProfilerEvent literal never closes');
  const literal = [
    ...lines
      .slice(literalStart, literalEnd)
      .join('\n')
      .matchAll(/^\s*([A-Za-z]+):\s*(\d+),\s*$/gm),
  ].map((match) => ({ name: match[1], value: Number(match[2]) }));
  if (literal.length === 0) fail('the agent`s ProfilerEvent literal is empty');
  const taps = lines.filter((line) => line.includes('setProfiler(')).length;
  const openBranchLine = lineOf(
    'if (event === ProfilerEvent.TemplateUpdateStart) {',
  );
  const openCall = lineOf('if (!cycle) openCycle();', openBranchLine - 1);
  if (openCall < openBranchLine) {
    fail(
      `the agent opens a cycle at line ${openCall}, before the TemplateUpdateStart branch at ${openBranchLine}`,
    );
  }
  return {
    literal,
    taps,
    tapLine: lineOf('var remover = setProfiler(subscriber);'),
    openBranch: openBranchLine,
    openCall,
    openFunction: lineOf('function openCycle() {'),
    closeQueue: lineOf('globalThis.queueMicrotask(closeCycle);'),
    closeFunction: lineOf('function closeCycle() {'),
  };
}

// ------------------------------------------------------------ the record ----

function loadRecord() {
  requireFile(RECORD_PATH, 'the measurement has not been recorded');
  return JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
}

// ------------------------------------------------- validation: the pairs ----

/**
 * @param {any} record
 */
function validatePairs(record) {
  const pairs = record.pairs;
  if (!isObject(pairs)) fail('missing pairs');
  strings(pairs, ['question', 'finding'], 'pairs');
  strings(pairs.reader, ['how', 'pattern', 'why'], 'pairs.reader');
  if (!Array.isArray(pairs.sources) || pairs.sources.length !== 2) {
    fail('pairs.sources must hold exactly two installs');
  }
  for (const source of pairs.sources) {
    strings(
      source,
      ['package', 'manifest', 'version', 'chunk'],
      'pairs.sources[]',
    );
    const derived = live.sources.find((s) => s.manifest === source.manifest);
    if (derived === undefined) {
      fail(
        `pairs.sources names ${source.manifest}, which is not one of the two installed copies this file reads`,
      );
    }
    if (source.version !== derived.version) {
      fail(
        `the ${source.package} install moved since the measurement: recorded ${source.version}, installed ${derived.version}`,
      );
    }
    if (source.chunk !== derived.chunk) {
      fail(
        `pairs.sources names chunk ${source.chunk}, which is not ${derived.chunk}`,
      );
    }
    if (source.count !== derived.values.length) {
      fail(
        `the recorded count for ${source.chunk} is ${source.count} and the installed package declares ${derived.values.length}`,
      );
    }
    assert.deepEqual(
      source.values,
      derived.values,
      `the ProfilerEvent list of ${source.chunk} moved since the measurement`,
    );
    assert.deepEqual(
      source.pairs,
      derived.pairs,
      `the five pair numbers of ${source.chunk} are not the numbers the installed enum derives`,
    );
  }
  const identical =
    JSON.stringify(live.sources[0]?.values) ===
    JSON.stringify(live.sources[1]?.values);
  if (pairs.identical !== identical) {
    fail(
      `pairs.identical is ${pairs.identical} and the two installs ${identical ? 'agree' : 'differ'}`,
    );
  }
  if (pairs.derivedCount !== live.sources[0]?.values.length) {
    fail(
      `pairs.derivedCount is ${pairs.derivedCount} and the reader derives ${live.sources[0]?.values.length}`,
    );
  }
  for (const [label, startName, endName] of PAIR_SPECS) {
    const source = live.sources[1];
    const start = source?.values.find((v) => v.name === startName);
    const end = source?.values.find((v) => v.name === endName);
    const stated = pairs.sources[1]?.pairs.find((p) => p.label === label);
    if (stated === undefined) fail(`pairs.sources[1] records no ${label}`);
    assert.deepEqual(
      stated.start,
      start,
      `${label}'s start value is not ${startName}'s number`,
    );
    assert.deepEqual(
      stated.end,
      end,
      `${label}'s end value is not ${endName}'s number`,
    );
  }
}

// ------------------------------------------------- validation: the identity ----

/**
 * The identity one pair`s ends carried on each page the witness read. It is
 * built from the witness` own per-pair rows, so a name in the identity section
 * that the measurement never produced cannot survive this comparison.
 * @param {string} label
 * @param {any[]} pages
 */
function perPairWitness(label, pages) {
  /** @type {Record<string, any>} */
  const measured = {};
  for (const page of pages) {
    const pair = page.pairs.find((entry) => entry.label === label);
    if (pair === undefined) {
      fail(`the witness at ${page.url} records no ${label} row`);
    }
    measured[page.url] = {
      startCount: pair.startCount,
      endCount: pair.endCount,
      startInstance: pair.startInstance,
      endInstance: pair.endInstance,
      startEventFn: pair.startEventFn,
      endEventFn: pair.endEventFn,
    };
  }
  return measured;
}

/**
 * @param {any} record
 */
function validateIdentity(record) {
  const identity = record.identity;
  if (!isObject(identity)) fail('missing identity');
  strings(identity, ['question', 'finding', 'verdict'], 'identity');
  strings(identity.reader, ['how', 'pattern', 'why'], 'identity.reader');
  if (identity.verdict !== 'answered') {
    fail(`identity.verdict is ${identity.verdict}`);
  }
  if (!Array.isArray(identity.sites)) fail('identity.sites is not a list');
  assert.deepEqual(
    identity.sites,
    live.sites,
    'the recorded emission sites are not the sites this run reads from the two installed chunks, so an argument list was transcribed rather than derived',
  );
  if (!Array.isArray(identity.perPair) || identity.perPair.length !== 5) {
    fail('identity.perPair must hold the five pairs');
  }
  for (const [index, derived] of live.perPair.entries()) {
    const stated = identity.perPair[index];
    if (!isObject(stated)) fail('identity.perPair[] is not an object');
    for (const key of [
      'label',
      'start',
      'end',
      'carriesIdentity',
      'sharesAnEnclosingFunction',
    ]) {
      if (stated[key] !== derived[key]) {
        fail(
          `identity.perPair[${derived.label}].${key} is ${JSON.stringify(stated[key])} and the sites derive ${JSON.stringify(derived[key])}`,
        );
      }
    }
    assert.deepEqual(
      stated.startSites,
      derived.startSites,
      `identity.perPair[${derived.label}].startSites is not the argument list this run reads`,
    );
    assert.deepEqual(
      stated.endSites,
      derived.endSites,
      `identity.perPair[${derived.label}].endSites is not the argument list this run reads`,
    );
    assert.deepEqual(
      stated.sitePairs,
      derived.sitePairs,
      `identity.perPair[${derived.label}].sitePairs is not the bracketing this run derives`,
    );
    assert.deepEqual(
      stated.witness,
      perPairWitness(derived.label, record.witness.pages),
      `identity.perPair[${derived.label}].witness names an identity the witness pages do not carry`,
    );
  }

  const none = live.perPair.filter((p) => p.carriesIdentity === 'none');
  if (none.length !== 1) {
    fail(
      `${none.length} pair(s) carry no identity; the milestone records exactly one named absence`,
    );
  }
  const absence = identity.namedAbsence;
  if (!isObject(absence)) fail('missing identity.namedAbsence');
  strings(
    absence,
    ['pair', 'evidence', 'consequence'],
    'identity.namedAbsence',
  );
  if (absence.carriesIdentity !== 'none') {
    fail(
      `identity.namedAbsence.carriesIdentity is ${absence.carriesIdentity}; an absence that carries an identity is not an absence`,
    );
  }
  const absentPair = live.perPair.find((p) => p.label === none[0]?.label);
  if (
    absence.pair !==
    `${absentPair?.label} ${absentPair?.start}/${absentPair?.end}`
  ) {
    fail(
      `identity.namedAbsence.pair is ${absence.pair}, and the sites derive ${absentPair?.label} ${absentPair?.start}/${absentPair?.end}`,
    );
  }
  if (!/names nothing|no component/i.test(absence.evidence)) {
    fail('identity.namedAbsence.evidence does not state that nothing is named');
  }
  if (!/cannot-tell/.test(absence.consequence)) {
    fail(
      'identity.namedAbsence.consequence does not name the cannot-tell answer',
    );
  }
  assert.match(
    identity.finding,
    /one carries none at all \(ChangeDetection\)/,
    'identity.finding no longer states the named absence',
  );
}

// --------------------------------------------------- validation: the frames ----

/**
 * @param {any} record
 */
function validateFrames(record) {
  const frames = record.frames;
  if (!isObject(frames)) fail('missing frames');
  strings(frames, ['question', 'rule', 'finding', 'verdict'], 'frames');
  if (frames.verdict !== 'answered')
    fail(`frames.verdict is ${frames.verdict}`);
  if (!Array.isArray(frames.brackets) || frames.brackets.length !== 5) {
    fail('frames.brackets must hold the five pairs');
  }
  const derivedBrackets = live.perPair.map((pair) => ({
    label: pair.label,
    start: pair.start,
    end: pair.end,
    sharesAnEnclosingFunction: pair.sharesAnEnclosingFunction,
    sitePairs: pair.sitePairs,
  }));
  for (const [index, derived] of derivedBrackets.entries()) {
    const stated = frames.brackets[index];
    for (const key of ['label', 'start', 'end', 'sharesAnEnclosingFunction']) {
      if (stated[key] !== derived[key]) {
        fail(
          `frames.brackets[${derived.label}].${key} is ${JSON.stringify(stated[key])} and the sites derive ${JSON.stringify(derived[key])}`,
        );
      }
    }
    assert.deepEqual(
      stated.sitePairs,
      derived.sitePairs,
      `frames.brackets[${derived.label}].sitePairs is not the bracketing the chunk shows`,
    );
    if (!isObject(stated.agentFrame)) {
      fail(`missing frames.brackets[${derived.label}].agentFrame`);
    }
  }

  const agent = frames.agentFrame;
  if (!isObject(agent)) fail('missing frames.agentFrame');
  strings(agent, ['how', 'opensOn'], 'frames.agentFrame');
  const expected = {
    opensOn: 'TemplateUpdateStart',
    opensOnValue: live.valuesFor('TemplateUpdateStart'),
    openBranch: live.agent.openBranch,
    openCall: live.agent.openCall,
    openFunction: live.agent.openFunction,
    closeQueue: live.agent.closeQueue,
    closeFunction: live.agent.closeFunction,
    profilerTaps: live.agent.taps,
    tapLine: live.agent.tapLine,
  };
  for (const [key, value] of Object.entries(expected)) {
    if (agent[key] !== value) {
      fail(
        `frames.agentFrame.${key} is ${JSON.stringify(agent[key])} and the agent's source yields ${JSON.stringify(value)}`,
      );
    }
  }
  if (live.agent.taps !== 1) {
    fail(
      `extension/agent-main.js holds ${live.agent.taps} setProfiler call(s); the widening extends the one subscription and never adds a second tap`,
    );
  }

  const witness = record.witness;
  if (!isObject(witness) || !Array.isArray(witness.pages)) {
    fail('missing witness.pages');
  }
  for (const page of witness.pages) {
    if (!Array.isArray(page.pairs)) fail(`witness.pages[${page.url}].pairs`);
    for (const measured of page.pairs) {
      const stated = frames.brackets.find((b) => b.label === measured.label);
      const recorded = stated?.agentFrame?.[page.url];
      if (recorded === undefined) {
        fail(
          `frames.brackets[${measured.label}] records no frame for ${page.url}`,
        );
      }
      for (const key of [
        'startCount',
        'endCount',
        'bracketsInOneFrame',
        'startsArrivedWithNoFrame',
        'endsArrivedWithNoFrame',
      ]) {
        if (recorded[key] !== measured[key]) {
          fail(
            `frames.brackets[${measured.label}].agentFrame[${page.url}].${key} is ${recorded[key]} and the witness measured ${measured[key]}`,
          );
        }
      }
    }
  }

  const startsWithNoFrame = live.perPair
    .map((pair) => ({
      label: pair.label,
      start: pair.start,
      observed: witness.pages.reduce(
        (sum, page) =>
          sum +
          (page.pairs.find((p) => p.label === pair.label)?.startCount ?? 0),
        0,
      ),
      startsArrivedWithNoFrame: witness.pages.reduce(
        (sum, page) =>
          sum +
          (page.pairs.find((p) => p.label === pair.label)
            ?.startsArrivedWithNoFrame ?? 0),
        0,
      ),
    }))
    .filter((entry) => entry.startsArrivedWithNoFrame > 0);
  assert.deepEqual(
    frames.startsWithNoFrame,
    startsWithNoFrame,
    'frames.startsWithNoFrame is not the set of pairs whose start the witness saw arrive with no frame open',
  );

  const disagreements = live.perPair
    .map((pair) => {
      const measured = witness.pages
        .map((page) => page.pairs.find((p) => p.label === pair.label))
        .filter((p) => p !== undefined && p.startCount > 0);
      const agentFrameHoldsBothEnds =
        measured.length > 0 &&
        measured.every((p) => p.bracketsInOneFrame === p.startCount);
      return {
        label: pair.label,
        start: pair.start,
        end: pair.end,
        bracketedCallHoldsBothEnds: pair.sharesAnEnclosingFunction,
        agentFrameHoldsBothEnds,
      };
    })
    .filter(
      (entry) =>
        entry.bracketedCallHoldsBothEnds !== entry.agentFrameHoldsBothEnds,
    );
  if (!Array.isArray(frames.disagreements)) {
    fail('frames.disagreements is not a list');
  }
  if (frames.disagreements.length !== disagreements.length) {
    fail(
      `frames.disagreements records ${frames.disagreements.length} disagreement(s) and the sites and the witness yield ${disagreements.length}`,
    );
  }
  for (const [index, derived] of disagreements.entries()) {
    const stated = frames.disagreements[index];
    for (const key of [
      'label',
      'start',
      'end',
      'bracketedCallHoldsBothEnds',
      'agentFrameHoldsBothEnds',
    ]) {
      if (stated[key] !== derived[key]) {
        fail(
          `frames.disagreements[${derived.label}].${key} is ${JSON.stringify(stated[key])} and the derivation yields ${JSON.stringify(derived[key])}`,
        );
      }
    }
    strings(stated, ['detail', 'narratorObeys'], 'frames.disagreements[]');
  }
  assert.match(
    frames.rule,
    /arrival order/,
    'frames.rule does not name the matching rule the narrator must obey',
  );
  assert.match(
    frames.rule,
    /unmeasured/,
    'frames.rule does not name what an unmatched start reports',
  );
}

// -------------------------------------------------- validation: the witness ----

/**
 * @param {any} record
 */
function validateWitness(record) {
  const witness = record.witness;
  if (!isObject(witness)) fail('missing witness');
  if (witness.attempted !== true) {
    fail(
      'witness.attempted is not true: this task records a measurement, not a plan',
    );
  }
  if (!isIsoTimestamp(witness.at)) fail(`witness.at is ${witness.at}`);
  strings(witness, ['instrumentation'], 'witness');
  strings(witness.instance, ['name', 'browser'], 'witness.instance');
  if (typeof witness.instance.cdp !== 'number') {
    fail('witness.instance.cdp is not a port number');
  }
  strings(
    witness.build,
    ['app', 'angular', 'url', 'servedBy', 'configuration'],
    'witness.build',
  );
  if (witness.build.angular !== live.sources[1]?.version) {
    fail(
      `witness.build.angular is ${witness.build.angular} and the fixture installs ${live.sources[1]?.version}`,
    );
  }
  if (!Array.isArray(witness.pages) || witness.pages.length === 0) {
    fail('witness.pages is empty');
  }
  const routes = witness.pages.map((page) =>
    String(page.url).replace(/^https?:\/\/[^/]+/, ''),
  );
  assert.deepEqual(
    witness.routesDriven,
    routes,
    'witness.routesDriven is not the set of pages the witness read',
  );
  if (!routes.includes('/')) {
    fail('the witness drove no page at /, the counter fixture`s own route');
  }

  for (const page of witness.pages) {
    strings(page, ['url', 'angularVersion'], `witness.pages[]`);
    if (page.angularVersion !== live.sources[1]?.version) {
      fail(
        `the page at ${page.url} served Angular ${page.angularVersion} and the fixture installs ${live.sources[1]?.version}`,
      );
    }
    if (page.zoneGlobal !== false) {
      fail(
        `the page at ${page.url} carries Zone (${page.zoneGlobal}); the agent refuses a zoneful page before it subscribes, so this page cannot witness the profiler`,
      );
    }
    if (!Array.isArray(page.perEvent) || page.perEvent.length === 0) {
      fail(`witness.pages[${page.url}].perEvent is empty`);
    }
    if (!Array.isArray(page.frameOrders) || page.frameOrders.length === 0) {
      fail(`witness.pages[${page.url}].frameOrders is empty`);
    }
    const recorded = page.perEvent.reduce((sum, e) => sum + e.count, 0);
    if (recorded !== page.eventsRecorded) {
      fail(
        `witness.pages[${page.url}] counts ${page.eventsRecorded} event(s) and its per-event rows sum to ${recorded}`,
      );
    }
    const byEvent = new Map(page.perEvent.map((e) => [e.event, e]));
    for (const entry of page.perEvent) {
      if (entry.arrivedInOpenFrame + entry.arrivedWithNoFrame !== entry.count) {
        fail(
          `witness.pages[${page.url}].perEvent[${entry.name}] does not add up to its own count`,
        );
      }
      if (entry.name === null) {
        fail(
          `witness.pages[${page.url}] records event ${entry.event} with no name`,
        );
      }
      const derived = live.valuesFor(entry.name);
      if (entry.event !== derived) {
        fail(
          `witness.pages[${page.url}] records ${entry.name} as ${entry.event} and the installed enum declares ${derived}`,
        );
      }
    }
    for (const measured of page.pairs) {
      const startRow = byEvent.get(measured.start);
      const endRow = byEvent.get(measured.end);
      if (startRow === undefined && measured.startCount !== 0) {
        fail(
          `witness.pages[${page.url}] pairs[${measured.label}] names an unrecorded event`,
        );
      }
      if (endRow === undefined && measured.endCount !== 0) {
        fail(
          `witness.pages[${page.url}] pairs[${measured.label}] names an unrecorded event`,
        );
      }
      if (startRow !== undefined && measured.startCount !== startRow.count) {
        fail(
          `witness.pages[${page.url}] ${measured.label} startCount disagrees with its per-event row`,
        );
      }
      if (endRow !== undefined && measured.endCount !== endRow.count) {
        fail(
          `witness.pages[${page.url}] ${measured.label} endCount disagrees with its per-event row`,
        );
      }
      if (
        startRow !== undefined &&
        measured.startsArrivedWithNoFrame !== startRow.arrivedWithNoFrame
      ) {
        fail(
          `witness.pages[${page.url}] ${measured.label} startsArrivedWithNoFrame disagrees with its per-event row`,
        );
      }
      if (measured.bracketsInOneFrame > measured.startCount) {
        fail(
          `witness.pages[${page.url}] ${measured.label} pairs more brackets than it saw starts`,
        );
      }
    }
    const orders = page.frameOrders.map((frame) => JSON.stringify(frame.order));
    if (new Set(orders).size !== 1) {
      fail(
        `witness.pages[${page.url}] records different frame orders (${[...new Set(orders)].join(' vs ')}), so the record's single order is not the observation`,
      );
    }
    const first = page.frameOrders[0].order;
    if (first[0] !== live.valuesFor('TemplateUpdateStart')) {
      fail(
        `witness.pages[${page.url}] opens a frame on event ${first[0]} and the agent opens on TemplateUpdateStart ${live.valuesFor('TemplateUpdateStart')}`,
      );
    }
    const inFrames = new Map();
    for (const frame of page.frameOrders) {
      for (const event of frame.order) {
        inFrames.set(event, (inFrames.get(event) ?? 0) + 1);
      }
    }
    // A frame`s opener belongs to the frame it opened, so the events a page
    // lists inside its frames are the ones that arrived with a frame already
    // open plus one opener per frame.
    const opener = live.valuesFor('TemplateUpdateStart');
    for (const entry of page.perEvent) {
      const listed = inFrames.get(entry.event) ?? 0;
      const expected =
        entry.arrivedInOpenFrame +
        (entry.event === opener ? page.frameOrders.length : 0);
      if (listed !== expected) {
        fail(
          `witness.pages[${page.url}] lists ${listed} ${entry.name} event(s) inside a frame and its per-event row says ${entry.arrivedInOpenFrame} with ${page.frameOrders.length} frame(s) opened`,
        );
      }
    }
  }

  for (const pair of live.perPair) {
    for (const page of witness.pages) {
      const measured = page.pairs.find((p) => p.label === pair.label);
      if (measured === undefined)
        fail(`witness.pages[${page.url}] omits ${pair.label}`);
      if (measured.startCount === 0) continue;
      const startRow = page.perEvent.find((e) => e.event === pair.start);
      const endRow = page.perEvent.find((e) => e.event === pair.end);
      const startCarries = Object.keys(startRow.instanceKinds).some(
        (kind) => kind !== 'null',
      );
      const endCarries = Object.keys(endRow.instanceKinds).some(
        (kind) => kind !== 'null',
      );
      const stated = pair.carriesIdentity;
      const startClaims = stated === 'both' || stated === 'start-only';
      const endClaims = stated === 'both' || stated === 'end-only';
      if (startCarries !== startClaims) {
        fail(
          `${pair.label} is recorded as ${stated} on its start, and the page at ${page.url} measured ${JSON.stringify(startRow.instanceKinds)}`,
        );
      }
      if (endCarries !== endClaims) {
        fail(
          `${pair.label} is recorded as ${stated} on its end, and the page at ${page.url} measured ${JSON.stringify(endRow.instanceKinds)}`,
        );
      }
      for (const entry of [startRow, endRow]) {
        if (Object.keys(entry.instanceKinds).some((kind) => kind !== 'null')) {
          continue;
        }
        if (
          Object.keys(entry.eventFnKinds).some((kind) => kind === 'function')
        ) {
          fail(
            `${page.url} measured no instance but a function for ${entry.name}; a function is not a component identity and the record must not read it as one`,
          );
        }
      }
    }
  }

  const portal = witness.portalAttempt;
  if (!isObject(portal)) fail('missing witness.portalAttempt');
  strings(
    portal,
    [
      'target',
      'path',
      'pin',
      'angular',
      'routeTried',
      'result',
      'lacks',
      'countedAs',
    ],
    'witness.portalAttempt',
  );
  if (!/portal/i.test(portal.target)) {
    fail('witness.portalAttempt.target does not name the Insurance Portal');
  }
  if (portal.result !== 'negative') {
    fail(
      `witness.portalAttempt.result is ${JSON.stringify(portal.result)}; the pinned zoneful worktree was refused, not driven`,
    );
  }
  if (!/not a capture/.test(portal.countedAs)) {
    fail(
      'witness.portalAttempt.countedAs does not say it is a negative rather than a capture',
    );
  }
  if (!/zoneless/.test(portal.lacks)) {
    fail(
      'witness.portalAttempt.lacks does not name the artefact the target lacks',
    );
  }
  if (!Array.isArray(witness.negatives) || witness.negatives.length === 0) {
    fail('witness.negatives is empty');
  }
  for (const negative of witness.negatives) {
    if (typeof negative !== 'string' || negative === '') {
      fail('a witness.negatives entry is empty');
    }
  }
}

// ------------------------------------------------------ the whole record ----

/**
 * @param {unknown} value
 */
function validate(value) {
  if (!isObject(value)) fail('the recording is not an object');
  if (value.schema !== 'm040-work-events/v1') {
    fail(`the recording schema is ${JSON.stringify(value.schema)}`);
  }
  if (value.milestone !== 'performance-narrator') {
    fail(`the recording milestone is ${JSON.stringify(value.milestone)}`);
  }
  if (value.task !== 'T001')
    fail(`the recording task is ${JSON.stringify(value.task)}`);
  strings(
    value,
    ['title', 'question', 'capturedAt', 'verdict'],
    'the recording',
  );
  if (!isIsoTimestamp(value.capturedAt))
    fail(`the recording capturedAt is ${value.capturedAt}`);
  if (value.verdict !== 'answered')
    fail(`the recording verdict is ${value.verdict}`);
  strings(
    value.commands,
    ['check', 'serve', 'browser', 'drive', 'teardown'],
    'commands',
  );
  strings(
    value.environment,
    ['platform', 'shell', 'node', 'instance', 'fixture'],
    'environment',
  );
  if (!value.commands.check.includes('performance-measure')) {
    fail('the recorded check command is not this suite');
  }
  if (!Array.isArray(value.doesNotSettle) || value.doesNotSettle.length === 0) {
    fail('the record does not say what it does not settle');
  }
  for (const entry of value.doesNotSettle) {
    if (typeof entry !== 'string' || entry === '') {
      fail('a doesNotSettle entry is empty');
    }
  }
  validatePairs(value);
  validateIdentity(value);
  validateFrames(value);
  validateWitness(value);
  return true;
}

// ------------------------------------------------------------ the checks ----

test('the recording validates against the installed packages and its own witness', () => {
  assert.doesNotThrow(() => validate(loadRecord()));
});

test('the recording is the canonical serialisation of its own record', () => {
  const text = readFileSync(RECORD_PATH, 'utf8');
  assert.equal(
    text,
    canonical(loadRecord()),
    'the recording is not the canonical serialisation of its record, so a re-measurement would not reproduce these bytes',
  );
});

test('the five pairs are read from both installed chunks, not quoted', () => {
  const record = loadRecord();
  const panel = live.sources[0];
  const fixture = live.sources[1];
  assert.ok(panel !== undefined && fixture !== undefined);
  assert.equal(
    panel.values.length,
    26,
    `the panel declares ${panel.values.length} values`,
  );
  assert.deepEqual(
    fixture.values,
    panel.values,
    'the two installs no longer declare the same list',
  );
  assert.deepEqual(
    record.pairs.sources[0].values,
    panel.values,
    'the recorded enumeration is not the list this run derives',
  );
  const numbers = PAIR_SPECS.map(([label, startName, endName]) => {
    const start = live.valuesFor(startName);
    const end = live.valuesFor(endName);
    return `${label} ${start}/${end}`;
  });
  assert.deepEqual(numbers, [
    'TemplateUpdate 2/3',
    'LifecycleHook 4/5',
    'ChangeDetection 12/13',
    'Component 18/19',
    'HostBindingsUpdate 24/25',
  ]);
});

test('every emission site is recorded with the argument list it passes', () => {
  const record = loadRecord();
  const sites = live.sites;
  assert.equal(
    sites.length,
    58,
    `the two chunks carry ${sites.length} emission sites, not 58`,
  );
  const perSource = SOURCES.map((spec) => ({
    source: spec.label,
    count: sites.filter((site) => site.source === spec.label).length,
  }));
  assert.deepEqual(perSource, [
    { source: 'panel', count: 29 },
    { source: 'fixture', count: 29 },
  ]);
  for (const site of sites) {
    if (site.enclosing === null) {
      fail(`the site at ${site.chunk}:${site.line} sits in no function`);
    }
    if (site.events.length === 0) {
      fail(`the site at ${site.chunk}:${site.line} names no event`);
    }
  }
  // The five pairs' argument lists, read as written.
  const written = live.perPair.map((pair) => [
    pair.label,
    pair.startSites.map((s) => `${s.expression ?? ''}`.trim() || 'nothing'),
    pair.endSites.map((s) => `${s.expression ?? ''}`.trim() || 'nothing'),
  ]);
  assert.deepEqual(written, [
    ['TemplateUpdate', ['context', 'context'], ['context', 'context']],
    [
      'LifecycleHook',
      [
        'directive',
        'callContext',
        'context',
        'directive',
        'callContext',
        'context',
      ],
      [
        'directive',
        'callContext',
        'context',
        'directive',
        'callContext',
        'context',
      ],
    ],
    [
      'ChangeDetection',
      ['nothing', 'nothing'],
      ['nothing', 'nothing', 'nothing', 'nothing'],
    ],
    [
      'Component',
      ['nothing', 'nothing', 'nothing', 'nothing'],
      [
        'componentView[CONTEXT]',
        'componentView[CONTEXT]',
        'componentView[CONTEXT]',
        'componentView[CONTEXT]',
      ],
    ],
    ['HostBindingsUpdate', ['context', 'context'], ['context', 'context']],
  ]);
  assert.match(
    record.identity.reader.why,
    /names the call site and the argument list it read/,
    'the reader no longer states that it names the call site it read',
  );
  assert.match(
    record.identity.reader.why,
    /does not infer an argument from a neighbouring call/,
    'the reader no longer states that it reads the call it names',
  );
});

test('no pair is named where the profiler passes no identity', () => {
  const record = loadRecord();
  const absence = record.identity.perPair.find(
    (pair) => pair.carriesIdentity === 'none',
  );
  assert.ok(absence, 'no pair is recorded as carrying no identity');
  assert.equal(absence.label, 'ChangeDetection');
  for (const side of ['startSites', 'endSites']) {
    for (const site of absence[side]) {
      assert.equal(
        site.argCount,
        0,
        `${side} of ${absence.label} passes an argument`,
      );
      assert.equal(site.identity, 'none');
      assert.equal(site.expression, null);
    }
  }
  for (const page of record.witness.pages) {
    const measured = page.pairs.find(
      (pair) => pair.label === 'ChangeDetection',
    );
    assert.ok(measured !== undefined);
    assert.ok(
      measured.startCount > 0,
      `the witness saw no ChangeDetection start on ${page.url}`,
    );
    assert.deepEqual(measured.startInstance, ['null']);
    assert.deepEqual(measured.endInstance, ['null']);
    assert.deepEqual(measured.startEventFn, ['undefined']);
    assert.deepEqual(measured.endEventFn, ['undefined']);
  }
  assert.equal(record.identity.namedAbsence.carriesIdentity, 'none');
  assert.match(record.identity.namedAbsence.evidence, /instance = null/);
});

test('a component bracket is named by its end and never by its start', () => {
  const record = loadRecord();
  const component = record.identity.perPair.find(
    (pair) => pair.label === 'Component',
  );
  assert.ok(component !== undefined);
  assert.equal(component.carriesIdentity, 'end-only');
  for (const site of component.startSites) assert.equal(site.argCount, 0);
  for (const site of component.endSites) {
    assert.equal(site.argCount, 1);
    assert.equal(site.expression, 'componentView[CONTEXT]');
  }
  const page = record.witness.pages.find((p) => p.url.endsWith('/'));
  const measured = page.pairs.find((pair) => pair.label === 'Component');
  assert.deepEqual(measured.startInstance, ['null']);
  assert.ok(
    measured.endInstance.every((name) => name !== 'null'),
    `the ComponentEnd measured ${JSON.stringify(measured.endInstance)}`,
  );
});

test('the agent frame opens on TemplateUpdateStart and closes in a microtask', () => {
  const record = loadRecord();
  const agent = record.frames.agentFrame;
  assert.equal(agent.opensOn, 'TemplateUpdateStart');
  assert.equal(agent.opensOnValue, live.valuesFor('TemplateUpdateStart'));
  assert.equal(agent.profilerTaps, 1);
  const source = readFileSync(AGENT_PATH, 'utf8').split('\n');
  assert.match(
    source[(agent.openBranch ?? 0) - 1] ?? '',
    /ProfilerEvent\.TemplateUpdateStart/,
  );
  assert.match(source[(agent.openCall ?? 0) - 1] ?? '', /openCycle\(\)/);
  assert.match(
    source[(agent.closeQueue ?? 0) - 1] ?? '',
    /queueMicrotask\(closeCycle\)/,
  );
  assert.match(source[(agent.tapLine ?? 0) - 1] ?? '', /setProfiler\(/);
});

test('the bracketed call and the agent frame disagree for Component, and the rule names it', () => {
  const record = loadRecord();
  const disagreement = record.frames.disagreements.find(
    (entry) => entry.label === 'Component',
  );
  assert.ok(disagreement, 'the Component disagreement is no longer recorded');
  assert.equal(disagreement.bracketedCallHoldsBothEnds, true);
  assert.equal(disagreement.agentFrameHoldsBothEnds, false);
  assert.match(disagreement.narratorObeys, /no frame open|unmeasured/);
  const changeDetection = record.frames.brackets.find(
    (b) => b.label === 'ChangeDetection',
  );
  assert.equal(changeDetection.sharesAnEnclosingFunction, false);
  const startsWithNoFrame = record.frames.startsWithNoFrame.find(
    (entry) => entry.label === 'ChangeDetection',
  );
  assert.ok(startsWithNoFrame !== undefined);
  assert.equal(
    startsWithNoFrame.startsArrivedWithNoFrame,
    startsWithNoFrame.observed,
  );
});

test('the witness names no identity the site reading lacks', () => {
  const record = loadRecord();
  for (const pair of record.identity.perPair) {
    for (const [url, measured] of Object.entries(pair.witness)) {
      if (measured.startCount === 0) continue;
      const named = [...measured.startInstance, ...measured.endInstance].filter(
        (name) => name !== 'null' && name !== 'undefined',
      );
      if (pair.carriesIdentity === 'none') {
        assert.deepEqual(
          named,
          [],
          `${pair.label} is recorded as carrying no identity and ${url} names ${JSON.stringify(named)}`,
        );
      }
      if (pair.carriesIdentity === 'end-only') {
        assert.deepEqual(
          measured.startInstance,
          ['null'],
          `${pair.label} names a start instance`,
        );
      }
    }
  }
  assert.match(record.identity.finding, /carries none at all/);
});

test('the portal attempt is a negative with the artefact that target lacks', () => {
  const record = loadRecord();
  const portal = record.witness.portalAttempt;
  assert.equal(portal.result, 'negative');
  assert.match(portal.countedAs, /not a capture/);
  assert.match(portal.lacks, /zoneless/);
  assert.match(portal.routeTried, /^\//);
  assert.match(portal.pin, /^[0-9a-f]{40}$/);
  assert.equal(record.witness.negatives.length > 0, true);
  assert.match(
    record.witness.instrumentation,
    /single setProfiler subscription/,
    'the witness does not state that the page gained no second tap',
  );
});

test('this suite drives no browser and writes nothing', () => {
  const source = readFileSync(SELF_PATH, 'utf8');
  // Assembled so this check does not count its own needles.
  const forbidden = [
    ['play', 'wright'].join(''),
    ['chrom', 'ium'].join(''),
    ['page', '.', 'goto'].join(''),
    ['child', '_', 'process'].join(''),
  ];
  for (const needle of forbidden) {
    assert.equal(
      source.includes(needle),
      false,
      `this suite carries ${JSON.stringify(needle)}, and the live witness belongs to the recording's provenance`,
    );
  }
  assert.equal(
    source.includes(['writeFile', 'Sync', '('].join('')),
    false,
    'this suite writes a file, and a default run must leave the recording untouched',
  );
});

const SHA_AT_LOAD = existsSync(RECORD_PATH)
  ? createHash('sha256').update(readFileSync(RECORD_PATH)).digest('hex')
  : null;

test('this run wrote nothing: the recording is unchanged after the run', () => {
  assert.notEqual(SHA_AT_LOAD, null, 'the recording is missing');
  assert.equal(
    createHash('sha256').update(readFileSync(RECORD_PATH)).digest('hex'),
    SHA_AT_LOAD,
    'the recording changed during a default run',
  );
});

// ------------------------------------------------------------- held-out ----

test('held-out: a site that lost its instance argument reddens', () => {
  const mutant = clone(loadRecord());
  const component = mutant.identity.perPair.find(
    (pair) => pair.label === 'Component',
  );
  component.endSites[0].argCount = 0;
  component.endSites[0].expression = null;
  component.endSites[0].identity = 'none';
  assert.throws(
    () => validate(mutant),
    /per-pair identity answer|end-only|Component/,
  );
});

test('held-out: a recording that hides one emission site reddens', () => {
  const mutant = clone(loadRecord());
  mutant.identity.sites.pop();
  assert.throws(
    () => validate(mutant),
    /emission sites are not the sites this run reads/,
  );
});

test('held-out: an argument list rewritten in the record reddens', () => {
  const mutant = clone(loadRecord());
  const site = mutant.identity.sites.find(
    (entry) => entry.eventArg === 'ProfilerEvent.HostBindingsUpdateStart',
  );
  site.args[0].text = 'componentView[CONTEXT]';
  assert.throws(
    () => validate(mutant),
    /emission sites are not the sites this run reads/,
  );
});

test('held-out: a pair number that moved reddens', () => {
  const mutant = clone(loadRecord());
  mutant.pairs.sources[1].pairs[0].start.value = 4;
  assert.throws(() => validate(mutant), /pair numbers|moved/);
});

test('held-out: a claim that ChangeDetection carries an identity reddens', () => {
  const mutant = clone(loadRecord());
  const change = mutant.identity.perPair.find(
    (pair) => pair.label === 'ChangeDetection',
  );
  change.carriesIdentity = 'both';
  assert.throws(() => validate(mutant), /carriesIdentity/);
});

test('held-out: a witness that names a component for the unnamed pair reddens', () => {
  const mutant = clone(loadRecord());
  const page = mutant.witness.pages[0];
  const measured = page.pairs.find((pair) => pair.label === 'ChangeDetection');
  measured.endInstance = ['_Counter'];
  assert.throws(() => validate(mutant), /ChangeDetection|measured/);
});

test('held-out: a second profiler tap claimed by the record reddens', () => {
  const mutant = clone(loadRecord());
  mutant.frames.agentFrame.profilerTaps = 2;
  assert.throws(() => validate(mutant), /profilerTaps|one subscription/);
});

test('held-out: an opener moved off TemplateUpdateStart reddens', () => {
  const mutant = clone(loadRecord());
  mutant.frames.agentFrame.opensOn = 'OutputStart';
  assert.throws(() => validate(mutant), /opensOn/);
});

test('held-out: a dropped disagreement reddens', () => {
  const mutant = clone(loadRecord());
  mutant.frames.disagreements = [];
  assert.throws(() => validate(mutant), /disagreement/);
});

test('held-out: a frame order that hides a start reddens', () => {
  const mutant = clone(loadRecord());
  const page = mutant.witness.pages[0];
  for (const frame of page.frameOrders) {
    frame.order = frame.order.filter(
      (event) => event !== live.valuesFor('ChangeDetectionEnd'),
    );
  }
  assert.throws(() => validate(mutant), /inside a frame/);
});

test('held-out: a portal negative relabelled as a capture reddens', () => {
  const mutant = clone(loadRecord());
  mutant.witness.portalAttempt.result = 'captured';
  assert.throws(() => validate(mutant), /portalAttempt.result/);
});

test('held-out: a page that is not zoneless cannot have witnessed the profiler', () => {
  const mutant = clone(loadRecord());
  mutant.witness.pages[0].zoneGlobal = true;
  assert.throws(() => validate(mutant), /Zone|zoneful/);
});

test('held-out: a per-event row that does not add up reddens', () => {
  const mutant = clone(loadRecord());
  mutant.witness.pages[0].perEvent[0].count += 1;
  assert.throws(() => validate(mutant), /sum to|add up/);
});
