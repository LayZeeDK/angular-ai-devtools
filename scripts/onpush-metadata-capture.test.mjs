// @ts-check
//
// M035 T001 — what a component def reports about the change detection strategy
// and the readiness facts, measured on the Angular version the fixture builds.
//
// Run the checks (read-only: no build, no browser, no write):
//   node --experimental-strip-types --test scripts/onpush-metadata-capture.test.mjs
//
// Re-capture. On Windows cmd.exe this is the only arming form that works —
// `set "M035_CAPTURE=1" && cmd` would leave the space inside the variable:
//   set "M035_CAPTURE=1"&& node --experimental-strip-types --test "scripts/onpush-metadata-capture.test.mjs"
//
// Point the checks at another recording:
//   set "M035_RECORD=<path>"&& node --experimental-strip-types --test "scripts/onpush-metadata-capture.test.mjs"
//
// The capture drives a development build of the fixture into the git-ignored
// `tmp/` directory, serves that output, and reads each subject's def off the
// component instance the page actually rendered. It never uses a bare
// `ng build`: the fixture's default configuration is production.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const APP = join(ROOT, 'spikes', 'ng222-app');
const SELF_PATH = fileURLToPath(import.meta.url);

const ROUTE_PATH = '/onpush-ready';
const RECORD_PATH =
  process.env.M035_RECORD ??
  join(ROOT, 'research', 'raw', 'm035-onpush-metadata.json');

const OUTPUT_DIR = join(ROOT, 'tmp', 'm035-onpush-build');
const BROWSER_DIR = join(OUTPUT_DIR, 'browser');
const NG_CLI = join(APP, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');

const ROUTES_PATH = join(APP, 'src', 'app', 'app.routes.ts');
const COMPONENT_PATH = join(APP, 'src', 'app', 'onpush-ready.ts');
const PAGE_PATH = join(APP, 'src', 'app', 'onpush-ready-page.ts');

const FIXTURE_CORE_TYPES = join(
  APP,
  'node_modules',
  '@angular',
  'core',
  'types',
  '_debug_node-chunk.d.ts',
);
const PANEL_CORE_TYPES = join(
  ROOT,
  'node_modules',
  '@angular',
  'core',
  'types',
  '_debug_node-chunk.d.ts',
);

const FIVE_FIELDS = [
  'onPush',
  'signals',
  'standalone',
  'inputs',
  'inputConfig',
];
const STRATEGY_FIELD = 'changeDetection';

const CAPTURE_COMMAND =
  'set "M035_CAPTURE=1"&& node --experimental-strip-types --test "scripts/onpush-metadata-capture.test.mjs"';
const CHECK_COMMAND =
  'node --experimental-strip-types --test "scripts/onpush-metadata-capture.test.mjs"';
const BUILD_COMMAND =
  'node spikes/ng222-app/node_modules/@angular/cli/bin/ng.js build --configuration development --output-path tmp/m035-onpush-build  (cwd spikes/ng222-app)';

/**
 * The subjects, in the order their defs are recorded.
 *
 * `onPushReady` declares `ChangeDetectionStrategy.OnPush`; `declaredDefault`
 * declares `ChangeDetectionStrategy.Default` explicitly; `counter` — the
 * fixture's pre-existing component — declares no strategy at all. Since Angular
 * 22 a component that names no strategy is OnPush: the compiler resolves a
 * missing `changeDetection` to OnPush and omits the entry from the def, so the
 * def's `onPush` comes out true and the view is initialised with the OnPush
 * flags. The expected values are therefore true, false, true — only the
 * component that declares the deprecated Default alias is checked eagerly.
 */
const SUBJECTS = [
  {
    key: 'onPushReady',
    element: 'app-onpush-ready',
    component: 'OnPushReady',
    declaredStrategy: 'OnPush',
    expectedOnPush: true,
  },
  {
    key: 'declaredDefault',
    element: 'app-declared-default',
    component: 'DeclaredDefault',
    declaredStrategy: 'Default',
    expectedOnPush: false,
  },
  {
    key: 'counter',
    element: 'app-counter',
    component: 'Counter',
    declaredStrategy: 'none declared',
    expectedOnPush: true,
  },
];

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

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

/** `--output-path` wants a slash-separated path, as the other build proofs pass it. */
function posixPath(path) {
  return path.split(sep).join('/');
}

function checkStrings(record, keys, where) {
  if (!isObject(record)) fail(`missing ${where}`);
  for (const key of keys) {
    if (typeof record[key] !== 'string' || record[key] === '') {
      fail(`missing ${where}.${key}`);
    }
  }
}

/** The installed version of the package that owns a type-declaration file. */
function installedPackage(typesPath) {
  const packagePath = join(dirname(dirname(typesPath)), 'package.json');
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
  return { version: pkg.version, packagePath: displayPath(packagePath) };
}

/** The declared range of one dependency in a package.json. */
function declaredRange(packageJsonPath, name) {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const range = pkg[field]?.[name];
    if (typeof range === 'string') return range;
  }
  return null;
}

/** One `interface X<...> { ... }` body, brace-matched, from a .d.ts file. */
function interfaceBlock(text, name) {
  const start = text.indexOf(`interface ${name}<`);
  assert.notEqual(start, -1, `${name} is not declared in the Angular types`);
  let depth = 0;
  const opening = text.indexOf('{', start);
  for (let index = opening; index < text.length; index += 1) {
    if (text[index] === '{') depth += 1;
    else if (text[index] === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(opening, index + 1);
    }
  }
  return fail(`${name} never closes`);
}

/** The declaration of one field inside an interface body, verbatim. */
function declarationLine(blockText, field) {
  const pattern = new RegExp(`^\\s+(?:readonly\\s+)?${field}\\??:`);
  for (const line of blockText.split('\n')) {
    if (pattern.test(line)) return line.trim();
  }
  return null;
}

/**
 * The runtime expression that derives the def's `onPush`, read out of the same
 * package. The join's answer depends on it, so the recording names it with its
 * source line.
 */
function onPushDerivation(typesPath) {
  const runtimePath = join(
    dirname(dirname(typesPath)),
    'fesm2022',
    '_debug_node-chunk.mjs',
  );
  assert.ok(
    existsSync(runtimePath),
    `${displayPath(runtimePath)} is missing — run npm ci at the package that owns it`,
  );
  const lines = readFileSync(runtimePath, 'utf8').split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.includes('onPush:') && line.includes('ChangeDetectionStrategy')) {
      return {
        source: displayPath(runtimePath),
        lineNumber: index + 1,
        declaration: line.trim(),
      };
    }
  }
  return fail(`${displayPath(runtimePath)} declares no onPush derivation`);
}

/**
 * Which of the five readiness fields, and of `changeDetection`, a version's
 * `ComponentDef`/`DirectiveDef` interface declares — read from the package
 * itself, so the answer is re-derivable and names its source.
 */
function defSurface(typesPath) {
  assert.ok(
    existsSync(typesPath),
    `${displayPath(typesPath)} is missing — run npm ci at the package that owns it`,
  );
  const text = readFileSync(typesPath, 'utf8');
  const bodies = [
    ['ComponentDef', interfaceBlock(text, 'ComponentDef')],
    ['DirectiveDef', interfaceBlock(text, 'DirectiveDef')],
  ];
  const fields = {};
  for (const field of [...FIVE_FIELDS, STRATEGY_FIELD]) {
    const declarations = [];
    for (const [name, body] of bodies) {
      const declaration = declarationLine(body, field);
      if (declaration !== null)
        declarations.push({ interface: name, declaration });
    }
    fields[field] = {
      present: declarations.length > 0,
      declarations,
    };
  }
  return {
    types: displayPath(typesPath),
    version: installedPackage(typesPath).version,
    fields,
    onPushDerivation: onPushDerivation(typesPath),
  };
}

/** The `ɵɵdefineComponent({ ... })` call the compiler emitted for one class. */
function defineComponentCall(bundleText, typeRef) {
  const at = bundleText.indexOf(`type: ${typeRef},`);
  if (at === -1) return null;
  const start = bundleText.lastIndexOf('defineComponent({', at);
  if (start === -1) return null;
  let depth = 0;
  const opening = bundleText.indexOf('{', start);
  for (let index = opening; index < bundleText.length; index += 1) {
    if (bundleText[index] === '{') depth += 1;
    else if (bundleText[index] === '}') {
      depth -= 1;
      if (depth === 0) return bundleText.slice(start, index + 2);
    }
  }
  return null;
}

/** What the compiler emitted for one subject: the def's input side, not its runtime. */
function compiledDef(bundleText, subject) {
  const candidates = [`_${subject.component}`, subject.component];
  for (const typeRef of candidates) {
    const call = defineComponentCall(bundleText, typeRef);
    if (call === null) continue;
    const entry = call.match(new RegExp(`${STRATEGY_FIELD}\\s*:\\s*[^,}]+`));
    return {
      typeRef,
      carriesChangeDetection: entry !== null,
      changeDetectionEntry: entry === null ? null : entry[0].trim(),
      call: call.replace(/\s+/g, ' ').slice(0, 240),
    };
  }
  return fail(
    `the development bundle carries no defineComponent call for ${subject.component}`,
  );
}

// ---------------------------------------------------------------- capture ----

function runBuild() {
  assert.ok(
    existsSync(NG_CLI),
    `the fixture must carry its own install for ${displayPath(NG_CLI)} — run npm --prefix spikes/ng222-app ci --include=dev`,
  );
  rmBuildOutput();
  const result = spawnSync(
    process.execPath,
    [
      NG_CLI,
      'build',
      '--configuration',
      'development',
      '--output-path',
      posixPath(relative(APP, OUTPUT_DIR)),
    ],
    { cwd: APP, encoding: 'utf8' },
  );
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  assert.equal(
    result.status,
    0,
    `ng build --configuration development of ${displayPath(APP)} must succeed: ${output}`,
  );
  assert.match(
    output,
    /Application bundle generation complete/,
    `the build must report a completed bundle: ${output}`,
  );
  assert.ok(
    existsSync(BROWSER_DIR),
    `the build must emit ${displayPath(BROWSER_DIR)}`,
  );
  const bundles = readdirSync(BROWSER_DIR)
    .filter((name) => name.endsWith('.js'))
    .sort();
  assert.ok(bundles.length > 0, 'the build must emit a browser bundle');
  return {
    bundles,
    text: bundles
      .map((name) => readFileSync(join(BROWSER_DIR, name), 'utf8'))
      .join('\n'),
  };
}

function rmBuildOutput() {
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
}

/** A static file server for the emitted bundle, falling back to index.html. */
function startStaticServer(directory) {
  const server = createServer((request, response) => {
    let path = '/';
    try {
      path = decodeURIComponent(
        new URL(request.url ?? '/', 'http://127.0.0.1').pathname,
      );
    } catch {
      path = '/';
    }
    let file = normalize(join(directory, path));
    if (!file.startsWith(normalize(directory))) {
      response.writeHead(403).end('forbidden');
      return;
    }
    if (!existsSync(file) || statSync(file).isDirectory()) {
      file = join(directory, 'index.html');
    }
    if (!existsSync(file)) {
      response.writeHead(404).end('not found');
      return;
    }
    response.writeHead(200, {
      'content-type':
        CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
    });
    response.end(readFileSync(file));
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
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

  const build = runBuild();
  const server = await startStaticServer(BROWSER_DIR);
  const port = server.address().port;
  const pageUrl = `http://127.0.0.1:${port}${ROUTE_PATH}`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const browserBuild = browser.version();
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => {
      pageErrors.push(`${error.name}: ${error.message}`);
    });
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(
      () => document.querySelectorAll('[ng-version]').length > 0,
      null,
      { timeout: 120000 },
    );
    await page.waitForFunction(
      () => !!window.ng && typeof window.ng.getComponent === 'function',
      null,
      { timeout: 60000 },
    );
    await page.waitForTimeout(1000);

    const captured = await page.evaluate(
      (wanted) => {
        const project = (value) => {
          if (value === null || value === undefined) return value;
          if (typeof value === 'function') return '[fn]';
          if (Array.isArray(value)) return value.map(project);
          if (typeof value === 'object') {
            const out = {};
            for (const key of Object.keys(value))
              out[key] = project(value[key]);
            return out;
          }
          return value;
        };
        const readSubject = (subject) => {
          const element = document.querySelector(subject.element);
          if (!element) return { found: false, element: subject.element };
          const instance = window.ng.getComponent(element);
          const def =
            instance && instance.constructor && instance.constructor.ɵcmp;
          if (!def) {
            return {
              found: true,
              element: subject.element,
              component: instance?.constructor?.name ?? null,
              def: null,
            };
          }
          const described = (name) => {
            const present = Object.prototype.hasOwnProperty.call(def, name);
            const value = present ? def[name] : undefined;
            return {
              present,
              type: present
                ? Array.isArray(value)
                  ? 'array'
                  : typeof value
                : null,
              value: present ? project(value) : null,
            };
          };
          const fields = {};
          for (const name of [
            'onPush',
            'signals',
            'standalone',
            'inputs',
            'inputConfig',
          ]) {
            fields[name] = described(name);
          }
          return {
            found: true,
            element: subject.element,
            component: instance.constructor.name,
            defPath: 'ng.getComponent(element).constructor.ɵcmp',
            defKeyCount: Object.keys(def).length,
            fields,
            strategyField: {
              name: 'changeDetection',
              ...described('changeDetection'),
            },
          };
        };
        const subjects = {};
        for (const subject of wanted) {
          subjects[subject.key] = readSubject(subject);
        }
        return {
          ngVersion:
            document
              .querySelector('[ng-version]')
              ?.getAttribute('ng-version') ?? null,
          headingText:
            document.querySelector('#onpush-ready-heading')?.textContent ??
            null,
          onPushLabelText:
            document.querySelector('#onpush-ready-label')?.textContent ?? null,
          counterText:
            document.querySelector('app-counter')?.textContent ?? null,
          subjects,
        };
      },
      SUBJECTS.map(({ key, element }) => ({ key, element })),
    );

    const fixturePackage = installedPackage(FIXTURE_CORE_TYPES);
    const panelPackage = installedPackage(PANEL_CORE_TYPES);
    const compiled = {};
    for (const subject of SUBJECTS) {
      compiled[subject.key] = compiledDef(build.text, subject);
    }
    const subjectDeclarations = {};
    for (const subject of SUBJECTS) {
      subjectDeclarations[subject.key] = {
        declaredStrategy: subject.declaredStrategy,
        source:
          subject.component === 'Counter'
            ? 'spikes/ng222-app/src/app/counter.ts'
            : 'spikes/ng222-app/src/app/onpush-ready.ts',
        compiled: compiled[subject.key],
        runtime: captured.subjects[subject.key],
      };
    }

    return {
      capturedAt: new Date().toISOString(),
      instance: 'headless',
      browser: `headless Playwright Chromium (build ${browserBuild})`,
      browserBuild,
      playwright: playwrightVersion,
      url: pageUrl,
      pageUrl,
      commands: {
        install: 'npm ci --include=dev',
        installApp: 'npm --prefix spikes/ng222-app ci --include=dev',
        build: BUILD_COMMAND,
        capture: CAPTURE_COMMAND,
        check: CHECK_COMMAND,
      },
      environment: {
        platform: process.platform,
        shell: 'cmd.exe',
        node: process.version,
      },
      angular: {
        runtimeReportedByThePage: captured.ngVersion,
        fixtureDependency: {
          declared: declaredRange(join(APP, 'package.json'), '@angular/core'),
          installed: fixturePackage.version,
          source: fixturePackage.packagePath,
        },
        panelDependency: {
          declared: declaredRange(join(ROOT, 'package.json'), '@angular/core'),
          installed: panelPackage.version,
          source: panelPackage.packagePath,
        },
        whichOneTheCaptureRead:
          'the runtime defs below were produced by @angular/core 22.2.2 while it served the fixture, which is the fixture dependency installed in spikes/ng222-app/node_modules; the panel ships 22.1.8 (declared ~22.1.0 in the repository package.json) and its def surface is read statically from node_modules/@angular/core. Both versions declare the same five fields and no changeDetection field, so the runtime read holds for the panel version too',
      },
      build: {
        configuration: 'development',
        command: BUILD_COMMAND,
        outputPath: displayPath(BROWSER_DIR),
        bundles: build.bundles,
      },
      fixture: {
        route: ROUTE_PATH,
        routeTable: 'spikes/ng222-app/src/app/app.routes.ts',
        page: 'spikes/ng222-app/src/app/onpush-ready-page.ts',
        onPushComponent: 'spikes/ng222-app/src/app/onpush-ready.ts',
        defaultComponent: 'spikes/ng222-app/src/app/counter.ts',
        defaultComponentWhy:
          'the root component renders app-counter on every route, so the page yields a pre-existing component that declares no strategy alongside the new subjects',
      },
      page: {
        pageLoads: 1,
        ngVersion: captured.ngVersion,
        headingText: captured.headingText,
        onPushLabelText: captured.onPushLabelText,
        counterText: captured.counterText,
        uncaughtPageErrors: pageErrors.length,
        pageErrorMessages: pageErrors,
      },
      answers: {
        fieldsPresentOnTheDef: FIVE_FIELDS.filter((field) =>
          SUBJECTS.every(
            (subject) =>
              captured.subjects[subject.key]?.fields?.[field]?.present === true,
          ),
        ),
        changeDetectionFieldPresent: SUBJECTS.some(
          (subject) =>
            captured.subjects[subject.key]?.strategyField?.present === true,
        ),
        onPushReports: Object.fromEntries(
          SUBJECTS.map((subject) => [
            subject.key,
            captured.subjects[subject.key]?.fields?.onPush?.value ?? null,
          ]),
        ),
        finding:
          'onPush, signals, standalone, inputs and inputConfig are on the def; changeDetection is not, at 22.1.8 and at 22.2.2. The def reports onPush true for the component that declares OnPush and for the component that declares no strategy, and false only for the component that declares ChangeDetectionStrategy.Default explicitly. That is what the compiler and the runtime do on this version: the compiler omits a changeDetection entry when the resolved strategy is OnPush or when none is declared, emits changeDetection: 1 for the explicitly declared Default alias, and the runtime derives onPush as changeDetection !== ChangeDetectionStrategy.Eager and initialises the view with the OnPush flags when onPush is true. A component that names no strategy is therefore OnPush since Angular 22, which is why the fixture pre-existing Counter — not the new component — was already the OnPush subject',
      },
      subjects: subjectDeclarations,
      surface: {
        panel: defSurface(PANEL_CORE_TYPES),
        fixture: defSurface(FIXTURE_CORE_TYPES),
      },
    };
  } finally {
    if (browser) await browser.close().catch(() => {});
    await new Promise((resolve) => server.close(resolve));
  }
}

// ---------------------------------------------------------------- validation ----

function validate(record) {
  checkStrings(
    record,
    [
      'capturedAt',
      'instance',
      'browser',
      'browserBuild',
      'playwright',
      'url',
      'pageUrl',
    ],
    'the recording',
  );
  if (record.instance !== 'headless') fail(`instance is ${record.instance}`);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(record.capturedAt)) {
    fail(`bad capturedAt ${record.capturedAt}`);
  }
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(record.browserBuild)) {
    fail(`bad browserBuild ${record.browserBuild}`);
  }
  if (!record.browser.includes(record.browserBuild)) {
    fail('the browser string does not name its build');
  }
  if (record.url !== record.pageUrl) fail('url/pageUrl disagree');
  if (!record.url.endsWith(ROUTE_PATH))
    fail(`url is not the route: ${record.url}`);

  checkStrings(
    record.commands,
    ['install', 'installApp', 'build', 'capture', 'check'],
    'commands',
  );
  if (!record.commands.build.includes('--configuration development')) {
    fail('the build command does not name the development configuration');
  }
  if (!record.commands.capture.includes('M035_CAPTURE=1')) {
    fail('the capture command does not name the arming variable');
  }
  checkStrings(
    record.environment,
    ['platform', 'shell', 'node'],
    'environment',
  );

  if (!isObject(record.angular)) fail('missing angular');
  checkStrings(
    record.angular,
    ['runtimeReportedByThePage', 'whichOneTheCaptureRead'],
    'angular',
  );
  for (const [label, side] of [
    ['fixtureDependency', record.angular.fixtureDependency],
    ['panelDependency', record.angular.panelDependency],
  ]) {
    checkStrings(side, ['declared', 'installed', 'source'], `angular.${label}`);
    if (!/^\d+\.\d+\.\d+/.test(side.installed)) {
      fail(`angular.${label}.installed is not a version: ${side.installed}`);
    }
  }
  if (
    record.angular.runtimeReportedByThePage !==
    record.angular.fixtureDependency.installed
  ) {
    fail(
      `the page reported ${record.angular.runtimeReportedByThePage} and the fixture installs ${record.angular.fixtureDependency.installed}`,
    );
  }

  if (!isObject(record.build)) fail('missing build');
  if (record.build.configuration !== 'development') fail('build configuration');
  if (
    !Array.isArray(record.build.bundles) ||
    record.build.bundles.length === 0
  ) {
    fail('build bundles empty');
  }

  if (!isObject(record.page)) fail('missing page');
  if (record.page.pageLoads !== 1) fail('pageLoads');
  if (record.page.ngVersion !== record.angular.runtimeReportedByThePage) {
    fail('page.ngVersion disagrees with the runtime version');
  }
  if (typeof record.page.headingText !== 'string') fail('page.headingText');
  if (record.page.uncaughtPageErrors !== 0) {
    fail(`the page threw ${record.page.uncaughtPageErrors} error(s)`);
  }

  for (const subject of SUBJECTS) {
    const entry = record.subjects?.[subject.key];
    if (!isObject(entry)) fail(`missing subjects.${subject.key}`);
    const where = `subjects.${subject.key}`;
    checkStrings(entry, ['declaredStrategy', 'source'], where);
    const runtime = entry.runtime;
    if (!isObject(runtime)) fail(`missing ${where}.runtime`);
    if (runtime.found !== true) fail(`${where} was not in the page`);
    if (runtime.element !== subject.element) {
      fail(`${where} read ${runtime.element}, not ${subject.element}`);
    }
    if (runtime.component.replace(/^_/, '') !== subject.component) {
      fail(
        `${where} read ${runtime.component}, not ${subject.component} (the compiled class binding carries a leading underscore)`,
      );
    }
    if (runtime.defPath !== 'ng.getComponent(element).constructor.ɵcmp') {
      fail(`${where} was not read off the component def`);
    }
    for (const field of FIVE_FIELDS) {
      const described = runtime.fields?.[field];
      if (!isObject(described)) fail(`missing ${where}.fields.${field}`);
      if (described.present !== true)
        fail(`${where}.fields.${field} is absent`);
      if (typeof described.type !== 'string') {
        fail(`${where}.fields.${field}.type is not a string`);
      }
    }
    if (runtime.fields.onPush.value !== subject.expectedOnPush) {
      fail(
        `${where} reports onPush ${JSON.stringify(runtime.fields.onPush.value)}, measured ${JSON.stringify(subject.expectedOnPush)}`,
      );
    }
    if (runtime.strategyField?.present !== false) {
      fail(`${where} reports a changeDetection field`);
    }
    if (runtime.strategyField.value !== null) {
      fail(`${where}.strategyField.value is not null`);
    }
    const compiled = entry.compiled;
    if (!isObject(compiled)) fail(`missing ${where}.compiled`);
    if (typeof compiled.call !== 'string' || compiled.call === '') {
      fail(`${where}.compiled.call is empty`);
    }
    if (
      compiled.carriesChangeDetection !== true &&
      compiled.carriesChangeDetection !== false
    ) {
      fail(`${where}.compiled.carriesChangeDetection is not a boolean`);
    }
  }

  if (!isObject(record.surface)) fail('missing surface');
  for (const [label, surface] of Object.entries(record.surface)) {
    const where = `surface.${label}`;
    if (!isObject(surface)) fail(`missing ${where}`);
    checkStrings(surface, ['types', 'version'], where);
    for (const field of FIVE_FIELDS) {
      if (surface.fields?.[field]?.present !== true) {
        fail(`${where} does not declare ${field}`);
      }
      const declarations = surface.fields[field].declarations;
      if (!Array.isArray(declarations) || declarations.length === 0) {
        fail(`${where}.${field} carries no declaration`);
      }
      for (const declaration of declarations) {
        if (
          !declaration.declaration.includes(field) ||
          !['ComponentDef', 'DirectiveDef'].includes(declaration.interface)
        ) {
          fail(`${where}.${field} declaration is unreadable`);
        }
      }
    }
    if (surface.fields?.[STRATEGY_FIELD]?.present !== false) {
      fail(`${where} declares ${STRATEGY_FIELD}`);
    }
    const derivation = surface.onPushDerivation;
    if (!isObject(derivation)) fail(`missing ${where}.onPushDerivation`);
    checkStrings(derivation, ['source', 'declaration'], where);
    if (!derivation.source.endsWith('_debug_node-chunk.mjs')) {
      fail(`${where}.onPushDerivation.source is not the runtime chunk`);
    }
    if (
      typeof derivation.lineNumber !== 'number' ||
      derivation.lineNumber < 1
    ) {
      fail(`${where}.onPushDerivation.lineNumber is not a line`);
    }
    if (!derivation.declaration.startsWith('onPush:')) {
      fail(`${where}.onPushDerivation.declaration is not the derivation`);
    }
  }

  if (!isObject(record.answers)) fail('missing answers');
  if (record.answers.changeDetectionFieldPresent !== false) {
    fail('answers claims a changeDetection field');
  }
  for (const field of FIVE_FIELDS) {
    if (!record.answers.fieldsPresentOnTheDef?.includes(field)) {
      fail(`answers.fieldsPresentOnTheDef omits ${field}`);
    }
  }
  if (record.answers.fieldsPresentOnTheDef.length !== FIVE_FIELDS.length) {
    fail('answers.fieldsPresentOnTheDef holds more than the five fields');
  }
  return true;
}

function loadRecord(path = RECORD_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function clone(record) {
  return JSON.parse(JSON.stringify(record));
}

// ---------------------------------------------------------------- read-only checks ----

test('the recording validates against its own subjects, versions and surface', () => {
  const record = loadRecord();
  assert.doesNotThrow(() => validate(record));
});

test('the recording names the Angular versions installed now, so a bump reddens', () => {
  const record = loadRecord();
  assert.equal(
    record.angular.fixtureDependency.installed,
    installedPackage(FIXTURE_CORE_TYPES).version,
    'the fixture install moved since the capture',
  );
  assert.equal(
    record.angular.panelDependency.installed,
    installedPackage(PANEL_CORE_TYPES).version,
    'the panel install moved since the capture',
  );
  assert.equal(
    record.angular.runtimeReportedByThePage,
    installedPackage(FIXTURE_CORE_TYPES).version,
    'the runtime version the page reported is not the installed fixture version',
  );
});

test('the recorded def surface agrees with the installed type declarations', () => {
  const record = loadRecord();
  assert.deepEqual(
    record.surface.panel,
    defSurface(PANEL_CORE_TYPES),
    'the panel version surface moved',
  );
  assert.deepEqual(
    record.surface.fixture,
    defSurface(FIXTURE_CORE_TYPES),
    'the fixture version surface moved',
  );
});

test('both installed versions derive the def onPush from changeDetection', () => {
  const record = loadRecord();
  for (const label of ['panel', 'fixture']) {
    const derivation = record.surface[label].onPushDerivation;
    assert.match(
      derivation.declaration,
      /^onPush:\s*componentDefinition\.changeDetection\s*!==\s*ChangeDetectionStrategy\.Eager/,
      `${label} derives onPush some other way`,
    );
  }
});

test('the five fields are on every def and changeDetection is on none', () => {
  const record = loadRecord();
  for (const subject of SUBJECTS) {
    const runtime = record.subjects[subject.key].runtime;
    assert.deepEqual(
      FIVE_FIELDS.filter((field) => runtime.fields[field].present),
      FIVE_FIELDS,
      `${subject.component} does not carry all five fields`,
    );
    assert.equal(
      runtime.strategyField.present,
      false,
      `${subject.component} carries a changeDetection field`,
    );
    assert.ok(
      runtime.defKeyCount > FIVE_FIELDS.length,
      `${subject.component} reported only the five fields`,
    );
  }
});

// Measured on 22.2.2, against the expectation the fixture was written for. The
// runtime derives `onPush: componentDefinition.changeDetection !== Eager`, the
// compiler emits a `changeDetection` entry only for a resolved strategy that is
// not OnPush, and since Angular 22 a component that names no strategy resolves
// to OnPush. So the declared-OnPush subject and the subject that names no
// strategy both report true, and only the explicitly declared Default subject —
// the deprecated eager alias — reports false. The pinned values are what the
// version does; a re-capture that changes them must be re-baselined, never
// widened.
test('the defs report onPush true, false, true for OnPush, declared Default and none', () => {
  const record = loadRecord();
  const reported = {};
  for (const subject of SUBJECTS) {
    reported[subject.key] =
      record.subjects[subject.key].runtime.fields.onPush.value;
  }
  assert.deepEqual(reported, {
    onPushReady: true,
    declaredDefault: false,
    counter: true,
  });
});

test('the compiled defs carry changeDetection only for the declared Default subject', () => {
  const record = loadRecord();
  const entries = {};
  for (const subject of SUBJECTS) {
    const compiled = record.subjects[subject.key].compiled;
    entries[subject.key] = compiled.carriesChangeDetection
      ? compiled.changeDetectionEntry
      : null;
    assert.ok(
      compiled.call.includes(`type: ${compiled.typeRef},`),
      `${subject.component}'s recorded call is not its own`,
    );
  }
  assert.deepEqual(entries, {
    onPushReady: null,
    declaredDefault: 'changeDetection: 1',
    counter: null,
  });
});

test('signals reports false and inputConfig marks the signal input on every subject', () => {
  const record = loadRecord();
  for (const subject of SUBJECTS) {
    const fields = record.subjects[subject.key].runtime.fields;
    assert.equal(fields.signals.value, false, `${subject.component}.signals`);
    assert.equal(fields.signals.type, 'boolean');
    assert.equal(
      fields.standalone.value,
      true,
      `${subject.component}.standalone`,
    );
    const inputs = fields.inputs.value;
    const inputConfig = fields.inputConfig.value;
    const names = Object.keys(inputConfig ?? {});
    assert.ok(names.length > 0, `${subject.component} declared no input`);
    for (const name of names) {
      const flags = inputConfig[name];
      assert.ok(
        Array.isArray(flags),
        `${subject.component}.inputConfig.${name}`,
      );
      assert.equal(
        flags[0],
        1,
        `${subject.component}.${name} is not SignalBased`,
      );
      assert.ok(
        Object.prototype.hasOwnProperty.call(inputs, name),
        `${subject.component}.inputs omits ${name}`,
      );
    }
  }
});

test('PRECONDITION: the fixture route is registered and the page hosts the OnPush subject', () => {
  const routes = readFileSync(ROUTES_PATH, 'utf8');
  assert.ok(existsSync(COMPONENT_PATH), 'the OnPush component is missing');
  assert.ok(existsSync(PAGE_PATH), 'the fixture page is missing');
  assert.ok(
    routes.includes(`path: '${ROUTE_PATH.slice(1)}'`),
    'the onpush-ready route is not in the route table',
  );
  assert.ok(
    routes.includes('OnPushReadyPage'),
    'OnPushReadyPage is not routed',
  );
  const component = readFileSync(COMPONENT_PATH, 'utf8');
  assert.match(
    component,
    /changeDetection:\s*ChangeDetectionStrategy\.OnPush/,
    'onpush-ready.ts does not declare OnPush',
  );
  const page = readFileSync(PAGE_PATH, 'utf8');
  assert.ok(
    page.includes('<app-onpush-ready'),
    'the page does not host app-onpush-ready',
  );
});

test('the only write in this file sits behind the M035_CAPTURE gate', () => {
  const source = readFileSync(SELF_PATH, 'utf8');
  // Assembled so this check does not count its own needle as a write.
  const call = ['writeFileSync', '('].join('');
  const gate = source.indexOf("process.env.M035_CAPTURE === '1'");
  const writes = source.split(call).length - 1;
  assert.notEqual(gate, -1, 'the arming gate is not in this file');
  assert.equal(writes, 1, 'this file does not write exactly once');
  assert.ok(gate < source.indexOf(call), 'the write is not behind the gate');
});

test('held-out: a recording that drops a field reddens', () => {
  const mutant = clone(loadRecord());
  mutant.subjects.counter.runtime.fields.onPush.present = false;
  assert.throws(() => validate(mutant), /fields\.onPush is absent/);
});

test('held-out: a recording that claims onPush false for the default subject reddens', () => {
  const mutant = clone(loadRecord());
  mutant.subjects.counter.runtime.fields.onPush.value = false;
  assert.throws(() => validate(mutant), /counter reports onPush false/);
});

test('held-out: a recording that claims a changeDetection field reddens', () => {
  const mutant = clone(loadRecord());
  mutant.subjects.onPushReady.runtime.strategyField = {
    name: 'changeDetection',
    present: true,
    type: 'number',
    value: 0,
  };
  assert.throws(() => validate(mutant), /reports a changeDetection field/);
});

test('held-out: a recording whose surface claims changeDetection reddens', () => {
  const mutant = clone(loadRecord());
  mutant.surface.panel.fields.changeDetection = {
    present: true,
    declarations: [
      {
        interface: 'ComponentDef',
        declaration: 'readonly changeDetection: number;',
      },
    ],
  };
  assert.throws(
    () => validate(mutant),
    /surface\.panel declares changeDetection/,
  );
});

test('held-out: a recording that names the wrong runtime version reddens', () => {
  const mutant = clone(loadRecord());
  mutant.angular.runtimeReportedByThePage = '0.0.0';
  assert.throws(() => validate(mutant), /the page reported 0\.0\.0/);
});

// ---------------------------------------------------------------- opt-in capture ----

if (process.env.M035_CAPTURE === '1') {
  test('capture the two defs from a development build in headless Chromium', async (t) => {
    const record = await runCapture();
    validate(record);
    writeFileSync(RECORD_PATH, `${JSON.stringify(record, null, 2)}\n`);
    for (const subject of SUBJECTS) {
      const runtime = record.subjects[subject.key].runtime;
      t.diagnostic(
        `${subject.component}: onPush ${runtime.fields.onPush.value}, signals ${runtime.fields.signals.value}, standalone ${runtime.fields.standalone.value}, changeDetection ${runtime.strategyField.present}, compiled changeDetection ${JSON.stringify(record.subjects[subject.key].compiled.changeDetectionEntry)}`,
      );
    }
    t.diagnostic(
      `angular runtime ${record.angular.runtimeReportedByThePage} (fixture), panel ${record.angular.panelDependency.installed}`,
    );
  });
}
