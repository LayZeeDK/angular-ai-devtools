# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: fce943d564ece989d4801c8fcddbc430f25f33a7

## T002 — Answer from the console record, purely: pass

- ✅ The landing is the join and its suite and nothing else: `git show --stat 9b45eed5` reads
  `.project/tasks/T002-answer-from-the-console-record-purely.md | 11 +-`,
  `extension/teardown-leak.js | 883 +++`, `scripts/teardown-leak.test.mjs | 1431 +++`,
  `3 files changed, 2322 insertions(+), 3 deletions(-)`. The suite is green at this head:
  `node --test scripts/teardown-leak.test.mjs` prints `ℹ tests 18 / ℹ pass 18 / ℹ fail 0`, and
  `npx prettier --check extension/teardown-leak.js scripts/teardown-leak.test.mjs` (run here over all
  four milestone files together) prints `All matched files use Prettier code style!`.
- ✅ The join answers only from the two records T001 measured, and the suite proves it rather than
  asserting it: the module runs in a bare `node:vm` context with nothing in it
  (`scripts/teardown-leak.test.mjs:167-181`, `createContext({})`), a getter-counting records object
  shows zero page or clock reads (`:688-708`, "a getter it touched is a value it read", green — the run
  printed `T002 purity: bare context, 19 reaches scanned and absent, 5 claims, no page read`), the
  reach scan holds 19 forbidden tokens out of the comment-stripped source (`:127-147`, `:711-727`), and
  the fields it declares it ignores — `message.message`, `message.component`, `message.location`,
  `message.timestamp`, `page`, `clock`, `lastMounted`, `arrivalOrder` — are pinned by test
  (`extension/teardown-leak.js:205-216`, held at `scripts/teardown-leak.test.mjs:781-796`).
- ✅ `owner` can never be filled from anything but a message field. The one write path is
  `ownerOf` (`extension/teardown-leak.js:291-297`): `const owner = message.owner; if (typeof owner ===
  'string' && owner !== '') return owner; return null;` — read only of the message handed in. It is
  consumed exactly once, as `owner: ownerOf(message)` inside `diagnosticOf` (`:413`), and flows to the
  answer as `found.owner` on a finding (`:858`) or as the literal `null` on `cannot-tell` (`:784-792`),
  `absent` (`:797-809`) and `empty` (`:818-828`). Nothing reads `component` — it is in `IGNORED`
  (`:207`) — and the suite holds both halves: a message carrying `component` still answers
  `owner: null` (`scripts/teardown-leak.test.mjs:375-385`, the run's SC1 lines show `owner null`), and
  a message with its own `owner` field renders that field and nothing substituted for it
  (`:388-400`).
- ✅ The absences hold as the contract states them. `handle-record-not-held` is pushed in every state —
  `empty` (`extension/teardown-leak.js:824`), `cannot-tell` (`:766`), `absent` (`:799`), `finding`
  (`:851-853`) — held by `pinHandleAbsenceEverywhere` over all four states
  (`scripts/teardown-leak.test.mjs:478-498`, green; the run's four state lines each list it).
  `owner-not-in-the-message` is stated beside the code exactly where SC1 requires it — on a finding
  whose message names no owner (`extension/teardown-leak.js:852`: `if (found.owner === null)
  absences.push(ownerAbsenceOf(found.message));`) — and deliberately not on states where no message was
  read; the module's own doc says exactly that (`:76-80`: "handle-record-not-held holds in every
  answer, in every state"), and the suite pins the boundary from the other side: with an `owner` field
  present, `absences` is `['handle-record-not-held']` alone (`scripts/teardown-leak.test.mjs:396-400`).
- ✅ No path in the module names a handle. Every answer in five shapes is stringified and matched
  against `HANDLE_VOCABULARY = [/subscription/i, /\beffect\b/i, /\btimer\b/i, /leak/i]`
  (`scripts/teardown-leak.test.mjs:119-124`, held at `:502-519`, green), and the only sentences in the
  module that contain the word "handle" name its absence — `extension/teardown-leak.js:505` ("so the
  release ran first and no handle is named as the cause of the diagnostic") and `:479` ("no record this
  join reads carries a per-injector handle") — which is the absence rendering, not an identity.
- ✅ The seven mutants are real, not decorative. Each `M1`–`M7` block asserts four things: the pin is
  green on the shipped module; the mutant produces the intended wrong observable (`M1` answers
  `finding` with `code: null` at `scripts/teardown-leak.test.mjs:1236-1246`; `M2` attributes
  `'another-component-the-capture-names'` at `:1272-1278`; `M3` renders `leaked subscription` in
  `detail` at `:1300-1307`; `M4` returns an object with no `owner` key at `:1329-1334`; `M5` triggers
  the counted getter `['page.url']` at `:1356-1363`; `M6` folds the absences to `['no-findings']` at
  `:1385-1391`; `M7` answers `absent` at `:1413-1418`); the failure message matches the defect pattern
  and names the defect by string; and the file on disk still passes afterwards (`:1256-1261`). The
  anchor test (`:1192-1220`) asserts every anchor selects exactly one place in the shipped source and
  that no two mutants produce one source. I also applied M1's diagnostic-site edit by hand outside the
  suite: the shipped join answers `finding "NG0205"` where the edited source answers differently —
  the mutation really changes the shipped behaviour, and the pin that names it really reddens
  (`ℹ M1: the finding must carry the code the record carries — NG0205 — and it carries no other`).
- ✅ T002 named the drift its landing would cause instead of hiding it: the Log states the shapes
  suite's denominators would move and scopes the repair out of its own `files:`
  (`.project/tasks/T002-answer-from-the-console-record-purely.md:84`). The repair happened in T006 and
  its incompleteness at this head is judged in wave 1's review, not here.
- ⚠ Two declared limits, not defects. (a) The bare line `if (code !== CODE_SEARCHED) continue;` occurs
  twice in the module — `extension/teardown-leak.js:378` (digest scan) and `:406` (diagnostic scan); the
  suite's M1 anchor is the two-line form with `const code = codeOf(body);`
  (`scripts/teardown-leak.test.mjs:1069-1072`), unique by the anchor test, so the mutant is precise; a
  one-line edit of the digest scan also reddens, but through `DIGEST_DOES_NOT_CARRY`. (b)
  `ownerAbsenceOf`'s sentence says the owner field "is not among them"
  (`extension/teardown-leak.js:458-465`) — true for every measured message, but a message carrying
  `owner: ''` would render that sentence while the field is present (`ownerOf` at `:294` rejects the
  empty string); cosmetic, no attribution moves, non-blocking.
- ⚠ unverified in this review: `npm run check` at HEAD — not run here; note that it does not execute
  `scripts/teardown-leak-shapes.test.mjs` (the `check` script's legs are tsc/lint/gates/format), which
  is why wave 1's red suite shipped through green ledgers. The wave-1 record staleness does not touch
  this suite: it consumes only stable fields of the record — the digest entry
  (`scripts/teardown-leak.test.mjs:826-854`, re-verified identical by re-running the digest command),
  the printed message (`:87`) and the portal drive's console lines (`:90`) — and it is green.
- Files the wave touched, read or not read: `extension/teardown-leak.js` — read (whole file, 883
  lines), 100%; `scripts/teardown-leak.test.mjs` — read (whole file, 1431 lines), 100%;
  `research/raw/m059-record-shapes.json` — read (whole file, 949 lines), 100% (the record the join is
  built to); `scripts/teardown-leak-shapes.test.mjs` — read (whole file, 2689 lines), 100% (the
  boundary the join is held to, and wave 1's deliverable);
  `.project/tasks/T002-answer-from-the-console-record-purely.md` — read (84 lines), 100%;
  `.project/review/wave-2.cycle1.md` (the skeleton this review replaces) — read, 100%;
  `extension/error-digest.json` — read (`:59-62`), the NG0205 entry covered; `.project/tasks/T001-…md`
  and `.project/tasks/T006-…md` — read, 100% (wave 1's scope, cited here only for the drift hand-off);
  `.project/build/verify-T004.log`, `verify-T005.log`, `verify-T006.log` — not read whole, targeted
  grep only.

## Intent coverage

### SC1 — A component that touches its injector after teardown produces a finding naming the code `NG0205` and the message body the record carries, and naming the owning component only where the record attributes one — where it does not, the answer reports the named absence `owner-not-in-the-message` beside the code instead of guessing the element or the component (`.project/ROADMAP.md:2096`, `extension/error-digest.json` `NG0205`); a mutant that suppresses the code match, and a mutant that attributes the message to the most recent component, redden.: pass

- ✅ Covered by T002: a record carrying the diagnostic answers `finding NG0205 "NG0205: Injector has
  already been destroyed." owner null, absences ["owner-not-in-the-message",
  "handle-record-not-held"]` (the run's own line), with the body read from `text` and the stack frame
  dropped by the same rule the shipped lint join uses (`extension/teardown-leak.js:183`, `:252-255`,
  held against `extension/lint-core.js:100`, `:124`, `:126` at
  `scripts/teardown-leak.test.mjs:891-908`).
- ✅ Both named mutants redden on the shipped code: M1 (suppressed code match) is caught by
  `pinFinding` naming the code (`scripts/teardown-leak.test.mjs:1225-1263`) and M2 (attributed to the
  last component seen) by `pinOwner` (`:1265-1291`) — each shown to change the answer before the pin
  reddens, and each green again from disk afterwards.

### SC2 — The answer is produced from the observables the agent already holds — the console record it subscribes to, and the element/component record it already keeps — with no new page-side instrumentation, no second tap and nothing the record does not carry (`.project/ROADMAP.md:2099`); a mutant that starts its own subscription, hooks `setTimeout` or reads a live page value reddens.: pass

- ✅ Covered by T002: the join is a pure function of its `records` argument — bare-context load,
  getter-counting purity pin, 19-token reach scan and the `IGNORED` list all green (the T002 bullet
  above). It uses less than the permitted set — the console record and the digest, no component record —
  which is what T001's absence measurement forces ("Building one would be the page-side
  instrumentation D7 and SC2 forbid", `research/raw/m059-record-shapes.json:582`).
- ✅ The live-page mutant reddens: M5 reads `read.page.url` into the detail and is caught by the
  getter-counting pin (`scripts/teardown-leak.test.mjs:1349-1376`), the mutation shown to touch the
  page getter (`accesses` becomes `['page.url']`) before the pin fails.

### SC3 — An unsubscribe that ran before the write it was meant to prevent reports no leak rather than a wrong cause (`.project/ROADMAP.md:2102`): where the record shows the handle was released and the diagnostic still arrives, the answer names the sequence it read and the code, and names no handle as the cause; a mutant that renders "leaked subscription" for a released handle reddens.: pass

- ✅ Covered by T002: a release record ordered before the diagnostic renders
  `release-then-diagnostic` with "no handle is named as the cause" in `detail`
  (`extension/teardown-leak.js:492-507`), a release after it renders `release-after-diagnostic` and is
  "not its cause" (`:508-521`), and no release record renders `sequence-not-stated` (`:523-538`) —
  held by `pinReleaseThenDiagnostic`, `pinReleaseAfterDiagnostic` and `pinNoRelease`
  (`scripts/teardown-leak.test.mjs:403-474`, green; the run printed the rendered sentence).
- ✅ The leaked-subscription mutant reddens naming the defect: M3 renders "a leaked subscription the
  release was meant to prevent" and is caught by the `leak` vocabulary pin
  (`scripts/teardown-leak.test.mjs:1293-1320`), and the two-absences-folded mutant M6 is caught beside
  it (`:1378-1404`).

### SC4 — The answer never names a subscription, effect or timer identity: it names the code, the message body, and the absence `handle-record-not-held` — a mutant that renders any handle name, or that infers one from the message body, reddens (C1, C2).: pass

- ✅ Covered by T002: `handle-record-not-held` is in every state (the T002 bullet above), no answer in
  five shapes carries the handle vocabulary (`scripts/teardown-leak.test.mjs:502-519`, green), and no
  owner or cause is inferred from the message body — the stack is dropped before anything is named
  (`extension/teardown-leak.js:250-255`, "so no name that only a frame carries rides out on the
  answer"), and the owner absence is stated beside the code instead
  (`scripts/teardown-leak.test.mjs:331-335`).
- ✅ The record T001 measured binds the vocabulary to the tree: the join is held to
  `SHAPES.absences['handle-record-not-held'].occurrences === 0`
  (`scripts/teardown-leak.test.mjs:870-874`) — the count this review re-verified by its own scan of the
  three globs with the milestone's own files excluded (0 / 0 / 0).

### SC5 — The panel grows by exactly one surface, one ordered path, one `LOADERS` key and its digest rows, and every suite that enumerates those tables is updated in the same task: `app.spec.ts`, `page-picker.component.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `scripts/panel-copy.test.mjs` and `research/raw/m059-surface.json` (`.project/ROADMAP.md:2097`); a mutant that adds the route without a loader key reddens naming the surface.: pass

- ✅ Covered by T002 for the half this task owes: the join's claim shape — every answer carries all
  seven fields in every state and every `claims[]` entry carries a non-empty `artefactPath` that is a
  file this tree carries (`scripts/teardown-leak.test.mjs:521-577`, green) — so each rendered claim
  names the record or digest that states it, which is the join-side prerequisite for the surface and
  its enumerating suites.
- ⚠ Scope, stated: the route table, `LOADERS` key and the enumerated suites named in this criterion
  are T003's deliverable and are not judged in wave 2; this review judges only the join half T002
  ships.
