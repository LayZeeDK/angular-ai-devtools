import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const out = {};
  if (!m) return out;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].trim();
  }
  return out;
}

test('E12: no T001-T005 fix task is in-progress while review round runs', () => {
  const dir = join(root, '.project', 'tasks');
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  const openFix = [];
  for (const f of files) {
    const text = readFileSync(join(dir, f), 'utf8');
    const fm = parseFrontmatter(text);
    const id = (fm.id || '').trim();
    if (/^T00[1-5]$/.test(id) && fm.status === 'in-progress') {
      openFix.push(id);
    }
  }
  assert.deepEqual(openFix, [], `fix tasks still in-progress: ${openFix.join(', ')}`);
});

test('E12: round-2 records review-on-clean-worktree sequencing', () => {
  const round2 = readFileSync(join(root, '.project', 'review', 'rounds', 'round-2.md'), 'utf8');
  assert.match(round2, /clean product worktree/i, 'missing clean worktree statement');
  assert.match(round2, /no fix task is open while this review round runs/i, 'missing sequencing statement');
  assert.match(round2, /sequenced/i, 'missing sequenced statement');
});
