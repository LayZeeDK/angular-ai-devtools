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

const BROWSERS = ['.commandcode', '.claude'];

test('error-explainer.md (both copies) names error-explainer.component.ts, not stale names', () => {
  for (const root of BROWSERS) {
    const text = read(`${root}/skills/control-ai-browsers/features/error-explainer.md`);
    assert(text.includes('error-explainer.component.ts'), `${root}: fixed name must be present`);
    assert(!text.includes('error-explainer.service.ts'), `${root}: stale service name must be absent`);
    assert(!text.includes('n4-error-explainer.component.ts'), `${root}: stale component name must be absent`);
  }
});

test('control-angular-devtools SKILL.md (both copies) states Angular DevTools 1.22.1', () => {
  for (const root of BROWSERS) {
    const text = read(`${root}/skills/control-angular-devtools/SKILL.md`);
    assert(text.includes('1.22.1'), `${root}: 1.22.1 must be present`);
    assert(!text.includes('1.22.0'), `${root}: 1.22.0 must be absent`);
  }
});

test('control-angular-devtools features/install.md (both copies) states Angular DevTools 1.22.1', () => {
  for (const root of BROWSERS) {
    const text = read(`${root}/skills/control-angular-devtools/features/install.md`);
    assert(text.includes('1.22.1'), `${root}: 1.22.1 must be present`);
    assert(!text.includes('1.22.0'), `${root}: 1.22.0 must be absent`);
  }
});

test('control-ai-browsers features/README.md (both copies) lists di-doctor.md, error-explainer.md, signal-provenance.md', () => {
  for (const root of BROWSERS) {
    const text = read(`${root}/skills/control-ai-browsers/features/README.md`);
    assert(text.includes('di-doctor.md'), `${root}: di-doctor.md must be present`);
    assert(text.includes('error-explainer.md'), `${root}: error-explainer.md must be present`);
    assert(text.includes('signal-provenance.md'), `${root}: signal-provenance.md must be present`);
  }
});

test('nx-generate SKILL.md states nx format:write, not nx format --fix', () => {
  const text = read('.commandcode/skills/nx-generate/SKILL.md');
  assert(text.includes('nx format:write'), 'nx format:write must be present');
  assert(!text.includes('nx format --fix'), 'nx format --fix must be absent');
});