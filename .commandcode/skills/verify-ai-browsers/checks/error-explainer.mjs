// @ts-check
// Claim: on each named instance (every registry instance by default), the Angular AI DevTools extension's error
// explainer flow (N4) runs in the DevTools panel: a captured `NG0xxx` error is shown alongside its owning component
// and the matching digest entry, and "Explain" renders a non-empty answer through the panel-local Prompt API. The
// instance passes the state claim (checks/state.mjs), so the answer came from the instance's own model.
// Covers: control-ai-browsers features/error-explainer.md `error-explainer`.
// Needs: every named instance running with this checkout's extension (control-ai-browsers up <instance>; in a
// worktree or sidecar, down and then up <instance> --extension=extension), its panel built, and an Angular dev page,
// such as the counter fixture (control-angular-dev-app up --target counter).
// Usage: node .commandcode/skills/verify-ai-browsers/checks/error-explainer.mjs --evidence <dir> --url <app url> [instance...]
// Writes: <dir>/error-explainer.json, plus each control step's own evidence JSON in <dir>.
// Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run.
import { existsSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { printable } from '../../control-ai-browsers/scripts/fingerprint.mjs';
import { instanceState, loadRegistry, realDeps } from './state.mjs';

// The build under test: this checkout's extension folder, with the drive letter upper-cased as control.mjs stores it.
export const CHECKOUT_EXTENSION = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', 'extension').replace(/^[a-z]:/, (d) => d.toUpperCase());

/**
 * Whether two spellings name one folder (a short 8.3 name and its long form, the drive letter's case).
 * @param {unknown} a
 * @param {string} b
 * @returns {boolean}
 */
export function samePath(a, b) {
  if (typeof a !== 'string') {
    return false;
  }

  /** @param {string} p */
  const real = (p) => (existsSync(p) ? realpathSync.native(p) : p).toLowerCase();

  return real(a) === real(b);
}

/** @typedef {import('./state.mjs').Deps} Deps */
/** @typedef {import('./state.mjs').RegistryInstance} RegistryInstance */

/**
 * Runs the check; throws `CLAIM:` on a failed claim and any other error when it could not run.
 * @param {{ evidence: string, url: string, names: string[], extension?: string }} options
 * @param {Record<string, RegistryInstance>} registry
 * @param {Deps} deps
 * @returns {void}
 */
export function check({ evidence, url, names, extension = CHECKOUT_EXTENSION }, registry, deps) {
  const unknown = names.filter((n) => !Object.hasOwn(registry, n));

  if (unknown.length > 0) {
    throw new Error(`unknown instance ${unknown.join(', ')}; instances: ${Object.keys(registry).join(', ')}`);
  }

  /** @type {Record<string, unknown>} */
  const results = {};
  /** @type {string[]} */
  const failed = [];
  /** @type {string[]} */
  const couldNotRun = [];

  for (const name of names) {
    const want = /** @type {RegistryInstance} */ (registry[name]);
    // A shared instance may serve another checkout's build; proving that one would prove nothing about this checkout.
    const loaded = deps.control(['info', name]).json?.['extensionDir'];

    if (!samePath(loaded, extension)) {
      couldNotRun.push(`${name} serves the extension from ${String(loaded)}, not this checkout's ${extension}: run "down ${name}", then "up ${name} --extension=extension" here`);
      results[name] = { loaded };
      continue;
    }
    const panel = deps.control(['panel', name, `--url=${url}`]);
    const state = instanceState(name, want, deps);
    const answer = typeof panel.json?.['answer'] === 'string' ? panel.json['answer'] : null;
    results[name] = { panel: { exit: panel.code, answer, error: panel.json?.['error'] ?? null, answerMs: panel.json?.['answerMs'] ?? null, ngVersion: panel.json?.['ngVersion'] ?? null, extensionId: panel.json?.['extensionId'] ?? null }, state };

    if (panel.json === null || panel.code === 2 || panel.code === null) {
      couldNotRun.push(`panel ${name} exited ${panel.code}: ${String(panel.json?.['reason'] ?? panel.text.trim().slice(-300))}`);
      continue;
    }

    if (state.couldNotRun !== null) {
      couldNotRun.push(`${name}: ${state.couldNotRun}`);
      continue;
    }

    if (panel.code !== 0 || !answer?.trim()) {
      failed.push(`${name}: the panel showed no answer (${String(panel.json['error'] ?? `exit ${panel.code}`)})`);
    }

    failed.push(...state.failed.map((f) => `${name}: ${f}`));
  }

  deps.write(join(evidence, 'error-explainer.json'), JSON.stringify({ url, results }, null, 2));

  if (couldNotRun.length > 0) {
    throw new Error(couldNotRun.join('; '));
  }

  if (failed.length > 0) {
    throw new Error(`CLAIM: ${failed.join('; ')}`);
  }
}

/**
 * @param {string[]} argv
 * @param {(evidence: string) => Deps} makeDeps
 * @param {() => Record<string, RegistryInstance>} load
 * @returns {number}
 */
export function main(argv, makeDeps, load) {
  try {
    const { values, positionals } = parseArgs({ args: argv, options: { evidence: { type: 'string' }, url: { type: 'string' } }, allowPositionals: true, strict: true });

    if (!values.evidence || !values.url) {
      throw new Error('usage: error-explainer.mjs --evidence <dir> --url <app url> [instance...]');
    }

    const registry = load();
    const evidence = resolve(values.evidence);
    check({ evidence, url: values.url, names: positionals.length > 0 ? positionals : Object.keys(registry) }, registry, makeDeps(evidence));

    return 0;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('CLAIM:')) {
      console.error(printable(String(e).replace(/\s+/g, ' ')));

      return 1;
    }

    console.error(printable(`[ERROR] could not run: ${e instanceof Error ? e.message : String(e)}`));

    return 2;
  }
}

if (process.argv[1] && realpathSync.native(resolve(process.argv[1])) === realpathSync.native(fileURLToPath(import.meta.url))) {
  process.exitCode = main(process.argv.slice(2), realDeps, loadRegistry);
}