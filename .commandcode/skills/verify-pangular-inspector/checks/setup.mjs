// @ts-check
// Claim: control-pangular-inspector's `check` finds the Insurance Portal set up for Pangular Inspector: it exits 0
// and every setup fact it reads (the exact pin 0.0.7 declared and installed, the dev-guarded overlay import, the
// proxy and its serve option) passes.
// Covers: control-pangular-inspector features/setup.md, sub-feature `setup.check`.
// Needs: nothing running.
// Usage: node .commandcode/skills/verify-pangular-inspector/checks/setup.mjs --out <dir>
// Writes: <dir>/setup-check.json.
// Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run.
import { spawnSync } from 'node:child_process';
import { mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..', '..', '..');
const CONTROL = join(
  ROOT,
  '.commandcode',
  'skills',
  'control-pangular-inspector',
  'scripts',
  'control.mjs',
);

/** @typedef {{ code: number | null, json: Record<string, unknown> | null, text: string }} StepResult */
/** @typedef {{ control: (args: string[]) => StepResult, write: (file: string, data: string) => void }} Deps */

/**
 * The JSON object a control command printed with `--json`: from the first line that starts with `{` to the end.
 * @param {string} stdout
 * @returns {Record<string, unknown> | null}
 */
export function jsonOf(stdout) {
  const at = stdout.search(/^\{/m);

  if (at < 0) {
    return null;
  }

  try {
    /** @type {unknown} */
    const value = JSON.parse(stdout.slice(at));

    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? /** @type {Record<string, unknown>} */ (value)
      : null;
  } catch {
    return null;
  }
}

/**
 * The object items of a JSON array; anything else gives an empty list.
 * @param {unknown} value
 * @returns {Record<string, unknown>[]}
 */
export function records(value) {
  /** @type {unknown[]} */
  const items = Array.isArray(value) ? value : [];

  return items.filter(
    /** @returns {v is Record<string, unknown>} */ (v) =>
      v !== null && typeof v === 'object' && !Array.isArray(v),
  );
}

/**
 * Runs the check; throws `CLAIM:` on the wrong state and any other error when it could not run.
 * @param {{ out: string }} options
 * @param {Deps} deps
 * @returns {void}
 */
export function check({ out }, deps) {
  const r = deps.control(['check']);
  deps.write(
    join(out, 'setup-check.json'),
    JSON.stringify({ exit: r.code, result: r.json ?? r.text }, null, 2),
  );

  if (r.json === null || (r.code !== 0 && r.code !== 1)) {
    throw new Error(
      `control.mjs check exited ${r.code}: ${r.text.trim().slice(-400)}`,
    );
  }

  const facts = records(r.json['checks']);
  const failed = facts
    .filter((c) => c['status'] !== 'pass')
    .map((c) => `${c['name']}: ${c['detail']}`);

  if (r.code !== 0 || failed.length > 0) {
    throw new Error(
      `CLAIM: check exited ${r.code}; failed setup facts: ${failed.join('; ') || 'none listed'}`,
    );
  }
}

/**
 * @param {string[]} argv
 * @param {Deps} deps
 * @returns {number}
 */
export function main(argv, deps) {
  try {
    const { values } = parseArgs({
      args: argv,
      options: { out: { type: 'string' } },
      strict: true,
    });

    if (!values.out) {
      throw new Error('usage: setup.mjs --out <dir>');
    }

    check({ out: resolve(values.out) }, deps);

    return 0;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('CLAIM:')) {
      console.error(String(e).replace(/\s+/g, ' '));

      return 1;
    }

    console.error(
      `[ERROR] could not run: ${e instanceof Error ? e.message : String(e)}`,
    );

    return 2;
  }
}

/** @type {Deps} */
const realDeps = {
  control: (args) => {
    const r = spawnSync(process.execPath, [CONTROL, ...args, '--json'], {
      cwd: ROOT,
      encoding: 'utf8',
      windowsHide: true,
      maxBuffer: 64 * 1024 * 1024,
      timeout: 600000,
    });

    return {
      code: r.status,
      json: jsonOf(r.stdout ?? ''),
      text: (r.stdout ?? '') + (r.stderr ?? ''),
    };
  },
  write: (file, data) => {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, data);
  },
};

if (
  process.argv[1] &&
  realpathSync.native(resolve(process.argv[1])) ===
    realpathSync.native(fileURLToPath(import.meta.url))
) {
  process.exitCode = main(process.argv.slice(2), realDeps);
}
