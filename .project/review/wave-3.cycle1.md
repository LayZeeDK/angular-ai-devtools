# Wave 3 review — M036 resource-lifecycle

- Cycle: 1
- Depth: full
- Wave verdict: pass
- Tasks reviewed: T005, T004
- Reviewed HEAD: the commit carrying `T004: Re-record everything the fixture change stales`
- Reviewers: Beam 1.0 Free (high), GLM-5.3 Flash (high) — adjudicated by the orchestrator

## T005 — Widen the statuses and close the echoed identity: pass

- ✅ `reloading` is a named finding, answered before the params gate, worded from Angular's own `ResourceStatus` text; mutants M3 and M4 redden if it is dropped or answered as a first load.
- ✅ The identity is gated on `Resource#<name>` and a cause in that slot yields `resource-unnamed` (M5 reddens).
- ✅ The vm purity assertions moved inside the sandbox and are proven by M6 (`Date`) and M7 (`console`), each also showing the old outside-the-sandbox assertions could not have caught them.
- ✅ `research/08` lines 137, 169 and 170 now agree that status lives on the `.status` nodes.
- ✅ Finding 5 answered by asserting `params-unavailable` for measured fields and labelling every constructed params input as an echo, never a measurement.
- ✅ 30/30, 16/16, `tsc` 0, prettier clean; the docs case fails by name on the base commit.

### Findings carried to wave 4

- **medium** — `/^Resource#\S+$/` refuses a legitimately named resource whose `debugName` contains a space (`_resource-chunk.mjs:514-518` sanitises nothing), so a named resource was reported unnamed.
- **medium** — `local` is a real `ResourceStatus` value, so answering it `status-unavailable` claims a read that succeeded had failed.
- **low** — `research/raw/m022-ng-context.json` and `research/raw/m036-verdict-claims.json` name the fixture route `/resource`; it is `resource-states`.

## T004 — Re-record everything the fixture change stales: pass

- ✅ Every recording re-emitted and re-read: dev 2,180,767 → 2,199,406, production 473,611 → 482,597 with alias `lu` → `Su`, companion bytes 2,199,406, both `.proven.json` closures 26 → 28.
- ✅ `DEV_BYTES_TOLERANCE` stays 2000; only its doc comment was re-cut, so the 18,639-byte move was absorbed by re-measurement and not by widening.
- ✅ The two build recordings agree with each other and with their own prose.
- ✅ Gate: `npm run check` exit 0 across seven stages and `npm test` exit 0 — 827 + 60 + 628 + 339 and 85/85 held-out across 22 suites, reproduced over two full runs.

## Intent coverage

### SC1 — On the fixture, a resource the graph reports in a load state produces a finding naming the resource, the status and the params status, and carrying the modern form and its source only from the cited equivalents table: pass

- ✅ `extension/resource-lifecycle.js` names the status the graph reports and the params status it was given, with no composed cause; `scripts/resource-lifecycle.test.mjs` pins it.

### SC6 — `npm run check` and `npm test` pass at the head: pass

- ✅ Recorded by `gsd verify-final` at this task's landing commit, and re-run at the milestone head (`827 + 60 + 628 + 339` and `85/85`).
