# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 2
Reviewed HEAD: 697bd41fadd07baf772482428842450ef1d6ea90

## T003 — Panel surface for the router finding: pass

- ✅ `node --experimental-strip-types --test "scripts/panel-router.test.mjs" "scripts/panel-routes.test.mjs"` — tests 17, suites 2, pass 17, fail 0 (duration 178.86ms). Includes panel-router states (9) + panel-router mutants (4) + panel-routes E1–E4 (4).
- ✅ `node node_modules/nx/dist/bin/nx.js test angular-ai-devtools --skip-nx-cache` — Test Files 30 passed, Tests 333 passed (duration 4.0s). Includes app.spec.ts route-table pin and chat-entry.component.spec.ts route pin.

Central question — does the surface render ONLY what the message states? Yes. `apps/angular-ai-devtools/src/app/panel-router.ts` emits only these lines:
- loading: `LOADING_MESSAGE` (`panel-router.ts:106`, returned at `:136` as `[LOADING_MESSAGE]`) and error `message` (`:184` as `[message]`).
- finding: `panel-router.ts:153` `segment: ${segment}`, `:154` `code: ${code}`, `:155` `message: ${body}`, `:156` `considered: ${consideredCount}`.
- cannot-tell: `:173` `cannot tell: no router finding can be named`, `:178` `reason: ${reason}`.
No emitted line names an element, component, guard verdict, resolver outcome, redirect decision, cause or remedy; `asFact` (`:221`) copies only `segment`, `code`, `message` (body), `consideredCount` and `reason`, and `finding()` (`:146`) writes exactly those four lines.

Invented mutant (not one of T003's four): appended `remedy: add the route to app.routes.ts` to the finding line list in a copy of the source. Untouched source pinned first (its text contains no `remedy`); the mutant reddened `pinFindingComplete` with `mutant must not render remedy` — the failure message names the defect (`remedy`).

## T004 — Re-record everything the fixture change stales: pass

- ✅ `node --experimental-strip-types --test "scripts/ng-context-dev-build.test.mjs" "scripts/overlay-verdict-claims.test.mjs"` — tests 20, pass 20, fail 0 (duration 9607.59ms). Development build 2174548B, production build 471795B; recording matches both builds.

Recordings question — `research/raw/m022-ng-context.json` was MEASURED, not nudged:
- Production bundle hash moved: `main-EHYZRKVA.js` → `main-KFFZKP6H.js` (bytes 471376 → 471795); `outputClearedFirst: true` on both builds.
- Both development-build recordings agree: `reconciliation.agrees: true` (m022 ↔ companion-dev-build; development bundles `chunk-5CQ6O73V.js`, `chunk-KDTDSBO7.js`, `main.js`).
- No byte count was adjusted within tolerance with an unchanged hash; the production filename hash changed, so the build genuinely changed.

## Intent coverage

### SC4 — The panel renders the route, the finding and the remedy from a short fact list, and shows the "cannot tell" state.: pass

- ✅ Covered by T003; evidence recorded above (panel-router.test.mjs 17/17, nx test 333/333) and in the verify ledger. Surface renders segment, code, message body and considered count from the fact list, and the cannot-tell state carries only its reason.

### SC5 — `npm run check` and `npm test` pass at the head.: pass

- ✅ Covered by T003/T004; evidence recorded above (nx test angular-ai-devtools 30 files / 333 tests pass; ng-context-dev-build + overlay-verdict-claims 20/20 pass) and in the verify ledger.