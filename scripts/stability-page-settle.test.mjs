// @ts-check
//
// M043 T005 - the settle an inspected page produced, pinned against the two readings that page
// published.
//
// `research/raw/m043-settle-page.json` records a drive on the counter fixture's lazy route: the
// shipped page agent arms its stability read at `start()`, the read attaches while the router's own
// navigation to `/lazy` is still holding a pending task (the route's `loadChildren` import), and the
// record that page dispatches when `true` arrives publishes a settle later than `attachAt`. That is
// the one shape SC2's transition clause can rest on, and this suite is what keeps the recording
// honest:
//
//   the reading   Every value is derived from the records the page published - the attach reading,
//                 the settle reading, the emission sequence between them and the answer - and the
//                 file is held to that derivation byte for byte. A recording that asserted a
//                 transition its own readings do not make reddens here.
//
//   three mutants The three ways this evidence could be faked are driven as real mutations of the
//                 capture, and each must redden a named assertion: a settle time taken from the
//                 attach reading, a transition claimed where the page emitted nothing, and an
//                 interval taken from the record's quiet tail.
//
//   the join      `extension/stability-narrator.js` is run over the two sections the page published,
//                 so the answer the milestone reports is the shipped join's answer for this page and
//                 not a value retyped here. A measured `0` - a page already stable at attach, which
//                 this recording carries as its control - must stay `0`.
//
//   bytes         The recording is one tracked file the gates read, so a default run is a read: it
//                 prints the recording's sha256 before and after, asserts they are equal, and names
//                 the file an armed run would write. `M043_CAPTURE=1` re-derives the recording from
//                 its own capture and writes it; a second armed run changes no byte.
//
// Read-only by default: no browser, no server, no port, no spawn. The armed path's only write is the
// recording this suite names.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const SELF_PATH = fileURLToPath(import.meta.url);

const RECORD_PATH = join(ROOT, 'research', 'raw', 'm043-settle-page.json');
const NARRATOR_PATH = join(ROOT, 'extension', 'stability-narrator.js');

const RECORDED = 'research/raw/m043-settle-page.json';
const SCRIPT = 'scripts/stability-page-settle.test.mjs';
const SCHEMA = 'm043-settle-page/v1';
const MILESTONE = 'stability-explainer';
const TASK = 'T005';

/** The one artefact an armed run writes, named here rather than written by a default run. */
const WOULD_WRITE = [
  {
    path: RECORD_PATH,
    why: "the recording's own capture re-derived at this head",
    command: `set "M043_CAPTURE=1"&& node --experimental-strip-types --test "scripts/stability-page-settle.test.mjs"`,
  },
];

// ---------------------------------------------------------------- helpers ----

/**
 * @param {string} path
 * @returns {string}
 */
function displayPath(path) {
  return relative(ROOT, path).split(sep).join('/');
}

/**
 * @param {string} path
 * @returns {string | null}
 */
function sha256Of(path) {
  return existsSync(path)
    ? createHash('sha256').update(readFileSync(path)).digest('hex')
    : null;
}

/** @param {string} message @returns {never} */
function fail(message) {
  throw new Error(message);
}

/** @param {unknown} value @returns {boolean} */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** A reading the page measured: a finite number, and nothing else. @param {unknown} value @returns {boolean} */
function isMeasurement(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/** @param {unknown} value @returns {boolean} */
function filled(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * @template T
 * @param {T} value
 * @returns {T}
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** @param {string} text @returns {string} */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** The bytes an armed run writes. @param {unknown} record @returns {string} */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/**
 * @param {string} path
 * @param {string} why
 * @returns {string}
 */
function readText(path, why) {
  if (!existsSync(path)) fail(`${displayPath(path)} is missing - ${why}`);
  return readFileSync(path, 'utf8');
}

/**
 * @param {string} path
 * @param {string} why
 * @returns {any}
 */
function readJson(path, why) {
  const text = stripBom(readText(path, why));
  try {
    return JSON.parse(text);
  } catch (error) {
    return fail(
      `${displayPath(path)} is not JSON (${error instanceof Error ? error.message : error})`,
    );
  }
}

/**
 * The 1-indexed line numbers of a text that carry `needle`.
 *
 * @param {string} text
 * @param {string} needle
 * @returns {number[]}
 */
function linesHolding(text, needle) {
  const found = [];
  text.split(/\r?\n/).forEach((line, index) => {
    if (line.includes(needle)) found.push(index + 1);
  });
  return found;
}

/**
 * The first byte at which a text stops being its own record's canonical serialisation, or -1.
 *
 * @param {string} text
 * @param {string} expected
 * @returns {number}
 */
function firstDrift(text, expected) {
  const limit = Math.min(text.length, expected.length);
  for (let index = 0; index < limit; index += 1) {
    if (text[index] !== expected[index]) return index;
  }
  return text.length === expected.length ? -1 : limit;
}

// ------------------------------------------------------------ the derivation ----
//
// Everything this suite asserts about the drive is computed from the two records the page published
// and from nothing else. The capture's own prose, its citations and its limits are evidence a
// reviewer reads; they are not inputs to a claim.

/**
 * One emission the read held, as the page published it: the value the state was read from and the
 * page's own reading when it arrived, or an explicitly unreadable value rather than a zero.
 *
 * @param {unknown} reading
 * @returns {{ value: boolean | null, at: number | null } | null}
 */
function readingOf(reading) {
  if (!isObject(reading)) return null;
  const value =
    reading.value === true ? true : reading.value === false ? false : null;
  return {
    value,
    at: isMeasurement(reading.at) ? reading.at : null,
  };
}

/**
 * The drive's own arithmetic: the attach reading, the settle reading, the sequence between them, the
 * answer, and the record's quiet tail - the number an interval must never be taken from.
 *
 * @param {any} capture
 * @returns {any}
 */
function derive(capture) {
  const records = Array.isArray(capture?.records) ? capture.records : [];
  const withSection = records.filter(
    (/** @type {any} */ record) =>
      isObject(record) && isObject(record.stability),
  );

  if (withSection.length === 0) {
    fail('no record in the capture carries a stability section');
  }

  const first = withSection[0];
  const attachAt = isMeasurement(first.stability.attachAt)
    ? first.stability.attachAt
    : null;
  const attachReading = readingOf(first.stability.reading);

  const settledRecord =
    withSection.find(
      (/** @type {any} */ record) =>
        isObject(record.stability.settle) &&
        record.stability.settle.state === 'settled' &&
        isMeasurement(record.stability.settle.at),
    ) ?? null;

  const settle = settledRecord
    ? {
        state: 'settled',
        at: settledRecord.stability.settle.at,
        reading: readingOf(settledRecord.stability.reading),
        sinceAttachMs:
          attachAt === null
            ? null
            : settledRecord.stability.settle.at - attachAt,
      }
    : {
        state: 'no-settle-observed',
        at: null,
        reading: null,
        sinceAttachMs: null,
      };

  // The read's own published readings, in the order the page dispatched the records that carry them.
  // A record carries the last emission the read held when it was dispatched, so an emission that
  // arrived and was replaced between two records is not in this list - which is why the capture
  // records the drive's second subscription beside it.
  /** @type {{ value: boolean | null, at: number | null }[]} */
  const sequence = [];
  for (const record of withSection) {
    const reading = readingOf(record.stability.reading);
    if (reading === null || reading.value === null) continue;
    const previous = sequence.at(-1);
    if (
      previous &&
      previous.value === reading.value &&
      previous.at === reading.at
    )
      continue;
    sequence.push({ value: reading.value, at: reading.at });
  }

  const firstTrueAfterAttach =
    attachAt === null
      ? null
      : (sequence.find(
          (entry) =>
            entry.value === true && entry.at !== null && entry.at > attachAt,
        ) ?? null);

  const afterAttach =
    attachAt !== null &&
    attachReading !== null &&
    attachReading.value === false &&
    settle.state === 'settled' &&
    isMeasurement(settle.at) &&
    settle.at > attachAt &&
    firstTrueAfterAttach !== null;

  const lastDispatchedAt = isMeasurement(withSection.at(-1).dispatchedAt)
    ? withSection.at(-1).dispatchedAt
    : null;

  return {
    answer: afterAttach ? 'transition-observed' : 'no-transition-observed',
    producedOnAnInspectedPage: afterAttach,
    attach: {
      attachAt,
      reading: attachReading,
      settle: isObject(first.stability.settle)
        ? first.stability.settle
        : { state: 'no-settle-observed' },
    },
    settle,
    sequence,
    transition: {
      afterAttach,
      from: attachReading === null ? null : attachReading.value,
      to: firstTrueAfterAttach === null ? null : true,
      at: firstTrueAfterAttach === null ? null : firstTrueAfterAttach.at,
    },
    quietTail: {
      lastRecordAt: lastDispatchedAt,
      sinceAttachMs:
        lastDispatchedAt === null || attachAt === null
          ? null
          : lastDispatchedAt - attachAt,
    },
  };
}

/**
 * The recording as an armed run writes it: the capture untouched, the derived section re-derived
 * from it. Key order is the file's own, so a file that is already its derivation keeps its bytes.
 *
 * @param {any} file
 * @returns {any}
 */
function rederived(file) {
  return { ...file, derived: derive(file.capture) };
}

// --------------------------------------------------------------- the checks ----

/**
 * Every citation names a repository file and a line, and that line still holds the thing it is cited
 * for. A moved source reddens the citation that names it rather than leaving the recording to quote
 * a line that no longer says what it claims.
 *
 * @param {any} recording
 * @returns {void}
 */
function checkCitations(recording) {
  const citations = recording.citations;
  if (!Array.isArray(citations) || citations.length === 0) {
    fail('the recording cites no source for its readings');
  }

  /** @type {Map<string, string>} */
  const texts = new Map();
  /** @type {Set<string>} */
  const held = new Set();

  for (const citation of citations) {
    if (!isObject(citation)) fail('one citation is not an object');
    if (!filled(citation.fact)) fail('a citation names no fact');
    if (!filled(citation.holds))
      fail(`the citation for ${citation.fact} holds no line`);

    const match =
      /^((?:extension|scripts|spikes|apps|packages)\/[^\s:]+):(\d+)$/.exec(
        String(citation.source ?? ''),
      );
    if (!match) {
      fail(
        `the citation for ${citation.fact} names ${JSON.stringify(citation.source)}, which is not a repository path with a line number`,
      );
    }

    const path = join(ROOT, /** @type {string} */ (match[1]));
    const line = Number(/** @type {string} */ (match[2]));
    if (!existsSync(path)) {
      fail(
        `the citation for ${citation.fact} names a missing file: ${match[1]}`,
      );
    }
    if (!texts.has(path)) texts.set(path, readFileSync(path, 'utf8'));
    const text = String(texts.get(path));
    const lines = text.split(/\r?\n/);
    if (line < 1 || line > lines.length) {
      fail(
        `${match[1]} has ${lines.length} lines and the citation for ${citation.fact} names line ${line}`,
      );
    }
    if (!String(lines[line - 1]).includes(String(citation.holds))) {
      fail(
        `${match[1]}:${line} holds ${JSON.stringify(lines[line - 1]?.trim())} and the citation for ${citation.fact} expects it to hold ${JSON.stringify(citation.holds)}`,
      );
    }
    held.add(String(citation.holds));
  }

  // The two facts no derivation can restate: where the section is built, and how the join turns two
  // readings into an interval. A recording that cited neither would cite its own numbers.
  const holdsSection = [...held].some((needle) =>
    needle.includes('stabilityField'),
  );
  assert.equal(
    holdsSection,
    true,
    'no citation names the routine that builds the stability section',
  );
  const holdsInterval = [...held].some((needle) =>
    needle.includes('settle.at - attachAt'),
  );
  assert.equal(
    holdsInterval,
    true,
    'no citation names the join\u2019s own interval',
  );
}

/**
 * The page whose reading this is, from the capture's own names: the browser instance, the extension,
 * the fixture origin and the route. A recording that cannot name the page it was taken on is not a
 * page-level reading, whatever its arithmetic says.
 *
 * @param {any} capture
 * @returns {void}
 */
function checkPage(capture) {
  if (!isObject(capture.browser) || !filled(capture.browser.instance)) {
    fail('the capture names no browser instance');
  }
  if (!filled(capture.browser.extensionId)) {
    fail('the capture names no extension the page was inspected through');
  }
  if (
    !isObject(capture.fixture) ||
    !String(capture.fixture.url).startsWith('http://localhost:')
  ) {
    fail('the capture names no fixture origin');
  }
  if (!isObject(capture.drive)) fail('the capture carries no drive');
  if (!filled(capture.drive.route)) fail('the drive names no route');
  if (
    !String(capture.drive.url).startsWith(
      String(capture.fixture.url).replace(/\/$/, ''),
    )
  ) {
    fail(
      `the drive's URL ${JSON.stringify(capture.drive.url)} is not on the fixture's origin ${JSON.stringify(capture.fixture.url)}`,
    );
  }
  if (!isObject(capture.probe) || !filled(capture.probe.source)) {
    fail('the capture holds no probe source, so the drive cannot be repeated');
  }
  assert.match(
    String(capture.probe.source),
    /angular-ai:record/,
    'the probe must record the records the page agent dispatches',
  );
  assert.match(
    String(capture.probe.source),
    /isStable/,
    'the probe must name the stream it watches beside the read',
  );
}

/**
 * The whole check of one recording: the schema it claims, the page it was taken on, the citations
 * that hold it up, and the derived section held to the capture it was computed from.
 *
 * @param {any} recording
 * @returns {any}
 */
function checkRecording(recording) {
  if (!isObject(recording)) fail('the recording is not one JSON object');
  if (recording.schema !== SCHEMA) {
    fail(`the recording schema is ${JSON.stringify(recording.schema)}`);
  }
  if (recording.milestone !== MILESTONE) {
    fail(`the recording milestone is ${JSON.stringify(recording.milestone)}`);
  }
  if (recording.task !== TASK) {
    fail(`the recording task is ${JSON.stringify(recording.task)}`);
  }

  const capture = recording.capture;
  if (!isObject(capture)) fail('the recording carries no capture');
  checkPage(capture);

  if (!Array.isArray(capture.records) || capture.records.length < 2) {
    fail(
      `the drive published ${Array.isArray(capture.records) ? capture.records.length : 'no'} records: a settle later than attach needs a record before it and a record after it`,
    );
  }
  if (!isObject(recording.derived)) {
    fail('the recording carries no derived section');
  }
  if (recording.derived.answer !== derive(capture).answer) {
    fail(
      `the recording answers ${JSON.stringify(recording.derived.answer)} and its own records make ${JSON.stringify(derive(capture).answer)}`,
    );
  }

  assert.deepEqual(
    recording.derived,
    derive(capture),
    'the derived section is not what the capture derives, so an armed run would move the file',
  );

  checkCitations(recording);
  return capture;
}

// ------------------------------------------------------- the three mutants ----

/**
 * The settle must be after attach, and it must not be the attach reading. A settle taken from the
 * value the read held at attach is the mutation a page that was already stable would produce, and it
 * is no transition at all.
 *
 * @param {any} capture
 * @returns {any}
 */
function checkSettleAfterAttach(capture) {
  const derived = derive(capture);

  if (isMeasurement(derived.settle.at) && derived.attach.attachAt !== null) {
    if (!(derived.settle.at > derived.attach.attachAt)) {
      fail(
        `the settle time ${derived.settle.at} ms is the attach reading ${derived.attach.attachAt} ms: a settle taken from the attach reading is no transition, because no task ended after attach`,
      );
    }
  }

  if (
    derived.attach.reading === null ||
    derived.attach.reading.value !== false
  ) {
    fail(
      `the attach reading is ${JSON.stringify(derived.attach.reading)}: an unstable-to-stable change needs a false at attach`,
    );
  }

  if (derived.answer !== 'transition-observed') {
    fail(
      `the recording answers ${derived.answer} for a drive whose settle is ${derived.settle.state}: a page whose task ends after attach must answer transition-observed`,
    );
  }

  assert.equal(
    derived.attach.reading.at,
    derived.attach.attachAt,
    'the attach emission must be the reading the page published at attach',
  );
  assert.equal(
    derived.settle.reading?.at,
    derived.settle.at,
    'the settle must be the reading the page published when true arrived',
  );
  return derived;
}

/**
 * A transition may only be claimed where the page emitted one: a `true` the read published after
 * attach. A page that published no such emission answers `no-transition-observed`, whatever a row in
 * the file says.
 *
 * @param {any} capture
 * @param {string} claimed
 * @returns {any}
 */
function checkTransitionWasEmitted(capture, claimed) {
  const derived = derive(capture);
  const emitted = derived.sequence.filter(
    (/** @type {any} */ entry) =>
      entry.value === true &&
      isMeasurement(entry.at) &&
      derived.attach.attachAt !== null &&
      entry.at > derived.attach.attachAt,
  );

  if (claimed === 'transition-observed' && emitted.length === 0) {
    fail(
      `a transition is claimed where the page emitted no true after attach: the sequence the page published is ${JSON.stringify(derived.sequence)} and its settle is ${derived.settle.state}`,
    );
  }
  if (derived.answer !== claimed) {
    fail(
      `the recording claims ${claimed} and its own readings make ${derived.answer}`,
    );
  }
  return derived;
}

/**
 * The interval is the difference of the page's two readings and of nothing else. The record's quiet
 * tail - the distance from attach to its last record - is a number the file carries, so the mutant
 * that steals it is driven here by name.
 *
 * @param {any} capture
 * @returns {any}
 */
function checkIntervalIsThePagesOwn(capture) {
  const derived = derive(capture);

  if (!isMeasurement(derived.settle.sinceAttachMs)) {
    fail(
      `the recording's interval is ${JSON.stringify(derived.settle.sinceAttachMs)}: a settle reading carries the difference of two measured readings or no interval at all`,
    );
  }

  if (
    isMeasurement(derived.quietTail.sinceAttachMs) &&
    derived.settle.sinceAttachMs === derived.quietTail.sinceAttachMs
  ) {
    fail(
      `the interval ${derived.settle.sinceAttachMs} ms is taken from the record's quiet tail (its last record was dispatched at ${derived.quietTail.lastRecordAt} ms): no interval from the quiet tail stands in for a settle`,
    );
  }

  const expected =
    /** @type {number} */ (derived.settle.at) -
    /** @type {number} */ (derived.attach.attachAt);
  if (derived.settle.sinceAttachMs !== expected) {
    fail(
      `the interval ${derived.settle.sinceAttachMs} ms is not the difference of the page's two readings (${derived.settle.at} - ${derived.attach.attachAt} = ${expected})`,
    );
  }
  return derived;
}

// ---------------------------------------------------------- the shipped join ----

/** The join, loaded into a bare context so the answer is the shipped one. */
let narrator;
function shippedJoin() {
  if (narrator === undefined) {
    const context = createContext({});
    runInContext(
      readText(NARRATOR_PATH, 'the join is part of this repository'),
      context,
    );
    narrator = context.angularAiStabilityNarrator;
    if (!isObject(narrator) || typeof narrator.stability !== 'function') {
      fail('extension/stability-narrator.js publishes no `stability` function');
    }
  }
  return narrator;
}

/**
 * The join's answer for one section the page published. `events` is empty because this suite asks
 * the join about the stability reading and no other block.
 *
 * @param {any} section
 * @returns {any}
 */
function joinOf(section) {
  return shippedJoin().stability({ stability: section, events: [] });
}

/** The one section a record carries. @param {any} record @returns {any} */
function sectionOf(record) {
  if (!isObject(record) || !isObject(record.stability)) {
    fail('a record in the capture carries no stability section');
  }
  return record.stability;
}

/** The record that published the settle reading, which is the one a mutant moves. @param {any} capture @returns {any} */
function settledRecordIn(capture) {
  const record = capture.records.find(
    (/** @type {any} */ entry) =>
      isObject(entry.stability) &&
      isObject(entry.stability.settle) &&
      entry.stability.settle.state === 'settled' &&
      isMeasurement(entry.stability.settle.at),
  );
  if (!record)
    fail('the capture carries no record that published a settle reading');
  return record;
}

/**
 * The recording's bytes held to what its own capture derives. A file that parses to the right values
 * but is not the bytes an armed run writes is a memory of an edit, and only the next armed run would
 * notice it.
 *
 * @param {string} text
 * @param {any} file
 * @returns {void}
 */
function checkCanonical(text, file) {
  const expected = canonical(rederived(file));
  const at = firstDrift(text, expected);
  if (at === -1) return;

  /** @param {string} source @returns {string} */
  const window = (source) =>
    JSON.stringify(source.slice(Math.max(0, at - 24), at + 24));

  fail(
    `the recording drifted from what its own capture derives at byte ${at}: the file reads ${window(text)} and its derivation serialises as ${window(expected)}`,
  );
}

// ----------------------------------------------------------------- the gate ----

/** True when the run is armed: `M043_CAPTURE=1`, in either shell's spelling. */
function armed() {
  return String(process.env.M043_CAPTURE ?? '').trim() === '1';
}

/** The recording's bytes as this run found them, so a default run can prove it wrote nothing. */
const baseline = sha256Of(RECORD_PATH);
const AT_LOAD = baseline;

// ---------------------------------------------------------- the armed capture ----
//
// Declared first, so an armed run re-derives before the read-only pins read the file back: the same
// pins then prove the freshly derived recording is still the one this head carries.

if (armed()) {
  test('armed: the derivation runs twice and the recording keeps its bytes', (t) => {
    /** @param {string} path */
    const write = (path) => {
      const file = readJson(path, 'the armed run has nothing to re-derive');
      writeFileSync(path, canonical(rederived(file)));
    };

    const bytes = existsSync(RECORD_PATH)
      ? readFileSync(RECORD_PATH).length
      : 0;
    t.diagnostic(
      `${RECORDED} before the armed run: ${bytes} bytes, sha256 ${baseline}`,
    );

    write(RECORD_PATH);
    const afterFirst = sha256Of(RECORD_PATH);
    write(RECORD_PATH);
    const afterSecond = sha256Of(RECORD_PATH);

    t.diagnostic(
      `${RECORDED} after the first armed derivation: sha256 ${afterFirst}`,
    );
    t.diagnostic(
      `${RECORDED} after the second armed derivation: sha256 ${afterSecond}`,
    );

    assert.equal(
      afterSecond,
      afterFirst,
      'a second armed derivation changed the recording, so the re-derivation is not idempotent',
    );
    assert.equal(
      afterFirst,
      baseline,
      'the armed derivation moved the recording, so the recording this head carries is not its own derivation - commit the re-derived file',
    );

    const reloaded = readJson(RECORD_PATH, 'the armed run wrote nothing');
    assert.deepEqual(
      reloaded.derived,
      derive(reloaded.capture),
      'the re-derived recording does not carry what its own capture derives',
    );
  });
}

// -------------------------------------------------------------- the pins ----

test('the page produced the transition: settle.at is after attachAt', () => {
  const recording = readJson(
    RECORD_PATH,
    'the drive has not been recorded, so no page-level settle exists for SC2 to rest on',
  );
  const capture = checkRecording(recording);

  assert.equal(
    capture.drive.route,
    '/lazy',
    'the recorded drive is the lazy route: it is the one route the survey found holding a pending task at attach',
  );

  const derived = checkSettleAfterAttach(capture);
  const emitted = checkTransitionWasEmitted(capture, recording.derived.answer);
  checkIntervalIsThePagesOwn(capture);

  assert.equal(
    recording.derived.answer,
    'transition-observed',
    'the recording must answer transition-observed, or say on a page why it cannot',
  );
  assert.equal(
    recording.derived.producedOnAnInspectedPage,
    true,
    'the transition must be produced on an inspected page rather than in a realm',
  );
  assert.equal(derived.transition.from, false, 'the change starts at false');
  assert.equal(derived.transition.to, true, 'and ends at true');
  assert.ok(
    derived.settle.sinceAttachMs > 0,
    `the page settled ${derived.settle.sinceAttachMs} ms after attach, so no change was measured`,
  );
  assert.equal(
    emitted.sequence.length >= 2,
    true,
    'the sequence must carry the reading before the settle and the reading at it',
  );

  // The page's own account of what held the task: the route's configuration load ended after attach
  // and the navigation completed before the settle, so the release the read saw is the navigation's.
  const arrivals = capture.drive.navigation.arrivals;
  assert.ok(
    Array.isArray(arrivals) && arrivals.length > 0,
    'the record must carry the router arrivals that name the navigation',
  );
  /** @param {string} type */
  const arrivalsOfType = (type) =>
    arrivals.filter((/** @type {any} */ arrival) => arrival.type === type);
  const loadEnd = arrivalsOfType('RouteConfigLoadEnd')[0];
  const navigationEnd = arrivalsOfType('NavigationEnd')[0];
  assert.ok(
    loadEnd && loadEnd.at > derived.attach.attachAt,
    'the lazy route configuration must still be loading when the read attached',
  );
  assert.ok(
    navigationEnd &&
      navigationEnd.at > derived.attach.attachAt &&
      navigationEnd.at < derived.settle.at,
    'the navigation must complete after attach and before the settle, which is the task it released',
  );
});

test('a settle taken from the attach reading reddens the pin that holds the transition', () => {
  const recording = readJson(RECORD_PATH, 'no recording');
  const capture = clone(recording.capture);
  const attachAt = derive(capture).attach.attachAt;

  // The mutation: the settle is the reading the read held at attach. That is what a page already
  // stable at attach reports - the control in this recording measures it - and it is the reading a
  // reviewer would take if the attach record were read as the settle.
  const record = settledRecordIn(capture);
  record.stability.settle = { state: 'settled', at: attachAt };

  assert.equal(
    derive(capture).answer,
    'no-transition-observed',
    'a settle equal to the attach reading derives no transition',
  );
  assert.throws(
    () => checkSettleAfterAttach(capture),
    /is the attach reading/,
    'a settle time taken from the attach reading must redden the pin that holds the transition',
  );
});

test('a transition claimed where the page emitted nothing reddens the pin', () => {
  const recording = readJson(RECORD_PATH, 'no recording');
  const capture = clone(recording.capture);
  const derived = derive(capture);

  // The mutation: the page keeps the shape the never-settling resource route published - a false at
  // attach and no true after it - and the file claims the transition anyway.
  const record = settledRecordIn(capture);
  record.stability.reading = { value: false, at: derived.attach.attachAt };
  record.stability.settle = { state: 'no-settle-observed' };

  const silent = derive(capture);
  assert.equal(silent.answer, 'no-transition-observed');
  assert.deepEqual(
    silent.sequence.map((/** @type {any} */ entry) => entry.value),
    [false],
    'a page that emitted nothing after attach publishes one reading and no second one',
  );
  assert.throws(
    () => checkTransitionWasEmitted(capture, 'transition-observed'),
    /emitted no true after attach/,
    'a transition claimed where the page emitted nothing must redden the pin',
  );
  assert.doesNotThrow(() =>
    checkTransitionWasEmitted(capture, 'no-transition-observed'),
  );
});

test('an interval taken from the record\u2019s quiet tail reddens the pin', () => {
  const recording = readJson(RECORD_PATH, 'no recording');
  const capture = clone(recording.capture);
  const quietTail = derive(capture).quietTail;

  // The mutation: the settle is taken from the record's quiet tail - the distance from attach to the
  // last record the page dispatched - instead of from the reading the page published.
  const record = settledRecordIn(capture);
  record.stability.settle = { state: 'settled', at: quietTail.lastRecordAt };

  assert.equal(
    derive(capture).settle.sinceAttachMs,
    quietTail.sinceAttachMs,
    'the mutation must produce exactly the quiet tail as its interval',
  );
  assert.throws(
    () => checkIntervalIsThePagesOwn(capture),
    /quiet tail/,
    'an interval taken from the record\u2019s quiet tail must redden the pin',
  );
});

test('the sequence is the read\u2019s own, and the drive\u2019s second subscription sees the same two values', () => {
  const recording = readJson(RECORD_PATH, 'no recording');
  const capture = recording.capture;
  const derived = derive(capture);

  assert.deepEqual(
    derived.sequence.map((/** @type {any} */ entry) => entry.value),
    [false, true],
    'the read published false at attach and true when it settled, in that order',
  );

  const observer = capture.observer;
  assert.ok(isObject(observer), 'the capture records no second subscription');
  assert.equal(
    observer.subscribedAt < derived.attach.attachAt,
    true,
    'the second subscription must be taken before the read attaches, or it would miss the attach emission',
  );
  assert.equal(
    observer.values.at(-1)?.value,
    true,
    'the second subscription must see the true the read settled on',
  );
  assert.equal(
    observer.values.at(-1)?.at,
    derived.settle.at,
    'and it must see it at the reading the record published',
  );
  assert.deepEqual(
    observer.values.map((/** @type {any} */ entry) => entry.value),
    derived.sequence.map((/** @type {any} */ entry) => entry.value),
    'the second subscription and the read\u2019s own records must agree on the sequence',
  );
});

test('the join reports the interval between the page\u2019s own two readings', () => {
  const recording = readJson(RECORD_PATH, 'no recording');
  const capture = recording.capture;
  const derived = derive(capture);

  const before = sectionOf(capture.records[0]);
  const after = sectionOf(capture.records[1]);

  const unsettled = joinOf(before);
  assert.equal(
    unsettled.state,
    'unstable',
    `the page's first record must answer unstable from the false it read; it answered ${unsettled.state}`,
  );
  assert.equal(
    unsettled.settle.state,
    'no-settle-observed',
    'and it must carry no settle reading yet',
  );
  assert.equal(
    'sinceAttachMs' in unsettled.settle,
    false,
    'a record with no settle reading carries no interval at all',
  );

  const settled = joinOf(after);
  assert.equal(
    settled.state,
    'stable',
    `the page's settle record must answer stable from the true it read; it answered ${settled.state}`,
  );
  assert.equal(settled.settle.state, 'settled', 'with a settle reading');
  assert.equal(settled.settle.at, derived.settle.at);
  assert.equal(
    settled.settle.sinceAttachMs,
    derived.settle.sinceAttachMs,
    'the join must report the difference of the two readings the page published',
  );
  assert.ok(
    settled.settle.sinceAttachMs > 0,
    'and that difference must be a measured interval after attach',
  );
  assert.notEqual(
    settled.settle.sinceAttachMs,
    derived.quietTail.sinceAttachMs,
    'the join must never report the record\u2019s quiet tail as the settle',
  );

  const pane = shippedJoin().stabilityPanel(settled);
  assert.match(
    String(pane.cells.settled),
    new RegExp(`${settled.settle.sinceAttachMs} ms after attach`),
    'the pane must print the measured interval',
  );
  assert.doesNotMatch(
    String(pane.text),
    /no-settle-observed:/,
    'and the pane must not print the absence beside a measured settle',
  );
});

test('a measured 0 is still reported as 0 - the recording\u2019s own control says so', () => {
  const recording = readJson(RECORD_PATH, 'no recording');
  const control = recording.capture.controls.stableAtAttach;

  const derived = derive({ records: control.records });
  assert.equal(
    derived.answer,
    'no-transition-observed',
    'a page already stable at attach settles at attach, which is no transition',
  );
  assert.equal(
    derived.settle.at,
    derived.attach.attachAt,
    'its settle reading is its attach reading',
  );
  assert.equal(derived.settle.sinceAttachMs, 0);

  const answer = joinOf(sectionOf(control.records[0]));
  assert.equal(answer.state, 'stable');
  assert.equal(answer.settle.state, 'settled');
  assert.equal(
    answer.settle.sinceAttachMs,
    0,
    'a settle measured as 0 must stay the number 0 rather than an absence or a null',
  );
  assert.equal(typeof answer.settle.sinceAttachMs, 'number');

  const pane = shippedJoin().stabilityPanel(answer);
  assert.match(
    String(pane.cells.settled),
    /, 0 ms after attach/,
    'the pane must print a measured 0 as 0 and drop nothing as falsy',
  );

  // And the control measures why the drive could not be a navigation after a settle: the read saw a
  // false after attach in a record of its own, and its settle never moved off the attach reading.
  const readAfterAttach = control.records
    .map((/** @type {any} */ record) => sectionOf(record).reading)
    .filter(
      (/** @type {any} */ reading) =>
        isObject(reading) &&
        reading.value === false &&
        isMeasurement(reading.at) &&
        reading.at > derived.attach.attachAt,
    );
  assert.equal(
    readAfterAttach.length,
    1,
    'the control must record the false the navigation produced after attach',
  );
  assert.equal(
    sectionOf(control.records.at(-1)).settle.at,
    derived.attach.attachAt,
    'and its settle must still be the attach reading, which is why a settled page cannot carry the transition',
  );
  assert.equal(
    control.navigation.ok,
    true,
    'the control navigation must have completed',
  );
});

test('the route survey names the routes that can and cannot produce it', () => {
  const recording = readJson(RECORD_PATH, 'no recording');
  const survey = recording.capture.controls.routeSurvey;

  assert.ok(
    Array.isArray(survey) && survey.length >= 4,
    'the survey must have visited more than one route',
  );

  const transitions = survey
    .map((/** @type {any} */ entry) => ({
      route: entry.route,
      derived: derive({ records: entry.records }),
    }))
    .filter((entry) => entry.derived.answer === 'transition-observed')
    .map((entry) => entry.route);

  assert.deepEqual(
    transitions,
    [recording.capture.drive.route],
    'the survey must find exactly the recorded route producing a settle after attach',
  );

  const neverSettles = survey
    .map((/** @type {any} */ entry) => ({
      route: entry.route,
      derived: derive({ records: entry.records }),
    }))
    .filter((entry) => entry.derived.settle.state === 'no-settle-observed');

  assert.deepEqual(
    neverSettles.map((entry) => entry.route),
    ['/resource-states'],
    'and exactly the never-settling resource route publishing no settle at all',
  );
  for (const entry of neverSettles) {
    assert.equal(
      entry.derived.settle.at,
      null,
      'a page that never settles carries no time for one',
    );
  }

  const stableAtAttach = survey
    .map((/** @type {any} */ entry) => derive({ records: entry.records }))
    .filter(
      (derived) =>
        derived.attach.reading?.value === true &&
        derived.settle.state === 'settled',
    );
  assert.ok(
    stableAtAttach.length >= 3,
    'the survey must have visited more than one page that was already stable at attach',
  );
  for (const derived of stableAtAttach) {
    assert.equal(
      derived.settle.sinceAttachMs,
      0,
      'and each of those must settle at attach, which is a reading and not a transition',
    );
  }
});

test('the recording is its own derivation, and a drifted byte reddens it', () => {
  const text = readText(RECORD_PATH, 'the drive has not been recorded');
  const file = JSON.parse(stripBom(text));

  assert.doesNotThrow(
    () => checkCanonical(text, file),
    'the recording is not the bytes its own capture derives, so an armed run would move it',
  );

  // The mutant: the smallest drift a serialisation can carry - one separator's spacing.
  const needle = '"schema":';
  assert.equal(
    text.split(needle).length - 1,
    1,
    'the drift mutant needs one `"schema":` to move',
  );
  assert.throws(
    () => checkCanonical(text.replace(needle, '"schema" :'), file),
    /drifted from what its own capture derives at byte \d+/,
    'a recording that drifted from its own derivation must redden the pin that holds it',
  );
});

test('a default run is a read: the recording hashes the same before and after', (t) => {
  const now = sha256Of(RECORD_PATH);
  const bytes = existsSync(RECORD_PATH) ? readFileSync(RECORD_PATH).length : 0;

  t.diagnostic(`${RECORDED} at load: ${bytes} bytes, sha256 ${AT_LOAD}`);
  t.diagnostic(`${RECORDED} after the run: sha256 ${now}`);

  assert.equal(
    now,
    baseline,
    `${RECORDED} changed during this run, so the suite is not read-only`,
  );
  assert.equal(WOULD_WRITE.length, 1, 'the file list must name what it writes');
  assert.equal(WOULD_WRITE[0]?.path, RECORD_PATH);
  t.diagnostic(
    `an armed run would write: ${WOULD_WRITE.map((file) => displayPath(file.path)).join(', ')} - ${WOULD_WRITE[0]?.command}`,
  );
});

test('the arming gate guards every side effect this suite could have', () => {
  const source = readText(SELF_PATH, 'this file');
  // Assembled so this check does not find its own needles.
  const gate = source.indexOf(['if (armed', '()) {'].join(''));
  assert.notEqual(gate, -1, 'the arming gate is not in this file');

  // A default run writes nothing: every write sits behind the gate.
  const write = ['writeFile', 'Sync', '('].join('');
  let at = source.indexOf(write);
  let writes = 0;
  while (at !== -1) {
    writes += 1;
    assert.ok(
      at > gate,
      `${write} appears outside the M043_CAPTURE gate, so a default run would re-capture`,
    );
    at = source.indexOf(write, at + write.length);
  }
  assert.ok(writes >= 1, 'the armed path must actually write the recording');

  // And it drives no browser, spawns nothing and binds no port: it reads the recording.
  for (const needle of [
    ['puppe', 'teer'].join(''),
    ['play', 'wright'].join(''),
    ['chrome-remote', '-interface'].join(''),
    ['spawn', 'Sync'].join(''),
    ['createServer', '('].join(''),
    ['connect', '('].join(''),
  ]) {
    assert.equal(
      source.includes(needle),
      false,
      `this suite must drive no browser and bind no port, and it names ${needle}`,
    );
  }
});
