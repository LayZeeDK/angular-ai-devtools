# Intent — Angular AI DevTools

<!-- Written by /gsd-path-define. Every downstream agent reads this first.
     Constraints and vetoes here override everything downstream. -->

Lane: milestone

Review panel: off

Finding skeptics: off

Surfaces: none

## Summary

A GSD Path milestone was driven to the end by a free-model orchestrator, and it lost days to a
handful of mechanical stops that nobody had written down as testable rules: a pre-approval grant
that was not scoped to a milestone, a handoff that based the next branch on the old head, a chunk
brief that asked a child to write one large file, a fragment that arrived malformed with no repair
command, and a free route that stopped answering with a silent zero-token run. M016 makes those
rules regress-proof inside this repository: one conformance suite that reads the installed
user-scope tooling, runs its helper suite, and fails when any of the five rules disappears from
the installed rules or stops behaving as described. It plugs into `npm test`, so the protection is
a check rather than a document someone must remember to read.

## Problem

The autonomy rules that let a milestone finish without a human live in `~/.commandcode` — an
installed bundle outside this checkout, where an installer re-run or a careless edit silently
reverts them. Nothing in this repository notices. The only detector today is a session that hits
the same stop again and spends the same hours rediscovering the workaround, and the rules
themselves are prose, so an orchestrator reading them cannot tell whether the helper that
implements a rule still exists or still behaves as the prose says.

## Users

The repository owner, working alone with a free-model orchestrator, and the next milestone's
orchestrator, which has no memory of this one. Both are served by a red test rather than a
remembered lesson.

## Success criteria

1. `npm test` runs a conformance suite that fails when the installed `~/.commandcode/scripts/gsd`
   suite is red, or when any of these is absent from the user-scope rules: the milestone-scoped
   pre-approval boundary, the `handoff` branch-creation rule, the free-route zero-token quota
   signature, the incremental-write and byte-length-proof rules for a written artifact, and the
   fragment repair command.
2. The conformance suite names the exact file and rule it failed on, and passes against the
   tooling as installed at this head.
3. The project Verify (`npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`)
   passes at the shipped head and the skills mirror test stays green.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | empty | held-out | A machine with no user-scope install must fail the suite with the resolved path it looked for, never pass with zero assertions. Pinned by a test that points the resolver at an empty temporary directory and asserts a non-zero exit naming that directory. |
| E2 | SC1 | boundary | held-out | The suite must fail exactly when the installed helper suite fails: a copy of `gsd/` with one deliberately failing test exits non-zero and the conformance run propagates that non-zero status with the failing test's name, while the pristine install exits zero. Pinned by a test that runs both. |
| E3 | SC1 | idempotency | held-out | Running the suite twice must yield the same verdict and leave no file behind: no check may write into the user-scope tree or into the checkout. Pinned by asserting `git status --porcelain` is unchanged after a run and a second run exits with the same status. |
| E4 | SC2 | encoding | held-out | Each rule is matched by a named token and by a helper's behaviour, never by a paragraph's wording. Removing a rule's token from a copy of its rules file must fail naming that file, while rewording the surrounding sentence with the token kept must still pass. Pinned by a test over both mutations. |
| E5 | SC2 | empty | criterion SC2 | A rules file that exists but holds none of the five rules is reported as that file with the missing rule named, not as a generic conformance failure. |
| E6 | SC3 | none | dismissed | SC3 aggregates the project Verify's own three commands and carries no data shape of its own. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | pass vacuously when the user-scope install or the helper suite is missing | judgment | The reviewer reads a run's output: every check prints the resolved path it read and the exit status it propagated, and a green run that names no path is a defect. |
| N2 | SC2 | pin a paragraph's exact wording so ordinary rewording of a rule fails the suite | judgment | The reviewer reads the assertions: each matches a named token or a helper's behaviour. A literal multi-sentence quote from a rules document is a defect. |
| N3 | SC1 | weaken, skip or delete an existing check or test so the new suite passes | judgment | The reviewer reads the diff for a removed assertion, a skipped test, or a loosened matcher outside the new suite's own files. |
| N4 | SC3 | report the milestone green while one of the project Verify's three commands is red | judgment | The reviewer reads the shipped Verify output: each of `npm run check`, `npm test` and `npx nx run angular-ai-devtools:build-extension` carries its exit status, and a green claim with a red or missing command is a defect. |

## Scope: in

- A conformance suite inside this repository that reads the installed user-scope tooling and fails
  when the autonomy rules regress: milestone-scoped pre-approval, `handoff` creating its own branch
  at the remote default, the chunk brief's incremental-write and byte-proof rules, the fragment
  repair command, and the free-route quota signature.
- A test entry point the project Verify runs, so the conformance suite is part of `npm test` rather
  than a document someone must remember to read.

## Scope: out (vetoes)

- Product behaviour, panel features, or any shipped explainer.
- Editing `.project/archive/**`.
- Weakening a gate, check or test to make the suite pass.

## Constraints

- Stack: TypeScript 6.0.x (pinned), Nx 23.3, Angular ~22.1 for the extension workspace;
  supported inspected apps are Angular 22.2 dev builds.
- `npm run check`, `npm test` and `npx nx run angular-ai-devtools:build-extension` must pass at
  every ship; the sidecar dependency bridge is used for worktree checks.
- The repository's test chain is `node --experimental-strip-types --test "scripts/**/*.test.mjs"
  "extension/**/*.test.mjs"` then `scripts/run-user-scope-tests.mjs`, then `test:skills`, then
  `test:app`. `scripts/run-user-scope-tests.mjs` resolves the user-scope directory from
  `os.homedir()` or a `USER_SCOPE_*`/`RUN_USER_SCOPE_*` environment key and scans `**/*.test.mjs`;
  the installed `gsd` suite is `*.test.ts`, so it is not covered by that leg today.
- The installed `gsd` suite runs with `node --test "test/**/*.test.ts"` from
  `~/.commandcode/scripts/gsd`; measured at this head it is 273 tests, all passing, in ~53 s on
  Node v24.22.0 (arm64).
- Model policy: free routes only. `reflection/beam:free` at high effort is the recorded default
  for every role; a route that returns a zero-token run is a quota event, and the run moves down
  the ladder rather than counting a failed attempt.
- GSD Path: the milestone lives on `gsd-path/M016`, ships through one archive and one annotated
  `milestone/016-orchestration-autonomy` tag, and integrates into `main` in direct mode.
- No model name appears in a commit message, and no work address or domain is written anywhere.

## Current state (brownfield only)

- **What exists**: an Nx 23 monorepo (TypeScript 6.0.3, Angular ~22.1) whose product is an MV3
  extension plus an Angular DevTools panel, with six shipped explainers reachable from routed
  panel pages. Verification lives in `.commandcode/skills/` (`control-*`, `verify-*`, `lars-*`)
  with byte copies of exactly two skills under `.claude/skills/`. The repository already carries a
  user-scope test bridge: `scripts/run-user-scope-tests.mjs` resolves `~/.commandcode/scripts` and
  runs every `**/*.test.mjs` it finds, and `npm test` calls it between the repo tests and the
  skills tests. The installed `gsd` helper suite (`~/.commandcode/scripts/gsd/test/*.test.ts`)
  already covers `preapprove`, `handoff`, the chunk brief's incremental-write text, and
  `needs-user`; it does not cover `fragment-fix` or the free-route quota signature.
- **Must not break**: the six shipped explainers' panel behaviour; the `control-*`/`verify-*`
  skill contracts; the byte-identical mirror for `control-ai-browsers` and `verify-ai-browsers`
  (pinned by `scripts/skills-mirror.test.mjs`); the `spikes/ng222-app` and `spikes/ng222-ssr`
  fixtures; `scripts/run-user-scope-tests.mjs`'s fail-fast behaviour when no user-scope test is
  found.
- **Doc-vs-code rulings**: none. The M016 re-inspection recorded 0 `stale`, 0 `aspirational` and
  111 `unverifiable` claims with no `NEEDS-USER` row, and no `planned: no` row in the alignment
  queue, so no doc-vs-code conflict is open at this head.
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- The suite reads files outside the checkout, so a machine without the user-scope install must fail
  it loudly with the missing path rather than pass vacuously.
- A suite that asserts prose becomes a change-detector. Assert the presence of a named rule and the
  behaviour of a named helper, not a paragraph's wording.
- The user-scope scripts are an installed bundle, so an installer re-run could revert the fixes the
  suite protects; the suite must therefore test behaviour, not only text.

## Open questions

- None

## Corrections

- 2026-11-01: standing grant recorded from the owner's instruction, verbatim: "Your goal is
  achieved when you have shipped M016 using the GSD Path userflow (`/gsd-path`) **and** analyzed
  how we could improve user-scope rules, GSD Path and general as well as user-owned scripts in
  ~/.commandcode/scripts, GSD Path and general, so that M016 could have been completed in this
  session with a human-in-the-loop, meaning you would have continued autonomously since the first
  `/gsd-path @ C:\Users\LarsGyrupBrinkNielse\.commandcode\prompts\deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md`
  prompt." Recorded with `gsd.bat preapprove --grant intent,plan,rulings,ship` at the first legal
  boundary (`STATE.milestone` null, `define/active`). It delegates the intent, plan, edge,
  prohibition and `NEEDS-USER` decisions for M016, and pre-approves the ship gate for M016.
- 2026-11-01: owner ruling on the free-route exhaustion that blocked `T001` at attempt 2, verbatim:
  "1: Approve one paid rung." The milestone's coder dispatch runs once on
  `paid-glm-5-3-flash-high` — the charter's approved pairing for a DeepSeek parent — instead of
  the free routes, whose four rungs all answered with zero-token runs with the reset 10.1 h away.
  The route is recorded in the `T001` Log. The second answer, "2: Document only", settles that
  `isolation.py deactivate-task` keeps its task-branch guard and the serial-retry recipe stays
  documented in `gsd-path-autonomy-playbook.md` §31 rather than becoming a helper change.
