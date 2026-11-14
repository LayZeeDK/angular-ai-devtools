// @ts-check
//
// M041 T005 — the re-capture behind an opt-in switch, and the two artefacts the gate itself reads
// (INTENT.md SC6; T005's AC1, AC2, AC3, AC4 and AC6).
//
// Two artefacts are committed for this milestone and both are read by suites that run on every
// default `npm test`:
//
//   research/raw/m041-navigation.json        T001's measurement of the router's stream, re-captured
//   research/raw/m041-verdict-claims.json    this milestone's claim list, ruled per criterion
//
// A measurement that can only be taken once goes stale the first time the page, the agent or the
// installed `@angular/router` moves; a measurement that is re-taken on every `npm test` writes into
// a tracked file as a side effect of a test run. This repository has paid for the second failure
// twice — M029 T007 and M030 T006 both landed a capture that rewrote a tracked recording during a
// default run and broke idempotence — so the write is opt-in and gated by `M041_CAPTURE=1`.
//
// Unarmed (the default, and what `npm test` runs):
//
//   node --experimental-strip-types --test scripts/navigation-capture.test.mjs
//
// it drives nothing and writes nothing. It names every file it would write, asserts that none of
// them changed during the run — the recording and the claim list both hash the same before and
// after — and asserts that the recording on disk still re-derives from the evidence this head
// carries, so an unarmed run is a freshness check rather than a no-op.
//
// Armed, on Windows cmd.exe (a bare `set M041_CAPTURE=1 &&` leaves the space inside the variable and
// arms nothing):
//
//   set "M041_CAPTURE=1"&& node --experimental-strip-types --test "scripts/navigation-capture.test.mjs"
//
// What "armed" re-measures, stated exactly: every value a committed artefact can settle. The event
// classes and each class's own key set, the EventType numbers, the two code enums and every
// `declaredAt` line range come from the installed `@angular/router` chunk; the `currentNavigation()`
// field list and the fields its own update sites add come from the same chunk; the reach path — the
// function, its citation and the calls it makes — comes from the widened page agent's own body, which
// is why the citation is derived rather than quoted; the counter fixture's guard name and its
// configured source come from the guard's own file; the router version comes from the installed
// manifest; and the capture block names this switch, its commands and the sections it re-measured,
// with that list derived from the derivation itself. The page's own readings — the frames T001
// recorded, their receipt times and the payloads those events carried — are the one measurement this
// milestone took. They are carried, and this file re-checks their internal consistency instead of
// re-driving a browser: a re-drive is a manual step with a fresh clock and a fresh browser build
// string, and each of those is a byte that would move on every run, which is exactly the drift this
// switch exists to prevent.
//
// Idempotence is proven, not assumed: `plan` derives, compares and writes only when a derived value
// moved or the file is not the canonical serialisation of its record. The write time is stamped only
// when a write happens, so two armed runs with nothing moved leave the recording byte-identical, and
// the recording's SHA-256 is reported in a diagnostic rather than pinned as a literal — a pinned
// hash, a pinned timestamp or a pinned line number is the stale value this milestone's N6 forbids.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { intentPathForMilestone } from './verdict-claims-intent.mjs';

const SELF_PATH = fileURLToPath(import.meta.url);
const HERE = dirname(SELF_PATH);
const ROOT = join(HERE, '..');

const RECORD_REL = 'research/raw/m041-navigation.json';
const CLAIMS_REL = 'research/raw/m041-verdict-claims.json';
const CHUNK_REL = 'node_modules/@angular/router/fesm2022/_router-chunk.mjs';
const MANIFEST_REL = 'node_modules/@angular/router/package.json';
const AGENT_REL = 'extension/agent-main.js';
const GUARD_REL = 'spikes/ng222-app/src/app/redirect-guard.ts';

const RECORD_PATH = join(ROOT, RECORD_REL);
const CLAIMS_PATH = join(ROOT, CLAIMS_REL);
const CHUNK_PATH = join(ROOT, CHUNK_REL);
const MANIFEST_PATH = join(ROOT, MANIFEST_REL);
const AGENT_PATH = join(ROOT, AGENT_REL);
const GUARD_PATH = join(ROOT, GUARD_REL);

const SCRIPT = 'scripts/navigation-capture.test.mjs';
const CHECK_COMMAND = `node --experimental-strip-types --test "${SCRIPT}"`;
const ARMED_CAPTURE_COMMAND = `set "M041_CAPTURE=1"&& node --experimental-strip-types --test "${SCRIPT}"`;

const ARMED = process.env.M041_CAPTURE === '1';

/** The one volatile field of the capture block: the time the file was written. */
const VOLATILE_CAPTURE_FIELD = 'at';

/**
 * Every file this suite would write, named here so a default run can prove that none of them moved.
 * The armed run writes the recording and nothing else: the claim list is ruled in prose, and a reason
 * a machine re-derived would not be a ruling. The proof copy under the ignored `tmp/` directory is
 * the armed arm's own scratch file, written so the write path is proven live rather than asserted.
 */
const WOULD_WRITE = [
  { path: RECORD_PATH, why: 'the recording T001 made, re-derived in place' },
];

const PROOF_COPY = join(ROOT, 'tmp', 'm041-capture-proof', 'recording.json');

/** The four readings the wave gate's driver returns; a required row may cite no others. */
const READINGS = ['toolElements', 'drawnRect', 'descriptor', 'noDevContext'];
const RULINGS = ['required', 'not-required'];
const VERDICT_PATH =
  /^\.project\/build\/verify\/[a-z0-9]+(-[a-z0-9]+)*\/verdict\.json$/;

/** The four classes whose arrival ends a navigation. */
const TERMINAL_CLASSES = new Set([
  'NavigationEnd',
  'NavigationCancel',
  'NavigationError',
  'NavigationSkipped',
]);

/** The two stream classes that carry no navigation id, by declaration. */
const IDLESS_CLASSES = ['RouteConfigLoadStart', 'RouteConfigLoadEnd'];

/** The words no payload key and no `currentNavigation()` field may carry (SC3). */
const HOLDER_WORDS = ['guard', 'resolver', 'chunk', 'task', 'holder'];

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

/**
 * The bytes the recording is written as, and re-read as, on every run: one canonical
 * serialisation, so an armed run that changes nothing cannot change a byte.
 *
 * @param {unknown} record
 * @returns {string}
 */
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
  if (!existsSync(path)) fail(`${displayPath(path)} is missing — ${why}`);
  return readFileSync(path, 'utf8');
}

/** @param {string} path @param {string} why @returns {any} */
function readJson(path, why) {
  const text = readText(path, why);
  try {
    return JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
  } catch (error) {
    fail(`${displayPath(path)} is not JSON (${String(error)})`);
  }
}

/** @param {string} text @param {number} index @returns {number} */
function lineOfIndex(text, index) {
  return text.slice(0, index).split('\n').length;
}

/** @param {unknown} value @returns {boolean} */
function isIsoTimestamp(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)
  );
}

// ------------------------------------------------- the readers (derivation) ----

/**
 * One enum's members, by name and number, from the IIFE the shipped chunk executes. A declaration
 * file would not prove what the page runs; this does.
 *
 * @param {string} text
 * @param {string} name
 * @returns {Array<{ name: string, value: number }>}
 */
function readEnum(text, name) {
  const start = text.indexOf(`var ${name};`);
  if (start === -1) fail(`${CHUNK_REL} declares no \`var ${name};\``);
  const end = text.indexOf(`})(${name} ||`, start);
  if (end === -1) fail(`${CHUNK_REL} closes no ${name} IIFE`);
  const pattern = new RegExp(
    `${name}\\[${name}\\["([A-Za-z]+)"\\] = (\\d+)\\]`,
    'g',
  );
  /** @type {Array<{ name: string, value: number }>} */
  const values = [];
  let match;
  while ((match = pattern.exec(text.slice(start, end))) !== null) {
    values.push({ name: match[1] ?? '', value: Number(match[2]) });
  }
  if (values.length === 0) fail(`${CHUNK_REL} declares no ${name} member`);
  return values;
}

/** The line range one `var <Name>;` IIFE occupies, in the citation convention this record uses. */
function enumCitation(text, name) {
  const start = text.indexOf(`var ${name};`);
  if (start === -1) fail(`${CHUNK_REL} declares no \`var ${name};\``);
  const close = text.indexOf(`})(${name} ||`, start);
  if (close === -1) fail(`${CHUNK_REL} closes no ${name} IIFE`);
  return { start: lineOfIndex(text, start), end: lineOfIndex(text, close) };
}

/** One `class <Name>` block: its text and the lines it sits on. */
function classBlock(text, name) {
  const start = text.indexOf(`class ${name} `);
  if (start === -1) fail(`${CHUNK_REL} declares no class ${name}`);
  const end = text.indexOf('\n}', start);
  if (end === -1) fail(`${CHUNK_REL} never closes class ${name}`);
  return {
    body: text.slice(start, end),
    startLine: lineOfIndex(text, start),
    endLine: lineOfIndex(text, end),
  };
}

/**
 * One class's own key set: the field names its constructor assigns on `this`, its
 * `type = EventType.<Name>` field, and — for a class that extends `RouterEvent` — the base
 * constructor's own assignments.
 *
 * @param {string} text
 * @param {string} name
 * @param {string[]} baseKeys
 * @returns {{ keys: string[], extendsRouterEvent: boolean, typeName: string | null, startLine: number, endLine: number }}
 */
function classKeys(text, name, baseKeys) {
  const block = classBlock(text, name);
  const extendsRouterEvent = /extends RouterEvent\b/.test(block.body);
  const keys = new Set(extendsRouterEvent ? baseKeys : []);
  for (const match of block.body.matchAll(/this\.([A-Za-z_$][\w$]*)\s*=/g)) {
    keys.add(match[1] ?? '');
  }
  const typeField = /^\s*type\s*=\s*EventType\.([A-Za-z]+);/m.exec(block.body);
  if (typeField !== null) keys.add('type');
  return {
    keys: [...keys].sort(),
    extendsRouterEvent,
    typeName: typeField === null ? null : (typeField[1] ?? null),
    startLine: block.startLine,
    endLine: block.endLine,
  };
}

/**
 * Every class in the chunk that declares `type = EventType.<Name>`, in the order the shipped chunk
 * declares them. The record's own row order is the order a navigation emits its events in — a
 * reading, not a declaration order — so this list is the membership test for the record's order.
 *
 * @param {string} text
 * @returns {string[]}
 */
function eventClassNames(text) {
  /** @type {string[]} */
  const names = [];
  for (const match of text.matchAll(
    /^class ([A-Za-z]+)(?: extends [A-Za-z]+)? \{/gm,
  )) {
    const name = match[1] ?? '';
    const start = match.index ?? 0;
    const end = text.indexOf('\n}', start);
    if (end === -1) continue;
    if (
      new RegExp(`^\\s*type\\s*=\\s*EventType\\.${name};`, 'm').test(
        text.slice(start, end),
      )
    ) {
      names.push(name);
    }
  }
  return names;
}

/**
 * The keys of the object literal the router hands to `currentNavigation`, and the fields its own
 * update sites add afterwards, with the lines those sites sit on.
 *
 * @param {string} text
 * @returns {{
 *   setAtLine: number, setFields: string[], updateFields: string[],
 *   addedLater: string[], updateSites: Array<{ line: number, fields: string[] }>,
 * }}
 */
function currentNavigationFields(text) {
  const setAt = text.indexOf('this.currentNavigation.set({');
  if (setAt === -1) {
    fail(`${CHUNK_REL} has no \`this.currentNavigation.set({\` site`);
  }
  const open = text.indexOf('{', setAt);
  let depth = 0;
  let close = open;
  for (let index = open; index < text.length; index += 1) {
    if (text[index] === '{') depth += 1;
    else if (text[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        close = index;
        break;
      }
    }
  }
  const literal = text.slice(open, close);
  /** @type {string[]} */
  const keys = [];
  let level = 0;
  for (const raw of literal.split('\n')) {
    const line = raw.trim();
    if (level === 1) {
      const match = /^([A-Za-z_$][\w$]*)\s*:/.exec(line);
      if (match !== null) keys.push(match[1] ?? '');
    }
    level +=
      (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
  }
  if (keys.length === 0) {
    fail(`${CHUNK_REL} sets currentNavigation with an empty object literal`);
  }
  /** @type {Array<{ line: number, fields: string[] }>} */
  const updateSites = [];
  const pattern = /this\.currentNavigation\.update\(nav => \{/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const block = text.slice(match.index, text.indexOf('});', match.index));
    const fields = [...block.matchAll(/nav\.([A-Za-z_$][\w$]*)\s*=/g)].map(
      (entry) => entry[1] ?? '',
    );
    updateSites.push({
      line: lineOfIndex(text, match.index),
      fields: [...new Set(fields)].sort(),
    });
  }
  const setFields = [...new Set(keys)].sort();
  const updateFields = [
    ...new Set(updateSites.flatMap((site) => site.fields)),
  ].sort();
  return {
    setAtLine: lineOfIndex(text, setAt),
    setFields,
    updateFields,
    addedLater: updateFields.filter((field) => !setFields.includes(field)),
    updateSites,
  };
}

/**
 * One `function <signature>(` body from the page agent, and the lines it sits on. The end is the
 * last line before the two-space closing brace, which is the convention the recording's own
 * `path:start-end` citations use.
 *
 * @param {string} text
 * @param {string} signature
 * @returns {{ body: string, startLine: number, endLine: number }}
 */
function functionRegion(text, signature) {
  const start = text.indexOf(signature);
  if (start === -1) fail(`${AGENT_REL} declares no \`${signature}\``);
  const end = text.indexOf('\n  }\n', start);
  if (end === -1) fail(`${AGENT_REL} never closes \`${signature}\``);
  return {
    body: text.slice(start, end),
    startLine: lineOfIndex(text, start),
    endLine: lineOfIndex(text, end),
  };
}

/**
 * The widened agent's own Router read, derived from its body: the function the shipped agent calls,
 * the region its token lookup and its subscription occupy, and the calls that region makes. The
 * citation is computed from the source, so a function that moves moves the pin rather than leaving a
 * stale range beside a stale sentence.
 *
 * @param {string} text
 * @returns {{ function: string, cite: string, calls: string[], tokenField: string }}
 */
function agentRouterRead(text) {
  const token = functionRegion(text, 'function routerTokenFrom(');
  const subscribe = functionRegion(text, 'function routerSubscribe(');
  const region = text.slice(
    text.indexOf('function routerTokenFrom('),
    text.indexOf('\n  }\n', text.indexOf('function routerSubscribe(')),
  );
  const calls = [
    'ng.getInjector(el) (else ng.ɵgetInjectorFromNode)',
    'ng.ɵgetInjectorResolutionPath(injector)',
    'ng.ɵgetInjectorProviders(entry)',
  ];
  // Each named call must be spelled in the region the citation covers, or the record would claim a
  // read the shipped agent no longer performs.
  for (const call of calls) {
    const identifier =
      /ɵ[A-Za-z]+/.exec(call)?.[0] ?? /(getInjector)/.exec(call)?.[0] ?? '';
    if (identifier === '' || !region.includes(identifier)) {
      fail(
        `${AGENT_REL} no longer spells ${JSON.stringify(identifier)} between \`routerTokenFrom\` and the end of \`routerSubscribe\`, so the recorded reach is not the read the agent performs`,
      );
    }
  }
  if (!/\.token\b/.test(region)) {
    fail(
      `${AGENT_REL} no longer reads a provider record's \`token\` in its Router read, so the recorded reach names a field the agent does not read`,
    );
  }
  return {
    source: AGENT_REL,
    function: 'routerTokenFrom',
    cite: `${AGENT_REL}:${token.startLine}-${subscribe.endLine}`,
    calls,
    tokenField: 'record.token',
  };
}

/**
 * The name the fixture's one `canActivate` function carries, and the source it is configured with.
 *
 * @param {string} text
 * @returns {{ name: string, source: string }}
 */
function fixtureGuard(text) {
  const match = /export const ([A-Za-z_$][\w$]*):\s*CanActivateFn/.exec(text);
  if (match === null) {
    fail(`${GUARD_REL} declares no \`export const <name>: CanActivateFn\``);
  }
  const configured = /=>\s*([^;]+);?/.exec(text);
  return {
    name: match[1] ?? '',
    source:
      configured === null
        ? text.trim()
        : `() => ${(configured[1] ?? '').trim()}`,
  };
}

/** The version one installed package declares for itself. */
function installedVersion(path) {
  const manifest = /** @type {{ version?: unknown }} */ (
    readJson(path, 'run npm ci')
  );
  if (typeof manifest.version !== 'string' || manifest.version === '') {
    fail(`${displayPath(path)} declares no version`);
  }
  return manifest.version;
}

// ------------------------------------------------------------ the derivation ----

/**
 * A dotted-path inventory of one object's first two levels: the sections a re-capture re-measures.
 * Derived from the derivation itself, so the list in the record cannot go stale behind the code.
 *
 * @param {Record<string, any>} tree
 * @returns {string[]}
 */
function sectionsOf(tree) {
  /** @type {string[]} */
  const sections = [];
  for (const [key, value] of Object.entries(tree)) {
    if (isObject(value) && Object.keys(value).length > 0) {
      for (const inner of Object.keys(value)) sections.push(`${key}.${inner}`);
      continue;
    }
    sections.push(key);
  }
  return sections.sort();
}

/**
 * The frames the recording carries, by section, so every check that reads a stream reads the same
 * list.
 *
 * @param {any} record
 * @returns {Record<string, any[]>}
 */
function allFrames(record) {
  return {
    'held.inFlight': record.held?.inFlight?.events ?? [],
    'held.completion': record.held?.completion?.events ?? [],
    warm: record.warm?.events ?? [],
    superseded: record.superseded?.events ?? [],
    'terminals.cancel': record.terminals?.cancel?.event
      ? [record.terminals.cancel.event]
      : [],
    'terminals.error': record.terminals?.error?.events ?? [],
    'terminals.skip': record.terminals?.skip?.events ?? [],
    'terminals.redirect': record.terminals?.redirect?.events ?? [],
  };
}

/**
 * Everything this run reads from the installed package, the page agent and the fixture. One object,
 * built once, so the derivation compares a recorded claim against the same live evidence rather
 * than re-reading a file per assertion — and so a mutant can hand the derivation a different
 * evidence set and watch it move.
 *
 * @returns {{ chunk: string, agent: string, guard: string, routerVersion: string }}
 */
function readEvidence() {
  return {
    chunk: readText(CHUNK_PATH, 'run npm ci'),
    agent: readText(AGENT_PATH, 'the page agent is part of this repository'),
    guard: readText(
      GUARD_PATH,
      'the counter fixture is part of this repository',
    ),
    routerVersion: installedVersion(MANIFEST_PATH),
  };
}

/**
 * Every value of the recording a committed artefact can settle, re-derived. The return is a subtree,
 * merged onto the recording by `merge`; nothing here copies a derived value forward, so a field this
 * function stops deriving shows up as a diff against the recording rather than as a silent pass.
 *
 * @param {any} record
 * @param {ReturnType<typeof readEvidence>} [evidence]
 * @returns {Record<string, any>}
 */
function derive(record, evidence = EVIDENCE) {
  const text = evidence.chunk;
  const routerEvent = classKeys(text, 'RouterEvent', []);
  const baseKeys = routerEvent.keys;
  const eventType = new Map(
    readEnum(text, 'EventType').map((entry) => [entry.name, entry.value]),
  );
  /** The EventType number one class name carries, or a failure naming the class. */
  const typeOf = (/** @type {string} */ name) => {
    const value = eventType.get(name);
    if (typeof value !== 'number') {
      fail(`${CHUNK_REL} declares no EventType member ${name}`);
    }
    return value;
  };

  // The record's own row order is the order a navigation emits its events in; the chunk's order is
  // its declaration order. The two must be the same set, or a class appeared or vanished and the
  // enumeration has to be re-cut by hand rather than absorbed here.
  const recordedNames = (record.events?.classes ?? []).map(
    (/** @type {any} */ row) => row.name,
  );
  const chunkEnumeration = eventClassNames(text).filter(
    (name) => name !== 'Scroll',
  );
  const missing = chunkEnumeration.filter(
    (name) => !recordedNames.includes(name),
  );
  const extra = recordedNames.filter(
    (/** @type {string} */ name) => !chunkEnumeration.includes(name),
  );
  if (missing.length > 0 || extra.length > 0) {
    fail(
      `the recording enumerates ${recordedNames.length} event classes and the installed chunk declares ${chunkEnumeration.length}: missing ${JSON.stringify(missing)}, no longer declared ${JSON.stringify(extra)}`,
    );
  }

  const classes = recordedNames.map((/** @type {string} */ name) => {
    const derived = classKeys(text, name, baseKeys);
    if (derived.typeName !== name) {
      fail(
        `${CHUNK_REL} declares ${name}.type as EventType.${String(derived.typeName)}, so the class and its event type disagree`,
      );
    }
    const recorded = (record.events?.classes ?? []).find(
      (/** @type {any} */ row) => row.name === name,
    );
    return {
      ...recorded,
      name,
      type: typeOf(name),
      keys: derived.keys,
      declaredAt: `${CHUNK_REL}:${derived.startLine}-${derived.endLine}`,
      extendsRouterEvent: derived.extendsRouterEvent,
    };
  });

  const scroll = classKeys(text, 'Scroll', []);
  const cancellation = readEnum(text, 'NavigationCancellationCode');
  const skipped = readEnum(text, 'NavigationSkippedCode');
  const allEvents = Object.values(allFrames(record)).flat();

  const codeRows = (
    /** @type {Array<{ name: string, value: number }>} */ members,
    /** @type {number} */ terminalType,
  ) =>
    members.map((member) => {
      const recorded = [
        ...(record.events?.codes?.cancellation ?? []),
        ...(record.events?.codes?.skipped ?? []),
      ].find((/** @type {any} */ row) => row.name === member.name);
      const produced = allEvents.some(
        (/** @type {any} */ event) =>
          event.type === terminalType && event.payload?.code === member.value,
      );
      return {
        name: member.name,
        value: member.value,
        producedByARun: produced,
        producedBy: produced ? (recorded?.producedBy ?? null) : null,
      };
    });

  const cancellationRows = codeRows(cancellation, typeOf('NavigationCancel'));
  const skippedRows = codeRows(skipped, typeOf('NavigationSkipped'));

  // In the order the installed enums declare their members, which is the order the record keeps.
  const unproduced = [
    ...cancellationRows
      .filter((row) => !row.producedByARun)
      .map((row) => ({
        enum: 'NavigationCancellationCode',
        name: row.name,
        value: row.value,
      })),
    ...skippedRows
      .filter((row) => !row.producedByARun)
      .map((row) => ({
        enum: 'NavigationSkippedCode',
        name: row.name,
        value: row.value,
      })),
  ];

  const redirect = record.terminals?.redirect ?? {};
  const redirectEvents = Array.isArray(redirect.events) ? redirect.events : [];
  const redirectTerminal = redirect.terminal ?? null;

  const currentNavigation = currentNavigationFields(text);
  const union = [
    ...new Set([
      ...currentNavigation.setFields,
      ...currentNavigation.updateFields,
    ]),
  ].sort();

  const heldPayloadKeys = [
    ...new Set(
      (record.held?.inFlight?.events ?? []).flatMap(
        (/** @type {any} */ event) =>
          isObject(event.payload) ? Object.keys(event.payload) : event.keys,
      ),
    ),
  ].sort();

  const holder = record.absences?.['no-holder-recorded'] ?? {};
  const holderWords = Array.isArray(holder.wordsChecked)
    ? holder.wordsChecked
    : HOLDER_WORDS;
  const matchesAWord = (/** @type {string} */ field) =>
    holderWords.some((/** @type {string} */ word) =>
      field.toLowerCase().includes(word),
    );

  const guardsEnd = classKeys(text, 'GuardsCheckEnd', baseKeys);
  const guardsStart = classKeys(text, 'GuardsCheckStart', baseKeys);
  const guardFields = guardsEnd.keys.filter(
    (key) => !guardsStart.keys.includes(key) && !baseKeys.includes(key),
  );

  const guard = fixtureGuard(evidence.guard);

  const derived = {
    environment: { router: { version: evidence.routerVersion } },
    events: {
      reader: {
        baseClass: {
          name: 'RouterEvent',
          keys: baseKeys,
          declaredAt: `${CHUNK_REL}:${routerEvent.startLine}-${routerEvent.endLine}`,
        },
      },
      enumerated: classes.length,
      classes,
      observedClassCount: classes.length,
      scroll: {
        ...(record.events?.scroll ?? {}),
        name: 'Scroll',
        type: typeOf('Scroll'),
        keys: scroll.keys,
        declaredAt: `${CHUNK_REL}:${scroll.startLine}-${scroll.endLine}`,
      },
      codes: {
        declaration: `${CHUNK_REL}:${enumCitation(text, 'NavigationCancellationCode').start}-${enumCitation(text, 'NavigationSkippedCode').end}`,
        cancellation: cancellationRows,
        skipped: skippedRows,
        redirectProducedNoCancel: {
          frame: 'redirect',
          events: redirectEvents.length,
          cancelCount: redirectEvents.filter(
            (/** @type {any} */ event) =>
              event.type === typeOf('NavigationCancel'),
          ).length,
          url: redirectTerminal?.payload?.url ?? null,
          urlAfterRedirects:
            redirectTerminal?.payload?.urlAfterRedirects ?? null,
        },
        unproduced,
      },
    },
    reach: { readFrom: agentRouterRead(evidence.agent) },
    held: {
      currentNavigation: {
        keys: currentNavigation.setFields,
        chunkSetFieldCount: currentNavigation.setFields.length,
        chunkSetFields: currentNavigation.setFields,
        chunkSetSite: `${CHUNK_REL}:${currentNavigation.setAtLine}-${currentNavigation.setAtLine}`,
        chunkUpdateSites: currentNavigation.updateSites,
      },
    },
    absences: {
      'no-holder-recorded': {
        currentNavigationFieldsAtTheHold: currentNavigation.setFields,
        fieldsTheChunkAddsLater: currentNavigation.addedLater,
        currentNavigationFields: union,
        payloadFieldsMatchingAWord: heldPayloadKeys.filter(matchesAWord),
        currentNavigationFieldsMatchingAWord: union.filter(matchesAWord),
        eventPayloadKeysChecked: heldPayloadKeys,
      },
      'guard-verdict-not-recorded': {
        guardsCheckEndKeys: guardsEnd.keys,
        guardsCheckEndObservedKeys: guardsEnd.keys,
        guardFieldsInThatPayload: guardFields,
      },
    },
    guards: {
      fixture: {
        canActivateNames: [guard.name],
        canActivateSources: [guard.source],
        guardFile: GUARD_REL,
      },
    },
  };

  const capture = {
    task: 'T005',
    command: ARMED_CAPTURE_COMMAND,
    check: CHECK_COMMAND,
    records: RECORD_REL,
    remeasured: sectionsOf(derived),
    reading:
      'an armed run re-measures every section listed above from the artefacts this head carries: the installed @angular/router chunk and manifest, the widened page agent`s own Router read, and the fixture`s guard file. The page`s own readings — the recorded frames, their receipt times and the payloads those events carried — are the one measurement this milestone took and are carried unchanged, so a re-drive is a manual step and never a side effect of a test run',
    [VOLATILE_CAPTURE_FIELD]: record.capture?.[VOLATILE_CAPTURE_FIELD] ?? null,
  };

  return { ...derived, capture };
}

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
 * Where two records disagree, as `path: recorded -> derived`. Empty means the recording is the
 * derivation. Arrays are walked row by row and labelled by a row's own `name` where it carries one,
 * so a moved value is reported as `events.classes[NavigationEnd].keys` and not as the whole list.
 *
 * @param {any} recorded
 * @param {any} derived
 * @param {string} [at]
 * @returns {string[]}
 */
function divergence(recorded, derived, at = '') {
  if (Array.isArray(recorded) && Array.isArray(derived)) {
    if (recorded.length !== derived.length) {
      return [`${at}: ${recorded.length} row(s) -> ${derived.length} row(s)`];
    }
    /** @type {string[]} */
    const found = [];
    for (let index = 0; index < recorded.length; index += 1) {
      const row = recorded[index];
      const label =
        isObject(row) && typeof row.name === 'string'
          ? `[${row.name}]`
          : `[${index}]`;
      found.push(...divergence(row, derived[index], `${at}${label}`));
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
 * The record's own shape and provenance, which no reading of the evidence can settle: the schema,
 * the task that established it, the capture block's command strings and the write time.
 *
 * @param {any} record
 * @returns {void}
 */
function assertShape(record) {
  if (!isObject(record)) fail('the recording is not an object');
  if (record.schema !== 'm041-navigation/v1') {
    fail(`the recording schema is ${JSON.stringify(record.schema)}`);
  }
  if (record.milestone !== 'navigation-blocking') {
    fail(`the recording milestone is ${JSON.stringify(record.milestone)}`);
  }
  // The task that established the record: T001 measured it, and its own suite pins this field, so a
  // re-capture rewrites the file without rewriting who took the measurement.
  if (record.task !== 'T001') {
    fail(`the recording task is ${JSON.stringify(record.task)}`);
  }
  for (const key of ['title', 'question', 'verdict']) {
    if (typeof record[key] !== 'string' || record[key] === '') {
      fail(`missing the recording's ${key}`);
    }
  }
  if (!isIsoTimestamp(record.capturedAt)) {
    fail(`the recording capturedAt is ${record.capturedAt}`);
  }
  for (const key of ['check', 'serve', 'browser', 'drive', 'teardown']) {
    if (
      typeof record.commands?.[key] !== 'string' ||
      record.commands[key] === ''
    ) {
      fail(`missing commands.${key}`);
    }
  }
  for (const key of ['platform', 'shell', 'node', 'browser', 'instance']) {
    if (
      typeof record.environment?.[key] !== 'string' ||
      record.environment[key] === ''
    ) {
      fail(`missing environment.${key}`);
    }
  }
  if (record.environment?.router?.chunk !== CHUNK_REL) {
    fail(
      `environment.router.chunk is ${JSON.stringify(record.environment?.router?.chunk)}`,
    );
  }
  if (
    !Array.isArray(record.doesNotSettle) ||
    record.doesNotSettle.length === 0
  ) {
    fail('the record does not say what it does not settle');
  }
  if (
    !Array.isArray(record.environment?.probes) ||
    record.environment.probes.length === 0
  ) {
    fail(
      'environment.probes names no probe, so the recording cannot say how it was taken',
    );
  }
  // Every measured section names the probe that recorded it: a fact this repository cannot
  // re-derive is quoted as the recording's own measurement, with its recorder beside it. The two
  // sections whose recorder names four runs rather than one probe say so in their own prose.
  /** @type {Array<[string, any]>} */
  const recorded = [
    ['reach', record.reach],
    ['held', record.held],
    ['warm', record.warm],
    ['superseded', record.superseded],
    ['terminals', record.terminals],
    ['absences.no-holder-recorded', record.absences?.['no-holder-recorded']],
    [
      'absences.guard-verdict-not-recorded',
      record.absences?.['guard-verdict-not-recorded'],
    ],
    [
      'absences.no-resolver-configured',
      record.absences?.['no-resolver-configured'],
    ],
    ['guards', record.guards],
    ['pageErrors', record.pageErrors],
  ];
  const probes = record.environment.probes.map(
    (/** @type {any} */ probe) => probe.name,
  );
  for (const [where, section] of recorded) {
    if (!isObject(section)) fail(`missing ${where}`);
    if (typeof section.recorder !== 'string' || section.recorder === '') {
      fail(`${where} records no recorder, so its measurement stands on prose`);
    }
    if (!section.recorder.includes('chrome-beta-nano')) {
      fail(
        `${where}.recorder is ${JSON.stringify(section.recorder)}, which names no driver`,
      );
    }
    if (where === 'terminals' || where === 'pageErrors') continue;
    if (
      !probes.some((/** @type {string} */ name) =>
        section.recorder.includes(name),
      )
    ) {
      fail(
        `${where}.recorder names no probe from environment.probes: ${JSON.stringify(section.recorder)}`,
      );
    }
  }

  const capture = record.capture;
  if (!isObject(capture)) {
    fail(
      'the record carries no capture block: it has never been re-derived behind the opt-in switch',
    );
  }
  if (capture.command !== ARMED_CAPTURE_COMMAND) {
    fail(
      `capture.command is ${JSON.stringify(capture.command)}; the armed form is ${JSON.stringify(ARMED_CAPTURE_COMMAND)}`,
    );
  }
  if (!String(capture.command).includes('M041_CAPTURE=1')) {
    fail('capture.command names no gate, so the capture is not opt-in');
  }
  if (capture.check !== CHECK_COMMAND) {
    fail(`capture.check is ${JSON.stringify(capture.check)}`);
  }
  if (capture.records !== RECORD_REL) {
    fail(`capture.records is ${JSON.stringify(capture.records)}`);
  }
  if (!isIsoTimestamp(capture[VOLATILE_CAPTURE_FIELD])) {
    fail(
      `capture.${VOLATILE_CAPTURE_FIELD} is ${String(capture[VOLATILE_CAPTURE_FIELD])}, not the time the file was written`,
    );
  }
  if (!Array.isArray(capture.remeasured) || capture.remeasured.length === 0) {
    fail('capture.remeasured is empty, so the record does not say what moved');
  }
}

/**
 * A held frame is open by construction: the recording's own statement that no terminal event
 * arrived, and no terminal event among the events it recorded (SC2, SC5). Checked before the
 * derivation, so a terminal smuggled into the held frame is named as that defect rather than as a
 * moved payload-key list.
 *
 * @param {any} record
 * @returns {void}
 */
function assertHeldIsOpen(record) {
  if (record.held?.inFlight?.hasTerminalEvent !== false) {
    fail('held.inFlight.hasTerminalEvent is not false');
  }
  for (const event of record.held?.inFlight?.events ?? []) {
    if (TERMINAL_CLASSES.has(event.class)) {
      fail(
        `held: a terminal event (${event.class}) is recorded while the navigation was held, so the frame is not a held navigation`,
      );
    }
  }
}

/**
 * The claims a page read settles and no committed artefact can: every recorded event keeps the key
 * set its class declares, the two route-config classes carry no id, a held frame carries no
 * terminal, and every absence keeps its verdict.
 *
 * @param {any} record
 * @param {ReturnType<typeof readEvidence>} [evidence]
 * @returns {void}
 */
function assertInternal(record, evidence = EVIDENCE) {
  const text = evidence.chunk;
  const routerEvent = classKeys(text, 'RouterEvent', []);
  const keysOf = new Map(
    eventClassNames(text)
      .filter((name) => name !== 'Scroll')
      .map((name) => [name, classKeys(text, name, routerEvent.keys).keys]),
  );
  for (const name of IDLESS_CLASSES) {
    for (const [frame, events] of Object.entries(allFrames(record))) {
      for (const event of events.filter(
        (/** @type {any} */ entry) => entry.class === name,
      )) {
        if (
          event.keys.includes('id') ||
          (isObject(event.payload) && 'id' in event.payload)
        ) {
          fail(
            `${frame}: ${name} carries an id, and those two events carry route and type only`,
          );
        }
      }
    }
  }
  for (const [frame, events] of Object.entries(allFrames(record))) {
    for (const event of events) {
      const declared = keysOf.get(event.class);
      if (declared === undefined) {
        fail(
          `${frame} records an event class the chunk does not declare: ${event.class}`,
        );
      }
      const where = `${frame}: the recorded ${event.class}`;
      if (JSON.stringify(event.keys) !== JSON.stringify(declared)) {
        fail(
          `${where} carries ${JSON.stringify(event.keys)} and the installed class declares ${JSON.stringify(declared)}`,
        );
      }
      if (isObject(event.payload)) {
        const payloadKeys = Object.keys(event.payload).sort();
        if (JSON.stringify(payloadKeys) !== JSON.stringify(declared)) {
          fail(
            `${where} payload keeps ${JSON.stringify(payloadKeys)} and the event carried ${JSON.stringify(declared)}, so it does not keep the keys the event carried and no others`,
          );
        }
      }
      if (typeof event.t !== 'number' || !Number.isFinite(event.t)) {
        fail(`${where} carries no receipt time`);
      }
    }
  }

  if (
    record.held?.inFlight?.eventCount !== record.held?.inFlight?.events?.length
  ) {
    fail(
      `held.inFlight.eventCount is ${record.held?.inFlight?.eventCount} and it holds ${record.held?.inFlight?.events?.length} event(s)`,
    );
  }
  if (record.warm?.eventCount !== record.warm?.events?.length) {
    fail(
      `warm.eventCount is ${record.warm?.eventCount} and it holds ${record.warm?.events?.length} event(s)`,
    );
  }
  if (record.superseded?.eventCount !== record.superseded?.events?.length) {
    fail(
      `superseded.eventCount is ${record.superseded?.eventCount} and it holds ${record.superseded?.events?.length} event(s)`,
    );
  }
  if (
    !Array.isArray(record.warm?.routeConfigLoads) ||
    record.warm.routeConfigLoads.length === 0
  ) {
    fail('warm.routeConfigLoads is empty, so no lazy boundary was measured');
  }
  for (const load of record.warm.routeConfigLoads) {
    if (typeof load.intervalMs !== 'number' || load.intervalMs < 0) {
      fail(
        `warm.routeConfigLoads[${load.routePath}].intervalMs is ${JSON.stringify(load.intervalMs)}`,
      );
    }
    if (Math.abs(load.endAt - load.startAt - load.intervalMs) > 0.0015) {
      fail(
        `warm.routeConfigLoads[${load.routePath}].intervalMs is ${load.intervalMs} and its own two timestamps differ by ${load.endAt - load.startAt}`,
      );
    }
  }
  if (!TERMINAL_CLASSES.has(record.warm?.terminal?.class)) {
    fail(
      `warm records no terminal event, so the completed navigation did not settle: ${JSON.stringify(record.warm?.terminal?.class)}`,
    );
  }

  for (const name of [
    'no-holder-recorded',
    'guard-verdict-not-recorded',
    'no-resolver-configured',
  ]) {
    const absence = record.absences?.[name];
    if (!isObject(absence)) fail(`missing absences['${name}']`);
    if (absence.named !== name) {
      fail(`absences['${name}'].named is ${JSON.stringify(absence.named)}`);
    }
    if (absence.verdict !== 'cannot-tell') {
      fail(
        `absences['${name}'].verdict is ${JSON.stringify(absence.verdict)}; the absence is cannot-tell`,
      );
    }
  }
  const holder = record.absences['no-holder-recorded'];
  if (
    !Array.isArray(holder.currentNavigationFieldsMatchingAWord) ||
    holder.currentNavigationFieldsMatchingAWord.length !== 0 ||
    !Array.isArray(holder.payloadFieldsMatchingAWord) ||
    holder.payloadFieldsMatchingAWord.length !== 0
  ) {
    fail(
      'no-holder-recorded: a payload field or a currentNavigation() field now names a holder, so SC3 must be re-measured',
    );
  }
  const guard = record.absences['guard-verdict-not-recorded'];
  if (typeof guard.shouldActivateValue !== 'boolean') {
    fail(
      `guard-verdict-not-recorded.shouldActivateValue is ${JSON.stringify(guard.shouldActivateValue)}`,
    );
  }

  // Every observed row says how many of its class were seen and in which frames; a count below one
  // or an empty frame list would make the observation a claim rather than a reading.
  for (const row of record.events?.classes ?? []) {
    if (typeof row.observed?.count !== 'number' || row.observed.count < 1) {
      fail(
        `events.classes[${row.name}].observed.count is ${JSON.stringify(row.observed?.count)}`,
      );
    }
    if (
      !Array.isArray(row.observed?.frames) ||
      row.observed.frames.length === 0
    ) {
      fail(`events.classes[${row.name}].observed.frames is empty`);
    }
    if (JSON.stringify(row.observed.keys) !== JSON.stringify(row.keys)) {
      fail(
        `events.classes[${row.name}].observed.keys is ${JSON.stringify(row.observed.keys)} and the installed chunk declares ${JSON.stringify(row.keys)}`,
      );
    }
  }
}

/**
 * The whole check of the recording: its shape, its internal claims, the canonical serialisation and
 * every value the derivation can settle. A disagreement fails naming the path, so a moved reading is
 * reported rather than absorbed.
 *
 * @param {any} record
 * @param {{ text?: string, evidence?: ReturnType<typeof readEvidence> }} [options]
 * @returns {any}
 */
function validateRecord(record, options = {}) {
  const evidence = options.evidence ?? EVIDENCE;
  assertShape(record);
  assertHeldIsOpen(record);
  const derived = derive(record, evidence);
  const against = divergence(record, merge(record, derived));
  if (against.length > 0) {
    fail(
      `the recording disagrees with this run's derivation at ${against.length} value(s): ${against.slice(0, 6).join('; ')}`,
    );
  }
  assertInternal(record, evidence);
  if (options.text !== undefined) assertCanonical(options.text, record);
  return record;
}

/**
 * The recording on disk must be the canonical serialisation of its own record, or a re-capture would
 * not reproduce these bytes. Stated as its own pin, so a byte-level drift reddens here naming the
 * drift instead of surfacing as a diff somewhere else.
 *
 * @param {string} text
 * @param {any} [record]
 * @returns {void}
 */
function assertCanonical(text, record = JSON.parse(text)) {
  const expected = canonical(record);
  if (text === expected) return;
  let at = 0;
  while (at < text.length && text[at] === expected[at]) at += 1;
  fail(
    `the recording is not the canonical serialisation of its record: the two agree for ${at} character(s) and then ${JSON.stringify(text.slice(at, at + 24))} sits where ${JSON.stringify(expected.slice(at, at + 24))} belongs`,
  );
}

// ------------------------------------------------------------------ the plan ----

/**
 * What an armed run would write, computed and never written: the merged record, the values that
 * moved, and the bytes. The write time is stamped only when a write happens, which is what makes two
 * armed runs byte-identical; `options.stampAlways` is the defect this shape invites — a stamp that
 * moves on every run — and is injected by a mutant so the pin that refuses it is proven live.
 *
 * @param {any} record
 * @param {string} at
 * @param {{ evidence?: ReturnType<typeof readEvidence>, stampAlways?: boolean }} [options]
 * @returns {{ moved: string[], bytes: string, at: unknown }}
 */
function plan(record, at, options = {}) {
  const derived = derive(record, options.evidence ?? EVIDENCE);
  const candidate = merge(record, derived);
  const moved = divergence(record, candidate);
  const stamp = options.stampAlways === true || moved.length > 0;
  if (stamp) candidate.capture[VOLATILE_CAPTURE_FIELD] = at;
  return {
    moved,
    bytes: canonical(candidate),
    at: candidate.capture[VOLATILE_CAPTURE_FIELD],
  };
}

/**
 * Two armed runs in a row: the first one's bytes are re-read and planned again, and the second must
 * be the same byte for byte. Two runs that agree is what idempotence means here.
 *
 * @param {any} record
 * @param {{ evidence?: ReturnType<typeof readEvidence>, stampAlways?: boolean }} [options]
 * @returns {{ first: string, second: string, moved: string[] }}
 */
function assertPlannedStable(record, options = {}) {
  const first = plan(record, 'the first armed run', options);
  const second = plan(JSON.parse(first.bytes), 'the second armed run', options);
  const drift = divergence(JSON.parse(first.bytes), JSON.parse(second.bytes));
  assert.equal(
    second.bytes,
    first.bytes,
    `a second armed run moves a byte, so the armed write is not canonical: ${drift.slice(0, 4).join('; ')}`,
  );
  assert.deepEqual(
    second.moved,
    [],
    `a second armed run reports ${second.moved.length} moved value(s) with nothing left to move: ${second.moved.slice(0, 4).join('; ')}`,
  );
  return { first: first.bytes, second: second.bytes, moved: first.moved };
}

// ------------------------------------------------------------- the capture ----

/**
 * The armed capture. Re-derive, compare, and write only what moved. A file that is current and
 * canonical is not touched at all, which is what makes two armed runs byte-identical.
 *
 * @param {string} path
 * @returns {{
 *   path: string, before: string, after: string, wrote: boolean,
 *   moved: string[], at: unknown,
 * }}
 */
function capture(path) {
  const text = readText(path, 'the recording has not been made');
  const before = sha256(text);
  const record = JSON.parse(text);
  const planned = plan(record, new Date().toISOString());
  const drift =
    text === canonical(record)
      ? []
      : ['the file is not the canonical serialisation of its record'];
  const moved = [...planned.moved, ...drift];
  if (moved.length === 0) {
    return {
      path,
      before,
      after: before,
      wrote: false,
      moved,
      at: record.capture?.[VOLATILE_CAPTURE_FIELD] ?? null,
    };
  }
  const bytes =
    drift.length > 0 && planned.moved.length === 0
      ? canonical(record)
      : planned.bytes;
  // Never write a record that would fail its own check.
  validateRecord(JSON.parse(bytes), { text: bytes });
  writeFileSync(path, bytes);
  return {
    path,
    before,
    after: sha256(readFileSync(path)),
    wrote: true,
    moved,
    at: JSON.parse(bytes).capture?.[VOLATILE_CAPTURE_FIELD] ?? null,
  };
}

// ----------------------------------------------------------- the claim list ----

/**
 * The numbered success criteria of the intent, read as `SC1`, `SC2`, ... with the same routine
 * scripts/overlay-verdict-claims.test.mjs uses, so a row cannot cite a criterion the milestone does
 * not declare and cannot paraphrase the one it does.
 *
 * @param {string} source
 * @returns {Record<string, string>}
 */
function intentCriteria(source) {
  const text = source.charCodeAt(0) === 0xfeff ? source.slice(1) : source;
  const heading = '## Success criteria';
  const at = text.indexOf(heading);
  if (at < 0) fail('INTENT.md must carry a "## Success criteria" section');
  const rest = text.slice(at + heading.length);
  const end = rest.indexOf('\n## ');
  const section = end >= 0 ? rest.slice(0, end) : rest;
  /** @type {Record<string, string>} */
  const criteria = {};
  /** @type {string[] | null} */
  let current = null;
  let currentId = '';
  const flush = () => {
    if (current) {
      criteria[currentId] = current.join(' ').replace(/\s+/g, ' ').trim();
    }
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
 * The claim list against the intent: every declared criterion ruled exactly once, each quoting its
 * own criterion character for character, each stating a reason, and either naming the parts a
 * required row owes or answering the charter's portal clause by name.
 *
 * @param {any} claims
 * @param {Record<string, string>} criteria
 * @returns {void}
 */
function assertClaims(claims, criteria) {
  if (!isObject(claims)) fail('the claim list is not an object');
  if (claims.milestone !== 'M041') {
    fail(`the claim list's milestone is ${JSON.stringify(claims.milestone)}`);
  }
  if (!Array.isArray(claims.claims) || claims.claims.length === 0) {
    fail('the claim list carries no claims array');
  }
  const seen = new Set();
  let required = 0;
  for (const row of claims.claims) {
    const where = row?.criterion ?? 'a row';
    if (!Object.hasOwn(criteria, row?.criterion ?? '')) {
      fail(`${where} is not a criterion the intent declares`);
    }
    if (seen.has(row.criterion)) fail(`${where} appears more than once`);
    seen.add(row.criterion);
    const expected = criteria[row.criterion] ?? '';
    const found = String(row.criterionText ?? '');
    if (found !== expected) {
      let at = 0;
      while (at < found.length && found[at] === expected[at]) at += 1;
      fail(
        `${where} does not quote the INTENT criterion character for character: the quote and the intent agree for ${at} character(s) and then ${JSON.stringify(found.slice(at, at + 24))} sits where ${JSON.stringify(expected.slice(at, at + 24))} belongs`,
      );
    }
    if (!RULINGS.includes(row.ruling)) {
      fail(
        `${where} must rule required or not-required, not ${JSON.stringify(row.ruling)}`,
      );
    }
    if (typeof row.reason !== 'string' || row.reason.trim() === '') {
      fail(`${where} must state a reason rather than leave the cell empty`);
    }
    if (row.ruling === 'not-required') {
      if (row.reason.trim().length < 60) {
        fail(
          `${where} must state why the charter's portal clause does not reach it, and ${row.reason.trim().length} character(s) is not a reason`,
        );
      }
      if (!/portal/i.test(row.reason)) {
        fail(`${where} must answer the charter's portal clause by name`);
      }
      continue;
    }
    required += 1;
    for (const field of [
      'source',
      'sourcePage',
      'route',
      'serve',
      'driver',
      'instance',
      'verdictPath',
    ]) {
      if (typeof row[field] !== 'string' || row[field].trim() === '') {
        fail(`${where} rules itself required and leaves ${field} empty`);
      }
    }
    if (!VERDICT_PATH.test(row.verdictPath)) {
      fail(`${where} must name the verdict path the wave gate cites`);
    }
    if (!Array.isArray(row.readings) || row.readings.length === 0) {
      fail(`${where} must name the readings that produce its facts`);
    }
    for (const reading of row.readings) {
      if (!READINGS.includes(reading)) {
        fail(
          `${where} names ${reading}, which is not one of the four readings`,
        );
      }
    }
  }
  const unruled = Object.keys(criteria).filter((id) => !seen.has(id));
  if (unruled.length > 0) {
    fail(
      `the intent declares ${Object.keys(criteria).length} criteria and the claim list rules ${seen.size}: ${unruled.join(', ')} dropped`,
    );
  }
  if (required === 0 && claims.driver !== undefined && claims.driver !== null) {
    fail(
      `a claim list with no required row must not name a driver, and this one names ${JSON.stringify(claims.driver)}`,
    );
  }
}

// --------------------------------------------------------- the read-only pins ----

const SHA_AT_LOAD = new Map(
  [RECORD_PATH, CLAIMS_PATH].map((path) => [
    path,
    existsSync(path) ? sha256(readFileSync(path)) : null,
  ]),
);

const EVIDENCE = readEvidence();

// ------------------------------------------------------------ the armed capture ----
//
// First, so an armed run captures before the default checks read the file back: the same checks then
// prove the freshly written recording still validates.

if (process.env.M041_CAPTURE === '1') {
  test('armed: re-derive, write only what moved, and a second run changes no byte', (t) => {
    const first = capture(RECORD_PATH);
    t.diagnostic(
      first.wrote
        ? `armed run wrote ${displayPath(first.path)}; moved: ${first.moved.slice(0, 8).join('; ')}`
        : 'armed run: nothing moved, nothing written',
    );
    assert.equal(
      first.after,
      sha256(readFileSync(first.path)),
      'the bytes the armed run reports are not the bytes on disk',
    );

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
    const text = readText(RECORD_PATH, 'no recording');
    assert.doesNotThrow(() => validateRecord(JSON.parse(text), { text }));
    assert.match(
      JSON.parse(text).reach.readFrom.cite,
      new RegExp(`^${AGENT_REL}:\\d+-\\d+$`),
      'the re-cut reach citation is not a line range in the agent',
    );
  });

  test('armed: the write path is live — a stale copy is corrected, then left alone', (t) => {
    mkdirSync(dirname(PROOF_COPY), { recursive: true });
    const stale = clone(JSON.parse(readText(RECORD_PATH, 'no recording')));
    stale.reach.readFrom.cite = `${AGENT_REL}:1-2`;
    stale.events.classes
      .find((/** @type {any} */ row) => row.name === 'NavigationStart')
      .keys.pop();
    writeFileSync(PROOF_COPY, canonical(stale));

    const first = capture(PROOF_COPY);
    assert.equal(first.wrote, true, 'the stale copy was not corrected');
    assert.ok(
      first.moved.join(' ').includes('reach.readFrom.cite'),
      `the correction did not name the stale citation; it named ${first.moved.join('; ')}`,
    );
    const repaired = JSON.parse(readText(PROOF_COPY, 'the proof copy'));
    assert.deepEqual(
      repaired.reach.readFrom.cite,
      JSON.parse(readText(RECORD_PATH, 'no recording')).reach.readFrom.cite,
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

// ------------------------------------------------------------ the default run ----

test('the recording still re-derives from the evidence this head carries', (t) => {
  const text = readText(RECORD_PATH, 'the measurement has not been recorded');
  const record = validateRecord(JSON.parse(text), { text });
  const bytes = readFileSync(RECORD_PATH);
  t.diagnostic(
    `recording ${RECORD_REL}: ${bytes.length} bytes, sha256 ${sha256(bytes)}; reach read from ${record.reach.readFrom.function} at ${record.reach.readFrom.cite}`,
  );
  assert.deepEqual(
    record.reach.readFrom,
    agentRouterRead(EVIDENCE.agent),
    'the recorded reach is not the read the widened agent performs',
  );
});

test('the recording is the canonical serialisation of its own record', () => {
  const text = readText(RECORD_PATH, 'the measurement has not been recorded');
  assertCanonical(text);
  const planned = plan(JSON.parse(text), 'a run that found nothing to move');
  assert.deepEqual(
    planned.moved,
    [],
    `the committed recording is ${planned.moved.length} value(s) behind the derivation: ${planned.moved.slice(0, 6).join('; ')}`,
  );
});

test('the claim list rules every criterion and quotes each one character for character', (t) => {
  const criteria = intentCriteria(
    readText(
      intentPathForMilestone(ROOT, 'M041'),
      'the intent is part of this repository',
    ),
  );
  const claims = JSON.parse(
    readText(CLAIMS_PATH, 'the claim list has not been written'),
  );
  assert.doesNotThrow(() => assertClaims(claims, criteria));
  t.diagnostic(
    `claim list ${CLAIMS_REL}: ${claims.claims.length} row(s) for ${Object.keys(criteria).length} declared criterion(s), ${claims.claims.reduce((sum, row) => sum + row.criterionText.length, 0)} quoted character(s)`,
  );
});

// -------------------------------------------------- the intent that answers ----

/**
 * The intent that answers for the milestone `.project/STATE.md` binds, asked of the shared resolver
 * rather than spelled here: the archive-or-live decision lives in `scripts/verdict-claims-intent.mjs`
 * and this suite reads the file at that answer. Named here so a test can prove what the resolver does
 * *not* answer with — and asked rather than hardcoded, because M044's archive-path check reddens a
 * suite that reads the live `.project` name directly: the ship flow deletes it.
 *
 * @returns {string} the absolute path of the intent that answers for the bound milestone
 */
function currentIntent() {
  return intentPathForMilestone(ROOT, boundMilestone());
}

/** M040's own intent, which is the archive's copy: the milestone has shipped and cannot be current. */
const M040_INTENT = join(
  ROOT,
  '.project',
  'archive',
  '040-performance-narrator',
  'intent',
  'INTENT.md',
);

/** M041's own intent, which is the archive's copy: the milestone has shipped and cannot be current. */
const M041_INTENT = join(
  ROOT,
  '.project',
  'archive',
  '041-navigation-blocking',
  'intent',
  'INTENT.md',
);

/**
 * The milestone `.project/STATE.md` binds, read the way the resolver reads it: the binding is the
 * branch line. A suite that hard-codes which milestone is current reddens the moment the next one
 * starts, so the checks below ask STATE which it binds and print the answer in every message.
 *
 * @returns {string} `M042`-shaped
 */
function boundMilestone() {
  const state = readText(join(ROOT, '.project', 'STATE.md'), 'STATE.md');
  const branch = /^branch:\s*(\S+)\s*$/m.exec(state)?.[1] ?? '';
  const number = /^gsd-path\/M(\d{3})$/.exec(branch)?.[1];
  assert.ok(
    number !== undefined,
    `STATE.md must bind a milestone on its branch line; it binds ${JSON.stringify(branch)}`,
  );
  return `M${number}`;
}

/**
 * Hold a claim list to the intent at `path`, character for character, and answer the criteria it
 * declares. A path the resolver never checked fails here by name, so an answer is only an answer
 * once the file on disk is the one whose words the claims quote.
 *
 * @param {string} path
 * @param {string} claimsPath
 * @returns {Record<string, string>}
 */
function heldTo(path, claimsPath) {
  const criteria = intentCriteria(readText(path, 'the resolved intent'));
  const claims = JSON.parse(
    readText(claimsPath, 'the claim list has not been written'),
  );
  for (const row of claims.claims) {
    assert.equal(
      row.criterionText,
      criteria[row.criterion],
      `${row.criterion} of ${displayPath(claimsPath)} is not what ${displayPath(path)} declares`,
    );
  }
  return criteria;
}

/**
 * What the resolver answered: the path it returned, or the error it raised. Returning the error rather
 * than letting `assert.throws` swallow it is what lets a mutant's answer be printed in the failure, so
 * a resolver that fell back fails with the path it fell back to in the message.
 *
 * @param {string} root
 * @param {string} milestone
 * @returns {string | Error}
 */
function answeredOrRaised(root, milestone) {
  try {
    return intentPathForMilestone(root, milestone);
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

test('the intent follows the milestone its claims are numbered for, through every token', () => {
  for (const token of ['M040', '040', '40']) {
    assert.equal(
      intentPathForMilestone(ROOT, token),
      M040_INTENT,
      `${token} must resolve to M040's own archive`,
    );
  }
  for (const token of ['M041', '041', '41']) {
    assert.equal(
      intentPathForMilestone(ROOT, token),
      M041_INTENT,
      `${token} must resolve to M041's own archive, which is where M041's claims are held`,
    );
    assert.notEqual(
      intentPathForMilestone(ROOT, token),
      currentIntent(),
      `${token} is archived, so it must never read whoever is current`,
    );
  }
  // The live intent answers only for the milestone STATE.md binds, so it is asked by the number
  // STATE binds rather than by a literal that goes stale the moment the next milestone starts.
  const bound = boundMilestone();
  const digits = bound.slice(1);
  for (const token of [bound, digits, String(Number(digits))]) {
    assert.equal(
      intentPathForMilestone(ROOT, token),
      currentIntent(),
      `${token} must resolve to the intent this checkout carries as current, which STATE.md binds to ${bound}`,
    );
  }
  // The answer is a file on disk the suite reads, not a path the resolver merely assembled: without
  // this the two equalities above would hold for a path no one can open.
  assert.ok(
    existsSync(currentIntent()),
    `the intent that answers for ${bound} must be a file on disk: ${currentIntent()}`,
  );
  // The defect this resolver removes: an archived milestone never reads whoever is current.
  assert.notEqual(intentPathForMilestone(ROOT, 'M040'), currentIntent());
});

test('each answer is the file its own claim list quotes, checked on disk', () => {
  heldTo(
    intentPathForMilestone(ROOT, 'M040'),
    join(ROOT, 'research', 'raw', 'm040-verdict-claims.json'),
  );
  heldTo(intentPathForMilestone(ROOT, 'M041'), CLAIMS_PATH);

  // A resolver that returns a path it never checked answers with a file that is not there, and the
  // quote comparison is what turns that into a failure naming the path rather than a silent pass.
  const unchecked = (root, milestone) =>
    join(
      root,
      '.project',
      'archive',
      `${milestone}-milestone`,
      'intent',
      'INTENT.md',
    );
  assert.equal(
    existsSync(unchecked(ROOT, '041')),
    false,
    'the unchecked answer must be a path no one checked',
  );
  assert.throws(
    () => heldTo(unchecked(ROOT, '041'), CLAIMS_PATH),
    /is missing — the resolved intent/,
    'an answer that was never checked must redden, naming the path it returned',
  );
});

test('the resolver refuses rather than falling back, and every refusal names its paths', () => {
  const scratch = join(ROOT, 'tmp', 'm041-intent-scratch');
  const archiveIntent = join(
    scratch,
    '.project',
    'archive',
    '040-missing-intent',
    'intent',
    'INTENT.md',
  );
  const live = join(scratch, '.project', 'intent', 'INTENT.md');

  try {
    rmSync(scratch, { recursive: true, force: true });
    mkdirSync(join(scratch, '.project', 'archive', '040-missing-intent'), {
      recursive: true,
    });
    mkdirSync(join(scratch, '.project', 'intent'), { recursive: true });
    copyFileSync(
      join(ROOT, '.project', 'STATE.md'),
      join(scratch, '.project', 'STATE.md'),
    );
    copyFileSync(currentIntent(), live);

    // The fallback this repair exists to refuse, stated as the mutant it is: a resolver that reads the
    // live intent when the archive carries none. It answers, which is why nothing may implement it.
    const fallingBack = (root) => join(root, '.project', 'intent', 'INTENT.md');
    assert.equal(fallingBack(scratch), live);
    assert.ok(
      existsSync(fallingBack(scratch)),
      'the fallback must be reachable for the refusal to be the thing that stops it',
    );

    // What the resolver answered, so a fallback is compared and printed rather than reported as an
    // unattributed "missing expected exception".
    const fallback = answeredOrRaised(scratch, '040');
    assert.ok(
      fallback instanceof Error,
      `M040 must raise rather than answer: a resolver that fell back returned ${String(fallback)}, which holds M040's claims to M041's words`,
    );
    assert.match(
      fallback.message,
      /M040/,
      'the refusal must name the milestone it was asked about',
    );
    assert.ok(
      fallback.message.includes(archiveIntent),
      `the refusal must name the path it tried: ${archiveIntent}`,
    );
    assert.ok(
      fallback.message.includes(live),
      'the refusal must name the live intent it refused to fall back to',
    );

    // Neither archived nor bound: the live intent belongs to the milestone STATE.md binds (the
    // scratch copies this head's STATE.md), so the one after it answers for nothing and raises.
    const bound = boundMilestone();
    const background = `M${String(Number(bound.slice(1)) + 1).padStart(3, '0')}`;
    const unbound = answeredOrRaised(scratch, background);
    assert.ok(
      unbound instanceof Error,
      `${background} must raise rather than answer: a resolver that answered with ${String(unbound)} would hold one milestone's claims to another milestone's words`,
    );
    assert.ok(
      unbound.message.includes(background),
      'the refusal must name the milestone it was asked about',
    );
    assert.ok(
      unbound.message.includes(live),
      'the refusal must name the live intent it tried',
    );
    assert.ok(
      unbound.message.includes(`belongs to ${bound}`),
      'the refusal must say which milestone the live intent does belong to',
    );

    // A token that names no milestone is the same refusal, with the paths it would have tried.
    assert.throws(
      () => intentPathForMilestone(scratch, 'not-a-milestone'),
      /a milestone token is M040, 040 or 40/,
      'a token that names no milestone must raise',
    );
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

test('no claims suite decides the archive-or-live question for itself', () => {
  // Assembled so this check does not find its own needles in this file.
  const importer = ["from '", './verdict-claims-intent.mjs'].join('');
  const slash = ['intent', 'INTENT.md'].join('/');
  const fromResolver = new RegExp(
    [
      'intentCriteria\\(',
      '\\s*(?:readText\\()?\\s*',
      'intentPathForMilestone\\(',
    ].join(''),
  );
  const removed = [
    ['INTENT', '_PATH'].join(''),
    ['INTENT', '_REL'].join(''),
    ['function ', 'intentPath('].join(''),
  ];

  for (const suite of [
    'performance-capture.test.mjs',
    'navigation-capture.test.mjs',
    'overlay-verdict-claims.test.mjs',
  ]) {
    const source = readText(join(HERE, suite), 'every claims suite ships here');

    assert.ok(
      source.includes(importer),
      `${suite} must import the shared resolver rather than decide for itself`,
    );
    // The criteria a claim list is held to are read from the resolver, not from a path assembled here.
    assert.match(
      source,
      fromResolver,
      `${suite} must read its criteria from the shared resolver, which is the one place the archive-or-live decision is written`,
    );
    for (const name of removed) {
      assert.equal(
        source.includes(name),
        false,
        `${suite} carries ${JSON.stringify(name)} again; a suite may not keep the live intent as a constant of its own`,
      );
    }
    assert.equal(
      source.includes(slash),
      false,
      `${suite} spells the live intent as ${JSON.stringify(slash)}; the archive-or-live decision lives in one file`,
    );
  }
});

test('every file this suite would write is named, and the recording is the only one', () => {
  assert.equal(WOULD_WRITE.length, 1, 'the file list must name what it writes');
  assert.equal(WOULD_WRITE[0]?.path, RECORD_PATH);
  const shown = displayPath(WOULD_WRITE[0]?.path ?? '');
  assert.ok(
    shown.startsWith('research/raw/') || shown.startsWith('tmp/'),
    `${shown} is outside the two places this suite may write`,
  );
  const source = readText(SELF_PATH, 'this file');
  // Assembled so this check does not find its own needles.
  const gate = source.indexOf(
    ['if (process.env.M041', "_CAPTURE === '1') {"].join(''),
  );
  assert.notEqual(gate, -1, 'the arming gate is not in this file');
  assert.ok(
    source.includes(
      ['const ARMED = process.env.M041', "_CAPTURE === '1';"].join(''),
    ),
    'the switch does not read the variable the gate arms',
  );
  // Every call that hands the capture a path to write must sit behind the gate.
  let calls = 0;
  for (const argument of ['RECORD', 'PROOF_COPY']) {
    const call = ['capture(', argument].join('');
    let at = source.indexOf(call);
    while (at !== -1) {
      calls += 1;
      assert.ok(
        at > gate,
        `${call} is called outside the M041_CAPTURE gate, so a default run would not be read-only`,
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

test('no derived value is pinned as a literal in this suite', () => {
  const source = readText(SELF_PATH, 'this file');
  // Assembled so this check does not find its own needles.
  const needles = [
    ['Chro', 'me/'].join(''),
    ['22.', '1.', '8'].join(''),
    ['10', '75'].join(''),
    ['12', '53'].join(''),
    ['17', '50'].join(''),
    ['18', '39'].join(''),
    ['Environment ', 'Injector'].join(''),
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

// ---------------------------------------------------------------- mutants ----

/**
 * The untouched artefact passes the pin first, then one anchored mutation of it must redden the pin
 * with a failure that names the defect. A mutant that survives, or that cannot fail, fails this
 * suite.
 *
 * @param {() => any} load
 * @param {(value: any) => unknown} pin
 * @param {Array<{ what: string, mutate: (value: any) => void, message: RegExp }>} mutants
 * @returns {void}
 */
function proveNonVacuous(load, pin, mutants) {
  assert.doesNotThrow(
    () => pin(load()),
    'the untouched artefact must pass first',
  );
  for (const mutant of mutants) {
    const copy = clone(load());
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
    what: 'M1 a class key set the installed chunk does not declare',
    mutate: (record) => {
      record.events.classes
        .find((row) => row.name === 'NavigationEnd')
        .keys.push('cause');
    },
    message: /events\.classes\[NavigationEnd\]\.keys/,
  },
  {
    what: 'M2 a moved EventType number',
    mutate: (record) => {
      record.events.classes.find(
        (row) => row.name === 'NavigationCancel',
      ).type = 7;
    },
    message: /events\.classes\[NavigationCancel\]\.type/,
  },
  {
    what: 'M3 a class citation pointing at another line range',
    mutate: (record) => {
      record.events.classes.find(
        (row) => row.name === 'GuardsCheckEnd',
      ).declaredAt = `${CHUNK_REL}:1-2`;
    },
    message: /events\.classes\[GuardsCheckEnd\]\.declaredAt/,
  },
  {
    what: 'M4 a cancellation code claimed as produced by a run that did not produce it',
    mutate: (record) => {
      const row = record.events.codes.cancellation.find(
        (entry) => entry.name === 'GuardRejected',
      );
      row.producedByARun = true;
      row.producedBy = { frame: 'superseded', t: 1, reason: 'refused' };
    },
    message: /events\.codes\.cancellation\[GuardRejected\]/,
  },
  {
    what: 'M5 the reach path re-cited to a range the agent does not occupy',
    mutate: (record) => {
      record.reach.readFrom.cite = `${AGENT_REL}:1-2`;
    },
    message: /reach\.readFrom\.cite/,
  },
  {
    what: 'M6 the reach read named by another function',
    mutate: (record) => {
      record.reach.readFrom.function = 'handleDiQuery';
    },
    message: /reach\.readFrom\.function/,
  },
  {
    what: 'M7 a currentNavigation() field list missing a field the chunk sets',
    mutate: (record) => {
      record.absences['no-holder-recorded'].currentNavigationFields.pop();
    },
    message: /currentNavigationFields/,
  },
  {
    what: 'M8 a guard name the fixture does not carry',
    mutate: (record) => {
      record.guards.fixture.canActivateNames = ['anonymousGuard'];
    },
    message: /guards\.fixture\.canActivateNames/,
  },
  {
    what: 'M9 a guard-verdict field the aggregate does not add',
    mutate: (record) => {
      record.absences['guard-verdict-not-recorded'].guardFieldsInThatPayload = [
        'shouldActivate',
        'guardName',
      ];
    },
    message: /guardFieldsInThatPayload/,
  },
  {
    what: 'M10 a terminal payload keeping a key its event did not carry',
    mutate: (record) => {
      record.terminals.cancel.event.payload.holder = 'guard';
    },
    message:
      /terminals\.cancel.*does not keep the keys the event carried and no others/,
  },
  {
    what: 'M11 a route-config load start given an id it does not carry',
    mutate: (record) => {
      const start = record.warm.events.find((event) => event.type === 9);
      start.keys = ['id', 'route', 'type'];
      start.payload.id = start.payload.route.path;
    },
    message: /RouteConfigLoadStart carries an id/,
  },
  {
    what: 'M12 a held frame given a terminal event',
    mutate: (record) => {
      record.held.inFlight.events.push({
        t: 1,
        type: 1,
        class: 'NavigationEnd',
        keys: ['id', 'type', 'url', 'urlAfterRedirects'],
        payload: { id: 2, type: 1, url: '/home', urlAfterRedirects: '/home' },
      });
    },
    message: /terminal event .*while the navigation was held/,
  },
  {
    what: 'M13 a capture command that names no gate',
    mutate: (record) => {
      record.capture.command = CHECK_COMMAND;
    },
    message: /capture\.command/,
  },
  {
    what: 'M14 a write time that is not a timestamp',
    mutate: (record) => {
      record.capture[VOLATILE_CAPTURE_FIELD] = 'yesterday';
    },
    message: /capture\.at/,
  },
  {
    what: 'M15 the capture block dropped',
    mutate: (record) => {
      delete record.capture;
    },
    message: /no capture block|never been re-derived/,
  },
  {
    what: 'M16 the record attributed to another task',
    mutate: (record) => {
      record.task = 'T005';
    },
    message: /recording task/,
  },
  {
    what: 'M17 the router version moved behind the record',
    mutate: (record) => {
      record.environment.router.version = '0.0.0';
    },
    message: /environment\.router\.version/,
  },
];

test('every derived value is pinned non-vacuously: the record passes, a mutant reddens it', () => {
  proveNonVacuous(
    () =>
      JSON.parse(
        readText(RECORD_PATH, 'the measurement has not been recorded'),
      ),
    (record) => validateRecord(record),
    MUTANTS,
  );
});

test('mutant: a recording that drifts from its canonical serialisation reddens naming the drift', () => {
  const text = readText(RECORD_PATH, 'the measurement has not been recorded');
  assert.doesNotThrow(
    () => assertCanonical(text),
    'the untouched bytes must pass first',
  );

  const drifted = text.replace(
    '"schema": "m041-navigation/v1",',
    '"schema":  "m041-navigation/v1",',
  );
  assert.notEqual(drifted, text, 'the mutation must change the bytes');
  assert.throws(
    () => assertCanonical(drifted),
    /is not the canonical serialisation of its record: the two agree for \d+ character\(s\)/,
    'one added space must redden the canonical pin and name where the bytes part',
  );

  assert.throws(
    () => assertCanonical(`${text} `),
    /not the canonical serialisation/,
    'a trailing byte must redden the canonical pin',
  );

  // The same defect through the armed plan: a file that is not canonical is rewritten, and the
  // rewrite is the canonical serialisation of the same record.
  const record = JSON.parse(text);
  const planned = plan(record, 'a run that found nothing to move');
  assert.deepEqual(
    planned.moved,
    [],
    'the untouched record must plan with nothing to move',
  );
});

test('mutant: a claim whose quoted criterion differs from INTENT by one character reddens naming the character', () => {
  const criteria = intentCriteria(
    readText(
      intentPathForMilestone(ROOT, 'M041'),
      'the intent is part of this repository',
    ),
  );
  const claims = JSON.parse(
    readText(CLAIMS_PATH, 'the claim list has not been written'),
  );
  assert.doesNotThrow(
    () => assertClaims(claims, criteria),
    'the untouched list must pass first',
  );

  const row = claims.claims.find((candidate) => candidate.criterion === 'SC2');
  const original = row.criterionText;
  const anchor = 'as the stage reached';
  const at = original.indexOf(anchor);
  assert.ok(
    at > 0,
    'the criterion must carry the phrase this mutation anchors on',
  );
  row.criterionText = `${original.slice(0, at)}as the stage reachéd${original.slice(at + anchor.length)}`;
  assert.notEqual(
    row.criterionText,
    original,
    'the mutation must change the quote',
  );
  assert.equal(
    row.criterionText.length,
    original.length,
    'the mutation must move one character and no other',
  );
  assert.throws(
    () => assertClaims(claims, criteria),
    /SC2 does not quote the INTENT criterion character for character: the quote and the intent agree for \d+ character\(s\)/,
    'a one-character drift must redden the quote pin and name the character it starts at',
  );

  // A row that silently drops a criterion is the same defect in the other direction.
  const dropped = JSON.parse(
    readText(CLAIMS_PATH, 'the claim list has not been written'),
  );
  dropped.claims = dropped.claims.filter(
    (candidate) => candidate.criterion !== 'SC4',
  );
  assert.throws(
    () => assertClaims(dropped, criteria),
    /rules 5: SC4 dropped/,
    'a dropped criterion must redden the list pin and name the criterion',
  );
});

test('mutant: an armed write that stamps its time on every run moves a byte on the second run', () => {
  const record = JSON.parse(
    readText(RECORD_PATH, 'the measurement has not been recorded'),
  );
  assert.doesNotThrow(
    () => assertPlannedStable(record),
    'the untouched record must plan byte-stably first',
  );
  assert.throws(
    () => assertPlannedStable(record, { stampAlways: true }),
    /a second armed run moves a byte.*capture\.at/,
    'a write time that moves on every run must redden the idempotence pin and name the field',
  );
});

test('the derivation moves when its evidence moves', () => {
  const record = JSON.parse(
    readText(RECORD_PATH, 'the measurement has not been recorded'),
  );
  const cases = [
    {
      what: 'a class the installed chunk no longer declares',
      mutate: (/** @type {any} */ evidence) => {
        evidence.chunk = evidence.chunk.replace(
          /\nclass NavigationSkipped /,
          '\nclass NavigationSkippedGone ',
        );
      },
      path: 'events.classes',
      message: /missing/,
    },
    {
      what: 'an enum value moved',
      mutate: (/** @type {any} */ evidence) => {
        evidence.chunk = evidence.chunk.replace(
          'NavigationCancellationCode[NavigationCancellationCode["GuardRejected"] = 3]',
          'NavigationCancellationCode[NavigationCancellationCode["GuardRejected"] = 9]',
        );
      },
      path: 'events.codes.cancellation[GuardRejected]',
      message: /GuardRejected/,
    },
    {
      what: 'the agent function that reads the Router moved down the file',
      mutate: (/** @type {any} */ evidence) => {
        evidence.agent = `\n\n${evidence.agent}`;
      },
      path: 'reach.readFrom.cite',
      message: /reach\.readFrom\.cite/,
    },
    {
      what: 'the fixture guard renamed',
      mutate: (/** @type {any} */ evidence) => {
        evidence.guard = evidence.guard.replace(
          /export const [A-Za-z_$][\w$]*: CanActivateFn/,
          'export const renamedGuard: CanActivateFn',
        );
      },
      path: 'guards.fixture.canActivateNames',
      message: /canActivateNames/,
    },
    {
      what: 'the installed router version moved',
      mutate: (/** @type {any} */ evidence) => {
        evidence.routerVersion = '0.0.0';
      },
      path: 'environment.router.version',
      message: /router\.version/,
    },
  ];
  for (const item of cases) {
    const evidence = clone(EVIDENCE);
    item.mutate(evidence);
    let moved = '';
    try {
      moved = divergence(record, merge(record, derive(record, evidence))).join(
        ' ',
      );
    } catch (error) {
      moved = String(error);
    }
    assert.match(
      moved,
      item.message,
      `${item.what} must move ${item.path}; the derivation said ${moved || 'nothing'}`,
    );
    assert.ok(
      moved.includes(item.path) || moved.includes(item.message.source),
      `${item.what} must move ${item.path}; the derivation said ${moved || 'nothing'}`,
    );
  }
});

// A default run must not touch either artefact: both hash the same at the end of the run as at its
// start, which is what makes two default runs identical.
if (process.env.M041_CAPTURE !== '1') {
  test('this run wrote nothing: the recording and the claim list hash the same before and after', (t) => {
    for (const path of [RECORD_PATH, CLAIMS_PATH]) {
      const before = SHA_AT_LOAD.get(path);
      const shown = displayPath(path);
      assert.notEqual(before, null, `${shown} is missing`);
      assert.equal(
        existsSync(path) ? sha256(readFileSync(path)) : null,
        before,
        `${shown} changed during a default run`,
      );
      t.diagnostic(`${shown}: sha256 ${before} before and after the run`);
    }
  });
}
