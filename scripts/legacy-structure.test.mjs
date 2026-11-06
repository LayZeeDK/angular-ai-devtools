// Tests for extension/legacy-structure.js — the join between a selected component's structure and
// the modern form the cited table sources for it.
//
// The module is evaluated in a bare `node:vm` context: no `document`, no `window`, no `ɵcmp`, no
// layout, and no `console` unless a probe supplies one. Every case executes that module and asserts
// on what it returns, so nothing here stands in for behaviour by scanning a source file.
//
// The table is the real recording (`research/raw/m034-equivalents.json`), captured by
// `scripts/legacy-equivalents-capture.test.mjs` from the page whose URL each entry carries. The pin
// reads the entry's `modernForm` and `url` off that file, so a module that composed a form, or
// swapped its source, would answer something this suite did not read:
//
//   AC1/E1  a component whose `ɵcmp.standalone` is false is a finding that names the component,
//           states `NgModule-declared`, and carries the table's modern form and URL — the exact
//           strings, not a paraphrase.
//   AC2     a component that is already standalone is `cannot-tell` with `already-standalone`, and
//           names no modern form.
//   AC3/E3  a fact whose metadata cannot be read is `cannot-tell` with `metadata-unreadable`, and
//           names neither structure nor form.
//   AC4/E2  with the `ɵcmp` read withheld there is no finding, and no name, selector or file path
//           talks the module into one.
//   AC6     a mutant that renders a modern form no entry sources reddens the sourcing pin by name,
//           after the unmutated module has been pinned.
//
// The one fabricated string in this file, `FORM-THE-TABLE-STATES`, is a table fixture and never a
// claim about Angular: its only job is to show that the form in a finding comes from the table the
// caller passed and not from a constant this module (or this suite) holds.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { describe, it } from 'node:test';

const SRC = readFileSync(
  new URL('../extension/legacy-structure.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m034-equivalents.json', import.meta.url),
    'utf8',
  ),
);

/** The entry the join reads: the one the table states for the NgModule-declared structure. */
const EQUIVALENT = (RECORDING.entries ?? []).find(
  (entry) => entry?.structure === 'NgModule-declared',
);

/**
 * The component the finding names. Its name is the caller's — the fact below says it was declared
 * in an NgModule — and the module is never allowed to treat a name as evidence of structure, which
 * is why the same string appears in the withheld-metadata cases.
 */
const COMPONENT = 'SomeDeclaredComponent';

/** What the caller read: a component that is not standalone, and its name. */
const DECLARED_FACT = { name: COMPONENT, standalone: false };

/** The same caller reading a standalone component. */
const STANDALONE_FACT = { name: COMPONENT, standalone: true };

/** The table as a caller hands it over: the recording object the capture wrote. */
const EQUIVALENTS = RECORDING;

/** A table whose one entry states a form no Angular page ever did — a fixture, not a citation. */
const FIXTURE_TABLE = [
  {
    id: 'fixture',
    structure: 'NgModule-declared',
    modernForm: 'FORM-THE-TABLE-STATES',
    quote: 'FORM-THE-TABLE-STATES',
    url: 'https://example.test/a-page-this-table-was-never-fetched-from',
    retrievedAt: '2026-01-01T00:00:00.000Z',
  },
];

/**
 * The module in a bare context: nothing in the world but the source. A module that reached for
 * `document`, `window`, `ɵcmp`, `performance` or an import would throw here rather than pass.
 */
function loadBare(source = SRC) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiLegacyStructure;
  assert.ok(
    api,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  return { api, context };
}

/**
 * The module in a world that has a console, a document, a window and a clock of its own, each with
 * a tap counter: loading and using the module must install and read nothing (N1).
 */
function loadWithProbes() {
  const calls = [];
  const tap =
    (name) =>
    (...args) => {
      calls.push({ name: name, args: args.length });
      return undefined;
    };
  const context = createContext({
    console: {
      log: tap('console.log'),
      warn: tap('console.warn'),
      error: tap('console.error'),
      info: tap('console.info'),
      debug: tap('console.debug'),
    },
    performance: { now: tap('performance.now') },
    document: {
      querySelector: tap('document.querySelector'),
      addEventListener: tap('document.addEventListener'),
    },
    window: {
      addEventListener: tap('window.addEventListener'),
      getComputedStyle: tap('window.getComputedStyle'),
    },
  });
  runInContext(SRC, context);
  return { api: context.angularAiLegacyStructure, context, calls };
}

/** A value built inside the vm context carries that context's prototypes; copy it into this realm. */
function host(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * A mutant: one textual change to an in-memory copy of the module. The anchor must change the
 * source, or the mutation would be vacuous and the case would prove nothing.
 */
function mutant(anchor, replacement) {
  const source = SRC.replace(anchor, replacement);
  assert.notEqual(
    source,
    SRC,
    `the mutation must change the module: ${JSON.stringify(anchor)}`,
  );
  return loadBare(source).api;
}

/** The failure a mutant raises, matched against the assertion it must hit. */
function reddensBy(pin, what, assertion) {
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
  assert.match(
    failure.message,
    assertion,
    `${what} must redden the ${assertion} assertion, not an unrelated one: ${failure.message}`,
  );
  return failure;
}

/**
 * The finding pin, as a function so a mutant is run through the very assertion AC1 and AC6 make.
 * Every string it expects is read off the recording by the caller.
 */
function assertFinding(result, expected) {
  assert.equal(
    result.state,
    'finding',
    'a component whose ɵcmp.standalone is false must be a finding',
  );
  assert.equal(
    result.component,
    expected.component,
    'the finding must name the component the caller named',
  );
  assert.equal(
    result.structure,
    'NgModule-declared',
    'the finding must state the structure the false standalone flag is',
  );
  assert.equal(
    result.modernForm,
    expected.modernForm,
    'the finding must carry the modern form the equivalents table sources, verbatim',
  );
  assert.equal(
    result.source,
    expected.source,
    'the finding must carry the URL the equivalents table cites for that form',
  );
  assert.deepEqual(
    Object.keys(result).sort(),
    ['component', 'modernForm', 'source', 'state', 'structure'],
    'a finding states the component, the structure, the sourced form, its source and its state, and nothing else',
  );
}

/**
 * The absence pin. A "cannot tell" names the absence it found and nothing that reads as a
 * structure, a form or a source.
 */
function assertCannotTell(result, reason, what) {
  assert.equal(result.state, 'cannot-tell', `${what} must be cannot-tell`);
  assert.equal(result.reason, reason, `${what} must name the absence it found`);
  for (const field of ['component', 'structure', 'modernForm', 'source']) {
    assert.ok(
      !(field in result),
      `${what} must name no ${field}: the module states only what it read, and it read nothing to name one`,
    );
  }
  assert.deepEqual(
    Object.keys(result).sort(),
    ['reason', 'state'],
    `${what} states the absence and nothing that reads as a structure, a form or a source`,
  );
}

/** The AC1/AC6 pin, run the way every mutant case runs it: given a result, it passes or throws. */
function pinFinding(result) {
  assertFinding(host(result), {
    component: COMPONENT,
    modernForm: EQUIVALENT.modernForm,
    source: EQUIVALENT.url,
  });
}

// ---------------------------------------------------------------- the table ----

describe('the table the join reads', () => {
  it('holds the NgModule-declared entry, with a url, a verbatim quote and a retrieval time', () => {
    assert.ok(
      EQUIVALENT,
      'research/raw/m034-equivalents.json holds no entry for the NgModule-declared structure — capture it with scripts/legacy-equivalents-capture.test.mjs',
    );
    assert.deepEqual(
      Object.keys(EQUIVALENT).sort(),
      ['id', 'modernForm', 'quote', 'retrievedAt', 'structure', 'url'],
      'an entry is the six fields the capture writes',
    );
    assert.match(EQUIVALENT.url, /^https:\/\//, 'an entry cites an HTTPS page');
    assert.match(
      EQUIVALENT.retrievedAt,
      /^\d{4}-\d{2}-\d{2}T/,
      'an entry states when it was retrieved',
    );
    assert.ok(
      EQUIVALENT.quote.includes(EQUIVALENT.modernForm),
      'the modern form must be part of the quoted text, or the quote sources nothing',
    );
    assert.ok(
      EQUIVALENT.modernForm !== '',
      'the modern form the finding will carry must not be empty',
    );
  });
});

// ---------------------------------------------------------------- purity ----

describe('extension/legacy-structure.js is a pure module', () => {
  it('loads in a context with no DOM, no window, no console and no clock', () => {
    const { api, context } = loadBare();
    assert.equal(
      context.document,
      undefined,
      'the module must not need a document',
    );
    assert.equal(
      context.window,
      undefined,
      'the module must not need a window',
    );
    assert.equal(
      context.performance,
      undefined,
      'the module must not read a clock',
    );
    assert.equal(
      context.console,
      undefined,
      'the module must not need a console',
    );
    assert.equal(
      typeof api.legacyStructure,
      'function',
      'the module must export the join',
    );
    assert.equal(api.FINDING, 'finding');
    assert.equal(api.CANNOT_TELL, 'cannot-tell');
    assert.equal(api.NGMODULE_DECLARED, 'NgModule-declared');
    assert.equal(api.ALREADY_STANDALONE, 'already-standalone');
    assert.equal(api.METADATA_UNREADABLE, 'metadata-unreadable');
    assert.equal(api.NO_SOURCED_EQUIVALENT, 'no-sourced-equivalent');
  });

  it('reads no console, clock or DOM of its own, with all of them in reach (N1)', () => {
    const { api, calls } = loadWithProbes();
    assert.deepEqual(
      calls,
      [],
      'loading the module must install nothing and read nothing',
    );
    host(api.legacyStructure(DECLARED_FACT, EQUIVALENTS));
    host(api.legacyStructure(STANDALONE_FACT, EQUIVALENTS));
    host(api.legacyStructure({ name: COMPONENT }, EQUIVALENTS));
    host(api.legacyStructure(null, null));
    assert.deepEqual(
      calls,
      [],
      'joining must not read the console, the clock or the DOM: the fact and the table are the whole input (N1)',
    );
  });

  it('leaves the fact and the table exactly as it received them', () => {
    const fact = JSON.parse(JSON.stringify(DECLARED_FACT));
    const equivalents = JSON.parse(JSON.stringify(EQUIVALENTS));
    const factBefore = JSON.stringify(fact);
    const equivalentsBefore = JSON.stringify(equivalents);
    const { api } = loadBare();
    host(api.legacyStructure(fact, equivalents));
    host(api.legacyStructure({ name: COMPONENT }, equivalents));
    assert.equal(
      JSON.stringify(fact),
      factBefore,
      'joining must not write to the fact',
    );
    assert.equal(
      JSON.stringify(equivalents),
      equivalentsBefore,
      'joining must not write to the table',
    );
  });
});

// ---------------------------------------------------------------- AC1 / E1 ----

describe('AC1/E1 — a component whose ɵcmp.standalone is false', () => {
  it('is a finding naming the component, with the table’s modern form and source', (t) => {
    const { api } = loadBare();
    const result = host(api.legacyStructure(DECLARED_FACT, EQUIVALENTS));
    assertFinding(result, {
      component: COMPONENT,
      modernForm: EQUIVALENT.modernForm,
      source: EQUIVALENT.url,
    });
    t.diagnostic(`finding: ${JSON.stringify(result)}`);
  });

  it('carries the form and the source the table states, whatever the table states', () => {
    const { api } = loadBare();
    const result = host(api.legacyStructure(DECLARED_FACT, FIXTURE_TABLE));
    assertFinding(result, {
      component: COMPONENT,
      modernForm: 'FORM-THE-TABLE-STATES',
      source: 'https://example.test/a-page-this-table-was-never-fetched-from',
    });
  });

  it('accepts the entries array as the table, as well as the recording that holds it', () => {
    const { api } = loadBare();
    for (const equivalents of [
      EQUIVALENTS,
      EQUIVALENTS.entries,
      [...EQUIVALENTS.entries],
    ]) {
      pinFinding(api.legacyStructure(DECLARED_FACT, equivalents));
    }
  });

  it('names the component it was given, and reads no ɵcmp of its own', () => {
    const { api } = loadBare();
    const fact = { name: COMPONENT, standalone: false };
    Object.defineProperty(fact, 'ɵcmp', {
      get() {
        throw new Error(
          'the module must not read ɵcmp: the caller read the flag already',
        );
      },
    });
    assertFinding(host(api.legacyStructure(fact, EQUIVALENTS)), {
      component: COMPONENT,
      modernForm: EQUIVALENT.modernForm,
      source: EQUIVALENT.url,
    });
  });
});

// ---------------------------------------------------------------- AC2 ----

describe('AC2 — a component that is already standalone', () => {
  it('is cannot-tell with already-standalone, and names no modern form', (t) => {
    const { api } = loadBare();
    const result = host(api.legacyStructure(STANDALONE_FACT, EQUIVALENTS));
    assertCannotTell(result, 'already-standalone', 'a standalone component');
    assert.ok(
      !JSON.stringify(result).includes(EQUIVALENT.modernForm),
      'a standalone component has no NgModule declaration to modernise, so no form may ride along',
    );
    t.diagnostic(`already-standalone: ${JSON.stringify(result)}`);
  });

  it('says the same for every table it is handed', () => {
    const { api } = loadBare();
    for (const equivalents of [
      EQUIVALENTS,
      FIXTURE_TABLE,
      [],
      undefined,
      null,
    ]) {
      assertCannotTell(
        host(api.legacyStructure(STANDALONE_FACT, equivalents)),
        'already-standalone',
        'a standalone component',
      );
    }
  });
});

// ---------------------------------------------------------------- AC3 / E3 ----

describe('AC3/E3 — the metadata cannot be read', () => {
  it('is cannot-tell with metadata-unreadable, and names neither structure nor form', (t) => {
    const { api } = loadBare();
    const facts = [
      undefined,
      null,
      'a component',
      ['SomeDeclaredComponent'],
      {},
      { name: COMPONENT },
      { name: COMPONENT, standalone: null },
      { name: COMPONENT, standalone: 'false' },
      { name: COMPONENT, standalone: 'true' },
      { name: COMPONENT, standalone: 0 },
      { name: COMPONENT, standalone: 1 },
      { name: COMPONENT, standalone: undefined },
      { name: '', standalone: false },
      { name: '   ', standalone: false },
      { standalone: false },
    ];
    for (const fact of facts) {
      const result = host(api.legacyStructure(fact, EQUIVALENTS));
      assertCannotTell(
        result,
        'metadata-unreadable',
        `the fact ${JSON.stringify(fact)}`,
      );
      assert.ok(
        !JSON.stringify(result).includes(EQUIVALENT.modernForm),
        `the fact ${JSON.stringify(fact)} names no form: the read did not happen`,
      );
    }
    t.diagnostic(
      `metadata-unreadable: ${JSON.stringify(host(api.legacyStructure({ name: COMPONENT }, EQUIVALENTS)))}`,
    );
  });

  it('does not read ɵcmp itself, whatever the fact carries under that name', () => {
    const { api } = loadBare();
    const fact = { name: COMPONENT };
    Object.defineProperty(fact, 'ɵcmp', {
      get() {
        throw new Error(
          'the module must not read ɵcmp: this is the withheld read',
        );
      },
    });
    assertCannotTell(
      host(api.legacyStructure(fact, EQUIVALENTS)),
      'metadata-unreadable',
      'a fact whose ɵcmp object the caller did not translate into a flag',
    );
  });
});

// ---------------------------------------------------------------- AC4 / E2 ----

describe('AC4/E2 — with the metadata read withheld', () => {
  it('produces no finding from a component’s name, selector or file path', () => {
    const { api } = loadBare();
    const facts = [
      { name: COMPONENT },
      { name: COMPONENT, selector: 'app-some-declared' },
      { name: COMPONENT, file: 'src/app/legacy-module-page.ts' },
      {
        name: COMPONENT,
        selector: 'app-legacy-module-page',
        file: 'spikes/ng222-app/src/app/legacy-module-page.ts',
      },
      // A name shaped like the legacy constructs this milestone is about is still only a name.
      { name: 'LegacyModulePage' },
      { name: 'SomeDeclaredInAModuleComponent' },
      { name: 'AppModule' },
    ];
    const findings = facts.filter(
      (fact) =>
        host(api.legacyStructure(fact, EQUIVALENTS)).state === 'finding',
    );
    assert.deepEqual(
      findings,
      [],
      'no name, selector or file path may stand in for the ɵcmp.standalone read the caller withheld (E2)',
    );
    for (const fact of facts) {
      assertCannotTell(
        host(api.legacyStructure(fact, EQUIVALENTS)),
        'metadata-unreadable',
        `the fact ${JSON.stringify(fact)}`,
      );
    }
  });

  it('produces no finding when the table is withheld as well', () => {
    const { api } = loadBare();
    for (const equivalents of [undefined, null, [], {}, { entries: [] }]) {
      assertCannotTell(
        host(
          api.legacyStructure(
            { name: COMPONENT, selector: 'app-x' },
            equivalents,
          ),
        ),
        'metadata-unreadable',
        'a fact with the metadata read withheld',
      );
    }
  });
});

// ---------------------------------------------------------------- AC6 guard ----

describe('a table that sources no form for the structure', () => {
  it('yields cannot-tell with no-sourced-equivalent, and names no form', (t) => {
    const { api } = loadBare();
    const tables = [
      undefined,
      null,
      [],
      {},
      { entries: [] },
      [{ structure: 'NgModule-declared' }],
      [{ structure: 'NgModule-declared', modernForm: 'a form with no source' }],
      [{ structure: 'NgModule-declared', url: 'https://example.test/x' }],
      [
        {
          structure: 'NgModule-declared',
          modernForm: '   ',
          url: 'https://example.test/x',
        },
      ],
      [
        {
          structure: 'something-else',
          modernForm: 'x',
          url: 'https://example.test/x',
        },
      ],
      [null, 'an entry', 42],
    ];
    for (const equivalents of tables) {
      const result = host(api.legacyStructure(DECLARED_FACT, equivalents));
      assertCannotTell(
        result,
        'no-sourced-equivalent',
        `the table ${JSON.stringify(equivalents)}`,
      );
    }
    t.diagnostic(
      `no-sourced-equivalent: ${JSON.stringify(host(api.legacyStructure(DECLARED_FACT, [])))}`,
    );
  });
});

// ---------------------------------------------------------------- mutants ----

// The line a finding is built on. It appears once in the module, and the mutant rewrites exactly it,
// so the failing pin names the property that was broken.
const FORM_RETURN = 'modernForm: sourced.modernForm,';

// The metadata branch AC4 is about. The mutant answers a finding from whichever name the fact
// carries, which is the inference E2 exists to forbid.
const METADATA_BRANCH =
  'if (standalone === null) return cannotTell(METADATA_UNREADABLE);';

describe('mutants — each applied to a copy, then the module restored', () => {
  it('M1: rendering a modern form no entry sources reddens the sourcing pin (AC6)', (t) => {
    // The pin first, on the module as it stands: the form is the table's own string.
    pinFinding(loadBare().api.legacyStructure(DECLARED_FACT, EQUIVALENTS));

    // The mutant writes a plausible form of its own instead of carrying the table's.
    const api = mutant(FORM_RETURN, "modernForm: 'standalone: true',");
    const result = host(api.legacyStructure(DECLARED_FACT, EQUIVALENTS));
    assert.equal(
      result.state,
      'finding',
      'the mutant must still answer, so the red comes from the sourcing and not from a throw',
    );
    assert.equal(
      result.modernForm,
      'standalone: true',
      'the mutant must render a form the table never carried',
    );
    const failure = reddensBy(
      () => pinFinding(result),
      'rendering a modern form no entry sources',
      /the finding must carry the modern form the equivalents table sources/,
    );
    t.diagnostic(`M1 reddens AC6: ${failure.message.split('\n')[0]}`);

    // The file on disk was never written, so reloading it restores the pin.
    pinFinding(loadBare().api.legacyStructure(DECLARED_FACT, EQUIVALENTS));
  });

  it('M2: inferring the structure from the component’s name reddens the metadata pin (E2)', (t) => {
    const fact = {
      name: 'LegacyModulePage',
      selector: 'app-legacy-module-page',
      file: 'src/app/legacy-module-page.ts',
    };
    const pin = (result) =>
      assertCannotTell(
        host(result),
        'metadata-unreadable',
        'a fact whose ɵcmp.standalone was never read',
      );
    // The pin first: with the read withheld, the name buys no structure.
    pin(loadBare().api.legacyStructure(fact, EQUIVALENTS));

    const api = mutant(
      METADATA_BRANCH,
      [
        'if (standalone === null) {',
        '      const named = nameOf(fact);',
        '      const inferred = sourcedFor(equivalents, NGMODULE_DECLARED);',
        '      if (named !== null && inferred !== null) {',
        '        return finding(named, inferred);',
        '      }',
        '      return cannotTell(METADATA_UNREADABLE);',
        '    }',
      ].join('\n'),
    );
    const result = host(api.legacyStructure(fact, EQUIVALENTS));
    assert.equal(
      result.state,
      'finding',
      'the mutant must answer from the name alone, or it is not the mutation E2 exists to catch',
    );
    const failure = reddensBy(
      () => pin(result),
      'inferring the structure from the component’s name',
      /must be cannot-tell/,
    );
    t.diagnostic(`M2 reddens E2: ${failure.message.split('\n')[0]}`);

    pin(loadBare().api.legacyStructure(fact, EQUIVALENTS));
  });
});
