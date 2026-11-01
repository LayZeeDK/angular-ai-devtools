# Intent — Angular AI DevTools

Lane: milestone

Review panel: off

Finding skeptics: off

Surfaces: DevTools panel

## Summary

The first release's product work is shipped (N1, N2, N3, N4, N24, N25 all answer in the
DevTools panel). What is left is bookkeeping that has already started to rot: a docs audit
regenerated at M014's base still records one stale claim about an external commit, four
deferred alignment rows wait in the queue, the interop map row was only just repointed at the
in-repo fixture, one route test cannot tell `/stale-view` from `/stale-view-deferred`, and the
panel build warns about a budget nobody has decided. M015 closes exactly that debt at the
shipped head, so every shipped claim, document and check agrees before the program is called
done.

## Problem

A verification program that has shipped six features but leaves 1 stale document claim, 4
undischarged alignment rows, one non-discriminating test and one undecided build budget has no
single head anyone can cite. The next change re-derives all of it, and the drift is
indistinguishable from a real defect. The cost lands on whoever reads the audit next.

## Users

The repository owner, working alone with an agent orchestrator. The reader of the archive and
of the docs audit is the next milestone's orchestrator, which has no memory of this one.

## Success criteria

1. A regenerated docs audit at the milestone head records zero `stale` and zero `aspirational`
   claims, and no M014 `fix-doc` row is left `planned: no`.
2. `verify-ai-browsers`' `interop` row names `spikes/ng222-app`'s `/stale-view-deferred` fixture,
   its fingerprint reads fresh at the milestone head, and `checks/interop.mjs` still exits 0 on
   a named instance with the committed lars-verify verdict of `verified`.
3. `spikes/ng222-app/src/app/app.routes.test.mjs` fails when the `/stale-view` assertion is given
   the deferred route's name, and passes as written.
4. `npx nx run angular-ai-devtools:build-extension` emits no bundle-budget warning, or the
   accepted overage is recorded with its measured size and reason.
5. The project Verify (`npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`)
   passes at the shipped head and the skills mirror test is green.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | empty | held-out | A document with no testable claim must land in `## Descriptive docs`, never be dropped or duplicated; the assembled gate rejects a missing or extra section, and `gsd inspect lint --inventory` re-proves every inventory path is covered exactly once. |
| E2 | SC1 | boundary | criterion SC1 | The audit's `Audited HEAD` must equal the head the milestone ships at, not the inspect-time base; a doc correction changes the head, so the audit is regenerated after the last correction and the shipped audit names the shipped head. |
| E3 | SC1 | idempotency | held-out | Re-running the audit regeneration with no document change leaves the Summary counts identical and adds no second `unchanged:` prefix to a carried row. |
| E4 | SC2 | empty | criterion SC2 | The interop check must fail on an empty slice: at least one sliced node is asserted, so "no nodes found" cannot pass as a green run. |
| E5 | SC2 | precision | criterion SC2 | `.proven.json` records a fingerprint of the feature's own source; a re-record before the last doc or panel edit leaves the fingerprint stale at the head, so the re-record is the last artifact written before the final Verify. |
| E6 | SC3 | adjacency | held-out | `/stale-view-deferred` is a prefix-sibling of `/stale-view`, so the tightened assertion must reject the deferred name while accepting the exact quoted route; a held-out test pins both directions. |
| E7 | SC4 | boundary | criterion SC4 | The budget comparison is at the boundary itself: a measurement below the budget emits no warning, and a measurement at or above it warns; the recorded decision states the measured size and the rule, so the warning can never be silenced by wording. |
| E8 | SC4 | precision | criterion SC4 | The budget and the measurement are in kB with two decimals; the decision records both, so a later reader can tell growth from a rounding difference. |
| E9 | SC5 | none | dismissed | The project Verify aggregates the other criteria's checks and carries no data shape of its own. |
| E10 | SC2 | concurrency | dismissed | The check drives one named instance at a time and the registry serializes instance access; the milestone adds no parallel drive. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | make a document pass by deleting the claim instead of correcting it | judgment | The reviewer reads each entity diff: a corrected sentence that still states the fact is fine; a deleted paragraph that removes the claim is not. |
| N2 | SC1 | mark a claim `verified` on evidence that lives in the audited document itself | judgment | Every row the milestone touches cites code, config, a test, a command result or git history; a row citing only its own document is a defect. |
| N3 | SC2 | loosen `checks/interop.mjs` so it exits 0 | criterion SC2 | Its assertions stay byte-identical except for the fixture route it drives; a diff to an assertion is a scope breach. |
| N4 | SC3 | weaken the route test so it accepts both route names | criterion SC3 | The held-out direction exists precisely to reject a test that matches the deferred name. |
| N5 | SC4 | raise the budget to silence the warning without recording the measured size and a reason | criterion SC4 | The recorded decision names the measured size, the previous budget and the one-line reason. |
| N6 | SC5 | skip a failing check, or record a check as passing without its exit code | judgment | The Verify ledger entry names the command and its exit code; a green claim with no ledger entry is a defect. |

## Scope: in

- Discharge the four M014-deferred `fix-doc` rows (research/10 grader regex and port list,
  research/11 S1 runner, spikes/ng222-ssr README Vitest) so no released note states a retired
  fact, and record their disposition in the audit's `## User rulings`.
- Correct the one stale claim the regenerated audit found:
  `.claude/skills/control-pangular-inspector/SKILL.md`'s "portal worktree has this setup
  committed (f102b97)".
- Keep the `verify-ai-browsers` map row for `interop` true to the in-repo `/stale-view-deferred`
  fixture and re-record its provenance at the milestone head.
- Tighten `spikes/ng222-app/src/app/app.routes.test.mjs` so the `/stale-view` assertion cannot
  match the deferred route.
- Decide and record the panel bundle budget (518.80 kB against a 500 kB budget) so
  `build-extension` emits no unexplained warning.
- Regenerate the docs audit at the new head and drive the alignment queue to zero.
- Keep the two skills trees byte-identical and the project Verify green.

## Scope: out (vetoes)

- New panel features, new tabs, or any behaviour change to a shipped explainer.
- Portal source changes beyond the dev-only provider file the charter allows.
- Touching archived audits or archived milestone records.
- Loosening a check or a test so it passes.

## Constraints

- Stack: TypeScript 6.0.x (pinned), Nx 23.3, Angular ~22.1 for the extension workspace; supported
  inspected apps are Angular 22.2 dev builds.
- `npm run check`, `npm test` and `npx nx run angular-ai-devtools:build-extension` must pass at
  every ship; the sidecar dependency bridge is used for worktree checks.
- Verification policy: `lars-verify` turns a claim into exactly one verdict; only `verified`
  counts as proof and its `verdict.json` is cited by wave and final review.
- Supported browser/model pairs: `chrome-stable-nano`, `chrome-beta-gemma4`, `edge-dev-aion`,
  `edge-phi4mini`, each in its own profile; Edge Dev stays pinned to the measured Aion pair.
- Model policy: free routes only. `reflection/beam:free` at high effort is the recorded default
  for every role; a route that returns a zero-token run is a quota event, and the run moves down
  the ladder rather than counting a failed attempt.
- GSD Path: the milestone lives on `gsd-path/M015`, ships through one archive and one annotated
  `milestone/015-program-closeout` tag, and integrates into `main` in direct mode.
- No model name appears in a commit message, and no work address or domain is written anywhere.

## Current state (brownfield only)

- **What exists**: an Nx 23 monorepo (TypeScript 6.0.3, Angular ~22.1) whose product is an MV3
  extension plus an Angular DevTools panel, with six shipped explainers reachable from routed
  panel pages; `extension/manifest.json` is v0.3.0 with `devtools_page devtools.html`, a module
  service worker and `relay.js`/`agent-main.js` content scripts. Verification lives in
  `.commandcode/skills/` (`control-*`, `verify-*`, `lars-*`) with byte copies of exactly two
  skills under `.claude/skills/`. Buildable and tested: `npm run check`, `npm test`,
  `build-extension`, plus per-skill node:test suites.
- **Must not break**: the six shipped explainers' panel behaviour; the `control-*`/`verify-*`
  skill contracts; the byte-identical mirror for `control-ai-browsers` and `verify-ai-browsers`
  (pinned by `scripts/skills-mirror.test.mjs`); the `spikes/ng222-app` and `spikes/ng222-ssr`
  fixtures, including both stale-view fixture routes.
- **Doc-vs-code rulings**: queue row 237 — `.claude/skills/control-pangular-inspector/SKILL.md`
  claims the portal worktree has setup committed at `f102b97`; the portal checkout's git log has
  no such commit, so reality is right and the document is corrected (`fix-doc`). Ruled as a
  delegated decision under the standing grant recorded under `## Corrections`.
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- A doc correction can look like a product change; the audit's own claim check decides which side
  is wrong.
- The bundle budget lives in `apps/angular-ai-devtools/project.json`, a build configuration with
  its own doc coverage.
- Re-recording provenance before the final doc edit leaves the entry stale at the shipped head.
- The M014 audit marked many claims `unverifiable`; re-deriving them can grow this milestone
  beyond closeout.

## Open questions

- [RESEARCH] Which `unverifiable` M014 audit rows are now decidable with the commands the repository already ships, and which need evidence this milestone cannot produce?

## Corrections

- 2026-11-01: standing grant recorded from the owner's instruction, verbatim: "A fresh session
  should be able to run `/gsd-path @ ~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md`
  to complete M015 end-to-end without a human-in-the-loop, with full milestone decision
  authority." Recorded with `gsd.bat preapprove --grant intent,plan,rulings,ship`.
- 2026-11-01: **delegated ruling** (under that grant) for DOCS-AUDIT queue row 237: `fix-doc`. The
  document `.claude/skills/control-pangular-inspector/SKILL.md` asserts the portal worktree has
  its setup committed at `f102b97`; `git log` in the portal checkout
  `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools` holds no such
  commit, so reality is authoritative and the document is corrected in place. Recorded in
  DOCS-AUDIT.md `## User rulings` as `planned: no` until the task lands it.
- 2026-11-01: **delegated ruling** (under that grant) for the M014 deferred rows 155, 156 and
  158: `fix-doc`, already discharged in `2c97f69`; the regeneration re-derives them `verified`
  and no correction remains owed. Their audit rows are marked `planned: yes (2c97f69)`.
- 2026-11-01: **delegated ruling** (under that grant) for row 143: `accept-drift`, unchanged — a
  dated handoff record naming head `fbe3aac` "at writing" is history, not a current claim.
