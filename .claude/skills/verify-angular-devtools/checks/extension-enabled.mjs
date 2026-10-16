// @ts-check
// Claim: in the test harness, Angular DevTools is loaded and enabled: control-angular-devtools doctor's `extension`
// line passes (chrome://extensions reports the copy ENABLED and its service worker runs).
// Covers: control-angular-devtools features/install.md, sub-feature Status (test: the enabled state from doctor).
// Needs: control-angular-devtools up --app-url <a dev-mode Angular app>.
// Usage: node .claude/skills/verify-angular-devtools/checks/extension-enabled.mjs --out <dir>
// Writes: <dir>/extension.json.
// Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run.
import { spawnSync } from 'node:child_process';
import { mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..', '..', '..');
const CONTROL = join(ROOT, '.claude', 'skills', 'control-angular-devtools', 'scripts', 'control.mjs');

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
  const doctor = deps.control(['doctor']);
  deps.write(join(out, 'extension.json'), JSON.stringify({ exit: doctor.code, result: doctor.json ?? doctor.text }, null, 2));

  if (doctor.json === null || (doctor.code !== 0 && doctor.code !== 1) || !Array.isArray(doctor.json['checks'])) {
    throw new Error(`control.mjs doctor exited ${doctor.code}: ${doctor.text.trim().slice(-400)}`);
  }

  /** @type {unknown[]} */
  const checks = doctor.json['checks'];
  const line = checks.find((c) => c !== null && typeof c === 'object' && /** @type {Record<string, unknown>} */ (c)['name'] === 'extension');
  const ext = /** @type {Record<string, unknown> | undefined} */ (line);

  if (ext?.['ok'] !== true) {
    throw new Error(`CLAIM: doctor's extension line ${ext ? `failed: ${String(ext['detail'])}` : 'is missing'}`);
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
      throw new Error('usage: extension-enabled.mjs --out <dir>');
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
