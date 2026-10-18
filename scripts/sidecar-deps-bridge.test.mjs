import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { bridgeSidecarDeps, isBridgeCorrect, unlinkSidecarDeps } from './sidecar-deps-bridge.mjs';

function setup() {
  const root = mkdtempSync(join(tmpdir(), 'bridge-'));
  const primary = join(root, 'primary');
  const sidecar = join(root, 'sidecar');
  mkdirSync(primary, { recursive: true });
  mkdirSync(sidecar, { recursive: true });
  mkdirSync(join(primary, 'node_modules'), { recursive: true });
  writeFileSync(join(primary, 'package.json'), '{}');
  writeFileSync(join(primary, 'node_modules', 'marker.txt'), 'x');
  return { root, primary, sidecar };
}

test('reuse-if-correct', () => {
  const { root, primary, sidecar } = setup();
  const first = bridgeSidecarDeps(sidecar, primary);
  assert.equal(first.created, true);
  const second = bridgeSidecarDeps(sidecar, primary);
  assert.equal(second.reused, true);
  assert.equal(isBridgeCorrect(sidecar, primary), true);
  rmSync(root, { recursive: true, force: true });
});

test('fail-fast-missing-primary', () => {
  const root = mkdtempSync(join(tmpdir(), 'bridge-'));
  const primary = join(root, 'primary');
  const sidecar = join(root, 'sidecar');
  mkdirSync(primary, { recursive: true });
  mkdirSync(sidecar, { recursive: true });
  // no node_modules
  assert.throws(() => bridgeSidecarDeps(sidecar, primary), /missing or broken/);
  rmSync(root, { recursive: true, force: true });
});

test('rerun-reuses-bridge', () => {
  const { root, primary, sidecar } = setup();
  bridgeSidecarDeps(sidecar, primary);
  // simulate re-run
  const r = bridgeSidecarDeps(sidecar, primary);
  assert.equal(r.reused, true);
  // teardown safe
  const u = unlinkSidecarDeps(sidecar);
  assert.equal(u.removed, true);
  rmSync(root, { recursive: true, force: true });
});