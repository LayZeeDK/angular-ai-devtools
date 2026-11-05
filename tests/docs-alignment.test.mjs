import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('..', import.meta.url).pathname.replace(
  /^\/([A-Z]:)/,
  '$1',
);
function read(p) {
  return fs.readFileSync(root + p, 'utf8');
}
function eq(a, b) {
  assert.equal(a, b);
}

test('health-check copies say nineteen check lines', () => {
  for (const p of [
    '.commandcode/skills/control-ai-browsers/features/health-check.md',
    '.claude/skills/control-ai-browsers/features/health-check.md',
  ]) {
    assert.match(read(p), /Exit 0 and nineteen check lines/);
  }
  assert.equal(
    read('.commandcode/skills/control-ai-browsers/features/health-check.md'),
    read('.claude/skills/control-ai-browsers/features/health-check.md'),
  );
});

test('pangular skill cites control.mjs:74', () => {
  for (const p of [
    '.commandcode/skills/control-pangular-inspector/SKILL.md',
    '.claude/skills/control-pangular-inspector/SKILL.md',
  ]) {
    assert.match(read(p), /control\.mjs:74/);
  }
});

test('pstack-models uses dotted model id', () => {
  assert.match(
    read('.commandcode/pstack-models.md'),
    /poolside\/laguna-s-2\.1-free/,
  );
  assert.doesNotMatch(
    read('.commandcode/pstack-models.md'),
    /poolside\/laguna-s-2-1-free/,
  );
});

test('nx-plugins uses npx', () => {
  assert.match(read('.commandcode/skills/nx-plugins/SKILL.md'), /npx nx list/);
  assert.match(
    read('.commandcode/skills/nx-plugins/SKILL.md'),
    /npx nx add <plugin>/,
  );
});

test('browser probe marks phi4 available on gpu', () => {
  assert.match(
    read('research/00-browser-probe.md'),
    /available on GPU \(Edge stable 155\)/,
  );
});
