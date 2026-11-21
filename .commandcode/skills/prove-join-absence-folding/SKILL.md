---
name: prove-join-absence-folding
description: "Formal check for the tutor surface's pure joins (extension/tutor-signals.js, extension/tutor-foundations.js, extension/render-phase.js): bounded exhaustive generation over the record grammar, run against the real modules in a bare node:vm context, proving the absences are decided in contract order and never folded into one another or answered with an invented index, label, artefact path or cause. Use before or after any edit to those three files, when a tutor answer names the wrong absence, names an effect or file the records do not state, or when asked to 'prove the joins still fold nothing'."
---

# prove-join-absence-folding

**Naming grammar (this repo).** Skills are verb-shaped: `prove-<area>` (this skill); `control-*` and `verify-*` are the runtime families; `create-*`, `maintain-*` and `lars-<verb>` are the workflow family. Subagent types are role nouns (`lars-gsd-bookkeeper`, `lars-gsd-diagnostician`). This skill is named `prove-join-absence-folding` rather than an area noun — a deliberate deviation from the generator skill's "name the skill for the area" wording, recorded here.

## Property (one sentence)

Every pure join behind the tutor surface decides each absence state in the contract's order, never folds one absence into another, and never invents an index, a label, an artefact path or a cause that the records do not state.

## Harm (one sentence)

A folded or invented answer tells the developer a specific effect node, file or cause that exists only in the join's imagination — an observability tool that lies about which absence holds is worse than one that says cannot-tell.

## What is verified, and under which bounds

The check runs the **real modules** — `extension/tutor-signals.js` (`angularAiTutorSignals`), `extension/tutor-foundations.js` (`angularAiTutorFoundations`), `extension/render-phase.js` (`angularAiRenderPhase`) — each loaded into a bare `node:vm` context with nothing in it (no DOM, no console, no `require`; a module that reached for a page global would throw and be seen). Over a bounded exhaustive grammar it asserts, for every answer:

- **Decision order.** The state is the contract's first unanswered question: for tutor-signals the graph record (`graph-unreadable`), then the render/effect entry (`no-render-entry`), then the effect node (`no-effect-node`), then `answered`; for tutor-foundations the instrument, the records, the mapping, the criterion, the field, then presence (`records-unreadable`, `no-matching-criterion`, `no-artefact-named`, `missing-artefact`, `answered`); for render-phase the graph (`graph-unreadable`), the effect kind (`no-effect-node`), the subject (`effect-unreadable`). The expected state is derived independently in the check, from the contract, not from the module's code.
- **No folding.** Each absence's `detail` carries its own sentence and never a phrase from another state's sentence (marker lists in `check.mjs`).
- **The ordering is one constant.** Every tutor-signals answer's `ordering` deep-equals `{ state: 'absent', absence: 'no-write-record-no-order' }`, on all four states, and the ordering claim carries it; structurally, the constant is declared once and built by one `orderingState` function reached from two call sites, so no branch can vary it.
- **No invention.** `effect.index`/`effect.label` are the matched node's own fields verbatim (or `null`/`''` where it carries none); every read is a placed producer end of a recorded edge, in edge order, with index and label the record holds; every `unplaced` entry names the record's own end verbatim; in tutor-foundations every `artefactPaths` member is a `claims[].artefactPath` a supplied record states; in render-phase `phase` is always `{ state: 'cannot-tell', absence: 'no-effect-event' }` and the effect finding's label is the graph's own label or `null`.
- **Determinism** (spot-checked across the grammar): a second answer over identical records is byte-identical.

Bounds — everything is enumerated up to these, nothing beyond:

- tutor-signals: node arrays of 0–2 nodes over the full attribute grammar (kind `effect`/`signal` × index `0`/`1`/`2`/absent × label `''`/`'Resource.loadEffect'`) plus curated 3-node arrays (≤3 effect nodes), edge sets of ≤2 edges from 9 candidates whose ends are placeable (`0`,`1`,`2`) or unplaceable (`9`), 9 entry shapes (absent, empty label, recorded label, unrecorded label, edge by consumer, whole edge recorded/unrecorded, unplaceable consumer, malformed), 7 graph-record shapes (1 readable + 6 faults: no record, no path, no line, line < 1, no graph object, no node list). Unreadable records are combined with every entry shape so a fold past the first absence cannot hide.
- tutor-foundations: 4 reader shapes (absent, always-true, always-false, path-dependent) × 12 record sets (empty, path-less, unparsed, no claims, claim without `artefactPath`, claim with it, `'M057 visual-qa'` spelling, wrong criterion, wrong milestone, two claims one criterion, noise claims) × 8 index shapes (absent, empty, mismatched question/criterion/milestone, array form).
- render-phase: 4 graph shapes × 10 node configs × 5 edge sets × 8 effect subjects × 2 error shapes.

Run time is well under a second (about 750 ms, ~1,014,000 assertions). A pass covers this grammar at this bound — it is not a proof at every size.

## What is excluded

- Records larger than the bounds (more nodes/edges/claims) and index values beyond `0`–`2`/`9`.
- The surfaces and callers that render these answers (`extension/agent-main.js`, the panel) — only the three pure joins are covered.
- Entry or fact fields outside the grammar (a numeric `label`, a `Symbol` key, prototype pollution) and `records.error`/change-detection content beyond presence and the three-value copy.
- tutor-foundations' milestone spellings beyond the two the records carry (`'M057'`, `'M057 visual-qa'`).
- Byte-identity of `detail` prose is checked only through the marker/borrowing lists and the determinism spot-check, not as a full text pin.
- The vm context proves the joins run bare; it does not prove no other module in `extension/` does.

## How to run

From the repo root (`D:\projects\sandbox\angular-ai-devtools`), one command, Node ≥ 18, no dependencies:

```
node .commandcode/skills/prove-join-absence-folding/check.mjs
```

Exit 0 prints one `PASS` line; exit 1 prints the first ten counterexamples as JSON (the records, the expected state, the answer) and stops. There are no flags and nothing to install.

## Coverage record

| Covered                          | Detail                                                                                                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extension/tutor-signals.js`     | `tutorSignals` and every helper under it (`graphRecordOf`, `entryOf`, `subjectOf`, `readsOf`, `effectOf`, `claimsOf`, `answerOf`, `orderingState`); the four states; `ORDERING_ABSENCE` |
| `extension/tutor-foundations.js` | `tutorAnswer` and every helper under it (`readableRecords`, `findRow`, `claimFor`, `milestoneIdOf`, `pathsOfClaim`); the five states                                                    |
| `extension/render-phase.js`      | `renderPhase` and every helper under it (`graphOf`, `effectSubject`, `effectNodesIn`, `readsOf`, `phaseState`); the three absence reasons and the `no-effect-event` phase               |

**Sync commit:** `7cbb1e6e` (2026-11-21, `main`) — the commit at which this verification was last confirmed to describe the covered files. When the covered code changes after that commit, this verification needs another look before its results are trusted.

## Telling a real bug from a modelling error

A failure is a **real bug** when the counterexample's records are shapes the contract says the joins must answer — an absence answered with another absence's sentence, an `effect.index` the node does not carry, an `artefactPaths` member no claim states, a `phase` other than `no-effect-event`, a decision reached past an earlier absence. Reproduce it by hand against the module before calling it: feed the counterexample's records to the join and read the answer. Report it; do not weaken the property, the grammar or the marker lists to go green, and do not change product code unless asked.

A failure is a **modelling error** when the counterexample's records are shapes the contract never carries (a field this module ignores, a spelling outside the recorded shapes), or when a structural pin (such as the `orderingState` occurrence counts) fires because the code was legitimately refactored — for instance the constant renamed or the builder inlined while every answer still carries the one ordering. Then fix the model in `check.mjs`, note what changed, and re-run.

## Moving the sync commit forward

Move the sync commit above to a new commit **only after** running this check at that commit and confirming, by reading the covered files, that the verification still describes them — same states, same order, same ordering constant, same field vocabulary. If a change was intended to alter the behaviour this proves, update the property and the grammar first, prove the new check fails on the old behaviour and passes on the new, and only then move the commit.
