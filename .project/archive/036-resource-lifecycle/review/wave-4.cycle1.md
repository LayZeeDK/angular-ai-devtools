# Review — wave 4, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 8ce92ae7db1ebb037292e65b80096ef81ba7baf2

## T006 — Accept every name the graph emits: pass

- ✅ `node --experimental-strip-types --test "scripts/resource-lifecycle.test.mjs" && node --experimental-strip-types --test "scripts/panel-resource.test.mjs" && node --experimental-strip-types --test "scripts/recording-consistency.test.mjs"` passed at 0e4c30fc (verify ledger)
- ✅ The identity gate accepts a name containing a space, which `createDebugNameObject` can really emit, while a bare `Resource`, an empty name and any untrimmed value are still refused; mutant M8 narrows the gate back and reddens `spaced-name-accepted` (`extension/resource-lifecycle.js:97`).
- ✅ `local` is a sixth status answering "set locally (the value was set, not loaded)" before the params gate; mutant M9 restores the old `status-unavailable` answer and reddens `local-is-a-set-value`.
- ✅ `status-unavailable` is returned only when the status is absent, non-string, empty or outside the six statuses (`extension/resource-lifecycle.js:147-149`).
- ✅ The pane's reason list reaches five and `resource-unnamed` is driven through the join; pane mutant M6 gates the reasons on four and reddens `unnamed-reason-rendered`.
- ✅ `research/raw/m035-onpush-metadata.json` was re-recorded through its own capture: only `capturedAt`, `url`/`pageUrl` and the two chunk names moved, every other field byte-identical.
- ✅ 36/36 join, 22/22 pane, 7/7 recording-consistency, `tsc` 0 on both projects, prettier clean.


## Intent coverage

### SC1 — On the fixture, a resource whose state is `loading` produces a finding naming the resource, its current state, and the status of its params, and naming no cause that lives inside the loader.: pass

- ✅ Covered by T006; evidence recorded above and in the verify ledger.

### SC4 — Where the answer would require the loader's own promise or an HTTP outcome the page does not carry, the module reports "cannot tell" with that reason rather than naming a stuck request.: pass

- ✅ Covered by T006; evidence recorded above and in the verify ledger.
