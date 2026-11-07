// @ts-check
//
// M036 T001 — which hook exposes a resource's labels on the installed Angular
// versions, and what the four fixture resources report through it.
//
// The claim this file settles: a resource's labels (`Resource#<name>.<field>`)
// come out of `ɵgetSignalGraph`, not `ɵsetProfiler`. The labels are built as
// `Resource${resourceDebugName ? '#' + resourceDebugName : ''}.<field>` in
// `@angular/core/fesm2022/_resource-chunk.mjs`, and the graph reads
// `consumer.debugName` into each node's `label`.
//
// Run checks (read-only, no server, no browser):
//   node --experimental-strip-types --test scripts/resource-graph-capture.test.mjs
//
// Re-capture (cmd.exe: `set VAR=1 && node ...` does NOT arm anything, the
// quoted form does):
//   set "M036_CAPTURE=1"&& node --test scripts/resource-graph-capture.test.mjs
//
// Point checks at another recording:
//   set "M036_RECORD=<path>"&& node --test scripts/resource-graph-capture.test.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const APP = join(ROOT, 'spikes', 'ng222-app');

const ROUTE_PATH = '/resource-states';
const ELEMENT = 'app-resource-states';
const RECORD_PATH =
  process.env.M036_RECORD ??
  join(ROOT, 'research', 'raw', 'm036-resource-graph.json');

const ROUTES_PATH = join(APP, 'src', 'app', 'app.routes.ts');
const PAGE_PATH = join(APP, 'src', 'app', 'resource-page.ts');
const STATES_PATH = join(APP, 'src', 'app', 'resource-states.ts');

const CAPTURE_COMMAND =
  'set "M036_CAPTURE=1"&& node --test scripts/resource-graph-capture.test.mjs';
const CHECK_COMMAND =
  'node --experimental-strip-types --test scripts/resource-graph-capture.test.mjs';

/**
 * The two `@angular/core` installs this checkout carries: the repository's own
 * (`node_modules`) and the fixture app's (`spikes/ng222-app/node_modules`). The
 * capture runs against the second; the first is read, so the recording says
 * what exists on both.
 */
const INSTALLS = [
  { path: 'node_modules/@angular/core', servedByTheFixture: false },
  {
    path: 'spikes/ng222-app/node_modules/@angular/core',
    servedByTheFixture: true,
  },
];

/**
 * The four subjects, with the state each one is built to reach. `error`, not
 * `errored`: `ResourceStatus` has no `errored` member, and the recording stores
 * what was measured rather than what the fixture was named.
 */
const EXPECTED_STATES = [
  ['LoadingResource', 'loading'],
  ['ResolvedResource', 'resolved'],
  ['ErroredResource', 'error'],
  ['IdleResource', 'idle'],
];

/** The label builder both installs must carry for the labels to exist at all. */
const DEBUG_NAME_BUILDER =
  "debugName: `Resource${resourceDebugName ? '#' + resourceDebugName : ''}.${internalSignalDebugName}`";

/** The line that turns an `undefined` request into the idle state. */
const IDLE_FROM_UNDEFINED_REQUEST =
  "status = request === undefined ? 'idle' : stream ? 'resolved' : 'loading'";

// ---------------------------------------------------------------- static reads ----

function readText(relPath) {
  return readFileSync(join(ROOT, ...relPath.split('/')), 'utf8');
}

function packageVersion(packagePath) {
  return JSON.parse(readText(`${packagePath}/package.json`)).version;
}

/** The `ɵ` hooks the package's own type declarations publish. */
function declaredHooks(packagePath) {
  const dts = readText(`${packagePath}/types/core.d.ts`);
  return ['ɵgetSignalGraph', 'ɵsetProfiler'].map((symbol) => ({
    symbol,
    declared: dts.includes(`${symbol}(`),
  }));
}

/**
 * Where each hook is registered on the `window.ng` expando. `ɵgetSignalGraph`
 * and `ɵsetProfiler` are both published there; only the first builds labels.
 */
function publishedGlobals(packagePath) {
  const bundle = readText(`${packagePath}/fesm2022/_debug_node-chunk.mjs`);
  const map = bundle.match(/externalCoreGlobalUtils = \{[\s\S]*?\n\};/);
  assert.ok(map, `${packagePath}: no externalCoreGlobalUtils map`);
  return ['ɵgetSignalGraph', 'ɵsetProfiler'].map((symbol) => ({
    symbol,
    published: map[0].includes(`'${symbol}'`),
  }));
}

/** The label builder, and the idle-from-undefined-request line. */
function resourceSourceFacts(packagePath) {
  const source = readText(`${packagePath}/fesm2022/_resource-chunk.mjs`);
  return {
    debugNameBuilder: source.includes(DEBUG_NAME_BUILDER),
    idleFromUndefinedRequest: source.includes(IDLE_FROM_UNDEFINED_REQUEST),
    paramsStatusExported: /export \{[^}]*\bResourceParamsStatus\b/.test(source),
  };
}

// ---------------------------------------------------------------- the reader ----
//
// The downstream step the milestone needs: given a hook and a graph, name each
// resource's state — or say that nothing can be named. Written here so the
// "no hook, no finding" half of the acceptance criteria is a check and not a
// sentence.

const RESOURCE_LABEL = /^Resource#([^.]+)\.(.+)$/;

/**
 * @param {string} hook what `typeof ng.ɵgetSignalGraph` answered
 * @param {{nodes?: {label?: string|null, value?: unknown}[]}} [graph]
 */
function resourceLifecycle(hook, graph) {
  if (hook !== 'function') {
    return { state: 'cannot-tell', reason: 'no-graph-hook', resources: [] };
  }
  if (!graph || !Array.isArray(graph.nodes)) {
    return { state: 'cannot-tell', reason: 'no-graph', resources: [] };
  }
  const byName = new Map();
  for (const node of graph.nodes) {
    const label = typeof node.label === 'string' ? node.label : '';
    const match = label.match(RESOURCE_LABEL);
    if (!match) continue;
    const [, name, field] = match;
    if (!byName.has(name)) byName.set(name, { name, labels: [], status: null });
    const entry = byName.get(name);
    entry.labels.push(label);
    if (field === 'status') entry.status = node.value ?? null;
  }
  if (byName.size === 0) {
    return {
      state: 'cannot-tell',
      reason: 'no-resource-labels',
      resources: [],
    };
  }
  const resources = [...byName.values()]
    .map((entry) => ({ ...entry, labels: [...entry.labels].sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const unnamed = resources.filter((entry) => entry.status === null);
  if (unnamed.length > 0) {
    return {
      state: 'cannot-tell',
      reason: 'status-field-missing',
      resources,
      unnamed: unnamed.map((entry) => entry.name),
    };
  }
  return { state: 'finding', resources };
}

// ---------------------------------------------------------------- the capture ----

async function choosePort() {
  if (process.env.M036_PORT) return Number(process.env.M036_PORT);
  const srv = createServer();
  await new Promise((resolve, reject) => {
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', resolve);
  });
  const port = srv.address().port;
  await new Promise((resolve) => srv.close(resolve));
  return port;
}

async function runCapture() {
  const requireApp = createRequire(join(APP, 'package.json'));
  let chromium;
  try {
    ({ chromium } = requireApp('playwright'));
  } catch (error) {
    throw new Error(
      `playwright is not installed for the fixture (${APP}); run: npm --prefix spikes/ng222-app ci --include=dev. ${error}`,
    );
  }
  const playwrightVersion = requireApp('playwright/package.json').version;
  const angularVersion = packageVersion(
    'spikes/ng222-app/node_modules/@angular/core',
  );

  const port = await choosePort();
  const origin = `http://127.0.0.1:${port}`;
  const pageUrl = `${origin}${ROUTE_PATH}`;

  const server = spawn(
    process.execPath,
    [
      join(APP, 'node_modules', '@angular', 'cli', 'bin', 'ng.js'),
      'serve',
      '--port',
      String(port),
      '--host',
      '127.0.0.1',
    ],
    { cwd: APP, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const serverPid = server.pid;
  let serverOutput = '';
  const collect = (chunk) => {
    serverOutput = (serverOutput + chunk).slice(-8000);
  };
  server.stdout.on('data', collect);
  server.stderr.on('data', collect);

  let browser;
  try {
    await waitForServer(server, origin, () => serverOutput);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    browser = await chromium.launch({ headless: true });
    const browserBuild = browser.version();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForFunction(
      () => document.querySelectorAll('[ng-version]').length > 0,
      null,
      { timeout: 90000 },
    );
    await page.waitForTimeout(2000);

    const captured = await page.evaluate((elementName) => {
      const ng = window.ng;
      const element = document.querySelector(elementName);
      if (!element) throw new Error(`no <${elementName}> on the page`);
      const instance = ng.getComponent(element);
      const injector = ng.getInjector(element);
      const hook = typeof ng.ɵgetSignalGraph;
      const profilerHook = typeof ng.ɵsetProfiler;
      const graph = ng.ɵgetSignalGraph(injector);
      const nodes = graph.nodes.map((node) => ({
        label: typeof node.label === 'string' ? node.label : null,
        kind: typeof node.kind === 'string' ? node.kind : null,
        value:
          typeof node.value === 'string' ||
          typeof node.value === 'boolean' ||
          typeof node.value === 'number'
            ? node.value
            : null,
      }));
      const names = [
        'LoadingResource',
        'ResolvedResource',
        'ErroredResource',
        'IdleResource',
      ];
      const fromInstance = {};
      for (const name of names) {
        fromInstance[name] = instance[name].status();
      }
      return {
        ngVersion:
          document.querySelector('[ng-version]')?.getAttribute('ng-version') ??
          null,
        headingText:
          document.querySelector('#resource-states-heading')?.textContent ??
          null,
        hook,
        profilerHook,
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges.length,
        nodes,
        fromInstance,
        idleParamsValue: String(instance.IdleResource.value()),
      };
    }, ELEMENT);

    await browser.close();
    browser = undefined;

    const resourceNodes = captured.nodes.filter(
      (node) =>
        typeof node.label === 'string' && node.label.startsWith('Resource#'),
    );
    const resources = EXPECTED_STATES.map(([debugName, expected]) => {
      const labels = resourceNodes
        .map((node) => node.label)
        .filter((label) => label.startsWith(`Resource#${debugName}.`))
        .sort();
      const statusNode = resourceNodes.find(
        (node) => node.label === `Resource#${debugName}.status`,
      );
      const isLoadingNode = resourceNodes.find(
        (node) => node.label === `Resource#${debugName}.isLoading`,
      );
      return {
        debugName,
        expectedState: expected,
        labels,
        status: statusNode ? statusNode.value : null,
        isLoading: isLoadingNode ? isLoadingNode.value : null,
        instanceStatus: captured.fromInstance[debugName] ?? null,
      };
    });

    return {
      capturedAt: new Date().toISOString(),
      browser: `headless Playwright Chromium (build ${browserBuild})`,
      browserBuild,
      instance: 'headless',
      playwright: playwrightVersion,
      angularVersion,
      url: pageUrl,
      pageUrl,
      commands: {
        install: 'npm ci --include=dev',
        installApp: 'npm --prefix spikes/ng222-app ci --include=dev',
        serve: `node spikes/ng222-app/node_modules/@angular/cli/bin/ng.js serve --port ${port} --host 127.0.0.1  (cwd spikes/ng222-app)`,
        capture: CAPTURE_COMMAND,
        check: CHECK_COMMAND,
      },
      environment: {
        platform: process.platform,
        shell: 'cmd.exe',
        node: process.version,
      },
      fixture: {
        route: ROUTE_PATH,
        routeTable: 'spikes/ng222-app/src/app/app.routes.ts',
        page: 'spikes/ng222-app/src/app/resource-page.ts',
        pageComponent: 'ResourcePage',
        statesSource: 'spikes/ng222-app/src/app/resource-states.ts',
        statesComponent: 'ResourceStates',
        element: ELEMENT,
        whyIdle:
          'IdleResource params read the IdleSource signal, which stays undefined, and return undefined; an undefined request is what the state computation turns into status idle, so the loader never runs',
      },
      hooks: {
        labelsComeFrom: 'ɵgetSignalGraph',
        setProfilerCarriesNoLabels: true,
        perInstall: INSTALLS.map((install) => ({
          package: '@angular/core',
          path: install.path,
          version: packageVersion(install.path),
          servedByTheFixture: install.servedByTheFixture,
          declaredInTypes: declaredHooks(install.path),
          publishedOnWindowNg: publishedGlobals(install.path),
          sourceFacts: resourceSourceFacts(install.path),
          runtime: install.servedByTheFixture
            ? {
                reading: 'window.ng read in the served page',
                getSignalGraph: captured.hook,
                setProfiler: captured.profilerHook,
                returnedGraph: true,
              }
            : null,
        })),
      },
      graph: {
        reading: 'ɵgetSignalGraph(ng.getInjector(<app-resource-states>))',
        nodeCount: captured.nodeCount,
        edgeCount: captured.edgeCount,
        resourceNodeCount: resourceNodes.length,
        nodes: captured.nodes
          .slice()
          .sort((a, b) => (a.label ?? '').localeCompare(b.label ?? '')),
      },
      page: {
        ngVersion: captured.ngVersion,
        headingText: captured.headingText,
        idleParamsValue: captured.idleParamsValue,
        route: ROUTE_PATH,
      },
      resources,
    };
  } finally {
    if (browser) await browser.close().catch(() => {});
    await stopServer(server, port);
    assertTeardownClean(serverPid);
  }
}

async function waitForServer(server, origin, output) {
  const started = Date.now();
  let exit = null;
  server.on('exit', (code, signal) => {
    exit = { code, signal };
  });
  while (Date.now() - started < 240000) {
    if (exit)
      throw new Error(`server exited: ${JSON.stringify(exit)}\n${output()}`);
    try {
      const res = await fetch(`${origin}/`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`server not answering: ${output()}`);
}

async function killProcessTree(pid) {
  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/PID', String(pid), '/T', '/F'], {
      stdio: 'ignore',
    });
    await new Promise((resolve) =>
      killer.on('exit', resolve).on('error', resolve),
    );
  } else {
    try {
      process.kill(-pid, 'SIGTERM');
    } catch {
      try {
        process.kill(pid, 'SIGTERM');
      } catch {}
    }
  }
}

async function waitForPortFree(port, timeout = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const free = await new Promise((resolve) => {
      const srv = createServer();
      srv.once('error', () => resolve(false));
      srv.listen(port, '127.0.0.1', () => srv.close(() => resolve(true)));
    });
    if (free) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`port ${port} not free after ${timeout}ms`);
}

async function stopServer(server, port) {
  if (server.exitCode === null && server.signalCode === null) {
    try {
      await killProcessTree(server.pid);
    } catch {}
    server.kill();
    const timer = setTimeout(() => {
      try {
        server.kill('SIGKILL');
      } catch {}
    }, 5000);
    timer.unref?.();
    try {
      await once(server, 'exit');
    } catch {}
    clearTimeout(timer);
  }
  await waitForPortFree(port);
}

function isPidAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return !!(error && error.code === 'EPERM');
  }
}

function assertTeardownClean(pid) {
  if (isPidAlive(pid)) throw new Error(`server PID ${pid} survived teardown`);
}

/**
 * @param {{nodes?: {label?: string|null}[]}} graph
 * @returns {string[]} the graph's labels, sorted
 */
function graphLabels(graph) {
  return (graph?.nodes ?? [])
    .map((node) => node.label)
    .filter((label) => typeof label === 'string')
    .sort();
}

// ---------------------------------------------------------------- checks ----

function loadRecord() {
  return JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
}

function clone(record) {
  return JSON.parse(JSON.stringify(record));
}

function validate(record) {
  for (const key of [
    'capturedAt',
    'browser',
    'browserBuild',
    'instance',
    'playwright',
    'angularVersion',
    'url',
    'pageUrl',
  ]) {
    assert.equal(
      typeof record[key],
      'string',
      `the recording must carry ${key}`,
    );
    assert.notEqual(record[key], '', `the recording must carry ${key}`);
  }
  assert.equal(record.instance, 'headless');
  assert.match(record.capturedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  assert.match(record.browserBuild, /^\d+\.\d+\.\d+\.\d+$/);
  assert.ok(record.browser.includes(record.browserBuild), 'browser build');
  assert.equal(record.url, record.pageUrl, 'url and pageUrl must agree');
  assert.ok(record.url.endsWith(ROUTE_PATH), `url must end ${ROUTE_PATH}`);
  assert.equal(record.fixture.route, ROUTE_PATH);
  assert.equal(record.fixture.whyIdle.length > 0, true, 'whyIdle');

  // The gate the recording is made behind, in the cmd.exe form that works.
  assert.ok(
    record.commands.capture.includes('set "M036_CAPTURE=1"&&'),
    'capture command must be the quoted cmd.exe form',
  );
  assert.ok(record.commands.check.includes('resource-graph-capture'));
  assert.ok(record.commands.serve.includes('ng.js serve'));

  // Hooks: both installs, both symbols, read from the installs on disk.
  const perInstall = record.hooks.perInstall;
  assert.equal(perInstall.length, INSTALLS.length, 'one entry per install');
  for (const [index, install] of INSTALLS.entries()) {
    const entry = perInstall[index];
    assert.equal(entry.path, install.path);
    assert.equal(entry.version, packageVersion(install.path));
    assert.deepEqual(entry.declaredInTypes, declaredHooks(install.path));
    assert.deepEqual(entry.publishedOnWindowNg, publishedGlobals(install.path));
    assert.deepEqual(entry.sourceFacts, resourceSourceFacts(install.path));
    const getSignalGraph = entry.publishedOnWindowNg.find(
      (hook) => hook.symbol === 'ɵgetSignalGraph',
    );
    assert.ok(
      getSignalGraph && getSignalGraph.published,
      `${entry.version}: ɵgetSignalGraph must be published`,
    );
    const declared = entry.declaredInTypes.find(
      (hook) => hook.symbol === 'ɵgetSignalGraph',
    );
    assert.ok(declared && declared.declared, `${entry.version}: declared`);
    assert.ok(
      entry.sourceFacts.debugNameBuilder,
      `${entry.version}: the label builder must be present`,
    );
    assert.ok(
      entry.sourceFacts.idleFromUndefinedRequest,
      `${entry.version}: the idle-from-undefined-request line must be present`,
    );
    if (install.servedByTheFixture) {
      assert.equal(entry.runtime.getSignalGraph, 'function');
      assert.equal(entry.runtime.setProfiler, 'function');
      assert.equal(entry.runtime.returnedGraph, true);
    } else {
      assert.equal(entry.runtime, null, 'the unserved install is not run');
    }
  }
  assert.equal(record.hooks.labelsComeFrom, 'ɵgetSignalGraph');

  // The graph itself.
  assert.ok(record.graph.nodeCount > 0, 'the graph must hold nodes');
  assert.ok(record.graph.edgeCount > 0, 'the graph must hold edges');
  assert.ok(
    record.graph.resourceNodeCount > 0,
    'the graph must hold resource nodes',
  );
  assert.equal(
    record.graph.nodes.length,
    record.graph.nodeCount,
    'the recorded nodes must be the count the graph returned',
  );
  const labels = graphLabels(record.graph);
  assert.equal(
    record.graph.resourceNodeCount,
    labels.filter((label) => label.startsWith('Resource#')).length,
    'resourceNodeCount must match the labels',
  );
  assert.ok(
    labels.includes(record.fixture.element),
    'the template consumer must be labelled with its element',
  );

  // Four resources, one per state, each with a status field.
  assert.equal(record.resources.length, EXPECTED_STATES.length);
  for (const [index, [debugName, expected]] of EXPECTED_STATES.entries()) {
    const resource = record.resources[index];
    assert.equal(resource.debugName, debugName);
    assert.equal(resource.expectedState, expected);
    assert.equal(
      resource.status,
      expected,
      `${debugName}: the graph's status node must read ${expected}`,
    );
    assert.equal(
      resource.instanceStatus,
      expected,
      `${debugName}: the instance's status() must read ${expected}`,
    );
    assert.equal(
      resource.labels.includes(`Resource#${debugName}.status`),
      true,
      `${debugName}: the status label must be present`,
    );
    assert.equal(
      resource.labels.includes(`Resource#${debugName}.state`),
      true,
      `${debugName}: the state label must be present`,
    );
    assert.equal(
      resource.labels.includes(`Resource#${debugName}.extRequest`),
      true,
      `${debugName}: the extRequest label must be present`,
    );
    assert.equal(
      typeof resource.isLoading,
      'boolean',
      `${debugName}: isLoading must be a boolean`,
    );
  }
  const states = record.resources.map((resource) => resource.status);
  assert.deepEqual(
    [...new Set(states)].length,
    states.length,
    'the four resources must reach four distinct states',
  );
  return true;
}

// ---------------------------------------------------------------- read-only checks ----

test('the recording validates against the four states and the installs on disk', () => {
  assert.doesNotThrow(() => validate(loadRecord()));
});

test('the recording proves the hook exists on both installed versions', () => {
  const record = loadRecord();
  const versions = record.hooks.perInstall.map((entry) => entry.version);
  assert.equal(versions.length, 2, 'two installs are recorded');
  assert.equal(
    versions[0],
    packageVersion('node_modules/@angular/core'),
    'the repository install version',
  );
  assert.equal(
    versions[1],
    packageVersion('spikes/ng222-app/node_modules/@angular/core'),
    'the fixture install version',
  );
  assert.notEqual(versions[0], versions[1], 'two versions, not one twice');
  for (const entry of record.hooks.perInstall) {
    const hook = entry.publishedOnWindowNg.find(
      (candidate) => candidate.symbol === 'ɵgetSignalGraph',
    );
    assert.ok(
      hook && hook.published,
      `${entry.version} does not publish ɵgetSignalGraph on window.ng`,
    );
  }
});

test('the served install answered through the hook and returned a graph', () => {
  const record = loadRecord();
  const served = record.hooks.perInstall.find(
    (entry) => entry.servedByTheFixture,
  );
  assert.ok(served, 'one install served the fixture');
  assert.equal(served.version, record.angularVersion);
  assert.equal(record.page.ngVersion, record.angularVersion);
  assert.equal(served.runtime.getSignalGraph, 'function');
  assert.ok(record.graph.nodeCount > 0, 'the graph returned no nodes');
  assert.ok(
    record.page.headingText.includes('resource states'),
    'the page rendered its heading',
  );
});

test('the four resources report loading, resolved, error and idle', () => {
  const record = loadRecord();
  assert.deepEqual(
    record.resources.map((resource) => [resource.debugName, resource.status]),
    EXPECTED_STATES,
  );
  const idle = record.resources.find(
    (resource) => resource.debugName === 'IdleResource',
  );
  assert.equal(idle.status, 'idle', 'the idle subject is not idle');
  assert.equal(idle.instanceStatus, 'idle');
  assert.equal(idle.isLoading, false);
  const loading = record.resources.find(
    (resource) => resource.debugName === 'LoadingResource',
  );
  assert.equal(loading.status, 'loading');
  assert.equal(loading.isLoading, true, 'the loading subject is not loading');
});

test('the reader names every resource from the recorded graph', () => {
  const record = loadRecord();
  const served = record.hooks.perInstall.find(
    (entry) => entry.servedByTheFixture,
  );
  const reading = resourceLifecycle(
    served.runtime.getSignalGraph,
    record.graph,
  );
  assert.equal(reading.state, 'finding');
  assert.deepEqual(
    reading.resources.map((resource) => [resource.name, resource.status]),
    [...EXPECTED_STATES].sort(([a], [b]) => a.localeCompare(b)),
  );
});

test('with the hook absent no finding is produced downstream', () => {
  const record = loadRecord();
  const reading = resourceLifecycle('undefined', record.graph);
  assert.equal(reading.state, 'cannot-tell');
  assert.equal(reading.reason, 'no-graph-hook');
  assert.deepEqual(reading.resources, [], 'no hook must yield no resources');
});

test('held-out: a graph whose labels were stripped names nothing', () => {
  const mutant = clone(loadRecord());
  mutant.graph.nodes = mutant.graph.nodes.map((node) => ({
    ...node,
    label: null,
  }));
  const reading = resourceLifecycle('function', mutant.graph);
  assert.equal(reading.state, 'cannot-tell');
  assert.equal(reading.reason, 'no-resource-labels');
  assert.deepEqual(reading.resources, []);
});

test('held-out: a resource whose status label went missing is refused', () => {
  const mutant = clone(loadRecord());
  mutant.graph.nodes = mutant.graph.nodes.filter(
    (node) => node.label !== 'Resource#IdleResource.status',
  );
  const reading = resourceLifecycle('function', mutant.graph);
  assert.equal(reading.state, 'cannot-tell');
  assert.equal(reading.reason, 'status-field-missing');
  assert.deepEqual(reading.unnamed, ['IdleResource']);
});

test('held-out: a recording claiming a status the instance did not report reddens', () => {
  const mutant = clone(loadRecord());
  mutant.resources[3].status = 'loading';
  assert.throws(
    () => validate(mutant),
    /IdleResource: the graph's status node/,
  );
});

test('held-out: a recording that drops the idle subject reddens', () => {
  const mutant = clone(loadRecord());
  mutant.resources = mutant.resources.filter(
    (resource) => resource.debugName !== 'IdleResource',
  );
  assert.throws(() => validate(mutant));
});

test('the recording is made behind a gate, not on a default run', () => {
  const source = readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const writes = [...source.matchAll(/writeFileSync\(/g)];
  assert.equal(writes.length, 1, 'this file must hold exactly one write');
  const gate = source.indexOf("if (process.env.M036_CAPTURE === '1')");
  assert.ok(gate !== -1, 'the M036_CAPTURE gate must be present');
  assert.ok(gate < writes[0].index, 'the only write must sit behind the gate');
});

test('PRECONDITION: the fixture route is registered with its page', () => {
  const routes = readFileSync(ROUTES_PATH, 'utf8');
  assert.ok(existsSync(PAGE_PATH), 'the route component is missing');
  assert.ok(existsSync(STATES_PATH), 'the resources component is missing');
  assert.ok(
    routes.includes(`path: '${ROUTE_PATH.slice(1)}'`),
    `the ${ROUTE_PATH.slice(1)} route is not in the route table`,
  );
  assert.ok(routes.includes('ResourcePage'), 'ResourcePage is not routed');
  const page = readFileSync(PAGE_PATH, 'utf8');
  assert.match(
    page,
    /from '\.\/resource-states'/,
    'the route component must host the resources component',
  );
});

test('PRECONDITION: the fixture names four resources and reads no profiler', () => {
  const states = readFileSync(STATES_PATH, 'utf8');
  for (const [debugName] of EXPECTED_STATES) {
    assert.ok(
      states.includes(`debugName: '${debugName}'`),
      `${debugName} carries no debugName, so no label`,
    );
    assert.ok(
      states.includes(debugName),
      `${debugName} is missing from the fixture`,
    );
  }
  for (const [label, text] of [
    ['resource-states.ts', states],
    ['resource-page.ts', readFileSync(PAGE_PATH, 'utf8')],
  ]) {
    assert.ok(!text.includes('setProfiler'), `${label} names setProfiler`);
    for (const forbidden of ['getSignalGraph', 'window.ng']) {
      assert.ok(
        !text.includes(forbidden),
        `${label} reads the graph itself (${forbidden})`,
      );
    }
  }
});

// ---------------------------------------------------------------- opt-in capture ----

if (process.env.M036_CAPTURE === '1') {
  test('capture the signal graph of the four resources', async (t) => {
    const record = await runCapture();
    validate(record);
    writeFileSync(RECORD_PATH, `${JSON.stringify(record, null, 2)}\n`);
    t.diagnostic(
      `hook ɵgetSignalGraph: ${record.hooks.perInstall
        .map(
          (entry) =>
            `${entry.version}=${entry.runtime?.getSignalGraph ?? 'not run'}`,
        )
        .join(', ')}; ${record.graph.nodeCount} nodes, ${record.resources
        .map((resource) => `${resource.debugName}=${resource.status}`)
        .join(', ')}`,
    );
  });
}
