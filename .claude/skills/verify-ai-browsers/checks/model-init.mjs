// @ts-check
// Claim: on the named instance, control-ai-browsers `model init` exits 0 and reads the registry `contextWindow`,
// and the instance then passes the state claim (checks/state.mjs: doctor, flags, the registry model on disk and
// served). Run after the model cycle in the spec's setup (down, model clear, up, model download), it proves that
// clearing, downloading and initialising the instance's own model works end to end.
// Covers: control-ai-browsers features/model-lifecycle.md `model-init` (after `model-clear` and `model-download`).
// Needs: the instance running with its model downloaded.
// Usage: node .commandcode/skills/verify-ai-browsers/checks/model-init.mjs --evidence <dir> <instance>
// Writes: <dir>/model-init.json, plus each control step's own evidence JSON in <dir>.
// Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run.
import { realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { printable } from '../../control-ai-browsers/scripts/fingerprint.mjs';
import { instanceState, loadRegistry, realDeps } from './state.mjs';

/** @typedef {import('./state.mjs').Deps} Deps */
/** @typedef {import('./state.mjs').RegistryInstance} RegistryInstance */

/**
 * Runs the check; throws `CLAIM:` on the wrong state and any other error when it could not run.
 * @param {{ evidence: string, name: string }} options
 * @param {Record<string, RegistryInstance>} registry
 * @param {Deps} deps
 * @returns {void}
 */
export function check({ evidence, name }, registry, deps) {
  if (!Object.hasOwn(registry, name)) {
    throw new Error(`unknown instance ${name}; instances: ${Object.keys(registry).join(', ')}`);
  }

  const want = /** @type {RegistryInstance} */ (registry[name]);
  const init = deps.control(['model', 'init', name]);

  if (init.json === null || init.code === 2 || init.code === null) {
    throw new Error(`model init ${name} exited ${init.code}: ${String(init.json?.['reason'] ?? init.text.trim().slice(-300))}`);
  }

  const state = instanceState(name, want, deps);
  const contextWindow = init.json['contextWindow'] ?? null;
  deps.write(
    join(evidence, 'model-init.json'),
    JSON.stringify(
      {
        init: { exit: init.code, contextWindow, firstCreateMs: init.json['firstCreateMs'] ?? null, secondCreateMs: init.json['secondCreateMs'] ?? null, answer: init.json['answer'] ?? null },
        state,
      },
      null,
      2,
    ),
  );

  if (state.couldNotRun !== null) {
    throw new Error(`${name}: ${state.couldNotRun}`);
  }

  /** @type {string[]} */
  const failed = [];

  if (init.code !== 0) {
    failed.push(`model init exited ${init.code}`);
  }

  if (contextWindow !== want.model.contextWindow) {
    failed.push(`contextWindow ${JSON.stringify(contextWindow)}, registry ${want.model.contextWindow}`);
  }

  failed.push(...state.failed);

  if (failed.length > 0) {
    throw new Error(`CLAIM: ${name}: ${failed.join(', ')}`);
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
    const { values, positionals } = parseArgs({ args: argv, options: { evidence: { type: 'string' } }, allowPositionals: true, strict: true });
    const [name, ...rest] = positionals;

    if (!values.evidence || name === undefined || rest.length > 0) {
      throw new Error('usage: model-init.mjs --evidence <dir> <instance>');
    }

    const evidence = resolve(values.evidence);
    check({ evidence, name }, load(), makeDeps(evidence));

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
