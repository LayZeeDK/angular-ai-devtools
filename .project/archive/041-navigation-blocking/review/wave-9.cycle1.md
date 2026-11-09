# Review — wave 9, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 4d7860a28fefd6c6c8773996666de6a151c6b8a6
Wave task: T005 (landed `4d7860a`)

Wave 9 is the closing wave: T005 re-captures behind an opt-in switch, rules the claims against the portal clause, authors the archive's required synthesis, and records the project gate at the head the repairs leave.

It carries SC6 and closes it: this is the wave where both halves of the criterion — `npm run check` and `npm test` — are measured at one head.

## T005 — Re-capture behind an opt-in switch, rule the claims and close the gate: pass

- ✅ `git show --stat 4d7860a` reports the landing as `.project/tasks/T005-re-capture-rule-the-claims-and-close-the-gate.md` only (4 insertions): the artefacts this task audits were already in the tree at that commit, carried by the two `checkpoint:` commits of the blocked build — `research/raw/m041-verdict-claims.json` and `scripts/navigation-capture.test.mjs` added at `758dd84`, `.project/research/SYNTHESIS.md` at `732cf3f` — and the landing is the reading of the gate over them. `git cat-file -e 4d7860a:research/raw/m041-verdict-claims.json`, `…:.project/research/SYNTHESIS.md` and `…:scripts/navigation-capture.test.mjs` all exit 0.
- ✅ The gate is green at the landed commit: `.project/build/verify-ledger.jsonl:9` records `node --check scripts/navigation-capture.test.mjs && node --experimental-strip-types --test … && npx prettier --check scripts/navigation-capture.test.mjs && npm run check && npm test` with `"result": "pass"` at `4d7860a28fefd6c6c8773996666de6a151c6b8a6`, recorded `2026-11-09T09:45:05+00:00`.
- ✅ Every leg of that gate exited 0 with its own count: `.project/tasks/T005-re-capture-rule-the-claims-and-close-the-gate.md:164` records leg 1 at 1,197 tests over 183 suites, leg 2 (`run-user-scope-tests.mjs`) 60 over 9, leg 3 (`test:skills`) 628, leg 4 (`test:app`) 345 over 31 files, and leg 5 (`test:held-out`) 85 over 22 suites — 1,197 + 60 + 628 + 345 + 85, with E3 at 3m42s and E4 at 9m11s inside that leg.
- ✅ `npm run check` at this head: exit 0, run twice in this review pass, ending `verification gate (structure): pass` and `All matched files use Prettier code style!`. The `npm test` reading above is the recorded one from ledger row 9 and the task Log; it was not re-run in this pass, and that is stated rather than implied.
- ✅ The unarmed capture writes nothing and the artefacts are byte-identical: re-hashed at this head, `research/raw/m041-navigation.json` is sha256 `1eb9b8a9078de66512c978df77f67bbede8f499c485200aeffd5b84fec4155bf` at 85,762 B and `research/raw/m041-verdict-claims.json` is sha256 `b176cbac6746a2f91c9819b59781c340901f96b4534016d6c1ab85755fa07067` at 16,545 B — the same two hashes the task Log records before and after an unarmed run — and `node --experimental-strip-types --test "scripts/navigation-capture.test.mjs"` reports `ℹ tests 15`, `ℹ pass 15`, `ℹ fail 0` while printing that hash from inside itself.
- ✅ The claim list rules all six criteria and quotes them character for character: `research/raw/m041-verdict-claims.json` carries one row per criterion with `criterionCharacters` 460, 265, 278, 462, 399 and 48 for SC1 to SC6, each row naming an `artefact`, a `proves` command and a `ruling` with its reason, resolved to `.project/intent/INTENT.md` through `scripts/verdict-claims-intent.mjs:70-124` (the binding wave 6 installed).
- ✅ The archive's required synthesis exists and claims no independent research: `.project/research/SYNTHESIS.md:3-29` is headed `Authored at archive time — no research phase and no decide phase ran for this milestone.`, quotes `.project/STATE.md:822-825` for the missing `research` and `decide` entries, names the artefacts it synthesises, and records that no wave review existed at the head it was written from.
- ✅ No threshold was widened and no suite skipped for a missing build at this head: the two budget suites that skip by their own design when no build is present measured rather than skipped here — `node --experimental-strip-types --test "scripts/panel-bundle-budget.test.mjs" "scripts/image-budget.test.mjs"` → `measured initial total 534.93 kB (534933 B over 9 eager files) against the 535.44 kB baseline`, `ℹ tests 18`, `ℹ pass 18`, `ℹ fail 0`.

## Intent coverage

### SC6 — `npm run check` and `npm test` pass at the head.: pass

- ✅ Both halves of the criterion are measured at one head: `.project/build/verify-ledger.jsonl:9` records the wave's Verify — which ends `npm run check && npm test` — as `"result": "pass"` at `4d7860a28fefd6c6c8773996666de6a151c6b8a6`, and the task Log at `.project/tasks/T005-re-capture-rule-the-claims-and-close-the-gate.md:164` records each of the five legs finishing and exiting 0.
- ✅ The `npm run check` half is re-measured in this pass and exits 0: the command ends `verification gate (structure): pass` and `All matched files use Prettier code style!`, with no failing stage anywhere in the log.
- ✅ No assertion was weakened or skipped to reach it (N6): the claim list is a ruling on the criteria as written, the recording and the claim file are byte-identical across an unarmed run, both budget suites measured rather than skipped, and the disclosed skip the criterion asks for is recorded in the task Log rather than counted as a measurement.
- ✅ The wave is last for a stated reason and not for convenience: its one outstanding criterion is the gate, the gate could not be green before the four repairs landed, and the plan's dependency note (`T006, T007, T008, T009 → T005`) is what moved it from wave 5 to wave 9 — the resequencing is recorded in `.project/tasks/T005-re-capture-rule-the-claims-and-close-the-gate.md:157` and `:163`.
