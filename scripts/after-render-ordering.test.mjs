// Tests for extension/after-render.js — the join between one read and the profiler after-render
// events the page agent already records.
//
// The module is evaluated in a bare `node:vm` context: no `document`, no `window`, no layout. Every
// case below executes that module and asserts on what it returns, so nothing here stands in for
// behaviour by scanning a source file.
//
//   E1 — a read with events around it yields `ordered`, the phase the read ran in, and the events
//        before it and after it in emission order. The order pin is the list's own order: the
//        reverse mutation (M1) has to redden it.
//   E2 — with the extension's subscriber removed from the recording there is no list, and the module
//        produces no `ordered` result: nothing else supplied the events, and the module invents none.
//   E3 — an empty event list yields `cannot-tell` naming `no-after-render-event`, and no string in
//        the result mentions layout, a cause, reflow or "before layout". The layout-attribution
//        mutation (M3) has to redden that pin.
//
// The mutants are applied to an in-memory copy of the module's source, one change each, and the
// module on disk is never written: every mutant case reloads the untouched module afterwards and
// shows the pin passing again.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { describe, it } from 'node:test';

const SRC = readFileSync(
  new URL('../extension/after-render.js', import.meta.url),
  'utf8',
);

/**
 * The module in a bare context: nothing in the world but the source. A module that reached for
 * `document`, `window` or an import would throw here rather than pass.
 */
function loadBare(source = SRC) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiAfterRender;
  assert.ok(
    api,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  return { api, context };
}

/**
 * The module in a world that has the page's profiler hook in it, with a tap counter on the hook:
 * loading and using the module must never install a subscriber of its own (N1).
 */
function loadWithProfilerProbe() {
  const taps = [];
  const ng = {
    ɵsetProfiler(subscriber) {
      taps.push(subscriber);
      return () => {};
    },
  };
  const context = createContext({ ng });
  runInContext(SRC, context);
  return { api: context.angularAiAfterRender, context, taps };
}

/**
 * A value built inside the vm context carries that context's prototypes, so it is copied into this
 * realm before a structural assertion reads it.
 */
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

// The recorded list the page agent produces for one change-detection cycle, in emission order, with
// the four enum values agent-main.js hard-codes: TemplateUpdateStart 2, OutputStart 6, OutputEnd 7,
// TemplateUpdateEnd 3.
const RECORDED = [{ type: 2 }, { type: 6 }, { type: 7 }, { type: 3 }];

// The read the fixture makes: `offsetWidth` inside an output listener, before the template update
// ends, and it saw no box. `at` is the position in the list at which the read happened.
const READ_INSIDE_OUTPUT = { at: 2, width: 0 };

// The same list read from inside the template update instead, which is a different phase.
const READ_INSIDE_TEMPLATE_UPDATE = { at: 1, width: 0 };

/** E1's pin, as a function so a mutant can be run through the very assertion E1 makes. */
function assertOrdering(result) {
  assert.equal(
    result.state,
    'ordered',
    'a read with events around it must be ordered',
  );
  assert.deepEqual(
    result.read,
    { at: 2, width: 0 },
    'the result must carry the read it joined',
  );
  assert.equal(
    result.phase,
    'output',
    'the read interrupted an output event, so it ran in `output`',
  );
  assert.deepEqual(
    result.before.map((entry) => entry.type),
    [2, 6],
    'the events before the read must stay in emission order',
  );
  assert.deepEqual(
    result.after.map((entry) => entry.type),
    [7, 3],
    'the events after the read must stay in emission order, never re-sorted by another key',
  );
  assert.deepEqual(
    result.after.map((entry) => entry.ordinal),
    [2, 3],
    'each after-render event must keep the position it was recorded at',
  );
}

/** E3's pin, as a function so the layout-attribution mutant is run through the same assertion. */
function assertCannotTell(result) {
  assert.equal(
    result.state,
    'cannot-tell',
    'a list with no after-render event for the read must not be ordered',
  );
  assert.equal(
    result.reason,
    'no-after-render-event',
    'the cannot-tell state must name the absence it found',
  );
  const text = JSON.stringify(result).toLowerCase();
  for (const word of ['layout', 'cause', 'reflow', 'before layout']) {
    assert.ok(
      !text.includes(word),
      `the cannot-tell result must not say "${word}": ${JSON.stringify(result)}`,
    );
  }
  assert.deepEqual(
    Object.keys(result).sort(),
    ['reason', 'state'],
    'the absence result carries the state and the absence, and nothing that reads as a cause',
  );
}

describe('extension/after-render.js is a pure module', () => {
  it('loads in a context with no DOM, no window and no profiler hook', () => {
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
      context.getComputedStyle,
      undefined,
      'the module must not measure anything',
    );
    assert.equal(
      typeof api.order,
      'function',
      'the module must export the join',
    );
    assert.equal(
      api.NO_AFTER_RENDER_EVENT,
      'no-after-render-event',
      'the absence must be a constant a caller compares, not prose',
    );
  });

  it("installs no subscriber of its own, even with the page's ɵsetProfiler in reach (N1)", () => {
    const { api, taps } = loadWithProfilerProbe();
    assert.equal(
      taps.length,
      0,
      'loading the module must not install a profiler subscriber',
    );
    host(api.order(READ_INSIDE_OUTPUT, RECORDED));
    assert.equal(
      taps.length,
      0,
      'joining a read must not install a profiler subscriber',
    );
  });
});

describe('E1 — a read with events around it', () => {
  it('names the phase the read ran in and keeps the events before and after it in emission order', () => {
    const { api } = loadBare();
    assertOrdering(host(api.order(READ_INSIDE_OUTPUT, RECORDED)));
  });

  it("reports the read's zero as the read's value, and claims no cause for it", () => {
    const { api } = loadBare();
    const result = host(api.order(READ_INSIDE_OUTPUT, RECORDED));
    assert.equal(
      result.read.width,
      0,
      "the zero width is the read's value and is carried through",
    );
    assert.deepEqual(
      Object.keys(result).sort(),
      ['after', 'before', 'phase', 'read', 'state'],
      'the ordered result states the order; a cause would be a field the observation cannot fill',
    );
    const text = JSON.stringify(result).toLowerCase();
    for (const word of ['layout', 'cause', 'reflow']) {
      assert.ok(
        !text.includes(word),
        `the ordered result must not say "${word}": ${text}`,
      );
    }
  });

  it('takes the phase from the event the read interrupted, not from a constant', () => {
    const { api } = loadBare();
    const insideOutput = host(api.order(READ_INSIDE_OUTPUT, RECORDED));
    const insideTemplateUpdate = host(
      api.order(READ_INSIDE_TEMPLATE_UPDATE, RECORDED),
    );
    assert.equal(insideOutput.phase, 'output');
    assert.equal(
      insideTemplateUpdate.phase,
      'template-update',
      'a read inside the template update must be reported in that phase',
    );
    assert.notEqual(
      insideOutput.phase,
      insideTemplateUpdate.phase,
      'the phase must follow the recorded events rather than be one hard-coded answer',
    );
    assert.deepEqual(
      insideTemplateUpdate.after.map((entry) => entry.type),
      [6, 7, 3],
    );
  });

  it("honours an event's own phase and ordinal when the recorder supplied them", () => {
    const { api } = loadBare();
    const recorded = [
      { type: 2, at: 0 },
      { type: 6, phase: 'after-render' },
      { type: 7 },
    ];
    const result = host(api.order({ at: 2, width: 0 }, recorded));
    assert.equal(result.state, 'ordered');
    assert.deepEqual(
      result.before.map((entry) => entry.phase),
      ['template-update', 'after-render'],
      "an event's own phase must win over the phase its type implies",
    );
    assert.equal(
      result.phase,
      'after-render',
      'the read ran in the phase of the event before it',
    );
    assert.deepEqual(
      result.after.map((entry) => entry.ordinal),
      [2],
      'an ordinal falls back to the index',
    );
  });
});

/**
 * What the page agent records, in the lines that matter: one `ɵsetProfiler` subscriber is the only
 * writer, and it pushes each event it receives into the list in emission order (`agent-main.js`
 * `onEvent`). `withSubscriber: false` is the agent with its subscriber removed: `setProfiler` is
 * still on the page, nothing subscribes, and Angular's emissions reach no list at all.
 */
function recordProfilerEvents(withSubscriber) {
  const events = [];
  const listeners = [];
  const ng = {
    ɵsetProfiler(onEvent) {
      listeners.push(onEvent);
      return () => {};
    },
  };

  if (withSubscriber) {
    ng.ɵsetProfiler((event) => {
      events.push({ type: event });
    });
  }

  for (const type of [2, 6, 7, 3]) {
    for (const onEvent of listeners) onEvent(type);
  }
  return events;
}

describe('E2 — the module cannot invent events', () => {
  it("produces no ordered result when the extension's subscriber is not in the recording", () => {
    const { api } = loadBare();
    const withSubscriber = recordProfilerEvents(true);
    const withoutSubscriber = recordProfilerEvents(false);
    assert.deepEqual(
      withSubscriber.map((event) => event.type),
      [2, 6, 7, 3],
      'the subscriber must be what records the four events',
    );
    assert.deepEqual(
      withoutSubscriber,
      [],
      'with the subscriber removed nothing else records an event, so the list is empty',
    );

    const joined = host(api.order(READ_INSIDE_OUTPUT, withSubscriber));
    assert.equal(
      joined.state,
      'ordered',
      'the recorded list must yield the ordered result',
    );

    const absent = host(api.order(READ_INSIDE_OUTPUT, withoutSubscriber));
    assert.notEqual(
      absent.state,
      'ordered',
      'with no subscriber there is no finding to order',
    );
    assert.equal(
      absent.state,
      'cannot-tell',
      'the absence is the honest answer',
    );
    assert.equal(absent.reason, 'no-after-render-event');
  });

  it('reports only events already in the recorded list, and leaves that list unchanged', () => {
    const { api } = loadBare();
    const recorded = recordProfilerEvents(true);
    const snapshot = JSON.parse(JSON.stringify(recorded));
    const result = host(api.order(READ_INSIDE_OUTPUT, recorded));

    for (const entry of [...result.before, ...result.after]) {
      assert.equal(
        recorded[entry.ordinal].type,
        entry.type,
        'every reported event must be an event that was recorded',
      );
    }
    assert.equal(result.before.length + result.after.length, recorded.length);
    assert.deepEqual(
      recorded,
      snapshot,
      'joining a read must not write to the recorded list',
    );

    // Removing the events the subscriber recorded removes the whole list, and the join then has
    // nothing to report — the same answer as never having recorded them.
    const subscriberRecorded = new Set(recorded);
    const afterRemoval = recorded.filter(
      (event) => !subscriberRecorded.has(event),
    );
    assert.deepEqual(afterRemoval, []);
    assert.equal(
      host(api.order(READ_INSIDE_OUTPUT, afterRemoval)).state,
      'cannot-tell',
    );
  });
});

describe('E3 — no after-render event for the read', () => {
  it('yields cannot-tell naming the absence, and never a layout attribution', () => {
    const { api } = loadBare();
    assertCannotTell(host(api.order({ at: 0, width: 0 }, [])));
  });

  it('also yields cannot-tell when every recorded event precedes the read', () => {
    const { api } = loadBare();
    const result = host(api.order({ at: 4, width: 0 }, RECORDED));
    assert.equal(
      result.state,
      'cannot-tell',
      'the read follows the last event, so nothing is after it',
    );
    assert.equal(result.reason, 'no-after-render-event');
  });

  it('yields cannot-tell for a read with no position in the list, rather than ordering it', () => {
    const { api } = loadBare();
    assertCannotTell(host(api.order({ width: 0 }, RECORDED)));
    assertCannotTell(host(api.order(undefined, RECORDED)));
    assertCannotTell(host(api.order({ at: 2, width: 0 }, undefined)));
  });
});

describe('an event the module does not recognise', () => {
  it('yields unknown with the event it could not place', () => {
    const { api } = loadBare();
    const result = host(
      api.order({ at: 1, width: 0 }, [{ type: 2 }, { type: 42 }, { type: 7 }]),
    );
    assert.deepEqual(result, { state: 'unknown', event: { type: 42 } });
    assert.equal(
      result.state,
      'unknown',
      'an event outside the enum cannot be placed or skipped',
    );
  });

  it('yields unknown for a type that is a name, and for an entry that is not an event', () => {
    const { api } = loadBare();
    const named = host(
      api.order({ at: 0, width: 0 }, [{ type: 'OutputStart' }, { type: 7 }]),
    );
    assert.deepEqual(named, {
      state: 'unknown',
      event: { type: 'OutputStart' },
    });
    const empty = host(api.order({ at: 1, width: 0 }, [null, { type: 7 }]));
    assert.deepEqual(empty, { state: 'unknown', event: null });
  });
});

// The pieces of the module the mutants rewrite. Each appears once in the source, and each mutant
// changes exactly one of them, so the failing pin names the property that was broken.
const ORDERED_RETURN =
  'return { state: ORDERED, read: readCopy, phase: readPhase, before: before, after: after };';
const CANNOT_TELL_RETURN =
  'return { state: CANNOT_TELL, reason: NO_AFTER_RENDER_EVENT };';

describe('mutants — each applied to a copy, then the module restored', () => {
  it('M1: reversing `after` reddens the emission-order pin (E1)', (t) => {
    const api = mutant(
      ORDERED_RETURN,
      ORDERED_RETURN.replace('after: after', 'after: after.slice().reverse()'),
    );
    const result = host(api.order(READ_INSIDE_OUTPUT, RECORDED));
    assert.notDeepEqual(
      result.after.map((entry) => entry.type),
      [7, 3],
      'the reversal must actually change the order the module reports',
    );
    const failure = reddens(() => assertOrdering(result), 'reversing `after`');
    t.diagnostic(`M1 reddens E1: ${failure.message.split('\n')[0]}`);

    // The file on disk was never written, so reloading it restores the pin.
    assertOrdering(host(loadBare().api.order(READ_INSIDE_OUTPUT, RECORDED)));
  });

  it('M2: dropping the phase reddens the phase pin (E1)', (t) => {
    const api = mutant('phase: readPhase, ', '');
    const result = host(api.order(READ_INSIDE_OUTPUT, RECORDED));
    assert.equal(
      result.phase,
      undefined,
      'the mutant must report no phase at all',
    );
    const failure = reddens(() => assertOrdering(result), 'dropping the phase');
    t.diagnostic(`M2 reddens E1: ${failure.message.split('\n')[0]}`);

    assert.equal(
      host(loadBare().api.order(READ_INSIDE_OUTPUT, RECORDED)).phase,
      'output',
    );
  });

  it('M3: attributing the empty case to layout reddens the absence pin (E3)', (t) => {
    // The mutant is written into the one place the absence is produced, so every way of reaching
    // cannot-tell becomes the attribution E3 forbids.
    const api = mutant(
      CANNOT_TELL_RETURN,
      'return { state: ORDERED, read: copyOfRead(null), phase: "before layout", before: [], after: [] };',
    );
    const result = host(api.order({ at: 0, width: 0 }, []));
    assert.match(
      JSON.stringify(result),
      /before layout/,
      'the mutant must attribute the empty case to layout, or it is not the mutation E3 exists to catch',
    );
    const failure = reddens(
      () => assertCannotTell(result),
      'attributing the empty case to layout',
    );
    t.diagnostic(`M3 reddens E3: ${failure.message.split('\n')[0]}`);

    assertCannotTell(host(loadBare().api.order({ at: 0, width: 0 }, [])));
  });
});
