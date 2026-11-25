// field-binder.js — the join behind M067: one form field's hosted control, joined to the control
// the field's record expects.
//
// T004 measured the record (`research/raw/m067-field-binder.json`): for every field of the
// Insurance Portal's contract-create form, three facts and nothing inferred — the identity the
// field tree reports (`identity`), the element the field hosts, as a tag plus the attribute that
// distinguishes it by the field's own identity (`hosted`), and the control the field's record
// expects (`expected`). A record that lists those facts answers nothing on its own: what a reader
// needs is whether the field hosts the control its record expects, and where it hosts another,
// which one. This module answers that and nothing else.
//
// The rows, read as T004 wrote them:
//
//   { field: "policyNumber",
//     identity: { read: true, value: "policyNumber", source: "…",
//                 producer: "extension/field-state.js" },
//     hosted:   { read: true, value: { tag: "input",
//                                      attribute: { name: "id", value: "policyNumber" } },
//                 source: "…" }
//             | { read: false, reason: "…" },
//     expected: { read: true, value: "p-select", source: "…" }
//             | { read: false, reason: "…" } }
//
// A `read: false` fact is a measured absence carrying its own reason: the reading was taken and
// the fact was not there. A fact *missing* from the row is a different statement again — the
// record said nothing at all — and this module reports the two apart, because "the page carries no
// element here" and "nobody looked" are different facts about a field.
//
// The answer, one object with exactly the fields the surface renders:
//
//   { state, field, hosted, expected, reason, observed }
//
//   state     one of `bound`, `mismatch`, `no-host`, `cannot-tell`
//   field     the identity the row is keyed by, quoted, or null when the record carries no row
//   hosted    the record's hosted reading — `{ tag, attribute }` — when it was read, else null
//   expected  the record's expected control, as the record names it, when it was read, else null
//   reason    null exactly when the comparison was made (`bound`, `mismatch`); every other state
//             names, from the closed set below, why it was not
//   observed  what the record said, quoted: the row's identity and the two facts as recorded,
//             plus the one caller fact this join reads. Nothing added, nothing paraphrased.
//
// The states:
//
//   bound        hosted and expected are both present, and the same control.
//   mismatch     both are present and different; `hosted` and `expected` name both, so a caller is
//                told what the field hosts and what its record expects, and not one of the two.
//   no-host      the field hosts nothing, or is not a components field; `reason` says which —
//                `hosts-no-element` when the record states the absence, `not-a-components-field`
//                when the caller states the field's kind. Never a control inferred from a label, a
//                placeholder or a CSS class: an element the page carries is measured, and a name
//                that would make a convenient host is not a host the record contains.
//   cannot-tell  the record lacks a fact the comparison needs; `reason` names the fact, and the
//                answer carries no remedy, no cause and no control the record did not contain.
//
// The reasons, so a caller compares a constant instead of prose:
//
//   record-unreadable        the record is neither a row, a list of rows, nor a document whose
//                            `fields` is a list of rows
//   field-not-chosen         the record carries several rows and the caller named no field
//   no-field-entry           the record carries no row for the field the caller named
//   not-a-components-field   the caller states the field is not a components field
//   hosts-no-element         the record states the field hosts no element
//   hosted-not-recorded      the row carries no hosted fact at all
//   hosted-not-a-control     the hosted fact was read and names no element tag
//   expected-not-recorded    the row carries no expected control
//   expected-not-a-control   the expected fact was read and names no control name (a string)
//
// Facts the caller states (`facts`), of which exactly two keys are read:
//
//   field             the identity of the row to bind, when the record carries several rows
//   componentsField   false when the caller states the field is not a components field
//
// Everything else the caller passes is not consulted for the host: an element the caller happens
// to know about, the field's label, its placeholder, its class — none of them is a host any
// reading took, and proximity is not attribution (the rule `extension/lint-core.js` holds to, for
// the same reason: what was observed outranks what could be guessed at).
//
// The order of the answer, so two facts that disagree cannot be resolved by accident: the row,
// then whether the field is a components field at all, then whether the record read a host, then
// whether it read a control the field expects, then the comparison. A field that hosts nothing is
// `no-host` even when its expected control was not read either: the hosting fact alone answers,
// and `cannot-tell` there would name a missing fact that could not have changed the answer.
//
// The control a hosted element is, is its tag: an `<input>` is the `input` control. An element tag
// is case-insensitive in HTML, so the comparison folds case and surrounding space; the report
// never does — `hosted` and `expected` are the record's own values, and a mismatch shows them as
// they were recorded.
//
// What this module is not: it is not a reader of anything. It has no DOM, no I/O, it imports
// nothing, and it mutates neither the record nor the facts — the answer quotes the record and
// never points into it.

const BOUND = 'bound';
const MISMATCH = 'mismatch';
const NO_HOST = 'no-host';
const CANNOT_TELL = 'cannot-tell';

const RECORD_UNREADABLE = 'record-unreadable';
const FIELD_NOT_CHOSEN = 'field-not-chosen';
const NO_FIELD_ENTRY = 'no-field-entry';
const NOT_A_COMPONENTS_FIELD = 'not-a-components-field';
const HOSTS_NO_ELEMENT = 'hosts-no-element';
const HOSTED_NOT_RECORDED = 'hosted-not-recorded';
const HOSTED_NOT_A_CONTROL = 'hosted-not-a-control';
const EXPECTED_NOT_RECORDED = 'expected-not-recorded';
const EXPECTED_NOT_A_CONTROL = 'expected-not-a-control';

/** A plain object, which is what every fact and every answer of this join is. @param {any} value */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Whether a value is one of the record's facts: a read flag and, behind it, a value or a reason.
 * @param {any} value
 */
function isFact(value) {
  return isObject(value) && typeof value.read === 'boolean';
}

/** A copy of a recorded value, so nothing in the answer points into the record. @param {any} value */
function copy(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    /** @type {any[]} */
    const list = [];
    for (let i = 0; i < value.length; i += 1) list.push(copy(value[i]));
    return list;
  }
  /** @type {Record<string, any>} */
  const object = {};
  const keys = Object.keys(value);
  for (let i = 0; i < keys.length; i += 1) {
    object[keys[i]] = copy(value[keys[i]]);
  }
  return object;
}

/**
 * The rows a record carries: one row, a list of rows, or a document whose `fields` is a list of
 * rows. Null when the record is none of the three, which is "unreadable" rather than "empty".
 * @param {any} record
 * @returns {any[] | null}
 */
function rowsOf(record) {
  if (Array.isArray(record)) return record;
  if (isObject(record) && Array.isArray(record.fields)) return record.fields;
  if (isObject(record) && typeof record.field === 'string') return [record];
  return null;
}

/**
 * The row to bind, or the reason no row was chosen. A caller that names a field gets that row; a
 * record carrying exactly one row is that row; a record carrying several and a caller naming none
 * is a question this join cannot answer, and it says so rather than picking one.
 * @param {any} record
 * @param {any} facts
 * @returns {{ row: any | null, reason: string | null }}
 */
function chooseRow(record, facts) {
  const rows = rowsOf(record);
  if (rows === null) return { row: null, reason: RECORD_UNREADABLE };
  const named =
    isObject(facts) && typeof facts.field === 'string' ? facts.field : null;
  if (named !== null) {
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (isObject(row) && row.field === named) {
        return { row: row, reason: null };
      }
    }
    return { row: null, reason: NO_FIELD_ENTRY };
  }
  if (rows.length === 1) {
    return isObject(rows[0])
      ? { row: rows[0], reason: null }
      : { row: null, reason: RECORD_UNREADABLE };
  }
  return { row: null, reason: FIELD_NOT_CHOSEN };
}

/**
 * What the record said about the row, quoted, plus the one caller fact this join reads.
 * @param {any | null} row
 * @param {boolean | null} componentsField
 */
function observedOf(row, componentsField) {
  const entry = isObject(row) ? row : null;
  return {
    field:
      entry !== null && typeof entry.field === 'string' ? entry.field : null,
    identity:
      entry !== null && isObject(entry.identity) ? copy(entry.identity) : null,
    hosted:
      entry !== null && isObject(entry.hosted) ? copy(entry.hosted) : null,
    expected:
      entry !== null && isObject(entry.expected) ? copy(entry.expected) : null,
    componentsField: componentsField,
  };
}

/**
 * The answer, written in one place so a pin on its shape is a pin on every answer, and so no
 * branch can add a field the others do not carry.
 * @param {string} state
 * @param {string | null} field
 * @param {any} hosted
 * @param {any} expected
 * @param {string | null} reason
 * @param {any} observed
 * @returns {{ state: string, field: string | null, hosted: any, expected: any, reason: string | null, observed: any }}
 */
function answer(state, field, hosted, expected, reason, observed) {
  return {
    state: state,
    field: field,
    hosted: hosted,
    expected: expected,
    reason: reason,
    observed: observed,
  };
}

/** A control name, folded for comparison only: trimmed and case-insensitive. @param {string} text */
function folded(text) {
  return text.trim().toLowerCase();
}

/**
 * The control a hosted reading names — its element tag — or null when the reading names no tag.
 * @param {any} hosted
 * @returns {string | null}
 */
function hostedControlOf(hosted) {
  if (!isObject(hosted)) return null;
  if (typeof hosted.tag !== 'string' || hosted.tag.trim() === '') return null;
  return folded(hosted.tag);
}

/**
 * The control an expected reading names — a control name the record carries — or null when the
 * fact carries something that is not a control name. A control is named as a string and nothing
 * else is read as one; an object that happens to hold a tag is not a name this join will take.
 * @param {any} expected
 * @returns {string | null}
 */
function expectedControlOf(expected) {
  if (typeof expected !== 'string' || expected.trim() === '') return null;
  return folded(expected);
}

/**
 * The join: one form field's hosted control, against the control its record expects.
 *
 * @param {any} record the field-binder record: a row, a list of rows, or the document T004 writes
 * @param {any} facts what the caller states — `field` and `componentsField`, and nothing else read
 * @returns {{ state: string, field: string | null, hosted: any, expected: any, reason: string | null, observed: any }}
 */
export function fieldBinder(record, facts) {
  const stated = isObject(facts) ? facts : {};
  const componentsField =
    typeof stated.componentsField === 'boolean' ? stated.componentsField : null;
  const chosen = chooseRow(record, stated);
  const row = chosen.row;

  // No row to bind: the record carries none, carries several and the caller named none, or is not
  // a record this join reads. The answer names the field as unread and quotes nothing else.
  if (row === null) {
    return answer(
      CANNOT_TELL,
      null,
      null,
      null,
      chosen.reason,
      observedOf(null, componentsField),
    );
  }

  const field =
    typeof row.field === 'string' && row.field !== '' ? row.field : null;
  const observed = observedOf(row, componentsField);
  const hostedFact = isFact(row.hosted) ? row.hosted : null;
  const expectedFact = isFact(row.expected) ? row.expected : null;
  const hosted =
    hostedFact !== null && hostedFact.read === true
      ? copy(hostedFact.value)
      : null;
  const expected =
    expectedFact !== null && expectedFact.read === true
      ? copy(expectedFact.value)
      : null;

  // The caller's statement about the field's kind answers first: a field that is not a components
  // field hosts no control this join compares, and the record's own statement stays quoted.
  if (componentsField === false) {
    return answer(
      NO_HOST,
      field,
      hosted,
      expected,
      NOT_A_COMPONENTS_FIELD,
      observed,
    );
  }

  // Then the record's statement about hosting, which is a measurement: no fact at all is a record
  // that did not say, while a fact stating the absence is a host that was looked for and not found.
  if (hostedFact === null) {
    return answer(
      CANNOT_TELL,
      field,
      null,
      expected,
      HOSTED_NOT_RECORDED,
      observed,
    );
  }
  if (hostedFact.read === false) {
    return answer(NO_HOST, field, null, expected, HOSTS_NO_ELEMENT, observed);
  }
  const hostedControl = hostedControlOf(hosted);
  if (hostedControl === null) {
    return answer(
      CANNOT_TELL,
      field,
      hosted,
      expected,
      HOSTED_NOT_A_CONTROL,
      observed,
    );
  }

  // Then the control the record says the field expects. Absent, it is the fact the comparison
  // needs and the answer is `cannot-tell` naming it — never the hosted control offered in its
  // place, and never a remedy for reading it.
  if (expectedFact === null || expectedFact.read === false) {
    return answer(
      CANNOT_TELL,
      field,
      hosted,
      null,
      EXPECTED_NOT_RECORDED,
      observed,
    );
  }
  const expectedControl = expectedControlOf(expected);
  if (expectedControl === null) {
    return answer(
      CANNOT_TELL,
      field,
      hosted,
      expected,
      EXPECTED_NOT_A_CONTROL,
      observed,
    );
  }

  // Both facts are present: the comparison, and its two outcomes, each naming both controls.
  if (hostedControl === expectedControl) {
    return answer(BOUND, field, hosted, expected, null, observed);
  }
  return answer(MISMATCH, field, hosted, expected, null, observed);
}
