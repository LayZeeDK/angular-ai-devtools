// The resource-lifecycle panel surface — M036 T003 (INTENT.md SC5, edge E5; prohibitions N1, N2,
// N4, N5).
//
// Two halves. The first drives `panel-resource.ts` directly: its four states, the finding's fields
// and nothing else, the idle-by-design rendering, and the mutants that must redden a named pin. The
// second drives it with the facts `extension/resource-lifecycle.js` (T002) actually answers — the
// join runs in a bare `node:vm` context here, exactly as `scripts/resource-lifecycle.test.mjs` runs
// it — so a surface that drifts from the join's own field names reddens rather than rendering a
// plausible blank.
//
// The statuses are deliberately not enumerated in the surface: a later task widens the join's
// vocabulary with `reloading`, so a pane that carried its own copy of the list would refuse a real
// status. Two pins below hold that open — a finding carrying a status the pane has never heard of
// renders it verbatim, and a mutant that starts gating on the four known statuses reddens by name.
//
// The mutant discipline is the sibling suites': every pin runs on the unmutated module first, so the
// pin is known live before the mutated copy is asked to break it. The one this task names is first:
// a pane that renders a cause the fact does not carry must redden `finding-renders-no-cause` by name
// (E5, N5).
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const SURFACE_URL = new URL(
  '../apps/angular-ai-devtools/src/app/panel-resource.ts',
  import.meta.url,
);
const SURFACE_SRC = readFileSync(SURFACE_URL, 'utf8');
const SURFACE = await import(SURFACE_URL.href);

const JOIN_SRC = readFileSync(
  new URL('../extension/resource-lifecycle.js', import.meta.url),
  'utf8',
);

// The join's own identity for the resource the fixture's graph labels `loading`
// (`research/raw/m036-resource-graph.json`, `resources[0]`).
const RESOURCE = 'Resource#LoadingResource';
const STATUS = 'loading';

// The params status the caller read, and the one the join writes for the idle case. Neither is
// invented by this suite: the recording measures the resource status, not a params status, so the
// params value here stands for what the caller read and is never cited as a measurement.
const PARAMS = 'resolved';
const IDLE_RESOURCE = 'Resource#IdleResource';
const IDLE_BY_DESIGN = 'idle (by design)';

// The strings a pane must never compose, because none of them is a field it is handed: the loader's
// promise is not among the labelled fields (N1, N4), network timing is a different source (N3), and
// a verdict is not a field at all (N5).
const CAUSE = 'the loader never resolves';
const VERDICT = 'wait for the request to settle';
const LOADER = 'fetchDashboard';
const NETWORK = 'the network response never arrived';

// The join's own finding, with the fields the pane must never render alongside it. The defect this
// milestone prevents is a pane that repeats any of them.
const FINDING = {
  state: 'finding',
  resource: RESOURCE,
  status: STATUS,
  params: PARAMS,
  cause: CAUSE,
  loader: LOADER,
  network: NETWORK,
  verdict: VERDICT,
  error: 'HttpErrorResponse: 500',
};

// The same finding with no params status read: half a finding, which is not one.
const FINDING_WITHOUT_PARAMS = {
  state: 'finding',
  resource: RESOURCE,
  status: STATUS,
};

// A finding carrying a status this surface has never heard of. The join's vocabulary is the join's;
// a later task adds `reloading` to it, so a pane that gated on today's four values would refuse a
// real status and render `error` instead.
const FINDING_RELOADING = {
  state: 'finding',
  resource: RESOURCE,
  status: 'reloading',
  params: 'loading',
};

const IDLE_FINDING = {
  state: 'finding',
  resource: IDLE_RESOURCE,
  status: 'idle',
  params: IDLE_BY_DESIGN,
};

// The four reasons the join can name, each an absence and nothing else.
const REASONS = [
  'no-resource',
  'labels-unreadable',
  'params-unavailable',
  'status-unavailable',
];

const CANNOT_TELL = { state: 'cannot-tell', reason: 'no-resource' };

const UNREADABLE = { state: 'finding', resource: RESOURCE };

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
  mutantDir ??= mkdtempSync(join(tmpdir(), 'panel-resource-'));
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
  pin(SURFACE.resourcePanel(input));
  let failure = null;
  try {
    pin(mutant.resourcePanel(input));
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

function pinFindingRendersNoCause(surface) {
  assert.equal(surface.state, 'finding', 'finding-renders-no-cause: finding');
  assert.equal(
    surface.resource,
    RESOURCE,
    'finding-renders-no-cause: the resource must be named as the graph named it',
  );
  assert.equal(
    surface.status,
    STATUS,
    'finding-renders-no-cause: the status must be the one the graph reported',
  );
  assert.equal(
    surface.params,
    PARAMS,
    'finding-renders-no-cause: the params status must be carried',
  );
  assert.ok(
    surface.text.includes(`resource: ${RESOURCE}`),
    'finding-renders-no-cause: resource line rendered',
  );
  assert.ok(
    surface.text.includes(`status: ${STATUS}`),
    'finding-renders-no-cause: status line rendered',
  );
  assert.ok(
    surface.text.includes(`params: ${PARAMS}`),
    'finding-renders-no-cause: params line rendered',
  );
  for (const leaked of [
    CAUSE,
    VERDICT,
    LOADER,
    NETWORK,
    FINDING.error,
    'cause',
    'verdict',
    'loader',
    'network',
    'never resolves',
  ]) {
    assert.ok(
      !surface.text.includes(leaked),
      `finding-renders-no-cause: pane must not render ${leaked}`,
    );
  }
}

function pinIdleByDesign(surface) {
  assert.equal(surface.state, 'finding', 'idle-by-design: must be finding');
  assert.equal(
    surface.resource,
    IDLE_RESOURCE,
    'idle-by-design: the resource must be named',
  );
  assert.equal(surface.status, 'idle', 'idle-by-design: the status is idle');
  assert.equal(
    surface.params,
    IDLE_BY_DESIGN,
    'idle-by-design: the params must say so',
  );
  assert.ok(
    surface.text.includes('status: idle'),
    'idle-by-design: the status line must read idle',
  );
  assert.ok(
    surface.text.includes(`params: ${IDLE_BY_DESIGN}`),
    'idle-by-design: the params line must carry the join sentence',
  );
  // The distinction the milestone exists for: an idle-by-design resource must not read as one that
  // is still working, and the pane has no sentence of its own to blur them with (N2).
  assert.ok(
    !surface.text.includes('loading'),
    'idle-by-design: must not read as still loading',
  );
  assert.ok(
    !/still loading|never asked to start|stuck|request/i.test(surface.text),
    'idle-by-design: must not compose an explanation',
  );
}

function pinCannotTellReason(surface) {
  assert.equal(
    surface.state,
    'cannot-tell',
    'cannot-tell-reason: must be cannot-tell',
  );
  assert.ok(
    REASONS.includes(surface.reason) || surface.reason === 'unknown-reason',
    'cannot-tell-reason: the reason is one the join can name',
  );
  assert.ok(
    surface.text.includes(`reason: ${surface.reason}`),
    'cannot-tell-reason: the reason must be named',
  );
  assert.equal(surface.resource, undefined, 'cannot-tell-reason: no resource');
  assert.equal(surface.status, undefined, 'cannot-tell-reason: no status');
  assert.equal(surface.params, undefined, 'cannot-tell-reason: no params');
  for (const absent of ['resource:', 'status:', 'params:']) {
    assert.ok(
      !surface.text.includes(absent),
      `cannot-tell-reason: no ${absent} line`,
    );
  }
  assert.ok(
    !surface.text.includes(RESOURCE),
    'cannot-tell-reason: must not name the resource',
  );
  for (const composed of [CAUSE, VERDICT, LOADER, NETWORK]) {
    assert.ok(
      !surface.text.includes(composed),
      `cannot-tell-reason: pane must not render ${composed}`,
    );
  }
}

function pinUnfamiliarStatusRendered(surface) {
  assert.equal(
    surface.state,
    'finding',
    'unfamiliar-status-rendered: a status the pane has not heard of is still a finding',
  );
  assert.equal(
    surface.status,
    'reloading',
    'unfamiliar-status-rendered: the status is echoed as it arrived',
  );
  assert.ok(
    surface.text.includes('status: reloading'),
    'unfamiliar-status-rendered: the status line must carry the reported value',
  );
  assert.ok(
    !surface.text.includes('cannot tell'),
    'unfamiliar-status-rendered: an unknown-to-the-pane status is not an absence',
  );
}

function pinLoadingNeverIdle(surface) {
  assert.equal(surface.state, 'loading', 'loading-never-idle: must be loading');
  assert.ok(surface.lines.length > 0, 'loading-never-idle: not an empty table');
  assert.ok(
    surface.text.includes('loading'),
    'loading-never-idle: says loading',
  );
  assert.ok(
    !/idle|resolved|never asked to start|still loading|errored/i.test(
      surface.text,
    ),
    'loading-never-idle: must not read as an idle-by-design resource or a finding',
  );
  assert.ok(
    !surface.text.includes('status:'),
    'loading-never-idle: no status line before a fact arrives',
  );
}

function pinErrorUnreadable(surface) {
  assert.equal(surface.state, 'error', 'error-unreadable: must be error');
  assert.equal(
    surface.reason,
    SURFACE.UNREADABLE_FACT,
    'error-unreadable: the error token is the surface constant',
  );
  assert.ok(
    /could not be read/.test(surface.text),
    'error-unreadable: says could not be read',
  );
  for (const absent of ['resource', 'status', 'params']) {
    assert.equal(surface[absent], undefined, `error-unreadable: no ${absent}`);
  }
}

const RENDERED_STATES = {
  loading: () => SURFACE.resourcePanel([]),
  finding: () => SURFACE.resourcePanel(list(FINDING)),
  'cannot-tell': () => SURFACE.resourcePanel(list(CANNOT_TELL)),
  error: () => SURFACE.resourcePanel(null),
};

describe('panel-resource states', () => {
  it('E5: a finding renders the resource, the state it reported and the params status', () => {
    const surface = SURFACE.resourcePanel(list(FINDING));
    pinFindingRendersNoCause(surface);
    assert.equal(surface.kind, 'finding');
    assert.deepEqual(
      [...surface.lines],
      [`resource: ${RESOURCE}`, `status: ${STATUS}`, `params: ${PARAMS}`],
      'finding-renders-no-cause: exactly three lines, in the join resource/status/params order',
    );
    assert.equal(surface.text, surface.lines.join('\n'));
    assert.equal(surface.message, `status: ${STATUS}`);
  });

  it('E5: the four states match the siblings, each with its own exact text', () => {
    const expected = {
      loading: 'loading: no resource fact has arrived yet',
      finding: [
        `resource: ${RESOURCE}`,
        `status: ${STATUS}`,
        `params: ${PARAMS}`,
      ].join('\n'),
      'cannot-tell': [
        'cannot tell: no resource state can be named from this fact',
        `reason: ${CANNOT_TELL.reason}`,
      ].join('\n'),
      error: 'error: the resource fact could not be read',
    };
    // The four state names are the four every sibling surface answers — loading, finding,
    // cannot-tell, error — and none of them is a state of the resource instead.
    assert.deepEqual(Object.keys(RENDERED_STATES).sort(), [
      'cannot-tell',
      'error',
      'finding',
      'loading',
    ]);
    for (const [state, render] of Object.entries(RENDERED_STATES)) {
      const surface = render();
      assert.equal(surface.state, state, `states-distinct: ${state} name`);
      assert.equal(surface.kind, state, `states-distinct: ${state} kind`);
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

  it('E5: an idle-by-design finding reads differently from a loading one (N2)', () => {
    const idle = SURFACE.resourcePanel(list(IDLE_FINDING));
    pinIdleByDesign(idle);
    const loading = SURFACE.resourcePanel(list(FINDING));
    assert.notEqual(
      idle.text,
      loading.text,
      'idle-by-design: the two findings must not render the same text',
    );
    // The difference is carried entirely by the values the join wrote, in the one place each is
    // written: the pane has no sentence of its own about either.
    assert.deepEqual(
      [...idle.lines],
      [
        `resource: ${IDLE_RESOURCE}`,
        'status: idle',
        `params: ${IDLE_BY_DESIGN}`,
      ],
      'idle-by-design: the three lines are the join values, verbatim',
    );
  });

  it('E5: cannot-tell renders its reason and no resource, state or params (N5)', () => {
    for (const reason of REASONS) {
      const surface = SURFACE.resourcePanel(
        list({ state: 'cannot-tell', reason }),
      );
      assert.equal(surface.state, 'cannot-tell', reason);
      assert.equal(surface.reason, reason, reason);
      assert.ok(surface.text.includes(`reason: ${reason}`), reason);
      assert.equal(surface.resource, undefined, reason);
      assert.equal(surface.status, undefined, reason);
      assert.equal(surface.params, undefined, reason);
    }
    const surface = SURFACE.resourcePanel(list(CANNOT_TELL));
    pinCannotTellReason(surface);
    assert.equal(surface.kind, 'cannot-tell');
  });

  it('E5: a fact carrying a cause, a verdict, a loader name or a network explanation renders none of them', () => {
    const surface = SURFACE.resourcePanel(list(FINDING));
    pinFindingRendersNoCause(surface);
    assert.ok(
      !Object.keys(surface).some((key) =>
        ['cause', 'verdict', 'loader', 'network', 'error'].includes(key),
      ),
      'finding-drops-extras: no extra field may reach the surface',
    );
    // The three fields the join supports are the only ones it carries.
    assert.deepEqual(
      Object.keys(surface).sort(),
      [
        'kind',
        'lines',
        'message',
        'params',
        'resource',
        'state',
        'status',
        'text',
      ],
      'finding-drops-extras: the surface carries the finding fields and its pane, nothing else',
    );
    // The join's own finding carries exactly those fields, so the surface adds no vocabulary.
    assert.deepEqual(
      Object.keys(SURFACE.resourcePanel({ ...FINDING })).sort(),
      Object.keys(surface).sort(),
      'finding-drops-extras: a bare fact reads the same as the same fact in a list',
    );
  });

  it('a status the surface has never heard of is rendered as it arrived', () => {
    pinUnfamiliarStatusRendered(SURFACE.resourcePanel(list(FINDING_RELOADING)));
    // Every string is echoed, whatever the pane's own vocabulary would say.
    const strange = SURFACE.resourcePanel(
      list({
        state: 'finding',
        resource: 'Resource#SomeOtherResource',
        status: 'a-status-the-pane-has-never-heard-of',
        params: 'another-one',
      }),
    );
    assert.equal(strange.state, 'finding');
    assert.equal(strange.status, 'a-status-the-pane-has-never-heard-of');
    assert.equal(strange.params, 'another-one');
  });

  it('an empty fact list or a running read renders loading, never idle-by-design', () => {
    for (const input of [[], list(), { facts: [] }]) {
      pinLoadingNeverIdle(SURFACE.resourcePanel(input));
    }
    pinLoadingNeverIdle(SURFACE.resourcePanel({ loading: true }));
    pinLoadingNeverIdle(SURFACE.resourcePanel({ state: 'loading' }));
  });

  it('an unreadable fact is the error state', () => {
    pinErrorUnreadable(SURFACE.resourcePanel(list(UNREADABLE)));
    // A finding with no params status is half a finding, not a finding.
    pinErrorUnreadable(SURFACE.resourcePanel(list(FINDING_WITHOUT_PARAMS)));
    pinErrorUnreadable(SURFACE.resourcePanel(list({ state: 'finding' })));
    pinErrorUnreadable(SURFACE.resourcePanel(null));
  });

  it('a finding outranks cannot-tell', () => {
    const surface = SURFACE.resourcePanel(list(CANNOT_TELL, FINDING));
    assert.equal(surface.state, 'finding');
    assert.equal(surface.resource, RESOURCE);
    assert.equal(surface.status, STATUS);
  });

  it('accepts a single fact as a list of one, wrapped or as the join answers it', () => {
    // Wrapped: `{ facts: [...] }` is the list shape the demo loader hands over.
    const wrapped = SURFACE.resourcePanel(list(FINDING));
    assert.equal(wrapped.state, 'finding');
    assert.equal(wrapped.resource, RESOURCE);
    // Unwrapped: the join's answer is one fact, not a list of them.
    assert.equal(SURFACE.resourcePanel(FINDING).state, 'finding');
    assert.equal(SURFACE.resourcePanel(FINDING).status, STATUS);
    assert.equal(SURFACE.resourcePanel(CANNOT_TELL).state, 'cannot-tell');
    assert.equal(SURFACE.resourcePanel(CANNOT_TELL).reason, CANNOT_TELL.reason);
  });

  it('exports the surface under the names the panel and its suites reach for', () => {
    assert.equal(typeof SURFACE.resourcePanel, 'function');
    assert.equal(SURFACE.panelResource, SURFACE.resourcePanel);
    assert.equal(SURFACE.resourceSurface, SURFACE.resourcePanel);
    assert.equal(SURFACE.default, SURFACE.resourcePanel);
  });
});

describe('panel-resource mutants', () => {
  // The one place a finding is written: a mutant that adds a line here adds it to every finding.
  const FINDING_ANCHOR = ['  return {', "    kind: 'finding',", ''].join('\n');

  it('M1: rendering a cause reddens the finding-renders-no-cause pin, by name', async () => {
    const mutant = await loadMutant(
      FINDING_ANCHOR,
      `  lines.push('cause: ${CAUSE}');\n` + FINDING_ANCHOR,
    );
    const failure = mutantReddens(
      'finding-renders-no-cause',
      mutant,
      list(FINDING),
      pinFindingRendersNoCause,
    );
    assert.match(failure.message, /cause|never resolves/);
  });

  it('M2: rendering a verdict reddens the finding-renders-no-cause pin', async () => {
    const mutant = await loadMutant(
      FINDING_ANCHOR,
      `  lines.push('verdict: ${VERDICT}');\n` + FINDING_ANCHOR,
    );
    const failure = mutantReddens(
      'finding-renders-no-cause',
      mutant,
      list(FINDING),
      pinFindingRendersNoCause,
    );
    assert.match(failure.message, /verdict|wait for the request/);
  });

  it('M3: gating the status on the four known values reddens the unfamiliar-status pin', async () => {
    const anchor =
      '    if (resource === null || status === null || params === null) return null;';
    const mutant = await loadMutant(
      anchor,
      [
        anchor,
        "    if (!['loading', 'resolved', 'error', 'idle'].includes(status))",
        '      return null;',
      ].join('\n'),
    );
    mutantReddens(
      'unfamiliar-status-rendered',
      mutant,
      list(FINDING_RELOADING),
      pinUnfamiliarStatusRendered,
    );
  });

  it('M4: borrowing a resource into cannot-tell reddens its pin', async () => {
    const mutant = await loadMutant(
      '    ...pane(message, [message, `reason: ${reason}`]),',
      [
        '    ...pane(message, [',
        '      message,',
        '      `reason: ${reason}`,',
        "      'resource: Resource#LoadingResource',",
        '    ]),',
      ].join('\n'),
    );
    const failure = mutantReddens(
      'cannot-tell-reason',
      mutant,
      list(CANNOT_TELL),
      pinCannotTellReason,
    );
    assert.match(failure.message, /resource/);
  });

  it('M5: rendering a finding for an empty list reddens the loading pin', async () => {
    const mutant = await loadMutant(
      '  if (list.length === 0) return loading();',
      [
        '  if (list.length === 0)',
        '    return {',
        "      kind: 'finding',",
        "      state: 'finding',",
        "      resource: 'Resource#IdleResource',",
        "      status: 'idle',",
        "      params: 'idle (by design)',",
        "      message: 'params: idle (by design)',",
        '      lines: [],',
        "      text: 'params: idle (by design)',",
        '    };',
      ].join('\n'),
    );
    mutantReddens('loading-never-idle', mutant, [], pinLoadingNeverIdle);
  });
});

// ---------------------------------------------------------------------------------------------
// The interface contract: the facts the join answers are the facts the pane renders.
// ---------------------------------------------------------------------------------------------

function resourceJoin() {
  const context = createContext({});
  runInContext(JOIN_SRC, context);
  const api = context.angularAiResourceLifecycle;
  assert.ok(api, 'the join must publish its namespace');
  assert.equal(typeof api.resourceLifecycle, 'function');
  return api;
}

describe('the join drives the pane', () => {
  it('E5: a loading resource renders the resource, the status and the params the join answered', () => {
    const fact = resourceJoin().resourceLifecycle({
      resource: RESOURCE,
      status: STATUS,
      params: PARAMS,
    });
    assert.equal(fact.state, 'finding');
    const surface = SURFACE.resourcePanel(list(fact));
    pinFindingRendersNoCause(surface);
    // The pane carries the join's own values, character for character.
    assert.equal(surface.resource, fact.resource);
    assert.equal(surface.status, fact.status);
    assert.equal(surface.params, fact.params);
  });

  it('E5: the idle-by-design answer renders as idle, not as loading (N2)', () => {
    const fact = resourceJoin().resourceLifecycle({
      resource: IDLE_RESOURCE,
      status: 'idle',
      params: 'idle',
    });
    assert.equal(fact.state, 'finding');
    assert.equal(fact.params, IDLE_BY_DESIGN);
    pinIdleByDesign(SURFACE.resourcePanel(list(fact)));
  });

  it('E5: every cannot-tell the join answers renders its reason and nothing else', () => {
    const answers = [
      resourceJoin().resourceLifecycle({ labels: false }),
      resourceJoin().resourceLifecycle({}),
      resourceJoin().resourceLifecycle({ resource: RESOURCE, status: STATUS }),
      resourceJoin().resourceLifecycle({
        resource: RESOURCE,
        status: 'not-a-status',
        params: PARAMS,
      }),
    ];
    assert.deepEqual(
      answers.map((fact) => fact.state),
      ['cannot-tell', 'cannot-tell', 'cannot-tell', 'cannot-tell'],
    );
    assert.deepEqual(
      answers.map((fact) => fact.reason),
      // The order the join answers in: a withheld label read first, then no identity, then the
      // params, then the status.
      [
        'labels-unreadable',
        'no-resource',
        'params-unavailable',
        'status-unavailable',
      ],
    );
    for (const fact of answers) {
      const surface = SURFACE.resourcePanel(list(fact));
      assert.equal(surface.state, 'cannot-tell');
      assert.equal(surface.reason, fact.reason);
      assert.equal(surface.resource, undefined);
      assert.equal(surface.status, undefined);
      assert.equal(surface.params, undefined);
      assert.ok(surface.text.includes(`reason: ${fact.reason}`));
    }
  });

  it('E5: no answer the join produces names a cause, a verdict or a network explanation', () => {
    const facts = [
      resourceJoin().resourceLifecycle({
        resource: RESOURCE,
        status: STATUS,
        params: PARAMS,
      }),
      resourceJoin().resourceLifecycle({
        resource: IDLE_RESOURCE,
        status: 'idle',
        params: 'idle',
      }),
      resourceJoin().resourceLifecycle({ labels: false }),
      resourceJoin().resourceLifecycle({}),
      resourceJoin().resourceLifecycle({ resource: RESOURCE, status: STATUS }),
    ];
    for (const fact of facts) {
      const surface = SURFACE.resourcePanel(list(fact));
      for (const composed of [
        CAUSE,
        VERDICT,
        LOADER,
        NETWORK,
        'cause',
        'verdict',
        'loader',
        'network',
        'stuck',
        'never resolves',
      ]) {
        assert.ok(
          !surface.text.includes(composed),
          `join-drives-pane: the pane must not render ${composed}`,
        );
      }
    }
  });
});
