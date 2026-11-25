// M068 T002 — the join: one head entry's state, against the entry still present.
//
// T001 wrote the record (`research/raw/m068-head-record.json`) and this suite holds the join
// (`extension/head-state.js`) to it, reading the record's shape exactly as it stands. The committed
// record carries both of the facts two of the four states need as measured absences —
// `writtenBy.read` is false and names no navigation, and `duplicate.read` is false and carries no
// count — so a join over the committed record can answer `cannot-tell` naming the missing fact and
// can never answer `current`, `stale` or `duplicate`. Those three are exercised on records
// constructed from the same shape, and the committed record is never rewritten here.
//
// Derived pieces of the record are read from the file rather than restated, and where a value is
// restated — a navigation's index and url, a state, a reason — the restatement is the pin: a record
// that moved reddens this suite by name instead of passing quietly.
//
// What the suite pins, in the order the pin runs:
//
//   1. an answer carries exactly the six fields of the contract and nothing else, its state is one of
//      the four, and its reason is one of the named absences. A join that names a remedy or a route
//      the record did not carry reddens here, by name (mutant 3);
//   2. a duplicate names both entries, so a join that reports only the first occurrence reddens by
//      name (mutant 1);
//   3. a stale answer names the writing navigation and the navigation whose page carries it, so a
//      join that reports staleness without the writing navigation reddens by name (mutant 2);
//   4. a writing navigation is quoted from the record or not named at all, so a join that infers one
//      from the entry's text or its order in the head reddens by name (mutant 4);
//   5. every string in an answer either appears in the record the answer was made from or is one of
//      the join's own state and reason names.
//
// Each mutant is planted on a decorated copy of the join, and the untouched module is pinned before
// the mutation and pinned again after it, so a mutant that changed nothing observable cannot pass for
// a caught defect. Nothing here writes a file: the record is read, never captured.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as headModule from '../extension/head-state.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The record T001 writes, and the module this task writes, both read as they stand. */
const RECORD_REL = 'research/raw/m068-head-record.json';
const MODULE_REL = 'extension/head-state.js';

function committed(rel) {
  return readFileSync(join(ROOT, ...rel.split('/')), 'utf8');
}

const RECORD = JSON.parse(committed(RECORD_REL));
const RECORD_TEXT = JSON.stringify(RECORD);
const MODULE_SOURCE = committed(MODULE_REL);

/** The states this join answers, and the absences it names. A caller compares these, not prose. */
const STATES = ['current', 'stale', 'duplicate', 'cannot-tell'];
const REASONS = [
  'record-unreadable',
  'entry-not-chosen',
  'no-head-entry',
  'name-not-recorded',
  'name-not-an-entry',
  'duplicate-not-recorded',
  'duplicate-not-a-count',
  'duplicate-not-named',
  'writtenBy-not-recorded',
  'writtenBy-not-a-navigation',
  'carriedBy-not-recorded',
  'carriedBy-not-a-navigation',
  'present-not-recorded',
];

/** The six fields of an answer, which is every field the contract names and no other. */
const ANSWER_KEYS = [
  'entry',
  'observed',
  'present',
  'reason',
  'state',
  'writtenBy',
];

/** The join's own names, the only strings it may answer that the record does not carry. */
const TOKENS = new Set([...STATES, ...REASONS]);

/** The one function this module exports, at the name the interface contract gives it. */
const headState = headModule.headState;

/** The second entry of the same name, as a record that read one names it. */
const SECOND = { element: 'title', text: 'Insurance Portal (second)' };

// ------------------------------------------------------------------- reading ----

/** A deep copy, so a case is built on a copy and the record in memory is never touched. */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** A row of the committed record, copied. @param {string} entry */
function rowOf(entry) {
  const found = RECORD.entries.find((one) => one.entry === entry);
  assert.ok(
    found,
    `the committed record carries no ${entry} row, so the join has nothing to read and this suite's cases name an entry the record does not carry`,
  );
  return clone(found);
}

/** A copy of the committed title row, patched. @param {(row: any) => void} [patch] */
function titleRow(patch) {
  const row = rowOf('title');
  if (patch !== undefined) patch(row);
  return row;
}

/** A record document built from the committed one's own shape, carrying one row. */
function documentOf(row) {
  return {
    schema: RECORD.schema,
    milestone: RECORD.milestone,
    task: RECORD.task,
    entries: [row],
  };
}

/** Whether a value is one of the record's facts: a read flag and, behind it, a value or a reason. */
function isFactValue(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof value.read === 'boolean'
  );
}

/** The value a fact carries, copied, or null where the fact states it was not read. */
function readValue(fact) {
  return isFactValue(fact) && fact.read === true ? clone(fact.value) : null;
}

/**
 * The entry still present, as the join answers it: the record's own statement of the entry, and the
 * navigation whose page carries it. Null where the record read no entry still present.
 * @param {any} row @param {any} [second]
 */
function presentOfRow(row, second) {
  const stayed = second === undefined ? readValue(row.remained) : second;
  if (stayed === null) return null;
  return { entry: stayed, carriedBy: readValue(row.carriedBy) };
}

/** A record's fact stated as not read, of the shape the committed record states its absences in. */
function namedAbsence(what) {
  return {
    read: false,
    reason: `the ${what} of the title entry was not read (constructed by this suite, not committed)`,
  };
}

/** The source line a fact this suite constructs is labelled with — it is nobody's measurement. */
function construction(what) {
  return `${RECORD_REL}#entries[title].${what} (constructed by this suite, not committed)`;
}

/**
 * A navigation of the committed record, as the record's own facts name one: its index and its url,
 * read from `navigations[]` rather than restated.
 * @param {number} index
 */
function navigationValue(index) {
  const navigation = (RECORD.navigations ?? []).find(
    (one) => one.index === index,
  );
  assert.ok(
    navigation,
    `the committed record carries no navigation ${String(index)}, so this suite's cases cannot name one`,
  );
  return { index: navigation.index, url: navigation.url };
}

/**
 * A writing-navigation fact of the shape T001 writes when it read one: the navigation the observed
 * write followed. The committed record states this fact as not read, so nothing here is claimed to
 * be committed — it is a row constructed from the same shape.
 * @param {number} index
 */
function writingFact(index) {
  return {
    read: true,
    observed: true,
    value: navigationValue(index),
    source: construction('writtenBy'),
  };
}

/**
 * A duplicate fact of the shape T001 writes when it read one: the count of entries carrying the
 * name, and — where the record read one — the second entry itself.
 * @param {number} count @param {any} [second]
 */
function countedFact(count, second) {
  return {
    read: true,
    value:
      second === undefined
        ? { count: count }
        : { count: count, second: second },
    source: construction('duplicate'),
  };
}

// ---------------------------------------------------------------------- pinning ----

/**
 * The deficiency an answer carries: a key the surface does not render (a remedy, a cause, a route),
 * a reason that is prose rather than a named absence, or a reason of a type no state answers. Null
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
 * The strings an answer carries that the record it was made from does not contain, and that are not
 * one of the join's own names — nor a word the caller itself stated, which the answer may quote back
 * as the caller's own. A route named out of an entry's text, a cause or a remedy is found here.
 * @param {any} answer
 * @param {any} record
 * @param {any} [facts]
 * @returns {string[]}
 */
function inventedIn(answer, record, facts) {
  const said = saidIn(record);
  if (facts !== null && typeof facts === 'object') {
    for (const value of Object.values(facts)) {
      if (typeof value === 'string') said.add(value);
    }
  }
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
 * committed record itself or a document built from its own row and shape.
 */
function joinCases() {
  const committedRow = rowOf('title');
  const committedEntry = clone(committedRow.name.value);

  const unnamedRow = titleRow((row) => {
    row.name = namedAbsence('name');
  });
  const emptyNameRow = titleRow((row) => {
    row.name = { read: true, value: null, source: construction('name') };
  });
  const noDuplicateRow = titleRow((row) => {
    delete row.duplicate;
  });
  const uncountedRow = titleRow((row) => {
    row.duplicate = {
      read: true,
      value: {},
      source: construction('duplicate'),
    };
  });
  const countedOnlyRow = titleRow((row) => {
    row.duplicate = countedFact(2);
  });
  const duplicateRow = titleRow((row) => {
    row.duplicate = countedFact(2, clone(SECOND));
  });
  const duplicateWithWriterRow = titleRow((row) => {
    row.duplicate = countedFact(2, clone(SECOND));
    row.writtenBy = writingFact(0);
  });
  const staleRow = titleRow((row) => {
    row.duplicate = countedFact(1);
    row.writtenBy = writingFact(0);
  });
  const currentRow = titleRow((row) => {
    row.duplicate = countedFact(1);
    row.writtenBy = writingFact(2);
  });
  const unattributedRow = titleRow((row) => {
    row.duplicate = countedFact(1);
    row.writtenBy = namedAbsence('writtenBy');
  });
  const writerWithoutNavigationRow = titleRow((row) => {
    row.duplicate = countedFact(1);
    row.writtenBy = {
      read: true,
      observed: true,
      value: { url: navigationValue(0).url },
      source: construction('writtenBy'),
    };
  });
  const unreadCarryingRow = titleRow((row) => {
    row.duplicate = countedFact(1);
    row.writtenBy = writingFact(0);
    row.carriedBy = namedAbsence('carriedBy');
  });
  const carryingWithoutNavigationRow = titleRow((row) => {
    row.duplicate = countedFact(1);
    row.writtenBy = writingFact(0);
    row.carriedBy = {
      read: true,
      value: { url: navigationValue(2).url },
      source: construction('carriedBy'),
    };
  });
  const unreadPresentRow = titleRow((row) => {
    row.duplicate = countedFact(1);
    row.writtenBy = writingFact(0);
    row.remained = namedAbsence('remained');
  });
  const secondEntryRow = titleRow((row) => {
    row.entry = 'meta';
    row.name = { ...row.name, value: { element: 'meta' } };
    row.remained = {
      ...row.remained,
      value: {
        ...row.remained.value,
        element: 'meta',
        text: 'The Insurance Portal description',
      },
    };
  });

  return [
    {
      what: 'the committed title entry, whose duplicate and whose writing navigation the record states as not read',
      record: RECORD,
      facts: { entry: 'title' },
      state: 'cannot-tell',
      reason: 'duplicate-not-recorded',
      entry: committedEntry,
      present: presentOfRow(committedRow),
      writtenBy: null,
    },
    {
      what: 'a record carrying two entries and a caller naming none',
      record: {
        schema: RECORD.schema,
        milestone: RECORD.milestone,
        task: RECORD.task,
        entries: [rowOf('title'), secondEntryRow],
      },
      facts: undefined,
      state: 'cannot-tell',
      reason: 'entry-not-chosen',
      entry: null,
      present: null,
      writtenBy: null,
    },
    {
      what: 'a record that does not carry the entry the caller names',
      record: RECORD,
      facts: { entry: 'meta' },
      state: 'cannot-tell',
      reason: 'no-head-entry',
      entry: null,
      present: null,
      writtenBy: null,
    },
    {
      what: 'a record that is not a row, a list of rows or a document of rows',
      record: null,
      facts: undefined,
      state: 'cannot-tell',
      reason: 'record-unreadable',
      entry: null,
      present: null,
      writtenBy: null,
    },
    {
      what: 'a row whose name the record states it did not read',
      record: documentOf(unnamedRow),
      facts: {},
      state: 'cannot-tell',
      reason: 'name-not-recorded',
      entry: null,
      present: presentOfRow(unnamedRow),
      writtenBy: null,
    },
    {
      what: 'a name fact that was read and names no entry',
      record: documentOf(emptyNameRow),
      facts: {},
      state: 'cannot-tell',
      reason: 'name-not-an-entry',
      entry: null,
      present: presentOfRow(emptyNameRow),
      writtenBy: null,
    },
    {
      what: 'a row carrying no duplicate fact at all',
      record: documentOf(noDuplicateRow),
      facts: {},
      state: 'cannot-tell',
      reason: 'duplicate-not-recorded',
      entry: committedEntry,
      present: presentOfRow(noDuplicateRow),
      writtenBy: null,
    },
    {
      what: 'a duplicate fact that was read and carries no count of entries',
      record: documentOf(uncountedRow),
      facts: {},
      state: 'cannot-tell',
      reason: 'duplicate-not-a-count',
      entry: committedEntry,
      present: presentOfRow(uncountedRow),
      writtenBy: null,
    },
    {
      what: 'a record that counts two entries carrying the name and names no second entry',
      record: documentOf(countedOnlyRow),
      facts: {},
      state: 'cannot-tell',
      reason: 'duplicate-not-named',
      entry: committedEntry,
      present: presentOfRow(countedOnlyRow),
      writtenBy: null,
    },
    {
      what: 'a record that counts two entries carrying the name and names the second',
      record: documentOf(duplicateRow),
      facts: {},
      state: 'duplicate',
      reason: null,
      entry: committedEntry,
      present: presentOfRow(duplicateRow, clone(SECOND)),
      writtenBy: null,
    },
    {
      what: 'a duplicate that also names the navigation the record attributes the write to',
      record: documentOf(duplicateWithWriterRow),
      facts: {},
      state: 'duplicate',
      reason: null,
      entry: committedEntry,
      present: presentOfRow(duplicateWithWriterRow, clone(SECOND)),
      writtenBy: readValue(duplicateWithWriterRow.writtenBy),
    },
    {
      what: 'an entry one navigation wrote and another navigation\u2019s page carries',
      record: documentOf(staleRow),
      facts: {},
      state: 'stale',
      reason: null,
      entry: committedEntry,
      present: presentOfRow(staleRow),
      writtenBy: readValue(staleRow.writtenBy),
    },
    {
      what: 'an entry the navigation whose page carries it wrote',
      record: documentOf(currentRow),
      facts: {},
      state: 'current',
      reason: null,
      entry: committedEntry,
      present: presentOfRow(currentRow),
      writtenBy: readValue(currentRow.writtenBy),
    },
    {
      what: 'a write the record attributes to no navigation',
      record: documentOf(unattributedRow),
      facts: {},
      state: 'cannot-tell',
      reason: 'writtenBy-not-recorded',
      entry: committedEntry,
      present: presentOfRow(unattributedRow),
      writtenBy: null,
    },
    {
      what: 'a writing-navigation fact that names no navigation index',
      record: documentOf(writerWithoutNavigationRow),
      facts: {},
      state: 'cannot-tell',
      reason: 'writtenBy-not-a-navigation',
      entry: committedEntry,
      present: presentOfRow(writerWithoutNavigationRow),
      writtenBy: readValue(writerWithoutNavigationRow.writtenBy),
    },
    {
      what: 'a row whose carrying navigation the record states it did not read',
      record: documentOf(unreadCarryingRow),
      facts: {},
      state: 'cannot-tell',
      reason: 'carriedBy-not-recorded',
      entry: committedEntry,
      present: presentOfRow(unreadCarryingRow),
      writtenBy: readValue(unreadCarryingRow.writtenBy),
    },
    {
      what: 'a carrying-navigation fact that names no navigation index',
      record: documentOf(carryingWithoutNavigationRow),
      facts: {},
      state: 'cannot-tell',
      reason: 'carriedBy-not-a-navigation',
      entry: committedEntry,
      present: presentOfRow(carryingWithoutNavigationRow),
      writtenBy: readValue(carryingWithoutNavigationRow.writtenBy),
    },
    {
      what: 'a row whose entry still present the record states it did not read',
      record: documentOf(unreadPresentRow),
      facts: {},
      state: 'cannot-tell',
      reason: 'present-not-recorded',
      entry: committedEntry,
      present: null,
      writtenBy: readValue(unreadPresentRow.writtenBy),
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
    `${where}: the join names a remedy: ${deficiency} - a state that cannot tell names the fact it is missing and stops there, and no answer carries a remedy, a cause or a route the record did not carry`,
  );

  assert.deepEqual(
    Object.keys(answer).sort(),
    ANSWER_KEYS,
    `${where}: the answer carries the keys ${JSON.stringify(Object.keys(answer).sort())}, and an answer is exactly ${JSON.stringify(ANSWER_KEYS)}`,
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

  if (one.entry === null) {
    assert.equal(
      answer.entry,
      null,
      `${where}: the answer names the entry ${JSON.stringify(answer.entry)} and the record carries no name for the entry it joined: a join quotes the record's own entry and derives no second identity for one head entry`,
    );
  } else {
    assert.deepEqual(
      answer.entry,
      one.entry,
      `${where}: the answer names the entry ${JSON.stringify(answer.entry)} and the record carries ${JSON.stringify(one.entry)}`,
    );
  }

  // A duplicate names both entries, and a stale answer names the writing navigation. Both are named
  // together or the state is not answered, so each defect reddens before the generic quote checks.
  if (one.state === 'duplicate') {
    assert.ok(
      one.present !== null &&
        one.present.entry !== null &&
        typeof one.present.entry === 'object',
      'defect: the pin states a duplicate and names no entry still present, so its refusal proves nothing',
    );
    assert.notEqual(
      answer.present,
      null,
      `${where}: the duplicate answer names present as ${JSON.stringify(answer.present)}: a name present twice names the entry the record observed being written and the entry still present, and a duplicate that names only the first occurrence is not a duplicate answer`,
    );
    assert.deepEqual(
      answer.present.entry,
      one.present.entry,
      `${where}: the duplicate names present as ${JSON.stringify(answer.present.entry)} and the record names the second entry of the same name as ${JSON.stringify(one.present.entry)}: two entries share the name and both are named, so a duplicate that names only the first occurrence is not a duplicate answer`,
    );
  }

  if (one.state === 'stale' || one.state === 'current') {
    assert.notEqual(
      answer.writtenBy,
      null,
      `${where}: the ${one.state} answer names writtenBy as ${JSON.stringify(answer.writtenBy)} and the record attributes the entry's write to ${JSON.stringify(one.writtenBy)}: an entry written by one navigation and left behind by another names both navigations, and a staleness without the writing navigation is not this join's answer`,
    );
  }

  if (one.writtenBy === null) {
    assert.equal(
      answer.writtenBy,
      null,
      `${where}: the answer names the writing navigation writtenBy as ${JSON.stringify(answer.writtenBy)} and the record attributes no write to a navigation: a join that infers a writing navigation from the entry's text or its order in the head is the defect this pin names, and a state that cannot tell names no writer it was not given`,
    );
  } else {
    assert.deepEqual(
      answer.writtenBy,
      one.writtenBy,
      `${where}: the answer names the writing navigation ${JSON.stringify(answer.writtenBy)} and the record carries ${JSON.stringify(one.writtenBy)}`,
    );
  }

  if (one.present === null) {
    assert.equal(
      answer.present,
      null,
      `${where}: the answer names the entry still present as ${JSON.stringify(answer.present)} and the record read none: a state that cannot tell names the fact it is missing and adds no entry to it`,
    );
  } else {
    assert.deepEqual(
      answer.present,
      one.present,
      `${where}: the answer names the entry still present as ${JSON.stringify(answer.present)} and the record carries ${JSON.stringify(one.present)}, entry and carrying navigation together`,
    );
  }

  assert.equal(
    answer.reason,
    one.reason,
    `${where}: the reason reads ${JSON.stringify(answer.reason)} and the answer was expected to name ${JSON.stringify(one.reason)}`,
  );

  const invented = inventedIn(answer, one.record, one.facts);
  assert.deepEqual(
    invented,
    [],
    `${where}: the answer carries ${JSON.stringify(invented)}, none of which the record contains: a join quotes the record and names no route, no cause and no remedy it was not given, and no writing navigation it did not read`,
  );
}

/**
 * The whole pin, held against one join. The untouched module and every mutant face the same cases in
 * the same order, so a difference between them is the mutation and nothing else.
 * @param {(record: any, facts: any) => any} join
 */
function pinJoin(join) {
  assert.equal(
    typeof join,
    'function',
    'the pin is held against a join function, and it was handed ' + typeof join,
  );
  const cases = joinCases();
  assert.ok(
    cases.length >= 12,
    `the pin holds the join to ${String(cases.length)} case(s), which is too few to be a pin`,
  );
  for (const one of cases) pinAnswer(join(one.record, one.facts), one);
}

/**
 * The failure a pin raises on a join, so a mutant's evidence is the pin's own message rather than the
 * wrapper a `doesNotThrow` puts around it.
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
      Object.keys(headModule).sort(),
      ['headState'],
      `the module exports ${JSON.stringify(Object.keys(headModule).sort())}, and the interface contract is one function named headState`,
    );
    assert.equal(
      typeof headState,
      'function',
      'extension/head-state.js must export headState as a function',
    );
    assert.equal(
      headState.length,
      2,
      `the join takes the record and the facts, and it declares ${String(headState.length)} parameter(s)`,
    );
    console.log(
      `${MODULE_REL}: exports ${JSON.stringify(Object.keys(headModule).sort())} with ${String(headState.length)} parameters`,
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
      code.includes('export function headState'),
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
        `this suite names ${JSON.stringify(word)}, so it writes a recording: the join reads the record T001 wrote, and this task captures nothing`,
      );
    }
    assert.ok(
      source.includes('readFileSync('),
      'this suite must read the committed record rather than restate it, and it reads nothing',
    );
    assert.ok(
      RECORD.entries.length > 0,
      'the committed record was read into memory, and it carries no entry',
    );
  });
});

// ------------------------------------------------------- the committed record ----

describe('the committed record, joined as it stands', () => {
  it('AC3: answers cannot-tell naming the duplicate the record did not count, for the entry it carries', () => {
    const row = RECORD.entries[0];
    const answer = headState(RECORD, { entry: row.entry });
    assert.equal(
      answer.state,
      'cannot-tell',
      `${row.entry}: the record states that it counted no entry sharing the name and attributes no write to a navigation, so the join must answer cannot-tell and not ${JSON.stringify(answer.state)}`,
    );
    assert.equal(
      answer.reason,
      'duplicate-not-recorded',
      `${row.entry}: the first fact the comparison is missing is the count of entries carrying the name, and the answer names ${JSON.stringify(answer.reason)}`,
    );
    assert.equal(
      answer.writtenBy,
      null,
      `${row.entry}: the record attributes no write to a navigation, so the answer may name none and it names ${JSON.stringify(answer.writtenBy)}`,
    );
    const states = RECORD.entries.map(
      (one) => headState(RECORD, { entry: one.entry }).state,
    );
    assert.deepEqual(
      states,
      ['cannot-tell'],
      `a join over the committed record answers ${JSON.stringify(states)}, and the record counted no duplicate and named no writing navigation, so no current, stale or duplicate answer can be made from it`,
    );
    console.log(
      `committed record: ${String(RECORD.entries.length)} entry, joined state ${JSON.stringify(states)} (${String(answer.reason)})`,
    );
  });

  it('states both absences as measured, and quotes each with the reason the record gives', () => {
    const row = RECORD.entries[0];
    assert.equal(
      row.writtenBy.read,
      false,
      `defect: the committed record names a writing navigation, so this suite's account of the absence is wrong`,
    );
    assert.equal(
      row.duplicate.read,
      false,
      "defect: the committed record carries a count of entries sharing the name, so this suite's account of the absence is wrong",
    );
    const answer = headState(RECORD, { entry: row.entry });
    assert.equal(
      answer.observed.writtenBy.read,
      false,
      `observed must quote the record's own absence for the writing navigation, and it carries ${JSON.stringify(answer.observed.writtenBy)}`,
    );
    assert.equal(
      answer.observed.duplicate.read,
      false,
      `observed must quote the record's own absence for the duplicate, and it carries ${JSON.stringify(answer.observed.duplicate)}`,
    );
    assert.ok(
      answer.observed.writtenBy.reason.includes(row.entry),
      `the quoted absence must be the record's, naming the entry; it reads ${JSON.stringify(answer.observed.writtenBy.reason)}`,
    );
    assert.ok(
      answer.observed.duplicate.reason.includes(row.entry),
      `the quoted absence must be the record's, naming the entry; it reads ${JSON.stringify(answer.observed.duplicate.reason)}`,
    );
    assert.deepEqual(
      inventedIn(answer, RECORD),
      [],
      'the answer over the committed record names a route, a cause or a remedy the record does not carry',
    );
    console.log(
      `committed record: writtenBy and duplicate are measured absences -> cannot-tell (${String(answer.reason)})`,
    );
  });

  it('quotes the record in observed, rather than paraphrasing what it read', () => {
    const row = RECORD.entries[0];
    const answer = headState(RECORD, { entry: row.entry });
    assert.deepEqual(
      answer.observed,
      {
        entry: row.entry,
        entryChosen: row.entry,
        name: row.name,
        firstSeenAt: row.firstSeenAt,
        remained: row.remained,
        carriedBy: row.carriedBy,
        writtenBy: row.writtenBy,
        duplicate: row.duplicate,
      },
      `${row.entry}: observed must be what the record said for the entry - its five facts as recorded, the caller's entry and the row's own key - and it is ${JSON.stringify(answer.observed)}`,
    );
    const chosenByDefault = headState(RECORD);
    assert.equal(
      chosenByDefault.observed.entryChosen,
      null,
      `a caller that names no entry is quoted as naming none, and observed carries ${JSON.stringify(chosenByDefault.observed.entryChosen)}`,
    );
    assert.deepEqual(
      chosenByDefault,
      headState(row, {}),
      `the join reads one row as it reads a document of one row, and it answered ${JSON.stringify(headState(row, {}))} for the row`,
    );
    assert.deepEqual(
      headState(RECORD.entries, { entry: row.entry }),
      answer,
      `the join reads a list of rows as it reads the document's entries, and it answered ${JSON.stringify(headState(RECORD.entries, { entry: row.entry }))} for the list`,
    );
  });
});

// ----------------------------------------------- records constructed from the shape ----

describe('records constructed from the same shape', () => {
  it('AC1: a name present twice is duplicate, and both entries are named', () => {
    const row = titleRow((one) => {
      one.duplicate = countedFact(2, clone(SECOND));
    });
    const answer = headState(documentOf(row));
    assert.equal(
      answer.state,
      'duplicate',
      `a head carrying two entries named ${JSON.stringify(row.name.value.element)} is a duplicate, and the join answers ${JSON.stringify(answer.state)}`,
    );
    assert.deepEqual(
      answer.entry,
      row.name.value,
      `the duplicate must name the entry the record observed being written, and it names ${JSON.stringify(answer.entry)}`,
    );
    assert.notEqual(
      answer.present,
      null,
      `the duplicate must name the entry still present, and it names ${JSON.stringify(answer.present)}`,
    );
    assert.deepEqual(
      answer.present.entry,
      SECOND,
      `the duplicate must name the second entry of the same name as the record names it, and it names ${JSON.stringify(answer.present === null ? null : answer.present.entry)}`,
    );
    assert.notDeepEqual(
      answer.present.entry,
      answer.entry,
      'the two entries named are the same entry, so one of the two is not named',
    );
    assert.deepEqual(
      answer.present.carriedBy,
      row.carriedBy.value,
      `the duplicate quotes the navigation whose page carries the entry, and it names ${JSON.stringify(answer.present === null ? null : answer.present.carriedBy)}`,
    );
    assert.equal(
      answer.reason,
      null,
      `the record answered, so the answer names no reason for not answering, and it names ${JSON.stringify(answer.reason)}`,
    );
    console.log(
      `duplicate: ${JSON.stringify(answer.entry)} and ${JSON.stringify(answer.present.entry)} are both named`,
    );
  });

  it('AC2: an entry one navigation wrote and another page carries is stale, naming both navigations', () => {
    const row = titleRow((one) => {
      one.duplicate = countedFact(1);
      one.writtenBy = writingFact(0);
    });
    const answer = headState(documentOf(row));
    assert.equal(
      answer.state,
      'stale',
      `an entry navigation 0 wrote and navigation 2's page carries is stale, and the join answers ${JSON.stringify(answer.state)}`,
    );
    assert.deepEqual(
      answer.writtenBy,
      navigationValue(0),
      `the stale answer must name the navigation that wrote the entry, and it names ${JSON.stringify(answer.writtenBy)}`,
    );
    assert.deepEqual(
      answer.present.carriedBy,
      row.carriedBy.value,
      `the stale answer must name the navigation whose page carries the entry, and it names ${JSON.stringify(answer.present === null ? null : answer.present.carriedBy)}`,
    );
    assert.notEqual(
      answer.writtenBy.index,
      answer.present.carriedBy.index,
      'the stale answer names one navigation twice, so only one of the two navigations is named',
    );
    assert.equal(
      answer.reason,
      null,
      `the comparison was made, so the answer names no reason for not making it, and it names ${JSON.stringify(answer.reason)}`,
    );
    console.log(
      `stale: navigation ${String(answer.writtenBy.index)} wrote it, navigation ${String(answer.present.carriedBy.index)} carries it`,
    );
  });

  it('E3: an entry the navigation whose page carries it wrote is current, and a stale one is not current', () => {
    const written = titleRow((one) => {
      one.duplicate = countedFact(1);
      one.writtenBy = writingFact(2);
    });
    const answer = headState(documentOf(written));
    assert.equal(
      answer.state,
      'current',
      `navigation 2 both wrote the entry and carries it, so the join answers current and not ${JSON.stringify(answer.state)}`,
    );
    assert.equal(
      answer.writtenBy.index,
      answer.present.carriedBy.index,
      `the current answer names two different navigations, so the entry it calls current is the stale one`,
    );
    const left = titleRow((one) => {
      one.duplicate = countedFact(1);
      one.writtenBy = writingFact(0);
    });
    const stale = headState(documentOf(left));
    assert.notEqual(
      stale.state,
      'current',
      `navigation 0 wrote the entry and navigation 2 carries it, so the join answers ${JSON.stringify(stale.state)} and not current`,
    );
    console.log(
      `current: navigation ${String(answer.writtenBy.index)} wrote and carries it; stale stays ${JSON.stringify(stale.state)}`,
    );
  });

  it('E1: a head with one entry of the name reports no duplicate, and no finding with an empty comparison', () => {
    const row = titleRow((one) => {
      one.duplicate = countedFact(1);
      one.writtenBy = writingFact(2);
    });
    const answer = headState(documentOf(row));
    assert.notEqual(
      answer.state,
      'duplicate',
      `the record counted one entry carrying the name, so the join answers ${JSON.stringify(answer.state)} and not a duplicate`,
    );
    assert.ok(
      answer.present !== null && answer.present.entry !== null,
      `the entry the record read is still present, and the answer names ${JSON.stringify(answer.present)}`,
    );
    const counted = titleRow((one) => {
      one.duplicate = countedFact(2);
    });
    const unnamed = headState(documentOf(counted));
    assert.equal(
      unnamed.state,
      'cannot-tell',
      `a record that counts two entries and names no second answers the absence it measured, and this one answers ${JSON.stringify(unnamed.state)}`,
    );
    assert.equal(
      unnamed.reason,
      'duplicate-not-named',
      `the fact the comparison is missing is the second entry itself, and the answer names ${JSON.stringify(unnamed.reason)}`,
    );
  });

  it('AC3: a write with no navigation beside it is cannot-tell, naming that fact and inferring no route', () => {
    const row = titleRow((one) => {
      one.duplicate = countedFact(1);
      one.writtenBy = {
        read: false,
        observed: false,
        reason:
          'the observer saw no write for the entry, so no navigation is attributed to it (constructed by this suite)',
      };
    });
    const record = documentOf(row);
    const answer = headState(record);
    assert.equal(
      answer.state,
      'cannot-tell',
      `a write the record attributes to no navigation is not a stale entry and not a current one, and the join answers ${JSON.stringify(answer.state)}`,
    );
    assert.equal(
      answer.reason,
      'writtenBy-not-recorded',
      `the fact the comparison is missing is the writing navigation, and the answer names ${JSON.stringify(answer.reason)}`,
    );
    assert.equal(
      answer.writtenBy,
      null,
      `the record attributes no write to a navigation, so the answer may name none and it names ${JSON.stringify(answer.writtenBy)} - a navigation read off the entry's text is an inference and not a reading`,
    );
    assert.equal(
      banned(answer),
      null,
      `the answer carries ${JSON.stringify(banned(answer))}, and a state that cannot tell names no remedy, no cause and no route the record did not carry`,
    );
    assert.deepEqual(
      inventedIn(answer, record),
      [],
      `the answer carries ${JSON.stringify(inventedIn(answer, record))}, none of which the record contains: no route is read out of the entry's text`,
    );
  });

  it('a state that cannot tell still quotes what it read, and names nothing it did not', () => {
    const row = titleRow((one) => {
      one.duplicate = countedFact(1);
      one.writtenBy = namedAbsence('writtenBy');
    });
    const answer = headState(documentOf(row));
    assert.deepEqual(
      answer.entry,
      row.name.value,
      `the entry the record named is quoted in a cannot-tell answer, and it names ${JSON.stringify(answer.entry)}`,
    );
    assert.deepEqual(
      answer.present,
      presentOfRow(row),
      `the entry still present and the page carrying it are quoted, and the answer names ${JSON.stringify(answer.present)}`,
    );
    assert.deepEqual(inventedIn(answer, documentOf(row)), []);
  });

  it('purity: reads a frozen record and frozen facts, writes neither, and points into neither', () => {
    const row = titleRow((one) => {
      one.duplicate = countedFact(1);
      one.writtenBy = writingFact(0);
    });
    const record = documentOf(row);
    deepFreeze(record);
    const facts = deepFreeze({ entry: 'title' });
    let answer = null;
    assert.doesNotThrow(() => {
      answer = headState(record, facts);
    }, 'the join wrote to a frozen record or to frozen facts, so it is not a pure read');
    assert.equal(answer.state, 'stale');
    assert.notEqual(
      answer.present.entry,
      record.entries[0].remained.value,
      'the answer must quote the record, not point into it, so a caller cannot move the record by writing the answer',
    );
    answer.present.entry.text = 'mutated';
    assert.equal(
      record.entries[0].remained.value.text,
      'Insurance Portal',
      'the record moved when the answer was written, so the answer points into the record',
    );
    assert.equal(
      answer.observed.remained.read,
      true,
      'observed must still quote the record after the answer was edited',
    );
    const frozenSource = JSON.stringify(record);
    headState(record, facts);
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
      () => pinJoin(headState),
      'the pin refuses the untouched module, so no mutant planted on it would mean anything',
    );
    const states = new Set(
      joinCases().map((one) => headState(one.record, one.facts).state),
    );
    assert.deepEqual(
      [...states].sort(),
      [...STATES].sort(),
      `the pin's cases answer ${JSON.stringify([...states].sort())}, and a pin that never reaches every state does not pin the join's states ${JSON.stringify([...STATES].sort())}`,
    );
    const reasons = new Set(
      joinCases().map((one) => headState(one.record, one.facts).reason),
    );
    assert.deepEqual(
      [...reasons].filter((one) => one !== null).sort(),
      [...REASONS].sort(),
      `the pin's cases name ${JSON.stringify([...reasons].filter((one) => one !== null).sort())}, and the join's absences are ${JSON.stringify(REASONS)}: a reason no case reaches is a reason no assertion holds`,
    );
    console.log(
      `the pin holds the untouched module to ${String(joinCases().length)} case(s), answering all ${String(STATES.length)} states and all ${String(REASONS.length)} reasons`,
    );
  });

  it('AC1 mutant: a duplicate naming only the first occurrence reddens the pin, naming both entries', () => {
    assert.doesNotThrow(
      () => pinJoin(headState),
      'the untouched module must pass the pin before the mutation is planted',
    );
    /** The join with one defect: a duplicate that names the entry the record observed twice. */
    const namesOnlyTheFirst = (record, facts) => {
      const answer = headState(record, facts);
      if (answer === null || answer.state !== 'duplicate') return answer;
      return { ...answer, present: { ...answer.present, entry: answer.entry } };
    };
    const failure = reddens(
      () => pinJoin(namesOnlyTheFirst),
      'a duplicate that names only the first occurrence',
    );
    assert.match(
      failure.message,
      /names only the first occurrence/,
      `the refusal must say that a duplicate names both entries; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.ok(
      failure.message.includes('present') && failure.message.includes('title'),
      `the refusal must name the field the second entry is read from and the entry itself; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.doesNotThrow(
      () => pinJoin(headState),
      'the pin must pass the untouched module after the mutant is proved',
    );
    console.log(`duplicate mutant: ${failure.message}`);
  });

  it('AC2 mutant: a stale answer without the writing navigation reddens the pin, naming both navigations', () => {
    assert.doesNotThrow(
      () => pinJoin(headState),
      'the untouched module must pass the pin before the mutation is planted',
    );
    /** The join with one defect: a staleness with no navigation named as the writer. */
    const staleWithoutWriter = (record, facts) => {
      const answer = headState(record, facts);
      if (answer === null || answer.state !== 'stale') return answer;
      return { ...answer, writtenBy: null };
    };
    const failure = reddens(
      () => pinJoin(staleWithoutWriter),
      'a staleness without the writing navigation',
    );
    assert.match(
      failure.message,
      /without the writing navigation/,
      `the refusal must say that a staleness names the navigation that wrote the entry; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.ok(
      failure.message.includes('writtenBy') &&
        failure.message.includes('stale'),
      `the refusal must name the writing navigation and the state it refused; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.match(
      failure.message,
      /"index":0/,
      `the refusal must name the navigation the record attributes the write to; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.doesNotThrow(
      () => pinJoin(headState),
      'the pin must pass the untouched module after the mutant is proved',
    );
    console.log(`stale mutant: ${failure.message}`);
  });

  it('AC3 mutant: a join that names a remedy and a route reddens the pin, naming both', () => {
    assert.doesNotThrow(
      () => pinJoin(headState),
      'the untouched module must pass the pin before the mutation is planted',
    );
    const remedy =
      'count the entries sharing each name in the capture, then join the count';
    const route = '/panel/head-state';
    /** The join with one defect: a state that cannot tell, followed by what to do about it. */
    const namesARemedy = (record, facts) => {
      const answer = headState(record, facts);
      if (answer === null || answer.state !== 'cannot-tell') return answer;
      return { ...answer, remedy: remedy, route: route };
    };
    const failure = reddens(
      () => pinJoin(namesARemedy),
      'a join that names a remedy and a route',
    );
    assert.match(
      failure.message,
      /names a remedy/,
      `the refusal must say that a remedy is what it found; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.ok(
      failure.message.includes(remedy) && failure.message.includes(route),
      `the refusal must name the remedy and the route the mutant added; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.ok(
      failure.message.includes(
        'no answer carries a remedy, a cause or a route the record did not carry',
      ),
      `the refusal must state what no answer may carry; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
    );
    assert.doesNotThrow(
      () => pinJoin(headState),
      'the pin must pass the untouched module after the mutant is proved',
    );
    console.log(`remedy mutant: ${failure.message}`);
  });

  it('N2 mutant: a write inferred from the entry\u2019s text or its order in the head reddens the pin, naming the inference', () => {
    assert.doesNotThrow(
      () => pinJoin(headState),
      'the untouched module must pass the pin before the mutation is planted',
    );
    const text = 'Insurance Portal';
    const fromText = (RECORD.navigations ?? []).find(
      (one) => one.title === text,
    );
    const fromOrder = (RECORD.navigations ?? [])[0];
    assert.ok(
      fromText && fromOrder,
      'the committed record carries no navigation to infer a writer from, so this mutant is planted nowhere',
    );
    /** The join with one defect: a writer made up out of the entry's text. */
    const writerFromText = (record, facts) => {
      const answer = headState(record, facts);
      if (answer === null || answer.writtenBy !== null) return answer;
      return {
        ...answer,
        writtenBy: { index: fromText.index, url: fromText.url },
      };
    };
    /** The join with one defect: a writer made up out of the entry's order in the head. */
    const writerFromOrder = (record, facts) => {
      const answer = headState(record, facts);
      if (answer === null || answer.writtenBy !== null) return answer;
      return {
        ...answer,
        writtenBy: { index: fromOrder.index, url: fromOrder.url },
      };
    };
    for (const [what, mutant] of [
      ['the entry\u2019s text', writerFromText],
      ['the entry\u2019s order in the head', writerFromOrder],
    ]) {
      const failure = reddens(
        () => pinJoin(mutant),
        `a writing navigation inferred from ${what}`,
      );
      assert.match(
        failure.message,
        /infers a writing navigation from the entry's text or its order in the head/,
        `the refusal must name the inference for ${what}; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
      );
      assert.ok(
        failure.message.includes('writtenBy'),
        `the refusal must name the field the inferred writer was written into; it produced ${JSON.stringify(failure.message.slice(0, 400))}`,
      );
      console.log(`inferred-writer mutant (${what}): ${failure.message}`);
    }
    assert.doesNotThrow(
      () => pinJoin(headState),
      'the pin must pass the untouched module after the mutants are proved',
    );
  });

  it('the four mutants are four different defects, each caught by the pin it names', () => {
    const mutant = {
      namesOnlyTheFirst: (answer) =>
        answer.state === 'duplicate'
          ? { ...answer, present: { ...answer.present, entry: answer.entry } }
          : answer,
      staleWithoutWriter: (answer) =>
        answer.state === 'stale' ? { ...answer, writtenBy: null } : answer,
      remedy: (answer) =>
        answer.state === 'cannot-tell'
          ? { ...answer, remedy: 'read the head again' }
          : answer,
      writerFromOrder: (answer) =>
        answer.writtenBy !== null
          ? answer
          : {
              ...answer,
              writtenBy: {
                index: (RECORD.navigations ?? [])[0].index,
                url: (RECORD.navigations ?? [])[0].url,
              },
            },
    };
    const caught = [];
    for (const [name, decorate] of Object.entries(mutant)) {
      const decorated = (record, facts) => decorate(headState(record, facts));
      try {
        pinJoin(decorated);
      } catch (error) {
        caught.push(name);
      }
    }
    assert.deepEqual(
      caught.sort(),
      ['namesOnlyTheFirst', 'remedy', 'staleWithoutWriter', 'writerFromOrder'],
      `the pin caught ${JSON.stringify(caught.sort())}, and it must catch all four defects: one mutant standing for another would hide a defect behind a passing test`,
    );
    assert.equal(
      JSON.stringify(RECORD),
      RECORD_TEXT,
      `the committed record was read for these mutants and was never rewritten, and it moved across this run: ${String(RECORD_TEXT.length)} bytes became ${String(JSON.stringify(RECORD).length)}`,
    );
    console.log(
      `four mutants, four defects: ${JSON.stringify(caught.sort())} each redden the pin; the record was neither rewritten nor re-captured`,
    );
  });
});
