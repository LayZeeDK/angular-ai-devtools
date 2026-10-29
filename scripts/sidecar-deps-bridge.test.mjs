import assert from 'node:assert/strict';
import { lstatSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
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

function linkType() {
  return process.platform === 'win32' ? 'junction' : 'dir';
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

test('correct-junction-accepted', () => {
  const { root, primary, sidecar } = setup();
  const bridgePath = join(sidecar, 'node_modules');
  const primaryNm = join(primary, 'node_modules');
  // manually create a correct junction/symlink
  symlinkSync(primaryNm, bridgePath, linkType());
  // bridge should accept (reuse) it
  const r = bridgeSidecarDeps(sidecar, primary);
  assert.equal(r.reused, true);
  assert.equal(isBridgeCorrect(sidecar, primary), true);
  rmSync(root, { recursive: true, force: true });
});

test('wrong-target-junction-detected', () => {
  const { root, primary, sidecar } = setup();
  const bridgePath = join(sidecar, 'node_modules');
  const other = join(root, 'other-nm');
  mkdirSync(other, { recursive: true });
  symlinkSync(other, bridgePath, linkType());
  // isBridgeCorrect false for wrong target
  assert.equal(isBridgeCorrect(sidecar, primary), false);
  // bridge throws on wrong target
  assert.throws(() => bridgeSidecarDeps(sidecar, primary), /different target/);
  rmSync(root, { recursive: true, force: true });
});

test('junction-removed', () => {
  const { root, primary, sidecar } = setup();
  const bridgePath = join(sidecar, 'node_modules');
  const primaryNm = join(primary, 'node_modules');
  symlinkSync(primaryNm, bridgePath, linkType());
  const u = unlinkSidecarDeps(sidecar);
  assert.equal(u.removed, true);
  // path gone
  let exists = true;
  try { lstatSync(bridgePath); } catch { exists = false; }
  assert.equal(exists, false);
  rmSync(root, { recursive: true, force: true });
});