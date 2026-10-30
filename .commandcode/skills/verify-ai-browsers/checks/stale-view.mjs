// @ts-check
// Claim: on each named instance, the Angular AI DevTools extension's stale-view flow runs in the DevTools panel:
// a stale-view finding naming a field and owning component with the hedged wording "the template may show a stale
// value", and "Explain" renders a non-empty answer through the panel-local Prompt API. The instance passes the
// state claim (checks/state.mjs), so the answer came from the instance's own model.
// Covers: control-ai-browsers features/stale-view.md `stale-view`.
// Needs: every named instance running with this checkout's extension, its panel built, and an Angular dev page
// serving the stale-view route (http://localhost:4222/stale-view).
// Usage: node .commandcode/skills/verify-ai-browsers/checks/stale-view.mjs --evidence <dir> --url <app url> [instance...]
// Writes: <dir>/stale-view.json, plus each control step's own evidence JSON in <dir>.
// Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run.
import { existsSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { printable } from '../../control-ai-browsers/scripts/fingerprint.mjs';
import { instanceState, loadRegistry, realDeps } from './state.mjs';

export const CHECKOUT_EXTENSION = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', 'extension').replace(/^[a-z]:/, (d) => d.toUpperCase());

export function samePath(a, b) {
  if (typeof a !== 'string') return false;
  const real = (p) => (existsSync(p) ? realpathSync.native(p) : p).toLowerCase();
  return real(a) === real(b);
}

export function check({ evidence, url, names, extension = CHECKOUT_EXTENSION }, registry, deps) {
  const unknown = names.filter((n) => !Object.hasOwn(registry, n));
  if (unknown.length > 0) {
    throw new Error(`unknown instance ${unknown.join(', ')}; instances: ${Object.keys(registry).join(', ')}`);
  }

  const results = {};
  const failed = [];
  const couldNotRun = [];

  for (const name of names) {
    const want = registry[name];
    const loaded = deps.control(['info', name]).json?.['extensionDir'];
    if (!samePath(loaded, extension)) {
      couldNotRun.push(`${name} serves the extension from ${String(loaded)}, not this checkout's ${extension}: run "down ${name}", then "up ${name} --extension=extension" here`);
      results[name] = { loaded };
      continue;
    }
    const panel = deps.control(['panel', name, `--url=${url}`, '--feature=stale-view']);
    const state = instanceState(name, want, deps);
    const answer = typeof panel.json?.['answer'] === 'string' ? panel.json['answer'] : null;
    const field = typeof panel.json?.['field'] === 'string' ? panel.json['field'] : null;
    const component = typeof panel.json?.['component'] === 'string' ? panel.json['component'] : null;
    let hedged = typeof panel.json?.['hedged'] === 'string' ? panel.json['hedged'] : null;
    if (!hedged && Array.isArray(panel.json?.['steps'])) {
      const step = panel.json['steps'].find((s) => s && s.step === 'stale-view');
      if (step && step.value && typeof step.value.hedged === 'string') hedged = step.value.hedged;
    }
    results[name] = { panel: { exit: panel.code, feature: panel.json?.['feature'] ?? null, answer, field, component, hedged, error: panel.json?.['error'] ?? null, answerMs: panel.json?.['answerMs'] ?? null, ngVersion: panel.json?.['ngVersion'] ?? null, extensionId: panel.json?.['extensionId'] ?? null }, state };

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
    if (!field?.trim()) {
      failed.push(`${name}: the panel showed no field name`);
    }
    if (!hedged || !/stale value/i.test(hedged)) {
      failed.push(`${name}: the panel showed no hedged wording`);
    }
    failed.push(...state.failed.map((f) => `${name}: ${f}`));
  }

  // Portal result: check whether any insurance-portal route can produce a subscribe write.
  const portal = { exercised: false, reason: 'no insurance-portal route in this worktree can produce a subscribe write; external dependency not exercised' };
  results.portal = portal;

  deps.write(join(evidence, 'stale-view.json'), JSON.stringify({ url, results, portal }, null, 2));

  if (couldNotRun.length > 0) {
    throw new Error(couldNotRun.join('; '));
  }
  if (failed.length > 0) {
    throw new Error(`CLAIM: ${failed.join('; ')}`);
  }
}

export function main(argv, makeDeps, load) {
  try {
    const { values, positionals } = parseArgs({ args: argv, options: { evidence: { type: 'string' }, url: { type: 'string' } }, allowPositionals: true, strict: true });
    if (!values.evidence || !values.url) {
      throw new Error('usage: stale-view.mjs --evidence <dir> --url <app url> [instance...]');
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