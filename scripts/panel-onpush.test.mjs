// The OnPush-readiness panel surface — M035 T003 (INTENT.md SC4; AC1, AC2).
//
// Two halves. The first drives `panel-onpush.ts` directly: each of its four states, the finding's
// three fields and nothing else, and the mutants that must redden a named pin. The second drives it
// with the facts `extension/onpush-readiness.js` (T002) actually answers — the join runs in a bare
// `node:vm` context here, exactly as `scripts/onpush-readiness.test.mjs` runs it — so a surface that
// drifts from the join's own field names reddens rather than rendering a plausible blank.
//
// The mutant discipline is the sibling suites': every pin runs on the unmutated module first, so the
// pin is known live before the mutated copy is asked to break it. The one this task names is first:
// a pane that renders a blocker must redden `finding-complete` by name.
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const SURFACE_URL = new URL(
  '../apps/angular-ai-devtools/src/app/panel-onpush.ts',
  import.meta.url,
);
const SURFACE_SRC = readFileSync(SURFACE_URL, 'utf8');
const SURFACE = await import(SURFACE_URL.href);

const JOIN_SRC = readFileSync(
  new URL('../extension/onpush-readiness.js', import.meta.url),
  'utf8',
);

const COMPONENT = 'DeclaredDefault';
const STRATEGY = 'eager';
const READINESS_FACT = 'input "label" is signal-based';

// The join's own finding, with the fields the pane must never render alongside it. The defect this
// milestone prevents is a pane that repeats any of them: nothing on the def records a blocker, a
// verdict is not a field, and an element is not the component.
const FINDING = {
  state: 'finding',
  component: COMPONENT,
  strategy: STRATEGY,
  facts: [READINESS_FACT],
  blocker: 'the template pipes count through async',
  verdict: 'safe for OnPush',
  element: 'app-declared-default',
  score: 7,
};

// The same finding with no readiness fact at all: the component is eager and the caller read no
// signal-based input. It states that absence rather than print an empty list.
const FINDING_WITHOUT_FACTS = {
  state: 'finding',
  component: COMPONENT,
  strategy: STRATEGY,
  facts: [],
};

// A finding whose `facts` entry is an object rather than a sentence: the joiner never writes one,
// and a pane that stringified it would render whatever a caller smuggled in.
const FINDING_WITH_SMUGGLED_FACT = {
  state: 'finding',
  component: COMPONENT,
  strategy: STRATEGY,
  facts: [READINESS_FACT, { blocker: 'mutates its input in place' }, 42],
};

const CANNOT_TELL = { state: 'cannot-tell', reason: 'already-onpush' };

const UNREADABLE = { state: 'finding', component: COMPONENT };

function list(...facts) {
  return { facts };
}

let mutantDir = null;
let mutantCount = 0;

async function loadMutant(anchor, replacement) {
  const source = SURFACE_SRC.replace(anchor, replacement);
  assert.notEqual(
    source,
    SURFACE_SRC,
    `mutation must change source: ${anchor}`,
  );
  mutantDir ??= mkdtempSync(join(tmpdir(), 'panel-onpush-'));
  mutantCount += 1;
  const file = join(mutantDir, `mutant-${mutantCount}.ts`);
  writeFileSync(file, source, 'utf8');
  return import(pathToFileURL(file).href);
}

after(() => {
  if (mutantDir) rmSync(mutantDir, { recursive: true, force: true });
});

function mutantReddens(name, mutant, input, pin) {
  // The unmutated module pins first: the mutant is only the change under test.
  pin(SURFACE.onpushPanel(input));
  let failure = null;
  try {
    pin(mutant.onpushPanel(input));
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    `${name}: the mutated copy must redden the pin`,
  );
  assert.match(
    failure.message,
    new RegExp(name),
    `${name}: the pin must fail by name, got: ${failure.message}`,
  );
  console.log(`mutant ${name} reddens: ${failure.message.split('\n')[0]}`);
  return failure;
}

function pinFindingComplete(surface) {
  assert.equal(surface.state, 'finding', 'finding-complete: must be finding');
  assert.equal(
    surface.component,
    COMPONENT,
    'finding-complete: component must be named',
  );
  assert.equal(
    surface.strategy,
    STRATEGY,
    'finding-complete: strategy must be named',
  );
  assert.deepEqual(
    [...surface.facts],
    [READINESS_FACT],
    'finding-complete: the readiness fact must be carried',
  );
  assert.ok(
    surface.text.includes(`component: ${COMPONENT}`),
    'finding-complete: component line rendered',
  );
  assert.ok(
    surface.text.includes(`strategy: ${STRATEGY}`),
    'finding-complete: strategy line rendered',
  );
  assert.ok(
    surface.text.includes(`fact: ${READINESS_FACT}`),
    'finding-complete: readiness-fact line rendered',
  );
  for (const leaked of [
    FINDING.blocker,
    FINDING.verdict,
    FINDING.element,
    'blocker',
    'verdict',
    'element',
    'score',
    'async',
    'safe for OnPush',
  ]) {
    assert.ok(
      !surface.text.includes(leaked),
      `finding-complete: pane must not render ${leaked}`,
    );
  }
}

function pinNoReadinessFacts(surface) {
  assert.equal(surface.state, 'finding', 'no-readiness-facts: must be finding');
  assert.equal(
    surface.component,
    COMPONENT,
    'no-readiness-facts: component must be named',
  );
  assert.equal(
    surface.strategy,
    STRATEGY,
    'no-readiness-facts: strategy must be named',
  );
  // No fact is named at all, in the fields or in the text: the pane states the absence instead.
  assert.deepEqual(
    [...surface.facts],
    [],
    'no-readiness-facts: no fact may be carried',
  );
  assert.ok(
    surface.text.includes(SURFACE.NO_READINESS_FACTS),
    'no-readiness-facts: the pane must say none is recorded',
  );
  assert.ok(
    !surface.text.includes('fact:'),
    'no-readiness-facts: no fact line where none was read',
  );
  for (const invented of [READINESS_FACT, 'input "label"']) {
    assert.ok(
      !surface.text.includes(invented),
      `no-readiness-facts: pane must not render ${invented}`,
    );
  }
}

function pinCannotTellNoStrategy(surface) {
  assert.equal(
    surface.state,
    'cannot-tell',
    'cannot-tell-no-strategy: must be cannot-tell',
  );
  assert.equal(
    surface.reason,
    CANNOT_TELL.reason,
    'cannot-tell-no-strategy: reason carried',
  );
  assert.ok(
    surface.text.includes(`reason: ${CANNOT_TELL.reason}`),
    'cannot-tell-no-strategy: reason named',
  );
  assert.equal(
    surface.component,
    undefined,
    'cannot-tell-no-strategy: no component',
  );
  assert.equal(
    surface.strategy,
    undefined,
    'cannot-tell-no-strategy: no strategy',
  );
  assert.equal(surface.facts, undefined, 'cannot-tell-no-strategy: no facts');
  for (const absent of ['component:', 'strategy:', 'fact:']) {
    assert.ok(
      !surface.text.includes(absent),
      `cannot-tell-no-strategy: no ${absent} line`,
    );
  }
  assert.ok(
    !surface.text.includes(COMPONENT),
    'cannot-tell-no-strategy: must not name the component',
  );
  assert.ok(
    !surface.text.includes(STRATEGY),
    'cannot-tell-no-strategy: must not name the strategy',
  );
}

function pinLoadingNeverOnPush(surface) {
  assert.equal(
    surface.state,
    'loading',
    'loading-never-onpush: must be loading',
  );
  assert.ok(
    surface.lines.length > 0,
    'loading-never-onpush: not an empty table',
  );
  assert.ok(
    surface.text.includes('loading'),
    'loading-never-onpush: says loading',
  );
  assert.ok(
    !/already[- ]?on-?push|safe for onpush|no findings|all ready|opted in/i.test(
      surface.text,
    ),
    'loading-never-onpush: must not read as "this component is already OnPush"',
  );
  assert.ok(
    !surface.text.includes('strategy:'),
    'loading-never-onpush: no strategy',
  );
}

function pinErrorUnreadable(surface) {
  assert.equal(surface.state, 'error', 'error-unreadable: must be error');
  assert.ok(
    /could not be read/.test(surface.text),
    'error-unreadable: says could not be read',
  );
  assert.equal(surface.component, undefined, 'error-unreadable: no component');
  assert.equal(surface.strategy, undefined, 'error-unreadable: no strategy');
}

const RENDERED_STATES = {
  loading: () => SURFACE.onpushPanel([]),
  finding: () => SURFACE.onpushPanel(list(FINDING)),
  'cannot-tell': () => SURFACE.onpushPanel(list(CANNOT_TELL)),
  error: () => SURFACE.onpushPanel(null),
};

describe('panel-onpush states', () => {
  it('AC1: a finding renders the component, the strategy and the readiness facts', () => {
    const surface = SURFACE.onpushPanel(list(FINDING));
    pinFindingComplete(surface);
    assert.equal(surface.kind, 'finding');
    assert.deepEqual(
      [...surface.lines],
      [
        `component: ${COMPONENT}`,
        `strategy: ${STRATEGY}`,
        `fact: ${READINESS_FACT}`,
      ],
      'finding-complete: exactly three lines, in the join to component/strategy/fact order',
    );
    assert.equal(surface.text, surface.lines.join('\n'));
    assert.equal(surface.message, `strategy: ${STRATEGY}`);
  });

  it('AC1: every rendered state carries its own exact text', () => {
    const expected = {
      loading: 'loading: no change-detection readiness fact has arrived yet',
      finding: [
        `component: ${COMPONENT}`,
        `strategy: ${STRATEGY}`,
        `fact: ${READINESS_FACT}`,
      ].join('\n'),
      'cannot-tell': [
        'cannot tell: no change-detection readiness can be named from this fact',
        `reason: ${CANNOT_TELL.reason}`,
      ].join('\n'),
      error: 'error: the change-detection readiness fact could not be read',
    };
    for (const [state, render] of Object.entries(RENDERED_STATES)) {
      const surface = render();
      assert.equal(surface.state, state, `states-distinct: ${state} name`);
      assert.equal(
        surface.text,
        expected[state],
        `states-distinct: ${state} text`,
      );
    }
    // Four states, four texts, four messages: none shares another's rendering.
    const surfaces = Object.values(RENDERED_STATES).map((render) => render());
    assert.equal(
      new Set(surfaces.map((surface) => surface.text)).size,
      4,
      'states-distinct: no two states share a text',
    );
    assert.equal(
      new Set(surfaces.map((surface) => surface.message)).size,
      4,
      'states-distinct: no two states share a message',
    );
  });

  it('AC2: a fact carrying a blocker, a verdict or an element renders none of them', () => {
    const surface = SURFACE.onpushPanel(list(FINDING));
    for (const leaked of [
      FINDING.blocker,
      FINDING.verdict,
      FINDING.element,
      'blocker',
      'verdict',
      'element',
    ]) {
      assert.ok(
        !surface.text.includes(leaked),
        `finding-drops-extras: pane must not render ${leaked}`,
      );
    }
    assert.ok(
      !Object.keys(surface).some((key) =>
        ['blocker', 'verdict', 'element', 'score'].includes(key),
      ),
      'finding-drops-extras: no extra field may reach the surface',
    );
    // The three fields the join supports are the only ones it carries.
    assert.deepEqual(
      Object.keys(surface).sort(),
      [
        'component',
        'facts',
        'kind',
        'lines',
        'message',
        'state',
        'strategy',
        'text',
      ],
      'finding-drops-extras: the surface carries the finding fields and its pane, nothing else',
    );
  });

  it('AC2: a smuggled object or number in the facts list is dropped, never stringified', () => {
    const surface = SURFACE.onpushPanel(list(FINDING_WITH_SMUGGLED_FACT));
    assert.deepEqual(
      [...surface.facts],
      [READINESS_FACT],
      'smuggled-fact-dropped: only the join sentences are facts',
    );
    assert.ok(
      !surface.text.includes('mutates its input in place'),
      'smuggled-fact-dropped: the object must not reach a line',
    );
    assert.ok(
      !surface.text.includes('42') && !surface.text.includes('[object'),
      'smuggled-fact-dropped: nothing was stringified into a line',
    );
  });

  it('AC1: a finding with no readiness fact says none is recorded', () => {
    const surface = SURFACE.onpushPanel(list(FINDING_WITHOUT_FACTS));
    pinNoReadinessFacts(surface);
    assert.deepEqual(
      [...surface.lines],
      [
        `component: ${COMPONENT}`,
        `strategy: ${STRATEGY}`,
        `facts: ${SURFACE.NO_READINESS_FACTS}`,
      ],
      'no-readiness-facts: the absence is stated in the fact line',
    );
  });

  it('AC1: cannot-tell renders its reason and no component, strategy or fact', () => {
    for (const reason of [
      'already-onpush',
      'strategy-unreadable',
      'component-unreadable',
    ]) {
      const surface = SURFACE.onpushPanel(
        list({ state: 'cannot-tell', reason }),
      );
      assert.equal(surface.state, 'cannot-tell', reason);
      assert.equal(surface.reason, reason, reason);
      assert.ok(surface.text.includes(`reason: ${reason}`), reason);
      assert.equal(surface.component, undefined, reason);
      assert.equal(surface.strategy, undefined, reason);
      assert.equal(surface.facts, undefined, reason);
    }
    pinCannotTellNoStrategy(SURFACE.onpushPanel(list(CANNOT_TELL)));
    assert.equal(SURFACE.onpushPanel(list(CANNOT_TELL)).kind, 'cannot-tell');
  });

  it('AC1: an empty fact list or a running read renders loading, never "already OnPush"', () => {
    for (const input of [[], list(), { facts: [] }]) {
      pinLoadingNeverOnPush(SURFACE.onpushPanel(input));
    }
    pinLoadingNeverOnPush(SURFACE.onpushPanel({ loading: true }));
    pinLoadingNeverOnPush(SURFACE.onpushPanel({ state: 'loading' }));
  });

  it('an unreadable fact is the error state', () => {
    pinErrorUnreadable(SURFACE.onpushPanel(list(UNREADABLE)));
    pinErrorUnreadable(SURFACE.onpushPanel(list({ state: 'finding' })));
    pinErrorUnreadable(SURFACE.onpushPanel(null));
  });

  it('a finding outranks cannot-tell', () => {
    const surface = SURFACE.onpushPanel(list(CANNOT_TELL, FINDING));
    assert.equal(surface.state, 'finding');
    assert.equal(surface.component, COMPONENT);
    assert.equal(surface.strategy, STRATEGY);
  });

  it('accepts a single fact as a list of one, wrapped or as the join answers it', () => {
    // Wrapped: `{ facts: [...] }` is the list shape the demo loader hands over.
    const wrapped = SURFACE.onpushPanel(list(FINDING));
    assert.equal(wrapped.state, 'finding');
    assert.equal(wrapped.component, COMPONENT);
    assert.deepEqual([...wrapped.facts], [READINESS_FACT]);
    // Unwrapped: the join's answer is one fact whose own `facts` array is the readiness facts, not
    // a list of facts — the collision this surface reads in the other order.
    assert.equal(SURFACE.onpushPanel(FINDING).state, 'finding');
    assert.equal(SURFACE.onpushPanel(FINDING_WITHOUT_FACTS).state, 'finding');
    assert.equal(SURFACE.onpushPanel(CANNOT_TELL).state, 'cannot-tell');
    assert.equal(SURFACE.onpushPanel(CANNOT_TELL).reason, CANNOT_TELL.reason);
  });

  it('exports the surface under the names the panel and its suites reach for', () => {
    assert.equal(typeof SURFACE.onpushPanel, 'function');
    assert.equal(SURFACE.panelOnpush, SURFACE.onpushPanel);
    assert.equal(SURFACE.onpushSurface, SURFACE.onpushPanel);
    assert.equal(SURFACE.default, SURFACE.onpushPanel);
  });
});

describe('panel-onpush mutants', () => {
  it('M1: rendering a blocker reddens the finding-complete pin, by name', async () => {
    const anchor = '  for (const fact of facts) lines.push(`fact: ${fact}`);\n';
    const mutant = await loadMutant(
      anchor,
      anchor +
        "  lines.push('blocker: the template pipes count through async');\n",
    );
    const failure = mutantReddens(
      'finding-complete',
      mutant,
      list(FINDING),
      pinFindingComplete,
    );
    assert.match(failure.message, /blocker|async/);
  });

  it('M2: rendering a verdict reddens the finding-complete pin', async () => {
    const anchor = '  for (const fact of facts) lines.push(`fact: ${fact}`);\n';
    const mutant = await loadMutant(
      anchor,
      anchor + "  lines.push('verdict: safe for OnPush');\n",
    );
    const failure = mutantReddens(
      'finding-complete',
      mutant,
      list(FINDING),
      pinFindingComplete,
    );
    assert.match(failure.message, /verdict|safe for OnPush/);
  });

  it('M3: dropping the component reddens the finding-complete pin', async () => {
    const mutant = await loadMutant(
      '  const lines = [`component: ${component}`, `strategy: ${strategy}`];',
      '  const lines = [`strategy: ${strategy}`];',
    );
    mutantReddens(
      'finding-complete',
      mutant,
      list(FINDING),
      pinFindingComplete,
    );
  });

  it('M4: inventing a readiness fact for an empty list reddens its pin', async () => {
    const mutant = await loadMutant(
      '  if (facts.length === 0) lines.push(`facts: ${NO_READINESS_FACTS}`);',
      '  if (facts.length === 0) lines.push(\'fact: input "label" is signal-based\');',
    );
    const failure = mutantReddens(
      'no-readiness-facts',
      mutant,
      list(FINDING_WITHOUT_FACTS),
      pinNoReadinessFacts,
    );
    assert.match(failure.message, /none is recorded|no-readiness-facts/);
  });

  it('M5: borrowing a component into cannot-tell reddens its pin', async () => {
    const mutant = await loadMutant(
      '    ...pane(message, [message, `reason: ${reason}`]),',
      "    ...pane(message, [message, `reason: ${reason}`, 'component: DeclaredDefault']),",
    );
    const failure = mutantReddens(
      'cannot-tell-no-strategy',
      mutant,
      list(CANNOT_TELL),
      pinCannotTellNoStrategy,
    );
    assert.match(failure.message, /component/);
  });

  it('M6: rendering a finding for an empty list reddens the loading pin', async () => {
    const mutant = await loadMutant(
      '  if (list.length === 0) return loading();',
      [
        '  if (list.length === 0)',
        '    return {',
        "      kind: 'finding',",
        "      state: 'finding',",
        "      component: 'DeclaredDefault',",
        "      strategy: 'eager',",
        '      facts: [],',
        "      message: 'already OnPush',",
        '      lines: [],',
        "      text: 'already OnPush',",
        '    };',
      ].join('\n'),
    );
    mutantReddens('loading-never-onpush', mutant, [], pinLoadingNeverOnPush);
  });
});

// ---------------------------------------------------------------------------------------------
// The interface contract: the facts the join answers are the facts the pane renders.
// ---------------------------------------------------------------------------------------------

function readinessJoin() {
  const context = createContext({});
  runInContext(JOIN_SRC, context);
  const api = context.angularAiOnpushReadiness;
  assert.ok(api, 'the join must publish its namespace');
  assert.equal(typeof api.onpushReadiness, 'function');
  return api;
}

describe('the join drives the pane', () => {
  it('AC1: the eager finding renders the component, the strategy and the fact the join wrote', () => {
    const fact = readinessJoin().onpushReadiness({
      component: COMPONENT,
      onPush: false,
      inputs: [
        { name: 'label', signalBased: true },
        { name: 'count', signalBased: false },
      ],
    });
    assert.equal(fact.state, 'finding');
    const surface = SURFACE.onpushPanel(list(fact));
    pinFindingComplete(surface);
    // The pane carries the join's own sentences, character for character.
    assert.deepEqual([...surface.facts], [...fact.facts]);
    assert.equal(surface.component, fact.component);
    assert.equal(surface.strategy, fact.strategy);
  });

  it("AC1: all three of the join's cannot-tell answers render their reason and nothing else", () => {
    const answers = [
      readinessJoin().onpushReadiness({ component: COMPONENT, onPush: true }),
      readinessJoin().onpushReadiness({ component: COMPONENT }),
      readinessJoin().onpushReadiness({ component: '', onPush: false }),
    ];
    assert.deepEqual(
      answers.map((fact) => fact.state),
      ['cannot-tell', 'cannot-tell', 'cannot-tell'],
    );
    assert.deepEqual(
      answers.map((fact) => fact.reason),
      ['already-onpush', 'strategy-unreadable', 'component-unreadable'],
    );
    for (const fact of answers) {
      const surface = SURFACE.onpushPanel(list(fact));
      assert.equal(surface.state, 'cannot-tell');
      assert.equal(surface.reason, fact.reason);
      assert.equal(surface.component, undefined);
      assert.equal(surface.strategy, undefined);
      assert.equal(surface.facts, undefined);
      assert.ok(surface.text.includes(`reason: ${fact.reason}`));
    }
  });

  it('AC1: an eager component with no signal input renders the stated absence', () => {
    const fact = readinessJoin().onpushReadiness({
      component: COMPONENT,
      onPush: false,
    });
    assert.equal(fact.state, 'finding');
    assert.deepEqual([...fact.facts], []);
    pinNoReadinessFacts(SURFACE.onpushPanel(list(fact)));
  });
});
