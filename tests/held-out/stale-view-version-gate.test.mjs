import assert from 'node:assert/strict';
import { test } from 'node:test';
import { angularVersionGate } from '../../src/main-world/stale-view-scan.ts';

test('Angular 22.1.2 or older is unsupported and names the version', () => {
  const r = angularVersionGate('22.1.2');
  assert.equal(r.supported, false);
  assert.equal(r.version, '22.1.2');
});

test('Angular 22.1.3 and newer are supported', () => {
  assert.equal(angularVersionGate('22.1.3').supported, true);
  assert.equal(angularVersionGate('22.2.0').supported, true);
});
