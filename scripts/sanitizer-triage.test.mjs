// Tests for extension/sanitizer-triage.js — the join between a sanitizer strip warning and the
// profiler record that covers it.
//
// The module is evaluated in a bare `node:vm` context: no `document`, no `window`, no layout, and no
// `console` unless a probe supplies one. Every case below executes that module and asserts on what it
// returns, so nothing here stands in for behaviour by scanning a source file.
//
// The inputs are T001's real recording (`research/raw/m029-sanitizer-warning.json`), not a hand-built
// list: the warnings come from the recording's page-clock tap and the records from the page agent's
// own list. The suite first pins the measurement it is joining against, so a recording that changed
// shape reddens here instead of quietly making the join look right:
//
//   - the strip warning fires at page-clock 1401 ms, the profiler subscription lands at 1426.7 ms, so
//     the first render's strip has no profiler record at all;
//   - the later write shares cycle 2's window, and that record names two components with events [2,3]
//     and carries no binding and no element.
//
//   E1 — a warning inside a record's window yields `stripped` with the component(s) the record names
//        and the warning's own time; a binding is named only when the covering record carries one, and
//        the measured record carries none (naming a stripped tag, M1, and naming an uncarried binding,
//        M4, must each redden it).
//   E2 — with the console capture removed there is no warning list, so no finding is produced: nothing
//        else supplied the occurrence, and the module installs no reader of its own (N1).
//   E3 — a first-render warning with no profiler record yields `cannot-tell` naming that absence and
//        never a component or a binding; the nearest component across the window boundary (M2) must
//        redden it.
//
// The absence of a warning is a fourth pin, not a state of its own: `none` is the absence of a
// capture, never a clean page (N3), so reporting it as clean (M3) must redden.
//
// The mutants are applied to an in-memory copy of the module's source, one change each, and the module
// on disk is never written: every mutant case reloads the untouched module afterwards and shows the pin
// passing again.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { describe, it } from 'node:test';

const SRC = readFileSync(
  new URL('../extension/sanitizer-triage.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m029-sanitizer-warning.json', import.meta.url),
    'utf8',
  ),
);

// The sanitizer's one signal, matched exactly as T001's capture matched it. Matching it here is how the
// warnings are picked out of the recorded list; the module itself is given the warnings and never reads
// the message text (N1).
const SANITIZER_WARNING = /WARNING: sanitizing HTML stripped some content/;

/** The recorded strip warnings, on the page clock — the clock the profiler records use. */
const WARNINGS = RECORDING.pageTap.messages.filter(
  (message) => message.type === 'warn' && SANITIZER_WARNING.test(message.text),
);

/** The profiler records the page agent dispatched in the same page load. */
const RECORDS = RECORDING.profiler.records;

/** The component names the covering record names, read from the recording rather than written here. */
const COVERING_RECORD = RECORDS[1];
const COVERING_COMPONENTS = COVERING_RECORD.checks.map(
  (check) => check.componentName,
);

/**
 * The module in a bare context: nothing in the world but the source. A module that reached for
 * `document`, `window`, `performance` or an import would throw here rather than pass.
 */
function loadBare(source = SRC) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiSanitizerTriage;
  assert.ok(
    api,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  return { api, context };
}

/**
 * The module in a world that has a console, the page's profiler hook and a clock of its own, each with a
 * tap counter: loading and using the module must install no reader of its own (N1).
 */
function loadWithProbes() {
  const calls = [];
  const spy =
    (name) =>
    (...args) => {
      calls.push({ name: name, args: args.length });
    };
  const consoleProbe = {
    log: spy('console.log'),
    warn: spy('console.warn'),
    error: spy('console.error'),
    info: spy('console.info'),
    debug: spy('console.debug'),
  };
  const ng = {
    ɵsetProfiler: () => {
      calls.push({ name: 'ɵsetProfiler', args: 1 });
      return () => {};
    },
  };
  const performanceProbe = {
    now: () => {
      calls.push({ name: 'performance.now', args: 0 });
      return 0;
    },
  };
  const context = createContext({
    console: consoleProbe,
    ng: ng,
    performance: performanceProbe,
  });
  runInContext(SRC, context);
  return { api: context.angularAiSanitizerTriage, context, calls };
}

/**
 * A value built inside the vm context carries that context's prototypes, so it is copied into this
 * realm before a structural assertion reads it.
 */
function host(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * A mutant: one textual change to an in-memory copy of the module. The anchor must change the source,
 * or the mutation would be vacuous and the case would prove nothing.
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

/** The failure a pin raises on a mutant; a failing assertion when the mutant slips past it. */
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
  return failure;
}

/**
 * The console tap as the capture installs it: one entry per sanitizer warning the page emitted, on the
 * page clock. `withTap: false` is the tap removed — the page still warns, but the warning reaches no
 * list, which is the capture boundary E2 is about.
 */
function recordWarnings(withTap) {
  const list = [];
  for (const message of RECORDING.pageTap.messages) {
    if (!SANITIZER_WARNING.test(message.text)) continue;
    if (withTap) list.push({ t: message.t, type: message.type });
  }
  return list;
}

/**
 * The words a finding may never use: what was stripped (a tag, an attribute, a substring of the removed
 * markup), and why (a cause). The state value `stripped` is the one word about stripping the brief
 * requires, and it names nothing that was removed. A `binding` is dropped before the scan: when the
 * module names one it is the record's own word for the element it wrote, not the module's word for what
 * the sanitizer removed (N2).
 */
const FORBIDDEN = [
  'script',
  'innerhtml',
  'onerror',
  'javascript:',
  '<',
  '>',
  'tag',
  'attribute',
  'substring',
  'removed',
  'sanitiz',
  'cause',
  'because',
  'warning',
];

/** Every string a finding states, lowercased, with the record's own binding names dropped. */
function stated(value) {
  const text = JSON.stringify(host(value), (key, entry) =>
    key === 'binding' ? undefined : entry,
  );
  return text.toLowerCase();
}

/** The prohibition itself, as one assertion every state is run through (N2, N3). */
function assertNamesNothing(value, what) {
  const text = stated(value);
  for (const word of FORBIDDEN) {
    assert.ok(
      !text.includes(word),
      `${what} must not say "${word}": the warning names nothing, so the finding names nothing it did not observe — ${text}`,
    );
  }
}

/** E1's pin, as a function so a mutant can be run through the very assertion E1 makes. */
function assertStrippedFinding(finding, expected) {
  assert.equal(
    finding.state,
    'stripped',
    "a warning inside a record's window must be placed",
  );
  assert.equal(
    finding.at,
    expected.at,
    "the finding must carry the warning's own time",
  );
  assert.deepEqual(
    finding.components,
    expected.components,
    "the finding must name the component(s) the covering record names, in the record's order",
  );
  assert.deepEqual(
    finding.cycleIds,
    expected.cycleIds,
    'the finding must name the cycle whose window covered the warning',
  );
  assert.ok(
    !('binding' in finding),
    "the measured record carries no binding, so the finding must name none (a binding is named only when the element's record carries it)",
  );
  assertNamesNothing(finding, 'the stripped finding');
  assert.deepEqual(
    Object.keys(finding).sort(),
    ['at', 'components', 'cycleIds', 'state'],
    "the stripped finding states the record's own facts and nothing else",
  );
}

/** E3's pin, as a function so the nearest-component mutant is run through the same assertion. */
function assertCannotTell(finding, expectedAt) {
  assert.equal(
    finding.state,
    'cannot-tell',
    'a warning no record covers must not be placed against a nearby component',
  );
  assert.equal(
    finding.at,
    expectedAt,
    "the absence carries the warning's own time — the one thing that was observed",
  );
  assert.equal(
    finding.reason,
    'no-covering-profiler-record',
    'the cannot-tell state must name the absence it found',
  );
  assert.ok(
    !('components' in finding),
    'the absence must name no component: a component that merely ran nearby did not write the element',
  );
  assert.ok(!('binding' in finding), 'the absence must name no binding');
  assertNamesNothing(finding, 'the cannot-tell finding');
  assert.deepEqual(
    Object.keys(finding).sort(),
    ['at', 'reason', 'state'],
    'the absence states the absence, and nothing that reads as an attribution or a cause',
  );
}

/** The absence-of-a-warning pin: `none` is the absence of a capture, never a clean page (N3). */
function assertAbsenceIsNotClean(result) {
  assert.equal(
    result.state,
    'none',
    'a load with no warning is the `none` state and no other',
  );
  assert.deepEqual(result.findings, [], 'the `none` state carries no finding');
  assert.notEqual(
    result.state,
    'stripped',
    'no warning must never be reported as a strip',
  );
  assert.notEqual(
    result.state,
    'cannot-tell',
    'no warning at all is a different absence than no record',
  );
  const text = JSON.stringify(host(result)).toLowerCase();
  for (const word of [
    'clean',
    'safe',
    'ok',
    'fine',
    'nothing',
    'passed',
    'unaffected',
  ]) {
    assert.ok(
      !text.includes(word),
      `the absence must not be reported as "${word}": a dev-mode warning that did not appear is not proof that nothing was stripped (N3)`,
    );
  }
  assert.deepEqual(
    Object.keys(result).sort(),
    ['findings', 'state'],
    'the absence result carries the state and the findings, and no claim about the page',
  );
}

describe('the measurement the join is built to', () => {
  it("is T001's recording of one page load: two warnings, two records, one of each joined", () => {
    assert.equal(
      RECORDING.fixture.pageLoads,
      1,
      'the recording must describe one page load',
    );
    assert.equal(
      WARNINGS.length,
      2,
      "the fixture's two stripped writes must have warned twice",
    );
    assert.equal(
      RECORDS.length,
      2,
      'the page agent dispatched two records in that load',
    );
    assert.equal(
      RECORDING.console.messages.filter((message) =>
        SANITIZER_WARNING.test(message.text),
      ).length,
      2,
      "the browser's own console list must carry the same two warnings",
    );
  });

  it('records a first-render strip with no profiler record, because the subscription landed after it', () => {
    assert.equal(
      WARNINGS[0].t,
      RECORDING.ordering.occurrences[0].warningTapTime,
    );
    assert.equal(RECORDING.ordering.occurrences[0].coveringRecord, null);
    assert.equal(
      RECORDING.contains.ordering.firstWritePrecededTheSubscription,
      true,
    );
    assert.ok(
      WARNINGS[0].t < RECORDING.profiler.installedAt,
      `the first warning (${WARNINGS[0].t}) must precede the subscription (${RECORDING.profiler.installedAt})`,
    );
    assert.deepEqual(
      RECORDS[0].checks.map((check) => check.events),
      [[]],
      "the load's first record carries no template-update events and covers nothing",
    );
  });

  it('records a later strip sharing a cycle whose record names components and no binding', () => {
    assert.equal(RECORDING.ordering.occurrences[1].coveringRecord, 1);
    assert.deepEqual(
      COVERING_COMPONENTS,
      ['app-root', 'app-trust-bypass-page'],
      'the covering record must name the two components T001 recorded',
    );
    for (const check of COVERING_RECORD.checks) {
      assert.deepEqual(
        check.events,
        [2, 3],
        'each named component carries the template-update pair',
      );
    }
    assert.equal(
      RECORDING.contains.profiler.namesTheBinding,
      false,
      'the record names no binding',
    );
    assert.equal(
      RECORDING.contains.profiler.identifiesTheWrittenElement,
      false,
      'the record identifies no element',
    );
    assert.ok(
      RECORDING.ordering.occurrences[1].warningTapTime >=
        COVERING_RECORD.startedAt &&
        RECORDING.ordering.occurrences[1].warningTapTime <= COVERING_RECORD.t,
      `the later warning (${RECORDING.ordering.occurrences[1].warningTapTime}) must fall inside the covering window [${COVERING_RECORD.startedAt}, ${COVERING_RECORD.t}]`,
    );
  });
});

describe('extension/sanitizer-triage.js is a pure module', () => {
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
      'the module must not read a clock of its own',
    );
    assert.equal(
      context.console,
      undefined,
      'the module must not read the console itself',
    );
    assert.equal(
      typeof api.join,
      'function',
      'the module must export the join',
    );
    assert.equal(
      typeof api.covers,
      'function',
      'the module must export the window predicate',
    );
    assert.equal(
      api.NO_COVERING_RECORD,
      'no-covering-profiler-record',
      'the absence must be a constant a caller compares, not prose',
    );
    assert.equal(
      api.TEMPLATE_UPDATE_START,
      2,
      "the template-update pair is the recorded enum's",
    );
    assert.equal(
      api.TEMPLATE_UPDATE_END,
      3,
      "the template-update pair is the recorded enum's",
    );
  });

  it('installs no console reader, no profiler subscriber and no clock, even with all three in reach (N1)', () => {
    const { api, calls } = loadWithProbes();
    assert.deepEqual(
      calls,
      [],
      'loading the module must install nothing and read nothing',
    );
    host(api.join(WARNINGS, RECORDS));
    host(api.join([WARNINGS[0]], RECORDS));
    host(api.join([], RECORDS));
    assert.deepEqual(
      calls,
      [],
      'joining must not read the console, subscribe to the profiler or read the clock: the lists are the whole input (N1)',
    );
  });

  it('leaves both lists exactly as it received them', () => {
    const warnings = host(WARNINGS);
    const records = host(RECORDS);
    const warningsBefore = JSON.stringify(warnings);
    const recordsBefore = JSON.stringify(records);
    const { api } = loadBare();
    host(api.join(warnings, records));
    assert.equal(
      JSON.stringify(warnings),
      warningsBefore,
      'joining must not write to the warning list',
    );
    assert.equal(
      JSON.stringify(records),
      recordsBefore,
      'joining must not write to the record list',
    );
  });
});

describe("E1 — a warning inside a profiler record's window", () => {
  it("names the component(s) the record names and the warning's time, and no binding", () => {
    const { api } = loadBare();
    const result = host(api.join(WARNINGS, RECORDS));
    assert.equal(
      result.state,
      'stripped',
      'the load holds a placed strip, so it is `stripped`',
    );
    assert.equal(
      result.findings.length,
      WARNINGS.length,
      'one finding per warning, in the recorded order',
    );
    assertStrippedFinding(result.findings[1], {
      at: RECORDING.ordering.occurrences[1].warningTapTime,
      components: COVERING_COMPONENTS,
      cycleIds: [RECORDING.ordering.occurrences[1].coveringCycleId],
    });
  });

  it("agrees with the recording's own occurrences, joined and unjoined", () => {
    const { api } = loadBare();
    const result = host(api.join(WARNINGS, RECORDS));
    const occurrences = RECORDING.ordering.occurrences;
    for (const [index, occurrence] of occurrences.entries()) {
      if (occurrence.coveringRecord === null) {
        assertCannotTell(result.findings[index], occurrence.warningTapTime);
      } else {
        assertStrippedFinding(result.findings[index], {
          at: occurrence.warningTapTime,
          components: RECORDS[occurrence.coveringRecord].checks.map(
            (check) => check.componentName,
          ),
          cycleIds: [occurrence.coveringCycleId],
        });
      }
    }
  });

  it('names a binding only when the covering record carries one for the element it wrote', () => {
    const { api } = loadBare();
    // A record that carries one unambiguous binding: the finding names it.
    const carried = host(RECORDS).map((record) => ({
      ...record,
      checks: record.checks.map((check) => ({
        ...check,
        binding: '[innerHTML]',
      })),
    }));
    const named = host(api.join([WARNINGS[1]], carried));
    assert.equal(named.findings[0].state, 'stripped');
    assert.equal(
      named.findings[0].binding,
      '[innerHTML]',
      "a binding the element's own record carries must be named",
    );

    // A record that names two different bindings has not said which one wrote the element: naming
    // either would be a guess, so the finding names none (N2).
    const ambiguous = host(RECORDS).map((record) => ({
      ...record,
      checks: record.checks.map((check, index) => ({
        ...check,
        binding: index === 0 ? '[innerHTML]' : '[innerText]',
      })),
    }));
    const unnamed = host(api.join([WARNINGS[1]], ambiguous)).findings[0];
    assert.equal(unnamed.state, 'stripped');
    assert.ok(
      !('binding' in unnamed),
      'two candidate bindings are not one attribution: the finding must name none rather than pick one',
    );
    assert.deepEqual(
      unnamed.components,
      COVERING_COMPONENTS,
      'the components are still named',
    );
  });

  it('places a warning exactly on each edge of the window, and refuses the millisecond outside', () => {
    const { api } = loadBare();
    const start = COVERING_RECORD.startedAt;
    const end = COVERING_RECORD.t;

    for (const at of [start, end]) {
      const finding = host(api.join([{ t: at }], RECORDS)).findings[0];
      assertStrippedFinding(finding, {
        at: at,
        components: COVERING_COMPONENTS,
        cycleIds: [COVERING_RECORD.cycleId],
      });
    }
    for (const at of [start - 1, end + 1]) {
      const finding = host(api.join([{ t: at }], RECORDS)).findings[0];
      assertCannotTell(finding, at);
    }
  });

  it('exposes the window predicate the join uses, and it answers the measured records', () => {
    const { api } = loadBare();
    assert.equal(
      api.covers(COVERING_RECORD, WARNINGS[1].t),
      true,
      'the measured covering record must cover the measured warning',
    );
    assert.equal(
      api.covers(RECORDS[0], (RECORDS[0].startedAt + RECORDS[0].t) / 2),
      false,
      'a record whose checks carry no template update covers nothing, however wide its window',
    );
    for (const at of [COVERING_RECORD.startedAt - 1, COVERING_RECORD.t + 1]) {
      assert.equal(
        api.covers(COVERING_RECORD, at),
        false,
        `no window covers ${at}`,
      );
    }
    assert.equal(
      api.covers(null, WARNINGS[1].t),
      false,
      'a record that is not one covers nothing',
    );
    assert.equal(
      api.covers({ cycleId: 9, startedAt: 100 }, 150),
      false,
      'a half-window covers nothing',
    );
  });
});

describe('E2 — the module cannot invent an occurrence', () => {
  it('produces no finding when the console capture is removed', () => {
    const { api } = loadBare();
    const withTap = recordWarnings(true);
    const withoutTap = recordWarnings(false);
    assert.equal(
      withTap.length,
      2,
      'the tap must be what records the two warnings',
    );
    assert.deepEqual(
      withoutTap,
      [],
      'with the tap removed nothing else records a warning, so the list is empty',
    );

    const captured = host(api.join(withTap, RECORDS));
    assert.equal(
      captured.state,
      'stripped',
      'the captured warnings must yield a placed strip',
    );

    const absent = host(api.join(withoutTap, RECORDS));
    assertAbsenceIsNotClean(absent);
  });

  it('produces no finding from the records alone', () => {
    const { api } = loadBare();
    // The records name a cycle that stripped nothing they know of: without a warning there is no
    // occurrence to join, whatever the records hold.
    for (const warnings of [[], undefined, null]) {
      assertAbsenceIsNotClean(host(api.join(warnings, RECORDS)));
    }
    assertAbsenceIsNotClean(host(api.join([], [])));
  });
});

describe('E3 — a warning with no profiler record covering it', () => {
  it('yields cannot-tell for the first-render strip, naming the absence and no component', () => {
    const { api } = loadBare();
    const result = host(api.join([WARNINGS[0]], RECORDS));
    assert.equal(
      result.state,
      'cannot-tell',
      "no record covers the first render's strip",
    );
    assert.equal(
      result.findings.length,
      1,
      'the first-render strip is one warning and one finding',
    );
    assertCannotTell(result.findings[0], WARNINGS[0].t);

    // Not one of the records' component names may appear anywhere in the answer — not `_App` from the
    // nearest record, not the covering cycle's components either.
    const text = JSON.stringify(result);
    for (const record of RECORDS) {
      for (const check of record.checks) {
        assert.ok(
          !text.includes(check.componentName),
          `the absence must not name ${check.componentName}: no record covers the warning`,
        );
      }
    }
  });

  it('yields cannot-tell when no record was dispatched at all', () => {
    const { api } = loadBare();
    const result = host(api.join(WARNINGS, []));
    assert.equal(
      result.state,
      'cannot-tell',
      'warnings with no record list are unjoined, not clean',
    );
    assert.equal(result.findings.length, WARNINGS.length);
    for (const [index, finding] of result.findings.entries()) {
      assertCannotTell(finding, WARNINGS[index].t);
    }
  });

  it('does not place a warning inside a window whose record carries no template update', () => {
    const { api } = loadBare();
    // A time squarely inside the load's first record, which carries `events: []`: the record exists and
    // its window contains the warning, and it is still not evidence that a template wrote anything.
    const at = (RECORDS[0].startedAt + RECORDS[0].t) / 2;
    assert.ok(
      at >= RECORDS[0].startedAt && at <= RECORDS[0].t,
      "the case must really be inside the first record's window",
    );
    assert.deepEqual(
      RECORDS[0].checks.map((check) => check.events),
      [[]],
      'the first record must carry no template-update events, or the case proves nothing',
    );
    assertCannotTell(host(api.join([{ t: at }], RECORDS)).findings[0], at);
  });

  it('yields cannot-tell for a warning with no page-clock time, rather than matching it by order', () => {
    const { api } = loadBare();
    for (const warning of [
      { type: 'warn' },
      { t: Number.NaN },
      { t: '1401' },
      null,
      1401,
      {},
    ]) {
      assertCannotTell(host(api.join([warning], RECORDS)).findings[0], null);
    }
  });
});

describe('N3 — the absence of a warning is not a clean page', () => {
  it('reports none with no finding and no claim about the page', () => {
    const { api } = loadBare();
    const result = host(api.join([], RECORDS));
    assertAbsenceIsNotClean(result);
    assert.deepEqual(result, { state: 'none', findings: [] });
  });

  it("never copies the warning's own text into an answer", () => {
    const { api } = loadBare();
    for (const result of [
      host(api.join(WARNINGS, RECORDS)),
      host(api.join([WARNINGS[0]], RECORDS)),
      host(api.join([], RECORDS)),
    ]) {
      const text = JSON.stringify(result);
      assert.ok(
        !text.includes('WARNING'),
        `no answer may echo the warning text: ${text}`,
      );
      assert.ok(
        !text.includes('angular.dev'),
        `no answer may echo the warning's link: ${text}`,
      );
    }
  });
});

// The pieces of the module the mutants rewrite. Each appears once in the source, and each mutant changes
// exactly one of them, so the failing pin names the property that was broken.
const STRIPPED_FINDING_INIT =
  'const finding = { state: STRIPPED, at: at, components: [], cycleIds: [] };';
const BINDING_LINE = 'if (binding !== null) finding.binding = binding;';
const ABSENCE_RETURN = 'return { state: NONE, findings: [] };';
const CANNOT_TELL_BRANCH = [
  '      if (covering.length === 0) {',
  '        findings.push(cannotTell(at));',
  '        continue;',
  '      }',
].join('\n');

describe('mutants — each applied to a copy, then the module restored', () => {
  it('M1: naming the stripped tag reddens the no-naming pin (E1, N2)', (t) => {
    const api = mutant(
      STRIPPED_FINDING_INIT,
      'const finding = { state: STRIPPED, at: at, components: [], cycleIds: [], strippedTag: "<script>" };',
    );
    const finding = host(api.join([WARNINGS[1]], RECORDS)).findings[0];
    assert.match(
      JSON.stringify(finding),
      /script/,
      'the mutant must name the tag the sanitizer removed, or it is not the mutation N2 exists to catch',
    );
    const failure = reddens(
      () =>
        assertStrippedFinding(finding, {
          at: WARNINGS[1].t,
          components: COVERING_COMPONENTS,
          cycleIds: [2],
        }),
      'naming the stripped tag',
    );
    t.diagnostic(`M1 reddens E1/N2: ${failure.message.split('\n')[0]}`);

    // The file on disk was never written, so reloading it restores the pin.
    assertStrippedFinding(
      host(loadBare().api.join([WARNINGS[1]], RECORDS)).findings[0],
      {
        at: WARNINGS[1].t,
        components: COVERING_COMPONENTS,
        cycleIds: [2],
      },
    );
  });

  it('M2: attributing the first-render warning to the nearest component reddens the absence pin (E3)', (t) => {
    const api = mutant(
      CANNOT_TELL_BRANCH,
      [
        '      if (covering.length === 0) {',
        '        const nearest = list.length > 0 ? [{ record: list[0], checks: list[0].checks }] : [];',
        '        findings.push(nearest.length > 0 ? strippedFinding(at, nearest) : cannotTell(at));',
        '        continue;',
        '      }',
      ].join('\n'),
    );
    const finding = host(api.join([WARNINGS[0]], RECORDS)).findings[0];
    assert.deepEqual(
      finding.components,
      [RECORDS[0].checks[0].componentName],
      "the mutant must borrow the nearest record's component across the window boundary",
    );
    const failure = reddens(
      () => assertCannotTell(finding, WARNINGS[0].t),
      'attributing the first-render warning to the nearest component',
    );
    t.diagnostic(`M2 reddens E3: ${failure.message.split('\n')[0]}`);

    assertCannotTell(
      host(loadBare().api.join([WARNINGS[0]], RECORDS)).findings[0],
      WARNINGS[0].t,
    );
  });

  it('M3: reporting the absence as clean reddens the not-clean pin (N3)', (t) => {
    const api = mutant(
      ABSENCE_RETURN,
      'return { state: NONE, findings: [], clean: true };',
    );
    const result = host(api.join([], RECORDS));
    assert.match(
      JSON.stringify(result),
      /clean/,
      'the mutant must claim the page is clean, or it is not the mutation N3 exists to catch',
    );
    const failure = reddens(
      () => assertAbsenceIsNotClean(result),
      'reporting the absence as clean',
    );
    t.diagnostic(`M3 reddens N3: ${failure.message.split('\n')[0]}`);

    assertAbsenceIsNotClean(host(loadBare().api.join([], RECORDS)));
  });

  it('M4: naming a binding the record does not carry reddens the no-guessed-binding pin (E1, N2)', (t) => {
    const api = mutant(
      BINDING_LINE,
      'finding.binding = binding !== null ? binding : "[innerHTML]";',
    );
    const finding = host(api.join([WARNINGS[1]], RECORDS)).findings[0];
    assert.equal(
      finding.binding,
      '[innerHTML]',
      'the mutant must name a binding the measured record does not carry',
    );
    const failure = reddens(
      () =>
        assertStrippedFinding(finding, {
          at: WARNINGS[1].t,
          components: COVERING_COMPONENTS,
          cycleIds: [2],
        }),
      'naming a binding the record does not carry',
    );
    t.diagnostic(`M4 reddens E1/N2: ${failure.message.split('\n')[0]}`);

    assert.ok(
      !(
        'binding' in
        host(loadBare().api.join([WARNINGS[1]], RECORDS)).findings[0]
      ),
      'reloading the untouched module must restore the pin',
    );
  });
});
