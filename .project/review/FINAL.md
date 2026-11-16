# FINAL — M057 console-read

Reviewed HEAD: 72aaedafa74760ae9b5812933acd2976f75623ac

Overall verdict: pass

## What this milestone set out to do

Report one finding per captured console diagnostic, joining the capture's own text to the shipped digest
by code, and state an absence by name where the digest has no entry. The milestone's own risk was that a
surface would state more than the observable carries, so every criterion below is answered by a surface
that can be read, not by a test that a rule was followed.

## Tasks and waves

| wave | task | landing | what it established |
|---|---|---|---|
| 1 | T001 | `ee4bfbd2` | measured what the capture and the digest actually state, in one record |
| 2 | T002 | `f1e23ecf` | joined a captured diagnostic to a digest entry by code, not by title |
| 3 | T003 | `6bfaad2b` | rendered the join and pinned the routes it adds |
| 4 | T005 | `bf3d1c04` | made the gate agree with this milestone's own evidence |
| 5 | T004 | `f7eb8581` | recorded the surface and ran the project verify |
| 6 | T006, T007, T008 | `8851f77e`, `2fa589b9`, `9f0603c9` | repaired what the first reviews refuted |
| 7 | T009, T010, T011 | `e1ba31fc`, `234a3b4c`, `dcd1775b` | repaired what the second reviews refuted |
| 8 | T012, T013 | `9505b7c9`, `4a4aed36` | repaired what the third reviews refuted |
| 9 | T014 | `b7e3a739` | made the silence rule a property, not a phrase list |
| 10 | T015 | `85208150` | implemented the criterion nothing owned |
| 11 | T016, T017, T018 | `315a6095`, `33fa8c7b`, `209da9e7` | made the counts a measurement too |
| 12 | T019 | `21d59c13` | enumerated the pane's own sentences |
| 13 | T021 | `1e84c498` | stopped the join editing the captured text |
| 14 | T020 | `9b39f6ec` | stopped the Log restating derived facts |
| 15 | T022 | `bed115e3` | made the join's reasons a closed set |
| 16 | T023 | `cd319fa9` | let the record hold the case the join can now produce |
| 17 | T024 | `3238cd88` | re-derived the recordings the waves moved |
| 18 | T025 | `58690aa4` | stated the title only when the row carries one |
| 19 | T026 | `be00283a` | withdrew the two facts the Log still restated |
| 20 | T027 | `2efd4ef9` | withdrew the third instance the heading miscounted |

## Verification

- `prepare-final` at the reviewed head: `discussion_records.py pending` exit 0, `build_state.py
  verify-landed` exit 0, `lean_verification.py` exit 0.
- `npm run check` exit 0 at every landing, seven stages including `format:check` at 80 columns.
- Seven gate suites re-derived by their own capture commands at this head, each proving a default run
  moves no byte: the census, the stability record and the panel record.
- `gsd review-check` exits with one blocker before this file exists (`missing FINAL.md`); every wave
  passes its own grammar, and waves 10, 14, 17 and 19 carry cycle-2 verdicts whose cycle-1 files were
  deleted, each naming what it replaced.

## Success criteria

### SC1 — The panel reports one finding per captured console diagnostic, naming the diagnostic's own text and the code it carries, without inventing a code for a message that has none.

- **Observed**: `node --test scripts/console-join.test.mjs` passes 39 of 39 at the reviewed head, including the pin that a message carrying no code yields a finding with no `code` field, and the pin that `text` is byte-identical to its input for every recorded input.
- **Reference**: `extension/console-join.js`, `scripts/console-join.test.mjs`
- **Finding**: the cycle-5 review found the join editing the captured text; T021 stopped it and pinned byte identity.
- **Fix direction**: T021 stopped the join rewriting captured text; the pin compares bytes rather than shapes.
- **Verdict**: met
- **Check**: run at the reviewed head, quoted above

### SC2 — A diagnostic whose code the digest carries is reported with that entry's title, and the join is proven against the shipped `extension/error-digest.json` rather than a fixture.

- **Observed**: the render suite passes 41 of 41 and the record suite 38 of 38; a folded row whose digest entry carries a title renders that title, and the same row reduced to an entry with no title renders `no-title` and a case sentence that claims none (T025, wave 18).
- **Reference**: `apps/angular-ai-devtools/src/app/panel-console.ts`, `scripts/console-panel-render.test.mjs`
- **Finding**: wave 10's review reproduced one surface asserting a title the row did not carry; T025 made the claim conditional and left the titled sentence byte-unchanged.
- **Fix direction**: T025 made the title claim conditional on the row carrying a title, and pinned both shapes.
- **Verdict**: met
- **Check**: run at the reviewed head, quoted above

### SC3 — A diagnostic whose code the digest does not carry reports the absence by name — the code, or the fact that the message carried no code — instead of a count, an empty cell, or a remedy.

- **Observed**: the join states an enumerated `REASONS` set and the pane refuses a reason or a state outside its own vocabulary, naming the offending word; the recorded `case-folded-match` renders `case-difference` from the registry rather than from a literal.
- **Reference**: `extension/console-join.js` `REASONS`, `scripts/console-panel-render.test.mjs`
- **Finding**: wave 15's review found one unenforced channel, an answer-supplied reason reaching the surface under the carried-value exemption; T022 closed it with a refusal that names the word.
- **Fix direction**: T022 enumerated the reasons and made an out-of-set reason a named refusal.
- **Verdict**: met
- **Check**: run at the reviewed head, quoted above

### SC4 — A page that captured nothing reports that it captured nothing, distinguished from a capture that produced diagnostics the digest has no entries for.

- **Observed**: the pane registers `captured-nothing` and `no-diagnostics` as separate sentences, and the Log states measurements at named commits and names the commands that print them (T020, T026, T027).
- **Reference**: `apps/angular-ai-devtools/src/app/panel-console.ts` sentence registry, `.project/tasks/T001-measure-the-capture-and-the-digest.md`
- **Finding**: waves 14 and 19 each found a sentence restating a derived fact; each was withdrawn in an appended entry, and the append-only property is proven against `9b39f6ec`.
- **Fix direction**: T020, T026 and T027 withdrew every sentence that restated a derived fact, each replaced by a command.
- **Verdict**: met
- **Check**: run at the reviewed head, quoted above

### SC5 — The surface renders only what the capture states: no cause, no element, no fix, and no "angular" attribution that the message text does not carry.

- **Observed**: the render suite's three prohibition pins pass and each is armed; the sentence for a folded row with no title states no title rather than a title it cannot know.
- **Reference**: `scripts/console-panel-render.test.mjs` prohibition pins
- **Finding**: waves 6 through 9 repaired four successive violations; the class is now enforced by registry membership rather than by a phrase list.
- **Fix direction**: the prohibition pins now name the sentence they forbid, so a new sentence cannot inherit an exemption.
- **Verdict**: met
- **Check**: run at the reviewed head, quoted above

## What is not claimed here

Two review verdicts were written as `fail` and each was right for the head it measured: wave 17 for
recordings that went stale behind a later landing, and wave 19 for a sentence its own task had already
twice withdrawn. Both were repaired, not waived, and the recordings were re-derived after the final
landing rather than at the commit that happened to be convenient.

The gates in `~/.commandcode/scripts/gsd` that this milestone's reviews examined are outside this
repository and outside this milestone's scope; their findings are recorded in the review artifacts and
remain open.
