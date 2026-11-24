// extension/schema-attribution.js — the join between the record T001 writes
// (`research/raw/m066-schema-record.json`) and the four attribution states a
// surface may state.
//
// The join is pure: no DOM, no page, no clock, no network, no injector. It
// reads a record and the name of a field and answers one of four states, in the
// order REASONS carries them.
//
//   no-record    the record is absent or does not parse. Nothing else is
//                stated, because the other three states are statements about a
//                record and there is none to read.
//   declared     the record carries a schema node naming this field and the
//                input that node read. This is the only state that carries
//                `node` and `input`; `reason` is null, because nothing is
//                absent.
//   no-node      the record carries no schema node naming this field. `node`
//                and `input` are null and `reason` says so. The committed
//                record states the schema is absent, so every one of its four
//                fields answers this state — an absent schema is what the
//                record measured, and the state never reads as a failure of the
//                field.
//   cannot-tell  the record cannot let the join answer: the facts name no
//                field, name a field the join does not read, or name a node
//                whose input is not recorded. `reason` names what is missing.
//
// Three rules the suite holds this file to:
//
// - `node` is never carried without `input`. A record that names a node and
//   omits the input that node read is `cannot-tell`, never `declared`: a
//   declaration without its reading is not one, so a node present without an
//   input is nulled rather than half-stated.
// - The field's own state is never invented here. `observed` is the record's
//   own field row copied unchanged: `disabled` and `hidden` keep the values the
//   record holds, `null` stays `null`, and `stateRead: false` stays `false`. A
//   reading the record did not make is left absent rather than guessed, and
//   nothing the caller passes in `facts` can override what the row states.
//   `observed` carries the row's `element` unchanged too, which is how the
//   record itself states where the reading came from: an element name is an
//   element reading, `null` is no element at all — the field tree held it.
// - The field names the join reads are declared once, in FIELD_NAMES, and that
//   list is a Proxy whose `set` trap throws. A second writer of the field names
//   reddens by name instead of landing quietly beside this one.
//
// The record's own shape is T001's: `schema` is either
// `{ absent: true, reason }` or `{ absent: false, holder, nodes }` with one
// `{ node, input }` per schema node, and `inputs` is one `{ node, input }` per
// node that read one. `schemaSection` and `inputsOf` in
// `scripts/m066-schema-record.mjs` are the producer, and they copy exactly
// `node` and `input` — so a node's own name is the whole of what a record
// carries about which field it belongs to, and the join matches the field
// against the node name exactly. No other reading of a node is available, and
// none is invented.

/**
 * The field names the join reads — the one list, and the only source of them.
 *
 * The target is frozen and the `set` trap throws, so `FIELD_NAMES[0] = …`,
 * `FIELD_NAMES.push(…)` and `FIELD_NAMES.length = 0` all raise
 * `field-list-is-single-writer` naming the list and the write that was refused.
 * A second writer of the field names therefore fails at the write instead of
 * silently disagreeing with this one.
 *
 * @type {readonly string[]}
 */
export const FIELD_NAMES = new Proxy(
  Object.freeze(['policyNumber', 'insuranceStartOn', 'customer', 'status']),
  {
    /**
     * @param {readonly string[]} target
     * @param {string | symbol} property
     * @param {any} value
     * @returns {boolean}
     */
    set(target, property, value) {
      throw new Error(
        `field-list-is-single-writer: extension/schema-attribution.js declares the ${target.length} field names the join reads (${target.join(', ')}); a write of ${JSON.stringify(value)} to ${String(property)} was refused`,
      );
    },
  },
);

/**
 * The four states in the order they take precedence, as the contract states
 * them. The join applies them in this order, and the order is load-bearing:
 * `no-record` first, because the rest are statements about a record; `declared`
 * before `no-node`, because a record that carries the node and its input states
 * an attribution rather than its absence; `no-node` before `cannot-tell`,
 * because the absence of a node for a field the join reads is a stated absence,
 * not a gap the join has to name.
 *
 * @type {readonly string[]}
 */
export const REASONS = Object.freeze([
  'no-record',
  'declared',
  'no-node',
  'cannot-tell',
]);

const NO_RECORD = REASONS[0];
const DECLARED = REASONS[1];
const NO_NODE = REASONS[2];
const CANNOT_TELL = REASONS[3];

/** The keys of the field row that state the field's own reading, in row order. */
const OBSERVED_KEYS = [
  'element',
  'id',
  'disabled',
  'hidden',
  'stateRead',
  'reason',
];

/** @param {any} value */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** The value as a record, or null when it is not one. @param {any} value */
function asRecord(value) {
  return isObject(value) ? value : null;
}

/**
 * The record as an object, or null when it is absent or does not parse. JSON
 * text is accepted, so a caller may hand the join the file it read.
 *
 * @param {any} record
 * @returns {any}
 */
function parseRecord(record) {
  if (record === null || record === undefined) return null;
  if (typeof record === 'string') {
    try {
      return asRecord(JSON.parse(record));
    } catch {
      return null;
    }
  }
  return asRecord(record);
}

/**
 * The field the facts name, or null. `facts.field` is the whole of what the
 * join reads from the facts: everything else a caller passes there is ignored,
 * so no second source of the field's state can arrive that way.
 *
 * @param {any} facts
 * @returns {string | null}
 */
function fieldOf(facts) {
  if (!isObject(facts)) return null;
  const field = facts['field'];
  return typeof field === 'string' && field !== '' ? field : null;
}

/**
 * Whether the join reads this field name — asked of the one list, through the
 * proxy, so the list is the only source of the answer.
 *
 * @param {string | null} field
 * @returns {boolean}
 */
function isReadField(field) {
  return field !== null && FIELD_NAMES.includes(field);
}

/**
 * The record's own field row for this field, or null when the record carries
 * none.
 *
 * @param {any} record
 * @param {string | null} field
 * @returns {any}
 */
function rowFor(record, field) {
  const rows = Array.isArray(record['fields']) ? record['fields'] : [];
  for (const row of rows) {
    if (isObject(row) && row['field'] === field) return row;
  }
  return null;
}

/**
 * The field's own state, copied off the record's row unchanged. A key the row
 * does not carry is left out rather than filled in: the join states a reading
 * the record made or nothing at all.
 *
 * @param {any} row
 * @returns {Record<string, any> | null}
 */
function observedOf(row) {
  if (row === null) return null;
  /** @type {Record<string, any>} */
  const observed = {};
  for (const key of OBSERVED_KEYS) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      observed[key] = row[key];
    }
  }
  return observed;
}

/**
 * The name of the schema node the record carries for this field, or null. An
 * absent schema carries no node at all, so it answers null without looking.
 *
 * @param {any} record
 * @param {string | null} field
 * @returns {string | null}
 */
function nodeFor(record, field) {
  if (field === null) return null;
  const schema = record['schema'];
  if (!isObject(schema)) return null;
  if (schema['absent'] === true) return null;
  const nodes = Array.isArray(schema['nodes']) ? schema['nodes'] : [];
  for (const entry of nodes) {
    if (isObject(entry) && entry['node'] === field) return field;
  }
  return null;
}

/**
 * The input the node read, as the record's `inputs` section states it. Recorded
 * means present and not null: the input's value is never asked for a truth, so
 * a node that read `false` or `0` read something.
 *
 * @param {any} record
 * @param {string | null} node
 * @returns {{ recorded: boolean, value: any }}
 */
function inputFor(record, node) {
  if (node === null) return { recorded: false, value: null };
  const rows = Array.isArray(record['inputs']) ? record['inputs'] : [];
  for (const row of rows) {
    if (isObject(row) && row['node'] === node) {
      const value = row['input'];
      if (value === null || value === undefined) {
        return { recorded: false, value: null };
      }
      return { recorded: true, value: value };
    }
  }
  return { recorded: false, value: null };
}

/**
 * Why nothing is attributed when there is no record to read.
 *
 * @param {any} record
 * @returns {string}
 */
function absentRecordReason(record) {
  return record === null || record === undefined
    ? `${NO_RECORD}: no record was passed, so no schema attribution is stated`
    : `${NO_RECORD}: the record does not parse, so no schema attribution is stated`;
}

/**
 * Why the field carries no node. The clauses name the field, what the record's
 * schema section states, and whether the field's own state could be copied —
 * and none of them reads as a failure of the field.
 *
 * @param {any} record
 * @param {string} field
 * @param {boolean} hasRow
 * @returns {string}
 */
function noNodeReason(record, field, hasRow) {
  const schema = record['schema'];
  const schemaClause =
    isObject(schema) && schema['absent'] === true
      ? 'the record states the schema is absent (schema.absent is true)'
      : "the record's schema section carries no node naming this field";
  const fieldClause = hasRow
    ? "the field's own state is stated without attribution"
    : "the record carries no field row naming it either, so the field's own state is not stated";
  return `${NO_NODE}: the record carries no schema node naming "${field}"; ${schemaClause}; ${fieldClause}`;
}

/**
 * Why the join cannot answer. The reason names what is missing: the field name,
 * the field itself, or the input the node read.
 *
 * @param {string | null} field
 * @returns {string}
 */
function cannotTellReason(field) {
  if (field === null) {
    return `${CANNOT_TELL}: the facts name no field, so no schema attribution is stated`;
  }
  if (!isReadField(field)) {
    return `${CANNOT_TELL}: the facts name the field "${field}", which is not one of the ${FIELD_NAMES.length} field names the join reads (${FIELD_NAMES.join(', ')}), so no schema attribution is stated`;
  }
  return `${CANNOT_TELL}: the record names a schema node for the field "${field}" but records no input for that node, so the node's reading is not a declaration`;
}

/**
 * The result: the six keys the contract names, in that order. `node` and
 * `input` are null unless a declaration carries them.
 *
 * @param {string} state
 * @param {string | null} field
 * @param {string | null} node
 * @param {any} input
 * @param {string | null} reason
 * @param {any} observed
 */
function attribution(state, field, node, input, reason, observed) {
  return {
    state: state,
    field: field,
    node: node,
    input: input,
    reason: reason,
    observed: observed,
  };
}

/**
 * The join. One record, one field name, one of four states — in the order
 * REASONS carries them, and never the field's own state invented.
 *
 * @param {any} record the record T001 writes, as an object, as JSON text, or absent
 * @param {any} facts what the caller knows: `{ field }`
 * @returns {{ state: string, field: string | null, node: string | null, input: any, reason: string | null, observed: any }}
 */
export function schemaAttribution(record, facts) {
  const field = fieldOf(facts);

  // 1. no-record. Nothing else is stated: every other state is a statement
  // about a record, and there is none to read.
  const parsed = parseRecord(record);
  if (parsed === null) {
    return attribution(
      NO_RECORD,
      field,
      null,
      null,
      absentRecordReason(record),
      null,
    );
  }

  const row = rowFor(parsed, field);
  const node = nodeFor(parsed, field);
  const input = inputFor(parsed, node);
  const observed = observedOf(row);

  // 2. declared. The one state that carries the node and the input it read;
  // without the input there is no declaration to make, so the guard asks for
  // both and the state below names what is missing.
  if (isReadField(field) && node !== null && input.recorded) {
    return attribution(DECLARED, field, node, input.value, null, observed);
  }

  // 3. no-node. A field the join reads, with no node naming it in the record.
  // The absence is stated with its reason and is not a failure of the field.
  if (isReadField(field) && node === null) {
    return attribution(
      NO_NODE,
      field,
      null,
      null,
      noNodeReason(parsed, field, row !== null),
      observed,
    );
  }

  // 4. cannot-tell. The facts name no field, name a field the join does not
  // read, or name a node whose input was not recorded. `node` stays null
  // because a node is never carried without the input that node read.
  return attribution(
    CANNOT_TELL,
    field,
    null,
    null,
    cannotTellReason(field),
    observed,
  );
}
