// Tests for apps/angular-ai-devtools/src/app/after-render.ts — the panel surface that renders the
// ordered after-render chain, or the state that names its absence (M028 T003; INTENT.md SC4,
// held-out E4).
//
// Run: node --test scripts/panel-after-render.test.mjs
//
// The chain every case renders is produced by the shipped ordering module, not by a fixture: the
// surface module from T002 runs in a bare `node:vm` context exactly as scripts/after-render-ordering.test.mjs
// runs it, and the object its `order()` returns is what the surface is handed. The surface itself
// is imported and executed, so nothing here stands in for behaviour by scanning a source file.
//
//   E4 — the surface renders the chain in emission order (the ordered state), and the cannot-tell
//        state when the chain is empty. An unplaceable event renders the unknown state rather than
//        throwing. No state's text names layout, a cause or a reflow.
//
// Three mutants, one per state, each applied to an in-memory copy of the surface's source:
//
//   M1  the rendered order is reversed        -> the emission-order pin must redden
//   M2  the cannot-tell pane is blanked       -> the absence pin must redden
//   M3  an unknown event throws               -> the unknown pin must redden
//
// The surface on disk is never written: each mutant is loaded from its own file in the OS temp
// directory (node strips the types of a `.ts` file wherever it lives), and the directory is removed
// when the suite ends. After each mutation the untouched module is loaded again and the same pin is
// shown passing, so a mutant that reddens proves the pin, not the loader.
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const ORDERING_SRC = readFileSync(
  new URL('../extension/after-render.js', import.meta.url),
  'utf8',
);
const SURFACE_URL = new URL(
  '../apps/angular-ai-devtools/src/app/after-render.ts',
  import.meta.url,
);
const SURFACE_SRC = readFileSync(SURFACE_URL, 'utf8');
const SURFACE = await import(SURFACE_URL.href);

/**
 * The ordering module in a bare context, joined to one read. Its result is the chain the surface
 * renders; a value built inside the vm context is copied into this realm before a structural
 * assertion reads it.
 */
function order(read, events) {
  const context = createContext({});
  runInContext(ORDERING_SRC, context);
  const joined = context.angularAiAfterRender.order(read, events);
  return JSON.parse(JSON.stringify(joined));
}

// The recorded list the page agent produces for one change-detection cycle, in emission order, with
// the four enum values agent-main.js hard-codes: TemplateUpdateStart 2, OutputStart 6, OutputEnd 7,
// TemplateUpdateEnd 3.
const RECORDED = [{ type: 2 }, { type: 6 }, { type: 7 }, { type: 3 }];

// The read the fixture makes: `offsetWidth` inside an output listener, before the template update
// ends, and it saw no box. `at` is the position in the list at which the read happened.
const READ_INSIDE_OUTPUT = { at: 2, width: 0 };

// A read the list carries no after-render event for: the ordering module's absence chain.
const EMPTY_CHAIN = { at: 0, width: 0 };

// A list with one event outside the recorded enum: the ordering module's unknown chain.
const WITH_UNREADABLE_EVENT = [{ type: 2 }, { type: 42 }, { type: 7 }];

/** The three chains, produced once, so every case renders what the shipped module returns. */
const ORDERED_CHAIN = order(READ_INSIDE_OUTPUT, RECORDED);
const CANNOT_TELL_CHAIN = order(EMPTY_CHAIN, []);
const UNKNOWN_CHAIN = order({ at: 1, width: 0 }, WITH_UNREADABLE_EVENT);

/** The wording no state may carry: a cause is what the chain did not observe (N2, N4). */
const UNSUPPORTED_WORDS = ['layout', 'cause', 'reflow'];

/** The one wording the absence state must carry, so a blank pane cannot pass as it. */
const ABSENCE = /no after-render event/i;

/**
 * E4's ordered pin, written once so M1 is run through the very assertion the case makes: the read
 * and the phase, then every event in the order it was supplied.
 */
function assertOrdered(surface) {
  assert.equal(
    surface.state,
    'ordered',
    'a chain with events around the read must render as ordered',
  );
  assert.equal(surface.kind, 'ordered');
  assert.deepEqual(
    surface.read,
    { at: 2, width: 0 },
    'the surface must render the read it was handed',
  );
  assert.equal(
    surface.read.width,
    0,
    "the zero width is the read's value and is carried through as 0",
  );
  assert.equal(
    surface.phase,
    'output',
    'the read interrupted an output event, so it ran in `output`',
  );
  assert.deepEqual(
    surface.before.map((entry) => entry.type),
    [2, 6],
    'the events before the read must stay in emission order',
  );
  assert.deepEqual(
    surface.after.map((entry) => entry.type),
    [7, 3],
    'the events after the read must stay in emission order, never re-sorted by another key',
  );
  assert.deepEqual(
    surface.lines,
    [
      'read at 2, width 0',
      'phase output',
      'before 0: template-update (type 2)',
      'before 1: output (type 6)',
      'after 2: output (type 7)',
      'after 3: template-update (type 3)',
    ],
    'the rendered chain is the supplied chain, in the order supplied',
  );
  assert.equal(
    surface.text,
    surface.lines.join('\n'),
    "the pane's text is the rendered lines",
  );
  assert.match(
    surface.message,
    /output/,
    'the finding names the phase the read ran in',
  );
  assert.ok(
    surface.text.includes('width 0'),
    "the read's own value reaches the pane",
  );
}

/**
 * E4's absence pin, written once so M2 is run through it: an explicit state naming that no
 * after-render event was recorded for the read, and never a blank pane.
 */
function assertCannotTell(surface) {
  assert.equal(
    surface.state,
    'cannot-tell',
    'a chain with no after-render event for the read must not render as ordered',
  );
  assert.equal(surface.kind, 'cannot-tell');
  assert.equal(
    surface.reason,
    'no-after-render-event',
    'the absence state names the absence it found, as the constant the ordering module exports',
  );
  assert.ok(
    surface.lines.length > 0,
    'the absence must render as a pane, not as nothing',
  );
  assert.ok(
    surface.text.trim().length > 0,
    "the pane's text must not be blank",
  );
  assert.match(
    surface.message,
    ABSENCE,
    'the message names the missing after-render event',
  );
  assert.match(
    surface.text,
    ABSENCE,
    'and the rendered pane says the same thing',
  );
  assert.equal(
    'before' in surface,
    false,
    'the absence carries no order to read a chain out of',
  );
  assert.equal('after' in surface, false);
  for (const word of UNSUPPORTED_WORDS) {
    assert.ok(
      !surface.text.toLowerCase().includes(word),
      `the absence must not say "${word}": ${surface.message}`,
    );
  }
}

/** E4's unreadable-event pin, written once so M3 is run through it. */
function assertUnknown(surface, expectedEvent) {
  assert.equal(
    surface.state,
    'unknown',
    'an event outside the enum must render as unknown',
  );
  assert.equal(surface.kind, 'unknown');
  assert.deepEqual(
    surface.event,
    expectedEvent,
    'the surface names the event it could not read',
  );
  assert.match(
    surface.message,
    /ordering/i,
    'and says the finding has no ordering for it',
  );
  assert.ok(
    surface.text.trim().length > 0,
    'the unknown state renders a pane too',
  );
  const named =
    expectedEvent !== null && typeof expectedEvent === 'object'
      ? String(expectedEvent.type)
      : String(expectedEvent);
  assert.ok(
    surface.text.includes(named),
    `the pane names the unreadable event: ${surface.text}`,
  );
}

// ---------------------------------------------------------------------------
// The mutants
// ---------------------------------------------------------------------------

let mutantDir = null;
let mutantCount = 0;

/**
 * A mutant: one textual change to an in-memory copy of the surface's source, loaded from a file in
 * the OS temp directory so it goes through the same type stripping the surface on disk does. The
 * anchor must change the source, or the mutation would be vacuous and the case would prove nothing.
 */
async function loadMutant(anchor, replacement) {
  const source = SURFACE_SRC.replace(anchor, replacement);
  assert.notEqual(
    source,
    SURFACE_SRC,
    `the mutation must change the surface: ${JSON.stringify(anchor)}`,
  );
  mutantDir ??= mkdtempSync(join(tmpdir(), 'after-render-panel-'));
  mutantCount += 1;
  const file = join(mutantDir, `surface-mutant-${mutantCount}.ts`);
  writeFileSync(file, source, 'utf8');
  return import(pathToFileURL(file).href);
}

after(() => {
  if (mutantDir !== null) rmSync(mutantDir, { recursive: true, force: true });
});

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

// ---------------------------------------------------------------------------
// The three states
// ---------------------------------------------------------------------------

describe('the after-render panel surface (E4)', () => {
  it('renders the ordered chain: the read, its phase, and the events in the order supplied', () => {
    assertOrdered(SURFACE.afterRenderPanel(ORDERED_CHAIN));
  });

  it('keeps the order it was handed rather than one it computes (a chain handed over reversed renders reversed)', () => {
    const reversed = JSON.parse(JSON.stringify(ORDERED_CHAIN));
    reversed.before = reversed.before.slice().reverse();
    reversed.after = reversed.after.slice().reverse();
    const surface = SURFACE.afterRenderPanel(reversed);
    assert.deepEqual(
      surface.lines,
      [
        'read at 2, width 0',
        'phase output',
        'before 1: output (type 6)',
        'before 0: template-update (type 2)',
        'after 3: template-update (type 3)',
        'after 2: output (type 7)',
      ],
      'every array is rendered in the order it arrived in',
    );
  });

  it('renders the cannot-tell state when the chain is empty, naming the absence', () => {
    assertCannotTell(SURFACE.afterRenderPanel(CANNOT_TELL_CHAIN));
    // A surface with no chain at all is the same absence: nothing was joined to the read.
    assertCannotTell(SURFACE.afterRenderPanel());
    assertCannotTell(SURFACE.afterRenderPanel(null));
    assertCannotTell(SURFACE.afterRenderPanel({}));
  });

  it('renders an ordered chain that carries no after-render event as the absence, not as an order', () => {
    assertCannotTell(
      SURFACE.afterRenderPanel({
        state: 'ordered',
        read: { at: 4, width: 0 },
        phase: 'output',
        before: RECORDED,
        after: [],
      }),
    );
  });

  it('renders the unknown state for an event the recorded enum does not carry, without throwing', () => {
    assertUnknown(SURFACE.afterRenderPanel(UNKNOWN_CHAIN), { type: 42 });
    // A type that is a name, and an entry that is not an event at all: both are named, neither throws.
    assertUnknown(
      SURFACE.afterRenderPanel(
        order({ at: 0, width: 0 }, [{ type: 'OutputStart' }, { type: 7 }]),
      ),
      { type: 'OutputStart' },
    );
    const notAnEvent = SURFACE.afterRenderPanel({
      state: 'unknown',
      event: undefined,
    });
    assert.equal(notAnEvent.state, 'unknown');
    assert.ok(
      notAnEvent.text.length > 0,
      'an event that arrived as nothing still renders a pane',
    );
  });

  it('renders the loading state only when it is asked for, so an empty chain stays the absence', () => {
    const loading = SURFACE.afterRenderPanel({ loading: true });
    assert.equal(loading.state, 'loading');
    assert.ok(
      loading.lines.length > 0,
      'the loading pane names the state it is in',
    );
    assert.doesNotMatch(
      loading.message,
      ABSENCE,
      'an assembling chain is not the absence state',
    );
    assert.equal(SURFACE.afterRenderPanel().state, 'cannot-tell');
  });

  it('names neither layout, a cause nor a reflow in any state', () => {
    const states = [
      SURFACE.afterRenderPanel(ORDERED_CHAIN),
      SURFACE.afterRenderPanel(CANNOT_TELL_CHAIN),
      SURFACE.afterRenderPanel(UNKNOWN_CHAIN),
      SURFACE.afterRenderPanel({ loading: true }),
    ];
    for (const surface of states) {
      const text = JSON.stringify(surface).toLowerCase();
      for (const word of UNSUPPORTED_WORDS) {
        assert.ok(
          !text.includes(word),
          `the ${surface.state} state must not say "${word}": ${text}`,
        );
      }
    }
  });

  it('adds no field the chain does not support, and renders the same text twice', () => {
    const once = SURFACE.afterRenderPanel(ORDERED_CHAIN);
    const twice = SURFACE.afterRenderPanel(
      JSON.parse(JSON.stringify(ORDERED_CHAIN)),
    );
    assert.deepEqual(
      once,
      twice,
      'two calls over equal chains must render byte-identically',
    );
    assert.deepEqual(
      Object.keys(once).sort(),
      [
        'after',
        'before',
        'kind',
        'lines',
        'message',
        'phase',
        'read',
        'state',
        'text',
      ],
      'the ordered state carries the order and nothing that reads as a cause',
    );
  });

  it('does not modify the chain it is handed', () => {
    const chain = JSON.parse(JSON.stringify(ORDERED_CHAIN));
    const snapshot = JSON.parse(JSON.stringify(chain));
    SURFACE.afterRenderPanel(chain);
    assert.deepEqual(chain, snapshot, 'rendering a chain must not write to it');
  });
});

// ---------------------------------------------------------------------------
// The mutants
// ---------------------------------------------------------------------------

describe('the mutants each redden the pin they must', () => {
  it('M1 — reversing the rendered order reddens the emission-order pin', async (t) => {
    const mutant = await loadMutant(
      "      ...before.map((event) => eventLine('before', event)),\n      ...after.map((event) => eventLine('after', event)),",
      "      ...after.map((event) => eventLine('after', event)).reverse(),\n      ...before.map((event) => eventLine('before', event)).reverse(),",
    );
    const failure = reddens(
      () => assertOrdered(mutant.afterRenderPanel(ORDERED_CHAIN)),
      'the emission-order pin',
    );
    t.diagnostic(`M1 reversed order failure: ${failure.message}`);
    // The untouched module still passes the same pin, so the pin is what M1 reddened.
    assertOrdered(SURFACE.afterRenderPanel(ORDERED_CHAIN));
  });

  it('M2 — a blank pane instead of the cannot-tell state reddens the absence pin', async (t) => {
    const mutant = await loadMutant(
      '  const lines = [readLine(read), CANNOT_TELL_MESSAGE];',
      '  const lines = [];',
    );
    const failure = reddens(
      () => assertCannotTell(mutant.afterRenderPanel(CANNOT_TELL_CHAIN)),
      'the absence pin',
    );
    t.diagnostic(`M2 blank pane failure: ${failure.message}`);
    assertCannotTell(SURFACE.afterRenderPanel(CANNOT_TELL_CHAIN));
  });

  it('M3 — throwing on an unknown event reddens the unknown pin', async (t) => {
    const mutant = await loadMutant(
      'function unreadable(event: unknown): AfterRenderSurface {',
      "function unreadable(event: unknown): AfterRenderSurface {\n  throw new Error('the event cannot be read');",
    );
    const failure = reddens(
      () => assertUnknown(mutant.afterRenderPanel(UNKNOWN_CHAIN), { type: 42 }),
      'the unknown pin',
    );
    t.diagnostic(`M3 thrown unknown failure: ${failure.message}`);
    assertUnknown(SURFACE.afterRenderPanel(UNKNOWN_CHAIN), { type: 42 });
  });
});
