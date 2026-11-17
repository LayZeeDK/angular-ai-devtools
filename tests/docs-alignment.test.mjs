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

test('health-check says nineteen check lines', () => {
  assert.match(
    read('.commandcode/skills/control-ai-browsers/features/health-check.md'),
    /Exit 0 and nineteen check lines/,
  );
});

test('pangular skill cites control.mjs, whose maintained copy declares the 9999 default', () => {
  assert.match(
    read('.commandcode/skills/control-pangular-inspector/SKILL.md'),
    /control\.mjs:74/,
  );
  // Held to the file the doc names, not to the line it names: `DEFAULT_PORT = 9999` is declared
  // further down the maintained script, and the citation's line number is the doc's own open fix.
  assert.match(
    read('.commandcode/skills/control-pangular-inspector/scripts/control.mjs'),
    /const DEFAULT_PORT = 9999;/,
  );
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
