// @ts-check
// Run: node --test scripts/webmcp-rehearsal.test.mjs
//
// M053 T002 pins `extension/webmcp-rehearsal.js`: the awaited caller M052 carried as residual C3,
// and the pure join that turns a reading, a model's choice and a tool's answer into one record a
// surface can render. Two recordings fix the frame, and neither was made by this task:
//
//   research/raw/m052-webmcp-observation.json  `getTools()` answers a Promise that resolves to `[]`
//                                              on a page declaring no tool. `readTools` is
//                                              synchronous, so a caller that does not await judges
//                                              the Promise and answers `cannot-tell` /
//                                              `unreadable-list` for a page that declared tools.
//                                              Every pin below runs through that same unedited
//                                              reader: `extension/webmcp-audit.js` is loaded, never
//                                              re-implemented, and not one test mutates it.
//   research/raw/m053-execute-tool.json        `executeTool` needs one argument of type `Tool`,
//                                              refuses everything else with `parameter 1 is not of
//                                              type 'Tool'`, and `Tool` cannot be constructed, so a
//                                              page declaring no tool has no handle to invoke. Its
//                                              `measurement.noModel.observedHere` is false: no launch
//                                              produced a page with the surface present and the model
//                                              unavailable, which is why this suite asserts a
//                                              four-state vocabulary and no `no-model` state.
//
// What the fixtures are, stated exactly: every list handed to `getTools` is an input this suite
// gives the caller, never a claim about what a browser answered. The descriptor shape is the one
// research/01-built-in-ai-apis.md:188 documents, and the refusal text the join carries in its
// `no-tool` state is T001's own recorded string, read from the recording rather than retyped.
//
// Both functions are pinned first, unmutated. Each mutant is then applied to a copy of the module
// source — after the untouched module has passed the same pin — so the mutation is the only cause of
// the red, and each red must name the defect by string. A mutant that survived its pin would prove
// the pin vacuous, so every one prints what it printed.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

/** The shipped reader: loaded first, untouched, and the only reader any test here runs. */
const AUDIT_SRC = readFileSync(
  new URL('../extension/webmcp-audit.js', import.meta.url),
  'utf8',
);
const SRC = readFileSync(
  new URL('../extension/webmcp-rehearsal.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m053-execute-tool.json', import.meta.url),
    'utf8',
  ),
);

/** T001's measured answer about `executeTool`, which the join's refusal states rest on. */
const EXECUTE_TOOL = RECORDING.measurement;
const INVOCATION = EXECUTE_TOOL.invocation;

/** The binding's own refusal on a page that declares no tool: `parameter 1 is not of type 'Tool'`. */
const NO_HANDLE_REFUSAL = INVOCATION.refusals[0];

/** The four states the join answers, exactly, in sorted order. There is no fifth. */
const STATES = ['no-tool', 'refused', 'rehearsed', 'unavailable'];

/** The two the join answers about a rehearsal that ran, and the two refusals beside them. */
const RAN = ['refused', 'rehearsed'];

// ---------------------------------------------------------------------------------- loading ----

/** The module with its comments removed, so a token scan reads code and not prose. */
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/**
 * Both modules, evaluated in one bare context: the shipped reader first, then the module under
 * test. `node:vm` installs no DOM and no network, and whatever the caller puts in `sandbox` is the
 * whole world besides V8's own built-ins.
 * @param {string} source the rehearsal module, mutated or not.
 * @param {Record<string, unknown>} sandbox
 */
function standalone(source = SRC, sandbox = {}) {
  const context = createContext(sandbox);
  runInContext(AUDIT_SRC, context);
  runInContext(source, context);
  const rehearsal = context.angularAiWebmcpRehearsal;
  assert.ok(
    rehearsal,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  assert.equal(typeof rehearsal.readToolsAwaited, 'function');
  assert.equal(typeof rehearsal.rehearse, 'function');
  return { rehearsal, context };
}

/** A value from the vm context carries that context's own prototypes, so it is copied first. */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * One reading, through the awaited caller, copied into this realm.
 * @param {any} rehearsal
 * @param {any} source
 */
async function read(rehearsal, source) {
  return plain(await rehearsal.readToolsAwaited(source));
}

/**
 * One rehearsal record, copied into this realm.
 * @param {any} rehearsal
 * @param {any} reading
 * @param {any} chosen
 * @param {any} invocation
 */
function join(rehearsal, reading, chosen, invocation) {
  return plain(rehearsal.rehearse(reading, chosen, invocation));
}

// --------------------------------------------------------------------------------- the frames ----

/**
 * One descriptor in the shape the tree documents for the getter: an array of
 * `{ name, description, inputSchema, origin, window }` (research/01-built-in-ai-apis.md:188). The
 * three fields beside the reader's two carry placeholders for one reason: a caller that passed them
 * through has to be caught. No assertion here reads their values.
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
 * A page carrying a model context whose `getTools()` answers a Promise — the measured shape
 * (research/raw/m052-webmcp-observation.json). The call is counted with its arguments, and the
 * registration function records what it is handed, so a caller that registers to observe is caught
 * rather than trusted.
 * @param {any[]} list
 * @param {{ throws?: any, rejects?: any, answers?: any }} [options]
 */
function pageWith(list, options = {}) {
  /** @type {{ getTools: number, arguments: any[][] }} */
  const calls = { getTools: 0, arguments: [] };
  /** @type {any[]} */
  const registered = [];
  const context = {
    /** @param {any} tool */
    registerTool(tool) {
      registered.push(tool);
    },
    /** @param {...any} args */
    getTools(...args) {
      calls.getTools += 1;
      calls.arguments.push(args);
      if ('throws' in options) throw options.throws;
      if ('rejects' in options) return Promise.reject(options.rejects);
      if ('answers' in options) return Promise.resolve(options.answers);
      return Promise.resolve(list.slice());
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
    /** @param {any} tool */
    registerTool(tool) {
      registered.push(tool);
    },
  };
  return { source: { modelContext: context }, context, registered };
}

/** Every way the list is not readable, one case per absence, built fresh on each call. */
function absenceCases() {
  return [
    { what: 'no source at all', source: undefined, code: 'no-model-context' },
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
      what: 'a getter that throws before it can be awaited',
      source: pageWith([], {
        throws: new Error('the tools policy is disabled'),
      }).source,
      code: 'get-tools-threw',
    },
    {
      what: 'a getter whose promise rejects',
      source: pageWith([], {
        rejects: new Error('the tools policy is disabled'),
      }).source,
      code: 'get-tools-threw',
    },
    {
      what: 'a resolution that is an object',
      source: pageWith([], { answers: {} }).source,
      code: 'unreadable-list',
    },
    {
      what: 'a resolution that is a string',
      source: pageWith([], { answers: 'search-products' }).source,
      code: 'unreadable-list',
    },
    {
      what: 'a resolution that is undefined',
      source: pageWith([], { answers: undefined }).source,
      code: 'unreadable-list',
    },
    {
      what: 'a list entry that is not an object',
      source: pageWith(['search-products']).source,
      code: 'unreadable-tool',
    },
    {
      what: 'a list entry with no name',
      source: pageWith([{ description: 'Search.' }]).source,
      code: 'unreadable-tool',
    },
    {
      what: 'a list entry with an empty name',
      source: pageWith([descriptor('')]).source,
      code: 'unreadable-tool',
    },
  ];
}

// ----------------------------------------------------------------------------------- the pins ----

/**
 * SC1's pin: the caller awaits `getTools()`, hands the resolved list to the shipped reader, and
 * reports each tool with the name the API answered, in the order it answered them.
 * @param {any} rehearsal
 */
async function pinAwaitedList(rehearsal) {
  const page = pageWith([
    descriptor('search-products', 'Search the catalogue.'),
    { name: 'read-cart' },
  ]);
  const pending = rehearsal.readToolsAwaited(page.source);
  assert.equal(
    typeof pending.then,
    'function',
    'SC1 awaited-caller-reads-the-list: the caller answers a promise, because the list it reads is one',
  );
  const answer = plain(await pending);
  assert.equal(
    answer.state,
    'tools',
    'SC1 awaited-caller-reads-the-list: a page whose getTools resolved a list is the tools state, not an unreadable one',
  );
  assert.deepEqual(
    answer.tools,
    [
      { name: 'search-products', description: 'Search the catalogue.' },
      { name: 'read-cart' },
    ],
    'SC1 name-is-the-APIs-string: each tool carries the name and the description the API reported, in the order it reported them',
  );
  assert.equal(
    answer.reason,
    null,
    'SC1 tools-names-no-absence: the list was read, so nothing is absent to name',
  );
  assert.deepEqual(
    page.calls.arguments,
    [[]],
    'SC1 one-call-with-no-argument: the getter is called once, with no argument, and no second path',
  );
  const text = JSON.stringify(answer.tools);
  for (const field of ['inputSchema', 'origin', 'window', 'app.example']) {
    assert.equal(
      text.includes(field),
      false,
      `SC1 nothing-the-API-did-not-report: the answer carries nothing of the descriptor's ${field}`,
    );
  }
}

/**
 * SC1/E2's pin: a list the page resolved empty is `empty`, and every way the list fails to be
 * readable is `cannot-tell` naming which absence it was. The two never collapse.
 * @param {any} rehearsal
 */
async function pinEmptyIsNotUnreadable(rehearsal) {
  const page = pageWith([]);
  const answer = await read(rehearsal, page.source);
  assert.equal(
    answer.state,
    'empty',
    'SC2 empty-is-not-unreadable: a list the page resolved empty is the empty state',
  );
  assert.deepEqual(answer.tools, [], 'SC2 empty-reports-no-tool');
  assert.equal(
    answer.reason,
    null,
    'SC2 empty-names-no-absence: the list was read, so nothing is absent',
  );
  assert.equal(
    page.calls.getTools,
    1,
    'SC2 empty-comes-from-a-read: the empty answer is a list the getter answered, not a default',
  );

  for (const { what, source, code: expected } of absenceCases()) {
    const refused = await read(rehearsal, source);
    assert.equal(
      refused.state,
      'cannot-tell',
      `SC2 unreadable-is-not-an-empty-list: ${what} cannot tell, and its answer is not an empty list`,
    );
    assert.notEqual(
      refused.state,
      'empty',
      `SC2 empty-is-not-a-refusal: ${what} was not read, so it is not a page that declared nothing`,
    );
    assert.deepEqual(
      refused.tools,
      [],
      `SC2 cannot-tell-reports-no-tool: ${what} names no tool`,
    );
    assert.equal(
      refused.reason.code,
      expected,
      `SC2 the-absence-is-named: ${what} names ${expected}`,
    );
    assert.ok(
      typeof refused.reason.detail === 'string' &&
        refused.reason.detail.length > 0,
      `SC2 the-absence-is-stated: ${what} states the absence in words`,
    );
    assert.equal(
      /no tools|none|zero|0 tools/i.test(refused.reason.detail),
      false,
      `SC2 the-refusal-is-not-a-count: ${what} must not read as a count of tools: ${refused.reason.detail}`,
    );
  }
}

/**
 * SC1's pin: a resolution that is not a list is the shipped reader's own `unreadable-list` branch
 * answering. The caller writes no refusal of its own, so the code and the wording are the reader's.
 * @param {any} rehearsal
 */
async function pinResolutionThatIsNotAList(rehearsal) {
  for (const answers of [{}, 'search-products', 7, null, undefined]) {
    const answer = await read(rehearsal, pageWith([], { answers }).source);
    assert.equal(
      answer.state,
      'cannot-tell',
      `SC1 a-resolution-that-is-not-a-list: ${JSON.stringify(answers)} is not a list, so the reading cannot tell`,
    );
    assert.equal(
      answer.reason.code,
      'unreadable-list',
      `SC1 the-readers-own-unreadable-list-branch: ${JSON.stringify(answers)} is refused by the shipped reader, named unreadable-list`,
    );
    assert.notEqual(
      answer.state,
      'empty',
      'SC1 not-a-list-is-not-a-list-of-zero-tools: an unreadable resolution is never drawn as an empty page',
    );
  }
}

/**
 * Held-out E4's pin: a descriptor the API reported with a name and no description is reported with
 * its name and nothing else, and the same pin asserts the fully-described case, so "the list was
 * read" cannot collapse into "descriptions were invented".
 * @param {any} rehearsal
 */
async function pinDescriptionOnlyWhenReported(rehearsal) {
  const page = pageWith([
    { name: 'search-products' },
    descriptor('read-cart', 'Read the current cart.'),
    descriptor('clear-cart', ''),
  ]);
  const answer = await read(rehearsal, page.source);
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
    'E4 an-empty-description-is-still-reported: the reader neither invents wording nor drops what it was given',
  );
  assert.equal(
    /no description|not described/i.test(JSON.stringify(answer)),
    false,
    'E4 no-boilerplate-description: no boilerplate wording appears anywhere in the answer',
  );
}

/**
 * SC2's pin: where a handle existed and the call resolved, the record names the tool the reading
 * reported and carries the result the call returned, unchanged.
 * @param {any} rehearsal
 */
async function pinRehearsed(rehearsal) {
  const page = pageWith([
    descriptor('search-products', 'Search the catalogue.'),
    { name: 'read-cart' },
  ]);
  const reading = await read(rehearsal, page.source);

  const returned = '{"content":[{"type":"text","text":"2 items"}]}';
  const ran = join(rehearsal, reading, 'read-cart', {
    resolved: true,
    value: returned,
  });
  assert.equal(
    ran.state,
    'rehearsed',
    'SC2 rehearsed-is-a-rehearsal-that-ran: a handle existed and the call resolved',
  );
  assert.deepEqual(
    ran.tool,
    { name: 'read-cart' },
    'SC2 the-tool-is-the-readings: the tool is named by the entry the reading reported, and by nothing else',
  );
  assert.equal(
    ran.result,
    returned,
    'SC2 rehearsed-carries-the-tools-own-result: the result is what the call resolved to, byte for byte',
  );
  assert.equal(ran.reason, null, 'SC2 rehearsed-names-no-absence');

  const described = join(rehearsal, reading, 'search-products', {
    resolved: true,
    value: 'ok',
  });
  assert.deepEqual(
    described.tool,
    { name: 'search-products', description: 'Search the catalogue.' },
    'SC2 the-tool-carries-the-description-the-API-reported: and no description the reading did not carry',
  );
  assert.deepEqual(
    Object.keys(described).sort(),
    ['reason', 'result', 'state', 'tool'],
    'SC2 the-record-is-four-fields: state, tool, result and reason, and nothing else',
  );
}

/**
 * SC2's pin: a call that rejected is `refused`, the refusal's own words are carried, and no result
 * stands in the place of one the tool did not return (N3).
 * @param {any} rehearsal
 */
async function pinRefused(rehearsal) {
  const page = pageWith([
    descriptor('search-products', 'Search the catalogue.'),
    { name: 'read-cart' },
  ]);
  const reading = await read(rehearsal, page.source);

  const refusal = 'TypeError: the tool answered an error';
  const refused = join(rehearsal, reading, 'search-products', {
    resolved: false,
    reason: refusal,
  });
  assert.equal(
    refused.state,
    'refused',
    'SC2 refused-is-a-call-that-did-not-resolve: a rejection is its own state, not a rehearsal and not an unreadable list',
  );
  assert.deepEqual(
    refused.tool,
    { name: 'search-products', description: 'Search the catalogue.' },
    'SC2 refused-still-names-the-tool: the handle existed, so the tool is named',
  );
  assert.equal(
    refused.result,
    null,
    'SC2 refused-renders-no-result: a refusal is not a result, and no paraphrase stands in one',
  );
  assert.equal(
    refused.reason,
    refusal,
    'SC2 refused-carries-the-refusals-own-words: the reason is the rejection, verbatim',
  );
  assert.equal(
    'result' in refused && refused.result === null,
    true,
    'SC2 refused-keeps-the-field: the result field is null rather than absent, so a surface reads one shape',
  );
}

/**
 * SC3's pin: a rehearsal that made no call renders no result — not even a placeholder — and names
 * no refusal, because nothing refused.
 * @param {any} rehearsal
 */
async function pinNoCallNoResult(rehearsal) {
  const page = pageWith([
    descriptor('search-products', 'Search the catalogue.'),
  ]);
  const reading = await read(rehearsal, page.source);

  for (const [what, invocation] of [
    ['an absent call', undefined],
    ['a call recorded as nothing', null],
    ['a record with no outcome', {}],
  ]) {
    const notRun = join(rehearsal, reading, 'search-products', invocation);
    assert.equal(
      notRun.state,
      'refused',
      `SC3 a-rehearsal-that-did-not-run-is-not-a-rehearsal: ${what} renders no rehearsed state`,
    );
    assert.notEqual(
      notRun.state,
      'rehearsed',
      `SC3 no-rehearsal-without-a-resolution: ${what} did not resolve, so nothing was rehearsed`,
    );
    assert.equal(
      notRun.result,
      null,
      `SC3 no-result-for-a-call-that-never-ran: ${what} renders no result and no placeholder in its place`,
    );
    assert.equal(
      notRun.reason,
      null,
      `SC3 no-call-names-no-refusal: ${what} has no refusal to carry`,
    );
    assert.deepEqual(
      notRun.tool,
      { name: 'search-products', description: 'Search the catalogue.' },
      `SC3 the-tool-still-existed: ${what} does not deny the handle the reading reported`,
    );
  }
}

/**
 * SC2's pin: no handle, no tool and no result. The reading reported nothing to invoke, the message
 * is the binding's own measured refusal, and this state is never drawn as an unreadable list.
 * @param {any} rehearsal
 */
async function pinNoTool(rehearsal) {
  const nothing = await read(rehearsal, pageWith([]).source);
  const noTool = join(rehearsal, nothing, null, {
    resolved: false,
    reason: NO_HANDLE_REFUSAL,
  });
  assert.equal(
    noTool.state,
    'no-tool',
    'SC2 no-tool-is-not-unavailable: a page that resolved no tool has no handle, which is not an unreadable list',
  );
  assert.equal(noTool.tool, null, 'SC2 no-tool-names-no-tool');
  assert.equal(noTool.result, null, 'SC2 no-tool-carries-no-result');
  assert.equal(
    noTool.reason,
    NO_HANDLE_REFUSAL,
    "SC2 no-tool-carries-the-bindings-own-refusal: parameter 1 is not of type 'Tool', as measured",
  );

  const declared = await read(
    rehearsal,
    pageWith([descriptor('search-products', 'Search the catalogue.')]).source,
  );
  const unchosen = join(rehearsal, declared, 'checkout', {
    resolved: false,
    reason: NO_HANDLE_REFUSAL,
  });
  assert.equal(
    unchosen.state,
    'no-tool',
    'SC2 a-name-the-reading-did-not-report-is-no-tool: a name is never carried from the choice alone',
  );
  assert.equal(unchosen.tool, null, 'SC2 no-handle-is-named-in-its-place');

  for (const chosen of [null, undefined, '', 7, { name: 'search-products' }]) {
    const silent = join(rehearsal, declared, chosen, null);
    assert.equal(
      silent.state,
      'no-tool',
      `SC2 no-tool-when-no-tool-was-chosen: ${JSON.stringify(chosen)} is not a choice this join can name a tool from`,
    );
    assert.equal(
      silent.tool,
      null,
      `SC3 no-model-turn-invented: ${JSON.stringify(chosen)} names no tool, and none is made up`,
    );
    assert.equal(
      silent.result,
      null,
      `SC3 no-model-turn-invented: ${JSON.stringify(chosen)} renders no result`,
    );
  }
}

/**
 * SC2's pin: a list nobody read is `unavailable`, the reading's own reason is echoed unchanged, and
 * no rehearsal is attempted from it — not even where a call record says one resolved.
 * @param {any} rehearsal
 */
async function pinUnavailable(rehearsal) {
  for (const { what, source } of absenceCases()) {
    const unread = await read(rehearsal, source);
    const unavailable = join(rehearsal, unread, 'read-cart', {
      resolved: true,
      value: 'a result from a list nobody read',
    });
    assert.equal(
      unavailable.state,
      'unavailable',
      `SC2 unavailable-is-a-list-nobody-read: ${what} attempts no rehearsal`,
    );
    assert.equal(
      unavailable.tool,
      null,
      `SC2 unavailable-names-no-tool: ${what} reports no handle, because no list was read`,
    );
    assert.equal(
      unavailable.result,
      null,
      `SC2 unavailable-renders-no-result: ${what} renders nothing a call claimed`,
    );
    assert.deepEqual(
      unavailable.reason,
      unread.reason,
      `SC2 unavailable-echoes-the-readings-own-reason: ${what} carries the reader's own words and code, unchanged`,
    );
  }
}

/**
 * SC3's pin: the join is pure over its inputs. The same record answers identically twice, nothing is
 * written to, and no tool is registered, invoked or read out of a page.
 * @param {any} rehearsal
 */
async function pinSameRecordSameAnswer(rehearsal) {
  const reading = deepFreeze({
    state: 'tools',
    tools: [{ name: 'search-products', description: 'Search.' }],
    reason: null,
  });
  const invocation = deepFreeze({ resolved: true, value: { content: [] } });
  const first = join(rehearsal, reading, 'search-products', invocation);
  const second = join(rehearsal, reading, 'search-products', invocation);
  assert.deepEqual(
    second,
    first,
    'SC3 same-record-same-answer: two joins of one record answer identically',
  );
  assert.deepEqual(
    Object.keys(reading),
    ['state', 'tools', 'reason'],
    'SC3 no-input-mutation: the reading keeps the fields it came with',
  );
  assert.deepEqual(
    reading.tools[0],
    { name: 'search-products', description: 'Search.' },
    'SC3 no-tool-mutation: the tool entry is read, never rewritten',
  );

  const page = pageWith([descriptor('search-products', 'Search.')]);
  const awaited = await read(rehearsal, page.source);
  join(rehearsal, awaited, 'search-products', { resolved: true, value: 'ok' });
  join(rehearsal, awaited, 'search-products', {
    resolved: false,
    reason: 'no',
  });
  assert.deepEqual(
    page.registered,
    [],
    'SC3 no-registration-to-observe: neither the caller nor the join registers a tool to make one observable',
  );
  assert.equal(
    'executeTool' in page.context,
    false,
    'SC3 the-join-invokes-nothing: the module never reaches for executeTool — it is told what a call answered',
  );
}

/**
 * A frozen object graph: a write to it throws in the module's strict mode, so a join that mutates
 * its input fails here rather than silently changing the record it was asked about.
 * @param {any} value
 */
function deepFreeze(value) {
  if (value === null || typeof value !== 'object') return value;
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
}

/** A pin that a value reddens: returns the failure the pin raises on it. */
async function reddens(pin, what) {
  let failure = null;
  try {
    await pin();
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    `${what} passed on the mutant, so the mutation is not caught`,
  );
  return /** @type {Error} */ (failure);
}

// --------------------------------------------------------------- the poisoned-globals guard ----

/** The globals neither function may reach for. */
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
 * that reached for the clock, the DOM or the network inside the context hits this on the first
 * touch, which is what makes the guard a guard rather than a decoration.
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
 * Runs the awaited caller inside a context where every host global is a trap, and answers its
 * reading. The source is handed in through the sandbox, so nothing but the data crosses realms.
 * @param {string} source
 * @param {unknown} input
 */
async function guardedRead(source, input) {
  const { context } = standalone(source, { ...traps(), __source: input });
  try {
    return plain(
      await runInContext(
        'angularAiWebmcpRehearsal.readToolsAwaited(__source)',
        context,
      ),
    );
  } catch (error) {
    throw new Error(
      `SC3 poisoned-globals-change-nothing: ${(error instanceof Error && error.message) || String(error)}`,
    );
  }
}

/**
 * Runs the join inside the same trap context.
 * @param {string} source
 * @param {unknown} reading
 * @param {unknown} chosen
 * @param {unknown} invocation
 */
async function guardedJoin(source, reading, chosen, invocation) {
  const { context } = standalone(source, {
    ...traps(),
    __reading: reading,
    __chosen: chosen,
    __invocation: invocation,
  });
  try {
    return plain(
      await runInContext(
        'angularAiWebmcpRehearsal.rehearse(__reading, __chosen, __invocation)',
        context,
      ),
    );
  } catch (error) {
    throw new Error(
      `SC3 poisoned-globals-change-nothing: ${(error instanceof Error && error.message) || String(error)}`,
    );
  }
}

/**
 * SC3's pin: with `document`, `fetch`, `Date` and seven more armed as traps, both functions answer
 * exactly what they answered in a bare context.
 * @param {string} [source]
 */
async function pinPoisonedGlobals(source = SRC) {
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

  const { rehearsal } = standalone(source);
  const listens = [
    {
      what: 'tools with descriptions',
      page: pageWith([descriptor('a', 'A.')]),
    },
    { what: 'a tool with no description', page: pageWith([{ name: 'a' }]) },
    { what: 'an empty list', page: pageWith([]) },
    { what: 'no list getter', page: registrationOnly() },
    {
      what: 'a rejecting getter',
      page: pageWith([], { rejects: new Error('no') }),
    },
    { what: 'no API at all', page: { source: {} } },
  ];
  for (const { what, page } of listens) {
    assert.deepEqual(
      await guardedRead(source, page.source),
      await read(rehearsal, page.source),
      `SC3 poisoned-globals-change-nothing: ${what} answers the same reading with document, fetch and Date armed as traps`,
    );
  }

  const reading = await read(
    rehearsal,
    pageWith([descriptor('a', 'A.')]).source,
  );
  const joins = [
    ['rehearsed', 'a', { resolved: true, value: 'ok' }],
    ['refused', 'a', { resolved: false, reason: 'no' }],
    ['nothing chosen', null, null],
  ];
  for (const [what, chosen, invocation] of joins) {
    assert.deepEqual(
      await guardedJoin(source, plain(reading), chosen, invocation),
      join(rehearsal, plain(reading), chosen, invocation),
      `SC3 poisoned-globals-change-nothing: ${what} joins identically with document, fetch and Date armed as traps`,
    );
  }
  console.log(
    'webmcp-rehearsal purity: 6 readings and 3 joins answer identically with document, fetch and Date armed as traps',
  );
}

// ------------------------------------------------------- the recording, read as a contract ----

describe('the recording the join answers to', () => {
  it('measured the handle argument, and the join carries its refusal verbatim', () => {
    assert.equal(EXECUTE_TOOL.arguments.requiredArguments, 1);
    assert.equal(EXECUTE_TOOL.arguments.handleArgument, 'Tool');
    assert.equal(INVOCATION.observedHere, true);
    assert.equal(INVOCATION.toolsListedOnThePage, 0);
    assert.equal(
      INVOCATION.handleAvailable,
      false,
      'T001 measured no handle on a page declaring no tool, which is the state the join answers no-tool',
    );
    assert.equal(
      INVOCATION.handleConstructible,
      false,
      'the Tool interface cannot be constructed, so the join cannot be handed a fabricated handle',
    );
    assert.match(
      NO_HANDLE_REFUSAL,
      /parameter 1 is not of type 'Tool'/,
      'the no-tool reason is the binding’s own measured refusal, read from the recording rather than retyped',
    );
    assert.equal(
      EXECUTE_TOOL.answerShape.returns,
      'Promise',
      'executeTool answers a promise in every measured case',
    );
  });

  it('states that no launch observed a missing model, which is why no state is rendered for it', () => {
    assert.equal(
      EXECUTE_TOOL.noModel.observedHere,
      false,
      'T001 could not measure a no-model answer: the model was available in both launches',
    );
    assert.equal(EXECUTE_TOOL.noModel.observedInstead.observedHere, true);
    const { rehearsal } = standalone();
    const noModel = plain(
      rehearsal.rehearse(
        {
          state: 'cannot-tell',
          tools: [],
          reason: {
            code: 'no-model-context',
            detail:
              'the source carries no model context object: the tool list is not readable',
          },
        },
        'read-cart',
        null,
      ),
    );
    assert.equal(
      noModel.state,
      'unavailable',
      'a page with no document.modelContext answers unavailable, not a no-model state nobody measured (PLAN C4)',
    );
    assert.equal(
      Object.values(noModel).includes('no-model'),
      false,
      'no field of the record ever reads no-model',
    );
  });
});

// ------------------------------------------------------------ the module, and the reader it ----
// ------------------------------------------------------------ reads through, unedited ----

describe('webmcp-rehearsal.js reads through the shipped reader', () => {
  it('publishes two functions and nothing else, and is safe to run twice', () => {
    const { rehearsal, context } = standalone();
    assert.deepEqual(
      Object.keys(rehearsal),
      ['readToolsAwaited', 'rehearse'],
      'the module publishes the caller and the join',
    );
    assert.doesNotThrow(
      () => runInContext(SRC, context),
      'a second evaluation in the same world must not throw',
    );
    assert.equal(
      context.angularAiWebmcpRehearsal,
      rehearsal,
      'a second run republishes in place, keeping the identity a caller may hold',
    );
  });

  it('does not fork the reader: the shipped one is looked up and required', async () => {
    assert.equal(
      /function\s+readTools\s*\(/.test(code(SRC)),
      false,
      'extension/webmcp-rehearsal.js must not define a reader of its own: readTools belongs to extension/webmcp-audit.js',
    );
    const bare = createContext({});
    runInContext(SRC, bare);
    const alone = bare.angularAiWebmcpRehearsal;
    await assert.rejects(
      () => alone.readToolsAwaited({ modelContext: { getTools: () => [] } }),
      /angularAiWebmcpAudit\.readTools is absent/,
      'a world with no shipped reader is a programming error, named as one, not a page state',
    );
  });

  it('holds no DOM read, no clock and no network call in its code', () => {
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
    ]) {
      assert.equal(
        pattern.test(body),
        false,
        `extension/webmcp-rehearsal.js must contain no ${what}: ${pattern}`,
      );
    }
  });
});

// --------------------------------------------------------------------------------- the pins ----

describe('SC1 — the tool list, read through an awaited caller', () => {
  it('SC1 — awaits getTools() and reports the names the API reported', async () => {
    await pinAwaitedList(standalone().rehearsal);
    await pinResolutionThatIsNotAList(standalone().rehearsal);
  });

  it('SC1 — answers empty for a resolved empty list and cannot-tell for every absence', async () => {
    const { rehearsal } = standalone();
    await pinEmptyIsNotUnreadable(rehearsal);
    const named = new Set(absenceCases().map(({ code: absence }) => absence));
    assert.deepEqual(
      [...named].sort(),
      [
        'get-tools-threw',
        'no-list-getter',
        'no-model-context',
        'unreadable-list',
        'unreadable-tool',
      ],
      'every absence the caller can answer with has a case behind it, and there is no sixth',
    );
  });
});

describe('E4 — a name with no description gets no invented one', () => {
  it('E4 — reports each tool with its name and no description the API did not report', async () => {
    await pinDescriptionOnlyWhenReported(standalone().rehearsal);
  });
});

describe('SC2 — a rehearsal reports what the tool returned, or refuses naming why', () => {
  it('SC2 — rehearsed, refused, no-tool and unavailable are four distinct records', async () => {
    const { rehearsal } = standalone();
    await pinRehearsed(rehearsal);
    await pinRefused(rehearsal);
    await pinNoCallNoResult(rehearsal);
    await pinNoTool(rehearsal);
    await pinUnavailable(rehearsal);
  });

  it('SC2 — the vocabulary is closed at four states, and no-model is not one of them', async () => {
    const { rehearsal } = standalone();
    const states = new Set();
    const reading = await read(
      rehearsal,
      pageWith([descriptor('a', 'A.')]).source,
    );
    const empty = await read(rehearsal, pageWith([]).source);
    const unread = await read(rehearsal, {});
    const records = [
      join(rehearsal, reading, 'a', { resolved: true, value: 'ok' }),
      join(rehearsal, reading, 'a', { resolved: false, reason: 'no' }),
      join(rehearsal, reading, 'a', null),
      join(rehearsal, empty, null, null),
      join(rehearsal, unread, 'a', null),
      join(rehearsal, reading, 'nothing-by-that-name', null),
      join(rehearsal, null, 'a', null),
    ];
    for (const record of records) {
      states.add(record.state);
      assert.deepEqual(
        Object.keys(record).sort(),
        ['reason', 'result', 'state', 'tool'],
        `SC2 one-shape: ${record.state} carries the same four fields as every other state`,
      );
    }
    assert.deepEqual(
      [...states].sort(),
      STATES,
      'four states are reachable, each one is reachable, and there is no fifth',
    );
    assert.equal(
      /** @type {string[]} */ ([...states]).includes('no-model'),
      false,
      'no-model is not a state: T001 could not observe one, and SC2 forbids rendering what was not observed',
    );
    assert.equal(
      STATES.filter((state) => RAN.includes(state)).length,
      2,
      'exactly two of the four states report a rehearsal outcome',
    );
  });
});

describe('SC3 — the join is pure over what it is given', () => {
  it('SC3 — the same record answers identically twice, registers nothing and invokes nothing', async () => {
    await pinSameRecordSameAnswer(standalone().rehearsal);
  });

  it('SC3 — both functions answer identically with document, fetch and Date armed as traps', async () => {
    await pinPoisonedGlobals();
  });
});

// --------------------------------------------------------------------------------- the mutants ----

/** The label the page's markup shows for the tool, and the `document` that answers it. */
const DOM_LABEL = 'Search products';
const DOM = {
  querySelector: () => ({ getAttribute: () => DOM_LABEL }),
};

/**
 * The mutation, held to its anchor: a target that is gone from the source reddens here, naming the
 * file that must be restated, rather than silently mutating nothing.
 * @param {string} anchor
 * @param {string} replacement
 */
function mutate(anchor, replacement) {
  const mutated = SRC.replace(anchor, replacement);
  assert.notEqual(
    mutated,
    SRC,
    `the mutation target is gone from extension/webmcp-rehearsal.js — restate the bite in scripts/webmcp-rehearsal.test.mjs: ${anchor.split('\n')[0]}`,
  );
  return mutated;
}

describe('mutants redden by name', () => {
  it('reddens by name: the un-awaited synchronous return, judged as a list', async () => {
    // Pin the unmutated module first, so the mutation below is the only cause of the red.
    await pinAwaitedList(standalone().rehearsal);

    // M052's regression, exactly: `getTools()` answered a Promise, the caller did not await it, and
    // the synchronous reader judged the Promise — so a page that declared tools read as unreadable.
    const mutant = standalone(
      mutate(
        '      resolved = await getter.call(context);',
        '      resolved = getter.call(context);',
      ),
    ).rehearsal;
    const page = pageWith([
      descriptor('search-products', 'Search the catalogue.'),
    ]);
    const judged = await read(mutant, page.source);
    assert.equal(
      judged.state,
      'cannot-tell',
      'the mutant judges the promise instead of the list',
    );
    assert.equal(
      judged.reason.code,
      'unreadable-list',
      'and reports a page that declared a tool as an unreadable list',
    );

    const failure = await reddens(
      () => pinAwaitedList(mutant),
      'the awaited-caller pin',
    );
    assert.match(
      failure.message,
      /SC1 awaited-caller-reads-the-list/,
      `the un-awaited mutant must redden the awaited-caller pin by name: ${failure.message}`,
    );
    console.log(
      `webmcp-rehearsal M1 (un-awaited synchronous return) -> ${JSON.stringify(judged.reason)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: an un-awaited caller fed a fixture list instead of the answer', async () => {
    await pinAwaitedList(standalone().rehearsal);

    const mutant = standalone(
      mutate(
        '    return readTools(answeredBy(resolved));',
        "    return readTools(answeredBy([{ name: 'search-products', description: 'Search the catalogue.' }]));",
      ),
    ).rehearsal;
    const page = pageWith([descriptor('checkout', 'Place the order.')]);
    const named = await read(mutant, page.source);
    assert.deepEqual(
      named.tools,
      [{ name: 'search-products', description: 'Search the catalogue.' }],
      'the mutant reports a tool list the page never declared',
    );

    const failure = await reddens(
      () => pinAwaitedList(mutant),
      'the API-name pin',
    );
    assert.match(
      failure.message,
      /SC1 name-is-the-APIs-string/,
      `the fixture-list mutant must redden the API-name pin by name: ${failure.message}`,
    );
    console.log(
      `webmcp-rehearsal M2 (a fixture list stands in for the answer) -> ${JSON.stringify(named.tools)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a tool name taken from a DOM label', async () => {
    await pinRehearsed(standalone().rehearsal);

    const mutant = standalone(
      mutate(
        '    const tool = toolNamed(reading, chosen);',
        "    const tool = {\n      name: String(\n        document.querySelector('[data-webmcp-tool]').getAttribute('aria-label'),\n      ),\n    };",
      ),
      { document: DOM },
    ).rehearsal;
    const reading = await read(
      mutant,
      pageWith([descriptor('search-products', 'Search the catalogue.')]).source,
    );
    const named = join(mutant, reading, 'search-products', {
      resolved: true,
      value: 'ok',
    });
    assert.equal(
      named.tool.name,
      DOM_LABEL,
      'the mutant names the tool out of the page’s DOM label',
    );

    const failure = await reddens(
      () => pinRehearsed(mutant),
      'the tool-name pin',
    );
    assert.match(
      failure.message,
      /SC2 the-tool-is-the-readings/,
      `the DOM-label mutant must redden the tool-name pin by name: ${failure.message}`,
    );
    console.log(
      `webmcp-rehearsal M3 (tool name out of a DOM label) -> tool ${JSON.stringify(named.tool)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a join that refuses every input', async () => {
    await pinRehearsed(standalone().rehearsal);

    // A surface that always refuses is not a surface: it can never report the rehearsal SC2 exists
    // to report, and every pass state is rendered as an absence.
    const mutant = standalone(
      mutate(
        '    if (state !== TOOLS && state !== EMPTY) {',
        '    if (true) {',
      ),
    ).rehearsal;
    const reading = await read(
      mutant,
      pageWith([descriptor('search-products', 'Search the catalogue.')]).source,
    );
    const refusedEverything = join(mutant, reading, 'search-products', {
      resolved: true,
      value: 'ok',
    });
    assert.equal(
      refusedEverything.state,
      'unavailable',
      'the mutant refuses a rehearsal that ran',
    );
    assert.equal(
      refusedEverything.result,
      null,
      'and drops the result the tool returned',
    );

    const failure = await reddens(
      () => pinRehearsed(mutant),
      'the rehearsed pin',
    );
    assert.match(
      failure.message,
      /SC2 rehearsed-is-a-rehearsal-that-ran/,
      `the always-refuses mutant must redden the rehearsed pin by name: ${failure.message}`,
    );
    console.log(
      `webmcp-rehearsal M4 (a join that refuses every input survives no surface) -> ${JSON.stringify(refusedEverything)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a no-tool rendered as an unreadable list', async () => {
    await pinNoTool(standalone().rehearsal);

    // E2's collapse, one state over: a page nobody read and a page that resolved no tool are two
    // facts, and rendering the second as the first describes a list that was read as one that was not.
    const mutant = standalone(
      mutate('        state: NO_TOOL,', '        state: UNAVAILABLE,'),
    ).rehearsal;
    const nothing = await read(mutant, pageWith([]).source);
    const collapsed = join(mutant, nothing, null, {
      resolved: false,
      reason: NO_HANDLE_REFUSAL,
    });
    assert.equal(
      collapsed.state,
      'unavailable',
      'the mutant answers a page that resolved no tool as an unreadable list',
    );

    const failure = await reddens(() => pinNoTool(mutant), 'the no-tool pin');
    assert.match(
      failure.message,
      /SC2 no-tool-is-not-unavailable/,
      `the no-tool mutant must redden the no-tool pin by name: ${failure.message}`,
    );
    console.log(
      `webmcp-rehearsal M5 (no-tool rendered as unavailable) -> ${JSON.stringify(collapsed)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: an invented result for a call that never ran', async () => {
    await pinNoCallNoResult(standalone().rehearsal);

    // A placeholder is the same lie as a fabrication: nothing ran, so nothing came back, and a
    // surface that draws a result here has drawn something no tool returned.
    const mutant = standalone(
      mutate(
        '        state: REFUSED,\n        tool: tool,\n        result: null,',
        "        state: REFUSED,\n        tool: tool,\n        result: 'no result',",
      ),
    ).rehearsal;
    const reading = await read(
      mutant,
      pageWith([descriptor('search-products', 'Search the catalogue.')]).source,
    );
    const invented = join(mutant, reading, 'search-products', null);
    assert.equal(
      invented.result,
      'no result',
      'the mutant renders a result where no call was ever made',
    );

    const failure = await reddens(
      () => pinNoCallNoResult(mutant),
      'the no-result pin',
    );
    assert.match(
      failure.message,
      /SC3 no-result-for-a-call-that-never-ran/,
      `the invented-result mutant must redden the no-result pin by name: ${failure.message}`,
    );
    console.log(
      `webmcp-rehearsal M6 (a result invented for a call that never ran) -> result ${JSON.stringify(invented.result)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a result rendered where the state is refused', async () => {
    await pinRefused(standalone().rehearsal);

    // N3's defect exactly: the refusal's own words offered in the result's place, as a paraphrase
    // of a result the tool never returned.
    const mutant = standalone(
      mutate(
        '        state: REFUSED,\n        tool: tool,\n        result: null,',
        '        state: REFUSED,\n        tool: tool,\n        result: invocation.reason,',
      ),
    ).rehearsal;
    const reading = await read(
      mutant,
      pageWith([descriptor('search-products', 'Search the catalogue.')]).source,
    );
    const paraphrased = join(mutant, reading, 'search-products', {
      resolved: false,
      reason: 'TypeError: the tool answered an error',
    });
    assert.equal(
      paraphrased.result,
      'TypeError: the tool answered an error',
      'the mutant offers the refusal as though it were a result',
    );

    const failure = await reddens(() => pinRefused(mutant), 'the refusal pin');
    assert.match(
      failure.message,
      /SC2 refused-renders-no-result/,
      `the refused-result mutant must redden the refusal pin by name: ${failure.message}`,
    );
    console.log(
      `webmcp-rehearsal M7 (a result rendered where the state is refused) -> result ${JSON.stringify(paraphrased.result)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a model turn invented where none was made', async () => {
    await pinNoTool(standalone().rehearsal);

    const mutant = standalone(
      mutate(
        "    if (typeof chosen !== 'string' || chosen === '') return null;",
        "    if (typeof chosen !== 'string' || chosen === '') chosen = 'search-products';",
      ),
    ).rehearsal;
    const reading = await read(
      mutant,
      pageWith([descriptor('search-products', 'Search the catalogue.')]).source,
    );
    const invented = join(mutant, reading, null, null);
    assert.deepEqual(
      invented.tool,
      { name: 'search-products', description: 'Search the catalogue.' },
      'the mutant names a tool nobody chose, out of a turn nobody made',
    );

    const failure = await reddens(() => pinNoTool(mutant), 'the no-choice pin');
    assert.match(
      failure.message,
      /SC2 no-tool-when-no-tool-was-chosen/,
      `the invented-turn mutant must redden the no-choice pin by name: ${failure.message}`,
    );
    console.log(
      `webmcp-rehearsal M8 (a model turn invented) -> tool ${JSON.stringify(invented.tool)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a re-registration used to make a tool observable', async () => {
    await pinSameRecordSameAnswer(standalone().rehearsal);

    const mutant = standalone(
      mutate(
        '    let resolved;\n    try {',
        '    try {\n' +
          "      context.registerTool({ name: 'm053-rehearsal-probe', execute() {} });\n" +
          '    } catch {\n' +
          '      // a page that refuses the registration is read as it is\n' +
          '    }\n' +
          '    let resolved;\n' +
          '    try {',
      ),
    ).rehearsal;
    const page = pageWith([]);
    await read(mutant, page.source);
    assert.equal(
      page.registered.length,
      1,
      'the mutant registers a tool to make one observable',
    );

    const failure = await reddens(
      () => pinSameRecordSameAnswer(mutant),
      'the no-registration pin',
    );
    assert.match(
      failure.message,
      /SC3 no-registration-to-observe/,
      `the registration mutant must redden the no-registration pin by name: ${failure.message}`,
    );
    console.log(
      `webmcp-rehearsal M9 (a re-registration makes a tool observable) -> registered ${page.registered.length}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a network call inside the join', async () => {
    await pinPoisonedGlobals();

    const mutant = mutate(
      '  function rehearse(reading, chosen, invocation) {',
      "  function rehearse(reading, chosen, invocation) {\n    fetch('https://example.test/m053-rehearsal');",
    );
    const failure = await reddens(
      () => pinPoisonedGlobals(mutant),
      'the poisoned-globals pin',
    );
    assert.match(
      failure.message,
      /SC3 poisoned-globals-change-nothing.*reached for fetch/,
      `the network mutant must redden the poisoned-globals pin by name: ${failure.message}`,
    );
    console.log(
      `webmcp-rehearsal M10 (a network call inside the join) -> reddened: ${failure.message.split('\n')[0]}`,
    );
  });
});
