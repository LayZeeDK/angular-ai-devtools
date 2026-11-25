# Charter — Angular AI DevTools (first release)

<!-- Written by /gsd-path-define program mode. Enduring program intent:
     vetoes and constraints here override every milestone. Amended only by an
     explicit user ruling recorded under Corrections. Lives at .project/
     top level and persists across milestones; it never archives. -->

Review panel: off   <!-- off | detected | claude,gpt,grok,composer,gemini,
                      deepseek,kimi,qwen — durable program default. Recorded
                      off until the installer's guarded family patch lands; it
                      adds beam, glyph, crouton and glm, which this host's routes
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
  adaptation to add the `beam`, `glyph`, `crouton` and `glm` review-panel families
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
- Supported browser/model pairs: `chrome-stable-nano` (Gemini Nano),
  `chrome-beta-gemma4` (Gemma 4), `edge-dev-aion` (Aion-1.1-Instruct) and
  `edge-phi4mini` (Phi-4-mini), one pair per model with the stable channel
  preferred, each in its own profile under `.browsers/` on D:. Edge Dev stays
  pinned to Aion model 2026.10.15.1, runtime 2026.10.12.1 and manifest
  2026.10.19.1, the pair measured serving on Edge Dev 158.
- Portal verification: every feature whose facts an insurance-portal route can
  produce gets a portal-backed `lars-verify` verdict at the wave gate, driven
  through `control-angular-dev-app` with the extension and panel active. The
  portal gains no new features, so its relevance map is static. Never change
  insurance-portal source; the only permitted setup is a dev-only provider file
  and the dev build configuration that loads it.
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
- Model policy: free routes only. `inspect_codebase`, `inspect_docs`, `docs_audit`,
  `research`, `reviewer`, `decide`, `roadmap`, `plan`, `plan_patch` and `coder` run
  `reflection/beam:free` at high effort (measured 2026-10-28: low effort produced
  wrong dates, degenerate docs audits and two-finding maps; Glyph Cluster failed
  every run). High is the deliberate ceiling: xhigh and max added advisory depth
  at several times the tokens without better recall. On Command Code the subagent
  type pins model and effort, so this file records intent; the dispatch table in
  the user-scope rules is what binds a run.
- Delivery surfaces: the extension panel is the only product surface. The
  standalone `build`, `serve` and `serve-static` targets remain a developer and
  test surface only, and no milestone targets the standalone app. Angular
  Elements stays permitted but is not used unless a milestone documents the need.
- No model name appears in a commit message, and no work address or domain is
  written anywhere.
- Cross-model review: `Review panel:` stays `off` until the installer's guarded
  patch adds the free and paid families; then `detected` and named panels work.
  Free default: measure and evaluate the free routes available at the time -- Beam
  1.0, Glyph Cluster and Crouton Alpha -- for the review at hand and use the
  measured winner. Crouton Alpha is the only free route with image input and is
  used for rendered-pixel checks and bounded sub-tasks, never as the planning
  seat. Paid, only on opt-in or explicit approval, and never the parent's family:
  DeepSeek V4.1 Flash as parent uses GLM-5.3 Flash; GLM-5.3 Flash as parent uses
  DeepSeek V4.1 Flash. A panel names at most three families, and the resolver
  always skips the parent's family.
- 2026-11-05: Poolside Laguna S 2.1 free was withdrawn by the provider and is
  removed from the roster, the free-route ladders and the subagent types. The free
  routes are now Beam 1.0, Glyph Cluster and Crouton Alpha (the only free route with
  image input). The paid ladder and the "never the parent's family" rule are
  unchanged. The dated entries above that name Laguna are kept as written.

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

- [RESOLVED 2026-11-01: the optional review panel stays off. The paid per-role split
  in `.project/model-policy.json` is the binding policy — DeepSeek V4.1 Flash for
  tool-loop roles, GLM-5.3 Flash for `reviewer`, `skeptic` and `review_panel` — so a
  verdict never shares the producer's family. Recorded under Corrections.]
- [RESEARCH] Which N24 and N25 detections are provable from `ng.ɵgetSignalGraph` and the source-text write scan on the counter fixture, and which need new instrumentation?

## Corrections

<!-- Verbatim user rulings that amend this charter. Append-only. -->
- 2026-11-20: programme 2 · Generation 3 remainder admission. The twelve Generation 3
  entries the 2026-11-14 Correction carried are admitted as the next generation, and
  enter `Full scope: in`: `M057 tutor-signals`, `M058 tutor-routing`, `M059
  teardown-leak`, `M060 error-routing`, `M061 locale-correctness`, `M062
  outlet-explainer`, `M063 guard-phase`, `M064 lazy-chunk-failure`, `M065
  title-input-binding`, `M066 schema-disabled-hidden`, `M067 formfield-binder`, `M068
  head-state`. This is the `angular/components`, blocks and tutor work A5 kept out of
  the core programme: the entries read the Material, CDK and Signal Forms surfaces as
  their subject, and no panel surface adopts those packages here. Numbering continues
  from M056 and never restarts (backlog §2). The backlog's remaining Generation 3
  milestone, `error-channel-map`, carries to the next generation, again by the
  twelve-entry cap — the Generation 3 tail was thirteen entries, not twelve.

  **Consequence recorded, not decided.** A10 places the design system immediately
  after the `angular/components` work. That work now ends with `M068 head-state`, so
  the design-system generation follows this one unless the next roadmap approval
  reorders it. This Correction does not move A10; it records where the cap has put it.

- 2026-11-25: programme 3 · Generation 4 admission (design system and Storybook).
  The generation A10 placed immediately after the `angular/components` work is
  admitted, and its twelve entries enter `Full scope: in`: `M069 ds-tokens`, `M070
  ds-explainer-shell`, `M071 recordings-manifest-truth`, `M072 ds-services`, `M073
  ds-harnesses`, `M074 ds-playwright`, `M075 storybook-story-index`, `M076
  storybook-story-gap`, `M077 storybook-story-explain`, `M078 ds-story-variants`,
  `M079 cap-1-capability-guidance`, `M080 show-1-showcase-stories`. The design
  system is a subset bounded by shipped use (A11), not a component library: it ships
  the tokens, the explainer shell the six surfaces already repeat, the presentational
  services they need, the two harnesses they claim, and the Playwright proof a
  browser outside DevTools can carry. The Storybook work is the tool's own feature
  set for browsing a Storybook application (§6.2), and the design system's Storybook
  hosts the six panel surfaces as showcase stories, so each reviews the other. The
  owner's instruction of 2026-11-25 fixed the ordering: the design-system subset is
  the first entries of this generation, and the Storybook-browsing features follow
  inside it.

  **Inserted at admission, not planned in advance.** `M071
  recordings-manifest-truth` is a measured repair, not new product work: M068 found
  that `scripts/recordings.json` names a suite that writes a different record for
  the `m055` map, and that `m057-record-shapes.json` is the last map with no armed
  writer. A cross-family consultation on 2026-11-25 held that the first is a check
  plus a one-row edit and the second is work, so both are one entry rather than two.
  It sits third, after the two entries that establish the design system.


- 2026-11-14: programme 2 · Generation 3 admission. Generation 2 (M032-M043) is
  closed with all twelve entries shipped, integrated, tagged and archived, and a
  two-arm `lars-review` panel has reviewed each of the twelve individually.
  **Generation 3 — interaction, agent interop, blocks**, twelve entries M044-M055,
  enters `Full scope: in`:

  - `M044 gate-integrity` — the review's four verified blocking findings and the
    three deterministic checks that would have caught three of them: a test resolving
    a `.project/` path the same commit archives (M040, M042), a task log claiming a
    file change the range never made (M035), and a pin fed an event composition the
    app never produces (M041). It runs before any feature work because every one of
    those shipped green.
  - `M045 console-read` — carried from Generation 2, whose §2 twelve-entry cap left
    it over.
  - `M046-M055` — `copy-to-agent`, `component-search`, `ui-copy-check`,
    `interaction-story`, `dead-click`, `what-changed`, `webmcp-audit`,
    `webmcp-rehearsal`, `visual-qa`, `tutor-foundations`.

  Numbering continues from M043 and never restarts (backlog §2). The backlog's
  remaining eleven Generation 3 milestones — `tutor-signals`, `tutor-routing`,
  `teardown-leak`, `error-routing`, `locale-correctness`, `outlet-explainer`,
  `guard-phase`, `lazy-chunk-failure`, `title-input-binding`,
  `schema-disabled-hidden`, `formfield-binder`, `head-state` and
  `error-channel-map` — carry to the next generation, again by the twelve-entry cap.

  **Consequence recorded, not decided.** A10 placed the design system immediately
  after the `angular/components` work, which was Generation 4. Splitting Generation 3
  means that work now spans two generations, so the design system would sit at
  Generation 5 unless the next approval reorders it. This Correction does not move
  A10; it records that the cap has pushed it, so the next roadmap approval decides
  the order with that fact in front of it.
  - 2026-11-05: programme 2 · Generation 2 admission. Programme 1 (Generation 1,
    M018-M031) is closed with all twelve backlog goals shipped and archived.
    **Generation 2 — core explainers (batch 3)**, twelve entries M032-M043, enters
    `Full scope: in`. The backlog's thirteenth entry, `console-read`, is carried to
    the next generation because §2 caps one roadmap approval at twelve entries.
    Numbering continues from M031 and never restarts (backlog §2). A3's programme
    order is unchanged. Spike gates carried in: S9 for M037 signal-forms-doctor,
    S10 for M042 error-boundary.
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
- 2026-10-28: "We shouldn't use Laguna as coder, we should use Beam 1.0 Free."
  Coders run `reflection/beam:free`; Laguna is never dispatched as a child.
- 2026-10-30: "Option 1 but don't change insurance-portal except for example to
  add our runtime providers. Prefer a new small app or route in the app with the
  counter." The counter fixture may carry one dev-only route that exhibits a
  plain field written in a subscribe callback, for verification only; the
  insurance portal gains nothing beyond runtime providers.
- 2026-11-01: the `Model policy: free routes only` paragraph under Constraints is
  superseded. Owner's instruction, verbatim: "paid-* subagents only (the free-*
  models have reached their daily quota except for Poolside Laguna S 2.1)". The
  binding policy is `.project/model-policy.json`: `deepseek/deepseek-v4.1-flash`
  for every tool-loop role and `z-ai/glm-5.3-flash` for `reviewer`, `skeptic` and
  `review_panel`, so a paid verdict never shares the producer's family. Commit
  `395d1c7` (`build: pin paid model policy per role`) is the change this records;
  the Constraints paragraph stays as written because charter text is amended only
  here.
- 2026-11-01, programme 1 opens. The following rulings were approved in session and
  are recorded here for the first time; the milestone backlog and delivery
  structure they govern are persisted at
  `plans/angular-ai-devtools-program-backlog.md` (commit `8827469`).
- 2026-11-01 (A1): the veto "No Tier 2 (app opt-in `globalThis` export) features in
  this program" is lifted. Owner: "All tiers are on the table." Tier 2 features are
  permitted, including an app-installed `provide*()` instrument.
- 2026-11-01 (A2): the verification fixtures may be modified for the Vitest Browser
  work — the attach configuration and a timing-demo route. This narrows the
  "the counter fixture is never modified to help a feature" clause to everything
  except those declared verification surfaces.
- 2026-11-01 (A3): programme order is core, Storybook, angular/components,
  Angular SSR (+ Analog.js), NgRx, RxAngular.
- 2026-11-01 (A4): N34-N37 count as first-party because `@angular/build:unit-test`
  ships them. Owner: "I don't mean 3rd-party tooling like Vitest in Browser mode,
  especially not when it's officially supported by `@angular/build`, a 1st-party
  package."
- 2026-11-01 (A5): Angular SSR and `angular/components` are out of the core
  programme; SSR moves to programme 4 and components to programme 3.
- 2026-11-01 (A6): tool calling in the core loop is permitted, as required by the
  tool-registry envelope.
- 2026-11-01 (A7): the `debugger` permission is granted, for the CDP trace and the
  accessibility tree.
- 2026-11-01 (A8): `@angular/cdk` component harnesses are excepted from the
  `angular/components` exclusion, for the testing feature suite.
- 2026-11-01 (AR-1): the panel is already an Angular application
  (`apps/angular-ai-devtools`, `projectType: application`, `build-extension` to
  `extension/panel`, `baseHref: /panel/`). No migration milestone exists; the panel
  adopts the design system in place. The initial-bundle budget of 520 KB is binding.
- 2026-11-01 (AR-2): in-page UI is a named exception to "implemented in Angular":
  plain DOM, closed Shadow DOM, isolated world, no Angular in the inspected page.
  The in-page surface is one widget — a rect/label overlay plus an element picker.
- 2026-11-01 (AR-3): the overlay is the only DOM the tool adds to an inspected page.
- 2026-11-01 (AR-4): every `MutationObserver` the tool owns excludes the tool's host
  subtree; the host attaches once at `document_start`.
- 2026-11-01 (AR-5): cross-frame outlining is a non-goal for v1.
- 2026-11-01 (AR-6): confirmations, toasts, inputs and navigation live in the panel,
  never in the page.
- 2026-11-01 (AR-7): the panel doubles as a self-inspection fixture, served at
  `/panel/`.
- 2026-11-01 (delivery): programmes are charter labels and roadmap `Programme:`
  labels, not separate project roots. One `.project/`, one roadmap, grown by
  successive re-slices in generations of at most 12 entries, with pending entries
  never reaching zero before the final programme ends.
- 2026-11-01 (programme 1 scope): the `Full scope: in` bullets above are satisfied
  in full by M001-M017 and remain closed. This ruling **extends** `Full scope: in`
  with programme 1 ("core"), so the roadmap gate's charter-to-milestone bijection
  holds for the new generation. Programme 1's admitted scope, in roadmap order:
  - a tool registry with an app-facts support check, six hostile tool shapes, and
    the DOM role/name computation (`instrument-core`);
  - the context budget, worker, ring buffer and background-job machinery;
  - N18 feature fingerprint and the context chip;
  - the Tier-2 opt-in package and its vetted symbol table;
  - the in-page overlay — the only DOM the tool adds to an inspected page;
  - Aria/CDK/Material surfaces in the verification fixtures, including a
    deliberately ambiguous harness target;
  - project Verify breadth: type-check the panel and the extension in
    `npm run check`;
  - the core explainer families N5, N7-N23, N27-N37 and the COM, COR, RTR, FRM,
    PBR, PSR, SWK, ELM, DEF, HYD, ANI, CF, FOR, SUB and BND feature prefixes, with
    N34-N37 admitted under A4 and `@angular/cdk/testing` under A8;
  - the opt-in instrument taps, each landing with the milestone it upgrades.
  The ordered milestone list, the family prefix registry and the spike ledger are
  `plans/angular-ai-devtools-program-backlog.md` (commit `8827469`). Angular SSR
  belongs to programme 4 and `angular/components` to programme 3 (A5); neither is
  in programme 1's scope.
- 2026-11-01 (standing autonomy grant): owner's instruction, verbatim: "Prepare
  the repo so that the next, fresh session just needs to run `/gsd-path @
  C:\Users\LarsGyrupBrinkNielse\.commandcode\prompts\deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md`
  to run all the way through shipping the next milestone." This grants the intent,
  plan, rulings and ship gates for the next milestone; recorded with
  `preapprove --grant intent,plan,rulings,ship` while `STATE.milestone` is null.
