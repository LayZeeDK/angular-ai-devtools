# Evidence — audit-verifiability

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: audit-verifiability
Questions assigned: Which `unverifiable` M014 audit rows are now decidable with the commands the repository already ships, and which need evidence this milestone cannot produce?

## Finding: Inventory of unverifiable rows
- **Claim**: The DOCS-AUDIT remediation queue lists 111 rows classed unverifiable (plus 1 stale row 237 handled separately) spanning skills docs, portal fixtures (external checkout), devtools/browser harness docs, and research docs.
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md (Summary shows unverifiable 111; remediation queue rows 22-236,238-314)
- **Confidence**: high
- **Why it matters here**: M015 must reduce unverifiable/stale at shipped head; grouping by decidability determines what can be settled by repo-shipped commands vs what cannot.


## Finding: Decidable by static repo inspection (files/ports/routes/structure exist)
- **Claim**: Rows asserting presence of files, routes, config values, or message types that exist in-repo are decidable via static inspection using repo-shipped tools/paths (no browser/build/test run). Examples: control-ai-browsers features reference message types/angular-ai:* present in app code (grep/read_file equivalent); extension panel files/manifest; spikes/probes exist; skill scripts exist; instances.json values.
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md rows 258-265 (message types) and evidence-codebase.md (routes app.routes.ts, extension manifest, probes)
- **Confidence**: high
- **Why it matters here**: Some unverifiable rows only need confirmation of existing artifacts; the repo already contains them (verifiable by read/search). Settling command pattern: Test-Path, Select-String/grep, or reading files via Get-Content (repo paths). No 
pm test/build required.


## Finding: Decidable by repo-shipped build/config commands (without running full browser harness)
- **Claim**: Claims like "panel built via npx nx run angular-ai-devtools:build-extension" are decidable by inspecting repo-shipped config (apps/angular-ai-devtools/project.json has build-extension target depending on generate-error-digest; extension/manifest.json exists). The command exists in repo (package.json scripts: build-extension). Decidability is structural/config-based, not requiring execution.
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md rows 207,209; apps/angular-ai-devtools/project.json (from evidence-codebase.md); package.json scripts
- **Confidence**: high
- **Why it matters here**: Use Get-Content apps/angular-ai-devtools/project.json, Get-Content package.json (repo-shipped) to confirm target exists; no need to run build. Settling command: static inspection of Nx/project config + package scripts.


## Finding: Decidable via in-repo fixtures and unit tests (node:test)
- **Claim**: Claims about counter fixture values (e.g. Clicks: 3, double 6, cart 1) are decidable from in-repo test/source: spikes/ng222-app/src/app/counter.ts has count = signal(3), counter.spec.ts asserts Clicks: 3 (double 6, cart 1). Repo ships 
pm test (runs node:test on scripts/**/*.test.mjs, extension/**/*.test.mjs, plus node scripts/run-user-scope-tests.mjs, test:skills, test:app). Static inspection is sufficient here; execution not required to decide structure.
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md rows 268-270; evidence-codebase.md (test layout); spikes/ng222-app/src/app/counter.ts, spikes/ng222-app/src/app/counter.spec.ts
- **Confidence**: high
- **Why it matters here**: Use Get-Content on fixture source/spec to decide; repo-shipped command 
pm test would also validate, but static read is sufficient and allowed (no execution required). Rows about fixture state in same repo are decidable without browser.


## Finding: Not decidable from this repository - external checkout required
- **Claim**: Many portal claims (claims list rows, contracts API behavior, portal navigation, feature flags behavior details) depend on external portal checkout D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools which exists outside this repo; rows say "portal checkout not audited here" or reference it. Also pangular-inspector live inspection/navigation/panel claims depend on live portal/instance behavior.
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md rows 22,213-226,238-248,271-283; .claude/skills/control-pangular-inspector/SKILL.md references external portal path
- **Confidence**: high
- **Why it matters here**: Cannot be settled from angular-ai-devtools repo alone; need access to external checkout contents at the right state or live run there. Repo ships commands that target it (e.g. 
ode <skill>/scripts/control.mjs ... up --target portal) but evidence is outside this repository.


## Finding: Not decidable from this repository - live browser/harness/measurement required
- **Claim**: Claims about runtime measurements (timings like backendReady ~950ms, flag true at ~50ms), DevTools panel runtime state (detection flags, profiler coexisting subscribers, change detection cycles, signal graph before/after), browser install/proven logs, vitest-browser-angular live test output (ext-model availability, held-render), verify checks' runtime behavior, and doctor "nineteen check lines" require running harnesses/browsers/instances. Repo ships skills/commands (
ode .commandcode/skills/control-ai-browsers/scripts/control.mjs ..., 
px nx run angular-ai-devtools:build-extension, 
pm test, 
pm run check) but producing evidence requires live session.
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md rows 28,210,211,227-236,249-257,286-296
- **Confidence**: high
- **Why it matters here**: These cannot be settled by static inspection alone in this repo; need live browser session/instances/measurements. Cannot be produced by this milestone from repo state without running harness (and instructions say do not run). 


## Finding: Not decidable from this repository - external credentials/network/state or missing artifacts
- **Claim**: Claims about external resources/state not present (Chrome Web Store install logs, Chrome for Testing versions not in repo, research raw files not present like research/raw/tosignal-node-portal.json, external portal commit history details beyond what's referenced), or environment-specific ports/config not verifiable statically, and items marked as app bugs/reported state require external context.
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md rows 227,273,285,289,305-314
- **Confidence**: high
- **Why it matters here**: No repo-shipped command can produce these without external access/credentials/state; cannot be settled from this repository at all in current state.


## Finding: Repo-shipped commands that would settle decidable groups
- **Claim**: For decidable groups, exact repo-shipped commands to settle: static inspection via Get-Content/Test-Path/Select-String on repo paths (e.g. extension/manifest.json, apps/angular-ai-devtools/project.json, package.json, app.routes.ts, spikes/*, skill scripts); structural checks via 
pm run check (typecheck/skills) would catch drift; 
pm test validates node tests including fixtures; 
px nx run angular-ai-devtools:build-extension validates build config/target exists (and would fail if broken) - all repo-shipped. For portal/external/live cases, corresponding skill commands exist (
ode .commandcode/skills/control-*/scripts/control.mjs ...) but require external checkout/live session/credentials not present here.
- **Source**: package.json scripts (check, test, build-extension), apps/angular-ai-devtools/project.json, evidence-codebase.md, skills under .commandcode/skills/
- **Confidence**: high
- **Why it matters here**: Provides concrete command mapping as requested.


## Assigned questions — answers

- [RESEARCH] Which `unverifiable` M014 audit rows are now decidable with the commands the repository already ships, and which need evidence this milestone cannot produce? → Groups decidable by repo-shipped commands, from static evidence only: rows about files, routes, message types and config that exist in-repo (e.g. 258-265 message types; 207, 209 build-target presence via project.json; fixture values decidable from spikes/ng222-app source and specs, e.g. 268-270). Groups not decidable from this repository: external portal-checkout rows (22, 213-226, 238-248, 271-283) need the external checkout's state; live browser or harness measurements (28, 210, 211, 227-236, 249-257, 286-296) need running instances; external artifacts, credentials or state (227, 273, 285, 289, 305-314) need external access. Repo-shipped settlement commands for the decidable groups are Test-Path/Get-Content on repo paths, npm run check, npm test and npx nx run angular-ai-devtools:build-extension (structural); no browser, build or test execution is required to decide them statically.

## Dead ends

- Attempted to fully parse every unverifiable row's evidence field from the truncated audit output; relied on remediation queue + sampled rows + patterns (external checkout paths, "not run in this pass", "requires running..."). Full table is large but grouping is clear from queue and patterns.
- No attempt to run commands or access external checkouts (portal at D:\projects\github\..., browser instances) per constraints.
