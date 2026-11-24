// Tests for extension/schema-attribution.js — the join between the record T001
// writes (`research/raw/m066-schema-record.json`, measured on the Insurance
// Portal) and the four attribution states a surface may state.
//
// The join is read here as it ships, and the record is the committed one: the
// facts are T001's own measurement, never a fixture rewritten to suit the join.
// The four states are pinned exactly, and so are the three rules that make the
// join honest:
//
//   no-record    a record that is absent, does not parse, or parses to
//                something that is not an object. Nothing about a field is
//                stated, because every other state is a statement about a
//                record.
//   declared     the record carries a schema node naming the field and the
//                input that node read. Only this state carries `node` and
//                `input`, and `reason` is null because nothing is absent.
//   no-node      the record carries no schema node naming the field. This is
//                the state the committed record produces for all four of its
//                fields, because the schema is absent — and it must not read as
//                a failure of the field, so the reason is checked for the words
//                a failure would use.
//   cannot-tell  the input a node read was not recorded (or the facts name no
//                field, or a field the join does not read). `reason` names what
//                is missing, and `node` stays null: a node is never carried
//                without the input that node read.
//
// The field's own state is never invented. `observed` is the record's row
// copied unchanged — `null` stays `null`, `stateRead: false` stays `false` —
// and a `facts` object stuffed with a whole state of its own changes nothing.
//
// Non-vacuity. Each of the four states is proven in four phases: the pin is run
// against the untouched module first, then against a mutant of the module source
// which is asserted to exhibit the defect the pin hunts, then the pin is
// asserted to redden on that mutant with a failure message that is the exact
// string printed below, then the untouched module is pinned again. Three more
// mutant blocks guard the rules that are not states: the single list of field
// names, the row that cannot be invented, and an input read as `false`, which
// was read and is therefore recorded. A mutant that survives its pin, or that
// reddens with a message that does not name the defect in the exact words
// asserted, fails this suite.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  FIELD_NAMES,
  REASONS,
  schemaAttribution,
} from '../extension/schema-attribution.js';

const SRC = readFileSync(
  new URL('../extension/schema-attribution.js', import.meta.url),
  'utf8',
);
const RECORD = JSON.parse(
  readFileSync(
    new URL('../research/raw/m066-schema-record.json', import.meta.url),
    'utf8',
  ),
);

// ------------------------------------------------------------ measured facts ----

/** The six keys the contract names, in the order the join returns them. */
const CONTRACT_KEYS = ['state', 'field', 'node', 'input', 'reason', 'observed'];

/** The four states, in the precedence order the contract states. */
const STATES = ['no-record', 'declared', 'no-node', 'cannot-tell'];

/** The injector holder T001 looked for a schema through; carried unchanged. */
const HOLDER = 'router.navigationTransitions.environmentInjector';

/** The committed record's own rows, by field name. */
function rowOf(field) {
  const row = RECORD.fields.find((entry) => entry.field === field);
  assert.ok(row, `the committed record must carry a row for ${field}`);
  return row;
}

// ---------------------------------------------------------------- plumbing ----

/** A value copied into this realm, so a test can never mutate the record. */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** What the caller knows: the name of the field to attribute. */
function fact(field) {
  return { field };
}

/** The committed record with its schema and inputs replaced. */
function recordWith(schema, inputs) {
  const record = clone(RECORD);
  record.schema = schema;
  record.inputs = inputs;
  return record;
}

/** T001's resolved schema shape: one `{ node, input }` per node it read. */
function schemaWith(node, input) {
  return {
    absent: false,
    holder: HOLDER,
    nodes: [{ node: node, input: input }],
  };
}

/** A record in which the field's node read the input — T001's declared shape. */
function declaredRecord(field, input) {
  return recordWith(schemaWith(field, input), [{ node: field, input: input }]);
}

/** A record that names the node and records no input row for it at all. */
function recordWithNodeButNoInputRow(field) {
  return recordWith(schemaWith(field, null), []);
}

/** A record that names the node and records its input as null. */
function recordWithNodeAndNullInput(field) {
  return recordWith(schemaWith(field, null), [{ node: field, input: null }]);
}

/** A record that resolved a schema and names a node for another field only. */
function recordWithOtherNode(field, other, input) {
  const schema = schemaWith(other, input);
  return recordWith(schema, [{ node: other, input: input }]);
}

/** The committed record with one row removed: a field the record does not carry. */
function recordWithoutRow(field) {
  const record = clone(RECORD);
  record.fields = record.fields.filter((row) => row.field !== field);
  return record;
}

/** JSON text of a record, cut before it closes: text that does not parse. */
const UNPARSEABLE =
  '{"recordSchema": "m066-schema-record/v1", "milestone": "M066",';

// ------------------------------------------------------------- mutant tools ----

/**
 * The module source evaluated as a script, so a mutated copy can be built
 * without writing a file. The only edit is the `export ` prefix, stripped so
 * the same bodies become a returned namespace; a source that kept one would
 * fail the guard below rather than silently test a different module.
 */
function build(source) {
  const body = source.replace(/^export /gm, '');
  assert.ok(
    !/^export /m.test(body),
    'the harness must strip every export before evaluating the module source',
  );
  const factory = new Function(
    `${body}\nreturn { FIELD_NAMES, REASONS, schemaAttribution };`,
  );
  return factory();
}

/**
 * A copy of the module with one anchored replacement applied. The anchor must
 * occur exactly once, so a mutation cannot silently rewrite a different branch,
 * and the result must differ from the source, so a no-op mutation is a failure
 * rather than a green mutant.
 */
function mutant(anchor, replacement) {
  assert.ok(
    SRC.includes(anchor),
    `mutation anchor not found in extension/schema-attribution.js — restate the bite: ${JSON.stringify(anchor)}`,
  );
  const occurrences = SRC.split(anchor).length - 1;
  assert.equal(
    occurrences,
    1,
    `mutation anchor must occur exactly once, found ${occurrences}: ${JSON.stringify(anchor)}`,
  );
  const mutated = SRC.replace(anchor, replacement);
  assert.notEqual(mutated, SRC, 'the mutation must change the module source');
  return build(mutated);
}

/** The first line of a failure — the message the pin stated, with no diff. */
function firstLine(error) {
  return error.message.split('\n')[0];
}

/** A pin that a value reddens: returns the failure the pin raises on it. */
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

/**
 * The four phases, per rule. `pin` is the same function for the untouched
 * module and for every mutant; a mutation that survives it, or that reddens with
 * a message other than the exact string it names, fails. Returns one
 * `mutant -> failure` line per mutation so the run prints its own evidence.
 */
function proveNonVacuous(pin, mutations) {
  // 1. Pin the untouched module on the behaviour claimed.
  pin(build(SRC));

  const caught = [];
  for (const mutation of mutations) {
    // 2. Mutate a copy of the module source and prove the copy exhibits the
    //    defect the pin hunts.
    const api = mutant(mutation.anchor, mutation.replacement);
    mutation.defect(api);

    // 3. Assert the pin reddens, and that the failure is the exact string.
    const failure = reddens(() => pin(api), mutation.what);
    assert.equal(
      firstLine(failure),
      mutation.message,
      `${mutation.what} must redden with the exact failure string it names: ${JSON.stringify(failure.message)}`,
    );
    caught.push(`${mutation.what} -> ${firstLine(failure)}`);
  }

  // 4. Restore: the untouched module still satisfies the pin.
  pin(build(SRC));
  return caught;
}

// ------------------------------------------------------------------ the pins ----

/**
 * AC1, state 1. A record that is absent, does not parse, or parses to something
 * that is not an object states no-record with its reason: no schema state is
 * guessed off a value that is not a record.
 */
function pinNoRecord(api) {
  const absent = clone(api.schemaAttribution(null, fact('policyNumber')));
  assert.equal(
    absent.state,
    'no-record',
    'NO-RECORD ABSENT: nothing at all must state no-record, never a state about a field',
  );
  assert.equal(
    absent.reason,
    'no-record: no record was passed, so no schema attribution is stated',
    'NO-RECORD ABSENT REASON: the reason must name the absence of a record',
  );
  assert.equal(
    absent.field,
    'policyNumber',
    'NO-RECORD FIELD: the field asked about is echoed',
  );
  assert.equal(
    absent.node,
    null,
    'NO-RECORD NODE: no node is read off no record',
  );
  assert.equal(
    absent.input,
    null,
    'NO-RECORD INPUT: no input is read off no record',
  );
  assert.equal(
    absent.observed,
    null,
    'NO-RECORD OBSERVED: no row is read off no record',
  );

  const unparseable = clone(
    api.schemaAttribution(UNPARSEABLE, fact('policyNumber')),
  );
  assert.equal(
    unparseable.state,
    'no-record',
    'NO-RECORD PARSE: a record that does not parse must state no-record, never a state read off a string',
  );
  assert.equal(
    unparseable.reason,
    'no-record: the record does not parse, so no schema attribution is stated',
    'NO-RECORD PARSE REASON: the reason must name that the record does not parse',
  );
  assert.equal(
    unparseable.observed,
    null,
    'NO-RECORD PARSE OBSERVED: no row is read',
  );

  const notObject = clone(api.schemaAttribution('[]', fact('policyNumber')));
  assert.equal(
    notObject.state,
    'no-record',
    'NO-RECORD SHAPE: JSON that parses to an array is not a record, so the state is no-record',
  );
  assert.equal(
    notObject.observed,
    null,
    'NO-RECORD SHAPE OBSERVED: no row is read',
  );
}

/**
 * AC1, state 2. A record that carries the field's schema node and the input
 * that node read states declared, carrying both and no reason — and the record
 * may be handed over as the JSON text of the file it was read from.
 */
function pinDeclared(api) {
  const record = declaredRecord('policyNumber', 'disabled');

  const asText = clone(
    api.schemaAttribution(JSON.stringify(record), fact('policyNumber')),
  );
  assert.deepEqual(
    asText,
    clone(api.schemaAttribution(record, fact('policyNumber'))),
    'DECLARED TEXT: the JSON text of a record states what the record states',
  );

  const result = clone(api.schemaAttribution(record, fact('policyNumber')));
  assert.equal(
    result.state,
    'declared',
    'DECLARED: a record carrying the node and the input it read must state declared, never no-node',
  );
  assert.equal(
    result.field,
    'policyNumber',
    'DECLARED FIELD: the field asked about is echoed',
  );
  assert.equal(
    result.node,
    'policyNumber',
    'DECLARED NODE: the node the record names is carried',
  );
  assert.equal(
    result.input,
    'disabled',
    'DECLARED INPUT: the input that node read is carried',
  );
  assert.equal(
    result.reason,
    null,
    'DECLARED REASON: a declaration carries no reason',
  );
  assert.deepEqual(
    result.observed,
    {
      element: 'input',
      id: 'policyNumber',
      disabled: false,
      hidden: false,
      stateRead: true,
      reason: null,
    },
    'DECLARED OBSERVED: the record row is copied unchanged',
  );
  assert.deepEqual(
    Object.keys(result),
    CONTRACT_KEYS,
    'DECLARED KEYS: the six keys the contract names, in order',
  );

  const other = clone(api.schemaAttribution(record, fact('customer')));
  assert.equal(
    other.state,
    'no-node',
    'DECLARED PER FIELD: a node naming policyNumber attributes nothing to customer',
  );
}

/**
 * AC1, state 3. The committed record carries no schema node for any of its four
 * fields, so every field states no-node — with null node and input, and a
 * reason that says so and does not read as a failure of the field.
 */
function pinNoNode(api) {
  const result = clone(api.schemaAttribution(RECORD, fact('policyNumber')));
  assert.equal(
    result.state,
    'no-node',
    'NO-NODE: the committed record states the schema is absent, so a field it carries no node for must state no-node, never cannot-tell — an absent schema is a measurement, not a failure of the field',
  );
  assert.equal(
    result.node,
    null,
    'NO-NODE NODE: no node is carried without its input',
  );
  assert.equal(
    result.input,
    null,
    'NO-NODE INPUT: no input is carried without a node',
  );
  assert.equal(
    result.reason,
    'no-node: the record carries no schema node naming "policyNumber"; the record states the schema is absent (schema.absent is true); the field\'s own state is stated without attribution',
    'NO-NODE REASON: the reason names the field and what the record states',
  );
  assert.doesNotMatch(
    result.reason,
    /fail|defect|error|unreadable|missing|cannot|refus/i,
    'NO-NODE NOT-A-FAILURE: the absence of a node is not a failure of the field',
  );
  assert.deepEqual(
    result.observed,
    {
      element: 'input',
      id: 'policyNumber',
      disabled: false,
      hidden: false,
      stateRead: true,
      reason: null,
    },
    'NO-NODE OBSERVED: the record row is copied unchanged',
  );

  for (const field of FIELD_NAMES) {
    const fieldResult = clone(api.schemaAttribution(RECORD, fact(field)));
    assert.equal(
      fieldResult.state,
      'no-node',
      `NO-NODE EVERY FIELD: ${field} carries no node in the committed record`,
    );
    assert.ok(
      fieldResult.reason.includes(`naming "${field}"`),
      `NO-NODE EVERY FIELD REASON: ${field}'s reason names the field`,
    );
    assert.equal(fieldResult.node, null, `NO-NODE EVERY FIELD NODE: ${field}`);
    assert.equal(
      fieldResult.input,
      null,
      `NO-NODE EVERY FIELD INPUT: ${field}`,
    );
  }

  const noRow = clone(
    api.schemaAttribution(recordWithoutRow('status'), fact('status')),
  );
  assert.equal(
    noRow.state,
    'no-node',
    'NO-NODE NO ROW: a field the record carries no row for still states no-node',
  );
  assert.equal(
    noRow.observed,
    null,
    'NO-NODE NO ROW OBSERVED: no row is invented',
  );
  assert.equal(
    noRow.reason,
    'no-node: the record carries no schema node naming "status"; the record states the schema is absent (schema.absent is true); the record carries no field row naming it either, so the field\'s own state is not stated',
    'NO-NODE NO ROW REASON: the reason names the missing row too',
  );

  const resolved = clone(
    api.schemaAttribution(
      recordWithOtherNode('policyNumber', 'customer', 'disabled'),
      fact('policyNumber'),
    ),
  );
  assert.equal(
    resolved.state,
    'no-node',
    'NO-NODE RESOLVED SCHEMA: a schema that names another field is not a node for this one',
  );
  assert.equal(
    resolved.reason,
    'no-node: the record carries no schema node naming "policyNumber"; the record\'s schema section carries no node naming this field; the field\'s own state is stated without attribution',
    'NO-NODE RESOLVED SCHEMA REASON: the reason names what the schema section carries',
  );
}

/**
 * AC1, state 4. A record that names a node and records no input for it states
 * cannot-tell with the reason naming what is missing, and carries neither the
 * node nor an input.
 */
function pinCannotTell(api) {
  for (const record of [
    recordWithNodeButNoInputRow('policyNumber'),
    recordWithNodeAndNullInput('policyNumber'),
  ]) {
    const result = clone(api.schemaAttribution(record, fact('policyNumber')));
    assert.equal(
      result.state,
      'cannot-tell',
      'CANNOT-TELL: a record that names a node and records no input for it must state cannot-tell, never declared',
    );
    assert.equal(
      result.node,
      null,
      'CANNOT-TELL NODE: a node is never carried without the input that node read',
    );
    assert.equal(
      result.input,
      null,
      'CANNOT-TELL INPUT: an input the record does not carry is not invented',
    );
    assert.equal(
      result.reason,
      'cannot-tell: the record names a schema node for the field "policyNumber" but records no input for that node, so the node\'s reading is not a declaration',
      'CANNOT-TELL REASON: the reason names the input that is missing',
    );
    assert.deepEqual(
      Object.keys(result),
      CONTRACT_KEYS,
      'CANNOT-TELL KEYS: the six keys the contract names, in order',
    );
  }

  const noField = clone(api.schemaAttribution(RECORD, {}));
  assert.equal(
    noField.state,
    'cannot-tell',
    'CANNOT-TELL NO FIELD: facts that name no field cannot attribute one',
  );
  assert.equal(
    noField.field,
    null,
    'CANNOT-TELL NO FIELD NAME: no field name is invented',
  );
  assert.equal(
    noField.reason,
    'cannot-tell: the facts name no field, so no schema attribution is stated',
    'CANNOT-TELL NO FIELD REASON: the reason names the missing field',
  );
}

/** The single list's teeth: a field outside the declared list has no state. */
function pinOutOfListField(api) {
  const result = clone(api.schemaAttribution(RECORD, fact('unitPrice')));
  assert.equal(
    result.state,
    'cannot-tell',
    'SINGLE LIST: a field outside the declared list must state cannot-tell, never no-node — the join reads four field names and no fifth',
  );
  assert.equal(
    result.reason,
    'cannot-tell: the facts name the field "unitPrice", which is not one of the 4 field names the join reads (policyNumber, insuranceStartOn, customer, status), so no schema attribution is stated',
    'SINGLE LIST REASON: the reason names the list the join reads',
  );
  assert.equal(
    result.observed,
    null,
    'SINGLE LIST OBSERVED: a field the record does not carry has no row',
  );
}

/** A `facts` object carrying a whole state of its own changes nothing. */
function pinFactsCannotWriteState(api) {
  const decoy = {
    field: 'policyNumber',
    element: 'invented',
    id: 'invented',
    disabled: true,
    hidden: true,
    stateRead: true,
    node: 'invented',
    input: 'invented',
    reason: 'invented',
    observed: { disabled: true, hidden: true, stateRead: true },
  };
  const result = clone(api.schemaAttribution(RECORD, decoy));
  assert.equal(
    result.state,
    'no-node',
    'INVENTED FACTS: a facts object cannot state a node the record does not carry',
  );
  assert.deepEqual(
    result.observed,
    {
      element: 'input',
      id: 'policyNumber',
      disabled: false,
      hidden: false,
      stateRead: true,
      reason: null,
    },
    'INVENTED STATE: observed must be the record row copied unchanged, never what the facts carry',
  );
  assert.equal(
    result.node,
    null,
    'INVENTED NODE: the facts name no node the record carries',
  );
  assert.equal(
    result.input,
    null,
    'INVENTED INPUT: the facts name no input the record carries',
  );
  assert.equal(
    JSON.stringify(result).includes('invented'),
    false,
    'INVENTED ANYWHERE: nothing the facts carry reaches the result',
  );
}

/** An input read as `false` was read: recording it is not the same as truth. */
function pinInputRecordedAsFalse(api) {
  const result = clone(
    api.schemaAttribution(
      declaredRecord('policyNumber', false),
      fact('policyNumber'),
    ),
  );
  assert.equal(
    result.state,
    'declared',
    'INPUT PRESENCE: a node whose input was recorded as false read something, so it must state declared, never cannot-tell',
  );
  assert.equal(
    result.input,
    false,
    'INPUT VALUE: the input a node read is carried as the record states it, false included',
  );
  assert.equal(
    result.reason,
    null,
    'INPUT PRESENCE REASON: a declaration carries no reason',
  );
}

// ------------------------------------------------------- the states, pinned ----

describe('the committed record, joined', () => {
  it('is the M066 T001 record on the Insurance Portal', () => {
    assert.equal(RECORD.recordSchema, 'm066-schema-record/v1');
    assert.equal(RECORD.milestone, 'M066');
    assert.equal(RECORD.task, 'T001');
    assert.equal(RECORD.target.name, 'Insurance Portal');
    assert.equal(RECORD.page.route, '/contract/create');
    assert.equal(
      RECORD.schema.absent,
      true,
      'the committed record states the schema is absent',
    );
    assert.deepEqual(RECORD.inputs, [], 'an absent schema records no input');
    assert.equal(
      RECORD.fields.length,
      4,
      'the record carries the four fields its field tree names',
    );
  });

  it('reads the field names the record carries, in the record order', () => {
    assert.deepEqual(
      [...FIELD_NAMES],
      RECORD.fields.map((row) => row.field),
      'the declared list is exactly the record the join reads',
    );
  });

  it('states no-node for every field, because the schema is absent', () => {
    for (const field of FIELD_NAMES) {
      const result = schemaAttribution(RECORD, fact(field));
      assert.equal(result.state, 'no-node', `${field} states no-node`);
      assert.equal(result.field, field, `${field} is echoed`);
      assert.equal(result.node, null, `${field} carries no node`);
      assert.equal(result.input, null, `${field} carries no input`);
      assert.equal(
        result.reason.split(':')[0],
        'no-node',
        `${field}'s reason names its state`,
      );
      assert.match(
        result.reason,
        new RegExp(`naming "${field}"`),
        `${field}'s reason names the field`,
      );
      assert.match(
        result.reason,
        /the record states the schema is absent \(schema\.absent is true\)/,
        `${field}'s reason names what the record states`,
      );
      assert.doesNotMatch(
        result.reason,
        /fail|defect|error|unreadable|missing|cannot|refus/i,
        `${field}'s no-node does not read as a failure`,
      );
    }
  });

  it('copies each row unchanged into observed, nulls and all', () => {
    for (const field of FIELD_NAMES) {
      const row = rowOf(field);
      const result = schemaAttribution(RECORD, fact(field));
      assert.deepEqual(
        result.observed,
        {
          element: row.element,
          id: row.id,
          disabled: row.disabled,
          hidden: row.hidden,
          stateRead: row.stateRead,
          reason: row.reason,
        },
        `${field}'s row is copied key for key`,
      );
      assert.equal(
        result.observed.stateRead,
        row.stateRead,
        `${field}'s stateRead is the record's, not upgraded`,
      );
      assert.equal(
        result.observed.disabled,
        row.disabled,
        `${field}'s disabled is the record's, never a boolean invented from null`,
      );
    }
  });

  it('states status from the field tree, not from an element', () => {
    const row = rowOf('status');
    const result = schemaAttribution(RECORD, fact('status'));
    assert.equal(
      row.element,
      null,
      'the record measured no element carrying status',
    );
    assert.equal(
      result.observed.element,
      null,
      'the row states the field tree held it',
    );
    assert.equal(
      result.observed.stateRead,
      false,
      'the element reading was not available',
    );
    assert.equal(result.observed.disabled, null, 'a null disabled stays null');
    assert.equal(result.observed.hidden, null, 'a null hidden stays null');
    assert.equal(
      result.observed.reason,
      row.reason,
      "the record's own reason is copied, and it names the field tree",
    );
    assert.match(result.observed.reason, /field tree/);
  });

  it('leaves the record it was handed untouched', () => {
    const before = JSON.stringify(RECORD);
    const first = schemaAttribution(RECORD, fact('customer'));
    const second = schemaAttribution(RECORD, fact('customer'));
    assert.deepEqual(
      first,
      second,
      'the same record and facts state the same answer',
    );
    assert.equal(
      JSON.stringify(RECORD),
      before,
      'the join writes nothing back',
    );
  });
});

describe('the four states', () => {
  it('exports the precedence order the contract states', () => {
    assert.deepEqual([...REASONS], STATES);
    assert.equal(
      Object.isFrozen(REASONS),
      true,
      'the order cannot be rewritten',
    );
  });

  it('carries exactly the six keys the contract names, in order', () => {
    const facts = [
      [null, fact('policyNumber')],
      [declaredRecord('policyNumber', 'disabled'), fact('policyNumber')],
      [RECORD, fact('policyNumber')],
      [recordWithNodeButNoInputRow('policyNumber'), fact('policyNumber')],
    ];
    for (const [record, known] of facts) {
      const result = schemaAttribution(record, known);
      assert.deepEqual(
        Object.keys(result),
        CONTRACT_KEYS,
        `${result.state} carries the six keys in order`,
      );
      assert.deepEqual(
        JSON.parse(JSON.stringify(result)),
        clone(result),
        `${result.state} is plain data`,
      );
    }
  });

  it('never carries a node without the input that node read', () => {
    const cases = [
      [null, fact('policyNumber')],
      [declaredRecord('policyNumber', 'disabled'), fact('policyNumber')],
      [RECORD, fact('policyNumber')],
      [recordWithNodeButNoInputRow('policyNumber'), fact('policyNumber')],
      [recordWithNodeAndNullInput('policyNumber'), fact('policyNumber')],
      [RECORD, fact('unitPrice')],
      [RECORD, {}],
    ];
    for (const [record, known] of cases) {
      const result = schemaAttribution(record, known);
      assert.equal(
        result.node === null,
        result.input === null,
        `${result.state} for ${JSON.stringify(known)}: node and input are carried together or not at all`,
      );
      assert.equal(
        result.state === 'declared',
        result.node !== null,
        'only declared carries a node',
      );
    }
  });

  it('states no-record when there is no record', () => {
    pinNoRecord(build(SRC));
  });

  it('states declared when the record carries the node and its input', () => {
    pinDeclared(build(SRC));
  });

  it('states no-node when the record carries no node for the field', () => {
    pinNoNode(build(SRC));
  });

  it('states cannot-tell when the input a node read was not recorded', () => {
    pinCannotTell(build(SRC));
  });

  it('ignores what the facts cannot know', () => {
    pinFactsCannotWriteState(build(SRC));
  });
});

// ------------------------------------------------------------ the single list ----

describe('the single list of field names', () => {
  it('declares the four names once, and nothing else', () => {
    assert.deepEqual(
      [...FIELD_NAMES],
      ['policyNumber', 'insuranceStartOn', 'customer', 'status'],
    );
    assert.equal(FIELD_NAMES.length, 4, 'the list is read through the proxy');
    assert.equal(
      Object.isFrozen(FIELD_NAMES),
      true,
      'the list cannot be extended',
    );
  });

  it('throws on a write through the proxy, naming the write', () => {
    let failure = null;
    try {
      FIELD_NAMES[0] = 'invented';
    } catch (error) {
      failure = error;
    }
    assert.ok(failure instanceof Error, 'a write of an index must be refused');
    assert.equal(
      failure.message,
      'field-list-is-single-writer: extension/schema-attribution.js declares the 4 field names the join reads (policyNumber, insuranceStartOn, customer, status); a write of "invented" to 0 was refused',
      'the refusal names the list, the write and the writer',
    );

    assert.throws(
      () => FIELD_NAMES.push('invented'),
      /field-list-is-single-writer/,
      'a second writer cannot append a field',
    );
    assert.throws(
      () => {
        FIELD_NAMES.length = 0;
      },
      /field-list-is-single-writer/,
      'a second writer cannot empty the list',
    );
    assert.deepEqual(
      [...FIELD_NAMES],
      ['policyNumber', 'insuranceStartOn', 'customer', 'status'],
      'the refused writes left the list as it was',
    );
  });

  it('is the only source of the field names the join reads', () => {
    pinOutOfListField(build(SRC));
  });
});

// -------------------------------------------------------------------- purity ----

describe('the join is pure', () => {
  it('imports nothing and names no DOM, clock or network', () => {
    const forbidden = [
      /\bimport\b/,
      /\brequire\s*\(/,
      /\bdocument\b/,
      /\bwindow\b/,
      /\bglobalThis\b/,
      /\bprocess\b/,
      /\bDate\b/,
      /\bperformance\b/,
      /\bfetch\s*\(/,
      /\bXMLHttpRequest\b/,
      /\bsetTimeout\b/,
      /\bsetInterval\b/,
      /\bchrome\b/,
      /\baddEventListener\b/,
    ];
    for (const pattern of forbidden) {
      assert.doesNotMatch(
        SRC,
        pattern,
        `extension/schema-attribution.js must not name ${pattern}`,
      );
    }
  });

  it('exports the two lists and the one join, and nothing else', async () => {
    const api = await import('../extension/schema-attribution.js');
    assert.deepEqual(Object.keys(api).sort(), [
      'FIELD_NAMES',
      'REASONS',
      'schemaAttribution',
    ]);
    assert.equal(typeof api.schemaAttribution, 'function');
  });

  it('is the module the harness evaluates, not a copy of it', () => {
    for (const field of FIELD_NAMES) {
      assert.deepEqual(
        clone(build(SRC).schemaAttribution(RECORD, fact(field))),
        clone(schemaAttribution(RECORD, fact(field))),
        `the evaluated copy states what the imported module states for ${field}`,
      );
    }
  });
});

// --------------------------------------------------------------- mutant blocks ----

describe('one mutant per state, each proven non-vacuous', () => {
  it('holds no-record: a mutant that joins a string as a record reddens', (t) => {
    const caught = proveNonVacuous(pinNoRecord, [
      {
        what: 'the no-record guard skips parsing and joins the string',
        anchor: '      return asRecord(JSON.parse(record));',
        replacement: '      return record;',
        defect: (api) => {
          const wrong = api.schemaAttribution(
            UNPARSEABLE,
            fact('policyNumber'),
          );
          assert.equal(
            wrong.state,
            'no-node',
            'the mutant must exhibit the defect: it reads unparseable text as a record and states no-node',
          );
        },
        message:
          'NO-RECORD PARSE: a record that does not parse must state no-record, never a state read off a string',
      },
    ]);
    for (const line of caught) t.diagnostic(line);
  });

  it('holds declared: a mutant that never declares reddens', (t) => {
    const caught = proveNonVacuous(pinDeclared, [
      {
        what: 'the declared state is removed and a declaration answers no-node',
        anchor:
          '    return attribution(DECLARED, field, node, input.value, null, observed);',
        replacement:
          '    return attribution(NO_NODE, field, null, null, noNodeReason(parsed, field, row !== null), observed);',
        defect: (api) => {
          const wrong = api.schemaAttribution(
            declaredRecord('policyNumber', 'disabled'),
            fact('policyNumber'),
          );
          assert.equal(
            wrong.state,
            'no-node',
            'the mutant must exhibit the defect: a complete declaration answers no-node',
          );
        },
        message:
          'DECLARED: a record carrying the node and the input it read must state declared, never no-node',
      },
    ]);
    for (const line of caught) t.diagnostic(line);
  });

  it('holds no-node: a mutant that cannot tell an absent schema from a gap reddens', (t) => {
    const caught = proveNonVacuous(pinNoNode, [
      {
        what: 'the no-node branch is removed and an absent schema answers cannot-tell',
        anchor: '  if (isReadField(field) && node === null) {',
        replacement: '  if (false) {',
        defect: (api) => {
          const wrong = api.schemaAttribution(RECORD, fact('policyNumber'));
          assert.equal(
            wrong.state,
            'cannot-tell',
            'the mutant must exhibit the defect: the committed record reads as cannot-tell',
          );
        },
        message:
          'NO-NODE: the committed record states the schema is absent, so a field it carries no node for must state no-node, never cannot-tell — an absent schema is a measurement, not a failure of the field',
      },
    ]);
    for (const line of caught) t.diagnostic(line);
  });

  it('holds cannot-tell: a mutant that upgrades a node without its input reddens', (t) => {
    const caught = proveNonVacuous(pinCannotTell, [
      {
        what: 'the input that node read is no longer required to declare',
        anchor:
          '  if (isReadField(field) && node !== null && input.recorded) {',
        replacement: '  if (isReadField(field) && node !== null) {',
        defect: (api) => {
          const wrong = api.schemaAttribution(
            recordWithNodeButNoInputRow('policyNumber'),
            fact('policyNumber'),
          );
          assert.equal(
            wrong.state,
            'declared',
            'the mutant must exhibit the defect: a node without its input is declared',
          );
        },
        message:
          'CANNOT-TELL: a record that names a node and records no input for it must state cannot-tell, never declared',
      },
    ]);
    for (const line of caught) t.diagnostic(line);
  });

  it('holds the single list: a mutant that reads a fifth field reddens', (t) => {
    const caught = proveNonVacuous(pinOutOfListField, [
      {
        what: 'the no-node branch stops asking the one list whether it reads the field',
        anchor: '  if (isReadField(field) && node === null) {',
        replacement: '  if (node === null) {',
        defect: (api) => {
          const wrong = api.schemaAttribution(RECORD, fact('unitPrice'));
          assert.equal(
            wrong.state,
            'no-node',
            'the mutant must exhibit the defect: a field outside the list is attributed',
          );
        },
        message:
          'SINGLE LIST: a field outside the declared list must state cannot-tell, never no-node — the join reads four field names and no fifth',
      },
    ]);
    for (const line of caught) t.diagnostic(line);
  });

  it('holds the row: a mutant that copies the facts into observed reddens', (t) => {
    const caught = proveNonVacuous(pinFactsCannotWriteState, [
      {
        what: 'observed is taken from the facts instead of the record row',
        anchor: '  const observed = observedOf(row);',
        replacement: '  const observed = facts;',
        defect: (api) => {
          const wrong = api.schemaAttribution(RECORD, {
            field: 'policyNumber',
            disabled: true,
            hidden: true,
            stateRead: true,
          });
          assert.equal(
            wrong.observed.disabled,
            true,
            'the mutant must exhibit the defect: the facts reach observed',
          );
        },
        message:
          'INVENTED STATE: observed must be the record row copied unchanged, never what the facts carry',
      },
    ]);
    for (const line of caught) t.diagnostic(line);
  });

  it('holds the input: a mutant that reads presence as truth reddens', (t) => {
    const caught = proveNonVacuous(pinInputRecordedAsFalse, [
      {
        what: 'a recorded input of false is treated as no input',
        anchor:
          '  if (isReadField(field) && node !== null && input.recorded) {',
        replacement:
          '  if (isReadField(field) && node !== null && input.value) {',
        defect: (api) => {
          const wrong = api.schemaAttribution(
            declaredRecord('policyNumber', false),
            fact('policyNumber'),
          );
          assert.equal(
            wrong.state,
            'cannot-tell',
            'the mutant must exhibit the defect: an input read as false is answered cannot-tell',
          );
        },
        message:
          'INPUT PRESENCE: a node whose input was recorded as false read something, so it must state declared, never cannot-tell',
      },
    ]);
    for (const line of caught) t.diagnostic(line);
  });
});
