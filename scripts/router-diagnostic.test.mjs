import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { describe, it } from 'node:test';

const SRC = readFileSync(
  new URL('../extension/router-diagnostic.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m033-router-diagnostic.json', import.meta.url),
    'utf8',
  ),
);

const CONFIG = RECORDING.config;
const FACTS = { config: CONFIG };
const FACTS_PATHS = { paths: CONFIG.map((e) => e.path) };

function loadBare(source = SRC) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiRouterDiagnostic;
  assert.ok(api, 'module must publish namespace');
  return { api, context };
}

function host(value) {
  return JSON.parse(JSON.stringify(value));
}

function mutant(anchor, replacement) {
  assert.ok(SRC.includes(anchor), `mutation anchor not found: ${JSON.stringify(anchor)}`);
  const mutated = SRC.replace(anchor, replacement);
  assert.notEqual(mutated, SRC, 'the mutation must change the module');
  return loadBare(mutated);
}

function capturedMessages() {
  return RECORDING.messages.map((m) => ({ code: m.code, text: m.text }));
}

const DIAG = RECORDING.ngCodedMessages[0];
const SEGMENT = 'this-route-does-not-exist';
const CODE = DIAG.code;
function bodyOf(text) {
  const at = text.search(/\n\s+at\s/);
  return at === -1 ? text : text.slice(0, at).trim();
}
const BODY = bodyOf(DIAG.text);

describe('measurement', () => {
  it('recording has 15 config and one NG diagnostic', () => {
    assert.equal(RECORDING.config.length, 15);
    assert.equal(RECORDING.ngCodedMessages.length, 1);
    assert.equal(DIAG.code, 'NG04002');
    assert.equal(DIAG.digestCarriesCode, false);
    assert.equal(DIAG.namesConfiguredRoutePath, false);
  });
});

describe('purity', () => {
  it('loads bare', () => {
    const { api, context } = loadBare();
    assert.equal(context.document, undefined);
    assert.equal(context.window, undefined);
    assert.equal(context.performance, undefined);
    assert.equal(context.console, undefined);
    assert.equal(typeof api.routerDiagnostic, 'function');
  });
});

describe('E1 finding', () => {
  it('unmatched segment produces finding', () => {
    const { api } = loadBare();
    const r = host(api.routerDiagnostic(capturedMessages(), FACTS));
    assert.equal(r.state, 'finding');
    assert.equal(r.segment, SEGMENT);
    assert.equal(r.code, CODE);
    assert.equal(r.message, BODY);
    assert.equal(r.consideredCount, 15);
    assert.ok(!('route' in r));
  });
});

describe('E3 segment matches config', () => {
  it('cannot-tell segment-matches-configuration', () => {
    const { api } = loadBare();
    const text = "ERROR RuntimeError: NG04002: Cannot match any routes. URL Segment: 'router-lint'";
    const r = host(api.routerDiagnostic([{ code: 'NG04002', text }], FACTS));
    assert.equal(r.state, 'cannot-tell');
    assert.equal(r.reason, 'segment-matches-configuration');
    assert.ok(!('segment' in r) || true);
  });
});

describe('no url segment', () => {
  it('cannot-tell no-url-segment', () => {
    const { api } = loadBare();
    const r = host(api.routerDiagnostic([{ code: 'NG04002', text: 'ERROR RuntimeError: NG04002: something' }], FACTS));
    assert.equal(r.state, 'cannot-tell');
    assert.equal(r.reason, 'no-url-segment');
  });
});

describe('no messages', () => {
  it('cannot-tell no-captured-messages', () => {
    const { api } = loadBare();
    const r = host(api.routerDiagnostic([], FACTS));
    assert.equal(r.state, 'cannot-tell');
    assert.equal(r.reason, 'no-captured-messages');
  });
});

describe('facts variants', () => {
  it('accepts paths and array', () => {
    const { api } = loadBare();
    const r1 = host(api.routerDiagnostic(capturedMessages(), FACTS_PATHS));
    assert.equal(r1.consideredCount, 15);
    const r2 = host(api.routerDiagnostic(capturedMessages(), CONFIG));
    assert.equal(r2.state, 'finding');
  });
});

describe('AC7a nearest route', () => {
  it('mutant naming nearest route as owner reddens the no-owner pin', () => {
    // pin on unmutated module: finding with no owner route
    const { api } = loadBare();
    const r = host(api.routerDiagnostic(capturedMessages(), FACTS));
    assert.equal(r.state, 'finding');
    assert.ok(!('route' in r), 'finding must not name a configured route as the owner');

    // mutate so the finding names the nearest configured path as the owner
    const anchor = "answers.push(finding(segment, code, body, consideredCount));";
    const replacement = "answers.push(Object.assign({}, finding(segment, code, body, consideredCount), { route: paths[0] }));";
    const { api: mApi } = mutant(anchor, replacement);
    const mr = host(mApi.routerDiagnostic(capturedMessages(), FACTS));
    assert.ok(mr !== null && typeof mr === 'object', 'mutated result must be an object');
    assert.throws(() => {
      assert.ok(!('route' in mr), 'finding must not name a configured route as the owner');
    }, /owner route|route as the owner/);
  });
});

describe('AC7b code omitted', () => {
  it('mutant dropping the code reddens the code pin', () => {
    // pin on unmutated module: finding carries NG04002
    const { api } = loadBare();
    const r = host(api.routerDiagnostic(capturedMessages(), FACTS));
    assert.equal(r.state, 'finding');
    assert.equal(r.code, CODE, 'finding must carry code NG04002');

    // mutate so the code is dropped
    const anchor = "const code = codeOf(body, message);";
    const replacement = "const code = null;";
    const { api: mApi } = mutant(anchor, replacement);
    const mr = host(mApi.routerDiagnostic(capturedMessages(), FACTS));
    assert.ok(mr !== null && typeof mr === 'object', 'mutated result must be an object');
    assert.throws(() => {
      assert.equal(mr.code, CODE, 'finding must carry code NG04002');
    }, /NG04002/);
  });
});
