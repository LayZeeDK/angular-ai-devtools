#!/usr/bin/env node
// @ts-check
// A control skill carries byte copies of scripts whose master lives in the user-scope lars-create-verification
// skill (scripts/fingerprint.mjs, proctree.mjs, text.mjs). A copy must never be edited in place, and the two
// folders drift whenever one side moves first: on 2026-11-07 the repo copies were ahead, three canonical
// importers still pointed at the old export, and the direction was guessed by hand three times.
//
// This makes the direction explicit and the comparison mechanical:
//   node scripts/sync-verification-scripts.mjs --check     report only, exit 1 on any difference
//   node scripts/sync-verification-scripts.mjs             canonical -> this repo's control skill
//   node scripts/sync-verification-scripts.mjs --up        this repo's control skill -> canonical
//
// Which files are copies: a canonical script whose header says it carries a byte copy at scripts/<name>, or any
// script whose name exists in both folders (so a new copy is caught even when its header was not updated).
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const DECLARED = /carries a byte copy at scripts\/([\w.-]+\.mjs)/;

/**
 * The scripts a control skill ships, tests excluded.
 * @param {string} dir
 * @returns {string[]}
 */
function scriptsIn(dir) {
  return existsSync(dir)
    ? readdirSync(dir).filter(
        (name) => name.endsWith('.mjs') && !name.endsWith('.test.mjs'),
      )
    : [];
}

/**
 * Every file that is a copy of a canonical script.
 * @param {string} canonical
 * @param {string} skill
 * @returns {string[]}
 */
export function copiedNames(canonical, skill) {
  const canonicalScripts = scriptsIn(canonical);
  const names = new Set(
    scriptsIn(skill).filter((name) => canonicalScripts.includes(name)),
  );

  for (const name of canonicalScripts) {
    const declared = DECLARED.exec(readFileSync(join(canonical, name), 'utf8'));

    if (declared !== null) {
      names.add(declared[1]);
    }
  }

  return [...names].sort();
}

/**
 * One line per copy, and whether the two sides match.
 * @param {string} canonical
 * @param {string} skill
 * @returns {{ name: string, state: 'identical' | 'differs' | 'absent here' | 'absent there', from: string, to: string }[]}
 */
export function compare(canonical, skill) {
  return copiedNames(canonical, skill).map((name) => {
    const from = join(canonical, name);
    const to = join(skill, name);

    if (!existsSync(from)) {
      return { name, state: 'absent there', from, to };
    }

    if (!existsSync(to)) {
      return { name, state: 'absent here', from, to };
    }

    const same = readFileSync(from).equals(readFileSync(to));

    return { name, state: same ? 'identical' : 'differs', from, to };
  });
}

/**
 * Whether git reports uncommitted changes to `file` in the work tree that holds it, so a sync never writes over
 * someone's in-flight edit.
 * @param {string} file
 * @returns {boolean}
 */
function dirty(file) {
  try {
    const out = execFileSync(
      'git',
      ['-C', dirname(file), 'status', '--porcelain', '--', file],
      { encoding: 'utf8' },
    );

    return out.trim() !== '';
  } catch {
    return false;
  }
}

const { values } = parseArgs({
  options: {
    canonical: { type: 'string' },
    skill: { type: 'string' },
    check: { type: 'boolean', default: false },
    up: { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
    json: { type: 'boolean', default: false },
  },
});

const canonical = resolve(
  values.canonical ??
    join(
      homedir(),
      '.commandcode',
      'skills',
      'lars-create-verification',
      'scripts',
    ),
);
const skill = resolve(
  values.skill ??
    join(ROOT, '.commandcode', 'skills', 'control-ai-browsers', 'scripts'),
);

if (!existsSync(canonical)) {
  console.error(`refused: no canonical folder at ${canonical}`);
  process.exit(2);
}

const rows = compare(canonical, skill);

if (rows.length === 0) {
  console.error(
    `refused: no copied script found between ${canonical} and ${skill}`,
  );
  process.exit(2);
}

if (values.json === true) {
  console.log(JSON.stringify({ canonical, skill, rows }, null, 2));
}

const drifted = rows.filter((row) => row.state !== 'identical');

if (values.check) {
  if (values.json !== true) {
    for (const row of rows) {
      console.log(`  ${row.name}: ${row.state}`);
    }
  }

  console.log(
    drifted.length === 0
      ? `${rows.length} copies in step`
      : `${drifted.length} of ${rows.length} copies differ`,
  );
  process.exit(drifted.length === 0 ? 0 : 1);
}

if (drifted.length === 0) {
  console.log(`${rows.length} copies already in step; nothing to do`);
  process.exit(0);
}

const [source, target, direction] = values.up
  ? [skill, canonical, 'repo -> canonical']
  : [canonical, skill, 'canonical -> repo'];

for (const row of drifted) {
  const from = join(source, row.name);
  const to = join(target, row.name);

  if (!existsSync(from)) {
    console.error(`refused: ${relative(process.cwd(), from)} is missing`);
    process.exit(2);
  }

  if (dirty(to) && values.force !== true) {
    console.error(
      `refused: ${relative(process.cwd(), to)} has uncommitted changes; commit or --force`,
    );
    process.exit(2);
  }

  copyFileSync(from, to);
  console.log(
    `  ${row.name}: ${row.state} -> written (${statSync(to).size} bytes)`,
  );
}

console.log(`${drifted.length} written ${direction}`);
