# Charter — Angular AI DevTools (first release)

<!-- Written by /gsd-path-define program mode. Enduring program intent:
     vetoes and constraints here override every milestone. Amended only by an
     explicit user ruling recorded under Corrections. Lives at .project/
     top level and persists across milestones; it never archives. -->

Review panel: off   <!-- off | detected | claude,gpt,grok,composer,gemini,
                      deepseek,kimi,qwen — durable program default. Recorded
                      off until the installer's guarded family patch lands; it
                      adds beam, glyph, laguna and glm, which this host's routes
                      need. deepseek is already a known family. See Constraints. -->

## Vision

Ship the first release of an AI-assisted Angular DevTools extension that runs
entirely on the browser's on-device models. It explains what a dev-mode Angular
app is doing — why a component updated, where a signal value came from, why two
components got different service instances, what an Angular error means, why a
view is stale, and what an RxJS interop node is — without sending page data to a
cloud. It is the runtime counterpart to the Angular CLI AI tooling: the same
questions, answered in the panel, on the developer's machine.

## Full scope: in

<!-- Remaining first-release work. N1 (change-detection causality) shipped in
     M004, N2 (signal provenance) in M005/M006, and N3 (DI doctor) in M007. -->

- Angular error explainer (N4): capture `NG0xxx` errors and uncaught console
  errors, map them to the owning component, and explain them from a bundled
  offline digest.
- Zoneless stale-view finder (N24): detect a plain field written outside change
  detection that leaves the template showing a stale value, and name the modern
  Angular pattern.
- RxJS interop explainer (N25): identify the interop call behind a `toSignal`
  source and the effects the signal graph cannot label, and explain the chain.
- Panel delivery: every feature reachable from the DevTools "Angular AI" panel
  against the counter fixture (`spikes/ng222-app`), on all four supported
  on-device model pairs.
- Proof: each milestone's UI claims carried by `lars-verify` verdicts plus
  end-to-end coverage of all four supported Prompt API models.
- Tooling (program infrastructure): move every `install-*` script and its tests
  from `scripts/` to `~/.commandcode/scripts/`, update the `package.json`,
  `tsconfig.json` and `AGENTS.md` references, and extend the installer's guarded
  adaptation to add the `beam`, `glyph`, `laguna` and `glm` review-panel families
  so `detected` and named panels can express this host's routes.
- Consolidation and hardening of M001-M007: review the shipped product code
  (extension contexts, panel components, MAIN-world tracers, prompt/fact-list
  plumbing, tests) and the M002/M003 tooling; fix defects, remove dead code,
  strengthen assertions, stabilize error paths and model-dependent behavior, and
  retire unused spike trees once their evidence is archived. The review runs as
  repeated `lars-review` panels over one authored specification per shipped
  milestone, with verified blockers resolved through a GSD patch plan inside the
  milestone. Hardening and stabilization only: no new features and no redesign.

## Full scope: out (vetoes)

- No code generation of any kind, in the extension or its runtime. Findings may
  name a modern Angular pattern and an official schematic, never app code
  (Lars's ruling of 2026-10-12).
- No support for NgModule apps, Zone.js change detection, `@angular/upgrade`
  hybrids, template-driven or Reactive Forms, or decorator inputs/queries:
  supported apps are zoneless, standalone Angular 22.2 dev builds.
- No Firefox or Safari: they ship no Prompt API.
- No Tier 2 (app opt-in `globalThis` export) features in this program; the
  counter fixture is never modified to help a feature.
- No automatic model calls: every explanation follows an explicit user action,
  and no page or user data goes into a prompt beyond the shaped fact list.
- No model-download flow for `downloadable` models.
- No usage of `angular:di_graph` or `getViewContainerRef()` on component hosts,
  which breaks the signal graph (`docs/filing-ledger.md` item 1).
- No push, pull request, or filing of ledger drafts without Lars's explicit yes.

## Constraints

- Stack: TypeScript 6.0.x, Nx 23.3, Angular ~22.1 for the extension workspace;
  supported inspected apps are Angular 22.2 dev builds. One Angular app is
  emitted as the extension panel (MV3; `background.js`, `relay.js`,
  MAIN-world `agent-main.js`, DevTools page).
- Supported browser/model pairs: `chrome-beta-nano` (Gemini Nano),
  `chrome-beta-gemma4` (Gemma 4), `edge-dev-aion` (Aion-1.1-Instruct) and
  `edge-phi4mini` (Phi-4-mini), each in its own profile under `.browsers/` on
  D:. Edge Dev stays pinned to Aion model/runtime 2026.10.2.1.
- Architecture: deterministic code computes the facts; the panel-local Prompt
  API explains a short fact list (no tool calling in the core loop). The panel
  uses its own `LanguageModel.availability()`, never the page's.
- Fixtures: `spikes/ng222-app` and `spikes/ng222-ssr` are retained verification
  fixtures. Unused spike trees are not promoted and may be retired once their
  evidence is archived.
- Verification policy (this program):
  - `control-ai-browsers` drives the four model instances; `control-angular-dev-app`
    serves the fixtures; `control-angular-devtools` and
    `control-pangular-inspector` drive their harnesses.
  - `verify-ai-browsers`, `verify-angular-devtools` and
    `verify-pangular-inspector` supply the fixed checks.
  - `lars-verify` turns a claim into exactly one verdict through those skills;
    only `verified` counts as proof, and its `verdict.json` is cited by wave and
    final review. End-to-end coverage must include all four supported Prompt API
    models.
  - `lars-maintain-verification` is used only when a driver or check drifts. Under
    GSD Path it edits only its `control-*`/`verify-*` folders and never commits;
    the work lands as a declared build task.
  - Stabilizing checks run inside the task's own worktree; read-only phases never
    drive browsers.
- Verification fixtures: `spikes/ng222-app` and `spikes/ng222-ssr` are in-repo.
  The insurance-portal checkout at
  `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`
  (branch `claude/ai-devtools-spike`) is used wherever verification there is
  possible and meaningful, and a claim that depends on it says so.
- GSD Path: every milestone lives on `gsd-path/M00N`, ships through one archive
  and one annotated `milestone/NNN-<slug>` tag, and integrates into `main` in
  direct mode. STATE and roadmap change only through the bundled helpers.
- Codebase: `npm run check` (TypeScript pin 6.0.x), `npm test`, and
  `npx nx run angular-ai-devtools:build-extension` must pass; the sidecar
  dependency bridge is used for worktree checks.
- Model policy: free routes only. `inspect_codebase` and `inspect_docs` run
  `reflection/beam:free` at high effort (measured 2026-10-28: low effort produced
  wrong dates and maps; Glyph Cluster failed every run).
- Delivery surfaces: the extension panel is the only product surface. The
  standalone `build`, `serve` and `serve-static` targets remain a developer and
  test surface only, and no milestone targets the standalone app. Angular
  Elements stays permitted but is not used unless a milestone documents the need.
- No model name appears in a commit message, and no work address or domain is
  written anywhere.
- Cross-model review: `Review panel:` stays `off` until the installer's guarded
  patch adds the free and paid families; then `detected` and named panels work.
  Free default: measure and evaluate every Beam 1.0 and Glyph Cluster effort for
  the review at hand and use the measured winner, with an optional attempt at
  stable Poolside Laguna S 2.1 subagent orchestration (it is often rate-limited
  and its output is slow), never as the default. Paid, only on opt-in or explicit
  approval, and never the parent's family: DeepSeek V4.1 Flash as parent uses
  GLM-5.3 Flash; GLM-5.3 Flash as parent uses DeepSeek V4.1 Flash; Poolside
  Laguna S 2.1 as parent uses DeepSeek V4.1 Flash. A panel names at most three
  families, and the resolver always skips the parent's family.

## Program success criteria

1. The first release's six features (N1, N2, N3, N4, N24, N25) all answer in the
   DevTools "Angular AI" panel against `spikes/ng222-app`.
2. Every remaining milestone's UI claims carry a `lars-verify` verdict of
   `verified`, produced through the project `control-*`/`verify-*` skills, with
   end-to-end coverage of Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct
   and the `verdict.json` retained as evidence.
3. `npm run check`, `npm test` and `build-extension` pass at every ship, and the
   panel's existing N1/N2/N3 behavior is not regressed.
4. Every milestone ships through GSD Path with an archive directory and an
   integrated milestone tag on `main`; `main` carries no milestone branch.
5. The docs audit shows no `stale` or `aspirational` claim about shipped
   features, and the alignment queue is resolved.

## Open questions

- [NEEDS-USER] If a paid or non-DeepSeek session later makes independent review
  families available, which families should form the optional panel?
- [RESEARCH] Which N24 and N25 detections are provable from `ng.ɵgetSignalGraph` and the source-text write scan on the counter fixture, and which need new instrumentation?

## Corrections

<!-- Verbatim user rulings that amend this charter. Append-only. -->
- 2026-10-28: program scope is the first release only (N4, N24, N25); the
  remaining proposals form a later program.
- 2026-10-28: keep `spikes/ng222-app` and `spikes/ng222-ssr` as verification
  fixtures; unused spikes are not promoted and may be retired once archived.
- 2026-10-28: milestone UI claims are proven by `lars-verify` verdicts plus
  end-to-end coverage of all supported Prompt API models (Gemini Nano, Gemma 4,
  Phi-4-mini, Aion-1.1-Instruct).
- 2026-10-28 review panel: "Free (the default): Measure and evaluate all
  model-effort combinations of GlyphCluster and Beam 1.0. Optionally, try to make
  stable Poolside Laguna S 2.1 subagent orchestration rules (it is often
  rate-limited and outputs tokens slowly). Paid (opt-in or explicit approval):
  GLM-5.3 Flash when using DeepSeek V4.1 Flash as the main session orchestrator.
  DeepSeek V4.1 when using Poolside Laguna S 2.1 as the main session
  orchestrator."
- 2026-10-28: "DeepSeek V4.1 Flash should also be valid, when GLM-5.3 Flash or
  Poolside Laguna S 2.1 is used as the main session orchestrator."
- 2026-10-28: "Move all install-* scripts (and their tests) to
  ~/.commandcode/scripts/".
- 2026-10-28: charter approved with the program's first milestone being the
  tooling item (installer move and review-panel families), followed by N4, N24
  and N25.
- 2026-10-28: the standalone Angular app target is a developer/test surface
  only; the extension panel is the only product delivery. The panel stays an
  Angular application; Angular Elements is permitted but not adopted without a
  documented milestone need.
- 2026-10-28: "Use the insurance-portal for verification wherever possible and
  meaningful."
- 2026-10-28: add a consolidation milestone after the tooling item. "By
  *improves*, I mean *harden* and stabilize. Their implementation was
  orchestrated by the less capable and reliable Poolside Laguna S 2.1 model."
