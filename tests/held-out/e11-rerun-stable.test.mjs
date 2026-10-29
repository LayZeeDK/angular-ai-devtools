import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const r1 = readFileSync(join(root, '.project', 'review', 'rounds', 'round-1.md'), 'utf8');
const r2 = readFileSync(join(root, '.project', 'review', 'rounds', 'round-2.md'), 'utf8');

function parseRanges(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\|\s*(M\d+)\s*\|\s*([0-9a-f]{10,}\.\.[0-9a-f]{10,})\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|$/);
    if (m) out[m[1]] = { range: m[2], blocking: Number(m[3]), advisory: Number(m[4]) };
  }
  return out;
}

function parseFindings(text) {
  const set = new Set();
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^###\s+(F\d+\s*—.*)$/);
    if (m) set.add(m[1].trim());
  }
  // Associate milestone by scanning headings; store milestone-prefixed keys
  const result = new Set();
  let ms = null;
  for (const line of text.split(/\r?\n/)) {
    const mh = line.match(/^##\s+(M\d+)$/);
    if (mh) { ms = mh[1]; continue; }
    const mf = line.match(/^###\s+(F\d+)/);
    if (mf && ms) result.add(`${ms} ${mf[1]}`);
  }
  return result;
}

test('E11: unchanged ranges yield identical verdict sets and no new verified blocker', () => {
  const a = parseRanges(r1);
  const b = parseRanges(r2);
  assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort(), 'milestone set mismatch');
  for (const ms of Object.keys(a)) {
    assert.equal(b[ms].range, a[ms].range, `${ms} range changed`);
    assert.equal(b[ms].blocking, a[ms].blocking, `${ms} blocking count changed`);
    assert.equal(b[ms].advisory, a[ms].advisory, `${ms} advisory count changed`);
  }
  const fa = parseFindings(r1);
  const fb = parseFindings(r2);
  assert.deepEqual([...fb].sort(), [...fa].sort(), 'finding set changed between rounds');
  // no blocking finding in round2 absent from round1: covered by set equality above
});
