// @ts-check
// Run: node --experimental-strip-types --test scripts/docs-correction.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

test('AGENTS.md uses the Nx 23 dist/bin entry path', () => {
  const text = readFileSync(join(ROOT, 'AGENTS.md'), 'utf8');
  assert(!text.includes('node_modules/nx/bin/nx.js'), 'old Nx path must be gone');
  assert(text.includes('node_modules/nx/dist/bin/nx.js'), 'new Nx path must be present');
});

test('extension-panel.md states the code Angular version', () => {
  const text = readFileSync(join(ROOT, '.commandcode', 'skills', 'control-ai-browsers', 'features', 'extension-panel.md'), 'utf8');
  assert(!text.includes('22.2.2'), 'stale Angular 22.2.2 claim must be gone');
  assert(text.includes('~22.1.0'), 'code Angular version must be stated');
});

test('monitor-ci SKILL.md no longer claims nx.json contains nxCloudId/nxCloudAccessToken', () => {
  const text = readFileSync(join(ROOT, '.commandcode', 'skills', 'monitor-ci', 'SKILL.md'), 'utf8');
  assert(!text.includes('for `nxCloudId` or `nxCloudAccessToken`'), 'old claim must be gone');
  assert(text.includes('contains neither'), 'qualification must be present');
});