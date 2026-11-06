// @ts-check
// Run: node --test scripts/skills-mirror.test.mjs
// The browser-instance skills drive one shared set of instances and state files, so the copy Claude Code loads
// (.claude/skills) must be byte-identical to the maintained copy (.commandcode/skills). Re-sync by copying the
// .commandcode folder over the .claude one.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
// Command Code's maintenance notes live only beside the maintained copy.
const LOCAL_ONLY = new Set(['maintain']);
// Each tree keeps the byte copy of its own agent's lars-create-verification fingerprint.mjs; the two differ only in
// the agent path a comment names.
const OWN_CANONICAL = new Set(['scripts/fingerprint.mjs']);

/**
 * @param {string} dir
 * @returns {Map<string, Buffer>}
 */
function files(dir) {
  /** @type {Map<string, Buffer>} */
  const out = new Map();
  /** @param {string} d */
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);

      if (e.isDirectory()) {
        if (!(d === dir && LOCAL_ONLY.has(e.name))) {
          walk(p);
        }
      } else {
        out.set(relative(dir, p).replaceAll('\\', '/'), readFileSync(p));
      }
    }
  };
  walk(dir);

  return out;
}

for (const skill of ['control-ai-browsers', 'verify-ai-browsers']) {
  test(`.claude/skills/${skill} mirrors .commandcode/skills/${skill}`, () => {
    const maintained = files(join(ROOT, '.commandcode', 'skills', skill));
    const copy = files(join(ROOT, '.claude', 'skills', skill));
    assert.deepEqual(
      [...copy.keys()].sort(),
      [...maintained.keys()].sort(),
      'the same files',
    );
    const differ = [...maintained]
      .filter(
        ([f, bytes]) =>
          !OWN_CANONICAL.has(f) &&
          !bytes.equals(/** @type {Buffer} */ (copy.get(f))),
      )
      .map(([f]) => f);
    assert.deepEqual(differ, [], 'the same bytes');
  });
}
