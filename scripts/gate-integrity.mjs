// @ts-check
//
// M044 T002 - the two gate checks, exported through one seam (INTENT.md SC1, SC2; T002's AC1-AC4).
//
// Both checks answer the same shape - `{ examined, findings[] }` - and both refuse an empty input by
// returning a `nothing-examined` finding rather than an empty list, because the failure mode this
// milestone exists to remove is a check that passes over nothing. Neither has a CLI: the gate that
// invokes them is T003's, and this file stays a library so its callers decide what a finding means.
//
//   checkArchivePaths  A milestone's archive move relocates `.project/<subtree>` into
//                      `.project/archive/<NNN>-<slug>/<subtree>`, so every reference to a file under a
//                      relocated subtree names a path that path is deleted when the milestone ships.
//                      A reference that *names* such a path survives that; a reference that *reads* one
//                      does not. So the rule decides on the use of the path, not on its presence in the
//                      file: `scripts/performance-capture.test.mjs:1978` builds
//                      `join(ROOT, '.project', 'intent', 'INTENT.md')` and holds it against the
//                      resolver's answer with `assert.notEqual`, while
//                      `scripts/navigation-capture.test.mjs:1595` binds the same path to `LIVE_INTENT`
//                      and `:1763` copies it with `copyFileSync`. Both name the path; only the second
//                      reads it, and only the second throws the moment the move deletes it. A check
//                      that flagged both would redden every milestone after its own archive and be
//                      switched off.
//
//                      The relocated subtrees are derived from the archive directory's own milestone
//                      directories, the milestone and its archive destination from `.project/STATE.md`,
//                      and the live files the move deletes from the working tree the check stands in.
//                      References are enumerated by walking `scripts/`, `extension/` and `apps/` rather
//                      than by asking git, because a walk reads a tree that git may not have staged yet
//                      and it reads a root that is not a repository at all - which is what lets the
//                      suite point the check at a fixture and observe the refusal.
//
//   checkFixRecord     A task log's `## Log` claims file changes. The range a milestone owns is the
//                      one git records for it (`git diff --name-status -M <range>`), and a claim the
//                      range does not carry is a finding naming the task and the file. A rename is
//                      treated as both of its names, so a claim naming the new name is not reported
//                      absent - the range says a path moved from one name to the other, and a claim
//                      about either name is true. The measured instance is M035's T006, which claims
//                      an `nx.json` cache fix the M035 range does not carry; the tree still sets
//                      `"cache": true` for `@angular/build:unit-test`, and that tree fact is *not*
//                      this check's verdict - the check reports the range fact.
//
//   shipRange          The derivation of `checkFixRecord`'s `range` input: the previous milestone's
//                      ship commit and this milestone's own, read from `git log` rather than written
//                      here, so no caller feeds the check a range it remembered.
//
//   workRange          The range the gate holds a stage to at the head it runs on: `<base>..<head>`,
//                      with the base answered by the first rule that can (`mode` names which) and the
//                      head this tree's `HEAD` unless the caller names a commit (`headMode` names
//                      which). A recording pins the base its own capture used, so a re-run compares
//                      against that base rather than against whatever HEAD now prefers; otherwise the
//                      base is the numerically previous milestone's ship commit, and when that id is
//                      unshipped - milestones ship in id order, not numeric order - the newest ship
//                      commit `git log` carries. Only a git log with no ship commit at all refuses,
//                      and a refusal names the rule that failed. The head is HEAD for a live run: a
//                      range that switched to this milestone's own ship commit the moment it appeared
//                      would derive one answer before the shipment and another after it. A recording
//                      names the commit it was measured at instead, because a range ending at HEAD
//                      moves the moment the commit carrying the recording lands - the derivation then
//                      disagrees with the head it pinned, and a re-capture re-pins the previous head
//                      for the next commit to move.
//
//   the gate           `node scripts/gate-integrity.mjs` runs both checks over the tree it stands in
//                      and exits 0 only when both are clean, so a red check reaches a CI or ship step
//                      as a refusal rather than as output beside a passing gate. Exit 0 is clean, 1 is
//                      a finding or a refusal, and 2 is an argument the gate cannot derive its own
//                      input from. `--check archive|fix-record|both` selects a stage,
//                      `--root`/`--milestone`/`--range`/`--base`/`--head`/`--tasks`/`--claims` supply
//                      the inputs, and `--json` prints the two reports instead of the reading. `--base`
//                      is the base a recording names, `--head` the commit it was measured at rather
//                      than this tree's HEAD, and the run prints the rule that answered so a reader
//                      sees which base the range starts from and which commit it ends at.
//                      `gate(input)` is the same run without printing, so a suite can hold it to an
//                      exit code without spawning a second process. With no `--tasks`, the fix-record
//                      stage reads `defaultTaskInput(root, milestone)`: the milestone's own archived
//                      `tasks/` when that archive holds a task file, so `--milestone M044` examines
//                      M044's archived logs rather than the logs of whatever milestone is being built
//                      beside them, and the live `.project/tasks` otherwise - a milestone with no
//                      archive still reads the live directory it is being built in, and a tree with
//                      no task file anywhere answers that same live path, so an emptied tree still
//                      refuses `nothing-examined` rather than passing over nothing. The reading line
//                      names the milestone the examined logs belong to, so `of .project/tasks` cannot
//                      be read as the logs of a milestone that has archived.
//
// A claim, and what is not one. `checkFixRecord` reads every path-like token in a task's `## Log`.
// With `claims: 'log'` - the export's default, and what T002's tests were written against - each
// token is a claim held against the range. With `claims: 'declared'`, a token is a claim only when
// that task's own `files:` front matter lists the path; every other token is recorded in `mentions`
// and printed rather than judged, because a log line narrates a milestone while a `files:` list
// states what the task changed. The gate runs `declared`, so a mention of another milestone's path
// (M035's `nx.json`, named in M044's own T001 log while measuring it) is named and not reported.
//
// Three mutants ship with the code, each a real branch rather than a decoration (T002's AC4, T003's
// E8): `MUTANTS.archivePaths` removes the naming/read distinction so a live reference reads clean,
// `MUTANTS.fixRecord` treats a rename as its old name only, so a claim naming the new name is
// reported absent, and `MUTANTS.workRange` restores the numeric-predecessor rule, so every milestone
// whose numerically previous id is unshipped stops instead of falling back to the newest ship commit.
// The suite drives each one and quotes the failure it produces.
//
// What a run does: it reads files and spawns one read-only `git` per range. It writes nothing, opens
// no browser and binds no port.

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

/** The `.project` directory, in the repository's own spelling. */
const PROJECT = '.project';

/** The subtrees a scan walks. A suite outside these is not one the gate owns. */
const SCAN_ROOTS = ['scripts', 'extension', 'apps'];

/** The directories a scan never descends into: build output and dependency trees carry no suite. */
const PRUNE = new Set([
  '.angular',
  '.git',
  '.nx',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out-tsc',
]);

/** What a suite is called: a basename carrying `.test.` or `.spec.` before its extension. */
const SUITE = /\.(test|spec)\.(mjs|cjs|js|mts|ts)$/;

/** The classes a resolved reference may carry, in the words T001's record uses. */
const CLASSES = [
  'archived-by-the-move',
  'deliberate-archive-read',
  'undecided',
];

/** The class of a refusal: a check that examined nothing, which is never a pass. */
export const NOTHING_EXAMINED = 'nothing-examined';

/**
 * The mutants this module ships, one per check. Each names a branch inside its check, so the mutant
 * is the code path a regression would take rather than a fixture beside it.
 */
export const MUTANTS = Object.freeze({
  archivePaths: 'archive-paths-ignore-use',
  fixRecord: 'fix-record-drop-renames',
  workRange: 'work-range-numeric-predecessor',
});

/**
 * The calls the rule counts as reads of a resolved path: a call that opens, copies, stats or tests
 * existence on it. The promise forms carry the same name without the `Sync` suffix. Anything else is
 * a naming - including a project-local helper such as `readText`, which takes a path and does
 * whatever its body does, because measuring that body is a different measurement than this one.
 */
const READ_CALLS = new Set([
  'copyFile',
  'copyFileSync',
  'createReadStream',
  'exists',
  'existsSync',
  'lstat',
  'lstatSync',
  'open',
  'openSync',
  'readFile',
  'readFileSync',
  'stat',
  'statSync',
]);

/** The calls that only build a path, so the value flows outward from them to whatever uses it. */
const PATH_BUILDERS = new Set(['dirname', 'join', 'normalize', 'resolve']);

/** A token a `## Log` line names as a path, by the shape of the name rather than by a list. */
const PATH_LIKE =
  /^[\w@.-]+(?:[/\\][\w@.-]+)*\.(?:mjs|cjs|js|mts|ts|json|md|html|css)$/;

// ---------------------------------------------------------------- helpers ----

/** @param {unknown} value @returns {boolean} */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** @param {string} path @returns {string} */
function displayPath(path) {
  return path.split(sep).join('/');
}

/** @param {string} text @returns {string} */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
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
 * A refusal: the shape both checks return when the input they were pointed at carried nothing to
 * decide. It is a finding rather than an empty list, so a caller that gates on `findings.length`
 * refuses rather than passing.
 *
 * @param {{ file: string, claim: string, reason: string }} input
 * @returns {Record<string, any>}
 */
function refusal({ file, claim, reason }) {
  return {
    file,
    line: 0,
    claim,
    path: null,
    site: 'input',
    class: NOTHING_EXAMINED,
    use: 'no-path',
    usedBy: null,
    useLine: 0,
    verdict: 'finding',
    reason,
  };
}

/**
 * One read-only git invocation. The only process either check spawns.
 *
 * @param {string} root
 * @param {string[]} args
 * @returns {{ ok: boolean, out: string, error: string }}
 */
function git(root, args) {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  if (result.error) {
    return { ok: false, out: '', error: result.error.message };
  }
  if (result.status !== 0) {
    return {
      ok: false,
      out: '',
      error: `git ${args.join(' ')} exited ${String(result.status)}: ${String(
        result.stderr,
      ).trim()}`,
    };
  }
  return { ok: true, out: String(result.stdout), error: '' };
}

// --------------------------------------------------- measurement 1: the lexer ----
//
// The one T001 measured the tree with, so the two files read a suite the same way. A `.project`
// inside a string is a path a suite expresses; inside a comment or a regular expression it is prose.

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
 * literal it carries. Quotes inside regexes and `//` inside regexes are what make a naive scan
 * mis-read the rest of a file, so both are tracked.
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
 * The innermost `(` or `[` still open where a position sits, so a `join(` spread over four lines is
 * cited by the line that opens it and the use of its value is read from the call that encloses it.
 * Answers -1 when nothing is open.
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
 * resolves into, the directory one level above it, and whatever a `dirname` or a `join(..., '..')`
 * is built from those. Derived from the file's own text, because `ROOT` in one suite is `repoRoot`
 * in another and a list of names written here would go stale. The two hops matter:
 * `const HERE = dirname(fileURLToPath(import.meta.url))` then `const ROOT = join(HERE, '..')` is how
 * most of these suites spell the repository root, and a reader that stopped at `import.meta.url`
 * would record that root as a directory the suite invented.
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
    for (const match of text.matchAll(
      /const\s+([A-Za-z_$][\w$]*)\s*=\s*dirname\(\s*([A-Za-z_$][\w$]*)\s*\)/g,
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
 * `comment`, `pattern`, `bare`). `at` is the index of the reference in the source, which is what the
 * use of the path is read from.
 *
 * @param {string} file
 * @param {string} text
 * @returns {Array<{ file: string, line: number, at: number, path: string | null, site: string, root?: string | null, construct?: string }>}
 */
function referencesIn(file, text) {
  const { modes, literals } = lexSource(text);
  const byQuote = new Map(literals.map((entry) => [entry.start - 1, entry]));
  /** @type {Array<{ file: string, line: number, at: number, path: string | null, site: string, root?: string | null, construct?: string }>} */
  const found = [];
  PROJECT_TOKEN.lastIndex = 0;
  let match;
  while ((match = PROJECT_TOKEN.exec(text)) !== null) {
    const at = match.index;
    const line = lineOfIndex(text, at);
    if (text[at] === '\\') {
      found.push({ file, line, at, path: null, site: 'pattern' });
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
        at,
        path: null,
        site: mode === 'code' ? 'bare' : 'comment',
      });
      continue;
    }
    const raw = text.slice(literal.start, literal.end);
    const tail = raw.slice(at - literal.start);
    const leading = /^\.project(?:\/[A-Za-z0-9_.@+-]+)*/.exec(tail)?.[0] ?? '';
    if (leading === '') {
      found.push({ file, line, at, path: null, site: 'bare' });
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
        at,
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
      at,
      path: leading.replace(/\/+$/, '') || '.project',
      site,
    });
  }
  return found;
}

// ------------------------------------------------- measurement 1: the use ----

/**
 * The call whose argument list opens at `open`: its name and the index the name starts at, so the
 * caller can ask what encloses the callee itself. `null` when the bracket is not a call (a grouped
 * expression, a keyword's condition, a block).
 *
 * @param {string} text
 * @param {number} open
 * @returns {{ name: string, at: number } | null}
 */
function calleeBefore(text, open) {
  const before = text.slice(0, open);
  const match = /([A-Za-z_$][\w$]*)\s*$/.exec(before);
  if (match === null) return null;
  const name = match[1] ?? '';
  // A keyword is not a callee: `if (`, `return (`, `await (` and their kin open a group, not a call.
  if (
    REGEX_KEYWORDS.has(name) ||
    ['await', 'catch', 'for', 'if', 'switch', 'while'].includes(name)
  ) {
    return null;
  }
  return { name, at: before.length - name.length };
}

/**
 * The declarator whose value ends where `index` begins: `const NAME = |`, `let NAME = |`.
 *
 * @param {string} text
 * @param {number} index
 * @returns {{ name: string, at: number } | null}
 */
function declaratorName(text, index) {
  const before = text.slice(0, index);
  const match = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*$/.exec(before);
  if (match === null) return null;
  const name = match[1] ?? '';
  return { name, at: match.index + match[0].indexOf(name) };
}

/**
 * What the path one reference resolves is used for. The one question the archive-path rule needs
 * answered, walked outward from the reference: a read call takes it, a path builder passes it on, a
 * declarator binds it to a name whose own uses are read the same way, and everything else - a
 * comparison, a diagnostic, a call that is not a read - is a naming.
 *
 * @param {string} text
 * @param {string[]} modes
 * @param {number} at
 * @returns {{ use: 'read' | 'naming', usedBy: string | null, useLine: number }}
 */
function useOf(text, modes, at) {
  return climbUse(text, modes, at, 0);
}

/**
 * One hop of `useOf`, bounded so a binding that names itself cannot loop.
 *
 * @param {string} text
 * @param {string[]} modes
 * @param {number} at
 * @param {number} depth
 * @returns {{ use: 'read' | 'naming', usedBy: string | null, useLine: number }}
 */
function climbUse(text, modes, at, depth) {
  const line = lineOfIndex(text, at);
  if (depth > 3) {
    return { use: 'naming', usedBy: 'unresolved', useLine: line };
  }
  const open = opening(text, modes, at);
  if (open < 0) {
    const declared = declaratorName(text, at);
    if (declared !== null) {
      return throughBinding(text, modes, declared, depth);
    }
    return { use: 'naming', usedBy: 'module-scope', useLine: line };
  }
  if (text[open] === '[') {
    const declared = declaratorName(text, open);
    if (declared !== null) {
      return throughBinding(text, modes, declared, depth);
    }
    return { use: 'naming', usedBy: 'list', useLine: line };
  }
  const callee = calleeBefore(text, open);
  if (callee === null) {
    return { use: 'naming', usedBy: 'group', useLine: line };
  }
  if (READ_CALLS.has(callee.name)) {
    return { use: 'read', usedBy: callee.name, useLine: line };
  }
  if (PATH_BUILDERS.has(callee.name)) {
    // A builder passes the value outward: either into the declarator it initialises, or into the
    // call that encloses it.
    const declared = declaratorName(text, callee.at);
    if (declared !== null) {
      return throughBinding(text, modes, declared, depth);
    }
    return climbUse(text, modes, callee.at, depth + 1);
  }
  return { use: 'naming', usedBy: callee.name, useLine: line };
}

/**
 * The uses of one binding: every place the file names it outside its own declaration. The value is
 * read if any use reads it, and otherwise it is named where its first use sits.
 *
 * @param {string} text
 * @param {string[]} modes
 * @param {{ name: string, at: number }} declared
 * @param {number} depth
 * @returns {{ use: 'read' | 'naming', usedBy: string | null, useLine: number }}
 */
function throughBinding(text, modes, declared, depth) {
  const pattern = new RegExp(`\\b${escapeForRegExp(declared.name)}\\b`, 'g');
  /** @type {Array<{ use: 'read' | 'naming', usedBy: string | null, useLine: number }>} */
  const uses = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index === declared.at) continue;
    // A property access is a different binding; a spread (`...NAME`) is this one.
    if (
      text[match.index - 1] === '.' &&
      text.slice(Math.max(0, match.index - 3), match.index) !== '...'
    ) {
      continue;
    }
    if (modes[match.index] !== 'code') continue;
    uses.push(climbUse(text, modes, match.index, depth + 1));
  }
  const read = uses.find((entry) => entry.use === 'read');
  if (read !== undefined) return read;
  if (uses.length > 0)
    return uses[0] ?? { use: 'naming', usedBy: null, useLine: 0 };
  return {
    use: 'naming',
    usedBy: `${declared.name} (bound, never used)`,
    useLine: lineOfIndex(text, declared.at),
  };
}

// ---------------------------------------- measurement 1: the archive move ----

/**
 * The subtrees the archive move relocates, derived from the repository's own archives: every
 * directory name any `.project/archive/<NNN>-<slug>/` carries. `MANIFEST.md` is not in the set
 * because it is a file the move writes there rather than a live subtree it moves, which is why the
 * derivation asks for directories and not for entries.
 *
 * @param {string} root
 * @returns {{ archiveDir: string, archives: string[], subtrees: string[] }}
 */
function movedSubtrees(root) {
  const archiveDir = displayPath(join(PROJECT, 'archive'));
  const absolute = join(root, PROJECT, 'archive');
  /** @type {string[]} */
  const archives = [];
  /** @type {Set<string>} */
  const subtrees = new Set();
  if (!existsSync(absolute)) return { archiveDir, archives, subtrees: [] };
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    archives.push(entry.name);
    for (const inner of readdirSync(join(absolute, entry.name), {
      withFileTypes: true,
    })) {
      if (inner.isDirectory()) subtrees.add(inner.name);
    }
  }
  return {
    archiveDir,
    archives: archives.sort(),
    subtrees: [...subtrees].sort(),
  };
}

/**
 * The milestone `.project/STATE.md` binds, and the archive destination that milestone's own move
 * writes. Read from the file's front matter rather than written here, so the check follows the
 * project rather than a constant.
 *
 * @param {string} root
 * @returns {{ path: string | null, milestone: string | null, name: string | null, branch: string | null, archive: string | null }}
 */
function readState(root) {
  const absolute = join(root, PROJECT, 'STATE.md');
  /** @type {{ path: string | null, milestone: string | null, name: string | null, branch: string | null, archive: string | null }} */
  const state = {
    path: null,
    milestone: null,
    name: null,
    branch: null,
    archive: null,
  };
  if (!existsSync(absolute)) return state;
  state.path = displayPath(join(PROJECT, 'STATE.md'));
  const text = stripBom(readFileSync(absolute, 'utf8'));
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? '';
  /** @param {string} name @returns {string | null} */
  const field = (name) => {
    const line =
      new RegExp(`^${name}:[ \\t]*(.*)$`, 'm').exec(front)?.[1] ?? '';
    const value = line.replace(/\s+#.*$/, '').trim();
    return value === '' ? null : value;
  };
  state.name = field('milestone');
  state.branch = field('branch');
  state.archive = field('archive');
  state.milestone =
    /gsd-path\/(M\d{3})\b/.exec(state.branch ?? '')?.[1] ??
    /^(M\d{3})\b/.exec(state.name ?? '')?.[1] ??
    null;
  return state;
}

/**
 * The archive destination one milestone's move writes: `<NNN>-<slug>`, with the number from the
 * milestone id and the slug from the name `.project/STATE.md` binds.
 *
 * @param {string | null} milestone
 * @param {string | null} name
 * @returns {string | null}
 */
function archiveDestination(milestone, name) {
  const digits = /^M?(\d{3})$/.exec(milestone ?? '')?.[1];
  if (digits === undefined || name === null) return null;
  return `${digits}-${name}`;
}

/**
 * Every file the move deletes: the files under `.project/<subtree>` for each relocated subtree.
 *
 * @param {string} root
 * @param {string[]} subtrees
 * @returns {Record<string, number>}
 */
function liveFiles(root, subtrees) {
  /** @type {Record<string, number>} */
  const counts = {};
  for (const subtree of subtrees) {
    let count = 0;
    /** @param {string} dir @returns {void} */
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) walk(join(dir, entry.name));
        else if (entry.isFile()) count += 1;
      }
    };
    const absolute = join(root, PROJECT, subtree);
    if (existsSync(absolute)) walk(absolute);
    counts[subtree] = count;
  }
  return counts;
}

/**
 * Every suite under the scan roots, as repository-relative paths with `/` separators, sorted. A walk
 * rather than `git ls-files`, because a walk reads a file this head carries whether or not it is
 * staged, and it reads a root that is not a repository - which is what lets a fixture be checked.
 *
 * @param {string} root
 * @returns {string[]}
 */
function listSuites(root) {
  /** @type {string[]} */
  const suites = [];
  /** @param {string} dir @param {string} rel @returns {void} */
  const walk = (dir, rel) => {
    /** @type {import('node:fs').Dirent[]} */
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const next = rel === '' ? entry.name : `${rel}/${entry.name}`;
      if (entry.isDirectory()) {
        if (!PRUNE.has(entry.name)) walk(join(dir, entry.name), next);
        continue;
      }
      if (entry.isFile() && SUITE.test(entry.name)) suites.push(next);
    }
  };
  for (const scan of SCAN_ROOTS) walk(join(root, scan), scan);
  return suites.sort();
}

/**
 * One reference's class against one archive move, with the reason for it: whether the path it
 * resolves sits under a subtree the move relocates (deleted when the milestone ships), inside
 * `.project/archive` (a deliberate archive read), or neither. A path built segment by segment is
 * this repository's only when the root it is built on is the module root that file binds.
 *
 * @param {{ path: string | null, site: string, root?: string | null, construct?: string }} reference
 * @param {{ subtrees: string[] }} moved
 * @param {Set<string>} roots
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
        ? 'is spelled as a path prefix in a list with no root argument, so nothing resolves it from this repository root'
        : 'is built with no root argument, so it resolves against whatever directory the process is standing in rather than this repository root';
  return {
    class: 'undecided',
    reason: `${where}, and the archive move deletes nothing it names here - .project/${subtree} is a subtree the move relocates, but not this path`,
  };
}

/**
 * The archive-path check (SC1; AC1, AC3, AC4).
 *
 * @param {{ root?: string, milestone?: string, mutant?: string | null }} [input]
 * @returns {Record<string, any>}
 */
export function checkArchivePaths(input = {}) {
  const root = typeof input.root === 'string' ? resolve(input.root) : null;
  const milestone =
    typeof input.milestone === 'string' && input.milestone.trim() !== ''
      ? input.milestone.trim().toUpperCase()
      : null;
  const mutant = input.mutant ?? null;
  const empty = {
    examined: 0,
    referencesExamined: 0,
    filesExamined: 0,
    milestone,
    root: root === null ? null : displayPath(root),
    mutant,
    state: null,
    destination: null,
    movedSubtrees: [],
    archives: 0,
    livePaths: {},
    counts: {},
    uses: {},
    rows: [],
    findings: [],
    ok: false,
    reading: '',
  };
  if (root === null || milestone === null) {
    return {
      ...empty,
      findings: [
        refusal({
          file: 'input',
          claim: `${milestone ?? 'no milestone'} at ${root === null ? 'no root' : displayPath(root)}`,
          reason:
            'the check needs a root and a milestone; with either missing it examines nothing, which is a refusal and not a clean result',
        }),
      ],
      reading:
        'examined 0 reference(s): the check was called without a root and a milestone, so it refuses',
    };
  }

  const moved = movedSubtrees(root);
  const state = readState(root);
  const destination = archiveDestination(milestone, state.name);
  const suites = listSuites(root);

  /** @type {Array<Record<string, any>>} */
  const rows = [];
  for (const file of suites) {
    const text = readFileSync(join(root, file), 'utf8');
    if (!text.includes(PROJECT)) continue;
    const { modes } = lexSource(text);
    const roots = moduleRoots(text);
    for (const reference of referencesIn(file, text)) {
      const verdict = classify(reference, moved, roots);
      // The mutant removes the distinction the rule is written on: with it, every reference reads
      // as a naming, so a live path that is read is reported clean.
      const use =
        reference.path === null
          ? { use: 'no-path', usedBy: null, useLine: 0 }
          : mutant === MUTANTS.archivePaths
            ? { use: 'naming', usedBy: 'mutant', useLine: reference.line }
            : useOf(text, modes, reference.at);
      const row = {
        file,
        line: reference.line,
        claim: reference.path,
        path: reference.path,
        site: reference.site,
        class: verdict.class,
        use: use.use,
        usedBy: use.usedBy,
        useLine: use.useLine,
        verdict: 'clean',
        reason: verdict.reason,
      };
      if (reference.root !== undefined) {
        row.root = reference.root;
        row.construct = reference.construct;
      }
      if (verdict.class === 'archived-by-the-move') {
        // A second reading of the same row, kept beside the class rather than folded into it: the
        // subtree is what the rule decides on, and this says whether a file is there to delete now.
        row.existsInTheTree = existsSync(join(root, reference.path ?? ''));
      }
      if (verdict.class === 'archived-by-the-move' && use.use === 'read') {
        row.verdict = 'finding';
        row.reason = `${verdict.reason}, and this suite reads it with ${String(
          use.usedBy,
        )} at line ${String(use.useLine)}, so that call throws the moment the path is gone`;
      }
      rows.push(row);
    }
  }

  /** @type {Record<string, number>} */
  const counts = Object.fromEntries(CLASSES.map((name) => [name, 0]));
  /** @type {Record<string, number>} */
  const uses = { read: 0, naming: 0, 'no-path': 0 };
  for (const row of rows) {
    counts[row.class] = (counts[row.class] ?? 0) + 1;
    uses[row.use] = (uses[row.use] ?? 0) + 1;
  }
  const live = rows.filter((row) => row.class === 'archived-by-the-move');
  const findings = live.filter((row) => row.use === 'read');

  const refused =
    live.length > 0
      ? []
      : [
          refusal({
            file: moved.archiveDir,
            claim: `${milestone} at ${displayPath(root)}: no reference resolves a path the archive move deletes`,
            reason:
              moved.subtrees.length === 0
                ? `${moved.archiveDir} carries no milestone directory, so the archive move relocates nothing and the check would pass over nothing`
                : `${suites.length} suite(s) of ${String(rows.length)} reference(s) name no path under the subtrees the move relocates (${moved.subtrees.join(', ')}), so the check examined zero live path(s) rather than one it found clean`,
          }),
        ];

  return {
    examined: live.length,
    referencesExamined: rows.length,
    filesExamined: suites.length,
    milestone,
    root: displayPath(root),
    mutant,
    state,
    destination,
    movedSubtrees: moved.subtrees,
    archives: moved.archives.length,
    livePaths: liveFiles(root, moved.subtrees),
    counts,
    uses,
    rows,
    findings: [...findings, ...refused],
    ok: findings.length === 0 && refused.length === 0,
    reading: `examined ${String(live.length)} live path reference(s) of ${String(
      rows.length,
    )} reference(s) in ${String(suites.length)} suite(s); a reference that names a live path is clean, and a reference that reads one with ${[
      ...READ_CALLS,
    ].join('/')} is a finding`,
  };
}

/**
 * The range one milestone owns, derived from the ship commits git records: `base..head`, with the
 * base the previous milestone's ship commit. Derived rather than written here, so a re-cut history
 * moves the range rather than leaving a stale pair behind - and so a caller never feeds the check a
 * range it remembered. This is the derivation of `checkFixRecord`'s `range` input, not a third
 * check.
 *
 * @param {{ root?: string, milestone?: string }} [input]
 * @returns {{ range: string, base: { sha: string, subject: string } | null, head: { sha: string, subject: string } | null, command: string, error: string }}
 */
export function shipRange(input = {}) {
  const root = typeof input.root === 'string' ? resolve(input.root) : null;
  const milestone =
    typeof input.milestone === 'string' ? input.milestone.trim() : '';
  const command = 'git log --format=%H%x09%s';
  const fault = (/** @type {string} */ error) => ({
    range: '',
    base: null,
    head: null,
    command,
    error,
  });
  if (root === null || milestone === '') {
    return fault('a root and a milestone are needed to derive a range');
  }
  const digits = /^M?(\d{3})$/.exec(milestone.toUpperCase())?.[1];
  if (digits === undefined) {
    return fault(`${JSON.stringify(milestone)} is not a milestone id`);
  }
  const read = shipCommits(root);
  if (read.error !== '') return fault(read.error);
  const ships = read.ships;
  const previous = String(Number(digits) - 1).padStart(3, '0');
  const base = ships.get(previous) ?? null;
  const head = ships.get(digits) ?? null;
  if (base === null || head === null) {
    return fault(
      `git log names no ship commit for M${base === null ? previous : digits}, so the range this milestone owns cannot be derived`,
    );
  }
  return { range: `${base.sha}..${head.sha}`, base, head, command, error: '' };
}

// --------------------------------------------- measurement 2: the fix record ----

/**
 * One range's `--name-status -M`, one row per changed path, a rename carrying both of its names.
 *
 * @param {string} root
 * @param {string} range
 * @returns {{ rows: Array<{ status: string, paths: string[] }>, error: string }}
 */
function nameStatus(root, range) {
  const read = git(root, ['diff', '--name-status', '-M', range]);
  if (!read.ok) return { rows: [], error: read.error };
  /** @type {Array<{ status: string, paths: string[] }>} */
  const rows = [];
  for (const line of read.out.split('\n')) {
    if (line.trim() === '') continue;
    const [status, ...paths] = line.split('\t');
    rows.push({ status: status ?? '', paths });
  }
  return { rows, error: '' };
}

/**
 * The `## Log` of one task file, as the lines it carries after the heading, each with its number.
 *
 * @param {string} text
 * @returns {Array<{ line: number, text: string }>}
 */
function logLines(text) {
  const lines = stripBom(text).split(/\r?\n/);
  const start = lines.findIndex((line) => /^## Log\s*$/.test(line));
  if (start < 0) return [];
  /** @type {Array<{ line: number, text: string }>} */
  const out = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    if (/^## /.test(line)) break;
    if (line.trim() === '') continue;
    out.push({ line: index + 1, text: line });
  }
  return out;
}

/**
 * The task files one `tasks` input names: a directory's `.md` files, one file, or the inline
 * `{ id, file, text }` entries a caller supplies. An entry that carries its own text is read from
 * that text, so a claim can be held against a real range without writing a file to make it.
 *
 * @param {string} root
 * @param {unknown} tasks
 * @returns {Array<{ id: string, file: string, text: string }>}
 */
function taskInputs(root, tasks) {
  /** @type {Array<{ id: string, file: string, text: string }>} */
  const inputs = [];
  /** @param {string} named @returns {void} */
  const fromPath = (named) => {
    const absolute = resolve(root, named);
    if (!existsSync(absolute)) return;
    const entries = readdirSync(absolute, { withFileTypes: true });
    if (absolute.endsWith('.md')) {
      const text = readFileSync(absolute, 'utf8');
      const id = /^id:\s*(\S+)\s*$/m.exec(stripBom(text))?.[1] ?? named;
      inputs.push({ id, file: displayPath(relative(root, absolute)), text });
      return;
    }
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
      const path = join(absolute, entry.name);
      const text = readFileSync(path, 'utf8');
      const id = /^id:\s*(\S+)\s*$/m.exec(stripBom(text))?.[1] ?? entry.name;
      inputs.push({ id, file: displayPath(relative(root, path)), text });
    }
  };
  if (typeof tasks === 'string') {
    fromPath(tasks);
    return inputs.sort((left, right) => (left.file < right.file ? -1 : 1));
  }
  if (!Array.isArray(tasks)) return inputs;
  for (const entry of tasks) {
    if (typeof entry === 'string') {
      fromPath(entry);
      continue;
    }
    if (!isObject(entry)) continue;
    const file = typeof entry.file === 'string' ? entry.file : 'inline';
    const text = typeof entry.text === 'string' ? entry.text : '';
    const id =
      typeof entry.id === 'string'
        ? entry.id
        : (/^id:\s*(\S+)\s*$/m.exec(stripBom(text))?.[1] ?? file);
    inputs.push({ id, file, text });
  }
  return inputs;
}

/**
 * The paths one task file's own `files:` front matter declares. A log token that this list carries is
 * a claim; every other path-like token is a mention, which is named rather than judged. The list is
 * read from the task's own front matter, never from a list written here, so a task that declares
 * nothing claims nothing.
 *
 * @param {string} text
 * @returns {string[]}
 */
function declaredFiles(text) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(stripBom(text))?.[1] ?? '';
  const block =
    /^files:[ \t]*\r?\n((?:[ \t]*-[ \t]*\S.*\r?\n?)*)/m.exec(front)?.[1] ?? '';
  /** @type {string[]} */
  const declared = [];
  for (const match of block.matchAll(/^[ \t]*-[ \t]*(\S+)[ \t]*$/gm)) {
    const named = (match[1] ?? '').replace(/^['"]|['"]$/g, '');
    if (named !== '') declared.push(named);
  }
  return declared;
}

/**
 * The fix-record check (SC2; AC2, AC3, AC4): every path a task log's `## Log` claims, held against
 * the range's own `--name-status`, where a rename contributes both of its names.
 *
 * `claims` decides what a log token is. The default `'log'` treats every path-like token as a claim.
 * `'declared'` treats a token as a claim only when that task's own `files:` front matter lists the
 * path, and records every other token in `mentions` - printed and not judged - so a log that
 * narrates another milestone's path does not read as a claim about this one.
 *
 * @param {{ root?: string, range?: string, tasks?: unknown, mutant?: string | null, claims?: string }} [input]
 * @returns {Record<string, any>}
 */
export function checkFixRecord(input = {}) {
  const root = typeof input.root === 'string' ? resolve(input.root) : null;
  const range = typeof input.range === 'string' ? input.range.trim() : '';
  const mutant = input.mutant ?? null;
  const claimsMode = input.claims === 'declared' ? 'declared' : 'log';
  const command = `git diff --name-status -M ${range}`;
  const empty = {
    examined: 0,
    tasksExamined: 0,
    claimsExamined: 0,
    claimsMode,
    range: { range, command, changed: 0, renames: 0 },
    claims: [],
    mentions: [],
    declarations: [],
    findings: [],
    mutant,
    ok: false,
    reading: '',
  };
  if (root === null || range === '') {
    return {
      ...empty,
      findings: [
        refusal({
          file: range === '' ? 'range' : displayPath(root),
          claim: `${command}|${root === null ? 'no root' : displayPath(root)}`,
          reason:
            'the check needs a root and a range; with either missing it examines nothing, which is a refusal and not a clean result',
        }),
      ],
      reading:
        'examined 0 claim(s): the check was called without a root and a range, so it refuses',
    };
  }

  const read = nameStatus(root, range);
  if (read.error !== '') {
    return {
      ...empty,
      findings: [
        refusal({
          file: range,
          claim: command,
          reason: `the range could not be read, so it examined nothing: ${read.error}`,
        }),
      ],
      reading: `examined 0 claim(s): ${read.error}`,
    };
  }

  const rows = read.rows;
  const renames = rows.filter((row) => /^[RC]/.test(row.status));
  // A rename is a path with two names, and a claim about either name is true. The mutant keeps only
  // the first name, so a claim naming the new name is reported absent.
  const names = rows.flatMap((row) =>
    mutant === MUTANTS.fixRecord ? row.paths.slice(0, 1) : row.paths,
  );

  const inputs = taskInputs(root, input.tasks);
  /** @type {Array<Record<string, any>>} */
  const claims = [];
  /** @type {Array<Record<string, any>>} */
  const mentions = [];
  /** @type {Array<{ task: string, file: string, declared: string[] }>} */
  const declarations = [];
  let tasksExamined = 0;
  for (const task of inputs) {
    const logs = logLines(task.text);
    if (logs.length === 0) continue;
    tasksExamined += 1;
    const declared = declaredFiles(task.text);
    declarations.push({ task: task.id, file: task.file, declared });
    for (const log of logs) {
      for (const match of log.text.matchAll(/`([^`]+)`/g)) {
        const named = (match[1] ?? '').trim();
        if (!PATH_LIKE.test(named)) continue;
        const named_ = named.replace(/^\.\//, '');
        // In `declared` mode a token the task's own `files:` list does not carry is a mention: it is
        // recorded with where it sits and what it named, and it is never held against the range.
        if (
          claimsMode === 'declared' &&
          !declared.some(
            (path) => path === named_ || path.endsWith(`/${named_}`),
          )
        ) {
          mentions.push({
            task: task.id,
            file: named_,
            at: `${task.file}:${log.line}`,
            taskFile: task.file,
            line: log.line,
            claim: log.text.trim(),
            reason: `${task.id} names ${named_} in its ## Log and its own files: list does not declare it, so it is a mention recorded rather than a claim judged`,
          });
          continue;
        }
        const found = rows
          .filter((row) =>
            row.paths.some(
              (entry) => entry === named || entry.endsWith(`/${named}`),
            ),
          )
          .map((row) => ({ status: row.status, paths: row.paths }));
        const present = names.some(
          (entry) => entry === named || entry.endsWith(`/${named}`),
        );
        claims.push({
          task: task.id,
          file: named,
          at: `${task.file}:${log.line}`,
          taskFile: task.file,
          line: log.line,
          claim: log.text.trim(),
          inTheRange: present,
          statusesInTheRange: found,
        });
      }
    }
  }

  const rangeCarries = rows.length > 0;
  const findings = claims
    .filter((claim) => rangeCarries && !claim.inTheRange)
    .map((claim) => ({
      file: claim.file,
      line: claim.line,
      claim: claim.claim,
      path: claim.file,
      site: 'log',
      class: 'claim-absent-from-the-range',
      use: 'claimed',
      usedBy: command,
      useLine: claim.line,
      verdict: 'finding',
      task: claim.task,
      taskFile: claim.taskFile,
      statusesInTheRange: claim.statusesInTheRange,
      reason: `${claim.task} claims ${claim.file} at ${claim.at}, and ${command} carries no such path (${String(
        rows.length,
      )} changed path(s), ${String(renames.length)} rename row(s))`,
    }));

  const refusals = [];
  if (!rangeCarries) {
    refusals.push(
      refusal({
        file: range,
        claim: command,
        reason: `the range carries no changed path, so no claim can be compared against it and the check examined nothing`,
      }),
    );
  } else if (claims.length === 0) {
    refusals.push(
      refusal({
        file: inputs.length === 0 ? 'tasks' : (inputs[0]?.file ?? 'tasks'),
        claim:
          inputs.length === 0
            ? 'no task was supplied'
            : claimsMode === 'declared'
              ? `${String(tasksExamined)} task log(s) name no path their own files: list declares (${String(mentions.length)} mention(s) recorded and not judged)`
              : `${String(tasksExamined)} task log(s) name no path in their ## Log`,
        reason:
          'no claim was compared against the range, so the check examined nothing rather than finding every claim true',
      }),
    );
  }

  return {
    examined: rangeCarries ? claims.length : 0,
    tasksExamined,
    claimsExamined: claims.length,
    claimsMode,
    mentionsExamined: mentions.length,
    range: {
      range,
      command,
      changed: rows.length,
      renames: renames.length,
      names: names.length,
    },
    mutant,
    claims,
    mentions,
    declarations,
    findings: [...findings, ...refusals],
    ok: findings.length === 0 && refusals.length === 0,
    reading: `examined ${String(claims.length)} claim(s) from ${String(
      tasksExamined,
    )} task log(s) against ${String(rows.length)} changed path(s), with ${
      mutant === MUTANTS.fixRecord
        ? 'each rename contributing only its first name'
        : 'each rename contributing both of its names'
    }${claimsMode === 'declared' ? `, and ${String(mentions.length)} token(s) its tasks' files: lists do not declare recorded as mention(s) rather than judged` : ''}`,
  };
}

// ---------------------------------------------- the task input the stage reads ----
//
// The archive move relocates `.project/tasks` into `.project/archive/<NNN>-<slug>/tasks`, so a stage
// whose default input is the live directory reads an empty directory on every tree the move has just
// shipped and refuses `nothing-examined` over task logs that are still there, one directory to the
// side. The refusal is right and stays (SC2, N1): a tree with no task file anywhere is exactly the
// tree it exists for. What is wrong is the default, so the default answers the milestone it was asked
// about: that milestone's own archived `tasks/` when the archive holds one, and otherwise the live
// directory - which is the milestone being built, and the same live path a tree empty in both places
// answers. The stage then prints whose logs it examined, because a reader who sees a directory that
// does not name a milestone cannot tell the milestone being built from the one that archived.

/** The live task directory the archive move empties. */
const LIVE_TASKS = join(PROJECT, 'tasks');

/**
 * Whether one directory holds a task file: a `.md` file directly inside it. A directory that exists
 * and holds no `.md` file is empty for this measurement (E9), and a name that is not a directory at
 * all - absent, or a file - is empty too.
 *
 * @param {string} dir
 * @returns {boolean}
 */
function holdsTaskFile(dir) {
  if (!existsSync(dir)) return false;
  try {
    return readdirSync(dir, { withFileTypes: true }).some(
      (entry) => entry.isFile() && entry.name.endsWith('.md'),
    );
  } catch {
    return false;
  }
}

/**
 * The number a milestone id names, spelled the way an archive directory spells it: `M056`, `m056`,
 * `M56`, `056` and `M0056` are one milestone, so a caller holding any of those spellings resolves the
 * same archive (E4). Answers null for anything that names no milestone number, so a caller that passes
 * a milestone name or nothing borrows no archive at all.
 *
 * @param {unknown} milestone
 * @returns {string | null}
 */
function milestoneDigits(milestone) {
  const text = typeof milestone === 'string' ? milestone.trim() : '';
  const digits = /^[Mm]?(\d{1,4})$/.exec(text)?.[1];
  if (digits === undefined) return null;
  const number = Number(digits);
  return Number.isSafeInteger(number) && number > 0
    ? String(number).padStart(3, '0')
    : null;
}

/**
 * The milestone's own archived `tasks/`, project-relative, when the archive holds it and it carries a
 * task file. The archive directories are matched by the number the milestone id names - `<NNN>-<slug>`
 * - rather than by a slug written here, because the slug belongs to that milestone's own move; matching
 * directories are read in sorted order so the answer is the same on every run. A milestone with no
 * archive answers nothing, so `M999` borrows no neighbour's logs (E4).
 *
 * @param {string} root
 * @param {unknown} milestone
 * @returns {string | null}
 */
function archivedTasks(root, milestone) {
  const digits = milestoneDigits(milestone);
  if (digits === null) return null;
  const archive = join(root, PROJECT, 'archive');
  if (!existsSync(archive)) return null;
  /** @type {string[]} */
  let names;
  try {
    names = readdirSync(archive, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter(
        (name) => Number(/^(\d+)-/.exec(name)?.[1] ?? 'NaN') === Number(digits),
      )
      .sort();
  } catch {
    return null;
  }
  for (const name of names) {
    const relative = join(PROJECT, 'archive', name, 'tasks');
    if (holdsTaskFile(join(root, relative))) return displayPath(relative);
  }
  return null;
}

/**
 * The task directory the fix-record stage reads when `--tasks` names none (SC1, SC2; E1-E4, E9): the
 * milestone's own archived `tasks/` when that archive holds a task file, otherwise the live directory
 * - so a milestone with no archive still reads the logs it is being built in, and a tree empty in
 * both places still refuses `nothing-examined` rather than passing over nothing. The milestone the
 * caller named is the one this prefers, which is what makes `--milestone M044` examine M044's
 * archived logs instead of the logs of the milestone being built beside them. Project-relative, in
 * this repository's spelling, which is the shape `checkFixRecord`'s `tasks` input already accepts.
 *
 * @param {string} root
 * @param {unknown} milestone
 * @returns {string}
 */
export function defaultTaskInput(root, milestone) {
  const base = resolve(
    typeof root === 'string' && root !== '' ? root : process.cwd(),
  );
  const archivedDir = archivedTasks(base, milestone);
  return archivedDir ?? displayPath(LIVE_TASKS);
}

/**
 * The milestone the examined task logs belong to, named for the reading line (T007's AC1): an
 * archived `tasks/` directory names its own milestone by the number `.project/archive/<NNN>-<slug>/`
 * carries, the live directory names the milestone this tree binds, and a directory the caller named
 * itself (`--tasks`) names no milestone this stage can read - so a line that says `logs of no
 * milestone` beside a caller's own path never claims the path belongs to the milestone asked for.
 *
 * @param {unknown} tasks
 * @param {string | null} bound
 * @returns {string}
 */
function logsOwner(tasks, bound) {
  const shown = displayPath(String(tasks));
  const digits = /\.project\/archive\/(\d+)-[^/]+\/tasks$/u.exec(shown)?.[1];
  if (digits !== undefined) return `M${digits.padStart(3, '0')}`;
  if (shown === displayPath(LIVE_TASKS) && bound !== null) return bound;
  return 'no milestone';
}

// -------------------------------------------------------------- the gate ----
//
// The two checks as one command, so a red check reaches a CI or a ship step as a refusal rather than as
// a paragraph beside a passing gate (SC3; T003's AC1, AC2). It reads and prints; the only process it
// spawns is the one `git` read `shipRange` and the range's own `--name-status` already named.

/** The stages `--check` selects, and the one it means when the flag is absent. */
const STAGES = ['archive', 'fix-record', 'both'];

/** The claims modes `--claims` selects. */
const CLAIMS_MODES = ['log', 'declared'];

/**
 * Every ship commit `git log` carries, by the milestone number its subject names, newest first. One
 * reading shared by `shipRange` and `workRange`, so the two derivations cannot disagree about which
 * commits git records.
 *
 * @param {string} root
 * @returns {{ ships: Map<string, { sha: string, subject: string }>, error: string }}
 */
function shipCommits(root) {
  /** @type {Map<string, { sha: string, subject: string }>} */
  const ships = new Map();
  const read = git(root, ['log', '--format=%H%x09%s']);
  if (!read.ok) return { ships, error: read.error };
  for (const line of read.out.split('\n')) {
    if (line.trim() === '') continue;
    const tab = line.indexOf('\t');
    const sha = line.slice(0, tab);
    const subject = line.slice(tab + 1);
    const number = /^ship:\s*M(\d{3})\b/.exec(subject)?.[1];
    if (number === undefined || ships.has(number)) continue;
    ships.set(number, { sha, subject });
  }
  return { ships, error: '' };
}

/**
 * One commit as a printed line names it: the short sha and the subject git records for it.
 *
 * @param {{ sha: string, subject: string }} commit
 * @returns {string}
 */
function namedCommit(commit) {
  const short = commit.sha.slice(0, 8);
  return commit.subject === '' ? short : `${short} (${commit.subject})`;
}

/**
 * The subject `git log` records for one commit, or `''` where it cannot be read: the range still names
 * the commit by its sha, so a missing subject is a thinner line rather than a refusal.
 *
 * @param {string} root
 * @param {string} sha
 * @returns {string}
 */
function commitSubject(root, sha) {
  const subject = git(root, ['log', '-1', '--format=%s', sha]);
  return subject.ok ? subject.out.trim() : '';
}

/**
 * The rules that may answer the base of the range, in the order they are tried. `workRange` answers
 * the one that did in `mode`, and the stage prints it, so a refusal names the rule that failed
 * rather than only that one did.
 *
 * `recorded` is first because a recording pins the base its own capture used: a re-run then compares
 * against that base rather than against whatever HEAD now prefers. `ship` answers the numerically
 * previous milestone's ship commit, `newest-ship` answers the newest ship commit git log carries when
 * that predecessor has none, and `none` is the refusal when git log carries no ship commit at all.
 */
export const RANGE_RULES = Object.freeze([
  'recorded',
  'ship',
  'newest-ship',
  'none',
]);

/**
 * The range one milestone is held to at the head it runs on: `<base>..<head>`, where the base is the
 * first rule in `RANGE_RULES` that answers and the head is this tree's `HEAD` unless the caller names
 * a commit.
 *
 * The head is HEAD rather than the milestone's own ship commit on purpose. A range that switched to
 * `<previous ship>..<this milestone's ship>` the moment that commit appeared would derive one answer
 * before the shipment and another after it, on the same tree, so a recording pinned to it would be
 * valid only before the thing that ships it - which is not a record. HEAD moves as work lands, and
 * that is the point: the range measures what the milestone has written so far, from a base one of
 * three named rules fixes.
 *
 * A recording names the commit it was measured at instead, and that is the other half of the same
 * rule: a record that pins `<base>..HEAD` is moved by the very commit that carries it - the head it
 * named is now the parent of its own commit - so the derivation disagrees with the record the moment
 * it lands, and a re-capture re-pins the previous head for the next commit to move. A named head is a
 * commit id this repository carries, so a live run keeps measuring to HEAD and a record keeps the
 * head it was taken at.
 *
 * @param {string} root
 * @param {string} milestone
 * @param {{ sha?: string, subject?: string } | string | null} [recorded] the base a recording names
 * @param {string | null} [mutant] the branch this module ships that a regression would take
 * @param {string | null} [namedHead] the commit the caller names as the head, rather than HEAD
 * @returns {{ range: string, base: { sha: string, subject: string } | null, head: { sha: string, subject: string } | null, command: string, error: string, mode: string, rule: string, headMode: string }}
 */
export function workRange(
  root,
  milestone,
  recorded = null,
  mutant = null,
  namedHead = null,
) {
  const command =
    'git log --format=%H%x09%s (every ship commit, newest first), then git rev-parse HEAD, or git rev-parse --verify <--head>^{commit} when the caller names one';
  /**
   * Which rule answered the head: `head` for this tree's HEAD, `named` for the commit a caller names.
   * Read by `answer` when it builds each reply, so a refusal carries the rule it stopped on.
   */
  let headMode = 'head';
  /** @param {Record<string, any>} input @returns {Record<string, any>} */
  const answer = (input) =>
    Object.assign(
      {
        range: '',
        base: null,
        head: null,
        command,
        error: '',
        mode: 'none',
        rule: '',
        headMode,
      },
      input,
    );

  const id =
    typeof milestone === 'string' ? milestone.trim().toUpperCase() : '';
  const digits = /^M?(\d{1,4})$/.exec(id)?.[1];
  if (typeof root !== 'string' || root === '' || digits === undefined) {
    return answer({
      rule: 'the milestone rule',
      error:
        digits === undefined
          ? `the milestone rule cannot answer: ${JSON.stringify(milestone)} names no milestone number, so no range can be derived`
          : 'the milestone rule cannot answer: no root was given, so git log cannot be read',
    });
  }

  const tree = resolve(root);
  const read = git(tree, ['rev-parse', 'HEAD']);
  if (!read.ok) {
    return answer({
      rule: 'the head rule',
      error: `the head rule cannot answer, so the range has no head: ${read.error}`,
    });
  }
  let head = { sha: read.out.trim(), subject: '' };
  head.subject = commitSubject(tree, head.sha);

  // Rule 0, `named`: the head the caller names, which is how a record keeps the head it was measured
  // at. A live run names none and measures to HEAD, so the gate still reads what the milestone has
  // written so far; a record names the commit it was taken at, so the commit carrying the record is
  // outside the range it pins. The name must be a commit id this repository carries: a branch is a
  // name that moves, and a range held to a moving name is the defect this rule removes.
  const pinned = typeof namedHead === 'string' ? namedHead.trim() : '';
  if (pinned !== '') {
    if (!/^[0-9a-f]{7,64}$/i.test(pinned)) {
      return answer({
        head,
        rule: 'the head rule',
        error: `the head rule cannot answer: ${JSON.stringify(namedHead)} names no commit id, so the range has no head`,
      });
    }
    const resolved = git(tree, [
      'rev-parse',
      '--verify',
      '--quiet',
      `${pinned}^{commit}`,
    ]);
    if (!resolved.ok) {
      return answer({
        head,
        rule: 'the head rule',
        error: `the head rule cannot answer: git does not carry the commit ${pinned} the caller named, so the range has no head`,
      });
    }
    const sha = resolved.out.trim();
    head = { sha, subject: commitSubject(tree, sha) };
    headMode = 'named';
  }
  // Every base rule below ends the range at this head, so each printed line says which head rule put
  // it there rather than leaving a reader to infer it from the pair of shas.
  const headClause = `; the head is ${
    headMode === 'named' ? 'the commit the caller named' : "this tree's HEAD"
  }, ${namedCommit(head)}`;

  // Rule 1, `recorded`: the base a recording names, when the caller holds one.
  const named =
    typeof recorded === 'string'
      ? { sha: recorded.trim(), subject: '' }
      : isObject(recorded) && typeof recorded.sha === 'string'
        ? {
            sha: recorded.sha.trim(),
            subject:
              typeof recorded.subject === 'string' ? recorded.subject : '',
          }
        : null;
  if (named !== null && /^[0-9a-f]{7,64}$/i.test(named.sha)) {
    return answer({
      range: `${named.sha}..${head.sha}`,
      base: named,
      head,
      mode: 'recorded',
      rule: `the base the recording names, ${namedCommit(named)}${headClause}`,
    });
  }

  const log = shipCommits(tree);
  if (log.error !== '') {
    return answer({
      head,
      rule: 'the ship rule',
      error: `the ship rule cannot answer, so the range has no base: ${log.error}`,
    });
  }

  // Rule 2, `ship`: the numerically previous milestone's ship commit. Milestones are built in id
  // order, one at a time, so this is the base a milestone's own work starts from.
  const previous = String(Number(digits) - 1).padStart(3, '0');
  const predecessor = log.ships.get(previous) ?? null;
  if (predecessor !== null) {
    return answer({
      range: `${predecessor.sha}..${head.sha}`,
      base: predecessor,
      head,
      mode: 'ship',
      rule: `M${previous}'s ship commit, ${namedCommit(predecessor)}${headClause}`,
    });
  }

  // Rule 3, `newest-ship`: milestones ship in id order, which is not numeric order, so an id can be
  // unshipped while earlier ones did ship - M055 has no ship commit while M044 does, and M056's work
  // still has a base. The base is the newest commit git log carries that is not this milestone's own,
  // because basing a range on the milestone's own shipment is what made the range move.
  if (mutant === MUTANTS.workRange) {
    // The rule a regression would restore: the numerically previous milestone's ship commit or
    // nothing, which stops every milestone whose predecessor id is unshipped.
    return answer({
      head,
      rule: 'the numeric-predecessor rule',
      error: `the numeric-predecessor rule cannot answer: git log names no ship commit for M${previous}, so the range this milestone owns cannot be derived`,
    });
  }
  const newest =
    [...log.ships.entries()].filter(([number]) => number !== digits)[0]?.[1] ??
    null;
  if (newest !== null) {
    return answer({
      range: `${newest.sha}..${head.sha}`,
      base: newest,
      head,
      mode: 'newest-ship',
      rule: `git log names no ship commit for M${previous}, so the base is the newest it carries, ${namedCommit(newest)}${headClause}`,
    });
  }

  return answer({
    head,
    rule: 'the newest-ship rule',
    error: `the ship rule found no ship commit for M${previous} and the newest-ship rule found no ship commit for any milestone in git log, so the range has no base to start from`,
  });
}

/**
 * One gate run, without printing: both checks over one tree, the lines a caller prints, and the exit
 * code. Kept apart from `main` so a suite holds the run to its exit code in process, rather than
 * spawning a second node to learn it.
 *
 * @param {{ root?: string, milestone?: string, range?: string, base?: string, head?: string, tasks?: string, check?: string, claims?: string }} [input]
 * @returns {{ code: number, ok: boolean, lines: string[], archive: Record<string, any> | null, fix: Record<string, any> | null, range: string }}
 */
export function gate(input = {}) {
  const root = resolve(
    typeof input.root === 'string' && input.root !== ''
      ? input.root
      : process.cwd(),
  );
  const stage = STAGES.includes(String(input.check ?? 'both'))
    ? String(input.check ?? 'both')
    : 'both';
  const claims = CLAIMS_MODES.includes(String(input.claims ?? 'declared'))
    ? String(input.claims ?? 'declared')
    : 'declared';
  const state = readState(root);
  const milestone =
    typeof input.milestone === 'string' && input.milestone.trim() !== ''
      ? input.milestone.trim().toUpperCase()
      : state.milestone;
  /** @type {string[]} */
  const lines = [];
  /** @type {Record<string, any> | null} */
  let archive = null;
  /** @type {Record<string, any> | null} */
  let fix = null;

  lines.push(
    `gate-integrity: ${displayPath(root)} milestone ${milestone ?? 'unbound'}; stages ${
      stage === 'both'
        ? 'archive-paths then fix-record'
        : stage === 'archive'
          ? 'archive-paths'
          : 'fix-record'
    }`,
  );

  if (stage !== 'fix-record') {
    archive = checkArchivePaths({ root, milestone: milestone ?? '' });
    lines.push(
      `gate-integrity: archive-paths ${archive.ok ? 'clean' : 'refused'} - examined ${String(
        archive.examined,
      )} live path reference(s) of ${String(archive.referencesExamined)} reference(s) in ${String(
        archive.filesExamined,
      )} suite(s), across ${String(archive.movedSubtrees.length)} relocated subtree(s)`,
    );
    for (const finding of archive.findings) {
      lines.push(
        `gate-integrity: refusal ${String(finding.file)}:${String(finding.line)} names ${String(
          finding.path,
        )} (${String(finding.class)}) - ${String(finding.reason)}`,
      );
    }
  }

  let range = '';
  if (stage !== 'archive') {
    const derived =
      typeof input.range === 'string' && input.range.trim() !== ''
        ? {
            range: input.range.trim(),
            error: '',
            mode: 'given',
            rule: 'the range the caller named',
            base: null,
            head: null,
            headMode: 'given',
          }
        : workRange(
            root,
            milestone ?? '',
            typeof input.base === 'string' && input.base !== ''
              ? input.base
              : null,
            null,
            typeof input.head === 'string' && input.head !== ''
              ? input.head
              : null,
          );
    if (derived.error !== '') {
      lines.push(
        `gate-integrity: fix-record cannot derive the range it is held to - rule ${String(
          derived.mode,
        )}: ${derived.error}`,
      );
      return { code: 2, ok: false, lines, archive, fix, range: '' };
    }
    range = derived.range;
    // An explicit `--tasks` is the caller's own answer and stays authoritative; with none, the stage
    // reads the task directory the milestone's own tree holds its logs in.
    const tasks =
      typeof input.tasks === 'string' && input.tasks !== ''
        ? input.tasks
        : defaultTaskInput(root, milestone ?? '');
    fix = checkFixRecord({
      root,
      range,
      tasks,
      claims,
    });
    lines.push(
      `gate-integrity: fix-record ${fix.ok ? 'clean' : 'refused'} - examined ${String(
        fix.examined,
      )} claim(s) in ${String(fix.tasksExamined)} task log(s) of ${tasks} (logs of ${logsOwner(
        tasks,
        state.milestone,
      )}) against ${String(fix.range.changed)} changed path(s) of ${range} (rule ${String(
        derived.mode,
      )}: ${String(derived.rule)}; claims: ${claims})`,
    );
    for (const finding of fix.findings) {
      lines.push(
        `gate-integrity: refusal ${String(finding.file)} at ${String(finding.task ?? 'range')} (${String(
          finding.class,
        )}) - ${String(finding.reason)}`,
      );
    }
    for (const mention of fix.mentions) {
      lines.push(
        `gate-integrity: mention ${String(mention.file)} at ${String(mention.at)} (${String(
          mention.task,
        )}) - recorded and not judged`,
      );
    }
  }

  const findings =
    (archive?.findings.length ?? 0) + (fix?.findings.length ?? 0);
  const ok =
    (stage === 'fix-record' || archive?.ok === true) &&
    (stage === 'archive' || fix?.ok === true);
  lines.push(
    `gate-integrity: ${ok ? 'pass' : 'refuse'} - ${String(findings)} finding(s)${
      stage === 'both' || stage === 'fix-record'
        ? `, ${String(fix?.mentions.length ?? 0)} mention(s)`
        : ''
    }`,
  );
  return { code: ok ? 0 : 1, ok, lines, archive, fix, range };
}

/**
 * The gate's argument list: `--name value`, `--name=value`, and a `--flag` that stands for itself. An
 * unknown name, or a flag that needs a value and has none, is an error the gate refuses with rather
 * than an argument silently ignored, because a gate run with a typo would otherwise measure the
 * default tree and report a pass.
 *
 * @param {string[]} argv
 * @returns {{ ok: boolean, input: Record<string, any>, error: string }}
 */
function parseArguments(argv) {
  const input = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index] ?? '';
    if (!argument.startsWith('--')) {
      return {
        ok: false,
        input,
        error: `${JSON.stringify(argument)} is not a --flag; the gate reads no positional argument`,
      };
    }
    const body = argument.slice(2);
    const equals = body.indexOf('=');
    const name = equals === -1 ? body : body.slice(0, equals);
    if (name === 'json') {
      input.json = true;
      continue;
    }
    if (
      ![
        'check',
        'root',
        'milestone',
        'range',
        'base',
        'head',
        'tasks',
        'claims',
      ].includes(name)
    ) {
      return { ok: false, input, error: `--${name} is not a gate flag` };
    }
    const value =
      equals === -1 ? (argv[index + 1] ?? '') : body.slice(equals + 1);
    if (equals === -1) index += 1;
    if (value === '' || value.startsWith('--')) {
      return { ok: false, input, error: `--${name} needs a value` };
    }
    input[name] = value;
  }
  if (input.check !== undefined && !STAGES.includes(String(input.check))) {
    return {
      ok: false,
      input,
      error: `--check ${JSON.stringify(input.check)} is not one of ${STAGES.join('/')}`,
    };
  }
  if (
    input.claims !== undefined &&
    !CLAIMS_MODES.includes(String(input.claims))
  ) {
    return {
      ok: false,
      input,
      error: `--claims ${JSON.stringify(input.claims)} is not one of ${CLAIMS_MODES.join('/')}`,
    };
  }
  return { ok: true, input, error: '' };
}

/**
 * The command-line entry point: parse, run, print, answer the exit code. Every line names the file, the
 * task or the reading it is about, so a refusal says what reddened rather than only that something did.
 *
 * @param {string[]} argv
 * @returns {number} 0 clean, 1 a finding or a refusal, 2 an argument the gate cannot run with
 */
export function main(argv) {
  const parsed = parseArguments(argv);
  if (!parsed.ok) {
    process.stdout.write(`gate-integrity: refuse - ${parsed.error}\n`);
    return 2;
  }
  const result = gate(parsed.input);
  for (const line of result.lines) process.stdout.write(`${line}\n`);
  if (parsed.input.json === true) {
    process.stdout.write(
      `${JSON.stringify({ archive: result.archive, fix: result.fix }, null, 2)}\n`,
    );
  }
  return result.code;
}

// A module imported by a suite runs no gate; a module run as a command does. `process.argv[1]` is the
// path node was given, which is this file's own URL when the file is the entry point and a suite's
// when the suite is.
if (
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exitCode = main(process.argv.slice(2));
}
