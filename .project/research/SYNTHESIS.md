# Synthesis

## Settled

- No new panel tabs — veto in `.project/intent/INTENT.md` (SC4-era vetoes).
- No change to the interop component's behaviour to make a check pass — veto in `.project/intent/INTENT.md`.
- No portal source changes — veto in `.project/intent/INTENT.md`.
- No code generation — veto in `.project/intent/INTENT.md`.
- No model-download flow — veto in `.project/intent/INTENT.md`.
- A null result must be recorded, never smoothed — `evidence-pitfalls.md` § "The spikes fixture fires its error effect during component init, before any panel can attach" (E3).
- Baseline at ff8246c is green (npm run check 0, scripts 59/59, skills 588/588, Angular 46/46, build-extension success) — measured evidence.
- `edge-dev-aion` is pinned to model 2026.10.15.1 / runtime 2026.10.12.1 / manifest 2026.10.19.1 with a documented 600s/1800s budget and one measured hang — `references/edge-dev-aion-model.md`.
- The interop check's exit codes/messages (0 pass; 1 `CLAIM:` failure including "rendered no interop slice node"; 2 could-not-run) and its three-limit/attribution/answer assertions are fixed by `checks/interop.mjs` — `evidence-pitfalls.md` § "The interop check's exit codes and messages".

## Decisions

### Instance targeting for the live proof

- **Decision**: Primary `edge-dev-aion` (pinned model/runtime/manifest, documented 600s/1800s budget); fallback `chrome-beta-nano` if the primary hangs or fails the extension-path match.
- **Runner-up**: `chrome-beta-gemma4` — eligible but has no documented pin/budget in the evidence, so it is less reproducible for a proof that must be re-run.
- **Evidence**: `evidence-pitfalls.md` § "Which instance produces a slice cannot be determined statically" (no static source names a single instance; any named instance eligible subject to `samePath(loaded, extension)`); `references/edge-dev-aion-model.md` (pin/budget/hang).
- **Confidence**: medium

Instance-level feasibility is unverified (no live browser run); verify in wave 1.

### Effect already run before the panel attaches

- **Decision**: Use the standing grant (owner, 2026-10-31) to add one more dev-only fixture route in `spikes/ng222-app` that keeps the Subject alive and defers firing `subject.error` until after the panel attaches, instead of recording a null result or changing interop behaviour.
- **Runner-up**: recorded-null acceptance — honest and cheap, but it cannot satisfy SC1 (exit 0 with >=1 sliced node); settle mechanic alone leaves the constructor effect firing during init.
- **Evidence**: `evidence-pitfalls.md` § "The spikes fixture fires its error effect during component init, before any panel can attach"; `evidence-pitfalls.md` § "The keep-list survives only `toSignal.source`/`toSignal.state` nodes and an unlabelled effect whose source contains `subject.error`"; `evidence-pitfalls.md` § "The panel reports an explicit empty state when no slices exist"; standing grant in INTENT.md.
- **Confidence**: low

The deferred-fire timing and keep-list Rule 2 match must be proven in wave 1; cost is a new route plus fixture/keep-list test updates and extra maintenance.

### Re-recording `.proven.json` at the shipped head

- **Decision**: After implementation and doc corrections settle, run `node .commandcode/skills/control-ai-browsers/scripts/fingerprint.mjs record --feature interop --entries apps/angular-ai-devtools/src/app/interop.component.ts src/main-world/interop-keep-list.ts` from the shipped head, then `check --feature interop` must report fresh (exit 0).
- **Runner-up**: recording `interop` as `--external` — rejected because the interop source lives inside this checkout and is fingerprintable.
- **Evidence**: `evidence-pitfalls.md` § "Which instance produces a slice cannot be determined statically" (feature id `interop` exists as `features/interop.md`); `fingerprint.mjs` usage/record/check contract; `.commandcode/skills/control-ai-browsers/features/interop.md` (implementation path).
- **Confidence**: high

### Whether `/panel/interop` with a `/stale-view` inspected page satisfies SC2

- **Decision**: Yes — SC2 is satisfied as written: the claim's recorded source is the `spikes/ng222-app` `stale-view` fixture (the inspected page route `/stale-view`), while `/panel/interop` is the panel's own route driven by `drivePanel` for `--feature=interop`. No SC2 wording change is needed; the planner must only correct any note that claims the portal is required, pointing it at the spikes fixture.
- **Runner-up**: amending SC2 to "slice from the inspected page route" — rejected because SC2 already names the `stale-view` fixture and the two routes are legitimately different apps; changing wording would blur the panel/inspected-page distinction.
- **Evidence**: `evidence-pitfalls.md` § "The interop panel route the driver pushes is `/panel/interop`, not `/stale-view`"; `evidence-pitfalls.md` § "Assigned questions — answers"; `.project/intent/INTENT.md` SC2.
- **Confidence**: high

## For the planner

- **Wave-1 blockers**: (a) prove the grant fixture route defers `subject.error` past panel attach while the effect node still matches keep-list Rule 2; (b) confirm a named instance (primary `edge-dev-aion`, fallback `chrome-beta-nano`) serves this checkout's extension and yields >=1 node; (c) re-record the `interop` proven entry at the shipped head and confirm `fingerprint check` fresh.
- **Walking skeleton**: spikes app serves `/stale-view` → panel driven to `/panel/interop` → renders >=1 `interop-node` plus the three limits and "inferred, untested" → Explain returns a non-empty answer → `checks/interop.mjs` exits 0 with evidence committed.
- **Pitfalls → tasks**: constructor-fired effect → defer firing in the grant route; `/stale-view` mistaken for a panel route → keep inspected-page vs panel routes separate; whole-token `subject.error` regex → preserve exact token in the effect source; zero nodes → expect empty state and exit 1, not could-not-run; edge hang → enforce 1800s budget and fallback; portal-required notes → correct to spikes fixture.

## User rulings

- None — all points decided under the standing grant (owner, 2026-10-31).

## Still unknown

- Instance-level feasibility of producing a sliced node from the grant route — plan: wave-1 spike.
- Exact deferral timing that keeps the signal graph alive until panel attach — plan: wave-1 spike.
RESULT: ready — SYNTHESIS.md — 4 decisions, 9 settled