// M065 T002 — the suite for `extension/title-input.js`, the join that reads T001's title recording as
// one of four states. Read-only: `node --test scripts/title-input.test.mjs`.
//
// What this suite pins, and why each pin exists:
//
//   purity     the module runs in a bare `node:vm` context — no `document`, no `window`, no
//              `performance`, no console — and touches none of them where they exist.
//   AC1        a document title that differs from the route's implied title is a `finding` naming
//              both values and the strategy. Mutant: one scratch copy under `os.tmpdir()` in which
//              the finding carries the route's title over the document's, which must redden this pin
//              by naming `documentTitle` and the defect.
//   AC2        a record whose observation started after the last write answers
//              `cannot-tell`/`observation-started-after-the-write` and carries no observed write.
//              Mutant: a scratch copy that treats the pre-observation title as one the observation
//              accounts for, which must redden this pin by naming the reason and the defect.
//   AC3        the committed recording — every navigation of it — answers
//              `cannot-tell`/`route-binds-nothing` rather than an empty object. Mutant: a scratch copy
//              that answers `{}` there, and that must redden this pin by naming `state`.
//   SC3        the record's fields and the join's inputs are one list: the set of fields the module
//              actually reads (recorded through a proxy that also refuses a write) equals
//              `RECORD_INPUTS`, and every name in that list is a field the committed recording
//              carries. A field added to one side and not the other reddens by name.
//
// The absence states are read from `research/raw/m065-title-record.json` as a fixture and asserted
// against the committed bytes. The positive `finding` and `agrees` states are constructed here,
// because the portal cannot produce them: every navigation it recorded binds nothing, and its one
// title write is one the observer never saw.
//
// A title write the observer never saw is a title, not a claim: this suite never asserts a cause for
// one, and no answer here may name a writer, a cause or a remedy.
import assert from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The module and the recording this suite reads, each named as a literal. */
const MODULE_REL = 'extension/title-input.js';
const RECORD_REL = 'research/raw/m065-title-record.json';
const RECORD_PATH = join(ROOT, ...RECORD_REL.split('/'));
const MODULE_PATH = join(ROOT, ...MODULE_REL.split('/'));

const MODULE_SOURCE = read(MODULE_REL);

// ------------------------------------------------------------------ reading ----

/**
 * One committed file, as text. A missing file is named with the path a reader can open.
 * @param {string} rel
 * @returns {string}
 */
function read(rel) {
  const path = join(ROOT, ...rel.split('/'));
  assert.ok(existsSync(path), `${rel} is a file this tree carries`);
  return readFileSync(path, 'utf8');
}

/**
 * One file's code with its comments removed: the doc comments are prose and decide nothing, and a
 * scan that counted them would report a word the code never names.
 * @param {string} source
 * @returns {string}
 */
function codeOf(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/**
 * A value built inside the vm realm as a plain value, so a deepEqual compares data and not two
 * realms' prototypes.
 * @param {unknown} value
 */
function host(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * The module in a bare `node:vm` context: a world with nothing in it, so the answer read back is the
 * answer the file publishes rather than a copy of it.
 * @param {string} [source]
 * @param {string} [filename]
 */
function loadBare(source = MODULE_SOURCE, filename = MODULE_REL) {
  const context = createContext({});
  runInContext(source, context, { filename: filename });
  const api = context.angularAiTitleInput;
  assert.ok(
    api,
    `${MODULE_REL} must publish angularAiTitleInput on the global object of whatever world it runs in`,
  );
  return api;
}

/**
 * The module in a world that has a page, a clock, a console and an extension API, each with a tap
 * counter: loading and using the module must read none of them.
 */
function loadWithProbes() {
  const calls = [];
  /**
   * @param {string} name
   * @returns {(...args: unknown[]) => undefined}
   */
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
    },
    performance: { now: tap('performance.now') },
    document: {
      querySelector: tap('document.querySelector'),
      addEventListener: tap('document.addEventListener'),
    },
    window: { addEventListener: tap('window.addEventListener') },
    fetch: tap('fetch'),
    XMLHttpRequest: tap('XMLHttpRequest'),
    chrome: { runtime: { getURL: tap('chrome.runtime.getURL') } },
  });
  runInContext(MODULE_SOURCE, context, { filename: MODULE_REL });
  return { api: context.angularAiTitleInput, calls: calls };
}

const API = loadBare();

/** The closed sets, read from the namespace the module publishes rather than written here. */
const STATES = host(API.STATES);
const REASONS = host(API.REASONS);
const FIELDS = host(API.FIELDS);
const RECORD_INPUTS = host(API.RECORD_INPUTS);
const FACT_INPUTS = host(API.FACT_INPUTS);

/** The committed recording, as the bytes on disk read it. */
const REAL_RECORD = JSON.parse(read(RECORD_REL));

// ----------------------------------------------------------------- fixtures ----

/**
 * One navigation, in the shape T001 writes it. Only the parts this suite is about are given; the rest
 * is the shape of the recording, so a fixture is a record and not a stub of this suite's invention.
 * @param {Record<string, any>} options
 */
function navigationOf(options) {
  const titleDeclared =
    'titleDeclared' in options ? options.titleDeclared : 'Claim';
  const data = options.data ?? BOUND_DATA;
  const titles =
    'titles' in options
      ? options.titles
      : [
          {
            at: '2026-01-01T00:00:00.000Z',
            phase: 'before-navigation',
            value: options.beforeTitle ?? 'Insurance Portal',
            writesSeen: 0,
          },
          {
            at: '2026-01-01T00:00:01.000Z',
            phase: 'after-navigation',
            value: options.documentTitle,
            writesSeen: 0,
          },
        ];
  return {
    index: options.index ?? 0,
    trigger: 'ng.ɵnavigateByUrl',
    requestedUrl: options.url ?? '/claim',
    startedAt: '2026-01-01T00:00:00.000Z',
    settledAt: '2026-01-01T00:00:01.000Z',
    url: options.url ?? '/claim',
    locationPath: options.url ?? '/claim',
    observedByObserver: true,
    strategy: options.strategy ?? strategyOf('DefaultTitleStrategy'),
    route: {
      activatedPath: 'claim',
      error: null,
      pathChain: [null, 'claim'],
      titleDeclared: titleDeclared,
      titlesDeclared: titleDeclared === null ? [] : [titleDeclared],
      frames: [],
      data: data,
    },
    titles: titles,
    writesFollowing: [],
  };
}

/** One title write, in the shape T001 writes it, with the author it recorded. */
function writeOf(options) {
  return {
    index: options.index ?? 0,
    at: 'at' in options ? options.at : '2026-01-01T00:00:00.500Z',
    title: options.title,
    observed: options.observed,
    author: options.author ?? null,
    navigationIndex:
      'navigationIndex' in options ? options.navigationIndex : null,
    basis: options.basis ?? 'the observer saw the write',
  };
}

/** One recording, in the shape T001 writes it. */
function recordOf(navigations, writes) {
  return {
    schema: 'm065-title-record/v1',
    milestone: 'M065',
    task: 'T001',
    question: 'Does the portal expose a route that binds data the title reads?',
    capturedAt: '2026-01-01T00:00:02.000Z',
    observation: {
      beganAt: '2026-01-01T00:00:00.000Z',
      beganAfterIndex: 0,
      beganAfterUrl: '/home',
      titleAtStart: 'Insurance Portal',
      writesSeen: 0,
    },
    navigations: navigations,
    writes: writes,
  };
}

/** The strategy the injector answered with, or the absence a `null` class name states. */
function strategyOf(className) {
  return {
    resolved: className !== null,
    tokenName: 'TitleStrategy',
    className: className,
    fromInjector:
      'router.navigationTransitions.environmentInjector.get(TitleStrategy)',
    routerFieldClassName: className,
    sameInstanceAsRouterField: className !== null,
    error: className === null ? 'no provider for TitleStrategy' : null,
  };
}

/** The one data snapshot a route that binds something carries. */
const BOUND_DATA = {
  state: 'bound',
  serialised: '{"title":"Claim"}',
  keys: ['title'],
  note: 'the route config declares a data key and the snapshot carries it',
};

/** The data snapshot every navigation of the committed recording carries. */
const ABSENT_DATA = {
  state: 'absent',
  serialised: '{}',
  keys: [],
  note: 'no frame declares a data key and no snapshot carries one; the serialised empty object is the framework default, not a bound value',
};

/** The document title the positive fixtures differ on, and the title the route implies. */
const FINDING_DOCUMENT_TITLE = 'Claim | Insurance Portal';
const ROUTE_TITLE = 'Claim';

/** The answer a differing pair warrants: both values, the strategy, and the observed writes. */
const FINDING_ANSWER = {
  state: 'finding',
  strategy: 'DefaultTitleStrategy',
  documentTitle: FINDING_DOCUMENT_TITLE,
  impliedTitle: ROUTE_TITLE,
  observedWrites: 1,
};

/** The answer a matching pair warrants. */
const AGREES_ANSWER = {
  state: 'agrees',
  strategy: 'DefaultTitleStrategy',
  documentTitle: ROUTE_TITLE,
  impliedTitle: ROUTE_TITLE,
};

/** A route that binds data, implies a title, and a document title that differs from it. */
const FINDING_RECORD = recordOf(
  [
    navigationOf({
      documentTitle: FINDING_DOCUMENT_TITLE,
      titleDeclared: ROUTE_TITLE,
      data: BOUND_DATA,
    }),
  ],
  [
    writeOf({
      index: 0,
      title: FINDING_DOCUMENT_TITLE,
      observed: true,
      author: 'DefaultTitleStrategy',
      navigationIndex: 0,
    }),
    writeOf({
      index: 1,
      title: 'Contract | Insurance Portal',
      observed: true,
      author: 'DefaultTitleStrategy',
      navigationIndex: 1,
    }),
  ],
);

/**
 * The committed recording's own shape, with a route that binds data and a title the route implies:
 * the document still carries the title it carried when the observation began. This is the record
 * AC2 is about, and it is the real record's one write, mirrored.
 */
const OBSERVATION_STARTED_RECORD = recordOf(
  [
    navigationOf({
      documentTitle: 'Insurance Portal',
      titleDeclared: ROUTE_TITLE,
      data: BOUND_DATA,
    }),
  ],
  [
    writeOf({
      index: 0,
      at: null,
      title: 'Insurance Portal',
      observed: false,
      author: null,
      navigationIndex: null,
      basis:
        'the title the document carried when the observation began; the observer saw no write for it',
    }),
  ],
);

/** A route whose strategy resolved and whose document title matches what the route implies. */
const AGREES_RECORD = recordOf(
  [
    navigationOf({
      documentTitle: ROUTE_TITLE,
      titleDeclared: ROUTE_TITLE,
      data: BOUND_DATA,
    }),
  ],
  [
    writeOf({
      index: 0,
      title: ROUTE_TITLE,
      observed: true,
      author: 'DefaultTitleStrategy',
      navigationIndex: 0,
    }),
  ],
);

/**
 * The same pair, with a write the observer never saw: nothing differs, so there is nothing to
 * attribute, and the answer is the agreement it measured.
 */
const AGREES_WITH_UNOBSERVED_RECORD = recordOf(
  [
    navigationOf({
      documentTitle: ROUTE_TITLE,
      titleDeclared: ROUTE_TITLE,
      data: BOUND_DATA,
    }),
  ],
  [
    writeOf({
      index: 0,
      at: null,
      title: ROUTE_TITLE,
      observed: false,
      author: null,
      navigationIndex: null,
    }),
  ],
);

/**
 * A route whose `title` is a `Resolve<string>`: the recording carries `titleDeclared: null` because a
 * function is not a value a JSON record states, and the caller hands the resolved title in `facts`.
 */
const RESOLVED_BY_FACTS_RECORD = recordOf(
  [
    navigationOf({
      documentTitle: ROUTE_TITLE,
      titleDeclared: null,
      data: BOUND_DATA,
    }),
  ],
  [],
);

/** A route whose injector resolved no strategy, and whose titles would otherwise agree. */
const NO_STRATEGY_RECORD = recordOf(
  [
    navigationOf({
      documentTitle: ROUTE_TITLE,
      titleDeclared: ROUTE_TITLE,
      data: BOUND_DATA,
      strategy: strategyOf(null),
    }),
  ],
  [],
);

/** A route that binds nothing, with a title resolved in `facts`: the binding outranks the title. */
const BINDS_NOTHING_RECORD = recordOf(
  [
    navigationOf({
      documentTitle: ROUTE_TITLE,
      titleDeclared: null,
      data: ABSENT_DATA,
    }),
  ],
  [],
);

/** A route that binds data and implies no title, with no title resolved by the caller. */
const NO_IMPLIED_RECORD = recordOf(
  [
    navigationOf({
      documentTitle: ROUTE_TITLE,
      titleDeclared: null,
      data: BOUND_DATA,
    }),
  ],
  [],
);

/** Two navigations: the first agrees, the last differs, and the last one answers. */
const TWO_NAVIGATIONS_RECORD = recordOf(
  [
    navigationOf({
      index: 0,
      url: '/home',
      documentTitle: 'Home',
      titleDeclared: 'Home',
      data: BOUND_DATA,
    }),
    navigationOf({
      index: 1,
      documentTitle: FINDING_DOCUMENT_TITLE,
      titleDeclared: ROUTE_TITLE,
      data: BOUND_DATA,
    }),
  ],
  [
    writeOf({
      index: 0,
      title: FINDING_DOCUMENT_TITLE,
      observed: true,
      author: 'DefaultTitleStrategy',
      navigationIndex: 1,
    }),
  ],
);

/** Every value a caller may hand over that captured no record at all, each named for the table. */
const NO_RECORD_CASES = [
  { name: 'nothing captured: null', value: null },
  { name: 'nothing captured: undefined', value: undefined },
  { name: 'nothing captured: a string', value: 'a record' },
  { name: 'nothing captured: a number', value: 42 },
  { name: 'nothing captured: an array', value: [] },
  { name: 'nothing captured: an empty object', value: {} },
  {
    name: 'nothing captured: a record with no navigation',
    value: { navigations: [] },
  },
  {
    name: 'nothing captured: a navigation that is not an object',
    value: { navigations: [null] },
  },
  {
    name: 'nothing captured: a navigation with no title read',
    value: recordOf([{ index: 0, strategy: {}, route: {}, titles: [] }], []),
  },
  {
    name: 'nothing captured: a navigation whose titles are empty',
    value: recordOf(
      [navigationOf({ documentTitle: ROUTE_TITLE, titles: [] })],
      [],
    ),
  },
  {
    name: 'nothing captured: a navigation whose only title is blank',
    value: recordOf(
      [
        navigationOf({
          documentTitle: ROUTE_TITLE,
          titles: [
            { at: '2026-01-01T00:00:01.000Z', phase: 'later', value: '   ' },
          ],
        }),
      ],
      [],
    ),
  },
];

/**
 * Every fixture, what it is about, and the exact answer the contract requires. The absence states
 * come from the committed recording and from records shaped like it; the positive states are
 * constructed, because the portal produces neither.
 */
const CASES = [
  {
    name: 'the committed recording of the portal',
    record: REAL_RECORD,
    facts: undefined,
    answer: { state: 'cannot-tell', reason: 'route-binds-nothing' },
  },
  {
    name: 'a route that binds nothing, with a title resolved in facts',
    record: BINDS_NOTHING_RECORD,
    facts: { impliedTitle: ROUTE_TITLE },
    answer: { state: 'cannot-tell', reason: 'route-binds-nothing' },
  },
  {
    name: 'a record whose injector resolved no strategy',
    record: NO_STRATEGY_RECORD,
    facts: undefined,
    answer: { state: 'cannot-tell', reason: 'no-strategy' },
  },
  {
    name: 'a bound route that implies no title',
    record: NO_IMPLIED_RECORD,
    facts: {},
    answer: { state: 'cannot-tell', reason: 'no-implied-title' },
  },
  {
    name: 'an observation that began after the write',
    record: OBSERVATION_STARTED_RECORD,
    facts: undefined,
    answer: {
      state: 'cannot-tell',
      reason: 'observation-started-after-the-write',
    },
  },
  {
    name: 'a document title that differs from the route’s',
    record: FINDING_RECORD,
    facts: undefined,
    answer: FINDING_ANSWER,
  },
  {
    name: 'a document title that matches the route’s',
    record: AGREES_RECORD,
    facts: undefined,
    answer: AGREES_ANSWER,
  },
  {
    name: 'a title the caller resolved from a route function',
    record: RESOLVED_BY_FACTS_RECORD,
    facts: { impliedTitle: ROUTE_TITLE },
    answer: AGREES_ANSWER,
  },
  {
    name: 'an agreeing pair with a write the observer did not see',
    record: AGREES_WITH_UNOBSERVED_RECORD,
    facts: undefined,
    answer: AGREES_ANSWER,
  },
  {
    name: 'two navigations, the last one differing',
    record: TWO_NAVIGATIONS_RECORD,
    facts: undefined,
    answer: FINDING_ANSWER,
  },
].concat(
  NO_RECORD_CASES.map((item) => ({
    name: item.name,
    record: item.value,
    facts: undefined,
    answer: { state: 'no-record' },
  })),
);

// -------------------------------------------------------------------- pins ----

/** The words an answer may never use: a writer, a cause, a remedy or a guess. */
const FORBIDDEN = [
  'author',
  'writer',
  'cause',
  'because',
  'remedy',
  'fix',
  'should',
  'blame',
  'hypothesis',
  'misconfigur',
  'race',
];

/**
 * Every string an answer states, lowercased, with the two titles the page wrote dropped: those are
 * the page's own words, repeated rather than composed.
 * @param {Record<string, any>} written
 * @param {string} what
 */
function assertNamesNoWriterOrCause(written, what) {
  const text = JSON.stringify(written, (key, entry) =>
    key === 'documentTitle' || key === 'impliedTitle' ? '<title>' : entry,
  ).toLowerCase();
  for (const word of FORBIDDEN) {
    assert.ok(
      !text.includes(word),
      `${what} must not say "${word}": the answer states what the record carries, and no writer, cause or remedy — ${text}`,
    );
  }
}

/**
 * The pin every answer is held to, and the same pin each mutant below is run through. Its messages
 * name the field that moved, so a mutant's failure is legible rather than a diff of two objects.
 * @param {Record<string, any>} written
 * @param {Record<string, any>} expected
 * @param {string} what
 */
function assertAnswer(written, expected, what) {
  assert.ok(
    written !== null && typeof written === 'object' && !Array.isArray(written),
    `${what} must be one object, and it is ${JSON.stringify(written)}`,
  );
  for (const key of Object.keys(written)) {
    assert.ok(
      FIELDS.includes(key),
      `${what} carries \`${key}\`, and \`${key}\` is not one of the interface's fields ${JSON.stringify(FIELDS)}`,
    );
  }
  assert.ok(
    STATES.includes(written.state),
    `${what} states \`state\` ${JSON.stringify(written.state)}, which is not one of the four states ${JSON.stringify(STATES)} — the record's answer is ${JSON.stringify(expected)}`,
  );
  assert.equal(
    written.state,
    expected.state,
    `${what} must answer \`state\` ${JSON.stringify(expected.state)} (the record's answer is ${JSON.stringify(expected)}); it answered ${JSON.stringify(written.state)}`,
  );
  if ('reason' in expected) {
    assert.equal(
      written.reason,
      expected.reason,
      `${what} must answer \`reason\` ${JSON.stringify(expected.reason)}; it answered ${JSON.stringify(written.reason)}`,
    );
  } else {
    assert.ok(
      !('reason' in written),
      `${what} carries \`reason\` on the state ${JSON.stringify(written.state)}, and only cannot-tell names one`,
    );
  }
  if (written.state === 'finding' || written.state === 'agrees') {
    assert.equal(
      written.strategy,
      expected.strategy,
      `${what} states \`strategy\` ${JSON.stringify(written.strategy)}, and the injector resolved ${JSON.stringify(expected.strategy)}`,
    );
    assert.equal(
      written.documentTitle,
      expected.documentTitle,
      `${what} states \`documentTitle\` ${JSON.stringify(written.documentTitle)}, and the document carried ${JSON.stringify(expected.documentTitle)}`,
    );
    assert.equal(
      written.impliedTitle,
      expected.impliedTitle,
      `${what} states \`impliedTitle\` ${JSON.stringify(written.impliedTitle)}, and the route implies ${JSON.stringify(expected.impliedTitle)}`,
    );
  }
  if (written.state === 'finding') {
    assert.equal(
      written.observedWrites,
      expected.observedWrites,
      `${what} states \`observedWrites\` ${JSON.stringify(written.observedWrites)}, and the observation saw ${String(expected.observedWrites)} write(s) for the navigation that answered`,
    );
  }
  assert.deepEqual(
    Object.keys(written),
    Object.keys(expected),
    `${what} states the fields ${JSON.stringify(Object.keys(written))}, and the contract's answer states ${JSON.stringify(Object.keys(expected))}`,
  );
  assertNamesNoWriterOrCause(written, what);
}

/**
 * The failure a pin raises, or null where it stayed green.
 * @param {() => void} pin
 * @returns {Error | null}
 */
function failureOf(pin) {
  try {
    pin();
  } catch (error) {
    return /** @type {Error} */ (error);
  }
  return null;
}

/** The answer one fixture warrants, read through the shipped module. */
function answerOf(item) {
  return host(API.titleInput(item.record, item.facts));
}

/**
 * SC3's pin, callable with any module's namespace: the fields the join reads — recorded as it reads
 * them, through a proxy that refuses a write — are exactly the fields it publishes as its inputs, and
 * every one of those names is a field the committed recording carries. A field added to the code and
 * not to the list, or to the list and not to the record, reddens here naming the field.
 * @param {Record<string, any>} api
 * @param {string} what
 */
function pinInputs(api, what) {
  const recordInputs = [...api.RECORD_INPUTS];
  const factInputs = [...api.FACT_INPUTS];
  const readFields = new Set();
  const readFacts = new Set();

  /**
   * One value behind a recording proxy: every string key read is counted, and a write throws.
   * @param {unknown} value
   * @param {Set<string>} into
   */
  function recorder(value, into) {
    const seen = new WeakMap();
    /** @param {any} target */
    function wrap(target) {
      if (target === null || typeof target !== 'object') return target;
      const held = seen.get(target);
      if (held !== undefined) return held;
      const proxy = new Proxy(target, {
        get(object, key, receiver) {
          if (
            typeof key === 'string' &&
            !/^[0-9]+$/.test(key) &&
            key !== 'length'
          ) {
            into.add(key);
          }
          return wrap(Reflect.get(object, key, receiver));
        },
        set() {
          throw new Error(
            'the join must not write into the record it is handed',
          );
        },
      });
      seen.set(target, proxy);
      return proxy;
    }
    return wrap(value);
  }

  for (const item of CASES) {
    api.titleInput(
      recorder(item.record, readFields),
      recorder(item.facts, readFacts),
    );
  }

  /**
   * The names one list has that the other does not, as backticked names, so a difference is named
   * rather than counted.
   * @param {Set<string>|string[]} left
   * @param {Set<string>|string[]} right
   */
  function difference(left, right) {
    const rightSet = new Set(right);
    return [...new Set(left)]
      .filter((name) => !rightSet.has(name))
      .sort()
      .map((name) => `\`${name}\``)
      .join(', ');
  }

  assert.deepEqual(
    [...readFields].sort(),
    recordInputs.slice().sort(),
    `${what} must read exactly the fields it publishes as its inputs: it read ${difference(readFields, recordInputs) || 'nothing'} that RECORD_INPUTS does not name, and RECORD_INPUTS names ${difference(recordInputs, readFields) || 'nothing'} that it never read`,
  );
  assert.deepEqual(
    [...readFacts].sort(),
    factInputs.slice().sort(),
    `${what} must read exactly the one fact it publishes: it read ${difference(readFacts, factInputs) || 'nothing'} that FACT_INPUTS does not name, and FACT_INPUTS names ${difference(factInputs, readFacts) || 'nothing'} that it never read`,
  );

  // Every name in that list is a field the committed recording carries: a field added to the join
  // and not to the record reddens here, naming the field.
  const carried = new Set();
  /** @param {unknown} value */
  function walk(value) {
    if (value === null || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      for (const entry of value) walk(entry);
      return;
    }
    for (const key of Object.keys(value)) {
      carried.add(key);
      walk(value[key]);
    }
  }
  walk(REAL_RECORD);

  for (const name of recordInputs) {
    assert.ok(
      carried.has(name),
      `${what} reads \`${name}\`, and the committed recording ${RECORD_REL} carries no field of that name — the record’s fields and the join’s inputs are one list`,
    );
  }

  // The fields the recording carries that this join must not read: the record's own roll-up, the
  // author, the basis and the timestamps. The join answers from measurements, not from a summary.
  for (const name of [
    'author',
    'basis',
    'at',
    'observation',
    'titleInput',
    'boundRouteData',
    'routesBindingData',
    'statement',
  ]) {
    assert.ok(
      carried.has(name),
      `the committed recording must carry \`${name}\`, so the refusal below is a refusal of a field that exists`,
    );
    assert.ok(
      !recordInputs.includes(name),
      `${what} must not read \`${name}\`: it answers from what was measured, and never repeats the record's own summary or names a writer`,
    );
  }
}

// ----------------------------------------------------------------- mutants ----

/**
 * Copy the module under test to this run's temporary directory — `os.tmpdir()` — and apply one
 * substitution to it. The copy is what runs, so the committed module is never the thing a mutant
 * proves.
 * @param {{ id: string, defect: string, find: string, replace: string }} spec
 */
function scratchCopy(spec) {
  assert.ok(
    typeof spec.defect === 'string' && spec.defect.trim() !== '',
    `the mutant ${spec.id} must name the defect its failure has to state, or the assertion that reads the failure's message would pass on an empty string`,
  );
  const occurrences = MODULE_SOURCE.split(spec.find).length - 1;
  assert.equal(
    occurrences,
    1,
    `the mutant ${spec.id} must change exactly one place in ${MODULE_REL}; it matched ${String(occurrences)}`,
  );
  const mutated = MODULE_SOURCE.replace(spec.find, spec.replace);
  assert.notEqual(
    mutated,
    MODULE_SOURCE,
    `the mutant ${spec.id} must change the module's bytes, or the case proves nothing`,
  );
  const dir = mkdtempSync(join(tmpdir(), 'm065-title-input-'));
  const path = join(dir, 'title-input.js');
  writeFileSync(path, mutated);
  assert.ok(
    path.startsWith(tmpdir()),
    `the mutant ${spec.id} must run from a scratch copy under os.tmpdir(); it is ${path}`,
  );
  // The copy is read back and the bytes that run are the bytes on disk, not a string in memory.
  const source = readFileSync(path, 'utf8');
  assert.equal(
    source,
    mutated,
    `the mutant ${spec.id} must be the bytes the scratch copy holds`,
  );
  return {
    id: spec.id,
    defect: spec.defect,
    dir: dir,
    path: path,
    source: source,
  };
}

/** How many mutants this suite runs, stated once so the summary cannot drift from the cases. */
const MUTANTS = 4;

// -------------------------------------------------------------------- tests ----

test('the module publishes one join, four states, four reasons and the two input lists', () => {
  assert.deepEqual(
    Object.keys(API).sort(),
    [
      'FACT_INPUTS',
      'FIELDS',
      'REASONS',
      'RECORD_INPUTS',
      'STATES',
      'titleInput',
    ],
    `the namespace must be one join and the closed sets it answers in, and it published ${JSON.stringify(Object.keys(API).sort())}`,
  );
  assert.equal(
    typeof API.titleInput,
    'function',
    'the namespace must publish the pure join',
  );
  assert.deepEqual(
    STATES,
    ['finding', 'agrees', 'cannot-tell', 'no-record'],
    'the four states are the ones the contract names, in M064’s vocabulary',
  );
  assert.deepEqual(
    REASONS,
    [
      'no-strategy',
      'route-binds-nothing',
      'no-implied-title',
      'observation-started-after-the-write',
    ],
    'the four absences are named tokens in one closed set, in the order they are decided',
  );
  assert.deepEqual(
    FIELDS,
    [
      'state',
      'strategy',
      'documentTitle',
      'impliedTitle',
      'observedWrites',
      'reason',
    ],
    'the answer states exactly the six fields the interface names',
  );

  // Two runs of the source in the same world republish in place rather than replacing the namespace.
  const context = createContext({});
  runInContext(MODULE_SOURCE, context, { filename: MODULE_REL });
  const before = context.angularAiTitleInput;
  runInContext(MODULE_SOURCE, context, { filename: MODULE_REL });
  assert.equal(
    context.angularAiTitleInput,
    before,
    'a second run in the same world must republish in place, so a caller’s reference stays valid',
  );
});

test('the module runs where no page, clock or console exists, and reads none of them', () => {
  // The bare world carries none of them, so the pin below is a fact about the world, not a promise.
  const bare = createContext({});
  for (const name of ['document', 'window', 'performance', 'console']) {
    assert.equal(
      typeof bare[name],
      'undefined',
      `the bare context this suite runs the module in must hold no ${name}`,
    );
  }
  assert.deepEqual(
    host(API.titleInput(FINDING_RECORD)),
    FINDING_ANSWER,
    'the module must answer in a world with no page, no clock and no console',
  );

  // The same answer in a world that has them all, with every read counted: the count must stay empty.
  const { api, calls } = loadWithProbes();
  const probed = host(api.titleInput(FINDING_RECORD));
  assert.deepEqual(
    probed,
    FINDING_ANSWER,
    'the module must answer in a probed world as it does in a bare one',
  );
  assert.deepEqual(
    calls,
    [],
    `the module must read neither a page nor a clock nor a console: it touched ${JSON.stringify(calls)}`,
  );

  // The source's own words, with its comments dropped: no page global, no clock and no console is
  // named in the code at all, so the probed world was not the only reason the taps stayed empty.
  const code = codeOf(MODULE_SOURCE);
  for (const token of [
    'document.',
    'window.',
    'performance.',
    'console.',
    'fetch(',
    'XMLHttpRequest',
    'chrome.',
    'process.',
    'require(',
    'import ',
    'import(',
  ]) {
    assert.ok(
      !code.includes(token),
      `${MODULE_REL} must not name ${JSON.stringify(token)} in its code: it is one pure join and it reads nothing`,
    );
  }
});

test('AC3 — the committed recording answers route-binds-nothing, and its bytes say why', () => {
  const bytes = read(RECORD_REL);
  assert.equal(
    REAL_RECORD.schema,
    'm065-title-record/v1',
    `${RECORD_REL} must be the recording T001 wrote, and its schema is ${JSON.stringify(REAL_RECORD.schema)}`,
  );

  // What the measured record states about itself: no route bound data, no route declared a title,
  // and the one write it knows of is one the observer never saw.
  assert.deepEqual(
    REAL_RECORD.titleInput.routesBindingData,
    [],
    'the recording must name no route that binds data',
  );
  assert.equal(
    REAL_RECORD.titleInput.boundRouteData,
    false,
    'the recording must state that no route bound data a title reads',
  );
  assert.equal(
    REAL_RECORD.titleInput.writesObserved,
    0,
    'the recording must state that no title write was observed',
  );
  assert.equal(
    REAL_RECORD.titleInput.writesUnobserved,
    1,
    'the recording must state the one title it carries as unobserved',
  );
  assert.ok(
    !bytes.includes('"state": "bound"'),
    'the committed bytes must carry no bound data snapshot: the portal bound nothing',
  );

  assert.equal(
    REAL_RECORD.navigations.length,
    3,
    'the recording must carry the three navigations T001 measured',
  );
  for (const navigation of REAL_RECORD.navigations) {
    const where = `navigations[${String(navigation.index)}]`;
    assert.equal(
      navigation.route.data.state,
      'absent',
      `${where}.route.data.state must be the absent token, and it is ${JSON.stringify(navigation.route.data.state)}`,
    );
    assert.deepEqual(
      navigation.route.data.keys,
      [],
      `${where}.route.data.keys must be empty, so the route binds nothing`,
    );
    assert.equal(
      navigation.route.titleDeclared,
      null,
      `${where}.route.titleDeclared must be null: no route declared a title`,
    );
    assert.equal(
      navigation.strategy.resolved,
      true,
      `${where}.strategy.resolved must be true, so the absence is the route's and not the strategy's`,
    );
  }

  assert.equal(
    REAL_RECORD.writes.length,
    1,
    'the recording must carry the one title write it knows of',
  );
  assert.equal(
    REAL_RECORD.writes[0].observed,
    false,
    'the one write must be one the observer never saw',
  );
  assert.equal(
    REAL_RECORD.writes[0].author,
    null,
    'the recording must name no author for it',
  );

  // The whole recording, and each of its navigations alone: every one of them binds nothing.
  assertAnswer(
    host(API.titleInput(REAL_RECORD)),
    { state: 'cannot-tell', reason: 'route-binds-nothing' },
    'the answer for the committed recording',
  );
  for (const navigation of REAL_RECORD.navigations) {
    const single = Object.assign({}, REAL_RECORD, {
      navigations: [navigation],
    });
    assert.deepEqual(
      host(API.titleInput(single)),
      { state: 'cannot-tell', reason: 'route-binds-nothing' },
      `navigations[${String(navigation.index)}] alone must answer route-binds-nothing rather than an empty object`,
    );
  }
});

test('AC3 MUTANT: an empty object where the route binds nothing reddens the pin, naming state', () => {
  const copy = scratchCopy({
    id: 'ac3-empty-object',
    defect: 'answered an empty object where the route binds nothing',
    find: '      return absence(ROUTE_BINDS_NOTHING);',
    replace: '      return {};',
  });
  try {
    const mutant = loadBare(copy.source, copy.path);
    const written = host(mutant.titleInput(REAL_RECORD));
    assert.deepEqual(
      written,
      {},
      'defect: the mutant did not answer an empty object, so the pin would pass on nothing',
    );

    // The pin is green on the module as it sits on disk first, so the red below is the mutation's.
    assertAnswer(
      host(API.titleInput(REAL_RECORD)),
      { state: 'cannot-tell', reason: 'route-binds-nothing' },
      'the shipped module’s answer (ac3-empty-object premise)',
    );

    const failure = failureOf(() =>
      assertAnswer(
        written,
        { state: 'cannot-tell', reason: 'route-binds-nothing' },
        `the mutant’s answer (defect: ${copy.defect})`,
      ),
    );
    assert.ok(
      failure instanceof Error,
      `defect: ${copy.defect} must redden the pin, and it passed`,
    );
    assert.ok(
      failure.message.includes(copy.defect),
      `the failure must name the defect ${JSON.stringify(copy.defect)}, and it said: ${failure.message.split('\n')[0]}`,
    );
    assert.ok(
      failure.message.includes('`state`'),
      `the failure must name the field that moved, and it said: ${failure.message.split('\n')[0]}`,
    );
    console.log(`AC3 mutant: ${failure.message.split('\n')[0]}`);
  } finally {
    rmSync(copy.dir, { recursive: true, force: true });
  }
});

test('AC1 — a document title that differs from the route’s implied title is a finding naming both', () => {
  const written = answerOf({ record: FINDING_RECORD, facts: undefined });
  assertAnswer(written, FINDING_ANSWER, 'the finding answer');
  assert.equal(
    written.documentTitle,
    FINDING_DOCUMENT_TITLE,
    'the finding must carry the title the document carried, not the title the route implies',
  );
  assert.equal(
    written.impliedTitle,
    ROUTE_TITLE,
    'the finding must carry the title the route implies, not the title the document carried',
  );
  assert.notEqual(
    written.documentTitle,
    written.impliedTitle,
    'a finding is a difference: the two titles must not be one value written twice',
  );
  assert.equal(
    written.strategy,
    'DefaultTitleStrategy',
    'the finding must name the strategy class the injector resolved',
  );

  // The writes the observation saw are the ones attributed to the navigation that answered: the
  // second write belongs to another navigation and is not lent to this answer.
  assert.equal(
    written.observedWrites,
    1,
    'the finding must count the one observed write attributed to the navigation that answered',
  );
  assert.ok(
    !('reason' in written),
    'a finding states a difference and names no reason: the two are different answers',
  );
});

test('AC1 MUTANT: the route’s title copied over the document’s reddens the pin, naming documentTitle', () => {
  const copy = scratchCopy({
    id: 'ac1-title-copied',
    defect: 'copied the route’s title over the document’s',
    find:
      '      state: FINDING,\n' +
      '      strategy: strategy,\n' +
      '      documentTitle: documentTitle,\n',
    replace:
      '      state: FINDING,\n' +
      '      strategy: strategy,\n' +
      '      documentTitle: impliedTitle,\n',
  });
  try {
    const mutant = loadBare(copy.source, copy.path);
    const written = host(mutant.titleInput(FINDING_RECORD));
    assert.equal(
      written.state,
      'finding',
      `defect: ${copy.defect} must still answer a finding, so the pin fails on the title it carries rather than on the state; it answered ${JSON.stringify(written.state)}`,
    );
    assert.equal(
      written.documentTitle,
      ROUTE_TITLE,
      'defect: the mutant did not copy the route’s title over the document’s, so the pin would pass on nothing',
    );

    const failure = failureOf(() =>
      assertAnswer(
        written,
        FINDING_ANSWER,
        `the mutant’s answer (defect: ${copy.defect})`,
      ),
    );
    assert.ok(
      failure instanceof Error,
      `defect: ${copy.defect} must redden the pin, and it passed`,
    );
    assert.ok(
      failure.message.includes(copy.defect),
      `the failure must name the defect ${JSON.stringify(copy.defect)}, and it said: ${failure.message.split('\n')[0]}`,
    );
    assert.ok(
      failure.message.includes('`documentTitle`'),
      `the failure must name \`documentTitle\`, the field that moved, and it said: ${failure.message.split('\n')[0]}`,
    );
    console.log(`AC1 mutant: ${failure.message.split('\n')[0]}`);
  } finally {
    rmSync(copy.dir, { recursive: true, force: true });
  }
});

test('AC2 — an observation that began after the write answers cannot-tell and counts no observed write', () => {
  const written = answerOf({
    record: OBSERVATION_STARTED_RECORD,
    facts: undefined,
  });
  assertAnswer(
    written,
    { state: 'cannot-tell', reason: 'observation-started-after-the-write' },
    'the observation-started-after-the-write answer',
  );
  assert.ok(
    !('observedWrites' in written),
    'the absence must not count observed writes: there are none to count, and a zero would read as one',
  );
  assert.ok(
    !('documentTitle' in written),
    'the absence must not hand back the title the document carries: nothing observed attributes it',
  );

  // The real record's write is the same shape, and the real record's route binds nothing — which is
  // the absence that outranks this one. Both facts are asserted, so neither hides the other.
  assert.equal(
    REAL_RECORD.writes[0].observed,
    false,
    'the committed recording’s one write must be one the observer never saw',
  );

  // Where the two titles agree there is no difference to attribute, so the observation settles
  // nothing and the answer is the agreement the record measured.
  assert.deepEqual(
    host(API.titleInput(AGREES_WITH_UNOBSERVED_RECORD)),
    AGREES_ANSWER,
    'a matching pair with a write the observer did not see still agrees: agreement needs no attribution',
  );
});

test('AC2 MUTANT: the pre-observation title taken as observed reddens the pin, naming the reason', () => {
  const copy = scratchCopy({
    id: 'ac2-unobserved-promoted',
    defect: 'promoted the current title to an observed write',
    find: '      if (entry.observed !== false) continue;',
    replace: '      if (entry.observed !== true) continue;',
  });
  try {
    const mutant = loadBare(copy.source, copy.path);
    const written = host(mutant.titleInput(OBSERVATION_STARTED_RECORD));
    assert.equal(
      written.state,
      'finding',
      `defect: ${copy.defect} must turn the pre-observation title into a difference the join reports, so the pin fails on the state; it answered ${JSON.stringify(written)}`,
    );

    // The pin is green on the shipped module first, so the red below is the mutation's.
    assertAnswer(
      host(API.titleInput(OBSERVATION_STARTED_RECORD)),
      {
        state: 'cannot-tell',
        reason: 'observation-started-after-the-write',
      },
      'the shipped module’s answer (ac2-unobserved-promoted premise)',
    );

    const failure = failureOf(() =>
      assertAnswer(
        written,
        {
          state: 'cannot-tell',
          reason: 'observation-started-after-the-write',
        },
        `the mutant’s answer (defect: ${copy.defect})`,
      ),
    );
    assert.ok(
      failure instanceof Error,
      `defect: ${copy.defect} must redden the pin, and it passed`,
    );
    assert.ok(
      failure.message.includes(copy.defect),
      `the failure must name the defect ${JSON.stringify(copy.defect)}, and it said: ${failure.message.split('\n')[0]}`,
    );
    assert.ok(
      failure.message.includes('observation-started-after-the-write'),
      `the failure must name the reason that moved, and it said: ${failure.message.split('\n')[0]}`,
    );
    console.log(`AC2 mutant: ${failure.message.split('\n')[0]}`);
  } finally {
    rmSync(copy.dir, { recursive: true, force: true });
  }
});

test('every fixture answers the one state and the fields its own record warrants', () => {
  const reached = new Set();
  const reasons = new Set();
  for (const item of CASES) {
    const written = answerOf(item);
    assertAnswer(written, item.answer, `the answer for ${item.name}`);
    reached.add(written.state);
    if (written.reason !== undefined) reasons.add(written.reason);
  }
  assert.deepEqual(
    [...reached].sort(),
    [...STATES].sort(),
    `the fixtures must reach all four states, and they reached ${JSON.stringify([...reached].sort())}`,
  );
  assert.deepEqual(
    [...reasons].sort(),
    [...REASONS].sort(),
    `the fixtures must reach all four absences, and they reached ${JSON.stringify([...reasons].sort())}`,
  );

  // Every field an answer states is one the interface names, and every field of the interface is
  // stated by at least one fixture: an answer field no fixture reaches would be decoration.
  const stated = new Set();
  for (const item of CASES) {
    for (const key of Object.keys(answerOf(item))) stated.add(key);
  }
  assert.deepEqual(
    [...stated].sort(),
    [...FIELDS].sort(),
    `the fixtures must reach every field of the interface, and they reached ${JSON.stringify([...stated].sort())}`,
  );
});

test('the absences are decided in one order, and the more specific fact answers', () => {
  // No strategy outranks a route that would otherwise agree: nothing reads a title from a route
  // without the strategy the router answers with.
  assert.deepEqual(
    host(API.titleInput(NO_STRATEGY_RECORD)),
    { state: 'cannot-tell', reason: 'no-strategy' },
    'an unresolved strategy must answer no-strategy even where the two titles match',
  );

  // A route that binds nothing outranks a title the caller resolved: the title has nothing to be
  // read from.
  assert.deepEqual(
    host(API.titleInput(BINDS_NOTHING_RECORD, { impliedTitle: ROUTE_TITLE })),
    { state: 'cannot-tell', reason: 'route-binds-nothing' },
    'a route that binds nothing must answer route-binds-nothing even where a title was resolved',
  );

  // A bound route with no implied title and no resolved one names that absence.
  assert.deepEqual(
    host(API.titleInput(NO_IMPLIED_RECORD, {})),
    { state: 'cannot-tell', reason: 'no-implied-title' },
    'a route that binds data and implies no title must answer no-implied-title',
  );

  // A title the caller resolved stands in for one a function declared: the record carries null and
  // the join does not invent one.
  assert.deepEqual(
    host(
      API.titleInput(RESOLVED_BY_FACTS_RECORD, { impliedTitle: ROUTE_TITLE }),
    ),
    AGREES_ANSWER,
    'a title resolved from a route function must be the implied title the join compares with',
  );
  assert.deepEqual(
    host(API.titleInput(RESOLVED_BY_FACTS_RECORD)),
    { state: 'cannot-tell', reason: 'no-implied-title' },
    'the same record without the resolved title must answer no-implied-title rather than infer one',
  );
});

test('the last navigation answers, and no navigation is folded into another', () => {
  const written = host(API.titleInput(TWO_NAVIGATIONS_RECORD));
  assertAnswer(written, FINDING_ANSWER, 'the two-navigation record’s answer');
  assert.equal(
    written.documentTitle,
    FINDING_DOCUMENT_TITLE,
    'the last navigation’s title must answer: the record holds navigations in the order they happened',
  );
  assert.notEqual(
    written.state,
    'agrees',
    'the first navigation agreed and the last differed, so an answer taken from the first would be the wrong record',
  );
});

test('nothing captured answers no-record, and never an empty object', () => {
  for (const item of CASES) {
    if (item.answer.state !== 'no-record') continue;
    assert.deepEqual(
      answerOf(item),
      { state: 'no-record' },
      `${item.name} must answer no-record rather than an empty object or a guessed state`,
    );
  }
  assert.ok(
    NO_RECORD_CASES.length >= 8,
    'the no-record cases must cover a value that is not a record, a record with no navigation and a navigation with no title',
  );
});

test('SC3 — the record’s fields and the join’s inputs are one list, asserted in one place', () => {
  pinInputs(API, 'the join');
});

test('SC3 MUTANT: a field the join reads and does not publish reddens the pin, naming the field', () => {
  const copy = scratchCopy({
    id: 'sc3-unpublished-read',
    defect: 'read a field the join does not publish as an input',
    find: '    const writes = readWrites(record.writes);',
    replace:
      '    const writes = readWrites(record.writes);\n' +
      '    void record.titleInput;',
  });
  try {
    const mutant = loadBare(copy.source, copy.path);

    // The pin is green on the module as it sits on disk first, so the red below is the read's.
    pinInputs(API, 'the shipped join (sc3-unpublished-read premise)');

    const failure = failureOf(() =>
      pinInputs(mutant, `the mutant’s inputs (defect: ${copy.defect})`),
    );
    assert.ok(
      failure instanceof Error,
      `defect: ${copy.defect} must redden the pin, and it passed`,
    );
    assert.ok(
      failure.message.includes(copy.defect),
      `the failure must name the defect ${JSON.stringify(copy.defect)}, and it said: ${failure.message.split('\n')[0]}`,
    );
    assert.ok(
      failure.message.includes('`titleInput`'),
      `the failure must name \`titleInput\`, the field that was read and not published, and it said: ${failure.message.split('\n')[0]}`,
    );
    console.log(`SC3 mutant: ${failure.message.split('\n')[0]}`);
  } finally {
    rmSync(copy.dir, { recursive: true, force: true });
  }
});

test('the join is pure: it holds no state and writes nothing into the records it is handed', () => {
  const frozen = JSON.stringify(FINDING_RECORD);
  const first = host(API.titleInput(FINDING_RECORD));
  const second = host(API.titleInput(FINDING_RECORD));
  assert.deepEqual(
    first,
    second,
    'the writer holds no state between calls: the same record must answer the same bytes twice',
  );
  assert.equal(
    JSON.stringify(FINDING_RECORD),
    frozen,
    'the join must not write into the record it was handed',
  );

  // The same record read through the refusing proxy above is the same answer, so the recorder did
  // not change what the join sees.
  assert.deepEqual(
    first,
    answerOf({ record: FINDING_RECORD, facts: undefined }),
    'a recorded read and a plain read of one record must answer the same answer',
  );
});

test('the mutants ran from scratch copies, and the committed module is the one this suite read', () => {
  assert.equal(
    MUTANTS,
    4,
    'AC1, AC2 and AC3 each name one mutant, SC3 names the fourth, and this suite runs four',
  );
  assert.equal(
    read(MODULE_REL),
    MODULE_SOURCE,
    `${MODULE_REL} must be byte-identical to the source this suite loaded: every mutant ran from a scratch copy under os.tmpdir()`,
  );

  const table = CASES.map((item) => {
    const written = answerOf(item);
    const label = written.reason
      ? `${written.state}/${written.reason}`
      : written.state;
    return `${item.name}: ${label}`;
  });
  console.log(`T002 fixture states: ${table.join(' || ')}`);
  console.log(
    `${String(CASES.length)} fixtures, ${String(MUTANTS)} mutants, ` +
      `${String(STATES.length)} states, ${String(REASONS.length)} reasons, ` +
      `${String(RECORD_INPUTS.length)} record inputs`,
  );
});
