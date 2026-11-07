# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 3
Reviewed HEAD: 8ce92ae7db1ebb037292e65b80096ef81ba7baf2

## T002 — Join the resource state machine to a finding: pass

- ✅ `node --experimental-strip-types --test "scripts/resource-lifecycle.test.mjs"` passed at 15793266 (verify ledger)
- ✅ Four statuses produce findings and four absence reasons exist; `idle` renders "idle (by design)" and the suite asserts the text contains neither `loading` nor `error` (`scripts/resource-lifecycle.test.mjs`).
- ✅ Mutants M1 (a cause inside the loader) and M2 (idle as loading) pin the unmutated module first and redden by name.
- ✅ The module is pure over its fact and constructs no loader, stall, timeout or verdict word.


## T003 — Panel surface for the resource finding: pass

- ✅ `node --experimental-strip-types --test "scripts/panel-resource.test.mjs" "scripts/panel-routes.test.mjs" "scripts/router-diagnostic.test.mjs"` passed at 87c58752 (verify ledger)
- ✅ The surface does not enumerate statuses: `asFact()` reads `resource`/`status`/`params` as non-empty strings and compares them to no vocabulary (`apps/angular-ai-devtools/src/app/panel-resource.ts:242-261`).
- ✅ No cause can reach the screen: the pane renders only those three fields or `reason`, and drops everything else on the fact; the cause mutant `finding-renders-no-cause` reddens by name.
- ✅ Three pins re-cut with the failing assertion recorded (`apps/angular-ai-devtools/src/app/app.spec.ts:33` `+ "resource"`, `chat-entry.component.spec.ts:692`, `scripts/panel-routes.test.mjs`) and three left byte-identical with reasons.
- ✅ 33/33 scripts, 339/339 app, `tsc` 0, prettier clean.


## T004 — Re-record everything the fixture change stales: pass

- ✅ `node --experimental-strip-types --test "scripts/fixture-proof-fresh.test.mjs" "scripts/ng-context-dev-build.test.mjs" "scripts/overlay-verdict-claims.test.mjs"` passed at 29864ca6 (verify ledger)
- ✅ Every recording re-emitted and re-read: dev 2,180,767 -> 2,199,406, production 473,611 -> 482,597 with alias `lu` -> `Su`, companion bytes 2,199,406, both `.proven.json` closures 26 -> 28 (`research/raw/m022-ng-context.json`, `research/raw/companion-dev-build.json`).
- ✅ `DEV_BYTES_TOLERANCE` stays 2000 in `scripts/ng-context-dev-build.test.mjs`; only its doc comment was re-cut, so an 18,639-byte move was absorbed by re-measurement and not by widening.
- ✅ The two build recordings agree with each other and with their own prose.
- ✅ Gate: `npm run check` exit 0 across seven stages and `npm test` exit 0 — 827 + 60 + 628 + 339 and 85/85 held-out across 22 suites, reproduced over two full runs.


## Intent coverage

### SC1 — On the fixture, a resource whose state is `loading` produces a finding naming the resource, its current state, and the status of its params, and naming no cause that lives inside the loader.: pass

- ✅ Covered by T002; evidence recorded above and in the verify ledger.

### SC2 — A resource whose params are `IDLE` produces a finding that says it is idle by design rather than still loading, and does not name an error.: pass

- ✅ Covered by T002; evidence recorded above and in the verify ledger.

### SC3 — The finding is produced from observables the graph already collects — the per-cycle labels — with no new page-side instrumentation, no build-log scraping and no dev-server dependency.: pass

- ✅ Covered by T002; evidence recorded above and in the verify ledger.

### SC4 — Where the answer would require the loader's own promise or an HTTP outcome the page does not carry, the module reports "cannot tell" with that reason rather than naming a stuck request.: pass

- ✅ Covered by T002; evidence recorded above and in the verify ledger.

### SC5 — The panel renders the resource, the state and the params status from a short fact list, shows the "cannot tell" state, and invents neither a cause nor a verdict.: pass

- ✅ Covered by T002; evidence recorded above and in the verify ledger.

### SC6 — `npm run check` and `npm test` pass at the head.: pass

- ✅ Covered by T002; evidence recorded above and in the verify ledger.
