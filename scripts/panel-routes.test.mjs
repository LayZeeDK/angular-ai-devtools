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

const surfaces = ['after-render', 'sanitizer', 'redirect', 'fields', 'legacy'];

function routeBlock(source, surface) {
  const needle = "path: '" + surface + "'";
  const at = source.indexOf(needle);
  if (at < 0) return null;
  const next = source.indexOf("path: '", at + needle.length);
  return source.slice(at, next < 0 ? undefined : next);
}

test('E1: a panel route installs a component, never a surface function', () => {
  const source = readFileSync(ROUTES, 'utf8');
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
      block.includes('PanelDemoComponent'),
      'route ' + surface + ' must install PanelDemoComponent: ' + block,
    );
    assert.ok(
      block.includes("surface: '" + surface + "'"),
      'route ' + surface + ' must name its surface in route data: ' + block,
    );
  }
});

test('E2: the surface functions are still exported for their suites', () => {
  const files = {
    'after-render': ['after-render', 'afterRenderPanel'],
    sanitizer: ['panel-sanitizer', 'sanitizerPanel'],
    redirect: ['panel-redirect', 'redirectPanel'],
    fields: ['panel-fields', 'fieldsPanel'],
    legacy: ['panel-legacy', 'legacyPanel'],
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
});
