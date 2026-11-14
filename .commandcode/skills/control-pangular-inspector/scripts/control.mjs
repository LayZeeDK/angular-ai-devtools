#!/usr/bin/env node
// @ts-check
// Control script for control-pangular-inspector: install, check, remove, up, doctor, info, down,
// tools, call, resource. Deterministic steps only; driving the app stays in playwright-cli.
import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';
import {
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapFresh } from './fingerprint.mjs';
import { printable } from './text.mjs';
import { describe, merge, processTable, snapshot, stop } from './proctree.mjs';

// The launcher `up` starts detached: it runs the server under one hidden console, so the console programs below it
// open no window of their own. Dispatched before any other top-level work.
if (process.argv[2] === '__serve') {
  const server = spawn(process.execPath, process.argv.slice(3), {
    stdio: 'inherit',
    windowsHide: true,
  });
  server.on('error', (error) => {
    console.error(`[ERROR] the server did not start: ${error.message}`);
    process.exit(1);
  });
  server.on('exit', (code) => process.exit(code ?? 1));
} else {
  main();
}

/** @typedef {{ name: string, status: 'pass' | 'fail' | 'warn' | 'skip', detail: string }} Check */
/** @typedef {import('./proctree.mjs').ProcRecord} ProcRecord */
/** @typedef {import('./proctree.mjs').StopResult} StopResult */
/** @typedef {{ browser?: string, ssr?: unknown, proxyConfig?: string, [key: string]: unknown }} TargetOptions */
/** @typedef {{ executor?: string, defaultConfiguration?: string, continuous?: boolean, options?: TargetOptions, [key: string]: unknown }} NxTarget */
/** @typedef {{ name?: string, targets?: Record<string, NxTarget> }} ProjectJson */
/** @typedef {{ name: string | undefined, projectJson: string, root: string, main: string, proxy: string }} App */
/** @typedef {'express-hub' | 'vite-plugin' | 'standalone-cli'} Mount */
/** @typedef {'derived' | 'fixed' | 'external'} PortKind */
/** @typedef {{ name: string, port: number, kind: PortKind, reason?: string }} PortEntry */
/**
 * A row of the ports table (SKILL.md, "Pick a flow"); this skill has no derived row.
 * @typedef {{ name: string, kind: 'derived', at: (slot: number) => number } | { name: string, kind: 'fixed', port: number, pin: string } | { name: string, kind: 'external', port: number, owner: string }} PortRow
 */

/**
 * @typedef {object} SetupFacts
 * @property {App} app
 * @property {Mount} mount
 * @property {string | null} declared
 * @property {string | null} installed
 * @property {boolean} overlayImport
 * @property {boolean} devGuard
 * @property {string | null} proxyConfig
 * @property {string | null} proxyTarget
 */

/**
 * @typedef {object} State
 * @property {'launch'} mode
 * @property {string} dir
 * @property {number} port
 * @property {PortEntry[]} [ports]
 * @property {boolean} readOnly
 * @property {string} mcpUrl
 * @property {string} origin
 * @property {string | null} appUrl
 * @property {string} session
 * @property {string} evidenceDir
 * @property {string} log
 * @property {number} pid
 * @property {ProcRecord[]} [tree]  every process the server run was seen to start (proctree.mjs), the root first
 * @property {string} startedAt
 */

/** @typedef {{ type?: string, text?: string }} Content */
/** @typedef {{ name: string, annotations?: { readOnlyHint?: boolean } }} Tool */
/** @typedef {{ uri: string, name?: string }} Resource */
/** @typedef {{ serverInfo?: { name?: string, version?: string }, tools?: Tool[], content?: Content[], isError?: boolean, resources?: Resource[], contents?: Content[] }} RpcResult */
/** @typedef {{ id?: number, result?: RpcResult, error?: unknown }} RpcMessage */
/** @typedef {RpcMessage & { httpStatus: number, body?: string }} RpcResponse */
/** @typedef {{ name: string, tag: string, id: string, children?: TreeNode[] }} TreeNode */
/** @typedef {{ pageId?: string | null, ngVersion?: string | null, devBuild?: boolean }} PageProbe */
/** @typedef {{ status: number | null, stdout: string, stderr: string }} Run */

const SKILL_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const REPO_ROOT = path.resolve(SKILL_DIR, '../../..');
const SCRATCH = path.join(REPO_ROOT, 'tmp', 'control-pangular-inspector');
const STATE_DIR = path.join(SCRATCH, 'state');
const PKG = '@pangular-inspector/devtools';
const PINNED = '0.0.7'; // npm view @pangular-inspector/devtools version, 2026-10-11
const DEFAULT_PORT = 9999; // the docs' standalone port; proxy.conf.json names it, so it is fixed per app
const PORTAL_DEFAULT_DIR =
  'D:\\projects\\github\\LayZeeDK\\HaasStefan__ng-journal-insurance-portal-ai-devtools';
const ACTION_TOOLS = [
  'highlight',
  'navigate',
  'dispatch-ngrx-action',
  'form-action',
  'fill-form',
  'set-http-rule',
  'remove-http-rule',
  'analog-call-api',
];
const OVERLAY_SNIPPET = `
  .then(() => {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      return import('${PKG}/overlay');
    }

    return undefined;
  })`;
const SYSTEM32 = path.join(
  process.env['SystemRoot'] ?? 'C:\\Windows',
  'System32',
);
// Windows reads this from this process when Node looks up a bare program name (git): the current directory is then
// not searched.
process.env['NoDefaultCurrentDirectoryInExePath'] = '1';
const NPM_CLI = path.join(
  path.dirname(process.execPath),
  'node_modules',
  'npm',
  'bin',
  'npm-cli.js',
);

// ---------- pure functions (exported for the tests) ----------

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
 * The recorded root of the server run: the `tree` record with its PID, or none when `up` never saw it run.
 * @param {{ pid: number, tree?: ProcRecord[] }} state
 * @returns {ProcRecord | undefined}
 */
export function rootOf(state) {
  return (state.tree ?? []).find((r) => r.pid === state.pid);
}

/**
 * The live tree below the recorded root now: empty when it is gone or its PID belongs to another process.
 * @param {{ pid: number, tree?: ProcRecord[] }} state
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
 * @param {{ pid: number, tree?: ProcRecord[] }} state
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
 * @param {{ pid: number, tree?: ProcRecord[] }} state
 * @param {StopResult} result
 * @returns {{ code: 0 | 2, notes: string[], reason: string | null }}
 */
export function downOutcome(state, result) {
  // A state file written before proctree.mjs records no tree: stopping nothing and removing it would lose the run.
  if (state.tree === undefined) {
    return {
      code: 2,
      notes: [],
      reason: `refused: the state file records no process tree (written before proctree.mjs); nothing stopped: check PID ${state.pid} by hand, then delete the state file`,
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
        `refused: PID ${r.pid} now belongs to another process (its start time or command line differs from the state file); not stopping a process this skill did not start`,
      );
    } else if (r.reason === 'survived') {
      reasons.push(
        `${describe(r)} still runs after the last round; run down again`,
      );
    } else {
      notes.push(
        `left ${r.reason === 'reused' ? `PID ${r.pid}` : describe(r)} alone: ${r.reason === 'reused' ? 'it now belongs to another process' : r.reason === 'shared' ? 'a shared service (the Nx daemon), never stopped' : 'it runs this script'}`,
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

// ---------- ports (SKILL.md, "Pick a flow") ----------

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
 * `path:line` of the first line of `rel` (below `dir`) that contains `needle`; the bare path when none does.
 * @param {string} dir
 * @param {string} rel
 * @param {string} needle
 * @returns {string}
 */
export function pinOf(dir, rel, needle) {
  try {
    const i = readFileSync(path.join(dir, rel), 'utf8')
      .split(/\r?\n/)
      .findIndex((l) => l.includes(needle));

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
 * The ports table rows of a run: the devtools server's port, fixed by the app's proxy.conf.json (its pinning line
 * is found in the app checkout), and the app the overlay runs in, which control-angular-dev-app serves.
 * @param {string} dir  the app checkout
 * @param {number} port
 * @param {string | null} appUrl
 * @param {string | undefined} project
 * @returns {PortRow[]}
 */
export function portRows(dir, port, appUrl, project) {
  const app = findApp(dir, project);
  const proxy =
    app === null
      ? 'apps/<app>/proxy.conf.json'
      : path.relative(dir, app.proxy).split(path.sep).join('/');
  /** @type {PortRow[]} */
  const rows = [
    {
      name: 'pangular',
      kind: 'fixed',
      port,
      pin: `${pinOf(dir, proxy, `localhost:${port}`)} in the app checkout ${dir}`,
    },
  ];

  if (appUrl !== null) {
    rows.push({
      name: 'app',
      kind: 'external',
      port: Number(new URL(appUrl).port || 80),
      owner:
        'control-angular-dev-app (or whatever serves --app-url); this skill never starts or stops it',
    });
  }

  return rows;
}

/**
 * The latest "auth code NNNNNN" in a server log, colour codes removed.
 * @param {string} log
 * @returns {string | null}
 */
export function authCodeIn(log) {
  const all = [
    ...log.replace(/\x1b\[[0-9;]*m/g, '').matchAll(/auth code\s+(\d{4,8})/g),
  ];

  return all.at(-1)?.[1] ?? null;
}

/** @param {string} name */
export const short = (name) => name.replace(/^pangular[_:]/, '');

/**
 * Why `call` refuses a tool, or null: an action tool needs --confirm.
 * @param {string} name
 * @param {boolean} confirm
 * @returns {string | null}
 */
export function callRefusal(name, confirm) {
  return ACTION_TOOLS.includes(short(name)) && !confirm
    ? `refused: ${short(name)} acts on the app; pass --confirm to run it (and start the server with up --allow-actions)`
    : null;
}

/**
 * The JSON-RPC message in an MCP HTTP reply: the last `data:` line of an event stream, else the body.
 * @param {string} text
 * @returns {RpcMessage}
 */
export function parseRpcText(text) {
  const data = text.includes('data:')
    ? text
        .split(/\r?\n/)
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).trim())
        .pop()
    : text;

  return JSON.parse(data ?? '');
}

/**
 * The first Nx application under `<dir>/apps` with an @angular/build:dev-server serve target (named `project` when
 * given), or null.
 * @param {string} dir
 * @param {string | undefined} project
 * @returns {App | null}
 */
export function findApp(dir, project) {
  // ponytail: Nx project.json with an @angular/build:dev-server serve target; angular.json workspaces are not covered
  const appsDir = path.join(dir, 'apps');
  const candidates = existsSync(appsDir)
    ? readdirSync(appsDir)
        .map((d) => path.join(appsDir, d, 'project.json'))
        .filter(existsSync)
    : [];

  for (const pj of candidates) {
    const j = readProject(pj);

    if (
      (!project || j.name === project) &&
      j.targets?.['serve']?.executor === '@angular/build:dev-server'
    ) {
      const root = path.dirname(pj);
      const browser = j.targets['build']?.options?.browser;

      return {
        name: j.name,
        projectJson: pj,
        root,
        main: path.join(
          dir,
          browser ?? path.relative(dir, path.join(root, 'src', 'main.ts')),
        ),
        proxy: path.join(root, 'proxy.conf.json'),
      };
    }
  }

  return null;
}

/**
 * Whether `file` lies strictly inside `dir` (not `dir` itself, not beside or above it).
 * @param {string} dir
 * @param {string} file
 * @returns {boolean}
 */
export function insideDir(dir, file) {
  const rel = path.relative(dir, file);

  return rel !== '' && !path.isAbsolute(rel) && rel.split(path.sep)[0] !== '..';
}

/**
 * How Pangular mounts in the app: SSR (build option or src/server.ts), a Vite config, else the standalone CLI.
 * @param {string} dir
 * @param {App} app
 * @returns {Mount}
 */
export function detectMount(dir, app) {
  const j = readProject(app.projectJson);
  const ssr =
    j.targets?.['build']?.options?.ssr ||
    existsSync(path.join(app.root, 'src', 'server.ts'));

  if (ssr) {
    return 'express-hub';
  }

  if (
    ['vite.config.ts', 'vite.config.mts', 'vite.config.js'].some(
      (f) =>
        existsSync(path.join(app.root, f)) || existsSync(path.join(dir, f)),
    )
  ) {
    return 'vite-plugin';
  }

  return 'standalone-cli';
}

/**
 * Whether main.ts imports the overlay, and whether a dev-mode guard is present.
 * @param {string} main
 * @returns {{ overlayImport: boolean, devGuard: boolean }}
 */
export function mainFacts(main) {
  return {
    overlayImport: main.includes(`import('${PKG}/overlay')`),
    devGuard:
      /typeof ngDevMode === 'undefined' \|\| ngDevMode|import\.meta\.env\.DEV/.test(
        main,
      ),
  };
}

/**
 * main.ts with the dev-guarded overlay import chained before `bootstrapApplication(...).catch(`, or null when that
 * call is not there.
 * @param {string} src
 * @returns {string | null}
 */
export function addOverlayImport(src) {
  const m = /bootstrapApplication\(([^)]*)\)(\s*)\.catch\(/.exec(src);

  if (!m) {
    return null;
  }

  return src.replace(
    m[0],
    `bootstrapApplication(${m[1]})${OVERLAY_SNIPPET}\n  .catch(`,
  );
}

/**
 * One human-readable doctor line. A page title, URL or console message can hold control characters, so they are
 * escaped rather than written to the terminal.
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
 * The serve target with `options.proxyConfig` set, keeping Nx's key order (executor, defaultConfiguration,
 * continuous, options, then the rest).
 * @param {NxTarget} serve
 * @param {string} rel
 * @returns {NxTarget}
 */
export function withProxyConfig(serve, rel) {
  const { executor, defaultConfiguration, continuous, options, ...rest } =
    serve;

  return {
    executor,
    defaultConfiguration,
    continuous,
    options: { ...options, proxyConfig: rel },
    ...rest,
  };
}

/**
 * The proxy file install writes, or why it refuses, so an app's own proxy entries survive install and remove. The
 * `/__pangular` entry is merged into the existing file. remove restores a tracked file from HEAD and deletes an
 * untracked one, so it refuses an untracked file with other entries, a tracked one whose other entries differ from
 * HEAD (uncommitted edits remove would drop), and a serve target that names another file.
 * @param {unknown} existing  the app's proxy.conf.json, parsed, or null when there is none
 * @param {unknown} head  that file at HEAD, parsed; undefined when git does not track it
 * @param {string | null | undefined} current  the serve target's options.proxyConfig
 * @param {string} rel  the proxy file install manages, repository-relative
 * @param {string} target  the devtools server's URL
 * @returns {{ proxy: Record<string, unknown> } | { refusal: string }}
 */
export function proxyPlan(existing, head, current, rel, target) {
  const tracked = head !== undefined;
  /** @param {unknown} v */
  const others = (v) =>
    JSON.stringify(
      Object.entries(v !== null && typeof v === 'object' ? v : {}).filter(
        ([k]) => k !== '/__pangular',
      ),
    );

  if (current && current !== rel) {
    return {
      refusal: `refused: serve.options.proxyConfig names ${current}, not ${rel}; add the /__pangular entry to ${current} by hand (SKILL.md "Launch" shows it)`,
    };
  }

  if (
    existing !== null &&
    (typeof existing !== 'object' || Array.isArray(existing))
  ) {
    return {
      refusal: `refused: ${rel} is not a key-per-path object (an array-form proxy config?); add the /__pangular entry by hand`,
    };
  }

  const entries = /** @type {Record<string, unknown>} */ (existing ?? {});
  const keys = Object.keys(entries).filter((k) => k !== '/__pangular');

  if (keys.length > 0 && !tracked) {
    return {
      refusal: `refused: ${rel} is not tracked by git and holds other entries (${keys.join(', ')}); remove deletes an untracked proxy file, so commit it first`,
    };
  }

  if (tracked && existing !== null && others(existing) !== others(head)) {
    return {
      refusal: `refused: ${rel} has uncommitted changes besides /__pangular; remove restores it from HEAD and would drop them, so commit them first`,
    };
  }

  return {
    proxy: {
      ...entries,
      '/__pangular': { target, pathRewrite: { '^/__pangular': '' }, ws: true },
    },
  };
}

/**
 * The lockfile's packages with every HEAD entry npm dropped put back, in npm's key order; unchanged when none was
 * dropped.
 * @param {Record<string, unknown>} head
 * @param {Record<string, unknown>} packages
 * @returns {{ packages: Record<string, unknown>, dropped: string[] }}
 */
export function withHeadLockEntries(head, packages) {
  const dropped = Object.keys(head).filter((k) => !(k in packages));

  if (dropped.length === 0) {
    return { packages, dropped };
  }

  const merged = {
    ...packages,
    ...Object.fromEntries(dropped.map((k) => [k, head[k]])),
  };

  return {
    packages: Object.fromEntries(
      Object.keys(merged)
        .sort((a, b) => a.localeCompare(b, 'en'))
        .map((k) => [k, merged[k]]),
    ),
    dropped,
  };
}

/**
 * The repo-relative, forward-slash paths install writes.
 * @param {App} app
 * @param {string} dir
 * @returns {string[]}
 */
export function managedPaths(app, dir) {
  return [
    'package.json',
    'package-lock.json',
    path.relative(dir, app.main),
    path.relative(dir, app.projectJson),
    path.relative(dir, app.proxy),
  ].map((p) => p.split(path.sep).join('/'));
}

/**
 * The paths in `git status --porcelain` output.
 * @param {string} stdout
 * @returns {string[]}
 */
export function porcelainPaths(stdout) {
  return stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => l.slice(3).trim());
}

/**
 * The `check` command's checks.
 * @param {SetupFacts} f
 * @param {string} dir
 * @param {number} port
 * @returns {Check[]}
 */
export function setupChecks(f, dir, port) {
  /** @type {Check[]} */
  const checks = [];
  /** @type {(name: string, ok: boolean, detail: string) => void} */
  const add = (name, ok, detail) => {
    checks.push({ name, status: ok ? 'pass' : 'fail', detail });
  };
  add(
    'declared-exact',
    f.declared === PINNED,
    `package.json declares ${f.declared ?? 'nothing'} (want exactly ${PINNED})`,
  );
  add(
    'installed',
    f.installed === PINNED,
    `node_modules has ${f.installed ?? 'nothing'}`,
  );
  add(
    'overlay-import',
    f.overlayImport,
    `${path.relative(dir, f.app.main)} ${f.overlayImport ? 'imports' : 'does not import'} ${PKG}/overlay`,
  );
  add(
    'dev-guard',
    f.devGuard,
    f.devGuard
      ? 'overlay import is guarded by ngDevMode / import.meta.env.DEV'
      : 'no ngDevMode / import.meta.env.DEV guard found',
  );
  add(
    'proxy-config',
    !!f.proxyConfig,
    `serve.options.proxyConfig = ${f.proxyConfig ?? 'unset'}`,
  );
  add(
    'proxy-target',
    f.proxyTarget === `http://localhost:${port}`,
    `/__pangular -> ${f.proxyTarget ?? 'none'}`,
  );

  return checks;
}

/**
 * doctor's read-only line: pass when a --read-only server lists no action tool, warn when started with
 * --allow-actions.
 * @param {boolean} readOnly
 * @param {string[]} toolNames
 * @returns {{ status: Check['status'], detail: string }}
 */
export function readOnlyCheck(readOnly, toolNames) {
  const actions = toolNames.map(short).filter((n) => ACTION_TOOLS.includes(n));

  if (!readOnly) {
    return {
      status: 'warn',
      detail: `started with --allow-actions: ${actions.join(', ')}`,
    };
  }

  return {
    status: actions.length === 0 ? 'pass' : 'fail',
    detail: `${toolNames.length} tools, action tools present: ${actions.join(', ') || 'none'}`,
  };
}

/**
 * doctor's console-errors line from `playwright-cli console error` output. The overlay probes /__connection.json
 * next to the page before /__pangular/; that 404 is expected (measured). "No devtools server found" fails.
 * @param {string} stdout
 * @param {number} port
 * @returns {{ status: Check['status'], detail: string }}
 */
export function consoleCheck(stdout, port) {
  const errs = stdout
    .split(/\r?\n/)
    .filter(
      (l) => l.startsWith('[ERROR]') && !l.includes('/__connection.json'),
    );
  const noServer = errs.some((l) => l.includes('No devtools server found'));

  if (errs.length === 0) {
    return {
      status: 'pass',
      detail: 'no console errors besides the expected /__connection.json 404',
    };
  }

  return {
    status: noServer ? 'fail' : 'warn',
    detail: `${errs.length} console error(s): ${(errs[0] ?? '').slice(0, 200)}${noServer ? ` (the proxy did not reach port ${port})` : ''}`,
  };
}

/**
 * The component-tree resource as an indented outline: nodes below `depth` dropped, and with a filter only the
 * nodes whose name or tag match or that have a matching descendant.
 * @param {{ nodes: TreeNode[] }} tree
 * @param {string | undefined} filter  lower case
 * @param {number} depth
 * @returns {string}
 */
export function componentOutline(tree, filter, depth) {
  /** @type {string[]} */
  const lines = [];
  /** @type {(n: TreeNode) => boolean} */
  const keep = (n) =>
    !filter ||
    `${n.name} ${n.tag}`.toLowerCase().includes(filter) ||
    (n.children ?? []).some(keep);
  /** @type {(n: TreeNode, d: number) => void} */
  const walk = (n, d) => {
    if (d >= depth || !keep(n)) {
      return;
    }

    lines.push(`${'  '.repeat(d)}${n.name} <${n.tag}> ${n.id}`);
    (n.children ?? []).forEach((c) => walk(c, d + 1));
  };
  tree.nodes.forEach((n) => walk(n, 0));

  return lines.join('\n');
}

/**
 * The resource `id` names: its URI, its name, or the end of its decoded URI.
 * @param {Resource[]} all
 * @param {string | undefined} id
 * @returns {Resource | undefined}
 */
export function findResource(all, id) {
  return id
    ? all.find(
        (x) =>
          x.uri === id ||
          x.name === id ||
          decodeURIComponent(x.uri).endsWith(id),
      )
    : undefined;
}

// ---------- process and tool access ----------

/**
 * @param {string} file
 * @returns {ProjectJson}
 */
function readProject(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

/**
 * @param {string} bin  'npm' (run as node npm-cli.js beside this node) or 'git'
 * @param {string[]} args
 * @param {string} cwd
 * @returns {Run}
 */
function run(bin, args, cwd) {
  const [file, full] =
    bin === 'npm' ? [process.execPath, [NPM_CLI, ...args]] : [bin, args];
  const r = spawnSync(file, full, {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 64 * 1024 * 1024,
  });

  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

/**
 * @param {string} dir
 * @param {string[]} args
 */
function git(dir, args) {
  return run('git', args, dir);
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
 * Runs playwright-cli through node, from the npm shim's folder on PATH (absolute PATH entries only).
 * @param {string[]} args
 * @returns {Run}
 */
function playwrightCli(args) {
  const shimDir = (process.env['PATH'] ?? '')
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

  if (!js || !existsSync(js)) {
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

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- CLI ----------

const argv = process.argv.slice(2);
const cmd = argv[0];
/** @param {string} name */
const str = (name) => {
  const v = flagIn(argv, name);

  return typeof v === 'string' ? v : undefined;
};
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

const appDir = () =>
  path.resolve(
    str('dir') ?? process.env['CONTROL_PANGULAR_DIR'] ?? PORTAL_DEFAULT_DIR,
  );
/** @returns {number} the --port value, else the default; a value that is no port is a refusal */
const port = () => {
  const given = flagIn(argv, 'port');
  const raw =
    given === undefined ? String(DEFAULT_PORT) : given === true ? '' : given;
  const n = Number(raw);

  if (raw === '' || !Number.isInteger(n) || n < 1 || n > 65535) {
    return fail(
      2,
      `refused: --port ${raw === '' ? 'needs a value' : `${raw} is not a port number`}`,
    );
  }

  return n;
};

// ---------- the app's Pangular setup ----------

/**
 * @param {string} dir
 * @returns {string | null}
 */
function installedVersion(dir) {
  const pj = path.join(dir, 'node_modules', PKG, 'package.json');

  return existsSync(pj)
    ? /** @type {{ version: string }} */ (JSON.parse(readFileSync(pj, 'utf8')))
        .version
    : null;
}

/**
 * @param {string} dir
 * @returns {SetupFacts}
 */
function setupFacts(dir) {
  const app = findApp(dir, str('project'));

  if (!app) {
    return fail(
      2,
      `no Nx application with an @angular/build:dev-server serve target under ${dir}/apps (pass --dir, --project)`,
    );
  }

  refuseOutside(dir, app);

  /** @type {{ dependencies?: Record<string, string>, devDependencies?: Record<string, string> }} */
  const manifest = JSON.parse(
    readFileSync(path.join(dir, 'package.json'), 'utf8'),
  );
  const declared =
    manifest.devDependencies?.[PKG] ?? manifest.dependencies?.[PKG] ?? null;
  const main = existsSync(app.main) ? readFileSync(app.main, 'utf8') : '';
  const serveOptions =
    readProject(app.projectJson).targets?.['serve']?.options ?? {};
  /** @type {Record<string, { target?: string }> | null} */
  const proxy = existsSync(app.proxy)
    ? JSON.parse(readFileSync(app.proxy, 'utf8'))
    : null;

  return {
    app,
    mount: detectMount(dir, app),
    declared,
    installed: installedVersion(dir),
    ...mainFacts(main),
    proxyConfig: serveOptions.proxyConfig ?? null,
    proxyTarget: proxy?.['/__pangular']?.target ?? null,
  };
}

/**
 * install rewrites and remove deletes the main file, so it must lie inside the checkout.
 * @param {string} dir
 * @param {App} app
 */
function refuseOutside(dir, app) {
  if (!insideDir(dir, app.main)) {
    fail(
      2,
      `refused: ${app.projectJson} names a main file outside ${dir} (${app.main})`,
      { main: app.main },
    );
  }
}

/** @param {string} dir */
function dirtyPaths(dir) {
  return porcelainPaths(
    git(dir, ['status', '--porcelain', '--untracked-files=all']).stdout,
  );
}

// npm 11 drops 27 lockfile entries from this checkout's committed lockfile on any install (measured on HEAD, without
// Pangular). Put back what HEAD has and npm removed, so the diff holds only what the new package adds.
/**
 * @param {string} dir
 * @returns {number}
 */
function keepHeadLockEntries(dir) {
  const head = git(dir, ['show', 'HEAD:package-lock.json']);

  if (head.status !== 0) {
    return 0;
  }

  const file = path.join(dir, 'package-lock.json');
  /** @type {{ packages?: Record<string, unknown> }} */
  const before = JSON.parse(head.stdout);
  /** @type {{ packages: Record<string, unknown> }} */
  const lock = JSON.parse(readFileSync(file, 'utf8'));
  const { packages, dropped } = withHeadLockEntries(
    before.packages ?? {},
    lock.packages,
  );

  if (dropped.length) {
    lock.packages = packages;
    writeFileSync(file, JSON.stringify(lock, null, 2) + '\n');
  }

  return dropped.length;
}

function install() {
  const dir = appDir();
  const f = setupFacts(dir);
  /** @type {string[]} */
  const notes = [];

  if (f.mount !== 'standalone-cli') {
    fail(
      2,
      `mount ${f.mount} detected: this script automates only the standalone CLI mount of a client-only app. Follow SKILL.md "Other mounts" for ${f.mount === 'express-hub' ? 'initPangularHub() in server.ts' : 'the pangular() Vite plugin'}.`,
      { mount: f.mount },
    );
  }

  // Decided before any change: install never drops an app's own proxy entries.
  const target = `http://localhost:${port()}`;
  const rel = path.relative(dir, f.app.proxy).split(path.sep).join('/');
  const existing = existsSync(f.app.proxy)
    ? JSON.parse(readFileSync(f.app.proxy, 'utf8'))
    : null;
  const atHead = existing === null ? null : git(dir, ['show', `HEAD:./${rel}`]);
  /** @type {unknown} */
  let head;

  if (atHead !== null && atHead.status === 0) {
    try {
      head = JSON.parse(atHead.stdout);
    } catch {
      head = null;
    }
  }

  const proxy = proxyPlan(existing, head, f.proxyConfig, rel, target);

  if ('refusal' in proxy) {
    fail(2, proxy.refusal);
  }

  if (f.declared !== PINNED || f.installed !== PINNED) {
    const r = run(
      'npm',
      ['install', '--save-dev', '--save-exact', `${PKG}@${PINNED}`],
      dir,
    );

    if (r.status !== 0) {
      fail(2, `npm install failed: ${(r.stderr || r.stdout).slice(-800)}`);
    }

    notes.push(`npm install --save-dev --save-exact ${PKG}@${PINNED}`);
    notes.push(
      `lockfile: kept ${keepHeadLockEntries(dir)} HEAD entries npm dropped for reasons unrelated to ${PKG}`,
    );
  } else {
    notes.push(`${PKG}@${PINNED} already declared and installed`);
  }

  if (!f.overlayImport) {
    const next = addOverlayImport(readFileSync(f.app.main, 'utf8'));

    if (next === null) {
      fail(
        2,
        `could not find "bootstrapApplication(...).catch(" in ${f.app.main}; add the overlay import by hand (SKILL.md "Install")`,
      );
    }

    writeFileSync(f.app.main, next);
    notes.push(`overlay import added to ${f.app.main}`);
  }

  writeFileSync(f.app.proxy, JSON.stringify(proxy.proxy, null, 2) + '\n');
  notes.push(
    `proxy /__pangular -> ${target} in ${f.app.proxy}${existing === null ? '' : ' (merged into the existing file)'}`,
  );
  const pj = readProject(f.app.projectJson);
  const targets = pj.targets ?? {};
  const serve = targets['serve'] ?? {};

  if (serve.options?.proxyConfig !== rel) {
    targets['serve'] = withProxyConfig(serve, rel);
    writeFileSync(f.app.projectJson, JSON.stringify(pj, null, 2) + '\n');
    notes.push(`serve.options.proxyConfig = ${rel}`);
  }

  const prettier = path.join(
    dir,
    'node_modules',
    'prettier',
    'bin',
    'prettier.cjs',
  );

  if (existsSync(prettier)) {
    const pr = spawnSync(
      process.execPath,
      [prettier, '--write', f.app.main, f.app.projectJson, f.app.proxy],
      { cwd: dir, encoding: 'utf8', windowsHide: true },
    );
    notes.push(
      `formatted with the repo's prettier: ${pr.status === 0 ? 'ok' : pr.stderr.trim()}`,
    );
  }

  out(
    {
      ok: true,
      command: 'install',
      dir,
      project: f.app.name,
      mount: f.mount,
      notes,
      changed: dirtyPaths(dir),
    },
    0,
  );
}

function check() {
  const dir = appDir();
  const f = setupFacts(dir);
  const checks = setupChecks(f, dir, port());
  const failed = checks.filter((c) => c.status === 'fail');
  out(
    {
      ok: failed.length === 0,
      command: 'check',
      dir,
      project: f.app.name,
      mount: f.mount,
      checks,
    },
    failed.length === 0 ? 0 : 1,
  );
}

function remove() {
  const dir = appDir();
  const app = findApp(dir, str('project'));

  if (!app) {
    return fail(2, `no Nx application found under ${dir}`);
  }

  refuseOutside(dir, app);

  const managed = managedPaths(app, dir);
  const foreign = dirtyPaths(dir).filter((p) => !managed.includes(p));

  if (foreign.length) {
    fail(
      2,
      `refused: the worktree has changes this skill did not make (${foreign.join(', ')}); remove restores files from git and would discard them`,
      { foreign },
    );
  }

  const tracked = managed.filter(
    (p) => git(dir, ['ls-files', '--error-unmatch', p]).status === 0,
  );
  const r = git(dir, ['checkout', 'HEAD', '--', ...tracked]);

  if (r.status !== 0) {
    fail(2, `git checkout failed: ${r.stderr}`);
  }

  for (const p of managed.filter((x) => !tracked.includes(x))) {
    rmSync(path.join(dir, p), { force: true });
  }

  const n = run('npm', ['install', '--no-audit', '--no-fund'], dir); // prunes node_modules back to the restored lockfile

  if (n.status !== 0) {
    fail(
      2,
      `npm install (prune) failed: ${(n.stderr || n.stdout).slice(-800)}`,
    );
  }

  git(dir, ['checkout', 'HEAD', '--', 'package-lock.json']); // undo npm's unrelated lockfile drift (see keepHeadLockEntries)

  const left = dirtyPaths(dir);
  const diff = git(dir, ['diff', '--stat', 'HEAD']).stdout.trim();
  out(
    {
      ok: left.length === 0 && !diff,
      command: 'remove',
      dir,
      restored: tracked,
      deleted: managed.filter((x) => !tracked.includes(x)),
      installed: installedVersion(dir),
      gitStatus: left,
      gitDiffStat: diff,
    },
    left.length === 0 && !diff ? 0 : 1,
  );
}

// ---------- the standalone devtools server ----------

/** @param {number} p */
function statePath(p) {
  return path.join(STATE_DIR, `pangular-${p}.json`);
}

/** @returns {State} */
function readState() {
  const p = statePath(port());

  if (!existsSync(p)) {
    const files = existsSync(STATE_DIR) ? readdirSync(STATE_DIR) : [];
    fail(
      2,
      `no state file at ${p}: nothing was started by this skill on port ${port()}${files.length ? ` (found ${files.join(', ')}; pass --port)` : ''}`,
    );
  }

  return JSON.parse(readFileSync(p, 'utf8'));
}

async function up() {
  const dir = appDir();
  const p = port();
  mkdirSync(STATE_DIR, { recursive: true });

  if (existsSync(statePath(p))) {
    fail(2, `a state file already exists for port ${p}; run down first`, {
      state: statePath(p),
    });
  }

  const bin = path.join(dir, 'node_modules', PKG, 'bin.mjs');

  if (!existsSync(bin)) {
    fail(2, `${PKG} is not installed in ${dir}; run install first`);
  }

  const appUrl = str('app-url') ?? null;
  /** @type {PortRow[]} */
  let rows;

  try {
    rows = portRows(dir, p, appUrl, str('project'));
  } catch (error) {
    return fail(
      2,
      `refused: --app-url ${appUrl}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // A busy fixed port is never taken over: it may be another session's devtools server or Lars's own.
  const plan = planPorts(rows, [0], await busyPorts(candidatePorts(rows, [0])));

  if (!plan.ok) {
    return fail(2, `refused: ${plan.reason}`);
  }

  const readOnly = !argv.includes('--allow-actions');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const evidenceDir = path.join(SCRATCH, `pangular-${p}-${stamp}`);
  mkdirSync(evidenceDir, { recursive: true });
  const log = path.join(evidenceDir, 'pangular.log');
  const args = [
    bin,
    'dev',
    '--port',
    String(p),
    '--no-open',
    '--root',
    dir,
    ...(readOnly ? ['--read-only'] : []),
  ];
  const fd = openSync(log, 'a');
  const t0 = Date.now();
  const child = spawn(
    process.execPath,
    [fileURLToPath(import.meta.url), '__serve', ...args],
    {
      cwd: dir,
      detached: true,
      stdio: ['ignore', fd, fd],
    },
  );
  const notAfter = Date.now();
  child.unref();
  const pid = child.pid;

  if (pid === undefined) {
    return fail(2, `pangular did not start; see ${log}`);
  }

  /** @type {State} */
  const state = {
    mode: 'launch',
    dir,
    port: p,
    ports: plan.ports,
    readOnly,
    mcpUrl: `http://localhost:${p}/__mcp`,
    origin: `http://localhost:${p}`,
    appUrl,
    session: `pangular-${p}`,
    evidenceDir,
    log,
    pid,
    tree: snapshot(pid, { notBefore: t0, notAfter }),
    startedAt: new Date().toISOString(),
  };
  writeFileSync(statePath(p), JSON.stringify(state, null, 2));

  for (;;) {
    /** @type {RpcResponse | { error: string, result?: undefined }} */
    const r = await mcp(state, 'initialize', initParams()).catch((e) => ({
      error: e instanceof Error ? e.message : String(e),
    }));

    const live = liveTree(state);
    const exited = live.length === 0;
    const seen = merge(state.tree ?? [], live);

    // Every poll's snapshot is kept, so a run that fails before it answers leaves down its whole tree.
    if (seen.length !== (state.tree ?? []).length) {
      state.tree = seen;
      writeFileSync(statePath(p), JSON.stringify(state, null, 2));
    }
    // Another process took the port after the check: it can answer initialize before this server fails to bind.
    const foreign =
      r.result || exited
        ? ((await busyPorts([p])).get(p) ?? []).find(
            (holder) => !live.some((x) => x.pid === holder),
          )
        : undefined;

    if (foreign !== undefined) {
      const refusal = `refused: fixed port pangular ${p} held by PID ${foreign}; pinned by ${plan.ports[0]?.reason}`;
      const { records, result } = stopRun(state);
      const stopped = downOutcome(state, result);

      if (stopped.code !== 0) {
        state.tree = records;
        writeFileSync(statePath(p), JSON.stringify(state, null, 2));
        fail(
          2,
          `${refusal}; stopping what this run started failed: ${stopped.reason}; run down`,
          { state: statePath(p), notes: stopped.notes },
        );
      }

      rmSync(statePath(p), { force: true });
      fail(2, refusal);
    }

    if (r.result) {
      state.tree = merge(state.tree ?? [], live);
      writeFileSync(statePath(p), JSON.stringify(state, null, 2));
      break;
    }

    if (exited) {
      fail(
        2,
        `pangular (PID ${pid}) exited before it answered; see ${log}; run down`,
        { state: statePath(p) },
      );
    }

    if (Date.now() - t0 > 60000) {
      fail(
        2,
        `pangular not answering on ${state.mcpUrl} after 60 s; see ${log}; run down`,
      );
    }

    await sleep(300);
  }

  out(
    {
      ok: true,
      command: 'up',
      readyInSeconds: Math.round((Date.now() - t0) / 100) / 10,
      statePath: statePath(p),
      ...state,
    },
    0,
  );
}

// ---------- MCP over HTTP (plain JSON-RPC; no MCP client needed) ----------
const initParams = () => ({
  protocolVersion: '2025-06-18',
  capabilities: {},
  clientInfo: { name: 'control-pangular-inspector', version: '1' },
});
let rpcId = 0;

/**
 * One JSON-RPC request to the devtools server. Never rejects: a request error comes back as `httpStatus` 0 with the
 * error in `body`.
 * @param {{ mcpUrl: string, origin: string }} state
 * @param {string} method
 * @param {object} [params]
 * @param {{ origin?: string | null }} [options]
 * @returns {Promise<RpcResponse>}
 */
export async function mcp(
  state,
  method,
  params,
  { origin = state.origin } = {},
) {
  /** @type {Record<string, string>} */
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };
  const token = process.env['PANGULAR_MCP_TOKEN'];

  if (origin) {
    headers['Origin'] = origin;
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // node:http without keep-alive: process.exit with an open fetch socket trips a libuv assertion on Windows (measured)
  /** @type {{ status: number | undefined, text: string }} */
  const res = await new Promise((resolve) => {
    const req = http.request(
      state.mcpUrl,
      { method: 'POST', headers, agent: false, timeout: 20000 },
      (r) => {
        let buf = '';
        r.setEncoding('utf8');
        r.on('data', (c) => (buf += c));
        r.on('end', () => resolve({ status: r.statusCode, text: buf }));
      },
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    // A server that is down is a result (HTTP 0 and the error), so doctor and call name it instead of crashing.
    req.on('error', (e) => {
      const code = /** @type {NodeJS.ErrnoException} */ (e).code;
      resolve({
        status: 0,
        text: [code, e.message].filter(Boolean).join(': ') || 'request failed',
      });
    });
    req.end(
      JSON.stringify({
        jsonrpc: '2.0',
        id: ++rpcId,
        method,
        ...(params ? { params } : {}),
      }),
    );
  });
  const text = res.text;

  if (res.status !== 200) {
    return { httpStatus: res.status ?? 0, body: text.slice(0, 300) };
  }

  return { httpStatus: 200, ...parseRpcText(text) };
}

/**
 * The server's tools, or null with why tools/list failed (a server that is down: `HTTP 0: ECONNREFUSED`).
 * @param {State} state
 * @returns {Promise<{ list: Tool[] | null, why: string }>}
 */
async function toolList(state) {
  const r = await mcp(state, 'tools/list');
  const list = r.result?.tools ?? null;

  return {
    list,
    why: list
      ? ''
      : `tools/list failed on ${state.mcpUrl}: ${r.httpStatus === 200 ? JSON.stringify(r.error ?? null) : `HTTP ${r.httpStatus}: ${r.body}`}`,
  };
}

async function tools() {
  const state = readState();
  const { list, why } = await toolList(state);

  if (!list) {
    return fail(2, why);
  }

  /** @type {Record<string, unknown>} */
  const result = {
    ok: true,
    command: 'tools',
    mcpUrl: state.mcpUrl,
    count: list.length,
    actionToolsPresent: list
      .map((t) => short(t.name))
      .filter((n) => ACTION_TOOLS.includes(n)),
    tools: list.map((t) => ({
      name: t.name,
      readOnly: t.annotations?.readOnlyHint === true,
    })),
  };
  result['savedTo'] = save(state, result);
  out(result, 0);
}

/**
 * Where --out writes: resolved against the run's evidence directory, refused outside it.
 * @param {{ evidenceDir: string }} state
 * @returns {string | undefined}
 */
function outPath(state) {
  const outFile = str('out');

  if (!outFile) {
    return undefined;
  }

  const file = path.resolve(state.evidenceDir, outFile);

  if (!insideDir(state.evidenceDir, file)) {
    fail(
      2,
      `refused: --out ${outFile} lies outside the evidence directory ${state.evidenceDir}`,
    );
  }

  return file;
}

/**
 * @param {{ evidenceDir: string }} state
 * @param {Record<string, unknown>} result
 * @returns {string | undefined}
 */
function save(state, result) {
  const file = outPath(state);

  if (file === undefined) {
    return undefined;
  }

  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(result, null, 2));

  return file;
}

async function call() {
  const name = argv[1];

  if (!name || name.startsWith('--')) {
    return fail(
      2,
      'usage: call <tool> [--args <json>] [--confirm] [--out <file>]',
    );
  }

  const refusal = callRefusal(name, argv.includes('--confirm'));

  if (refusal) {
    fail(2, refusal);
  }

  /** @type {Record<string, unknown>} */
  let args = {};

  try {
    const raw = str('args');
    args = raw ? JSON.parse(raw) : {};
  } catch (e) {
    fail(
      2,
      `--args is not JSON: ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  const state = readState();
  outPath(state);
  const { list, why } = await toolList(state);

  if (!list) {
    return fail(2, why);
  }

  const tool = list.find((t) => short(t.name) === short(name));

  if (!tool) {
    return fail(
      2,
      `no tool ${name} on ${state.mcpUrl}${state.readOnly && ACTION_TOOLS.includes(short(name)) ? ' (the server runs --read-only)' : ''}; available: ${list.map((t) => short(t.name)).join(', ')}`,
    );
  }

  const r = await mcp(state, 'tools/call', {
    name: tool.name,
    arguments: args,
  });
  const text = (r.result?.content ?? [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n');
  /** @type {Record<string, unknown> & { ok: boolean }} */
  const result = {
    ok: !!r.result && !r.result.isError,
    command: 'call',
    tool: tool.name,
    arguments: args,
    isError: r.result?.isError ?? null,
    text,
    error: r.error ?? (r.httpStatus !== 200 ? r : undefined),
  };
  result['savedTo'] = save(state, result);
  out(result, result.ok ? 0 : 1);
}

async function resource() {
  const id = argv[1];
  const state = readState();
  const list = await mcp(state, 'resources/list');

  if (list.httpStatus !== 200) {
    return fail(
      2,
      `resources/list failed on ${state.mcpUrl}: HTTP ${list.httpStatus}: ${list.body}`,
    );
  }

  const all = list.result?.resources ?? [];
  const hit = findResource(all, id);

  if (!hit) {
    return fail(
      2,
      `usage: resource <id>; available: ${all.map((x) => decodeURIComponent(x.uri)).join(', ')}`,
    );
  }

  const r = await mcp(state, 'resources/read', { uri: hit.uri });
  /** @type {Record<string, unknown> & { ok: boolean }} */
  const result = {
    ok: !!r.result,
    command: 'resource',
    uri: hit.uri,
    contents: (r.result?.contents ?? []).map((c) => c.text ?? c),
  };
  result['savedTo'] = save(state, result);
  out(result, result.ok ? 0 : 1);
}

async function doctor() {
  const state = readState();
  const dir = state.dir;
  /** @type {Check[]} */
  const checks = [];
  /** @type {(name: string, status: Check['status'], detail: string) => void} */
  const add = (name, status, detail) => {
    checks.push({ name, status, detail });
  };
  const fresh = mapFresh(SKILL_DIR);
  add('map-fresh', fresh.status, fresh.detail);
  const f = setupFacts(dir);
  add(
    'package-pinned',
    f.declared === PINNED && f.installed === PINNED ? 'pass' : 'fail',
    `declared ${f.declared ?? 'none'}, installed ${f.installed ?? 'none'}, pin ${PINNED}`,
  );
  add(
    'overlay-import',
    f.overlayImport && f.devGuard ? 'pass' : 'fail',
    f.overlayImport
      ? f.devGuard
        ? 'dev-guarded overlay import in main'
        : 'overlay import without a dev guard'
      : 'no overlay import in main',
  );
  const root = rootOf(state);
  const live = liveTree(state);
  add(
    'process-alive',
    root !== undefined && live.length > 0 ? 'pass' : 'fail',
    root !== undefined && live.length > 0
      ? `PID ${state.pid} since ${new Date(root.start).toISOString()}`
      : `PID ${state.pid} is gone or reused`,
  );
  const recorded = merge(state.tree ?? [], live);

  // Written only while the state file is there and the record changed: a down that just removed it stays done.
  if (
    existsSync(statePath(port())) &&
    JSON.stringify(recorded) !== JSON.stringify(state.tree ?? [])
  ) {
    state.tree = recorded;
    writeFileSync(statePath(port()), JSON.stringify(state, null, 2));
  }

  add('tree', 'pass', `${recorded.length} process(es) recorded for down`);
  // A state file written before ports were recorded: check its one port.
  /** @type {PortEntry[]} */
  const recordedPorts = state.ports ?? [
    { name: 'pangular', port: state.port, kind: 'fixed' },
  ];
  const ports = portsCheck(
    recordedPorts,
    await busyPorts(recordedPorts.map((p) => p.port)),
    new Set(live.map((r) => r.pid)),
  );
  add('ports', ports.status, ports.detail);

  const noOrigin = await mcp(state, 'initialize', initParams(), {
    origin: null,
  });
  add(
    'mcp-origin-guard',
    noOrigin.httpStatus === 403 ? 'pass' : 'fail',
    `POST without Origin -> ${noOrigin.httpStatus} (want 403)`,
  );
  const init = await mcp(state, 'initialize', initParams());
  const tokenNote = process.env['PANGULAR_MCP_TOKEN']
    ? 'with Bearer token'
    : 'no token (the standalone CLI asks for none; a hub mount needs PANGULAR_MCP_TOKEN)';
  add(
    'mcp-initialize',
    init.result ? 'pass' : 'fail',
    init.result
      ? `${init.result.serverInfo?.name} ${init.result.serverInfo?.version}, local Origin, ${tokenNote}`
      : `HTTP ${init.httpStatus}: ${init.body ?? JSON.stringify(init.error)}`,
  );
  const tools = await toolList(state);
  const list = tools.list ?? [];

  // No tool list is no evidence of read-only.
  if (tools.list === null) {
    add('read-only', 'fail', tools.why);
  } else {
    const ro = readOnlyCheck(
      state.readOnly,
      list.map((t) => t.name),
    );
    add('read-only', ro.status, ro.detail);
  }

  const appUrl = str('app-url') ?? state.appUrl;

  if (!appUrl) {
    add(
      'overlay-connected',
      'skip',
      'no --app-url: pass the portal URL (control-angular-dev-app info) to check the page',
    );
  } else {
    // The overlay asks for the one-time code in a prompt, at a moment of its own choosing (before or after it sets
    // its page id, measured both ways); the code is printed in the server log, as a user would read it.
    let answered = false;
    /** @type {(probe: Run) => Promise<boolean>} */
    const answerPrompt = async (probe) => {
      if (!/modal state/i.test(probe.stdout + probe.stderr)) {
        return false;
      }

      await sleep(500);
      const otp = existsSync(state.log)
        ? authCodeIn(readFileSync(state.log, 'utf8'))
        : null;
      const acc = playwrightCli([
        `-s=${state.session}`,
        'dialog-accept',
        otp ?? '',
      ]);

      if (!answered) {
        add(
          'auth-code',
          otp && acc.status === 0 ? 'pass' : 'fail',
          otp
            ? `entered the one-time code from ${path.basename(state.log)} into the overlay prompt`
            : 'prompt shown but no auth code in the server log',
        );
      }

      answered = true;

      return true;
    };
    await answerPrompt(
      playwrightCli([`-s=${state.session}`, '--raw', 'eval', '() => 1']),
    );
    let r = playwrightCli([`-s=${state.session}`, 'goto', appUrl]);

    if (
      r.status !== 0 ||
      /not open|is not running|No browser/i.test(r.stdout + r.stderr)
    ) {
      r = playwrightCli([`-s=${state.session}`, 'open', appUrl]);
    }

    if (r.status !== 0) {
      add(
        'browser-session',
        'fail',
        `playwright-cli session ${state.session}: ${(r.stderr || r.stdout).slice(0, 300)}`,
      );
    } else {
      add('browser-session', 'pass', `session ${state.session} on ${appUrl}`);
      const code =
        "async page => { await page.waitForFunction(() => typeof window.__pangularPageId === 'string', null, { timeout: 3000 }).catch(() => {}); return await page.evaluate(() => ({ pageId: window.__pangularPageId ?? null, ngVersion: document.querySelector('[ng-version]')?.getAttribute('ng-version') ?? null, devBuild: typeof window.ng === 'object' })); }";
      /** @type {PageProbe} */
      let page = {};
      /** @type {Run} */
      let pr = { status: null, stdout: '', stderr: '' };

      for (let i = 0; i < 6 && !page.pageId; i++) {
        pr = playwrightCli([`-s=${state.session}`, '--raw', 'run-code', code]);

        if (await answerPrompt(pr)) {
          continue;
        }

        try {
          page = JSON.parse(pr.stdout.trim());
        } catch {
          page = {};
        }
      }

      add(
        'dev-build',
        page.devBuild ? 'pass' : 'fail',
        page.devBuild
          ? `window.ng present, Angular ${page.ngVersion}`
          : 'window.ng missing: production build, overlay has nothing to read',
      );
      add(
        'overlay-page-id',
        page.pageId ? 'pass' : 'fail',
        page.pageId
          ? `window.__pangularPageId = ${page.pageId}`
          : `window.__pangularPageId not set within 15 s (${pr.stdout.slice(0, 200)})`,
      );
      let listed = false;
      let text = '';

      for (let i = 0; i < 20 && page.pageId && !listed; i++) {
        const lp = await mcp(state, 'tools/call', {
          name:
            list.find((t) => short(t.name) === 'list-pages')?.name ??
            'pangular_list-pages',
          arguments: {},
        });
        text = (lp.result?.content ?? []).map((c) => c.text).join('\n');
        listed = text.includes(page.pageId);

        if (!listed) {
          await answerPrompt(
            playwrightCli([`-s=${state.session}`, '--raw', 'eval', '() => 1']),
          );
          await sleep(500);
        }
      }

      add(
        'overlay-connected',
        listed ? 'pass' : 'fail',
        listed
          ? `list-pages reports page ${page.pageId}`
          : `list-pages does not show ${page.pageId ?? 'the page'}: ${text.slice(0, 200)}`,
      );
      const ce = consoleCheck(
        playwrightCli([`-s=${state.session}`, 'console', 'error']).stdout,
        state.port,
      );
      add('console-errors', ce.status, ce.detail);
    }
  }

  const failed = checks.filter((c) => c.status === 'fail');
  /** @type {Record<string, unknown> & { checks: Check[] }} */
  const result = {
    ok: failed.length === 0,
    command: 'doctor',
    port: state.port,
    mcpUrl: state.mcpUrl,
    session: state.session,
    checks,
  };
  result['savedTo'] = save(state, result);
  out(result, failed.length === 0 ? 0 : 1);
}

// list-components when the server has it (unreleased after 0.0.7), else the same outline built from the
// pangular:component-tree resource.
async function components() {
  const state = readState();
  const filter = str('filter')?.toLowerCase();
  const depth = Number(str('depth') ?? Infinity);
  const { list, why } = await toolList(state);

  if (!list) {
    return fail(2, why);
  }

  const tool = list.find((t) => short(t.name) === 'list-components');
  let text;
  let source;

  if (tool) {
    const r = await mcp(state, 'tools/call', {
      name: tool.name,
      arguments: {
        ...(filter ? { filter } : {}),
        ...(Number.isFinite(depth) ? { depth } : {}),
      },
    });
    text = (r.result?.content ?? []).map((c) => c.text).join('\n');
    source = tool.name;
  } else {
    const res = (await mcp(state, 'resources/list')).result?.resources ?? [];
    const uri = res.find((x) =>
      decodeURIComponent(x.uri).endsWith('pangular:component-tree'),
    )?.uri;
    const r = uri && (await mcp(state, 'resources/read', { uri }));
    const first = r ? r.result?.contents?.[0]?.text : undefined;
    /** @type {{ nodes: TreeNode[] }} */
    const tree = first ? JSON.parse(first) : { nodes: [] };
    text = componentOutline(tree, filter, depth);
    source =
      'resource pangular:component-tree (list-components is not in this version)';
  }

  /** @type {Record<string, unknown> & { ok: boolean }} */
  const result = { ok: !!text, command: 'components', source, text };
  result['savedTo'] = save(state, result);
  out(result, result.ok ? 0 : 1);
}

// Fallback with no running app: the pangular CLI's stdio MCP server (source scan tools only).
async function scan() {
  const name = argv[1];
  const dir = appDir();
  const root = path.resolve(dir, str('root') ?? '.');
  const bin = path.join(dir, 'node_modules', PKG, 'bin.mjs');

  if (!name || name.startsWith('--') || !existsSync(bin)) {
    return fail(
      2,
      !existsSync(bin)
        ? `${PKG} is not installed in ${dir}`
        : 'usage: scan <get-routes|get-components|get-signals|get-providers|get-pipes|get-ngrx-store|build-meta> [--root <dir>] [--out <file>]',
    );
  }

  const child = spawn(
    process.execPath,
    [bin, 'mcp', '--root', root, '--read-only'],
    { cwd: dir, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true },
  );
  /** @type {Map<number, (msg: RpcMessage) => void>} */
  const pending = new Map();
  let buf = '';
  let stderr = '';
  child.stderr.on('data', (d) => (stderr += d));
  child.stdout.on('data', (d) => {
    buf += d;
    let i;

    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);

      if (line) {
        /** @type {RpcMessage} */
        const msg = JSON.parse(line);
        pending.get(msg.id ?? -1)?.(msg);
      }
    }
  });
  /** @type {(method: string, params: object | undefined, id: number) => Promise<RpcMessage>} */
  const request = (method, params, id) =>
    new Promise((resolve) => {
      pending.set(id, resolve);
      child.stdin.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          method,
          ...(params ? { params } : {}),
        }) + '\n',
      );
    });
  const timer = setTimeout(() => {
    child.kill();
    fail(
      2,
      `stdio MCP server did not answer within 60 s: ${stderr.slice(0, 300)}`,
    );
  }, 60000);
  await request('initialize', initParams(), 1);
  child.stdin.write(
    JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) +
      '\n',
  );
  const list = await request('tools/list', undefined, 2);
  const tool = list.result?.tools?.find((t) => short(t.name) === short(name));

  if (!tool) {
    child.kill();

    return fail(
      2,
      `no source tool ${name}; stdio has: ${(list.result?.tools ?? []).map((t) => short(t.name)).join(', ')}`,
    );
  }

  const r = await request('tools/call', { name: tool.name, arguments: {} }, 3);
  clearTimeout(timer);
  child.kill();
  const text = (r.result?.content ?? []).map((c) => c.text).join('\n');
  /** @type {Record<string, unknown> & { ok: boolean }} */
  const result = {
    ok: !!r.result && !r.result.isError,
    command: 'scan',
    root,
    tool: tool.name,
    warnings: stderr.trim() || undefined,
    text,
  };
  result['savedTo'] = save({ evidenceDir: path.join(SCRATCH, 'scan') }, result);
  out(result, result.ok ? 0 : 1);
}

function info() {
  out(
    { ok: true, command: 'info', statePath: statePath(port()), ...readState() },
    0,
  );
}

function down() {
  const sp = statePath(port());
  const state = readState();
  const close = playwrightCli([`-s=${state.session}`, 'close']);
  const { records, result } = stopRun(state);
  const outcome = downOutcome(state, result);
  const notes = [
    `session ${state.session}: ${close.status === 0 ? 'closed' : 'was not open'}`,
    ...outcome.notes,
  ];

  if (outcome.code !== 0) {
    state.tree = records;
    writeFileSync(sp, JSON.stringify(state, null, 2));
    out(
      {
        ok: false,
        command: 'down',
        evidenceDir: state.evidenceDir,
        notes,
        reason: outcome.reason,
        state: sp,
      },
      outcome.code,
    );
  }

  rmSync(sp, { force: true });
  out({ ok: true, command: 'down', evidenceDir: state.evidenceDir, notes }, 0);
}

/** @type {Record<string, () => void | Promise<void>>} */
const commands = {
  install,
  check,
  remove,
  up,
  doctor,
  info,
  down,
  tools,
  call,
  resource,
  scan,
  components,
};

async function main() {
  // main() is called above this module's constants; a self-import settles once the module has finished loading.
  await import(import.meta.url);

  // import.meta.url is the real path, so compare real paths: run through a link, the CLI still runs.
  if (
    !process.argv[1] ||
    realpathSync.native(path.resolve(process.argv[1])) !==
      realpathSync.native(fileURLToPath(import.meta.url))
  ) {
    return;
  }

  const command =
    cmd !== undefined && Object.hasOwn(commands, cmd)
      ? commands[cmd]
      : undefined;

  if (command === undefined) {
    process.stdout.write(
      'usage: control.mjs <install|check|remove|up|doctor|info|down|tools|call|resource|scan|components> [--dir <app>] [--project <name>] [--port N] [--app-url <url>] [--allow-actions] [--args <json>] [--confirm] [--out <file>] [--json]\n',
    );
    process.exit(2);
  }

  await command();
}
