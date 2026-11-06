# Final Review — M032 lint-core

Reviewed HEAD: c996fd4f6d6666562dcd27141f335f85cfb941a9
Overall verdict: pass

## Success criteria

### SC1 — On the fixture, a construct the tool can observe produces a finding naming that construct and the diagnostic code when the digest carries one, and nothing the message does not state: the message names no element and no component, so the finding names neither.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test scripts/lint-core.test.mjs` and `scripts/lint-observability.test.mjs`, reading `research/raw/m032-lint-observability.json`
- **Observed**: 22/22 and 8/8 pass. The recording's live capture is `error` `NG0950` `Input "requiredLabel" is required but no value is available yet`; the module renders `construct: requiredLabel` and `code: NG0950` with the stack dropped.
- **Reference**: `scripts/lint-core.test.mjs`, `research/raw/m032-lint-observability.json`, `.project/tasks/T002-join-a-diagnostic-to-its-construct.md`
- **Finding**: The finding names the input the message names and the code its body carries. The stack frame naming `LintObservabilityPage` is dropped, and the pane renders no element, component, cause or fix — M4 reddens if a construct is derived from an element.
- **Fix direction**: none

### SC2 — The finding is produced from observables the agent already collects — dev-mode console messages, `window.ng` reads and the app facts — with no new page-side instrumentation and no build-log scraping.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test scripts/lint-core.test.mjs`; `scripts/lint-observability.test.mjs`
- **Observed**: 22/22 and 8/8 pass. The module takes captured console messages as input; the recording reports `compilerOptionsChanged: []` and reads the fixture's `angularCompilerOptions` live from `tsconfig.json`.
- **Reference**: `extension/lint-core.js`, `research/raw/m032-lint-observability.json`
- **Finding**: No new tap exists — the finding is derived from the console messages the agent already captures plus the digest the extension already ships, and a mutation that accepts a code the body does not carry reddens.
- **Fix direction**: none

### SC3 — A diagnostic the tool cannot observe from the page reports "cannot tell", with the reason, rather than an invented cause or a construct guessed from proximity.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test scripts/lint-core.test.mjs`
- **Observed**: 22/22 pass, with four distinct reasons — `no-captured-messages`, `no-coded-diagnostic`, `code-not-in-digest`, `message-names-no-construct`.
- **Reference**: `extension/lint-core.js`, `scripts/lint-core.test.mjs`
- **Finding**: A diagnostic the page cannot supply reports `cannot-tell` with its reason and carries no construct, no code and no cause; M5 attributes by nearest element and reddens.
- **Fix direction**: none

### SC4 — The panel renders the construct, the code and its explanation from a short fact list, and shows the "cannot tell" state.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test scripts/panel-lint.test.mjs`; `scripts/panel-routes.test.mjs`
- **Observed**: 17/17 and 4/4 pass; the four states render `construct: requiredLabel`, `code: NG0950`, the message body, or a cannot-tell sentence with its reason.
- **Reference**: `apps/angular-ai-devtools/src/app/panel-lint.ts`, `scripts/panel-lint.test.mjs`, `.project/tasks/T003-panel-surface.md`
- **Finding**: The surface renders only what its fact list carried — the fact also held `element`, `selector`, `component`, `cause` and `fix`, and none were rendered; the lint surface is registered in `panel-demo.ts` and pinned by the surfaces-versus-loaders check.
- **Fix direction**: none

### SC5 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: `.project/build/verify-ledger.jsonl` row at `c996fd4f`; `npm run check`; `node node_modules/nx/dist/bin/nx.js test angular-ai-devtools --skip-nx-cache`
- **Observed**: `npm run check` exit 0 including `format:check`; nx test 333/333; the script segment 611/611 with 0 skipped; the project Verify recorded `status=complete` at the reviewed head.
- **Reference**: `.project/build/verify-ledger.jsonl`, `.project/review/final-gap-1.md`
- **Finding**: The gate passed at the reviewed head and the row naming that head exists.
- **Fix direction**: none

## Observations

- The milestone's own code passed every wave review and every gate step it reached on the first attempt. All six gate failures were in surrounding material: a tool writing into `.project`, a missing `s` in the plan's verify command, and two files left unformatted.
- `extension/error-digest.json` carries NG0950 and does not carry NG8008, which is why the observable diagnostic is the routed-component required-input error rather than the compiler error.
- The intent's SC1 was narrowed during the build, with the measurement recorded in `## Corrections`: the message names the input only, so the finding names no element or component.
- The assembled `DOCS-AUDIT.md` emits one generic suggested action for all 205 unverifiable claims. E5/E7 are scoped to the hand-authored audit form and the generic action is recorded as a follow-up rather than hidden.
