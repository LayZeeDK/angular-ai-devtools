#!/usr/bin/env node
// @ts-check
// Deterministic control of the per-model browser instances in instances.json, through playwright-cli and raw CDP.
// Usage: node control.mjs <command> [sub] <instance> [--json] [--evidence=<dir>]  (see SKILL.md, Helpers)
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  statfsSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:net';
import path, {
  delimiter,
  dirname,
  isAbsolute,
  join,
  resolve,
  sep,
} from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapFresh, printable } from './fingerprint.mjs';
import { drivePanel } from './panel.mjs';
import {
  describe,
  matches,
  merge,
  processTable,
  snapshot,
  stop,
} from './proctree.mjs';

/** @typedef {{ exe: string, scheme: string, product: string, modelRoots: string[], minFreeMib: number, modelComponents?: string[], browserArgs?: string[] }} BrowserDef */
/** @typedef {{ name: string, folders: string, asset: string, useCase: string, contextWindow: number, toolCanary: boolean | 'report', downloadMib: number }} ModelDef */
/** @typedef {{ default: string, gpu: string[] | null, cpu: string[] | null }} BackendDef */
/** @typedef {{ browser: string, port: number, features: string[], args?: string[], pin?: string[], extension?: string, backend: BackendDef, model: ModelDef }} InstanceDef */
/** @typedef {{ instance: string, at: string, roots: Record<string, string>, files: Record<string, Record<string, number>> }} Pin */
/** @typedef {{ root: string, version: string, replace?: boolean }} PinFolder */
/** @typedef {{ remove: PinFolder[], add: PinFolder[] }} PinPlan */
/** @typedef {{ files: Record<string, number>, links: string[] }} Listing */
/** @typedef {{ profilesRoot: string, commonArgs: string[], browsers: Record<string, BrowserDef>, instances: Record<string, InstanceDef> }} Registry */
/**
 * An instance as the commands use it: its registry entry and browser, its profile and session, and the CDP port of
 * this checkout's slot (`mainPort` is the registry's, slot 0).
 * @typedef {InstanceDef & BrowserDef & { name: string, dir: string, session: string, cdp: string, mainPort: number, index: number, slot: number, extensionDir: string | null }} Inst
 */
/** @typedef {'derived' | 'fixed' | 'external'} PortKind */
/** @typedef {{ name: string, port: number, kind: PortKind, reason?: string }} PortEntry */
/**
 * A row of the ports table (SKILL.md, "Pick a flow"): a derived port has a value per slot.
 * @typedef {{ name: string, kind: 'derived', at: (slot: number) => number } | { name: string, kind: 'fixed', port: number, pin: string } | { name: string, kind: 'external', port: number, owner: string }} PortRow
 */
/** @typedef {'gpu' | 'cpu'} Backend */
/** @typedef {import('./proctree.mjs').ProcRecord} ProcRecord */
/** @typedef {import('./proctree.mjs').StopResult} StopResult */
/** @typedef {{ userDataDir: string | null, port: number, features: string[], args: string[], flags: string[] }} CommandLine */
/** @typedef {{ backend: Backend | null, problems: string[], commandLine: CommandLine }} Drift */

/**
 * @typedef {object} State
 * @property {string} instance
 * @property {number} pid  the instance's main browser process
 * @property {ProcRecord[]} [tree]  every process of the instance seen (proctree.mjs), the main process first
 * @property {number} port
 * @property {number | null} slot
 * @property {PortEntry[]} ports
 * @property {string} cdp
 * @property {string} session
 * @property {string} profile
 * @property {Backend | null} backend
 * @property {string | null} [extensionDir]  the unpacked extension `up` loaded
 * @property {string} at
 */

/** @typedef {{ name: string, version: string, state: string, progress: number }} BrokerAsset */
/** @typedef {{ name: string, mib: number, weights: string | null, backend: string }} BrokerModel */

/**
 * What the Broker State tab of on-device-internals shows, parsed.
 * @typedef {object} Broker
 * @property {undefined} [disabled]
 * @property {string | null} manifestPath
 * @property {string | null} manifestLoaded
 * @property {string | null} perfClass
 * @property {string | null} diskInstall
 * @property {BrokerAsset[]} assets
 * @property {Record<string, string>} useCases
 * @property {BrokerModel[]} models
 */

/** @typedef {{ disabled: true, error: string, diskInstall?: undefined }} BrokerDisabled */
/** @typedef {{ kind: Backend | null, row: string | null, backendType?: string, weights?: string | null }} Serving */
/** @typedef {{ name: string | undefined, modelVersion: string | undefined, componentVersion: string | undefined, performanceHints: unknown, dir: string, bytes: number, mib: number }} DiskModel */
/** @typedef {{ bytes: number, mib: number, minMib: number, volume: string }} FreeSpace */
/** @typedef {{ id: string, pass: boolean | null, warn: boolean, detail: unknown }} Check */
/** @typedef {{ ok: boolean, couldNotRun?: boolean } & Record<string, unknown>} Result */
/** @typedef {{ code: number | null, out: string }} PwRun */
/** @typedef {{ Browser: string, webSocketDebuggerUrl: string }} CdpVersion */
/** @typedef {{ id: string, type: string, url: string }} CdpTarget */

/**
 * What the AVAILABILITY snippet returns: an availability string or an error text per API, and a few page facts.
 * @typedef {{ LanguageModel?: string } & Record<string, unknown>} Availability
 */
/** @typedef {{ pass: boolean | null } & Record<string, unknown>} CanaryPart */
/** @typedef {{ contextWindow?: number, structured?: CanaryPart, tools?: CanaryPart, webmcp?: CanaryPart, createMs?: number }} Canary */
/** @typedef {{ firstCreateMs: number, secondCreateMs: number, contextWindow: number, promptMs: number, answer: unknown, contextUsage?: number }} InitRun */
/** @typedef {{ id: string, name: string, status: string | null }} EdgeComponent */
/** @typedef {{ gesture: string, state: string, clickAt?: number, readyAt?: number, contextWindow?: number, samples: number, polls: unknown[] }} DownloadRun */
/** @typedef {{ optimization_guide?: { on_device?: { performance_class?: unknown } } }} LocalState */
/** @typedef {{ name?: string, version?: string, BaseModelSpec?: { name?: string, version?: string, supported_performance_hints?: unknown } }} ModelManifest */

const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = resolve(SKILL_DIR, '..', '..', '..');
/** @type {Registry} */
const REGISTRY = JSON.parse(
  readFileSync(join(SKILL_DIR, 'instances.json'), 'utf8'),
);

/**
 * The primary checkout of the repository `dir` belongs to: the folder holding the git common dir. A worktree or a
 * GSD Path sidecar (elsewhere on disk, even on C:) resolves to the same primary checkout as the main one.
 * @param {string} dir
 * @returns {string}
 */
export function primaryCheckout(dir) {
  // A GIT_DIR or GIT_COMMON_DIR inherited from a hook or wrapper would point every shared path at another repository.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')),
  );
  const r = spawnSync(
    'git',
    ['rev-parse', '--path-format=absolute', '--git-common-dir'],
    { cwd: dir, encoding: 'utf8', windowsHide: true, env },
  );
  const common = r.status === 0 ? r.stdout.trim() : '';

  return common ? dirname(resolve(common)) : dir;
}

// Profiles (each holding a multi-GB model) and state files are machine-wide: every checkout of the repository uses
// the primary checkout's, so a worktree or sidecar reaches the running instances with their models instead of
// starting empty profiles that would need a fresh download.
const PRIMARY = primaryCheckout(ROOT);
const ARTIFACT_ROOT = join(PRIMARY, '.commandcode', 'worktrees');
export const TMP = join(ARTIFACT_ROOT, 'tmp', 'control-ai-browsers');
export const PROFILES = resolve(ARTIFACT_ROOT, REGISTRY.profilesRoot);
// Slot 0 holds the registry ports. Instances are shared by every checkout, so every checkout starts at slot 0; a
// slot above 0 is only a fallback when a registry port is busy.
const KEEPER = join(SKILL_DIR, 'scripts', 'pipe-keeper.mjs');
const SLOTS = 40;
const SLOT_TRIES = 10;
const IS_WORKTREE =
  existsSync(join(ROOT, '.git')) && statSync(join(ROOT, '.git')).isFile();
const OWN_SLOT = 0;
// bench.js hard-codes the main checkout's counter fixture (control-angular-dev-app owns it).
/** @type {PortEntry} */
const BENCH_APP = {
  name: 'bench app',
  port: 4222,
  kind: 'external',
  reason:
    'control-angular-dev-app counter fixture in the main checkout; spikes/probes/bench.js:4 hard-codes it',
};
const PROBE_ORIGIN = 'https://example.org/';
const STEP_TIMEOUT_MS = 180000;
const EXIT = { OK: 0, UNHEALTHY: 1, REFUSED: 2 };
// A component version folder's name, as Edge writes it (2026.10.2.1).
const VERSION = /^\d+(\.\d+)+$/;
// Windows reads this from this process, not the child's env, when Node looks up a bare program name (pwsh):
// it then skips the current directory.
process.env['NoDefaultCurrentDirectoryInExePath'] = '1';

// ---------- args ----------

/**
 * `--name=value` and bare `--name` (true) into opts; everything else, in order, into pos.
 * @param {string[]} argv
 * @returns {{ opts: Record<string, string | true>, pos: string[] }}
 */
export function parseArgs(argv) {
  /** @type {Record<string, string | true>} */
  const opts = {};
  /** @type {string[]} */
  const pos = [];

  for (const a of argv) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);

    if (m) {
      opts[/** @type {string} */ (m[1])] = m[2] ?? true;
    } else {
      pos.push(a);
    }
  }

  return { opts, pos };
}

const { opts, pos } = parseArgs(process.argv.slice(2));
const runId = new Date()
  .toISOString()
  .replace(/[-:]/g, '')
  .replace(/\..*/, '')
  .replace('T', '-');
const evidenceDir = resolve(
  typeof opts['evidence'] === 'string'
    ? opts['evidence']
    : join(TMP, 'evidence', runId),
);

export class Refusal extends Error {}

/**
 * @param {string} msg
 * @returns {never}
 */
function refuse(msg) {
  throw new Refusal(msg);
}

/**
 * One human-readable line. Model answers, page exceptions and playwright-cli output can hold control characters, so
 * they are escaped rather than written to the terminal.
 * @param {string} marker
 * @param {string} msg
 * @returns {string}
 */
export function logLine(marker, msg) {
  return `[${marker}] ${printable(msg)}`;
}

/**
 * @param {string} marker
 * @param {string} msg
 */
function log(marker, msg) {
  if (!opts['json']) {
    console.log(logLine(marker, msg));
  }
}

/**
 * Why a profile folder must not be used or have files deleted under it: it resolves through a junction or link to
 * another folder (Edge deletes its model manifest at startup then, measured; and a link could reach a profile this
 * skill does not own). Null when it is a real folder.
 * @param {string} dir
 * @param {string} real  realpathSync.native(dir)
 * @returns {string | null}
 */
export function reparseRefusal(dir, real) {
  return sameDir(real, dir)
    ? null
    : `${dir} resolves through a reparse point to ${real}; use a real folder`;
}

/**
 * A numeric flag's value: `fallback` when the flag is absent, else a finite number above 0, or a refusal (exit 2)
 * with a usage line. Every numeric flag is parsed here.
 * @param {string} flag  name without the dashes
 * @param {unknown} value  opts[flag]
 * @param {number} fallback
 * @param {string} [what]  the value the usage line asks for
 * @returns {number}
 */
export function positiveFlag(flag, value, fallback, what = 'number above 0') {
  if (value === undefined) {
    return fallback;
  }

  // Decimal digits only: Number() alone also reads 0x2400, 1e3 and padded whitespace.
  const n =
    typeof value === 'string' && /^\d+(\.\d+)?$/.test(value)
      ? Number(value)
      : NaN;

  if (!(Number.isFinite(n) && n > 0)) {
    return refuse(
      `usage: --${flag}=<${what}>; got ${value === true ? `--${flag} with no value` : JSON.stringify(value)}`,
    );
  }

  return n;
}

/**
 * `model download`'s time budgets: the page polls for `--timeout-min` (default 45) minutes after its click, and the
 * playwright-cli client that runs it waits 5 minutes longer, so the page's own timeout result comes back.
 * @param {unknown} timeoutMin  opts['timeout-min']
 * @returns {{ pageMs: number, clientMs: number }}
 */
export function downloadTimeouts(timeoutMin) {
  const min = positiveFlag('timeout-min', timeoutMin, 45);

  return { pageMs: min * 60000, clientMs: (min + 5) * 60000 };
}

/**
 * `--port`: undefined when absent, else a port number, or a refusal (exit 2).
 * @param {unknown} value  opts['port']
 * @returns {number | undefined}
 */
export function portFlag(value) {
  if (value === undefined) {
    return undefined;
  }

  const what = 'port number 1-65535';
  const n = positiveFlag('port', value, 0, what);

  if (!(Number.isInteger(n) && n < 65536)) {
    return refuse(`usage: --port=<${what}>; got ${JSON.stringify(value)}`);
  }

  return n;
}

/**
 * Why `up` must refuse a live instance, or null when it runs as requested (the contract's exception for instances
 * that stay running between runs: `up` then answers exit 0 with `alreadyRunning`).
 * @param {string} name
 * @param {number} pid
 * @param {{ backend: Backend | null, problems: string[], commandLine: { port: number } }} d  drift() of the live process
 * @param {string} backend  the requested backend
 * @param {number | undefined} port  --port, when given
 * @returns {string | null}
 */
export function upMismatch(name, pid, d, backend, port) {
  /** @type {string[]} */
  const why = [...d.problems];

  if (d.backend !== backend) {
    why.push(`backend ${d.backend ?? 'none'}, requested ${backend}`);
  }

  if (port !== undefined && d.commandLine.port !== port) {
    why.push(`port ${d.commandLine.port}, requested ${port}`);
  }

  return why.length === 0
    ? null
    : `${name} already runs as PID ${pid} on port ${d.commandLine.port} with another configuration (${why.join('; ')}); run "down ${name}" first`;
}

// ---------- registry ----------

/**
 * The slots `up` tries, in order: `first` (0, the registry ports), then the next ones, 10 in all.
 * @param {number} first
 * @returns {number[]}
 */
export function slotOrder(first) {
  return Array.from({ length: SLOT_TRIES }, (_, i) => first + i);
}

/**
 * The PIDs `netstat -ano` names for each listening port, IPv4 and IPv6: a port can have one holder per address. This
 * only ever says who; which table a host exposes is its business and may hide the holder (see `busyPorts`).
 * @param {string} text
 * @returns {Map<number, number[]>}
 */
export function listeners(text) {
  /** @type {Map<number, number[]>} */
  const map = new Map();

  for (const l of text.split(/\r?\n/)) {
    const m = l.trim().split(/\s+/);

    if (m[0] === 'TCP' && m[3] === 'LISTENING') {
      const port = Number(
        (m[1] ?? '').slice((m[1] ?? '').lastIndexOf(':') + 1),
      );
      const pid = Number(m[4]);
      const pids = map.get(port) ?? [];

      if (!pids.includes(pid)) {
        pids.push(pid);
      }

      map.set(port, pids);
    }
  }

  return map;
}

/**
 * The ports `planPorts` may look at, and so exactly what `busyPorts` must probe: every fixed and external port, each
 * derived port of the slots in `order` and of the slot the run fell back from (`first`), and `--port`.
 * @param {PortRow[]} rows
 * @param {number[]} order
 * @param {number} [forced]
 * @param {number} [first]
 * @returns {number[]}
 */
export function candidatePorts(rows, order, forced, first = order[0]) {
  const slots = first === undefined ? order : [...order, first];
  const ports = rows.flatMap((r) =>
    r.kind === 'derived' ? slots.map((slot) => r.at(slot)) : [r.port],
  );

  return [...new Set([...ports, ...(forced === undefined ? [] : [forced])])];
}

/**
 * Picks the ports of one run. A busy fixed port is a refusal. `forced` (`--port`) is the main port in every slot,
 * with no fallback for it. Otherwise the first slot in `order` whose derived ports are all free. A derived entry
 * of a slot other than `first` (the run's own slot, `order[0]` unless a retry already used it) says what it fell
 * back from.
 * @param {PortRow[]} rows
 * @param {number[]} order
 * @param {Map<number, number[]>} busy  the ports a listener holds; the values name the holder where the OS names it
 * @param {number} [forced]
 * @param {number} [first]
 * @returns {{ ok: true, slot: number, ports: PortEntry[] } | { ok: false, reason: string }}
 */
export function planPorts(rows, order, busy, forced, first = order[0]) {
  /** @param {number[]} pids */
  const heldBy = (pids) =>
    pids.length === 0
      ? 'held by a process the OS did not name'
      : `held by PID ${pids.join(', ')}`;
  /** @param {number} port */
  const holder = (port) => busy.get(port);

  for (const r of rows) {
    const pids = r.kind === 'fixed' ? holder(r.port) : undefined;

    if (r.kind === 'fixed' && pids !== undefined) {
      return {
        ok: false,
        reason: `fixed port ${r.name} ${r.port} ${heldBy(pids)}; pinned by ${r.pin}`,
      };
    }
  }

  const main = rows.findIndex((r) => r.kind === 'derived');
  const forcedPids = forced === undefined ? undefined : holder(forced);

  if (forced !== undefined && forcedPids !== undefined) {
    return {
      ok: false,
      reason: `port ${forced} (--port) is ${heldBy(forcedPids)}; --port has no fallback`,
    };
  }

  /** @type {(r: PortRow, i: number, slot: number) => number} */
  const portAt = (r, i, slot) =>
    r.kind !== 'derived'
      ? r.port
      : i === main && forced !== undefined
        ? forced
        : r.at(slot);
  /** @type {string[]} */
  const tried = [];

  for (const slot of order) {
    const taken = rows.flatMap((r, i) => {
      const pids =
        r.kind === 'derived' ? holder(portAt(r, i, slot)) : undefined;

      return pids === undefined
        ? []
        : [`${r.name} ${portAt(r, i, slot)} ${heldBy(pids)}`];
    });

    if (taken.length === 0) {
      /** @type {PortEntry[]} */
      const ports = rows.map((r, i) => {
        const port = portAt(r, i, slot);

        if (r.kind === 'fixed') {
          return { name: r.name, port, kind: r.kind, reason: r.pin };
        }

        if (r.kind === 'external') {
          return { name: r.name, port, kind: r.kind, reason: r.owner };
        }

        if (first === undefined || slot === first) {
          return { name: r.name, port, kind: r.kind };
        }

        const from = portAt(r, i, first);
        const pids = holder(from);
        const why =
          pids !== undefined
            ? heldBy(pids)
            : order[0] === first
              ? `slot ${first} had ${tried[0]}`
              : 'taken after the check';

        return {
          name: r.name,
          port,
          kind: r.kind,
          reason: `fell back from ${from}: ${why}`,
        };
      });

      return { ok: true, slot, ports };
    }

    tried.push(...taken);
  }

  return {
    ok: false,
    reason: `no free slot in ${order.length} tries (slots ${order.join(', ')}): ${tried.join(', ')}`,
  };
}

/**
 * The doctor's `ports` line: every derived and fixed port is held and every holder the OS names is in the recorded
 * process tree; every port is listed. Naming the holder is the OS's option, so an unnamed holder passes: which
 * process holds a busy port never decides whether the port is busy.
 * @param {PortEntry[]} ports
 * @param {Map<number, number[]>} busy
 * @param {Set<number>} tree
 * @returns {{ status: 'pass' | 'fail', detail: string }}
 */
export function portsCheck(ports, busy, tree) {
  const problems = ports.flatMap((p) => {
    const pids = busy.get(p.port);

    if (p.kind === 'external') {
      return [];
    }

    if (pids === undefined) {
      return [`${p.name} ${p.port} not listening`];
    }

    const foreign = pids.filter((pid) => !tree.has(pid));

    return foreign.length === 0
      ? []
      : [
          `${p.name} ${p.port} held by PID ${foreign.join(', ')}, not the recorded tree`,
        ];
  });

  if (problems.length > 0) {
    return { status: 'fail', detail: problems.join('; ') };
  }

  return {
    status: 'pass',
    detail: ports
      .map(
        (p) =>
          `${p.name} ${p.port} (${p.kind}${p.reason === undefined ? '' : `: ${p.reason}`})`,
      )
      .join(', '),
  };
}

/**
 * An instance's CDP port in a slot: the registry's in slot 0, else `9600 + 10 * slot + index` (index: its place in
 * the registry), so no two instances or slots share a port and none reaches slot 0's.
 * @param {number} index
 * @param {number} mainPort
 * @param {number} slot
 * @returns {number}
 */
export function portAt(index, mainPort, slot) {
  return slot === 0 ? mainPort : 9600 + 10 * slot + index;
}

/** The loopback addresses this skill's servers are reached on; the bind probe tries each. */
const LOOPBACKS = ['127.0.0.1', '::1'];

/**
 * What one address answered when the probe bound it: a listener holds the port, nothing does, or the bind failed for a
 * reason other than EADDRINUSE and the probe learned nothing about the port. The third answer is not free: a port this
 * host will not let the probe bind is a port a server cannot bind either.
 * @typedef {'busy' | 'free' | 'unknown'} PortAnswer
 */

/**
 * The answer of binding `port` on `host`: EADDRINUSE is a listener, a bind that succeeds is closed at once and means
 * free, and every other error is unknown — a port the OS reserves (`EACCES`), an address this host does not have
 * (`EADDRNOTAVAIL`). Folding those into free is how a port no server can bind was offered as available, to fail in
 * the spawn with an error nothing expected.
 * @param {number} port
 * @param {string} host
 * @returns {Promise<PortAnswer>}
 */
async function bindAnswer(port, host) {
  return new Promise((resolve) => {
    const server = createServer();

    server.once('error', (error) =>
      resolve(
        /** @type {NodeJS.ErrnoException} */ (error).code === 'EADDRINUSE'
          ? 'busy'
          : 'unknown',
      ),
    );
    server.listen({ host, port, exclusive: true }, () =>
      server.close(() => resolve('free')),
    );
  });
}

/**
 * Whether a listener holds `port` on a loopback address, decided by binding each of `hosts` (both by default). Busy on
 * any address is busy; free needs every address to answer free; one address that answered neither is unknown, never
 * free, because a listener on that leg is exactly what a free answer would hide.
 * @param {number} port
 * @param {string[]} [hosts]
 * @returns {Promise<PortAnswer>}
 */
export async function probePort(port, hosts = LOOPBACKS) {
  /** @type {PortAnswer} */
  let answer = 'free';

  for (const host of hosts) {
    const leg = await bindAnswer(port, host);

    if (leg === 'busy') {
      return 'busy';
    }

    if (leg === 'unknown') {
      answer = 'unknown';
    }
  }

  return answer;
}

/**
 * The PIDs `netstat` names for the listening ports it reports (IPv4 and IPv6). Naming only: which table a host exposes
 * is its business, and a host whose netstat reports only the host table names none of them, so this may say nothing.
 * @returns {Map<number, number[]>}
 */
function namedHolders() {
  const netstat = join(
    process.env['SystemRoot'] ?? 'C:\\Windows',
    'System32',
    'netstat.exe',
  );

  return listeners(
    ['TCP', 'TCPv6']
      .map(
        (proto) =>
          spawnSync(netstat, ['-ano', '-p', proto], {
            encoding: 'utf8',
            windowsHide: true,
          }).stdout,
      )
      .join('\n'),
  );
}

/**
 * Which of `ports` a listener holds now, decided by binding each on the loopback addresses (`hosts`, both by default).
 * Presence in the map is the answer, and the values are the PIDs `netstat` names, and it may name none: a port held by
 * a process the OS will not name is still busy. A port `probePort` could not decide is in the map too, with no PIDs,
 * so the planner refuses it: what the probe could not decide is never selected as if it were free.
 * @param {number[]} ports
 * @param {string[]} [hosts]
 * @returns {Promise<Map<number, number[]>>}
 */
export async function busyPorts(ports, hosts = LOOPBACKS) {
  /** @type {Map<number, number[]>} */
  const busy = new Map();

  for (const port of new Set(ports)) {
    if ((await probePort(port, hosts)) !== 'free') {
      busy.set(port, []);
    }
  }

  if (busy.size > 0) {
    for (const [port, pids] of namedHolders()) {
      if (busy.has(port)) {
        busy.set(port, pids);
      }
    }
  }

  return busy;
}

/**
 * The playwright-cli session of an instance on a port: `ai-<name>-<port>`, on the registry port too. playwright-cli
 * keeps one session namespace for every checkout on the machine, and a teardown check treats every open
 * `<session>-*` as this run's, so no instance's session name may be a prefix of another's.
 * @param {string} name
 * @param {number} port
 * @returns {string}
 */
export function sessionOf(name, port) {
  return `ai-${name}-${port}`;
}

/**
 * The instance on another CDP port.
 * @param {Inst} inst
 * @param {number} port
 * @returns {Inst}
 */
export function at(inst, port) {
  return {
    ...inst,
    port,
    cdp: `http://127.0.0.1:${port}`,
    session: sessionOf(inst.name, port),
  };
}

/**
 * @param {string | undefined} name
 * @param {Pick<Registry, 'instances' | 'browsers'>} [registry]
 * @param {number} [slot]  this checkout's slot
 * @returns {Inst}
 */
export function instance(name, registry = REGISTRY, slot = OWN_SLOT) {
  const i =
    name !== undefined && Object.hasOwn(registry.instances, name)
      ? registry.instances[name]
      : undefined;

  if (name === undefined || i === undefined) {
    return refuse(
      `unknown instance "${name}"; known: ${Object.keys(registry.instances).join(', ')}`,
    );
  }

  const b =
    (Object.hasOwn(registry.browsers, i.browser)
      ? registry.browsers[i.browser]
      : undefined) ??
    refuse(`instance "${name}" names unknown browser "${i.browser}"`);
  const dir = join(PROFILES, name);

  const index = Object.keys(registry.instances).indexOf(name);
  const port = portAt(index, i.port, slot);

  // The shared instances load the primary checkout's build; `up --extension=<dir>` loads another one (state records it).
  const extensionDir = i.extension ? resolve(PRIMARY, i.extension) : null;

  return {
    name,
    ...i,
    ...b,
    dir,
    session: sessionOf(name, port),
    port,
    cdp: `http://127.0.0.1:${port}`,
    mainPort: i.port,
    index,
    slot,
    extensionDir,
  };
}

/**
 * The --enable-features list for a backend; refuses a backend the registry does not offer.
 * @param {Pick<Inst, 'name' | 'features' | 'backend'>} inst
 * @param {string} backend
 * @returns {string[]}
 */
export function featuresFor(inst, backend) {
  const extra =
    backend === 'gpu' || backend === 'cpu' ? inst.backend[backend] : undefined;

  if (extra === undefined) {
    refuse(`--backend must be gpu or cpu`);
  }

  if (extra === null) {
    refuse(
      `${inst.name} refuses --backend=${backend}: forcing CPU on Edge deletes the installed model (measured twice); Edge offers WebGPU variants only`,
    );
  }

  return [...inst.features, ...extra];
}

/**
 * The command line `up` launches the instance with.
 * @param {Pick<Inst, 'dir' | 'port'> & Pick<Partial<Inst>, 'args'>} inst
 * @param {string[]} features
 * @returns {string[]}
 */
export function launchArgs(inst, features) {
  return [
    `--user-data-dir=${inst.dir}`,
    `--remote-debugging-port=${inst.port}`,
    ...switchesOf(inst),
    ...(features.length ? [`--enable-features=${features.join(',')}`] : []),
    'about:blank',
  ];
}

/**
 * The bare switches `up` adds: the registry's common ones, the browser's `browserArgs` (on Edge: sign-in and sync
 * off, so the Windows work account is never signed in), the instance's own `args`, then those that load its
 * unpacked extension. Branded Chrome ignores --load-extension ("--load-extension is not allowed in Google Chrome"), so
 * an instance with an extension starts through pipe-keeper.mjs, which loads it over the pipe; Edge 155 and 157 load
 * it the same way (measured 2026-10-19), so no extension path is on any command line.
 * @param {Pick<Partial<Inst>, 'args' | 'browserArgs' | 'extensionDir'>} inst
 * @returns {string[]}
 */
export function switchesOf(inst) {
  const extension = inst.extensionDir
    ? ['--remote-debugging-pipe', '--enable-unsafe-extension-debugging']
    : [];

  return [
    ...REGISTRY.commonArgs,
    ...(inst.browserArgs ?? []),
    ...(inst.args ?? []),
    ...extension,
  ];
}

/**
 * Whether a profile's Default/Preferences records a signed-in account or a completed sync setup. Edge signs the
 * Windows work account in by itself when started without the browser's sign-in switches (measured 2026-10-19), and
 * an instance profile must never hold it.
 * @param {string} prefsText  the Preferences file, or '' when there is none
 * @returns {{ accounts: number, syncSetup: boolean }}
 */
export function accountState(prefsText) {
  /** @type {{ account_info?: unknown, sync?: { has_setup_completed?: unknown } }} */
  let p = {};

  try {
    p = prefsText ? JSON.parse(prefsText) : {};
  } catch {
    p = {};
  }

  return {
    accounts: Array.isArray(p.account_info) ? p.account_info.length : 0,
    syncSetup: p.sync?.has_setup_completed === true,
  };
}

/**
 * @param {Pick<Inst, 'dir'>} inst
 * @returns {{ accounts: number, syncSetup: boolean }}
 */
function profileAccount(inst) {
  const f = join(inst.dir, 'Default', 'Preferences');

  return accountState(existsSync(f) ? readFileSync(f, 'utf8') : '');
}

/**
 * The id Chromium gives an unpacked extension: the first 16 bytes of SHA-256 over the absolute path (UTF-16LE on
 * Windows), each nibble a letter a-p (measured: the repository's extension folder loads as
 * mgkfgkdgobahfcgkdlokpoehblpbkfok in Chrome Beta 157 and Edge 155).
 * @param {string} dir
 * @returns {string}
 */
export function extensionId(dir) {
  return [
    ...createHash('sha256')
      .update(Buffer.from(dir, 'utf16le'))
      .digest()
      .subarray(0, 16),
  ]
    .map((b) => String.fromCharCode(97 + (b >> 4), 97 + (b & 15)))
    .join('');
}

// ---------- processes ----------

/**
 * pwsh's ConvertTo-Json output as rows: nothing, one object, or an array.
 * @param {string} text
 * @returns {unknown[]}
 */
export function jsonRows(text) {
  if (!text.trim()) {
    return [];
  }

  /** @type {unknown} */
  const v = JSON.parse(text);

  return Array.isArray(v) ? v : [v];
}

/**
 * @param {string} command
 * @returns {unknown[]}
 */
function pwshJson(command) {
  const r = spawnSync(
    'pwsh',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      `${command} | ConvertTo-Json -Depth 4 -Compress`,
    ],
    { encoding: 'utf8', windowsHide: true },
  );

  return jsonRows(r.stdout ?? '');
}

/**
 * The program a command line starts: its first token, with or without quotes.
 * @param {string | null | undefined} commandLine
 * @returns {string | null}
 */
export function programOf(commandLine) {
  const m = /^\s*(?:"([^"]*)"|(\S+))/.exec(commandLine ?? '');

  return m ? (m[1] ?? m[2] ?? null) : null;
}

/**
 * @param {string | null | undefined} commandLine
 * @returns {CommandLine}
 */
export function parseCommandLine(commandLine) {
  const cl = commandLine ?? '';
  // Node quotes a spawned argument that holds a space as a whole: "--user-data-dir=D:\a b\x".
  const udd = cl.match(
    /"--user-data-dir=([^"]+)"|--user-data-dir=(?:"([^"]+)"|(\S+))/,
  );

  return {
    userDataDir: udd ? (udd[1] ?? udd[2] ?? udd[3] ?? null) : null,
    port: Number(cl.match(/--remote-debugging-port=(\d+)/)?.[1] ?? NaN),
    features: (
      cl
        .match(/--enable-features=(?:"([^"]+)"|(\S+))/)
        ?.slice(1)
        .find(Boolean) ?? ''
    )
      .split(',')
      .filter(Boolean),
    args: REGISTRY.commonArgs.filter((a) => cl.includes(a)),
    // Every switch name, in order: drift compares them with what up launches.
    flags: [...cl.matchAll(/(?:^|\s)"?(--[A-Za-z0-9-]+)/g)].map(
      (m) => m[1] ?? '',
    ),
  };
}

/**
 * @param {string | null | undefined} a
 * @param {string | null | undefined} b
 * @returns {boolean}
 */
export const sameDir = (a, b) =>
  !!a && !!b && resolve(a).toLowerCase() === resolve(b).toLowerCase();

// The instance's browser processes are the ones of the registry's browser program whose --user-data-dir is its
// profile; Lars's own browsers never match. Found to read them, never to stop by name.
/**
 * @param {Pick<Inst, 'exe' | 'dir'>} inst
 * @param {ProcRecord[]} rows  the process table (proctree.mjs)
 * @returns {ProcRecord[]}
 */
export function instanceProcessesIn(inst, rows) {
  const exeName = (inst.exe.split('\\').pop() ?? '').toLowerCase();

  return rows.filter(
    (p) =>
      (programOf(p.commandLine)?.split('\\').pop() ?? '').toLowerCase() ===
        exeName &&
      sameDir(parseCommandLine(p.commandLine).userDataDir, inst.dir),
  );
}

/**
 * @param {Inst} inst
 * @returns {ProcRecord[]}
 */
function instanceProcesses(inst) {
  return instanceProcessesIn(inst, processTable());
}

/**
 * @param {Inst} inst
 * @returns {ProcRecord | null}
 */
function mainProcess(inst) {
  const main = instanceProcesses(inst).filter(
    (p) => !/--type=/.test(p.commandLine ?? ''),
  );

  return main.length === 1
    ? /** @type {ProcRecord} */ (main[0])
    : main.length === 0
      ? null
      : refuse(`${main.length} main processes use ${inst.dir}`);
}

/**
 * The recorded main process: the `tree` record with the state's PID, or none.
 * @param {{ pid: number, tree?: ProcRecord[] }} st
 * @returns {ProcRecord | undefined}
 */
export function rootOf(st) {
  return (st.tree ?? []).find((r) => r.pid === st.pid);
}

/**
 * Stops every process the state recorded, through proctree.mjs: a last snapshot below the main process while it
 * still lives, merged into the record, then `stop`.
 * @param {{ pid: number, tree?: ProcRecord[] }} st
 * @param {{ table?: () => ProcRecord[], stop?: (records: ProcRecord[]) => StopResult }} [deps]
 * @returns {{ records: ProcRecord[], result: StopResult }}
 */
export function stopRun(
  st,
  { table = processTable, stop: stopRecords = stop } = {},
) {
  const root = rootOf(st);
  const records = merge(
    st.tree ?? [],
    root === undefined ? [] : snapshot(root, { table }),
  );

  return { records, result: stopRecords(records) };
}

/**
 * What `down` reports for a stop result. Exit 2 when the main process's PID now belongs to another process (that one
 * is never touched) or a record still runs after the last round; any other refusal is only noted.
 * @param {{ pid: number, tree?: ProcRecord[] }} st
 * @param {StopResult} result
 * @returns {{ code: 0 | 2, notes: string[], reason: string | null }}
 */
export function downOutcome(st, result) {
  // A state file written before proctree.mjs records no tree: stopping nothing and removing it would lose the run.
  if (st.tree === undefined) {
    return {
      code: 2,
      notes: [],
      reason: `refused: the state file records no process tree (written before proctree.mjs); nothing stopped: run attach to record the running instance, then down`,
    };
  }

  const root = rootOf(st);
  /** @type {string[]} */
  const reasons = [];
  const notes = [
    ...result.stopped.map((r) => `stopped ${describe(r)}`),
    ...result.gone.map((r) => `${describe(r)} was not running`),
  ];

  for (const r of result.refused) {
    if (
      r.reason === 'reused' &&
      root !== undefined &&
      r.pid === root.pid &&
      r.start === root.start
    ) {
      reasons.push(
        `refused: PID ${r.pid} now belongs to another process (its start time or command line differs from the state file); not stopping a process this skill did not start`,
      );
    } else if (r.reason === 'survived') {
      reasons.push(
        `${describe(r)} still runs after the last round; run down again`,
      );
    } else {
      notes.push(
        `left ${r.reason === 'reused' ? `PID ${r.pid}` : describe(r)} alone: ${r.reason === 'reused' ? 'it now belongs to another process' : r.reason === 'helper' ? 'a shared helper (the Nx daemon), never stopped' : 'it runs this script'}`,
      );
    }
  }

  return reasons.length === 0
    ? { code: 0, notes, reason: null }
    : {
        code: 2,
        notes,
        reason: `${reasons.join('; ')}; the state file is kept`,
      };
}

/**
 * Whether any record still runs as the recorded process (same PID, start time and command line).
 * @param {ProcRecord[]} records
 * @returns {boolean}
 */
function anyAlive(records) {
  const rows = new Map(processTable().map((r) => [r.pid, r]));

  return records.some((r) => matches(r, rows.get(r.pid)));
}

/**
 * The PID `netstat` names as the holder of `port`, or null. Naming only: `busyPorts` decides whether the port is
 * held, so a listener the OS does not name is a null here and not a free port.
 * @param {number} port
 * @returns {number | null}
 */
function portOwner(port) {
  return namedHolders().get(port)?.[0] ?? null;
}

// Which registry backend a command line matches, or null when it matches none (drift).
/**
 * @param {Pick<Inst, 'exe' | 'features' | 'backend'> & Pick<Partial<Inst>, 'args' | 'browserArgs' | 'extensionDir'>} inst
 * @param {Pick<ProcRecord, 'commandLine'>} proc
 * @returns {Drift}
 */
export function drift(inst, proc) {
  const cl = parseCommandLine(proc.commandLine);
  const exe = programOf(proc.commandLine);
  const have = [...cl.features].sort().join(',');
  /** @type {Backend[]} */
  const kinds = ['gpu', 'cpu'];
  const backend =
    kinds.find((k) => {
      const extra = inst.backend[k];

      return (
        Array.isArray(extra) &&
        [...inst.features, ...extra].sort().join(',') === have
      );
    }) ?? null;
  /** @type {string[]} */
  const problems = [];

  if (exe !== inst.exe) {
    problems.push(`exe ${exe}, registry ${inst.exe}`);
  }

  // The port may be any slot's (a fallback, or --port).
  if (!Number.isInteger(cl.port)) {
    problems.push(`port ${cl.port}`);
  }

  if (!backend) {
    problems.push(
      `--enable-features matches no registry backend: ${cl.features.join(',')}`,
    );
  }

  // An entry may carry a value (--name=value): its name must be a switch, and the whole entry must be on the line.
  /** @param {string} a */
  const nameOf = (a) => a.split('=')[0] ?? a;
  const tokens = (proc.commandLine ?? '')
    .split(/\s+/)
    .map((t) => t.replace(/^"|"$/g, ''));

  for (const a of switchesOf(inst).filter(
    (x) =>
      !cl.flags.includes(nameOf(x)) || (x.includes('=') && !tokens.includes(x)),
  )) {
    problems.push(`missing ${a}`);
  }

  const launched = [
    '--user-data-dir',
    '--remote-debugging-port',
    '--enable-features',
    ...switchesOf(inst).map(nameOf),
  ];

  for (const [i, f] of cl.flags.entries()) {
    if (!launched.includes(f)) {
      problems.push(`extra ${f}`);
    } else if (cl.flags.indexOf(f) !== i) {
      problems.push(`repeated ${f}`);
    }
  }

  return { backend, problems, commandLine: cl };
}

/** @param {number} ms */
async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * @template T
 * @param {() => T | Promise<T>} fn
 * @param {number} timeoutMs
 * @param {number} [everyMs]
 * @returns {Promise<T | null>}
 */
async function waitFor(fn, timeoutMs, everyMs = 1000) {
  const end = Date.now() + timeoutMs;

  while (Date.now() < end) {
    const v = await fn();

    if (v) {
      return v;
    }

    await sleep(everyMs);
  }

  return null;
}

/**
 * @param {Inst} inst
 * @param {string} path
 * @returns {Promise<unknown>}
 */
async function cdpJson(inst, path) {
  try {
    const r = await fetch(`${inst.cdp}${path}`, {
      signal: AbortSignal.timeout(3000),
    });

    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

/**
 * @param {Inst} inst
 * @returns {Promise<CdpTarget[]>}
 */
async function pageTargets(inst) {
  const listed = /** @type {CdpTarget[] | null} */ (
    await cdpJson(inst, '/json/list')
  );
  return (listed ?? []).filter((t) => t.type === 'page');
}

/**
 * @param {Inst} inst
 * @returns {Promise<string[]>}
 */
async function pageTabs(inst) {
  return (await pageTargets(inst)).map((t) => t.url);
}

// ---------- state ----------

/** @param {string} name */
function statePath(name) {
  return join(TMP, `state-${name}.json`);
}

/**
 * @param {string} name
 * @returns {State | null}
 */
function readState(name) {
  if (!existsSync(statePath(name))) {
    return null;
  }

  /** @type {unknown} */
  const st = JSON.parse(readFileSync(statePath(name), 'utf8'));

  return /** @type {State} */ (st);
}

/**
 * The pinned copy of an instance's model components: `tmp/control-ai-browsers/pins/<name>`, git-ignored.
 * @param {string} name
 */
function pinFolderOf(name) {
  return join(TMP, 'pins', name);
}

/**
 * Why a parsed pin.json is not a pin of this instance, one line each; empty when it is. Roots must be among the
 * registry's `pin` roots, versions version folder names, and file paths plain relative paths with byte sizes.
 * @param {unknown} v
 * @param {string} name
 * @param {string[]} roots  the registry's pin roots
 * @returns {string[]}
 */
export function pinProblems(v, name, roots) {
  /** @type {(x: unknown) => x is Record<string, unknown>} */
  const isObject = (x) =>
    typeof x === 'object' && x !== null && !Array.isArray(x);

  if (!isObject(v) || !isObject(v['roots']) || !isObject(v['files'])) {
    return ['not an object with roots and files'];
  }

  const pinRoots = v['roots'];
  const files = v['files'];
  /** @type {string[]} */
  const out = [];

  if (v['instance'] !== name) {
    out.push(`instance ${JSON.stringify(v['instance'])}, not ${name}`);
  }

  if (typeof v['at'] !== 'string') {
    out.push('no "at" time');
  }

  for (const [root, version] of Object.entries(pinRoots)) {
    if (!roots.includes(root)) {
      out.push(`root ${JSON.stringify(root)} is not a registry pin root`);
    }

    if (typeof version !== 'string' || !VERSION.test(version)) {
      out.push(
        `${root} version ${JSON.stringify(version)} is not a version folder name`,
      );
    }

    const list = files[root];

    if (!isObject(list) || Object.keys(list).length === 0) {
      out.push(`no file list for ${root}`);
      continue;
    }

    for (const [f, size] of Object.entries(list)) {
      if (
        f
          .split('/')
          .some((s) => s === '' || s === '.' || s === '..' || /[\\:]/.test(s))
      ) {
        out.push(
          `${root} file ${JSON.stringify(f)} is not a plain relative path`,
        );
      }

      if (!Number.isInteger(size) || /** @type {number} */ (size) < 0) {
        out.push(
          `${root} file ${f} size ${JSON.stringify(size)} is not a byte count`,
        );
      }
    }
  }

  for (const root of Object.keys(files)) {
    if (!Object.hasOwn(pinRoots, root)) {
      out.push(`file list for ${JSON.stringify(root)} with no pinned version`);
    }
  }

  return out;
}

/**
 * The instance's pin, or null when it has none; a pin.json that does not parse or check out is a refusal (exit 2).
 * @param {Inst} inst
 * @returns {Pin | null}
 */
function readPin(inst) {
  const f = join(pinFolderOf(inst.name), 'pin.json');

  if (!existsSync(f)) {
    return null;
  }

  /** @type {unknown} */
  let v;

  try {
    v = JSON.parse(readFileSync(f, 'utf8'));
  } catch (e) {
    return refuse(
      `${f} does not parse (${e instanceof Error ? e.message : String(e)}); run "model pin ${inst.name}" again on a healthy instance`,
    );
  }

  const bad = pinProblems(v, inst.name, inst.pin ?? []);

  if (bad.length > 0) {
    refuse(
      `${f} is not a valid pin (${bad.slice(0, 3).join('; ')}); run "model pin ${inst.name}" again on a healthy instance`,
    );
  }

  return /** @type {Pin} */ (v);
}

/**
 * What `up` would do to the pinned roots: the version folders on disk against the pin, by name and by contents.
 * @param {Inst} inst
 * @param {Pin} pin
 * @returns {PinPlan}
 */
function planFor(inst, pin) {
  return pinPlan(
    pin.roots,
    pinRootsOnDisk(inst),
    (root, version) =>
      listingDiff(pin.files[root] ?? {}, listing(join(inst.dir, root, version)))
        .length > 0,
  );
}

/**
 * A `model pin` swap that stopped between its two renames leaves only `<dir>.old`; puts it back.
 * @param {string} dir
 * @returns {boolean}  whether it put one back
 */
export function restoreSwap(dir) {
  if (existsSync(dir) || !existsSync(`${dir}.old`)) {
    return false;
  }

  renameSync(`${dir}.old`, dir);

  return true;
}

/** @param {Inst} inst */
function recoverPinSwap(inst) {
  if (restoreSwap(pinFolderOf(inst.name))) {
    log(
      'WARN',
      `${inst.name}: put back the pin an interrupted "model pin" left at ${pinFolderOf(inst.name)}.old`,
    );
  }
}

/**
 * The registry's pin roots the pin does not hold (the registry gained a root after the pin was taken).
 * @param {Inst} inst
 * @param {Pin} pin
 * @returns {string[]}
 */
function unpinnedRoots(inst, pin) {
  return (inst.pin ?? []).filter((r) => !Object.hasOwn(pin.roots, r));
}

/**
 * The version folders of each pinned component root in the profile.
 * @param {Inst} inst
 * @returns {Record<string, string[]>}
 */
function pinRootsOnDisk(inst) {
  return Object.fromEntries(
    (inst.pin ?? []).map((r) => [r, versionFolders(join(inst.dir, r))]),
  );
}

/**
 * `up` on a stopped instance with a pin: makes its pinned component roots hold the pinned versions again, whatever
 * an update, a crash or an interrupted download left there.
 * @param {Inst} inst
 * @returns {PinPlan | null}  the plan carried out, or null when there was nothing to do
 */
function restorePin(inst) {
  if (inst.pin) {
    recoverPinSwap(inst);
  }

  const pin = inst.pin ? readPin(inst) : null;

  if (pin === null) {
    if (inst.pin) {
      log(
        'WARN',
        `${inst.name} has no pin yet: once doctor passes, run "model pin ${inst.name}" so up can restore its model components`,
      );
    }

    return null;
  }

  const plan = planFor(inst, pin);
  const unpinned = unpinnedRoots(inst, pin);

  if (unpinned.length > 0) {
    log(
      'WARN',
      `the pin of ${inst.name} lacks ${unpinned.join(', ')}; run "model pin ${inst.name}" again once doctor passes`,
    );
  }

  if (plan.remove.length === 0 && plan.add.length === 0) {
    return null;
  }

  applyPin(inst.dir, pinFolderOf(inst.name), plan, pin.files);
  log(
    'WARN',
    `${inst.name}: the model components on disk differed from the pin of ${pin.at}; restored it (${describePlan(plan)})`,
  );

  return plan;
}

/**
 * The slot whose port for this instance is `port`, or null for a port no slot has (`--port`).
 * @param {Pick<Inst, 'index' | 'mainPort'>} inst
 * @param {number} port
 * @returns {number | null}
 */
export function slotFor(inst, port) {
  const slot = Array.from({ length: SLOTS }, (_, i) => i).find(
    (i) => portAt(inst.index, inst.mainPort, i) === port,
  );

  return slot ?? null;
}

/**
 * @param {Inst} inst  on the port it runs on
 * @param {ProcRecord} proc  the live main process
 * @param {{ slot: number, ports: PortEntry[] }} [placed]  what up planned; else the slot of the port it runs on
 * @param {ProcRecord[]} [seen]  processes of this instance already seen (up: the spawn's snapshot)
 * @returns {State}
 */
function writeState(inst, proc, placed, seen = []) {
  mkdirSync(TMP, { recursive: true });
  const prior = readState(inst.name);
  const rows = processTable();
  const live = new Map(rows.map((r) => [r.pid, r]));
  // A state file of this same browser process keeps what it recorded; one of another process keeps only its records
  // that still run (a down that exited 2 left them), so a later down still stops them.
  const kept =
    prior === null
      ? []
      : prior.pid === proc.pid && rootOf(prior)?.start === proc.start
        ? (prior.tree ?? [])
        : (prior.tree ?? []).filter((r) => matches(r, live.get(r.pid)));
  /** @type {State} */
  const st = {
    instance: inst.name,
    pid: proc.pid,
    tree: merge(merge(snapshot(proc, { table: () => rows }), kept), seen),
    port: inst.port,
    slot: placed?.slot ?? slotFor(inst, inst.port),
    ports: [
      ...(placed?.ports ?? [{ name: 'cdp', port: inst.port, kind: 'derived' }]),
      BENCH_APP,
    ],
    cdp: inst.cdp,
    session: inst.session,
    profile: inst.dir,
    backend: drift(inst, proc).backend,
    extensionDir: inst.extensionDir,
    at: new Date().toISOString(),
  };
  writeFileSync(statePath(inst.name), JSON.stringify(st, null, 2));

  return st;
}

// ---------- playwright-cli ----------
/** @type {Inst | null} */
let attachedHere = null;

/**
 * playwright-cli's script beside its npm shim on PATH (absolute PATH entries only), or null.
 * @param {string} pathEnv
 * @returns {string | null}
 */
export function findPlaywrightCli(pathEnv) {
  const shimDir = pathEnv
    .split(delimiter)
    .find((d) => isAbsolute(d) && existsSync(join(d, 'playwright-cli.cmd')));
  const js =
    shimDir &&
    join(shimDir, 'node_modules', '@playwright', 'cli', 'playwright-cli.js');

  return js && existsSync(js) ? js : null;
}

/**
 * @param {Inst} inst
 * @param {string[]} args
 * @param {{ raw?: boolean, timeoutMs?: number }} [options]
 * @returns {PwRun}
 */
function pw(inst, args, { raw = false, timeoutMs = 120000 } = {}) {
  const js = findPlaywrightCli(process.env['PATH'] ?? '');

  if (!js) {
    return { code: 127, out: 'playwright-cli not found on PATH' };
  }

  const full = [...(raw ? ['--raw'] : []), `-s=${inst.session}`, ...args];
  const r = spawnSync(process.execPath, [js, ...full], {
    cwd: ROOT,
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 64 * 1024 * 1024,
    timeout: timeoutMs,
  });
  const error = /** @type {(Error & { code?: string }) | undefined} */ (
    r.error
  );

  if (error?.code === 'ETIMEDOUT') {
    return {
      code: -1,
      out: `playwright-cli ${args[0]} timed out after ${timeoutMs} ms; a tab renderer may be hung (see Gotchas)`,
    };
  }

  return { code: r.status, out: (r.stdout ?? '') + (r.stderr ?? '') };
}

/** @param {Inst} inst */
function isAttached(inst) {
  const r = pw(inst, ['tab-list']);

  return r.code === 0 && !/is not open|not connected/i.test(r.out);
}

/**
 * Replaces the instance's idle about:blank tabs with one new blank tab. An Edge blank tab left idle for some minutes
 * still answers raw CDP but blocks every playwright-cli run-code, even `async page => 1+1`, and newPage() with it
 * (measured on edge-dev-aion and edge-phi4mini, 2026-10-19); a new tab clears it. Other pages are left alone.
 * @param {Inst} inst
 */
async function freshBlankTab(inst) {
  const stale = (await pageTargets(inst)).filter(
    (t) => t.url === 'about:blank',
  );

  if (stale.length === 0) {
    return;
  }

  const opened = await fetch(`${inst.cdp}/json/new?about:blank`, {
    method: 'PUT',
    signal: AbortSignal.timeout(3000),
  }).then(
    (r) => r.ok,
    () => false,
  );

  // Without a new tab, closing the old ones would leave the browser with none.
  if (!opened) {
    return;
  }

  for (const t of stale) {
    await fetch(`${inst.cdp}/json/close/${t.id}`, {
      signal: AbortSignal.timeout(3000),
    }).catch(() => {});
  }
}

// Attaches the instance's session when it is not attached, on fresh blank tabs; a session this command attached is
// detached when it ends.
/** @param {Inst} inst */
async function ensureAttached(inst) {
  if (isAttached(inst)) {
    return;
  }

  await freshBlankTab(inst);
  const r = pw(inst, ['attach', `--cdp=${inst.cdp}`]);

  if (r.code !== 0 || !isAttached(inst)) {
    refuse(
      `playwright-cli could not attach ${inst.session} to ${inst.cdp}: ${r.out.trim().slice(0, 300)}`,
    );
  }

  attachedHere = inst;
}

/** @typedef {{ args?: Record<string, unknown>, url?: string | null, purpose?: string }} TabOptions */

// A run-code file that runs `async (p, args) => {...}` in a tab it opens and always closes. Tabs carry ?ai-browsers=<purpose>.
/**
 * @param {string} body
 * @param {TabOptions} [options]
 * @returns {string}
 */
export function tabSource(
  body,
  { args = {}, url = PROBE_ORIGIN, purpose = 'probe' } = {},
) {
  const target =
    url && url.startsWith('https://')
      ? `${url}${url.includes('?') ? '&' : '?'}ai-browsers=${purpose}`
      : url;

  return `async page => {
  const p = await page.context().newPage();
  try {
    ${target ? `await p.goto(${JSON.stringify(target)});` : ''}
    return await (${body})(p, ${JSON.stringify(args)});
  } finally {
    await p.close().catch(() => {});
  }
}`;
}

/**
 * @param {Inst} inst
 * @param {string} body
 * @param {TabOptions} [options]
 * @param {number} [timeoutMs]  how long the playwright-cli client may run; see runCode
 * @returns {Promise<unknown>}
 */
async function inTab(inst, body, options, timeoutMs) {
  return runCode(inst, tabSource(body, options), timeoutMs);
}

/**
 * @param {Inst} inst
 * @param {string} src
 * @param {number} [timeoutMs]  default `--timeout-min` (15) minutes
 * @returns {Promise<unknown>}
 */
async function runCode(
  inst,
  src,
  timeoutMs = positiveFlag('timeout-min', opts['timeout-min'], 15) * 60000,
) {
  await ensureAttached(inst);
  mkdirSync(join(TMP, 'run'), { recursive: true });
  const file = join(
    TMP,
    'run',
    `${inst.session}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.js`,
  );
  writeFileSync(file, src);
  const r = pw(inst, ['run-code', `--filename=${file}`], {
    raw: true,
    timeoutMs,
  });
  rmSync(file, { force: true });

  if (r.code !== 0) {
    throw new Error(`run-code failed: ${r.out.trim().slice(0, 600)}`);
  }

  const text = r.out.trim();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ---------- page snippets ----------
const DEEP_TEXT = `() => {
  const parts = [];
  const walk = (n) => {
    if (n.nodeType === 3) {
      const t = n.textContent.trim();
      if (t) {
        parts.push(t);
      }
      return;
    }
    if (n.nodeType !== 1 && n.nodeType !== 11) {
      return;
    }
    if (n.nodeType === 1 && (n.tagName === 'STYLE' || n.tagName === 'SCRIPT' || n.hidden)) {
      return;
    }
    if (n.shadowRoot) {
      walk(n.shadowRoot);
    }
    for (const c of n.childNodes) {
      walk(c);
    }
  };
  walk(document.body);
  return parts.join(' | ');
}`;

// Same walk as spikes/probes/broker-state.js, in a tab of its own.
const BROKER = `async (p, { scheme }) => {
  await p.goto(scheme + '://on-device-internals');
  const first = await p.evaluate(${DEEP_TEXT});
  if (/Internal debugging pages are currently disabled/i.test(first)) {
    return 'DEBUG-PAGES-DISABLED';
  }
  await p.locator('[role=tab]').nth(2).click({ force: true, timeout: 10000 }).catch(() => p.locator('[role=tab]').nth(2).press('Enter'));
  let text = '';
  for (let i = 0; i < 30; i++) {
    text = await p.evaluate(${DEEP_TEXT});
    if (text.includes('Manifest Path')) {
      break;
    }
    await p.waitForTimeout(1000);
  }
  return text;
}`;

const ENABLE_DEBUG_PAGES = `async (p) => {
  await p.goto('chrome://chrome-urls');
  const b = p.getByRole('button', { name: /Enable internal debugging pages/i });
  if (!(await b.count())) {
    return 'already enabled';
  }
  await b.click({ timeout: 5000 }).catch(async () => { await b.focus(); await p.keyboard.press('Enter'); });
  await p.getByRole('button', { name: /Disable internal debugging pages/i }).waitFor({ timeout: 10000 });
  return 'enabled';
}`;

// Edge Dev 157 disables an unpacked extension while developer mode is off (disableReasons
// unsupportedDeveloperExtension) and enables it again once it is on; Edge 155 and Chrome Beta 157 do not (measured
// 2026-10-19). The setting is kept in the profile.
const DEVELOPER_MODE = `async (p, { scheme }) => {
  await p.goto(scheme + '://extensions/');
  return await p.evaluate(async () => {
    const dp = globalThis.chrome.developerPrivate;
    if ((await dp.getProfileConfiguration()).inDeveloperMode) {
      return 'already on';
    }
    await dp.updateProfileConfiguration({ inDeveloperMode: true });
    return 'turned on';
  });
}`;

const VERSION_CMDLINE = `async (p, { scheme }) => {
  await p.goto(scheme + '://version');
  return await p.locator('#command_line').textContent();
}`;

const AVAILABILITY = `async (p) => p.evaluate(async () => {
  const o = {};
  const check = async (name, fn) => {
    try {
      o[name] = await Promise.race([fn(), new Promise((r) => setTimeout(() => r('no answer in 20 s'), 20000))]);
    } catch (e) {
      o[name] = 'ERR ' + e.name + ': ' + e.message;
    }
  };
  const g = globalThis;
  await check('LanguageModel', () => g.LanguageModel ? LanguageModel.availability() : 'undefined');
  await check('LanguageModelTools', () => g.LanguageModel ? LanguageModel.availability({ expectedInputs: [{ type: 'text' }, { type: 'tool-response' }], expectedOutputs: [{ type: 'text' }, { type: 'tool-call' }] }) : 'undefined');
  await check('Summarizer', () => g.Summarizer ? Summarizer.availability() : 'undefined');
  await check('Writer', () => g.Writer ? Writer.availability() : 'undefined');
  await check('Rewriter', () => g.Rewriter ? Rewriter.availability() : 'undefined');
  await check('Proofreader', () => g.Proofreader ? Proofreader.availability() : 'undefined');
  await check('LanguageDetector', () => g.LanguageDetector ? LanguageDetector.availability() : 'undefined');
  await check('Translator(en->da)', () => g.Translator ? Translator.availability({ sourceLanguage: 'en', targetLanguage: 'da' }) : 'undefined');
  o.webmcp = { documentModelContext: typeof document.modelContext, navigatorModelContext: typeof navigator.modelContext };
  o.userAgent = navigator.userAgent;
  return o;
})`;

const CANARY = `async (p, { toolCanary }) => p.evaluate(async ([toolCanary, ms]) => {
  const o = {};
  const to = (pr) => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error('step timeout ' + ms + ' ms')), ms))]);
  const t0 = performance.now();
  try {
    const s = await to(LanguageModel.create());
    o.contextWindow = s.contextWindow;
    const t1 = performance.now();
    const raw = await to(s.prompt('Name one Angular lifecycle hook.', { responseConstraint: { type: 'object', properties: { hook: { type: 'string' } }, required: ['hook'] } }));
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // not JSON: structured fails below
    }
    o.structured = { pass: !!parsed && typeof parsed.hook === 'string', raw, ms: Math.round(performance.now() - t1) };
    s.destroy();
  } catch (e) {
    o.structured = { pass: false, error: e.name + ': ' + e.message };
  }
  o.createMs = Math.round(performance.now() - t0);
  if (!toolCanary) {
    o.tools = { pass: null, skipped: 'this model has no tool calling (it answers in text); see Gotchas' };
  }
  // Up to three fresh sessions: Phi-4-mini often answers the tool question in prose (5 of 15 native runs passed).
  for (let attempt = 1; toolCanary && attempt <= 3 && !o.tools?.pass; attempt++) {
    try {
      const calls = [];
      const impl = { get_component_count: () => ({ count: 42 }) };
      const s = await to(LanguageModel.create({
        initialPrompts: [{ role: 'system', content: 'You cannot see the page; call tools to answer.' }],
        expectedInputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-response' }],
        expectedOutputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-call' }],
        tools: [{ name: 'get_component_count', description: 'Returns how many Angular components are on the page.', inputSchema: { type: 'object', properties: { scope: { type: 'string', description: 'Use "page".' } }, required: ['scope'] } }],
      }));
      const t = performance.now();
      let input = 'How many Angular components are on the page?';
      let answer = null;
      for (let step = 0; step < 4 && answer === null; step++) {
        const out = await to(s.prompt(input));
        const parts = Array.isArray(out) ? out : [{ type: 'text', value: out }];
        const tc = parts.filter((x) => x.type === 'tool-call').map((x) => x.value);
        if (tc.length === 0) {
          answer = parts.map((x) => x.value).join('');
          break;
        }
        input = [{ role: 'user', content: tc.map((c) => {
          const id = c.callID ?? c.callId;
          calls.push({ name: c.name, callID: id, arguments: c.arguments });
          const result = impl[c.name]?.(c.arguments ?? {});
          // Chrome Beta 156 reads callID; Edge Dev 157.0.4329 requires callId. Unknown dictionary members are ignored.
          return { type: 'tool-response', value: result
            ? new LanguageModelToolSuccess({ callID: id, callId: id, name: c.name, result: [{ type: 'object', value: result }] })
            : new LanguageModelToolError({ callID: id, callId: id, name: c.name, errorMessage: 'unknown tool' }) };
        }) }];
      }
      o.tools = { pass: calls.some((c) => c.name === 'get_component_count') && /\\b(42|forty-two)\\b/i.test(answer ?? ''), calls, answer, ms: Math.round(performance.now() - t), contextUsage: s.contextUsage, attempt };
      s.destroy();
    } catch (e) {
      o.tools = { pass: false, error: e.name + ': ' + e.message, attempt };
    }
  }
  o.webmcp = { pass: typeof document.modelContext === 'object', documentModelContext: typeof document.modelContext };
  return o;
}, [toolCanary, ${STEP_TIMEOUT_MS}])`;

const INIT = `async (p) => p.evaluate(async (ms) => {
  const o = {};
  const to = (pr) => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error('step timeout ' + ms + ' ms')), ms))]);
  let t = performance.now();
  const s1 = await to(LanguageModel.create());
  o.firstCreateMs = Math.round(performance.now() - t);
  o.contextWindow = s1.contextWindow;
  t = performance.now();
  o.answer = await to(s1.prompt('Say hi in three words.'));
  o.promptMs = Math.round(performance.now() - t);
  o.contextUsage = s1.contextUsage;
  s1.destroy();
  t = performance.now();
  const s2 = await to(LanguageModel.create());
  o.secondCreateMs = Math.round(performance.now() - t);
  s2.destroy();
  return o;
}, ${STEP_TIMEOUT_MS})`;

// edge://components, read only: each model component's update button and status. The status runs from "Status - " to
// the button's own label, so it reads the same whatever language the browser shows the label in.
export const EDGE_COMPONENT_LIST = `async (p, { names }) => {
  await p.goto('edge://components');
  await p.waitForSelector('.button-check-update');
  return p.evaluate((names) => [...document.querySelectorAll('.button-check-update')].map((b) => {
    let n = b;
    while (n && !/Version/.test(n.textContent)) {
      n = n.parentElement;
    }
    // The page indents its markup, so its text holds runs of spaces and line breaks (measured on Edge Dev 157).
    const text = (n?.textContent ?? '').replace(/\\s+/g, ' ');
    const name = names.find((x) => text.includes(x + ' - '));
    if (!name) {
      return null;
    }
    const label = b.textContent.replace(/\\s+/g, ' ').trim();
    let status = text.split('Status - ')[1] ?? null;
    if (status !== null && label && status.includes(label)) {
      status = status.slice(0, status.indexOf(label));
    }
    return { id: b.id, name, status: status === null ? null : status.trim() || null };
  }).filter(Boolean), names);
}`;

// edge://components: press "Check for update" on the model components; a fresh Edge profile can wait at 0% without it.
const EDGE_COMPONENTS = `async (p, { names }) => {
  const ids = await (${EDGE_COMPONENT_LIST})(p, { names });
  for (const c of ids) {
    const b = p.locator('#' + c.id + '.button-check-update');
    await b.click({ timeout: 5000 }).catch(async () => { await b.focus(); await p.keyboard.press('Enter'); });
    await p.waitForTimeout(1000);
  }
  return ids;
}`;

// ---------- readers ----------

/**
 * @param {Inst} inst
 * @returns {LocalState | null}
 */
function readLocalState(inst) {
  const f = join(inst.dir, 'Local State');

  if (!existsSync(f)) {
    return null;
  }

  /** @type {unknown} */
  const ls = JSON.parse(readFileSync(f, 'utf8'));

  return /** @type {LocalState} */ (ls);
}

/** @param {Inst} inst */
function perfClass(inst) {
  return (
    readLocalState(inst)?.optimization_guide?.on_device?.performance_class ??
    null
  );
}

/**
 * @param {Inst} inst
 * @returns {FreeSpace}
 */
function freeSpace(inst) {
  const st = statfsSync(existsSync(inst.dir) ? inst.dir : PROFILES);
  const bytes = Number(st.bavail) * Number(st.bsize);

  return {
    bytes,
    mib: Math.floor(bytes / 1048576),
    minMib: inst.minFreeMib,
    volume: inst.dir.slice(0, 2),
  };
}

/**
 * Whether a real (link-resolved) path lies below the real profile folder, ignoring letter case; `model clear` deletes
 * only such folders.
 * @param {string} profileReal
 * @param {string} dirReal
 * @returns {boolean}
 */
export function insideProfile(profileReal, dirReal) {
  return dirReal
    .toLowerCase()
    .startsWith(profileReal.toLowerCase().replace(/[\\/]+$/, '') + sep);
}

/**
 * Why a download of about `downloadMib` must not start, or null when the volume keeps the browser's minimum free.
 * @param {FreeSpace} free
 * @param {Pick<ModelDef, 'name' | 'downloadMib'>} model
 * @returns {string | null}
 */
export function downloadRefusal(free, model) {
  if (free.mib - model.downloadMib < free.minMib) {
    return `download refused: ${free.mib} MiB free on ${free.volume} minus about ${model.downloadMib} MiB for ${model.name} leaves ${free.mib - model.downloadMib} MiB, under the browser minimum of ${free.minMib} MiB`;
  }

  return null;
}

/**
 * @param {string} dir
 * @returns {number}
 */
function dirSize(dir) {
  let total = 0;

  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    total += e.isDirectory() ? dirSize(f) : statSync(f).size;
  }

  return total;
}

/**
 * The model folders (a manifest.json, at most three levels down) under the instance's model roots.
 * @param {Pick<Inst, 'dir' | 'modelRoots'>} inst
 * @returns {DiskModel[]}
 */
export function diskModels(inst) {
  /** @type {DiskModel[]} */
  const out = [];
  /** @type {(dir: string, depth: number) => void} */
  const visit = (dir, depth) => {
    if (!existsSync(dir) || depth > 3) {
      return;
    }

    const manifest = join(dir, 'manifest.json');

    if (existsSync(manifest)) {
      /** @type {ModelManifest} */
      const m = JSON.parse(readFileSync(manifest, 'utf8'));
      const bytes = dirSize(dir);
      out.push({
        name: m.BaseModelSpec?.name ?? m.name,
        modelVersion: m.BaseModelSpec?.version,
        componentVersion: m.version,
        performanceHints: m.BaseModelSpec?.supported_performance_hints,
        dir,
        bytes,
        mib: Math.round(bytes / 1048576),
      });

      return;
    }

    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        visit(join(dir, e.name), depth + 1);
      }
    }
  };

  for (const r of inst.modelRoots) {
    visit(join(inst.dir, r), 0);
  }

  return out;
}

/**
 * @param {string} text
 * @returns {Broker}
 */
export function parseBroker(text) {
  const assets = [
    ...text.matchAll(
      /([a-z0-9_]+) \| (\d{4}\.[\d.]+) \| (Ready|Not Installed|Registering|Background Installing|Foreground Installing|Uninstalling|Unknown) \| (\d+)%/g,
    ),
  ].map((m) => ({
    name: m[1] ?? '',
    version: m[2] ?? '',
    state: m[3] ?? '',
    progress: Number(m[4]),
  }));
  const useCases = Object.fromEntries(
    [
      ...text.matchAll(
        /\| ([a-z][a-z0-9_]+) \| (Available|Not Supported|Pending Usage|Pending Assets|[A-Z][A-Za-z ]+?) (?=\|)/g,
      ),
    ].map((m) => [m[1] ?? '', (m[2] ?? '').trim()]),
  );
  const models = [
    ...text.matchAll(
      /([a-z0-9_]+) \| ([\d,.]+) \| MiB \| (?:([A-Z]:\\[^|]+?) \| )?(GPU[^|]*?|CPU)(?= \||$)/g,
    ),
  ].map((m) => ({
    name: m[1] ?? '',
    mib: Number((m[2] ?? '').replace(/,/g, '')),
    weights: m[3] ?? null,
    backend: (m[4] ?? '').trim(),
  }));
  /** @type {(label: string) => string | null} */
  const pick = (label) =>
    text.match(new RegExp(`${label} \\| ([^|]+?) \\|`))?.[1] ?? null;

  return {
    manifestPath: pick('Manifest Path'),
    manifestLoaded: pick('Manifest Loaded'),
    perfClass: pick('Performance Class'),
    diskInstall: pick('Enough disk space to install'),
    assets,
    useCases,
    models,
  };
}

/**
 * Whether Broker State has not loaded the model manifest yet, as right after a launch, so its model rows are not
 * there to judge.
 * @param {Broker | BrokerDisabled} b
 * @returns {boolean}
 */
export function brokerPending(b) {
  return !b.disabled && b.manifestLoaded !== 'true';
}

/**
 * What Broker State says about the instance's model asset, against the model component versions on disk.
 * `in-flight`: an Installing or Registering asset, or, on Edge, no asset row while the manifest is loaded (measured
 * while Edge updated its model component). `mismatch`: the asset is not Ready and the version Broker State wants is
 * not the only one on disk (measured: Edge's updater put model 2026.10.15.1 on disk while its manifest
 * component still named 2026.10.2.1).
 * @param {Broker | BrokerDisabled} b
 * @param {RegExp} asset
 * @param {string[]} onDisk  component versions of the instance's model on disk
 * @param {boolean} edge
 * @returns {{ verdict: 'ready' | 'in-flight' | 'mismatch' | 'other', detail: string }}
 */
export function assetVerdict(b, asset, onDisk, edge) {
  if (b.disabled || b.manifestLoaded !== 'true') {
    return {
      verdict: 'other',
      detail: b.disabled
        ? b.error
        : 'Broker State has not loaded the model manifest yet',
    };
  }

  const rows = b.assets.filter((a) => asset.test(a.name));
  const row = rows.find((a) => a.state === 'Ready') ?? rows[0];

  if (row === undefined) {
    return edge
      ? {
          verdict: 'in-flight',
          detail: `no ${asset.source} row while the manifest is loaded: a model component update is in flight`,
        }
      : { verdict: 'other', detail: `no ${asset.source} row` };
  }

  if (row.state === 'Ready') {
    return { verdict: 'ready', detail: `${row.name} ${row.version} Ready` };
  }

  if (/Installing|Registering/.test(row.state)) {
    return {
      verdict: 'in-flight',
      detail: `${row.name} ${row.version} ${row.state} ${row.progress}%`,
    };
  }

  // Right after the update the old folder is still beside the new one; Edge deletes it at the next start (measured).
  if (onDisk.some((v) => v !== row.version)) {
    return {
      verdict: 'mismatch',
      detail: `Broker State wants ${row.name} ${row.version} (${row.state}), the disk holds ${onDisk.join(', ')}: the model component moved past the version the manifest names`,
    };
  }

  return {
    verdict: 'other',
    detail: `${row.name} ${row.version} ${row.state} ${row.progress}%`,
  };
}

/**
 * The version folders (`2026.10.2.1`) directly below a folder; none when it is missing.
 * @param {string} dir
 * @returns {string[]}
 */
export function versionFolders(dir) {
  return existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isDirectory() && VERSION.test(e.name))
        .map((e) => e.name)
        .sort()
    : [];
}

/**
 * Every file below a folder with its size, by `/`-separated relative path, walked with lstat. Links (symlinks and
 * junctions) are listed in `links` and never followed.
 * @param {string} dir
 * @returns {Listing}
 */
export function listing(dir) {
  /** @type {Listing} */
  const out = { files: {}, links: [] };
  /** @type {(d: string, rel: string) => void} */
  const walk = (d, rel) => {
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name);
      const r = rel ? `${rel}/${name}` : name;
      const st = lstatSync(p);

      if (st.isSymbolicLink()) {
        out.links.push(r);
      } else if (st.isDirectory()) {
        walk(p, r);
      } else {
        out.files[r] = st.size;
      }
    }
  };
  walk(dir, '');

  return out;
}

/**
 * How a folder's files differ from the pinned list, one line each; empty when they match.
 * @param {Record<string, number>} want
 * @param {Listing} have
 * @returns {string[]}
 */
export function listingDiff(want, have) {
  /** @type {string[]} */
  const out = have.links.map((l) => `link ${l}`);

  for (const [f, size] of Object.entries(want)) {
    const got = Object.hasOwn(have.files, f) ? have.files[f] : undefined;

    if (got === undefined) {
      out.push(`missing ${f}`);
    } else if (got !== size) {
      out.push(`${f} ${got} bytes, pinned ${size}`);
    }
  }

  for (const f of Object.keys(have.files)) {
    if (!Object.hasOwn(want, f)) {
      out.push(`extra ${f}`);
    }
  }

  return out;
}

/**
 * What makes the pinned component roots of a profile hold exactly the pinned versions: the other version folders to
 * remove, and the pinned ones to copy in, either missing or present with other contents (`replace`).
 * @param {Pin['roots']} pinned  root -> version
 * @param {Record<string, string[]>} disk  root -> version folders on disk
 * @param {(root: string, version: string) => boolean} [differs]  whether a present pinned folder's contents differ
 * @returns {PinPlan}
 */
export function pinPlan(pinned, disk, differs = () => false) {
  /** @type {PinPlan} */
  const plan = { remove: [], add: [] };

  for (const [root, version] of Object.entries(pinned)) {
    const have = disk[root] ?? [];
    plan.remove.push(
      ...have.filter((v) => v !== version).map((v) => ({ root, version: v })),
    );

    if (!have.includes(version)) {
      plan.add.push({ root, version });
    } else if (differs(root, version)) {
      plan.add.push({ root, version, replace: true });
    }
  }

  return plan;
}

/**
 * A pin plan as one line: `EdgeLLMOnDeviceModel -2026.10.15.1 +2026.10.2.1`, `~` for a replaced folder.
 * @param {PinPlan} plan
 * @returns {string}
 */
export function describePlan(plan) {
  const roots = [...new Set([...plan.remove, ...plan.add].map((f) => f.root))];

  return roots
    .map((r) =>
      [
        r,
        ...plan.remove.filter((f) => f.root === r).map((f) => `-${f.version}`),
        ...plan.add
          .filter((f) => f.root === r)
          .map((f) => `${f.replace ? '~' : '+'}${f.version}`),
      ].join(' '),
    )
    .join('; ');
}

/**
 * Refuses a folder that resolves elsewhere (a reparse point) or outside the real profile.
 * @param {string} dir
 * @param {string} profileReal
 * @param {string} what
 */
function refuseLinked(dir, profileReal, what) {
  const real = realpathSync.native(dir);
  const linked = reparseRefusal(dir, real);

  if (linked !== null) {
    refuse(`${linked}; not ${what}`);
  }

  if (profileReal !== '' && !insideProfile(profileReal, real)) {
    refuse(
      `${dir} resolves to ${real}, outside the profile ${profileReal}; not ${what}`,
    );
  }
}

/**
 * Carries out a pin plan in a stopped profile. Every check runs before anything is deleted: no reparse point at the
 * profile, the pin folder, a component root or a target, and every pinned source matching `files` with no link in
 * it. Each pinned folder is copied to `<version>.pinning` beside its target and checked against `files`, then
 * renamed into place; the other versions are deleted last.
 * @param {string} profile
 * @param {string} pinFolder
 * @param {PinPlan} plan
 * @param {Pin['files']} files  root -> the pinned folder's files and sizes
 */
export function applyPin(profile, pinFolder, plan, files) {
  const profileReal = realpathSync.native(profile);
  refuseLinked(profile, '', 'restoring the pin under it');
  refuseLinked(pinFolder, '', 'restoring from it');
  const roots = [...new Set([...plan.add, ...plan.remove].map((f) => f.root))];

  for (const r of roots) {
    if (existsSync(join(profile, r))) {
      refuseLinked(join(profile, r), profileReal, 'restoring the pin into it');
    }
  }

  for (const f of plan.add) {
    const src = join(pinFolder, f.root, f.version);

    if (!existsSync(src)) {
      refuse(`the pin has no ${f.root}\\${f.version} in ${pinFolder}`);
    }

    refuseLinked(join(pinFolder, f.root), '', 'restoring from it');
    const bad = listingDiff(files[f.root] ?? {}, listing(src));

    if (bad.length > 0) {
      refuse(
        `the pin's ${f.root}\\${f.version} does not match pin.json (${bad.slice(0, 3).join('; ')}); run "model pin" again on a healthy instance`,
      );
    }
  }

  for (const f of [...plan.remove, ...plan.add.filter((a) => a.replace)]) {
    refuseLinked(join(profile, f.root, f.version), profileReal, 'deleting it');
  }

  /** @type {string[]} */
  const staged = [];

  try {
    for (const f of plan.add) {
      const staging = join(profile, f.root, `${f.version}.pinning`);
      rmSync(staging, { recursive: true, force: true });
      mkdirSync(join(profile, f.root), { recursive: true });
      staged.push(staging);
      cpSync(join(pinFolder, f.root, f.version), staging, { recursive: true });
      const bad = listingDiff(files[f.root] ?? {}, listing(staging));

      if (bad.length > 0) {
        refuse(
          `the copy of ${f.root}\\${f.version} does not match the pin (${bad.slice(0, 3).join('; ')}); nothing in the profile was changed`,
        );
      }
    }
  } catch (e) {
    for (const s of staged) {
      rmSync(s, { recursive: true, force: true });
    }

    throw e;
  }

  for (const f of plan.add) {
    const target = join(profile, f.root, f.version);

    if (existsSync(target)) {
      rmSync(`${target}.replaced`, { recursive: true, force: true });
      renameSync(target, `${target}.replaced`);
    }

    renameSync(`${target}.pinning`, target);
  }

  for (const f of plan.remove) {
    rmSync(join(profile, f.root, f.version), { recursive: true, force: true });
  }

  for (const f of plan.add) {
    rmSync(join(profile, f.root, `${f.version}.replaced`), {
      recursive: true,
      force: true,
    });
  }
}

/**
 * The component versions of the instance's model on disk.
 * @param {Inst} inst
 * @param {DiskModel[]} [disk]
 * @returns {string[]}
 */
function modelVersionsOnDisk(inst, disk = diskModels(inst)) {
  return disk
    .filter((d) => d.name === inst.model.name)
    .flatMap((d) =>
      d.componentVersion === undefined ? [] : [d.componentVersion],
    );
}

/**
 * @param {Inst} inst
 * @param {Broker | BrokerDisabled} broker
 * @param {DiskModel[]} [disk]
 */
function verdictOf(inst, broker, disk) {
  return assetVerdict(
    broker,
    new RegExp(inst.model.asset),
    modelVersionsOnDisk(inst, disk),
    !!inst.modelComponents,
  );
}

/**
 * What to do about a mismatched model component, for a log line.
 * @param {Inst} inst
 * @returns {string}
 */
function pinHint(inst) {
  if (!inst.pin) {
    return `${inst.name} has no "pin" in instances.json; see SKILL.md Gotchas, "Edge updates its model past its manifest"`;
  }

  return readPin(inst)
    ? `"down ${inst.name}", then "up ${inst.name}" restores the pin`
    : `no pin to restore from: copy a matching ${inst.pin.join(' and ')} set into the stopped profile, then "model pin ${inst.name}" once doctor passes`;
}

/**
 * What to do when a pinned instance's LanguageModel is not available. A pin restored into a new profile reads
 * "downloadable" (asset Not Installed, use case Pending Usage) until one create() requests it; create() then installs
 * the pinned files from disk with no download (measured on edge-dev-aion, 2026-10-19).
 * @param {Inst} inst
 */
function requestHint(inst) {
  return readPin(inst)
    ? `run "model init ${inst.name}" once: create() requests the pinned model from disk; if it stays unavailable, ${pinHint(inst)}`
    : pinHint(inst);
}

/**
 * @param {Inst} inst
 * @param {number} [timeoutMs]  how long the playwright-cli client may run; see runCode
 * @returns {Promise<Broker | BrokerDisabled>}
 */
async function brokerState(inst, timeoutMs) {
  const text = /** @type {string} */ (
    await inTab(
      inst,
      BROKER,
      { url: null, args: { scheme: inst.scheme } },
      timeoutMs,
    )
  );

  if (text === 'DEBUG-PAGES-DISABLED') {
    return {
      disabled: true,
      error: `internal debugging pages are off in ${inst.name}; "up ${inst.name}" turns them on (chrome://chrome-urls)`,
    };
  }

  return parseBroker(text);
}

// The backend that serves this instance's model: the Broker State model row whose weights sit in the model's folder.
/**
 * @param {{ model: Pick<ModelDef, 'name'> }} inst
 * @param {Pick<Broker, 'models'>} broker
 * @param {DiskModel[]} disk
 * @returns {Serving}
 */
export function servingBackend(inst, broker, disk) {
  const mine = disk.filter((d) => d.name === inst.model.name);
  const row = broker.models?.find(
    (m) =>
      m.weights &&
      mine.some((d) =>
        /** @type {string} */ (m.weights)
          .toLowerCase()
          .startsWith(d.dir.toLowerCase()),
      ),
  );

  return row
    ? {
        kind: row.backend.startsWith('GPU') ? 'gpu' : 'cpu',
        row: row.name,
        backendType: row.backend,
        weights: row.weights,
      }
    : { kind: null, row: null };
}

/**
 * @typedef {object} ModelInfo
 * @property {string} instance
 * @property {string} expected
 * @property {boolean} running
 * @property {DiskModel[]} disk
 * @property {unknown} performanceClass
 * @property {FreeSpace} free
 * @property {Backend | null} [requestedBackend]
 * @property {Broker | BrokerDisabled} [broker]
 * @property {Serving} [backend]
 * @property {BrokerAsset | null} [asset]
 * @property {string | null | undefined} [serving]
 */

/**
 * @param {Inst} inst
 * @returns {Promise<ModelInfo>}
 */
async function modelInfo(inst) {
  const disk = diskModels(inst);
  const proc = mainProcess(inst);
  /** @type {ModelInfo} */
  const out = {
    instance: inst.name,
    expected: inst.model.name,
    running: !!proc,
    disk,
    performanceClass: perfClass(inst),
    free: freeSpace(inst),
  };

  if (!proc) {
    return out;
  }

  out.requestedBackend = drift(inst, proc).backend;
  const broker = await brokerState(inst);
  out.broker = broker;

  if (!broker.disabled) {
    const backend = servingBackend(inst, broker, disk);
    out.backend = backend;
    out.asset =
      broker.assets.find((a) => new RegExp(inst.model.asset).test(a.name)) ??
      null;
    out.serving = backend.row
      ? (disk.find((d) =>
          String(backend.weights).toLowerCase().startsWith(d.dir.toLowerCase()),
        )?.name ?? null)
      : null;
  }

  return out;
}

function cpuLoad() {
  const load =
    /** @type {{ Average: number | null }[]} */ (
      pwshJson(
        'Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average | Select-Object Average',
      )
    )[0]?.Average ?? null;
  const top = /** @type {{ Name: string, PercentProcessorTime: number }[]} */ (
    pwshJson(
      "Get-CimInstance Win32_PerfFormattedData_PerfProc_Process | Where-Object { $_.Name -notin '_Total','Idle' } | Sort-Object PercentProcessorTime -Descending | Select-Object -First 5 Name,PercentProcessorTime",
    )
  );

  return {
    at: new Date().toISOString(),
    loadPercent: load,
    top: top.map((p) => `${p.Name} ${p.PercentProcessorTime}%`),
  };
}

// ---------- doctor rules ----------

/**
 * The log marker of a doctor check.
 * @param {boolean | null} pass
 * @param {boolean} warn
 * @returns {string}
 */
export function checkMarker(pass, warn) {
  return pass === null ? 'SKIP' : !pass ? 'ERROR' : warn ? 'WARN' : 'OK';
}

/**
 * Healthy when no check failed; skipped (null) and warned checks do not count against it.
 * @param {Pick<Check, 'pass'>[]} checks
 * @returns {boolean}
 */
export function doctorOk(checks) {
  return checks.every((c) => c.pass !== false);
}

/**
 * The canary.tools verdict: "report" keeps the result without gating health on it.
 * @param {ModelDef['toolCanary']} toolCanary
 * @param {CanaryPart | undefined} tools
 * @returns {boolean | null}
 */
export function toolsPass(toolCanary, tools) {
  return toolCanary === 'report' ? null : (tools?.pass ?? null);
}

/**
 * @param {Pick<Result, 'ok' | 'couldNotRun'>} result
 * @returns {number}
 */
export function exitCode(result) {
  return result.couldNotRun
    ? EXIT.REFUSED
    : result.ok
      ? EXIT.OK
      : EXIT.UNHEALTHY;
}

// ---------- commands ----------

/** @returns {Promise<Result>} */
async function cmdInstances() {
  const rows = [];

  for (const name of Object.keys(REGISTRY.instances)) {
    const inst = located(instance(name));
    const proc = mainProcess(inst);
    const d = proc ? drift(inst, proc) : null;
    const port = proc ? parseCommandLine(proc.commandLine).port : inst.port;
    const tabs = proc ? await pageTabs(at(inst, port)) : [];
    const row = {
      name,
      browser: inst.browser,
      port,
      model: inst.model.name,
      defaultBackend: inst.backend.default,
      profileExists: existsSync(inst.dir),
      pid: proc?.pid ?? null,
      backend: d?.backend ?? null,
      drift: d?.problems ?? null,
      tabs: tabs.length,
      stateFile: existsSync(statePath(name)),
    };
    rows.push(row);
    log(
      proc && d ? (d.problems.length ? 'WARN' : 'OK') : 'INFO',
      `${name} :${port} ${inst.model.name}: ${proc && d ? `PID ${proc.pid}, backend ${d.backend ?? '?'}${d.problems.length ? `, drift: ${d.problems.join('; ')}` : ''}, ${tabs.length} tab(s)` : 'stopped'}`,
    );
  }

  return { ok: true, instances: rows };
}

/**
 * @param {Inst} registered  the registry instance; `--extension` replaces its extension
 * @returns {Promise<Result>}
 */
async function cmdUp(registered) {
  const inst = {
    ...registered,
    extensionDir:
      typeof opts['extension'] === 'string'
        ? extensionFlag(opts['extension'])
        : registered.extensionDir,
  };
  const backend =
    typeof opts['backend'] === 'string'
      ? opts['backend']
      : inst.backend.default;
  // `--no-ai-features`: an experiment launch with no --enable-features at all (what a user's browser has); doctor then
  // reports drift. Every other switch, the Edge sign-in ones included, stays.
  const features =
    opts['no-ai-features'] === true ? [] : featuresFor(inst, backend);
  const forced = portFlag(opts['port']);
  const running = mainProcess(inst);

  if (running) {
    const loaded = readState(inst.name)?.extensionDir;

    if (loaded !== undefined && loaded !== inst.extensionDir) {
      refuse(
        `${inst.name} runs with the extension from ${loaded}, not ${inst.extensionDir}; run "down ${inst.name}" first`,
      );
    }

    const d = drift(inst, running);
    const mismatch = upMismatch(inst.name, running.pid, d, backend, forced);

    if (mismatch !== null) {
      refuse(mismatch);
    }

    log(
      'OK',
      `${inst.name} already runs as PID ${running.pid} with backend ${backend}`,
    );

    const st = writeState(at(inst, d.commandLine.port), running);

    return {
      ok: true,
      alreadyRunning: true,
      session: st.session,
      evidenceDir,
      state: st,
    };
  }

  const firstUse = !existsSync(inst.dir);
  const account = profileAccount(inst);

  if (account.accounts > 0 || account.syncSetup) {
    refuse(
      `${inst.name}'s profile holds a signed-in account (${account.accounts} account entr${account.accounts === 1 ? 'y' : 'ies'}, sync set up: ${account.syncSetup}); an instance profile must never hold one. Delete ${inst.dir} (stopped) and "up" again; the model comes back by "model download", or from the pin`,
    );
  }
  mkdirSync(inst.dir, { recursive: true });

  const linked = reparseRefusal(inst.dir, realpathSync.native(inst.dir));

  if (linked !== null) {
    refuse(linked);
  }

  const pinRestored = restorePin(inst);

  /** @type {PortRow[]} */
  const rows = [
    {
      name: 'cdp',
      kind: 'derived',
      at: (slot) => portAt(inst.index, inst.mainPort, slot),
    },
  ];
  let order = slotOrder(inst.slot);
  const first = order[0];

  for (;;) {
    const plan = planPorts(
      rows,
      order,
      await busyPorts(candidatePorts(rows, order, forced, first)),
      forced,
      first,
    );

    if (!plan.ok) {
      return refuse(plan.reason);
    }

    const run = at(inst, /** @type {PortEntry} */ (plan.ports[0]).port);
    const t0 = Date.now();
    // One result file per launch, so two runs never read or delete each other's; the keeper writes it at once.
    const keeperResult =
      run.extensionDir === null
        ? null
        : join(TMP, `extension-${run.name}-${t0}.json`);
    mkdirSync(TMP, { recursive: true });
    // Every way out of this attempt but a successful load (which reads and removes it) drops the result file.
    const dropKeeperResult = () =>
      keeperResult !== null && rmSync(keeperResult, { force: true });
    // The browser and its keeper outlive this command; started in a worktree they would hold its folder open, and
    // retiring that worktree would fail. The primary checkout outlives every worktree.
    const spawnOptions = /** @type {const} */ ({
      detached: true,
      stdio: 'ignore',
      cwd: PRIMARY,
    });
    const child =
      run.extensionDir === null || keeperResult === null
        ? spawn(run.exe, launchArgs(run, features), spawnOptions)
        : spawn(
            process.execPath,
            [
              KEEPER,
              keeperResult,
              run.exe,
              run.extensionDir,
              ...launchArgs(run, features),
            ],
            spawnOptions,
          );
    const notAfter = Date.now();
    child.unref();
    // The browser process as spawned, inside the spawn's time window; the main process is found by its profile.
    const spawned =
      child.pid === undefined
        ? []
        : snapshot(child.pid, { notBefore: t0, notAfter });
    const version = /** @type {CdpVersion | null} */ (
      await waitFor(() => cdpJson(run, '/json/version'), 60000, 500)
    );
    const proc = await waitFor(
      () => mainProcess(run),
      version ? 10000 : 1000,
      500,
    );
    const owner = portOwner(run.port);

    // Another process took the port after the check: it answers (or holds the port) instead of this profile's browser.
    if (proc && owner !== null && owner !== proc.pid) {
      const attempt = { pid: proc.pid, tree: merge(snapshot(proc), spawned) };
      const { records, result } = stopRun(attempt);
      const stopped = downOutcome(attempt, result);

      if (stopped.code !== 0) {
        // Kept, so a later down finds what this attempt started.
        writeState(run, proc, plan, records);
        refuse(
          `port ${run.port} was taken by PID ${owner} after the check, and stopping this attempt failed: ${stopped.reason}; run down`,
        );
      }

      if (forced !== undefined) {
        refuse(
          `port ${run.port} (--port) was taken by PID ${owner} after the check; --port has no fallback`,
        );
      }

      dropKeeperResult();
      order = order.slice(order.indexOf(plan.slot) + 1);

      if (order.length === 0) {
        refuse(
          `port ${run.port} was taken by PID ${owner} after the check, and none of the ${SLOT_TRIES} slots is left`,
        );
      }

      continue;
    }

    if (!version || !proc) {
      dropKeeperResult();
    }

    if (!version) {
      refuse(
        `${run.name} did not answer on ${run.cdp}/json/version within 60 s`,
      );
    }

    if (!proc) {
      throw new Error(
        `${run.name} answers on ${run.cdp} but no main process uses ${run.dir} after 10 s`,
      );
    }

    const st = writeState(run, proc, plan, spawned);
    const readyMs = Date.now() - t0;

    // Edge restores the last session's tabs; leave the instance on the one blank tab it was started with.
    await sleep(2000);
    const pages = await pageTargets(run);
    const keep = pages.find((t) => t.url === 'about:blank') ?? pages[0];
    const restored = pages.filter((t) => t !== keep);

    for (const t of restored) {
      await fetch(`${run.cdp}/json/close/${t.id}`).catch(() => {});
    }

    /** @type {unknown} */
    let debugPages = null;

    if (run.scheme === 'chrome') {
      debugPages = await inTab(run, ENABLE_DEBUG_PAGES, { url: null });
    }

    const developerMode =
      run.extensionDir === null
        ? null
        : /** @type {string} */ (
            await inTab(run, DEVELOPER_MODE, {
              url: null,
              args: { scheme: run.scheme },
            })
          );
    const loaded =
      keeperResult === null ? null : await loadedExtension(run, keeperResult);

    // A browser without its extension must not stay up: a later `up` would find it running as configured.
    if (loaded !== null && 'error' in loaded) {
      const attempt = { pid: proc.pid, tree: merge(snapshot(proc), spawned) };
      const stopped = downOutcome(attempt, stopRun(attempt).result);

      if (stopped.code === 0) {
        rmSync(statePath(run.name), { force: true });
      }

      refuse(
        `${run.name}: loading ${run.extensionDir} failed: ${loaded.error}; ${stopped.code === 0 ? 'the browser was stopped; fix the extension, then "up" again' : `stopping the browser failed too (${stopped.reason}); run "down ${run.name}"`}`,
      );
    }

    const extension = loaded;

    log(
      'OK',
      `${run.name} launched as PID ${proc.pid} on ${run.cdp} (${version.Browser}), backend ${backend}, ready in ${readyMs} ms${extension ? `, extension ${extension.id}` : ''}${firstUse ? ', new profile' : ''}${plan.slot === inst.slot ? '' : `, slot ${plan.slot} (${plan.ports[0]?.reason})`}${restored.length ? `; closed ${restored.length} restored tab(s)` : ''}${debugPages ? `; internal debugging pages ${debugPages}` : ''}${developerMode ? `; developer mode ${developerMode}` : ''}`,
    );

    return {
      ok: true,
      session: st.session,
      evidenceDir,
      backend,
      firstUse,
      pinRestored,
      readyMs,
      extension,
      developerMode,
      browserVersion: version.Browser,
      closedRestoredTabs: restored.map((t) => t.url),
      debugPages,
      state: st,
      tabs: await pageTabs(run),
    };
  }
}

/**
 * `--extension=<dir>`: an unpacked extension folder (relative to the current directory) to load instead of the
 * registry's, such as a worktree's own build.
 * @param {string} value
 * @returns {string}
 */
function extensionFlag(value) {
  // Chromium upper-cases the drive letter before it hashes the path into the id (crx_file id_util MaybeNormalizePath).
  const dir = resolve(value).replace(/^[a-z]:/, (d) => d.toUpperCase());

  return existsSync(join(dir, 'manifest.json'))
    ? dir
    : refuse(`--extension: ${dir} holds no manifest.json`);
}

/**
 * The instance's unpacked extension after a launch: pipe-keeper.mjs's Extensions.loadUnpacked answer, or why it
 * failed. The result file is removed once read.
 * @param {Inst} run
 * @param {string} file  the keeper's result file
 * @returns {Promise<{ dir: string, id: string } | { error: string }>}
 */
async function loadedExtension(run, file) {
  /** @type {{ ok: boolean, id?: string, error?: string } | undefined} */
  const r = await waitFor(
    async () =>
      existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : undefined,
    30000,
    250,
  );

  rmSync(file, { force: true });

  if (!r?.ok || !r.id) {
    return { error: r?.error ?? 'pipe-keeper.mjs wrote no result in 30 s' };
  }

  return { dir: String(run.extensionDir), id: r.id };
}

/**
 * Whether the browser serves the unpacked extension `up` loaded (state `extensionDir`, else the primary checkout's):
 * its manifest.json, opened by the id the folder gets, names the folder's extension and version.
 * @param {Inst} inst
 * @param {string} dir
 * @returns {Promise<[boolean, unknown]>}
 */
async function extensionCheck(inst, dir) {
  const id = extensionId(dir);
  /** @type {{ name?: string, version?: string }} */
  const want = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
  const text = await inTab(
    inst,
    'async (p) => p.evaluate(() => document.body.innerText)',
    { url: `chrome-extension://${id}/manifest.json`, purpose: 'extension' },
  ).catch(
    (/** @type {unknown} */ e) =>
      `error: ${e instanceof Error ? e.message : String(e)}`,
  );
  /** @type {{ name?: string, version?: string } | null} */
  let got = null;

  try {
    got = JSON.parse(String(text));
  } catch {
    got = null;
  }

  const pass = got?.name === want.name && got?.version === want.version;

  return [
    pass,
    pass
      ? `${want.name} ${want.version} loaded as ${id} from ${dir}`
      : {
          id,
          dir,
          expected: { name: want.name, version: want.version },
          got: got ?? String(text).slice(0, 200),
          fix: `"down ${inst.name}", then "up ${inst.name} [--extension=<dir>]" loads the extension again and turns on developer mode, without which Edge Dev 157 disables it (net::ERR_BLOCKED_BY_CLIENT)`,
        },
  ];
}

/**
 * `panel <name> --url=<app>`: the extension's first feature end to end (scripts/panel.mjs): the N1 panel's "Explain
 * version with AI" answers through the Prompt API of the instance's model.
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdPanel(inst) {
  const url =
    typeof opts['url'] === 'string'
      ? opts['url']
      : refuse(
          'usage: panel <name> --url=<an Angular app page, e.g. the counter fixture of control-angular-dev-app>',
        );

  if (inst.extensionDir === null) {
    refuse(`${inst.name} has no "extension" in instances.json`);
  }

  const r = await drivePanel(inst.cdp, url, {
    answerTimeoutMs:
      positiveFlag('timeout-min', opts['timeout-min'], 4) * 60000,
    feature: typeof opts['feature'] === 'string' ? opts['feature'] : undefined,
  });
  log(
    r.ok ? 'OK' : 'ERROR',
    r.ok
      ? `${inst.name} panel answered in ${r.answerMs} ms (Angular ${r.ngVersion}, extension ${r.extensionId}): ${printable(String(r.answer).slice(0, 160))}`
      : `${inst.name} panel: ${printable(String(r.error))}`,
  );

  return { ...r, model: inst.model.name };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdAttach(inst) {
  const proc =
    mainProcess(inst) ??
    refuse(`${inst.name} is not running; run "up ${inst.name}"`);
  const st = writeState(
    at(inst, parseCommandLine(proc.commandLine).port),
    proc,
  );
  await ensureAttached(inst);
  attachedHere = null;
  log(
    'OK',
    `${inst.session} attached to ${inst.name} PID ${proc.pid}; it stays attached for ad hoc playwright-cli commands until "detach ${inst.name}" or "down ${inst.name}"`,
  );

  return { ok: true, state: st };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdDetach(inst) {
  pw(inst, ['detach']);
  log('OK', `${inst.session} detached; ${inst.name} left running`);

  return { ok: true };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdDown(inst) {
  const st =
    readState(inst.name) ??
    refuse(
      `no state file at ${statePath(inst.name)}; run "attach ${inst.name}" or "up ${inst.name}" first`,
    );
  const root = rootOf(st);
  const live = processTable().find((r) => r.pid === st.pid);

  // The browser is gone, or its PID now belongs to another process: no Browser.close; stop what it left.
  if (live === undefined || root === undefined || !matches(root, live)) {
    const { records, result } = stopRun(st);
    const outcome = downOutcome(st, result);

    if (outcome.code !== 0) {
      writeFileSync(
        statePath(inst.name),
        JSON.stringify({ ...st, tree: records }, null, 2),
      );

      return {
        ok: false,
        couldNotRun: true,
        reason: outcome.reason,
        notes: outcome.notes,
        pid: st.pid,
      };
    }

    rmSync(statePath(inst.name), { force: true });
    log('OK', `PID ${st.pid} is not running any more; removed the state file`);

    return {
      ok: true,
      alreadyStopped: true,
      pid: st.pid,
      notes: outcome.notes,
    };
  }

  if (portOwner(inst.port) !== st.pid) {
    refuse(
      `port ${inst.port} is not owned by PID ${st.pid}; not sending Browser.close to it`,
    );
  }

  // down does not wait for a model download; it says what closing interrupts or leaves behind.
  /** @type {ReturnType<typeof assetVerdict> | null} */
  let model = null;

  try {
    // A hung tab must not hold down for the 15-minute run-code default.
    model = verdictOf(inst, await brokerState(inst, 90000));

    if (model.verdict === 'in-flight' || model.verdict === 'mismatch') {
      log(
        'WARN',
        `${inst.name} model ${model.verdict}: ${model.detail}; closing anyway${inst.pin && readPin(inst) ? `; the next "up ${inst.name}" restores the pin` : model.verdict === 'mismatch' || inst.pin ? `; ${pinHint(inst)}` : ''}`,
      );
    }
  } catch (e) {
    log(
      'WARN',
      `could not read Broker State before closing: ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  // The last snapshot, while the main process still lives; kept in the state before Browser.close.
  st.tree = merge(st.tree ?? [], snapshot(root));
  writeFileSync(statePath(inst.name), JSON.stringify(st, null, 2));
  pw(inst, ['detach']);
  attachedHere = null;
  const version =
    /** @type {CdpVersion | null} */ (await cdpJson(inst, '/json/version')) ??
    refuse(`${inst.cdp} does not answer`);
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r, j) => {
    ws.addEventListener('open', r);
    ws.addEventListener('error', j);
  });
  ws.send(JSON.stringify({ id: 1, method: 'Browser.close' }));
  // Browser.close lets the browser end on its own and write its profile; stop then takes whatever outlived it.
  await waitFor(() => !anyAlive(st.tree ?? []), 60000, 1000);

  // Exiting while the socket is still closing trips a libuv assertion on Windows.
  if (ws.readyState !== WebSocket.CLOSED) {
    await new Promise((r) => {
      ws.addEventListener('close', r);
      ws.close();
    });
  }

  const { records, result } = stopRun(st);
  const outcome = downOutcome(st, result);

  if (outcome.code !== 0) {
    writeFileSync(
      statePath(inst.name),
      JSON.stringify({ ...st, tree: records }, null, 2),
    );

    return {
      ok: false,
      couldNotRun: true,
      reason: outcome.reason,
      notes: outcome.notes,
      pid: st.pid,
    };
  }

  rmSync(statePath(inst.name), { force: true });
  const portFree = !(await busyPorts([inst.port])).has(inst.port);
  log(
    portFree ? 'OK' : 'ERROR',
    `${inst.name} PID ${st.pid} closed over CDP; no process uses ${inst.dir}; port ${inst.port} ${portFree ? 'free' : 'still owned'}; state file removed`,
  );

  return { ok: portFree, pid: st.pid, portFree, model, notes: outcome.notes };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdFlags(inst) {
  const proc = mainProcess(inst) ?? refuse(`${inst.name} is not running`);
  const page = parseCommandLine(
    /** @type {string | null} */ (
      await inTab(inst, VERSION_CMDLINE, {
        url: null,
        args: { scheme: inst.scheme },
      })
    ),
  );
  const d = drift(inst, proc);
  const want = d.backend ? featuresFor(inst, d.backend) : inst.features;
  const missing = want.filter((f) => !page.features.includes(f));
  const extra = page.features.filter((f) => !want.includes(f));
  const ok =
    d.problems.length === 0 && missing.length === 0 && extra.length === 0;
  log(
    ok ? 'OK' : 'ERROR',
    `${inst.scheme}://version features (${d.backend ?? 'no matching'} backend): ${page.features.join(', ')}${missing.length ? `; missing ${missing.join(', ')}` : ''}${extra.length ? `; not in registry ${extra.join(', ')}` : ''}${d.problems.length ? `; drift: ${d.problems.join('; ')}` : ''}`,
  );

  return {
    ok,
    backend: d.backend,
    effective: page.features,
    registry: want,
    missing,
    extra,
    drift: d.problems,
  };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdDoctor(inst) {
  /** @type {Check[]} */
  const checks = [];
  /** @type {(id: string, pass: boolean | null, detail: unknown, warn?: boolean) => void} */
  const add = (id, pass, detail, warn = false) => {
    checks.push({ id, pass, warn, detail });
    log(
      checkMarker(pass, warn),
      `${id}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`,
    );
  };

  const fresh = mapFresh(SKILL_DIR);
  add('map-fresh', true, fresh.detail, fresh.status === 'warn');

  const proc = mainProcess(inst);
  add(
    'process',
    !!proc,
    proc
      ? `PID ${proc.pid} ${programOf(proc.commandLine)} --user-data-dir=${inst.dir}`
      : `no process uses ${inst.dir}`,
  );

  if (!proc) {
    return { ok: false, couldNotRun: true, checks };
  }

  const rows = processTable();
  const byPid = new Map(rows.map((r) => [r.pid, r]));
  const live = snapshot(proc, { table: () => rows });
  const st = readState(inst.name);
  const root = st === null ? undefined : rootOf(st);

  // Written only for a state file of this same browser process, and only when the record changed. A standing
  // instance runs for days: records that exited are dropped (a PID with its start time never runs again).
  if (st !== null && root !== undefined && matches(root, proc)) {
    const recorded = merge(st.tree ?? [], live).filter((r) =>
      matches(r, byPid.get(r.pid)),
    );

    if (JSON.stringify(recorded) !== JSON.stringify(st.tree ?? [])) {
      writeFileSync(
        statePath(inst.name),
        JSON.stringify({ ...st, tree: recorded }, null, 2),
      );
    }

    add('tree', true, `${recorded.length} process(es) recorded for down`);
  } else {
    add(
      'tree',
      null,
      st === null
        ? 'no state file: nothing recorded for down (run attach or up)'
        : `the state file records PID ${st.pid}, not this browser process; not changed`,
    );
  }

  const d = drift(inst, proc);
  add(
    'commandLine',
    d.problems.length === 0,
    d.problems.length
      ? { drift: d.problems }
      : `matches the registry, backend ${d.backend}`,
  );

  const version = /** @type {CdpVersion | null} */ (
    await cdpJson(inst, '/json/version')
  );
  const recordedPorts = readState(inst.name)?.ports ?? [
    { name: 'cdp', port: inst.port, kind: /** @type {PortKind} */ ('derived') },
  ];
  const ports = portsCheck(
    recordedPorts,
    await busyPorts(recordedPorts.map((p) => p.port)),
    new Set(live.map((r) => r.pid)),
  );
  add(
    'ports',
    ports.status === 'pass' &&
      !!version &&
      new RegExp(inst.product).test(version.Browser),
    `${ports.detail}; ${inst.cdp} answers as ${version?.Browser ?? 'nothing'}`,
  );

  const tabs = await pageTabs(inst);
  add('tabs', true, { count: tabs.length, urls: tabs }, tabs.length > 1);

  const account = profileAccount(inst);
  add(
    'account',
    account.accounts === 0 && !account.syncSetup,
    account.accounts === 0 && !account.syncSetup
      ? 'no signed-in account, sync not set up'
      : {
          ...account,
          fix: `down, delete ${inst.dir}, then up: an instance profile must never hold an account`,
        },
  );

  if (inst.extensionDir !== null) {
    add('extension', ...(await extensionCheck(inst, inst.extensionDir)));
  }

  const disk = diskModels(inst);
  const hit = disk.find((x) => x.name === inst.model.name);
  add(
    'model.disk',
    !!hit,
    hit
      ? `${hit.name} ${hit.modelVersion} (${hit.mib} MiB) at ${hit.dir}`
      : { expected: inst.model.name, found: disk.map((x) => x.name) },
  );
  const others = disk.filter((x) => x.name !== inst.model.name);

  if (others.length) {
    /** @type {Check} */ (checks.at(-1)).warn = true;
    log(
      'WARN',
      `model.disk: other models in this profile: ${others.map((x) => `${x.name} ${x.componentVersion} ${x.mib} MiB`).join(', ')}`,
    );
  }

  if (inst.pin) {
    const pin = readPin(inst);
    if (pin === null) {
      add(
        'model.pin',
        true,
        `no pin: run "model pin ${inst.name}" once doctor passes, so up can restore ${inst.pin.join(' and ')}`,
        true,
      );
    } else {
      const plan = planFor(inst, pin);
      const same = plan.remove.length === 0 && plan.add.length === 0;
      const unpinned = unpinnedRoots(inst, pin);
      const lacks =
        unpinned.length > 0
          ? `; the pin lacks ${unpinned.join(', ')}: run "model pin ${inst.name}" again`
          : '';
      add(
        'model.pin',
        same,
        same
          ? `matches the pin of ${pin.at}: ${Object.entries(pin.roots)
              .map(([r, v]) => `${r} ${v}`)
              .join(', ')}${lacks}`
          : `the disk differs from the pin of ${pin.at} (${describePlan(plan)}); ${pinHint(inst)}${lacks}`,
        unpinned.length > 0,
      );
    }
  }

  const broker = await brokerState(inst);
  /** @param {Broker | BrokerDisabled} b */
  const brokerChecks = (b) => {
    if (b.disabled) {
      add('model.broker', false, b.error);

      return;
    }

    const asset =
      b.assets.find(
        (a) => new RegExp(inst.model.asset).test(a.name) && a.state === 'Ready',
      ) ?? b.assets.find((a) => new RegExp(inst.model.asset).test(a.name));
    const v = verdictOf(inst, b, disk);
    add(
      'model.broker',
      asset?.state === 'Ready' &&
        b.useCases[inst.model.useCase] === 'Available',
      {
        asset: asset ?? `${inst.model.asset} absent`,
        useCase: inst.model.useCase,
        state: b.useCases[inst.model.useCase] ?? null,
        manifestLoaded: b.manifestLoaded,
        ...(v.verdict === 'in-flight' || v.verdict === 'mismatch'
          ? {
              [v.verdict]: v.detail,
              fix:
                v.verdict === 'mismatch'
                  ? pinHint(inst)
                  : 'wait for the update to finish, then run doctor again',
            }
          : {}),
      },
    );
    const be = servingBackend(inst, b, disk);
    add('backend', be.kind === d.backend, {
      requested: d.backend,
      broker: be.backendType ?? 'no model row with weights in the model folder',
      row: be.row,
    });
    add('performanceClass', true, {
      localState: perfClass(inst),
      broker: b.perfClass,
    });
  };
  // Right after a launch Broker State has not loaded the model manifest yet (measured: the asset absent and
  // manifestLoaded false, then Ready once a page had used the model); read it again after the page checks.
  const brokerLater = brokerPending(broker);

  if (!brokerLater) {
    brokerChecks(broker);
  }

  const free = freeSpace(inst);
  add(
    'disk.free',
    true,
    `${free.mib} MiB free on ${free.volume}, browser minimum ${free.minMib} MiB (Broker State: ${broker.diskInstall ?? '?'})`,
    free.mib < free.minMib,
  );

  const avail = /** @type {Availability} */ (
    await inTab(inst, AVAILABILITY, { purpose: 'availability' })
  );
  add('api.availability', avail.LanguageModel === 'available', avail);

  // create() on a model that is not available waits for (and can start) a download; doctor stays read-only.
  if (avail.LanguageModel !== 'available') {
    for (const id of [
      'model.contextWindow',
      'canary.structured',
      'canary.tools',
      'canary.webmcp',
    ]) {
      add(
        id,
        null,
        `skipped: LanguageModel is ${avail.LanguageModel}; ${switchesOf(inst).includes('--disable-component-update') ? requestHint(inst) : `run "model download ${inst.name}"`}`,
      );
    }

    if (brokerLater) {
      brokerChecks(await brokerState(inst));
    }

    return { ok: false, backend: d.backend, checks };
  }

  const canary = /** @type {Canary} */ (
    await inTab(inst, CANARY, {
      purpose: 'canary',
      args: { toolCanary: inst.model.toolCanary },
    })
  );
  add(
    'model.contextWindow',
    canary.contextWindow === inst.model.contextWindow,
    `contextWindow ${canary.contextWindow}, expected ${inst.model.contextWindow}`,
  );
  add('canary.structured', canary.structured?.pass === true, canary.structured);
  // "report": the model's native tool calling is too unreliable to gate health on (Phi-4-mini); the result is kept.
  add(
    'canary.tools',
    toolsPass(inst.model.toolCanary, canary.tools),
    inst.model.toolCanary === 'report'
      ? { reportedOnly: true, ...canary.tools }
      : canary.tools,
  );
  add('canary.webmcp', canary.webmcp?.pass === true, canary.webmcp);

  if (brokerLater) {
    brokerChecks(await brokerState(inst));
  }

  return { ok: doctorOk(checks), backend: d.backend, checks };
}

/**
 * @param {Inst} inst
 * @param {string | undefined} sub
 * @returns {Promise<Result>}
 */
async function cmdModel(inst, sub) {
  if (sub === 'info') {
    const info = await modelInfo(inst);

    for (const x of info.disk) {
      log(
        'INFO',
        `disk: ${x.name} ${x.modelVersion} component ${x.componentVersion} hints ${JSON.stringify(x.performanceHints)} ${x.mib} MiB ${x.dir}`,
      );
    }

    if (info.broker && !info.broker.disabled) {
      for (const a of info.broker.assets.filter(
        (a) => a.state !== 'Not Installed',
      )) {
        log(
          'INFO',
          `broker asset: ${a.name} ${a.version} ${a.state} ${a.progress}%`,
        );
      }

      log(
        'INFO',
        `serving ${info.serving ?? 'none'}; backend ${info.backend?.backendType ?? '?'} (requested ${info.requestedBackend}); performance class ${info.performanceClass} (Broker State ${info.broker.perfClass})`,
      );
    } else {
      log(
        'INFO',
        info.broker?.disabled
          ? info.broker.error
          : `${inst.name} is stopped; disk only. performance class ${info.performanceClass}`,
      );
    }

    return { ok: true, ...info };
  }

  if (sub === 'init') {
    mainProcess(inst) ?? refuse(`${inst.name} is not running`);
    const r = /** @type {InitRun} */ (
      await inTab(inst, INIT, { purpose: 'init' })
    );
    log(
      'OK',
      `first create ${r.firstCreateMs} ms, second create ${r.secondCreateMs} ms, contextWindow ${r.contextWindow}, prompt ${r.promptMs} ms: ${String(r.answer).slice(0, 80)}`,
    );

    return { ok: true, ...r };
  }

  if (sub === 'download') {
    return modelDownload(inst);
  }

  if (sub === 'clear') {
    return modelClear(inst);
  }

  if (sub === 'pin') {
    return modelPin(inst);
  }

  return refuse(
    'usage: model info|init|download|clear|pin <instance> [--confirm=<model name>]',
  );
}

/**
 * Copies the instance's pinned component roots to its pin folder, from a running instance whose Broker State asset
 * is Ready and whose LanguageModel is available; `up` restores that copy when the disk differs from it.
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function modelPin(inst) {
  const roots =
    inst.pin ?? refuse(`${inst.name} has no "pin" roots in instances.json`);
  const proc =
    mainProcess(inst) ??
    refuse(
      `${inst.name} is not running; pin a running instance that doctor passes`,
    );
  const d = drift(inst, proc);

  // The registry's switches keep the component updater off while the folders are copied.
  if (d.problems.length > 0) {
    refuse(
      `${inst.name} does not run with its registry command line (${d.problems.join('; ')}); run "down ${inst.name}" and "up ${inst.name}" first`,
    );
  }

  /** @param {string} when */
  const healthy = async (when) => {
    const v = verdictOf(inst, await brokerState(inst));
    const avail = /** @type {Availability} */ (
      await inTab(inst, AVAILABILITY, { purpose: 'availability' })
    );

    return v.verdict === 'ready' && avail.LanguageModel === 'available'
      ? null
      : `not pinning: ${when}, Broker State ${v.detail}, LanguageModel ${avail.LanguageModel}`;
  };
  const before = await healthy('before the copy');

  if (before !== null) {
    log('ERROR', before);

    return { ok: false, reason: before };
  }

  const profileReal = realpathSync.native(inst.dir);
  refuseLinked(inst.dir, '', 'pinning from it');
  const disk = pinRootsOnDisk(inst);
  /** @type {Record<string, string>} */
  const versions = {};
  /** @type {Pin['files']} */
  const files = {};

  for (const r of roots) {
    const have = disk[r] ?? [];

    if (have.length !== 1) {
      log(
        'ERROR',
        `not pinning: ${r} holds ${have.join(', ') || 'no version'}; a pin takes exactly one`,
      );

      return {
        ok: false,
        reason: `${r} holds ${have.join(', ') || 'no version'}; a pin takes exactly one`,
        disk,
      };
    }

    const version = /** @type {string} */ (have[0]);
    refuseLinked(join(inst.dir, r), profileReal, 'pinning from it');
    refuseLinked(join(inst.dir, r, version), profileReal, 'pinning from it');
    const list = listing(join(inst.dir, r, version));

    if (list.links.length > 0) {
      refuse(
        `${join(inst.dir, r, version)} holds a link (${list.links.join(', ')}); not pinning a folder with links`,
      );
    }

    versions[r] = version;
    files[r] = list.files;
  }

  mkdirSync(join(TMP, 'pins'), { recursive: true });
  refuseLinked(join(TMP, 'pins'), '', 'writing a pin into it');
  const dir = pinFolderOf(inst.name);
  const next = `${dir}.new`;
  rmSync(next, { recursive: true, force: true });

  for (const [r, version] of Object.entries(versions)) {
    cpSync(join(inst.dir, r, version), join(next, r, version), {
      recursive: true,
    });
  }

  // The copy must match what was listed, the profile must not have moved meanwhile, and the model must still be Ready.
  const moved = roots.flatMap((r) => {
    const now = versionFolders(join(inst.dir, r));
    const v = /** @type {string} */ (versions[r]);
    const changed =
      now.length !== 1 || now[0] !== v
        ? [`${r} now holds ${now.join(', ') || 'no version'}`]
        : listingDiff(files[r] ?? {}, listing(join(inst.dir, r, v))).map(
            (x) => `${r}\\${v}: ${x}`,
          );

    return [
      ...changed,
      ...listingDiff(files[r] ?? {}, listing(join(next, r, v))).map(
        (x) => `copy of ${r}\\${v}: ${x}`,
      ),
    ];
  });
  const after = await healthy('after the copy');

  if (moved.length > 0 || after !== null) {
    rmSync(next, { recursive: true, force: true });
    const reason =
      after ??
      `not pinning: the folders changed during the copy (${moved.slice(0, 3).join('; ')})`;
    log('ERROR', reason);

    return { ok: false, reason };
  }

  /** @type {Pin} */
  const pin = {
    instance: inst.name,
    at: new Date().toISOString(),
    roots: versions,
    files,
  };
  writeFileSync(join(next, 'pin.json'), JSON.stringify(pin, null, 2));
  // The old pin stays until the new one is in place, so a failed rename still leaves one whole pin.
  const old = `${dir}.old`;
  rmSync(old, { recursive: true, force: true });

  if (existsSync(dir)) {
    renameSync(dir, old);
  }

  try {
    renameSync(next, dir);
  } catch (e) {
    if (existsSync(old)) {
      renameSync(old, dir);
    }

    throw e;
  }

  rmSync(old, { recursive: true, force: true });
  log(
    'OK',
    `pinned ${Object.entries(versions)
      .map(([r, ver]) => `${r} ${ver}`)
      .join(', ')} in ${dir}`,
  );

  return { ok: true, pin, dir };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function modelDownload(inst) {
  const budget = downloadTimeouts(opts['timeout-min']);

  if (switchesOf(inst).includes('--disable-component-update')) {
    refuse(
      `${inst.name} runs with --disable-component-update, so Check for update starts no download (measured); its model comes back from the pin: ${requestHint(inst)}`,
    );
  }

  mainProcess(inst) ?? refuse(`${inst.name} is not running`);
  const before = /** @type {Availability} */ (
    await inTab(inst, AVAILABILITY, { purpose: 'availability' })
  );
  const diskBefore = diskModels(inst);

  if (before.LanguageModel === 'available') {
    log('OK', 'LanguageModel already available; nothing to download');

    return { ok: true, alreadyAvailable: true, before };
  }

  if (
    before.LanguageModel !== 'downloadable' &&
    before.LanguageModel !== 'downloading'
  ) {
    return {
      ok: false,
      reason: `LanguageModel.availability() is ${before.LanguageModel}`,
      before,
    };
  }

  const roomless = downloadRefusal(freeSpace(inst), inst.model);

  if (roomless !== null) {
    refuse(roomless);
  }

  const broker = await brokerState(inst);

  if (broker.diskInstall?.startsWith('false')) {
    return {
      ok: false,
      reason: `Broker State: not enough disk space to install: ${broker.diskInstall}`,
      before,
      broker,
    };
  }

  /** @type {EdgeComponent[] | null} */
  let components = null;

  if (inst.modelComponents) {
    components = /** @type {EdgeComponent[]} */ (
      await inTab(inst, EDGE_COMPONENTS, {
        url: null,
        args: { names: inst.modelComponents },
      })
    );
    log(
      'INFO',
      `edge://components: pressed Check for update on ${components.map((c) => `${c.name} (${c.status})`).join(', ')}`,
    );
  }

  // create() needs a trusted user gesture; pointer clicks can time out in an instance, Enter on a focused button still counts.
  const START = `async (p) => {
    await p.evaluate(() => {
      window.__dl = { progress: [], state: 'idle' };
      const btn = document.createElement('button');
      btn.id = 'ai-browsers-download';
      btn.textContent = 'Download model';
      btn.onclick = async () => {
        window.__dl.state = 'creating';
        window.__dl.clickAt = Date.now();
        try {
          const s = await LanguageModel.create({ monitor(m) { m.addEventListener('downloadprogress', (e) => window.__dl.progress.push({ t: Date.now(), pct: Math.round(e.loaded * 1000) / 10 })); } });
          window.__dl.state = 'ready';
          window.__dl.readyAt = Date.now();
          window.__dl.contextWindow = s.contextWindow;
          s.destroy();
        } catch (e) {
          window.__dl.state = 'ERR ' + e.name + ': ' + e.message;
        }
      };
      document.body.append(btn);
    });
    let gesture = 'click';
    await p.click('#ai-browsers-download', { timeout: 5000 }).catch(async () => { gesture = 'Enter'; await p.focus('#ai-browsers-download'); await p.keyboard.press('Enter'); });
    await p.waitForFunction(() => window.__dl.state !== 'idle', null, { timeout: 10000 }).catch(() => {});
    const timeoutMs = ${budget.pageMs};
    const end = Date.now() + timeoutMs;
    const samples = [];
    while (Date.now() < end) {
      await p.waitForTimeout(5000);
      const s = await p.evaluate(async () => ({ state: window.__dl.state, pct: window.__dl.progress.at(-1)?.pct ?? null, availability: await LanguageModel.availability() }));
      samples.push({ t: Date.now(), ...s });
      if (s.state === 'ready' || s.state.startsWith('ERR') || s.state === 'idle') break;
    }
    return { gesture, ...(await p.evaluate(() => ({ ...window.__dl, progress: undefined, samples: window.__dl.progress.length }))), polls: samples.filter((s, i) => i % 12 === 0 || i === samples.length - 1) };
  }`;
  const t0 = Date.now();
  const run = /** @type {DownloadRun} */ (
    await inTab(inst, START, { purpose: 'download' }, budget.clientMs)
  );
  const after = await waitFor(
    async () => {
      const a = /** @type {Availability} */ (
        await inTab(inst, AVAILABILITY, { purpose: 'availability' })
      );

      return a.LanguageModel === 'available' ? a : null;
    },
    120000,
    5000,
  );
  const diskAfter = diskModels(inst);
  const added = diskAfter.filter(
    (x) => !diskBefore.some((y) => y.dir === x.dir && y.bytes === x.bytes),
  );
  const durationMs =
    run.readyAt && run.clickAt ? run.readyAt - run.clickAt : null;
  const ok = run.state === 'ready' && !!after;
  log(
    ok ? 'OK' : 'ERROR',
    `download ${run.state} (gesture ${run.gesture}) in ${durationMs ?? Date.now() - t0} ms; new on disk: ${added.map((x) => `${x.name} ${x.componentVersion} ${x.mib} MiB`).join(', ') || 'none'}`,
  );

  return {
    ok,
    state: run.state,
    gesture: run.gesture,
    durationMs,
    contextWindow: run.contextWindow,
    progressEvents: run.samples,
    polls: run.polls,
    components,
    added,
    diskBefore,
    diskAfter,
    availabilityAfter: after,
  };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function modelClear(inst) {
  const confirm = opts['confirm'];

  if (typeof confirm !== 'string') {
    return refuse(
      'model clear needs --confirm=<model name from its manifest.json>, e.g. --confirm=v3Nano',
    );
  }

  if (instanceProcesses(inst).length) {
    refuse(
      `${inst.name} is running; run "down ${inst.name}" first (files are never deleted under a running browser)`,
    );
  }

  const disk = diskModels(inst);
  const victims = disk.filter((x) => x.name === confirm);

  if (victims.length === 0) {
    refuse(
      `no model named ${confirm} in ${inst.dir}; installed: ${disk.map((x) => x.name).join(', ') || 'none'}`,
    );
  }

  const profileReal = realpathSync.native(inst.dir);
  const linked = reparseRefusal(inst.dir, profileReal);

  // A linked profile folder would make every victim's real path look inside it.
  if (linked !== null) {
    refuse(`${linked}; not deleting anything under it`);
  }

  for (const v of victims) {
    const real = realpathSync.native(v.dir);

    if (!insideProfile(profileReal, real)) {
      refuse(
        `${v.dir} resolves to ${real}, outside the profile ${profileReal}; not deleting it`,
      );
    }
  }

  const freeBefore = freeSpace(inst);

  for (const v of victims) {
    rmSync(v.dir, { recursive: true, force: true });
    log('OK', `deleted ${v.dir} (${v.mib} MiB)`);
  }

  const freeAfter = freeSpace(inst);
  log(
    'INFO',
    `removed ${victims.reduce((s, v) => s + v.bytes, 0)} bytes; free space on ${freeAfter.volume} ${freeBefore.mib} -> ${freeAfter.mib} MiB (ReFS can report freed space late, and other downloads write meanwhile)`,
  );

  return {
    ok: victims.every((v) => !existsSync(v.dir)),
    removed: victims,
    bytesRemoved: victims.reduce((s, v) => s + v.bytes, 0),
    freeBefore,
    freeAfter,
    bytesFreed: freeAfter.bytes - freeBefore.bytes,
    diskAfter: diskModels(inst),
  };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdRun(inst) {
  const file = pos[2];

  if (!file || !existsSync(file)) {
    return refuse(
      'usage: run <instance> <script.js> (a file holding "async page => {...}"; it runs in a new tab that is closed afterwards)',
    );
  }

  mainProcess(inst) ?? refuse(`${inst.name} is not running`);
  const body = readFileSync(file, 'utf8').trim().replace(/;\s*$/, '');

  return {
    ok: true,
    result: await inTab(inst, body, { url: null, purpose: 'run' }),
  };
}

/**
 * @typedef {object} BenchRecord
 * @property {string} instance
 * @property {string | null | undefined} model
 * @property {string | null} backend
 * @property {Backend | null | undefined} requestedBackend
 * @property {unknown} performanceClass
 * @property {ReturnType<typeof cpuLoad>} cpuBefore
 * @property {ReturnType<typeof cpuLoad>} [cpuAfter]
 * @property {unknown} [result]
 * @property {string} [error]
 * @property {number} [ms]
 */

/** @returns {Promise<Result>} */
async function cmdBench() {
  if (IS_WORKTREE) {
    refuse(
      "bench runs from the main checkout only: bench.js hard-codes the counter fixture on http://localhost:4222, which in a worktree is not this checkout's app",
    );
  }

  const names = pos.slice(1).length
    ? pos.slice(1)
    : Object.keys(REGISTRY.instances);
  const bench = join(ROOT, 'spikes', 'probes', 'bench.js');
  const fixture = await fetch('http://localhost:4222/', {
    signal: AbortSignal.timeout(3000),
  }).then(
    (r) => r.ok,
    () => false,
  );

  if (!fixture) {
    refuse(
      'bench needs the counter fixture on http://localhost:4222 (bench.js hard-codes it); start it with control-angular-dev-app',
    );
  }

  /** @type {BenchRecord[]} */
  const results = [];

  for (const name of names) {
    const inst = located(instance(name));
    mainProcess(inst) ?? refuse(`${name} is not running`);
    const info = await modelInfo(inst);
    /** @type {BenchRecord} */
    const record = {
      instance: name,
      model: info.serving,
      backend: info.backend?.backendType ?? null,
      requestedBackend: info.requestedBackend,
      performanceClass: info.performanceClass,
      cpuBefore: cpuLoad(),
    };
    const t0 = Date.now();

    try {
      record.result = await inTab(
        inst,
        readFileSync(bench, 'utf8').trim().replace(/;\s*$/, ''),
        { url: null, purpose: 'bench' },
      );
    } catch (e) {
      record.error = e instanceof Error ? e.message : String(e);
    }

    record.ms = Date.now() - t0;
    const cpuAfter = cpuLoad();
    record.cpuAfter = cpuAfter;
    results.push(record);
    log(
      record.error ? 'ERROR' : 'OK',
      `${name}: ${record.model} on ${record.backend}, CPU ${record.cpuBefore.loadPercent}% -> ${cpuAfter.loadPercent}%, ${record.ms} ms${record.error ? `: ${record.error}` : ''}`,
    );

    if (attachedHere === inst) {
      pw(inst, ['detach']);
      attachedHere = null;
    }
  }

  return {
    ok: results.every((r) => !r.error),
    results,
    summarize:
      'node spikes/probes/bench-summary.mjs takes bench.js return values; pass each results[i].result',
  };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdInfo(inst) {
  const st = readState(inst.name);
  // The recorded tree goes to the top level, where a teardown check reads it, and only there.
  const { tree, ...rest } = st ?? { tree: undefined };
  const result = {
    ok: true,
    instance: inst.name,
    port: inst.port,
    slot: st?.slot ?? slotFor(inst, inst.port),
    ports: st?.ports ?? [
      { name: 'cdp', port: inst.port, kind: 'derived' },
      BENCH_APP,
    ],
    cdp: inst.cdp,
    session: inst.session,
    profile: inst.dir,
    extensionDir: inst.extensionDir,
    statePath: statePath(inst.name),
    state: st && rest,
    ...(tree === undefined ? {} : { tree }),
    evidenceDir,
  };
  log('INFO', JSON.stringify(result));

  return result;
}

// ---------- main ----------

/**
 * The instance on the port it runs on: the state file's, else the running browser's command line's, else its slot's.
 * @param {Inst} inst
 * @returns {Inst}
 */
function located(inst) {
  const st = readState(inst.name);

  if (st) {
    return {
      ...at(inst, st.port),
      ...(st.extensionDir === undefined
        ? {}
        : { extensionDir: st.extensionDir }),
    };
  }

  const proc = mainProcess(inst);
  const port = proc ? parseCommandLine(proc.commandLine).port : NaN;

  return Number.isInteger(port) ? at(inst, port) : inst;
}

/** @type {Record<string, (i: Inst, sub: string | undefined) => Promise<Result>>} */
const COMMANDS = {
  up: (i) => cmdUp(i),
  attach: (i) => cmdAttach(i),
  detach: (i) => cmdDetach(i),
  doctor: (i) => cmdDoctor(i),
  flags: (i) => cmdFlags(i),
  model: (i, sub) => cmdModel(i, sub),
  run: (i) => cmdRun(i),
  panel: (i) => cmdPanel(i),
  down: (i) => cmdDown(i),
  info: (i) => cmdInfo(i),
};

/** @returns {Promise<Result & { cmd: string, instance?: string }>} */
async function main() {
  const cmd = pos[0];
  positiveFlag('timeout-min', opts['timeout-min'], 15);
  portFlag(opts['port']);

  if (cmd === 'instances' || cmd === 'bench') {
    return {
      cmd,
      at: new Date().toISOString(),
      ...(await (cmd === 'instances' ? cmdInstances() : cmdBench())),
    };
  }

  const run =
    cmd !== undefined && Object.hasOwn(COMMANDS, cmd)
      ? COMMANDS[cmd]
      : undefined;

  if (cmd === undefined || run === undefined) {
    return refuse(
      'usage: control.mjs <instances|up|attach|detach|doctor|flags|model|run|panel|down|bench|info> ... (see SKILL.md, Helpers)',
    );
  }

  const sub = cmd === 'model' ? pos[1] : undefined;
  const name = cmd === 'model' ? pos[2] : pos[1];

  if (cmd === 'model') {
    pos.splice(1, 1);
  }

  const inst = cmd === 'up' ? instance(name) : located(instance(name));

  return {
    cmd: [cmd, sub].filter(Boolean).join(' '),
    instance: inst.name,
    at: new Date().toISOString(),
    ...(await run(inst, sub)),
  };
}

/**
 * @param {{ instance?: string, cmd?: string } & Record<string, unknown>} result
 * @returns {string}
 */
function save(result) {
  mkdirSync(evidenceDir, { recursive: true });
  const file = join(
    evidenceDir,
    `${result.instance ?? 'all'}-${(result.cmd ?? 'error').replace(/[^A-Za-z0-9.]+/g, '-').slice(0, 60)}-${Date.now()}.json`,
  );
  writeFileSync(file, JSON.stringify(result, null, 2));

  return file;
}

// process.exit() while a socket or child handle is still closing trips a libuv assertion on Windows (seen on up).
/** @param {number} code */
function exitWith(code) {
  process.exitCode = code;
  setTimeout(() => process.exit(code), 10000).unref();
}

function finish() {
  if (attachedHere) {
    pw(attachedHere, ['detach']);
  }
}

// import.meta.url is the real path, so compare real paths: run through a link, the CLI still runs.
if (
  process.argv[1] &&
  realpathSync.native(resolve(process.argv[1])) ===
    realpathSync.native(fileURLToPath(import.meta.url))
) {
  main().then(
    (result) => {
      finish();
      const file = save(result);
      const code = exitCode(result);

      if (opts['json']) {
        console.log(JSON.stringify({ ...result, evidence: file, exit: code }));
      } else {
        console.log(
          `[${code === 0 ? 'OK' : 'ERROR'}] exit ${code}; evidence ${file}`,
        );
      }

      exitWith(code);
    },
    (err) => {
      finish();
      const refused = err instanceof Refusal;
      const message = err instanceof Error ? err.message : String(err);
      const result = {
        cmd: pos.join(' '),
        instance: pos.find((p) => Object.hasOwn(REGISTRY.instances, p)),
        ok: false,
        refused,
        reason: message,
      };
      const file = save(result);

      if (opts['json']) {
        console.log(
          JSON.stringify({ ...result, evidence: file, exit: EXIT.REFUSED }),
        );
      } else {
        console.log(
          `${logLine('ERROR', `${refused ? 'refused' : 'could not run'}: ${message}`)}\n[ERROR] exit 2; evidence ${file}`,
        );
      }

      exitWith(EXIT.REFUSED);
    },
  );
}
