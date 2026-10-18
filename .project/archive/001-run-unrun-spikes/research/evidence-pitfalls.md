# Evidence — pitfalls

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: pitfalls
Questions assigned: What is Angular 22.2's actual lookup path for a Meta-class/exported provider (`ng.ɵgetInjectorProviders` etc.), and what exactly does S16 need to call?; Exact run order, instance requirements, and per-spike duration (handoff line 51-68 ordering).

## Finding: `angular:di_graph` / `injector.get` on a `ViewContainerRef` corrupts the page signal graph for its lifetime

- **Claim**: Running `angular:di_graph` or calling `injector.get` on a node-injector `ViewContainerRef` makes `ng.ɵgetSignalGraph` (and Angular DevTools' signal-graph pane) drop the template node and template-bound signals for the rest of the page's life, while the app keeps working; the design forbids both.
- **Source**: `research/05-spikes.md:11-16,18-23,104-106`; `docs/feature-proposals.md:86,326-334`
- **Confidence**: high
- **Why it matters here**: S16 walks injectors and reads provider records; it must use the `ɵgetInjectorProviders`/`ɵgetInjectorResolutionPath` read path only and never `angular:di_graph` or `injector.get` on a `ViewContainerRef`, or it silently degrades every later feature that reads the signal graph.

## Finding: S16's specified call path is the root component's `ɵgetInjectorResolutionPath` plus `ɵgetInjectorProviders` matched by identity

- **Claim**: S16 must, from the page's main world, walk the root component's `ɵgetInjectorResolutionPath` and match `ɵgetInjectorProviders` records by identity against `Meta` (`@angular/platform-browser`, never injected by the counter) and `Router` (created at bootstrap, control); no `Meta` record is found (lookup reports "provided, not created yet") and a second walk still finds none (nothing constructed), while a `Router` record is found by identity and `get` returns the instance whose `url` matches `location.pathname`.
- **Source**: `docs/feature-proposals.md:976` (S16 row); `plans/angular-ai-devtools-proposals.handoff.md:55`; gist evidence that `ng.ɵgetInjectorResolutionPath()` is the API Angular DevTools' Injector Tree reads and `ng.ɵgetInjectorProviders()` names what each injector holds (https://gist.github.com/hxdxri/822aa13eb73c19bd50b1954b38021acc)
- **Confidence**: high
- **Why it matters here**: This is the exact, falsifiable procedure and success criterion for S16; any deviation (constructing the service, using `injector.get` on a VCR, or a different root) would either create the very thing S16 must prove is not constructed or reproduce the signal-graph corruption.

## Finding: Failure modes for the S16 lookup path

- **Claim**: The lookup can fail in at least four ways: (a) `Meta` is `providedIn: 'root'` but no record is surfaced because the export added by hand is not actually present in the development config; (b) identity matching fails if `Meta` is compared by name/string instead of reference; (c) calling `get` on the found `Router` record during the walk can construct or side-effect if the provider is lazy; (d) re-running the walk after a failed first attempt may show a `Meta` record because an earlier `get` constructed it, invalidating the "nothing constructed" assertion.
- **Source**: `docs/feature-proposals.md:976` (done-when requires a second walk still finds no `Meta` record); `research/05-spikes.md:18-23` (VCR `injector.get` side effect)
- **Confidence**: medium
- **Why it matters here**: S16's verdict (works / works-with-degradation / fails) depends on isolating these; the second-walk check and identity-only matching are the controls that keep a false positive from gating the companion package.

## Finding: Handoff run order (lines 51-68) and instance requirements

- **Claim**: Next work order is (1) cheap open spikes — offline/one-fixture S16, S19, S17, S18 first, then model-browser S14, S15, S20, S23; (2) tutor spikes TS1-TS12 (TS1/TS2 riskiest); (3) fold results into proposals; (4) final closed-findings check since `0647e96`.
- **Source**: `plans/angular-ai-devtools-proposals.handoff.md:51-68`; `docs/feature-proposals.md:957` (riskiest-first priority notes)
- **Confidence**: high
- **Why it matters here**: Spikes must not overlap on the same per-model instance (E3) and must follow this order; offline spikes (S16/S19/S17/S18) need no model browser, so they can run without instance contention.

## Finding: Per-model instances are four, each a distinct browser process/port/profile

- **Claim**: Instances are `chrome-beta-nano` (9333), `chrome-beta-gemma4` (9334), `edge-dev-aion` (9335), `edge-phi4mini` (9337); profiles live under `.browsers/` on D:; control scripts refuse parallel use of the same instance; model downloads and branded profiles require Lars approval.
- **Source**: `plans/angular-ai-devtools-proposals.handoff.md:40`; `research/05-spikes.md:986-989`; `.claude/skills/control-ai-browsers/SKILL.md:19-24`
- **Confidence**: high
- **Why it matters here**: S14/S15 need Gemma 4 (9334) and Aion (9335); S20/S23 need Edge Dev (9335) and Edge stable (9337); these overlap and must be serialized per instance, with queue/reset between batches (E3/E4).

## Finding: Residue risk from persistent Playwright profiles and leftover processes

- **Claim**: Persistent `user_data_dir` profiles keep sessions/state across runs and can collide if two processes use the same directory; a dedicated automation profile per model is the safe pattern, and leftover processes must be closed to avoid port/profile locks.
- **Source**: https://shifttheculture.media/blog/playwright-real-chrome-profile (dedicated automation profile, persistent `user_data_dir`); handoff rule "close every browser, tab and dev server you start" (`plans/...handoff.md:73`)
- **Confidence**: medium
- **Why it matters here**: Reusing or racing `.browsers/` profiles across spikes can leave a locked profile or stale state, invalidating measurements; reset browser state after a residue-prone failure before rerun (E4).

## Finding: S16 has no duration estimate in sources

- **Claim**: No per-spike duration or time estimate is documented for S16 or any open spike in the handoff or spikes doc; only ordering and instance requirements are given.
- **Source**: `plans/angular-ai-devtools-proposals.handoff.md:51-68`; `docs/feature-proposals.md:957,976`
- **Confidence**: high
- **Why it matters here**: Any duration claim would be invented; scheduling must be treated as unknown and measured during the run, with one dev server at a time due to tight memory.

## Dead ends

- Searched Angular official docs and `angular.dev` for `ɵgetInjectorProviders` API reference — no public doc page found; only source/test references and a third-party gist; treat the `ng.*` ɵ surface as feature-detected (`typeof ng[name] === 'function'`), not documented.
- Searched for a documented per-spike duration table — none exists in handoff or spikes doc; do not fabricate durations.
- Web search for browser automation residue returned only general Playwright profile guidance, no Angular-specific residue; rely on handoff's close-everything rule and E4 reset.

## Assigned questions — answers

- What is Angular 22.2's actual lookup path for a Meta-class/exported provider (`ng.ɵgetInjectorProviders` etc.), and what exactly does S16 need to call? → walk the root component's `ɵgetInjectorResolutionPath`, then read each injector's `ɵgetInjectorProviders` records and match by identity against `Meta` (expected absent → "provided, not created yet") and `Router` (expected present by identity, `get` returns instance with matching `url`); never use `angular:di_graph` or `injector.get` on a `ViewContainerRef` (corrupts signal graph). S16 also requires a second walk proving no `Meta` record appears (nothing constructed). Failure modes: missing export in dev config, name-vs-identity mismatch, lazy `get` side effects, and first-walk `get` contaminating the second walk.
- Exact run order, instance requirements, and per-spike duration (handoff line 51-68 ordering). → handoff lines 51-68: offline S16, S19, S17, S18; then model-browser S14, S15, S20, S23; then TS1-TS12; then fold; then closed-findings check. Instances: 9333 nano, 9334 gemma4, 9335 aion, 9337 phi4mini, serialized per instance, profiles under `.browsers/`. No durations documented; memory-tight, one dev server at a time; reset state after residue-prone failures.