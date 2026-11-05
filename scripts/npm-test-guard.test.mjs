import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const packagePath = join(here, '..', 'package.json');

test('test script invokes test:app', () => {
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
  assert.match(pkg.scripts.test, /test:app/);
  assert.match(pkg.scripts.test, /&&\s*npm run test:app/);
});

test('test:app script invokes the Nx unit-test target for angular-ai-devtools', () => {
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
  assert.equal(pkg.scripts['test:app'], 'npx nx run angular-ai-devtools:test');
});
