// Tests for extension/resource-lifecycle.js — the join between the resource state machine the
// signal graph labels and the finding the panel renders.
//
// The module is evaluated in a bare `node:vm` context. Two purity pins carry the statement that the
// join reaches for no DOM, no clock, no console and no network, and both are made *inside* the
// context: a read of the sandbox object from this side never forwards intrinsics, so
// `context.Date === undefined` was true of every module ever written, including one that called
// `Date.now()`. Inside a real context `typeof console` is `object` and `typeof Date` is `function`,
// so the only pin that can bite is a context in which each of those names is a trap.
//
// Every fact is stated for what it is. `research/raw/m036-resource-graph.json` measures the identity
// the graph labels each subject by and the value of its `Resource#<name>.status` computed node —
// `LoadingResource` at `loading` with `isLoading: true`, `ResolvedResource` at `resolved`,
// `ErroredResource` at `error`, and `IdleResource` at `idle` because its params expression returns
// `undefined`, not because a params status was thrown. The recording measures no params status at
// all: every subject's `extRequest` node is recorded with `value: null`. A `params` value in a fact
// below is therefore a constructed caller input, and every expectation built on one is an input
// echo, never a measurement.
//
// The states the join can produce are pinned exactly:
//
//   finding / idle        idle by design: never loading and never an error (E3). The only finding
//                         the recording measures end to end, because the status alone decides it.
//   finding / loading     the resource identity, the `loading` status and the params status. No
//                         cause: the loader's own promise is not among the labelled fields.
//   finding / reloading   the same identity and the `reloading` status, with the reload named in the
//                         params field: a reload is not a first load, and the five statuses are five
//                         answers.
//   finding / resolved    the same three fields, with `resolved`.
//   finding / error       the same three fields, with `error` and nothing about the cause.
//   cannot-tell           one of five reasons and nothing else: `no-resource` (E1),
//                         `labels-unreadable` (E2), `status-unavailable` (E4), `params-unavailable`,
//                         and `resource-unnamed` for a value in the identity slot that is not the
//                         shape the graph labels.
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
 * The standalone module: a bare context holding the source and whatever the caller puts in it. No
 * DOM, no clock, no console and no network are installed by `node:vm` beyond the two every
 * JavaScript context has (`Date`, and Node's `console`), which the purity pins below handle.
 */
function standalone(source = SRC, sandbox = {}) {
  const context = createContext(sandbox);
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

/**
 * The globals the module must never reach for. `document`, `window`, `performance`, the two timers,
 * `fetch` and `XMLHttpRequest` are absent from a `node:vm` context altogether; `Date` and `console`
 * are in every context there is, so only a trap can catch a module that used them.
 */
const HOST_GLOBALS = [
  'document',
  'window',
  'console',
  'Date',
  'performance',
  'setTimeout',
  'setInterval',
  'fetch',
  'XMLHttpRequest',
];

/**
 * A global that throws when it is read, called or constructed, naming itself in the error. A module
 * that reached for the clock or the console inside the context hits this on the first touch, which
 * is what makes the guard a guard rather than a decoration.
 */
function tripwire(name) {
  const reached = () => {
    throw new Error(`the module reached for ${name}`);
  };
  return new Proxy(function tripwire() {}, {
    get: reached,
    set: reached,
    has: reached,
    apply: reached,
    construct: reached,
  });
}

/**
 * Runs the join *inside* a context where every one of `HOST_GLOBALS` is a trap, and returns the
 * answer it produced. The fact is handed in through the sandbox, so nothing about the call crosses
 * from this realm except the data.
 */
function guarded(source, fact) {
  const sandbox = { __fact: fact };
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  const { context } = standalone(source, sandbox);
  return plain(
    runInContext(
      'angularAiResourceLifecycle.resourceLifecycle(__fact)',
      context,
    ),
  );
}

/** The armed-traps context on its own, for the assertions that prove the guard is live. */
function guardedContext() {
  const sandbox = {};
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  return createContext(sandbox);
}

/**
 * The fields the recording measured for each subject: the identity the graph labels it by, and the
 * value of its `Resource#<name>.status` computed node.
 */
const MEASURED_LOADING = {
  resource: 'Resource#LoadingResource',
  status: 'loading',
};
const MEASURED_RESOLVED = {
  resource: 'Resource#ResolvedResource',
  status: 'resolved',
};
const MEASURED_ERROR = {
  resource: 'Resource#ErroredResource',
  status: 'error',
};
const MEASURED_IDLE = { resource: 'Resource#IdleResource', status: 'idle' };

/**
 * The reload subject, which the recording does not carry: no captured subject was mid-reload, so
 * `reloading` is verified from source instead — `projectStatusOfState` answers it for a load that is
 * not the first one (`_resource-chunk.mjs:504`). The identity is the measured label of the subject
 * whose reload is in flight, which is what a reload is a reload of.
 */
const MEASURED_RELOADING = {
  resource: 'Resource#ResolvedResource',
  status: 'reloading',
};

/**
 * A params status the recording never measured. Every subject's `Resource#<name>.extRequest` node is
 * recorded with `value: null`, so no params status exists in the measurement for any of the four
 * subjects. The value below is a CONSTRUCTED caller input: it exercises the join's echo and its
 * gate, and the findings it produces are pinned as echoes of an input, never as a measurement.
 */
const CONSTRUCTED_PARAMS = 'resolved';
const CONSTRUCTED_IDLE_PARAMS = 'idle';

const LOADING_FACT = { ...MEASURED_LOADING, params: CONSTRUCTED_PARAMS };
const RESOLVED_FACT = { ...MEASURED_RESOLVED, params: CONSTRUCTED_PARAMS };
const ERROR_FACT = { ...MEASURED_ERROR, params: CONSTRUCTED_PARAMS };
const IDLE_FACT = { ...MEASURED_IDLE, params: CONSTRUCTED_IDLE_PARAMS };
const RELOADING_FACT = { ...MEASURED_RELOADING, params: 'reloading' };

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
const RELOADING_FINDING = {
  state: 'finding',
  resource: 'Resource#ResolvedResource',
  status: 'reloading',
  params: 'reloading (a fresh value for the same dependencies)',
};

/** The five reasons, each an absence the join can name. */
const REASONS = [
  'no-resource',
  'labels-unreadable',
  'params-unavailable',
  'status-unavailable',
  'resource-unnamed',
];

/**
 * What a finding must never carry, as a claim and the pattern that names it. `loading`, `reloading`,
 * `resolved`, `error` and `idle` are the state machine's own vocabulary and are not in this list:
 * the finding is made of them. The scan runs over the module's code and over every emitted finding
 * below.
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
  it('evaluates in a context with no DOM, no clock, no console and no network, read from inside', () => {
    const { context } = standalone();
    // Read inside the context: `context[name]` from this side reads the sandbox object, which never
    // carried these names, so it answers `undefined` for a module that used any of them.
    for (const name of [
      'document',
      'window',
      'performance',
      'setTimeout',
      'setInterval',
      'fetch',
      'XMLHttpRequest',
    ]) {
      assert.equal(
        runInContext(`typeof ${name}`, context),
        'undefined',
        `the module must not run with a ${name} in scope`,
      );
    }
    // Two names no JavaScript context withholds: V8 installs `Date` in every realm and Node installs
    // `console` in every context it creates. This records what is really in scope, and the next test
    // pins that the module reaches for neither.
    assert.equal(
      runInContext('typeof Date', context),
      'function',
      'a vm context carries V8\u2019s Date whatever the sandbox says, so the clock cannot be withheld',
    );
    assert.equal(
      runInContext('typeof console', context),
      'object',
      'a vm context carries Node\u2019s console whatever the sandbox says, so the console cannot be withheld',
    );
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

  it('reaches for no host global when the join runs: each of them is a trap inside the context', () => {
    // The traps are armed, and they are proven armed before anything is asserted through them: a
    // guard that did not throw would make every pin below pass on any module.
    const context = guardedContext();
    assert.throws(
      () => runInContext('Date.now()', context),
      /the module reached for Date/,
      'the Date trap must bite, or the guard is decoration',
    );
    assert.throws(
      () => runInContext('console.log("x")', context),
      /the module reached for console/,
      'the console trap must bite, or the guard is decoration',
    );
    assert.throws(
      () => runInContext('new Date(0).getTime()', context),
      /the module reached for Date/,
      'a constructed clock read must be trapped too',
    );
    // The pin, on the unmutated module, run wholly inside the guarded context.
    const result = pinRunsWithNoHostGlobalInScope(SRC);
    console.log(`resource-lifecycle guarded: ${JSON.stringify(result)}`);
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

describe('the fifth status — a reload is not a first load', () => {
  it('names the reload rather than the load, and carries no cause', () => {
    const { lifecycle } = standalone();
    const result = plain(lifecycle.resourceLifecycle(RELOADING_FACT));
    assert.deepEqual(result, RELOADING_FINDING);
    assert.equal(
      result.status,
      'reloading',
      'the status is echoed as `projectStatusOfState` reports it',
    );
    assert.notEqual(
      result.status,
      'loading',
      'a reload is a second load and is not reported as a first one',
    );
    assert.match(
      result.params,
      /\breloading\b/,
      'the reloading finding names the reload',
    );
    assert.deepEqual(
      Object.keys(result).sort(),
      ['params', 'resource', 'state', 'status'],
      'a reloading finding carries the resource, the status and the reload and nothing else',
    );
    assertNoClaim(result, 'a reloading finding');
    console.log(`resource-lifecycle reloading: ${JSON.stringify(result)}`);
  });

  it('is a different answer from loading, which is why the fifth status exists', () => {
    const { lifecycle } = standalone();
    const reloading = plain(lifecycle.resourceLifecycle(RELOADING_FACT));
    const loading = plain(lifecycle.resourceLifecycle(LOADING_FACT));
    assert.notDeepEqual(reloading, loading);
    assert.notEqual(reloading.status, loading.status);
    // The reload's own words, not the first load's: a spinner that outlives a response is answered
    // with the reload, so the panel cannot say the request has not answered when it has.
    assert.notEqual(reloading.params, loading.params);
    assert.equal(
      reloading.params.includes('same dependencies'),
      true,
      'the reloading finding says what a reload is: a fresh value for the same dependencies',
    );
    assert.equal(
      loading.params.includes('same dependencies'),
      false,
      'a first load says nothing about a reload',
    );
  });

  it('answers a reloading status with no params read at all, because the status carries the meaning', () => {
    const { lifecycle } = standalone();
    const result = plain(lifecycle.resourceLifecycle(MEASURED_RELOADING));
    assert.deepEqual(
      result,
      RELOADING_FINDING,
      'the reload is a finding from the measured fields alone, like idle',
    );
  });

  it('accepts `params: reloading` rather than refusing it as an unknown value', () => {
    const { lifecycle } = standalone();
    for (const fact of [
      RELOADING_FACT,
      { ...MEASURED_LOADING, params: 'reloading' },
      { ...MEASURED_RESOLVED, params: 'reloading' },
    ]) {
      const result = plain(lifecycle.resourceLifecycle(fact));
      assert.equal(
        result.state,
        'finding',
        `a params status of reloading is a read, not an absence: ${JSON.stringify(fact)} -> ${JSON.stringify(result)}`,
      );
      assert.notEqual(result.reason, 'params-unavailable');
    }
    const echoed = plain(
      lifecycle.resourceLifecycle({
        ...MEASURED_LOADING,
        params: 'reloading',
      }),
    );
    assert.equal(
      echoed.params,
      'reloading',
      'a params status of reloading is echoed as it arrived',
    );
    console.log(
      `resource-lifecycle params reloading: ${JSON.stringify(echoed)}`,
    );
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
        lifecycle.resourceLifecycle({ ...MEASURED_IDLE, params }),
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

describe('the unmeasured params status is an absence, not an assumed value', () => {
  it('answers the measured fields alone with cannot-tell/params-unavailable', () => {
    // The recording measures an identity and a `.status` value for each subject and records every
    // `extRequest` node with `value: null`: no params status exists in it. A fact built from the
    // measured fields therefore has no params status to report, and the join says so instead of
    // completing the finding with a value nobody read.
    const { lifecycle } = standalone();
    for (const fact of [MEASURED_LOADING, MEASURED_RESOLVED, MEASURED_ERROR]) {
      const result = plain(lifecycle.resourceLifecycle(fact));
      assert.deepEqual(
        result,
        { state: 'cannot-tell', reason: 'params-unavailable' },
        `an unmeasured params read is an absence: ${JSON.stringify(fact)} -> ${JSON.stringify(result)}`,
      );
      assert.equal('params' in result, false);
      assert.equal('status' in result, false);
    }
  });

  it('answers the measured idle subject with a finding, because its status alone decides', () => {
    // The one subject the recording measures end to end: `idle` is the whole answer, so no second
    // reading is needed and none is invented.
    const { lifecycle } = standalone();
    const result = plain(lifecycle.resourceLifecycle(MEASURED_IDLE));
    assert.deepEqual(result, IDLE_FINDING);
    console.log(
      `resource-lifecycle measured idle, no params: ${JSON.stringify(result)}`,
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

  it('uses only the five reasons the contract names', () => {
    const { lifecycle } = standalone();
    const reasons = new Set();
    for (const fact of [
      {},
      { labels: false },
      { resource: 'Resource#A' },
      { resource: 'Resource#A', status: 'resolved' },
      { resource: 'a cause offered as an identity', status: 'resolved' },
      LOADING_FACT,
      IDLE_FACT,
      RELOADING_FACT,
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

describe('the identity is the graph\u2019s, not the caller\u2019s', () => {
  it('refuses a cause offered as an identity instead of echoing it into a finding', () => {
    // The one field wave 1 echoed verbatim. `Resource#<name>` is the shape `createDebugNameObject`
    // gives a resource node, so anything else was never emitted by the graph and is not an identity.
    const { lifecycle } = standalone();
    for (const resource of [
      'the loader never resolved',
      'Resource',
      'Resource#',
      'Resource# ',
      ' resource#LoadingResource',
      'Resource#LoadingResource ',
      'resource#LoadingResource',
      '#LoadingResource',
      42,
      null,
    ]) {
      const result = plain(
        lifecycle.resourceLifecycle({
          ...MEASURED_LOADING,
          params: CONSTRUCTED_PARAMS,
          resource,
        }),
      );
      assert.equal(
        result.state,
        'cannot-tell',
        `an identity the graph never labels must not reach a finding: ${JSON.stringify(resource)} -> ${JSON.stringify(result)}`,
      );
      const reason =
        typeof resource === 'string' && resource.trim() !== ''
          ? 'resource-unnamed'
          : 'no-resource';
      assert.deepEqual(
        result,
        { state: 'cannot-tell', reason },
        `an identity the graph never labels must be cannot-tell/${reason}: ${JSON.stringify(resource)}`,
      );
      assert.equal('resource' in result, false);
      assert.equal('status' in result, false);
      assert.equal(JSON.stringify(result).includes('loader'), false);
    }
    console.log(
      `resource-lifecycle resource-unnamed: ${JSON.stringify(
        plain(
          lifecycle.resourceLifecycle({
            ...MEASURED_LOADING,
            params: CONSTRUCTED_PARAMS,
            resource: 'the loader never resolved',
          }),
        ),
      )}`,
    );
  });

  it('echoes the shape the graph does label, unchanged', () => {
    const { lifecycle } = standalone();
    for (const resource of [
      'Resource#LoadingResource',
      'Resource#A',
      'Resource#with.dots',
      'Resource#with-dashes_and_underscores',
    ]) {
      const result = plain(
        lifecycle.resourceLifecycle({
          resource,
          status: 'loading',
          params: CONSTRUCTED_PARAMS,
        }),
      );
      assert.equal(
        result.state,
        'finding',
        `Resource#<name> is an identity: ${resource}`,
      );
      assert.equal(
        result.resource,
        resource,
        'the identity is echoed as the graph labels it',
      );
    }
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

/**
 * The pin a module that reached for the clock or the console reddens: it runs the join inside a
 * context where each host global throws, and a reach for one is an error naming the global. A bare
 * context answers such a module exactly as it answers the clean one, which is why this pin is the
 * only one of the two that can catch it.
 */
function pinRunsWithNoHostGlobalInScope(source) {
  const loading = guarded(source, LOADING_FACT);
  assert.deepEqual(
    loading,
    LOADING_FINDING,
    'the join answers a measured fact while every host global in scope is a trap',
  );
  const idle = guarded(source, MEASURED_IDLE);
  assert.deepEqual(
    idle,
    IDLE_FINDING,
    'the join answers the idle subject while every host global in scope is a trap',
  );
  return loading;
}

/**
 * The pin reloading-as-a-first-load reddens: the reload is answered with its own status and its own
 * words. Shared by the unmutated module and the mutants, for the same reason.
 */
function pinReloadIsNotALoad(lifecycle) {
  const result = plain(lifecycle.resourceLifecycle(RELOADING_FACT));
  assert.equal(
    result.status,
    'reloading',
    'a reload is answered as a reload, never as a first load',
  );
  assert.match(
    String(result.params),
    /\breloading\b/,
    'the reloading finding names the reload, not the load',
  );
  assert.deepEqual(result, RELOADING_FINDING);
  return result;
}

/**
 * The pin an echoed identity reddens: a value in the identity slot that the graph never labels is
 * refused, and the cause it carried reaches nothing.
 */
function pinIdentityIsTheGraphsShape(lifecycle) {
  const result = plain(
    lifecycle.resourceLifecycle({
      resource: 'the loader never resolved',
      status: 'loading',
      params: CONSTRUCTED_PARAMS,
    }),
  );
  assert.deepEqual(
    result,
    { state: 'cannot-tell', reason: 'resource-unnamed' },
    'a value in the identity slot that the graph never labels is refused as resource-unnamed',
  );
  assert.equal('resource' in result, false);
  assert.equal(
    JSON.stringify(result).includes('loader'),
    false,
    'a cause offered as an identity must not reach the answer',
  );
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

  it('reddens by name: a reload collapsed into a first load', () => {
    const { lifecycle } = standalone();
    pinReloadIsNotALoad(lifecycle);

    const anchor =
      '    if (status === RELOADING)\n' +
      '      return finding(resource, status, RELOADING_SAME_DEPS);';
    const mutated = SRC.replace(
      anchor,
      '    if (status === RELOADING)\n' +
        '      return finding(resource, LOADING, LOADING);',
    );
    assert.notEqual(
      mutated,
      SRC,
      'the reloading mutation target is gone from resource-lifecycle.js — restate the bite in scripts/resource-lifecycle.test.mjs',
    );
    const mutant = standalone(mutated).lifecycle;
    const mutantResult = plain(mutant.resourceLifecycle(RELOADING_FACT));
    assert.equal(
      mutantResult.status,
      'loading',
      'the mutant reports the reload as a first load',
    );

    const failure = reddens(
      () => pinReloadIsNotALoad(mutant),
      'the reload-is-not-a-load pin',
    );
    assert.match(
      failure.message,
      /answered as a reload/,
      `the reload mutant must redden the reload pin by name: ${failure.message}`,
    );
    console.log(
      `resource-lifecycle M3 (reload as a first load) -> ${JSON.stringify(mutantResult)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: reloading dropped from the status vocabulary', () => {
    // The status the milestone could not name: a vocabulary without `reloading` answers the reload
    // with `cannot-tell/status-unavailable`, which is the wave-1 defect stated in one line.
    const { lifecycle } = standalone();
    pinReloadIsNotALoad(lifecycle);

    const anchor =
      '  const STATUSES = [IDLE, LOADING, RELOADING, RESOLVED, ERROR];';
    const mutated = SRC.replace(
      anchor,
      '  const STATUSES = [IDLE, LOADING, RESOLVED, ERROR];',
    );
    assert.notEqual(
      mutated,
      SRC,
      'the STATUSES mutation target is gone from resource-lifecycle.js — restate the bite in scripts/resource-lifecycle.test.mjs',
    );
    const mutant = standalone(mutated).lifecycle;
    const mutantResult = plain(mutant.resourceLifecycle(RELOADING_FACT));
    assert.deepEqual(
      mutantResult,
      { state: 'cannot-tell', reason: 'status-unavailable' },
      'the mutant declines the reload, which is the defect the four-status vocabulary had',
    );

    const failure = reddens(
      () => pinReloadIsNotALoad(mutant),
      'the reload-is-not-a-load pin',
    );
    assert.match(
      failure.message,
      /answered as a reload/,
      `the vocabulary mutant must redden the reload pin by name: ${failure.message}`,
    );
    console.log(
      `resource-lifecycle M4 (reloading dropped) -> ${JSON.stringify(mutantResult)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: the identity echoed ungated', () => {
    const { lifecycle } = standalone();
    pinIdentityIsTheGraphsShape(lifecycle);

    const anchor =
      '    if (!RESOURCE_IDENTITY.test(resource))\n' +
      "      return cannotTell('resource-unnamed');";
    const mutated = SRC.replace(
      anchor,
      '    /* the identity gate is removed */',
    );
    assert.notEqual(
      mutated,
      SRC,
      'the identity mutation target is gone from resource-lifecycle.js — restate the bite in scripts/resource-lifecycle.test.mjs',
    );
    const mutant = standalone(mutated).lifecycle;
    const mutantResult = plain(
      mutant.resourceLifecycle({
        resource: 'the loader never resolved',
        status: 'loading',
        params: CONSTRUCTED_PARAMS,
      }),
    );
    assert.equal(
      mutantResult.resource,
      'the loader never resolved',
      'the mutant echoes the cause into the identity slot of a finding',
    );

    const failure = reddens(
      () => pinIdentityIsTheGraphsShape(mutant),
      'the identity-shape pin',
    );
    assert.match(
      failure.message,
      /resource-unnamed/,
      `the identity mutant must redden the identity pin by name: ${failure.message}`,
    );
    console.log(
      `resource-lifecycle M5 (identity echoed) -> ${JSON.stringify(mutantResult)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a clock read inside the join', () => {
    const { lifecycle } = standalone();
    pinRunsWithNoHostGlobalInScope(SRC);

    const anchor = '  function finding(resource, status, params) {';
    const mutated = SRC.replace(
      anchor,
      anchor + '\n    const at = Date.now();',
    );
    assert.notEqual(
      mutated,
      SRC,
      'the clock mutation target is gone from resource-lifecycle.js — restate the bite in scripts/resource-lifecycle.test.mjs',
    );
    // The point of the guard: a bare context cannot see this mutant at all. It answers exactly as
    // the clean module does, so the outside-read assertions wave 1 shipped could never catch it.
    assert.deepEqual(
      plain(standalone(mutated).lifecycle.resourceLifecycle(LOADING_FACT)),
      LOADING_FINDING,
      'a bare context answers a clock-using module exactly as it answers the clean one',
    );

    const failure = reddens(
      () => pinRunsWithNoHostGlobalInScope(mutated),
      'the no-host-global pin',
    );
    assert.match(
      failure.message,
      /reached for Date/,
      `the clock mutant must redden the purity pin by name: ${failure.message}`,
    );
    console.log(
      `resource-lifecycle M6 (Date.now() inside the join) -> reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a console call inside the join', () => {
    const { lifecycle } = standalone();
    pinRunsWithNoHostGlobalInScope(SRC);

    const anchor = '  function finding(resource, status, params) {';
    const mutated = SRC.replace(
      anchor,
      anchor + "\n    console.log('a finding was built');",
    );
    assert.notEqual(
      mutated,
      SRC,
      'the console mutation target is gone from resource-lifecycle.js — restate the bite in scripts/resource-lifecycle.test.mjs',
    );
    assert.deepEqual(
      plain(standalone(mutated).lifecycle.resourceLifecycle(LOADING_FACT)),
      LOADING_FINDING,
      'a bare context answers a console-using module exactly as it answers the clean one',
    );

    const failure = reddens(
      () => pinRunsWithNoHostGlobalInScope(mutated),
      'the no-host-global pin',
    );
    assert.match(
      failure.message,
      /reached for console/,
      `the console mutant must redden the purity pin by name: ${failure.message}`,
    );
    console.log(
      `resource-lifecycle M7 (console.log inside the join) -> reddened: ${failure.message.split('\n')[0]}`,
    );
  });
});
