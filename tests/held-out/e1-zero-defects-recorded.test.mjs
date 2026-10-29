import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const round2 = readFileSync(join(root, '.project', 'review', 'rounds', 'round-2.md'), 'utf8');

test('E1: M002 records no defects found with frozen range and reviewed HEAD', () => {
  const m002Section = round2.split(/^## M003$/m)[0].split(/^## M002$/m)[1];
  assert.ok(m002Section, 'M002 section missing');
  assert.match(m002Section, /No defects found/i, 'missing "no defects found"');
  assert.match(m002Section, /5953b1285b4f9ccc025ecee77909624ce709d0bf\.\.dc6e6937590292f3f2ac0f57f09cf9c4162c1350/, 'frozen range missing');
  assert.match(m002Section, /HEAD 8b2780a30d991201b423b2632aac82fcc02bca38/, 'reviewed HEAD missing');
});
