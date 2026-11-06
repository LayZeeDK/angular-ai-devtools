// @ts-check
// Claim: on each named instance (every registry instance by default), the Angular AI DevTools extension's DI doctor
// flow (N3) runs in the DevTools panel: querying an injector returns `angular-ai:di-graph` with a `DiResolutionPath`,
// and the resolution path / diff renders, explained through the panel-local Prompt API. The instance passes the state
// claim (checks/state.mjs), so the answer came from the instance's own model.
// Covers: control-ai-browsers features/di-doctor.md `di-doctor`.
// Needs: every named instance running with this checkout's extension (control-ai-browsers up <instance>; in a
// worktree or sidecar, down and then up <instance> --extension=extension), its panel built, and an Angular dev page,
// such as the counter fixture (control-angular-dev-app up --target counter).
// Usage: node .commandcode/skills/verify-ai-browsers/checks/di-doctor.mjs --evidence <dir> --url <app url> [instance...]
// Writes: <dir>/di-doctor.json, plus each control step's own evidence JSON in <dir>.
// Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run.
import { existsSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { printable } from '../../control-ai-browsers/scripts/fingerprint.mjs';
import { instanceState, loadRegistry, realDeps } from './state.mjs';

export const CHECKOUT_EXTENSION = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  '..',
  'extension',
).replace(/^[a-z]:/, (d) => d.toUpperCase());

/** @param {any} a @param {string} b @returns {boolean} */
export function samePath(a, b) {
  if (typeof a !== 'string') return false;
  const real = /** @param {any} p */ (p) =>
    (existsSync(p) ? realpathSync.native(p) : p).toLowerCase();
  return real(a) === real(b);
}

/** @param {any} options @param {any} registry @param {any} deps @returns {void} */
export function check(options, registry, deps) {
  const { evidence, url, names, extension = CHECKOUT_EXTENSION } = options;
  const unknown = names.filter(
    /** @param {any} n */ (n) => !Object.hasOwn(registry, n),
  );
  if (unknown.length > 0) {
    throw new Error(
      `unknown instance ${unknown.join(', ')}; instances: ${Object.keys(registry).join(', ')}`,
    );
  }
  /** @type {Record<string, any>} */
  const results = {};
  /** @type {string[]} */
  const failed = [];
  /** @type {string[]} */
  const couldNotRun = [];
  for (const name of names) {
    const want = registry[name];
    const loaded = deps.control(['info', name]).json?.['extensionDir'];
    if (!samePath(loaded, extension)) {
      couldNotRun.push(
        `${name} serves the extension from ${String(loaded)}, not this checkout's ${extension}: run "down ${name}", then "up ${name} --extension=extension" here`,
      );
      results[name] = { loaded };
      continue;
    }
    const panel = deps.control(['panel', name, `--url=${url}`]);
    const state = instanceState(name, want, deps);
    const answer =
      typeof panel.json?.['answer'] === 'string' ? panel.json['answer'] : null;
    results[name] = {
      panel: {
        exit: panel.code,
        answer,
        error: panel.json?.['error'] ?? null,
        answerMs: panel.json?.['answerMs'] ?? null,
        ngVersion: panel.json?.['ngVersion'] ?? null,
        extensionId: panel.json?.['extensionId'] ?? null,
      },
      state,
    };
    if (panel.json === null || panel.code === 2 || panel.code === null) {
      couldNotRun.push(
        `panel ${name} exited ${panel.code}: ${String(panel.json?.['reason'] ?? panel.text.trim().slice(-300))}`,
      );
      continue;
    }
    if (state.couldNotRun !== null) {
      couldNotRun.push(`${name}: ${state.couldNotRun}`);
      continue;
    }
    if (panel.code !== 0 || !answer?.trim()) {
      failed.push(
        `${name}: the panel showed no answer (${String(panel.json['error'] ?? `exit ${panel.code}`)})`,
      );
    }
    failed.push(...state.failed.map((f) => `${name}: ${f}`));
  }
  deps.write(
    join(evidence, 'di-doctor.json'),
    JSON.stringify({ url, results }, null, 2),
  );
  if (couldNotRun.length > 0) throw new Error(couldNotRun.join('; '));
  if (failed.length > 0) throw new Error(`CLAIM: ${failed.join('; ')}`);
}

/** @param {any} argv @param {any} makeDeps @param {any} load @returns {number} */
export function main(argv, makeDeps, load) {
  try {
    const { values, positionals } = parseArgs({
      args: argv,
      options: { evidence: { type: 'string' }, url: { type: 'string' } },
      allowPositionals: true,
      strict: true,
    });
    if (!values.evidence || !values.url) {
      throw new Error(
        'usage: di-doctor.mjs --evidence <dir> --url <app url> [instance...]',
      );
    }
    const registry = load();
    const evidence = resolve(values.evidence);
    check(
      {
        evidence,
        url: values.url,
        names: positionals.length > 0 ? positionals : Object.keys(registry),
      },
      registry,
      makeDeps(evidence),
    );
    return 0;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('CLAIM:')) {
      console.error(printable(String(e).replace(/\s+/g, ' ')));
      return 1;
    }
    console.error(
      printable(
        `[ERROR] could not run: ${e instanceof Error ? e.message : String(e)}`,
      ),
    );
    return 2;
  }
}

if (
  process.argv[1] &&
  realpathSync.native(resolve(process.argv[1])) ===
    realpathSync.native(fileURLToPath(import.meta.url))
) {
  process.exitCode = main(process.argv.slice(2), realDeps, loadRegistry);
}
