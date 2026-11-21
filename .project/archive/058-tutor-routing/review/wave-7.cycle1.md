# Review — wave 7, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 6ba3a011ea6f322167d003e1b351a029ceba5a09

Note on the checkout this review measured at: HEAD is `5b71032601c15f0a830f365c350c46262b63326b`
(T009, wave 8), one landing past the wave under review. Wave 8 owns one of the three recordings this
wave landed — the stability record, whose derived mention count is a function of the milestone's task
logs and which T009 re-derives after T004's Log (`.project/plan/PLAN.md:476-484`) — so the digest
this review prints for that record is the landing's (`f7724bf5…` at `6ba3a011`) beside the checkout's
(`2162f6c2…`, T009's re-derivation, 12 mentions). The other two recordings are byte-identical between
the landing and this checkout, re-hashed from `git show 6ba3a011:<path>` and from the working tree.

## T004 — Re-derive the recordings and run the project verify: pass

- ✅ Three recordings re-derived, each by the command its own record states, and the landing carries
  nothing else: `git show --stat 6ba3a011` reads `research/raw/m044-gate-shapes.json | 200 +++...`,
  `research/raw/m056-gate-stability.json | 4 +-`, `research/raw/m058-verdict-claims.json | 168 +++`,
  `scripts/gate-integrity.test.mjs | 16 ++` and the task file `11 +-` — `5 files changed, 346
  insertions(+), 53 deletions(-)`: no page, no build, no source file, no inventory-suite edit (AC2,
  `.project/tasks/T004-re-derive-the-recordings-and-run-the-project-verify.md:133-136`). Each record's
  `capture.command` names its own writer (`research/raw/m058-verdict-claims.json:63` — `set
  "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs"`;
  `research/raw/m056-gate-stability.json:84` — `set "M056_CAPTURE=1"&& node --test
  scripts/gate-stability-record.test.mjs`), matching the task's Approach (`:50-58`) and PLAN wave 7
  (`.project/plan/PLAN.md:441-447`). A byte/sha check at this checkout prints `research/raw/
  m058-verdict-claims.json 29847 bytes sha256 83c56d00b48ea131ece1827d88da8290e96c1fd0615f22262ab66161c0f1ae96`
  and `research/raw/m044-gate-shapes.json 152763 bytes sha256 36061e36c2136cb03e4eb383cc979dad00ea3aae17d51c8de844de4406c65105`
  — both byte counts and both digests exactly what the task Log states
  (`.project/tasks/T004-re-derive-the-recordings-and-run-the-project-verify.md:156`: "the verdict-claims
  record first write, 29 847 bytes, sha256 `83c56d00…` … the gate-shapes record 152 763 bytes, sha256
  `36061e36…`") — and the stability record is 6 568 bytes as the Log states but hashes `f7724bf5…`
  at the landing, not the `1f899ce7…` the Log states (GAP 1 below).
- ✅ Every default run this review executed is a read, so the read half of AC1's idempotence holds on
  all three records at this checkout: `node --test scripts/gate-integrity.test.mjs` is 40/40 green
  (`ℹ tests 40 / ℹ pass 40 / ℹ fail 0`) printing `research/raw/m044-gate-shapes.json at load: 152763
  bytes, sha256 36061e36c2136cb03e4eb383cc979dad00ea3aae17d51c8de844de4406c65105 / after the run:
  sha256 36061e36…` — load and after equal; `node --experimental-strip-types --test
  scripts/navigation-blocking.test.mjs` is 25/25 green printing `research/raw/m058-verdict-claims.json
  at load and after the run: 29847 bytes, sha256 83c56d00…`; `node --test
  scripts/gate-stability-record.test.mjs` is 8/8 green printing `research/raw/m056-gate-stability.json
  at load: 6568 bytes, sha256 2162f6c2… / after the run: sha256 2162f6c2…` and
  `✔ the three sections are what this head derives, so the record cannot drift from the tree` — at
  this checkout that holds against T009's re-derivation (12 mentions), which is the wave-8 ordering
  the plan assigns (`.project/plan/PLAN.md:476-484`), not a defect of this landing.
- ✅ The third reason row is the plan's stale enumeration, not a task overreach — the governing rule
  is the one the plan states and the task followed: `.project/plan/PLAN.md:448-449` says the suite-diff
  reason table "gains one declared row per suite this milestone added, written from the suite's own
  reading", and the task's parenthetical enumerating two ("the record suite T001 writes and the join's
  suite T002 writes", `.project/tasks/T004-re-derive-the-recordings-and-run-the-project-verify.md:61-63`)
  was written before T007's suite existed. The Log records the correction with the site it reddens at
  (`:157`): "`scripts/prove-skills-audited.test.mjs` (T007, landed after that enumeration was written)
  is a third suite this milestone added, and without its row the gate reddens at
  `scripts/gate-integrity.test.mjs:4014`" — and that site is what the code says:
  `scripts/gate-integrity.test.mjs:4012-4017` reads `const reason = SUITE_DIFF_REASONS[file];` then
  `if (typeof reason !== 'string' || reason === '') { fail(`${file} differs from ${MEASURED_HEAD} and
  no reason was read for it, so recording it would be a guess rather than a reading of the diff`) }`,
  the `fail` sitting at line 4014. The row itself states the suite's own property, quoted from
  `scripts/gate-integrity.test.mjs:5721-5722`: "wholly added at this head: M058 T007 pins the docs
  audit's coverage of the four proof skills the milestone lands, because the rows are landed and the
  audit check passes over them but no suite `npm test` runs re-reads the document, so a later audit
  edit that dropped one of the four would redden nothing" — the property being that the audit covers
  each of the four proof skills as a `## Doc:` heading or a `## Descriptive docs` entry, and the
  Summary's descriptive-docs tally is the number of entries the list carries, held by the suite's three
  cases (`scripts/prove-skills-audited.test.mjs:299` — `test('the docs audit covers each of the four
  proof skills, as a ## Doc: heading or a ## Descriptive docs entry', …)`, `:320` — the Summary count
  read as a number, `:338` — the mutant that removes one bullet), matching the row's "three cases hold
  it" and its "four proof skills" (`:45`). All three rows are readings rather than admissions to reach
  green: the run's own diff lines carry the rows' counts (`ℹ A scripts/prove-skills-audited.test.mjs:
  +390/-0, assertions +15/-0` against the row's "the fifteen assertion lines"; `ℹ A
  scripts/tutor-routing.test.mjs: +1796/-0, assertions +154/-0` against "the 154 assertion lines";
  `ℹ A scripts/tutor-routing-shapes.test.mjs: +2373/-0, assertions +149/-0` against "the 149 assertion
  lines" — counts the suite re-derives from git numstat, so a typed row would redden), and the block
  sits after the last line the M044 recording pins: the recording cites `scripts/gate-integrity.test.mjs`
  42 times and the highest cited line is 3811, while the appended block begins at :5709 with the
  comment stating that discipline (`scripts/gate-integrity.test.mjs:5709-5715` — "They travel here,
  appended after the last line the M044 recording pins in this file, for the same reason the blocks
  above do: a row added above one of those pinned references would stale it by moving it"). No earlier
  row was loosened, removed or reworded: the landing's diff to this file is 16 added lines, 0 removed.
- ✅ The verdict-claims record derives six criteria rows and they match the intent's six: the record's
  `evidence.intent.criteria` is `["SC1","SC2","SC3","SC4","SC5","SC6"]`
  (`research/raw/m058-verdict-claims.json:21-28`), one claim per criterion at `:76-167`, and the
  quotes block states the derivation is character-exact (`:6` — "the 6 criteria it declares are
  ["SC1","SC2","SC3","SC4","SC5","SC6"] and scripts/overlay-verdict-claims.test.mjs compares them
  character for character"). The check suite holds both halves at this head:
  `✔ rules every criterion the intent declares, quotes it, and cites an artefact that carries its
  reading` and `✔ is exactly the list this head derives, so a citation cannot drift` — so the rows
  cannot slide off the intent without reddening. The ten edge rows (`:34-44`, `"rows": 10`) carry the
  assignments the intent's own five-column table states — E1/E8/E10→SC1, E2→SC2, E3/E4/E5→SC3,
  E6→SC4, E7→SC5, E9→SC6 (`.project/intent/INTENT.md:118-127`) — and each row cites the suite the
  plan assigns, `scripts/tutor-routing.test.mjs` for SC1–SC5 and
  `scripts/tutor-routing-shapes.test.mjs` for SC6's E9 (`research/raw/m058-verdict-claims.json:45-56`,
  `:83`, `:158`), with the ruling `0 required, 6 not-required` (`:10-11`) and each reason naming the
  portal clause it answers rather than dodging it (`:14`).
- ✅ The final ordering — stability capture last, then land — is recorded where the next agent will
  find it, three times over: the task's Approach (`:55-58`) says the stability record is re-derived
  "**last**, after this milestone's last byte of prose, because one value it derives is a function of
  this milestone's own task logs (PLAN R4)"; the Log repeats it with the two values named (`:156` —
  "`plainRun.milestone` M057 -> M058 and the mention count 88 -> 10", and the M057 side is real:
  the record at M057's shipping head prints `"summary": "gate-integrity: pass - 0 finding(s), 88
  mention(s)"` with `"milestone": "M057"` at `5a57cd21`); and the plan carries it forward as the
  wave-8 hand-off (`.project/plan/PLAN.md:476-484` — "T009 … re-derives the census record after T004's
  capture … and then runs the project verify … as its last action, with nothing re-derived after it").
  The suites carry the enforcement the prose describes: the record's own `capture.reading` states the
  default run "asserts the committed record is exactly what this head derives, so the record cannot
  drift from the tree without failing" (`research/raw/m056-gate-stability.json:112`) and the stability
  suite runs `✔ the commit carrying the record sits ahead of the head the record pins`. What the Log
  does not record is the first attempt's drift failure by name — its only trace is the stash note
  (`:159`, "A stash from an earlier attempt (`m058-t004-wip`) was inspected and not applied: it
  predates T007/T008 …"), which names the stash but not the assertion that failed, and the Log's
  stability-record numbers are that earlier capture's (GAP 1).
- ⚠ unverified in this review: the armed half of AC1 — "a second armed run of each changes no byte"
  (`.project/tasks/T004-re-derive-the-recordings-and-run-the-project-verify.md:130-131`). The review
  runs read-mode only; an armed run is the recording's writer and would write the tree under review.
  What this review verified is the read half for all three records (the three hash-equal load/after
  outputs in the bullet above); the armed leg's write-side idempotence rests on the task's own runs.
- ⚠ unverified in this review: the direct-suite leg's four suites the task runs green —
  `scripts/panel-routes.test.mjs`, `scripts/copy-check.test.mjs`, `scripts/component-search.test.mjs`
  and `tests/held-out/fixture-explainers-unchanged.test.mjs`
  (`.project/tasks/T004-re-derive-the-recordings-and-run-the-project-verify.md:141-143`) — were not
  re-run here. The landing's own record covers them: `.project/build/verify-T004.log:364-365` prints
  `ℹ pass 147` / `ℹ fail 0` over the nine-suite leg and `:371` prints `All matched files use Prettier
  code style!` (the Log's "147/147" and clean prettier leg, `:158`).
- ⚠ Declared here so the next reader does not take it as hidden: the two inventory suites and the
  join's suite were executed green by this review at this checkout — `node --test
  scripts/tutor-routing.test.mjs scripts/tutor-answer.test.mjs scripts/tutor-record-shapes.test.mjs`
  is 41/41 (`ℹ tests 41 / ℹ pass 41 / ℹ fail 0`) with the census reading `T006 maps: M055 names 2
  outside itself, M057 names 2 outside itself, M058 names 2 outside itself, the subtraction is 6
  path(s) and the census reads 34 record(s)` and `ℹ 44 of 44 artefact path(s) resolve over 18 distinct
  file(s); 0 do not` — the map-beside-map reading AC4 demands, with the verdict-claims record this
  wave wrote among the six excused paths.
- Files the wave touched, read or not read, with the diff covered:
  `.project/tasks/T004-re-derive-the-recordings-and-run-the-project-verify.md` — read (whole file,
  159 lines; diff 11 +-), 100%; `research/raw/m058-verdict-claims.json` — read (whole file, 168
  lines; the entire new file), 100%; `research/raw/m056-gate-stability.json` — read (whole file, 115
  lines; diff 4 +-), 100%; `scripts/gate-integrity.test.mjs` — the landing diff read whole (16 added
  lines) plus its surroundings and the reason-lookup site (`:4005-4025`, `:5709-5723` of 5724 lines),
  <1% read line-by-line and 100% executed by the 40/40 run; `research/raw/m044-gate-shapes.json` —
  not read line-by-line (152 763 B): read structurally, every `gate-integrity.test.mjs` citation pin
  extracted (42 pins, highest line 3811) and every derived section re-derived by the 40/40 run.
  Read beside the diff: `.project/plan/PLAN.md` (the `## Wave 7` and `## Wave 8` sections, :429-486
  of 487 lines, ≈12%), `.project/intent/INTENT.md` (Success criteria through Constraints, :59-155,
  ≈62%), `scripts/prove-skills-audited.test.mjs` (the declaration lines and header comments :4-60,
  :190-205, :299-355 of 391 lines, ≈20%), `.project/build/verify-T004.log` (header and the leg
  summaries, ≈10%), `.project/review/wave-1.cycle1.md` (whole, the shape this file copies).

## Intent coverage

### SC5 — An answer never derives the destination from the final URL or the address bar: the destination it names is the `url` and `urlAfterRedirects` the terminal event itself carries, and where two navigations share an `id` their events are kept apart by the `id` and the `route.path` each event carries, never by arrival position — the abandoned navigation's own `RouteConfigLoadEnd` arrived 1192.1 ms after its cancel and 314.8 ms before the successor's, and the record's own attribution is "by route.path in the event's own payload, never by position" (`superseded.ordering`, `superseded.attribution`; `.project/ROADMAP.md:2053`); a mutant that reads the destination from the address bar, from `router.url` or from `currentNavigation()`, and a mutant that attributes a route-config event to the navigation that arrived beside it, redden.: pass

- ✅ Covered by T004: the verdict-claims record this wave wrote rules SC5 not-required with its
  `criterionText` the intent's own sentence, character for character
  (`research/raw/m058-verdict-claims.json:139` against `.project/intent/INTENT.md:96-103`, 832
  characters, `:140`), citing the edge row the intent assigns — E7 (`INTENT.md:124`) — and the
  artefact the plan assigns it, `scripts/tutor-routing.test.mjs` (`:143`, `:145` — "11 test
  declaration(s) in scripts/tutor-routing.test.mjs hold SC5 through the 1 ordering edge row(s) the
  intent assigns it, ["E7"]"), and the record is asserted by its check suite to be "exactly the list
  this head derives, so a citation cannot drift" (navigation-blocking run, 25/25).
- ✅ The mutants the criterion demands are live in the suite the row cites and green-held at this
  checkout: the join's run reddens `destination-from-the-address-bar` ("cannot-tell reads no
  destination from the address bar: a records object carrying an address bar changes nothing this
  module reports"), `destination-from-router-url`, `destination-from-current-navigation` and
  `route-config-attributed-by-arrival` ("the abandoned navigation owns the route-config events naming
  its own route path — its own RouteConfigLoadEnd arrived 1192.1 ms after its cancel and 314.8 ms
  before the successor's — because attribution is by route.path in the event's own payload and never
  by arrival position"), and `✔ held-out E7: a reused id keeps two decisions apart by id and
  route.path, never by arrival position` passes (41/41 across the three suites this review ran).
- ✅ The not-required ruling answers the portal clause rather than skipping it: the reason quotes the
  clause, states that no insurance-portal route can produce a fact about "what a stage examines, what
  a range is derived from or what a mutant reddens", and names the edge rows and the suite that hold
  the criterion instead (`research/raw/m058-verdict-claims.json:142`).

### SC6 — The answer is produced from the two observables the agent already holds — the recorded navigation stream and the router config it reads through the `Router` token its own injector walk resolves (`research/raw/m041-navigation.json` `reach.readFrom`: `routerTokenFrom` at `extension/agent-main.js:1750-1839` finds the token in entry 2 of a 5-entry path, resolving to the instance `ɵgetRouterInstance` returns, and the record states "No new tap is needed") — with no new page-side instrumentation, no second tap (`.project/ROADMAP.md:2049`) and nothing the record does not hold: no DOM, no console, no page global, no live page read (`extension/router-diagnostic.js:11-14`); a mutant that reads a live page value, starts its own tap, or answers from a field the record does not carry reddens.: pass

- ✅ Covered by T004: no page read and no capture beyond what the records state — the landing commit
  touches exactly the three recordings, the gate suite and the task file (`git show --stat 6ba3a011`),
  every armed capture writes only the record its `capture.command` names, and the surface record, the
  copy record, the digest and the inventory-suite edits are absent from the diff, re-read and not
  re-authored (AC2, `.project/tasks/T004-re-derive-the-recordings-and-run-the-project-verify.md:133-136`).
- ✅ The read discipline the criterion demands of production holds on the records themselves: all
  three default runs are byte-reads with the digests equal before and after (the three outputs quoted
  in the first bullet), so the captures this wave landed cannot be mistaken for live page work and
  the default runs cannot write the tree they read.
- ✅ SC6's own row in the record is derived, not typed: it cites E9 and
  `scripts/tutor-routing-shapes.test.mjs` (`research/raw/m058-verdict-claims.json:152-166`, reading
  "20 test declaration(s) in scripts/tutor-routing-shapes.test.mjs hold SC6 through the 1 precision
  edge row(s) the intent assigns it, ["E9"]"), the suite whose E9 pin the wave-1 review verified
  re-derives the reach from the agent's source, and the row's `proves` commands are the record's own
  capture command, that suite, and `npm run check` (`:161-165`).

#### GAP 1 — the Log's stability-record identity line is the failed first attempt's measurement, not the landed record's: `.project/tasks/T004-re-derive-the-recordings-and-run-the-project-verify.md:156` states "the stability record 6 568 bytes, sha256 `1f899ce7…`, last, because two of its values are a function of this milestone's logs — `plainRun.milestone` M057 -> M058 and the mention count 88 -> 10", but the record landed in the same commit reads `"summary": "gate-integrity: pass - 0 finding(s), 11 mention(s)"` at `research/raw/m056-gate-stability.json:33` and hashes `f7724bf582cd83b999188b5e4e6e65d31f09f4cb6000f6416d10fbf2613cc634` at `6ba3a011` (6 568 bytes — only the digest is wrong); `1f899ce7…` matches no committed blob (all 38 commits in the file's history were hashed) and no stash blob (stash@{0} `m058-t004-wip` = `bf5e6270`, whose copy hashes `bd7b0fba…` at 6 567 bytes with 7 mentions). The count the Log states is one below the landed record's, and the difference is the size of the task's own Log naming the record — the `Landed paths` line (`:155`) names `research/raw/m056-gate-stability.json`, which is exactly the self-reference the drift assertion guards: a Log line naming the record moves the count that record derives. Under the ordering the task itself states (capture last, after the last Log byte), the Log can never truthfully state the final capture's digest — any digest it states is of an earlier capture — and it does not say so. (Severity: low.)
Risk: low — the landed record is held to the tree by its own suite (`node --test
scripts/gate-stability-record.test.mjs`, 8/8: "the three sections are what this head derives"), the
wave-8 ordering supersedes it as planned (T009's re-derivation, 12 mentions, sha256 `2162f6c2…`, is
what this checkout carries and the same suite holds it green), no wave deliverable reads the Log's
digest, and a reader who takes `1f899ce7…` as the landed record's identity falls back to the suite
that owns the value and re-derives it in one command; the residue is a stale sentence in a Log, not a
wrong artefact.
