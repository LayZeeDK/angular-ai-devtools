# Intent — Angular AI DevTools — M009 consolidation-hardening

Lane: milestone

Review panel: off

Finding skeptics: off

Surfaces: DevTools panel

## Summary

M009 hardens and stabilizes everything shipped in M001-M007 without adding a
feature or redesigning anything. It fixes defects in the extension contexts,
panel components, MAIN-world tracers, prompt/fact-list plumbing and their tests,
removes dead code, strengthens assertions, steadies error paths and
model-dependent behavior across the four supported model pairs, retires unused
spike trees once their evidence is archived, and aligns docs with the code. The
proof is unchanged panel behavior on all four pairs plus a green, non-vacuous
suite.

## Problem

N1 (change-detection causality), N2 (signal provenance), N3 (DI doctor) and the
M002/M003 tooling were orchestrated by a less reliable model, so latent defects,
inconsistent patterns and thin assertions are expected: one test is vacuous
(`src/regression.spec.ts` asserts `true`), the E2E surface is a single spec, and
the docs audit finds stale claims about shipped tooling. Left alone, these make
green checks a weak signal for the remaining N4/N24/N25 milestones.

## Users

Lars, and any Angular developer using the "Angular AI" DevTools panel. They are
technical, run the panel against a dev-mode Angular 22.2 app, and rely on the
panel answering locally; a hardened build must not change what they see.

## Success criteria

1. Every defect found by the hardening review is fixed or explicitly accepted with a written reason.
2. `npm run check` and `npm test` pass with no skipped tests, and the skills-mirror parity test passes.
3. The N1, N2 and N3 flows still answer in the DevTools panel on all four supported model pairs, each with a `lars-verify` verdict of `verified`.
4. Where meaningful, the same claims are also verified on the insurance-portal fixture, and the claim records that external dependency.
5. Unused spike trees are retired only after their evidence is archived, with no in-repo reference left broken.
6. No new feature and no public behavior change is introduced.
7. Each of M001-M007 has a `lars-review` specification with a frozen range, file scope, focus areas, and acceptance.
8. Multiple `lars-review` rounds ran over those specifications; every verified blocking finding is fixed or explicitly deferred with a written reason, and the checks pass after the fixes.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | empty | held-out | A specification may yield zero defects. That is recorded as "no defects found" with the reviewed range and HEAD; it is not evidence for SC7 or SC8 by itself. |
| E2 | SC1 | boundary | criterion SC6 | A defect whose only fix changes public behavior is out of scope: fix it without behavior change, or accept it with a written reason and land it in a later milestone. |
| E3 | SC2 | boundary | held-out | Zero skipped tests. `npm test` must report 0 skipped and 0 todo; a skip is a failure even when the command exits 0. |
| E4 | SC2 | idempotency | held-out | `npm run check` and `npm test` run twice in a row yield the same pass counts and leave tracked files unchanged. |
| E5 | SC3 | empty | held-out | When a model pair cannot run, its claim records `unverifiable` with the reason; it is never reported as `verified`, and SC3 is not met until all four pairs answer. |
| E6 | SC4 | empty | held-out | When the insurance-portal checkout is absent, the claim records the external dependency and stays `unverifiable` here; it never silently counts as verified. |
| E7 | SC5 | ordering | held-out | A spike tree is retired only in a commit that follows the commit archiving its evidence; the archive commit is an ancestor of the retirement commit. |
| E8 | SC5 | adjacency | held-out | `spikes/ng222-app` and `spikes/ng222-ssr` are never retired: the charter keeps both as verification fixtures. |
| E9 | SC6 | none | dismissed | SC6 is a prohibition-shaped criterion with no data shape; N2 carries the check. |
| E10 | SC7 | empty | held-out | A milestone with no product diff (for example M002) still gets a specification with its frozen range and a written "no product code" focus. |
| E11 | SC8 | idempotency | held-out | Re-running `lars-review` on the same frozen range after fixes reports no new verified blocker, and an unchanged range yields the same verdict set. |
| E12 | SC8 | concurrency | held-out | Fixes and reviews are sequenced: `lars-review` runs only on a clean product worktree, and no fix task is open while a review round runs. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC2 | make the suite green by deleting, skipping, or weakening a test | judgment | The reviewer diffs test counts and names any removed or skipped test; removal needs an accepted reason. |
| N2 | SC6 | ship a new capability or a public behavior change under the label of a fix | judgment | Every changed public behavior is listed in the task Log as an accepted defect or reverted. |
| N3 | SC3 | send page data to a cloud model or change the panel security model to make a check pass | judgment | The panel stays panel-local Prompt API; no page or content-script Prompt API and no new host permission. |
| N4 | SC5 | retire a spike tree before its evidence is archived, or leave a broken in-repo reference | criterion SC5 | SC5 already states the rule; E7 and E8 pin the ordering and the fixtures. |
| N5 | SC1 | record a defect as fixed without either a fix commit or a written acceptance | judgment | Each finding row names its fix commit or its acceptance reason and who accepted it. |
| N6 | SC4 | report a portal claim as verified when the portal checkout was absent | judgment | The claim names the checkout path, and the verdict stays `unverifiable` without it. |
| N7 | SC7 | write a specification from memory instead of a frozen SHA range | judgment | Every specification opens with its base..head SHAs and the files it covers. |
| N8 | SC8 | average away, silently drop, or defer a verified blocking finding without a written reason | judgment | Each blocking finding is fixed, or deferred with a written reason listed in the milestone record. |

## Scope: in

- Defect review and fixes across the extension contexts, panel components, MAIN-world tracers, prompt/fact-list plumbing and their tests.
- Dead code removal and assertion strengthening; no skipped or vacuous tests.
- Stabilization of error paths and model-dependent behavior across the four supported model pairs.
- Review of the M002/M003 tooling and installer drift.
- Retirement of unused spike trees once their evidence is archived.
- Doc alignment for changed behavior.
- Author one `lars-review` specification per shipped milestone M001-M007: a frozen base..head range, file scope, focus areas, and acceptance.
- Run multiple `lars-review` rounds against those specifications and resolve every verified blocking finding inside this milestone, repeating the panel on the changed range after fixes.

## Scope: out (vetoes)

- No new features and no redesign.
- No changes to the supported-app contract or the panel security model.
- No Tier 2 opt-in features.
- No code generation.
- Do not break the shipped N1, N2 or N3 panel flows, extension messaging, tab filtering, or the `build-extension` output.
- Do not retire `spikes/ng222-app` or `spikes/ng222-ssr`; the charter keeps both as verification fixtures.
- Do not make a model name appear in a commit message, and do not write an employer address or domain anywhere.

## Constraints

- Stack: TypeScript 6.0.x, Nx 23.3, Angular ~22.1 in the extension workspace; inspected apps are Angular 22.2 dev builds.
- Every check runs in a task worktree with the sidecar dependency bridge; `npm run check`, `npm test` and `npx nx run angular-ai-devtools:build-extension` must pass.
- Verification: `control-ai-browsers` drives the four model instances; `lars-verify` turns a claim into one verdict; only `verified` counts, and its `verdict.json` is cited by wave and final review. End-to-end coverage must include Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.
- `lars-review` is read-only and needs a clean product worktree, so fixes and re-review are sequenced, not interleaved.
- Model policy: free routes only. Reviewers and coders run `reflection/beam:free`; Laguna S 2.1 is never dispatched as a child. Paid routes only on explicit approval.
- GSD Path: work lives on `gsd-path/M009`, ships through one archive and one annotated tag, and integrates into `main` in direct mode.

## Current state (brownfield only)

- **What exists**: an Nx 23 workspace with an Angular ~22.1 app emitted as the MV3 DevTools extension panel (`extension/` plus `apps/angular-ai-devtools`), shared TypeScript in `src/panel` and `src/main-world`, tooling in `scripts/`, control/verify skills under `.commandcode/skills` with byte copies under `.claude/skills`, and four spike trees. Baseline at `2bd0eef` is green: 522 tests pass and both type checks pass.
- **Must not break**: the N1/N2/N3 panel flows on all four model pairs, extension messaging, tab filtering, the skills-mirror parity rule, and `build-extension`.
- **Doc-vs-code rulings** (recommended, awaiting the approval reply):
  - health-check docs say the doctor prints sixteen check lines; the SKILL.md table lists 19 → `fix-doc` (both copies).
  - Pangular SKILL.md cites `control.mjs:73` for the default port; the default is on line 74 → `fix-doc` (both copies).
  - `pstack-models.md` uses hyphenated `laguna-s-2-1-free`; the canonical id is `poolside/laguna-s-2.1-free` → `fix-doc`.
  - `nx-plugins` SKILL.md prescribes `pnpm nx list` / `pnpm nx add` in an npm repository → `fix-doc`.
  - `research/00-browser-probe.md` records the Phi-4-mini instance as stuck; a later measurement shows it available on GPU → `fix-doc`.
  - `docs/feature-proposals.md` treats `provideAiDevTools()` as an export; it is a proposal, not shipped → `accept-drift`.
  - `.commandcode/taste/angular/taste.md` says the extension must be Angular; the panel is Angular and is emitted into `extension/panel`, so the claim stands although `extension/` holds no `@angular/core` source → `accept-drift`.
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`.

## Risks

- The shipped code was orchestrated by the less reliable Poolside Laguna S 2.1 model, so latent defects and inconsistent patterns are expected.
- Shared MAIN-world and panel plumbing means a fix can regress N1, N2 or N3.
- Test coverage may be thinner than a green suite suggests; one test is vacuous today.
- Per-milestone ranges depend on ship and merge SHAs recorded in the archives and git history; a range can be ambiguous or overlap a later fix.
- `lars-review` is read-only and requires a clean product worktree, so fixes and their re-review must be sequenced, not interleaved.

## Open questions

None. The three brownfield questions were resolved at approval and are recorded under Corrections.

## Corrections

- 2026-10-28: "Approve" — accepted every presented edge and prohibition ruling, every doc-vs-code ruling (fix-doc for queue 1, 39, 76, 78, 109, 159, 160 and 185; accept-drift for 165 and 180), and the open-question recommendations: keep `spikes/probes` and both ng222 fixtures, retire `spikes/s1-extension` only after its evidence is archived and only if no test references it; remove `src/regression.spec.ts`; add no root README this milestone.
