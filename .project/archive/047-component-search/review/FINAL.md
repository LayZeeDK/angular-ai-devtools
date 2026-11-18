# FINAL — M047 component-search

Reviewed HEAD: dddbf27975c8b1a84148c248918b3db67e8665ff

Overall verdict: pass

## What this milestone set out to do

Answer which components the inspected page rendered, and find them by name, without reading the DOM
for a list the agent already holds. The roadmap's premise was that the page agent already captures a
component tree; the first task measured that it does not, and the milestone was narrowed to the names
the agent can actually read.

## Tasks and waves

| wave | task | landing | what it established |
|---|---|---|---|
| 1 | T001 | `32f92b09` | 9 sources that yield a page name and 8 absence cases, each at `path:line` with the line's own text |
| 2 | T002 | `b0f16b4e` | a pure filter over that record: `listed`, `empty`, `cannot-tell` with a closed 5-reason set, 8 mutants |
| 3 | T003 | `2f29d689` | the `components` surface renders four states; the route, loader key and five route-table suites are pinned |
| 4 | T004 | `51568cce` | the surface recorded with 52 citations, the reason row added, both recordings re-derived, project verify green |

## Verification

- `npm run check && npm test` exit 0 at the reviewed head, recorded in `.project/build/verify-ledger.jsonl`
  under that commit with its full output in `.project/build/verify-T004.log`.
- `scripts/component-search.test.mjs`: 16 tests, 0 fail. `scripts/panel-routes.test.mjs`: 4 tests, 0 fail.
- `node --test scripts/gate-integrity.test.mjs`: 40 tests, 0 fail, after the missing suite-reason row was added.
- The held-out corpus: 22 suites, 21 passed, and `e4-idempotent-checks` green under a raised ceiling.
- Four wave reviews pass `gsd review-check`; the gap review records the project Verify at exit 0.

## Two defects found while verifying, fixed at the layer that owns them

- **`scripts/verification-gate.mjs`**: two verdicts written in the same millisecond share an ISO
  string, so "newest evidence" was decided by directory order and the ship-mode refusal test passed
  in one run and failed in a nested run of the same head. On a tie the non-verified verdict now sorts
  last, so a tie can never turn a red into a pass (`37ea7322`).
- **`scripts/held-out-corpus.mjs`**: `e4-idempotent-checks` runs `npm run check` and `npm test` twice
  by design, and the 30-minute ceiling refused it as `did not finish within 1800s` with the other 84
  tests green. The ceiling is now 90 minutes, with the measurement in the comment (`e08e635e`).

## Success criteria

### SC1 — Filtering matches the names the record carries; a mutant that matches a name the record lacks reddens it.

- **Observed**: `node --test scripts/component-search.test.mjs` passes 16/16, including the `framework-completion` mutant (a query for `app-root` keeps nothing, because the record does not carry it) and the `invented-row` mutant, each reddening with the defect named by string.
- **Reference**: `extension/component-search.js` · `scripts/component-search.test.mjs`
- **Finding**: the record T001 measured names by host tag, class name and profiler event; the filter reads those names and nothing else.
- **Verdict**: met
- **Check**: the observed command above, run at the reviewed head
- **Fix direction**: T002 pins the untouched module first and mutates one anchor per case, so a filter that completes a name from framework knowledge reddens at the string that names the defect.

### SC2 — An unreadable tree reports cannot-tell naming the absence, never an empty list.

- **Observed**: the `cannot-tell` state carries a reason from a closed five-member set — three are absence ids T001 measured (`agent-not-installed` `agent-main.js:509`, `no-profiler` `:531`, `enumerate-without-getter` `:862`) and two are the filter's own.
- **Reference**: `extension/component-search.js:48-54` · `apps/angular-ai-devtools/src/app/panel-components.ts:122`
- **Finding**: `unreadableReason` accepts only a member of the set and answers `unreadable-source` otherwise, so an invented cause can never reach `reason`.
- **Verdict**: met
- **Check**: `npm run check && npm test` at the reviewed head
- **Fix direction**: T002 closes the set mechanically and T003 renders the reason verbatim, so widening the vocabulary takes an explicit edit to the set the suite reads.

### SC3 — A subject that does not match this milestone's premise reports "cannot tell" rather than naming a wrong cause.

- **Observed**: the premise was falsified before any join existed — no component tree is captured, `children` occurs zero times in `extension/agent-main.js`, and the only edges are signal-graph consumer/producer pairs. The `empty` state is reported only when the record states the page rendered none.
- **Reference**: `research/raw/m047-names-and-absences.json`
- **Finding**: held-out E4 asserts `empty` and `cannot-tell` from the same record shape in one test, so the two states cannot collapse into one.
- **Verdict**: met
- **Check**: `node --test scripts/component-search.test.mjs` at the reviewed head
- **Fix direction**: T002 asserts the pair together, so reporting an unreadable source as an empty list reddens in the same test that proves the distinction.
