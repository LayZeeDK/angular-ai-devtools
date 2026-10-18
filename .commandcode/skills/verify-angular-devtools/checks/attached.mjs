// @ts-check
// Claim: Angular DevTools attaches to the dev-mode app in the test harness: control-angular-devtools `attach`
// passes: `__NG_DEVTOOLS_CONNECTED__` set, `detectAngular` reports Angular in debug mode, and the backend is
// installed and ready.
// Covers: control-angular-devtools features/attach.md sub-features Connected flag, Detection result and Backend
// injection (handshake and Angular version are saved in attach.json, not judged).
// Needs: control-angular-devtools up --app-url <a dev-mode Angular app>.
// Usage: node .commandcode/skills/verify-angular-devtools/checks/attached.mjs --out <dir>
// Writes: <dir>/attach.json.
// Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run.
import { spawnSync } from 'node:child_process';
import { mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..', '..', '..');
const CONTROL = join(ROOT, '.commandcode', 'skills', 'control-angular-devtools', 'scripts', 'control.mjs');

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

    return value !== null && typeof value === 'object' && !Array.isArray(value) ? /** @type {Record<string, unknown>} */ (value) : null;
  } catch {
    return null;
  }
}

/**
 * Runs the check; throws `CLAIM:` on the wrong state and any other error when it could not run.
 * @param {{ out: string }} options
 * @param {Deps} deps
 * @returns {void}
 */
export function check({ out }, deps) {
  const attach = deps.control(['attach']);
  deps.write(join(out, 'attach.json'), JSON.stringify({ exit: attach.code, result: attach.json ?? attach.text }, null, 2));

  if (attach.json === null || (attach.code !== 0 && attach.code !== 1)) {
    throw new Error(`control.mjs attach exited ${attach.code}: ${attach.text.trim().slice(-400)}`);
  }

  if (attach.json['ok'] !== true) {
    throw new Error(`CLAIM: attach exited ${attach.code}: ${String(attach.json['reason'] ?? 'no reason given').slice(0, 600)}`);
  }
}

/**
 * @param {string[]} argv
 * @param {Deps} deps
 * @returns {number}
 */
export function main(argv, deps) {
  try {
    const { values } = parseArgs({ args: argv, options: { out: { type: 'string' } }, strict: true });

    if (!values.out) {
      throw new Error('usage: attached.mjs --out <dir>');
    }

    check({ out: resolve(values.out) }, deps);

    return 0;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('CLAIM:')) {
      console.error(String(e).replace(/\s+/g, ' '));

      return 1;
    }

    console.error(`[ERROR] could not run: ${e instanceof Error ? e.message : String(e)}`);

    return 2;
  }
}

/** @type {Deps} */
const realDeps = {
  control: (args) => {
    const r = spawnSync(process.execPath, [CONTROL, ...args, '--json'], { cwd: ROOT, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024, timeout: 600000 });

    return { code: r.status, json: jsonOf(r.stdout ?? ''), text: (r.stdout ?? '') + (r.stderr ?? '') };
  },
  write: (file, data) => {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, data);
  },
};

if (process.argv[1] && realpathSync.native(resolve(process.argv[1])) === realpathSync.native(fileURLToPath(import.meta.url))) {
  process.exitCode = main(process.argv.slice(2), realDeps);
}
