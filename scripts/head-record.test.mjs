// M068 T001 — the head record: every document head entry the M065 observation read, written as the
// facts this milestone's join is given, before any join exists.
//
// Nothing in this repository reads a document head entry: `extension/*.js` carries no `document.head`
// and no `document.title`, so the record this milestone joins is one this milestone writes. The only
// reading of a head entry this checkout carries is M065's observation of the same page area —
// `research/raw/m065-title-record.json`, whose observer was installed on the `<title>` element and
// `document.head` in a CDP isolated world and whose own record states `writesSeen: 0` with "the
// observer names no writer". This suite does not paper over that: it derives the record from that
// committed observation, and an entry whose writing navigation was not read says so, with the reason,
// rather than naming a navigation, a duplicate or a route the observation never carried.
//
// Per head entry, four facts and two named absences (the meanings are the record's own `facts` block):
//
//   name         the entry's own name, read from the observation key that recorded the element —
//                never from the entry's text, and never a second spelling of one entry.
//   firstSeenAt  the earliest navigation at which the record read the entry present.
//   remained     the entry still present at the last read the record holds, with its own value.
//   carriedBy    the navigation whose page carries the entry at that last read.
//   writtenBy    the navigation the record correlates the write with, read from the record's own
//                `writes` list and from nothing else. At this head it was not read: the observation
//                saw no write and the one write the record holds is the title the document carried
//                before the observer attached, so no navigation is named.
//   duplicate    the second entry of the same name. At this head it was not read: the record carries
//                one title value per read and no count of elements carrying the name, so a second
//                `<title>` would be invisible to it and none is invented.
//
// Default run — a read: it hashes the committed record before and after, asserts nothing moved, and
// asserts the committed record is exactly what this head derives, naming the field and the value that
// moved when it is not.
//
//   node --test scripts/head-record.test.mjs
//
// The one write, armed by its own flag. The writer derives through the recorded document, writes only
// when a value moved, so two armed runs leave the file byte-identical, and it refuses to write a
// candidate that is not a fixed point of this suite's own default pin — the rule T002 established for
// the claims census after M065's rebasing was written into the reader and not the writer.
//
//   M068_CAPTURE=1 node --test scripts/head-record.test.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUITE_REL = 'scripts/head-record.test.mjs';
const RECORD_REL = 'research/raw/m068-head-record.json';
const RECORD_PATH = join(ROOT, ...RECORD_REL.split('/'));

/** The observation this record derives from: the one reading of a head entry this checkout holds. */
const SOURCE_REL = 'research/raw/m065-title-record.json';
const SOURCE_PATH = join(ROOT, ...SOURCE_REL.split('/'));

/** The shipped reader of that same record: the module the entry identity is asserted against. */
const PRODUCER_REL = 'extension/title-input.js';

/** The two files AC3 owes a row: the manifest of recordings, and the census's reason table. */
const RECORDINGS_REL = 'scripts/recordings.json';
const GATE_REL = 'scripts/gate-integrity.test.mjs';

/** The record's own shape, named as a literal and checked before anything is compared. */
const SCHEMA = 'm068-head-record/v1';
const MILESTONE = 'M068';
const TASK = 'T001';
const QUESTION =
  'Which document head entry does the portal carry, what is its name, which navigation was it first seen at, which entry remained, and which navigation whose page carries it — and which of its writing navigation and its duplicate was not read?';

/** The commands this record is held to, recorded in it so a reader runs what produced it. */
const CAPTURE_ENV = 'M068_CAPTURE';
const ARM = `${CAPTURE_ENV}=1`;
const CHECK_COMMAND = `node --test ${SUITE_REL}`;
const CAPTURE_COMMAND = `${ARM} ${CHECK_COMMAND}`;
const ARMED = String(process.env[CAPTURE_ENV] ?? '').trim() === '1';

/** The one head element this observation recorded, and the phase a settled read is taken from. */
const HEAD_ELEMENT = 'title';
const SETTLED_PHASE = 'after-navigation';

/** A fixed-width instant, the only shape this record accepts for a time. */
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/** The four facts SC3 names, in the order this record states them. */
const FACTS = ['name', 'firstSeenAt', 'remained', 'carriedBy'];

/** The two facts this head could not read, kept as facts rather than softened into prose. */
const ABSENCES = ['writtenBy', 'duplicate'];

/**
 * Every key an entry carries — the name it is keyed by and its six facts — so a key added to the
 * shape is refused until the record is rederived.
 */
const ENTRY_KEYS = ['entry', ...FACTS, ...ABSENCES].sort();

/**
 * What each fact is, stated once and recorded in the record's own `facts` block, so a reason for an
 * absence and the meaning of a value are read from one place.
 */
const FACT_MEANING = {
  name: 'The entry’s own name: the element the observation recorded, read from the observation key that recorded it and never from the entry’s text — one spelling, and no second identity for one entry.',
  firstSeenAt:
    'The earliest navigation at which this record read the entry present: the navigation the observation began after, at the instant it began, with the document already carrying the entry.',
  remained:
    'The entry still present at the last read the record holds, with the entry’s own value and the navigations whose settled read carried it.',
  carriedBy:
    'The navigation whose page carries the entry at that last read: its index, its url and the instant of the read that carried it.',
  writtenBy:
    'The navigation the record correlates the entry’s write with, read from the record’s own `writes` list and from no other field, and the statement that it was not read where that list attributes no write to a navigation.',
  duplicate:
    'The second entry of the same name, where the record read one, and the statement that it was not read where the record carries no count of elements carrying that name.',
};

/** The files this record is derived from, and what each one contributes. */
const SOURCES = [
  {
    path: SOURCE_REL,
    contributes:
      'the observation: what the head carried when it began, at which navigations it was read, what the document carried at each settled read, and the writes the observer saw — which is none.',
  },
  {
    path: PRODUCER_REL,
    contributes:
      'the shipped reader of that same observation: this suite runs it in a bare node:vm context and reads back the field list it publishes, so the entry identity this record carries is the word the reader reads rather than a second spelling.',
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

/** Whether a value is an object and not an array. @param {any} value @returns {boolean} */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** A refusal inside a pin, as an Error whose message names what moved. @param {string} message */
function fail(message) {
  throw new Error(message);
}

/**
 * The first place two values differ, as `path: recorded -> derived`, so a stale value is named rather
 * than reported as a mismatch somewhere in a record of several hundred lines.
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
  if (isObject(left) && isObject(right)) {
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

/** Whether a value is one of the record's facts: a read flag and a value or a reason. */
function isFact(value) {
  return isObject(value) && typeof value.read === 'boolean';
}

/** Every key path of a value, in order, so a scan for a name is a reading of the record. */
function keyPaths(value, at = '') {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => keyPaths(entry, `${at}[${index}]`));
  }
  if (!isObject(value)) return [];
  const found = [];
  for (const [key, entry] of Object.entries(value)) {
    const next = at === '' ? key : `${at}.${key}`;
    found.push(next, ...keyPaths(entry, next));
  }
  return found;
}

// ---------------------------------------------------------------- deriving ----

/**
 * The observation this record derives from, read once per run. The recorded document is the first
 * thing the derivation reads, and every fact below comes from it or from the shipped reader beside it.
 * @returns {any}
 */
let SOURCE = null;
function sourceRecord() {
  if (SOURCE !== null) return SOURCE;
  const record = readJson(
    SOURCE_REL,
    'the observation this record derives from',
  );
  assert.equal(
    record?.schema,
    'm065-title-record/v1',
    `${SOURCE_REL} must be the M065 title observation, and it states the schema ${JSON.stringify(record?.schema)}`,
  );
  assert.equal(
    record?.milestone,
    'M065',
    `${SOURCE_REL} must be the M065 observation, and it names ${JSON.stringify(record?.milestone)}`,
  );
  const observation = record?.observation;
  assert.ok(
    isObject(observation),
    `${SOURCE_REL} must carry the observation block this record is a reading of`,
  );
  assert.ok(
    Array.isArray(observation.reads) && observation.reads.length > 0,
    `${SOURCE_REL} must record the reads its observer took, or the entry was never read at a navigation`,
  );
  assert.ok(
    Array.isArray(record.navigations) && record.navigations.length > 0,
    `${SOURCE_REL} must record the navigations beside the observation, or no navigation can be named`,
  );
  assert.ok(
    Array.isArray(record.writes) && record.writes.length > 0,
    `${SOURCE_REL} must record the writes it knows of, or "no writing navigation" would be a silence rather than a reading`,
  );
  SOURCE = record;
  return SOURCE;
}

/** The bytes the source observation has at load, so a default run proves it did not write it. */
const SOURCE_AT_LOAD = existsSync(SOURCE_PATH)
  ? digest(readFileSync(SOURCE_PATH))
  : null;

/**
 * The settled read of one navigation: the last `after-navigation` title the record states for it,
 * which is the read the title the document carried when the navigation settled is taken from.
 * @param {any} navigation
 * @returns {{ value: string, at: string | null } | null}
 */
function settledRead(navigation) {
  const titles = Array.isArray(navigation?.titles) ? navigation.titles : [];
  let settled = null;
  for (const entry of titles) {
    if (!isObject(entry)) continue;
    if (entry.phase !== SETTLED_PHASE) continue;
    if (typeof entry.value !== 'string' || entry.value.trim() === '') continue;
    settled = { value: entry.value, at: entry.at ?? null };
  }
  return settled;
}

/**
 * The navigations the observation recorded, in the order it recorded them, each with the title its
 * settled read carried. A navigation that carries no settled title is kept: it is a navigation that
 * carries no entry, not a navigation this suite may drop.
 * @param {any} record
 * @returns {Array<Record<string, any>>}
 */
function navigationsOf(record) {
  const navigations = record.navigations.map((navigation) => {
    assert.ok(
      isObject(navigation) && Number.isInteger(navigation.index),
      `${SOURCE_REL} carries a navigation that names no index, so no write could be attributed to it`,
    );
    assert.ok(
      typeof navigation.url === 'string' && navigation.url.startsWith('/'),
      `${SOURCE_REL}#navigations[${String(navigation.index)}].url is ${JSON.stringify(navigation.url)}, and a route begins with a slash`,
    );
    const settled = settledRead(navigation);
    return {
      index: navigation.index,
      trigger: navigation.trigger ?? null,
      requestedUrl: navigation.requestedUrl ?? null,
      url: navigation.url,
      settledAt: navigation.settledAt ?? null,
      observedByObserver: navigation.observedByObserver === true,
      title: settled === null ? null : settled.value,
      titleAt: settled === null ? null : settled.at,
    };
  });
  assert.deepEqual(
    navigations.map((one) => one.index),
    navigations.map((_, index) => index),
    `the navigations this record holds are numbered from 0 in arrival order, and ${SOURCE_REL} carries ${JSON.stringify(navigations.map((one) => one.index))}`,
  );
  return navigations;
}

/**
 * The names of the head entries the observation recorded, derived from the observation's own keys:
 * a key `observed<Name>Element` set to true is the record saying that element was observed. Nothing
 * here reads the entry's text or the mechanism's prose for a name.
 * @param {any} record
 * @returns {string[]}
 */
function observedNames(record) {
  const observation = record.observation;
  const names = [];
  for (const [key, value] of Object.entries(observation)) {
    const match = /^observed([A-Z][A-Za-z0-9]*)Element$/.exec(key);
    if (match === null) continue;
    assert.equal(
      typeof value,
      'boolean',
      `${SOURCE_REL}#observation.${key} is ${JSON.stringify(value)}, and a key shaped that way states whether an element was observed`,
    );
    if (value !== true) continue;
    names.push(String(match[1]).toLowerCase());
  }
  assert.ok(
    names.length > 0,
    `${SOURCE_REL}#observation records no head element as observed, so this record would name an entry nothing read`,
  );
  assert.deepEqual(
    names,
    [HEAD_ELEMENT],
    `the observation recorded ${JSON.stringify(names)} as observed, and this record measures ${JSON.stringify([HEAD_ELEMENT])}: another name would be a head entry the observation did not read`,
  );
  return names;
}

/** The element each read carried a single value for, and the most values one read carried. */
function readShape(record) {
  const counts = record.navigations.map((navigation) => {
    const titles = Array.isArray(navigation?.titles) ? navigation.titles : [];
    return titles.length;
  });
  return {
    navigations: record.navigations.length,
    readingsPerNavigation: counts,
    mostReadingsForOneNavigation: counts.length === 0 ? 0 : Math.max(...counts),
  };
}

/**
 * Every key path whose name could carry a count of head entries sharing a name: both a head-entry word
 * and a counting word. An empty list is the measurement that no such count was read, and it is what
 * makes `duplicate` a stated absence rather than a gap.
 * @param {any} record
 * @returns {Array<{ path: string, value: any }>}
 */
function duplicateCountKeys(record) {
  const entryWord = /(?:element|entry|entries|occurrence|duplicate|repeat)/i;
  const countWord = /(?:count|counts|length|total|number)/i;
  return keyPaths(record)
    .filter((path) => {
      const last = path.split('.').pop() ?? path;
      return entryWord.test(last) && countWord.test(last);
    })
    .map((path) => ({ path, value: pathOf(record, path) }));
}

/** The value one key path of a parsed value names. @param {any} value @param {string} path */
function pathOf(value, path) {
  let cursor = value;
  for (const part of path.split('.')) {
    const keyed = /^([^[\]]+)((?:\[\d+\])*)$/.exec(part);
    if (keyed === null) return undefined;
    cursor = cursor?.[keyed[1]];
    for (const index of keyed[2].matchAll(/\[(\d+)\]/g)) {
      cursor = cursor?.[Number(index[1])];
    }
  }
  return cursor;
}

/**
 * The entry's name: the element the observation recorded, asserted against the record's own key and
 * against the mechanism that says what it watched. Never the entry's text, never a second spelling.
 * @param {any} record @param {string} name
 * @returns {any}
 */
function nameFrom(record, name) {
  const names = observedNames(record);
  assert.ok(
    names.includes(name),
    `${SOURCE_REL}#observation records ${JSON.stringify(names)} as the observed head element, so ${JSON.stringify(name)} would be a name this observation did not read`,
  );
  const mechanism = String(record.observation.mechanism ?? '');
  assert.ok(
    mechanism.includes(`<${name}>`),
    `${SOURCE_REL}#observation.mechanism must name the \`<${name}>\` element the observer watched, and it states ${JSON.stringify(mechanism.slice(0, 160))}: a name the mechanism does not carry would be one this record derived on its own`,
  );
  return {
    read: true,
    value: { element: name },
    source: `${SOURCE_REL}#observation.observed${name[0].toUpperCase()}${name.slice(1)}Element and #observation.mechanism`,
  };
}

/**
 * The navigation the entry was first seen at: the navigation the observation began after, at the
 * instant it began. The record states the title the document carried at that instant, so the entry
 * was read as present there rather than inferred from a later read.
 * @param {any} record @param {string} name
 * @returns {any}
 */
function firstSeenFrom(record, name) {
  const observation = record.observation;
  assert.ok(
    Number.isInteger(observation.beganAfterIndex),
    `${SOURCE_REL}#observation.beganAfterIndex is ${JSON.stringify(observation.beganAfterIndex)}, and the navigation the observation began after is the earliest one this record can name`,
  );
  const first = observation.reads[0];
  assert.ok(
    isObject(first) && Number.isInteger(first.navigationIndex),
    `${SOURCE_REL}#observation.reads[0] names no navigation, so the first read the record holds cannot be placed beside a navigation`,
  );
  assert.equal(
    first.navigationIndex,
    observation.beganAfterIndex,
    `${SOURCE_REL}#observation.reads[0].navigationIndex is ${String(first.navigationIndex)} and the observation states it began after navigation ${String(observation.beganAfterIndex)}: the first read and the beginning are one navigation`,
  );
  const navigation = record.navigations.find(
    (one) => one?.index === observation.beganAfterIndex,
  );
  assert.ok(
    navigation,
    `${SOURCE_REL}#observation.beganAfterIndex names navigation ${String(observation.beganAfterIndex)} and the record's navigations carry ${JSON.stringify(record.navigations.map((one) => one?.index))}`,
  );
  assert.equal(
    navigation.url,
    observation.beganAfterUrl,
    `${SOURCE_REL}#observation.beganAfterUrl is ${JSON.stringify(observation.beganAfterUrl)} and navigations[${String(observation.beganAfterIndex)}].url is ${JSON.stringify(navigation.url)}: the navigation the observation began after is the one whose url it states`,
  );
  assert.match(
    String(observation.beganAt),
    ISO,
    `${SOURCE_REL}#observation.beganAt is ${JSON.stringify(observation.beganAt)}, and the instant the observation began is the instant the entry was first read as present`,
  );
  assert.ok(
    typeof observation.titleAtStart === 'string' &&
      observation.titleAtStart.trim() !== '',
    `${SOURCE_REL}#observation.titleAtStart is ${JSON.stringify(observation.titleAtStart)}: with no title carried at the instant the observation began, the ${name} entry was not read at that navigation at all`,
  );
  return {
    read: true,
    value: {
      index: observation.beganAfterIndex,
      url: observation.beganAfterUrl,
      at: observation.beganAt,
    },
    source: `${SOURCE_REL}#observation.beganAt, #observation.beganAfterIndex, #observation.beganAfterUrl and #observation.reads[0]`,
  };
}

/** The navigations whose settled read carried a title, in arrival order. @param {any} record */
function carryingNavigations(record) {
  return navigationsOf(record).filter((one) => one.title !== null);
}

/**
 * The entry that remained: the entry present at the last read the record holds, with its value, the
 * navigations whose settled read carried it, and whether every read carried the same value — the last
 * of which is what makes it one entry that remained rather than two.
 * @param {any} record @param {string} name
 * @returns {any}
 */
function remainedFrom(record, name) {
  const carrying = carryingNavigations(record);
  assert.ok(
    carrying.length > 0,
    `${SOURCE_REL} carries no settled read with a title, so no entry remained and none may be named`,
  );
  const last = carrying[carrying.length - 1];
  const sameTextAtEveryRead = carrying.every((one) => one.title === last.title);
  return {
    read: true,
    value: {
      element: name,
      text: last.title,
      navigationsCarrying: carrying.map((one) => one.index),
      sameTextAtEveryRead,
    },
    source: `${SOURCE_REL}#navigations[].titles[] (phase ${SETTLED_PHASE}), the last of them the entry that remained`,
  };
}

/**
 * The navigation whose page carries the entry: the last navigation the record holds whose settled
 * read carried it, with the instant of that read. Never a navigation the record does not carry.
 * @param {any} record @param {string} name
 * @returns {any}
 */
function carriedByFrom(record, name) {
  const carrying = carryingNavigations(record);
  assert.ok(
    carrying.length > 0,
    `${SOURCE_REL} carries no settled read with a title, so no page is recorded as carrying the ${name} entry`,
  );
  const last = carrying[carrying.length - 1];
  return {
    read: true,
    value: { index: last.index, url: last.url, at: last.titleAt },
    source: `${SOURCE_REL}#navigations[${String(last.index)}].titles[] (the last phase ${SETTLED_PHASE} read)`,
  };
}

/**
 * The navigation the record correlates the entry's write with. Read from the record's own `writes`
 * list and from nothing else: a write the observer saw is attributed to the navigation it followed,
 * and where no write was observed the fact was not read and no navigation is named.
 * @param {any} record @param {string} name
 * @returns {any}
 */
function writtenByFrom(record, name) {
  const observation = record.observation;
  const writes = (record.writes ?? []).filter(isObject);
  const observed = writes.filter((write) => write.observed === true);
  const readsThatSawAWrite = (observation.reads ?? []).filter(
    (read) => Number(read?.writesSeen) > 0,
  );
  if (observed.length > 0) {
    const attributed = observed.filter((write) =>
      Number.isInteger(write.navigationIndex),
    );
    if (attributed.length === 0) {
      return {
        read: false,
        observed: true,
        reason: `the observer saw ${String(observed.length)} write(s) for the ${name} entry and ${SOURCE_REL}#writes attributes none of them to a navigation: the writing navigation was not read, and no navigation is inferred from the entry's text or its order in the head`,
      };
    }
    const write = attributed[attributed.length - 1];
    const navigation = record.navigations.find(
      (one) => one?.index === write.navigationIndex,
    );
    assert.ok(
      navigation,
      `${SOURCE_REL}#writes names navigation ${String(write.navigationIndex)} for an observed write, and the record carries ${JSON.stringify(record.navigations.map((one) => one?.index))}`,
    );
    return {
      read: true,
      observed: true,
      value: { index: navigation.index, url: navigation.url },
      source: `${SOURCE_REL}#writes[].navigationIndex (the navigation the observed write followed)`,
    };
  }
  const basis = writes
    .map((write) => String(write.basis ?? '').trim())
    .filter((text) => text !== '')
    .join(' | ');
  return {
    read: false,
    observed: false,
    reason: `the ${name} entry's writing navigation was not read: ${SOURCE_REL}#observation.writesSeen is ${String(observation.writesSeen)} and ${String(readsThatSawAWrite.length)} of its ${String((observation.reads ?? []).length)} read(s) recorded one, and the ${String(writes.length)} ${writes.length === 1 ? 'entry' : 'entries'} its \`writes\` list holds ${writes.length === 1 ? 'carries' : 'carry'} observed ${JSON.stringify(writes.map((write) => write.observed))}, navigationIndex ${JSON.stringify(writes.map((write) => write.navigationIndex))} and author ${JSON.stringify(writes.map((write) => write.author))}${basis === '' ? '' : `, on the record's own basis ${JSON.stringify(basis)}`}; the record is the only source of a writing navigation and it attributes none, so none is named and no route is inferred from the entry's text`,
  };
}

/**
 * The second entry of the same name, where the record read one. Where the record carries no count of
 * elements carrying the name, the fact was not read and the reason names the shape that makes it
 * unreadable — the record states one value per read, and a second element would be invisible to it.
 * @param {any} record @param {string} name
 * @returns {any}
 */
function duplicateFrom(record, name) {
  const counts = duplicateCountKeys(record);
  const shape = readShape(record);
  if (counts.length > 0) {
    const first = counts[0];
    return {
      read: true,
      value: { count: first.value },
      source: `${SOURCE_REL}#${first.path}`,
    };
  }
  return {
    read: false,
    reason: `the ${name} entry's duplicate was not read: ${SOURCE_REL} states ${String(shape.mostReadingsForOneNavigation)} reading(s) at most for one navigation, each a single title value rather than a list of elements, and none of its ${String(keyPaths(record).length)} key path(s) names a count of entries carrying a name; a second \`<${name}>\` would be invisible to a reading shaped that way, so no second entry is named and no duplicate is invented`,
  };
}

/**
 * The shipped reader of the same observation, run in a bare `node:vm` context: the world holds
 * nothing but the source, so the namespace read back is the one the module publishes.
 * @returns {any}
 */
let PRODUCER = null;
function producerApi() {
  if (PRODUCER !== null) return PRODUCER;
  const source = readText(
    PRODUCER_REL,
    'the entry identity this record carries is the word this module reads',
  );
  const context = createContext({});
  runInContext(source, context, { filename: PRODUCER_REL });
  const api = context.angularAiTitleInput;
  assert.ok(
    isObject(api),
    `${PRODUCER_REL} must publish angularAiTitleInput on the global object of whatever world it runs in, and it publishes ${JSON.stringify(Object.keys(context).filter((key) => key.startsWith('angularAi')))}`,
  );
  PRODUCER = api;
  return PRODUCER;
}

/**
 * The identity section: the entry's identity is the name the record's own observation recorded, and it
 * is asserted against the field list the shipped reader of that record publishes rather than derived a
 * second time.
 * @returns {any}
 */
function identityOf() {
  const api = producerApi();
  const recordInputs = [...(api.RECORD_INPUTS ?? [])].map(String);
  assert.ok(
    recordInputs.includes(HEAD_ELEMENT),
    `${PRODUCER_REL} must read the \`${HEAD_ELEMENT}\` field of the record this identity comes from, and RECORD_INPUTS reads ${JSON.stringify(recordInputs)}`,
  );
  assert.ok(
    recordInputs.includes('navigationIndex'),
    `${PRODUCER_REL} must read \`navigationIndex\`, the field the writing navigation would be attributed by, and RECORD_INPUTS reads ${JSON.stringify(recordInputs)}`,
  );
  return {
    producer: PRODUCER_REL,
    publication: 'globalThis.angularAiTitleInput',
    exports: Object.keys(api).sort(),
    expression:
      'angularAiTitleInput.RECORD_INPUTS — the fields of this record the shipped reader reads back',
    recordInputs,
    meaning:
      'A head entry’s identity is the name the record’s own observation recorded: one spelling, read from the record and asserted against the module that reads the same record, so a second identity for one entry is the defect this record refuses.',
    assertion: `the entry is keyed by \`${HEAD_ELEMENT}\` because ${PRODUCER_REL} reads that field of the same observation (${recordInputs.includes(HEAD_ELEMENT) ? 'present' : 'absent'} in RECORD_INPUTS), and the writing navigation would be attributed by \`navigationIndex\`, which the same list carries (${recordInputs.includes('navigationIndex') ? 'present' : 'absent'})`,
  };
}

/**
 * AC3's two rows, derived rather than asserted by name: the manifest names this recording with its
 * suite and its arm, and the census owes this suite its reason row.
 * @returns {any}
 */
function censusOf() {
  const rows = JSON.parse(
    readText(RECORDINGS_REL, 'the manifest that names every recording'),
  );
  assert.ok(
    Array.isArray(rows),
    `${RECORDINGS_REL} must be the list of recordings, and it is ${typeof rows}`,
  );
  const row = rows.find((one) => one?.recording === RECORD_REL);
  assert.ok(
    row,
    `${RECORDINGS_REL} names no row for ${RECORD_REL}: a recording this milestone writes is named there with its suite and its arm`,
  );
  assert.equal(
    row.suite,
    SUITE_REL,
    `${RECORDINGS_REL}'s row for ${RECORD_REL} names the suite ${JSON.stringify(row.suite)}, and this record's suite is ${SUITE_REL}`,
  );
  assert.equal(
    row.arm,
    ARM,
    `${RECORDINGS_REL}'s row for ${RECORD_REL} names the arm ${JSON.stringify(row.arm)}, and the only arm that writes it is ${ARM}`,
  );
  const gate = readText(GATE_REL, 'the census owes this suite its reason row');
  const reasonRow = gate.includes(`'${SUITE_REL}':`);
  assert.ok(
    reasonRow,
    `${GATE_REL} carries no SUITE_DIFF_REASONS row for ${SUITE_REL}: a suite this milestone adds owes the census its reason in the same task`,
  );
  return {
    recordings: RECORDINGS_REL,
    row: { recording: row.recording, suite: row.suite, arm: row.arm },
    reasonRow: { path: GATE_REL, present: reasonRow },
    reading:
      'the manifest names this recording with the suite that writes it and the arm that writes it, and the census carries the reason row the suite this milestone adds owes it, both read at capture rather than stated here',
  };
}

/**
 * The record, derived. Every value below is read from the observation this checkout carries or from
 * the shipped reader beside it, so a source that moved makes the record stale rather than quietly
 * wrong. `capturedAt` is the one value the derivation takes from the recorded document: it is the
 * instant the record was first written, and a re-capture derives through it so that no value moves
 * for a clock.
 * @param {string} capturedAt @returns {any}
 */
function derive(capturedAt) {
  assert.match(
    String(capturedAt),
    ISO,
    `the record's capture instant must be a fixed-width ISO instant, and it is ${JSON.stringify(capturedAt)}`,
  );
  const record = sourceRecord();
  const observation = record.observation;
  const navigations = navigationsOf(record);
  const names = observedNames(record);
  const writes = (record.writes ?? []).filter(isObject);
  const carrying = navigations.filter((one) => one.title !== null);

  const entries = names.map((name) => ({
    entry: name,
    name: nameFrom(record, name),
    firstSeenAt: firstSeenFrom(record, name),
    remained: remainedFrom(record, name),
    carriedBy: carriedByFrom(record, name),
    writtenBy: writtenByFrom(record, name),
    duplicate: duplicateFrom(record, name),
  }));
  const repeated = names.filter((name, index) => names.indexOf(name) !== index);
  assert.equal(
    repeated.length,
    0,
    `${SOURCE_REL} would carry ${JSON.stringify(repeated)} twice, so one entry would carry two readings`,
  );

  const readCount = (fact) =>
    entries.filter((entry) => entry[fact]?.read === true).length;
  const counts = {
    entries: entries.length,
    navigations: navigations.length,
    reads: observation.reads.length,
    writesInTheRecord: writes.length,
    writesObserved: writes.filter((write) => write.observed === true).length,
    pagesCarrying: carrying.length,
    nameRead: readCount('name'),
    firstSeenRead: readCount('firstSeenAt'),
    remainedRead: readCount('remained'),
    carriedByRead: readCount('carriedBy'),
    writtenByRead: readCount('writtenBy'),
    duplicateRead: readCount('duplicate'),
  };
  assert.equal(
    counts.nameRead +
      counts.firstSeenRead +
      counts.remainedRead +
      counts.carriedByRead,
    entries.length * FACTS.length,
    `the four facts SC3 names must each be read for every entry this head derives: ${JSON.stringify(counts)}`,
  );
  const unread = [
    ...new Set(
      entries.flatMap((entry) =>
        [...FACTS, ...ABSENCES].filter((fact) => entry[fact]?.read !== true),
      ),
    ),
  ];
  assert.ok(
    unread.length > 0,
    'no fact of any entry is stated as not read, so the absence half of AC1 is unexercised and a reading would be indistinguishable from a complete one',
  );

  const urls = navigations.map((one) => one.url);
  const statement = [
    `${String(entries.length)} head entr${entries.length === 1 ? 'y' : 'ies'} was read from ${SOURCE_REL}, the M065 observation of ${String(record.target?.name)} on ${urls.join(', ')}:`,
    `${names.map((name) => `\`${name}\``).join(', ')}, first seen at navigation ${String(entries[0]?.firstSeenAt?.value?.index)} (${String(entries[0]?.firstSeenAt?.value?.url)}) when the observation began;`,
    `the same entry carrying ${JSON.stringify(entries[0]?.remained?.value?.text)} remained at every one of the ${String(carrying.length)} read(s) whose page carried a title, and the page that carries it is navigation ${String(entries[0]?.carriedBy?.value?.index)} (${String(entries[0]?.carriedBy?.value?.url)}).`,
    `What was not read, with the reason: ${[
      ...entries.flatMap((entry) =>
        unread
          .filter((fact) => entry[fact]?.read !== true)
          .map(
            (fact) =>
              `${fact} for \`${entry.entry}\` (${String(entry[fact]?.reason)})`,
          ),
      ),
    ].join(' ')}`,
  ].join(' ');

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
      armedBy: ARM,
      note: 'the instant this record was first written; every re-capture derives through it, so the record moves for no clock - the instant the head was read is derivedFrom.observation.beganAt, which comes from the observation this record derives from',
    },
    sources: SOURCES.map(({ path, contributes }) => {
      assert.ok(
        existsSync(absPath(path)),
        `${path} is a source this record is derived from, and this checkout does not carry it`,
      );
      return { path, contributes };
    }),
    facts: FACT_MEANING,
    census: censusOf(),
    derivedFrom: {
      path: SOURCE_REL,
      schema: record.schema,
      milestone: record.milestone,
      question: record.question,
      capturedAt: record.capturedAt,
      target: {
        name: record.target?.name ?? null,
        url: record.target?.url ?? null,
        port: record.target?.port ?? null,
      },
      observation: {
        beganAt: observation.beganAt,
        beganAfterIndex: observation.beganAfterIndex,
        beganAfterUrl: observation.beganAfterUrl,
        titleAtStart: observation.titleAtStart,
        titleElementTextAtStart: observation.titleElementTextAtStart,
        observedTitleElement: observation.observedTitleElement,
        mechanism: observation.mechanism,
        world: observation.world,
        worldFallbackReason: observation.worldFallbackReason ?? null,
        installedBy: observation.installedBy,
        pageSideEdit: observation.pageSideEdit === true,
        writesSeen: observation.writesSeen,
        reads: observation.reads,
      },
      writes: writes.map((write) => ({
        index: write.index,
        at: write.at ?? null,
        title: write.title ?? null,
        observed: write.observed === true,
        author: write.author ?? null,
        navigationIndex: write.navigationIndex ?? null,
        basis: write.basis ?? null,
      })),
      readShape: readShape(record),
    },
    identity: identityOf(),
    navigations,
    entries,
    counts,
    statement,
  };
}

/**
 * The record as this head derives it, through the instant the recorded document carries. The default
 * pin and the armed writer both derive here, so the two can never hold different shapes.
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
  if (!isObject(record)) fail('defect: the recording is not an object');
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
  if (!isObject(capture)) fail('defect: the record carries no capture section');
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
    fail(`defect: capture.check is ${JSON.stringify(capture.check)}`);
  }
  if (capture.records !== RECORD_REL) {
    fail(
      `defect: capture.records is ${JSON.stringify(capture.records)}, and the record this suite writes is ${RECORD_REL}`,
    );
  }
  if (capture.armedBy !== ARM) {
    fail(`defect: capture.armedBy is ${JSON.stringify(capture.armedBy)}`);
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

  for (const fact of [...FACTS, ...ABSENCES]) {
    const meaning = record.facts?.[fact];
    if (typeof meaning !== 'string' || meaning.length < 40) {
      fail(
        `defect: facts.${fact} states no meaning, so a reason and a value cannot be told apart by a reader`,
      );
    }
  }

  const identity = record.identity;
  if (!isObject(identity)) fail('defect: the record carries no identity');
  if (identity.producer !== PRODUCER_REL) {
    fail(
      `defect: identity.producer is ${JSON.stringify(identity.producer)}, and the one reader of this record this milestone asserts against is ${PRODUCER_REL}`,
    );
  }
  if (typeof identity.meaning !== 'string' || identity.meaning.length < 40) {
    fail('defect: identity.meaning states no rule for what an identity is');
  }
  if (
    !Array.isArray(identity.recordInputs) ||
    identity.recordInputs.length === 0
  ) {
    fail('defect: identity.recordInputs names no field the reader reads');
  }

  const census = record.census;
  if (!isObject(census)) fail('defect: the record carries no census section');
  const rows = JSON.parse(
    readText(RECORDINGS_REL, 'the manifest that names every recording'),
  );
  const row = rows.find((one) => one?.recording === RECORD_REL);
  if (row === undefined) {
    fail(`defect: ${RECORDINGS_REL} names no row for ${RECORD_REL}`);
  }
  for (const field of ['recording', 'suite', 'arm']) {
    if (census.row?.[field] !== row[field]) {
      fail(
        `defect: census.row.${field} is ${JSON.stringify(census.row?.[field])} and ${RECORDINGS_REL} states ${JSON.stringify(row[field])}`,
      );
    }
  }
  if (census.reasonRow?.path !== GATE_REL) {
    fail(
      `defect: census.reasonRow.path is ${JSON.stringify(census.reasonRow?.path)} and the census this suite owes its row is ${GATE_REL}`,
    );
  }
  if (census.reasonRow?.present !== true) {
    fail(
      `defect: census.reasonRow.present is ${JSON.stringify(census.reasonRow?.present)}, and ${GATE_REL} must carry this suite's row`,
    );
  }

  if (!Array.isArray(record.navigations) || record.navigations.length === 0) {
    fail(
      'defect: the record carries no navigation, so no navigation can be named',
    );
  }
  for (const [position, navigation] of record.navigations.entries()) {
    if (navigation.index !== position) {
      fail(
        `defect: navigations[${String(position)}].index is ${JSON.stringify(navigation.index)}, and the navigations are numbered in arrival order`,
      );
    }
    if (typeof navigation.url !== 'string' || !navigation.url.startsWith('/')) {
      fail(
        `defect: navigations[${String(position)}].url is ${JSON.stringify(navigation.url)}, and a route begins with a slash`,
      );
    }
  }

  if (!Array.isArray(record.entries) || record.entries.length === 0) {
    fail('defect: the record carries no head entry');
  }
  const keyed = record.entries.map((entry) => entry?.entry);
  if (new Set(keyed).size !== keyed.length) {
    fail(
      `defect: the record carries two entries for one name: ${JSON.stringify(keyed)}`,
    );
  }
  for (const entry of record.entries) {
    const where = `entries[${entry.entry}]`;
    const entryKeys = Object.keys(entry).sort();
    if (JSON.stringify(entryKeys) !== JSON.stringify(ENTRY_KEYS)) {
      fail(
        `defect: ${where} carries the keys ${JSON.stringify(entryKeys)}; an entry carries exactly ${JSON.stringify(ENTRY_KEYS)}, and a key added to the shape is a re-derivation`,
      );
    }
    for (const fact of [...FACTS, ...ABSENCES]) {
      const value = entry[fact];
      if (!isFact(value)) {
        fail(
          `defect: ${where}.${fact} is neither a value nor a reason: it is ${JSON.stringify(value)}`,
        );
      }
      if (value.read === true && !('value' in value)) {
        fail(`defect: ${where}.${fact} is read and carries no value`);
      }
      if (value.read === false && 'value' in value) {
        fail(
          `defect: ${where}.${fact} is stated as not read and carries a value: a value the reading gave is not a reading that was not taken`,
        );
      }
      if (value.read === false) {
        if (
          typeof value.reason !== 'string' ||
          value.reason.trim().length < 80
        ) {
          fail(
            `defect: ${where}.${fact} was not read and does not say why in a statement a reader can hold`,
          );
        }
        if (!value.reason.includes(entry.entry)) {
          fail(
            `defect: ${where}.${fact}.reason does not name the entry: ${value.reason}`,
          );
        }
      }
      if (value.read === true && 'reason' in value) {
        fail(`defect: ${where}.${fact} is read and carries a reason`);
      }
    }
  }

  const expectedCounts = {
    entries: record.entries.length,
    navigations: record.navigations.length,
    reads: record.derivedFrom?.observation?.reads?.length ?? 0,
    writesInTheRecord: record.derivedFrom?.writes?.length ?? 0,
    writesObserved: (record.derivedFrom?.writes ?? []).filter(
      (write) => write?.observed === true,
    ).length,
    pagesCarrying: record.navigations.filter(
      (one) => typeof one.title === 'string',
    ).length,
    nameRead: record.entries.filter((entry) => entry.name.read === true).length,
    firstSeenRead: record.entries.filter(
      (entry) => entry.firstSeenAt.read === true,
    ).length,
    remainedRead: record.entries.filter((entry) => entry.remained.read === true)
      .length,
    carriedByRead: record.entries.filter(
      (entry) => entry.carriedBy.read === true,
    ).length,
    writtenByRead: record.entries.filter(
      (entry) => entry.writtenBy.read === true,
    ).length,
    duplicateRead: record.entries.filter(
      (entry) => entry.duplicate.read === true,
    ).length,
  };
  if (JSON.stringify(record.counts) !== JSON.stringify(expectedCounts)) {
    fail(
      `defect: the record states the counts ${JSON.stringify(record.counts)} and its own rows carry ${JSON.stringify(expectedCounts)}`,
    );
  }
  if (typeof record.statement !== 'string' || record.statement.length < 120) {
    fail(
      'defect: the record states no statement, so what was read and what was not is left for a reader to assemble',
    );
  }
  return true;
}

/**
 * The name pin: every name the record carries is the element the observation recorded, read from the
 * observation's own key, and it is the key the entry is keyed by. A name inferred from the entry's
 * text, or a second spelling of one entry, is refused by name.
 * @param {any} record
 */
function pinName(record) {
  const names = observedNames(sourceRecord());
  for (const entry of record.entries) {
    const where = `entries[${entry.entry}].name`;
    const fact = entry.name;
    if (!isFact(fact)) fail(`defect: ${where} is not a fact`);
    if (fact.read !== true) {
      fail(
        `defect: ${where} is stated as not read, and ${SOURCE_REL} records ${JSON.stringify(names)} as the observed head element`,
      );
    }
    if (!isObject(fact.value) || typeof fact.value.element !== 'string') {
      fail(`defect: ${where} is read and names no element`);
    }
    if (!names.includes(fact.value.element)) {
      fail(
        `defect: ${where}.value.element is ${JSON.stringify(fact.value.element)} and ${SOURCE_REL}#observation records ${JSON.stringify(names)}: the name is the element the observation recorded, never one derived from the entry's text`,
      );
    }
    if (fact.value.element !== entry.entry) {
      fail(
        `defect: ${where}.value.element is ${JSON.stringify(fact.value.element)} but the row is keyed by ${JSON.stringify(entry.entry)}: an identity this record carries is the key it is keyed by`,
      );
    }
    if (typeof fact.source !== 'string' || fact.source === '') {
      fail(
        `defect: ${where} names no field of the observation it was read from`,
      );
    }
  }
}

/**
 * The first-seen pin: the navigation the entry was first seen at is the navigation the observation
 * began after, at the instant it began — a navigation the record carries, with the url it states.
 * @param {any} record
 */
function pinFirstSeen(record) {
  const source = sourceRecord();
  const observation = source.observation;
  const indexes = source.navigations.map((one) => one?.index);
  for (const entry of record.entries) {
    const where = `entries[${entry.entry}].firstSeenAt`;
    const fact = entry.firstSeenAt;
    if (!isFact(fact)) fail(`defect: ${where} is not a fact`);
    if (fact.read !== true) {
      fail(
        `defect: ${where} is stated as not read, and ${SOURCE_REL}#observation.beganAt records the instant the head carried it`,
      );
    }
    const value = fact.value;
    if (!isObject(value)) fail(`defect: ${where} is read and carries no value`);
    const navigation = source.navigations.find(
      (one) => one?.index === value.index,
    );
    if (navigation === undefined) {
      fail(
        `defect: ${where} names navigation ${JSON.stringify(value.index)} and ${SOURCE_REL} carries ${JSON.stringify(indexes)}: a navigation the record does not hold is never invented`,
      );
    }
    if (value.index !== observation.beganAfterIndex) {
      fail(
        `defect: ${where}.value.index is ${JSON.stringify(value.index)} and the observation began after navigation ${String(observation.beganAfterIndex)} with the document already carrying the entry: that is the first navigation at which it was read`,
      );
    }
    if (value.url !== navigation.url) {
      fail(
        `defect: ${where}.value.url is ${JSON.stringify(value.url)} and navigation ${String(value.index)} carries ${JSON.stringify(navigation.url)}`,
      );
    }
    if (value.at !== observation.beganAt) {
      fail(
        `defect: ${where}.value.at is ${JSON.stringify(value.at)} and the observation began at ${JSON.stringify(observation.beganAt)}: the instant the entry was first read is the instant the observation began`,
      );
    }
  }
}

/**
 * The remained pin: the entry that remained is the entry the last carrying read carried, with the
 * navigations whose settled read carried it and whether every read carried the same value.
 * @param {any} record
 */
function pinRemained(record) {
  const carrying = carryingNavigations(sourceRecord());
  if (carrying.length === 0) {
    fail(
      `defect: ${SOURCE_REL} carries no settled read with a title, so the remained fact has nothing behind it`,
    );
  }
  const last = carrying[carrying.length - 1];
  for (const entry of record.entries) {
    const where = `entries[${entry.entry}].remained`;
    const fact = entry.remained;
    if (!isFact(fact)) fail(`defect: ${where} is not a fact`);
    if (fact.read !== true) {
      fail(
        `defect: ${where} is stated as not read, and ${SOURCE_REL} records ${String(carrying.length)} read(s) whose page carried the entry`,
      );
    }
    const value = fact.value;
    if (!isObject(value)) fail(`defect: ${where} is read and carries no value`);
    if (value.element !== entry.entry) {
      fail(
        `defect: ${where}.value.element is ${JSON.stringify(value.element)} and the entry is ${JSON.stringify(entry.entry)}`,
      );
    }
    if (value.text !== last.title) {
      fail(
        `defect: ${where}.value.text is ${JSON.stringify(value.text)} and the last read those pages carried is ${JSON.stringify(last.title)}: the entry that remained is the one the last read carried`,
      );
    }
    const indexes = carrying.map((one) => one.index);
    if (JSON.stringify(value.navigationsCarrying) !== JSON.stringify(indexes)) {
      fail(
        `defect: ${where}.value.navigationsCarrying is ${JSON.stringify(value.navigationsCarrying)} and the navigations whose settled read carried the entry are ${JSON.stringify(indexes)}`,
      );
    }
    const same = carrying.every((one) => one.title === last.title);
    if (value.sameTextAtEveryRead !== same) {
      fail(
        `defect: ${where}.value.sameTextAtEveryRead is ${String(value.sameTextAtEveryRead)} and ${SOURCE_REL}'s reads carry ${same ? 'one value' : 'more than one value'} across ${String(carrying.length)} navigation(s)`,
      );
    }
  }
}

/**
 * The carried-by pin: the navigation whose page carries the entry is a navigation the record holds,
 * with the url it states and the instant of the read that carried it. A route the record does not
 * carry is refused by index and by name.
 * @param {any} record
 */
function pinCarriedBy(record) {
  const source = sourceRecord();
  const carrying = carryingNavigations(source);
  const indexes = source.navigations.map((one) => one?.index);
  if (carrying.length === 0) {
    fail(
      `defect: ${SOURCE_REL} carries no settled read with a title, so no page is recorded as carrying the entry`,
    );
  }
  const last = carrying[carrying.length - 1];
  for (const entry of record.entries) {
    const where = `entries[${entry.entry}].carriedBy`;
    const fact = entry.carriedBy;
    if (!isFact(fact)) fail(`defect: ${where} is not a fact`);
    if (fact.read !== true) {
      fail(
        `defect: ${where} is stated as not read, and ${SOURCE_REL} records the page that carried the entry`,
      );
    }
    const value = fact.value;
    if (!isObject(value)) fail(`defect: ${where} is read and carries no value`);
    if (!indexes.includes(value.index)) {
      fail(
        `defect: ${where} names navigation ${JSON.stringify(value.index)} (${JSON.stringify(value.url)}) and ${SOURCE_REL} carries ${JSON.stringify(indexes)}: a route the record did not carry is never named`,
      );
    }
    if (value.index !== last.index) {
      fail(
        `defect: ${where}.value.index is ${JSON.stringify(value.index)} and the last navigation whose page carried the entry is ${String(last.index)}`,
      );
    }
    if (value.url !== last.url) {
      fail(
        `defect: ${where}.value.url is ${JSON.stringify(value.url)} and navigation ${String(last.index)} carries ${JSON.stringify(last.url)}`,
      );
    }
    if (value.at !== last.titleAt) {
      fail(
        `defect: ${where}.value.at is ${JSON.stringify(value.at)} and the read that carried the entry for navigation ${String(last.index)} is stamped ${JSON.stringify(last.titleAt)}`,
      );
    }
  }
}

/**
 * The written-by pin: a writing navigation is named only where the record's own `writes` list
 * attributes an observed write to one, and where it attributes none the fact states that it was not
 * read and names no navigation. This is the pin the invented-writer mutant has to redden.
 * @param {any} record
 */
function pinWrittenBy(record) {
  const source = sourceRecord();
  const observation = source.observation;
  const writes = (source.writes ?? []).filter(isObject);
  const observed = writes.filter((write) => write.observed === true);
  const attributed = observed.filter((write) =>
    Number.isInteger(write.navigationIndex),
  );
  const readsThatSawAWrite = (observation.reads ?? []).filter(
    (read) => Number(read?.writesSeen) > 0,
  );
  for (const entry of record.entries) {
    const where = `entries[${entry.entry}].writtenBy`;
    const fact = entry.writtenBy;
    if (!isFact(fact)) fail(`defect: ${where} is not a fact`);
    if (fact.read === true) {
      if (attributed.length === 0) {
        fail(
          `defect: ${where} names navigation ${JSON.stringify(fact.value?.index)} as the navigation that wrote the ${entry.entry} entry, and ${SOURCE_REL}'s writes list carries ${String(observed.length)} observed write(s) and attributes none of them to a navigation: the record is the only source of a writing navigation, and this one carries none`,
        );
      }
      const value = fact.value ?? {};
      const attributedIndexes = attributed.map(
        (write) => write.navigationIndex,
      );
      if (!attributedIndexes.includes(value.index)) {
        fail(
          `defect: ${where}.value.index is ${JSON.stringify(value.index)} and the observed writes are attributed to ${JSON.stringify(attributedIndexes)}`,
        );
      }
      const navigation = source.navigations.find(
        (one) => one?.index === value.index,
      );
      if (navigation === undefined || navigation.url !== value.url) {
        fail(
          `defect: ${where}.value.url is ${JSON.stringify(value.url)} and navigation ${String(value.index)} carries ${JSON.stringify(navigation?.url ?? null)}`,
        );
      }
      if (fact.observed !== true) {
        fail(
          `defect: ${where}.observed is ${JSON.stringify(fact.observed)}, and a writing navigation is named only from an observed write`,
        );
      }
      continue;
    }
    if (fact.read !== false) {
      fail(`defect: ${where}.read is ${JSON.stringify(fact.read)}`);
    }
    if ('value' in fact) {
      fail(
        `defect: ${where} is stated as not read and names navigation ${JSON.stringify(fact.value?.index)}: a writing navigation the record does not carry is never invented`,
      );
    }
    if (fact.observed !== false) {
      fail(
        `defect: ${where}.observed is ${JSON.stringify(fact.observed)} and the observation saw ${String(observation.writesSeen)} write(s) across ${String((observation.reads ?? []).length)} read(s)`,
      );
    }
    if (observed.length > 0) {
      fail(
        `defect: ${where} is stated as not read and ${SOURCE_REL} carries ${String(observed.length)} observed write(s)`,
      );
    }
    if (readsThatSawAWrite.length > 0) {
      fail(
        `defect: ${where} is stated as not read and ${String(readsThatSawAWrite.length)} read(s) recorded a write`,
      );
    }
    if (!fact.reason.includes(entry.entry)) {
      fail(
        `defect: ${where}.reason does not name the entry: ${String(fact.reason)}`,
      );
    }
  }
}

/**
 * The duplicate pin: a second entry is named only where the record carries a count of entries sharing
 * the name, and where it carries none the fact states that it was not read. A duplicate invented
 * beside the entry the record observed is refused by name.
 * @param {any} record
 */
function pinDuplicate(record) {
  const counts = duplicateCountKeys(sourceRecord());
  for (const entry of record.entries) {
    const where = `entries[${entry.entry}].duplicate`;
    const fact = entry.duplicate;
    if (!isFact(fact)) fail(`defect: ${where} is not a fact`);
    if (fact.read === true) {
      if (counts.length === 0) {
        fail(
          `defect: ${where} names ${JSON.stringify(fact.value?.count)} entr(ies) carrying the name and ${SOURCE_REL} carries no count of entries: a second entry the record did not count is the duplicate this pin refuses to believe`,
        );
      }
      if (fact.value?.count !== counts[0].value) {
        fail(
          `defect: ${where}.value.count is ${JSON.stringify(fact.value?.count)} and ${SOURCE_REL}#${counts[0].path} states ${JSON.stringify(counts[0].value)}`,
        );
      }
      continue;
    }
    if (fact.read !== false) {
      fail(`defect: ${where}.read is ${JSON.stringify(fact.read)}`);
    }
    if ('value' in fact) {
      fail(
        `defect: ${where} is stated as not read and carries a count: no duplicate is invented where the record read none`,
      );
    }
    if (counts.length > 0) {
      fail(
        `defect: ${where} is stated as not read and ${SOURCE_REL} carries the count ${JSON.stringify(counts[0])}`,
      );
    }
    if (typeof fact.reason !== 'string' || fact.reason === '') {
      fail(`defect: ${where} was not read and states no reason`);
    }
    if (!fact.reason.includes(entry.entry)) {
      fail(`defect: ${where}.reason does not name the entry: ${fact.reason}`);
    }
  }
}

/**
 * The identity pin: the name each entry is keyed by is one the shipped reader of the same record
 * reads, so the record carries no identity the producer does not produce.
 * @param {any} record
 */
function pinIdentity(record) {
  const recordInputs = [...(producerApi().RECORD_INPUTS ?? [])].map(String);
  let checked = 0;
  for (const entry of record.entries) {
    if (!recordInputs.includes(entry.entry)) {
      fail(
        `defect: entries[${entry.entry}] is keyed by an identity ${PRODUCER_REL} does not read: RECORD_INPUTS carries ${JSON.stringify(recordInputs)}, and a second identity for an entry is the defect this pin exists for`,
      );
    }
    checked += 1;
  }
  if (checked === 0) {
    fail(
      'defect: no entry carries an identity, so the identity pin asserts nothing',
    );
  }
  if (
    JSON.stringify(record.identity?.recordInputs) !==
    JSON.stringify(recordInputs)
  ) {
    fail(
      `defect: identity.recordInputs is ${JSON.stringify(record.identity?.recordInputs)} and ${PRODUCER_REL} publishes ${JSON.stringify(recordInputs)}`,
    );
  }
}

// ------------------------------------------------------------------ the write ---

// The bytes the read-only pin holds the record to; an armed run re-bases it after its own write.
const recordAtLoad = existsSync(RECORD_PATH)
  ? digest(readFileSync(RECORD_PATH))
  : null;
let recordBaseline = recordAtLoad;

/**
 * The armed capture: derive, compare, write only when a value moved, so two armed runs leave the file
 * byte-identical and a default run never writes at all.
 *
 * The writer derives through the recorded document — the capture instant it carries is passed into the
 * derivation — and refuses to write unless the candidate is a fixed point of the default pin. That is
 * the rule the claims census established after M065's rebasing was written into the reader and not the
 * writer: a writer that derives a different shape from its reader writes bytes its own default run
 * calls wrong, silently.
 * @param {string} path
 * @returns {{ wrote: boolean, before: string | null, after: string, moved: string }}
 */
function captureRecord(path) {
  const present = existsSync(path);
  const text = present ? readFileSync(path, 'utf8') : '';
  const before = present ? digest(text) : null;
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
  // Never write a record that would fail its own shape, name, first-seen, remained, carried-by,
  // written-by, duplicate or identity pins.
  assert.doesNotThrow(() => pinShape(record));
  assert.doesNotThrow(() => pinName(record));
  assert.doesNotThrow(() => pinFirstSeen(record));
  assert.doesNotThrow(() => pinRemained(record));
  assert.doesNotThrow(() => pinCarriedBy(record));
  assert.doesNotThrow(() => pinWrittenBy(record));
  assert.doesNotThrow(() => pinDuplicate(record));
  assert.doesNotThrow(() => pinIdentity(record));
  // Nor one its own default pin would refuse: the candidate must be the fixed point of the pin, so a
  // capture cannot write bytes the read-only run then calls wrong.
  assert.equal(
    canonical(derive(JSON.parse(candidate).capture.capturedAt)),
    candidate,
    "armed capture refused: the bytes it would write fail this suite's default pin, so the capture does not derive through the pin its reader holds. Nothing was written.",
  );
  writeFileSync(path, candidate);
  return { wrote: true, before, after: digest(readFileSync(path)), moved };
}

// Declared first among the record's tests, so an armed run writes before the read-only pins read the
// file back: the same pins then prove the freshly written record is the one this head derives.
if (ARMED) {
  describe('the head record, armed', () => {
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
  it('reads the observation first: one head element, three navigations and three reads, no write seen', () => {
    const source = sourceRecord();
    const observation = source.observation;
    const navigations = navigationsOf(source);
    assert.deepEqual(
      observedNames(source),
      [HEAD_ELEMENT],
      'the observation recorded one head element, and it is the element this record names',
    );
    assert.equal(
      navigations.length,
      3,
      `the observation carries ${String(navigations.length)} navigation(s), and this record is a reading of the navigations beside the head`,
    );
    assert.equal(
      observation.reads.length,
      3,
      `the observation carries ${String(observation.reads.length)} read(s)`,
    );
    assert.deepEqual(
      observation.reads.map((read) => read.navigationIndex),
      navigations.map((one) => one.index),
      'every navigation the observation recorded carries a read, in the same order',
    );
    assert.equal(
      observation.writesSeen,
      0,
      `the observation saw ${String(observation.writesSeen)} write(s), and the record this milestone respects states that it saw none`,
    );
    for (const read of observation.reads) {
      assert.equal(
        read.writesSeen,
        0,
        `reads[${String(read.navigationIndex)}] recorded ${String(read.writesSeen)} write(s), and every read of this observation recorded none`,
      );
    }
    console.log(
      `${SOURCE_REL}: ${String(navigations.length)} navigation(s) ${JSON.stringify(navigations.map((one) => one.url))}, ${String(observation.reads.length)} read(s), writesSeen ${String(observation.writesSeen)}; the document carried ${JSON.stringify(observation.titleAtStart)} when the observation began at ${String(observation.beganAt)}`,
    );
  });

  it('AC1: states each of the four facts per entry, and states which were not read and why', () => {
    const record = derivedFromHead();
    assert.doesNotThrow(() => pinShape(record));
    const absences = [];
    for (const entry of record.entries) {
      for (const fact of [...FACTS, ...ABSENCES]) {
        const value = entry[fact];
        if (value.read === true) {
          assert.ok(
            'value' in value,
            `defect: entries[${entry.entry}].${fact} is read and carries no value`,
          );
          continue;
        }
        assert.ok(
          typeof value.reason === 'string' && value.reason.length >= 80,
          `defect: entries[${entry.entry}].${fact} was not read and does not say why`,
        );
        absences.push(`${entry.entry}.${fact}`);
      }
    }
    assert.ok(
      absences.length > 0,
      'defect: no fact of any entry is stated as not read, so the absence half of AC1 is unexercised',
    );
    assert.equal(
      record.counts.nameRead +
        record.counts.firstSeenRead +
        record.counts.remainedRead +
        record.counts.carriedByRead,
      record.entries.length * FACTS.length,
      'the four facts SC3 names are read for every entry',
    );
    console.log(
      `AC1: ${String(record.counts.entries)} entry(ies); the four facts read for all of them; not read: ${JSON.stringify(absences)}`,
    );
  });

  it('AC2: the writer is one place behind the arm, and a default run writes nothing', () => {
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
    assert.equal(
      SOURCE_AT_LOAD,
      digest(readFileSync(SOURCE_PATH)),
      `${SOURCE_REL} changed during this run, so the suite writes the observation it derives from`,
    );
    const record = derivedFromHead();
    assert.equal(record.capture.command, CAPTURE_COMMAND);
    assert.equal(record.capture.check, CHECK_COMMAND);
    assert.equal(
      CHECK_COMMAND,
      'node --test scripts/head-record.test.mjs',
      'the recording names the command this task verifies with',
    );
    console.log(
      `${RECORD_REL}: one writer behind ${ARM}; ${SOURCE_REL} unchanged at sha256 ${String(SOURCE_AT_LOAD).slice(0, 12)}`,
    );
  });

  it('AC3: names the recording in the manifest and the suite in the census, both read at capture', () => {
    const record = derivedFromHead();
    assert.doesNotThrow(() => pinShape(record));
    assert.deepEqual(
      record.census.row,
      { recording: RECORD_REL, suite: SUITE_REL, arm: ARM },
      `the census names this recording with its suite and its arm, and it names ${JSON.stringify(record.census.row)}`,
    );
    assert.equal(
      record.census.reasonRow.present,
      true,
      `${GATE_REL} owes ${SUITE_REL} its SUITE_DIFF_REASONS row`,
    );
    const rows = JSON.parse(readFileSync(absPath(RECORDINGS_REL), 'utf8'));
    const row = rows.find((one) => one?.recording === RECORD_REL);
    assert.ok(row, `${RECORDINGS_REL} must carry this recording's row`);
    console.log(
      `${RECORDINGS_REL}: ${JSON.stringify(row)}; ${GATE_REL}: row present`,
    );
  });
});

// ---------------------------------------------------------------- the record ---

describe('the head record', () => {
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
    // The naming itself, on a copy: a moved value is reported by its path and by its value rather
    // than as a difference somewhere in a record of several hundred lines.
    const planted = clone(recorded);
    planted.entries[0].remained.value.text = 'Insurance Portal (draft)';
    const named = firstDifference(planted, expected, '');
    assert.match(
      named,
      /entries\[0\]\.remained\.value\.text/,
      `a moved value must be named by its path, and the difference reads ${JSON.stringify(named)}`,
    );
    assert.ok(
      named.includes('Insurance Portal (draft)'),
      `the naming must state the value that moved, and it reads ${JSON.stringify(named)}`,
    );
    console.log(
      `${RECORD_REL}: re-derived fact for fact; a moved value names its path`,
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

  it('names the entry, the navigation it was first seen at, the entry that remained and the page carrying it', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinName(recorded));
    assert.doesNotThrow(() => pinFirstSeen(recorded));
    assert.doesNotThrow(() => pinRemained(recorded));
    assert.doesNotThrow(() => pinCarriedBy(recorded));
    const entry = recorded.entries[0];
    assert.equal(
      entry.name.value.element,
      HEAD_ELEMENT,
      'the entry is keyed by the element the observation recorded',
    );
    assert.equal(
      entry.remained.value.sameTextAtEveryRead,
      true,
      `defect: the reads carried more than one value, and this record states one entry remained: ${JSON.stringify(entry.remained.value)}`,
    );
    console.log(
      `entry ${entry.entry}: name ${JSON.stringify(entry.name.value)}, first seen at navigation ${String(entry.firstSeenAt.value.index)} (${String(entry.firstSeenAt.value.url)}) at ${String(entry.firstSeenAt.value.at)}; remained ${JSON.stringify(entry.remained.value)}; carried by navigation ${String(entry.carriedBy.value.index)} (${String(entry.carriedBy.value.url)}) at ${String(entry.carriedBy.value.at)}`,
    );
  });

  it('states the writing navigation and the duplicate as not read, each with the reason it could not be', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinWrittenBy(recorded));
    assert.doesNotThrow(() => pinDuplicate(recorded));
    for (const entry of recorded.entries) {
      for (const fact of ABSENCES) {
        const value = entry[fact];
        assert.equal(
          value.read,
          false,
          `defect: entries[${entry.entry}].${fact} is stated as read, and this head read neither`,
        );
        assert.ok(
          value.reason.includes(SOURCE_REL),
          `defect: entries[${entry.entry}].${fact}.reason does not name the observation that could not settle it: ${value.reason}`,
        );
      }
    }
    console.log(
      `not read: ${ABSENCES.map((fact) => `${recorded.entries[0].entry}.${fact} (${recorded.entries[0][fact].reason})`).join(' | ')}`,
    );
  });

  it('carries the identity the shipped reader of the same observation reads', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinIdentity(recorded));
    const api = producerApi();
    assert.deepEqual(
      Object.keys(api).sort(),
      [
        'FACT_INPUTS',
        'FIELDS',
        'REASONS',
        'RECORD_INPUTS',
        'STATES',
        'titleInput',
      ],
      `the producer publishes the namespace this record names, and it publishes ${JSON.stringify(Object.keys(api).sort())}`,
    );
    assert.ok(
      api.RECORD_INPUTS.includes(HEAD_ELEMENT),
      `${PRODUCER_REL} reads the \`${HEAD_ELEMENT}\` field this identity is keyed by`,
    );
    console.log(
      `identity: ${JSON.stringify(recorded.entries.map((entry) => entry.entry))} from ${recorded.identity.producer} via ${recorded.identity.publication}; RECORD_INPUTS carries ${String(api.RECORD_INPUTS.length)} field(s)`,
    );
  });
});

// -------------------------------------------------------------------- mutants ---

describe('the mutants', () => {
  it('an invented writing navigation reddens the written-by pin, naming the entry and the source', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinWrittenBy(recorded));
    const target = recorded.entries[0];
    assert.equal(
      target.writtenBy.read,
      false,
      'defect: the record names a writing navigation, so the invented one is planted nowhere',
    );
    const mutant = clone(recorded);
    mutant.entries[0].writtenBy = {
      read: true,
      observed: true,
      value: { index: 1, url: '/contract' },
    };
    const failure = reddens(
      () => pinWrittenBy(mutant),
      'a writing navigation invented where the record carries none',
    );
    assert.ok(
      failure.message.includes(`entries[${target.entry}].writtenBy`),
      `the refusal must name the entry and the fact; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.match(
      failure.message,
      /the record is the only source of a writing navigation/,
      `the refusal must state the rule rather than that something differs; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.doesNotThrow(() => pinWrittenBy(recorded));
    console.log(`invented-writer mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a duplicate invented beside the observed entry reddens the duplicate pin, naming the entry', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinDuplicate(recorded));
    const target = recorded.entries[0];
    assert.equal(
      target.duplicate.read,
      false,
      'defect: the record names a duplicate, so the invented one is planted nowhere',
    );
    const mutant = clone(recorded);
    mutant.entries[0].duplicate = { read: true, value: { count: 2 } };
    const failure = reddens(
      () => pinDuplicate(mutant),
      'a duplicate invented where the record counts none',
    );
    assert.ok(
      failure.message.includes(`entries[${target.entry}].duplicate`),
      `the refusal must name the entry; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.match(
      failure.message,
      /carries no count of entries/,
      `the refusal must say that the record counts no entries rather than that something differs; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.doesNotThrow(() => pinDuplicate(recorded));
    console.log(`invented-duplicate mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a route the record did not carry reddens the carried-by pin, naming the navigation and the record', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinCarriedBy(recorded));
    const mutant = clone(recorded);
    mutant.entries[0].carriedBy.value.index = 3;
    mutant.entries[0].carriedBy.value.url = '/policy';
    const failure = reddens(
      () => pinCarriedBy(mutant),
      'a route the observation never carried',
    );
    assert.ok(
      failure.message.includes('entries[title].carriedBy'),
      `the refusal must name the entry and the fact; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.match(
      failure.message,
      /a route the record did not carry is never named/,
      `the refusal must state the rule; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes('/policy'),
      `the refusal must name the route the record did not carry; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.doesNotThrow(() => pinCarriedBy(recorded));
    console.log(`invented-route mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a first sight moved to a later navigation reddens the first-seen pin', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinFirstSeen(recorded));
    const mutant = clone(recorded);
    const navigation = recorded.navigations[recorded.navigations.length - 1];
    mutant.entries[0].firstSeenAt.value.index = navigation.index;
    mutant.entries[0].firstSeenAt.value.url = navigation.url;
    const failure = reddens(
      () => pinFirstSeen(mutant),
      'a first sight moved to a later navigation',
    );
    assert.ok(
      failure.message.includes('entries[title].firstSeenAt.value.index'),
      `the refusal must name the entry and the field; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.match(
      failure.message,
      /the observation began after navigation/,
      `the refusal must say which navigation the entry was first read at; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.doesNotThrow(() => pinFirstSeen(recorded));
    console.log(`moved-first-sight mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a second identity for the entry reddens the identity pin, naming the reader it is not in', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinIdentity(recorded));
    const mutant = clone(recorded);
    const row = mutant.entries[0];
    const was = row.entry;
    row.entry = `${was}Name`;
    row.name.value.element = row.entry;
    const failure = reddens(
      () => pinIdentity(mutant),
      'a second identity for one entry',
    );
    assert.ok(
      failure.message.includes(`entries[${row.entry}]`),
      `the refusal must name the identity; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.match(
      failure.message,
      /does not read/,
      `the refusal must state that the reader does not read the identity; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.doesNotThrow(() => pinIdentity(recorded));
    console.log(`second-identity mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a name taken from the entry text reddens the name pin, naming both elements', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinName(recorded));
    const mutant = clone(recorded);
    mutant.entries[0].name.value.element = 'meta';
    const failure = reddens(
      () => pinName(mutant),
      'a name the observation did not record',
    );
    assert.ok(
      failure.message.includes('entries[title].name'),
      `the refusal must name the entry and the fact; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes('meta') && failure.message.includes('title'),
      `the refusal must name the element the record does carry and the one it does not; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.doesNotThrow(() => pinName(recorded));
    console.log(`invented-name mutant: ${failure.message.split('\n')[0]}`);
  });

  it('the six mutants are six different defects, and each is proved against the same record', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    const pins = [
      () => pinShape(recorded),
      () => pinName(recorded),
      () => pinFirstSeen(recorded),
      () => pinRemained(recorded),
      () => pinCarriedBy(recorded),
      () => pinWrittenBy(recorded),
      () => pinDuplicate(recorded),
      () => pinIdentity(recorded),
    ];
    for (const pin of pins) assert.doesNotThrow(pin);
    assert.equal(
      pins.length,
      8,
      'the record is held by eight pins, and the six mutants above each redden one of them by name',
    );
    console.log(
      `${RECORD_REL}: ${String(pins.length)} pins hold ${String(recorded.entries.length)} entry(ies) over ${String(recorded.navigations.length)} navigation(s)`,
    );
  });
});
