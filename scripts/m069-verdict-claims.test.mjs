// M069 T005 — the claims census: one claim per success criterion the intent declares, one claim per
// edge the intent's own five-column table binds, and every citation re-resolved on every run by
// opening the file it names and reading the line it states.
//
// The gate reads a claim list for every milestone (`scripts/overlay-verdict-claims.test.mjs`,
// `scripts/navigation-blocking.test.mjs`, `scripts/guard-verdict-claims.test.mjs`), and the census is
// per milestone: `scripts/guard-verdict-claims.test.mjs` refuses at this head rather than writing
// M069's record, because it is M063's census and says so. This suite is M069's census. Five rules,
// and none of them reads a fact the tree does not carry:
//
//   1. Each criterion, quoted. Every numbered criterion the milestone's own intent declares is ruled
//      exactly once, and its `criterionText` is the intent's own text, parsed with the routine
//      `scripts/overlay-verdict-claims.test.mjs` uses, so the quote is compared character for
//      character by the suites that read it as well as by this one. `criterionCharacters` states the
//      length quoted.
//   2. Each claim's edges, read from the intent. The five columns the owner's ruling makes
//      authoritative (`Edge | Criterion | Category | Disposition | Detail`) give each criterion the
//      edges it is held by, with the detail cell verbatim.
//   3. Each edge's suite, stated here and held to the intent's own row. This milestone's plan holds
//      nothing out — its `## Held-out checks` says so, and `plan-lint` refuses a held-out row for an
//      edge a task already proves — so the edge-to-suite mapping is the census's own statement, and
//      every criterion's claim must cite every suite its own edges name, so a suite cannot arrive in
//      a claim that no edge of that criterion is proved by.
//   4. Each citation, opened and read. A citation names a file, a line and the text that line
//      carries; every run opens that file and asserts the line is there and states what the citation
//      says it states. A criterion's citation is a test declaration, so it also names the test title,
//      and the line must be the line that declares that title.
//   5. Each claim's artefact. A row names the artefact path it cites, says what that artefact
//      carries, and states the edge ids it is ruled on as `edge ["E1","E2"]`, the shape the censuses
//      read.
//
// The milestone is derived from the branch the state file binds, and this suite refuses to run when
// that branch names another milestone: a census that ran on would capture one milestone's record
// under another milestone's name. The intent is asked of `scripts/verdict-claims-intent.mjs`, so the
// archive move is that resolver's decision and not a second one taken here, and the record states
// the document locations it was captured at (`atRecordedDocumentLocations`) so a location the ship
// later moves is not a value that moved.
//
// `M069_CAPTURE=1` arms the one write. It re-derives, compares, and writes only when a value moved,
// so two armed runs leave the file byte-identical; a default run reads the file, asserts it is
// exactly what this head derives, and asserts its own bytes did not move:
//
//   M069_CAPTURE=1 node --test scripts/m069-verdict-claims.test.mjs
//
// This suite names no project-directory path and opens none by name: the state file and the intent
// are reached through a spelling assembled here, so the archive-path census records no reference of
// this file's own.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { intentPathForMilestone } from './verdict-claims-intent.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUITE_REL = 'scripts/m069-verdict-claims.test.mjs';
const RAW = 'research/raw';

/**
 * The first characters of a project-directory path, kept apart so this file names no such reference
 * and the archive-path census records none of its own here. It is used only to reach the state file
 * and to re-spell a document location the record states.
 */
const DOTTED = '.' + 'project';

/** The milestone this census is the census of. A branch binding another milestone is refused. */
const OWN_MILESTONE = 'M069';

const CLAIMS_REL = `${RAW}/${OWN_MILESTONE.toLowerCase()}-verdict-claims.json`;
const CLAIMS_PATH = join(ROOT, ...CLAIMS_REL.split('/'));

/**
 * The record this file writes, named as a literal as well as derived. The readers that subtract a
 * record its own census hold open read the owner from the record's `capture.command` and then
 * require that owner to name the record's path, so the two spellings are kept one by the assertion
 * in `derive`.
 */
const CLAIMS_NAMED = 'research/raw/m069-verdict-claims.json';

/** The commands this record is held to, recorded in it so a reader runs what produced it. */
const CAPTURE_ENV = 'M069_CAPTURE';
/** The same arm under the long spelling a brief may use; the record states `M069_CAPTURE`. */
const CAPTURE_ALIAS = 'M069_CLAIMS_CAPTURE';
const CHECK_COMMAND = `node --test ${SUITE_REL}`;
const CAPTURE_COMMAND = `${CAPTURE_ENV}=1 ${CHECK_COMMAND}`;
const ARMED = [CAPTURE_ENV, CAPTURE_ALIAS].some(
  (name) => String(process.env[name] ?? '').trim() === '1',
);

/** The five column names the owner's ruling makes authoritative, in the order it names them. */
const EDGE_COLUMNS = ['Edge', 'Criterion', 'Category', 'Disposition', 'Detail'];

/** The four suites this milestone ships, each holding one part of the token layer. */
const MILESTONE_SUITES = Object.freeze([
  'scripts/ds-tokens.test.mjs',
  'scripts/token-baseline.test.mjs',
  'scripts/panel-styles.test.mjs',
  'scripts/panel-bundle-budget.test.mjs',
]);

/** The stylesheet the token layer lives in, and the record this milestone measured before landing it. */
const STYLES_REL = 'apps/angular-ai-devtools/src/styles.css';
const BASELINE_REL = 'research/raw/m069-token-baseline.json';

/**
 * Which suite proves each edge of the intent's table. Stated here, held to the intent's own rows by
 * `derive` (every edge gets exactly one suite, and each suite is one this milestone ships), and
 * copied into the record so a reader sees the mapping beside the citations that carry it.
 */
const EDGE_SUITES = Object.freeze({
  E1: 'scripts/ds-tokens.test.mjs',
  E2: 'scripts/ds-tokens.test.mjs',
  E3: 'scripts/token-baseline.test.mjs',
  E4: 'scripts/token-baseline.test.mjs',
  E5: 'scripts/panel-styles.test.mjs',
  E6: 'scripts/ds-tokens.test.mjs',
  E7: 'scripts/panel-bundle-budget.test.mjs',
  E8: 'scripts/ds-tokens.test.mjs',
});

/**
 * What proves each criterion, in the order a reader should read it. Every entry is a test
 * declaration: the census suites hold a record to a title its suite declares, so the citation
 * carries the title and the line, and this suite refuses a line that is not the line declaring it.
 * The first citation is the one the row's `suite` and `test` fields name; the parents of the four
 * suites the criterion's own edges name are all cited, so a claim proves the edges it is held by.
 */
const PROOFS = Object.freeze({
  SC1: Object.freeze([
    {
      suite: 'scripts/ds-tokens.test.mjs',
      test: 'AC3: the sheet opens with one :root token block, and every rule that reads a token comes after it',
      line: 924,
      lineText: "it('AC3: the sheet opens with one :root token block",
      holds:
        'the sheet opens with one `:root` token block and every rule that reads a token comes after it, so the block is one place and the readers are downstream of it',
    },
    {
      suite: 'scripts/ds-tokens.test.mjs',
      test: 'AC2: every custom property is declared inside a :root block, and every token names one of the four groups',
      line: 971,
      lineText:
        "it('AC2: every custom property is declared inside a :root block",
      holds:
        'every custom property is declared inside a `:root` block and every token names one of the four groups, so density, colour, type and motion are declared in the one block rather than one at a time',
    },
    {
      suite: 'scripts/token-baseline.test.mjs',
      test: 'AC1: every rendering declaration reads a token, apart from the three the style suite anchors',
      line: 2441,
      lineText:
        "it('AC1: every rendering declaration reads a token, apart from the three",
      holds:
        'every rendering declaration that is not one of the three anchored literals reads a token from the block, so the value a surface renders comes from the token rather than from a literal at the point of use',
    },
    {
      suite: 'scripts/token-baseline.test.mjs',
      test: 'AC1 mutant: a dropped token reddens naming the property it left unresolved',
      line: 2468,
      lineText:
        "it('AC1 mutant: a dropped token reddens naming the property it left unresolved",
      holds:
        'a token dropped from the block reddens naming the property it left unresolved and the token that is missing, which is the mutant the criterion names',
    },
  ]),
  SC2: Object.freeze([
    {
      suite: 'scripts/token-baseline.test.mjs',
      test: 'AC2: the reduced-motion block exists as a block and restates every motion token',
      line: 2503,
      lineText:
        "it('AC2: the reduced-motion block exists as a block and restates every motion token",
      holds:
        'the reduced-motion contract is a block the sheet carries, asserted as a block and restating every motion token, rather than inferred from an absent animation',
    },
    {
      suite: 'scripts/token-baseline.test.mjs',
      test: 'AC2 mutant: deleting the reduced-motion block reddens naming it',
      line: 2523,
      lineText:
        "it('AC2 mutant: deleting the reduced-motion block reddens naming it",
      holds:
        'deleting the reduced-motion block reddens naming it, which is the mutant the criterion names',
    },
    {
      suite: 'scripts/ds-tokens.test.mjs',
      test: 'AC2: the only re-declarations are the three reduced-motion restatements, each made once',
      line: 1058,
      lineText:
        "it('AC2: the only re-declarations are the three reduced-motion restatements",
      holds:
        'the only re-declarations in the sheet are the three reduced-motion restatements, each made once, so the reduced block restates the motion tokens and adds no second layer',
    },
  ]),
  SC3: Object.freeze([
    {
      suite: 'scripts/ds-tokens.test.mjs',
      test: 'AC1: no colour, spacing, type or duration literal is declared outside the block, apart from the three exemptions',
      line: 1143,
      lineText:
        "it('AC1: no colour, spacing, type or duration literal is declared outside the block",
      holds:
        'no colour, spacing, type or duration literal is declared outside the block apart from the three declarations a mutant of the style suite anchors, and the count of declarations reading no token is asserted to be exactly those three',
    },
    {
      suite: 'scripts/ds-tokens.test.mjs',
      test: 'AC1: a literal in a comment is not a declaration, and the scan names the one it saw',
      line: 1236,
      lineText:
        "it('AC1: a literal in a comment is not a declaration, and the scan names the one it saw",
      holds:
        'a literal inside a comment is not a declaration and the scan names the comment spellings it saw, so the scan reads declarations rather than matching text',
    },
    {
      suite: 'scripts/panel-styles.test.mjs',
      test: 'the pin reads computed style, and reads no font-family',
      line: 556,
      lineText: "test('the pin reads computed style, and reads no font-family'",
      holds:
        'the style suite pins computed values through `getComputedStyle` on a document built from its own markup, not the rule text, so its assertions cannot be satisfied by editing a string in the stylesheet',
    },
    {
      suite: 'scripts/panel-styles.test.mjs',
      test: 'the applied stylesheet gives the heading, the row, the surface and the controls a padding, a border and a background',
      line: 569,
      lineText:
        "test('the applied stylesheet gives the heading, the row, the surface and the controls",
      holds:
        'the heading, the row, the surface and the controls still resolve a padding, a border and a background through the applied sheet, so the values the token layer re-expressed are the values the panel renders',
    },
  ]),
  SC4: Object.freeze([
    {
      suite: 'scripts/panel-bundle-budget.test.mjs',
      test: 'the measured initial total does not exceed the 535.44 kB baseline',
      line: 597,
      lineText:
        "test('the measured initial total does not exceed the 535.44 kB baseline'",
      holds:
        'the measured initial total is compared against the ceiling the suite records, after the build is proved current, so the sheet stays within the budget its own suite records',
    },
    {
      suite: 'scripts/panel-bundle-budget.test.mjs',
      test: 'a budget move is declared with its milestone and its measured cost',
      line: 465,
      lineText:
        "test('a budget move is declared with its milestone and its measured cost'",
      holds:
        'the one budget move this milestone takes names its milestone, its measured cost and the reason it is declared, and the ceiling is asserted to be the measurement plus that cost',
    },
    {
      suite: 'scripts/ds-tokens.test.mjs',
      test: 'AC2: every token a rule reads is declared exactly once, and a token declared twice reddens naming both lines',
      line: 1015,
      lineText:
        "it('AC2: every token a rule reads is declared exactly once, and a token declared twice reddens naming both lines",
      holds:
        'a token declared twice reddens naming both of its lines, which is the duplicate-block mutant the criterion names',
    },
    {
      suite: 'scripts/ds-tokens.test.mjs',
      test: 'AC2: two tokens may carry one value, which is not a duplicate',
      line: 1081,
      lineText:
        "it('AC2: two tokens may carry one value, which is not a duplicate",
      holds:
        'two names carrying one value are asserted not to be a duplicate, so the duplicate rule keys on the name rather than on the value',
    },
  ]),
});

/**
 * One claim per edge of the intent's own table, each citing the lines that carry it. `citations` are
 * opened and read back on every run; `absence` is null where the tree carries the edge's instance
 * and states what was searched and what was found where it does not.
 */
const EDGE_CLAIMS = Object.freeze({
  E1: {
    claim:
      'A declaration that reads a token resolves the value the block declares rather than a blank, and a declaration that reads no token resolves the literal it states: no value a surface renders comes from nowhere.',
    suite: 'scripts/ds-tokens.test.mjs',
    test: 'AC2: every token a rule reads is declared exactly once, and a token declared twice reddens naming both lines',
    citations: [
      {
        file: 'scripts/ds-tokens.test.mjs',
        line: 1025,
        lineText: 'every token a rule reads is declared in a token block',
        holds:
          'every token a rule reads is declared in a token block, so a read resolves a declared value and never an empty one',
      },
      {
        file: 'scripts/ds-tokens.test.mjs',
        line: 1048,
        lineText: 'so the one-to-one rule asserts nothing',
        holds:
          'the suite refuses a layer that declares or reads no token, so the reading is measured rather than passing on an empty sheet',
      },
      {
        file: BASELINE_REL,
        line: 2818,
        lineText: '"unresolvedValues": 0,',
        holds:
          'the record this milestone measured before landing the tokens states zero unresolved values, so every declaration it read resolved a value',
      },
      {
        file: STYLES_REL,
        line: 217,
        lineText: 'color: #6b5200;',
        holds:
          'the one state colour that stays a literal resolves that literal, so a declaration reading no token still has a value rather than a blank',
      },
    ],
    absence: null,
    proves: [
      CHECK_COMMAND,
      'node --test scripts/ds-tokens.test.mjs',
      'node --test scripts/token-baseline.test.mjs',
    ],
  },
  E2: {
    claim:
      'The token block is the sheet’s first rule and precedes every rule that reads it, so a rule never resolves a token declared after it.',
    suite: 'scripts/ds-tokens.test.mjs',
    test: 'AC3: the sheet opens with one :root token block, and every rule that reads a token comes after it',
    citations: [
      {
        file: 'scripts/ds-tokens.test.mjs',
        line: 940,
        lineText: "the token block is not the sheet's first rule",
        holds:
          'the suite asserts the first `:root` block is the sheet’s first rule, naming the rule that precedes it when it is not',
      },
      {
        file: 'scripts/ds-tokens.test.mjs',
        line: 950,
        lineText: 'the token block must precede every rule that reads a token',
        holds:
          'the order failures are asserted empty, so a rule that reads a token above the block reddens',
      },
      {
        file: STYLES_REL,
        line: 59,
        lineText: ':root {',
        holds:
          'the token block opens the sheet, before the first rule that renders a value',
      },
      {
        file: STYLES_REL,
        line: 132,
        lineText: 'margin: var(--ds-density-flush);',
        holds:
          'the first rule that reads a token sits after the block and reads a token the block declares',
      },
    ],
    absence: null,
    proves: [CHECK_COMMAND, 'node --test scripts/ds-tokens.test.mjs'],
  },
  E3: {
    claim:
      'The reduced-motion contract is proved present as a block the sheet carries, restating the motion tokens, and not inferred from an absent animation — which no reading could distinguish from a missing rule.',
    suite: 'scripts/token-baseline.test.mjs',
    test: 'AC2: the reduced-motion block exists as a block and restates every motion token',
    citations: [
      {
        file: 'scripts/token-baseline.test.mjs',
        line: 2512,
        lineText:
          'the reduced-motion contract must be a block the sheet carries',
        holds:
          'the block is asserted present as a block, so a missing rule reddens rather than reading as a pane that never animates',
      },
      {
        file: 'scripts/token-baseline.test.mjs',
        line: 2533,
        lineText:
          "failures.some((one) => one.includes('prefers-reduced-motion'))",
        holds:
          'deleting the block reddens naming the media query, so the absence is a failure rather than a silence',
      },
      {
        file: STYLES_REL,
        line: 295,
        lineText: '@media (prefers-reduced-motion: reduce) {',
        holds:
          'the block the suite reads is in the sheet, under its own media query',
      },
      {
        file: STYLES_REL,
        line: 297,
        lineText: '--ds-motion-duration-fast: 0ms;',
        holds:
          'the block restates a motion token to its reduced value inside the block itself',
      },
    ],
    absence: null,
    proves: [CHECK_COMMAND, 'node --test scripts/token-baseline.test.mjs'],
  },
  E4: {
    claim:
      'Each declaration is resolved in the media context it is declared in, so the reduced-motion block’s declarations do not leak into the base block and the base block’s values do not leak into it.',
    suite: 'scripts/token-baseline.test.mjs',
    test: 'AC1: every rendering declaration reads a token, apart from the three the style suite anchors',
    citations: [
      {
        file: 'scripts/token-baseline.test.mjs',
        line: 2456,
        lineText: 'unresolvedFailures(css, recordContexts()),',
        holds:
          'every declaration is resolved against the documents of its own context, so a value from one media block is not used to resolve a declaration of another',
      },
      {
        file: 'scripts/token-baseline.test.mjs',
        line: 2458,
        lineText:
          'every declaration that reads a token must resolve through the seam',
        holds:
          'an unresolved reading is a value no browser would render, so a leak between contexts reddens instead of passing',
      },
      {
        file: STYLES_REL,
        line: 126,
        lineText: '--ds-motion-duration-fast: 120ms;',
        holds:
          'the base block declares the motion duration its own context carries, beside the reduced block’s restatement rather than instead of it',
      },
      {
        file: 'scripts/token-baseline.test.mjs',
        line: 2550,
        lineText: 'only the motion contract may be unconsumed',
        holds:
          'the suite states that only the motion contract may carry an unconsumed token, so the two blocks stay distinguishable rather than merging',
      },
    ],
    absence: null,
    proves: [CHECK_COMMAND, 'node --test scripts/token-baseline.test.mjs'],
  },
  E5: {
    claim:
      'The literal-value suite runs unmodified: it pins computed values read off a document rather than rule text, and a run whose expectation was edited reddens naming the assertion and the text it expected.',
    suite: 'scripts/panel-styles.test.mjs',
    test: 'the pin reads computed style, and reads no font-family',
    citations: [
      {
        file: 'scripts/panel-styles.test.mjs',
        line: 559,
        lineText: "'borderTopWidth', 'backgroundColor'",
        holds:
          'the discriminator list is exactly the three properties the pane can lose visibly, and it is read as computed style rather than as declaration text',
      },
      {
        file: 'scripts/panel-styles.test.mjs',
        line: 580,
        lineText:
          'the baseline must apply to the demo surface, read off the document rather than off the rule text',
        holds:
          'the baseline is read off the document, so an edited stylesheet cannot satisfy the pin by spelling the value the assertion expects',
      },
      {
        file: 'scripts/panel-styles.test.mjs',
        line: 655,
        lineText: 'must fail naming',
        holds:
          'every mutant must fail naming the text it expected, so an expectation edited to fit the sheet reddens naming the mutant and the text it no longer produces',
      },
      {
        file: 'scripts/panel-styles.test.mjs',
        line: 504,
        lineText: "'color: #6b5200;'",
        holds:
          'the mutant anchors a literal declaration the token layer kept, so the excuse for retuning one is measured against the sheet rather than asserted here',
      },
    ],
    absence: null,
    proves: [CHECK_COMMAND, 'node --test scripts/panel-styles.test.mjs'],
  },
  E6: {
    claim:
      'A literal inside a comment or inside a token definition is not counted as a stray literal, and a literal in a real declaration is: the scan reads declarations rather than matching text.',
    suite: 'scripts/ds-tokens.test.mjs',
    test: 'AC1: a literal in a comment is not a declaration, and the scan names the one it saw',
    citations: [
      {
        file: 'scripts/ds-tokens.test.mjs',
        line: 1148,
        lineText: 'declares outside the token block are the three',
        holds:
          'the only literals the scan admits outside the block are the three the style suite anchors, and it says so by name',
      },
      {
        file: 'scripts/ds-tokens.test.mjs',
        line: 1169,
        lineText: 'rendering declaration(s) that read no token',
        holds:
          'the count of rendering declarations that read no token is asserted to be exactly the three exemptions, so a fourth literal cannot pass as prose',
      },
      {
        file: 'scripts/ds-tokens.test.mjs',
        line: 1246,
        lineText:
          'a comment is not a declaration, so the values its prose spells do not redden the scan',
        holds:
          'a comment spelling a literal does not redden the scan, and the scan names the comment spellings it saw rather than dropping them silently',
      },
      {
        file: STYLES_REL,
        line: 81,
        lineText: '--ds-color-ink: #1b1f24;',
        holds:
          'a literal a token carries is a token definition rather than a stray declaration, which is the case the exemption rule distinguishes',
      },
    ],
    absence: null,
    proves: [CHECK_COMMAND, 'node --test scripts/ds-tokens.test.mjs'],
  },
  E7: {
    claim:
      'The budget is measured after the token block lands: the total is read only from a build proved newer than the newest source it must carry, and the declared ceiling is the pre-milestone measurement plus the declared cost rather than a number chosen on its own.',
    suite: 'scripts/panel-bundle-budget.test.mjs',
    test: 'a present build older than the newest source file it must carry is refused as stale',
    citations: [
      {
        file: 'scripts/panel-bundle-budget.test.mjs',
        line: 612,
        lineText: 'const current = assertBuildIsCurrent(PANEL_OUTPUT_DIR);',
        holds:
          'a present build is proved current before the total is measured, so a stale bundle is refused rather than counted',
      },
      {
        file: 'scripts/panel-bundle-budget.test.mjs',
        line: 636,
        lineText:
          'a present build older than the newest source file it must carry is refused as stale',
        holds:
          'the stale-build refusal is a test of its own, so the ordering the criterion states is pinned in both directions',
      },
      {
        file: 'scripts/panel-bundle-budget.test.mjs',
        line: 488,
        lineText: 'is not the measurement plus its declared cost',
        holds:
          'the ceiling is asserted to be the measurement plus the declared cost, so the move is derived from its reason rather than set independently',
      },
      {
        file: 'scripts/panel-bundle-budget.test.mjs',
        line: 108,
        lineText: "milestone: 'M069',",
        holds:
          'the one declared move names this milestone, so a reader sees which landing paid for the bytes',
      },
    ],
    absence: null,
    proves: [
      CHECK_COMMAND,
      'node --test scripts/panel-bundle-budget.test.mjs',
      'npx nx run angular-ai-devtools:build-extension',
    ],
  },
  E8: {
    claim:
      'A token declared twice under one name reddens naming both of its lines, and two names carrying one value are not treated as a duplicate: the rule keys on the name, not on the value.',
    suite: 'scripts/ds-tokens.test.mjs',
    test: 'AC2: every token a rule reads is declared exactly once, and a token declared twice reddens naming both lines',
    citations: [
      {
        file: 'scripts/ds-tokens.test.mjs',
        line: 1020,
        lineText: 'is declared twice',
        holds:
          'the duplicate failures are asserted empty on the untouched sheet, so the reading is taken before any mutant is planted',
      },
      {
        file: 'scripts/ds-tokens.test.mjs',
        line: 1287,
        lineText: "failure.includes('--ds-color-ink')",
        holds:
          'the duplicate refusal must name the token that was declared twice, not only the number of duplicates',
      },
      {
        file: 'scripts/ds-tokens.test.mjs',
        line: 1290,
        lineText: 'the refusal must name the file, the token and both lines',
        holds:
          'the refusal names the file, the token and both of the lines the two declarations sit on',
      },
      {
        file: 'scripts/ds-tokens.test.mjs',
        line: 1086,
        lineText:
          'a value two names carry is not a duplicate, and the duplicate rule keys on the name',
        holds:
          'two names carrying one value are asserted not to be a duplicate, so the rule cannot be satisfied by renaming a value',
      },
    ],
    absence: null,
    proves: [CHECK_COMMAND, 'node --test scripts/ds-tokens.test.mjs'],
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
 * The milestone the state file binds, read as its branch line. The refusal below is what makes this
 * census per milestone: a branch that names another milestone stops the run rather than capturing
 * this milestone's record under a name that suite does not own.
 * @returns {string}
 */
function boundMilestone() {
  const text = readText(
    `${DOTTED}/STATE.md`,
    'the state file is part of this repository and it binds the milestone',
  );
  const branch = /^branch:\s*(\S+)\s*$/m.exec(text)?.[1] ?? '';
  const number = /^gsd-path\/M(\d{3})$/.exec(branch)?.[1];
  assert.ok(
    number,
    `the state file must name the milestone under work by branch, and it names ${JSON.stringify(branch)}`,
  );
  return `M${number}`;
}

/**
 * Refuse a milestone this census is not the census of, naming the milestone the branch binds and the
 * one this file owns.
 * @param {string} milestone @returns {string}
 */
function refuseUnlessOwn(milestone) {
  assert.equal(
    milestone,
    OWN_MILESTONE,
    `${SUITE_REL} is ${OWN_MILESTONE}'s census and the bound branch names ${milestone}: this suite refuses to run, because a census that ran on would read ${milestone}'s record with ${OWN_MILESTONE}'s proof table`,
  );
  return milestone;
}

/** The milestone this run is bound to: the branch's, and this census's, or a refusal. */
const MILESTONE = refuseUnlessOwn(boundMilestone());

/**
 * The numbered success criteria of an intent, parsed with the routine
 * `scripts/overlay-verdict-claims.test.mjs` uses, so a row quotes the criterion that suite compares
 * it to and not this file's paraphrase of it.
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
 * The plan's `## Held-out checks` mapping, as the plan writes it: rows of `Edge | Task | Test`, and
 * the bullet form. This plan holds nothing out — it states that every edge is proved by the suite of
 * the task that owns it — so a row here is a mapping this census must read instead, and is refused
 * by name below.
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
 * The held-out rows whose task the plan's own `## Intent coverage` table does not assign that edge's
 * criterion, derived from the two tables rather than typed: a plan whose tables agree carries none. It
 * is recorded rather than refused, because the census that reads this record refuses to derive across
 * the two tables itself and holds the record to the list instead.
 * @param {Array<{ edge: string, criterion: string }>} edges
 * @param {Map<string, { task: string, test: string }>} heldOut
 * @param {Array<{ criterion: string, task: string, acceptance: string }>} coverage
 * @returns {Array<{ edge: string, criterion: string, heldBy: string, assignedByCoverage: string[] }>}
 */
function planDisagreements(edges, heldOut, coverage) {
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
  return name === undefined ? null : `${task}/${name}`;
}

/**
 * The declarations a suite carries, counted the way the whole-tree count counts them, and the titles
 * it declares — the string `it(` or `test(` is handed. A title is read from the one line that
 * declares it; every suite this file cites writes its titles on one line.
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
 * The failure a pin raises on a value, so a mutant's evidence is the assertion's own message rather
 * than the wrapper a `doesNotThrow` puts around it. A pin that survives its mutant is a vacuous pin,
 * and that is a failure here rather than a silent pass.
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
 * archive; the record was captured while they sat at their live locations, so the capture-time
 * spelling follows from the resolved path and owes nothing to the record it judges.
 * @param {string} resolved @returns {string}
 */
function recordedSpelling(resolved) {
  const at = `/${DOTTED}/archive/`;
  if (!resolved.startsWith(at)) return resolved;
  const matched = /^\d{3}-[^/]+\/((?:intent|plan)\/(?:INTENT|PLAN)\.md)$/.exec(
    resolved.slice(at.length),
  );
  return matched ? `${DOTTED}/${matched[1]}` : resolved;
}

/**
 * The derivation, with its two document locations spelled where they sat when the record was
 * captured and every other field the derivation's own, byte for byte.
 * @param {any} derivedRecord @returns {any}
 */
function atRecordedDocumentLocations(derivedRecord) {
  const rebased = clone(derivedRecord);
  rebased.evidence.intent.path = recordedSpelling(shown(sources().intentPath));
  rebased.evidence.plan.path = recordedSpelling(shown(sources().planPath));
  return rebased;
}

// ------------------------------------------------------------- derivation ----

/** The command that proves one cited suite. @param {string} suite @returns {string} */
function commandFor(suite) {
  return `node --test ${suite}`;
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
  const disagreements = planDisagreements(edges, heldOut, coverage);
  const tasksDir = join(dirname(planPath), '..', 'tasks');

  // This plan holds nothing out and states so: every edge is proved by the suite of the task that
  // owns it. A row added to `## Held-out checks` is a mapping this census must read instead, so it is
  // refused by name rather than quietly resolved a second way.
  assert.equal(
    heldOut.size,
    0,
    `this plan's ## Held-out checks writes no row, and it writes ${JSON.stringify([...heldOut.keys()])}: a held-out row is a mapping this census must read rather than fall back to the edges below`,
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

  // The suite each edge names, held to the intent's own rows: one suite per edge, a suite this
  // milestone ships, and the claim's own row naming the criterion the intent binds it to.
  assert.deepEqual(
    Object.keys(EDGE_SUITES),
    edges.map((edge) => edge.edge),
    `the suite table must name one suite per edge the intent declares: it names ${JSON.stringify(Object.keys(EDGE_SUITES))} and the intent declares ${JSON.stringify(edges.map((edge) => edge.edge))}`,
  );
  for (const edge of edges) {
    assert.equal(
      EDGE_CLAIMS[edge.edge].suite,
      EDGE_SUITES[edge.edge],
      `${edge.edge} is proved by ${EDGE_SUITES[edge.edge]}, and its claim names ${JSON.stringify(EDGE_CLAIMS[edge.edge].suite)}: one edge has one suite, or the row cites evidence in one place and states it in another`,
    );
    assert.ok(
      MILESTONE_SUITES.includes(EDGE_SUITES[edge.edge]),
      `${edge.edge} is proved by ${EDGE_SUITES[edge.edge]}, which is not one of the four suites this milestone ships (${JSON.stringify(MILESTONE_SUITES)})`,
    );
    assert.equal(
      EDGE_CLAIMS[edge.edge].criterion,
      undefined,
      `${edge.edge} carries a criterion of its own: the intent's edge row is the one place it is bound`,
    );
  }

  const missingTasks = [
    ...new Set(
      coverage
        .map((row) => row.task)
        .filter((task) => taskFileAt(tasksDir, task) === null),
    ),
  ].sort();
  assert.deepEqual(
    missingTasks,
    [],
    `the plan assigns its criteria to ${JSON.stringify([...new Set(coverage.map((row) => row.task))])} and this checkout carries no task file for ${JSON.stringify(missingTasks)}, so the plan's assignment names a task a reader cannot open`,
  );

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
    // Every suite one of the criterion's own edges names must be cited by its claim, so a criterion
    // is not proved by evidence its edges do not name.
    for (const edge of held) {
      assert.ok(
        suites.includes(EDGE_SUITES[edge.edge]),
        `${criterion} is held by ${edge.edge}, which ${EDGE_SUITES[edge.edge]} proves, and the claim cites ${JSON.stringify(suites)}: a criterion must cite the suite that proves each of its edges`,
      );
    }
    // And the other direction: a citation is one of the four suites this milestone ships.
    for (const suite of suites) {
      assert.ok(
        MILESTONE_SUITES.includes(suite),
        `${criterion} cites ${suite}, which is not one of the four suites this milestone ships (${JSON.stringify(MILESTONE_SUITES)})`,
      );
    }
    const rows = held.map((edge) => ({
      edge: edge.edge,
      category: edge.category,
      disposition: edge.disposition,
      detail: edge.detail,
      suite: EDGE_SUITES[edge.edge],
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
    return {
      criterion,
      criterionText,
      criterionCharacters: criterionText.length,
      ruling: 'not-required',
      reason: `The charter's portal clause makes a verdict required where an insurance-portal route can produce a criterion's facts. ${criterion} is ${JSON.stringify(criterionText)} - a fact about this repository's own stylesheet, the record that measured it and the suites that hold it, which no route of any page produces: a page renders computed values, and no page reading can say whether a declaration reads a token, whether the token block precedes its readers or whether a build is newer than the source it carries, so a portal-backed row would name a driver that cannot carry the answer. The clause is answered rather than dodged: the evidence is the edge row(s) ${named} the intent itself assigns the criterion, each held by ${JSON.stringify(rows.map((row) => row.suite))}, and the ${String(proofs.length)} test declaration(s) below name the file and the line that carry each part of them.`,
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
      reading: `${String(proofs.length)} test declaration citation(s) over ${String(suites.length)} suite(s) hold ${criterion} through the edge row(s) ${named} the intent assigns it: every one is a line this checkout carries at this head, opened and read back by this suite, so the criterion is proved by a line a reader can open rather than by a drive no driver here performs`,
      proves: [
        CHECK_COMMAND,
        ...[...new Set(proofs.map((proof) => proof.suite))].map(commandFor),
        'npm run check',
      ],
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
      const cited = linesOf(citation.file)[citation.line - 1] ?? '';
      assert.ok(
        cited.includes(citation.lineText),
        `${edge.edge} cites ${citation.file}:${String(citation.line)} for ${JSON.stringify(citation.lineText)}, and that line states ${JSON.stringify(cited)}`,
      );
      assert.ok(
        typeof citation.holds === 'string' &&
          citation.holds.trim().length >= 30,
        `${edge.edge} does not state which part of the edge ${String(citation.file)}:${String(citation.line)} holds`,
      );
    }
    // No claim offers a repair: a claim names what the tree states, and never what a reader should do.
    assert.doesNotMatch(
      stated.claim,
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
      suite: stated.suite,
      test: stated.test,
      citations: stated.citations.map((citation) => ({
        file: citation.file,
        line: citation.line,
        lineText: citation.lineText,
        holds: citation.holds,
      })),
      absence: null,
      proves: [...stated.proves],
    };
  });

  const stylesheet = readText(
    STYLES_REL,
    'the token layer this milestone ships',
  );

  return {
    schema: `${MILESTONE.toLowerCase()}-verdict-claims/v1`,
    milestone: MILESTONE,
    quotes: {
      from: `scripts/verdict-claims-intent.mjs (intentPathForMilestone(ROOT, ${JSON.stringify(MILESTONE)}))`,
      how: `parsed with the same routine scripts/overlay-verdict-claims.test.mjs uses, extracted into this file and run over the resolved intent, so every criterionText is the intent's own text: the ${String(Object.keys(criteria).length)} criteria it declares are ${JSON.stringify(Object.keys(criteria))} and scripts/overlay-verdict-claims.test.mjs compares them character for character`,
      edges: `read from the intent's own five-column edge-coverage table (${EDGE_COLUMNS.join(' | ')}) for the edge-to-criterion rows, and the edge-to-suite mapping stated by this census because this plan's ## Held-out checks holds nothing out: it reads ${String(heldOut.size)} held-out row(s) and ${String(coverage.length)} coverage row(s), so ${String(edges.length)} edge row(s) over the criteria ${JSON.stringify([...new Set(edges.map((edge) => edge.criterion))])} each get one claim and one suite - ${JSON.stringify(edges.map((edge) => `${edge.edge} -> ${EDGE_SUITES[edge.edge]}`))} - and every criterion's claim cites every suite its own edges name. The plan's ## Held-out checks and its ## Intent coverage table disagree at ${String(disagreements.length)} row(s) ${JSON.stringify(disagreements.map((one) => `${one.edge} is held by ${one.heldBy} and ${one.criterion} is assigned to ${one.assignedByCoverage.join('/') || 'no task'}`))}, recorded under evidence.plan.disagreements rather than refused, because the census scripts/navigation-blocking.test.mjs refuses to derive across the two tables and holds this record to the list`,
      citations: `every citation is a line this checkout carries at capture: ${String(claims.reduce((sum, claim) => sum + claim.citations.length, 0))} test-declaration citation(s) over ${JSON.stringify([...new Set(claims.flatMap((claim) => claim.citations.map((citation) => citation.suite)))])}, each opened at the line it states and each held to the test title that line declares, and ${String(edgeClaims.reduce((sum, claim) => sum + claim.citations.length, 0))} further line citation(s) over the eight edge claims, each opened and read back`,
    },
    ruling: {
      required: 0,
      notRequired: claims.length,
      why: [
        'No row is required, and the record therefore names no driver, no instance and no verdict path: scripts/overlay-verdict-claims.test.mjs refuses a list with no required row that names a driver, so naming one would be the opposite defect.',
        `The reason is not convenience. A required row must name the driver a control-ai-browsers run expression takes to the wave gate, and that driver must return the gate's four readings - toolElements, drawnRect, descriptor and noDevContext. Every fact the ${String(claims.length)} criteria this milestone declares is written about is a fact about the stylesheet's own text, the record that measured what it renders and the ${String(stages.length)} stage(s) of the check chain; none of them is an element's rect or a dev context, so naming a driver would make the gate return a page reading for a claim about the page's stylesheet.`,
        'The portal is not lost by that ruling: each reason names the clause that would have made a row required, and each claim names the suite, the test, the line and the commands that prove it.',
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
        assigned: [...new Set(coverage.map((row) => row.criterion))].sort(),
        missingTasks,
        disagreements,
        edgeSuites: edges.map(
          (edge) => `${edge.edge} ${EDGE_SUITES[edge.edge]}`,
        ),
      },
      edges: {
        rows: edges.length,
        criteria: [...new Set(edges.map((edge) => edge.criterion))],
        columns: EDGE_COLUMNS,
      },
      suites: MILESTONE_SUITES.map((suite) => {
        const { tests, groups } = declarationsIn(
          readText(suite, 'a suite this milestone ships and a claim cites'),
        );
        return { path: suite, tests, groups };
      }),
      stylesheet: {
        path: STYLES_REL,
        lines: stylesheet.split(/\r?\n/).length,
        bytes: Buffer.byteLength(stylesheet, 'utf8'),
        sha256: digest(stylesheet),
      },
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
        'an armed run re-derives the record from the intent this checkout binds, its five-column edge coverage, the four suites this milestone ships and the lines this checkout states, and writes it only when a value moved; a default run reads the file and asserts it is exactly what this head derives, naming the field that moved when it is not, and the writer refuses a candidate that is not the fixed point of this pin.',
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
 * Every criterion the intent declares is ruled exactly once, in the intent's order, quoting the
 * intent's own text and stating the number of characters it quoted.
 * @param {any} record @returns {void}
 */
function assertCriteriaQuoted(record) {
  const criteria = intentCriteria(sources().intentSource);
  assert.deepEqual(
    claimsOf(record).map((row) => row.criterion),
    Object.keys(criteria),
    `every criterion the intent declares is ruled exactly once: the record rules ${JSON.stringify(claimsOf(record).map((row) => row.criterion))} against ${JSON.stringify(Object.keys(criteria))}`,
  );
  for (const [index, row] of claimsOf(record).entries()) {
    assert.equal(
      row.criterionText,
      criteria[row.criterion],
      `${row.criterion} must quote the intent character for character: claims[${String(index)}].criterionText is ${JSON.stringify(row.criterionText)} and the intent states ${JSON.stringify(criteria[row.criterion])}`,
    );
    assert.equal(
      row.criterionCharacters,
      row.criterionText.length,
      `${row.criterion}: claims[${String(index)}].criterionCharacters states ${String(row.criterionCharacters)} for a quote of ${String(row.criterionText.length)}`,
    );
  }
}

/**
 * Each criterion's claim carries the edges the intent assigns it, in the intent's order, with the
 * cells the five-column table states and the suite that edge's claim names.
 * @param {any} record @returns {void}
 */
function assertClaimsCarryEdges(record) {
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
      assert.equal(
        stated.suite,
        EDGE_SUITES[edge.edge],
        `${where}'s ${edge.edge} names ${JSON.stringify(stated.suite)} as its suite, and this census states ${JSON.stringify(EDGE_SUITES[edge.edge])}`,
      );
    }
  }
}

/**
 * Every citation resolves at this head: the file is one this checkout carries, the line is the line
 * the citation states, and that line declares the test title it names.
 * @param {any} record @returns {void}
 */
function assertCitationsResolve(record) {
  for (const [index, row] of claimsOf(record).entries()) {
    const where = `${row.criterion ?? 'a row'} (claims[${String(index)}])`;
    assert.ok(
      typeof row.suite === 'string' && row.suite !== '',
      `${where} names no suite, so no test proves it`,
    );
    assert.ok(
      typeof row.test === 'string' && row.test !== '',
      `${where} names no test in ${String(row.suite)}, so the claim cites a file rather than a test`,
    );
    assert.ok(
      Array.isArray(row.citations) && row.citations.length > 0,
      `${where} carries no citation list`,
    );
    assert.equal(
      row.suite,
      row.citations[0].suite,
      `${where}: row.suite is the first citation's suite`,
    );
    assert.equal(
      row.test,
      row.citations[0].test,
      `${where}: row.test is the first citation's test`,
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
        `${where} cites ${suite}:${String(line)} as the line that declares ${JSON.stringify(citation.test)}, and that line declares ${JSON.stringify(declaredTitle(stated))}: a citation that declares no such test at this head names a test that is not there`,
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
    assert.equal(
      row.artefactPath,
      row.suite,
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
 * Every criterion's claim cites the suite each of its own edges names, and no suite outside the four
 * this milestone ships.
 * @param {any} record @returns {void}
 */
function assertClaimsCiteTheirEdges(record) {
  const edges = intentEdges(sources().intentSource);
  for (const row of claimsOf(record)) {
    const where = row.criterion;
    const cited = row.citations.map(
      (/** @type {any} */ citation) => citation.suite,
    );
    for (const edge of edges.filter((one) => one.criterion === where)) {
      assert.ok(
        cited.includes(EDGE_SUITES[edge.edge]),
        `${where} is held by ${edge.edge}, which ${EDGE_SUITES[edge.edge]} proves, and the claim cites ${JSON.stringify(cited)}: a criterion must cite the suite that proves each of its edges`,
      );
    }
    for (const suite of cited) {
      assert.ok(
        MILESTONE_SUITES.includes(suite),
        `${where} cites ${suite}, which is not one of the four suites this milestone ships (${JSON.stringify(MILESTONE_SUITES)})`,
      );
    }
  }
}

/**
 * One claim per edge the intent declares, each with the table's cells, its suite's test declared at
 * the line it states, its lines read back, and the absence recorded where the tree carries none.
 * @param {any} record @returns {void}
 */
function assertEdgeClaims(record) {
  const edges = intentEdges(sources().intentSource);
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
    assert.equal(
      row.suite,
      EDGE_SUITES[edge.edge],
      `${edge.edge} names ${JSON.stringify(row.suite)} as the suite that proves it, and this census states ${JSON.stringify(EDGE_SUITES[edge.edge])}`,
    );
    assert.ok(
      typeof row.claim === 'string' && row.claim.trim().length >= 40,
      `${edge.edge} states no claim`,
    );
    // The suite the claim names declares the test it names, on the line it states.
    const { titles } = declarationsIn(
      readText(
        row.suite,
        `${edge.edge} names it as the suite that proves the edge`,
      ),
    );
    assert.ok(
      titles.includes(row.test),
      `${edge.edge} cites ${row.suite} for ${JSON.stringify(row.test)}, and that suite declares no such test at this head: it declares ${JSON.stringify(titles)}`,
    );
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
    assert.equal(
      row.absence,
      null,
      `${edge.edge} records an absence (${JSON.stringify(row.absence)}), and this head carries an instance of every edge the intent declares: an absence here would state that a fact this tree holds was not measured`,
    );
  }
}

/**
 * The record's own chain: the milestone it is numbered for, the commands that captured and read it,
 * the file it is, and a ruling whose counts agree with its rows.
 * @param {any} record @returns {void}
 */
function assertCaptureChain(record) {
  assert.equal(
    record.milestone,
    MILESTONE,
    `the record names ${JSON.stringify(record.milestone)} and its file is numbered for ${MILESTONE}`,
  );
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
 * The plan and stylesheet evidence the record states: the held-out keys it read, the coverage rows,
 * the tasks they name, the suites it resolved, and the sheet's own digest.
 * @param {any} record @returns {void}
 */
function assertPlanEvidence(record) {
  const { planSource, planPath, tasksDir } = sources();
  const edges = intentEdges(sources().intentSource);
  const heldOut = planHeldOut(planSource);
  const coverage = planCoverage(planSource);
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
    record.evidence?.plan?.missingTasks,
    [],
    `the record states the tasks the plan names but this checkout does not carry, and it states ${JSON.stringify(record.evidence?.plan?.missingTasks)}: ${JSON.stringify([...new Set(coverage.map((row) => row.task))])} are all present under ${shown(tasksDir)}`,
  );
  const disagreements = planDisagreements(edges, heldOut, coverage);
  assert.deepEqual(
    record.evidence?.plan?.disagreements,
    disagreements,
    `evidence.plan.disagreements must state the plan's cross-table disagreements as this head derives them: it states ${JSON.stringify(record.evidence?.plan?.disagreements)} and this head derives ${JSON.stringify(disagreements)} - the census scripts/navigation-blocking.test.mjs holds this field to its own derivation`,
  );
  assert.ok(
    String(record.quotes?.edges ?? '').includes(
      `disagree at ${String(disagreements.length)} row(s)`,
    ),
    `the record states the disagreement count in the sentence that reads the two tables, and it does not state ${JSON.stringify(`disagree at ${String(disagreements.length)} row(s)`)}`,
  );
  assert.deepEqual(
    Object.fromEntries(
      (record.evidence?.plan?.edgeSuites ?? []).map(
        (/** @type {string} */ one) => one.split(' '),
      ),
    ),
    EDGE_SUITES,
    `the record states the suite each edge is proved by as this census states them: it states ${JSON.stringify(record.evidence?.plan?.edgeSuites)}`,
  );
  assert.deepEqual(
    record.evidence?.plan?.edgeSuites,
    edges.map((edge) => `${edge.edge} ${EDGE_SUITES[edge.edge]}`),
    `the record states one suite per edge, in the intent's order: it states ${JSON.stringify(record.evidence?.plan?.edgeSuites)}`,
  );
  assert.equal(
    record.evidence?.plan?.path,
    recordedSpelling(shown(planPath)),
    `the record states the plan it read at the location it was captured at, and it states ${JSON.stringify(record.evidence?.plan?.path)}`,
  );
  assert.deepEqual(
    record.evidence?.absences,
    [],
    `the record states the edges its absences are recorded under, and it states ${JSON.stringify(record.evidence?.absences)}: every edge of this intent has an instance in this tree`,
  );
  const stylesheet = readText(
    STYLES_REL,
    'the stylesheet the record states a digest of',
  );
  assert.equal(
    record.evidence?.stylesheet?.sha256,
    digest(stylesheet),
    `the record states the stylesheet digest it was captured over, and ${STYLES_REL} is ${digest(stylesheet)} at this head: re-capture with ${CAPTURE_COMMAND}`,
  );
  assert.equal(
    record.evidence?.stylesheet?.lines,
    stylesheet.split(/\r?\n/).length,
    `the record states ${String(record.evidence?.stylesheet?.lines)} line(s) for ${STYLES_REL} and this head reads ${String(stylesheet.split(/\r?\n/).length)}`,
  );
}

/**
 * The whole record is what this head derives, byte for byte, and its artefact resolves.
 * @param {any} record @returns {void}
 */
function assertDerivesAtThisHead(record) {
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
 * Every pin above, over one record: what the armed writer refuses to write and what a default run
 * holds the committed bytes to.
 * @param {any} record @returns {void}
 */
function assertRecordPins(record) {
  assertCriteriaQuoted(record);
  assertClaimsCarryEdges(record);
  assertCitationsResolve(record);
  assertClaimsCiteTheirEdges(record);
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
 * fixed point of the pin this suite's default run holds, so a capture can never write bytes its
 * reader then calls wrong.
 * @param {string} path
 * @returns {{ wrote: boolean, before: string | null, after: string, moved: string }}
 */
function captureClaims(path) {
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
  it('derives the milestone from the branch the state file binds, and refuses another', () => {
    assert.equal(
      MILESTONE,
      OWN_MILESTONE,
      `the bound branch names ${MILESTONE} and this census is ${OWN_MILESTONE}'s`,
    );
    for (const other of ['M063', 'M068', 'M070']) {
      const failure = reddens(
        () => refuseUnlessOwn(other),
        `a branch binding ${other}`,
      );
      assert.ok(
        failure.message.includes(other) &&
          failure.message.includes(OWN_MILESTONE),
        `the refusal must name the bound milestone and the one this census owns; it produced ${JSON.stringify(failure.message.slice(0, 240))}`,
      );
    }
    console.log(
      `${SUITE_REL}: bound to ${MILESTONE} by the state file's branch line, and a branch naming another milestone is refused`,
    );
  });

  it('reads the criteria, the edge rows, the plan coverage and the four suites this milestone ships', () => {
    const { intentSource, planSource } = sources();
    const criteria = intentCriteria(intentSource);
    const edges = intentEdges(intentSource);
    const coverage = planCoverage(planSource);
    const heldOut = planHeldOut(planSource);

    assert.deepEqual(
      Object.keys(criteria),
      ['SC1', 'SC2', 'SC3', 'SC4'],
      'the intent declares four criteria, and every one of them is ruled',
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
      'the plan must assign its criteria in ## Intent coverage, or the record cites no task',
    );
    for (const suite of MILESTONE_SUITES) {
      assert.ok(
        existsSync(absPath(suite)),
        `${suite} is one of the four suites this milestone ships, and this checkout does not carry it`,
      );
      assert.ok(
        Object.values(EDGE_SUITES).includes(suite),
        `${suite} is projected by no edge: the four suites must be the ones the edge table names, and it names ${JSON.stringify([...new Set(Object.values(EDGE_SUITES))])}`,
      );
    }
    console.log(
      `${MILESTONE}: ${String(Object.keys(criteria).length)} criteria, ${String(edges.length)} edge claim(s), ${String(heldOut.size)} held-out row(s), ${String(coverage.length)} coverage row(s), suites ${JSON.stringify(MILESTONE_SUITES)}`,
    );
  });

  it('reads the stylesheet the token layer lives in, and the record measured before it landed', () => {
    for (const rel of [STYLES_REL, BASELINE_REL]) {
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
      `${MILESTONE}: held to ${shown(intentPath)} and ${shown(planPath)}; the stylesheet ${STYLES_REL} and the baseline ${BASELINE_REL} are here`,
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

  it('cites the suite each edge is proved by, and states the plan evidence it read', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertClaimsCiteTheirEdges(recorded));
    assert.doesNotThrow(() => assertPlanEvidence(recorded));
    assert.doesNotThrow(() => assertCaptureChain(recorded));
    console.log(
      `${CLAIMS_REL}: edge suites ${JSON.stringify(recorded.evidence.plan.edgeSuites)}; missing tasks ${JSON.stringify(recorded.evidence.plan.missingTasks)}`,
    );
  });

  it('carries one claim per edge, with its lines read back and no absence stated', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertEdgeClaims(recorded));
    console.log(
      `${CLAIMS_REL}: ${String(recorded.edgeClaims.length)} edge claim(s), absences on ${JSON.stringify(recorded.evidence.absences)}, ${String(recorded.edgeClaims.reduce((sum, /** @type {any} */ row) => sum + row.citations.length, 0))} line citation(s)`,
    );
  });

  it('the pins are different checks rather than one check listed twice', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    const pins = [
      () => assertCriteriaQuoted(recorded),
      () => assertClaimsCarryEdges(recorded),
      () => assertCitationsResolve(recorded),
      () => assertClaimsCiteTheirEdges(recorded),
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

// ------------------------------------------------------------------- mutants ----

describe('the mutants', () => {
  it('a claim quoting its criterion in its own words reddens naming the claim and the field', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
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
    assert.ok(
      failure.message.includes(absent),
      `the refusal must name the test that is missing; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );

    assert.doesNotThrow(() => assertCitationsResolve(recorded));
    console.log(
      `citation mutants: ${drifted.message.split('\n')[0]} | ${failure.message.split('\n')[0]}`,
    );
  });

  it('a claim that drops the suite its edge names reddens naming the criterion and both suites', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertClaimsCiteTheirEdges(recorded));

    const planted = clone(recorded);
    const row = planted.claims[0];
    const resolved = EDGE_SUITES.E1;
    row.citations = row.citations.filter(
      (/** @type {any} */ citation) => citation.suite !== resolved,
    );
    assert.ok(
      !row.citations.some(
        (/** @type {any} */ citation) => citation.suite === resolved,
      ),
      'the planted claim must no longer cite the suite its edge names',
    );

    const failure = reddens(
      () => assertClaimsCiteTheirEdges(planted),
      'a claim that drops the suite its edge names',
    );
    assert.ok(
      failure.message.includes(row.criterion),
      `the refusal must name the criterion; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes(resolved),
      `the refusal must name the suite the edge names; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );

    assert.doesNotThrow(() => assertClaimsCiteTheirEdges(recorded));
    console.log(`dropped-edge-suite mutant: ${failure.message.split('\n')[0]}`);
  });

  it('an edge claim naming another suite reddens naming the edge and both suites', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertEdgeClaims(recorded));

    const planted = clone(recorded);
    const row = planted.edgeClaims[0];
    row.suite = 'scripts/panel-styles.test.mjs';
    assert.notEqual(
      row.suite,
      EDGE_SUITES.E1,
      'the planted suite must differ from the one this census states, or the mutant is a no-op',
    );

    const failure = reddens(
      () => assertEdgeClaims(planted),
      'an edge claim naming a suite its edge is not proved by',
    );
    assert.ok(
      failure.message.includes(row.edge),
      `the refusal must name the edge; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes(EDGE_SUITES.E1),
      `the refusal must name the suite this census states; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );

    assert.doesNotThrow(() => assertEdgeClaims(recorded));
    console.log(`moved-edge-suite mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a claim whose edge cells are not the intent’s reddens naming the criterion and the edge', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
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

  it('a dropped disagreements list reddens naming the field the plan evidence lost', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertPlanEvidence(recorded));

    const planted = clone(recorded);
    delete planted.evidence.plan.disagreements;
    const failure = reddens(
      () => assertPlanEvidence(planted),
      'a record that states no cross-table disagreements',
    );
    assert.match(
      failure.message,
      /evidence\.plan\.disagreements/,
      `the refusal must name the field that moved; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );

    const silent = clone(recorded);
    silent.quotes.edges = 'the edge rows were read';
    const second = reddens(
      () => assertPlanEvidence(silent),
      'a record whose sentence stops stating the disagreement count',
    );
    assert.ok(
      second.message.includes('disagree at'),
      `the refusal must name the count the sentence lost; it produced ${JSON.stringify(second.message.slice(0, 320))}`,
    );

    assert.doesNotThrow(() => assertPlanEvidence(recorded));
    console.log(
      `disagreements mutants: ${failure.message.split('\n')[0]} | ${second.message.split('\n')[0]}`,
    );
  });

  it('a measured instance replaced by an absence reddens naming the edge and the field', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertEdgeClaims(recorded));

    const planted = clone(recorded);
    const row = planted.edgeClaims[0];
    row.absence = {
      part: 'an instance this head does not carry',
      searched: 'a search that was not made at this head, and states so',
      found:
        'nothing, which is not what this tree carries for an edge it holds',
    };

    const failure = reddens(
      () => assertEdgeClaims(planted),
      'a measured instance recorded as an absence',
    );
    assert.ok(
      failure.message.includes(row.edge),
      `the refusal must name the edge; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes('absence'),
      `the refusal must name the field that moved; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );

    assert.doesNotThrow(() => assertEdgeClaims(recorded));
    console.log(`absence mutant: ${failure.message.split('\n')[0]}`);
  });
});

// ---------------------------------------------------------------- the writer ----

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
