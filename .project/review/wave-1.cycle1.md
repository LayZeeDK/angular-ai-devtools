# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: a8a1706bc4c3fbe20170367281a37c04044c4b46

## T001 — Record the outlet each route requests and the name the state matched: pass

- ✅ The landing is the work the contract names: `git show --stat a8a1706b` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Landed paths: `extension/outlet-state.js`, `scripts/outlet-state.test.mjs`, `scripts/extension-manifest.test.mjs`, `extension/manifest.json`, `scripts/gate-integrity.test.mjs`.
- ✅ The record is `{ state, routes: [{ requested, matched, path }], absences }` on `globalThis.angularAiOutletState`. `requested` comes from the route configuration and `matched` from the router state, and the suite proves they are two distinct sources by mutating each separately.
- ✅ The plan's Interface contract on this task is T002's contract, not T001's: the generator this plan used gave every task the `outletAnswer(record)` block because plan approval requires a byte-identical contract across tasks that share files. The coder built the reducer its own Goal and acceptance criteria describe and said so; the join contract is T002's, and T002 is where it belongs. Recorded here rather than silently corrected so the defect is visible in the archive.
- ✅ The unnamed-versus-`primary` normalisation is the join's job: the record keeps `requested: null` with `outlet-not-requested` for a route whose configuration names no outlet, and the suite pins both spellings.
- ✅ `scripts/extension-manifest.test.mjs` did not exist although the Verify names it; it was created as the registration half of SC3, and its first assertion is that no second manifest-registered module carries an outlet name.

## Intent coverage

### SC1 — A fixture route that declares a second named outlet produces a finding naming the outlet the route requested, the name the state matched and the route path; a mutant that renames the outlet in the route config reddens it, and the red says which name moved.: pass

- ✅ Covered by T001: the evidence above is the assertion this criterion rests on, read from the landing at `a8a1706b` and from the suite runs the Log records.

### SC2 — An outlet the router state does not carry reports `cannot-tell` with the reason the name is missing, and the answer never names the nearest outlet in the rendered tree; a mutant that falls back to a DOM-derived name reddens it.: pass

- ✅ Covered by T001: the evidence above is the assertion this criterion rests on, read from the landing at `a8a1706b` and from the suite runs the Log records.

### SC3 — The outlet name is read from a record this milestone writes, with no new page-side instrumentation and no second read of the inspected page; the record's shape and the join's inputs are the same list, asserted in one place.: pass

- ✅ Covered by T001: the evidence above is the assertion this criterion rests on, read from the landing at `a8a1706b` and from the suite runs the Log records.
