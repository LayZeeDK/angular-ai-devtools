# FINAL — M048 ui-copy-check

Reviewed HEAD: 642f785430b00623878867f9bcc36848ed945f98

Overall verdict: pass

## What this milestone set out to do

The roadmap said the panel reports which user-visible strings a page renders that its own digest
would not explain, reading text the page already publishes. The first task measured both halves and
found neither: `extension/agent-main.js` contains no `innerText` or `textContent` at all, and the only
digests are for errors and images. The milestone was re-pointed, before any join existed, at the copy
each panel surface declares for itself — which is the observable this repository actually produces.

## Tasks and waves

| wave | task | landing | what it established |
|---|---|---|---|
| 1 | T001 | `518cb997` | 19 surfaces measured at `path:line`: 79 declared sentences, 34 inline, one surface with no copy, 303 citations re-read |
| 2 | T002 | `43c09191` | `extension/copy-digest.json` (113 rows) and the pure join, four mutants, the precedence order, 26 tests |
| 3 | T003 | `b428f068` | the `copy-check` surface, its route and loader key, nine suites pinned, loader-key mutant naming the surface |
| 4 | T004 | `e2672a8b` | the record re-measured over 20 surfaces (122 sentences), the route recorded, both recordings re-derived, project verify green |

## Verification

- `npm run check && npm test` exit 0 at the reviewed head, recorded in
  `.project/build/verify-ledger.jsonl` with the output in `.project/build/verify-T004.log`.
- `scripts/copy-check.test.mjs`: 28 tests, 0 fail, including the four mutants and four precedence pins.
- `scripts/gate-integrity.test.mjs` 40/40 and `scripts/gate-stability-record.test.mjs` 8/8, both green
  unarmed after their recordings were re-derived at this head.
- App suite: 31 files, 351 tests, all passing.
- Four wave reviews pass `gsd review-check`; the gap review records the project Verify at exit 0.

## What the milestone learned about itself

The copy check shipped in wave 3 without its own surface in the record, so it could not see its own
drift. T003 refused to fix that from a task that did not own the digest, and recorded it as a gap;
T004 closed it by re-measuring all 20 surfaces and authoring the new rows **from the source**, never
from the rendered output, because a digest authored from the render agrees with the render by
construction.

The count is not a round number and that is the honest part: 122 sentences are compared against 121
digest rows, because `panel-copy-check.ts`'s `no-reason` is byte-for-byte the sentence
`panel-components.ts` already declares. One row explains one string; a second row would be a second
explanation of it.

## Success criteria

### SC1 — Every string a surface renders is either explained by the copy digest or reported with the surface that renders it; a mutant that suppresses a digest entry reddens the pin.

- **Observed**: the record answers `clean` with `checked: 122` over 20 surfaces; the `digest-entry-dropped` mutant reddens naming `listed: the record names these components, and every row below is one the record carries` and its surface, and the `similarity-match` mutant reddens when a near-miss is explained.
- **Reference**: `extension/copy-check.js` · `scripts/copy-check.test.mjs`
- **Finding**: a string is explained only by an exact match on the digest's own text — no trimming, case folding or similarity — and the four mutants are in-memory rewrites of the shipped bytes, so the pins are not vacuous.
- **Verdict**: met
- **Check**: `node --test scripts/copy-check.test.mjs` at the reviewed head
- **Fix direction**: T002 pins the untouched module before mutating one anchor per defect, so a join that explains by similarity reddens at the string that names the defect.

### SC2 — A surface that supplies no strings reports cannot-tell naming the absence, never an empty list.

- **Observed**: `panel-context.ts` renders no copy at all, and its row reads `cannot-tell` with `surface-declares-nothing` while the record stays `clean` — the absence is visible in the row that carries it and does not silence the eighteen surfaces that do declare copy.
- **Reference**: `extension/copy-check.js` · `research/raw/m048-surface-copy.json`
- **Finding**: held-out E4 asserts a surface with strings but no digest yields `cannot-tell`/`no-digest` beside the `unexplained` case, so "nothing to compare" cannot collapse into "nothing wrong".
- **Verdict**: met
- **Check**: `node --test scripts/copy-check.test.mjs` at the reviewed head
- **Fix direction**: the precedence order is stated once, in the module, and pinned four ways; an absent surface is decided by its own row, never by the record.

### SC3 — A subject outside this milestone's premise reports cannot-tell rather than naming a wrong string or element.

- **Observed**: the premise itself was the first subject, and the milestone reports the mismatch rather than inventing a cause — the agent publishes no text, so the milestone reports over what the surfaces declare, and the digest's `REASONS` set holds only the two words an answer can state.
- **Reference**: `.project/INTENT.md:60-81`
- **Finding**: `no-surfaces` was removed from the closed reason set, because under the precedence order no input can return it: a reason the surface could render but never would is a small lie.
- **Verdict**: met
- **Check**: `npm run check && npm test` at the reviewed head
- **Fix direction**: the recorded copy is measured, not assumed; the one citation the intent got wrong (the sentence map at `:47` rather than `:104`) is corrected in the intent with both lines cited.
