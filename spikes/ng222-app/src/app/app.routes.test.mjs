import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..', '..', '..');
const routesPath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'app.routes.ts');

const staleViewRoutePattern = /['"]stale-view['"]/;

test('app.routes.ts registers the deferred stale-view fixture route', () => {
  const src = readFileSync(routesPath, 'utf8');
  assert.match(src, /stale-view-deferred/);
  assert.match(src, /StaleViewDeferredFixture/);
});

test('app.routes.ts retains the existing /stale-view route', () => {
  const src = readFileSync(routesPath, 'utf8');
  assert.match(src, staleViewRoutePattern);
  assert.match("'stale-view'", staleViewRoutePattern);
  assert.match(src, /StaleViewFixture/);
});

test('app.routes.ts /stale-view is adjacent to /stale-view-deferred and does not match the deferred route', () => {
  assert.match("'stale-view'", staleViewRoutePattern);
  assert.doesNotMatch("'stale-view-deferred'", staleViewRoutePattern);
});

test('app.routes.ts exports routes', () => {
  const src = readFileSync(routesPath, 'utf8');
  assert.match(src, /export const routes/);
});