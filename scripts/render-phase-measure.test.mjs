// @ts-check
//
// M039 T001 — the profiler's event vocabulary, a live NG0100 attempt and the
// effect's edges, re-derived at this head.
//
// The three questions this file settles:
//
//   profiler  Which `ProfilerEvent` values the installed `@angular/core`
//             declares, as name and number, in the panel package and in the
//             fixture's own copy — and whether any of them is an effect event.
//             The reader below is the thing that derives that list; the
//             recording only holds what the same reader found, so a point
//             release that adds an effect event reddens this file instead of
//             leaving the milestone asserting a fact about an older install.
//   effect    What the graph carries for an effect: kind, label (or the
//             measured fact that the label is empty), epoch, its edges and the
//             signals those edges name — read from the 2026-10-12 probe
//             recording and from a fresh read of the same page, each with its
//             own provenance.
//   phase     Whether a node of kind `afterRenderEffectPhase` exists on a page
//             that uses `afterRenderEffect`, and whether any node carries a
//             phase field at all. Declared is not observed, and this file is
//             what keeps the two apart.
//
// The fourth section, `changeDetection`, is a live attempt that produced no
// NG0100; its negative is pinned here, together with the digest entry that
// stands in for the message as a substitute — never as a capture.
//
// Read-only: no build, no browser, no page, no write. The live attempt belongs
// to the recording's provenance, and its repetition is a later task's armed
// capture.
//
// Run the checks:
//   node --experimental-strip-types --test scripts/render-phase-measure.test.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SELF_PATH = fileURLToPath(import.meta.url);

const RECORD_PATH = join(ROOT, 'research', 'raw', 'm039-render-phase.json');
const EFFECT_RECORDING_PATH = join(
  ROOT,
  'research',
  'raw',
  'effect-writes.json',
);
const DIGEST_PATH = join(ROOT, 'extension', 'error-digest.json');
const AGENT_PATH = join(ROOT, 'extension', 'agent-main.js');
const FIXTURE_SRC = join(ROOT, 'spikes', 'ng222-app', 'src');
const COUNTER_PAGE = join(FIXTURE_SRC, 'app', 'counter.ts');

/** The two installed copies of `@angular/core` this head carries. */
const PANEL = {
  label: 'panel',
  manifest: join(ROOT, 'node_modules', '@angular', 'core', 'package.json'),
  chunk: join(
    ROOT,
    'node_modules',
    '@angular',
    'core',
    'fesm2022',
    '_debug_node-chunk.mjs',
  ),
  types: join(ROOT, 'node_modules', '@angular', 'core', 'types', 'core.d.ts'),
  kinds: join(
    ROOT,
    'node_modules',
    '@angular',
    'core',
    'types',
    '_formatter-chunk.d.ts',
  ),
};
const FIXTURE = {
  label: 'fixture',
  manifest: join(
    ROOT,
    'spikes',
    'ng222-app',
    'node_modules',
    '@angular',
    'core',
    'package.json',
  ),
  chunk: join(
    ROOT,
    'spikes',
    'ng222-app',
    'node_modules',
    '@angular',
    'core',
    'fesm2022',
    '_debug_node-chunk.mjs',
  ),
  types: join(
    ROOT,
    'spikes',
    'ng222-app',
    'node_modules',
    '@angular',
    'core',
    'types',
    'core.d.ts',
  ),
  kinds: join(
    ROOT,
    'spikes',
    'ng222-app',
    'node_modules',
    '@angular',
    'core',
    'types',
    '_formatter-chunk.d.ts',
  ),
};

const PACKAGES = [PANEL, FIXTURE];

/** How the tail of a file reads as a source citation: `path:12-34`. */
const CITATION = /^([^:]+):(\d+)-(\d+)$/;

// ---------------------------------------------------------------- helpers ----

function fail(message) {
  throw new Error(message);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function displayPath(path) {
  return relative(ROOT, path).split(sep).join('/');
}

function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

function clone(record) {
  return JSON.parse(JSON.stringify(record));
}

function requireFile(path, why) {
  assert.ok(existsSync(path), `${displayPath(path)} is missing — ${why}`);
  return path;
}

function strings(record, keys, where) {
  if (!isObject(record)) fail(`missing ${where}`);
  for (const key of keys) {
    if (typeof record[key] !== 'string' || record[key] === '') {
      fail(`missing ${where}.${key}`);
    }
  }
}

function isIsoTimestamp(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)
  );
}

// -------------------------------------------------- the readers (derivation) ----

/**
 * Every `ProfilerEvent` value one installed chunk declares, by name and number.
 *
 * The enum is a runtime IIFE in the shipped chunk, so this reads what the
 * browser would execute rather than a declaration file. The same reader is
 * applied to both packages; nothing here quotes a list.
 */
function readProfilerEvents(chunk) {
  requireFile(chunk, 'run npm ci at the fixture');
  const text = readFileSync(chunk, 'utf8');
  const start = text.indexOf('var ProfilerEvent;');
  if (start === -1) {
    fail(`${displayPath(chunk)} carries no \`var ProfilerEvent;\` declaration`);
  }
  const end = text.indexOf('})(ProfilerEvent ||', start);
  if (end === -1) {
    fail(`${displayPath(chunk)} closes no ProfilerEvent IIFE`);
  }
  const pattern =
    /ProfilerEvent\[ProfilerEvent\["([A-Za-z]+)"\] = (\d+)\] = "([A-Za-z]+)";/g;
  const values = [];
  let match;
  while ((match = pattern.exec(text.slice(start, end))) !== null) {
    if (match[1] !== match[3]) {
      fail(
        `${displayPath(chunk)} declares ${match[1]} as ${match[3]}, so the reader cannot trust the block`,
      );
    }
    values.push({ name: match[1], value: Number(match[2]) });
  }
  if (values.length === 0) {
    fail(`${displayPath(chunk)} declares no ProfilerEvent value`);
  }
  return values;
}

/** Every `ReactiveNodeKind` member one installed declaration file carries. */
function readReactiveNodeKinds(typesPath) {
  requireFile(typesPath, 'run npm ci at the fixture');
  const text = readFileSync(typesPath, 'utf8');
  const match = /type ReactiveNodeKind = ([^;]+);/.exec(text);
  if (match === null) {
    fail(`${displayPath(typesPath)} declares no ReactiveNodeKind`);
  }
  return [...match[1].matchAll(/'([A-Za-z]+)'/g)].map((member) => member[1]);
}

/** The members of one interface, as name and type, from a declaration file. */
function readInterfaceMembers(typesPath, name) {
  requireFile(typesPath, 'run npm ci at the fixture');
  const text = readFileSync(typesPath, 'utf8');
  const start = text.indexOf(`interface ${name} {`);
  if (start === -1) fail(`${displayPath(typesPath)} declares no ${name}`);
  const end = text.indexOf('}', start);
  if (end === -1) fail(`${displayPath(typesPath)} never closes ${name}`);
  const members = [
    ...text.slice(start, end).matchAll(/^\s*([A-Za-z]+):\s*([A-Za-z]+);\s*$/gm),
  ].map((match) => ({ name: match[1], type: match[2] }));
  if (members.length === 0) fail(`${name} carries no member`);
  return members;
}

/** The version one installed package declares for itself. */
function installedVersion(manifest) {
  requireFile(manifest, 'run npm ci');
  const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
  if (typeof pkg.version !== 'string' || pkg.version === '') {
    fail(`${displayPath(manifest)} declares no version`);
  }
  return pkg.version;
}

/**
 * The `ProfilerEvent` literal the page agent hard-codes, as name and number.
 * The agent cannot read the enum off the page (`ng` does not publish it), so
 * this literal is the only place the extension states which events it knows.
 */
function agentProfilerLiteral() {
  requireFile(AGENT_PATH, 'the page agent is part of this repository');
  const text = readFileSync(AGENT_PATH, 'utf8');
  const start = text.indexOf('var ProfilerEvent = {');
  if (start === -1) {
    fail('extension/agent-main.js carries no `var ProfilerEvent = {` literal');
  }
  const end = text.indexOf('};', start);
  if (end === -1) fail('the agent`s ProfilerEvent literal never closes');
  const body = text.slice(start, end);
  const values = [...body.matchAll(/^\s*([A-Za-z]+):\s*(\d+),\s*$/gm)].map(
    (match) => ({ name: match[1], value: Number(match[2]) }),
  );
  if (values.length === 0) {
    fail('the agent`s ProfilerEvent literal holds no value');
  }
  const lineOf = (index) => text.slice(0, index).split('\n').length;
  return {
    values,
    declaration: {
      startLine: lineOf(start),
      endLine: lineOf(end),
    },
  };
}

/** The 1-indexed line range a `path:start-end` citation names. */
function citationLines(citation, where) {
  const match = CITATION.exec(citation ?? '');
  if (match === null) fail(`${where} is not a \`path:start-end\` citation`);
  const start = Number(match[2]);
  const end = Number(match[3]);
  if (start < 1 || end < start) fail(`${where} is not a line range`);
  return { path: match[1], start, end };
}

/** The lines of a file, 1-indexed through `lineOf`. */
function lineOf(lines, index1) {
  if (index1 < 1 || index1 > lines.length) {
    fail(`line ${index1} is outside a file of ${lines.length} lines`);
  }
  return lines[index1 - 1];
}

/** Every file below a directory, repository-relative and sorted. */
function sourceFilesUnder(directory) {
  requireFile(directory, 'the fixture sources are part of this repository');
  return readdirSync(directory, { recursive: true })
    .map((entry) => String(entry))
    .filter((entry) => !entry.includes('node_modules'))
    .map((entry) => join(directory, entry))
    .filter((entry) => statSync(entry).isFile())
    .sort();
}

/** The fixture files that call `afterRenderEffect`, by relative path. */
function filesCallingAfterRenderEffect() {
  return sourceFilesUnder(FIXTURE_SRC)
    .filter((file) => readFileSync(file, 'utf8').includes('afterRenderEffect'))
    .map(displayPath);
}

function occurrences(text, needle) {
  return text.split(needle).length - 1;
}

// ------------------------------------------------------------- the record ----

function loadRecord() {
  requireFile(RECORD_PATH, 'the measurement has not been recorded');
  return JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
}

// ------------------------------------------------ validation: the profiler ----

function validateProfiler(record, live) {
  const profiler = record.profiler;
  if (!isObject(profiler)) fail('missing profiler');
  strings(profiler, ['question', 'finding'], 'profiler');
  strings(profiler.reader, ['how', 'pattern', 'why'], 'profiler.reader');

  if (!Array.isArray(profiler.sources) || profiler.sources.length !== 2) {
    fail('profiler.sources must hold exactly two installs');
  }
  const byLabel = new Map();
  for (const source of profiler.sources) {
    strings(
      source,
      ['package', 'manifest', 'version', 'chunk'],
      'profiler.sources[]',
    );
    const installed = live.versions.get(source.manifest);
    if (installed === undefined) {
      fail(
        `profiler.sources names ${source.manifest}, which is not one of the two installed copies this file reads`,
      );
    }
    if (source.version !== installed) {
      fail(
        `the ${source.label ?? source.package} install moved since the measurement: recorded ${source.version}, installed ${installed}`,
      );
    }
    const derived = live.profiler.get(source.chunk);
    if (derived === undefined) {
      fail(
        `profiler.sources names ${source.chunk}, which is not the chunk this file read`,
      );
    }
    if (!Array.isArray(source.values)) fail('profiler.sources[].values');
    if (source.count !== derived.length) {
      fail(
        `the recorded ${source.chunk} count is ${source.count} and the installed package declares ${derived.length}`,
      );
    }
    if (source.values.length !== derived.length) {
      fail(
        `the recorded list for ${source.chunk} holds ${source.values.length} value(s) and the installed package declares ${derived.length}`,
      );
    }
    for (let index = 0; index < derived.length; index += 1) {
      const stated = source.values[index];
      const actual = derived[index];
      if (stated?.name !== actual.name || stated?.value !== actual.value) {
        fail(
          `the ProfilerEvent list moved: position ${index} is recorded as ${JSON.stringify(stated)} and the installed package declares ${JSON.stringify(actual)}`,
        );
      }
    }
    byLabel.set(source.manifest, derived);
  }

  const [panel, fixture] = profiler.sources.map((source) =>
    byLabel.get(source.manifest),
  );
  const identical = JSON.stringify(panel) === JSON.stringify(fixture);
  if (profiler.identical !== identical) {
    fail(
      `profiler.identical is ${profiler.identical} and the two installed copies ${identical ? 'are' : 'are not'} identical`,
    );
  }
  if (identical !== true) {
    fail(
      'the panel package and the fixture package no longer declare the same ProfilerEvent list, so one of the two is a different vocabulary',
    );
  }

  const numbers = profiler.numbers;
  if (!isObject(numbers)) fail('missing profiler.numbers');
  const values = panel.map((entry) => entry.value);
  if (numbers.first !== Math.min(...values)) {
    fail(`profiler.numbers.first is not ${Math.min(...values)}`);
  }
  if (numbers.last !== Math.max(...values)) {
    fail(`profiler.numbers.last is not ${Math.max(...values)}`);
  }
  const contiguous =
    panel.every((entry, index) => entry.value === index) &&
    panel.length === Math.max(...values) + 1;
  if (numbers.contiguous !== contiguous) {
    fail(
      `profiler.numbers.contiguous is ${numbers.contiguous} and the installed list is ${contiguous ? '' : 'not '}contiguous`,
    );
  }

  const effectEvent = profiler.effectEvent;
  if (!isObject(effectEvent)) fail('missing profiler.effectEvent');
  strings(effectEvent, ['search'], 'profiler.effectEvent');
  const matchingNames = panel
    .filter((entry) => /effect/i.test(entry.name))
    .map((entry) => entry.name);
  if (effectEvent.count !== matchingNames.length) {
    fail(
      `profiler.effectEvent.count is ${effectEvent.count} and the installed list holds ${matchingNames.length} effect-named value(s)`,
    );
  }
  if (
    JSON.stringify(effectEvent.matchingNames) !== JSON.stringify(matchingNames)
  ) {
    fail(
      `profiler.effectEvent.matchingNames is ${JSON.stringify(effectEvent.matchingNames)} and the installed list yields ${JSON.stringify(matchingNames)}`,
    );
  }
  if (effectEvent.absent !== (matchingNames.length === 0)) {
    fail(
      `profiler.effectEvent.absent is ${effectEvent.absent} and the installed list ${matchingNames.length === 0 ? 'holds' : 'does not hold'} no effect-named value`,
    );
  }
  if (effectEvent.absent !== true) {
    fail(
      `a ProfilerEvent value now names an effect: ${JSON.stringify(matchingNames)} — SC2's premise moved and the recording must be re-measured`,
    );
  }

  const carried = profiler.effectIsCarriedAs;
  if (!isObject(carried)) fail('missing profiler.effectIsCarriedAs');
  strings(
    carried,
    ['symbol', 'carrier', 'declaration'],
    'profiler.effectIsCarriedAs',
  );
  const declaredKinds = live.kinds.get(carried.declaration);
  if (declaredKinds === undefined) {
    fail(
      `profiler.effectIsCarriedAs.declaration names ${carried.declaration}, which this file did not read`,
    );
  }
  if (JSON.stringify(carried.kinds) !== JSON.stringify(declaredKinds)) {
    fail(
      `profiler.effectIsCarriedAs.kinds is ${JSON.stringify(carried.kinds)} and the installed declaration yields ${JSON.stringify(declaredKinds)}`,
    );
  }
  const fixtureKinds = live.kinds.get(live.fixtureKinds);
  if (JSON.stringify(carried.fixtureKinds) !== JSON.stringify(fixtureKinds)) {
    fail(
      `profiler.effectIsCarriedAs.fixtureKinds is ${JSON.stringify(carried.fixtureKinds)} and the fixture's declaration yields ${JSON.stringify(fixtureKinds)}`,
    );
  }
  if (
    carried.kindsIdentical !==
    (JSON.stringify(declaredKinds) === JSON.stringify(fixtureKinds))
  ) {
    fail(
      'profiler.effectIsCarriedAs.kindsIdentical disagrees with the two declarations',
    );
  }
  if (!declaredKinds.includes(carried.symbol)) {
    fail(
      `${carried.symbol} is recorded as a ReactiveNodeKind and the installed declaration does not carry it`,
    );
  }
  const isProfilerEvent = panel.some((entry) => entry.name === carried.symbol);
  if (carried.isProfilerEvent !== isProfilerEvent) {
    fail(
      `profiler.effectIsCarriedAs.isProfilerEvent is ${carried.isProfilerEvent} and the installed profiler list ${isProfilerEvent ? 'does' : 'does not'} carry ${carried.symbol}`,
    );
  }
  if (isProfilerEvent) {
    fail(
      `${carried.symbol} is now a ProfilerEvent, so the effect's phase would be observable and SC2 must be re-measured`,
    );
  }

  const agent = profiler.agent;
  if (!isObject(agent)) fail('missing profiler.agent');
  strings(agent, ['source', 'declaredAt'], 'profiler.agent');
  if (agent.source !== 'extension/agent-main.js') {
    fail(`profiler.agent.source is ${JSON.stringify(agent.source)}`);
  }
  if (!Array.isArray(agent.actsOn) || agent.actsOn.length === 0) {
    fail('profiler.agent.actsOn is empty');
  }
  const literal = agentProfilerLiteral();
  if (
    JSON.stringify(agent.actsOn) !==
    JSON.stringify(literal.values.map((v) => v.name))
  ) {
    fail(
      `profiler.agent.actsOn is ${JSON.stringify(agent.actsOn)} and the agent hard-codes ${JSON.stringify(literal.values.map((v) => v.name))}`,
    );
  }
  for (const entry of literal.values) {
    const declared = panel.find((value) => value.name === entry.name);
    if (declared === undefined) {
      fail(
        `the agent hard-codes ${entry.name}, which the installed package does not declare`,
      );
    }
    if (declared.value !== entry.value) {
      fail(
        `the agent hard-codes ${entry.name} as ${entry.value} and the installed package declares ${declared.value}`,
      );
    }
  }
  const declaredAt = citationLines(
    agent.declaredAt,
    'profiler.agent.declaredAt',
  );
  if (declaredAt.path !== 'extension/agent-main.js') {
    fail(`profiler.agent.declaredAt cites ${declaredAt.path}`);
  }
  if (
    literal.declaration.startLine < declaredAt.start ||
    literal.declaration.endLine > declaredAt.end
  ) {
    fail(
      `profiler.agent.declaredAt cites lines ${declaredAt.start}-${declaredAt.end} and the ProfilerEvent literal sits on lines ${literal.declaration.startLine}-${literal.declaration.endLine}`,
    );
  }
  const agentLines = readFileSync(AGENT_PATH, 'utf8').split('\n');
  const dropsAt = citationLines(
    agent.dropsTheRestAt,
    'profiler.agent.dropsTheRestAt',
  );
  if (dropsAt.path !== 'extension/agent-main.js') {
    fail(`profiler.agent.dropsTheRestAt cites ${dropsAt.path}`);
  }
  if (!lineOf(agentLines, dropsAt.start).includes('function onEvent(')) {
    fail(
      `profiler.agent.dropsTheRestAt starts at line ${dropsAt.start}, which is not \`function onEvent(\``,
    );
  }
  const onEvent = agentLines.slice(dropsAt.start - 1, dropsAt.end).join('\n');
  if (occurrences(onEvent, 'ProfilerEvent.') < literal.values.length) {
    fail(
      `profiler.agent.dropsTheRestAt cites ${occurrences(onEvent, 'ProfilerEvent.')} comparison(s) in lines ${dropsAt.start}-${dropsAt.end}, fewer than the ${literal.values.length} value(s) the agent acts on`,
    );
  }
}

// ------------------------------------------------- validation: the effect ----

function validateEffect(record) {
  const effect = record.effect;
  if (!isObject(effect)) fail('missing effect');
  strings(effect, ['question', 'finding'], 'effect');

  requireFile(
    EFFECT_RECORDING_PATH,
    'the probe recording is the cited evidence',
  );
  const probe = JSON.parse(readFileSync(EFFECT_RECORDING_PATH, 'utf8'));
  if (!Array.isArray(probe.nodes) || !Array.isArray(probe.edges)) {
    fail('research/raw/effect-writes.json holds no nodes and edges');
  }

  const recording = effect.recording;
  if (!isObject(recording)) fail('missing effect.recording');
  strings(
    recording,
    ['path', 'probe', 'capturedAt', 'angular', 'page', 'element', 'reading'],
    'effect.recording',
  );
  if (recording.path !== displayPath(EFFECT_RECORDING_PATH)) {
    fail(
      `effect.recording.path is ${JSON.stringify(recording.path)}, which is not the recording this file reads`,
    );
  }
  failIfMissing(
    recording.probe,
    'spikes/probes/effect-writes.js',
    'effect.recording.probe',
  );
  if (recording.nodeCount !== probe.nodes.length) {
    fail(
      `effect.recording.nodeCount is ${recording.nodeCount} and the probe recording holds ${probe.nodes.length}`,
    );
  }
  if (recording.edgeCount !== probe.edges.length) {
    fail(
      `effect.recording.edgeCount is ${recording.edgeCount} and the probe recording holds ${probe.edges.length}`,
    );
  }

  const from = effect.fromRecording;
  if (!isObject(from)) fail('missing effect.fromRecording');
  const probeEffect = probe.nodes.find((node) => node.kind === 'effect');
  if (probeEffect === undefined) {
    fail(
      'the probe recording holds no node of kind `effect`, so every claim resting on it lost its evidence',
    );
  }
  if (from.kind !== probeEffect.kind) {
    fail(
      `effect.fromRecording.kind is ${from.kind} and the recording says ${probeEffect.kind}`,
    );
  }
  if (from.label !== probeEffect.label) {
    fail(
      `effect.fromRecording.label is ${JSON.stringify(from.label)} and the recording says ${JSON.stringify(probeEffect.label)}`,
    );
  }
  if (from.labelEmpty !== (probeEffect.label === '')) {
    fail('effect.fromRecording.labelEmpty disagrees with the probe recording');
  }
  if (from.labelEmpty !== true) {
    fail(
      `the probe recording now labels the effect ${JSON.stringify(probeEffect.label)}, so the empty-label finding moved`,
    );
  }
  if (from.epoch !== null || from.holdsEpoch !== false) {
    fail(
      'effect.fromRecording states an epoch, and the probe recording copies no epoch field',
    );
  }
  const recordedNodes = probe.nodes.map((node) => ({
    kind: node.kind,
    label: node.label,
  }));
  if (JSON.stringify(from.nodes) !== JSON.stringify(recordedNodes)) {
    fail(
      `effect.fromRecording.nodes is ${JSON.stringify(from.nodes)} and the probe recording holds ${JSON.stringify(recordedNodes)}`,
    );
  }
  const recordedEdges = probe.edges.map((edge) => ({
    edge,
    consumer: edge.split(' -> ')[0],
    producer: edge.split(' -> ')[1],
  }));
  if (JSON.stringify(from.edges) !== JSON.stringify(recordedEdges)) {
    fail(
      `effect.fromRecording.edges disagrees with research/raw/effect-writes.json: ${JSON.stringify(recordedEdges)}`,
    );
  }
  const recordedEffectEdges = probe.edges.filter((edge) =>
    edge.startsWith('effect:'),
  );
  if (recordedEffectEdges.length !== 1) {
    fail(
      `the probe recording holds ${recordedEffectEdges.length} effect edge(s); the measurement rests on exactly one`,
    );
  }
  const recordedProducer = recordedEffectEdges[0]
    .slice('effect: -> '.length)
    .replace(/^signal:/, '');
  if (
    JSON.stringify(from.signalsTheEdgesName) !==
    JSON.stringify([recordedProducer])
  ) {
    fail(
      `effect.fromRecording.signalsTheEdgesName is ${JSON.stringify(from.signalsTheEdgesName)} and the recorded edge names ${JSON.stringify(recordedProducer)}`,
    );
  }

  const fresh = effect.freshRead;
  if (!isObject(fresh)) fail('missing effect.freshRead');
  strings(
    fresh,
    [
      'target',
      'at',
      'instance',
      'browser',
      'url',
      'element',
      'component',
      'reading',
      'id',
      'kind',
    ],
    'effect.freshRead',
  );
  if (!isIsoTimestamp(fresh.at)) fail(`effect.freshRead.at is ${fresh.at}`);
  if (typeof fresh.epoch !== 'number' || !Number.isFinite(fresh.epoch)) {
    fail(
      `effect.freshRead.epoch is ${JSON.stringify(fresh.epoch)} and the fresh read measured a number`,
    );
  }
  if (fresh.kind !== 'effect') fail(`effect.freshRead.kind is ${fresh.kind}`);
  if (fresh.label !== '') {
    fail(
      `effect.freshRead.label is ${JSON.stringify(fresh.label)} and the fresh read measured an empty label`,
    );
  }
  if (fresh.labelEmpty !== (fresh.label === '')) {
    fail('effect.freshRead.labelEmpty disagrees with its own label');
  }
  if (!Array.isArray(fresh.nodes) || fresh.nodes.length !== fresh.nodeCount) {
    fail('effect.freshRead.nodes does not match its own nodeCount');
  }
  const nodeAt = new Map(fresh.nodes.map((node) => [node.index, node]));
  const effectNode = nodeAt.get(fresh.nodeIndex);
  if (effectNode === undefined) {
    fail(
      `effect.freshRead.nodeIndex ${fresh.nodeIndex} is not one of its nodes`,
    );
  }
  for (const key of ['id', 'kind', 'label', 'epoch']) {
    if (effectNode[key] !== fresh[key]) {
      fail(
        `effect.freshRead.${key} is ${JSON.stringify(fresh[key])} and the node it names carries ${JSON.stringify(effectNode[key])}`,
      );
    }
  }
  if (
    !Array.isArray(fresh.allEdges) ||
    fresh.allEdges.length !== fresh.edgeCount
  ) {
    fail('effect.freshRead.allEdges does not match its own edgeCount');
  }
  const consumerEdges = fresh.allEdges.filter(
    (edge) => edge.consumer === fresh.nodeIndex,
  );
  const pairs = (edges) =>
    edges.map((edge) => ({ consumer: edge.consumer, producer: edge.producer }));
  if (
    JSON.stringify(pairs(fresh.edges)) !== JSON.stringify(pairs(consumerEdges))
  ) {
    fail(
      `effect.freshRead.edges is not the set of recorded edges whose consumer is the effect: ${JSON.stringify(consumerEdges)}`,
    );
  }
  if (fresh.edges.length === 0) {
    fail('effect.freshRead records no edge, and the counter page carries one');
  }
  for (const edge of fresh.edges) {
    const producer = nodeAt.get(edge.producer);
    if (producer === undefined) {
      fail(
        `effect.freshRead.edges names node ${edge.producer}, which is not recorded`,
      );
    }
    const expected = `${producer.kind}:${producer.label}`;
    if (edge.producerLabel !== expected) {
      fail(
        `effect.freshRead.edges labels node ${edge.producer} ${JSON.stringify(edge.producerLabel)}, and the node is ${JSON.stringify(expected)}`,
      );
    }
    const consumer = nodeAt.get(edge.consumer);
    const expectedConsumer = `${consumer?.kind}:${consumer?.label}`;
    if (edge.consumerLabel !== expectedConsumer) {
      fail(
        `effect.freshRead.edges labels node ${edge.consumer} ${JSON.stringify(edge.consumerLabel)}, and the node is ${JSON.stringify(expectedConsumer)}`,
      );
    }
  }
  const producerLabels = fresh.producers.map((producer) => producer.label);
  if (
    JSON.stringify(fresh.signalsTheEdgesName) !== JSON.stringify(producerLabels)
  ) {
    fail(
      `effect.freshRead.signalsTheEdgesName is ${JSON.stringify(fresh.signalsTheEdgesName)} and its producers are labelled ${JSON.stringify(producerLabels)}`,
    );
  }
  for (const producer of fresh.producers) {
    const node = nodeAt.get(producer.index);
    if (node === undefined) {
      fail(
        `effect.freshRead.producers names node ${producer.index}, which is not recorded`,
      );
    }
    for (const key of ['id', 'kind', 'label', 'epoch']) {
      if (node[key] !== producer[key]) {
        fail(
          `effect.freshRead.producers[${producer.index}].${key} disagrees with the recorded node`,
        );
      }
    }
  }

  const agreement = effect.agreement;
  if (!isObject(agreement)) fail('missing effect.agreement');
  const derived = {
    kindAgrees: from.kind === fresh.kind,
    labelAgrees: from.label === fresh.label,
    labelIsEmptyInBoth: from.label === '' && fresh.label === '',
    signalAgrees:
      JSON.stringify(from.signalsTheEdgesName) ===
      JSON.stringify(fresh.signalsTheEdgesName),
  };
  for (const [key, value] of Object.entries(derived)) {
    if (agreement[key] !== value) {
      fail(
        `effect.agreement.${key} is ${agreement[key]} and the two reads ${value ? 'agree' : 'disagree'}`,
      );
    }
  }
  if (!derived.signalAgrees) {
    fail(
      'the probe recording and the fresh read name different signals for the effect',
    );
  }

  const pages = effect.effectNodesOnTheFixturePagesRead;
  if (!Array.isArray(pages) || pages.length === 0) {
    fail('effect.effectNodesOnTheFixturePagesRead is empty');
  }
  const counterPage = pages.find(
    (page) => page.route === fresh.url.replace(/^https?:\/\/[^/]+/, ''),
  );
  if (counterPage === undefined) {
    fail(
      `effect.effectNodesOnTheFixturePagesRead holds no entry for the page the fresh read names (${fresh.url})`,
    );
  }
  for (const key of [
    'nodeIndex',
    'id',
    'kind',
    'label',
    'epoch',
    'nodeCount',
    'edgeCount',
  ]) {
    if (counterPage[key] !== fresh[key]) {
      fail(
        `the ${counterPage.route} entry carries ${key} ${JSON.stringify(counterPage[key])} and the fresh read says ${JSON.stringify(fresh[key])}`,
      );
    }
  }
  for (const page of pages) {
    strings(
      page,
      ['route', 'element', 'component'],
      'effect.effectNodesOnTheFixturePagesRead[]',
    );
    if (page.kind !== 'effect') {
      fail(`the ${page.route} entry is a ${page.kind}, not an effect`);
    }
    if (page.labelEmpty !== (page.label === '')) {
      fail(`the ${page.route} entry's labelEmpty disagrees with its label`);
    }
    if (!Array.isArray(page.producers)) {
      fail(`the ${page.route} entry records no producer list`);
    }
    if (page.producers.length === 0 && page.label !== '') {
      fail(
        `the ${page.route} entry is labelled ${JSON.stringify(page.label)} with no producer edge`,
      );
    }
  }

  const portal = effect.portalRead;
  if (!isObject(portal)) fail('missing effect.portalRead');
  strings(
    portal,
    [
      'target',
      'at',
      'instance',
      'browser',
      'url',
      'angular',
      'reading',
      'countedAs',
    ],
    'effect.portalRead',
  );
  if (!isIsoTimestamp(portal.at)) fail(`effect.portalRead.at is ${portal.at}`);
  if (!portal.target.includes('Portal')) {
    fail(
      `effect.portalRead.target is ${JSON.stringify(portal.target)}; the default target is the Insurance Portal`,
    );
  }
  if (!Array.isArray(portal.routes) || portal.routes.length === 0) {
    fail('effect.portalRead.routes is empty');
  }
  const portalOccurrences = portal.routes.reduce(
    (sum, route) => sum + route.effectNodeOccurrences,
    0,
  );
  if (portal.effectNodeOccurrences !== portalOccurrences) {
    fail(
      `effect.portalRead.effectNodeOccurrences is ${portal.effectNodeOccurrences} and its routes sum to ${portalOccurrences}`,
    );
  }
  const portalNodes = portal.routes.reduce(
    (sum, route) => sum + route.nodeCount,
    0,
  );
  if (portal.nodeOccurrences !== portalNodes) {
    fail(
      `effect.portalRead.nodeOccurrences is ${portal.nodeOccurrences} and its routes sum to ${portalNodes}`,
    );
  }
  if (!Array.isArray(portal.labelledEffectNodes)) {
    fail('effect.portalRead.labelledEffectNodes is not a list');
  }
  if (
    portal.labelledEffectNodeOccurrences !== portal.labelledEffectNodes.length
  ) {
    fail(
      `effect.portalRead.labelledEffectNodeOccurrences is ${portal.labelledEffectNodeOccurrences} and it records ${portal.labelledEffectNodes.length} labelled node(s)`,
    );
  }
  const labelledLabels = [
    ...new Set(portal.labelledEffectNodes.map((node) => node.label)),
  ].filter((label) => label !== '');
  const derivedLabelSet = ['', ...labelledLabels].sort();
  if (
    JSON.stringify(portal.effectLabelSet) !== JSON.stringify(derivedLabelSet)
  ) {
    fail(
      `effect.portalRead.effectLabelSet is ${JSON.stringify(portal.effectLabelSet)} and the labelled nodes yield ${JSON.stringify(derivedLabelSet)}`,
    );
  }
  for (const node of portal.labelledEffectNodes) {
    strings(
      node,
      ['route', 'element', 'id', 'label'],
      'effect.portalRead.labelledEffectNodes[]',
    );
    if (node.label === '') {
      fail(
        'effect.portalRead.labelledEffectNodes holds a node with an empty label',
      );
    }
    if (!portal.routes.some((route) => route.route === node.route)) {
      fail(
        `effect.portalRead.labelledEffectNodes names route ${node.route}, which is not one of the routes read`,
      );
    }
    if (!Array.isArray(node.producers) || node.producers.length === 0) {
      fail(`the labelled portal effect on ${node.route} records no producer`);
    }
    for (const producer of node.producers) {
      if (typeof producer.label !== 'string' || producer.label === '') {
        fail(
          `the labelled portal effect on ${node.route} names an unlabelled producer, so the edge names no signal`,
        );
      }
    }
  }

  const edge = effect.writeAsAnEdge;
  if (!isObject(edge)) fail('missing effect.writeAsAnEdge');
  strings(edge, ['reading'], 'effect.writeAsAnEdge');
  const members = readInterfaceMembers(PANEL.types, 'DebugSignalGraphEdge');
  const shape = edge.edgeShape;
  if (!isObject(shape)) fail('missing effect.writeAsAnEdge.edgeShape');
  strings(
    shape,
    ['declaration', 'interface'],
    'effect.writeAsAnEdge.edgeShape',
  );
  if (shape.declaration !== displayPath(PANEL.types)) {
    fail(
      `effect.writeAsAnEdge.edgeShape.declaration is ${JSON.stringify(shape.declaration)}, which is not the declaration this file reads`,
    );
  }
  if (shape.interface !== 'DebugSignalGraphEdge') {
    fail(`effect.writeAsAnEdge.edgeShape.interface is ${shape.interface}`);
  }
  if (JSON.stringify(shape.members) !== JSON.stringify(members)) {
    fail(
      `effect.writeAsAnEdge.edgeShape.members is ${JSON.stringify(shape.members)} and the installed declaration yields ${JSON.stringify(members)}`,
    );
  }
  const fixtureMembers = readInterfaceMembers(
    FIXTURE.types,
    'DebugSignalGraphEdge',
  );
  if (JSON.stringify(shape.fixtureMembers) !== JSON.stringify(fixtureMembers)) {
    fail(
      `effect.writeAsAnEdge.edgeShape.fixtureMembers is ${JSON.stringify(shape.fixtureMembers)} and the fixture's declaration yields ${JSON.stringify(fixtureMembers)}`,
    );
  }
  if (
    shape.identical !==
    (JSON.stringify(members) === JSON.stringify(fixtureMembers))
  ) {
    fail(
      'effect.writeAsAnEdge.edgeShape.identical disagrees with the two declarations',
    );
  }
  const writeFields = members.filter((member) => /write/i.test(member.name));
  if (edge.writeFieldCount !== writeFields.length) {
    fail(
      `effect.writeAsAnEdge.writeFieldCount is ${edge.writeFieldCount} and the installed interface carries ${writeFields.length} write-named member(s)`,
    );
  }
  if (edge.edgeCarriesAWrite !== false || writeFields.length !== 0) {
    fail(
      'the record claims an edge carries a write, and a DebugSignalGraphEdge is a producer/consumer index pair',
    );
  }
  const names = members.map((member) => member.name).sort();
  if (JSON.stringify(names) !== JSON.stringify(['consumer', 'producer'])) {
    fail(
      `DebugSignalGraphEdge now carries ${JSON.stringify(names)}; a write edge would make the record's claim untrue`,
    );
  }
}

function failIfMissing(value, expected, where) {
  if (value !== expected) {
    fail(
      `${where} is ${JSON.stringify(value)}, expected ${JSON.stringify(expected)}`,
    );
  }
}

// -------------------------------------------------- validation: the phase ----

function validatePhase(record) {
  const phase = record.phase;
  if (!isObject(phase)) fail('missing phase');
  strings(phase, ['question', 'finding', 'verdict'], 'phase');

  const declared = phase.declared;
  if (!isObject(declared)) fail('missing phase.declared');
  strings(declared, ['nodeKind', 'carrier', 'declaration'], 'phase.declared');
  const kinds = live.kinds.get(declared.declaration);
  if (kinds === undefined) {
    fail(
      `phase.declared.declaration names ${declared.declaration}, which this file did not read`,
    );
  }
  if (JSON.stringify(declared.kinds) !== JSON.stringify(kinds)) {
    fail(
      `phase.declared.kinds is ${JSON.stringify(declared.kinds)} and the installed declaration yields ${JSON.stringify(kinds)}`,
    );
  }
  const declaredAtAll = kinds.includes(declared.nodeKind);
  if (declared.declared !== declaredAtAll) {
    fail(
      `phase.declared.declared is ${declared.declared} and the installed declaration ${declaredAtAll ? 'does' : 'does not'} carry ${declared.nodeKind}`,
    );
  }

  if (!Array.isArray(phase.pagesRead) || phase.pagesRead.length === 0) {
    fail('phase.pagesRead is empty');
  }
  for (const page of phase.pagesRead) {
    strings(
      page,
      ['target', 'route', 'element', 'component'],
      'phase.pagesRead[]',
    );
    for (const key of [
      'nodeCount',
      'edgeCount',
      'nodesWithPhaseField',
      'afterRenderEffectPhaseNodes',
    ]) {
      if (typeof page[key] !== 'number') {
        fail(`phase.pagesRead[${page.route}].${key} is not a number`);
      }
    }
    if (!Array.isArray(page.nodeFields)) {
      fail(`phase.pagesRead[${page.route}].nodeFields is not a list`);
    }
    if (page.nodeFields.includes('phase')) {
      fail(
        `phase.pagesRead[${page.route}] now records a node carrying a \`phase\` field`,
      );
    }
    if (page.nodesWithPhaseField !== 0) {
      fail(
        `phase.pagesRead[${page.route}] records ${page.nodesWithPhaseField} node(s) with a phase field`,
      );
    }
    if (page.afterRenderEffectPhaseNodes !== 0) {
      fail(
        `phase.pagesRead[${page.route}] records ${page.afterRenderEffectPhaseNodes} node(s) of kind ${declared.nodeKind}`,
      );
    }
  }
  const nodesRead = phase.pagesRead.reduce(
    (sum, page) => sum + page.nodeCount,
    0,
  );
  if (phase.nodesRead !== nodesRead) {
    fail(
      `phase.nodesRead is ${phase.nodesRead} and the pages sum to ${nodesRead}`,
    );
  }
  const phaseFieldsSum = phase.pagesRead.reduce(
    (sum, page) => sum + page.nodesWithPhaseField,
    0,
  );
  if (phase.nodesWithPhaseField !== phaseFieldsSum) {
    fail(
      `phase.nodesWithPhaseField is ${phase.nodesWithPhaseField} and the pages sum to ${phaseFieldsSum}`,
    );
  }
  const phaseNodesSum = phase.pagesRead.reduce(
    (sum, page) => sum + page.afterRenderEffectPhaseNodes,
    0,
  );
  if (phase.afterRenderEffectPhaseNodes !== phaseNodesSum) {
    fail(
      `phase.afterRenderEffectPhaseNodes is ${phase.afterRenderEffectPhaseNodes} and the pages sum to ${phaseNodesSum}`,
    );
  }
  const observedFields = [
    ...new Set(phase.pagesRead.flatMap((page) => page.nodeFields)),
  ].sort();
  if (
    JSON.stringify(phase.nodeFieldsObserved) !== JSON.stringify(observedFields)
  ) {
    fail(
      `phase.nodeFieldsObserved is ${JSON.stringify(phase.nodeFieldsObserved)} and the pages yield ${JSON.stringify(observedFields)}`,
    );
  }
  if (phase.nodeFieldsObserved.includes('phase')) {
    fail('phase.nodeFieldsObserved carries `phase`');
  }

  const portal = phase.portal;
  if (!isObject(portal)) fail('missing phase.portal');
  if (!Array.isArray(portal.routes) || portal.routes.length === 0) {
    fail('phase.portal.routes is empty');
  }
  for (const route of portal.routes) {
    if (typeof route !== 'string' || !route.startsWith('/')) {
      fail(`phase.portal.routes holds ${JSON.stringify(route)}, not a route`);
    }
  }
  if (
    typeof portal.nodesRead !== 'number' ||
    portal.nodesRead < portal.routes.length
  ) {
    fail(
      `phase.portal.nodesRead is ${JSON.stringify(portal.nodesRead)}, fewer nodes than routes read`,
    );
  }
  if (portal.afterRenderEffectPhaseNodes !== 0) {
    fail(
      `phase.portal records ${portal.afterRenderEffectPhaseNodes} node(s) of kind ${declared.nodeKind} on the portal`,
    );
  }
  if (portal.nodesWithPhaseField !== 0) {
    fail(
      `phase.portal records ${portal.nodesWithPhaseField} portal node(s) with a phase field`,
    );
  }
  if (!Array.isArray(portal.nodeFieldsObserved)) {
    fail('phase.portal.nodeFieldsObserved is not a list');
  }
  if (portal.nodeFieldsObserved.includes('phase')) {
    fail('phase.portal.nodeFieldsObserved carries `phase`');
  }

  if (!Array.isArray(phase.sourceScans) || phase.sourceScans.length === 0) {
    fail('phase.sourceScans is empty');
  }
  const fixtureScan = phase.sourceScans.find(
    (scan) => scan.where === 'spikes/ng222-app/src',
  );
  if (fixtureScan === undefined) {
    fail('phase.sourceScans holds no scan of spikes/ng222-app/src');
  }
  const filesCalling = filesCallingAfterRenderEffect();
  const occurrencesInFixture = filesCalling.reduce(
    (sum, file) =>
      sum +
      occurrences(readFileSync(join(ROOT, file), 'utf8'), 'afterRenderEffect'),
    0,
  );
  if (fixtureScan.afterRenderEffectOccurrences !== occurrencesInFixture) {
    fail(
      `phase.sourceScans[spikes/ng222-app/src].afterRenderEffectOccurrences is ${fixtureScan.afterRenderEffectOccurrences} and the fixture sources hold ${occurrencesInFixture}`,
    );
  }
  if (!Array.isArray(phase.pagesUsingAfterRenderEffect)) {
    fail('phase.pagesUsingAfterRenderEffect is not a list');
  }
  if (
    JSON.stringify(phase.pagesUsingAfterRenderEffect) !==
    JSON.stringify(filesCalling)
  ) {
    fail(
      `phase.pagesUsingAfterRenderEffect is ${JSON.stringify(phase.pagesUsingAfterRenderEffect)} and the fixture sources that call afterRenderEffect are ${JSON.stringify(filesCalling)}`,
    );
  }

  const seen =
    phase.afterRenderEffectPhaseNodes > 0 ||
    portal.afterRenderEffectPhaseNodes > 0;
  const verdict = declaredAtAll
    ? seen
      ? 'observed'
      : 'declared-not-observed'
    : 'not-declared';
  if (phase.verdict !== verdict) {
    fail(
      `phase.verdict is ${JSON.stringify(phase.verdict)} and declared=${declaredAtAll} with seen=${seen} yields ${JSON.stringify(verdict)}`,
    );
  }
  if (phase.verdict !== 'declared-not-observed') {
    fail(
      `the phase record now reads ${JSON.stringify(phase.verdict)}; SC2 was written over a missing observation and this must be re-measured`,
    );
  }
}

// ---------------------------------------- validation: the live attempt ----

function validateChangeDetection(record) {
  const change = record.changeDetection;
  if (!isObject(change)) fail('missing changeDetection');
  strings(change, ['question', 'result', 'finding'], 'changeDetection');
  if (change.attempted !== true) {
    fail(
      'changeDetection.attempted is not true: the task requires a live attempt',
    );
  }
  if (!Array.isArray(change.attempts) || change.attempts.length === 0) {
    fail('changeDetection.attempts is empty');
  }
  if (
    !change.attempts.some((attempt) =>
      String(attempt.target).includes('Portal'),
    )
  ) {
    fail(
      'no attempt names the Insurance Portal, which is the default verification target',
    );
  }
  for (const attempt of change.attempts) {
    const where = `changeDetection.attempts[${attempt.target}]`;
    for (const key of ['target', 'at', 'result']) {
      if (typeof attempt[key] !== 'string' || attempt[key] === '') {
        fail(`missing ${where}.${key}`);
      }
    }
    if (!isIsoTimestamp(attempt.at)) fail(`${where}.at is ${attempt.at}`);
    if (!isObject(attempt.instance)) fail(`missing ${where}.instance`);
    strings(
      attempt.instance,
      ['name', 'browser', 'userAgent'],
      `${where}.instance`,
    );
    if (typeof attempt.instance.cdp !== 'number') {
      fail(`${where}.instance.cdp is not a port number`);
    }
    if (!isObject(attempt.build)) fail(`missing ${where}.build`);
    strings(
      attempt.build,
      ['app', 'angular', 'url', 'servedBy', 'configuration', 'developmentMode'],
      `${where}.build`,
    );
    if (attempt.build.configuration !== 'development') {
      fail(
        `${where}.build.configuration is ${JSON.stringify(attempt.build.configuration)}; NG0100 is a development-mode error`,
      );
    }
    if (!isObject(attempt.drove)) fail(`missing ${where}.drove`);
    strings(attempt.drove, ['command', 'probe'], `${where}.drove`);
    if (
      !Array.isArray(attempt.drove.routes) ||
      attempt.drove.routes.length === 0
    ) {
      fail(`${where}.drove.routes is empty`);
    }
    if (attempt.drove.pageLoads !== attempt.drove.routes.length) {
      fail(
        `${where}.drove.pageLoads is ${attempt.drove.pageLoads} and it lists ${attempt.drove.routes.length} route(s)`,
      );
    }
    for (const key of [
      'clicks',
      'consoleMessages',
      'consoleErrors',
      'pageErrors',
    ]) {
      if (typeof attempt.drove[key] !== 'number' || attempt.drove[key] < 0) {
        fail(`${where}.drove.${key} is not a count`);
      }
    }
    if (!Array.isArray(attempt.messages)) {
      fail(`${where}.messages is not a list`);
    }
    if (typeof attempt.ng0100Count !== 'number') {
      fail(`${where}.ng0100Count is not a count`);
    }
    if (attempt.ng0100Count !== attempt.messages.length) {
      fail(
        `${where}.ng0100Count is ${attempt.ng0100Count} and it records ${attempt.messages.length} message(s)`,
      );
    }
    if (typeof attempt.expressionChangedCount !== 'number') {
      fail(`${where}.expressionChangedCount is not a count`);
    }
    if (attempt.result === 'captured') {
      if (attempt.messages.length === 0) {
        fail(
          `${where} is recorded as a capture and holds no message, so a capture was fabricated`,
        );
      }
      for (const message of attempt.messages) {
        strings(message, ['code', 'text'], `${where}.messages[]`);
      }
    } else if (attempt.result === 'negative') {
      if (attempt.messages.length !== 0 || attempt.ng0100Count !== 0) {
        fail(`${where} is recorded as negative and holds messages`);
      }
      if (attempt.expressionChangedCount !== 0) {
        fail(
          `${where} is recorded as negative and counts ExpressionChanged errors`,
        );
      }
      if (!Array.isArray(attempt.codesSeenOnTheSweep)) {
        fail(`${where}.codesSeenOnTheSweep is not a list`);
      }
    } else {
      fail(
        `${where}.result is ${JSON.stringify(attempt.result)}; it must be 'captured' or 'negative'`,
      );
    }
  }

  const captures = change.attempts.filter(
    (attempt) => attempt.result === 'captured',
  );
  const derivedResult = captures.length > 0 ? 'captured' : 'negative';
  if (change.result !== derivedResult) {
    fail(
      `changeDetection.result is ${JSON.stringify(change.result)} and its attempts yield ${JSON.stringify(derivedResult)}`,
    );
  }
  if (
    derivedResult === 'negative' &&
    (!Array.isArray(change.messages) || change.messages.length !== 0)
  ) {
    fail('changeDetection.result is negative and it records messages');
  }

  const substitute = change.substitute;
  if (!isObject(substitute)) fail('missing changeDetection.substitute');
  requireFile(DIGEST_PATH, 'the digest is the cited evidence');
  const digest = JSON.parse(readFileSync(DIGEST_PATH, 'utf8'));
  if (!Array.isArray(digest.entries))
    fail('extension/error-digest.json holds no entries');
  const digestText = JSON.stringify(digest);
  strings(
    substitute,
    ['kind', 'source', 'digestVersion', 'code', 'title', 'bodyStartsWith'],
    'changeDetection.substitute',
  );
  if (substitute.source !== displayPath(DIGEST_PATH)) {
    fail(
      `changeDetection.substitute.source is ${JSON.stringify(substitute.source)}, which is not the digest this file reads`,
    );
  }
  if (substitute.kind !== 'digest-entry') {
    fail(
      `changeDetection.substitute.kind is ${JSON.stringify(substitute.kind)}; a substitute is a digest entry`,
    );
  }
  if (substitute.notACapture !== true) {
    fail(
      'changeDetection.substitute is not marked `notACapture`, so a digest entry is being presented as a capture',
    );
  }
  if (!/substitute/i.test(substitute.reading ?? '')) {
    fail(
      'changeDetection.substitute.reading does not name the entry as a substitute',
    );
  }
  const sameCode = digest.entries.filter(
    (entry) => entry.code === substitute.code,
  );
  if (sameCode.length !== 1) {
    fail(
      `the digest holds ${sameCode.length} entr(ies) whose code is ${substitute.code}; the measurement rests on exactly one`,
    );
  }
  if (substitute.entriesWhoseCodeIsNg0100 !== sameCode.length) {
    fail(
      `changeDetection.substitute.entriesWhoseCodeIsNg0100 is ${substitute.entriesWhoseCodeIsNg0100} and the digest holds ${sameCode.length}`,
    );
  }
  const entryIndex = digest.entries.indexOf(sameCode[0]);
  if (substitute.entryIndex !== entryIndex) {
    fail(
      `changeDetection.substitute.entryIndex is ${substitute.entryIndex} and the digest entry sits at ${entryIndex}`,
    );
  }
  if (substitute.title !== sameCode[0].title) {
    fail(
      `changeDetection.substitute.title is ${JSON.stringify(substitute.title)} and the digest says ${JSON.stringify(sameCode[0].title)}`,
    );
  }
  if (!sameCode[0].body.startsWith(substitute.bodyStartsWith)) {
    fail(
      'changeDetection.substitute.bodyStartsWith is not a prefix of the digest body',
    );
  }
  if (substitute.bodyTruncatedInSource !== sameCode[0].body.endsWith('…')) {
    fail(
      'changeDetection.substitute.bodyTruncatedInSource disagrees with the digest body',
    );
  }
  if (substitute.digestEntries !== digest.entries.length) {
    fail(
      `changeDetection.substitute.digestEntries is ${substitute.digestEntries} and the digest holds ${digest.entries.length}`,
    );
  }
  if (substitute.digestVersion !== digest.version) {
    fail(
      `changeDetection.substitute.digestVersion is ${JSON.stringify(substitute.digestVersion)} and the digest carries ${JSON.stringify(digest.version)}`,
    );
  }
  const hits = occurrences(digestText, substitute.code);
  if (substitute.occurrencesOfNg0100InTheDigestText !== hits) {
    fail(
      `changeDetection.substitute.occurrencesOfNg0100InTheDigestText is ${substitute.occurrencesOfNg0100InTheDigestText} and the digest text carries ${hits}`,
    );
  }
  if (hits === sameCode.length) {
    fail(
      `the digest text now carries ${hits} occurrence(s) of ${substitute.code} and ${sameCode.length} entry, so the "three hits, one entry" finding moved`,
    );
  }
}

// --------------------------------------------- validation: no write, no owner ----

const FORBIDDEN_KEYS = [
  'writes',
  'written',
  'owner',
  'cause',
  'wrote',
  'attributedTo',
];

function validateNoWriteNoOwnerNoCause(text, record) {
  const keys = [];
  const walk = (value) => {
    if (Array.isArray(value)) {
      for (const entry of value) walk(entry);
      return;
    }
    if (!isObject(value)) return;
    for (const [key, entry] of Object.entries(value)) {
      keys.push(key);
      walk(entry);
    }
  };
  walk(record);
  for (const forbidden of FORBIDDEN_KEYS) {
    if (keys.includes(forbidden)) {
      fail(
        `the record carries a \`${forbidden}\` key; this measurement records no write, no owner and no cause`,
      );
    }
  }
  if (text.includes('lastLogged.set')) {
    fail(
      'the record carries a write expression from the probe recording; an edge names a read, not a write',
    );
  }
  if (
    !/edgeCarriesAWrite/.test(text) ||
    record.effect.writeAsAnEdge.edgeCarriesAWrite !== false
  ) {
    fail(
      'the record does not state that an edge cannot carry a write, which is the claim this milestone rests on',
    );
  }
}

// -------------------------------------------------------- the whole record ----

function validate(record) {
  if (!isObject(record)) fail('the recording is not an object');
  if (record.schema !== 'm039-render-phase/v1') {
    fail(`the recording schema is ${JSON.stringify(record.schema)}`);
  }
  if (record.milestone !== 'render-phase-effect') {
    fail(`the recording milestone is ${JSON.stringify(record.milestone)}`);
  }
  if (record.task !== 'T001')
    fail(`the recording task is ${JSON.stringify(record.task)}`);
  strings(record, ['title', 'question', 'capturedAt'], 'the recording');
  if (!isIsoTimestamp(record.capturedAt)) {
    fail(`the recording capturedAt is ${record.capturedAt}`);
  }
  strings(
    record.commands,
    ['check', 'serve', 'browser', 'drive', 'teardown'],
    'commands',
  );
  strings(record.environment, ['platform', 'shell', 'node'], 'environment');
  if (!record.commands.check.includes('render-phase-measure')) {
    fail('the recorded check command is not this suite');
  }
  if (
    !Array.isArray(record.doesNotSettle) ||
    record.doesNotSettle.length === 0
  ) {
    fail('the record does not say what it does not settle');
  }
  for (const entry of record.doesNotSettle) {
    if (typeof entry !== 'string' || entry === '') {
      fail('a doesNotSettle entry is empty');
    }
  }

  validateProfiler(record, live);
  validateEffect(record);
  validatePhase(record);
  validateChangeDetection(record);

  const text = canonical(record);
  validateNoWriteNoOwnerNoCause(text, record);
  return true;
}

// --------------------------------------------------------- the live facts ----

/**
 * Everything this run reads from the installed packages and the repository. One
 * object, built once, so every validator compares a recorded claim against the
 * same live derivation instead of re-reading a file per assertion.
 */
const live = (() => {
  const profiler = new Map();
  const versions = new Map();
  const kinds = new Map();
  for (const pkg of PACKAGES) {
    profiler.set(displayPath(pkg.chunk), readProfilerEvents(pkg.chunk));
    versions.set(displayPath(pkg.manifest), installedVersion(pkg.manifest));
    kinds.set(displayPath(pkg.kinds), readReactiveNodeKinds(pkg.kinds));
  }
  return {
    profiler,
    versions,
    kinds,
    fixtureKinds: displayPath(FIXTURE.kinds),
    interfaceMembers: () =>
      readInterfaceMembers(PANEL.types, 'DebugSignalGraphEdge'),
  };
})();

// ------------------------------------------------------------ the checks ----

test('the recording validates against the installed packages and its own evidence', () => {
  assert.doesNotThrow(() => validate(loadRecord()));
});

test('the recording is the canonical serialisation of its own record', () => {
  const text = readFileSync(RECORD_PATH, 'utf8');
  assert.equal(
    text,
    canonical(loadRecord()),
    'the recording is not the canonical serialisation of its record, so a re-measurement would not reproduce these bytes',
  );
});

test('no ProfilerEvent value denotes an effect, derived from both installed chunks', () => {
  const panel = live.profiler.get(displayPath(PANEL.chunk));
  const fixture = live.profiler.get(displayPath(FIXTURE.chunk));
  assert.ok(
    panel.length >= 26,
    `the panel package declares ${panel.length} values`,
  );
  assert.deepEqual(
    fixture,
    panel,
    'the two installs no longer declare the same list',
  );
  const effectNames = panel
    .map((entry) => entry.name)
    .filter((name) => /effect/i.test(name));
  assert.deepEqual(
    effectNames,
    [],
    `a ProfilerEvent value now names an effect: ${JSON.stringify(effectNames)}`,
  );
  const record = loadRecord();
  assert.deepEqual(
    record.profiler.sources[0].values,
    panel,
    'the recorded enumeration is not the list this run derives',
  );
  assert.equal(record.profiler.effectEvent.absent, true);
  assert.equal(record.profiler.effectEvent.count, 0);
  const kinds = live.kinds.get(displayPath(PANEL.kinds));
  assert.ok(
    kinds.includes('afterRenderEffectPhase'),
    'ReactiveNodeKind no longer declares afterRenderEffectPhase',
  );
  assert.ok(
    !panel.some((entry) => entry.name === 'afterRenderEffectPhase'),
    'afterRenderEffectPhase is now a profiler event, so the phase would be observable',
  );
  assert.match(record.profiler.finding, /No value name contains `effect`/);
});

test('the effect is unlabelled on the fixture and its edge names the signal it reads', () => {
  const record = loadRecord();
  assert.equal(record.effect.freshRead.kind, 'effect');
  assert.equal(record.effect.freshRead.label, '');
  assert.equal(record.effect.freshRead.labelEmpty, true);
  assert.deepEqual(record.effect.freshRead.signalsTheEdgesName, ['count']);
  assert.equal(record.effect.agreement.signalAgrees, true);
  assert.equal(record.effect.fromRecording.holdsEpoch, false);
  assert.equal(typeof record.effect.freshRead.epoch, 'number');
  assert.match(record.effect.finding, /label ""/);
});

test('the graph labels one portal effect and leaves the rest empty', () => {
  const record = loadRecord();
  const portal = record.effect.portalRead;
  assert.ok(
    portal.effectNodeOccurrences > 0,
    'the portal read holds no effect node',
  );
  assert.deepEqual(portal.effectLabelSet, ['', 'Resource.loadEffect']);
  assert.ok(portal.labelledEffectNodeOccurrences > 0);
  assert.ok(
    portal.labelledEffectNodeOccurrences < portal.effectNodeOccurrences,
    'every portal effect node is labelled, so the empty-label finding moved',
  );
  for (const node of portal.labelledEffectNodes) {
    assert.equal(node.label, 'Resource.loadEffect');
    assert.ok(
      node.producers.length > 0,
      'the labelled effect names no producer',
    );
  }
});

test('no node of kind afterRenderEffectPhase and no phase field anywhere', () => {
  const record = loadRecord();
  assert.equal(record.phase.verdict, 'declared-not-observed');
  assert.equal(record.phase.afterRenderEffectPhaseNodes, 0);
  assert.equal(record.phase.nodesWithPhaseField, 0);
  assert.equal(record.phase.portal.afterRenderEffectPhaseNodes, 0);
  assert.equal(record.phase.portal.nodesWithPhaseField, 0);
  assert.deepEqual(record.phase.pagesUsingAfterRenderEffect, []);
  assert.deepEqual(filesCallingAfterRenderEffect(), []);
  assert.ok(
    !record.phase.nodeFieldsObserved.includes('phase'),
    'a node now carries a phase field',
  );
  assert.match(record.phase.finding, /declared and not observed/);
});

test('the live attempt produced no NG0100, and the digest entry is a substitute', () => {
  const record = loadRecord();
  assert.equal(record.changeDetection.result, 'negative');
  assert.deepEqual(record.changeDetection.messages, []);
  for (const attempt of record.changeDetection.attempts) {
    assert.equal(attempt.result, 'negative', attempt.target);
    assert.deepEqual(attempt.messages, [], attempt.target);
    assert.equal(attempt.build.configuration, 'development', attempt.target);
  }
  assert.equal(record.changeDetection.substitute.code, 'NG0100');
  assert.equal(record.changeDetection.substitute.notACapture, true);
  assert.equal(record.changeDetection.substitute.kind, 'digest-entry');
  assert.equal(record.changeDetection.substitute.entriesWhoseCodeIsNg0100, 1);
  assert.match(record.changeDetection.finding, /substitute/);
  assert.match(record.changeDetection.finding, /No page produced an NG0100/);
});

test('the record carries no write, no owner and no cause', () => {
  const record = loadRecord();
  assert.doesNotThrow(() =>
    validateNoWriteNoOwnerNoCause(canonical(record), record),
  );
  const text = readFileSync(RECORD_PATH, 'utf8');
  for (const needle of ['lastLogged', 'owner', 'because', 'attributedTo']) {
    assert.equal(
      text.includes(needle),
      false,
      `the recording carries ${JSON.stringify(needle)}`,
    );
  }
});

test('PRECONDITION: the fixture page the fresh read names is the page the recording names', () => {
  const page = readFileSync(
    requireFile(COUNTER_PAGE, 'the counter page is the effect`s page'),
    'utf8',
  );
  assert.match(page, /effect\(\(\) => /, 'the counter page authors no effect');
  const record = loadRecord();
  assert.equal(record.effect.freshRead.element, 'app-counter');
  assert.equal(record.effect.freshRead.component, '_Counter');
  assert.equal(record.effect.freshRead.url, 'http://localhost:4222/');
});

test('this suite drives no browser and writes nothing', () => {
  const source = readFileSync(SELF_PATH, 'utf8');
  // Assembled so this check does not count its own needles.
  const forbidden = [
    ['play', 'wright'].join(''),
    ['chrom', 'ium'].join(''),
    ['page', '.', 'goto'].join(''),
    ['child', '_', 'process'].join(''),
  ];
  for (const needle of forbidden) {
    assert.equal(
      source.includes(needle),
      false,
      `this suite carries ${JSON.stringify(needle)}, and the live attempt belongs to the recording's provenance`,
    );
  }
  assert.equal(
    source.includes(['writeFile', 'Sync', '('].join('')),
    false,
    'this suite writes a file, and a default run must leave the recording untouched',
  );
});

const SHA_AT_LOAD = existsSync(RECORD_PATH)
  ? createHash('sha256').update(readFileSync(RECORD_PATH)).digest('hex')
  : null;

test('this run wrote nothing: the recording is unchanged after the run', () => {
  assert.notEqual(SHA_AT_LOAD, null, 'the recording is missing');
  assert.equal(
    createHash('sha256').update(readFileSync(RECORD_PATH)).digest('hex'),
    SHA_AT_LOAD,
    'the recording changed during a default run',
  );
});

// ------------------------------------------------------------- held-out ----

test('held-out: an enum value added upstream reddens the recorded list', () => {
  const mutant = clone(loadRecord());
  mutant.profiler.sources[1].values.push({ name: 'EffectStart', value: 26 });
  assert.throws(() => validate(mutant), /holds 27 value/);
});

test('held-out: a recording that claims an effect event reddens', () => {
  const mutant = clone(loadRecord());
  mutant.profiler.effectEvent.absent = false;
  assert.throws(() => validate(mutant), /effectEvent/);
});

test('held-out: a recording whose profiler block lost a value reddens', () => {
  const mutant = clone(loadRecord());
  mutant.profiler.sources[0].values.pop();
  assert.throws(() => validate(mutant), /holds 25 value/);
});

test('held-out: a recording that moves the agent citation reddens', () => {
  const mutant = clone(loadRecord());
  mutant.profiler.agent.declaredAt = 'extension/agent-main.js:1-2';
  assert.throws(() => validate(mutant), /declaredAt cites lines/);
});

test('held-out: a labelled effect on the fixture reddens the empty-label finding', () => {
  const mutant = clone(loadRecord());
  mutant.effect.freshRead.label = 'counterEffect';
  assert.throws(() => validate(mutant), /label is "counterEffect"|labelEmpty/);
});

test('held-out: a recording that names a different signal reddens', () => {
  const mutant = clone(loadRecord());
  mutant.effect.freshRead.signalsTheEdgesName = ['items'];
  assert.throws(() => validate(mutant), /signalsTheEdgesName/);
});

test('held-out: a recording whose probe evidence changed reddens', () => {
  const mutant = clone(loadRecord());
  mutant.effect.fromRecording.edges.pop();
  assert.throws(() => validate(mutant), /fromRecording\.edges/);
});

test('held-out: a recording that states an epoch the probe recording cannot hold reddens', () => {
  const mutant = clone(loadRecord());
  mutant.effect.fromRecording.epoch = 1;
  assert.throws(() => validate(mutant), /states an epoch/);
});

test('held-out: a recording that claims an observed phase node reddens', () => {
  const mutant = clone(loadRecord());
  mutant.phase.pagesRead[0].afterRenderEffectPhaseNodes = 1;
  assert.throws(() => validate(mutant), /kind afterRenderEffectPhase|sum to/);
});

test('held-out: a recording whose phase verdict moved reddens', () => {
  const mutant = clone(loadRecord());
  mutant.phase.verdict = 'observed';
  assert.throws(() => validate(mutant), /phase\.verdict/);
});

test('held-out: a digest entry relabelled as a capture reddens', () => {
  const mutant = clone(loadRecord());
  mutant.changeDetection.substitute.notACapture = false;
  assert.throws(() => validate(mutant), /notACapture|presented as a capture/);
});

test('held-out: a fabricated capture reddens', () => {
  const mutant = clone(loadRecord());
  mutant.changeDetection.attempts[0].result = 'captured';
  mutant.changeDetection.result = 'captured';
  assert.throws(() => validate(mutant), /capture was fabricated/);
});

test('held-out: an attempt stripped of its provenance reddens', () => {
  const mutant = clone(loadRecord());
  mutant.changeDetection.attempts[0].at = 'yesterday';
  assert.throws(() => validate(mutant), /attempts\[.*\]\.at is yesterday/);
});

test('held-out: a record that drops the portal attempt reddens', () => {
  const mutant = clone(loadRecord());
  mutant.changeDetection.attempts = mutant.changeDetection.attempts.filter(
    (attempt) => !attempt.target.includes('Portal'),
  );
  assert.throws(() => validate(mutant), /default verification target/);
});

test('held-out: a write claim smuggled into the record reddens', () => {
  const mutant = clone(loadRecord());
  mutant.effect.writes = ['lastLogged.set'];
  assert.throws(() => validate(mutant), /`writes` key/);
});

test('held-out: an edge said to carry a write reddens', () => {
  const mutant = clone(loadRecord());
  mutant.effect.writeAsAnEdge.edgeCarriesAWrite = true;
  assert.throws(() => validate(mutant), /edge carries a write/);
});

test('held-out: a subtler signal name still reddens', () => {
  const mutant = clone(loadRecord());
  mutant.effect.portalRead.effectLabelSet = [''];
  assert.throws(() => validate(mutant), /effectLabelSet/);
});
