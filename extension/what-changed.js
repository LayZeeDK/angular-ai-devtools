// what-changed.js — M051 T002: compare a pair of recorded snapshots, or refuse the pair.
//
// The input is two records of the page agent's `angular-ai:record` and nothing else. The answer is one
// of three states:
//
//   changes      each measured field that differs, quoted with the before and after value the two
//                records carry, in the order T001 measured. A measured field only one record carries
//                is a finding of its own: `added` or `removed`, carrying the one value that exists
//                and no counterpart (INTENT E1).
//   unchanged    the two records agree on every compared field. `compared` carries the fields that
//                were compared, so "one change" cannot be confused with "no comparison".
//   cannot-tell  the pair is refused, with the reason stated verbatim and nothing compared.
//
// The fields compared are T001's measurement and no others: `research/raw/m051-snapshots.json`
// `record.keyOrder`, the nine keys both dispatch sites assign (extension/agent-main.js:1042-1054 and
// :1432-1444). A key both records happen to carry that T001 did not measure (the recorded fixtures
// carry `order`, `t`, `dispatchedAt`, `path`, `routerEventTypes`) is not compared: the intent's risks
// rule out a general diff utility, so this reads the named fields the record states.
//
// A measured field one record carries and the other does not is the boundary INTENT E1 names. It has
// no second value, so it is not a change of value; inventing the missing side would be the invented
// difference N1 forbids, and dropping the field would hide a difference the pair does state. So it is
// a finding of its own — `added` when only the later record carries it, `removed` when only the
// earlier one does — carrying the value that exists and no counterpart at all: the absent side is
// absent from the finding, not filled with null or with the other record's value.
//
// The pair is bound by the panel's inspected tab, not by a field of the record. T001 measured that no
// field of the record identifies a page (`identity.bindingField: null`, `claimants: 0`; the record
// carries no url, no tab and no page key at all, and the `tabId` in extension/background.js:23 is the
// transport's), and the plan's Correction 2 rules that the binding is the panel's own. A caller that
// supplies no binding therefore gets `cannot-tell`, and the reason states both facts: the record
// carries no page identity, and the binding is the panel's inspected tab. Binding on
// `stability.attachAt` — the one value that repeats across records of one subscribe — would be the
// invention T001 named, not a measurement.
//
// Purity (SC3, N3): no file, no clock, no third record, no page. The two records and the caller's
// binding are read, and the answer is built from them alone; the suite runs this module in a bare
// `node:vm` context with the clock poisoned and no `require`, `process`, `fetch` or DOM in reach.
(function () {
  'use strict';

  // T001's measured field list, in the order both dispatch sites assign it. `compared` is this list
  // filtered to the fields either record carries — everything the answer read — so a caller can see
  // exactly what it was built from, and every finding names one of them.
  const FIELDS = [
    'cycleId',
    'startedAt',
    'trigger',
    'zoneMode',
    'events',
    'routerEvents',
    'boundary',
    'stability',
    'checks',
  ];

  const CHANGES = 'changes';
  const UNCHANGED = 'unchanged';
  const CANNOT_TELL = 'cannot-tell';

  // What a finding is: a value that moved between two values, or a value that exists on one side only
  // (E1). The three are the whole vocabulary, so a surface never has to guess whether a finding with
  // one value means "added" or "the other side was null and that is a change".
  const CHANGED = 'changed';
  const ADDED = 'added';
  const REMOVED = 'removed';

  // The refusal's two facts, spelled once. A caller compares the constant and renders the same words
  // the module states, which is what makes "the reason stated verbatim" hold.
  const NO_PAGE_IDENTITY =
    'the record carries no page identity (no url, no tab and no page key), and no field of it binds ' +
    'two records to one page';
  const PANEL_BINDING =
    "the pair is bound by the panel's inspected tab, not by a field of the record";

  const NO_BINDING_REASON =
    NO_PAGE_IDENTITY +
    ', so ' +
    PANEL_BINDING +
    ', and the caller supplied no binding';

  const NO_COMPARED_FIELD_REASON =
    'the two records carry none of the fields T001 measured, so there is nothing to compare; ' +
    NO_PAGE_IDENTITY +
    ', and ' +
    PANEL_BINDING;

  /**
   * A record is what the agent dispatches: a plain object. Anything else — an absent argument, a
   * string, a list — is a snapshot the caller does not have, which is a refusal and not an empty
   * finding list.
   * @param {any} value
   * @returns {boolean}
   */
  function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * The panel's own inspected tab, as the caller supplies it: a tab id, or an object carrying
   * `tabId`. Nothing on a record supplies it, because the record carries no page identity to supply
   * it from; a caller that supplies neither is a caller with no binding.
   * @param {any} binding
   * @returns {boolean}
   */
  function bindingSupplied(binding) {
    if (typeof binding === 'number') return Number.isInteger(binding);
    if (!isRecord(binding)) return false;
    return Number.isInteger(binding.tabId);
  }

  /**
   * Whether a record carries a field as its own: the field is present in the record, whatever its
   * value. A field absent from either record is outside the comparison.
   * @param {any} record
   * @param {string} field
   * @returns {boolean}
   */
  function carries(record, field) {
    return Object.prototype.hasOwnProperty.call(record, field);
  }

  /**
   * Structural equality over what a record publishes: numbers, strings, booleans, nulls, lists and
   * plain objects. Lists compare in order, because a record's list is in arrival order; object keys
   * compare as a set, because the record's key order is not a value and a reordering is not a change.
   * @param {any} left
   * @param {any} right
   * @returns {boolean}
   */
  function sameValue(left, right) {
    if (left === right) return true;
    if (typeof left === 'number' && typeof right === 'number')
      return Number.isNaN(left) && Number.isNaN(right);
    if (Array.isArray(left) || Array.isArray(right)) {
      if (!Array.isArray(left) || !Array.isArray(right)) return false;
      if (left.length !== right.length) return false;
      for (let index = 0; index < left.length; index += 1)
        if (!sameValue(left[index], right[index])) return false;
      return true;
    }
    if (!isRecord(left) || !isRecord(right)) return false;
    const leftKeys = Object.keys(left);
    if (leftKeys.length !== Object.keys(right).length) return false;
    for (let index = 0; index < leftKeys.length; index += 1) {
      const key = leftKeys[index];
      if (!carries(right, key)) return false;
      if (!sameValue(left[key], right[key])) return false;
    }
    return true;
  }

  /**
   * A copy of a published value, so a finding quotes the records' own values rather than a live view
   * of them: a caller that writes to either record afterwards cannot rewrite an answer already given.
   * @param {any} value
   * @returns {any}
   */
  function copyOf(value) {
    if (Array.isArray(value)) return value.map(copyOf);
    if (!isRecord(value)) return value;
    /** @type {Record<string, any>} */
    const copy = {};
    for (const key of Object.keys(value)) copy[key] = copyOf(value[key]);
    return copy;
  }

  /**
   * The refusal: the state and its reason, with nothing compared and no finding to mistake for one.
   * @param {string} reason
   * @returns {{ state: string, changes: any[], compared: string[], reason: string }}
   */
  function cannotTell(reason) {
    return { state: CANNOT_TELL, changes: [], compared: [], reason: reason };
  }

  /**
   * The sentence for a pair with a snapshot the caller does not have. It names which one is missing
   * and states the same two facts every refusal states, so a reader is never left thinking the
   * record proved the pair was one page.
   * @param {boolean} beforePresent
   * @param {boolean} afterPresent
   * @returns {string}
   */
  function absentReason(beforePresent, afterPresent) {
    const which =
      beforePresent || afterPresent
        ? beforePresent
          ? 'after'
          : 'before'
        : null;
    const absence =
      which === null
        ? 'neither snapshot was supplied, so there is no pair to compare'
        : 'the ' +
          which +
          ' snapshot is absent, so there is no pair to compare';
    return absence + '; ' + NO_PAGE_IDENTITY + '; ' + PANEL_BINDING;
  }

  /**
   * Compare two recorded snapshots of one page, or refuse the pair.
   *
   * The binding is the panel's inspected tab and is the caller's: this module reads no record field
   * to establish that two records are one page, because T001 measured that the record carries no such
   * field. A pair the caller does not bind is every pair over this record, and it is refused.
   * A finding is `{ field, kind, before, after }`: `kind` is `changed` with both sides quoted, or
   * `added` / `removed` with the one side the pair carries and no key at all for the other (E1).
   * @param {any} before the earlier record.
   * @param {any} after the later record.
   * @param {any} binding the panel's inspected tab: a tab id or `{ tabId }`.
   * @returns {{ state: string, changes: any[], compared: string[], reason: string | null }}
   */
  function whatChanged(before, after, binding) {
    const beforePresent = isRecord(before);
    const afterPresent = isRecord(after);
    if (!beforePresent || !afterPresent)
      return cannotTell(absentReason(beforePresent, afterPresent));

    // The record carries no page identity, so the binding is the panel's and has to be supplied.
    if (!bindingSupplied(binding)) return cannotTell(NO_BINDING_REASON);

    const compared = [];
    for (const field of FIELDS)
      if (carries(before, field) || carries(after, field)) compared.push(field);
    if (compared.length === 0) return cannotTell(NO_COMPARED_FIELD_REASON);

    const changes = [];
    for (const field of compared) {
      const inBefore = carries(before, field);
      const inAfter = carries(after, field);

      // E1: a measured field one record carries and the other does not has no second value, so it is
      // not a change of value — calling it one would invent the counterpart N1 forbids. It is named
      // added or removed and carries the one value that exists; the absent side is simply absent from
      // the finding, never a null and never the other record's value.
      if (inBefore !== inAfter) {
        changes.push(
          inAfter
            ? { field: field, kind: ADDED, after: copyOf(after[field]) }
            : { field: field, kind: REMOVED, before: copyOf(before[field]) },
        );
        continue;
      }

      const beforeValue = before[field];
      const afterValue = after[field];
      // One field, against the same field of the other record and nothing else: an equal value is
      // not a finding, and a differing value is reported with both values as the records carry them.
      if (!sameValue(beforeValue, afterValue)) {
        changes.push({
          field: field,
          kind: CHANGED,
          before: copyOf(beforeValue),
          after: copyOf(afterValue),
        });
      }
    }

    const state = changes.length === 0 ? UNCHANGED : CHANGES;
    return { state: state, changes: changes, compared: compared, reason: null };
  }

  const namespace = {
    whatChanged: whatChanged,
    bindingSupplied: bindingSupplied,
    FIELDS: FIELDS.slice(),
    CHANGES: CHANGES,
    UNCHANGED: UNCHANGED,
    CANNOT_TELL: CANNOT_TELL,
    CHANGED: CHANGED,
    ADDED: ADDED,
    REMOVED: REMOVED,
    NO_BINDING_REASON: NO_BINDING_REASON,
  };

  const g = globalThis;
  if (g.angularAiWhatChanged) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(g.angularAiWhatChanged, namespace);
  } else {
    g.angularAiWhatChanged = namespace;
  }
})();
