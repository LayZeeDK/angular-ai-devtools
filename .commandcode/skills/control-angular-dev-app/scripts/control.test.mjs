// @ts-check
// Run: node --test .commandcode/skills/control-angular-dev-app/scripts/control.test.mjs
import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  authCheck,
  authCodeIn,
  authReply,
  buildLogErrors,
  busyPorts,
  candidatePorts,
  cdMode,
  checkLine,
  consoleErrors,
  currentTabUrl,
  downOutcome,
  flagIn,
  flowIdFor,
  isWorktree,
  listeners,
  markerCheck,
  pinOf,
  planPorts,
  portRowsOf,
  portsCheck,
  probePort,
  slotOf,
  slotOrder,
  stopRun,
  takenBy,
  timeoutMsOf,
  urlPort,
} from './control.mjs';

/** @typedef {import('./proctree.mjs').ProcRecord} ProcRecord */
/** @typedef {Parameters<typeof stopRun>[0]} State */

/**
 * A throwaway listener on a port the OS picks; closed after the test.
 * @param {import('node:test').TestContext} t
 * @returns {Promise<number>}
 */
async function listen(t) {
  const server = createServer();
  await new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve(undefined)),
  );
  t.after(() => server.close());

  return /** @type {import('node:net').AddressInfo} */ (server.address()).port;
}

/**
 * A port nothing listens on: the OS picks it for a listener that is closed again.
 * @returns {Promise<number>}
 */
async function freePort() {
  const server = createServer();
  await new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve(undefined)),
  );
  const { port } = /** @type {import('node:net').AddressInfo} */ (
    server.address()
  );
  await new Promise((resolve) => server.close(() => resolve(undefined)));

  return port;
}

/**
 * A folder that is the top of a main checkout (`.git` folder) or a worktree (`.git` file), with a `sub` folder.
 * @param {import('node:test').TestContext} t
 * @param {'main' | 'worktree'} kind
 * @returns {string}
 */
function checkout(t, kind) {
  const dir = mkdtempSync(join(tmpdir(), 'control-ngdev-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  if (kind === 'main') {
    mkdirSync(join(dir, '.git'));
  } else {
    writeFileSync(join(dir, '.git'), 'gitdir: elsewhere\n');
  }

  mkdirSync(join(dir, 'sub'));

  return dir;
}

test('flagIn reads a value, a bare flag, and an absent one', () => {
  const args = ['up', '--target', 'counter', '--json', '--port', '--url'];
  assert.equal(flagIn(args, 'target'), 'counter');
  assert.equal(flagIn(args, 'json'), true);
  assert.equal(flagIn(args, 'port'), true);
  assert.equal(flagIn(args, 'url'), true);
  assert.equal(flagIn(args, 'dir'), undefined);
});

test('isWorktree tells a .git file from a .git folder, from below the top too', (t) => {
  const main = checkout(t, 'main');
  const worktree = checkout(t, 'worktree');
  assert.equal(isWorktree(join(main, 'sub')), false);
  assert.equal(isWorktree(join(worktree, 'sub')), true);
});

test('slotOf keeps slot 0 for a main checkout and hashes a worktree to a stable slot in 1-99', () => {
  assert.equal(slotOf('D:\\any', false), 0);
  const slot = slotOf('D:\\wt\\spikes\\ng222-app', true);
  assert.ok(slot >= 1 && slot <= 99, `slot ${slot}`);
  assert.equal(
    slotOf('d:\\WT\\spikes\\ng222-app', true),
    slot,
    'the hash ignores letter case',
  );
  assert.notEqual(slotOf('D:\\other\\spikes\\ng222-app', true), slot);
});

test('slotOrder tries 10 slots and from a worktree wraps within 1-99, never onto slot 0', () => {
  assert.deepEqual(slotOrder(0), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(slotOrder(95), [95, 96, 97, 98, 99, 1, 2, 3, 4, 5]);
  assert.deepEqual(slotOrder(99), [99, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('the ports table keeps every slot of every target apart, and no worktree slot reaches a main checkout port', () => {
  /** @type {Map<number, string>} */
  const seen = new Map();
  const targets = /** @type {const} */ ([
    'counter',
    'components',
    'ssr',
    'portal',
  ]);
  const mains = targets.map((name) => {
    const row = portRowsOf(name, 'D:\\portal')[0];

    return row?.kind === 'derived' ? row.at(0) : NaN;
  });
  assert.deepEqual(mains, [4222, 4224, 4223, 4200]);

  for (const name of targets) {
    for (const row of portRowsOf(name, 'D:\\portal')) {
      for (let slot = 0; slot < 100; slot++) {
        const port = row.kind === 'derived' ? row.at(slot) : row.port;
        const key = `${name} ${row.name} slot ${row.kind === 'derived' ? slot : 'any'}`;
        const other = seen.get(port);
        assert.ok(
          other === undefined || other === key,
          `${key} and ${other} share ${port}`,
        );
        seen.set(port, key);
        assert.ok(
          slot === 0 || row.kind !== 'derived' || !mains.includes(port),
          `${key} is a main checkout port`,
        );
      }
    }
  }

  assert.deepEqual(
    portRowsOf('portal', 'D:\\portal').map((r) => `${r.name}:${r.kind}`),
    ['app:derived', 'api:fixed', 'pangular:external'],
  );
});

test('portRowsOf("components") returns the components row', () => {
  const rows = portRowsOf('components');
  assert.deepEqual(
    rows.map((r) => `${r.name}:${r.kind}`),
    ['app:derived'],
  );
  const row = rows[0];
  assert.ok(row && row.kind === 'derived');
  assert.equal(row.at(0), 4224);
  assert.equal(row.at(3), 4603);
});

test('no slot-0 port collides with another target or a reserved port', () => {
  const forbidden = new Set([3000, 9999]);
  const slot0 = /** @type {const} */ ([
    'counter',
    'components',
    'ssr',
    'portal',
  ]).map((name) => {
    const row = portRowsOf(name)[0];
    return row?.kind === 'derived' ? row.at(0) : (row?.port ?? 0);
  });
  assert.equal(
    new Set(slot0).size,
    slot0.length,
    'every slot-0 port is distinct',
  );
  for (const port of slot0) {
    if (port !== 4222 && port !== 4223 && port !== 4200) {
      assert.ok(!forbidden.has(port), `slot-0 port ${port} is reserved`);
    }
  }
  const componentsRow = portRowsOf('components')[0];
  assert.equal(
    componentsRow?.kind === 'derived' ? componentsRow.at(0) : NaN,
    4224,
  );
  assert.ok(
    ![4200, 4222, 4223, 3000, 9999].includes(
      componentsRow?.kind === 'derived' ? componentsRow.at(0) : NaN,
    ),
  );
});

test('pinOf names the line that holds the value, or the bare path', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'control-ngdev-pin-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(
    join(dir, 'tokens.ts'),
    "import x;\n\nexport const url = 'http://localhost:3000/api/';\n",
  );
  assert.equal(pinOf(dir, 'tokens.ts', 'localhost:3000'), 'tokens.ts:3');
  assert.equal(pinOf(dir, 'tokens.ts', 'localhost:4000'), 'tokens.ts');
  assert.equal(pinOf(dir, 'missing.ts', 'localhost:3000'), 'missing.ts');
});

test('planPorts falls back to the next slot when a throwaway listener holds the first one, and says why', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [
    { name: 'app', kind: 'derived', at: (slot) => (slot === 0 ? held : free) },
  ];
  assert.deepEqual(
    planPorts(rows, [0, 1], new Map([[held, []]])),
    {
      ok: true,
      slot: 1,
      ports: [
        {
          name: 'app',
          port: free,
          kind: 'derived',
          reason: `fell back from ${held}: held by a process the OS did not name`,
        },
      ],
    },
    'a busy first slot falls back without a PID',
  );
  const planned = planPorts(
    rows,
    [0, 1],
    await busyPorts(candidatePorts(rows, [0, 1])),
  );
  assert.ok(
    planned.ok &&
      planned.slot === 1 &&
      planned.ports[0]?.reason?.startsWith(`fell back from ${held}: held by `),
    JSON.stringify(planned),
  );
  assert.deepEqual(
    planPorts(rows, [1, 2], await busyPorts(candidatePorts(rows, [1, 2]))),
    {
      ok: true,
      slot: 1,
      ports: [{ name: 'app', port: free, kind: 'derived' }],
    },
    'a free first slot carries no reason',
  );
});

test('planPorts refuses after 10 busy slots and names each port and its holder', async (t) => {
  const held = await Promise.all(Array.from({ length: 10 }, () => listen(t)));
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [
    {
      name: 'app',
      kind: 'derived',
      at: (slot) => /** @type {number} */ (held[slot]),
    },
  ];
  const order = slotOrder(0);
  const plan = planPorts(
    rows,
    order,
    await busyPorts(candidatePorts(rows, order)),
  );
  assert.equal(plan.ok, false);
  assert.match(
    plan.ok ? '' : plan.reason,
    /^no free slot in 10 tries \(slots 0, 1, 2, 3, 4, 5, 6, 7, 8, 9\): /,
  );

  for (const port of held) {
    assert.ok(
      !plan.ok && plan.reason.includes(`app ${port} held by `),
      `names ${port}`,
    );
  }
});

test('planPorts refuses a busy --port with its holder and never falls back from it', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'app', kind: 'derived', at: () => free }];
  assert.deepEqual(
    planPorts(rows, [0, 1, 2], new Map([[held, []]]), held),
    {
      ok: false,
      reason: `port ${held} (--port) is held by a process the OS did not name; --port has no fallback`,
    },
    'a busy --port refuses without a PID',
  );
  assert.deepEqual(
    planPorts(rows, [0, 1, 2], await busyPorts([held, free]), free),
    {
      ok: true,
      slot: 0,
      ports: [{ name: 'app', port: free, kind: 'derived' }],
    },
  );
});

test('planPorts refuses a busy fixed port with its holder and pin, whatever the slots', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [
    { name: 'app', kind: 'derived', at: () => free },
    {
      name: 'api',
      kind: 'fixed',
      port: held,
      pin: 'libs/x.ts:5 in the portal checkout D:\\p',
    },
    { name: 'pangular', kind: 'external', port: held, owner: 'someone else' },
  ];
  assert.deepEqual(
    planPorts(rows, [0, 1], new Map([[held, []]])),
    {
      ok: false,
      reason: `fixed port api ${held} held by a process the OS did not name; pinned by libs/x.ts:5 in the portal checkout D:\\p`,
    },
    'a busy fixed port refuses without a PID',
  );
  const refused = planPorts(
    rows,
    [0, 1],
    await busyPorts(candidatePorts(rows, [0, 1])),
  );
  assert.ok(
    !refused.ok && refused.reason.startsWith(`fixed port api ${held} held by `),
    JSON.stringify(refused),
  );
  const external = planPorts(
    [rows[0], rows[2]].filter((r) => r !== undefined),
    [0],
    await busyPorts([held, free]),
  );
  assert.deepEqual(
    external,
    {
      ok: true,
      slot: 0,
      ports: [
        { name: 'app', port: free, kind: 'derived' },
        {
          name: 'pangular',
          port: held,
          kind: 'external',
          reason: 'someone else',
        },
      ],
    },
    'a busy external port is not checked',
  );
});

test('planPorts keeps the fallback reason when a retry has already used the first slot', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [
    { name: 'app', kind: 'derived', at: (slot) => (slot === 5 ? held : free) },
  ];
  const probe = await busyPorts(candidatePorts(rows, [6], undefined, 5));
  assert.equal(
    probe.has(held),
    true,
    `the probe finds the listener this process holds on ${held}`,
  );
  const planned = planPorts(rows, [6], probe, undefined, 5);
  assert.ok(
    planned.ok &&
      planned.slot === 6 &&
      planned.ports[0]?.reason?.startsWith(`fell back from ${held}: held by `),
    JSON.stringify(planned),
  );
  /** @type {import('./control.mjs').PortRow[]} */
  const gone = [{ name: 'app', kind: 'derived', at: () => free }];
  assert.deepEqual(planPorts(gone, [6], probe, undefined, 5), {
    ok: true,
    slot: 6,
    ports: [
      {
        name: 'app',
        port: free,
        kind: 'derived',
        reason: `fell back from ${free}: taken after the check`,
      },
    ],
  });
});

test('takenBy sees a foreign holder even while the probe answers, and a port error only in an exited run', () => {
  const tree = new Set([10, 11]);
  assert.deepEqual(takenBy([11], tree, false, ''), null, 'our own holder');
  assert.deepEqual(
    takenBy([42], tree, false, ''),
    { pid: 42 },
    'a foreign answer before ours fails',
  );
  assert.deepEqual(takenBy([11, 42], tree, false, ''), { pid: 42 });
  assert.deepEqual(
    takenBy(
      [],
      tree,
      true,
      'Error: listen EADDRINUSE: address already in use :::3000',
    ),
    { pid: null },
  );
  assert.deepEqual(
    takenBy([], tree, true, 'error TS2304'),
    null,
    'a crash for another reason is not a taken port',
  );
  assert.deepEqual(
    takenBy([], tree, false, 'Port 4336 is already in use'),
    null,
    'still running: not decided from the log',
  );
});

test('portsCheck passes owned ports, fails a missing or foreign one, and ignores external ports', () => {
  /** @type {import('./control.mjs').PortEntry[]} */
  const ports = [
    { name: 'app', port: 4501, kind: 'derived' },
    { name: 'api', port: 3000, kind: 'fixed', reason: 'libs/x.ts:5' },
    {
      name: 'pangular',
      port: 9999,
      kind: 'external',
      reason: 'control-pangular-inspector',
    },
  ];
  const tree = new Set([10, 11]);
  const detail =
    'app 4501 (derived), api 3000 (fixed: libs/x.ts:5), pangular 9999 (external: control-pangular-inspector)';
  assert.deepEqual(
    portsCheck(
      ports,
      new Map([
        [4501, [10]],
        [3000, [11]],
      ]),
      tree,
    ),
    { status: 'pass', detail },
  );
  assert.deepEqual(
    portsCheck(
      ports,
      new Map([
        [4501, []],
        [3000, []],
      ]),
      tree,
    ),
    { status: 'pass', detail },
    'listeners the OS does not name are still listening',
  );
  assert.deepEqual(portsCheck(ports, new Map([[3000, [99]]]), tree), {
    status: 'fail',
    detail:
      'app 4501 not listening; api 3000 held by PID 99, not the recorded tree',
  });
  assert.deepEqual(
    portsCheck(
      ports,
      new Map([
        [4501, [10, 98]],
        [3000, [11]],
      ]),
      tree,
    ),
    {
      status: 'fail',
      detail: 'app 4501 held by PID 98, not the recorded tree',
    },
    'a second holder on another address is not ours',
  );
});

test('listeners maps each LISTENING port to its PID, IPv4 or IPv6, and nothing else', () => {
  const text = [
    '  Proto  Local Address          Foreign Address        State           PID',
    '  TCP    0.0.0.0:14222          0.0.0.0:0              LISTENING       7',
    '  TCP    127.0.0.1:4222         127.0.0.1:50000        ESTABLISHED     8',
    '  TCP    [::1]:4222             [::]:0                 LISTENING       4242',
    '  TCP    0.0.0.0:4222           0.0.0.0:0              LISTENING       77',
    '  TCP    [::]:14222             [::]:0                 LISTENING       7',
  ].join('\r\n');
  assert.deepEqual(
    [...listeners(text)],
    [
      [14222, [7]],
      [4222, [4242, 77]],
    ],
  );
});

/**
 * A throwaway listener on `host` at a port the OS picks; closed after the test.
 * @param {import('node:test').TestContext} t
 * @param {string} host
 * @returns {Promise<number>}
 */
async function listenOn(t, host) {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, host, () => resolve(undefined));
  });
  t.after(() => server.close());

  return /** @type {import('node:net').AddressInfo} */ (server.address()).port;
}

/** An address no host has: TEST-NET-1 (RFC 5737) is never assigned to an interface, so a bind on it fails with EADDRNOTAVAIL. */
const UNBINDABLE = '192.0.2.1';

/** A port nothing listens on: the probe is asked about it on `UNBINDABLE` only, so only the unknown answer is in reach. */
const UNDECIDED_PORT = 45000;

test('probePort reads a listener bound on ::1 alone as busy, and the leg that holds nothing as free', async (t) => {
  const port = await listenOn(t, '::1');
  assert.equal(
    await probePort(port, ['127.0.0.1']),
    'free',
    `${port} holds nothing on 127.0.0.1: the listener is on ::1 only`,
  );
  assert.equal(
    await probePort(port),
    'busy',
    `${port} is busy: the probe binds both loopback legs, and a listener on ::1 alone is still a listener`,
  );
  assert.equal(
    (await busyPorts([port])).has(port),
    true,
    `${port} is busy, so the planner is told and never offers it`,
  );
});

test('probePort answers unknown, never free, for a bind that fails for any reason but EADDRINUSE', async (t) => {
  const port = await listenOn(t, '127.0.0.1');
  assert.equal(
    await probePort(port, [UNBINDABLE]),
    'unknown',
    `no host has ${UNBINDABLE}, so nothing was learned about ${port}: not free`,
  );
  assert.equal(
    await probePort(port, ['::1', UNBINDABLE]),
    'unknown',
    'one address the probe could not bind is enough: free needs every address to answer free',
  );
  assert.equal(
    await probePort(port, ['127.0.0.1', UNBINDABLE]),
    'busy',
    'a busy address outranks one the probe could not bind',
  );
});

test('a port the probe could not decide is refused, never selected as free', async () => {
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'probe', kind: 'derived', at: () => UNDECIDED_PORT }];
  const busy = await busyPorts([UNDECIDED_PORT], [UNBINDABLE]);

  assert.deepEqual(
    [...busy.keys()],
    [UNDECIDED_PORT],
    'an undecided port is in the map: what is not known to be free is not offered',
  );
  assert.deepEqual(planPorts(rows, [0], busy), {
    ok: false,
    reason: `no free slot in 1 tries (slots 0): probe ${UNDECIDED_PORT} held by a process the OS did not name`,
  });
});

test('busyPorts decides by binding a port: the one this process holds is busy, the same port is free once released', async () => {
  const server = createServer();
  await new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve(undefined)),
  );
  const port = /** @type {import('node:net').AddressInfo} */ (server.address())
    .port;
  assert.equal(
    (await busyPorts([port])).has(port),
    true,
    `a listener this process holds on ${port} is busy`,
  );
  await new Promise((resolve) => server.close(() => resolve(undefined)));
  assert.deepEqual(
    [...(await busyPorts([port])).keys()],
    [],
    `nothing holds ${port} once the release ran: it is free`,
  );
});

test('authCodeIn takes the latest code and ignores colour codes', () => {
  assert.equal(
    authCodeIn('auth code 111111\n\x1b[32mauth code\x1b[0m 222222\n'),
    '222222',
  );
  assert.equal(authCodeIn('no code here'), null);
});

test('buildLogErrors keeps build errors and drops [vite] entries with their continuation lines', () => {
  const log = [
    'Application bundle generation complete.',
    '12:00:01 [vite] http proxy error: /__pangular',
    'Error: read ECONNRESET',
    '    at TCP.onStreamRead',
    '[vite] (client) ERROR NG0500: During hydration Angular expected <div>',
    '  Find more at https://angular.dev/errors/NG0500',
    'Application bundle generation failed.',
    '[ERROR] TS2322: Type string is not assignable [plugin angular-compiler]',
    'src/app.ts:3:1 - error TS2304: Cannot find name x.',
  ].join('\n');
  assert.deepEqual(buildLogErrors(log), [
    '[ERROR] TS2322: Type string is not assignable [plugin angular-compiler]',
    'src/app.ts:3:1 - error TS2304: Cannot find name x.',
  ]);
  assert.deepEqual(buildLogErrors('Error: boom\n'), ['Error: boom']);
});

test('buildLogErrors ends a [vite] entry at a timestamped line, a status glyph line and a TS error', () => {
  const vite = '[vite] (client) ERROR something\nError: forwarded';
  assert.deepEqual(
    buildLogErrors(`${vite}\n12.00.02 Error: after a timestamp`),
    ['12.00.02 Error: after a timestamp'],
  );
  assert.deepEqual(buildLogErrors(`${vite}\n✘ Error: after a status glyph`), [
    '✘ Error: after a status glyph',
  ]);
  assert.deepEqual(buildLogErrors(`${vite}\nsrc/x.ts:1:1 - error TS2304: x`), [
    'src/x.ts:1:1 - error TS2304: x',
  ]);
  assert.deepEqual(
    buildLogErrors(
      `${vite}\nApplication bundle generation failed.\nError: after the bundle line`,
    ),
    ['Error: after the bundle line'],
  );
});

test('consoleErrors separates the Pangular overlay lines from the other errors', () => {
  const out = [
    '### Result',
    'Total messages: 5 (Errors: 3, Warnings: 0)',
    '[ERROR] Failed to load resource: 404 @ http://localhost:4775/__connection.json:0',
    '[ERROR] [pangular] No devtools server found',
    '[ERROR] TypeError: x is undefined',
  ].join('\n');
  assert.deepEqual(consoleErrors(out), {
    total: 3,
    pangular: [
      '[ERROR] Failed to load resource: 404 @ http://localhost:4775/__connection.json:0',
      '[ERROR] [pangular] No devtools server found',
    ],
    others: 1,
  });
  assert.ok(Number.isNaN(consoleErrors('session not open').others));
});

test('cdMode reads zoneless only from NoopNgZone', () => {
  assert.equal(cdMode('NoopNgZone'), 'zoneless');
  assert.equal(cdMode('NgZone'), 'zone-based');
  assert.match(cdMode(null), /^unknown/);
});

test('flowIdFor names url and target flows and refuses an unknown target', () => {
  assert.equal(
    flowIdFor(['doctor', '--url', 'http://localhost:4775/']),
    'url-4775',
  );
  assert.equal(flowIdFor(['doctor', '--url', 'http://localhost/']), 'url-80');
  assert.equal(
    flowIdFor(['doctor', '--target', 'ssr', '--port', '4999']),
    'ssr',
    'one instance per target: the port is not part of the flow',
  );
  assert.equal(flowIdFor(['doctor', '--target', 'counter']), 'counter');
  assert.equal(flowIdFor(['doctor']), null);
  assert.equal(
    flowIdFor(['doctor', '--url', '']),
    null,
    'an empty --url counts as absent',
  );
  assert.throws(() => flowIdFor(['doctor', '--url', 'notaurl']), /Invalid URL/);
  assert.throws(
    () => flowIdFor(['doctor', '--target', 'constructor']),
    /unknown target "constructor"/,
  );
});

test('loading the script makes Windows skip the current directory when Node looks up a bare program', async () => {
  delete process.env['NoDefaultCurrentDirectoryInExePath'];
  await import(new URL('./control.mjs?fresh-env', import.meta.url).href);
  assert.equal(process.env['NoDefaultCurrentDirectoryInExePath'], '1');
});

test('authReply gives the one-time code only to a page on the portal origin and dismisses every other prompt', () => {
  const app = 'http://localhost:4507/';
  assert.deepEqual(
    authReply('portal', '123456', 'http://localhost:4507/contract/list', app),
    ['dialog-accept', '123456'],
  );
  assert.deepEqual(authReply('portal', null, app, app), ['dialog-dismiss']);
  assert.deepEqual(
    authReply('portal', '123456', 'https://evil.example/', app),
    ['dialog-dismiss'],
    'a portal session left on another origin',
  );
  assert.deepEqual(
    authReply('portal', '123456', 'http://localhost:4508/', app),
    ['dialog-dismiss'],
    'another port is another origin',
  );
  assert.deepEqual(
    authReply('portal', '123456', null, app),
    ['dialog-dismiss'],
    'no page URL in the snapshot',
  );
  assert.deepEqual(authReply('counter', '123456', app, app), [
    'dialog-dismiss',
  ]);
  assert.deepEqual(
    authReply(undefined, '123456', app, app),
    ['dialog-dismiss'],
    'an --url attach has no target',
  );
});

test('currentTabUrl reads the current tab from tab-list output, as printed while the code prompt is open', () => {
  const measured =
    '### Result\n- 0: (current) [](http://localhost:4507/home)\n### Modal state\n- ["prompt" dialog with message "devframe: enter the authentication code shown in your terminal"]: can be handled by dialog-accept or dialog-dismiss\n';
  assert.equal(currentTabUrl(measured), 'http://localhost:4507/home');
  assert.equal(
    currentTabUrl(
      '- 0: [Other](https://a.example/)\n- 1: (current) [Portal [x]](http://localhost:4507/x?y=1)',
    ),
    'http://localhost:4507/x?y=1',
  );
  assert.equal(currentTabUrl('### Error\nsession not open'), null);
});

test('authCheck says what happened from the same condition the reply used, and never shows the code', () => {
  const app = 'http://localhost:4507/';
  const ok = { status: 0, stdout: '', stderr: '' };
  assert.equal(
    authCheck('portal', '123456', app, app, 'pangular.log', ok).status,
    'pass',
  );
  const failed = authCheck('portal', '123456', app, app, 'pangular.log', {
    status: 1,
    stdout: '',
    stderr: 'dialog-accept 123456: no dialog',
  });
  assert.equal(failed.status, 'warn');
  assert.match(
    failed.detail,
    /dialog-accept failed: dialog-accept <code>: no dialog/,
  );
  assert.doesNotMatch(failed.detail, /123456/);
  assert.match(
    authCheck('portal', null, app, app, null, ok).detail,
    /^dismissed .*no control-pangular-inspector state file/,
  );
  assert.match(
    authCheck('counter', '123456', app, app, 'pangular.log', ok).detail,
    /^dismissed .*not the portal/,
  );
  assert.match(
    authCheck(
      'portal',
      '123456',
      'https://evil.example/',
      app,
      'pangular.log',
      ok,
    ).detail,
    /^dismissed a code prompt on https:\/\/evil\.example\/, not on the portal's origin/,
  );
});

test('timeoutMsOf refuses a value that is not a positive number', () => {
  assert.equal(timeoutMsOf(['up'], 240), 240000);
  assert.equal(timeoutMsOf(['up', '--timeout', '30'], 240), 30000);
  assert.equal(timeoutMsOf(['up', '--timeout', '1.5'], 240), 1500);
  assert.throws(
    () => timeoutMsOf(['up', '--timeout', 'abc'], 240),
    /--timeout abc is not a positive number of seconds/,
  );
  assert.throws(
    () => timeoutMsOf(['up', '--timeout'], 240),
    /--timeout needs a value/,
  );
  assert.throws(
    () => timeoutMsOf(['up', '--timeout', '0'], 240),
    /not a positive/,
  );
  assert.throws(
    () => timeoutMsOf(['up', '--timeout', '-5'], 240),
    /not a positive/,
  );
  assert.throws(
    () => timeoutMsOf(['up', '--timeout', 'Infinity'], 240),
    /not a positive/,
  );
});

test('markerCheck fails a page with no Angular root', () => {
  assert.equal(markerCheck([], 'app-root').status, 'fail');
  assert.equal(markerCheck(['app-other'], 'app-root').status, 'fail');
  assert.equal(markerCheck(['app-root'], 'app-root').status, 'pass');
});

test('checkLine escapes control characters a page put in a detail', () => {
  const line = checkLine({
    name: 'angular-root',
    status: 'pass',
    detail: 'v\u001b]0;x\u0007\u009b2J',
  });
  assert.equal(line, String.raw`[OK] angular-root: v\u001b]0;x\u0007\u009b2J`);
  assert.equal(
    checkLine({ name: 'ports', status: 'skip', detail: 'plain' }),
    '[SKIP] ports: plain',
  );
});

test('urlPort reads the scheme default when the URL names no port', () => {
  assert.equal(urlPort('http://localhost/'), 80);
  assert.equal(urlPort('https://localhost/'), 443);
  assert.equal(urlPort('https://localhost:4775/'), 4775);
  assert.equal(flowIdFor(['doctor', '--url', 'https://localhost/']), 'url-443');
});

test('down goes through proctree.mjs: the last snapshot below each root is merged into the record, then stop gets it all', () => {
  const root = {
    pid: 7,
    ppid: 1,
    start: 1000,
    commandLine: 'node ng.js serve --port 4336',
  };
  // Recorded once ready; its parent (PID 20) has exited since, so no walk from the root reaches it.
  const orphan = {
    pid: 30,
    ppid: 20,
    start: 1200,
    commandLine: 'esbuild --service',
  };
  const late = { pid: 40, ppid: 7, start: 1300, commandLine: 'node worker.js' };
  const other = {
    pid: 99,
    ppid: 1,
    start: 900,
    commandLine: 'not started by the run',
  };
  /** @type {State} */
  const state = {
    flowId: 'counter',
    mode: 'launch',
    url: '',
    session: '',
    evidenceDir: '',
    startedAt: '',
    procs: [{ name: 'app', pid: 7, port: 4336, readyUrl: '', log: '' }],
    tree: [root, orphan],
  };
  /** @type {ProcRecord[][]} */
  const calls = [];
  const { records, result } = stopRun(state, {
    table: () => [root, orphan, late, other],
    stop: (list) => {
      calls.push(list);

      return { stopped: list, gone: [], refused: [] };
    },
  });
  assert.deepEqual(
    calls,
    [[root, orphan, late]],
    'one stop call with the record and the late child, nothing else',
  );
  assert.deepEqual(records, [root, orphan, late]);
  assert.deepEqual(downOutcome(state, result), {
    code: 0,
    notes: [
      'stopped PID 7 (node ng.js serve --port 4336)',
      'stopped PID 30 (esbuild --service)',
      'stopped PID 40 (node worker.js)',
    ],
    reason: null,
  });
  const source = readFileSync(
    new URL('./control.mjs', import.meta.url),
    'utf8',
  );
  assert.match(
    source,
    /^function down\(\) \{[^]*?stopRun\(state\)[^]*?^\}/m,
    'down stops through stopRun',
  );
  assert.doesNotMatch(
    source,
    /taskkill|process\.kill|Stop-Process|Win32_Process\b|Get-Process|wmic|ParentProcessId|\.ppid\b/,
    'no stop or process query of its own besides proctree.mjs',
  );
  assert.match(
    source,
    /snapshot\((?:child\.)?pid, \{ notBefore(?:: t0)?, notAfter \}\)/,
    'up records the spawned process inside its spawn window',
  );
});

test('downOutcome refuses a reused root PID and a survivor with exit 2, and only notes a reused child or a shared service', () => {
  const root = {
    pid: 7,
    ppid: 1,
    start: 1000,
    commandLine: 'node nx.js run api:serve',
  };
  const child = { pid: 30, ppid: 7, start: 1200, commandLine: 'node main.js' };
  /** @type {State} */
  const state = {
    flowId: 'portal',
    mode: 'launch',
    url: '',
    session: '',
    evidenceDir: '',
    startedAt: '',
    procs: [{ name: 'api', pid: 7, port: 3000, readyUrl: '', log: '' }],
    tree: [root, child],
  };
  const reusedRoot = downOutcome(state, {
    stopped: [child],
    gone: [],
    refused: [{ ...root, reason: 'reused' }],
  });
  assert.equal(reusedRoot.code, 2);
  assert.match(
    reusedRoot.reason ?? '',
    /^refused: PID 7 \(api\) now belongs to another process .*; the state file is kept$/,
  );
  const survived = downOutcome(state, {
    stopped: [root],
    gone: [],
    refused: [{ ...child, reason: 'survived' }],
  });
  assert.equal(survived.code, 2);
  assert.match(
    survived.reason ?? '',
    /PID 30 \(node main\.js\) still runs after the last round; run down again/,
  );
  const noted = downOutcome(state, {
    stopped: [root],
    gone: [],
    refused: [
      { ...child, reason: 'reused' },
      {
        pid: 50,
        ppid: 7,
        start: 1300,
        commandLine: 'node nx/src/daemon/server/start.js',
        reason: 'shared',
      },
    ],
  });
  assert.equal(noted.code, 0);
  assert.deepEqual(noted.notes.slice(1), [
    'left PID 30 alone: it now belongs to another process',
    'left PID 50 (node nx/src/daemon/server/start.js) alone: a shared service (the Nx daemon), never stopped',
  ]);
  assert.equal(
    downOutcome(state, { stopped: [], gone: [root, child], refused: [] }).code,
    0,
    'a run that already exited is not a refusal',
  );
  const { tree, ...noTree } = state;
  assert.match(
    downOutcome(noTree, { stopped: [], gone: [], refused: [] }).reason ?? '',
    /^refused: the state file records no process tree/,
    'a state file from before proctree.mjs is refused, not dropped',
  );
});
