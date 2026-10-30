import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const componentPath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'stale-view-fixture.ts');
const routesPath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'app.routes.ts');

test('component contains a this.<field> = write inside a subscribe callback on a non-signal field', () => {
  const src = readFileSync(componentPath, 'utf8');
  const subIdx = src.indexOf('subscribe(');
  assert.ok(subIdx >= 0, 'subscribe( must be present');

  const writeMatch = src.match(/this\s*\.\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*=/);
  assert.ok(writeMatch, 'this.<field> = write must be present');
  const writeIdx = src.indexOf(writeMatch[0]);
  assert.ok(writeIdx > subIdx, 'write must appear after subscribe(');

  const field = writeMatch[1];
  const signalDecl = new RegExp('\\b' + field + '\\b[^;]*signal\\s*\\(');
  assert.equal(signalDecl.test(src), false, 'field must not be a signal');
});

test('app.routes.ts declares original routes plus stale-view', () => {
  const src = readFileSync(routesPath, 'utf8');
  assert.match(src, /stale-view/);
  assert.match(src, /StaleViewFixture/);
  assert.match(src, /export const routes/);
});
