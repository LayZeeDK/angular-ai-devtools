# Final review — M025 panel-verify-breadth

Reviewed HEAD: 073ad1a9796bd4285d82faac557038bb32e7cd17

Overall verdict: pass

## Success criteria

### SC1 — `npm run check` type-checks every authored file under `extension/`, with the generated `extension/panel/` bundle output excluded and the exclusion stated where the config lives.

- **Verdict**: met
- **Check**: `package.json` `scripts.check` ends `… && npm run check:extension && npm run check:companion`; `extension/tsconfig.json` sets `include: ["**/*.js"]` and `exclude: ["panel/**"]` with the exclusion and its reason stated in the header.
- **Observed**: `tsc --listFiles` reports nine authored files and none under `panel/`; the ship Verify ran the six-stage chain to exit 0.
- **Reference**: `scripts/panel-typecheck-scope.test.mjs` (7 tests), T001/T004 Log.
- **Finding**: `exclude: ["panel/**"]` is the only exclusion and is stated in the config header with its reason; `tsc --listFiles` reports nine authored files and none under `panel/`.
- **Fix direction**: none

### SC2 — That check reports zero errors, and every non-global defect the probe found — fourteen, not the thirteen estimated in the plan — is fixed at source rather than suppressed.

- **Verdict**: met
- **Check**: `npx tsc -p extension/tsconfig.json` exits 0 with zero errors; the fourteen fixes are visible in `relay.js`, `panel.js`, `agent-main.js` and `stale-view-worker.js`.
- **Observed**: no `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `as any` or `as unknown` anywhere in `extension/`. 177 extension tests green; the held-out supersession suite green.
- **Reference**: T002 Log; the gap panel's independent grep.
- **Finding**: fourteen defects, not the thirteen the plan estimated; the intent records the measured count under `## Corrections` rather than leaving a stale number.
- **Fix direction**: none

### SC3 — A deliberately wrong property introduced into an extension source makes `npm run check` exit non-zero; an error placed inside `extension/panel/` does not, because that directory is generated.

- **Verdict**: met
- **Check**: E1 and E2 mutants run by T003 and re-run by the wave reviewer.
- **Observed**: a wrong property in `extension/panel.js` exits 2 naming `extension/panel.js(14,11) TS2339` and nothing else; the same property inside `extension/panel/` stays green, and widening the exclusion to `overlay.js` reddens the program assertion.
- **Reference**: `scripts/extension-typecheck-scope.test.mjs` — 5 tests, 9 mutants.
- **Finding**: the reddening half is proven by mutants in both directions — an authored-source error exits 2 naming the file, the same error under `panel/` stays green.
- **Fix direction**: none

### SC4 — The strict-mode gap is recorded: the check runs at `strict: false`, and the reason (hand-written JS with implicit-any throughout) is stated in the config header.

- **Verdict**: met
- **Check**: the config's header carries eight statements including `strict: false` and the measured strict count.
- **Observed**: the suite reads those statements from the config text, so editing the prose reddens it.
- **Reference**: T003 AC4; `extension/tsconfig.json` lines 1–20.
- **Finding**: the 7308-error strict count is asserted by the suite, so editing the header prose reddens it; the gap is recorded rather than claimed closed.
- **Fix direction**: none

## Carried forward

- **`@ts-ignore` is honoured by this configuration.** Nothing is suppressed today, but a future suppression could keep the check green while SC2 claims defects were fixed at source. The fix is a one-line guard in the scope suite that refuses any `@ts-ignore`, `@ts-expect-error` or `@ts-nocheck` in `extension/`. It belongs to the next milestone that touches the extension.
- The corpus trusts a suite's own printed summary (M024's carried gap). Unchanged by this milestone.

## What this milestone did not do

It did not close the roadmap's stated premise: `check:panel` already existed since M018. The genuine gap — `extension/` checked by nothing — is what this milestone closed, and the intent records that re-scope.
