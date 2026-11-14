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
// Two mutants ship with the code, each a real branch rather than a decoration (T002's AC4):
// `MUTANTS.archivePaths` removes the naming/read distinction so a live reference reads clean, and
// `MUTANTS.fixRecord` treats a rename as its old name only, so a claim naming the new name is
// reported absent. The suite drives each one and quotes the failure it produces.
//
// What a run does: it reads files and spawns one read-only `git` per range. It writes nothing, opens
// no browser and binds no port.

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

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
  const read = git(root, ['log', '--format=%H%x09%s']);
  if (!read.ok) return fault(read.error);
  /** @type {Map<string, { sha: string, subject: string }>} */
  const ships = new Map();
  for (const line of read.out.split('\n')) {
    if (line.trim() === '') continue;
    const tab = line.indexOf('\t');
    const sha = line.slice(0, tab);
    const subject = line.slice(tab + 1);
    const number = /^ship:\s*M(\d{3})\b/.exec(subject)?.[1];
    if (number === undefined || ships.has(number)) continue;
    ships.set(number, { sha, subject });
  }
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
 * The fix-record check (SC2; AC2, AC3, AC4): every path a task log's `## Log` claims, held against
 * the range's own `--name-status`, where a rename contributes both of its names.
 *
 * @param {{ root?: string, range?: string, tasks?: unknown, mutant?: string | null }} [input]
 * @returns {Record<string, any>}
 */
export function checkFixRecord(input = {}) {
  const root = typeof input.root === 'string' ? resolve(input.root) : null;
  const range = typeof input.range === 'string' ? input.range.trim() : '';
  const mutant = input.mutant ?? null;
  const command = `git diff --name-status -M ${range}`;
  const empty = {
    examined: 0,
    tasksExamined: 0,
    claimsExamined: 0,
    range: { range, command, changed: 0, renames: 0 },
    claims: [],
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
  let tasksExamined = 0;
  for (const task of inputs) {
    const logs = logLines(task.text);
    if (logs.length === 0) continue;
    tasksExamined += 1;
    for (const log of logs) {
      for (const match of log.text.matchAll(/`([^`]+)`/g)) {
        const named = (match[1] ?? '').trim();
        if (!PATH_LIKE.test(named)) continue;
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
    range: {
      range,
      command,
      changed: rows.length,
      renames: renames.length,
      names: names.length,
    },
    mutant,
    claims,
    findings: [...findings, ...refusals],
    ok: findings.length === 0 && refusals.length === 0,
    reading: `examined ${String(claims.length)} claim(s) from ${String(
      tasksExamined,
    )} task log(s) against ${String(rows.length)} changed path(s), with ${
      mutant === MUTANTS.fixRecord
        ? 'each rename contributing only its first name'
        : 'each rename contributing both of its names'
    }`,
  };
}
