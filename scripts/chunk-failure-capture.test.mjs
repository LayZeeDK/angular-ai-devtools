// @ts-check
// Run: node --test scripts/chunk-failure-capture.test.mjs
// Armed (the only writer this milestone has):
//   M064_CAPTURE=1 node --test scripts/chunk-failure-capture.test.mjs
// On Windows, where the shell is cmd.exe:
//   set "M064_CAPTURE=1"&& node --test scripts/chunk-failure-capture.test.mjs
//
// M064 T005 is the milestone's verdict on its verification target: the Insurance Portal. The question
// is narrow on purpose — can a lazily loaded route's chunk be made to fail on that app with no
// page-side edit, and what does the panel surface render when it does? — and the record this suite
// writes, `research/raw/m064-portal-capture.json`, is what was measured, not what was hoped for.
//
// What the capture does, and nothing else:
//
//   serve     the portal through control-angular-dev-app (`up --target portal --json`, or `info
//             --json` when this checkout already has the flow up). The portal is a checkout of its own
//             repository, outside this one, and its own `up` is the only thing that starts it.
//   browser   a control-ai-browsers instance (`up chrome-beta-nano --json`, which answers
//             `alreadyRunning` when a session already holds it — not a blocker), driven only through
//             playwright-cli as that skill documents, on the session `up`/`info` report.
//   discover  load `/home`, then navigate to `/contract` with no interception and record the module
//             requests that navigation added. That URL — the route's emitted lazy chunk — is what the
//             arms fail; it is discovered rather than typed, so a rebuilt portal moves it here.
//   arm one   a fresh document at `/home`, the chunk request aborted through `page.route` at the
//             browser (`net::ERR_FAILED`), the router asked to activate `/contract`, then the page,
//             the router and the console read back.
//   arm two   the same, with the chunk fulfilled as a 404 so the same failure carries a response
//             status. Two arms because the record's states turn on exactly that difference: a request
//             that produced no status is never written as one that did.
//
// The instrument is the browser's own request interception: `page.route` is Playwright's routing over
// CDP, nothing is injected into, patched in or read from the page's own scripts, and no request is
// made to learn what the failed one said. The one thing the capture reads from the app's files is the
// served initial chunk's own line, `get`ting it once from the dev server to show what specifier the
// compiled route closure passes to `import()`.
//
// What the record states about the surface is the join's answer, derived and not typed: the record
// module is loaded in a bare `node:vm` context and asked what it answers for the record the portal
// carries — which the capture measured as absent (`window.angularAiImportFailure` is `undefined` and
// no `importAttempts` exists) — and for an empty one. Both are `cannot-tell`; neither names an import,
// a route path, a status, a hash or a drift, because nothing was given it.
//
// Read-only by default. A default run writes nothing: it reads the record, re-derives every fact this
// head can derive without a browser (the join's answers, the manifest scan, the extension module, the
// portal route source when the checkpoint is present) and the last test hashes the record before and
// after the run to prove the bytes never moved. Only `M064_CAPTURE=1` runs the capture above, and an
// armed run writes only when a byte moved, so two armed runs in a row are byte-identical.
//
// When the portal or the browser cannot be started in a session at all, the armed run records that
// as the measurement: the exact command, its output and the reason, with `verdict.taken` false and no
// arm facts at all. The read-only run refuses such a record rather than passing on it: a milestone
// whose verification target was not measured is not a milestone whose verify is green.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RECORD_REL = 'research/raw/m064-portal-capture.json';
const RECORD_PATH = join(ROOT, ...RECORD_REL.split('/'));

/** The one switch the writer is behind. Anything else is a read. */
const ARMED = process.env.M064_CAPTURE === '1';

const SCHEMA = 'm064-portal-capture/v1';
const MILESTONE = 'M064';
const TASK = 'T005';
const TITLE = 'Measure the failure on the portal, and record what it showed';
const QUESTION =
  "can a lazily loaded route's chunk be made to fail on the Insurance Portal without a page-side edit, and what does the panel surface render when it does?";

const CHECK_COMMAND = 'node --test scripts/chunk-failure-capture.test.mjs';
const ARMED_COMMAND = `M064_CAPTURE=1 ${CHECK_COMMAND}`;
const ARMED_COMMAND_WINDOWS = `set "M064_CAPTURE=1"&& ${CHECK_COMMAND}`;

// The two skills the milestone's verification target is reached through, and nothing else.
const CONTROL_DEV_APP =
  '.commandcode/skills/control-angular-dev-app/scripts/control.mjs';
const CONTROL_BROWSERS =
  '.commandcode/skills/control-ai-browsers/scripts/control.mjs';
const BROWSER_INSTANCE = 'chrome-beta-nano';

// This milestone's own modules: the record's writer and the join the surface renders.
const RECORD_MODULE = 'extension/import-failure.js';
const JOIN_MODULE = 'extension/chunk-failure.js';
const MANIFEST = 'extension/manifest.json';

// The portal checkout, its route table and the route the capture tries. The route table is the only
// file of that checkout this record cites, and it is resolved when the checkout is present.
const PORTAL_DIR =
  'D:/projects/github/LayZeeDK/HaasStefan__ng-journal-insurance-portal-ai-devtools';
const PORTAL_ROUTES = `${PORTAL_DIR}/apps/insurance-portal/src/app/app.routes.ts`;
const ROUTE_TRIED = 'contract';
const ROUTE_URL = '/contract';
const HOME_URL = '/home';

// The probe sources the capture hands to playwright-cli land here: git-ignored `tmp/`, never the tree.
const PROBE_DIR = join(ROOT, 'tmp', 'm064-capture');

// ---------------------------------------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------------------------------------

/** The sha256 of a file's bytes, or null when it is not there. @param {string} path */
function sha256Of(path) {
  if (!existsSync(path)) return null;
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

/** The record as this head carries it. @returns {any} */
function readRecord() {
  return JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
}

/** The record exactly as a capture would serialize it — one writing rule for armed and unarmed. */
function serialized(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/** How many times a needle occurs in a file's text; -1 when the file is not there. */
function countIn(path, needle) {
  if (!existsSync(path)) return -1;
  return readFileSync(path, 'utf8').split(needle).length - 1;
}

/**
 * A line this record quotes, re-resolved by reading the file it names and searching that file for the
 * exact line — never by trusting the number beside it. `absent` is the honest answer for a file this
 * checkout does not carry (the portal is another repository).
 * @param {{file: string, text: string}} citation
 */
function resolveLine(citation) {
  const path = citation.file.startsWith('D:')
    ? citation.file
    : join(ROOT, ...citation.file.split('/'));
  if (!existsSync(path)) return { resolved: false, reason: 'file-absent' };
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  const wanted = citation.text.trim();
  const found = lines.some((line) => line.trim() === wanted);
  return { resolved: found, reason: found ? null : 'line-absent' };
}

/**
 * A value a `node:vm` context handed back, as this realm's own object. The join runs in a bare
 * context on purpose, so its answers have that context's prototypes and comparing them directly
 * with a literal would compare realms rather than values.
 * @param {any} value
 */
function local(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

/**
 * One of this milestone's modules, run in a bare `node:vm` context with nothing in it and its
 * namespace read back: the join is a pure function of the records it is handed, which is why its
 * answer for the portal's record can be derived on every run rather than trusted in the file.
 * @param {string} file
 * @param {string} [globalName]
 * @returns {any}
 */
function loadModule(file, globalName = 'angularAiChunkFailure') {
  const context = vm.createContext({});
  vm.runInContext(
    readFileSync(join(ROOT, ...file.split('/')), 'utf8'),
    context,
  );
  const namespace = context[globalName];
  assert.ok(namespace, `${file} publishes ${globalName}`);
  return namespace;
}

// ---------------------------------------------------------------------------------------------
// the probe sources the armed capture runs — page driving only, no page-side edit
// ---------------------------------------------------------------------------------------------

/**
 * The navigation every probe uses. `window.ng` is the app's own dev-build API; `ɵgetRouterInstance`
 * and `ɵnavigateByUrl` are read-only unless the route they activate fails, which is the measurement.
 * The rejected promise is caught here so its type and message are the probe's return value.
 */
const NAVIGATE = `
    const ng = window.ng;
    const root = document.querySelector('[ng-version]');
    const router = ng.ɵgetRouterInstance(ng.getInjector(root));
    try {
      const result = await ng.ɵnavigateByUrl(router, routeUrl);
      return { settled: 'resolved', result: Boolean(result) };
    } catch (error) {
      return {
        settled: 'rejected',
        name: error && error.name,
        message: error && error.message,
      };
    }`;

/**
 * What the page, the router and the extension's own globals say after a navigation attempt. Every
 * value is read through `window.ng` or the DOM: no listener, hook, patch or global is installed in
 * the page by this driver.
 */
const READ_PAGE = `
    const ng = window.ng;
    const root = document.querySelector('[ng-version]');
    const router = ng.ɵgetRouterInstance(ng.getInjector(root));
    const config = router.config || [];
    const entry = config.filter((route) => route.path === routePath)[0];
    let routeLoaded = null;
    try {
      routeLoaded = entry ? Boolean(ng.ɵgetLoadedRoutes(entry)) : null;
    } catch (error) {
      routeLoaded = 'unreadable: ' + String(error && error.message);
    }
    return {
      pathname: location.pathname,
      routerUrl: router.url,
      routeConfig: config.map((route) => ({
        path: route.path,
        lazy: Boolean(route.loadChildren || route.loadComponent),
      })),
      routeLoaded: routeLoaded,
      bodyText: document.body.innerText.slice(0, 400),
      ngVersion: document.querySelector('[ng-version]')
        ? document.querySelector('[ng-version]').getAttribute('ng-version')
        : null,
      importFailureGlobal: typeof window.angularAiImportFailure,
      recordGlobals: Object.keys(window).filter((key) => /^angularAi|importAttempt/i.test(key)),
    };`;

/**
 * Probe one: the discovery. Loads the home route, navigates to the route under test with no
 * interception, and returns the module requests that navigation added — the route's own lazy chunk,
 * which the two arms then fail.
 * @param {string} appUrl
 */
function discoveryProbe(appUrl) {
  return `async (page) => {
  const APP = ${JSON.stringify(appUrl)};
  const ROUTE_URL = ${JSON.stringify(ROUTE_URL)};
  const ROUTE_PATH = ${JSON.stringify(ROUTE_TRIED)};
  const requests = [];
  const consoleErrors = [];
  const onRequest = (request) => requests.push(request.url());
  const onConsole = (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  };
  page.on('request', onRequest);
  page.on('console', onConsole);

  // A route a previous probe left registered survives the page load, so each probe starts from a page
  // with no interception of its own, and a probe that timed out cannot color the next one.
  try {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  } catch (error) {
    // A Playwright without unrouteAll: the unroute at the end of each probe is the only cleanup.
  }

  await page.goto('about:blank');
  await page.goto(APP + 'home', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(
    () => {
      const heading = document.querySelector('h1');
      return heading ? heading.textContent.trim() === 'Home' : false;
    },
    null,
    { timeout: 120000 },
  );
  const loaded = {
    url: page.url(),
    bodyText: (await page.evaluate(() => document.body.innerText)).slice(0, 400),
    requests: requests.slice(),
    consoleErrors: consoleErrors.slice(),
  };

  consoleErrors.length = 0;
  const navigation = await page.evaluate(async (routeUrl) => {${NAVIGATE}
  }, ROUTE_URL);
  await page.waitForTimeout(2000);
  const after = await page.evaluate(async (routePath) => {${READ_PAGE}
  }, ROUTE_PATH);
  consoleErrors.length = 0;
  page.off('request', onRequest);
  page.off('console', onConsole);

  return {
    app: APP,
    routeUrl: ROUTE_URL,
    loaded: loaded,
    navigation: navigation,
    after: after,
    added: requests.filter((url) => loaded.requests.indexOf(url) === -1),
  };
}`;
}

/**
 * Probe two and three: one arm. A fresh document at the home route, the discovered chunk handled by
 * the browser's own request interception, the router asked to activate the route, then the page, the
 * router, the console, the response events and the extension's globals read back.
 * @param {string} appUrl
 * @param {string} chunkUrl
 * @param {'abort' | 'fulfil-404'} mode
 */
function armProbe(appUrl, chunkUrl, mode) {
  const abort = mode === 'abort';
  const interception = abort
    ? `intercepted.push(route.request().url());
    await route.abort('failed');`
    : `intercepted.push(route.request().url());
    await route.fulfill({ status: 404, contentType: 'text/javascript', body: '' });`;
  return `async (page) => {
  const APP = ${JSON.stringify(appUrl)};
  const ROUTE_URL = ${JSON.stringify(ROUTE_URL)};
  const ROUTE_PATH = ${JSON.stringify(ROUTE_TRIED)};
  const CHUNK = ${JSON.stringify(chunkUrl)};
  const PATTERN = ${JSON.stringify(`**/${basename(chunkUrl)}`)};
  const MODE = ${JSON.stringify(mode)};
  const intercepted = [];
  const responses = [];
  const failures = [];
  const consoleErrors = [];
  const pageErrors = [];

  // A route a previous probe left registered survives the page load, so each probe starts from a page
  // with no interception of its own, and a probe that timed out cannot color the next one.
  try {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  } catch (error) {
    // A Playwright without unrouteAll: the unroute at the end of each probe is the only cleanup.
  }

  await page.route(PATTERN, async (route) => {
    ${interception}
  });
  const onResponse = (response) => {
    if (response.url() === CHUNK) {
      responses.push({ url: response.url(), status: response.status() });
    }
  };
  const onRequestFailed = (request) => {
    if (request.url() === CHUNK) {
      const failure = request.failure();
      failures.push({
        url: request.url(),
        failure: failure ? failure.errorText : null,
      });
    }
  };
  const onConsole = (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  };
  const onPageError = (error) => pageErrors.push(String(error && error.message));
  page.on('response', onResponse);
  page.on('requestfailed', onRequestFailed);
  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  await page.goto('about:blank');
  await page.goto(APP + 'home', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(
    () => {
      const heading = document.querySelector('h1');
      return heading ? heading.textContent.trim() === 'Home' : false;
    },
    null,
    { timeout: 120000 },
  );
  const before = {
    url: page.url(),
    bodyText: (await page.evaluate(() => document.body.innerText)).slice(0, 400),
  };
  // The overlay the portal loads in development logs its own errors late; let them land and then
  // start the window, so the console this arm records is the arm's own.
  await page.waitForTimeout(1500);
  consoleErrors.length = 0;
  const navigation = await page.evaluate(async (routeUrl) => {${NAVIGATE}
  }, ROUTE_URL);
  await page.waitForTimeout(2500);
  const after = await page.evaluate(async (routePath) => {${READ_PAGE}
  }, ROUTE_PATH);

  page.off('response', onResponse);
  page.off('requestfailed', onRequestFailed);
  page.off('console', onConsole);
  page.off('pageerror', onPageError);
  await page.unroute(PATTERN);

  return {
    mode: MODE,
    pattern: PATTERN,
    chunk: CHUNK,
    intercepted: intercepted,
    responses: responses,
    failures: failures,
    navigation: navigation,
    before: before,
    after: after,
    consoleErrors: consoleErrors,
    pageErrors: pageErrors,
  };
}`;
}

// ---------------------------------------------------------------------------------------------
// the armed capture — the only writer
// ---------------------------------------------------------------------------------------------

/**
 * A command run through the shell this checkout's probes need, with its exact command line, exit
 * status and both streams kept so a failure can be recorded rather than guessed at.
 * @param {string} command
 * @param {number} timeout
 */
function run(command, timeout) {
  const result = spawnSync(command, {
    cwd: ROOT,
    shell: true,
    encoding: 'utf8',
    timeout: timeout,
    maxBuffer: 16 * 1024 * 1024,
  });
  return {
    command: command,
    status: result.status,
    signal: result.signal ?? null,
    stdout: (result.stdout ?? '').trim(),
    stderr: (result.stderr ?? '').trim(),
    error: result.error ? String(result.error.message) : null,
  };
}

/** The JSON a control script printed, or null when it printed none. @param {string} text */
function jsonOf(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * The portal's own serving, as control-angular-dev-app reports it: `info` when this checkout already
 * has the flow up (its `up` refuses while its state file exists), `up` otherwise.
 * @returns {{serving: any, transcript: any[]}}
 */
function startPortal() {
  const transcript = [];
  const info = run(
    `node ${CONTROL_DEV_APP} info --target portal --json`,
    120000,
  );
  transcript.push(info);
  if (info.status === 0) {
    const payload = jsonOf(info.stdout);
    if (payload && payload.ok && payload.url) {
      return { serving: payload, transcript: transcript };
    }
  }
  const up = run(`node ${CONTROL_DEV_APP} up --target portal --json`, 600000);
  transcript.push(up);
  const payload = up.status === 0 ? jsonOf(up.stdout) : null;
  return {
    serving: payload && payload.url ? payload : null,
    transcript: transcript,
  };
}

/**
 * The browser's own instance, as control-ai-browsers reports it, then attached so playwright-cli can
 * drive it. `alreadyRunning` is not a failure: the instances are shared across checkouts.
 * @returns {{session: string, port: number, transcript: any[]} | {session: null, transcript: any[]}}
 */
function startBrowser() {
  const transcript = [];
  const info = run(
    `node ${CONTROL_BROWSERS} info ${BROWSER_INSTANCE} --json`,
    120000,
  );
  transcript.push(info);
  let state = info.status === 0 ? jsonOf(info.stdout) : null;
  let payload = state && state.state ? state.state : state;
  if (!payload || !payload.pid) {
    const up = run(
      `node ${CONTROL_BROWSERS} up ${BROWSER_INSTANCE} --json`,
      240000,
    );
    transcript.push(up);
    const upPayload = up.status === 0 ? jsonOf(up.stdout) : null;
    payload = upPayload && upPayload.state ? upPayload.state : upPayload;
  }
  if (!payload || !payload.session) {
    return { session: null, transcript: transcript };
  }
  const attach = run(
    `node ${CONTROL_BROWSERS} attach ${BROWSER_INSTANCE} --json`,
    180000,
  );
  transcript.push(attach);
  return {
    session: payload.session,
    port: payload.port ?? null,
    transcript: transcript,
  };
}

/**
 * One probe through playwright-cli, exactly as the skill documents driving an ad hoc session, with
 * the command line and the raw output kept. `--raw` prints the returned value as JSON.
 *
 * A probe that times out is retried once, and both runs are kept: a page load that stalls is a
 * property of the session (a hung tab, a dev server rebuilding), not of the app, and a capture that
 * gave up on the first stall would record a failure that says nothing about the portal. The record
 * states how many runs each probe needed, so a retry is visible rather than silent.
 * @param {string} session
 * @param {string} name
 * @param {string} source
 */
function probe(session, name, source) {
  mkdirSync(PROBE_DIR, { recursive: true });
  const file = join(PROBE_DIR, `${name}.js`);
  writeFileSync(file, `${source}\n`);
  const runs = [];
  let result = null;
  let value = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    result = run(
      `playwright-cli -s=${session} --raw run-code --filename="${file}"`,
      240000,
    );
    runs.push(trimmed(result));
    value = result.status === 0 ? jsonOf(result.stdout) : null;
    if (value) break;
  }
  return { file: file, run: result, value: value, runs: runs };
}

/**
 * The armed capture. Returns the record this head's measurement warrants — with a taken verdict, or
 * with the startup failure named when the portal or the browser could not be started at all.
 * @returns {Promise<any>}
 */
async function capture() {
  const portal = startPortal();
  if (!portal.serving) {
    const last = portal.transcript[portal.transcript.length - 1];
    return noVerdict({
      stage: 'portal',
      reason:
        'the Insurance Portal could not be started or found in this session: control-angular-dev-app neither reported a running portal flow nor started one',
      transcript: portal.transcript.map(trimmed),
      command: last.command,
      output:
        [last.stdout, last.stderr].filter(Boolean).join('\n') ||
        last.error ||
        `exit ${last.status}`,
    });
  }
  const appUrl = String(portal.serving.url);

  const browser = startBrowser();
  if (!browser.session) {
    const last = browser.transcript[browser.transcript.length - 1];
    return noVerdict({
      stage: 'browser',
      reason:
        'no control-ai-browsers instance could be started, or none reported a playwright-cli session, so no page was driven',
      transcript: browser.transcript.map(trimmed),
      command: last.command,
      output:
        [last.stdout, last.stderr].filter(Boolean).join('\n') ||
        last.error ||
        `exit ${last.status}`,
    });
  }
  const session = browser.session;

  const discovery = probe(session, 'discovery', discoveryProbe(appUrl));
  if (!discovery.value || discovery.value.navigation.settled !== 'resolved') {
    return noVerdict({
      stage: 'discovery',
      reason:
        'the portal page did not load, or navigating to the route under test with no interception did not resolve: the capture cannot name a chunk a failure could be measured on',
      transcript: discovery.runs.slice(),
      command: discovery.run.command,
      output:
        discovery.run.stdout ||
        discovery.run.stderr ||
        discovery.run.error ||
        '',
    });
  }

  // A route's lazily loaded chunk is served from the app's own output root — one file name at the
  // top level, no query string — while the dev server's prebundled dependencies (the Pangular
  // overlay's `popup-*.js` among them) arrive under `/@fs/` with a `?v=` query. Only the first kind
  // is a lazy route chunk, so only the first kind can be the request the arms fail.
  const added = /** @type {string[]} */ (discovery.value.added || []).filter(
    (url) => {
      const parsed = new URL(url);
      return parsed.search === '' && /^\/[^/]+\.js$/.test(parsed.pathname);
    },
  );
  if (added.length !== 1) {
    return noVerdict({
      stage: 'discovery',
      reason:
        added.length === 0
          ? 'navigating to the route under test added no chunk-shaped `.js` request, so the route carries no lazily loaded chunk to fail'
          : `navigating to the route under test added ${added.length} chunk-shaped \`.js\` requests (${added.join(', ')}), so the capture cannot say which one the router's import asked for`,
      transcript: discovery.runs.slice(),
      command: discovery.run.command,
      output:
        discovery.run.stdout ||
        discovery.run.stderr ||
        discovery.run.error ||
        '',
    });
  }
  const chunkUrl = added[0];

  const aborted = probe(
    session,
    'arm-aborted',
    armProbe(appUrl, chunkUrl, 'abort'),
  );
  const fulfil404 = probe(
    session,
    'arm-fulfilled-404',
    armProbe(appUrl, chunkUrl, 'fulfil-404'),
  );
  if (!aborted.value || !fulfil404.value) {
    const failed = aborted.value ? fulfil404 : aborted;
    return noVerdict({
      stage: 'arm',
      reason:
        'one of the two arms did not run, so the record cannot state what the page showed for both a request that never completed and one that carried a status',
      transcript: [...aborted.runs, ...fulfil404.runs],
      command: failed.run.command,
      output: failed.run.stdout || failed.run.stderr || failed.run.error || '',
    });
  }
  if (
    aborted.value.intercepted.length === 0 ||
    fulfil404.value.intercepted.length === 0
  ) {
    return noVerdict({
      stage: 'interception',
      reason:
        'the browser reported no intercepted request for the route chunk, so the arm failed nothing and no failure was measured',
      transcript: [...aborted.runs, ...fulfil404.runs],
      command: aborted.run.command,
      output:
        aborted.run.stdout || aborted.run.stderr || aborted.run.error || '',
    });
  }
  // The check that the request the arms failed is the one the router's import needed: if the route
  // still activated with its chunk aborted, the arm failed a request the route never asked for.
  if (aborted.value.navigation.settled !== 'rejected') {
    return noVerdict({
      stage: 'arm',
      reason:
        "the route activated although its chunk request was aborted, so the request the arms failed is not the one the router's import asked for and no failure was measured",
      transcript: aborted.runs.slice(),
      command: aborted.run.command,
      output:
        aborted.run.stdout || aborted.run.stderr || aborted.run.error || '',
    });
  }

  // The one read of the app's own files: what the served initial chunk passes to the route's
  // import(). It is fetched once, from the dev server the portal is already serving.
  const compiledImport = await readCompiledImport(appUrl, chunkUrl);

  const join = loadModule(JOIN_MODULE);
  const portalRecord = { importAttempts: [] };
  const emptyAnswer = join.chunkFailure(portalRecord);
  const absentAnswer = join.chunkFailure(undefined);

  const portalCommit = existsSync(PORTAL_DIR)
    ? run(`git -C "${PORTAL_DIR}" rev-parse --short HEAD`, 60000).stdout || null
    : null;

  return {
    schema: SCHEMA,
    milestone: MILESTONE,
    task: TASK,
    title: TITLE,
    question: QUESTION,
    verdict: {
      taken: true,
      routeTried: ROUTE_TRIED,
      state: 'cannot-tell',
      fixtureUsed: false,
      statement:
        "On the Insurance Portal a lazily loaded route's chunk can be made to fail with no page-side edit: while the router was asked to activate the `" +
        ROUTE_TRIED +
        "` route, the browser's own request interception failed its chunk `" +
        basename(chunkUrl) +
        '`, the dynamic import rejected with `' +
        aborted.value.navigation.message +
        '`, the router stayed on `' +
        aborted.value.after.routerUrl +
        "`, and the page kept rendering the home route with no error surface. The portal does not produce the record this milestone renders from: the page states no import specifier — the served initial chunk calls the route's `import()` with the emitted chunk URL, which " +
        RECORD_MODULE +
        ' refuses to read back as a specifier — and no module ships the tap that publishes `importAttempts`. The panel surface therefore answers `cannot-tell`, never an import, a route path, a status, a hash or a version drift.',
      // The two artefacts the portal lacks, stated with the verdict so a reader does not have to go
      // looking: the suite asserts these are the two `artefacts.lacking` entries, name for name.
      portalLacks: [
        "the import specifier the route's import() was called with, as this record takes one",
        'the attempt record itself — the `importAttempts` entry the panel renders',
      ],
    },
    target: {
      name: 'Insurance Portal',
      dir: portal.serving.dir ?? PORTAL_DIR,
      url: appUrl,
      port: portal.serving.port ?? null,
      slot: portal.serving.slot ?? null,
      commit: portalCommit,
      angularVersion: discovery.value.after.ngVersion,
      servedBy: {
        skill: 'control-angular-dev-app',
        command: `node ${CONTROL_DEV_APP} info --target portal --json`,
        upCommand: `node ${CONTROL_DEV_APP} up --target portal --json`,
        session: portal.serving.session ?? null,
        evidenceDir: portal.serving.evidenceDir ?? null,
      },
      drivenBy: {
        skill: 'control-ai-browsers',
        instance: BROWSER_INSTANCE,
        session: session,
        port: browser.port,
        command: `node ${CONTROL_BROWSERS} up ${BROWSER_INSTANCE} --json`,
        attachCommand: `node ${CONTROL_BROWSERS} attach ${BROWSER_INSTANCE} --json`,
      },
    },
    route: {
      tried: ROUTE_TRIED,
      url: ROUTE_URL,
      source: `${PORTAL_ROUTES}`,
      statement:
        "loadChildren: async () => (await import('@ng-journal/contract/routes')).routes",
      chunkRequest: chunkUrl,
      chunkBasename: basename(chunkUrl),
      discoveredBy:
        'navigating to ' +
        ROUTE_URL +
        ' from ' +
        HOME_URL +
        ' with no interception, and recording the `.js` request that navigation added',
      routeConfig: discovery.value.after.routeConfig,
      routeLoadedWithoutInterception: discovery.value.after.routeLoaded,
      renderedWithoutInterception: discovery.value.after.bodyText,
    },
    instrument: {
      what: "the browser's own request interception, installed through playwright-cli `run-code` with `page.route`",
      pageSideEdit: false,
      why: "the route, its lazy chunk and its router state are the app's own; the only thing the capture adds is a handler in the browser that fails one request, so no script of the page, no global of the page and no tap of the extension is installed, patched or read for the measurement",
      probes:
        'the three probe sources are generated by this suite into `tmp/m064-capture/` (git-ignored) and are not committed; each command below is the one that ran, with the probe that ran for it',
      commands: [
        `playwright-cli -s=${session} --raw run-code --filename="${discovery.file}"`,
        `playwright-cli -s=${session} --raw run-code --filename="${aborted.file}"`,
        `playwright-cli -s=${session} --raw run-code --filename="${fulfil404.file}"`,
      ],
    },
    arms: [
      armRecord('aborted', aborted.value, join),
      armRecord('fulfilled-404', fulfil404.value, join),
    ],
    surface: {
      join: JOIN_MODULE,
      record: portalRecord,
      state: 'cannot-tell',
      absentRecordAnswer: absentAnswer,
      emptyRecordAnswer: emptyAnswer,
      why: 'the record the portal carries is absent — the capture measured `window.angularAiImportFailure` as `undefined` and found no `importAttempts` — and an absent record is `cannot-tell` with `record-unreadable`, while an empty one is `cannot-tell` with `no-import-recorded`. Neither reading names a specifier, a route path, a status or a hash, because the record carries none.',
    },
    artefacts: {
      produced: [
        {
          artefact: 'a failed dynamic import on a lazily loaded route',
          evidence:
            'both arms: the router\'s navigation promise rejected with "' +
            aborted.value.navigation.name +
            ': ' +
            aborted.value.navigation.message +
            '"',
        },
        {
          artefact: 'a response status for that request, when one arrived',
          evidence:
            'arm fulfilled-404 recorded `status: ' +
            (fulfil404.value.responses[0]
              ? fulfil404.value.responses[0].status
              : 'none') +
            '`; arm aborted recorded no response and the failure "' +
            (aborted.value.failures[0]
              ? aborted.value.failures[0].failure
              : 'none') +
            '"',
        },
        {
          artefact: 'the route whose lazy load produced it',
          evidence:
            "the router's own config names `" +
            ROUTE_TRIED +
            '` with a `loadChildren`, and `ɵgetLoadedRoutes` reports it unloaded after the failure',
        },
      ],
      lacking: [
        {
          artefact:
            "the import specifier the route's import() was called with, as this record takes one",
          why:
            "the page states only the emitted chunk URL: the served initial chunk rewrites the route's `import('@ng-journal/contract/routes')` to `import(\"" +
            new URL(chunkUrl).pathname +
            '")`, and a chunk URL is exactly the value ' +
            RECORD_MODULE +
            " refuses to read back as a specifier. The source-level specifier exists in the portal's own route table and nowhere in the running page.",
          citations: [
            {
              file: RECORD_MODULE,
              text: "//   specifier   the import specifier the router's `import()` was called with, as the page stated it.",
            },
            {
              file: RECORD_MODULE,
              text: '//               Never a chunk name recovered from a request URL: a filename is not the specifier, and',
            },
            {
              file: PORTAL_ROUTES,
              text: "(await import('@ng-journal/contract/routes')).routes,",
            },
          ],
        },
        {
          artefact:
            'the attempt record itself — the `importAttempts` entry the panel renders',
          why:
            'nothing publishes one. ' +
            RECORD_MODULE +
            ' is not listed in ' +
            MANIFEST +
            ", so no content script loads it, and the page carries neither `angularAiImportFailure` nor `importAttempts`. The tap the record describes is the caller's, and at this head no caller installs it for the `" +
            ROUTE_TRIED +
            '` route or for any other route the portal loads.',
          citations: [
            { file: MANIFEST, text: '        "agent-main.js",' },
            {
              file: RECORD_MODULE,
              text: "// navigation and hands it each attempt the router's import returned; it writes the answer for that",
            },
          ],
        },
      ],
    },
    fixture: {
      used: false,
      path: 'spikes/ng222-app',
      routeTried: ROUTE_TRIED,
      why:
        'the portal carries a lazily loaded route — `' +
        ROUTE_TRIED +
        "` — and the capture failed that route's chunk, so the fallback the intent allows for a portal with no such route is not the case here: a fixture would repeat the same measurement on another app. It would also not supply the artefact the portal lacks, because " +
        basename(chunkUrl) +
        ' names a compiled chunk there too.',
      wouldNeedToSupply: [
        'a route whose lazy load the record can name a specifier for, i.e. a route the record states as `{ specifier, routePath, outcome }` rather than one whose compiled `import()` argument is a chunk URL',
        'the tap itself: something in the extension (not in the inspected page) has to hand `extension/import-failure.js` each attempt the router made, because no module in ' +
          MANIFEST +
          ' loads it and the page states no attempt',
        'a page whose failing request the browser can fail on purpose, which the portal already is — so a fixture verdict would have to be justified by the two artefacts above, not by the failure',
      ],
    },
    static: staticFacts(),
    capture: {
      command: ARMED_COMMAND,
      windowsCommand: ARMED_COMMAND_WINDOWS,
      check: CHECK_COMMAND,
      records: RECORD_REL,
      reads:
        'the portal is served by control-angular-dev-app and one page is driven through a control-ai-browsers instance by playwright-cli `run-code`: three probes, one discovery and two arms, each returning its own readings. The served initial chunk is fetched once from the dev server to state what specifier the compiled route closure passes to `import()`. The join is then run in a bare `node:vm` context over the record the portal carries.',
      compiledImport: compiledImport,
      probeRuns: [
        probeRuns('discovery', discovery),
        probeRuns('arm-aborted', aborted),
        probeRuns('arm-fulfilled-404', fulfil404),
      ],
      reading:
        "an armed run re-derives every fact above and writes the file only when a byte moved, so two armed runs in a row are byte-identical; a default run writes nothing, re-derives the join's answers, the manifest scan, the module citation and the portal route source, and hashes the record before and after to prove the bytes did not move.",
    },
    environment: {
      platform: process.platform,
      node: process.version,
      playwrightCli: run('playwright-cli --version', 120000).stdout || null,
      browser:
        'the control-ai-browsers instance ' +
        BROWSER_INSTANCE +
        ' (Chrome Beta), driven by playwright-cli',
      page: {
        angularVersion: discovery.value.after.ngVersion,
        ngGlobal: 'object',
      },
      note: "the probes called `window.ng.ɵgetRouterInstance` and `window.ng.ɵnavigateByUrl`, which answer only in a development build; the portal flow's process table, evidence directory and logs are the skill's bookkeeping for `down` and stay in its evidence directory, so only the facts this record uses are carried here",
    },
  };
}

/** One arm, in the record's own shape: what the interception did and everything the page answered. */
function armRecord(name, value, join) {
  const response = value.responses[0] ?? null;
  const failure = value.failures[0] ?? null;
  const armLine = value.consoleErrors.filter(
    (text) =>
      text.includes(value.chunk) || /net::ERR_|status of \d{3}/.test(text),
  );
  const failureNote =
    response && failure
      ? 'a fulfilled ' +
        response.status +
        ' for a module script also ends the request with `' +
        failure.failure +
        '`: the response carrying a status arrived first, and that response is the fact this arm states'
      : null;
  return {
    name: name,
    interception:
      value.mode === 'abort'
        ? `page.route('${value.pattern}', route => route.abort('failed'))`
        : `page.route('${value.pattern}', route => route.fulfill({ status: 404, body: '' }))`,
    pattern: value.pattern,
    chunk: value.chunk,
    intercepted: value.intercepted,
    response: response
      ? { url: response.url, status: response.status }
      : { url: null, status: null },
    failure: failure ? { url: failure.url, errorText: failure.failure } : null,
    failureNote: failureNote,
    console: {
      armLine: armLine.length ? armLine[0] : null,
      errors: value.consoleErrors,
      note: "the window opens after the page has loaded and settled, so the errors listed here are the ones the attempted navigation printed; the portal's development overlay prints its own at load and they are not repeated per arm",
    },
    importError: {
      settled: value.navigation.settled,
      name: value.navigation.name,
      message: value.navigation.message,
    },
    page: {
      before: value.before.url,
      pathname: value.after.pathname,
      routerUrl: value.after.routerUrl,
      routeLoaded: value.after.routeLoaded,
      bodyTextUnchanged: value.after.bodyText === value.before.bodyText,
      bodyText: value.after.bodyText,
      pageErrors: value.pageErrors,
    },
    record: {
      present: value.after.importFailureGlobal !== 'undefined',
      importFailureGlobal: value.after.importFailureGlobal,
      globals: value.after.recordGlobals,
    },
    surface: {
      record: { importAttempts: [] },
      state: 'cannot-tell',
      absentRecordAnswer: join.chunkFailure(undefined),
      emptyRecordAnswer: join.chunkFailure({ importAttempts: [] }),
    },
  };
}

/** The static facts this head states, derivable on every run. @returns {any} */
function staticFacts() {
  const manifestBytes = existsSync(join(ROOT, MANIFEST))
    ? readFileSync(join(ROOT, MANIFEST), 'utf8')
    : '';
  const recordModulePath = join(ROOT, ...RECORD_MODULE.split('/'));
  return {
    manifest: {
      path: MANIFEST,
      occurrences: countIn(join(ROOT, MANIFEST), 'import-failure'),
      note: "the manifest is the list of scripts a content script loads, so a zero here is the measurement that this milestone's record module is not shipped into any page at this head",
    },
    recordModule: {
      path: RECORD_MODULE,
      present: existsSync(recordModulePath),
      loadedByManifest: manifestBytes.includes('import-failure'),
      exports: ['importFailure', 'observeImportFailures'],
      writes: 'importAttempts',
    },
    join: {
      path: JOIN_MODULE,
      answers: [
        'state',
        'specifier',
        'routePath',
        'status',
        'hash',
        'consideredCount',
        'reason',
      ],
    },
    routeSource: {
      path: PORTAL_ROUTES,
      present: existsSync(PORTAL_ROUTES),
      line: "(await import('@ng-journal/contract/routes')).routes,",
      note: 'the portal is a checkout of its own repository, so this line is resolved when that checkout is present and named absent when it is not',
    },
  };
}

/**
 * The served initial chunk's own statement of the route's import(): one read, from the dev server the
 * portal is already serving, with the URL it was read from.
 * @param {string} appUrl
 * @param {string} chunkUrl
 */
async function readCompiledImport(appUrl, chunkUrl) {
  const url = new URL('main.js', appUrl).href;
  try {
    const response = await fetch(url);
    const source = await response.text();
    const wanted = `import("${new URL(chunkUrl).pathname}")`;
    const line = source
      .split(/\r?\n/)
      .filter((text) => text.includes(wanted))
      .map((text) => text.trim())
      .filter((text) => text.startsWith('loadChildren'));
    return {
      url: url,
      status: response.status,
      specifierInCompiledCode: line.length ? wanted : null,
      line: line.length ? line[0] : null,
    };
  } catch (error) {
    return {
      url: url,
      status: null,
      specifierInCompiledCode: null,
      line: null,
      error: String(error && error.message),
    };
  }
}

/** A transcript entry without the noise a full state payload carries. */
function trimmed(entry) {
  return {
    command: entry.command,
    status: entry.status,
    stdout: entry.stdout.slice(0, 2000),
    stderr: entry.stderr.slice(0, 2000),
    error: entry.error,
  };
}

/**
 * How many runs one probe needed, and the command line of each: a probe that stalled once and
 * answered on the retry is a fact this record states rather than a difference between two records
 * nobody can see.
 * @param {string} name
 * @param {{runs: any[]}} probe
 */
function probeRuns(name, probe) {
  return {
    probe: name,
    runs: probe.runs.length,
    commands: probe.runs.map((entry) => entry.command),
  };
}

/**
 * The record a session that could not measure anything warrants: the exact command, its output and
 * the reason, and no arm fact, no surface answer and no fixture — a measurement of the failure to
 * measure, which is the only thing such a session is entitled to record.
 * @param {{stage: string, reason: string, transcript: any[], command: string, output: string}} startup
 */
function noVerdict(startup) {
  return {
    schema: SCHEMA,
    milestone: MILESTONE,
    task: TASK,
    title: TITLE,
    question: QUESTION,
    verdict: {
      taken: false,
      routeTried: ROUTE_TRIED,
      state: null,
      fixtureUsed: false,
      statement:
        'No verdict was taken: the portal capture could not be run in this session, so this record states the command that failed, its output and the reason, and claims no arm, no page and no surface.',
      stage: startup.stage,
      reason: startup.reason,
      command: startup.command,
      output: startup.output,
      transcript: startup.transcript,
    },
    capture: {
      command: ARMED_COMMAND,
      windowsCommand: ARMED_COMMAND_WINDOWS,
      check: CHECK_COMMAND,
      records: RECORD_REL,
      reading:
        'an armed run writes the record only when a byte moved; a default run writes nothing and refuses this record rather than passing on a milestone whose verification target was not measured',
    },
    static: staticFacts(),
  };
}

/**
 * The record as it stands when a test reads it, refused unless it carries a taken verdict: a record
 * that measured the failure to measure is a measurement, but it is not a verification, and this
 * suite does not pass on one.
 * @returns {any}
 */
function takenRecord() {
  assert.ok(
    existsSync(RECORD_PATH),
    `${RECORD_REL} is not there: run ${ARMED_COMMAND}`,
  );
  const record = readRecord();
  assert.equal(
    record.verdict.taken,
    true,
    `no verdict was taken on the portal (${record.verdict.stage}): ${record.verdict.reason} — re-arm the capture (${ARMED_COMMAND}) when the portal and a browser can be started`,
  );
  return record;
}

// ---------------------------------------------------------------------------------------------
// tests — the armed capture first, then everything a read-only run can hold to the tree
// ---------------------------------------------------------------------------------------------

/**
 * The bytes this run found, hashed before any test has read them: a read-only run compares its hash
 * at the end, which is the one way to prove the run wrote nothing at all.
 */
const RECORD_BYTES_AT_START = sha256Of(RECORD_PATH);

test(
  'the armed capture: the portal is driven, the chunk is failed, and the record is written only when a byte moved',
  {
    skip: ARMED
      ? false
      : 'read-only by default: set M064_CAPTURE=1 to run the capture',
  },
  async () => {
    const before = sha256Of(RECORD_PATH);
    const record = await capture();
    const bytes = serialized(record);
    const current = existsSync(RECORD_PATH)
      ? readFileSync(RECORD_PATH, 'utf8')
      : null;
    if (current === bytes) {
      assert.equal(
        sha256Of(RECORD_PATH),
        before,
        'an unchanged record keeps its bytes',
      );
      return;
    }
    writeFileSync(RECORD_PATH, bytes);
    assert.equal(
      sha256Of(RECORD_PATH),
      createHash('sha256').update(bytes).digest('hex'),
      'the record written is the record derived',
    );
  },
);

test('the record names the target, the route tried and the two arms the capture ran', () => {
  const record = takenRecord();
  assert.equal(record.schema, SCHEMA);
  assert.equal(record.milestone, MILESTONE);
  assert.equal(record.task, TASK);
  assert.equal(record.title, TITLE);
  assert.match(record.question, /lazily loaded route/);

  assert.equal(record.verdict.taken, true);
  assert.equal(record.verdict.routeTried, ROUTE_TRIED);
  assert.equal(record.verdict.fixtureUsed, false);

  assert.equal(record.target.name, 'Insurance Portal');
  assert.match(record.target.url, /^http:\/\/localhost:\d+\/$/);
  assert.ok(record.target.port > 0, 'the served port is stated');
  assert.equal(
    record.target.angularVersion,
    record.environment.page.angularVersion,
  );
  assert.equal(record.target.servedBy.skill, 'control-angular-dev-app');
  assert.equal(record.target.drivenBy.skill, 'control-ai-browsers');

  assert.equal(record.route.tried, ROUTE_TRIED);
  assert.equal(record.route.url, ROUTE_URL);
  assert.match(record.route.chunkRequest, /\.js$/);
  assert.equal(
    new URL(record.route.chunkRequest).origin,
    new URL(record.target.url).origin,
    'the chunk the arms failed is served by the portal the record names',
  );
  assert.equal(record.route.chunkBasename, basename(record.route.chunkRequest));
  assert.equal(record.route.routeLoadedWithoutInterception, true);

  assert.deepEqual(
    record.arms.map((arm) => arm.name),
    ['aborted', 'fulfilled-404'],
  );
  for (const arm of record.arms) {
    assert.equal(arm.chunk, record.route.chunkRequest);
    assert.equal(
      arm.intercepted.length,
      1,
      `${arm.name} intercepted the chunk once`,
    );
    assert.equal(arm.intercepted[0], record.route.chunkRequest);
  }
});

test('each arm states only what its own interception produced: no status where none arrived, and the status that did', () => {
  const record = takenRecord();
  const aborted = record.arms.find((arm) => arm.name === 'aborted');
  const fulfilled = record.arms.find((arm) => arm.name === 'fulfilled-404');

  assert.equal(
    aborted.response.status,
    null,
    'an aborted request produced no response status',
  );
  assert.equal(aborted.response.url, null);
  assert.match(aborted.failure.errorText, /^net::ERR_/);
  assert.match(aborted.console.armLine, /net::ERR_/);
  assert.doesNotMatch(aborted.console.armLine, /status of \d{3}/);

  assert.equal(
    fulfilled.response.status,
    404,
    'the fulfilled arm produced the status it answered',
  );
  assert.equal(fulfilled.response.url, record.route.chunkRequest);
  assert.match(fulfilled.console.armLine, /status of 404/);
  assert.equal(
    aborted.failureNote,
    null,
    'the aborted arm needs no note: it produced no response',
  );
  if (fulfilled.failure) {
    // A fulfilled 404 for a module script also ends the request with an abort, so the arm states the
    // response it got and names the second event rather than quietly dropping it.
    assert.match(fulfilled.failure.errorText, /^net::ERR_/);
    assert.match(fulfilled.failureNote, /404/);
    assert.ok(fulfilled.failureNote.includes(fulfilled.failure.errorText));
    assert.match(
      fulfilled.failureNote,
      /response carrying a status arrived first/,
    );
  } else {
    assert.equal(fulfilled.failureNote, null);
  }

  for (const arm of [aborted, fulfilled]) {
    assert.equal(arm.importError.settled, 'rejected');
    assert.equal(arm.importError.name, 'TypeError');
    assert.equal(
      arm.importError.message,
      `Failed to fetch dynamically imported module: ${record.route.chunkRequest}`,
    );
    assert.equal(arm.record.present, false);
    assert.equal(arm.record.importFailureGlobal, 'undefined');
    assert.deepEqual(
      arm.record.globals,
      ['angularAiOutletState', 'angularAiGuardPhase'],
      'the page carries the two globals the shipped MAIN-world scripts publish and no record',
    );
  }
});

test('the page showed no failure surface: both arms left the router on the home route and the route never loaded', () => {
  const record = takenRecord();
  for (const arm of record.arms) {
    assert.equal(arm.page.pathname, HOME_URL);
    assert.equal(arm.page.routerUrl, HOME_URL);
    assert.equal(arm.page.routeLoaded, false);
    assert.equal(
      arm.page.bodyTextUnchanged,
      true,
      `${arm.name} left the page as it was`,
    );
    assert.match(arm.page.bodyText, /Insurance Portal/);
    assert.match(arm.page.bodyText, /Home/);
    assert.deepEqual(
      arm.page.pageErrors,
      [],
      `${arm.name} raised no page error`,
    );
  }
});

test("the state the surface showed is the join's own answer for the record the portal carries", () => {
  const record = takenRecord();
  const join = loadModule(JOIN_MODULE);

  const empty = local(join.chunkFailure({ importAttempts: [] }));
  const absent = local(join.chunkFailure(undefined));
  assert.deepEqual(record.surface.record, { importAttempts: [] });
  assert.deepEqual(record.surface.emptyRecordAnswer, empty);
  assert.deepEqual(record.surface.absentRecordAnswer, absent);

  assert.deepEqual(empty, [
    { state: 'cannot-tell', reason: 'no-import-recorded', consideredCount: 0 },
  ]);
  assert.deepEqual(absent, {
    state: 'cannot-tell',
    reason: 'record-unreadable',
  });

  assert.equal(record.surface.state, 'cannot-tell');
  assert.equal(record.verdict.state, record.surface.state);
  assert.equal(record.verdict.taken, true);

  for (const arm of record.arms) {
    assert.deepEqual(arm.surface.emptyRecordAnswer, empty);
    assert.deepEqual(arm.surface.absentRecordAnswer, absent);
    assert.equal(arm.surface.state, 'cannot-tell');
    for (const answer of [empty[0], absent]) {
      assert.deepEqual(
        Object.keys(answer).sort(),
        answer.consideredCount === undefined
          ? ['reason', 'state']
          : ['consideredCount', 'reason', 'state'],
        'the answer carries no field the record did not give it',
      );
    }
  }
});

test('the artefact the portal lacks is named, with citations that re-resolve in this checkout', () => {
  const record = takenRecord();
  assert.ok(
    record.artefacts.lacking.length >= 2,
    'the record names what the portal lacks',
  );

  const lackingSpecifier = record.artefacts.lacking.find((entry) =>
    /specifier/.test(entry.artefact),
  );
  const lackingRecord = record.artefacts.lacking.find((entry) =>
    /attempt record/.test(entry.artefact),
  );
  assert.ok(lackingSpecifier, 'the missing import specifier is named');
  assert.ok(lackingRecord, 'the missing attempt record is named');

  for (const entry of record.artefacts.lacking) {
    assert.match(
      entry.why,
      new RegExp(ROUTE_TRIED),
      'the route tried is named beside the lack',
    );
    assert.ok(entry.citations.length >= 1);
    for (const citation of entry.citations) {
      const resolution = resolveLine(citation);
      if (resolution.reason === 'file-absent') {
        assert.ok(
          citation.file.startsWith(PORTAL_DIR),
          `${citation.file} is absent because it belongs to the portal checkout, not this one`,
        );
        assert.equal(
          record.static.routeSource.present,
          false,
          'the record agrees that the portal checkout is absent',
        );
        continue;
      }
      assert.equal(
        resolution.resolved,
        true,
        `${citation.file} carries: ${citation.text.trim()}`,
      );
    }
  }

  const produced = record.artefacts.produced
    .map((entry) => entry.artefact)
    .join(' ');
  assert.match(produced, /failed dynamic import/);
  assert.match(produced, /response status/);

  // The verdict states the same two lacks: a reader of the verdict alone learns what the portal
  // does not produce, and the two lists cannot drift apart without reddening here.
  assert.deepEqual(record.verdict.portalLacks, [
    lackingSpecifier.artefact,
    lackingRecord.artefact,
  ]);
});

test('no fixture verdict is taken, and the record says what a fixture would have to supply', () => {
  const record = takenRecord();
  assert.equal(record.fixture.used, false);
  assert.equal(record.fixture.routeTried, record.route.tried);
  assert.equal(record.fixture.path, 'spikes/ng222-app');
  assert.ok(record.fixture.wouldNeedToSupply.length >= 2);
  for (const need of record.fixture.wouldNeedToSupply) {
    assert.ok(need.length > 40, 'each need is stated rather than named');
  }
  assert.match(record.fixture.why, new RegExp(ROUTE_TRIED));
  assert.match(record.fixture.why, /chunk URL|chunk/);
});

test('the static facts are re-derived from this head: the record module is not shipped and the portal source states the import', () => {
  const record = takenRecord();
  const derived = staticFacts();

  assert.equal(
    record.static.manifest.occurrences,
    derived.manifest.occurrences,
  );
  assert.equal(
    countIn(join(ROOT, MANIFEST), 'import-failure'),
    0,
    'the manifest names no import-failure script, so nothing loads the record module',
  );
  assert.equal(
    record.static.recordModule.present,
    derived.recordModule.present,
  );
  assert.equal(record.static.recordModule.loadedByManifest, false);
  assert.deepEqual(
    record.static.recordModule.exports,
    derived.recordModule.exports,
  );
  assert.equal(record.static.join.path, JOIN_MODULE);
  assert.deepEqual(record.static.join.answers, derived.join.answers);

  // The record module really publishes what the record says it publishes, run in a bare context.
  const writer = loadModule(RECORD_MODULE, 'angularAiImportFailure');
  for (const name of record.static.recordModule.exports) {
    assert.equal(
      typeof writer[name],
      'function',
      `${RECORD_MODULE} exports ${name}`,
    );
  }
  assert.deepEqual(local(writer.STATES), [
    'missing-import',
    'never-completed',
    'resolved',
    'cannot-tell',
  ]);

  // The compiled import is the captured read of the served initial chunk: it names the chunk the
  // arms failed, and it names it as the route's own import() argument.
  const compiled = record.capture.compiledImport;
  assert.ok(compiled.line, 'the served initial chunk was read');
  assert.match(compiled.line, /^loadChildren:/);
  assert.ok(
    compiled.line.includes(
      `import("${new URL(record.route.chunkRequest).pathname}")`,
    ),
    'the compiled route closure imports the chunk URL the arms failed',
  );
  assert.equal(
    compiled.specifierInCompiledCode,
    `import("${new URL(record.route.chunkRequest).pathname}")`,
  );

  // The portal's own route table, when that checkout is here: the line the record quotes resolves.
  const routeSource = resolveLine({
    file: record.static.routeSource.path,
    text: record.static.routeSource.line,
  });
  if (record.static.routeSource.present) {
    assert.equal(
      routeSource.resolved,
      true,
      'the portal route table carries the import clause recorded',
    );
  } else {
    assert.equal(routeSource.reason, 'file-absent');
  }
});

test('the record states the instrument, the reading and the commands that reproduce it', () => {
  const record = takenRecord();
  assert.equal(record.instrument.pageSideEdit, false);
  assert.match(record.instrument.what, /request interception/);
  assert.equal(record.instrument.commands.length, 3);
  for (const command of record.instrument.commands) {
    assert.match(
      command,
      /^playwright-cli -s=\S+ --raw run-code --filename=".+\.js"$/,
    );
  }
  assert.equal(record.capture.command, ARMED_COMMAND);
  assert.equal(record.capture.windowsCommand, ARMED_COMMAND_WINDOWS);
  assert.equal(record.capture.check, CHECK_COMMAND);
  assert.equal(record.capture.records, RECORD_REL);
  assert.deepEqual(
    record.capture.probeRuns.map((entry) => entry.probe),
    ['discovery', 'arm-aborted', 'arm-fulfilled-404'],
  );
  for (const entry of record.capture.probeRuns) {
    assert.ok(
      entry.runs >= 1 && entry.runs <= 2,
      `${entry.probe} ran once, or once and a retry`,
    );
    assert.equal(entry.commands.length, entry.runs);
    for (const command of entry.commands) {
      assert.match(
        command,
        /^playwright-cli -s=\S+ --raw run-code --filename=".+\.js"$/,
      );
    }
  }
  assert.ok(record.environment.playwrightCli, 'the driver version is stated');
  assert.match(record.verdict.statement, /no page-side edit/);
  assert.match(record.verdict.statement, /cannot-tell/);
});

test('held-out: an unarmed run writes nothing, and the record is byte-identical after this suite read it', () => {
  const now = sha256Of(RECORD_PATH);
  assert.ok(now, 'the record exists');
  // An armed run's own test has already written whatever this head derives, so its baseline is what
  // that write left; a default run's baseline is the hash taken before any test read the file, which
  // is what makes this assertion a proof that nothing wrote.
  if (!ARMED) {
    assert.equal(
      now,
      RECORD_BYTES_AT_START,
      'the record has the same sha256 it had before this suite read it: no default run wrote to it',
    );
  }

  // The bytes on disk are exactly the bytes this milestone's one writing rule produces, so a value
  // edited into the file without re-deriving it reddens here rather than passing as a record.
  const bytes = readFileSync(RECORD_PATH, 'utf8');
  assert.equal(
    serialized(JSON.parse(bytes)),
    bytes,
    'the record is exactly what an armed run would write for it',
  );

  const record = JSON.parse(bytes);
  assert.equal(
    record.verdict.taken,
    true,
    `no verdict was taken on the portal (${record.verdict.stage}): ${record.verdict.reason} — re-arm the capture (${ARMED_COMMAND}) when the portal and a browser can be started: this record measures that the target was not reached, and the milestone is not verified while it says so`,
  );
});
