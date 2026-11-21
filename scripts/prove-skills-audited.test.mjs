// @ts-check
// Run: node --test scripts/prove-skills-audited.test.mjs
//
// M058 T007 pins the docs audit's coverage of the four proof skills. The rows are landed and
// `check_docs_audit.py` passes over the document, so the coverage survives only for as long as
// someone chooses to run that gate: a later audit edit that drops one of the four documents reddens
// nothing `npm test` runs on its own. This suite is that pin.
//
// One reader, one coverage check, three cases. `readAudit` takes the audit as text and answers two
// things and never a guess: the documents the audit covers — the paths its `## Doc:` headings name
// beside the paths its `## Descriptive docs` bullets carry — and the Summary's
// `descriptive docs (no testable claims)` row read as a number. The list's size is counted from the
// bullets the section carries rather than typed twice, so the two halves of the count cannot drift
// apart silently.
//
// `assertAuditCoversProofSkills` walks the four proof-skill documents and refuses one sentence per
// document it cannot find, and that sentence names the document — which is the whole point of the
// pin:
//
//   the docs audit must cover <skill>: neither a ## Doc: heading nor a ## Descriptive docs entry
//   names it
//
// The second case holds the Summary's tally to the list it describes. The third is the pin's own
// proof: on a copy of the audit held in memory, with the `prove-join-absence-folding` bullet removed
// and the tally left untouched, the same coverage check is driven again, and the refusal it raises is
// asserted to read, exactly, the sentence naming the skill that went missing rather than the count
// that moved with it.
//
// The audit is opened for reading only: every mutation is a string, the file is never written, and
// the mutant case's last assertion re-reads the document's bytes to say so.
//
// The audit is *resolved* rather than opened by name, the way the docs-audit disposition suite
// resolves it: the live `.project/research` copy while the milestone is live, the newest archived
// copy once the ship flow has moved the subtree. M044's archive-path check reddens a suite that reads
// a live `.project` path directly, because the move deletes it.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = join(fileURLToPath(new URL('..', import.meta.url)));

/**
 * The four proof-skill documents this milestone lands: one property, one bound and one command each,
 * so each reads as a descriptive document rather than as a claim a test could contradict.
 */
const PROOF_SKILLS = Object.freeze([
  '.commandcode/skills/prove-join-absence-folding/SKILL.md',
  '.commandcode/skills/prove-console-cannot-tell/SKILL.md',
  '.commandcode/skills/prove-overlay-observer-purity/SKILL.md',
  '.commandcode/skills/prove-graph-serialize-closure/SKILL.md',
]);

/** The document the mutant removes: the contract names it, and the refusal below must name it too. */
const MUTATED_SKILL = '.commandcode/skills/prove-join-absence-folding/SKILL.md';

/** The two headings the reader reads, and the one Summary row the count is read from. */
const DESCRIPTIVE_HEADING = 'Descriptive docs';
const SUMMARY_HEADING = 'Summary';
const DESCRIPTIVE_ROW =
  /^\|\s*descriptive docs \(no testable claims\)\s*\|\s*(\d+)\s*\|$/;

/**
 * The artefact where this checkout carries it: the live `.project/<subtree>` copy while the milestone
 * is live, and the newest archive copy once the ship flow has moved the subtree into
 * `.project/archive/<NNN>-<slug>/`. Which copy exists is decided here, at read time, and an artefact
 * that is nowhere fails naming the path it tried rather than reading nothing.
 *
 * @param {string} relative the artefact's path from the repository root, `.project` first
 * @returns {string} the absolute path of the copy this checkout carries
 */
function resolveArtefact(relative) {
  const segments = relative.split('/');
  const live = join(repoRoot, ...segments);
  const archives = join(repoRoot, '.project', 'archive');
  const copies = existsSync(archives)
    ? readdirSync(archives, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
        .reverse()
        .map((name) => join(archives, name, ...segments.slice(1)))
        .filter((path) => existsSync(path))
    : [];
  const found = [live, ...copies].find((path) => existsSync(path));

  assert.ok(
    found,
    `${relative} must exist: this checkout carries neither ${live} nor a copy under ${archives}`,
  );

  return found;
}

/** The audit this suite reads, resolved once and never written. */
const auditPath = resolveArtefact('.project/research/DOCS-AUDIT.md');
const auditText = readFileSync(auditPath, 'utf8');

/** The audit's own line ending, so a copy mutated in memory is rejoined as the file was written. */
/**
 * @param {string} text
 * @returns {string}
 */
function eolOf(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

/** The audit as lines, whatever ending the checkout's copy carries. */
/**
 * @param {string} text
 * @returns {string[]}
 */
function linesOf(text) {
  return text.split(/\r?\n/);
}

/**
 * One `## <title>` section's body: the lines after its heading and before the next one, so a bullet
 * count reads the list rather than the whole document.
 *
 * @param {string} text
 * @param {string} title
 * @returns {string[]}
 */
function sectionBody(text, title) {
  const lines = linesOf(text);
  const start = lines.findIndex((line) => line.trimEnd() === `## ${title}`);

  assert.notEqual(
    start,
    -1,
    `the docs audit carries a ## ${title} section, and the copy this suite read does not`,
  );

  /** @type {string[]} */
  const body = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    if (/^## /.test(line)) break;
    body.push(line);
  }
  return body;
}

/**
 * A cell's path, as the gate reads it: trimmed, and stripped of the backticks that quote it.
 *
 * @param {string} cell
 * @returns {string}
 */
function pathOf(cell) {
  return cell.trim().replace(/^`+|`+$/g, '');
}

/**
 * The paths the audit's `## Doc:` headings name, in the order it lists them.
 *
 * @param {string} text
 * @returns {string[]}
 */
function docSections(text) {
  /** @type {string[]} */
  const paths = [];
  for (const line of linesOf(text)) {
    const match = /^## Doc: (.+?)\s*$/.exec(line);
    if (match !== null) paths.push(pathOf(match[1] ?? ''));
  }
  return paths;
}

/**
 * The paths the `## Descriptive docs` bullets carry, counted from the bullets the section carries
 * rather than typed a second time anywhere.
 *
 * @param {string} text
 * @returns {string[]}
 */
function descriptiveEntries(text) {
  /** @type {string[]} */
  const paths = [];
  for (const line of sectionBody(text, DESCRIPTIVE_HEADING)) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) paths.push(pathOf(trimmed.slice(2)));
  }
  return paths;
}

/**
 * The Summary's `descriptive docs (no testable claims)` row read as a number. A missing row or two of
 * them is refused rather than answered with a zero, so a copy the reader cannot read never looks like
 * a tally of nothing.
 *
 * @param {string} text
 * @returns {number}
 */
function summaryDescriptiveCount(text) {
  const rows = sectionBody(text, SUMMARY_HEADING).filter((line) =>
    DESCRIPTIVE_ROW.test(line.trim()),
  );

  assert.equal(
    rows.length,
    1,
    `the Summary carries exactly one "descriptive docs (no testable claims)" row, and the copy this suite read carries ${rows.length}`,
  );

  const digits = DESCRIPTIVE_ROW.exec((rows[0] ?? '').trim())?.[1];
  assert.ok(
    digits !== undefined,
    'the Summary row for the descriptive documents states its count as a number',
  );

  return Number(digits);
}

/**
 * @typedef {object} Audit
 * @property {string[]} docs the paths the `## Doc:` headings name.
 * @property {string[]} descriptive the paths the `## Descriptive docs` bullets carry.
 * @property {number} descriptiveCount the Summary's own tally of those entries.
 */

/**
 * The audit read once: the two lists it states, and the tally it states beside them.
 *
 * @param {string} text
 * @returns {Audit}
 */
function readAudit(text) {
  const docs = docSections(text);
  const descriptive = descriptiveEntries(text);
  const descriptiveCount = summaryDescriptiveCount(text);
  return { docs, descriptive, descriptiveCount };
}

/**
 * One proof skill, held to the audit's coverage: a `## Doc:` heading or a `## Descriptive docs` entry
 * must name it. The refusal is one sentence, and it names the document — a pin that only says a skill
 * went missing is a pin nobody can act on.
 *
 * @param {Audit} audit
 * @param {string} skill
 */
function assertCovered(audit, skill) {
  assert.ok(
    audit.docs.includes(skill) || audit.descriptive.includes(skill),
    `the docs audit must cover ${skill}: neither a ## Doc: heading nor a ## Descriptive docs entry names it`,
  );
}

/**
 * The coverage check the three cases below drive, and the one the mutant is proven on: every proof
 * skill covered, then the audit it was read from answered back.
 *
 * @param {string} text
 * @returns {Audit}
 */
function assertAuditCoversProofSkills(text) {
  const audit = readAudit(text);
  for (const skill of PROOF_SKILLS) assertCovered(audit, skill);
  return audit;
}

/**
 * The audit with one `## Descriptive docs` bullet removed from an in-memory copy: the bullet's own
 * line and the indented lines that continue it, and nothing else. The Summary's tally is left
 * untouched on purpose — a list that shrinks without its tally and a tally that grows without its
 * list are the same drift read from either end, so the mutant moves one end only and the refusal that
 * follows must name the document rather than the count.
 *
 * @param {string} text
 * @param {string} skill the path the bullet names
 * @returns {string}
 */
function withoutDescriptiveEntry(text, skill) {
  const lines = linesOf(text);
  const start = lines.findIndex((line) => {
    const trimmed = line.trim();
    return trimmed.startsWith('- ') && pathOf(trimmed.slice(2)) === skill;
  });

  assert.notEqual(
    start,
    -1,
    `the docs audit lists ${skill} as a ## Descriptive docs bullet, so the mutant has one to remove`,
  );

  let end = start + 1;
  while (end < lines.length) {
    const line = lines[end] ?? '';
    if (!/^\s/.test(line) || line.trim() === '') break;
    end += 1;
  }

  return [...lines.slice(0, start), ...lines.slice(end)].join(eolOf(text));
}

test('the docs audit covers each of the four proof skills, as a ## Doc: heading or a ## Descriptive docs entry', () => {
  const audit = assertAuditCoversProofSkills(auditText);

  // Covered once, not twice: a document named in both lists makes "covered" unreadable, and the
  // audit's own gate refuses the overlap for the same reason.
  for (const skill of PROOF_SKILLS)
    assert.ok(
      !(audit.docs.includes(skill) && audit.descriptive.includes(skill)),
      `${skill} is covered once: the audit names it under a ## Doc: heading and again in the ## Descriptive docs list, so neither reading says which coverage holds it`,
    );

  const listed = PROOF_SKILLS.filter((skill) =>
    audit.descriptive.includes(skill),
  ).length;
  console.log(
    `T007 coverage: ${PROOF_SKILLS.length}/${PROOF_SKILLS.length} proof skills covered, ` +
      `${listed} of them as ## Descriptive docs entries, ` +
      `of ${audit.descriptive.length} entries and ${audit.docs.length} ## Doc: sections`,
  );
});

test("the docs audit's descriptive count is the number of entries its ## Descriptive docs list carries", () => {
  const audit = readAudit(auditText);

  assert.ok(
    audit.descriptive.length >= PROOF_SKILLS.length,
    `the ## Descriptive docs list carries ${audit.descriptive.length} entries and the four proof skills alone are ${PROOF_SKILLS.length} of them`,
  );
  assert.equal(
    audit.descriptiveCount,
    audit.descriptive.length,
    `the Summary's descriptive count reads ${audit.descriptiveCount} and the ## Descriptive docs list carries ${audit.descriptive.length} entries: a list that grew without its tally and a tally that grew without its list are one drift, so neither is left to a reader to notice`,
  );

  console.log(
    `T007 count: the Summary says ${audit.descriptiveCount} descriptive docs and the list carries ${audit.descriptive.length}`,
  );
});

test('the pin fails, naming the skill and not the tally, when one proof skill is removed from a copy of the audit', () => {
  // The unmutated text passes through the same check first, so the failure below is the mutation's
  // and not a pin that was already red.
  assertAuditCoversProofSkills(auditText);

  const mutated = withoutDescriptiveEntry(auditText, MUTATED_SKILL);

  // The mutation is measured before it is believed: the document is gone from the copy, and the
  // Summary's tally still states the count it stated, so the refusal that follows cannot be read as
  // the count's.
  assert.ok(
    !mutated.includes(MUTATED_SKILL),
    `the mutant removed the ${MUTATED_SKILL} bullet from the copy in memory, and the copy still names it`,
  );
  assert.equal(
    summaryDescriptiveCount(mutated),
    summaryDescriptiveCount(auditText),
    `the mutant leaves the Summary's descriptive count untouched, and the copy reads ${summaryDescriptiveCount(mutated)} against the audit's ${summaryDescriptiveCount(auditText)}`,
  );
  assert.equal(
    descriptiveEntries(mutated).length,
    descriptiveEntries(auditText).length - 1,
    'the mutant removes exactly one bullet from the ## Descriptive docs list, so the list and the untouched tally disagree',
  );

  /** @type {Error | null} */
  let failure = null;
  try {
    assertAuditCoversProofSkills(mutated);
  } catch (error) {
    failure = /** @type {Error} */ (error);
  }

  assert.ok(
    failure !== null,
    'the mutated audit must redden the coverage check, and it reddened nothing',
  );
  assert.equal(
    String(failure.message),
    `the docs audit must cover ${MUTATED_SKILL}: neither a ## Doc: heading nor a ## Descriptive docs entry names it`,
    `the refusal must name ${MUTATED_SKILL} and not the count, and it said: ${String(failure.message)}`,
  );

  // The audit is opened for reading only: this run mutated strings, so the document's bytes after the
  // run are its bytes before it.
  assert.equal(
    readFileSync(auditPath, 'utf8'),
    auditText,
    `the suite reads ${auditPath} and never writes it, and the document's bytes changed while this run held its copy`,
  );

  console.log(`T007 mutant: ${String(failure.message)}`);
});
