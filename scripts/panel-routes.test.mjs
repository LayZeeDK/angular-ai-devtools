import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const ROUTES = join(
  ROOT,
  'apps',
  'angular-ai-devtools',
  'src',
  'app',
  'app.routes.ts',
);

/** Every surface the panel's route table declares, in table order. Each one is a route a user
 * clicks, so a surface that loses its path, its component or its own name in route data fails E1
 * by that name rather than as a smaller count. */
const surfaces = [
  'after-render',
  'sanitizer',
  'redirect',
  'fields',
  'lint',
  'router',
  'legacy',
  'onpush',
  'resource',
  'linked-state',
  'render-phase',
  'performance',
  'navigation',
  'error-boundary',
  'stability',
  'console-read',
  'components',
  'copy-check',
];

function routeBlock(source, surface) {
  const needle = "path: '" + surface + "'";
  const at = source.indexOf(needle);
  if (at < 0) return null;
  const next = source.indexOf("path: '", at + needle.length);
  return source.slice(at, next < 0 ? undefined : next);
}

/** The identifier every panel-demo route installs. */
const SHARED_LOADER = 'loadPanelDemo';

/** The definition that identifier must have: the demo module imported dynamically, resolving its
 * component out of the module it just loaded. */
const SHARED_LOADER_DEFINITION =
  /const\s+loadPanelDemo\s*=\s*\(\)\s*=>\s*import\('\.\/panel-demo'\)\.then\(\s*\(\w+\)\s*=>\s*\w+\.PanelDemoComponent,?\s*\)/;

/** The dynamic import the shared loader must be the only site of. */
const DEMO_IMPORT = /import\('\.\/panel-demo'\)/g;

/**
 * E1's first half, at the route entries: every named surface still has a route, that route still
 * installs something through `loadComponent` rather than a surface function, and it still names its
 * own surface in route data.
 *
 * This half deliberately says nothing about *which* loader a block installs. Which loader it
 * installs is `assertOneSharedLoader`'s property, one level down, and separating the two is what
 * lets a route that kept its own copy of the closure fail the duplication count by name instead of
 * vanishing into a per-surface list.
 */
function assertSurfaceRoutes(source) {
  for (const surface of surfaces) {
    const block = routeBlock(source, surface);
    assert.ok(block, 'route ' + surface + ' must exist');
    assert.ok(
      !block.includes('as any)'),
      'route ' +
        surface +
        ' must not install a surface function as a component: ' +
        block,
    );
    assert.ok(
      block.includes('loadComponent:'),
      'route ' +
        surface +
        ' must install a component through loadComponent: ' +
        block,
    );
    assert.ok(
      block.includes("surface: '" + surface + "'"),
      'route ' + surface + ' must name its surface in route data: ' + block,
    );
  }
}

/**
 * E1's second half, one level below the route entries: the closure every panel-demo route installs
 * is defined exactly once above the table, that one definition resolves `PanelDemoComponent`
 * through a dynamic import of the demo module, and the demo module is imported in exactly one
 * place.
 *
 * That is the same property the pin used to read off each route block — a route installs a
 * component and never a surface function — proven where the bytes now live instead of where they
 * used to be repeated. It is also strictly stronger: a route carrying its own copy of the closure
 * duplicates the import, a second definition duplicates the loader, and a component-less loader
 * installs nothing, and each of those reddens here by name.
 */
function assertOneSharedLoader(source) {
  const definitions = [...source.matchAll(/const\s+loadPanelDemo\s*=/g)];
  assert.equal(
    definitions.length,
    1,
    'the shared panel loader ' +
      SHARED_LOADER +
      ' must be defined exactly once above the route table; found ' +
      definitions.length +
      ' definitions, and a second definition of the same lazy closure is a second copy of its ' +
      'bytes in the eager bundle',
  );
  const definition = SHARED_LOADER_DEFINITION.exec(source);
  assert.ok(
    definition,
    'the ' +
      SHARED_LOADER +
      ' definition must import the demo module dynamically and resolve PanelDemoComponent from ' +
      'it; the definition reads: ' +
      source.slice(definitions[0].index, definitions[0].index + 160),
  );
  const demoImports = [...source.matchAll(DEMO_IMPORT)];
  assert.equal(
    demoImports.length,
    1,
    "import('./panel-demo') must appear exactly once, in the shared loader; the table carries " +
      demoImports.length +
      ' copies of that dynamic import, so the same closure is duplicated once per route, and ' +
      'the duplicated bytes are what the panel initial-bundle baseline cannot pay for',
  );
  const installed = [...source.matchAll(/loadComponent:\s*loadPanelDemo\b/g)]
    .length;
  const panelRoutes = [...source.matchAll(/data:\s*\{\s*surface:/g)].length;
  assert.equal(
    installed,
    panelRoutes,
    installed +
      ' of ' +
      panelRoutes +
      ' panel-demo routes install the shared loader ' +
      SHARED_LOADER +
      '; every one of them must reference it rather than carry a closure of its own',
  );
}

test('E1: a panel route installs a component through the one shared loader, never a surface function', () => {
  const source = readFileSync(ROUTES, 'utf8');

  // Green first, both halves, on the real table.
  assertSurfaceRoutes(source);
  assertOneSharedLoader(source);

  const definition = SHARED_LOADER_DEFINITION.exec(source);
  assert.ok(
    definition,
    'the pin must be able to find the shared loader definition it mutates',
  );

  // Mutant: one route keeps its own copy of the closure instead of the shared loader. This is the
  // shape the thirteenth entry had. The per-surface half must stay green — the entry is intact —
  // and the duplication half must fail, naming the repeated dynamic import.
  const ownClosure = source.replace(
    "    path: 'navigation',\n    loadComponent: loadPanelDemo,",
    "    path: 'navigation',\n    loadComponent: () =>\n      import('./panel-demo').then((m) => m.PanelDemoComponent),",
  );
  assert.notEqual(
    ownClosure,
    source,
    'the own-closure mutant must change app.routes.ts',
  );
  assert.doesNotThrow(
    () => assertSurfaceRoutes(ownClosure),
    'a route with its own closure keeps every surface entry intact, so the per-surface half must not redden for it',
  );
  assert.throws(
    () => assertOneSharedLoader(ownClosure),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        "import('./panel-demo') must appear exactly once",
      ),
    'a route carrying its own closure must fail the duplication check naming the repeated dynamic import',
  );

  // Mutant: a surface dropped from the shared loader — the route entry stays, its loader does not.
  // The pin must fail naming the surface it left behind, not merely report a smaller count.
  const withoutShared = source.replace(
    "    path: 'linked-state',\n    loadComponent: loadPanelDemo,\n",
    "    path: 'linked-state',\n",
  );
  assert.notEqual(
    withoutShared,
    source,
    'the dropped-loader mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutShared),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'route linked-state must install a component through loadComponent',
      ),
    'a route no longer installing the shared loader must fail naming the surface linked-state',
  );

  // Mutant: a route pointed at a surface function instead of a component — the failure the
  // original text pin caught, still caught here by name.
  const surfaceFunction = source.replace(
    "    path: 'navigation',\n    loadComponent: loadPanelDemo,",
    "    path: 'navigation',\n    loadComponent: () =>\n      import('./panel-navigation').then((m) => m.navigationPanel as any),",
  );
  assert.notEqual(
    surfaceFunction,
    source,
    'the surface-function mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(surfaceFunction),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'route navigation must not install a surface function as a component',
      ),
    'a route pointed at a surface function must fail naming the surface navigation',
  );

  // Mutant: a surface whose route is gone from the table entirely — the pin must name it.
  const renamedPath = source.replace(
    "    path: 'navigation',",
    "    path: 'navigation-renamed',",
  );
  assert.notEqual(
    renamedPath,
    source,
    'the renamed-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(renamedPath),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route navigation must exist'),
    'a surface without its route must fail naming the missing surface',
  );

  // Mutant: a second definition of the shared loader — the same closure emitted twice.
  const secondDefinition = source.replace(
    definition[0],
    definition[0] + '\n' + definition[0],
  );
  assert.notEqual(
    secondDefinition,
    source,
    'the second-definition mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertOneSharedLoader(secondDefinition),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'must be defined exactly once above the route table',
      ),
    'a second definition of the shared loader must fail naming the duplicate',
  );

  // Mutant: the loader imports the demo but resolves no component out of it, so a route would
  // install a module rather than a component.
  const componentless = source.replace(
    definition[0],
    "const loadPanelDemo = () => import('./panel-demo');",
  );
  assert.notEqual(
    componentless,
    source,
    'the component-less mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertOneSharedLoader(componentless),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('must import the demo module dynamically'),
    'a loader that resolves no component must fail naming the property it lost',
  );

  // Mutant: a route that keeps its loader but drops the surface it names in route data.
  const unnamedSurface = source.replace(
    "    data: { surface: 'performance' },\n",
    '',
  );
  assert.notEqual(
    unnamedSurface,
    source,
    'the unnamed-surface mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(unnamedSurface),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'route performance must name its surface in route data',
      ),
    'a route that no longer names its surface must fail naming it',
  );

  // Mutant: the M042 surface's route entry removed from the table entirely. This is the mutation the
  // task's own red-then-green proof applies to `app.routes.ts`, replayed here so the pin carries it
  // rather than relying on a log: the check must name the surface whose entry is gone.
  const withoutErrorBoundary = source.replace(
    "  {\n    path: 'error-boundary',\n    loadComponent: loadPanelDemo,\n    data: { surface: 'error-boundary' },\n  },\n",
    '',
  );
  assert.notEqual(
    withoutErrorBoundary,
    source,
    'the removed-error-boundary-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutErrorBoundary),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route error-boundary must exist'),
    'a table without the error-boundary route must fail naming the missing surface',
  );

  // Mutant: the M043 surface's route entry removed from the table entirely. This is the mutation the
  // task's own red-then-green proof applies to `app.routes.ts`, replayed here so the pin carries it
  // rather than relying on a log: the check must name the surface whose entry is gone.
  const withoutStability = source.replace(
    "  {\n    path: 'stability',\n    loadComponent: loadPanelDemo,\n    data: { surface: 'stability' },\n  },\n",
    '',
  );
  assert.notEqual(
    withoutStability,
    source,
    'the removed-stability-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutStability),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route stability must exist'),
    'a table without the stability route must fail naming the missing surface',
  );

  // Mutant: the M046 surface's route entry removed from the table entirely. It is the route this task
  // appends last, so the per-surface half must name it rather than pass on the older surfaces alone.
  const withoutConsoleRead = source.replace(
    "  {\n    path: 'console-read',\n    loadComponent: loadPanelDemo,\n    data: { surface: 'console-read' },\n  },\n",
    '',
  );
  assert.notEqual(
    withoutConsoleRead,
    source,
    'the removed-console-read-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutConsoleRead),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route console-read must exist'),
    'a table without the console-read route must fail naming the missing surface',
  );

  // Mutant: the M047 surface's route entry removed from the table entirely. It is the route this
  // task appends last, so the per-surface half must name it rather than pass on the older surfaces
  // alone.
  const withoutComponents = source.replace(
    "  {\n    path: 'components',\n    loadComponent: loadPanelDemo,\n    data: { surface: 'components' },\n  },\n",
    '',
  );
  assert.notEqual(
    withoutComponents,
    source,
    'the removed-components-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutComponents),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route components must exist'),
    'a table without the components route must fail naming the missing surface',
  );

  // Mutant: the M048 surface's route entry removed from the table entirely. It is the route this
  // task appends last, so the per-surface half must name it rather than pass on the older surfaces
  // alone.
  const withoutCopyCheck = source.replace(
    "  {\n    path: 'copy-check',\n    loadComponent: loadPanelDemo,\n    data: { surface: 'copy-check' },\n  },\n",
    '',
  );
  assert.notEqual(
    withoutCopyCheck,
    source,
    'the removed-copy-check-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutCopyCheck),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route copy-check must exist'),
    'a table without the copy-check route must fail naming the missing surface',
  );
});

test('E2: the surface functions are still exported for their suites', () => {
  const files = {
    'after-render': ['after-render', 'afterRenderPanel'],
    sanitizer: ['panel-sanitizer', 'sanitizerPanel'],
    redirect: ['panel-redirect', 'redirectPanel'],
    fields: ['panel-fields', 'fieldsPanel'],
    legacy: ['panel-legacy', 'legacyPanel'],
    onpush: ['panel-onpush', 'onpushPanel'],
    resource: ['panel-resource', 'resourcePanel'],
    'linked-state': ['panel-linked-state', 'linkedStatePanel'],
    'render-phase': ['panel-render-phase', 'renderPhasePanel'],
    performance: ['panel-performance', 'performancePanel'],
    navigation: ['panel-navigation', 'navigationPanel'],
    'error-boundary': ['panel-error-boundary', 'errorBoundaryPanel'],
    stability: ['panel-stability', 'stabilityPanel'],
    'console-read': ['panel-copy-to-agent', 'consoleReadPanel'],
    components: ['panel-components', 'componentsPanel'],
    'copy-check': ['panel-copy-check', 'copyCheckPanel'],
  };
  for (const [surface, [base, exportName]] of Object.entries(files)) {
    const source = readFileSync(
      join(ROOT, 'apps', 'angular-ai-devtools', 'src', 'app', base + '.ts'),
      'utf8',
    );
    const exported =
      source.includes('export const ' + exportName) ||
      source.includes('export function ' + exportName) ||
      source.includes('export default ' + exportName);
    assert.ok(
      exported,
      base + ' must still export ' + exportName + ' for ' + surface,
    );
  }
});

test('E3: the demo module renders the surface text it is handed', () => {
  const source = readFileSync(
    join(ROOT, 'apps', 'angular-ai-devtools', 'src', 'app', 'panel-demo.ts'),
    'utf8',
  );
  assert.ok(
    source.includes('@for (line of lines()'),
    'the demo must render the surface lines',
  );
  for (const call of [
    'fieldsPanel(',
    'redirectPanel(',
    'sanitizerPanel(',
    'afterRenderPanel(',
    'onpushPanel(',
    'resourcePanel(',
    'linkedStatePanel(',
    'renderPhasePanel(',
    'performancePanel(',
    'navigationPanel(',
    'errorBoundaryPanel(',
    'stabilityPanel(',
    'consoleReadPanel(',
    'componentsPanel(',
    'copyCheckPanel(',
  ]) {
    assert.ok(
      !source.includes(call),
      'the demo calls no surface directly — ' +
        call +
        ' must arrive through its own loader',
    );
  }
});

function declaredSurfaces(routesSource) {
  const out = [];
  const re = /surface:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(routesSource)) !== null) out.push(m[1]);
  return out;
}

function loaderKeys(demoSource) {
  const start = demoSource.indexOf('const LOADERS');
  const end = demoSource.indexOf('const FACTS', start);
  assert.ok(start >= 0 && end > start, 'panel-demo.ts must define LOADERS');
  const block = demoSource.slice(start, end);
  const out = new Set();
  const quoted = /'([^']+)'\s*:/g;
  const ident = /^\s*([A-Za-z_$][\w$]*)\s*:/;
  let m;
  while ((m = quoted.exec(block)) !== null) out.add(m[1]);
  for (const line of block.split('\n')) {
    const im = ident.exec(line);
    if (im && !line.includes('const LOADERS') && im[1] !== 'string')
      out.add(im[1]);
  }
  return out;
}

function assertAllSurfacesHaveLoaders(routesSource, demoSource) {
  const missing = declaredSurfaces(routesSource).filter(
    (s) => !loaderKeys(demoSource).has(s),
  );
  assert.deepEqual(
    missing,
    [],
    'every app.routes.ts surface must have a panel-demo LOADERS key; missing: ' +
      missing.join(', '),
  );
}

test('E4: every declared route surface has a panel-demo LOADERS key', () => {
  const routesSource = readFileSync(ROUTES, 'utf8');
  const demoSource = readFileSync(
    join(ROOT, 'apps', 'angular-ai-devtools', 'src', 'app', 'panel-demo.ts'),
    'utf8',
  );
  // Mutant discipline: passes on the real files first.
  assertAllSurfacesHaveLoaders(routesSource, demoSource);

  // Mutant: remove the lint key from LOADERS.
  const mutated = demoSource.replace(
    "  lint: () => import('./panel-lint') as never,\n",
    '',
  );
  assert.notEqual(mutated, demoSource, 'mutant must change panel-demo.ts');
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, mutated),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('lint'),
    'removing the lint loader must fail naming the missing surface lint',
  );

  // Mutant: remove the legacy key from LOADERS. The M034 route is the one this task adds, so the
  // check must name it when its loader is gone rather than pass on the older surfaces alone.
  const withoutLegacy = demoSource.replace(
    "  legacy: () => import('./panel-legacy') as never,\n",
    '',
  );
  assert.notEqual(
    withoutLegacy,
    demoSource,
    'the legacy mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutLegacy),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('legacy'),
    'removing the legacy loader must fail naming the missing surface legacy',
  );

  // Mutant: remove the onpush key from LOADERS. The M035 route is the one this task adds, so the
  // check must name it when its loader is gone rather than pass on the surfaces before it.
  const withoutOnpush = demoSource.replace(
    "  onpush: () => import('./panel-onpush') as never,\n",
    '',
  );
  assert.notEqual(
    withoutOnpush,
    demoSource,
    'the onpush mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutOnpush),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('onpush'),
    'removing the onpush loader must fail naming the missing surface onpush',
  );

  // Mutant: remove the resource key from LOADERS. The M036 route is the one this task adds, so the
  // check must name it when its loader is gone rather than pass on the surfaces before it (AC3).
  const withoutResource = demoSource.replace(
    "  resource: () => import('./panel-resource') as never,\n",
    '',
  );
  assert.notEqual(
    withoutResource,
    demoSource,
    'the resource mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutResource),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('resource'),
    'removing the resource loader must fail naming the missing surface resource',
  );

  // Mutant: remove the linked-state key from LOADERS. The M038 route is the one this task adds, so
  // the check must name it when its loader is gone rather than pass on the surfaces before it (AC3).
  // It is also the one key in the map that is quoted, so a parse that only read bare identifiers
  // would pass this pin's first half and never see the surface it dropped.
  const withoutLinkedState = demoSource.replace(
    "  'linked-state': () => import('./panel-linked-state') as never,\n",
    '',
  );
  assert.notEqual(
    withoutLinkedState,
    demoSource,
    'the linked-state mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutLinkedState),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('linked-state'),
    'removing the linked-state loader must fail naming the missing surface linked-state',
  );

  // Mutant: remove the render-phase key from LOADERS. The M039 route is the one this task adds, so
  // the check must name it when its loader is gone rather than pass on the surfaces before it. It is
  // the second quoted key in the map, so a parse that read only bare identifiers would pass this
  // pin's first half and never see the surface it dropped either.
  const withoutRenderPhase = demoSource.replace(
    "  'render-phase': () => import('./panel-render-phase') as never,\n",
    '',
  );
  assert.notEqual(
    withoutRenderPhase,
    demoSource,
    'the render-phase mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutRenderPhase),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('render-phase'),
    'removing the render-phase loader must fail naming the missing surface render-phase',
  );

  // Mutant: remove the performance key from LOADERS. The M040 route is the one this task adds, so
  // the check must name it when its loader is gone rather than pass on the surfaces before it. It is
  // a bare identifier key, which is the shape a parse that only read quoted keys would miss.
  const withoutPerformance = demoSource.replace(
    "  performance: () => import('./panel-performance') as never,\n",
    '',
  );
  assert.notEqual(
    withoutPerformance,
    demoSource,
    'the performance mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutPerformance),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('performance'),
    'removing the performance loader must fail naming the missing surface performance',
  );

  // Mutant: remove the navigation key from LOADERS. The M041 route is the one this task adds, so the
  // check must name it when its loader is gone rather than pass on the surfaces before it. It is a
  // bare identifier key whose import is the only reference to `panel-navigation.ts`, so a route that
  // dropped it would leave the surface unreachable while every earlier surface still loaded.
  const withoutNavigation = demoSource.replace(
    "  navigation: () => import('./panel-navigation') as never,\n",
    '',
  );
  assert.notEqual(
    withoutNavigation,
    demoSource,
    'the navigation mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutNavigation),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('navigation'),
    'removing the navigation loader must fail naming the missing surface navigation',
  );

  // Mutant: remove the error-boundary key from LOADERS. The M042 route is the one this task adds, so
  // the check must name it when its loader is gone rather than pass on the surfaces before it. It is
  // the third quoted key in the map, so a parse that read only bare identifiers would pass this
  // pin's first half and never see the surface it dropped.
  const withoutErrorBoundary = demoSource.replace(
    "  'error-boundary': () => import('./panel-error-boundary') as never,\n",
    '',
  );
  assert.notEqual(
    withoutErrorBoundary,
    demoSource,
    'the error-boundary mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutErrorBoundary),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('error-boundary'),
    'removing the error-boundary loader must fail naming the missing surface error-boundary',
  );

  // Mutant: remove the stability key from LOADERS. The M043 route is the one this task adds, so the
  // check must name it when its loader is gone rather than pass on the surfaces before it. It is a
  // bare identifier key whose import is the only reference to `panel-stability.ts`, so a route that
  // dropped it would leave the surface unreachable while every earlier surface still loaded.
  const withoutStability = demoSource.replace(
    "  stability: () => import('./panel-stability') as never,\n",
    '',
  );
  assert.notEqual(
    withoutStability,
    demoSource,
    'the stability mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutStability),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('stability'),
    'removing the stability loader must fail naming the missing surface stability',
  );

  // Mutant: remove the console-read key from LOADERS. The M046 route is the one this task adds, so the
  // check must name it when its loader is gone rather than pass on the surfaces before it. It is a
  // quoted key whose import is the only reference to `panel-copy-to-agent.ts`, so a route that dropped
  // it would leave the hand-off surface unreachable while every earlier surface still loaded. The
  // assertion reads the failure's whole message: the missing-key sentence and the surface it names.
  const withoutConsoleRead = demoSource.replace(
    "  'console-read': () => import('./panel-copy-to-agent') as never,\n",
    '',
  );
  assert.notEqual(
    withoutConsoleRead,
    demoSource,
    'the console-read mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutConsoleRead),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: console-read'),
    'removing the console-read loader must fail naming the missing surface console-read',
  );

  // Mutant: remove the components key from LOADERS. The M047 route is the one this task adds, so the
  // check must name it when its loader is gone rather than pass on the surfaces before it. It is a
  // bare identifier key whose import is the only reference to `panel-components.ts`, so a route that
  // dropped it would leave the search surface unreachable while every earlier surface still loaded.
  const withoutComponents = demoSource.replace(
    "  components: () => import('./panel-components') as never,\n",
    '',
  );
  assert.notEqual(
    withoutComponents,
    demoSource,
    'the components mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutComponents),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: components'),
    'removing the components loader must fail naming the missing surface components',
  );

  // Mutant: remove the copy-check key from LOADERS. The M048 route is the one this task adds, so
  // the check must name it when its loader is gone rather than pass on the surfaces before it. It
  // is a quoted key whose import is the only reference to `panel-copy-check.ts`, so a route that
  // dropped it would leave the copy-check surface unreachable while every earlier surface still
  // loaded. The assertion reads the failure's whole message: the missing-key sentence and the
  // surface it names.
  const withoutCopyCheck = demoSource.replace(
    "  'copy-check': () => import('./panel-copy-check') as never,\n",
    '',
  );
  assert.notEqual(
    withoutCopyCheck,
    demoSource,
    'the copy-check mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutCopyCheck),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: copy-check'),
    'removing the copy-check loader must fail naming the missing surface copy-check',
  );
});
