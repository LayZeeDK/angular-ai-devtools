// @ts-check
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

function read(rel) {
  return readFileSync(join(ROOT, ...rel.split('/')), 'utf8');
}

test('error-explainer.md names error-explainer.component.ts, not stale names', () => {
  const text = read(
    '.commandcode/skills/control-ai-browsers/features/error-explainer.md',
  );
  assert(
    text.includes('error-explainer.component.ts'),
    'the fixed name must be present',
  );
  assert(
    !text.includes('error-explainer.service.ts'),
    'the stale service name must be absent',
  );
  assert(
    !text.includes('n4-error-explainer.component.ts'),
    'the stale component name must be absent',
  );
});

test('control-angular-devtools SKILL.md states Angular DevTools 1.22.1', () => {
  const text = read('.commandcode/skills/control-angular-devtools/SKILL.md');
  assert(text.includes('1.22.1'), '1.22.1 must be present');
  assert(!text.includes('1.22.0'), '1.22.0 must be absent');
});

test('control-angular-devtools features/install.md states Angular DevTools 1.22.1', () => {
  const text = read(
    '.commandcode/skills/control-angular-devtools/features/install.md',
  );
  assert(text.includes('1.22.1'), '1.22.1 must be present');
  assert(!text.includes('1.22.0'), '1.22.0 must be absent');
});

test('control-ai-browsers features/README.md lists di-doctor.md, error-explainer.md, signal-provenance.md', () => {
  const text = read(
    '.commandcode/skills/control-ai-browsers/features/README.md',
  );
  assert(text.includes('di-doctor.md'), 'di-doctor.md must be present');
  assert(
    text.includes('error-explainer.md'),
    'error-explainer.md must be present',
  );
  assert(
    text.includes('signal-provenance.md'),
    'signal-provenance.md must be present',
  );
});

test('nx-generate SKILL.md states nx format:write, not nx format --fix', () => {
  const text = read('.commandcode/skills/nx-generate/SKILL.md');
  assert(text.includes('nx format:write'), 'nx format:write must be present');
  assert(!text.includes('nx format --fix'), 'nx format --fix must be absent');
});
