// Tests for extension/resource-lifecycle.js — the join between the resource state machine the
// signal graph labels and the finding the panel renders.
//
// The module is evaluated in a bare `node:vm` context with no `document`, no `window`, no `console`,
// no clock and no `fetch`, which is the strongest available statement that the join reaches for
// none of them: a module that did would throw here rather than pass. The facts below are the ones
// `research/raw/m036-resource-graph.json` measured — `LoadingResource` at status `loading` with
// `isLoading: true`, `ResolvedResource` at `resolved`, `ErroredResource` at `error`, and
// `IdleResource` at `idle` because its params expression returns `undefined`, not because a params
// status was thrown.
//
// The states the join can produce are pinned exactly:
//
//   finding / loading     the resource identity, the `loading` status and the params status. No
//                         cause: the loader's own promise is not among the labelled fields.
//   finding / resolved    the same three fields, with `resolved`.
//   finding / error       the same three fields, with `error` and nothing about the cause.
//   finding / idle        idle by design: never loading and never an error (E3). The params field
//                         states the by-design meaning of the measured status.
//   cannot-tell           one of four reasons and nothing else: `no-resource` (E1),
//                         `labels-unreadable` (E2), `status-unavailable` (E4), `params-unavailable`.
//
// Every mutant is applied to a copy of the module source, after the unmutated module is pinned with
// the same function, and must redden that pin by name: a mutant that survives its pin proves the
// pin vacuous.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const SRC = readFileSync(
  new URL('../extension/resource-lifecycle.js', import.meta.url),
  'utf8',
);

/** The module with its comments removed, so a token scan reads code and not prose. */
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/**
 * The standalone module: a bare context with nothing in it but the source. No DOM, no console, no
 * clock and no network — a module that reached for any of them would throw here rather than pass.
 */
function standalone(source = SRC) {
  const context = createContext({});
  runInContext(source, context);
  const module = context.angularAiResourceLifecycle;
  assert.ok(
    module,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  assert.equal(typeof module.resourceLifecycle, 'function');
  return { lifecycle: module, context };
}

/**
 * A value from the vm context carries that context's own `Array` and `Object` prototypes, so it is
 * copied into this realm before a structural assertion reads it.
 */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The facts, one per subject the graph recorded. The params status is what the caller read. */
const LOADING_FACT = {
  resource: 'Resource#LoadingResource',
  status: 'loading',
  params: 'resolved',
};
const RESOLVED_FACT = {
  resource: 'Resource#ResolvedResource',
  status: 'resolved',
  params: 'resolved',
};
const ERROR_FACT = {
  resource: 'Resource#ErroredResource',
  status: 'error',
  params: 'resolved',
};
const IDLE_FACT = {
  resource: 'Resource#IdleResource',
  status: 'idle',
  params: 'idle',
};

/** What each fact must produce, exactly: three of the four fields, and no fifth. */
const LOADING_FINDING = {
  state: 'finding',
  resource: 'Resource#LoadingResource',
  status: 'loading',
  params: 'resolved',
};
const RESOLVED_FINDING = {
  state: 'finding',
  resource: 'Resource#ResolvedResource',
  status: 'resolved',
  params: 'resolved',
};
const ERROR_FINDING = {
  state: 'finding',
  resource: 'Resource#ErroredResource',
  status: 'error',
  params: 'resolved',
};
const IDLE_FINDING = {
  state: 'finding',
  resource: 'Resource#IdleResource',
  status: 'idle',
  params: 'idle (by design)',
};

/** The four reasons, each an absence the join can name. */
const REASONS = [
  'no-resource',
  'labels-unreadable',
  'params-unavailable',
  'status-unavailable',
];

/**
 * What a finding must never carry, as a claim and the pattern that names it. `loading`, `resolved`,
 * `error` and `idle` are the state machine's own vocabulary and are not in this list: the finding is
 * made of them. The scan runs over the module's code and over every emitted finding below.
 */
const FORBIDDEN_CLAIMS = [
  ['a loader', /\bloaders?\b/i],
  ['a promise', /\bpromises?\b/i],
  ['a network stall', /\b(stall|stalled|stuck|hung|hang|pending|timeout)\b/i],
  ['a network read', /\b(network|fetch|http|xhr)\b/i],
  ['a verdict', /\b(verdict|blocker|safe|recommend|should)\b/i],
  ['a cause', /\b(cause|causal|because|why)\b/i],
];

/** The claims a finding is scanned for, as text. */
function assertNoClaim(result, what) {
  const text = JSON.stringify(result);
  for (const [claim, pattern] of FORBIDDEN_CLAIMS) {
    assert.equal(
      pattern.test(text),
      false,
      `${what} must carry no ${claim}: ${text}`,
    );
  }
}

/** A pin that a value reddens: returns the failure the pin raises on it. */
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

describe('resource-lifecycle.js is pure', () => {
  it('evaluates in a context with no DOM, no console, no clock and no network, and publishes one namespace', () => {
    const { context } = standalone();
    for (const name of [
      'document',
      'window',
      'console',
      'Date',
      'performance',
      'setTimeout',
      'setInterval',
      'fetch',
      'XMLHttpRequest',
    ]) {
      assert.equal(
        context[name],
        undefined,
        `the module must not run with a ${name} in scope`,
      );
    }
    assert.equal(
      typeof context.angularAiResourceLifecycle.resourceLifecycle,
      'function',
    );
    assert.deepEqual(
      Object.keys(context.angularAiResourceLifecycle),
      ['resourceLifecycle'],
      'the module publishes one function and nothing else',
    );
  });

  it('holds no DOM read, no clock, no console, no network call and no claim in its code', () => {
    const body = code(SRC);
    for (const [what, pattern] of [
      ['a document read', /\bdocument\b/],
      ['a window read', /\bwindow\b/],
      ['a console call', /\bconsole\b/],
      ['a clock read', /\b(Date|performance|setTimeout|setInterval)\b/],
      ['a DOM query', /\b(querySelector|getElementById|createElement)\b/],
      ['a network call', /\b(fetch|XMLHttpRequest)\b/],
    ]) {
      assert.equal(
        pattern.test(body),
        false,
        `resource-lifecycle.js must contain no ${what}: ${pattern}`,
      );
    }
    for (const [claim, pattern] of FORBIDDEN_CLAIMS) {
      assert.equal(
        pattern.test(body),
        false,
        `resource-lifecycle.js must name no ${claim} outside its comments: ${pattern}`,
      );
    }
  });

  it('answers the same fact twice with the same value', () => {
    const { lifecycle } = standalone();
    assert.deepEqual(
      plain(lifecycle.resourceLifecycle(LOADING_FACT)),
      plain(lifecycle.resourceLifecycle(LOADING_FACT)),
    );
  });
});

describe('E1 — the empty read and the loading subject', () => {
  it('E1 — with no resource on the page no finding is produced', () => {
    const { lifecycle } = standalone();
    for (const fact of [
      {},
      null,
      undefined,
      { status: 'loading', params: 'resolved' },
      { resource: '', status: 'loading', params: 'resolved' },
      { resource: '   ', status: 'loading', params: 'resolved' },
      { resource: 42, status: 'loading', params: 'resolved' },
    ]) {
      const result = plain(lifecycle.resourceLifecycle(fact));
      assert.deepEqual(
        result,
        { state: 'cannot-tell', reason: 'no-resource' },
        `a fact with no resource to name must be cannot-tell/no-resource: ${JSON.stringify(fact)}`,
      );
      assert.equal('resource' in result, false);
      assert.equal('status' in result, false);
      assert.equal('params' in result, false);
    }
    console.log(
      'resource-lifecycle no-resource: {"state":"cannot-tell","reason":"no-resource"}',
    );
  });

  it('E1 — a resource whose status is loading yields a finding naming the identity, the status and the params status', () => {
    const { lifecycle } = standalone();
    const result = plain(lifecycle.resourceLifecycle(LOADING_FACT));
    assert.deepEqual(result, LOADING_FINDING);
    assert.deepEqual(
      Object.keys(result).sort(),
      ['params', 'resource', 'state', 'status'],
      'a finding carries the resource, the status and the params status and nothing else',
    );
    assert.equal(result.resource, 'Resource#LoadingResource');
    assert.equal(result.status, 'loading');
    assert.equal(result.params, 'resolved');
    assertNoClaim(result, 'a loading finding');
    console.log(`resource-lifecycle loading: ${JSON.stringify(result)}`);
  });
});

describe('the other statuses the graph reports', () => {
  it('a resolved resource names the resolved status and its params status', () => {
    const { lifecycle } = standalone();
    const result = plain(lifecycle.resourceLifecycle(RESOLVED_FACT));
    assert.deepEqual(result, RESOLVED_FINDING);
    assertNoClaim(result, 'a resolved finding');
    console.log(`resource-lifecycle resolved: ${JSON.stringify(result)}`);
  });

  it('an errored resource names the status and nothing about the cause', () => {
    const { lifecycle } = standalone();
    const result = plain(lifecycle.resourceLifecycle(ERROR_FACT));
    assert.deepEqual(result, ERROR_FINDING);
    assert.equal(
      result.status,
      'error',
      'the status is echoed as the graph reports it',
    );
    assert.deepEqual(
      Object.keys(result).sort(),
      ['params', 'resource', 'state', 'status'],
      'an error finding names no cause: the loader and the HTTP outcome are not readable',
    );
    const text = JSON.stringify(result);
    for (const cause of [
      'cause',
      'failed',
      'rejected',
      'threw',
      'HTTP',
      'status 500',
    ]) {
      assert.equal(
        text.includes(cause),
        false,
        `an error finding must say nothing about the cause: ${text}`,
      );
    }
    console.log(`resource-lifecycle error: ${JSON.stringify(result)}`);
  });
});

describe('E3 — idle is by design', () => {
  it('E3 — idle params yield idle by design, never loading and never an error', () => {
    const { lifecycle } = standalone();
    const result = plain(lifecycle.resourceLifecycle(IDLE_FACT));
    assert.deepEqual(result, IDLE_FINDING);
    assert.equal(
      result.state,
      'finding',
      'idle is a status read, so it is a finding',
    );
    assert.equal(result.status, 'idle');
    assert.equal(result.params, 'idle (by design)');
    const text = JSON.stringify(result);
    assert.equal(
      text.includes('loading'),
      false,
      `an idle-by-design finding must never say loading: ${text}`,
    );
    assert.equal(
      text.includes('error'),
      false,
      `an idle-by-design finding must never name an error: ${text}`,
    );
    console.log(`resource-lifecycle idle: ${JSON.stringify(result)}`);
  });

  it('E3 — the idle answer does not depend on a params status being read at all', () => {
    // The graph reports `idle`, and `idle` is what an undefined request becomes: the by-design
    // statement is the measured status, never an inference from a params value.
    const { lifecycle } = standalone();
    for (const params of [undefined, null, 'idle']) {
      const result = plain(
        lifecycle.resourceLifecycle({
          resource: 'Resource#IdleResource',
          status: 'idle',
          params,
        }),
      );
      assert.deepEqual(
        result,
        IDLE_FINDING,
        `params ${JSON.stringify(params)}`,
      );
    }
    console.log(
      'resource-lifecycle idle without params read: {"state":"finding","resource":"Resource#IdleResource","status":"idle","params":"idle (by design)"}',
    );
  });
});

describe('E2 and E4 — the absent reads', () => {
  it('E2 — with the label read withheld no finding is produced', () => {
    const { lifecycle } = standalone();
    for (const fact of [
      { labels: false },
      {
        labels: false,
        resource: 'Resource#LoadingResource',
        status: 'loading',
      },
      {
        labels: false,
        resource: 'Resource#IdleResource',
        status: 'idle',
        params: 'idle',
      },
    ]) {
      const result = plain(lifecycle.resourceLifecycle(fact));
      assert.deepEqual(result, {
        state: 'cannot-tell',
        reason: 'labels-unreadable',
      });
      assert.equal('resource' in result, false);
      assert.equal('status' in result, false);
      assert.equal('params' in result, false);
    }
    console.log(
      'resource-lifecycle labels-unreadable: {"state":"cannot-tell","reason":"labels-unreadable"}',
    );
  });

  it('E4 — a status that could not be read yields cannot-tell/status-unavailable, and no stuck request is named', () => {
    const { lifecycle } = standalone();
    for (const fact of [
      { resource: 'Resource#LoadingResource' },
      { resource: 'Resource#LoadingResource', status: null },
      { resource: 'Resource#LoadingResource', status: 42 },
      { resource: 'Resource#LoadingResource', status: 'LOADING' },
      { resource: 'Resource#LoadingResource', status: 'settled' },
      { resource: 'Resource#LoadingResource', status: '' },
    ]) {
      const result = plain(lifecycle.resourceLifecycle(fact));
      assert.deepEqual(
        result,
        { state: 'cannot-tell', reason: 'status-unavailable' },
        `an unreadable status must be cannot-tell/status-unavailable: ${JSON.stringify(fact)}`,
      );
      assert.equal('status' in result, false);
      assert.equal('params' in result, false);
      assertNoClaim(result, 'a status-unavailable answer');
    }
    console.log(
      'resource-lifecycle status-unavailable: {"state":"cannot-tell","reason":"status-unavailable"}',
    );
  });

  it('a params status that was not read yields cannot-tell/params-unavailable', () => {
    const { lifecycle } = standalone();
    for (const fact of [
      { resource: 'Resource#ResolvedResource', status: 'resolved' },
      { resource: 'Resource#ResolvedResource', status: 'resolved', params: '' },
      { resource: 'Resource#ResolvedResource', status: 'resolved', params: 42 },
      {
        resource: 'Resource#ResolvedResource',
        status: 'resolved',
        params: 'settled',
      },
    ]) {
      const result = plain(lifecycle.resourceLifecycle(fact));
      assert.deepEqual(
        result,
        { state: 'cannot-tell', reason: 'params-unavailable' },
        `an unread params status must be cannot-tell/params-unavailable: ${JSON.stringify(fact)}`,
      );
    }
    console.log(
      'resource-lifecycle params-unavailable: {"state":"cannot-tell","reason":"params-unavailable"}',
    );
  });

  it('refuses a cause offered as a params status instead of rendering it', () => {
    const { lifecycle } = standalone();
    const result = plain(
      lifecycle.resourceLifecycle({
        resource: 'Resource#LoadingResource',
        status: 'loading',
        params: 'the loader never resolved',
      }),
    );
    assert.deepEqual(result, {
      state: 'cannot-tell',
      reason: 'params-unavailable',
    });
    assert.equal(JSON.stringify(result).includes('loader'), false);
  });

  it('uses only the four reasons the contract names', () => {
    const { lifecycle } = standalone();
    const reasons = new Set();
    for (const fact of [
      {},
      { labels: false },
      { resource: 'Resource#A' },
      { resource: 'Resource#A', status: 'resolved' },
      LOADING_FACT,
      IDLE_FACT,
    ]) {
      const result = plain(lifecycle.resourceLifecycle(fact));
      if (result.reason !== undefined) reasons.add(result.reason);
    }
    for (const reason of reasons) {
      assert.equal(
        REASONS.includes(reason),
        true,
        `an unexpected reason was emitted: ${reason}`,
      );
    }
    assert.deepEqual([...reasons].sort(), [...REASONS].sort());
  });
});

/**
 * The pin a cause inside the loader reddens: a finding is exactly the resource, the status and the
 * params status. It is the same function for the unmutated module and for the mutant, so the pin is
 * proven to pass before the mutation is shown to bite.
 */
function pinNoCause(lifecycle) {
  const result = plain(lifecycle.resourceLifecycle(LOADING_FACT));
  assert.deepEqual(
    Object.keys(result).sort(),
    ['params', 'resource', 'state', 'status'],
    'a finding carries the resource, the status and the params status and no cause',
  );
  assert.deepEqual(result, LOADING_FINDING);
  assertNoClaim(result, 'a loading finding');
  return result;
}

/**
 * The pin idle-reported-as-loading reddens: the idle subject is idle by design, never loading and
 * never an error. Shared by the unmutated module and the mutant, for the same reason.
 */
function pinIdleIsByDesign(lifecycle) {
  const result = plain(lifecycle.resourceLifecycle(IDLE_FACT));
  assert.equal(
    result.status,
    'idle',
    'the idle subject is idle by design, never loading',
  );
  assert.equal(
    result.params,
    'idle (by design)',
    'an idle finding says idle by design in its params field',
  );
  const text = JSON.stringify(result);
  assert.equal(text.includes('loading'), false, `idle is not loading: ${text}`);
  assert.equal(text.includes('error'), false, `idle is not an error: ${text}`);
  assert.deepEqual(result, IDLE_FINDING);
  return result;
}

describe('mutants redden by name', () => {
  it('reddens by name: a cause named inside the loader', () => {
    // Pin the unmutated module first, so the mutation below is the only cause of a red pin.
    const { lifecycle } = standalone();
    const clean = pinNoCause(lifecycle);
    assert.equal('cause' in clean, false);

    const anchor = '      params: params,\n    };';
    const mutated = SRC.replace(
      anchor,
      "      params: params,\n      cause: 'the loader did not answer',\n    };",
    );
    assert.notEqual(
      mutated,
      SRC,
      'the cause mutation target is gone from resource-lifecycle.js — restate the bite in scripts/resource-lifecycle.test.mjs',
    );
    const mutant = standalone(mutated).lifecycle;
    const mutantResult = plain(mutant.resourceLifecycle(LOADING_FACT));
    assert.equal(
      mutantResult.cause,
      'the loader did not answer',
      'the mutant carries the cause the pin must refuse',
    );

    const failure = reddens(() => pinNoCause(mutant), 'the no-cause pin');
    assert.match(
      failure.message,
      /and no cause/,
      `the cause mutant must redden the no-cause pin by name: ${failure.message}`,
    );
    console.log(
      `resource-lifecycle M1 (cause inside the loader) -> ${JSON.stringify(mutantResult)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: idle reported as loading', () => {
    // Pin the unmutated module first, so the mutation below is the only cause of a red pin.
    const { lifecycle } = standalone();
    pinIdleIsByDesign(lifecycle);

    const anchor =
      '    if (status === IDLE || read.params === IDLE)\n' +
      '      return finding(resource, status, IDLE_BY_DESIGN);';
    const mutated = SRC.replace(
      anchor,
      '    if (status === IDLE || read.params === IDLE)\n' +
        '      return finding(resource, LOADING, LOADING);',
    );
    assert.notEqual(
      mutated,
      SRC,
      'the idle mutation target is gone from resource-lifecycle.js — restate the bite in scripts/resource-lifecycle.test.mjs',
    );
    const mutant = standalone(mutated).lifecycle;
    const mutantResult = plain(mutant.resourceLifecycle(IDLE_FACT));
    assert.equal(
      mutantResult.status,
      'loading',
      'the mutant reports the idle subject as loading',
    );

    const failure = reddens(
      () => pinIdleIsByDesign(mutant),
      'the idle-by-design pin',
    );
    assert.match(
      failure.message,
      /idle by design/,
      `the idle mutant must redden the idle-by-design pin by name: ${failure.message}`,
    );
    console.log(
      `resource-lifecycle M2 (idle as loading) -> ${JSON.stringify(mutantResult)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });
});
