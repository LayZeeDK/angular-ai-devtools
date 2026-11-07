#!/usr/bin/env node
/**
 * Lint every `SKILL.md` the repository owns.
 *
 * The failure this exists for: a skill whose frontmatter is not valid YAML is dropped from discovery
 * **silently**. `control-ai-browsers` carried `its own D: profile` in its description — a colon-space
 * inside an unquoted plain scalar — from the commit that added it (2026-10-18) until 2026-11-07. It
 * never registered once, and nothing reported it.
 *
 * The frontmatter is parsed with the `yaml` package rather than a hand-rolled subset. A real parser
 * rejects what a subset misses: the colon-space above, a tab used as indentation, and a duplicate key
 * all throw, and a folded block scalar may still contain the colons prose needs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const ROOT = path.resolve(
  path.dirname(
    new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
  ),
  '..',
);

const SCANNED_ROOTS = ['.commandcode/skills', '.claude/skills'];

const REQUIRED = ['name', 'description'];

const KNOWN = new Set([
  'name',
  'description',
  'license',
  'allowed-tools',
  // Documented extension fields; a skill authored for another agent uses these.
  'argument-hint',
  'when_to_use',
  'disable-model-invocation',
  'user-invocable',
  'disallowed-tools',
  'arguments',
  'model',
  'effort',
  'compatibility',
]);

/**
 * Command Code's limits, from its own skills reference. A description over this is not truncated:
 * the skill is skipped, exactly as `control-ai-browsers` was at 1253 characters.
 */
const DESCRIPTION_MAX = 1024;

const DESCRIPTION_MIN = 10;

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
 * Split the frontmatter block from the body, or report why it cannot be split.
 * @returns {{ frontmatter: string, body: string, bodyLine: number } | null}
 */
function split(file, text) {
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
  return {
    frontmatter: lines.slice(1, close).join('\n'),
    body: lines.slice(close + 1).join('\n'),
    bodyLine: close + 2,
  };
}

/** The line the parser's message names, so a YAML error points into the file. */
function lineOf(file, message) {
  const match = /line (\d+)/.exec(message);
  return match ? Number(match[1]) + 1 : 1;
}

function lintFile(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  // `.commandcode/skills` and `.claude/skills` hold the same skills by design — the second is a byte
  // copy, and `scripts/skills-mirror.test.mjs` owns that relationship. A name repeated across the two
  // roots is the mirror working, not a duplicate; a repeat within one root is not.
  const rootKey = rel.split('/').slice(0, 2).join('/');
  const text = fs.readFileSync(file, 'utf8');
  const parts = split(rel, text);
  if (!parts) return;

  let fields;
  try {
    fields = parse(parts.frontmatter);
  } catch (error) {
    const message = String(error.message).split('\n')[0];
    fail(
      rel,
      lineOf(rel, message),
      'yaml-error',
      `${message} — an unparsable frontmatter block drops the skill from discovery silently`,
    );
    return;
  }

  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    fail(rel, 2, 'not-a-mapping', 'the frontmatter must be a mapping of keys');
    return;
  }

  for (const key of Object.keys(fields)) {
    if (!KNOWN.has(key)) {
      fail(
        rel,
        2,
        'unknown-key',
        `unexpected frontmatter key ${JSON.stringify(key)}`,
      );
    }
  }

  for (const key of REQUIRED) {
    const value = fields[key];
    if (typeof value !== 'string' || value.trim() === '') {
      fail(
        rel,
        1,
        `missing-${key}`,
        `frontmatter must declare ${key} as a string`,
      );
    }
  }

  const { name, description } = fields;

  if (typeof name === 'string' && name !== '') {
    const dir = path.basename(path.dirname(file));
    if (name !== dir) {
      fail(
        rel,
        2,
        'name-mismatch',
        `name ${JSON.stringify(name)} must equal its directory ${JSON.stringify(dir)} — Command Code skips ` +
          'a mismatch, so a renamed folder silently uninstalls the skill',
      );
    }
    // Command Code's naming rules; a violation skips the skill.
    if (!/^[a-z0-9-]+$/.test(name)) {
      fail(
        rel,
        2,
        'name-charset',
        `name ${JSON.stringify(name)} must be lowercase letters, digits and hyphens only`,
      );
    }
    if (name.length > 64) {
      fail(
        rel,
        2,
        'name-length',
        `name is ${name.length} characters; the limit is 64`,
      );
    }
    if (name.startsWith('-') || name.endsWith('-')) {
      fail(
        rel,
        2,
        'name-hyphen-edge',
        `name ${JSON.stringify(name)} must not start or end with a hyphen`,
      );
    }
    if (name.includes('--')) {
      fail(
        rel,
        2,
        'name-double-hyphen',
        `name ${JSON.stringify(name)} must not contain consecutive hyphens`,
      );
    }
    const key = `${rootKey}::${name}`;
    if (seenNames.has(key)) {
      fail(
        rel,
        2,
        'duplicate-name',
        `name ${JSON.stringify(name)} is also declared by ${seenNames.get(key)}`,
      );
    } else {
      seenNames.set(key, rel);
    }
  }

  if (typeof description === 'string') {
    if (description.trim().length < DESCRIPTION_MIN) {
      fail(
        rel,
        3,
        'short-description',
        'the description is too short to say when the skill applies',
      );
    } else if (description.length > DESCRIPTION_MAX) {
      fail(
        rel,
        3,
        'long-description',
        `description is ${description.length} characters; Command Code drops a skill whose description ` +
          `exceeds ${DESCRIPTION_MAX} ("Skill description must be ${DESCRIPTION_MAX} characters or less"). ` +
          'Move the enumeration into the body and keep the description to what it does and when to use it.',
      );
    }
  }

  if (
    typeof fields.compatibility === 'string' &&
    fields.compatibility.length > 500
  ) {
    fail(
      rel,
      2,
      'long-compatibility',
      `compatibility is ${fields.compatibility.length} characters; the limit is 500`,
    );
  }

  if (parts.body.trim() === '') {
    fail(rel, parts.bodyLine, 'empty-body', 'the skill body is empty');
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
