import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();

/**
 * Provenance, recorded and never read: the milestone record this suite describes was added at
 * `.project/archive/001-run-unrun-spikes` (`MANIFEST.md`: "Milestone: run-unrun-spikes", shipped 2026-10-18).
 * Until T004 the suite reached for that path with `existsSync`, so it was red exactly when the ship flow moved
 * the directory out of the working tree — INTENT SC3, prohibition N1. The claim worth keeping was never the
 * directory's presence: it is the *order* of two commits, and git records that in its object database wherever
 * `.project/` happens to live. So the suite carries the two commits as the data it asserts and asks git.
 */

/** `ship: M001 — run-unrun-spikes` (2026-10-18): added the archived milestone record. */
const ARCHIVE_COMMIT = "a24cedb6317481c8bf72b1e98a0f0c76b3119c60";
const ARCHIVE_SUBJECT = "ship: M001 — run-unrun-spikes";

/** `T005: Retire spikes/s1-extension after its evidence is archived` (2026-10-29): removed the spike tree. */
const RETIRE_COMMIT = "c3e8f576cf6eafa194d9889c242202e11f7b476e";
const RETIRE_SUBJECT = "T005: Retire spikes/s1-extension after its evidence is archived";

/** The spike tree the archive replaced. Read from the working tree only — it holds no `.project` path. */
const RETIRED_SPIKE = "spikes/s1-extension";

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

/**
 * Whether `ancestor` is reachable from `descendant` — the ordering claim, asked of git rather than of a path.
 * @param {string} ancestor
 * @param {string} descendant
 * @returns {boolean}
 */
function isAncestor(ancestor, descendant) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], { cwd: ROOT, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

test("E7: archive commit is an ancestor of HEAD and spike tree is gone", () => {
  // The data this suite carries names two commits; if either resolves to something else, the ordering it
  // asserts below would be about the wrong history, so the subjects are checked before the order is.
  assert.equal(git(["cat-file", "-t", ARCHIVE_COMMIT]), "commit", `E7: ${ARCHIVE_COMMIT} (archive commit) is not in this repository`);
  assert.equal(git(["show", "-s", "--format=%s", ARCHIVE_COMMIT]), ARCHIVE_SUBJECT, `E7: ${ARCHIVE_COMMIT} is not the archive commit`);
  assert.equal(git(["cat-file", "-t", RETIRE_COMMIT]), "commit", `E7: ${RETIRE_COMMIT} (retirement commit) is not in this repository`);
  assert.equal(git(["show", "-s", "--format=%s", RETIRE_COMMIT]), RETIRE_SUBJECT, `E7: ${RETIRE_COMMIT} is not the retirement commit`);

  // The order: the milestone was archived before the spike tree it replaces was retired, and both are behind
  // HEAD. A history where either commit is missing from HEAD's ancestry is the ordering being wrong.
  assert.ok(isAncestor(ARCHIVE_COMMIT, "HEAD"), `E7: archive commit ${ARCHIVE_COMMIT} is not an ancestor of HEAD`);
  assert.ok(isAncestor(RETIRE_COMMIT, "HEAD"), `E7: retirement commit ${RETIRE_COMMIT} is not an ancestor of HEAD`);
  assert.ok(
    isAncestor(ARCHIVE_COMMIT, RETIRE_COMMIT),
    `E7: archive commit ${ARCHIVE_COMMIT} does not precede the retirement ${RETIRE_COMMIT}, so the claim was archived after it was retired`,
  );

  // The retirement removed the tree, and the tree is still gone from the working tree. Git records files
  // rather than directories, so the tree is deleted when that commit deletes files under it and nothing else.
  const deleted = git(["show", "--format=", "--name-only", "--diff-filter=D", RETIRE_COMMIT, "--", RETIRED_SPIKE])
    .split("\n")
    .filter(Boolean);
  assert.ok(deleted.length > 0, `E7: ${RETIRE_COMMIT} deleted no file under ${RETIRED_SPIKE}`);
  assert.deepEqual(
    deleted.filter((path) => !path.startsWith(`${RETIRED_SPIKE}/`)),
    [],
    `E7: ${RETIRE_COMMIT} deleted files outside ${RETIRED_SPIKE}`,
  );
  assert.ok(!existsSync(resolve(ROOT, RETIRED_SPIKE)), "E7: spikes/s1-extension still exists");
});
