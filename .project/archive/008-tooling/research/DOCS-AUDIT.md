# Docs Audit

<!-- Written by the docs auditor -->

Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-10-28
Audited HEAD: 94181b2fbd3f5fc146741aa4b5bbc7bad73a4920
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 1 |
| stale | 0 |
| aspirational | 0 |
| unverifiable | 123 |
| descriptive docs (no testable claims) | 7 |

Worst drift: most docs carry unverified claims pending review.

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "description: Launch, stop, doctor and drive the per-model browser instances for the built-in AI (Prompt API..." | config | unverifiable | .claude/skills/control-ai-browsers/SKILL.md:3 |

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "matching feature file. `C` below stands for `node .commandcode/skills/control-ai-browsers/scripts/control.m..." | command | unverifiable | .claude/skills/control-ai-browsers/features/README.md:4 |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`extension/` (registry `extension`), or the folder `up --extension=<dir>` names. The extension adds a DevTo..." | feature | unverifiable | .claude/skills/control-ai-browsers/features/extension-panel.md:4 |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`Ready` in Broker State on the requested backend, the Prompt API reports `available`, and the model answers..." | feature | unverifiable | .claude/skills/control-ai-browsers/features/health-check.md:4 |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`.browsers\<name>`, its own `--enable-features` set and its own remote-debugging port, all read from" | feature | unverifiable | .claude/skills/control-ai-browsers/features/instances.md:4 |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- `model-info` reports every model manifest in the profile (name, versions, performance hints, size, folder..." | feature | unverifiable | .claude/skills/control-ai-browsers/features/model-lifecycle.md:8 |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- `probe-run` runs any `async page => {...}` file in a new tab and closes the tab." | feature | unverifiable | .claude/skills/control-ai-browsers/features/probes.md:9 |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "session; reads Angular state through `window.ng` helpers; captures evidence; tears down only what it started." | feature | unverifiable | .claude/skills/control-angular-dev-app/SKILL.md:10 |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the matching feature file as the recipe. For an app attached with `--url`, write its features here in the" | feature | unverifiable | .claude/skills/control-angular-dev-app/features/README.md:4 |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The ng222-app page shows one line, `Clicks: 3 (double 6, cart 1)`, and an `Increment` button. Each click" | feature | unverifiable | .claude/skills/control-angular-dev-app/features/counter.md:3 |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "type, the contract's policy number and a description. Data comes from `http://localhost:3000/api/claims`." | feature | unverifiable | .claude/skills/control-angular-dev-app/features/portal-claims.md:4 |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`http://localhost:3000/api/complaints` and `/api/customers`." | feature | unverifiable | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md:5 |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "policy number and start date. Data comes from the API at `http://localhost:3000/api/contracts`." | feature | unverifiable | .claude/skills/control-angular-dev-app/features/portal-contracts.md:5 |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "domain (General, Contract, Claim, Complaint, Customer) and a content area. `/` redirects to `/home`, which" | feature | unverifiable | .claude/skills/control-angular-dev-app/features/portal-navigation.md:4 |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`Render mode: server` (or `prerender`, `client` on the other routes), an `Early click` button with its count," | feature | unverifiable | .claude/skills/control-angular-dev-app/features/ssr.md:4 |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Manages the Angular DevTools extension and drives its panel. Supported browsers: `chrome`, `chrome-beta`," | feature | unverifiable | .claude/skills/control-angular-devtools/SKILL.md:8 |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "What a developer does with Angular DevTools, and how `control-angular-devtools` reaches it. `S` is" | feature | unverifiable | .claude/skills/control-angular-devtools/features/README.md:3 |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- Connected flag `window.__NG_DEVTOOLS_CONNECTED__`." | feature | unverifiable | .claude/skills/control-angular-devtools/features/attach.md:9 |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools is a Chrome Web Store extension (`ienfalfjdbdpebioblfackkekamfmbnh`). A developer adds it" | feature | unverifiable | .claude/skills/control-angular-devtools/features/install.md:3 |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "cycle. It subscribes through `ng.ɵsetProfiler`, which keeps a list of subscribers in Angular 22." | feature | unverifiable | .claude/skills/control-angular-devtools/features/profiler.md:4 |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "component's template node, its signals, computeds and effects, with their current values and edges." | command | unverifiable | .claude/skills/control-angular-devtools/features/signal-graph.md:4 |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "description: Install, check, remove and configure Pangular Inspector (@pangular-inspector/devtools, pinned ..." | config | unverifiable | .claude/skills/control-pangular-inspector/SKILL.md:3 |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- Run commands from the repository root. `S` is `.claude/skills/control-pangular-inspector/scripts/control...." | feature | unverifiable | .claude/skills/control-pangular-inspector/features/README.md:8 |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- `live.pages`: `list-pages` shows the tab's page id, URL and the inspectors that report." | feature | unverifiable | .claude/skills/control-pangular-inspector/features/live-inspection.md:8 |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- `nav.explain`: `explain-navigation`, newest first, with trigger, `started by`, phases and outcome" | feature | unverifiable | .claude/skills/control-pangular-inspector/features/navigation.md:8 |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- `panel.dashboard`: project name, Angular and TypeScript versions, SSR off, `LIVE` badge, Configuration block" | feature | unverifiable | .claude/skills/control-pangular-inspector/features/panel.md:8 |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- `setup.install`: exact pin `@pangular-inspector/devtools@0.0.7` in `devDependencies`, overlay import, pro..." | config | unverifiable | .claude/skills/control-pangular-inspector/features/setup.md:8 |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- `scan.tools`: `get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`," | feature | unverifiable | .claude/skills/control-pangular-inspector/features/source-scan.md:8 |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "description: Run, drive, screenshot, inspect and reproduce the ng222-app counter's Vitest Browser Mode test..." | config | unverifiable | .claude/skills/control-vitest-browser-angular/SKILL.md:3 |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- Run commands from the repository root. `S` is `.claude/skills/control-vitest-browser-angular/scripts/cont..." | feature | unverifiable | .claude/skills/control-vitest-browser-angular/features/README.md:8 |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`spikes/ng222-app/src/app/counter.spec.ts` renders `Counter` with `vitest-browser-angular`'s `render()` and" | feature | unverifiable | .claude/skills/control-vitest-browser-angular/features/counter-tests.md:3 |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "An unpacked extension loaded by `up --extension` runs in the same browser as the tests. With the S1 Vitest" | feature | unverifiable | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md:3 |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "With `--hold <ms>`, the hold test renders `Counter` in the tester iframe with `CartService` overridden to" | feature | unverifiable | .claude/skills/control-vitest-browser-angular/features/held-counter.md:3 |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "description: Fixed proof checks for the built-in AI in control-ai-browsers' per-model browser instances (Ch..." | config | unverifiable | .claude/skills/verify-ai-browsers/SKILL.md:3 |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`control-angular-devtools` launches, health-checks and drives the harness and the panel, and" | feature | unverifiable | .claude/skills/verify-angular-devtools/SKILL.md:9 |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "description: Fixed proof checks for Pangular Inspector (@pangular-inspector/devtools 0.0.7) on the ng-journ..." | config | unverifiable | .claude/skills/verify-pangular-inspector/SKILL.md:3 |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "description: Launch, stop, doctor and drive the per-model browser instances for the built-in AI (Prompt API..." | config | unverifiable | .commandcode/skills/control-ai-browsers/SKILL.md:3 |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "matching feature file. `C` below stands for `node .commandcode/skills/control-ai-browsers/scripts/control.m..." | command | unverifiable | .commandcode/skills/control-ai-browsers/features/README.md:4 |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`extension/` (registry `extension`), or the folder `up --extension=<dir>` names. The extension adds a DevTo..." | feature | unverifiable | .commandcode/skills/control-ai-browsers/features/extension-panel.md:4 |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`Ready` in Broker State on the requested backend, the Prompt API reports `available`, and the model answers..." | feature | unverifiable | .commandcode/skills/control-ai-browsers/features/health-check.md:4 |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`.browsers\<name>`, its own `--enable-features` set and its own remote-debugging port, all read from" | feature | unverifiable | .commandcode/skills/control-ai-browsers/features/instances.md:4 |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- `model-info` reports every model manifest in the profile (name, versions, performance hints, size, folder..." | feature | unverifiable | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md:8 |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- `probe-run` runs any `async page => {...}` file in a new tab and closes the tab." | feature | unverifiable | .commandcode/skills/control-ai-browsers/features/probes.md:9 |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "session; reads Angular state through `window.ng` helpers; captures evidence; tears down only what it started." | feature | unverifiable | .commandcode/skills/control-angular-dev-app/SKILL.md:10 |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the matching feature file as the recipe. For an app attached with `--url`, write its features here in the" | feature | unverifiable | .commandcode/skills/control-angular-dev-app/features/README.md:4 |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The ng222-app page shows one line, `Clicks: 3 (double 6, cart 1)`, and an `Increment` button. Each click" | feature | unverifiable | .commandcode/skills/control-angular-dev-app/features/counter.md:3 |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "type, the contract's policy number and a description. Data comes from `http://localhost:3000/api/claims`." | feature | unverifiable | .commandcode/skills/control-angular-dev-app/features/portal-claims.md:4 |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`http://localhost:3000/api/complaints` and `/api/customers`." | feature | unverifiable | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md:5 |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "policy number and start date. Data comes from the API at `http://localhost:3000/api/contracts`." | feature | unverifiable | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md:5 |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "domain (General, Contract, Claim, Complaint, Customer) and a content area. `/` redirects to `/home`, which" | feature | unverifiable | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md:4 |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`Render mode: server` (or `prerender`, `client` on the other routes), an `Early click` button with its count," | feature | unverifiable | .commandcode/skills/control-angular-dev-app/features/ssr.md:4 |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Manages the Angular DevTools extension and drives its panel. Supported browsers: `chrome`, `chrome-beta`," | feature | unverifiable | .commandcode/skills/control-angular-devtools/SKILL.md:8 |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "What a developer does with Angular DevTools, and how `control-angular-devtools` reaches it. `S` is" | feature | unverifiable | .commandcode/skills/control-angular-devtools/features/README.md:3 |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- Connected flag `window.__NG_DEVTOOLS_CONNECTED__`." | feature | unverifiable | .commandcode/skills/control-angular-devtools/features/attach.md:9 |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools is a Chrome Web Store extension (`ienfalfjdbdpebioblfackkekamfmbnh`). A developer adds it" | feature | unverifiable | .commandcode/skills/control-angular-devtools/features/install.md:3 |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "cycle. It subscribes through `ng.ɵsetProfiler`, which keeps a list of subscribers in Angular 22." | feature | unverifiable | .commandcode/skills/control-angular-devtools/features/profiler.md:4 |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "component's template node, its signals, computeds and effects, with their current values and edges." | command | unverifiable | .commandcode/skills/control-angular-devtools/features/signal-graph.md:4 |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "description: Install, check, remove and configure Pangular Inspector (@pangular-inspector/devtools, pinned ..." | config | unverifiable | .commandcode/skills/control-pangular-inspector/SKILL.md:3 |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- Run commands from the repository root. `S` is `.commandcode/skills/control-pangular-inspector/scripts/con..." | feature | unverifiable | .commandcode/skills/control-pangular-inspector/features/README.md:8 |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- `live.pages`: `list-pages` shows the tab's page id, URL and the inspectors that report." | feature | unverifiable | .commandcode/skills/control-pangular-inspector/features/live-inspection.md:8 |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- `nav.explain`: `explain-navigation`, newest first, with trigger, `started by`, phases and outcome" | feature | unverifiable | .commandcode/skills/control-pangular-inspector/features/navigation.md:8 |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- `panel.dashboard`: project name, Angular and TypeScript versions, SSR off, `LIVE` badge, Configuration block" | feature | unverifiable | .commandcode/skills/control-pangular-inspector/features/panel.md:8 |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- `setup.install`: exact pin `@pangular-inspector/devtools@0.0.7` in `devDependencies`, overlay import, pro..." | config | unverifiable | .commandcode/skills/control-pangular-inspector/features/setup.md:8 |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- `scan.tools`: `get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`," | feature | unverifiable | .commandcode/skills/control-pangular-inspector/features/source-scan.md:8 |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "description: Run, drive, screenshot, inspect and reproduce the ng222-app counter's Vitest Browser Mode test..." | config | unverifiable | .commandcode/skills/control-vitest-browser-angular/SKILL.md:3 |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- Run commands from the repository root. `S` is `.commandcode/skills/control-vitest-browser-angular/scripts..." | feature | unverifiable | .commandcode/skills/control-vitest-browser-angular/features/README.md:8 |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`spikes/ng222-app/src/app/counter.spec.ts` renders `Counter` with `vitest-browser-angular`'s `render()` and" | feature | unverifiable | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md:3 |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "An unpacked extension loaded by `up --extension` runs in the same browser as the tests. With the S1 Vitest" | feature | unverifiable | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md:3 |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "With `--hold <ms>`, the hold test renders `Counter` in the tester iframe with `CartService` overridden to" | feature | unverifiable | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md:3 |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Check whether there's a `packageManager` field in the root-level `package.json`." | feature | unverifiable | .commandcode/skills/link-workspace-packages/SKILL.md:12 |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- **Current Branch:** !`git branch --show-current`" | feature | unverifiable | .commandcode/skills/monitor-ci/SKILL.md:12 |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The script returns `autoApplySkipReason` in its output." | feature | unverifiable | .commandcode/skills/monitor-ci/references/fix-flows.md:7 |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "name: nx-cloud-api" | feature | unverifiable | .commandcode/skills/nx-cloud-api/SKILL.md:2 |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "1. Run `npx nx-cloud api --describe <operation>`. Use only its documented" | command | unverifiable | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md:8 |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "name: nx-cloud-cache-investigator" | feature | unverifiable | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md:2 |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npx nx-cloud api "<link>" -o <private-file>.tar.gz`. Do not extract it in the" | command | unverifiable | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md:7 |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "report asset. Task assets are typed `logs`, `artifact`, or `sandbox-report`." | feature | unverifiable | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md:4 |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "name: nx-cloud-ci-failure-review" | feature | unverifiable | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md:2 |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "name: nx-generate" | feature | unverifiable | .commandcode/skills/nx-generate/SKILL.md:2 |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "name: nx-import" | feature | unverifiable | .commandcode/skills/nx-import/SKILL.md:2 |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ESLint-specific guidance for `nx import`. For generic import issues (root deps, pnpm globs, project referen..." | command | unverifiable | .commandcode/skills/nx-import/references/ESLINT.md:3 |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- If you import an entire Gradle repository into a subfolder, files like `gradlew`, `gradlew.bat`, and `gra..." | feature | unverifiable | .commandcode/skills/nx-import/references/GRADLE.md:3 |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Jest-specific guidance for `nx import`. For the basic "Jest Preset Missing" fix (create `jest.preset.js`, i..." | feature | unverifiable | .commandcode/skills/nx-import/references/JEST.md:3 |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Next.js-specific guidance for `nx import`. For generic import issues (pnpm globs, root deps, project refere..." | command | unverifiable | .commandcode/skills/nx-import/references/NEXT.md:3 |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- Migration guide: https://nx.dev/docs/guides/adopting-nx/from-turborepo#easy-automated-migration-example" | feature | unverifiable | .commandcode/skills/nx-import/references/TURBOREPO.md:4 |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Vite-specific guidance for `nx import`. For generic import issues (pnpm globs, root deps, project reference..." | command | unverifiable | .commandcode/skills/nx-import/references/VITE.md:3 |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "name: nx-plugins" | feature | unverifiable | .commandcode/skills/nx-plugins/SKILL.md:2 |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "name: nx-run-tasks" | feature | unverifiable | .commandcode/skills/nx-run-tasks/SKILL.md:2 |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "name: nx-workspace" | feature | unverifiable | .commandcode/skills/nx-workspace/SKILL.md:2 |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "```bash" | feature | unverifiable | .commandcode/skills/nx-workspace/references/AFFECTED.md:5 |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "description: Fixed proof checks for the built-in AI in control-ai-browsers' per-model browser instances (Ch..." | config | unverifiable | .commandcode/skills/verify-ai-browsers/SKILL.md:3 |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`control-angular-devtools` launches, health-checks and drives the harness and the panel, and" | feature | unverifiable | .commandcode/skills/verify-angular-devtools/SKILL.md:9 |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "description: Fixed proof checks for Pangular Inspector (@pangular-inspector/devtools 0.0.7) on the ng-journ..." | config | unverifiable | .commandcode/skills/verify-pangular-inspector/SKILL.md:3 |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "- TypeScript is pinned to 6.0.x (`package.json`). If `npm run check` fails with errors no change explains, ..." | command | verified | AGENTS.md:8 |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Lars, verbatim: "You are now running in AFK mode overnight". Started 02:2x local time. Claude runs `lars-mo..." | feature | unverifiable | docs/afk-run-2026-10-12.md:3 |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Labels, as in `docs/feature-proposals.md`:" | feature | unverifiable | docs/design/tutor.md:5 |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Target: a Chrome and Edge MV3 extension that inspects any Angular 22.2 application running in development m..." | config | unverifiable | docs/feature-proposals.md:5 |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Status: draft, not filed. Found 2026-10-11 during spike S2 (`docs/feature-proposals.md` section 7)." | feature | unverifiable | docs/filing-ledger.md:7 |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Written by Claude for a fresh session, 2026-10-12. Repository: `D:\projects\sandbox\angular-ai-devtools` (l..." | feature | unverifiable | plans/angular-ai-devtools-proposals.handoff.md:3 |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The claims and checks live in `.commandcode/skills/verify-ai-browsers` (`checks/state.mjs`," | feature | unverifiable | references/ai-browsers-verification.md:3 |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "How to use the pin (`model pin`, the restore on `up`, doctor's `model.pin` row) is in" | feature | unverifiable | references/edge-dev-aion-model.md:3 |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All results below are **measured**. The probe ran in a normal page tab (`https://example.com`) through play..." | feature | unverifiable | research/00-browser-probe.md:3 |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "1. Chrome ships `LanguageModel` to extensions (138+) and the web (148+). Structured output (`responseConstr..." | feature | unverifiable | research/01-built-in-ai-apis.md:7 |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Sources: local clone `D:\projects\github\angular\angular` on branch `22.2.x` (CHANGELOG top entry is `22.2...." | config | unverifiable | research/02-angular-surface.md:3 |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Labels: **[measured: source]** = read in the named file or URL. **[search-summary: URL]** = from a search-e..." | config | unverifiable | research/03-prior-art.md:5 |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Date: 2026-10-11. Target: an Angular 22.2 dev-mode app, inspected by a Chrome/Edge MV3 extension (content s..." | config | unverifiable | research/04-ecosystem.md:3 |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All results are **measured** unless a line says inferred. Probes ran in Lars's Edge Dev 157 (Aion-1.1-Instr..." | config | unverifiable | research/05-spikes.md:3 |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Source: `D:\projects\github\angular\skills`, branch `main`, commit `747c3c2` (message "release: cut the v22..." | config | unverifiable | research/06-angular-skills.md:3 |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "No browser was opened for this note. The browser measurements it builds on are in `00-browser-probe.md` and..." | feature | unverifiable | research/07-prompting-small-models.md:9 |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Labels: **[measured]** = read in a named source (file:line, URL) or run; **[inferred]** = reasoned from mea..." | config | unverifiable | research/08-recent-angular-features.md:13 |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Measured behaviour: `05-spikes.md`, section "Root cause hunt" (Chrome Beta 156.0.8078.17, Nano profile serv..." | config | unverifiable | research/09-nano-tool-session-error.md:5 |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Written 2026-10-11 by Claude (researcher agent). No browser was opened for this note. It compares what vend..." | feature | unverifiable | research/10-model-capabilities.md:3 |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Question (feature proposals, section 3.1 and section 7, row S1): can a Manifest V3 extension use `LanguageM..." | config | unverifiable | research/11-spike-s1-extension-contexts.md:3 |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Lars's follow-up request, verbatim: "Surely, there are other candidates than those I mentioned. Use your ra..." | feature | unverifiable | research/12-legacy-vs-modern-angular.md:7 |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Date: 2026-10-12. Checkout: `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtool..." | config | unverifiable | research/13-portal-legacy-audit.md:3 |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Status: complete (2026-10-12). Author: Claude, for Lars. Who read what: Claude itself read Angular's `webmc..." | config | unverifiable | research/14-ai-devtools-prior-art.md:3 |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "\| PX \| Prompt API explainer, `https://raw.githubusercontent.com/webmachinelearning/prompt-api/main/README..." | feature | unverifiable | research/15-deterministic-and-ai.md:17 |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Question: which SSR and hydration facts can a browser extension read from a running Angular 22.2 page in" | config | unverifiable | research/16-ssr-runtime.md:3 |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "3. Once the extension is present: what do `window.ng`, the signal graph, the profiler, the injector and" | feature | unverifiable | research/17-vitest-browser-runtime.md:9 |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Research date: 2026. Target: Microsoft Edge Stable 155 on Windows, launching with a fresh `--user-data-dir`..." | feature | unverifiable | research/18-edge-prevent-auto-signin.md:3 |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "MAIN world, through `relay.js` and `agent-main.js`. Those scripts talk over `window` CustomEvents, so any s..." | feature | unverifiable | research/19-languagemodel-in-extension-contexts.md:6 |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Earlier claims (research/19 and the panel checks) were all measured with the `control-ai-browsers` instances'" | feature | unverifiable | research/20-built-in-ai-without-flags.md:7 |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2." | config | unverifiable | spikes/ng222-app/README.md:3 |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2." | config | unverifiable | spikes/ng222-ssr/README.md:3 |

## Descriptive docs

- .commandcode/pstack-models.md
- .commandcode/taste/angular/taste.md
- .commandcode/taste/communication/taste.md
- .commandcode/taste/design/taste.md
- .commandcode/taste/taste.md
- .commandcode/taste/tooling/taste.md
- .commandcode/taste/workflow/taste.md

## User rulings

| Queue # | Ruling | User's words | Planned |
|---------|--------|--------------|---------|

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 1 | .claude/skills/control-ai-browsers/SKILL.md | "description: Launch, stop, doctor and drive the per-model browser instances for the built-in AI (Prompt API..." | unverifiable | NEEDS-USER | review and verify claim |
| 2 | .claude/skills/control-ai-browsers/features/README.md | "matching feature file. `C` below stands for `node .commandcode/skills/control-ai-browsers/scripts/control.m..." | unverifiable | NEEDS-USER | review and verify claim |
| 3 | .claude/skills/control-ai-browsers/features/extension-panel.md | "`extension/` (registry `extension`), or the folder `up --extension=<dir>` names. The extension adds a DevTo..." | unverifiable | NEEDS-USER | review and verify claim |
| 4 | .claude/skills/control-ai-browsers/features/health-check.md | "`Ready` in Broker State on the requested backend, the Prompt API reports `available`, and the model answers..." | unverifiable | NEEDS-USER | review and verify claim |
| 5 | .claude/skills/control-ai-browsers/features/instances.md | "`.browsers\<name>`, its own `--enable-features` set and its own remote-debugging port, all read from" | unverifiable | NEEDS-USER | review and verify claim |
| 6 | .claude/skills/control-ai-browsers/features/model-lifecycle.md | "- `model-info` reports every model manifest in the profile (name, versions, performance hints, size, folder..." | unverifiable | NEEDS-USER | review and verify claim |
| 7 | .claude/skills/control-ai-browsers/features/probes.md | "- `probe-run` runs any `async page => {...}` file in a new tab and closes the tab." | unverifiable | NEEDS-USER | review and verify claim |
| 8 | .claude/skills/control-angular-dev-app/SKILL.md | "session; reads Angular state through `window.ng` helpers; captures evidence; tears down only what it started." | unverifiable | NEEDS-USER | review and verify claim |
| 9 | .claude/skills/control-angular-dev-app/features/README.md | "the matching feature file as the recipe. For an app attached with `--url`, write its features here in the" | unverifiable | NEEDS-USER | review and verify claim |
| 10 | .claude/skills/control-angular-dev-app/features/counter.md | "The ng222-app page shows one line, `Clicks: 3 (double 6, cart 1)`, and an `Increment` button. Each click" | unverifiable | NEEDS-USER | review and verify claim |
| 11 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "type, the contract's policy number and a description. Data comes from `http://localhost:3000/api/claims`." | unverifiable | NEEDS-USER | review and verify claim |
| 12 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "`http://localhost:3000/api/complaints` and `/api/customers`." | unverifiable | NEEDS-USER | review and verify claim |
| 13 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "policy number and start date. Data comes from the API at `http://localhost:3000/api/contracts`." | unverifiable | NEEDS-USER | review and verify claim |
| 14 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "domain (General, Contract, Claim, Complaint, Customer) and a content area. `/` redirects to `/home`, which" | unverifiable | NEEDS-USER | review and verify claim |
| 15 | .claude/skills/control-angular-dev-app/features/ssr.md | "`Render mode: server` (or `prerender`, `client` on the other routes), an `Early click` button with its count," | unverifiable | NEEDS-USER | review and verify claim |
| 16 | .claude/skills/control-angular-devtools/SKILL.md | "Manages the Angular DevTools extension and drives its panel. Supported browsers: `chrome`, `chrome-beta`," | unverifiable | NEEDS-USER | review and verify claim |
| 17 | .claude/skills/control-angular-devtools/features/README.md | "What a developer does with Angular DevTools, and how `control-angular-devtools` reaches it. `S` is" | unverifiable | NEEDS-USER | review and verify claim |
| 18 | .claude/skills/control-angular-devtools/features/attach.md | "- Connected flag `window.__NG_DEVTOOLS_CONNECTED__`." | unverifiable | NEEDS-USER | review and verify claim |
| 19 | .claude/skills/control-angular-devtools/features/install.md | "Angular DevTools is a Chrome Web Store extension (`ienfalfjdbdpebioblfackkekamfmbnh`). A developer adds it" | unverifiable | NEEDS-USER | review and verify claim |
| 20 | .claude/skills/control-angular-devtools/features/profiler.md | "cycle. It subscribes through `ng.ɵsetProfiler`, which keeps a list of subscribers in Angular 22." | unverifiable | NEEDS-USER | review and verify claim |
| 21 | .claude/skills/control-angular-devtools/features/signal-graph.md | "component's template node, its signals, computeds and effects, with their current values and edges." | unverifiable | NEEDS-USER | review and verify claim |
| 22 | .claude/skills/control-pangular-inspector/SKILL.md | "description: Install, check, remove and configure Pangular Inspector (@pangular-inspector/devtools, pinned ..." | unverifiable | NEEDS-USER | review and verify claim |
| 23 | .claude/skills/control-pangular-inspector/features/README.md | "- Run commands from the repository root. `S` is `.claude/skills/control-pangular-inspector/scripts/control...." | unverifiable | NEEDS-USER | review and verify claim |
| 24 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "- `live.pages`: `list-pages` shows the tab's page id, URL and the inspectors that report." | unverifiable | NEEDS-USER | review and verify claim |
| 25 | .claude/skills/control-pangular-inspector/features/navigation.md | "- `nav.explain`: `explain-navigation`, newest first, with trigger, `started by`, phases and outcome" | unverifiable | NEEDS-USER | review and verify claim |
| 26 | .claude/skills/control-pangular-inspector/features/panel.md | "- `panel.dashboard`: project name, Angular and TypeScript versions, SSR off, `LIVE` badge, Configuration block" | unverifiable | NEEDS-USER | review and verify claim |
| 27 | .claude/skills/control-pangular-inspector/features/setup.md | "- `setup.install`: exact pin `@pangular-inspector/devtools@0.0.7` in `devDependencies`, overlay import, pro..." | unverifiable | NEEDS-USER | review and verify claim |
| 28 | .claude/skills/control-pangular-inspector/features/source-scan.md | "- `scan.tools`: `get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`," | unverifiable | NEEDS-USER | review and verify claim |
| 29 | .claude/skills/control-vitest-browser-angular/SKILL.md | "description: Run, drive, screenshot, inspect and reproduce the ng222-app counter's Vitest Browser Mode test..." | unverifiable | NEEDS-USER | review and verify claim |
| 30 | .claude/skills/control-vitest-browser-angular/features/README.md | "- Run commands from the repository root. `S` is `.claude/skills/control-vitest-browser-angular/scripts/cont..." | unverifiable | NEEDS-USER | review and verify claim |
| 31 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "`spikes/ng222-app/src/app/counter.spec.ts` renders `Counter` with `vitest-browser-angular`'s `render()` and" | unverifiable | NEEDS-USER | review and verify claim |
| 32 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "An unpacked extension loaded by `up --extension` runs in the same browser as the tests. With the S1 Vitest" | unverifiable | NEEDS-USER | review and verify claim |
| 33 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "With `--hold <ms>`, the hold test renders `Counter` in the tester iframe with `CartService` overridden to" | unverifiable | NEEDS-USER | review and verify claim |
| 34 | .claude/skills/verify-ai-browsers/SKILL.md | "description: Fixed proof checks for the built-in AI in control-ai-browsers' per-model browser instances (Ch..." | unverifiable | NEEDS-USER | review and verify claim |
| 35 | .claude/skills/verify-angular-devtools/SKILL.md | "`control-angular-devtools` launches, health-checks and drives the harness and the panel, and" | unverifiable | NEEDS-USER | review and verify claim |
| 36 | .claude/skills/verify-pangular-inspector/SKILL.md | "description: Fixed proof checks for Pangular Inspector (@pangular-inspector/devtools 0.0.7) on the ng-journ..." | unverifiable | NEEDS-USER | review and verify claim |
| 37 | .commandcode/skills/control-ai-browsers/SKILL.md | "description: Launch, stop, doctor and drive the per-model browser instances for the built-in AI (Prompt API..." | unverifiable | NEEDS-USER | review and verify claim |
| 38 | .commandcode/skills/control-ai-browsers/features/README.md | "matching feature file. `C` below stands for `node .commandcode/skills/control-ai-browsers/scripts/control.m..." | unverifiable | NEEDS-USER | review and verify claim |
| 39 | .commandcode/skills/control-ai-browsers/features/extension-panel.md | "`extension/` (registry `extension`), or the folder `up --extension=<dir>` names. The extension adds a DevTo..." | unverifiable | NEEDS-USER | review and verify claim |
| 40 | .commandcode/skills/control-ai-browsers/features/health-check.md | "`Ready` in Broker State on the requested backend, the Prompt API reports `available`, and the model answers..." | unverifiable | NEEDS-USER | review and verify claim |
| 41 | .commandcode/skills/control-ai-browsers/features/instances.md | "`.browsers\<name>`, its own `--enable-features` set and its own remote-debugging port, all read from" | unverifiable | NEEDS-USER | review and verify claim |
| 42 | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md | "- `model-info` reports every model manifest in the profile (name, versions, performance hints, size, folder..." | unverifiable | NEEDS-USER | review and verify claim |
| 43 | .commandcode/skills/control-ai-browsers/features/probes.md | "- `probe-run` runs any `async page => {...}` file in a new tab and closes the tab." | unverifiable | NEEDS-USER | review and verify claim |
| 44 | .commandcode/skills/control-angular-dev-app/SKILL.md | "session; reads Angular state through `window.ng` helpers; captures evidence; tears down only what it started." | unverifiable | NEEDS-USER | review and verify claim |
| 45 | .commandcode/skills/control-angular-dev-app/features/README.md | "the matching feature file as the recipe. For an app attached with `--url`, write its features here in the" | unverifiable | NEEDS-USER | review and verify claim |
| 46 | .commandcode/skills/control-angular-dev-app/features/counter.md | "The ng222-app page shows one line, `Clicks: 3 (double 6, cart 1)`, and an `Increment` button. Each click" | unverifiable | NEEDS-USER | review and verify claim |
| 47 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "type, the contract's policy number and a description. Data comes from `http://localhost:3000/api/claims`." | unverifiable | NEEDS-USER | review and verify claim |
| 48 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "`http://localhost:3000/api/complaints` and `/api/customers`." | unverifiable | NEEDS-USER | review and verify claim |
| 49 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "policy number and start date. Data comes from the API at `http://localhost:3000/api/contracts`." | unverifiable | NEEDS-USER | review and verify claim |
| 50 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "domain (General, Contract, Claim, Complaint, Customer) and a content area. `/` redirects to `/home`, which" | unverifiable | NEEDS-USER | review and verify claim |
| 51 | .commandcode/skills/control-angular-dev-app/features/ssr.md | "`Render mode: server` (or `prerender`, `client` on the other routes), an `Early click` button with its count," | unverifiable | NEEDS-USER | review and verify claim |
| 52 | .commandcode/skills/control-angular-devtools/SKILL.md | "Manages the Angular DevTools extension and drives its panel. Supported browsers: `chrome`, `chrome-beta`," | unverifiable | NEEDS-USER | review and verify claim |
| 53 | .commandcode/skills/control-angular-devtools/features/README.md | "What a developer does with Angular DevTools, and how `control-angular-devtools` reaches it. `S` is" | unverifiable | NEEDS-USER | review and verify claim |
| 54 | .commandcode/skills/control-angular-devtools/features/attach.md | "- Connected flag `window.__NG_DEVTOOLS_CONNECTED__`." | unverifiable | NEEDS-USER | review and verify claim |
| 55 | .commandcode/skills/control-angular-devtools/features/install.md | "Angular DevTools is a Chrome Web Store extension (`ienfalfjdbdpebioblfackkekamfmbnh`). A developer adds it" | unverifiable | NEEDS-USER | review and verify claim |
| 56 | .commandcode/skills/control-angular-devtools/features/profiler.md | "cycle. It subscribes through `ng.ɵsetProfiler`, which keeps a list of subscribers in Angular 22." | unverifiable | NEEDS-USER | review and verify claim |
| 57 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "component's template node, its signals, computeds and effects, with their current values and edges." | unverifiable | NEEDS-USER | review and verify claim |
| 58 | .commandcode/skills/control-pangular-inspector/SKILL.md | "description: Install, check, remove and configure Pangular Inspector (@pangular-inspector/devtools, pinned ..." | unverifiable | NEEDS-USER | review and verify claim |
| 59 | .commandcode/skills/control-pangular-inspector/features/README.md | "- Run commands from the repository root. `S` is `.commandcode/skills/control-pangular-inspector/scripts/con..." | unverifiable | NEEDS-USER | review and verify claim |
| 60 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | "- `live.pages`: `list-pages` shows the tab's page id, URL and the inspectors that report." | unverifiable | NEEDS-USER | review and verify claim |
| 61 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "- `nav.explain`: `explain-navigation`, newest first, with trigger, `started by`, phases and outcome" | unverifiable | NEEDS-USER | review and verify claim |
| 62 | .commandcode/skills/control-pangular-inspector/features/panel.md | "- `panel.dashboard`: project name, Angular and TypeScript versions, SSR off, `LIVE` badge, Configuration block" | unverifiable | NEEDS-USER | review and verify claim |
| 63 | .commandcode/skills/control-pangular-inspector/features/setup.md | "- `setup.install`: exact pin `@pangular-inspector/devtools@0.0.7` in `devDependencies`, overlay import, pro..." | unverifiable | NEEDS-USER | review and verify claim |
| 64 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "- `scan.tools`: `get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`," | unverifiable | NEEDS-USER | review and verify claim |
| 65 | .commandcode/skills/control-vitest-browser-angular/SKILL.md | "description: Run, drive, screenshot, inspect and reproduce the ng222-app counter's Vitest Browser Mode test..." | unverifiable | NEEDS-USER | review and verify claim |
| 66 | .commandcode/skills/control-vitest-browser-angular/features/README.md | "- Run commands from the repository root. `S` is `.commandcode/skills/control-vitest-browser-angular/scripts..." | unverifiable | NEEDS-USER | review and verify claim |
| 67 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "`spikes/ng222-app/src/app/counter.spec.ts` renders `Counter` with `vitest-browser-angular`'s `render()` and" | unverifiable | NEEDS-USER | review and verify claim |
| 68 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "An unpacked extension loaded by `up --extension` runs in the same browser as the tests. With the S1 Vitest" | unverifiable | NEEDS-USER | review and verify claim |
| 69 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "With `--hold <ms>`, the hold test renders `Counter` in the tester iframe with `CartService` overridden to" | unverifiable | NEEDS-USER | review and verify claim |
| 70 | .commandcode/skills/link-workspace-packages/SKILL.md | "Check whether there's a `packageManager` field in the root-level `package.json`." | unverifiable | NEEDS-USER | review and verify claim |
| 71 | .commandcode/skills/monitor-ci/SKILL.md | "- **Current Branch:** !`git branch --show-current`" | unverifiable | NEEDS-USER | review and verify claim |
| 72 | .commandcode/skills/monitor-ci/references/fix-flows.md | "The script returns `autoApplySkipReason` in its output." | unverifiable | NEEDS-USER | review and verify claim |
| 73 | .commandcode/skills/nx-cloud-api/SKILL.md | "name: nx-cloud-api" | unverifiable | NEEDS-USER | review and verify claim |
| 74 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "1. Run `npx nx-cloud api --describe <operation>`. Use only its documented" | unverifiable | NEEDS-USER | review and verify claim |
| 75 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "name: nx-cloud-cache-investigator" | unverifiable | NEEDS-USER | review and verify claim |
| 76 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "`npx nx-cloud api "<link>" -o <private-file>.tar.gz`. Do not extract it in the" | unverifiable | NEEDS-USER | review and verify claim |
| 77 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "report asset. Task assets are typed `logs`, `artifact`, or `sandbox-report`." | unverifiable | NEEDS-USER | review and verify claim |
| 78 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "name: nx-cloud-ci-failure-review" | unverifiable | NEEDS-USER | review and verify claim |
| 79 | .commandcode/skills/nx-generate/SKILL.md | "name: nx-generate" | unverifiable | NEEDS-USER | review and verify claim |
| 80 | .commandcode/skills/nx-import/SKILL.md | "name: nx-import" | unverifiable | NEEDS-USER | review and verify claim |
| 81 | .commandcode/skills/nx-import/references/ESLINT.md | "ESLint-specific guidance for `nx import`. For generic import issues (root deps, pnpm globs, project referen..." | unverifiable | NEEDS-USER | review and verify claim |
| 82 | .commandcode/skills/nx-import/references/GRADLE.md | "- If you import an entire Gradle repository into a subfolder, files like `gradlew`, `gradlew.bat`, and `gra..." | unverifiable | NEEDS-USER | review and verify claim |
| 83 | .commandcode/skills/nx-import/references/JEST.md | "Jest-specific guidance for `nx import`. For the basic "Jest Preset Missing" fix (create `jest.preset.js`, i..." | unverifiable | NEEDS-USER | review and verify claim |
| 84 | .commandcode/skills/nx-import/references/NEXT.md | "Next.js-specific guidance for `nx import`. For generic import issues (pnpm globs, root deps, project refere..." | unverifiable | NEEDS-USER | review and verify claim |
| 85 | .commandcode/skills/nx-import/references/TURBOREPO.md | "- Migration guide: https://nx.dev/docs/guides/adopting-nx/from-turborepo#easy-automated-migration-example" | unverifiable | NEEDS-USER | review and verify claim |
| 86 | .commandcode/skills/nx-import/references/VITE.md | "Vite-specific guidance for `nx import`. For generic import issues (pnpm globs, root deps, project reference..." | unverifiable | NEEDS-USER | review and verify claim |
| 87 | .commandcode/skills/nx-plugins/SKILL.md | "name: nx-plugins" | unverifiable | NEEDS-USER | review and verify claim |
| 88 | .commandcode/skills/nx-run-tasks/SKILL.md | "name: nx-run-tasks" | unverifiable | NEEDS-USER | review and verify claim |
| 89 | .commandcode/skills/nx-workspace/SKILL.md | "name: nx-workspace" | unverifiable | NEEDS-USER | review and verify claim |
| 90 | .commandcode/skills/nx-workspace/references/AFFECTED.md | "```bash" | unverifiable | NEEDS-USER | review and verify claim |
| 91 | .commandcode/skills/verify-ai-browsers/SKILL.md | "description: Fixed proof checks for the built-in AI in control-ai-browsers' per-model browser instances (Ch..." | unverifiable | NEEDS-USER | review and verify claim |
| 92 | .commandcode/skills/verify-angular-devtools/SKILL.md | "`control-angular-devtools` launches, health-checks and drives the harness and the panel, and" | unverifiable | NEEDS-USER | review and verify claim |
| 93 | .commandcode/skills/verify-pangular-inspector/SKILL.md | "description: Fixed proof checks for Pangular Inspector (@pangular-inspector/devtools 0.0.7) on the ng-journ..." | unverifiable | NEEDS-USER | review and verify claim |
| 94 | docs/afk-run-2026-10-12.md | "Lars, verbatim: "You are now running in AFK mode overnight". Started 02:2x local time. Claude runs `lars-mo..." | unverifiable | NEEDS-USER | review and verify claim |
| 95 | docs/design/tutor.md | "Labels, as in `docs/feature-proposals.md`:" | unverifiable | NEEDS-USER | review and verify claim |
| 96 | docs/feature-proposals.md | "Target: a Chrome and Edge MV3 extension that inspects any Angular 22.2 application running in development m..." | unverifiable | NEEDS-USER | review and verify claim |
| 97 | docs/filing-ledger.md | "Status: draft, not filed. Found 2026-10-11 during spike S2 (`docs/feature-proposals.md` section 7)." | unverifiable | NEEDS-USER | review and verify claim |
| 98 | plans/angular-ai-devtools-proposals.handoff.md | "Written by Claude for a fresh session, 2026-10-12. Repository: `D:\projects\sandbox\angular-ai-devtools` (l..." | unverifiable | NEEDS-USER | review and verify claim |
| 99 | references/ai-browsers-verification.md | "The claims and checks live in `.commandcode/skills/verify-ai-browsers` (`checks/state.mjs`," | unverifiable | NEEDS-USER | review and verify claim |
| 100 | references/edge-dev-aion-model.md | "How to use the pin (`model pin`, the restore on `up`, doctor's `model.pin` row) is in" | unverifiable | NEEDS-USER | review and verify claim |
| 101 | research/00-browser-probe.md | "All results below are **measured**. The probe ran in a normal page tab (`https://example.com`) through play..." | unverifiable | NEEDS-USER | review and verify claim |
| 102 | research/01-built-in-ai-apis.md | "1. Chrome ships `LanguageModel` to extensions (138+) and the web (148+). Structured output (`responseConstr..." | unverifiable | NEEDS-USER | review and verify claim |
| 103 | research/02-angular-surface.md | "Sources: local clone `D:\projects\github\angular\angular` on branch `22.2.x` (CHANGELOG top entry is `22.2...." | unverifiable | NEEDS-USER | review and verify claim |
| 104 | research/03-prior-art.md | "Labels: **[measured: source]** = read in the named file or URL. **[search-summary: URL]** = from a search-e..." | unverifiable | NEEDS-USER | review and verify claim |
| 105 | research/04-ecosystem.md | "Date: 2026-10-11. Target: an Angular 22.2 dev-mode app, inspected by a Chrome/Edge MV3 extension (content s..." | unverifiable | NEEDS-USER | review and verify claim |
| 106 | research/05-spikes.md | "All results are **measured** unless a line says inferred. Probes ran in Lars's Edge Dev 157 (Aion-1.1-Instr..." | unverifiable | NEEDS-USER | review and verify claim |
| 107 | research/06-angular-skills.md | "Source: `D:\projects\github\angular\skills`, branch `main`, commit `747c3c2` (message "release: cut the v22..." | unverifiable | NEEDS-USER | review and verify claim |
| 108 | research/07-prompting-small-models.md | "No browser was opened for this note. The browser measurements it builds on are in `00-browser-probe.md` and..." | unverifiable | NEEDS-USER | review and verify claim |
| 109 | research/08-recent-angular-features.md | "Labels: **[measured]** = read in a named source (file:line, URL) or run; **[inferred]** = reasoned from mea..." | unverifiable | NEEDS-USER | review and verify claim |
| 110 | research/09-nano-tool-session-error.md | "Measured behaviour: `05-spikes.md`, section "Root cause hunt" (Chrome Beta 156.0.8078.17, Nano profile serv..." | unverifiable | NEEDS-USER | review and verify claim |
| 111 | research/10-model-capabilities.md | "Written 2026-10-11 by Claude (researcher agent). No browser was opened for this note. It compares what vend..." | unverifiable | NEEDS-USER | review and verify claim |
| 112 | research/11-spike-s1-extension-contexts.md | "Question (feature proposals, section 3.1 and section 7, row S1): can a Manifest V3 extension use `LanguageM..." | unverifiable | NEEDS-USER | review and verify claim |
| 113 | research/12-legacy-vs-modern-angular.md | "Lars's follow-up request, verbatim: "Surely, there are other candidates than those I mentioned. Use your ra..." | unverifiable | NEEDS-USER | review and verify claim |
| 114 | research/13-portal-legacy-audit.md | "Date: 2026-10-12. Checkout: `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtool..." | unverifiable | NEEDS-USER | review and verify claim |
| 115 | research/14-ai-devtools-prior-art.md | "Status: complete (2026-10-12). Author: Claude, for Lars. Who read what: Claude itself read Angular's `webmc..." | unverifiable | NEEDS-USER | review and verify claim |
| 116 | research/15-deterministic-and-ai.md | "\| PX \| Prompt API explainer, `https://raw.githubusercontent.com/webmachinelearning/prompt-api/main/README..." | unverifiable | NEEDS-USER | review and verify claim |
| 117 | research/16-ssr-runtime.md | "Question: which SSR and hydration facts can a browser extension read from a running Angular 22.2 page in" | unverifiable | NEEDS-USER | review and verify claim |
| 118 | research/17-vitest-browser-runtime.md | "3. Once the extension is present: what do `window.ng`, the signal graph, the profiler, the injector and" | unverifiable | NEEDS-USER | review and verify claim |
| 119 | research/18-edge-prevent-auto-signin.md | "Research date: 2026. Target: Microsoft Edge Stable 155 on Windows, launching with a fresh `--user-data-dir`..." | unverifiable | NEEDS-USER | review and verify claim |
| 120 | research/19-languagemodel-in-extension-contexts.md | "MAIN world, through `relay.js` and `agent-main.js`. Those scripts talk over `window` CustomEvents, so any s..." | unverifiable | NEEDS-USER | review and verify claim |
| 121 | research/20-built-in-ai-without-flags.md | "Earlier claims (research/19 and the panel checks) were all measured with the `control-ai-browsers` instances'" | unverifiable | NEEDS-USER | review and verify claim |
| 122 | spikes/ng222-app/README.md | "This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2." | unverifiable | NEEDS-USER | review and verify claim |
| 123 | spikes/ng222-ssr/README.md | "This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2." | unverifiable | NEEDS-USER | review and verify claim |
