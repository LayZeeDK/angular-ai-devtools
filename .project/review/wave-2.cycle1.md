# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1

## T002 — Build the archive-path and fix-record checks: pass

- ✅ landed at `9bb3c3f1`; `gsd land-check --task-id T002` PASS; 19 tests / 19 pass at landing; `npx prettier --check` clean; `npm run check` exit 0; the only edit inside wave one's suite is the key-sorted comparator that stops `archiveReferences.sites` reddening on `git ls-files` insertion order
- ✅ `checkArchivePaths` distinguishes a read from a naming: `scripts/performance-capture.test.mjs:1978` names the live path to assert `intentPathForMilestone(ROOT,'M040') !== live` and comes back clean, while `scripts/navigation-capture.test.mjs:1763` copies it and comes back a finding naming the file, the line and `copyFileSync`

## Intent coverage

### SC1 — A committed test that resolves a `.project/` path the milestone's own archive move deletes fails the ship gate, naming the file and the path; a milestone whose tests reference no such path passes the same check.: pass
- ✅ Covered by T002; evidence recorded above and in the task Log at its landing commit.

### SC2 — A task log claiming a file change absent from the milestone's range fails the ship gate, naming the task and the file.: pass
- ✅ Covered by T002; evidence recorded above and in the task Log at its landing commit.

### SC5 — Each check reddens a synthetic regression that reproduces its measured instance, and the failure names the file and the claim — proven by removing the synthetic regression and observing the check green again.: pass
- ✅ Covered by T002; evidence recorded above and in the task Log at its landing commit.
