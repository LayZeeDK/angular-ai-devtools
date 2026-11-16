// @ts-check
//
// M040 T005 - the re-capture behind an opt-in switch (INTENT.md SC6; T005's AC1-AC3 and AC6).
//
// `research/raw/m040-work-events.json` is T001's one measurement. A measurement that can only be
// taken once goes stale the first time the installed `@angular/core`, the page agent or the landed
// join moves; a measurement that is re-taken on every `npm test` writes into a tracked file as a
// side effect of the suite. This repository has paid for the second failure twice (M029 T007 and
// M030 T006 each landed a capture that rewrote a tracked recording during a default run), so the
// switch is opt-in and every write is gated by `M040_CAPTURE=1`.
//
// Unarmed - the default, and what `npm test` runs:
//
//   node --experimental-strip-types --test scripts/performance-capture.test.mjs
//
// It drives nothing, writes nothing, names every file it would write, and asserts that the
// recording hashes the same at the end of the run as at its start. It is not a no-op: it re-derives
// every section a committed artefact can settle - the enum and the five pairs from both installed
// builds, the emission sites and the identity each end carries from the same two chunks, the
// agent's own literal, frame anchors and tap count from `extension/agent-main.js`, the frame's
// bracket and start-order readings from the recorded witness - and fails naming the path that
// moved. Everything the one browser run measured is carried and re-checked for internal
// consistency instead of being re-driven: a re-drive would move a timestamp, a console count and a
// browser build string on every run, which is exactly the drift AC1 forbids.
//
// Armed, on Windows cmd.exe (a bare `set M040_CAPTURE=1 &&` leaves the space inside the variable
// and arms nothing):
//
//   set "M040_CAPTURE=1"&& node --experimental-strip-types --test "scripts/performance-capture.test.mjs"
//
// Point the checks at another recording, for a proof run:
//
//   set "M040_RECORD=<path>"&& node --experimental-strip-types --test "scripts/performance-capture.test.mjs"
//
// Idempotence is proven, not assumed: the armed run writes only when a derived value moved (or when
// the file is not the canonical serialisation of its record), and a second armed run with nothing
// moved changes no byte. No derived value is pinned as a literal here - not a version, not a hash,
// not a timestamp, not a browser string - because a pinned copy of a derived value is the stale
// value this milestone's own prohibitions name.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import { test } from 'node:test';

import {
  currentIntentPath,
  intentPathForMilestone,
} from './verdict-claims-intent.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const SELF_PATH = fileURLToPath(import.meta.url);

const RECORD_PATH =
  process.env.M040_RECORD ??
  join(ROOT, 'research', 'raw', 'm040-work-events.json');
const CLAIMS_PATH = join(ROOT, 'research', 'raw', 'm040-verdict-claims.json');
const AGENT_PATH = join(ROOT, 'extension', 'agent-main.js');
const NARRATOR_PATH = join(ROOT, 'extension', 'performance-narrator.js');

const PANEL = {
  label: 'panel',
  manifest: join(ROOT, 'node_modules', '@angular', 'core', 'package.json'),
  chunk: join(
    ROOT,
    'node_modules',
    '@angular',
    'core',
    'fesm2022',
    '_debug_node-chunk.mjs',
  ),
};

const FIXTURE = {
  label: 'fixture',
  manifest: join(
    ROOT,
    'spikes',
    'ng222-app',
    'node_modules',
    '@angular',
    'core',
    'package.json',
  ),
  chunk: join(
    ROOT,
    'spikes',
    'ng222-app',
    'node_modules',
    '@angular',
    'core',
    'fesm2022',
    '_debug_node-chunk.mjs',
  ),
};

const PACKAGES = [PANEL, FIXTURE];

const SCRIPT = 'scripts/performance-capture.test.mjs';
const CHECK_COMMAND = `node --experimental-strip-types --test "${SCRIPT}"`;
const ARMED_CAPTURE_COMMAND = `set "M040_CAPTURE=1"&& node --experimental-strip-types --test "${SCRIPT}"`;

/**
 * The five work pairs the milestone widens onto the page agent, named rather than numbered: each
 * one's two event numbers are looked up in the enum the installed chunk declares, so a moved value
 * shows up as a moved pair rather than as a number this file quotes.
 */
const PAIR_LABELS = [
  'TemplateUpdate',
  'LifecycleHook',
  'ChangeDetection',
  'Component',
  'HostBindingsUpdate',
];

/** Every file this suite would write, named so a default run can prove that none of them moved. */
const WOULD_WRITE = [
  { path: RECORD_PATH, why: 'the recording T001 made, re-derived in place' },
];

/** The armed arm's proof copy, under the ignored `tmp/`: a stale copy is corrected, then left alone. */
const PROOF_COPY = join(ROOT, 'tmp', 'm040-capture-proof', 'recording.json');

/** Key names that would be a cost the recording never measured. */
const COST_KEYS = ['durationMs', 'duration', 'cost', 'elapsed'];

// ---------------------------------------------------------------- helpers ----

/**
 * @param {string} message
 * @returns {never}
 */
function fail(message) {
  throw new Error(message);
}

/** @param {unknown} value @returns {boolean} */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** @param {string} path @returns {string} */
function displayPath(path) {
  return relative(ROOT, path).split(sep).join('/');
}

/** The bytes the recording is written as, and re-read as, on every run. */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/** @template T @param {T} value @returns {T} */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** @param {Buffer | string} bytes @returns {string} */
function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** @param {string} path @param {string} why @returns {string} */
function readText(path, why) {
  if (!existsSync(path)) fail(`${displayPath(path)} is missing - ${why}`);
  return readFileSync(path, 'utf8');
}

/** @param {string} path @param {string} why @returns {any} */
function readJson(path, why) {
  const text = readText(path, why);
  try {
    return JSON.parse(text);
  } catch (error) {
    return fail(
      `${displayPath(path)} is not JSON (${error instanceof Error ? error.message : error})`,
    );
  }
}

/** @param {string} text @returns {string} */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

// -------------------------------------------------- the readers (evidence) ----

/**
 * Every `ProfilerEvent` value one installed chunk declares, by name and number. The enum is a
 * runtime IIFE in the shipped chunk, so this reads what the browser would execute; the same reader
 * is applied to both installs and nothing here quotes a list.
 *
 * @param {string} text
 * @param {string} where
 * @returns {Array<{ name: string, value: number }>}
 */
function readProfilerEvents(text, where) {
  const start = text.indexOf('var ProfilerEvent;');
  if (start === -1)
    fail(`${where} carries no \`var ProfilerEvent;\` declaration`);
  const end = text.indexOf('})(ProfilerEvent ||', start);
  if (end === -1) fail(`${where} closes no ProfilerEvent IIFE`);
  const pattern =
    /ProfilerEvent\[ProfilerEvent\["([A-Za-z]+)"\] = (\d+)\] = "([A-Za-z]+)";/g;
  /** @type {Array<{ name: string, value: number }>} */
  const values = [];
  /** @type {RegExpExecArray | null} */
  let match;
  while ((match = pattern.exec(text.slice(start, end))) !== null) {
    if (match[1] !== match[3]) {
      fail(
        `${where} declares ${match[1]} as ${match[3]}, so the reader cannot trust the block`,
      );
    }
    values.push({ name: match[1], value: Number(match[2]) });
  }
  if (values.length === 0) fail(`${where} declares no ProfilerEvent value`);
  return values;
}

/**
 * The five work pairs, each one's two numbers taken from the derived enum by name.
 *
 * @param {Array<{ name: string, value: number }>} values
 * @param {string} where
 * @returns {Array<{ label: string, start: { name: string, value: number }, end: { name: string, value: number } }>}
 */
function pairsFrom(values, where) {
  /** @type {Map<string, number>} */
  const byName = new Map(values.map((entry) => [entry.name, entry.value]));
  return PAIR_LABELS.map((label) => {
    const startName = `${label}Start`;
    const endName = `${label}End`;
    const start = byName.get(startName);
    const end = byName.get(endName);
    if (start === undefined || end === undefined) {
      fail(`${where} declares no ${startName}/${endName} pair`);
    }
    return {
      label,
      start: { name: startName, value: start },
      end: { name: endName, value: end },
    };
  });
}

/**
 * A call's argument list, split on its top-level commas.
 *
 * @param {string} text
 * @returns {string[]}
 */
function splitArgs(text) {
  /** @type {string[]} */
  const args = [];
  let depth = 0;
  let at = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index] ?? '';
    if ('([{'.includes(char)) depth += 1;
    else if (')]}'.includes(char)) depth -= 1;
    else if (char === ',' && depth === 0) {
      args.push(text.slice(at, index).trim());
      at = index + 1;
    }
  }
  const last = text.slice(at).trim();
  if (last !== '') args.push(last);
  return args;
}

/** `if`, `for` and their neighbours open a block, not a function scope. */
const KEYWORDS = new Set([
  'if',
  'for',
  'while',
  'switch',
  'catch',
  'else',
  'do',
  'try',
  'return',
  'finally',
  'with',
]);

/**
 * Whether one line opens a function scope: a declaration, a method shorthand that is not a
 * control-flow keyword, or an arrow assigned at the start of the line. A call that merely takes an
 * arrow argument (`return ngZone.run(() => {`) opens nothing, which is what keeps the enclosing
 * function of an emission the function that really holds it.
 *
 * @param {string} line
 * @returns {boolean}
 */
function opensAScope(line) {
  if (
    /^\s*(?:export\s+)?(?:async\s+)?function\s+[A-Za-z_$][\w$]*\s*\(/.test(line)
  ) {
    return true;
  }
  const method = /^\s*([A-Za-z_$][\w$]*)\s*\([^()]*\)\s*\{\s*$/.exec(line);
  if (method !== null && !KEYWORDS.has(method[1] ?? '')) return true;
  return /^\s*[A-Za-z_$][\w$.]*\s*=\s*(?:\([^()]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{\s*$/.test(
    line,
  );
}

/**
 * Every `profiler(...)` emission site in one installed chunk: the call as written, the event it
 * names (or the local constant it names it through), the arguments after the event, and the
 * function the call sits in. The enum number says an event exists; only the call site says what it
 * carries, and SC3 turns on whether a bracket names a component.
 *
 * @param {{ label: string, chunk: string }} pkg
 * @returns {Array<Record<string, any>>}
 */
function readSites(pkg) {
  const where = displayPath(pkg.chunk);
  const text = readText(pkg.chunk, 'run npm ci at the fixture');
  const lines = text.split(/\r?\n/);
  /** @type {Array<Record<string, any>>} */
  const sites = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    const at = line.indexOf('profiler(');
    if (at === -1) continue;
    if (line.includes('const profiler = function (')) continue;
    if (line.includes('function setProfiler(')) continue;

    const callText = line.slice(at);
    let depth = 0;
    let close = -1;
    for (let scan = callText.indexOf('('); scan < callText.length; scan += 1) {
      if (callText[scan] === '(') depth += 1;
      else if (callText[scan] === ')') {
        depth -= 1;
        if (depth === 0) {
          close = scan;
          break;
        }
      }
    }
    if (close === -1)
      fail(`${where}:${index + 1} opens a call it never closes`);

    const call = `${callText.slice(0, close + 1)};`.trim();
    const args = splitArgs(callText.slice(callText.indexOf('(') + 1, close));
    const eventArg = args[0] ?? '';
    /** @type {{ line: number, text: string } | null} */
    let resolvedFrom = null;
    /** @type {string[]} */
    let events = [];

    if (eventArg.startsWith('ProfilerEvent.')) {
      events = [eventArg.slice('ProfilerEvent.'.length)];
    } else {
      // A local constant: its own declaration, scanned upward and at most eight lines up.
      for (let scan = index; scan >= Math.max(0, index - 8); scan -= 1) {
        const declaration = new RegExp(
          `^\\s*const\\s+${eventArg.replace(/[$]/g, '\\$')}\\s*=\\s*(.+);\\s*$`,
        ).exec(lines[scan] ?? '');
        if (declaration === null) continue;
        resolvedFrom = {
          line: scan + 1,
          text: (lines[scan] ?? '').trim(),
        };
        events = [
          ...(declaration[1] ?? '').matchAll(/ProfilerEvent\.([A-Za-z]+)/g),
        ].map((match) => match[1] ?? '');
        break;
      }
      if (resolvedFrom === null) {
        fail(
          `${where}:${index + 1} names the event through ${eventArg}, which this reader cannot resolve`,
        );
      }
    }

    // The function the call sits in: the nearest upward line that opens a function scope.
    /** @type {{ line: number, text: string } | null} */
    let enclosing = null;
    for (let scan = index - 1; scan >= 0; scan -= 1) {
      const candidate = lines[scan] ?? '';
      if (!opensAScope(candidate)) continue;
      enclosing = { line: scan + 1, text: candidate.trim() };
      break;
    }
    if (enclosing === null) {
      fail(`${where}:${index + 1} sits in no function this reader can name`);
    }

    sites.push({
      source: pkg.label,
      chunk: where,
      line: index + 1,
      call,
      eventArg,
      events,
      resolvedFrom,
      args: args.slice(1).map((text) => ({
        text,
        identifier: /^[A-Za-z_$][\w$]*$/.test(text),
      })),
      enclosing,
    });
  }

  if (sites.length === 0) fail(`${where} carries no profiler( call`);
  return sites;
}

/**
 * The `ProfilerEvent` literal the page agent hard-codes. The agent cannot read the enum off the
 * page, so this literal is the only place the extension states which events it knows.
 *
 * @param {string} text
 * @returns {Array<{ name: string, value: number }>}
 */
function agentLiteral(text) {
  const start = text.indexOf('var ProfilerEvent = {');
  if (start === -1)
    fail('extension/agent-main.js carries no `var ProfilerEvent = {` literal');
  const end = text.indexOf('};', start);
  if (end === -1) fail('the agent`s ProfilerEvent literal never closes');
  const values = [
    ...text.slice(start, end).matchAll(/^\s*([A-Za-z]+):\s*(\d+),\s*$/gm),
  ].map((match) => ({ name: match[1] ?? '', value: Number(match[2]) }));
  if (values.length === 0)
    fail('the agent`s ProfilerEvent literal holds no value');
  return values;
}

/**
 * The agent's frame anchors: the branch that opens its cycle, the call that opens it, the queued
 * microtask that closes it, and how many profiler taps the agent holds. Read from the agent's own
 * source, so a widened record that moved an anchor is reported rather than absorbed.
 *
 * @param {string} text
 * @param {Array<{ name: string, value: number }>} literal
 * @returns {Record<string, any>}
 */
function agentFrame(text, literal) {
  const lines = text.split(/\r?\n/);
  /** @param {RegExp} pattern @param {string} what */
  const lineOf = (pattern, what) => {
    const found = lines.findIndex((line) => pattern.test(line));
    if (found === -1) fail(`extension/agent-main.js carries no ${what}`);
    return found + 1;
  };

  const openCall = lineOf(
    /\bif \(!cycle\) openCycle\(\)/,
    '`openCycle()` call',
  );
  const openFunction = lineOf(
    /^\s*function openCycle\(\)\s*\{/,
    '`openCycle` function',
  );
  // The event the frame opens on is the one whose branch calls `openCycle()`, found by scanning up
  // from that call - not the first `if (event === ...)` branch in the file, which belongs to
  // `OutputStart` and sets the trigger instead of opening the frame.
  let openBranch = openCall - 1;
  while (
    openBranch > 0 &&
    !/if \(event === ProfilerEvent\.[A-Za-z]+\)\s*\{/.test(
      lines[openBranch - 1] ?? '',
    )
  ) {
    openBranch -= 1;
  }
  if (openBranch <= 0)
    fail('no `if (event === ProfilerEvent.X)` branch opens the agent`s frame');
  const opensOn =
    /if \(event === ProfilerEvent\.([A-Za-z]+)\)\s*\{/.exec(
      lines[openBranch - 1] ?? '',
    )?.[1] ?? fail('the opening branch names no event');
  const opensOnValue = literal.find((entry) => entry.name === opensOn)?.value;
  if (opensOnValue === undefined) {
    fail(
      `the agent's literal does not carry the event ${opensOn} its frame opens on`,
    );
  }
  const closeQueue = lineOf(
    /\bqueueMicrotask\(closeCycle\)/,
    '`queueMicrotask(closeCycle)` call',
  );
  const closeFunction = lineOf(
    /^\s*function closeCycle\(\)\s*\{/,
    '`closeCycle` function',
  );
  const tapLines = lines
    .map((line, index) => ({ line, index }))
    .filter(
      (entry) =>
        /\bsetProfiler\s*\(/.test(entry.line) &&
        !/function setProfiler\s*\(/.test(entry.line) &&
        !/typeof\s+ng[\w.]*\.?(ɵ)?setProfiler/.test(entry.line) &&
        !/=\s*typeof\s/.test(entry.line),
    );
  if (tapLines.length === 0) fail('the agent taps no profiler');

  return {
    opensOn,
    opensOnValue,
    openBranch,
    openCall,
    openFunction,
    closeQueue,
    closeFunction,
    profilerTaps: tapLines.length,
    tapLine: (tapLines[0]?.index ?? 0) + 1,
  };
}

/**
 * The version one installed package declares for itself.
 *
 * @param {string} manifest
 * @returns {string}
 */
function installedVersion(manifest) {
  const pkg = readJson(manifest, 'run npm ci');
  if (typeof pkg.version !== 'string' || pkg.version === '') {
    fail(`${displayPath(manifest)} declares no version`);
  }
  return pkg.version;
}

/**
 * Everything this run reads from the artefacts this head carries. One object, built once, so the
 * derivation compares a recorded claim against the same live evidence rather than re-reading a file
 * per assertion - and so a mutant can hand the derivation a different evidence set and watch it
 * move.
 *
 * @returns {{
 *   packages: Array<{
 *     label: string, manifest: string, chunk: string, version: string,
 *     events: Array<{ name: string, value: number }>,
 *     sites: Array<Record<string, any>>,
 *   }>,
 *   agent: { values: Array<{ name: string, value: number }>, frame: Record<string, any> },
 * }}
 */
function readEvidence() {
  const agentText = readText(
    AGENT_PATH,
    'the page agent is part of this repository',
  );
  const values = agentLiteral(agentText);

  return {
    packages: PACKAGES.map((pkg) => ({
      label: pkg.label,
      manifest: displayPath(pkg.manifest),
      chunk: displayPath(pkg.chunk),
      version: installedVersion(pkg.manifest),
      events: readProfilerEvents(
        readText(pkg.chunk, 'run npm ci at the fixture'),
        displayPath(pkg.chunk),
      ),
      sites: readSites(pkg),
    })),
    agent: { values, frame: agentFrame(agentText, values) },
  };
}

// ------------------------------------------------------------ the derivation ----

/** How many, in words, so a derived sentence reads as a sentence. */
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five'];

/** @param {string[]} parts @returns {string} */
function conjunction(parts) {
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1] ?? ''}`;
}

/**
 * The two ends of one pair, as the call sites of both installs pass them. The reading a site yields
 * is `instance` when the argument list after the event is not empty and `none` when it is; a site
 * that names the event through a local constant records the declaration it read it from.
 *
 * @param {Array<Record<string, any>>} sites
 * @param {string} eventName
 * @returns {Array<Record<string, any>>}
 */
function endSites(sites, eventName) {
  return sites
    .filter((site) => site.events.includes(eventName))
    .map((site) => ({
      source: site.source,
      line: site.line,
      argCount: site.args.length,
      expression: site.args.length === 0 ? null : String(site.args[0].text),
      identity: site.args.length === 0 ? 'none' : 'instance',
    }));
}

/**
 * Whether one structure between a pair's start and its end says the two ends sit in one bracketed
 * call: a `try {` line strictly between them means the start ran before the try, so the end closes
 * from that try's `finally`; no such line means the start itself is inside the bracket.
 *
 * @param {{ chunk: string }} pkg
 * @param {number} startLine
 * @param {number} endLine
 * @returns {string}
 */
function bracketShape(pkg, startLine, endLine) {
  const lines = readText(pkg.chunk, 'run npm ci at the fixture').split(/\r?\n/);
  for (let line = startLine; line < endLine - 1; line += 1) {
    if (/^\s*try\s*\{\s*$/.test(lines[line] ?? ''))
      return 'start-then-try-finally';
  }
  return 'one-try-finally';
}

/**
 * The whole derivation: every value a committed artefact can settle, re-derived from the evidence
 * this head carries. The return is a subtree, merged onto the recording by `merge`; the prose that
 * describes what was measured and the one browser run's readings are not derived here - they are
 * carried, and `assertInternal` re-checks them for consistency instead.
 *
 * @param {any} record
 * @param {ReturnType<typeof readEvidence>} evidence
 * @returns {Record<string, any>}
 */
function derive(record, evidence) {
  const [panel, fixture] = evidence.packages;
  if (!panel || !fixture)
    fail('the evidence must carry both installed packages');

  // ---- pairs: the enum and the five pairs, from the two installed builds ----
  const sources = evidence.packages.map((installed) => {
    const recorded = record.pairs.sources.find(
      (source) => source.manifest === installed.manifest,
    );
    if (!recorded) {
      fail(
        `pairs.sources names no install at ${installed.manifest}, which this file read`,
      );
    }
    return {
      package: recorded.package,
      manifest: installed.manifest,
      version: installed.version,
      chunk: installed.chunk,
      count: installed.events.length,
      values: installed.events,
      pairs: pairsFrom(installed.events, installed.chunk),
    };
  });

  const identical =
    JSON.stringify(panel.events) === JSON.stringify(fixture.events);
  const derivedCount = panel.events.length;
  const pairNumbers = sources[0].pairs.map(
    (pair) => `${pair.start.value}/${pair.end.value}`,
  );
  const numbers = panel.events.map((entry) => entry.value);
  const contiguous =
    panel.events.every((entry, index) => entry.value === index) &&
    panel.events.length === Math.max(...numbers) + 1;
  const finding = identical
    ? `Both installed builds declare the same ${derivedCount} values, and the five pairs are ${conjunction(pairNumbers)} of that derived list.`
    : `The two installed builds disagree: ${sources
        .map(
          (source) =>
            `${source.label ?? source.package} declares ${source.count}`,
        )
        .join(', ')}, so no pair number can be read off one install alone.`;
  if (!contiguous) {
    fail(
      `the panel install declares ${derivedCount} values spanning ${Math.min(...numbers)}..${Math.max(...numbers)} with gaps, so the enum is not a contiguous list`,
    );
  }

  // ---- identity: the emission sites of both installs, and what each end carries ----
  const sites = evidence.packages.flatMap((installed) => installed.sites);
  /** @type {Map<string, any>} */
  const carriedWitness = new Map(
    record.identity.perPair.map((pair) => [pair.label, pair.witness]),
  );

  const perPair = sources[0].pairs.map((pair) => {
    const starts = endSites(sites, pair.start.name);
    const ends = endSites(sites, pair.end.name);
    const startNamed = starts.some((site) => site.identity === 'instance');
    const endNamed = ends.some((site) => site.identity === 'instance');
    const carriesIdentity =
      startNamed && endNamed
        ? 'both'
        : startNamed
          ? 'start-only'
          : endNamed
            ? 'end-only'
            : 'none';

    /** @type {Array<Record<string, any>>} */
    const sitePairs = [];
    // One start is paired with the next unclaimed end of its own pair in the same enclosing
    // function, in the order both were recorded: two starts sharing one function (a hook's two
    // call shapes) are two brackets, not one bracket read twice.
    /** @type {Set<string>} */
    const claimed = new Set();
    for (const start of starts) {
      const installed = evidence.packages.find(
        (entry) => entry.label === start.source,
      );
      if (installed === undefined)
        fail(`no install is labelled ${start.source}`);
      const startSite = sites.find(
        (site) => site.source === start.source && site.line === start.line,
      );
      const match = sites.find(
        (site) =>
          site.source === start.source &&
          site.events.includes(pair.end.name) &&
          !claimed.has(`${site.source}:${site.line}`) &&
          site.enclosing?.line === startSite?.enclosing?.line,
      );
      if (match === undefined) continue;
      claimed.add(`${match.source}:${match.line}`);
      sitePairs.push({
        source: start.source,
        startLine: start.line,
        endLine: match.line,
        sameEnclosingFunction: true,
        shape: bracketShape(installed, start.line, match.line),
      });
    }

    return {
      label: pair.label,
      start: pair.start.value,
      end: pair.end.value,
      startSites: starts,
      endSites: ends,
      carriesIdentity,
      sharesAnEnclosingFunction: sitePairs.length > 0,
      sitePairs,
      witness:
        carriedWitness.get(pair.label) ?? fail(`no witness for ${pair.label}`),
    };
  });

  const unnamed = perPair.filter((pair) => pair.carriesIdentity === 'none');
  const firstUnnamed = unnamed[0];
  if (firstUnnamed === undefined) {
    fail(
      'no pair of the five carries no identity, so the cannot-tell this milestone rests on has no subject',
    );
  }
  const unnamedPanel = firstUnnamed.startSites.filter(
    (site) => site.source === 'panel',
  );

  const grouped = (/** @type {string} */ kind) =>
    perPair
      .filter((pair) => pair.carriesIdentity === kind)
      .map((pair) => pair.label);
  const both = grouped('both');
  const endOnly = grouped('end-only');
  const none = grouped('none');
  const identityFinding = [
    both.length > 0
      ? `${WORDS[both.length]} pairs carry an identity on both ends (${both.join(', ')})`
      : '',
    endOnly.length > 0
      ? `${WORDS[endOnly.length]} carries it on its end only (${endOnly.join(', ')})`
      : '',
    none.length > 0
      ? `${WORDS[none.length]} carries none at all (${none.join(', ')})`
      : '',
  ].filter((part) => part !== '');

  const identityClause = identityFinding.join(', ');
  const identitySentence =
    identityClause === ''
      ? ''
      : `${identityClause[0]?.toUpperCase() ?? ''}${identityClause.slice(1).replace(/, ([^,]*)$/, ', and $1')}.`;

  // ---- frames: the agent's anchors, the brackets, and the recorded start order ----
  const brackets = perPair.map((pair) => ({
    label: pair.label,
    start: pair.start,
    end: pair.end,
    sharesAnEnclosingFunction: pair.sharesAnEnclosingFunction,
    sitePairs: pair.sitePairs,
    agentFrame:
      record.frames.brackets.find((bracket) => bracket.label === pair.label)
        ?.agentFrame ??
      fail(`frames.brackets carries no agentFrame reading for ${pair.label}`),
  }));

  /** The witness pages the recording carries, as the browser measured them. */
  const pages = record.witness.pages;
  if (!Array.isArray(pages) || pages.length === 0)
    fail('the witness carries no page read');

  /** @param {number} event @returns {Array<Record<string, any>>} */
  const perEventOf = (event) =>
    pages.flatMap((page) =>
      page.perEvent.filter((entry) => entry.event === event),
    );

  const startsWithNoFrame = perPair
    .map((pair) => {
      const entries = perEventOf(pair.start);
      return {
        label: pair.label,
        start: pair.start,
        observed: entries.reduce((sum, entry) => sum + Number(entry.count), 0),
        startsArrivedWithNoFrame: entries.reduce(
          (sum, entry) => sum + Number(entry.arrivedWithNoFrame),
          0,
        ),
      };
    })
    .filter((entry) => entry.startsArrivedWithNoFrame > 0)
    .sort((left, right) => left.start - right.start);

  const disagreements = perPair
    .map((pair) => {
      const bracket = brackets.find(
        (candidate) => candidate.label === pair.label,
      );
      if (bracket === undefined) fail(`no bracket for ${pair.label}`);
      const bracketedCallHoldsBothEnds =
        bracket.sitePairs.length > 0 &&
        bracket.sitePairs.every(
          (sitePair) => sitePair.sameEnclosingFunction === true,
        );
      const agentFrameHoldsBothEnds = Object.values(bracket.agentFrame).every(
        (reading) =>
          Number(reading.bracketsInOneFrame) === Number(reading.startCount) &&
          Number(reading.endCount) === Number(reading.startCount),
      );
      return {
        label: pair.label,
        start: pair.start,
        end: pair.end,
        bracketedCallHoldsBothEnds,
        agentFrameHoldsBothEnds,
      };
    })
    .filter(
      (pair) =>
        pair.bracketedCallHoldsBothEnds !== pair.agentFrameHoldsBothEnds,
    )
    .map((pair) => {
      const carried = record.frames.disagreements.find(
        (disagreement) => disagreement.label === pair.label,
      );
      if (carried === undefined) {
        fail(
          `frames.disagreements carries no prose for ${pair.label}, which the derivation finds disagreeing`,
        );
      }
      return {
        ...pair,
        detail: carried.detail,
        narratorObeys: carried.narratorObeys,
      };
    });

  return {
    pairs: { sources, identical, derivedCount, finding },
    identity: {
      sites,
      perPair,
      namedAbsence: {
        pair: `${firstUnnamed.label} ${firstUnnamed.start}/${firstUnnamed.end}`,
        carriesIdentity: 'none',
        startSites: unnamedPanel.length,
        endSites: firstUnnamed.endSites.filter(
          (site) => site.source === 'panel',
        ).length,
      },
      finding: identitySentence,
    },
    frames: {
      brackets,
      agentFrame: evidence.agent.frame,
      startsWithNoFrame,
      disagreements,
    },
  };
}

// --------------------------------------------------------------- the merge ----

/**
 * Deep-assign a derived subtree onto a record. Objects merge, everything else (arrays included)
 * replaces, so a derived list is the list.
 *
 * @param {any} target
 * @param {any} source
 * @returns {any}
 */
function merge(target, source) {
  const out = clone(target);
  for (const [key, value] of Object.entries(source)) {
    out[key] =
      isObject(value) && isObject(out[key])
        ? merge(out[key], value)
        : clone(value);
  }
  return out;
}

/**
 * Where two values disagree, as `path: recorded -> derived`. Empty means the recording is the
 * derivation. Arrays compare element by element, so a derived list that reorders its entries is
 * reported as the entry that moved rather than as the whole list.
 *
 * @param {any} recorded
 * @param {any} derived
 * @param {string} [at]
 * @returns {string[]}
 */
function divergence(recorded, derived, at = '') {
  if (Array.isArray(recorded) && Array.isArray(derived)) {
    if (recorded.length !== derived.length) {
      return [
        `${at}: ${recorded.length} entry(s) -> ${derived.length} entry(s)`,
      ];
    }
    /** @type {string[]} */
    const found = [];
    for (let index = 0; index < recorded.length; index += 1) {
      found.push(
        ...divergence(recorded[index], derived[index], `${at}[${index}]`),
      );
    }
    return found;
  }
  if (isObject(recorded) && isObject(derived)) {
    /** @type {string[]} */
    const found = [];
    for (const key of [
      ...new Set([...Object.keys(recorded), ...Object.keys(derived)]),
    ]) {
      const path = at === '' ? key : `${at}.${key}`;
      if (!Object.hasOwn(recorded, key)) {
        found.push(`${path}: missing -> ${JSON.stringify(derived[key])}`);
        continue;
      }
      if (!Object.hasOwn(derived, key)) {
        found.push(`${path}: ${JSON.stringify(recorded[key])} -> missing`);
        continue;
      }
      found.push(...divergence(recorded[key], derived[key], path));
    }
    return found;
  }
  if (JSON.stringify(recorded) === JSON.stringify(derived)) return [];
  return [`${at}: ${JSON.stringify(recorded)} -> ${JSON.stringify(derived)}`];
}

// -------------------------------------------------------------- validation ----

/**
 * @param {unknown} value
 * @param {string} where
 * @returns {void}
 */
function strings(value, where) {
  if (!isObject(value)) fail(`missing ${where}`);
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'string' && entry === '')
      fail(`missing ${where}.${key}`);
  }
}

/** @param {unknown} value @returns {boolean} */
function isIsoTimestamp(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)
  );
}

/**
 * Every key name anywhere in the record, so a cost nobody measured can be refused by name.
 *
 * @param {any} value
 * @param {string[]} [into]
 * @returns {string[]}
 */
function keyNames(value, into = []) {
  if (Array.isArray(value)) {
    for (const entry of value) keyNames(entry, into);
    return into;
  }
  if (!isObject(value)) return into;
  for (const [key, entry] of Object.entries(value)) {
    into.push(key);
    keyNames(entry, into);
  }
  return into;
}

/**
 * The record's own shape and provenance, which no reading of the evidence can settle: the schema,
 * the task that established it and the commands the measurement was taken with.
 *
 * @param {any} record
 * @returns {void}
 */
function assertShape(record) {
  if (!isObject(record)) fail('the recording is not an object');
  if (record.schema !== 'm040-work-events/v1') {
    fail(`the recording schema is ${JSON.stringify(record.schema)}`);
  }
  if (record.milestone !== 'performance-narrator') {
    fail(`the recording milestone is ${JSON.stringify(record.milestone)}`);
  }
  // The task that established the record: T001 measured it, and its own suite pins this field, so a
  // re-capture rewrites the file without rewriting who took the measurement.
  if (record.task !== 'T001')
    fail(`the recording task is ${JSON.stringify(record.task)}`);
  for (const key of ['title', 'question', 'verdict']) {
    if (typeof record[key] !== 'string' || record[key] === '') {
      fail(`missing the recording's ${key}`);
    }
  }
  if (record.verdict !== 'answered')
    fail(`the recording verdict is ${record.verdict}`);
  if (!isIsoTimestamp(record.capturedAt))
    fail(`the recording capturedAt is ${record.capturedAt}`);
  strings(record.commands, 'commands');
  strings(record.environment, 'environment');
  // `commands` belongs to the measurement T001 took - its own suite pins `commands.check` to that
  // suite - so the switch names its own command in the capture arm rather than rewriting the
  // provenance of the measurement.
  if (!String(record.commands.check).includes('performance-measure')) {
    fail(
      `commands.check is ${JSON.stringify(record.commands.check)}, which is not T001's suite`,
    );
  }
  if (
    !Array.isArray(record.doesNotSettle) ||
    record.doesNotSettle.length === 0
  ) {
    fail('the record does not say what it does not settle');
  }
  for (const entry of record.doesNotSettle) {
    if (typeof entry !== 'string' || entry === '')
      fail('a doesNotSettle entry is empty');
  }
}

/**
 * The claims a read of the page settles and no committed artefact can: that the witness adds up,
 * that the page it was taken on was the zoneless fixture, that a refusal is recorded as a refusal,
 * and that no cost is recorded anywhere - T001 measured no wall-clock duration, so a `durationMs`
 * or a `cost` in the record would be a measurement nobody took.
 *
 * @param {any} record
 * @returns {void}
 */
function assertInternal(record) {
  const witness = record.witness;
  if (!isObject(witness)) fail('the recording carries no witness block');
  if (witness.attempted !== true) fail('witness.attempted is not true');
  if (!isIsoTimestamp(witness.at)) fail(`witness.at is ${witness.at}`);
  if (typeof witness.evidence !== 'string' || witness.evidence === '') {
    fail(
      'witness.evidence is empty, so the browser run it came from cannot be named',
    );
  }
  strings(witness.build, 'witness.build');
  strings(witness.instance, 'witness.instance');
  if (witness.build.zoneless !== true) {
    fail(
      `witness.build.zoneless is ${JSON.stringify(witness.build.zoneless)}: a profiler frame cannot be recorded from a zoneful page`,
    );
  }
  if (!Array.isArray(witness.pages) || witness.pages.length === 0) {
    fail('witness.pages is empty');
  }

  for (const page of witness.pages) {
    const where = `witness.pages[${page.url}]`;
    if (page.zoneGlobal !== false) {
      fail(
        `${where}.zoneGlobal is ${JSON.stringify(page.zoneGlobal)}, not false`,
      );
    }
    if (page.angularVersion !== witness.build.angular) {
      fail(
        `${where}.angularVersion is ${JSON.stringify(page.angularVersion)} and the build it was served from is ${JSON.stringify(witness.build.angular)}`,
      );
    }
    let recorded = 0;
    for (const entry of page.perEvent) {
      recorded += Number(entry.count);
      const named = Object.values(entry.instanceKinds).reduce(
        (sum, count) => sum + Number(count),
        0,
      );
      if (named !== Number(entry.count)) {
        fail(
          `${where}: the ${entry.name} instance kinds add up to ${named} and its count is ${entry.count}`,
        );
      }
      const arrived =
        Number(entry.arrivedInOpenFrame) + Number(entry.arrivedWithNoFrame);
      if (arrived !== Number(entry.count)) {
        fail(
          `${where}: the ${entry.name} frame readings add up to ${arrived} and its count is ${entry.count}`,
        );
      }
    }
    if (recorded !== Number(page.eventsRecorded)) {
      fail(
        `${where}: the per-event counts add up to ${recorded} and eventsRecorded is ${page.eventsRecorded}`,
      );
    }
    if (Number(page.framesOpened) <= 0)
      fail(`${where}.framesOpened is ${page.framesOpened}`);
  }

  if (witness.build.url !== witness.pages[0].url) {
    fail(
      `witness.build.url is ${witness.build.url} and the first page read is ${witness.pages[0].url}`,
    );
  }

  const portal = witness.portalAttempt;
  if (!isObject(portal)) fail('the recording carries no portal attempt');
  if (!/^\/\S*/.test(String(portal.routeTried))) {
    fail(
      `witness.portalAttempt.routeTried is ${JSON.stringify(portal.routeTried)}`,
    );
  }
  if (portal.result !== 'negative') {
    fail(
      `witness.portalAttempt.result is ${JSON.stringify(portal.result)}; the pinned target refused the agent, so the attempt is a negative`,
    );
  }
  if (!/not a capture/.test(String(portal.countedAs))) {
    fail(
      'witness.portalAttempt.countedAs does not say it is a negative rather than a capture',
    );
  }
  if (typeof portal.lacks !== 'string' || portal.lacks.trim().length < 60) {
    fail(
      'witness.portalAttempt.lacks does not name, in a sentence, the artefact the target lacks',
    );
  }
  if (!/zoneless/i.test(String(portal.lacks))) {
    fail(
      'witness.portalAttempt.lacks does not name the zoneless profiler stream it lacks',
    );
  }

  // The second portal measurement: the portal's own zoneless checkout. It is carried rather than
  // re-derived - no test drives a portal - but what it says is checked against the first attempt,
  // so the two cannot drift into a single comfortable story: the pinned zoneful target is still a
  // refusal, and the zoneless checkout is where a verdict becomes possible.
  const zoneless = witness.portalZonelessAttempt;
  if (!isObject(zoneless)) {
    fail(
      'the recording carries no measurement of the portal`s zoneless checkout',
    );
  }
  strings(zoneless, 'target', 'portalZonelessAttempt');
  strings(zoneless, 'pin', 'portalZonelessAttempt');
  strings(zoneless, 'angular', 'portalZonelessAttempt');
  strings(zoneless, 'routeTried', 'portalZonelessAttempt');
  strings(zoneless, 'reading', 'portalZonelessAttempt');
  strings(zoneless, 'countedAs', 'portalZonelessAttempt');
  if (!/^\/\S*/.test(String(zoneless.routeTried))) {
    fail(
      `witness.portalZonelessAttempt.routeTried is ${JSON.stringify(zoneless.routeTried)}`,
    );
  }
  if (zoneless.result !== 'supported') {
    fail(
      `witness.portalZonelessAttempt.result is ${JSON.stringify(zoneless.result)}; the zoneless checkout yielded the stream`,
    );
  }
  if (portal.result !== 'negative') {
    fail(
      'witness.portalZonelessAttempt is recorded without the pinned zoneful target staying a refusal',
    );
  }
  if (!isObject(zoneless.gates))
    fail('witness.portalZonelessAttempt carries no gate reading');
  if (zoneless.gates.zoneGlobal !== false) {
    fail(
      'witness.portalZonelessAttempt read a zoneful page, so its stream is not a zoneless one',
    );
  }
  if (
    zoneless.gates.setProfiler !== true ||
    zoneless.gates.getSignalGraph !== true
  ) {
    fail(
      'witness.portalZonelessAttempt does not read both of the profiler taps the agent needs',
    );
  }
  if (!/zoneless/i.test(String(zoneless.reading))) {
    fail(
      'witness.portalZonelessAttempt.reading does not say what re-pinning would make possible',
    );
  }
  if (
    !Array.isArray(zoneless.pairs) ||
    zoneless.pairs.length !== PAIR_LABELS.length
  ) {
    fail('witness.portalZonelessAttempt does not carry all five pairs');
  }
  for (const pair of zoneless.pairs) {
    if (Number(pair.startCount) !== Number(pair.endCount)) {
      fail(
        `witness.portalZonelessAttempt records ${pair.startCount} ${pair.label} start(s) and ${pair.endCount} end(s)`,
      );
    }
    const ruled = record.identity.perPair.find(
      (entry) => entry.label === pair.label,
    );
    if (ruled === undefined) fail(`no identity ruling for ${pair.label}`);
    const namedAtStart = pair.startInstance.some((name) => name !== null);
    const namedAtEnd = pair.endInstance.some((name) => name !== null);
    const stated = ruled.carriesIdentity;
    if (namedAtStart !== (stated === 'both' || stated === 'start-only')) {
      fail(
        `witness.portalZonelessAttempt measured ${JSON.stringify(pair.startInstance)} on ${pair.label}'s start and the record rules it ${stated}`,
      );
    }
    if (namedAtEnd !== (stated === 'both' || stated === 'end-only')) {
      fail(
        `witness.portalZonelessAttempt measured ${JSON.stringify(pair.endInstance)} on ${pair.label}'s end and the record rules it ${stated}`,
      );
    }
  }

  const costs = keyNames(record).filter((key) => COST_KEYS.includes(key));
  if (costs.length > 0) {
    fail(
      `the record carries the key(s) ${costs.join(', ')}: T001 measured no wall-clock cost, so a duration here would be a cost nobody measured`,
    );
  }
}

/**
 * The whole check: the record's shape, its carried readings, and every value the derivation can
 * settle. A disagreement fails naming the path, so a moved reading is reported rather than absorbed.
 *
 * @param {any} record
 * @param {ReturnType<typeof readEvidence>} [given]
 * @returns {any}
 */
function validate(record, given = EVIDENCE) {
  assertShape(record);
  const derived = derive(record, given);
  const moved = divergence(record, merge(record, derived));
  if (moved.length > 0) {
    fail(
      `the recording disagrees with this run's derivation at ${moved.length} value(s): ${moved.slice(0, 4).join('; ')}`,
    );
  }
  assertInternal(record);
  return record;
}

// ------------------------------------------------------------- the capture ----

/**
 * The armed capture. Re-derive, compare, and write only what moved. The write leaves the record in
 * its canonical serialisation, so a second armed run with nothing moved changes no byte - which is
 * also why the record carries no write time: nothing here was measured by the re-capture.
 *
 * @param {string} path
 * @returns {{
 *   path: string, before: string, after: string, wrote: boolean, moved: string[],
 * }}
 */
function capture(path) {
  const text = readText(path, 'the recording has not been made');
  const before = sha256(text);
  const record = JSON.parse(text);
  const candidate = merge(record, derive(record, EVIDENCE));
  const moved = divergence(record, candidate);
  if (text !== canonical(record)) {
    moved.push('the file is not the canonical serialisation of its record');
  }
  if (moved.length === 0) {
    return { path, before, after: before, wrote: false, moved };
  }
  // Never write a record that would fail its own check.
  validate(candidate);
  writeFileSync(path, canonical(candidate));
  return {
    path,
    before,
    after: sha256(readFileSync(path)),
    wrote: true,
    moved,
  };
}

// -------------------------------------------------------- the read-only pins ----

/** @type {Map<string, string | null>} */
const SHA_AT_LOAD = new Map(
  WOULD_WRITE.map((file) => [
    file.path,
    existsSync(file.path) ? sha256(readFileSync(file.path)) : null,
  ]),
);

const EVIDENCE = readEvidence();

/**
 * One file's bytes, unchanged since the run started. A named function so the pin can be proven to
 * bite: handing it another `before` is a file whose bytes moved, and that must fail.
 *
 * @param {string} path
 * @param {string | null} before
 * @returns {void}
 */
function assertUnchanged(path, before) {
  const shown = displayPath(path);
  if (before === null) fail(`${shown} was not there when this run started`);
  const now = existsSync(path) ? sha256(readFileSync(path)) : null;
  if (now !== before) {
    fail(`${shown} changed during this run, so the suite is not read-only`);
  }
}

// ---------------------------------------------------------- the armed capture ----
//
// First, so an armed run captures before the read-only pins read the file back: the same pins then
// prove the freshly written recording still validates.

if (process.env.M040_CAPTURE === '1') {
  test('armed: re-derive, write only what moved, and a second run changes no byte', (t) => {
    const first = capture(RECORD_PATH);
    t.diagnostic(
      first.wrote
        ? `armed run wrote ${displayPath(first.path)}; moved: ${first.moved.slice(0, 6).join('; ')}`
        : 'armed run: nothing moved, nothing written',
    );
    assert.equal(first.after, sha256(readFileSync(first.path)));

    const second = capture(RECORD_PATH);
    assert.equal(
      second.before,
      second.after,
      'a second armed run changed the recording, so the re-capture is not idempotent',
    );
    assert.equal(
      second.wrote,
      false,
      'the second armed run wrote, and nothing had moved',
    );
    t.diagnostic(
      `armed idempotence: ${readFileSync(RECORD_PATH).length} bytes, sha256 ${second.after} before and after the second run`,
    );
    assert.doesNotThrow(() =>
      validate(JSON.parse(readText(RECORD_PATH, 'no recording'))),
    );
  });

  test('armed: the write path is live - a stale copy is corrected, then left alone', (t) => {
    mkdirSync(dirname(PROOF_COPY), { recursive: true });
    const stale = clone(JSON.parse(readText(RECORD_PATH, 'no recording')));
    stale.pairs.sources[1].values.pop();
    stale.identity.perPair[0].carriesIdentity = 'none';
    writeFileSync(PROOF_COPY, canonical(stale));

    const first = capture(PROOF_COPY);
    assert.equal(first.wrote, true, 'the stale copy was not corrected');
    assert.ok(
      first.moved.join(' ').includes('pairs.sources'),
      `the correction did not name the stale pair; it named ${first.moved.join('; ')}`,
    );
    const repaired = JSON.parse(readText(PROOF_COPY, 'the proof copy'));
    assert.deepEqual(
      repaired.pairs.sources[1].values,
      JSON.parse(readText(RECORD_PATH, 'no recording')).pairs.sources[1].values,
      'the corrected copy does not agree with the recording',
    );

    const second = capture(PROOF_COPY);
    assert.equal(
      second.wrote,
      false,
      'a second armed run rewrote a corrected copy',
    );
    assert.equal(
      second.after,
      first.after,
      'the corrected copy changed on a second armed run',
    );
    t.diagnostic(
      `proof copy: corrected ${first.moved.length} value(s), then byte-identical at ${second.after}`,
    );
  });
}

// ------------------------------------------------------------- the freshness ----

test('the recording still re-derives from the artefacts this head carries', (t) => {
  const record = validate(JSON.parse(readText(RECORD_PATH, 'no recording')));
  const bytes = readFileSync(RECORD_PATH);
  t.diagnostic(
    `recording ${displayPath(RECORD_PATH)}: ${bytes.length} bytes, sha256 ${sha256(bytes)}`,
  );
  assert.equal(
    readFileSync(RECORD_PATH, 'utf8'),
    canonical(record),
    'the recording is not the canonical serialisation of its record, so a re-capture would not reproduce these bytes',
  );
});

test('every file this suite would write is named, and the recording is the only one', () => {
  assert.equal(WOULD_WRITE.length, 1, 'the file list must name what it writes');
  assert.equal(WOULD_WRITE[0]?.path, RECORD_PATH);
  for (const file of WOULD_WRITE) {
    const shown = displayPath(file.path);
    assert.ok(
      shown.startsWith('research/raw/') || shown.startsWith('tmp/'),
      `${shown} is outside the two places this suite may write`,
    );
  }
  const source = readText(SELF_PATH, 'this file');
  // Assembled so this check does not find its own needles.
  const gate = source.indexOf(
    ['if (process.env.M040', "_CAPTURE === '1') {"].join(''),
  );
  assert.notEqual(gate, -1, 'the arming gate is not in this file');
  // Every call that hands the capture a path to write must sit behind the gate.
  let calls = 0;
  for (const argument of ['RECORD_PATH', 'PROOF_COPY']) {
    const call = ['capture(', argument].join('');
    let at = source.indexOf(call);
    while (at !== -1) {
      calls += 1;
      assert.ok(
        at > gate,
        `${call} is called outside the M040_CAPTURE gate, so a default run would not be read-only`,
      );
      at = source.indexOf(call, at + call.length);
    }
  }
  assert.ok(calls >= 2, 'the gate must actually call the capture');
  // Assembled so this check does not count its own needle as a write.
  const write = ['writeFile', 'Sync', '('].join('');
  assert.equal(
    source.split(write).length - 1,
    2,
    'the capture writes its record, and the armed proof copies one',
  );
});

test('the profiler enumeration and the five pairs come from the installed builds', () => {
  const record = JSON.parse(readText(RECORD_PATH, 'no recording'));
  for (const source of record.pairs.sources) {
    const installed = EVIDENCE.packages.find(
      (entry) => entry.manifest === source.manifest,
    );
    assert.ok(
      installed,
      `${source.manifest} is not an install this file reads`,
    );
    assert.deepEqual(
      source.values,
      installed.events,
      `${source.manifest} declares a different ProfilerEvent list than the recording`,
    );
    assert.deepEqual(
      source.pairs,
      pairsFrom(installed.events, installed.chunk),
      `${source.manifest} declares different pair numbers than the recording`,
    );
    assert.equal(source.version, installed.version, `${source.manifest} moved`);
  }
  const [panel, fixture] = EVIDENCE.packages;
  assert.deepEqual(
    fixture?.events,
    panel?.events,
    'the two installs no longer declare the same list',
  );
  // The five pairs are the two ends of one unit of work: each start's number is its end's number
  // minus one, and every pair's numbers are their own entries of the derived enum.
  for (const pair of record.pairs.sources[0].pairs) {
    assert.equal(
      pair.end.value - pair.start.value,
      1,
      `${pair.label}'s two ends are not adjacent values of the enum`,
    );
    assert.ok(
      panel?.events.some(
        (entry) =>
          entry.name === pair.start.name && entry.value === pair.start.value,
      ),
      `${pair.start.name} is not ${pair.start.value} in the installed enum`,
    );
  }
});

test('each emission site passes the identity the recording says it does', () => {
  const record = JSON.parse(readText(RECORD_PATH, 'no recording'));
  assert.equal(
    record.identity.sites.length,
    EVIDENCE.packages.reduce((sum, pkg) => sum + pkg.sites.length, 0),
    'the recording does not carry every profiler( call site this file found',
  );
  for (const pair of record.identity.perPair) {
    const starts = endSites(
      EVIDENCE.packages.flatMap((pkg) => pkg.sites),
      `${pair.label}Start`,
    );
    assert.deepEqual(
      pair.startSites,
      starts,
      `${pair.label}'s start sites moved in the installed chunk`,
    );
    assert.equal(
      pair.carriesIdentity,
      starts.some((site) => site.identity === 'instance')
        ? pair.endSites.some((site) => site.identity === 'instance')
          ? 'both'
          : 'start-only'
        : pair.endSites.some((site) => site.identity === 'instance')
          ? 'end-only'
          : 'none',
      `${pair.label}'s identity ruling does not follow from its sites`,
    );
  }
  const absent = record.identity.perPair.filter(
    (pair) => pair.carriesIdentity === 'none',
  );
  assert.equal(
    absent.length,
    1,
    'exactly one pair is recorded as naming nothing',
  );
  assert.equal(
    record.identity.namedAbsence.pair,
    `${absent[0]?.label} ${absent[0]?.start}/${absent[0]?.end}`,
    'the named absence names another pair than the one that carries no identity',
  );
});

test('the agent`s frame anchors are the agent`s own source', () => {
  const record = JSON.parse(readText(RECORD_PATH, 'no recording'));
  const derived = EVIDENCE.agent.frame;
  for (const [key, value] of Object.entries(derived)) {
    assert.equal(
      record.frames.agentFrame[key],
      value,
      `frames.agentFrame.${key} is not what extension/agent-main.js says`,
    );
  }
  assert.equal(
    record.frames.agentFrame.opensOnValue,
    EVIDENCE.agent.values.find((entry) => entry.name === derived.opensOn)
      ?.value,
    'the frame opens on an event the agent`s literal does not carry',
  );
  assert.equal(
    record.frames.agentFrame.profilerTaps,
    1,
    'the agent holds one profiler tap',
  );
});

test('the one browser run`s readings add up, and no cost is recorded', () => {
  const record = JSON.parse(readText(RECORD_PATH, 'no recording'));
  assert.doesNotThrow(() => assertInternal(record));
  assert.equal(record.witness.build.zoneless, true);
  assert.deepEqual(
    record.witness.pages.map((page) => page.zoneGlobal),
    record.witness.pages.map(() => false),
    'a witness page was zoneful, so no profiler frame could have been recorded on it',
  );
  assert.match(record.witness.portalAttempt.countedAs, /not a capture/);
});

// --------------------------------------------------------------- the narrator ----
//
// The landed join is run over the frame the recording carries: the per-event counts and the
// identity each end passed, as the one browser run measured them. Nothing here re-drives a page,
// and no timestamp is invented: an entry's receipt time is its recorded arrival position, so the
// assertions are about the order, the names and the matching rule rather than about a duration the
// recording never measured.

/**
 * The narrator module, loaded into a bare context so the join is the shipped one.
 *
 * @returns {any}
 */
function loadNarrator() {
  const context = createContext({});
  runInContext(
    readText(NARRATOR_PATH, 'the join is part of this repository'),
    context,
  );
  const api = /** @type {any} */ (context).angularAiPerformanceNarrator;
  if (typeof api?.narrate !== 'function')
    fail('the narrator publishes no narrate function');
  return api;
}

/**
 * The component names one recorded instance reading carries, the object ones only: `object:_App`
 * names `_App`, a `null` reading names nothing, and a reading with several names yields them all.
 *
 * @param {Record<string, number>} kinds
 * @returns {string[]}
 */
function namesIn(kinds) {
  return Object.keys(kinds)
    .filter((kind) => kind.startsWith('object:'))
    .map((kind) => kind.slice('object:'.length))
    .sort();
}

/**
 * A frame the join can narrate, built from the recorded per-event counts and identity readings: for
 * each of the five work pairs, its starts then its ends, each entry carrying the receipt time its
 * recorded position gives it and a name the same reading carries. The four events the agent already
 * recorded are not work pairs, so they are not in this frame.
 *
 * @param {any} page
 * @param {string[]} pairNames the start and end event names of the five work pairs
 * @param {number} [factor] the receipt times are this many times their arrival position
 * @returns {{ events: Array<Record<string, any>> }}
 */
function frameFromPage(page, pairNames, factor = 1) {
  /** @type {Array<Record<string, any>>} */
  const events = [];
  let at = 0;
  const ordered = [...page.perEvent]
    .filter((entry) => pairNames.includes(String(entry.name)))
    .sort((left, right) => left.event - right.event);
  for (const entry of ordered) {
    const names = namesIn(entry.instanceKinds);
    for (let count = 0; count < Number(entry.count); count += 1) {
      at += 1;
      events.push({
        pair: String(entry.name).replace(/Start$|End$/, ''),
        type: entry.event,
        end: /End$/.test(String(entry.name)),
        at: at * factor,
        componentName: names.length === 0 ? null : names[count % names.length],
      });
    }
  }
  return { events };
}

/**
 * The start and end event names of the five work pairs, from the record's own derived pairs.
 *
 * @param {any} record
 * @returns {string[]}
 */
function workPairNames(record) {
  return record.identity.perPair.flatMap((pair) => [
    `${pair.label}Start`,
    `${pair.label}End`,
  ]);
}

test('the narrator names the frame`s work in recorded order with a cost that is only the difference', () => {
  const record = JSON.parse(readText(RECORD_PATH, 'no recording'));
  const api = loadNarrator();
  const page = record.witness.pages[0];
  const pairNames = workPairNames(record);
  const answer = api.narrate(frameFromPage(page, pairNames));

  const starts = record.identity.perPair.filter((pair) =>
    page.perEvent.some(
      (entry) => entry.event === pair.start && Number(entry.count) > 0,
    ),
  );
  assert.ok(
    starts.length > 0,
    'the frame the recording carries produced no start event',
  );

  // The join runs in a bare `vm` context, so its arrays are copied into this realm before they are
  // compared with this file's own.
  const pairs = Array.from(answer.intervals, (interval) => interval.pair);
  const expected = starts.flatMap((pair) => {
    const entry = page.perEvent.find(
      (candidate) => candidate.event === pair.start,
    );
    return Array.from({ length: Number(entry.count) }, () => pair.label);
  });
  assert.deepEqual(
    pairs,
    expected,
    'the intervals are not in the order the profiler recorded the start events',
  );

  const carried = new Set(
    page.perEvent.flatMap((entry) => namesIn(entry.instanceKinds)),
  );
  let measured = 0;
  let unnamed = 0;
  for (const interval of answer.intervals) {
    if (interval.state === api.MEASURED) {
      measured += 1;
      assert.ok(
        carried.has(interval.componentName),
        `the narrator named ${JSON.stringify(interval.componentName)}, which the recording does not carry`,
      );
      assert.equal(
        interval.durationMs,
        interval.endedAt - interval.startedAt,
        'a reported cost is not the difference between the two recorded times',
      );
      continue;
    }
    unnamed += 1;
    assert.equal(
      interval.state,
      api.CANNOT_TELL,
      `an interval is ${interval.state}`,
    );
    assert.equal(
      interval.absence,
      api.NO_COMPONENT_IDENTITY,
      'a cannot-tell interval does not name the absence it stands for',
    );
    assert.equal(
      Object.hasOwn(interval, 'durationMs'),
      false,
      'an unnamed interval carries a cost the page never measured',
    );
    assert.equal(
      Object.hasOwn(interval, 'componentName'),
      false,
      'an unnamed interval carries a name the profiler never passed',
    );
  }
  assert.ok(
    measured > 0,
    'no interval was measured, so the frame carries no cost at all',
  );
  const expectedUnnamed = record.identity.perPair
    .filter((pair) => pair.carriesIdentity === 'none')
    .reduce(
      (sum, pair) =>
        sum +
        Number(
          page.perEvent.find((entry) => entry.event === pair.start)?.count ?? 0,
        ),
      0,
    );
  assert.equal(
    unnamed,
    expectedUnnamed,
    'the unnamed intervals are not the ones the recording says carry no identity',
  );
  assert.equal(
    answer.state,
    api.CANNOT_TELL,
    'a frame holding an unnamed interval is reported as fully measured',
  );
  assert.equal(answer.absence, api.NO_COMPONENT_IDENTITY);

  const doubled = api.narrate(frameFromPage(page, pairNames, 2));
  assert.deepEqual(
    Array.from(doubled.intervals, (interval) => interval.pair),
    pairs,
    'doubling the recorded times moved an interval, so a cost is not read from the times alone',
  );
  for (const [index, interval] of answer.intervals.entries()) {
    if (interval.state !== api.MEASURED) continue;
    assert.equal(
      doubled.intervals[index].durationMs,
      interval.durationMs * 2,
      'a reported cost is not exactly the difference between the two recorded times',
    );
  }
});

test('an unclosed start is unmeasured and a stray end is unresolved, never paired', () => {
  const api = loadNarrator();
  const answer = api.narrate({
    events: [
      { pair: 'Component', type: 18, end: false, at: 1, componentName: '_App' },
      { pair: 'Component', type: 19, end: true, at: 4, componentName: null },
      {
        pair: 'Component',
        type: 18,
        end: false,
        at: 5,
        componentName: '_Counter',
      },
    ],
  });
  assert.deepEqual(
    Array.from(answer.intervals, (interval) => interval.state),
    [api.MEASURED, api.UNMEASURED],
    'the unclosed start is not reported unmeasured in its recorded position',
  );
  assert.equal(
    answer.intervals[0].durationMs,
    answer.intervals[0].endedAt - answer.intervals[0].startedAt,
  );
  const unmeasured = answer.intervals[1];
  assert.equal(
    Object.hasOwn(unmeasured, 'durationMs'),
    false,
    'an unclosed start was given a duration the frame does not hold',
  );
  assert.equal(
    Object.hasOwn(unmeasured, 'endedAt'),
    false,
    'an unclosed start was given an end from another event',
  );

  const stray = api.narrate({
    events: [
      { pair: 'Component', type: 19, end: true, at: 1, componentName: '_App' },
    ],
  });
  assert.deepEqual(
    Array.from(stray.intervals),
    [],
    'an end with no start of its own pair was walked back onto nothing',
  );
  assert.equal(
    Array.from(stray.unresolved).length,
    1,
    'the stray end was not reported as unresolved',
  );
  assert.equal(stray.unresolved[0].pair, 'Component');
  assert.equal(stray.unresolved[0].type, 19);
});

// ------------------------------------------------------------- the claims list ----

/**
 * The numbered success criteria of the intent, read as `SC1`, `SC2`, ... with the same routine the
 * repository's claim-list check uses, so a quote is compared against the text that check compares
 * against and not against a copy of it.
 *
 * @param {string} text
 * @returns {Record<string, string>}
 */
function intentCriteria(text) {
  const heading = '## Success criteria';
  const at = text.indexOf(heading);
  if (at < 0) fail('INTENT.md must carry a "## Success criteria" section');
  const rest = stripBom(text).slice(at + heading.length);
  const end = rest.indexOf('\n## ');
  const section = end >= 0 ? rest.slice(0, end) : rest;
  /** @type {Record<string, string>} */
  const criteria = {};
  /** @type {string[] | null} */
  let current = null;
  let currentId = '';
  const flush = () => {
    if (current)
      criteria[currentId] = current.join(' ').replace(/\s+/g, ' ').trim();
    current = null;
    currentId = '';
  };
  for (const line of section.split(/\r?\n/)) {
    const match = line.match(/^(\d+)\.\s+(.+?)\s*$/);
    if (match) {
      flush();
      currentId = `SC${match[1]}`;
      current = [match[2] ?? ''];
      continue;
    }
    if (current && line.trim() !== '' && /^\s/.test(line)) {
      current.push(line.trim());
      continue;
    }
    flush();
  }
  flush();
  if (Object.keys(criteria).length === 0) {
    fail('INTENT.md must list its success criteria as a numbered list');
  }
  return criteria;
}

/**
 * Every claim rows quotes the criterion it names character for character, and rules it. A
 * one-character change is the smallest drift this rule can catch, so the pin is proven against
 * exactly that.
 *
 * @param {any} recording
 * @param {Record<string, string>} criteria
 * @returns {void}
 */
function assertQuotesIntent(recording, criteria) {
  if (!Array.isArray(recording.claims) || recording.claims.length === 0) {
    fail('the claim list carries no claims');
  }
  for (const row of recording.claims) {
    const where = row?.criterion ?? 'a row';
    if (!Object.hasOwn(criteria, where))
      fail(`${where} is not a criterion the intent declares`);
    if (row.criterionText !== criteria[where]) {
      fail(`${where} must quote the INTENT criterion character for character`);
    }
    if (row.criterionCharacters !== String(criteria[where]).length) {
      fail(
        `${where} records ${row.criterionCharacters} characters and the intent's text is ${String(criteria[where]).length}`,
      );
    }
    if (!['required', 'not-required'].includes(row.ruling)) {
      fail(`${where} must rule required or not-required`);
    }
    if (typeof row.reason !== 'string' || row.reason.trim().length < 60) {
      fail(`${where} must state a reason rather than leave the cell empty`);
    }
    if (!/portal/i.test(row.reason)) {
      fail(`${where} must answer the charter's portal clause by name`);
    }
  }
  const declared = Object.keys(criteria).sort();
  const ruled = recording.claims
    .map((/** @type {any} */ row) => row.criterion)
    .sort();
  if (declared.join() !== ruled.join()) {
    fail(
      `the claim list rules ${ruled.join(', ')} and the intent declares ${declared.join(', ')}`,
    );
  }
}

test('the claim list quotes the milestone`s own intent character for character', () => {
  const recording = readJson(
    CLAIMS_PATH,
    'the milestone owes the gate its claim list',
  );
  const criteria = intentCriteria(
    readText(
      intentPathForMilestone(ROOT, 'M040'),
      'the milestone`s own intent',
    ),
  );
  assert.doesNotThrow(() => assertQuotesIntent(recording, criteria));

  // A one-character drift is the smallest change the rule must catch.
  const drifted = clone(recording);
  const text = String(drifted.claims[0].criterionText);
  const at = Math.floor(text.length / 2);
  const replacement = text[at] === 'e' ? 'a' : 'e';
  drifted.claims[0].criterionText = `${text.slice(0, at)}${replacement}${text.slice(at + 1)}`;
  assert.throws(
    () => assertQuotesIntent(drifted, criteria),
    new RegExp(`${drifted.claims[0].criterion} must quote`),
    'a one-character mismatch must redden the quote',
  );

  // A row that names a criterion the intent does not declare must redden it too.
  const invented = clone(recording);
  invented.claims.push({
    criterion: 'SC99',
    criterionText: 'a criterion nobody wrote',
    criterionCharacters: 24,
    ruling: 'not-required',
    reason:
      'a reason long enough to pass the length rule but attached to a criterion that does not exist',
  });
  assert.throws(() => assertQuotesIntent(invented, criteria), /SC99/);
});

test('the claims are M040`s own: held to the live intent they redden naming SC1', () => {
  const own = intentPathForMilestone(ROOT, 'M040');
  // Held to whoever is current: between milestones the live intent is archived, so this asks the
  // resolver rather than spelling a path the archive move deletes.
  const live = currentIntentPath(ROOT);

  assert.notEqual(
    own,
    live,
    'an archived milestone must not resolve to the live intent',
  );
  assert.ok(
    own.startsWith(join(ROOT, '.project', 'archive', '040-')),
    `${own} is not M040's archive`,
  );

  const recording = readJson(
    CLAIMS_PATH,
    'the milestone owes the gate its claim list',
  );

  // The defect this suite landed with, proven live rather than quoted: held to whoever is current, these
  // rows redden at SC1 - which is what "the binding, not the claims, was wrong" means.
  assert.throws(
    () =>
      assertQuotesIntent(
        recording,
        intentCriteria(readText(live, 'the live intent')),
      ),
    /SC1 must quote the INTENT criterion character for character/,
    'M040`s claims must redden when they are held to the live intent, naming SC1',
  );
});

// ------------------------------------------------------------- the mutants ----

/**
 * The untouched record passes the pin first, then one anchored mutation of it must redden the pin
 * with a failure that names the defect. A mutant that survives, or that cannot fail, fails here.
 *
 * @param {(record: any) => any} pin
 * @param {Array<{ what: string, mutate: (record: any) => void, message: RegExp }>} mutants
 * @returns {void}
 */
function proveNonVacuous(pin, mutants) {
  const record = JSON.parse(readText(RECORD_PATH, 'no recording'));
  assert.doesNotThrow(
    () => pin(record),
    'the untouched record must pass first',
  );
  for (const mutant of mutants) {
    const copy = clone(record);
    mutant.mutate(copy);
    assert.throws(
      () => pin(copy),
      mutant.message,
      `${mutant.what} must redden the pin`,
    );
  }
}

const MUTANTS = [
  {
    what: 'M1 a profiler value the installed chunk declares dropped from the record',
    mutate: (record) => {
      record.pairs.sources[1].values.pop();
    },
    message: /pairs\.sources/,
  },
  {
    what: 'M2 an installed package version moved behind the record',
    mutate: (record) => {
      record.pairs.sources[0].version = '0.0.0';
    },
    message: /pairs\.sources/,
  },
  {
    what: 'M3 the two installs claimed to disagree',
    mutate: (record) => {
      record.pairs.identical = false;
    },
    message: /pairs\.identical/,
  },
  {
    what: 'M4 a pair`s numbers moved off the derived enum',
    mutate: (record) => {
      record.pairs.sources[0].pairs[0].start.value = 99;
    },
    message: /pairs\.sources/,
  },
  {
    what: 'M5 an emission site removed from the record',
    mutate: (record) => {
      record.identity.sites.pop();
    },
    message: /identity\.sites/,
  },
  {
    what: 'M6 an emission site given an argument it does not pass',
    mutate: (record) => {
      record.identity.sites
        .find((site) => site.events.includes('ComponentStart'))
        .args.push({
          text: 'componentView',
          identifier: true,
        });
    },
    message: /identity\.sites/,
  },
  {
    what: 'M7 a pair ruled to carry an identity it does not carry',
    mutate: (record) => {
      record.identity.perPair.find(
        (pair) => pair.carriesIdentity === 'none',
      ).carriesIdentity = 'both';
    },
    message: /identity\.perPair/,
  },
  {
    what: 'M8 the named absence moved onto another pair',
    mutate: (record) => {
      record.identity.namedAbsence.pair = 'TemplateUpdate 2/3';
    },
    message: /identity\.namedAbsence/,
  },
  {
    what: 'M9 the agent`s frame said to open on another event',
    mutate: (record) => {
      record.frames.agentFrame.opensOnValue = 99;
    },
    message: /frames\.agentFrame/,
  },
  {
    what: 'M10 a start claimed to arrive with no frame when it arrived in one',
    mutate: (record) => {
      record.frames.startsWithNoFrame[0].startsArrivedWithNoFrame = 0;
    },
    message: /frames\.startsWithNoFrame/,
  },
  {
    what: 'M11 a bracket claimed to be held by the agent`s frame',
    mutate: (record) => {
      record.frames.disagreements[0].agentFrameHoldsBothEnds = true;
    },
    message: /frames\.disagreements/,
  },
  {
    what: 'M12 a witness page whose per-event counts no longer add up to what it recorded',
    mutate: (record) => {
      record.witness.pages[0].eventsRecorded += 1;
    },
    message: /add up|eventsRecorded/,
  },
  {
    what: 'M13 a witness page claimed to be zoneful',
    mutate: (record) => {
      record.witness.pages[0].zoneGlobal = true;
    },
    message: /zoneGlobal/,
  },
  {
    what: 'M14 a portal refusal relabelled as a capture',
    mutate: (record) => {
      record.witness.portalAttempt.result = 'captured';
    },
    message: /portalAttempt/,
  },
  {
    what: 'M15 the artefact the portal lacks left unnamed',
    mutate: (record) => {
      record.witness.portalAttempt.lacks = 'nothing';
    },
    message: /portalAttempt\.lacks/,
  },
  {
    what: 'M16 a cost the page never measured smuggled into the record',
    mutate: (record) => {
      record.frames.finding = 'unchanged prose';
      record.identity.perPair[0].durationMs = 4;
    },
    message: /durationMs|cost nobody measured/,
  },
  {
    what: 'M19 the zoneless portal measurement relabelled as a refusal',
    mutate: (record) => {
      record.witness.portalZonelessAttempt.result = 'refused';
    },
    message: /portalZonelessAttempt/,
  },
  {
    what: 'M20 a zoneless portal pair that lost its ends',
    mutate: (record) => {
      record.witness.portalZonelessAttempt.pairs[0].endCount -= 1;
    },
    message: /portalZonelessAttempt records/,
  },
  {
    what: 'M21 a zoneless portal page read as zoneful',
    mutate: (record) => {
      record.witness.portalZonelessAttempt.gates.zoneGlobal = true;
    },
    message: /zoneless/,
  },
  {
    what: 'M22 the recording attributed to another task',
    mutate: (record) => {
      record.task = 'T005';
    },
    message: /recording task/,
  },
  {
    what: 'M18 a write time that is not a timestamp',
    mutate: (record) => {
      record.capturedAt = 'yesterday';
    },
    message: /capturedAt/,
  },
];

test('every derived value is pinned non-vacuously: the record passes, a mutant reddens it', () => {
  proveNonVacuous(validate, MUTANTS);
});

/**
 * The derivation itself is proven live: the same record, derived against a different evidence set,
 * moves at the field that evidence settles. This is the pin that catches a source moving - the
 * installed build, the agent's source, or the recorded witness - and it names the value.
 */
test('the derivation moves when its evidence moves', () => {
  const record = JSON.parse(readText(RECORD_PATH, 'no recording'));
  const cases = [
    {
      what: 'a profiler value the installed chunk began to declare',
      mutate: (/** @type {any} */ evidence) => {
        evidence.packages[0].events.push({
          name: 'ExtraStart',
          value: evidence.packages[0].events.length,
        });
      },
      path: 'pairs.sources',
    },
    {
      what: 'a pair the installed chunk no longer declares',
      mutate: (/** @type {any} */ evidence) => {
        const entry = evidence.packages[0].events.find(
          (/** @type {any} */ value) => value.name === 'ComponentEnd',
        );
        entry.name = 'ComponentFinish';
      },
      throws: /declares no ComponentStart\/ComponentEnd pair/,
    },
    {
      what: 'the fixture install moving',
      mutate: (/** @type {any} */ evidence) => {
        evidence.packages[1].version = '0.0.0';
      },
      path: 'pairs.sources',
    },
    {
      what: 'an emission site losing the argument it passes',
      mutate: (/** @type {any} */ evidence) => {
        const site = evidence.packages[0].sites.find(
          (/** @type {any} */ candidate) =>
            candidate.events.includes('ComponentEnd'),
        );
        site.args = [];
      },
      path: 'identity.perPair',
    },
    {
      what: 'a start site beginning to pass an instance',
      mutate: (/** @type {any} */ evidence) => {
        const site = evidence.packages[0].sites.find(
          (/** @type {any} */ candidate) =>
            candidate.events.includes('ComponentStart'),
        );
        site.args = [{ text: 'componentView', identifier: true }];
      },
      path: 'identity.perPair',
    },
    {
      what: 'the agent holding a second profiler tap',
      mutate: (/** @type {any} */ evidence) => {
        evidence.agent.frame = { ...evidence.agent.frame, profilerTaps: 2 };
      },
      path: 'frames.agentFrame',
    },
  ];
  for (const item of cases) {
    const evidence = clone(EVIDENCE);
    item.mutate(evidence);
    if (item.throws !== undefined) {
      assert.throws(
        () => derive(record, evidence),
        item.throws,
        `${item.what} must be named by the derivation`,
      );
      continue;
    }
    const derived = derive(record, evidence);
    const moved = divergence(record, merge(record, derived)).join(' ');
    assert.ok(
      moved.includes(item.path),
      `${item.what} must move ${item.path}; the derivation said ${moved || 'nothing'}`,
    );
  }

  // The frame readings are carried from the one browser run, so the derivation re-reads them: a
  // witness count that moved must move the start-order reading with it.
  const drifted = clone(record);
  const first = drifted.witness.pages[0].perEvent.find(
    (/** @type {any} */ entry) => String(entry.name).endsWith('Start'),
  );
  first.arrivedWithNoFrame += 1;
  first.count += 1;
  first.arrivedInOpenFrame =
    Number(first.count) - Number(first.arrivedWithNoFrame);
  const moved = divergence(
    record,
    merge(drifted, derive(drifted, EVIDENCE)),
  ).join(' ');
  assert.ok(
    moved.includes('frames.startsWithNoFrame'),
    `a moved witness count must move the start-order reading; the derivation said ${moved || 'nothing'}`,
  );
});

test('the read-only pin bites: a file whose bytes moved reddens it', () => {
  // The untouched recording passes the pin the default run applies.
  assert.doesNotThrow(() =>
    assertUnchanged(RECORD_PATH, SHA_AT_LOAD.get(RECORD_PATH) ?? null),
  );
  // A `before` that is not the file's hash is a file that changed during the run.
  assert.throws(
    () =>
      assertUnchanged(RECORD_PATH, sha256('a recording this run did not find')),
    /changed during this run/,
    'a recording that moved during the run must redden the read-only pin',
  );
  // A relative weight: the pin is only meaningful because the file is named.
  assert.equal(WOULD_WRITE.length, 1);
  assert.equal(WOULD_WRITE[0]?.path, RECORD_PATH);
});

test('no derived value is pinned as a literal in this suite', () => {
  const source = readText(SELF_PATH, 'this file');
  // Assembled so this check does not find its own needles.
  const needles = [
    ['Chro', 'me/'].join(''),
    ['local', 'host'].join(''),
    ['22.', '2.'].join(''),
    ['22.', '1.'].join(''),
    ['edge-', 'dev-aion'].join(''),
    ['chrome-', 'beta'].join(''),
  ];
  for (const needle of needles) {
    assert.equal(
      source.includes(needle),
      false,
      `this suite carries ${JSON.stringify(needle)}, a derived value copied into the checks`,
    );
  }
  assert.equal(
    /\b[0-9a-f]{32,}\b/.test(source),
    false,
    'this suite pins a hash, and a hash is the value that goes stale first',
  );
  assert.equal(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(source),
    false,
    'this suite pins a timestamp',
  );
});

// A default run must not touch the recording: the file hashes the same at the end of the run as at
// its start, which is what makes two default runs identical.
if (process.env.M040_CAPTURE !== '1') {
  test('this run wrote nothing: every file this suite names hashes the same before and after', () => {
    for (const file of WOULD_WRITE) {
      assert.doesNotThrow(() =>
        assertUnchanged(file.path, SHA_AT_LOAD.get(file.path) ?? null),
      );
    }
  });
}
