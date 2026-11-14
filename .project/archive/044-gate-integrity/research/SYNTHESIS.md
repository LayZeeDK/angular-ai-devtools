# Synthesis — M044 gate-integrity

This milestone did not run a separate research and decide phase: its problems were measured at four
specific heads before the intent was written, and each measurement named its own decision. This file
records the decisions the build then settled, and the evidence each rests on.

## D1 — A reference that names a path is not a reference that reads it

`scripts/performance-capture.test.mjs:1978` computes `join(ROOT, '.project', 'intent', 'INTENT.md')` only
to assert `intentPathForMilestone(ROOT, 'M040') !== live`; `scripts/navigation-capture.test.mjs:1763`
calls `copyFileSync(LIVE_INTENT, live)`. Both name the same path; only the second resolves it.

Decided: the archive-path check decides on the use of the path — a call that opens, copies, stats or tests
existence is a read and can be a finding; anything else is a naming and is recorded as clean with the use
it saw. A check that flagged both would redden every milestone after its own archive and be switched off.

## D2 — A log token is a claim only where the task declares it

Measured over M044's own tasks, the strict rule (`claims: 'log'`) reported `nx.json` absent from the range
because T001's Log mentions it in prose. Over the M040–M043 archives it reported 7, 18, 21 and 40 findings
respectively — a stage that could never be green.

Decided: the gate runs with `claims: 'declared'` — a path the task's own `files:` lists is a claim,
everything else is printed as a mention and not judged. `claims: 'log'` stays the export default so
T002's stricter cases keep running.

## D3 — The checks are stages of `npm run check`

`gate:archive-paths` and `gate:fix-record` are stages twelve and thirteen of the chain, and
`scripts/panel-typecheck-scope.test.mjs` asserts the stage list by name and count. A red check reaches the
gate as a refusal, proven by deleting a stage and observing the pin redden naming it.

## D4 — The ended-navigation terminal is recorded, not dropped

`extension/navigation-narrator.js:482` records a terminal for an entry addressing an id whose navigation
has already ended, producing `{ id: 3, url: '/claim/list', terminal: 'NavigationSkipped' }` from
`research/raw/m041-navigation.json`, while a navigation that ends normally still yields exactly one
terminal. The pin is fed the recorded stream, so a list rebuilt in the test cannot satisfy it.

## D5 — The panel fact follows the answer shape

`narrateNavigation` returns `{ state, absence, navigations, unattributed, skipped }`. The sample fact in
`apps/angular-ai-devtools/src/app/panel-demo.ts:257` must carry the same five fields, with `skipped`
derived from the join's own output for the recorded stream — measured `[]`, because the
`NavigationSkipped` witness lives in a separate frame from the warm frame the spec feeds.

## D6 — A cached green is not evidence

During T004's close-out, Nx replayed a cached terminal output and reported a failing `test:app` stage as
green. Decided: the app stage is measured with `--skip-nx-cache`, and the ship record cites a
cache-skipped run. This is the same defect class the milestone exists to remove, met in the tooling.
