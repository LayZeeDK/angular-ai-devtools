import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import ts from 'typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const routesPath = join(repoRoot, 'spikes/ng222-app/src/app/app.routes.ts');
const pagePath = join(
  repoRoot,
  'spikes/ng222-app/src/app/after-render-page.ts',
);

// The behavioural proof runs the component's own `readTargetWidth` out of its real
// TypeScript source. Angular is replaced with inert stubs because the subject is
// the method body (resolve the child, read offsetWidth) and its afterNextRender
// call site, not the framework: no browser, no zone, no TestBed.
function loadAfterRenderPageClass(element, hookCalls) {
  const source = readFileSync(pagePath, 'utf8');
  const { outputText, diagnostics } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      experimentalDecorators: true,
      isolatedModules: true,
    },
    fileName: pagePath,
  });
  assert.deepEqual(
    (diagnostics ?? []).map((d) => d.messageText),
    [],
    'after-render-page.ts must transpile without diagnostics',
  );

  const angularStub = {
    Component: () => (target) => target,
    ElementRef: class ElementRef {},
    afterNextRender: (callback) => {
      hookCalls.push(callback);
    },
    viewChild: { required: () => () => ({ nativeElement: element }) },
  };
  const requireStub = (specifier) => {
    if (specifier === '@angular/core') return angularStub;
    throw new Error(
      `after-render-page.ts imported an unexpected module: ${specifier}`,
    );
  };

  const moduleRecord = { exports: {} };
  new Function('exports', 'require', 'module', outputText)(
    moduleRecord.exports,
    requireStub,
    moduleRecord,
  );

  const PageClass = moduleRecord.exports.AfterRenderPage;
  assert.equal(
    typeof PageClass,
    'function',
    'after-render-page.ts must export AfterRenderPage',
  );
  return PageClass;
}

function instantiatePage(element) {
  const hookCalls = [];
  const PageClass = loadAfterRenderPageClass(element, hookCalls);
  return { page: new PageClass(), hookCalls };
}

test('readTargetWidth returns 0 and does not throw when the element has no box yet', () => {
  const { page } = instantiatePage({ offsetWidth: 0 });
  let width;
  assert.doesNotThrow(() => {
    width = page.readTargetWidth();
  }, 'readTargetWidth threw on an element whose offsetWidth is 0');
  assert.equal(width, 0);
});

test('readTargetWidth returns the element value 640, not a constant', () => {
  const { page } = instantiatePage({ offsetWidth: 640 });
  assert.equal(page.readTargetWidth(), 640);
});

test('the afterNextRender callback reads offsetWidth from the element without throwing', () => {
  let reads = 0;
  const element = {
    get offsetWidth() {
      reads += 1;
      return 0;
    },
  };
  const { hookCalls } = instantiatePage(element);
  assert.equal(
    hookCalls.length,
    1,
    'the constructor must register exactly one afterNextRender hook',
  );
  assert.doesNotThrow(() => hookCalls[0](), 'the after-render read threw');
  assert.equal(
    reads,
    1,
    'the after-render hook must read offsetWidth exactly once',
  );
});

test('PRECONDITION: the after-render route is registered with AfterRenderPage', () => {
  const routesSrc = readFileSync(routesPath, 'utf8');
  assert.ok(
    routesSrc.includes("path: 'after-render'"),
    'after-render route not registered',
  );
  assert.ok(
    routesSrc.includes('AfterRenderPage'),
    'AfterRenderPage not imported/used',
  );
});

// The route table this fixture lives in, in declaration order. M032 T001 added
// the `lint-observability` measurement page as the eighth route; M033 T001
// added `router-lint` as the ninth; M034 T001 added `legacy-module` as the
// tenth; M035 T001 added `onpush-ready` as the eleventh; M036 T001 added
// `resource-states` as the twelfth; M038 T001 added `linked-state` as the
// thirteenth, which is why the count moved from eighteen to nineteen. Pinning
// the whole table keeps a route from being dropped, reordered or shadowed
// silently while the fixture above is what the other suites navigate.
test('PRECONDITION: the route table declares all nineteen routes in order', () => {
  const routesSrc = readFileSync(routesPath, 'utf8');
  const paths = [...routesSrc.matchAll(/path:\s*'([^']+)'/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(paths, [
    'stale-view',
    'stale-view-deferred',
    'components',
    'image-budget',
    'after-render',
    'trust-bypass',
    'field-form',
    'lint-observability',
    'router-lint',
    'legacy-module',
    'onpush-ready',
    'resource-states',
    'linked-state',
    'redirect',
    'landing',
    'gated',
    'lazy',
    'loop-a',
    'loop-b',
  ]);
});

test('PRECONDITION: the fixture adds no profiler instrumentation', () => {
  const routesSrc = readFileSync(routesPath, 'utf8');
  const pageSrc = readFileSync(pagePath, 'utf8');
  for (const [label, src] of [
    ['app.routes.ts', routesSrc],
    ['after-render-page.ts', pageSrc],
  ]) {
    assert.ok(!src.includes('setProfiler'), `${label} contains setProfiler`);
    assert.ok(!src.includes('ɵsetProfiler'), `${label} contains ɵsetProfiler`);
    assert.ok(!src.includes('subscribe('), `${label} contains a subscriber`);
  }
});
