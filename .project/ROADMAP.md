# Roadmap — Angular AI DevTools

<!-- Written and owned by /gsd-path-roadmap. Rolling-wave: milestone-granularity
     scope for EVERY milestone; waves and tasks are planned only for the active
     milestone. Never edit a shipped entry except its Status, Archive, and
     Integrated fields; never edit an abandoned entry at all. Lives at .project/
     top
     level and persists across milestones; it never archives. -->

## Milestones

### M001 — run-unrun-spikes

Goal: Run the unrun measurement backlog (S4, S14-S23, E1-E13, TS1-TS12) once against the configured per-model browser instances and produce committed, timestamped evidence plus a dated research-note delta.
Depends on: []
Surfaces: command-line spike runs, research notes, filing ledger
Status: shipped
Archive: .project/archive/001-run-unrun-spikes
Integrated: null

Scope: in
- Run all currently unrun spikes listed in research/05-spikes.md, grouped into waves by the plan.
- Capture timestamped raw evidence per spike using the existing per-model control scripts.
- Record S16's companion-package Meta-class lookup verdict with evidence.
- Update research/*.md notes and docs/filing-ledger.md from pending to measured for completed spikes.
- Record blocked spikes with exact preconditions.
- Record the doc-vs-code rulings from the audit alignment pass for downstream handling.

Scope: out
- Extend or build the MV3 devtools extension source.
- Name, version, or scaffold the companion package.
- Add a root package.json, tsconfig, README, or AGENTS.md as steady-state change.
- Drive Lars's daily browsers or brand-new profiles without explicit approval.
- Rewrite or delete existing research/raw/*.json evidence.

Success criteria
1. Each unrun spike named in research/05-spikes.md runs once and leaves a committed, timestamped evidence artifact under research/raw/ (or the documented spike output path) plus a note in its matching research file, marking prior pending status updated.
2. S16's companion-package Meta-class lookup records exactly one of works / works-with-degradation / fails, with the measured evidence reference.
3. docs/filing-ledger.md and the relevant research/*.md notes are updated from pending/unrun to measured for every completed spike, and rerunning an update does not duplicate rows.
4. Any spike that cannot run is recorded as blocked with the exact precondition, not silently skipped or counted complete.

Risks
- 35 unrun spikes in one milestone; some may require model downloads or branded-browser sessions that may be unavailable or need Lars's approval.
- S16's verdict can gate the entire companion-package plan; an ambiguous result leaves it ungrounded.
- Per-model browsers share machines/resources; switching backends mid-wave risks residue and invalid measurements.

Open questions
- [RESEARCH] What is Angular 22.2's actual lookup path for a Meta-class/exported provider, and what exactly does S16 need to call?
- [RESEARCH] Exact run order, instance requirements, and per-spike duration.
- [NEEDS-USER] Which of S4, E1-E13, and S14-S23 can run in automated mode vs. need manual model download/branded browser from Lars?

### M002 — sidecar-hardening

Goal: Harden the GSD Path verify-sidecar workflow by documenting the dependency-bridge procedure, making sidecar retirement recover from leftovers, and keeping the baseline green.
Depends on: []
Surfaces: none
Status: shipped
Archive: .project/archive/002-sidecar-hardening
Integrated: null

Scope: in
- Add a documented dependency-bridge procedure to AGENTS.md (junction command + cleanup).
- Verify and document that isolation.py retire --force clears stale sidecars.
- Re-run npm run check and npm test to confirm baseline green.

Scope: out
- No changes to control/verify skills or their byte-copied helpers.
- No browser automation or new product features.
- No changes to GSD Path helper scripts beyond verification.

Success criteria
1. AGENTS.md documents a repeatable, one-command dependency-bridge procedure for verify sidecars, including cleanup, and npm run check succeeds in a fresh sidecar after bridging.
2. isolation.py retire removes a leftover/dirty sidecar without manual filesystem cleanup, verified by running it against a stale sidecar and confirming the worktree and branch are gone.
3. Baseline remains green: npm run check exits 0 and npm test passes (296 tests) after all changes.

Risks
- Bridge procedure may differ across Windows junction semantics; document Windows-specific commands.
- Stale sidecar cleanup could delete unintended directories if path is wrong; require exact path from isolation.py output.

Open questions
- [RESEARCH] Whether a helper script should automate the bridge; deferred to a future milestone if needed.

### M003 — sidecar-dependency-bridge

Goal: Remove the manual dependency bridge for verify sidecars so every control and verify skill's documented checks run in a freshly created sidecar with zero manual steps, and relocate git-ignored .browsers/ and tmp/ runtime artifacts under .commandcode/worktrees/ with auto-migration.
Depends on: []
Surfaces: none
Status: shipped
Archive: .project/archive/003-sidecar-dependency-bridge
Integrated: null

Scope: in
- Modify isolation.py (or the verify-sidecar creation path) to bridge dependencies automatically.
- Update AGENTS.md and skill docs to reflect the automatic bridge and the new artifact location.
- Relocate .browsers/ and tmp/ references to the new location and migrate existing artifacts.
- Keep the manual junction procedure working for backward compatibility.

Scope: out
- No auto-running npm install in sidecars.
- No deletion of the primary node_modules.
- No changes to Angular runtime or spike fixtures.

Success criteria
1. A freshly created verify sidecar runs npm run check with no manual dependency bridge and exits 0.
2. A freshly created verify sidecar runs npm test with no manual dependency bridge and exits 0 (296/296 tests pass).
3. Every control skill's documented check command runs in its verify sidecar without manual dependency bridging.
4. .browsers/ and tmp/ runtime artifacts are relocated under .commandcode/worktrees/ (or an equivalent git-ignored path) and all references are updated.
5. Existing behavior is preserved: npm run check and the full test suite still pass on the primary worktree.

Risks
- Relocating .browsers/ may break skills that hardcode the root path; need a grep sweep.
- Automatic bridging must not leave dangling junctions after retire.
- Windows junction semantics differ from POSIX symlinks; cross-platform handling needed.

Open questions
- [RESEARCH] Should the dependency bridge use a junction (Windows) / symlink (POSIX), or npm workspaces hoisting?
- [RESEARCH] Which exact control-skill check commands exist and where are they documented?
- [NEEDS-USER] Confirm the final location for relocated artifacts (.commandcode/worktrees/ vs. a dedicated .runtime/).

### M004 — nx-angular-workspace

Goal: Build feature N1, "Why did this update?" change-detection causality, in the existing Nx Angular workspace and MV3 extension, producing a per-component trigger chain and on-device LLM explanation in the DevTools panel.
Depends on: []
Surfaces: DevTools panel
Status: shipped
Archive: .project/archive/004-nx-angular-workspace
Integrated: null

Scope: in
- MAIN-world recorder via ng.ɵsetProfiler + signal-graph walk producing per-component trigger chain.
- Panel UI: component picker + chain display + explain button + answer.
- Panel-local Prompt API call (no tool calling).
- Removal of dead prompt bridge, content.js, page-script.js, nx-welcome.ts.
- Unit tests for chain walk on recorded data; browser test on spikes/ng222-app.

Scope: out
- No Prompt API in page, content scripts or service worker (panel or a Worker the panel starts only).
- No worker in this milestone.
- No download flow for downloadable models (deferred).
- No content.js revival; delete only.
- Do not break existing panel features (Angular version explain, extension messaging, tab filtering).

Success criteria
1. The MAIN-world script records change-detection cycles via ng.ɵsetProfiler and computes the per-component trigger chain deterministically.
2. The DevTools panel lists the components the recorded cycles checked; the user picks one, and the panel shows the chain of the last cycle that checked it.
3. The panel asks the panel-local Prompt API to explain the chain and shows the answer; the prompt carries only a short fact list (no tool calling).
4. On spikes/ng222-app: a click that writes count gives the chain click -> count -> double -> app-counter template; a component checked with no signal change is reported as "no signal cause".
5. The panel answers in all four browsers (Chrome 156 Gemini Nano, Chrome Beta 157 Gemini Nano, Edge 155 Phi-4-mini, Edge Dev 157 Aion-1.1), plus chrome-beta-gemma4 as a fifth.
6. The dead prompt bridge, content.js, page-script.js and nx-welcome.ts are removed with no file, manifest entry or import referencing them, and npm run check, npm test, build-extension and the extension-panel check pass.

Risks
- Exact shape of the ng.ɵsetProfiler callback and which profiler events identify a component check.
- How to map a profiled component to its node in the signal graph for the trigger walk.
- Availability/downloadability behavior of LanguageModel across the four supported browsers with and without feature flags.
- Model may produce unusable output on smaller models (Gemini Nano); prompt must stay a short fact list.

Open questions
- [RESEARCH] Exact shape of the ng.ɵsetProfiler callback and which profiler events identify a component check.
- [RESEARCH] How to map a profiled component to its node in the signal graph for the trigger walk.
- [NEEDS-USER] Confirm final wording of the "no signal cause" chain in the panel.

### M005 — signal-provenance

Goal: Build feature N2, "Signal provenance and reactive anti-pattern finder", tracing reactive provenance through the signal graph and flagging reactive anti-patterns in the DevTools panel.
Depends on: []
Surfaces: DevTools panel
Status: shipped
Archive: .project/archive/005-signal-provenance
Integrated: null

Scope: in
- MAIN-world provenance tracer via ng.ɵgetSignalGraph producing per-signal/component dependency chain.
- Anti-pattern detector operating on the signal graph (at least 3 patterns).
- Panel UI: signal/component picker + provenance chain display + anti-pattern list + explain button + answer.
- Panel-local Prompt API call (no tool calling).
- Unit tests for provenance tracing on recorded graph data; browser test on spikes/ng222-app.

Scope: out
- No Prompt API in page, content scripts or service worker (panel only).
- No worker in this milestone.
- No download flow for downloadable models (deferred).
- Do not break existing panel features (N1, version explain, extension messaging, tab filtering).
- No new Tier 2 (app opt-in) features; N9 WebMCP stretch deferred.

Success criteria
1. The MAIN-world script traces the reactive provenance of a selected signal or component through ng.ɵgetSignalGraph, computing the dependency chain (producers -> consumers) deterministically.
2. The panel displays the provenance chain for a user-selected signal or component, showing each node's kind, label, and edge direction.
3. The panel detects at least three reactive anti-patterns and reports them with evidence (node labels and graph positions).
4. The panel asks the panel-local Prompt API to explain the provenance chain and detected anti-patterns, sending only a short fact list (no tool calling).
5. Unit tests for provenance tracing on recorded graph data; browser test on spikes/ng222-app.
6. npm run check, npm test, npx nx run angular-ai-devtools:build-extension pass.

Risks
- Exact shape of ng.ɵgetSignalGraph output and how to map nodes to components.
- Which anti-patterns are detectable from the signal graph alone.
- Availability/downloadability behavior of LanguageModel across supported browsers.
- Model may produce unusable output on smaller models (Gemini Nano); prompt must stay a short fact list.

Open questions
- [RESEARCH] Which reactive anti-patterns are detectable from the signal graph alone and how to classify them.
- [RESEARCH] How to map signal graph nodes to components for the provenance chain.
- [NEEDS-USER] Confirm final set of anti-patterns to detect.

### M006 — signal-provenance-regression-gate

Goal: Ship the second signal-provenance milestone, delivering the provenance tracer, chain traversal, anti-pattern detector, panel UI, browser test, and regression gate as independently shippable work.
Depends on: []
Surfaces: DevTools panel
Status: shipped
Archive: .project/archive/006-signal-provenance
Integrated: null

Scope: in
- MAIN-world provenance tracer via ng.ɵgetSignalGraph producing per-signal/component dependency chain.
- Anti-pattern detector operating on the signal graph.
- Panel UI: signal/component picker + provenance chain display + anti-pattern list + explain button + answer.
- Panel-local Prompt API call (no tool calling).
- Unit tests for provenance tracing on recorded graph data; browser test on spikes/ng222-app.
- Regression gate for npm run check, npm test, and build-extension.

Scope: out
- No Prompt API in page, content scripts or service worker (panel only).
- No worker in this milestone.
- No download flow for downloadable models (deferred).
- Do not break existing panel features (N1, version explain, extension messaging, tab filtering).
- No new Tier 2 (app opt-in) features.

Success criteria
1. The MAIN-world script traces the reactive provenance of a selected signal or component through ng.ɵgetSignalGraph, computing the dependency chain (producers -> consumers) deterministically.
2. The panel displays the provenance chain for a user-selected signal or component, showing each node's kind, label, and edge direction.
3. The panel detects at least three reactive anti-patterns and reports them with evidence (node labels and graph positions).
4. The panel asks the panel-local Prompt API to explain the provenance chain and detected anti-patterns, sending only a short fact list (no tool calling).
5. Unit tests for provenance tracing on recorded graph data; browser test on spikes/ng222-app.
6. npm run check, npm test, npx nx run angular-ai-devtools:build-extension pass.

Risks
- Exact shape of ng.ɵgetSignalGraph output and how to map nodes to components.
- Which anti-patterns are detectable from the signal graph alone.
- Availability/downloadability behavior of LanguageModel across supported browsers.
- Model may produce unusable output on smaller models (Gemini Nano); prompt must stay a short fact list.

Open questions
- None

### M007 — n3-di-doctor

Goal: Build feature N3, "DI doctor", tracing dependency-injection resolution paths with ng.ɵgetInjector* tools, diffing two paths, and asking the panel-local on-device model to explain.
Depends on: []
Surfaces: DevTools panel
Status: shipped
Archive: .project/archive/007-n3-di-doctor
Integrated: null

Scope: in
- MAIN-world DI path tracer via ng.ɵgetInjector* producing resolution paths with injector boundaries and provider records.
- DI lookup for a specific token on a path.
- Path diff comparison for two components (first divergence point).
- Panel UI: component picker + path display + diff view + explain button + model answer.
- Panel-local Prompt API call (no tool calling in the core loop).
- Unit tests for DI path computation on recorded data; browser test on spikes/ng222-app.

Scope: out
- No Prompt API in page, content scripts or service worker (panel only).
- No worker in this milestone.
- No download flow for downloadable models (deferred).
- Do not break existing panel features (N1, N2, version explain, extension messaging, tab filtering).
- No new Tier 2 (app opt-in) features.
- Does not support injection flags (@Self/@SkipSelf/@Host/@Optional) or viewProviders visibility.
- Does not support providedIn: 'any' tokens.

Success criteria
1. The MAIN-world script computes DI resolution paths for selected components via ng.ɵgetInjector* APIs, recording each injector boundary and provider record.
2. The panel displays the resolution path for a selected component, showing injector boundaries and the provider record for the queried token.
3. The panel compares two components' resolution paths and shows where they diverge (the first injector holding a different provider for the token).
4. The panel asks the panel-local Prompt API to explain the resolution path or the divergence, sending only a short fact list (no tool calling in the core loop).
5. Unit tests for DI path computation on recorded data; browser test on spikes/ng222-app.
6. npm run check, npm test, npx nx run angular-ai-devtools:build-extension pass with no regressions to N1 or N2.

Risks
- Exact shape of ng.ɵgetInjector* APIs and how to map injectors to provider records.
- Which DI questions are answerable from the tools alone vs. needing additional page-agent data.
- Injection flags and viewProviders visibility not supported.
- Model may produce unusable output on smaller models (Gemini Nano); prompt must stay a short fact list.

Open questions
- [RESEARCH] Exact shape of ng.ɵgetInjector* APIs and what data they return per injector.
- [RESEARCH] Which DI questions are answerable from the tools alone vs. needing additional page-agent data.
- [NEEDS-USER] Confirm final set of DI questions to support (path trace, two-component diff, token lookup, NullInjectorError recovery).

### M008 — tooling

Goal: Move all nine install-* scripts and their tests to ~/.commandcode/scripts/, update package.json, tsconfig.json and AGENTS.md references, and extend the installer's guarded adaptation to add the beam, glyph, laguna and glm review-panel families.
Depends on: []
Surfaces: none
Status: shipped
Archive: .project/archive/008-tooling
Integrated: 2bd0eef5fb84181ff72dfbcefbbb4b96b882c81c

Scope: in
- Move all nine install-*-command-code.mjs scripts plus their tests to ~/.commandcode/scripts/.
- Run tests via a dedicated npm script glob over ~/.commandcode/scripts/**/*.test.mjs.
- Replace the tsconfig.json include with the moved pstack installer paths under ~/.commandcode/scripts/ plus scripts/opencode-pstack-plugin.ts retained in-repo.
- Update package.json test glob and AGENTS.md references (sidecar bridge, skill mirror).
- Keep scripts/opencode-pstack-plugin.ts as the cross-import target.
- Add the guarded review-panel family patch (beam, glyph, laguna, glm) to the moved installer copy.

Scope: out
- No product feature changes; no extension source changes.
- Vetoed scope remains out: no code generation, no NgModule/Zone.js support, no Firefox/Safari.

Success criteria
1. npm run check passes.
2. npm test passes.
3. The skills-mirror parity test passes.
4. The moved tests run from ~/.commandcode/scripts/.
5. review_panel.py resolves the beam, glyph, laguna and glm families.

Risks
- tsconfig include replacement leaves stale scripts/ references if incomplete.
- The guarded family patch must land in the moved installer copy before detected/named panels can express this host's routes.
- Cross-import target scripts/opencode-pstack-plugin.ts must remain in-repo.

Open questions
- None

### M009 — consolidation-hardening

Goal: Harden and stabilize everything shipped in M001-M007: fix defects, remove dead code, strengthen tests and assertions, steady error paths and model-dependent behavior, and retire unused spike trees once their evidence is archived, without adding features or redesigning.

Depends on: []
Surfaces: DevTools panel
Status: shipped
Archive: .project/archive/009-consolidation-hardening
Integrated: 7354c107aa977ca68de24b959e714efba8238e26

Scope: in
- Defect review and fixes across the extension contexts, panel components, MAIN-world tracers, prompt/fact-list plumbing and their tests.
- Dead code removal and assertion strengthening; no skipped or vacuous tests.
- Stabilization of error paths and model-dependent behavior across the four supported model pairs.
- Review of the M002/M003 tooling and installer drift.
- Retirement of unused spike trees once their evidence is archived.
- Doc alignment for changed behavior.
- Author one `lars-review` specification per shipped milestone M001-M007: a frozen base..head range, file scope, focus areas, and acceptance.
- Run multiple `lars-review` rounds against those specifications and resolve every verified blocking finding inside this milestone, repeating the panel on the changed range after fixes.

Scope: out
- No new features and no redesign.
- No changes to the supported-app contract or the panel security model.
- No Tier 2 opt-in features.
- No code generation.

Success criteria
1. Every defect found by the hardening review is fixed or explicitly accepted with a written reason.
2. npm run check and npm test pass with no skipped tests, and the skills-mirror parity test passes.
3. The N1, N2 and N3 flows still answer in the DevTools panel on all four supported model pairs, each with a lars-verify verdict of verified.
4. Where meaningful, the same claims are also verified on the insurance-portal fixture, and the claim records that external dependency.
5. Unused spike trees are retired only after their evidence is archived, with no in-repo reference left broken.
6. No new feature and no public behavior change is introduced.
7. Each of M001-M007 has a `lars-review` specification with a frozen range, file scope, focus areas, and acceptance.
8. Multiple `lars-review` rounds ran over those specifications; every verified blocking finding is fixed or explicitly deferred with a written reason, and the checks pass after the fixes.

Risks
- The shipped code was orchestrated by the less reliable Poolside Laguna S 2.1 model, so latent defects and inconsistent patterns are expected.
- Shared MAIN-world and panel plumbing means a fix can regress N1, N2 or N3.
- Test coverage may be thinner than a green suite suggests.
- Per-milestone ranges depend on ship and merge SHAs recorded in the archives and git history; a range can be ambiguous or overlap a later fix.
- `lars-review` is read-only and requires a clean product worktree, so fixes and their re-review must be sequenced, not interleaved.

Open questions
- None

### M010 — n4-error-explainer

Goal: Build the Angular error explainer (N4): capture NG0xxx and uncaught console errors, map them to the owning component, and explain them from a bundled offline digest in the DevTools panel.
Depends on: []
Surfaces: DevTools panel
Status: shipped
Archive: .project/archive/010-n4-error-explainer
Integrated: 2556ed86b8c3bb62e0a23a26953dd7b709878adf

Scope: in
- Page-agent hooks at document_start for console.error, window.onerror and unhandledrejection.
- Ring buffer for captured errors.
- Owning-component mapping via ng.getOwningComponent.
- Build-time generation of the offline angular.dev/errors digest, trimmed to one entry per code capped at 150 tokens.
- Stripping of the MIT license and Google LLC copyright notice from every entry before any text reaches the Prompt API or another built-in AI API.
- Panel UI rendering the captured error, owning component, and model explanation.

Scope: out
- No code generation of app code; findings may name a modern Angular pattern and an official schematic only.
- No page or user data beyond the shaped fact list in prompts.
- No model-download flow for downloadable models.
- No usage of angular:di_graph or getViewContainerRef() on component hosts.

Success criteria
1. The panel captures an NG0xxx error on spikes/ng222-app and shows its owning component.
2. The offline error digest is generated at extension build time with one entry per code capped at 150 tokens.
3. The license and copyright notice is stripped before any digest text reaches the Prompt API.
4. The panel explains a captured error using the panel-local Prompt API, sending only a short fact list.
5. lars-verify verdict of verified for the error explainer claim, with end-to-end coverage across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.
6. Where meaningful, the error explanation is also verified on the insurance-portal fixture, and the claim records that external dependency.

Risks
- Digest source is large (61 pages, 95,095 bytes) and must track the 22.2.x branch; build-time generation must stay reproducible.
- Owning-component mapping depends on Tier 0 ng.getOwningComponent being available in dev mode.
- Error capture and mapping run through the shared MAIN-world page agent.

Open questions
- None

### M011 — n24-stale-view-finder

Goal: Build the zoneless stale-view finder (N24): detect a plain field written outside change detection that leaves the template showing a stale value, and name the modern Angular pattern, in the DevTools panel.
Depends on: []
Surfaces: DevTools panel
Status: shipped
Archive: .project/archive/011-n24-stale-view-finder
Integrated: 9206a64468d9434f5691d3dcb670d083c894a6ff

Scope: in
- Detection of direct this.field = (or .set/.update) inside a subscribe callback on a non-signal plain field, found via the template node's debuggableFn source scan.
- Gating on Angular 22.1.3+.
- Per-page scan running in a worker.
- Finding worded "the template may show a stale value".
- Panel UI rendering the finding and model explanation.
- A static portal relevance map for N24 naming the insurance-portal routes and components that produce its facts; the portal gains no features, so the map does not chase new ones.
- One `verify-ai-browsers` portal check driven by that map, and a `lars-verify` verdict from it, written per the lars-create-verification, lars-maintain-verification and lars-verify contracts.
- `control-angular-dev-app up --target portal --with-ai-devtools`, which adds a dev-only provider file and the dev build configuration that loads it, so the portal runs the extension and panel without a source change.
- A test that fails when a portal-relevant feature has no portal check, or when a check names a portal route that does not resolve.

Scope: out
- Generalization beyond direct this.field = in subscribe (helper methods, other objects, minified code).
- Checking whether the template actually reads the field.
- No code generation of app code; findings may name a modern Angular pattern and an official schematic only.
- No page or user data beyond the shaped fact list in prompts.
- Any insurance-portal source change beyond the dev-only provider file and the dev build configuration that loads it.

Success criteria
1. On spikes/ng222-app, a plain field written in a subscribe callback is flagged with "the template may show a stale value" in the DevTools panel.
2. The finding is produced from ng.ɵgetSignalGraph plus the debuggableFn source scan without new page-side instrumentation.
3. The per-page scan runs in a worker.
4. The panel explains the finding using the panel-local Prompt API, sending only a short fact list.
5. lars-verify verdict of verified for the stale-view claim, with end-to-end coverage across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.
6. The portal relevance map names N24's portal routes and components, and the portal check drives that route with the extension and panel active to a lars-verify verdict of verified over two runs.
7. The coverage test fails when a portal-relevant feature lacks a portal check, and the insurance-portal diff contains no file other than the dev-only provider and its dev build configuration.

Risks
- The source-text scan is a heuristic and can miss writes through helper methods, other objects, or minified code.
- Whether the template actually reads the field is unchecked, hence the "may show a stale value" wording.
- N24 shares the MAIN-world page agent and source scan with N2 and N25.

Open questions
- [RESEARCH] Which N24 detections beyond the measured direct this.field = in subscribe case need new instrumentation?

### M012 — n25-rxjs-interop-explainer

Goal: Build the RxJS interop explainer (N25): identify the interop call behind a toSignal source and the effects the signal graph cannot label, slice their direct producers/consumers, and explain the chain, stating that it cannot name the feeding Observable, the operator chain, or emission timing.
Depends on: []
Surfaces: DevTools panel
Status: shipped
Archive: .project/archive/012-n25-rxjs-interop-explainer
Integrated: null

Scope: in
- Identification of toSignal.source / toSignal.state nodes and the unlabelled effect whose debuggableFn contains subject.error.
- Slicing direct producers/consumers from ng.ɵgetSignalGraph.
- Explicit keep-list keyed on label (toSignal.source, toSignal.state) and on debuggableFn source containing subject.error, on top of the existing library-internal filter.
- Field-to-node attribution by value comparison, shipped as "inferred, untested" wording.
- Panel UI rendering the interop node slice and model explanation.

Scope: out
- Naming the feeding Observable, the operator chain, or emission timing; no edge crosses the Observable, an intrinsic limit of ng.ɵgetSignalGraph.
- Confident claims about field-to-node attribution; wording stays "inferred, untested".
- No Tier 2 (app opt-in) re-export of RxJS internals.
- No code generation of app code.

Success criteria
1. On the portal fixture, the panel identifies a toSignal source/state node and an unlabelled effect whose debuggableFn contains subject.error, and slices their direct producers/consumers.
2. The panel states that it cannot name the feeding Observable, the operator chain, or emission timing.
3. Field-to-node attribution is worded "inferred, untested".
4. The interop keep-list keeps toSignal.* nodes on top of the existing library-internal filter.
5. The panel explains the slice using the panel-local Prompt API, sending only a short fact list.
6. lars-verify verdict of verified for the interop claim, with end-to-end coverage across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.

Risks
- Field-to-node attribution by value comparison is inferred and untested.
- The interop keep-list classifier is unspecified until measured (label vs debuggableFn source).
- N25 shares the MAIN-world page agent and source scan with N2 and N24.

Open questions
- [RESEARCH] Whether the interop keep-list classifier can be recognised by label or debuggableFn source.
- [RESEARCH] Which N25 detections beyond the measured cases need new instrumentation?

### M013 — docs-audit-closure

Goal: Make the docs audit show no stale or aspirational claim about a shipped feature, and leave no remediation-queue row classified NEEDS-USER without a recorded ruling.
Depends on: []
Surfaces: none
Status: pending
Archive: null
Integrated: null

Scope: in
- Regenerate the docs audit over every document the frozen inventory covers.
- Fix or retire every claim the audit marks stale or aspirational, in the document that makes it.
- Re-derive a verdict for each unverifiable row whose claim a shipped command can actually test, and state why the rest cannot be tested.
- Keep the two skills trees byte-identical and the project Verify green.

Scope: out
- New product features, new panel surfaces, or new checks whose only purpose is to make a document pass.
- Changing shipped behaviour so that a document becomes true.
- Rewriting a document whose claims are already verified.
- Touching archived audits or archived milestone records.

Success criteria
1. The regenerated audit records zero stale and zero aspirational claims.
2. Every stale or aspirational claim the audit finds is corrected in its document, or the document is retired under the recorded retirement ruling, with the path named in the task that did it.
3. The remediation queue has no NEEDS-USER row without a recorded ruling.
4. The project Verify (`npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`) passes at the shipped head and the skills mirror test is green.

Risks
- 182 unverifiable rows may contain claims that are testable with shipped commands; triage can grow the milestone.
- A document may describe behaviour the code no longer has, so a correction can look like a product change; the milestone's scope forbids that, and the ruling decides correction versus retirement.
- A full re-audit over ~141 documents is the heaviest part and needs chunked audit workers.

Open questions
- [RESEARCH] Which unverifiable rows are testable with the commands the repository already ships, and which need evidence this milestone cannot produce?
- [NEEDS-USER] When a document describes a feature that no longer exists, may the milestone retire the document, or must it be corrected to describe what replaced it?
