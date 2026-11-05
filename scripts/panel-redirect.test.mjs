import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const CHAIN_SRC = readFileSync(
  new URL('../extension/redirect-chain.js', import.meta.url),
  'utf8',
);
const SURFACE_URL = new URL(
  '../apps/angular-ai-devtools/src/app/panel-redirect.ts',
  import.meta.url,
);
const SURFACE_SRC = readFileSync(SURFACE_URL, 'utf8');
const SURFACE = await import(SURFACE_URL.href);

function walk(config, requestedPath) {
  const context = createContext({});
  runInContext(CHAIN_SRC, context);
  const result = context.angularAiRedirectChain.walk(config, requestedPath);
  return JSON.parse(JSON.stringify(result));
}

const CONFIG = [
  { path: 'a', redirectTo: 'b' },
  { path: 'b', redirectTo: 'c' },
  { path: 'c', redirectTo: 'd' },
  { path: 'd' },
];

const WALKED = walk(CONFIG, 'a');
const CYCLE = walk(
  [
    { path: 'a', redirectTo: 'b' },
    { path: 'b', redirectTo: 'a' },
  ],
  'a',
);
const CANNOT_TELL = walk(null, 'a');
const GATED_INPUT = walk(
  [{ path: 'a', redirectTo: 'b', canActivate: ['Guard'] }, { path: 'b' }],
  'a',
);
const ERROR_INPUT = walk(
  [{ path: 'a', loadChildren: './a', redirectTo: 'b' }, { path: 'b' }],
  'a',
);

let mutantDir = null;
let mutantCount = 0;
async function loadMutant(anchor, replacement) {
  const source = SURFACE_SRC.replace(anchor, replacement);
  assert.notEqual(
    source,
    SURFACE_SRC,
    `mutation must change source: ${anchor}`,
  );
  mutantDir ??= mkdtempSync(join(tmpdir(), 'panel-redirect-'));
  mutantCount += 1;
  const file = join(mutantDir, `mutant-${mutantCount}.ts`);
  writeFileSync(file, source, 'utf8');
  return import(pathToFileURL(file).href);
}
after(() => {
  if (mutantDir) rmSync(mutantDir, { recursive: true, force: true });
});

function reddens(pin) {
  let failure = null;
  try {
    pin();
  } catch (e) {
    failure = e;
  }
  assert.ok(failure instanceof Error, 'mutant must redden');
  return failure;
}

describe('panel-redirect states', () => {
  it('loading', () => {
    const s = SURFACE.redirectPanel({ loading: true });
    assert.equal(s.state, 'loading');
    assert.ok(s.lines.length > 0);
  });
  it('walked marks first change only', () => {
    const s = SURFACE.redirectPanel(WALKED);
    assert.equal(s.state, 'walked');
    const marked = s.lines.filter((l) => l.includes('(changed)'));
    assert.equal(marked.length, 1, `expected one marked: ${s.text}`);
  });
  it('cycle names route', () => {
    const s = SURFACE.redirectPanel(CYCLE);
    assert.equal(s.state, 'cycle');
    assert.ok(s.text.includes(CYCLE.route));
  });
  it('gated', () => {
    const s = SURFACE.redirectPanel(GATED_INPUT);
    assert.equal(s.state, 'gated');
    assert.ok(!/allowed|denied|decided/i.test(s.text));
  });
  it('cannot-tell', () => {
    const s = SURFACE.redirectPanel(CANNOT_TELL);
    assert.equal(s.state, 'cannot-tell');
    assert.ok(s.lines.length > 0);
  });
  it('error names route', () => {
    const s = SURFACE.redirectPanel(ERROR_INPUT);
    assert.equal(s.state, 'error');
    assert.ok(s.text.includes('a'));
  });
});

describe('mutants', () => {
  it('M1 mark every change reddens', async () => {
    const m = await loadMutant(
      "    const marked = entry.path !== '' && entry.path === changedAt;",
      "    const marked = entry.path !== '' && (entry.path === changedAt || !!entry.redirectTo);",
    );
    const s = m.redirectPanel(WALKED);
    const marked = s.lines.filter((l) => l.includes('(changed)'));
    assert.ok(marked.length > 1, 'mutant marks more than one');
    // pin: only one marked
    let failure = null;
    try {
      assert.equal(marked.length, 1);
    } catch (e) {
      failure = e;
    }
    assert.ok(failure instanceof Error);
    reddens(() => {
      if (marked.length !== 1) throw new Error('not one');
    });
  });
  it('M2 cycle empty pane reddens', async () => {
    const m = await loadMutant(
      '...pane(message, [`route ${named}`]),',
      '...pane(message, []),',
    );
    const s = m.redirectPanel(CYCLE);
    assert.equal(s.lines.length, 0);
    let failure = null;
    try {
      assert.ok(s.lines.length > 0);
    } catch (e) {
      failure = e;
    }
    assert.ok(failure instanceof Error);
  });
  it('M3 guard decision reddens', async () => {
    const m = await loadMutant(
      "  const lines = [`route ${named}`, 'gated'];",
      "  const lines = [`route ${named}`, 'gated', 'guard allowed'];",
    );
    const s = m.redirectPanel(GATED_INPUT);
    assert.ok(/allowed/i.test(s.text));
    let failure = null;
    try {
      assert.ok(!/allowed/i.test(s.text));
    } catch (e) {
      failure = e;
    }
    assert.ok(failure instanceof Error);
  });
});
