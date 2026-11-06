import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const SURFACE_URL = new URL(
  '../apps/angular-ai-devtools/src/app/panel-legacy.ts',
  import.meta.url,
);
const SURFACE_SRC = readFileSync(SURFACE_URL, 'utf8');
const SURFACE = await import(SURFACE_URL.href);

const MODERN_FORM =
  'removing standalone: false and adding dependencies to their imports array';
const SOURCE_URL = 'https://angular.dev/reference/migrations/standalone';

const FINDING = {
  state: 'finding',
  component: 'WidgetComponent',
  structure: 'NgModule-declared',
  modernForm: MODERN_FORM,
  source: SOURCE_URL,
  // Fields the pane must never render (the defect this milestone prevents).
  element: 'app-widget',
  remedy: 'run the standalone migration',
  severity: 'warning',
  owner: 'AppModule',
  diagnosticCode: 'NG6100',
};

// The join's own way of saying it: the component is NgModule-declared and the cited table holds no
// entry that sources a modern form for that structure.
const FINDING_UNSOURCED = {
  state: 'finding',
  component: 'WidgetComponent',
  structure: 'NgModule-declared',
};

// A fact that carries a form the table never sourced: the flag is what says so.
const FINDING_DENIED_SOURCE = {
  state: 'finding',
  component: 'WidgetComponent',
  structure: 'NgModule-declared',
  modernForm: MODERN_FORM,
  source: SOURCE_URL,
  equivalentSourced: false,
};

const CANNOT_TELL = {
  state: 'cannot-tell',
  reason: 'already-standalone',
};

const UNREADABLE = { state: 'finding', component: 'WidgetComponent' };

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
  mutantDir ??= mkdtempSync(join(tmpdir(), 'panel-legacy-'));
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
  pin(SURFACE.legacyPanel(input));
  let failure = null;
  try {
    pin(mutant.legacyPanel(input));
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
    FINDING.component,
    'finding-complete: component must be named',
  );
  assert.equal(
    surface.structure,
    FINDING.structure,
    'finding-complete: structure must be named',
  );
  assert.equal(
    surface.modernForm,
    MODERN_FORM,
    'finding-complete: modern form must be named',
  );
  assert.equal(
    surface.source,
    SOURCE_URL,
    'finding-complete: source must be named',
  );
  assert.ok(
    surface.text.includes(`component: ${FINDING.component}`),
    'finding-complete: component line rendered',
  );
  assert.ok(
    surface.text.includes(`structure: ${FINDING.structure}`),
    'finding-complete: structure line rendered',
  );
  assert.ok(
    surface.text.includes(`modernForm: ${MODERN_FORM}`),
    'finding-complete: modern-form line rendered',
  );
  assert.ok(
    surface.text.includes(`source: ${SOURCE_URL}`),
    'finding-complete: source line rendered',
  );
  for (const leaked of [
    FINDING.element,
    FINDING.remedy,
    FINDING.severity,
    FINDING.owner,
    FINDING.diagnosticCode,
    'remedy',
    'severity',
    'owner',
    'element',
  ]) {
    assert.ok(
      !surface.text.includes(leaked),
      `finding-complete: pane must not render ${leaked}`,
    );
  }
}

function pinUnsourcedFormNamed(surface) {
  assert.equal(
    surface.state,
    'finding',
    'unsourced-form-named: must be finding',
  );
  assert.equal(
    surface.component,
    FINDING_UNSOURCED.component,
    'unsourced-form-named: component must be named',
  );
  assert.equal(
    surface.structure,
    FINDING_UNSOURCED.structure,
    'unsourced-form-named: structure must be named',
  );
  // No form is named at all, in the fields or in the text: the pane states the absence instead.
  assert.equal(
    surface.modernForm,
    null,
    'unsourced-form-named: no form may be carried',
  );
  assert.equal(
    surface.source,
    null,
    'unsourced-form-named: no source may be carried',
  );
  assert.ok(
    surface.text.includes(SURFACE.NO_SOURCED_FORM),
    'unsourced-form-named: the pane must say no form is recorded',
  );
  for (const invented of [MODERN_FORM, 'standalone: true', 'imports: [']) {
    assert.ok(
      !surface.text.includes(invented),
      `unsourced-form-named: pane must not render ${invented}`,
    );
  }
}

function pinCannotTellNoStructure(surface) {
  assert.equal(
    surface.state,
    'cannot-tell',
    'cannot-tell-no-structure: must be cannot-tell',
  );
  assert.equal(
    surface.reason,
    CANNOT_TELL.reason,
    'cannot-tell-no-structure: reason carried',
  );
  assert.ok(
    surface.text.includes(`reason: ${CANNOT_TELL.reason}`),
    'cannot-tell-no-structure: reason named',
  );
  assert.equal(
    surface.component,
    undefined,
    'cannot-tell-no-structure: no component',
  );
  assert.equal(
    surface.structure,
    undefined,
    'cannot-tell-no-structure: no structure',
  );
  assert.equal(
    surface.modernForm,
    undefined,
    'cannot-tell-no-structure: no form',
  );
  assert.equal(
    surface.source,
    undefined,
    'cannot-tell-no-structure: no source',
  );
  for (const absent of ['component:', 'structure:', 'modernForm:', 'source:']) {
    assert.ok(
      !surface.text.includes(absent),
      `cannot-tell-no-structure: no ${absent} line`,
    );
  }
  assert.ok(
    !surface.text.includes(FINDING.component),
    'cannot-tell-no-structure: must not name the component',
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
    !/no form is recorded|nothing (was )?wrong|no findings|all clear|modern/i.test(
      surface.text,
    ),
    'loading-never-empty: must not read as "this component is modern"',
  );
  assert.ok(
    !surface.text.includes('component:'),
    'loading-never-empty: no component',
  );
}

function pinErrorUnreadable(surface) {
  assert.equal(surface.state, 'error', 'error-unreadable: must be error');
  assert.ok(
    /could not be read/.test(surface.text),
    'error-unreadable: says could not be read',
  );
  assert.equal(surface.component, undefined, 'error-unreadable: no component');
}

describe('panel-legacy states', () => {
  it('AC1: a finding renders the component, the structure, the form and its source', () => {
    const surface = SURFACE.legacyPanel(list(FINDING));
    pinFindingComplete(surface);
    assert.equal(surface.kind, 'finding');
    assert.deepEqual(
      [...surface.lines],
      [
        `component: ${FINDING.component}`,
        `structure: ${FINDING.structure}`,
        `modernForm: ${MODERN_FORM}`,
        `source: ${SOURCE_URL}`,
      ],
    );
    assert.equal(surface.message, MODERN_FORM);
  });

  it('AC3: a fact carrying a remedy, a severity, an owner or an element renders none', () => {
    const surface = SURFACE.legacyPanel(list(FINDING));
    for (const leaked of [
      FINDING.element,
      FINDING.remedy,
      FINDING.severity,
      FINDING.owner,
      FINDING.diagnosticCode,
    ]) {
      assert.ok(
        !surface.text.includes(leaked),
        `finding-drops-extras: pane must not render ${leaked}`,
      );
    }
    assert.ok(
      !Object.keys(surface).some((key) =>
        ['element', 'remedy', 'severity', 'owner'].includes(key),
      ),
      'finding-drops-extras: no extra field may reach the surface',
    );
  });

  it('AC2: a finding with no sourced form names no form and says none is recorded', () => {
    for (const fact of [FINDING_UNSOURCED, FINDING_DENIED_SOURCE]) {
      const surface = SURFACE.legacyPanel(list(fact));
      pinUnsourcedFormNamed(surface);
      assert.deepEqual(
        [...surface.lines],
        [
          `component: ${FINDING_UNSOURCED.component}`,
          `structure: ${FINDING_UNSOURCED.structure}`,
          `modernForm: ${SURFACE.NO_SOURCED_FORM}`,
        ],
        'unsourced-form-named: no empty or invented form line',
      );
    }
  });

  it('AC1: cannot-tell renders its reason and no form at all', () => {
    const surface = SURFACE.legacyPanel(list(CANNOT_TELL));
    pinCannotTellNoStructure(surface);
    assert.equal(surface.kind, 'cannot-tell');
    assert.ok(!('modernForm' in surface));
  });

  it('AC1: the four states render four different texts of their own', () => {
    const loading = SURFACE.legacyPanel([]);
    const finding = SURFACE.legacyPanel(list(FINDING));
    const cannotTell = SURFACE.legacyPanel(list(CANNOT_TELL));
    const error = SURFACE.legacyPanel(null);

    pinLoadingNeverEmpty(loading);
    pinFindingComplete(finding);
    pinCannotTellNoStructure(cannotTell);
    pinErrorUnreadable(error);

    const states = [loading, finding, cannotTell, error];
    assert.deepEqual(
      states.map((surface) => surface.state),
      ['loading', 'finding', 'cannot-tell', 'error'],
      'states-distinct: the four states keep their own names',
    );
    assert.equal(
      new Set(states.map((surface) => surface.text)).size,
      4,
      'states-distinct: no two states share a text',
    );
    assert.equal(
      new Set(states.map((surface) => surface.message)).size,
      4,
      'states-distinct: no two states share a message',
    );
    for (const [surface, own] of [
      [loading, 'loading'],
      [finding, 'component:'],
      [cannotTell, 'cannot tell'],
      [error, 'error'],
    ]) {
      assert.ok(
        surface.text.includes(own),
        `states-distinct: ${surface.state} must say its own text`,
      );
    }
  });

  it('AC1: an empty fact list or a running read renders loading, never "modern"', () => {
    for (const input of [[], list(), { facts: [] }]) {
      pinLoadingNeverEmpty(SURFACE.legacyPanel(input));
    }
    pinLoadingNeverEmpty(SURFACE.legacyPanel({ loading: true }));
    pinLoadingNeverEmpty(SURFACE.legacyPanel({ state: 'loading' }));
  });

  it('an unreadable fact is the error state', () => {
    pinErrorUnreadable(SURFACE.legacyPanel(list(UNREADABLE)));
    pinErrorUnreadable(SURFACE.legacyPanel(list({ state: 'finding' })));
    pinErrorUnreadable(SURFACE.legacyPanel(null));
  });

  it('a finding outranks cannot-tell', () => {
    const surface = SURFACE.legacyPanel(list(CANNOT_TELL, FINDING));
    assert.equal(surface.state, 'finding');
    assert.equal(surface.component, FINDING.component);
  });

  it('accepts a single fact as a list of one', () => {
    const surface = SURFACE.legacyPanel(FINDING);
    assert.equal(surface.state, 'finding');
    assert.equal(surface.component, FINDING.component);
  });
});

describe('panel-legacy mutants', () => {
  it('M1: inlining a remedy reddens the finding-complete pin', async () => {
    const mutant = await loadMutant(
      '  lines.push(`modernForm: ${modernForm}`, `source: ${source}`);\n',
      '  lines.push(`modernForm: ${modernForm}`, `source: ${source}`);\n' +
        "  lines.push('remedy: run the standalone migration');\n",
    );
    const failure = mutantReddens(
      'finding-complete',
      mutant,
      list(FINDING),
      pinFindingComplete,
    );
    assert.match(failure.message, /remedy|standalone migration/);
  });

  it('M2: dropping the component reddens the finding-complete pin', async () => {
    const mutant = await loadMutant(
      'const lines = [`component: ${component}`, `structure: ${structure}`];',
      'const lines = [`structure: ${structure}`];',
    );
    mutantReddens(
      'finding-complete',
      mutant,
      list(FINDING),
      pinFindingComplete,
    );
  });

  it('M3: rendering an unsourced modern form reddens the unsourced-form pin', async () => {
    const mutant = await loadMutant(
      '    lines.push(`modernForm: ${NO_SOURCED_FORM}`);',
      '    lines.push(`modernForm: rewriting the component as standalone`);',
    );
    const failure = mutantReddens(
      'unsourced-form-named',
      mutant,
      list(FINDING_UNSOURCED),
      pinUnsourcedFormNamed,
    );
    assert.match(failure.message, /no form is recorded/);
  });

  it('M4: borrowing a component into cannot-tell reddens its pin', async () => {
    const mutant = await loadMutant(
      '    ...pane(message, [message, `reason: ${reason}`]),',
      "    ...pane(message, [message, `reason: ${reason}`, 'component: WidgetComponent']),",
    );
    const failure = mutantReddens(
      'cannot-tell-no-structure',
      mutant,
      list(CANNOT_TELL),
      pinCannotTellNoStructure,
    );
    assert.match(failure.message, /component/);
  });

  it('M5: rendering a finding for an empty list reddens the loading pin', async () => {
    const mutant = await loadMutant(
      '  if (list.length === 0) return loading();',
      [
        '  if (list.length === 0)',
        '    return {',
        "      kind: 'finding',",
        "      state: 'finding',",
        "      component: '',",
        "      structure: '',",
        '      modernForm: null,',
        '      source: null,',
        "      message: 'modern',",
        '      lines: [],',
        "      text: 'modern',",
        '    };',
      ].join('\n'),
    );
    mutantReddens('loading-never-empty', mutant, [], pinLoadingNeverEmpty);
  });
});
