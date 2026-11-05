import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { resolveScanDir } from './run-user-scope-tests.mjs';

const runnerPath = fileURLToPath(
  new URL('./run-user-scope-tests.mjs', import.meta.url),
);
const passContent =
  "import assert from 'node:assert/strict';\nimport { test } from 'node:test';\ntest('pass', () => { assert.equal(1, 1); });\n";
const failContent =
  "import assert from 'node:assert/strict';\nimport { test } from 'node:test';\ntest('fail', () => { assert.equal(1, 2); });\n";

test('resolves home directory without tilde', () => {
  const dir = resolveScanDir();
  assert.ok(!dir.includes('~'));
  assert.equal(dir, join(homedir(), '.commandcode', 'scripts'));
});

test('recurses over a fixture tree', () => {
  const root = mkdtempSync(
    join(process.env.TEMP || process.env.TMP || '.', 'rus-'),
  );
  const nested = join(root, 'a', 'b');
  mkdirSync(nested, { recursive: true });
  writeFileSync(join(nested, 'x.test.mjs'), passContent);
  const r = spawnSync(process.execPath, [runnerPath, root], {
    encoding: 'utf8',
  });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  rmSync(root, { recursive: true, force: true });
});

test('returns non-zero on empty match', () => {
  const root = mkdtempSync(
    join(process.env.TEMP || process.env.TMP || '.', 'rus-'),
  );
  const r = spawnSync(process.execPath, [runnerPath, root], {
    encoding: 'utf8',
  });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /No user-scope tests/);
  rmSync(root, { recursive: true, force: true });
});

test('does not fall back to repository glob', () => {
  const root = mkdtempSync(
    join(process.env.TEMP || process.env.TMP || '.', 'rus-'),
  );
  const r = spawnSync(process.execPath, [runnerPath, root], {
    encoding: 'utf8',
  });
  assert.notEqual(r.status, 0);
  rmSync(root, { recursive: true, force: true });
});

test('propagates child failure', () => {
  const root = mkdtempSync(
    join(process.env.TEMP || process.env.TMP || '.', 'rus-'),
  );
  writeFileSync(join(root, 'bad.test.mjs'), failContent);
  const r = spawnSync(process.execPath, [runnerPath, root], {
    encoding: 'utf8',
  });
  assert.notEqual(r.status, 0);
  rmSync(root, { recursive: true, force: true });
});

test('injectable root via environment variable', () => {
  const root = mkdtempSync(
    join(process.env.TEMP || process.env.TMP || '.', 'rus-'),
  );
  const nested = join(root, 'sub');
  mkdirSync(nested, { recursive: true });
  writeFileSync(join(nested, 'env.test.mjs'), passContent);
  const r = spawnSync(process.execPath, [runnerPath], {
    encoding: 'utf8',
    env: { ...process.env, USER_SCOPE_SCRIPTS_DIR: root },
  });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  rmSync(root, { recursive: true, force: true });
});
