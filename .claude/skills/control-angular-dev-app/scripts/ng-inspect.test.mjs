// @ts-check
// Run: node --test .claude/skills/control-angular-dev-app/scripts/ng-inspect.test.mjs
// Runs the run-code file against a fake page whose evaluate calls the callback here, with a fake DOM and window.ng.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

/** @typedef {(page: { addInitScript: (fn: () => void) => Promise<void>, evaluate: (fn: () => unknown) => Promise<unknown> }) => Promise<unknown>} RunCode */

const source = readFileSync(new URL('./ng-inspect.js', import.meta.url), 'utf8');
/** @type {RunCode} */
const runCode = new Function(`return (${source}\n);`)();

class FakeNode {}

class FakeElement extends FakeNode {
  /**
   * @param {string} tag
   * @param {Record<string, string>} [attrs]
   */
  constructor(tag, attrs = {}) {
    super();
    this.tagName = tag.toUpperCase();
    this.nodeName = this.tagName;
    this.attrs = attrs;
  }

  /** @param {string} name */
  getAttribute(name) {
    return this.attrs[name] ?? null;
  }
}

/**
 * Installs a fake page world on globalThis for one test and runs the file.
 * @param {import('node:test').TestContext} t
 * @param {Record<string, unknown> | undefined} ng
 * @returns {Promise<{ doctor: Record<string, unknown>, ngc: Record<string, (...args: unknown[]) => unknown>, initScripts: number }>}
 */
async function run(t, ng) {
  const root = new FakeElement('app-root', { 'ng-version': '22.2.2' });
  const child = new FakeElement('app-counter');
  /** @type {Record<string, unknown>} */
  const win = { ng };
  const fakeDocument = {
    /** @param {string} selector */
    querySelector: (selector) => (selector === '[ng-version]' ? root : selector === 'app-counter' ? child : null),
    /** @param {string} selector */
    querySelectorAll: (selector) => (selector === '[ng-version]' ? [root] : [root, child]),
  };
  const saved = Object.fromEntries(['window', 'document', 'Node', 'Element', 'location'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, { window: win, document: fakeDocument, Node: FakeNode, Element: FakeElement, location: { href: 'http://localhost:4222/', pathname: '/' } });
  t.after(() => {
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor === undefined) {
        Reflect.deleteProperty(globalThis, key);
      } else {
        Object.defineProperty(globalThis, key, descriptor);
      }
    }
  });
  let initScripts = 0;
  const doctor = await runCode({
    addInitScript: async () => {
      initScripts += 1;
    },
    evaluate: async (fn) => fn(),
  });

  return {
    doctor: /** @type {Record<string, unknown>} */ (doctor),
    ngc: /** @type {Record<string, (...args: unknown[]) => unknown>} */ (win['__ngc']),
    initScripts,
  };
}

/**
 * A window.ng with every function the doctor looks for, a counter component on app-counter, and the given NgZone
 * provider records on the second injector of the resolution path.
 * @param {object[]} zoneRecords
 * @returns {Record<string, unknown>}
 */
function fakeNg(zoneRecords) {
  const counter = { count: 3, constructor: { name: '_Counter' } };
  const graph = {
    nodes: [
      { kind: 'signal', label: 'count', value: 3, epoch: 1 },
      { kind: 'computed', label: 'double', value: 6, epoch: 1 },
    ],
    edges: [{ consumer: 1, producer: 0 }],
  };
  const names = ['getContext', 'getRootComponents', 'getHostElement', 'applyChanges', 'isSignal', 'ɵgetInjectorMetadata', 'ɵgetDependenciesFromInjectable', 'getDirectiveMetadata', 'getListeners', 'getDirectives', 'getOwningComponent', 'ɵgetRouterInstance', 'ɵgetLoadedRoutes', 'ɵnavigateByUrl'];

  return {
    ...Object.fromEntries(names.map((name) => [name, () => undefined])),
    isSignal: () => false,
    /** @param {unknown} el */
    getComponent: (el) => (el instanceof FakeElement && el.tagName === 'APP-COUNTER' ? counter : el instanceof FakeElement && el.tagName === 'APP-ROOT' ? { constructor: { name: 'App' } } : null),
    getInjector: () => ({ node: true }),
    ɵgetSignalGraph: () => graph,
    ɵgetInjectorResolutionPath: () => ['node', 'environment'],
    /** @param {string} injector */
    ɵgetInjectorProviders: (injector) => (injector === 'environment' ? zoneRecords : [{ token: CartService, isViewProvider: false, importPath: [] }]),
    getDirectiveMetadata: () => ({ inputs: { count: 'count' }, outputs: {}, changeDetection: 0 }),
    getListeners: () => [{ name: 'click', type: 'dom', useCapture: false, extra: 'dropped' }],
    getDirectives: () => [],
    getOwningComponent: () => ({ constructor: { name: '_App' } }),
    ɵgetRouterInstance: () => ({ url: '/home', navigated: true, config: [{ path: '', redirectTo: 'home' }, { path: 'home', component: {} }, { path: 'claim', loadChildren: () => null }] }),
    /** @param {{ path?: string }} route */
    ɵgetLoadedRoutes: (route) => (route.path === 'claim' ? [{ path: 'list', component: {} }] : undefined),
  };
}

class CartService {}

// Angular's providers are keyed by the class itself.
class NgZone {}

test('doctor reads the version, roots and the last NgZone record, and installs the helpers for later loads', async (t) => {
  const zoneBased = [
    { token: NgZone, provider: { useClass: { name: 'NoopNgZone' } } },
    { token: NgZone, provider: { useFactory: () => null } },
  ];
  const { doctor, initScripts } = await run(t, fakeNg(zoneBased));
  assert.equal(initScripts, 1);
  assert.equal(doctor['ngVersion'], '22.2.2');
  assert.deepEqual(doctor['roots'], ['app-root']);
  assert.equal(doctor['devMode'], true);
  assert.deepEqual(doctor['missingCore'], []);
  assert.equal(doctor['router'], true);
  assert.equal(doctor['ngZone'], 'NgZone');
});

test('doctor reports a zoneless app and the core functions a build lacks', async (t) => {
  const ng = fakeNg([{ token: NgZone, provider: { useClass: { name: 'NoopNgZone' } } }]);
  delete ng['ɵgetSignalGraph'];
  delete ng['ɵnavigateByUrl'];
  const { doctor } = await run(t, ng);
  assert.equal(doctor['ngZone'], 'NoopNgZone');
  assert.deepEqual(doctor['missingCore'], ['ɵgetSignalGraph']);
  assert.equal(doctor['router'], false);
});

test('doctor on a production build says so instead of throwing', async (t) => {
  const { doctor } = await run(t, undefined);
  assert.equal(doctor['devMode'], false);
  assert.equal(doctor['ngZone'], null);
  assert.equal(/** @type {string[]} */ (doctor['missingCore']).length, 16);
});

test('components, inspect state and dependenciesOf read through window.ng', async (t) => {
  const { ngc } = await run(t, fakeNg([]));
  assert.deepEqual(ngc['components']?.(), [
    { i: 0, tag: 'app-root', name: 'App' },
    { i: 1, tag: 'app-counter', name: 'Counter' },
  ]);
  assert.deepEqual(ngc['dependenciesOf']?.('app-counter', 'double'), { signal: 'double', kind: 'computed', value: 6, dependsOn: ['count'] });
  assert.throws(() => ngc['dependenciesOf']?.('app-counter', 'triple'), /no signal node labelled triple; labels: count, double/);
  assert.throws(() => ngc['inspect']?.('app-missing'), /no component host matches app-missing/);
});

test('inspect, providers and router report what window.ng returns', async (t) => {
  const { ngc } = await run(t, fakeNg([]));
  const inspected = /** @type {Record<string, unknown>} */ (ngc['inspect']?.('app-counter'));
  assert.equal(inspected['name'], 'Counter');
  assert.equal(inspected['changeDetection'], 'OnPush');
  assert.deepEqual(inspected['inputs'], { count: 3 });
  assert.deepEqual(inspected['state'], { count: 3, constructor: { name: '_Counter' } });
  assert.deepEqual(inspected['listeners'], [{ name: 'click', type: 'dom', useCapture: false }]);
  assert.equal(inspected['owner'], 'App');
  assert.deepEqual(ngc['providers']?.('app-counter', 0), [{ token: 'CartService', isViewProvider: false, importPath: [] }]);
  assert.deepEqual(ngc['router']?.(), {
    present: true,
    url: '/home',
    navigated: true,
    routes: [
      { path: '/', lazy: false, loaded: false, redirectTo: 'home' },
      { path: '/home', lazy: false, loaded: true, redirectTo: undefined },
      { path: '/claim', lazy: true, loaded: true, redirectTo: undefined },
      { path: '/claim/list', lazy: false, loaded: true, redirectTo: undefined },
    ],
  });
});
