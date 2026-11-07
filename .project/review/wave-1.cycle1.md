# Wave 1 review — M036 resource-lifecycle

- Cycle: 1
- Depth: full
- Wave verdict: pass
- Tasks reviewed: T001, T002
- Reviewed HEAD: the commit carrying `T002: Join the resource state machine to a finding`
- Reviewers: Beam 1.0 Free (high), GLM-5.3 Flash (high) — adjudicated by the orchestrator, every claim audited at the frozen head

## T001 — Measure the graph hook and give the fixture one resource per state: pass

- ✅ The hook is `ɵgetSignalGraph`, not `ɵsetProfiler`: the capture records `labelsComeFrom: "ɵgetSignalGraph"` and `setProfilerCarriesNoLabels: true`, and the labels are `debugName`s built at `_resource-chunk.mjs:514-517` (`research/raw/m036-resource-graph.json`).
- ✅ `ɵgetSignalGraph` is present on both installs: 22.2.2 at runtime returning 28 nodes and 37 edges, 22.1.8 by a static types+source read recorded as `runtime: null` rather than presented as a run.
- ✅ Four resources reach the four states, and the idle one is idle because its params return `undefined` (`resource-states.ts:64,88-99`), which the recording confirms as `idle` with `isLoading: false`.
- ✅ `research/08-recent-angular-features.md:170` now attributes the labels to `ɵgetSignalGraph`; 137 and 169 were still wrong at this head and were carried to wave 3, where they were corrected.
- ✅ Route pins re-cut 17 → 18 with the failing assertion recorded for each, and both recordings re-captured.

## T002 — Join the resource state machine to a finding: pass

- ✅ Four statuses produce findings and four absence reasons exist; `idle` renders "idle (by design)" and the suite asserts the text contains neither `loading` nor `error` (`scripts/resource-lifecycle.test.mjs`).
- ✅ Mutants M1 (a cause inside the loader) and M2 (idle as loading) redden by name, each pinning the unmutated module first.
- ✅ The module is pure over its fact and constructs no loader, stall, timeout or verdict word.

### Findings carried to wave 3

- **medium** — `resource` is an unguarded echo (`resource-lifecycle.js:90-91`): a caller can put a cause in the identity slot, so the params gate was not the only door.
- **medium** — the comment calling `loading`, `resolved`, `error`, `idle` "the four statuses the state machine reports" is false: `_resource-chunk.mjs:504` computes `reloading`, so a resource stuck mid-reload answered `cannot-tell`.
- **minor** — the purity suite's `Date`/`console` assertions were vacuous, because reading a vm sandbox from outside never forwards intrinsics.
- **minor** — the tests pinned `params: 'resolved'`, a value the recording never measured.

## Intent coverage

### SC1 — On the fixture, a resource the graph reports in a load state produces a finding naming the resource, the status and the params status, and carrying the modern form and its source only from the cited equivalents table: pass

- ✅ `scripts/resource-lifecycle.test.mjs` pins the finding for `loading`, `resolved` and `error`, and `research/raw/m036-resource-graph.json` records the statuses the fixture reaches.

### SC3 — The finding is produced from observables the agent already collects, with no new page-side instrumentation and no build-log scraping: pass

- ✅ The read is `ɵgetSignalGraph`, already exported and used by the graph feature; `extension/resource-lifecycle.js` imports nothing and performs no I/O.
