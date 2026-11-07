#!/usr/bin/env node
// @ts-check
// Angular DevTools control script. Run with --help for commands.

import { spawn, spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:net';
import { homedir } from 'node:os';
import path, { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapFresh } from './fingerprint.mjs';
import { printable } from './text.mjs';
import {
  describe,
  matches,
  merge,
  processTable,
  snapshot,
  stop,
} from './proctree.mjs';

/** @typedef {'chrome' | 'chrome-beta' | 'edge' | 'edge-dev'} BrandedName */
/** @typedef {'test' | BrandedName} BrowserValue */
/** @typedef {{ exe: string, userData: string, scheme: 'chrome' | 'edge' }} Browser */

/** @typedef {{ browser?: BrowserValue, from?: string, profile?: string, timeout?: string, 'app-url'?: string, port?: string, component?: string, click?: string, file?: string, json?: true, 'di-graph'?: true }} Opts */

/** @typedef {{ cmd: string | undefined, opts: Opts, pos: string[] }} Parsed */
/** @typedef {import('./proctree.mjs').ProcRecord} ProcRecord */
/** @typedef {import('./proctree.mjs').StopResult} StopResult */

/**
 * @typedef {object} State
 * @property {string} flowId
 * @property {string} session
 * @property {number} pid  the playwright-cli session process `open` started
 * @property {ProcRecord[]} [tree]  every process the run was seen to start (proctree.mjs), the session process first
 * @property {number} cdpPort
 * @property {number} [slot]
 * @property {PortEntry[]} [ports]
 * @property {string} appUrl
 * @property {string} extensionVersion
 * @property {string} extensionDir
 * @property {string} profile
 * @property {string} [configPath]
 * @property {string} evidenceDir
 * @property {string} startedAt
 * @property {number} [readyInSeconds]
 * @property {number | null} [browserPid]  the Chromium holding the CDP port, a record of `tree`
 */

/** @typedef {{ type: string, url: string, webSocketDebuggerUrl: string }} CdpTarget */
/** @typedef {'derived' | 'fixed' | 'external'} PortKind */
/** @typedef {{ name: string, port: number, kind: PortKind, reason?: string }} PortEntry */
/**
 * A row of the ports table (SKILL.md, "Pick a flow"): a derived port has a value per slot, the first row is the main port.
 * @typedef {{ name: string, kind: 'derived', at: (slot: number) => number } | { name: string, kind: 'fixed', port: number, pin: string } | { name: string, kind: 'external', port: number, owner: string }} PortRow
 */
/** @typedef {{ id?: number, result?: { data?: string, result?: { value?: unknown }, exceptionDetails?: { text?: string, exception?: { description?: string } } }, error?: unknown }} CdpResponse */
/** @typedef {{ manifest?: { version?: string }, disable_reasons?: number[], state?: number, from_webstore?: boolean, path?: string }} PrefEntry */
/** @typedef {{ file: string, version: string | null, disableReasons: number[], state: number | null, fromWebstore: boolean | null, path: string | null }} ExtSettings */

/**
 * @typedef {object} BrandedStatus
 * @property {string} browser
 * @property {string} profile
 * @property {string} extensionsDir
 * @property {string[]} versionsOnDisk
 * @property {ExtSettings | null} settings
 * @property {boolean} installed
 * @property {boolean} enabled
 * @property {string} extensionsPage
 */

/** @typedef {{ kind: string | null, text: string[] }} SignalNode */
/** @typedef {{ isAngular?: boolean, isDebugMode?: boolean } & Record<string, unknown>} Detection */

/**
 * What ATTACH_PROBE returns.
 * @typedef {object} AttachFacts
 * @property {boolean} flag
 * @property {number | null} flagSetAt
 * @property {Detection | null} detection
 * @property {boolean} backendInstalled
 * @property {boolean} handshake
 * @property {number | null} backendReady
 * @property {string | null} ngVersion
 * @property {boolean} ngGlobal
 * @property {string[]} topics
 */

/** @typedef {{ a: number, b: number }} Counts */
/** @typedef {{ bothOn: Counts, afterRemoveA: Counts }} ProfilerCounts */
/** @typedef {{ ok: boolean } & Record<string, unknown>} Result */
/** @typedef {{ name: string, ok: boolean, detail: string, status?: 'pass' | 'warn' }} Check */

const EXT_ID = 'ienfalfjdbdpebioblfackkekamfmbnh';
const PANEL_ID = `chrome-extension://${EXT_ID}Angular`;
const STORE_URL = `https://chromewebstore.google.com/detail/${EXT_ID}`;
const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = resolve(SKILL_DIR, '..', '..', '..');
const TMP = join(ROOT, 'tmp', 'control-angular-devtools');
const LOCAL =
  process.env['LOCALAPPDATA'] ?? join(homedir(), 'AppData', 'Local');
const SYSTEM32 = join(process.env['SystemRoot'] ?? 'C:\\Windows', 'System32');
// Windows reads this from the looking process, not the child's env, when Node looks up a bare program name: set,
// the current directory is skipped. The processes this script starts inherit it.
process.env['NoDefaultCurrentDirectoryInExePath'] = '1';

/** @type {Record<BrandedName, Browser>} */
const BROWSERS = {
  chrome: {
    exe: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    userData: join(LOCAL, 'Google', 'Chrome', 'User Data'),
    scheme: 'chrome',
  },
  'chrome-beta': {
    exe: 'C:\\Program Files\\Google\\Chrome Beta\\Application\\chrome.exe',
    userData: join(LOCAL, 'Google', 'Chrome Beta', 'User Data'),
    scheme: 'chrome',
  },
  edge: {
    exe: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    userData: join(LOCAL, 'Microsoft', 'Edge', 'User Data'),
    scheme: 'edge',
  },
  'edge-dev': {
    exe: 'C:\\Program Files (x86)\\Microsoft\\Edge Dev\\Application\\msedge.exe',
    userData: join(LOCAL, 'Microsoft', 'Edge Dev', 'User Data'),
    scheme: 'edge',
  },
};

// ---------- args ----------
const VALUE_FLAGS = [
  'browser',
  'from',
  'profile',
  'timeout',
  'app-url',
  'port',
  'component',
  'click',
  'file',
];
const BOOL_FLAGS = ['json', 'di-graph'];
/** @type {readonly string[]} */
const BROWSER_VALUES = ['test', 'chrome', 'chrome-beta', 'edge', 'edge-dev'];

export class UsageError extends Error {}

/**
 * @param {string} name
 * @returns {name is BrandedName}
 */
export function isBranded(name) {
  return Object.hasOwn(BROWSERS, name);
}

/**
 * Splits the command line into the command, flags and positionals. Throws a UsageError on a bad flag.
 * @param {string[]} argv the arguments after the script path
 * @returns {Parsed}
 */
export function parseArgs(argv) {
  const [cmd, ...rest] = argv;
  /** @type {Record<string, string | true>} */
  const opts = {};
  /** @type {string[]} */
  const pos = [];

  for (let i = 0; i < rest.length; i++) {
    const arg = /** @type {string} */ (rest[i]);
    const m = arg.match(/^--([^=]+)(?:=(.*))?$/s);

    if (!m) {
      pos.push(arg);
      continue;
    }

    const name = /** @type {string} */ (m[1]);
    const inline = m[2];

    if (BOOL_FLAGS.includes(name)) {
      if (inline !== undefined) {
        throw new UsageError(`--${name} takes no value`);
      }

      opts[name] = true;
    } else if (VALUE_FLAGS.includes(name)) {
      const next = rest[i + 1];
      const value =
        inline ??
        (next !== undefined && !next.startsWith('--') ? rest[++i] : undefined);

      if (value === undefined || value === '') {
        throw new UsageError(
          `--${name} needs a value (--${name} <value> or --${name}=<value>)`,
        );
      }

      opts[name] = value;
    } else {
      throw new UsageError(
        `unknown flag --${name}; flags: ${[...VALUE_FLAGS, ...BOOL_FLAGS].map((f) => '--' + f).join(', ')}`,
      );
    }
  }

  const browser = opts['browser'];

  if (typeof browser === 'string' && !BROWSER_VALUES.includes(browser)) {
    throw new UsageError(
      `--browser ${browser} is not one of ${BROWSER_VALUES.join(', ')}`,
    );
  }

  for (const n of ['timeout', 'port']) {
    const v = opts[n];

    if (typeof v === 'string' && !/^\d+$/.test(v)) {
      throw new UsageError(`--${n} must be a whole number, got "${v}"`);
    }
  }

  return { cmd, opts: /** @type {Opts} */ (opts), pos };
}

class Refusal extends Error {}
class Unhealthy extends Error {}

/**
 * @param {string} msg
 * @returns {never}
 */
function refuse(msg) {
  throw new Refusal(msg);
}

/** @type {Opts} */
const opts = {};
/** @type {string[]} */
const pos = [];

/**
 * One human-readable line. Page text (the panel, URLs, signal labels, playwright-cli output) can hold control
 * characters, so they are escaped rather than written to the terminal.
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
  if (!opts.json) {
    console.log(logLine(marker, msg));
  }
}

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Polls `fn` until it returns a truthy value; null after `timeoutMs`.
 * @template T
 * @param {() => T | Promise<T>} fn
 * @param {number} timeoutMs
 * @param {number} [everyMs]
 * @returns {Promise<T | null>}
 */
export async function waitFor(fn, timeoutMs, everyMs = 500) {
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

// ---------- worktree, session, ports ----------

/**
 * Whether `root` is the top of a git worktree: its `.git` exists and is not a folder.
 * @param {string} root
 * @returns {boolean}
 */
export function isWorktreeRoot(root) {
  const g = join(root, '.git');

  return existsSync(g) && !lstatSync(g).isDirectory();
}

/**
 * `main` in a main checkout, else `wt-` and 6 hex digits from a hash of the lower-cased root.
 * @param {string} root
 * @param {boolean} worktree
 * @returns {string}
 */
export function flowIdOf(root, worktree) {
  return worktree
    ? `wt-${createHash('sha1').update(root.toLowerCase()).digest('hex').slice(0, 6)}`
    : 'main';
}

const MAIN_CDP_PORT = 9420;
// Slot 0 is the main checkout's (CDP 9420); a worktree's flow id hashes to one of 1 to SLOTS - 1 (9421-9499).
const SLOTS = 80;
const SLOT_TRIES = 10;

/**
 * The flow's own slot: 0 for main, else 1 to 79 from the worktree's hash, so its port stays the same from run to run.
 * @param {string} flowId
 * @returns {number}
 */
export function slotOfFlow(flowId) {
  return flowId === 'main'
    ? 0
    : 1 + (parseInt(flowId.slice(3), 16) % (SLOTS - 1));
}

/**
 * The slots `up` tries, in order: `first`, then the next ones, 10 in all. From a worktree (`first` above 0) they
 * wrap within 1 to 79 and never reach slot 0.
 * @param {number} first
 * @returns {number[]}
 */
export function slotOrder(first) {
  return Array.from({ length: SLOT_TRIES }, (_, i) =>
    first === 0 ? i : 1 + ((first - 1 + i) % (SLOTS - 1)),
  );
}

/**
 * The ports table rows of a test-harness run: the CDP port per slot, and the app the browser opens.
 * @param {string} appUrl
 * @returns {PortRow[]}
 */
export function portRows(appUrl) {
  return [
    { name: 'cdp', kind: 'derived', at: (slot) => MAIN_CDP_PORT + slot },
    {
      name: 'app',
      kind: 'external',
      port: Number(new URL(appUrl).port || 80),
      owner:
        'control-angular-dev-app (or whatever serves --app-url); this skill never starts or stops it',
    },
  ];
}

const isWorktree = isWorktreeRoot(ROOT);
const flowId = flowIdOf(ROOT, isWorktree);
const SESSION = flowId === 'main' ? 'ngdt' : `ngdt-${flowId}`;
const STATE = join(TMP, 'state', `${flowId}.json`);
const PROFILE = join(TMP, 'profile', flowId);
const EXT_COPY = join(TMP, 'extension');

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
 * The PIDs `netstat` names for the listening ports it reports. Naming only: which table a host exposes is its
 * business, and a host whose netstat reports only the host table names none of them, so this may say nothing. An
 * owner the OS cannot attribute (PID 0, which a restricted sandbox reports for a socket it will not name) is not a
 * name either, so it is dropped: every reader then sees the port held by a process the OS did not name, and never by
 * PID 0, which is no process and so cannot be another browser.
 * @returns {Map<number, number[]>}
 */
function namedHolders() {
  /** @type {Map<number, number[]>} */
  const attributed = new Map();

  for (const [port, pids] of listeners(
    spawnSync(join(SYSTEM32, 'netstat.exe'), ['-ano'], {
      encoding: 'utf8',
      windowsHide: true,
    }).stdout,
  )) {
    const named = pids.filter((pid) => pid !== 0);

    if (named.length > 0) {
      attributed.set(port, named);
    }
  }

  return attributed;
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
 * The PID `netstat` names as the holder of `port`, or null. Naming only: `busyPorts` decides whether the port is
 * held, so a listener the OS does not name is a null here and not a free port.
 * @param {number} port
 * @returns {number | null}
 */
function portOwner(port) {
  return namedHolders().get(port)?.[0] ?? null;
}

// ---------- processes (proctree.mjs) ----------

/**
 * The recorded session process: the `tree` record with its PID, or none when `up` never saw it run.
 * @param {{ pid: number, tree?: ProcRecord[] }} st
 * @returns {ProcRecord | undefined}
 */
export function rootOf(st) {
  return (st.tree ?? []).find((r) => r.pid === st.pid);
}

/**
 * The live tree below the recorded session process now: empty when it is gone or its PID belongs to another process.
 * @param {{ pid: number, tree?: ProcRecord[] }} st
 * @param {() => ProcRecord[]} [table]
 * @returns {ProcRecord[]}
 */
export function liveTree(st, table = processTable) {
  const root = rootOf(st);

  return root === undefined ? [] : snapshot(root, { table });
}

/**
 * Stops every process the run recorded, through proctree.mjs: a last snapshot below the root, merged into the
 * record, then `stop`.
 * @param {{ pid: number, tree?: ProcRecord[] }} st
 * @param {{ table?: () => ProcRecord[], stop?: (records: ProcRecord[]) => StopResult }} [deps]
 * @returns {{ records: ProcRecord[], result: StopResult }}
 */
export function stopRun(
  st,
  { table = processTable, stop: stopRecords = stop } = {},
) {
  const records = merge(st.tree ?? [], liveTree(st, table));

  return { records, result: stopRecords(records) };
}

/**
 * What `down` reports for a stop result. Exit 2 when the root's PID now belongs to another process (that one is never
 * touched) or a record still runs after the last round; any other refusal is only noted.
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
      reason: `refused: the state file records no process tree (written before proctree.mjs); nothing stopped: check PID ${st.pid} by hand, then delete the state file`,
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

// ---------- state ----------

/** @returns {State | null} */
function readState() {
  return existsSync(STATE)
    ? /** @type {State} */ (JSON.parse(readFileSync(STATE, 'utf8')))
    : null;
}

/** @returns {State} */
function requireState() {
  const st = readState();

  if (!st) {
    return refuse(`no state file at ${STATE}; run "up" first`);
  }

  return st;
}

/**
 * Why the live process holding the recorded PID is not the one `up` recorded, or null when it is (proctree.mjs
 * `matches`: same PID, start time and command line).
 * @param {{ pid: number, tree?: ProcRecord[] }} st
 * @param {ProcRecord} live
 * @returns {string | null}
 */
export function identityProblem(st, live) {
  const root = rootOf(st);

  return root !== undefined && matches(root, live)
    ? null
    : `PID ${st.pid} is not the process this run started (${root === undefined ? 'no record of it' : 'start time or command line differ'}); not the browser this run started`;
}

/**
 * @param {State} st
 * @returns {ProcRecord | null} the live process, null when it is gone; refuses when it is another process
 */
function checkIdentity(st) {
  const live = processTable().find((r) => r.pid === st.pid);

  if (!live) {
    return null;
  }

  const problem = identityProblem(st, live);

  if (problem) {
    refuse(problem);
  }

  return live;
}

/**
 * Why CDP commands must not use the state's port: the recorded process is gone, or another PID owns the port.
 * @param {State} st
 * @param {ProcRecord | null} live
 * @param {number | null} owner the PID listening on st.cdpPort
 * @returns {string | null}
 */
export function cdpOwnerProblem(st, live, owner) {
  if (!live) {
    return `PID ${st.pid} not running; run "down", then "up"`;
  }

  if (owner !== st.browserPid) {
    return `CDP port ${st.cdpPort} is owned by PID ${owner}, not the recorded browser PID ${st.browserPid}`;
  }

  return null;
}

/**
 * The state, once its process and CDP port are this run's; refuses otherwise.
 * @returns {State}
 */
function requireOwnedCdp() {
  const st = requireState();
  const problem = cdpOwnerProblem(st, checkIdentity(st), portOwner(st.cdpPort));

  if (problem) {
    refuse(problem);
  }

  return st;
}

/**
 * Why `down` must not delete the state's profile or config: either is not the path this script derives.
 * @param {State} st
 * @param {{ profile: string, configPath: string }} expected
 * @returns {string | null}
 */
export function deleteProblem(st, expected) {
  if (resolve(st.profile) !== resolve(expected.profile)) {
    return `state profile ${st.profile} is not this flow's profile ${expected.profile}; not deleting it`;
  }

  if (
    st.configPath !== undefined &&
    resolve(st.configPath) !== resolve(expected.configPath)
  ) {
    return `state configPath ${st.configPath} is not this flow's config ${expected.configPath}; not deleting it`;
  }

  return null;
}

/**
 * A Chrome extension version: one to four dot-separated numbers.
 * @param {unknown} version
 * @returns {version is string}
 */
export function isExtensionVersion(version) {
  return typeof version === 'string' && /^\d+(\.\d+){0,3}$/.test(version);
}

// ---------- playwright-cli ----------

/**
 * The playwright-cli.js beside the first playwright-cli.cmd shim in an absolute PATH entry, or null.
 * @param {string} pathEnv
 * @returns {string | null}
 */
export function findPlaywrightCli(pathEnv) {
  const shimDir = pathEnv
    .split(path.delimiter)
    .find(
      (d) => path.isAbsolute(d) && existsSync(join(d, 'playwright-cli.cmd')),
    );
  const js =
    shimDir &&
    join(shimDir, 'node_modules', '@playwright', 'cli', 'playwright-cli.js');

  return js && existsSync(js) ? js : null;
}

/**
 * Runs playwright-cli through node, from the npm shim's folder on PATH (absolute PATH entries only).
 * @param {string[]} args
 * @param {{ raw?: boolean }} [options]
 * @returns {{ code: number | null, out: string }}
 */
function pw(args, { raw = false } = {}) {
  const js = findPlaywrightCli(process.env['PATH'] ?? '');

  if (!js) {
    return { code: 127, out: 'playwright-cli not found on PATH' };
  }

  const full = [...(raw ? ['--raw'] : []), `-s=${SESSION}`, ...args];
  const r = spawnSync(process.execPath, [js, ...full], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  return { code: r.status, out: (r.stdout ?? '') + (r.stderr ?? '') };
}

/**
 * The value a run-code wrapper printed: its JSON, unwrapped once more when that JSON is itself a string.
 * @param {string} out
 * @returns {unknown}
 */
export function parseRunCode(out) {
  const v = JSON.parse(out.trim());

  return typeof v === 'string' ? JSON.parse(v) : v;
}

/**
 * Runs a playwright-cli run-code function; `src` is the source of `async page => ...` returning JSON-able data.
 * @param {string} src
 * @param {string} [dir]
 * @returns {unknown}
 */
function runCode(src, dir = join(TMP, 'run')) {
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `code-${process.pid}-${Date.now()}.js`);
  writeFileSync(file, `async page => JSON.stringify(await (${src})(page))`);
  const r = pw(['run-code', `--filename=${file}`], { raw: true });
  rmSync(file, { force: true });

  if (r.code !== 0) {
    throw new Error(`run-code failed (${r.code}): ${r.out.slice(0, 600)}`);
  }

  return parseRunCode(r.out);
}

// ---------- raw CDP (DevTools window and the Angular panel) ----------

/**
 * @param {number} port
 * @returns {Promise<CdpTarget[]>}
 */
async function targets(port) {
  return /** @type {CdpTarget[]} */ (
    await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  );
}

/**
 * @param {number} port
 * @param {(t: CdpTarget) => boolean} match
 * @param {string} method
 * @param {Record<string, unknown>} [params]
 * @returns {Promise<CdpResponse>}
 */
async function cdp(port, match, method, params = {}) {
  const list = await targets(port);
  const t = list.find(match);

  if (!t) {
    throw new Error(
      `no CDP target matched; targets: ${list.map((x) => `${x.type} ${x.url.slice(0, 80)}`).join(' ; ')}`,
    );
  }

  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => {
    ws.addEventListener('open', r);
    ws.addEventListener('error', j);
  });

  try {
    return await new Promise((r) => {
      ws.addEventListener('message', (ev) => {
        const m = /** @type {CdpResponse} */ (JSON.parse(String(ev.data)));

        if (m.id === 1) {
          r(m);
        }
      });
      ws.send(JSON.stringify({ id: 1, method, params }));
    });
  } finally {
    ws.close();
  }
}

/**
 * The value of a Runtime.evaluate response; throws with the exception text when the expression threw.
 * @param {CdpResponse} r
 * @returns {unknown}
 */
export function evaluated(r) {
  if (r.result?.exceptionDetails) {
    throw new Error(
      `evaluate threw: ${r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text}`,
    );
  }

  return r.result?.result?.value;
}

/**
 * @param {number} port
 * @param {(t: CdpTarget) => boolean} match
 * @param {string} fnSource
 * @returns {Promise<unknown>}
 */
async function evalIn(port, match, fnSource) {
  return evaluated(
    await cdp(port, match, 'Runtime.evaluate', {
      expression: `(${fnSource})()`,
      awaitPromise: true,
      returnByValue: true,
    }),
  );
}

/** @param {CdpTarget} t */
export const isDevtools = (t) =>
  t.url.startsWith('devtools://devtools/bundled/devtools_app.html');
/** @param {CdpTarget} t */
export const isPanel = (t) =>
  t.url === `chrome-extension://${EXT_ID}/index.html`;

/** @param {number} port */
async function showPanel(port) {
  const ok = await waitFor(
    async () => (await targets(port)).some(isDevtools),
    15000,
  );

  if (!ok) {
    throw new Error(
      'no DevTools window target; was the browser started by "up" (it opens DevTools for each tab)?',
    );
  }

  const registered = await waitFor(
    () =>
      evalIn(
        port,
        isDevtools,
        `async () => Object.keys(UI.panels).includes(${JSON.stringify(PANEL_ID)})`,
      ),
    15000,
  );

  if (!registered) {
    throw new Error(
      `DevTools has no panel ${PANEL_ID}; the extension did not register its panel`,
    );
  }

  await evalIn(
    port,
    isDevtools,
    `async () => Extensions.extensionServer.onShowPanel({ command: 'showPanel', id: ${JSON.stringify(PANEL_ID)} })`,
  );
  const ready = await waitFor(
    async () =>
      (await targets(port)).some(isPanel) &&
      evalIn(
        port,
        isPanel,
        `async () => document.body.innerText.includes('Components')`,
      ),
    15000,
  );

  if (!ready) {
    throw new Error('Angular panel target index.html did not render its tabs');
  }
}

// Functions evaluated inside the panel (chrome-extension://<id>/index.html).
const PANEL = {
  /** @param {string} name */
  tab: (name) =>
    `async () => { const t = [...document.querySelectorAll('a,button,[role=tab]')].find((b) => b.textContent.trim() === ${JSON.stringify(name)}); if (!t) return false; t.click(); return true; }`,
  /** @param {string} name */
  selectComponent: (name) => `async () => {
    const leaf = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && e.textContent.trim() === ${JSON.stringify(name)} && e.closest('.node-name'));
    if (!leaf) return false;
    leaf.closest('.node-name').click();
    return true;
  }`,
  showSignalGraph: `async () => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Show Signal Graph')); if (!b) return false; b.click(); return true; }`,
  readSignalGraph: `async () => [...document.querySelectorAll('ng-signal-graph-pane .node-cont')].map((n) => ({ kind: [...n.classList].find((c) => c.startsWith('kind-'))?.slice(5) ?? null, text: n.innerText.split('\\n').map((s) => s.trim()).filter(Boolean) }))`,
  recordButton: `async () => { const b = [...document.querySelectorAll('button')].find((x) => /^(Start|Stop) recording$/.test(x.getAttribute('aria-label') ?? '')); if (!b) return null; const l = b.getAttribute('aria-label'); b.click(); return l; }`,
  profilerSummary: `async () => { const t = document.body.innerText; const m = t.match(/Change detection cycles[\\s\\S]*?(\\d+)\\s*\\/\\s*(\\d+)/); return { cycles: m ? Number(m[2]) : null, text: t.replace(/\\n+/g, ' | ').slice(0, 400) }; }`,
  text: `async () => document.body.innerText.replace(/\\n+/g, ' | ').slice(0, 1500)`,
};

/**
 * @param {number} port
 * @returns {Promise<SignalNode[]>}
 */
async function readSignalGraph(port) {
  return /** @type {SignalNode[]} */ (
    await evalIn(port, isPanel, PANEL.readSignalGraph)
  );
}

/**
 * @param {number} port
 * @param {string} component
 * @returns {Promise<SignalNode[] | null>}
 */
async function panelSignalGraph(port, component) {
  await evalIn(port, isPanel, PANEL.tab('Components'));

  if (
    !(await waitFor(
      () => evalIn(port, isPanel, PANEL.selectComponent(component)),
      10000,
    ))
  ) {
    throw new Error(
      `component ${component} not found in the panel's component tree`,
    );
  }

  if (
    !(await waitFor(() => evalIn(port, isPanel, PANEL.showSignalGraph), 10000))
  ) {
    throw new Error(
      'no "Show Signal Graph" button after selecting the component',
    );
  }

  return waitFor(async () => {
    const nodes = await readSignalGraph(port);

    return nodes.length ? nodes : null;
  }, 10000);
}

/**
 * @param {number} port
 * @param {(t: CdpTarget) => boolean} match
 * @param {string} file
 * @returns {Promise<string>}
 */
async function screenshotTarget(port, match, file) {
  const r = await cdp(port, match, 'Page.captureScreenshot', { format: 'png' });

  if (!r.result?.data) {
    throw new Error(
      `screenshot failed: ${JSON.stringify(r.error ?? r).slice(0, 200)}`,
    );
  }

  writeFileSync(file, Buffer.from(r.result.data, 'base64'));

  return file;
}

// ---------- page-side probes (run through playwright-cli run-code) ----------
const ATTACH_PROBE = `async (page) => {
  await page.addInitScript(() => {
    if (window.__ngdtProbe) return;
    const p = (window.__ngdtProbe = { flagSetAt: null, messages: [] });
    let flag;
    Object.defineProperty(window, '__NG_DEVTOOLS_CONNECTED__', { configurable: true, get: () => flag, set: (v) => { flag = v; p.flagSetAt = Math.round(performance.now()); } });
    window.addEventListener('message', (e) => {
      const d = e.data;
      if (d && (d.__NG_DEVTOOLS_EVENT__ || d.isAngularDevTools)) {
        p.messages.push({ t: Math.round(performance.now()), source: typeof d.source === 'string' ? d.source.replace(/-https?:.*$/, '') : null, topic: d.topic ?? (d.isAngularDevTools ? '(detection)' : null), detection: d.isAngularDevTools ? d : d.topic === 'detectAngular' ? d.args?.[0] : undefined });
      }
    });
  });
  await page.reload();
  await page.waitForFunction(() => window.__ngdtProbe?.messages.some((m) => m.topic === 'backendReady'), null, { timeout: 20000 }).catch(() => {});
  return page.evaluate(() => {
    const p = window.__ngdtProbe;
    const firstOf = (topic) => p.messages.find((m) => m.topic === topic) ?? null;
    return {
      flag: window.__NG_DEVTOOLS_CONNECTED__ === true,
      flagSetAt: p.flagSetAt,
      detection: firstOf('detectAngular')?.detection ?? null,
      backendInstalled: !!firstOf('backendInstalled'),
      handshake: !!firstOf('handshake'),
      backendReady: firstOf('backendReady')?.t ?? null,
      ngVersion: document.querySelector('[ng-version]')?.getAttribute('ng-version') ?? null,
      ngGlobal: typeof window.ng === 'object' && typeof window.ng.getComponent === 'function',
      topics: [...new Set(p.messages.map((m) => (m.source ? m.source + ':' : '') + m.topic))],
    };
  });
}`;

const EXT_INFO = `async (page) => {
  const sw = page.context().serviceWorkers().map((w) => w.url()).filter((u) => u.startsWith('chrome-extension://${EXT_ID}/'));
  const p = await page.context().newPage();
  try {
    await p.goto('chrome://extensions/?id=${EXT_ID}');
    await p.waitForFunction(() => typeof chrome?.developerPrivate?.getExtensionInfo === 'function');
    const info = await p.evaluate(() => new Promise((r) => chrome.developerPrivate.getExtensionInfo('${EXT_ID}', (i) => r(i ? { name: i.name, version: i.version, state: i.state, location: i.location, path: i.prettifiedPath, runtimeErrors: i.runtimeErrors?.length ?? 0, manifestErrors: i.manifestErrors?.length ?? 0 } : null))));
    return { serviceWorkers: sw, info };
  } finally {
    await p.close();
  }
}`;

// ---------- branded profiles (read-only) ----------

/**
 * Reads a branded browser profile: the extension's folder versions and its `extensions.settings` entry.
 * @param {BrandedName} name
 * @param {Browser} b
 * @param {string} [profile]
 * @returns {BrandedStatus}
 */
export function brandedStatusIn(name, b, profile = 'Default') {
  const dir = join(b.userData, profile, 'Extensions', EXT_ID);
  const versions = existsSync(dir)
    ? readdirSync(dir).filter((v) => /^\d/.test(v))
    : [];
  /** @type {ExtSettings | null} */
  let settings = null;

  for (const f of ['Secure Preferences', 'Preferences']) {
    const p = join(b.userData, profile, f);

    if (!settings && existsSync(p)) {
      const prefs =
        /** @type {{ extensions?: { settings?: Record<string, PrefEntry> } }} */ (
          JSON.parse(readFileSync(p, 'utf8'))
        );
      const s = prefs.extensions?.settings?.[EXT_ID];

      if (s) {
        settings = {
          file: f,
          version: s.manifest?.version ?? null,
          disableReasons: s.disable_reasons ?? [],
          state: s.state ?? null,
          fromWebstore: s.from_webstore ?? null,
          path: s.path ?? null,
        };
      }
    }
  }

  const installed = settings !== null && versions.length > 0;
  const enabled =
    installed &&
    settings !== null &&
    settings.disableReasons.length === 0 &&
    settings.state !== 0;

  return {
    browser: name,
    profile,
    extensionsDir: dir,
    versionsOnDisk: versions,
    settings,
    installed,
    enabled,
    extensionsPage: `${b.scheme}://extensions/?id=${EXT_ID}`,
  };
}

/**
 * @param {BrandedName} name
 * @param {string} [profile]
 * @returns {BrandedStatus}
 */
function brandedStatus(name, profile) {
  return brandedStatusIn(name, BROWSERS[name], profile);
}

/**
 * @param {BrandedName} name
 * @param {string} url
 * @param {string} [profile]
 */
function openInBrowser(name, url, profile = 'Default') {
  spawn(BROWSERS[name].exe, [`--profile-directory=${profile}`, url], {
    detached: true,
    stdio: 'ignore',
  }).unref();
}

// ---------- commands ----------

/**
 * The highest-versioned subfolder of `dir` that holds a manifest.json, compared numerically.
 * @param {string} dir
 * @returns {string | undefined}
 */
export function newestVersion(dir) {
  return readdirSync(dir)
    .filter((d) => existsSync(join(dir, d, 'manifest.json')))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .pop();
}

/** @returns {{ version: string, dir: string } | null} */
function newestCopy() {
  if (!existsSync(EXT_COPY)) {
    return null;
  }

  const v = newestVersion(EXT_COPY);

  return v ? { version: v, dir: join(EXT_COPY, v) } : null;
}

/** @returns {Promise<Result>} */
async function cmdInstall() {
  const browser = opts.browser ?? 'test';

  if (browser !== 'test') {
    const before = brandedStatus(browser, opts.profile);

    if (before.installed) {
      log(
        'OK',
        `${browser}: Angular DevTools ${before.settings?.version} already installed (enabled: ${before.enabled})`,
      );

      return { ok: true, already: true, status: before };
    }

    openInBrowser(browser, STORE_URL, opts.profile);
    log(
      'INFO',
      `opened ${STORE_URL} in ${browser}. Lars clicks "Add to ${browser.startsWith('edge') ? 'Edge' : 'Chrome'}"${browser.startsWith('edge') ? ' (after "Allow extensions from other stores" if Edge asks)' : ''} and confirms "Add extension"; polling the profile for ${opts.timeout ?? 180} s`,
    );
    const after = await waitFor(
      () => {
        const s = brandedStatus(browser, opts.profile);

        return s.installed ? s : null;
      },
      Number(opts.timeout ?? 180) * 1000,
      2000,
    );

    if (!after) {
      throw new Unhealthy(
        `${browser}: not installed after ${opts.timeout ?? 180} s; profile has no ${EXT_ID} entry`,
      );
    }

    log(
      'OK',
      `${browser}: installed ${after.settings?.version ?? after.versionsOnDisk.at(-1)?.replace(/_\d+$/, '')}, enabled ${after.enabled}`,
    );

    return { ok: true, status: after };
  }

  const from = opts.from ?? 'edge-dev';
  const srcRoot = isBranded(from)
    ? join(
        BROWSERS[from].userData,
        opts.profile ?? 'Default',
        'Extensions',
        EXT_ID,
      )
    : resolve(from);

  if (!existsSync(srcRoot)) {
    refuse(
      `no Angular DevTools in ${srcRoot}; install it in ${from} first or pass --from <dir>`,
    );
  }

  const srcVersion = newestVersion(srcRoot);
  const src = srcVersion ? join(srcRoot, srcVersion) : srcRoot;
  const version = /** @type {{ version?: unknown }} */ (
    JSON.parse(readFileSync(join(src, 'manifest.json'), 'utf8'))
  ).version;

  if (!isExtensionVersion(version)) {
    return refuse(
      `manifest version ${JSON.stringify(version)} in ${src} is not digits and dots`,
    );
  }

  const dest = join(EXT_COPY, version);

  if (existsSync(join(dest, 'manifest.json'))) {
    log('OK', `copy of ${version} already at ${dest}`);

    return { ok: true, already: true, version, dir: dest, source: src };
  }

  mkdirSync(EXT_COPY, { recursive: true });
  cpSync(src, dest, { recursive: true });
  log(
    'OK',
    `copied Angular DevTools ${version} from ${src} (read only) to ${dest}`,
  );

  return { ok: true, version, dir: dest, source: src };
}

/** @returns {Promise<Result>} */
async function cmdUninstall() {
  const browser = opts.browser ?? 'test';

  if (browser !== 'test') {
    const before = brandedStatus(browser, opts.profile);

    if (!before.installed) {
      log('OK', `${browser}: Angular DevTools not installed`);

      return { ok: true, already: true, status: before };
    }

    openInBrowser(browser, STORE_URL, opts.profile);
    log(
      'INFO',
      `opened ${STORE_URL} in ${browser} (a browser will not open ${before.extensionsPage} from the command line). Lars clicks "Remove from ${browser.startsWith('edge') ? 'Edge' : 'Chrome'}" there, or opens ${before.extensionsPage} himself and clicks Remove; polling the profile for ${opts.timeout ?? 180} s`,
    );
    const after = await waitFor(
      () => {
        const s = brandedStatus(browser, opts.profile);

        return s.settings ? null : s;
      },
      Number(opts.timeout ?? 180) * 1000,
      2000,
    );

    if (!after) {
      throw new Unhealthy(
        `${browser}: still registered in the profile after ${opts.timeout ?? 180} s`,
      );
    }

    log(
      'OK',
      `${browser}: removed (folder versions left on disk: ${after.versionsOnDisk.join(', ') || 'none'})`,
    );

    return { ok: true, status: after };
  }

  if (readState()) {
    refuse('the test browser is up; run "down" first');
  }

  rmSync(EXT_COPY, { recursive: true, force: true });
  rmSync(join(TMP, 'profile'), { recursive: true, force: true });
  log('OK', `removed ${EXT_COPY} and the test profiles`);

  return { ok: true };
}

/** @returns {Promise<Result>} */
async function cmdStatus() {
  const browser = opts.browser ?? 'test';

  if (browser === 'test') {
    const copy = newestCopy();
    const st = readState();
    log(
      copy ? 'OK' : 'INFO',
      `test: copy ${copy ? `${copy.version} at ${copy.dir}` : 'none (run install)'}; up ${!!st}`,
    );

    return { ok: !!copy, browser, copy, up: !!st };
  }

  const s = brandedStatus(browser, opts.profile);
  log(
    s.installed ? 'OK' : 'INFO',
    `${browser}/${s.profile}: installed ${s.installed}${s.installed ? `, version ${s.settings?.version}, enabled ${s.enabled}, disable_reasons ${JSON.stringify(s.settings?.disableReasons)}` : ''}`,
  );

  return { ok: true, ...s };
}

/**
 * The evidence folder name for a start time: `yyyymmdd-hhmmss` in UTC.
 * @param {Date} date
 * @returns {string}
 */
export function evidenceStamp(date) {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..*/, '')
    .replace('T', '-');
}

/** @returns {Promise<Result>} */
async function cmdUp() {
  if (readState()) {
    refuse(`state file exists at ${STATE}; run "down" first`);
  }

  const appUrl = opts['app-url'];

  if (!appUrl) {
    return refuse('--app-url <url of a dev-mode Angular app> is required');
  }

  const copy = newestCopy();

  if (!copy) {
    return refuse('no extension copy; run "install" first');
  }

  const forced = opts.port === undefined ? undefined : Number(opts.port);

  if (forced !== undefined && (forced < 1 || forced > 65535)) {
    refuse(`--port ${opts.port} is not a port number`);
  }

  if (isWorktree && forced === MAIN_CDP_PORT) {
    refuse(`port ${MAIN_CDP_PORT} belongs to the main checkout's flow`);
  }

  /** @type {PortRow[]} */
  let rows;

  try {
    rows = portRows(appUrl);
  } catch (e) {
    return refuse(
      `--app-url ${appUrl}: ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  let order = slotOrder(slotOfFlow(flowId));
  const first = order[0];
  const evidenceDir = join(TMP, 'evidence', evidenceStamp(new Date()));
  const ext = copy.dir.replace(/\\/g, '/');
  const configPath = join(TMP, 'state', `${flowId}.cli.config.json`);
  const t0 = Date.now();

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

    const port = /** @type {PortEntry} */ (
      plan.ports.find((p) => p.name === 'cdp')
    ).port;
    mkdirSync(evidenceDir, { recursive: true });
    const config = {
      browser: {
        browserName: 'chromium',
        userDataDir: PROFILE.replace(/\\/g, '/'),
        launchOptions: {
          channel: 'chromium',
          headless: false,
          args: [
            `--disable-extensions-except=${ext}`,
            `--load-extension=${ext}`,
            '--auto-open-devtools-for-tabs',
            `--remote-debugging-port=${port}`,
          ],
        },
      },
    };
    mkdirSync(dirname(configPath), { recursive: true });
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    const notBefore = Date.now();
    const r = pw([`--config=${configPath}`, 'open', appUrl]);
    const notAfter = Date.now();
    const pid = Number(r.out.match(/opened with pid (\d+)/)?.[1]);

    if (r.code !== 0 || !pid) {
      throw new Error(
        `playwright-cli open failed (${r.code}): ${r.out.slice(0, 600)}`,
      );
    }

    // The session process starts while `open` runs, so it started inside that window.
    const opened = snapshot(pid, { notBefore, notAfter });

    if (opened.length === 0) {
      throw new Error(
        `playwright-cli PID ${pid} is not running, or did not start while open ran`,
      );
    }

    /** @type {State} */
    const st = {
      flowId,
      session: SESSION,
      pid,
      tree: opened,
      cdpPort: port,
      slot: plan.slot,
      ports: plan.ports,
      appUrl,
      extensionVersion: copy.version,
      extensionDir: copy.dir,
      profile: PROFILE,
      configPath,
      evidenceDir,
      startedAt: new Date().toISOString(),
    };
    writeFileSync(STATE, JSON.stringify(st, null, 2));
    const ready = await waitFor(async () => {
      try {
        return (await targets(port)).some(
          (t) =>
            t.type === 'service_worker' &&
            t.url.startsWith(`chrome-extension://${EXT_ID}/`),
        );
      } catch {
        return false;
      }
    }, 20000);

    // The port must be held by the browser this session opened: another harness browser that took it after the
    // check has the same extension ID, so the service worker alone proves nothing. The bind probe says it is held;
    // the OS names the holder as a favour, and this host's netstat names none.
    const held = await busyPorts([port]);
    const holders = held.get(port) ?? [];
    const live = liveTree(st);
    const holder = holders.find((h) => !live.some((x) => x.pid === h)) ?? null;
    // Recorded with its start time on every path, so down can stop a Chromium that outlives the playwright-cli process.
    st.tree = merge(st.tree ?? [], live);
    writeFileSync(STATE, JSON.stringify(st, null, 2));

    if (ready && holder === null && held.has(port)) {
      st.readyInSeconds = Math.round((Date.now() - t0) / 100) / 10;
      st.browserPid = holders[0] ?? null;
      writeFileSync(STATE, JSON.stringify(st, null, 2));
      log(
        'OK',
        `session ${SESSION} (playwright-cli PID ${pid}), browser PID ${st.browserPid ?? 'not named by the OS'}, CDP ${port}${plan.slot === first ? '' : ` (fell back to slot ${plan.slot})`}, Angular DevTools ${copy.version}, ready in ${st.readyInSeconds} s`,
      );

      return { ok: true, ...st };
    }

    if (holder === null) {
      throw new Unhealthy(
        `browser PID ${pid} up but no Angular DevTools service worker of its own on CDP port ${port}; run doctor`,
      );
    }

    pw(['close']);
    // As in down: close first lets Chromium end on its own; stop takes what outlived it.
    await waitFor(() => !anyAlive(st.tree ?? []), 10000);
    const { records, result } = stopRun(st);
    const stopped = downOutcome(st, result);

    if (stopped.code !== 0) {
      st.tree = records;
      writeFileSync(STATE, JSON.stringify(st, null, 2));
      throw new Error(
        `CDP port ${port} was taken by PID ${holder} after the check, and stopping this attempt failed: ${stopped.reason}; run down`,
      );
    }

    rmSync(STATE, { force: true });

    if (forced !== undefined) {
      refuse(
        `port ${port} (--port) was taken by PID ${holder} after the check; --port has no fallback`,
      );
    }

    order = order.slice(order.indexOf(plan.slot) + 1);

    if (order.length === 0) {
      refuse(
        `CDP port ${port} was taken by PID ${holder} after the check, and none of the ${SLOT_TRIES} slots is left`,
      );
    }
  }
}

/**
 * One doctor check: true/'pass' passes, 'warn' is reported but never fails doctor, false fails.
 * @param {string} name
 * @param {boolean | 'pass' | 'warn'} result
 * @param {string} detail
 * @returns {{ check: Check, marker: 'OK' | 'WARN' | 'ERROR' }}
 */
export function checkOf(name, result, detail) {
  const ok = result !== false;
  /** @type {Check} */
  const check =
    typeof result === 'string'
      ? { name, ok, detail, status: result }
      : { name, ok, detail };

  return { check, marker: result === 'warn' ? 'WARN' : ok ? 'OK' : 'ERROR' };
}

/** @returns {Promise<Result>} */
async function cmdDoctor() {
  const st = requireState();
  /** @type {Check[]} */
  const checks = [];
  /** @type {(name: string, result: boolean | 'pass' | 'warn', detail: string) => void} */
  const add = (name, result, detail) => {
    const { check, marker } = checkOf(name, result, detail);
    checks.push(check);
    log(marker, `${name}: ${detail}`);
  };
  const fresh = mapFresh(SKILL_DIR);
  add('map-fresh', fresh.status, fresh.detail);
  const live = checkIdentity(st);
  add(
    'process',
    !!live,
    live
      ? `PID ${st.pid} alive, start time and command line match`
      : `PID ${st.pid} not running`,
  );

  if (!live) {
    return { ok: false, checks };
  }

  const tree = liveTree(st);
  const recorded = merge(st.tree ?? [], tree);

  // Written only while the state file is there and the record changed: a down that just removed it stays done.
  if (
    existsSync(STATE) &&
    JSON.stringify(recorded) !== JSON.stringify(st.tree ?? [])
  ) {
    st.tree = recorded;
    writeFileSync(STATE, JSON.stringify(st, null, 2));
  }

  add('tree', true, `${recorded.length} process(es) recorded for down`);

  /** @type {{ Browser?: string } | null} */
  let version = null;

  try {
    version = /** @type {{ Browser?: string }} */ (
      await (await fetch(`http://127.0.0.1:${st.cdpPort}/json/version`)).json()
    );
  } catch {}

  // The CDP port is held by the recorded Chromium (a child of the playwright-cli session process), and answers.
  const recordedPorts = st.ports ?? [
    { name: 'cdp', port: st.cdpPort, kind: 'derived' },
  ];
  const ports = portsCheck(
    recordedPorts,
    await busyPorts(recordedPorts.map((p) => p.port)),
    new Set(tree.map((r) => r.pid)),
  );
  add(
    'ports',
    ports.status === 'pass' && !!version,
    `${ports.detail}; ${version ? `CDP answers (${version.Browser}), recorded browser PID ${st.browserPid}` : `CDP ${st.cdpPort} /json/version does not answer`}`,
  );
  const ext =
    /** @type {{ serviceWorkers: string[], info: { name: string, version: string, state: string, location: string, path: string, runtimeErrors: number, manifestErrors: number } | null }} */ (
      runCode(EXT_INFO)
    );
  add(
    'extension',
    ext.info?.state === 'ENABLED' && ext.serviceWorkers.length > 0,
    ext.info
      ? `${ext.info.name} ${ext.info.version} ${ext.info.state} (${ext.info.location}, ${ext.info.path}); service worker ${ext.serviceWorkers.length ? 'running' : 'absent'}; errors ${ext.info.runtimeErrors}/${ext.info.manifestErrors}`
      : 'not registered',
  );
  const page =
    /** @type {{ url: string, ngVersion: string | null, devBuild: boolean, flag: boolean }} */ (
      runCode(
        `async (page) => ({ url: page.url(), ngVersion: await page.evaluate(() => document.querySelector('[ng-version]')?.getAttribute('ng-version') ?? null), devBuild: await page.evaluate(() => typeof window.ng === 'object' && typeof window.ng.getComponent === 'function'), flag: await page.evaluate(() => window.__NG_DEVTOOLS_CONNECTED__ === true) })`,
      )
    );
  add(
    'app',
    !!page.ngVersion && page.devBuild,
    `${page.url}: ng-version ${page.ngVersion}, window.ng ${page.devBuild ? 'present (development build)' : 'absent (production build or not Angular)'}`,
  );
  add(
    'connected-flag',
    page.flag,
    `window.__NG_DEVTOOLS_CONNECTED__ ${page.flag}`,
  );
  const devtools = (await targets(st.cdpPort)).some(isDevtools);
  add(
    'devtools-window',
    devtools,
    devtools ? 'DevTools window target present' : 'no devtools:// target',
  );

  return { ok: checks.every((c) => c.ok), checks };
}

/**
 * Attached means: connected flag set, Angular detected in debug mode, backend installed and ready.
 * @param {AttachFacts} r
 * @returns {boolean}
 */
export function attachOk(r) {
  const d = r.detection ?? {};

  return !!(
    r.flag &&
    d.isAngular &&
    d.isDebugMode &&
    r.backendInstalled &&
    r.backendReady
  );
}

/** @returns {Promise<Result>} */
async function cmdAttach() {
  requireState();
  const r = /** @type {AttachFacts} */ (runCode(ATTACH_PROBE));
  const ok = attachOk(r);
  log(
    ok ? 'OK' : 'ERROR',
    `flag ${r.flag} (set at ${r.flagSetAt} ms); detection ${JSON.stringify(r.detection ?? {})}; backendInstalled ${r.backendInstalled}; backendReady at ${r.backendReady} ms; Angular ${r.ngVersion}`,
  );

  if (!ok) {
    throw new Unhealthy(`not attached: ${JSON.stringify(r)}`);
  }

  return { ok, ...r };
}

/** @returns {Promise<Result>} */
async function cmdPanel() {
  const st = requireOwnedCdp();
  const sub = pos[0] ?? 'show';
  await showPanel(st.cdpPort);

  if (sub === 'show') {
    const text = /** @type {string} */ (
      await evalIn(st.cdpPort, isPanel, PANEL.text)
    );
    log('OK', `Angular panel: ${text}`);

    return { ok: true, text };
  }

  if (sub === 'signal-graph') {
    const nodes = await panelSignalGraph(
      st.cdpPort,
      opts.component ?? 'app-counter',
    );
    log(
      nodes ? 'OK' : 'ERROR',
      `signal graph pane: ${(nodes ?? []).map((n) => `${n.kind}:${n.text[0]}`).join(', ')}`,
    );

    return { ok: !!nodes, nodes };
  }

  if (sub === 'screenshot') {
    const file = resolve(
      opts.file ?? join(st.evidenceDir, `devtools-${Date.now()}.png`),
    );
    await screenshotTarget(st.cdpPort, isDevtools, file);
    log('OK', `DevTools window screenshot ${file}`);

    return { ok: true, file };
  }

  return refuse(
    `unknown panel subcommand ${sub}; use show, signal-graph, screenshot`,
  );
}

/**
 * Passes when both subscribers counted, the removed one stopped, the other kept counting, and DevTools recorded
 * at least two change detection cycles.
 * @param {ProfilerCounts} prof
 * @param {number | null} cycles
 * @returns {boolean}
 */
export function profilerOk(prof, cycles) {
  return (
    prof.bothOn.a > 0 &&
    prof.bothOn.b > 0 &&
    prof.afterRemoveA.a === prof.bothOn.a &&
    prof.afterRemoveA.b > prof.bothOn.b &&
    (cycles ?? 0) >= 2
  );
}

/**
 * Whether the DevTools pane lists the same signal graph nodes as ng.ɵgetSignalGraph, each written `kind:label`, in any
 * order. A node ng gives no label (an effect) matches a pane node of the same kind whatever the pane calls it.
 * @param {string[]} ng
 * @param {string[] | null} pane  null when the pane showed no graph
 * @returns {{ ok: boolean, missing: string[], extra: string[] }}
 */
export function signalGraphMatch(ng, pane) {
  if (pane === null) {
    return { ok: false, missing: [...ng], extra: [] };
  }

  /** @param {string} n */
  const split = (n) => {
    const i = n.indexOf(':');

    return i === -1
      ? { kind: n, label: '' }
      : { kind: n.slice(0, i), label: n.slice(i + 1) };
  };
  const left = pane.map(split);
  /** @type {string[]} */
  const missing = [];
  // Labelled nodes first, so an unlabelled one never takes the pane node a labelled one needs.
  const ordered = [...ng].sort(
    (a, b) => Number(split(a).label === '') - Number(split(b).label === ''),
  );

  for (const n of ordered) {
    const { kind, label } = split(n);
    const i = left.findIndex(
      (p) => p.kind === kind && (label === '' || p.label === label),
    );

    if (i === -1) {
      missing.push(n);
    } else {
      left.splice(i, 1);
    }
  }

  const extra = left.map((p) => `${p.kind}:${p.label}`);

  return { ok: missing.length === 0 && extra.length === 0, missing, extra };
}

// Coexistence checks an in-page AI extension shares with Angular DevTools.
/** @returns {Promise<Result>} */
async function cmdCoexist() {
  const st = requireOwnedCdp();
  const component = opts.component ?? 'app-counter';
  const click = opts.click ?? "getByRole('button', { name: 'Increment' })";
  await showPanel(st.cdpPort);

  // 1. Profiler: two extra subscribers, removing one leaves the other and the DevTools recording running.
  await evalIn(st.cdpPort, isPanel, PANEL.tab('Profiler'));
  await waitFor(
    () =>
      evalIn(
        st.cdpPort,
        isPanel,
        `async () => !!document.querySelector('button[aria-label="Start recording"]')`,
      ),
    10000,
  );
  const started = await evalIn(st.cdpPort, isPanel, PANEL.recordButton);
  const prof = /** @type {ProfilerCounts} */ (
    runCode(`async (page) => {
    const text = () => page.locator(${JSON.stringify(component)}).innerText();
    const clickAndSettle = async () => { const before = await text(); await page.${click}.click(); await page.waitForFunction(([sel, b]) => document.querySelector(sel)?.innerText !== b, [${JSON.stringify(component)}, before]); await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50)))); };
    await page.evaluate(() => { window.__ngdtCoexist = { a: 0, b: 0 }; window.__ngdtRemoveA = ng.ɵsetProfiler(() => window.__ngdtCoexist.a++); window.__ngdtRemoveB = ng.ɵsetProfiler(() => window.__ngdtCoexist.b++); });
    await clickAndSettle();
    const bothOn = await page.evaluate(() => { const s = { ...window.__ngdtCoexist }; window.__ngdtRemoveA(); return s; });
    await clickAndSettle();
    const afterRemoveA = await page.evaluate(() => { const s = { ...window.__ngdtCoexist }; window.__ngdtRemoveB(); return s; });
    return { bothOn, afterRemoveA };
  }`)
  );
  const stopped = await evalIn(st.cdpPort, isPanel, PANEL.recordButton);
  const summary = await waitFor(async () => {
    const s = /** @type {{ cycles: number | null, text: string }} */ (
      await evalIn(st.cdpPort, isPanel, PANEL.profilerSummary)
    );

    return s.cycles !== null ? s : null;
  }, 10000);
  const profiler = {
    ok: profilerOk(prof, summary?.cycles ?? null),
    recording: [started, stopped],
    subscribers: prof,
    devtoolsCycles: summary?.cycles ?? null,
  };
  log(
    profiler.ok ? 'OK' : 'ERROR',
    `profiler: own subscribers ${JSON.stringify(prof)}; DevTools recorded ${summary?.cycles} change detection cycles`,
  );

  // 2. Connected flag: present and true; Angular reads it, an AI extension must not overwrite it.
  const flagValue = /** @type {{ value?: unknown }} */ (
    runCode(
      `async (page) => page.evaluate(() => ({ value: window.__NG_DEVTOOLS_CONNECTED__ }))`,
    )
  );
  const flag = { ok: flagValue.value === true, ...flagValue };
  log(flag.ok ? 'OK' : 'ERROR', `connected flag ${JSON.stringify(flagValue)}`);

  // 3. Signal graph: ng.ɵgetSignalGraph and the DevTools pane list the same nodes.
  const readNg = `async (page) => page.evaluate((sel) => ng.ɵgetSignalGraph(ng.getInjector(document.querySelector(sel))).nodes.map((n) => n.kind + ':' + (n.label ?? '')), ${JSON.stringify(component)})`;
  const ngBefore = /** @type {string[]} */ (runCode(readNg));
  const paneBefore = await panelSignalGraph(st.cdpPort, component);
  const pane = paneBefore?.map((n) => `${n.kind}:${n.text[0]}`);
  const match = signalGraphMatch(ngBefore, pane ?? null);
  const signalGraph = {
    ok: match.ok,
    ng: ngBefore,
    pane,
    missing: match.missing,
    extra: match.extra,
  };
  log(
    signalGraph.ok ? 'OK' : 'ERROR',
    `signal graph: ng ${ngBefore.length} nodes, pane ${paneBefore?.length ?? 0} nodes${match.ok ? ', the same nodes' : `; missing from the pane ${JSON.stringify(match.missing)}, extra in the pane ${JSON.stringify(match.extra)}`}`,
  );
  const screenshotBefore = await screenshotTarget(
    st.cdpPort,
    isDevtools,
    join(st.evidenceDir, 'signal-graph-before.png'),
  );
  /** @type {Record<string, unknown>} */
  let afterDiGraph = {};

  // 4. Angular's angular:di_graph tool versus the signal graph (changes the page until reload).
  if (opts['di-graph']) {
    if (!paneBefore) {
      throw new Error(
        'no signal graph in the pane to compare after angular:di_graph',
      );
    }

    runCode(
      `async (page) => page.evaluate(async () => { let g = null; const ev = new CustomEvent('devtoolstooldiscovery'); ev.respondWith = (x) => { g = x; }; window.dispatchEvent(ev); await g.tools.find((t) => t.name === 'angular:di_graph').execute({}); return true; })`,
    );
    const ngAfter = /** @type {string[]} */ (runCode(readNg));
    runCode(
      `async (page) => { const sel = ${JSON.stringify(component)}; const before = await page.locator(sel).innerText(); await page.${click}.click(); await page.waitForFunction(([s, b]) => document.querySelector(s)?.innerText !== b, [sel, before]); return true; }`,
    );
    const paneAfter =
      (await waitFor(async () => {
        const n = await readSignalGraph(st.cdpPort);

        return n.length && n.length !== paneBefore.length ? n : null;
      }, 8000)) ?? (await panelSignalGraph(st.cdpPort, component));

    if (!paneAfter) {
      throw new Error('no signal graph in the pane after angular:di_graph');
    }

    const diGraph = {
      templateLostInNg:
        ngBefore.some((n) => n.startsWith('template:')) &&
        !ngAfter.some((n) => n.startsWith('template:')),
      templateLostInPane:
        paneBefore.some((n) => n.kind === 'template') &&
        !paneAfter.some((n) => n.kind === 'template'),
      ngAfter,
      paneAfter: paneAfter.map((n) => `${n.kind}:${n.text[0]}`),
    };
    const screenshotAfter = await screenshotTarget(
      st.cdpPort,
      isDevtools,
      join(st.evidenceDir, 'signal-graph-after-di-graph.png'),
    );
    afterDiGraph = { diGraph, screenshotAfter };
    log(
      diGraph.templateLostInPane ? 'WARN' : 'OK',
      `after angular:di_graph: ng ${JSON.stringify(ngAfter)}; pane ${JSON.stringify(diGraph.paneAfter)}`,
    );
  }

  const results = {
    profiler,
    flag,
    signalGraph,
    screenshotBefore,
    ...afterDiGraph,
  };
  writeFileSync(
    join(st.evidenceDir, 'coexist.json'),
    JSON.stringify(results, null, 2),
  );
  const ok = profiler.ok && flag.ok && signalGraph.ok;

  return { ok, evidence: join(st.evidenceDir, 'coexist.json'), ...results };
}

/** @returns {Promise<Result>} */
async function cmdInfo() {
  const st = requireState();
  log(
    'INFO',
    `flow ${st.flowId}, session ${st.session}, app ${st.appUrl}, playwright-cli PID ${st.pid}, browser PID ${st.browserPid}, CDP ${st.cdpPort}, Angular DevTools ${st.extensionVersion}, evidence ${st.evidenceDir}, state ${STATE}`,
  );

  return { ok: true, statePath: STATE, ...st };
}

/** @returns {Promise<Result>} */
async function cmdDown() {
  const st = requireState();
  const configPath = join(TMP, 'state', `${flowId}.cli.config.json`);
  const badPath = deleteProblem(st, { profile: PROFILE, configPath });

  if (badPath) {
    refuse(badPath);
  }

  // The last snapshot, while the session process and its Chromium still live; kept in the state before close.
  st.tree = merge(st.tree ?? [], liveTree(st));
  writeFileSync(STATE, JSON.stringify(st, null, 2));
  const r = pw(['close']);
  /** @type {string[]} */
  const notes = [`playwright-cli close: ${r.out.trim().split('\n')[0]}`];
  // close lets Chromium end on its own and write its profile; stop then takes whatever outlived it, such as a
  // Chromium whose playwright-cli process is gone (it holds the CDP port and locks the profile).
  await waitFor(() => !anyAlive(st.tree ?? []), 10000);
  const { records, result } = stopRun(st);
  const outcome = downOutcome(st, result);
  notes.push(...outcome.notes);

  if (outcome.code !== 0) {
    st.tree = records;
    writeFileSync(STATE, JSON.stringify(st, null, 2));
    // A refusal carries one message, so what was stopped and left goes into it.
    throw new Error(
      `${outcome.reason ?? 'stop failed; the state file is kept'}; notes: ${notes.join('; ')}`,
    );
  }

  // The profile and config go before the state file: a failure here keeps the record for the next down.
  try {
    rmSync(configPath, { force: true });
    rmSync(PROFILE, { recursive: true, force: true });
  } catch (e) {
    throw new Error(
      `could not remove the profile or config (${e instanceof Error ? e.message : String(e)}); the state file is kept, run down again`,
    );
  }

  rmSync(STATE, { force: true });
  notes.push(
    `removed config, profile and state; evidence kept in ${st.evidenceDir}`,
  );
  notes.forEach((n) => log('OK', n));

  return {
    ok: true,
    notes,
    evidenceDir: st.evidenceDir,
    pid: st.pid,
    browserPid: st.browserPid,
    cdpPort: st.cdpPort,
    session: st.session,
  };
}

const HELP = `control.mjs <command> [options] [--json]
  install   [--browser test|chrome|chrome-beta|edge|edge-dev] [--from edge-dev|edge|chrome|chrome-beta|<dir>] [--profile Default] [--timeout S]
  uninstall [--browser ...] [--profile Default] [--timeout S]
  status    [--browser ...] [--profile Default]
  up        --app-url <url> [--port N]           (test harness only)
  doctor | attach | info | down
  panel     show | signal-graph [--component app-counter] | screenshot [--file f.png]
  coexist   [--component app-counter] [--click "getByRole('button', { name: 'Increment' })"] [--di-graph]`;

/** @type {Record<string, () => Promise<Result>>} */
const COMMANDS = {
  install: cmdInstall,
  uninstall: cmdUninstall,
  status: cmdStatus,
  up: cmdUp,
  doctor: cmdDoctor,
  attach: cmdAttach,
  panel: cmdPanel,
  coexist: cmdCoexist,
  info: cmdInfo,
  down: cmdDown,
};

// import.meta.url is the real path, so compare real paths: run through a link, the CLI still runs.
if (
  process.argv[1] &&
  realpathSync.native(path.resolve(process.argv[1])) ===
    realpathSync.native(fileURLToPath(import.meta.url))
) {
  // Read before parsing, so a usage error still answers in JSON when --json was given.
  const json = process.argv.slice(2).includes('--json');
  /** @type {(reason: string) => never} */
  const usageExit = (reason) => {
    console.log(
      json
        ? JSON.stringify({ ok: false, exit: 2, reason }, null, 2)
        : `[ERROR] ${printable(reason)}`,
    );
    process.exit(2);
  };
  /** @type {Parsed} */
  let parsed;

  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (e) {
    if (!(e instanceof UsageError)) {
      throw e;
    }

    usageExit(`refused: ${e.message}`);
  }

  Object.assign(opts, parsed.opts);
  pos.push(...parsed.pos);
  const cmd = parsed.cmd;
  const run =
    cmd !== undefined && Object.hasOwn(COMMANDS, cmd)
      ? COMMANDS[cmd]
      : undefined;

  if (!run && cmd !== undefined) {
    if (json) {
      usageExit(`unknown command ${cmd}`);
    }

    console.log(HELP);
    process.exit(2);
  }

  if (!run) {
    console.log(HELP);
    process.exit(0);
  }

  try {
    const result = await run();

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
    }

    process.exit(result.ok ? 0 : 1);
  } catch (e) {
    const code = e instanceof Unhealthy ? 1 : 2;
    const message = e instanceof Error ? e.message : String(e);
    const reason = e instanceof Refusal ? `refused: ${message}` : message;

    if (opts.json) {
      console.log(JSON.stringify({ ok: false, exit: code, reason }, null, 2));
    } else {
      console.log(logLine('ERROR', reason));
    }

    process.exit(code);
  }
}
