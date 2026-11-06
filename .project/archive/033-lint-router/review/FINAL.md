# Final Review — M033 lint-router

Reviewed HEAD: 3099ff10bd7004ac7f2ca4bb5ebe130f1b676fbb
Overall verdict: pass

## Success criteria

### SC1 — On the fixture, a navigation failure the page console reports produces a finding naming the unmatched URL segment and stating that none of the configured routes matches it, recording the code the message stated even when the digest does not carry that code.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test scripts/router-diagnostic.test.mjs` and the capture suite, plus the recording at `research/raw/m033-router-diagnostic.json`.
- **Observed**: one `NG04002` message naming `this-route-does-not-exist`; the finding carries `segment`, `code: "NG04002"`, `message`, `consideredCount: 15` and states that no configured route matches; `digestCarriesCode` is false and the code is still recorded.
- **Reference**: `extension/router-diagnostic.js`, `scripts/router-diagnostic.test.mjs`, `research/raw/m033-router-diagnostic.json`.
- **Finding**: the console supplies exactly one router diagnostic, and it names the segment that failed rather than any route in the table.
- **Fix direction**: none

### SC2 — The finding is produced from observables the agent already collects — the `Router` configuration through `ng.getInjector` and dev-mode console messages — with no new page-side instrumentation and no build-log scraping.

- **Verdict**: met
- **Check**: the recording's `preconditions` and `config` blocks, and the module's imports.
- **Observed**: the configuration is read with `ng.getInjector(el).get(Router)` — the hook M030 established — and the messages come from the console capture M032 established; the module reads no clock, no DOM, no console and no build output.
- **Reference**: `research/raw/m033-router-diagnostic.json`, `extension/router-diagnostic.js:1-40`.
- **Finding**: no new page-side instrumentation was added to obtain either input.
- **Fix direction**: none

### SC3 — A finding that cannot be attributed to exactly one configured route reports "cannot tell" with the reason, rather than picking the nearest route or naming a guard verdict the configuration does not record.

- **Verdict**: met
- **Check**: the suite's `cannot-tell` cases and its nearest-route mutant.
- **Observed**: four reasons — `no-captured-messages`, `no-url-segment`, `segment-matches-configuration` and `unreadable-configuration`; a segment that does resolve to a configured path is `cannot-tell`, not a finding; the mutant that names the nearest route reddens with `/route as the owner/`.
- **Reference**: `scripts/router-diagnostic.test.mjs`, `extension/router-diagnostic.js`.
- **Finding**: attribution is the absence of a match, and the module has no branch that picks a route by proximity.
- **Fix direction**: none

### SC4 — The panel renders the unmatched segment, the code the message stated and how many configured routes were considered, from a short fact list, and shows the "cannot tell" state: it names no route as the owner and no remedy, because the message states neither.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test scripts/panel-router.test.mjs scripts/panel-routes.test.mjs` and `nx test angular-ai-devtools`.
- **Observed**: the surface renders `segment:`, `code:`, `message:`, `considered:` and on `cannot-tell` only `reason:` plus the absence sentence; the remedy-stripping mutant reddens naming `remedy`; the demo loader and both route pins are green.
- **Reference**: `apps/angular-ai-devtools/src/app/panel-router.ts`, `scripts/panel-router.test.mjs`, `scripts/panel-routes.test.mjs`.
- **Finding**: the surface renders only what the message states, and the two route-table pins are declared and re-cut in the task that moved them.
- **Fix direction**: none

### SC5 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: `workflow_run.py prepare-final --expected-head 3099ff10bd7004ac7f2ca4bb5ebe130f1b676fbb`.
- **Observed**: `status: complete` after three attempts; the first two were a formatter failure on two coder-written suites and a stale route-count pin, both fixed before the passing run.
- **Reference**: `.project/build/verify-ledger.jsonl`, `scripts/after-render-fixture.test.mjs:127`.
- **Finding**: the gate reached `npm test` and passed it; the two blockers were test pins, not the explainer.
- **Fix direction**: none

## Observations

- Two gate failures this milestone, both in test pins rather than product code: two coder-written suites were not Prettier-formatted, and `scripts/after-render-fixture.test.mjs` still enumerated fourteen fixture routes after T001 added `router-lint`.
- **The `pinned-file` rule named both blocking files before dispatch** — `after-render-fixture.test.mjs` for T001 and `page-picker.component.spec.ts` for T003 — and I read the output as "0 blockers, 9 advisories" and dispatched anyway. The rule was right; the judgement was wrong.
- The milestone's premise needed correcting twice on measurement: SC1 was re-aimed from "the configured route it concerns" to "the unmatched segment", and SC4 from "the route and the remedy" to the segment, the code and the count. Both corrections carry their measurements.
- T001's recording also re-recorded `m030-router-config.json`, which had been stale at twelve entries since M030 — the same class of drift M032's T004 found.
