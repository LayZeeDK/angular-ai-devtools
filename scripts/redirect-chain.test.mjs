import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { after, describe, it } from 'node:test';

const SRC = readFileSync(
  new URL('../extension/redirect-chain.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m030-router-config.json', import.meta.url),
    'utf8',
  ),
);
const CONFIG = RECORDING.config;

function loadBare(source = SRC) {
  const context = createContext({});
  runInContext(source, context);
  return context.angularAiRedirectChain;
}

let mutantDir = null;
let mutantCount = 0;

function loadMutant(anchor, replacement) {
  const source = SRC.replace(anchor, replacement);
  assert.notEqual(
    source,
    SRC,
    `the mutation must change the module: ${JSON.stringify(anchor)}`,
  );
  mutantDir ??= mkdtempSync(join(tmpdir(), 'redirect-chain-'));
  mutantCount += 1;
  const file = join(mutantDir, `redirect-chain-mutant-${mutantCount}.js`);
  writeFileSync(file, source, 'utf8');
  return loadBare(readFileSync(file, 'utf8'));
}

after(() => {
  if (mutantDir !== null) rmSync(mutantDir, { recursive: true, force: true });
});

function reddens(pin, what) {
  let failure = null;
  try {
    pin();
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    `${what} passed on the mutant, so the mutation is not caught`,
  );
  return failure;
}

describe('redirect chain (E1/E2/E3)', () => {
  it('E1 — entered routes are declaration order, destination, and the single changedAt route', () => {
    const api = loadBare();
    const r = api.walk(CONFIG, 'redirect');
    assert.equal(r.state, 'redirected');
    assert.equal(r.chain.map((e) => e.path).join(','), 'redirect,landing');
    assert.equal(r.destination, 'landing');
    assert.equal(r.changedAt, 'redirect');
  });

  it('E2 — with the configuration withheld or unreadable the module returns cannot-tell and never a chain (nothing else supplied it)', () => {
    for (const cfg of [null, undefined, 'unreadable', 42, {}]) {
      const r = loadBare().walk(cfg, 'x');
      assert.equal(r.state, 'cannot-tell');
      assert.equal(Object.prototype.hasOwnProperty.call(r, 'chain'), false);
    }
  });

  it('E3 — a revisiting configuration names the repeated route and stops', () => {
    const api = loadBare();
    const r = api.walk(CONFIG, 'loop-a');
    assert.equal(r.state, 'cycle');
    assert.equal(r.route, 'loop-a');
    assert.equal(r.chain.length, 2);
  });

  it('reports a guard as presence (gated) without naming a decision', () => {
    const api = loadBare();
    const r = api.walk(CONFIG, 'gated');
    assert.equal(r.gated, true);
    assert.equal(typeof r.gated, 'boolean');
  });

  it('stops at the loadChildren boundary and names it', () => {
    const api = loadBare();
    const r = api.walk(CONFIG, 'lazy');
    assert.equal(r.stoppedAt, 'lazy');
  });
});

describe('the mutants each redden the pin they must', () => {
  it('M1 — walking past a loadChildren boundary reddens the stoppedAt pin', async (t) => {
    const mutant = loadMutant(
      `      if (route.loadChildren) {
        stoppedAt = route.path;
        break;
      }`,
      `      if (false && route.loadChildren) {
        stoppedAt = route.path;
        break;
      }`,
    );
    const failure = reddens(() => {
      assert.equal(mutant.walk(CONFIG, 'lazy').stoppedAt, 'lazy');
    }, 'the stoppedAt pin');
    t.diagnostic(`M1 walk-past-lazy failure: ${failure.message}`);
    assert.equal(loadBare().walk(CONFIG, 'lazy').stoppedAt, 'lazy');
  });

  it("M2 — reporting a guard's decision reddens the no-decision pin", async (t) => {
    const mutant = loadMutant(
      `      if (Array.isArray(route.canActivate) && route.canActivate.length > 0) {
        gated = true;
      }`,
      `      if (Array.isArray(route.canActivate) && route.canActivate.length > 0) {
        gated = route.canActivate[0];
      }`,
    );
    const failure = reddens(() => {
      const r = mutant.walk(CONFIG, 'gated');
      assert.equal(r.gated, true);
      assert.equal(typeof r.gated, 'boolean');
    }, 'the no-decision pin');
    t.diagnostic(`M2 guard-decision failure: ${failure.message}`);
    const r = loadBare().walk(CONFIG, 'gated');
    assert.equal(r.gated, true);
    assert.equal(typeof r.gated, 'boolean');
  });

  it('M3 — recursing on a cycle reddens the cycle pin', async (t) => {
    const mutant = loadMutant(
      'if (visited.has(current))',
      'if (false && visited.has(current))',
    );
    const failure = reddens(() => {
      const r = mutant.walk(CONFIG, 'loop-a');
      assert.equal(r.state, 'cycle');
      assert.equal(r.route, 'loop-a');
    }, 'the cycle pin');
    t.diagnostic(`M3 recurse-on-cycle failure: ${failure.message}`);
    const r = loadBare().walk(CONFIG, 'loop-a');
    assert.equal(r.state, 'cycle');
    assert.equal(r.route, 'loop-a');
  });
});
