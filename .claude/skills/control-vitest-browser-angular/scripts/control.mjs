#!/usr/bin/env node
// @ts-check
// Control script for control-vitest-browser-angular: up, doctor, info, down.
// Runs the counter fixture's Vitest Browser Mode tests in watch mode, either attached to a per-model instance
// from control-ai-browsers (default) or in Playwright's bundled Chromium (--bundled). Deterministic steps only;
// driving stays in playwright-cli.
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mapFresh, printable } from './fingerprint.mjs';
import { describe, merge, processTable, snapshot, stop } from './proctree.mjs';

/** @typedef {import('./proctree.mjs').ProcRecord} ProcRecord */
/** @typedef {import('./proctree.mjs').StopResult} StopResult */
/** @typedef {{ pid: number, log: string }} ProcState */
/** @typedef {{ name: string, status: 'pass' | 'fail' | 'warn' | 'skip', detail: string }} Check */
/** @typedef {{ status: number | null, stdout: string, stderr: string }} Run */
/** @typedef {{ Browser: string, webSocketDebuggerUrl: string }} CdpVersion */
/** @typedef {{ id: string, type: string, url: string }} CdpTarget */
/** @typedef {{ frame: { id: string, name?: string, url: string }, childFrames?: FrameTree[] }} FrameTree */
/** @typedef {{ id: number, origin: string, name: string, auxData?: { frameId?: string, isDefault?: boolean } }} ExecutionContext */
/** @typedef {'derived' | 'fixed' | 'external'} PortKind */
/** @typedef {{ name: string, port: number, kind: PortKind, reason?: string }} PortEntry */
/**
 * A row of the ports table (SKILL.md, "Pick a flow"): a derived port has a value per slot, the first row is the main port.
 * @typedef {{ name: string, kind: 'derived', at: (slot: number) => number } | { name: string, kind: 'fixed', port: number, pin: string } | { name: string, kind: 'external', port: number, owner: string }} PortRow
 */

/**
 * The part of spikes/probes/vitest-lib.mjs this script uses.
 * @typedef {object} CdpClient
 * @property {(method: string, params?: Record<string, unknown>, sessionId?: string) => Promise<unknown>} send
 * @property {(targetId: string) => Promise<string>} session
 * @property {{ close: () => void }} ws
 */

/**
 * @typedef {object} VitestLib
 * @property {{ connect: (wsUrl: string) => Promise<CdpClient> }} Cdp
 * @property {(cdp: CdpClient, sid: string, contextId: number, expression: string) => Promise<unknown>} evalIn
 * @property {(cdp: CdpClient, sid: string) => Promise<ExecutionContext[]>} frameContexts
 */

/**
 * @typedef {object} State
 * @property {string} flowId
 * @property {'bundled' | 'attach'} mode
 * @property {string | null} instance
 * @property {boolean} launchedInstance
 * @property {number} [launchedInstancePort]  set when this run started the instance, so a teardown check sees it stopped
 * @property {string} cdpUrl  the browser's CDP endpoint: the bundled CDP port, or the instance's (external)
 * @property {number} vitestPort
 * @property {number} slot
 * @property {PortEntry[]} ports
 * @property {string} orchestratorPrefix
 * @property {boolean} worktree
 * @property {string} session
 * @property {string} evidenceDir
 * @property {string} startedAt
 * @property {{ dir: string, id: string | null } | null} extension
 * @property {string | null} userDataDir
 * @property {number | null} hold
 * @property {string | null} filter
 * @property {boolean} timingDemo
 * @property {ProcState | null} proc
 * @property {ProcRecord[]} [tree]  every process the ng test run was seen to start (proctree.mjs), the root first
 * @property {string} [orchestratorUrl]
 */

/**
 * @typedef {object} UpOptions
 * @property {boolean} bundled
 * @property {string} instance  the --instance value or the default; attach mode only
 * @property {number | null} port  null: derive it
 * @property {number | null} hold
 * @property {string | null} filter
 * @property {boolean} timingDemo
 * @property {string | null} extension
 * @property {number} timeoutMs
 */

const SKILL_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const REPO_ROOT = path.resolve(SKILL_DIR, '../../..');
const SCRATCH = path.join(REPO_ROOT, 'tmp', 'control-vitest-browser-angular');
const STATE_DIR = path.join(SCRATCH, 'state');
const FIXTURE = path.join(REPO_ROOT, 'spikes', 'ng222-app');
const NG = path.join(
  FIXTURE,
  'node_modules',
  '@angular',
  'cli',
  'bin',
  'ng.js',
);
const AI_CONTROL = path.join(
  REPO_ROOT,
  '.commandcode',
  'skills',
  'control-ai-browsers',
  'scripts',
  'control.mjs',
);
const SYSTEM32 = path.join(
  process.env['SystemRoot'] ?? 'C:\\Windows',
  'System32',
);
// Windows reads this from the looking process when Node looks up a bare program name: it then skips the current
// directory. The ng test run inherits it.
process.env['NoDefaultCurrentDirectoryInExePath'] = '1';
const { Cdp, evalIn, frameContexts } = /** @type {VitestLib} */ (
  await import(
    pathToFileURL(path.join(REPO_ROOT, 'spikes', 'probes', 'vitest-lib.mjs'))
      .href
  )
);

// Vitest's default 63315 is inside a Windows excluded port range on this machine; see vitest-base.config.mts.
const MAIN_VITEST_PORT = 51315;
const MAIN_BUNDLED_CDP_PORT = 9350;
const DEFAULT_INSTANCE = 'chrome-beta-gemma4';

// ---------- pure helpers (exported for the tests) ----------

/**
 * The derived rows of the ports table: the Vitest browser server, and in bundled mode the bundled Chromium's CDP
 * port. The attach-mode instance's CDP port is external (control-ai-browsers owns it).
 * @param {boolean} bundled
 * @returns {PortRow[]}
 */
export function portRows(bundled) {
  /** @type {PortRow[]} */
  const rows = [
    {
      name: 'vitest',
      kind: 'derived',
      at: (slot) => (slot === 0 ? MAIN_VITEST_PORT : 51400 + slot),
    },
  ];

  if (bundled) {
    rows.push({
      name: 'bundled-cdp',
      kind: 'derived',
      at: (slot) => (slot === 0 ? MAIN_BUNDLED_CDP_PORT : 9500 + slot),
    });
  }

  return rows;
}

/**
 * The CDP port of the run's browser, from its endpoint.
 * @param {Pick<State, 'cdpUrl'>} state
 * @returns {number}
 */
export function cdpPortOf(state) {
  return Number(new URL(state.cdpUrl).port);
}

/**
 * The value after `--<name>`: a string, true when the flag has no value, undefined when it is absent.
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
 * The options `up` reads from its arguments.
 * @param {string[]} args
 * @returns {UpOptions}
 */
export function upOptions(args) {
  /** @param {string} name */
  const text = (name) => {
    const v = flagIn(args, name);

    return typeof v === 'string' ? v : null;
  };
  /** @param {string} name */
  const nonEmpty = (name) => text(name) || null;
  const port = nonEmpty('port');
  const hold = nonEmpty('hold');

  return {
    bundled: Boolean(flagIn(args, 'bundled')),
    instance: text('instance') ?? DEFAULT_INSTANCE,
    port:
      flagIn(args, 'port') === true ? NaN : port === null ? null : Number(port),
    hold: hold === null ? null : Number(hold),
    filter: text('filter'),
    timingDemo: Boolean(flagIn(args, 'timing-demo')),
    extension: nonEmpty('extension'),
    timeoutMs: Number(flagIn(args, 'timeout') ?? 180) * 1000,
  };
}

/**
 * Why `up` refuses its value flags, or null: a flag given without its value, a `--timeout` (seconds) that is not a
 * positive number, or a `--hold` (milliseconds) that is not a positive whole number. `--port` has its own check.
 * @param {string[]} args
 * @returns {string | null}
 */
export function upRefusal(args) {
  for (const name of ['timeout', 'hold', 'instance', 'extension']) {
    if (flagIn(args, name) === true) {
      return `refused: --${name} needs a value`;
    }
  }

  const timeout = flagIn(args, 'timeout');

  // upOptions reads an empty --timeout as 0 s.
  if (timeout === '') {
    return 'refused: --timeout needs a value';
  }

  if (
    typeof timeout === 'string' &&
    !(Number.isFinite(Number(timeout)) && Number(timeout) > 0)
  ) {
    return `refused: --timeout ${timeout} is not a positive number of seconds`;
  }

  const hold = flagIn(args, 'hold');

  if (
    typeof hold === 'string' &&
    hold !== '' &&
    !(Number.isInteger(Number(hold)) && Number(hold) > 0)
  ) {
    return `refused: --hold ${hold} is not a positive whole number of milliseconds`;
  }

  return null;
}

/**
 * Runs a command; null when it finished, else the could-not-run reason for an error it threw (a CDP endpoint that
 * does not answer, a refused extension path), so the caller exits 2 with it rather than 1 with a stack. Only `up`
 * advises `down`: a failed `up` can leave a state file and an extension behind.
 * @param {() => void | Promise<void>} run
 * @param {string} name
 * @returns {Promise<string | null>}
 */
export async function couldNotRun(run, name) {
  try {
    await run();

    return null;
  } catch (error) {
    return `${name} could not run: ${error instanceof Error ? error.message : String(error)}${name === 'up' ? '; run down' : ''}`;
  }
}

/**
 * One human-readable doctor line. Text from the test page, its tabs or a loaded extension can hold control
 * characters, so they are escaped rather than written to the terminal.
 * @param {Check} c
 * @returns {string}
 */
export function checkLine(c) {
  const tag =
    c.status === 'pass'
      ? '[OK]'
      : c.status === 'skip'
        ? '[SKIP]'
        : c.status === 'warn'
          ? '[WARN]'
          : '[ERROR]';

  return `${tag} ${c.name}: ${printable(c.detail)}`;
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

  return (
    1 +
    (createHash('sha1')
      .update(path.resolve(dir).toLowerCase())
      .digest()
      .readUInt32BE(0) %
      (SLOTS - 1))
  );
}

/**
 * The slots `up` tries, in order: `first`, then the next ones, 10 in all. From a worktree (`first` above 0) they
 * wrap within 1 to 99 and never reach slot 0.
 * @param {number} first
 * @returns {number[]}
 */
export function slotOrder(first) {
  return Array.from({ length: SLOT_TRIES }, (_, i) =>
    first === 0 ? i : 1 + ((first - 1 + i) % (SLOTS - 1)),
  );
}

/**
 * The PIDs listening on each port in `netstat -ano` output, IPv4 and IPv6: a port can have one holder per address.
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
 * The recorded root of the ng test run: the `tree` record with its PID, or none when `up` never saw it run.
 * @param {State} state
 * @returns {ProcRecord | undefined}
 */
export function rootOf(state) {
  const proc = state.proc;

  return proc === null
    ? undefined
    : (state.tree ?? []).find((r) => r.pid === proc.pid);
}

/**
 * The live tree below the recorded root now: empty when it is gone or its PID belongs to another process.
 * @param {State} state
 * @param {() => ProcRecord[]} [table]
 * @returns {ProcRecord[]}
 */
export function liveTree(state, table = processTable) {
  const root = rootOf(state);

  return root === undefined ? [] : snapshot(root, { table });
}

/**
 * Stops every process the run recorded, through proctree.mjs: a last snapshot below the root while the parents
 * still live, merged into the record, then `stop`.
 * @param {State} state
 * @param {{ table?: () => ProcRecord[], stop?: (records: ProcRecord[]) => StopResult }} [deps]
 * @returns {{ records: ProcRecord[], result: StopResult }}
 */
export function stopRun(
  state,
  { table = processTable, stop: stopRecords = stop } = {},
) {
  const records = merge(state.tree ?? [], liveTree(state, table));

  return { records, result: stopRecords(records) };
}

/**
 * What `down` reports for a stop result. Exit 2 when the root's PID now belongs to another process (that one is never
 * touched) or a record still runs after the last round; any other refusal is only noted.
 * @param {State} state
 * @param {StopResult} result
 * @returns {{ code: 0 | 2, notes: string[], reason: string | null }}
 */
export function downOutcome(state, result) {
  // A state file written before proctree.mjs records no tree: stopping nothing and removing it would lose the run.
  if (state.proc !== null && state.tree === undefined) {
    return {
      code: 2,
      notes: [],
      reason: `refused: the state file records no process tree (written before proctree.mjs); nothing stopped: check ng test PID ${state.proc.pid} by hand, then delete the state file`,
    };
  }

  const root = rootOf(state);
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
        `refused: ng test PID ${r.pid} now belongs to another process (its start time or command line differs from the state file); not stopping a process this skill did not start`,
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
 * playwright-cli's entry script next to its npm shim, from the first absolute PATH entry that has the shim.
 * @param {string} pathEnv
 * @returns {string | null}
 */
export function playwrightCliJs(pathEnv) {
  const shimDir = pathEnv
    .split(path.delimiter)
    .find(
      (d) =>
        path.isAbsolute(d) && existsSync(path.join(d, 'playwright-cli.cmd')),
    );
  const js =
    shimDir &&
    path.join(
      shimDir,
      'node_modules',
      '@playwright',
      'cli',
      'playwright-cli.js',
    );

  return js && existsSync(js) ? js : null;
}

/** @param {string} text */
const stripAnsi = (text) => text.replace(/\x1b\[[0-9;]*m/g, '');

// Vitest prints DEV in watch mode and RUN in a single run.
const RUN_STARTED = /\b(DEV|RUN|RERUN)\b/;

/**
 * Whether the ng test log shows a run started, or a start failure.
 * @param {string} log
 * @returns {{ started: boolean, failed: boolean }}
 */
export function logStart(log) {
  const text = stripAnsi(log);

  return {
    started: RUN_STARTED.test(text),
    failed: /An exception occurred|Unhandled Error|EACCES|already in use/.test(
      text,
    ),
  };
}

/**
 * The doctor's test-run check from the ng test log.
 * @param {string} log  the log's content
 * @param {string} logPath
 * @returns {{ status: 'pass' | 'fail', detail: string }}
 */
export function testRunCheck(log, logPath) {
  const text = stripAnsi(log);
  const summary =
    text
      .split(/\r?\n/)
      .filter((l) => /^\s*Tests\s+\d/.test(l))
      .at(-1)
      ?.trim() ?? null;
  const broken = /An exception occurred|Unhandled Error/.test(text);
  const started = RUN_STARTED.test(text);
  const detail = broken
    ? `the log has "An exception occurred" or "Unhandled Error"; see ${logPath}`
    : summary
      ? `last summary: ${summary}`
      : started
        ? 'a run is in progress (no summary yet)'
        : `Vitest has not started a run; see ${logPath}`;

  return { status: started && !broken ? 'pass' : 'fail', detail };
}

/**
 * The doctor's language-model check: bundled Chromium has no model, so there a missing one is a warning.
 * @param {string} lm  what LanguageModel.availability() returned, or 'undefined'
 * @param {State['mode']} mode
 * @returns {{ status: 'pass' | 'fail' | 'warn', detail: string }}
 */
export function languageModelCheck(lm, mode) {
  const bundled = mode === 'bundled';

  return {
    status: lm === 'available' ? 'pass' : bundled ? 'warn' : 'fail',
    detail: `LanguageModel.availability() in the tester iframe: ${lm}${bundled && lm !== 'available' ? ' (expected: bundled Chromium has no model)' : ''}`,
  };
}

/**
 * The Vitest orchestrator page among the CDP targets.
 * @param {CdpTarget[]} targets
 * @param {string} prefix
 * @returns {CdpTarget | undefined}
 */
export function orchestratorTab(targets, prefix) {
  return targets.find((t) => t.type === 'page' && t.url.startsWith(prefix));
}

/**
 * The id of the first extension with a service worker among the CDP targets, or null.
 * @param {CdpTarget[]} targets
 * @returns {string | null}
 */
export function extensionIdIn(targets) {
  const sw = targets.find(
    (t) =>
      t.type === 'service_worker' && t.url.startsWith('chrome-extension://'),
  );

  return sw ? new URL(sw.url).host : null;
}

/**
 * The environment for `ng test`.
 * @param {NodeJS.ProcessEnv} base
 * @param {State} state
 * @returns {NodeJS.ProcessEnv}
 */
export function testEnv(base, state) {
  /** @type {NodeJS.ProcessEnv} */
  const env = {
    ...base,
    VITEST_BROWSER_PORT: String(state.vitestPort),
    NG_CLI_ANALYTICS: 'false',
  };
  delete env['CI'];

  if (state.hold) {
    env['VITE_COUNTER_HOLD_MS'] = String(state.hold);
  }

  if (state.timingDemo) {
    env['VITE_COUNTER_TIMING_DEMO'] = '1';
  }

  if (state.mode === 'bundled') {
    env['VITEST_EXTENSION_DIR'] = state.extension?.dir;
    env['VITEST_CDP_PORT'] = String(cdpPortOf(state));
    env['VITEST_USER_DATA_DIR'] = state.userDataDir ?? undefined;
  } else {
    env['VITEST_CDP_URL'] = state.cdpUrl;
  }

  return env;
}

/**
 * The arguments after node for `ng test`. --watch explicitly: a spawned process has no TTY, and Angular then
 * defaults to a single run, after which the tab closes.
 * @param {string} ng
 * @param {State} state
 * @returns {string[]}
 */
export function testArgs(ng, state) {
  const args = [
    ng,
    'test',
    '-c',
    state.mode === 'bundled' ? 'extension' : 'attach',
    '--watch',
  ];

  if (state.filter) {
    args.push('--filter', state.filter);
  }

  return args;
}

/**
 * Why `down` must not delete the recorded bundled profile, or null when it lies strictly below `scratch`.
 * @param {string} dir
 * @param {string} scratch
 * @returns {string | null}
 */
export function profileOutside(dir, scratch) {
  const rel = path.relative(path.resolve(scratch), path.resolve(dir));

  if (
    rel !== '' &&
    rel !== '..' &&
    !rel.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(rel)
  ) {
    return null;
  }

  return `refused: the recorded profile ${dir} is not below ${scratch}. Not deleting a folder this skill did not create.`;
}

// ---------- process and tool access ----------

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
  const netstat = path.join(SYSTEM32, 'netstat.exe');

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
 * @param {string[]} args
 * @returns {Run}
 */
function playwrightCli(args) {
  const js = playwrightCliJs(process.env['PATH'] ?? '');

  if (!js) {
    return {
      status: 127,
      stdout: '',
      stderr: 'playwright-cli not found on PATH',
    };
  }

  const r = spawnSync(process.execPath, [js, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 64 * 1024 * 1024,
  });

  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

/**
 * @param {string[]} args
 * @returns {Run}
 */
function aiControl(args) {
  const r = spawnSync(process.execPath, [AI_CONTROL, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 16 * 1024 * 1024,
  });

  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

/**
 * @param {number} port
 * @returns {Promise<CdpVersion | null>}
 */
async function cdpVersion(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/version`, {
      signal: AbortSignal.timeout(3000),
    });

    return /** @type {CdpVersion} */ (await res.json());
  } catch {
    return null;
  }
}

/**
 * Clears the attached browser's HTTP cache. The browser otherwise reuses a test chunk an earlier run on the same
 * Vitest port cached, with that run's VITE_* values: after a --hold run, a run without --hold still held (measured
 * 2026-10-16; Network.clearBrowserCache before the run fixed it).
 * @param {number} port
 * @returns {Promise<void>}
 */
async function clearHttpCache(port) {
  const v = await cdpVersion(port);
  const page = (await cdpList(port)).find((t) => t.type === 'page');

  if (!v || !page) {
    throw new Error(`no browser page answers on CDP port ${port}`);
  }

  const cdp = await Cdp.connect(v.webSocketDebuggerUrl);

  try {
    const { sessionId } = /** @type {{ sessionId: string }} */ (
      await cdp.send('Target.attachToTarget', {
        targetId: page.id,
        flatten: true,
      })
    );
    await cdp.send('Network.clearBrowserCache', {}, sessionId);
    await cdp.send('Target.detachFromTarget', { sessionId });
  } finally {
    cdp.ws.close();
  }
}

/**
 * @param {number} port
 * @returns {Promise<CdpTarget[]>}
 */
async function cdpList(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/list`, {
      signal: AbortSignal.timeout(3000),
    });

    return /** @type {CdpTarget[]} */ (await res.json());
  } catch {
    return [];
  }
}

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** @param {number} vitestPort */
const orchestratorPrefix = (vitestPort) =>
  `http://127.0.0.1:${vitestPort}/__vitest_test__/`;

// ---------- CLI ----------

const argv = process.argv.slice(2);
const cmd = argv[0];
const JSON_OUT = argv.includes('--json');

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
    process.stdout.write(
      `${code === 0 ? '[OK]' : '[ERROR]'} ${JSON.stringify(rest)}\n`,
    );
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
const statePath = (flowId) => path.join(STATE_DIR, `${flowId}.json`);

function stateFiles() {
  return existsSync(STATE_DIR)
    ? readdirSync(STATE_DIR).filter((f) => f.endsWith('.json'))
    : [];
}

/** @returns {{ sp: string, state: State }} */
function readState() {
  const first = stateFiles()[0];

  if (first === undefined) {
    return fail(
      2,
      `no state file in ${STATE_DIR}: nothing was started by this skill (run up first)`,
    );
  }

  const p = path.join(STATE_DIR, first);

  return {
    sp: p,
    state: /** @type {State} */ (JSON.parse(readFileSync(p, 'utf8'))),
  };
}

/**
 * The instance's CDP port from `control-ai-browsers up <name> --json`, which starts the instance when it is not
 * running and leaves a running one as it is. That skill owns the port; this one only attaches to it.
 * @param {string} name
 * @returns {{ port: number, launched: boolean }}
 */
function aiInstance(name) {
  const r = aiControl(['up', name, '--json']);
  /** @type {{ alreadyRunning?: boolean, state?: { port?: number } } | null} */
  let result = null;

  try {
    result = JSON.parse(r.stdout.trim().split(/\r?\n/).at(-1) ?? '');
  } catch {
    result = null;
  }

  const port = result?.state?.port;

  if (r.status !== 0 || typeof port !== 'number') {
    return fail(
      2,
      `control-ai-browsers up ${name} exited ${r.status}: ${(r.stdout + r.stderr).trim().slice(-400)}`,
    );
  }

  return { port, launched: result?.alreadyRunning !== true };
}

/**
 * The first derived port of the run that a process outside the ng test tree now holds, with that holder.
 * @param {PortEntry[]} ports
 * @param {Map<number, number[]>} busy
 * @param {Set<number>} tree
 * @returns {{ entry: PortEntry, pid: number } | null}
 */
export function takenPort(ports, busy, tree) {
  for (const entry of ports) {
    const pid = (busy.get(entry.port) ?? []).find((p) => !tree.has(p));

    if (entry.kind === 'derived' && pid !== undefined) {
      return { entry, pid };
    }
  }

  return null;
}

async function up() {
  mkdirSync(STATE_DIR, { recursive: true });

  // One run at a time: one ng test process, and one browser per run (Lars's memory budget).
  if (stateFiles().length > 0) {
    fail(
      2,
      `refused: a run is already recorded (${stateFiles().join(', ')}); run down first`,
    );
  }

  if (!existsSync(NG)) {
    fail(
      2,
      `cannot find the Angular CLI at ${NG}; run npm ci in spikes/ng222-app first`,
    );
  }

  const refusal = upRefusal(argv);

  if (refusal !== null) {
    fail(2, refusal);
  }

  const opts = upOptions(argv);
  const bundled = opts.bundled;
  const instance = bundled ? null : opts.instance;
  const worktree = isWorktree(FIXTURE);
  const rows = portRows(bundled);
  const forced = opts.port ?? undefined;

  if (
    forced !== undefined &&
    !(Number.isInteger(forced) && forced > 0 && forced < 65536)
  ) {
    fail(2, `refused: --port ${forced} is not a port number`);
  }

  if (worktree && forced === MAIN_VITEST_PORT) {
    fail(
      2,
      `refused: ${FIXTURE} is in a git worktree and port ${forced} is the main checkout's Vitest port`,
    );
  }

  let order = slotOrder(slotOf(FIXTURE, worktree));
  const first = order[0];
  let plan = planPorts(
    rows,
    order,
    await busyPorts(candidatePorts(rows, order, forced, first)),
    forced,
    first,
  );

  if (!plan.ok) {
    return fail(2, `refused: ${plan.reason}`);
  }

  /** @type {PortEntry[]} */
  let external = [];
  let launchedInstance = false;
  let cdpPort = NaN;

  if (instance !== null) {
    const i = aiInstance(instance);
    launchedInstance = i.launched;
    cdpPort = i.port;
    external = [
      {
        name: 'instance',
        port: i.port,
        kind: 'external',
        reason: `control-ai-browsers instance ${instance}; this skill attaches to it`,
      },
    ];
  }

  const flowId = bundled ? 'bundled' : /** @type {string} */ (instance);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const evidenceDir = path.join(SCRATCH, `${flowId}-${stamp}`);
  mkdirSync(evidenceDir, { recursive: true });
  /** @param {{ slot: number, ports: PortEntry[] }} p */
  const placed = (p) => {
    const at = Object.fromEntries(p.ports.map((e) => [e.name, e.port]));
    const vitestPort = Number(at['vitest']);
    const cdp = bundled ? Number(at['bundled-cdp']) : cdpPort;

    return {
      vitestPort,
      cdpUrl: `http://127.0.0.1:${cdp}`,
      orchestratorPrefix: orchestratorPrefix(vitestPort),
      session: `control-vitest-${flowId}-${vitestPort}`,
      slot: p.slot,
      ports: [...p.ports, ...external],
    };
  };
  /** @type {State} */
  const state = {
    flowId,
    mode: bundled ? 'bundled' : 'attach',
    instance,
    launchedInstance,
    ...(launchedInstance ? { launchedInstancePort: cdpPort } : {}),
    ...placed(plan),
    worktree,
    evidenceDir,
    startedAt: new Date().toISOString(),
    extension: null,
    userDataDir: bundled ? path.join(SCRATCH, `profile-${flowId}`) : null,
    hold: opts.hold,
    filter: opts.filter,
    timingDemo: opts.timingDemo,
    proc: null,
  };
  writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));

  // Before the extension loads: a failure here then leaves nothing installed in the instance.
  if (!bundled) {
    await clearHttpCache(cdpPortOf(state));
  }

  if (opts.extension !== null) {
    const dir = path.resolve(opts.extension);

    if (!existsSync(path.join(dir, 'manifest.json'))) {
      fail(2, `no manifest.json in ${dir}; run down to clear the state`, {
        state: statePath(flowId),
      });
    }

    state.extension = { dir, id: null };

    if (!bundled) {
      const v = await cdpVersion(cdpPortOf(state));

      if (!v) {
        throw new Error(`nothing answers on ${state.cdpUrl}`);
      }

      const cdp = await Cdp.connect(v.webSocketDebuggerUrl);

      try {
        state.extension.id = /** @type {{ id: string }} */ (
          await cdp.send('Extensions.loadUnpacked', { path: dir })
        ).id;
        // Recorded at once, so down uninstalls it whatever fails after this point.
        writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));
      } finally {
        cdp.ws.close();
      }
    }
  } else if (bundled) {
    fail(
      2,
      '--bundled needs --extension <dir> (vitest-extension.config.mts requires one); run down to clear the state',
      { state: statePath(flowId) },
    );
  }

  writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));
  const t0 = Date.now();

  for (let attempt = 1; ; attempt++) {
    // Each attempt has its own log, so a retry never reads the last attempt's "already in use".
    const log = path.join(
      evidenceDir,
      attempt === 1 ? 'ng-test.log' : `ng-test-${attempt}.log`,
    );
    const fd = openSync(log, 'a');
    const notBefore = Date.now();
    const child = spawn(process.execPath, testArgs(NG, state), {
      cwd: FIXTURE,
      env: testEnv(process.env, state),
      detached: true,
      stdio: ['ignore', fd, fd],
      windowsHide: true,
    });
    const notAfter = Date.now();
    child.unref();
    const pid = child.pid;

    if (pid === undefined) {
      fail(2, `ng test did not start; see ${log}; run down`, {
        state: statePath(flowId),
      });
    }

    state.proc = { pid, log };
    state.tree = merge(
      state.tree ?? [],
      snapshot(pid, { notBefore, notAfter }),
    );
    writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));
    /** @type {{ entry: PortEntry, pid: number | null } | null} */
    let taken = null;

    for (;;) {
      const tab = orchestratorTab(
        await cdpList(cdpPortOf(state)),
        state.orchestratorPrefix,
      );
      const text = existsSync(log) ? readFileSync(log, 'utf8') : '';
      const status = logStart(text);

      // Ready once Vitest has started a run in the tab; a held test (--hold) keeps that run going.
      if (tab && status.started) {
        state.orchestratorUrl = tab.url;
        break;
      }

      const live = liveTree(state);
      const exited = live.length === 0;
      const seen = merge(state.tree ?? [], live);

      // Every poll's snapshot is kept, so a run that fails before it is ready leaves down its whole tree.
      if (seen.length !== (state.tree ?? []).length) {
        state.tree = seen;
        writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));
      }

      // Another process took a port after the check: Vitest's strictPort reports "already in use", and a Chromium
      // whose CDP port is taken starts without one.
      const held = takenPort(
        state.ports,
        await busyPorts(state.ports.map((e) => e.port)),
        new Set(live.map((r) => r.pid)),
      );

      if (status.failed || exited || held !== null) {
        const vitest = state.ports.find((e) => e.name === 'vitest');
        taken =
          held ??
          (/already in use/.test(text) && vitest !== undefined
            ? { entry: vitest, pid: null }
            : null);

        if (taken === null) {
          fail(
            2,
            `ng test ${exited ? `(PID ${pid}) exited before it was ready` : 'failed to start'}; see ${log}; run down`,
            { state: statePath(flowId) },
          );
        }

        break;
      }

      if (Date.now() - t0 > opts.timeoutMs) {
        fail(
          2,
          `no Vitest tab and DEV or RUN line after ${opts.timeoutMs / 1000}s; see ${log}; run down`,
          { state: statePath(flowId) },
        );
      }

      await sleep(500);
    }

    if (taken === null) {
      break;
    }

    const { records, result } = stopRun(state);
    const stopped = downOutcome(state, result);

    if (stopped.code !== 0) {
      state.tree = records;
      writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));
      fail(
        2,
        `a port was taken after the check, and stopping this attempt failed: ${stopped.reason}; run down`,
        { state: statePath(flowId), notes: stopped.notes },
      );
    }

    const what = `${taken.entry.name} ${taken.entry.port} was taken ${taken.pid === null ? 'by another process' : `by PID ${taken.pid}`} after the check`;

    if (forced !== undefined && taken.entry.port === forced) {
      fail(
        2,
        `refused: port ${forced} (--port) ${what}; --port has no fallback; run down`,
        { state: statePath(flowId) },
      );
    }

    order = order.slice(order.indexOf(plan.slot) + 1);

    if (order.length === 0) {
      fail(
        2,
        `refused: ${what}, and none of the ${SLOT_TRIES} slots is left; run down`,
        { state: statePath(flowId) },
      );
    }

    plan = planPorts(
      rows,
      order,
      await busyPorts(candidatePorts(rows, order, forced, first)),
      forced,
      first,
    );

    if (!plan.ok) {
      fail(2, `refused: ${what}, and ${plan.reason}; run down`, {
        state: statePath(flowId),
      });
    }

    Object.assign(state, placed(plan), { proc: null, tree: [] });
    writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));
  }

  if (bundled && state.extension) {
    state.extension.id = extensionIdIn(await cdpList(cdpPortOf(state)));
  }

  state.tree = merge(state.tree ?? [], liveTree(state));
  writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));
  // Same abort as at the end of down (measured after up --bundled, 2026-10-16).
  await sleep(250);
  out(
    {
      ok: true,
      command: 'up',
      readyInSeconds: Math.round((Date.now() - t0) / 100) / 10,
      statePath: statePath(flowId),
      ...state,
    },
    0,
  );
}

async function doctor() {
  const { state } = readState();
  /** @type {Check[]} */
  const checks = [];
  /** @type {(name: string, status: Check['status'], detail: string) => void} */
  const add = (name, status, detail) => {
    checks.push({ name, status, detail });
  };
  const fresh = mapFresh(SKILL_DIR);
  add('map-fresh', fresh.status, fresh.detail);

  if (state.worktree && state.vitestPort === MAIN_VITEST_PORT) {
    fail(2, "refused: worktree run points at the main checkout's Vitest port");
  }

  const proc = state.proc;
  const root = rootOf(state);
  const live = liveTree(state);
  add(
    'process-alive',
    root !== undefined && live.length > 0 ? 'pass' : 'fail',
    root !== undefined && live.length > 0
      ? `ng test PID ${root.pid} running since ${new Date(root.start).toISOString()}`
      : `ng test PID ${proc?.pid} is gone or reused`,
  );
  const recorded = merge(state.tree ?? [], live);

  // Written only while the state file is there and the record changed: a down that just removed it stays done.
  if (
    existsSync(statePath(state.flowId)) &&
    JSON.stringify(recorded) !== JSON.stringify(state.tree ?? [])
  ) {
    state.tree = recorded;
    writeFileSync(statePath(state.flowId), JSON.stringify(state, null, 2));
  }

  add('tree', 'pass', `${recorded.length} process(es) recorded for down`);
  const ports = portsCheck(
    state.ports,
    await busyPorts(state.ports.map((e) => e.port)),
    new Set(live.map((r) => r.pid)),
  );
  add('ports', ports.status, ports.detail);
  const logPath = proc?.log ?? '';
  const run = testRunCheck(
    logPath && existsSync(logPath) ? readFileSync(logPath, 'utf8') : '',
    logPath,
  );
  add('test-run', run.status, run.detail);

  const version = await cdpVersion(cdpPortOf(state));
  add(
    'browser-cdp',
    version ? 'pass' : 'fail',
    version
      ? `${version.Browser} on ${state.cdpUrl}${state.instance ? ` (instance ${state.instance})` : ' (bundled Chromium)'}`
      : `nothing answers on ${state.cdpUrl}`,
  );

  if (!version) {
    return out(
      { ok: false, command: 'doctor', flowId: state.flowId, checks },
      1,
    );
  }

  const tab = orchestratorTab(
    await cdpList(cdpPortOf(state)),
    state.orchestratorPrefix,
  );
  add(
    'orchestrator-tab',
    tab ? 'pass' : 'fail',
    tab ? tab.url : `no tab starting with ${state.orchestratorPrefix}`,
  );

  if (tab) {
    const cdp = await Cdp.connect(version.webSocketDebuggerUrl);

    try {
      const sid = await cdp.session(tab.id);
      const tree = /** @type {{ frameTree: FrameTree }} */ (
        await cdp.send('Page.getFrameTree', {}, sid)
      ).frameTree;
      const tester = (tree.childFrames ?? []).find(
        (c) => c.frame.name === 'vitest-iframe',
      );
      const contexts = tester ? await frameContexts(cdp, sid) : [];
      const main = tester
        ? contexts.find(
            (c) =>
              c.auxData?.frameId === tester.frame.id && c.auxData?.isDefault,
          )
        : undefined;

      if (!tester) {
        add('tester-frame', 'fail', 'no child frame named vitest-iframe');
      } else if (!main) {
        add(
          'tester-frame',
          'fail',
          `no default execution context in the tester iframe ${tester.frame.url}`,
        );
      } else {
        add('tester-frame', 'pass', tester.frame.url);
      }

      if (tester && main) {
        const page =
          /** @type {{ ng: number, host: string | null, runner: string, lm: string }} */ (
            await evalIn(
              cdp,
              sid,
              main.id,
              `(async () => ({
            ng: window.ng ? Object.keys(window.ng).length : 0,
            host: document.querySelector('[ng-version]')?.textContent.trim() ?? null,
            runner: typeof window.__vitest_browser_runner__,
            lm: typeof LanguageModel === 'undefined' ? 'undefined' : await LanguageModel.availability().catch((e) => String(e)),
          }))()`,
            )
          );
        add(
          'dev-build',
          page.ng > 0 ? 'pass' : 'fail',
          page.ng > 0
            ? `window.ng has ${page.ng} functions in the tester iframe`
            : 'window.ng missing in the tester iframe',
        );
        add(
          'vitest-runner',
          page.runner === 'object' ? 'pass' : 'fail',
          `__vitest_browser_runner__ is ${page.runner}`,
        );
        add(
          'mounted-component',
          page.host ? 'pass' : 'warn',
          page.host
            ? `[ng-version] host: "${page.host}"`
            : 'no [ng-version] host now: no test is running (start with --hold to keep the Counter mounted)',
        );
        const lm = languageModelCheck(page.lm, state.mode);
        add('language-model', lm.status, lm.detail);
      }

      await cdp
        .send('Target.detachFromTarget', { sessionId: sid })
        .catch(() => {});
    } finally {
      cdp.ws.close();
    }
  }

  if (state.extension) {
    const prefix = `chrome-extension://${state.extension.id}/`;
    const sw = (await cdpList(cdpPortOf(state))).find(
      (t) => t.type === 'service_worker' && t.url.startsWith(prefix),
    );
    add(
      'extension-loaded',
      sw ? 'pass' : 'fail',
      sw
        ? `service worker ${sw.url}`
        : `no service worker for extension ${state.extension.id}`,
    );
  } else {
    add('extension-loaded', 'skip', 'no --extension given to up');
  }

  const failed = checks.filter((c) => c.status === 'fail');
  out(
    {
      ok: failed.length === 0,
      command: 'doctor',
      flowId: state.flowId,
      session: state.session,
      orchestratorUrl: tab?.url ?? null,
      checks,
    },
    failed.length === 0 ? 0 : 1,
  );
}

function info() {
  const { sp, state } = readState();
  out({ ok: true, command: 'info', statePath: sp, ...state }, 0);
}

async function down() {
  const { sp, state } = readState();
  /** @type {string[]} */
  const notes = [];
  const profileRefusal = state.userDataDir
    ? profileOutside(state.userDataDir, SCRATCH)
    : null;

  if (profileRefusal !== null) {
    fail(2, profileRefusal, { state: sp });
  }

  // detach, not close: the session is attached to a browser this skill may not own.
  const det = playwrightCli([`-s=${state.session}`, 'detach']);
  notes.push(
    `session ${state.session}: ${det.status === 0 ? 'detached' : 'was not attached'}`,
  );

  const { records, result } = stopRun(state);
  const outcome = downOutcome(state, result);
  notes.push(...outcome.notes);

  if (outcome.code !== 0) {
    state.tree = records;
    writeFileSync(sp, JSON.stringify(state, null, 2));
    // Same abort as below.
    await sleep(250);
    out(
      {
        ok: false,
        command: 'down',
        flowId: state.flowId,
        evidenceDir: state.evidenceDir,
        notes,
        reason: outcome.reason,
        state: sp,
      },
      outcome.code,
    );
  }

  const version =
    state.mode === 'attach' ? await cdpVersion(cdpPortOf(state)) : null;

  if (version) {
    for (const t of await cdpList(cdpPortOf(state))) {
      if (
        t.type === 'page' &&
        t.url.startsWith(`http://127.0.0.1:${state.vitestPort}/`)
      ) {
        await fetch(
          `http://127.0.0.1:${cdpPortOf(state)}/json/close/${t.id}`,
        ).catch(() => {});
        notes.push(`closed Vitest tab ${t.url}`);
      }
    }

    if (state.extension?.id) {
      const cdp = await Cdp.connect(version.webSocketDebuggerUrl);

      try {
        await cdp.send('Extensions.uninstall', { id: state.extension.id });
        notes.push(`uninstalled extension ${state.extension.id}`);
      } catch (e) {
        notes.push(
          `extension ${state.extension.id}: ${e instanceof Error ? e.message : String(e)}`,
        );
      } finally {
        cdp.ws.close();
      }
    }

    if (state.launchedInstance && state.instance !== null) {
      let r = aiControl(['down', state.instance]);

      // Only a missing state file is mended with attach; any other refusal stands (the instance may not be ours now).
      if (r.status !== 0 && /no state file at/.test(r.stdout + r.stderr)) {
        aiControl(['attach', state.instance]);
        r = aiControl(['down', state.instance]);
      }

      notes.push(
        `control-ai-browsers down ${state.instance}: exit ${r.status}`,
      );
    } else {
      notes.push(
        `instance ${state.instance} left running: this skill did not start it`,
      );
    }
  }

  if (state.userDataDir) {
    for (let i = 0; i < 10 && existsSync(state.userDataDir); i++) {
      try {
        rmSync(state.userDataDir, { recursive: true, force: true });
      } catch {
        await sleep(500);
      }
    }

    notes.push(
      `profile ${state.userDataDir}: ${existsSync(state.userDataDir) ? 'could not be removed' : 'removed'}`,
    );
  }

  rmSync(sp, { force: true });
  // process.exit while fetch's sockets to the CDP port are still closing aborts Node on Windows
  // ("Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)", exit 127; measured after attach-mode down).
  await sleep(250);
  out(
    {
      ok: true,
      command: 'down',
      flowId: state.flowId,
      evidenceDir: state.evidenceDir,
      notes,
    },
    0,
  );
}

/** @type {Record<string, () => void | Promise<void>>} */
const commands = { up, doctor, info, down };

// import.meta.url is the real path, so compare real paths: run through a link, the CLI still runs.
if (
  process.argv[1] &&
  realpathSync.native(path.resolve(process.argv[1])) ===
    realpathSync.native(fileURLToPath(import.meta.url))
) {
  const run =
    cmd !== undefined && Object.hasOwn(commands, cmd)
      ? commands[cmd]
      : undefined;

  if (run === undefined) {
    process.stdout.write(
      'usage: control.mjs <up|doctor|info|down> [--instance <name> | --bundled] [--extension <dir>] [--hold <ms>] [--timing-demo] [--filter <text>] [--port N] [--timeout S] [--json]\n',
    );
    process.exit(2);
  }

  const reason = await couldNotRun(run, String(cmd));

  if (reason !== null) {
    fail(2, reason);
  }
}
