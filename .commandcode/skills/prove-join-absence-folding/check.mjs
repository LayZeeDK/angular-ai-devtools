// check.mjs — prove-join-absence-folding
//
// Bounded exhaustive generation over the record grammar, run against the REAL modules
// (extension/tutor-signals.js, extension/tutor-foundations.js, extension/render-phase.js)
// loaded into a bare `node:vm` context — no DOM, no console, no require, no browser.
//
// Property under proof: every pure join decides its absence states in contract order, never
// folds one absence into another, and never invents an index, label, artefact path or cause.
//
// Run:  node .commandcode/skills/prove-join-absence-folding/check.mjs   (from the repo root)
// Exit 0 = property holds over the whole grammar; exit 1 = counterexamples printed below.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);

// ---------------------------------------------------------------------------
// Load the real modules in a bare vm context each. Nothing is put into the
// context: if a module reached for `document`, `window` or `console` it would
// throw here, which is itself part of what this check observes.
// ---------------------------------------------------------------------------
function loadModule(relPath, globalName) {
  const source = readFileSync(path.join(ROOT, relPath), 'utf8');
  const context = vm.createContext({});
  vm.runInContext(source, context, { filename: relPath });
  const namespace = vm.runInContext(globalName, context);
  if (!namespace) {
    throw new Error(`${relPath} did not publish ${globalName}`);
  }
  return { namespace, source };
}

const signals = loadModule(
  'extension/tutor-signals.js',
  'angularAiTutorSignals',
);
const foundations = loadModule(
  'extension/tutor-foundations.js',
  'angularAiTutorFoundations',
);
const renderPhase = loadModule(
  'extension/render-phase.js',
  'angularAiRenderPhase',
);

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------
let checksRun = 0;
const failures = [];
const FAILING_CAP = 10;

function assert(condition, message, counterexample) {
  checksRun += 1;
  if (!condition && failures.length < FAILING_CAP) {
    failures.push({ message, counterexample });
  }
}

function sameJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const t0 = Date.now();

// ===========================================================================
// 1. tutor-signals.js — the M057 join, four states, ORDERING_ABSENCE
// ===========================================================================
const tutorSignals = signals.namespace.tutorSignals;

const ORDERING_ABSENCE_ANSWER = {
  state: 'absent',
  absence: 'no-write-record-no-order',
};

// The markers each absence sentence carries, and the markers of the OTHER
// absences it must never borrow. Checked on every answer.
const ABSENCE_MARKERS = {
  'graph-unreadable': {
    own: 'no graph record could be read',
    borrowed: ['carries no render/effect entry', 'of kind effect'],
  },
  'no-render-entry': {
    own: 'carries no render/effect entry',
    borrowed: ['no graph record could be read', 'of kind effect'],
  },
  'no-effect-node': {
    own: ['of kind effect', 'none of them is the one the entry names'],
    borrowed: [
      'no graph record could be read',
      'carries no render/effect entry',
    ],
  },
};

// Node attribute grammar: kind, numeric index present/absent, label empty/present.
const KINDS = ['effect', 'signal'];
const INDEXES = [0, 1, 2, null];
const LABELS = ['', 'Resource.loadEffect'];

function nodeAtoms() {
  const atoms = [];
  for (const kind of KINDS) {
    for (const index of INDEXES) {
      for (const label of LABELS) atoms.push({ kind, index, label });
    }
  }
  return atoms;
}

// Node arrays: empty, full grammar at sizes 1-2, curated size-3 configs
// (the bound is <= 3 effect nodes).
function nodeConfigurations() {
  const atoms = nodeAtoms();
  const configs = [[]];
  for (const a of atoms) configs.push([a]);
  for (const a of atoms) {
    for (const b of atoms) configs.push([a, b]);
  }
  // Curated size-3 arrays: all-effect grammars, duplicate labels, duplicate
  // and missing indexes, mixed kinds.
  const e = (index, label) => ({ kind: 'effect', index, label });
  const s = (index, label) => ({ kind: 'signal', index, label });
  configs.push(
    [e(0, ''), e(1, ''), e(2, '')],
    [e(null, ''), e(null, ''), e(null, '')],
    [e(0, 'x'), e(0, 'x'), e(0, 'x')],
    [e(null, 'x'), e(0, ''), e(1, 'x')],
    [e(0, ''), s(1, ''), s(2, '')],
    [s(0, ''), s(1, ''), e(2, 'Resource.loadEffect')],
    [e(0, ''), e(0, 'Resource.loadEffect'), e(null, '')],
    [e(2, ''), e(1, ''), e(0, '')],
    [e(null, 'Resource.loadEffect'), e(9, ''), e(null, '')],
    [e(9, 'x'), e(9, 'x'), e(9, 'x')],
  );
  return configs;
}

// Edge grammar: <= 4 edges; ends placeable (0,1,2) or unplaceable (9).
const EDGE_CANDIDATES = [
  { consumer: 0, producer: 1 },
  { consumer: 1, producer: 0 },
  { consumer: 2, producer: 1 },
  { consumer: 1, producer: 2 },
  { consumer: 0, producer: 0 },
  { consumer: 9, producer: 1 },
  { consumer: 1, producer: 9 },
  { consumer: 9, producer: 9 },
  { consumer: 2, producer: 9 },
];

function edgeSubsets() {
  const subsets = [[]];
  for (const edge of EDGE_CANDIDATES) subsets.push([edge]);
  for (let i = 0; i < EDGE_CANDIDATES.length; i += 1) {
    for (let j = i; j < EDGE_CANDIDATES.length; j += 1) {
      subsets.push([EDGE_CANDIDATES[i], EDGE_CANDIDATES[j]]);
    }
  }
  return subsets;
}

// The render/effect entry: absent, by label (empty/present/unrecorded), by
// edge (consumer only / whole edge / unplaceable consumer / malformed).
const ENTRIES = [
  undefined,
  { label: '' },
  { label: 'Resource.loadEffect' },
  { label: 'unrecorded-label' },
  { edge: { consumer: 0 } },
  { edge: { consumer: 0, producer: 1 } },
  { edge: { consumer: 0, producer: 9 } },
  { edge: { consumer: 9 } },
  { edge: {} },
];

const GRAPH_PATH = 'research/raw/m039-render-phase.json';

// The expected state, derived independently from the contract's decision order
// (graph record, then entry, then effect node) — not from the module's code.
function expectedState(graphRecord, entry) {
  const graphOk =
    graphRecord !== undefined &&
    graphRecord !== null &&
    typeof graphRecord === 'object' &&
    typeof graphRecord.path === 'string' &&
    graphRecord.path !== '' &&
    Number.isFinite(graphRecord.line) &&
    graphRecord.line >= 1 &&
    graphRecord.graph !== null &&
    typeof graphRecord.graph === 'object' &&
    Array.isArray(graphRecord.graph.nodes) &&
    Array.isArray(graphRecord.graph.edges);
  if (!graphOk) return { state: 'graph-unreadable' };

  const entryOk =
    entry !== undefined &&
    entry !== null &&
    typeof entry === 'object' &&
    (typeof entry.label === 'string' ||
      (entry.edge !== null &&
        typeof entry.edge === 'object' &&
        Number.isFinite(entry.edge.consumer)));
  if (!entryOk) return { state: 'no-render-entry' };

  const byLabel = typeof entry.label === 'string';
  const value = byLabel ? entry.label : entry.edge.consumer;
  const matches = graphRecord.graph.nodes.filter((node) => {
    if (!node || typeof node !== 'object' || node.kind !== 'effect')
      return false;
    if (byLabel) {
      return (typeof node.label === 'string' ? node.label : '') === value;
    }
    return (Number.isFinite(node.index) ? node.index : null) === value;
  });
  if (matches.length !== 1) return { state: 'no-effect-node' };
  return { state: 'answered', node: matches[0] };
}

function checkTutorSignalsAnswer(answer, graphRecord, entry, expected, record) {
  const cex = () => ({ graphRecord, entry, expected: expected.state, answer });

  // The decision order holds: the state is the contract's first unanswered
  // question, never a later one reached past an earlier absence.
  const stateHolds = answer.state === expected.state;
  assert(
    stateHolds,
    `tutor-signals decided ${JSON.stringify(answer.state)} where the contract order decides ${JSON.stringify(expected.state)}`,
    cex(),
  );
  if (!stateHolds) return;

  // `ordering` is the same constant everywhere, on every answer, and the
  // ordering claim carries it.
  assert(
    sameJson(answer.ordering, ORDERING_ABSENCE_ANSWER),
    'tutor-signals answered with an ordering other than the single ORDERING_ABSENCE constant',
    cex(),
  );
  for (const claim of answer.claims) {
    if (claim.claim === 'ordering') {
      assert(
        sameJson(claim.values, ORDERING_ABSENCE_ANSWER),
        'the ordering claim does not carry the single ORDERING_ABSENCE constant',
        cex(),
      );
    }
  }

  // No absence borrows another absence's sentence.
  if (ABSENCE_MARKERS[answer.state]) {
    const markers = ABSENCE_MARKERS[answer.state];
    const own = Array.isArray(markers.own) ? markers.own : [markers.own];
    assert(
      own.some((marker) => answer.detail.includes(marker)),
      `the ${answer.state} detail does not state its own absence`,
      cex(),
    );
    for (const borrowed of markers.borrowed) {
      assert(
        !answer.detail.includes(borrowed),
        `the ${answer.state} detail borrows another absence's sentence (contains ${JSON.stringify(borrowed)})`,
        cex(),
      );
    }
  }

  // Absences answer no effect and no read.
  if (answer.state !== 'answered') {
    assert(
      answer.effect === null && answer.reads.length === 0,
      'an absence state rendered an effect or a read',
      cex(),
    );
    return;
  }

  // answered: the effect is the record's own node, never an invention.
  const node = expected.node;
  const expectedIndex = Number.isFinite(node.index) ? node.index : null;
  const expectedLabel = typeof node.label === 'string' ? node.label : '';
  assert(
    answer.effect.index === expectedIndex,
    `answered invented an index: the node carries ${JSON.stringify(node.index)} but the answer says ${JSON.stringify(answer.effect.index)}`,
    cex(),
  );
  assert(
    answer.effect.label === expectedLabel,
    `answered invented a label: the node spells ${JSON.stringify(expectedLabel)} but the answer says ${JSON.stringify(answer.effect.label)}`,
    cex(),
  );
  assert(
    answer.effect.namedBy ===
      (typeof entry.label === 'string' ? 'label' : 'recorded-edge'),
    'answered invented a namedBy outside the recorded vocabulary',
    cex(),
  );

  // No read names an index or label the record does not hold, and every edge
  // from the effect node yields either a read (producer placed) or an unplaced
  // entry naming the record's own end — never an invented read.
  const nodeIndexes = new Set(
    record.nodes
      .filter((n) => n && Number.isFinite(n.index))
      .map((n) => n.index),
  );
  const nodeLabels = new Set(
    record.nodes
      .filter((n) => n && typeof n.label === 'string')
      .map((n) => n.label),
  );
  const nodeAt = (index) =>
    record.nodes.find(
      (n) => n && Number.isFinite(n.index) && n.index === index,
    );
  const edgesFromEffect = record.edges.filter(
    (e) => e && e.consumer === answer.effect.index,
  );
  const expectedReads = [];
  const expectedUnplaced = [];
  if (answer.effect.index === null) {
    expectedUnplaced.push({
      end: 'effect',
      value:
        typeof entry.label === 'string' ? entry.label : entry.edge.consumer,
    });
  } else if (
    typeof entry.label !== 'string' &&
    entry.edge.producer !== undefined &&
    !record.edges.some(
      (e) =>
        e &&
        e.consumer === entry.edge.consumer &&
        e.producer === entry.edge.producer,
    )
  ) {
    expectedUnplaced.push({ end: 'producer', value: entry.edge.producer });
  }
  for (const edge of edgesFromEffect) {
    const producer = nodeAt(edge.producer);
    if (producer === undefined) {
      expectedUnplaced.push({ end: 'producer', value: edge.producer });
    } else {
      expectedReads.push({
        index: Number.isFinite(producer.index) ? producer.index : null,
        label: typeof producer.label === 'string' ? producer.label : '',
      });
    }
  }
  assert(
    sameJson(answer.reads, expectedReads),
    'the reads are not exactly the placed producer ends of the record’s edges, in edge order',
    cex(),
  );
  assert(
    sameJson(answer.unplaced, expectedUnplaced),
    'the unplaced list is not exactly the record’s own unplaceable ends, named verbatim',
    cex(),
  );
  for (const read of answer.reads) {
    assert(
      nodeIndexes.has(read.index),
      `a read names index ${JSON.stringify(read.index)} which no node in the record carries`,
      cex(),
    );
    assert(
      nodeLabels.has(read.label),
      `a read names label ${JSON.stringify(read.label)} which no node in the record spells`,
      cex(),
    );
  }
}

function runTutorSignals() {
  const configs = nodeConfigurations();
  const edgeSets = edgeSubsets();

  // Readable graph record: the full grammar over nodes x edges x entries.
  for (const nodes of configs) {
    for (const edges of edgeSets) {
      const graphRecord = {
        path: GRAPH_PATH,
        line: 12,
        graph: { nodes, edges },
      };
      for (const entry of ENTRIES) {
        const records = {
          question: 'what does the effect read',
          graph: graphRecord,
          effect: entry,
        };
        const answer = tutorSignals(records);
        const expected = expectedState(graphRecord, entry);
        checkTutorSignalsAnswer(answer, graphRecord, entry, expected, {
          nodes,
          edges,
        });
      }
    }
  }

  // Unreadable graph records: every fault shape, still combined with every
  // entry — the fold check needs the entry present when the graph is not.
  const sampleNodes = [
    { kind: 'effect', index: 0, label: '' },
    { kind: 'signal', index: 1, label: 'sig' },
  ];
  const sampleEdges = [
    { consumer: 0, producer: 1 },
    { consumer: 0, producer: 9 },
  ];
  const unreadableVariants = [
    undefined,
    { line: 12, graph: { nodes: [], edges: [] } },
    { path: GRAPH_PATH, graph: { nodes: [], edges: [] } },
    { path: GRAPH_PATH, line: 0, graph: { nodes: [], edges: [] } },
    { path: GRAPH_PATH, line: 12 },
    { path: GRAPH_PATH, line: 12, graph: { edges: [] } },
  ];
  for (const graphRecord of unreadableVariants) {
    for (const entry of ENTRIES) {
      const records = {
        question: 'what does the effect read',
        graph: graphRecord,
        effect: entry,
      };
      const answer = tutorSignals(records);
      const expected = expectedState(graphRecord, entry);
      checkTutorSignalsAnswer(answer, graphRecord, entry, expected, {
        nodes: [],
        edges: [],
      });
    }
  }

  // Determinism: a second answer over the same records is byte-identical
  // (spot-checked across the grammar).
  let determinismSamples = 0;
  for (const nodes of configs) {
    for (const edges of edgeSets) {
      determinismSamples += 1;
      if (determinismSamples % 53 !== 0) continue;
      const graphRecord = {
        path: GRAPH_PATH,
        line: 12,
        graph: { nodes, edges },
      };
      for (const entry of ENTRIES) {
        const records = { question: 'q', graph: graphRecord, effect: entry };
        if (!sameJson(tutorSignals(records), tutorSignals(records))) {
          assert(
            false,
            'tutor-signals is not deterministic over identical records',
            { graphRecord, entry },
          );
        }
      }
    }
  }

  // The ordering is built in exactly one place: one declaration of the
  // constant, one `orderingState` builder, and that builder reached from
  // exactly two call sites (the ordering claim and the `ordering` field of
  // `answerOf`) plus its own definition signature — 3 textual `orderingState()`
  // occurrences in total — so no branch of the file can vary it.
  const declarations =
    signals.source.match(
      /const ORDERING_ABSENCE = 'no-write-record-no-order';/g,
    ) ?? [];
  const builders = signals.source.match(/function orderingState\(/g) ?? [];
  const calls = signals.source.match(/orderingState\(\)/g) ?? [];
  assert(
    declarations.length === 1 && builders.length === 1 && calls.length === 3,
    `the ordering is no longer built in exactly one place in tutor-signals.js (declarations: ${declarations.length}, builders: ${builders.length}, builder calls: ${calls.length})`,
    {
      file: 'extension/tutor-signals.js',
      declarations: declarations.length,
      builders: builders.length,
      builderCalls: calls.length,
    },
  );
}

// ===========================================================================
// 2. tutor-foundations.js — the M055 join, five states
// ===========================================================================
const tutorAnswer = foundations.namespace.tutorAnswer;

const QUESTION = 'which artefact states the criterion';

const FOUNDATIONS_MARKERS = {
  'records-unreadable': {
    own: 'no record could be read',
    borrowed: [
      'no criterion matches the question',
      'but no claim of it states',
      'the injected reader reported',
    ],
  },
  'no-matching-criterion': {
    own: 'no criterion matches the question',
    borrowed: ['no record could be read', 'but no claim of it states'],
  },
  'no-artefact-named': {
    own: 'but no claim of it states',
    borrowed: [
      'no criterion matches the question',
      'the injected reader reported',
    ],
  },
  'missing-artefact': {
    own: 'the injected reader reported',
    borrowed: ['no criterion matches the question', 'reported each present'],
  },
  answered: {
    own: 'reported each present',
    borrowed: ['no criterion matches the question', 'no record could be read'],
  },
};

const RECORD_SETS = [
  [],
  [{ path: 'research/raw/r1.json' }],
  [{ record: { milestone: 'M057' } }],
  [{ path: 'research/raw/r1.json', record: 'not-parsed' }],
  [{ path: 'research/raw/r1.json', record: { milestone: 'M057', claims: [] } }],
  [
    {
      path: 'research/raw/r1.json',
      record: { milestone: 'M057', claims: [{ criterion: 'C1' }] },
    },
  ],
  [
    {
      path: 'research/raw/r1.json',
      record: {
        milestone: 'M057',
        claims: [{ criterion: 'C1', artefactPath: 'research/raw/m057.json' }],
      },
    },
  ],
  [
    {
      path: 'research/raw/r1.json',
      record: {
        milestone: 'M057 visual-qa',
        claims: [{ criterion: 'C1', artefactPath: 'research/raw/m057.json' }],
      },
    },
  ],
  [
    {
      path: 'research/raw/r1.json',
      record: {
        milestone: 'M057',
        claims: [{ criterion: 'C2', artefactPath: 'research/raw/other.json' }],
      },
    },
  ],
  [
    {
      path: 'research/raw/r1.json',
      record: {
        milestone: 'M056',
        claims: [{ criterion: 'C1', artefactPath: 'research/raw/m056.json' }],
      },
    },
  ],
  [
    {
      path: 'research/raw/r1.json',
      record: {
        milestone: 'M057',
        claims: [
          { criterion: 'C1', artefactPath: 'research/raw/a.json' },
          { criterion: 'C1', artefactPath: 'research/raw/b.json' },
        ],
      },
    },
  ],
  [
    {
      path: 'research/raw/r1.json',
      record: {
        milestone: 'M057',
        claims: [
          { criterion: 'C1', artefactPath: 'research/raw/a.json' },
          'not-a-claim',
          { criterion: 'C2' },
        ],
      },
    },
  ],
];

const INDEX_ROWS = [
  undefined,
  [],
  { rows: [] },
  { rows: [{ question: QUESTION, criterion: 'C1', milestone: 'M057' }] },
  {
    rows: [
      {
        question: 'another question entirely',
        criterion: 'C1',
        milestone: 'M057',
      },
    ],
  },
  { rows: [{ question: QUESTION, criterion: 'C2', milestone: 'M057' }] },
  { rows: [{ question: QUESTION, criterion: 'C1', milestone: 'M099' }] },
  [{ question: QUESTION, criterion: 'C1', milestone: 'M057' }],
];

const READERS = [
  undefined,
  () => true,
  () => false,
  (p) => p === 'research/raw/a.json',
];

function milestoneIdOf(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  const space = trimmed.search(/\s/);
  return space === -1 ? trimmed : trimmed.slice(0, space);
}

function expectedFoundations(reader, records, index) {
  // The contract order: instrument, then records, then mapping, then
  // criterion, then field, then presence.
  if (!reader || typeof reader.exists !== 'function')
    return { state: 'records-unreadable' };
  const readable = (Array.isArray(records) ? records : []).filter(
    (e) =>
      e &&
      typeof e === 'object' &&
      typeof e.path === 'string' &&
      e.record &&
      typeof e.record === 'object',
  );
  if (readable.length === 0) return { state: 'records-unreadable' };
  const rows = Array.isArray(index)
    ? index
    : index && typeof index === 'object' && Array.isArray(index.rows)
      ? index.rows
      : [];
  const row = rows.find(
    (r) => r && typeof r === 'object' && r.question === QUESTION,
  );
  if (!row) return { state: 'no-matching-criterion' };

  const id = milestoneIdOf(row.milestone);
  const criterion = typeof row.criterion === 'string' ? row.criterion : '';
  let owner = null;
  const paths = [];
  for (const entry of readable) {
    if (milestoneIdOf(entry.record.milestone) !== id) continue;
    const claims = Array.isArray(entry.record.claims)
      ? entry.record.claims
      : [];
    for (const claim of claims) {
      if (!claim || typeof claim !== 'object' || claim.criterion !== criterion)
        continue;
      if (owner === null) owner = entry;
      if (typeof claim.artefactPath === 'string')
        paths.push(claim.artefactPath);
    }
  }
  if (owner === null) return { state: 'no-matching-criterion' };
  if (paths.length === 0) return { state: 'no-artefact-named' };
  const missing = paths.filter((p) => reader.exists(p) !== true);
  if (missing.length > 0) return { state: 'missing-artefact', paths: missing };
  return { state: 'answered', paths };
}

function runFoundations() {
  for (const reader of READERS) {
    for (const records of RECORD_SETS) {
      for (const index of INDEX_ROWS) {
        const supplied = {
          exists: reader,
          records,
          index,
        };
        const answer = tutorAnswer(QUESTION, supplied);
        const expected = expectedFoundations(supplied ?? {}, records, index);
        const cex = () => ({
          question: QUESTION,
          sources: supplied,
          expected: expected.state,
          answer,
        });

        assert(
          answer.state === expected.state,
          `tutor-foundations decided ${JSON.stringify(answer.state)} where the contract order decides ${JSON.stringify(expected.state)}`,
          cex(),
        );

        const markers = FOUNDATIONS_MARKERS[answer.state];
        if (markers) {
          assert(
            answer.detail.includes(markers.own),
            `the ${answer.state} detail does not state its own absence/answer`,
            cex(),
          );
          for (const borrowed of markers.borrowed) {
            assert(
              !answer.detail.includes(borrowed),
              `the ${answer.state} detail borrows another state's sentence (contains ${JSON.stringify(borrowed)})`,
              cex(),
            );
          }
        }

        // No answer invents an artefact path: every rendered path is one the
        // supplied records state in claims[].artefactPath, verbatim.
        const stated = new Set();
        for (const entry of records) {
          const record =
            entry && typeof entry === 'object' ? entry.record : undefined;
          const claims =
            record && typeof record === 'object' && Array.isArray(record.claims)
              ? record.claims
              : [];
          for (const claim of claims) {
            if (
              claim &&
              typeof claim === 'object' &&
              typeof claim.artefactPath === 'string'
            ) {
              stated.add(claim.artefactPath);
            }
          }
        }
        for (const p of answer.artefactPaths) {
          assert(
            stated.has(p),
            `the answer names artefact path ${JSON.stringify(p)} which no supplied record states`,
            cex(),
          );
        }

        // Verbatim echo: the question is trimmed, the criterion is the claim's
        // own value, the milestone the record's own field spelling.
        assert(
          answer.question === QUESTION,
          'the question is not echoed verbatim (trimmed)',
          cex(),
        );
        if (
          answer.state === 'answered' ||
          answer.state === 'missing-artefact' ||
          answer.state === 'no-artefact-named'
        ) {
          assert(
            typeof answer.milestone === 'string' &&
              milestoneIdOf(answer.milestone) === milestoneIdOf('M057'),
            `the answer names milestone ${JSON.stringify(answer.milestone)} which no M057 record states`,
            cex(),
          );
          assert(
            answer.criterion === 'C1' || answer.criterion === 'C2',
            'the answer invented a criterion',
            cex(),
          );
        } else if (answer.state === 'records-unreadable') {
          assert(
            answer.criterion === null,
            'records-unreadable names a criterion',
            cex(),
          );
        }

        // Determinism spot-check.
        if ((checksRun + records.length + 1) % 41 === 0) {
          assert(
            sameJson(tutorAnswer(QUESTION, supplied), answer),
            'tutor-foundations is not deterministic over identical inputs',
            cex(),
          );
        }
      }
    }
  }
}

// ===========================================================================
// 3. render-phase.js — the M039 join, its own absences and phase
// ===========================================================================
const renderPhaseFn = renderPhase.namespace.renderPhase;

const PHASE_ABSENCE = { state: 'cannot-tell', absence: 'no-effect-event' };

const RP_NODE_CONFIGS = [
  [],
  [{ kind: 'effect', index: 0, label: 'Resource.loadEffect' }],
  [{ kind: 'effect', index: 0, label: '' }],
  [{ kind: 'effect', index: null, label: 'lone' }],
  [{ kind: 'effect', index: 5, label: '' }],
  [{ kind: 'signal', index: 0, label: 'sig' }],
  [
    { kind: 'effect', index: 0, label: 'dup' },
    { kind: 'effect', index: 1, label: 'dup' },
  ],
  [
    { kind: 'effect', index: 0, label: 'a' },
    { kind: 'signal', index: 1, label: 'sig' },
  ],
  [
    { kind: 'signal', index: 0, label: 'sig' },
    { kind: 'signal', index: 1, label: 'sig2' },
  ],
  [
    { kind: 'effect', index: 0, label: 'a' },
    { kind: 'effect', index: null, label: '' },
    { kind: 'effect', index: 2, label: 'c' },
  ],
];

const RP_EDGE_SETS = [
  [],
  [{ consumer: 0, producer: 1 }],
  [{ consumer: 0, producer: 9 }],
  [{ consumer: 9, producer: 1 }],
  [
    { consumer: 0, producer: 1 },
    { consumer: 0, producer: 9 },
  ],
];

const RP_EFFECTS = [
  undefined,
  { label: 'Resource.loadEffect' },
  { label: '' },
  { label: 'missing' },
  { edge: { consumer: 0 } },
  { edge: { consumer: 0, producer: 1 } },
  { edge: { consumer: 9 } },
  {},
];

const RP_ERRORS = [
  undefined,
  { code: 'NG0950', message: 'm', provenance: 'p' },
];

const RP_GRAPHS = [undefined, {}, { nodes: [] }, { nodes: [], edges: [] }];

function rpEffectSubjectOk(graph, effect) {
  if (!effect || typeof effect !== 'object') return null;
  const nodes = graph.nodes.filter(
    (n) => n && typeof n === 'object' && n.kind === 'effect',
  );
  const trim = (v) =>
    typeof v === 'string' && v.trim() !== '' ? v.trim() : null;
  const label = trim(effect.label);
  if (label !== null) {
    const named = nodes.filter((n) => trim(n.label) === label);
    return named.length === 1 ? named[0] : null;
  }
  const edge = effect.edge;
  if (!edge || typeof edge !== 'object' || !Number.isFinite(edge.consumer))
    return null;
  const named = nodes.filter(
    (n) => (Number.isFinite(n.index) ? n.index : null) === edge.consumer,
  );
  if (named.length !== 1) return null;
  if (edge.producer !== undefined) {
    const recorded = graph.edges.filter(
      (e) =>
        e &&
        typeof e === 'object' &&
        e.consumer === edge.consumer &&
        e.producer === edge.producer,
    );
    if (recorded.length !== 1) return null;
  }
  return named[0];
}

function runRenderPhase() {
  for (const graphShape of RP_GRAPHS) {
    const graphReadable =
      graphShape &&
      typeof graphShape === 'object' &&
      Array.isArray(graphShape.nodes) &&
      Array.isArray(graphShape.edges);
    for (const nodes of graphReadable ? RP_NODE_CONFIGS : [undefined]) {
      for (const edges of graphReadable ? RP_EDGE_SETS : [undefined]) {
        const graph = graphReadable ? { nodes, edges } : graphShape;
        for (const effect of RP_EFFECTS) {
          for (const error of RP_ERRORS) {
            const fact = { graph, effect, error };
            const answer = renderPhaseFn(fact);
            const cex = () => ({ fact, answer });

            // The phase is the one constant on every answer.
            assert(
              sameJson(answer.phase, PHASE_ABSENCE),
              'render-phase answered a phase other than the single no-effect-event absence',
              cex(),
            );

            // The decision order: graph, then effect node, then subject.
            if (!graphReadable) {
              assert(
                answer.findings.length === 1 &&
                  answer.findings[0].state === 'cannot-tell' &&
                  answer.findings[0].reason === 'graph-unreadable',
                'an unread graph did not answer exactly the graph-unreadable absence',
                cex(),
              );
              continue;
            }
            const effectNodes = nodes.filter((n) => n && n.kind === 'effect');
            if (effectNodes.length === 0) {
              assert(
                answer.findings.length === 1 &&
                  answer.findings[0].state === 'cannot-tell' &&
                  answer.findings[0].reason === 'no-effect-node',
                'a readable graph without an effect node did not answer exactly no-effect-node',
                cex(),
              );
              continue;
            }
            const subject = rpEffectSubjectOk(graph, effect);
            if (subject === null) {
              assert(
                answer.findings.length === 1 &&
                  answer.findings[0].state === 'cannot-tell' &&
                  answer.findings[0].reason === 'effect-unreadable',
                'an unresolvable subject did not answer exactly effect-unreadable',
                cex(),
              );
              continue;
            }

            // answered: effect first, then the change-detection finding only
            // if the fact carried one — never merged, never reordered.
            assert(
              answer.findings[0].state === 'effect',
              'the effect finding is not first among the findings',
              cex(),
            );
            const expectedLabel =
              typeof subject.label === 'string' && subject.label.trim() !== ''
                ? subject.label.trim()
                : null;
            assert(
              answer.findings[0].effect === expectedLabel,
              `the effect finding names ${JSON.stringify(answer.findings[0].effect)} where the graph spells ${JSON.stringify(expectedLabel)}`,
              cex(),
            );
            const graphLabels = new Set(
              nodes
                .filter(
                  (n) =>
                    n && typeof n.label === 'string' && n.label.trim() !== '',
                )
                .map((n) => n.label.trim()),
            );
            for (const read of answer.findings[0].reads) {
              assert(
                graphLabels.has(read),
                `a read names ${JSON.stringify(read)} which no node in the graph spells`,
                cex(),
              );
            }
            if (error === undefined) {
              assert(
                answer.findings.length === 1,
                'a fact without a recorded message produced more than the effect finding',
                cex(),
              );
            } else {
              assert(
                answer.findings.length === 2 &&
                  answer.findings[1].state === 'change-detection',
                'a recorded message did not answer as its own change-detection finding after the effect',
                cex(),
              );
            }
          }
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Run and report
// ---------------------------------------------------------------------------
runTutorSignals();
runFoundations();
runRenderPhase();

const elapsedMs = Date.now() - t0;
if (failures.length > 0) {
  console.error(
    `FAIL — ${failures.length} recorded failure(s)${failures.length >= FAILING_CAP ? ' (cap reached)' : ''} after ${checksRun} assertions in ${elapsedMs} ms\n`,
  );
  for (const { message, counterexample } of failures) {
    console.error(`COUNTEREXAMPLE: ${message}`);
    console.error(JSON.stringify(counterexample, null, 2));
    console.error('');
  }
  process.exit(1);
}
console.log(
  `PASS — prove-join-absence-folding: ${checksRun} assertions over the bounded record grammar, ` +
    `all three joins run as the real modules in a bare node:vm context; ${elapsedMs} ms`,
);
