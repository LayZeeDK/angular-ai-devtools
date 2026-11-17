# FINAL — M046 copy-to-agent

Reviewed HEAD: abb8f375cdabc1428bbb4fa98bfea5ee8fd109de

Overall verdict: pass

## What this milestone set out to do

Hand a finding to the agent as the text the pane drew, through a control that names what it will
send before it sends it, and correct every documentation claim this milestone's audit ruled
`fix-doc` at the artefact it cites. The `.claude` mirror is deleted, so `.commandcode` is the single
source for every skill and no citation can name a stale copy.

## Tasks and waves

| wave | task | landing | what it established |
|---|---|---|---|
| 1 | T001 | `c3e7ff35` | measured what the pane renders and what each existing copy path composes, at `path:line` |
| 2 | T002 | `4623c97b` | `.claude/` is gone and the linter resolves only `.commandcode` |
| 3 | T003 | `a8b166cc` | the hand-off is the pane's rendered text, and the control names what it sends |
| 3 | T004 | `c0b1036c` | three hand-over states render, with the routes, demo loader and route pins they add |
| 4 | T005 | `10701535` | `cannot-tell` carries a closed reason set, and an invented cause reddens |
| 4 | T006 | `1165852b` | the citations the inspection measured are corrected at the files they name |
| 5 | T007 | `c6505f15` | the surface is recorded and the project verify runs at the head that ships |

## Verification

- `npm run check` and `npm test` exit 0 at the reviewed head; the recorded run is in
  `.project/build/verify-ledger.jsonl` under that commit, and its full output is captured there.
- `npm test`'s first leg reports 1568 tests, 1568 pass, 0 fail, 0 skipped, 0 todo when run alone.
- The held-out corpus passes with `e3-zero-skipped` green; `e4-idempotent-checks` failed once on a
  stray unformatted file at the repository root, which was deleted rather than tolerated.
- Five wave reviews pass `gsd review-check`; the gap review records the project Verify at exit 0.
- Every done task has a passing verify-ledger entry recorded from a real run, not a claim.

## Success criteria

### SC1 — The hand-off quotes the rendered finding: the text the pane drew is the text sent, and a mutant that re-derives the text from the record reddens the pin.

- **Observed**: `node --test scripts/copy-to-agent.test.mjs` passes 16/16 at `c6505f15`, including the mutant that recomposes the text from the record instead of the pane and is asserted to redden.
- **Reference**: `scripts/copy-to-agent.test.mjs`
- **Finding**: T001 measured that the previous copy path re-derived the finding from the record; T003 replaced it with the pane's rendered text.
- **Verdict**: met
- **Check**: the observed command above, run at the reviewed head

- **Fix direction**: T003 built the hand-off from the pane's rendered text and T001 recorded, at `path:line`, what each prior copy path composed, so the pin reads the same source the control sends.

### SC2 — A finding carrying a named absence is handed over with that absence, not with an empty or completed finding.

- **Observed**: the three hand-over states render at `/copy-to-agent` and `scripts/panel-routes.test.mjs` pins the route and its demo loader.
- **Reference**: `apps/angular-ai-devtools/src/app/panel-copy-to-agent.ts`
- **Finding**: the absence is carried as the pane states it; an empty or completed finding would name a result the observable does not support.
- **Verdict**: met
- **Check**: `npm run check && npm test` at the reviewed head

- **Fix direction**: T004 renders the absence as its own state and pins the route and demo loader it adds, so an empty or completed finding would be a missing surface rather than a quiet default.

### SC3 — A subject whose finding cannot be expressed as a question reports `cannot-tell` with the reason, rather than naming a wrong cause, element or remedy.

- **Observed**: T005's closed reason vocabulary is asserted, and an invented cause is a red test naming the defect.
- **Reference**: `extension/copy-to-agent.js`
- **Finding**: the reason set is closed, so a new reason reddens rather than silently widening the vocabulary.
- **Verdict**: met
- **Check**: `node --test scripts/copy-to-agent.test.mjs` at the reviewed head

- **Fix direction**: T005 closed the reason set and asserted that an invented cause reddens, so widening the vocabulary takes an explicit edit to the set the test reads.

### SC4 — Every documentation claim this milestone's inspection ruled `fix-doc` is corrected at the artefact it cites, and the correction is proven by the pin that reads that artefact, not by the edit alone.

- **Observed**: T002 deleted the `.claude` mirror and retired every rule that maintained it; T006 corrected `AGENTS.md:64`, `monitor-ci/SKILL.md:313`, `references/ai-browsers-verification.md:253` and `capability-dependency-matrix.md:214`.
- **Reference**: `scripts/docs-correction.test.mjs`
- **Finding**: each correction is asserted by the suite that reads the corrected artefact, so a reverted edit reddens it.
- **Verdict**: met
- **Check**: `npm run check && npm test` at the reviewed head

- **Fix direction**: T006 corrected each citation at the artefact it names and `scripts/docs-correction.test.mjs` reads that artefact, so a reverted correction reddens the suite rather than passing unnoticed.
