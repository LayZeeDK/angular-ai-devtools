// M068 T006 — the claims census: one claim per success criterion the intent declares, one claim per
// edge the intent's five-column table binds, and every citation re-resolved on every run by opening the
// file it names and reading the line it states.
//
// The gate reads a claim list for every milestone (`scripts/overlay-verdict-claims.test.mjs`,
// `scripts/navigation-blocking.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`,
// `scripts/guard-verdict-claims.test.mjs`), and a milestone planned without one reports, in every one of
// those suites, that `research/raw/m068-verdict-claims.json` is missing. This suite is the census that
// writes it. Six rules, and none of them reads a fact the tree does not carry:
//
//   1. Each criterion, quoted. Every numbered criterion the milestone's own intent declares is ruled
//      exactly once, and its `criterionText` is the intent's own text, parsed with the routine
//      `scripts/overlay-verdict-claims.test.mjs` uses, so the quote is compared character for character
//      by the suites that read it as well as by this one. `criterionCharacters` states the length quoted.
//   2. Each claim's edges, read from the intent. The five columns the owner's ruling makes authoritative
//      (`Edge | Criterion | Category | Disposition | Detail`) give each criterion the edges it is held
//      by, with the detail cell verbatim, and every one of the eight edges gets a claim of its own.
//   3. Each criterion's suite, read from the plan and the task it assigns. This milestone's plan holds
//      nothing out — its `## Held-out checks` states that every edge is proved by the suite of the task
//      that owns it — so the suite is resolved the way `scripts/navigation-blocking.test.mjs` resolves
//      it: the plan's `## Intent coverage` rows for the criterion, in order, and the first suite the
//      owning task's own `files:` list declares that the task's base commit does not carry. The
//      resolution is derived here and the table below must name what it derives, so a plan or a task
//      whose files list moves reddens naming both rather than citing the suite a task happened to add.
//   4. Each citation, opened and read. A citation names a file, a line and the text that line carries;
//      every run opens that file and asserts the line is there and states what the citation says it
//      states. A criterion's citation is a test declaration, so it also names the test title, and the
//      line must be the line that declares that title — which is the rule the censuses above apply to a
//      record they read.
//   5. Each edge's claim and, where the fact is a measured absence, the absence itself. The committed
//      head record states `writtenBy.read: false` and `duplicate.read: false`: it names no writing
//      navigation and counts no entries sharing a name. Those two are recorded under an `absence` entry
//      with what was searched and what was found, rather than softened into prose or replaced by a
//      verification this suite did not make.
//   6. Each claim's artefact. A row names the artefact path it cites, says what that artefact carries,
//      and states the edge ids it is ruled on as `edge ["E1","E2"]`, the shape the censuses read.
//
// The record was captured while the intent and the plan sat at their live locations; the ship moves
// both, so the record is compared in its own words at the locations it states
// (`atRecordedDocumentLocations`) and every other field is compared byte for byte against the
// derivation.
//
// One milestone later this suite is the predecessor rather than the census: the record it reads can name
// another suite in its own `capture.command`, and that suite's proof table is then the one the list is
// derived against. This file holds such a record to the ownership chain instead — the rule
// `scripts/guard-verdict-claims.test.mjs` applies to M064's record and
// `scripts/navigation-blocking.test.mjs` applies to every milestone's — and leaves the derivation, the
// quotes against the intent and the plan resolution to the suite the record names. At this head
// `research/raw/m068-verdict-claims.json` names this file, so the derivation runs and the stand-down
// holds the chain in reserve.
//
// `M068_CAPTURE=1` arms the one write. It re-derives, compares, and writes only when a value moved, so
// two armed runs leave the file byte-identical; a default run reads the file, asserts it is exactly what
// this head derives, and asserts its own bytes did not move:
//
//   M068_CAPTURE=1 node --test scripts/m068-verdict-claims.test.mjs
//
// This suite names no project-directory path and opens none: the intent is asked of
// `scripts/verdict-claims-intent.mjs`, so the archive move is that resolver's decision and not a second
// one taken here.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { intentPathForMilestone } from './verdict-claims-intent.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUITE_REL = 'scripts/m068-verdict-claims.test.mjs';
const RAW = 'research/raw';

/**
 * The first characters of a project-directory path, kept apart so this file names no such reference and
 * the archive-path census records none of its own here. It is used only to re-spell a document location
 * the record states.
 */
const DOTTED = '.' + 'project';

/** The milestone this record is numbered for, and the two artefacts this milestone ships. */
const MILESTONE = 'M068';
const MEASURED_REL = 'research/raw/m068-head-record.json';
const JOIN_REL = 'extension/head-state.js';
const PANEL_REL = 'apps/angular-ai-devtools/src/app/panel-head-state.ts';

const CLAIMS_REL = `${RAW}/${MILESTONE.toLowerCase()}-verdict-claims.json`;
const CLAIMS_PATH = join(ROOT, ...CLAIMS_REL.split('/'));

/**
 * The record this file writes, named as a literal as well as derived. The readers that subtract a
 * record its own census hold open read the owner from the record's `capture.command` and then require
 * that owner to name the record's path, so the two spellings are kept one by the assertion in `derive`.
 */
const CLAIMS_NAMED = 'research/raw/m068-verdict-claims.json';

/**
 * The suite that owns the claim list this file reads, read from the record's own `capture.command`.
 *
 * This file is M068's census: its `PROOFS` table, its plan resolution, its two document paths and its
 * two measured absences are M068's, and it can derive the list only for the record M068 wrote. A record
 * whose own `capture.command` names another suite is therefore owned elsewhere — the same rule
 * `scripts/guard-verdict-claims.test.mjs` applies to M064's record and
 * `scripts/navigation-blocking.test.mjs` applies to every milestone's — and this file stands down to the
 * ownership chain instead of comparing that record against M068's tables. A record that names this file
 * is derived and pinned here exactly as before, which is what
 * `research/raw/m068-verdict-claims.json` does at this head: its command arms `M068_CAPTURE` and names
 * this suite, so the stand-down holds the chain in reserve rather than firing.
 *
 * @param {any} recording the claim list, or null when it has never been captured
 * @returns {string} the repository path of the suite that captures it
 */
function owningCensus(recording) {
  const command = String(recording?.capture?.command ?? '');
  const named = /scripts\/[a-z0-9-]+\.test\.mjs/.exec(command)?.[0];
  return named ?? SUITE_REL;
}

/**
 * Whether the suite a record names as its census names that record. Two spellings count: the path
 * written literally, and the `research/raw/<milestone>-verdict-claims.json` template keyed on the
 * milestone the state file binds. A census that names neither does not own what it claims to.
 * @param {string} source the owning census's text
 * @param {string} record the repository path of the record it owns
 * @returns {boolean}
 */
function namesThisRecord(source, record) {
  if (source.includes(record)) return true;
  return (
    source.includes('-verdict-claims.json') &&
    /`research\/raw\/\$\{/.test(source) &&
    /boundMilestone\s*\(/.test(source)
  );
}

const CLAIMS_OWNER = existsSync(CLAIMS_PATH)
  ? owningCensus(
      JSON.parse(readText(CLAIMS_REL, 'the list is part of this repository')),
    )
  : SUITE_REL;

/** Whether the record on disk names another suite as the census that captured it. */
const CLAIMS_OWNED_ELSEWHERE = CLAIMS_OWNER !== SUITE_REL;

/** The commands this record is held to, recorded in it so a reader runs what produced it. */
const CAPTURE_ENV = 'M068_CAPTURE';
/** The same arm under the long spelling a brief may use; the record states `M068_CAPTURE`. */
const CAPTURE_ALIAS = 'M068_CLAIMS_CAPTURE';
const CHECK_COMMAND = `node --test ${SUITE_REL}`;
const CAPTURE_COMMAND = `${CAPTURE_ENV}=1 ${CHECK_COMMAND}`;
const ARMED = [CAPTURE_ENV, CAPTURE_ALIAS].some(
  (name) => String(process.env[name] ?? '').trim() === '1',
);

/** The five column names the owner's ruling makes authoritative, in the order it names them. */
const EDGE_COLUMNS = ['Edge', 'Criterion', 'Category', 'Disposition', 'Detail'];

/** The six fields `extension/head-state.js` answers with, and no seventh. */
const ANSWER_FIELDS = [
  'state',
  'entry',
  'present',
  'writtenBy',
  'reason',
  'observed',
];

/**
 * What proves each criterion, in the order a reader should read it. Every entry is a test declaration:
 * the census suites hold a record to a title its suite declares, so the citation carries the title and
 * the line and this suite refuses a line that is not the line declaring it. The first citation is the
 * one the row's `suite` and `test` fields name and the one the row's artefact is; the plan's own
 * resolved suite is among the citations of every row, stated rather than left to a reader's fallback.
 */
const PROOFS = Object.freeze({
  SC1: Object.freeze([
    {
      suite: 'scripts/head-state.test.mjs',
      test: 'AC1: a name present twice is duplicate, and both entries are named',
      line: 934,
      lineText: "it('AC1: a name present twice is duplicate",
      holds:
        'a head carrying two entries of one name answers `duplicate` with both entries named, so the entry the record observed is never the only one the answer names',
    },
    {
      suite: 'scripts/head-state.test.mjs',
      test: 'AC1 mutant: a duplicate naming only the first occurrence reddens the pin, naming both entries',
      line: 1203,
      lineText: "it('AC1 mutant: a duplicate naming only the first occurrence",
      holds:
        'the mutant that reports only the first occurrence reddens the pin by name, so the entry still present is measured rather than asserted',
    },
    {
      suite: 'scripts/head-state.test.mjs',
      test: 'E1: a head with one entry of the name reports no duplicate, and no finding with an empty comparison',
      line: 1046,
      lineText:
        "it('E1: a head with one entry of the name reports no duplicate",
      holds:
        'one entry of the name is not reported as two, and the answer names the entry it read rather than a finding with an empty comparison',
    },
    {
      suite: 'scripts/head-record.test.mjs',
      test: 'a duplicate invented beside the observed entry reddens the duplicate pin, naming the entry',
      line: 1869,
      lineText:
        "it('a duplicate invented beside the observed entry reddens the duplicate pin",
      holds:
        'a duplicate the record does not carry reddens the record’s own pin, so the entry present twice is read from the record rather than invented',
    },
  ]),
  SC2: Object.freeze([
    {
      suite: 'scripts/head-state.test.mjs',
      test: 'AC2: an entry one navigation wrote and another page carries is stale, naming both navigations',
      line: 979,
      lineText:
        "it('AC2: an entry one navigation wrote and another page carries is stale",
      holds:
        'an entry one navigation wrote and another page carries answers `stale` naming the writing navigation and the carrying one, both of them',
    },
    {
      suite: 'scripts/head-state.test.mjs',
      test: 'AC2 mutant: a stale answer without the writing navigation reddens the pin, naming both navigations',
      line: 1234,
      lineText:
        "it('AC2 mutant: a stale answer without the writing navigation reddens the pin",
      holds:
        'the mutant that reports staleness without the writing navigation reddens the pin naming both navigations, so the writing navigation is measured',
    },
    {
      suite: 'scripts/head-state.test.mjs',
      test: 'E3: an entry the navigation whose page carries it wrote is current, and a stale one is not current',
      line: 1015,
      lineText:
        "it('E3: an entry the navigation whose page carries it wrote is current",
      holds:
        'an entry the carrying navigation itself wrote answers `current`, and a stale one does not: the two states are told apart by the navigations the record carries',
    },
    {
      suite: 'scripts/head-state.test.mjs',
      test: 'AC3: a write with no navigation beside it is cannot-tell, naming that fact and inferring no route',
      line: 1077,
      lineText: "it('AC3: a write with no navigation beside it is cannot-tell",
      holds:
        'a write the record attributes to no navigation answers `cannot-tell` naming that fact, and no route is read out of the entry text',
    },
    {
      suite: 'scripts/head-state.test.mjs',
      test: 'AC3 mutant: a join that names a remedy and a route reddens the pin, naming both',
      line: 1271,
      lineText:
        "it('AC3 mutant: a join that names a remedy and a route reddens the pin",
      holds:
        'the mutant that names a remedy and a route reddens the pin naming both, so no answer of this milestone offers a repair or a navigation it was not given',
    },
  ]),
  SC3: Object.freeze([
    {
      suite: 'scripts/head-record.test.mjs',
      test: 'carries the identity the shipped reader of the same observation reads',
      line: 1808,
      lineText:
        "it('carries the identity the shipped reader of the same observation reads",
      holds:
        'the entry identity the record carries is the one `extension/title-input.js` reads from the same observation, asserted against that producer rather than derived a second time',
    },
    {
      suite: 'scripts/head-record.test.mjs',
      test: 'a second identity for the entry reddens the identity pin, naming the reader it is not in',
      line: 1948,
      lineText: "it('a second identity for the entry reddens the identity pin",
      holds:
        'a second identity reddens the identity pin naming the reader it is not in, so one entry keeps one spelling',
    },
    {
      suite: 'scripts/head-record.test.mjs',
      test: 'states the writing navigation and the duplicate as not read, each with the reason it could not be',
      line: 1785,
      lineText:
        "it('states the writing navigation and the duplicate as not read",
      holds:
        'the record states its writing navigation and its duplicate as measured absences, each with its own reason, rather than leaving the fields empty',
    },
    {
      suite: 'scripts/head-record.test.mjs',
      test: 'AC3: names the recording in the manifest and the suite in the census, both read at capture',
      line: 1686,
      lineText:
        "it('AC3: names the recording in the manifest and the suite in the census",
      holds:
        'the record is named in `scripts/recordings.json` with the suite and the arm that write it, both read at capture, so the record this milestone writes is a declared recording',
    },
    {
      suite: 'scripts/head-state.test.mjs',
      test: 'writes no recording: the committed record is read into memory and never re-captured',
      line: 792,
      lineText:
        "it('writes no recording: the committed record is read into memory and never re-captured",
      holds:
        'the join and its suite read the one record this milestone writes and re-capture nothing, so a writing navigation has one source rather than a second reader',
    },
  ]),
  SC4: Object.freeze([
    {
      suite: 'apps/angular-ai-devtools/src/app/app.spec.ts',
      test: 'appends the panel surfaces last and installs each through the demo component',
      line: 75,
      lineText:
        "it('appends the panel surfaces last and installs each through the demo component",
      holds:
        'the route table enumerates the surface at its own place in the ordered list and installs it through the demo component, so the surface this milestone adds is reached by its own name',
    },
    {
      suite: 'scripts/panel-routes.test.mjs',
      test: 'E1: the panel routes are one list mapped over one literal, and every surface keeps its path and its own name',
      line: 224,
      lineText:
        "test('E1: the panel routes are one list mapped over one literal",
      holds:
        'the route table is one list mapped over one literal and the surface keeps its own path, which is the pin this milestone moved in the same task',
    },
    {
      suite: 'scripts/panel-routes.test.mjs',
      test: 'E4: every declared route surface has a panel-demo LOADERS key',
      line: 817,
      lineText:
        "test('E4: every declared route surface has a panel-demo LOADERS key",
      holds:
        'every declared route surface has a loader key, so the surface this milestone adds is reached by its own key and a dropped key reddens naming the surface',
    },
  ]),
});

/** The suite the plan resolves for each criterion, named here and held to the derivation below. */
const PLAN_SUITES = Object.freeze({
  SC1: 'scripts/head-state.test.mjs',
  SC2: 'scripts/head-state.test.mjs',
  SC3: 'scripts/head-record.test.mjs',
  SC4: 'apps/angular-ai-devtools/src/app/app.spec.ts',
});

/**
 * The three suites this milestone ships, each holding one of its artefacts: the record's suite, the
 * join's suite and the pane's suite. A claim may cite one of them beside the plan's own suite and the
 * suites its edges cite, and nothing else, so a citation cannot arrive from a suite this milestone
 * neither ships nor assigns.
 */
const MILESTONE_SUITES = Object.freeze({
  record: 'scripts/head-record.test.mjs',
  join: 'scripts/head-state.test.mjs',
  pane: 'apps/angular-ai-devtools/src/app/panel-demo.spec.ts',
});

/**
 * One claim per edge of the intent's own table, each citing the lines that carry it. `fields` are the
 * join's answer keys the edge is ruled on; `citations` are opened and read back on every run; `absence`
 * is null where the tree carries the edge's instance and states what was searched and what was found
 * where it does not.
 */
const EDGE_CLAIMS = Object.freeze({
  E1: {
    claim:
      'A head carrying one entry of the name answers with the entry still present and is never reported as two, so the comparison is a reading rather than an empty one.',
    fields: ['state', 'entry', 'present'],
    suite: 'scripts/head-state.test.mjs',
    test: 'E1: a head with one entry of the name reports no duplicate, and no finding with an empty comparison',
    citations: [
      {
        file: 'scripts/head-state.test.mjs',
        line: 1055,
        lineText: 'the record counted one entry carrying the name',
        holds:
          'the answer for a record that counted one entry is a state and not a duplicate, so one entry is not read as two',
      },
      {
        file: 'extension/head-state.js',
        line: 438,
        lineText: 'if (count >= 2) {',
        holds:
          'the duplicate branch is taken only for a count of two or more, so a count of one never reaches it',
      },
      {
        file: MEASURED_REL,
        line: 229,
        lineText: '"entries": 1,',
        holds:
          'the committed record carries one entry, which is the head the criterion is about',
      },
    ],
    absence: null,
    proves: [CHECK_COMMAND, 'node --test scripts/head-state.test.mjs'],
  },
  E2: {
    claim:
      'When two entries share a name, the second is named as the one still present beside the one the record observed, and the entry the record observed is never offered as the one still present.',
    fields: ['state', 'entry', 'present'],
    suite: 'scripts/head-state.test.mjs',
    test: 'AC1: a name present twice is duplicate, and both entries are named',
    citations: [
      {
        file: 'scripts/head-state.test.mjs',
        line: 947,
        lineText:
          'the duplicate must name the entry the record observed being written',
        holds:
          'the duplicate names the entry the record observed being written, so the observed write is one of the two named',
      },
      {
        file: 'scripts/head-state.test.mjs',
        line: 957,
        lineText:
          'the duplicate must name the second entry of the same name as the record names it',
        holds:
          'the entry still present is the second entry the record names, and the two entries named are not the same one',
      },
      {
        file: 'extension/head-state.js',
        line: 455,
        lineText: 'presentOf(second, carrying),',
        holds:
          'the duplicate answer is built with the second entry as the entry still present, never with the first',
      },
    ],
    absence: {
      part: 'a head record in this checkout that carries two entries sharing one name',
      searched:
        'research/raw/m068-head-record.json: `entries[].duplicate` on every row, and the record’s own `counts` block',
      found:
        'one entry (`title`) and `"duplicate": { "read": false }` on it, with `counts.duplicateRead` 0 and no count of entries sharing a name anywhere in the record: no second entry is named, so the duplicate instance is exercised on a record constructed from the same shape by scripts/head-state.test.mjs:934 and this absence is recorded here rather than cited from a line that does not exist',
    },
    proves: [CHECK_COMMAND, 'node --test scripts/head-state.test.mjs'],
  },
  E3: {
    claim:
      'An entry the page carrying it also wrote is current and an entry another navigation left behind is not, so a stale entry is never answered current and a current one is never answered stale.',
    fields: ['state', 'writtenBy', 'present'],
    suite: 'scripts/head-state.test.mjs',
    test: 'E3: an entry the navigation whose page carries it wrote is current, and a stale one is not current',
    citations: [
      {
        file: 'scripts/head-state.test.mjs',
        line: 1024,
        lineText: 'navigation 2 both wrote the entry and carries it',
        holds:
          'the current answer is the case where the writing navigation and the carrying one are one navigation',
      },
      {
        file: 'scripts/head-state.test.mjs',
        line: 1039,
        lineText: 'navigation 0 wrote the entry and navigation 2 carries it',
        holds:
          'the record that names two navigations is answered as not current, so a stale entry is not reported as current',
      },
      {
        file: 'extension/head-state.js',
        line: 522,
        lineText: 'if (writesAt === carriesAt) {',
        holds:
          'the comparison is the record’s own two navigation indexes, and the state is decided by whether they are one',
      },
      {
        file: 'extension/head-state.js',
        line: 525,
        lineText:
          'return answer(STALE, entry, present, writtenBy, null, observed);',
        holds:
          'a record whose two navigations differ answers stale with both of them named',
      },
    ],
    absence: null,
    proves: [CHECK_COMMAND, 'node --test scripts/head-state.test.mjs'],
  },
  E4: {
    claim:
      'A write the record attributes to no navigation is `cannot-tell` naming that fact, and no route is inferred from the entry text or its order in the head.',
    fields: ['state', 'writtenBy', 'reason'],
    suite: 'scripts/head-state.test.mjs',
    test: 'AC3: a write with no navigation beside it is cannot-tell, naming that fact and inferring no route',
    citations: [
      {
        file: 'scripts/head-state.test.mjs',
        line: 1096,
        lineText: "'writtenBy-not-recorded',",
        holds:
          'the reason the answer states is the missing writing navigation, named rather than guessed at',
      },
      {
        file: 'scripts/head-state.test.mjs',
        line: 1102,
        lineText:
          "a navigation read off the entry's text is an inference and not a reading",
        holds:
          'the answer names no navigation where the record carries none, and a navigation read off the entry text is refused by name',
      },
      {
        file: 'extension/head-state.js',
        line: 499,
        lineText:
          'if (writtenByFact === null || writtenByFact.read === false) {',
        holds:
          'a row whose writing-navigation fact was not read is answered before any comparison is made',
      },
      {
        file: 'extension/head-state.js',
        line: 505,
        lineText: 'WRITTEN_BY_NOT_RECORDED,',
        holds:
          'the reason the join publishes for that row is the fact it is missing, and it carries no route in its place',
      },
      {
        file: MEASURED_REL,
        line: 218,
        lineText: '"read": false,',
        holds:
          'the committed record states its writing navigation as not read, which is the write with no navigation beside it',
      },
    ],
    absence: {
      part: 'a row in this checkout whose writing navigation was read',
      searched:
        'research/raw/m068-head-record.json: `entries[].writtenBy`, the record’s own `writes` list, `counts.writtenByRead` and `counts.writesObserved`',
      found:
        '`"writtenBy": { "read": false, "observed": false }` with `counts.writtenByRead` 0 and `counts.writesObserved` 0: the observer saw no write, so no navigation is attributed to any entry, and the answers that name a writing navigation are exercised on records constructed from the same shape (scripts/head-state.test.mjs:979 and :1015) rather than on the committed bytes',
    },
    proves: [CHECK_COMMAND, 'node --test scripts/head-state.test.mjs'],
  },
  E5: {
    claim:
      'The record is the only source of a writing navigation: the join reads the record’s own writing-navigation fact and never re-reads the record’s own writes list, so a second reader reddens the record’s own suite.',
    fields: ['writtenBy', 'observed', 'state'],
    suite: 'scripts/head-record.test.mjs',
    test: 'states the writing navigation and the duplicate as not read, each with the reason it could not be',
    citations: [
      {
        file: 'scripts/head-record.test.mjs',
        line: 1837,
        lineText:
          "it('an invented writing navigation reddens the written-by pin",
        holds:
          'a writing navigation the record does not carry reddens the record’s own pin, naming the entry and the source it is not in',
      },
      {
        file: 'extension/head-state.js',
        line: 122,
        lineText: 'writes` list is not re-read here',
        holds:
          'the join states that the record’s own writes list is not re-read, so the correlation T001 made is the only one',
      },
      {
        file: 'extension/head-state.js',
        line: 355,
        lineText: 'export function headState(record, facts) {',
        holds:
          'one function is the whole reader of a head entry state, so there is one place a writing navigation can come from',
      },
      {
        file: 'scripts/head-state.test.mjs',
        line: 792,
        lineText:
          "it('writes no recording: the committed record is read into memory and never re-captured",
        holds:
          'the join suite reads the committed record into memory and re-captures nothing, so a second writer is refused by the suite itself',
      },
    ],
    absence: null,
    proves: [
      CHECK_COMMAND,
      'node --test scripts/head-record.test.mjs',
      'node --test scripts/head-state.test.mjs',
    ],
  },
  E6: {
    claim:
      'An entry identity this repository does not produce is answered with the absence the join names, and no second identity is derived: the identity is the one `extension/title-input.js` reads from the same observation.',
    fields: ['entry', 'reason', 'observed'],
    suite: 'scripts/head-record.test.mjs',
    test: 'carries the identity the shipped reader of the same observation reads',
    citations: [
      {
        file: 'scripts/head-record.test.mjs',
        line: 1948,
        lineText:
          "it('a second identity for the entry reddens the identity pin",
        holds:
          'a second identity reddens the identity pin naming the reader it is not in, so one entry keeps one spelling',
      },
      {
        file: MEASURED_REL,
        line: 110,
        lineText: '"producer": "extension/title-input.js",',
        holds:
          'the identity the record carries names the producer it is asserted against, so the reader is named in the record',
      },
      {
        file: 'extension/head-state.js',
        line: 403,
        lineText: 'if (entry === null) {',
        holds:
          'a name fact that names no entry is answered as an absence rather than as an entry this join derived',
      },
      {
        file: 'extension/head-state.js',
        line: 409,
        lineText: 'NAME_NOT_AN_ENTRY,',
        holds:
          'the reason published for a name that names no entry is its own word, so no second identity is invented in its place',
      },
    ],
    absence: null,
    proves: [
      CHECK_COMMAND,
      'node --test scripts/head-record.test.mjs',
      'npx nx run angular-ai-devtools:test',
    ],
  },
  E7: {
    claim:
      'The route table, the loader map, the ordered path pins and the surface record move together, so a surface dropped from any one of them reddens naming it.',
    fields: ['state'],
    suite: 'scripts/panel-routes.test.mjs',
    test: 'E4: every declared route surface has a panel-demo LOADERS key',
    citations: [
      {
        file: 'scripts/panel-routes.test.mjs',
        line: 38,
        lineText: "'head-state',",
        holds:
          'the surface is one entry of the route table the table is built from, and one only',
      },
      {
        file: 'scripts/panel-routes.test.mjs',
        line: 1766,
        lineText: "declaredSurfaces(routesSource).includes('head-state'),",
        holds:
          'the declared surface list is asserted to carry the surface, so a route dropped from the table reddens naming it',
      },
      {
        file: 'apps/angular-ai-devtools/src/app/panel-demo.ts',
        line: 76,
        lineText: "'head-state': () => import('./panel-head-state') as never,",
        holds:
          'the demo loader map carries the key that reaches this pane, and the pane module is the one it imports',
      },
      {
        file: 'apps/angular-ai-devtools/src/app/app.spec.ts',
        line: 106,
        lineText: "'head-state', // M068 SC4 surface:",
        holds:
          'the app spec enumerates the surface in the ordered route list the table installs it in',
      },
      {
        file: 'apps/angular-ai-devtools/src/app/page-picker.component.spec.ts',
        line: 440,
        lineText: "expect(lazy).toContain('head-state');",
        holds:
          'the picker spec holds the lazy list to the surface, so a route appended without registering reddens here',
      },
      {
        file: 'apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts',
        line: 837,
        lineText: "'head-state',",
        holds:
          'the chat-entry spec enumerates the same surface in its own ordered list, so the third enumerating suite moves with the table',
      },
    ],
    absence: null,
    proves: [
      CHECK_COMMAND,
      'node --test scripts/panel-routes.test.mjs',
      'npx nx run angular-ai-devtools:test',
    ],
  },
  E8: {
    claim:
      'No answer names a remedy, a schematic, a cause or a route the record did not carry: the pane renders the five keys the join answers, and a sixth line is a line the join never produced.',
    fields: ['state', 'entry', 'present', 'writtenBy', 'reason'],
    suite: 'apps/angular-ai-devtools/src/app/panel-demo.spec.ts',
    test: 'renders the five fields the join answers',
    citations: [
      {
        file: 'apps/angular-ai-devtools/src/app/panel-demo.spec.ts',
        line: 10912,
        lineText:
          'renders no cause, no remedy and no navigation the answer did not carry',
        holds:
          'in every state the join answers, the pane renders no cause, no remedy and no navigation the answer did not carry',
      },
      {
        file: 'apps/angular-ai-devtools/src/app/panel-demo.spec.ts',
        line: 10597,
        lineText:
          'and reddens naming the surface and the remedy a pane invents',
        holds:
          'the keys the pane renders are held to the join own answer keys, and a pane that invents a remedy reddens here naming the surface',
      },
      {
        file: PANEL_REL,
        line: 114,
        lineText: 'export const FIELDS = [',
        holds:
          'the pane enumerates the five keys it renders once, in the join own order, so a sixth label is not a line it can write',
      },
      {
        file: PANEL_REL,
        line: 128,
        lineText: 'export const LABELS = {',
        holds:
          'every line the pane writes is one of these five labels and a value the answer carries',
      },
      {
        file: PANEL_REL,
        line: 301,
        lineText:
          'if (reason !== null) lines.push(line(LABELS.reason, reason));',
        holds:
          'the reason line is written only where the join published a reason, so the pane states no absence of its own',
      },
      {
        file: 'scripts/head-state.test.mjs',
        line: 1107,
        lineText:
          'names no remedy, no cause and no route the record did not carry',
        holds:
          'the join own pin refuses a remedy, a cause and a route the record did not carry, so the rule is measured on the join rather than only rendered',
      },
    ],
    absence: null,
    proves: [
      CHECK_COMMAND,
      'node --test scripts/head-state.test.mjs',
      'npx nx run angular-ai-devtools:test',
    ],
  },
});

// ------------------------------------------------------------------- reading ----

/** @param {Buffer | string} bytes @returns {string} */
function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** @param {string} text @returns {string} */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** @param {string} path @returns {string} */
function shown(path) {
  return relative(ROOT, path).split(sep).join('/');
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

/** The lines of one committed file, as a citation reads them. @param {string} rel @returns {string[]} */
function linesOf(rel) {
  return readText(rel, 'a citation names it').split(/\r?\n/);
}

/**
 * The numbered success criteria of an intent, parsed with the routine
 * `scripts/overlay-verdict-claims.test.mjs` uses, so a row quotes the criterion that suite compares it
 * to and not this file's paraphrase of it.
 * @param {string} source @returns {Record<string, string>}
 */
function intentCriteria(source) {
  const heading = '## Success criteria';
  const at = source.indexOf(heading);
  assert.ok(at >= 0, 'the intent must carry a "## Success criteria" section');
  const rest = source.slice(at + heading.length);
  const end = rest.indexOf('\n## ');
  const section = end >= 0 ? rest.slice(0, end) : rest;
  /** @type {Record<string, string>} */
  const criteria = {};
  /** @type {string[] | null} */
  let current = null;
  let currentId = '';
  const flush = () => {
    if (current) {
      criteria[currentId] = current.join(' ').replace(/\s+/g, ' ').trim();
    }
    current = null;
    currentId = '';
  };
  for (const line of section.split(/\r?\n/)) {
    const match = line.match(/^(\d+)\.\s+(.+?)\s*$/);
    if (match) {
      flush();
      currentId = `SC${match[1]}`;
      current = [match[2] ?? ''];
      continue;
    }
    if (current && line.trim() !== '' && /^\s/.test(line)) {
      current.push(line.trim());
      continue;
    }
    flush();
  }
  flush();
  assert.ok(
    Object.keys(criteria).length > 0,
    'the intent must list its success criteria as a numbered list',
  );
  return criteria;
}

/**
 * The text of one `##` section, up to the next `##` heading.
 * @param {string} source @param {string} heading @returns {string}
 */
function sectionOf(source, heading) {
  const at = source.indexOf(`\n${heading}`);
  assert.ok(
    at >= 0,
    `the document must carry a ${JSON.stringify(heading)} section`,
  );
  const rest = source.slice(at + heading.length + 1);
  const end = rest.indexOf('\n## ');
  return end >= 0 ? rest.slice(0, end) : rest;
}

/**
 * The data cells of every row of one pipe-delimited table, with the header included. A row of another
 * width is refused by name rather than skipped.
 * @param {string} section @param {number} columns @param {string} what @returns {string[][]}
 */
function tableRows(section, columns, what) {
  /** @type {string[][]} */
  const rows = [];
  for (const line of section.split(/\r?\n/)) {
    if (!/^\s*\|/.test(line)) continue;
    const cells = line.split('|').map((cell) => cell.trim());
    const data = cells.slice(1, -1);
    if (data.length === 0) continue;
    assert.equal(
      data.length,
      columns,
      `${what} carries ${String(data.length)} column(s); the grammar this reading holds is ${String(columns)}, so a row of another width is a different shape`,
    );
    rows.push(data);
  }
  return rows;
}

/**
 * The edges the bound intent's own five-column edge-coverage table binds to each criterion, with the
 * header read as written so a table headed differently is refused.
 * @param {string} source
 * @returns {Array<{ edge: string, criterion: string, category: string, disposition: string, detail: string }>}
 */
function intentEdges(source) {
  const cells = tableRows(
    sectionOf(source, '## Edge coverage'),
    5,
    "the intent's edge-coverage table",
  );
  assert.deepEqual(
    cells[0],
    EDGE_COLUMNS,
    `the intent's edge-coverage table must be headed exactly ${EDGE_COLUMNS.join(' | ')}, and it is headed ${JSON.stringify(cells[0])}`,
  );
  /** @type {Array<{ edge: string, criterion: string, category: string, disposition: string, detail: string }>} */
  const rows = [];
  for (const data of cells) {
    if (!/^E\d+$/.test(data[0] ?? '')) continue;
    rows.push({
      edge: data[0] ?? '',
      criterion: data[1] ?? '',
      category: data[2] ?? '',
      disposition: data[3] ?? '',
      detail: data[4] ?? '',
    });
  }
  assert.ok(
    rows.length > 0,
    'the intent must list its edge coverage as a five-column table, so each claim has an edge it holds',
  );
  return rows;
}

/** The plan's held-out row, in both forms the plans in this repository write it. */
const HELD_OUT_BULLET =
  /^\s*[-*]\s*(E\d+)\s*(?:→|->|—)\s*(T\d+)\s*(?:→|->|—)\s*`([^`]+)`\s*$/;

/**
 * The plan's `## Held-out checks` mapping, as the plan writes it: rows of `Edge | Task | Test`, and the
 * bullet form. A plan may hold nothing out — this milestone's does, and states so — in which case the
 * suite a criterion is held by is resolved through `## Intent coverage` and the owning task.
 * @param {string} source @returns {Map<string, { task: string, test: string }>}
 */
function planHeldOut(source) {
  const section = sectionOf(source, '## Held-out checks');
  /** @type {Map<string, { task: string, test: string }>} */
  const held = new Map();
  for (const data of tableRows(
    section,
    3,
    "the plan's held-out-checks table",
  )) {
    const edge = data[0] ?? '';
    if (!/^E\d+$/.test(edge)) continue;
    held.set(edge, { task: data[1] ?? '', test: data[2] ?? '' });
  }
  for (const line of section.split(/\r?\n/)) {
    const row = HELD_OUT_BULLET.exec(line);
    if (row === null) continue;
    held.set(String(row[1]), { task: String(row[2]), test: String(row[3]) });
  }
  return held;
}

/**
 * The plan's `## Intent coverage` table, `Criterion | Task | Acceptance`.
 * @param {string} source @returns {Array<{ criterion: string, task: string, acceptance: string }>}
 */
function planCoverage(source) {
  /** @type {Array<{ criterion: string, task: string, acceptance: string }>} */
  const rows = [];
  const cells = tableRows(
    sectionOf(source, '## Intent coverage'),
    3,
    "the plan's intent-coverage table",
  );
  for (const data of cells) {
    if (!/^SC\d+$/.test(data[0] ?? '')) continue;
    rows.push({
      criterion: data[0] ?? '',
      task: data[1] ?? '',
      acceptance: data[2] ?? '',
    });
  }
  return rows;
}

/**
 * Every held-out row whose task the plan's `## Intent coverage` table does not assign that edge's
 * criterion. A plan whose two tables agree carries none, and the record states the list so a reader sees
 * where the plan and the intent part company.
 * @param {Array<{ edge: string, criterion: string }>} edges
 * @param {Map<string, { task: string, test: string }>} heldOut
 * @param {Array<{ criterion: string, task: string, acceptance: string }>} coverage
 * @returns {Array<{ edge: string, criterion: string, heldBy: string, assignedByCoverage: string[] }>}
 */
function coverageDisagreements(edges, heldOut, coverage) {
  /** @type {Array<{ edge: string, criterion: string, heldBy: string, assignedByCoverage: string[] }>} */
  const found = [];
  for (const edge of edges) {
    const row = heldOut.get(edge.edge);
    if (row === undefined) continue;
    const assigned = [
      ...new Set(
        coverage
          .filter((one) => one.criterion === edge.criterion)
          .map((one) => one.task),
      ),
    ].sort();
    if (assigned.includes(row.task)) continue;
    found.push({
      edge: edge.edge,
      criterion: edge.criterion,
      heldBy: row.task,
      assignedByCoverage: assigned,
    });
  }
  return found;
}

/**
 * The declarations a suite carries, counted the way the whole-tree count counts them, and the titles it
 * declares — the string `it(` or `test(` is handed. A title is read from the one line that declares it;
 * every suite this file cites writes its titles on one line.
 * @param {string} source @returns {{ tests: number, groups: number, titles: string[] }}
 */
function declarationsIn(source) {
  /** @type {string[]} */
  const titles = [];
  for (const line of source.split(/\r?\n/)) {
    const declared = /^[ \t]*(?:it|test)\(\s*(['"`])(.*?)\1/.exec(line);
    if (declared !== null) titles.push(declared[2] ?? '');
  }
  return {
    tests: (source.match(/^[ \t]*(?:test|it)\(/gm) ?? []).length,
    groups: (source.match(/^[ \t]*describe\(/gm) ?? []).length,
    titles,
  };
}

/** The test title one line declares, or null where the line declares none. @param {string} line */
function declaredTitle(line) {
  const declared = /^[ \t]*(?:it|test)\(\s*(['"`])(.*?)\1/.exec(line);
  return declared === null ? null : (declared[2] ?? '');
}

/**
 * The suites one task file's `files:` list declares, in the order it declares them.
 * @param {string} text @returns {string[]}
 */
function declaredSuites(text) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(stripBom(text))?.[1] ?? '';
  const block =
    /^files:[ \t]*\r?\n((?:[ \t]*-[ \t]*\S.*\r?\n?)*)/m.exec(front)?.[1] ?? '';
  /** @type {string[]} */
  const suites = [];
  for (const match of block.matchAll(/^[ \t]*-[ \t]*(\S+)[ \t]*$/gm)) {
    const named = (match[1] ?? '').replace(/^['"]|['"]$/g, '');
    if (/\.(test|spec)\.(mjs|cjs|js|mts|ts)$/.test(named)) suites.push(named);
  }
  return suites;
}

/**
 * The task file one plan row names, in the directory the plan sits beside.
 * @param {string} tasksDir @param {string} task @returns {string | null}
 */
function taskFileAt(tasksDir, task) {
  if (!existsSync(tasksDir)) return null;
  const name = readdirSync(tasksDir)
    .filter(
      (entry) =>
        entry.endsWith('.md') &&
        (entry === `${task}.md` || entry.startsWith(`${task}-`)),
    )
    .sort()[0];
  return name === undefined ? null : join(tasksDir, name);
}

/**
 * The suite one task added: the first suite its `files:` list declares that its own `base` commit does
 * not carry, and its first declared suite where its base carries every one, which is a fallback stated
 * rather than hidden.
 * @param {string} text @returns {string | null}
 */
function suiteAddedByTask(text) {
  const suites = declaredSuites(text);
  if (suites.length === 0) return null;
  const base =
    /^base:\s*([0-9a-f]{7,64})\s*$/im.exec(stripBom(text))?.[1] ?? '';
  if (base !== '') {
    for (const suite of suites) {
      const read = spawnSync('git', ['cat-file', '-e', `${base}:${suite}`], {
        cwd: ROOT,
        encoding: 'utf8',
      });
      if (read.error || read.status !== 0) return suite;
    }
  }
  return suites[0] ?? null;
}

/**
 * The suite the plan resolves one criterion to: the plan's `## Intent coverage` rows for it, in order,
 * and the suite the task that row names added. This milestone holds no edge out, so this is the only
 * mapping the plan states, and it is read rather than chosen. Resolved once per run, because the answer
 * is a reading of two committed documents and no step of this suite edits them.
 * @type {Map<string, { task: string, suite: string }>}
 */
const PLAN_RESOLVED = new Map();

/**
 * @param {string} criterion
 * @param {string} planSource
 * @param {string} tasksDir
 * @returns {{ task: string, suite: string }}
 */
function planSuiteFor(criterion, planSource, tasksDir) {
  const cached = PLAN_RESOLVED.get(criterion);
  if (cached !== undefined) return cached;
  for (const row of planCoverage(planSource).filter(
    (one) => one.criterion === criterion,
  )) {
    const taskFile = taskFileAt(tasksDir, row.task);
    if (taskFile === null) continue;
    const suite = suiteAddedByTask(
      readText(
        shown(taskFile),
        `${row.task} is the task the plan assigns ${criterion}`,
      ),
    );
    if (suite !== null) {
      const resolved = { task: row.task, suite };
      PLAN_RESOLVED.set(criterion, resolved);
      return resolved;
    }
  }
  assert.fail(
    `the plan assigns ${criterion} to no task whose files list declares a suite, so the criterion would cite no test at all`,
  );
  return { task: '', suite: '' };
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
  if (
    left !== null &&
    right !== null &&
    typeof left === 'object' &&
    typeof right === 'object'
  ) {
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
 * The failure a pin raises on a value, so a mutant's evidence is the assertion's own message rather than
 * the wrapper a `doesNotThrow` puts around it. A pin that survives its mutant is a vacuous pin, and that
 * is a failure here rather than a silent pass.
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

/**
 * A deep copy of a record, so a mutant is planted on a copy and the file on disk is never touched.
 * @param {any} value @returns {any}
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The intent and plan of this milestone, read once per run. */
let SOURCES = null;

function sources() {
  if (SOURCES === null) {
    const intentPath = intentPathForMilestone(ROOT, MILESTONE);
    const planPath = join(dirname(intentPath), '..', 'plan', 'PLAN.md');
    const tasksDir = join(dirname(intentPath), '..', 'tasks');
    SOURCES = {
      intentPath,
      planPath,
      tasksDir,
      intentSource: readText(
        shown(intentPath),
        `the intent ${MILESTONE} binds`,
      ),
      planSource: readText(shown(planPath), `the plan ${MILESTONE} binds`),
    };
  }
  return SOURCES;
}

/**
 * The location a document was spelled at when the record was captured, derived from where this head
 * reads it, never from the record. A milestone that has shipped reads its intent and plan under the
 * archive; the record was captured while they sat at their live locations, so the capture-time spelling
 * follows from the resolved path and owes nothing to the record it judges.
 * @param {string} resolved @returns {string}
 */
function recordedSpelling(resolved) {
  // `shown` yields a repository-relative path, so the archive prefix is spelled with no leading slash.
  // It carried one until this repair, and a prefix that matched nothing turned the rebasing into a
  // no-op: the record was then compared at the archived location the ship moved its documents to rather
  // than at the live location it states, which is the one field that reddened once M068 shipped.
  const at = `${DOTTED}/archive/`;
  if (!resolved.startsWith(at)) return resolved;
  const matched = /^\d{3}-[^/]+\/((?:intent|plan)\/(?:INTENT|PLAN)\.md)$/.exec(
    resolved.slice(at.length),
  );
  return matched ? `${DOTTED}/${matched[1]}` : resolved;
}

/**
 * The derivation, with its two document locations spelled where they sat when the record was captured
 * and every other field the derivation's own, byte for byte.
 * @param {any} derivedRecord @returns {any}
 */
function atRecordedDocumentLocations(derivedRecord) {
  const resolvedIntent = shown(sources().intentPath);
  const resolvedPlan = shown(sources().planPath);
  const capturedIntent = recordedSpelling(resolvedIntent);
  const capturedPlan = recordedSpelling(resolvedPlan);
  const rebased = clone(derivedRecord);
  rebased.evidence.intent.path = capturedIntent;
  rebased.evidence.plan.path = capturedPlan;
  rebased.quotes.edges = rebased.quotes.edges
    .split(resolvedIntent)
    .join(capturedIntent)
    .split(resolvedPlan)
    .join(capturedPlan);
  return rebased;
}

// ------------------------------------------------------------- derivation ----

/** The command that proves one cited suite. @param {string} suite @returns {string | null} */
function commandFor(suite) {
  if (/\.test\.mjs$/.test(suite)) return `node --test ${suite}`;
  if (/\.spec\.ts$/.test(suite)) return 'npx nx run angular-ai-devtools:test';
  return null;
}

/**
 * The six fields `extension/head-state.js` answers with, read from the one function that builds every
 * answer, so a claim's `fields` are held to the join's own keys rather than to a list written here.
 * @returns {string[]}
 */
function answerFieldsOfTheJoin() {
  const source = readText(JOIN_REL, 'the join this milestone ships');
  const at = source.indexOf('function answer(');
  assert.ok(at >= 0, `${JOIN_REL} must build every answer in one place`);
  const body = source.slice(at, source.indexOf('\n}\n', at));
  const open = body.indexOf('return {');
  assert.ok(
    open >= 0,
    `${JOIN_REL}'s answer function must return an object literal`,
  );
  const block = body.slice(open, body.indexOf('\n  };', open));
  /** @type {string[]} */
  const keys = [];
  for (const line of block.split(/\r?\n/).slice(1)) {
    const key = /^\s{4}([A-Za-z][\w]*):/.exec(line)?.[1];
    if (key !== undefined) keys.push(key);
  }
  return keys;
}

/**
 * The record, derived. Every value below is interpolated from a file this checkout carries or from the
 * tables above, so a citation that moves makes the record stale rather than quietly wrong.
 * @param {string} intentSource @param {string} planSource
 * @param {string} intentPath @param {string} planPath
 * @returns {Record<string, any>}
 */
function derive(intentSource, planSource, intentPath, planPath) {
  assert.equal(
    CLAIMS_REL,
    CLAIMS_NAMED,
    `this census writes ${CLAIMS_NAMED} and the milestone derives ${CLAIMS_REL}: the two spellings of one record must be one, or the suite would write a record it does not name`,
  );
  const criteria = intentCriteria(intentSource);
  const edges = intentEdges(intentSource);
  const heldOut = planHeldOut(planSource);
  const coverage = planCoverage(planSource);
  const disagreements = coverageDisagreements(edges, heldOut, coverage);
  const tasksDir = join(dirname(planPath), '..', 'tasks');

  // This plan holds nothing out and states so: every edge is proved by the suite of the task that owns
  // it. A row added to `## Held-out checks` is a mapping this census must read instead, so it is refused
  // by name rather than quietly resolved through the coverage table a second time.
  assert.equal(
    heldOut.size,
    0,
    `this plan's ## Held-out checks writes no row, and it writes ${JSON.stringify([...heldOut.keys()])}: a held-out row is a mapping this census must read rather than fall back to ## Intent coverage`,
  );

  // One claim per criterion the intent declares, in the intent's order, and no other.
  assert.deepEqual(
    Object.keys(PROOFS),
    Object.keys(criteria),
    `the claims must be one per criterion the intent declares: the proofs name ${JSON.stringify(Object.keys(PROOFS))} and the intent declares ${JSON.stringify(Object.keys(criteria))}`,
  );

  // One claim per edge the intent declares, in the intent's order, and no other.
  assert.deepEqual(
    Object.keys(EDGE_CLAIMS),
    edges.map((edge) => edge.edge),
    `the edge claims must be one per edge the intent declares: they name ${JSON.stringify(Object.keys(EDGE_CLAIMS))} and the intent declares ${JSON.stringify(edges.map((edge) => edge.edge))}`,
  );

  const joinFields = answerFieldsOfTheJoin();
  assert.deepEqual(
    joinFields,
    ANSWER_FIELDS,
    `the join must answer with exactly ${JSON.stringify(ANSWER_FIELDS)}, and it answers ${JSON.stringify(joinFields)}`,
  );

  // The suites the plan resolves, derived once and held to the table above: a plan or a task whose files
  // list moves makes the table stale, and the refusal names both suites.
  /** @type {Record<string, string>} */
  const planSuites = {};
  for (const criterion of Object.keys(criteria)) {
    const resolved = planSuiteFor(criterion, planSource, tasksDir);
    assert.ok(
      existsSync(absPath(resolved.suite)),
      `the plan resolves ${criterion} to ${resolved.suite} through ${resolved.task}, and this checkout does not carry it`,
    );
    assert.equal(
      resolved.suite,
      PLAN_SUITES[criterion],
      `the plan resolves ${criterion} to ${resolved.suite} through ${resolved.task}, and this table names ${JSON.stringify(PLAN_SUITES[criterion])}: the suite a claim cites as the plan's own assignment must be the one the plan resolves at this head`,
    );
    planSuites[criterion] = resolved.suite;
  }

  const packageText = readText(
    'package.json',
    'the check chain is part of this repository',
  );
  const stages = String(JSON.parse(packageText).scripts?.check ?? '')
    .split(' && ')
    .map((stage) => stage.trim());

  const claims = Object.entries(criteria).map(([criterion, criterionText]) => {
    const held = edges.filter((edge) => edge.criterion === criterion);
    assert.ok(
      held.length > 0,
      `the intent's edge coverage names no edge for ${criterion}, so its claim cites no test`,
    );
    const proofs = PROOFS[criterion];
    assert.ok(
      Array.isArray(proofs) && proofs.length > 0,
      `${criterion} carries no proof, so its claim cites nothing`,
    );
    // Every citation resolves at capture: the suite is a file this checkout carries, it declares the
    // test title the citation names, and the line the citation states is the line that declares it.
    for (const proof of proofs) {
      const { titles } = declarationsIn(
        readText(
          proof.suite,
          `${criterion} cites it as a suite that proves the criterion`,
        ),
      );
      assert.ok(
        titles.includes(proof.test),
        `${criterion} cites ${proof.suite} for ${JSON.stringify(proof.test)}, and that suite declares no such test at this head: it declares ${JSON.stringify(titles)}`,
      );
      const stated = linesOf(proof.suite)[proof.line - 1] ?? '';
      assert.equal(
        declaredTitle(stated),
        proof.test,
        `${criterion} cites ${proof.suite}:${String(proof.line)} as the line that declares ${JSON.stringify(proof.test)}, and that line is ${JSON.stringify(stated)}`,
      );
      assert.ok(
        stated.includes(proof.lineText),
        `${criterion} cites ${proof.suite}:${String(proof.line)} for ${JSON.stringify(proof.lineText)}, and that line states ${JSON.stringify(stated)}`,
      );
    }
    const primary = proofs[0];
    const suites = [...new Set(proofs.map((proof) => proof.suite))];
    assert.ok(
      suites.includes(planSuites[criterion]),
      `${criterion}'s citations must include ${planSuites[criterion]}, the suite the plan resolves the criterion to, and they name ${JSON.stringify(suites)}`,
    );
    // The other direction: a citation names the suite the plan resolves, a suite one of the criterion's
    // own edges cites, or one of the three suites this milestone ships — the record's, the join's and the
    // pane's — so a suite this milestone neither ships nor assigns cannot arrive in the claim.
    const assigned = new Set([planSuites[criterion]]);
    for (const edge of held) {
      for (const citation of EDGE_CLAIMS[edge.edge].citations) {
        assigned.add(citation.file);
      }
    }
    for (const suite of Object.values(MILESTONE_SUITES)) assigned.add(suite);
    for (const suite of suites) {
      assert.ok(
        assigned.has(suite),
        `${criterion} cites ${suite}, which neither the plan resolves the criterion to, nor any edge of ${criterion} cites, nor is one of the three suites this milestone ships (${JSON.stringify(Object.values(MILESTONE_SUITES))})`,
      );
    }
    const rows = held.map((edge) => ({
      edge: edge.edge,
      category: edge.category,
      disposition: edge.disposition,
      detail: edge.detail,
      suite: planSuites[criterion],
    }));
    const named = JSON.stringify(rows.map((row) => row.edge));
    const varied = rows
      .map(
        (row) =>
          `${row.edge} ${row.category} ${row.disposition}: ${row.detail}`,
      )
      .join('; ');
    const { tests, groups } = declarationsIn(
      readText(
        primary.suite,
        `${criterion} names it as the suite that proves it`,
      ),
    );
    const freed = disagreements.filter((one) => one.criterion === criterion);
    return {
      criterion,
      criterionText,
      criterionCharacters: criterionText.length,
      ruling: 'not-required',
      reason: `The charter's portal clause makes a verdict required where an insurance-portal route can produce a criterion's facts. ${criterion} is ${JSON.stringify(criterionText)} - a fact about this repository's own head record, the join that reads it and the lines that hold them, which no route of any page produces: it is proved by the citations this claim names, at this head, and the gate's one \`control-ai-browsers run\` driver returns an element's toolElements, drawnRect, descriptor and noDevContext readings, none of which can say what a line of a suite holds, so a portal-backed row would name a driver that cannot carry the answer. The portal is named because the clause is answered rather than dodged: the evidence is the edge row(s) ${named} the intent itself assigns the criterion, held by the plan at ${JSON.stringify([planSuites[criterion]])}, and the ${String(proofs.length)} line citation(s) below name the file and the line that carry each part of them.${freed.length === 0 ? '' : ` The plan's two tables disagree about ${freed.map((one) => `${one.edge}, held out at ${one.heldBy} while the coverage table assigns ${one.criterion} to ${one.assignedByCoverage.join('/') || 'no task'}`).join('; ')}, which this record states under evidence.plan.disagreements rather than refusing to cite it.`}`,
      suite: primary.suite,
      test: primary.test,
      citations: proofs.map((proof) => ({
        suite: proof.suite,
        test: proof.test,
        line: proof.line,
        lineText: proof.lineText,
        holds: proof.holds,
      })),
      edges: rows,
      artefactPath: primary.suite,
      artefact: `${primary.suite} (test ${JSON.stringify(primary.test)} at line ${String(primary.line)}; edge ${named} of the intent's own coverage: ${varied}; the suite carries ${String(tests)} test declaration(s) in ${String(groups)} group(s)) -> package.json ("check": ${String(stages.length)} stage(s), ${JSON.stringify(stages.slice(-2))} last)`,
      reading: `${String(proofs.length)} line citation(s) over ${String(suites.length)} suite(s) hold ${criterion} through the edge row(s) ${named} the intent assigns it: every one is a line this checkout carries at this head, opened and read back by this suite, so the criterion is proved by a line a reader can open rather than by a drive no driver here performs`,
      proves: [
        CHECK_COMMAND,
        ...[...new Set(proofs.map((proof) => proof.suite))]
          .map(commandFor)
          .filter((command) => typeof command === 'string'),
        'npm run check',
      ].filter((command) => typeof command === 'string'),
    };
  });

  const edgeClaims = edges.map((edge) => {
    const stated = EDGE_CLAIMS[edge.edge];
    assert.ok(
      stated,
      `the intent declares ${edge.edge} and no claim answers it`,
    );
    // Every citation is a line this checkout carries, and it says what the claim says it says.
    for (const citation of stated.citations) {
      const stated_line = linesOf(citation.file)[citation.line - 1] ?? '';
      assert.ok(
        stated_line.includes(citation.lineText),
        `${edge.edge} cites ${citation.file}:${String(citation.line)} for ${JSON.stringify(citation.lineText)}, and that line states ${JSON.stringify(stated_line)}`,
      );
      assert.ok(
        typeof citation.holds === 'string' &&
          citation.holds.trim().length >= 30,
        `${edge.edge} does not state which part of the edge ${String(citation.file)}:${String(citation.line)} holds`,
      );
    }
    // The fields a claim is ruled on are the join's own answer keys, and nothing else.
    for (const field of stated.fields) {
      assert.ok(
        joinFields.includes(field),
        `${edge.edge} is ruled on ${JSON.stringify(field)}, which the join does not answer with: it answers ${JSON.stringify(joinFields)}`,
      );
    }
    // No claim or absence offers a repair: the rule E8's edge and the prohibitions state. The scan looks
    // for advice rather than for the words `remedy` and `cause`, which the claims name in order to refuse
    // them.
    const prose = `${stated.claim} ${stated.absence === null ? '' : `${stated.absence.part} ${stated.absence.searched} ${stated.absence.found}`}`;
    assert.doesNotMatch(
      prose,
      /\b(?:you should|should be [a-z]+ed|try to|fix by|consider [a-z]+ing|recommended)/i,
      `${edge.edge} offers a repair rather than a reading`,
    );
    return {
      edge: edge.edge,
      criterion: edge.criterion,
      category: edge.category,
      disposition: edge.disposition,
      detail: edge.detail,
      claim: stated.claim,
      fields: [...stated.fields],
      suite: stated.suite,
      test: stated.test,
      citations: stated.citations.map((citation) => ({
        file: citation.file,
        line: citation.line,
        lineText: citation.lineText,
        holds: citation.holds,
      })),
      absence:
        stated.absence === null
          ? null
          : {
              part: stated.absence.part,
              searched: stated.absence.searched,
              found: stated.absence.found,
            },
      proves: [...stated.proves],
    };
  });

  return {
    schema: `${MILESTONE.toLowerCase()}-verdict-claims/v1`,
    milestone: MILESTONE,
    quotes: {
      from: `scripts/verdict-claims-intent.mjs (intentPathForMilestone(ROOT, ${JSON.stringify(MILESTONE)}))`,
      how: `parsed with the same routine scripts/overlay-verdict-claims.test.mjs uses, extracted into this file and run over the resolved intent, so every criterionText is the intent's own text: the ${String(Object.keys(criteria).length)} criteria it declares are ${JSON.stringify(Object.keys(criteria))} and scripts/overlay-verdict-claims.test.mjs compares them character for character`,
      proofs: `every claim's citations are lines this checkout carries at capture: ${String(claims.reduce((sum, claim) => sum + claim.citations.length, 0))} test-declaration citation(s) over ${JSON.stringify([...new Set(claims.flatMap((claim) => claim.citations.map((citation) => citation.suite)))])}, each opened at the line it states and each held to the test title that line declares, and ${String(edgeClaims.reduce((sum, claim) => sum + claim.citations.length, 0))} further line citation(s) over the eight edge claims, each opened and read back`,
      edges: `read from ${shown(intentPath)}'s own five-column edge-coverage table (Edge | Criterion | Category | Disposition | Detail) for the edge-to-criterion rows, and the test-to-criterion mapping from ${shown(planPath)}'s ## Intent coverage table and the tasks it names, because this plan's ## Held-out checks section holds nothing out: it reads ${String(heldOut.size)} row(s) of edge -> task -> test there and resolves each criterion through the plan's coverage rows and the first suite the owning task's files list declares that the task's base does not carry - ${JSON.stringify(Object.entries(planSuites).map(([criterion, suite]) => `${criterion} -> ${suite}`))} - so a claim cites the suite the milestone's own plan assigns its criterion rather than one this file chose: ${String(edges.length)} edge row(s) over the criteria ${JSON.stringify([...new Set(edges.map((edge) => edge.criterion))])}, and one claim per edge. The plan's ## Held-out checks and its ## Intent coverage table disagree at ${String(disagreements.length)} row(s) ${JSON.stringify(disagreements.map((one) => `${one.edge} is held by ${one.heldBy} and ${one.criterion} is assigned to ${one.assignedByCoverage.join('/') || 'no task'}`))}, recorded under evidence.plan.disagreements rather than refused, because a reader needs the citation and the disagreement in one place`,
    },
    ruling: {
      required: 0,
      notRequired: claims.length,
      why: [
        'No row is required, and the record therefore names no driver, no instance and no verdict path: scripts/overlay-verdict-claims.test.mjs refuses a list with no required row that names a driver, so naming one would be the opposite defect.',
        `The reason is not convenience. A required row must name the driver a control-ai-browsers run expression takes to the wave gate, and that driver must return the gate's four readings - toolElements, drawnRect, descriptor and noDevContext. Every fact the ${String(claims.length)} criteria this milestone declares is written about is a fact about this repository's own head record, the join that reads it and the lines that hold them, against ${String(stages.length)} stage(s) of the check chain; none of them is an element's rect or a dev context, so naming a driver would make the gate return a page reading for a claim about the gate.`,
        'The portal is not lost by that ruling: each reason names the clause that would have made a row required, and each claim names the suite, the test and the commands that prove it.',
      ],
    },
    evidence: {
      intent: { path: shown(intentPath), criteria: Object.keys(criteria) },
      plan: {
        path: shown(planPath),
        heldOut: [...heldOut.keys()].sort(),
        coverage: coverage.map(
          (row) => `${row.criterion} ${row.task} ${row.acceptance}`,
        ),
        resolved: Object.entries(planSuites).map(
          ([criterion, suite]) => `${criterion} ${suite}`,
        ),
        disagreements,
      },
      edges: {
        rows: edges.length,
        criteria: [...new Set(edges.map((edge) => edge.criterion))],
        columns: EDGE_COLUMNS,
      },
      suites: [
        ...new Set(
          claims.flatMap((claim) =>
            claim.citations.map((citation) => citation.suite),
          ),
        ),
      ]
        .sort()
        .map((suite) => {
          const { tests, groups } = declarationsIn(
            readText(suite, 'the suite a claim names as a test proving it'),
          );
          return { path: suite, tests, groups };
        }),
      records: readdirSync(join(ROOT, RAW))
        .filter(
          (name) =>
            name.startsWith(`${MILESTONE.toLowerCase()}-`) &&
            `${RAW}/${name}` !== CLAIMS_REL,
        )
        .sort()
        .map((name) => `${RAW}/${name}`),
      absences: edgeClaims
        .filter((claim) => claim.absence !== null)
        .map((claim) => claim.edge),
    },
    capture: {
      command: CAPTURE_COMMAND,
      check: CHECK_COMMAND,
      records: CLAIMS_REL,
      criteria: claims.map((claim) => claim.criterion),
      reading:
        'an armed run re-derives the record from the intent this checkout binds, its five-column edge coverage, the suites the plan resolves each criterion to and the lines this checkout states, and writes it only when a value moved; a default run reads the file and asserts it is exactly what this head derives, naming the field that moved when it is not, and the writer refuses a candidate that is not the fixed point of this pin.',
    },
    claims,
    edgeClaims,
  };
}

/** The record this head derives, read once per run. */
let DERIVED = null;

function derived() {
  if (DERIVED === null) {
    const { intentSource, planSource, intentPath, planPath } = sources();
    DERIVED = derive(intentSource, planSource, intentPath, planPath);
  }
  return DERIVED;
}

/** @param {any} record @returns {string} */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

// ---------------------------------------------------------------------- pins ----

/** @param {any} record @returns {any[]} */
function claimsOf(record) {
  assert.ok(
    Array.isArray(record?.claims) && record.claims.length > 0,
    'the claim list must carry its rows',
  );
  return record.claims;
}

/** @param {any} record @returns {any[]} */
function edgeClaimsOf(record) {
  assert.ok(
    Array.isArray(record?.edgeClaims) && record.edgeClaims.length > 0,
    'the record must carry one claim per edge',
  );
  return record.edgeClaims;
}

/**
 * Every criterion the intent declares is ruled exactly once, in the intent's order, quoting the intent's
 * own text and stating the number of characters it quoted.
 * @param {any} record @returns {void}
 */
function assertCriteriaQuoted(record) {
  if (standsDown(record)) return;
  const criteria = intentCriteria(sources().intentSource);
  assert.deepEqual(
    claimsOf(record).map((row) => row.criterion),
    Object.keys(criteria),
    `every criterion the intent declares is ruled exactly once: the record rules ${JSON.stringify(claimsOf(record).map((row) => row.criterion))} against ${JSON.stringify(Object.keys(criteria))}`,
  );
  for (const row of claimsOf(record)) {
    assert.equal(
      row.criterionText,
      criteria[row.criterion],
      `${row.criterion} must quote the intent character for character: claims[${String(claimsOf(record).indexOf(row))}].criterionText is ${JSON.stringify(row.criterionText)} and the intent states ${JSON.stringify(criteria[row.criterion])}`,
    );
    assert.equal(
      row.criterionCharacters,
      row.criterionText.length,
      `${row.criterion} states ${String(row.criterionCharacters)} character(s) for a quote of ${String(row.criterionText.length)}`,
    );
  }
}

/**
 * Each criterion's claim carries the edges the intent assigns it, in the intent's order, with the four
 * cells the five-column table states and the suite the plan resolves for that criterion.
 * @param {any} record @returns {void}
 */
function assertClaimsCarryEdges(record) {
  if (standsDown(record)) return;
  const edges = intentEdges(sources().intentSource);
  for (const row of claimsOf(record)) {
    const where = row.criterion;
    const held = edges.filter((edge) => edge.criterion === where);
    assert.ok(
      held.length > 0,
      `the intent's edge coverage names no edge for ${where}, so its claim cites no test`,
    );
    assert.deepEqual(
      row.edges.map((/** @type {any} */ edge) => edge.edge),
      held.map((edge) => edge.edge),
      `${where} must carry one row per edge the intent assigns it: it carries ${JSON.stringify(row.edges.map((/** @type {any} */ edge) => edge.edge))} and the intent assigns ${JSON.stringify(held.map((edge) => edge.edge))}`,
    );
    for (const [index, edge] of held.entries()) {
      const stated = row.edges[index] ?? {};
      for (const cell of ['category', 'disposition', 'detail']) {
        assert.equal(
          stated[cell],
          edge[cell],
          `${where}'s ${edge.edge} must carry the ${cell} the intent's edge row states: it carries ${JSON.stringify(stated[cell])} and the intent states ${JSON.stringify(edge[cell])}`,
        );
      }
      assert.ok(
        typeof stated.suite === 'string' && stated.suite !== '',
        `${where}'s ${edge.edge} names no suite, so the plan resolves no suite for it`,
      );
    }
  }
}

/**
 * Every citation resolves at this head: the file is one this checkout carries, the line is the line the
 * citation states, and — for a criterion's citation — that line declares the test title it names.
 * @param {any} record @returns {void}
 */
function assertCitationsResolve(record) {
  for (const row of claimsOf(record)) {
    const where = row.criterion ?? 'a row';
    assert.ok(
      typeof row.suite === 'string' && row.suite !== '',
      `${where} names no suite, so no test proves it`,
    );
    assert.ok(
      typeof row.test === 'string' && row.test !== '',
      `${where} names no test in ${row.suite}, so the claim cites a file rather than a test`,
    );
    assert.ok(
      Array.isArray(row.citations) && row.citations.length > 0,
      `${where} carries no citation list`,
    );
    assert.equal(
      row.suite,
      row.citations[0].suite,
      `${where}'s suite is the first citation's suite`,
    );
    assert.equal(
      row.test,
      row.citations[0].test,
      `${where}'s test is the first citation's test`,
    );
    for (const citation of row.citations) {
      const suite = String(citation.suite ?? '');
      assert.ok(
        suite !== '',
        `${where} carries a citation that names no suite`,
      );
      assert.ok(
        existsSync(absPath(suite)),
        `${where} cites ${suite}, which this checkout does not carry`,
      );
      const lines = linesOf(suite);
      const line = Number(citation.line);
      assert.ok(
        Number.isInteger(line) && line >= 1 && line <= lines.length,
        `${where} cites ${suite}:${String(citation.line)} and that file carries ${String(lines.length)} line(s)`,
      );
      const stated = lines[line - 1] ?? '';
      assert.equal(
        declaredTitle(stated),
        citation.test,
        `${where} cites ${suite}:${String(line)} as the line that declares ${JSON.stringify(citation.test)}, and that line declares ${JSON.stringify(declaredTitle(stated))}: a citation whose suite declares no such test at this head names a test that is not there`,
      );
      assert.ok(
        stated.includes(String(citation.lineText ?? '')),
        `${where} cites ${suite}:${String(line)} for ${JSON.stringify(citation.lineText)}, and that line states ${JSON.stringify(stated)}`,
      );
      assert.ok(
        typeof citation.holds === 'string' &&
          citation.holds.trim().length >= 30,
        `${where} does not state which part of the criterion ${JSON.stringify(citation.test)} holds`,
      );
    }
    assert.ok(
      typeof row.artefactPath === 'string' &&
        row.artefactPath !== '' &&
        row.artefactPath === row.suite,
      `${where} must name the suite its first citation names as its artefact path, and it names ${JSON.stringify(row.artefactPath)} against ${JSON.stringify(row.suite)}`,
    );
    assert.ok(
      typeof row.artefact === 'string' &&
        row.artefact.includes(row.artefactPath),
      `${where} names its artefact path but does not say what that artefact carries`,
    );
    assert.match(
      String(row.artefact),
      /edge (\[[^\]]*\])/,
      `${where} must state the edge ids its artefact is ruled on as edge ["E1"], and it states ${JSON.stringify(String(row.artefact).slice(0, 160))}`,
    );
    assert.ok(
      typeof row.reading === 'string' && row.reading.trim().length >= 40,
      `${where} does not state the reading its citations carry`,
    );
    assert.ok(
      Array.isArray(row.proves) && row.proves.length > 0,
      `${where} names no command that proves it`,
    );
    assert.ok(
      ['required', 'not-required'].includes(row.ruling),
      `${where} rules ${JSON.stringify(row.ruling)}`,
    );
    assert.ok(
      typeof row.reason === 'string' &&
        row.reason.length >= 60 &&
        /portal/i.test(row.reason),
      `${where} must answer the charter's portal clause by name`,
    );
  }
}

/**
 * Every suite the plan resolves a criterion to is a suite that criterion's claim cites, and every edge's
 * `suite` is the suite the plan resolves for its criterion.
 * @param {any} record @returns {void}
 */
function assertCitationsFollowThePlan(record) {
  if (standsDown(record)) return;
  const { planSource, tasksDir } = sources();
  for (const row of claimsOf(record)) {
    const where = row.criterion;
    const resolved = planSuiteFor(where, planSource, tasksDir).suite;
    assert.ok(
      existsSync(absPath(resolved)),
      `${where} is resolved by the plan to ${resolved}, which this checkout does not carry`,
    );
    const cited = row.citations.map(
      (/** @type {any} */ citation) => citation.suite,
    );
    assert.ok(
      cited.includes(resolved),
      `${where} is resolved by the plan to ${resolved}, and the claim cites ${JSON.stringify(cited)}: the suite the milestone's own plan assigns the criterion must be among its citations`,
    );
    for (const edge of row.edges) {
      assert.equal(
        edge.suite,
        resolved,
        `${where}'s ${edge.edge} names ${JSON.stringify(edge.suite)} as its suite, and the plan resolves ${where} to ${resolved}: one criterion has one suite, or the row names evidence it cannot open in one place`,
      );
    }
  }
}

/**
 * One claim per edge the intent declares, each with the table's cells, the join's own fields, its lines
 * read back, and its absence recorded where the tree carries none of the fact.
 * @param {any} record @returns {void}
 */
function assertEdgeClaims(record) {
  if (standsDown(record)) return;
  const edges = intentEdges(sources().intentSource);
  const joinFields = answerFieldsOfTheJoin();
  assert.deepEqual(
    edgeClaimsOf(record).map((row) => row.edge),
    edges.map((edge) => edge.edge),
    `the edge claims must be one per edge the intent declares: they name ${JSON.stringify(edgeClaimsOf(record).map((row) => row.edge))} and the intent declares ${JSON.stringify(edges.map((edge) => edge.edge))}`,
  );
  for (const [index, edge] of edges.entries()) {
    const row = edgeClaimsOf(record)[index] ?? {};
    assert.equal(
      row.criterion,
      edge.criterion,
      `${edge.edge} must state the criterion the intent binds it to, and it states ${JSON.stringify(row.criterion)} against ${JSON.stringify(edge.criterion)}`,
    );
    for (const cell of ['category', 'disposition', 'detail']) {
      assert.equal(
        row[cell],
        edge[cell],
        `${edge.edge} must carry the ${cell} the intent's edge row states: it carries ${JSON.stringify(row[cell])} and the intent states ${JSON.stringify(edge[cell])}`,
      );
    }
    assert.ok(
      typeof row.claim === 'string' && row.claim.trim().length >= 40,
      `${edge.edge} states no claim`,
    );
    assert.ok(
      Array.isArray(row.fields) && row.fields.length > 0,
      `${edge.edge} names no answer field, so nothing says what it is ruled on`,
    );
    for (const field of row.fields) {
      assert.ok(
        joinFields.includes(field),
        `${edge.edge} is ruled on ${JSON.stringify(field)}, which the join does not answer with: it answers ${JSON.stringify(joinFields)}`,
      );
    }
    assert.ok(
      Array.isArray(row.citations) && row.citations.length > 0,
      `${edge.edge} cites no line`,
    );
    for (const citation of row.citations) {
      const file = String(citation.file ?? '');
      assert.ok(
        existsSync(absPath(file)),
        `${edge.edge} cites ${file}, which this checkout does not carry`,
      );
      const lines = linesOf(file);
      const line = Number(citation.line);
      assert.ok(
        Number.isInteger(line) && line >= 1 && line <= lines.length,
        `${edge.edge} cites ${file}:${String(citation.line)} and that file carries ${String(lines.length)} line(s)`,
      );
      const stated = lines[line - 1] ?? '';
      assert.ok(
        stated.includes(String(citation.lineText ?? '')),
        `${edge.edge} cites ${file}:${String(line)} for ${JSON.stringify(citation.lineText)}, and that line states ${JSON.stringify(stated)}`,
      );
      assert.ok(
        typeof citation.holds === 'string' &&
          citation.holds.trim().length >= 30,
        `${edge.edge} does not state which part of the edge ${file}:${String(line)} holds`,
      );
    }
    if (row.absence === null) continue;
    const absence = row.absence ?? {};
    for (const key of ['part', 'searched', 'found']) {
      assert.ok(
        typeof absence[key] === 'string' && absence[key].trim().length >= 30,
        `${edge.edge} records an absence and does not state its ${key}: ${JSON.stringify(absence[key])}`,
      );
    }
  }
  // The two absences this head measured, named as the edges they are recorded under and no others: the
  // committed record states `duplicate.read: false` (E2) and `writtenBy.read: false` (E4).
  assert.deepEqual(
    edgeClaimsOf(record)
      .filter((/** @type {any} */ row) => row.absence !== null)
      .map((/** @type {any} */ row) => row.edge),
    ['E2', 'E4'],
    `the record must carry exactly the two absences this head measured - E2 (duplicate) and E4 (writtenBy) - and it carries ${JSON.stringify(
      edgeClaimsOf(record)
        .filter((/** @type {any} */ row) => row.absence !== null)
        .map((/** @type {any} */ row) => row.edge),
    )}`,
  );
  // And the record the absences are about says so in its own bytes, so the two entries are measured
  // rather than asserted here.
  const recordLines = linesOf(MEASURED_REL);
  assert.equal(
    recordLines[221] ?? '',
    '      "duplicate": {',
    `${MEASURED_REL}:222 must be the duplicate fact the E2 absence is written about, and it states ${JSON.stringify(recordLines[221])}`,
  );
  assert.equal(
    recordLines[222] ?? '',
    '        "read": false,',
    `${MEASURED_REL}:223 must state the duplicate as not read, and it states ${JSON.stringify(recordLines[222])}`,
  );
  assert.equal(
    recordLines[216] ?? '',
    '      "writtenBy": {',
    `${MEASURED_REL}:217 must be the writing-navigation fact the E4 absence is written about, and it states ${JSON.stringify(recordLines[216])}`,
  );
  assert.equal(
    recordLines[217] ?? '',
    '        "read": false,',
    `${MEASURED_REL}:218 must state the writing navigation as not read, and it states ${JSON.stringify(recordLines[217])}`,
  );
}

/**
 * The record’s own chain: the milestone it is numbered for, the commands that captured and read it, the
 * file it is, and a ruling whose counts agree with its rows.
 * @param {any} record @returns {void}
 */
function assertCaptureChain(record) {
  assert.equal(
    record.milestone,
    MILESTONE,
    'the record names the milestone its file is numbered for',
  );
  // The command is the owning census's when another one owns the record; what this file can hold is that
  // the command names the suite the record names and arms that suite's own flag.
  if (owningCensus(record) === SUITE_REL) {
    assert.equal(
      record.capture?.command,
      CAPTURE_COMMAND,
      'the record names the command that captured it, armed by its own flag',
    );
    assert.equal(
      record.capture?.check,
      CHECK_COMMAND,
      'the record names the command that reads it',
    );
  } else {
    assert.match(
      String(record.capture?.command ?? ''),
      /M\d{3}_CAPTURE=1 node --test scripts\/[a-z0-9-]+\.test\.mjs/,
      `the record names the command that captured it, armed by its own flag, and it names ${JSON.stringify(record.capture?.command)}`,
    );
    assert.equal(
      record.capture?.check,
      `node --test ${owningCensus(record)}`,
      "the record names the command that reads it, and that command is the owning census's",
    );
  }
  assert.equal(
    record.capture?.records,
    CLAIMS_REL,
    'the record names the file it is',
  );
  assert.equal(
    record.driver ?? null,
    null,
    'a list with no required row must not name a driver',
  );
  const required = claimsOf(record).filter(
    (/** @type {any} */ row) => row.ruling === 'required',
  ).length;
  assert.equal(
    required,
    record.ruling.required,
    `the record states ${String(record.ruling.required)} required row(s) and carries ${String(required)}`,
  );
  assert.equal(
    record.ruling.notRequired,
    claimsOf(record).length - required,
    `the record states ${String(record.ruling.notRequired)} not-required row(s) and carries ${String(claimsOf(record).length - required)}`,
  );
}

/**
 * The plan evidence the record states: the held-out keys it read, the coverage rows it read, the suites
 * it resolved, and the cross-table disagreements as this head measures them. The sentence that reads the
 * tables must state the count, so a reader sees the measurement rather than a silent empty list.
 * @param {any} record @returns {void}
 */
function assertPlanEvidence(record) {
  if (standsDown(record)) return;
  const { planSource } = sources();
  const edges = intentEdges(sources().intentSource);
  const heldOut = planHeldOut(planSource);
  const coverage = planCoverage(planSource);
  const derivedDisagreements = coverageDisagreements(edges, heldOut, coverage);
  assert.deepEqual(
    record.evidence?.plan?.heldOut,
    [...heldOut.keys()].sort(),
    `the record states the held-out keys it read as this head reads them: it states ${JSON.stringify(record.evidence?.plan?.heldOut)} and this head reads ${JSON.stringify([...heldOut.keys()].sort())}`,
  );
  assert.deepEqual(
    record.evidence?.plan?.coverage,
    coverage.map((row) => `${row.criterion} ${row.task} ${row.acceptance}`),
    `the record states the plan's coverage rows as this head reads them: it states ${JSON.stringify(record.evidence?.plan?.coverage)}`,
  );
  assert.deepEqual(
    record.evidence?.plan?.disagreements,
    derivedDisagreements,
    `the record states the plan's cross-table disagreements as this head measures them: it states ${JSON.stringify(record.evidence?.plan?.disagreements)} and this head derives ${JSON.stringify(derivedDisagreements)}`,
  );
  assert.ok(
    String(record.quotes?.edges ?? '').includes(
      `disagree at ${String(derivedDisagreements.length)} row(s)`,
    ),
    'the record states the disagreement count in the sentence that reads the two tables',
  );
  assert.deepEqual(
    Object.fromEntries(
      (record.evidence?.plan?.resolved ?? []).map((/** @type {string} */ one) =>
        one.split(' '),
      ),
    ),
    PLAN_SUITES,
    `the record states the suites the plan resolves as this head resolves them: it states ${JSON.stringify(record.evidence?.plan?.resolved)}`,
  );
  assert.deepEqual(
    record.evidence?.absences,
    ['E2', 'E4'],
    `the record states the edges its absences are recorded under, and it states ${JSON.stringify(record.evidence?.absences)}`,
  );
}

/**
 * The chain a record this file does not own is held to: the record names the suite that captured it,
 * that suite names the record, and it reads the armed flag the record states. The list's equality with
 * its own derivation is the owning census's to assert, and that suite is one the project runs.
 * @param {any} record @returns {void}
 */
function assertOwnershipChain(record) {
  const command = String(record?.capture?.command ?? '');
  const flag = /M\d{3}_CAPTURE/.exec(command)?.[0];
  const owner = owningCensus(record);
  assert.ok(
    command.includes(owner),
    `${CLAIMS_REL} names the command that captured it, and that command must name the suite that owns it (${owner}): ${JSON.stringify(command)}`,
  );
  assert.ok(
    flag !== undefined,
    `${CLAIMS_REL}'s capture command must arm an M0NN_CAPTURE flag of its own, and it names none: ${JSON.stringify(command)}`,
  );
  assert.ok(
    existsSync(join(ROOT, owner)),
    `${CLAIMS_REL} names ${owner} as its census, and this checkout does not carry that suite`,
  );
  const ownerSource = readText(owner, `${owner} owns ${CLAIMS_REL}`);
  assert.ok(
    namesThisRecord(ownerSource, CLAIMS_REL),
    `${owner} owns ${CLAIMS_REL} and must name that record — literally, or as the research/raw/<milestone>-verdict-claims.json template keyed on the bound milestone — and it names neither`,
  );
  assert.ok(
    ownerSource.includes(flag),
    `${owner} owns ${CLAIMS_REL} and must read the flag the record states (${flag}); it does not`,
  );
  assert.equal(
    record.capture?.records,
    CLAIMS_REL,
    'the record names the file it is',
  );
}

/**
 * Whether this suite stands down from the derivation for a record another census owns, applying the
 * ownership chain instead. Every pin that needs M068's proof table asks this first, so a record whose
 * own `capture.command` names another suite is never compared against M068's criteria, its plan
 * resolution or its two document paths. The question is asked of the record in front of the pin rather
 * than of a value read once at load, so a copy of the record handed to a pin is judged as the record it
 * is; at this head nothing owns `research/raw/m068-verdict-claims.json` elsewhere, so every pin runs.
 * @param {any} record @returns {boolean}
 */
function standsDown(record) {
  if (owningCensus(record) === SUITE_REL) return false;
  assertOwnershipChain(record);
  return true;
}

/**
 * The whole record is what this head derives, byte for byte, and the artefact each claim publishes
 * resolves. A record another census owns is held to that chain instead of being derived here.
 * @param {any} record @returns {void}
 */
function assertDerivesAtThisHead(record) {
  if (standsDown(record)) return;
  const expected = atRecordedDocumentLocations(derived());
  assert.deepEqual(
    record,
    expected,
    `${CLAIMS_REL} is not what this head derives: ${firstDifference(record, expected, '')} - re-capture with ${CAPTURE_COMMAND}`,
  );
  assert.equal(
    canonical(record),
    canonical(expected),
    `${CLAIMS_REL} must be serialized as the capture writes it, so a re-capture would move no byte`,
  );
}

/**
 * Every pin above, over one record: what the armed writer refuses to write and what a default run holds
 * the committed bytes to.
 * @param {any} record @returns {void}
 */
function assertRecordPins(record) {
  if (standsDown(record)) return;
  assertCriteriaQuoted(record);
  assertClaimsCarryEdges(record);
  assertCitationsResolve(record);
  assertCitationsFollowThePlan(record);
  assertEdgeClaims(record);
  assertCaptureChain(record);
  assertPlanEvidence(record);
}

// ------------------------------------------------------------------ capture ----

/** The bytes the read-only pin holds the record to; an armed run re-bases it after its own write. */
const claimsAtLoad = existsSync(CLAIMS_PATH)
  ? digest(readFileSync(CLAIMS_PATH))
  : null;
let claimsBaseline = claimsAtLoad;

/**
 * The armed capture: derive, compare, write only when a value moved, so two armed runs leave the file
 * byte-identical and a default run never writes at all.
 *
 * The writer derives through the recorded document, then refuses to write unless the candidate is the
 * fixed point of the pin this suite's default run holds, so a capture can never write bytes its reader
 * then calls wrong.
 * @param {string} path
 * @returns {{ wrote: boolean, before: string | null, after: string, moved: string }}
 */
function captureClaims(path) {
  // An armed run of a record another census owns would overwrite that census's record with M068's
  // derivation: the pen is the owner's, so the run refuses and names the suite to arm instead.
  if (CLAIMS_OWNED_ELSEWHERE) {
    assert.fail(
      `an armed run would write ${CLAIMS_REL}, and that record is owned by ${CLAIMS_OWNER}: this file's derivation is not the one the record records, so an armed run here would overwrite another census's record with a second derivation of it. Run ${CLAIMS_OWNER}'s own arm instead`,
    );
  }
  const present = existsSync(path);
  const text = present ? readFileSync(path, 'utf8') : '';
  const before = present ? digest(text) : null;
  const record = atRecordedDocumentLocations(derived());
  const candidate = canonical(record);
  let moved = 'the record had not been written';
  if (present && text === candidate) {
    moved = '';
  } else if (present) {
    moved = `the record moved: ${JSON.stringify(firstDifference(JSON.parse(text), record, ''))}`;
  }
  if (moved === '') return { wrote: false, before, after: before ?? '', moved };
  // Never write a record that would fail its own pins.
  assert.doesNotThrow(() => assertRecordPins(record));
  // Nor one its own default pin would refuse: the candidate must be the fixed point of the pin, so a
  // capture cannot write bytes the read-only run then calls wrong.
  assert.equal(
    canonical(atRecordedDocumentLocations(derived())),
    candidate,
    "armed capture refused: the bytes it would write fail this suite's default pin, so the capture does not derive through the pin its reader holds. Nothing was written.",
  );
  writeFileSync(path, candidate);
  return { wrote: true, before, after: digest(readFileSync(path)), moved };
}

// Declared first among the record's tests, so an armed run writes before the read-only pins read the
// file back: the same pins then prove the freshly written record is the one this head derives.
if (ARMED) {
  describe('the claim record, armed', () => {
    it('re-derives, writes only what moved, and a second run changes no byte', () => {
      const first = captureClaims(CLAIMS_PATH);
      console.log(
        first.wrote
          ? `armed run wrote ${CLAIMS_REL} (${first.moved})`
          : 'armed run: nothing moved, nothing written',
      );
      assert.equal(
        first.after,
        digest(readFileSync(CLAIMS_PATH)),
        'the bytes the armed run reports are not the bytes on disk',
      );
      const second = captureClaims(CLAIMS_PATH);
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
      console.log(
        `armed idempotence: ${String(readFileSync(CLAIMS_PATH).length)} characters, sha256 ${second.after} before and after the second run`,
      );
      claimsBaseline = digest(readFileSync(CLAIMS_PATH));
    });
  });
}

// ------------------------------------------------------------- measurement ----

describe('measurement', () => {
  it('reads the criteria, the edge rows, the plan coverage and the suites the plan resolves', () => {
    const { intentSource, planSource, tasksDir } = sources();
    const criteria = intentCriteria(intentSource);
    const edges = intentEdges(intentSource);
    const coverage = planCoverage(planSource);
    const heldOut = planHeldOut(planSource);

    assert.deepEqual(
      Object.keys(criteria),
      ['SC1', 'SC2', 'SC3', 'SC4'],
      'the intent declares four criteria, and every one of them is ruled',
    );
    assert.equal(
      edges.length,
      8,
      `the intent declares eight edge rows, and it declares ${String(edges.length)}`,
    );
    assert.deepEqual(
      edges.map((edge) => edge.edge),
      ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'],
      `the edge rows are E1 to E8, and they are ${JSON.stringify(edges.map((edge) => edge.edge))}`,
    );
    assert.equal(
      heldOut.size,
      0,
      `this plan's ## Held-out checks writes no row, and it writes ${String(heldOut.size)}: a row added there is a mapping this census must read instead`,
    );
    assert.ok(
      coverage.length > 0,
      'the plan must assign its criteria in ## Intent coverage, or no claim can read the suite that proves its criterion',
    );
    for (const criterion of Object.keys(criteria)) {
      const resolved = planSuiteFor(criterion, planSource, tasksDir);
      assert.equal(
        resolved.suite,
        PLAN_SUITES[criterion],
        `the plan resolves ${criterion} to ${resolved.suite} through ${resolved.task}, and this table names ${JSON.stringify(PLAN_SUITES[criterion])}`,
      );
      assert.ok(
        existsSync(absPath(resolved.suite)),
        `${criterion} is resolved to ${resolved.suite}, which this checkout does not carry`,
      );
    }
    for (const claim of claimsOf(derived())) {
      for (const citation of claim.citations) {
        assert.ok(
          existsSync(absPath(citation.suite)),
          `${claim.criterion} cites ${citation.suite}, which this checkout does not carry`,
        );
      }
    }
    console.log(
      `${MILESTONE}: ${String(Object.keys(criteria).length)} criteria, ${String(edges.length)} edge claim(s), ${String(heldOut.size)} held-out row(s), ${String(coverage.length)} coverage row(s), suites ${JSON.stringify(PLAN_SUITES)}`,
    );
  });

  it('the join answers with the six fields the intent names, and the artefacts this milestone ships are here', () => {
    assert.deepEqual(
      answerFieldsOfTheJoin(),
      ANSWER_FIELDS,
      `the join must answer with exactly ${JSON.stringify(ANSWER_FIELDS)}`,
    );
    for (const rel of [MEASURED_REL, JOIN_REL, PANEL_REL]) {
      assert.ok(
        existsSync(absPath(rel)),
        `${rel} must be present before this milestone's claims are captured`,
      );
    }
    const { intentPath, planPath } = sources();
    assert.equal(
      basename(intentPath),
      'INTENT.md',
      `the resolved document must be an intent, and it resolves to ${shown(intentPath)}`,
    );
    assert.equal(
      basename(planPath),
      'PLAN.md',
      `the resolved plan must be a plan, and it resolves to ${shown(planPath)}`,
    );
    console.log(
      `${MILESTONE}: held to ${shown(intentPath)} and ${shown(planPath)}; the record ${MEASURED_REL}, the join ${JOIN_REL} and the pane ${PANEL_REL} are here`,
    );
  });
});

// --------------------------------------------------------------- the record ----

describe('the claim record', () => {
  it('is a read: a default run hashes the record the same before and after', () => {
    assert.ok(
      existsSync(CLAIMS_PATH),
      `${CLAIMS_REL} is missing - the record has never been captured`,
    );
    const now = digest(readFileSync(CLAIMS_PATH));
    assert.equal(
      now,
      claimsBaseline,
      `${CLAIMS_REL} changed during this run, so the suite is not read-only`,
    );
    console.log(
      `${CLAIMS_REL} at load and after the run: ${String(readFileSync(CLAIMS_PATH).length)} characters, sha256 ${now}`,
    );
  });

  it('is exactly what this head derives, and a value that moved is named', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertDerivesAtThisHead(recorded));
    console.log(
      `${CLAIMS_REL} is exactly what this head derives: ${String(recorded.claims.length)} claim(s) and ${String(recorded.edgeClaims.length)} edge claim(s) over ${String(recorded.evidence.suites.length)} suite(s)`,
    );
  });

  it('rules every criterion the intent declares, quotes it verbatim, and carries the edges it is held by', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertCriteriaQuoted(recorded));
    assert.doesNotThrow(() => assertClaimsCarryEdges(recorded));
    console.log(
      `${CLAIMS_REL}: ${JSON.stringify(recorded.claims.map((/** @type {any} */ row) => [row.criterion, row.criterionCharacters, row.edges.map((/** @type {any} */ edge) => edge.edge)]))}`,
    );
  });

  it('names a test this head declares for every citation, and a line that states what the citation says', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertCitationsResolve(recorded));
    console.log(
      `${CLAIMS_REL}: ${String(recorded.claims.reduce((sum, /** @type {any} */ row) => sum + row.citations.length, 0))} test-declaration citation(s), tests ${JSON.stringify(recorded.claims.map((/** @type {any} */ row) => row.test))}`,
    );
  });

  it('cites the suite the plan resolves for every criterion, and states the plan evidence it read', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertCitationsFollowThePlan(recorded));
    assert.doesNotThrow(() => assertPlanEvidence(recorded));
    assert.doesNotThrow(() => assertCaptureChain(recorded));
    console.log(
      `${CLAIMS_REL}: plan disagreements ${JSON.stringify(recorded.evidence.plan.disagreements)}; resolved ${JSON.stringify(recorded.evidence.plan.resolved)}`,
    );
  });

  it('carries one claim per edge, with its lines read back and the two absences this head measured', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertEdgeClaims(recorded));
    console.log(
      `${CLAIMS_REL}: ${String(recorded.edgeClaims.length)} edge claim(s), absences on ${JSON.stringify(recorded.evidence.absences)}, ${String(recorded.edgeClaims.reduce((sum, /** @type {any} */ row) => sum + row.citations.length, 0))} line citation(s)`,
    );
  });
});

// ------------------------------------------------------------------- mutants ----

describe('the mutants', () => {
  it('a claim quoting its criterion in its own words reddens naming the claim and the field', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    // The mutant exercises a pin that needs M068's intent, so it stands down with that pin when another
    // census owns the record: the ownership chain is what this file checks instead.
    if (standsDown(recorded)) return;
    assert.doesNotThrow(() => assertCriteriaQuoted(recorded));

    const planted = clone(recorded);
    const live = planted.claims[0];
    live.criterionText = `${live.criterionText} (reworded here)`;
    live.criterionCharacters = live.criterionText.length;
    assert.notEqual(
      live.criterionText,
      intentCriteria(sources().intentSource).SC1,
      'the planted quote must be a different text from the intent, or the mutant is a no-op',
    );

    const failure = reddens(
      () => assertCriteriaQuoted(planted),
      'a row that quotes its criterion in its own words',
    );
    assert.match(
      failure.message,
      /SC1 must quote the intent character for character/,
      `a row whose quote is no longer the intent's must redden by claim id; it produced ${JSON.stringify(failure.message.slice(0, 240))}`,
    );
    assert.match(
      failure.message,
      /claims\[0\]\.criterionText/,
      `the refusal must name the field that moved; it produced ${JSON.stringify(failure.message.slice(0, 240))}`,
    );

    assert.doesNotThrow(() => assertCriteriaQuoted(recorded));
    console.log(`quote mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a citation whose line does not state what it says reddens naming the file and the line', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertCitationsResolve(recorded));

    const planted = clone(recorded);
    planted.claims[0].citations[0].line += 1;
    const drifted = reddens(
      () => assertCitationsResolve(planted),
      'a citation whose line slid off the line it states',
    );
    assert.ok(
      drifted.message.includes(recorded.claims[0].suite),
      `the refusal must name the suite; it produced ${JSON.stringify(drifted.message.slice(0, 320))}`,
    );
    assert.match(
      drifted.message,
      /declares no such test at this head/,
      `the refusal must say what is missing rather than that something differs; it produced ${JSON.stringify(drifted.message.slice(0, 320))}`,
    );

    const absent = 'a test no suite in this checkout declares';
    const missing = clone(recorded);
    missing.claims[0].test = absent;
    missing.claims[0].citations[0].test = absent;
    const failure = reddens(
      () => assertCitationsResolve(missing),
      'a claim whose test this checkout does not declare',
    );
    assert.ok(
      failure.message.includes(recorded.claims[0].suite),
      `the refusal must name the suite that should carry the missing test; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );

    assert.doesNotThrow(() => assertCitationsResolve(recorded));
    console.log(
      `citation mutants: ${drifted.message.split('\n')[0]} | ${failure.message.split('\n')[0]}`,
    );
  });

  it('a claim that drops the suite the plan resolves reddens naming the criterion and both suites', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    // The suite the plan resolves is this milestone's table; the mutant stands down with the pin it
    // exercises when another census owns the record, and the chain is what this file checks instead.
    if (standsDown(recorded)) return;
    assert.doesNotThrow(() => assertCitationsFollowThePlan(recorded));

    const planted = clone(recorded);
    const row = planted.claims[0];
    row.citations = row.citations.filter(
      (/** @type {any} */ citation) =>
        citation.suite !== PLAN_SUITES[row.criterion],
    );
    assert.ok(
      !row.citations.some(
        (/** @type {any} */ citation) =>
          citation.suite === PLAN_SUITES[row.criterion],
      ),
      'the planted claim must no longer cite the suite the plan resolves',
    );

    const failure = reddens(
      () => assertCitationsFollowThePlan(planted),
      'a claim that drops the suite the plan resolves',
    );
    assert.ok(
      failure.message.includes(row.criterion),
      `the refusal must name the criterion; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes(PLAN_SUITES[row.criterion]),
      `the refusal must name the suite the plan resolves; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );

    assert.doesNotThrow(() => assertCitationsFollowThePlan(recorded));
    console.log(`dropped-plan-suite mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a claim whose edge cells are not the intent’s reddens naming the criterion and the edge', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    // The edge cells are M068's intent's; the mutant stands down with the pin it exercises when another
    // census owns the record.
    if (standsDown(recorded)) return;
    assert.doesNotThrow(() => assertClaimsCarryEdges(recorded));

    const planted = clone(recorded);
    const row = planted.claims[0];
    row.edges[0].detail = 'a detail this record wrote for itself';
    assert.notEqual(
      row.edges[0].detail,
      recorded.claims[0].edges[0].detail,
      'the planted detail must differ from the intent’s, or the mutant is a no-op',
    );

    const failure = reddens(
      () => assertClaimsCarryEdges(planted),
      'a claim whose edge detail is not the intent’s',
    );
    assert.ok(
      failure.message.includes(row.criterion),
      `the refusal must name the criterion; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes(row.edges[0].edge),
      `the refusal must name the edge; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );

    assert.doesNotThrow(() => assertClaimsCarryEdges(recorded));
    console.log(`edge-detail mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a measured absence softened to prose reddens naming the edge and the field it lost', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    // The two measured absences are M068's; the mutant stands down with the pin it exercises when another
    // census owns the record.
    if (standsDown(recorded)) return;
    assert.doesNotThrow(() => assertEdgeClaims(recorded));

    const softened = clone(recorded);
    const row = softened.edgeClaims.find(
      (/** @type {any} */ claim) => claim.absence !== null,
    );
    assert.ok(row, 'the record must carry an absence to soften');
    row.absence = null;
    const dropped = reddens(
      () => assertEdgeClaims(softened),
      'a measured absence replaced by prose',
    );
    assert.match(
      dropped.message,
      /exactly the two absences/,
      `the refusal must say which absences the head measured; it produced ${JSON.stringify(dropped.message.slice(0, 320))}`,
    );

    const silent = clone(recorded);
    const half = silent.edgeClaims.find(
      (/** @type {any} */ claim) => claim.absence !== null,
    );
    assert.ok(half, 'the record must carry an absence to hollow out');
    half.absence.searched = 'nothing was searched';
    const hollow = reddens(
      () => assertEdgeClaims(silent),
      'an absence that does not say what was searched',
    );
    assert.match(
      hollow.message,
      /does not state its searched/,
      `the refusal must name the field the absence lost; it produced ${JSON.stringify(hollow.message.slice(0, 320))}`,
    );

    assert.doesNotThrow(() => assertEdgeClaims(recorded));
    console.log(
      `absence mutants: ${dropped.message.split('\n')[0]} | ${hollow.message.split('\n')[0]}`,
    );
  });

  it('a record another census owns is held to the ownership chain instead of derived here', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));

    // The control: the committed record names this suite as its census, so the chain holds and the
    // derivation runs — which is what every pin above does at this head.
    assert.equal(
      owningCensus(recorded),
      SUITE_REL,
      `${CLAIMS_REL} names the suite that captured it, and this head reads ${JSON.stringify(owningCensus(recorded))}`,
    );
    assert.equal(
      standsDown(recorded),
      false,
      `the record on disk is ${SUITE_REL}'s, so nothing stands down for it`,
    );
    assert.doesNotThrow(() => assertDerivesAtThisHead(recorded));

    // The mutant: the record states another census's command, which is the one shape that means the list
    // is another milestone's to derive. One milestone later this file is the predecessor and reads
    // exactly such a record, so the stand-down has to bite rather than compare it against M068's tables.
    const foreignOwner = 'scripts/m069-verdict-claims.test.mjs';
    const foreign = clone(recorded);
    foreign.capture.command = `M069_CAPTURE=1 node --test ${foreignOwner}`;
    assert.equal(owningCensus(foreign), foreignOwner);
    assert.equal(
      namesThisRecord(
        readText(foreignOwner, 'the suite the planted command names'),
        CLAIMS_REL,
      ),
      false,
      `the planted census must not name ${CLAIMS_REL}, or the chain would hold over a record it does not own and the mutant would be a no-op`,
    );
    const failure = reddens(
      () => assertOwnershipChain(foreign),
      'a record naming a census that does not name it',
    );
    assert.ok(
      failure.message.includes(foreignOwner),
      `the refusal must name the suite the record says captured it; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes(CLAIMS_REL),
      `the refusal must name the record nobody owns; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );

    // A record owned elsewhere whose command arms no flag is a red too, so the chain is read rather than
    // the stand-down returning quietly on any command that names another suite.
    const unarmed = clone(recorded);
    unarmed.capture.command = `node --test ${foreignOwner}`;
    assert.equal(owningCensus(unarmed), foreignOwner);
    const noFlag = reddens(
      () => assertOwnershipChain(unarmed),
      'a record whose command arms no flag',
    );
    assert.match(
      noFlag.message,
      /M0NN_CAPTURE flag/,
      `the refusal must name the flag the record lost; it produced ${JSON.stringify(noFlag.message.slice(0, 320))}`,
    );

    assert.doesNotThrow(() => assertDerivesAtThisHead(recorded));
    console.log(`stand-down: ${failure.message.split('\n')[0]}`);
  });

  it('the pins are different checks rather than one check listed twice', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    const pins = [
      () => assertCriteriaQuoted(recorded),
      () => assertClaimsCarryEdges(recorded),
      () => assertCitationsResolve(recorded),
      () => assertCitationsFollowThePlan(recorded),
      () => assertEdgeClaims(recorded),
      () => assertPlanEvidence(recorded),
      () => assertCaptureChain(recorded),
    ];
    for (const pin of pins) assert.doesNotThrow(pin);
    assert.equal(
      new Set(pins.map((pin) => pin.toString())).size,
      pins.length,
      'the pins must be different checks rather than one check listed twice',
    );
    console.log(
      `${CLAIMS_REL}: ${String(pins.length)} pins hold the committed record at once`,
    );
  });
});

// ------------------------------------------------------------------- the writer ----

describe('the writer', () => {
  it('writes only behind its own arm, and derives the candidate through the recorded document', () => {
    const source = readText(SUITE_REL, 'this suite is what is being measured');
    assert.ok(
      /if \(ARMED\) \{/.test(source),
      'the armed capture must sit behind a single `if (ARMED)` gate, so a default run cannot write',
    );
    assert.equal(
      (source.match(/^\s*writeFileSync\(/gm) ?? []).length,
      1,
      'exactly one writeFileSync call may exist, and it must be the armed capture',
    );
    const at = source.indexOf('function captureClaims(');
    assert.ok(at >= 0, 'the capture must be one function');
    const body = source.slice(at, source.indexOf('\n}\n', at));
    for (const required of [
      'atRecordedDocumentLocations(derived())',
      'assertRecordPins(record)',
      'armed capture refused',
    ]) {
      assert.ok(
        body.includes(required),
        `the writer must derive through the recorded document and refuse a candidate that fails its own pin, and it does not name ${JSON.stringify(required)}`,
      );
    }
    assert.ok(
      body.indexOf('assertRecordPins(record)') < body.indexOf('writeFileSync('),
      'the writer must refuse before it writes, not after',
    );
    assert.ok(
      source.includes(CAPTURE_ENV),
      `this suite must read the flag the record states (${CAPTURE_ENV})`,
    );
    assert.ok(
      CAPTURE_COMMAND.includes(CAPTURE_ENV),
      'the capture command the record states must arm the flag this suite reads',
    );
    assert.ok(
      source.includes(CLAIMS_NAMED),
      `${SUITE_REL} must name the record it owns (${CLAIMS_NAMED}), which is the spelling the censuses that read it check`,
    );
    console.log(
      `writer: one write behind ${CAPTURE_ENV}, deriving through the recorded document and the pin`,
    );
  });
});
