// @ts-check
//
// M039 T004 - the re-capture behind an opt-in switch, and the recording's own
// freshness check (INTENT.md SC6; T004's AC1, AC2 and AC5).
//
// The recording `research/raw/m039-render-phase.json` is T001's one measurement.
// A measurement that can only be taken once goes stale the first time the page,
// the fixture or the installed `@angular/core` moves; a measurement that is
// re-taken on every `npm test` writes into a tracked file as a side effect of
// the suite. This repository has paid for the second failure twice - M029 T007
// and M030 T006 both landed a capture that rewrote a tracked recording during a
// default run and broke idempotence - so the switch is opt-in and the write is
// gated by `M039_CAPTURE=1`.
//
// Unarmed (the default, and what `npm test` runs):
//
//   node --experimental-strip-types --test scripts/render-phase-capture.test.mjs
//
// it drives nothing and writes nothing. It names every file it would write,
// asserts that none of them changed during the run, and asserts that the
// recording on disk still re-derives from the evidence this head carries - the
// two installed `@angular/core` chunks and declaration files, the probe
// recording's graph, the fixture sources and the error digest - so an unarmed
// run is a freshness check rather than a no-op.
//
// Armed, on Windows cmd.exe (a bare `set M039_CAPTURE=1 &&` leaves the space
// inside the variable and arms nothing):
//
//   set "M039_CAPTURE=1"&& node --experimental-strip-types --test "scripts/render-phase-capture.test.mjs"
//
// Point the checks at another recording, for a proof run:
//
//   set "M039_RECORD=<path>"&& node --experimental-strip-types --test "scripts/render-phase-capture.test.mjs"
//
// What "armed" re-measures, stated exactly: every value a committed artefact can
// settle. The profiler enumeration and the node kinds come from the two
// installed packages; the effect's kind, label, edges and the signals those
// edges name come from the probe recording the page produced; the phase verdict
// comes from the installed declarations and the fixture sources; the
// change-detection half comes from the digest entry the recording names; and the
// capture's own provenance block names the route, the build and the instance the
// recording points at, with the build's Angular version read from the fixture's
// install. The counter page's fresh read and the portal sweep are the provenance
// of the one page read this milestone took: they are carried unchanged, and this
// file re-checks their internal consistency instead of re-driving a browser. A
// re-drive is a manual step with a fresh clock, a fresh console count and a fresh
// browser build string, and each of those is a byte that would move on every run
// - which is exactly the drift AC5 forbids.
//
// Idempotence is proven, not assumed: the armed run compares the record against
// a fresh derivation and writes only when one derived value moved (or when the
// file is not the canonical serialisation of its record). Two armed runs with
// nothing moved leave the recording byte-identical, and the recording's SHA-256
// is reported in a diagnostic rather than pinned as a literal - a pinned hash, a
// pinned timestamp or a pinned browser build string is the stale value this
// milestone's own approach forbids.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import { test } from 'node:test';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const SELF_PATH = fileURLToPath(import.meta.url);

const RECORD_PATH =
  process.env.M039_RECORD ??
  join(ROOT, 'research', 'raw', 'm039-render-phase.json');
const EFFECT_RECORDING_PATH = join(
  ROOT,
  'research',
  'raw',
  'effect-writes.json',
);
const DIGEST_PATH = join(ROOT, 'extension', 'error-digest.json');
const AGENT_PATH = join(ROOT, 'extension', 'agent-main.js');
const JOIN_PATH = join(ROOT, 'extension', 'render-phase.js');
const PANE_PATH = join(
  ROOT,
  'apps',
  'angular-ai-devtools',
  'src',
  'app',
  'panel-render-phase.ts',
);
const APP = join(ROOT, 'spikes', 'ng222-app');
const FIXTURE_SRC = join(APP, 'src');

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
  manifest: join(APP, 'node_modules', '@angular', 'core', 'package.json'),
  chunk: join(
    APP,
    'node_modules',
    '@angular',
    'core',
    'fesm2022',
    '_debug_node-chunk.mjs',
  ),
  types: join(APP, 'node_modules', '@angular', 'core', 'types', 'core.d.ts'),
  kinds: join(
    APP,
    'node_modules',
    '@angular',
    'core',
    'types',
    '_formatter-chunk.d.ts',
  ),
};

const PACKAGES = [PANEL, FIXTURE];

const SCRIPT = 'scripts/render-phase-capture.test.mjs';
const CHECK_COMMAND = `node --experimental-strip-types --test "${SCRIPT}"`;
const ARMED_CAPTURE_COMMAND = `set "M039_CAPTURE=1"&& node --experimental-strip-types --test "${SCRIPT}"`;

/** The one volatile field of the capture block: the time the file was written. */
const VOLATILE_CAPTURE_FIELD = 'at';

/**
 * Every file this suite would write, named here so a default run can prove that
 * none of them moved. The armed run writes the recording and nothing else; the
 * one path outside it is the proof copy the armed arm makes under the ignored
 * `tmp/` directory to show the write path is live.
 */
const WOULD_WRITE = [
  { path: RECORD_PATH, why: 'the recording T001 made, re-derived in place' },
];

const FORBIDDEN_KEYS = [
  'writes',
  'written',
  'owner',
  'cause',
  'wrote',
  'attributedTo',
];

const PROOF_COPY = join(ROOT, 'tmp', 'm039-capture-proof', 'recording.json');

// ---------------------------------------------------------------- helpers ----

/**
 * @param {string} message
 * @returns {never}
 */
function fail(message) {
  throw new Error(message);
}

/** @param {unknown} value @returns {boolean} */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** @param {string} path @returns {string} */
function displayPath(path) {
  return relative(ROOT, path).split(sep).join('/');
}

/** The bytes the recording is written as, and re-read as, on every run. */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/** @template T @param {T} value @returns {T} */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** @param {Buffer | string} bytes @returns {string} */
function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** @param {string} path @param {string} why @returns {unknown} */
function readJson(path, why) {
  if (!existsSync(path)) fail(`${displayPath(path)} is missing - ${why}`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** @param {string} path @param {string} why @returns {string} */
function readText(path, why) {
  if (!existsSync(path)) fail(`${displayPath(path)} is missing - ${why}`);
  return readFileSync(path, 'utf8');
}

/** @param {string} text @param {string} needle @returns {number} */
function occurrences(text, needle) {
  return text.split(needle).length - 1;
}

// -------------------------------------------------- the readers (evidence) ----

/**
 * Every `ProfilerEvent` value one installed chunk declares, by name and number.
 * The enum is a runtime IIFE in the shipped chunk, so this reads what the
 * browser would execute. The same reader is applied to both packages and
 * nothing here quotes a list.
 *
 * @param {string} chunk
 * @returns {Array<{ name: string, value: number }>}
 */
function readProfilerEvents(chunk) {
  const text = readText(chunk, 'run npm ci at the fixture');
  const start = text.indexOf('var ProfilerEvent;');
  if (start === -1) {
    fail(`${displayPath(chunk)} carries no \`var ProfilerEvent;\` declaration`);
  }
  const end = text.indexOf('})(ProfilerEvent ||', start);
  if (end === -1) fail(`${displayPath(chunk)} closes no ProfilerEvent IIFE`);
  const pattern =
    /ProfilerEvent\[ProfilerEvent\["([A-Za-z]+)"\] = (\d+)\] = "([A-Za-z]+)";/g;
  /** @type {Array<{ name: string, value: number }>} */
  const values = [];
  /** @type {RegExpExecArray | null} */
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

/**
 * Every `ReactiveNodeKind` member one installed declaration file carries.
 *
 * @param {string} kindsPath
 * @returns {string[]}
 */
function readReactiveNodeKinds(kindsPath) {
  const text = readText(kindsPath, 'run npm ci at the fixture');
  const match = /type ReactiveNodeKind = ([^;]+);/.exec(text);
  if (match === null) {
    fail(`${displayPath(kindsPath)} declares no ReactiveNodeKind`);
  }
  return [...(match[1] ?? '').matchAll(/'([A-Za-z]+)'/g)].map(
    (member) => member[1] ?? '',
  );
}

/**
 * The members of one interface, as name and type, from a declaration file.
 *
 * @param {string} typesPath
 * @param {string} name
 * @returns {Array<{ name: string, type: string }>}
 */
function readInterfaceMembers(typesPath, name) {
  const text = readText(typesPath, 'run npm ci at the fixture');
  const start = text.indexOf(`interface ${name} {`);
  if (start === -1) fail(`${displayPath(typesPath)} declares no ${name}`);
  const end = text.indexOf('}', start);
  if (end === -1) fail(`${displayPath(typesPath)} never closes ${name}`);
  const members = [
    ...text.slice(start, end).matchAll(/^\s*([A-Za-z]+):\s*([A-Za-z]+);\s*$/gm),
  ].map((match) => ({ name: match[1] ?? '', type: match[2] ?? '' }));
  if (members.length === 0) fail(`${name} carries no member`);
  return members;
}

/**
 * The version one installed package declares for itself.
 *
 * @param {string} manifest
 * @returns {string}
 */
function installedVersion(manifest) {
  const pkg = /** @type {{ version?: unknown }} */ (
    readJson(manifest, 'run npm ci')
  );
  if (typeof pkg.version !== 'string' || pkg.version === '') {
    fail(`${displayPath(manifest)} declares no version`);
  }
  return pkg.version;
}

/**
 * The `ProfilerEvent` literal the page agent hard-codes. The agent cannot read
 * the enum off the page, so this literal is the only place the extension states
 * which events it knows.
 *
 * @returns {Array<{ name: string, value: number }>}
 */
function agentProfilerLiteral() {
  const text = readText(
    AGENT_PATH,
    'the page agent is part of this repository',
  );
  const start = text.indexOf('var ProfilerEvent = {');
  if (start === -1) {
    fail('extension/agent-main.js carries no `var ProfilerEvent = {` literal');
  }
  const end = text.indexOf('};', start);
  if (end === -1) fail('the agent`s ProfilerEvent literal never closes');
  const values = [
    ...text.slice(start, end).matchAll(/^\s*([A-Za-z]+):\s*(\d+),\s*$/gm),
  ].map((match) => ({ name: match[1] ?? '', value: Number(match[2]) }));
  if (values.length === 0) {
    fail('the agent`s ProfilerEvent literal holds no value');
  }
  return values;
}

/**
 * Every file below a directory, repository-relative and sorted.
 *
 * @param {string} directory
 * @returns {string[]}
 */
function sourceFilesUnder(directory) {
  if (!existsSync(directory)) {
    fail(`${displayPath(directory)} is missing`);
  }
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

/** How many times the fixture sources spell `afterRenderEffect`. */
function afterRenderEffectOccurrences(files) {
  return files.reduce(
    (sum, file) =>
      sum +
      occurrences(readFileSync(join(ROOT, file), 'utf8'), 'afterRenderEffect'),
    0,
  );
}

/**
 * Everything this run reads from the installed packages and the repository. One
 * object, built once, so the derivation compares a recorded claim against the
 * same live evidence rather than re-reading a file per assertion - and so a
 * mutant can hand the derivation a different evidence set and watch it move.
 *
 * @returns {ReturnType<typeof evidenceShape>}
 */
function readEvidence() {
  const packages = PACKAGES.map((pkg) => ({
    label: pkg.label,
    manifest: displayPath(pkg.manifest),
    chunk: displayPath(pkg.chunk),
    kinds: displayPath(pkg.kinds),
    version: installedVersion(pkg.manifest),
    events: readProfilerEvents(pkg.chunk),
    declaredKinds: readReactiveNodeKinds(pkg.kinds),
    edgeMembers: readInterfaceMembers(pkg.types, 'DebugSignalGraphEdge'),
  }));

  const probe =
    /** @type {{ nodes: Array<Record<string, unknown>>, edges: string[] }} */ (
      readJson(
        EFFECT_RECORDING_PATH,
        'the probe recording is the cited evidence',
      )
    );
  if (!Array.isArray(probe.nodes) || !Array.isArray(probe.edges)) {
    fail('research/raw/effect-writes.json holds no nodes and edges');
  }

  const digest =
    /** @type {{ version: string, entries: Array<Record<string, string>> }} */ (
      readJson(DIGEST_PATH, 'the digest is the cited evidence')
    );
  if (!Array.isArray(digest.entries)) {
    fail('extension/error-digest.json holds no entries');
  }

  const filesCalling = filesCallingAfterRenderEffect();

  return evidenceShape({
    packages,
    probe: {
      nodes: probe.nodes.map((node) => ({
        kind: String(node.kind),
        label: String(node.label),
        holdsEpoch: Object.hasOwn(node, 'epoch'),
        epoch: Object.hasOwn(node, 'epoch') ? node.epoch : null,
      })),
      edges: probe.edges,
    },
    digest,
    agent: { values: agentProfilerLiteral() },
    fixture: {
      src: displayPath(FIXTURE_SRC),
      filesCalling,
      occurrences: afterRenderEffectOccurrences(filesCalling),
      app: displayPath(APP),
    },
  });
}

/**
 * The shape of an evidence object, stated once so the derivation's parameter and
 * `readEvidence`'s return cannot drift apart.
 *
 * @param {{
 *   packages: Array<{
 *     label: string, manifest: string, chunk: string, kinds: string,
 *     version: string,
 *     events: Array<{ name: string, value: number }>,
 *     declaredKinds: string[],
 *     edgeMembers: Array<{ name: string, type: string }>,
 *   }>,
 *   probe: {
 *     nodes: Array<{ kind: string, label: string, holdsEpoch: boolean, epoch: unknown }>,
 *     edges: string[],
 *   },
 *   digest: { version: string, entries: Array<Record<string, string>> },
 *   agent: { values: Array<{ name: string, value: number }> },
 *   fixture: { src: string, filesCalling: string[], occurrences: number, app: string },
 * }} evidence
 */
function evidenceShape(evidence) {
  return evidence;
}

// ------------------------------------------------------------ the derivation ----

/**
 * A dotted-path inventory of one object's first two levels: the sections a
 * re-capture re-measures. Derived from the derivation itself, so the list in the
 * recording cannot go stale behind the code.
 *
 * @param {Record<string, unknown>} tree
 * @returns {string[]}
 */
function sectionsOf(tree) {
  /** @type {string[]} */
  const sections = [];
  for (const [key, value] of Object.entries(tree)) {
    if (isObject(value) && Object.keys(value).length > 0) {
      for (const inner of Object.keys(value)) sections.push(`${key}.${inner}`);
      continue;
    }
    sections.push(key);
  }
  return sections.sort();
}

/**
 * Every value of the recording a committed artefact can settle, re-derived. The
 * return is a subtree, merged onto the recording by `merge`; nothing here copies
 * a recorded claim forward, so a field this function stops deriving shows up as
 * a diff against the recording rather than as a silent pass.
 *
 * @param {any} record
 * @param {ReturnType<typeof evidenceShape>} evidence
 * @returns {Record<string, any>}
 */
function derive(record, evidence) {
  const [panel, fixture] = evidence.packages;
  if (!panel || !fixture)
    fail('the evidence must carry both installed packages');
  const probe = evidence.probe;

  // ---- profiler: the installed enum, by the same reader for both installs ----
  const sources = record.profiler.sources.map((/** @type {any} */ source) => {
    const installed = evidence.packages.find(
      (entry) => entry.manifest === source.manifest,
    );
    if (!installed) {
      fail(
        `profiler.sources names ${source.manifest}, which this file did not read`,
      );
    }
    return {
      package: source.package,
      manifest: installed.manifest,
      version: installed.version,
      chunk: installed.chunk,
      count: installed.events.length,
      values: installed.events,
    };
  });

  const identical =
    JSON.stringify(panel.events) === JSON.stringify(fixture.events);
  const numbers = panel.events.map((entry) => entry.value);
  const contiguous =
    panel.events.every((entry, index) => entry.value === index) &&
    panel.events.length === Math.max(...numbers) + 1;
  const effectNames = panel.events
    .map((entry) => entry.name)
    .filter((name) => /effect/i.test(name));
  const carriedSymbol = String(record.profiler.effectIsCarriedAs?.symbol ?? '');
  const kindsIdentical =
    JSON.stringify(panel.declaredKinds) ===
    JSON.stringify(fixture.declaredKinds);

  const profiler = {
    sources,
    identical,
    numbers: {
      first: Math.min(...numbers),
      last: Math.max(...numbers),
      contiguous,
    },
    effectEvent: {
      matchingNames: effectNames,
      absent: effectNames.length === 0,
      count: effectNames.length,
    },
    effectIsCarriedAs: {
      symbol: carriedSymbol,
      carrier: 'ReactiveNodeKind',
      declaration: panel.kinds,
      kinds: panel.declaredKinds,
      fixtureKinds: fixture.declaredKinds,
      kindsIdentical,
      isProfilerEvent: panel.events.some(
        (entry) => entry.name === carriedSymbol,
      ),
    },
    agent: {
      source: displayPath(AGENT_PATH),
      declaredAt: record.profiler.agent?.declaredAt,
      actsOn: evidence.agent.values.map((entry) => entry.name),
      dropsTheRestAt: record.profiler.agent?.dropsTheRestAt,
    },
  };

  // ---- effect: the graph the probe recording carries ----
  const probeEffect = probe.nodes.find((node) => node.kind === 'effect');
  if (probeEffect === undefined) {
    fail(
      'the probe recording holds no node of kind `effect`, so every claim resting on it lost its evidence',
    );
  }
  const probeEdges = probe.edges.map((edge) => {
    const [consumer, producer] = edge.split(' -> ');
    if (consumer === undefined || producer === undefined) {
      fail(`the probe recording carries ${JSON.stringify(edge)}, not an edge`);
    }
    return { edge, consumer, producer };
  });
  const effectEdges = probeEdges.filter((edge) =>
    edge.consumer.startsWith('effect:'),
  );
  /** The signal label an edge's producer end names, without its node kind. */
  const signalOf = (/** @type {string} */ producer) =>
    producer.split(':').slice(1).join(':');

  const fromRecording = {
    kind: probeEffect.kind,
    label: probeEffect.label,
    labelEmpty: probeEffect.label === '',
    epoch: probeEffect.holdsEpoch ? probeEffect.epoch : null,
    holdsEpoch: probeEffect.holdsEpoch,
    holdsEpochReading: probeEffect.holdsEpoch
      ? 'the probe recording carries an epoch field, and the value above is it'
      : 'the probe recorded no epoch field, so this recording cannot state one',
    nodes: probe.nodes.map((node) => ({
      kind: node.kind,
      label: node.label,
    })),
    edges: probeEdges,
    signalsTheEdgesName: effectEdges.map((edge) => signalOf(edge.producer)),
  };

  const fresh = record.effect.freshRead;
  const agreement = {
    kindAgrees: fromRecording.kind === fresh.kind,
    labelAgrees: fromRecording.label === fresh.label,
    labelIsEmptyInBoth: fromRecording.label === '' && fresh.label === '',
    signalAgrees:
      JSON.stringify(fromRecording.signalsTheEdgesName) ===
      JSON.stringify(fresh.signalsTheEdgesName),
  };

  const writeFields = panel.edgeMembers.filter((member) =>
    /write/i.test(member.name),
  );

  const effect = {
    recording: {
      path: displayPath(EFFECT_RECORDING_PATH),
      nodeCount: probe.nodes.length,
      edgeCount: probe.edges.length,
    },
    fromRecording,
    agreement,
    writeAsAnEdge: {
      edgeShape: {
        declaration: displayPath(PANEL.types),
        interface: 'DebugSignalGraphEdge',
        members: panel.edgeMembers,
        fixtureMembers: fixture.edgeMembers,
        identical:
          JSON.stringify(panel.edgeMembers) ===
          JSON.stringify(fixture.edgeMembers),
      },
      writeFieldCount: writeFields.length,
      edgeCarriesAWrite: writeFields.length > 0,
    },
  };

  // ---- phase: declared by the declarations, observed nowhere ----
  const pagesRead = record.phase.pagesRead;
  const sumOf = (
    /** @type {Array<Record<string, number>>} */ pages,
    /** @type {string} */ key,
  ) => pages.reduce((sum, page) => sum + Number(page[key] ?? 0), 0);
  const phaseNodes =
    sumOf(pagesRead, 'afterRenderEffectPhaseNodes') +
    Number(record.phase.portal?.afterRenderEffectPhaseNodes ?? 0);
  const declaredNodeKind = String(record.phase.declared.nodeKind);
  const declared = panel.declaredKinds.includes(declaredNodeKind);

  const phase = {
    declared: {
      nodeKind: declaredNodeKind,
      carrier: 'ReactiveNodeKind',
      declaration: panel.kinds,
      kinds: panel.declaredKinds,
      declared,
    },
    nodesRead: sumOf(pagesRead, 'nodeCount'),
    afterRenderEffectPhaseNodes: sumOf(
      pagesRead,
      'afterRenderEffectPhaseNodes',
    ),
    nodesWithPhaseField: sumOf(pagesRead, 'nodesWithPhaseField'),
    nodeFieldsObserved: [
      ...new Set(
        pagesRead.flatMap((/** @type {any} */ page) => page.nodeFields),
      ),
    ].sort(),
    pagesUsingAfterRenderEffect: evidence.fixture.filesCalling,
    sourceScans: record.phase.sourceScans.map((/** @type {any} */ scan) =>
      scan.where === evidence.fixture.src
        ? {
            ...scan,
            afterRenderEffectOccurrences: evidence.fixture.occurrences,
          }
        : scan,
    ),
    verdict: declared
      ? phaseNodes > 0
        ? 'observed'
        : 'declared-not-observed'
      : 'not-declared',
  };

  // ---- changeDetection: the digest entry the recording names ----
  const substitute = record.changeDetection.substitute;
  const code = String(substitute.code);
  const digestText = JSON.stringify(evidence.digest);
  const matching = evidence.digest.entries.filter(
    (entry) => entry.code === code,
  );
  if (matching.length === 0) {
    fail(
      `the digest carries no entry whose code is ${code}, so the substitute lost its evidence`,
    );
  }
  const entry = matching[0];
  if (entry === undefined) fail(`the digest carries no entry for ${code}`);
  const attempts = record.changeDetection.attempts;
  const captured = attempts.filter(
    (/** @type {any} */ attempt) => attempt.result === 'captured',
  );

  const changeDetection = {
    result: captured.length > 0 ? 'captured' : 'negative',
    messages: captured.flatMap(
      (/** @type {any} */ attempt) => attempt.messages ?? [],
    ),
    substitute: {
      source: displayPath(DIGEST_PATH),
      digestVersion: evidence.digest.version,
      entryIndex: evidence.digest.entries.indexOf(entry),
      code,
      title: entry.title,
      digestEntries: evidence.digest.entries.length,
      entriesWhoseCodeIsNg0100: matching.length,
      occurrencesOfNg0100InTheDigestText: occurrences(digestText, code),
      bodyTruncatedInSource: String(entry.body).endsWith('\u2026'),
    },
  };

  const derived = { profiler, effect, phase, changeDetection };
  const capture = captureBlock(record, evidence, sectionsOf(derived));

  return { ...derived, capture };
}

/**
 * The provenance block the armed capture stamps: the route, the build and the
 * instance the recording points at, the time of the write, and the sections the
 * armed run re-measures. Two of these are live reads (the fixture's Angular
 * version and the app the fixture lives in); the rest point at the recorded read
 * rather than restating it, so nothing here can drift from the page read.
 *
 * @param {any} record
 * @param {ReturnType<typeof evidenceShape>} evidence
 * @param {string[]} remeasured
 * @returns {Record<string, unknown>}
 */
function captureBlock(record, evidence, remeasured) {
  const fresh = record.effect.freshRead;
  const attempt = record.changeDetection.attempts[0];
  const fixture = evidence.packages[1];
  if (fixture === undefined)
    fail('the evidence must carry the fixture install');
  return {
    task: 'T004',
    command: ARMED_CAPTURE_COMMAND,
    check: CHECK_COMMAND,
    records: displayPath(RECORD_PATH),
    route: new URL(String(fresh.url)).pathname,
    page: fresh.url,
    element: fresh.element,
    component: fresh.component,
    build: {
      app: evidence.fixture.app,
      angular: fixture.version,
      configuration: attempt.build.configuration,
    },
    instance: {
      name: attempt.instance.name,
      cdp: attempt.instance.cdp,
    },
    [VOLATILE_CAPTURE_FIELD]: record.capture?.[VOLATILE_CAPTURE_FIELD] ?? null,
    remeasured,
    reading:
      'an armed run re-measures every section listed above from the artefacts this head carries: the installed packages, the probe recording, the fixture sources and the digest. The counter page fresh read and the portal sweep are the provenance of the one page read this milestone took and are carried unchanged, so a re-drive - with a fresh clock, a fresh console count and a fresh browser build string - is a manual step and never a side effect of a test run',
  };
}

// --------------------------------------------------------------- the merge ----

/**
 * Deep-assign a derived subtree onto a record. Objects merge, everything else
 * (arrays included) replaces, so a derived list is the list.
 *
 * @param {any} target
 * @param {any} source
 * @returns {any}
 */
function merge(target, source) {
  const out = clone(target);
  for (const [key, value] of Object.entries(source)) {
    out[key] =
      isObject(value) && isObject(out[key])
        ? merge(out[key], value)
        : clone(value);
  }
  return out;
}

/**
 * The recording as it is compared: the capture's write time is the one field a
 * re-capture may always change, so it is held constant on both sides.
 *
 * @param {any} record
 * @returns {any}
 */
function comparable(record) {
  const out = clone(record);
  if (isObject(out.capture))
    out.capture[VOLATILE_CAPTURE_FIELD] = '<write time>';
  return out;
}

/**
 * Where two records disagree, as `path: recorded -> derived`. Empty means the
 * recording is the derivation.
 *
 * @param {any} recorded
 * @param {any} derived
 * @param {string} [at]
 * @returns {string[]}
 */
function divergence(recorded, derived, at = '') {
  if (
    isObject(recorded) &&
    isObject(derived) &&
    !Array.isArray(recorded) &&
    !Array.isArray(derived)
  ) {
    /** @type {string[]} */
    const found = [];
    for (const key of [
      ...new Set([...Object.keys(recorded), ...Object.keys(derived)]),
    ]) {
      const path = at === '' ? key : `${at}.${key}`;
      if (!Object.hasOwn(recorded, key)) {
        found.push(`${path}: missing -> ${JSON.stringify(derived[key])}`);
        continue;
      }
      if (!Object.hasOwn(derived, key)) {
        found.push(`${path}: ${JSON.stringify(recorded[key])} -> missing`);
        continue;
      }
      found.push(...divergence(recorded[key], derived[key], path));
    }
    return found;
  }
  if (JSON.stringify(recorded) === JSON.stringify(derived)) return [];
  return [`${at}: ${JSON.stringify(recorded)} -> ${JSON.stringify(derived)}`];
}

// -------------------------------------------------------------- validation ----

/**
 * @param {unknown} value
 * @param {string} where
 * @returns {void}
 */
function strings(value, where) {
  if (!isObject(value)) fail(`missing ${where}`);
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'string' && entry === '')
      fail(`missing ${where}.${key}`);
  }
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isIsoTimestamp(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)
  );
}

/**
 * The record's own shape and provenance, which no reading of the evidence can
 * settle: the schema, the task that established it, the capture block's command
 * strings and the write time.
 *
 * @param {any} record
 * @returns {void}
 */
function assertShape(record) {
  if (!isObject(record)) fail('the recording is not an object');
  if (record.schema !== 'm039-render-phase/v1') {
    fail(`the recording schema is ${JSON.stringify(record.schema)}`);
  }
  if (record.milestone !== 'render-phase-effect') {
    fail(`the recording milestone is ${JSON.stringify(record.milestone)}`);
  }
  // The task that established the record: T001 measured it, and its own suite
  // pins this field, so a re-capture rewrites the file without rewriting who
  // took the measurement.
  if (record.task !== 'T001') {
    fail(`the recording task is ${JSON.stringify(record.task)}`);
  }
  for (const key of ['title', 'question']) {
    if (typeof record[key] !== 'string' || record[key] === '') {
      fail(`missing the recording's ${key}`);
    }
  }
  if (!isIsoTimestamp(record.capturedAt)) {
    fail(`the recording capturedAt is ${record.capturedAt}`);
  }
  strings(record.commands, 'commands');
  strings(record.environment, 'environment');
  // `commands` belongs to the measurement T001 took - its own suite pins
  // `commands.check` to that suite - so the switch names its own commands in the
  // `capture` block rather than rewriting the provenance of the measurement.
  if (!String(record.commands.check).includes('render-phase')) {
    fail(
      `commands.check is ${JSON.stringify(record.commands.check)}, which is not a render-phase suite`,
    );
  }
  if (
    !Array.isArray(record.doesNotSettle) ||
    record.doesNotSettle.length === 0
  ) {
    fail('the record does not say what it does not settle');
  }

  const capture = record.capture;
  if (!isObject(capture)) {
    fail(
      'the record carries no capture block: it has never been re-derived behind the opt-in switch',
    );
  }
  if (capture.command !== ARMED_CAPTURE_COMMAND) {
    fail(
      `capture.command is ${JSON.stringify(capture.command)}; the armed form is ${JSON.stringify(ARMED_CAPTURE_COMMAND)}`,
    );
  }
  if (!String(capture.command).includes('M039_CAPTURE=1')) {
    fail('capture.command names no gate, so the capture is not opt-in');
  }
  if (capture.check !== CHECK_COMMAND) {
    fail(`capture.check is ${JSON.stringify(capture.check)}`);
  }
  if (!isIsoTimestamp(capture[VOLATILE_CAPTURE_FIELD])) {
    fail(
      `capture.${VOLATILE_CAPTURE_FIELD} is ${String(capture[VOLATILE_CAPTURE_FIELD])}, not the time the file was written`,
    );
  }
  if (!Array.isArray(capture.remeasured) || capture.remeasured.length === 0) {
    fail('capture.remeasured is empty, so the record does not say what moved');
  }
  strings(capture.build, 'capture.build');
  strings(capture.instance, 'capture.instance');
}

/**
 * The claims a read of the page settles and no committed artefact can: that the
 * two recorded reads agree with each other, that a failed attempt is not
 * recorded as a capture, and that nothing in the record names a write, an owner
 * or a cause.
 *
 * @param {any} record
 * @param {ReturnType<typeof evidenceShape>} evidence
 * @returns {void}
 */
function assertInternal(record, evidence) {
  const fresh = record.effect.freshRead;
  if (fresh.kind !== 'effect') fail(`effect.freshRead.kind is ${fresh.kind}`);
  if (fresh.labelEmpty !== (fresh.label === '')) {
    fail('effect.freshRead.labelEmpty disagrees with its own label');
  }
  if (!Array.isArray(fresh.nodes) || fresh.nodes.length !== fresh.nodeCount) {
    fail('effect.freshRead.nodes does not match its own nodeCount');
  }
  const nodeAt = new Map(
    fresh.nodes.map((/** @type {any} */ node) => [node.index, node]),
  );
  const effectNode = nodeAt.get(fresh.nodeIndex);
  if (effectNode === undefined) {
    fail(
      `effect.freshRead.nodeIndex ${fresh.nodeIndex} is not one of its nodes`,
    );
  }
  for (const key of ['kind', 'label', 'epoch']) {
    if (effectNode[key] !== fresh[key]) {
      fail(
        `effect.freshRead.${key} is ${JSON.stringify(fresh[key])} and the node it names carries ${JSON.stringify(effectNode[key])}`,
      );
    }
  }
  for (const edge of fresh.edges) {
    if (
      !fresh.allEdges.some(
        (/** @type {any} */ candidate) =>
          candidate.consumer === edge.consumer &&
          candidate.producer === edge.producer,
      )
    ) {
      fail(
        `effect.freshRead.edges carries ${JSON.stringify(edge)}, which is not an edge the same read recorded`,
      );
    }
  }
  const producerLabels = fresh.producers.map(
    (/** @type {any} */ producer) => producer.label,
  );
  if (
    JSON.stringify(fresh.signalsTheEdgesName) !== JSON.stringify(producerLabels)
  ) {
    fail(
      `effect.freshRead.signalsTheEdgesName is ${JSON.stringify(fresh.signalsTheEdgesName)} and its producers are labelled ${JSON.stringify(producerLabels)}`,
    );
  }

  const portal = record.effect.portalRead;
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

  for (const attempt of record.changeDetection.attempts) {
    const where = `changeDetection.attempts[${attempt.target}]`;
    if (!Array.isArray(attempt.messages)) {
      fail(`${where}.messages is not a list`);
    }
    if (attempt.result === 'captured' && attempt.messages.length === 0) {
      fail(
        `${where} is recorded as a capture and holds no message, so a capture was fabricated`,
      );
    }
    if (attempt.result === 'negative') {
      if (attempt.messages.length !== 0 || attempt.ng0100Count !== 0) {
        fail(`${where} is recorded as negative and holds messages`);
      }
      if (attempt.expressionChangedCount !== 0) {
        fail(
          `${where} is recorded as negative and counts ExpressionChanged errors`,
        );
      }
    }
    if (!isIsoTimestamp(attempt.at)) fail(`${where}.at is ${attempt.at}`);
  }

  const substitute = record.changeDetection.substitute;
  if (substitute.notACapture !== true) {
    fail(
      'changeDetection.substitute is not marked `notACapture`, so a digest entry is being presented as a capture',
    );
  }
  if (!/substitute/i.test(String(substitute.reading))) {
    fail(
      'changeDetection.substitute.reading does not name the entry as a substitute',
    );
  }
  const entry = evidence.digest.entries.find(
    (candidate) => candidate.code === substitute.code,
  );
  if (entry === undefined) fail('the digest holds no entry for the substitute');
  if (!String(entry.body).startsWith(String(substitute.bodyStartsWith))) {
    fail(
      'changeDetection.substitute.bodyStartsWith is not a prefix of the digest body',
    );
  }

  const phase = record.phase;
  if (!phase.declared.kinds.includes(String(phase.declared.nodeKind))) {
    fail(
      `phase.declared.nodeKind is ${JSON.stringify(phase.declared.nodeKind)} and the installed declaration does not carry it`,
    );
  }
  if (
    phase.nodeFieldsObserved.includes('phase') ||
    phase.nodesWithPhaseField !== 0
  ) {
    fail(
      'a node now carries a `phase` field, so the phase would be observable',
    );
  }

  /** @type {string[]} */
  const keys = [];
  /** @param {unknown} value */
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
        `the record carries a \`${forbidden}\` key; this milestone records no write, no owner and no cause`,
      );
    }
  }
}

/**
 * The whole check: the record's shape, its internal claims, and every value the
 * derivation can settle. A disagreement fails naming the path, so a moved
 * reading is reported rather than absorbed.
 *
 * @param {any} record
 * @param {ReturnType<typeof evidenceShape>} [given]
 * @returns {any}
 */
function validate(record, given = EVIDENCE) {
  assertShape(record);
  const derived = derive(record, given);
  const moved = divergence(
    comparable(record),
    comparable(merge(record, derived)),
  );
  if (moved.length > 0) {
    fail(
      `the recording disagrees with this run's derivation at ${moved.length} value(s): ${moved.slice(0, 4).join('; ')}`,
    );
  }
  assertInternal(record, given);
  return record;
}

// ------------------------------------------------------------- the capture ----

/**
 * The armed capture. Re-derive, compare, and write only what moved. The write
 * time is stamped only when a write happens, so a run that finds nothing to say
 * leaves the file exactly as it found it - which is what makes two armed runs
 * byte-identical.
 *
 * @param {string} path
 * @param {{ now?: string }} [options]
 * @returns {{
 *   path: string, before: string, after: string, wrote: boolean,
 *   moved: string[], at: unknown,
 * }}
 */
function capture(path, options = {}) {
  const now = options.now ?? new Date().toISOString();
  const text = readText(path, 'the recording has not been made');
  const before = sha256(text);
  const record = JSON.parse(text);
  const derived = derive(record, EVIDENCE);
  const candidate = merge(record, derived);
  /** @type {string[]} */
  const moved = divergence(comparable(record), comparable(candidate));
  if (text !== canonical(record)) {
    moved.push('the file is not the canonical serialisation of its record');
  }
  if (moved.length === 0) {
    return {
      path,
      before,
      after: before,
      wrote: false,
      moved,
      at: record.capture?.[VOLATILE_CAPTURE_FIELD] ?? null,
    };
  }
  candidate.capture[VOLATILE_CAPTURE_FIELD] = now;
  // Never write a record that would fail its own check.
  validate(candidate);
  writeFileSync(path, canonical(candidate));
  return {
    path,
    after: sha256(readFileSync(path)),
    before,
    wrote: true,
    moved,
    at: now,
  };
}

// -------------------------------------------------------- the read-only pins ----

const SHA_AT_LOAD = new Map(
  WOULD_WRITE.map((file) => [
    file.path,
    existsSync(file.path) ? sha256(readFileSync(file.path)) : null,
  ]),
);

const EVIDENCE = readEvidence();

// ---------------------------------------------------------- the armed capture ----
//
// First, so an armed run captures before the read-only pins read the file back:
// the same pins then prove the freshly written recording still validates.

if (process.env.M039_CAPTURE === '1') {
  test('armed: re-derive, write only what moved, and a second run changes no byte', (t) => {
    const first = capture(RECORD_PATH);
    t.diagnostic(
      first.wrote
        ? `armed run wrote ${displayPath(first.path)}; moved: ${first.moved.slice(0, 6).join('; ')}`
        : 'armed run: nothing moved, nothing written',
    );
    assert.equal(first.after, sha256(readFileSync(first.path)));

    const second = capture(RECORD_PATH);
    assert.equal(
      second.before,
      second.after,
      'a second armed run changed the recording, so the re-capture is not idempotent',
    );
    assert.equal(
      second.wrote,
      false,
      'the second armed run wrote, and nothing had moved',
    );
    t.diagnostic(
      `armed idempotence: ${readFileSync(RECORD_PATH).length} bytes, sha256 ${second.after} before and after the second run`,
    );
    assert.doesNotThrow(() =>
      validate(JSON.parse(readText(RECORD_PATH, 'no recording'))),
    );
  });

  test('armed: the write path is live - a stale copy is corrected, then left alone', (t) => {
    mkdirSync(dirname(PROOF_COPY), { recursive: true });
    const stale = clone(JSON.parse(readText(RECORD_PATH, 'no recording')));
    stale.effect.fromRecording.signalsTheEdgesName = ['elsewhere'];
    stale.profiler.sources[1].values.pop();
    writeFileSync(PROOF_COPY, canonical(stale));

    const first = capture(PROOF_COPY);
    assert.equal(first.wrote, true, 'the stale copy was not corrected');
    assert.ok(
      first.moved.join(' ').includes('fromRecording.signalsTheEdgesName'),
      `the correction did not name the stale signal; it named ${first.moved.join('; ')}`,
    );
    const repaired = JSON.parse(readText(PROOF_COPY, 'the proof copy'));
    assert.deepEqual(
      repaired.effect.fromRecording.signalsTheEdgesName,
      JSON.parse(readText(RECORD_PATH, 'no recording')).effect.fromRecording
        .signalsTheEdgesName,
      'the corrected copy does not agree with the recording',
    );

    const second = capture(PROOF_COPY);
    assert.equal(
      second.wrote,
      false,
      'a second armed run rewrote a corrected copy',
    );
    assert.equal(
      second.after,
      first.after,
      'the corrected copy changed on a second armed run',
    );
    t.diagnostic(
      `proof copy: corrected ${first.moved.length} value(s), then byte-identical at ${second.after}`,
    );
  });
}

test('the recording still re-derives from the evidence this head carries', (t) => {
  const record = validate(JSON.parse(readText(RECORD_PATH, 'no recording')));
  const bytes = readFileSync(RECORD_PATH);
  t.diagnostic(
    `recording ${displayPath(RECORD_PATH)}: ${bytes.length} bytes, sha256 ${sha256(bytes)}`,
  );
  assert.equal(
    readFileSync(RECORD_PATH, 'utf8'),
    canonical(record),
    'the recording is not the canonical serialisation of its record, so a re-capture would not reproduce these bytes',
  );
});

test('every file this suite would write is named, and the recording is the only one', () => {
  assert.equal(WOULD_WRITE.length, 1, 'the file list must name what it writes');
  assert.equal(WOULD_WRITE[0]?.path, RECORD_PATH);
  for (const file of WOULD_WRITE) {
    const shown = displayPath(file.path);
    assert.ok(
      shown.startsWith('research/raw/') || shown.startsWith('tmp/'),
      `${shown} is outside the two places this suite may write`,
    );
  }
  const source = readText(SELF_PATH, 'this file');
  // Assembled so this check does not find its own needles.
  const gate = source.indexOf(
    ['if (process.env.M039', "_CAPTURE === '1') {"].join(''),
  );
  assert.notEqual(gate, -1, 'the arming gate is not in this file');
  // Every call that hands the capture a path to write must sit behind the gate.
  // The needles are assembled so this check does not find its own calls.
  let calls = 0;
  for (const argument of ['RECORD', 'PROOF_COPY']) {
    const call = ['capture(', argument].join('');
    let at = source.indexOf(call);
    while (at !== -1) {
      calls += 1;
      assert.ok(
        at > gate,
        `${call} is called outside the M039_CAPTURE gate, so a default run would not be read-only`,
      );
      at = source.indexOf(call, at + call.length);
    }
  }
  assert.ok(calls >= 2, 'the gate must actually call the capture');
  // Assembled so this check does not count its own needle as a write.
  const write = ['writeFile', 'Sync', '('].join('');
  assert.equal(
    source.split(write).length - 1,
    2,
    'the capture writes its record, and the armed proof copies one',
  );
});

test('the profiler enumeration is the installed chunk list, read by this file', () => {
  const record = JSON.parse(readText(RECORD_PATH, 'no recording'));
  for (const source of record.profiler.sources) {
    const installed = EVIDENCE.packages.find(
      (entry) => entry.manifest === source.manifest,
    );
    assert.ok(
      installed,
      `${source.manifest} is not an install this file reads`,
    );
    assert.deepEqual(
      source.values,
      installed.events,
      `${source.manifest} declares a different ProfilerEvent list than the recording`,
    );
    assert.equal(source.version, installed.version, `${source.manifest} moved`);
  }
  const [panel, fixture] = EVIDENCE.packages;
  assert.deepEqual(
    fixture?.events,
    panel?.events,
    'the two installs no longer declare the same list',
  );
  assert.deepEqual(
    panel?.events.filter((entry) => /effect/i.test(entry.name)),
    [],
    'a profiler event now names an effect, so the phase would be observable',
  );
  assert.equal(record.profiler.effectEvent.absent, true);
  assert.ok(
    panel?.declaredKinds.includes(record.profiler.effectIsCarriedAs.symbol),
    'the effect-shaped name is no longer a declared node kind',
  );
});

test('the effect, its edges and its reads come from the probe recording', () => {
  const record = JSON.parse(readText(RECORD_PATH, 'no recording'));
  const recorded = record.effect.fromRecording;
  const probe = EVIDENCE.probe;
  assert.equal(recorded.kind, 'effect');
  assert.equal(record.effect.recording.nodeCount, probe.nodes.length);
  assert.equal(record.effect.recording.edgeCount, probe.edges.length);
  assert.deepEqual(
    recorded.signalsTheEdgesName,
    record.effect.freshRead.signalsTheEdgesName,
    'the probe recording and the page read name different signals for the effect',
  );
  assert.equal(record.effect.agreement.signalAgrees, true);
  assert.equal(record.effect.writeAsAnEdge.edgeCarriesAWrite, false);
  assert.deepEqual(
    record.effect.writeAsAnEdge.edgeShape.members.map((member) => member.name),
    ['consumer', 'producer'],
    'DebugSignalGraphEdge is a producer/consumer pair and nothing else',
  );
});

test('the phase is declared and not observed, from the declarations and the sources', () => {
  const record = JSON.parse(readText(RECORD_PATH, 'no recording'));
  assert.equal(record.phase.verdict, 'declared-not-observed');
  assert.equal(record.phase.afterRenderEffectPhaseNodes, 0);
  assert.equal(record.phase.portal.afterRenderEffectPhaseNodes, 0);
  assert.equal(record.phase.nodesWithPhaseField, 0);
  assert.deepEqual(record.phase.pagesUsingAfterRenderEffect, []);
  assert.deepEqual(EVIDENCE.fixture.filesCalling, []);
  assert.equal(EVIDENCE.fixture.occurrences, 0);
  assert.equal(record.phase.declared.declared, true);
  assert.equal(record.phase.nodeFieldsObserved.includes('phase'), false);
});

test('the change-detection substitute is the digest entry, never a capture', () => {
  const record = JSON.parse(readText(RECORD_PATH, 'no recording'));
  const substitute = record.changeDetection.substitute;
  assert.equal(substitute.notACapture, true);
  assert.equal(record.changeDetection.result, 'negative');
  assert.deepEqual(record.changeDetection.messages, []);
  assert.equal(
    EVIDENCE.digest.entries.filter((entry) => entry.code === substitute.code)
      .length,
    1,
    'the digest holds more than one entry for the code the substitute names',
  );
  assert.equal(substitute.digestEntries, EVIDENCE.digest.entries.length);
  assert.equal(substitute.digestVersion, EVIDENCE.digest.version);
  for (const attempt of record.changeDetection.attempts) {
    assert.equal(attempt.result, 'negative', attempt.target);
  }
});

test('the join and the pane report only what the recording carries', async () => {
  const record = JSON.parse(readText(RECORD_PATH, 'no recording'));
  const context = createContext({});
  runInContext(
    readText(JOIN_PATH, 'the join is part of this repository'),
    context,
  );
  const join = /** @type {any} */ (context).angularAiRenderPhase;
  assert.equal(typeof join.renderPhase, 'function');

  const fresh = record.effect.freshRead;
  const substitute = record.changeDetection.substitute;
  const entry = EVIDENCE.digest.entries.find(
    (candidate) => candidate.code === substitute.code,
  );
  assert.ok(entry, 'the digest holds no entry for the substitute');
  const provenance =
    String(substitute.kind).split('-').join(' ') +
    (substitute.notACapture === true ? ', not a capture' : '');

  const answer = join.renderPhase({
    graph: {
      nodes: fresh.nodes.map((/** @type {any} */ node) => ({
        index: node.index,
        kind: node.kind,
        label: node.label,
      })),
      edges: fresh.allEdges,
    },
    effect: {
      edge: {
        consumer: fresh.nodeIndex,
        producer: fresh.edges[0]?.producer,
      },
    },
    error: { code: substitute.code, message: entry.body, provenance },
  });

  const effectFinding = answer.findings[0];
  assert.equal(effectFinding.state, join.EFFECT);
  assert.equal(
    effectFinding.namedBy,
    fresh.label === '' ? join.NAMED_BY_RECORDED_EDGE : join.NAMED_BY_LABEL,
    'the join names the effect by a rule the recording does not state',
  );
  assert.deepEqual(clone(effectFinding.reads), fresh.signalsTheEdgesName);
  assert.equal(answer.phase.state, join.CANNOT_TELL);
  assert.equal(answer.phase.absence, join.NO_EFFECT_EVENT);

  const pane = (await import(pathToFileURL(PANE_PATH).href)).default;
  const rendered = pane(answer);
  const effectBlock = rendered.blocks.find(
    (/** @type {any} */ block) => block.state === join.EFFECT,
  );
  const codeBlock = rendered.blocks.find(
    (/** @type {any} */ block) => block.state === join.CHANGE_DETECTION,
  );
  assert.ok(effectBlock, 'the pane rendered no block for the effect finding');
  assert.ok(
    codeBlock,
    'the pane rendered no block for the change-detection finding',
  );
  for (const read of effectFinding.reads) {
    assert.ok(
      effectBlock.text.includes(read),
      `the effect block does not render the signal ${JSON.stringify(read)} the recording names`,
    );
  }
  assert.equal(
    effectBlock.text.includes(answer.phase.absence),
    false,
    'the effect block renders the phase absence, which SC2 forbids',
  );
  assert.ok(
    codeBlock.text.includes(String(substitute.code)),
    'the change-detection block does not carry the code the recording names',
  );
  assert.ok(rendered.text.includes(answer.phase.absence));
});

test('no derived value is pinned as a literal in this suite', () => {
  const source = readText(SELF_PATH, 'this file');
  // Assembled so this check does not find its own needles.
  const needles = [
    ['Chro', 'me/'].join(''),
    ['Resou', 'rce.loadEffect'].join(''),
    ['NG0', '100'].join(''),
    ['22.', '2.'].join(''),
    ['22.', '1.'].join(''),
  ];
  for (const needle of needles) {
    assert.equal(
      source.includes(needle),
      false,
      `this suite carries ${JSON.stringify(needle)}, a derived value copied into the checks`,
    );
  }
  assert.equal(
    /\b[0-9a-f]{32,}\b/.test(source),
    false,
    'this suite pins a hash, and a hash is the value that goes stale first',
  );
  assert.equal(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(source),
    false,
    'this suite pins a timestamp',
  );
});

// ------------------------------------------------------------- the mutants ----

/**
 * The untouched record passes the pin first, then one anchored mutation of it
 * must redden the pin with a failure that names the defect. A mutant that
 * survives, or that cannot fail, fails this suite.
 *
 * @param {(record: any) => unknown} pin
 * @param {Array<{ what: string, mutate: (record: any) => void, message: RegExp }>} mutants
 * @returns {void}
 */
function proveNonVacuous(pin, mutants) {
  const record = JSON.parse(readText(RECORD_PATH, 'no recording'));
  assert.doesNotThrow(
    () => pin(record),
    'the untouched record must pass first',
  );
  for (const mutant of mutants) {
    const copy = clone(record);
    mutant.mutate(copy);
    assert.throws(
      () => pin(copy),
      mutant.message,
      `${mutant.what} must redden the pin`,
    );
  }
}

const MUTANTS = [
  {
    what: 'M1 a profiler value the installed chunk declares dropped from the record',
    mutate: (record) => {
      record.profiler.sources[1].values.pop();
    },
    message: /profiler\.sources/,
  },
  {
    what: 'M2 an installed package version moved behind the record',
    mutate: (record) => {
      record.profiler.sources[0].version = '0.0.0';
    },
    message: /profiler\.sources/,
  },
  {
    what: 'M3 a profiler event claimed to name an effect',
    mutate: (record) => {
      record.profiler.effectEvent.absent = false;
    },
    message: /profiler\.effectEvent/,
  },
  {
    what: 'M4 the effect given a label the graph does not carry',
    mutate: (record) => {
      record.effect.fromRecording.label = 'counterEffect';
    },
    message: /fromRecording\.label/,
  },
  {
    what: 'M5 the signal the effect reads renamed',
    mutate: (record) => {
      record.effect.fromRecording.signalsTheEdgesName = ['elsewhere'];
    },
    message: /fromRecording\.signalsTheEdgesName|agreement\.signalAgrees/,
  },
  {
    what: 'M6 a probe edge removed from the record',
    mutate: (record) => {
      record.effect.fromRecording.edges.pop();
    },
    message: /fromRecording\.edges/,
  },
  {
    what: 'M7 an epoch claimed for a probe recording that holds none',
    mutate: (record) => {
      record.effect.fromRecording.epoch = 3;
    },
    message: /fromRecording\.epoch/,
  },
  {
    what: 'M8 the phase verdict moved to observed',
    mutate: (record) => {
      record.phase.verdict = 'observed';
    },
    message: /phase\.verdict/,
  },
  {
    what: 'M9 a page claimed to carry a phase field',
    mutate: (record) => {
      record.phase.pagesRead[0].nodeFields.push('phase');
    },
    message: /nodeFieldsObserved|phase\.pagesRead/,
  },
  {
    what: 'M10 a fixture file claimed to call afterRenderEffect',
    mutate: (record) => {
      record.phase.pagesUsingAfterRenderEffect = [
        'spikes/ng222-app/src/app/x.ts',
      ];
    },
    message: /pagesUsingAfterRenderEffect/,
  },
  {
    what: 'M11 a source scan count invented',
    mutate: (record) => {
      record.phase.sourceScans[0].afterRenderEffectOccurrences = 1;
    },
    message: /sourceScans/,
  },
  {
    what: 'M12 the digest entry relabelled as a capture',
    mutate: (record) => {
      record.changeDetection.substitute.notACapture = false;
    },
    message: /notACapture|presented as a capture/,
  },
  {
    what: 'M13 a digest count no entry supports',
    mutate: (record) => {
      record.changeDetection.substitute.entriesWhoseCodeIsNg0100 = 3;
    },
    message: /substitute\.entriesWhoseCodeIsNg0100/,
  },
  {
    what: 'M14 a failed attempt recorded as a capture',
    mutate: (record) => {
      record.changeDetection.attempts[0].result = 'captured';
      record.changeDetection.result = 'captured';
    },
    message: /capture was fabricated/,
  },
  {
    what: 'M15 a write smuggled into the record',
    mutate: (record) => {
      record.effect.writes = ['counter.set'];
    },
    message: /`writes` key|no write/,
  },
  {
    what: 'M16 an edge said to carry a write',
    mutate: (record) => {
      record.effect.writeAsAnEdge.edgeCarriesAWrite = true;
    },
    message: /writeFieldCount|edgeCarriesAWrite/,
  },
  {
    what: 'M17 a capture command that names no gate',
    mutate: (record) => {
      record.capture.command = CHECK_COMMAND;
    },
    message: /capture\.command/,
  },
  {
    what: 'M18 a write time that is not a timestamp',
    mutate: (record) => {
      record.capture.at = 'yesterday';
    },
    message: /capture\.at/,
  },
  {
    what: 'M19 the capture block dropped',
    mutate: (record) => {
      delete record.capture;
    },
    message: /no capture block|never been re-derived/,
  },
  {
    what: 'M20 the record attributed to another task',
    mutate: (record) => {
      record.task = 'T004';
    },
    message: /recording task/,
  },
];

test('every derived value is pinned non-vacuously: the record passes, a mutant reddens it', () => {
  proveNonVacuous(validate, MUTANTS);
});

/**
 * The derivation itself is proven live: the same record, derived against a
 * different evidence set, moves at the field that evidence settles.
 */
test('the derivation moves when its evidence moves', () => {
  const record = JSON.parse(readText(RECORD_PATH, 'no recording'));
  const cases = [
    {
      what: 'a profiler value the installed chunk does not declare',
      mutate: (/** @type {any} */ evidence) => {
        evidence.packages[0].events.pop();
      },
      path: 'profiler.sources',
    },
    {
      what: 'the fixture install moving',
      mutate: (/** @type {any} */ evidence) => {
        evidence.packages[1].version = '0.0.0';
      },
      path: 'profiler.sources',
    },
    {
      what: 'a probe edge the page did not record',
      mutate: (/** @type {any} */ evidence) => {
        evidence.probe.edges.pop();
      },
      path: 'effect.recording.edgeCount',
    },
    {
      what: 'a digest entry removed',
      mutate: (/** @type {any} */ evidence) => {
        evidence.digest.entries.pop();
      },
      path: 'changeDetection.substitute.digestEntries',
    },
    {
      what: 'a fixture source calling afterRenderEffect',
      mutate: (/** @type {any} */ evidence) => {
        evidence.fixture.filesCalling = ['spikes/ng222-app/src/app/x.ts'];
      },
      path: 'phase.pagesUsingAfterRenderEffect',
    },
  ];
  for (const item of cases) {
    const evidence = clone(EVIDENCE);
    item.mutate(evidence);
    const derived = derive(record, evidence);
    const moved = divergence(record, merge(record, derived)).join(' ');
    assert.ok(
      moved.includes(item.path),
      `${item.what} must move ${item.path}; the derivation said ${moved || 'nothing'}`,
    );
  }
});

// A default run must not touch the recording: the file hashes the same at the
// end of the run as at its start, which is what makes two default runs identical.
if (process.env.M039_CAPTURE !== '1') {
  test('this run wrote nothing: every file this suite names hashes the same before and after', () => {
    for (const file of WOULD_WRITE) {
      const before = SHA_AT_LOAD.get(file.path);
      const shown = displayPath(file.path);
      assert.notEqual(before, null, `${shown} is missing`);
      assert.equal(
        existsSync(file.path) ? sha256(readFileSync(file.path)) : null,
        before,
        `${shown} changed during a default run`,
      );
    }
  });
}
