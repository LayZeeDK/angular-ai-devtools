// @ts-check
//
// M043 T001 - the stability surface, measured at this head and carried on the page
// agent's record.
//
// Four readings, each derived here rather than described:
//
//   reach      The walk the agent already performs for `Router` is driven against
//              `ApplicationRef` on a subject whose provider records carry that
//              token and on one whose records do not: the shipped
//              `extension/agent-main.js` is booted in this realm (its own suite's
//              boot, with `ng`/`document`/`CustomEvent`/`performance` mocked), the
//              injector resolution path is walked, and what `injector.get`
//              answered is recorded for both.
//   currency   One subscription taken through the `isStable` getter's own
//              expression, driven against the *installed* 22.2.2
//              `PendingTasksInternal` and its real rxjs `map`: a BehaviorSubject
//              hands a new subscriber its current value, so one subscription taken
//              at attach stays current through a later `add()`/`remove()` flip.
//   page       `/resource-states` is SC1's positive case: the fixture's resource
//              takes the page's `PendingTasks`, `add()`s a task when the load
//              starts and removes it only when the loader settles, and
//              `LoadingResource`'s loader returns a promise nothing resolves - so
//              the page is unstable for its lifetime and cannot end a task.
//   record     The agent publishes a `stability` section beside `events`,
//              `routerEvents`, `boundary` and `checks`, in the frame record and in
//              the initial snapshot, armed from the install path and removed by
//              `reset()`.
//
// Read-only: no product change, no page, no server, no browser. A default run
// writes nothing; `M043_CAPTURE=1` writes the recording, and a second armed run at
// the same head changes no byte.
//
// Run the checks:
//   node --experimental-strip-types --test scripts/stability-measure.test.mjs
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, it } from 'node:test';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const RECORD_PATH = join(ROOT, 'research', 'raw', 'm043-stability.json');
const AGENT_PATH = join(ROOT, 'extension', 'agent-main.js');
const FIXTURE_PATH = join(ROOT, 'spikes', 'ng222-app');
const RESOURCE_STATES_PATH = join(
  FIXTURE_PATH,
  'src',
  'app',
  'resource-states.ts',
);

/** The moment this reading was taken; a constant, so an armed re-run is stable. */
const CAPTURED_AT = '2026-11-09T00:00:00.000Z';

/** This task's Verify line, verbatim. */
const CHECK_COMMAND =
  'node --check extension/agent-main.js && node --check extension/agent-main.test.mjs && node --check scripts/stability-measure.test.mjs && node --experimental-strip-types --test "scripts/stability-measure.test.mjs" "extension/agent-main.test.mjs" "extension/page-footprint.test.mjs" "extension/error-boundary.test.mjs" "scripts/performance-measure.test.mjs" "scripts/render-phase-measure.test.mjs" "scripts/performance-capture.test.mjs" "scripts/render-phase-capture.test.mjs" "scripts/navigation-measure.test.mjs" "scripts/navigation-capture.test.mjs" "scripts/error-boundary-measure.test.mjs" "scripts/error-boundary-capture.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check extension/agent-main.js extension/agent-main.test.mjs scripts/stability-measure.test.mjs scripts/error-boundary-measure.test.mjs scripts/error-boundary-capture.test.mjs apps/angular-ai-devtools/src/app/companion.spec.ts apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts research/raw/m043-stability.json && npm run check';

/** The two installed copies of `@angular/core` this head carries. */
const INSTALLS = [
  { label: 'repo', modules: join(ROOT, 'node_modules') },
  { label: 'fixture', modules: join(FIXTURE_PATH, 'node_modules') },
];

/** The profiler values the frame-level list records, by name. */
const PE = { TemplateUpdateStart: 2, TemplateUpdateEnd: 3 };
const CHANGE_DETECTION_START = 12;
const CHANGE_DETECTION_END = 13;

// ---------------------------------------------------------------- helpers ----

function fail(message) {
  throw new Error(message);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function displayPath(path) {
  return relative(ROOT, path).split(sep).join('/');
}

function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

function clone(record) {
  return JSON.parse(JSON.stringify(record));
}

function requireFile(path, why) {
  assert.ok(existsSync(path), `${displayPath(path)} is missing - ${why}`);
  return path;
}

function strings(record, keys, where) {
  if (!isObject(record)) fail(`missing ${where}`);
  for (const key of keys) {
    if (typeof record[key] !== 'string' || record[key] === '') {
      fail(`missing ${where}.${key}`);
    }
  }
}

/** Memoise a derivation so every validator compares against one reading. */
function once(fn) {
  let done = false;
  let value;
  return () => {
    if (!done) {
      value = fn();
      done = true;
    }
    return value;
  };
}

/** The 1-indexed line numbers of a file that carry `needle`. */
function linesHolding(lines, needle) {
  const found = [];
  lines.forEach((line, index) => {
    if (line.includes(needle)) found.push(index + 1);
  });
  return found;
}

/** The one 1-indexed line a file carries `needle` on, or a named failure. */
function soleLine(lines, needle, where) {
  const found = linesHolding(lines, needle);
  if (found.length !== 1) {
    fail(
      `${where} holds ${found.length} line(s) carrying ${JSON.stringify(needle)}, expected exactly one`,
    );
  }
  return found[0];
}

/** The 0-based index of the line `lines[startIndex]`'s block closes on. */
function blockEndIndex(lines, startIndex) {
  let depth = 0;
  for (let index = startIndex; index < lines.length; index += 1) {
    for (const character of lines[index]) {
      if (character === '{') depth += 1;
      else if (character === '}') depth -= 1;
    }
    if (depth <= 0) return index;
  }
  fail(`the block opening on line ${startIndex + 1} never closes`);
  return startIndex;
}

/** The files below a directory whose name ends with `suffix`, sorted. */
function filesUnder(directory, suffix) {
  requireFile(directory, 'run npm ci at the fixture');
  return readdirSync(directory)
    .filter((entry) => entry.endsWith(suffix))
    .sort()
    .map((entry) => join(directory, entry));
}

/** One install of `@angular/core`, as the files it ships. */
function readInstall(spec) {
  const coreRoot = join(spec.modules, '@angular', 'core');
  const manifest = join(coreRoot, 'package.json');
  requireFile(manifest, 'run npm ci at the fixture');
  const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
  const chunkDir = join(coreRoot, 'fesm2022');
  const chunks = filesUnder(chunkDir, '.mjs').map((path) => ({
    name: path.slice(chunkDir.length + 1),
    path,
    text: readFileSync(path, 'utf8'),
  }));
  return { ...spec, version: pkg.version, manifest, chunks, dir: chunkDir };
}

/** The one chunk of an install carrying `needle`, or a named failure. */
function chunkCarrying(install, needle, where) {
  const found = install.chunks.filter((chunk) => chunk.text.includes(needle));
  if (found.length !== 1) {
    fail(
      `${install.label} install holds ${found.length} chunk(s) carrying ${JSON.stringify(needle)}, expected exactly one - ${where}`,
    );
  }
  return found[0];
}

/** A citation into a chunk: `path:line` or `path:line-end`. */
function chunkCitation(chunk, needle, where) {
  const line = soleLine(chunk.text.split('\n'), needle, where);
  return `${displayPath(chunk.path)}:${line}`;
}

/** The citation a chunk line and its closing block make: `path:start-end`. */
function chunkSpan(chunk, needle, where) {
  const lines = chunk.text.split('\n');
  const line = soleLine(lines, needle, where);
  return `${displayPath(chunk.path)}:${line}-${blockEndIndex(lines, line - 1) + 1}`;
}

// --------------------------------------------------------------- the core ----

/** The 22.2.2 surface `isStable` is built on, read from the fixture's install. */
const CORE = once(() => {
  const fixture = readInstall(INSTALLS[1]);
  const repo = readInstall(INSTALLS[0]);
  const debug = chunkCarrying(
    fixture,
    'class ApplicationRef {',
    'the application reference class is part of a page runtime',
  );
  const debugLines = debug.text.split('\n');
  const getterAt = soleLine(
    debugLines,
    'get isStable() {',
    "the application reference's stability getter",
  );
  const pending = chunkCarrying(
    fixture,
    'class PendingTasksInternal {',
    'the pending-task tracker is what isStable derives from',
  );
  const pendingLines = pending.text.split('\n');
  return {
    fixture,
    repo,
    debug,
    debugLines,
    pending,
    pendingLines,
    classAt: chunkCitation(
      debug,
      'class ApplicationRef {',
      'the application reference class',
    ),
    getter: {
      at: `${displayPath(debug.path)}:${getterAt}-${getterAt + 1}`,
      source: debugLines[getterAt].trim(),
      returns: debugLines[getterAt].trim(),
    },
    tracker: {
      at: chunkSpan(
        pending,
        'class PendingTasksInternal {',
        'the pending-task tracker',
      ),
      setAt: chunkCitation(pending, 'pendingTasks = new Set();', 'the id set'),
      subjectAt: chunkCitation(
        pending,
        'pendingTask = new BehaviorSubject(false);',
        'the stream the getter is built over',
      ),
      observableAt: chunkCitation(
        pending,
        'get hasPendingTasksObservable() {',
        'the observable getter',
      ),
      addAt: chunkCitation(
        pending,
        'if (!this.hasPendingTasks && !this.destroyed) {',
        'the add, which announces the edge before it records the id',
      ),
      hasAt: chunkSpan(pending, 'has(taskId) {', 'the membership read'),
      removeAt: chunkSpan(pending, 'remove(taskId) {', 'the remove'),
      hasPendingTasksAt: chunkCitation(
        pending,
        'get hasPendingTasks() {',
        'the boolean the getter maps',
      ),
    },
  };
});

/**
 * The currency question, answered by driving the installed tracker.
 *
 * The `isStable` getter builds `hasPendingTasksObservable.pipe(map(pending => !pending))`
 * per access, and `hasPendingTasksObservable` answers `this.pendingTask` - a
 * `BehaviorSubject` - so a subscriber is handed the current value at subscribe and
 * every later `next()` reaches it. One subscription is therefore enough, which is
 * what the agent takes.
 */
const CURRENCY = once(async () => {
  const core = await import(
    pathToFileURL(join(CORE().fixture.dir, '_pending_tasks-chunk.mjs')).href
  );
  const requireFixture = createRequire(join(FIXTURE_PATH, 'package.json'));
  const { map } = requireFixture('rxjs/operators');
  const injector = core.Injector.create({ providers: [], parent: null });
  const tasks = core.runInInjectionContext(
    injector,
    () => new core.PendingTasksInternal(),
  );
  const seen = [];
  const subscription = tasks.hasPendingTasksObservable
    .pipe(map((pending) => !pending))
    .subscribe((value) => seen.push(value));
  const atSubscribe = seen.slice();
  const first = tasks.add();
  const afterFirstAdd = seen.slice();
  const second = tasks.add();
  const afterSecondAdd = seen.slice();
  tasks.remove(first);
  const afterOneRemoved = seen.slice();
  tasks.remove(second);
  const afterAllRemoved = seen.slice();
  const third = tasks.add();
  tasks.remove(third);
  const afterSecondFlip = seen.slice();
  subscription.unsubscribe();
  return {
    atSubscribe,
    afterFirstAdd,
    afterSecondAdd,
    afterOneRemoved,
    afterAllRemoved,
    afterSecondFlip,
    sequence: seen,
    taskIds: [first, second, third],
    taskIdType: typeof first,
    idsAfterSubscribe: [...tasks.pendingTasks],
    idsKind: tasks.pendingTasks.constructor.name,
    subscriptionsTaken: 1,
    staysCurrent: afterAllRemoved.join() === 'true,false,true',
    flipsAcross: seen.length,
    membershipReadableBy: `has(taskId) at ${CORE().tracker.hasAt}`,
  };
});

// --------------------------------------------------------------- the agent ----

/** The stability section: where it starts, where it ends, and every anchor in it. */
const AGENT = once(() => {
  const source = readFileSync(
    requireFile(AGENT_PATH, 'the page agent is part of this repository'),
    'utf8',
  );
  const lines = source.split('\n');
  const tokenLine = soleLine(
    lines,
    "var STABILITY_TOKEN_NAME = 'ApplicationRef';",
    'extension/agent-main.js',
  );
  const apiLine = soleLine(lines, '  var api = {', 'the agent handle');
  const sectionLines = lines.slice(tokenLine - 1, apiLine - 1);
  const inSection = (needle) =>
    soleLine(sectionLines, needle, 'the stability section');
  const offset = tokenLine - 1;
  const installLine = linesHolding(lines, '    installStability();');
  if (installLine.length !== 2) {
    fail(
      `the install path arms the stability read on ${installLine.length} line(s), expected exactly two - start()'s first attempt and its retry`,
    );
  }
  const uninstallLine = linesHolding(lines, 'uninstallStability();');
  if (uninstallLine.length !== 1) {
    fail(
      `the reset path removing the stability read is ${uninstallLine.length} line(s), expected exactly one`,
    );
  }
  const fieldLines = linesHolding(lines, 'stability: stabilityField(),');
  if (fieldLines.length !== 2) {
    fail(
      `the frame record and the initial snapshot carry ${fieldLines.length} \`stability\` field(s), expected exactly two`,
    );
  }
  const closeCycleLine = soleLine(
    lines,
    'function closeCycle() {',
    'extension/agent-main.js',
  );
  const snapshotLine = soleLine(
    lines,
    'function dispatchInitialRecord() {',
    'extension/agent-main.js',
  );
  const onEventLine = soleLine(
    lines,
    'function onEvent(event, instance, eventFn) {',
    'extension/agent-main.js',
  );
  const onEventEnd = blockEndIndex(lines, onEventLine - 1) + 1;
  const fieldStart = lines.findIndex(
    (line, index) =>
      index + 1 >= tokenLine && line.includes('function stabilityField()'),
  );
  if (fieldStart === -1)
    fail('the stability section carries no `stabilityField`');
  const fieldEnd = blockEndIndex(lines, fieldStart);
  const keys = [];
  for (let index = fieldStart + 1; index < fieldEnd; index += 1) {
    const match = /^\s+([A-Za-z]+):/.exec(lines[index]);
    if (match !== null) keys.push(match[1]);
  }
  const versionLine = soleLine(
    lines,
    'var STABILITY_VERSION = ',
    'the declared surface version',
  );
  const versionValue = /'([^']+)'/.exec(lines[versionLine - 1])?.[1] ?? null;
  return {
    source,
    lines,
    tokenLine,
    apiLine,
    sectionAt: `extension/agent-main.js:${tokenLine}-${apiLine - 1}`,
    walk: [
      {
        step: 'ng.getInjector',
        at: `extension/agent-main.js:${tokenLine + offset0(inSection('injector = getInjector(element);'))}`,
        code: 'injector = getInjector(element);',
      },
      {
        step: 'ɵgetInjectorResolutionPath',
        at: `extension/agent-main.js:${tokenLine + offset0(inSection('entries = getPath(injector) || [];'))}`,
        code: 'entries = getPath(injector) || [];',
      },
      {
        step: 'ɵgetInjectorProviders',
        at: `extension/agent-main.js:${tokenLine + offset0(inSection('records = getProviders(entries[i]);'))}`,
        code: 'records = getProviders(entries[i]);',
      },
      {
        step: 'record.token',
        at: `extension/agent-main.js:${tokenLine + offset0(inSection('token = records[j] ? records[j].token : null;'))}`,
        code: 'token = records[j] ? records[j].token : null;',
      },
      {
        step: 'injector.get(token)',
        at: `extension/agent-main.js:${tokenLine + offset0(inSection('appRef = found.injector.get(found.token);'))}`,
        code: 'appRef = found.injector.get(found.token);',
      },
    ],
    readsTheGetterAt: `extension/agent-main.js:${tokenLine + offset0(inSection('stream = appRef.isStable;'))}`,
    namesTheTokenAt: `extension/agent-main.js:${tokenLine + offset0(inSection('if (routerTokenNameOf(token) !== STABILITY_TOKEN_NAME) continue;'))}`,
    recordsTheEmissionAt: `extension/agent-main.js:${tokenLine + offset0(inSection('stabilityReading = { value: value === true, at: at };'))}`,
    settlesAt: `extension/agent-main.js:${tokenLine + offset0(inSection("stabilitySettle = { state: 'settled', at: at };"))}`,
    fieldAt: `extension/agent-main.js:${fieldStart + 1}-${fieldEnd + 1}`,
    keys,
    version: versionValue,
    versionAt: `extension/agent-main.js:${versionLine}`,
    frameFieldAt: `extension/agent-main.js:${fieldLines[0]}`,
    snapshotFieldAt: `extension/agent-main.js:${fieldLines[1]}`,
    armedAt: `extension/agent-main.js:${installLine[0]}`,
    armedAtTheRetry: `extension/agent-main.js:${installLine[1]}`,
    removedAt: `extension/agent-main.js:${uninstallLine[0]}`,
    armedInsideTheProfilerCallback:
      installLine[0] >= onEventLine && installLine[0] <= onEventEnd,
    onEventRange: `extension/agent-main.js:${onEventLine}-${onEventEnd}`,
  };
});

/** A section-relative 1-indexed line turned into an absolute one. */
function offset0(index) {
  return index - 1;
}

// ------------------------------------------------------------- the page ----

/** `/resource-states`: the fixture's never-settling subject, read from its own files. */
const PAGE = once(() => {
  const source = readFileSync(
    requireFile(RESOURCE_STATES_PATH, 'the subject SC1 is measured on'),
    'utf8',
  );
  const lines = source.split('\n');
  const resource = chunkCarrying(
    CORE().fixture,
    'class ResourceImpl extends BaseWritableResource {',
    'the resource class is part of a page runtime',
  );
  const resourceLines = resource.text.split('\n');
  const at = (needle, why) => soleLine(lines, needle, why);
  const resourceAt = (needle, why) =>
    `${displayPath(resource.path)}:${soleLine(resourceLines, needle, why)}`;
  const loadingAt = at(
    'readonly LoadingResource = resource({',
    'the loading subject',
  );
  return {
    file: displayPath(RESOURCE_STATES_PATH),
    neverSettlesAt: `${displayPath(RESOURCE_STATES_PATH)}:${at('private readonly neverSettles = new Promise<never>(() => {});', 'the never-settling promise')}`,
    neverSettles: 'new Promise<never>(() => {})',
    loadingResourceAt: `${displayPath(RESOURCE_STATES_PATH)}:${loadingAt}-${blockEndIndex(lines, loadingAt - 1) + 1}`,
    loaderAt: `${displayPath(RESOURCE_STATES_PATH)}:${at('loader: () => this.neverSettles,', 'the loading loader')}`,
    componentAt: `${displayPath(RESOURCE_STATES_PATH)}:${at('export class ResourceStates {', 'the subject component')}`,
    coupling: {
      injectsPendingTasksAt: resourceAt(
        'this.pendingTasks = injector.get(PendingTasks);',
        'the resource taking the tracker',
      ),
      addsATaskAt: resourceAt(
        'let resolvePendingTask = this.resolvePendingTask = this.pendingTasks.add();',
        'the task the load adds',
      ),
      removesInFinallyAt: resourceAt(
        '      resolvePendingTask?.();',
        'the removal a settled load runs in its finally',
      ),
      removesOnAbortAt: resourceAt(
        'this.resolvePendingTask?.();',
        'the removal an aborted load runs',
      ),
      projectsStatusAt: chunkSpan(
        resource,
        'function projectStatusOfState(state) {',
        'the status projection',
      ),
    },
    state: 'unstable',
    stateFor: "the page's lifetime",
    reasonAvailable: false,
  };
});

// ---------------------------------------------- booting the shipped agent ----

/** The provider records a subject's environment injector answers. */
function recordsFor(kind) {
  if (kind === 'withToken') {
    return [
      { token: { name: 'Router' } },
      { token: { name: 'ApplicationRef' } },
    ];
  }
  return [{ token: { name: 'Router' } }, { token: { name: 'ErrorHandler' } }];
}

/**
 * Boots one source in this realm with the page globals the agent's own suite mocks,
 * and hands the caller a page it drives: the profiler subscriber, the install path's
 * own answer, and the two streams a provider record can expose.
 */
function bootAgent(source, subject, body) {
  const saved = {
    ng: globalThis.ng,
    Zone: globalThis.Zone,
    CustomEvent: globalThis.CustomEvent,
    dispatchEvent: globalThis.dispatchEvent,
    performance: globalThis.performance,
    queueMicrotask: globalThis.queueMicrotask,
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,
    document: globalThis.document,
    recorder: globalThis.__ngRecorder,
  };
  /** @type {any[]} */
  const dispatched = [];
  /** @type {Array<() => void>} */
  const queued = [];
  /** @type {Array<{ fn: () => void, ms: number }>} */
  const timers = [];
  /** @type {Error[]} */
  const errors = [];
  const emitted = [];
  const listeners = [];
  let clock = 1000;
  let getterReads = 0;
  let subscribeCount = 0;
  let unsubscribes = 0;
  let setProfilerCalls = 0;
  let graph = null;

  const appRef = {
    constructor: { name: 'ApplicationRef' },
    get isStable() {
      getterReads += 1;
      return {
        subscribe(listener) {
          subscribeCount += 1;
          listeners.push(listener);
          for (const value of subject.syncEmissions) {
            emitted.push(value);
            listener(value);
          }
          return {
            unsubscribe() {
              unsubscribes += 1;
            },
          };
        },
      };
    },
  };

  const element = { tagName: 'APP-ROOT', __ngContext__: 0 };
  const nameOf = (token) =>
    token === null || typeof token === 'undefined'
      ? null
      : typeof token === 'string'
        ? token
        : (token.name ?? null);
  const elementInjector = {
    records: [{ token: { name: 'ElementInjectorDependency' } }],
    get: () => null,
  };
  const envInjector = {
    records: recordsFor(subject.records),
    get: (token) => (nameOf(token) === 'ApplicationRef' ? appRef : null),
  };

  const ng = {
    VERSION: { full: '22.2.2', major: 22, minor: 2, patch: 2 },
    ɵsetProfiler() {
      setProfilerCalls += 1;
      return () => {};
    },
    ɵgetSignalGraph: () => graph,
    getHostElement: () => ({ tagName: 'APP-ROOT' }),
    getDirectiveMetadata: () => ({ changeDetection: 1 }),
    getComponent: () => ({ constructor: { name: 'Counter' } }),
    getInjector: () => elementInjector,
    ɵgetInjectorResolutionPath: () => [elementInjector, envInjector],
    ɵgetInjectorProviders: (entry) => (entry ? entry.records : null),
  };

  globalThis.CustomEvent = function (type, options) {
    return { type, detail: options && options.detail };
  };
  globalThis.dispatchEvent = (event) => {
    dispatched.push(event);
  };
  globalThis.performance = { now: () => (clock += 1) };
  globalThis.queueMicrotask = (callback) => {
    queued.push(callback);
  };
  globalThis.setTimeout = (fn, ms) => {
    timers.push({ fn, ms });
    return timers.length;
  };
  globalThis.clearTimeout = () => {};
  globalThis.setInterval = (fn, ms) => {
    timers.push({ fn, ms });
    return timers.length;
  };
  globalThis.clearInterval = () => {};
  globalThis.document = {
    activeElement: null,
    body: element,
    documentElement: element,
    querySelector: (selector) => (selector === 'app-root' ? element : null),
    querySelectorAll: () => [element],
  };
  globalThis.ng = ng;
  delete globalThis.Zone;
  delete globalThis.__ngRecorder;

  try {
    vm.runInThisContext(source, { filename: 'agent-main.js' });
    const recorder = globalThis.__ngRecorder;
    if (recorder === undefined) {
      fail('extension/agent-main.js published no `__ngRecorder` handle');
    }
    const subscriber = recorder.getSubscriber();
    if (typeof subscriber !== 'function') {
      fail('extension/agent-main.js installed no profiler subscriber');
    }
    const page = {
      subscriber,
      recorder,
      dispatched,
      errors,
      timers,
      get graph() {
        return graph;
      },
      set graph(next) {
        graph = next;
      },
      get installed() {
        return recorder.installed;
      },
      get getterReads() {
        return getterReads;
      },
      get subscribeCount() {
        return subscribeCount;
      },
      get unsubscribes() {
        return unsubscribes;
      },
      get setProfilerCalls() {
        return setProfilerCalls;
      },
      get listeners() {
        return listeners.length;
      },
      /** Every emission the subject produced, in arrival order. */
      get emitted() {
        return emitted.slice();
      },
      /** The page emits one `isStable` value, as the observable would. */
      emit(value) {
        emitted.push(value);
        for (const listener of listeners) listener(value);
      },
      /** Everything `onEvent` queued, run in arrival order; a throw is kept. */
      drain() {
        while (queued.length > 0) {
          const run = queued.shift();
          try {
            run();
          } catch (error) {
            errors.push(error);
          }
        }
      },
      /** The install path's own deferred snapshot, run now. */
      snapshot() {
        while (timers.length > 0) {
          const timer = timers.shift();
          try {
            timer.fn();
          } catch (error) {
            errors.push(error);
          }
        }
        page.drain();
        return page.records().at(-1) ?? null;
      },
      /** One change-detection pass: two template-update pairs, then the frame. */
      frame(instance) {
        subscriber(PE.TemplateUpdateStart, instance);
        subscriber(PE.TemplateUpdateEnd, instance);
        subscriber(PE.TemplateUpdateStart, instance);
        subscriber(PE.TemplateUpdateEnd, instance);
        page.drain();
        return page.records().at(-1) ?? null;
      },
      /** A frame carrying two change-detection pairs and two template-update pairs. */
      repeatedFrame(instance) {
        subscriber(CHANGE_DETECTION_START, null);
        subscriber(CHANGE_DETECTION_END, null);
        subscriber(CHANGE_DETECTION_START, null);
        subscriber(CHANGE_DETECTION_END, null);
        subscriber(PE.TemplateUpdateStart, instance);
        subscriber(PE.TemplateUpdateEnd, instance);
        subscriber(PE.TemplateUpdateStart, instance);
        subscriber(PE.TemplateUpdateEnd, instance);
        page.drain();
        return page.records().at(-1) ?? null;
      },
      /** Every `angular-ai:record` the page received, in arrival order. */
      records() {
        return dispatched.filter((event) => event.type === 'angular-ai:record');
      },
      reset() {
        recorder.reset();
      },
    };
    return body(page);
  } finally {
    try {
      globalThis.__ngRecorder?.reset?.();
    } catch (error) {
      /* a reset that throws must not mask the reading */
    }
    for (const key of Object.keys(saved)) {
      const name = key === 'recorder' ? '__ngRecorder' : key;
      globalThis[name] = saved[key];
    }
  }
}

/** The instance two passes must share to be the same key. */
const INSTANCE_A = { constructor: { name: 'Counter' } };

/** A signal graph with the ids and epochs the caller names. */
function signalGraph(epochs, ids = ['n0', 'n1']) {
  return {
    nodes: epochs.map((epoch, index) => ({
      id: ids[index],
      kind: index === 1 ? 'template' : 'signal',
      label: index === 1 ? 'app-counter' : 'count',
      epoch,
    })),
    edges: ids.length > 1 ? [{ consumer: 1, producer: 0 }] : [],
  };
}

/** The state a record's `stability` section answers, derived and never assumed. */
function stateOf(stability) {
  if (stability === null || stability === undefined) return 'idle';
  if (stability.absence !== null) return 'cannot-tell';
  if (stability.reading === null) return 'idle';
  return stability.reading.value === true ? 'stable' : 'unstable';
}

/** The settle reading with the distance from attach the page measured. */
function settleOf(stability) {
  const settle = stability.settle;
  if (settle === null || settle.state !== 'settled') {
    return { state: 'no-settle-observed' };
  }
  const since =
    typeof settle.at === 'number' && typeof stability.attachAt === 'number'
      ? settle.at - stability.attachAt
      : null;
  return { state: 'settled', at: settle.at, sinceAttachMs: since };
}

/** Whether the record answers an unstable-to-stable change *after* attach. */
function transitionOf(stability) {
  const settle = settleOf(stability);
  const produced =
    settle.state === 'settled' &&
    typeof settle.sinceAttachMs === 'number' &&
    settle.sinceAttachMs > 0;
  return {
    produced,
    answer: produced ? 'transition-observed' : 'no-transition-observed',
    settle,
  };
}

/** The four subjects the read is driven on, each a page shape and nothing else. */
const SUBJECTS = {
  'unstable-then-stable': {
    records: 'withToken',
    syncEmissions: [false],
    later: [true],
  },
  'stable-at-attach': {
    records: 'withToken',
    syncEmissions: [true],
    later: [],
  },
  'silent-stream': { records: 'withToken', syncEmissions: [], later: [] },
  'no-application-ref': {
    records: 'withoutToken',
    syncEmissions: [],
    later: [],
  },
};

/** One subject driven on one source: the section as the frame record carries it. */
function driveStability(source, name) {
  const subject = SUBJECTS[name];
  if (subject === undefined) fail(`no subject is named ${name}`);
  return bootAgent(source, subject, (page) => {
    const snapshot = page.snapshot();
    page.graph = signalGraph([1, 1]);
    const frame = page.frame(INSTANCE_A);
    for (const value of subject.later) page.emit(value);
    const afterEmissions = page.frame(INSTANCE_A);
    const stability =
      afterEmissions === null ? null : afterEmissions.detail.stability;
    if (stability === null || stability === undefined) {
      fail(
        `the "${name}" subject's frame record carries no \`stability\` section beside \`events\`, \`routerEvents\`, \`boundary\` and \`checks\``,
      );
    }
    const keys = Object.keys(afterEmissions.detail);
    const index = keys.indexOf('stability');
    if (index !== keys.indexOf('boundary') + 1 || index !== keys.length - 2) {
      fail(
        `the \`stability\` section sits at key ${index} of ${JSON.stringify(keys)} and must follow \`boundary\` and precede \`checks\``,
      );
    }
    return {
      attachAt: stability.attachAt,
      reachedBy: stability.reachedBy,
      absence: stability.absence,
      reading: stability.reading,
      settle: stability.settle,
      version: stability.version,
      coreVersion: stability.coreVersion,
      state: stateOf(stability),
      attachState: stateOf(frame.detail.stability),
      attachReading: clone(frame.detail.stability?.reading ?? null),
      transition: transitionOf(stability),
      getterReads: page.getterReads,
      subscriptions: page.subscribeCount,
      unsubscribes: page.unsubscribes,
      setProfilerCalls: page.setProfilerCalls,
      listeners: page.listeners,
      emitted: page.emitted,
      frameKeys: keys,
      snapshotStability:
        snapshot === null ? null : clone(snapshot.detail.stability ?? null),
      frameStability: clone(stability),
      records: page.records().length,
      resetRemoves: (() => {
        page.reset();
        page.graph = signalGraph([2, 2]);
        const afterReset = page.frame(INSTANCE_A);
        return {
          unsubscribes: page.unsubscribes,
          stability:
            afterReset === null ? null : clone(afterReset.detail.stability),
          state:
            afterReset === null ? null : stateOf(afterReset.detail.stability),
        };
      })(),
    };
  });
}

/** The repeated work a frame carries, read from the frame's own `events` list. */
function driveRepeats() {
  return bootAgent(AGENT().source, SUBJECTS['stable-at-attach'], (page) => {
    page.graph = signalGraph([1, 1]);
    const record = page.repeatedFrame(INSTANCE_A);
    if (record === null) fail('the repeated-work frame dispatched no record');
    const events = record.detail.events;
    const check = record.detail.checks[0];
    const pairs = (list, name) =>
      list.filter((entry) => entry.pair === name && entry.end === false).length;
    const nulls = (list, name) =>
      list.filter(
        (entry) => entry.pair === name && entry.componentName === null,
      ).length;
    return {
      frameEvents: clone(events),
      checkEvents: clone(check.events),
      checkName: check.componentName,
      templateUpdate: {
        pair: 'TemplateUpdate',
        starts: pairs(events, 'TemplateUpdate'),
        ends: events.filter(
          (entry) => entry.pair === 'TemplateUpdate' && entry.end === true,
        ).length,
        inOneCheckRow: check.events.filter(
          (value) => value === PE.TemplateUpdateStart,
        ).length,
        checkRowEvents: clone(check.events),
        componentNames: [
          ...new Set(
            events
              .filter((entry) => entry.pair === 'TemplateUpdate')
              .map((entry) => entry.componentName),
          ),
        ],
      },
      changeDetection: {
        pair: 'ChangeDetection',
        starts: pairs(events, 'ChangeDetection'),
        ends: events.filter(
          (entry) => entry.pair === 'ChangeDetection' && entry.end === true,
        ).length,
        nullComponentNames: nulls(events, 'ChangeDetection'),
        carriesNoInstance: nulls(events, 'ChangeDetection') === 4,
        inAnyCheckRow: record.detail.checks.some((candidate) =>
          candidate.events.includes(CHANGE_DETECTION_START),
        ),
      },
    };
  });
}

/** Every measurement the recording rests on, taken once. */
const MEASURED = once(async () => {
  const source = readFileSync(AGENT_PATH, 'utf8');
  const page = PAGE();
  return {
    reach: {
      walk: AGENT().walk,
      withToken: driveStability(source, 'unstable-then-stable'),
      withoutToken: driveStability(source, 'no-application-ref'),
    },
    subjects: {
      'unstable-then-stable': driveStability(source, 'unstable-then-stable'),
      'stable-at-attach': driveStability(source, 'stable-at-attach'),
      'silent-stream': driveStability(source, 'silent-stream'),
      'no-application-ref': driveStability(source, 'no-application-ref'),
    },
    currency: await CURRENCY(),
    repeats: driveRepeats(),
    page,
  };
});

// -------------------------------------------------------------- the anchors ----
//
// The lines M039, M040, M041 and M042 cite by number. Two merges of a two-line comment and
// three added lines paid for this section, so the ones above the section are unmoved; the
// three below it moved by one or two lines and are declared here rather than left to be
// rediscovered.

const ANCHORS = once(() => {
  const lines = AGENT().lines;
  const at = (needle) => soleLine(lines, needle, 'extension/agent-main.js');
  return {
    unmoved: [
      {
        anchor: 'var prevEpochs = new WeakMap();',
        at: at('var prevEpochs = new WeakMap();'),
        expected: 42,
      },
      {
        anchor: 'function onEvent(event, instance, eventFn) {',
        at: at('function onEvent(event, instance, eventFn) {'),
        expected: 573,
      },
      {
        anchor: 'prevEpochs.set(instance, next);',
        at: at('    prevEpochs.set(instance, next);'),
        expected: 1034,
      },
      {
        anchor: 'function closeCycle() {',
        at: at('function closeCycle() {'),
        expected: 1038,
      },
      {
        anchor:
          'function routerTokenFrom(element, getInjector, getPath, getProviders) {',
        at: at(
          'function routerTokenFrom(element, getInjector, getPath, getProviders) {',
        ),
        expected: 1750,
      },
      {
        anchor: 'prevEpochs = new WeakMap();',
        at: at('    prevEpochs = new WeakMap();'),
        expected: 1889,
      },
    ],
    moved: [
      {
        anchor: 'function installRouterEvents()',
        was: 1845,
        now: at('function installRouterEvents()'),
        why: 'the two-line comment above it became one line, which paid for the first `installStability()` call',
      },
      {
        anchor: 'function uninstallRouterEvents()',
        was: 1854,
        now: at('function uninstallRouterEvents()'),
        why: 'the second comment merge, which paid for the retry call site',
      },
      {
        anchor: 'function start()',
        was: 1864,
        now: at('function start()'),
        why: 'the two merges above it; `start()` hosts both `installStability()` calls',
      },
    ],
  };
});

// ------------------------------------------------------------ the recording ----

/** Assembles the recording from the derivations above. */
async function buildRecord() {
  const measured = await MEASURED();
  const agent = AGENT();
  const core = CORE();
  const page = measured.page;
  const subjects = measured.subjects;
  const reach = measured.reach;
  const currency = measured.currency;
  const repeats = measured.repeats;
  const transitionObserved = false; // no page is driven by this task
  const mechanism = subjects['unstable-then-stable'].transition;

  return {
    schema: 'm043-stability/v1',
    milestone: 'stability-explainer',
    task: 'T001',
    title:
      "The stability surface - the reach, the subscription's currency, the unstable subject and the record that carries them",
    question:
      'Can the page agent reach `ApplicationRef.isStable` the way it reaches `Router`, does one subscription taken through it stay current, which subject is unstable at attach, and can any inspected subject produce an unstable-to-stable change?',
    capturedAt: CAPTURED_AT,
    environment: {
      platform: process.platform,
      shell: 'cmd.exe',
      node: process.version,
    },
    commands: {
      check: CHECK_COMMAND,
      capture:
        'M043_CAPTURE=1 node --experimental-strip-types --test "scripts/stability-measure.test.mjs"',
      reproduce:
        'node --experimental-strip-types --test "scripts/stability-measure.test.mjs"',
    },
    teardown: {
      ports: [4507, 3000, 4222, 9333, 9334],
      started: [],
      stopped: [],
      note: 'This task starts no server, binds no port and opens no browser: the reach and the record are driven by booting the shipped agent in Node, and the currency reading drives the installed 22.2.2 tracker. Nothing was started, so there was nothing to stop.',
    },
    reach: {
      question:
        'Can the agent reach `ApplicationRef.isStable` through the walk it already performs for `Router`, and what does a page without it still say?',
      finding:
        'Yes, through the same five steps and no new tap: `ng.getInjector(host)`, `ɵgetInjectorResolutionPath`, `ɵgetInjectorProviders`, the provider record whose `token.name` is `ApplicationRef` (the class the runtime provides, whose name the token yields), then `injector.get(token)` on the entry that carried the record. On the measured page the walk finds the token in the environment injector, exactly where M041 measured `Router`; the agent reads the getter once and subscribes once. A page whose records carry no `ApplicationRef` record answers `reachedBy: null` with the named absence `no-stability-observable` and the state `cannot-tell` - never `unstable`, because nothing was read rather than something was read and said "not stable".',
      token: {
        name: 'ApplicationRef',
        declaredAt: `extension/agent-main.js:${agent.tokenLine}`,
        isTheRuntimeClass: 'class ApplicationRef {',
        classAt: core.classAt,
        namedBy: agent.namesTheTokenAt,
      },
      walk: reach.walk,
      subjects: {
        withToken: {
          providerRecords: 2,
          entryIndex: 1,
          reachedBy: reach.withToken.reachedBy,
          absence: reach.withToken.absence,
          attachAt: typeof reach.withToken.attachAt,
          state: reach.withToken.state,
          reading: reach.withToken.reading,
          getterReads: reach.withToken.getterReads,
          subscriptions: reach.withToken.subscriptions,
          resolveAnswered: 'the ApplicationRef instance the entry answered',
        },
        withoutToken: {
          providerRecords: 2,
          entryIndex: null,
          reachedBy: reach.withoutToken.reachedBy,
          absence: reach.withoutToken.absence,
          attachAt: reach.withoutToken.attachAt,
          state: reach.withoutToken.state,
          getterReads: reach.withoutToken.getterReads,
          subscriptions: reach.withoutToken.subscriptions,
          resolveAnswered: null,
        },
      },
      aPageWithout:
        'A page whose provider records carry no ApplicationRef still records the section, answering `reachedBy: null`, `absence: "no-stability-observable"`, `attachAt: null`, `reading: null` and `settle: {"state":"no-settle-observed"}`. It never claims instability from a read it could not take.',
      installedOnce: {
        setProfilerCalls: reach.withToken.setProfilerCalls,
        profilerClearedWithNull: agent.source.includes('ɵsetProfiler(null)'),
        armedAt: agent.armedAt,
        armedInsideTheProfilerCallback: agent.armedInsideTheProfilerCallback,
        onEventRange: agent.onEventRange,
      },
    },
    observable: {
      question:
        'Does one subscription taken through the `isStable` getter stay current through a later `add()`/`remove()` flip, and what does the stream underneath carry?',
      finding:
        'One subscription is enough. The getter builds a fresh pipe on every access, but the observable it pipes is `hasPendingTasksObservable`, which answers `this.pendingTask` - a `BehaviorSubject` - so a subscriber is handed the current value at subscribe and every later `next()` reaches the same subscription. Driven against the installed 22.2.2 tracker, one subscription read `true` at subscribe, `false` when the first task was added, stayed `false` through a second add and a first remove, and read `true` again when the last task was removed; a second flip reproduced the same sequence. The agent therefore subscribes once at attach and never re-reads the getter per record.',
      getter: {
        at: core.getter.at,
        source: core.getter.source,
        builds:
          'a fresh `map(pending => !pending)` pipe per access, over `hasPendingTasksObservable`',
        freshPipePerAccess: true,
        streamUnderIt:
          'this.pendingTask, a BehaviorSubject<boolean> that means hasPendingTasks',
        streamAt: core.tracker.observableAt,
        subjectAt: core.tracker.subjectAt,
      },
      currency: {
        oneSubscription: true,
        atSubscribe: currency.atSubscribe,
        afterFirstAdd: currency.afterFirstAdd,
        afterSecondAdd: currency.afterSecondAdd,
        afterOneRemoved: currency.afterOneRemoved,
        afterAllRemoved: currency.afterAllRemoved,
        afterSecondFlip: currency.afterSecondFlip,
        sequence: currency.sequence,
        flipsAcross: currency.flipsAcross,
        staysCurrent: currency.staysCurrent,
        subscriptionsTaken: currency.subscriptionsTaken,
        readingsInvertedBy:
          'map(pending => !pending), so an emission is the stability bit',
      },
      pendingTasks: {
        trackerAt: core.tracker.at,
        idsAt: core.tracker.setAt,
        idsKind: currency.idsKind,
        holds: 'number task ids and nothing else',
        addAt: core.tracker.addAt,
        addReturns: `${currency.taskIdType} (a monotone id)`,
        hasAt: core.tracker.hasAt,
        removeAt: core.tracker.removeAt,
        emitsAt: `${core.tracker.hasPendingTasksAt} (the boolean read) and ${core.tracker.subjectAt} (the stream)`,
        idsAfterSubscribe: currency.idsAfterSubscribe,
        noPerItemOrder:
          'The tracker holds ids in a `Set<number>`: insertion order is the only order it has, and it records no per-item field at all - no component, no label, no reason - so a surface can say a task is outstanding and cannot say which work it belongs to.',
      },
      absences: [
        '`isStable` carries no reason: the getter is one `pipe(map(pending => !pending))` over a boolean, so an unstable reading says "a task is outstanding" and nothing about what it is.',
        '`PendingTasksInternal.pendingTasks` is a `Set<number>` of ids: membership is readable by id (`has(taskId)`), and no id maps back to a component, a route or a resource.',
        'The set carries no per-item order and no per-item record: `add()` returns a counter, `remove(taskId)` takes it back, and the only ordering available is the Set insertion order of bare numbers.',
      ],
    },
    page: {
      question:
        'Which inspected subject is unstable while the read is attached, and why is it unstable for its lifetime?',
      finding:
        "/resource-states is SC1's positive case and it is unstable at attach, for the page's lifetime. The fixture's `LoadingResource` is given a loader that returns `new Promise<never>(() => {})`, a promise nothing resolves; the resource takes the page's `PendingTasks`, `add()`s a task when the load starts, and removes it only in the `finally` of the load effect or when a load is aborted. A promise that never settles returns neither way, so the task stays outstanding, the tracker's stream keeps saying \"pending\", and `isStable` says `false` for as long as the page lives. No fixture change is needed: the state is installed in `spikes/ng222-app/src/app/resource-states.ts` already.",
      route: '/resource-states',
      file: page.file,
      componentAt: page.componentAt,
      loader: {
        neverSettlesAt: page.neverSettlesAt,
        neverSettles: page.neverSettles,
        loadingResourceAt: page.loadingResourceAt,
        loaderAt: page.loaderAt,
        settles: false,
      },
      coupling: page.coupling,
      state: page.state,
      stateFor: page.stateFor,
      reading: {
        value: false,
        means: 'not stable: the tracker holds an outstanding task',
        carriesNoReason: true,
      },
      reasonAvailable: page.reasonAvailable,
    },
    transition: {
      question:
        'Is an unstable-to-stable transition producible while the read is attached, and if it is not, what would produce one?',
      finding:
        "No inspected subject produces an unstable-to-stable change. `/resource-states` is unstable from attach to teardown and cannot end its task, and it is the only page-shaped subject this checkout carries, so this recording answers `no-transition-observed` rather than leaving the reader to infer a transition from a page that was already stable at attach. The mechanism itself is measured: the installed tracker took one subscription and reported `true` at subscribe, `false` across two adds, and `true` again after the last remove, so a page that ended its last task while the read was attached would produce the change. SC2's positive half therefore rests on a drive that starts and finishes a task after attach, and this task does not claim it.",
      answer: 'no-transition-observed',
      producedOnAnInspectedPage: false,
      mechanism: {
        measured: true,
        produced: mechanism.produced,
        settle: mechanism.settle,
        sequence: currency.sequence,
        oneSubscription: true,
        wouldEmit: 'true (stable) as the last outstanding task is removed',
        sourceAt: `${core.tracker.subjectAt}, ${core.tracker.removeAt}`,
      },
      wouldNeed: [
        "A page whose last outstanding task is removed while the read is attached: `/resource-states` cannot, because its loader returns a promise nothing resolves and the removal runs only in the load effect's `finally` or on an abort.",
        'Or a subject that starts a task after attach and finishes it: a router navigation on a stable route, which the agent already records as `routerEvents`, adds and releases a pending task around the navigation.',
        "Or a fixture change to the loader, which this task's acceptance criteria forbid.",
      ],
      alreadyStableAtAttach: {
        subject: 'stable-at-attach',
        state: subjects['stable-at-attach'].state,
        settle: subjects['stable-at-attach'].transition.settle,
        transition: subjects['stable-at-attach'].transition.answer,
        note: 'A page already stable at attach settles *at* `attachAt`, not after it: the emission a BehaviorSubject hands a new subscriber synchronously is read at attach. A settle later than attach is therefore the only shape that can carry a transition, and this one carries none.',
      },
      subjects: Object.fromEntries(
        Object.entries(subjects).map(([name, entry]) => [
          name,
          {
            state: entry.state,
            reading: entry.reading,
            settle: entry.transition.settle,
            answer: entry.transition.answer,
          },
        ]),
      ),
    },
    repeats: {
      question:
        'Does one frame carry a second `TemplateUpdate` start/end pair inside one `checks` row, and a second `ChangeDetection` pair carrying `componentName: null`?',
      finding:
        "Both, re-derived from the frame's own `events` list at this head. A driven frame carrying two template-update pairs records a `checks` row holding four values - start, end, start, end - so the row carries two pairs rather than one, and the frame-level list carries both. The same frame carries two `ChangeDetection` pairs, and every one of their four entries records `componentName: null`: the profiler passes no instance for that pair at all, and the entry records the absence rather than borrowing a name.",
      frameKeys: repeats.frameEvents.map((entry) => entry.pair),
      templateUpdate: repeats.templateUpdate,
      changeDetection: repeats.changeDetection,
      shape:
        "one entry per recorded value: { type, pair, end, at, componentName } - `at` is the page's own reading at receipt",
    },
    record: {
      question:
        'Does the agent carry the read on the record it already dispatches, armed from the install path and removed by `reset()`?',
      finding:
        "Yes. A `stability` section sits beside `events`, `routerEvents`, `boundary` and `checks` in both the frame record and the initial snapshot, in the same position in each: after `boundary`, before `checks`. It is armed from the install path's own answer - `start()` calls it beside `installRouterEvents()`, never from inside the profiler callback - and `reset()` removes the subscription and clears every field it holds, so a second install starts from a page this file has never read. Every field is a number, a boolean, a string the page published, or `null`; nothing is inferred and no clock is read beyond the page's own `performance.now()`.",
      field: 'stability',
      sectionAt: agent.sectionAt,
      fieldAt: agent.fieldAt,
      keys: agent.keys,
      frameFieldAt: agent.frameFieldAt,
      snapshotFieldAt: agent.snapshotFieldAt,
      position: 'after `boundary`, before `checks`, in both records',
      armedAt: agent.armedAt,
      removedAt: agent.removedAt,
      frameKeys: reach.withToken.frameKeys,
      readsTheGetterAt: agent.readsTheGetterAt,
      recordsTheEmissionAt: agent.recordsTheEmissionAt,
      settlesAt: agent.settlesAt,
      version: agent.version,
      versionAt: agent.versionAt,
      coreVersion:
        "the page's own `ng.VERSION.full`, `null` where it reports none",
      frame: reach.withToken.frameStability,
      snapshot: reach.withToken.snapshotStability,
      afterReset: reach.withToken.resetRemoves.stability,
      afterResetState: reach.withToken.resetRemoves.state,
      unsubscribedOnReset: reach.withToken.resetRemoves.unsubscribes,
      settledFrame: subjects['unstable-then-stable'].frameStability,
      silentFrame: subjects['silent-stream'].frameStability,
      absentFrame: subjects['no-application-ref'].frameStability,
      anchors: ANCHORS(),
      profilerOnce: {
        setProfilerCalls: reach.withToken.setProfilerCalls,
        clearedWithNull: agent.source.includes('ɵsetProfiler(null)'),
        note: 'The profiler is installed once and `ɵsetProfiler(null)` is never called, so a second install adds its own subscriber rather than removing every callback on the page.',
      },
    },
    absences: [
      '`isStable` carries no reason (`' +
        core.getter.at +
        '`): the getter is a boolean map, so an unstable reading names no task.',
      '`PendingTasksInternal.pendingTasks` is a `Set<number>` (`' +
        core.tracker.setAt +
        '`): ids only, so no task maps back to a component, a route or a resource.',
      'The tracker carries no per-item order (`' +
        core.tracker.addAt +
        '` to `' +
        core.tracker.removeAt +
        '`): `add()` answers a counter and `remove(taskId)` takes it back; insertion order of bare numbers is the only order there is.',
      'No page reports the Angular version it runs: `coreVersion` is `ng.VERSION.full` where the page publishes it and `null` where it does not, and the surface declares `22.2.2` as the constant it works against.',
      'The transition is a named absence, not a reading: `no-transition-observed`, with the mechanism measured and the drive it would need named.',
    ],
    doesNotSettle: [
      "What a live `/resource-states` emits: this task takes no page. The instability is read from the fixture's own loader and the installed resource class, quoted with both anchors, and the state the record answers for it is derived from that reading.",
      'Which task id `/resource-states` holds open: the tracker keeps ids only, so the coupling is provable (the resource adds and removes its own id) and the id itself is not page-observable evidence.',
      'Whether a later 22.x keeps `hasPendingTasksObservable` a `BehaviorSubject`: the currency reading is the installed 22.2.2 chunk, so a point release that answered a cold observable per access would make a single subscription insufficient. The recording names the chunk it measured.',
      'What the read answers on a page that destroys its application: `destroyed` makes the observable answer `false` and complete, which this task does not drive.',
    ],
  };
}

// ------------------------------------------------------------- the record ----

const PATHS = [
  'reach',
  'observable',
  'page',
  'transition',
  'repeats',
  'record',
  'absences',
  'doesNotSettle',
];

function at(root, path) {
  return path
    .split('.')
    .reduce(
      (node, key) =>
        node === null || node === undefined ? undefined : node[key],
      root,
    );
}

function summarise(value) {
  const text = JSON.stringify(value);
  return text.length > 240 ? `${text.slice(0, 240)}...` : text;
}

/** Every recorded path that disagrees with the derivation, each with both readings. */
function mismatches(recorded, derived) {
  const found = [];
  for (const path of PATHS) {
    if (canonical(at(recorded, path)) === canonical(at(derived, path)))
      continue;
    found.push({
      path,
      recorded: at(recorded, path),
      derived: at(derived, path),
    });
  }
  return found;
}

function describeMismatches(found) {
  return found
    .map(
      (entry) =>
        `${entry.path}: recorded ${summarise(entry.recorded)} / derived ${summarise(entry.derived)}`,
    )
    .join('; ');
}

function loadRecord(path = RECORD_PATH) {
  requireFile(path, 'the measurement has not been recorded');
  return JSON.parse(readFileSync(path, 'utf8'));
}

// -------------------------------------------------------------- the mutants ----
//
// A pin that cannot fail proves nothing, so each reading is contradicted by a real
// mutant of the shipped source: a thrown-away transition, a fabricated settle time,
// instability inferred from silence, and a read armed from inside the profiler
// callback. Each mutant must redden the assertion that carries its reading, and each
// one is applied to a unique anchor so a moved anchor fails loudly.

const MUTANTS = [
  {
    name: 'a thrown-away transition',
    anchor: "stabilitySettle = { state: 'settled', at: at };",
    replacement: '/* the settle reading is dropped */',
    occurrences: 1,
    subject: 'unstable-then-stable',
    reddens: "settle.state must be 'settled'",
  },
  {
    name: 'a fabricated settle time',
    anchor: "stabilitySettle = { state: 'settled', at: at };",
    replacement:
      "stabilitySettle = { state: 'settled', at: stabilityAttachAt };",
    occurrences: 1,
    subject: 'unstable-then-stable',
    reddens: 'settle.at must be the emission the `true` arrived on',
  },
  {
    name: 'instability inferred from silence',
    anchor: 'reading: stabilityReading,',
    replacement: 'reading: stabilityReading || { value: false, at: null },',
    occurrences: 1,
    subject: 'silent-stream',
    reddens: "a silent stream must answer 'idle', never 'unstable'",
  },
  {
    name: 'a read armed from inside the profiler callback',
    anchor: '    installStability();',
    replacement: '    /* the install path does not arm the read */',
    occurrences: 2,
    subject: 'stable-at-attach',
    reddens: 'the initial snapshot must carry the attach reading',
  },
];

/** One source with one mutant applied, and the anchors that had to be there. */
function mutated(source, mutant) {
  const occurrences = source.split(mutant.anchor).length - 1;
  if (occurrences !== mutant.occurrences) {
    fail(
      `the "${mutant.name}" mutant's anchor appears ${occurrences} time(s) in extension/agent-main.js, expected ${mutant.occurrences} - restate the mutant here instead of deleting it`,
    );
  }
  return source.split(mutant.anchor).join(mutant.replacement);
}

/** Whether one driven subject still holds its reading on this source. */
function holds(source, mutant) {
  const result = driveStability(source, mutant.subject);
  if (mutant.name.startsWith('a read armed')) {
    return (
      result.snapshotStability !== null &&
      typeof result.snapshotStability.attachAt === 'number'
    );
  }
  if (mutant.subject === 'silent-stream') {
    return result.state === 'idle' && result.reading === null;
  }
  const settle = result.settle;
  return (
    settle.state === 'settled' &&
    typeof settle.at === 'number' &&
    settle.at > result.attachAt
  );
}

// ---------------------------------------------------------------- the checks ----

describe('the reach, the currency, the page and the record', () => {
  it("reaches `ApplicationRef` through the agent's own five-step walk, and answers a named absence where it cannot", async () => {
    const measured = await MEASURED();
    const withToken = measured.reach.withToken;
    assert.equal(
      withToken.reachedBy,
      'ApplicationRef',
      `the walk must resolve the token by name and record it; it recorded ${JSON.stringify(withToken.reachedBy)}`,
    );
    assert.equal(
      withToken.absence,
      null,
      'a page that answered an observable carries no absence',
    );
    assert.equal(
      withToken.getterReads,
      1,
      'the getter is read once at attach, not per record',
    );
    assert.equal(
      withToken.subscriptions,
      1,
      'one subscription is taken at attach and no second one later',
    );
    assert.equal(
      withToken.attachState,
      'unstable',
      `the driven subject emits \`false\` at attach, so the state read at attach is unstable; it read ${withToken.attachState}`,
    );
    assert.equal(
      withToken.state,
      'stable',
      'and the `true` the page emitted afterwards is the state the record then carries',
    );
    const withoutToken = measured.reach.withoutToken;
    assert.equal(
      withoutToken.reachedBy,
      null,
      'a page whose records carry no ApplicationRef records no token',
    );
    assert.equal(
      withoutToken.absence,
      'no-stability-observable',
      `a page with no observable must name the absence; it named ${JSON.stringify(withoutToken.absence)}`,
    );
    assert.equal(
      withoutToken.state,
      'cannot-tell',
      `a page with no observable answers cannot-tell, never unstable; it answered ${withoutToken.state}`,
    );
    assert.equal(
      withoutToken.attachAt,
      null,
      'and it records no attach reading it never took',
    );
    for (const step of measured.reach.walk) {
      assert.equal(
        typeof step.at,
        'string',
        `the "${step.step}" step must be cited in the agent's own source`,
      );
    }
    assert.equal(
      withoutToken.setProfilerCalls,
      1,
      'the profiler is installed once',
    );
  });

  it("measures one subscription's currency against the installed tracker", async () => {
    const currency = await MEASURED().then((measured) => measured.currency);
    assert.deepEqual(
      currency.atSubscribe,
      [true],
      'a BehaviorSubject hands a new subscriber its current value: stable, with no task outstanding',
    );
    assert.deepEqual(
      currency.afterFirstAdd,
      [true, false],
      'the first add flips the same subscription to unstable',
    );
    assert.deepEqual(
      currency.afterSecondAdd,
      [true, false],
      'a second add does not re-emit: the tracker only announces the edge',
    );
    assert.deepEqual(
      currency.afterOneRemoved,
      [true, false],
      'and removing one of two outstanding tasks keeps it unstable',
    );
    assert.deepEqual(
      currency.afterAllRemoved,
      [true, false, true],
      'the last remove flips it back to stable on the same subscription',
    );
    assert.deepEqual(
      currency.afterSecondFlip,
      [true, false, true, false, true],
      'a second flip reaches the same subscription, so one subscription stays current',
    );
    assert.equal(currency.idsKind, 'Set', 'the tracker holds a Set');
    assert.equal(
      typeof currency.taskIds[0],
      'number',
      'and the ids in it are numbers, not records',
    );
  });

  it('records `/resource-states` as unstable for its lifetime, and names the transition absence', async () => {
    const measured = await MEASURED();
    const derived = await buildRecord();
    const page = measured.page;
    assert.equal(page.state, 'unstable', 'the subject is unstable');
    assert.equal(
      page.stateFor,
      "the page's lifetime",
      'for its whole lifetime',
    );
    assert.equal(
      page.neverSettles,
      'new Promise<never>(() => {})',
      'the loader returns a promise nothing resolves',
    );
    assert.equal(
      page.neverSettlesAt.endsWith(':61'),
      true,
      `the never-settling promise must be cited where it is declared; it is cited at ${page.neverSettlesAt}`,
    );
    assert.equal(
      page.coupling.addsATaskAt.endsWith(':404'),
      true,
      `the load must add its pending task where M036 measured it; it is cited at ${page.coupling.addsATaskAt}`,
    );
    assert.equal(
      derived.transition.answer,
      'no-transition-observed',
      `no inspected subject produced an unstable-to-stable change, so the answer is the named absence; it answered ${derived.transition.answer}`,
    );
    assert.equal(
      measured.subjects['stable-at-attach'].transition.produced,
      false,
      'a page already stable at attach produces no transition, and this reading is not claimed as one',
    );
    assert.equal(
      measured.subjects['stable-at-attach'].settle.at,
      measured.subjects['stable-at-attach'].attachAt,
      'a page already stable at attach settles at attach, not after it',
    );
    assert.equal(
      measured.subjects['unstable-then-stable'].transition.produced,
      true,
      'the mechanism does produce the change when the last task is released while the read is attached',
    );
    assert.equal(
      measured.subjects['silent-stream'].state,
      'idle',
      'a stream that never emitted is idle, never unstable',
    );
  });

  it("re-derives the repeated work from the frame's own `events` list", async () => {
    const repeats = (await MEASURED()).repeats;
    assert.equal(
      repeats.templateUpdate.inOneCheckRow,
      2,
      `one checks row must carry two template-update starts; it carried ${repeats.templateUpdate.inOneCheckRow}`,
    );
    assert.equal(
      repeats.templateUpdate.starts,
      2,
      'and the frame-level list carries both pairs',
    );
    assert.deepEqual(
      repeats.templateUpdate.checkRowEvents,
      [2, 3, 2, 3],
      'the row is start, end, start, end - two pairs, in arrival order',
    );
    assert.equal(
      repeats.changeDetection.starts,
      2,
      'the same frame carries two change-detection pairs',
    );
    assert.equal(
      repeats.changeDetection.nullComponentNames,
      4,
      `all four change-detection entries record no component; ${repeats.changeDetection.nullComponentNames} did`,
    );
    assert.equal(
      repeats.changeDetection.inAnyCheckRow,
      false,
      'and none of them reaches a checks row, because the profiler passed no instance',
    );
  });

  it('carries the section on both records, armed from the install path and removed by reset()', async () => {
    const measured = await MEASURED();
    const agent = AGENT();
    const section = measured.reach.withToken.frameStability;
    assert.deepEqual(
      Object.keys(section),
      [
        'reachedBy',
        'absence',
        'attachAt',
        'reading',
        'settle',
        'version',
        'coreVersion',
      ],
      'the section is the seven fields the interface contract names, in that order',
    );
    assert.deepEqual(
      agent.keys,
      Object.keys(section),
      'and the agent builds exactly those fields',
    );
    assert.deepEqual(
      Object.keys(measured.reach.withToken.snapshotStability),
      Object.keys(section),
      'the initial snapshot carries the same section and not a different shape',
    );
    assert.equal(
      agent.armedInsideTheProfilerCallback,
      false,
      `the read is armed at ${agent.armedAt}, outside the profiler callback ${agent.onEventRange}`,
    );
    assert.equal(
      typeof measured.reach.withToken.snapshotStability.attachAt,
      'number',
      'the snapshot carries the attach reading, so the read was armed before any frame',
    );
    assert.equal(
      measured.reach.withToken.resetRemoves.unsubscribes,
      1,
      'reset() unsubscribes the observable exactly once',
    );
    assert.equal(
      measured.reach.withToken.resetRemoves.stability.absence,
      'no-stability-observable',
      'and clears the reading with it, so a second install starts from a page this file never read',
    );
  });

  it("holds every anchor this milestone's earlier recordings cite, and declares the three that moved", () => {
    const anchors = ANCHORS();
    for (const entry of anchors.unmoved) {
      assert.equal(
        entry.at,
        entry.expected,
        `${JSON.stringify(entry.anchor)} was cited at extension/agent-main.js:${entry.expected} and now sits at ${entry.at}`,
      );
    }
    assert.deepEqual(
      anchors.moved.map((entry) => entry.anchor),
      [
        'function installRouterEvents()',
        'function uninstallRouterEvents()',
        'function start()',
      ],
      'exactly the three anchors below the stability section moved, and each one is declared with its previous line',
    );
  });

  it('refuses an absent recording instead of skipping', () => {
    assert.throws(
      () => loadRecord(join(ROOT, 'research', 'raw', 'm043-absent.json')),
      /m043-absent\.json is missing - the measurement has not been recorded/,
      'a missing recording must fail naming the file it wanted',
    );
  });

  it('matches research/raw/m043-stability.json with what it derives', async () => {
    const derived = await buildRecord();
    let recorded;
    try {
      recorded = loadRecord();
    } catch (error) {
      if (process.env.M043_CAPTURE === '1') {
        writeFileSync(RECORD_PATH, canonical(derived));
        return;
      }
      throw error;
    }
    const found = mismatches(recorded, derived);
    if (found.length > 0 && process.env.M043_CAPTURE === '1') {
      writeFileSync(RECORD_PATH, canonical(derived));
      return;
    }
    assert.deepEqual(
      found,
      [],
      `research/raw/m043-stability.json disagrees with this file's derivation; the fields that differ are: ${describeMismatches(found)}`,
    );
    assert.equal(
      recorded.schema,
      'm043-stability/v1',
      'and the recording declares its own schema',
    );
    assert.equal(
      recorded.commands.check,
      CHECK_COMMAND,
      "the recording pins this task's Verify line verbatim",
    );
  });
});

describe('the readings are non-vacuous: a real mutant reddens each one', () => {
  const source = () => readFileSync(AGENT_PATH, 'utf8');

  it('passes every reading on the untouched source first', () => {
    for (const mutant of MUTANTS) {
      assert.equal(
        holds(source(), mutant),
        true,
        `the untouched source must hold the "${mutant.name}" reading before the mutant is applied`,
      );
    }
  });

  for (const mutant of MUTANTS) {
    it(`reddens when ${mutant.name}`, () => {
      const clean = holds(source(), mutant);
      assert.equal(
        clean,
        true,
        'the reading must hold before the mutant is applied',
      );
      const bitten = holds(mutated(source(), mutant), mutant);
      assert.equal(
        bitten,
        false,
        `the "${mutant.name}" mutant must redden ${mutant.reddens}, and the reading still held - the pin no longer measures what it quotes`,
      );
    });
  }

  it('names every reading each mutant contradicts', () => {
    for (const mutant of MUTANTS) {
      strings(
        mutant,
        ['name', 'anchor', 'replacement', 'subject', 'reddens'],
        'mutant',
      );
    }
  });
});
