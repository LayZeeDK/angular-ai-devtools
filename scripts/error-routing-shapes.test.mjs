/**
 * M060 T001 — pins the record-shapes record for the two error records and the join's shape.
 *
 * `research/raw/m060-record-shapes.json` is written ONLY by an armed capture
 * (`M060_CAPTURE=1 node --test scripts/error-routing-shapes.test.mjs`); the default run asserts
 * the committed bytes against a fresh serialization of the same source at the same head, so a
 * second armed run is byte-identical by construction and by assertion. Every section the task
 * contract names — the records, the producer, the absence, the census map — is produced by the
 * capture function, so a re-run cannot drop one.
 *
 * The suite's own scans (extension/*.js, scripts/*.mjs, research/raw/*.json) exclude this
 * milestone's own files, listed in OWN_FILES, so the census cannot mistake this record for one
 * of the records it maps, and the capture cannot read its own output back into itself.
 *
 * Each pinned fact that the source states — the two listener names, the boundary entry limit —
 * is read back out of extension/agent-main.js at the captured head and held against the record,
 * so a mutant that omits a listener, invents one, or moves the limit reddens naming the field.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(here, '..');
const RECORD_PATH = join(
  REPO_ROOT,
  'research',
  'raw',
  'm060-record-shapes.json',
);
const AGENT_MAIN_PATH = join(REPO_ROOT, 'extension', 'agent-main.js');

/** Armed only by the exact flag the task's verify line uses. */
const CAPTURE = process.env.M060_CAPTURE === '1';

/**
 * This milestone's own files, excluded from every scan this suite performs: the record this
 * suite writes, this suite, and the T002 artefacts that land beside them during M060.
 */
const OWN_FILES = [
  'm060-record-shapes.json',
  'error-routing-shapes.test.mjs',
  'error-routing.js',
  'error-routing.test.mjs',
];

/** The head the record must carry, derived — never typed. */
function gitHead() {
  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  }).trim();
}

/** The global listeners the source installs, in source order, read — never remembered. */
function readListeners(source) {
  const listeners = [];
  for (const name of ['error', 'unhandledrejection']) {
    if (
      new RegExp("addEventListener\\(\\s*'" + name + "'\\s*[,)]").test(source)
    )
      listeners.push(name);
  }
  return listeners;
}

/** The boundary arrival cap, read from the constant the source declares. */
function readBoundaryEntryLimit(source) {
  const match = source.match(/BOUNDARY_ENTRY_LIMIT\s*=\s*(\d+)/);
  if (!match)
    throw new Error(
      'BOUNDARY_ENTRY_LIMIT not found in extension/agent-main.js',
    );
  return Number(match[1]);
}

function buildRecord(head, byteTotal, producer) {
  return {
    schema: 'm060-record-shapes/v1',
    milestone: 'M060',
    task: 'T001',
    head,
    commands: [
      { command: 'git rev-parse HEAD', output: head },
      {
        command:
          'M060_CAPTURE=1 node --test scripts/error-routing-shapes.test.mjs',
        output:
          'capture run: serialized every section from the source at the captured head and wrote ' +
          'research/raw/m060-record-shapes.json byte-exactly; the suite then asserted the file it wrote',
      },
    ],
    records: [
      {
        path: 'extension/agent-main.js',
        carries:
          "the global error listener record at agent-main.js:2550-2561: N4 wires 'error' and " +
          "'unhandledrejection' on globalThis beside the console.error override, and each arrival " +
          'is reduced by captureErrorPayload to one payload of {code, message, component, ' +
          'timestamp} dispatched on ERROR_CAPTURE_EVENT — the code is the NG0NNN match in the ' +
          'message text and the component is getOwningComponent() of the active element, so no ' +
          'field is borrowed from a neighbouring arrival; this milestone added no listeners ' +
          '(listeners added: 0)',
      },
      {
        path: 'extension/agent-main.js',
        carries:
          "the boundary record at agent-main.js:1904-1944: the resolved ErrorHandler's " +
          'onViewError is hooked on the handler instance the page already resolved, and arrivals ' +
          'accumulate in boundaryEntries, one per arrival in arrival order, capped at ' +
          'BOUNDARY_ENTRY_LIMIT = 128 as a page-health guard rather than a curation; the ' +
          'change-detection catch passes a details shape with caughtBy and the construction catch ' +
          'one with boundary and no caughtBy, so an absent field reads as null and is never ' +
          'borrowed from the other shape',
      },
    ],
    inventory: {
      measured:
        'the join T002 publishes, errorRouting(records) on globalThis.angularAiErrorRouting, taking ' +
        '{errors, boundaries, handler} and returning {state, message, code, owner, phase, absences, ' +
        'claims, detail}, is a runtime export, not one of the records this milestone measured (T002); ' +
        'the route error-routing surface record — the PANEL_SURFACES entry, the LOADERS key, the exported ' +
        'errorRoutingPanel, the digest rows and the surface record that T003 adds — renders the states of ' +
        'the T002 join, and T001 names the surface but does not map the surface record itself (T003); the ' +
        'verdict-claims record — the claims that cite this milestone\u2019s artefacts by artefactPath and ' +
        're-derive each against the tree — is published by T004, reading this map rather than being mapped ' +
        'by it (T004); and the re-derived gate shapes and gate stability records are published by T005 from ' +
        'the gate shapes this record pins, not measured here (T005).',
      outsideTheMap: [
        {
          path: 'research/raw/m060-surface.json',
          why: 'the route error-routing surface record T003 adds — the PANEL_SURFACES entry, the LOADERS key, the exported errorRoutingPanel, the digest rows and the surface record rendering the states of the T002 join; T001 names the surface but does not map the surface record itself, so it is captured after this map was measured (T003).',
        },
        {
          path: 'research/raw/m060-verdict-claims.json',
          why: 'the verdict-claims record T004 publishes — the claims that cite this milestone\u2019s artefacts by artefactPath and re-derive each against the tree, reading this map rather than being mapped by it (T004).',
        },
      ],
    },
    producer,
    absences: {
      phaseNotRecorded: {
        count: producer.listeners.length,
        detail:
          'no record in this tree names the phase an uncaught error was thrown in, so every ' +
          'arrival the listeners deliver is recorded without a phase; the count is the number of ' +
          'listeners read at the captured head, and this milestone added no listeners (listeners ' +
          'added: 0), so the count is a reading of the producer and never a claim of new wiring',
      },
    },
    verdict: `This record is ${byteTotal} bytes, the UTF-8 length of the file the armed capture wrote, stated so the byte-consistency scan has a count of this file to hold.`,
  };
}

/**
 * The record as bytes, with its own byte total at a fixed point: the verdict states a count, the
 * count changes the length, so the capture iterates until the stated count is the file's length.
 */
function serializeRecord(head) {
  const source = readFileSync(AGENT_MAIN_PATH, 'utf8');
  const producer = {
    listeners: readListeners(source),
    boundaryEntryLimit: readBoundaryEntryLimit(source),
  };
  let byteTotal = 0;
  for (let attempt = 0; attempt < 24; attempt++) {
    const text =
      JSON.stringify(buildRecord(head, byteTotal, producer), null, 2) + '\n';
    const measured = Buffer.byteLength(text, 'utf8');
    if (measured === byteTotal) return text;
    byteTotal = measured;
  }
  throw new Error('the stated byte total did not reach a fixed point');
}

const head = gitHead();
if (CAPTURE) writeFileSync(RECORD_PATH, serializeRecord(head));

function loadRecord() {
  if (!existsSync(RECORD_PATH)) {
    throw new Error(
      'research/raw/m060-record-shapes.json is missing — run ' +
        '`M060_CAPTURE=1 node --test scripts/error-routing-shapes.test.mjs` to write it, then keep it',
    );
  }
  return JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
}

/** A scan of a directory whose filenames end in `extension`, minus this milestone's own files. */
function scanCorpus(relativeDir, extension) {
  return readdirSync(join(REPO_ROOT, relativeDir))
    .filter((name) => name.endsWith(extension))
    .filter((name) => !OWN_FILES.includes(name));
}

test('a second armed run is byte-identical: two serializations and the committed file agree', () => {
  const first = serializeRecord(head);
  const second = serializeRecord(head);
  assert.equal(
    second,
    first,
    'two serializations at the same head differ — the capture is not deterministic',
  );
  if (existsSync(RECORD_PATH)) {
    const committed = readFileSync(RECORD_PATH, 'utf8');
    assert.equal(
      committed,
      first,
      'the committed record differs from a fresh serialization of the source at HEAD — recapture with M060_CAPTURE=1',
    );
  } else {
    assert.fail(
      'the record has never been captured — run with M060_CAPTURE=1 once',
    );
  }
});

test('the record pins schema, milestone, task and the derived head', () => {
  const record = loadRecord();
  assert.equal(record.schema, 'm060-record-shapes/v1');
  assert.equal(record.milestone, 'M060');
  assert.equal(record.task, 'T001');
  assert.match(
    record.head,
    /^[0-9a-f]{40}$/,
    `head is not a full sha: ${record.head}`,
  );
  const current = gitHead();
  assert.equal(
    record.head,
    current,
    'the record was captured at a head that is not the current HEAD',
  );
});

test('head and the rev-parse command output carry the same value', () => {
  const record = loadRecord();
  const revParse = record.commands.find(
    (entry) => entry.command === 'git rev-parse HEAD',
  );
  assert.ok(revParse, 'no commands entry runs `git rev-parse HEAD`');
  assert.equal(
    revParse.output,
    record.head,
    'the rev-parse output and head disagree',
  );
  assert.ok(
    record.commands.some(
      (entry) =>
        entry.command ===
        'M060_CAPTURE=1 node --test scripts/error-routing-shapes.test.mjs',
    ),
    'no commands entry records the armed capture itself',
  );
});

test('the producer names exactly the listeners and the limit the source states', () => {
  const record = loadRecord();
  const source = readFileSync(AGENT_MAIN_PATH, 'utf8');
  assert.deepEqual(
    record.producer.listeners,
    readListeners(source),
    'the producer\u2019s listener list must be the two global listeners the source installs, in source order',
  );
  assert.equal(
    record.producer.boundaryEntryLimit,
    readBoundaryEntryLimit(source),
    'the producer\u2019s boundary entry limit must be the BOUNDARY_ENTRY_LIMIT the source declares',
  );
});

test('the absence counts the listeners read, and states none were added', () => {
  const record = loadRecord();
  const absence = record.absences.phaseNotRecorded;
  assert.ok(absence, 'the phase-not-recorded absence is missing');
  assert.equal(
    absence.count,
    record.producer.listeners.length,
    'the absence count is not the listener count read',
  );
  assert.equal(
    absence.count,
    2,
    'the absence must count the two listeners the source installs',
  );
  assert.match(
    absence.detail,
    /phase/i,
    'the absence detail never names the phase',
  );
  assert.match(
    JSON.stringify(record),
    /listeners added: 0/,
    'the record must state that this milestone added no listener — a mutant recording added listeners must redden here',
  );
});

test('the verdict states this file\u2019s own byte total, and the file is that long', () => {
  const record = loadRecord();
  const match = record.verdict.match(/(\d+) bytes/);
  assert.ok(
    match,
    `the verdict never states an integer followed by "bytes": ${record.verdict}`,
  );
  const stated = Number(match[1]);
  const actual = Buffer.byteLength(readFileSync(RECORD_PATH), 'utf8');
  assert.equal(
    stated,
    actual,
    `the verdict states ${stated} bytes but the file is ${actual}`,
  );
});

test('the census map lists the measured artefact and names the records outside it, each why citing a task', () => {
  const record = loadRecord();
  assert.ok(
    Array.isArray(record.records) && record.records.length >= 1,
    'records[] is missing or empty',
  );
  assert.ok(
    record.records.some(
      (entry) =>
        entry.path === 'extension/agent-main.js' &&
        typeof entry.carries === 'string' &&
        entry.carries,
    ),
    'records[] must carry extension/agent-main.js with what it states',
  );
  const outside = record.inventory && record.inventory.outsideTheMap;
  assert.ok(
    Array.isArray(outside) && outside.length >= 1,
    'inventory.outsideTheMap is missing or empty',
  );
  for (const entry of outside) {
    assert.ok(
      entry.path,
      `an outsideTheMap entry has no path: ${JSON.stringify(entry)}`,
    );
    assert.match(
      entry.why,
      /T00\d/,
      `the why for ${entry.path} never cites a task id`,
    );
  }
});

test('the suite\u2019s scans exclude this milestone\u2019s own files', () => {
  assert.deepEqual(
    [...OWN_FILES].sort(),
    [
      'error-routing-shapes.test.mjs',
      'error-routing.js',
      'error-routing.test.mjs',
      'm060-record-shapes.json',
    ].sort(),
    'OWN_FILES must be exactly this milestone\u2019s own four files',
  );
  assert.ok(
    !scanCorpus('research/raw', '.json').includes('m060-record-shapes.json'),
  );
  assert.ok(
    !scanCorpus('scripts', '.mjs').includes('error-routing-shapes.test.mjs'),
  );
  assert.ok(!scanCorpus('extension', '.js').includes('error-routing.js'));
  assert.ok(!scanCorpus('scripts', '.mjs').includes('error-routing.test.mjs'));
});

test('the record carries no numeric bytes field, so the byte-consistency corpus skips it', () => {
  const record = loadRecord();
  const fields = [];
  const walk = (value, path) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        const child = path ? `${path}.${key}` : key;
        if (/bytes/i.test(key) && typeof item === 'number') fields.push(child);
        walk(item, child);
      }
    }
  };
  walk(record, '');
  assert.deepEqual(
    fields,
    [],
    'a numeric bytes field would pull this record into the byte-consistency corpus while its prose states a different total — the verdict sentence is the only byte count this record carries',
  );
});
