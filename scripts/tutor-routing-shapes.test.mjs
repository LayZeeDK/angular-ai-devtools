// @ts-check
// Run: node --test scripts/tutor-routing-shapes.test.mjs
// Armed (the only writer this milestone has):
//   set "M058_CAPTURE=1"&& node --test scripts/tutor-routing-shapes.test.mjs
//
// M058 T001 measured what the records this milestone's answer may cite actually state, and the one
// reach the record states: the recorded navigation stream (`research/raw/m041-navigation.json`), the
// recorded router config (`research/raw/m030-router-config.json`), the one coded console message the
// router emits for a URL no route matches (`research/raw/m033-router-diagnostic.json`), and the
// injector walk `extension/agent-main.js:1750-1839` already makes. `research/raw/m058-record-shapes.json`
// is that measurement: the field map every later wave is bound to, the two absences stated as the
// answer's vocabulary, the attribution rule, the reach, and the inventory naming the two records this
// milestone still owes.
//
// Nothing here is captured from a page: the reach is the page's say, recorded by M041, and this suite
// re-derives it from that record and from the agent's own source. No page is opened, no build is run and
// no browser is started.
//
// A record nobody re-reads drifts the way a comment does, so this suite holds the recording to the tree
// four ways:
//
//   citations   every `path:line` the recording makes is re-resolved by reading the file it names and
//               searching that file for the exact line the recording quotes — never by trusting the
//               typed number, and never by trusting the quotation either. Each citation's needle must
//               select exactly one line of its file, so a quotation that could mean two lines is
//               refused at capture rather than read as either.
//   the field map
//               every terminal class's key set, the config's five fields and its row shapes, and the
//               attribution rule are re-derived from the records, so a wave that names a field the
//               records do not declare reddens here rather than in a later wave (SC1).
//   the two absences
//               `no-guard-verdict` and `no-redirect-decision` are re-derived from the shapes that force
//               them — `GuardsCheckEnd`'s single aggregate field, the refused and unmatched frames'
//               identical class sequence, `Redirect`'s unproduced code and the redirect frame's zero
//               cancels — and neither is stated as a gap a capture could fill (SC3's vocabulary, C1).
//   the reach   held-out E9: entry 2 of the 5-entry injector path holds the `Router` token, that token
//               resolves to the instance the agent's own walk reads, and the record states "No new tap
//               is needed". A reach that names a new tap, a second observable or a live page read
//               reddens the check below (SC6, E9).
//
// `inventory.outsideTheMap` names exactly the two records this milestone owes — the surface record T003
// writes and the verdict-claims record T004 writes — from the start, so the two inventory suites read
// this milestone's records as excused by the map rather than as unmeasured.
//
// One file is written by this suite and only behind the opt-in switch: a default run derives every
// field and asserts the committed recording is exactly what this head states, and an armed run writes
// only when a byte moved, so two armed runs in a row are byte-identical (D5).
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RECORD_REL = 'research/raw/m058-record-shapes.json';
const RECORD_PATH = join(ROOT, ...RECORD_REL.split('/'));

/** The four files this map is measured from: three records and the agent's own reach. */
const NAV = 'research/raw/m041-navigation.json';
const CONFIG = 'research/raw/m030-router-config.json';
const DIAGNOSTIC = 'research/raw/m033-router-diagnostic.json';
const AGENT = 'extension/agent-main.js';

const SCHEMA = 'm058-record-shapes/v1';
const MILESTONE = 'M058';
const TASK = 'T001';
const TITLE = 'Measure what the records and the reach state';
const QUESTION =
  'which fields do the recorded navigation stream and the recorded router config state, what does the one reachable Router token and the one coded diagnostic state instead, and which two members the roadmap’s answer promises are in no record at all?';
const CHECK_COMMAND = 'node --test scripts/tutor-routing-shapes.test.mjs';
const ARMED_COMMAND = `set "M058_CAPTURE=1"&& ${CHECK_COMMAND}`;
const HEAD_COMMAND = 'git rev-parse HEAD';

/** The criteria this task answers, read from the task file rather than retyped as a claim. */
const CRITERIA = ['SC1', 'SC6'];

/** The two records this milestone owes, and so the only paths its map may name outside itself (D1). */
const OWED = Object.freeze({
  surface: 'research/raw/m058-surface.json',
  verdictClaims: 'research/raw/m058-verdict-claims.json',
});

/** The four classes a navigation can terminate in, in the order the record lists them. */
const TERMINAL_CLASSES = Object.freeze([
  'NavigationEnd',
  'NavigationCancel',
  'NavigationError',
  'NavigationSkipped',
]);

/** The citation each terminal's key set is read from. */
const TERMINAL_CITATION = Object.freeze({
  NavigationEnd: 'terminalEnd',
  NavigationCancel: 'terminalCancel',
  NavigationError: 'terminalError',
  NavigationSkipped: 'terminalSkip',
});

/** The five fields a configured row states, in the order the record lists them. */
const CONFIG_FIELDS = Object.freeze([
  'path',
  'component',
  'redirectTo',
  'canActivate',
  'loadChildren',
]);

/**
 * The two observables the answer is produced from and no third (SC6, N6): the stream the agent already
 * subscribes to, and the config the recorded rows state.
 */
const REACH_OBSERVABLES = Object.freeze(['router.events', 'router.config']);

/** The reach's one sentence, quoted from the record: the walk adds nothing to the page's own read. */
const NO_NEW_TAP = 'No new tap is needed.';

/**
 * The three ways a reach could ask the page for more than it already gives, each as the words a
 * recording would have to carry to name it. The check below scans the reach's own strings, so a
 * recording that says any of these is refused rather than read as a reach (SC6, N6).
 */
const REACH_REFUSALS = Object.freeze([
  {
    defect: 'a new tap',
    needle: /(?:new|second|another|its own)\s+tap/i,
  },
  {
    defect: 'a second observable',
    needle:
      /router\.(?:routerState|url|currentNavigation)\b|currentNavigation\(/,
  },
  {
    defect: 'a live page read',
    needle:
      /document\.|window\.|console\.|localStorage|sessionStorage|fetch\(|XMLHttpRequest|MutationObserver|addEventListener|getComputedStyle/,
  },
]);

/**
 * The reaches the agent's cited range must not carry: a walk that starts its own observer or reads the
 * page directly is a tap whatever it is called (N6). Every one of these is a needle a page-side read
 * needs, and the range holds none of them.
 */
const TAP_NEEDLES = Object.freeze([
  'document.',
  'window.',
  'console.',
  'localStorage',
  'sessionStorage',
  'fetch(',
  'XMLHttpRequest',
  'MutationObserver',
  'addEventListener',
  'setInterval',
  'setTimeout',
  'performance.',
  'getComputedStyle',
  'currentNavigation(',
  'navigator.',
]);

/** The switch that arms the one write this suite has (D5). */
const CAPTURE = process.env.M058_CAPTURE === '1';

/** The bytes a read-only pin holds the file to, re-based after an armed run's own write. */
const SHA_AT_LOAD = existsSync(RECORD_PATH)
  ? sha256(readFileSync(RECORD_PATH))
  : null;
/** @type {string | null} */
let baseline = SHA_AT_LOAD;

// ---------------------------------------------------------------- helpers ----

/**
 * A refusal to measure further, thrown rather than asserted so the message names the field.
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

/** @param {import('node:crypto').BinaryLike} bytes @returns {string} */
function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * The bytes the recording is written as, and re-read as, on every run: one canonical serialisation, so
 * an armed run that changes nothing cannot change a byte.
 * @param {unknown} record
 * @returns {string}
 */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/**
 * The first 70 characters of a quotation, for a failure message that stays readable.
 * @param {string} text
 * @returns {string}
 */
function short(text) {
  return text.length <= 70 ? text : `${text.slice(0, 70)}…`;
}

/** @type {Map<string, readonly string[]>} */
const LINES = new Map();

/**
 * The lines of a repository file, split the way a line number counts them.
 * @param {string} rel
 * @returns {readonly string[]}
 */
function linesOf(rel) {
  if (!LINES.has(rel)) {
    const path = join(ROOT, ...rel.split('/'));
    assert.ok(existsSync(path), `${rel} is a file this tree carries`);
    LINES.set(rel, readFileSync(path, 'utf8').split(/\r?\n/));
  }
  return LINES.get(rel) ?? [];
}

/**
 * One record under `research/raw/`, parsed.
 * @param {string} rel
 * @returns {any}
 */
function jsonOf(rel) {
  return JSON.parse(readFileSync(join(ROOT, ...rel.split('/')), 'utf8'));
}

/**
 * Every 1-indexed line of `rel` whose trimmed text carries `needle`.
 * @param {string} rel
 * @param {string} needle
 * @returns {number[]}
 */
function linesCarrying(rel, needle) {
  const lines = linesOf(rel);
  /** @type {number[]} */
  const found = [];
  for (let index = 0; index < lines.length; index += 1)
    if (String(lines[index] ?? '').includes(needle)) found.push(index + 1);
  return found;
}

/**
 * The line a needle selects, refusing a needle that selects none or more than one: a citation has to
 * name one line, so the search has to answer with one.
 * @param {string} rel
 * @param {string} needle
 * @param {string} where
 * @returns {number}
 */
function lineOf(rel, needle, where) {
  const found = linesCarrying(rel, needle);
  assert.equal(
    found.length,
    1,
    `${where}: searching ${rel} for ${JSON.stringify(short(needle))} finds it on ${found.length} line(s) (${found.join(', ')}), and a citation names exactly one line`,
  );
  return found[0] ?? fail(`${where}: ${rel} holds no line carrying the needle`);
}

/**
 * The trimmed text of one line, refusing a line the file does not reach.
 * @param {string} rel
 * @param {number} line
 * @returns {string}
 */
function textAt(rel, line) {
  const lines = linesOf(rel);
  assert.ok(
    Number.isInteger(line) && line >= 1 && line <= lines.length,
    `${rel}:${String(line)} is not a line of a file of ${lines.length}`,
  );
  return String(lines[line - 1] ?? '').trim();
}

/**
 * The first place two values differ, as `path: recorded -> derived`; arrays are walked row by row.
 * @param {any} left
 * @param {any} right
 * @param {string} at
 * @returns {string}
 */
function firstDifference(left, right, at) {
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length)
      return `${at}: ${left.length} row(s) -> ${right.length} row(s)`;
    for (let index = 0; index < left.length; index += 1) {
      const found = firstDifference(
        left[index],
        right[index],
        `${at}[${index}]`,
      );
      if (found !== '') return found;
    }
    return '';
  }
  if (isObject(left) && isObject(right)) {
    for (const key of [
      ...new Set([...Object.keys(left), ...Object.keys(right)]),
    ]) {
      const found = firstDifference(
        left[key],
        right[key],
        at === '' ? key : `${at}.${key}`,
      );
      if (found !== '') return found;
    }
    return '';
  }
  if (JSON.stringify(left) === JSON.stringify(right)) return '';
  return `${at}: ${JSON.stringify(left)} -> ${JSON.stringify(right)}`;
}

/**
 * Every string inside `value`, keyed by the path it sits at.
 * @param {any} value
 * @param {string} [at]
 * @param {Array<[string, string]>} [out]
 * @returns {Array<[string, string]>}
 */
function stringsIn(value, at = '', out = []) {
  if (typeof value === 'string') {
    out.push([at, value]);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => stringsIn(item, `${at}[${index}]`, out));
    return out;
  }
  if (isObject(value))
    for (const [key, inner] of Object.entries(value))
      stringsIn(inner, at === '' ? key : `${at}.${key}`, out);
  return out;
}

// -------------------------------------------------------------- citations ----

/**
 * Every citation this map makes: the field it states and the exact text that names its line. Only the
 * needle is written here; the line number, the quoted text and the promise that the needle selects one
 * line are all measured by searching the file, at capture and again on every read.
 */
const CITATION_SPEC = Object.freeze([
  // The stream's own shape, from the chunk's enumeration and the record's observation of it.
  { id: 'navEnumerated', path: NAV, needle: '"enumerated": 16,' },
  {
    id: 'navObservedClassCount',
    path: NAV,
    needle: '"observedClassCount": 16,',
  },
  { id: 'terminalEnd', path: NAV, needle: '"name": "NavigationEnd",' },
  { id: 'terminalCancel', path: NAV, needle: '"name": "NavigationCancel",' },
  { id: 'terminalError', path: NAV, needle: '"name": "NavigationError",' },
  { id: 'terminalSkip', path: NAV, needle: '"name": "NavigationSkipped",' },
  // The redirect: a code no run produced, a frame with no cancel, a change of URL only.
  {
    id: 'redirectProducedNoCancel',
    path: NAV,
    needle: '"redirectProducedNoCancel": {',
  },
  { id: 'redirectFrameEvents', path: NAV, needle: '"events": 11,' },
  {
    id: 'redirectNoCancelFinding',
    path: NAV,
    needle: 'A route redirect from /redirect to /landing emitted 11 events',
  },
  // The guard verdict the stream does not carry.
  {
    id: 'guardVerdictNamed',
    path: NAV,
    needle: '"named": "guard-verdict-not-recorded",',
  },
  { id: 'guardsCheckEndKeys', path: NAV, needle: '"guardsCheckEndKeys": [' },
  {
    id: 'guardFieldsInThatPayload',
    path: NAV,
    needle: '"guardFieldsInThatPayload": [',
  },
  {
    id: 'guardFieldsAreAggregateOnly',
    path: NAV,
    needle: '"guardFieldsAreAggregateOnly": true,',
  },
  {
    id: 'guardVerdictFinding',
    path: NAV,
    needle: 'GuardsCheckEnd adds exactly 1 field over GuardsCheckStart',
  },
  {
    id: 'guardNamesInEitherPayload',
    path: NAV,
    needle: '"guardNamesInEitherPayload": []',
  },
  {
    id: 'refusedVersusUnmatchedSameClassSequence',
    path: NAV,
    needle: '"classSequenceEqual": true,',
  },
  {
    id: 'noCancelInEither',
    path: NAV,
    needle: '"hasNavigationCancelInEither": false,',
  },
  // The attribution rule, and the two timing facts that make arrival order the wrong one.
  { id: 'attribution', path: NAV, needle: 'by route.path in the event' },
  {
    id: 'cancelToLoadEndMs',
    path: NAV,
    needle: '"cancelToAbandonedLoadEndMs": 1192.1,',
  },
  {
    id: 'loadEndToSuccessorMs',
    path: NAV,
    needle: '"abandonedLoadEndToSuccessorLoadEndMs": 314.8',
  },
  // The reach.
  { id: 'reachFunction', path: NAV, needle: '"function": "routerTokenFrom",' },
  {
    id: 'reachCite',
    path: NAV,
    needle: '"cite": "extension/agent-main.js:1750-1839",',
  },
  { id: 'reachTokenField', path: NAV, needle: '"tokenField": "record.token"' },
  { id: 'reachPathEntryCount', path: NAV, needle: '"pathEntryCount": 5,' },
  { id: 'reachRouterTokenEntry', path: NAV, needle: '"routerTokenEntry": 2,' },
  {
    id: 'reachRouterTokenEntrySource',
    path: NAV,
    needle: '"routerTokenEntrySource": "Environment Injector",',
  },
  {
    id: 'reachResolvesToTheRouterInstance',
    path: NAV,
    needle: '"routerTokenResolvesToTheRouterInstance": true',
  },
  { id: 'reachNote', path: NAV, needle: 'yields 90 token names' },
  { id: 'reachNoNewTap', path: NAV, needle: 'No new tap is needed.' },
  {
    id: 'reachNotTheFirstEntry',
    path: NAV,
    needle: '"appInjectorIsTheFirstEntry": false,',
  },
  {
    id: 'reachProvidesAreNotTheField',
    path: NAV,
    needle: '"providerProvideIsTheFieldThatFindsIt": false,',
  },
  // The config.
  { id: 'configFieldsPresent', path: CONFIG, needle: '"fieldsPresent": [' },
  { id: 'configRedirectRow', path: CONFIG, needle: '"path": "redirect",' },
  { id: 'configRedirectTo', path: CONFIG, needle: '"redirectTo": "landing"' },
  { id: 'configLoopARow', path: CONFIG, needle: '"path": "loop-a",' },
  { id: 'configLoopATo', path: CONFIG, needle: '"redirectTo": "loop-b"' },
  { id: 'configLoopBRow', path: CONFIG, needle: '"path": "loop-b",' },
  { id: 'configGatedRow', path: CONFIG, needle: '"path": "gated",' },
  { id: 'configGuardName', path: CONFIG, needle: '"[fn redirectGuard]"' },
  { id: 'configLazyRow', path: CONFIG, needle: '"path": "lazy",' },
  {
    id: 'configLoadChildren',
    path: CONFIG,
    needle: '"loadChildren": "[fn loadChildren]"',
  },
  // The diagnostic.
  {
    id: 'diagnosticCodedMessage',
    path: DIAGNOSTIC,
    needle: '"withAnNgCode": 1,',
  },
  { id: 'diagnosticDigest', path: DIAGNOSTIC, needle: '"codesNotCarried": [' },
  {
    id: 'diagnosticCarriesNoCode',
    path: DIAGNOSTIC,
    needle: '"digestCarriesCode": false,',
  },
  {
    id: 'diagnosticNamesNoConfiguredRoute',
    path: DIAGNOSTIC,
    needle: '"namesConfiguredRoutePath": false',
  },
  {
    id: 'diagnosticRestatesTheFields',
    path: DIAGNOSTIC,
    needle: '"fieldsPresent": [',
  },
  // The agent's own walk, which is the reach the record states.
  {
    id: 'agentRouterTokenFrom',
    path: AGENT,
    needle:
      'function routerTokenFrom(element, getInjector, getPath, getProviders) {',
  },
  {
    id: 'agentTokenField',
    path: AGENT,
    needle: 'if (routerTokenNameOf(token) !== ROUTER_TOKEN_NAME) continue;',
  },
  {
    id: 'agentResolvesTheInstance',
    path: AGENT,
    needle: 'router = found.injector.get(found.token);',
  },
  { id: 'agentReadsTheStream', path: AGENT, needle: 'stream = router.events;' },
  {
    id: 'agentNoNewTap',
    path: AGENT,
    needle: 'The router instance and its stream, reached from the page',
  },
]);

/**
 * The citations as this head states them: one row per needle, with the line the search found and that
 * line's own trimmed text. The number is never typed, so it cannot be typed wrong.
 * @returns {Array<{ id: string, path: string, line: number, text: string }>}
 */
function deriveCitations() {
  return CITATION_SPEC.map((spec) => {
    const where = `citation ${spec.id}`;
    const line = lineOf(spec.path, spec.needle, where);
    return {
      id: spec.id,
      path: spec.path,
      line,
      text: textAt(spec.path, line),
    };
  });
}

/** The citations by id, for the checks that resolve a section's reference. */
const CITATIONS = deriveCitations();
const BY_ID = new Map(CITATIONS.map((citation) => [citation.id, citation]));

/**
 * One citation, re-resolved the way the task demands: by reading the file it names and searching that
 * file for the exact line it quotes. The typed number is checked against what the search found, so
 * neither the number nor the quotation is trusted on its own, and the needle the capture used must
 * still select the same single line.
 * @param {any} citation
 * @param {string} where
 * @returns {number}
 */
function resolveCitation(citation, where) {
  assert.ok(
    isObject(citation),
    `${where}: a citation is an object with a path, a line and the line's own text`,
  );
  const rel = citation.path;
  assert.equal(typeof rel, 'string', `${where}: path is a string`);
  assert.ok(
    existsSync(join(ROOT, ...String(rel).split('/'))),
    `${where}: ${String(rel)} is in the tree`,
  );
  assert.ok(
    Number.isInteger(citation.line) && citation.line >= 1,
    `${where}: line is ${String(citation.line)}, not a 1-indexed number`,
  );
  assert.equal(typeof citation.text, 'string', `${where}: text is a string`);
  assert.ok(citation.text.length > 0, `${where}: text says something`);
  assert.equal(
    citation.text,
    citation.text.trim(),
    `${where}: text carries the line's own trimmed text, not "${short(String(citation.text))}" with its indent`,
  );

  // The quotation must be one line of the file, and the cited number must be that line.
  const lines = linesOf(String(rel));
  /** @type {number[]} */
  const found = [];
  for (let index = 0; index < lines.length; index += 1)
    if (String(lines[index] ?? '').trim() === citation.text)
      found.push(index + 1);
  assert.equal(
    found.length,
    1,
    `${where}: quotes "${short(citation.text)}" and ${String(rel)} holds ${found.length} line(s) with that text at ${found.join(', ')} — a quotation that could mean more than one line names none of them`,
  );
  assert.equal(
    found[0],
    citation.line,
    `${where}: cites ${String(rel)}:${String(citation.line)} and searching the file for the quoted line finds it at ${String(found[0])} — the number is not where the line it quotes sits`,
  );

  // And the needle the recording was captured from must still select that same line.
  const spec = CITATION_SPEC.find((entry) => entry.id === citation.id);
  assert.ok(
    spec !== undefined,
    `${where}: ${String(citation.id)} is not a citation this suite knows, so the recording names a line nobody measured`,
  );
  assert.equal(
    lineOf(spec.path, spec.needle, where),
    citation.line,
    `${where}: ${String(rel)} no longer answers the needle ${JSON.stringify(short(spec.needle))} on line ${String(citation.line)}`,
  );
  return citation.line;
}

// ------------------------------------------------------------ measurement ----

/** @param {string} rel @returns {any} */
function recordOf(rel) {
  return jsonOf(rel);
}

/**
 * The stream's side of the field map: every class with the key set the chunk declares and the record
 * observed, the four terminals named apart, and the attribution rule with the two timings that force it.
 * @returns {any}
 */
function deriveStream() {
  const nav = recordOf(NAV);
  const classes = nav.events.classes;
  assert.ok(
    Array.isArray(classes) && classes.length > 0,
    `${NAV} carries the class list this side is measured over`,
  );

  const rows = classes.map((entry) => {
    const keys = entry.keys;
    const observed = entry.observed;
    return {
      name: entry.name,
      type: entry.type,
      keys,
      terminal: TERMINAL_CLASSES.includes(entry.name),
      observedKeysEqualDeclared:
        JSON.stringify(observed.keys) === JSON.stringify(keys),
      observedInFrames: Array.isArray(observed.frames)
        ? observed.frames.length
        : 0,
    };
  });

  const terminals = TERMINAL_CLASSES.map((name) => {
    const row = rows.find((entry) => entry.name === name);
    assert.ok(row, `${NAV} declares no ${name}`);
    return {
      class: name,
      type: row.type,
      keys: row.keys,
      observedKeysEqualDeclared: row.observedKeysEqualDeclared,
      observedInFrames: row.observedInFrames,
      sharesItsKeySetWith: rows
        .filter(
          (entry) =>
            entry.name !== name &&
            entry.terminal &&
            JSON.stringify(entry.keys) === JSON.stringify(row.keys),
        )
        .map((entry) => entry.name),
      citationId: TERMINAL_CITATION[name],
    };
  });

  const ordering = nav.superseded.ordering;
  return {
    carriedBy: NAV,
    enumerated: nav.events.enumerated,
    observedClassCount: nav.events.observedClassCount,
    classCount: rows.length,
    scrollOutsideTheSixteen: !rows.some((entry) => entry.name === 'Scroll'),
    scrollRecordedAsOutsideTheSixteen:
      nav.events.scroll?.inTheEnumeratedSixteen === false,
    everyKeySetObservedAsDeclared: rows.every(
      (entry) => entry.observedKeysEqualDeclared,
    ),
    terminals,
    classes: rows,
    attribution: {
      rule: nav.superseded.attribution,
      by: ['id', 'route.path'],
      ordering: {
        cancelAt: ordering.cancelAt,
        abandonedLoadEndAt: ordering.abandonedLoadEndAt,
        successorLoadEndAt: ordering.successorLoadEndAt,
        cancelToAbandonedLoadEndMs: ordering.cancelToAbandonedLoadEndMs,
        abandonedLoadEndToSuccessorLoadEndMs:
          ordering.abandonedLoadEndToSuccessorLoadEndMs,
        abandonedLoadEndIsAfterItsOwnCancel:
          ordering.abandonedLoadEndIsAfterItsOwnCancel,
        abandonedLoadEndIsBeforeTheSuccessorLoadEnd:
          ordering.abandonedLoadEndIsBeforeTheSuccessorLoadEnd,
      },
      citationIds: ['attribution', 'cancelToLoadEndMs', 'loadEndToSuccessorMs'],
    },
    citationIds: [
      'navEnumerated',
      'navObservedClassCount',
      'terminalEnd',
      'terminalCancel',
      'terminalError',
      'terminalSkip',
    ],
  };
}

/**
 * The config's side: the five fields a configured row states, over the rows the record carries, with
 * the redirect-shaped rows and the one row that carries a named guard. The diagnostic record states the
 * same rows and the same fields a second time, which is what makes the route claim a config reading
 * rather than a diagnostic one (C2).
 * @returns {any}
 */
function deriveConfig() {
  const config = recordOf(CONFIG);
  const restated = recordOf(DIAGNOSTIC);
  const rows = config.config;
  assert.ok(
    Array.isArray(rows) && rows.length > 0,
    `${CONFIG} carries the configured rows this side is measured over`,
  );
  const fields = config.fieldsPresent;
  assert.deepEqual(
    [...fields].sort(),
    [...CONFIG_FIELDS].sort(),
    `${CONFIG} states the five fields this side is measured over`,
  );

  /** @type {Set<string>} */
  const keys = new Set();
  for (const row of rows) for (const key of Object.keys(row)) keys.add(key);

  return {
    carriedBy: CONFIG,
    fields,
    rows: rows.length,
    rowsCarrying: Object.fromEntries(
      CONFIG_FIELDS.map((field) => [
        field,
        rows.filter((row) => field in row).length,
      ]),
    ),
    fieldsCarriedByNoRow: fields.filter(
      (field) => !rows.some((row) => field in row),
    ),
    keysOutsideTheFive: [...keys].filter((key) => !fields.includes(key)).sort(),
    configuredPaths: rows.map((row) => row.path),
    redirectShaped: rows
      .filter((row) => 'redirectTo' in row)
      .map((row) => ({
        path: row.path,
        redirectTo: row.redirectTo,
        carriesComponent: 'component' in row,
      })),
    guardCarrying: rows
      .filter((row) => Array.isArray(row.canActivate))
      .map((row) => {
        const named = /\[fn ([^\]]+)\]/.exec(String(row.canActivate[0]));
        return {
          path: row.path,
          component: row.component,
          canActivate: row.canActivate,
          guardName: named === null ? null : named[1],
        };
      }),
    restatedBy: {
      path: DIAGNOSTIC,
      rows: Array.isArray(restated.config) ? restated.config.length : 0,
      fields: restated.fieldsPresent,
      sameRows: JSON.stringify(restated.config) === JSON.stringify(rows),
      sameFields:
        JSON.stringify(restated.fieldsPresent) === JSON.stringify(fields),
      citationId: 'diagnosticRestatesTheFields',
    },
    citationIds: [
      'configFieldsPresent',
      'configRedirectRow',
      'configRedirectTo',
      'configLoopARow',
      'configLoopATo',
      'configLoopBRow',
      'configGatedRow',
      'configGuardName',
      'configLazyRow',
      'configLoadChildren',
    ],
  };
}

/**
 * The diagnostic's side: one coded console message, naming the segment it could not match and none of
 * the configured paths. The join's route half therefore reads the config and never a diagnostic (C2).
 * @returns {any}
 */
function deriveDiagnostic() {
  const diagnostic = recordOf(DIAGNOSTIC);
  const config = recordOf(CONFIG);
  const messages = Array.isArray(diagnostic.ngCodedMessages)
    ? diagnostic.ngCodedMessages
    : [];
  assert.ok(
    messages.length > 0,
    `${DIAGNOSTIC} carries the coded message this side is measured over`,
  );
  const text = messages
    .map((message) => String(message?.text ?? ''))
    .join('\n');
  const segment = /URL Segment: '([^']+)'/.exec(text);
  const named = config.config
    .filter((row) => text.includes(String(row.path)))
    .map((row) => row.path);

  return {
    carriedBy: DIAGNOSTIC,
    codedMessages: messages.length,
    consoleMessages: diagnostic.console?.total ?? 0,
    code: messages[0]?.code ?? null,
    segment: segment === null ? null : segment[1],
    statesItNamesNoConfiguredRoutePath: messages.every(
      (message) => message?.namesConfiguredRoutePath === false,
    ),
    configuredPathsNamedByTheMessage: named,
    configuredPathsCompared: config.config.length,
    statesTheDigestCarriesNoCode: messages.every(
      (message) => message?.digestCarriesCode === false,
    ),
    codesNotCarried: diagnostic.digest?.codesNotCarried ?? [],
    readsASegmentAndNoRoute: segment !== null && named.length === 0,
    citationIds: [
      'diagnosticCodedMessage',
      'diagnosticDigest',
      'diagnosticCarriesNoCode',
      'diagnosticNamesNoConfiguredRoute',
    ],
  };
}

/**
 * The two absences, each with the shapes that force it and never as a gap a capture could fill (C1, D7).
 * Both are re-derived: `GuardsCheckEnd`'s extra field is read off the two class key sets, the refused and
 * unmatched frames' identity off the comparison the record carries, and the redirect's lack of a
 * decision off the cancellation codes, the frame's own event list and the terminal the frame ends in.
 * @returns {any}
 */
function deriveAbsences() {
  const nav = recordOf(NAV);
  const guard = nav.absences['guard-verdict-not-recorded'];
  const classes = nav.events.classes;
  const endKeys =
    classes.find((entry) => entry.name === 'GuardsCheckEnd')?.keys ?? [];
  const startKeys =
    classes.find((entry) => entry.name === 'GuardsCheckStart')?.keys ?? [];
  const comparison = guard.refusedGuardVersusUnmatchedUrl.comparison;
  const codes = nav.events.codes;
  const redirectCode =
    codes.cancellation.find((code) => code.name === 'Redirect') ?? {};
  const redirectFrame = codes.redirectProducedNoCancel;
  const frame = nav.terminals.redirect;

  return {
    notGaps:
      'Both are states the answer renders, never a gap a capture could fill: no record this repository holds carries a guard verdict or a redirect decision, so no later run can add one and neither is stated as something missing.',
    'no-guard-verdict': {
      state: 'no-guard-verdict',
      carriedBy: NAV,
      guardsCheckEndKeys: endKeys,
      guardsCheckStartKeys: startKeys,
      guardsCheckEndAddsOverGuardsCheckStart: endKeys.filter(
        (key) => !startKeys.includes(key),
      ),
      removedByGuardsCheckEnd: startKeys.filter(
        (key) => !endKeys.includes(key),
      ),
      guardFieldsInThatPayload: guard.guardFieldsInThatPayload,
      guardFieldsAreAggregateOnly: guard.guardFieldsAreAggregateOnly,
      guardNamesInEitherPayload: comparison.guardNamesInEitherPayload,
      refusedVersusUnmatched: {
        eventCount: comparison.refusedClassSequence.length,
        eventCountEqual: comparison.eventCountEqual,
        classSequenceEqual: comparison.classSequenceEqual,
        keySequenceEqual: comparison.keySequenceEqual,
        terminalClass: comparison.refusedTerminalClass,
        hasNavigationCancelInEither: comparison.hasNavigationCancelInEither,
        differingPayloadPaths: comparison.differingPayloadPaths.length,
        differingPathsAreTheNavigationsOwn:
          comparison.differingPayloadPaths.every((path) =>
            /(?:^|\.)(?:id|url|urlAfterRedirects|state\.url)$/.test(path),
          ),
      },
      finding: guard.finding,
      citationIds: [
        'guardVerdictNamed',
        'guardsCheckEndKeys',
        'guardFieldsInThatPayload',
        'guardFieldsAreAggregateOnly',
        'guardVerdictFinding',
        'guardNamesInEitherPayload',
        'refusedVersusUnmatchedSameClassSequence',
        'noCancelInEither',
      ],
    },
    'no-redirect-decision': {
      state: 'no-redirect-decision',
      carriedBy: NAV,
      cancellationCode: {
        enum: 'NavigationCancellationCode',
        name: redirectCode.name ?? null,
        value: redirectCode.value ?? null,
        producedByARun: redirectCode.producedByARun ?? null,
      },
      producedCancellationCodes: codes.cancellation
        .filter((code) => code.producedByARun)
        .map((code) => code.name),
      frame: {
        frame: redirectFrame.frame,
        events: redirectFrame.events,
        cancelCount: redirectFrame.cancelCount,
        url: redirectFrame.url,
        urlAfterRedirects: redirectFrame.urlAfterRedirects,
      },
      eventsInTheFrame: frame.events.length,
      cancelsInTheFrame: frame.events.filter(
        (event) => event.class === 'NavigationCancel',
      ).length,
      terminalClass: frame.terminal.class,
      differsOnlyIn: ['url', 'urlAfterRedirects'],
      finding: frame.finding,
      citationIds: [
        'redirectProducedNoCancel',
        'redirectFrameEvents',
        'redirectNoCancelFinding',
      ],
    },
  };
}

/**
 * The reach the record states, re-derived from `research/raw/m041-navigation.json`'s `reach` section and
 * from the agent's own source: the entry that holds the token is found by searching the walked path, the
 * range the record cites is scanned for every needle a tap would need, and the sentence that says no tap
 * is needed is located where the record actually carries it.
 * @returns {any}
 */
function deriveReach() {
  const reach = recordOf(NAV).reach;
  const path = reach.path.map((entry) => ({
    index: entry.index,
    metadataSource: entry.metadataSource,
    hasRouterToken: entry.hasRouterToken,
    routerTokenResolvesToTheRouterInstance:
      entry.routerTokenResolvesToTheRouterInstance,
  }));
  const carriers = path.filter((entry) => entry.hasRouterToken === 1);
  assert.equal(
    carriers.length,
    1,
    `${NAV} names ${carriers.length} entries that hold the Router token, and the reach is one entry`,
  );
  const carrier = carriers[0];
  const sentenceCarriedBy = Object.keys(reach).filter(
    (key) =>
      typeof reach[key] === 'string' && String(reach[key]).includes(NO_NEW_TAP),
  );

  const cite = String(reach.readFrom.cite);
  const range = /^([^:]+):(\d+)-(\d+)$/.exec(cite);
  assert.ok(
    range !== null,
    `${NAV} cites the agent's reach as ${cite}, which is not a path:line-line range`,
  );
  const startLine = Number(range[2]);
  const endLine = Number(range[3]);
  const rangeLines = linesOf(range[1]).slice(startLine - 1, endLine);
  const tapNeedlesInTheRange = [];
  for (const needle of TAP_NEEDLES) {
    for (let index = 0; index < rangeLines.length; index += 1)
      if (String(rangeLines[index] ?? '').includes(needle))
        tapNeedlesInTheRange.push(`${needle} at ${startLine + index}`);
  }

  return {
    question:
      'Is the Router reachable from the read the agent already produces, and does that read need a tap of its own?',
    finding:
      'The config half of every claim is read through the Router token the agent’s own injector walk already resolves, and the stream half through the one subscription that walk already makes: the reach adds nothing to the page and asks it nothing new.',
    readFrom: {
      source: reach.readFrom.source,
      function: reach.readFrom.function,
      cite,
      calls: reach.readFrom.calls,
      tokenField: reach.readFrom.tokenField,
      citationIds: ['reachFunction', 'reachCite', 'reachTokenField'],
    },
    pathEntryCount: path.length,
    pathEntryCountAsTheRecordStatesIt: reach.pathEntryCount,
    path,
    routerTokenEntry: carrier.index,
    routerTokenEntryAsTheRecordStatesIt: reach.routerTokenEntry,
    routerTokenEntrySource: carrier.metadataSource,
    oneEntryHoldsTheRouterToken: carriers.length === 1,
    tokenFieldIsTheFieldThatFindsIt: reach.tokenFieldIsTheFieldThatFindsIt,
    providerProvideIsNotTheField:
      reach.providerProvideIsTheFieldThatFindsIt === false,
    appInjectorIsNotTheFirstEntry: reach.appInjectorIsTheFirstEntry === false,
    noNewTap: {
      sentence: NO_NEW_TAP,
      carriedBy: sentenceCarriedBy,
      citationId: 'reachNoNewTap',
    },
    note: reach.note,
    reads: [
      {
        observable: 'router.events',
        where: 'extension/agent-main.js',
        citationId: 'agentReadsTheStream',
      },
      {
        observable: 'router.config',
        where: CONFIG,
        citationId: 'configFieldsPresent',
      },
    ],
    taps: [],
    agentRange: {
      cite,
      startLine,
      endLine,
      lineCount: endLine - startLine + 1,
      holdsTheWalk: rangeLines.some((line) =>
        String(line).includes(`function ${reach.readFrom.function}(`),
      ),
      tapNeedlesInTheRange,
    },
    citationIds: [
      'reachFunction',
      'reachCite',
      'reachTokenField',
      'reachPathEntryCount',
      'reachRouterTokenEntry',
      'reachRouterTokenEntrySource',
      'reachResolvesToTheRouterInstance',
      'reachNote',
      'reachNoNewTap',
      'reachNotTheFirstEntry',
      'reachProvidesAreNotTheField',
      'agentRouterTokenFrom',
      'agentTokenField',
      'agentResolvesTheInstance',
      'agentReadsTheStream',
      'agentNoNewTap',
    ],
  };
}

/**
 * The inventory: this map measures no record of its own, and it names the two records this milestone owes
 * outside itself from the start, so no later wave has to touch the map to have its record excused (D1).
 * @returns {any}
 */
function deriveInventory() {
  return {
    measured:
      'No record under `research/raw/` is measured by this map: its citations are lines of the two records this milestone’s answer reads, of the one diagnostic record it refuses to read a route from, and of the agent’s own walk, so the map measures the fields the later waves cite rather than a census of records.',
    outsideTheMap: [
      {
        path: OWED.surface,
        why: 'the surface record M058 T003 writes — the route, the loader key and each state with the answer field it reads — is captured after this map was measured, so it is named outside the map rather than read as an unmeasured record',
      },
      {
        path: OWED.verdictClaims,
        why: 'the verdict-claims record M058 T004 writes, ruling the criteria this milestone’s intent declares, is captured after this map was measured, so it is named outside the map rather than read as an unmeasured record',
      },
    ],
  };
}

/**
 * The three records this map is measured from and the agent source the reach is crossed against, each
 * with what it carries and where it was captured, so a later wave names one record and reads what it
 * holds rather than a record that has moved.
 * @returns {any[]}
 */
function deriveRecords() {
  const statements = [
    {
      path: NAV,
      carries:
        'the navigation stream: sixteen event classes with the key sets the installed chunk declares, four terminal classes, the held and superseded frames, the guard-verdict absence, and the reach',
      record: recordOf(NAV),
    },
    {
      path: CONFIG,
      carries:
        'the router config: the five fields a configured row states, read over every row of the fixture’s table',
      record: recordOf(CONFIG),
    },
    {
      path: DIAGNOSTIC,
      carries:
        'the one coded console message the router emits for a URL no configured path matches, with the segment it names and the route it does not',
      record: recordOf(DIAGNOSTIC),
    },
  ];
  return statements.map(({ path, carries, record }) => ({
    path,
    carries,
    task: record.task ?? null,
    capturedAt: record.capturedAt ?? null,
    captureCommand: record.capture?.command ?? record.commands?.capture ?? null,
    citationIds: CITATION_SPEC.filter((spec) => spec.path === path).map(
      (spec) => spec.id,
    ),
  }));
}

/**
 * The record's one-sentence verdict, built from the measured sections rather than typed: a sentence
 * written here would keep claiming the counts of the head it was written at.
 * @param {any} sections
 * @returns {string}
 */
function verdictOf(sections) {
  const stream = sections.fieldMap.stream;
  const config = sections.fieldMap.config;
  const diagnostic = sections.fieldMap.diagnostic;
  const reach = sections.reach;
  return [
    `the stream side names ${stream.enumerated} event classes and ${stream.terminals.length} terminals, each with its own key set`,
    `the config side names ${config.fields.length} fields over ${config.rows} rows, ${config.redirectShaped.length} of them redirect-shaped and ${config.guardCarrying.length} carrying a named guard`,
    `the diagnostic side names the segment it could not match and ${diagnostic.configuredPathsNamedByTheMessage.length} configured routes`,
    `the reach resolves the Router token from entry ${reach.routerTokenEntry} of a ${reach.pathEntryCount}-entry injector path with ${reach.taps.length} new taps`,
    `and no record carries a guard verdict or a redirect decision, so ${sections.absences['no-guard-verdict'].state} and ${sections.absences['no-redirect-decision'].state} are states the answer renders rather than gaps`,
  ]
    .join('; ')
    .concat('.');
}

/** The instrument: what was read, how, and what `holds` means. */
const INSTRUMENT = Object.freeze({
  reads: [NAV, CONFIG, DIAGNOSTIC, AGENT],
  how: 'statically: each record is parsed, and each line a claim rests on is found by searching its file for the text the citation quotes — never by trusting a typed number, and never by trusting the quotation either',
  holds:
    'a field map entry holds where the record’s own key list carries every name it states and this head re-derives the same value; a citation holds where searching the file for the quoted line finds it on exactly the line the recording names, and on no second line',
  nothingRun:
    'no page is opened, no build is run and no browser is started: the reach is the page’s say, recorded by research/raw/m041-navigation.json, and the agent’s own source bounds it',
});

/**
 * The field paths a re-capture re-derives, so a section that stops being produced shows up as a
 * divergence rather than as a silent pass.
 * @param {any} sections
 * @returns {string[]}
 */
function remeasuredOf(sections) {
  /** @type {string[]} */
  const fields = [];
  for (const [section, value] of Object.entries(sections)) {
    if (!isObject(value)) {
      fields.push(section);
      continue;
    }
    for (const inner of Object.keys(value)) fields.push(`${section}.${inner}`);
  }
  return fields.sort();
}

/** @returns {string} the commit this capture runs at, as `git rev-parse HEAD` answers it. */
function headAtCapture() {
  const run = spawnSync('git', ['rev-parse', 'HEAD'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  const sha = String(run.stdout ?? '').trim();
  assert.match(
    sha,
    /^[0-9a-f]{40}$/,
    `${HEAD_COMMAND} must answer with one commit sha, and it answered ${JSON.stringify(sha)}: ${String(run.stderr)}`,
  );
  return sha;
}

/**
 * The record as this head derives it. `measuredAt` is the one value no reading of the tree settles: it is
 * the time the file was first written, carried forward on every re-capture so an armed run with nothing
 * moved reproduces it and writes no byte. `head` is the commit the capture ran at, carried so the record
 * names the tree it measured rather than the one that carries it.
 * @param {string} measuredAt
 * @param {string} head
 * @returns {any}
 */
function derive(measuredAt, head) {
  const fieldMap = {
    stream: deriveStream(),
    config: deriveConfig(),
    diagnostic: deriveDiagnostic(),
  };
  const absences = deriveAbsences();
  const reach = deriveReach();
  const inventory = deriveInventory();
  return {
    schema: SCHEMA,
    milestone: MILESTONE,
    task: TASK,
    title: TITLE,
    question: QUESTION,
    verdict: verdictOf({ fieldMap, absences, reach }),
    head,
    headCommand: HEAD_COMMAND,
    measuredAt,
    instrument: INSTRUMENT,
    records: deriveRecords(),
    fieldMap,
    absences,
    reach,
    inventory,
    citations: CITATIONS,
    capture: {
      task: TASK,
      command: ARMED_COMMAND,
      check: CHECK_COMMAND,
      records: RECORD_REL,
      head,
      criteria: CRITERIA,
      reads: [NAV, CONFIG, DIAGNOSTIC, AGENT],
      remeasured: remeasuredOf({ fieldMap, absences, reach, inventory }),
      reading:
        'an armed run derives every field above from the four files it names and writes only when a byte moved; a default run derives the same values and asserts the recording on disk is exactly what this head states, so a record that drifts from the tree reddens rather than misleading a later wave',
    },
    builtNothing: {
      built: [],
      description:
        'No join, no surface, no route and no capture: this task measures what the records state, and the only file it writes is this recording.',
    },
  };
}

// ------------------------------------------------------------------ checks ----

/**
 * The sections a reading of the tree settles, in the order the recording states them. `head` is the one
 * value a later commit moves, so a read run proves it resolves and is behind this HEAD rather than
 * comparing it with a value it cannot derive.
 */
const DERIVED_SECTIONS = Object.freeze([
  'instrument',
  'verdict',
  'records',
  'fieldMap',
  'absences',
  'reach',
  'inventory',
  'capture',
  'builtNothing',
]);

/** The test's own name for held-out E9, spelled as the plan's held-out row spells it. */
const E9_TITLE =
  'held-out E9: the Router is reachable from the read the agent already produces and no new tap is needed';

/**
 * Every citation the recording makes, re-resolved, plus the promise that the recording makes every
 * citation this suite knows and names each once.
 * @param {any} recording
 * @returns {number}
 */
function checkCitations(recording) {
  assert.ok(
    Array.isArray(recording?.citations) && recording.citations.length > 0,
    'the recording makes citations',
  );
  const ids = recording.citations.map((citation) => citation.id);
  assert.equal(
    new Set(ids).size,
    ids.length,
    'each citation is named once, so a section reference names one line',
  );
  for (const citation of recording.citations)
    resolveCitation(citation, `citations[${String(citation.id)}]`);
  const missing = CITATION_SPEC.filter((spec) => !ids.includes(spec.id)).map(
    (spec) => spec.id,
  );
  assert.deepEqual(
    missing,
    [],
    `the recording must make every citation this suite knows, and it makes none for ${missing.join(', ')}`,
  );
  return recording.citations.length;
}

/**
 * Every citation a section names is one the recording makes, so a reference cannot dangle.
 * @param {any} recording
 * @returns {string[]}
 */
function referencedCitations(recording) {
  const stream = recording?.fieldMap?.stream ?? {};
  const config = recording?.fieldMap?.config ?? {};
  const diagnostic = recording?.fieldMap?.diagnostic ?? {};
  const absences = recording?.absences ?? {};
  const reach = recording?.reach ?? {};
  return [
    ...(stream.citationIds ?? []),
    ...(stream.attribution?.citationIds ?? []),
    ...(stream.terminals ?? []).map((terminal) => terminal.citationId),
    ...(config.citationIds ?? []),
    config.restatedBy?.citationId,
    ...(diagnostic.citationIds ?? []),
    ...(absences['no-guard-verdict']?.citationIds ?? []),
    ...(absences['no-redirect-decision']?.citationIds ?? []),
    ...(reach.citationIds ?? []),
    ...(reach.readFrom?.citationIds ?? []),
    reach.noNewTap?.citationId,
    ...(reach.reads ?? []).map((read) => read.citationId),
    ...(recording?.records ?? []).flatMap((record) => record.citationIds ?? []),
  ].filter((id) => typeof id === 'string');
}

/**
 * The reach's own check, callable on the recorded reach and on a doctored copy: the answer reads the two
 * observables the records already give and no third, the walk adds no tap, the token entry is the one the
 * path search finds, and the sentence that says no tap is needed is the record's and sits where the
 * recording says it sits. A reach that names a new tap, a second observable or a live page read is
 * refused here (SC6, E9, N6).
 * @param {any} reach
 * @param {any} [derived]
 * @returns {any}
 */
function checkReach(reach, derived = deriveReach()) {
  /** @type {string[]} */
  const problems = [];
  /** @param {string} message */
  const push = (message) => problems.push(message);

  const reads = Array.isArray(reach?.reads) ? reach.reads : [];
  if (reads.length !== REACH_OBSERVABLES.length)
    push(
      `the answer reads ${reads.length} observable(s) (${reads.map((read) => String(read?.observable)).join(', ')}) and the record states ${REACH_OBSERVABLES.length}: ${REACH_OBSERVABLES.join(' and ')}`,
    );
  for (const [index, read] of reads.entries()) {
    if (!REACH_OBSERVABLES.includes(String(read?.observable)))
      push(
        `reads[${index}] names ${String(read?.observable)}, which is not one of the two observables the record states`,
      );
    if (!BY_ID.has(String(read?.citationId)))
      push(
        `reads[${index}] cites ${String(read?.citationId)}, which is no citation this recording makes`,
      );
  }
  if (!Array.isArray(reach?.taps) || reach.taps.length !== 0)
    push(
      `the reach names a tap of its own (${JSON.stringify(reach?.taps)}) and the record states none`,
    );
  if (reach?.routerTokenEntry !== derived.routerTokenEntry)
    push(
      `the recording states the Router token in entry ${String(reach?.routerTokenEntry)} and searching the walked path for the entry that holds it finds ${String(derived.routerTokenEntry)}`,
    );
  if (reach?.routerTokenEntrySource !== derived.routerTokenEntrySource)
    push(
      `the recording states the entry's source as ${String(reach?.routerTokenEntrySource)} and the record states ${String(derived.routerTokenEntrySource)}`,
    );
  if (reach?.pathEntryCount !== derived.pathEntryCount)
    push(
      `the recording states a ${String(reach?.pathEntryCount)}-entry path and the record walks ${String(derived.pathEntryCount)}`,
    );
  if (reach?.oneEntryHoldsTheRouterToken !== true)
    push(
      'the recording must state that exactly one entry holds the Router token',
    );
  if (reach?.readFrom?.cite !== derived.readFrom.cite)
    push(
      `the reach is read from ${String(reach?.readFrom?.cite)} and the record cites ${String(derived.readFrom.cite)}`,
    );
  if (reach?.agentRange?.holdsTheWalk !== true)
    push(
      `the cited range ${String(reach?.agentRange?.cite)} does not hold the walk the record names`,
    );
  if (
    !Array.isArray(reach?.agentRange?.tapNeedlesInTheRange) ||
    reach.agentRange.tapNeedlesInTheRange.length !== 0
  )
    push(
      `the cited range carries the needs of a tap: ${JSON.stringify(reach?.agentRange?.tapNeedlesInTheRange)}`,
    );
  if (
    JSON.stringify(reach?.noNewTap?.carriedBy) !==
    JSON.stringify(derived.noNewTap.carriedBy)
  )
    push(
      `the recording states "${NO_NEW_TAP}" is carried by ${JSON.stringify(reach?.noNewTap?.carriedBy)} and the record carries it on ${JSON.stringify(derived.noNewTap.carriedBy)}`,
    );
  if ((derived.noNewTap.carriedBy ?? []).length === 0)
    push(
      `the reach section states no "${NO_NEW_TAP}", and the sentence is the page's own word for the reach`,
    );

  // The words a reach would have to use to ask the page for more than it already gives.
  for (const [at, text] of stringsIn(reach)) {
    if (at === 'noNewTap.sentence') continue;
    for (const refusal of REACH_REFUSALS)
      if (refusal.needle.test(text))
        push(`${at} names ${refusal.defect}: ${JSON.stringify(short(text))}`);
  }

  if (problems.length > 0)
    fail(`the reach is not the one the record states: ${problems.join('; ')}`);
  return derived;
}

/**
 * The whole check of one recording: its own shape, its citations, and every section compared with what
 * this head derives. Kept callable so a doctored recording is put through exactly the check the
 * recording itself passes.
 * @param {any} recording
 * @returns {{ citations: number, sections: number }}
 */
function checkRecording(recording) {
  assert.ok(isObject(recording), 'the recording is an object');
  assert.equal(
    recording.schema,
    SCHEMA,
    `the recording schema is ${JSON.stringify(recording.schema)}`,
  );
  assert.equal(
    recording.milestone,
    MILESTONE,
    `the recording milestone is ${JSON.stringify(recording.milestone)}`,
  );
  assert.equal(
    recording.task,
    TASK,
    `the recording task is ${JSON.stringify(recording.task)}`,
  );
  for (const key of ['title', 'question', 'verdict', 'measuredAt'])
    assert.ok(
      typeof recording[key] === 'string' && recording[key].trim() !== '',
      `the recording states its own ${key}`,
    );
  assert.equal(
    recording.headCommand,
    HEAD_COMMAND,
    'the recording states the command its head was read by',
  );

  const citations = checkCitations(recording);
  const derived = derive(recording.measuredAt, recording.head);
  /** @type {string[]} */
  const problems = [];
  for (const section of DERIVED_SECTIONS) {
    const found = firstDifference(
      recording[section],
      derived[section],
      section,
    );
    if (found !== '') problems.push(found);
  }
  if (problems.length > 0)
    fail(
      `the recording disagrees with this run's derivation at ${problems.length} value(s) (re-capture with M058_CAPTURE=1 after naming what moved): ${problems.slice(0, 6).join('; ')}`,
    );
  checkReach(recording.reach, derived.reach);
  return { citations, sections: DERIVED_SECTIONS.length };
}

// ----------------------------------------------------------------- capture ----

/**
 * The armed capture: re-derive, compare, write only when a value moved. A file that is current and
 * canonical is not touched at all, which is what makes two armed runs byte-identical.
 * @returns {{ wrote: boolean, before: string | null, after: string }}
 */
function capture() {
  const present = existsSync(RECORD_PATH);
  const text = present ? readFileSync(RECORD_PATH, 'utf8') : '';
  const existing = present ? JSON.parse(text) : {};
  const kept = existing?.measuredAt;
  const measuredAt =
    typeof kept === 'string' && kept !== '' ? kept : new Date().toISOString();
  const candidate = derive(measuredAt, headAtCapture());
  const bytes = canonical(candidate);
  if (present && bytes === text)
    return { wrote: false, before: sha256(text), after: sha256(text) };
  // Never write a record that would fail its own check.
  checkRecording(JSON.parse(bytes));
  writeFileSync(RECORD_PATH, bytes);
  return {
    wrote: true,
    before: present ? sha256(text) : null,
    after: sha256(readFileSync(RECORD_PATH)),
  };
}

/**
 * The committed record, or a failure that names the switch under which one would be written.
 * @returns {any}
 */
function recorded() {
  if (!existsSync(RECORD_PATH))
    fail(
      `${RECORD_REL} is missing - the measurement has not been recorded; capture it with ${ARMED_COMMAND}`,
    );
  return JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
}

// ------------------------------------------------------------ the armed run ----
//
// Declared first, so an armed run captures before the read-only pins read the file back: the same pins
// then prove the freshly written recording is still the one this head derives.

if (CAPTURE) {
  test('armed: re-derive, write only what moved, and a second run changes no byte', (t) => {
    const first = capture();
    t.diagnostic(
      first.wrote
        ? `armed run wrote ${RECORD_REL}: ${readFileSync(RECORD_PATH).length} bytes, sha256 ${first.after}`
        : `armed run: nothing moved, nothing written (sha256 ${first.after})`,
    );
    assert.equal(
      first.after,
      sha256(readFileSync(RECORD_PATH)),
      'the bytes the armed run reports are not the bytes on disk',
    );
    const second = capture();
    assert.equal(
      second.wrote,
      false,
      'the second armed run wrote, and nothing had moved',
    );
    assert.equal(
      second.after,
      first.after,
      'a second armed run changed the recording, so the re-capture is not idempotent',
    );
    t.diagnostic(
      `armed idempotence: ${readFileSync(RECORD_PATH).length} bytes, sha256 ${second.after} before and after the second run`,
    );
    // The armed run is the only writer this suite has; the read-only pin below holds the bytes it left.
    baseline = sha256(readFileSync(RECORD_PATH));
  });
}

// ---------------------------------------------------------- the default run ----

test('a default run is a read: the recording hashes the same before and after', (t) => {
  if (CAPTURE)
    t.diagnostic(
      'armed run: the read-only pin is re-based on the bytes this run wrote',
    );
  t.diagnostic(
    `${RECORD_REL} at load: ${existsSync(RECORD_PATH) ? readFileSync(RECORD_PATH).length : 0} bytes, sha256 ${String(baseline)}`,
  );
  const now = sha256(readFileSync(RECORD_PATH));
  t.diagnostic(`${RECORD_REL} after the run: sha256 ${now}`);
  assert.equal(
    now,
    baseline,
    `${RECORD_REL} changed during this run, so a read is not a read`,
  );
});

test('the recording is the canonical serialisation of its own record', () => {
  const text = readFileSync(RECORD_PATH, 'utf8');
  const expected = canonical(JSON.parse(text));
  assert.equal(
    text,
    expected,
    'the recording is not the canonical serialisation of its own record, so a re-capture could not reproduce these bytes',
  );
});

test('the recording names the commit it was measured at, and that commit is behind this HEAD', (t) => {
  const recording = recorded();
  assert.match(
    String(recording.head),
    /^[0-9a-f]{40}$/,
    `the recording head is ${String(recording.head)}, not one commit sha`,
  );
  const resolves = spawnSync(
    'git',
    ['rev-parse', '--verify', `${String(recording.head)}^{commit}`],
    { cwd: ROOT, encoding: 'utf8' },
  );
  assert.equal(
    resolves.status,
    0,
    `git rev-parse --verify ${String(recording.head)}^{commit} must resolve the head the recording names: ${String(resolves.stderr)}`,
  );
  assert.equal(
    String(resolves.stdout).trim(),
    String(recording.head),
    'the recorded head resolves to itself, so it names a commit rather than a branch',
  );
  const behind = spawnSync(
    'git',
    ['merge-base', '--is-ancestor', String(recording.head), 'HEAD'],
    { cwd: ROOT, encoding: 'utf8' },
  );
  assert.equal(
    behind.status,
    0,
    `the recorded head ${String(recording.head).slice(0, 8)} must be an ancestor of this HEAD, or the record was measured somewhere this checkout is not`,
  );
  t.diagnostic(
    `head ${String(recording.head).slice(0, 8)} is a commit this checkout carries, measured at ${String(recording.measuredAt)}, and the suite resolves it through ${HEAD_COMMAND}`,
  );
});

test('the recording states its instrument, what it built and what it could not establish', () => {
  const recording = recorded();
  for (const key of ['how', 'holds', 'nothingRun'])
    assert.ok(
      typeof recording.instrument[key] === 'string' &&
        recording.instrument[key].trim() !== '',
      `the instrument states its ${key}`,
    );
  assert.deepEqual(
    recording.instrument.reads,
    [NAV, CONFIG, DIAGNOSTIC, AGENT],
    'the instrument names the four files this map was measured from',
  );
  assert.deepEqual(
    recording.builtNothing.built,
    [],
    'nothing was built: no join, no surface, no route and no capture',
  );
  assert.equal(
    recording.capture.command,
    ARMED_COMMAND,
    'the capture block names the one command that may write this record (D5)',
  );
  assert.equal(
    recording.capture.check,
    CHECK_COMMAND,
    'the capture block names the read-only command',
  );
  assert.deepEqual(
    recording.capture.criteria,
    CRITERIA,
    'the capture block names the criteria this task answers',
  );
  assert.equal(
    recording.capture.records,
    RECORD_REL,
    'the capture block names the file it writes',
  );
});

test('every citation is the line its own number names, found by searching the file it quotes', (t) => {
  const recording = recorded();
  const citations = checkCitations(recording);
  t.diagnostic(
    `${citations} citation(s) re-resolved by search over ${new Set(recording.citations.map((citation) => citation.path)).size} file(s)`,
  );
  for (const path of new Set(
    recording.citations.map((citation) => citation.path),
  ))
    t.diagnostic(
      `${path}: ${recording.citations.filter((citation) => citation.path === path).length} citation(s)`,
    );
  assert.ok(
    citations >= 40,
    `the recording cites ${citations} line(s), which is fewer than the map it states needs`,
  );
});

test('every citation a section names is one the recording makes, and no line is cited for nothing', () => {
  const recording = recorded();
  const made = new Set(recording.citations.map((citation) => citation.id));
  const referenced = referencedCitations(recording);
  for (const id of referenced)
    assert.ok(
      made.has(id),
      `a section names the citation ${JSON.stringify(id)}, which this recording does not make`,
    );
  assert.deepEqual(
    [...new Set(referenced)].sort(),
    [...made].sort(),
    'every citation the recording makes is named by a section, so a line measured for nothing is not carried as if it were a field',
  );
});

test('the recording is what this head derives, field by field', (t) => {
  const recording = recorded();
  const stats = checkRecording(recording);
  t.diagnostic(
    `${stats.sections} section(s) and ${stats.citations} citation(s) re-derived at this head`,
  );
  t.diagnostic(recording.verdict);
});

test('the stream side names every terminal class with its own key set and nothing beside it', (t) => {
  const recording = recorded();
  const nav = jsonOf(NAV);
  const stream = recording.fieldMap.stream;
  const classes = nav.events.classes;

  assert.equal(
    stream.enumerated,
    nav.events.enumerated,
    'the class count recorded is the count the record measured',
  );
  assert.equal(
    stream.classCount,
    classes.length,
    'every class the record enumerates is in the field map',
  );
  assert.deepEqual(
    stream.terminals.map((terminal) => terminal.class),
    TERMINAL_CLASSES,
    'the four terminal classes are the four a navigation can terminate in',
  );
  assert.equal(
    stream.scrollOutsideTheSixteen,
    true,
    'Scroll is outside the sixteen classes, so the count is of the navigation stages and terminals',
  );
  assert.equal(
    stream.scrollRecordedAsOutsideTheSixteen,
    true,
    'and the record states it is outside the enumerated sixteen rather than omitting it',
  );
  for (const terminal of stream.terminals) {
    const declared = classes.find((entry) => entry.name === terminal.class);
    assert.ok(
      declared,
      `the record declares no ${terminal.class}, so the map names a class the records do not carry`,
    );
    assert.deepEqual(
      terminal.keys,
      declared.keys,
      `${terminal.class} carries the key set the chunk declares`,
    );
    assert.deepEqual(
      declared.observed.keys,
      declared.keys,
      `${terminal.class} was observed carrying the key set it declares`,
    );
    assert.equal(
      terminal.observedKeysEqualDeclared,
      true,
      `${terminal.class}'s observed key set is its declared one`,
    );
  }
  assert.deepEqual(
    stream.terminals.find((terminal) => terminal.class === 'NavigationEnd')
      .keys,
    ['id', 'type', 'url', 'urlAfterRedirects'],
    'a navigation that ended carries its own four fields and no code, reason, error or target',
  );
  for (const name of ['NavigationCancel', 'NavigationSkipped'])
    assert.deepEqual(
      stream.terminals.find((terminal) => terminal.class === name).keys,
      ['code', 'id', 'reason', 'type', 'url'],
      `${name} carries its own five fields and no urlAfterRedirects`,
    );
  assert.deepEqual(
    stream.terminals.find((terminal) => terminal.class === 'NavigationError')
      .keys,
    ['error', 'id', 'target', 'type', 'url'],
    'an error carries its own five fields and no code or reason',
  );
  assert.equal(
    stream.everyKeySetObservedAsDeclared,
    true,
    'every class was observed carrying exactly the key set it declares',
  );
  t.diagnostic(
    `${stream.enumerated} classes besides Scroll, ${stream.terminals
      .map((terminal) => `${terminal.class} ${terminal.keys.join('/')}`)
      .join(', ')}`,
  );
});

test('the attribution rule is by id and route.path, never by position', (t) => {
  const recording = recorded();
  const attribution = recording.fieldMap.stream.attribution;
  const ordering = jsonOf(NAV).superseded.ordering;

  assert.match(
    attribution.rule,
    /by route\.path/,
    'the rule is the record’s own: by route.path in the event’s own payload',
  );
  assert.match(
    attribution.rule,
    /never by position/,
    'the rule refuses arrival order in the record’s own words',
  );
  assert.deepEqual(
    attribution.by,
    ['id', 'route.path'],
    'an event is attributed by the two fields it carries',
  );
  assert.equal(
    attribution.ordering.abandonedLoadEndIsAfterItsOwnCancel,
    ordering.abandonedLoadEndIsAfterItsOwnCancel,
    'the abandoned navigation’s own load end arrives after its cancel',
  );
  assert.equal(
    attribution.ordering.abandonedLoadEndIsBeforeTheSuccessorLoadEnd,
    ordering.abandonedLoadEndIsBeforeTheSuccessorLoadEnd,
    'and before the successor’s load end, which is why arrival order attributes it to the wrong navigation',
  );
  assert.ok(
    attribution.ordering.cancelToAbandonedLoadEndMs > 1000,
    `the abandoned load end arrives ${attribution.ordering.cancelToAbandonedLoadEndMs} ms after its own cancel`,
  );
  t.diagnostic(
    `attribution: ${attribution.rule}; the abandoned load end is ${attribution.ordering.cancelToAbandonedLoadEndMs} ms after its cancel and ${attribution.ordering.abandonedLoadEndToSuccessorLoadEndMs} ms before the successor's`,
  );
});

test('the config side is the five fields over the rows, and its one guard is named from configuration', (t) => {
  const recording = recorded();
  const config = recording.fieldMap.config;
  const source = jsonOf(CONFIG);

  assert.deepEqual(
    config.fields,
    source.fieldsPresent,
    'the five fields are the fields the record states',
  );
  assert.deepEqual(
    [...config.fields].sort(),
    [...CONFIG_FIELDS].sort(),
    'the five fields are path, component, redirectTo, canActivate and loadChildren',
  );
  assert.equal(
    config.rows,
    source.config.length,
    'the row count is the number of rows the record carries',
  );
  assert.deepEqual(
    config.keysOutsideTheFive,
    [],
    'a configured row states no field beside the five',
  );
  assert.deepEqual(
    config.fieldsCarriedByNoRow,
    [],
    'every one of the five fields is carried by at least one row',
  );
  for (const row of config.redirectShaped)
    assert.equal(
      row.carriesComponent,
      false,
      `the redirect-shaped row ${row.path} carries a redirectTo and no component`,
    );
  assert.deepEqual(
    config.redirectShaped.map((row) => row.path),
    ['redirect', 'loop-a', 'loop-b'],
    'the three redirect-shaped rows are the three the record carries',
  );
  assert.equal(
    config.guardCarrying.length,
    1,
    'exactly one configured row carries a canActivate',
  );
  assert.equal(
    config.guardCarrying[0].guardName,
    'redirectGuard',
    'the guard’s configured function carries a name, so a guard is nameable from configuration',
  );
  assert.equal(
    source.config.filter((row) => 'canActivate' in row)[0].canActivate[0],
    '[fn redirectGuard]',
    'the name is the record’s own spelling of the configured function',
  );
  t.diagnostic(
    `config: ${config.fields.join('/')} over ${config.rows} rows; ${config.redirectShaped.length} redirect-shaped rows, ${config.guardCarrying.length} carrying ${config.guardCarrying[0].guardName}`,
  );
  t.diagnostic(
    `rows carrying each field: ${Object.entries(config.rowsCarrying)
      .map(([field, count]) => `${field} ${count}`)
      .join(', ')}`,
  );
});

test('the diagnostic side names the segment it could not match and no configured route', (t) => {
  const recording = recorded();
  const diagnostic = recording.fieldMap.diagnostic;
  const source = jsonOf(DIAGNOSTIC);

  assert.equal(
    diagnostic.codedMessages,
    1,
    'the record carries one coded console message',
  );
  assert.equal(
    diagnostic.code,
    'NG04002',
    'the message carries the router’s own code',
  );
  assert.equal(
    diagnostic.segment,
    'this-route-does-not-exist',
    'the message names the URL segment it could not match',
  );
  assert.equal(
    diagnostic.statesItNamesNoConfiguredRoutePath,
    true,
    'the record states the message names no configured route path',
  );
  assert.deepEqual(
    diagnostic.configuredPathsNamedByTheMessage,
    [],
    `the message names none of the ${diagnostic.configuredPathsCompared} configured paths, re-derived by searching the message for each one`,
  );
  assert.equal(
    diagnostic.statesTheDigestCarriesNoCode,
    true,
    'the record states the digest does not carry the code',
  );
  assert.deepEqual(
    diagnostic.codesNotCarried,
    source.digest.codesNotCarried,
    'the codes the digest does not carry are the record’s own list',
  );
  assert.equal(
    diagnostic.readsASegmentAndNoRoute,
    true,
    'a route claim is read from the config’s own fields and never out of a captured diagnostic (C2)',
  );
  t.diagnostic(
    `diagnostic: ${diagnostic.code} names the segment ${diagnostic.segment} and ${diagnostic.configuredPathsNamedByTheMessage.length} of ${diagnostic.configuredPathsCompared} configured paths`,
  );
});

test('no-guard-verdict is recorded from the shapes that force it, as a state and not a gap', (t) => {
  const recording = recorded();
  const absence = recording.absences['no-guard-verdict'];
  const nav = jsonOf(NAV);
  const start = nav.events.classes.find(
    (entry) => entry.name === 'GuardsCheckStart',
  );

  assert.equal(absence.state, 'no-guard-verdict');
  assert.deepEqual(
    absence.guardsCheckEndAddsOverGuardsCheckStart,
    ['shouldActivate'],
    'GuardsCheckEnd adds exactly one field over GuardsCheckStart',
  );
  assert.deepEqual(absence.removedByGuardsCheckEnd, [], 'and removes none');
  assert.deepEqual(
    absence.guardsCheckStartKeys,
    start.keys,
    'the start keys are the class’s own key set',
  );
  assert.deepEqual(
    absence.guardFieldsInThatPayload,
    ['shouldActivate'],
    'the only guard field in that payload is the aggregate',
  );
  assert.equal(
    absence.guardFieldsAreAggregateOnly,
    true,
    'the field that is there is an aggregate of the whole check and never one guard’s verdict',
  );
  assert.deepEqual(
    absence.guardNamesInEitherPayload,
    [],
    'no payload names a guard, in a refusal or in an unmatched URL',
  );
  assert.equal(
    absence.refusedVersusUnmatched.eventCount,
    11,
    'a refused canMatch and an unmatched URL are the same eleven events',
  );
  for (const key of [
    'classSequenceEqual',
    'keySequenceEqual',
    'eventCountEqual',
  ])
    assert.equal(
      absence.refusedVersusUnmatched[key],
      true,
      `the two frames are the same navigation by ${key}`,
    );
  assert.deepEqual(
    absence.refusedVersusUnmatched.terminalClass,
    ['NavigationEnd'],
    'both end in NavigationEnd, so a refusal is never inferred from the terminal class',
  );
  assert.equal(
    absence.refusedVersusUnmatched.hasNavigationCancelInEither,
    false,
    'neither records a NavigationCancel',
  );
  assert.equal(
    absence.refusedVersusUnmatched.differingPathsAreTheNavigationsOwn,
    true,
    'every payload path that differs is a field of the two navigations rather than a guard’s',
  );
  assert.match(
    recording.absences.notGaps,
    /never a gap a capture could fill/,
    'the absence is stated as a state the answer renders and not as a gap',
  );
  t.diagnostic(
    `no-guard-verdict: GuardsCheckEnd adds ${absence.guardsCheckEndAddsOverGuardsCheckStart.join(', ')} over GuardsCheckStart; a refusal and an unmatched URL are the same ${absence.refusedVersusUnmatched.eventCount} events with ${absence.guardNamesInEitherPayload.length} guard names in either payload`,
  );
  t.diagnostic(absence.finding);
});

test('no-redirect-decision is recorded from the shapes that force it, as a state and not a gap', (t) => {
  const recording = recorded();
  const absence = recording.absences['no-redirect-decision'];
  const nav = jsonOf(NAV);

  assert.equal(absence.state, 'no-redirect-decision');
  assert.deepEqual(
    absence.cancellationCode,
    {
      enum: 'NavigationCancellationCode',
      name: 'Redirect',
      value: 0,
      producedByARun: false,
    },
    'the redirect code has value 0 and no run produced it',
  );
  assert.deepEqual(
    absence.producedCancellationCodes,
    ['SupersededByNewNavigation'],
    'the one cancellation code a run produced is the superseded one, not the redirect',
  );
  assert.equal(
    absence.cancelsInTheFrame,
    0,
    'the redirect frame recorded no NavigationCancel at all',
  );
  assert.equal(
    absence.frame.cancelCount,
    0,
    'and the record’s own count of cancels in that frame is zero',
  );
  assert.equal(
    absence.eventsInTheFrame,
    absence.frame.events,
    'the frame’s event list is the length the record states',
  );
  assert.equal(
    absence.terminalClass,
    'NavigationEnd',
    'the redirect ends in NavigationEnd, so the redirect is not a terminal',
  );
  assert.deepEqual(
    absence.differsOnlyIn,
    ['url', 'urlAfterRedirects'],
    'the redirect is only url differing from urlAfterRedirects',
  );
  assert.notEqual(
    absence.frame.url,
    absence.frame.urlAfterRedirects,
    'the frame’s own url and urlAfterRedirects differ, which is the whole shape of the redirect',
  );
  assert.match(
    recording.absences.notGaps,
    /never a gap a capture could fill/,
    'the absence is stated as a state the answer renders and not as a gap',
  );
  t.diagnostic(
    `no-redirect-decision: ${absence.cancellationCode.name} = ${absence.cancellationCode.value}, produced by ${String(absence.cancellationCode.producedByARun)}; the frame emitted ${absence.eventsInTheFrame} events and ${absence.cancelsInTheFrame} cancels, ${absence.frame.url} -> ${absence.frame.urlAfterRedirects}`,
  );
  assert.equal(
    nav.terminals.redirect.cancelCount,
    0,
    'the record’s redirect terminal carries no cancel',
  );
  t.diagnostic(absence.finding);
});

test(E9_TITLE, (t) => {
  const recording = recorded();
  const nav = jsonOf(NAV);
  const reach = recording.reach;
  const derived = checkReach(reach);

  assert.equal(
    reach.pathEntryCount,
    5,
    'the injector path the record walked has five entries',
  );
  assert.equal(reach.path.length, 5, 'and the map carries every one of them');
  assert.deepEqual(
    reach.path.map((entry) => entry.hasRouterToken),
    [0, 0, 1, 0, 0],
    'exactly one entry holds the Router token, and it is entry 2',
  );
  assert.equal(
    reach.routerTokenEntry,
    2,
    'the entry that holds the Router token is entry 2',
  );
  assert.equal(
    reach.routerTokenEntrySource,
    'Environment Injector',
    'the entry is the one whose metadata source is the environment injector',
  );
  assert.equal(
    reach.routerTokenEntry,
    reach.routerTokenEntryAsTheRecordStatesIt,
    `the record states the entry is ${String(reach.routerTokenEntryAsTheRecordStatesIt)} and searching the walked path for the entry that holds the token finds ${String(reach.routerTokenEntry)}`,
  );
  assert.equal(
    reach.pathEntryCount,
    reach.pathEntryCountAsTheRecordStatesIt,
    `the record states a ${String(reach.pathEntryCountAsTheRecordStatesIt)}-entry path and the walked path carries ${String(reach.pathEntryCount)}`,
  );
  assert.equal(
    reach.path[2]?.routerTokenResolvesToTheRouterInstance,
    true,
    'that token resolves to the very instance ɵgetRouterInstance returns',
  );
  assert.equal(
    reach.tokenFieldIsTheFieldThatFindsIt,
    true,
    'the field that finds it is record.token, as the record states',
  );
  assert.equal(
    reach.providerProvideIsNotTheField,
    true,
    'record.provider.provide is not the field that finds it',
  );
  assert.equal(
    reach.appInjectorIsNotTheFirstEntry,
    true,
    'the app’s environment injector is not the first entry of the walk',
  );
  assert.equal(
    reach.readFrom.function,
    'routerTokenFrom',
    'the walk that resolves it is the agent’s own routerTokenFrom',
  );
  assert.equal(
    reach.readFrom.cite,
    'extension/agent-main.js:1750-1839',
    'the reach is cited where the agent already reads it',
  );
  assert.ok(
    BY_ID.get('agentTokenField').line >= reach.agentRange.startLine &&
      BY_ID.get('agentTokenField').line <= reach.agentRange.endLine,
    `the line that finds the token from record.token sits inside the cited range ${reach.agentRange.cite}`,
  );
  assert.equal(
    reach.agentRange.holdsTheWalk,
    true,
    'the cited range holds the walk the record names',
  );
  assert.deepEqual(
    reach.agentRange.tapNeedlesInTheRange,
    [],
    `no line of ${reach.agentRange.cite} needs a needle a tap would need`,
  );
  assert.equal(
    reach.noNewTap.sentence,
    NO_NEW_TAP,
    'the reach carries the record’s own sentence that no tap is needed',
  );
  assert.ok(
    reach.noNewTap.carriedBy.length > 0,
    'the sentence sits in the reach section rather than in this suite',
  );
  assert.deepEqual(
    reach.reads.map((read) => read.observable),
    [...REACH_OBSERVABLES],
    'the answer is produced from the stream the agent already subscribes to and the config the rows state, and from no third observable',
  );
  assert.deepEqual(reach.taps, [], 'the reach adds no tap of its own');
  t.diagnostic(
    `E9: entry ${reach.routerTokenEntry} of ${reach.pathEntryCount} (${reach.routerTokenEntrySource}) holds the Router token; ${reach.readFrom.function} at ${reach.readFrom.cite} resolves it with ${reach.taps.length} new taps`,
  );
  t.diagnostic(
    `the sentence "${reach.noNewTap.sentence}" is carried by reach.${reach.noNewTap.carriedBy.join(', reach.')} in ${NAV}; reach.note states the token-field measurement instead`,
  );
  assert.equal(
    derived.noNewTap.sentence,
    NO_NEW_TAP,
    'and the reading above is re-derived from the record rather than read back',
  );
  assert.equal(
    String(nav.reach.finding).includes(NO_NEW_TAP),
    true,
    'the record’s own reach finding carries the sentence',
  );
});

test('a reach that names a new tap, a second observable or a live page read reddens', () => {
  const base = recorded().reach;
  const copyOf = () => JSON.parse(JSON.stringify(base));

  /** @type {Array<{ id: string, defect: RegExp, patch: (reach: any) => void }>} */
  const mutants = [
    {
      id: 'a-new-tap',
      defect: /tap/,
      patch: (reach) => {
        reach.taps = ['a subscription the panel starts for itself'];
      },
    },
    {
      id: 'a-new-tap-in-words',
      defect: /new tap/,
      patch: (reach) => {
        reach.reads[0].observable = 'router.events, read by a second tap';
      },
    },
    {
      id: 'a-second-observable',
      defect: /second observable|not one of the two observables/,
      patch: (reach) => {
        reach.reads.push({
          observable: 'router.routerState',
          where: 'extension/agent-main.js',
          citationId: 'agentRouterTokenFrom',
        });
      },
    },
    {
      id: 'a-live-page-read',
      defect: /live page read/,
      patch: (reach) => {
        reach.reads[1].observable = 'document.body innerText';
      },
    },
    {
      id: 'a-token-entry-the-path-does-not-hold',
      defect: /searching the walked path/,
      patch: (reach) => {
        reach.routerTokenEntry = 0;
      },
    },
    {
      id: 'a-sentence-in-the-wrong-field',
      defect: /carried by/,
      patch: (reach) => {
        reach.noNewTap.carriedBy = ['note'];
      },
    },
  ];

  for (const mutant of mutants) {
    const reach = copyOf();
    mutant.patch(reach);
    let failure = null;
    try {
      checkReach(reach);
    } catch (error) {
      failure = /** @type {Error} */ (error);
    }
    assert.ok(
      failure !== null,
      `the reach mutant ${mutant.id} must redden the reach check, and it reddened nothing`,
    );
    assert.match(
      failure.message,
      mutant.defect,
      `the reach mutant ${mutant.id} must redden naming its defect, and it said: ${failure.message.split('\n')[0]}`,
    );
    console.log(
      `reach mutant ${mutant.id}: ${String(failure.message).split('\n')[0]}`,
    );
  }
  // The check is green on the shipped reach first, so a failure above is the mutant's and not a pin
  // that was already red.
  checkReach(base);
});

test('the inventory names exactly the two records this milestone owes, from the start', (t) => {
  const recording = recorded();
  const named = recording.inventory.outsideTheMap.map((entry) => entry.path);
  assert.deepEqual(
    named,
    [OWED.surface, OWED.verdictClaims],
    'the map names the surface record T003 writes and the verdict-claims record T004 writes, and nothing else',
  );
  for (const entry of recording.inventory.outsideTheMap)
    assert.ok(
      typeof entry.why === 'string' && entry.why.trim() !== '',
      `outsideTheMap[${entry.path}] says why it sits outside the map`,
    );
  assert.match(
    recording.inventory.outsideTheMap[0].why,
    /T003/,
    'the surface record is the one T003 writes',
  );
  assert.match(
    recording.inventory.outsideTheMap[1].why,
    /T004/,
    'the verdict-claims record is the one T004 writes',
  );
  assert.equal(
    recording.inventory.verdictClaims,
    undefined,
    'the map measures no verdict-claims record of its own, so it carries no such list and cannot excuse one it did not measure',
  );
  assert.equal(
    recording.inventory.surface,
    undefined,
    'and no surface list either',
  );
  assert.match(
    recording.inventory.measured,
    /No record under `research\/raw\/` is measured by this map/,
    'the map states that it measures no record rather than leaving the absence to be inferred',
  );
  t.diagnostic(
    `${RECORD_REL} names ${named.length} record(s) outside itself (${named.join(', ')}) and measures none of its own`,
  );
});

test('a doctored citation reddens naming the citation it belongs to', () => {
  const recording = recorded();
  const target = 'attribution';
  const doctored = JSON.parse(JSON.stringify(recording));
  const citation = doctored.citations.find((one) => one.id === target);
  assert.ok(citation, `the recording cites ${target}`);
  citation.line += 1;
  let failure = null;
  try {
    checkCitations(doctored);
  } catch (error) {
    failure = /** @type {Error} */ (error);
  }
  assert.ok(
    failure !== null,
    'a citation one line off its quotation must redden',
  );
  assert.match(
    failure.message,
    new RegExp(`citations\\[${target}\\]`),
    `the failure names the citation the doctored line belongs to, and it says ${JSON.stringify(failure.message)}`,
  );
  console.log(`mutant: doctored citation -> ${failure.message.split('\n')[0]}`);
});

test('a field map that names a field the record does not carry reddens', () => {
  const recording = recorded();
  const doctored = JSON.parse(JSON.stringify(recording));
  doctored.fieldMap.config.fields = [
    ...doctored.fieldMap.config.fields,
    'canMatch',
  ];
  let failure = null;
  try {
    checkRecording(doctored);
  } catch (error) {
    failure = /** @type {Error} */ (error);
  }
  assert.ok(
    failure !== null,
    'a wave that names a field no configured row declares must redden here rather than in a later wave',
  );
  assert.ok(
    failure.message.includes('fieldMap.config.fields'),
    `the failure names the field map entry that invented the field, and it says ${JSON.stringify(failure.message)}`,
  );
  console.log(
    `mutant: invented config field -> ${failure.message.split('\n')[0]}`,
  );
});

test('nothing was built', () => {
  const recording = recorded();
  assert.deepEqual(
    recording.builtNothing.built,
    [],
    'no join, no surface, no route and no capture',
  );
  assert.match(
    recording.builtNothing.description,
    /No join, no surface, no route and no capture/,
    'the recording states what it did not build',
  );
});
