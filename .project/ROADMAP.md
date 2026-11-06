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
Integrated: cf637a6ffbb28f30863e2782fd69d1c031536dc9

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
Status: shipped
Archive: .project/archive/013-docs-audit-closure
Integrated: fc97c8aca5f99520daf21da100ea537131b5319a

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

### M014 — interop-proof

Goal: Prove the RxJS interop claim end to end on this repository's own dev-only fixture, and close the interop verification debt M012 left open.
Depends on: [M012, M013]
Surfaces: DevTools panel
Status: shipped
Archive: .project/archive/014-interop-proof
Integrated: bf9251578ec0c9c8954022521a7cbe16d06df20a

Scope: in
- Run `verify-ai-browsers/checks/interop.mjs` against at least one live instance and commit its evidence.
- Use `spikes/ng222-app`'s `stale-view` route as the recorded source of both halves of the claim, replacing the external portal.
- Re-record `control-ai-browsers/features/.proven.json` for the interop feature and keep the feature map true to `interop.component.ts`.
- Keep the two skills trees byte-identical and the project Verify green.

Scope: out
- New panel tabs, a second explainer, or any change to the interop component's behaviour to make a check pass.
- Portal source changes beyond the dev-only provider file the charter allows.
- Touching archived audits or archived milestone records.

Success criteria
1. `verify-ai-browsers/checks/interop.mjs` exits 0 on a named instance, proving a sliced node set with at least one node, the three stated limits, the "inferred, untested" attribution and a non-empty answer, and its evidence file is committed.
2. The claim's recorded source is `spikes/ng222-app`'s `stale-view` fixture, named in the milestone intent, and every note that says the portal is required is corrected.
3. `features/.proven.json` records the interop feature as proven at the shipped head, and the fingerprint check reports it fresh.
4. The project Verify (`npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`) passes at the shipped head and the skills mirror test is green.

Risks
- A missing or wedged on-device model pair turns the proof into environment work; the pin and the recovery recipe are in `references/edge-dev-aion-model.md`.
- `/stale-view` may fire its error effect before the panel attaches, so no slice is ever captured; that needs a settle mechanic or a second fixture, not a new feature.
- Re-proving re-records `.proven.json`, and a stale fingerprint then reads like a failure.

Open questions
- [RESEARCH] Which instance, and which panel route, produce a sliced node set from `/stale-view`, and what does the panel report when the effect has already run before the panel attaches?

### M015 — program-closeout

Goal: Close the verification, documentation and test-precision debt the first release left open, so every shipped claim, document and check agrees at M014's shipped head and no deferred alignment row remains.
Depends on: [M014]
Surfaces: DevTools panel
Status: shipped
Archive: .project/archive/015-program-closeout
Integrated: null

Scope: in
- Discharge the four M014-deferred `fix-doc` rows (research/10 grader regex and port list, research/11 S1 runner, spikes/ng222-ssr README Vitest) so no released note states a retired fact.
- Keep the `verify-ai-browsers` map row for `interop` true to the in-repo `/stale-view-deferred` fixture and re-record its provenance at the milestone head.
- Tighten `spikes/ng222-app/src/app/app.routes.test.mjs` so the `/stale-view` assertion cannot match the deferred route.
- Decide and record the panel bundle budget (518.80 kB against a 500 kB budget) so `build-extension` emits no unexplained warning.
- Regenerate the docs audit at the new head and drive the alignment queue to zero.
- Keep the two skills trees byte-identical and the project Verify green.

Scope: out
- New panel features, new tabs, or any behaviour change to a shipped explainer.
- Portal source changes beyond the dev-only provider file the charter allows.
- Touching archived audits or archived milestone records.
- Loosening a check or a test so it passes.

Success criteria
1. A regenerated docs audit at the milestone head records zero `stale` and zero `aspirational` claims, and no M014 `fix-doc` row is left `planned: no`.
2. `verify-ai-browsers`' `interop` row names `spikes/ng222-app`'s `/stale-view-deferred` fixture, its fingerprint reads fresh at the milestone head, and `checks/interop.mjs` still exits 0 on a named instance with the committed lars-verify verdict of `verified`.
3. `spikes/ng222-app/src/app/app.routes.test.mjs` fails when the `/stale-view` assertion is given the deferred route's name, and passes as written.
4. `npx nx run angular-ai-devtools:build-extension` emits no bundle-budget warning, or the accepted overage is recorded with its measured size and reason.
5. The project Verify (`npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`) passes at the shipped head and the skills mirror test is green.

Risks
- A doc correction can look like a product change; the audit's own claim check decides which side is wrong.
- The bundle budget lives in `apps/angular-ai-devtools/project.json`, a build configuration with its own doc coverage.
- Re-recording provenance before the final doc edit leaves the entry stale at the shipped head.
- The M014 audit marked many claims `unverifiable`; re-deriving them can grow this milestone beyond closeout.

Open questions
- [RESEARCH] Which `unverifiable` M014 audit rows are now decidable with the commands the repository already ships, and which need evidence this milestone cannot produce?

### M016 — orchestration-autonomy

Goal: Make a GSD Path milestone completable end to end with no human in the loop from one
`/gsd-path` invocation, by pinning the mechanical stops this repository's free-model orchestrator
actually hit, so a later session cannot lose the same days to them.
Depends on: [M015]
Surfaces: none
Status: shipped
Archive: .project/archive/016-orchestration-autonomy
Integrated: b93fef506351f176fa78695cd04d9fce555dd6e0

Scope: in
- A conformance suite inside this repository that reads the installed user-scope tooling and fails
  when the autonomy rules regress: milestone-scoped pre-approval, `handoff` creating its own branch
  at the remote default, the chunk brief's incremental-write and byte-proof rules, the fragment
  repair command, and the free-route quota signature.
- A test entry point the project Verify runs, so the conformance suite is part of `npm test` rather
  than a document someone must remember to read.

Scope: out
- Product behaviour, panel features, or any shipped explainer.
- Editing `.project/archive/**`.
- Weakening a gate, check or test to make the suite pass.

Success criteria
1. `npm test` runs a conformance suite that fails when the installed `~/.commandcode/scripts/gsd`
   suite is red, or when any of these is absent from the user-scope rules: the milestone-scoped
   pre-approval boundary, the `handoff` branch-creation rule, the free-route zero-token quota
   signature, the incremental-write and byte-length-proof rules for a written artifact, and the
   fragment repair command.
2. The conformance suite names the exact file and rule it failed on, and passes against the
   tooling as installed at this head.
3. The project Verify (`npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`)
   passes at the shipped head and the skills mirror test stays green.

Risks
- The suite reads files outside the checkout, so a machine without the user-scope install must fail
  it loudly with the missing path rather than pass vacuously.
- A suite that asserts prose becomes a change-detector. Assert the presence of a named rule and the
  behaviour of a named helper, not a paragraph's wording.
- The user-scope scripts are an installed bundle, so an installer re-run could revert the fixes the
  suite protects; the suite must therefore test behaviour, not only text.

Open questions
- None

### M017 — verification-coverage

Goal: Turn M016's autonomy lessons into enforced, project-scope verification, so a future milestone
cannot dispatch on a broken helper, an unverifiable claim, or an exhausted route without a named
check failing first.
Depends on: [M016]
Surfaces: none
Status: shipped
Archive: .project/archive/017-verification-coverage
Integrated: null

Scope: in
- A project-scope check that fails when a user-scope `gsd` helper regresses on any defect M016 found:
  `brief-check`'s effort ladder for paid types, `plan-lint`'s `path::test_name` Held-out form,
  `check_handoffs`'s unreadable Intent-coverage row, and the serial-retry refusal that leaves a
  rejected attempt unparkable.
- Drive the docs-audit alignment queue to zero decidable rows: every `unverifiable` row that the
  repository's own shipped commands can settle is re-derived, and every remaining row names the
  check that would settle it.
- Keep the two skills trees byte-identical and the project Verify green.

Scope: out
- Product behaviour, panel features, or any shipped explainer.
- Editing `.project/archive/**`.
- Weakening a gate, check or test to make the check pass.

Success criteria
1. `npm test` runs a check that fails when the installed `gsd` helper regresses on paid-type brief
   effort, the `path::test_name` Held-out form, an unreadable Intent-coverage row, or the serial
   retry path, and it passes at the shipped head.
2. The docs audit at the milestone head carries no `unverifiable` row that the repository's shipped
   commands can decide, and every remaining row names the check that would settle it.
3. The project Verify (`npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`)
   passes at the shipped head and the skills mirror test stays green.

Risks
- The helper check reads files outside the checkout, so it inherits M016's absent-install rule: fail
  loudly with the path, never pass vacuously.
- Re-deriving audit rows can grow past the milestone; a row that needs evidence this milestone cannot
  produce is recorded with its settling check rather than guessed.
- The user-scope `gsd` suite is an installed bundle, so an installer re-run can revert the very
  behaviour the check protects; assert behaviour, not wording.

Open questions
- [RESEARCH] Which of the 111 `unverifiable` audit rows are decidable with the commands this
  repository already ships, and which need evidence this milestone cannot produce?
### M018 — instrument-core

Goal: Ship one tool registry that every explainer reads through — the declaration and backing records with their `kind`, `host`, `outcome` and `publish` fields — together with `app_facts`, the component and signal read wrappers, and the DOM role/name computation.
Depends on: [M017]
Surfaces: none
Status: shipped
Archive: .project/archive/018-instrument-core
Integrated: 3dfdcf03b0dd3f34a0097a5b1ffd4818d0b9ab29

Scope: in
- The registry envelope: a declaration record plus a backing record, carrying `kind` (read, write, confirm), `host` (page, iframe, panel, worker, extension-API, tester), `outcome` (result, confirm-required, async-handle, image, error) and `publish`.
- `app_facts`, and the support checks a later explainer reads to decide whether a capability exists before it offers it.
- The wrappers `find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata` and `getComponent`, each registered through the envelope and reachable only through it.
- The DOM role and accessible-name computation in the panel, so a later Aria explainer can name what it observed.
- Six hostile tools as registry conformance: one write with confirm, one async handle, one image result, one two-host read, one wrapped third-party tool and one page-state-dependent schema.
- Two further tools added in two separate commits without touching the envelope, as the registry's own regression proof.

Scope: out
- Any explainer, panel tab or chat flow; this milestone ships the registry and the read primitives only.
- Code generation of app code; a tool may report a fact and name a modern Angular pattern, never emit source.
- NgModule, `*ngIf`, `*ngFor`, decorator inputs or Zone.js assumptions in any capability check or declared schema.
- `@angular/animations`, Angular SSR and `angular/components`; all three are outside programme 1, so no declaration may name a host or schema that requires them.
- Any DOM added to an inspected page; the overlay arrives in M022 and is the only one there will ever be (AR-3).
- A worker boundary, a ring buffer or a chunked context budget; both are M019's plumbing.

Success criteria
1. Six hostile tools pass through the envelope: one write with confirm, one async handle, one image result, one two-host read, one wrapped third-party tool and one page-state-dependent schema.
2. Two tools are added in two separate commits without touching the envelope, proving the declaration record is the only extension point.
3. `app_facts`, `find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata` and `getComponent` are reachable through the registry, and no caller reaches around it.
4. The DOM role/name computation returns a role and an accessible name for a labelled control and for a control named only by its content.
5. `npm run check` type-checks the registry and the extension sources, and `npm test` passes at the head.

Risks
- The envelope is fixed here, so a wrong envelope is expensive everywhere: every later generation-1 explainer inherits it.
- The six hostile shapes are the only defence available at this point; a shape no hostile tool exercises is discovered by the first explainer that needs it.
- A page-state-dependent schema means a declaration can be right while its result is wrong; the registry must surface that difference rather than hide it behind an empty list.
- `getComponent` and `getDirectiveMetadata` are Tier 0 debug APIs, so a page outside dev mode answers nothing and the registry must say so.
- The registry sits on the panel's initial-bundle path, and the budget is a hard 520 KB (AR-1).

Open questions
- None

### M019 — context-and-jobs

Goal: Ship the prompt-context budget, the worker boundary and ring buffer, and background jobs with progress and cancellation, on top of M018's registry.
Depends on: [M018]
Surfaces: none
Status: shipped
Archive: .project/archive/019-context-and-jobs
Integrated: 44e4f9b5aa5d0ce6223fbc0a8b5b7e763fd756ca

Scope: in
- The 3.6 context caps and the chunking rule that keeps a fact list inside them.
- One fresh clone per prompt, measured rather than assumed.
- The worker boundary: what crosses it, what shape it carries, and the `host` the registry declares for a worker-side tool.
- The ring buffer and its cap, surviving a navigation.
- Job progress and cancellation, reported through the registry's async-handle outcome.
- The Summarizer path, and the named "cannot tell" state when it is unavailable.

Scope: out
- Any panel surface or explainer; this milestone ships plumbing with no new user-facing answer.
- Raising the caps to make a fact list fit: an oversized fact list is chunked, never silently truncated.
- Moving work into the page or into the panel to avoid the worker boundary.
- Code generation of app code; a summarised fact list is prompt text, never source.
- `@angular/animations`, Angular SSR and `angular/components`.
- DOM added to an inspected page; the overlay is M022's.
- Job types beyond the chunked fact list and the summariser; a second job kind arrives with the explainer that needs it.

Success criteria
1. A 200-message ring buffer survives a navigation, and its oldest entry is still readable after it.
2. A chunked job reports progress and cancels, and a cancelled job leaves no partial fact list behind.
3. One fresh clone per prompt is measured, with the measurement committed.
4. A fact list that exceeds the cap is chunked rather than silently truncated, and the chunk count the panel sees is truthful.
5. `npm run check` and `npm test` pass at the head, and the panel stays inside the 520 KB initial-bundle budget.

Risks
- Spikes S7, S14, S15 and S19 are unrun, and they set the chunk size and the prompt cap; until they are measured both numbers are provisional, and a wrong chunk size shows up as a model answer that ignores the second half of the facts.
- The worker boundary sits on the panel's initial-bundle path, so crossing it wrongly breaks the 520 KB budget (AR-1) silently instead of failing a test.
- A 200-message ring buffer over a navigation is the first place a stale page identity can leak into a live panel.
- A Summarizer path that summarises the tool declaration rather than the tool result is a plausible and quiet failure.
- Cancellation is the one job outcome no fixture produces on its own, so it needs a deliberate test rather than a browser run.

Open questions
- [RESEARCH] What chunk size and prompt cap do S7, S14, S15 and S19 actually measure, and does any of them change the 3.6 caps?

### M020 — feature-fingerprint

Goal: N18 opens a chat with only the tool groups the app's version gates allow, plus a context chip naming the features it detected.
Depends on: [M019]
Surfaces: panel
Status: shipped
Archive: .project/archive/020-feature-fingerprint
Integrated: 57441651f2fe1da35e21be09e4bd6bb12688249d

Scope: in
- The feature fingerprint from `app_facts` and the `[ng-version]` root enumeration.
- Tool groups keyed to a version gate, so a group whose gate fails is absent rather than offered and empty.
- The context chip in the panel naming the detected features, including the ones the app does not have.
- The chat entry point that opens with the permitted groups only.

Scope: out
- Any tool implementation; this milestone selects and filters the groups M018 registered and adds no registry shape.
- Guessing a feature from a version alone when `app_facts` disagrees; a silent fallback makes the chip lie.
- Opt-in instrumentation (M021) and therefore anything that requires the app to install a package.
- A page-side widget prompting the user what to inspect; confirmations, toasts, inputs and navigation live in the panel (AR-6).
- Code generation of app code; `@angular/animations`; Angular SSR; `angular/components`.
- DOM added to an inspected page (AR-3).

Success criteria
1. The context chip names the features detected for the inspected app, including the features it does not have.
2. A tool group whose `[ng-version]` gate fails is absent from the chat's group list, not present and empty.
3. A non-Angular page produces a named refusal rather than a chip claiming features.
4. `npm run check` and `npm test` pass at the head, and the panel stays inside the 520 KB initial-bundle budget.

Risks
- The chip can over-claim: naming a feature the app lacks is worse than naming none, so a "cannot tell" state is part of the surface.
- The `[ng-version]` root enumeration is dev-mode behaviour and can be absent on a production build.
- The chip and the group filter add to the initial bundle, which is already the tightening point of the 520 KB budget (AR-1).
- A version gate tuned on one fixture can exclude a group that works on another.

Open questions
- [RESEARCH] Which feature fingerprints `app_facts` can distinguish on the fixtures at this head, and which need a per-feature probe instead?

### M021 — optin-companion

Goal: Ship the Tier-2 opt-in companion package and its vetted symbol table, so an app can be asked to expose more than page inspection can see.
Depends on: [M020]
Surfaces: panel
Status: shipped
Archive: .project/archive/021-optin-companion
Integrated: 867f563e47fcf21dc0468ed44b2417e648a992cd

Scope: in
- The companion package and the vetted symbol table it publishes.
- The detection path that tells an app with the package from one without.
- The panel's request for the extra surface, with a named reason when the app cannot answer.
- The facade, shown to survive a development build's tree-shaking.

Scope: out
- `cdpAttach`, which moves to M030, and every attach path built on it.
- Anything that mutates `globalThis` beyond the package's table entry.
- A page-side prompt, confirm or toast; AR-6 keeps every confirmation in the panel.
- Code generation of app code; a vetted symbol may be read, never written back.
- `@angular/animations`, Angular SSR and `angular/components`.
- Any insurance-portal change beyond the dev-only provider file and the dev build configuration the charter allows.

Success criteria
1. An app that installs the package is detected, and the panel names the extra surface it exposes.
2. An app without the package is refused with a named reason rather than an empty result.
3. The package adds nothing to `globalThis` beyond its table entry.
4. The facade survives a development build's tree-shaking, proven on the fixture rather than on `buildOptimizer`.
5. `npm run check` and `npm test` pass at the head.

Risks
- Spike S16 gates the milestone: the companion package has never existed, so the whole detection path rests on a verdict taken before any package did.
- The facade must survive a development build's tree-shaking, not `buildOptimizer`; proving it on the wrong configuration proves nothing.
- A vetted symbol table is a compatibility promise to every app that installs it, fixed here before any app exists.
- Detection that falls back to page inspection when the package is absent hides the difference the milestone ships.
- A Tier-2 package is app-visible code in someone else's build, which is a larger blast radius than any panel change in this generation.

Open questions
- [RESEARCH] Does the S16 verdict recorded against an exported provider carry over to a package that exports a facade at the table entry, or does the lookup need measuring again?
- [NEEDS-USER] Should the package be published under the programme's own name or stay unpublished until a consumer asks for it?

### M022 — in-page-overlay

Goal: Ship the only DOM the tool adds to an inspected page — a rect/label overlay plus an element picker in one closed Shadow DOM host attached once at `document_start`.
Depends on: [M019]
Surfaces: inspected page
Status: shipped
Archive: 022-in-page-overlay
Integrated: 9d3c711

Scope: in
- One host element with a closed Shadow DOM, attached once at `document_start`.
- Rect tracking through scroll, zoom, CSS transforms and device pixel ratio.
- The `elementFromPoint` picker and its hover, lock and cancel states, driven from the panel.
- `__ngContext__` and `getOwningComponent` resolution from a picked element to its owning component.
- The AR-4 exclusion rule: every `MutationObserver` the tool owns excludes the host subtree.
- A plain-DOM implementation of roughly 400 lines with no Angular in the inspected page (AR-2).

Scope: out
- A second widget, a second host element, an injected panel, a toast, an input or a navigation control in the page; AR-3 makes the overlay the only DOM and AR-6 keeps the rest in the panel.
- Angular, Angular Elements or any framework runtime in the inspected page; AR-2's reason is that the tool's own Angular corrupts the profiler list, the feature fingerprint and the dev-mode counters.
- Cross-frame outlining (AR-5) and therefore a host per frame.
- Rewriting the page's styles, moving its nodes or wrapping its elements.
- Code generation of app code; `@angular/animations`; Angular SSR; `angular/components`.

Success criteria
1. The box tracks a picked element through scroll, zoom and a CSS transform, and the label names the element and its component.
2. Picking an element resolves to its owning component in the panel, including an element inside a component's view rather than at its host.
3. No `MutationObserver` owned by the tool observes the host subtree, asserted by a test that fails when the exclusion is removed.
4. The host is inserted exactly once per page load, asserted across a re-injection attempt.
5. The inspected page carries no Angular of the tool's own: the `ɵsetProfiler` list and the feature fingerprint read the same with and without the overlay installed.
6. `npm run check` and `npm test` pass at the head.

Risks
- AR-4 is a correctness dependency for N7, FOR-1 and CF-1, so an observer that sees its own host makes three features silently wrong in a way that reads as a page defect.
- A closed Shadow DOM keeps the page's CSS out and the tool's own debugging in; the picker needs a panel-visible state for what it cannot see.
- `__ngContext__` is present on a dev build and absent on a production one, so resolution must report the difference rather than return nothing.
- Device pixel ratio and CSS transforms are where a rect overlay is usually off by a few pixels, and a few pixels is indistinguishable from picking the wrong element.
- The overlay is the only programme-1 code an inspected page can observe, so its footprint is a compatibility surface rather than an implementation detail.

Open questions
- [RESEARCH] Which `MutationObserver` call sites the tool owns today would observe a host subtree if the exclusion were dropped, and which of them are in this generation's scope?
- [NEEDS-USER] Should the picker lock on click, or require a confirm in the panel before the panel navigates to the picked component?

### M023 — fixture-components

Goal: Add Aria, CDK and Material surfaces to the verification fixtures, so the harness and Aria features have subjects to be right about.
Depends on: [M019]
Surfaces: none
Status: shipped
Archive: .project/archive/023-fixture-components
Integrated: 6ea8aff4af2a162a30753c9b2eecd96c8cca97f1

Scope: in
- `@angular/aria`, `@angular/cdk` and `@angular/material` in the verification fixture.
- One overlay surface, one list, one tabs and one menu, each written against modern APIs.
- A harness target that is deliberately ambiguous, with two matching hosts, and action-observable.
- The fixture's declaration as a verification surface, with the panel left on its own package versions.

Scope: out
- Promoting a spike into a fixture; a new fixture must be a declared verification surface.
- The panel adopting these packages; the panel's design system is programme 2 and starts no work here.
- `@angular/animations` and Angular SSR; NgModule-based Material entry points.
- Changing a shipped explainer to suit the fixture.
- Code generation of app code.
- `@angular/cdk/testing` for any purpose beyond the harness family the A8 ruling excepts.

Success criteria
1. The harness target gives HAR-1 a root-boundary case with content outside the component root, HAR-2 a predicate case, HAR-3 an ambiguity case with two matching hosts, and HAR-4 an action case whose effect the harness observes.
2. The menu surface supplies the listbox and menu rules N23 needs, including at least one rule that fails when the attribute it reads is removed.
3. The fixture builds and serves, and the four shipped explainers still answer on it.
4. `npm run check` and `npm test` pass at the head.

Risks
- A fixture that is too clean makes every later check pass for the wrong reason, so the ambiguity case must stay deliberately ambiguous.
- The Material and CDK version lines can drift from the fixture's Angular version, and a drifted fixture reads as a product defect.
- The panel must not adopt these packages from this milestone, so the fixture and the panel diverge on purpose.
- A harness that cannot observe an action is indistinguishable from a harness whose action never landed (HAR-4).
- A second set of component packages in the repository widens the dependency surface that `npm run check` and the sidecar bridge must carry offline.

Open questions
- None

### M024 — proof-corpus-repair

Goal: Make the held-out proof corpus load-bearing: every suite passes in a fresh checkout under a script the project gate runs, or it does not exist.
Depends on: [M023]
Surfaces: none
Status: shipped
Archive: .project/archive/024-proof-corpus-repair
Integrated: null

Scope: in
- `tests/held-out/`, the npm scripts, and whatever the ten dead suites need to become honest.

Scope: out
- Adding new held-out suites for new features; changing the product to satisfy a suite.

### M025 — panel-verify-breadth

Goal: Bring `extension/` under `npm run check`. The panel gap this milestone was written for was closed by M018 T008; what is unchecked is the extension's plain JavaScript, and its first real run finds thirteen genuine defects behind twenty missing-global errors.
Depends on: [M019]
Surfaces: none
Status: shipped
Shipped: 2026-11-04 — `extension/` is type-checked by a sixth `check` stage; the roadmap's panel premise was already closed by M018 and the intent records the re-scope.
Archive: .project/archive/025-panel-verify-breadth
Integrated: null

Scope: in
- `tsc -p apps/angular-ai-devtools/tsconfig.app.json` in `npm run check`, together with the extension sources.
- Fixing the errors the first run reveals, or recording each accepted one with a written reason.
- Keeping the check offline and free of a dev server.

Scope: out
- New panel features, redesigns or refactors not needed to make the check pass.
- Weakening a type, adding an `any` or suppressing a diagnostic without a written reason.
- Making the check depend on a dev server, a network fetch or a built artifact it does not already need.
- Changing a shipped explainer's behaviour.
- Code generation of app code; `@angular/animations`; Angular SSR; `angular/components`.

Success criteria
1. A deliberate type error in a panel source file fails `npm run check`, proven by introducing one and reverting it.
2. The extension sources are covered by the same check.
3. The check stays offline and needs no dev server.
4. `npm run check` and `npm test` pass at the head.

Risks
- The first run surfaces a backlog of errors; that is the point, and the milestone is sized to the backlog rather than to a number chosen now.
- An error fixed by widening a type leaves the panel no safer than before, so every accepted suppression needs its written reason.
- Adding the extension sources can require a second tsconfig whose paths disagree with the app's.
- The check also runs in the verify sidecar, where a project reference can fail for a reason that is not a type error.
- A check that only compiles the panel can pass while the panel's runtime contract with the extension has already drifted.

Open questions
- None

### M026 — image-budget-audit

Goal: Build COM-1, why an image is slow and why the console warned about it, filling N4's missing image codes from NG02200 through NG02800.
Depends on: [M020]
Surfaces: panel
Status: shipped
Re-scope: the roadmap asked for codes NG02200-NG02800; Angular 22.1.8 declares none in that range, so the digest covers the eighteen codes the image directive and core actually emit.
Shipped: 2026-11-04 — the image digest covers the eighteen codes Angular 22.1.8 declares, generated at build time, with COM-1 proven on a transcribed sample; the browser capture is carried to the next milestone.
Archive: .project/archive/026-image-budget-audit
Integrated: null

Scope: in
- The image half of the offline error digest: one entry per code from NG02200 through NG02800, generated at extension build time and capped at 150 tokens an entry.
- The COM-1 evidence path: which image, what the console said, and which binding produced the attribute.
- The panel surface rendering the finding and its explanation from a short fact list.
- The license and copyright strip on every new digest entry before any text reaches a prompt.

Scope: out
- Rewriting N4's existing entries or its capture path; COM-1 fills a gap and does not reopen M010.
- Guessing a code's meaning when the digest has no entry; an unknown code is reported as unknown.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations`, Angular SSR and `angular/components`.
- `@angular/cdk/testing`, beyond the harness family the A8 ruling excepts; COM-1 needs no harness.
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, an image with no width or height produces a COM-1 finding naming the image, the console warning and the binding behind the attribute.
2. The offline digest carries one entry per code from NG02200 through NG02800, each capped at 150 tokens, generated at extension build time.
3. The license and copyright notice is stripped from every new entry before any digest text reaches a prompt.
4. The panel explains the finding from a short fact list, with no tool calling outside the registry envelope.
5. `npm run check` and `npm test` pass at the head, and the panel stays inside the 520 KB initial-bundle budget.

Risks
- Spike COM-S1 gates the milestone and is unrun: what the console actually reports for an unbudgeted image decides whether COM-1 has an evidence path at all.
- The digest source tracks the 22.2.x branch, so a new code range can arrive between planning and the check.
- A warning a browser emits once per page makes a re-run look like a regression.
- The 150-token cap over a new code range grows the panel's data, and its budget is the initial bundle, not the total.
- An image finding that names a binding can read as a layout recommendation, which the panel's wording must not become.

Open questions
- [RESEARCH] What does COM-S1 measure for an image with no width and height on the fixture, and which console warning does the browser emit for it?

### M027 — image-warning-capture

Goal: Capture the console warning a real browser emits for an unbudgeted image on the fixture, so the gap M026 shipped with is closed by measurement rather than transcription.
Depends on: [M026]
Surfaces: none
Status: shipped
Archive: .project/archive/027-image-warning-capture
Integrated: null

Scope: in
- One browser run against `/image-budget` on the fixture in development mode, with the console captured as evidence.
- Reading the captured message for text, code and the image it names.
- Replacing the transcribed `source` in the warning sample with a captured one, naming profile, instance and time.
- Recording a negative result plainly if the browser emits no warning.

Scope: out
- Mapping a browser message onto an `NG` code it does not carry.
- A second warning sample or a second capture path.
- Changing the digest, COM-1's processing or the panel surface that M026 shipped.
- DOM added to an inspected page (AR-3).

Success criteria
1. A browser instance loads `/image-budget` in development mode and the console output is committed as evidence naming the profile, the instance and the time.
2. The captured message is recorded with its text and, if it carries one, its code; a message carrying no `NG` code is recorded as carrying none rather than mapped onto one.
3. `spikes/ng222-app/src/app/image-budget-warning.json` records `source` as captured, replacing the transcribed provenance, and the COM-1 suite still passes.
4. If no warning is emitted, that negative result is recorded and M026's final review is corrected, never the sample fabricated.
5. `npm run check` and `npm test` pass at the head.

Risks
- The warning may be emitted once per page load, so a second run can look like a regression.
- A browser profile shared with other checkouts may hold a stale extension build.
- The console message may name the element rather than the binding, in which case SC2 records that and COR-style attribution is not claimed.

### M028 — after-render-ordering

Goal: Build COR-1, why `afterNextRender` read `offsetWidth` as 0, from the ordered profiler after-render events.
Depends on: [M020]
Surfaces: panel
Status: shipped
Archive: .project/archive/028-after-render-ordering
Integrated: null

Scope: in
- Ordering the profiler after-render events within the single `ɵsetProfiler` list the page agent already records.
- The COR-1 evidence: the read that saw 0, the render phase it ran in, and the event that moved it.
- The panel surface rendering the ordered chain and its explanation.
- A named "cannot tell" state when the profiler list holds no after-render event for the read.

Scope: out
- A second profiler tap or a second append-only list; COR-1 reads the one list N20 and N30 will also read.
- Attributing a zero width to layout when only the read order was observed.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations` and its lifecycle hooks; Angular SSR; `angular/components`.
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, a component whose `afterNextRender` reads `offsetWidth` before layout produces a COR-1 finding naming the read, its phase and the event order around it.
2. The finding is produced from the ordered profiler after-render events alone, with no new page-side instrumentation.
3. A page with no after-render event for the read reports "cannot tell" rather than inferring an order.
4. The panel explains the ordering from a short fact list.
5. `npm run check` and `npm test` pass at the head.

Risks
- Spike COR-S1 gates the milestone and is unrun: which profiler event identifies an after-render read is its central unknown.
- The `ɵsetProfiler` list is single and append-only, so a second tap anywhere in the tool corrupts this feature and N20 together.
- The profiler callback's shape is internal API, so a point release can change it without notice.
- Ordering evidence and layout evidence are easy to confuse, and that difference decides whether the finding is true.
- A read that happens once at mount leaves nothing to observe on a re-run, so the fixture needs a repeatable trigger.

Open questions
- [RESEARCH] What does COR-S1 measure for the ordered after-render events of a component reading `offsetWidth`, and which event marks the read?

### M029 — trust-bypass-triage

Goal: Build PBR-1, what the sanitizer stripped and which binding did it.
Depends on: [M020]
Surfaces: panel
Status: shipped
Archive: .project/archive/029-trust-bypass-triage
Integrated: null

Scope: in
- The sanitizer-decision evidence: what was stripped, from which binding, on which element.
- The join from a stripped value to the template binding that carried it.
- The panel surface rendering the finding and its explanation from a short fact list.
- The vetted path for a deliberate bypass, reported as deliberate when the app used one.

Scope: out
- Recommending `bypassSecurityTrust*` as a fix; a finding may name the API and the risk it carries, never prescribe the bypass.
- Reproducing the stripped value in the panel's answer beyond the fact list a prompt carries.
- A page-side protocol for reporting the decision; the evidence travels over the existing message channel.
- Code generation of app code; `@angular/animations`; Angular SSR; `angular/components`.
- DOM added to an inspected page (AR-3).
- Reopening N4's digest or N2's signal graph.

Success criteria
1. On the fixture, a binding the sanitizer stripped produces a PBR-1 finding naming the element, the binding and the category of what was stripped.
2. A deliberate bypass in the fixture is reported as deliberate rather than as a silent strip.
3. A page with no strip event reports "none seen" rather than an empty finding.
4. The panel explains the finding from a short fact list.
5. `npm run check` and `npm test` pass at the head.

Risks
- Spike PBR-S1 gates the milestone and is unrun: whether the runtime exposes a stripped-value event at all decides the evidence path.
- A security finding that names a bypass API reads as advice, and the panel's wording is the only thing between a diagnosis and a recommendation.
- A stripped value can carry page data, so the prompt's fact list is the only place it may appear.
- Sanitizer behaviour differs between a development and a production build, and the fixture is a development build.
- A report that says only "stripped" is true and useless; the binding join is what the milestone actually ships.

Open questions
- [RESEARCH] What does PBR-S1 measure for a stripped binding, and does the runtime expose the stripped value or only its category?

### M030 — redirect-chain

Goal: Build RTR-1, why `/settings` lands on `/login`, walked from `Router.config` with a cycle guard.
Depends on: [M020]
Surfaces: panel
Status: shipped
Archive: .project/archive/030-redirect-chain
Integrated: null

Scope: in
- The redirect walk from `Router.config`, following guards, resolvers and redirect functions in the order the router runs them.
- The cycle guard, with the repeated route named when a configuration can loop.
- The panel surface rendering the walked chain, with the first route that changed the destination marked.
- The lazy-route case, walked as far as the configuration is known before the chunk loads.

Scope: out
- Naming a guard's internal reason; RTR-1 reports the verdict, not the guard's body.
- A recorded navigation history or a page-side navigation control; AR-6 keeps navigation in the panel.
- Reopening N2's signal graph or N24's stale-view scan.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations`, Angular SSR and `angular/components`.
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, a route that lands somewhere other than where it was asked to produces an RTR-1 chain naming every route the walk crossed and the first route that changed the destination.
2. A configuration that can loop is reported as a cycle with the repeated route named, not as a walk that did not terminate.
3. A guard that returns false is reported as the reason, without claiming to know why.
4. The panel explains the chain from a short fact list.
5. `npm run check` and `npm test` pass at the head.

Risks
- `Router.config` is the pre-navigation configuration, so a guard that redirects at runtime can make the walked chain disagree with the observed destination.
- The cycle guard is the difference between a hung panel and a named finding, and it is the one part of the walk that cannot be tuned per fixture.
- A lazy route's configuration is incomplete before its chunk loads, so a walk can stop short and still look complete.
- Redirect functions are modern router API, and their order relative to guards is the milestone's central assumption.
- A destination that changes twice hides the first change unless the walk keeps its own order.

Open questions
- [RESEARCH] Which parts of `Router.config` are complete before a lazy chunk loads, and in what order does 22.x run a redirect function against a guard?

### M031 — cross-field-validation

Goal: Build FRM-1, why fixing one field does not enable submit, from the Signal Forms field states.
Depends on: [M020]
Surfaces: panel
Status: shipped
Archive: .project/archive/031-cross-field-validation
Integrated: null

Scope: in
- The Signal Forms field-state read: each field's validity, its errors, and the cross-field rule that keeps submit disabled.
- The join from a disabled submit to the field state that disables it.
- The panel surface rendering the field set and its explanation from a short fact list.
- A named "cannot tell" state for a form whose validity is computed outside Signal Forms.

Scope: out
- NgModel, `FormGroup` and every template-driven path; programme 1 is modern APIs only (A9).
- Reproducing a field's value in the panel's answer beyond the fact list a prompt carries.
- A page-side form control, input or validation widget; AR-6 keeps inputs in the panel.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations`, Angular SSR and `angular/components`.
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, a form whose submit stays disabled after one field is corrected produces an FRM-1 finding naming the cross-field rule and the field state that keeps it disabled.
2. The finding is produced from the Signal Forms field states alone, with no new page-side instrumentation.
3. A form whose validity does not come from Signal Forms reports "cannot tell" rather than naming a wrong field.
4. The panel explains the finding from a short fact list.
5. `npm run check` and `npm test` pass at the head, and the panel stays inside the 520 KB initial-bundle budget.

Risks
- Spike FRM-S1, the spike known as S9, gates the milestone and is unrun: which field states Signal Forms exposes for a cross-field rule is its central unknown.
- Forms is the family where a wrong answer is acted on immediately, so a "cannot tell" state matters more here than anywhere else in the generation.
- Signal Forms is newer than the rest of programme 1, so its line can move under the milestone.
- A disabled submit can be disabled by a template expression outside the field states, and that case must report as unknown rather than as a rule.
- A field-state read that misses a deferred or async validator reports a form as valid when submit says otherwise.

Open questions
- [RESEARCH] What does FRM-S1 (S9) measure for the field states of a cross-field rule in Signal Forms, and which state explains a disabled submit?

### M032 — lint-core

Goal: Build the core lint explainers: why the compiler reported this template, lifecycle or configuration problem, and what the app should do instead.
Depends on: [M020]
Programme: core · Batch: 3 · Group: @angular/core
Surfaces: panel
Status: shipped
Archive: .project/archive/032-lint-core
Integrated: null

Scope: in
- The lint findings the compiler raises on the reference fixture, grouped by the API each one concerns.
- A mapping from a finding to the modern pattern that replaces the flagged construct.
- The panel surface rendering the findings and their remedies from a short fact list.

Scope: out
- A page-side control, input or widget; AR-6 keeps every interaction in the panel.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations`, Angular SSR and `angular/components` (A5).
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, every template and configuration lint the compiler reports produces a finding naming the construct and its modern replacement.
2. The finding is produced from the compiler message and the app facts alone, with no new page-side instrumentation.
3. A subject that does not match this explainer's premise reports "cannot tell" rather than naming a wrong cause.

Risks: the lint catalogue is large and versioned; a digest pinned to one Angular version goes stale silently (see the 18-vs-13 image-code defect).
Open questions: none


### M033 — lint-router

Goal: Build the router lint explainers: why a route declaration is flagged, and which configured route the finding belongs to.
Depends on: [M020]
Programme: core · Batch: 3 · Group: @angular/router
Surfaces: panel
Status: shipped
Archive: .project/archive/033-lint-router
Integrated: null

Scope: in
- The router findings the compiler raises on the fixture, joined to the configured route they concern.
- The modern replacement for each flagged routing construct.
- The panel surface rendering the route, the finding and the remedy.

Scope: out
- A page-side control, input or widget; AR-6 keeps every interaction in the panel.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations`, Angular SSR and `angular/components` (A5).
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, a flagged route declaration produces a finding naming the configured route and the construct to replace.
2. The finding names no guard verdict the configuration does not record.
3. A subject that does not match this explainer's premise reports "cannot tell" rather than naming a wrong cause.

Risks: a route finding that cannot be attributed to exactly one configured route must say so rather than pick the nearest.
Open questions: none


### M034 — lint-legacy

Goal: Build the legacy-API explainers: why a construct is flagged as legacy and what the modern equivalent is.
Depends on: [M020]
Programme: core · Batch: 3 · Group: cross-package
Surfaces: panel
Status: pending
Archive: null
Integrated: null

Scope: in
- The legacy findings on the fixture, each naming the flagged construct and the modern API that replaces it.
- A refusal path for a construct that has no modern equivalent, rather than a fabricated remedy.
- The panel surface rendering the construct, its replacement and the migration note.

Scope: out
- A page-side control, input or widget; AR-6 keeps every interaction in the panel.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations`, Angular SSR and `angular/components` (A5).
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, a flagged legacy construct produces a finding naming it and its modern replacement.
2. A construct with no modern equivalent reports that plainly instead of naming a replacement.
3. A subject that does not match this explainer's premise reports "cannot tell" rather than naming a wrong cause.

Risks: the legacy catalogue mixes removals and deprecations; conflating them produces a wrong remedy.
Open questions: none


### M035 — onpush-readiness

Goal: Build the change-detection explainer: why this component could adopt OnPush, and what blocks it.
Depends on: [M020]
Programme: core · Batch: 3 · Group: @angular/core
Surfaces: panel
Status: pending
Archive: null
Integrated: null

Scope: in
- The component facts that make a component OnPush-ready, and the ones that block it.
- Each blocking fact joined to the component and the template expression it comes from.
- The panel surface rendering readiness, the blockers and the first change to make.

Scope: out
- A page-side control, input or widget; AR-6 keeps every interaction in the panel.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations`, Angular SSR and `angular/components` (A5).
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, a component using default change detection produces a finding naming its blockers or stating it is ready.
2. The finding is produced from the profile and template facts alone, with no new page-side instrumentation.
3. A subject that does not match this explainer's premise reports "cannot tell" rather than naming a wrong cause.

Risks: readiness inferred from a quiet profile is not readiness; a component with no observed updates must not be reported as ready.
Open questions: none


### M036 — resource-lifecycle

Goal: Build the resource explainer: why this resource is still loading, errored, or never settled.
Depends on: [M020]
Programme: core · Batch: 3 · Group: @angular/core
Surfaces: panel
Status: pending
Archive: null
Integrated: null

Scope: in
- The resource status the fixture exposes, per resource and per parameter set.
- The lifecycle event that last moved the resource, and the state it holds now.
- The panel surface rendering the resource, its status and the last transition.

Scope: out
- A page-side control, input or widget; AR-6 keeps every interaction in the panel.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations`, Angular SSR and `angular/components` (A5).
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, a resource that has not settled produces a finding naming its status and the last lifecycle event.
2. The finding reports the observed status rather than inferring completion from the absence of an error.
3. A subject that does not match this explainer's premise reports "cannot tell" rather than naming a wrong cause.

Risks: a resource that was never read and one that failed to load look alike unless the status is read, not inferred.
Open questions: none


### M037 — signal-forms-doctor

Goal: Build the Signal Forms doctor: why this form is invalid, field by field and at the root.
Depends on: [M020]
Programme: core · Batch: 3 · Group: @angular/forms
Surfaces: panel
Gate: S9.
Status: pending
Archive: null
Integrated: null

Scope: in
- Each field's validity and its own errors, plus the root's error kind when it carries one.
- The distinction between a field error and a cross-field rule, kept visible rather than merged.
- The panel surface rendering the field set, the submit state and the root kind.

Scope: out
- A page-side control, input or widget; AR-6 keeps every interaction in the panel.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations`, Angular SSR and `angular/components` (A5).
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, an invalid form produces a finding naming each invalid field and the root kind when present.
2. The finding never names the rule that decided a root verdict, only the kind the form carries.
3. A subject that does not match this explainer's premise reports "cannot tell" rather than naming a wrong cause.

Risks: spike S9 is unrun; the shape it finds sets what a Signal Forms read can expose.
Open questions: S9: what does a Signal Forms root expose beyond a boolean and an error kind?


### M038 — linked-state-reset

Goal: Build the explainer for state that resets itself: why this linked signal or state value returned to its source value.
Depends on: [M020]
Programme: core · Batch: 3 · Group: @angular/core
Surfaces: panel
Status: pending
Archive: null
Integrated: null

Scope: in
- The linked state the fixture exposes, its source and its last write.
- The write that caused the reset, distinguished from a recomputation.
- The panel surface rendering the value, its source and the last transition.

Scope: out
- A page-side control, input or widget; AR-6 keeps every interaction in the panel.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations`, Angular SSR and `angular/components` (A5).
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, a linked value that returned to its source produces a finding naming the write that reset it.
2. A recomputation is not reported as a reset.
3. A subject that does not match this explainer's premise reports "cannot tell" rather than naming a wrong cause.

Risks: a reset and a recomputation reach the same value by different routes; the observable must distinguish them or say it cannot.
Open questions: none


### M039 — render-phase-effect

Goal: Build the render-phase explainer: why this effect ran during rendering, and what it touched.
Depends on: [M020]
Programme: core · Batch: 3 · Group: @angular/core
Surfaces: panel
Status: pending
Archive: null
Integrated: null

Scope: in
- The effect executions the fixture exposes, with the phase each ran in.
- The values the effect wrote, joined to the phase that observed them.
- The panel surface rendering the effect, its phase and the value it changed.

Scope: out
- A page-side control, input or widget; AR-6 keeps every interaction in the panel.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations`, Angular SSR and `angular/components` (A5).
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, an effect that writes during rendering produces a finding naming the effect and the phase.
2. The finding reports the phase it observed rather than inferring one from the effect's own report.
3. A subject that does not match this explainer's premise reports "cannot tell" rather than naming a wrong cause.

Risks: phase attribution across a microtask boundary is the failure mode here; an unattributable write must say so.
Open questions: none


### M040 — performance-narrator

Goal: Build the performance narrator: which component did the work in this frame, and what it cost.
Depends on: [M020]
Programme: core · Batch: 3 · Group: cross-package
Surfaces: panel
Status: pending
Archive: null
Integrated: null

Scope: in
- The recorded render work per component, ordered by the profile rather than by wall-clock guesses.
- The cost attributed to each component, with the phase it belongs to.
- The panel surface rendering the frame's ordered work and its cost.

Scope: out
- A page-side control, input or widget; AR-6 keeps every interaction in the panel.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations`, Angular SSR and `angular/components` (A5).
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, a frame with recorded work produces a finding listing the components in phase order with their cost.
2. A frame with no recorded work reports that, rather than an empty table that reads as "nothing was slow".
3. A subject that does not match this explainer's premise reports "cannot tell" rather than naming a wrong cause.

Risks: the profile records events, not durations; a cost inferred from ordering is not a measurement.
Open questions: none


### M041 — navigation-blocking

Goal: Build the navigation explainer: what is holding this navigation, and at which stage.
Depends on: [M020]
Programme: core · Batch: 3 · Group: @angular/router
Surfaces: panel
Status: pending
Archive: null
Integrated: null

Scope: in
- The navigation stages the fixture records, and the one the navigation stopped in.
- The route the navigation was heading for, and the route it is on.
- The panel surface rendering the stage, both routes and the end state.

Scope: out
- A page-side control, input or widget; AR-6 keeps every interaction in the panel.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations`, Angular SSR and `angular/components` (A5).
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, a navigation that does not complete produces a finding naming the stage it stopped in.
2. The finding names no guard verdict the router does not record.
3. A subject that does not match this explainer's premise reports "cannot tell" rather than naming a wrong cause.

Risks: a navigation that is merely slow and one that is blocked look identical until the stage is read.
Open questions: none


### M042 — error-boundary

Goal: Build the error-boundary explainer: why this error reached the boundary that caught it, and what it replaced.
Depends on: [M020]
Programme: core · Batch: 3 · Group: @angular/core
Surfaces: panel
Gate: S10.
Status: pending
Archive: null
Integrated: null

Scope: in
- Which boundary caught the error, and the subtree it replaced.
- The error's own identity, distinguished from the boundary's fallback content.
- The panel surface rendering the error, the boundary and the replaced subtree.

Scope: out
- A page-side control, input or widget; AR-6 keeps every interaction in the panel.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations`, Angular SSR and `angular/components` (A5).
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, an error that reaches a boundary produces a finding naming the boundary and the subtree it replaced.
2. The finding reports the error the boundary received, never the fallback that replaced it.
3. A subject that does not match this explainer's premise reports "cannot tell" rather than naming a wrong cause.

Risks: spike S10 is unrun; a boundary that swallows an error silently sets what this explainer can see.
Open questions: S10: does an Angular error boundary expose the error it caught to a page-side reader?


### M043 — stability-explainer

Goal: Build the stability explainer: why the app is not stable, and what is still outstanding.
Depends on: [M020]
Programme: core · Batch: 3 · Group: @angular/core
Surfaces: panel
Status: pending
Archive: null
Integrated: null

Scope: in
- The outstanding work the fixture reports: pending tasks, in-flight requests and unsettled resources.
- Each outstanding item joined to the component or service that owns it.
- The panel surface rendering what is outstanding and the first item to settle.

Scope: out
- A page-side control, input or widget; AR-6 keeps every interaction in the panel.
- Code generation of app code; a finding may name a modern Angular pattern and an official schematic only.
- `@angular/animations`, Angular SSR and `angular/components` (A5).
- DOM added to an inspected page (AR-3).

Success criteria
1. On the fixture, an unstable app produces a finding listing the outstanding work with its owners.
2. A stable app reports stability as measured, not as the absence of a report.
3. A subject that does not match this explainer's premise reports "cannot tell" rather than naming a wrong cause.

Risks: stability read from a quiet interval is not stability; the observable must come from the reported work.
Open questions: none

