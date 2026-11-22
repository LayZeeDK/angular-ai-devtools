# Review — wave 4, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 54c23abd2a732c5f9ffc9298882d44a771cb8234

## T004 — Write the verdict claims the census derives: pass

- ✅ The landing is the claims record, the census wiring and the map repair, and nothing else:
  `git show --stat 93864ce4` reads `.project/tasks/T004-write-the-verdict-claims-the-census-derives.md | 12 +-`,
  `research/raw/m060-record-shapes.json | 23 +-`, `research/raw/m060-verdict-claims.json | 168 +++`,
  `scripts/error-routing-shapes.test.mjs | 27 +-`, `scripts/tutor-record-shapes.test.mjs | 22 +-`,
  `5 files changed, 219 insertions(+), 33 deletions(-)`. The verify suites are green at the reviewed
  head: `node --test scripts/navigation-blocking.test.mjs scripts/tutor-record-shapes.test.mjs`
  prints `ℹ tests 41 / ℹ pass 41 / ℹ fail 0` for the tutor-record-shapes census (run by this review),
  with navigation-blocking's own pins green ahead of it.
- ✅ The claims record quotes the intent verbatim and this review checked the quotation:
  `research/raw/m060-verdict-claims.json` carries all six criteria (`:21-28`), and each claim's
  `criterionText` is character-for-character the text at `.project/intent/INTENT.md:30-35` — SC1
  (`m060-verdict-claims.json:79`), SC2 (`:94`), SC3 (`:109`), SC4 (`:124`), SC5 (`:139`), SC6
  (`:154`) all match the intent's own lines, and the record states its own comparison basis
  (`quotes.from`, `:5-6`: parsed with the same routine `scripts/overlay-verdict-claims.test.mjs`
  uses, compared character for character). The suite that re-derives it agrees:
  `research/raw/m060-verdict-claims.json: 6 criterion(a) ruled, 0 required, 6 not-required` in this
  review's run, with `a doctored citation reddens naming the claim it belongs to` green.
- ✅ Every claim cites an artefact that exists and carries its reading: each claim's
  `artefactPath` names a real suite (`scripts/error-routing.test.mjs` for SC1–SC5,
  `apps/angular-ai-devtools/src/app/app.spec.ts` for SC6) and the run's artefact resolution is
  green — `44 of 44 artefact path(s) resolve over 18 distinct file(s); 0 do not`, and
  `reddens when a row cites an artefact that is not there` passes. The cited SC1/SC2/SC3/SC4/SC5
  suite is the 16-test suite this review ran green in wave 2 (`ℹ tests 16 / ℹ pass 16`), and the
  edge rows the claims name are the intent's own table: E1/E2/E8 → SC1, E3 → SC2, E4 → SC3, E5 →
  SC4, E6 → SC5, E7/E9 → SC6 (`.project/intent/INTENT.md:39-49`).
- ✅ The census wiring is real, not decorative: T004 added `research/raw/m060-record-shapes.json` to
  `scripts/tutor-record-shapes.test.mjs`'s `LATER` maps (`:90`) with M060's two owed records pinned
  (`PINNED_OUTSIDE.M060 = ['research/raw/m060-surface.json', 'research/raw/m060-verdict-claims.json']`,
  `:119-122`), widened the `PINNED_OUTSIDE` key type to `'M060'` at all three read sites
  (`:636-638`, `:1828-1830`, `:1858-1860`), and the run's census line counts them:
  `M060's map at research/raw/m060-record-shapes.json names 2 record(s) outside itself and measures
  0`, with `a record present and not named outside the map reddens naming the record` and
  `each later map may name only its own records` both green. The map repair is in the same commit:
  T001's four prose `outsideTheMap` entries became the two real record paths plus an
  `inventory.measured` sentence (`git show 93864ce4 -- scripts/error-routing-shapes.test.mjs`),
  which is what the census reads.
- ✅ The `not-required` ruling answers the portal clause rather than dodging it: every reason names
  the clause and why no `control-ai-browsers` driver reading (toolElements, drawnRect, descriptor,
  noDevContext) can carry a fact about this repository's own gate (e.g.
  `research/raw/m060-verdict-claims.json:82`, `:157`), and each row still cites the edge rows and
  suites that hold it; the suite pins the closed shape with mutants
  (`a six-column edge table reddens by naming its column count`, `refuses a held-out test this
  checkout does not carry` — both green in the run).
- ⚠ One provenance looseness, not a criterion failure: the record's `quotes.edges` says the
  test-to-edge mapping is read "from .project/plan/PLAN.md's ## Held-out checks table (Edge | Task |
  Test)", but `.project/plan/PLAN.md:81-89` is a dash list, not a pipe table, so the derivation
  suite finds 0 held-out rows (the run prints `0 held-out row(s)`) and falls back — by
  `suiteForEdge`'s stated rule (`scripts/navigation-blocking.test.mjs:2856-2893`) — to the task the
  plan's intent-coverage table assigns and the suite that task added. That fallback is what names
  `scripts/error-routing.test.mjs` and `apps/angular-ai-devtools/src/app/app.spec.ts`, and it is
  deterministic and suite-pinned; the plan's dash list names different suites for E5/E6/E7/E9
  (`scripts/panel-routes.test.mjs`, `scripts/error-routing-shapes.test.mjs`), which the derivation
  does not read. The claims' substance is unaffected — both cited suites exist, are green, and do
  carry the readings — but the `quotes.edges` prose overstates the source.
- Files the wave touched, read or not read: `research/raw/m060-verdict-claims.json` — read (whole
  file, 168 lines), 100%; `scripts/tutor-record-shapes.test.mjs` — read at the T004 diff sites and
  targeted greps, run whole (41/41); `scripts/navigation-blocking.test.mjs` — read at
  `:2687-2799` and `:2856-2939` (the held-out/derivation machinery), run whole;
  `scripts/error-routing-shapes.test.mjs` — read via the T004 diff; `.project/intent/INTENT.md` —
  read (whole file, 71 lines); `.project/plan/PLAN.md:79-93` — read; the wave-2 artefact
  `scripts/error-routing.test.mjs` — cited, run green in wave 2.

## Intent coverage

### SC1 — An error the global listener recorded, with a resolved `ErrorHandler` in force and no boundary entry carrying the same text, produces a finding naming the message, the code where the message carries one, and `handler-in-force`; a mutant that drops the boundary comparison reports `cannot-tell` and reddens the suite by name.: pass

- ✅ Covered by T004 for the half this task owes: the SC1 claim quotes the criterion verbatim
  (`research/raw/m060-verdict-claims.json:79`, verified against `.project/intent/INTENT.md:30` this
  review), cites `scripts/error-routing.test.mjs` — the suite whose SC1 pin and M1 mutant this
  review ran green in wave 2 (`ℹ tests 16 / ℹ pass 16`) — and names the intent's own edge rows
  E1/E2/E8 as the holding coverage, which `.project/intent/INTENT.md:41-42,48` states. The claim's
  `proves` commands include the exact suite command this review executed.
- ✅ The claim re-derives rather than asserts: the census suite's
  `is exactly the list this head derives, so a citation cannot drift` and
  `quotes it, and cites an artefact that carries its reading` are green in this review's run
  (`scripts/tutor-record-shapes.test.mjs`, `ℹ pass 41`), so a claim whose quotation or artefact
  drifted would have reddened before this review read it.

### SC6 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table and digest pins moved in the same task, and the answer contains no remedy, no cause and no handler identity it was not given.: pass

- ✅ Covered by T004: the SC6 claim quotes the criterion verbatim
  (`research/raw/m060-verdict-claims.json:154`, matches `.project/intent/INTENT.md:35`), cites
  `apps/angular-ai-devtools/src/app/app.spec.ts` with the E7/E9 edge rows the intent assigns SC6,
  and the reading states the suite's 2 test declarations — the route-table test this review read at
  `apps/angular-ai-devtools/src/app/app.spec.ts:390-409` (lazy install, `data.surface`, exactly one
  route at the path) and the App create test. The rendering half the criterion also names is held
  by the pane spec this review read in wave 3 (`panel-demo.spec.ts:7395-7615`), which the claim's
  cited recordings (`research/raw/m060-surface.json`, `:57-60`) carry as the surface's own record.
- ✅ The claims record is itself the artefact T004 owes and the census holds it to the tree: the
  `held-out seed` reading in the run confirms SC1's edges are held by the suites the claims name,
  and `every artefact path a record names resolves at this head` is green (44/44), so no claim
  points at a file the tree does not carry.
