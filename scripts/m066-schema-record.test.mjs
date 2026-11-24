// @ts-check
//
// M066 T001 — the schema record's suite. Read-only by default:
//   node --test scripts/m066-schema-record.test.mjs
//
// The record is written by one command and read by this suite:
//   M066_CAPTURE=1 node scripts/m066-schema-record.mjs
//
// What this suite pins, and why each pin exists:
//
//   shape     the committed recording validates against its own fields, and it
//             re-derives from the `input` section it carries: `buildRecord` run
//             over that input must reproduce the record byte for byte, so no
//             field was edited after the capture.
//   fields    every field row is compared with the element reading the page gave
//             — never with another derived value — and a row whose element
//             reading was unavailable carries null and a reason that names the
//             field instead of a guess.
//   schema    an absent schema states what was measured on the injector and
//             carries no node and no holder; a resolved schema must name its
//             holder and one input per node. No input, no node.
//   mutants   in-memory copies of the record, each changed by one value: a
//             flipped `disabled`, an absent schema that names a holder, a node
//             without an input, and an input without a node. Each must redden
//             the pin, and the message must name the field or node that moved.
//   AC3       a default run reads the recording and writes nothing — proved by
//             hashing the record and the whole of `research/raw` before and
//             after — and an unarmed run with no recording refuses and creates
//             no file.
//
// The suite never asserts a cause for a field's state and never asserts a schema
// node for an absence: a value the capture did not read is null with a reason.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import {
  buildRecord,
  pinFields,
  pinSchema,
  readRecord,
  summary,
  validateRecord,
  CAPTURE_COMMAND,
  CHECK_COMMAND,
  HOLDER_EXPRESSION,
  PORTAL_ROUTE,
  RECORD_PATH,
  ROOT,
  SCHEMA,
} from './m066-schema-record.mjs';

const MODULE_PATH = join(ROOT, 'scripts', 'm066-schema-record.mjs');
const RAW_DIR = join(ROOT, 'research', 'raw');
const SCRIPT_PATH = fileURLToPath(import.meta.url);

/** Read the record per test, so a missing file is a named failure. */
function loadRecord() {
  return readRecord(RECORD_PATH);
}

/** A deep copy, so a mutant never touches the record a test loaded. */
function clone(record) {
  return JSON.parse(JSON.stringify(record));
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

/** Every file under `research/raw`, with its bytes hashed. */
function hashRawDir() {
  /** @type {Record<string, string>} */
  const hashes = {};
  for (const name of readdirSync(RAW_DIR, { withFileTypes: true })) {
    if (!name.isFile()) continue;
    const path = join(RAW_DIR, name.name);
    hashes[name.name] = sha256(readFileSync(path, 'utf8'));
  }
  return hashes;
}

/** The environment of a default run: no arm, whatever the caller had. */
function withoutArm() {
  const env = { ...process.env };
  delete env['M066_CAPTURE'];
  return env;
}

// ------------------------------------------------------------------ shape ---

test('the recording validates against its own fields and its own input', () => {
  const record = loadRecord();
  assert.equal(record.recordSchema, SCHEMA);
  assert.doesNotThrow(() => validateRecord(record));
});

test('the record re-derives from the input it carries, so no field was edited after the capture', () => {
  const record = loadRecord();
  assert.ok(record.input, 'the record carries no input section');
  assert.deepEqual(
    buildRecord(record.input),
    record,
    'the record is not what buildRecord makes of its own input',
  );
});

// ----------------------------------------------------------------- fields ---

test('AC1: every field row carries the element reading the page gave, or null with a reason that names the field', () => {
  const record = loadRecord();
  assert.doesNotThrow(() => pinFields(record, record.input));
  const read = record.fields.filter(
    (/** @type {any} */ field) => field.stateRead,
  );
  const unread = record.fields.filter(
    (/** @type {any} */ field) => !field.stateRead,
  );
  assert.ok(
    read.length >= 1,
    'defect: no field carries a boolean disabled reading from its element, so the element reading is not asserted',
  );
  assert.ok(
    unread.length >= 1,
    'defect: every field carries an element reading, so the absent reading is not asserted',
  );
  for (const field of unread) {
    assert.equal(
      field.disabled,
      null,
      `defect: fields[${field.field}].disabled states ${JSON.stringify(field.disabled)} without an element reading`,
    );
    assert.ok(
      field.reason.includes(field.field),
      `defect: fields[${field.field}].reason does not name the field: ${field.reason}`,
    );
  }
  const noElement = record.fields.filter(
    (/** @type {any} */ field) => field.element === null,
  );
  assert.ok(
    noElement.length >= 1,
    'defect: every field names an element, so the field the page does not render is not recorded',
  );
  for (const field of noElement) {
    assert.equal(
      field.id,
      null,
      `defect: fields[${field.field}].id states ${JSON.stringify(field.id)} for a field no element carries`,
    );
    assert.equal(field.hidden, null);
  }
  console.log(
    `m066-schema-record: fields ${record.fields.map((/** @type {any} */ f) => `${f.field}=${f.element ?? 'no element'}/disabled:${f.disabled === null ? 'unread' : f.disabled}/hidden:${f.hidden === null ? 'unread' : f.hidden}`).join('; ')}`,
  );
});

test('AC1: the page it drove is the form route the record names, and the fields are the ones the form tree names', () => {
  const record = loadRecord();
  assert.equal(record.page.route, PORTAL_ROUTE);
  assert.equal(record.page.formCount, 1);
  assert.equal(record.page.formRootCount, 1);
  assert.equal(
    record.page.url,
    `${record.target.url.replace(/\/$/, '')}${PORTAL_ROUTE}`,
  );
  const names = record.fields.map((/** @type {any} */ field) => field.field);
  assert.deepEqual(
    [...names].sort(),
    [...record.page.fieldTreeNames].sort(),
    'defect: the field rows are not the fields the page’s form tree names',
  );
  assert.ok(
    record.page.heading.length > 0 && record.page.formText.length > 0,
    'defect: the record does not state what the page rendered',
  );
});

// ----------------------------------------------------------------- schema ---

test('AC2: the schema section states the absence with the injector lookup that came back empty, and carries no node', () => {
  const record = loadRecord();
  assert.doesNotThrow(() => pinSchema(record));
  assert.equal(record.schema.absent, true);
  assert.ok(
    record.schema.reason.includes(HOLDER_EXPRESSION),
    `defect: the absent schema’s reason does not name ${HOLDER_EXPRESSION}`,
  );
  assert.ok(
    /provider records/.test(record.schema.reason),
    'defect: the absent schema’s reason does not state how many provider records were read',
  );
  assert.ok(
    !('holder' in record.schema) && !('nodes' in record.schema),
    'defect: the absent schema carries a holder or a node',
  );
  assert.deepEqual(
    record.inputs,
    [],
    'defect: an absent schema carries an input, so an input is recorded without a node',
  );
  assert.equal(record.input.schemaAttempts.sweeps.length >= 1, true);
  for (const sweep of record.input.schemaAttempts.sweeps) {
    assert.deepEqual(
      sweep.schemaLikeTokens,
      [],
      `defect: ${sweep.injector} names a schema token, so the absence is not what was measured`,
    );
  }
});

// ---------------------------------------------------------------- mutants ---

test('MUTANT: a flipped disabled reading reddens the fields pin, naming the field and the element reading', () => {
  const record = loadRecord();
  const target = record.fields.find(
    (/** @type {any} */ field) => field.stateRead,
  );
  const mutant = clone(record);
  const row = mutant.fields.find(
    (/** @type {any} */ field) => field.field === target.field,
  );
  row.disabled = !target.disabled;
  row.stateRead = true;
  assert.throws(
    () => validateRecord(mutant),
    new RegExp(
      `defect: fields\\[${target.field}\\]\\.disabled is ${!target.disabled} but the element read ${target.disabled}`,
    ),
    'defect: a flipped disabled reading did not redden the fields pin',
  );
  assert.throws(
    () => pinFields(mutant, record.input),
    new RegExp(`defect: fields\\[${target.field}\\]\\.disabled`),
    'defect: the fields pin does not name the field it read differently',
  );
});

test('MUTANT: a field state given a value with no element reading reddens the fields pin', () => {
  const record = loadRecord();
  const target = record.fields.find(
    (/** @type {any} */ field) => !field.stateRead,
  );
  const mutant = clone(record);
  const row = mutant.fields.find(
    (/** @type {any} */ field) => field.field === target.field,
  );
  row.disabled = false;
  assert.throws(
    () => pinFields(mutant, record.input),
    new RegExp(
      `defect: fields\\[${target.field}\\]\\.disabled is false but the element read null`,
    ),
    'defect: a value recorded without an element reading did not redden the fields pin',
  );
});

test('MUTANT: an absent schema that names a holder reddens the schema pin', () => {
  const record = loadRecord();
  const mutant = clone(record);
  mutant.schema = { absent: false, holder: 'some.injector', nodes: [] };
  assert.throws(
    () => pinSchema(mutant),
    /defect: the resolved schema carries no node/,
    'defect: a schema that names a holder without a node passed the pin',
  );
});

test('MUTANT: a schema node without an input reddens the schema pin, naming the node', () => {
  const record = loadRecord();
  const mutant = clone(record);
  mutant.schema = {
    absent: false,
    holder: 'some.injector',
    nodes: [{ node: 'status', input: null }],
  };
  mutant.inputs = [];
  assert.throws(
    () => pinSchema(mutant),
    /defect: the schema node status carries no input/,
    'defect: a node without an input passed the pin',
  );
});

test('MUTANT: an input recorded while the schema is absent reddens the schema pin', () => {
  const record = loadRecord();
  const mutant = clone(record);
  mutant.inputs = [{ node: 'status', input: 'required' }];
  assert.throws(
    () => pinSchema(mutant),
    /defect: the schema is absent but 1 inputs are recorded; no input, no node/,
    'defect: an input without a node passed the pin',
  );
});

// -------------------------------------------------------------------- AC3 ---

test('AC3: a default run reads the recording, prints it and writes nothing', () => {
  const before = readFileSync(RECORD_PATH, 'utf8');
  const beforeRaw = hashRawDir();
  const run = spawnSync(process.execPath, ['scripts/m066-schema-record.mjs'], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...withoutArm(), M066_RECORD: RECORD_PATH },
  });
  assert.equal(
    run.status,
    0,
    `defect: the default run exited ${run.status}: ${run.stdout}${run.stderr}`,
  );
  assert.ok(
    run.stdout.includes(RECORD_PATH),
    'defect: the default run does not name the recording it read',
  );
  assert.ok(
    run.stdout.includes('schema absent from every injector read'),
    'defect: the default run does not state what the schema section resolved to',
  );
  assert.equal(
    sha256(readFileSync(RECORD_PATH, 'utf8')),
    sha256(before),
    'defect: the default run wrote the recording',
  );
  assert.deepEqual(
    hashRawDir(),
    beforeRaw,
    'defect: the default run wrote into research/raw',
  );
});

test('AC3: an unarmed run with no recording refuses and creates no file', () => {
  const dir = mkdtempSync(join(tmpdir(), 'm066-unarmed-'));
  const missing = join(dir, 'm066-schema-record.json');
  try {
    const run = spawnSync(
      process.execPath,
      ['scripts/m066-schema-record.mjs'],
      {
        cwd: ROOT,
        encoding: 'utf8',
        env: { ...withoutArm(), M066_RECORD: missing },
      },
    );
    assert.equal(
      run.status,
      2,
      `defect: an unarmed run with no recording exited ${run.status}`,
    );
    assert.match(
      run.stderr,
      /capture it with `M066_CAPTURE=1 node scripts\/m066-schema-record\.mjs`/,
      'defect: the refusal does not name the command that writes a recording',
    );
    assert.deepEqual(
      readdirSync(dir),
      [],
      'defect: the unarmed run created the recording it refused to read',
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('AC3: the record is written from one place, and only after M066_CAPTURE=1 armed the run', () => {
  const source = readFileSync(MODULE_PATH, 'utf8');
  const writes = [...source.matchAll(/writeFileSync\(\s*RECORD_PATH/g)];
  assert.equal(
    writes.length,
    1,
    `defect: the record is written from ${writes.length} places, not one`,
  );
  const armed = source.indexOf("process.env['M066_CAPTURE'] === '1'");
  assert.ok(armed !== -1, 'defect: the module never reads M066_CAPTURE');
  assert.ok(
    armed < (writes[0].index ?? -1),
    'defect: the write sits before the armed check',
  );
  const record = loadRecord();
  assert.equal(record.commands.capture, CAPTURE_COMMAND);
  assert.equal(record.commands.check, CHECK_COMMAND);
});

test('the suite this task verifies with is the command the recording names', () => {
  assert.equal(
    CHECK_COMMAND,
    'node --test scripts/m066-schema-record.test.mjs',
  );
  assert.ok(
    summary(loadRecord()).includes('schema absent from every injector read'),
    'defect: the summary does not state what the schema section resolved to',
  );
  assert.equal(
    resolve(SCRIPT_PATH),
    join(ROOT, 'scripts', 'm066-schema-record.test.mjs'),
    'defect: this suite is not the file the task declares',
  );
});
