# Review — wave 4, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1

## T004 — Record the checks' behaviour, rule the claims, and run the project verify: pass

- ✅ landed at `a6e9d7b3`; `gsd land-check --task-id T004` PASS; three suites 56 / 56; `npm run check` exit 0; the claims file `research/raw/m044-verdict-claims.json` (19,400 B) satisfies `overlay-verdict-claims.test.mjs`'s parser and turns its last two tests green
- ✅ the fix-record stage refused T004's own claim while the claims file was uncommitted (`claim-absent-from-the-range`) and cleared the moment the file entered the range — the check behaving as designed rather than as a false positive

## Intent coverage

### SC1 — A committed test that resolves a `.project/` path the milestone's own archive move deletes fails the ship gate, naming the file and the path; a milestone whose tests reference no such path passes the same check.: pass
- ✅ Covered by T004; evidence recorded above and in the task Log at its landing commit.

### SC2 — A task log claiming a file change absent from the milestone's range fails the ship gate, naming the task and the file.: pass
- ✅ Covered by T004; evidence recorded above and in the task Log at its landing commit.

### SC3 — The archive-path and fix-record checks run inside the gate rather than as advisory output, so neither defect can reach `ship/done` while the check is red.: pass
- ✅ Covered by T004; evidence recorded above and in the task Log at its landing commit.

### SC4 — A navigation terminal for an already-ended navigation id produces a finding naming the skipped navigation, proven by a pin fed from `research/raw/m041-navigation.json` rather than from a hand-built event list.: pass
- ✅ Covered by T004; evidence recorded above and in the task Log at its landing commit.

### SC5 — Each check reddens a synthetic regression that reproduces its measured instance, and the failure names the file and the claim — proven by removing the synthetic regression and observing the check green again.: pass
- ✅ Covered by T004; evidence recorded above and in the task Log at its landing commit.

### SC6 — No existing assertion is weakened to make a check pass: the change to the shipped suites is limited to replacing the one probe-shaped navigation pin with one fed from the recording.: pass
- ✅ Covered by T004; evidence recorded above and in the task Log at its landing commit.
