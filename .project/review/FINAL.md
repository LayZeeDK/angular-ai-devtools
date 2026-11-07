# Final Review - M036 resource-lifecycle

Reviewed HEAD: 9ce4fd103a0047d18c2b009b77a9dfd3fb53fc7d
Overall verdict: pass
Met: SC1, SC2, SC3, SC4, SC5 and SC6 are met, with SC1's params field resting on a constructed read rather than a measured one and one real load state deliberately declined, both stated under their own Observed and Fix direction.

The milestone answers its headline question for every state the graph can name - loading, reloading, resolved, error, idle by design and a locally set value - and says "cannot tell" with a reason where a read was not available. Two panel rounds and two patch waves removed three false statements from the shipped code: an identity gate that refused a resource the developer had named, a reason that claimed a read had failed when it had succeeded, and a fifth status the module could not name at all.

## Success criteria

### SC1 — On the fixture, a resource whose state is `loading` produces a finding naming the resource, its current state, and the status of its params, and naming no cause that lives inside the loader.

- **Verdict**: met
- **Check**: `scripts/resource-lifecycle.test.mjs` pins the finding for a loading resource, asserting the resource, the status, the params status when supplied, and that no cause is constructed.
- **Observed**: the join builds exactly `{state, resource, status, params}` and answers `params-unavailable` where the params status was not read. The fixture's own params status is absent from the recording, so the params field is proven with a constructed input that the suite labels an echo rather than a measurement.
- **Reference**: `extension/resource-lifecycle.js`, `scripts/resource-lifecycle.test.mjs`
- **Finding**: met for the join's behaviour; the subject - the status of the params - is not measured on the fixture, so that field rests on a caller-supplied read.
- **Fix direction**: record a params status for one fixture resource and pin SC1 against the measurement instead of an echo.

### SC2 — A resource whose params are `IDLE` produces a finding that says it is idle by design rather than still loading, and does not name an error.

- **Verdict**: met
- **Check**: `scripts/resource-lifecycle.test.mjs` pins the idle finding and asserts its text contains neither `loading` nor `error`.
- **Observed**: the idle subject reaches `idle` because its params expression returns `undefined`, which `resource-states.ts:64,88-99` and the recording both show, and the module keys on the reported status rather than on a thrown params state.
- **Reference**: `extension/resource-lifecycle.js`, `spikes/ng222-app/src/app/resource-states.ts`
- **Finding**: the finding says idle by design and names no error or cause.
- **Fix direction**: none.

### SC3 — The finding is produced from observables the graph already collects — the per-cycle labels — with no new page-side instrumentation, no build-log scraping and no dev-server dependency.

- **Verdict**: met
- **Check**: the read is `ɵgetSignalGraph`, already exported and used by the graph feature; `extension/resource-lifecycle.js` imports nothing and performs no I/O.
- **Observed**: `scripts/resource-lifecycle.test.mjs` runs both a static body scan and an in-context purity guard that reddens on `Date` and `console`, and it proves the guard bites with two mutants.
- **Reference**: `extension/resource-lifecycle.js`, `research/raw/m036-resource-graph.json`
- **Finding**: no new hook is installed and no build output or dev server is consulted.
- **Fix direction**: none.

### SC4 — Where the answer would require the loader's own promise or an HTTP outcome the page does not carry, the module reports "cannot tell" with that reason rather than naming a stuck request.

- **Verdict**: met
- **Check**: four absence reasons are produced and pinned, and `assertNoClaim` fails the suite if any emitted string names a loader, a stall, a timeout or a request.
- **Observed**: `status-unavailable` is returned only when the status is absent, non-string, empty or outside the six statuses, so the unread reason is reserved for a read that failed; two mutants pin that reservation in both directions.
- **Reference**: `extension/resource-lifecycle.js`, `scripts/resource-lifecycle.test.mjs`
- **Finding**: the module declines rather than guessing and names the reason it declined; one real state stays declined - a resource whose params re-throw `ResourceParamsStatus.LOADING` while an upstream resource loads reports `loading` forever and is indistinguishable from a slow loader.
- **Fix direction**: read `extRequest` for the absence of `request` and name the chained-loading case in a later milestone.

### SC5 — The panel renders the resource, the state and the params status from a short fact list, shows the "cannot tell" state, and invents neither a cause nor a verdict.

- **Verdict**: met
- **Check**: `apps/angular-ai-devtools/src/app/panel-resource.ts` renders the three echoed fields for a finding and `reason` alone for a cannot-tell, and the suite pins the four states plus five reason paths.
- **Observed**: the pane never enumerates statuses, so the fifth and sixth statuses render without a surface change; a mutant that gates the reasons on four reddens by name.
- **Reference**: `apps/angular-ai-devtools/src/app/panel-resource.ts`, `scripts/panel-resource.test.mjs`
- **Finding**: the pane invents nothing and composes no line the fact does not carry.
- **Fix direction**: none.

### SC6 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: `npm run check` exit 0 across seven stages and `npm test` exit 0 - 827 + 60 + 628 + 339 and 85/85 held-out across 22 suites, reproduced over two full runs.
- **Observed**: each task's Verify is recorded by `gsd verify-final` at its own landing commit, and the full gate was re-run at the milestone head by T004.
- **Reference**: `.project/build/verify-ledger.jsonl`, `research/raw/m022-ng-context.json`
- **Finding**: the gate is green at the head and the held-out corpus is green twice over.
- **Fix direction**: the gate's cost is quadratic in its own suites, because `E3` runs `npm test` inside `npm test` and `E4` runs it twice within 20-minute budgets; that is why the unit-test cache had to be restored in M035, and bounding the inner runs is what would let the cache stay off.
