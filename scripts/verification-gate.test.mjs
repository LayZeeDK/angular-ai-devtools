// @ts-check
// Run: node --test scripts/verification-gate.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const GATE = join(HERE, 'verification-gate.mjs');
const SKILLS = join(ROOT, '.commandcode', 'skills');

/** Every verify-* check the gate will demand a verdict for. */
const CHECKS = readdirSync(SKILLS)
  .filter((name) => name.startsWith('verify-'))
  .flatMap((skill) =>
    readdirSync(join(SKILLS, skill, 'checks'))
      .filter((file) => file.endsWith('.mjs') && !file.endsWith('.test.mjs'))
      .map((file) => file.replace(/\.mjs$/, '')),
  );

/**
 * @param {string[]} checks  the checks that get a verified verdict
 * @returns {string} the evidence root
 */
function evidence(checks) {
  const root = mkdtempSync(join(tmpdir(), 'gate-evidence-'));

  for (const check of checks) {
    const dir = join(root, check);

    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'verdict.json'),
      JSON.stringify({
        verdict: 'verified',
        spec: {
          steps: {
            condition: [
              'node',
              `.commandcode/skills/verify-ai-browsers/checks/${check}.mjs`,
            ],
          },
        },
      }),
    );
  }

  return root;
}

/**
 * @param {...string} args
 * @returns {{ status: number | null, out: string }}
 */
function gate(...args) {
  const run = spawnSync(process.execPath, [GATE, ...args], {
    encoding: 'utf8',
    cwd: ROOT,
  });

  return { status: run.status, out: `${run.stdout ?? ''}${run.stderr ?? ''}` };
}

test('ship mode passes when every check has a verified verdict', () => {
  const root = evidence(CHECKS);

  try {
    const result = gate(
      '--ship',
      '--evidence',
      root,
      '--json-out',
      join(root, 'out.json'),
    );

    assert.equal(result.status, 0, result.out);
    assert.match(result.out, /verification gate \(ship\): pass/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('ship mode names every check without a verified verdict', () => {
  const [first, ...rest] = CHECKS;
  const root = evidence(rest);

  try {
    const result = gate(
      '--ship',
      '--evidence',
      root,
      '--json-out',
      join(root, 'out.json'),
    );

    assert.equal(result.status, 1, result.out);
    assert.match(
      result.out,
      new RegExp(`verdict:${first}: no verified verdict`),
    );
    assert.match(result.out, /1 blocker/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('ship mode refuses a check whose newest evidence says not verified', () => {
  const [first, ...rest] = CHECKS;
  const root = evidence(CHECKS);
  const dir = join(root, 'denied');

  mkdirSync(dir);
  writeFileSync(
    join(dir, 'verdict.json'),
    JSON.stringify({
      verdict: 'not verified',
      spec: {
        steps: {
          condition: [
            'node',
            `.commandcode/skills/verify-ai-browsers/checks/${first}.mjs`,
          ],
        },
      },
    }),
  );

  try {
    const result = gate(
      '--ship',
      '--evidence',
      root,
      '--json-out',
      join(root, 'out.json'),
    );

    assert.equal(result.status, 1, result.out);
    assert.match(
      result.out,
      new RegExp(`verdict:${first}: newest is not verified`),
    );
    assert.equal(rest.length, CHECKS.length - 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
