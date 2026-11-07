#!/usr/bin/env node
/**
 * Lint every `SKILL.md` the repository owns.
 *
 * The failure this exists for: a skill whose frontmatter is not valid YAML is
 * dropped from discovery **silently**. `control-ai-browsers` carried
 * `its own D: profile` in its description — a colon-space inside an unquoted
 * plain scalar — from the commit that added it (2026-10-18) until 2026-11-07.
 * It never registered once, and nothing reported it.
 *
 * Dependency-free on purpose: the repository has no declared YAML parser, and a
 * transitive one may disappear. So this encodes the YAML rules a frontmatter
 * block actually needs, and refuses the constructs that break it.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(
  path.dirname(
    new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
  ),
  '..',
);

const SCANNED_ROOTS = ['.commandcode/skills', '.claude/skills'];

const REQUIRED = ['name', 'description'];

const OPTIONAL = new Set([
  'name',
  'description',
  'license',
  'allowed-tools',
  'metadata',
  'version',
]);

/** Characters that may not begin a plain YAML scalar. */
const INDICATORS = new Set([
  '-',
  '?',
  ':',
  '@',
  '`',
  '&',
  '*',
  '!',
  '%',
  '{',
  '}',
  '[',
  ']',
  ',',
  '#',
  '|',
  '>',
  "'",
  '"',
]);

const findings = [];
const seenNames = new Map();

function fail(file, line, code, message) {
  findings.push({ file, line, code, message });
}

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === 'SKILL.md') out.push(full);
  }
  return out;
}

/**
 * Split the frontmatter block, or report why it cannot be split.
 * @returns {{ lines: string[], bodyStart: number } | null}
 */
function frontmatter(file, text) {
  const lines = text.split(/\r?\n/);
  if (lines[0].trim() !== '---') {
    fail(file, 1, 'no-frontmatter', 'line 1 must be exactly ---');
    return null;
  }
  const close = lines.indexOf('---', 1);
  if (close === -1) {
    fail(file, 1, 'unterminated-frontmatter', 'no closing --- delimiter');
    return null;
  }
  return { lines: lines.slice(1, close), bodyStart: close + 1, all: lines };
}

/** Validate one `key: value` line and return the parsed key and raw value. */
function parseLine(file, lineNumber, line) {
  if (line.trim() === '' || line.trimStart().startsWith('#')) return null;
  if (/^\s/.test(line)) {
    fail(
      file,
      lineNumber,
      'nested-frontmatter',
      'frontmatter must be flat: no indented keys',
    );
    return null;
  }
  const match = /^([A-Za-z0-9_-]+):[ ]?(.*)$/.exec(line);
  if (!match) {
    fail(
      file,
      lineNumber,
      'not-a-mapping',
      `expected "key: value", got ${JSON.stringify(line)}`,
    );
    return null;
  }
  const [, key, rawValue] = match;
  return { key, rawValue, lineNumber };
}

function checkScalar(file, lineNumber, key, rawValue) {
  const value = rawValue.trim();
  if (value === '') return;
  const quoted = /^(['"]).*\1$/.test(value);
  const block = /^[|>][+-]?$/.test(value);
  if (quoted || block) return;

  // The bug: an unquoted plain scalar containing ": " or a trailing ":".
  if (/:(\s|$)/.test(value)) {
    const at = value.search(/:(\s|$)/);
    fail(
      file,
      lineNumber,
      'colon-in-plain-scalar',
      `${key}: an unquoted value cannot contain a colon followed by space or end of line ` +
        `(found at column ${at + 1}: ${JSON.stringify(value.slice(Math.max(0, at - 20), at + 12))}). ` +
        'Quote the value, use a block scalar, or reword without the colon.',
    );
  }
  if (/ #/.test(value)) {
    fail(
      file,
      lineNumber,
      'comment-in-plain-scalar',
      `${key}: an unquoted value cannot contain " #" — it starts a comment. Quote it.`,
    );
  }
  if (INDICATORS.has(value[0])) {
    fail(
      file,
      lineNumber,
      'indicator-start',
      `${key}: an unquoted value cannot start with ${JSON.stringify(value[0])}. Quote it.`,
    );
  }
}

function lintFile(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  // `.commandcode/skills` and `.claude/skills` hold the same skills by design — the second is a
  // byte copy, and `scripts/skills-mirror.test.mjs` owns that relationship. A name repeated
  // across the two roots is the mirror working, not a duplicate; a repeat within one root is not.
  const rootKey = rel.split('/').slice(0, 2).join('/');
  const text = fs.readFileSync(file, 'utf8');
  const block = frontmatter(rel, text);
  if (!block) return;

  const fields = new Map();
  for (let i = 0; i < block.lines.length; i += 1) {
    const line = block.lines[i];
    const parsed = parseLine(rel, i + 2, line);
    if (!parsed) continue;
    if (!OPTIONAL.has(parsed.key)) {
      fail(
        rel,
        parsed.lineNumber,
        'unknown-key',
        `unexpected frontmatter key ${JSON.stringify(parsed.key)}`,
      );
    }
    checkScalar(rel, parsed.lineNumber, parsed.key, parsed.rawValue);
    fields.set(parsed.key, parsed.rawValue.trim());
  }

  for (const key of REQUIRED) {
    const value = fields.get(key);
    if (!value) {
      fail(rel, 1, 'missing-' + key, `frontmatter must declare ${key}`);
    }
  }

  const name = fields.get('name');
  if (name) {
    if (/^['"]/.test(name)) {
      fail(rel, 2, 'quoted-name', 'name must be an unquoted plain scalar');
    } else {
      const dir = path.basename(path.dirname(file));
      if (name !== dir) {
        fail(
          rel,
          2,
          'name-mismatch',
          `name ${JSON.stringify(name)} must equal its directory ${JSON.stringify(dir)}`,
        );
      }
      if (seenNames.has(`${rootKey}::${name}`)) {
        fail(
          rel,
          2,
          'duplicate-name',
          `name ${JSON.stringify(name)} is also declared by ${seenNames.get(`${rootKey}::${name}`)}`,
        );
      } else {
        seenNames.set(`${rootKey}::${name}`, rel);
      }
    }
  }

  const description = fields.get('description');
  if (description) {
    if (description.length < 10) {
      fail(
        rel,
        3,
        'short-description',
        `description is ${description.length} characters — too short to say when the skill applies`,
      );
    } else if (description.length > 4000) {
      fail(
        rel,
        3,
        'long-description',
        `description is ${description.length} characters; keep it under 4000`,
      );
    }
  }

  const body = block.all
    .slice(block.bodyStart + 1)
    .join('\n')
    .trim();
  if (body === '') {
    fail(rel, block.bodyStart + 2, 'empty-body', 'the skill body is empty');
  }
}

const files = [];
for (const root of SCANNED_ROOTS) {
  const dir = path.join(ROOT, root);
  if (fs.existsSync(dir)) walk(dir, files);
}

for (const file of files) lintFile(file);

if (findings.length === 0) {
  console.log(`skill-lint: ${files.length} SKILL.md files, no findings`);
  process.exit(0);
}

const byFile = new Map();
for (const finding of findings) {
  if (!byFile.has(finding.file)) byFile.set(finding.file, []);
  byFile.get(finding.file).push(finding);
}

console.error(
  `skill-lint: ${findings.length} finding(s) across ${byFile.size} file(s) of ${files.length} scanned`,
);
for (const [file, list] of byFile) {
  console.error('');
  console.error(file);
  for (const finding of list) {
    console.error(`  ${finding.line}: [${finding.code}] ${finding.message}`);
  }
}
console.error('');
console.error(
  'A skill with invalid frontmatter is dropped from discovery silently.',
);
process.exit(1);
