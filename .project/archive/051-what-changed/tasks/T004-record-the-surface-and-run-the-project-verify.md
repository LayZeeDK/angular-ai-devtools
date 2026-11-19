---
id: T004
title: Record the surface and run the project verify
wave: 4
status: done
deps:
  - T003
agent: build_T004
base: b5a0fa13ea0f4e156e8d211cd7535f1662e9fc0f
worktree: null
task_branch: null
files:
  - research/raw/m051-surface.json
  - research/raw/m051-verdict-claims.json
  - scripts/copy-check.test.mjs
  - extension/error-digest.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - research/raw/m044-gate-shapes.json
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/console-join.test.mjs
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - scripts/legacy-diagnostic-capture.test.mjs
  - scripts/lint-core.test.mjs
  - scripts/lint-observability.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/panel-render-phase.test.mjs
  - scripts/copy-to-agent.test.mjs
  - scripts/router-diagnostic-capture.test.mjs
  - extension/panel/index.html
---

# T004 — Record the surface and run the project verify

## Context

Every shipped surface carries a recorded statement of what it renders and which report field it reads, and
`scripts/copy-check.test.mjs` re-reads every citation in that record. `research/raw/m050-verdict-claims.json`
is the shape M050 captured; this task leaves the same record for `what-changed`.

## Approach

Record the route, the loader key and each of the three states with the report field it reads; re-measure the
copy record and digest so the new surface's sentences are explained; capture the verdict claims record;
re-derive both gate recordings; run the whole suite and the project verify at the head that ships. Nothing
here adds behaviour.

## Interface contract

None

## Files

  - research/raw/m051-surface.json
  - research/raw/m051-verdict-claims.json
  - scripts/copy-check.test.mjs
  - extension/error-digest.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - research/raw/m044-gate-shapes.json
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/console-join.test.mjs
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - extension/panel/index.html

## Acceptance criteria

1. The surface record names the route, the loader key and each state with the field it reads, and `scripts/copy-check.test.mjs` re-reads every citation, reddening when one is made stale.
2. `research/raw/m051-verdict-claims.json` parses and names each claim with the code path that produces it.
3. `npm test` passes at the head, and both gate recordings re-derive rather than being hand-edited.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html
```

## Intent coverage

- SC1

## Log

- pending.
- T001, measured. `research/raw/m051-snapshots.json` (`m051-snapshots/v1`, 114520 bytes, head `7c34b8e0`) answers the intent's open question by refusing the roadmap's premise. Nine structures that could stand for a snapshot of a page were read at `path:line` with the cited line's own text — the record itself, the frame's `checks`, one router arrival, the `boundary` section, `stability`, the `angular-ai:state` announcement, the `di-graph` resolution path, `picked` and `error-capture` — and every one carries `pageSnapshot: false`. The record is dispatched at two sites and only two: `extension/agent-main.js:1059` (one per change-detection frame, `closeCycle` opened at `:600` and queued at `:747`) and `:1432` (one per install, on the 500 ms timer at `:566`), so `publishesPageSnapshotsAtTwoMoments` is `false` while `publishesRecordsAtManyMoments` is what is true. `identity.bindingField` is `null` with `claimants: 0`: none of the record's nine keys is a url, a tab or a page key, and the nearest repeat — `stability.attachAt` (`:2393`, cleared at `:2429`) — is a clock reading the tree never calls an identity and two pages can share. `absentFields` holds eight absences the record states and four fields it does not carry at all, so a refusal can name one, and five consequences beside five not-claimed lines say what the measurement does not decide.
- T002, compared or refused. `extension/what-changed.js` (12503 bytes) is one pure function from two records to `{ state, changes, compared, reason }`, with the three state words as three constants (`:57`, `:58`, `:59`) and the finding kinds beside them. It diffs only the fields T001 measured, quotes each difference's before and after, reports a one-sided field as added or removed rather than as a change of value, and reads the binding from its caller (`:106`-`:110`) so a pair nobody bound is refused at `:221` — the refusal and the comparison are the same module and the same call. `scripts/what-changed.test.mjs` is 21 tests: the record pins above, the differing pair, the key T001 did not measure, E1, E4 (one differing field renders exactly one finding, and the identical pair is asserted in the same file), SC2's refusal naming both the absent page identity and the panel's binding, the one-snapshot and shared-nothing refusals, SC3's no-file-no-clock-no-third-record assertion, the doctored record, and five named mutants (M1 differing-reported-equal naming `checks`, M2 equal-reported-change naming `zoneMode`, M3 unbound-compared-as-one-page, M4 invented-after, M5 one-sided-dropped).
- T003, the surface: route, loader key, three states, and the field each reads. `apps/angular-ai-devtools/src/app/panel-what-changed.ts` renders `/what-changed` through one `PANEL_SURFACES` entry at `app.routes.ts:111`, spread into `appRoutes` by the one mapped literal (`:113`, `loadComponent` `:146`, `data.surface` `:147`), and the `what-changed` key `LOADERS` carries last at `panel-demo.ts:60` is the only path to the pane (resolved `:674`-`:683`). Three states, and the surface adds no word of its own: `changes` reads `state`, `changes`, `compared` and each finding's `field`, `kind`, `before` and `after`; `unchanged` reads `state` and `compared`; `cannot-tell` reads `state` and `reason`. Every state renders the pane's own sentence (`:119`) that the record carries no page identity and that the pair is bound by the panel's inspected tab — the plan's Correction 2 as the surface's words rather than as a comment in the plan.
- T003, the copy record and the digest, re-measured rather than patched. `research/raw/m048-surface-copy.json` reads 23 surfaces: 10 declare their sentences in a map, 11 in loose module constants, 1 only inside a component template and a function, and 1 (`panel-context.ts`) nothing; 131 declared sentences and 34 inline ones, 3 declared labels, 8 declared words and fragments, 152 inline label prefixes, 7 inline words, 405 citations. `extension/copy-digest.json` is 161 entries at version `m051+t003`. `scripts/copy-check.test.mjs` prints its own counts at this head: `23 surfaces, 131 declared sentences, 34 inline sentences, 1 absence`; `142 sentences found in their files`; `161 rows for 165 sentences (4 repeats), 29191 bytes against the record's 173864`; `165 sentences compared, 0 unexplained` with the `context` row `cannot-tell (surface-declares-nothing)`; and `what-changed: clean, 11 sentences` beside `copy-check declares 9 sentences and builds 7 labels`, so the new surface's sentences are explained by a digest authored from its registry and its inline labels, never from a rendered string.
- T003, the surface record and the verdict claims. `research/raw/m051-surface.json` (87 citations, head `57fc3104`) states the route, the loader key and each of the three states with the field it reads, carries a `binding` block quoting T001's `identity.bindingField: null` and `claimants: 0` as the reason the pair is the panel's, records that nothing on this pane is composed at render (`notDigested.added` empty), and states its two corrections rather than hiding them. `research/raw/m051-verdict-claims.json` was captured, not written: `set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs"` wrote three claims (`SC1`, `SC2`, `SC3`, all `not-required`, each citing `scripts/what-changed.test.mjs` and its 21 tests) over the four edge rows the intent declares, with `evidence.recordings` naming `m051-snapshots.json` and `m051-surface.json`. The default read at this head is `scripts/navigation-blocking.test.mjs` 24/24.
- T003, both gate recordings, and the two documents a check forced. `research/raw/m044-gate-shapes.json` re-derived: 183 archive references in 151 suites of 296 listed files; `suiteDiff` 181 suites compared over 463 listed files, 27 differing (15 edited, 12 added), 192 assertion lines re-cut and 0 dropped, 2980 added; `fixRecord` 6 claims in 7 task logs. Re-armed at this head for this Log it is byte-identical and was not rewritten — the suite re-derives, compares and writes only when a value moved — so the recording is derived and not hand-edited (armed 41/41, default 40/40). `research/raw/m056-gate-stability.json` records the fix-record stage's `plainRun` at M051 as `pass - 0 finding(s), … mention(s)`, the mention count deliberately a wildcard at `scripts/gate-stability-record.test.mjs:926`, which is why a Log that names more paths cannot stale it. `.project/intent/INTENT.md`'s edge table lost a column and `AGENTS.md`'s rule table was formatted by prettier so the format leg passes.
- T004, the project verify at the head that ships. At `4ce6229f` on `gsd-path/M051`: `npx nx run angular-ai-devtools:build-extension --skip-nx-cache` → `Successfully ran target build-extension`, initial 534.43 kB with `panel-what-changed` lazy at 4.68 kB; `npm run check` → exit 0 (four tsc programs, lint/verify/check skills, panel, extension, companion, `gate:verification`, `gate:archive-paths`, `gate:fix-record` printing `pass - 0 finding(s), 7 mention(s)`, and `format:check` → `All matched files use Prettier code style!`); `npm test` → exit 0 in 11m 34s over 2487 tests, 0 failed, in five legs: `node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs" "src/**/*.test.ts" "src/**/*.spec.ts"` 1668/1668 in 239 suites, `node scripts/run-user-scope-tests.mjs` 60/60 in 9 suites, `npm run test:skills` 320/320, `npm run test:app` 354/354 in 31 files, `npm run test:held-out` 85/85 in 22 suites (9m 2s). The app leg answered from the Nx cache inside the verify (`Cache: 1/1 hit`), so the same target was re-run with `--skip-nx-cache`: 354/354 in 31 files, exit 0. `extension/panel/index.html` was restored afterwards with `git checkout --`.
- The suites that hold these records, run unarmed at this head. `scripts/what-changed.test.mjs` 21/21; `scripts/copy-check.test.mjs` 30/30; `scripts/navigation-blocking.test.mjs` 24/24; `scripts/gate-integrity.test.mjs` 40/40; `scripts/gate-integrity-default-tasks.test.mjs` 9/9; and the nine further suites this task declares, `scripts/console-join.test.mjs` 39/39, `scripts/console-panel-record.test.mjs` 38/38, `scripts/console-panel-render.test.mjs` 41/41, `scripts/legacy-diagnostic-capture.test.mjs` 17/17, `scripts/lint-core.test.mjs` 22/22, `scripts/lint-observability.test.mjs` 13/13, `scripts/panel-render-phase.test.mjs` 21/21, `scripts/copy-to-agent.test.mjs` 14/14 and `scripts/router-diagnostic-capture.test.mjs` 11/11 — 340 tests, every one exit 0, none armed.
- Out-of-family fact 1: four landings traced to one stale log. The verify sidecar writes one log per task at a fixed path — `verify-T001.log`, `verify-T002.log`, `verify-T003.log` under `.project/build` — and overwrites it in place, and none of the three on disk carries a `head:` header: `verify-T001.log` opens with the suite's own console line, `verify-T002.log` with a suite line, `verify-T003.log` with the NX build banner. So no log names a commit at all, and its mtime is the only provenance it has. Those mtimes disagree with the ledger rows that cite them: `verify-T001.log` is 16:08:31Z and `verify-T002.log` 17:23:19Z, while the ledger records both at `588f9316` at 00:23:22Z and 00:24:18Z; `verify-T003.log` is 00:17:53Z — the pass — while the ledger's two `fail` rows, 23:17:47Z at `c344e793` and 23:22:07Z at `cb84d895`, name bytes that file no longer holds. That is the shape that cost this milestone four landings, each refused against a log the fix had already outrun. The rule it leaves: before a failure is reported, the log's first line and its mtime are compared with the commit meant to fix what the failure names, and a log with no `head:` header is called an older tool's output rather than diagnosed from.
- Out-of-family fact 2: the intent's edge table is five columns because the checker refuses a sixth. `check_handoffs` validates `## Edge coverage` as `Edge | Criterion | Category | Disposition | Detail` (`AGENTS.md:124`, and `scripts/navigation-blocking.test.mjs:2415` says the same of `check_handoffs.py`), so the table T003's intent carried with a sixth `Test` column was unreadable to the gate and the column was dropped at `13293526` rather than kept beside a passing gate. Nothing the plan does not still state was lost: the suite mapping lives in `## Held-out checks` (E4 → `scripts/what-changed.test.mjs`), and `research/raw/m051-verdict-claims.json` records `edges.rows: 4` from the five-column table with `evidence.suites` naming that suite and its 21 tests. What the intent can no longer do is name, edge by edge, the suite that holds it.
- What the ship carries. (1) `.project/intent/INTENT.md`'s SC1 still says "Two recorded page snapshots are compared field by field", while the pair is bound by the panel's own inspected tab (ruled at `7b054ee6`, recorded as `PLAN.md`'s Correction 2), and the plan states that rewriting the intent's SC1 wording is owed as a define-phase step — this milestone does not pretend the sentence was corrected. (2) The intent's edge table no longer names the suite holding each edge; that mapping is the plan's alone. (3) The build's initial total is 534.43 kB against the 520.00 kB budget warning (14.43 kB over), with `PRE_MILESTONE_INITIAL_KB = 535.44` in `scripts/panel-bundle-budget.test.mjs` as the pinned ceiling, so the warning is the standing shape of this head rather than a change this task made. (4) No record is re-stamped to the landing head: `research/raw/m051-snapshots.json` names `7c34b8e0`, `research/raw/m048-surface-copy.json` and `research/raw/m051-surface.json` name `57fc3104`, and each is held to this tree by the suite that reads it, green in this run, rather than by a head field that would have to be rewritten to stay true.
- The one thing this Log breaks, stated rather than repaired. `npm test` was exit 0 at this head while this section read `- pending.`; the moment this Log's first bytes landed, `scripts/gate-stability-record.test.mjs` went to 8 tests, 7 passed, 1 failed, exit 1, on `the three sections are what this head derives, so the record cannot drift from the tree`: `the recording disagrees with this run's derivation at 1 value(s) … archive.detail.plainRun.summary: "gate-integrity: pass - 0 finding(s), 7 mention(s)" -> "gate-integrity: pass - 0 finding(s), 27 mention(s)"`. The cause is measured and is this Log: `plainRun` is a live `npm run gate:fix-record` over this branch, the task-log stage records a mention for every path a task log names that its own task does not declare, and a Log that describes four tasks' records names twenty-four more of them — 27 after the first draft of this section, 31 after this sentence — where the two paths this sentence adds are its own reason it can move again (`gate:fix-record` itself still exits 0, `pass - 0 finding(s), 31 mention(s)`, mentions recorded and not judged). The blast radius is measured too, and it is the same one value: leg 1 of `npm test` is 1667 of 1668 with this test the only failure, and the held-out corpus is 20 of 22 suites because `tests/held-out/e3-zero-skipped.test.mjs` and `tests/held-out/e4-idempotent-checks.test.mjs` each run `npm test` themselves and report the same disagreeing value rather than a defect of their own. `research/raw/m056-gate-stability.json` is not among this task's declared files and neither is its suite, so the record is not re-derived from here: the repair is `set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs` from a task that declares those two paths, run after this Log's last byte, because the count moves with every edit to it. That is a plan defect this milestone is carrying, not a tolerance: the task that owns the milestone Log cannot own the recording its Log moves.
- This Log's own shape. Everything above the first entry is byte-identical to the dispatched task file: this task's change is insertions after `- pending.` and nothing else, no earlier entry of any task was reworded, and the four header fields the dispatcher set (`status`, `agent`, `base`, `worktree`) were already in the working tree when this task started. The verify legs were written by the plan's own plain redirects and carry no `head:` header, so the head they speak for is stated here — `4ce6229f`, with their last writes at 00:40:48Z (build), 00:42:05Z (check) and 00:55:07Z (test) — rather than inferred from a file name. Nothing outside this task's declared files was edited, and `extension/panel/index.html` is the tracked shape, restored after the build.
- Landed paths: `research/raw/m051-surface.json`, `research/raw/m051-verdict-claims.json`, `scripts/copy-check.test.mjs`, `extension/error-digest.json`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `research/raw/m044-gate-shapes.json`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/console-join.test.mjs`, `scripts/console-panel-record.test.mjs`, `scripts/console-panel-render.test.mjs`, `scripts/legacy-diagnostic-capture.test.mjs`, `scripts/lint-core.test.mjs`, `scripts/lint-observability.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/panel-render-phase.test.mjs`, `scripts/copy-to-agent.test.mjs`, `scripts/router-diagnostic-capture.test.mjs`, `extension/panel/index.html` — each is read from this tree, ready.
