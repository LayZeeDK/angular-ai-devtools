import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const specDir = join(root, '.project', 'review', 'specs');

const ranges = {
  m001: ['ecfdbd0bad2a722daea1f6f24dcf129b4902d237', '5953b1285b4f9ccc025ecee77909624ce709d0bf'],
  m002: ['5953b1285b4f9ccc025ecee77909624ce709d0bf', 'dc6e6937590292f3f2ac0f57f09cf9c4162c1350'],
  m003: ['dc6e6937590292f3f2ac0f57f09cf9c4162c1350', '761d6a33d96f194090a87a906db1ee3fecbc2a2b'],
  m004: ['761d6a33d96f194090a87a906db1ee3fecbc2a2b', '2f7500040b0765d06f18e502be86b419b8783239'],
  m005: ['2f7500040b0765d06f18e502be86b419b8783239', 'c4a766ce26e62901c29c8f1165a3d0d4f10d4567'],
  m006: ['2f7500040b0765d06f18e502be86b419b8783239', '57387f904558705718412d325a2e24c64cada7bd'],
  m007: ['57387f904558705718412d325a2e24c64cada7bd', '6c86ff2023999a8f976ad6ddc32a672a2ba29e5f'],
};

// E10 ruling: a milestone with no product diff (M002) still gets a specification
// with its frozen range and a written "no product code" focus.

for (const [name, [base, head]] of Object.entries(ranges)) {
  test(`${name}.md exists with frozen range`, () => {
    const p = join(specDir, `${name}.md`);
    assert.ok(existsSync(p), `${p} missing`);
    const text = readFileSync(p, 'utf8');
    assert.match(text, new RegExp(`${base}\\.\\.${head}`), 'range mismatch');
    assert.match(text, /File scope/i, 'file scope missing');
    assert.match(text, /Focus areas/i, 'focus areas missing');
    assert.match(text, /Acceptance/i, 'acceptance missing');
  });
}

test('m002 states no product code', () => {
  const text = readFileSync(join(specDir, 'm002.md'), 'utf8');
  assert.match(text, /no product code/);
});