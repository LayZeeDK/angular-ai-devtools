# Final Review — M029 trust-bypass-triage

Reviewed HEAD: f653517516b891b32cf2b152bea9e47b2ec8c935
Overall verdict: pass

<!-- Both gap lenses passed. Lens 2 added a `strippedTag` field to the stripped finding and the triage suite
reddened in four places, so the module's silence about what was stripped is enforced, not asserted. -->

## Success criteria

### SC1 — On the fixture, a template binding whose value the sanitizer strips produces a PBR-1 finding naming the element the strip occurred on, the component whose template wrote it, and the time of the strip, and names the binding only when the element's own record carries it — otherwise the finding says it cannot attribute the binding.

- **Verdict**: met
- **Check**: `node --test scripts/sanitizer-triage.test.mjs` and `node --test scripts/panel-sanitizer.test.mjs`
- **Observed**: 23 pass and 13 pass, 0 fail, 0 skipped. From T001's recording, the warning at 2426.3 ms falls inside
  cycle 2's template-update window and yields the two components that record names, with the time; the first-render
  warning at 1401 ms yields `cannot-tell` naming `no-covering-profiler-record`
- **Reference**: `extension/sanitizer-triage.js`; `research/raw/m029-sanitizer-warning.json`; T002 `4da0635`
- **Finding**: the finding names the component the covering record carries and the time of the strip, and names a
  binding only when the element's record carries one — which the measured record never does, so no binding is named.
  The element is the fixture's own (`#unsafe`); the join's share is component and time, which is what SC1 was narrowed
  to after T001 measured `identifiesTheWrittenElement: false`.
- **Fix direction**: none

### SC2 — The finding is produced from the console warning the sanitizer already emits, joined to the profiler's binding and template events, with no new page-side instrumentation and no patch of the sanitizer.

- **Verdict**: met
- **Check**: the module's `node:vm` world, which provides `console`, `ng.ɵsetProfiler` and `performance`
- **Observed**: zero calls recorded against all three, and removing the console capture leaves no finding
- **Reference**: `scripts/sanitizer-triage.test.mjs`; N1
- **Finding**: the module reads the two lists it is given and installs no reader of its own. Nothing was patched:
  the sanitizer is untouched, and the occurrence comes from the warning Angular already emits.
- **Fix direction**: none

### SC3 — A page where no strip occurred produces no finding, and a warning with no binding record it can be joined to produces a "cannot tell" state naming that absence, rather than a guessed binding.

- **Verdict**: met
- **Check**: the absence paths, and `node --test scripts/sanitizer-bypass.test.mjs`
- **Observed**: no warning yields `none` and never `clean`; a warning with no covering record yields `cannot-tell`
  with no component field; the bypass binding produced no warning while the stripped binding produced two, in one load
- **Reference**: `extension/sanitizer-triage.js`; `research/raw/m029-sanitizer-bypass.json`; T004 `68abbb2`
- **Finding**: an absence is reported as an absence, and a deliberate bypass is proved by the warning not appearing
  where a stripped binding on the same page warns. A page with neither signal is reported as neither state.
- **Fix direction**: none

### SC4 — The panel renders the finding and its explanation from a short fact list, and shows the "cannot tell" state when the warning cannot be attributed.

- **Verdict**: met
- **Check**: `scripts/panel-sanitizer.test.mjs`, its six states, and the route pin
- **Observed**: 13 pass; making `cannot-tell` render a component reddens it; renaming the route gave `1 failed | 330 passed`
  at `chat-entry.component.spec.ts:604`
- **Reference**: `apps/angular-ai-devtools/src/app/panel-sanitizer.ts`; T003 `a9d844a`
- **Finding**: the surface renders the fact list and the absence state only. It names no tag, attribute, removed
  substring or cause, and it renders an error's reason as nothing at all, because a reason is a cause.
- **Fix direction**: none

### SC5 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: `workflow_run.py prepare-final`
- **Observed**: exit 0 in 13m49s at `f6535175`, including `npx nx run ai-devtools-companion:build`; the run before it
  failed on the stale dev-build recording and before that on the fixture's unbuilt companion
- **Reference**: `.project/build/evidence.json`
- **Finding**: both gates pass at the head. Two of the three failures this gate produced were defects in the
  milestone's own bookkeeping — a recording nobody re-measured and a build step the plan never ran — not in the code.
- **Fix direction**: none

## Any expected failures

None. The wave-2 review could not run `scripts/sanitizer-bypass.test.mjs` in its sidecar because the fixture's app
dependencies were absent there; that suite ran in the primary at landing (10 pass) and again inside the passing ship
Verify at this head, which is the evidence this review relies on.

## Observations outside the criteria

**`bindingOf` reads a field the page agent never writes.** The gap panel found that the module's fallback reads a
binding name from a profiler record field that `extension/agent-main.js` does not populate, so the binding branch is
dead in practice. It is harmless — the branch only fires when the record carries one — but it is a claim the evidence
cannot exercise, and the next milestone that needs binding-level attribution should not assume it works.

**`gsd verdict-record` truncated wrapped criteria.** It parsed the criteria section one line at a time, so any
criterion that wrapped lost everything after its first line. Fixed in `verdict-record.mjs`, and the same defect in
`scripts/overlay-verdict-claims.test.mjs`'s own parser was fixed with it — otherwise the corrected recording would have
failed against the old parser and the natural repair would have been to truncate again.

**A skipped test cannot coexist with held-out edge E3.** T001's capture skipped its live case by default, and E3 fails
any `npm test` run with a non-zero skip, so SC5's gate was red for two build cycles before the ship Verify named it.
T007 moved the server-spawning part out of the `*.test.mjs` glob rather than weakening a check.
