// @ts-check
// Run: node --test scripts/fixture-proof-fresh.test.mjs
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { checkFeatures, featureIds } from '../.commandcode/skills/control-angular-dev-app/scripts/fingerprint.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const SKILLS = [
  '.commandcode/skills/control-angular-dev-app',
  '.commandcode/skills/control-angular-devtools',
];

for (const rel of SKILLS) {
  test(`every feature file in ${rel} has a fresh proof record`, () => {
    const skillDir = join(ROOT, ...rel.split('/'));
    const ids = featureIds(skillDir);
    const results = checkFeatures(skillDir);
    const byId = new Map(results.map((r) => [r.id, r]));
    for (const id of ids) {
      const r = byId.get(id);
      assert.ok(r, `${rel}: feature ${id} has no proof record`);
      assert.ok(
        r.status === 'fresh' || r.status === 'external',
        `${rel}: feature ${id} is ${r.status}: ${r.changed.map((c) => `${c.path} ${c.why}`).join(', ')}`,
      );
    }
    // every manifest entry must correspond to a feature file (no orphans) — checkFeatures already drops orphans on record; assert none stale
    for (const r of results) {
      if (ids.includes(r.id)) continue;
      // manifest entries without a feature file are dropped at record time; a stray one is a failure
      assert.fail(`${rel}: manifest entry ${r.id} has no feature file`);
    }
  });
}