# Intent — Angular AI DevTools

<!-- Written by /gsd-path-define. Every downstream agent reads this first.
     Constraints and vetoes here override everything downstream. -->

Lane: milestone

Review panel: off

Finding skeptics: off

Surfaces: none

## Summary

M016 turned the autonomy lessons of a long orchestration run into one conformance suite, and it
proved the pattern: a rule nobody can test is a rule an installer re-run silently reverts. M017
extends that pattern to the four helper defects M016's run actually hit — a `brief-check` that
never applies the paid effort ladder, a `plan-lint` that rejects a legal `path::test_name`
Held-out form, a `check_handoffs` that cannot read an Intent-coverage row, and a `build_state`
retry that leaves a rejected attempt unparkable — and drains the docs-audit queue to the rows this
repository genuinely cannot decide. The owner also directed this milestone to carry the written
analysis of why a milestone still needs a human, and the user-scope fixes that answer it.

## Problem

A milestone can now run end to end only because an operator reads four helper error messages and
works around each one by hand. Each workaround is invisible to the repository: the next session
pays the same cost, and nothing goes red when the installed helper regresses further. Separately,
the docs audit carries 79 `unverifiable` rows whose evidence says what a human would do next
("re-measure", "needs a portal run") rather than naming the command that settles the row, so the
queue cannot be worked by an agent and it never shrinks.

## Users

The repository owner, running one milestone at a time with a paid-model orchestrator and no
operator present, and the next milestone's orchestrator, which has no memory of this one. Both are
served by a red test that names the file and the rule, and by an audit row that names a command.

## Success criteria

1. `npm test` runs a check that fails when the installed `gsd` helper regresses on paid-type brief
   effort, the `path::test_name` Held-out form, an unreadable Intent-coverage row, or the serial
   retry path, and it passes at the shipped head.
2. The docs audit at the milestone head carries no `unverifiable` row that the repository's shipped
   commands can decide, and every remaining row names the check that would settle it.
3. The project Verify (`npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`)
   passes at the shipped head and the skills mirror test stays green.

## Edge coverage

<!-- Ruled by the orchestrator under the recorded `rulings` grant; each row names the evidence the
     ruling rests on. See ## Corrections. -->

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | encoding | held-out | A rule is matched by a named token in its installed rules file or by a helper's behaviour, never by a paragraph's wording. Removing that token from a copy of the file must fail naming the absolute file and the rule id; rewording the surrounding sentence with the token kept must still pass. Rests on M016 task T001's recorded E4 result and on the `scripts/user-scope-autonomy.test.mjs` E4 case already in the repository. |
| E2 | SC1 | empty | held-out | When the user-scope install or its `gsd/` directory is absent, the check fails naming the resolved absolute path it looked for and never exits zero. Rests on M016's E1 held-out test, which the new pins inherit rather than replace. |
| E3 | SC1 | idempotency | held-out | Two consecutive runs give the same verdict and write nothing into the checkout or the user-scope tree: `git status --porcelain` is unchanged after the first run and the second exits with the same status. Rests on M016's recorded E3 result. |
| E4 | SC1 | concurrency | dismissed | The check spawns the installed helper suite as a child process that takes ~30-50 s. Two concurrent invocations are not a supported mode: this repository has no CI, and `npm test` invokes the leg once. A lock would add a failure mode the run does not need. |
| E5 | SC2 | empty | held-out | A regenerated audit with zero `unverifiable` rows is a pass, not an error: the "names its settling check" rule applies only to rows that exist, and the check must not require at least one row. |
| E6 | SC2 | ordering | held-out | Remediation-queue numbers stay unique and strictly increasing; a persisting row keeps its number; no retired number is reused after a ruling, and a new row takes a number above every prior queue number and every `## User rulings` Queue #. This is the template's own rule and it is what keeps a ruling bound to the item it was made for. |
| E7 | SC2 | encoding | held-out | "Names the check that would settle it" means a literal command or path this repository ships — `node --test <path>`, `npx nx run <project>:<target>`, `<skill>/checks/<file>.mjs`, `doctor` — not a prose verb such as "re-measure" or "needs a portal run". A row whose evidence is a prose verb is undecided and stays in the queue. |
| E8 | SC3 | none | dismissed | SC3 aggregates the project Verify's own three commands and the mirror test; it carries no data shape of its own. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | pass vacuously when the user-scope install or the helper suite is missing | judgment | The reviewer reads a run's output: every check prints the resolved path it read and the exit status it propagated, and a green run that names no path is a defect. |
| N2 | SC1 | pin a paragraph's exact wording so ordinary rewording of a rule fails the suite | dismissed | E1 already pins token-versus-wording as a held-out edge with a two-mutation test; a second prohibition would duplicate the same check. |
| N3 | SC3 | weaken, skip or delete an existing check, test, audit row or Verify command to reach green | judgment | The reviewer reads the diff for a removed assertion, a skipped test, a loosened matcher, a deleted audit row, or a shortened project Verify, outside the files the task declares as new. |
| N4 | SC2 | drain the queue by ruling a row `accept-drift`, `planned: n/a`, or `fix-doc` without the owner's words recorded verbatim | judgment | The reviewer reads each new `## User rulings` row against `## Corrections` below. A disposition with no quoted owner ruling behind it is a defect, and so is any edit to `.commandcode/taste/**`. |
| N5 | SC1 | edit installed user-scope tooling from a repository task, or commit an installed-tooling change into this checkout | judgment | The reviewer reads each task's landing diff: it may only add or change files under the declared repository paths. The user-scope fix itself is made outside the checkout and is proven only by the check that fails without it. |

## Scope: in

- Extend `scripts/user-scope-autonomy.mjs` and its test so the suite fails, naming the absolute file
  and the rule id, when the installed helper regresses on: `brief-check`'s paid-type effort ladder,
  `plan-lint`'s `path::test_name` Held-out form, `check_handoffs`'s Intent-coverage row parsing, and
  the serial-retry refusal that leaves a rejected attempt unparkable.
- Extend the same suite to pin the user-scope dispatch rules the owner named: the orchestrator
  prompt's paid-route table, the subagent brief contract, the task and reviewer templates, and the
  few-shot examples a brief must carry. Each pin is a named token or a helper behaviour.
- Re-derive every `unverifiable` docs-audit row that a command this repository ships can settle, and
  make every remaining row's evidence name that command.
- Correct the `stale` docs-audit rows whose correction is a document edit inside this checkout.
- Keep the two skills trees byte-identical and the project Verify green.
- Record the owner-directed analysis of the remaining autonomy gaps in `docs/autonomy-gaps.md`,
  together with the user-scope change each gap produced.

## Scope: out (vetoes)

- Product behaviour, panel features, or any shipped explainer — no feature work of any kind.
- Editing `.project/archive/**`.
- Weakening a gate, check, test or Verify command to make the check pass.
- Editing `.commandcode/taste/**` — the taste tool owns those files, and a milestone may not write
  them. Taste rows are parked, not drained.
- Building, extending or repairing the 9 `tests/held-out/**` files that encode M009's archived
  `.project` layout, and wiring `tests/` or `e2e/` into a runner. Both are recorded as findings and
  left to a later milestone.
- Changing `npm test`'s user-scope leg, adding a CI pipeline, or narrowing what the project Verify
  type-checks.
- Adding, retiring or re-slicing a roadmap entry.

## Constraints

- Stack: TypeScript 6.0.x (exact pin), Nx 23.3, Angular ~22.1 for the extension workspace; Node
  v24.22.0 on this host. Tests run through `node --experimental-strip-types --test <glob>`.
- Project Verify: `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`.
  `npm run check` is `node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run
  check:skills`; the bridge is automatic, so a verify sidecar needs no manual junction.
- The installed `gsd` helper suite is `~/.commandcode/scripts/gsd` with `node --test
  "test/**/*.test.ts"`; measured at M016 it is 273 tests, all passing, in ~53 s. It must stay green.
- A repository task cannot declare a file outside the checkout, so every user-scope fix is made
  outside the milestone and is proven only by the check that fails without it. `land-check` proves
  the repository diff equals the declared files.
- Model policy: the owner's instruction for this milestone is paid subagents only, recorded below.
  `.project/model-policy.json` pins `deepseek/deepseek-v4.1-flash` for the tool-loop roles and
  `z-ai/glm-5.3-flash` for `reviewer`, `skeptic` and `review_panel`; a paid reviewer never shares
  the producer's family.
- GSD Path: the milestone lives on `gsd-path/M017`, ships through one archive and one annotated
  `milestone/017-verification-coverage` tag, and integrates into `main` in direct mode.
- No model name appears in a commit message, and no work address or domain is written anywhere.

## Current state (brownfield only)

- **What exists**: an Nx 23 monorepo (TypeScript 6.0.3, Angular ~22.1) whose product is an MV3
  extension plus an Angular DevTools panel with six shipped explainer routes. Beside it, a GSD Path
  orchestration harness that is growing faster than the product: `scripts/` holds 18 node:test files,
  including `scripts/user-scope-autonomy.mjs` (the M016 conformance suite) and
  `scripts/run-user-scope-tests.mjs` (the user-scope bridge exported as `resolveScanDir`). Sixteen
  milestones are archived; `.project/STATE.md` binds M017 on `gsd-path/M017`.
- **Must not break**: the six shipped explainers' panel behaviour; the `control-*`/`verify-*` skill
  contracts; the byte-identical mirror for `control-ai-browsers` and `verify-ai-browsers`, pinned by
  `scripts/skills-mirror.test.mjs`; the installed `gsd` suite's 273 tests; the `spikes/ng222-app` and
  `spikes/ng222-ssr` fixtures; `scripts/run-user-scope-tests.mjs`'s fail-fast when it finds no
  user-scope test.
- **Doc-vs-code rulings** (delegated under the recorded grant, evidence per row):
  - CHARTER `Model policy: free routes only` versus `.project/model-policy.json`'s paid pins →
    **fix-doc**, and the charter's true binding text becomes today's owner instruction. Evidence:
    commit `395d1c7` `build: pin paid model policy per role`, `STATE.md`'s 2026-11-01 paid-rung
    approval for M016 T001, and this milestone's grant.
  - `counter fixture: provideRouter with no routes` (rows 3, 6, 17, 43, 44, 52) → **fix-doc**: the
    counter declares `/stale-view` and `/stale-view-deferred`.
  - `verify-ai-browsers` standalone command list missing `stale-view.mjs` and `interop.mjs`
    (rows 38, 62) → **fix-doc**.
  - `control-angular-dev-app/SKILL.md` maintain-rationale paragraph present in the `.claude` copy
    only (row 42) → **fix-doc** in the maintained `.commandcode` copy.
  - `research/10-model-capabilities.md` naming the retired `edge-dev-phi4mini` profile path
    (row 73) → **fix-doc**.
  - `docs/feature-proposals.md` "nothing built" and the ten-versus-eleven draft count
    (rows 87, 88, 90), the instance registry (row 91), "older copy" (row 94) → **fix-doc**.
  - `link-workspace-packages/SKILL.md` npm-workspaces claim (row 63) → **accept-drift**: the folder
    is a vendored skill, its text is inert, and editing a vendored copy invites a future install to
    revert it silently.
  - `.commandcode/taste/{angular,communication,tooling}/taste.md` (rows 95, 96, 98) → **accept-drift
    for this milestone only**, parked as `fix-doc` with `planned: no` and applied in a post-ship
    commit through the taste tool. Evidence: `AGENTS.md` "Taste changes" forbids a taste write while
    STATE is `build/*`.
  - `tests/` (23 files, 9 failing on archived paths), the byte-identical Playwright specs, the dead
    `src/panel/` modules, `extension/panel.html`/`panel.js`, and `agent-main.js`'s hand-maintained
    duplicate → **accept-drift** for this milestone: recorded in Risks and open to a later roadmap
    entry, because M017's scope is verification coverage and each of these is a product or test
    change the entry's vetoes exclude.
- **Ground truth**: `.project/research/evidence-codebase.md`,
  `.project/research/DOCS-AUDIT.md`

## Risks

- The check reads files outside the checkout, so it inherits M016's absent-install rule: fail loudly
  with the path, never pass vacuously.
- A pin on a helper's behaviour can become a change-detector if it asserts output wording. Every pin
  must name a token, an exit code, or a parsed field.
- Re-deriving audit rows can grow past the milestone; a row that needs evidence this milestone
  cannot produce is recorded with its settling command rather than guessed.
- The installed `gsd` suite is 273 tests at ~53 s; three pins that each spawn it would turn one
  `npm test` into minutes. The pins must share one probe of the installed suite where the ruling
  allows it.
- `npm run check` type-checks three files, two of them outside the repository, so a type regression
  in `apps/`, `src/` or the other `scripts/` files is caught by `build`/`build-extension` only.
  M017 must not treat the type check as broader than it is.
- The user-scope fix is invisible to `land-check`: a wrong fix shows up only as a failed pin, which
  reads like a bad test. The Log must record which side was wrong.

## Open questions

- [RESEARCH] Which of the 79 `unverifiable` audit rows are decidable with the commands this repository already ships, and which need evidence this milestone cannot produce?

Ruled here, not left open, under the recorded `rulings` grant:

- `tests/` (23 files, 9 unrecoverable) and the duplicate Playwright specs: **out of this milestone**.
  Nine files cannot pass at any head — they assert `.project/review/rounds/*.md`,
  `.project/review/specs/m00*.md` and `.project/tasks/`, which were archived at M009, and
  `Test-Path .project/review` is False at this head. Retiring or re-pointing them is a test-layer
  change the entry's vetoes exclude, and a `fix-code` ruling here would become scope the roadmap
  entry never authorised. Recorded as a roadmap candidate for the next boundary; nothing is deleted.
- `npm test`'s dependency on `~/.commandcode/scripts`: **keep**. `scripts/run-user-scope-tests.mjs`
  is the same bridge SC1 extends, its fail-fast on an empty scan is a deliberate M016 guarantee, and
  narrowing it would remove the only thing that notices a reverted user-scope fix. The portability
  risk stays recorded in Risks.

## Corrections

- 2026-11-01: standing grant recorded from the owner's instruction, verbatim: "Your goal is achieved
  when you have shipped the milestone using the GSD Path userflow (`/gsd-path`) **and** analyzed how
  we could improve user-scope rules, GSD Path and general as well as user-owned scripts in
  ~/.commandcode/scripts, GSD Path and general, so that the milestone could have been completed in
  this session without a human-in-the-loop, meaning you would have continued autonomously since the
  first `/gsd-path @ C:\Users\LarsGyrupBrinkNielse\.commandcode\prompts\deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md`
  prompt." Recorded with `gsd.bat preapprove --grant intent,plan,rulings,ship` at the first legal
  boundary (`STATE.milestone` null, `inspect/active`). It delegates the intent, plan, edge,
  prohibition and `NEEDS-USER` decisions for M017, and pre-approves the ship gate for M017.
- 2026-11-01: the milestone's scope addition the same instruction implies, recorded verbatim: "Also
  on the table: User-scope prompts, briefs, templates, and few shot examples for GSD Path
  subagents." and "In addition to analyzing how to run autonomously without a human-in-the-loop, you
  must implement the changes proposed and verify them where possible". Ruled as delegated: the
  analysis is written to `docs/autonomy-gaps.md`, the user-scope change each gap produces is made
  outside the checkout, and the repository-side pins extend `scripts/user-scope-autonomy.mjs` rather
  than adding a second suite. This does not amend SC1-SC3; it adds the analysis deliverable and the
  brief/template pin set to `Scope: in`.
- 2026-11-01: dispatch policy ruling, delegated, quoted from the owner: "paid-* subagents only (the
  free-* models have reached their daily quota except for Poolside Laguna S 2.1)". Every child in
  this milestone runs `paid-deepseek-v4-1-flash-high` for a tool-loop role and
  `paid-glm-5-3-flash-high` for a reviewer, skeptic or panel, so no verdict shares the producer's
  family. The charter's `free routes only` line is amended by this ruling and corrected in
  CHARTER.md `## Corrections`.
- 2026-11-01: the supervisor named in the run instruction is "shipped ... without a
  human-in-the-loop"; the two formulations in the same instruction ("with" and "without") are read
  as the second, which is what the rest of the instruction describes.
