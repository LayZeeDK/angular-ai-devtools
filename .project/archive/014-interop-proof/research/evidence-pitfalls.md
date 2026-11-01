# Evidence — pitfalls

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: pitfalls
Questions assigned: [RESEARCH] Which instance, and which panel route, produce a sliced node set from `/stale-view`, and what does the panel report when the effect has already run before the panel attaches?

## Finding: The spikes fixture fires its error effect during component init, before any panel can attach

- **Claim**: `StaleViewFixture` registers `effect(() => { this.subject.error(new Error('interop')); })` inside its constructor, alongside `toSignal(this.subject)` (labelled `toSignal.source`/`toSignal.state`) and a `subject.subscribe` that sets `value`. The effect is scheduled on the first change-detection pass, so by the time the page is served and the panel attaches the Subject has already errored.
- **Source**: `spikes/ng222-app/src/app/stale-view-fixture.ts:1-23` (constructor lines 15-22); keep-list rules in `src/main-world/interop-keep-list.ts:1-40`.
- **Confidence**: high
- **Why it matters here**: E3 pins that a null result must be recorded, never smoothed; the effect has already run, so no live slice is captured.

## Finding: The interop panel route the driver pushes is `/panel/interop`, not `/stale-view`

- **Claim**: For `feature === 'interop'`, `drivePanel` pushes `history.pushState` to `/panel/interop` and records `location.pathname`; the check requires the route to match `/\/panel\/interop\/?$/` or else reports "could not run". The spikes app's own route is `/stale-view` (rendering `StaleViewFixture`), which is a different app from the panel's Angular app.
- **Source**: `.commandcode/skills/control-ai-browsers/scripts/panel.mjs` lines ~230-250 (isInterop branch, `panelPath = 'interop'`); `spikes/ng222-app/src/app/app.routes.ts:1-6`; `apps/angular-ai-devtools/src/app/app.routes.ts:14-15`.
- **Confidence**: high
- **Why it matters here**: The "panel route" the check drives is `/panel/interop`; `/stale-view` is the inspected page's route, not a panel route, so a slice is never produced "from `/stale-view`" via a panel route.

## Finding: The keep-list survives only `toSignal.source`/`toSignal.state` nodes and an unlabelled effect whose source contains `subject.error`

- **Claim**: A node is kept iff `label === 'toSignal.source'` or `'toSignal.state'` (Rule 1) OR its text contains a whole-token `subject.error` match (Rule 2). The fixture's effect node is unlabelled and survives only via Rule 2; the `subject.error` regex requires word boundaries, so `subject.errorHandler`/`xsubject.error` do not match.
- **Source**: `src/main-world/interop-keep-list.ts:20-33`; `src/main-world/interop-keep-list.spec.ts` (whole-token tests).
- **Confidence**: high
- **Why it matters here**: The slice depends on the error effect's node surviving the filter; if the effect already ran and the graph is torn down, neither rule can match a live node.

## Finding: The panel reports an explicit empty state when no slices exist

- **Claim**: `InteropComponent` renders `<p class="empty" data-testid="empty-state">no interop findings</p>` when `svc.slices().length === 0`, and "unavailable: signal graph destroyed" (`data-testid="unavailable"`) only when `svc.unavailable()` is true (set when the Prompt API is unavailable, not on graph teardown). The check treats `nodes < 1` as a failure with "the panel rendered no interop slice node".
- **Source**: `apps/angular-ai-devtools/src/app/interop.component.ts:13-16`; `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` (nodes assertion and `failed.push` "rendered no interop slice node").
- **Confidence**: high
- **Why it matters here**: When the effect already ran before attach, the panel reports "no interop findings" with zero nodes, and the check exits 1 with `CLAIM: ... rendered no interop slice node` (or could-not-run if the route is wrong).

## Finding: Which instance produces a slice cannot be determined statically

- **Claim**: `checks/interop.mjs` accepts any named instance from `instances.json` (chrome-beta-nano, chrome-beta-gemma4, edge-dev-aion, edge-phi4mini, chrome-stable-nano) and requires the instance to serve this checkout's extension (`samePath(loaded, extension)`). No static source names a single instance that yields ≥1 node from `/stale-view`; the check's node count is a runtime observation. A live run was not performed (constraint: no browser started).
- **Source**: `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` lines 55-120; `.commandcode/skills/control-ai-browsers/instances.json` (instance names/ports/models); `references/ai-browsers-verification.md` (live-run cost/timeouts); `references/edge-dev-aion-model.md` (pin).
- **Confidence**: medium
- **Why it matters here**: The gate requires naming the instance; static evidence only supports "any named instance, subject to the extension-path match", and the check records a null result rather than smoothing. Marked as `no reliable source found` for a specific instance name.

## Finding: The interop check's exit codes and messages

- **Claim**: Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails (including `rendered no interop slice node`); 2 when it could not run (unknown instance, extension path mismatch, wrong route, panel code 2/null, panel build lacking `interop-slice`, state could-not-run). It also asserts the three limits (`observable`, `operator`, `emission`) are present in `limits`, the attribution matches `/inferred,? untested/i`, and `answer` is non-empty.
- **Source**: `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` lines 1-40 and `main()` (returns 0/1/2); `LIMIT_TERMS = ['observable','operator','emission']`; `missingLimitTerms`.
- **Confidence**: high
- **Why it matters here**: E1/E2/E3 require the check to fail honestly (empty slice → exit 1 named message, empty answer → exit 1), which is what the code does.

## Assigned questions — answers

- [RESEARCH] Which instance, and which panel route, produce a sliced node set from `/stale-view`, and what does the panel report when the effect has already run before the panel attaches? → No instance can be named from static evidence; the check accepts any named instance that serves this checkout's extension, and the panel route it drives is `/panel/interop` (pushed by `drivePanel` for `--feature=interop`). `/stale-view` is the inspected page's route in `spikes/ng222-app`, not a panel route, so a "slice from `/stale-view`" is not produced by any panel route. When the fixture's error effect has already run before the panel attaches, the Subject is already errored and no live slice is captured; the panel reports the empty state "no interop findings" (`data-testid="empty-state"`) with `nodes = 0`, and the check fails with `CLAIM: ... rendered no interop slice node` (exit 1). If the Prompt API is unavailable it instead reports "unavailable: signal graph destroyed" (`data-testid="unavailable"`). The settle mechanic / second fixture needed is environment work; no reliable source names a specific instance that avoids this.

## Dead ends

- Searched for a per-instance "interop slice" expectation in `instances.json`, `features/interop.md`, and `checks/interop.mjs`: none names a single instance; all instances are eligible subject to the extension-path match.
- Searched for a `/stale-view` panel route in `app.routes.ts` (panel app): only `stale-view` (StaleViewComponent) exists, which is a different feature (N24), not interop; the interop route is `interop`.
- No live browser run was attempted (constraint: no browser, no npm/build/test runner); instance-level feasibility remains unverified.