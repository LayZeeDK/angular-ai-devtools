// @ts-check
// Claim: each named per-model browser instance (every instance in instances.json when none is named) is healthy and
// serves its registry model: control-ai-browsers `doctor` exits 0, `flags` exits 0 (the effective features match
// the registry), `model info` finds the registry model's manifest on disk, and on-device-internals Broker State
// serves that model.
// Covers: control-ai-browsers features/health-check.md `health-doctor`, features/instances.md `instances-features`,
// and features/model-lifecycle.md `model-info`.
// Needs: every named instance running (control-ai-browsers up <instance>).
// Usage: node .commandcode/skills/verify-ai-browsers/checks/state.mjs --evidence <dir> [<instance>...]
// Writes: <dir>/state.json, plus each control step's own evidence JSON in <dir>.
// Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { printable } from '../../control-ai-browsers/scripts/fingerprint.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..', '..', '..');
const CONTROL_DIR = join(ROOT, '.commandcode', 'skills', 'control-ai-browsers');

/** @typedef {{ code: number | null, json: Record<string, unknown> | null, text: string }} StepResult */
/** @typedef {{ model: { name: string, contextWindow: number } }} RegistryInstance */
/**
 * @typedef {object} Deps
 * @property {(args: string[]) => StepResult} control  control-ai-browsers' control.mjs; the check adds `--json` and `--evidence`
 * @property {(file: string, data: string) => void} write
 */
/**
 * @typedef {object} InstanceState
 * @property {string} instance
 * @property {boolean} pass
 * @property {string[]} failed  what did not hold, each with what was seen
 * @property {string | null} couldNotRun  why a step could not run, or null
 * @property {Record<string, unknown>} readings  the model, backend and performance class read
 */

/**
 * The JSON object on the last line that starts with `{` (control-ai-browsers prints one line with `--json`).
 * @param {string} stdout
 * @returns {Record<string, unknown> | null}
 */
export function jsonOf(stdout) {
  const line = stdout
    .split(/\r?\n/)
    .filter((l) => l.startsWith('{'))
    .pop();

  if (line === undefined) {
    return null;
  }

  try {
    /** @type {unknown} */
    const value = JSON.parse(line);

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
 * The registry's instances, read from control-ai-browsers/instances.json.
 * @param {string} text
 * @returns {Record<string, RegistryInstance>}
 */
export function registryOf(text) {
  /** @type {unknown} */
  const parsed = JSON.parse(text);
  const instances =
    parsed !== null && typeof parsed === 'object'
      ? /** @type {Record<string, unknown>} */ (parsed)['instances']
      : undefined;

  if (instances === null || typeof instances !== 'object') {
    throw new Error('instances.json has no instances object');
  }

  for (const [name, entry] of Object.entries(instances)) {
    const model =
      entry !== null && typeof entry === 'object'
        ? /** @type {Record<string, unknown>} */ (entry)['model']
        : undefined;
    const m =
      model !== null && typeof model === 'object'
        ? /** @type {Record<string, unknown>} */ (model)
        : {};

    if (
      typeof m['name'] !== 'string' ||
      typeof m['contextWindow'] !== 'number'
    ) {
      throw new Error(
        `instances.json entry ${name} has no model.name and model.contextWindow`,
      );
    }
  }

  return /** @type {Record<string, RegistryInstance>} */ (instances);
}

/**
 * One instance's doctor, flags and model info, judged against its registry entry. Never throws for a claim failure.
 * @param {string} name
 * @param {RegistryInstance} want
 * @param {Deps} deps
 * @returns {InstanceState}
 */
export function instanceState(name, want, deps) {
  /** @type {string[]} */
  const failed = [];
  const steps = [
    ['doctor', name],
    ['flags', name],
    ['model', 'info', name],
  ].map((args) => ({ args, r: deps.control(args) }));
  const broken = steps.find(
    ({ r }) => r.json === null || (r.code !== 0 && r.code !== 1),
  );

  if (broken) {
    return {
      instance: name,
      pass: false,
      failed,
      couldNotRun: `${broken.args.join(' ')} exited ${broken.r.code}: ${String(broken.r.json?.['reason'] ?? broken.r.text.trim().slice(-300))}`,
      readings: {},
    };
  }

  const [doctor, flags, info] = steps.map(
    ({ r }) =>
      /** @type {StepResult & { json: Record<string, unknown> }} */ (r),
  );

  if (!doctor || !flags || !info) {
    throw new Error('unreachable: three steps ran');
  }

  if (doctor.code !== 0) {
    const bad = records(doctor.json['checks'])
      .filter((c) => c['pass'] === false)
      .map((c) => String(c['id']));
    failed.push(
      `doctor exited ${doctor.code} (failed: ${bad.join(', ') || 'none listed'})`,
    );
  }

  if (flags.code !== 0) {
    failed.push(`flags exited ${flags.code}`);
  }

  const onDisk = records(info.json['disk']).some(
    (m) => m['name'] === want.model.name,
  );
  const serving = info.json['serving'] ?? null;

  if (info.code !== 0) {
    failed.push(`model info exited ${info.code}`);
  }

  if (!onDisk) {
    failed.push(`no ${want.model.name} manifest on disk`);
  }

  if (serving !== want.model.name) {
    failed.push(
      `Broker State serves ${JSON.stringify(serving)}, not ${want.model.name}`,
    );
  }

  const backend = info.json['backend'];

  return {
    instance: name,
    pass: failed.length === 0,
    failed,
    couldNotRun: null,
    readings: {
      expected: want.model.name,
      disk: onDisk,
      serving,
      backend:
        backend !== null && typeof backend === 'object'
          ? (/** @type {Record<string, unknown>} */ (backend)['backendType'] ??
            null)
          : null,
      requestedBackend: info.json['requestedBackend'] ?? null,
      performanceClass: info.json['performanceClass'] ?? null,
    },
  };
}

/**
 * Throws for a list of instance states: a plain error when any could not run, else `CLAIM:` when any failed.
 * @param {InstanceState[]} states
 * @returns {void}
 */
export function decide(states) {
  const stuck = states.filter((s) => s.couldNotRun !== null);

  if (stuck.length > 0) {
    throw new Error(
      stuck.map((s) => `${s.instance}: ${s.couldNotRun}`).join('; '),
    );
  }

  const bad = states.filter((s) => !s.pass);

  if (bad.length > 0) {
    throw new Error(
      `CLAIM: ${bad.map((s) => `${s.instance}: ${s.failed.join(', ')}`).join('; ')}`,
    );
  }
}

/**
 * Runs the check; throws `CLAIM:` on the wrong state and any other error when it could not run.
 * @param {{ evidence: string, names: string[] }} options
 * @param {Record<string, RegistryInstance>} registry
 * @param {Deps} deps
 * @returns {void}
 */
export function check({ evidence, names }, registry, deps) {
  const picked = names.length > 0 ? names : Object.keys(registry);
  const unknown = picked.filter((n) => !Object.hasOwn(registry, n));

  if (unknown.length > 0) {
    throw new Error(
      `unknown instance ${unknown.join(', ')}; instances: ${Object.keys(registry).join(', ')}`,
    );
  }

  const states = picked.map((n) =>
    instanceState(n, /** @type {RegistryInstance} */ (registry[n]), deps),
  );
  deps.write(join(evidence, 'state.json'), JSON.stringify(states, null, 2));
  decide(states);
}

/**
 * @param {string[]} argv
 * @param {(evidence: string) => Deps} makeDeps
 * @param {() => Record<string, RegistryInstance>} loadRegistry
 * @returns {number}
 */
export function main(argv, makeDeps, loadRegistry) {
  try {
    const { values, positionals } = parseArgs({
      args: argv,
      options: { evidence: { type: 'string' } },
      allowPositionals: true,
      strict: true,
    });

    if (!values.evidence) {
      throw new Error('usage: state.mjs --evidence <dir> [<instance>...]');
    }

    const evidence = resolve(values.evidence);
    check({ evidence, names: positionals }, loadRegistry(), makeDeps(evidence));

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

/**
 * The real control-ai-browsers and file system, writing control evidence into `evidence`.
 * @param {string} evidence
 * @returns {Deps}
 */
export function realDeps(evidence) {
  return {
    control: (args) => {
      const r = spawnSync(
        process.execPath,
        [
          join(CONTROL_DIR, 'scripts', 'control.mjs'),
          ...args,
          `--evidence=${evidence}`,
          '--json',
        ],
        {
          cwd: ROOT,
          encoding: 'utf8',
          windowsHide: true,
          maxBuffer: 64 * 1024 * 1024,
          timeout: 600000,
        },
      );

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
}

/** @returns {Record<string, RegistryInstance>} */
export function loadRegistry() {
  return registryOf(readFileSync(join(CONTROL_DIR, 'instances.json'), 'utf8'));
}

if (
  process.argv[1] &&
  realpathSync.native(resolve(process.argv[1])) ===
    realpathSync.native(fileURLToPath(import.meta.url))
) {
  process.exitCode = main(process.argv.slice(2), realDeps, loadRegistry);
}
