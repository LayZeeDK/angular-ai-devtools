// @ts-check
// Run: node --test scripts/webmcp-audit.test.mjs
//
// M052 T002 pins `extension/webmcp-audit.js`: a reader that reports which tools a page declares, or
// refuses to describe one. The milestone's measurement — `research/raw/m052-webmcp-api.json` — fixes
// the frame, and it fixes it as an absence: `getTools` is on `document.modelContext`'s prototype
// (research/00-browser-probe.md:121), the return shape `{ name, description, inputSchema, origin,
// window }` is documented (research/01-built-in-ai-apis.md:188), and no code in this tree has ever
// called it. The recording says so twice: `exposure.toolList.observedHere` is false and
// `emptyStateObserved` is false. So, here:
//
//   - `cannot-tell` is the default, not the exception. Every way the list can fail to be readable is
//     pinned with the absence it names, and none of them may render as an empty list.
//   - `empty` means the getter answered an array, and the array was empty. That is the only evidence
//     that earns it; a source the reader was not answered for is `cannot-tell`.
//   - `tools` carries the name and the description the API reported, and no third field: no
//     `inputSchema`, no `origin`, no `window`, no inferred signature, no DOM label, no defaulted
//     description.
//
// What the fixtures are, stated exactly: the descriptor built by `descriptor()` is the *documented*
// shape, field for field from research/01-built-in-ai-apis.md:188. It is not a list the API was
// observed to return — T001 records that nothing in this tree has ever called the getter — so every
// list below is an input this suite hands the reader, never a claim about what a browser answers.
// The three fields beside `name` and `description` are populated for one reason: a reader that passes
// them through has to be caught. No assertion here reads their values.
//
// The module is evaluated in a bare `node:vm` context and publishes its namespace on that context's
// global. That is what lets a mutated copy of its source stand in for the real one, and what makes
// the purity pin a pin rather than a promise: `document`, `fetch`, `Date` and seven more host globals
// are armed as traps inside the context, so a reader that reached for one throws there instead of
// rendering a tool out of a page it never read.
//
// Each mutant is applied to a copy of the module source, after the unmutated module has been pinned
// with the same function, so the mutation is the only cause of the red. A mutant that survived its
// pin would prove the pin vacuous, so every one must redden it by name and prints what it printed.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const SRC = readFileSync(
  new URL('../extension/webmcp-audit.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m052-webmcp-api.json', import.meta.url),
    'utf8',
  ),
);

/** T001's answer about the tool list: readable per the recorded prototype, never read here. */
const TOOL_LIST = RECORDING.exposure.toolList;

/** The three states the module may answer, exactly. */
const STATES = ['cannot-tell', 'empty', 'tools'];

/** The five absences a `cannot-tell` may name, exactly, one per way the list fails to be readable. */
const ABSENCES = [
  'get-tools-threw',
  'no-list-getter',
  'no-model-context',
  'unreadable-list',
  'unreadable-tool',
];

// ---------------------------------------------------------------------------------- loading ----

/** The module with its comments removed, so a token scan reads code and not prose. */
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/**
 * The module, evaluated in a bare context holding the source and whatever the caller puts in it. No
 * DOM and no network are installed by `node:vm` at all; `Date` and `console` are in every context
 * there is, which is why the purity pins arm them as traps rather than assert their absence.
 * @param {string} source
 * @param {Record<string, unknown>} sandbox
 */
function standalone(source = SRC, sandbox = {}) {
  const context = createContext(sandbox);
  runInContext(source, context);
  const audit = context.angularAiWebmcpAudit;
  assert.ok(
    audit,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  assert.equal(typeof audit.readTools, 'function');
  return { audit, context };
}

/** A value from the vm context carries that context's own prototypes, so it is copied first. */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * One reading of one source, copied into this realm.
 * @param {any} audit
 * @param {any} source
 */
function read(audit, source) {
  return plain(audit.readTools(source));
}

// -------------------------------------------------------------------------------- the frames ----

/**
 * One descriptor in the shape the tree documents for the getter: an array of
 * `{ name, description, inputSchema, origin, window }` (research/01-built-in-ai-apis.md:188). The
 * shape is documented, never observed, and the three fields the reader must drop carry placeholders
 * for that reason alone.
 * @param {string} name
 * @param {string} [description]
 */
function descriptor(name, description) {
  return {
    name,
    description,
    inputSchema: { type: 'object', properties: {} },
    origin: 'https://app.example',
    window: 'self',
  };
}

/**
 * A source carrying the page's model context: what `readTools` is handed. The getter answers the list
 * a test supplies and counts its calls; the registration function records what it was handed, so a
 * reader that registers to observe is caught rather than trusted.
 * @param {any[]} list
 * @param {{ throws?: unknown, answers?: unknown }} [options]
 */
function pageContext(list, options = {}) {
  const calls = { getTools: 0 };
  const registered = [];
  const context = {
    registerTool(tool) {
      registered.push(tool);
      list.push(tool);
    },
    getTools() {
      calls.getTools += 1;
      if ('throws' in options) throw options.throws;
      if ('answers' in options) return options.answers;
      return list.slice();
    },
  };
  return {
    source: { modelContext: context },
    context,
    list,
    calls,
    registered,
  };
}

/** The shape the recording says is real: a registration surface with no list getter. */
function registrationOnly() {
  const registered = [];
  const context = {
    registerTool(tool) {
      registered.push(tool);
    },
  };
  return { source: { modelContext: context }, context, registered };
}

/** Every way the list is not readable, one case per absence, built fresh on each call. */
function absenceCases() {
  return [
    {
      what: 'no source at all',
      source: undefined,
      code: 'no-model-context',
    },
    {
      what: 'a source with no model context',
      source: {},
      code: 'no-model-context',
    },
    {
      what: 'a model context that is not an object',
      source: { modelContext: 'object' },
      code: 'no-model-context',
    },
    {
      what: 'a registration surface with no list getter',
      source: registrationOnly().source,
      code: 'no-list-getter',
    },
    {
      what: 'a getter that is not a function',
      source: { modelContext: { getTools: [] } },
      code: 'no-list-getter',
    },
    {
      what: 'a getter that throws',
      source: pageContext([], {
        throws: new Error('the tools policy is disabled'),
      }).source,
      code: 'get-tools-threw',
    },
    {
      what: 'a getter that answers an object',
      source: pageContext([], { answers: {} }).source,
      code: 'unreadable-list',
    },
    {
      what: 'a getter that answers a string',
      source: pageContext([], { answers: 'search-products' }).source,
      code: 'unreadable-list',
    },
    {
      what: 'a list entry that is not an object',
      source: pageContext(['search-products']).source,
      code: 'unreadable-tool',
    },
    {
      what: 'a list entry with no name',
      source: pageContext([{ description: 'Search.' }]).source,
      code: 'unreadable-tool',
    },
    {
      what: 'a list entry with an empty name',
      source: pageContext([descriptor('')]).source,
      code: 'unreadable-tool',
    },
  ];
}

// ----------------------------------------------------------------------------------- the pins ----

/**
 * SC1's pin: every tool is named with the API's own string and described with the API's own
 * description, in the order the API answered, with no third field and no field it did not report.
 * @param {any} audit
 */
function pinToolsAreTheAPIs(audit) {
  const page = pageContext([
    descriptor('search-products', 'Search the catalogue.'),
    descriptor('read-cart', 'Read the current cart.'),
  ]);
  const answer = read(audit, page.source);
  assert.equal(
    answer.state,
    'tools',
    'SC1 state-tools: a list of readable descriptors is the tools state',
  );
  assert.deepEqual(
    answer.tools,
    [
      { name: 'search-products', description: 'Search the catalogue.' },
      { name: 'read-cart', description: 'Read the current cart.' },
    ],
    'SC1 name-is-the-APIs-string: each tool carries the name and the description the API reported, in the order it reported them',
  );
  assert.equal(answer.reason, null, 'SC1 tools-names-no-absence');
  for (const [index, tool] of answer.tools.entries()) {
    assert.deepEqual(
      Object.keys(tool).sort(),
      ['description', 'name'],
      `SC1 nothing-the-API-did-not-report: tool ${index} carries the two reported fields and no third`,
    );
  }
  const text = JSON.stringify(answer);
  for (const field of ['inputSchema', 'origin', 'window', 'app.example']) {
    assert.equal(
      text.includes(field),
      false,
      `SC1 no-inferred-field: the answer carries nothing of the descriptor's ${field}`,
    );
  }
  // The answer's tools are new entries, not the descriptors themselves: a reader that handed the
  // descriptor on would carry every field the API reported beside the two it may report.
  const raw = audit.readTools(page.source);
  assert.equal(
    'inputSchema' in raw.tools[0],
    false,
    'SC1 no-descriptor-passthrough: the reported tool is not the descriptor object',
  );
}

/**
 * SC2's pin: a list the getter answered empty is `empty` — a state earned by a read, and not the
 * words "no tools declared" a surface would draw for an unreadable list.
 * @param {any} audit
 */
function pinNoToolsDeclared(audit) {
  const page = pageContext([]);
  const answer = read(audit, page.source);
  assert.equal(
    answer.state,
    'empty',
    'SC2 empty-is-a-list-the-API-answered-empty: an empty array from the getter is the empty state',
  );
  assert.deepEqual(answer.tools, [], 'SC2 empty-reports-no-tool');
  assert.equal(
    answer.reason,
    null,
    'SC2 empty-names-no-absence: the list was read, so nothing is absent to name',
  );
  assert.equal(
    page.calls.getTools,
    1,
    'SC2 empty-comes-from-a-read: the empty answer is a list the getter answered, not a default',
  );
}

/**
 * SC2's pin: every way the list is not readable answers `cannot-tell`, names which absence it was,
 * reports no tool, and never reads as a count of zero tools.
 * @param {any} audit
 */
function pinCannotTellNamesTheAbsence(audit) {
  for (const { what, source, code: expected } of absenceCases()) {
    const answer = read(audit, source);
    assert.equal(
      answer.state,
      'cannot-tell',
      `SC2 cannot-tell-is-not-an-empty-list: ${what} cannot tell, and its answer is not an empty list`,
    );
    assert.notEqual(
      answer.state,
      'empty',
      `SC2 empty-is-not-a-refusal: ${what} was not read, so it is not a page that declared nothing`,
    );
    assert.deepEqual(
      answer.tools,
      [],
      `SC2 cannot-tell-reports-no-tool: ${what} names no tool`,
    );
    assert.equal(
      answer.reason.code,
      expected,
      `SC2 the-absence-is-named: ${what} names ${expected}`,
    );
    assert.ok(
      typeof answer.reason.detail === 'string' &&
        answer.reason.detail.length > 0,
      `SC2 the-absence-is-stated: ${what} states the absence in words`,
    );
    assert.equal(
      /no tools|none|zero|0 tools/i.test(answer.reason.detail),
      false,
      `SC2 the-refusal-is-not-a-count: ${what} must not read as a count of tools: ${answer.reason.detail}`,
    );
  }
}

/**
 * SC3's pin: reading changes nothing about the page. No registration is made to produce a tool, no
 * tool is invoked, and the list is read once — so there is no second path that could observe one.
 * @param {any} audit
 */
function pinNoRegistration(audit) {
  const page = pageContext([]);
  const answer = read(audit, page.source);
  assert.deepEqual(
    page.registered,
    [],
    'SC3 no-registration-to-observe: reading a tool list never registers a tool to make one observable',
  );
  assert.equal(
    answer.state,
    'empty',
    'SC3 a-page-declaring-nothing-is-empty: and the page still answered a list, empty',
  );

  const declared = pageContext([descriptor('search-products', 'Search.')]);
  read(audit, declared.source);
  assert.deepEqual(
    declared.registered,
    [],
    'SC3 no-registration-beside-a-read: a page that declares a tool is not registered with either',
  );
  assert.equal(
    'executeTool' in declared.context,
    false,
    'SC3 the-reader-invokes-no-tool: the read reaches for the list and nothing else',
  );

  // The absence the milestone is about: a registration surface with no list getter. The refusal must
  // not reach for the registration half to manufacture a list either.
  const only = registrationOnly();
  const refused = read(audit, only.source);
  assert.equal(refused.state, 'cannot-tell', 'SC3 no-getter-is-cannot-tell');
  assert.equal(
    only.registered.length,
    0,
    'SC3 the-refusal-does-not-register: a refusal is a refusal, not a registration in disguise',
  );
}

/**
 * E4's pin: the name is reported, and no description is invented where the API reported none. A
 * description the API reported as the empty string is that string, neither replaced nor dropped.
 * @param {any} audit
 */
function pinDescriptionOnlyWhenReported(audit) {
  const page = pageContext([
    { name: 'search-products' },
    descriptor('read-cart', 'Read the current cart.'),
    descriptor('clear-cart', ''),
  ]);
  const answer = read(audit, page.source);
  assert.equal(
    answer.state,
    'tools',
    'E4 a-descriptor-without-a-description-is-still-a-tool',
  );
  const [undescribed, described, emptyText] = answer.tools;
  assert.deepEqual(
    undescribed,
    { name: 'search-products' },
    'E4 no-invented-description: a descriptor the API reported no description for carries its name and nothing else',
  );
  assert.equal(
    'description' in undescribed,
    false,
    'E4 no-defaulted-description: the absent field is absent, not defaulted to boilerplate',
  );
  assert.deepEqual(
    described,
    { name: 'read-cart', description: 'Read the current cart.' },
    'E4 description-exactly-as-reported',
  );
  assert.deepEqual(
    emptyText,
    { name: 'clear-cart', description: '' },
    'E4 an-empty-description-is-still-reported: the API reported the empty string, and the reader neither invents wording nor drops what it was given',
  );
  assert.equal(
    /no description|not described/i.test(JSON.stringify(answer)),
    false,
    'E4 no-boilerplate-description: no boilerplate wording appears anywhere in the answer',
  );
}

/**
 * SC3's pin: the same source answers the same thing twice, the source is not written to, and each
 * reading reads the getter once — no retry, no second path.
 * @param {any} audit
 */
function pinSameSourceSameAnswer(audit) {
  const page = pageContext([
    descriptor('search-products', 'Search the catalogue.'),
    { name: 'read-cart' },
  ]);
  const frozen = deepFreeze(page.source);
  const first = read(audit, frozen);
  const second = read(audit, frozen);
  assert.deepEqual(
    second,
    first,
    'SC3 same-source-same-answer: two readings of one source answer identically',
  );
  assert.equal(
    page.calls.getTools,
    2,
    'SC3 one-read-per-reading: each reading reads the list once, with no retry a registration could slip between',
  );
  assert.deepEqual(
    Object.keys(frozen),
    ['modelContext'],
    'SC3 no-input-mutation: the reading adds no field to the source it was handed',
  );
  assert.deepEqual(
    Object.keys(frozen.modelContext).sort(),
    ['getTools', 'registerTool'],
    'SC3 no-field-added: the model context it was handed still has the members it had',
  );
}

/**
 * A frozen object graph: a write to it throws in the module's strict mode, so a reader that mutates
 * its input fails here rather than silently changing the page it was asked about.
 * @param {any} value
 */
function deepFreeze(value) {
  if (value === null || typeof value !== 'object') return value;
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
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
  return /** @type {Error} */ (failure);
}

// ------------------------------------------------------------------- the recording, read as a ----
// ------------------------------------------------------------------- contract and not as data ----

describe('the recording the reader answers to', () => {
  it('answers the list readable, and was never read: no fixture here is an observed list', () => {
    assert.equal(RECORDING.task, 'T001', 'the recording is T001\u2019s');
    assert.equal(TOOL_LIST.state, 'readable', 'T001 records a readable list');
    assert.equal(TOOL_LIST.getter, 'getTools', 'the getter is named');
    assert.equal(
      TOOL_LIST.observedHere,
      false,
      'observedHere is false: nothing in the tree has read a list, so no fixture below is a list the API was seen to return',
    );
    assert.equal(
      TOOL_LIST.needsBrowserToConfirm,
      true,
      'the answer stays open for a browser, which is why cannot-tell is this reader\u2019s default',
    );
    assert.equal(
      TOOL_LIST.emptyStateObserved,
      false,
      'no empty list was ever observed, so `empty` is a state the reader must earn from a read',
    );
    assert.equal(
      RECORDING.exposure.registration.exposes,
      true,
      'the API exposes a registration function, which is why a registration surface with no readable list is a real case and not a hypothetical',
    );
    assert.equal(
      RECORDING.answer.confirmedByInstrument,
      false,
      'no instrument confirms the list',
    );
  });

  it('names the getter and the two descriptor fields the module reads', () => {
    const body = code(SRC);
    assert.equal(
      body.includes(`'${TOOL_LIST.getter}'`),
      true,
      `the module reads the getter the recording names (${TOOL_LIST.getter})`,
    );
    for (const field of [TOOL_LIST.nameField, TOOL_LIST.descriptionField]) {
      assert.equal(
        body.includes(`'${field}'`),
        true,
        `the module reads the descriptor field the recording names (${field})`,
      );
    }
    assert.deepEqual(
      [...TOOL_LIST.fields].sort(),
      ['description', 'inputSchema', 'name', 'origin', 'window'],
      'the documented descriptor shape is the five fields research/01 records',
    );
  });

  it('refuses a source the recording says nothing was read from', () => {
    const { audit } = standalone();
    const answer = read(audit, {});
    assert.equal(
      answer.state,
      'cannot-tell',
      'the recording observed no list, so an unread source is cannot-tell and never empty',
    );
    assert.equal(answer.reason.code, 'no-model-context');
  });
});

// ---------------------------------------------------------------------------- the reader, pure ----

describe('webmcp-audit.js is pure over what it is handed', () => {
  it('publishes one function and nothing else, and is safe to run twice', () => {
    const { audit, context } = standalone();
    assert.deepEqual(
      Object.keys(audit),
      ['readTools'],
      'the module publishes one function',
    );
    assert.doesNotThrow(
      () => runInContext(SRC, context),
      'a second evaluation in the same world must not throw',
    );
    assert.equal(
      context.angularAiWebmcpAudit,
      audit,
      'a second run republishes in place, keeping the identity a caller may hold',
    );
  });

  it('holds no DOM read, no clock, no console and no network call in its code', () => {
    const body = code(SRC);
    for (const [what, pattern] of [
      ['a document read', /\bdocument\b/],
      ['a window read', /\bwindow\b/],
      ['a DOM query', /\b(querySelector|getElementById|createElement)\b/],
      ['a network call', /\b(fetch|XMLHttpRequest)\b/],
      ['a clock read', /\b(Date|performance|setTimeout|setInterval)\b/],
      ['a console call', /\bconsole\b/],
      ['a registration call', /\b(registerTool|provideTool)\b/],
      ['a tool invocation', /\bexecuteTool\b/],
      ['a change listener', /\b(ontoolchange|addEventListener)\b/],
      ['a storage read', /\blocalStorage\b/],
      ['a descriptor field it may not report', /\b(inputSchema|origin)\b/],
    ]) {
      assert.equal(
        pattern.test(body),
        false,
        `extension/webmcp-audit.js must contain no ${what}: ${pattern}`,
      );
    }
  });

  it('evaluates where no DOM and no network exist at all, and says so from inside', () => {
    const { context } = standalone();
    for (const name of [
      'document',
      'window',
      'fetch',
      'XMLHttpRequest',
      'performance',
      'setTimeout',
      'localStorage',
    ]) {
      assert.equal(
        runInContext(`typeof ${name}`, context),
        'undefined',
        `the module must not run with a ${name} in scope`,
      );
    }
    // Two names no context withholds: V8 installs `Date` in every realm and Node installs `console`
    // in every context it creates. The next test pins that the module reaches for neither.
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
  });

  it('reaches for no host global when it reads: document, fetch and Date are traps inside the context', () => {
    // The traps are proven armed before anything is asserted through them: a guard that did not throw
    // would make every pin below pass on any module, including one that painted the page.
    const armed = createContext(traps());
    assert.throws(
      () => runInContext('document.createElement("div")', armed),
      /the module reached for document/,
      'the document trap must bite, or the guard is decoration',
    );
    assert.throws(
      () => runInContext('fetch("https://example.test")', armed),
      /the module reached for fetch/,
      'the fetch trap must bite, or the guard is decoration',
    );
    assert.throws(
      () => runInContext('Date.now()', armed),
      /the module reached for Date/,
      'the Date trap must bite, or the guard is decoration',
    );

    // The pin, on the unmutated module, wholly inside a context where each of those is a trap.
    const sources = [
      {
        what: 'tools with descriptions',
        source: pageContext([descriptor('a', 'A.')]).source,
      },
      {
        what: 'a tool with no description',
        source: pageContext([{ name: 'a' }]).source,
      },
      { what: 'an empty list', source: pageContext([]).source },
      { what: 'no list getter', source: registrationOnly().source },
      {
        what: 'a throwing getter',
        source: pageContext([], { throws: new Error('refused') }).source,
      },
      { what: 'no API at all', source: {} },
    ];
    for (const { what, source } of sources) {
      assert.deepEqual(
        guarded(SRC, source),
        read(standalone().audit, source),
        `the-poisoned-globals-change-nothing: ${what} answers the same value with document, fetch and Date armed as traps`,
      );
    }
    console.log(
      'webmcp-audit purity: 6 sources answer identically with document, fetch and Date armed as traps',
    );
  });
});

/** The globals the module must never reach for. */
const HOST_GLOBALS = [
  'document',
  'window',
  'fetch',
  'XMLHttpRequest',
  'Date',
  'performance',
  'setTimeout',
  'setInterval',
  'console',
  'localStorage',
];

/**
 * A global that throws when it is read, called or constructed, naming itself in the error. A module
 * that reached for the clock, the DOM or the network inside the context hits this on the first touch,
 * which is what makes the guard a guard rather than a decoration.
 * @param {string} name
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

/** One trap per host global. */
function traps() {
  /** @type {Record<string, unknown>} */
  const sandbox = {};
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  return sandbox;
}

/**
 * Runs the reader inside a context where every host global is a trap, and returns what it answered.
 * The source is handed in through the sandbox, so nothing about the call crosses realms but the data.
 * @param {string} source
 * @param {unknown} input
 */
function guarded(source, input) {
  const sandbox = { ...traps(), __input: input };
  const { context } = standalone(source, sandbox);
  return plain(
    runInContext('angularAiWebmcpAudit.readTools(__input)', context),
  );
}

// ------------------------------------------------------------------------------ the vocabulary ----

describe('the vocabulary is closed', () => {
  it('answers one of three states and one of five absences, and nothing outside them', () => {
    const { audit } = standalone();
    const states = new Set();
    const absences = new Set();
    const sources = [
      ...absenceCases().map(({ source }) => source),
      pageContext([]).source,
      pageContext([{ name: 'a' }]).source,
      pageContext([descriptor('a', 'A.'), descriptor('b', 'B.')]).source,
    ];
    for (const source of sources) {
      const answer = read(audit, source);
      states.add(answer.state);
      if (answer.reason !== null) absences.add(answer.reason.code);
    }
    assert.deepEqual(
      [...states].sort(),
      STATES,
      'three states are reachable, and each one is reachable',
    );
    assert.deepEqual(
      [...absences].sort(),
      ABSENCES,
      'five absences are reachable, one per way the list fails to be readable, and there is no sixth',
    );
  });
});

// ---------------------------------------------------------------------------------- the pins ----

describe('SC1 — a tool is named by the API\u2019s string', () => {
  it('SC1 — reports the name and description the API reported, and no third field', () => {
    pinToolsAreTheAPIs(standalone().audit);
  });
});

describe('SC2 — an empty list and an unreadable one are different states', () => {
  it('SC2 — answers empty for a list the getter answered empty, and cannot-tell for every absence', () => {
    const { audit } = standalone();
    pinNoToolsDeclared(audit);
    pinCannotTellNamesTheAbsence(audit);
    const named = new Set(absenceCases().map(({ code: absence }) => absence));
    assert.deepEqual(
      [...named].sort(),
      ABSENCES,
      'every absence the module can name has a case behind it',
    );
  });
});

describe('SC3 — the reading is pure over what the page exposes', () => {
  it('SC3 — registers nothing, invokes nothing, and answers the same source the same way twice', () => {
    const { audit } = standalone();
    pinNoRegistration(audit);
    pinSameSourceSameAnswer(audit);
  });
});

describe('E4 — a name with no description gets no invented one', () => {
  it('E4 — reports each tool with its name and no description the API did not report', () => {
    pinDescriptionOnlyWhenReported(standalone().audit);
  });
});

// --------------------------------------------------------------------------------- the mutants ----

/** The label the page's markup shows for the tool, and the `document` that answers it. */
const DOM_LABEL = 'Search products';
const DOM = {
  querySelector: () => ({ getAttribute: () => DOM_LABEL }),
};

describe('mutants redden by name', () => {
  it('reddens by name: a tool name taken from a DOM label rather than the API', () => {
    // Pin the unmutated module first, so the mutation below is the only cause of the red.
    pinToolsAreTheAPIs(standalone().audit);

    const anchor = '      name = descriptor[NAME];';
    const mutated = SRC.replace(
      anchor,
      "      name = String(document.querySelector('[data-webmcp-tool]').getAttribute('aria-label'));",
    );
    assert.notEqual(
      mutated,
      SRC,
      'the DOM-label mutation target is gone from extension/webmcp-audit.js — restate the bite in scripts/webmcp-audit.test.mjs',
    );

    // A document that answers the page's visible label: the mutant reaches for the DOM and finds one,
    // which is the defect exactly — the tool is named by the page's markup, not by the API's string.
    const mutant = standalone(mutated, { document: DOM }).audit;
    const named = read(
      mutant,
      pageContext([descriptor('search-products', 'Search the catalogue.')])
        .source,
    );
    assert.equal(
      named.tools[0].name,
      DOM_LABEL,
      'the mutant names the tool out of the page\u2019s DOM label',
    );

    const failure = reddens(
      () => pinToolsAreTheAPIs(mutant),
      'the API-name pin',
    );
    assert.match(
      failure.message,
      /SC1 name-is-the-APIs-string/,
      `the DOM-label mutant must redden the API-name pin by name: ${failure.message}`,
    );
    console.log(
      `webmcp-audit M1 (tool name out of a DOM label) -> name ${JSON.stringify(named.tools[0].name)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: an empty list rendered as "no tools declared"', () => {
    pinNoToolsDeclared(standalone().audit);

    const anchor =
      '    if (tools.length === 0) return { state: EMPTY, tools, reason: null };';
    const mutated = SRC.replace(
      anchor,
      '    if (tools.length === 0) return { state: TOOLS, tools, reason: null };',
    );
    assert.notEqual(
      mutated,
      SRC,
      'the empty-state mutation target is gone from extension/webmcp-audit.js — restate the bite in scripts/webmcp-audit.test.mjs',
    );

    // The empty state folded into the tools state: a surface reading the state draws an empty tool
    // list, which reads as the page having declared none — the claim SC2 forbids.
    const mutant = standalone(mutated).audit;
    const declared = read(mutant, pageContext([]).source);
    assert.equal(
      declared.state,
      'tools',
      'the mutant answers a page that declared nothing with the tools state',
    );
    assert.deepEqual(
      declared.tools,
      [],
      'which a surface draws as "no tools declared"',
    );

    const failure = reddens(() => pinNoToolsDeclared(mutant), 'the empty pin');
    assert.match(
      failure.message,
      /SC2 empty-is-a-list-the-API-answered-empty/,
      `the empty-state mutant must redden the empty pin by name: ${failure.message}`,
    );
    console.log(
      `webmcp-audit M2 (empty list drawn as "no tools declared") -> state ${JSON.stringify(declared.state)}, ${declared.tools.length} tools\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a cannot-tell collapsed into an empty list', () => {
    pinCannotTellNamesTheAbsence(standalone().audit);

    const anchor = [
      "    if (typeof getter !== 'function') {",
      '      return cannotTell(',
      '        NO_LIST_GETTER,',
      "        'the model context exposes nothing that reads a tool list: the list is absent',",
      '      );',
      '    }',
    ].join('\n');
    const mutated = SRC.replace(
      anchor,
      "    if (typeof getter !== 'function') return { state: EMPTY, tools: [], reason: null };",
    );
    assert.notEqual(
      mutated,
      SRC,
      'the cannot-tell mutation target is gone from extension/webmcp-audit.js — restate the bite in scripts/webmcp-audit.test.mjs',
    );

    // The absence SC2 is about — a registration surface with no readable list — answered as an empty
    // list. This is the collapse the milestone exists to prevent: the page never said it declared
    // nothing, and the reader says it did.
    const mutant = standalone(mutated).audit;
    const collapsed = read(mutant, registrationOnly().source);
    assert.equal(
      collapsed.state,
      'empty',
      'the mutant answers an unreadable list as a page that declared no tools',
    );
    assert.equal(
      collapsed.reason,
      null,
      'the mutant names no absence at all, which is the defect',
    );

    const failure = reddens(
      () => pinCannotTellNamesTheAbsence(mutant),
      'the absence pin',
    );
    assert.match(
      failure.message,
      /SC2 cannot-tell-is-not-an-empty-list/,
      `the collapse mutant must redden the absence pin by name: ${failure.message}`,
    );
    console.log(
      `webmcp-audit M3 (cannot-tell collapsed into an empty list) -> ${JSON.stringify(collapsed)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a re-registration used to make a tool observable', () => {
    pinNoRegistration(standalone().audit);

    const anchor = '  function readTools(source) {\n    let context;';
    const mutated = SRC.replace(
      anchor,
      '  function readTools(source) {\n' +
        '    try {\n' +
        '      source.modelContext.registerTool({\n' +
        "        name: 'webmcp-audit-probe',\n" +
        '        execute() {},\n' +
        '      });\n' +
        '    } catch {\n' +
        '      // a page that refuses the registration is read as it is\n' +
        '    }\n' +
        '    let context;',
    );
    assert.notEqual(
      mutated,
      SRC,
      'the registration mutation target is gone from extension/webmcp-audit.js — restate the bite in scripts/webmcp-audit.test.mjs',
    );

    // A page that declares nothing, and a reader that registers a probe of its own to have something
    // to report: the tool it names is the reader's, not the page's.
    const mutant = standalone(mutated).audit;
    const page = pageContext([]);
    const observed = read(mutant, page.source);
    assert.equal(
      page.registered.length,
      1,
      'the mutant registers a tool to make one observable',
    );
    assert.deepEqual(
      observed.tools,
      [{ name: 'webmcp-audit-probe' }],
      'and reports the tool it registered as the page\u2019s own declaration',
    );
    assert.equal(
      observed.state,
      'tools',
      'a page that declared nothing answers with one tool',
    );

    const failure = reddens(
      () => pinNoRegistration(mutant),
      'the no-registration pin',
    );
    assert.match(
      failure.message,
      /SC3 no-registration-to-observe/,
      `the registration mutant must redden the no-registration pin by name: ${failure.message}`,
    );
    console.log(
      `webmcp-audit M4 (a re-registration makes a tool observable) -> registered ${page.registered.length}, reported ${JSON.stringify(observed.tools)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: an invented description where the API reported none', () => {
    pinDescriptionOnlyWhenReported(standalone().audit);

    const anchor =
      '    if (description === undefined) return { [NAME]: name };';
    const mutated = SRC.replace(
      anchor,
      "    if (description === undefined) return { [NAME]: name, [DESCRIPTION]: 'No description provided.' };",
    );
    assert.notEqual(
      mutated,
      SRC,
      'the description mutation target is gone from extension/webmcp-audit.js — restate the bite in scripts/webmcp-audit.test.mjs',
    );

    // A descriptor the API reported with a name and no description, answered with a sentence the page
    // never wrote. Held-out E4: the name is reported and nothing is invented beside it.
    const mutant = standalone(mutated).audit;
    const described = read(
      mutant,
      pageContext([{ name: 'search-products' }]).source,
    );
    assert.equal(
      described.tools[0].description,
      'No description provided.',
      'the mutant invents a description the API never reported',
    );

    const failure = reddens(
      () => pinDescriptionOnlyWhenReported(mutant),
      'the description pin',
    );
    assert.match(
      failure.message,
      /E4 no-invented-description/,
      `the description mutant must redden the description pin by name: ${failure.message}`,
    );
    console.log(
      `webmcp-audit M5 (a description invented) -> description ${JSON.stringify(described.tools[0].description)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });
});
