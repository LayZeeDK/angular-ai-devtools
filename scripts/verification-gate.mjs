#!/usr/bin/env node
// @ts-check
// A milestone may not ship on the strength of a verification skill that does not work. This gate answers one
// question twice, because the two answers are needed at different moments:
//
//   --structure (default, CI): every verify-* check loads, its own unit test passes, each control-* skill meets
//     the contract when the canonical copy is installed, and the byte-copied scripts are in step. No browser, no
//     model, no evidence: this is what keeps the skills from rotting between milestones.
//
//   --ship: all of the above, plus a `verified` verdict that is the newest one for every check. A `not verified`
//     verdict that a later run superseded is history, not a blocker. This is the ship gate.
//
// Usage: node scripts/verification-gate.mjs [--ship] [--evidence <dir>] [--json-out <file>] [--json]
// Exit 0 pass, 1 blocked (the blockers are named), 2 could not run.
import { execFileSync } from 'node:child_process';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const SKILLS = join(ROOT, '.commandcode', 'skills');
const CANONICAL = join(
  homedir(),
  '.commandcode',
  'skills',
  'lars-create-verification',
  'scripts',
);

const { values } = parseArgs({
  options: {
    ship: { type: 'boolean', default: false },
    evidence: { type: 'string' },
    'json-out': { type: 'string' },
    json: { type: 'boolean', default: false },
  },
});

/** @typedef {{ id: string, kind: 'structure' | 'evidence', ok: boolean | null, detail: string }} Finding */

/** @type {Finding[]} */
const findings = [];

/**
 * @param {string} id
 * @param {boolean | null} ok
 * @param {string} detail
 * @param {'structure' | 'evidence'} [kind]
 * @returns {void}
 */
function add(id, ok, detail, kind = 'structure') {
  findings.push({ id, kind, ok, detail });
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
function dirs(dir) {
  return existsSync(dir)
    ? readdirSync(dir).filter((name) => statSync(join(dir, name)).isDirectory())
    : [];
}

/**
 * Every `verify-*` check and its unit test, by skill.
 * @returns {{ skill: string, check: string, file: string, test: string | null }[]}
 */
function checks() {
  return dirs(SKILLS)
    .filter((name) => name.startsWith('verify-'))
    .flatMap((skill) =>
      readdirSync(join(SKILLS, skill, 'checks'))
        .filter((file) => file.endsWith('.mjs') && !file.endsWith('.test.mjs'))
        .map((file) => ({
          skill,
          check: file.replace(/\.mjs$/, ''),
          file: join(SKILLS, skill, 'checks', file),
          test: existsSync(
            join(SKILLS, skill, 'checks', file.replace(/\.mjs$/, '.test.mjs')),
          )
            ? join(SKILLS, skill, 'checks', file.replace(/\.mjs$/, '.test.mjs'))
            : null,
        })),
    );
}

for (const { check, file, test } of checks()) {
  const syntax = spawnSync(process.execPath, ['--check', file], {
    encoding: 'utf8',
  });
  add(
    `check-loads:${check}`,
    syntax.status === 0,
    syntax.status === 0
      ? ''
      : ((syntax.stderr ?? '').trim().split('\n')[0] ?? ''),
  );

  if (test === null) {
    add(`check-has-test:${check}`, false, 'no unit test beside the check');
    continue;
  }

  const run = spawnSync(process.execPath, ['--test', test], {
    encoding: 'utf8',
  });
  const summary = /^ℹ (tests|pass|fail) (\d+)/gm;
  const counts = [...`${run.stdout ?? ''}`.matchAll(summary)].map(
    (m) => `${m[1]} ${m[2]}`,
  );
  add(
    `check-tested:${check}`,
    run.status === 0,
    run.status === 0
      ? counts.join(', ')
      : `unit test failed: ${(run.stdout ?? '').trim().split('\n').slice(-6).join(' | ')}`,
  );
}

for (const skill of dirs(SKILLS).filter((name) =>
  name.startsWith('control-'),
)) {
  const contract = join(CANONICAL, 'check-skill.mjs');

  if (!existsSync(contract)) {
    add(
      `contract:${skill}`,
      null,
      'skipped: no canonical check-skill.mjs on this machine',
    );
    continue;
  }

  const run = spawnSync(process.execPath, [contract, join(SKILLS, skill)], {
    encoding: 'utf8',
  });
  const failed = `${run.stdout ?? ''}`
    .split('\n')
    .filter(
      (line) =>
        line.includes('[FAIL]') ||
        line.includes('does not') ||
        line.includes('differs'),
    )
    .slice(0, 4)
    .join(' | ');
  add(
    `contract:${skill}`,
    run.status === 0,
    run.status === 0
      ? 'contract checks pass'
      : failed || 'contract check failed',
  );
}

const sync = join(ROOT, 'scripts', 'sync-verification-scripts.mjs');

if (existsSync(sync) && existsSync(CANONICAL)) {
  const run = spawnSync(process.execPath, [sync, '--check'], {
    encoding: 'utf8',
  });
  add(
    'scripts-in-step',
    run.status === 0,
    `${run.stdout ?? ''}`.trim().split('\n').slice(-1)[0] ?? '',
  );
} else {
  add(
    'scripts-in-step',
    null,
    'skipped: no canonical folder or no sync script',
  );
}

if (values.ship) {
  const evidence = resolve(
    values.evidence ?? join(ROOT, '.commandcode', 'worktrees', 'tmp'),
  );

  /** @type {{ check: string, verdict: string, at: string, file: string }[]} */
  const verdicts = [];

  /**
   * @param {string} dir
   * @returns {void}
   */
  const walk = (dir) => {
    if (!existsSync(dir)) {
      return;
    }

    for (const name of readdirSync(dir)) {
      const path = join(dir, name);

      if (statSync(path).isDirectory()) {
        walk(path);
        continue;
      }

      if (name !== 'verdict.json') {
        continue;
      }

      try {
        const parsed = JSON.parse(readFileSync(path, 'utf8'));
        // The check is named by the condition's argv, never by the claim prose: a claim may cite another check
        // (interop's cites `checks/state.mjs`), and matching the serialized text files the verdict under the
        // wrong check.
        const condition = parsed?.spec?.steps?.condition;
        const conditionArg = Array.isArray(condition)
          ? condition
              .map(String)
              .find((arg) => /checks[\\/][\w-]+\.mjs$/.test(arg))
          : undefined;
        const named =
          conditionArg === undefined
            ? '(unnamed)'
            : conditionArg.replace(/.*checks[\\/]/, '').replace(/\.mjs$/, '');

        verdicts.push({
          check: named,
          verdict: String(parsed.verdict ?? 'unknown'),
          at: statSync(path).mtime.toISOString(),
          file: relative(ROOT, path),
        });
      } catch {
        add(
          'evidence-read',
          false,
          `${relative(ROOT, path)} is not readable JSON`,
          'evidence',
        );
      }
    }
  };

  walk(evidence);

  for (const { check } of checks()) {
    const mine = verdicts
      .filter((v) => v.check === check)
      .sort((a, b) => a.at.localeCompare(b.at));
    const verified = mine.filter((v) => v.verdict === 'verified');
    const denied = mine.filter((v) => v.verdict === 'not verified');
    const newest = mine[mine.length - 1];
    add(
      `verdict:${check}`,
      // The newest verdict decides: a failure that a later run superseded is history, not a blocker.
      newest !== undefined && newest.verdict === 'verified',
      verified.length === 0
        ? `no verified verdict under ${relative(ROOT, evidence)}`
        : `newest is ${newest.verdict} at ${newest.at}`,
      'evidence',
    );
  }
}

const blockers = findings.filter((finding) => finding.ok === false);
const result = {
  mode: values.ship ? 'ship' : 'structure',
  at: new Date().toISOString(),
  pass: blockers.length === 0,
  blockers: blockers.map((b) => `${b.id}: ${b.detail}`),
  findings,
};

if (values.json === true) {
  console.log(JSON.stringify(result, null, 2));
} else {
  for (const finding of findings) {
    const mark =
      finding.ok === true ? 'OK  ' : finding.ok === null ? 'SKIP' : 'FAIL';

    console.log(
      `  [${mark}] ${finding.id}${finding.detail === '' ? '' : `: ${finding.detail}`}`,
    );
  }
}

const out =
  values['json-out'] ?? join(ROOT, '.project', 'review', 'VERIFICATION.json');

if (existsSync(dirname(out))) {
  writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`  ${relative(ROOT, out)}`);
}

console.log(
  result.pass
    ? `verification gate (${result.mode}): pass`
    : `verification gate (${result.mode}): ${blockers.length} blocker(s)`,
);

process.exit(result.pass ? 0 : 1);
