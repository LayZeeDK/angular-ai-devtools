import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const ROUTES = join(ROOT, 'apps', 'angular-ai-devtools', 'src', 'app', 'app.routes.ts');

const surfaces = ['after-render', 'sanitizer', 'redirect', 'fields'];

function routeLine(source, surface) {
  const needle = "path: '" + surface + "'";
  return source.split('\n').find((line) => line.includes(needle));
}

test('E1: a panel route installs a component, never a surface function', () => {
  const source = readFileSync(ROUTES, 'utf8');
  for (const surface of surfaces) {
    const line = routeLine(source, surface);
    assert.ok(line, 'route ' + surface + ' must exist');
    assert.ok(
      !line.includes('as any)'),
      'route ' + surface + ' must not install a surface function as a component: ' + line,
    );
    assert.ok(
      line.includes('PanelDemoComponent'),
      'route ' + surface + ' must install PanelDemoComponent: ' + line,
    );
  }
});

test('E2: the surface functions are still exported for their suites', () => {
  const files = {
    'after-render': ['after-render', 'afterRenderPanel'],
    sanitizer: ['panel-sanitizer', 'sanitizerPanel'],
    redirect: ['panel-redirect', 'redirectPanel'],
    fields: ['panel-fields', 'fieldsPanel'],
  };
  for (const [surface, [base, exportName]] of Object.entries(files)) {
    const source = readFileSync(join(ROOT, 'apps', 'angular-ai-devtools', 'src', 'app', base + '.ts'), 'utf8');
    const exported =
      source.includes('export const ' + exportName) ||
      source.includes('export function ' + exportName) ||
      source.includes('export default ' + exportName);
    assert.ok(exported, base + ' must still export ' + exportName + ' for ' + surface);
  }
});

test('E3: the demo module renders the surface text it is handed', () => {
  const source = readFileSync(
    join(ROOT, 'apps', 'angular-ai-devtools', 'src', 'app', 'panel-demo.ts'),
    'utf8',
  );
  assert.ok(source.includes('@for (line of lines()'), 'the demo must render the surface lines');
  for (const call of ['fieldsPanel(', 'redirectPanel(', 'sanitizerPanel(', 'afterRenderPanel(']) {
    assert.ok(
      !source.includes(call),
      'the demo calls no surface directly — ' + call + ' must arrive through its own loader',
    );
  }
});
