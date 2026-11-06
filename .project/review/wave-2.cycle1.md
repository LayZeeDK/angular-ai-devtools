# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 2
Reviewed HEAD: fe09d80

Three independent reviewers (Beam high, Glyph medium, GLM high) read the wave-2 diff and returned no blocking
findings. Every advisory was audited by the adjudicator before being recorded here; none was accepted on report alone.

## T003 — Panel surface for the readiness finding: pass

- ✅ Whatever the surface renders is what it was handed: `panel-onpush.ts` emits only `component`, `strategy`, `facts` and
  the cannot-tell `reason`; `asFact` (`panel-onpush.ts:248-271`) reads those four keys and drops everything else, so a fact
  carrying a blocker, verdict or element cannot reach the pane. Confirmed independently by two reviewers and by the mutant
  `finding-complete`, which reddens by name when a blocker line is injected.
- ✅ It follows the sibling pattern rather than inventing one: loading / finding / cannot-tell / error, with the same guard
  helpers and export names as `panel-lint.ts`, `panel-router.ts` and `panel-legacy.ts`. The one deliberate divergence —
  `asFactList` checks a single fact's `state` before a wrapped `facts` array (`panel-onpush.ts:214-218`) — is required by
  this join, whose finding carries a `facts` array of its own; the sibling order would treat readiness sentences as the
  fact list.
- ✅ The route is registered the same way as its siblings: `app.routes.ts:100-104` lazy-loads `panel-demo` with
  `data: { surface: 'onpush' }`, and `panel-demo.ts:28` adds the loader. `scripts/panel-routes.test.mjs:186-203` proves the
  registration is load-bearing by deleting the loader entry and asserting the failure names `onpush`.
- ✅ The re-cut counts are measured, not relaxed: `app.routes.ts` declares 17 top-level routes (5 eager, 12 lazy), and the
  pins moved 16 → 17 in `app.spec.ts`, `chat-entry.component.spec.ts` and three places in `scripts/router-diagnostic.test.mjs`,
  plus 11 → 12 for the lazy list. Each is an exact `toEqual` list, not a count that could pass while the wiring broke.
- ⚠ Advisory — `panel-demo.ts` labels the sample component `DeclaredDefault`, while the recorded runtime name is
  `_DeclaredDefault` (`research/raw/m035-onpush-metadata.json`). Cosmetic, but the demo is what a developer sees first, and
  showing a name the page never reports is the kind of small untruth this milestone exists to avoid. Remedy: T005.

## T004 — Re-record everything the fixture change stales: pass

- ✅ Both control-skill manifests were re-recorded through `fingerprint.mjs record` (24 → 26 files), and the recordings
  reconcile: `m022-ng-context.json` reports `builds.development.bytes` 2180767 and `companion-dev-build.json` reports the
  same count at a different output path — asserted by the merge harness before writing, not typed by hand.
- ✅ The production entry bundle was renamed (`main-JST524BV.js` → `main-AHS4MRYY.js`) and the production byte total moved
  472550 → 473611, which is proof the build was re-measured rather than edited.
- ✅ `DEV_BYTES_TOLERANCE` is still 2000 (`scripts/ng-context-dev-build.test.mjs:128`); the only edit to that file is a doc
  comment stating the three real moves. No threshold was widened.
- ✅ All five criteria in `research/raw/m035-verdict-claims.json` quote `.project/intent/INTENT.md:36-40` character for
  character, enforced mechanically by `scripts/overlay-verdict-claims.test.mjs:300-302`.
- ⚠ Advisory — the recording contradicts itself. `research/raw/m022-ng-context.json` states `builds.development.bytes` as
  2180767 while its own `reconciliation.note` still reads "at the same 2176374 bytes". The claim is still true in substance
  and the number is stale prose, so no test reddens — which is exactly why it survived the re-record. Remedy: T005 fixes the
  note and adds a check that a recording's prose agrees with its own fields.
- ⚠ Advisory — the full gate is unevidenced. `.project/build/verify-ledger.jsonl` holds six entries, all targeted suites,
  and none contains `npm test`. The held-out E4 suite was re-run green by the adjudicator (1/1, 920,885 ms) and the re-run is
  being recorded through `gsd verify-final`; until that row exists, SC5 is not met.

## Intent coverage

### SC4 — The panel renders the component, the strategy and the readiness facts from a short fact list, and shows the "cannot tell" state, inventing neither a blocker nor a verdict.: pass

- ✅ The four renderings were printed from the live module and recorded: `component: DeclaredDefault` / `strategy: eager` /
  `fact: input "label" is signal-based`; `cannot tell: …` with `reason: already-onpush`; `loading: …`; `error: …`. The
  cannot-tell pane carries no component, no strategy and no fact.
- ✅ The join-driven tests and the loader mutant pin the wiring, and the surface's own mutant proves a blocker cannot be
  rendered (`scripts/panel-onpush.test.mjs`, 20 tests, green at this head).

### SC5 — `npm run check` and `npm test` pass at the head.: fail

- ❌ No ledger row for the full gate exists at `fe09d80`: `.project/build/verify-ledger.jsonl` holds 6 entries and 0 of them
  contain the string `npm test` (counted with `Select-String -Pattern 'npm test'` over that file). The six entries are the
  targeted task Verifies recorded for T001, T002, T003 and T004.
- `npm run check` is green at this head — T004 ran it, and the adjudicator re-ran the pipeline stages through
  `gsd verify-final` for T001, T002, T003 and T004, each exit 0.
- `npm test` itself is green when run directly: `tests/held-out/e4-idempotent-checks.test.mjs:29` runs check and test twice
  and its final assertion (`tests/held-out/e4-idempotent-checks.test.mjs:63-69`) compares `git status --porcelain` before and
  after each run; the suite passed 1/1 in 920,885 ms (log `%TEMP%\e4b.log`). The full `npm test` run started at 22:07 is
  green through its first stages. A run that is not recorded is still not evidence the pipeline can read, which is why this
  criterion stays `fail` until the ledger row exists.
- Remedy in flight: `gsd verify-final --command "npm test" --commit fe09d80 --run` writes that row. This heading flips to
  `pass` when it exists, and the flip is recorded in the milestone Log.

## Provenance

| Reviewer | Route | Findings | Adjudication |
|---|---|---|---|
| beam | free-beam-high | clean; two advisories (one out of scope) | no blocking; advisories not carried |
| glyph | free-glyph-cluster-medium | clean on structure, duplication, registration, vacuous pins | confirmed independently |
| glm | paid-glm-5-3-flash-high | clean; three advisories | all three verified by the adjudicator; the stale-literal and unevidenced-gate findings are carried to T005 |
