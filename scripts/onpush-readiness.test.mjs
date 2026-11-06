// Tests for extension/onpush-readiness.js — the join between the strategy the component def reports
// and the readiness facts the caller read.
//
// The module is evaluated in a bare `node:vm` context with no `document`, no `window` and no
// `console`, which is the strongest available statement that the join contains no DOM, no clock and
// no logging: a module that reached for any of them would throw here rather than pass.
//
// The four states the join can produce are pinned exactly:
//
//   finding          — `onPush: false`: the component, the strategy it runs under and each
//                      signal-input readiness fact supplied. Never a blocker, never a verdict.
//   already-onpush   — `onPush: true`: `cannot-tell` with reason `already-onpush`, no facts, no
//                      strategy, no blocker. Angular 22 reports `onPush: true` for a component that
//                      declares no strategy, so this is the already-OnPush case too.
//   strategy-unreadable — `onPush` absent or not a boolean: `cannot-tell` with that reason. It must
//                      never answer `onpush`, which is the panel's old fail-open
//                      (extension/agent-main.js:660-671).
//   component-unreadable — `onPush: false` but no component name to put on the finding. Nothing is
//                      inferred from a file or a selector.
//
// Every mutant is applied to a copy of the source and must redden the assertion above it: the
// unmutated module is pinned first, then the mutation is shown to produce the wrong answer.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const SRC = readFileSync(
  new URL('../extension/onpush-readiness.js', import.meta.url),
  'utf8',
);

/** The module with its comments removed, so a token scan reads code and not prose. */
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/**
 * The standalone module: a bare context with nothing in it but the source. No DOM, no console, no
 * clock — a module that reached for any of them would throw here rather than pass.
 */
function standalone(source = SRC) {
  const context = createContext({});
  runInContext(source, context);
  const readiness = context.angularAiOnpushReadiness;
  assert.ok(
    readiness,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  return { readiness, context };
}

/**
 * A value from the vm context carries that context's own `Array` and `Object` prototypes, so it is
 * copied into this realm before a structural assertion reads it.
 */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The finding state's fact: an explicitly-`Default` component with one signal input. */
const FINDING_FACT = {
  component: 'DeclaredDefault',
  onPush: false,
  inputs: [
    { name: 'label', signalBased: true },
    { name: 'title', signalBased: false },
  ],
};

/** What that fact must produce, exactly. Non-signal inputs are not readiness facts. */
const FINDING = {
  state: 'finding',
  component: 'DeclaredDefault',
  strategy: 'eager',
  facts: ['input "label" is signal-based'],
};

describe('onpush-readiness.js is pure', () => {
  it('evaluates in a context with no DOM, no console and no clock, and publishes one namespace', () => {
    const { readiness, context } = standalone();
    for (const name of [
      'document',
      'window',
      'console',
      'Date',
      'performance',
    ]) {
      assert.equal(
        context[name],
        undefined,
        `the module must not run with a ${name} in scope`,
      );
    }
    assert.equal(typeof readiness.onpushReadiness, 'function');
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
        `onpush-readiness.js must contain no ${what}: ${pattern}`,
      );
    }
  });
});

describe('state: finding — onPush false', () => {
  it('names the component, the strategy and each readiness fact supplied', () => {
    const { readiness } = standalone();
    assert.deepEqual(plain(readiness.onpushReadiness(FINDING_FACT)), FINDING);
  });

  it('pins strategy eager for the explicit Default/Eager case', () => {
    const { readiness } = standalone();
    const result = plain(
      readiness.onpushReadiness({ component: 'Counter', onPush: false }),
    );
    assert.equal(
      result.strategy,
      'eager',
      'onPush false is changeDetection: 1, the deprecated Default alias of Eager',
    );
    assert.equal(result.component, 'Counter');
    assert.deepEqual(result.facts, []);
    assert.equal('blocker' in result, false);
    assert.equal('verdict' in result, false);
  });

  it('never reports a blocker and never says safe for OnPush', () => {
    const { readiness } = standalone();
    const result = readiness.onpushReadiness(FINDING_FACT);
    assert.deepEqual(Object.keys(result).sort(), [
      'component',
      'facts',
      'state',
      'strategy',
    ]);
    const text = JSON.stringify(result);
    for (const claim of ['blocker', 'safe', 'ready to', 'verdict', 'must']) {
      assert.equal(
        text.includes(claim),
        false,
        `a finding must carry no ${claim} claim: ${text}`,
      );
    }
    // The same on the source: the join has no branch that could emit one.
    const body = code(SRC);
    for (const word of ['blocker', 'verdict', 'safe for']) {
      assert.equal(
        body.includes(word),
        false,
        `onpush-readiness.js must not mention ${word} outside its comments`,
      );
    }
  });
});

describe('state: cannot-tell — already OnPush', () => {
  it('reports already-onpush with no facts, no strategy and no blocker', () => {
    const { readiness } = standalone();
    const result = plain(
      readiness.onpushReadiness({
        component: 'OnPushReady',
        onPush: true,
        inputs: [{ name: 'label', signalBased: true }],
      }),
    );
    assert.deepEqual(result, {
      state: 'cannot-tell',
      reason: 'already-onpush',
    });
    assert.equal('facts' in result, false);
    assert.equal('strategy' in result, false);
    assert.equal('blocker' in result, false);
    // A component that declares no strategy is OnPush on Angular 22, so this is the same state.
    assert.deepEqual(plain(readiness.onpushReadiness({ onPush: true })), {
      state: 'cannot-tell',
      reason: 'already-onpush',
    });
  });
});

describe('state: cannot-tell — an unreadable strategy', () => {
  it('reports strategy-unreadable when onPush is absent, and never onpush', () => {
    const { readiness } = standalone();
    for (const fact of [
      {},
      null,
      undefined,
      { component: 'Counter' },
      { component: 'Counter', onPush: 'false' },
      { component: 'Counter', onPush: 0 },
      { component: 'Counter', onPush: null },
      { component: 'Counter', onPush: undefined },
    ]) {
      const result = readiness.onpushReadiness(fact);
      assert.deepEqual(
        plain(result),
        { state: 'cannot-tell', reason: 'strategy-unreadable' },
        `an unreadable read must be cannot-tell/strategy-unreadable: ${JSON.stringify(fact)}`,
      );
      assert.notEqual(
        result,
        'onpush',
        'the fail-open answer of extension/agent-main.js:660-671 must not be inherited',
      );
    }
  });

  it('produces no finding for an empty fact, which is no selected component', () => {
    const { readiness } = standalone();
    for (const fact of [{}, null, undefined]) {
      const result = plain(readiness.onpushReadiness(fact));
      assert.equal(result.state, 'cannot-tell');
      assert.equal('component' in result, false);
      assert.equal('strategy' in result, false);
      assert.equal('facts' in result, false);
    }
  });

  it('never infers a strategy from a component name, a file or a selector', () => {
    const { readiness } = standalone();
    const withheld = plain(
      readiness.onpushReadiness({
        component: 'DeclaredDefault',
        file: 'declared-default.ts',
        selector: 'app-declared-default',
      }),
    );
    assert.deepEqual(withheld, {
      state: 'cannot-tell',
      reason: 'strategy-unreadable',
    });
    assert.equal('strategy' in withheld, false);

    // The same for the other direction: a name and a file cannot make an eager component nameable.
    const unnamed = plain(
      readiness.onpushReadiness({
        onPush: false,
        file: 'counter.ts',
        selector: 'app-counter',
      }),
    );
    assert.deepEqual(unnamed, {
      state: 'cannot-tell',
      reason: 'component-unreadable',
    });
    assert.equal('component' in unnamed, false);
  });
});

describe('readiness facts — signal inputs only', () => {
  it('claims an input only when the fact says it is signal-based', () => {
    const { readiness } = standalone();
    const none = plain(
      readiness.onpushReadiness({
        component: 'DeclaredDefault',
        onPush: false,
        inputs: [
          { name: 'label', signalBased: false },
          { name: 'title' },
          'plain-name',
          null,
          { signalBased: true },
        ],
      }),
    );
    assert.deepEqual(
      none.facts,
      [],
      'a fact list with no signal-input evidence produces no input claim',
    );

    const one = plain(
      readiness.onpushReadiness({
        component: 'DeclaredDefault',
        onPush: false,
        inputs: [
          { name: 'label', signalBased: true },
          { name: 'title', signalBased: false },
        ],
      }),
    );
    assert.deepEqual(one.facts, ['input "label" is signal-based']);
  });

  it('makes no fact claim at all when the caller read no inputs', () => {
    const { readiness } = standalone();
    for (const fact of [
      { component: 'DeclaredDefault', onPush: false },
      { component: 'DeclaredDefault', onPush: false, inputs: [] },
      { component: 'DeclaredDefault', onPush: false, inputs: null },
    ]) {
      const result = plain(readiness.onpushReadiness(fact));
      assert.equal(result.state, 'finding');
      assert.deepEqual(result.facts, []);
    }
  });

  it('never makes an output claim', () => {
    const { readiness } = standalone();
    const result = readiness.onpushReadiness({
      component: 'DeclaredDefault',
      onPush: false,
      outputs: [{ name: 'changed', signalBased: true }],
      inputs: [{ name: 'label', signalBased: true }],
    });
    assert.deepEqual(plain(result).facts, ['input "label" is signal-based']);
    const text = JSON.stringify(result).toLowerCase();
    assert.equal(
      text.includes('output'),
      false,
      'no OutputFlags exists in the package, so no output fact may be promised',
    );
    assert.equal(
      code(SRC).toLowerCase().includes('output'),
      false,
      'the join must not read outputs at all',
    );
  });
});

describe('mutants redden by name', () => {
  it('reddens by name: a finding that reports a blocker', () => {
    // Pin the unmutated module first, so the mutation below is the only cause of a red test.
    const { readiness } = standalone();
    const clean = plain(readiness.onpushReadiness(FINDING_FACT));
    assert.deepEqual(clean, FINDING);
    assert.equal('blocker' in clean, false);

    const mutated = SRC.replace(
      '      facts: signalInputFacts(read.inputs),\n    };',
      "      facts: signalInputFacts(read.inputs),\n      blocker: 'migrate to OnPush',\n    };",
    );
    assert.notEqual(
      mutated,
      SRC,
      'the blocker mutation target is gone from onpush-readiness.js — restate the bite in scripts/onpush-readiness.test.mjs',
    );
    const result = plain(
      standalone(mutated).readiness.onpushReadiness(FINDING_FACT),
    );
    assert.equal(
      result.state,
      'finding',
      'the mutant still produces a finding, so the shipped assertion reddens on the blocker',
    );
    assert.equal(
      result.blocker,
      'migrate to OnPush',
      'a module that reports a blocker must redden the finding assertions by name',
    );
  });

  it('reddens by name: onpush for an unreadable read', () => {
    // Pin the unmutated module first, so the mutation below is the only cause of a red test.
    const { readiness } = standalone();
    assert.deepEqual(
      plain(readiness.onpushReadiness({ component: 'Counter' })),
      {
        state: 'cannot-tell',
        reason: 'strategy-unreadable',
      },
    );

    const mutated = SRC.replace(
      "return { state: 'cannot-tell', reason: 'strategy-unreadable' };",
      "return 'onpush';",
    );
    assert.notEqual(
      mutated,
      SRC,
      'the fail-open mutation target is gone from onpush-readiness.js — restate the bite in scripts/onpush-readiness.test.mjs',
    );
    const result = standalone(mutated).readiness.onpushReadiness({
      component: 'Counter',
    });
    assert.equal(
      result,
      'onpush',
      "a module that inherits the panel's fail-open answer must redden the unreadable-strategy assertions",
    );
  });
});
