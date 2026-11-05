// @ts-check
// Run: node --test .commandcode/skills/control-angular-dev-app/scripts/ssr-check.test.mjs
// Runs the run-code file against a fake page: server HTML per path, console messages emitted on goto, and the
// browser-side reading (the page.evaluate result) given per path.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

/** @typedef {{ type: () => string, text: () => string }} Message */
/** @typedef {{ html: string, console: string[], dom: Record<string, unknown> | null }} Route */
/** @typedef {{ ok: boolean, checks: { name: string, status: string, detail: string }[] }} Result */

const source = readFileSync(new URL('./ssr-check.js', import.meta.url), 'utf8');
/** @type {(page: object) => Promise<Result>} */
const runCode = new Function(`return (${source}\n);`)();

const HYDRATED =
  '<app-root ng-server-context="ssr" ngh="0"><p ngh="1">x</p></app-root><script id="ng-state" type="application/json">{}</script>';
const counters = {
  hydratedComponents: 3,
  hydratedNodes: 12,
  componentsSkippedHydration: 0,
  deferBlocksWithIncrementalHydration: 1,
};

/**
 * A fake page for two routes; records the URLs it went to.
 * @param {Record<string, Route>} routes  keyed by path
 * @returns {{ page: object, visited: string[] }}
 */
function fakePage(routes) {
  /** @type {Set<(m: Message) => void>} */
  const listeners = new Set();
  /** @type {string[]} */
  const visited = [];
  let current = '/';
  /** @param {string} url */
  const route = (url) => {
    const found = routes[new URL(url).pathname + new URL(url).search];

    if (found === undefined) {
      throw new Error(`no route for ${url}`);
    }

    return found;
  };
  const page = {
    url: () => 'http://localhost:4223/somewhere',
    /** @param {string} _event @param {(m: Message) => void} listener */
    on: (_event, listener) => listeners.add(listener),
    /** @param {string} _event @param {(m: Message) => void} listener */
    off: (_event, listener) => listeners.delete(listener),
    request: {
      /** @param {string} url */
      get: async (url) => ({
        status: () => 200,
        text: async () => route(url).html,
      }),
    },
    /** @param {string} url */
    goto: async (url) => {
      visited.push(url);
      current = url;

      for (const text of route(url).console) {
        for (const listener of listeners) {
          listener({ type: () => 'error', text: () => text });
        }
      }
    },
    waitForEvent: async () => undefined,
    // A route without a given reading runs the page callback against the fake DOM a test installs.
    /** @param {() => unknown} fn */
    evaluate: async (fn) => route(current).dom ?? fn(),
  };

  return { page, visited };
}

const mismatched = {
  status: 'mismatched',
  node: 'div',
  component: 'Mismatch',
  expected: '<div>',
  actual: '<span>',
};

test('a clean / and the deliberate mismatch on /?mismatch=1 pass every check, and the page ends on /', async () => {
  const { page, visited } = fakePage({
    '/': {
      html: HYDRATED,
      console: [],
      dom: { windowNg: true, serverContext: 'ssr', counters, mismatches: [] },
    },
    '/?mismatch=1': {
      html: HYDRATED,
      console: [
        'ERROR RuntimeError: NG0500: During hydration Angular expected <div>\n  at x',
      ],
      dom: {
        windowNg: true,
        serverContext: 'ssr',
        counters,
        mismatches: [mismatched],
      },
    },
  });
  const result = await runCode(page);
  assert.deepEqual(
    result.checks.filter((c) => c.status !== 'pass'),
    [],
  );
  assert.equal(result.ok, true);
  assert.deepEqual(visited, [
    'http://localhost:4223/',
    'http://localhost:4223/?mismatch=1',
    'http://localhost:4223/',
  ]);
});

test('missing transfer state, skipped hydration or a mismatch on / fail their own checks', async () => {
  const { page } = fakePage({
    '/': {
      html: '<app-root ngh="0"></app-root>',
      console: ['ERROR NG0503: something'],
      dom: {
        windowNg: false,
        serverContext: null,
        counters: { ...counters, componentsSkippedHydration: 1 },
        mismatches: [],
      },
    },
    '/?mismatch=1': {
      html: HYDRATED,
      console: [],
      dom: { windowNg: true, serverContext: 'ssr', counters, mismatches: [] },
    },
  });
  const result = await runCode(page);
  assert.equal(result.ok, false);
  assert.deepEqual(
    result.checks.filter((c) => c.status === 'fail').map((c) => c.name),
    [
      'server-html-transfer-state',
      'dev-build-after-hydration',
      'hydration-counters',
      'no-mismatch-on-default-route',
      'expected-mismatch-detected',
    ],
  );
});

test('console errors of one route are not counted on the next', async () => {
  const { page } = fakePage({
    '/': {
      html: HYDRATED,
      console: [],
      dom: { windowNg: true, serverContext: 'ssr', counters, mismatches: [] },
    },
    '/?mismatch=1': {
      html: HYDRATED,
      console: ['NG0500: x'],
      dom: {
        windowNg: true,
        serverContext: 'ssr',
        counters,
        mismatches: [mismatched],
      },
    },
  });
  const result = await runCode(page);
  assert.equal(
    result.checks.find((c) => c.name === 'no-mismatch-on-default-route')
      ?.detail,
    '0 non-hydrated node(s), 0 console error(s) on /',
  );
});

test('a mismatch on another component does not count as the deliberate one', async () => {
  const { page } = fakePage({
    '/': {
      html: HYDRATED,
      console: [],
      dom: { windowNg: true, serverContext: 'ssr', counters, mismatches: [] },
    },
    '/?mismatch=1': {
      html: HYDRATED,
      console: ['NG0500: x'],
      dom: {
        windowNg: true,
        serverContext: 'ssr',
        counters,
        mismatches: [{ ...mismatched, component: 'Header' }],
      },
    },
  });
  const result = await runCode(page);
  assert.equal(
    result.checks.find((c) => c.name === 'expected-mismatch-detected')?.status,
    'fail',
  );
});

test('the in-page walk reports non-hydrated nodes with their component, without the leading underscore', async (t) => {
  const mismatchHost = {
    nodeName: 'APP-MISMATCH',
    __ngDebugHydrationInfo__: {
      status: 'mismatched',
      expectedNodeDetails: '<p>',
      actualNodeDetails: '<div>',
    },
  };
  const nodes = [
    { nodeName: 'BODY' },
    mismatchHost,
    { nodeName: 'P', __ngDebugHydrationInfo__: { status: 'hydrated' } },
  ];
  const fakeWindow = {
    ngDevMode: counters,
    ng: {
      getComponent: (/** @type {unknown} */ n) =>
        n === mismatchHost ? { constructor: { name: '_Mismatch' } } : null,
    },
  };
  const fakeDocument = {
    body: nodes[0],
    querySelector: () => ({ getAttribute: () => 'ssr' }),
    createTreeWalker: () => {
      let i = 0;

      return { currentNode: nodes[0], nextNode: () => nodes[++i] ?? null };
    },
  };
  const saved = Object.fromEntries(
    ['window', 'document', 'NodeFilter'].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  Object.assign(globalThis, {
    window: fakeWindow,
    document: fakeDocument,
    NodeFilter: { SHOW_ALL: 0xffffffff },
  });
  t.after(() => {
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor === undefined) {
        Reflect.deleteProperty(globalThis, key);
      } else {
        Object.defineProperty(globalThis, key, descriptor);
      }
    }
  });
  const { page } = fakePage({
    '/': {
      html: HYDRATED,
      console: [],
      dom: { windowNg: true, serverContext: 'ssr', counters, mismatches: [] },
    },
    '/?mismatch=1': { html: HYDRATED, console: ['NG0500: x'], dom: null },
  });
  const result = await runCode(page);
  assert.equal(
    result.checks.find((c) => c.name === 'expected-mismatch-detected')?.detail,
    '/?mismatch=1 (expected failure): mismatched on <app-mismatch> (Mismatch); NG0500: x',
  );
});
