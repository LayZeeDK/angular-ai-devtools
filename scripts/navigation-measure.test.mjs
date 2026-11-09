// @ts-check
//
// M041 T001 — the navigation stream, its stages and the three absences, re-derived at
// this head.
//
// The four questions this file settles:
//
//   events  Which event classes the installed `@angular/router` can put on its stream,
//           what each class's own key set is, and which cancellation and skipped codes
//           it declares. The reader below derives all three from the installed chunk's
//           own class declarations and enums; the recording only holds what the same
//           reader found, so a moved or renamed class reddens this file instead of
//           leaving a stale key set beside a stale sentence.
//   reach   Whether the page agent can reach the `Router` through its own read —
//           `getInjector` on the host element, then `ɵgetInjectorResolutionPath` — and
//           which entry holds its token. The reader parses the agent's own Router read,
//           `routerTokenFrom` through the end of `routerSubscribe`, so the recorded path
//           cannot drift from the code that performs it.
//   held    What a navigation that has not ended looks like: a start and a stage, no
//           terminal event, and a `currentNavigation()` field list the chunk itself
//           declares. The held frame is checked for internal consistency, never
//           repaired.
//   absent  The three absences this milestone is written on — `no-holder-recorded`,
//           `guard-verdict-not-recorded`, `no-resolver-configured` — each read from the
//           payload that does not contain it, plus the fixture's one named guard, whose
//           name is re-derived from its own file.
//
// Read-only: no build, no browser, no page, no write. The measurement itself belongs to
// the recording's provenance (`commands`), and its repetition is a later task's armed
// capture.
//
// Run the checks:
//   node --experimental-strip-types --test scripts/navigation-measure.test.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SELF_PATH = fileURLToPath(import.meta.url);

const RECORD_REL = 'research/raw/m041-navigation.json';
const RECORD_PATH = join(ROOT, 'research', 'raw', 'm041-navigation.json');
const CHUNK_REL = 'node_modules/@angular/router/fesm2022/_router-chunk.mjs';
const CHUNK_PATH = join(
  ROOT,
  'node_modules',
  '@angular',
  'router',
  'fesm2022',
  '_router-chunk.mjs',
);
const ROUTER_TYPES_REL =
  'node_modules/@angular/router/types/_router_module-chunk.d.ts';
const ROUTER_TYPES_PATH = join(
  ROOT,
  'node_modules',
  '@angular',
  'router',
  'types',
  '_router_module-chunk.d.ts',
);
const ROUTER_MANIFEST_PATH = join(
  ROOT,
  'node_modules',
  '@angular',
  'router',
  'package.json',
);
const AGENT_REL = 'extension/agent-main.js';
const AGENT_PATH = join(ROOT, 'extension', 'agent-main.js');
const GUARD_FILE_REL = 'spikes/ng222-app/src/app/redirect-guard.ts';
const GUARD_FILE_PATH = join(
  ROOT,
  'spikes',
  'ng222-app',
  'src',
  'app',
  'redirect-guard.ts',
);

/** The sixteen classes this milestone's stream is written on. */
const ENUMERATED = [
  'NavigationStart',
  'RouteConfigLoadStart',
  'RouteConfigLoadEnd',
  'RoutesRecognized',
  'GuardsCheckStart',
  'GuardsCheckEnd',
  'ResolveStart',
  'ResolveEnd',
  'ChildActivationStart',
  'ActivationStart',
  'ActivationEnd',
  'ChildActivationEnd',
  'NavigationEnd',
  'NavigationCancel',
  'NavigationError',
  'NavigationSkipped',
];

/** The four terminal classes: an event of one of these ends a navigation. */
const TERMINAL_TYPES = [1, 2, 3, 16];

/** The two stream classes that carry no navigation id, by declaration. */
const IDLESS_CLASSES = ['RouteConfigLoadStart', 'RouteConfigLoadEnd'];

/** The words no payload key and no `currentNavigation()` field may carry. */
const HOLDER_WORDS = ['guard', 'resolver', 'chunk', 'task', 'holder'];

const CITATION = /^([^:]+):(\d+)-(\d+)$/;

// ---------------------------------------------------------------- helpers ----

function fail(message) {
  throw new Error(message);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function requireFile(path, why) {
  assert.ok(existsSync(path), `${path} is missing — ${why}`);
  return path;
}

function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

function clone(record) {
  return JSON.parse(JSON.stringify(record));
}

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
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

function citationLines(citation, where) {
  const match = CITATION.exec(citation ?? '');
  if (match === null) fail(`${where} is not a \`path:start-end\` citation`);
  const start = Number(match[2]);
  const end = Number(match[3]);
  if (start < 1 || end < start) fail(`${where} is not a line range`);
  return { path: match[1], start, end };
}

function lineCount(text) {
  return text.split('\n').length;
}

function lineOfIndex(text, index) {
  return text.slice(0, index).split('\n').length;
}

// ------------------------------------------------- the readers (derivation) ----

function loadChunk() {
  requireFile(CHUNK_PATH, 'run npm ci');
  return readFileSync(CHUNK_PATH, 'utf8');
}

/**
 * One enum's members, by name and number, from the IIFE the shipped chunk executes.
 * A declaration file would not prove what the page runs; this does.
 */
function readEnum(text, name) {
  const start = text.indexOf(`var ${name};`);
  if (start === -1) fail(`${CHUNK_REL} declares no \`var ${name};\``);
  const end = text.indexOf(`})(${name} ||`, start);
  if (end === -1) fail(`${CHUNK_REL} closes no ${name} IIFE`);
  const pattern = new RegExp(
    `${name}\\[${name}\\["([A-Za-z]+)"\\] = (\\d+)\\] = "([A-Za-z]+)";`,
    'g',
  );
  const values = [];
  let match;
  while ((match = pattern.exec(text.slice(start, end))) !== null) {
    if (match[1] !== match[3]) {
      fail(
        `${CHUNK_REL} declares ${match[1]} as ${match[3]}, so the reader cannot trust the ${name} block`,
      );
    }
    values.push({ name: match[1], value: Number(match[2]) });
  }
  if (values.length === 0) fail(`${CHUNK_REL} declares no ${name} member`);
  return values;
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
 * `type = EventType.<Name>` field, and — for a class that extends `RouterEvent` — the
 * base constructor's own assignments.
 */
function classKeys(text, name, baseKeys) {
  const block = classBlock(text, name);
  const extendsRouterEvent = /extends RouterEvent\b/.test(block.body);
  const keys = new Set(extendsRouterEvent ? baseKeys : []);
  for (const match of block.body.matchAll(/this\.([A-Za-z_$][\w$]*)\s*=/g)) {
    keys.add(match[1]);
  }
  const typeField = /^\s*type\s*=\s*EventType\.([A-Za-z]+);/m.exec(block.body);
  if (typeField !== null) keys.add('type');
  return {
    keys: [...keys].sort(),
    extendsRouterEvent,
    typeName: typeField === null ? null : typeField[1],
    ...block,
  };
}

/** The keys of the object literal the router hands to `currentNavigation`. */
function currentNavigationFields(text) {
  const setAt = text.indexOf('this.currentNavigation.set({');
  if (setAt === -1) {
    fail(`${CHUNK_REL} has no \`this.currentNavigation.set({\` site`);
  }
  const open = text.indexOf('{', setAt);
  let depth = 0;
  let close = open;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    else if (text[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        close = i;
        break;
      }
    }
  }
  const literal = text.slice(open, close);
  const keys = [];
  let level = 0;
  for (const raw of literal.split('\n')) {
    const line = raw.trim();
    if (level === 1) {
      const match = /^([A-Za-z_$][\w$]*)\s*:/.exec(line);
      if (match !== null) keys.push(match[1]);
    }
    level +=
      (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
  }
  if (keys.length === 0) {
    fail(`${CHUNK_REL} sets currentNavigation with an empty object literal`);
  }
  const updates = [];
  const pattern = /this\.currentNavigation\.update\(nav => \{/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const block = text.slice(match.index, text.indexOf('});', match.index));
    const fields = [...block.matchAll(/nav\.([A-Za-z_$][\w$]*)\s*=/g)].map(
      (entry) => entry[1],
    );
    updates.push([...new Set(fields)].sort());
  }
  const setFields = [...new Set(keys)].sort();
  const updateFields = [...new Set(updates.flat())].sort();
  return {
    setAtLine: lineOfIndex(text, setAt),
    setFields,
    updateFields,
    addedLater: updateFields.filter((field) => !setFields.includes(field)),
  };
}

/**
 * The page agent's own Router read, and the lines it sits on: from `routerTokenFrom` — the read the
 * widened agent performs for the Router, which walks the injector resolution path and takes the
 * token from each provider record — through the end of `routerSubscribe`, where the four ɵ lookups
 * are feature-detected and the stream is subscribed. T001 cited `handleDiQuery`, which performed the
 * same read before the agent carried one of its own; T005's re-capture moved the citation to the code
 * the shipped agent runs.
 */
function agentRouterRead() {
  requireFile(AGENT_PATH, 'the page agent is part of this repository');
  const text = readFileSync(AGENT_PATH, 'utf8');
  const start = text.indexOf('function routerTokenFrom(');
  if (start === -1) {
    fail(`${AGENT_REL} declares no \`function routerTokenFrom(\``);
  }
  const subscribe = text.indexOf('function routerSubscribe(', start);
  if (subscribe === -1) {
    fail(`${AGENT_REL} declares no \`function routerSubscribe(\``);
  }
  const end = text.indexOf('\n  }\n', subscribe);
  if (end === -1) fail(`${AGENT_REL} never closes routerSubscribe`);
  return {
    body: text.slice(start, end),
    startLine: lineOfIndex(text, start),
    endLine: lineOfIndex(text, end),
  };
}

/** The name the fixture's one `canActivate` function carries. */
function fixtureGuardName() {
  requireFile(GUARD_FILE_PATH, 'the fixture is part of this repository');
  const text = readFileSync(GUARD_FILE_PATH, 'utf8');
  const match = /export const ([A-Za-z_$][\w$]*):\s*CanActivateFn/m.exec(text);
  if (match === null) {
    fail(
      `${GUARD_FILE_REL} declares no \`export const <name>: CanActivateFn\``,
    );
  }
  return { name: match[1], source: text.trim() };
}

/** The one construction site of `NavigationError`, and what it passes as `target`. */
function navigationErrorSite() {
  const text = loadChunk();
  const at = text.indexOf('new NavigationError(');
  if (at === -1) fail(`${CHUNK_REL} constructs no NavigationError`);
  const call = text.slice(at, text.indexOf('\n', at));
  if (!/targetSnapshot \?\? undefined/.test(call)) {
    fail(
      `${CHUNK_REL} no longer passes \`targetSnapshot ?? undefined\` to NavigationError, so a carried-with-an-undefined-value \`target\` is not what the installed router produces`,
    );
  }
  return { line: lineOfIndex(text, at), call: call.trim() };
}

/** Whether the installed declaration marks `NavigationError.target` optional. */
function targetIsDeclaredOptional() {
  requireFile(ROUTER_TYPES_PATH, 'run npm ci');
  const text = readFileSync(ROUTER_TYPES_PATH, 'utf8');
  const block = text.slice(
    text.indexOf('declare class NavigationError extends RouterEvent'),
  );
  return /readonly target\?: RouterStateSnapshot \| undefined;/.test(block);
}

// ------------------------------------------------------------- the record ----

function loadRecord() {
  requireFile(RECORD_PATH, 'the measurement has not been recorded');
  return JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
}

function allFrames(record) {
  const frames = {
    'held.inFlight': record.held?.inFlight?.events ?? [],
    'held.completion': record.held?.completion?.events ?? [],
    warm: record.warm?.events ?? [],
    superseded: record.superseded?.events ?? [],
    'terminals.error': record.terminals?.error?.events ?? [],
    'terminals.skip': record.terminals?.skip?.events ?? [],
    'terminals.redirect': record.terminals?.redirect?.events ?? [],
  };
  return frames;
}

// ------------------------------------------------- validation: the events ----

function validateEvents(record, live) {
  const events = record.events;
  if (!isObject(events)) fail('missing events');
  strings(events, ['question', 'finding'], 'events');
  strings(events.reader, ['how', 'pattern', 'why', 'source'], 'events.reader');
  if (events.reader.source !== CHUNK_REL) {
    fail(
      `events.reader.source is ${JSON.stringify(events.reader.source)}, which is not the chunk this file reads`,
    );
  }
  if (!same(events.reader.baseClass.keys, live.routerEventKeys)) {
    fail(
      `events.reader.baseClass.keys is ${JSON.stringify(events.reader.baseClass.keys)} and RouterEvent assigns ${JSON.stringify(live.routerEventKeys)}`,
    );
  }
  if (events.enumerated !== ENUMERATED.length) {
    fail(
      `events.enumerated is ${events.enumerated}; the stream is enumerated on exactly ${ENUMERATED.length} classes`,
    );
  }
  if (!Array.isArray(events.classes)) fail('events.classes is not a list');
  if (events.classes.length !== ENUMERATED.length) {
    fail(
      `events.classes holds ${events.classes.length} row(s); the stream is enumerated on exactly ${ENUMERATED.length} classes`,
    );
  }
  const names = events.classes.map((row) => row.name);
  if (!same(names, ENUMERATED)) {
    fail(
      `events.classes enumerates ${JSON.stringify(names)} and the measurement's list is ${JSON.stringify(ENUMERATED)}`,
    );
  }
  for (let index = 0; index < ENUMERATED.length; index += 1) {
    const name = ENUMERATED[index];
    const row = events.classes[index];
    const derived = live.classes.get(name);
    if (derived === undefined) {
      fail(`the installed chunk declares no class ${name}`);
    }
    const where = `events.classes[${name}]`;
    if (row.type !== live.eventType.get(name)) {
      fail(
        `${where}: the recorded type is ${row.type} and the installed EventType declares ${live.eventType.get(name)}`,
      );
    }
    if (derived.typeName !== name) {
      fail(
        `${CHUNK_REL} declares ${name}.type as EventType.${derived.typeName}, so the class and its event type disagree`,
      );
    }
    if (!same(row.keys, derived.keys)) {
      fail(
        `${where}: the recorded key set is ${JSON.stringify(row.keys)} and the installed chunk declares ${JSON.stringify(derived.keys)}`,
      );
    }
    const cited = citationLines(row.declaredAt, `${where}.declaredAt`);
    if (cited.path !== CHUNK_REL) {
      fail(`${where}.declaredAt cites ${cited.path}`);
    }
    if (cited.start !== derived.startLine || cited.end !== derived.endLine) {
      fail(
        `${where}.declaredAt cites lines ${cited.start}-${cited.end} and the class sits on lines ${derived.startLine}-${derived.endLine}`,
      );
    }
    if (row.extendsRouterEvent !== derived.extendsRouterEvent) {
      fail(
        `${where}.extendsRouterEvent is ${row.extendsRouterEvent} and the installed class ${derived.extendsRouterEvent ? 'does' : 'does not'} extend RouterEvent`,
      );
    }
    if (row.observed === null) {
      fail(
        `${where}: no run observed this class, so its key set is derived only`,
      );
    }
    if (!same(row.observed.keys, derived.keys)) {
      fail(
        `${where}.observed.keys is ${JSON.stringify(row.observed.keys)} and the installed chunk declares ${JSON.stringify(derived.keys)}`,
      );
    }
    if (typeof row.observed.count !== 'number' || row.observed.count < 1) {
      fail(`${where}.observed.count is ${JSON.stringify(row.observed.count)}`);
    }
    if (
      !Array.isArray(row.observed.frames) ||
      row.observed.frames.length === 0
    ) {
      fail(`${where}.observed.frames is empty`);
    }
  }
  if (events.observedClassCount !== ENUMERATED.length) {
    fail(
      `events.observedClassCount is ${events.observedClassCount}; every one of the ${ENUMERATED.length} classes was observed on the portal in this run`,
    );
  }

  const scroll = events.scroll;
  if (!isObject(scroll)) fail('missing events.scroll');
  if (scroll.name !== 'Scroll') fail(`events.scroll.name is ${scroll.name}`);
  if (scroll.type !== live.eventType.get('Scroll')) {
    fail(
      `events.scroll.type is ${scroll.type} and the installed EventType declares ${live.eventType.get('Scroll')}`,
    );
  }
  if (!same(scroll.keys, live.scrollKeys)) {
    fail(
      `events.scroll.keys is ${JSON.stringify(scroll.keys)} and the installed chunk declares ${JSON.stringify(live.scrollKeys)}`,
    );
  }
  if (scroll.inTheEnumeratedSixteen !== false) {
    fail('events.scroll.inTheEnumeratedSixteen is not false');
  }
  if (ENUMERATED.includes('Scroll')) {
    fail(
      'Scroll is one of the enumerated sixteen, and it reports a position, not a stage',
    );
  }
  const scrollCited = citationLines(
    scroll.declaredAt,
    'events.scroll.declaredAt',
  );
  if (scrollCited.path !== CHUNK_REL)
    fail(`events.scroll.declaredAt cites ${scrollCited.path}`);
  if (scrollCited.start !== live.scroll.startLine) {
    fail(
      `events.scroll.declaredAt starts at line ${scrollCited.start} and the class sits on line ${live.scroll.startLine}`,
    );
  }

  // Every recorded event's key set is the installed class's key set — the payload
  // keeps the keys the event carried and no others.
  for (const [frameName, list] of Object.entries(allFrames(record))) {
    for (const event of list) {
      const derived = live.classes.get(event.class);
      if (derived === undefined) {
        if (event.class === 'Scroll') {
          fail(`${frameName} records a Scroll, and no run produced one`);
        }
        fail(
          `${frameName} records an event class the chunk does not declare: ${event.class}`,
        );
      }
      if (IDLESS_CLASSES.includes(event.class)) {
        if (
          event.keys.includes('id') ||
          (isObject(event.payload) && 'id' in event.payload)
        ) {
          fail(
            `${frameName}: ${event.class} carries an id, and those two events carry route and type only`,
          );
        }
      }
      if (!same(event.keys, derived.keys)) {
        fail(
          `${frameName}: the recorded ${event.class} carries ${JSON.stringify(event.keys)} and the installed class declares ${JSON.stringify(derived.keys)}`,
        );
      }
      if (isObject(event.payload)) {
        const payloadKeys = Object.keys(event.payload).sort();
        if (!same(payloadKeys, derived.keys)) {
          fail(
            `${frameName}: the recorded ${event.class} payload keeps ${JSON.stringify(payloadKeys)} and the event carried ${JSON.stringify(derived.keys)}, so it does not keep the keys the event carried and no others`,
          );
        }
      }
      if (event.type !== live.eventType.get(event.class)) {
        fail(
          `${frameName}: ${event.class} is recorded with type ${event.type} and the installed EventType declares ${live.eventType.get(event.class)}`,
        );
      }
      if (typeof event.t !== 'number' || !Number.isFinite(event.t)) {
        fail(`${frameName}: ${event.class} carries no receipt time`);
      }
    }
  }
}

// ------------------------------------------------- validation: the codes ----

function validateCodes(record, live) {
  const codes = record.events.codes;
  if (!isObject(codes)) fail('missing events.codes');
  if (codes.source !== CHUNK_REL) {
    fail(`events.codes.source is ${JSON.stringify(codes.source)}`);
  }
  const declaredAt = citationLines(
    codes.declaration,
    'events.codes.declaration',
  );
  if (declaredAt.path !== CHUNK_REL) {
    fail(`events.codes.declaration cites ${declaredAt.path}`);
  }
  for (const enumName of ['cancellation', 'skipped']) {
    const enumMembers =
      enumName === 'cancellation' ? live.cancellation : live.skipped;
    const recorded = codes[enumName];
    if (!Array.isArray(recorded))
      fail(`events.codes.${enumName} is not a list`);
    if (recorded.length !== enumMembers.length) {
      fail(
        `events.codes.${enumName} holds ${recorded.length} row(s) and the installed enum declares ${enumMembers.length}`,
      );
    }
    for (let index = 0; index < enumMembers.length; index += 1) {
      const declared = enumMembers[index];
      const row = recorded[index];
      if (row.name !== declared.name || row.value !== declared.value) {
        fail(
          `events.codes.${enumName}[${index}] is ${JSON.stringify(row)} and the installed enum declares ${JSON.stringify(declared)}`,
        );
      }
      const produced = row.producedByARun;
      if (typeof produced !== 'boolean') {
        fail(
          `events.codes.${enumName}[${declared.name}].producedByARun is not a boolean`,
        );
      }
      if (produced === true) {
        if (!isObject(row.producedBy)) {
          fail(
            `events.codes.${enumName}[${declared.name}] is recorded as produced and names no frame`,
          );
        }
        strings(
          row.producedBy,
          ['frame', 'reason'],
          `events.codes.${enumName}[${declared.name}].producedBy`,
        );
        if (typeof row.producedBy.t !== 'number') {
          fail(
            `events.codes.${enumName}[${declared.name}].producedBy.t is not a receipt time`,
          );
        }
      } else if (row.producedBy !== null) {
        fail(
          `events.codes.${enumName}[${declared.name}] is recorded as unproduced and names a production`,
        );
      }
    }
  }
  // Each recorded production must be the code the frames actually carry.
  for (const [enumName, terminalType] of [
    ['cancellation', 2],
    ['skipped', 16],
  ]) {
    for (const row of codes[enumName]) {
      const frames = allFrames(record);
      const events = Object.values(frames).flat();
      const sameCode = events.filter(
        (event) =>
          event.type === terminalType && event.payload?.code === row.value,
      );
      if (row.producedByARun !== sameCode.length > 0) {
        fail(
          `events.codes.${enumName}[${row.name}] is ${row.producedByARun ? 'produced' : 'unproduced'} and the recorded frames ${sameCode.length > 0 ? 'carry' : 'carry no'} code ${row.value}`,
        );
      }
    }
  }
  if (!Array.isArray(codes.unproduced))
    fail('events.codes.unproduced is not a list');
  const derivedUnproduced = [
    ...live.cancellation
      .filter(
        (member) =>
          !codes.cancellation.find((row) => row.value === member.value)
            ?.producedByARun,
      )
      .map((member) => `${member.name}=${member.value}`),
    ...live.skipped
      .filter(
        (member) =>
          !codes.skipped.find((row) => row.value === member.value)
            ?.producedByARun,
      )
      .map((member) => `${member.name}=${member.value}`),
  ].sort();
  const recordedUnproduced = codes.unproduced
    .map((row) => `${row.name}=${row.value}`)
    .sort();
  if (!same(recordedUnproduced, derivedUnproduced)) {
    fail(
      `events.codes.unproduced is ${JSON.stringify(recordedUnproduced)} and the declared-but-unproduced codes are ${JSON.stringify(derivedUnproduced)}`,
    );
  }
  if (codes.unproduced.length === 0) {
    fail(
      'events.codes.unproduced is empty, so a code no run produced would be a claim',
    );
  }
  const redirect = codes.redirectProducedNoCancel;
  if (!isObject(redirect))
    fail('missing events.codes.redirectProducedNoCancel');
  if (redirect.cancelCount !== 0) {
    fail(
      `events.codes.redirectProducedNoCancel.cancelCount is ${redirect.cancelCount}; a redirect produced no NavigationCancel`,
    );
  }
  if (redirect.url === redirect.urlAfterRedirects) {
    fail(
      'events.codes.redirectProducedNoCancel records the same url and urlAfterRedirects, so it records no redirect',
    );
  }
}

// ------------------------------------------------- validation: the reach ----

function validateReach(record) {
  const reach = record.reach;
  if (!isObject(reach)) fail('missing reach');
  strings(reach, ['question', 'finding', 'hostElement'], 'reach');
  strings(
    reach.readFrom,
    ['source', 'function', 'cite', 'tokenField'],
    'reach.readFrom',
  );
  if (reach.readFrom.source !== AGENT_REL) {
    fail(`reach.readFrom.source is ${JSON.stringify(reach.readFrom.source)}`);
  }
  if (reach.readFrom.function !== 'routerTokenFrom') {
    fail(
      `reach.readFrom.function is ${JSON.stringify(reach.readFrom.function)}; the widened agent's Router read is \`routerTokenFrom\``,
    );
  }
  const body = agentRouterRead();
  const cited = citationLines(reach.readFrom.cite, 'reach.readFrom.cite');
  if (cited.path !== AGENT_REL) fail(`reach.readFrom.cite cites ${cited.path}`);
  if (cited.start < body.startLine || cited.end > body.endLine) {
    fail(
      `reach.readFrom.cite cites lines ${cited.start}-${cited.end} and the agent's Router read sits on lines ${body.startLine}-${body.endLine}`,
    );
  }
  for (const call of [
    'getInjector',
    'ɵgetInjectorResolutionPath',
    'ɵgetInjectorProviders',
  ]) {
    if (!body.body.includes(call)) {
      fail(
        `the agent's Router read no longer calls ${call}, so the recorded reach cannot be performed by the code that will perform it`,
      );
    }
  }
  if (!/\.token\b/.test(body.body)) {
    fail(
      `the agent's Router read no longer takes a provider record's \`token\`, so the recorded reach names a field the agent does not read`,
    );
  }
  if (!/token:\s*token/.test(body.body)) {
    fail(
      `the agent's Router read no longer returns the token it found as \`token: token\`, so the recorded reach names a field the agent does not return`,
    );
  }
  if (reach.readFrom.tokenField !== 'record.token') {
    fail(
      `reach.readFrom.tokenField is ${JSON.stringify(reach.readFrom.tokenField)}; the token is the field that finds the Router`,
    );
  }
  if (!Array.isArray(reach.path) || reach.path.length < 2) {
    fail('reach.path is not a path of at least two entries');
  }
  if (reach.pathEntryCount !== reach.path.length) {
    fail(
      `reach.pathEntryCount is ${reach.pathEntryCount} and reach.path holds ${reach.path.length}`,
    );
  }
  for (let index = 0; index < reach.path.length; index += 1) {
    const entry = reach.path[index];
    const where = `reach.path[${entry.index}]`;
    if (entry.index !== index) fail(`${where}.index is ${entry.index}`);
    if (typeof entry.providerCount !== 'number' || entry.providerCount < 0) {
      fail(`${where}.providerCount is not a count`);
    }
    if (
      typeof entry.providerProvideCount !== 'number' ||
      entry.providerProvideCount > entry.providerCount
    ) {
      fail(`${where}.providerProvideCount is not a count within the entry`);
    }
    if (typeof entry.hasRouterToken !== 'number') {
      fail(`${where}.hasRouterToken is not a count`);
    }
  }
  if (typeof reach.routerTokenEntry !== 'number') {
    fail('reach.routerTokenEntry is not an index');
  }
  if (reach.routerTokenEntry === 0) {
    fail(
      'reach.routerTokenEntry is 0: the first entry is the element injector and the app injector is not the first entry',
    );
  }
  if (reach.appInjectorIsTheFirstEntry !== (reach.routerTokenEntry === 0)) {
    fail(
      'reach.appInjectorIsTheFirstEntry disagrees with the recorded entry index',
    );
  }
  const holder = reach.path[reach.routerTokenEntry];
  if (holder === undefined) {
    fail(
      `reach.routerTokenEntry ${reach.routerTokenEntry} is not one of the recorded entries`,
    );
  }
  if (holder.hasRouterToken !== 1) {
    fail(
      `reach.path[${reach.routerTokenEntry}] records ${holder.hasRouterToken} Router token record(s) and the entry that holds it carries exactly one`,
    );
  }
  if (holder.routerTokenResolvesToTheRouterInstance !== true) {
    fail(
      `reach.path[${reach.routerTokenEntry}] does not record that its Router token resolves to the Router instance`,
    );
  }
  if (holder.providerProvideHasRouter !== false) {
    fail(
      `reach.path[${reach.routerTokenEntry}] claims the raw provider's own \`provide\` names the Router`,
    );
  }
  if (reach.tokenFieldIsTheFieldThatFindsIt !== true) {
    fail('reach.tokenFieldIsTheFieldThatFindsIt is not true');
  }
  if (reach.providerProvideIsTheFieldThatFindsIt !== false) {
    fail('reach.providerProvideIsTheFieldThatFindsIt is not false');
  }
}

// ------------------------------------------------- validation: the held ----

function validateHeld(record, live) {
  const held = record.held;
  if (!isObject(held)) fail('missing held');
  strings(held, ['question', 'finding', 'target', 'holdBy'], 'held');
  if (typeof held.holdMs !== 'number' || held.holdMs < 100) {
    fail(`held.holdMs is ${JSON.stringify(held.holdMs)}, which is not a hold`);
  }
  const inFlight = held.inFlight;
  if (!isObject(inFlight)) fail('missing held.inFlight');
  if (!Array.isArray(inFlight.events) || inFlight.events.length === 0) {
    fail('held.inFlight.events is empty');
  }
  if (inFlight.hasTerminalEvent !== false) {
    fail('held.inFlight.hasTerminalEvent is not false');
  }
  for (const event of inFlight.events) {
    if (TERMINAL_TYPES.includes(event.type)) {
      fail(
        `held: a terminal event (${event.class}) is recorded while the navigation was held, so the frame is not a held navigation`,
      );
    }
  }
  if (inFlight.eventCount !== inFlight.events.length) {
    fail(
      `held.inFlight.eventCount is ${inFlight.eventCount} and it holds ${inFlight.events.length} event(s)`,
    );
  }
  if (
    inFlight.lastEventClass !==
    inFlight.events[inFlight.events.length - 1].class
  ) {
    fail(
      `held.inFlight.lastEventClass is ${inFlight.lastEventClass} and the last recorded event is ${inFlight.events[inFlight.events.length - 1].class}`,
    );
  }
  if (typeof inFlight.routerUrl !== 'string' || inFlight.routerUrl === '') {
    fail('held.inFlight.routerUrl is not a route');
  }
  if (inFlight.routerUrl === held.target) {
    fail(
      `held.inFlight.routerUrl is ${inFlight.routerUrl}, which is already the target, so the navigation was not in flight`,
    );
  }
  const still = held.stillInFlightLater;
  if (!isObject(still)) fail('missing held.stillInFlightLater');
  if (still.hasTerminalEvent !== false) {
    fail('held.stillInFlightLater.hasTerminalEvent is not false');
  }
  if (still.eventCount !== inFlight.eventCount) {
    fail(
      `held.stillInFlightLater.eventCount is ${still.eventCount} and the first read recorded ${inFlight.eventCount}, so the in-flight state did not persist`,
    );
  }
  if (still.lastEventClass !== inFlight.lastEventClass) {
    fail(
      `held.stillInFlightLater.lastEventClass is ${still.lastEventClass} and the first read says ${inFlight.lastEventClass}`,
    );
  }
  if (still.currentNavigationKeysEqual !== true) {
    fail('held.stillInFlightLater.currentNavigationKeysEqual is not true');
  }

  const nav = held.currentNavigation;
  if (!isObject(nav)) fail('missing held.currentNavigation');
  if (nav.read !== 'router.currentNavigation()') {
    fail(`held.currentNavigation.read is ${JSON.stringify(nav.read)}`);
  }
  if (!same(nav.keys, live.currentNavigation.setFields)) {
    fail(
      `held.currentNavigation.keys is ${JSON.stringify(nav.keys)} and the chunk hands currentNavigation ${JSON.stringify(live.currentNavigation.setFields)}`,
    );
  }
  if (nav.chunkSetFieldCount !== live.currentNavigation.setFields.length) {
    fail(
      `held.currentNavigation.chunkSetFieldCount is ${nav.chunkSetFieldCount} and the chunk sets ${live.currentNavigation.setFields.length} field(s)`,
    );
  }
  if (!same(nav.chunkSetFields, live.currentNavigation.setFields)) {
    fail(
      `held.currentNavigation.chunkSetFields is ${JSON.stringify(nav.chunkSetFields)} and the chunk sets ${JSON.stringify(live.currentNavigation.setFields)}`,
    );
  }
  const setAt = citationLines(
    nav.chunkSetSite,
    'held.currentNavigation.chunkSetSite',
  );
  if (setAt.start !== live.currentNavigation.setAtLine) {
    fail(
      `held.currentNavigation.chunkSetSite cites line ${setAt.start} and the set site sits on line ${live.currentNavigation.setAtLine}`,
    );
  }
  if (typeof nav.kinds !== 'object' || nav.kinds === null) {
    fail('held.currentNavigation.kinds is not an object');
  }
  const kindKeys = Object.keys(nav.kinds).sort();
  if (!same(kindKeys, nav.keys)) {
    fail(
      `held.currentNavigation.kinds names ${JSON.stringify(kindKeys)} and its field list is ${JSON.stringify(nav.keys)}`,
    );
  }
  for (const [name, kind] of Object.entries(nav.kinds)) {
    if (typeof kind !== 'string' || kind === '') {
      fail(`held.currentNavigation.kinds.${name} names no kind of value`);
    }
  }
  const handlers = nav.handlers;
  if (!isObject(handlers)) fail('missing held.currentNavigation.handlers');
  for (const name of ['routesRecognizeHandler', 'beforeActivateHandler']) {
    const handler = handlers[name];
    if (!isObject(handler))
      fail(`missing held.currentNavigation.handlers.${name}`);
    if (!Array.isArray(handler.keys)) {
      fail(`held.currentNavigation.handlers.${name}.keys is not a list`);
    }
    if (handler.keys.length !== Object.keys(handler.kinds ?? {}).length) {
      fail(
        `held.currentNavigation.handlers.${name} records ${handler.keys.length} key(s) and ${Object.keys(handler.kinds ?? {}).length} kind(s)`,
      );
    }
  }

  const completion = held.completion;
  if (!isObject(completion)) fail('missing held.completion');
  if (typeof completion.eventCount !== 'number') {
    fail('held.completion.eventCount is not a count');
  }
  if (completion.eventCount !== completion.classes.length) {
    fail(
      `held.completion.eventCount is ${completion.eventCount} and it lists ${completion.classes.length} class(es)`,
    );
  }
  if (!isObject(completion.terminal)) {
    fail(
      'held.completion records no terminal event, so the released navigation did not settle',
    );
  }
  if (!TERMINAL_TYPES.includes(completion.terminal.type)) {
    fail(
      `held.completion.terminal is a ${completion.terminal.class}, which ends no navigation`,
    );
  }
  if (completion.navResolved !== true) {
    fail('held.completion.navResolved is not true');
  }
  if (!same(completion.classes, completion.classes)) {
    fail('held.completion.classes is not a list');
  }
  // The held frame and the completed one render the same stage sequence: the terminal
  // event is the discriminator, not the stage.
  const stages = (classes) =>
    classes.filter((name) => name !== completion.terminal.class);
  const heldStages = inFlight.events.map((event) => event.class);
  const completedStages = stages(completion.classes);
  for (const stage of heldStages) {
    if (!completedStages.includes(stage)) {
      fail(
        `held: the stage ${stage} is recorded while the navigation was held and the completed navigation records no such stage`,
      );
    }
  }
  const firstStages = completedStages.slice(0, heldStages.length);
  if (!same(heldStages, firstStages)) {
    fail(
      `held: the held stage sequence is ${JSON.stringify(heldStages)} and the completed navigation opens with ${JSON.stringify(firstStages)}`,
    );
  }
}

// ------------------------------------------------- validation: the warm ----

function validateWarm(record) {
  const warm = record.warm;
  if (!isObject(warm)) fail('missing warm');
  strings(warm, ['question', 'finding', 'url'], 'warm');
  if (!Array.isArray(warm.events) || warm.events.length === 0) {
    fail('warm.events is empty');
  }
  if (warm.eventCount !== warm.events.length) {
    fail(
      `warm.eventCount is ${warm.eventCount} and it holds ${warm.events.length} event(s)`,
    );
  }
  if (
    !Array.isArray(warm.routeConfigLoads) ||
    warm.routeConfigLoads.length === 0
  ) {
    fail('warm.routeConfigLoads is empty, so no lazy boundary was measured');
  }
  for (const load of warm.routeConfigLoads) {
    strings(load, ['routePath'], 'warm.routeConfigLoads[]');
    if (typeof load.intervalMs !== 'number' || load.intervalMs < 0) {
      fail(
        `warm.routeConfigLoads[${load.routePath}].intervalMs is ${JSON.stringify(load.intervalMs)}`,
      );
    }
    const derived = load.endAt - load.startAt;
    if (Math.abs(derived - load.intervalMs) > 0.0015) {
      fail(
        `warm.routeConfigLoads[${load.routePath}].intervalMs is ${load.intervalMs} and its own two timestamps differ by ${derived}`,
      );
    }
    const startEvent = warm.events.find(
      (event) => event.t === load.startAt && event.type === 9,
    );
    const endEvent = warm.events.find(
      (event) => event.t === load.endAt && event.type === 10,
    );
    if (startEvent === undefined || endEvent === undefined) {
      fail(
        `warm.routeConfigLoads[${load.routePath}] does not name a recorded RouteConfigLoadStart and RouteConfigLoadEnd pair`,
      );
    }
    if (startEvent.payload.route.path !== load.routePath) {
      fail(
        `warm.routeConfigLoads[${load.routePath}] names a route the start event does not carry (${startEvent.payload.route.path})`,
      );
    }
  }
  const terminal = warm.terminal;
  if (!isObject(terminal)) fail('warm records no terminal event');
  if (terminal.type !== 1) {
    fail(
      `warm.terminal is a ${terminal.class}; the measured warm navigation ended NavigationEnd`,
    );
  }
  const lastLoadEnd = Math.max(
    ...warm.routeConfigLoads.map((load) => load.endAt),
  );
  if (!(terminal.t > lastLoadEnd)) {
    fail(
      `warm.terminal arrives at ${terminal.t} and the last load end at ${lastLoadEnd}, so the terminal event did not follow the load`,
    );
  }
  if (warm.navResolved !== true) fail('warm.navResolved is not true');
  if (terminal.payload.url !== warm.url) {
    fail(
      `warm.terminal carries url ${JSON.stringify(terminal.payload.url)} and the frame is ${JSON.stringify(warm.url)}`,
    );
  }
}

// ------------------------------------------- validation: the supersession ----

function validateSuperseded(record) {
  const superseded = record.superseded;
  if (!isObject(superseded)) fail('missing superseded');
  strings(superseded, ['question', 'finding', 'attribution'], 'superseded');
  strings(superseded.abandoned, ['url'], 'superseded.abandoned');
  strings(superseded.successor, ['url'], 'superseded.successor');
  if (typeof superseded.abandoned.id !== 'number') {
    fail('superseded.abandoned.id is not a navigation id');
  }
  if (typeof superseded.successor.id !== 'number') {
    fail('superseded.successor.id is not a navigation id');
  }
  if (superseded.abandoned.id === superseded.successor.id) {
    fail('superseded: the abandoned and the successor navigation share an id');
  }
  if (superseded.abandoned.navResolved !== false) {
    fail(
      'superseded.abandoned.navResolved is not false, so the abandoned navigation settled',
    );
  }
  if (superseded.successor.navResolved !== true) {
    fail('superseded.successor.navResolved is not true');
  }
  if (!Array.isArray(superseded.events) || superseded.events.length === 0) {
    fail('superseded.events is empty');
  }
  if (superseded.eventCount !== superseded.events.length) {
    fail(
      `superseded.eventCount is ${superseded.eventCount} and it holds ${superseded.events.length} event(s)`,
    );
  }
  const cancel = superseded.cancel;
  if (!isObject(cancel)) fail('superseded records no cancel');
  if (cancel.type !== 2) fail(`superseded.cancel is a ${cancel.class}`);
  if (cancel.payload.code !== 1) {
    fail(
      `superseded.cancel carries code ${cancel.payload.code}; supersession is code 1`,
    );
  }
  if (
    typeof cancel.payload.reason !== 'string' ||
    !/Navigation ID \d+ is not equal to the current navigation id \d+/.test(
      cancel.payload.reason,
    )
  ) {
    fail(
      `superseded.cancel carries reason ${JSON.stringify(cancel.payload.reason)}, which is not the revision-mismatch reason the chunk states`,
    );
  }
  if (cancel.payload.id !== superseded.abandoned.id) {
    fail(
      `superseded.cancel names navigation ${cancel.payload.id} and the abandoned navigation is ${superseded.abandoned.id}`,
    );
  }
  const ordering = superseded.ordering;
  if (!isObject(ordering)) fail('missing superseded.ordering');
  if (ordering.cancelAt !== cancel.t) {
    fail(
      `superseded.ordering.cancelAt is ${ordering.cancelAt} and the recorded cancel is at ${cancel.t}`,
    );
  }
  const loads = superseded.events.filter((event) => event.type === 10);
  const starts = superseded.events.filter((event) => event.type === 9);
  // Attributed by arrival against the cancel and by the route path the payload names —
  // never by the load end's position in the frame.
  const abandonedStart = starts.filter((event) => event.t < cancel.t).pop();
  const successorStart = starts.find((event) => event.t > cancel.t);
  if (abandonedStart === undefined) {
    fail('superseded: no RouteConfigLoadStart precedes the cancel');
  }
  if (successorStart === undefined) {
    fail('superseded: no RouteConfigLoadStart follows the cancel');
  }
  const abandonedPath = abandonedStart.payload.route.path;
  const successorPath = successorStart.payload.route.path;
  if (abandonedPath === successorPath) {
    fail(
      'superseded: the abandoned and the successor navigation load the same route, so route.path cannot tell their load ends apart',
    );
  }
  const abandonedLoadEnd = loads.find(
    (event) => event.payload?.route?.path === abandonedPath,
  );
  const successorLoadEnd = loads.find(
    (event) => event.payload?.route?.path === successorPath,
  );
  if (abandonedLoadEnd === undefined) {
    fail(
      `superseded: no RouteConfigLoadEnd names the abandoned navigation's own route (${JSON.stringify(abandonedPath)}), so the late load end is attributed by position`,
    );
  }
  if (successorLoadEnd === undefined) {
    fail(
      `superseded: no RouteConfigLoadEnd names the successor's own route (${JSON.stringify(successorPath)})`,
    );
  }
  if (
    abandonedLoadEnd.payload.route.path === successorLoadEnd.payload.route.path
  ) {
    fail(
      'superseded: the two load ends name the same route, so route.path cannot tell them apart',
    );
  }
  if (abandonedLoadEnd.t !== ordering.abandonedLoadEndAt) {
    fail(
      `superseded.ordering.abandonedLoadEndAt is ${ordering.abandonedLoadEndAt} and the load end naming the abandoned route is at ${abandonedLoadEnd.t}`,
    );
  }
  if (successorLoadEnd.t !== ordering.successorLoadEndAt) {
    fail(
      `superseded.ordering.successorLoadEndAt is ${ordering.successorLoadEndAt} and the load end naming the successor's route is at ${successorLoadEnd.t}`,
    );
  }
  if (
    abandonedLoadEnd.keys.includes('id') ||
    successorLoadEnd.keys.includes('id')
  ) {
    fail(
      'superseded: a RouteConfigLoadEnd carries an id, and those two events carry route and type only',
    );
  }
  // The ordering is recomputed from the two timestamps and then held to the record's
  // own claim; the claim is never read as the measurement.
  const derivedOrdering = {
    abandonedLoadEndIsAfterItsOwnCancel: abandonedLoadEnd.t > cancel.t,
    abandonedLoadEndIsBeforeTheSuccessorLoadEnd:
      abandonedLoadEnd.t < successorLoadEnd.t,
    cancelToAbandonedLoadEndMs: Number(
      (abandonedLoadEnd.t - cancel.t).toFixed(3),
    ),
    abandonedLoadEndToSuccessorLoadEndMs: Number(
      (successorLoadEnd.t - abandonedLoadEnd.t).toFixed(3),
    ),
  };
  for (const [key, value] of Object.entries(derivedOrdering)) {
    if (ordering[key] !== value) {
      fail(
        `superseded.ordering.${key} is ${JSON.stringify(ordering[key])} and the recorded frame yields ${JSON.stringify(value)}`,
      );
    }
  }
  if (derivedOrdering.abandonedLoadEndIsAfterItsOwnCancel !== true) {
    fail(
      `superseded: the abandoned navigation's RouteConfigLoadEnd does not arrive after its own cancel (cancel ${cancel.t}, load end ${abandonedLoadEnd.t})`,
    );
  }
  if (derivedOrdering.abandonedLoadEndIsBeforeTheSuccessorLoadEnd !== true) {
    fail(
      `superseded: the abandoned navigation's RouteConfigLoadEnd does not arrive before the successor's (${abandonedLoadEnd.t} against ${successorLoadEnd.t})`,
    );
  }
}

// ------------------------------------------------ validation: the terminals ----

function validateTerminals(record, live) {
  const terminals = record.terminals;
  if (!isObject(terminals)) fail('missing terminals');
  strings(terminals, ['question', 'finding'], 'terminals');

  const expectPayload = (where, event, classKeys) => {
    if (!isObject(event)) fail(`${where} records no event`);
    if (!isObject(event.payload)) fail(`${where}.payload is not an object`);
    const keys = Object.keys(event.payload).sort();
    if (!same(keys, classKeys)) {
      fail(
        `${where}: the payload keeps ${JSON.stringify(keys)} and the event carried ${JSON.stringify(classKeys)}, so it does not keep the keys the event carried and no others`,
      );
    }
    if (!same(event.keys, classKeys)) {
      fail(`${where}.keys is ${JSON.stringify(event.keys)}`);
    }
  };

  const cancel = terminals.cancel;
  if (!isObject(cancel)) fail('missing terminals.cancel');
  if (!same(cancel.fields, live.classes.get('NavigationCancel').keys)) {
    fail(
      `terminals.cancel.fields is ${JSON.stringify(cancel.fields)} and the installed class declares ${JSON.stringify(live.classes.get('NavigationCancel').keys)}`,
    );
  }
  if (cancel.event.type !== 2)
    fail(`terminals.cancel.event is a ${cancel.event.class}`);
  if (cancel.event.payload.code !== 1) {
    fail(
      `terminals.cancel.event carries code ${cancel.event.payload.code}; the measured cancel is code 1`,
    );
  }
  expectPayload('terminals.cancel.event', cancel.event, cancel.fields);

  const error = terminals.error;
  if (!isObject(error)) fail('missing terminals.error');
  if (!same(error.fields, live.classes.get('NavigationError').keys)) {
    fail(
      `terminals.error.fields is ${JSON.stringify(error.fields)} and the installed class declares ${JSON.stringify(live.classes.get('NavigationError').keys)}`,
    );
  }
  if (error.event.type !== 3)
    fail(`terminals.error.event is a ${error.event.class}`);
  if (typeof error.event.payload.error?.name !== 'string') {
    fail('terminals.error.event records no error name');
  }
  if (
    typeof error.event.payload.error?.message !== 'string' ||
    !/Failed to fetch dynamically imported module/.test(
      error.event.payload.error.message,
    )
  ) {
    fail(
      `terminals.error.event records error message ${JSON.stringify(error.event.payload.error?.message)}`,
    );
  }
  if (error.event.payload.url !== '/customer/list') {
    fail(
      `terminals.error.event carries url ${JSON.stringify(error.event.payload.url)}`,
    );
  }
  if (!live.targetIsDeclaredOptional) {
    fail(
      'the installed declaration no longer marks NavigationError.target optional, so a carried-with-an-undefined-value target is not what the router produces',
    );
  }
  if (error.targetValue !== 'undefined') {
    fail(
      `terminals.error.targetValue is ${JSON.stringify(error.targetValue)}; the measured event carried the key with an undefined value`,
    );
  }
  if (
    'target' in error.event.payload &&
    error.event.payload.target !== 'undefined'
  ) {
    fail(
      `terminals.error.event.payload.target is ${JSON.stringify(error.event.payload.target)}; the measurement recorded it as undefined`,
    );
  }
  if ('target' in error.event.payload === false) {
    fail(
      'terminals.error.event.payload carries no target key, and the event carries one whose value is undefined',
    );
  }
  const site = citationLines(
    `${live.navigationErrorSite.path}:${live.navigationErrorSite.line}-${live.navigationErrorSite.line}`,
    'terminals.error.constructionSite',
  );
  const citedSite = citationLines(
    error.constructionSite,
    'terminals.error.constructionSite',
  );
  if (citedSite.start !== site.start) {
    fail(
      `terminals.error.constructionSite cites line ${citedSite.start} and the chunk constructs the error on line ${site.start}`,
    );
  }
  if (!/targetSnapshot \?\? undefined/.test(error.constructionCall ?? '')) {
    fail(
      'terminals.error.constructionCall no longer quotes the argument the chunk passes as target',
    );
  }
  if (error.routerUrlAfter !== error.routerUrlBefore) {
    fail(
      `terminals.error records router.url moving from ${error.routerUrlBefore} to ${error.routerUrlAfter}, and an error leaves it where it was`,
    );
  }

  const skip = terminals.skip;
  if (!isObject(skip)) fail('missing terminals.skip');
  if (!same(skip.fields, live.classes.get('NavigationSkipped').keys)) {
    fail(
      `terminals.skip.fields is ${JSON.stringify(skip.fields)} and the installed class declares ${JSON.stringify(live.classes.get('NavigationSkipped').keys)}`,
    );
  }
  if (skip.event.type !== 16)
    fail(`terminals.skip.event is a ${skip.event.class}`);
  if (skip.event.payload.code !== 0) {
    fail(
      `terminals.skip.event carries code ${skip.event.payload.code}; the measured skip is code 0`,
    );
  }
  if (
    typeof skip.event.payload.reason !== 'string' ||
    !/same as the current Router URL/.test(skip.event.payload.reason)
  ) {
    fail(
      `terminals.skip.event carries reason ${JSON.stringify(skip.event.payload.reason)}, which is not the same-URL reason`,
    );
  }
  expectPayload('terminals.skip.event', skip.event, skip.fields);

  const redirect = terminals.redirect;
  if (!isObject(redirect)) fail('missing terminals.redirect');
  if (redirect.cancelCount !== 0) {
    fail(
      `terminals.redirect.cancelCount is ${redirect.cancelCount}; a redirect is not a terminal`,
    );
  }
  if (redirect.eventCount !== redirect.events.length) {
    fail(
      `terminals.redirect.eventCount is ${redirect.eventCount} and it holds ${redirect.events.length} event(s)`,
    );
  }
  if (redirect.terminal === null)
    fail('terminals.redirect records no terminal event');
  if (redirect.terminal.type !== 1) {
    fail(
      `terminals.redirect ends ${redirect.terminal.class}, and a redirect ends NavigationEnd`,
    );
  }
  if (
    redirect.terminal.payload.url ===
    redirect.terminal.payload.urlAfterRedirects
  ) {
    fail(
      'terminals.redirect records the same url and urlAfterRedirects, so it records no redirect',
    );
  }
}

// --------------------------------------------- validation: the absences ----

function validateAbsences(record, live) {
  const absences = record.absences;
  if (!isObject(absences)) fail('missing absences');
  for (const named of [
    'no-holder-recorded',
    'guard-verdict-not-recorded',
    'no-resolver-configured',
  ]) {
    const absence = absences[named];
    if (!isObject(absence)) fail(`missing absences['${named}']`);
    if (absence.named !== named) {
      fail(`absences['${named}'].named is ${JSON.stringify(absence.named)}`);
    }
    if (absence.verdict !== 'cannot-tell') {
      fail(
        `absences['${named}'].verdict is ${JSON.stringify(absence.verdict)}; the absence is cannot-tell`,
      );
    }
    strings(absence, ['criterion', 'finding'], `absences['${named}']`);
  }

  const holder = absences['no-holder-recorded'];
  if (
    !same(
      holder.currentNavigationFieldsAtTheHold,
      live.currentNavigation.setFields,
    )
  ) {
    fail(
      `no-holder-recorded: the field list at the hold is ${JSON.stringify(holder.currentNavigationFieldsAtTheHold)} and the chunk hands currentNavigation ${JSON.stringify(live.currentNavigation.setFields)}`,
    );
  }
  if (
    !same(holder.fieldsTheChunkAddsLater, live.currentNavigation.addedLater)
  ) {
    fail(
      `no-holder-recorded: the fields the chunk adds later are ${JSON.stringify(holder.fieldsTheChunkAddsLater)} and the chunk's update sites add ${JSON.stringify(live.currentNavigation.addedLater)}`,
    );
  }
  const union = [
    ...new Set([
      ...live.currentNavigation.setFields,
      ...live.currentNavigation.updateFields,
    ]),
  ].sort();
  if (!same(holder.currentNavigationFields, union)) {
    fail(
      `no-holder-recorded: the whole field list is ${JSON.stringify(holder.currentNavigationFields)} and the chunk declares ${JSON.stringify(union)}`,
    );
  }
  const words = HOLDER_WORDS;
  if (!same(holder.wordsChecked, words)) {
    fail(
      `no-holder-recorded.wordsChecked is ${JSON.stringify(holder.wordsChecked)} and the words are ${JSON.stringify(words)}`,
    );
  }
  const matching = union.filter((field) =>
    words.some((word) => field.toLowerCase().includes(word)),
  );
  if (!same(holder.currentNavigationFieldsMatchingAWord, matching)) {
    fail(
      `no-holder-recorded: the fields matching a holder word are ${JSON.stringify(matching)} and the record says ${JSON.stringify(holder.currentNavigationFieldsMatchingAWord)}`,
    );
  }
  if (matching.length !== 0) {
    fail(
      `no-holder-recorded: currentNavigation() now carries ${JSON.stringify(matching)}, so a field names a holder and SC3 must be re-measured`,
    );
  }
  for (const event of record.held.inFlight.events) {
    const payloadKeys = isObject(event.payload)
      ? Object.keys(event.payload)
      : event.keys;
    const hits = payloadKeys.filter((key) =>
      words.some((word) => key.toLowerCase().includes(word)),
    );
    if (hits.length > 0) {
      fail(
        `no-holder-recorded: the ${event.class} recorded during the hold carries ${JSON.stringify(hits)}, which names a holder`,
      );
    }
  }
  if (
    !Array.isArray(holder.eventPayloadKeysChecked) ||
    holder.eventPayloadKeysChecked.length === 0
  ) {
    fail('no-holder-recorded.eventPayloadKeysChecked is empty');
  }
  const derivedPayloadKeys = [
    ...new Set(
      record.held.inFlight.events.flatMap((event) =>
        isObject(event.payload) ? Object.keys(event.payload) : event.keys,
      ),
    ),
  ].sort();
  if (!same(holder.eventPayloadKeysChecked, derivedPayloadKeys)) {
    fail(
      `no-holder-recorded.eventPayloadKeysChecked is ${JSON.stringify(holder.eventPayloadKeysChecked)} and the held frame's payload keys are ${JSON.stringify(derivedPayloadKeys)}`,
    );
  }

  const guard = absences['guard-verdict-not-recorded'];
  if (
    !same(guard.guardsCheckEndKeys, live.classes.get('GuardsCheckEnd').keys)
  ) {
    fail(
      `guard-verdict-not-recorded.guardsCheckEndKeys is ${JSON.stringify(guard.guardsCheckEndKeys)} and the installed class declares ${JSON.stringify(live.classes.get('GuardsCheckEnd').keys)}`,
    );
  }
  if (!same(guard.guardsCheckEndObservedKeys, guard.guardsCheckEndKeys)) {
    fail(
      `guard-verdict-not-recorded: the observed GuardsCheckEnd keys are ${JSON.stringify(guard.guardsCheckEndObservedKeys)} and the class declares ${JSON.stringify(guard.guardsCheckEndKeys)}`,
    );
  }
  const derivedGuardFields = live.classes
    .get('GuardsCheckEnd')
    .keys.filter(
      (key) =>
        !live.classes.get('GuardsCheckStart').keys.includes(key) &&
        !live.readerBaseKeys.includes(key),
    );
  if (!same(guard.guardFieldsInThatPayload, derivedGuardFields)) {
    fail(
      `guard-verdict-not-recorded.guardFieldsInThatPayload is ${JSON.stringify(guard.guardFieldsInThatPayload)} and GuardsCheckEnd adds ${JSON.stringify(derivedGuardFields)} over GuardsCheckStart`,
    );
  }
  if (!same(derivedGuardFields, ['shouldActivate'])) {
    fail(
      `GuardsCheckEnd now adds ${JSON.stringify(derivedGuardFields)} over GuardsCheckStart; the milestone is written on shouldActivate being the only guard field`,
    );
  }
  if (guard.guardFieldsAreAggregateOnly !== true) {
    fail('guard-verdict-not-recorded.guardFieldsAreAggregateOnly is not true');
  }
  if (guard.shouldActivateValue !== true) {
    fail(
      `guard-verdict-not-recorded.shouldActivateValue is ${JSON.stringify(guard.shouldActivateValue)}`,
    );
  }
  const carried = guard.routeConfigPayloadCarries;
  if (!isObject(carried))
    fail('missing guard-verdict-not-recorded.routeConfigPayloadCarries');
  if (carried.canMatchCount === 0) {
    fail(
      'guard-verdict-not-recorded.routeConfigPayloadCarries records no canMatch, so the payload it says carries a guard carries none',
    );
  }
  const warmRouteLoad = record.warm.events.find(
    (event) =>
      event.type === 9 && event.payload?.route?.path === carried.routePath,
  );
  if (warmRouteLoad === undefined) {
    fail(
      `guard-verdict-not-recorded.routeConfigPayloadCarries names route ${JSON.stringify(carried.routePath)} and the warm frame records no load of it`,
    );
  }
  if (warmRouteLoad.payload.route.canMatchCount !== carried.canMatchCount) {
    fail(
      `guard-verdict-not-recorded.routeConfigPayloadCarries.canMatchCount is ${carried.canMatchCount} and the recorded payload says ${warmRouteLoad.payload.route.canMatchCount}`,
    );
  }
  if (!same(warmRouteLoad.payload.route.canMatchNames, carried.canMatchNames)) {
    fail(
      `guard-verdict-not-recorded.routeConfigPayloadCarries.canMatchNames is ${JSON.stringify(carried.canMatchNames)} and the recorded payload says ${JSON.stringify(warmRouteLoad.payload.route.canMatchNames)}`,
    );
  }
  const versus = guard.refusedGuardVersusUnmatchedUrl;
  if (!isObject(versus))
    fail('missing guard-verdict-not-recorded.refusedGuardVersusUnmatchedUrl');
  strings(
    versus,
    ['refused', 'unmatched', 'finding'],
    'guard-verdict-not-recorded.refusedGuardVersusUnmatchedUrl',
  );
  const comparison = versus.comparison;
  if (!isObject(comparison)) {
    fail(
      'guard-verdict-not-recorded.refusedGuardVersusUnmatchedUrl.comparison is missing',
    );
  }
  for (const key of [
    'classSequenceEqual',
    'keySequenceEqual',
    'eventCountEqual',
    'terminalClassEqual',
    'shouldActivateEqual',
  ]) {
    if (comparison[key] !== true) {
      fail(
        `guard-verdict-not-recorded: ${key} is ${JSON.stringify(comparison[key])}, so a refused guard is not structurally identical to an unmatched URL`,
      );
    }
  }
  if (comparison.hasNavigationCancelInEither !== false) {
    fail(
      'guard-verdict-not-recorded: a refused guard recorded a NavigationCancel, and a refusal is not a terminal of its own',
    );
  }
  if (
    !same(comparison.refusedClassSequence, comparison.unmatchedClassSequence)
  ) {
    fail(
      `guard-verdict-not-recorded: the refused sequence ${JSON.stringify(comparison.refusedClassSequence)} and the unmatched sequence ${JSON.stringify(comparison.unmatchedClassSequence)} differ`,
    );
  }
  if (
    comparison.refusedShouldActivate !== true ||
    comparison.unmatchedShouldActivate !== true
  ) {
    fail(
      `guard-verdict-not-recorded: shouldActivate is ${JSON.stringify(comparison.refusedShouldActivate)} refused and ${JSON.stringify(comparison.unmatchedShouldActivate)} unmatched`,
    );
  }
  const wildcard = (chain) =>
    Array.isArray(chain) && chain[chain.length - 1]?.path === '**';
  if (
    !wildcard(comparison.refusedMatchedChain) ||
    !wildcard(comparison.unmatchedMatchedChain)
  ) {
    fail(
      'guard-verdict-not-recorded: a refused guard and an unmatched URL no longer both recognise the wildcard `**` route',
    );
  }
  const differing = comparison.differingPayloadPaths;
  if (!Array.isArray(differing) || differing.length === 0) {
    fail(
      'guard-verdict-not-recorded.differingPayloadPaths is empty or missing, so the comparison claims two different navigations carry identical payloads',
    );
  }
  for (const path of differing) {
    if (
      !/\.(id|url|urlAfterRedirects)$/.test(path) &&
      !/state\.url$/.test(path)
    ) {
      fail(
        `guard-verdict-not-recorded: the two frames differ in ${path}, which is not one of the two navigations’ own id or url`,
      );
    }
  }
  if (!Array.isArray(comparison.guardNamesInEitherPayload)) {
    fail('guard-verdict-not-recorded: guardNamesInEitherPayload is not a list');
  }
  const guardNames = [
    ...new Set(
      [...(record.warm.events ?? [])]
        .filter((event) => event.payload?.route)
        .flatMap((event) => event.payload.route.canMatchNames ?? []),
    ),
  ];
  if (guardNames.length === 0) {
    fail(
      'guard-verdict-not-recorded: no route-config payload in the warm frame carries a canMatch name, so the record cannot say what name a guard carries',
    );
  }
  for (const name of guardNames) {
    if (name !== '') {
      fail(
        `guard-verdict-not-recorded: a portal canMatch carries the name ${JSON.stringify(name)}, and the portal's guards are anonymous`,
      );
    }
  }

  const resolver = absences['no-resolver-configured'];
  for (const target of ['portal', 'fixture']) {
    const facts = resolver[target];
    if (!isObject(facts)) fail(`missing no-resolver-configured.${target}`);
    if (facts.resolveKeysTotal !== 0) {
      fail(
        `no-resolver-configured: ${target} records ${facts.resolveKeysTotal} resolve key(s), so a resolver is configured and the absence is a lie`,
      );
    }
    if (
      !Array.isArray(facts.routesDeclaringAResolver) ||
      facts.routesDeclaringAResolver.length !== 0
    ) {
      fail(
        `no-resolver-configured: ${target} names a route that declares a resolver`,
      );
    }
    if (typeof facts.rowsWalked !== 'number' || facts.rowsWalked < 2) {
      fail(
        `no-resolver-configured: ${target}.rowsWalked is ${JSON.stringify(facts.rowsWalked)}`,
      );
    }
  }
  if (resolver.portal.canActivateTotal !== 0) {
    fail(
      `no-resolver-configured: the portal declares ${resolver.portal.canActivateTotal} canActivate, and it declares none`,
    );
  }
  const stage = resolver.resolveStageObservedAnyway;
  if (!isObject(stage))
    fail('missing no-resolver-configured.resolveStageObservedAnyway');
  if (stage.resolveStartAt === null || stage.resolveEndAt === null) {
    fail(
      'no-resolver-configured: no ResolveStart and ResolveEnd were recorded, so the stage-versus-configuration claim was not measured',
    );
  }
  if (!(stage.resolveEndAt > stage.resolveStartAt)) {
    fail(
      `no-resolver-configured: ResolveEnd (${stage.resolveEndAt}) does not follow ResolveStart (${stage.resolveStartAt})`,
    );
  }
}

// -------------------------------------------------- validation: the guards ----

function validateGuards(record) {
  const guards = record.guards;
  if (!isObject(guards)) fail('missing guards');
  strings(guards, ['question', 'finding', 'nameSource'], 'guards');
  const portal = guards.portal;
  if (!isObject(portal)) fail('missing guards.portal');
  if (portal.canActivate !== 0) {
    fail(
      `guards.portal.canActivate is ${portal.canActivate}; the portal declares no canActivate, which is what makes a guard name configuration-only`,
    );
  }
  if (portal.resolveKeys !== 0) {
    fail(`guards.portal.resolveKeys is ${portal.resolveKeys}`);
  }
  if (typeof portal.canMatch !== 'number' || portal.canMatch === 0) {
    fail(`guards.portal.canMatch is ${JSON.stringify(portal.canMatch)}`);
  }
  if (portal.canMatchRoutePaths.length !== portal.canMatch) {
    fail(
      `guards.portal.canMatch is ${portal.canMatch} and it names ${portal.canMatchRoutePaths.length} route(s)`,
    );
  }
  for (const name of portal.canMatchNames) {
    if (name !== '') {
      fail(
        `guards.portal names a canMatch function ${JSON.stringify(name)}, and every portal guard is anonymous`,
      );
    }
  }
  if (typeof portal.routeCount !== 'number' || portal.routeCount < 2) {
    fail(`guards.portal.routeCount is ${JSON.stringify(portal.routeCount)}`);
  }
  if (
    !Array.isArray(portal.loadChildrenBoundaries) ||
    portal.loadChildrenBoundaries.length === 0
  ) {
    fail(
      'guards.portal.loadChildrenBoundaries is empty, so no lazy boundary was walked',
    );
  }
  if (!Array.isArray(portal.wildcard) || portal.wildcard.length !== 1) {
    fail('guards.portal.wildcard records no single `**` route');
  }

  const fixture = guards.fixture;
  if (!isObject(fixture)) fail('missing guards.fixture');
  if (fixture.canActivate !== 1) {
    fail(
      `guards.fixture.canActivate is ${fixture.canActivate}; the fixture declares exactly one`,
    );
  }
  if (fixture.canActivateNames.length !== 1) {
    fail(
      `guards.fixture.canActivateNames holds ${fixture.canActivateNames.length} name(s)`,
    );
  }
  if (fixture.guardFile !== GUARD_FILE_REL) {
    fail(
      `guards.fixture.guardFile is ${JSON.stringify(fixture.guardFile)}, which is not the guard's own file`,
    );
  }
  if (fixture.resolveKeys !== 0)
    fail(`guards.fixture.resolveKeys is ${fixture.resolveKeys}`);
  const derived = fixtureGuardName();
  if (fixture.canActivateNames[0] !== derived.name) {
    fail(
      `guards.fixture names its canActivate ${JSON.stringify(fixture.canActivateNames[0])} and ${GUARD_FILE_REL} exports ${JSON.stringify(derived.name)}`,
    );
  }
  if (!derived.source.includes('() => true')) {
    fail(
      `${GUARD_FILE_REL} no longer configures the guard as \`() => true\`, so the recorded source is stale`,
    );
  }
  if (!fixture.canActivateSources.includes('() => true')) {
    fail(
      `guards.fixture.canActivateSources is ${JSON.stringify(fixture.canActivateSources)} and the guard's configured function is \`() => true\``,
    );
  }
}

// --------------------------------------------------- the whole recording ----

function validate(record, live) {
  if (!isObject(record)) fail('the recording is not an object');
  if (record.schema !== 'm041-navigation/v1') {
    fail(`the recording schema is ${JSON.stringify(record.schema)}`);
  }
  if (record.milestone !== 'navigation-blocking') {
    fail(`the recording milestone is ${JSON.stringify(record.milestone)}`);
  }
  if (record.task !== 'T001')
    fail(`the recording task is ${JSON.stringify(record.task)}`);
  strings(record, ['title', 'question', 'verdict'], 'the recording');
  if (!isIsoTimestamp(record.capturedAt)) {
    fail(`the recording capturedAt is ${record.capturedAt}`);
  }
  strings(
    record.commands,
    ['check', 'serve', 'browser', 'drive', 'teardown'],
    'commands',
  );
  if (!record.commands.check.includes('navigation-measure')) {
    fail('the recorded check command is not this suite');
  }
  strings(
    record.environment,
    ['platform', 'shell', 'node', 'browser', 'instance'],
    'environment',
  );
  if (record.environment.router.chunk !== CHUNK_REL) {
    fail(
      `environment.router.chunk is ${JSON.stringify(record.environment.router.chunk)}`,
    );
  }
  if (
    !Array.isArray(record.doesNotSettle) ||
    record.doesNotSettle.length === 0
  ) {
    fail('the record does not say what it does not settle');
  }
  for (const entry of record.doesNotSettle) {
    if (typeof entry !== 'string' || entry === '') {
      fail('a doesNotSettle entry is empty');
    }
  }
  // Every measured section names the probe that recorded it: a fact this repository
  // cannot re-derive is quoted as the recording's own measurement, with its recorder
  // beside it.
  const recorded = [
    ['reach', record.reach],
    ['held', record.held],
    ['warm', record.warm],
    ['superseded', record.superseded],
    ['terminals', record.terminals],
    ['terminals.cancel', record.terminals?.cancel],
    ['terminals.error', record.terminals?.error],
    ['terminals.skip', record.terminals?.skip],
    ['terminals.redirect', record.terminals?.redirect],
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
  }
  if (
    !Array.isArray(record.environment.probes) ||
    record.environment.probes.length === 0
  ) {
    fail(
      'environment.probes names no probe, so the recording cannot say how it was taken',
    );
  }
  const named = record.environment.probes.map((probe) => probe.name);
  for (const probe of record.environment.probes) {
    strings(probe, ['name', 'measured'], 'environment.probes[]');
    if (!probe.name.endsWith('.js')) {
      fail(
        `environment.probes names ${JSON.stringify(probe.name)}, which is not a file`,
      );
    }
  }
  for (const [where, section] of recorded) {
    if (where === 'terminals' || where === 'pageErrors') continue;
    if (!named.some((name) => section.recorder.includes(name))) {
      fail(
        `${where}.recorder names no probe from environment.probes: ${JSON.stringify(section.recorder)}`,
      );
    }
  }

  validateEvents(record, live);
  validateCodes(record, live);
  validateReach(record);
  validateHeld(record, live);
  validateWarm(record);
  validateSuperseded(record);
  validateTerminals(record, live);
  validateAbsences(record, live);
  validateGuards(record);
  return true;
}

// --------------------------------------------------------- the live facts ----

/**
 * Everything this run reads from the installed package, the page agent and the
 * fixture. One object, built once, so every validator compares a recorded claim
 * against the same live derivation.
 */
const live = (() => {
  const chunk = loadChunk();
  const routerEvent = classKeys(chunk, 'RouterEvent', []);
  const routerEventKeys = routerEvent.keys;
  const eventTypes = new Map(
    readEnum(chunk, 'EventType').map((entry) => [entry.name, entry.value]),
  );
  const classes = new Map();
  for (const name of ENUMERATED) {
    classes.set(name, classKeys(chunk, name, routerEventKeys));
  }
  const scroll = classKeys(chunk, 'Scroll', []);
  return {
    routerEventKeys,
    readerBaseKeys: ['id', 'url'],
    eventType: eventTypes,
    classes,
    scroll,
    scrollKeys: scroll.keys,
    cancellation: readEnum(chunk, 'NavigationCancellationCode'),
    skipped: readEnum(chunk, 'NavigationSkippedCode'),
    currentNavigation: currentNavigationFields(chunk),
    navigationErrorSite: { path: CHUNK_REL, ...navigationErrorSite() },
    targetIsDeclaredOptional: targetIsDeclaredOptional(),
    installedVersion: JSON.parse(readFileSync(ROUTER_MANIFEST_PATH, 'utf8'))
      .version,
  };
})();

// ------------------------------------------------------------ the checks ----

test('the recording validates against the installed router, the agent and the fixture', () => {
  assert.doesNotThrow(() => validate(loadRecord(), live));
});

test('the recording is the canonical serialisation of its own record', () => {
  const text = readFileSync(RECORD_PATH, 'utf8');
  assert.equal(
    text,
    canonical(loadRecord()),
    'the recording is not the canonical serialisation of its record, so a re-measurement would not reproduce these bytes',
  );
});

test('the sixteen classes and their key sets are the installed chunk’s, by name', () => {
  const record = loadRecord();
  assert.equal(record.events.classes.length, 16);
  assert.deepEqual(
    record.events.classes.map((row) => row.name),
    ENUMERATED,
    'the recorded enumeration is not the measurement’s list',
  );
  for (const row of record.events.classes) {
    const derived = live.classes.get(row.name);
    assert.deepEqual(row.keys, derived.keys, `${row.name} keys`);
    assert.equal(row.type, live.eventType.get(row.name), `${row.name} type`);
    assert.deepEqual(
      row.observed.keys,
      derived.keys,
      `${row.name} observed keys`,
    );
  }
  assert.equal(record.events.observedClassCount, 16);
  assert.match(record.events.finding, /sixteen event classes/);
});

test('Scroll is declared, enumerated beside the sixteen and produced by no run', () => {
  const record = loadRecord();
  assert.equal(record.events.scroll.type, live.eventType.get('Scroll'));
  assert.deepEqual(record.events.scroll.keys, live.scrollKeys);
  assert.equal(record.events.scroll.observedInARun, false);
  assert.ok(!ENUMERATED.includes('Scroll'));
  for (const [frame, list] of Object.entries(allFrames(record))) {
    assert.ok(
      !list.some((event) => event.class === 'Scroll'),
      `${frame} records a Scroll`,
    );
  }
});

test('the codes are the installed enums, and only a measured production is a production', () => {
  const record = loadRecord();
  assert.deepEqual(
    record.events.codes.cancellation.map((row) => ({
      name: row.name,
      value: row.value,
    })),
    live.cancellation,
  );
  assert.deepEqual(
    record.events.codes.skipped.map((row) => ({
      name: row.name,
      value: row.value,
    })),
    live.skipped,
  );
  assert.equal(
    record.events.codes.cancellation.find(
      (row) => row.name === 'SupersededByNewNavigation',
    ).producedByARun,
    true,
  );
  assert.equal(
    record.events.codes.skipped.find(
      (row) => row.name === 'IgnoredSameUrlNavigation',
    ).producedByARun,
    true,
  );
  for (const name of [
    'Redirect',
    'NoDataFromResolver',
    'GuardRejected',
    'Aborted',
  ]) {
    assert.equal(
      record.events.codes.cancellation.find((row) => row.name === name)
        .producedByARun,
      false,
      `${name} is recorded as produced`,
    );
  }
  assert.equal(
    record.events.codes.skipped.find(
      (row) => row.name === 'IgnoredByUrlHandlingStrategy',
    ).producedByARun,
    false,
  );
  assert.match(record.events.codes.cancellation[3].name, /^GuardRejected$/);
});

test('the reach is the agent’s own read path, and the third entry holds the Router token', () => {
  const record = loadRecord();
  const body = agentRouterRead();
  assert.match(body.body, /ɵgetInjectorResolutionPath/);
  assert.match(body.body, /token:\s*token/);
  assert.equal(record.reach.readFrom.function, 'routerTokenFrom');
  assert.ok(
    record.reach.readFrom.calls.some((call) =>
      call.includes('ɵgetInjectorProviders'),
    ),
    'the recorded read names the ɵ call that walks the provider records',
  );
  assert.equal(record.reach.routerTokenEntry, 2);
  assert.equal(
    record.reach.path[record.reach.routerTokenEntry].metadataSource,
    'Environment Injector',
  );
  assert.equal(
    record.reach.path[record.reach.routerTokenEntry].providerCount,
    90,
  );
  assert.notEqual(record.reach.routerTokenEntry, 0);
  assert.equal(record.reach.appInjectorIsTheFirstEntry, false);
  assert.equal(record.reach.providerProvideIsTheFieldThatFindsIt, false);
  assert.equal(
    record.reach.path[record.reach.routerTokenEntry]
      .routerTokenResolvesToTheRouterInstance,
    true,
  );
});

test('a held navigation carries a start, a stage and no terminal, and says what its holder is not', () => {
  const record = loadRecord();
  const held = record.held.inFlight;
  assert.equal(held.hasTerminalEvent, false);
  assert.deepEqual(
    held.events.map((event) => event.class),
    ['NavigationStart', 'RouteConfigLoadStart'],
  );
  assert.equal(held.lastEventClass, 'RouteConfigLoadStart');
  assert.equal(held.routerUrl, '/home');
  assert.deepEqual(
    held.events.map((event) => event.type),
    [0, 9],
  );
  assert.equal(record.held.stillInFlightLater.hasTerminalEvent, false);
  assert.equal(record.held.stillInFlightLater.eventCount, held.eventCount);
  assert.equal(record.held.completion.terminal.class, 'NavigationEnd');
  assert.equal(record.held.completion.terminal.type, 1);
  assert.deepEqual(
    record.absences['no-holder-recorded'].currentNavigationFieldsMatchingAWord,
    [],
  );
  assert.deepEqual(
    record.absences['no-holder-recorded'].payloadFieldsMatchingAWord,
    [],
  );
});

test('both targets declare zero resolvers while the resolve stage is still emitted', () => {
  const record = loadRecord();
  assert.equal(
    record.absences['no-resolver-configured'].portal.resolveKeysTotal,
    0,
  );
  assert.equal(
    record.absences['no-resolver-configured'].fixture.resolveKeysTotal,
    0,
  );
  assert.equal(record.guards.portal.resolveKeys, 0);
  assert.equal(record.guards.fixture.resolveKeys, 0);
  assert.equal(
    record.absences['no-resolver-configured'].portal.canActivateTotal,
    0,
  );
  assert.ok(record.warm.events.some((event) => event.type === 5));
  assert.ok(record.warm.events.some((event) => event.type === 6));
});

test('the three terminals keep exactly the keys their class carries', () => {
  const record = loadRecord();
  for (const [where, event] of [
    ['cancel', record.terminals.cancel.event],
    ['error', record.terminals.error.event],
    ['skip', record.terminals.skip.event],
  ]) {
    const derived = live.classes.get(event.class).keys;
    assert.deepEqual(
      Object.keys(event.payload).sort(),
      derived,
      `${where} payload keys`,
    );
    assert.deepEqual(event.keys, derived, `${where} keys`);
  }
  assert.equal(record.terminals.error.event.payload.target, 'undefined');
  assert.ok('target' in record.terminals.error.event.payload);
});

test('the superseded navigation’s late load end arrives after its own cancel and before the successor’s', () => {
  const record = loadRecord();
  const ordering = record.superseded.ordering;
  assert.ok(ordering.cancelAt < ordering.abandonedLoadEndAt);
  assert.ok(ordering.abandonedLoadEndAt < ordering.successorLoadEndAt);
  assert.ok(ordering.cancelToAbandonedLoadEndMs > 0);
  assert.ok(ordering.abandonedLoadEndToSuccessorLoadEndMs > 0);
  for (const event of record.superseded.events) {
    if (event.type === 9 || event.type === 10) {
      assert.deepEqual(event.keys, ['route', 'type'], `${event.class} keys`);
    }
  }
});

test('the warm navigation ended after its measured lazy interval', () => {
  const record = loadRecord();
  for (const load of record.warm.routeConfigLoads) {
    assert.ok(load.intervalMs >= 0, `${load.routePath} interval`);
    assert.ok(
      Math.abs(load.endAt - load.startAt - load.intervalMs) < 0.0015,
      `${load.routePath} interval is not the difference of its own two timestamps`,
    );
  }
  assert.ok(
    record.warm.terminal.t >
      Math.max(...record.warm.routeConfigLoads.map((load) => load.endAt)),
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
    ['writeFile', 'Sync', '('].join(''),
  ];
  for (const needle of forbidden) {
    assert.equal(
      source.includes(needle),
      false,
      `this suite carries ${JSON.stringify(needle)}, and the measurement belongs to the recording’s provenance`,
    );
  }
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

test('mutant: a key set with an extra key reddens naming the class', () => {
  const mutant = clone(loadRecord());
  mutant.events.classes
    .find((row) => row.name === 'NavigationStart')
    .keys.push('holder');
  assert.throws(
    () => validate(mutant, live),
    /events\.classes\[NavigationStart\].*recorded key set/,
  );
});

test('mutant: a moved type number reddens naming the class', () => {
  const mutant = clone(loadRecord());
  mutant.events.classes.find((row) => row.name === 'NavigationCancel').type = 7;
  assert.throws(
    () => validate(mutant, live),
    /events\.classes\[NavigationCancel\]: the recorded type is 7/,
  );
});

test('mutant: a dropped class reddens the enumeration', () => {
  const mutant = clone(loadRecord());
  mutant.events.classes.pop();
  assert.throws(
    () => validate(mutant, live),
    /enumerated on exactly 16 classes/,
  );
});

test('mutant: a held frame given a terminal event reddens', () => {
  const mutant = clone(loadRecord());
  mutant.held.inFlight.events.push({
    t: 1,
    type: 1,
    class: 'NavigationEnd',
    keys: ['id', 'type', 'url', 'urlAfterRedirects'],
    payload: {
      id: 2,
      type: 1,
      url: '/complaint/list',
      urlAfterRedirects: '/complaint/list',
    },
  });
  assert.throws(
    () => validate(mutant, live),
    /terminal event .*while the navigation was held/,
  );
});

test('mutant: a supersession whose load end precedes its cancel reddens', () => {
  const mutant = clone(loadRecord());
  const late = mutant.superseded.events.find(
    (event) => event.type === 10 && event.payload.route.path === 'claim',
  );
  late.t = mutant.superseded.cancel.t - 10;
  mutant.superseded.ordering.abandonedLoadEndAt = late.t;
  mutant.superseded.ordering.cancelToAbandonedLoadEndMs = -10;
  mutant.superseded.ordering.abandonedLoadEndToSuccessorLoadEndMs = Number(
    (mutant.superseded.ordering.successorLoadEndAt - late.t).toFixed(3),
  );
  mutant.superseded.ordering.abandonedLoadEndIsAfterItsOwnCancel = false;
  assert.throws(
    () => validate(mutant, live),
    /RouteConfigLoadEnd does not arrive after its own cancel/,
  );
});

test('mutant: a route-config event given an id reddens', () => {
  const mutant = clone(loadRecord());
  const start = mutant.warm.events.find((event) => event.type === 9);
  start.keys = ['id', 'route', 'type'];
  start.payload.id = start.payload.route.path;
  assert.throws(
    () => validate(mutant, live),
    /RouteConfigLoadStart carries an id, and those two events carry route and type only/,
  );
});

test('mutant: a holder field in currentNavigation() reddens the absence', () => {
  const mutant = clone(loadRecord());
  mutant.absences['no-holder-recorded'].currentNavigationFields.push('guard');
  assert.throws(
    () => validate(mutant, live),
    /no-holder-recorded: the whole field list/,
  );
});

test('mutant: a produced code that no run produced reddens', () => {
  const mutant = clone(loadRecord());
  const row = mutant.events.codes.cancellation.find(
    (entry) => entry.name === 'GuardRejected',
  );
  row.producedByARun = true;
  row.producedBy = { frame: 'superseded', t: 1, reason: 'refused' };
  assert.throws(
    () => validate(mutant, live),
    /events\.codes\.cancellation\[GuardRejected\] is produced and the recorded frames carry no code 3/,
  );
});

test('mutant: a renamed fixture guard reddens naming the file', () => {
  const mutant = clone(loadRecord());
  mutant.guards.fixture.canActivateNames = ['anonymousGuard'];
  assert.throws(
    () => validate(mutant, live),
    /guards\.fixture names its canActivate "anonymousGuard" and spikes\/ng222-app\/src\/app\/redirect-guard\.ts exports "redirectGuard"/,
  );
});

test('mutant: a Router token in the first path entry reddens', () => {
  const mutant = clone(loadRecord());
  mutant.reach.routerTokenEntry = 0;
  mutant.reach.appInjectorIsTheFirstEntry = true;
  assert.throws(
    () => validate(mutant, live),
    /the first entry is the element injector and the app injector is not the first entry/,
  );
});

test('mutant: a skip recorded with another code reddens', () => {
  const mutant = clone(loadRecord());
  mutant.terminals.skip.event.payload.code = 1;
  mutant.terminals.skip.event.payload.code = 1;
  assert.throws(
    () => validate(mutant, live),
    /terminals\.skip\.event carries code 1; the measured skip is code 0/,
  );
});

test('mutant: a resolver claimed on the portal reddens the named absence', () => {
  const mutant = clone(loadRecord());
  mutant.absences['no-resolver-configured'].portal.resolveKeysTotal = 2;
  assert.throws(
    () => validate(mutant, live),
    /no-resolver-configured: portal records 2 resolve key\(s\)/,
  );
});

test('mutant: a terminal payload with an extra key reddens', () => {
  const mutant = clone(loadRecord());
  mutant.terminals.cancel.event.payload.guard = 'featureFlagGuard';
  mutant.terminals.cancel.event.keys = [
    ...mutant.terminals.cancel.event.keys,
    'guard',
  ].sort();
  assert.throws(
    () => validate(mutant, live),
    /terminals\.cancel\.event: the payload keeps .*so it does not keep the keys the event carried and no others/,
  );
});

test('mutant: an empty guard-verdict comparison reddens', () => {
  const mutant = clone(loadRecord());
  mutant.absences[
    'guard-verdict-not-recorded'
  ].refusedGuardVersusUnmatchedUrl.comparison.classSequenceEqual = false;
  assert.throws(
    () => validate(mutant, live),
    /classSequenceEqual is false, so a refused guard is not structurally identical to an unmatched URL/,
  );
});

test('mutant: an error event whose target became null reddens', () => {
  const mutant = clone(loadRecord());
  mutant.terminals.error.event.payload.target = null;
  assert.throws(
    () => validate(mutant, live),
    /terminals\.error\.event\.payload\.target is null; the measurement recorded it as undefined/,
  );
});
