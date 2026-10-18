// @ts-check
// Claim: the devtools server control-pangular-inspector started is read-only: MCP tools/list answers with no action
// tool (navigate, fill-form, form-action, highlight and the rest), and `call navigate` without `--confirm` is
// refused by control-pangular-inspector (exit 2, `refused: navigate ... pass --confirm`).
// Covers: control-pangular-inspector features/README.md (read-only unless `--allow-actions`; action tools need
// `call ... --confirm`) and its SKILL.md Helpers (`tools`, `call`).
// Needs: the portal (control-angular-dev-app up --target portal) and control-pangular-inspector up on it.
// Usage: node .claude/skills/verify-pangular-inspector/checks/read-only.mjs --out <dir>
// Writes: <dir>/tools-list.json, navigate-refused.json.
// Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run.
import { spawnSync } from 'node:child_process';
import { mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..', '..', '..');
const CONTROL = join(ROOT, '.claude', 'skills', 'control-pangular-inspector', 'scripts', 'control.mjs');

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
  const tools = deps.control(['tools']);
  deps.write(join(out, 'tools-list.json'), JSON.stringify({ exit: tools.code, result: tools.json ?? tools.text }, null, 2));

  if (tools.code !== 0 || tools.json === null || !Array.isArray(tools.json['actionToolsPresent'])) {
    throw new Error(`control.mjs tools exited ${tools.code}: ${tools.text.trim().slice(-400)}`);
  }

  const navigate = deps.control(['call', 'navigate', '--args', '{"action":"navigate","url":"/home"}']);
  deps.write(join(out, 'navigate-refused.json'), JSON.stringify({ exit: navigate.code, result: navigate.json ?? navigate.text }, null, 2));

  if (navigate.code === null) {
    throw new Error(`control.mjs call navigate did not finish: ${navigate.text.trim().slice(-300)}`);
  }

  /** @type {unknown[]} */
  const actions = tools.json['actionToolsPresent'];
  /** @type {string[]} */
  const failed = [];

  if (actions.length > 0) {
    failed.push(`tools/list offers action tools: ${actions.join(', ')}`);
  }

  const reason = String(navigate.json?.['reason'] ?? '');

  if (navigate.code !== 2 || !reason.startsWith('refused: navigate')) {
    failed.push(`call navigate without --confirm exited ${navigate.code}, not 2 with its --confirm refusal: ${(reason || navigate.text.trim()).slice(-300)}`);
  }

  if (failed.length > 0) {
    throw new Error(`CLAIM: ${failed.join('; ')}`);
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
      throw new Error('usage: read-only.mjs --out <dir>');
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
