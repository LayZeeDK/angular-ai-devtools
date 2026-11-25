// head-state.js — the join behind M068: one head entry's state, joined to the entry still present
// for the navigation the record read it at.
//
// T001 measured the record (`research/raw/m068-head-record.json`): for the one head entry the
// Insurance Portal carries, the facts the observation took and nothing inferred — the entry's own
// name (`name`), the navigation it was first seen at (`firstSeenAt`), the entry still present at the
// last read (`remained`), the navigation whose page carries it (`carriedBy`), the navigation the
// record correlates the entry's write with (`writtenBy`) and the second entry of the same name
// (`duplicate`). A record that lists those facts answers nothing on its own: what a reader needs is
// whether the entry the record saw is the one still present, and where it is not, which entry is —
// and, where the record does not carry a fact the comparison needs, that the comparison was not
// made. This module answers that and nothing else.
//
// The rows, read as T001 wrote them:
//
//   { entry: "title",
//     name:       { read: true, value: { element: "title" }, source: "…" },
//     firstSeenAt:{ read: true, value: { index: 0, url: "/home", at: "…" }, source: "…" },
//     remained:   { read: true,
//                   value: { element: "title", text: "Insurance Portal",
//                            navigationsCarrying: [0, 1, 2], sameTextAtEveryRead: true },
//                   source: "…" },
//     carriedBy:  { read: true, value: { index: 2, url: "/claim", at: "…" }, source: "…" },
//     writtenBy:  { read: false, observed: false, reason: "…" }
//               | { read: true, observed: true, value: { index: 0, url: "/home" }, source: "…" },
//     duplicate:  { read: false, reason: "…" }
//               | { read: true, value: { count: 2, second: { element: "title", text: "…" } },
//                   source: "…" } }
//
// A `read: false` fact is a measured absence carrying its own reason: the reading was taken and the
// fact was not there. A fact *missing* from the row is a different statement again — the record said
// nothing at all — and this module reports the two apart, because "the head carries no second entry
// of this name" and "nobody counted" are different facts about a head.
//
// The committed record carries both of those facts as measured absences — `writtenBy.read` is false
// and names no navigation, and `duplicate.read` is false and carries no count — so the join over it
// answers `cannot-tell` and names the fact it is missing. That is the record's answer, not a gap in
// this module: the record attributes no write to a navigation, and it holds one value per read and
// no key counting the entries that share a name.
//
// The answer, one object with exactly these six fields and nothing else:
//
//   { state, entry, present, writtenBy, reason, observed }
//
//   state      one of `current`, `stale`, `duplicate`, `cannot-tell`
//   entry      the name the record recorded for the entry it observed, quoted, or null when the
//              record carries no name for it
//   present    the entry still present, quoted: `{ entry, carriedBy }` — the entry the record states
//              remained, together with the navigation whose page carries it — or null where the
//              record read no entry still present. For a duplicate, `entry` is the second entry of
//              the same name: the one written later is the one still present, and the one the record
//              observed is the earlier. `carriedBy` is null where the record did not read it.
//   writtenBy  the navigation the record correlates the entry's write with, quoted exactly as the
//              record carries it, or null where the record read none
//   reason     null exactly when the record answered (`current`, `stale`, `duplicate`); every other
//              state names, from the closed set below, the fact the comparison is missing
//   observed   what the record said, quoted: the row's entry key and its six facts as recorded, plus
//              the one caller fact this join reads. Nothing added, nothing paraphrased, and nothing
//              pointing into the record.
//
// The states:
//
//   current    the record attributes the entry's write to the navigation whose page carries it: the
//              entry the record saw is the entry still present, for the same navigation
//   stale      the record attributes the write to one navigation and another navigation's page
//              carries the entry; `writtenBy` names the navigation that wrote it and `present` names
//              the entry still present together with the navigation whose page carries it — both are
//              named, or the state is not answered
//   duplicate  the record counted two entries sharing the name and names the second; `entry` names
//              the one the record observed and `present.entry` the second, still present. Both are
//              named together, and a record that counts two and names none is `cannot-tell` rather
//              than a duplicate with nothing to compare it to
//   cannot-tell the record lacks a fact the comparison needs; `reason` names the fact, and the answer
//              carries no remedy, no cause and no route the record did not carry
//
// The reasons, so a caller compares a constant instead of prose:
//
//   record-unreadable             the record is neither an entry row, a list of rows, nor a document
//                                 whose `entries` is a list of rows
//   entry-not-chosen              the record carries several entries and the caller named none
//   no-head-entry                 the record carries no row for the entry the caller named
//   name-not-recorded             the row carries no name fact, or the record states it was not read
//   name-not-an-entry             the name fact was read and names no entry (an element)
//   duplicate-not-recorded        the row carries no duplicate fact, or the record states it was not
//                                 read — no count of the entries sharing the name was taken
//   duplicate-not-a-count         the duplicate fact was read and carries no count of entries
//   duplicate-not-named           the record counted two entries sharing the name and names no second
//                                 entry, so there is no second entry to name beside the first
//   writtenBy-not-recorded        the row carries no writing-navigation fact, or the record states
//                                 it was not read — the observer saw no write it could attribute
//   writtenBy-not-a-navigation    the writing-navigation fact was read and names no navigation index
//   carriedBy-not-recorded        the row carries no carrying-navigation fact, or the record states
//                                 it was not read
//   carriedBy-not-a-navigation    the carrying-navigation fact was read and names no navigation index
//   present-not-recorded          the row carries no entry-still-present fact, or the record states
//                                 it was not read
//
// Facts the caller states (`facts`), of which exactly one key is read:
//
//   entry   the name of the row to join, when the record carries several rows
//
// Everything else the caller passes is not consulted: a title the caller happens to know, the text
// the entry carried, its position among the head's children — none of them is a writing navigation
// any reading took, and proximity is not attribution (the rule `extension/lint-core.js` holds to,
// for the same reason: what was observed outranks what could be guessed at).
//
// The order of the answer, so two facts that disagree cannot be resolved by accident, and one reason
// is named rather than two:
//
//   the row, then the entry's name, then whether the head carries a second entry of that name (a
//   duplicate is a fact about the entry the join is asked about, and without it "the entry still
//   present" is not known to be one entry), then the entry still present, then the navigation whose
//   page carries it, then the writing navigation, then the comparison. The writing navigation is
//   decided immediately before the comparison and never inferred: a `stale` answer without it is not
//   an answer this join can give.
//
// Two navigations are the same navigation when the record's own `index` for them is the same, which
// is the key `extension/title-input.js` attributes a write by. A url and an instant are quoted where
// the record carries them and are never compared: a second key for one navigation is exactly the
// second identity this programme refuses.
//
// The record's own `writes` list is not re-read here. T001 correlates a write with a navigation from
// that list and states the result in `writtenBy`, and a correlation made again in this module would
// be a second writer for one write. A write the record attributes to no navigation is
// `cannot-tell` naming that fact, and no route is read out of the entry's text.
//
// What this module is not: it is not a reader of anything. It has no DOM, no I/O, it imports
// nothing, and it mutates neither the record nor the facts — the answer quotes the record and never
// points into it.

const CURRENT = 'current';
const STALE = 'stale';
const DUPLICATE = 'duplicate';
const CANNOT_TELL = 'cannot-tell';

const RECORD_UNREADABLE = 'record-unreadable';
const ENTRY_NOT_CHOSEN = 'entry-not-chosen';
const NO_HEAD_ENTRY = 'no-head-entry';
const NAME_NOT_RECORDED = 'name-not-recorded';
const NAME_NOT_AN_ENTRY = 'name-not-an-entry';
const DUPLICATE_NOT_RECORDED = 'duplicate-not-recorded';
const DUPLICATE_NOT_A_COUNT = 'duplicate-not-a-count';
const DUPLICATE_NOT_NAMED = 'duplicate-not-named';
const WRITTEN_BY_NOT_RECORDED = 'writtenBy-not-recorded';
const WRITTEN_BY_NOT_A_NAVIGATION = 'writtenBy-not-a-navigation';
const CARRIED_BY_NOT_RECORDED = 'carriedBy-not-recorded';
const CARRIED_BY_NOT_A_NAVIGATION = 'carriedBy-not-a-navigation';
const PRESENT_NOT_RECORDED = 'present-not-recorded';

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
 * The rows a record carries: one row, a list of rows, or a document whose `entries` is a list of
 * rows. Null when the record is none of the three, which is "unreadable" rather than "empty".
 * @param {any} record
 * @returns {any[] | null}
 */
function rowsOf(record) {
  if (Array.isArray(record)) return record;
  if (isObject(record) && Array.isArray(record.entries)) return record.entries;
  if (isObject(record) && typeof record.entry === 'string') return [record];
  return null;
}

/**
 * The row to join, or the reason no row was chosen. A caller that names an entry gets that row; a
 * record carrying exactly one row is that row; a record carrying several and a caller naming none
 * is a question this join cannot answer, and it says so rather than picking one.
 * @param {any} record
 * @param {string | null} entryChosen
 * @returns {{ row: any | null, reason: string | null }}
 */
function chooseRow(record, entryChosen) {
  const rows = rowsOf(record);
  if (rows === null) return { row: null, reason: RECORD_UNREADABLE };
  if (entryChosen !== null) {
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (isObject(row) && row.entry === entryChosen) {
        return { row: row, reason: null };
      }
    }
    return { row: null, reason: NO_HEAD_ENTRY };
  }
  if (rows.length === 1) {
    return isObject(rows[0])
      ? { row: rows[0], reason: null }
      : { row: null, reason: RECORD_UNREADABLE };
  }
  return { row: null, reason: ENTRY_NOT_CHOSEN };
}

/**
 * One of the row's facts, or null when the row carries none. A fact missing from the row and a fact
 * stating that it was not read are both carried through, and the join reports the two apart.
 * @param {any} row
 * @param {string} key
 * @returns {any | null}
 */
function factOf(row, key) {
  if (!isObject(row)) return null;
  const fact = row[key];
  return isFact(fact) ? fact : null;
}

/**
 * The value a fact carries, copied, or null when the fact says it was not read. A fact the row does
 * not carry at all is null here too; the caller keeps the two apart by reading `factOf` first.
 * @param {any | null} fact
 * @returns {any | null}
 */
function valueOf(fact) {
  return fact !== null && fact.read === true ? copy(fact.value) : null;
}

/**
 * Whether a recorded value names a head entry: an element the head carries. The record's name fact
 * carries `{ element }`, and a value that names no element is not an entry this join will name.
 * @param {any} value
 * @returns {boolean}
 */
function namesAnEntry(value) {
  return (
    isObject(value) &&
    typeof value.element === 'string' &&
    value.element.trim() !== ''
  );
}

/**
 * The navigation index a recorded value names, or null when it names none. A navigation is named by
 * the record's own integer `index`; a url or an instant is quoted and never used as a key.
 * @param {any} value
 * @returns {number | null}
 */
function navigationIndexOf(value) {
  if (!isObject(value)) return null;
  return Number.isInteger(value.index) ? value.index : null;
}

/**
 * The count of entries carrying the name, as the duplicate fact records it, or null when the fact
 * carries no count. A count of entries is a number; nothing else is read as one.
 * @param {any} duplicateFact
 * @returns {number | null}
 */
function duplicateCountOf(duplicateFact) {
  const value = valueOf(duplicateFact);
  if (!isObject(value)) return null;
  return Number.isInteger(value.count) ? value.count : null;
}

/**
 * The second entry of the same name, copied, or null when the record named none. Only a value that
 * names an entry is one: a count with no entry behind it is a duplicate the join cannot name.
 * @param {any} duplicateFact
 * @returns {any | null}
 */
function duplicateSecondOf(duplicateFact) {
  const value = valueOf(duplicateFact);
  if (!isObject(value)) return null;
  const second = value.second;
  return namesAnEntry(second) ? copy(second) : null;
}

/**
 * The entry still present: the record's own statement of it, together with the navigation whose page
 * carries it. Null where the record read no entry still present.
 * @param {any} stayed the entry the record states remained, or null
 * @param {any} carrying the navigation whose page carries it, or null
 * @returns {any | null}
 */
function presentOf(stayed, carrying) {
  if (stayed === null) return null;
  return { entry: stayed, carriedBy: carrying };
}

/**
 * What the record said about the row, quoted, plus the one caller fact this join reads.
 * @param {any | null} row
 * @param {string | null} entryChosen
 */
function observedOf(row, entryChosen) {
  return {
    entry: isObject(row) && typeof row.entry === 'string' ? row.entry : null,
    entryChosen: entryChosen,
    name: copy(factOf(row, 'name')),
    firstSeenAt: copy(factOf(row, 'firstSeenAt')),
    remained: copy(factOf(row, 'remained')),
    carriedBy: copy(factOf(row, 'carriedBy')),
    writtenBy: copy(factOf(row, 'writtenBy')),
    duplicate: copy(factOf(row, 'duplicate')),
  };
}

/**
 * The answer, written in one place so a pin on its shape is a pin on every answer, and so no branch
 * can add a field the others do not carry.
 * @param {string} state
 * @param {any | null} entry
 * @param {any | null} present
 * @param {any | null} writtenBy
 * @param {string | null} reason
 * @param {any} observed
 * @returns {{ state: string, entry: any | null, present: any | null, writtenBy: any | null, reason: string | null, observed: any }}
 */
function answer(state, entry, present, writtenBy, reason, observed) {
  return {
    state: state,
    entry: entry,
    present: present,
    writtenBy: writtenBy,
    reason: reason,
    observed: observed,
  };
}

/**
 * The join: one head entry's state, against the entry still present for the navigation the record
 * read it at.
 *
 * @param {any} record the head record: an entry row, a list of rows, or the document T001 writes
 * @param {any} facts what the caller states — `entry`, and nothing else read
 * @returns {{ state: string, entry: any | null, present: any | null, writtenBy: any | null, reason: string | null, observed: any }}
 */
export function headState(record, facts) {
  const stated = isObject(facts) ? facts : {};
  const entryChosen =
    typeof stated.entry === 'string' && stated.entry !== ''
      ? stated.entry
      : null;
  const chosen = chooseRow(record, entryChosen);
  const row = chosen.row;

  // No row to join: the record carries none, carries several and the caller named none, or is not a
  // record this join reads. The answer names the entry as unread and quotes nothing else.
  if (row === null) {
    return answer(
      CANNOT_TELL,
      null,
      null,
      null,
      chosen.reason,
      observedOf(null, entryChosen),
    );
  }

  const observed = observedOf(row, entryChosen);
  const nameFact = factOf(row, 'name');
  const duplicateFact = factOf(row, 'duplicate');
  const remainedFact = factOf(row, 'remained');
  const carriedByFact = factOf(row, 'carriedBy');
  const writtenByFact = factOf(row, 'writtenBy');

  const name = valueOf(nameFact);
  const entry = namesAnEntry(name) ? name : null;
  const stayed = valueOf(remainedFact);
  const carrying = valueOf(carriedByFact);
  const writtenBy = valueOf(writtenByFact);
  const present = presentOf(stayed, carrying);

  // The entry's own name is what the answer is about: without it there is no entry to compare, and
  // the record either states that it was not read or read a value that names none.
  if (nameFact === null || nameFact.read === false) {
    return answer(
      CANNOT_TELL,
      null,
      present,
      writtenBy,
      NAME_NOT_RECORDED,
      observed,
    );
  }
  if (entry === null) {
    return answer(
      CANNOT_TELL,
      null,
      present,
      writtenBy,
      NAME_NOT_AN_ENTRY,
      observed,
    );
  }

  // Whether the head carries a second entry of this name answers first: it is the fact that says
  // "the entry still present" is one entry at all. A record that counted none read an absence and
  // the difference from "nobody counted" is reported, never papered over.
  if (duplicateFact === null || duplicateFact.read === false) {
    return answer(
      CANNOT_TELL,
      entry,
      present,
      writtenBy,
      DUPLICATE_NOT_RECORDED,
      observed,
    );
  }
  const count = duplicateCountOf(duplicateFact);
  if (count === null) {
    return answer(
      CANNOT_TELL,
      entry,
      present,
      writtenBy,
      DUPLICATE_NOT_A_COUNT,
      observed,
    );
  }
  if (count >= 2) {
    const second = duplicateSecondOf(duplicateFact);
    // A count of two with no second entry named is a duplicate with nothing to name beside the
    // first, and naming one of the two is the defect this state refuses: the absence is stated.
    if (second === null) {
      return answer(
        CANNOT_TELL,
        entry,
        present,
        writtenBy,
        DUPLICATE_NOT_NAMED,
        observed,
      );
    }
    return answer(
      DUPLICATE,
      entry,
      presentOf(second, carrying),
      writtenBy,
      null,
      observed,
    );
  }

  // The entry still present, and the navigation whose page carries it. Both are needed for the
  // comparison, and the answer names the fact it is missing rather than the one it has.
  if (stayed === null) {
    return answer(
      CANNOT_TELL,
      entry,
      null,
      writtenBy,
      PRESENT_NOT_RECORDED,
      observed,
    );
  }
  if (carriedByFact === null || carriedByFact.read === false) {
    return answer(
      CANNOT_TELL,
      entry,
      present,
      writtenBy,
      CARRIED_BY_NOT_RECORDED,
      observed,
    );
  }
  const carriesAt = navigationIndexOf(carrying);
  if (carriesAt === null) {
    return answer(
      CANNOT_TELL,
      entry,
      present,
      writtenBy,
      CARRIED_BY_NOT_A_NAVIGATION,
      observed,
    );
  }

  // Then the writing navigation, decided immediately before the comparison: a write the record
  // attributes to no navigation is `cannot-tell`, and the navigation is never inferred from the
  // entry's text or its order in the head.
  if (writtenByFact === null || writtenByFact.read === false) {
    return answer(
      CANNOT_TELL,
      entry,
      present,
      null,
      WRITTEN_BY_NOT_RECORDED,
      observed,
    );
  }
  const writesAt = navigationIndexOf(writtenBy);
  if (writesAt === null) {
    return answer(
      CANNOT_TELL,
      entry,
      present,
      writtenBy,
      WRITTEN_BY_NOT_A_NAVIGATION,
      observed,
    );
  }

  // Both navigations are known: the comparison, and its two outcomes, each naming both of them.
  if (writesAt === carriesAt) {
    return answer(CURRENT, entry, present, writtenBy, null, observed);
  }
  return answer(STALE, entry, present, writtenBy, null, observed);
}
