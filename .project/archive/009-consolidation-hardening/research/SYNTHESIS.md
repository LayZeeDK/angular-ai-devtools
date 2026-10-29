# Synthesis — M009 consolidation-hardening

<!-- Written by the plan phase (milestone mode). Records exactly which program
     decisions the milestone plan was built against. Settled only: program
     decisions, charter constraints, and the roadmap entry's success criteria.
     No invented decisions and no runner-ups. -->

## Settled

- Hardening only: fix defects, remove dead code, strengthen assertions, steady
  error paths and model-dependent behavior across the four supported pairs; no
  new feature and no public behavior change (ROADMAP.md M009 `Scope: out`;
  INTENT.md SC6 and Prohibitions N2).
- Scope is the extension contexts, panel components, MAIN-world tracers,
  prompt/fact-list plumbing and their tests, plus the M002/M003 tooling and
  installer drift, doc alignment for changed behavior, and retirement of unused
  spike trees (ROADMAP.md M009 `Scope: in`; INTENT.md `Scope: in`).
- One `lars-review` specification per shipped milestone M001-M007, each with a
  frozen base..head range, file scope, focus areas and acceptance, and multiple
  `lars-review` rounds over them with every verified blocking finding fixed or
  deferred with a written reason (ROADMAP.md M009 SC7-SC8; INTENT.md SC7-SC8,
  E10-E12).
- Proof is `lars-verify` verdicts: N1, N2 and N3 still answer in the DevTools
  panel on Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct; the
  insurance-portal fixture is used wherever meaningful and the claim records
  that external dependency (CHARTER.md Verification policy and Constraints;
  ROADMAP.md M009 SC3-SC4; INTENT.md E5-E6, N3, N6).
- The baseline stays green with zero skipped and zero todo tests and the
  skills-mirror parity test passing: `npm run check`, `npm test`,
  `npx nx run angular-ai-devtools:build-extension` (ROADMAP.md M009 SC2;
  INTENT.md E3-E4, N1; CHARTER.md Codebase).
- The vacuous `src/regression.spec.ts` is removed rather than repaired
  (INTENT.md Corrections, 2026-10-28).
- Spike fixtures: `spikes/ng222-app` and `spikes/ng222-ssr` are never retired;
  `spikes/probes` is kept; `spikes/s1-extension` may be retired only after its
  evidence is archived and only if no test references it (CHARTER.md
  Corrections; INTENT.md E7-E9, N4, Corrections).
- Doc-vs-code rulings: the eight `stale` audit rows are `fix-doc`, in both
  skill copies where they are mirrored; the two `aspirational` rows 165 and 180
  are `accept-drift` and are recorded as accepted (INTENT.md Corrections and
  Current state; research/DOCS-AUDIT.md).
- Free model routes only; Poolside Laguna S 2.1 is never dispatched as a child;
  `review_panel: off` and `finding_skeptics: off` (CHARTER.md Constraints;
  INTENT.md header).
- GSD Path: work stays on `gsd-path/M009`, ships through one archive and one
  annotated `milestone/009-consolidation-hardening` tag, and integrates into
  `main` in direct mode (CHARTER.md Constraints; STATE.md).

## For the planner

- Walking skeleton: wave 1 authors the seven `lars-review` specifications
  against the frozen `integrate:` ranges and runs the first review round over
  M001-M007, producing the findings artifact that fix work is planned from.
  The next wave fixes the defects already known from INTENT.md and the docs
  audit (vacuous test removal, stale-doc corrections, spike retirement) and
  lands the regression gate. Review-sourced fixes then arrive as appended patch
  waves, and a final wave re-runs `lars-review` over the changed ranges, the
  regression gate and the four-pair panel verification.
- Fix scope from the review round is unknown until that round reports, so wave 1
  must land the specifications and the findings artifact before any task is
  planned from a finding. Because `lars-review` needs a clean product worktree
  (E12), a review round never shares a wave with a fix task, and the two are
  ordered by `deps`, not by narrative.
