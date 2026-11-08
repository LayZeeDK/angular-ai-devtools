// Tests for apps/angular-ai-devtools/src/app/panel-render-phase.ts — the display half of M039 T003
// (INTENT.md SC5, held-out E7; prohibitions N2, N4, N6). The join itself is
// `extension/render-phase.js` (T002), already landed; this suite renders the answer that join gives
// for the recording T001 made, and holds the pane to it.
//
// The fixture is the recording, and it is read, never written: `research/raw/m039-render-phase.json`
// measures the counter fixture's effect as node 5 of six — kind `effect`, an empty label, one
// recorded edge to `signal:count` — the profiler enum with no effect event at all, and a negative
// NG0100 attempt whose substitute is the single `NG0100` entry of `extension/error-digest.json`.
// Two describes below run the landed join over that recording inside a bare `node:vm` context and
// feed its answer straight into the pane, so the two halves are pinned against each other rather
// than against a hand-written copy of the answer.
//
// The separation the pane exists for is pinned block by block (SC5, E7). The answer's parts become
// their own blocks, in the order the join hands them over, and each block renders its own text and
// no other block's:
//
//   effect            the effect's name as the join reported it — or the statement that the graph
//                     gave none — the word saying how it was named, and one line per signal the
//                     recorded edges name; an empty read is a stated absence (AC1).
//   phase             its own block, saying cannot-tell and naming the absence the join published,
//                     and never inside an effect block (AC2).
//   change-detection  its own block, carrying the code, the message and the provenance it was
//                     handed, never the effect's cause and never merged with it (AC3).
//   cannot-tell       the reason the join named, and no finding field, because it has none.
//   idle              nothing has arrived: no answer, an empty list, or a read still running (AC4).
//   <as given>        a word no join of this milestone answers is rendered as the state it was given
//                     and never dropped (AC4).
//
// Every pin is proven non-vacuously the way `scripts/panel-linked-state.test.mjs` does it: the pin
// runs against the untouched module first, then against a copy of the module source carrying one
// anchored mutation, and the pin must redden with a failure message that names the defect. A mutant
// that survives its pin, or that cannot fail at all, fails this suite.
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { pathToFileURL } from 'node:url';

const SURFACE_URL = new URL(
  '../apps/angular-ai-devtools/src/app/panel-render-phase.ts',
  import.meta.url,
);
const SURFACE_SRC = readFileSync(SURFACE_URL, 'utf8');
const SURFACE = await import(SURFACE_URL.href);

const JOIN_SRC = readFileSync(
  new URL('../extension/render-phase.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m039-render-phase.json', import.meta.url),
    'utf8',
  ),
);
const DIGEST = JSON.parse(
  readFileSync(
    new URL('../extension/error-digest.json', import.meta.url),
    'utf8',
  ),
);

// ------------------------------------------------------------------ measured fixture ----

/** The fresh read T001 took on the counter fixture: the graph, its edges and the effect node. */
const FRESH = RECORDING.effect.freshRead;

/** The digest entry the recording names as the substitute for the capture no page produced. */
const NG0100 = DIGEST.entries.find(
  (entry) => entry.code === RECORDING.changeDetection.substitute.code,
);

/** The provenance this suite hands the join: the recording's own word for the substitute. */
const SUBSTITUTE_PROVENANCE = 'digest entry, not a capture';

/** The portal's one labelled effect, which is how the pane is shown a named effect. */
const LABELLED = RECORDING.effect.portalRead.labelledEffectNodes[0];

// ------------------------------------------------------------------------ the facts ----

/** The graph T001 measured, in the shape the join reads: indices, kinds, labels and edge ends. */
function recordedGraph() {
  return {
    nodes: FRESH.nodes.map((node) => ({
      index: node.index,
      kind: node.kind,
      label: node.label,
    })),
    edges: FRESH.allEdges.map((edge) => ({
      consumer: edge.consumer,
      producer: edge.producer,
    })),
  };
}

/** The fact a caller hands the join: the measured graph, the subject, and the recorded message. */
function measuredFact() {
  return {
    graph: recordedGraph(),
    effect: { edge: { consumer: FRESH.nodeIndex } },
    error: {
      code: NG0100.code,
      message: NG0100.body,
      provenance: SUBSTITUTE_PROVENANCE,
    },
  };
}

/** The same fact with no recorded change-detection message: the effect and the phase alone. */
function effectOnlyFact() {
  return {
    graph: recordedGraph(),
    effect: { edge: { consumer: FRESH.nodeIndex } },
  };
}

/**
 * The portal's labelled effect, as a graph the join reads. The recording names the producer of its
 * one edge — the `linkedSignal` labelled `Resource.extRequest` — so the graph carries that node.
 */
function labelledFact() {
  return {
    graph: {
      nodes: [
        {
          index: LABELLED.producers[0].index,
          kind: LABELLED.producers[0].kind,
          label: LABELLED.producers[0].label,
        },
        { index: LABELLED.nodeIndex, kind: 'effect', label: LABELLED.label },
      ],
      edges: [
        { consumer: LABELLED.nodeIndex, producer: LABELLED.producers[0].index },
      ],
    },
    effect: { label: LABELLED.label },
  };
}

/**
 * The `/stale-view` effect T001 measured: one node of kind `effect`, no edge at all. The join keeps
 * its finding and reports an empty read, which is the case the pane must state rather than blank.
 */
function noEdgeFact() {
  const page = RECORDING.effect.effectNodesOnTheFixturePagesRead.find(
    (entry) => entry.route === '/stale-view',
  );
  return {
    graph: {
      nodes: [{ index: page.nodeIndex, kind: page.kind, label: page.label }],
      edges: [],
    },
    effect: { edge: { consumer: page.nodeIndex } },
  };
}

// ------------------------------------------------------------------------ the join ----

/** `extension/render-phase.js` run in a bare context, publishing its own namespace. */
function joinApi() {
  const context = createContext({});
  runInContext(JOIN_SRC, context);
  const api = context.angularAiRenderPhase;
  assert.ok(api, 'extension/render-phase.js must publish its namespace');
  assert.equal(typeof api.renderPhase, 'function');
  return api;
}

const JOIN = joinApi();

/** The join's own answer for the recording T001 made. */
const RECORDED = JOIN.renderPhase(measuredFact());

/** The join's published absences, read from the join rather than restated here. */
const JOIN_ABSENCES = [
  JOIN.GRAPH_UNREADABLE,
  JOIN.NO_EFFECT_NODE,
  JOIN.EFFECT_UNREADABLE,
];

// ------------------------------------------------------------------- mutant plumbing ----

let mutantDir = null;
let mutantCount = 0;

/**
 * A copy of the surface source with one anchored replacement applied. The anchor must occur, and
 * the mutation must change the source: a mutation that rewrites nothing is a decorative mutant.
 */
async function loadMutant(anchor, replacement) {
  assert.ok(
    SURFACE_SRC.includes(anchor),
    `mutation anchor not found in panel-render-phase.ts: ${JSON.stringify(anchor)}`,
  );
  const source = SURFACE_SRC.replace(anchor, replacement);
  assert.notEqual(
    source,
    SURFACE_SRC,
    `mutation must change source: ${anchor}`,
  );
  mutantDir ??= mkdtempSync(join(tmpdir(), 'panel-render-phase-'));
  mutantCount += 1;
  const file = join(mutantDir, `mutant-${mutantCount}.ts`);
  writeFileSync(file, source, 'utf8');
  return import(pathToFileURL(file).href);
}

after(() => {
  if (mutantDir) rmSync(mutantDir, { recursive: true, force: true });
});

/**
 * The four phases of a non-vacuous pin: the untouched module passes it, the mutated copy is run
 * through the same pin, the pin reddens, and the failure names the defect by name.
 */
function mutantReddens(name, mutant, input, pin) {
  pin(SURFACE.renderPhasePanel(input));
  let failure = null;
  try {
    pin(mutant.renderPhasePanel(input));
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
  // The whole failure, flattened: the defect's name, and the text the mutant rendered beside the
  // text the pin expected, so the log quotes what named the defect rather than only its title.
  console.log(
    `mutant ${name} reddens: ${failure.message.replace(/\s+/g, ' ').trim()}`,
  );
  return failure;
}

// ------------------------------------------------------------------------- the pins ----

/** What no rendered pane may name: a phase word, a write, an owner, a cause, or "no effects". */
const FORBIDDEN = [
  [
    'a phase',
    /\b(rendering|after-render|afterRender|before-render|pre-render)\b/i,
  ],
  ['a write', /\b(writ(?:e|es|ten|ing)|wrote|set\s+by|assigned)\b/i],
  ['an owner', /\b(own(?:er|ers|ed|s))\b/i],
  ['a cause', /\b(cause|causes|caused|causal|because|why)\b/i],
  ['a count of effects', /\bno effects\b/i],
];

/** The lines that identify each block's own text, and never another block's. */
const MARKERS = {
  effect: ['namedBy:', 'read:'],
  phase: ['phase:', 'absence:'],
  'change-detection': ['code:', 'message:', 'provenance:'],
  'cannot-tell': ['reason:'],
};

function markersOf(block) {
  return MARKERS[block.kind] ?? [`state: ${block.state}`];
}

/** The block the pane rendered for one state word, or a failure naming what it rendered instead. */
function blockOf(surface, state) {
  const block = surface.blocks.find((candidate) => candidate.state === state);
  assert.ok(
    block,
    `blocks-present: the pane must render a ${state} block; it rendered ${JSON.stringify(
      surface.blocks.map((candidate) => candidate.state),
    )}`,
  );
  return block;
}

/** AC1: the effect block carries the join's three fields and its own lines, and nothing else. */
function pinEffectBlock(surface, expected) {
  const block = blockOf(surface, 'effect');
  assert.equal(block.kind, 'effect', 'effect-block-own-text: kind');
  assert.equal(block.effect, expected.effect, 'effect-block-own-text: effect');
  assert.equal(
    block.namedBy,
    expected.namedBy,
    'effect-block-own-text: namedBy',
  );
  assert.deepEqual(
    [...block.reads],
    [...expected.reads],
    'effect-block-own-text: reads',
  );
  assert.equal(
    block.lines[0],
    expected.effect === null
      ? 'effect: (the graph gives no label)'
      : `effect: ${expected.effect}`,
    'effect-block-own-text: the name line, or the stated absence',
  );
  assert.equal(block.lines[1], `namedBy: ${expected.namedBy}`);
  assert.deepEqual(
    block.lines.slice(2),
    expected.reads.length === 0
      ? ['read: (the recorded edges name no signal)']
      : [...expected.reads].map((signal) => `read: ${signal}`),
    'effect-block-own-text: one line per read, or the stated empty read',
  );
  assert.equal(block.text, block.lines.join('\n'));
  for (const marker of [
    'code:',
    'provenance:',
    'phase:',
    'absence:',
    'reason:',
  ]) {
    assert.ok(
      !block.text.includes(marker),
      `effect-block-own-text: the effect block must render no ${marker} line; it rendered: ${block.text}`,
    );
  }
  assert.ok(
    !block.text.includes(NG0100.code),
    `effect-block-own-text: the effect block must not carry the change-detection code; it rendered: ${block.text}`,
  );
}

/** AC2: the phase block says cannot-tell and names the absence the join published. */
function pinPhaseBlock(surface, expected) {
  const block = blockOf(surface, 'phase');
  assert.equal(block.kind, 'phase', 'phase-block-own-text: kind');
  assert.equal(
    block.phase,
    expected.state,
    'phase-block-own-text: phase state',
  );
  assert.equal(
    block.absence,
    expected.absence,
    'phase-block-own-text: absence',
  );
  assert.deepEqual(
    [...block.lines],
    [`phase: ${expected.state}`, `absence: ${expected.absence}`],
    'phase-block-own-text: the two lines, in order',
  );
  assert.equal(block.text, block.lines.join('\n'));
  for (const marker of [
    'namedBy:',
    'read:',
    'code:',
    'provenance:',
    'reason:',
  ]) {
    assert.ok(
      !block.text.includes(marker),
      `phase-block-own-text: the phase block must render no ${marker} line; it rendered: ${block.text}`,
    );
  }
}

/** AC3: the change-detection block carries the code, the message and the provenance it was handed. */
function pinChangeDetectionBlock(surface, expected) {
  const block = blockOf(surface, 'change-detection');
  assert.equal(
    block.kind,
    'change-detection',
    'change-detection-block-own-text: kind',
  );
  assert.equal(
    block.code,
    expected.code,
    'change-detection-block-own-text: code',
  );
  assert.equal(block.provenance, expected.provenance);
  assert.equal(block.message, expected.message);
  assert.deepEqual(
    [...block.lines],
    [
      `code: ${expected.code}`,
      `message: ${expected.message}`,
      `provenance: ${expected.provenance}`,
    ],
    'change-detection-block-own-text: the three lines, in order',
  );
  assert.equal(block.text, block.lines.join('\n'));
  for (const marker of ['namedBy:', 'read:', 'phase:', 'absence:', 'reason:']) {
    assert.ok(
      !block.text.includes(marker),
      `change-detection-block-own-text: it must render no ${marker} line; it rendered: ${block.text}`,
    );
  }
}

/** The absence block: the reason the join named, and no finding field. */
function pinAbsenceBlock(surface, reason) {
  const block = blockOf(surface, 'cannot-tell');
  assert.equal(block.kind, 'cannot-tell', 'cannot-tell-block-own-text: kind');
  assert.equal(block.reason, reason);
  assert.ok(block.lines.includes(`reason: ${reason}`));
  assert.ok(block.text.includes('cannot tell'));
  for (const marker of [
    'effect:',
    'namedBy:',
    'read:',
    'code:',
    'provenance:',
    'phase:',
    'absence:',
  ]) {
    assert.ok(
      !block.text.includes(marker),
      `cannot-tell-block-own-text: an absence renders no ${marker} line; it rendered: ${block.text}`,
    );
  }
  assert.ok(
    !/no effects/i.test(block.text),
    `cannot-tell-block-own-text: an absence never says the page has no effects; it rendered: ${block.text}`,
  );
}

/** AC4: a state the pane was not written for is rendered as the state it was given. */
function pinGivenStateRendered(surface, given) {
  assert.equal(
    surface.state,
    given,
    `given-state-rendered: the word the fact named, got ${surface.state}`,
  );
  assert.equal(
    surface.kind,
    given,
    'given-state-rendered: the kind is the word',
  );
  const block = blockOf(surface, given);
  assert.equal(
    block.text,
    `state: ${given}`,
    'given-state-rendered: the state line',
  );
  assert.deepEqual([...block.lines], [`state: ${given}`]);
  for (const marker of [
    'effect:',
    'namedBy:',
    'read:',
    'code:',
    'provenance:',
    'reason:',
    'absence:',
  ]) {
    assert.ok(
      !block.text.includes(marker),
      `given-state-rendered: it borrows no ${marker} line; it rendered: ${block.text}`,
    );
  }
}

/** AC4: idle says so, renders no block, and never reads as a finding. */
function pinIdle(surface) {
  assert.equal(surface.state, 'idle', 'idle-own-text: state');
  assert.equal(surface.kind, 'idle', 'idle-own-text: kind');
  assert.deepEqual(
    surface.blocks,
    [],
    'idle-own-text: no block while nothing arrived',
  );
  assert.ok(surface.lines.length > 0, 'idle-own-text: never a blank pane');
  assert.ok(surface.text.includes('idle'), 'idle-own-text: says idle');
  for (const marker of [
    'effect:',
    'namedBy:',
    'read:',
    'code:',
    'provenance:',
    'phase:',
    'absence:',
    'reason:',
  ]) {
    assert.ok(
      !surface.text.includes(marker),
      `idle-own-text: nothing has arrived, so it renders no ${marker} line; it rendered: ${surface.text}`,
    );
  }
}

/**
 * held-out E7: each state renders its own text and nothing else. Every block carries the markers of
 * its own state, carries no other block's, and no two blocks share a text — so a pane that merged
 * the phase into the effect, or printed the code beside the effect as its cause, reddens here.
 */
function pinBlocksSeparate(surface) {
  assert.ok(
    surface.blocks.length >= 2,
    `blocks-separate: the answer renders its parts as separate blocks; it rendered ${surface.blocks.length}`,
  );
  for (const block of surface.blocks) {
    assert.ok(
      block.lines.length > 0,
      `blocks-separate: the ${block.state} block renders at least one line`,
    );
    assert.equal(
      block.text,
      block.lines.join('\n'),
      `blocks-separate: the ${block.state} block's text is its own lines`,
    );
    for (const marker of markersOf(block)) {
      assert.ok(
        block.text.includes(marker),
        `blocks-separate: the ${block.state} block renders its own ${marker} line; it rendered: ${block.text}`,
      );
    }
    for (const other of surface.blocks) {
      if (other === block) continue;
      for (const marker of markersOf(other)) {
        assert.ok(
          !block.text.includes(marker),
          `blocks-separate: the ${block.state} block must render no ${other.state} ${marker} line; it rendered: ${block.text}`,
        );
      }
    }
  }
  const texts = surface.blocks.map((block) => block.text);
  assert.equal(
    new Set(texts).size,
    texts.length,
    'blocks-separate: no two blocks share a text',
  );
  assert.deepEqual(
    surface.lines,
    surface.blocks.flatMap((block) => block.lines),
    'blocks-separate: the flat list is the blocks in order',
  );
  assert.equal(surface.text, surface.lines.join('\n'));
}

/** AC2, N2: no rendered string names a phase other than the cannot-tell the answer carried. */
function pinRendersNoPhase(surface) {
  const rendered = `${surface.text}\n${JSON.stringify(surface.blocks)}`;
  const named = FORBIDDEN.filter(([, pattern]) => pattern.test(rendered)).map(
    ([claim]) => claim,
  );
  assert.deepEqual(
    named,
    [],
    `renders-no-phase: the pane must render nothing the answer did not carry; it rendered ${JSON.stringify(
      named,
    )} in: ${surface.text}`,
  );
}

// ------------------------------------------------------------------------ the cases ----

describe('measurement', () => {
  it('the recording measures an unlabelled effect, the signal its edge names, and no effect event', () => {
    assert.equal(FRESH.kind, 'effect');
    assert.equal(FRESH.label, '');
    assert.equal(FRESH.labelEmpty, true);
    assert.deepEqual([...FRESH.signalsTheEdgesName], ['count']);
    assert.equal(FRESH.edges.length, 1);
    // The profiler enum, re-derived from the recording's own two sources: 26 values each, and no
    // value name contains `effect`.
    const names = RECORDING.profiler.sources.flatMap((source) =>
      source.values.map((value) => value.name),
    );
    assert.equal(names.length, 52);
    assert.deepEqual(
      names.filter((name) => name.toLowerCase().includes('effect')),
      [],
    );
    assert.equal(RECORDING.profiler.effectEvent.count, 0);
    // The change-detection half is a negative with a digest substitute, not a capture.
    assert.equal(RECORDING.changeDetection.result, 'negative');
    assert.equal(RECORDING.changeDetection.substitute.notACapture, true);
    assert.ok(NG0100 && typeof NG0100.body === 'string');
    console.log(
      `render-phase fixture: effect node ${FRESH.nodeIndex}, label ${JSON.stringify(
        FRESH.label,
      )}, reads ${JSON.stringify(FRESH.signalsTheEdgesName)}, digest ${NG0100.code}`,
    );
  });
});

describe('the join this pane renders', () => {
  it('renders the landed join’s answer for the recorded graph, field for field', () => {
    assert.equal(RECORDED.findings.length, 2, 'the join answers two findings');
    const [effect, change] = RECORDED.findings;
    assert.equal(effect.state, 'effect');
    assert.equal(effect.effect, null);
    assert.equal(effect.namedBy, JOIN.NAMED_BY_RECORDED_EDGE);
    assert.deepEqual([...effect.reads], ['count']);
    assert.equal(change.state, 'change-detection');
    assert.deepEqual(
      { ...RECORDED.phase },
      {
        state: JOIN.CANNOT_TELL,
        absence: JOIN.NO_EFFECT_EVENT,
      },
    );

    const surface = SURFACE.renderPhasePanel(RECORDED);
    assert.equal(surface.state, 'findings');
    assert.equal(surface.blocks.length, 3);
    pinEffectBlock(surface, effect);
    pinChangeDetectionBlock(surface, change);
    pinPhaseBlock(surface, RECORDED.phase);
    pinBlocksSeparate(surface);
  });

  it('names exactly the absences the join publishes, and re-derives none of them', async () => {
    assert.deepEqual(
      [...JOIN_ABSENCES],
      ['graph-unreadable', 'no-effect-node', 'effect-unreadable'],
    );
    // One fact per absence, so the reason the pane renders is compared with the join's own constant
    // rather than with the pane's copy of it.
    const absenceFacts = [
      [JOIN.GRAPH_UNREADABLE, {}],
      [JOIN.NO_EFFECT_NODE, { graph: { nodes: [], edges: [] } }],
      [
        JOIN.EFFECT_UNREADABLE,
        {
          graph: {
            nodes: [{ index: 0, kind: 'effect', label: 'named-effect' }],
            edges: [],
          },
          effect: { label: 'a-label-the-graph-does-not-hold' },
        },
      ],
    ];
    for (const [reason, fact] of absenceFacts) {
      const answer = JOIN.renderPhase(fact);
      assert.equal(answer.findings[0].state, JOIN.CANNOT_TELL);
      assert.equal(answer.findings[0].reason, reason);
      pinAbsenceBlock(SURFACE.renderPhasePanel(answer), reason);
    }
    // The pane re-implements no part of the join: it reads no edge end and no graph itself.
    for (const word of ['producer', 'consumer', 'getSignalGraph']) {
      assert.ok(
        !SURFACE_SRC.includes(word),
        `the pane must not re-implement the join; the source names ${word}`,
      );
    }
    assert.ok(
      !/^import\s/m.test(SURFACE_SRC),
      'the pane imports nothing at runtime, so its suite executes it',
    );
  });
});

describe('the pane keeps the four things apart (E7)', () => {
  it('AC1: an unlabelled effect states the absence and invents no name', () => {
    const surface = SURFACE.renderPhasePanel(RECORDED);
    pinEffectBlock(surface, {
      effect: null,
      namedBy: JOIN.NAMED_BY_RECORDED_EDGE,
      reads: ['count'],
    });
    const block = blockOf(surface, 'effect');
    assert.equal(block.effect, null);
    // The name it does not have is not minted from the index, the position or the recording.
    assert.ok(!block.text.includes(`node ${FRESH.nodeIndex}`));
    assert.ok(!block.text.includes(String(FRESH.nodeIndex)));
  });

  it('AC1: a labelled effect names the label the join reported', () => {
    const answer = JOIN.renderPhase(labelledFact());
    assert.equal(answer.findings[0].effect, LABELLED.label);
    assert.equal(answer.findings[0].namedBy, JOIN.NAMED_BY_LABEL);
    const surface = SURFACE.renderPhasePanel(answer);
    pinEffectBlock(surface, answer.findings[0]);
    assert.equal(
      blockOf(surface, 'effect').lines[0],
      `effect: ${LABELLED.label}`,
    );
  });

  it('AC1: an effect whose edges name no producer states the empty read, never a blank line', () => {
    const answer = JOIN.renderPhase(noEdgeFact());
    assert.deepEqual([...answer.findings[0].reads], []);
    const surface = SURFACE.renderPhasePanel(answer);
    pinEffectBlock(surface, answer.findings[0]);
    assert.deepEqual(
      [...blockOf(surface, 'effect').lines],
      [
        'effect: (the graph gives no label)',
        'namedBy: recorded-edge',
        'read: (the recorded edges name no signal)',
      ],
    );
  });

  it('AC2: the phase is its own block, saying cannot-tell and naming the absence', () => {
    const surface = SURFACE.renderPhasePanel(RECORDED);
    pinPhaseBlock(surface, RECORDED.phase);
    // The effect block carries no phase, and the phase block carries no effect.
    const effect = blockOf(surface, 'effect');
    const phase = blockOf(surface, 'phase');
    assert.ok(!effect.text.includes(phase.absence));
    assert.ok(!effect.text.includes('phase'));
    assert.ok(!phase.text.includes('namedBy'));
    pinRendersNoPhase(surface);
  });

  it('AC2: no rendered state names rendering or after-render as a phase an effect ran in', () => {
    for (const answer of [
      RECORDED,
      JOIN.renderPhase(effectOnlyFact()),
      JOIN.renderPhase(noEdgeFact()),
      JOIN.renderPhase({ graph: { nodes: [], edges: [] } }),
      JOIN.renderPhase({}),
    ]) {
      pinRendersNoPhase(SURFACE.renderPhasePanel(answer));
    }
  });

  it('AC3: the change-detection finding is its own block, never the effect’s cause', () => {
    const surface = SURFACE.renderPhasePanel(RECORDED);
    const change = RECORDED.findings[1];
    pinChangeDetectionBlock(surface, change);
    // E6: the message names no effect, and the block names none either.
    assert.ok(!/effect/i.test(NG0100.body));
    const block = blockOf(surface, 'change-detection');
    assert.ok(!/effect/i.test(block.text));
    assert.ok(!block.text.includes(JOIN.NO_EFFECT_EVENT));
    // It is not adjacent to the effect as its cause: neither block names the other.
    const effect = blockOf(surface, 'effect');
    assert.ok(!effect.text.includes(change.code));
    assert.ok(!block.text.includes('namedBy'));
    pinRendersNoPhase(surface);
  });

  it('AC3: a change-detection finding that carries no field renders its state and no invented value', () => {
    const surface = SURFACE.renderPhasePanel({
      findings: [{ state: 'change-detection' }],
    });
    const block = blockOf(surface, 'change-detection');
    assert.deepEqual(
      [...block.lines],
      [
        'change-detection: the answer carried no code, no message and no provenance',
      ],
    );
    assert.equal(block.code, null);
    assert.equal(block.provenance, null);
  });

  it('AC4/E7: each block renders its own text and no other block’s', () => {
    const surface = SURFACE.renderPhasePanel(RECORDED);
    pinBlocksSeparate(surface);
    pinEffectBlock(surface, RECORDED.findings[0]);
    pinChangeDetectionBlock(surface, RECORDED.findings[1]);
    pinPhaseBlock(surface, RECORDED.phase);
    console.log(
      `render-phase blocks: ${JSON.stringify(
        surface.blocks.map((block) => block.state),
      )}`,
    );
  });

  it('AC4: a state the pane was not written for still renders the state it was given', () => {
    pinGivenStateRendered(
      SURFACE.renderPhasePanel({ findings: [{ state: 'wedged' }] }),
      'wedged',
    );
    pinGivenStateRendered(
      SURFACE.renderPhasePanel({ state: 'wedged' }),
      'wedged',
    );
    // A second one, so the pass-through is a rule rather than one string that happens to work.
    pinGivenStateRendered(
      SURFACE.renderPhasePanel({
        findings: [{ state: 'newly-named-finding' }],
      }),
      'newly-named-finding',
    );
    // The known states stay known beside it: a given word does not absorb the phase block.
    const mixed = SURFACE.renderPhasePanel({
      findings: [{ state: 'wedged' }],
      phase: RECORDED.phase,
    });
    assert.equal(mixed.state, 'findings');
    blockOf(mixed, 'wedged');
    pinPhaseBlock(mixed, RECORDED.phase);
    pinBlocksSeparate(mixed);
  });

  it('AC4: idle renders its own text for every way of having nothing to render', () => {
    for (const input of [
      undefined,
      null,
      {},
      [],
      { findings: [] },
      { loading: true },
      { assembling: true },
      { state: 'loading' },
      { findings: [{ state: 'loading' }] },
    ]) {
      pinIdle(SURFACE.renderPhasePanel(input));
    }
  });

  it('AC4: the pane’s own messages are four different texts of their own', () => {
    const states = [
      SURFACE.renderPhasePanel(RECORDED),
      SURFACE.renderPhasePanel({
        findings: [
          {
            state: 'effect',
            effect: null,
            namedBy: 'recorded-edge',
            reads: [],
          },
        ],
      }),
      SURFACE.renderPhasePanel({
        findings: [{ state: 'cannot-tell', reason: JOIN.NO_EFFECT_NODE }],
      }),
      SURFACE.renderPhasePanel(undefined),
    ];
    assert.deepEqual(
      states.map((surface) => surface.state),
      ['findings', 'effect', 'cannot-tell', 'idle'],
    );
    assert.equal(new Set(states.map((surface) => surface.text)).size, 4);
    assert.equal(new Set(states.map((surface) => surface.message)).size, 4);
    // A single block answers with that block's own state, message and lines.
    const single = states[1];
    assert.deepEqual(single.lines, blockOf(single, 'effect').lines);
    assert.equal(single.message, blockOf(single, 'effect').message);
  });

  it('AC1/N6: nothing rendered names a write, an owner, a cause or a code the answer lacked', () => {
    for (const input of [
      RECORDED,
      JOIN.renderPhase(effectOnlyFact()),
      JOIN.renderPhase(noEdgeFact()),
      JOIN.renderPhase({ graph: { nodes: [], edges: [] } }),
      { findings: [{ state: 'wedged' }] },
      undefined,
    ]) {
      pinRendersNoPhase(SURFACE.renderPhasePanel(input));
    }
    // A fact poisoned with every claim the pane may not make: none of them reaches a line.
    const poisoned = {
      findings: [
        {
          state: 'effect',
          effect: 'Resource.loadEffect',
          namedBy: 'label',
          reads: ['Resource.extRequest'],
          phase: 'after-render',
          cause: 'the expression changed because the effect wrote it',
          owner: 'AppComponent',
          written: true,
          element: '#counter',
          code: 'NG0100',
          provenance: 'captured',
        },
        {
          state: 'change-detection',
          code: 'NG0100',
          message: 'Expression changed after it was checked.',
          provenance: SUBSTITUTE_PROVENANCE,
          owner: 'AppComponent',
          cause: 'the effect wrote the value',
          effect: 'Resource.loadEffect',
        },
      ],
      phase: {
        state: 'cannot-tell',
        absence: 'no-effect-event',
        phase: 'rendering',
      },
    };
    const surface = SURFACE.renderPhasePanel(poisoned);
    pinRendersNoPhase(surface);
    for (const leaked of [
      'after-render',
      'because',
      'AppComponent',
      '#counter',
      'captured',
      'phase: rendering',
    ]) {
      assert.ok(
        !surface.text.includes(leaked),
        `renders-no-phase: the pane must not render ${leaked}; it rendered: ${surface.text}`,
      );
    }
    // The pane still renders what the poisoned fact really carried.
    pinEffectBlock(surface, {
      effect: 'Resource.loadEffect',
      namedBy: 'label',
      reads: ['Resource.extRequest'],
    });
    pinPhaseBlock(surface, RECORDED.phase);
    pinChangeDetectionBlock(surface, {
      code: 'NG0100',
      message: 'Expression changed after it was checked.',
      provenance: SUBSTITUTE_PROVENANCE,
    });
  });
});

describe('panel-render-phase mutants', () => {
  it('M1: rendering a phase word reddens the no-phase pin, naming it', async () => {
    const mutant = await loadMutant(
      '  if (namedBy !== null) lines.push(`namedBy: ${namedBy}`);',
      "  if (namedBy !== null) lines.push(`namedBy: ${namedBy}`);\n  lines.push('phase: rendering');",
    );
    const failure = mutantReddens(
      'renders-no-phase',
      mutant,
      RECORDED,
      pinRendersNoPhase,
    );
    assert.match(failure.message, /a phase/);
    assert.match(failure.message, /rendering/);
    assert.ok(
      mutant.renderPhasePanel(RECORDED).text.includes('phase: rendering'),
      'the mutant really renders the phase word the pin hunts',
    );
  });

  it('M2: rendering a code the answer did not carry reddens the effect block’s pin', async () => {
    const mutant = await loadMutant(
      '    for (const signal of reads) lines.push(`read: ${signal}`);',
      "    for (const signal of reads) lines.push(`read: ${signal}`);\n    lines.push('code: NG0100');",
    );
    const failure = mutantReddens(
      'effect-block-own-text',
      mutant,
      RECORDED,
      (surface) => pinEffectBlock(surface, RECORDED.findings[0]),
    );
    assert.match(failure.message, /code:/);
    assert.match(failure.message, /NG0100/);
  });

  it('M3: merging the phase’s absence into the effect block reddens its pin, naming it', async () => {
    const mutant = await loadMutant(
      '  if (namedBy !== null) lines.push(`namedBy: ${namedBy}`);',
      "  if (namedBy !== null) lines.push(`namedBy: ${namedBy}`);\n  lines.push('absence: no-effect-event');",
    );
    const failure = mutantReddens(
      'effect-block-own-text',
      mutant,
      RECORDED,
      (surface) => pinEffectBlock(surface, RECORDED.findings[0]),
    );
    assert.match(failure.message, /absence:/);
    // And the separation pin sees it too: the effect block carries the phase block's text.
    assert.throws(
      () => pinBlocksSeparate(mutant.renderPhasePanel(RECORDED)),
      (error) =>
        error instanceof assert.AssertionError &&
        String(error.message).includes('blocks-separate') &&
        String(error.message).includes('absence:'),
      'a merged phase must redden the separation pin naming the absence line',
    );
  });

  it('M4: letting the change-detection block render the effect’s text reddens the separation pin', async () => {
    const mutant = await loadMutant(
      '  if (provenance !== null) lines.push(`provenance: ${provenance}`);',
      "  if (provenance !== null) lines.push(`provenance: ${provenance}`);\n  lines.push('effect: the counter effect');",
    );
    const failure = mutantReddens(
      'change-detection-block-own-text',
      mutant,
      RECORDED,
      (surface) => pinChangeDetectionBlock(surface, RECORDED.findings[1]),
    );
    assert.match(failure.message, /effect:/);
  });

  it('M5: dropping a state the pane was not written for reddens the given-state pin', async () => {
    const mutant = await loadMutant(
      '  return { kind: state, state, ...pane(message, [message]) };',
      '  return null;',
    );
    const failure = mutantReddens(
      'given-state-rendered',
      mutant,
      { findings: [{ state: 'wedged' }] },
      (surface) => pinGivenStateRendered(surface, 'wedged'),
    );
    assert.match(failure.message, /the word the fact named/);
  });

  it('M6: letting idle render a finding claim reddens the idle pin, naming it', async () => {
    const mutant = await loadMutant(
      '  const lines = [IDLE_MESSAGE];',
      "  const lines = [IDLE_MESSAGE, 'effect: the counter effect'];",
    );
    const failure = mutantReddens('idle-own-text', mutant, undefined, pinIdle);
    assert.match(failure.message, /effect:/);
    assert.match(failure.message, /idle/);
  });
});
