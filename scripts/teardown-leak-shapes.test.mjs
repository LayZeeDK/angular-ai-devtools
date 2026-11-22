// @ts-check
// Run: node --test scripts/teardown-leak-shapes.test.mjs
// Armed (the only writer this milestone has):
//   M059_CAPTURE=1 node --test scripts/teardown-leak-shapes.test.mjs
// On Windows, where the shell is cmd.exe:
//   set "M059_CAPTURE=1"&& node --test scripts/teardown-leak-shapes.test.mjs
//
// M059 T001 measured four things, and `research/raw/m059-record-shapes.json` is the measurement:
//
//   digest      the `NG0205` entry `extension/error-digest.json` carries, verbatim, with that file's
//               sha256 — and, from the installed Angular build, the exact message the framework throws
//               it with. The digest's title has no full stop; the framework's body does.
//   message     what a console message carries once the shipped joins have read it: the console join
//               keeps `text` byte for byte (stack frames included, inside the string and never in a
//               field), the lint join drops the stack at the first V8 frame, and neither join carries
//               the capture's `location`, `type`, `order` or `component`. Nothing but the message body
//               identifies a source, and `NG0205`'s body names the injector and no owner.
//   producible  whether the Insurance Portal or `spikes/ng222-app` can be driven to emit `NG0205`.
//               Both were driven through the control-angular-dev-app skill — four portal routes and
//               38 console lines, two fixture routes and 4 console lines — and neither produced it,
//               because `NG0205` is thrown by `Injector.get` on a destroyed injector and no component
//               on either page performs that lookup after teardown. The record states the observable
//               that is missing rather than manufacturing one: a second leaking fixture needs its own
//               owner ruling (plan R2), and a probe that calls `injector.get` itself is the page-side
//               instrumentation D7 forbids.
//   absences    the handle record the roadmap's sentence names, measured as an absence:
//               `handleRecord`, `postDestroy` and `leakedHandle` occur 0 times across 38 extension
//               modules, 136 suites and 146 `research/raw/` records, and the three `.unsubscribe(`
//               sites this head carries are named with their owners (two are the agent's own).
//
// No page-side instrumentation is involved anywhere: the browser drives read the console stream the
// extension already subscribes to, with listeners attached in the driver and never in the page, and
// this suite itself opens no page, starts no browser and builds nothing.
//
// The record also carries the claims map the census reads (T010), and both of its sections are derived
// here rather than typed into the file: `records[]` names the artefacts this milestone measured — the
// two records it writes, the surface T003 and the verdict-claims T004, named by the milestone id and
// each with what it holds, beside the capture record and M045's map the sections are measured from —
// and `inventory.outsideTheMap` names the two records this milestone owes, each `why` citing the task
// that writes it, so `scripts/tutor-record-shapes.test.mjs` and `scripts/tutor-answer.test.mjs`
// subtract them from their census by reading this recording rather than by listing a path in either
// suite. A map that stops naming a record reddens here rather than drifting, and an armed run carries
// both sections forward, so a re-capture cannot drop the map the census reads.
//
// A record nobody re-reads drifts the way a comment does, so this suite holds it to the tree:
//
//   citations   every `path:line` the record makes is re-resolved by reading the file it names and
//               searching that file for the exact line the record quotes — never by trusting the typed
//               number, and never by trusting the quotation either. A citation whose file is the portal
//               checkout, or the installed Angular build, is re-resolved when it is present and named
//               absent when it is not, so a checkout without `node_modules` reports what it could not
//               read instead of failing on a file this repository does not carry.
//   the digest  the code, the title, the body, the entry count and the hash are read from
//               `extension/error-digest.json` on every run; the printed message is derived from the
//               throw site in the installed build, so a framework that moved its code reddens here.
//   the message the two joins' field lists are parsed out of the shipped comments that declare them,
//               and the capture's own field keys out of `research/raw/m032-console-diagnostics.json`,
//               so a join that gains or loses a field reddens here rather than on a surface (C3).
//   producible  the console each drive captured is tallied from the lines it printed, the codes are
//               searched out of those texts, and the `NG0205` occurrences under `research/raw/` are
//               counted on every run — a capture that starts carrying the code is a fact this record
//               has to be re-armed for.
//   the absences
//               the three needles are counted over the same three globs every run, and every
//               `.unsubscribe(` line is resolved to the function or constant that owns it.
//
// One file is written by this suite and only behind the opt-in switch: a default run derives every
// field and asserts the committed recording is exactly what this head states, and an armed run writes
// only when a byte moved, so two armed runs in a row are byte-identical (D5). Held-out E9 is the last
// test in this file for that reason: it hashes the recording after every other test has read it.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RECORD_REL = 'research/raw/m059-record-shapes.json';
const RECORD_PATH = join(ROOT, ...RECORD_REL.split('/'));

// The four files the measurement is read from, and the two pages it was driven on.
const DIGEST = 'extension/error-digest.json';
const CAPTURE_RECORD = 'research/raw/m032-console-diagnostics.json';
const M045 = 'research/raw/m045-console-shapes.json';
const CONSOLE_JOIN = 'extension/console-join.js';
const LINT_CORE = 'extension/lint-core.js';
const AGENT = 'extension/agent-main.js';
const FIXTURE = 'spikes/ng222-app/src/app/stale-view-fixture.ts';
const FRAMEWORK =
  'spikes/ng222-app/node_modules/@angular/core/fesm2022/_pending_tasks-chunk.mjs';

// The portal is a checkout of its own repository, outside this one; the two files are the evidence
// for what its components do with their injector and their one hand-rolled subscription.
const PORTAL_DIR =
  'D:/projects/github/LayZeeDK/HaasStefan__ng-journal-insurance-portal-ai-devtools';
const PORTAL_DIRECTIVE = `${PORTAL_DIR}/libs/shared/ui-directives/src/lib/button-action.directive.ts`;
const PORTAL_LIST = `${PORTAL_DIR}/libs/contract/feature-list/src/lib/list.component.ts`;

const SCHEMA = 'm059-record-shapes/v1';
const MILESTONE = 'M059';
const TASK = 'T001';
const TITLE = 'Measure what the console record and the digest state';
const QUESTION =
  'what does the digest state for NG0205, what does a console message carry once the shipped joins have read it, can the portal or spikes/ng222-app be driven to emit it, and which counts state the handle record this agent does not hold?';
const CHECK_COMMAND = 'node --test scripts/teardown-leak-shapes.test.mjs';
const ARMED_COMMAND = `M059_CAPTURE=1 ${CHECK_COMMAND}`;
const ARMED_COMMAND_WINDOWS = `set "M059_CAPTURE=1"&& ${CHECK_COMMAND}`;
const HEAD_COMMAND = 'git rev-parse HEAD';

/**
 * The two records this milestone owes, named by the milestone id rather than written out as a list:
 * T003 writes the surface record and T004 the verdict-claims record, and this map names them outside
 * itself because both were written after it was measured, so the two census suites subtract them by
 * name instead of reading them as unmeasured records (C2, C7, D1).
 */
const OWED = Object.freeze({
  surface: `research/raw/${MILESTONE.toLowerCase()}-surface.json`,
  verdictClaims: `research/raw/${MILESTONE.toLowerCase()}-verdict-claims.json`,
});

/** The criteria this task answers, read from the task file rather than retyped as a claim. */
const CRITERIA = Object.freeze(['SC1', 'SC6']);

/** The test title the plan's held-out row gives this suite (`.project/plan/PLAN.md:87-89`). */
const E9_TITLE =
  'held-out E9: the record is read-only and no capture runs on a default run';

/** The one code this milestone's answer is about. */
const CODE_SEARCHED = 'NG0205';

/** The two states the answer renders where it has no attribution and no handle (C1, C3, SC1, SC4). */
const ABSENCE_OWNER = 'owner-not-in-the-message';
const ABSENCE_HANDLE = 'handle-record-not-held';

/** The three holes the roadmap's sentence assumes, each measured rather than assumed. */
const NEEDLES = Object.freeze(['handleRecord', 'postDestroy', 'leakedHandle']);

/** The one teardown call the extension can make, counted rather than described. */
const UNSUBSCRIBE = '.unsubscribe(';

/**
 * The four files this milestone adds, excluded from every scan it makes: a suite that spells the three
 * needles in its own source, a record that states them in its own body, and the join and its suite that
 * carry the code and its body are the measurement and not the measured tree. The counts are of the tree
 * this milestone found, and every one of them was measured before these four files existed. Their
 * exclusion was earned: without the join and the surface record in this list, a landing elsewhere moved
 * the denominators to 39 and 137, and a record that merely quotes the code flipped `producible` to
 * `produced` with eighteen page hits it never observed.
 */
const OWN_ARTEFACTS = Object.freeze([
  'scripts/teardown-leak-shapes.test.mjs',
  'research/raw/m059-record-shapes.json',
  'extension/teardown-leak.js',
  'scripts/teardown-leak.test.mjs',
]);

/** The glob each of the milestone's own files sits in, so the exclusion is stated without a lookup. */
const OWN_ARTEFACT_GLOB = Object.freeze({
  'scripts/teardown-leak-shapes.test.mjs': 'scripts',
  'research/raw/m059-record-shapes.json': 'researchRaw',
  'extension/teardown-leak.js': 'extension',
  'scripts/teardown-leak.test.mjs': 'scripts',
});

/**
 * The milestone's own files that sit in one glob, named whether or not the record has landed yet: the
 * exclusion is a fact about the measurement, not about which files happen to exist while it runs.
 * @param {string} key
 * @returns {string[]}
 */
function excludedIn(key) {
  return OWN_ARTEFACTS.filter((path) => OWN_ARTEFACT_GLOB[path] === key);
}

/** The switch that arms the one write this suite has (D5). */
const CAPTURE = process.env.M059_CAPTURE === '1';

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
 * The path a record names: a repository-relative path resolved against the root, an absolute one
 * (the portal checkout's files) used as it is.
 * @param {string} path
 * @returns {string}
 */
function fullPath(path) {
  return /^[A-Za-z]:[\\/]/.test(path) ? path : join(ROOT, ...path.split('/'));
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
 * The lines of a file, split the way a line number counts them.
 * @param {string} path
 * @returns {readonly string[]}
 */
function linesOf(path) {
  if (!LINES.has(path)) {
    const full = fullPath(path);
    assert.ok(existsSync(full), `${path} is a file this tree carries`);
    LINES.set(path, readFileSync(full, 'utf8').split(/\r?\n/));
  }
  return LINES.get(path) ?? [];
}

/**
 * One record under `research/raw/`, parsed.
 * @param {string} path
 * @returns {any}
 */
function jsonOf(path) {
  return JSON.parse(readFileSync(fullPath(path), 'utf8'));
}

/**
 * Every 1-indexed line of `path` whose text carries `needle`.
 * @param {string} path
 * @param {string} needle
 * @returns {number[]}
 */
function linesCarrying(path, needle) {
  const lines = linesOf(path);
  /** @type {number[]} */
  const found = [];
  for (let index = 0; index < lines.length; index += 1)
    if (String(lines[index] ?? '').includes(needle)) found.push(index + 1);
  return found;
}

/**
 * The line a needle selects, refusing a needle that selects none or more than one: a citation has to
 * name one line, so the search has to answer with one.
 * @param {string} path
 * @param {string} needle
 * @param {string} where
 * @returns {number}
 */
function lineOf(path, needle, where) {
  const found = linesCarrying(path, needle);
  assert.equal(
    found.length,
    1,
    `${where}: searching ${path} for ${JSON.stringify(short(needle))} finds it on ${found.length} line(s) (${found.join(', ')}), and a citation names exactly one line`,
  );
  return (
    found[0] ?? fail(`${where}: ${path} holds no line carrying the needle`)
  );
}

/**
 * The trimmed text of one line, refusing a line the file does not reach.
 * @param {string} path
 * @param {number} line
 * @returns {string}
 */
function textAt(path, line) {
  const lines = linesOf(path);
  assert.ok(
    Number.isInteger(line) && line >= 1 && line <= lines.length,
    `${path}:${String(line)} is not a line of a file of ${lines.length}`,
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
 * The names inside the first brace group of a line, as the shipped comments spell them: `code?` is an
 * optional field and is recorded as `code`.
 * @param {string} text
 * @param {string} where
 * @returns {string[]}
 */
function namesInBraces(text, where) {
  const found = /\{([^}]*)\}/.exec(text);
  if (found === null)
    fail(`${where}: ${JSON.stringify(short(text))} declares no brace group`);
  return String(found[1] ?? '')
    .split(',')
    .map((name) =>
      String(name)
        .split(':')[0]
        .trim()
        .replace(/\?$/, '')
        .replace(/[^A-Za-z0-9_$]/g, ''),
    )
    .filter((name) => name !== '');
}

/**
 * The backticked identifiers of a line, in order.
 * @param {string} text
 * @returns {string[]}
 */
function backticked(text) {
  /** @type {string[]} */
  const names = [];
  for (const found of text.matchAll(/`([^`]+)`/g))
    names.push(String(found[1] ?? ''));
  return names;
}

/**
 * Every file under one repository directory with a suffix, sorted, as repository-relative paths.
 * @param {string} directory
 * @param {string} suffix
 * @returns {string[]}
 */
function filesIn(directory, suffix) {
  return readdirSync(join(ROOT, directory))
    .filter((name) => name.endsWith(suffix))
    .sort()
    .map((name) => `${directory}/${name}`);
}

/**
 * The name of the function or constant a line sits in: the nearest preceding top-level `function`
 * declaration, `const X = once(` memoised loader, or `test(` title. A line no such owner precedes has
 * no owner and says so rather than borrowing the file's.
 * @param {string} path
 * @param {number} line
 * @returns {string | null}
 */
function ownerOf(path, line) {
  const lines = linesOf(path);
  for (let index = line - 2; index >= 0; index -= 1) {
    const text = String(lines[index] ?? '');
    const declared = /^\s*(?:async )?function ([A-Za-z0-9_$]+)\(/.exec(text);
    if (declared !== null) return declared[1] ?? null;
    const memoised = /^\s*const ([A-Za-z0-9_$]+) = once\(/.exec(text);
    if (memoised !== null) return memoised[1] ?? null;
    const named = /^\s*test\('([^']+)'/.exec(text);
    if (named !== null) return named[1] ?? null;
  }
  return null;
}

// ------------------------------------------------------------ measurement ----
//
// One pass over the three globs the absences are counted on, so the two needles and the teardown call
// are read from the same bytes on every run.

/**
 * One pass over `extension/*.js`, `scripts/*.mjs` and `research/raw/*.json`: every line carrying one of
 * the three needles or the teardown call, counted per needle and per glob.
 * @returns {{
 *   globs: Record<string, { glob: string, files: string[] }>,
 *   counts: Record<string, Record<string, number>>,
 *   hits: Array<{ needle: string, path: string, line: number, text: string }>,
 * }}
 */
function scanTree() {
  const globs = {
    extension: { glob: 'extension/*.js', files: filesIn('extension', '.js') },
    scripts: { glob: 'scripts/*.mjs', files: filesIn('scripts', '.mjs') },
    researchRaw: {
      glob: 'research/raw/*.json',
      files: filesIn('research/raw', '.json'),
    },
  };
  const needles = [...NEEDLES, UNSUBSCRIBE];
  /** @type {Record<string, Record<string, number>>} */
  const counts = {};
  /** @type {Array<{ needle: string, path: string, line: number, text: string }>} */
  const hits = [];
  for (const [key, { files }] of Object.entries(globs)) {
    counts[key] = Object.fromEntries(needles.map((needle) => [needle, 0]));
    for (const path of files) {
      if (OWN_ARTEFACTS.includes(path)) continue;
      const text = readFileSync(fullPath(path), 'utf8');
      const rows = text.split(/\r?\n/);
      for (let index = 0; index < rows.length; index += 1) {
        const row = String(rows[index] ?? '');
        for (const needle of needles) {
          if (!row.includes(needle)) continue;
          const bucket = counts[key];
          if (bucket !== undefined) bucket[needle] = (bucket[needle] ?? 0) + 1;
          hits.push({ needle, path, line: index + 1, text: row.trim() });
        }
      }
    }
  }
  return { globs, counts, hits };
}

const SCAN = scanTree();

/**
 * The lines under `research/raw/` that carry `NG0205`, with the ones that are the digest's own
 * enumeration told apart from a captured console line. The rule is stated rather than assumed: a line
 * is the digest's enumeration when it is a generator command's output or a quoted code in a list, and
 * every other matching line would be a capture that recorded the code on a page.
 * @returns {any}
 */
function ng0205InResearchRaw() {
  const records = filesIn('research/raw', '.json');
  const searched = records.filter((path) => !OWN_ARTEFACTS.includes(path));
  const matches = [];
  for (const path of searched) {
    const text = readFileSync(fullPath(path), 'utf8');
    const rows = text.split(/\r?\n/);
    for (let index = 0; index < rows.length; index += 1) {
      const row = String(rows[index] ?? '');
      if (!row.includes(CODE_SEARCHED)) continue;
      matches.push({ path, line: index + 1, text: row.trim() });
    }
  }
  const enumeration = matches.filter(
    (match) =>
      /^"output": "/.test(match.text) || /^"NG0205",$/.test(match.text),
  );
  // A record can only state an observation if it has somewhere to state one: the record-shapes shape
  // carries a `producible` section, and every other record that names the code is quoting it — a
  // claim, a citation, a reason string. Counting a quotation as a page hit is the defect this rule
  // exists to prevent: the milestone's own surface and claims records name the code a dozen times
  // without any page having emitted it.
  const observationRecords = new Set(
    searched.filter((path) => {
      try {
        return isObject(
          JSON.parse(readFileSync(fullPath(path), 'utf8')).producible,
        );
      } catch {
        return false;
      }
    }),
  );
  const couldObserve = matches.filter((match) =>
    observationRecords.has(match.path),
  );
  const quotations = matches.filter(
    (match) => !observationRecords.has(match.path),
  );
  return {
    glob: 'research/raw/*.json',
    recordsSearched: searched.length,
    excluded: excludedIn('researchRaw'),
    recordsCarryingTheCode: [...new Set(matches.map((match) => match.path))],
    observationRecords: [...observationRecords],
    lines: matches,
    occurrences: matches.length,
    inTheDigestEnumeration: enumeration.filter((match) =>
      observationRecords.has(match.path),
    ).length,
    quotationsOutsideARecordShape: quotations.length,
    onAPage:
      couldObserve.length -
      enumeration.filter((match) => observationRecords.has(match.path)).length,
    finding:
      'No record under `research/raw/` carries NG0205 as a console line: the two occurrences in the record that could state an observation are the digest enumeration M045 recorded — the generator command output that lists the 64 codes, and the digest section’s own code list — and every other record that names the code is quoting it, which is a citation and not a page hit.',
  };
}

// -------------------------------------------------------------- citations ----
//
// Every citation this record makes: the exact text that names its line. Only the needle is written
// here; the line number, the quoted text and the promise that the needle selects one line are all
// measured by searching the file, at capture and again on every read.

const CITATION_SPEC = Object.freeze([
  // The digest, and the build that throws the code.
  { id: 'digestCode', path: DIGEST, needle: '"code": "NG0205",' },
  {
    id: 'digestTitle',
    path: DIGEST,
    needle: '"title": "Injector has already been destroyed",',
  },
  {
    id: 'frameworkThrow',
    path: FRAMEWORK,
    needle:
      "throw new RuntimeError(-205, ngDevMode && 'Injector has already been destroyed.');",
  },
  {
    id: 'frameworkCodeFormat',
    path: FRAMEWORK,
    needle: 'return `NG0${Math.abs(code)}`;',
  },
  {
    id: 'frameworkMessageFormat',
    path: FRAMEWORK,
    needle: "let errorMessage = `${fullCode}${message ? ': ' + message : ''}`;",
  },
  {
    id: 'frameworkGet',
    path: FRAMEWORK,
    needle: '  get(token, notFoundValue = THROW_IF_NOT_FOUND, options) {',
  },
  // The console join.
  {
    id: 'captureInputFields',
    path: CONSOLE_JOIN,
    needle:
      '//                `captureErrorPayload` (line 2522): `{ code, message, component, timestamp }`.',
  },
  {
    id: 'consoleJoinAnswer',
    path: CONSOLE_JOIN,
    needle: 'function consoleJoin(diagnostics, digest) {',
  },
  {
    id: 'consoleJoinAnswerFields',
    path: CONSOLE_JOIN,
    needle: '// The answer is `{ state, findings[] }` and nothing else:',
  },
  {
    id: 'consoleJoinFindingFields',
    path: CONSOLE_JOIN,
    needle: '//   findings  { text, code?, title?, reason?, carriedCode? }',
  },
  {
    id: 'consoleJoinReadsOnly',
    path: CONSOLE_JOIN,
    needle: '`code` and `message` are read here.',
  },
  {
    id: 'consoleJoinComponentSource',
    path: CONSOLE_JOIN,
    needle:
      'element or app-root, never from the call site, so it is not the emitting component;',
  },
  {
    id: 'consoleJoinVerbatim',
    path: CONSOLE_JOIN,
    needle: "if (typeof message === 'string') return message;",
  },
  {
    id: 'consoleJoinNoDigestEntry',
    path: CONSOLE_JOIN,
    needle:
      'findings.push({ text: text, code: code, reason: NO_DIGEST_ENTRY });',
  },
  // The lint join.
  {
    id: 'lintInputFields',
    path: LINT_CORE,
    needle: '//             `[{ code, text }, …]`',
  },
  {
    id: 'lintInputStackIncluded',
    path: LINT_CORE,
    needle: 'stack frames included',
  },
  {
    id: 'lintAnswerFields',
    path: LINT_CORE,
    needle: '//   { state: "finding",     construct, code, message }',
  },
  {
    id: 'lintStackFrame',
    path: LINT_CORE,
    needle: 'const STACK_FRAME = /\\n\\s+at\\s/;',
  },
  {
    id: 'lintBodyOf',
    path: LINT_CORE,
    needle: 'function bodyOf(text) {',
  },
  {
    id: 'lintStackDropped',
    path: LINT_CORE,
    needle: 'return (frame === -1 ? text : text.slice(0, frame)).trim();',
  },
  {
    id: 'lintNoCapturedMessages',
    path: LINT_CORE,
    needle: "const NO_CAPTURED_MESSAGES = 'no-captured-messages';",
  },
  // The capture the shape is read from, and the agent that writes it.
  {
    id: 'captureConsoleTally',
    path: CAPTURE_RECORD,
    needle: '"withAnNgCode": 1,',
  },
  {
    id: 'captureDigestCarries',
    path: CAPTURE_RECORD,
    needle: '"digestCarriesCode": true,',
  },
  {
    id: 'agentCodePattern',
    path: AGENT,
    needle: 'var codeMatch = text.match(/NG0\\d{3,}/);',
  },
  {
    id: 'agentDispatchPayload',
    path: AGENT,
    needle: 'dispatch(ERROR_CAPTURE_EVENT, {',
  },
  {
    id: 'agentComponentSource',
    path: AGENT,
    needle: 'var instance = ng.getOwningComponent(el);',
  },
  {
    id: 'agentTimestamp',
    path: AGENT,
    needle: "timestamp: typeof Date !== 'undefined' ? Date.now() : 0,",
  },
  {
    id: 'agentCaptureHook',
    path: AGENT,
    needle:
      '// N4: error capture hooks at document_start (console.error, window.onerror,',
  },
  // The producibility measurement: the digest enumeration, the fixture's own write, the portal's own
  // read and release.
  { id: 'm045DigestEnumeration', path: M045, needle: '"output": "NG0100,' },
  { id: 'm045CodedList', path: M045, needle: '"NG0205",' },
  {
    id: 'fixtureSubscribe',
    path: FIXTURE,
    needle: 'this.subject.subscribe((next) => {',
  },
  { id: 'fixturePlainWrite', path: FIXTURE, needle: 'this.value = next;' },
  {
    id: 'fixtureDeliberateError',
    path: FIXTURE,
    needle: "this.subject.error(new Error('interop'));",
  },
  {
    id: 'portalReleaseOnDestroy',
    path: PORTAL_DIRECTIVE,
    needle: 'onCleanup(() => subscription.unsubscribe());',
  },
  {
    id: 'portalResourceRead',
    path: PORTAL_LIST,
    needle: 'readonly contractsLoad = rxResource({',
  },
  // The two teardown sites the agent owns.
  {
    id: 'agentRouterUninstall',
    path: AGENT,
    needle: 'function uninstallRouterEvents() {',
  },
  {
    id: 'agentStabilityUninstall',
    path: AGENT,
    needle: 'function uninstallStability() {',
  },
]);

/**
 * The citations as this head states them: one row per needle, with the line the search found and that
 * line's own trimmed text. A citation whose file this checkout does not carry (the portal, or an
 * installed framework build) is recorded with `resolved: false` and the reason, never as a line it
 * would have had.
 * @returns {Array<any>}
 */
function deriveCitations() {
  return CITATION_SPEC.map((spec) => {
    const where = `citation ${spec.id}`;
    if (!existsSync(fullPath(spec.path))) {
      return {
        id: spec.id,
        path: spec.path,
        line: null,
        text: null,
        resolved: false,
        absentBecause: 'the file is not in this checkout',
      };
    }
    const line = lineOf(spec.path, spec.needle, where);
    return {
      id: spec.id,
      path: spec.path,
      line,
      text: textAt(spec.path, line),
      resolved: true,
    };
  });
}

const CITATIONS = deriveCitations();
/** @type {Map<string, any>} */
const BY_ID = new Map(CITATIONS.map((citation) => [citation.id, citation]));

/**
 * One citation, re-resolved the way the task demands: by reading the file it names and searching that
 * file for the exact line it quotes. The typed number is checked against what the search found, so
 * neither the number nor the quotation is trusted on its own, and the needle the capture used must
 * still select the same single line.
 * @param {any} citation
 * @param {string} where
 * @returns {boolean} whether the file was there to resolve it
 */
function resolveCitation(citation, where) {
  assert.ok(
    isObject(citation),
    `${where}: a citation is an object with a path, a line and the line's own text`,
  );
  const path = citation.path;
  assert.equal(typeof path, 'string', `${where}: path is a string`);
  if (!existsSync(fullPath(String(path)))) {
    assert.equal(
      citation.resolved,
      false,
      `${where}: ${String(path)} is not in this checkout, and a citation that cannot be resolved says so rather than carrying a line`,
    );
    assert.equal(
      citation.line,
      null,
      `${where}: an unresolved citation has no line`,
    );
    return false;
  }
  assert.equal(
    citation.resolved,
    true,
    `${where}: ${String(path)} is in this checkout, so the citation resolves`,
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

  const lines = linesOf(String(path));
  /** @type {number[]} */
  const found = [];
  for (let index = 0; index < lines.length; index += 1)
    if (String(lines[index] ?? '').trim() === citation.text)
      found.push(index + 1);
  assert.equal(
    found.length,
    1,
    `${where}: quotes "${short(citation.text)}" and ${String(path)} holds ${found.length} line(s) with that text at ${found.join(', ')} — a quotation that could mean more than one line names none of them`,
  );
  assert.equal(
    found[0],
    citation.line,
    `${where}: cites ${String(path)}:${String(citation.line)} and searching the file for the quoted line finds it at ${String(found[0])} — the number is not where the line it quotes sits`,
  );

  const spec = CITATION_SPEC.find((entry) => entry.id === citation.id);
  assert.ok(
    spec !== undefined,
    `${where}: ${String(citation.id)} is not a citation this suite knows, so the record names a line nobody measured`,
  );
  assert.equal(
    lineOf(spec.path, spec.needle, where),
    citation.line,
    `${where}: ${String(path)} no longer answers the needle ${JSON.stringify(short(spec.needle))} on line ${String(citation.line)}`,
  );
  return true;
}

// ----------------------------------------------------- what was measured ----
//
// The constants below are the measurement itself — a command's own output, a page's own console, a
// session the skill reported — because nothing in the tree can re-derive what a browser printed.
// Everything they imply is derived from them on every run: the routes from the URLs visited, the codes
// from the captured texts, the totals from the tallied lines, the owners from the teardown sites.

/** The session-scoped directory the two `run-code` harnesses sat in when the drives ran. */
const HARNESS_DIR =
  'C:\\Users\\LARSGY~1\\AppData\\Local\\Temp\\commandcode\\D--projects-sandbox-angular-ai-devtools\\12825768-988f-4c77-96e1-51cb983cf448\\scratchpad';
const PORTAL_HARNESS = `${HARNESS_DIR}\\portal-teardown-drive.js`;
const FIXTURE_HARNESS = `${HARNESS_DIR}\\fixture-teardown-drive.js`;

const UP_PORTAL =
  'node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target portal --json';
const DOWN_PORTAL =
  'node .commandcode/skills/control-angular-dev-app/scripts/control.mjs down --target portal';
const UP_FIXTURE =
  'node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter --json';
const DOWN_FIXTURE =
  'node .commandcode/skills/control-angular-dev-app/scripts/control.mjs down --target counter';
const OPEN_PORTAL =
  'playwright-cli -s=control-ngdev-portal-4507 open http://localhost:4507/';
const OPEN_FIXTURE =
  'playwright-cli -s=control-ngdev-counter-4222 open http://localhost:4222/';

/**
 * Every command whose own output is a measurement, verbatim, with the output it printed. The two
 * browser drives are not here: their command, harness and captured console are the `producible`
 * section's own, so a drive's output is recorded once.
 */
const COMMANDS = Object.freeze([
  {
    command: HEAD_COMMAND,
    output: '5c83c82b2e85a047f6f8114685b5f7e58d30e3e6',
  },
  {
    command: `node -e "const c=require('node:crypto'),f=require('node:fs');const b=f.readFileSync('extension/error-digest.json');const d=JSON.parse(b);const e=d.entries.find(x=>x.code==='NG0205');console.log(e.code, e.title);console.log(d.entries.length, c.createHash('sha256').update(b).digest('hex'), b.length)"`,
    output:
      'NG0205 Injector has already been destroyed\n64 426a5be1f4e344c87e4b70817ac10da3de0f9c8a172325e704b3235953a01c35 61577',
  },
  {
    command: `powershell -NoProfile -Command "Select-String -Path extension/*.js -Pattern 'handleRecord|postDestroy' | Measure-Object | Select-Object -ExpandProperty Count; (Get-ChildItem extension/*.js).Count"`,
    output: '0\n38',
  },
  {
    command: `powershell -NoProfile -Command "foreach ($n in 'handleRecord','postDestroy','leakedHandle') { $e=(Select-String -Path extension/*.js -Pattern $n | Measure-Object).Count; $s=(Select-String -Path scripts/*.mjs -Pattern $n | Measure-Object).Count; $r=(Select-String -Path research/raw/*.json -Pattern $n | Measure-Object).Count; \\"$n extension=$e scripts=$s research=$r\\" }; 'modules extension=' + (Get-ChildItem extension/*.js).Count + ' scripts=' + (Get-ChildItem scripts/*.mjs).Count + ' research=' + (Get-ChildItem research/raw/*.json).Count"`,
    output:
      'handleRecord extension=0 scripts=0 research=0\npostDestroy extension=0 scripts=0 research=0\nleakedHandle extension=0 scripts=0 research=0\nmodules extension=38 scripts=136 research=146',
  },
  {
    command: `powershell -NoProfile -Command "Select-String -Path scripts/*.mjs -Pattern 'handleRecord|postDestroy' | Measure-Object | Select-Object -ExpandProperty Count; (Get-ChildItem scripts/*.mjs).Count; Select-String -Path research/raw/*.json -Pattern 'handleRecord|postDestroy' | Measure-Object | Select-Object -ExpandProperty Count; (Get-ChildItem research/raw/*.json).Count; Select-String -Path extension/*.js,scripts/*.mjs -Pattern '\\.unsubscribe\\(' | ForEach-Object { \\"$($_.Path):$($_.LineNumber): $($_.Line.Trim())\\" }"`,
    output:
      '0\n136\n0\n146\nD:\\projects\\sandbox\\angular-ai-devtools\\extension\\agent-main.js:1858: subscription.unsubscribe();\nD:\\projects\\sandbox\\angular-ai-devtools\\extension\\agent-main.js:2435: subscription.unsubscribe();\nD:\\projects\\sandbox\\angular-ai-devtools\\scripts\\stability-measure.test.mjs:315: subscription.unsubscribe();',
  },
  { command: 'node --version', output: 'v24.22.0' },
  {
    command: 'powershell -NoProfile -Command "playwright-cli --version"',
    output: '0.1.21',
  },
]);

/** The portal session the skill started, and what its `up` reported. */
const PORTAL_SERVING = Object.freeze({
  command: UP_PORTAL,
  url: 'http://localhost:4507/',
  port: 4507,
  slot: 7,
  session: 'control-ngdev-portal-4507',
  readyInSeconds: 13.5,
  evidenceDir: 'tmp/control-angular-dev-app/portal-2026-11-21T23-58-04-705Z',
  startedAt: '2026-11-21T23:58:04.741Z',
  teardownCommand: DOWN_PORTAL,
});

/** The fixture session the skill started, and what its `up` reported. */
const FIXTURE_SERVING = Object.freeze({
  command: UP_FIXTURE,
  url: 'http://localhost:4222/',
  port: 4222,
  slot: 0,
  session: 'control-ngdev-counter-4222',
  readyInSeconds: 6.2,
  evidenceDir: 'tmp/control-angular-dev-app/counter-2026-11-21T23-56-14-301Z',
  startedAt: '2026-11-21T23:56:14.345Z',
  teardownCommand: DOWN_FIXTURE,
});

/**
 * The portal drive: four routes, two destroy windows, 38 console lines and no NG0205. The pangular
 * overlay's own error is five of those lines and NG0913 is three: the console was not silent, it simply
 * never carried the code the milestone is about.
 */
const PORTAL_DRIVE = Object.freeze({
  command: `playwright-cli -s=control-ngdev-portal-4507 --raw run-code --filename="${PORTAL_HARNESS}"`,
  openCommand: OPEN_PORTAL,
  harness: PORTAL_HARNESS,
  actions: [
    'goto http://localhost:4507/contract/list and wait for the table’s first row: 20 rows rendered',
    'goto http://localhost:4507/home and wait for a heading — the list component is destroyed here',
    'a 2000 ms observation window with the page idle after the destroy',
    'goto http://localhost:4507/contract/list again and wait for the first row',
    'goto http://localhost:4507/claim/list, wait for the first row, and a second 2000 ms window',
    'goto http://localhost:4507/customer/list and wait for the network to settle',
    'return the URLs visited, the console lines, and every line whose text carries NG0205',
  ],
  listeners:
    'page.on("console") and page.on("pageerror") in the playwright-cli driver: no listener, no hook, no patch and no global was installed in the page (D7)',
  visited: [
    'http://localhost:4507/contract/list',
    'http://localhost:4507/home',
    'http://localhost:4507/contract/list',
    'http://localhost:4507/claim/list',
    'http://localhost:4507/customer/list',
  ],
  steps: [
    { step: 'load', url: 'http://localhost:4507/contract/list', rows: 20 },
    { step: 'leave', url: 'http://localhost:4507/home' },
    { step: 'destroy-window', consoleLinesAfterDestroy: 8 },
  ],
  page: Object.freeze({ ng: 'object', version: '22.2.2' }),
  consoleTotal: 38,
  ng0205: 0,
  observationWindows: 2,
  windowMs: 2000,
  consoleLines: [
    { type: 'debug', text: '[vite] connecting...', occurrences: 5 },
    { type: 'debug', text: '[vite] connected.', occurrences: 5 },
    {
      type: 'log',
      text: 'Angular is running in development mode.',
      occurrences: 5,
    },
    {
      type: 'error',
      text: 'Failed to load resource: the server responded with a status of 404 (Not Found)',
      occurrences: 10,
    },
    {
      type: 'error',
      text: 'Failed to load resource: the server responded with a status of 502 (Bad Gateway)',
      occurrences: 5,
    },
    {
      type: 'error',
      text: 'Error: [pangular] No devtools server found (tried ./, /__pangular/, /__devframes/pangular/). Mount initPangularHub() or the pangular() Vite plugin in your dev server, before the SSR handler. On a custom path, pass it to initOverlay({baseURL}). See https://pangular-inspector.dev/getting-started/installation/\n    at noServerError (http://localhost:4507/@fs/D:/projects/github/LayZeeDK/HaasStefan__ng-journal-insurance-portal-ai-devtools/.angular/cache/22.2.2/insurance-portal/vite/deps/@pangular-inspector_devtools_overlay.js?v=00af0743:14234:9)\n    at http://localhost:4507/@fs/D:/projects/github/LayZeeDK/HaasStefan__ng-journal-insurance-portal-ai-devtools/.angular/cache/22.2.2/insurance-portal/vite/deps/@pangular-inspector_devtools_overlay.js?v=00af0743:14239:9\n    at async startOverlay (http://localhost:4507/@fs/D:/projects/github/LayZeeDK/HaasStefan__ng-journal-insurance-portal-ai-devtools/.angular/cache/22.2.2/insurance-portal/vite/deps/@pangular-inspector_devtools_overlay.js?v=00af0743:14238:14)',
      occurrences: 5,
    },
    {
      type: 'warning',
      text: 'NG0913: An image with src http://localhost:4507/assets/ng-journal.png has intrinsic file dimensions much larger than its rendered size. This can negatively impact application loading performance. For more information about addressing or disabling this warning, see https://v22.angular.dev/errors/NG0913. Find more at https://v22.angular.dev/errors/NG0913',
      occurrences: 3,
    },
  ],
});

/**
 * The fixture drive: the deliberate leaking component, destroyed by a client-side navigation, then
 * pushed on the instance the driver still held. Four console lines, all of them before the destroy, and
 * the write landed on a plain field.
 */
const FIXTURE_DRIVE = Object.freeze({
  command: `playwright-cli -s=control-ngdev-counter-4222 --raw run-code --filename="${FIXTURE_HARNESS}"`,
  openCommand: OPEN_FIXTURE,
  harness: FIXTURE_HARNESS,
  route: '/stale-view',
  destroyedBy:
    'window.ng.ɵnavigateByUrl(window.ng.ɵgetRouterInstance(window.ng.getInjector(document.querySelector("app-root"))), "/") — a client-side navigation, so the routed component is destroyed without the page unloading',
  actions: [
    'goto http://localhost:4222/stale-view and wait for the fixture’s paragraph',
    'read the mounted instance through ng.getComponent and keep the object in the driver, so no page global is written',
    'navigate to / through ng.ɵnavigateByUrl and wait until the fixture element is detached',
    'call the instance’s own push(41) — the fixture’s post-teardown write — and read value back',
    'a 3000 ms observation window with the page idle after the write',
    'return the mounted facts, the post-teardown write’s result, and every console line',
  ],
  listeners:
    'page.on("console") and page.on("pageerror") in the playwright-cli driver: no listener, no hook, no patch and no global was installed in the page (D7)',
  mounted: Object.freeze({
    url: 'http://localhost:4222/stale-view',
    text: '0',
    name: '_StaleViewFixture',
  }),
  navigated: true,
  consoleLinesBeforeDestroy: 4,
  consoleTotal: 4,
  ng0205: 0,
  windowMs: 3000,
  afterDestroy: Object.freeze({
    stillAnObject: true,
    ownValueBefore: 0,
    push: 'called',
    ownValueAfter: 0,
  }),
  consoleLines: [
    { type: 'debug', text: '[vite] connecting...', occurrences: 1 },
    {
      type: 'log',
      text: 'Angular is running in development mode.',
      occurrences: 1,
    },
    {
      type: 'error',
      text: 'ERROR Error: interop\n    at http://localhost:4222/main.js:30:26\n    at Object.fn (http://localhost:4222/@fs/D:/projects/sandbox/angular-ai-devtools/spikes/ng222-app/.angular/cache/22.2.2/ng222-app/vite/deps/_resource-chunk-J43UWQbW.js?v=ce1c2158:3101:3)\n    at runEffect (http://localhost:4222/@fs/D:/projects/sandbox/angular-ai-devtools/spikes/ng222-app/.angular/cache/22.2.2/ng222-app/vite/deps/_resource-chunk-J43UWQbW.js?v=ce1c2158:331:8)\n    at Object.run (http://localhost:4222/@fs/D:/projects/sandbox/angular-ai-devtools/spikes/ng222-app/.angular/cache/22.2.2/ng222-app/vite/deps/_resource-chunk-J43UWQbW.js?v=ce1c2158:3033:4)\n    at runEffectsInView (http://localhost:4222/@fs/D:/projects/sandbox/angular-ai-devtools/spikes/ng222-app/.angular/cache/22.2.2/ng222-app/vite/deps/core-DSBe9tx0.js?v=ce1c2158:4858:69)\n    at refreshView (http://localhost:4222/@fs/D:/projects/sandbox/angular-ai-devtools/spikes/ng222-app/.angular/cache/22.2.2/ng222-app/vite/deps/core-DSBe9tx0.js?v=ce1c2158:4939:3)\n    at detectChangesInView (http://localhost:4222/@fs/D:/projects/sandbox/angular-ai-devtools/spikes/ng222-app/.angular/cache/22.2.2/ng222-app/vite/deps/core-DSBe9tx0.js?v=ce1c2158:5061:25)\n    at detectChangesInViewIfAttached (http://localhost:4222/@fs/D:/projects/sandbox/angular-ai-devtools/spikes/ng222-app/.angular/cache/22.2.2/ng222-app/vite/deps/core-DSBe9tx0.js?v=ce1c2158:5047:2)\n    at detectChangesInEmbeddedViews (http://localhost:4222/@fs/D:/projects/sandbox/angular-ai-devtools/spikes/ng222-app/.angular/cache/22.2.2/ng222-app/vite/deps/core-DSBe9tx0.js?v=ce1c2158:5021:3)\n    at refreshView (http://localhost:4222/@fs/D:/projects/sandbox/angular-ai-devtools/spikes/ng222-app/.angular/cache/22.2.2/ng222-app/vite/deps/core-DSBe9tx0.js?v=ce1c2158:4940:3)',
      occurrences: 1,
    },
    { type: 'debug', text: '[vite] connected.', occurrences: 1 },
  ],
});

/** What the installed build states about the code, measured rather than assumed (C2). */
const FRAMEWORK_RECORDED = Object.freeze({
  codeNumber: -205,
  bodyLiteral: 'Injector has already been destroyed.',
  codeTemplate: 'NG0${Math.abs(code)}',
  guard: 'ngDevMode',
  lookupMethod: 'Injector.get',
});

const PRODUCIBLE_QUESTION =
  'can the Insurance Portal, or the fixture this repository already carries, be driven so that a component touching its injector after teardown emits NG0205?';

const PORTAL_MISSING =
  'No NG0205 in the console over 5 navigations and 4 distinct routes — 38 console lines, 0 carrying the code — and the observable that is absent is the page action, not the read: NG0205 is thrown by Injector.get on a destroyed injector, and nothing the portal’s driven route does after the two destroys performs that lookup. The contract list reads through an rxResource stream torn down with the view (libs/contract/feature-list/src/lib/list.component.ts:63), and the one hand-rolled subscription in the portal’s 157 library sources is released in onCleanup (libs/shared/ui-directives/src/lib/button-action.directive.ts:35). The console was not silent: it carried the pangular overlay’s error five times and NG0913 three times; it never carried the code.';

const FIXTURE_MISSING =
  'No NG0205 in the console, and the observable that is absent is a lookup through a destroyed injector. The fixture’s deliberate post-teardown write is a plain field assignment from its own subscription (spikes/ng222-app/src/app/stale-view-fixture.ts:17-18), which reaches no injector: after the route component was detached, push(41) on the instance the driver still held was accepted and left value at 0, and all 4 console lines the page produced were recorded before the destroy.';

const NOT_FABRICATED =
  'No probe was run against a destroyed injector to make the code appear. A page-side call that provoked it would be the instrumentation D7 forbids, and it would report the probe rather than the page; a second leaking fixture needs its own owner ruling (plan R2). R1’s absence-only outcome is therefore the measurement, recorded as an absence with the observable it lacks.';

const PRODUCIBLE_MISSING =
  'the diagnostic was not produced on either target, and what is missing is a page action rather than a read: NG0205 is thrown by Injector.get on a destroyed injector, and neither driven page leaves a callback that performs such a lookup after its own destroy. Each target states the observable it lacks in `targets.<target>.missing`.';

const PRODUCIBLE_FINDING =
  'The diagnostic is not producible on either target as the tree stands. What would produce it is a component whose own code calls injector.get (or a service it injected) after its injector was destroyed; the two driven pages hold no such callback, and the fixture’s stale write sets a field.';

const ABSENCE_NOT_GAPS =
  'Both are states the answer renders, never a gap a capture could fill: no record this repository holds carries a per-injector handle, so no later run can add one, and the handle is not something the console stream could carry — the stream carries a code and a body, and the body names no owner.';

const INSTRUMENT = Object.freeze({
  reads: [
    DIGEST,
    FRAMEWORK,
    CAPTURE_RECORD,
    M045,
    CONSOLE_JOIN,
    LINT_CORE,
    AGENT,
    FIXTURE,
    PORTAL_DIRECTIVE,
    PORTAL_LIST,
    'the two browser drives recorded under `producible`',
  ],
  how: 'statically for the digest, the joins and the absences: each file is parsed and each line a claim rests on is found by searching its file for the text the citation quotes; dynamically for producibility, where the two drives recorded under `producible` are the measurement and their captured console is tallied and searched on every run',
  holds:
    'a section holds where this head re-derives the same value on every run; a citation holds where searching the file for the quoted line finds it on exactly the line the record names and on no second line; a drive holds where its tallied lines sum to the total it printed, and where the codes it names are the codes its own texts carry',
  nothingRun:
    'this suite opens no page, starts no browser and builds nothing: the two drives were made once through the control-angular-dev-app skill and their console is recorded here, so a read run asks no page anything',
});

// ------------------------------------------------------------ derivation ----

/** @param {any} value @param {string} [at] @param {Array<[string, string]>} [out] @returns {Array<[string, string]>} */
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

/**
 * The fields a brace group declares, with the optional ones told apart: `{ text, code?, … }` declares
 * one required field and one optional one, and the record states both.
 * @param {string} text
 * @param {string} where
 * @returns {{ fields: string[], optional: string[] }}
 */
function fieldsWithOptionality(text, where) {
  const group = /\{([^}]*)\}/.exec(text);
  if (group === null)
    fail(`${where}: ${JSON.stringify(short(text))} declares no brace group`);
  const pieces = String(group[1] ?? '')
    .split(',')
    .map((piece) => piece.trim())
    .filter((piece) => piece !== '');
  const nameOf = (piece) =>
    String(piece)
      .split(':')[0]
      .trim()
      .replace(/\?$/, '')
      .replace(/[^A-Za-z0-9_$]/g, '');
  return {
    fields: pieces.map(nameOf),
    optional: pieces.filter((piece) => piece.endsWith('?')).map(nameOf),
  };
}

/**
 * What a captured console message can carry, and which of those fields the shipped joins read. Read
 * from `research/raw/m032-console-diagnostics.json` and from the two comments that declare each join's
 * input, so a capture that gains a field, or a join that starts reading one, moves this.
 * @returns {{ messageFields: string[], payloadFields: string[], readFields: string[], source: string[], notRead: string[] }}
 */
function fieldNamesOfTheCapture() {
  const capture = jsonOf(CAPTURE_RECORD);
  const messages = Array.isArray(capture.messages) ? capture.messages : [];
  const messageFields = [
    ...new Set(messages.flatMap((message) => Object.keys(message))),
  ].sort();
  const payloadFields = namesInBraces(
    String(BY_ID.get('captureInputFields')?.text ?? ''),
    'the console join’s input',
  );
  const readFields = [
    ...new Set([
      ...backticked(
        String(BY_ID.get('consoleJoinReadsOnly')?.text ?? '').split(
          'are read here',
        )[0] ?? '',
      ),
      ...namesInBraces(
        String(BY_ID.get('lintInputFields')?.text ?? ''),
        'the lint join’s input',
      ),
    ]),
  ].sort();
  const source = [...new Set([...messageFields, ...payloadFields])].sort();
  return {
    messageFields,
    payloadFields,
    readFields,
    source,
    notRead: source.filter((field) => !readFields.includes(field)),
  };
}

/**
 * What the installed build does with the code: the throw site's number and body, the template the
 * number is printed with, and whether the throw sits in a lookup. When the installed build is not in
 * this checkout the recorded values stand, and the citations that name the build say they could not be
 * re-resolved.
 * @returns {any}
 */
function frameworkMessage() {
  /** @param {string} id @returns {any} */
  const citable = (id) => {
    const citation = BY_ID.get(id);
    return citation === undefined || citation.resolved !== true
      ? null
      : citation;
  };
  let codeNumber = FRAMEWORK_RECORDED.codeNumber;
  let bodyLiteral = FRAMEWORK_RECORDED.bodyLiteral;
  let codeTemplate = FRAMEWORK_RECORDED.codeTemplate;
  let emittedOnALookup = true;
  const thrown = citable('frameworkThrow');
  if (thrown !== null) {
    const parsed = /RuntimeError\((-?\d+), ngDevMode && '([^']*)'\)/.exec(
      String(thrown.text),
    );
    assert.ok(
      parsed !== null,
      `${FRAMEWORK}:${String(thrown.line)} is not a \`new RuntimeError(<code>, ngDevMode && '<body>')\` throw, so the printed message cannot be derived from it`,
    );
    codeNumber = Number(parsed[1]);
    bodyLiteral = String(parsed[2]);
    const format = citable('frameworkCodeFormat');
    if (format !== null) {
      const template = /`([^`]+)`/.exec(String(format.text));
      if (template !== null) codeTemplate = String(template[1]);
    }
    const lookup = citable('frameworkGet');
    emittedOnALookup = false;
    if (lookup !== null) {
      const lines = linesOf(FRAMEWORK);
      const last = Math.min(Number(lookup.line) + 30, lines.length);
      for (let index = Number(lookup.line); index < last; index += 1) {
        if (String(lines[index] ?? '').includes('assertNotDestroyed(this);')) {
          emittedOnALookup = true;
          break;
        }
      }
    }
  }
  const printedPrefix = codeTemplate.replace(
    '${Math.abs(code)}',
    String(Math.abs(codeNumber)),
  );
  return {
    build: FRAMEWORK,
    codeNumber,
    codeTemplate,
    bodyLiteral,
    guard: FRAMEWORK_RECORDED.guard,
    lookupMethod: FRAMEWORK_RECORDED.lookupMethod,
    printedPrefix,
    printedAs: `${printedPrefix}: ${bodyLiteral}`,
    emittedOnALookup,
    note: 'the digest states the title without a full stop and the build states the body with one, so a surface that renders the digest row and one that renders the message body are spelling two different strings (C2)',
    citationIds: [
      'frameworkThrow',
      'frameworkCodeFormat',
      'frameworkMessageFormat',
      'frameworkGet',
    ],
  };
}

/** The digest: the entry verbatim, the file's own hash, and what the build prints for it. @returns {any} */
function deriveDigest() {
  const bytes = readFileSync(fullPath(DIGEST));
  const parsed = JSON.parse(bytes.toString('utf8'));
  const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
  const entry = entries.find((candidate) => candidate?.code === CODE_SEARCHED);
  if (entry === undefined)
    fail(
      `${DIGEST} carries no ${CODE_SEARCHED} entry, and every claim this milestone makes rests on that code being in the digest`,
    );
  const framework = frameworkMessage();
  return {
    path: DIGEST,
    version: parsed.version ?? null,
    entries: entries.length,
    uniqueCodes: new Set(entries.map((candidate) => candidate?.code)).size,
    sha256: sha256(bytes),
    bytes: bytes.length,
    entry: { code: entry.code, title: entry.title, body: entry.body },
    titleWithoutAFullStop: !String(entry.title).endsWith('.'),
    bodyEndsWithAnEllipsis: String(entry.body).endsWith('…'),
    printedByTheInstalledBuild: framework,
    finding: `The digest states the code and the title, and its body is documentation — ${String(entry.body).length} characters, ending in an ellipsis — so it cannot stand in for the string a console prints. That string is “${framework.printedAs}”, derived from the build's own throw site: the code is the throw's number printed as \`NG0\` + its absolute value, and the body is the literal the throw carries.`,
    citationIds: ['digestCode', 'digestTitle', ...framework.citationIds],
  };
}

/**
 * What a console message carries after each shipped join has read it: the fields, where the stack goes,
 * and what — if anything — identifies the source. @returns {any}
 */
function deriveMessage() {
  const capture = jsonOf(CAPTURE_RECORD);
  const messages = Array.isArray(capture.messages) ? capture.messages : [];
  const coded = Array.isArray(capture.ngCodedMessages)
    ? capture.ngCodedMessages
    : [];
  const fields = fieldNamesOfTheCapture();
  const consoleJoinFinding = fieldsWithOptionality(
    String(BY_ID.get('consoleJoinFindingFields')?.text ?? ''),
    'the console join’s finding',
  );
  const consoleJoinAnswer = namesInBraces(
    String(BY_ID.get('consoleJoinAnswerFields')?.text ?? ''),
    'the console join’s answer',
  );
  const lintFinding = namesInBraces(
    String(BY_ID.get('lintAnswerFields')?.text ?? ''),
    'the lint join’s finding',
  );
  const lintAbsences = linesOf(LINT_CORE)
    .map((row) => /^\/\/   ([a-z]+(?:-[a-z]+)+)\s{2,}\S/.exec(String(row)))
    .filter((found) => found !== null)
    .map((found) => String(found[1] ?? ''));
  return {
    question:
      'once the shipped joins have read it, which fields does a console message carry, does the stack survive, and what identifies the source?',
    capture: {
      path: CAPTURE_RECORD,
      messages: messages.length,
      codedMessages: coded.length,
      code: coded[0]?.code ?? null,
      digestCarriesThatCode: coded[0]?.digestCarriesCode === true,
      fieldKeys: [
        ...new Set(messages.flatMap((message) => Object.keys(message))),
      ].sort(),
      locationKeys: [
        ...new Set(
          messages.flatMap((message) => Object.keys(message.location ?? {})),
        ),
      ].sort(),
      withALocation: messages.filter((message) => isObject(message.location))
        .length,
      withAStackFrame: messages.filter((message) =>
        /\n\s+at\s/.test(String(message.text)),
      ).length,
      finding:
        'The capture writes five fields per console message — `order`, `type`, `code`, `text` and `location`, the last with five of its own — and the stack survives exactly once, inside `text`, in the frame lines the message printed (C3).',
      citationIds: ['captureConsoleTally', 'captureDigestCarries'],
    },
    joins: {
      consoleJoin: {
        path: CONSOLE_JOIN,
        function: 'consoleJoin',
        answerFields: consoleJoinAnswer,
        findingFields: consoleJoinFinding.fields,
        alwaysPresent: consoleJoinFinding.fields.filter(
          (field) => !consoleJoinFinding.optional.includes(field),
        ),
        optional: consoleJoinFinding.optional,
        inputFields: fields.payloadFields,
        readsOnly: fields.readFields.filter((field) =>
          fields.payloadFields.includes(field),
        ),
        stackSurvives: true,
        stackSurvivesAs:
          'inside `text`, byte for byte: the join returns the captured string untouched, so the frames are part of the string and are never a field',
        noDigestEntryReason: 'no-digest-entry',
        citationIds: [
          'consoleJoinAnswer',
          'consoleJoinAnswerFields',
          'consoleJoinFindingFields',
          'consoleJoinReadsOnly',
          'consoleJoinVerbatim',
          'consoleJoinNoDigestEntry',
          'captureInputFields',
        ],
      },
      lintJoin: {
        path: LINT_CORE,
        function: 'lintJoin',
        findingFields: lintFinding,
        absenceField: 'reason',
        absenceNames: lintAbsences,
        inputFields: namesInBraces(
          String(BY_ID.get('lintInputFields')?.text ?? ''),
          'the lint join’s input',
        ),
        stackSurvives: false,
        stackDroppedBy: 'bodyOf',
        stackDroppedAt:
          'the first line matching `STACK_FRAME`, a newline, indentation and `at `: everything after it is dropped and the rest is trimmed',
        citationIds: [
          'lintInputFields',
          'lintInputStackIncluded',
          'lintAnswerFields',
          'lintStackFrame',
          'lintBodyOf',
          'lintStackDropped',
          'lintNoCapturedMessages',
        ],
      },
    },
    sourceIdentity: {
      readByTheConsoleJoin: fields.readFields.filter((field) =>
        fields.payloadFields.includes(field),
      ),
      readByTheLintJoin: namesInBraces(
        String(BY_ID.get('lintInputFields')?.text ?? ''),
        'the lint join’s input',
      ),
      carriedByTheCaptureAndReadByNeither: fields.notRead,
      theComponentFieldIsTheFocusedElementsOwner: true,
      theStackNamesAComponentAndIsNotTheMessage: true,
      finding:
        'Neither join carries a component, an element or a location: the console join reads only `code` and `message` out of a payload that also carries `component` and `timestamp`, and the lint join strips the stack before it names anything. What identifies a source is therefore the message body’s own words and nothing else, and the capture’s `location` — the field that really names where the message came from — is read by no join at all.',
      citationIds: [
        'consoleJoinComponentSource',
        'agentComponentSource',
        'agentTimestamp',
        'agentCodePattern',
        'agentDispatchPayload',
        'agentCaptureHook',
      ],
    },
    finding:
      'A post-teardown NG0205 reaches the join as one finding whose fields are `text` and `code`, plus the digest’s `title`: the code is the one the message carried, the text is the message byte for byte, and no field names the component that wrote it — so the answer can state the code and the body, and must state `owner-not-in-the-message` beside them (C3, SC1).',
  };
}

/**
 * The console a drive captured, tallied: its total, the lines it carried, how many of them carried the
 * code, and the codes its own texts name.
 * @param {{ consoleLines: ReadonlyArray<any> }} drive
 * @returns {any}
 */
function consoleView(drive) {
  const lines = drive.consoleLines.map((line) => ({ ...line }));
  const total = lines.reduce((sum, line) => sum + line.occurrences, 0);
  const carrying = lines.filter((line) =>
    String(line.text).includes(CODE_SEARCHED),
  );
  const codes = [
    ...new Set(
      lines.flatMap((line) =>
        [...String(line.text).matchAll(/NG\d{4,5}/g)].map((found) =>
          String(found[0]),
        ),
      ),
    ),
  ].sort();
  return {
    total,
    ng0205: carrying.reduce((sum, line) => sum + line.occurrences, 0),
    codesSeen: codes,
    lines,
  };
}

/** The paths a list of URLs visits, in order and without repeats. @param {readonly string[]} urls @returns {string[]} */
function routesTriedOf(urls) {
  return [...new Set(urls.map((url) => new URL(url).pathname))];
}

/** Whether the code was produced anywhere: on a page under `research/raw/`, or on either drive. @returns {any} */
function deriveProducible() {
  const researchRaw = ng0205InResearchRaw();
  const portalConsole = consoleView(PORTAL_DRIVE);
  const fixtureConsole = consoleView(FIXTURE_DRIVE);
  const produced =
    researchRaw.onAPage + portalConsole.ng0205 + fixtureConsole.ng0205;
  return {
    question: PRODUCIBLE_QUESTION,
    codeSearched: CODE_SEARCHED,
    verdict: produced === 0 ? 'not-produced' : 'produced',
    produced,
    targets: {
      portal: {
        target: 'portal',
        checkout: PORTAL_DIR,
        served: { ...PORTAL_SERVING },
        drive: {
          command: PORTAL_DRIVE.command,
          openCommand: PORTAL_DRIVE.openCommand,
          harness: PORTAL_DRIVE.harness,
          actions: [...PORTAL_DRIVE.actions],
          listeners: PORTAL_DRIVE.listeners,
        },
        routesTried: routesTriedOf(PORTAL_DRIVE.visited),
        visited: [...PORTAL_DRIVE.visited],
        steps: PORTAL_DRIVE.steps.map((step) => ({ ...step })),
        page: { ...PORTAL_DRIVE.page },
        console: portalConsole,
        consoleTotalAsPrinted: PORTAL_DRIVE.consoleTotal,
        ng0205AsPrinted: PORTAL_DRIVE.ng0205,
        observationWindows: PORTAL_DRIVE.observationWindows,
        windowMs: PORTAL_DRIVE.windowMs,
        missing: PORTAL_MISSING,
        citationIds: ['portalReleaseOnDestroy', 'portalResourceRead'],
      },
      fixture: {
        target: 'spikes/ng222-app',
        route: FIXTURE_DRIVE.route,
        destroyedBy: FIXTURE_DRIVE.destroyedBy,
        served: { ...FIXTURE_SERVING },
        drive: {
          command: FIXTURE_DRIVE.command,
          openCommand: FIXTURE_DRIVE.openCommand,
          harness: FIXTURE_DRIVE.harness,
          actions: [...FIXTURE_DRIVE.actions],
          listeners: FIXTURE_DRIVE.listeners,
        },
        routesTried: routesTriedOf([
          FIXTURE_DRIVE.mounted.url,
          FIXTURE_SERVING.url,
        ]),
        mounted: { ...FIXTURE_DRIVE.mounted },
        afterDestroy: { ...FIXTURE_DRIVE.afterDestroy },
        console: fixtureConsole,
        consoleTotalAsPrinted: FIXTURE_DRIVE.consoleTotal,
        ng0205AsPrinted: FIXTURE_DRIVE.ng0205,
        consoleLinesBeforeDestroy: FIXTURE_DRIVE.consoleLinesBeforeDestroy,
        consoleLinesAfterDestroy:
          FIXTURE_DRIVE.consoleTotal - FIXTURE_DRIVE.consoleLinesBeforeDestroy,
        windowMs: FIXTURE_DRIVE.windowMs,
        missing: FIXTURE_MISSING,
        citationIds: [
          'fixtureSubscribe',
          'fixturePlainWrite',
          'fixtureDeliberateError',
        ],
      },
    },
    researchRaw,
    missing: produced === 0 ? PRODUCIBLE_MISSING : null,
    notFabricated: NOT_FABRICATED,
    finding: PRODUCIBLE_FINDING,
    citationIds: ['m045DigestEnumeration', 'm045CodedList'],
  };
}

/**
 * The two absences as states, with the scan that forces the handle one and the sites that show what
 * the agent does unsubscribe. @returns {any}
 */
function deriveAbsences() {
  /** @param {string} key @returns {any} */
  const scanOf = (key) => {
    const glob = SCAN.globs[key];
    return {
      glob: glob?.glob ?? null,
      filesSearched: (glob?.files ?? []).filter(
        (path) => !OWN_ARTEFACTS.includes(path),
      ).length,
      excluded: excludedIn(key),
      matches: Object.fromEntries(
        NEEDLES.map((needle) => [needle, SCAN.counts[key]?.[needle] ?? 0]),
      ),
    };
  };
  const sites = SCAN.hits
    .filter((hit) => hit.needle === UNSUBSCRIBE)
    .map((hit) => {
      const owner = ownerOf(hit.path, hit.line);
      const spec = CITATION_SPEC.find(
        (entry) => owner !== null && entry.needle === `function ${owner}() {`,
      );
      return {
        path: hit.path,
        line: hit.line,
        text: hit.text,
        owner,
        citationId: spec === undefined ? null : spec.id,
      };
    });
  const occurrences = NEEDLES.reduce(
    (sum, needle) =>
      sum +
      ['extension', 'scripts', 'researchRaw'].reduce(
        (inner, key) => inner + (SCAN.counts[key]?.[needle] ?? 0),
        0,
      ),
    0,
  );
  const fields = fieldNamesOfTheCapture();
  const ownerFields = fields.source.filter((field) =>
    ['component', 'directive', 'element'].includes(field),
  );
  return {
    notGaps: ABSENCE_NOT_GAPS,
    [ABSENCE_OWNER]: {
      state: ABSENCE_OWNER,
      because:
        'NG0205 prints as the code and the body “Injector has already been destroyed.” — the injector it names is the destroyed one, and no component, directive or element is named beside it',
      ownerFieldsInTheCapture: ownerFields,
      ownerFieldsTheJoinsRead: ownerFields.filter((field) =>
        fields.readFields.includes(field),
      ),
      componentIsTheFocusedElementsOwner: true,
      finding:
        'The one field that could name an owner is the capture’s `component`, and it is the owner of the focused element or `app-root` rather than the component that emitted the message; neither join reads it, so a joined message never carries it and the answer says `owner-not-in-the-message` instead of attributing the code to whatever was mounted last (N1, SC1).',
      citationIds: [
        'agentComponentSource',
        'consoleJoinComponentSource',
        'lintStackDropped',
      ],
    },
    [ABSENCE_HANDLE]: {
      state: ABSENCE_HANDLE,
      scan: {
        extension: scanOf('extension'),
        scripts: scanOf('scripts'),
        researchRaw: scanOf('researchRaw'),
      },
      needles: [...NEEDLES],
      occurrences,
      finding:
        'No record this agent holds carries a per-injector handle: the three names a handle record would need occur 0 times in 38 extension modules, 136 suites and 146 `research/raw/` records, and the console stream the panel reads could not carry one — it carries a code and a body. Building one would be the page-side instrumentation D7 and SC2 forbid, so the answer states `handle-record-not-held` (C1, SC4).',
      citationIds: ['m045DigestEnumeration', 'm045CodedList'],
    },
    sites,
    siteCount: sites.length,
    agentSites: sites.filter((site) => site.path.startsWith('extension/'))
      .length,
    suiteSites: sites.filter((site) => site.path.startsWith('scripts/')).length,
    note: 'The brief this task was handed expects two `.unsubscribe(` sites; this head carries three. The two in `extension/agent-main.js` are the agent’s own subscriptions torn down on its reset path — `uninstallRouterEvents` releases the router-event subscription and `uninstallStability` the stability one — and the third is the memoised fixture loader `const CURRENCY = once(` in `scripts/stability-measure.test.mjs:288`, which releases the observable it built. None of the three is a handle the inspected page holds.',
    citationIds: ['agentRouterUninstall', 'agentStabilityUninstall'],
  };
}

/** The machine, the tool and the two sessions the measurement ran on. @returns {any} */
function deriveEnvironment() {
  return {
    platform: process.platform,
    node: 'v24.22.0',
    playwrightCli: '0.1.21',
    browser:
      'the Playwright Chromium the control-angular-dev-app session drives (playwright-cli 0.1.21)',
    shell:
      'PowerShell 5.1 for the measurement commands; the two drives ran through playwright-cli from the same shell',
    serving: { portal: { ...PORTAL_SERVING }, fixture: { ...FIXTURE_SERVING } },
    page: { angularVersion: '22.2.2', devBuild: true, ngGlobal: 'object' },
    note: 'each `up` printed a process table beside these facts; the table is bookkeeping for `down` and stays in the skill’s evidence directory, so only the facts this record uses are carried here',
  };
}

/**
 * The table the census reads: the artefacts this milestone measured, each with what it holds. The two
 * records this milestone writes are named here because the milestone measured them, and the inventory
 * names them outside this map at the same time because this measurement was taken before they existed
 * — a table entry says what the artefact holds, never that this map read it as an input.
 * @returns {any[]}
 */
function deriveRecords() {
  return [
    {
      path: OWED.surface,
      carries:
        'the surface record M059 T003 wrote — the `teardown-leak` route and its loader key, the exported `teardownLeakPanel`, the digest rows and the sample answer the panel renders field for field — named outside this map rather than read as an input, because it was written after this measurement',
      task: 'T003',
    },
    {
      path: OWED.verdictClaims,
      carries:
        'the verdict-claims record M059 T004 wrote — one claim per criterion this milestone’s intent declares, each naming the artefact it rests on by `artefactPath` and re-derived against the tree — named outside this map rather than read as an input, because it was written after this measurement',
      task: 'T004',
    },
    {
      path: CAPTURE_RECORD,
      carries:
        'the captured console this map’s message section is measured from: four messages with the five fields a message carries, the one coded message the digest carries and the one stack that survives inside `text`',
      task: null,
    },
    {
      path: M045,
      carries:
        'the console-shapes map this map’s producible section reads: the digest’s own 64-code enumeration and coded list, which is where the code this milestone answers for is quoted rather than observed on a page',
      task: null,
    },
  ];
}

/**
 * The inventory the census reads: this map measures no verdict-claims or surface record, and it names
 * the two records this milestone owes outside itself from the start, so no later wave has to touch the
 * map to have its own record excused (C2, C7, D1).
 * @returns {any}
 */
function deriveInventory() {
  return {
    measured:
      'No record under `research/raw/` is measured by this map: its sections are measured from the digest, the two shipped joins, the capture record, M045’s map and the agent’s own source, so this map measures what the later waves cite rather than a census of records.',
    outsideTheMap: [
      {
        path: OWED.surface,
        why: 'the surface record M059 T003 writes — the route, the loader key and each state with the answer field it reads — is captured after this map was measured, so it is named outside the map rather than read as an unmeasured record',
      },
      {
        path: OWED.verdictClaims,
        why: 'the verdict-claims record M059 T004 writes, ruling the criteria this milestone’s intent declares, is captured after this map was measured, so it is named outside the map rather than read as an unmeasured record',
      },
    ],
  };
}

/**
 * The record's one-sentence verdict, built from the measured sections rather than typed: a sentence
 * written here would keep claiming the counts of the head it was written at.
 * @param {any} sections
 * @returns {string}
 */
function verdictOf(sections) {
  const digest = sections.digest;
  const message = sections.message;
  const producible = sections.producible;
  const absences = sections.absences;
  const handle = absences[ABSENCE_HANDLE];
  return [
    `the digest is ${digest.bytes} bytes and carries ${digest.entry.code} “${digest.entry.title}” and the installed build prints “${digest.printedByTheInstalledBuild.printedAs}”`,
    `a joined console message carries ${message.joins.consoleJoin.findingFields.length} fields with the stack kept inside \`text\` and ${message.joins.lintJoin.findingFields.length} with it dropped, and neither join carries the capture's \`location\` or \`component\``,
    `driving the portal over ${producible.targets.portal.routesTried.length} routes (${producible.targets.portal.console.total} console lines) and spikes/ng222-app over ${producible.targets.fixture.routesTried.length} routes (${producible.targets.fixture.console.total} console lines) produced ${producible.produced} ${producible.codeSearched}`,
    `and ${handle.scan.extension.matches.handleRecord}+${handle.scan.scripts.matches.handleRecord}+${handle.scan.researchRaw.matches.handleRecord} handleRecord and ${handle.scan.extension.matches.postDestroy}+${handle.scan.scripts.matches.postDestroy}+${handle.scan.researchRaw.matches.postDestroy} postDestroy occurrences across ${handle.scan.extension.filesSearched} extension modules, ${handle.scan.scripts.filesSearched} suites and ${handle.scan.researchRaw.filesSearched} records (the ${handle.scan.extension.excluded.length + handle.scan.scripts.excluded.length + handle.scan.researchRaw.excluded.length} files this milestone adds are excluded from the count)`,
    `so ${producible.verdict} and ${handle.state} are the two answers the milestone can ship`,
  ]
    .join('; ')
    .concat('.');
}

/**
 * The field paths a re-capture re-derives, so a section that stops being produced shows up as a
 * divergence rather than as a silent pass.
 * @param {any} sections
 * @returns {string[]}
 */
function remeasuredOf(sections) {
  /** @type {string[]} */
  const paths = [];
  for (const [section, value] of Object.entries(sections)) {
    if (!isObject(value)) {
      paths.push(section);
      continue;
    }
    for (const inner of Object.keys(value)) paths.push(`${section}.${inner}`);
  }
  return paths.sort();
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
 * The record as this head derives it. `capturedAt` is the one value no reading of the tree settles: it
 * is the time the file was first written, carried forward on every re-capture so an armed run with
 * nothing moved reproduces it and writes no byte. `head` is the commit the capture ran at, carried so
 * the record names the tree it measured rather than the one that carries it.
 * @param {string} capturedAt
 * @param {string} head
 * @returns {any}
 */
function derive(capturedAt, head) {
  const digest = deriveDigest();
  const message = deriveMessage();
  const producible = deriveProducible();
  const absences = deriveAbsences();
  const records = deriveRecords();
  const inventory = deriveInventory();
  return {
    schema: SCHEMA,
    milestone: MILESTONE,
    task: TASK,
    title: TITLE,
    question: QUESTION,
    verdict: verdictOf({ digest, message, producible, absences }),
    head,
    headCommand: HEAD_COMMAND,
    capturedAt,
    instrument: INSTRUMENT,
    records,
    environment: deriveEnvironment(),
    commands: COMMANDS.map((entry) =>
      entry.command === HEAD_COMMAND ? { ...entry, output: head } : entry,
    ),
    digest,
    message,
    producible,
    absences,
    inventory,
    citations: CITATIONS,
    capture: {
      task: TASK,
      command: ARMED_COMMAND,
      windowsCommand: ARMED_COMMAND_WINDOWS,
      check: CHECK_COMMAND,
      records: RECORD_REL,
      head,
      criteria: [...CRITERIA],
      reads: INSTRUMENT.reads,
      remeasured: remeasuredOf({
        digest,
        message,
        producible,
        absences,
        records,
        inventory,
      }),
      reading:
        'a default run derives every field above and asserts the recording on disk is exactly what this head states; an armed run writes only when a byte moved, so two armed runs in a row are byte-identical and a default run writes nothing (D5, E9)',
    },
    builtNothing: {
      built: [],
      description:
        'No join, no surface, no route and no fixture: this task measures, and the only files it writes are this record and the suite that owns it.',
    },
  };
}

// ------------------------------------------------------------------ checks ----

/** The sections a reading of the tree settles, in the order the record states them. */
const DERIVED_SECTIONS = Object.freeze([
  'instrument',
  'records',
  'environment',
  'commands',
  'digest',
  'message',
  'producible',
  'absences',
  'inventory',
  'verdict',
  'capture',
  'builtNothing',
]);

/**
 * The record's own identity, read before anything is derived from it.
 * @param {any} recording
 * @returns {void}
 */
function checkIdentity(recording) {
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
  assert.equal(
    recording.title,
    TITLE,
    `the recording title is ${JSON.stringify(recording.title)}`,
  );
  for (const key of ['question', 'verdict'])
    assert.ok(
      typeof recording[key] === 'string' && recording[key].trim() !== '',
      `the recording states its own ${key}`,
    );
  assert.equal(
    recording.headCommand,
    HEAD_COMMAND,
    'the recording states the command its head was read by',
  );
  assert.match(
    String(recording.capturedAt),
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    `the recording states when it was captured, and ${JSON.stringify(recording.capturedAt)} is not an ISO timestamp`,
  );
}

/**
 * The shapes the derivation cannot compare, because the browser measured them: a route is a string, a
 * tallied console sums to the total the drive printed, and a verdict of "not produced" carries the
 * reason it is not.
 * @param {any} recording
 * @returns {string[]}
 */
function shapeProblems(recording) {
  /** @type {string[]} */
  const problems = [];
  /** @param {string} problem */
  const push = (problem) => problems.push(problem);
  if (!/^[0-9a-f]{64}$/.test(String(recording?.digest?.sha256)))
    push(
      `digest.sha256 is the digest file’s own sha256, and ${JSON.stringify(recording?.digest?.sha256)} is not one`,
    );
  if (
    typeof recording?.digest?.entry?.body !== 'string' ||
    recording.digest.entry.body === ''
  )
    push('digest.entry.body is the body the digest states');
  for (const key of ['consoleJoin', 'lintJoin']) {
    const fields = recording?.message?.joins?.[key]?.findingFields;
    if (!Array.isArray(fields) || fields.length === 0)
      push(
        `message.joins.${key}.findingFields names the fields a finding carries`,
      );
  }
  const targets = recording?.producible?.targets ?? {};
  for (const key of ['portal', 'fixture']) {
    const target = targets[key];
    const at = `producible.targets.${key}`;
    if (!isObject(target)) {
      push(`${at} is the drive’s own object`);
      continue;
    }
    const routes = target.routesTried;
    if (!Array.isArray(routes) || routes.length === 0)
      push(`${at}.routesTried names the routes tried, and it names none`);
    else
      routes.forEach((route, index) => {
        if (typeof route !== 'string' || route.trim() === '')
          push(
            `${at}.routesTried[${index}] is the route it tried, as a string`,
          );
      });
    if (
      typeof target.drive?.command !== 'string' ||
      target.drive.command.trim() === ''
    )
      push(`${at}.drive.command names the command that drove the page`);
    const lines = target.console?.lines;
    if (!Array.isArray(lines) || lines.length === 0)
      push(`${at}.console.lines carries the lines the drive captured`);
    else {
      lines.forEach((line, index) => {
        if (typeof line?.text !== 'string')
          push(`${at}.console.lines[${index}].text is a captured line’s text`);
        if (!Number.isInteger(line?.occurrences) || line.occurrences < 1)
          push(`${at}.console.lines[${index}].occurrences counts a capture`);
      });
      const summed = lines.reduce(
        (total, line) => total + Number(line?.occurrences ?? 0),
        0,
      );
      if (summed !== target.console?.total)
        push(
          `${at}.console.total: ${String(target.console?.total)} tallied -> ${String(summed)} summed`,
        );
    }
    if (
      typeof target.console?.ng0205 !== 'number' ||
      target.console.ng0205 !== target.ng0205AsPrinted
    )
      push(
        `${at}.console.ng0205: ${String(target.console?.ng0205)} -> ${String(target.ng0205AsPrinted)} as the drive printed it`,
      );
    if (typeof target.missing !== 'string' || target.missing.trim() === '')
      push(`${at}.missing names the observable that is absent`);
  }
  if (recording?.producible?.verdict !== 'produced') {
    if (
      typeof recording?.producible?.missing !== 'string' ||
      recording.producible.missing.trim() === ''
    )
      push(
        'producible.missing must say what is missing when nothing was produced',
      );
  } else if (recording?.producible?.missing !== null)
    push('producible.missing is null when the code was produced');
  const absences = recording?.absences ?? {};
  const sites = Array.isArray(absences.sites) ? absences.sites : [];
  if (absences.siteCount !== sites.length)
    push(
      `absences.siteCount: ${String(absences.siteCount)} -> ${String(sites.length)} site(s) listed`,
    );
  sites.forEach((site, index) => {
    if (typeof site?.owner !== 'string' || site.owner.trim() === '')
      push(
        `absences.sites[${index}].owner names the function the call sits in`,
      );
  });
  const handle = absences[ABSENCE_HANDLE] ?? {};
  if (handle.occurrences !== 0)
    push(
      `absences.${ABSENCE_HANDLE}.occurrences: ${String(handle.occurrences)} -> 0: the handle record does not exist`,
    );
  for (const key of ['extension', 'scripts', 'researchRaw']) {
    const bucket = handle.scan?.[key];
    if (!isObject(bucket)) {
      push(`absences.${ABSENCE_HANDLE}.scan.${key} counts one glob`);
      continue;
    }
    for (const needle of NEEDLES)
      if (bucket.matches?.[needle] !== 0)
        push(
          `absences.${ABSENCE_HANDLE}.scan.${key}.matches.${needle}: ${String(bucket.matches?.[needle])} -> 0`,
        );
  }
  return problems;
}

/**
 * The D6 check: the record names the two absences and never a handle as the cause. A record that says
 * a leaked subscription, effect, timer or handle wrote after teardown is refused (N1, SC4).
 * @param {any} recording
 * @returns {string[]}
 */
function handleProblems(recording) {
  /** @type {string[]} */
  const problems = [];
  const strings = stringsIn({
    digest: recording?.digest,
    message: recording?.message,
    producible: recording?.producible,
    absences: recording?.absences,
  });
  for (const [at, text] of strings)
    if (/leaked (?:subscription|effect|timer|handle)/i.test(text))
      problems.push(
        `${at} names a leaked handle: ${JSON.stringify(short(text))}`,
      );
  if (!strings.some(([, text]) => text.includes(ABSENCE_OWNER)))
    problems.push(`the record states the absence ${ABSENCE_OWNER}`);
  if (!strings.some(([, text]) => text.includes(ABSENCE_HANDLE)))
    problems.push(`the record states the absence ${ABSENCE_HANDLE}`);
  return problems;
}

/**
 * The whole check of one recording, callable on a doctored copy: its own identity, its citations, and
 * every derived section compared with what this head derives.
 * @param {any} recording
 * @returns {any}
 */
function checkRecording(recording) {
  assert.ok(isObject(recording), 'the record is an object');
  checkIdentity(recording);
  const derived = derive(recording.capturedAt, recording.head);
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
  problems.push(...shapeProblems(recording));
  problems.push(...handleProblems(recording));
  if (problems.length > 0)
    fail(
      `the record disagrees with this head at ${problems.length} value(s) (re-capture with ${ARMED_COMMAND} after naming what moved): ${problems.slice(0, 6).join('; ')}`,
    );
  return derived;
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
  const kept = existing?.capturedAt;
  const capturedAt =
    typeof kept === 'string' && kept !== '' ? kept : new Date().toISOString();
  const candidate = derive(capturedAt, headAtCapture());
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

test('the recording is the canonical serialisation of its own record', () => {
  const text = readFileSync(RECORD_PATH, 'utf8');
  assert.equal(
    text,
    canonical(JSON.parse(text)),
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
  assert.equal(
    recording.commands.find((entry) => entry.command === HEAD_COMMAND)?.output,
    recording.head,
    'the head the record states is the head the recorded `git rev-parse HEAD` printed',
  );
  t.diagnostic(
    `head ${String(recording.head).slice(0, 8)} is a commit this checkout carries, captured at ${String(recording.capturedAt)}`,
  );
});

test('the digest section states the NG0205 entry verbatim, with the digest’s own hash', (t) => {
  const recording = recorded();
  const digest = recording.digest;
  const file = readFileSync(fullPath(DIGEST));
  const parsed = JSON.parse(file.toString('utf8'));
  const entry = (parsed.entries ?? []).find(
    (candidate) => candidate?.code === CODE_SEARCHED,
  );

  assert.equal(
    digest.path,
    DIGEST,
    'the digest is the file the extension ships',
  );
  assert.equal(digest.entry.code, CODE_SEARCHED, 'the entry is NG0205');
  assert.equal(
    digest.entry.title,
    'Injector has already been destroyed',
    'the title is the digest’s own',
  );
  assert.equal(
    digest.entry.title,
    entry.title,
    'the recorded title is the title the file states, re-read on this run',
  );
  assert.equal(
    digest.entry.body,
    entry.body,
    'the recorded body is the body the file states, byte for byte',
  );
  assert.ok(
    digest.entry.body.length > 0,
    'the body the digest states is not empty',
  );
  assert.equal(
    digest.sha256,
    sha256(file),
    'the recorded hash is the digest file’s own sha256 at this head',
  );
  assert.equal(
    digest.bytes,
    file.length,
    'the recorded size is the digest file’s own size',
  );
  assert.equal(
    digest.entries,
    parsed.entries.length,
    'the entry count is the count the file carries',
  );
  assert.equal(
    digest.uniqueCodes,
    new Set((parsed.entries ?? []).map((candidate) => candidate.code)).size,
    'the code count is the number of distinct codes the file carries',
  );
  const printed = digest.printedByTheInstalledBuild;
  assert.equal(
    printed.printedPrefix,
    CODE_SEARCHED,
    'the installed build prints the throw’s own number as NG0205',
  );
  assert.equal(
    printed.printedAs,
    `${printed.printedPrefix}: ${printed.bodyLiteral}`,
    'the printed message is the code, a colon and the body the build states',
  );
  assert.equal(
    printed.emittedOnALookup,
    true,
    'the throw sits in a lookup the injector performs, which is what a post-teardown touch must reach',
  );
  assert.equal(
    digest.titleWithoutAFullStop,
    true,
    'the digest’s title carries no full stop while the build’s body does',
  );
  t.diagnostic(
    `digest ${digest.version}: ${digest.entries} entries, ${digest.uniqueCodes} codes, sha256 ${digest.sha256}, ${digest.bytes} bytes`,
  );
  t.diagnostic(
    `NG0205 — title “${digest.entry.title}”; the build prints “${printed.printedAs}”`,
  );
});

test('the message section names the fields a joined message carries, and where the stack goes', (t) => {
  const recording = recorded();
  const message = recording.message;

  assert.equal(
    message.capture.messages,
    jsonOf(CAPTURE_RECORD).messages.length,
    'the capture the shape is read from is the one recorded, message for message',
  );
  assert.deepEqual(
    message.capture.fieldKeys,
    fieldNamesOfTheCapture().messageFields,
    'the fields a captured message carries are the fields the capture writes',
  );
  assert.ok(
    message.capture.withAStackFrame >= 1,
    'at least one captured message carries a stack frame, so the stack question has an answer',
  );
  assert.deepEqual(
    message.joins.consoleJoin.findingFields,
    ['text', 'code', 'title', 'reason', 'carriedCode'],
    'the console join’s finding carries five fields, one required and four optional',
  );
  assert.deepEqual(
    message.joins.consoleJoin.alwaysPresent,
    ['text'],
    'only `text` is on every console-join finding',
  );
  assert.equal(
    message.joins.consoleJoin.stackSurvives,
    true,
    'the console join keeps the stack, inside `text` and nowhere else',
  );
  assert.deepEqual(
    message.joins.consoleJoin.readsOnly,
    ['code', 'message'],
    'the console join reads the code and the message out of a payload that carries more',
  );
  assert.deepEqual(
    message.joins.lintJoin.findingFields,
    ['state', 'construct', 'code', 'message'],
    'the lint join’s finding carries four fields',
  );
  assert.equal(
    message.joins.lintJoin.stackSurvives,
    false,
    'the lint join drops the stack at the first frame',
  );
  assert.deepEqual(
    message.joins.lintJoin.absenceNames,
    [
      'no-captured-messages',
      'no-coded-diagnostic',
      'code-not-in-digest',
      'message-names-no-construct',
    ],
    'the lint join’s four absences are the four names its own file enumerates',
  );
  assert.deepEqual(
    message.sourceIdentity.carriedByTheCaptureAndReadByNeither,
    ['component', 'location', 'order', 'timestamp', 'type'],
    'the capture’s location, component, order, type and timestamp are read by no join',
  );
  assert.deepEqual(
    message.sourceIdentity.readByTheConsoleJoin,
    ['code', 'message'],
    'the console join reads two of the capture’s fields and no third',
  );
  assert.match(
    message.sourceIdentity.finding,
    /location/,
    'the section states that the field naming where a message came from is read by no join',
  );
  t.diagnostic(
    `console join: ${message.joins.consoleJoin.findingFields.join('/')}, stack survives in text; lint join: ${message.joins.lintJoin.findingFields.join('/')}, stack dropped by ${message.joins.lintJoin.stackDroppedBy}`,
  );
  t.diagnostic(
    `the capture carries ${message.capture.fieldKeys.join('/')} and its location carries ${message.capture.locationKeys.join('/')}; ${message.capture.withAStackFrame} of ${message.capture.messages} messages carry a frame`,
  );
});

test('the producible verdict states what was driven and, producing nothing, the observable it lacks', (t) => {
  const recording = recorded();
  const producible = recording.producible;
  const researchRaw = ng0205InResearchRaw();

  assert.equal(
    producible.codeSearched,
    CODE_SEARCHED,
    'the code searched for is the code the milestone is about',
  );
  assert.deepEqual(
    producible.researchRaw,
    researchRaw,
    'the occurrences under research/raw/ are the occurrences this head counts',
  );
  assert.equal(
    researchRaw.onAPage,
    0,
    'no record under research/raw/ carries the code as a console line',
  );
  assert.equal(
    producible.verdict,
    producible.produced === 0 ? 'not-produced' : 'produced',
    'the verdict is read off the count it states',
  );
  for (const [key, target] of Object.entries(producible.targets)) {
    assert.ok(
      target.routesTried.length > 0 &&
        target.routesTried.every(
          (route) => typeof route === 'string' && route.startsWith('/'),
        ),
      `${key}: every route the target claims is a path it actually visited, and ${JSON.stringify(target.routesTried)} is not`,
    );
    assert.equal(
      target.console.ng0205,
      target.ng0205AsPrinted,
      `${key}: the console’s own NG0205 count is the count the drive printed`,
    );
    assert.equal(
      target.console.total,
      target.console.lines.reduce((sum, line) => sum + line.occurrences, 0),
      `${key}: the tally sums to the total the drive printed`,
    );
    assert.ok(
      !target.console.codesSeen.includes(CODE_SEARCHED),
      `${key}: the codes the console carried do not include the one this milestone is about`,
    );
    assert.ok(
      target.missing.trim() !== '',
      `${key}: the target names the observable that is missing`,
    );
    assert.ok(
      target.drive.listeners.includes('no listener'),
      `${key}: the drive states that nothing was installed in the page (D7)`,
    );
  }
  assert.deepEqual(
    producible.targets.portal.routesTried,
    ['/contract/list', '/home', '/claim/list', '/customer/list'],
    'the portal routes tried are the four the drive visited',
  );
  assert.deepEqual(
    producible.targets.fixture.routesTried,
    ['/stale-view', '/'],
    'the fixture routes tried are the leaking route and the page it was destroyed by',
  );
  assert.equal(
    producible.targets.fixture.consoleLinesAfterDestroy,
    0,
    'not one console line arrived after the fixture’s write to the destroyed component',
  );
  assert.equal(
    producible.missing.trim() !== '',
    producible.produced === 0,
    'a verdict of "not produced" carries the reason it is not, and a produced one carries none',
  );
  t.diagnostic(
    `producible: ${producible.verdict} — ${producible.targets.portal.routesTried.length} portal routes/${producible.targets.portal.console.total} lines, ${producible.targets.fixture.routesTried.length} fixture routes/${producible.targets.fixture.console.total} lines, ${producible.produced} ${producible.codeSearched}`,
  );
  t.diagnostic(
    `research/raw: ${researchRaw.occurrences} occurrences in ${researchRaw.recordsCarryingTheCode.length} record(s), ${researchRaw.inTheDigestEnumeration} of them the digest enumeration, ${researchRaw.onAPage} on a page`,
  );
});

test('the absences section states the handle record as an absence with its counts', (t) => {
  const recording = recorded();
  const absences = recording.absences;
  const handle = absences[ABSENCE_HANDLE];

  assert.equal(handle.state, ABSENCE_HANDLE, 'the absence names itself');
  assert.equal(
    absences[ABSENCE_OWNER].state,
    ABSENCE_OWNER,
    'and so does the other',
  );
  assert.deepEqual(
    absences[ABSENCE_OWNER].ownerFieldsTheJoinsRead,
    [],
    'no field that could carry an owner is read by either join',
  );
  assert.deepEqual(
    absences[ABSENCE_OWNER].ownerFieldsInTheCapture,
    ['component'],
    'the capture writes one field that could carry an owner',
  );
  assert.deepEqual(
    handle.needles,
    [...NEEDLES],
    'the three needles are the three counted',
  );
  assert.equal(
    handle.occurrences,
    0,
    'and every one of them occurs zero times',
  );
  for (const [key, bucket] of Object.entries(handle.scan)) {
    assert.ok(
      bucket.filesSearched > 0,
      `${key}: the glob matched files to search`,
    );
    for (const needle of NEEDLES)
      assert.equal(
        bucket.matches[needle],
        0,
        `${key}: ${needle} occurs ${bucket.matches[needle]} times, and the handle record does not exist`,
      );
  }
  assert.equal(
    absences.siteCount,
    absences.sites.length,
    'the site count is the number of sites listed',
  );
  assert.equal(
    absences.agentSites,
    2,
    'the agent owns two of the teardown sites',
  );
  assert.deepEqual(
    absences.sites
      .filter((site) => site.path.startsWith('extension/'))
      .map((site) => `${site.path}:${site.line}`),
    ['extension/agent-main.js:1858', 'extension/agent-main.js:2435'],
    'the two the agent owns are the router-event and stability subscriptions',
  );
  assert.deepEqual(
    absences.sites.map((site) => site.owner),
    ['uninstallRouterEvents', 'uninstallStability', 'CURRENCY'],
    'each site is named with the function or loader it sits in',
  );
  assert.match(
    absences.note,
    /three/,
    'the note states that this head carries three sites where the brief expected two',
  );
  t.diagnostic(
    `handle record: ${handle.scan.extension.matches.handleRecord} handleRecord and ${handle.scan.scripts.matches.postDestroy} postDestroy occurrences over ${handle.scan.extension.filesSearched} extension modules, ${handle.scan.scripts.filesSearched} suites and ${handle.scan.researchRaw.filesSearched} records`,
  );
  t.diagnostic(
    `teardown sites (${absences.siteCount}, ${absences.agentSites} the agent’s own): ${absences.sites
      .map((site) => `${site.owner} at ${site.path}:${site.line}`)
      .join('; ')}`,
  );
});

/**
 * Every citation the record makes, re-resolved, plus the promise that it makes every citation this
 * suite knows and names each once.
 * @param {any} recording
 * @returns {{ resolved: number, unresolved: string[] }}
 */
function checkCitations(recording) {
  assert.ok(
    Array.isArray(recording?.citations) && recording.citations.length > 0,
    'the record makes citations',
  );
  const ids = recording.citations.map((citation) => citation.id);
  assert.equal(
    new Set(ids).size,
    ids.length,
    'each citation is named once, so a section reference names one line',
  );
  /** @type {string[]} */
  const unresolved = [];
  for (const citation of recording.citations)
    if (!resolveCitation(citation, `citations[${String(citation.id)}]`))
      unresolved.push(String(citation.id));
  const missing = CITATION_SPEC.filter((spec) => !ids.includes(spec.id)).map(
    (spec) => spec.id,
  );
  assert.deepEqual(
    missing,
    [],
    `the record must make every citation this suite knows, and it makes none for ${missing.join(', ')}`,
  );
  return {
    resolved: recording.citations.length - unresolved.length,
    unresolved,
  };
}

/**
 * Every citation id any section names, so a reference cannot dangle and a line measured for nothing is
 * not carried as if it were a field.
 * @param {any} recording
 * @returns {string[]}
 */
function referencedCitations(recording) {
  /** @type {string[]} */
  const ids = [];
  const walk = (value) => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (!isObject(value)) return;
    for (const [key, inner] of Object.entries(value)) {
      if (key === 'citationId' && typeof inner === 'string') ids.push(inner);
      else if (key === 'citationIds' && Array.isArray(inner)) {
        for (const id of inner) if (typeof id === 'string') ids.push(id);
      } else walk(inner);
    }
  };
  for (const section of ['digest', 'message', 'producible', 'absences'])
    walk(recording?.[section]);
  return ids;
}

test('every citation is the line its own number names, found by searching the file it quotes', (t) => {
  const recording = recorded();
  const { resolved, unresolved } = checkCitations(recording);
  for (const id of unresolved)
    t.diagnostic(
      `citation ${id}: not re-resolved — the file is not in this checkout`,
    );
  for (const path of new Set(
    recording.citations
      .filter((citation) => citation.resolved)
      .map((citation) => citation.path),
  ))
    t.diagnostic(
      `${path}: ${recording.citations.filter((citation) => citation.path === path && citation.resolved).length} citation(s) re-resolved`,
    );
  assert.ok(
    resolved >= 25,
    `the record cites ${resolved} line(s) this checkout could re-read, which is fewer than the measurement needs`,
  );
});

test('every citation a section names is one the record makes, and no line is cited for nothing', () => {
  const recording = recorded();
  const made = new Set(recording.citations.map((citation) => citation.id));
  const referenced = referencedCitations(recording);
  for (const id of referenced)
    assert.ok(
      made.has(id),
      `a section names the citation ${JSON.stringify(id)}, which this record does not make`,
    );
  assert.deepEqual(
    [...new Set(referenced)].sort(),
    [...made].sort(),
    'every citation the record makes is named by a section, so a line measured for nothing is not carried as if it were a field',
  );
});

test('the record names no subscription, effect or timer as the owner (D6)', () => {
  const recording = recorded();
  const problems = handleProblems(recording);
  assert.deepEqual(problems, [], problems.join('; '));
  const strings = stringsIn(recording.absences);
  for (const [at, text] of strings)
    if (/(?:the|a) (?:subscription|effect|timer) that outlived/i.test(text))
      fail(
        `${at} names a handle the record does not hold: ${JSON.stringify(short(text))}`,
      );
});

test('the recording is what this head derives, field by field', (t) => {
  const recording = recorded();
  const derived = checkRecording(recording);
  t.diagnostic(recording.verdict);
  t.diagnostic(
    `${DERIVED_SECTIONS.length} section(s) re-derived, ${recording.citations.length} citation(s), ${derived.producible.produced} ${CODE_SEARCHED} produced`,
  );
});

test('a mutated copy of the record reddens naming its defect, and the untouched record passes first', (t) => {
  const recording = recorded();
  // The pinned, untouched record goes through exactly the check a mutant is put through.
  checkRecording(recording);

  const directory = mkdtempSync(join(tmpdir(), 'm059-shapes-'));
  /** @type {Array<{ id: string, defect: string, patch: (copy: any) => void }>} */
  const mutants = [
    {
      id: 'a-digest-code-the-file-does-not-carry',
      defect: 'digest.entry.code',
      patch: (copy) => {
        copy.digest.entry.code = 'NG9999';
      },
    },
    {
      id: 'a-title-with-a-full-stop',
      defect: 'digest.entry.title',
      patch: (copy) => {
        copy.digest.entry.title = `${String(copy.digest.entry.title)}.`;
      },
    },
    {
      id: 'a-message-field-the-join-does-not-declare',
      defect: 'message.joins.consoleJoin.findingFields',
      patch: (copy) => {
        copy.message.joins.consoleJoin.findingFields.push('owner');
      },
    },
    {
      id: 'a-stack-that-survives-the-lint-join',
      defect: 'message.joins.lintJoin.stackSurvives',
      patch: (copy) => {
        copy.message.joins.lintJoin.stackSurvives = true;
      },
    },
    {
      id: 'a-route-that-is-not-a-string',
      defect: 'producible.targets.portal.routesTried[0]',
      patch: (copy) => {
        copy.producible.targets.portal.routesTried[0] = 42;
      },
    },
    {
      id: 'a-verdict-with-nothing-missing',
      defect: 'producible.missing',
      patch: (copy) => {
        copy.producible.missing = '';
      },
    },
    {
      id: 'a-handle-record-that-exists',
      defect: 'absences.handle-record-not-held.occurrences',
      patch: (copy) => {
        copy.absences[ABSENCE_HANDLE].occurrences = 1;
      },
    },
    {
      id: 'a-handle-named-as-the-cause',
      defect: 'names a leaked handle',
      patch: (copy) => {
        copy.producible.missing =
          'the leaked subscription wrote after teardown';
      },
    },
  ];

  for (const mutant of mutants) {
    const copy = structuredClone(recording);
    mutant.patch(copy);
    const path = join(directory, `${mutant.id}.json`);
    writeFileSync(path, canonical(copy));
    const reread = JSON.parse(readFileSync(path, 'utf8'));
    /** @type {Error | null} */
    let failure = null;
    try {
      checkRecording(reread);
    } catch (error) {
      failure = /** @type {Error} */ (error);
    }
    assert.ok(
      failure !== null,
      `the mutant ${mutant.id} must redden the check, and it reddened nothing`,
    );
    assert.ok(
      failure.message.includes(mutant.defect),
      `the mutant ${mutant.id} must redden naming its defect ${JSON.stringify(mutant.defect)}, and it said: ${failure.message.split('\n')[0]}`,
    );
    t.diagnostic(`mutant ${mutant.id} -> ${failure.message.split('\n')[0]}`);
  }
});

test('nothing was built', () => {
  const recording = recorded();
  assert.deepEqual(
    recording.builtNothing.built,
    [],
    'no join, no surface, no route and no fixture',
  );
  assert.match(
    recording.builtNothing.description,
    /No join, no surface, no route and no fixture/,
    'the record states what it did not build',
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
    [...CRITERIA],
    'the capture block names the criteria this task answers',
  );
  assert.equal(
    recording.capture.records,
    RECORD_REL,
    'the capture block names the file it writes',
  );
});

// Held-out E9, last in the file on purpose: every other test has read the recording by now, so a byte
// any of them had written would show up here, and the three answers are re-derived beside the hash.
test(E9_TITLE, (t) => {
  const recording = recorded();
  const before = readFileSync(RECORD_PATH);
  t.diagnostic(
    `${RECORD_REL} at load: ${before.length} bytes, sha256 ${String(baseline)}`,
  );
  const after = readFileSync(RECORD_PATH);
  t.diagnostic(`after the run: ${after.length} bytes, sha256 ${sha256(after)}`);
  assert.equal(
    sha256(after),
    baseline,
    `${RECORD_REL} changed during this run, so a read is not a read`,
  );

  const derived = derive(recording.capturedAt, recording.head);
  t.diagnostic(
    `E9 idempotence: sha256 ${sha256(after)} unchanged after the run`,
  );
  assert.equal(
    recording.digest.entry.code,
    derived.digest.entry.code,
    'a second answer over the same record names the same code',
  );
  assert.deepEqual(
    recording.digest.entry.body,
    derived.digest.entry.body,
    'and the same message',
  );
  assert.deepEqual(
    recording.absences[ABSENCE_HANDLE].scan,
    derived.absences[ABSENCE_HANDLE].scan,
    'and the same absences',
  );
  assert.deepEqual(
    recording.message.joins,
    derived.message.joins,
    'and the same joined fields',
  );
  if (CAPTURE)
    t.diagnostic(
      'armed run: E9 holds on the bytes this run wrote — the capture is the only writer, and it wrote only what moved',
    );
  else
    assert.equal(
      CAPTURE,
      false,
      'a default run is a read: the switch is off, so the capture path is never entered and nothing can be written',
    );
});
