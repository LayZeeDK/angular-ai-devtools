// @ts-check
// Claim: an in-page AI extension's use of Angular's debug APIs coexists with Angular DevTools in the test harness:
// control-angular-devtools `coexist` reports the profiler part (two ng.ɵsetProfiler subscribers count while
// DevTools records, the removed one stops, DevTools recorded the cycles), the connected flag still true, and the
// signal graph pane listing the same nodes as ng.ɵgetSignalGraph, all passing. With --di-graph it also runs
// angular:di_graph last and records whether the template node is lost (the known Angular bug), without judging it.
// Covers: control-angular-devtools features/profiler.md sub-feature Coexistence, features/signal-graph.md
// sub-features Agreement and the `angular:di_graph` regression (recorded), and features/attach.md Connected flag.
// Needs: control-angular-devtools up --app-url <the counter fixture>; with --di-graph, run it last on that page.
// Usage: node .claude/skills/verify-angular-devtools/checks/coexist.mjs --out <dir> [--di-graph]
// Writes: <dir>/coexist-result.json (control-angular-devtools adds coexist.json and screenshots to its own evidence dir).
// Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run.
import { spawnSync } from 'node:child_process';
import { mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..', '..', '..');
const CONTROL = join(ROOT, '.claude', 'skills', 'control-angular-devtools', 'scripts', 'control.mjs');
const PARTS = ['profiler', 'flag', 'signalGraph'];

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
 * A field of a JSON object, or undefined when `value` is not an object.
 * @param {unknown} value
 * @param {string} key
 * @returns {unknown}
 */
export function field(value, key) {
  return value !== null && typeof value === 'object' ? /** @type {Record<string, unknown>} */ (value)[key] : undefined;
}

/**
 * Runs the check; throws `CLAIM:` on the wrong state and any other error when it could not run.
 * @param {{ out: string, diGraph: boolean }} options
 * @param {Deps} deps
 * @returns {void}
 */
export function check({ out, diGraph }, deps) {
  const r = deps.control(diGraph ? ['coexist', '--di-graph'] : ['coexist']);
  const parts = Object.fromEntries(PARTS.map((p) => [p, field(field(r.json, p), 'ok') === true]));
  const di = field(r.json, 'diGraph');
  const recorded = di === undefined ? null : { templateLostInPane: field(di, 'templateLostInPane') ?? null, templateLostInNg: field(di, 'templateLostInNg') ?? null };
  deps.write(join(out, 'coexist-result.json'), JSON.stringify({ exit: r.code, parts, diGraph: recorded, result: r.json ?? r.text }, null, 2));

  if (r.json === null || (r.code !== 0 && r.code !== 1)) {
    throw new Error(`control.mjs coexist exited ${r.code}: ${r.text.trim().slice(-400)}`);
  }

  const failed = PARTS.filter((p) => !parts[p]);

  if (failed.length > 0) {
    const seen = failed.map((p) => `${p} ${JSON.stringify(field(r.json, p) ?? null).slice(0, 300)}`);
    throw new Error(`CLAIM: coexist exited ${r.code}; failed ${seen.join('; ')}`);
  }
}

/**
 * @param {string[]} argv
 * @param {Deps} deps
 * @returns {number}
 */
export function main(argv, deps) {
  try {
    const { values } = parseArgs({ args: argv, options: { out: { type: 'string' }, 'di-graph': { type: 'boolean' } }, strict: true });

    if (!values.out) {
      throw new Error('usage: coexist.mjs --out <dir> [--di-graph]');
    }

    check({ out: resolve(values.out), diGraph: values['di-graph'] === true }, deps);

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
