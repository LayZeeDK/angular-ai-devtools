// @ts-check
// Run: node --test scripts/tutor-signals-shapes.test.mjs
//
// M057 T001 measured what the two records the answer may cite actually carry, and what no record
// carries. `research/raw/m057-record-shapes.json` is that measurement: the graph side
// (`serializeGraph` and the one per-check field that carries its result, read for `index`, `kind`
// and `label` per node and the two ends per edge) and the render/effect side (`renderPhase`, the
// effect finding's four fields, its read list, and the three published absences).
//
// A record nobody re-reads drifts the way a comment does, so this suite holds the recording to the
// tree, four ways:
//
//   citations    every `path:line` the recording makes is re-resolved by reading the file it names
//                and searching that file for the exact line the recording quotes — never by
//                trusting the typed number, and never by trusting the quotation either. A citation
//                that slid off its line reddens naming the citation it belongs to.
//   the field map
//                the field names each side declares are asserted as a set, so a wave that names a
//                field the recording does not declare reddens here rather than in a later wave.
//   the first negative
//                "no write record, no order" is re-derived from the tree: the extension/ scan for
//                the five write-record needles, and the union of every edge key under research/raw.
//                The count it excluded as build output is re-derived too — the panel tree's own
//                walk, which is the one number in the recording a panel build moves.
//   the second negative
//                re-derived too, and it did not hold as the plan stated it: records do carry effect
//                nodes, one of them in the recorded shape with an index. The suite asserts the
//                measured numbers rather than the plan's prose, and re-runs the existing join to
//                show the record is answerable.
//
// Nothing here builds: no join, no capture, no surface and no route. It reads the records, the
// source they cite, and the one existing reader, and it writes nothing.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RECORD = 'research/raw/m057-record-shapes.json';
const RAW = 'research/raw';
const SELF = 'm057-record-shapes.json';
const RECORDING = JSON.parse(readFileSync(join(ROOT, RECORD), 'utf8'));

/** The five needles the intent's first measurement used, in order. */
const WRITE_NEEDLES = Object.freeze([
  'writeRecord',
  'write_record',
  'writeLog',
  'writeOrder',
  'writes:',
]);

/** Field names that would order a write if a graph edge carried one. */
const ORDERISH = Object.freeze([
  'order',
  'seq',
  'sequence',
  'time',
  'at',
  'timestamp',
  'moment',
  'before',
  'after',
  'phase',
  'when',
]);

/** The build output under `extension/`, gitignored, excluded from the authored-source scan. */
const BUILD_OUTPUT = 'extension/panel/';

/** @param {string} p a repo-relative path */
function readLines(p) {
  return readFileSync(join(ROOT, p), 'utf8').split(/\r?\n/);
}

/** @param {string} dir a repo-relative directory @returns {string[]} repo-relative file paths */
function walkDir(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...walkDir(rel));
    else out.push(rel.split(sep).join('/'));
  }
  return out.sort();
}

/** Every citation, by id. */
const BY_ID = new Map(RECORDING.citations.map((c) => [c.id, c]));

/**
 * Resolve a citation id to its cited line's text at this head.
 * @param {string} id
 */
function citedText(id) {
  const c = BY_ID.get(id);
  assert.ok(c, `the recording cites no line with id \`${id}\``);
  return readLines(c.path)[c.line - 1].trim();
}

// --------------------------------------------------------------- the field map ----

test('the recording declares the two sides an answer may cite', () => {
  assert.equal(RECORDING.milestone, 'M057');
  assert.equal(RECORDING.task, 'T001');
  assert.match(RECORDING.base, /^[0-9a-f]{40}$/);
  assert.ok(RECORDING.graphSide, 'no graph side declared');
  assert.ok(RECORDING.renderEffectSide, 'no render/effect side declared');
});

test('the graph side is the serializer and the one per-check carry', () => {
  const where = RECORDING.graphSide.whereAGraphReachesARecord;
  assert.deepEqual(where.citationIds, ['serializeGraph', 'perCheckCarry']);
  assert.equal(citedText('serializeGraph'), 'function serializeGraph(graph) {');
  assert.equal(citedText('perCheckCarry'), 'graph: serializeGraph(graph),');
});

test('a node is read for index, kind and label and every other field is ignored', () => {
  const node = RECORDING.graphSide.node;
  assert.deepEqual(node.read, ['index', 'kind', 'label']);
  for (const ignored of ['id', 'epoch', 'value', 'debuggableFn']) {
    assert.ok(
      node.ignored.some((f) => f.startsWith(ignored)),
      `the recording does not declare \`${ignored}\` ignored`,
    );
  }
  assert.equal(
    citedText('nodeFieldsRead'),
    '//                     …] }`, the shape the recordings carry. Only `index`, `kind` and `label` of a',
  );
});

test('an edge is its two ends and nothing else', () => {
  const edge = RECORDING.graphSide.edge;
  assert.deepEqual(edge.read, ['consumer', 'producer']);
  assert.match(
    citedText('edgeIsTwoMembers'),
    /an edge is `\{ consumer, producer \}`/,
  );
  assert.match(
    citedText('edgeIsDirectionOnly'),
    /no field, no value, no moment/,
  );
});

test('the serializer writes an id, never an index', () => {
  const serialized = RECORDING.graphSide.whatTheSerializerItselfWrites;
  assert.deepEqual(serialized.nodeFieldsNotWritten, ['index']);
  assert.ok(serialized.nodeFieldsWritten.includes('id'));
  assert.equal(citedText('serializedNodeId'), 'id: String(n.id),');
  assert.doesNotMatch(citedText('serializedNodeId'), /index/);
  assert.equal(
    citedText('serializedEdgeEnds'),
    'edges.push({ consumer: consumerId, producer: producerId });',
  );
});

test('the render/effect entry declares the effect finding and its read list', () => {
  const side = RECORDING.renderEffectSide;
  assert.deepEqual(side.effectFinding.fields, [
    'state',
    'effect',
    'namedBy',
    'reads',
  ]);
  assert.equal(
    citedText('effectFindingSignature'),
    'function effectFinding(name, namedBy, reads) {',
  );
  assert.equal(side.readList.name, 'reads');
  assert.equal(citedText('readsOfPushesLabel'), 'reads.push(label);');
  assert.match(citedText('readsOfSignature'), /^function readsOf\(/);
});

test('the three absences are declared and distinct', () => {
  const absences = RECORDING.renderEffectSide.publishedAbsences;
  const reasons = absences.map((a) => a.reason);
  assert.ok(reasons.includes('graph-unreadable'));
  assert.ok(reasons.includes('no-effect-node'));
  assert.equal(
    new Set(reasons).size,
    reasons.length,
    'two absences share a name',
  );
  assert.match(citedText('graphUnreadableReturn'), /GRAPH_UNREADABLE/);
  assert.match(citedText('noEffectNodeReturn'), /NO_EFFECT_NODE/);
});

test('the two findings are never joined', () => {
  assert.match(citedText('changeDetectionNeverJoined'), /never joined/);
  assert.match(
    citedText('changeDetectionPushed'),
    /findings\.push\(changeDetectionFinding\(read\.error\)\)/,
  );
});

// ---------------------------------------------------------------- the citations ----

test('every citation carries the cited line’s own trimmed text', () => {
  assert.ok(RECORDING.citations.length > 0, 'the recording makes no citations');
  for (const c of RECORDING.citations) {
    const lines = readLines(c.path);
    assert.ok(
      c.line >= 1 && c.line <= lines.length,
      `${c.id}: ${c.path}:${c.line} is past the end of the file`,
    );
    assert.equal(
      lines[c.line - 1].trim(),
      c.text,
      `${c.id}: ${c.path}:${c.line} no longer reads as the recording quotes it`,
    );
  }
});

test('every citation is re-resolved by searching its file for the quoted line', () => {
  for (const c of RECORDING.citations) {
    const lines = readLines(c.path);
    const hits = [];
    for (let i = 0; i < lines.length; i += 1) {
      if (lines[i].trim() === c.text) hits.push(i + 1);
    }
    assert.ok(
      hits.includes(c.line),
      `${c.id}: searching ${c.path} for the quoted line finds it at ${JSON.stringify(hits)}, not ${c.line}`,
    );
  }
});

test('every citation id is unique and every reference resolves', () => {
  const ids = RECORDING.citations.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, 'two citations share an id');
  const referenced = [
    ...RECORDING.graphSide.whereAGraphReachesARecord.citationIds,
    ...RECORDING.graphSide.recordedShape.citationIds,
    ...RECORDING.graphSide.node.citationIds,
    ...RECORDING.graphSide.edge.citationIds,
    ...RECORDING.graphSide.whatTheSerializerItselfWrites.citationIds,
    ...RECORDING.renderEffectSide.join.citationIds,
    ...RECORDING.renderEffectSide.effectFinding.citationIds,
    ...RECORDING.renderEffectSide.readList.citationIds,
    ...RECORDING.renderEffectSide.publishedAbsences.flatMap(
      (a) => a.citationIds,
    ),
    ...RECORDING.renderEffectSide.neverMerged.citationIds,
    ...RECORDING.renderEffectSide.purity.citationIds,
  ];
  for (const id of referenced) {
    assert.ok(
      BY_ID.has(id),
      `the recording references an unknown citation \`${id}\``,
    );
  }
});

// -------------------------------------------------------- the first negative ----

test('no write record exists anywhere in extension/', () => {
  const walked = walkDir('extension');
  const authored = walked.filter((f) => !f.startsWith(BUILD_OUTPUT));
  const buildOutput = walked.filter((f) => f.startsWith(BUILD_OUTPUT));
  const found = [];
  for (const needle of WRITE_NEEDLES) {
    for (const f of authored) {
      const lines = readLines(f);
      for (let i = 0; i < lines.length; i += 1) {
        if (lines[i].toLowerCase().includes(needle.toLowerCase()))
          found.push({ needle, path: f, line: i + 1 });
      }
    }
  }

  const stated = RECORDING.negativeMeasurements.writeRecord;
  assert.equal(stated.holds, true);
  assert.ok(
    authored.length >= stated.filesScanned,
    `the authored files under extension/ grow whenever a milestone lands a module, so M057's ${stated.filesScanned} is a floor rather than a fixed size: this head carries ${authored.length}. A shrink would mean modules went missing, which is the state worth reddening; growth is the milestone pattern`,
  );
  assert.equal(
    buildOutput.length,
    stated.filesExcludedAsBuildOutput,
    `negativeMeasurements.writeRecord.filesExcludedAsBuildOutput is ${stated.filesExcludedAsBuildOutput} but the ${BUILD_OUTPUT} build output this tree carries is ${buildOutput.length} file(s): the panel rebuild moved the count the recording excludes`,
  );

  const key = (m) => `${m.needle} ${m.path}:${m.line}`;
  assert.deepEqual(
    found.map(key).sort(),
    stated.matches.map(key).sort(),
    'the write-record scan no longer matches what the recording states',
  );

  // The measurement's conclusion: nothing here is a record of a write.
  for (const needle of [
    'writeRecord',
    'write_record',
    'writeLog',
    'writeOrder',
  ]) {
    assert.equal(
      found.filter((m) => m.needle === needle).length,
      0,
      `\`${needle}\` now matches somewhere in extension/`,
    );
  }
});

test('no edge carries a field to order a write in', () => {
  const files = readdirSync(join(ROOT, RAW)).filter(
    (f) => f.endsWith('.json') && f !== SELF,
  );
  /** @type {Map<string, number>} */
  const edgeKeys = new Map();
  /** @type {any[]} */
  const stack = [];
  for (const f of files) {
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(join(ROOT, RAW, f), 'utf8'));
    } catch {
      continue;
    }
    stack.push(parsed);
    while (stack.length > 0) {
      const o = stack.pop();
      if (!o || typeof o !== 'object') continue;
      if (Array.isArray(o)) {
        stack.push(...o);
        continue;
      }
      if (Array.isArray(o.edges)) {
        for (const e of o.edges) {
          if (!e || typeof e !== 'object') continue;
          for (const k of Object.keys(e))
            edgeKeys.set(k, (edgeKeys.get(k) ?? 0) + 1);
        }
      }
      stack.push(...Object.values(o));
    }
  }

  const stated = RECORDING.negativeMeasurements.noEdgeCarriesAnOrderField;
  const orderish = [...edgeKeys.keys()].filter((k) =>
    ORDERISH.includes(k.toLowerCase()),
  );
  assert.deepEqual(orderish, [], 'an edge now carries an order-ish field');
  assert.deepEqual(orderish, stated.orderishEdgeKeys);
  assert.deepEqual(
    Object.fromEntries(
      [...edgeKeys.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    ),
    Object.fromEntries(
      Object.entries(stated.edgeKeys).sort((a, b) => a[0].localeCompare(b[0])),
    ),
    'the edge vocabulary under research/raw moved',
  );
});

test('the answer’s ordering vocabulary is the named absence and not a capture', () => {
  const stated = RECORDING.negativeMeasurements.writeRecord;
  assert.equal(stated.claim, 'no write record, no order');
  assert.equal(stated.holds, true);
  assert.match(
    stated.conclusion,
    /No write record exists anywhere in extension/,
  );
});

// ------------------------------------------------------- the second negative ----

/**
 * Walk every record under `research/raw/` (except the recording itself) and return what the
 * second measurement is about: objects carrying `kind: "effect"`, and objects carrying both a
 * `nodes` and an `edges` list.
 */
function scanRecords() {
  const files = readdirSync(join(ROOT, RAW)).filter(
    (f) => f.endsWith('.json') && f !== SELF,
  );
  /** @type {{file: string, pointer: string}[]} */
  const effectObjects = [];
  /** @type {{file: string, pointer: string, nodes: number, nodesWithIndex: number, edgeShape: string, effectNodes: number}[]} */
  const graphs = [];

  /** @param {any} o @param {string} file @param {string} ptr @param {number} depth */
  const walk = (o, file, ptr, depth) => {
    if (depth > 60 || !o || typeof o !== 'object') return;
    if (Array.isArray(o)) {
      for (let i = 0; i < o.length; i += 1)
        walk(o[i], file, `${ptr}[${i}]`, depth + 1);
      return;
    }
    if (o.kind === 'effect') effectObjects.push({ file, pointer: ptr || '/' });
    if (Array.isArray(o.nodes)) {
      const nodes = o.nodes;
      const effects = nodes.filter((n) => n && n.kind === 'effect');
      let edgeShape = 'no-edges-array';
      if (Array.isArray(o.edges)) {
        const edges = o.edges;
        if (edges.length === 0) edgeShape = 'empty';
        else if (
          edges.every(
            (e) =>
              e && typeof e === 'object' && 'consumer' in e && 'producer' in e,
          )
        )
          edgeShape = 'object-ends';
        else if (edges.every((e) => typeof e === 'string'))
          edgeShape = 'string-ends';
        else edgeShape = 'mixed';
      }
      graphs.push({
        file,
        pointer: ptr || '/',
        nodes: nodes.length,
        nodesWithIndex: nodes.filter((n) => n && 'index' in n).length,
        edgeShape,
        effectNodes: effects.length,
      });
    }
    for (const k of Object.keys(o)) walk(o[k], file, `${ptr}/${k}`, depth + 1);
  };

  for (const f of files) {
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(join(ROOT, RAW, f), 'utf8'));
    } catch {
      continue;
    }
    walk(parsed, f, '', 0);
  }
  return { files, effectObjects, graphs };
}

test('the second measurement is re-run over the tree, not read back', () => {
  const stated = RECORDING.negativeMeasurements.effectNodeInARecord;
  const { files, effectObjects, graphs } = scanRecords();

  assert.ok(
    files.length >= stated.jsonFilesScanned,
    `the scan reads every JSON record under research/raw, so its file count grows with each milestone that lands one: M057 captured ${stated.jsonFilesScanned} and this head carries ${files.length}. A count that describes a scope is not a measurement of the tree, so this pin is a floor rather than an equality — a shrink would mean records went missing, which is the state worth reddening`,
  );
  assert.equal(graphs.length, stated.graphBearingObjects);
  assert.equal(effectObjects.length, stated.objectsCarryingKindEffect);
  assert.equal(
    stated.effectNodes.length,
    stated.effectNodesInsideANodesArray,
    'the recording’s two effect counts disagree',
  );
  assert.deepEqual(
    [...new Set(effectObjects.map((e) => e.file))].sort(),
    stated.filesCarryingKindEffect,
    'the records carrying an effect node moved',
  );

  // The plan stated this does not happen. It does, and the recording says so.
  assert.equal(
    stated.holds,
    false,
    'the recording claims the plan’s second negative still holds',
  );
  assert.ok(effectObjects.length > 0);
});

test('exactly one record holds an effect node in the recorded shape', () => {
  const stated = RECORDING.negativeMeasurements.effectNodeInARecord;
  const { graphs } = scanRecords();
  const recordedShape = graphs.filter(
    (g) => g.nodesWithIndex > 0 && g.edgeShape === 'object-ends',
  );
  assert.deepEqual(
    recordedShape.map((g) => `${g.file}${g.pointer}`),
    stated.objectsInTheRecordedShape.map((g) => `${g.file}${g.pointer}`),
    'the recorded-shape graph set moved',
  );
  const withEffect = recordedShape.filter((g) => g.effectNodes > 0);
  assert.deepEqual(
    withEffect.map((g) => `${g.file}${g.pointer}`),
    stated.recordedShapeObjectsWithAnEffectNode,
  );
  assert.equal(withEffect.length, 1);
  assert.equal(withEffect[0].file, 'm039-render-phase.json');
  assert.equal(withEffect[0].pointer, '/effect/freshRead');
});

test('the closest record carries an indexed effect node, unlike the plan’s prose', () => {
  const rec = JSON.parse(
    readFileSync(join(ROOT, RAW, 'm039-render-phase.json'), 'utf8'),
  );

  // fromRecording: the derived reading the plan described — kind and label only, no index.
  for (const n of rec.effect.fromRecording.nodes) {
    assert.deepEqual(Object.keys(n).sort(), ['kind', 'label']);
    assert.equal('index' in n, false);
  }

  // freshRead: the same file's measured graph, in the recorded shape, with an index.
  const fresh = rec.effect.freshRead;
  assert.equal(fresh.nodes.length, 6);
  for (const n of fresh.nodes) assert.equal(typeof n.index, 'number');
  const effect = fresh.nodes.find((n) => n.kind === 'effect');
  assert.ok(effect, 'freshRead holds no effect node');
  assert.equal(effect.index, 5);
  assert.equal(effect.label, '');
  assert.equal(fresh.nodeIndex, 5);
  for (const e of fresh.allEdges) {
    assert.equal(typeof e.consumer, 'number');
    assert.equal(typeof e.producer, 'number');
  }
});

test('the existing join answers from that record without authoring anything', () => {
  const stated = RECORDING.negativeMeasurements.effectNodeInARecord;
  const rec = JSON.parse(
    readFileSync(join(ROOT, RAW, 'm039-render-phase.json'), 'utf8'),
  );
  const fresh = rec.effect.freshRead;

  const context = createContext({});
  runInContext(
    readFileSync(join(ROOT, 'extension/render-phase.js'), 'utf8'),
    context,
  );
  const answer = context.angularAiRenderPhase.renderPhase({
    graph: { nodes: fresh.nodes, edges: fresh.allEdges },
    effect: {
      edge: { consumer: fresh.nodeIndex, producer: fresh.edges[0].producer },
    },
  });

  // The answer is built inside the vm realm, so its prototypes belong to that realm: compare the
  // plain data, not the identity of the objects that carry it.
  const plain = JSON.parse(JSON.stringify(answer));
  assert.deepEqual(plain, stated.theJoinAnswersFromThatRecord.answer);
  assert.equal(answer.findings.length, 1);
  assert.deepEqual(plain.findings[0], {
    state: 'effect',
    effect: null,
    namedBy: 'recorded-edge',
    reads: ['count'],
  });
  assert.deepEqual(plain.phase, {
    state: 'cannot-tell',
    absence: 'no-effect-event',
  });
});

test('the recording states what no record carries: an index in the serializer’s output', () => {
  const instead =
    RECORDING.negativeMeasurements.effectNodeInARecord
      .whatNoRecordCarriesInstead;
  assert.match(instead.description, /serializeGraph/);
  assert.match(instead.description, /never by `index`/);
  assert.match(instead.conclusion, /capture \(T003\)/);
});

test('every premise the measurement refuted is stated as refuted', () => {
  const corrections = RECORDING.premiseCorrections;
  assert.ok(corrections.length >= 3, 'the refuted premises are not recorded');
  const refuted = corrections.filter((c) => c.correct === false);
  assert.ok(refuted.length >= 3);
  for (const c of refuted) {
    assert.ok(c.premise.length > 0);
    assert.ok(c.measured.length > 0);
  }
});

// ------------------------------------------------------------------- nothing built ----

test('nothing was built', () => {
  assert.deepEqual(RECORDING.builtNothing.built, []);
  assert.match(
    RECORDING.builtNothing.description,
    /No join, no capture, no surface and no route/,
  );
});
