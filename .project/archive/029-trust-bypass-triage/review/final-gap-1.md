# Gap Review — 1: project Verify

Reviewed HEAD: f653517516b891b32cf2b152bea9e47b2ec8c935
Gap verdict: pass
Risk: project Verify
Waves checked: 1, 2, 3

## Checked evidence

- **Check**: `npx nx run ai-devtools-companion:build && npm run check && node --test scripts/sanitizer-triage.test.mjs && node --test scripts/panel-sanitizer.test.mjs`
- **Observed**: exit 0. `NX Successfully ran target build for project ai-devtools-companion`; `npm run check` returned 0 with no diagnostics across the root, skills, panel, extension and companion programs; `sanitizer-triage.test.mjs` reported `tests 23 / suites 7 / pass 23 / fail 0 / skipped 0`; `panel-sanitizer.test.mjs` reported `tests 13 / suites 2 / pass 13 / fail 0 / skipped 0`. The milestone's own `workflow_run.py prepare-final` at this head exited 0 in 13m49s after `npm ci --include=dev`, `npm --prefix spikes/ng222-app ci --include=dev`, the same companion build, `npm run check` and `npm test`.
- **Reference**: `.project/plan/PLAN.md:6` (the project Verify line) and `.project/build/evidence.json` (T001–T007 all classified `proven-landed` at 337c698).

## Finding

- **Found**: Project Verify is green at the reviewed head, first-hand. I rebuilt `ai-devtools-companion` — the step the previous ship attempt failed on, because the fixture's development configuration imports that package — and it succeeded from this checkout; `npm run check` then returned 0 over all five type-check programs, and both M029 suites executed and passed with no skips (23/23 and 13/13). `npm ci --include=dev` installed cleanly (`npm ls --depth=0` reports no invalid or missing entry, TypeScript 6.0.3 as `AGENTS.md` requires), and the dispatch's prepare-final run at f6535175 exited 0 in 13m49s, so the full `npm test` pipe that still collects the browser-spawning `scripts/sanitizer-bypass.test.mjs` is covered by a green run at this head, not merely assumed.
- **Fix direction**: none

## Notes

- `.project/build/verify-ledger.jsonl` holds only two entries, both exit 1 (at b4ea2f5c and d5a998e) and neither at this head. The pass recorded above rests on the dispatch's prepare-final result plus this re-run; a reader who opens only the ledger sees nothing but reds.
- `scripts/sanitizer-bypass.test.mjs` (T004) spawns `ng serve` and a headless Chromium and is still inside the default `scripts/**/*.test.mjs` glob; T007's relocation took out only `scripts/capture/sanitizer-warning.live.mjs`. It fails rather than skips when Playwright or the fixture install is absent, so no case is silently dropped, but `npm test` on a fresh machine needs the Playwright browser download in addition to the two `npm ci` runs.
- The reviewed head's recorded dev bundle is 1,907,107 B (`research/raw/m022-ng-context.json`, `growth.development.was` 1,902,757 → `now` 1,907,107), matching T006 and the wave-3 review.
