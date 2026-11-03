#!/usr/bin/env node
// @ts-check
// Control script for control-angular-dev-app: up, doctor, info, down.
// Deterministic steps only; driving stays in playwright-cli.
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapFresh, printable } from './fingerprint.mjs';
import { describe, merge, processTable, snapshot, stop } from './proctree.mjs';

/** @typedef {'counter' | 'ssr' | 'portal' | 'components'} TargetName */
/** @typedef {{ name: string, bin: string | null, args: string[], env: Record<string, string | undefined>, port: number, readyPath: string }} ProcSpec */
/** @typedef {'derived' | 'fixed' | 'external'} PortKind */
/** @typedef {{ name: string, port: number, kind: PortKind, reason?: string }} PortEntry */
/**
 * A row of the ports table (SKILL.md, "Pick a flow"): a derived port has a value per slot, the first row is the main port.
 * @typedef {{ name: string, kind: 'derived', at: (slot: number) => number } | { name: string, kind: 'fixed', port: number, pin: string } | { name: string, kind: 'external', port: number, owner: string }} PortRow
 */
/** @typedef {{ dir: string, marker: string, ports: (dir: string) => PortRow[], procs: (dir: string, ports: Record<string, number>) => ProcSpec[] }} Target */
/** @typedef {import('./proctree.mjs').ProcRecord} ProcRecord */
/** @typedef {import('./proctree.mjs').StopResult} StopResult */
/** @typedef {{ name: string, pid: number, port: number, readyUrl: string, log: string }} ProcState */

/**
 * @typedef {object} State
 * @property {string} flowId
 * @property {'attach' | 'launch'} mode
 * @property {string} url
 * @property {string} session
 * @property {string} evidenceDir
 * @property {string} startedAt
 * @property {ProcState[]} procs
 * @property {TargetName} [target]
 * @property {string} [dir]
 * @property {boolean} [worktree]
 * @property {number} [port]
 * @property {number} [slot]
 * @property {PortEntry[]} [ports]
 * @property {ProcRecord[]} [tree]  every process the run was seen to start (proctree.mjs), each root first
 */

/** @typedef {{ name: string, status: 'pass' | 'fail' | 'warn' | 'skip', detail: string }} Check */

/**
 * What ng-inspect.js returns.
 * @typedef {object} PageFacts
 * @property {string | null} ngVersion
 * @property {string[]} roots
 * @property {boolean} devMode
 * @property {string[]} ngFunctions
 * @property {string[]} missingCore
 * @property {boolean} router
 * @property {boolean} zoneLoaded
 * @property {string | null} ngZone
 * @property {string[]} featureMarks
 */

/** @typedef {{ status: number | null, stdout: string, stderr: string }} Run */

const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(SKILL_DIR, '../../..');
const SCRATCH = path.join(REPO_ROOT, 'tmp', 'control-angular-dev-app');
const STATE_DIR = path.join(SCRATCH, 'state');
const INSPECT_JS = path.join(SKILL_DIR, 'scripts', 'ng-inspect.js');
const PORTAL_DEFAULT_DIR = 'D:\\projects\\github\\LayZeeDK\\HaasStefan__ng-journal-insurance-portal-ai-devtools';
// Fixed: the API takes PORT, but the portal frontend's BaseUrl token hardcodes http://localhost:3000/api/.
const PORTAL_API_PORT = 3000;
const PORTAL_API_PIN = 'libs/shared/utils/src/lib/injection-tokens.ts';
const SYSTEM32 = path.join(process.env['SystemRoot'] ?? 'C:\\Windows', 'System32');
// Node looks a bare program name up through Windows, which skips the current directory only when the looking process
// has the variable (measured: set in the child's env alone, a pwsh.exe planted in the cwd still ran). The servers
// this script starts inherit it.
process.env['NoDefaultCurrentDirectoryInExePath'] = '1';

/** @type {Record<TargetName, Target>} */
const TARGETS = {
  counter: {
    dir: path.join(REPO_ROOT, 'spikes', 'ng222-app'),
    marker: 'app-root',
    ports: () => [{ name: 'app', kind: 'derived', at: (slot) => (slot === 0 ? 4222 : 4300 + slot) }],
    procs: (dir, ports) => [
      { name: 'app', bin: binOf(dir, '@angular/cli', 'ng'), args: ['serve', '--port', String(ports['app'])], env: {}, port: Number(ports['app']), readyPath: '/' },
    ],
  },
  components: {
    dir: path.join(REPO_ROOT, 'spikes', 'ng222-app'),
    marker: 'app-root',
    ports: () => [{ name: 'app', kind: 'derived', at: (slot) => (slot === 0 ? 4224 : 4600 + slot) }],
    procs: (dir, ports) => [
      { name: 'app', bin: binOf(dir, '@angular/cli', 'ng'), args: ['serve', '--port', String(ports['app'])], env: {}, port: Number(ports['app']), readyPath: '/components' },
    ],
  },
  ssr: {
    dir: path.join(REPO_ROOT, 'spikes', 'ng222-ssr'),
    marker: 'app-root',
    ports: () => [{ name: 'app', kind: 'derived', at: (slot) => (slot === 0 ? 4223 : 4400 + slot) }],
    // HMR (the dev-server default) loads every @defer dependency eagerly (NG0751), which hides incremental hydration.
    procs: (dir, ports) => [
      { name: 'app', bin: binOf(dir, '@angular/cli', 'ng'), args: ['serve', '--port', String(ports['app']), '--no-hmr'], env: {}, port: Number(ports['app']), readyPath: '/' },
    ],
  },
  portal: {
    dir: process.env['CONTROL_NG_PORTAL_DIR'] || PORTAL_DEFAULT_DIR,
    marker: 'ng-journal-root',
    ports: (dir) => [
      { name: 'app', kind: 'derived', at: (slot) => (slot === 0 ? 4200 : 4500 + slot) },
      { name: 'api', kind: 'fixed', port: PORTAL_API_PORT, pin: `${pinOf(dir, PORTAL_API_PIN, `localhost:${PORTAL_API_PORT}`)} in the portal checkout ${dir}` },
      { name: 'pangular', kind: 'external', port: PANGULAR_PORT, owner: 'control-pangular-inspector, whose server the portal reaches through its /__pangular proxy' },
    ],
    procs: (dir, ports) => [
      // --inspect=false: the @nx/js:node executor otherwise opens the Node inspector on 9229 (measured), a port any other Node process may hold.
      { name: 'api', bin: binOf(dir, 'nx', 'nx'), args: ['run', 'api:serve', '--inspect=false'], env: { PORT: String(PORTAL_API_PORT) }, port: PORTAL_API_PORT, readyPath: '/api/customers' },
      { name: 'app', bin: binOf(dir, 'nx', 'nx'), args: ['run', 'insurance-portal:serve', `--port=${ports['app']}`], env: {}, port: Number(ports['app']), readyPath: '/' },
    ],
  },
};

/**
 * The ports table rows of a target in `dir` (exported for the tests).
 * @param {TargetName} name
 * @param {string} [dir]
 * @returns {PortRow[]}
 */
export function portRowsOf(name, dir = TARGETS[name].dir) {
  return TARGETS[name].ports(dir);
}

/**
 * @param {string} name
 * @returns {name is TargetName}
 */
function isTarget(name) {
  return Object.hasOwn(TARGETS, name);
}

// ---------- pure helpers (exported for the tests) ----------

/**
 * The value after `--<name>`: a string, true when the flag has no value, undefined when it is absent. Callers treat an
 * empty string as absent.
 * @param {string[]} args
 * @param {string} name
 * @returns {string | true | undefined}
 */
export function flagIn(args, name) {
  const i = args.indexOf(`--${name}`);

  if (i === -1) {
    return undefined;
  }

  const v = args[i + 1];

  return v === undefined || v.startsWith('--') ? true : v;
}

/**
 * Whether `dir` lies in a git worktree: the nearest `.git` is a file. No git at all counts as a main checkout.
 * @param {string} dir
 * @returns {boolean}
 */
export function isWorktree(dir) {
  for (let d = path.resolve(dir); ; d = path.dirname(d)) {
    const g = path.join(d, '.git');

    if (existsSync(g)) {
      return statSync(g).isFile();
    }

    if (path.dirname(d) === d) {
      return false;
    }
  }
}

// ---------- ports (SKILL.md, "Pick a flow") ----------

// Slot 0 is the main checkout's (the documented ports); a worktree hashes to one of 1 to SLOTS - 1.
const SLOTS = 100;
const SLOT_TRIES = 10;

/**
 * The checkout's own slot: 0 in a main checkout, else 1 to 99 from a hash of the folder, so it stays the same
 * from run to run.
 * @param {string} dir
 * @param {boolean} worktree
 * @returns {number}
 */
export function slotOf(dir, worktree) {
  if (!worktree) {
    return 0;
  }

  return 1 + (createHash('sha1').update(path.resolve(dir).toLowerCase()).digest().readUInt32BE(0) % (SLOTS - 1));
}

/**
 * The slots `up` tries, in order: `first`, then the next ones, 10 in all. From a worktree (`first` above 0) they
 * wrap within 1 to 99 and never reach slot 0.
 * @param {number} first
 * @returns {number[]}
 */
export function slotOrder(first) {
  return Array.from({ length: SLOT_TRIES }, (_, i) => (first === 0 ? i : 1 + ((first - 1 + i) % (SLOTS - 1))));
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
      const port = Number((m[1] ?? '').slice((m[1] ?? '').lastIndexOf(':') + 1));
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
 * `path:line` of the first line of `rel` (below `dir`) that contains `needle`; the bare path when none does.
 * @param {string} dir
 * @param {string} rel
 * @param {string} needle
 * @returns {string}
 */
export function pinOf(dir, rel, needle) {
  try {
    const i = readFileSync(path.join(dir, rel), 'utf8').split(/\r?\n/).findIndex((l) => l.includes(needle));

    return i === -1 ? rel : `${rel}:${i + 1}`;
  } catch {
    return rel;
  }
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
  const ports = rows.flatMap((r) => (r.kind === 'derived' ? slots.map((slot) => r.at(slot)) : [r.port]));

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
  const heldBy = (pids) => (pids.length === 0 ? 'held by a process the OS did not name' : `held by PID ${pids.join(', ')}`);
  /** @param {number} port */
  const holder = (port) => busy.get(port);

  for (const r of rows) {
    const pids = r.kind === 'fixed' ? holder(r.port) : undefined;

    if (r.kind === 'fixed' && pids !== undefined) {
      return { ok: false, reason: `fixed port ${r.name} ${r.port} ${heldBy(pids)}; pinned by ${r.pin}` };
    }
  }

  const main = rows.findIndex((r) => r.kind === 'derived');
  const forcedPids = forced === undefined ? undefined : holder(forced);

  if (forced !== undefined && forcedPids !== undefined) {
    return { ok: false, reason: `port ${forced} (--port) is ${heldBy(forcedPids)}; --port has no fallback` };
  }

  /** @type {(r: PortRow, i: number, slot: number) => number} */
  const portAt = (r, i, slot) => (r.kind !== 'derived' ? r.port : i === main && forced !== undefined ? forced : r.at(slot));
  /** @type {string[]} */
  const tried = [];

  for (const slot of order) {
    const taken = rows.flatMap((r, i) => {
      const pids = r.kind === 'derived' ? holder(portAt(r, i, slot)) : undefined;

      return pids === undefined ? [] : [`${r.name} ${portAt(r, i, slot)} ${heldBy(pids)}`];
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
        const why = pids !== undefined ? heldBy(pids) : order[0] === first ? `slot ${first} had ${tried[0]}` : 'taken after the check';

        return { name: r.name, port, kind: r.kind, reason: `fell back from ${from}: ${why}` };
      });

      return { ok: true, slot, ports };
    }

    tried.push(...taken);
  }

  return { ok: false, reason: `no free slot in ${order.length} tries (slots ${order.join(', ')}): ${tried.join(', ')}` };
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

    return foreign.length === 0 ? [] : [`${p.name} ${p.port} held by PID ${foreign.join(', ')}, not the recorded tree`];
  });

  if (problems.length > 0) {
    return { status: 'fail', detail: problems.join('; ') };
  }

  return { status: 'pass', detail: ports.map((p) => `${p.name} ${p.port} (${p.kind}${p.reason === undefined ? '' : `: ${p.reason}`})`).join(', ') };
}

/**
 * Same parse as control-pangular-inspector's authCode: the latest "auth code NNNNNN" in a server log.
 * @param {string} log
 * @returns {string | null}
 */
export function authCodeIn(log) {
  const all = [...log.replace(/\x1b\[[0-9;]*m/g, '').matchAll(/auth code\s+(\d{4,8})/g)];

  return all.at(-1)?.[1] ?? null;
}

/**
 * The error lines of a dev-server log. [vite] entries are runtime noise (proxy errors, the browser console forwarded
 * as "(client)"); console-errors covers the page. A proxy error carries its Error and stack on the following lines
 * (measured: "Error: read ECONNRESET" or "AggregateError [ECONNREFUSED]:" + "    at ..." around a Pangular server's
 * stop or start), so those belong to the [vite] entry. A forwarded client console error spans many lines (NG0500
 * prints the expected and actual DOM, then "Find more at .../NG0500"), so a [vite] entry runs until a line that
 * starts a new entry: a build error, a timestamped or [tag]-prefixed line, or a builder status line.
 * @param {string} log
 * @returns {string[]}
 */
export function buildLogErrors(log) {
  const entryStart = /\[ERROR\]|error TS\d+|^\[\w+\]|^\d\d\.\d\d\.\d\d |^[❯✔✘]|^Application bundle/;
  let inVite = false;

  return log.split(/\r?\n/).filter((raw) => {
    const l = raw.replace(/\x1b\[[0-9;]*m/g, '');

    if (l.includes('[vite]')) {
      inVite = true;

      return false;
    }

    if (inVite && !entryStart.test(l)) {
      return false;
    }

    inVite = false;

    return /\[ERROR\]|ERROR in|Error:|error TS\d+|NG\d{4}/.test(l);
  });
}

/**
 * Reads `playwright-cli console error` output: the total it reports and the error lines the dev-only Pangular
 * overlay logs (its /__connection.json probes, 404 with or without a server, and "[pangular] No devtools server
 * found" when nothing answers behind the /__pangular proxy).
 * @param {string} stdout
 * @returns {{ total: number, pangular: string[], others: number }}  total is NaN when the output names none
 */
export function consoleErrors(stdout) {
  const total = Number(/Errors: (\d+)/.exec(stdout)?.[1] ?? NaN);
  const pangular = stdout.split(/\r?\n/).filter((l) => l.startsWith('[ERROR]') && /__connection\.json|\[pangular\]/.test(l));

  return { total, pangular, others: total - pangular.length };
}

/**
 * The change-detection mode from the NgZone provider record ng-inspect.js found.
 * @param {string | null} ngZone
 * @returns {string}
 */
export function cdMode(ngZone) {
  return ngZone === 'NoopNgZone' ? 'zoneless' : ngZone ? 'zone-based' : 'unknown (no NgZone provider record found)';
}

/**
 * The port a URL reaches: its own, else the scheme's default. Throws on an invalid URL.
 * @param {string} url
 * @returns {number}
 */
export function urlPort(url) {
  const u = new URL(url);

  return Number(u.port || (u.protocol === 'https:' ? 443 : 80));
}

/**
 * `up`'s `--timeout` in milliseconds. Throws when the flag has no value or the value is not a positive, finite number.
 * @param {string[]} args
 * @param {number} defaultSeconds
 * @returns {number}
 */
export function timeoutMsOf(args, defaultSeconds) {
  const v = flagIn(args, 'timeout');

  if (v === true) {
    throw new Error('--timeout needs a value');
  }

  const s = v === undefined || v === '' ? defaultSeconds : Number(v);

  if (!(Number.isFinite(s) && s > 0)) {
    throw new Error(`--timeout ${v} is not a positive number of seconds`);
  }

  return s * 1000;
}

/**
 * The current tab's URL in playwright-cli `tab-list` output (`- 0: (current) [<title>](<url>)`), or null. tab-list
 * answers while a prompt is open; snapshot then refuses and names no URL (measured 2026-10-17).
 * @param {string} tabList
 * @returns {string | null}
 */
export function currentTabUrl(tabList) {
  return tabList.match(/^- \d+: \(current\) \[.*\]\((\S+)\)\s*$/m)?.[1] ?? null;
}

/**
 * Whether two URLs have the same origin; false when either is missing or invalid.
 * @param {string | null} a
 * @param {string | null} b
 * @returns {boolean}
 */
function sameOrigin(a, b) {
  try {
    return a !== null && b !== null && new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}

/**
 * The playwright-cli command that answers the Pangular overlay's code prompt. The one-time code of the devtools server
 * goes only to a page on the portal's own origin, the one target whose dev server proxies /__pangular to it; any other
 * page's prompt (another origin, another target, an --url attach) is dismissed.
 * @param {string | undefined} target
 * @param {string | null} otp
 * @param {string | null} pageUrl  the URL of the page that shows the prompt
 * @param {string} appUrl  the run's app URL
 * @returns {string[]}
 */
export function authReply(target, otp, pageUrl, appUrl) {
  return target === 'portal' && otp && sameOrigin(pageUrl, appUrl) ? ['dialog-accept', otp] : ['dialog-dismiss'];
}

/**
 * The `pangular-auth` check for the reply authReply chose and how playwright-cli ran it. The code itself never appears
 * in the detail, also when playwright-cli echoes it in an error.
 * @param {string | undefined} target
 * @param {string | null} otp
 * @param {string | null} pageUrl
 * @param {string} appUrl
 * @param {string | null} logName  the server log the code came from
 * @param {Run} reply
 * @returns {Check}
 */
export function authCheck(target, otp, pageUrl, appUrl, logName, reply) {
  const name = 'pangular-auth';

  if (target !== 'portal') {
    return { name, status: 'warn', detail: 'dismissed a code prompt on a page that is not the portal; the one-time code goes only to the portal' };
  }

  if (!sameOrigin(pageUrl, appUrl)) {
    return { name, status: 'warn', detail: `dismissed a code prompt on ${pageUrl ?? 'a page whose URL the snapshot did not name'}, not on the portal's origin; the one-time code goes only there` };
  }

  if (!otp) {
    return { name, status: 'warn', detail: `dismissed the overlay's code prompt: no control-pangular-inspector state file with a code for port ${PANGULAR_PORT}` };
  }

  if (reply.status !== 0) {
    const error = (reply.stderr || reply.stdout).split(otp).join('<code>').trim().slice(0, 200);

    return { name, status: 'warn', detail: `found the one-time code in ${logName}, but dialog-accept failed: ${error}` };
  }

  return { name, status: 'pass', detail: `entered the one-time code from ${logName} into the overlay prompt` };
}

/**
 * The `app-marker` check: the target's root tag is on the page. A page with no Angular root fails it too.
 * @param {string[]} roots
 * @param {string} marker
 * @returns {Check}
 */
export function markerCheck(roots, marker) {
  return roots.includes(marker)
    ? { name: 'app-marker', status: 'pass', detail: `root <${marker}> present` }
    : { name: 'app-marker', status: 'fail', detail: `expected root <${marker}>, found ${roots.length ? `<${roots.join('>, <')}>` : 'no Angular root'}` };
}

/**
 * One human-readable doctor line. Page text (ng-version, mark details, playwright-cli output) can hold control
 * characters, so they are escaped rather than written to the terminal.
 * @param {Check} c
 * @returns {string}
 */
export function checkLine(c) {
  const tag = c.status === 'pass' ? '[OK]' : c.status === 'skip' ? '[SKIP]' : c.status === 'warn' ? '[WARN]' : '[ERROR]';

  return `${tag} ${c.name}: ${printable(c.detail)}`;
}

/**
 * Each started process with its recorded root: the `tree` record with its PID, or none when `up` never saw it run.
 * @param {State} state
 * @returns {{ proc: ProcState, root: ProcRecord | undefined }[]}
 */
export function rootsOf(state) {
  return state.procs.map((proc) => ({ proc, root: (state.tree ?? []).find((r) => r.pid === proc.pid) }));
}

/**
 * The live tree below each recorded root now, from one process table read: empty for a root that is gone or whose
 * PID another process holds.
 * @param {State} state
 * @param {() => ProcRecord[]} [table]
 * @returns {Map<number, ProcRecord[]>}  keyed by the root's PID
 */
export function liveTrees(state, table = processTable) {
  const rows = table();

  return new Map(rootsOf(state).map(({ proc, root }) => [proc.pid, root === undefined ? [] : snapshot(root, { table: () => rows })]));
}

/**
 * Stops every process the run recorded, through proctree.mjs: a last snapshot below each root while the parents
 * still live, merged into the record, then `stop`.
 * @param {State} state
 * @param {{ table?: () => ProcRecord[], stop?: (records: ProcRecord[]) => StopResult }} [deps]
 * @returns {{ records: ProcRecord[], result: StopResult }}
 */
export function stopRun(state, { table = processTable, stop: stopRecords = stop } = {}) {
  const records = merge(state.tree ?? [], [...liveTrees(state, table).values()].flat());

  return { records, result: stopRecords(records) };
}

/**
 * What `down` reports for a stop result. Exit 2 when a root's PID now belongs to another process (that one is never
 * touched) or a record still runs after the last round; any other refusal is only noted.
 * @param {State} state
 * @param {StopResult} result
 * @returns {{ code: 0 | 2, notes: string[], reason: string | null }}
 */
export function downOutcome(state, result) {
  // A state file written before proctree.mjs records no tree: stopping nothing and removing it would lose the run.
  if (state.procs.length > 0 && state.tree === undefined) {
    return { code: 2, notes: [], reason: `refused: the state file records no process tree (written before proctree.mjs); nothing stopped: check PID(s) ${state.procs.map((p) => p.pid).join(', ')} by hand, then delete the state file` };
  }

  /** @type {Map<string, string>} */
  const roots = new Map(rootsOf(state).flatMap(({ proc, root }) => (root === undefined ? [] : [[`${root.pid}@${root.start}`, proc.name]])));
  /** @type {string[]} */
  const reasons = [];
  const notes = [
    ...result.stopped.map((r) => `stopped ${describe(r)}`),
    ...result.gone.map((r) => `${describe(r)} was not running`),
  ];

  for (const r of result.refused) {
    const root = roots.get(`${r.pid}@${r.start}`);

    if (r.reason === 'reused' && root !== undefined) {
      reasons.push(`refused: PID ${r.pid} (${root}) now belongs to another process (its start time or command line differs from the state file); not stopping a process this skill did not start`);
    } else if (r.reason === 'survived') {
      reasons.push(`${describe(r)} still runs after the last round; run down again`);
    } else {
      notes.push(`left ${r.reason === 'reused' ? `PID ${r.pid}` : describe(r)} alone: ${r.reason === 'reused' ? 'it now belongs to another process' : r.reason === 'helper' ? 'a shared helper (the Nx daemon), never stopped' : 'it runs this script'}`);
    }
  }

  return reasons.length === 0 ? { code: 0, notes, reason: null } : { code: 2, notes, reason: `${reasons.join('; ')}; the state file is kept` };
}

/**
 * The flow id the arguments name: `url-<port>` for `--url`, the target's name for `--target` (one instance per
 * target per checkout), else null (the caller then looks at the state files). Throws on an unknown target or an
 * invalid `--url`.
 * @param {string[]} args
 * @returns {string | null}
 */
export function flowIdFor(args) {
  const url = flagIn(args, 'url');
  const target = flagIn(args, 'target');

  if (typeof url === 'string' && url !== '') {
    return `url-${urlPort(url)}`;
  }

  if (typeof target === 'string' && target !== '') {
    if (!isTarget(target)) {
      throw new Error(`unknown target "${target}"; use counter, components, ssr or portal`);
    }

    return target;
  }

  return null;
}

// ---------- process and tool access ----------

/**
 * @param {string} dir
 * @param {string} pkg
 * @param {string} binName
 * @returns {string | null}
 */
function binOf(dir, pkg, binName) {
  const pj = path.join(dir, 'node_modules', pkg, 'package.json');

  if (!existsSync(pj)) {
    return null;
  }

  const manifest = /** @type {{ bin?: string | Record<string, string> }} */ (JSON.parse(readFileSync(pj, 'utf8')));
  const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.[binName];

  return bin === undefined ? null : path.join(dir, 'node_modules', pkg, bin);
}

/** The loopback addresses this skill's servers are reached on; the bind probe tries each. */
const LOOPBACKS = ['127.0.0.1', '::1'];

/**
 * Whether a listener holds `port` on a loopback address, decided by binding it: EADDRINUSE is a listener, and a bind
 * that succeeds is closed at once and means free. Any other error (a host without that address) holds nothing.
 * @param {number} port
 * @returns {Promise<boolean>}
 */
async function heldOnLoopback(port) {
  for (const host of LOOPBACKS) {
    /** @type {boolean} */
    const held = await new Promise((resolve) => {
      const server = createServer();

      server.once('error', (error) => resolve(/** @type {NodeJS.ErrnoException} */ (error).code === 'EADDRINUSE'));
      server.listen({ host, port, exclusive: true }, () => server.close(() => resolve(false)));
    });

    if (held) {
      return true;
    }
  }

  return false;
}

/**
 * The PIDs `netstat` names for the listening ports it reports (IPv4 and IPv6). Naming only: which table a host exposes
 * is its business, and a host whose netstat reports only the host table names none of them, so this may say nothing.
 * @returns {Map<number, number[]>}
 */
function namedHolders() {
  const netstat = path.join(SYSTEM32, 'netstat.exe');

  return listeners(['TCP', 'TCPv6'].map((proto) => spawnSync(netstat, ['-ano', '-p', proto], { encoding: 'utf8', windowsHide: true }).stdout).join('\n'));
}

/**
 * Which of `ports` a listener holds now, decided by binding each on the loopback addresses. Presence in the map is the
 * answer; the values are the PIDs `netstat` names, and it may name none: a port held by a process the OS will not name
 * is still busy.
 * @param {number[]} ports
 * @returns {Promise<Map<number, number[]>>}
 */
export async function busyPorts(ports) {
  /** @type {Map<number, number[]>} */
  const busy = new Map();

  for (const port of new Set(ports)) {
    if (await heldOnLoopback(port)) {
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
 * Runs playwright-cli through node, from the npm shim's folder on PATH (absolute PATH entries only).
 * @param {string[]} args
 * @returns {Run}
 */
function playwrightCli(args) {
  const shimDir = (process.env['PATH'] ?? '').split(path.delimiter).find((d) => path.isAbsolute(d) && existsSync(path.join(d, 'playwright-cli.cmd')));
  const js = shimDir && path.join(shimDir, 'node_modules', '@playwright', 'cli', 'playwright-cli.js');

  if (!js || !existsSync(js)) {
    return { status: 127, stdout: '', stderr: 'playwright-cli not found on PATH' };
  }

  const r = spawnSync(process.execPath, [js, ...args], { cwd: REPO_ROOT, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });

  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The portal proxies /__pangular to this port (proxy.conf.json); control-pangular-inspector writes its state here.
const PANGULAR_PORT = 9999;
const PANGULAR_STATE = path.join(REPO_ROOT, 'tmp', 'control-pangular-inspector', 'state', `pangular-${PANGULAR_PORT}.json`);

/**
 * The Pangular devtools server behind PANGULAR_PORT, as far as the port and control-pangular-inspector's state file
 * tell it: whether a listener holds the port (the bind probe), the PID the OS names for it (it may name none), and the
 * state file's log.
 * @returns {Promise<{ held: boolean, pid: number | null, log: string | null }>}
 */
async function pangularServer() {
  /** @type {string | null} */
  let log = null;

  try {
    log = /** @type {{ log?: string }} */ (JSON.parse(readFileSync(PANGULAR_STATE, 'utf8'))).log ?? null;
  } catch {
    // no server started by control-pangular-inspector
  }

  const held = await busyPorts([PANGULAR_PORT]);

  return { held: held.has(PANGULAR_PORT), pid: held.get(PANGULAR_PORT)?.[0] ?? null, log };
}

/**
 * @param {string} url
 * @param {number} [timeoutMs]
 * @returns {Promise<{ status: number, body: string }>}
 */
async function fetchText(url, timeoutMs = 3000) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });

    return { status: res.status, body: await res.text() };
  } catch (e) {
    const error = /** @type {Error & { cause?: { code?: string } }} */ (e);

    return { status: 0, body: String(error.cause?.code ?? error.message) };
  }
}

// ---------- CLI ----------

const argv = process.argv.slice(2);
const cmd = argv[0];
const JSON_OUT = argv.includes('--json');
/** @param {string} name */
const flag = (name) => flagIn(argv, name);

/**
 * @param {{ checks?: Check[] } & Record<string, unknown>} result
 * @param {number} code
 * @returns {never}
 */
function out(result, code) {
  if (JSON_OUT) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    for (const c of result.checks ?? []) {
      process.stdout.write(`${checkLine(c)}\n`);
    }

    const { checks, ...rest } = result;
    process.stdout.write(`${code === 0 ? '[OK]' : '[ERROR]'} ${JSON.stringify(rest)}\n`);
  }

  process.exit(code);
}

/**
 * @param {number} code
 * @param {string} reason
 * @param {Record<string, unknown>} [extra]
 * @returns {never}
 */
function fail(code, reason, extra = {}) {
  return out({ ok: false, command: cmd, reason, ...extra }, code);
}

/** @param {string} flowId */
function statePath(flowId) {
  return path.join(STATE_DIR, `${flowId}.json`);
}

/** @returns {string} */
function resolveFlow() {
  /** @type {string | null} */
  let named;

  try {
    named = flowIdFor(argv);
  } catch (error) {
    return fail(2, error instanceof Error ? error.message : String(error));
  }

  if (named !== null) {
    return named;
  }

  const files = existsSync(STATE_DIR) ? readdirSync(STATE_DIR).filter((f) => f.endsWith('.json')) : [];

  if (files.length === 1 && files[0] !== undefined) {
    return files[0].slice(0, -5);
  }

  return fail(2, files.length === 0 ? 'no state file: nothing was started by this skill (run up first)' : `several flows are running (${files.join(', ')}); pass --target or --url`);
}

/**
 * @param {string} flowId
 * @returns {State}
 */
function readState(flowId) {
  const p = statePath(flowId);

  if (!existsSync(p)) {
    fail(2, `no state file for flow ${flowId} at ${p}: nothing to act on (run up first)`);
  }

  return /** @type {State} */ (JSON.parse(readFileSync(p, 'utf8')));
}

/**
 * The main port of a ports table: its first derived row in slot 0, else its first row.
 * @param {PortRow[]} rows
 * @returns {number}
 */
function mainPortOf(rows) {
  const r = rows.find((x) => x.kind === 'derived') ?? rows[0];

  return r === undefined ? NaN : r.kind === 'derived' ? r.at(0) : r.port;
}


/**
 * Whether another process took a started process's port after planPorts checked it: a holder outside the started
 * tree (it may answer the readiness probe first), or, once the process exited, a port error in its own log.
 * @param {number[]} holders  the PIDs listening on the port now
 * @param {Set<number>} tree  the started process and its descendants
 * @param {boolean} exited
 * @param {string} log  this attempt's log only
 * @returns {{ pid: number | null } | null}
 */
export function takenBy(holders, tree, exited, log) {
  const foreign = holders.find((pid) => !tree.has(pid));

  if (foreign !== undefined) {
    return { pid: foreign };
  }

  return exited && /already in use|EADDRINUSE/.test(log) ? { pid: null } : null;
}

/**
 * Starts the run's processes one at a time and waits until each answers. Null when all are ready; the port entry
 * (and its holder, when one listens) when another process took a port after planPorts checked it. Any other
 * failure exits through fail(). Each attempt writes its own logs, so a retry never reads the last one's errors.
 * @param {State} state
 * @param {ProcSpec[]} specs
 * @param {string} marker
 * @param {number} attempt  0 for the first
 * @param {number} t0
 * @param {number} timeoutMs
 * @returns {Promise<{ entry: PortEntry, pid: number | null } | null>}
 */
async function launch(state, specs, marker, attempt, t0, timeoutMs) {
  const sp = statePath(state.flowId);

  // One at a time: two cold `nx run` processes started together timed out in the Nx plugin worker (3 of 4 portal runs, 2026-10-11).
  for (const p of specs) {
    /** @type {NodeJS.ProcessEnv} */
    const env = { ...process.env, NX_TUI: 'false', NG_CLI_ANALYTICS: 'false', ...p.env };

    if (!('PORT' in p.env)) {
      delete env['PORT']; // measured: the Angular dev server serves on $PORT and ignores --port when PORT is set
    }

    const log = path.join(state.evidenceDir, `${p.name}${attempt === 0 ? '' : `-${attempt + 1}`}.log`);
    const fd = openSync(log, 'a');
    const notBefore = Date.now();
    const child = spawn(process.execPath, [/** @type {string} */ (p.bin), ...p.args], { cwd: state.dir, env, detached: true, stdio: ['ignore', fd, fd], windowsHide: true });
    const notAfter = Date.now();
    child.unref();

    if (child.pid === undefined) {
      fail(2, `${p.name} did not start; see ${log}`);
    }

    const first = snapshot(child.pid, { notBefore, notAfter });
    const root = first[0];
    /** @type {ProcState} */
    const s = { name: p.name, pid: child.pid, port: p.port, readyUrl: `http://localhost:${p.port}${p.readyPath}`, log };
    state.procs.push(s);
    state.tree = merge(state.tree ?? [], first);
    writeFileSync(sp, JSON.stringify(state, null, 2));

    for (;;) {
      // A first SSR render compiles on demand; aborting it at 3 s logs an AbortError in the server log (measured).
      const r = await fetchText(s.readyUrl, 60000);
      const pageOk = s.name !== 'app' || (r.status === 200 && r.body.includes(`<${marker}`));
      const answered = r.status >= 200 && r.status < 500 && pageOk;
      const live = root === undefined ? [] : snapshot(root);
      const exited = live.length === 0;
      const seen = merge(state.tree ?? [], live);

      // Every poll's snapshot is kept, so a run that fails before it is ready leaves down its whole tree.
      if (seen.length !== (state.tree ?? []).length) {
        state.tree = seen;
        writeFileSync(sp, JSON.stringify(state, null, 2));
      }

      const entry = (state.ports ?? []).find((e) => e.port === s.port);
      const taken = answered || exited ? takenBy((await busyPorts([s.port])).get(s.port) ?? [], new Set(live.map((x) => x.pid)), exited, readFileSync(s.log, 'utf8')) : null;

      if (taken !== null && entry !== undefined) {
        return { entry, pid: taken.pid };
      }

      if (answered) {
        break;
      }

      if (exited) {
        fail(2, `${s.name} (PID ${s.pid}) exited before it was ready; see ${s.log}; run down to clear the state`, { state: sp });
      }

      if (Date.now() - t0 > timeoutMs) {
        fail(2, `${s.name} not ready after ${timeoutMs / 1000}s at ${s.readyUrl}; see ${s.log}; run down`, { state: sp });
      }

      await sleep(500);
    }
  }

  return null;
}

async function up() {
  const url = flag('url');
  mkdirSync(STATE_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');

  if (typeof url === 'string' && url !== '') {
    const flowId = resolveFlow();

    if (existsSync(statePath(flowId))) {
      fail(2, `flow ${flowId} already has a state file; run down first`, { state: statePath(flowId) });
    }

    const evidenceDir = path.join(SCRATCH, `${flowId}-${stamp}`);
    mkdirSync(evidenceDir, { recursive: true });
    const res = await fetchText(url);

    if (res.status === 0) {
      fail(2, `nothing answers at ${url} (${res.body})`);
    }

    const ports = [{ name: 'app', port: urlPort(url), kind: /** @type {PortKind} */ ('external'), reason: 'attached with --url; this skill did not start it' }];
    /** @type {State} */
    const state = { flowId, mode: 'attach', url, ports, session: `control-ngdev-${flowId}`, evidenceDir, startedAt: new Date().toISOString(), procs: [] };
    writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));
    out({ ok: true, command: 'up', ...state }, 0);
  }

  const targetName = flag('target');

  if (typeof targetName !== 'string' || !isTarget(targetName)) {
    return fail(2, 'up needs --target counter|components|ssr|portal, or --url <dev-server URL> to attach to a running app');
  }

  const t = TARGETS[targetName];
  const dirFlag = flag('dir');
  const dir = typeof dirFlag === 'string' && dirFlag !== '' ? dirFlag : t.dir;
  // A worktree session never takes slot 0, also for a target folder outside it (the portal, --dir).
  const worktree = isWorktree(dir) || isWorktree(REPO_ROOT);
  const rows = t.ports(dir);
  const portFlag = flag('port');
  const forced = typeof portFlag === 'string' && portFlag !== '' ? Number(portFlag) : undefined;

  if (portFlag === true) {
    fail(2, 'refused: --port needs a value');
  }

  if (forced !== undefined && !(Number.isInteger(forced) && forced > 0 && forced < 65536)) {
    fail(2, `refused: --port ${portFlag} is not a port number`);
  }

  const other = rows.find((r) => r.kind !== 'derived' && r.port === forced);

  if (other !== undefined) {
    fail(2, `refused: --port ${forced} is the ${other.kind} port ${other.name} of this flow`);
  }

  if (worktree && forced === mainPortOf(rows)) {
    fail(2, `refused: ${dir} is a git worktree and port ${forced} is the main checkout's documented port; use the derived port or --url on purpose`);
  }

  /** @type {number} */
  let timeoutMs;

  try {
    timeoutMs = timeoutMsOf(argv, 240);
  } catch (error) {
    return fail(2, `refused: ${error instanceof Error ? error.message : String(error)}`);
  }

  const flowId = targetName;

  if (existsSync(statePath(flowId))) {
    fail(2, `flow ${flowId} already has a state file; run down first`, { state: statePath(flowId) });
  }

  for (const p of t.procs(dir, {})) {
    if (!p.bin || !existsSync(p.bin)) {
      fail(2, `cannot find the CLI for ${p.name} under ${dir}/node_modules (install dependencies first)`);
    }
  }

  const evidenceDir = path.join(SCRATCH, `${flowId}-${stamp}`);
  const t0 = Date.now();
  let order = slotOrder(slotOf(dir, worktree));
  const first = order[0];
  let attempt = 0;

  for (;;) {
    const plan = planPorts(rows, order, await busyPorts(candidatePorts(rows, order, forced, first)), forced, first);

    if (!plan.ok) {
      return fail(2, `refused: ${plan.reason}`);
    }

    mkdirSync(evidenceDir, { recursive: true });
    const ports = Object.fromEntries(plan.ports.map((p) => [p.name, p.port]));
    const port = Number(ports['app']);
    /** @type {State} */
    const state = { flowId, mode: 'launch', target: targetName, dir, worktree, url: `http://localhost:${port}/`, port, slot: plan.slot, ports: plan.ports, session: `control-ngdev-${flowId}-${port}`, evidenceDir, startedAt: new Date().toISOString(), procs: [] };
    const busy = await launch(state, t.procs(dir, ports), t.marker, attempt, t0, timeoutMs);
    attempt += 1;

    if (busy === null) {
      state.tree = merge(state.tree ?? [], [...liveTrees(state).values()].flat());
      writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));
      out({ ok: true, command: 'up', readyInSeconds: Math.round((Date.now() - t0) / 100) / 10, ...state }, 0);
    }

    // Another process took a port after the check: stop what this attempt started, then try the next slot.
    const { records, result } = stopRun(state);
    const stopped = downOutcome(state, result);

    if (stopped.code !== 0) {
      state.tree = records;
      writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));
      fail(2, `${busy.entry.name} ${busy.entry.port} was taken after the check, and stopping this attempt failed: ${stopped.reason}; run down`, { state: statePath(flowId), notes: stopped.notes });
    }

    rmSync(statePath(flowId), { force: true });
    const taken = `${busy.entry.name} ${busy.entry.port} was taken ${busy.pid === null ? 'by another process' : `by PID ${busy.pid}`} after the check`;

    if (busy.entry.kind === 'fixed') {
      fail(2, `refused: fixed port ${busy.entry.name} ${busy.entry.port} held by ${busy.pid === null ? 'another process' : `PID ${busy.pid}`}; pinned by ${busy.entry.reason}`);
    }

    if (forced !== undefined && busy.entry.port === forced) {
      fail(2, `refused: port ${forced} (--port) ${taken}; --port has no fallback`);
    }

    order = order.slice(order.indexOf(plan.slot) + 1);

    if (order.length === 0) {
      fail(2, `refused: ${taken}, and none of the ${SLOT_TRIES} slots is left`);
    }
  }
}

async function doctor() {
  const flowId = resolveFlow();
  const state = readState(flowId);
  /** @type {Check[]} */
  const checks = [];
  /** @type {(name: string, status: Check['status'], detail: string) => void} */
  const add = (name, status, detail) => {
    checks.push({ name, status, detail });
  };
  const target = state.target === undefined ? undefined : TARGETS[state.target];
  const fresh = mapFresh(SKILL_DIR);
  add('map-fresh', fresh.status, fresh.detail);

  if (state.mode === 'attach' || state.target === undefined) {
    add('process-alive', 'skip', 'attached with --url; this skill did not start the server');
    add('ports', 'skip', '--url given; ownership not checked');
    add('build-log', 'skip', 'attached with --url; no build log');
  } else {
    if (state.worktree && state.port === mainPortOf(portRowsOf(state.target, state.dir))) {
      fail(2, 'refused: worktree flow points at the main checkout port');
    }

    const trees = liveTrees(state);
    /** @type {Set<number>} */
    const tree = new Set();

    for (const { proc: p, root } of rootsOf(state)) {
      const live = trees.get(p.pid) ?? [];
      add(`process-alive:${p.name}`, live.length > 0 ? 'pass' : 'fail', root !== undefined && live.length > 0 ? `PID ${p.pid} running since ${new Date(root.start).toISOString()}` : `PID ${p.pid} is gone or reused`);
      live.forEach((r) => tree.add(r.pid));
    }

    const recorded = merge(state.tree ?? [], [...trees.values()].flat());

    // Written only while the state file is there and the record changed: a down that just removed it stays done.
    if (existsSync(statePath(flowId)) && JSON.stringify(recorded) !== JSON.stringify(state.tree ?? [])) {
      state.tree = recorded;
      writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));
    }

    add('tree', 'pass', `${recorded.length} process(es) recorded for down`);
    // A state file written before ports were recorded: check the ports its processes record.
    /** @type {PortEntry[]} */
    const recordedPorts = state.ports ?? state.procs.map((p) => ({ name: p.name, port: p.port, kind: /** @type {PortKind} */ ('derived') }));
    const ports = portsCheck(recordedPorts, await busyPorts(recordedPorts.map((p) => p.port)), tree);
    add('ports', ports.status, ports.detail);

    for (const p of state.procs) {
      const errLines = buildLogErrors(existsSync(p.log) ? readFileSync(p.log, 'utf8') : '');
      add(`build-log:${p.name}`, errLines.length === 0 ? 'pass' : 'fail', errLines.length === 0 ? 'no error lines in the server log' : errLines.slice(0, 3).join(' | '));
    }
  }

  // Page checks through the run's own playwright-cli session.
  const s = state.session;
  const pangular = await pangularServer();
  // With a Pangular server behind /__pangular the overlay opens a prompt for its one-time code, at a moment of its
  // own choosing, and every playwright-cli command fails on the modal state until it is answered. Answer it the way
  // control-pangular-inspector does: read the code from that skill's server log; dismiss it when no code is known.
  let authNoted = false;
  /** @type {(args: string[]) => Run} */
  const pw = (args) => {
    let res = playwrightCli([`-s=${s}`, ...args]);

    // Only run-code and eval errors omit the dialog text; tab-list names it and the current tab's URL (measured).
    for (let i = 0; i < 3 && /modal state/i.test(res.stdout + res.stderr); i++) {
      const tabs = playwrightCli([`-s=${s}`, 'tab-list']).stdout;

      if (!/authentication code/i.test(tabs)) {
        break;
      }

      const pageUrl = currentTabUrl(tabs);
      const otp = pangular.log && existsSync(pangular.log) ? authCodeIn(readFileSync(pangular.log, 'utf8')) : null;
      const reply = playwrightCli([`-s=${s}`, ...authReply(state.target, otp, pageUrl, state.url)]);

      if (!authNoted) {
        checks.push(authCheck(state.target, otp, pageUrl, state.url, pangular.log && path.basename(pangular.log), reply));
        authNoted = true;
      }

      res = playwrightCli([`-s=${s}`, ...args]);
    }

    return res;
  };
  pw(['--raw', 'eval', '() => 1']); // a prompt left open by an earlier command would block goto
  let r = pw(['goto', state.url]);

  if (r.status !== 0 || /not open|is not running|No browser/i.test(r.stdout + r.stderr)) {
    r = pw(['open', state.url]);
  }

  if (r.status !== 0) {
    add('browser-session', 'fail', `could not open playwright-cli session ${s}: ${(r.stderr || r.stdout).slice(0, 300)}`);

    return out({ ok: false, command: 'doctor', flowId, checks }, 2);
  }

  add('browser-session', 'pass', `session ${s} on ${state.url}`);
  r = pw(['--raw', 'run-code', `--filename=${INSPECT_JS}`]);
  /** @type {PageFacts} */
  let page;

  try {
    page = /** @type {PageFacts} */ (JSON.parse(r.stdout.trim()));
  } catch {
    add('page-probe', 'fail', `inspect helper did not return JSON: ${(r.stdout + r.stderr).slice(0, 300)}`);

    return out({ ok: false, command: 'doctor', flowId, checks }, 1);
  }

  add('angular-root', page.ngVersion ? 'pass' : 'fail', page.ngVersion ? `[ng-version="${page.ngVersion}"] on <${page.roots.join('>, <')}>` : 'no [ng-version] element: not an Angular app or not bootstrapped');

  if (target) {
    checks.push(markerCheck(page.roots, target.marker));
  }

  add('dev-build', page.devMode ? 'pass' : 'fail', page.devMode ? `window.ng has ${page.ngFunctions.length} functions` : 'window.ng missing: production build (or ngDevMode=false); ng.* recipes will not work');

  if (page.devMode) {
    add('ng-core-functions', page.missingCore.length === 0 ? 'pass' : 'warn', page.missingCore.length === 0 ? 'all public and injector/signal functions present' : `missing: ${page.missingCore.join(', ')}`);
    add('router-globals', page.router ? 'pass' : 'warn', page.router ? 'ɵgetRouterInstance, ɵgetLoadedRoutes, ɵnavigateByUrl present (provideRouter)' : 'router globals absent (no provideRouter, or RouterModule.forRoot): router recipes unavailable');
  }

  add('change-detection-mode', 'pass', `${cdMode(page.ngZone)} (NgZone provider: ${page.ngZone ?? 'none'}); zone.js ${page.zoneLoaded ? 'loaded' : 'not loaded'}; mark_feature_usage: ${page.featureMarks.join(', ') || 'none'}`);
  const consoleOut = pw(['console', 'error']).stdout;
  const errors = consoleErrors(consoleOut);

  if (errors.pangular.length > 0) {
    const noServer = errors.pangular.some((l) => l.includes('No devtools server found'));
    const listener = pangular.held ? (pangular.pid === null ? `a process the OS did not name listens on ${PANGULAR_PORT}` : `PID ${pangular.pid} listens on ${PANGULAR_PORT}`) : `nothing listens on ${PANGULAR_PORT}`;
    add('pangular-overlay', 'warn', noServer ? `${errors.pangular.length} console error(s) from the Pangular overlay: it found no devtools server behind /__pangular (${listener}); start one with control-pangular-inspector for live Pangular data` : `${errors.pangular.length} console error(s) from the Pangular overlay's /__connection.json probes, expected while a devtools server runs behind /__pangular (${listener})`);
  }

  const besides = errors.pangular.length ? ' besides the Pangular overlay' : '';
  add('console-errors', errors.others === 0 ? 'pass' : 'fail', errors.others === 0 ? `no console errors since load${besides}` : Number.isNaN(errors.others) ? `could not read the console: ${consoleOut.slice(0, 200)}` : `${errors.others} console error(s)${besides}; run playwright-cli -s=${s} console error`);

  const failed = checks.filter((c) => c.status === 'fail');
  out({ ok: failed.length === 0, command: 'doctor', flowId, url: state.url, session: s, ngVersion: page.ngVersion, checks }, failed.length === 0 ? 0 : 1);
}

function info() {
  const flowId = resolveFlow();
  const state = readState(flowId);
  out({ ok: true, command: 'info', statePath: statePath(flowId), ...state }, 0);
}

function down() {
  const flowId = resolveFlow();
  const sp = statePath(flowId);
  const state = readState(flowId);
  const close = playwrightCli([`-s=${state.session}`, 'close']);
  const { records, result } = stopRun(state);
  const outcome = downOutcome(state, result);
  const notes = [`session ${state.session}: ${close.status === 0 ? 'closed' : 'was not open'}`, ...outcome.notes];

  if (outcome.code !== 0) {
    state.tree = records;
    writeFileSync(sp, JSON.stringify(state, null, 2));
    out({ ok: false, command: 'down', flowId, evidenceDir: state.evidenceDir, notes, reason: outcome.reason, state: sp }, outcome.code);
  }

  rmSync(sp, { force: true });
  out({ ok: true, command: 'down', flowId, evidenceDir: state.evidenceDir, notes }, 0);
}

/** @type {Record<string, () => void | Promise<void>>} */
const commands = { up, doctor, info, down };

// import.meta.url is the real path, so compare real paths: run through a link, the CLI still runs.
if (process.argv[1] && realpathSync.native(path.resolve(process.argv[1])) === realpathSync.native(fileURLToPath(import.meta.url))) {
  const run = cmd !== undefined && Object.hasOwn(commands, cmd) ? commands[cmd] : undefined;

  if (run === undefined) {
    process.stdout.write('usage: control.mjs <up|doctor|info|down> [--target counter|ssr|portal] [--url <url>] [--port N] [--dir <path>] [--timeout S] [--json]\n');
    process.exit(2);
  }

  await run();
}
