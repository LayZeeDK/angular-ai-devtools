import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const SURFACE_URL = new URL(
  '../apps/angular-ai-devtools/src/app/panel-router.ts',
  import.meta.url,
);
const SURFACE_SRC = readFileSync(SURFACE_URL, 'utf8');
const SURFACE = await import(SURFACE_URL.href);

const BODY =
  "NG04002: Cannot match any routes. URL Segment: 'this-route-does-not-exist'";
const CAPTURED = [
  BODY,
  '    at applyRedirects (https://example.test/router.js:123:10)',
].join('\n');

const FINDING = {
  state: 'finding',
  segment: 'this-route-does-not-exist',
  code: 'NG04002',
  message: BODY,
  consideredCount: 15,
  // Fields the pane must never render (the defect this milestone prevents).
  element: 'app-root',
  component: 'RouterOutlet',
  guardVerdict: 'rejected',
  resolverOutcome: 'failed',
  redirectDecision: 'redirected-to-login',
  cause: 'the route is not configured',
  remedy: 'add the route to app.routes.ts',
};

const FINDING_WITH_STACK = { ...FINDING, message: CAPTURED };

const CANNOT_TELL = {
  state: 'cannot-tell',
  reason: 'no-captured-messages',
};

const UNREADABLE = { state: 'finding', segment: 'x' };

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
  mutantDir ??= mkdtempSync(join(tmpdir(), 'panel-router-'));
  mutantCount += 1;
  const file = join(mutantDir, `mutant-${mutantCount}.ts`);
  writeFileSync(file, source, 'utf8');
  return import(pathToFileURL(file).href);
}

after(() => {
  if (mutantDir) rmSync(mutantDir, { recursive: true, force: true });
});

function mutantReddens(name, mutant, input, pin) {
  pin(SURFACE.routerPanel(input));
  let failure = null;
  try {
    pin(mutant.routerPanel(input));
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
  assert.ok(
    surface.text.includes(`segment: ${FINDING.segment}`),
    'finding-complete: segment must be named',
  );
  assert.ok(
    surface.text.includes(`code: ${FINDING.code}`),
    'finding-complete: code must be named',
  );
  assert.ok(
    surface.text.includes(BODY),
    'finding-complete: message body rendered',
  );
  assert.ok(
    surface.text.includes(`considered: ${FINDING.consideredCount}`),
    'finding-complete: consideredCount must be named',
  );
  assert.equal(surface.message, BODY, 'finding-complete: message is the body');
  for (const leaked of [
    FINDING.element,
    FINDING.component,
    FINDING.guardVerdict,
    FINDING.resolverOutcome,
    FINDING.redirectDecision,
    FINDING.cause,
    FINDING.remedy,
    'guard',
    'resolver',
    'redirect',
  ]) {
    assert.ok(
      !surface.text.includes(leaked),
      `finding-complete: pane must not render ${leaked}`,
    );
  }
}

function pinCannotTellNoSegmentClaim(surface) {
  assert.equal(
    surface.state,
    'cannot-tell',
    'cannot-tell-no-segment: must be cannot-tell',
  );
  assert.equal(
    surface.reason,
    CANNOT_TELL.reason,
    'cannot-tell-no-segment: reason carried',
  );
  assert.ok(
    surface.text.includes(`reason: ${CANNOT_TELL.reason}`),
    'cannot-tell-no-segment: reason named',
  );
  assert.equal(
    surface.segment,
    undefined,
    'cannot-tell-no-segment: no segment',
  );
  assert.equal(surface.code, undefined, 'cannot-tell-no-segment: no code');
  assert.ok(
    !surface.text.includes('segment:'),
    'cannot-tell-no-segment: no segment line',
  );
  assert.ok(
    !surface.text.includes(FINDING.segment),
    'cannot-tell-no-segment: must not name the segment',
  );
  assert.ok(
    !surface.text.includes('code:'),
    'cannot-tell-no-segment: no code line',
  );
}

function pinLoadingNeverEmpty(surface) {
  assert.equal(
    surface.state,
    'loading',
    'loading-never-empty: must be loading',
  );
  assert.ok(
    surface.lines.length > 0,
    'loading-never-empty: not an empty table',
  );
  assert.ok(
    surface.text.includes('loading'),
    'loading-never-empty: says loading',
  );
  assert.ok(
    !/no route is at fault|nothing (was )?wrong|no findings|all clear/i.test(
      surface.text,
    ),
    'loading-never-empty: must not read as "no route is at fault"',
  );
  assert.ok(
    !surface.text.includes('segment:'),
    'loading-never-empty: no segment',
  );
}

function pinErrorUnreadable(surface) {
  assert.equal(surface.state, 'error', 'error-unreadable: must be error');
  assert.ok(
    /could not be read/.test(surface.text),
    'error-unreadable: says could not be read',
  );
  assert.equal(surface.segment, undefined, 'error-unreadable: no segment');
}

describe('panel-router states', () => {
  it('AC1: a finding renders the segment, the no-match statement, the code, and count', () => {
    const surface = SURFACE.routerPanel(list(FINDING));
    pinFindingComplete(surface);
    assert.equal(surface.kind, 'finding');
    assert.equal(surface.segment, FINDING.segment);
    assert.equal(surface.code, FINDING.code);
    assert.equal(surface.consideredCount, FINDING.consideredCount);
    assert.deepEqual(
      [...surface.lines],
      [
        `segment: ${FINDING.segment}`,
        `code: ${FINDING.code}`,
        `message: ${BODY}`,
        `considered: ${FINDING.consideredCount}`,
      ],
    );
  });

  it('AC1: a finding renders no element, component, guard, resolver, redirect, cause or remedy', () => {
    const surface = SURFACE.routerPanel(list(FINDING));
    pinFindingComplete(surface);
  });

  it('AC1: a finding strips stack frames from the message body', () => {
    const surface = SURFACE.routerPanel(list(FINDING_WITH_STACK));
    pinFindingComplete(surface);
    assert.equal(surface.message, BODY);
    assert.ok(!surface.text.includes('applyRedirects'));
  });

  it('AC2: cannot-tell renders its reason and no segment-level claim', () => {
    const surface = SURFACE.routerPanel(list(CANNOT_TELL));
    pinCannotTellNoSegmentClaim(surface);
    assert.equal(surface.kind, 'cannot-tell');
    assert.ok(!('segment' in surface));
  });

  it('AC3: an empty fact list renders loading, never "no route is at fault"', () => {
    for (const input of [[], list(), { facts: [] }]) {
      pinLoadingNeverEmpty(SURFACE.routerPanel(input));
    }
  });

  it('AC3: a running read renders loading', () => {
    pinLoadingNeverEmpty(SURFACE.routerPanel({ loading: true }));
    pinLoadingNeverEmpty(SURFACE.routerPanel({ state: 'loading' }));
  });

  it('an unreadable fact is the error state', () => {
    pinErrorUnreadable(SURFACE.routerPanel(list(UNREADABLE)));
    pinErrorUnreadable(SURFACE.routerPanel(null));
  });

  it('a finding outranks cannot-tell', () => {
    const surface = SURFACE.routerPanel(list(CANNOT_TELL, FINDING));
    assert.equal(surface.state, 'finding');
    assert.equal(surface.segment, FINDING.segment);
  });

  it('accepts a single fact as a list of one', () => {
    const surface = SURFACE.routerPanel(FINDING);
    assert.equal(surface.state, 'finding');
  });
});

describe('panel-router mutants', () => {
  it('M1: inlining a cause/remedy reddens the finding-complete pin', async () => {
    const mutant = await loadMutant(
      '    `considered: ${consideredCount}`,',
      '    `considered: ${consideredCount}`,\n    `cause: the route is not configured`,',
    );
    // The rest still renders; the cause is the defect.
    const failure = mutantReddens(
      'finding-complete',
      mutant,
      list(FINDING),
      pinFindingComplete,
    );
    assert.match(failure.message, /cause|route is not configured/);
  });

  it('M2: dropping the segment reddens the finding-complete pin', async () => {
    const mutant = await loadMutant('    `segment: ${segment}`,\n', '');
    mutantReddens(
      'finding-complete',
      mutant,
      list(FINDING),
      pinFindingComplete,
    );
  });

  it('M3: borrowing a segment into cannot-tell reddens its pin', async () => {
    const mutant = await loadMutant(
      '    ...pane(message, [message, `reason: ${reason}`]),',
      "    ...pane(message, [message, `reason: ${reason}`, 'segment: this-route-does-not-exist']),",
    );
    const failure = mutantReddens(
      'cannot-tell-no-segment',
      mutant,
      list(CANNOT_TELL),
      pinCannotTellNoSegmentClaim,
    );
    assert.match(failure.message, /segment/);
  });

  it('M4: rendering an empty table for an empty list reddens the loading pin', async () => {
    const mutant = await loadMutant(
      '  if (list.length === 0) return loading();',
      [
        '  if (list.length === 0)',
        '    return {',
        "      kind: 'finding',",
        "      state: 'finding',",
        "      segment: '',",
        "      code: '',",
        "      message: '',",
        '      consideredCount: 0,',
        '      lines: [],',
        "      text: '',",
        '    };',
      ].join('\n'),
    );
    mutantReddens('loading-never-empty', mutant, [], pinLoadingNeverEmpty);
  });
});
