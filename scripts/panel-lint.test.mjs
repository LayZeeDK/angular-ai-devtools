import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const SURFACE_URL = new URL(
  '../apps/angular-ai-devtools/src/app/panel-lint.ts',
  import.meta.url,
);
const SURFACE_SRC = readFileSync(SURFACE_URL, 'utf8');
const SURFACE = await import(SURFACE_URL.href);

// The one diagnostic T001 recorded, as the capture writes it (research/raw/
// m032-console-diagnostics.json): the body, then the stack frames — the only place a component is
// named, and the reason the body is what a pane may render.
const BODY =
  'ERROR RuntimeError: NG0950: Input "requiredLabel" is required but no value is available yet.';
const CAPTURED = [
  BODY,
  '    at _LintObservabilityPage.inputValueFn [as requiredLabel] (https://example.test/core-DSBe9tx0.js:17005:10)',
  '    at LintObservabilityPage_Template (https://example.test/main.js:839:44)',
].join('\n');

// The fact the join produces, plus the fields it never adds and the pane may never render (N2,
// N3): an element, a selector, a component, a cause and a fix.
const FINDING = {
  state: 'finding',
  construct: 'requiredLabel',
  code: 'NG0950',
  message: BODY,
  element: 'app-lint-observability-page',
  selector: 'app-lint-observability-page',
  component: 'LintObservabilityPage',
  cause: 'the required input was never bound',
  fix: 'bind a value for the required input',
};

/** The same finding as a caller that kept the stack would hand it over. */
const FINDING_WITH_STACK = { ...FINDING, message: CAPTURED };

const CANNOT_TELL = {
  state: 'cannot-tell',
  reason: 'message-names-no-construct',
};

/** A fact that cannot be read: it names a construct and states no code and no body. */
const UNREADABLE = { state: 'finding', construct: 'requiredLabel' };

/** The wrapper `panel-demo`'s callers use: the fact list, not one fact. */
function list(...facts) {
  return { facts };
}

let mutantDir = null;
let mutantCount = 0;

/**
 * A copy of the surface with one anchored edit, loaded through node's own type stripping the way
 * the suite loads the shipped module.
 */
async function loadMutant(anchor, replacement) {
  const source = SURFACE_SRC.replace(anchor, replacement);
  assert.notEqual(
    source,
    SURFACE_SRC,
    `mutation must change source: ${anchor}`,
  );
  mutantDir ??= mkdtempSync(join(tmpdir(), 'panel-lint-'));
  mutantCount += 1;
  const file = join(mutantDir, `mutant-${mutantCount}.ts`);
  writeFileSync(file, source, 'utf8');
  return import(pathToFileURL(file).href);
}

after(() => {
  if (mutantDir) rmSync(mutantDir, { recursive: true, force: true });
});

/**
 * One mutant case: the pin passes on the module as it ships, then the mutated copy fails the same
 * pin, and the failure is named by the pin (E4). A mutation that reddened for any other reason
 * would not be evidence that the pin holds the property.
 */
function mutantReddens(name, mutant, input, pin) {
  // 1. The unmutated module passes the pin: the pin measures the pane, not the mutation.
  pin(SURFACE.lintPanel(input));

  // 2. The mutated copy fails that pin, by name.
  let failure = null;
  try {
    pin(mutant.lintPanel(input));
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

/**
 * The words of the pane that no field it was handed accounts for. The message body, the construct
 * and the code are stripped, then the pane's own three labels; anything left is the pane saying
 * something the message did not state — a cause, a fix, an element, a component (AC1, AC4).
 */
function unaccounted(text, body, construct, code) {
  let rest = text;
  for (const piece of [body, construct, code]) {
    if (typeof piece === 'string' && piece !== '') {
      rest = rest.split(piece).join(' ');
    }
  }
  rest = rest.replace(/\b(construct|code|message)\b/g, ' ');
  return rest
    .replace(/[^A-Za-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** AC1: the pane renders the construct, the code and the message body, and all three. */
function pinFindingComplete(surface) {
  assert.equal(
    surface.state,
    'finding',
    'finding-complete: the pane must be in the finding state',
  );
  assert.ok(
    surface.text.includes(`construct: ${FINDING.construct}`),
    'finding-complete: the construct must be named',
  );
  assert.ok(
    surface.lines.length >= 3,
    'finding-complete: the pane must render its lines',
  );
  assert.ok(
    surface.text.includes(`code: ${FINDING.code}`),
    'finding-complete: the code must be named',
  );
  assert.ok(
    surface.text.includes(BODY),
    'finding-complete: the message body must be rendered',
  );
  assert.equal(
    surface.message,
    BODY,
    'finding-complete: the message must be the body and nothing else',
  );
}

/** AC1, AC4: no cause, no fix, no element and no component reaches the pane. */
function pinNoInventedCause(surface) {
  assert.equal(
    surface.state,
    'finding',
    'no-invented-cause: the pane must be a finding',
  );
  const rest = unaccounted(surface.text, BODY, FINDING.construct, FINDING.code);
  assert.equal(
    rest,
    '',
    `no-invented-cause: the pane rendered words the message does not state: ${rest}`,
  );
}

/** AC1: the component the stack frames name never reaches the pane. */
function pinNoComponentName(surface) {
  for (const name of [
    'LintObservabilityPage',
    'app-lint-observability-page',
    '_Template',
    'core-DSBe9tx0.js',
  ]) {
    assert.ok(
      !surface.text.includes(name),
      `no-component-name: the pane named ${name}`,
    );
  }
  assert.ok(
    surface.text.includes(BODY),
    'no-component-name: the body must still be rendered',
  );
}

/** AC2: the reason is rendered, and there is no construct at all. */
function pinCannotTellNoConstruct(surface) {
  assert.equal(
    surface.state,
    'cannot-tell',
    'cannot-tell-no-construct: the pane must be in the cannot-tell state',
  );
  assert.equal(
    surface.reason,
    CANNOT_TELL.reason,
    'cannot-tell-no-construct: the reason must be carried as data',
  );
  assert.ok(
    surface.text.includes(`reason: ${CANNOT_TELL.reason}`),
    'cannot-tell-no-construct: the reason must be named',
  );
  assert.ok(
    surface.lines.length > 0,
    'cannot-tell-no-construct: the pane must not be blank',
  );
  assert.equal(
    surface.construct,
    undefined,
    'cannot-tell-no-construct: no construct may be carried',
  );
  assert.equal(
    surface.code,
    undefined,
    'cannot-tell-no-construct: no code may be carried',
  );
  assert.ok(
    !surface.text.includes('construct:'),
    'cannot-tell-no-construct: the pane must not render a construct line',
  );
  assert.ok(
    !surface.text.includes(FINDING.construct),
    'cannot-tell-no-construct: the pane must not name an input',
  );
  assert.ok(
    !surface.text.includes(FINDING.code),
    'cannot-tell-no-construct: the pane must not render a code',
  );
}

/** AC3: an empty fact list is the loading state, never an empty table. */
function pinLoadingNeverEmpty(surface) {
  assert.equal(
    surface.state,
    'loading',
    'loading-never-empty: an empty fact list must be the loading state',
  );
  assert.ok(
    surface.lines.length > 0,
    'loading-never-empty: the pane must not be an empty table',
  );
  assert.ok(
    surface.text.includes('loading'),
    'loading-never-empty: the pane must say it is loading',
  );
  assert.ok(
    !surface.text.includes('construct:'),
    'loading-never-empty: no construct may be rendered before a fact arrives',
  );
  assert.ok(
    !/nothing (was )?wrong|no findings|all clear|clean page/i.test(
      surface.text,
    ),
    'loading-never-empty: the pane must not read as a page where nothing was wrong',
  );
}

/** A fact that cannot be read: said, and nothing else. */
function pinErrorNamesOnlyUnreadable(surface) {
  assert.equal(
    surface.state,
    'error',
    'error-names-only-unreadable: an unreadable fact must be the error state',
  );
  assert.ok(
    /could not be read/.test(surface.text),
    'error-names-only-unreadable: the pane must say the fact could not be read',
  );
  assert.equal(
    surface.construct,
    undefined,
    'error-names-only-unreadable: no construct may be carried',
  );
  assert.equal(
    surface.code,
    undefined,
    'error-names-only-unreadable: no code may be carried',
  );
  assert.ok(
    !surface.text.includes(FINDING.construct),
    'error-names-only-unreadable: the pane must not name an input',
  );
  assert.ok(
    !surface.text.includes(FINDING.code),
    'error-names-only-unreadable: the pane must not render a code',
  );
}

describe('panel-lint states', () => {
  it('AC1: a finding renders the construct, the code and the message body', () => {
    const surface = SURFACE.lintPanel(list(FINDING));
    pinFindingComplete(surface);
    assert.equal(surface.kind, 'finding');
    assert.equal(surface.construct, FINDING.construct);
    assert.equal(surface.code, FINDING.code);
    assert.equal(surface.text, surface.lines.join('\n'));
    assert.deepEqual(
      [...surface.lines],
      [
        `construct: ${FINDING.construct}`,
        `code: ${FINDING.code}`,
        `message: ${BODY}`,
      ],
    );
  });

  it('AC1: a finding names no cause, element, selector, component or fix', () => {
    const surface = SURFACE.lintPanel(list(FINDING));
    pinNoInventedCause(surface);
    for (const leaked of [
      FINDING.element,
      FINDING.component,
      FINDING.cause,
      FINDING.fix,
      'never bound',
      'bind a value',
    ]) {
      assert.ok(
        !surface.text.includes(leaked),
        `the pane rendered a field it may not: ${leaked}`,
      );
    }
  });

  it('AC1: a finding never repeats the component a stack frame names', () => {
    const surface = SURFACE.lintPanel(list(FINDING_WITH_STACK));
    pinNoComponentName(surface);
    pinFindingComplete(surface);
    assert.equal(surface.message, BODY);
  });

  it('AC2: cannot-tell renders its reason and no construct at all', () => {
    const surface = SURFACE.lintPanel(list(CANNOT_TELL));
    pinCannotTellNoConstruct(surface);
    assert.equal(surface.kind, 'cannot-tell');
    assert.ok(
      !('construct' in surface),
      'the state must carry no construct key',
    );
  });

  it('AC2: cannot-tell renders the reason it was handed, verbatim', () => {
    const surface = SURFACE.lintPanel(
      list({ state: 'cannot-tell', reason: 'code-not-in-digest' }),
    );
    assert.equal(surface.state, 'cannot-tell');
    assert.equal(surface.reason, 'code-not-in-digest');
    assert.ok(surface.text.includes('reason: code-not-in-digest'));
    assert.equal(surface.construct, undefined);
  });

  it('AC3: an empty fact list is the loading state, never an empty table', () => {
    for (const input of [[], list(), { facts: [] }]) {
      const surface = SURFACE.lintPanel(input);
      pinLoadingNeverEmpty(surface);
      assert.equal(surface.kind, 'loading');
    }
  });

  it('AC3: a running read says loading too, and never a table', () => {
    pinLoadingNeverEmpty(SURFACE.lintPanel({ loading: true }));
    pinLoadingNeverEmpty(SURFACE.lintPanel({ state: 'loading' }));
  });

  it('AC4: a fact that cannot be read is the error state and nothing else', () => {
    const surface = SURFACE.lintPanel(list(UNREADABLE));
    pinErrorNamesOnlyUnreadable(surface);
    assert.equal(surface.reason, SURFACE.UNREADABLE_FACT);
    assert.ok(
      !('construct' in surface),
      'the error state carries no construct',
    );
  });

  it('reports nothing to render as an error, not as a clean page', () => {
    pinErrorNamesOnlyUnreadable(SURFACE.lintPanel(null));
    pinErrorNamesOnlyUnreadable(SURFACE.lintPanel('not a fact list'));
  });

  it('lets what was observed outrank what could not be told', () => {
    const surface = SURFACE.lintPanel(list(CANNOT_TELL, FINDING));
    assert.equal(surface.state, 'finding');
    assert.equal(surface.construct, FINDING.construct);
  });

  it('accepts one fact on its own as a list of one', () => {
    const surface = SURFACE.lintPanel(FINDING);
    assert.equal(surface.state, 'finding');
    assert.equal(surface.construct, FINDING.construct);
  });
});

describe('panel-lint mutants', () => {
  it('AC4: M1 inlining a cause reddens the no-invented-cause pin', async () => {
    const mutant = await loadMutant(
      '    `message: ${body}`,',
      '    `message: ${body}`,\n    `cause: the required input was never bound`,',
    );
    // The rest of the finding still renders: the cause is the mutant's only defect.
    pinFindingComplete(mutant.lintPanel(list(FINDING)));
    const failure = mutantReddens(
      'no-invented-cause',
      mutant,
      list(FINDING),
      pinNoInventedCause,
    );
    assert.match(failure.message, /never bound/);
  });

  it('AC1: M2 dropping the construct reddens the finding-complete pin', async () => {
    const mutant = await loadMutant('    `construct: ${construct}`,\n', '');
    mutantReddens(
      'finding-complete',
      mutant,
      list(FINDING),
      pinFindingComplete,
    );
  });

  it('AC1: M3 keeping the stack reddens the no-component-name pin', async () => {
    const mutant = await loadMutant(
      "    const body = typeof text === 'string' ? bodyOf(text) : '';",
      "    const body = typeof text === 'string' ? text : '';",
    );
    const failure = mutantReddens(
      'no-component-name',
      mutant,
      list(FINDING_WITH_STACK),
      pinNoComponentName,
    );
    assert.match(failure.message, /LintObservabilityPage/);
  });

  it('AC2: M4 borrowing a construct into cannot-tell reddens its pin', async () => {
    const mutant = await loadMutant(
      '    ...pane(message, [message, `reason: ${reason}`]),',
      "    ...pane(message, [message, `reason: ${reason}`, 'construct: requiredLabel']),",
    );
    const failure = mutantReddens(
      'cannot-tell-no-construct',
      mutant,
      list(CANNOT_TELL),
      pinCannotTellNoConstruct,
    );
    assert.match(failure.message, /construct/);
  });

  it('AC3: M5 rendering an empty table for an empty list reddens the loading pin', async () => {
    const mutant = await loadMutant(
      '  if (list.length === 0) return loading();',
      [
        '  if (list.length === 0)',
        '    return {',
        "      kind: 'finding',",
        "      state: 'finding',",
        "      construct: '',",
        "      code: '',",
        "      message: '',",
        '      lines: [],',
        "      text: '',",
        '    };',
      ].join('\n'),
    );
    mutantReddens('loading-never-empty', mutant, [], pinLoadingNeverEmpty);
  });

  it('M6: naming a construct in the error state reddens the unreadable pin', async () => {
    const mutant = await loadMutant(
      '    ...pane(message, [message]),',
      "    ...pane(message, [message, 'construct: requiredLabel']),",
    );
    mutantReddens(
      'error-names-only-unreadable',
      mutant,
      list(UNREADABLE),
      pinErrorNamesOnlyUnreadable,
    );
  });
});
