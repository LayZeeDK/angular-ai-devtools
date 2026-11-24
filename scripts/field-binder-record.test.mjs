// M067 T004 — the field-binder record: for every form field the Insurance Portal's contract-create
// page reports, three facts and nothing inferred —
//
//   identity  the identity the field tree reports for the field, which is the identity
//             `extension/field-state.js` echoes for it: a key of the field set the read copies
//             verbatim, never a second identity derived here.
//   hosted    the element the field hosts, as a tag name plus the attribute that distinguishes it
//             by the field's own identity (its `id` or its `name`), or the statement that no
//             element carries the field.
//   expected  the control the field's record expects, or the statement that it was not read and
//             why.
//
// The record exists because nothing in this repository reads a form field's hosted control: this
// milestone writes the record its join reads, before the join exists. The capture may not drive a
// page in this task, so it derives the record from what the repository already carries — M066's
// committed page reading of the same route (`research/raw/m066-schema-record.json`), the
// field-state reading whose `fields` keys are the identity shape (`research/raw/m031-field-state.json`),
// the fixture route table and form that the fallback would have used (`spikes/ng222-app`), the panel
// route table the identity already renders on (`apps/angular-ai-devtools`), the identity producer
// itself and `package.json`. Every fact the tree does not hold is recorded as an absence that names
// the field and says why, never softened into prose and never filled from a label.
//
// Default run (read-only: it derives, compares and writes nothing):
//
//   node --test scripts/field-binder-record.test.mjs
//
// The one write, armed by its own flag, and the same rule T002 established for the claims census:
// the writer derives through the recorded document and refuses to write a candidate that is not a
// fixed point of the default pin, so a re-capture can never emit bytes its own reader refuses.
//
//   M067_CAPTURE=1 node --test scripts/field-binder-record.test.mjs
//
// `extension/field-state.js` publishes no ESM binding — it is an IIFE that assigns
// `globalThis.angularAiFieldState` — so this suite runs it in a bare `node:vm` context and asks the
// module itself which keys it echoes. The identity rule is therefore asserted against the producer
// and never reproduced here.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUITE_REL = 'scripts/field-binder-record.test.mjs';
const RECORD_REL = 'research/raw/m067-field-binder.json';
const RECORD_PATH = join(ROOT, ...RECORD_REL.split('/'));

/** The record's own shape, named as a literal and checked before anything is compared. */
const SCHEMA = 'm067-field-binder/v1';
const MILESTONE = 'M067';
const TASK = 'T004';
const QUESTION =
  "Which element does each field of the Insurance Portal's contract-create form host, what identity does the field tree report for it, and what control does its record expect?";

/** The page reading this record derives from, and the route that reading drove. */
const PAGE_READING_REL = 'research/raw/m066-schema-record.json';
const PAGE_ROUTE = '/contract/create';

/** The field-state reading whose `fields` keys are the identity shape, and the producer itself. */
const FIELD_STATE_READING_REL = 'research/raw/m031-field-state.json';
const FIELD_STATE_REL = 'extension/field-state.js';

/** The fixture the milestone names as a fallback, and the panel surface the identity already feeds. */
const FIXTURE_ROUTE_SOURCE_REL = 'spikes/ng222-app/src/app/app.routes.ts';
const FIXTURE_FORM_REL = 'spikes/ng222-app/src/app/field-form-page.ts';
const PANEL_ROUTE_SOURCE_REL = 'apps/angular-ai-devtools/src/app/app.routes.ts';
const PACKAGE_REL = 'package.json';

/** The commands this record is held to, recorded in it so a reader runs what produced it. */
const CAPTURE_ENV = 'M067_CAPTURE';
const CHECK_COMMAND = `node --test ${SUITE_REL}`;
const CAPTURE_COMMAND = `${CAPTURE_ENV}=1 ${CHECK_COMMAND}`;
const ARMED = String(process.env[CAPTURE_ENV] ?? '').trim() === '1';

/** A fixed-width instant, the only shape this record accepts for a time. */
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/** A key of a field reading that would name the control a field expects. None does at this head. */
const EXPECTATION_KEY = /expect/i;

/** Every fact an entry carries, so a key added to the shape is refused until the record is rederived. */
const ENTRY_KEYS = ['expected', 'field', 'hosted', 'identity'].sort();

/**
 * Every file this record is derived from, and what each one contributes. The list is read into the
 * record, and each path is asserted to exist at capture, so a moved source refuses by name.
 */
const SOURCES = [
  {
    path: PAGE_READING_REL,
    contributes:
      'the portal page reading: the route it drove, the form it found, the field-tree identities and the element each field hosts, as M066 captured them',
  },
  {
    path: FIELD_STATE_READING_REL,
    contributes:
      'the field-state reading whose `fields` keys are the identity shape this record carries, recorded from the fixture’s /field-form page',
  },
  {
    path: FIELD_STATE_REL,
    contributes:
      'the identity producer: this suite runs it in a bare node:vm context and asks which keys it echoes',
  },
  {
    path: FIXTURE_ROUTE_SOURCE_REL,
    contributes: 'the fixture route table that names the fallback route',
  },
  {
    path: FIXTURE_FORM_REL,
    contributes:
      'the fixture form that binds the two fields the fallback would have read',
  },
  {
    path: PANEL_ROUTE_SOURCE_REL,
    contributes:
      'the panel route table that declares the fields surface this identity already renders on',
  },
  {
    path: PACKAGE_REL,
    contributes:
      'the declared packages, none of which is a control library, which is why no expected control is read',
  },
];

// ------------------------------------------------------------------- reading ----

/** @param {Buffer | string} bytes @returns {string} */
function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** @param {string} text @returns {string} */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** @param {string} rel @returns {string} */
function absPath(rel) {
  return join(ROOT, ...rel.split('/'));
}

/**
 * One committed file, as text. A missing file is named with the path a reader can open.
 * @param {string} rel @param {string} why @returns {string}
 */
function readText(rel, why) {
  const path = absPath(rel);
  assert.ok(existsSync(path), `${rel} is missing - ${why}`);
  return stripBom(readFileSync(path, 'utf8'));
}

/** One committed file, parsed. @param {string} rel @param {string} why @returns {any} */
function readJson(rel, why) {
  return JSON.parse(readText(rel, why));
}

/** @param {any} record @returns {string} */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/** A deep copy, so a mutant is planted on a copy and the file on disk is never touched. */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** @returns {string} */
function nowIso() {
  return new Date().toISOString();
}

/** A refusal inside a pin, as an Error whose message names what moved. @param {string} message */
function fail(message) {
  throw new Error(message);
}

/**
 * The first place two values differ, as `path: recorded -> derived`, so a stale value is named
 * rather than reported as a mismatch somewhere in a record of several hundred lines.
 * @param {any} left @param {any} right @param {string} at @returns {string}
 */
function firstDifference(left, right, at) {
  if (JSON.stringify(left) === JSON.stringify(right)) return '';
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return `${at}: ${String(left.length)} row(s) -> ${String(right.length)} row(s)`;
    }
    for (let index = 0; index < left.length; index += 1) {
      const found = firstDifference(
        left[index],
        right[index],
        `${at}[${String(index)}]`,
      );
      if (found !== '') return found;
    }
    return at;
  }
  if (
    left !== null &&
    right !== null &&
    typeof left === 'object' &&
    typeof right === 'object'
  ) {
    for (const key of [
      ...new Set([...Object.keys(left), ...Object.keys(right)]),
    ]) {
      const found = firstDifference(
        left[key],
        right[key],
        at === '' ? key : `${at}.${key}`,
      );
      if (found !== '') return found;
    }
    return at;
  }
  return `${at}: ${JSON.stringify(left)} -> ${JSON.stringify(right)}`;
}

/**
 * The failure a pin raises on a value, so a mutant's evidence is the assertion's own message rather
 * than the wrapper a `doesNotThrow` puts around it.
 * @param {() => void} pin @param {string} what @returns {Error}
 */
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
  return /** @type {Error} */ (failure);
}

/** Whether a value is one of the record's three facts: a read flag and a value or a reason. */
function isFact(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.read === 'boolean'
  );
}

// ----------------------------------------------------------------- deriving ----

/** The page reading this record derives from, read once per run. */
let PAGE_READING = null;

/**
 * M066's committed page reading of the portal's contract-create form. The route is asserted rather
 * than assumed: a reading of another page is a different page, and this record measures this one.
 * @returns {any}
 */
function pageReading() {
  if (PAGE_READING === null) {
    const reading = readJson(
      PAGE_READING_REL,
      'the portal page reading this record derives from',
    );
    assert.equal(
      reading?.milestone,
      'M066',
      `${PAGE_READING_REL} must be the M066 page reading, and it names ${JSON.stringify(reading?.milestone)}`,
    );
    assert.equal(
      reading?.page?.route,
      PAGE_ROUTE,
      `${PAGE_READING_REL} drove ${JSON.stringify(reading?.page?.route)}; this record measures ${JSON.stringify(PAGE_ROUTE)}, so a reading of another page is refused rather than recorded`,
    );
    PAGE_READING = reading;
  }
  return PAGE_READING;
}

/**
 * The field rows the page gave, one per element that binds a field, plus one row with no element
 * for each field no element carries.
 * @param {any} reading @returns {any[]}
 */
function readingRows(reading) {
  const rows = reading?.input?.fields;
  assert.ok(
    Array.isArray(rows) && rows.length > 0,
    `${PAGE_READING_REL} must carry the field rows its page gave`,
  );
  for (const row of rows) {
    assert.ok(
      row !== null && typeof row === 'object' && typeof row.field === 'string',
      `${PAGE_READING_REL} carries a field row that names no field`,
    );
  }
  return rows;
}

/** Every key any field row of the reading carries, sorted. @param {any} reading @returns {string[]} */
function readingKeys(reading) {
  return [
    ...new Set(readingRows(reading).flatMap((row) => Object.keys(row))),
  ].sort();
}

/**
 * The identity a field carries: the key the page's field tree reports, or the statement that the
 * tree does not report it. Never a second identity derived here.
 * @param {string} name @param {string[]} treeNames
 */
function identityFromReading(name, treeNames) {
  if (treeNames.includes(name)) {
    return {
      read: true,
      value: name,
      source: `${PAGE_READING_REL}#page.fieldTreeNames`,
      producer: FIELD_STATE_REL,
    };
  }
  return {
    read: false,
    reason: `the ${name} field has a row in ${PAGE_READING_REL} and the page's field tree does not name it (${JSON.stringify(treeNames)}), so this record carries no identity for it: an identity is a key ${FIELD_STATE_REL} echoes from the field tree, and none is derived here`,
  };
}

/**
 * The element a field hosts: its tag name and the attribute that distinguishes the element by the
 * field's own identity, or the statement that no element carries the field.
 * @param {string} name @param {any | null} row @param {any[]} rows
 */
function hostedFromReading(name, row, rows) {
  if (row === null) {
    return {
      read: false,
      reason: `no row in ${PAGE_READING_REL} carries the ${name} field, so this record has no element reading for it and names none: a hosted element is read from a page and never inferred from a label`,
    };
  }
  if (row.element === null || row.element === undefined) {
    const carriers = rows
      .filter((one) => one.element !== null && one.element !== undefined)
      .map((one) => one.field);
    return {
      read: false,
      reason: `the ${name} field hosts no element in the page reading this record derives from: ${String(carriers.length)} of the ${String(rows.length)} fields carry one (${carriers.join(', ')}) and no element carries ${name}; this task read no page of its own, so the hosted element is stated as not read rather than inferred from the field's label`,
    };
  }
  const id = row.id ?? null;
  const nameAttr = row.nameAttr ?? null;
  const attribute =
    id === name
      ? { name: 'id', value: id }
      : nameAttr === name
        ? { name: 'name', value: nameAttr }
        : null;
  return {
    read: true,
    value: { tag: row.element, attribute },
    source: `${PAGE_READING_REL}#input.fields[${name}]`,
  };
}

/** The packages `package.json` declares, and the ones of them that are a control library. */
function declaredPackages() {
  const pkg = readJson(
    PACKAGE_REL,
    'the declared packages are part of this repository',
  );
  const names = [
    ...Object.keys(pkg?.dependencies ?? {}),
    ...Object.keys(pkg?.devDependencies ?? {}),
  ].sort();
  assert.ok(
    names.length > 0,
    `${PACKAGE_REL} declares no package, so the reading of what names a control library measured nothing`,
  );
  const control = names.filter((name) =>
    /^@angular\/(?:material|cdk)(?:\/|$)/.test(name),
  );
  return { names, control };
}

/**
 * The control a field's record expects, or the statement that it was not read. At this head the
 * only page reading carries no key that names a control, so the absence is the measured answer.
 * @param {string} name @param {any | null} row @param {string[]} keys
 * @param {{ names: string[], control: string[] }} packages
 */
function expectedFromReading(name, row, keys, packages) {
  const naming = keys.filter((key) => EXPECTATION_KEY.test(key));
  if (naming.length === 0) {
    return {
      read: false,
      reason: `the control the ${name} field's record expects was not read: the one page reading this record derives from (${PAGE_READING_REL}) carries the ${String(keys.length)} keys ${JSON.stringify(keys)} for a field and none of them names a control a field expects; this task read no page of its own, and ${PACKAGE_REL} declares ${String(packages.names.length)} packages of which ${String(packages.control.length)} is @angular/material or @angular/cdk, so no control library in this tree names one either - recorded as an absence, never inferred from the field's label`,
    };
  }
  const key = naming[0];
  const value = row === null ? null : row[key];
  if (typeof value === 'string' && value !== '') {
    return {
      read: true,
      value,
      source: `${PAGE_READING_REL}#input.fields[${name}].${key}`,
    };
  }
  return {
    read: false,
    reason: `${PAGE_READING_REL} carries ${JSON.stringify(key)} for the ${name} field as ${JSON.stringify(value)}, which is not a control name, so the control the field expects was not read`,
  };
}

/** The route the fixture serves the fallback form on, read from its own route table. @returns {string} */
function fixtureRoute() {
  const source = readText(
    FIXTURE_ROUTE_SOURCE_REL,
    'the fixture route table names the fallback route',
  );
  const found = /path:\s*'([^']+)'\s*,\s*component:\s*FieldFormPage\b/.exec(
    source,
  );
  assert.ok(
    found !== null,
    `${FIXTURE_ROUTE_SOURCE_REL} must declare the FieldFormPage route this record names as the fallback, and it declares none`,
  );
  return `/${String(found[1])}`;
}

/** How many fields the fixture form binds, read from its template. @returns {number} */
function fixtureBindings() {
  const source = readText(
    FIXTURE_FORM_REL,
    'the fixture form binds the fields the fallback would have read',
  );
  const found = source.match(/\[formField\]/g) ?? [];
  return found.length;
}

/** The committed field-state reading, whose `fields` keys are the identity shape. @returns {any} */
function fieldStateReading() {
  const reading = readJson(
    FIELD_STATE_READING_REL,
    'the identity shape this record carries was recorded there',
  );
  assert.ok(
    reading?.fields !== null &&
      typeof reading?.fields === 'object' &&
      Object.keys(reading.fields).length > 0,
    `${FIELD_STATE_READING_REL} must carry the field set its page read`,
  );
  return reading;
}

/** Whether the panel's own route table declares one surface. @param {string} surface @returns {boolean} */
function panelRouteDeclares(surface) {
  const source = readText(
    PANEL_ROUTE_SOURCE_REL,
    'the panel route table declares the surface this identity already renders on',
  );
  return source.includes(`'${surface}'`);
}

/**
 * The identity producer, run in a bare `node:vm` context: the world holds nothing but the source,
 * so the namespace read back is the one the module publishes and no host rule answers for it.
 * @returns {any}
 */
let PRODUCER = null;
function fieldStateApi() {
  if (PRODUCER !== null) return PRODUCER;
  const source = readText(
    FIELD_STATE_REL,
    'the identity this record carries is the one this module produces',
  );
  const context = createContext({});
  runInContext(source, context, { filename: FIELD_STATE_REL });
  const api = context.angularAiFieldState;
  assert.ok(
    api !== null && typeof api === 'object',
    `${FIELD_STATE_REL} must publish angularAiFieldState on the global object of whatever world it runs in`,
  );
  assert.equal(
    typeof api.read,
    'function',
    `${FIELD_STATE_REL} must publish a read function, and it publishes ${JSON.stringify(Object.keys(api).sort())}`,
  );
  PRODUCER = api;
  return PRODUCER;
}

/**
 * The identities the producer echoes for a field set: one key per field, in the order the set
 * carries them. This is the only definition of a field identity this suite uses.
 * @param {string[]} names @returns {string[]}
 */
function producedIdentities(names) {
  const api = fieldStateApi();
  const fields = Object.fromEntries(
    names.map((name) => [name, { valid: true, invalid: false, errors: [] }]),
  );
  const answer = api.read({
    fields,
    root: { valid: true, invalid: false, errors: [] },
    submitState: 'enabled',
  });
  assert.equal(
    answer?.state,
    'fields',
    `${FIELD_STATE_REL} must answer the fields state for a readable form, and it answered ${JSON.stringify(answer?.state)}`,
  );
  return Object.keys(answer.fields);
}

/**
 * The record, derived. Every value below is read from a file this checkout carries, so a source
 * that moved makes the record stale rather than quietly wrong. `capturedAt` is the one value the
 * derivation takes from the recorded document: it is the instant the record was first written, and
 * a re-capture derives through it so that no byte moves for a clock.
 * @param {string} capturedAt @returns {any}
 */
function derive(capturedAt) {
  assert.match(
    String(capturedAt),
    ISO,
    `the record's capture instant must be a fixed-width ISO instant, and it is ${JSON.stringify(capturedAt)}`,
  );
  const reading = pageReading();
  const rows = readingRows(reading);
  const keys = readingKeys(reading);
  const packages = declaredPackages();
  const treeNames = reading.page.fieldTreeNames;
  assert.ok(
    Array.isArray(treeNames) && treeNames.length > 0,
    `${PAGE_READING_REL} must name the fields the page's field tree reported`,
  );

  // Every field the page reading names, in the tree's order, with any row the tree did not name
  // appended in the order the reading holds it. One entry per identity, so a field cannot carry two.
  const names = [
    ...treeNames,
    ...rows.map((row) => row.field).filter((name) => !treeNames.includes(name)),
  ];
  const repeated = names.filter((name, index) => names.indexOf(name) !== index);
  assert.equal(
    repeated.length,
    0,
    `${PAGE_READING_REL} names ${JSON.stringify(repeated)} more than once, so one field would carry two entries`,
  );

  const fields = names.map((name) => ({
    field: name,
    identity: identityFromReading(name, treeNames),
    hosted: hostedFromReading(
      name,
      rows.find((row) => row.field === name) ?? null,
      rows,
    ),
    expected: expectedFromReading(
      name,
      rows.find((row) => row.field === name) ?? null,
      keys,
      packages,
    ),
  }));

  const identityRead = fields.filter((entry) => entry.identity.read).length;
  const hostedRead = fields.filter((entry) => entry.hosted.read).length;
  const expectedRead = fields.filter((entry) => entry.expected.read).length;
  const carrier = fields
    .filter((entry) => entry.hosted.read)
    .map((entry) => `${entry.field} <${entry.hosted.value.tag}>`);

  return {
    schema: SCHEMA,
    milestone: MILESTONE,
    task: TASK,
    question: QUESTION,
    capture: {
      capturedAt,
      command: CAPTURE_COMMAND,
      check: CHECK_COMMAND,
      records: RECORD_REL,
      writes:
        'one: the armed test re-derives this record from the files below and writes it only when a value moved, and it refuses to write a candidate that is not a fixed point of this suite’s default pin',
      armedBy: `${CAPTURE_ENV}=1`,
      note: 'the instant this record was first written; every re-capture derives through it, so the record moves no byte for a clock - the instant the page was read is page.capturedAt, which comes from the reading it derives from',
    },
    sources: SOURCES.map(({ path, contributes }) => {
      assert.ok(
        existsSync(absPath(path)),
        `${path} is a source this record is derived from, and this checkout does not carry it`,
      );
      return { path, contributes };
    }),
    page: {
      target: reading.target.name,
      route: reading.page.route,
      url: reading.page.url,
      heading: reading.page.heading,
      formCount: reading.page.formCount,
      formRootCount: reading.page.formRootCount,
      capturedAt: reading.capturedAt,
      readBy: PAGE_READING_REL,
      fieldTreeNames: treeNames,
      boundFields: reading.page.boundFields ?? [],
    },
    identity: {
      producer: FIELD_STATE_REL,
      publication: 'globalThis.angularAiFieldState',
      exports: Object.keys(fieldStateApi()).sort(),
      expression:
        'angularAiFieldState.read({ fields, root, submitState }).fields, then its own keys',
      meaning:
        'a field’s identity is the key the read copies from state.fields: the module echoes every key verbatim and invents none, so an identity this record carries is the key it is keyed by and a second spelling of one field is the defect this record refuses',
      surface: {
        route: 'fields',
        declaredIn: PANEL_ROUTE_SOURCE_REL,
        declared: panelRouteDeclares('fields'),
      },
    },
    fallback: {
      used: hostedRead === 0,
      why:
        hostedRead === 0
          ? `the portal's ${PAGE_ROUTE} page hosts no element for any field it names, so the fixture at ${fixtureRoute()} is the only form this checkout carries whose fields bind an element`
          : `the portal carries a form whose fields host elements: ${String(hostedRead)} of the ${String(fields.length)} fields ${PAGE_READING_REL} read on ${PAGE_ROUTE} host one (${carrier.join(', ')}), so the fixture route ${fixtureRoute()} was not needed and was not driven`,
      route: fixtureRoute(),
      routeSource: FIXTURE_ROUTE_SOURCE_REL,
      formFields: Object.keys(fieldStateReading().fields),
      formBindings: fixtureBindings(),
      formSource: FIXTURE_FORM_REL,
      fieldsSource: FIELD_STATE_READING_REL,
    },
    counts: {
      fields: fields.length,
      identityRead,
      hostedRead,
      hostedUnread: fields.length - hostedRead,
      expectedRead,
      expectedUnread: fields.length - expectedRead,
    },
    fields,
  };
}

/**
 * The record as this head derives it, through the instant the recorded document carries. The
 * default pin and the armed writer both derive here, so the two can never hold different shapes.
 * @returns {any}
 */
function derivedFromHead() {
  const recorded = existsSync(RECORD_PATH)
    ? JSON.parse(readFileSync(RECORD_PATH, 'utf8'))
    : null;
  return derive(recorded?.capture?.capturedAt ?? nowIso());
}

// --------------------------------------------------------------------- pins ----

/** The record's own shape and internal agreement, checked before anything is compared. */
function pinShape(record) {
  if (record === null || typeof record !== 'object' || Array.isArray(record)) {
    fail('defect: the recording is not an object');
  }
  if (record.schema !== SCHEMA) {
    fail(`defect: the recording's schema is ${JSON.stringify(record.schema)}`);
  }
  if (record.milestone !== MILESTONE) {
    fail(`defect: the recording is not ${MILESTONE}`);
  }
  if (record.task !== TASK) fail(`defect: the recording is not ${TASK}`);
  if (record.question !== QUESTION) {
    fail('defect: the recording states another question');
  }

  const capture = record.capture;
  if (capture === null || typeof capture !== 'object') {
    fail('defect: the record carries no capture section');
  }
  if (!ISO.test(String(capture.capturedAt))) {
    fail(
      `defect: capture.capturedAt is ${JSON.stringify(capture.capturedAt)}, which is not a fixed-width ISO instant`,
    );
  }
  if (capture.command !== CAPTURE_COMMAND) {
    fail(
      `defect: capture.command is ${JSON.stringify(capture.command)}, and the only command that writes this record is ${JSON.stringify(CAPTURE_COMMAND)}`,
    );
  }
  if (capture.check !== CHECK_COMMAND) {
    fail(
      `defect: capture.check is ${JSON.stringify(capture.check)}, and this suite is ${JSON.stringify(CHECK_COMMAND)}`,
    );
  }
  if (capture.records !== RECORD_REL) {
    fail(
      `defect: capture.records is ${JSON.stringify(capture.records)}, and the record this suite writes is ${RECORD_REL}`,
    );
  }

  if (!Array.isArray(record.sources) || record.sources.length === 0) {
    fail(
      'defect: the record names no source, so no fact it carries has a file behind it',
    );
  }
  for (const source of record.sources) {
    if (typeof source?.path !== 'string' || source.path === '') {
      fail('defect: a source of the record names no path');
    }
    if (!existsSync(absPath(source.path))) {
      fail(
        `defect: the record names ${source.path} as a source and this checkout does not carry it`,
      );
    }
    if (typeof source.contributes !== 'string' || source.contributes === '') {
      fail(`defect: the source ${source.path} states nothing it contributes`);
    }
  }

  const page = record.page;
  if (page === null || typeof page !== 'object') {
    fail('defect: the record carries no page');
  }
  if (page.route !== PAGE_ROUTE) {
    fail(
      `defect: the record drove ${JSON.stringify(page.route)}, not ${PAGE_ROUTE}`,
    );
  }
  for (const key of ['target', 'url', 'heading']) {
    if (typeof page[key] !== 'string' || page[key] === '') {
      fail(`defect: page.${key} is not a non-empty string`);
    }
  }
  if (page.formCount !== 1) {
    fail(`defect: the page carried ${String(page.formCount)} forms, not one`);
  }
  if (page.formRootCount !== 1) {
    fail(
      `defect: the page carried ${String(page.formRootCount)} forms with a FormRoot, not one`,
    );
  }
  if (!ISO.test(String(page.capturedAt))) {
    fail(
      `defect: page.capturedAt is ${JSON.stringify(page.capturedAt)}, which is not the instant the page reading states`,
    );
  }
  if (!Array.isArray(page.fieldTreeNames) || page.fieldTreeNames.length === 0) {
    fail('defect: the page named no field on its form');
  }

  const identity = record.identity;
  if (identity === null || typeof identity !== 'object') {
    fail('defect: the record carries no identity section');
  }
  if (identity.producer !== FIELD_STATE_REL) {
    fail(
      `defect: identity.producer is ${JSON.stringify(identity.producer)}, and the one identity this milestone uses is ${FIELD_STATE_REL}`,
    );
  }
  if (typeof identity.meaning !== 'string' || identity.meaning.length < 40) {
    fail('defect: identity.meaning states no rule for what an identity is');
  }
  if (identity.surface?.declared !== true) {
    fail(
      `defect: identity.surface.declared is ${JSON.stringify(identity.surface?.declared)}, and ${PANEL_ROUTE_SOURCE_REL} must declare the ${JSON.stringify(identity.surface?.route ?? '')} surface this identity already renders on`,
    );
  }

  const fallback = record.fallback;
  if (typeof fallback?.used !== 'boolean') {
    fail('defect: fallback.used is not a boolean');
  }
  if (typeof fallback.why !== 'string' || fallback.why.length < 40) {
    fail(
      'defect: fallback.why does not state why the fixture was or was not used',
    );
  }
  if (typeof fallback.route !== 'string' || !fallback.route.startsWith('/')) {
    fail(
      `defect: fallback.route is ${JSON.stringify(fallback.route)}, and a route begins with a slash`,
    );
  }
  const treeNames = Object.keys(fieldStateReading().fields);
  if (JSON.stringify(fallback.formFields) !== JSON.stringify(treeNames)) {
    fail(
      `defect: fallback.formFields is ${JSON.stringify(fallback.formFields)} and ${FIELD_STATE_READING_REL} read ${JSON.stringify(treeNames)}`,
    );
  }
  if (fallback.formBindings !== fixtureBindings()) {
    fail(
      `defect: fallback.formBindings is ${String(fallback.formBindings)} and ${FIXTURE_FORM_REL} declares ${String(fixtureBindings())} [formField] binding(s)`,
    );
  }

  if (!Array.isArray(record.fields) || record.fields.length === 0) {
    fail('defect: the record carries no form field');
  }
  const keyed = record.fields.map((entry) => entry?.field);
  if (new Set(keyed).size !== keyed.length) {
    fail(
      `defect: the record carries two entries for one field: ${JSON.stringify(keyed)}`,
    );
  }
  for (const entry of record.fields) {
    const where = `fields[${entry.field}]`;
    const entryKeys = Object.keys(entry).sort();
    if (JSON.stringify(entryKeys) !== JSON.stringify(ENTRY_KEYS)) {
      fail(
        `defect: ${where} carries the keys ${JSON.stringify(entryKeys)}; an entry carries exactly ${JSON.stringify(ENTRY_KEYS)}, and a key added to the shape is a re-derivation`,
      );
    }
    for (const name of ['identity', 'hosted', 'expected']) {
      const fact = entry[name];
      if (!isFact(fact)) {
        fail(
          `defect: ${where}.${name} is neither a value nor a reason: it is ${JSON.stringify(fact)}`,
        );
      }
      if (fact.read === true && !('value' in fact)) {
        fail(`defect: ${where}.${name} is read and carries no value`);
      }
      if (fact.read === false && 'value' in fact) {
        fail(
          `defect: ${where}.${name} is stated as not read and carries a value: a value the reading gave is not a reading that was not taken`,
        );
      }
      if (fact.read === false) {
        if (typeof fact.reason !== 'string' || fact.reason.trim().length < 40) {
          fail(
            `defect: ${where}.${name} was not read and states no reason for the absence`,
          );
        }
        if (!fact.reason.includes(entry.field)) {
          fail(
            `defect: ${where}.${name}.reason does not name the field: ${fact.reason}`,
          );
        }
      }
      if (fact.read === true && 'reason' in fact) {
        fail(`defect: ${where}.${name} is read and carries a reason`);
      }
    }
  }

  const counts = record.counts;
  const expectedCounts = {
    fields: record.fields.length,
    identityRead: record.fields.filter((entry) => entry.identity.read).length,
    hostedRead: record.fields.filter((entry) => entry.hosted.read).length,
    hostedUnread: record.fields.filter((entry) => !entry.hosted.read).length,
    expectedRead: record.fields.filter((entry) => entry.expected.read).length,
    expectedUnread: record.fields.filter((entry) => !entry.expected.read)
      .length,
  };
  if (JSON.stringify(counts) !== JSON.stringify(expectedCounts)) {
    fail(
      `defect: the record states the counts ${JSON.stringify(counts)} and its own rows carry ${JSON.stringify(expectedCounts)}`,
    );
  }
  return true;
}

/**
 * The identity pin: every identity the record carries is one the producer echoes for the fields the
 * page's tree reported, and it is the key the entry is keyed by. A second identity is refused by
 * name, which is the defect M033, M064 and M066 each paid for.
 * @param {any} record
 */
function pinIdentity(record) {
  const treeNames = pageReading().page.fieldTreeNames;
  const produced = producedIdentities(treeNames);
  let read = 0;
  for (const entry of record.fields) {
    const where = `fields[${entry.field}]`;
    const identity = entry.identity;
    if (identity === null || typeof identity !== 'object') {
      fail(`defect: ${where}.identity is missing`);
    }
    if (identity.read === false) {
      if (typeof identity.reason !== 'string' || identity.reason === '') {
        fail(`defect: ${where}.identity was not read and states no reason`);
      }
      continue;
    }
    if (identity.read !== true) {
      fail(
        `defect: ${where}.identity.read is ${JSON.stringify(identity.read)}`,
      );
    }
    read += 1;
    if (identity.producer !== FIELD_STATE_REL) {
      fail(
        `defect: ${where}.identity.producer is ${JSON.stringify(identity.producer)}, and the one producer is ${FIELD_STATE_REL}`,
      );
    }
    if (identity.value !== entry.field) {
      fail(
        `defect: ${where}.identity.value is ${JSON.stringify(identity.value)} but the row is keyed by ${JSON.stringify(entry.field)}: an identity this record carries is the key it is keyed by`,
      );
    }
    if (!produced.includes(identity.value)) {
      fail(
        `defect: ${where}.identity.value ${JSON.stringify(identity.value)} is not an identity ${FIELD_STATE_REL} produces: run over the ${String(treeNames.length)} fields the page's tree reported it produces ${JSON.stringify(produced)}, and a second identity for a field is the defect this pin exists for`,
      );
    }
  }
  if (read === 0) {
    fail(
      'defect: no field carries an identity, so the identity pin asserts nothing',
    );
  }

  // The producer does not normalise: the string given is the key echoed, so a second spelling of a
  // field is a second identity rather than the same one, which is why one spelling is asserted.
  const odd = 'Policy.Number-Ünïcode';
  const echoed = producedIdentities([odd]);
  if (echoed.length !== 1 || echoed[0] !== odd) {
    fail(
      `defect: ${FIELD_STATE_REL} answers ${JSON.stringify(echoed)} for the key ${JSON.stringify(odd)}: the identity this record carries is the key the read echoes verbatim, and a normalised answer would make the record's identities a second rule`,
    );
  }

  // The committed field-state reading is the producer's own output: run the module over that
  // reading's field set and the keys it answers are the keys the reading recorded.
  const reading = fieldStateReading();
  const answer = fieldStateApi().read({
    fields: reading.fields,
    root: reading.root,
    submitDisabled: reading.submitDisabled,
  });
  const echoedReading = Object.keys(answer?.fields ?? {});
  const recordedReading = Object.keys(reading.fields);
  if (JSON.stringify(echoedReading) !== JSON.stringify(recordedReading)) {
    fail(
      `defect: ${FIELD_STATE_READING_REL} recorded the fields ${JSON.stringify(recordedReading)} and ${FIELD_STATE_REL} answers ${JSON.stringify(echoedReading)} for that same field set: the reading's keys are the identity shape, and they must be the producer's`,
    );
  }
}

/**
 * The hosted pin: every hosted fact is the one the page reading gives — the tag and the attribute
 * that distinguishes the element by the field's identity — and a field with no element states that
 * absence instead of naming one.
 * @param {any} record
 */
function pinHosted(record) {
  const rows = readingRows(pageReading());
  let read = 0;
  let unread = 0;
  for (const entry of record.fields) {
    const where = `fields[${entry.field}]`;
    const row = rows.find((one) => one.field === entry.field) ?? null;
    const derivedHosted = hostedFromReading(entry.field, row, rows);
    const stated = entry.hosted;
    if (!isFact(stated)) {
      fail(`defect: ${where}.hosted is not a fact`);
    }
    if (stated.read === false) {
      if (derivedHosted.read === true) {
        fail(
          `defect: ${where}.hosted is stated as not read, and ${PAGE_READING_REL} recorded <${derivedHosted.value.tag}> for it`,
        );
      }
      unread += 1;
      if (typeof stated.reason !== 'string' || stated.reason === '') {
        fail(`defect: ${where}.hosted was not read and states no reason`);
      }
      if (!stated.reason.includes(entry.field)) {
        fail(
          `defect: ${where}.hosted.reason does not name the field: ${stated.reason}`,
        );
      }
      continue;
    }
    if (stated.read !== true) {
      fail(`defect: ${where}.hosted.read is ${JSON.stringify(stated.read)}`);
    }
    read += 1;
    const value = stated.value;
    if (value === null || typeof value !== 'object') {
      fail(`defect: ${where}.hosted is read and carries no value`);
    }
    if (typeof value.tag !== 'string' || value.tag === '') {
      fail(`defect: ${where}.hosted names no element tag`);
    }
    if (derivedHosted.read !== true) {
      fail(
        `defect: ${where}.hosted names <${value.tag}> and the page reading carries no element for it: ${derivedHosted.reason}`,
      );
    }
    if (value.tag !== derivedHosted.value.tag) {
      fail(
        `defect: ${where}.hosted.tag is ${JSON.stringify(value.tag)} but ${PAGE_READING_REL} recorded <${derivedHosted.value.tag}> for it`,
      );
    }
    const statedAttribute = value.attribute ?? null;
    const readAttribute = derivedHosted.value.attribute ?? null;
    if (JSON.stringify(statedAttribute) !== JSON.stringify(readAttribute)) {
      fail(
        `defect: ${where}.hosted.attribute is ${JSON.stringify(statedAttribute)} but ${PAGE_READING_REL} distinguishes it by ${JSON.stringify(readAttribute)}`,
      );
    }
    if (statedAttribute !== null) {
      const named = statedAttribute.name;
      if (named !== 'id' && named !== 'name') {
        fail(
          `defect: ${where}.hosted.attribute.name is ${JSON.stringify(named)}, and the attributes this reading distinguishes an element by are "id" and "name"`,
        );
      }
      if (statedAttribute.value !== entry.field) {
        fail(
          `defect: ${where}.hosted.attribute.value is ${JSON.stringify(statedAttribute.value)} and the field's identity is ${JSON.stringify(entry.field)}: the attribute distinguishes the element by the field's own identity`,
        );
      }
    }
  }
  if (read === 0) {
    fail(
      'defect: no field names a hosted element, so the hosted pin asserts nothing: the portal form this record measures hosts a control on at least one field',
    );
  }
  if (unread === 0) {
    fail(
      'defect: every field names a hosted element, so the field that hosts none is not recorded: SC2 needs both a field that hosts a control and a field that does not',
    );
  }
}

/**
 * The expected pin: a field states a control only where the page reading names one, and otherwise
 * states the absence with the reading that carries none. The mutant that names an expected control
 * where no reading does is what makes this pin bite.
 * @param {any} record
 */
function pinExpected(record) {
  const reading = pageReading();
  const rows = readingRows(reading);
  const keys = readingKeys(reading);
  const packages = declaredPackages();
  for (const entry of record.fields) {
    const where = `fields[${entry.field}]`;
    const row = rows.find((one) => one.field === entry.field) ?? null;
    const derivedExpected = expectedFromReading(
      entry.field,
      row,
      keys,
      packages,
    );
    const stated = entry.expected;
    if (!isFact(stated)) {
      fail(`defect: ${where}.expected is not a fact`);
    }
    if (stated.read === true) {
      if (derivedExpected.read !== true) {
        fail(
          `defect: ${where}.expected names ${JSON.stringify(stated.value)} and no key of ${PAGE_READING_REL} names the control a field expects: the reading carries ${JSON.stringify(keys)}, and this record may not name a control it was not given`,
        );
      }
      if (stated.value !== derivedExpected.value) {
        fail(
          `defect: ${where}.expected is ${JSON.stringify(stated.value)} and ${PAGE_READING_REL} gives ${JSON.stringify(derivedExpected.value)}`,
        );
      }
      continue;
    }
    if (stated.read !== false) {
      fail(`defect: ${where}.expected.read is ${JSON.stringify(stated.read)}`);
    }
    if (derivedExpected.read === true) {
      fail(
        `defect: ${where}.expected is stated as not read, and ${PAGE_READING_REL} names ${JSON.stringify(derivedExpected.value)} for it`,
      );
    }
    if (typeof stated.reason !== 'string' || stated.reason === '') {
      fail(`defect: ${where}.expected was not read and states no reason`);
    }
    if (!stated.reason.includes(entry.field)) {
      fail(
        `defect: ${where}.expected.reason does not name the field: ${stated.reason}`,
      );
    }
  }
}

// ------------------------------------------------------------------ the write ---

// The bytes the read-only pin holds the record to; an armed run re-bases it after its own write.
const recordAtLoad = existsSync(RECORD_PATH)
  ? digest(readFileSync(RECORD_PATH))
  : null;
let recordBaseline = recordAtLoad;

/**
 * The armed capture: derive, compare, write only when a value moved, so two armed runs leave the
 * file byte-identical and a default run never writes at all.
 *
 * The writer derives through the recorded document — the capture instant it carries is passed into
 * the derivation — and refuses to write unless the candidate is a fixed point of the default pin.
 * That is the rule T002 established for the claims census after M065's rebasing was written into
 * the reader and not the writer: a writer that derives a different shape from its reader writes
 * bytes its own default run calls wrong, silently.
 * @param {string} path
 * @returns {{ wrote: boolean, before: string | null, after: string, moved: string }}
 */
function captureRecord(path) {
  const present = existsSync(path);
  const text = present ? readFileSync(path, 'utf8') : '';
  const before = present ? digest(text) : null;
  // The recorded document is the anchor the default pin reads through, so the writer reads through
  // the same anchor rather than stamping a shape of its own.
  const recorded = present ? JSON.parse(text) : null;
  const capturedAt = recorded?.capture?.capturedAt ?? nowIso();
  const record = derive(capturedAt);
  const candidate = canonical(record);
  let moved = 'the record had not been written';
  if (present && text === candidate) {
    moved = '';
  } else if (present) {
    moved = `the record moved: ${JSON.stringify(firstDifference(JSON.parse(text), record, ''))}`;
  }
  if (moved === '') return { wrote: false, before, after: before ?? '', moved };
  // Never write a record that would fail its own shape, identity, hosted or expected pins.
  assert.doesNotThrow(() => pinShape(record));
  assert.doesNotThrow(() => pinIdentity(record));
  assert.doesNotThrow(() => pinHosted(record));
  assert.doesNotThrow(() => pinExpected(record));
  // Nor one its own default pin would refuse: the candidate must be the fixed point of the pin, so
  // a capture cannot write bytes the read-only run then calls wrong.
  assert.equal(
    canonical(derive(JSON.parse(candidate).capture.capturedAt)),
    candidate,
    "armed capture refused: the bytes it would write fail this suite's default pin, so the capture does not derive through the pin its reader holds. Nothing was written.",
  );
  writeFileSync(path, candidate);
  return { wrote: true, before, after: digest(readFileSync(path)), moved };
}

// Declared first among the record's tests, so an armed run writes before the read-only pins read
// the file back: the same pins then prove the freshly written record is the one this head derives.
if (ARMED) {
  describe('the field-binder record, armed', () => {
    it('re-derives, writes only what moved, and a second run changes no byte', () => {
      const first = captureRecord(RECORD_PATH);
      console.log(
        first.wrote
          ? `armed run wrote ${RECORD_REL} (${first.moved})`
          : 'armed run: nothing moved, nothing written',
      );
      assert.equal(
        first.after,
        digest(readFileSync(RECORD_PATH)),
        'the bytes the armed run reports are not the bytes on disk',
      );
      const second = captureRecord(RECORD_PATH);
      assert.equal(
        second.wrote,
        false,
        `a second armed run wrote, and nothing had moved: ${second.moved}`,
      );
      assert.equal(
        second.after,
        first.after,
        'a second armed run changed the record, so the re-capture is not idempotent',
      );
      recordBaseline = digest(readFileSync(RECORD_PATH));
    });
  });
}

// --------------------------------------------------------------- measurement ---

describe('measurement', () => {
  it('AC3: the identity this record carries is the one extension/field-state.js produces', () => {
    const record = derivedFromHead();
    assert.doesNotThrow(() => pinIdentity(record));
    const api = fieldStateApi();
    assert.deepEqual(
      Object.keys(api).sort(),
      ['CANNOT_TELL', 'FIELDS', 'fields', 'inspect', 'read', 'state', 'triage'],
      `the producer publishes the namespace this record names, and it publishes ${JSON.stringify(Object.keys(api).sort())}`,
    );
    const treeNames = pageReading().page.fieldTreeNames;
    assert.deepEqual(
      producedIdentities(treeNames),
      treeNames,
      `the producer must echo the ${String(treeNames.length)} fields the page's tree reported, in its order`,
    );
    console.log(
      `identity producer ${FIELD_STATE_REL}: echoes ${JSON.stringify(producedIdentities(treeNames))} for the fields the tree reported`,
    );
  });

  it('reads the portal route M066 captured, one form and the field tree that names every field', () => {
    const reading = pageReading();
    const record = derivedFromHead();
    assert.equal(record.page.route, PAGE_ROUTE);
    assert.equal(record.page.target, reading.target.name);
    assert.equal(record.page.url, reading.page.url);
    assert.equal(record.page.formCount, 1);
    assert.equal(record.page.formRootCount, 1);
    assert.deepEqual(
      record.fields.map((entry) => entry.field),
      reading.page.fieldTreeNames,
      'the record carries one entry per field the tree reported, in the tree’s order',
    );
    assert.ok(
      record.page.heading.length > 0,
      'defect: the record does not state what the page rendered',
    );
    console.log(
      `${record.page.target} ${record.page.route} "${record.page.heading}": ${String(record.counts.fields)} field(s) ${JSON.stringify(record.page.fieldTreeNames)}`,
    );
  });

  it('AC1: names each field’s identity, hosted element and expected control, or which of the three was not read and why', () => {
    const record = derivedFromHead();
    assert.doesNotThrow(() => pinShape(record));
    const absences = [];
    for (const entry of record.fields) {
      for (const name of ['identity', 'hosted', 'expected']) {
        const fact = entry[name];
        if (fact.read === true) continue;
        assert.ok(
          typeof fact.reason === 'string' && fact.reason.length >= 40,
          `defect: fields[${entry.field}].${name} was not read and does not say why`,
        );
        assert.ok(
          fact.reason.includes(entry.field),
          `defect: fields[${entry.field}].${name}.reason does not name the field: ${fact.reason}`,
        );
        absences.push(`${entry.field}.${name}`);
      }
    }
    assert.ok(
      absences.length > 0,
      'defect: no fact of any field is stated as not read, so the absence half of AC1 is unexercised',
    );
    console.log(
      `AC1: ${String(record.counts.fields)} field(s); identity read ${String(record.counts.identityRead)}; hosted read ${String(record.counts.hostedRead)}, not read ${String(record.counts.hostedUnread)}; expected read ${String(record.counts.expectedRead)}, not read ${String(record.counts.expectedUnread)}; absences ${JSON.stringify(absences)}`,
    );
  });

  it('does not drive the fixture, because the portal carries a form whose fields host controls', () => {
    const record = derivedFromHead();
    assert.equal(
      record.fallback.used,
      false,
      `defect: the record says the fixture was used (${record.fallback.why}), and the portal's ${PAGE_ROUTE} page names ${String(record.counts.hostedRead)} field(s) that host an element`,
    );
    assert.equal(record.fallback.route, fixtureRoute());
    assert.equal(record.fallback.formBindings, fixtureBindings());
    assert.ok(
      record.fallback.why.includes(PAGE_ROUTE),
      `defect: the fallback statement does not name the route the portal was read on: ${record.fallback.why}`,
    );
    for (const entry of record.fields) {
      if (!entry.hosted.read) continue;
      assert.ok(
        record.fallback.why.includes(entry.field),
        `defect: the fallback statement does not name the ${entry.field} field that hosts <${entry.hosted.value.tag}>, so the reason the fixture was not needed is not stated`,
      );
    }
    console.log(
      `fallback ${record.fallback.route} (${record.fallback.routeSource}): ${record.fallback.why}`,
    );
  });
});

// ---------------------------------------------------------------- the record ---

describe('the field-binder record', () => {
  it('is a read: a default run hashes the record the same before and after', () => {
    assert.ok(
      existsSync(RECORD_PATH),
      `${RECORD_REL} is missing - the record has never been captured`,
    );
    const now = digest(readFileSync(RECORD_PATH));
    assert.equal(
      now,
      recordBaseline,
      `${RECORD_REL} changed during this run, so the suite is not read-only`,
    );
    console.log(
      `${RECORD_REL} at load and after the run: ${String(readFileSync(RECORD_PATH).length)} characters, sha256 ${now}`,
    );
  });

  it('is exactly what this head derives, and a value that moved is named', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    const expected = derivedFromHead();
    assert.deepEqual(
      recorded,
      expected,
      `${RECORD_REL} is not what this head derives: ${firstDifference(recorded, expected, '')} - re-capture with ${CAPTURE_COMMAND}`,
    );
    // The naming itself, on a copy: a moved value is reported by its path rather than as a
    // difference somewhere in the record.
    const planted = clone(recorded);
    planted.fields[0].hosted.value.tag = 'textarea';
    const named = firstDifference(planted, expected, '');
    assert.match(
      named,
      /fields\[0\]\.hosted\.value\.tag/,
      `a moved value must be named by its path, and the difference reads ${JSON.stringify(named)}`,
    );
    assert.ok(
      named.includes('textarea'),
      `the naming must state the value that moved, and it reads ${JSON.stringify(named)}`,
    );
    console.log(
      `${RECORD_REL}: re-derived field for field; a moved value names its path`,
    );
  });

  it('is serialized as the capture writes it, so a re-capture would move no byte', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.equal(
      readFileSync(RECORD_PATH, 'utf8'),
      canonical(recorded),
      `${RECORD_REL} must be serialized as the capture writes it, so a re-capture would move no byte`,
    );
  });

  it('records the hosted element the page reading carries, tag and distinguishing attribute', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinHosted(recorded));
    const hosted = recorded.fields.filter((entry) => entry.hosted.read);
    assert.ok(
      hosted.length >= 1,
      'defect: no field carries a hosted element, so the hosted half of the record is empty',
    );
    for (const entry of hosted) {
      const value = entry.hosted.value;
      assert.ok(
        typeof value.tag === 'string' && value.tag.length > 0,
        `defect: fields[${entry.field}].hosted names no tag`,
      );
      if (value.attribute === null) continue;
      assert.equal(
        value.attribute.value,
        entry.field,
        `defect: fields[${entry.field}].hosted.attribute distinguishes the element by ${JSON.stringify(value.attribute.value)} rather than by the field's identity`,
      );
    }
    console.log(
      `hosted: ${hosted.map((entry) => `${entry.field} <${entry.hosted.value.tag}${entry.hosted.value.attribute === null ? '' : ` ${entry.hosted.value.attribute.name}=${entry.hosted.value.attribute.value}`}>`).join('; ')}; not read: ${JSON.stringify(recorded.fields.filter((entry) => !entry.hosted.read).map((entry) => entry.field))}`,
    );
  });

  it('states the expected control as an absence wherever the reading carries none, each absence naming the field', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinExpected(recorded));
    const absent = recorded.fields.filter((entry) => !entry.expected.read);
    assert.ok(
      absent.length >= 1,
      'defect: no field states its expected control as an absence, and this head’s only page reading names no expected control',
    );
    for (const entry of absent) {
      assert.ok(
        entry.expected.reason.includes(PAGE_READING_REL),
        `defect: fields[${entry.field}].expected.reason does not name the reading that carries no control: ${entry.expected.reason}`,
      );
    }
    console.log(
      `expected: not read for ${JSON.stringify(absent.map((entry) => entry.field))} (no key of ${PAGE_READING_REL} names a control a field expects); read for ${JSON.stringify(recorded.fields.filter((entry) => entry.expected.read).map((entry) => entry.field))}`,
    );
  });

  it('carries the identity the producer echoes, asserted against extension/field-state.js', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinIdentity(recorded));
    const reading = fieldStateReading();
    assert.ok(
      recorded.identity.exports.includes('read'),
      `defect: the record names the producer's exports as ${JSON.stringify(recorded.identity.exports)}, which is not the module's namespace`,
    );
    for (const name of Object.keys(reading.fields)) {
      assert.ok(
        producedIdentities([name]).includes(name),
        `defect: ${FIELD_STATE_REL} does not echo ${JSON.stringify(name)}, which ${FIELD_STATE_READING_REL} recorded as a field`,
      );
    }
    console.log(
      `identity: ${JSON.stringify(recorded.fields.map((entry) => entry.identity.value))} from ${recorded.identity.producer} via ${recorded.identity.publication}`,
    );
  });

  it('is written from one place, and only after M067_CAPTURE=1 armed the run', () => {
    const source = readFileSync(fileURLToPath(import.meta.url), 'utf8');
    const writes = [...source.matchAll(/writeFileSync\(/g)];
    assert.equal(
      writes.length,
      1,
      `defect: the record is written from ${String(writes.length)} places, not one`,
    );
    const armed = source.indexOf(`process.env[CAPTURE_ENV]`);
    assert.ok(armed !== -1, `defect: the suite never reads ${CAPTURE_ENV}`);
    assert.ok(
      armed < /** @type {number} */ (writes[0].index),
      'defect: the armed check sits after the write',
    );
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.equal(recorded.capture.command, CAPTURE_COMMAND);
    assert.equal(recorded.capture.check, CHECK_COMMAND);
    assert.equal(
      CHECK_COMMAND,
      'node --test scripts/field-binder-record.test.mjs',
      'the recording names the command this task verifies with',
    );
  });
});

// -------------------------------------------------------------------- mutants ---

describe('the mutants', () => {
  it('a hosted control invented for a field that hosts nothing reddens the hosted pin, naming the field', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinHosted(recorded));
    const target = recorded.fields.find((entry) => !entry.hosted.read);
    assert.ok(
      target,
      'defect: the record carries no field whose hosted element was not read, so the invented host is planted nowhere',
    );
    const mutant = clone(recorded);
    const row = mutant.fields.find((entry) => entry.field === target.field);
    row.hosted = {
      read: true,
      value: { tag: 'input', attribute: { name: 'id', value: target.field } },
    };
    const failure = reddens(
      () => pinHosted(mutant),
      'a hosted control invented for a field that hosts nothing',
    );
    assert.ok(
      failure.message.includes(`fields[${target.field}].hosted`),
      `the refusal must name the field; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.match(
      failure.message,
      /carries no element for it/,
      `the refusal must say that no reading carries an element rather than that something differs; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.doesNotThrow(() => pinHosted(recorded));
    console.log(`invented-host mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a hosted element whose tag moved reddens the hosted pin, naming the field and both tags', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    const target = recorded.fields.find((entry) => entry.hosted.read);
    assert.ok(
      target,
      'defect: the record carries no hosted element, so the moved tag is planted nowhere',
    );
    const mutant = clone(recorded);
    const row = mutant.fields.find((entry) => entry.field === target.field);
    const was = row.hosted.value.tag;
    row.hosted.value.tag = `${was}-other`;
    const failure = reddens(
      () => pinHosted(mutant),
      'a hosted element whose tag moved',
    );
    assert.ok(
      failure.message.includes(`fields[${target.field}].hosted.tag`),
      `the refusal must name the field and the tag it read; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes(`${was}-other`) && failure.message.includes(was),
      `the refusal must name both tags; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.doesNotThrow(() => pinHosted(recorded));
    console.log(`moved-tag mutant: ${failure.message.split('\n')[0]}`);
  });

  it('an expected control added to a field whose reading carries none reddens the expected pin', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinExpected(recorded));
    const target = recorded.fields.find((entry) => !entry.expected.read);
    assert.ok(
      target,
      'defect: every field states an expected control, so the invented one is planted nowhere',
    );
    const mutant = clone(recorded);
    const row = mutant.fields.find((entry) => entry.field === target.field);
    row.expected = { read: true, value: 'p-select' };
    const failure = reddens(
      () => pinExpected(mutant),
      'an expected control named where no reading names one',
    );
    assert.ok(
      failure.message.includes(`fields[${target.field}].expected`),
      `the refusal must name the field; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.match(
      failure.message,
      /no key of research\/raw\/m066-schema-record\.json names the control a field expects/,
      `the refusal must say that the reading carries no expected control, rather than that something differs; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.doesNotThrow(() => pinExpected(recorded));
    console.log(`invented-expected mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a second identity reddens the identity pin, naming the field and what the producer produces', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinIdentity(recorded));
    const mutant = clone(recorded);
    const row = mutant.fields[0];
    const was = row.field;
    row.field = `${was}Name`;
    row.identity.value = row.field;
    const failure = reddens(
      () => pinIdentity(mutant),
      'a second identity for a field',
    );
    assert.ok(
      failure.message.includes(`fields[${row.field}].identity.value`),
      `the refusal must name the field and the identity; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.match(
      failure.message,
      /is not an identity extension\/field-state\.js produces/,
      `the refusal must state that the producer does not produce the identity; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes(was),
      `the refusal must name what the producer does produce; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.doesNotThrow(() => pinIdentity(recorded));
    console.log(`second-identity mutant: ${failure.message.split('\n')[0]}`);
  });

  it('the four mutants are four different defects, and each is proved against the same record', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    const pins = [
      () => pinShape(recorded),
      () => pinIdentity(recorded),
      () => pinHosted(recorded),
      () => pinExpected(recorded),
    ];
    for (const pin of pins) assert.doesNotThrow(pin);
    assert.equal(
      pins.length,
      4,
      'the record is held by four pins, and each mutant above reddens one of them',
    );
    console.log(
      `${RECORD_REL}: ${String(pins.length)} pins hold ${String(recorded.fields.length)} field(s)`,
    );
  });
});
