// M067 T005 — the join: one field's hosted control against the control the record expects.
//
// T004 wrote the record (`research/raw/m067-field-binder.json`) and this suite holds the join
// (`extension/field-binder.js`) to it, reading the record's shape exactly as it stands: every row
// in the committed record states its expected control as a named absence, so the join over the
// committed record can answer `cannot-tell` (the fields that host an element) or `no-host` (the
// field that hosts none) and can never answer `bound` or `mismatch`. Those two are exercised on
// rows constructed from the same shape, and the committed record is never rewritten here.
//
// Derived pieces of the record are read from the file rather than restated, and where a value is
// restated — the hosted tag of a field, the reason a state carries — the restatement is the pin:
// a record that moved reddens this suite by name instead of passing quietly.
//
// What the suite pins, in the order the pin runs:
//
//   1. an answer carries the six fields the surface renders and nothing else, its state is one of
//      the four, and its reason is one of the named absences. A join that names a remedy, a cause
//      or a control the record did not carry reddens here, by name (mutant 3);
//   2. a mismatch names both controls, so a join that reports the hosted control and not the
//      expected one reddens by name (mutant 1);
//   3. a field that is not a components field hosts nothing, so a join that infers a host from the
//      field's label reddens by name (mutant 2);
//   4. every string in an answer either appears in the record the answer was made from or is one
//      of the join's own state and reason names.
//
// Each mutant is planted on a decorated copy of the join, and the untouched module is pinned
// before the mutation and pinned again after it, so a mutant that changed nothing observable cannot
// pass for a caught defect. Nothing here writes a file: the record is read, never captured.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as binderModule from '../extension/field-binder.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The record T004 writes, and the module this task writes, both read as they stand. */
const RECORD_REL = 'research/raw/m067-field-binder.json';
const MODULE_REL = 'extension/field-binder.js';

function committed(rel) {
  return readFileSync(join(ROOT, ...rel.split('/')), 'utf8');
}

const RECORD = JSON.parse(committed(RECORD_REL));
const RECORD_TEXT = JSON.stringify(RECORD);
const MODULE_SOURCE = committed(MODULE_REL);

/** The states this join answers, and the absences it names. A caller compares these, not prose. */
const STATES = ['bound', 'mismatch', 'no-host', 'cannot-tell'];
const REASONS = [
  'record-unreadable',
  'field-not-chosen',
  'no-field-entry',
  'not-a-components-field',
  'hosts-no-element',
  'hosted-not-recorded',
  'hosted-not-a-control',
  'expected-not-recorded',
  'expected-not-a-control',
];

/** The six fields of an answer, which is every field the surface renders. */
const ANSWER_KEYS = [
  'expected',
  'field',
  'hosted',
  'observed',
  'reason',
  'state',
];

/** The join's own names, the only strings it may answer that the record does not carry. */
const TOKENS = new Set([...STATES, ...REASONS]);

/** The one function this module exports, at the name the interface contract gives it. */
const fieldBinder = binderModule.fieldBinder;

// ------------------------------------------------------------------- reading ----

/** A deep copy, so a case is built on a copy and the record in memory is never touched. */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** A row of the committed record, copied. @param {string} field */
function rowOf(field) {
  const found = RECORD.fields.find((entry) => entry.field === field);
  assert.ok(
    found,
    `the committed record carries no ${field} row, so the join has nothing to read and this suite's cases name a field the record does not carry`,
  );
  return clone(found);
}

/** The element a committed row hosts, as the record carries it. @param {string} field */
function hostedOf(field) {
  return clone(rowOf(field).hosted.value);
}

/** A record document built from the committed one's own shape, carrying one row. */
function documentOf(row) {
  return {
    schema: RECORD.schema,
    milestone: RECORD.milestone,
    task: RECORD.task,
    fields: [row],
  };
}

/** A copy of a committed row, patched, as a document. @param {string} field @param {(row) => void} [patch] */
function recordWith(field, patch) {
  const row = rowOf(field);
  if (patch !== undefined) patch(row);
  return documentOf(row);
}

/**
 * An expected fact of the shape the record carries: a read flag, the control's name and the
 * reading the name came from. The committed record carries no such fact for any field, so nothing
 * built here is claimed to be committed — it is a row constructed from the same shape.
 * @param {string} value
 */
function expectedControl(value) {
  return {
    read: true,
    value: value,
    source: `${RECORD_REL}#expected (constructed by this suite, not committed)`,
  };
}

/** Whether a value is a plain object, which is the shape every fact of the record carries. @param {any} value */
function isObjectValue(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// ---------------------------------------------------------------------- pinning ----

/**
 * The deficiency an answer carries: a key the surface does not render (a remedy, a cause), a
 * reason that is prose rather than a named absence, or a reason of a type no state answers. Null
 * when the answer carries none.
 * @param {any} answer
 * @returns {string | null}
 */
function banned(answer) {
  const extra = Object.keys(answer).filter((key) => !ANSWER_KEYS.includes(key));
  if (extra.length > 0) {
    return JSON.stringify(extra.map((key) => answer[key]));
  }
  if (answer.reason === null) return null;
  if (typeof answer.reason !== 'string') return JSON.stringify(answer.reason);
  return REASONS.includes(answer.reason) ? null : answer.reason;
}

/**
 * Every string the record it was made from carries, as values and as keys. A word the record holds
 * anywhere is a word an answer may quote; anything else is the join speaking for itself.
 * @param {any} record
 * @returns {Set<string>}
 */
function saidIn(record) {
  const said = new Set();
  const walk = (value) => {
    if (typeof value === 'string') {
      said.add(value);
      return;
    }
    if (Array.isArray(value)) {
      for (const one of value) walk(one);
      return;
    }
    if (value !== null && typeof value === 'object') {
      for (const key of Object.keys(value)) {
        said.add(key);
        walk(value[key]);
      }
    }
  };
  walk(record ?? null);
  return said;
}

/**
 * The strings an answer carries that the record it was made from does not contain, and that are
 * not one of the join's own names. A control named out of a label, a placeholder or a class is
 * found here.
 * @param {any} answer
 * @param {any} record
 * @returns {string[]}
 */
function inventedIn(answer, record) {
  const said = saidIn(record);
  const found = [];
  const walk = (value) => {
    if (typeof value === 'string') {
      if (!TOKENS.has(value) && !said.has(value)) found.push(value);
      return;
    }
    if (Array.isArray(value)) {
      for (const one of value) walk(one);
      return;
    }
    if (value !== null && typeof value === 'object') {
      for (const key of Object.keys(value)) walk(value[key]);
    }
  };
  walk(answer);
  return found;
}

/**
 * The cases the join is held to, in the order the pin runs them. Every record here is either the
 * committed record itself or a document built from its own rows and shape.
 */
function joinCases() {
  return [
    {
      what: 'the committed policyNumber field, whose expected control the record states as not read',
      record: RECORD,
      facts: { field: 'policyNumber' },
      state: 'cannot-tell',
      reason: 'expected-not-recorded',
      field: 'policyNumber',
      hosted: hostedOf('policyNumber'),
      expected: null,
    },
    {
      what: 'the committed insuranceStartOn field, which hosts a component and expects nothing read',
      record: RECORD,
      facts: { field: 'insuranceStartOn' },
      state: 'cannot-tell',
      reason: 'expected-not-recorded',
      field: 'insuranceStartOn',
      hosted: hostedOf('insuranceStartOn'),
      expected: null,
    },
    {
      what: 'the committed customer field, which hosts a component and expects nothing read',
      record: RECORD,
      facts: { field: 'customer' },
      state: 'cannot-tell',
      reason: 'expected-not-recorded',
      field: 'customer',
      hosted: hostedOf('customer'),
      expected: null,
    },
    {
      what: 'the committed status field, which hosts no element',
      record: RECORD,
      facts: { field: 'status' },
      state: 'no-host',
      reason: 'hosts-no-element',
      field: 'status',
      hosted: null,
      expected: null,
    },
    {
      what: 'a field hosting the control its record expects',
      record: recordWith('customer', (row) => {
        row.expected = expectedControl('p-select');
      }),
      facts: {},
      state: 'bound',
      reason: null,
      field: 'customer',
      hosted: hostedOf('customer'),
      expected: 'p-select',
    },
    {
      what: 'a field hosting a control named by its record in another case, with space around it',
      record: recordWith('customer', (row) => {
        row.expected = expectedControl(' P-Select ');
      }),
      facts: {},
      state: 'bound',
      reason: null,
      field: 'customer',
      hosted: hostedOf('customer'),
      expected: ' P-Select ',
    },
    {
      what: 'a field hosting a control other than the one its record expects',
      record: recordWith('customer', (row) => {
        row.expected = expectedControl('input');
      }),
      facts: {},
      state: 'mismatch',
      reason: null,
      field: 'customer',
      hosted: hostedOf('customer'),
      expected: 'input',
    },
    {
      what: 'a field the caller states is not a components field',
      record: recordWith('status', () => {}),
      facts: { componentsField: false },
      state: 'no-host',
      reason: 'not-a-components-field',
      field: 'status',
      hosted: null,
      expected: null,
    },
    {
      what: 'a row carrying no hosted fact at all',
      record: recordWith('policyNumber', (row) => {
        delete row.hosted;
      }),
      facts: {},
      state: 'cannot-tell',
      reason: 'hosted-not-recorded',
      field: 'policyNumber',
      hosted: null,
      expected: null,
    },
    {
      what: 'an expected fact that names something other than a control',
      record: recordWith('customer', (row) => {
        row.expected = { read: true, value: { tag: 'p-select' } };
      }),
      facts: {},
      state: 'cannot-tell',
      reason: 'expected-not-a-control',
      field: 'customer',
      hosted: hostedOf('customer'),
      expected: { tag: 'p-select' },
    },
    {
      what: 'a record carrying several fields and a caller naming none',
      record: RECORD,
      facts: undefined,
      state: 'cannot-tell',
      reason: 'field-not-chosen',
      field: null,
      hosted: null,
      expected: null,
    },
    {
      what: 'a record that does not carry the field the caller names',
      record: RECORD,
      facts: { field: 'premium' },
      state: 'cannot-tell',
      reason: 'no-field-entry',
      field: null,
      hosted: null,
      expected: null,
    },
    {
      what: 'a record that is not a row, a list of rows or a document of rows',
      record: null,
      facts: undefined,
      state: 'cannot-tell',
      reason: 'record-unreadable',
      field: null,
      hosted: null,
      expected: null,
    },
  ];
}

/**
 * One answer, held to the pin. Every assertion message names the defect it caught, so a mutant's
 * evidence is the pin's own message rather than a wrapper put around it.
 * @param {any} answer
 * @param {any} one
 */
function pinAnswer(answer, one) {
  const where = one.what;
  assert.ok(
    answer !== null && typeof answer === 'object',
    `${where}: the join answers ${JSON.stringify(answer)}, and an answer is one object`,
  );

  const deficiency = banned(answer);
  assert.equal(
    deficiency,
    null,
    `${where}: the join names a remedy: ${deficiency} - a state that cannot tell names the fact it is missing and stops there, and no answer carries a remedy, a cause or a control the record did not contain`,
  );

  assert.deepEqual(
    Object.keys(answer).sort(),
    ANSWER_KEYS,
    `${where}: the answer carries the keys ${JSON.stringify(Object.keys(answer).sort())}, and the surface renders ${JSON.stringify(ANSWER_KEYS)}`,
  );

  assert.ok(
    STATES.includes(answer.state),
    `${where}: the join answers the state ${JSON.stringify(answer.state)}, which is not one of ${JSON.stringify(STATES)}`,
  );
  assert.equal(
    answer.state,
    one.state,
    `${where}: the join answers ${JSON.stringify(answer.state)} and the record states ${JSON.stringify(one.state)}`,
  );
  assert.equal(
    answer.field,
    one.field,
    `${where}: the answer names the field ${JSON.stringify(answer.field)} and the record's row is keyed by ${JSON.stringify(one.field)}`,
  );

  if (one.hosted === null) {
    assert.equal(
      answer.hosted,
      null,
      one.state === 'no-host'
        ? `${where}: the no-host answer names a hosted control the record did not carry: ${JSON.stringify(answer.hosted)} is inferred from the field's identity ${JSON.stringify(answer.field)}, and a host read off a label, a placeholder or a class is not a host any reading took`
        : `${where}: the answer names the hosted control ${JSON.stringify(answer.hosted)}, which the record does not carry: a state that cannot tell quotes what was read and invents nothing`,
    );
  } else {
    assert.deepEqual(
      answer.hosted,
      one.hosted,
      `${where}: the answer names the hosted control ${JSON.stringify(answer.hosted)} and the record carries ${JSON.stringify(one.hosted)}`,
    );
  }

  if (one.expected === null) {
    assert.equal(
      answer.expected,
      null,
      `${where}: the answer names the expected control ${JSON.stringify(answer.expected)}, which the record does not carry: a state that cannot tell names the fact it is missing and adds no control to it`,
    );
  } else if (one.state === 'mismatch') {
    assert.notEqual(
      answer.expected,
      null,
      `${where}: the mismatch must name both controls, and it names the hosted control ${JSON.stringify(one.hosted)} and reports expected as null: the two controls are what a caller compares, and one of the two is not in the answer`,
    );
    assert.deepEqual(
      answer.expected,
      one.expected,
      `${where}: the mismatch names expected as ${JSON.stringify(answer.expected)} and the record states ${JSON.stringify(one.expected)}`,
    );
  } else {
    assert.deepEqual(
      answer.expected,
      one.expected,
      `${where}: the answer names the expected control ${JSON.stringify(answer.expected)} and the record states ${JSON.stringify(one.expected)}`,
    );
  }

  assert.equal(
    answer.reason,
    one.reason,
    `${where}: the reason reads ${JSON.stringify(answer.reason)} and the answer was expected to name ${JSON.stringify(one.reason)}`,
  );

  const invented = inventedIn(answer, one.record);
  assert.deepEqual(
    invented,
    [],
    `${where}: the answer carries ${JSON.stringify(invented)}, none of which the record contains: a join quotes the record and names no control it was not given`,
  );
}

/**
 * The whole pin, held against one join. The untouched module and every mutant face the same cases
 * in the same order, so a difference between them is the mutation and nothing else.
 * @param {(record: any, facts: any) => any} binder
 */
function pinJoin(binder) {
  assert.equal(
    typeof binder,
    'function',
    'the pin is held against a join function, and it was handed ' +
      typeof binder,
  );
  const cases = joinCases();
  assert.ok(
    cases.length >= 10,
    `the pin holds the join to ${String(cases.length)} case(s), which is too few to be a pin`,
  );
  for (const one of cases) pinAnswer(binder(one.record, one.facts), one);
}

/**
 * The failure a pin raises on a join, so a mutant's evidence is the pin's own message rather than
 * the wrapper a `doesNotThrow` puts around it.
 * @param {() => void} pin
 * @param {string} what
 * @returns {Error}
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
    `${what} passed the pin, so the mutation is not caught and the pin does not bite`,
  );
  return failure;
}

/** A frozen value, so a join that writes to what it was handed throws rather than passing. */
function deepFreeze(value) {
  if (value === null || typeof value !== 'object') return value;
  Object.freeze(value);
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return value;
}

// ----------------------------------------------------------------- the interface ----

describe('the interface', () => {
  it('exports one function, at the name and the signature the contract states', () => {
    assert.deepEqual(
      Object.keys(binderModule).sort(),
      ['fieldBinder'],
      `the module exports ${JSON.stringify(Object.keys(binderModule).sort())}, and the interface contract is one function named fieldBinder`,
    );
    assert.equal(
      typeof fieldBinder,
      'function',
      'extension/field-binder.js must export fieldBinder as a function',
    );
    assert.equal(
      fieldBinder.length,
      2,
      `the join takes the record and the facts, and it declares ${String(fieldBinder.length)} parameter(s)`,
    );
    console.log(
      `${MODULE_REL}: exports ${JSON.stringify(Object.keys(binderModule).sort())} with ${String(fieldBinder.length)} parameters`,
    );
  });

  it('is pure: no DOM, no I/O, no import, and nothing written', () => {
    // The comments are stripped first: this module's header states what it does not do, and a
    // statement about a name is not a use of it.
    const code = MODULE_SOURCE.replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .map((line) => line.replace(/\/\/.*$/, ''))
      .join('\n');
    const forbidden = [
      'document',
      'window',
      'localStorage',
      'fetch(',
      'XMLHttpRequest',
      'readFile',
      'writeFile',
      'require(',
      'import ',
      'process.',
    ];
    for (const word of forbidden) {
      assert.equal(
        code.includes(word),
        false,
        `the module's code contains ${JSON.stringify(word)}: the join is one pure function over what it is handed, and it reads and writes nothing`,
      );
    }
    assert.ok(
      code.includes('export function fieldBinder'),
      'the module exports the join as a function declaration, so the contract reads as it is stated',
    );
  });

  it('writes no recording: the committed record is read into memory and never re-captured', () => {
    const source = readFileSync(fileURLToPath(import.meta.url), 'utf8');
    // The fragments are built here rather than written out, so this assertion is not what it
    // detects: the call shape is what is matched, and naming a writer in a list of names to avoid —
    // which the module's own purity pin does — is not a call.
    const writing = [
      'write' + 'FileSync(',
      'append' + 'FileSync(',
      'createWrite' + 'Stream(',
    ];
    for (const word of writing) {
      assert.equal(
        source.includes(word),
        false,
        `this suite names ${JSON.stringify(word)}, so it writes a recording: the join reads the record T004 wrote, and this task captures nothing`,
      );
    }
    assert.ok(
      source.includes('readFileSync('),
      'this suite must read the committed record rather than restate it, and it reads nothing',
    );
    assert.ok(
      RECORD.fields.length > 0,
      'the committed record was read into memory, and it carries no field',
    );
  });
});

// ------------------------------------------------------- the committed record ----

describe('the committed record, joined as it stands', () => {
  it('AC3: answers cannot-tell naming the missing expected control for every field that hosts an element', () => {
    const hosting = RECORD.fields.filter((entry) => entry.hosted.read === true);
    assert.ok(
      hosting.length > 0,
      'defect: the committed record carries no field that hosts an element, so the join over it exercises nothing',
    );
    const tags = hosting.map((entry) => entry.hosted.value.tag);
    assert.deepEqual(
      tags,
      ['input', 'p-datepicker', 'p-select'],
      `the committed record hosts ${JSON.stringify(tags)}, and this suite pins the join against those three elements`,
    );
    for (const entry of hosting) {
      const answer = fieldBinder(RECORD, { field: entry.field });
      assert.equal(
        answer.state,
        'cannot-tell',
        `${entry.field}: every field of the committed record states its expected control as not read, so the join must answer cannot-tell and not ${JSON.stringify(answer.state)}`,
      );
      assert.equal(
        answer.reason,
        'expected-not-recorded',
        `${entry.field}: the fact the comparison is missing is the expected control, and the answer names ${JSON.stringify(answer.reason)}`,
      );
      assert.equal(
        answer.expected,
        null,
        `${entry.field}: the record carries no expected control, so the answer may name none and it names ${JSON.stringify(answer.expected)}`,
      );
      assert.deepEqual(
        answer.hosted,
        entry.hosted.value,
        `${entry.field}: the answer quotes the hosted element the record carries, and it names ${JSON.stringify(answer.hosted)}`,
      );
    }
    const states = RECORD.fields.map(
      (entry) => fieldBinder(RECORD, { field: entry.field }).state,
    );
    assert.equal(
      states.includes('mismatch'),
      false,
      `a join over the committed record answers ${JSON.stringify(states)}, and no field there carries an expected control, so no comparison was made and no mismatch can be reported`,
    );
    console.log(
      `committed record: ${String(hosting.length)} field(s) host an element; joined states ${JSON.stringify(states)}`,
    );
  });

  it('AC2: answers no-host for the field that hosts nothing, with that reason and no control', () => {
    const entry = RECORD.fields.find((one) => one.hosted.read === false);
    assert.ok(
      entry,
      'defect: the committed record carries no field whose hosted element was not read, so the join is never held to a field that hosts nothing',
    );
    const answer = fieldBinder(RECORD, { field: entry.field });
    assert.equal(
      answer.state,
      'no-host',
      `${entry.field}: the record states the field hosts no element, so the join must answer no-host and not ${JSON.stringify(answer.state)}`,
    );
    assert.equal(
      answer.reason,
      'hosts-no-element',
      `${entry.field}: a field that hosts nothing is no-host because no element carries it, and the answer names ${JSON.stringify(answer.reason)}`,
    );
    assert.equal(
      answer.hosted,
      null,
      `${entry.field}: the record read no element for the field, so the answer may name none and it names ${JSON.stringify(answer.hosted)}`,
    );
    assert.ok(
      isObjectValue(answer.observed.hosted) &&
        answer.observed.hosted.read === false,
      `${entry.field}: observed must quote the record's own absence, and it carries ${JSON.stringify(answer.observed.hosted)}`,
    );
    assert.ok(
      answer.observed.hosted.reason.includes(entry.field),
      `${entry.field}: the quoted absence must be the record's, naming the field; it reads ${JSON.stringify(answer.observed.hosted.reason)}`,
    );
    console.log(
      `committed record: ${entry.field} hosts nothing -> no-host (${answer.reason})`,
    );
  });

  it('quotes the record in observed, rather than paraphrasing what it read', () => {
    for (const entry of RECORD.fields) {
      const answer = fieldBinder(RECORD, { field: entry.field });
      assert.deepEqual(
        answer.observed,
        {
          field: entry.field,
          identity: entry.identity,
          hosted: entry.hosted,
          expected: entry.expected,
          componentsField: null,
        },
        `${entry.field}: observed must be what the record said for the field - its identity and both facts as recorded - and it is ${JSON.stringify(answer.observed)}`,
      );
    }
    const stated = fieldBinder(RECORD, {
      field: 'status',
      componentsField: false,
    });
    assert.equal(
      stated.observed.componentsField,
      false,
      `a caller's statement about the field's kind is read into observed, so a no-host answer can be traced to it; observed carries ${JSON.stringify(stated.observed.componentsField)}`,
    );
  });

  it('reads the same answer from the document, from its fields list and from one row', () => {
    const document = fieldBinder(RECORD, { field: 'customer' });
    const list = fieldBinder(RECORD.fields, { field: 'customer' });
    const row = fieldBinder(rowOf('customer'), {});
    assert.deepEqual(
      list,
      document,
      `the join reads a list of rows as it reads the document's fields, and it answered ${JSON.stringify(list)} for the list and ${JSON.stringify(document)} for the document`,
    );
    assert.deepEqual(
      row,
      document,
      `the join reads one row as it reads a document of one row, and it answered ${JSON.stringify(row)} for the row and ${JSON.stringify(document)} for the document`,
    );
  });
});

// ----------------------------------------------- rows constructed from the shape ----

describe('rows constructed from the same shape', () => {
  it('AC1: a field hosting another control is mismatch, and the answer names both controls', () => {
    const record = recordWith('customer', (row) => {
      row.expected = expectedControl('input');
    });
    const answer = fieldBinder(record);
    assert.equal(
      answer.state,
      'mismatch',
      `a field hosting <p-select> whose record expects the input control is a mismatch, and the join answers ${JSON.stringify(answer.state)}`,
    );
    assert.equal(
      answer.hosted === null ? null : answer.hosted.tag,
      'p-select',
      `the mismatch must name the hosted control, and it names ${JSON.stringify(answer.hosted)}`,
    );
    assert.equal(
      answer.expected,
      'input',
      `the mismatch must name the expected control, and it names ${JSON.stringify(answer.expected)}`,
    );
    assert.notEqual(
      answer.hosted === null ? null : answer.hosted.tag,
      answer.expected,
      'the mismatch is proved on two controls that differ, and this answer names one control twice',
    );
    assert.equal(
      answer.reason,
      null,
      `the comparison was made, so the answer names no reason for not making it, and it names ${JSON.stringify(answer.reason)}`,
    );
  });

  it('a field hosting the control its record expects is bound', () => {
    const record = recordWith('customer', (row) => {
      row.expected = expectedControl('p-select');
    });
    const answer = fieldBinder(record);
    assert.equal(
      answer.state,
      'bound',
      `a field hosting the control its record expects is bound, and the join answers ${JSON.stringify(answer.state)}`,
    );
    assert.equal(answer.hosted === null ? null : answer.hosted.tag, 'p-select');
    assert.equal(answer.expected, 'p-select');
    assert.equal(
      answer.reason,
      null,
      `the comparison was made, so the answer names no reason for not making it, and it names ${JSON.stringify(answer.reason)}`,
    );
  });

  it('compares a control in another case as the same one, and reports the string the record carries', () => {
    const record = recordWith('customer', (row) => {
      row.expected = expectedControl(' P-Select ');
    });
    const answer = fieldBinder(record);
    assert.equal(
      answer.state,
      'bound',
      `an element tag is case-insensitive and surrounding space is not part of it, so <p-select> is the control " P-Select " and the join answers ${JSON.stringify(answer.state)}`,
    );
    assert.equal(
      answer.expected,
      ' P-Select ',
      `the comparison folds case and space and the report does not, so the answer quotes the record's own string and it names ${JSON.stringify(answer.expected)}`,
    );
  });

  it('AC2: a field that is not a components field is no-host, with that reason and no inferred control', () => {
    const answer = fieldBinder(
      recordWith('status', () => {}),
      {
        componentsField: false,
      },
    );
    assert.equal(
      answer.state,
      'no-host',
      `a field the caller states is not a components field hosts no control this join compares, and the join answers ${JSON.stringify(answer.state)}`,
    );
    assert.equal(
      answer.reason,
      'not-a-components-field',
      `the reason must say which of the two ways the field hosts nothing, and it names ${JSON.stringify(answer.reason)}`,
    );
    assert.equal(
      answer.hosted,
      null,
      `the record read no element for the field, so the answer may name none, and it names ${JSON.stringify(answer.hosted)} - a host read off the field's label is an inference and not a reading`,
    );
    assert.equal(
      answer.observed.componentsField,
      false,
      'the answer quotes the caller fact it was given, so the no-host state is traceable to a statement rather than to an inference',
    );
  });

  it('AC3: a row without an expected control is cannot-tell, and names no remedy and no invented control', () => {
    const record = recordWith('policyNumber', () => {});
    const answer = fieldBinder(record);
    assert.equal(answer.state, 'cannot-tell');
    assert.equal(answer.reason, 'expected-not-recorded');
    assert.equal(
      answer.expected,
      null,
      `the record carries no expected control, so the answer may name none, and it names ${JSON.stringify(answer.expected)}`,
    );
    assert.equal(
      banned(answer),
      null,
      `the answer carries ${JSON.stringify(banned(answer))}, and a state that cannot tell names no remedy, no cause and no control the record did not carry`,
    );
    assert.deepEqual(inventedIn(answer, record), []);
  });

  it('a row carrying no hosted fact at all is cannot-tell naming that fact, not no-host', () => {
    const answer = fieldBinder(
      recordWith('policyNumber', (row) => {
        delete row.hosted;
      }),
    );
    assert.equal(
      answer.state,
      'cannot-tell',
      `a record that says nothing about hosting is not a record that states the field hosts nothing, and the join answers ${JSON.stringify(answer.state)}`,
    );
    assert.equal(
      answer.reason,
      'hosted-not-recorded',
      `the absence of the fact and the fact of an absence are different answers, and this one names ${JSON.stringify(answer.reason)}`,
    );
  });

  it('a record carrying several fields and no field named is cannot-tell, not a guess', () => {
    const answer = fieldBinder(RECORD);
    assert.equal(
      answer.state,
      'cannot-tell',
      `the committed record carries ${String(RECORD.fields.length)} fields, so the join has nothing to choose from and answers ${JSON.stringify(answer.state)}`,
    );
    assert.equal(
      answer.reason,
      'field-not-chosen',
      `the fact the answer is missing is which field to bind, and it names ${JSON.stringify(answer.reason)}`,
    );
    assert.equal(answer.field, null);
    assert.equal(answer.hosted, null);
    assert.equal(answer.expected, null);
  });

  it('a field the record does not carry is cannot-tell, and names no control', () => {
    const answer = fieldBinder(RECORD, { field: 'premium' });
    assert.equal(answer.state, 'cannot-tell');
    assert.equal(
      answer.reason,
      'no-field-entry',
      `the record carries no premium row, and the answer names ${JSON.stringify(answer.reason)}`,
    );
    assert.deepEqual(inventedIn(answer, RECORD), []);
  });

  it('an expected fact of a shape that is not a control name is not read as a control', () => {
    const answer = fieldBinder(
      recordWith('customer', (row) => {
        row.expected = { read: true, value: { tag: 'p-select' } };
      }),
    );
    assert.equal(
      answer.state,
      'cannot-tell',
      `a control is named as a string, and an object that happens to hold a tag is not a name the join will read; it answered ${JSON.stringify(answer.state)}`,
    );
    assert.equal(
      answer.reason,
      'expected-not-a-control',
      `the answer names the fact it could not read, and it names ${JSON.stringify(answer.reason)}`,
    );
    assert.deepEqual(
      answer.expected,
      { tag: 'p-select' },
      `the answer quotes the unusable fact as the record carries it, and it names ${JSON.stringify(answer.expected)}`,
    );
  });

  it('purity: reads a frozen record and frozen facts, writes neither, and points into neither', () => {
    const record = documentOf(
      (() => {
        const row = rowOf('customer');
        row.expected = expectedControl('input');
        return row;
      })(),
    );
    deepFreeze(record);
    const facts = deepFreeze({ componentsField: true });
    let answer = null;
    assert.doesNotThrow(() => {
      answer = fieldBinder(record, facts);
    }, 'the join wrote to a frozen record or to frozen facts, so it is not a pure read');
    assert.equal(answer.state, 'mismatch');
    assert.notEqual(
      answer.hosted,
      record.fields[0].hosted.value,
      'the answer must quote the record, not point into it, so a caller cannot move the record by writing the answer',
    );
    answer.hosted.tag = 'mutated';
    assert.equal(
      record.fields[0].hosted.value.tag,
      'p-select',
      'the record moved when the answer was written, so the answer points into the record',
    );
    assert.deepEqual(
      answer.observed.hosted,
      record.fields[0].hosted,
      'observed must still quote the record after the answer was edited',
    );
    const frozenSource = JSON.stringify(record);
    fieldBinder(record, { field: 'customer' });
    assert.equal(
      JSON.stringify(record),
      frozenSource,
      'the join changed the record across two calls, so it holds state between them',
    );
  });
});

// ------------------------------------------------------ the pin and its mutants ----

describe('the pin and its mutants', () => {
  it('pins the untouched module first, so the mutants have something to move', () => {
    assert.doesNotThrow(
      () => pinJoin(fieldBinder),
      'the pin refuses the untouched module, so no mutant planted on it would mean anything',
    );
    const states = new Set(
      joinCases().map((one) => fieldBinder(one.record, one.facts).state),
    );
    assert.deepEqual(
      [...states].sort(),
      [...STATES].sort(),
      `the pin's cases answer ${JSON.stringify([...states].sort())}, and a pin that never reaches every state does not pin the join's states ${JSON.stringify([...STATES].sort())}`,
    );
    console.log(
      `the pin holds the untouched module to ${String(joinCases().length)} case(s), answering all ${String(STATES.length)} states`,
    );
  });

  it('AC1 mutant: a mismatch reporting only the hosted control reddens the pin, naming hosted without expected', () => {
    assert.doesNotThrow(
      () => pinJoin(fieldBinder),
      'the untouched module must pass the pin before the mutation is planted',
    );
    /** The join with one defect: a mismatch that names the hosted control and not the expected one. */
    const reportsOnlyHosted = (record, facts) => {
      const answer = fieldBinder(record, facts);
      if (answer === null || answer.state !== 'mismatch') return answer;
      return { ...answer, expected: null };
    };
    const failure = reddens(
      () => pinJoin(reportsOnlyHosted),
      'a mismatch that reports only the hosted control',
    );
    assert.match(
      failure.message,
      /must name both controls/,
      `the refusal must say that a mismatch names both controls; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.ok(
      failure.message.includes('hosted') &&
        failure.message.includes('expected'),
      `the refusal must name the hosted control and the expected control; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.match(
      failure.message,
      /reports expected as null/,
      `the refusal must name what the mutant dropped; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.doesNotThrow(
      () => pinJoin(fieldBinder),
      'the pin must pass the untouched module after the mutant is proved',
    );
    console.log(`mismatch mutant: ${failure.message}`);
  });

  it('AC2 mutant: a join that infers a host from a label reddens the pin, naming the inference', () => {
    assert.doesNotThrow(
      () => pinJoin(fieldBinder),
      'the untouched module must pass the pin before the mutation is planted',
    );
    /** The join with one defect: a host made up out of the field's own name. */
    const infersHostFromLabel = (record, facts) => {
      const answer = fieldBinder(record, facts);
      if (answer === null || answer.state !== 'no-host') return answer;
      return {
        ...answer,
        hosted: {
          tag: 'input',
          attribute: { name: 'id', value: answer.field },
        },
      };
    };
    const failure = reddens(
      () => pinJoin(infersHostFromLabel),
      'a join that infers a host from a label',
    );
    assert.match(
      failure.message,
      /inferred from the field's identity/,
      `the refusal must say that the control was inferred from the field's own identity; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.ok(
      failure.message.includes('label'),
      `the refusal must name the inference as a label read; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.ok(
      failure.message.includes('"input"'),
      `the refusal must name the control the mutant invented; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.doesNotThrow(
      () => pinJoin(fieldBinder),
      'the pin must pass the untouched module after the mutant is proved',
    );
    console.log(`inferred-host mutant: ${failure.message}`);
  });

  it('AC3 mutant: a join that names a remedy reddens the pin, naming the remedy', () => {
    assert.doesNotThrow(
      () => pinJoin(fieldBinder),
      'the untouched module must pass the pin before the mutation is planted',
    );
    const remedy =
      'add a control library to package.json so the record can name the expected control';
    /** The join with one defect: a state that cannot tell, followed by what to do about it. */
    const namesARemedy = (record, facts) => {
      const answer = fieldBinder(record, facts);
      if (answer === null || answer.state !== 'cannot-tell') return answer;
      return { ...answer, remedy: remedy };
    };
    const failure = reddens(
      () => pinJoin(namesARemedy),
      'a join that names a remedy',
    );
    assert.match(
      failure.message,
      /names a remedy/,
      `the refusal must say that a remedy is what it found; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.ok(
      failure.message.includes(remedy),
      `the refusal must name the remedy the mutant added; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.ok(
      failure.message.includes(
        'no answer carries a remedy, a cause or a control the record did not contain',
      ),
      `the refusal must state what no answer may carry; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.doesNotThrow(
      () => pinJoin(fieldBinder),
      'the pin must pass the untouched module after the mutant is proved',
    );
    console.log(`remedy mutant: ${failure.message}`);
  });

  it('the three mutants are three different defects, each caught by the pin it names', () => {
    const mutant = {
      onlyHosted: (answer) =>
        answer.state === 'mismatch' ? { ...answer, expected: null } : answer,
      inferHost: (answer) =>
        answer.state === 'no-host'
          ? {
              ...answer,
              hosted: {
                tag: 'input',
                attribute: { name: 'id', value: answer.field },
              },
            }
          : answer,
      remedy: (answer) =>
        answer.state === 'cannot-tell'
          ? { ...answer, remedy: 'read it again' }
          : answer,
    };
    const caught = [];
    for (const [name, decorate] of Object.entries(mutant)) {
      const decorated = (record, facts) => decorate(fieldBinder(record, facts));
      try {
        pinJoin(decorated);
      } catch (error) {
        caught.push(name);
      }
    }
    assert.deepEqual(
      caught.sort(),
      ['inferHost', 'onlyHosted', 'remedy'],
      `the pin caught ${JSON.stringify(caught.sort())}, and it must catch all three defects: one mutant standing for another would hide a defect behind a passing test`,
    );
    const untouched = RECORD_TEXT.length;
    assert.ok(
      untouched > 0,
      'the committed record was read for these mutants and was never rewritten',
    );
    console.log(
      `three mutants, three defects: ${JSON.stringify(caught.sort())} each redden the pin; the record was neither rewritten nor re-captured`,
    );
  });
});
