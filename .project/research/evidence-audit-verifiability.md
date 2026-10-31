# Evidence — audit-verifiability

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: audit-verifiability
Questions assigned: Which of the 137 unverifiable rows are testable with the commands the repository already ships, and which need evidence this milestone cannot produce?

## Finding: Message-type claims are settleable by grep across src/ and extension/

- **Claim**: 8 rows claim message-type strings (angular-ai:di-query, angular-ai:di-graph, angular-ai:error-capture, angular-ai:error-explain, angular-ai:interop, angular-ai:record, angular-ai:stale-view); each is decidable by Select-String over the repository source.
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md (Remediation queue, unverifiable rows) + repository path reads
- **Confidence**: high
- **Why it matters here**: These are the cheapest settleable rows: a single grep decides each claim without any runtime.

## Finding: Extension-id claims are settleable against control.mjs EXT_ID

- **Claim**: 3 rows cite extension ids (ienfalfjdbdpebioblfackkekamfmbnh twice, mgkfgkdgobahfcgkdlokpoehblpbkfok); the shipped control.mjs holds EXT_ID = ienfalfjdbdpebioblfackkekamfmbnh.
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md (Remediation queue, unverifiable rows) + repository path reads
- **Confidence**: high
- **Why it matters here**: Resolves the .claude vs .commandcode id discrepancy without a browser run.

## Finding: Build/doctor claims are settleable against project.json and control.mjs

- **Claim**: 5 rows (panel built via build-extension, build writes extension/panel files, nineteen check lines x2, panel is built before up) are decidable by reading project.json targets and counting doctor check ids in control.mjs.
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md (Remediation queue, unverifiable rows) + repository path reads
- **Confidence**: high
- **Why it matters here**: Closes skill-doc build claims using shipped Nx config and skill code.

## Finding: On-device/browser claims are not-settleable under the static-only constraint

- **Claim**: 92 rows depend on a browser or on-device model actually running, an external insurance-portal checkout, an upstream project, or a dated historical measurement; none can be produced without violating the milestone's static-evidence constraint.
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md (Remediation queue, unverifiable rows) + repository path reads
- **Confidence**: high
- **Why it matters here**: These must be recorded as not-settleable with the missing evidence named, not re-derived.

## Assigned questions — answers

- Which of the 137 unverifiable rows are testable with the commands the repository already ships, and which need evidence this milestone cannot produce? → 45 settleable (repository path read or shipped command decides the claim); 92 not-settleable (browser/on-device model run, external portal checkout, unreachable upstream, or dated historical measurement required). See appendix table below (one row per queue number, ascending).

## Dead ends

- Reading node_modules for @nx plugin presence is a static path read and is treated as settleable; plugin absence (ls) settles the claim negatively.
- Runtime counters (Clicks:, hydratedComponents, Tests passed) are not settleable because the constraint forbids running the test runner or a browser.

## Appendix: unverifiable row triage

| Queue # | Doc | Claim | Disposition | Settling check or missing evidence |
|---|---|---|---|---|
| 31 | .claude/skills/control-angular-devtools/SKILL.md | "Chrome for Testing 154.0.8037.0" | not-settleable | no version file in repository; needs installed browser/version evidence |
| 60 | .claude/skills/control-pangular-inspector/features/panel.md | "panel URL http://localhost:4507/__pangular/" | not-settleable | external Pangular/portal runtime or installed package; not in repo |
| 369 | .claude/skills/control-ai-browsers/features/di-doctor.md | "message types angular-ai:di-query / angular-ai:di-graph" | settleable | Select-String across src/ and extension/ for the message type string named in the claim |
| 371 | .claude/skills/control-ai-browsers/features/error-explainer.md | "message types angular-ai:error-capture / angular-ai:error-explain" | settleable | Select-String across src/ and extension/ for the message type string named in the claim |
| 380 | .claude/skills/control-ai-browsers/features/interop.md | "message types angular-ai:interop" | settleable | Select-String across src/ and extension/ for the message type string named in the claim |
| 396 | .claude/skills/control-pangular-inspector/SKILL.md | "0.0.7 lists 46 tools" | not-settleable | external Pangular/portal runtime or installed package; not in repo |
| 415 | .commandcode/skills/control-ai-browsers/features/interop.md | "message type angular-ai:interop" | settleable | Select-String across src/ and extension/ for the message type string named in the claim |
| 429 | .commandcode/skills/control-pangular-inspector/features/panel.md | "title Pangular Inspector" | not-settleable | external Pangular/portal runtime or installed package; not in repo |
| 547 | .claude/skills/control-ai-browsers/SKILL.md | "v3Nano CPU variant 2025.8.21.1028" | settleable | Test-Path .commandcode/worktrees/.browsers/chrome-beta-nano/OptGuideOnDeviceModel/2025.8.21.1028 |
| 548 | .claude/skills/control-ai-browsers/features/README.md | "panel built via npx nx run angular-ai-devtools:build-extension" | settleable | Select-String -Path apps/angular-ai-devtools/project.json -Pattern build-extension; Test-Path extension/panel/ |
| 549 | .claude/skills/control-ai-browsers/features/extension-panel.md | "panel frame URL chrome-extension://<id>/panel/" | settleable | Select-String -Path extension/ -Pattern 'chrome-extension://.*/panel/' |
| 550 | .claude/skills/control-ai-browsers/features/health-check.md | "nineteen check lines" | settleable | Select-String -Path .commandcode/skills/control-ai-browsers/scripts/control.mjs -Pattern check id (count emitted ids) |
| 551 | .claude/skills/control-angular-dev-app/features/README.md | "Counter fresh page state: count 3, double 6, cart 1 item" | not-settleable | browser/test runtime measurement; cannot run browser or test runner under static-only constraint |
| 552 | .claude/skills/control-angular-dev-app/features/counter.md | "page shows Clicks: 3 (double 6, cart 1)" | not-settleable | browser/test runtime measurement; cannot run browser or test runner under static-only constraint |
| 553 | .claude/skills/control-angular-dev-app/features/counter.md | "component is OnPush by default (no changeDetection declared)" | settleable | Select-String -Path spikes/ng222-app/src/app -Pattern changeDetection |
| 554 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "claim-list table columns Claim number, Damage Type, Date, Policynumber, Customer" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
| 555 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "5 rows measured" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
| 556 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "complaint-list columns Type, Customer, Date, Description; 2 seeded rows" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
| 557 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer-list 30 rows" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
| 558 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "contract-list 20 rows after fresh API start" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
| 559 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "Save sends PUT /api/contracts" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
| 560 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "header 'Insurance Portal' with ng-journal logo" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
| 561 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "unknown URLs show Page Not Found" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
| 562 | .claude/skills/control-angular-dev-app/features/ssr.md | "hydratedComponents 4, hydratedNodes 40" | not-settleable | browser/test runtime measurement; cannot run browser or test runner under static-only constraint |
| 563 | .claude/skills/control-angular-dev-app/features/ssr.md | "transfer cache off with ?transfer=0" | settleable | Select-String -Path spikes/ng222-ssr/src -Pattern transferCache\|transfer=0 |
| 564 | .claude/skills/control-angular-devtools/SKILL.md | "extension id ienfalfjdbdpebioblfackkekamfmbnh" | settleable | Select-String -Path .commandcode/skills/control-angular-devtools/scripts/control.mjs -Pattern EXT_ID (line 89) |
| 565 | .claude/skills/control-angular-devtools/SKILL.md | "install copies newest version folder from Edge Dev profile" | not-settleable | requires runtime Edge Dev profile; not in repo |
| 566 | .claude/skills/control-angular-devtools/features/attach.md | "window.__NG_DEVTOOLS_CONNECTED__ === true" | settleable | Select-String -Path extension/ -Pattern __NG_DEVTOOLS_CONNECTED__ |
| 567 | .claude/skills/control-angular-devtools/features/install.md | "Web Store extension id ienfalfjdbdpebioblfackkekamfmbnh" | settleable | Select-String -Path .commandcode/skills/control-angular-devtools/scripts/control.mjs -Pattern EXT_ID (line 89) |
| 568 | .claude/skills/control-angular-devtools/features/install.md | "branded install proven in Chrome Beta 2026-10-11" | not-settleable | dated historical measurement (2026-10-11) with no test output in repo |
| 569 | .claude/skills/control-angular-devtools/features/profiler.md | "ng.ɵsetProfiler keeps a list of subscribers in Angular 22" | not-settleable | external Angular runtime API; not in repo source |
| 570 | .claude/skills/control-angular-devtools/features/signal-graph.md | "before: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | not-settleable | evidence not present in repository and cannot be produced statically |
| 571 | .claude/skills/control-angular-devtools/features/signal-graph.md | "after angular:di_graph template node gone from both" | not-settleable | evidence not present in repository and cannot be produced statically |
| 572 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "inspect-signals returns template node and computed contracts" | not-settleable | external Pangular/portal runtime or installed package; not in repo |
| 573 | .claude/skills/control-pangular-inspector/features/navigation.md | "explain-navigation limit defaults to 5 (at most 50)" | not-settleable | external Pangular/portal runtime or installed package; not in repo |
| 574 | .claude/skills/control-pangular-inspector/features/navigation.md | "list-routes 12 routes measured" | not-settleable | external Pangular/portal runtime or installed package; not in repo |
| 575 | .claude/skills/control-pangular-inspector/features/navigation.md | "lint-routes one info finding missing-title" | not-settleable | external Pangular/portal runtime or installed package; not in repo |
| 576 | .claude/skills/control-pangular-inspector/features/panel.md | "title Pangular Inspector" | not-settleable | external Pangular/portal runtime or installed package; not in repo |
| 577 | .claude/skills/control-pangular-inspector/features/panel.md | "Angular 22.2.2 in panel" | not-settleable | external Pangular/portal runtime or installed package; not in repo |
| 578 | .claude/skills/control-pangular-inspector/features/setup.md | "check exits 0 with six OK lines" | not-settleable | external Pangular/portal runtime or installed package; not in repo |
| 579 | .claude/skills/control-pangular-inspector/features/source-scan.md | "scan get-components returns [] at workspace root" | not-settleable | external Pangular/portal runtime or installed package; not in repo |
| 580 | .claude/skills/control-pangular-inspector/features/source-scan.md | "build-meta Angular 22.2.2" | not-settleable | external Pangular/portal runtime or installed package; not in repo |
| 581 | .claude/skills/control-vitest-browser-angular/SKILL.md | "Vitest default port 63315 cannot be used" | not-settleable | evidence not present in repository and cannot be produced statically |
| 582 | .claude/skills/control-vitest-browser-angular/features/README.md | "baseline fresh Counter Clicks: 3 (double 6, cart 2)" | not-settleable | browser/test runtime measurement; cannot run browser or test runner under static-only constraint |
| 583 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "Tests 2 passed \ \| 2 skipped (4) without flags" | not-settleable | browser/test runtime measurement; cannot run browser or test runner under static-only constraint |
| 584 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "timing demo fails expected Clicks: 3 to contain Clicks: 4" | not-settleable | browser/test runtime measurement; cannot run browser or test runner under static-only constraint |
| 585 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "touching counter.spec.ts reruns suite" | not-settleable | browser/test runtime measurement; cannot run browser or test runner under static-only constraint |
| 586 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "s1-vitest content scripts on http://127.0.0.1/* and http://localhost/*" | settleable | Select-String -Path extension/manifest.json -Pattern content_scripts |
| 587 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "LanguageModel available in attach mode" | not-settleable | evidence not present in repository and cannot be produced statically |
| 588 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "isolated world sees typeof window.ng undefined" | not-settleable | browser/test runtime measurement; cannot run browser or test runner under static-only constraint |
| 589 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "held Counter shows Clicks: 3 (double 6, cart 2)" | not-settleable | browser/test runtime measurement; cannot run browser or test runner under static-only constraint |
| 590 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "ng.ɵgetSignalGraph returns template div -> title,count,double" | not-settleable | external Angular runtime API; not in repo source |
| 591 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "CartService overridden to pear, plum" | settleable | Select-String -Path spikes/ -Pattern 'pear, plum' (test fixture override) |
| 592 | .claude/skills/verify-pangular-inspector/SKILL.md | "setup check exits 0 with setup facts" | not-settleable | external Pangular/portal runtime or installed package; not in repo |
| 593 | .commandcode/pstack-models.md | "default effort sets the level for a value without one" | settleable | Select-String -Path .commandcode -Pattern 'default effort' |
| 594 | .commandcode/skills/control-ai-browsers/features/README.md | "panel is built before up" | settleable | Select-String -Path apps/angular-ai-devtools/project.json -Pattern build-extension; Test-Path extension/panel/ |
| 595 | .commandcode/skills/control-ai-browsers/features/di-doctor.md | "message types angular-ai:di-query / angular-ai:di-graph" | settleable | Select-String across src/ and extension/ for the message type string named in the claim |
| 596 | .commandcode/skills/control-ai-browsers/features/error-explainer.md | "captures NG0xxx and uncaught console errors" | settleable | Select-String -Path apps/angular-ai-devtools/src/app/error-explainer* -Pattern NG0 |
| 597 | .commandcode/skills/control-ai-browsers/features/error-explainer.md | "Implementation error-explainer.component.ts" | settleable | Test-Path apps/angular-ai-devtools/src/app/component.ts (or referenced path); read the file to confirm |
| 598 | .commandcode/skills/control-ai-browsers/features/error-explainer.md | "message types angular-ai:error-capture / angular-ai:error-explain" | settleable | Select-String across src/ and extension/ for the message type string named in the claim |
| 599 | .commandcode/skills/control-ai-browsers/features/extension-panel.md | "extension id mgkfgkdgobahfcgkdlokpoehblpbkfok" | settleable | Select-String across the repository for 'mgkfgkdgobahfcgkdlokpoehblpbkfok' |
| 600 | .commandcode/skills/control-ai-browsers/features/extension-panel.md | "build writes extension/panel files" | settleable | Test-Path extension/panel/main.js, styles.css, index.html |
| 601 | .commandcode/skills/control-ai-browsers/features/health-check.md | "nineteen check lines" | settleable | Select-String -Path .commandcode/skills/control-ai-browsers/scripts/control.mjs -Pattern check id (count emitted ids) |
| 602 | .commandcode/skills/control-ai-browsers/features/health-check.md | "Proofreader is not defined" | not-settleable | browser runtime environment claim; no code evidence |
| 603 | .commandcode/skills/control-ai-browsers/features/interop.md | "Implementation interop.component.ts" | settleable | Test-Path apps/angular-ai-devtools/src/app/component.ts (or referenced path); read the file to confirm |
| 604 | .commandcode/skills/control-ai-browsers/features/interop.md | "required panel test ids" | settleable | Select-String -Path apps/angular-ai-devtools/src/app/interop* -Pattern data-testid\|testid |
| 605 | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md | "C model clear bytesRemoved 4269934855" | not-settleable | evidence not present in repository and cannot be produced statically |
| 606 | .commandcode/skills/control-ai-browsers/features/probes.md | "probe10.js tool round trip" | settleable | Get-Content spikes/probes/probe10.js (verify tool round trip) |
| 607 | .commandcode/skills/control-ai-browsers/features/probes.md | "bench records cpuBefore/cpuAfter" | settleable | Select-String -Path spikes/probes/bench.js -Pattern cpuBefore\|cpuAfter |
| 608 | .commandcode/skills/control-ai-browsers/features/signal-provenance.md | "tracer extension/agent-main.js" | settleable | Test-Path extension/agent-main.js |
| 609 | .commandcode/skills/control-ai-browsers/features/signal-provenance.md | "message angular-ai:record" | settleable | Select-String across src/ and extension/ for the message type string named in the claim |
| 610 | .commandcode/skills/control-ai-browsers/features/stale-view.md | "hedged wording the template may show a stale value" | settleable | Select-String -Path apps/angular-ai-devtools/src/app/stale-view.component.ts -Pattern 'may show a stale' |
| 611 | .commandcode/skills/control-ai-browsers/features/stale-view.md | "Implementation stale-view.component.ts" | settleable | Test-Path apps/angular-ai-devtools/src/app/component.ts (or referenced path); read the file to confirm |
| 612 | .commandcode/skills/control-ai-browsers/features/stale-view.md | "message type angular-ai:stale-view" | settleable | Select-String across src/ and extension/ for the message type string named in the claim |
| 613 | .commandcode/skills/control-angular-dev-app/features/counter.md | "count 3" | not-settleable | browser/test runtime measurement; cannot run browser or test runner under static-only constraint |
| 614 | .commandcode/skills/control-angular-dev-app/features/counter.md | "double 6" | not-settleable | browser/test runtime measurement; cannot run browser or test runner under static-only constraint |
| 615 | .commandcode/skills/control-angular-dev-app/features/counter.md | "Angular DevTools panels (Manual only)" | not-settleable | evidence not present in repository and cannot be produced statically |
| 616 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "5 rows measured" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
| 617 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "2 seeded rows" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
| 618 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "30 rows" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
| 619 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "POST /api/complaints" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
| 620 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "20 rows" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
| 621 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "PUT /api/contracts" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
| 622 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "Page Not Found" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
| 623 | .commandcode/skills/control-angular-dev-app/features/ssr.md | "RenderMode.Server" | settleable | Select-String -Path spikes/ng222-ssr/src/app/app.routes.server.ts -Pattern RenderMode.Server |
| 624 | .commandcode/skills/control-angular-devtools/SKILL.md | "Chrome for Testing 154.0.8037.0" | not-settleable | no version file in repository; needs installed browser/version evidence |
| 625 | .commandcode/skills/control-angular-devtools/features/attach.md | "window.__NG_DEVTOOLS_CONNECTED__" | settleable | Select-String -Path extension/ -Pattern __NG_DEVTOOLS_CONNECTED__ |
| 626 | .commandcode/skills/control-angular-devtools/features/install.md | "Angular DevTools 1.22.1" | not-settleable | evidence not present in repository and cannot be produced statically |
| 627 | .commandcode/skills/control-angular-devtools/features/profiler.md | "ng.ɵsetProfiler" | not-settleable | external Angular runtime API; not in repo source |
| 628 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "ng.ɵgetSignalGraph" | not-settleable | external Angular runtime API; not in repo source |
| 629 | .commandcode/skills/control-pangular-inspector/SKILL.md | "With --read-only, 0.0.7 lists 46 tools" | not-settleable | external Pangular/portal runtime or installed package; not in repo |
| 630 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "limit on explain-navigation defaults to 5 (at most 50)" | not-settleable | evidence not present in repository and cannot be produced statically |
| 631 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "Tests 2 passed \ \| 2 skipped (4)" | not-settleable | browser/test runtime measurement; cannot run browser or test runner under static-only constraint |
| 632 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "extension service worker target exists" | not-settleable | browser/test runtime measurement; cannot run browser or test runner under static-only constraint |
| 633 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "Clicks: 3 (double 6, cart 2)" | not-settleable | browser/test runtime measurement; cannot run browser or test runner under static-only constraint |
| 634 | .commandcode/skills/nx-import/references/ESLINT.md | "`@nx/eslint/plugin`" | settleable | Test-Path node_modules/@nx/"`eslint`" |
| 635 | .commandcode/skills/nx-import/references/GRADLE.md | "`@nx/gradle` plugin" | settleable | Test-Path node_modules/@nx/"`gradle` plugin" |
| 636 | .commandcode/skills/nx-import/references/JEST.md | "`@nx/jest/plugin`" | settleable | Test-Path node_modules/@nx/"`jest`" |
| 637 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/next/plugin`" | settleable | Test-Path node_modules/@nx/"`next`" |
| 638 | .commandcode/skills/nx-import/references/VITE.md | "`@nx/vite/plugin`" | settleable | Test-Path node_modules/@nx/"`vite`" |
| 639 | .commandcode/skills/verify-ai-browsers/SKILL.md | "`state` takes about a minute per instance" | not-settleable | evidence not present in repository and cannot be produced statically |
| 640 | .commandcode/skills/verify-pangular-inspector/SKILL.md | "Exact pin 0.0.7 declared and installed" | not-settleable | evidence not present in repository and cannot be produced statically |
| 641 | .commandcode/taste/angular/taste.md | "Never put a `node:test` suite under `*.spec.ts` — the builder compiles it and the app test target fails with TS2591" | settleable | Select-String -Path . -Pattern TS2591 |
| 642 | .commandcode/taste/tooling/taste.md | "Keep browser profiles and downloaded AI models ... on `D:/`, never `C:/`" | settleable | Select-String -Path .commandcode/skills/control-ai-browsers/scripts/control.mjs -Pattern D:/ (profile root) |
| 643 | docs/afk-run-2026-10-12.md | "Tree clean: `git status` shows nothing but ignored paths" | settleable | git -C <repo> status --porcelain (read-only) |
| 644 | docs/design/tutor.md | "No shipped framework devtools panel uses an on-device model" | not-settleable | no survey evidence checked; external claim |
| 648 | docs/feature-proposals.md | "Angular 22.2 in development mode" supported apps | settleable | Select-String -Path package.json -Pattern 22\.1\|22\.2 |
| 651 | references/ai-browsers-verification.md | "Check that port 9992 is free" | settleable | Select-String -Path . -Pattern 9992 |
| 652 | references/ai-browsers-verification.md | "`state` runs about 3 minutes for four instances" | not-settleable | evidence not present in repository and cannot be produced statically |
| 653 | research/00-browser-probe.md | "WebMCP is live in both browsers: typeof document.modelContext === 'object'" | not-settleable | browser-only measurement; no repo evidence |
| 654 | research/01-built-in-ai-apis.md | "Chrome ships LanguageModel to extensions (138+) and the web (148+)" | not-settleable | external Chrome documentation/source; not in sidecar |
| 655 | research/01-built-in-ai-apis.md | "Angular ships provideExperimentalWebMcpTools" | not-settleable | evidence not present in repository and cannot be produced statically |
| 656 | research/01-built-in-ai-apis.md | "DevTools frontend creates extension panel iframes with allow=language-model" | not-settleable | external Chrome documentation/source; not in sidecar |
| 657 | research/02-angular-surface.md | "GLOBAL_PUBLISH_EXPANDO_KEY = ng" | not-settleable | external Angular DevTools source; not in sidecar |
| 658 | research/02-angular-surface.md | "ng.ɵgetRouterInstance published in provide_router.ts" | not-settleable | external Angular runtime API; not in repo source |
| 659 | research/02-angular-surface.md | "Angular DevTools imports ɵFrameworkAgnosticGlobalUtils" | not-settleable | external Angular DevTools source; not in sidecar |
| 660 | research/02-angular-surface.md | "profiler exists only after enableDebugTools" | not-settleable | external Angular DevTools source; not in sidecar |
| 661 | research/03-prior-art.md | "Pangular inspector uses confirm before side effects" | not-settleable | external Chrome DevTools source; not in sidecar |
| 662 | research/03-prior-art.md | "Chrome AI assistance pauses before side effects" | not-settleable | external Chrome DevTools source; not in sidecar |
| 663 | research/04-ecosystem.md | "Analog DEBUG_ROUTES token is providedIn root" | not-settleable | external upstream project/source; not in sidecar |
| 664 | research/04-ecosystem.md | "Vitest Browser Mode orchestrator URL __vitest_test__/" | not-settleable | external upstream project/source; not in sidecar |
| 665 | research/04-ecosystem.md | "RxAngular has no window globals" | not-settleable | external upstream project/source; not in sidecar |
| 666 | research/06-angular-skills.md | "angular/skills repo at commit 747c3c2" | not-settleable | external angular/skills repository; not in sidecar |
| 667 | research/06-angular-skills.md | "No LICENSE file in angular/skills" | not-settleable | external angular/skills repository; not in sidecar |
| 668 | research/06-angular-skills.md | "angular-developer/SKILL.md is 132 lines" | not-settleable | external angular/skills repository; not in sidecar |
| 669 | research/07-prompting-small-models.md | "Aion uses Phi-4 chat and tool tokens" | not-settleable | external model files/docs; not in sidecar |
| 670 | research/07-prompting-small-models.md | "Gemini Nano v3 has no published tool calling docs" | not-settleable | external model files/docs; not in sidecar |
| 671 | research/07-prompting-small-models.md | "responseConstraint accepts JSON Schema or RegExp" | not-settleable | external model files/docs; not in sidecar |
| 672 | research/08-recent-angular-features.md | "CHANGELOG.md top entry is 22.2.0" | not-settleable | external upstream project/source; not in sidecar |
| 673 | research/08-recent-angular-features.md | "Angular 22 default changeDetection is OnPush" | not-settleable | external upstream project/source; not in sidecar |
| 674 | research/08-recent-angular-features.md | "provideExperimentalWebMcpTools is experimental" | not-settleable | external upstream project/source; not in sidecar |
| 675 | research/09-nano-tool-session-error.md | "Chromium tag 156.0.8078.17 was the measured build" | not-settleable | external Chromium source; not in sidecar |
| 676 | research/09-nano-tool-session-error.md | "kExceptionMessageUnableToCreateSession defined in exception_helpers.cc" | not-settleable | external Chromium source; not in sidecar |
| 677 | research/09-nano-tool-session-error.md | "AIPromptAPIToolUse runtime feature gates tool types" | not-settleable | external Chromium source; not in sidecar |
| 678 | research/10-model-capabilities.md | "Phi-4-mini BFCL 70.3" | not-settleable | evidence not present in repository and cannot be produced statically |
| 679 | research/11-spike-s1-extension-contexts.md | "Extension id adkapcgoeebpdmbepbdjmbhfknkcllcc" | not-settleable | evidence not present in repository and cannot be produced statically |
| 680 | research/13-portal-legacy-audit.md | "zone.js polyfill in zoneless app" | not-settleable | external insurance-portal checkout (D:\projects\github\...\ng-journal-insurance-portal-ai-devtools) not present in this repo; runtime portal data |
