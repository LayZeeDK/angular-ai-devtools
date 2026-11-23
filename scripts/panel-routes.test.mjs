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
 * clicks, so a surface that loses its name, its position or its own route data fails E1 by that name
 * rather than as a smaller count. */
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
  'console',
  'console-read',
  'outlet',
  'visual-qa',
  'tutor-foundations',
  'tutor-signals',
  'tutor-routing',
  'webmcp-rehearsal',
  'webmcp',
  'teardown-leak',
  'components',
  'copy-check',
  'interaction-story',
  'error-routing',
  'locale-correctness',
  'guard-phase',
  'dead-click',
  'what-changed',
];

/** The identifier every panel-demo route installs. */
const SHARED_LOADER = 'loadPanelDemo';

/** The definition that identifier must have: the demo module imported dynamically, resolving its
 * component out of the module it just loaded. */
const SHARED_LOADER_DEFINITION =
  /const\s+loadPanelDemo\s*=\s*\(\)\s*=>\s*import\('\.\/panel-demo'\)\.then\(\s*\(\w+\)\s*=>\s*\w+\.PanelDemoComponent,?\s*\)/;

/** The dynamic import the shared loader must be the only site of. */
const DEMO_IMPORT = /import\('\.\/panel-demo'\)/g;

/**
 * The surface names the route factory is handed, in source order, read from the `PANEL_SURFACES`
 * list. That list is now the one place a surface is named, so it is the one place a surface can be
 * lost, and E1 reads it as a list rather than as a substring of a route object.
 */
function declaredSurfaces(source) {
  const marker = source.indexOf('const PANEL_SURFACES = [');
  if (marker < 0) return [];
  const end = source.indexOf('\n];', marker);
  if (end < 0) return [];
  const block = source.slice(marker, end);
  const out = [];
  const re = /^\s*'([^']+)',$/gm;
  let m;
  while ((m = re.exec(block)) !== null) out.push(m[1]);
  return out;
}

/**
 * The one object literal every panel route is built from: the argument of the `PANEL_SURFACES.map`
 * call in `appRoutes`. Twenty-one of these used to sit in the table, one per surface, which is the
 * duplication the factory replaced; there is one now, and it is the only text that can carry a
 * route's shape.
 */
function routeLiteral(source) {
  const marker = source.indexOf('PANEL_SURFACES.map(');
  if (marker < 0) return null;
  const end = source.indexOf('\n];', marker);
  return source.slice(marker, end < 0 ? undefined : end);
}

/**
 * E1's first half, at the factory: every named surface is in `PANEL_SURFACES` exactly once and in
 * table order, so every one of them still gets a route at its own path; and the single literal those
 * names are mapped over installs a component lazily, takes its path from the name it is mapped over,
 * and carries that same name in route data.
 *
 * This half deliberately says nothing about *which* loader the literal installs. Which loader it
 * installs is `assertOneSharedLoader`'s property, one level down, and separating the two is what
 * lets a literal carrying its own copy of the closure fail the duplication count by name instead of
 * vanishing into a per-surface list.
 */
function assertSurfaceRoutes(source) {
  const declared = declaredSurfaces(source);
  for (const surface of surfaces) {
    assert.equal(
      declared.filter((name) => name === surface).length,
      1,
      'route ' +
        surface +
        ' must exist exactly once in PANEL_SURFACES, so exactly one route answers at its path: ' +
        JSON.stringify(declared),
    );
  }
  assert.deepEqual(
    declared,
    surfaces,
    'PANEL_SURFACES must carry every surface in the order the table declares them, so the factory neither loses nor reorders one',
  );
  const block = routeLiteral(source);
  assert.ok(block, 'the panel routes must be one literal, not a table of them');
  assert.ok(
    !block.includes('as any)'),
    'a panel route must not install a surface function as a component: ' +
      block,
  );
  assert.ok(
    block.includes('loadComponent:'),
    'every panel surface route must install a component through loadComponent: ' +
      block,
  );
  assert.ok(
    block.includes('path: surface,'),
    'every panel surface route must take its path from the name it is mapped over, so a path cannot drift from its data: ' +
      block,
  );
  assert.ok(
    block.includes('data: { surface }'),
    'every panel surface route must name its surface in route data, from the name that is its path: ' +
      block,
  );
}

/**
 * E1's third reading: the routes are built, not written out. A route that spells its own surface in
 * route data is the per-surface literal this factory replaced — one surface's bytes copied back into
 * the eager table — so it reddens here by count rather than passing as an extra working route.
 */
function assertNoSpelledOutSurfaceRoutes(source) {
  const spelled = [...source.matchAll(/data:\s*\{\s*surface:\s*'/g)].length;
  assert.equal(
    spelled,
    0,
    'every panel surface route must take its name from PANEL_SURFACES; ' +
      spelled +
      ' route(s) spell their own surface in route data, which is the per-surface literal the factory replaced',
  );
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
  const panelRoutes = [...source.matchAll(/data:\s*\{\s*surface\b/g)].length;
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

test('E1: the panel routes are one list mapped over one literal, and every surface keeps its path and its own name', () => {
  const source = readFileSync(ROUTES, 'utf8');

  // Green first, all three halves, on the real table.
  assertSurfaceRoutes(source);
  assertOneSharedLoader(source);
  assertNoSpelledOutSurfaceRoutes(source);

  const definition = SHARED_LOADER_DEFINITION.exec(source);
  assert.ok(
    definition,
    'the pin must be able to find the shared loader definition it mutates',
  );

  // Mutant: the literal keeps its own copy of the closure instead of the shared loader. This is the
  // shape the thirteenth entry had. The per-surface half must stay green — every surface still has
  // its route — and the duplication half must fail, naming the repeated dynamic import.
  const ownClosure = source.replace(
    '    loadComponent: loadPanelDemo,\n',
    "    loadComponent: () =>\n      import('./panel-demo').then((m) => m.PanelDemoComponent),\n",
  );
  assert.notEqual(
    ownClosure,
    source,
    'the own-closure mutant must change app.routes.ts',
  );
  assert.doesNotThrow(
    () => assertSurfaceRoutes(ownClosure),
    'a route literal carrying its own closure keeps every surface entry intact, so the per-surface half must not redden for it',
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

  // Mutant: a surface dropped from the list the factory is handed — the route that named it goes
  // with it. The pin must fail naming the surface it left behind, not merely report a smaller count.
  const withoutShared = source.replace("  'linked-state',\n", '');
  assert.notEqual(
    withoutShared,
    source,
    'the dropped-surface mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutShared),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route linked-state must exist'),
    'a surface no longer in PANEL_SURFACES must fail naming the surface linked-state',
  );

  // Mutant: the literal pointed at a surface function instead of a component — the failure the
  // original text pin caught, still caught here by the name of the property it lost.
  const surfaceFunction = source.replace(
    '    loadComponent: loadPanelDemo,\n',
    "    loadComponent: () =>\n      import('./panel-navigation').then((m) => m.navigationPanel as any),\n",
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
        'must not install a surface function as a component',
      ),
    'a route pointed at a surface function must fail naming the property it lost',
  );

  // Mutant: a surface renamed in the list the factory is handed — the route the old name answered is
  // gone from the table entirely. The pin must name the surface whose route went with it.
  const renamedPath = source.replace(
    "  'navigation',\n",
    "  'navigation-renamed',\n",
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

  // Mutant: the literal keeps its loader but drops the surface it names in route data.
  const unnamedSurface = source.replace('    data: { surface },\n', '');
  assert.notEqual(
    unnamedSurface,
    source,
    'the unnamed-surface mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(unnamedSurface),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('must name its surface in route data'),
    'a route that no longer names its surface must fail naming it',
  );

  // Mutant: a surface's route written out again as its own literal beside the factory — the shape
  // every surface used to carry, and the duplication this factory exists to remove.
  const spelledOut = source.replace(
    '  ...PANEL_SURFACES.map(',
    "  {\n    path: 'fields',\n    loadComponent: loadPanelDemo,\n    data: { surface: 'fields' },\n  },\n  ...PANEL_SURFACES.map(",
  );
  assert.notEqual(
    spelledOut,
    source,
    'the spelled-out-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertNoSpelledOutSurfaceRoutes(spelledOut),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('spell their own surface in route data'),
    'a route written out per surface must fail naming the per-surface literal it restored',
  );

  // Mutant: the M042 surface dropped from the list the factory is handed. This is the mutation the
  // task's own red-then-green proof applies to `app.routes.ts`, replayed here so the pin carries it
  // rather than relying on a log: the check must name the surface whose route is gone.
  const withoutErrorBoundary = source.replace("  'error-boundary',\n", '');
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

  // Mutant: the M043 surface dropped from the list the factory is handed. This is the mutation the
  // task's own red-then-green proof applies to `app.routes.ts`, replayed here so the pin carries it
  // rather than relying on a log: the check must name the surface whose route is gone.
  const withoutStability = source.replace("  'stability',\n", '');
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

  // Mutant: the M046 surface dropped from the list the factory is handed. It is the route the table
  // answers for the console hand-off, so the per-surface half must name it rather than pass on the
  // older surfaces alone.
  const withoutConsoleRead = source.replace("  'console-read',\n", '');
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

  // Mutant: the M053 surface dropped from the list the factory is handed. It is the route the table
  // answers for the rehearsal — the tool the model chose beside the result the tool returned — so the
  // per-surface half must name it rather than pass on the older surfaces alone.
  const withoutWebmcpRehearsal = source.replace("  'webmcp-rehearsal',\n", '');
  assert.notEqual(
    withoutWebmcpRehearsal,
    source,
    'the removed-webmcp-rehearsal-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutWebmcpRehearsal),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route webmcp-rehearsal must exist'),
    'a table without the webmcp-rehearsal route must fail naming the missing surface',
  );

  // Mutant: the M052 surface dropped from the list the factory is handed. It is the route the table
  // answers for the page's declared tool list, so the per-surface half must name it rather than pass
  // on the older surfaces alone.
  const withoutWebmcp = source.replace("  'webmcp',\n", '');
  assert.notEqual(
    withoutWebmcp,
    source,
    'the removed-webmcp-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutWebmcp),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route webmcp must exist'),
    'a table without the webmcp route must fail naming the missing surface',
  );

  // Mutant: the M047 surface dropped from the list the factory is handed. It is the route the table
  // answers for the component search, so the per-surface half must name it rather than pass on the
  // older surfaces alone.
  const withoutComponents = source.replace("  'components',\n", '');
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

  // Mutant: the M048 surface dropped from the list the factory is handed. It is the route the table
  // answers for the copy digest, so the per-surface half must name it rather than pass on the older
  // surfaces alone.
  const withoutCopyCheck = source.replace("  'copy-check',\n", '');
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

  // Mutant: the M049 surface dropped from the list the factory is handed. It is the route the table
  // answers for the interaction story, so the per-surface half must name it rather than pass on the
  // older surfaces alone.
  const withoutInteractionStory = source.replace(
    "  'interaction-story',\n",
    '',
  );
  assert.notEqual(
    withoutInteractionStory,
    source,
    'the removed-interaction-story-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutInteractionStory),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route interaction-story must exist'),
    'a table without the interaction-story route must fail naming the missing surface',
  );

  // Mutant: the M050 surface dropped from the list the factory is handed. It is the route the table
  // answers for the dangling start, so the per-surface half must name it rather than pass on the
  // older surfaces alone.
  const withoutDeadClick = source.replace("  'dead-click',\n", '');
  assert.notEqual(
    withoutDeadClick,
    source,
    'the removed-dead-click-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutDeadClick),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route dead-click must exist'),
    'a table without the dead-click route must fail naming the missing surface',
  );

  // Mutant: the M051 surface dropped from the list the factory is handed. It is the route the table
  // answers for the pair of records, so the per-surface half must name it rather than pass on the
  // older surfaces alone.
  const withoutWhatChanged = source.replace("  'what-changed',\n", '');
  assert.notEqual(
    withoutWhatChanged,
    source,
    'the removed-what-changed-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutWhatChanged),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route what-changed must exist'),
    'a table without the what-changed route must fail naming the missing surface',
  );

  // Mutant: the M054 surface dropped from the list the factory is handed. It is the route the table
  // answers for the style report — each measured property's computed value beside the baseline
  // declaration, or the three absences named apart — so the per-surface half must name it rather than
  // pass on the older surfaces alone.
  const withoutVisualQa = source.replace("  'visual-qa',\n", '');
  assert.notEqual(
    withoutVisualQa,
    source,
    'the removed-visual-qa-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutVisualQa),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route visual-qa must exist'),
    'a table without the visual-qa route must fail naming the missing surface',
  );

  // Mutant: the M055 surface dropped from the list the factory is handed. It is the route the table
  // answers for the artefact a record states for a question, so the per-surface half must name it
  // rather than pass on the older surfaces alone.
  const withoutTutorFoundations = source.replace(
    "  'tutor-foundations',\n",
    '',
  );
  assert.notEqual(
    withoutTutorFoundations,
    source,
    'the removed-tutor-foundations-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutTutorFoundations),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route tutor-foundations must exist'),
    'a table without the tutor-foundations route must fail naming the missing surface',
  );

  // Mutant: the M057 surface dropped from the list the factory is handed. It is the route the table
  // answers for the tutor-signals pane — the effect the graph carries and the node its edge names,
  // or the state that names why it cannot be told — so the per-surface half must name it rather than
  // pass on the older surfaces alone.
  const withoutTutorSignals = source.replace("  'tutor-signals',\n", '');
  assert.notEqual(
    withoutTutorSignals,
    source,
    'the removed-tutor-signals-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutTutorSignals),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route tutor-signals must exist'),
    'a table without the tutor-signals route must fail naming the missing surface',
  );

  // Mutant: the M062 surface dropped from the list the factory is handed. It is the route the table
  // answers for the outlet record — the request the configuration stated, the name the state matched,
  // that route's own path and each absence the record states — so the per-surface half must name it
  // rather than pass on the older surfaces alone.
  const withoutOutlet = source.replace("  'outlet',\n", '');
  assert.notEqual(
    withoutOutlet,
    source,
    'the removed-outlet-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutOutlet),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route outlet must exist'),
    'a table without the outlet route must fail naming the missing surface',
  );

  // Mutant: the M061 surface dropped from the list the factory is handed. It is the route the table
  // answers for the locale-correctness pane — the provider entry's token, kind and import path, or
  // the absence that stands where no entry carries the token, with every absence and claim the
  // answer carries in its own line — so the per-surface half must name it rather than pass on the
  // older surfaces alone.
  const withoutLocaleCorrectness = source.replace(
    "  'locale-correctness',\n",
    '',
  );
  assert.notEqual(
    withoutLocaleCorrectness,
    source,
    'the removed-locale-correctness-route mutant must change app.routes.ts',
  );
  assert.throws(
    () => assertSurfaceRoutes(withoutLocaleCorrectness),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes('route locale-correctness must exist'),
    'a table without the locale-correctness route must fail naming the missing surface',
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
    outlet: ['panel-outlet', 'outletPanel'],
    'webmcp-rehearsal': ['panel-webmcp-rehearsal', 'webmcpRehearsalPanel'],
    webmcp: ['panel-webmcp', 'webmcpPanel'],
    'teardown-leak': ['panel-teardown-leak', 'teardownLeakPanel'],
    'error-routing': ['panel-error-routing', 'errorRoutingPanel'],
    'locale-correctness': [
      'panel-locale-correctness',
      'localeCorrectnessPanel',
    ],
    'guard-phase': ['panel-guard-phase', 'guardPhasePanel'],
    components: ['panel-components', 'componentsPanel'],
    'copy-check': ['panel-copy-check', 'copyCheckPanel'],
    'interaction-story': ['panel-interaction-story', 'interactionStoryPanel'],
    'dead-click': ['panel-dead-click', 'deadClickPanel'],
    'what-changed': ['panel-what-changed', 'whatChangedPanel'],
    'visual-qa': ['panel-visual-qa', 'visualQaPanel'],
    'tutor-foundations': ['panel-tutor-foundations', 'tutorFoundationsPanel'],
    'tutor-signals': ['panel-tutor-signals', 'tutorSignalsPanel'],
    'tutor-routing': ['panel-tutor-routing', 'tutorRoutingPanel'],
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
    'webmcpRehearsalPanel(',
    'webmcpPanel(',
    'teardownLeakPanel(',
    'componentsPanel(',
    'copyCheckPanel(',
    'interactionStoryPanel(',
    'deadClickPanel(',
    'whatChangedPanel(',
    'visualQaPanel(',
    'tutorFoundationsPanel(',
    'tutorSignalsPanel(',
    'tutorRoutingPanel(',
    'localeCorrectnessPanel(',
    'outletPanel(',
    'guardPhasePanel(',
  ]) {
    assert.ok(
      !source.includes(call),
      'the demo calls no surface directly — ' +
        call +
        ' must arrive through its own loader',
    );
  }
});

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

  // Mutant: remove the webmcp-rehearsal key from LOADERS. The M053 route is the one this task adds, so
  // the check must name it when its loader is gone rather than pass on the surfaces before it. It is a
  // quoted key whose import is the only reference to `panel-webmcp-rehearsal.ts`, so a route that
  // dropped it would leave the rehearsal pane unreachable while every earlier surface still loaded. The
  // assertion reads the failure's whole message: the missing-key sentence and the surface it names.
  const withoutWebmcpRehearsal = demoSource.replace(
    "  'webmcp-rehearsal': () => import('./panel-webmcp-rehearsal') as never,\n",
    '',
  );
  assert.notEqual(
    withoutWebmcpRehearsal,
    demoSource,
    'the webmcp-rehearsal loader mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutWebmcpRehearsal),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: webmcp-rehearsal'),
    'removing the webmcp-rehearsal loader must fail naming the missing surface webmcp-rehearsal',
  );

  // Mutant: remove the webmcp key from LOADERS. The M052 route is the one this task adds, so the
  // check must name it when its loader is gone rather than pass on the surfaces before it. It is a
  // bare identifier key whose import is the only reference to `panel-webmcp.ts`, so a route that
  // dropped it would leave the tool-list surface unreachable while every earlier surface still
  // loaded. The assertion reads the failure's whole message: the missing-key sentence and the
  // surface it names.
  const withoutWebmcp = demoSource.replace(
    "  webmcp: () => import('./panel-webmcp') as never,\n",
    '',
  );
  assert.notEqual(
    withoutWebmcp,
    demoSource,
    'the webmcp mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutWebmcp),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: webmcp'),
    'removing the webmcp loader must fail naming the missing surface webmcp',
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

  // Mutant: remove the interaction-story key from LOADERS. The M049 route is the one this task
  // adds, so the check must name it when its loader is gone rather than pass on the surfaces before
  // it. It is a quoted key whose import is the only reference to `panel-interaction-story.ts`, so a
  // route that dropped it would leave the story surface unreachable while every earlier surface
  // still loaded. The assertion reads the failure's whole message: the missing-key sentence and the
  // surface it names.
  const withoutInteractionStory = demoSource.replace(
    "  'interaction-story': () => import('./panel-interaction-story') as never,\n",
    '',
  );
  assert.notEqual(
    withoutInteractionStory,
    demoSource,
    'the interaction-story mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutInteractionStory),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: interaction-story'),
    'removing the interaction-story loader must fail naming the missing surface interaction-story',
  );

  // Mutant: remove the dead-click key from LOADERS. The M050 route is the one this task adds, so
  // the check must name it when its loader is gone rather than pass on the surfaces before it. It
  // is a quoted key whose import is the only reference to `panel-dead-click.ts`, so a route that
  // dropped it would leave the dangling-start surface unreachable while every earlier surface still
  // loaded. The assertion reads the failure's whole message: the missing-key sentence and the
  // surface it names.
  const withoutDeadClick = demoSource.replace(
    "  'dead-click': () => import('./panel-dead-click') as never,\n",
    '',
  );
  assert.notEqual(
    withoutDeadClick,
    demoSource,
    'the dead-click mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutDeadClick),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: dead-click'),
    'removing the dead-click loader must fail naming the missing surface dead-click',
  );

  // Mutant: remove the what-changed key from LOADERS. The M051 route is the one this task adds, so
  // the check must name it when its loader is gone rather than pass on the surfaces before it. It is
  // a quoted key whose import is the only reference to `panel-what-changed.ts`, so a route that
  // dropped it would leave the pair surface unreachable while every earlier surface still loaded.
  // The assertion reads the failure's whole message: the missing-key sentence and the surface it
  // names.
  const withoutWhatChanged = demoSource.replace(
    "  'what-changed': () => import('./panel-what-changed') as never,\n",
    '',
  );
  assert.notEqual(
    withoutWhatChanged,
    demoSource,
    'the what-changed mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutWhatChanged),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: what-changed'),
    'removing the what-changed loader must fail naming the missing surface what-changed',
  );

  // Mutant: remove the visual-qa key from LOADERS. The M054 route is the one this task adds, so the
  // check must name it when its loader is gone rather than pass on the surfaces before it. It is a
  // quoted key whose import is the only reference to `panel-visual-qa.ts`, so a route that dropped it
  // would leave the style-report surface unreachable while every earlier surface still loaded. The
  // assertion reads the failure's whole message: the missing-key sentence and the surface it names.
  const withoutVisualQa = demoSource.replace(
    "  'visual-qa': () => import('./panel-visual-qa') as never,\n",
    '',
  );
  assert.notEqual(
    withoutVisualQa,
    demoSource,
    'the visual-qa loader mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutVisualQa),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: visual-qa'),
    'removing the visual-qa loader must fail naming the missing surface visual-qa',
  );

  // Mutant: remove the tutor-foundations key from LOADERS. The M055 route is the one this task adds,
  // so the check must name it when its loader is gone rather than pass on the surfaces before it. It
  // is a quoted key whose import is the only reference to `panel-tutor-foundations.ts`, so a route
  // that dropped it would leave the artefact surface unreachable while every earlier surface still
  // loaded. The assertion reads the failure's whole message: the missing-key sentence and the
  // surface it names.
  const withoutTutorFoundations = demoSource.replace(
    "  'tutor-foundations': () => import('./panel-tutor-foundations') as never,\n",
    '',
  );
  assert.notEqual(
    withoutTutorFoundations,
    demoSource,
    'the tutor-foundations loader mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutTutorFoundations),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: tutor-foundations'),
    'removing the tutor-foundations loader must fail naming the missing surface tutor-foundations',
  );

  // Mutant: remove the tutor-signals key from LOADERS. The M057 route is the one this task pins, so
  // the check must name it when its loader is gone rather than pass on the surfaces before it. It is
  // a quoted key whose import is the only reference to `panel-tutor-signals.ts`, so a route that
  // dropped it would leave the tutor-signals surface unreachable while every earlier surface still
  // loaded. The assertion reads the failure's whole message: the missing-key sentence and the
  // surface it names.
  const withoutTutorSignals = demoSource.replace(
    "  'tutor-signals': () => import('./panel-tutor-signals') as never,\n",
    '',
  );
  assert.notEqual(
    withoutTutorSignals,
    demoSource,
    'the tutor-signals loader mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutTutorSignals),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: tutor-signals'),
    'removing the tutor-signals loader must fail naming the missing surface tutor-signals',
  );

  // Mutant: remove the tutor-routing key from LOADERS. The M058 route is the one this task adds, so
  // the check must name it when its loader is gone rather than pass on the surfaces before it. It is
  // a quoted key whose import is the only reference to `panel-tutor-routing.ts`, so a route that
  // dropped it would leave the tutor-routing surface unreachable while every earlier surface still
  // loaded. The assertion reads the failure's whole message: the missing-key sentence and the
  // surface it names.
  const withoutTutorRouting = demoSource.replace(
    "  'tutor-routing': () => import('./panel-tutor-routing') as never,\n",
    '',
  );
  assert.notEqual(
    withoutTutorRouting,
    demoSource,
    'the tutor-routing loader mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutTutorRouting),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: tutor-routing'),
    'removing the tutor-routing loader must fail naming the missing surface tutor-routing',
  );

  // Mutant: remove the teardown-leak key from LOADERS. The M059 route is the one this task adds, so
  // the check must name it when its loader is gone rather than pass on the surfaces before it. It is
  // a quoted key whose import is the only reference to `panel-teardown-leak.ts`, so a route that
  // dropped it would leave the teardown-leak surface unreachable while every earlier surface still
  // loaded. The assertion reads the failure's whole message: the missing-key sentence and the
  // surface it names.
  const withoutTeardownLeak = demoSource.replace(
    "  'teardown-leak': () => import('./panel-teardown-leak') as never,\n",
    '',
  );
  assert.notEqual(
    withoutTeardownLeak,
    demoSource,
    'the teardown-leak loader mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutTeardownLeak),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: teardown-leak'),
    'removing the teardown-leak loader must fail naming the missing surface teardown-leak',
  );

  // Mutant: remove the error-routing key from LOADERS. The M060 route is the one this task adds, so
  // the check must name it when its loader is gone rather than pass on the surfaces before it. It is
  // a quoted key whose import is the only reference to `panel-error-routing.ts`, so a route that
  // dropped it would leave the error-routing surface unreachable while every earlier surface still
  // loaded. The assertion reads the failure's whole message: the missing-key sentence and the
  // surface it names.
  const withoutErrorRouting = demoSource.replace(
    "  'error-routing': () => import('./panel-error-routing') as never,\n",
    '',
  );
  assert.notEqual(
    withoutErrorRouting,
    demoSource,
    'the error-routing loader mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutErrorRouting),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: error-routing'),
    'removing the error-routing loader must fail naming the missing surface error-routing',
  );

  // Mutant: remove the locale-correctness key from LOADERS. The M061 route is the one this task
  // adds, so the check must name it when its loader is gone rather than pass on the surfaces before
  // it. It is a quoted key whose import is the only reference to `panel-locale-correctness.ts`, so a
  // route that dropped it would leave the locale-correctness surface unreachable while every
  // earlier surface still loaded. The assertion reads the failure's whole message: the missing-key
  // sentence and the surface it names.
  const withoutLocaleCorrectness = demoSource.replace(
    "  'locale-correctness': () => import('./panel-locale-correctness') as never,\n",
    '',
  );
  assert.notEqual(
    withoutLocaleCorrectness,
    demoSource,
    'the locale-correctness loader mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutLocaleCorrectness),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: locale-correctness'),
    'removing the locale-correctness loader must fail naming the missing surface locale-correctness',
  );

  // Mutant: remove the outlet key from LOADERS. The M062 route is the one this task adds, so the
  // check must name it when its loader is gone rather than pass on the surfaces before it. It is a
  // bare identifier key whose import is the only reference to `panel-outlet.ts`, so a route that
  // dropped it would leave the outlet surface unreachable while every earlier surface still loaded.
  // This is also the mutation the task's own red-then-green proof applies to `panel-demo.ts`: a route
  // entry with no loader beside it must fail naming the key rather than rendering nothing.
  const withoutOutlet = demoSource.replace(
    "  outlet: () => import('./panel-outlet') as never,\n",
    '',
  );
  assert.notEqual(
    withoutOutlet,
    demoSource,
    'the outlet loader mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutOutlet),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: outlet'),
    'removing the outlet loader must fail naming the missing surface outlet',
  );

  // Mutant: remove the guard-phase key from LOADERS. The M063 route is the one this task adds, so
  // the check must name it when its loader is gone rather than pass on the surfaces before it. It is
  // a quoted key whose import is the only reference to `panel-guard-phase.ts`, so a route that
  // dropped it would leave the guard-phase surface unreachable while every earlier surface still
  // loaded. This is also the mutation the task's own red-then-green proof applies to `app.routes.ts`
  // and `panel-demo.ts`: a route entry with no loader beside it must fail naming the key rather than
  // rendering nothing. The assertion reads the failure's whole message: the missing-key sentence and
  // the surface it names.
  const withoutGuardPhase = demoSource.replace(
    "  'guard-phase': () => import('./panel-guard-phase') as never,\n",
    '',
  );
  assert.notEqual(
    withoutGuardPhase,
    demoSource,
    'the guard-phase loader mutant must change panel-demo.ts',
  );
  assert.throws(
    () => assertAllSurfacesHaveLoaders(routesSource, withoutGuardPhase),
    (err) =>
      err instanceof assert.AssertionError &&
      String(err.message).includes(
        'every app.routes.ts surface must have a panel-demo LOADERS key',
      ) &&
      String(err.message).includes('missing: guard-phase'),
    'removing the guard-phase loader must fail naming the missing surface guard-phase',
  );
});
