import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const GUARD =
  /function isRecord\(value: unknown\): value is Record<string, unknown> \{\n([\s\S]*?)\n\}/;

function guardBody(relative) {
  const source = readFileSync(join(ROOT, relative), 'utf8');
  const match = GUARD.exec(source);
  assert.ok(match, `${relative} must define isRecord`);
  return match[1].replace(/\s+/g, ' ').trim();
}

test('tool-groups.ts keeps a copy of the guard that matches the shared module', () => {
  // `tool-groups.ts` cannot import the shared module: Node resolves a relative
  // specifier only with an explicit extension, and the emitting app build rejects
  // `.ts` specifiers. So it keeps its own copy — and this pins that the copy and the
  // shared module cannot drift.
  assert.equal(
    guardBody('apps/angular-ai-devtools/src/app/tool-groups.ts'),
    guardBody('apps/angular-ai-devtools/src/app/record-guard.ts'),
  );
});

test('the shared guard is the only other definition of isRecord in the panel app', () => {
  const files = [
    'apps/angular-ai-devtools/src/app/tool-groups.ts',
    'apps/angular-ai-devtools/src/app/record-guard.ts',
  ];
  const definitions = files.filter((file) =>
    GUARD.test(readFileSync(join(ROOT, file), 'utf8')),
  );
  assert.deepEqual(
    definitions.sort(),
    files.slice().sort(),
    'isRecord is defined in exactly two places: the shared module and the module Node loads directly',
  );
});
