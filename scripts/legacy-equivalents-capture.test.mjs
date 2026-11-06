// @ts-check
//
// M034 T002 — the cited equivalents table: the capture that produces it, and the checks a default
// run makes against the recording it produced.
//
// `extension/legacy-structure.js` answers an NgModule-declared component with a modern form, and it
// is forbidden to compose one. The form therefore has to be fetched from a page that states it, and
// recorded with the URL it came from, the exact words, and the instant it was retrieved. This file
// is both halves of that:
//
//   capture   one page fetched over HTTPS, reduced to its text, and the span of that text quoted as
//             the entry: `research/raw/m034-equivalents.json`. It is the only path that writes the
//             file, and it is armed by nothing but `M034_EQUIV_CAPTURE=1`:
//
//               set "M034_EQUIV_CAPTURE=1"&& node --experimental-strip-types --test "scripts/legacy-equivalents-capture.test.mjs"
//
//             The quotes around the assignment and the `&&` pressed against the closing quote are
//             not decoration: on cmd.exe, `set VAR=1 && …` captures the space before `&&` into the
//             value, so the flag reads `1 ` and nothing arms. The recorded `commands.capture` is
//             that exact line, and a recording that carries another form is refused below.
//
//   check     everything a default run does, and it needs no network:
//
//               node --experimental-strip-types --test "scripts/legacy-equivalents-capture.test.mjs"
//
//             A default run reads the recording, re-hashes the text the capture stored for each
//             page, and checks that every entry's quote — and the modern form inside it — is a
//             verbatim substring of that stored text. It never re-fetches: a page is not part of a
//             deterministic check, and the stored text's SHA-256 is what answers for the page it
//             was fetched from. Nothing here writes unless the flag is set, so two default runs
//             leave `git status --porcelain` exactly as they found it.
//
// Point the checks at another recording — how a mutant can be run through them as a whole:
//   set M034_EQUIV_RECORD=<path to a mutant recording> && node --experimental-strip-types --test "scripts/legacy-equivalents-capture.test.mjs"
//
// What a quote is checked against is `textOf(page)`: the fetched body with its script, style and
// comment blocks removed, its markup replaced by spaces, the entities a documentation page needs
// decoded, and whitespace collapsed. The recording stores that text, its SHA-256 and its length,
// and states this extraction in `textOf`, so the check recomputes the hash from the stored text
// and never has to trust a re-fetch. A quote that is not in the stored text fails, naming the
// entry and the URL.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RECORD_PATH =
  process.env.M034_EQUIV_RECORD ??
  join(ROOT, 'research', 'raw', 'm034-equivalents.json');

const SCRIPT = 'scripts/legacy-equivalents-capture.test.mjs';
const CAPTURE_COMMAND = `set "M034_EQUIV_CAPTURE=1"&& node --experimental-strip-types --test "${SCRIPT}"`;
const CHECK_COMMAND = `node --experimental-strip-types --test "${SCRIPT}"`;

const ARMING_FORM = 'set "M034_EQUIV_CAPTURE=1"&& ';

/** The structure `extension/legacy-structure.js` joins. A table without it sources nothing. */
const JOINED_STRUCTURE = 'NgModule-declared';

/** The entry shape, closed: six strings, and nothing a page render would have to guess at. */
const ENTRY_KEYS = [
  'id',
  'structure',
  'modernForm',
  'quote',
  'url',
  'retrievedAt',
];

/** The page shape, closed: the fetched URL, its final URL, the status, the retrieval time, the
 * stored text and the two numbers that pin it. */
const PAGE_KEYS = [
  'url',
  'finalUrl',
  'status',
  'retrievedAt',
  'characters',
  'textSha256',
  'text',
];

const TEXT_OF =
  'a fetched page body with <script>, <style> and comment blocks removed, its markup replaced by ' +
  'spaces, the entities &quot; &#39; &lt; &gt; and &amp; decoded, and runs of whitespace collapsed ' +
  'to one space — the text every quote and modern form is checked against';

/**
 * What the capture quotes, page by page. `quoteFrom`/`quoteTo` are the anchors the quote is sliced
 * between; `formFrom`/`formTo` are the anchors the modern form is sliced between, inside the quote.
 * None of these strings becomes a recorded field by being written here: the recording holds only
 * the slices the page itself carries, and fails to capture at all if an anchor is missing or
 * ambiguous.
 *
 * One entry, because there is one structure this milestone joins. `modernForm` is the page's own
 * phrase for what the migration does to a declaration — `standalone: false` removed, dependencies
 * moved into the component's `imports` array — not a form written here.
 */
const SOURCES = [
  {
    id: 'ngmodule-declared-to-standalone',
    structure: JOINED_STRUCTURE,
    url: 'https://angular.dev/reference/migrations/standalone',
    quoteFrom: 'In this mode, the migration converts all components',
    quoteTo: 'adding dependencies to their imports array.',
    formFrom: 'removing standalone: false',
    formTo: 'adding dependencies to their imports array',
  },
];

// ---------------------------------------------------------------- the text a quote is checked against ----

/**
 * A page body reduced to the text a reader reads: script, style and comment blocks dropped, markup
 * replaced by spaces so two words never fuse across a tag, the entities a documentation page uses
 * decoded, and whitespace collapsed. The recording names this extraction in `textOf`, and the
 * stored text is the output of this function.
 *
 * @param {string} html a fetched page body
 * @returns {string}
 */
function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** @param {string} text */
function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

// ---------------------------------------------------------------- capture ----

/**
 * The span of `text` between two anchors, both included. An anchor that is absent, or present more
 * than once, aborts the capture: a slice that could take the wrong one is a quote nobody verified.
 *
 * @param {string} text the page text
 * @param {string} from the first anchor
 * @param {string} to the second anchor
 * @param {string} what the field being sliced, for the failure
 * @returns {string}
 */
function sliceOnce(text, from, to, what) {
  const start = text.indexOf(from);
  if (start === -1) {
    throw new Error(
      `${what}: the starting anchor ${JSON.stringify(from)} is not on the page — the page was rewritten, so restate the anchors instead of widening them`,
    );
  }
  if (text.indexOf(from, start + from.length) !== -1) {
    throw new Error(
      `${what}: the starting anchor ${JSON.stringify(from)} occurs more than once on the page, so the slice would be a guess`,
    );
  }
  const end = text.indexOf(to, start);
  if (end === -1) {
    throw new Error(
      `${what}: the ending anchor ${JSON.stringify(to)} is not after the starting anchor — the page was rewritten, so restate the anchors instead of widening them`,
    );
  }
  return text.slice(start, end + to.length);
}

/** A page fetched once, and the text the quotes are sliced from and checked against. */
async function fetchPage(source) {
  const response = await fetch(source.url, { redirect: 'follow' });
  const body = await response.text();
  if (response.status !== 200) {
    throw new Error(
      `${source.url} answered ${response.status}: a page that did not load is not a citation`,
    );
  }
  const text = textOf(body);
  const retrievedAt = new Date().toISOString();
  return {
    url: source.url,
    finalUrl: response.url,
    status: response.status,
    retrievedAt,
    characters: text.length,
    textSha256: sha256(text),
    text,
  };
}

/**
 * The capture: fetch every source, slice the quote and the modern form out of the page's own text,
 * and return the recording. No field is written from memory — each one is either the fetch's
 * (URL, status, time, text) or a slice of that text.
 */
async function runCapture() {
  /** @type {Array<any>} */
  const pages = [];
  /** @type {Array<any>} */
  const entries = [];
  for (const source of SOURCES) {
    const page = await fetchPage(source);
    const quote = sliceOnce(
      page.text,
      source.quoteFrom,
      source.quoteTo,
      `${source.id} quote`,
    );
    const modernForm = sliceOnce(
      quote,
      source.formFrom,
      source.formTo,
      `${source.id} modern form`,
    );
    pages.push(page);
    entries.push({
      id: source.id,
      structure: source.structure,
      modernForm,
      quote,
      url: page.url,
      retrievedAt: page.retrievedAt,
    });
  }
  return {
    capturedAt: new Date().toISOString(),
    commands: { capture: CAPTURE_COMMAND, check: CHECK_COMMAND },
    environment: {
      platform: process.platform,
      shell: 'cmd.exe',
      node: process.version,
    },
    textOf: TEXT_OF,
    pages,
    entries,
  };
}

// ---------------------------------------------------------------- checks ----

/** @param {string} message */
function fail(message) {
  throw new Error(message);
}

/** @param {any} value */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** @param {any} value */
function isIsoTimestamp(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)
  );
}

/**
 * A closed field list: the object carries exactly these keys, so a recording cannot grow a field
 * nothing reads and a missing one cannot pass as absent-by-design.
 *
 * @param {any} record
 * @param {string[]} keys
 * @param {string} what
 */
function checkKeys(record, keys, what) {
  if (!isObject(record)) fail(`missing ${what}`);
  const actual = Object.keys(record).sort();
  const expected = [...keys].sort();
  if (actual.join(',') !== expected.join(',')) {
    fail(
      `${what} carries the fields [${actual.join(', ')}]; the shape is [${expected.join(', ')}]`,
    );
  }
}

/**
 * @param {any} record
 * @param {string[]} keys
 * @param {string} what
 */
function checkStrings(record, keys, what) {
  if (!isObject(record)) fail(`missing ${what}`);
  for (const key of keys) {
    if (typeof record[key] !== 'string' || record[key] === '') {
      fail(`missing ${what}.${key}`);
    }
  }
}

/**
 * The recording's own checks, in the order the failure should be read: its provenance, the pages it
 * stored, then every entry against the page it cites. All of it is reachable from a default run,
 * and none of it fetches.
 *
 * @param {any} record
 */
function validateRecord(record) {
  if (!isObject(record)) fail('the recording is not a JSON object');
  checkStrings(record, ['capturedAt', 'textOf'], 'the recording');
  if (!isIsoTimestamp(record.capturedAt)) {
    fail(
      `the recording's capturedAt is not an ISO timestamp: ${record.capturedAt}`,
    );
  }
  checkKeys(record.commands, ['capture', 'check'], 'commands');
  checkStrings(record.commands, ['capture', 'check'], 'commands');
  if (!record.commands.capture.startsWith(ARMING_FORM)) {
    fail(
      `the recorded capture command is ${JSON.stringify(record.commands.capture)}; the only form that arms on cmd.exe is ${JSON.stringify(ARMING_FORM + 'node …')} — a trailing space in the value silently disarms the capture`,
    );
  }
  if (!record.commands.check.includes(SCRIPT)) {
    fail(`the recorded check command does not run ${SCRIPT}`);
  }
  if (!Array.isArray(record.pages) || record.pages.length === 0) {
    fail(
      'the recording holds no fetched page, so no quote was ever checked against one',
    );
  }
  if (!Array.isArray(record.entries) || record.entries.length === 0) {
    fail(
      'the recording holds no equivalents entry, so there is no form to join',
    );
  }

  /** @type {Map<string, any>} */
  const pages = new Map();
  for (const page of record.pages) {
    checkKeys(page, PAGE_KEYS, 'a page');
    checkStrings(
      page,
      ['url', 'finalUrl', 'retrievedAt', 'textSha256', 'text'],
      'a page',
    );
    if (
      !page.url.startsWith('https://') ||
      !page.finalUrl.startsWith('https://')
    ) {
      fail(
        `a page was not fetched over HTTPS: ${page.url} -> ${page.finalUrl}`,
      );
    }
    if (page.status !== 200) {
      fail(
        `the page at ${page.url} was recorded with status ${page.status}, not 200`,
      );
    }
    if (!isIsoTimestamp(page.retrievedAt)) {
      fail(`the page at ${page.url} carries no ISO retrieval time`);
    }
    if (page.text.length === 0) {
      fail(`the page at ${page.url} was stored with no text`);
    }
    if (page.characters !== page.text.length) {
      fail(
        `the page at ${page.url} states ${page.characters} characters; it carries ${page.text.length}`,
      );
    }
    if (page.textSha256 !== sha256(page.text)) {
      fail(
        `the page at ${page.url} states textSha256 ${page.textSha256}; its stored text hashes to ${sha256(page.text)} — the text is not the text that was fetched and hashed`,
      );
    }
    if (pages.has(page.url)) {
      fail(`the recording fetched ${page.url} twice`);
    }
    pages.set(page.url, page);
  }

  /** @type {Set<string>} */
  const structures = new Set();
  for (const entry of record.entries) {
    checkKeys(entry, ENTRY_KEYS, 'an entry');
    checkStrings(entry, ENTRY_KEYS, 'an entry');
    if (!isIsoTimestamp(entry.retrievedAt)) {
      fail(`entry ${entry.id} carries no ISO retrieval time`);
    }
    const page = pages.get(entry.url);
    if (!page) {
      fail(
        `entry ${entry.id} cites ${entry.url}, which the recording never fetched: a quote cannot be verbatim in a page it did not come from`,
      );
    }
    if (entry.retrievedAt !== page.retrievedAt) {
      fail(
        `entry ${entry.id} states it was retrieved at ${entry.retrievedAt}; the page at ${entry.url} was retrieved at ${page.retrievedAt}`,
      );
    }
    if (!page.text.includes(entry.quote)) {
      fail(
        `entry ${entry.id}: its quote is not present at ${entry.url} — the stored text (sha256 ${page.textSha256}) does not contain ${JSON.stringify(entry.quote)}`,
      );
    }
    if (!entry.quote.includes(entry.modernForm)) {
      fail(
        `entry ${entry.id}: its modern form is not part of its quote, so nothing at ${entry.url} sources it: ${JSON.stringify(entry.modernForm)}`,
      );
    }
    if (structures.has(entry.structure)) {
      fail(
        `two entries claim the structure ${entry.structure}: the join would depend on which one it found first`,
      );
    }
    structures.add(entry.structure);
  }

  if (!structures.has(JOINED_STRUCTURE)) {
    fail(
      `the recording carries no entry for the ${JOINED_STRUCTURE} structure, which is the one extension/legacy-structure.js joins`,
    );
  }
  return record;
}

/**
 * Reads the recording. Missing or unreadable throws — never skips: the recording is the milestone's
 * quoted evidence, and a check that shrugs at its absence pins nothing.
 *
 * @param {string} [path]
 */
function readRecording(path = RECORD_PATH) {
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch (error) {
    throw new Error(
      `the equivalents recording is absent or unreadable (${path}) — capture it with: ${CAPTURE_COMMAND}`,
    );
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(
      `${path} is not JSON: ${error && error.message ? error.message : String(error)}`,
    );
  }
}

/** @param {any} record */
function clone(record) {
  return JSON.parse(JSON.stringify(record));
}

// ---------------------------------------------------------------- opt-in capture ----
// Declared before the checks on purpose: an armed run captures first, so the checks below run
// against the recording the capture just wrote instead of failing on its absence. A default run has
// no such test at all, and nothing in this file writes.

if (process.env.M034_EQUIV_CAPTURE === '1') {
  test('capture the cited table from the pages that state it', async (t) => {
    const record = await runCapture();
    writeFileSync(RECORD_PATH, `${JSON.stringify(record, null, 2)}\n`);
    validateRecord(record);
    for (const entry of record.entries) {
      t.diagnostic(
        `wrote ${entry.id} (${entry.structure}) from ${entry.url}: ${JSON.stringify(entry.quote)}`,
      );
    }
  });
}

// ---------------------------------------------------------------- default checks ----

test('the recording validates: every entry carries a url, a verbatim quote and its retrieval time', () => {
  const record = validateRecord(readRecording());
  assert.ok(
    record.pages.length > 0,
    'the recording must hold the page it quotes',
  );
  assert.ok(
    record.entries.length > 0,
    'the recording must hold at least one entry',
  );
});

test('every quote is present in the stored text of the page its entry cites', (t) => {
  const record = readRecording();
  for (const entry of record.entries) {
    const page = record.pages.find((candidate) => candidate.url === entry.url);
    assert.ok(
      page,
      `entry ${entry.id} cites a page the recording never fetched`,
    );
    assert.ok(
      page.text.includes(entry.quote),
      `entry ${entry.id}: the quote is not present at ${entry.url}`,
    );
    assert.ok(
      entry.quote.includes(entry.modernForm),
      `entry ${entry.id}: the modern form is not inside the quote`,
    );
    t.diagnostic(
      `entry ${entry.id} (${entry.structure}) ${entry.url} quote ${entry.quote.length} chars, form ${entry.modernForm.length} chars, page text ${page.characters} chars, sha256 ${page.textSha256}`,
    );
  }
});

test('the stored text drops markup, script and style content, and decodes the entities a page uses', () => {
  assert.equal(
    textOf(
      '<p>a &amp; b &quot;c&quot; &#39;d&#39; &lt;e&gt;</p><script>var hidden = 1;</script><style>.x{color:red}</style><!-- note -->',
    ),
    'a & b "c" \'d\' <e>',
    'the text a quote is checked against is the page as a reader reads it',
  );
});

test('a default run reads the stored text and fetches nothing', () => {
  const realFetch = globalThis.fetch;
  let calls = 0;
  // @ts-expect-error — the stub is deliberately not a full fetch implementation
  globalThis.fetch = () => {
    calls += 1;
    throw new Error(
      'a default run must not fetch: the stored text is the page',
    );
  };
  try {
    const record = readRecording();
    validateRecord(record);
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.equal(
    calls,
    0,
    'a default run must check against the stored text and its hash, never re-fetch the page',
  );
});

// ---------------------------------------------------------------- mutants ----

test('held-out: a quote the page does not carry reddens, naming the entry and its url', () => {
  const mutant = clone(readRecording());
  const entry = mutant.entries[0];
  entry.quote = 'a sentence the page at this URL does not carry';
  entry.modernForm = 'a sentence the page at this URL does not carry';
  assert.throws(
    () => validateRecord(mutant),
    new RegExp(
      `entry ${entry.id}: its quote is not present at ${entry.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    ),
    'a quote that is not verbatim at its URL must fail the default run',
  );
});

test('held-out: a modern form no entry sources reddens', () => {
  const mutant = clone(readRecording());
  const entry = mutant.entries[0];
  entry.modernForm = 'standalone: true';
  assert.throws(
    () => validateRecord(mutant),
    /its modern form is not part of its quote/,
    'a form the cited page does not state must not pass as sourced',
  );
});

test('held-out: a stored text edited without its hash reddens', () => {
  const mutant = clone(readRecording());
  const page = mutant.pages[0];
  page.text = `${page.text} edited`;
  page.characters = page.text.length;
  assert.throws(
    () => validateRecord(mutant),
    /is not the text that was fetched and hashed/,
    'editing the text behind a quote must be caught by the hash',
  );
});

test('held-out: an entry citing a page the recording never fetched reddens', () => {
  const mutant = clone(readRecording());
  mutant.entries[0].url = 'https://angular.dev/reference/migrations/nowhere';
  assert.throws(
    () => validateRecord(mutant),
    /which the recording never fetched/,
    'an entry must cite a page the capture actually fetched',
  );
});

test('held-out: an entry whose retrieval time is not its page’s reddens', () => {
  const mutant = clone(readRecording());
  mutant.entries[0].retrievedAt = '2020-01-01T00:00:00.000Z';
  assert.throws(
    () => validateRecord(mutant),
    /was retrieved at/,
    'the retrieval time must be the fetch that produced the text',
  );
});

test('held-out: a capture command that does not arm on cmd.exe reddens', () => {
  const mutant = clone(readRecording());
  mutant.commands.capture = `set M034_EQUIV_CAPTURE=1 && node --experimental-strip-types --test "${SCRIPT}"`;
  assert.throws(
    () => validateRecord(mutant),
    /trailing space in the value silently disarms the capture/,
    'the trailing-space form must not be recorded as the way to arm the capture',
  );
});

test('held-out: a table with no NgModule-declared entry reddens', () => {
  const mutant = clone(readRecording());
  for (const entry of mutant.entries) entry.structure = 'NgModule-in-legacy';
  assert.throws(
    () => validateRecord(mutant),
    /carries no entry for the NgModule-declared structure/,
    'the join would find no form at all if the structure it reads is absent',
  );
});
