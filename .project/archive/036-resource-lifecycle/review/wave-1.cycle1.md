# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 8ce92ae7db1ebb037292e65b80096ef81ba7baf2

## T001 — Measure the graph hook and give the fixture one resource per state: pass

- ✅ `node --experimental-strip-types --test "scripts/resource-graph-capture.test.mjs" "scripts/router-config-capture.test.mjs" "scripts/after-render-fixture.test.mjs"` passed at 5b8ec9d0 (verify ledger)
- ✅ `ɵgetSignalGraph` is the hook the labels come from, not `ɵsetProfiler`: the capture records `labelsComeFrom: "ɵgetSignalGraph"` and `setProfilerCarriesNoLabels: true`, and the labels are `debugName`s built at `_resource-chunk.mjs:514-517` (`research/raw/m036-resource-graph.json`).
- ✅ The hook is present on both installs: 22.2.2 at runtime returning 28 nodes and 37 edges, 22.1.8 by a static types+source read recorded as `runtime: null` rather than presented as a run.
- ✅ Four resources reach the four states, and the idle one is idle because its params return `undefined` (`spikes/ng222-app/src/app/resource-states.ts:64,88-99`), confirmed by the recording as `idle` with `isLoading: false`.
- ✅ Route pins re-cut 17 -> 18 with a failing assertion recorded for each, and both router recordings re-captured (`scripts/after-render-fixture.test.mjs`, `scripts/router-config-capture.test.mjs`, `scripts/router-diagnostic-capture.test.mjs`).


## Intent coverage

### SC3 — The finding is produced from observables the graph already collects — the per-cycle labels — with no new page-side instrumentation, no build-log scraping and no dev-server dependency.: pass

- ✅ Covered by T001; evidence recorded above and in the verify ledger.
