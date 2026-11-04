# Final Review — M028 after-render-ordering

Reviewed HEAD: 9aef03ef188f1696f338c94a4a323d45680309f3
Overall verdict: pass

<!-- Both gap lenses passed. Lens 2 reversed `after` in the ordering module and the panel suite reddened, so the
surface consumes the module's order rather than re-deriving one. -->

## Success criteria

### SC1 — On the fixture, a component whose `afterNextRender` reads `offsetWidth` before layout produces a COR-1 finding naming the read, the phase it ran in, and the after-render events around it.

- **Verdict**: met
- **Check**: `node --test scripts/after-render-fixture.test.mjs`
- **Observed**: 5 tests, 5 pass, 0 fail. The read is executed, not matched: the component's source is
  transpiled and run against stub elements — `{ offsetWidth: 0 }` returns 0 without throwing, `{ offsetWidth: 640 }` returns 640, and a counting getter shows the hook reads `offsetWidth` exactly once
- **Reference**: `scripts/after-render-fixture.test.mjs`; `spikes/ng222-app/src/app/after-render-page.ts`; T001 `c55790f`
- **Finding**: the fixture read exists and is exercised. `grep -rn 'setProfiler\|ɵsetProfiler\|subscribe('`
  under `spikes/ng222-app/src/app/` returns nothing, so nothing page-side supplies the events (N1).
- **Fix direction**: none

### SC2 — The finding is produced from the ordered profiler after-render events alone, with no new page-side instrumentation.

- **Verdict**: met
- **Check**: `node --test scripts/after-render-ordering.test.mjs` and `node --test scripts/panel-after-render.test.mjs`
- **Observed**: 16 pass and 12 pass, 0 fail. Reversing `after` inside `extension/after-render.js` reddens the
  ordering suite with an emission-order diff, and the gap panel's own reversal reddened the panel suite the same
  way; both restored, `git status --porcelain` clean apart from the review artifacts
- **Reference**: `extension/after-render.js`; `apps/angular-ai-devtools/src/app/after-render.ts`; T002 `d2a48e4`, T003 `b5a66ce`
- **Finding**: the ordering is produced by the module and consumed by the surface, and reversing it reddens both
  sides, so the surface does not re-derive an order of its own.
- **Fix direction**: none

### SC3 — A read with no after-render event in the profiler list produces a "cannot tell" state naming that absence, rather than attributing the zero width to layout.

- **Verdict**: met
- **Check**: the three result states and the absence path
- **Observed**: an empty list, all-events-before-the-read, or a read with no position each yield
  `{ state: "cannot-tell", reason: "no-after-render-event" }` with exactly two keys; no rendered string contains
  layout, cause, reflow or "before layout"
- **Reference**: `extension/after-render.js`; the wave-2 review's rendered-output search
- **Finding**: the absence is named and no cause is invented (N2). A read that cannot be placed is treated as an
  absence rather than an invented order.
- **Fix direction**: none

### SC4 — The panel renders the ordered chain and its explanation, and shows the "cannot tell" state when the list holds no after-render event for the read.

- **Verdict**: met
- **Check**: the surface states and the route pin
- **Observed**: `loading`, `ordered`, `cannot-tell` and `unknown` all render from the chain supplied; making the
  absence render an empty string reddens the panel suite; renaming the surface route gave `1 failed | 330 passed`
  at `chat-entry.component.spec.ts:603`
- **Reference**: `apps/angular-ai-devtools/src/app/after-render.ts`; T003 `b5a66ce`
- **Finding**: the surface shows the chain and the absence, and adds no prose the chain does not support (N4).
- **Fix direction**: none

### SC5 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: `npm run check` and `npm test` at the ship head
- **Observed**: ship Verify exit 0 in 8m26s at `9aef03ef`; `npm test` green at 431 + 60 + 628 + 331 + 85
- **Reference**: `.project/build/evidence.json`
- **Finding**: both gates pass at the head, with the four recordings re-recorded through their own tooling rather
  than hand-edited.
- **Fix direction**: none

## Any expected failures

None.

## Observations outside the criteria

**A model pin did not hold.** The gap panel was dispatched as `free-glyph-cluster-medium` and self-reported running
on `claude-sonnet-4.5`. The same substitution was seen earlier from `free-beam-*` dispatches. Attribution of
quota spend is therefore unreliable for at least two free routes, which matters because the daily pool is the
programme's only budget signal.

**`gsd verdict-record` truncates wrapped criteria.** It parses INTENT criteria line by line, so M028's SC1 is
recorded only up to "…produces a COR-1 finding"; the suite parses the same way, so the pair is green while the
recording does not quote the criterion in full.
