# Synthesis

<!-- Written by the decider role. The planner treats Decisions as settled. -->

## Settled

- Program scope — remaining first release N4, N24, N25 plus the tooling item (move `install-*` scripts and tests to `~/.commandcode/scripts/`, extend installer with guarded review-panel family patch) (CHARTER.md Full scope: in).
- Milestone order — tooling first, then N4, N24, N25 (CHARTER.md Corrections, 2026-10-28).
- Product surface — extension panel is the only product surface; standalone target is dev/test only; panel is an Angular application (CHARTER.md Delivery surfaces).
- UI proof — `lars-verify` verdicts through `control-*`/`verify-*` plus e2e across Gemini Nano, Gemma 4, Phi-4-mini, Aion-1.1-Instruct; `lars-maintain-verification` only for drift and never commits under GSD Path (CHARTER.md Verification policy).

## Decisions

### N25 shippable scope

- **Decision**: N25 ships the "what is this node" half only: identify `toSignal.source`/`toSignal.state` nodes and the unlabelled effect whose `debuggableFn` contains `subject.error`, slice their direct producers/consumers from `ng.ɵgetSignalGraph`, and explain the chain. It must state outright that it cannot name the feeding Observable, the operator chain, or emission timing, because no edge crosses the Observable — an intrinsic limit of `ng.ɵgetSignalGraph`, not an implementation gap. Field-to-node attribution is by value comparison and ships as "inferred, untested" wording, never as a confident claim.
- **Runner-up**: Promise full Observable-side causality by adding a Tier 2 app opt-in that re-exports RxJS internals; lost because Tier 2 is out of program scope (CHARTER.md Full scope: out) and the evidence shows the graph itself stops at the Observable with no instrumentation that can cross it.
- **Evidence**: evidence-stack.md § "N25 cannot cross the Observable boundary and needs instrumentation for field mapping"; evidence-capability-map.md § "N25 interop nodes are readable from the graph but Observable-side causality is unprovable"; docs/feature-proposals.md:804,806,809.
- **Confidence**: high

### N24 and N25 milestone split

- **Decision**: Two separate milestones (N24, then N25), not one. They share the Tier 1 graph read and the `debuggableFn` source scan, but their panel findings, tool surfaces, and proof claims differ; sharing instrumentation is implementation reuse, not a shared deliverable. N24's finding is a stale plain field; N25's is an interop node slice. Combining would blur the `lars-verify` verdict per claim.
- **Runner-up**: One combined "RxJS/signal graph" milestone; lost because the charter fixes N24 then N25 order and each needs its own verified claim (CHARTER.md Corrections), and the evidence flags N25's field-to-node mapping as untested, which would drag N24's proof into N25's risk.
- **Evidence**: evidence-domain-decomposition.md § "Ordering facts provable from code vs. judgment"; evidence-capability-map.md § "N25 interop nodes are readable from the graph but Observable-side causality is unprovable"; CHARTER.md Corrections.
- **Confidence**: high

### N4 offline error digest

- **Decision**: Build-time generation, not a vendored trimmed file. The extension build trims `adev/src/content/reference/errors` (22.2.x branch) to one entry per code, capped at 150 tokens, emitting a bundled digest shipped with the extension; only the matching entry reaches the model. The digest keeps the MIT license and Google LLC copyright notice. Code strips the notice from every entry before any text goes to the Prompt API or another built-in AI API.
- **Runner-up**: Vendor a hand-trimmed file in the repo; lost because the source is 95,095 bytes (~24K tokens) across 61 pages and must track the 22.2.x branch; a vendored file would drift and bypass the existing build step, while build-time generation matches the evidence's stated requirement and keeps the digest reproducible.
- **Evidence**: evidence-stack.md § "The offline error digest source is measured and large"; docs/feature-proposals.md:590; evidence-capability-map.md § "N4 error explainer is unbuilt; only primitives and digest inputs exist".
- **Confidence**: high

### Tooling move mechanics

- **Decision**: Move all nine `install-*-command-code.mjs` scripts plus their tests to `~/.commandcode/scripts/`. Tests run via a dedicated npm script glob over `~/.commandcode/scripts/**/*.test.mjs` (not the repo's `scripts/**/*.test.mjs`), since the files no longer live under the repo. Replace the `tsconfig.json` include (which currently lists only `scripts/install-pstack-opencode.mjs`, its test, and `scripts/opencode-pstack-plugin.ts`) with the moved pstack installer paths under `~/.commandcode/scripts/` plus `scripts/opencode-pstack-plugin.ts` retained in-repo as the cross-import target. Update `package.json` test glob and AGENTS.md references (sidecar bridge, skill mirror). Add the guarded review-panel family patch (beam, glyph, laguna, glm) to `scripts/install-gsd-path-command-code.mjs`'s moved copy before `detected`/named panels can express this host's routes.
- **Runner-up**: Keep a thin re-export shim in `scripts/` pointing at the moved files; lost because the charter requires the scripts and tests to leave `scripts/`, and a shim would leave the test glob and tsconfig include pointing at deleted files, re-introducing the drift the move exists to remove.
- **Evidence**: evidence-capability-map.md § "Tooling item touches install scripts, tsconfig, AGENTS, and the guarded installer"; docs/feature-proposals not cited; AGENTS.md:16,37-40; package.json:9; tsconfig.json:5-9.
- **Confidence**: high

### Verification wiring per milestone

- **Decision**: Per milestone: `control-angular-dev-app` serves `spikes/ng222-app`; `control-angular-devtools` and `control-pangular-inspector` drive harnesses; `control-ai-browsers` drives the four model instances; `verify-angular-devtools`, `verify-pangular-inspector`, `verify-ai-browsers` supply fixed checks; `lars-verify` turns each claim into exactly one verdict, only `verified` counts, with `verdict.json` retained as evidence under `.project/` (or the milestone archive). N4's UI claim proved by `verify-angular-devtools` (error explainer panel) + `verify-ai-browsers` e2e across all four models. N24/N25 claims proved by `verify-angular-devtools` (stale-view / interop findings) + `verify-ai-browsers` e2e. Tooling item has no UI claim; proven by `npm run check` and `npm test` plus the skills-mirror parity test. Low-confidence items (N24 generalization beyond direct `this.field =` in `subscribe`; N25 field-to-node value comparison; N25 keep-list classifier) are Verify commands on individual tasks in wave 1, not wave/final gates. Wave gate and final gate run the full four-model e2e only after all task-level verdicts pass.
- **Runner-up**: Run the four-model e2e as a task-level Verify on every task; lost because it multiplies browser runs and the charter reserves end-to-end coverage for wave/final gates, with per-task verdicts carrying individual claims.
- **Evidence**: evidence-domain-decomposition.md § "Panel components and prompt/fact-list plumbing are shared across all features"; CHARTER.md Verification policy; AGENTS.md Browsers and on-device models.
- **Confidence**: high

### N24 detection scope and wording

- **Decision**: Ship N24 on the measured detection only — direct `this.field =` (or `.set`/`.update`) inside a `subscribe` callback on a non-signal plain field, found via the template node's `debuggableFn` source scan, gated on Angular 22.1.3+. Generalization (helper methods, other objects, minified code) and checking whether the template actually reads the field are out of scope for this release; the finding is worded "the template may show a stale value". Per-page scan runs in a worker.
- **Runner-up**: Attempt generalization in the same milestone; lost because the evidence marks it medium confidence and unmeasured, and routing it to wave 1 keeps N24's proof claim tied to the measured detection.
- **Evidence**: evidence-stack.md § "N24 limits are real and need new instrumentation beyond the regex"; docs/feature-proposals.md:795,798.
- **Confidence**: medium

### N25 interop node keep-list

- **Decision**: N25 keeps `toSignal.*` nodes on top of the existing library-internal filter, with an explicit keep-list keyed on label (`toSignal.source`, `toSignal.state`) and on `debuggableFn` source containing `subject.error`. The classifier is specified in the N25 milestone; until measured, field-to-node attribution stays "inferred, untested" in user-facing wording.
- **Runner-up**: Reuse the N2 filter unchanged; lost because the evidence states N2 drops library-internal nodes (about 100 of 107 on the portal graph) and would drop the interop nodes N25 exists to explain.
- **Evidence**: evidence-stack.md § "N25 keeps interop nodes that the N2 library filter drops"; docs/feature-proposals.md:439,809.
- **Confidence**: medium

## For the planner

- **Wave-1 blockers**: (1) N24 generalization beyond direct `this.field =` in `subscribe` plus worker placement of the per-page scan; (2) N25 field-to-node attribution by value comparison and the interop keep-list classifier; (3) N4 build-time digest generation and its 150-token trim step; (4) tooling move's tsconfig include replacement and the guarded review-panel family patch (beam, glyph, laguna, glm) in the installer.
- **Walking skeleton**: tooling milestone first — move scripts/tests, fix test glob, tsconfig include, AGENTS refs, add guarded family patch, verify `npm run check`/`npm test`/skills-mirror pass. Then N4 end-to-end in the panel against `spikes/ng222-app` on one model, then extend to all four. Then N24, then N25, each as its own milestone with a `lars-verify` verdict.
- **Pitfalls → tasks**: N24 "template may show a stale value" wording must not imply the template was checked (task: N24 finding renderer); `angular:signal_graph` strips `debuggableFn`, so N24/N25 must call `ng.ɵgetSignalGraph` directly (task: tracer); N4 digest notice stripped before Prompt API (task: N4 digest builder); tooling move must not leave `scripts/` references in AGENTS.md or tsconfig (task: tooling migration); low-confidence items route to wave 1 Verify commands, not final gate (task: milestone verification plan).

## User rulings

<!-- NEEDS-USER items answered at the synthesis checkpoint. Verbatim-ish. -->
- Paid/non-DeepSeek review-panel family composition → free: Beam and Glyph, measured per review, with Poolside Laguna optional and never the default; paid on opt-in: GLM-5.3 when the parent is DeepSeek V4.1, DeepSeek V4.1 when the parent is GLM-5.3 or Poolside Laguna S 2.1; `Review panel:` stays off until the installer's family patch lands. (Source: CHARTER.md Corrections, 2026-10-28.)

## Still unknown

- Which N24/N25 detections beyond the measured cases need new instrumentation — plan: wave-1 spike (stack/capability-map/domain-decomposition).
- Whether the interop keep-list classifier can be recognised by label or `debuggableFn` source — plan: wave-1 spike (evidence-stack.md § "N25 keeps interop nodes that the N2 library filter drops").