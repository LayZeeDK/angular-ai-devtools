// @ts-check
// Claim: on each named instance, the Angular AI DevTools extension's interop flow runs in the DevTools panel:
// a sliced toSignal/interop node set with at least one node, the stated limits (it cannot name the feeding
// Observable, the operator chain or emission timing), the "inferred, untested" attribution wording, and
// "Explain" rendering a non-empty answer through the panel-local Prompt API. The instance passes the state claim
// (checks/state.mjs), so the answer came from the instance's own model.
// Covers: control-ai-browsers features/interop.md `interop`.
// Needs: every named instance running with this checkout's extension, its panel built, and an Angular dev page
// serving the deferred fixture route `/stale-view-deferred` (spikes/ng222-app), which uses toSignal and defers
// its error effect so the panel can capture a sliced node set.
// Usage: node .commandcode/skills/verify-ai-browsers/checks/interop.mjs --evidence <dir> --url <app url> [instance...]
//   where <app url> serves `/stale-view-deferred` (e.g. http://localhost:<port>/stale-view-deferred); no port is hard-coded.
// Writes: <dir>/interop.json, plus each control step's own evidence JSON in <dir>.
// Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run.
import { existsSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { printable } from '../../control-ai-browsers/scripts/text.mjs';
import { instanceState, loadRegistry, realDeps } from './state.mjs';

/** @typedef {import('./state.mjs').Deps} Deps */
/** @typedef {import('./state.mjs').RegistryInstance} RegistryInstance */
/** @typedef {import('./state.mjs').InstanceState} InstanceState */

export const CHECKOUT_EXTENSION = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  '..',
  'extension',
).replace(/^[a-z]:/, (d) => d.toUpperCase());

/** The three naming limits the panel must state; a claim without them would imply tracing the Observable. */
export const LIMIT_TERMS = ['observable', 'operator', 'emission'];

/**
 * @param {unknown} a
 * @param {string} b
 * @returns {boolean}
 */
export function samePath(a, b) {
  if (typeof a !== 'string') return false;
  /** @param {string} p */
  const real = (p) =>
    (existsSync(p) ? realpathSync.native(p) : p).toLowerCase();
  return real(a) === real(b);
}

/**
 * @param {string | null} limits
 * @returns {string[]}
 */
export function missingLimitTerms(limits) {
  const text = (limits ?? '').toLowerCase();
  return LIMIT_TERMS.filter((term) => !text.includes(term));
}

/**
 * @param {{ evidence: string, url: string, names: string[], extension?: string }} options
 * @param {Record<string, RegistryInstance>} registry
 * @param {Deps} deps
 * @returns {void}
 */
export function check(
  { evidence, url, names, extension = CHECKOUT_EXTENSION },
  registry,
  deps,
) {
  const unknown = names.filter((n) => !Object.hasOwn(registry, n));
  if (unknown.length > 0) {
    throw new Error(
      `unknown instance ${unknown.join(', ')}; instances: ${Object.keys(registry).join(', ')}`,
    );
  }

  /** @type {Record<string, unknown>} */
  const results = {};
  /** @type {string[]} */
  const failed = [];
  /** @type {string[]} */
  const couldNotRun = [];

  for (const name of names) {
    const want = /** @type {RegistryInstance} */ (registry[name]);
    const loaded = deps.control(['info', name]).json?.['extensionDir'];
    if (!samePath(loaded, extension)) {
      couldNotRun.push(
        `${name} serves the extension from ${String(loaded)}, not this checkout's ${extension}: run "down ${name}", then "up ${name} --extension=extension" here`,
      );
      results[name] = { loaded };
      continue;
    }
    const panel = deps.control([
      'panel',
      name,
      `--url=${url}`,
      '--feature=interop',
    ]);
    const state = instanceState(name, want, deps);
    const answer =
      typeof panel.json?.['answer'] === 'string' ? panel.json['answer'] : null;
    const limits =
      typeof panel.json?.['limits'] === 'string' ? panel.json['limits'] : null;
    const inferred =
      typeof panel.json?.['inferred'] === 'string'
        ? panel.json['inferred']
        : null;
    const nodes =
      typeof panel.json?.['nodes'] === 'number' ? panel.json['nodes'] : 0;
    const route =
      typeof panel.json?.['route'] === 'string' ? panel.json['route'] : null;
    results[name] = {
      panel: {
        exit: panel.code,
        feature: panel.json?.['feature'] ?? null,
        route,
        answer,
        limits,
        inferred,
        nodes,
        error: panel.json?.['error'] ?? null,
        answerMs: panel.json?.['answerMs'] ?? null,
        ngVersion: panel.json?.['ngVersion'] ?? null,
        extensionId: panel.json?.['extensionId'] ?? null,
      },
      state,
    };

    // The interop tab does not exist until the milestone that builds it lands; an app that serves
    // another panel for the route is could-not-run, so a prepared check reads honestly before it ships.
    if (route !== null && !/\/panel\/interop\/?$/.test(route)) {
      couldNotRun.push(
        `${name}: the app has no interop panel route yet (served ${route})`,
      );
      continue;
    }

    if (panel.json === null || panel.code === 2 || panel.code === null) {
      couldNotRun.push(
        `panel ${name} exited ${panel.code}: ${String(panel.json?.['reason'] ?? panel.text.trim().slice(-300))}`,
      );
      continue;
    }

    // A panel build that predates the interop tab shows no slice selector at all.
    const panelError = String(panel.json?.['error'] ?? '');
    if (panel.code !== 0 && /interop-slice/.test(panelError)) {
      couldNotRun.push(
        `${name}: the panel build has no interop slice yet (${panelError.slice(0, 160)})`,
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
    if (nodes < 1) {
      failed.push(`${name}: the panel rendered no interop slice node`);
    }
    const missing = missingLimitTerms(limits);
    if (missing.length > 0) {
      failed.push(
        `${name}: the panel did not state the limit${missing.length > 1 ? 's' : ''} ${missing.join(', ')}`,
      );
    }
    if (!/inferred,? untested/i.test(inferred ?? '')) {
      failed.push(
        `${name}: the panel did not word the attribution "inferred, untested"`,
      );
    }
    failed.push(...state.failed.map((f) => `${name}: ${f}`));
  }

  deps.write(
    join(evidence, 'interop.json'),
    JSON.stringify({ url, results }, null, 2),
  );

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
    const { values, positionals } = parseArgs({
      args: argv,
      options: {
        evidence: { type: 'string' },
        url: { type: 'string' },
        extension: { type: 'string' },
      },
      allowPositionals: true,
      strict: true,
    });
    if (!values.evidence || !values.url) {
      throw new Error(
        'usage: interop.mjs --evidence <dir> --url <app url> [--extension <dir>] [instance...]',
      );
    }
    const registry = load();
    const evidence = resolve(values.evidence);
    // --extension names the extension directory the running instance must serve. A verify
    // sidecar is a different checkout path, so the default (this file's checkout) cannot match
    // an instance loaded from the primary; the caller states the expected directory instead.
    /** @type {{ evidence: string, url: string, names: string[], extension?: string }} */
    const targets = {
      evidence,
      url: values.url,
      names: positionals.length > 0 ? positionals : Object.keys(registry),
    };
    if (values.extension) targets.extension = resolve(values.extension);
    check(targets, registry, makeDeps(evidence));
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
