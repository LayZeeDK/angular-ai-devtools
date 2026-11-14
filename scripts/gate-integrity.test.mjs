// @ts-check
//
// M044 T001 - the three gate shapes, measured at this head and published as one record
// (INTENT.md SC1, SC2, SC4; T001's AC1, AC2, AC3, AC4).
//
// Three measurements, each re-derived on every run rather than remembered:
//
//   archive    Every `.project/` reference in every authored suite under `scripts/`, `extension/` and
//              `apps/` is enumerated by `git ls-files --cached --others --exclude-standard`, so a file
//              this head carries cannot hide by not being staged yet, and each reference is
//              classified by the one question the archive-path rule needs answered: does the
//              milestone's own archive move delete the path this reference names? The set of
//              subtrees the move relocates is derived from `.project/archive/<NNN>-<slug>/` - the
//              directories every archived milestone carries - so a milestone that archives nothing
//              added to that set is not a case this file guesses. A resolved path under a relocated
//              subtree is `archived-by-the-move`; a path under `.project/archive` is
//              `deliberate-archive-read`; anything else, and every reference that resolves no path at
//              all (a comment, a regular expression, a path named inside a longer message), is
//              `undecided` WITH its reason recorded - named, never guessed. A path built segment by
//              segment is this repository's only when the root it is built on is the module root that
//              file binds, which is what keeps a suite writing its own `.project` fixture from being
//              recorded as a defect.
//
//   fixRecord  M035's T006 claims in its own `## Log` that `nx.json` no longer caches
//              `@angular/build:unit-test`. That claim is held against M035's own range - derived from
//              the two ship commits git records for M034 and M035 - and the range's `--name-status`
//              carries no `nx.json` at all. The tree fact is kept in a separate field, read at
//              `d94502d1` (the head the intent measured at) and again from the working tree, because a
//              check must report the range fact without asserting the tree fact. A rename is recorded
//              as the pair it produces: the M035 range carries none (measured, and that is the
//              finding), so the pair is measured from the commit-shaped range at `d94502d1`, where the
//              archive move appears as `R100` and a claim naming the new name is true while a naive
//              set-membership test reports it absent.
//
//   skipped    `research/raw/m041-navigation.json` is read and every `NavigationSkipped` entry is
//              recorded with its id, its url and whether that id carries a start entry - in the whole
//              recording and in the entry's own frame, which are two different facts because each
//              frame is one probe run. The event-type number is read from the installed
//              `@angular/router` chunk, not written here, and the entries found by number must equal
//              the entries found by class name.
//
// What a default run does: it re-derives all three measurements and asserts the committed recording is
// exactly what this head derives, then asserts the record's bytes hash the same before and after, so
// the run is a read. It spawns nothing but `git` reads (`ls-files`, `log`, `rev-parse`, `diff`, `show` and `cat-file -e`),
// opens no browser, binds no port and writes no file. The one deviation from the
// capture-suite shape it follows (`scripts/navigation-capture.test.mjs`,
// `scripts/stability-capture.test.mjs`) is stated rather than hidden: those suites re-derive
// in-process and so spawn nothing, while two of these measurements are *commands* - `git ls-files` and
// `git diff --name-status` - and a measurement that replaced its own command with a filesystem walk
// would be measuring something else.
//
// `M044_CAPTURE=1` arms the one write: re-derive, compare, and write only when a value moved, so two
// armed runs with nothing moved leave the recording byte-identical.
//
// Armed, on Windows cmd.exe (a bare `set M044_CAPTURE=1 &&` puts the space inside the variable):
//
//   set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/gate-integrity.test.mjs"
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const SELF_PATH = fileURLToPath(import.meta.url);
const HERE = dirname(SELF_PATH);
const ROOT = join(HERE, '..');

const RECORD_REL = 'research/raw/m044-gate-shapes.json';
const RECORD_PATH = join(ROOT, RECORD_REL);
const NAVIGATION_REL = 'research/raw/m041-navigation.json';
const NAVIGATION_PATH = join(ROOT, NAVIGATION_REL);
const CHUNK_REL = 'node_modules/@angular/router/fesm2022/_router-chunk.mjs';
const CHUNK_PATH = join(ROOT, CHUNK_REL);
const ARCHIVE_DIR = join('.project', 'archive');

const SCRIPT = 'scripts/gate-integrity.test.mjs';
const CHECK_COMMAND = `node --experimental-strip-types --test "${SCRIPT}"`;
const ARMED_CAPTURE_COMMAND = `set "M044_CAPTURE=1"&& node --experimental-strip-types --test "${SCRIPT}"`;

/** The head the intent measured its tree fact at. An input the brief names, not a derived value. */
const MEASURED_HEAD = 'd94502d1';

/** The milestone whose task log is held against its own range (T001's AC2). */
const CLAIM_MILESTONE = '035';

/** The one path M035's claim names, and the target default the tree fact is read from. */
const CLAIMED_PATH = 'nx.json';
const CACHE_SETTING = '@angular/build:unit-test';

/** The three classes a reference may carry. `undecided` is a recorded answer, never a pass. */
const CLASSES = [
  'archived-by-the-move',
  'deliberate-archive-read',
  'undecided',
];

/** The one volatile field of the capture block: the time the file was written. */
const VOLATILE_CAPTURE_FIELD = 'at';

/** Every file this suite would write, named so a default run can prove that none of them moved. */
const WOULD_WRITE = [
  { path: RECORD_PATH, why: 'the recording T001 made, re-derived in place' },
];

/** The success criteria this task answers, read from the intent rather than retyped. */
const CRITERIA = ['SC1', 'SC2', 'SC4'];

/** The record's own provenance, which no reading of the tree can settle. */
const TITLE = 'Measure the three gate shapes and publish one record';
const QUESTION =
  'does the archive move delete a path a committed suite resolves, does the milestone range carry what a task log claims, and does the recorded stream carry a terminal for a navigation id that has already ended?';
const VERDICT =
  'all three measurements examined a non-zero number of inputs at this head: the archive-reference rule has one reference decided each way in the tree it must police, the fix-record rule has a claim its own range does not carry beside a rename the same command shape records as two names, and the recorded stream carries a skipped navigation the narrator drops today';

const ARMED = String(process.env.M044_CAPTURE ?? '').trim() === '1';

const SHA_AT_LOAD = existsSync(RECORD_PATH)
  ? sha256(readFileSync(RECORD_PATH))
  : null;

/**
 * The bytes the read-only pin holds the file to. An armed run moves the recording on purpose, so it
 * re-bases this after its own write; a default run leaves it exactly where the file was at load.
 */
let baseline = SHA_AT_LOAD;

// ---------------------------------------------------------------- helpers ----

/** @param {string} message @returns {never} */
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

/** @param {Buffer | string} bytes @returns {string} */
function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** @template T @param {T} value @returns {T} */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
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

/** @param {string} text @returns {string} */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** @param {string} path @param {string} why @returns {string} */
function readText(path, why) {
  if (!existsSync(path)) fail(`${displayPath(path)} is missing - ${why}`);
  return readFileSync(path, 'utf8');
}

/** @param {string} path @param {string} why @returns {any} */
function readJson(path, why) {
  const text = stripBom(readText(path, why));
  try {
    return JSON.parse(text);
  } catch (error) {
    return fail(
      `${displayPath(path)} is not JSON (${error instanceof Error ? error.message : error})`,
    );
  }
}

/** @param {string} text @param {number} index @returns {number} */
function lineOfIndex(text, index) {
  return text.slice(0, index).split('\n').length;
}

/** @param {string} text @returns {string} */
function escapeForRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * One read-only git invocation, from one place, so the record's own command strings are the
 * commands this suite ran rather than a sentence beside them.
 *
 * @param {string[]} args
 * @returns {string}
 */
function git(args) {
  const result = spawnSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  if (result.error) {
    fail(`git ${args.join(' ')} could not run: ${result.error.message}`);
  }
  if (result.status !== 0) {
    fail(
      `git ${args.join(' ')} exited ${String(result.status)}: ${String(result.stderr).trim()}`,
    );
  }
  return String(result.stdout);
}

/**
 * Every `[key, value]` pair of a parsed record, with the path it sits at.
 *
 * @param {unknown} value
 * @param {string} path
 * @param {(value: unknown, key: string, path: string) => void} visit
 * @returns {void}
 */
function walk(value, path, visit) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, `${path}[${index}]`, visit));
    return;
  }
  if (!isObject(value)) return;
  for (const [key, entry] of Object.entries(value)) {
    const next = path === '' ? key : `${path}.${key}`;
    visit(entry, key, next);
    walk(entry, next, visit);
  }
}

/**
 * A dotted-path inventory of one object's sections: what an armed run re-measures. Derived from
 * the derivation itself, so the list in the record cannot go stale behind the code.
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

// --------------------------------------------------- measurement 1: the lexer ----

/** The keywords a `/` may follow and still open a regular expression, not a division. */
const REGEX_KEYWORDS = new Set([
  'return',
  'typeof',
  'instanceof',
  'in',
  'of',
  'new',
  'delete',
  'void',
  'case',
  'do',
  'else',
  'yield',
]);

/** The punctuation a `/` may follow and still open a regular expression. */
const REGEX_PRECEDERS = new Set([
  '',
  '(',
  ',',
  ';',
  ':',
  '[',
  '=',
  '!',
  '&',
  '|',
  '?',
  '{',
  '}',
  '+',
  '-',
  '*',
  '%',
  '<',
  '>',
  '~',
  '^',
]);

/**
 * The state of every character of one suite's source, plus every string and regular-expression
 * literal it carries. A `.project` inside a string is a path a suite expresses; inside a comment or
 * a regular expression it is prose; the two are told apart here rather than guessed from the line.
 * Quotes inside regexes and `//` inside regexes are what make a naive scan mis-read the rest of a
 * file, so both are tracked.
 *
 * @param {string} text
 * @returns {{ modes: string[], literals: Array<{ start: number, end: number, quote: string }> }}
 */
function lexSource(text) {
  /** @type {string[]} */
  const modes = new Array(text.length).fill('code');
  /** @type {Array<{ start: number, end: number, quote: string }>} */
  const literals = [];
  let mode = 'code';
  let start = -1;
  let inClass = false;
  let previous = '';
  let word = '';

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (mode === 'code') {
      modes[index] = 'code';
      if (character === '/' && next === '/') {
        modes[index + 1] = 'line';
        mode = 'line';
        index += 1;
        continue;
      }
      if (character === '/' && next === '*') {
        modes[index + 1] = 'block';
        mode = 'block';
        index += 1;
        continue;
      }
      if (character === "'" || character === '"' || character === '`') {
        mode =
          character === "'"
            ? 'single'
            : character === '"'
              ? 'double'
              : 'template';
        start = index + 1;
        word = '';
        previous = character;
        continue;
      }
      if (
        character === '/' &&
        (REGEX_KEYWORDS.has(word) || REGEX_PRECEDERS.has(previous))
      ) {
        mode = 'regex';
        start = index + 1;
        inClass = false;
        word = '';
        previous = '/';
        continue;
      }
      if (/\s/.test(character)) continue;
      if (/[\w$]/.test(character)) {
        word += character;
        previous = character;
        continue;
      }
      word = '';
      previous = character;
      continue;
    }

    modes[index] = mode;

    if (mode === 'line') {
      if (character === '\n') mode = 'code';
      continue;
    }
    if (mode === 'block') {
      if (character === '*' && next === '/') {
        modes[index + 1] = 'block';
        index += 1;
        mode = 'code';
      }
      continue;
    }
    if (mode === 'regex') {
      if (character === '\\') {
        modes[index + 1] = 'regex';
        index += 1;
        continue;
      }
      if (character === '[') inClass = true;
      else if (character === ']') inClass = false;
      else if (character === '/' && !inClass) {
        literals.push({ start, end: index, quote: '/' });
        mode = 'code';
      }
      continue;
    }
    if (character === '\\') {
      modes[index + 1] = mode;
      index += 1;
      continue;
    }
    const close = mode === 'single' ? "'" : mode === 'double' ? '"' : '`';
    if (character === close) {
      literals.push({ start, end: index, quote: close });
      mode = 'code';
    }
  }

  return { modes, literals };
}

/**
 * The innermost `(` or `[` still open where a `.project` segment sits, so a `join(` spread over
 * four lines is cited by the line that opens it. Answers -1 when nothing is open, and the caller
 * then cites the segment's own line and records no root.
 *
 * @param {string} text
 * @param {string[]} modes
 * @param {number} from
 * @returns {number}
 */
function opening(text, modes, from) {
  let depth = 0;
  for (let index = from - 1; index >= 0; index -= 1) {
    if (modes[index] !== 'code') continue;
    const character = text[index];
    if (character === ')' || character === ']') {
      depth += 1;
      continue;
    }
    if (character === '(' || character === '[') {
      if (depth === 0) return index;
      depth -= 1;
    }
  }
  return -1;
}

/**
 * The identifiers one file binds to its own module's root: the directory the module's own URL
 * resolves into, and the directory one level above it. Derived from the file's own text, because
 * `ROOT` in one suite is `repoRoot` in another and a list of names written here would go stale.
 *
 * @param {string} text
 * @returns {Set<string>}
 */
function moduleRoots(text) {
  const roots = new Set();
  for (const match of text.matchAll(
    /const\s+([A-Za-z_$][\w$]*)\s*=\s*[^;\n]*import\.meta\.url/g,
  )) {
    roots.add(match[1] ?? '');
  }
  let grew = true;
  while (grew) {
    grew = false;
    for (const match of text.matchAll(
      /const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:join|resolve)\(\s*([A-Za-z_$][\w$]*)\s*,\s*'\.\.'\s*[,)]/g,
    )) {
      const [name, parent] = [match[1] ?? '', match[2] ?? ''];
      if (roots.has(parent) && !roots.has(name)) {
        roots.add(name);
        grew = true;
      }
    }
  }
  roots.delete('');
  return roots;
}

/**
 * The root one segment run resolves against, and how the run was spelled. A `join(ROOT, '.project',
 * ...)` names the module root and a path in this repository; a `join(scratch, '.project', ...)` or a
 * `join('.project', ...)` names a directory the suite itself creates, which the archive move never
 * touches. Telling the two apart is the difference between a finding and a false positive, so the
 * root is read from the text rather than assumed.
 *
 * @param {string} text
 * @param {string[]} modes
 * @param {Map<number, { start: number, end: number, quote: string }>} byQuote
 * @param {number} open
 * @returns {{ root: string | null, construct: string }}
 */
function segmentRoot(text, modes, byQuote, open) {
  if (open < 0) return { root: null, construct: 'none' };
  if (text[open] === '[') {
    // An array literal: it names no root itself, so the root is the one a `...NAME` spread is
    // joined with somewhere in the same file.
    const before = text.slice(Math.max(0, open - 120), open);
    const name = /const\s+([A-Za-z_$][\w$]*)\s*=\s*$/.exec(before)?.[1];
    if (name === undefined) return { root: null, construct: 'array' };
    const spread = new RegExp(
      `(?:join|resolve)\\(\\s*([A-Za-z_$][\\w$]*)\\s*,\\s*\\.\\.\\.${name}\\b`,
    ).exec(text);
    return { root: spread?.[1] ?? null, construct: 'array' };
  }
  // A call: its first argument, when that argument is a bare identifier, is the root.
  let depth = 0;
  let end = open + 1;
  for (; end < text.length; end += 1) {
    if (modes[end] !== 'code') continue;
    const character = text[end];
    if (character === '(' || character === '[' || character === '{') depth += 1;
    else if (character === ')' || character === ']' || character === '}') {
      if (depth === 0) break;
      depth -= 1;
    } else if (character === ',' && depth === 0) break;
  }
  const argument = text.slice(open + 1, end).trim();
  return {
    root: /^[A-Za-z_$][\w$]*$/.test(argument) ? argument : null,
    construct: 'call',
  };
}

/**
 * The string literals that continue a `.project` segment: `join(ROOT, '.project', 'intent',
 * 'INTENT.md')` and `['.project', 'research', 'x.md']` both build one path from one segment, and a
 * reader that only saw the segment would resolve `.project` and miss the path. The run stops at the
 * first thing that is not a literal or a separator, so a variable in the middle ends it rather than
 * being guessed at.
 *
 * @param {string} text
 * @param {Map<number, { start: number, end: number, quote: string }>} byQuote
 * @param {number} from
 * @returns {string[]}
 */
function continuation(text, byQuote, from) {
  /** @type {string[]} */
  const segments = [];
  let index = from;
  while (index < text.length) {
    const character = text[index];
    if (/\s/.test(character) || character === ',') {
      index += 1;
      continue;
    }
    if (character === '/' && text[index + 1] === '/') {
      const end = text.indexOf('\n', index);
      index = end === -1 ? text.length : end + 1;
      continue;
    }
    const literal = byQuote.get(index);
    if (literal === undefined) break;
    segments.push(text.slice(literal.start, literal.end));
    index = literal.end + 1;
  }
  return segments;
}

/** The token every `.project` reference carries, escaped form included. */
const PROJECT_TOKEN = /\\?\.project\b/g;

/**
 * Every `.project` reference in one suite's source, with the line it is named on, the path it
 * resolves to where one resolves, and how it is named (`path`, `citation`, `segment`, `message`,
 * `comment`, `pattern`, `bare`).
 *
 * @param {string} file
 * @param {string} text
 * @returns {Array<{ file: string, line: number, path: string | null, site: string }>}
 */
function referencesIn(file, text) {
  const { modes, literals } = lexSource(text);
  const byQuote = new Map(literals.map((entry) => [entry.start - 1, entry]));
  /** @type {Array<{ file: string, line: number, path: string | null, site: string }>} */
  const found = [];
  PROJECT_TOKEN.lastIndex = 0;
  let match;
  while ((match = PROJECT_TOKEN.exec(text)) !== null) {
    const at = match.index;
    const line = lineOfIndex(text, at);
    if (text[at] === '\\') {
      found.push({ file, line, path: null, site: 'pattern' });
      continue;
    }
    const literal = literals.find(
      (entry) => entry.start <= at && at < entry.end,
    );
    if (literal === undefined) {
      const mode = modes[at] ?? 'code';
      found.push({
        file,
        line,
        path: null,
        site: mode === 'code' ? 'bare' : 'comment',
      });
      continue;
    }
    const raw = text.slice(literal.start, literal.end);
    const tail = raw.slice(at - literal.start);
    const leading = /^\.project(?:\/[A-Za-z0-9_.@+-]+)*/.exec(tail)?.[0] ?? '';
    if (leading === '') {
      found.push({ file, line, path: null, site: 'bare' });
      continue;
    }
    const remainder = tail.slice(leading.length).replace(/^\/+$/, '');
    if (remainder === '' && leading === '.project') {
      const segments = continuation(text, byQuote, literal.end + 1);
      const open = opening(text, modes, literal.start);
      const resolved = segmentRoot(text, modes, byQuote, open);
      found.push({
        file,
        line: open < 0 ? line : lineOfIndex(text, open),
        path: ['.project', ...segments].join('/'),
        site: 'segment',
        root: resolved.root,
        construct: resolved.construct,
      });
      continue;
    }
    const site =
      remainder === ''
        ? 'path'
        : /^:\d+(?:-\d+)?$/.test(remainder)
          ? 'citation'
          : 'message';
    found.push({
      file,
      line,
      path: leading.replace(/\/+$/, '') || '.project',
      site,
    });
  }
  return found;
}

/**
 * The subtrees the archive move relocates, derived from the repository's own archives: every
 * directory name any `.project/archive/<NNN>-<slug>/` carries. `MANIFEST.md` is not in the set
 * because it is a file the move writes there rather than a live subtree it moves, which is why the
 * derivation asks for directories and not for entries.
 *
 * @returns {{ archives: string[], subtrees: string[] }}
 */
function movedSubtrees() {
  const archiveRoot = join(ROOT, ARCHIVE_DIR);
  const archives = readdirSync(archiveRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  /** @type {Set<string>} */
  const subtrees = new Set();
  for (const archive of archives) {
    for (const entry of readdirSync(join(archiveRoot, archive), {
      withFileTypes: true,
    })) {
      if (entry.isDirectory()) subtrees.add(entry.name);
    }
  }
  if (subtrees.size === 0) {
    fail(
      `${ARCHIVE_DIR} carries no milestone directory, so the archive move relocates nothing and the classification would be vacuous`,
    );
  }
  return { archives, subtrees: [...subtrees].sort() };
}

/**
 * One reference's class, and the reason for it, both derived from the path it resolves, the set of
 * subtrees the archive move relocates, and - for a path built segment by segment - the root the
 * construction resolves against. Nothing here reads the class from the recording: the recording is
 * what this derivation is compared against.
 *
 * @param {{ path: string | null, site: string, root?: string | null, construct?: string }} reference
 * @param {{ subtrees: string[] }} moved
 * @param {Set<string>} roots the identifiers the file binds to its own module root
 * @returns {{ class: string, reason: string }}
 */
function classify(reference, moved, roots) {
  const { path, site } = reference;
  if (path === null) {
    const why =
      site === 'comment'
        ? 'named in a comment, which resolves no path and is read by nothing'
        : site === 'pattern'
          ? 'named in a regular expression, which resolves no path'
          : '.project stands in code outside any literal, so no path resolves';
    return { class: 'undecided', reason: `${why}, so neither class applies` };
  }
  const segments = path.split('/');
  if (segments[0] !== '.project') {
    return {
      class: 'undecided',
      reason: `${path} does not resolve under .project, so neither class applies`,
    };
  }
  if (segments[1] === 'archive') {
    return {
      class: 'deliberate-archive-read',
      reason: `resolves to ${path}, inside .project/archive - the destination the archive move writes - so the suite names an archived path on purpose`,
    };
  }
  const subtree = segments.length > 1 ? segments[1] : '';
  if (!moved.subtrees.includes(subtree)) {
    return {
      class: 'undecided',
      reason: `resolves to ${path}, and .project/${segments.slice(1).join('/')} is neither a subtree the archive move relocates (${moved.subtrees.join(', ')}) nor a path inside .project/archive, so neither class applies`,
    };
  }
  // A path this repository names in a string is the repository's own relative path; a path built
  // segment by segment is only the repository's when the root it is built on is the module's own.
  const root = reference.root ?? null;
  if (site !== 'segment' || (root !== null && roots.has(root))) {
    return {
      class: 'archived-by-the-move',
      reason: `resolves to ${path}, whose .project subtree ${subtree} is one the archive move relocates to .project/archive/<NNN>-<slug>/${subtree}, so that path is deleted when the milestone archives`,
    };
  }
  const where =
    root !== null
      ? `is built on ${root}, which this file does not bind to its own module root, so it names a directory the suite creates rather than this repository's live ${path}`
      : reference.construct === 'array'
        ? `is spelled as a path prefix in a list with no root argument, so nothing resolves it from this repository's root`
        : "is built with no root argument, so it resolves against whatever directory the process is standing in rather than this repository's root";
  return {
    class: 'undecided',
    reason: `${where}, and the archive move deletes nothing it names here - .project/${subtree} is a subtree the move relocates, but not this path`,
  };
}

/**
 * The archive-reference measurement, re-derived: the suites `git ls-files` names - staged and
 * untracked alike, so a suite this head carries cannot hide by not being staged yet - every reference
 * in each, and each reference's class and reason.
 *
 * @returns {Record<string, any>}
 */
function deriveArchiveReferences() {
  const moved = movedSubtrees();
  const tracked = git([
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
    '--',
    'scripts',
    'extension',
    'apps',
  ])
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
  const suites = tracked.filter((file) =>
    /\.(test|spec)\.(mjs|cjs|js|mts|ts)$/.test(file),
  );
  if (suites.length === 0) {
    fail(
      'git ls-files named no authored suite under scripts/, extension/ or apps/, so this measurement examined nothing',
    );
  }
  /** @type {Array<Record<string, any>>} */
  const references = [];
  for (const file of suites) {
    const text = readFileSync(join(ROOT, file), 'utf8');
    if (!text.includes('.project')) continue;
    const roots = moduleRoots(text);
    for (const reference of referencesIn(file, text)) {
      const verdict = classify(reference, moved, roots);
      /** @type {Record<string, any>} */
      const row = {
        file: reference.file,
        line: reference.line,
        path: reference.path,
        site: reference.site,
        class: verdict.class,
        reason: verdict.reason,
      };
      if (reference.root !== undefined) {
        row.root = reference.root;
        row.construct = reference.construct;
      }
      references.push(row);
    }
  }
  /** @type {Record<string, number>} */
  const counts = Object.fromEntries(CLASSES.map((name) => [name, 0]));
  /** @type {Record<string, number>} */
  const sites = {};
  for (const reference of references) {
    counts[reference.class] += 1;
    sites[reference.site] = (sites[reference.site] ?? 0) + 1;
  }
  return {
    command:
      'git ls-files --cached --others --exclude-standard -- scripts extension apps',
    suiteSelection:
      'a tracked file under scripts/, extension/ or apps/ whose basename carries `.test.` or `.spec.` before its extension',
    filesExamined: tracked.length,
    suitesExamined: suites.length,
    examined: references.length,
    movedSubtrees: moved.subtrees,
    movedSubtreesDerivedFrom: {
      command: `readdir ${ARCHIVE_DIR}/<NNN>-<slug>`,
      archivesExamined: moved.archives.length,
      rule: 'every directory name any archived milestone directory carries is a subtree the archive move relocates; a file the archive writes there (MANIFEST.md) is not',
    },
    counts,
    sites,
    references,
    reading:
      'every .project reference in every authored suite is enumerated by git ls-files and classified by whether the archive move relocates the path it resolves; a reference that resolves no path, or a path the move keeps, is recorded undecided with its reason and named rather than guessed',
  };
}

// --------------------------------------------- measurement 2: the fix record ----

/**
 * Every milestone's ship commit, by the number its subject carries, newest first. The range a
 * milestone owns is derived from these two commits rather than written here, so a re-cut history
 * moves the range rather than leaving a stale pair behind.
 *
 * @returns {Map<string, { sha: string, subject: string }>}
 */
function shipCommits() {
  /** @type {Map<string, { sha: string, subject: string }>} */
  const ships = new Map();
  for (const line of git(['log', '--format=%H%x09%s']).split('\n')) {
    if (line.trim() === '') continue;
    const tab = line.indexOf('\t');
    const sha = line.slice(0, tab);
    const subject = line.slice(tab + 1);
    const number = /^ship:\s*M(\d{3})\b/.exec(subject)?.[1];
    if (number === undefined) continue;
    if (!ships.has(number)) ships.set(number, { sha, subject });
  }
  return ships;
}

/**
 * One range's `--name-status -M`, one row per changed path, a rename carrying both of its names.
 *
 * @param {string} range
 * @returns {Array<{ status: string, paths: string[] }>}
 */
function nameStatus(range) {
  const out = git(['diff', '--name-status', '-M', range]);
  const rows = [];
  for (const line of out.split('\n')) {
    if (line.trim() === '') continue;
    const [status, ...paths] = line.split('\t');
    rows.push({ status, paths });
  }
  if (rows.length === 0) {
    fail(
      `git diff --name-status -M ${range} carries no path, so the range examined nothing`,
    );
  }
  return rows;
}

/** The tracked paths a name resolves to: the path itself, else every path it is a suffix of. */
function resolveTracked(name, tracked) {
  if (tracked.includes(name)) return [name];
  return tracked.filter((path) => path.endsWith(`/${name}`));
}

/**
 * Whether one path exists in one commit. A rename's two names are one path's two states at the same
 * commit, and `git cat-file -e` is the read that says which state the commit carries.
 *
 * @param {string} commit
 * @param {string} path
 * @returns {boolean}
 */
function presentAtCommit(commit, path) {
  try {
    git(['cat-file', '-e', `${commit}:${path}`]);
    return true;
  } catch {
    return false;
  }
}

/**
 * The `## Log` of one task file, as the lines it carries after the heading, each with its number.
 *
 * @param {string} file
 * @param {string} text
 * @returns {Array<{ line: number, text: string }>}
 */
function logLines(file, text) {
  const lines = stripBom(text).split(/\r?\n/);
  const start = lines.findIndex((line) => /^## Log\s*$/.test(line));
  if (start < 0) return [];
  const out = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    if (/^## /.test(line)) break;
    if (line.trim() === '') continue;
    out.push({ line: index + 1, text: line });
  }
  return out;
}

/** A token a `## Log` line names as a path, by the shape of the name rather than by a list. */
const PATH_LIKE =
  /^[\w@.-]+(?:[/\\][\w@.-]+)*\.(?:mjs|cjs|js|mts|ts|json|md|html|css)$/;

/**
 * The fix-record measurement, re-derived: M035's own range, the paths its task logs claim, what the
 * range carries for each, the tree fact read at the head the intent measured at, and a rename
 * recorded as the pair of names it produces.
 *
 * @returns {Record<string, any>}
 */
function deriveFixRecord() {
  const ships = shipCommits();
  const head = ships.get(CLAIM_MILESTONE);
  const base = ships.get(String(Number(CLAIM_MILESTONE) - 1).padStart(3, '0'));
  if (head === undefined || base === undefined) {
    fail(
      `git log names no ship commit for M${String(Number(CLAIM_MILESTONE) - 1).padStart(3, '0')} and M${CLAIM_MILESTONE}, so the range this claim is held against cannot be derived`,
    );
  }
  const range = `${base.sha}..${head.sha}`;
  const rows = nameStatus(range);
  const changed = rows.flatMap((row) => row.paths);
  const tracked = git(['ls-files'])
    .split('\n')
    .filter((line) => line !== '');

  const archive = join(
    ROOT,
    ARCHIVE_DIR,
    `${CLAIM_MILESTONE}-onpush-readiness`,
  );
  const taskDir = join(archive, 'tasks');
  if (!existsSync(taskDir)) {
    fail(
      `${displayPath(taskDir)} is missing - the claiming milestone's tasks are archived there`,
    );
  }
  const tasks = readdirSync(taskDir)
    .filter((name) => name.endsWith('.md'))
    .sort();

  /** @type {Array<Record<string, any>>} */
  const claims = [];
  let tasksExamined = 0;
  for (const name of tasks) {
    const path = join(taskDir, name);
    const text = readFileSync(path, 'utf8');
    const logs = logLines(path, text);
    if (logs.length === 0) continue;
    tasksExamined += 1;
    const task = /^id:\s*(\S+)\s*$/m.exec(stripBom(text))?.[1] ?? name;
    for (const log of logs) {
      for (const match of log.text.matchAll(/`([^`]+)`/g)) {
        const named = (match[1] ?? '').trim();
        if (!PATH_LIKE.test(named)) continue;
        const statuses = rows
          .filter((row) =>
            row.paths.some((entry) => entry.endsWith(named) || entry === named),
          )
          .map((row) => ({ status: row.status, paths: row.paths }));
        const resolved = resolveTracked(named, tracked);
        claims.push({
          task,
          at: `${displayPath(path)}:${log.line}`,
          named,
          text: log.text.trim(),
          inRange: statuses.length > 0,
          statuses,
          resolvesTo: resolved,
          presentInTheTree: resolved.length > 0,
        });
      }
    }
  }
  if (claims.length === 0) {
    fail(
      `no task log under ${displayPath(taskDir)} names a path, so the fix-record measurement examined no claim`,
    );
  }

  const claimed = claims.filter((claim) => claim.named === CLAIMED_PATH);
  if (claimed.length === 0) {
    fail(
      `no task log under ${displayPath(taskDir)} names ${CLAIMED_PATH}, so the claim this measurement reproduces is not there`,
    );
  }

  const headSha = git(['rev-parse', MEASURED_HEAD]).trim();
  const headSubject = git(['log', '-1', '--format=%s', headSha]).trim();
  const readCache = (/** @type {any} */ manifest) => {
    const entry = manifest?.targetDefaults?.[CACHE_SETTING];
    if (!isObject(entry) || typeof entry.cache !== 'boolean') {
      fail(
        `${CLAIMED_PATH} carries no boolean targetDefaults["${CACHE_SETTING}"].cache, so the tree fact this measurement states does not exist`,
      );
    }
    return entry.cache;
  };
  const atHead = readCache(
    JSON.parse(git(['show', `${headSha}:${CLAIMED_PATH}`])),
  );
  const workingTree = readCache(
    readJson(join(ROOT, CLAIMED_PATH), 'run npm ci'),
  );

  const ownRange = nameStatus(`${headSha}^..${headSha}`);
  const renames = ownRange.filter((row) => /^R/.test(row.status));
  if (renames.length === 0) {
    fail(
      `the commit-shaped range ${MEASURED_HEAD}^..${MEASURED_HEAD} carries no rename, so there is no pair to record`,
    );
  }
  const rename = renames[0];

  /** @type {Array<Record<string, any>>} */
  const findings = [];
  for (const claim of claims) {
    if (claim.inRange) continue;
    findings.push({
      kind: 'claim-absent-from-the-range',
      task: claim.task,
      at: claim.at,
      named: claim.named,
      statusesInTheRange: claim.statuses,
      presentInTheTree: claim.presentInTheTree,
    });
  }

  return {
    command: `git diff --name-status -M ${range} (and the reads below, each stated with its own value)`,
    examined: changed.length,
    tasksExamined,
    claimsExamined: claims.length,
    range: {
      milestone: `M${CLAIM_MILESTONE}`,
      base: { sha: base.sha, subject: base.subject },
      head: { sha: head.sha, subject: head.subject },
      command: 'git log --format=%H%x09%s (every ship commit, newest first)',
      diffCommand: `git diff --name-status -M ${range}`,
    },
    claim: {
      task: claimed[0].task,
      at: claimed[0].at,
      named: CLAIMED_PATH,
      text: claimed[0].text,
      inRange: claimed[0].inRange,
      statusesInTheRange: claimed[0].statuses,
    },
    claims,
    tree: {
      path: CLAIMED_PATH,
      setting: `targetDefaults["${CACHE_SETTING}"].cache`,
      atCommit: {
        commit: headSha,
        named: MEASURED_HEAD,
        subject: headSubject,
        cache: atHead,
      },
      workingTree: { cache: workingTree },
      command: `git show ${headSha}:${CLAIMED_PATH}`,
    },
    rename: {
      range: `${MEASURED_HEAD}^..${MEASURED_HEAD}`,
      command: `git diff --name-status -M ${MEASURED_HEAD}^..${MEASURED_HEAD}`,
      examined: ownRange.length,
      renamesInTheRange: renames.length,
      recorded: {
        status: rename.status,
        from: rename.paths[0],
        to: rename.paths[1],
        names: [rename.paths[0], rename.paths[1]],
      },
      // A rename's two names are one path's two states at the same commit: the old name is gone
      // there and the new name is there. Measured, because that is the fact the archive move makes
      // true of a live `.project` path and the fact a claim's reader has to know about.
      presentAtTheHead: {
        command: `git cat-file -e ${MEASURED_HEAD}:<path>`,
        liveNamePresent: presentAtCommit(headSha, rename.paths[0] ?? ''),
        archiveNamePresent: presentAtCommit(headSha, rename.paths[1] ?? ''),
      },
      note: `the milestone range ${range} carries ${String(rows.filter((row) => /^R/.test(row.status)).length)} rename row(s), and a rename needs both of its names to be read as present; the pair recorded here is measured from the commit-shaped range at ${MEASURED_HEAD}, which carries ${String(renames.length)}`,
    },
    findings,
    reading:
      'the claim a task log makes is held against the range the milestone owns, and the tree fact is kept in a separate field, so a check can report the range fact without asserting the tree fact; a rename is recorded as the two names it produces, because a claim naming the new name is true while a naive set-membership test reports it absent',
  };
}

// -------------------------------------- measurement 3: the skipped navigations ----

/**
 * One enum's members, by name and number, from the IIFE the shipped router chunk executes. A
 * declaration file would not prove what the page runs; this does.
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
  const members = [];
  const body = text.slice(start, end === -1 ? text.length : end);
  let match;
  while ((match = pattern.exec(body)) !== null) {
    members.push({ name: match[1] ?? '', value: Number(match[2]) });
  }
  if (members.length === 0) fail(`${CHUNK_REL} declares no ${name} member`);
  return members;
}

/** @param {unknown} value @returns {boolean} */
function isEvent(value) {
  return (
    isObject(value) &&
    typeof value.type === 'number' &&
    typeof value.class === 'string'
  );
}

/**
 * Every recorded event stream in a navigation recording, by the path it sits at. A stream is an
 * `events` array of event-shaped entries, or - where a frame carries no array - its single `event`
 * or `terminal` reading. A frame that carries both is one stream: its `terminal` repeats an event
 * the array already holds, and counting it twice would inflate what the measurement examined.
 *
 * @param {any} record
 * @returns {Array<{ frame: string, events: any[] }>}
 */
function navigationFrames(record) {
  /** @type {Array<{ frame: string, events: any[] }>} */
  const frames = [];
  /** @param {any} node @param {string} at @returns {void} */
  const visit = (node, at) => {
    if (!isObject(node)) return;
    if (Array.isArray(node.events) && node.events.some(isEvent)) {
      frames.push({ frame: `${at}.events`, events: node.events });
      return;
    }
    for (const key of ['event', 'terminal']) {
      if (isEvent(node[key])) {
        frames.push({ frame: `${at}.${key}`, events: [node[key]] });
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'events') continue;
      if (isObject(value)) visit(value, at === '' ? key : `${at}.${key}`);
    }
  };
  visit(record, '');
  return frames;
}

/**
 * The skipped-navigation measurement, re-derived: every `NavigationSkipped` entry the recording
 * carries, whether that id carries a start entry in the whole recording and in the entry's own
 * frame, and the counts both readings produce.
 *
 * @returns {Record<string, any>}
 */
function deriveSkippedNavigations() {
  const record = readJson(
    NAVIGATION_PATH,
    'the M041 recording is part of this repository',
  );
  const chunk = readText(CHUNK_PATH, 'run npm ci');
  const types = new Map(
    readEnum(chunk, 'EventType').map((member) => [member.name, member.value]),
  );
  const skippedType = types.get('NavigationSkipped');
  const startType = types.get('NavigationStart');
  if (typeof skippedType !== 'number' || typeof startType !== 'number') {
    fail(
      `${CHUNK_REL} declares no EventType member for NavigationSkipped and NavigationStart`,
    );
  }
  const frames = navigationFrames(record);
  const examined = frames.reduce((sum, entry) => sum + entry.events.length, 0);
  if (examined === 0) {
    fail(
      `${NAVIGATION_REL} carries no recorded navigation event, so this measurement examined nothing`,
    );
  }
  /** @type {Array<Record<string, any>>} */
  const entries = [];
  let byClass = 0;
  for (const { frame, events } of frames) {
    for (const event of events) {
      if (event.class === 'NavigationSkipped') byClass += 1;
      if (event.type !== skippedType) continue;
      const id = event.payload?.id ?? null;
      const startFrames = frames
        .filter((other) =>
          other.events.some(
            (entry) => entry.type === startType && entry.payload?.id === id,
          ),
        )
        .map((other) => other.frame);
      entries.push({
        frame,
        id,
        url: event.payload?.url ?? null,
        code: event.payload?.code ?? null,
        hasStartInTheRecording: startFrames.length > 0,
        startFrames,
        hasStartInItsOwnFrame: startFrames.includes(frame),
      });
    }
  }
  return {
    command: `read ${NAVIGATION_REL}, with the EventType numbers read from ${CHUNK_REL}`,
    examined,
    framesExamined: frames.length,
    frames: frames.map((entry) => ({
      frame: entry.frame,
      events: entry.events.length,
    })),
    eventTypesFrom: CHUNK_REL,
    skippedType,
    startType,
    entries,
    counts: {
      skippedByType: entries.length,
      skippedByClass: byClass,
      withAStartInTheRecording: entries.filter(
        (entry) => entry.hasStartInTheRecording,
      ).length,
      withAStartInItsOwnFrame: entries.filter(
        (entry) => entry.hasStartInItsOwnFrame,
      ).length,
    },
    reading:
      'every NavigationSkipped entry the recording carries is recorded with its id, its url and whether that id carries a start entry, in the whole recording and in the entry own frame; the two readings differ because each frame is one probe run, and the difference is recorded rather than averaged away',
  };
}

// ---------------------------------------------------------------- the record ----

/** @type {Record<string, any> | null} */
let MEASURED = null;

/**
 * The three measurements, taken once per run. Each is a set of git reads over the same head, so a
 * second read would only repeat them; one object also means every assertion compares against the
 * same reading rather than against a fresh one that could have moved underneath it.
 *
 * @returns {Record<string, any>}
 */
function derivedSections() {
  if (MEASURED === null) {
    MEASURED = {
      archiveReferences: deriveArchiveReferences(),
      fixRecord: deriveFixRecord(),
      skippedNavigations: deriveSkippedNavigations(),
    };
  }
  return MEASURED;
}

/**
 * Everything this run derives, with the capture block on top. Nothing here copies a derived value
 * forward, so a field the derivation stops producing shows up as a divergence against the recording
 * rather than as a silent pass.
 *
 * @param {string} at the write time, stamped only when a write happens
 * @param {number | null} recordedAt the time already on disk, carried when nothing moved
 * @returns {Record<string, any>}
 */
function derive(at, recordedAt) {
  const measured = derivedSections();
  return {
    ...measured,
    capture: {
      task: 'T001',
      command: ARMED_CAPTURE_COMMAND,
      check: CHECK_COMMAND,
      records: RECORD_REL,
      criteria: CRITERIA,
      remeasured: sectionsOf(measured),
      reading:
        'an armed run re-measures all three sections from the repository it is standing in: the suites git tracks, the range git records for the milestone, and the recorded navigation stream with its event types read from the installed router chunk. A default run reads the same three measurements back and asserts the recording is exactly what this head derives.',
      [VOLATILE_CAPTURE_FIELD]: recordedAt === null ? at : recordedAt,
    },
  };
}

/** The record's own shape and provenance: the fields no reading of the tree can settle. */
function assertShape(record) {
  if (!isObject(record)) fail('the recording is not an object');
  if (record.schema !== 'm044-gate-shapes/v1') {
    fail(`the recording schema is ${JSON.stringify(record.schema)}`);
  }
  if (record.milestone !== 'gate-integrity') {
    fail(`the recording milestone is ${JSON.stringify(record.milestone)}`);
  }
  if (record.task !== 'T001') {
    fail(`the recording task is ${JSON.stringify(record.task)}`);
  }
  for (const key of ['title', 'question', 'verdict']) {
    if (typeof record[key] !== 'string' || record[key].trim() === '') {
      fail(`missing the recording's ${key}`);
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
  if (capture.check !== CHECK_COMMAND) {
    fail(`capture.check is ${JSON.stringify(capture.check)}`);
  }
  if (capture.records !== RECORD_REL) {
    fail(`capture.records is ${JSON.stringify(capture.records)}`);
  }
  if (JSON.stringify(capture.criteria) !== JSON.stringify(CRITERIA)) {
    fail(`capture.criteria is ${JSON.stringify(capture.criteria)}`);
  }
  if (
    typeof capture[VOLATILE_CAPTURE_FIELD] !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(
      capture[VOLATILE_CAPTURE_FIELD],
    )
  ) {
    fail(
      `capture.${VOLATILE_CAPTURE_FIELD} is ${String(capture[VOLATILE_CAPTURE_FIELD])}, not the time the file was written`,
    );
  }
  if (!Array.isArray(capture.remeasured) || capture.remeasured.length === 0) {
    fail('capture.remeasured is empty, so the record does not say what moved');
  }
}

/**
 * `examined: 0` is a failed measurement, never a clean result. Stated once, so every section is held
 * to it and a section that measured nothing reddens rather than passing.
 *
 * @param {any} section
 * @param {string} what
 * @returns {void}
 */
function assertExamined(section, what) {
  if (!isObject(section)) fail(`missing ${what}`);
  if (typeof section.command !== 'string' || section.command.trim() === '') {
    fail(`${what} states no command, so nothing says what produced it`);
  }
  if (section.examined === 0) {
    fail(
      `${what} examined 0 input(s), which is a failed measurement and not a clean result: ${section.command}`,
    );
  }
  if (typeof section.examined !== 'number' || section.examined < 0) {
    fail(`${what} records examined ${JSON.stringify(section.examined)}`);
  }
}

/**
 * One archive-reference measurement against another, entry by entry, so a disagreement names the
 * file, the line and the path rather than a pair of arrays. This is the comparator the mutant has to
 * redden, which is why it is written per entry instead of as one `deepEqual`.
 *
 * @param {any} recorded
 * @param {any} derived
 * @returns {string[]}
 */
function compareArchiveReferences(recorded, derived) {
  /** @type {string[]} */
  const problems = [];
  if (!isObject(recorded))
    return ['the recorded archiveReferences section is missing'];
  for (const field of [
    'command',
    'suiteSelection',
    'filesExamined',
    'suitesExamined',
    'examined',
    'movedSubtrees',
    'counts',
    'sites',
  ]) {
    const left = canonicalJson(recorded[field]);
    const right = canonicalJson(derived[field]);
    if (left !== right)
      problems.push(`archiveReferences.${field}: ${left} -> ${right}`);
  }
  const rows = Array.isArray(recorded.references) ? recorded.references : [];
  const mine = Array.isArray(derived.references) ? derived.references : [];
  if (rows.length !== mine.length) {
    problems.push(
      `archiveReferences.references: ${rows.length} row(s) recorded -> ${mine.length} row(s) derived`,
    );
  }
  const key = (/** @type {any} */ row) =>
    `${row?.file}:${row?.line}:${row?.path ?? 'no-path'}`;
  const mineByKey = new Map(mine.map((row) => [key(row), row]));
  for (const row of rows) {
    const other = mineByKey.get(key(row));
    if (other === undefined) {
      problems.push(
        `${row?.file}:${row?.line} names ${JSON.stringify(row?.path)} and the derivation does not`,
      );
      continue;
    }
    if (row.class !== other.class) {
      problems.push(
        `${row.file}:${row.line} ${String(row.path)} is recorded ${row.class} (${row.site}) and the tree derives ${other.class} (${other.site})`,
      );
    }
    if (row.reason !== other.reason) {
      problems.push(
        `${row.file}:${row.line} reason: ${row.reason} -> ${other.reason}`,
      );
    }
    if (row.site !== other.site) {
      problems.push(
        `${row.file}:${row.line} site: ${row.site} -> ${other.site}`,
      );
    }
    for (const field of ['root', 'construct']) {
      const left = JSON.stringify(row[field]);
      const right = JSON.stringify(other[field]);
      if (left !== right) {
        problems.push(`${row.file}:${row.line} ${field}: ${left} -> ${right}`);
      }
    }
  }
  return problems;
}

/**
 * The record's claims this file can check without re-deriving everything: the classes are the three
 * the contract names, every entry carries a file, a line, a class and a reason, the counts are the
 * counts, and at least one reference is decided each way - a measurement that found no reference of
 * either class would be a rule nobody has evidence for.
 *
 * @param {any} section
 * @returns {void}
 */
function assertArchiveReferencesShape(section) {
  assertExamined(section, 'archiveReferences');
  const rows = section.references;
  if (!Array.isArray(rows) || rows.length === 0) {
    fail('archiveReferences carries no reference, so nothing was enumerated');
  }
  if (rows.length !== section.examined) {
    fail(
      `archiveReferences.examined is ${section.examined} and it carries ${rows.length} reference(s)`,
    );
  }
  for (const row of rows) {
    if (typeof row.file !== 'string' || row.file === '') {
      fail('an archive reference names no file');
    }
    if (typeof row.line !== 'number' || row.line < 1) {
      fail(`${row.file}: a reference records line ${JSON.stringify(row.line)}`);
    }
    if (!CLASSES.includes(row.class)) {
      fail(
        `${row.file}:${row.line} carries class ${JSON.stringify(row.class)}`,
      );
    }
    if (typeof row.reason !== 'string' || row.reason.trim() === '') {
      fail(
        `${row.file}:${row.line} carries no reason for ${row.class}, so its class is a guess`,
      );
    }
    if (row.class === 'archived-by-the-move') {
      const subtree = String(row.path).split('/')[1];
      if (!section.movedSubtrees.includes(subtree)) {
        fail(
          `${row.file}:${row.line} is ${row.class} and its path ${String(row.path)} sits under a subtree the archive move does not relocate`,
        );
      }
      // A path built segment by segment is this repository's only when the root it is built on is
      // the one the suite's own module resolves. Checked against that file's own bindings, so a
      // live reference to a scratch tree cannot be recorded as a defect.
      if (row.site === 'segment') {
        const source = readFileSync(join(ROOT, row.file), 'utf8');
        if (
          typeof row.root !== 'string' ||
          !moduleRoots(source).has(row.root)
        ) {
          fail(
            `${row.file}:${row.line} is ${row.class} and its construction names ${JSON.stringify(row.root)}, which that file does not bind to its own module root`,
          );
        }
      }
    }
    if (row.class === 'deliberate-archive-read') {
      if (!String(row.path).startsWith('.project/archive')) {
        fail(
          `${row.file}:${row.line} is ${row.class} and its path ${String(row.path)} names no archive path`,
        );
      }
    }
  }
  for (const name of CLASSES) {
    if (
      section.counts?.[name] !== rows.filter((row) => row.class === name).length
    ) {
      fail(
        `archiveReferences.counts.${name} is ${JSON.stringify(section.counts?.[name])} and ${rows.filter((row) => row.class === name).length} row(s) carry it`,
      );
    }
  }
  const undecided = rows.filter((row) => row.class === 'undecided');
  if (
    undecided.length > 0 &&
    !undecided.every((row) => row.reason.length > 0)
  ) {
    fail('an undecided reference carries no reason, so it is a guess');
  }
}

/**
 * The fix-record section's own shape, and the two facts T001's AC2 is written about: the range
 * carries nothing for the claimed path, and the tree carries the setting the claim says it changed.
 *
 * @param {any} section
 * @returns {void}
 */
function assertFixRecordShape(section) {
  assertExamined(section, 'fixRecord');
  if (!isObject(section.claim)) fail('fixRecord carries no claim');
  if (section.claim.named !== CLAIMED_PATH) {
    fail(`fixRecord.claim.named is ${JSON.stringify(section.claim.named)}`);
  }
  if (!Array.isArray(section.claim.statusesInTheRange)) {
    fail('fixRecord.claim carries no statusesInTheRange list');
  }
  if (section.claim.inRange !== section.claim.statusesInTheRange.length > 0) {
    fail(
      `fixRecord.claim.inRange is ${JSON.stringify(section.claim.inRange)} and ${section.claim.statusesInTheRange.length} status row(s) carry the claimed path`,
    );
  }
  if (!isObject(section.range)) fail('fixRecord carries no range');
  for (const end of ['base', 'head']) {
    const value = section.range[end];
    if (
      !isObject(value) ||
      !/^[0-9a-f]{40}$/.test(String(value.sha)) ||
      !String(value.subject).startsWith('ship:')
    ) {
      fail(
        `fixRecord.range.${end} is not a ship commit: ${JSON.stringify(value)}`,
      );
    }
  }
  const tree = section.tree;
  if (!isObject(tree) || !isObject(tree.atCommit)) {
    fail('fixRecord carries no tree reading');
  }
  if (typeof tree.atCommit.cache !== 'boolean') {
    fail(
      `fixRecord.tree.atCommit.cache is ${JSON.stringify(tree.atCommit.cache)}`,
    );
  }
  if (typeof tree.workingTree?.cache !== 'boolean') {
    fail(
      `fixRecord.tree.workingTree.cache is ${JSON.stringify(tree.workingTree?.cache)}`,
    );
  }
  if (tree.atCommit.commit?.startsWith(MEASURED_HEAD) !== true) {
    fail(
      `fixRecord.tree.atCommit.commit is ${JSON.stringify(tree.atCommit.commit)} and the measurement was taken at ${MEASURED_HEAD}`,
    );
  }
  const rename = section.rename;
  if (!isObject(rename) || !isObject(rename.recorded)) {
    fail('fixRecord carries no rename pair');
  }
  if (!/^R\d+$/.test(String(rename.recorded.status))) {
    fail(
      `fixRecord.rename.recorded.status is ${JSON.stringify(rename.recorded.status)}, which is not a rename`,
    );
  }
  if (
    typeof rename.recorded.from !== 'string' ||
    typeof rename.recorded.to !== 'string' ||
    rename.recorded.from === rename.recorded.to
  ) {
    fail(
      `fixRecord.rename.recorded is not a pair of names: ${JSON.stringify(rename.recorded)}`,
    );
  }
  if (!Array.isArray(rename.recorded.names)) {
    fail('the rename pair does not carry both of its names as a list');
  }
  if (rename.presentAtTheHead?.liveNamePresent !== false) {
    fail(
      `the rename's old name is recorded as present at ${MEASURED_HEAD}: ${JSON.stringify(rename.presentAtTheHead)}`,
    );
  }
  if (rename.presentAtTheHead?.archiveNamePresent !== true) {
    fail(
      `the rename's new name is recorded as absent at ${MEASURED_HEAD}: ${JSON.stringify(rename.presentAtTheHead)}`,
    );
  }
  if (!Array.isArray(section.claims) || section.claims.length === 0) {
    fail('fixRecord examined no claim');
  }
  if (!Array.isArray(section.findings)) {
    fail('fixRecord carries no findings list');
  }
}

/**
 * The skipped-navigation section's own shape, and the fact T001's AC3 is written about: every entry
 * carries an id, a url and the start reading, and the count found by event type equals the count
 * found by class name - a wrong type number would otherwise quietly examine nothing.
 *
 * @param {any} section
 * @returns {void}
 */
function assertSkippedNavigationsShape(section) {
  assertExamined(section, 'skippedNavigations');
  if (!Array.isArray(section.entries) || section.entries.length === 0) {
    fail(
      'skippedNavigations carries no NavigationSkipped entry, so the shape the narrator drops was not found in the stream',
    );
  }
  if (section.counts.skippedByType !== section.entries.length) {
    fail(
      `skippedNavigations.counts.skippedByType is ${JSON.stringify(section.counts.skippedByType)} and it carries ${section.entries.length} entry(ies)`,
    );
  }
  if (section.counts.skippedByType !== section.counts.skippedByClass) {
    fail(
      `the stream carries ${section.counts.skippedByType} NavigationSkipped event(s) by type ${section.skippedType} and ${section.counts.skippedByClass} by class name, so the type number and the class disagree`,
    );
  }
  for (const entry of section.entries) {
    if (typeof entry.id !== 'number') {
      fail(
        `${entry.frame}: a NavigationSkipped entry records id ${JSON.stringify(entry.id)}`,
      );
    }
    if (typeof entry.url !== 'string' || entry.url === '') {
      fail(`${entry.frame}: NavigationSkipped id ${entry.id} records no url`);
    }
    if (typeof entry.hasStartInTheRecording !== 'boolean') {
      fail(
        `${entry.frame}: NavigationSkipped id ${entry.id} records no start reading`,
      );
    }
    if (entry.hasStartInTheRecording !== entry.startFrames.length > 0) {
      fail(
        `${entry.frame}: hasStartInTheRecording is ${String(entry.hasStartInTheRecording)} and ${entry.startFrames.length} frame(s) carry a start for id ${entry.id}`,
      );
    }
    if (
      entry.hasStartInItsOwnFrame !== entry.startFrames.includes(entry.frame)
    ) {
      fail(
        `${entry.frame}: hasStartInItsOwnFrame disagrees with the start frames it lists`,
      );
    }
  }
  const withStart = section.entries.filter(
    (entry) => entry.hasStartInTheRecording,
  ).length;
  if (section.counts.withAStartInTheRecording !== withStart) {
    fail(
      `skippedNavigations.counts.withAStartInTheRecording is ${JSON.stringify(section.counts.withAStartInTheRecording)} and ${withStart} entry(ies) carry one`,
    );
  }
}

/**
 * The whole check of one record: its shape, the three sections' own claims, and every value the
 * derivation can settle compared entry by entry.
 *
 * @param {any} recorded
 * @param {any} derived
 * @param {{ text?: string }} [options]
 * @returns {any}
 */
function validateRecord(recorded, derived, options = {}) {
  assertShape(recorded);
  assertArchiveReferencesShape(recorded.archiveReferences);
  assertFixRecordShape(recorded.fixRecord);
  assertSkippedNavigationsShape(recorded.skippedNavigations);
  const problems = [
    ...compareArchiveReferences(
      recorded.archiveReferences,
      derived.archiveReferences,
    ),
  ];
  for (const field of ['fixRecord', 'skippedNavigations']) {
    const left = JSON.stringify(recorded[field]);
    const right = JSON.stringify(derived[field]);
    if (left !== right) {
      problems.push(
        `${field} is not what this head derives: the recorded section and the derived one first differ at ${JSON.stringify(firstDifference(recorded[field], derived[field], '') || field)}`,
      );
    }
  }
  if (problems.length > 0) {
    fail(
      `the recording disagrees with this run's derivation at ${problems.length} value(s): ${problems.slice(0, 8).join('; ')}`,
    );
  }
  if (options.text !== undefined) assertCanonical(options.text, recorded);
  return recorded;
}

/**
 * The first place two values differ, as `path: recorded -> derived`. Arrays are walked row by row.
 *
 * @param {any} left
 * @param {any} right
 * @param {string} at
 * @returns {string}
 */
function firstDifference(left, right, at) {
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return `${at}: ${left.length} row(s) -> ${right.length} row(s)`;
    }
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
 * The recording on disk must be the canonical serialisation of its own record, or a re-capture would
 * not reproduce these bytes.
 *
 * @param {string} text
 * @param {any} record
 * @returns {void}
 */
function assertCanonical(text, record) {
  const expected = canonical(record);
  if (text === expected) return;
  let at = 0;
  while (at < text.length && text[at] === expected[at]) at += 1;
  fail(
    `the recording is not the canonical serialisation of its record: the two agree for ${at} character(s) and then ${JSON.stringify(text.slice(at, at + 24))} sits where ${JSON.stringify(expected.slice(at, at + 24))} belongs`,
  );
}

/** @returns {any} */
function recorded() {
  return readJson(RECORD_PATH, 'the measurement has not been recorded');
}

// ------------------------------------------------------------------- capture ----

/**
 * The armed capture: re-derive, compare, write only when a value moved. A file that is current and
 * canonical is not touched at all, which is what makes two armed runs byte-identical.
 *
 * @param {string} path
 * @param {string} at
 * @returns {{ wrote: boolean, before: string, after: string, moved: string[] }}
 */
function capture(path, at) {
  const present = existsSync(path);
  const text = present ? readText(path, 'the recording has not been made') : '';
  const before = present ? sha256(text) : null;
  const record = present ? JSON.parse(text) : {};
  const recordedAt = record.capture?.[VOLATILE_CAPTURE_FIELD] ?? null;
  const candidate = {
    schema: 'm044-gate-shapes/v1',
    milestone: 'gate-integrity',
    task: 'T001',
    title: TITLE,
    question: QUESTION,
    verdict: VERDICT,
    ...derive(at, recordedAt),
  };
  /** @type {string[]} */
  const moved = [];
  if (present) {
    const drift = firstDifference(record, candidate, '');
    if (drift !== '') moved.push(drift);
    if (text !== canonical(record)) {
      moved.push('the file is not the canonical serialisation of its record');
    }
  } else {
    moved.push('the recording had not been made');
  }
  if (moved.length === 0) {
    return { wrote: false, before, after: before, moved };
  }
  candidate.capture[VOLATILE_CAPTURE_FIELD] = at;
  const bytes = canonical(candidate);
  // Never write a record that would fail its own check.
  const check = JSON.parse(bytes);
  check.capture[VOLATILE_CAPTURE_FIELD] = recordedAt ?? at;
  validateRecord(check, derive(at, check.capture[VOLATILE_CAPTURE_FIELD]));
  writeFileSync(path, bytes);
  return {
    wrote: true,
    before,
    after: sha256(readFileSync(path)),
    moved,
  };
}

// ------------------------------------------------------------ the armed run ----
//
// Declared first, so an armed run captures before the read-only pins read the file back: the same
// pins then prove the freshly written recording is still the one this head derives.

if (ARMED) {
  test('armed: re-derive, write only what moved, and a second run changes no byte', (t) => {
    const first = capture(RECORD_PATH, new Date().toISOString());
    t.diagnostic(
      first.wrote
        ? `armed run wrote ${RECORD_REL}; moved: ${first.moved.slice(0, 6).join('; ')}`
        : 'armed run: nothing moved, nothing written',
    );
    assert.equal(
      first.after,
      sha256(readFileSync(RECORD_PATH)),
      'the bytes the armed run reports are not the bytes on disk',
    );
    const second = capture(RECORD_PATH, new Date().toISOString());
    assert.equal(
      second.wrote,
      false,
      `the second armed run wrote, and nothing had moved: ${second.moved.slice(0, 4).join('; ')}`,
    );
    assert.equal(
      second.after,
      first.after,
      'a second armed run changed the recording, so the re-capture is not idempotent',
    );
    t.diagnostic(
      `armed idempotence: ${readFileSync(RECORD_PATH).length} bytes, sha256 ${second.after} before and after the second run`,
    );
    // The armed run is the only writer this suite has; the read-only pin below holds the bytes it
    // left, so an armed run is a capture rather than a failure of the read-only assertion.
    baseline = sha256(readFileSync(RECORD_PATH));
  });
}

// ------------------------------------------------------------ the default run ----

test('a default run is a read: the recording hashes the same before and after', (t) => {
  const now = sha256(readFileSync(RECORD_PATH));
  t.diagnostic(
    `${RECORD_REL} at load: ${readFileSync(RECORD_PATH).length} bytes, sha256 ${baseline}`,
  );
  t.diagnostic(`${RECORD_REL} after the run: sha256 ${now}`);
  assert.equal(
    now,
    baseline,
    `${RECORD_REL} changed during this run, so the suite is not read-only`,
  );
  assert.equal(WOULD_WRITE.length, 1, 'the file list must name what it writes');
  assert.equal(WOULD_WRITE[0]?.path, RECORD_PATH);
  t.diagnostic(
    `an armed run would write: ${WOULD_WRITE.map((file) => displayPath(file.path)).join(', ')} - ${ARMED_CAPTURE_COMMAND}`,
  );
});

test('the recording is the canonical serialisation of its own record', () => {
  const text = stripBom(readFileSync(RECORD_PATH, 'utf8'));
  assertCanonical(text, JSON.parse(text));
});

test('the recording still re-derives from the tree, the range and the stream this head carries', (t) => {
  const text = stripBom(readFileSync(RECORD_PATH, 'utf8'));
  const record = JSON.parse(text);
  const derived = derive('a run that found nothing to move', null);
  const checked = { ...derived };
  checked.capture = record.capture;
  assert.doesNotThrow(
    () =>
      validateRecord(record, checked, {
        text,
      }),
    'the committed recording must be what this head derives',
  );
  const references = record.archiveReferences;
  t.diagnostic(
    `archiveReferences: ${references.examined} reference(s) in ${references.suitesExamined} suite(s) of ${references.filesExamined} listed file(s); ${JSON.stringify(references.counts)}`,
  );
  t.diagnostic(
    `fixRecord: ${record.fixRecord.claimsExamined} claim(s) in ${record.fixRecord.tasksExamined} task log(s) over ${record.fixRecord.examined} changed path(s); ${CLAIMED_PATH} in range: ${String(record.fixRecord.claim.inRange)}; tree cache at ${MEASURED_HEAD}: ${String(record.fixRecord.tree.atCommit.cache)}`,
  );
  t.diagnostic(
    `skippedNavigations: ${record.skippedNavigations.entries.length} NavigationSkipped entry(ies) among ${record.skippedNavigations.examined} event(s) in ${record.skippedNavigations.framesExamined} frame(s); ${JSON.stringify(record.skippedNavigations.counts)}`,
  );
});

// ------------------------------------------------------------- AC1: archive ----

test('every .project reference is enumerated and classified, and each class names the path it resolves', () => {
  const derived = derivedSections().archiveReferences;
  assert.doesNotThrow(() => assertArchiveReferencesShape(derived));

  const decided = derived.references.filter((row) => row.class !== 'undecided');
  assert.ok(
    decided.some((row) => row.class === 'archived-by-the-move'),
    'no reference resolves to a live .project path the archive move relocates, so the first class has no evidence in this tree',
  );
  assert.ok(
    decided.some((row) => row.class === 'deliberate-archive-read'),
    'no reference names .project/archive on purpose, so the second class has no evidence in this tree',
  );

  // The two shapes the brief names, found by the path they resolve rather than by a literal grep:
  // a `join(ROOT, '.project', ...)` construction is caught, and a deliberate archive read is not
  // reported as a live reference.
  const constructed = derived.references.filter(
    (row) => row.site === 'segment' && row.path !== '.project',
  );
  assert.ok(
    constructed.length > 0,
    'no reference is built from a .project segment, so a scan that only read whole literals would have passed this tree',
  );
  const archiveRead = derived.references.find(
    (row) =>
      row.class === 'deliberate-archive-read' &&
      row.site === 'segment' &&
      /error-boundary-capture/.test(row.file),
  );
  assert.ok(
    archiveRead,
    'the deliberate archive read in scripts/error-boundary-capture.test.mjs is not recorded as an archive read',
  );
  const source = readFileSync(join(ROOT, archiveRead.file), 'utf8').split('\n');
  assert.match(
    source[archiveRead.line - 1] ?? '',
    /join\(/,
    `the recorded line ${archiveRead.file}:${archiveRead.line} must be the line that opens the join() the reference is built in`,
  );
  assert.ok(
    archiveRead.path.startsWith('.project/archive/'),
    `${archiveRead.path} must be an archive path`,
  );

  // Every undecided reference is named with its reason, and every reason is a sentence about this
  // tree rather than a placeholder.
  for (const row of derived.references.filter((r) => r.class === 'undecided')) {
    assert.ok(
      row.reason.length > 40,
      `${row.file}:${row.line} is undecided and its reason is not a statement: ${JSON.stringify(row.reason)}`,
    );
  }
});

// ------------------------------------------------- AC2: the fix record ----

test('the M035 nx.json claim is absent from its range, and the tree fact is a separate field', () => {
  const derived = derivedSections().fixRecord;
  assert.doesNotThrow(() => assertFixRecordShape(derived));

  assert.deepEqual(
    derived.claim.statusesInTheRange,
    [],
    `the range must carry nothing for ${CLAIMED_PATH}, and it carried ${JSON.stringify(derived.claim.statusesInTheRange)}`,
  );
  assert.equal(
    derived.claim.inRange,
    false,
    `the recorded claim must be absent from the range it is held against`,
  );
  assert.equal(
    derived.tree.atCommit.cache,
    true,
    `the tree at ${MEASURED_HEAD} must carry ${CACHE_SETTING} with cache true, which is the fact the claim contradicts`,
  );
  assert.ok(
    derived.claims.some((claim) => claim.inRange),
    'no claim in the record matches a path the range carries, so the measurement would report every claim absent',
  );
  assert.ok(
    derived.findings.some(
      (finding) =>
        finding.named === CLAIMED_PATH && finding.presentInTheTree === true,
    ),
    `the absent claim must be recorded as a path that exists in the tree, or it is not the defect this measurement reproduces`,
  );
  assert.equal(
    derived.rename.recorded.status.startsWith('R'),
    true,
    'the rename pair is recorded with a rename status',
  );
});

test('a rename is recorded as the pair it produces, and the M035 range carries none', () => {
  const derived = derivedSections().fixRecord;
  const pair = derived.rename.recorded;
  assert.deepEqual(
    Object.keys(pair).sort(),
    ['from', 'names', 'status', 'to'],
    'the rename is recorded as its status and both of its names',
  );
  assert.deepEqual(
    pair.names,
    [pair.from, pair.to],
    'the pair states both names, in the order the status carries them',
  );
  assert.notEqual(pair.from, pair.to, 'a rename names two different paths');
  // The pair is one path's two states at one commit: the live name is gone there and the archive
  // copy is there, which is the fact the archive move makes true of every reference measurement 1
  // calls `archived-by-the-move`.
  assert.equal(
    derived.rename.presentAtTheHead.liveNamePresent,
    false,
    `the rename's old name must be absent at ${MEASURED_HEAD}`,
  );
  assert.equal(
    derived.rename.presentAtTheHead.archiveNamePresent,
    true,
    `the rename's new name must be present at ${MEASURED_HEAD}`,
  );
  assert.match(
    derived.rename.note,
    /carries 0 rename row\(s\)/,
    `the M035 range's own rename count is recorded rather than assumed: ${derived.rename.note}`,
  );
});

// --------------------------------------------- AC3: the skipped navigations ----

test('every NavigationSkipped entry is recorded with its id, its url and its start reading', () => {
  const derived = derivedSections().skippedNavigations;
  assert.doesNotThrow(() => assertSkippedNavigationsShape(derived));
  const stream = readJson(NAVIGATION_PATH, 'the M041 recording');
  const frames = navigationFrames(stream);
  for (const entry of derived.entries) {
    const frame = frames.find((candidate) => candidate.frame === entry.frame);
    assert.ok(frame, `${entry.frame} is not a frame of the recording`);
    assert.ok(
      frame.events.some(
        (event) =>
          event.type === derived.skippedType &&
          event.payload?.id === entry.id &&
          event.payload?.url === entry.url,
      ),
      `${entry.frame} carries no NavigationSkipped with id ${entry.id} and url ${entry.url}`,
    );
  }
  assert.equal(
    derived.eventTypesFrom,
    CHUNK_REL,
    'the event-type numbers are read from the installed router chunk rather than written here',
  );
});

// --------------------------------------------------- AC4: nothing examined ----

test('a measurement that examined nothing is a failure, and every section states its command', () => {
  const record = recorded();
  for (const [name, what] of [
    ['archiveReferences', 'archiveReferences'],
    ['fixRecord', 'fixRecord'],
    ['skippedNavigations', 'skippedNavigations'],
  ]) {
    const section = record[name];
    assert.equal(
      typeof section.command,
      'string',
      `${what} must state the command that produced it`,
    );
    assert.ok(section.examined > 0, `${what}.examined is ${section.examined}`);
    const zeroed = clone(section);
    zeroed.examined = 0;
    assert.throws(
      () => assertExamined(zeroed, what),
      new RegExp(`${what} examined 0 input`),
      `${what} must treat examined: 0 as a failure rather than a clean result`,
    );
  }
  // And the whole record's check refuses the same shape, so the refusal is load-bearing rather than
  // a test beside it.
  const zeroed = clone(record);
  zeroed.skippedNavigations.examined = 0;
  assert.throws(
    () => validateRecord(zeroed, zeroed),
    /skippedNavigations examined 0 input/,
    'a record whose measurement examined nothing must not validate',
  );
});

// ---------------------------------------------------------------- mutants ----

test('a planted misclassification reddens the archive-reference pin and names the file', (t) => {
  const record = recorded();
  const derived = derivedSections().archiveReferences;
  assert.doesNotThrow(
    () => compareArchiveReferences(record.archiveReferences, derived),
    'the untouched record must pass the comparator first',
  );
  const planted = clone(record.archiveReferences);
  // The victim is another suite's archive read, not this file's own: the mutant must redden a file
  // the rule is written for, and a mutant that only moved this suite's own row would prove less.
  const victim =
    planted.references.find(
      (row) =>
        row.class === 'deliberate-archive-read' &&
        row.file === 'scripts/error-boundary-capture.test.mjs',
    ) ??
    planted.references.find((row) => row.class === 'deliberate-archive-read');
  assert.ok(victim, 'the record must carry an archive read to misclassify');
  victim.class = 'archived-by-the-move';
  victim.reason = 'planted: an archive read called a live reference';

  let message = '';
  try {
    const problems = compareArchiveReferences(planted, derived);
    assert.deepEqual(problems, []);
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  t.diagnostic(`mutant failure: ${message}`);
  assert.match(
    message,
    new RegExp(
      `${escapeForRegExp(victim.file)}:${victim.line} .*is recorded archived-by-the-move`,
    ),
    `the mutant must redden the comparator naming ${victim.file}:${victim.line}; it produced ${JSON.stringify(message.slice(0, 240))}`,
  );
});

test('the arming gate guards the one write, and the suite spawns nothing but read-only git', () => {
  const source = readText(SELF_PATH, 'this file');
  const gate = source.indexOf(['if (ARM', 'ED) {'].join(''));
  assert.notEqual(gate, -1, 'the arming gate is not in this file');

  // One write, inside `capture`, and `capture` is called from nowhere but the gate: the gate is
  // what makes the write reachable, and this is the proof that no other call site can.
  const write = ['writeFile', 'Sync', '('].join('');
  assert.equal(
    source.split(write).length - 1,
    1,
    'this suite writes its record in exactly one place',
  );
  const call = ['capture(RECORD', '_PATH'].join('');
  let at = source.indexOf(call);
  let calls = 0;
  while (at !== -1) {
    calls += 1;
    assert.ok(
      at > gate,
      `${call} is called outside the M044_CAPTURE gate, so a default run would write`,
    );
    at = source.indexOf(call, at + call.length);
  }
  assert.ok(calls >= 2, 'the gate must actually capture, twice');

  // Every child process is one read-only git invocation, from the one helper.
  const spawn = ['spawn', 'Sync('].join('');
  assert.equal(
    source.split(spawn).length - 1,
    1,
    'this suite spawns from one place, so every read is named by the same helper',
  );
  const helper = source.slice(source.indexOf('function git('));
  assert.match(
    helper.slice(0, 400),
    /spawnSync\('git'/,
    'the one spawn must be a git read rather than a shell, a browser or a server',
  );

  // No browser, no server, no port: the three measurements are text, git and a recorded stream.
  for (const needle of [
    ['puppe', 'teer'].join(''),
    ['play', 'wright'].join(''),
    ['createServer', '('].join(''),
    ['chrome-remote', '-interface'].join(''),
  ]) {
    assert.equal(
      source.includes(needle),
      false,
      `this suite must drive no browser and bind no port, and it names ${needle}`,
    );
  }
});

// ================== T002: the archive-path and the fix-record checks (SC1, SC2, SC5) ==================
//
// The two checks T003 wires into the gate, held against the rows T001 measured rather than against
// strings written here: the record's own `archived-by-the-move` rows are the live paths, its
// `deliberate-archive-read` rows are the archived ones, and M035's range is the claim list that
// carries a file change the range never made. A dot-project path is spelled through `DOTTED`
// throughout, because the record enumerates this file's own references by line: an added reference,
// or an added line above one, would move a count or a key behind the record's back. Everything
// below is therefore appended after the last line the record pins.

import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import {
  MUTANTS,
  checkArchivePaths,
  checkFixRecord,
  gate,
  main,
  shipRange,
} from './gate-integrity.mjs';

/** The first characters of a dot-project path, kept apart so no added line is a reference. */
const DOTTED = '.' + 'project';

/** The milestone whose own archive move the archive-path check is pointed at. */
const LIVE_MILESTONE = 'M044';

/** The two suites the record and the check agree name the same live path, one naming it and one reading it. */
const NAMING_SUITE = 'scripts/performance-capture.test.mjs';
const READING_SUITE = 'scripts/navigation-capture.test.mjs';

/** The archive-path report over this repository, derived once: the check reads 141 suites. */
let archiveReport = null;

/**
 * @returns {any}
 */
function archiveCheck() {
  if (archiveReport === null) {
    archiveReport = checkArchivePaths({
      root: ROOT,
      milestone: LIVE_MILESTONE,
    });
  }
  return archiveReport;
}

/** The reference rows T001 recorded, which is the enumeration every assertion below is driven from. */
function referenceRows() {
  return recorded().archiveReferences.references;
}

/** One row's identity in the record and in the check: the file, the line and the path it resolves. */
function rowKey(/** @type {any} */ row) {
  return `${String(row?.file)}:${String(row?.line)}:${String(row?.path ?? 'no-path')}`;
}

/**
 * The suite the fixture tree is written to, as the four lines every suite needs to bind its own
 * module root: the check resolves `join(ROOT, DOTTED, ...)` against a root the file binds itself.
 *
 * @param {...string} body
 * @returns {string}
 */
function fixtureSuite(...body) {
  return [
    "import { readFileSync } from 'node:fs';",
    "import { dirname, join } from 'node:path';",
    "import { fileURLToPath } from 'node:url';",
    "const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');",
    ...body,
    '',
  ].join('\n');
}

// --------------------------------------------------- AC1: the three halves ----

test('AC1: the live paths this tree carries are all namings, and the four reads T002 measured open none', (t) => {
  const report = archiveCheck();
  const rows = referenceRows();

  // The naming half, from the record's own row: the path is computed and held against an answer,
  // and nothing opens it.
  const named = rows.find(
    (row) => row.class === 'archived-by-the-move' && row.file === NAMING_SUITE,
  );
  assert.ok(
    named,
    `the record must carry the ${NAMING_SUITE} row that only names the live path`,
  );
  const namingRow = report.rows.find(
    (row) => row.file === named.file && row.line === named.line,
  );
  assert.ok(
    namingRow,
    `${named.file}:${named.line} is recorded and the check enumerates no reference there`,
  );
  assert.equal(namingRow.class, 'archived-by-the-move');
  assert.equal(
    namingRow.use,
    'naming',
    `${named.file}:${named.line} resolves the live path ${String(
      named.path,
    )} and only names it, so the check must record a naming rather than a read`,
  );
  assert.ok(
    namingRow.usedBy,
    'a clean row records the use it saw as well as a finding does',
  );
  assert.equal(
    namingRow.verdict,
    'clean',
    `a reference that names the live path is clean: reporting it would redden every milestone after its own archive`,
  );
  assert.equal(
    report.findings.some((finding) => finding.file === named.file),
    false,
    `${named.file} must not be reported, and it was`,
  );

  // The reading half the record measured, named rather than dropped: `scripts/navigation-capture.
  // test.mjs` built the live intent and copied it with `copyFileSync` at its own line 1763. T003
  // repaired that read, and it repaired it further than a resolver: that suite's own pin forbids a
  // claims suite from spelling the intent path at all, so it now asks
  // `scripts/verdict-claims-intent.mjs` for the answer and opens the file at that answer. The live
  // path is therefore not named by that suite any more, which is the strongest form of the fact this
  // half asserts: no live path of the archive move is named there, let alone read.
  const claimsSuite = READING_SUITE;
  assert.deepEqual(
    report.rows
      .filter(
        (row) =>
          row.file === claimsSuite && row.class === 'archived-by-the-move',
      )
      .map((row) => `${row.line} ${String(row.path)}`),
    [],
    `${claimsSuite} must name no live path of its own: the archive-or-live decision belongs to the shared resolver`,
  );
  assert.equal(
    readFileSync(join(ROOT, claimsSuite), 'utf8').includes(
      `${DOTTED}/intent/INTENT.md`,
    ),
    false,
    `${claimsSuite} must not spell the live intent path; it asks the shared resolver instead`,
  );
  assert.match(
    readFileSync(join(ROOT, claimsSuite), 'utf8'),
    /intentPathForMilestone\(ROOT, boundMilestone\(\)\)/,
    `${claimsSuite} must take the intent from the shared resolver`,
  );

  // The live reads T002 measured, each repaired to resolve the path rather than open it. Named one by
  // one, so a repair of two of the three cannot pass as a repair of the set.
  const repaired = [
    'scripts/autonomy-gaps.test.mjs',
    'scripts/docs-audit-disposition.test.mjs',
    'scripts/retired-suites.test.mjs',
  ];
  for (const file of repaired) {
    const live = report.rows.filter(
      (row) => row.file === file && row.class === 'archived-by-the-move',
    );
    assert.ok(
      live.length > 0,
      `${file} must still name the live path the archive move deletes, and the check recorded none`,
    );
    for (const row of live) {
      assert.equal(
        row.use,
        'naming',
        `${row.file}:${String(
          row.line,
        )} opens the live path ${String(row.path)}; T003's repair must resolve it instead`,
      );
      assert.equal(
        row.verdict,
        'clean',
        `${row.file}:${String(row.line)} resolves the path, so the check must record a clean row`,
      );
      for (const field of ['file', 'line', 'claim', 'class', 'use']) {
        assert.ok(
          row[field] !== null && row[field] !== undefined,
          `a row must carry ${field}: ${JSON.stringify(row)}`,
        );
      }
    }
  }

  // The check's own verdict on this tree: no finding at all, and a stated non-zero examined count.
  assert.deepEqual(
    report.findings.map((finding) => `${finding.file}:${String(finding.line)}`),
    [],
    `this milestone's tree must report no live read; the check reported ${report.findings
      .map(
        (finding) =>
          `${finding.file}:${String(finding.line)} ${String(finding.path)}`,
      )
      .join(', ')}`,
  );
  assert.ok(
    report.filesExamined > 0 && report.examined > 0,
    `the check must state what it examined: ${String(
      report.examined,
    )} live reference(s) in ${String(report.filesExamined)} suite(s)`,
  );
  t.diagnostic(
    `archivePaths: ${String(report.examined)} live reference(s) of ${String(
      report.referencesExamined,
    )} in ${String(report.filesExamined)} suite(s); findings: none; repaired: ${repaired.join(
      ', ',
    )}, ${claimsSuite} (asks the shared resolver)`,
  );
});

test('AC1: every class the record decided is the class the check derives, and no row diverges', () => {
  const report = archiveCheck();
  const rows = referenceRows();
  const at = new Map(report.rows.map((row) => [rowKey(row), row]));
  for (const row of rows) {
    assert.ok(
      at.has(rowKey(row)),
      `${row.file}:${row.line} is recorded and the check enumerates no reference there`,
    );
  }
  for (const row of rows.filter((entry) => entry.class !== 'undecided')) {
    const mine = at.get(rowKey(row));
    assert.equal(
      mine.class,
      row.class,
      `${row.file}:${row.line} is recorded ${row.class} and the check derives ${String(
        mine.class,
      )}`,
    );
  }
  // A suite that reads an archived path is clean whatever it does with it: the move writes that
  // path rather than deleting it.
  for (const mine of report.rows.filter(
    (row) => row.class === 'deliberate-archive-read',
  )) {
    assert.equal(
      mine.verdict,
      'clean',
      `${mine.file}:${mine.line} reads an archived path and must be clean`,
    );
  }

  // T002 recorded one divergence here: `scripts/navigation-capture.test.mjs:1595` was undecided in
  // the record - its reader stopped at `import.meta.url`, so a `const ROOT = join(HERE, '..')` root
  // looked like a directory the suite invented - while the check followed the binding and called the
  // row live. T003 repaired that read: the suite takes the intent from `verdict-claims-intent.mjs`
  // and names no live path at all, so the divergence is gone rather than moved. The assertion is the
  // stronger one now — no row at all is decided one way by the record and the other by the check.
  const diverged = rows
    .filter((row) => at.get(rowKey(row))?.class !== row.class)
    .map(
      (row) =>
        `${row.file}:${row.line} is recorded ${row.class} and the check derives ${String(
          at.get(rowKey(row))?.class,
        )}`,
    );
  assert.deepEqual(
    diverged,
    [],
    `the record and the check must decide every reference the same way: ${JSON.stringify(
      diverged,
    )}`,
  );

  // What closed it, named rather than assumed. The suite T002 left undecided names no live path any
  // more - nothing of the archive move's is left there to classify - and the live row T003 repointed
  // instead, the docs audit, is a whole-path literal the archive move deletes, decided the same way by
  // both readers.
  assert.deepEqual(
    report.rows
      .filter(
        (row) =>
          row.file === 'scripts/navigation-capture.test.mjs' &&
          row.class === 'archived-by-the-move',
      )
      .map((row) => `${row.line} ${String(row.path)}`),
    [],
    'the suite T002 left undecided must name no live path now, which is why the divergence closed rather than moved',
  );
  const repointed = report.rows.find(
    (row) =>
      row.file === 'scripts/docs-audit-disposition.test.mjs' &&
      row.path === `${DOTTED}/research/DOCS-AUDIT.md`,
  );
  assert.ok(
    repointed,
    `the docs audit T003 repointed must be enumerated: ${JSON.stringify(
      report.rows
        .filter((row) => row.file === 'scripts/docs-audit-disposition.test.mjs')
        .map((row) => `${row.line} ${String(row.path)}`),
    )}`,
  );
  assert.equal(repointed.class, 'archived-by-the-move');
  assert.equal(
    repointed.site,
    'path',
    'the repaired reference is a whole path literal the archive move deletes',
  );
  assert.equal(
    at.get(rowKey(repointed))?.class,
    repointed.class,
    'the record carries the class the check derives for the repaired row',
  );
});

test('AC1: a live read is a finding, a live naming is clean with its use, and an archived read is clean', async () => {
  const root = mkdtempSync(join(tmpdir(), 'm044-archive-paths-'));
  try {
    mkdirSync(join(root, 'scripts'), { recursive: true });
    mkdirSync(join(root, DOTTED, 'research'), { recursive: true });
    mkdirSync(join(root, DOTTED, 'archive', '001-fixture', 'research'), {
      recursive: true,
    });
    await writeFile(join(root, DOTTED, 'research', 'x.md'), 'the live note\n');
    await writeFile(
      join(root, DOTTED, 'archive', '001-fixture', 'research', 'x.md'),
      'the archived note\n',
    );
    // A path built segment by segment and read: the shape a literal grep misses.
    await writeFile(
      join(root, 'scripts', 'live.test.mjs'),
      fixtureSuite(
        `export const note = readFileSync(join(ROOT, '${DOTTED}', 'research', 'x.md'), 'utf8');`,
      ),
    );
    // The same path, named and never read.
    await writeFile(
      join(root, 'scripts', 'named.test.mjs'),
      fixtureSuite(
        `const note = join(ROOT, '${DOTTED}', 'research', 'x.md');`,
        'export const clean = String(note);',
      ),
    );
    // An archived path, read on purpose: the move writes this one rather than deleting it.
    await writeFile(
      join(root, 'scripts', 'archived.test.mjs'),
      fixtureSuite(
        `export const note = readFileSync(join(ROOT, '${DOTTED}', 'archive', '001-fixture', 'research', 'x.md'), 'utf8');`,
      ),
    );

    const report = checkArchivePaths({ root, milestone: LIVE_MILESTONE });
    assert.equal(
      report.filesExamined,
      3,
      `the check must state how many suites it examined: ${String(
        report.filesExamined,
      )}`,
    );
    assert.deepEqual(
      report.movedSubtrees,
      ['research'],
      'the relocated subtrees are derived from the archive directory the fixture carries',
    );
    assert.equal(report.referencesExamined, 3);
    assert.equal(
      report.examined,
      2,
      `the two references that resolve a live path are the ones examined: ${String(
        report.examined,
      )}`,
    );

    const live = report.rows.find(
      (row) => row.file === 'scripts/live.test.mjs',
    );
    assert.ok(live);
    assert.equal(
      live.claim,
      `${DOTTED}/research/x.md`,
      'the segment-built path is resolved, so the reference names the file and not the segment',
    );
    assert.equal(live.class, 'archived-by-the-move');
    assert.equal(live.use, 'read');
    assert.equal(live.verdict, 'finding');

    const naming = report.rows.find(
      (row) => row.file === 'scripts/named.test.mjs',
    );
    assert.ok(naming);
    assert.equal(naming.class, 'archived-by-the-move');
    assert.equal(naming.use, 'naming');
    assert.match(
      String(naming.usedBy),
      /String/,
      `the clean row records the use it saw: ${JSON.stringify(naming.usedBy)}`,
    );
    assert.equal(naming.verdict, 'clean');

    const archived = report.rows.find(
      (row) => row.file === 'scripts/archived.test.mjs',
    );
    assert.ok(archived);
    assert.equal(archived.class, 'deliberate-archive-read');
    assert.equal(archived.use, 'read');
    assert.equal(
      archived.verdict,
      'clean',
      'reading an archived path is not a reference the move can break',
    );

    assert.equal(report.findings.length, 1);
    assert.equal(report.findings[0]?.file, 'scripts/live.test.mjs');
    assert.equal(report.ok, false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ------------------------------------------------ AC3: nothing examined ----

test('AC3: the archive-path check reports examined 0 as a finding, for a move that deletes nothing and for a call with no input', () => {
  const empty = mkdtempSync(join(tmpdir(), 'm044-archive-empty-'));
  try {
    const report = checkArchivePaths({
      root: empty,
      milestone: LIVE_MILESTONE,
    });
    assert.equal(
      report.examined,
      0,
      `an archive move that relocates nothing examines zero live paths: ${String(
        report.examined,
      )}`,
    );
    assert.equal(
      report.ok,
      false,
      'a check that examined nothing must not report itself as passing',
    );
    assert.equal(report.findings.length, 1);
    assert.equal(report.findings[0]?.class, 'nothing-examined');
    assert.equal(report.findings[0]?.file, `${DOTTED}/archive`);
    assert.match(
      String(report.findings[0]?.reason),
      /carries no milestone directory/,
      'the refusal names the empty input it was pointed at',
    );
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }

  const bare = checkArchivePaths({});
  assert.equal(bare.examined, 0);
  assert.equal(bare.ok, false);
  assert.equal(bare.findings.length, 1);
  assert.equal(bare.findings[0]?.class, 'nothing-examined');
});

// ------------------------------------------------------ AC2: the fix record ----

test('AC2: M035 own range carries no nx.json, and the claim is a finding naming the task and the file', (t) => {
  const range = shipRange({ root: ROOT, milestone: '035' });
  assert.equal(range.error, '', `the range must derive: ${range.error}`);
  assert.match(
    range.range,
    /^[0-9a-f]{40}\.\.[0-9a-f]{40}$/,
    `the range is a pair of ship commits: ${range.range}`,
  );
  const report = checkFixRecord({
    root: ROOT,
    range: range.range,
    tasks: `${DOTTED}/archive/035-onpush-readiness/tasks`,
  });
  assert.ok(
    report.examined > 0,
    'the check must hold at least one claim against the range',
  );
  assert.ok(
    report.claims.some((claim) => claim.inTheRange),
    'a claim the range carries must not be reported absent, or the check would report every claim',
  );

  const claimed = report.findings.find((finding) => finding.file === 'nx.json');
  assert.ok(
    claimed,
    `M035's T006 claims nx.json and the range carries no such path; findings: ${JSON.stringify(
      report.findings.map((finding) => `${finding.task} ${finding.file}`),
    )}`,
  );
  assert.equal(claimed.task, 'T006');
  assert.equal(claimed.class, 'claim-absent-from-the-range');
  assert.deepEqual(
    claimed.statusesInTheRange,
    [],
    'the range fact is an empty status list for that path',
  );
  assert.equal(
    'cache' in claimed,
    false,
    'the check reports the range fact and never asserts the tree fact as its verdict',
  );
  assert.equal('tree' in report, false);
  assert.match(
    String(claimed.claim),
    /nx\.json/,
    `the finding carries the log line the claim was made on: ${String(claimed.claim)}`,
  );
  assert.match(
    String(claimed.taskFile),
    /T006-make-the-gate-measure-instead-of-remember\.md$/,
    'the finding names the task file the claim sits in as well as the file it claims',
  );
  t.diagnostic(
    `fixRecord: ${String(report.examined)} claim(s) from ${String(
      report.tasksExamined,
    )} task log(s) over ${String(report.range.changed)} changed path(s); ${String(
      report.findings.length,
    )} absent: ${report.findings
      .map((finding) => `${finding.task} ${finding.file}`)
      .join('; ')}`,
  );
});

test('AC2: a claim naming the new name of a rename is not reported absent, because a rename carries both names', () => {
  const pair = recorded().fixRecord.rename.recorded;
  const range = recorded().fixRecord.rename.range;
  assert.notEqual(pair.from, pair.to, 'the record carries a rename pair');
  const text = [
    '---',
    'id: T901',
    '---',
    '',
    '## Log',
    `- M044 says it moved \`${pair.from}\` to \`${pair.to}\``,
    '',
  ].join('\n');
  const report = checkFixRecord({
    root: ROOT,
    range,
    tasks: [{ id: 'T901', file: 'fixture/T901-rename.md', text }],
  });
  assert.ok(
    report.range.renames > 0,
    `the range must carry the rename the record measured: ${String(
      report.range.renames,
    )}`,
  );
  assert.equal(report.claimsExamined, 2);
  assert.deepEqual(
    report.claims.map((claim) => claim.inTheRange),
    [true, true],
    `a rename carries both of its names, so a claim about ${pair.from} and one about ${pair.to} are both true`,
  );
  assert.deepEqual(
    report.findings,
    [],
    'nothing is absent when the range carries both names of the rename',
  );
});

test('AC3: the fix-record check reports examined 0 as a finding, for an empty range and an empty task list', () => {
  const task = {
    id: 'T902',
    file: 'fixture/T902.md',
    text: '## Log\n- the gate now caches `nx.json`\n',
  };
  const emptyRange = checkFixRecord({
    root: ROOT,
    range: 'HEAD..HEAD',
    tasks: [task],
  });
  assert.equal(emptyRange.examined, 0);
  assert.equal(emptyRange.ok, false);
  assert.equal(emptyRange.findings.length, 1);
  assert.equal(emptyRange.findings[0]?.class, 'nothing-examined');
  assert.match(
    String(emptyRange.findings[0]?.reason),
    /carries no changed path/,
    'the refusal names the empty range it was pointed at',
  );

  const noTasks = checkFixRecord({
    root: ROOT,
    range: recorded().fixRecord.rename.range,
    tasks: [],
  });
  assert.equal(noTasks.examined, 0);
  assert.equal(noTasks.ok, false);
  assert.equal(noTasks.findings[0]?.class, 'nothing-examined');
  assert.match(
    String(noTasks.findings[0]?.reason),
    /no claim was compared/,
    'the refusal names the empty claim list it was pointed at',
  );

  const bare = checkFixRecord({});
  assert.equal(bare.examined, 0);
  assert.equal(bare.findings[0]?.class, 'nothing-examined');
});

// --------------------------------------------------------- AC4: the mutants ----

/**
 * A tree carrying one repaired suite as this head has it, and the same suite with the repair reverted
 * to the hardcoded live path T002 measured. The source is read out of this checkout, so the two forms
 * differ by the one change T003 made rather than by a fixture written to be caught: the repaired form
 * resolves whichever copy exists, the reverted form opens the live name — the shape AC6 says must
 * redden the check naming the file. The tree carries both copies of the audit the suite pins, so the
 * reverted form is a file that exists now and is deleted when the milestone archives.
 *
 * @returns {Promise<{ root: string, file: string, path: string, repaired: string, reverted: string }>}
 */
async function repairedFixture() {
  const root = mkdtempSync(join(tmpdir(), 'm044-gate-fixture-'));
  mkdirSync(join(root, 'scripts'), { recursive: true });
  mkdirSync(join(root, DOTTED, 'research'), { recursive: true });
  mkdirSync(join(root, DOTTED, 'archive', '001-fixture', 'research'), {
    recursive: true,
  });
  await writeFile(
    join(root, DOTTED, 'research', 'DOCS-AUDIT.md'),
    '# the live audit\n',
  );
  await writeFile(
    join(root, DOTTED, 'archive', '001-fixture', 'research', 'DOCS-AUDIT.md'),
    '# the archived audit\n',
  );

  const file = 'scripts/docs-audit-disposition.test.mjs';
  const repaired = readFileSync(join(ROOT, file), 'utf8');
  // The one line T003 changed in this suite, back to the hardcoded live read it replaced.
  const anchor = `const headAuditPath = resolveArtefact('${DOTTED}/research/DOCS-AUDIT.md');`;
  const reverted = repaired.replace(
    anchor,
    `const headAuditPath = join(repoRoot, '${DOTTED}', 'research', 'DOCS-AUDIT.md');`,
  );
  assert.notEqual(
    reverted,
    repaired,
    `the fixture must be able to revert the repair ${file} carries, and its source no longer carries ${JSON.stringify(
      anchor,
    )}`,
  );
  return {
    root,
    file,
    path: `${DOTTED}/research/DOCS-AUDIT.md`,
    repaired,
    reverted,
  };
}

/**
 * The archive-path check over one fixture tree with the named suite written into it.
 *
 * @param {{ root: string, file: string }} fixture
 * @param {string} source
 * @returns {Record<string, any>}
 */
async function checkFixture(fixture, source) {
  await writeFile(join(fixture.root, fixture.file), source);
  return checkArchivePaths({ root: fixture.root, milestone: LIVE_MILESTONE });
}

test('AC4: removing the use distinction reddens the archive-path check, naming the file and the path', async (t) => {
  const fixture = await repairedFixture();
  try {
    // The control: the repaired source the fixture was made from is clean over the same tree, so the
    // finding below is the reverted line and not a fixture that was caught whatever it said.
    const control = await checkFixture(fixture, fixture.repaired);
    assert.deepEqual(
      control.findings,
      [],
      `the repaired source must be clean over the fixture tree: ${JSON.stringify(
        control.findings.map((finding) => `${finding.file}:${finding.line}`),
      )}`,
    );

    const real = await checkFixture(fixture, fixture.reverted);
    const expected = real.findings.find(
      (finding) => finding.file === fixture.file,
    );
    assert.ok(
      expected,
      `the hardcoded live read must be a finding before the mutant is run; the check reported ${JSON.stringify(
        real.findings.map((finding) => `${finding.file}:${finding.line}`),
      )}`,
    );
    assert.equal(expected.use, 'read');
    assert.equal(expected.usedBy, 'readFileSync');
    assert.equal(expected.path, fixture.path);

    const mutated = checkArchivePaths({
      root: fixture.root,
      milestone: LIVE_MILESTONE,
      mutant: MUTANTS.archivePaths,
    });
    assert.equal(
      mutated.findings.filter(
        (finding) => finding.class === 'archived-by-the-move',
      ).length,
      0,
      'the mutant removes the naming/read distinction, so no live reference is a finding in it',
    );

    let message = '';
    try {
      const found = mutated.findings.find(
        (finding) =>
          finding.file === expected.file && finding.path === expected.path,
      );
      assert.ok(
        found,
        `the live path ${String(expected.path)} that ${expected.file}:${String(
          expected.line,
        )} reads with ${String(
          expected.usedBy,
        )} must be a finding; the mutant reported it clean because a naming and a read are no longer told apart`,
      );
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    t.diagnostic(`mutant failure: ${message}`);
    assert.match(
      message,
      new RegExp(escapeForRegExp(expected.file)),
      `the mutant must redden the check naming ${expected.file}; it produced ${JSON.stringify(
        message.slice(0, 240),
      )}`,
    );
    assert.match(
      message,
      new RegExp(escapeForRegExp(String(expected.path))),
      `the mutant must redden the check naming the path ${String(
        expected.path,
      )}; it produced ${JSON.stringify(message.slice(0, 240))}`,
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('AC4: treating a rename as absent reddens the fix-record check, naming the task and the file', (t) => {
  const pair = recorded().fixRecord.rename.recorded;
  const range = recorded().fixRecord.rename.range;
  const tasks = [
    {
      id: 'T903',
      file: 'fixture/T903.md',
      text: [
        '---',
        'id: T903',
        '---',
        '',
        '## Log',
        `- the archive move put it at \`${pair.to}\``,
        '',
      ].join('\n'),
    },
  ];
  const clean = checkFixRecord({ root: ROOT, range, tasks });
  assert.deepEqual(
    clean.findings,
    [],
    'the untouched check must pass first: the range carries the new name of the rename',
  );

  const mutated = checkFixRecord({
    root: ROOT,
    range,
    tasks,
    mutant: MUTANTS.fixRecord,
  });
  let message = '';
  try {
    assert.deepEqual(
      mutated.findings,
      [],
      `the claim names the new name of the rename ${pair.to}, which the range carries`,
    );
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  t.diagnostic(`mutant failure: ${message}`);
  assert.match(
    message,
    /T903/,
    `the mutant must redden the check naming the task; it produced ${JSON.stringify(
      message.slice(0, 240),
    )}`,
  );
  assert.match(
    message,
    new RegExp(escapeForRegExp(pair.to)),
    `the mutant must redden the check naming the file the claim names; it produced ${JSON.stringify(
      message.slice(0, 240),
    )}`,
  );
});

// ------------------------------------ AC6: this tree, and one reverted repair ----

test('AC6: this tree is clean with a non-zero examined count, and one reverted repair reddens it naming the file', async (t) => {
  const fixture = await repairedFixture();
  try {
    // This milestone's own tree: the four live reads T002 measured now resolve the path, so the
    // check reports no finding and still says how much it examined.
    const report = archiveCheck();
    assert.deepEqual(
      report.findings,
      [],
      `this tree must report no live read: ${JSON.stringify(
        report.findings.map(
          (finding) =>
            `${finding.file}:${finding.line} ${String(finding.path)} read by ${String(finding.usedBy)}`,
        ),
      )}`,
    );
    assert.equal(report.ok, true);
    assert.ok(
      report.examined > 0,
      `the check must examine a non-zero number of live references on this tree: ${String(
        report.examined,
      )}`,
    );

    // The mutant AC6 names: one of the four repairs restored to the hardcoded live path. The check
    // must redden on it and name the file, the path and the call that reads it.
    const reverted = await checkFixture(fixture, fixture.reverted);
    assert.equal(
      reverted.ok,
      false,
      'the check must redden on a suite that reads the live name, which is the defect SC1 is written about',
    );
    const finding = reverted.findings.find((one) => one.file === fixture.file);
    assert.ok(
      finding,
      `the reverted repair must be a finding naming ${fixture.file}; the check reported ${JSON.stringify(
        reverted.findings.map((one) => `${one.file}:${one.line}`),
      )}`,
    );
    assert.equal(finding.class, 'archived-by-the-move');
    assert.equal(finding.use, 'read');
    assert.equal(finding.usedBy, 'readFileSync');
    assert.match(
      String(finding.reason),
      /deleted when the milestone archives/,
      `the finding must say why the path is a defect: ${String(finding.reason)}`,
    );
    assert.match(
      String(finding.reason),
      /throws the moment the path is gone/,
      `the finding must say what the read does: ${String(finding.reason)}`,
    );
    t.diagnostic(
      `AC6 mutant: ${finding.file}:${String(finding.line)} ${String(
        finding.path,
      )} read by ${String(finding.usedBy)} at line ${String(
        finding.useLine,
      )} - ${String(finding.reason)}`,
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

// ---------------------------------------------- AC2: the gate's exit codes ----

test('AC2: a red check reaches the gate as a refusal, and this milestone’s own tree passes it', async (t) => {
  const fixture = await repairedFixture();
  try {
    // This milestone's own tree: both stages run, both are clean, and the run says what it examined.
    const clean = gate({ root: ROOT, milestone: LIVE_MILESTONE });
    assert.equal(
      clean.code,
      0,
      `the gate must exit zero on this milestone's own tree: ${clean.lines.join(' | ')}`,
    );
    assert.equal(clean.ok, true);
    assert.ok(
      clean.archive?.examined > 0,
      `the archive-path stage must state a non-zero examined count: ${clean.lines.join(' | ')}`,
    );
    assert.ok(
      clean.fix?.examined > 0,
      `the fix-record stage must hold a non-zero claim count against the range: ${clean.lines.join(' | ')}`,
    );
    assert.match(
      String(clean.range),
      /^[0-9a-f]{40}\.\.[0-9a-f]{40}$/,
      `the gate must derive the range it is held to: ${String(clean.range)}`,
    );

    // The fixture resolving an archived-then-deleted path: the reverted repair is written into it
    // first, so the tree the gate is pointed at carries a suite that opens the live name.
    await writeFile(join(fixture.root, fixture.file), fixture.reverted);
    const red = gate({
      root: fixture.root,
      milestone: LIVE_MILESTONE,
      check: 'archive',
    });
    assert.equal(
      red.code,
      1,
      `a finding must reach the gate as a non-zero exit: ${red.lines.join(' | ')}`,
    );
    assert.equal(red.ok, false);
    const refusal = red.lines.find((line) =>
      line.startsWith('gate-integrity: refusal '),
    );
    assert.ok(
      refusal,
      `the refusal must be printed as a refusal line: ${red.lines.join(' | ')}`,
    );
    assert.match(
      refusal,
      new RegExp(escapeForRegExp(fixture.file)),
      `the refusal must name the file it reddens on: ${refusal}`,
    );
    assert.match(
      refusal,
      new RegExp(escapeForRegExp(fixture.path)),
      `the refusal must name the path it reddens on: ${refusal}`,
    );

    // An argument the gate cannot run with is a refusal of its own: exit 2, not a pass and not a
    // finding, so a typo cannot be mistaken for a clean tree.
    assert.equal(
      gate({ root: ROOT, milestone: LIVE_MILESTONE, check: 'nonsense' }).code,
      0,
      'an unknown --check falls back to both stages rather than measuring nothing',
    );
    const before = process.stdout.write;
    process.stdout.write = () => true;
    let usage = 0;
    try {
      usage = main(['--check', 'nonsense']);
    } finally {
      process.stdout.write = before;
    }
    assert.equal(
      usage,
      2,
      '--check nonsense must be exit 2: the gate cannot run a stage it does not have',
    );

    t.diagnostic(
      `AC2: clean exit ${String(clean.code)} on this tree (${String(
        clean.archive?.examined,
      )} live reference(s), ${String(
        clean.fix?.examined,
      )} claim(s) over ${String(clean.range)}); refused exit ${String(
        red.code,
      )} on the fixture with ${refusal ?? 'no refusal line'}`,
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

// ------------------------------- AC7: a claim is what the task declares ----

test('AC7: a log token is a claim only where its task declares it, and claims: log still reports nx.json', (t) => {
  // The gate's own derivation of the range this milestone has written so far, so no range is
  // remembered here: `gate` reads it from the previous ship commit to this head.
  const declaredRun = gate({
    root: ROOT,
    milestone: LIVE_MILESTONE,
    check: 'fix-record',
  });
  assert.equal(
    declaredRun.code,
    0,
    `the gate's declared run must be clean over M044's own tasks: ${declaredRun.lines.join(' | ')}`,
  );
  const declared = declaredRun.fix;
  assert.equal(
    declared.claimsMode,
    'declared',
    'the gate wires the fix-record check with claims: declared',
  );
  assert.ok(
    declared.examined > 0,
    `the run must hold a non-zero number of claims: ${declaredRun.lines.join(' | ')}`,
  );
  assert.deepEqual(
    declared.findings,
    [],
    `no claim a task declares may be absent from the range: ${JSON.stringify(
      declared.findings.map((finding) => `${finding.task} ${finding.file}`),
    )}`,
  );
  assert.ok(
    declared.mentions.length > 0,
    'the run must record the tokens its tasks do not declare as mentions rather than dropping them',
  );
  const mentionedNx = declared.mentions.find(
    (mention) => mention.file === CLAIMED_PATH,
  );
  assert.ok(
    mentionedNx,
    `M044's own T001 names ${CLAIMED_PATH} while measuring M035, so it must be a mention: ${JSON.stringify(
      declared.mentions.map((mention) => `${mention.task} ${mention.file}`),
    )}`,
  );
  assert.equal(mentionedNx.task, 'T001');
  assert.match(
    String(mentionedNx.reason),
    /does not declare it/,
    `a mention must state why it is not judged: ${String(mentionedNx.reason)}`,
  );
  for (const mention of declared.mentions) {
    assert.ok(
      mention.task !== '' && mention.file !== '' && mention.at !== '',
      `a mention must name the task, the file and the line it sits at: ${JSON.stringify(mention)}`,
    );
  }

  // The same run with the export's default: the mention becomes a claim, and it is absent.
  const loggedRun = gate({
    root: ROOT,
    milestone: LIVE_MILESTONE,
    check: 'fix-record',
    claims: 'log',
  });
  assert.equal(
    loggedRun.code,
    1,
    `the log-mode run must refuse on M044's own tasks: ${loggedRun.lines.join(' | ')}`,
  );
  assert.equal(
    loggedRun.fix.claimsMode,
    'log',
    'claims: log must stay the export default the gate can ask for',
  );
  const claimed = loggedRun.fix.findings.find(
    (finding) => finding.file === CLAIMED_PATH,
  );
  assert.ok(
    claimed,
    `the log-mode run must still report ${CLAIMED_PATH}: ${JSON.stringify(
      loggedRun.fix.findings.map(
        (finding) => `${finding.task} ${finding.file}`,
      ),
    )}`,
  );
  assert.equal(claimed.task, 'T001');
  assert.equal(claimed.class, 'claim-absent-from-the-range');
  assert.deepEqual(
    loggedRun.fix.mentions,
    [],
    'claims: log judges every path-like token, so it records no mention',
  );
  t.diagnostic(
    `AC7: declared ${String(declared.examined)} claim(s) and ${String(
      declared.mentions.length,
    )} mention(s), 0 absent; log ${String(
      loggedRun.fix.examined,
    )} claim(s), ${String(loggedRun.fix.findings.length)} absent (${CLAIMED_PATH} among them)`,
  );
});

/**
 * A value as JSON with its object keys in one order. A count map is compared by the counts it
 * carries, never by the order its keys were inserted: `sites` is built in the order the references
 * are met, and `git ls-files` lists an untracked file ahead of the staged ones, so a checkout that
 * carries this suite untracked and one that carries it committed record the same counts in two
 * orders. The counts are the measurement; the insertion order is a property of the run. Declared
 * here rather than above, because the record pins the line numbers of this file's references.
 *
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  return JSON.stringify(value, (_key, inner) =>
    isObject(inner)
      ? Object.fromEntries(
          Object.keys(inner)
            .sort()
            .map((key) => [key, inner[key]]),
        )
      : inner,
  );
}
