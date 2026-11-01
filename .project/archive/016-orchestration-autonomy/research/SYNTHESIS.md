# Synthesis — M016 orchestration-autonomy

<!-- Milestone-mode synthesis: records which program decisions this milestone's
     plan was built against. Settled only; no invented decisions. -->

## Settled

- Milestone scope is exactly the two `Scope: in` bullets of the resolved roadmap entry `orchestration-autonomy`: a conformance suite in this repository that reads the installed user-scope tooling and fails when the five autonomy rules regress, plus a test entry point the project Verify runs (ROADMAP.md `### M016 — orchestration-autonomy`).
- Success criteria are the entry's three: the suite runs inside `npm test` and fails on a red installed helper suite or an absent rule; it names the exact file and rule it failed on and passes at this head; the project Verify passes at the shipped head with the skills mirror green (ROADMAP.md M016 Success criteria 1-3).
- Vetoes are the entry's three: no product behaviour, panel features or shipped explainer; no editing `.project/archive/**`; no weakening a gate, check or test to make the suite pass (ROADMAP.md M016 `Scope: out`; CHARTER.md `Full scope: out (vetoes)`).
- Surfaces is `none`, so no PLAN.md Surface contract is owed and no criterion has to be observable at a person-facing surface (INTENT.md `Surfaces: none`).
- The five rules and their installed anchors, read at this head: the milestone-scoped pre-approval boundary (`AGENTS.md` "Autonomous lane", `gsd preapprove`); the `handoff` branch-creation rule (`AGENTS.md` "call gsd handoff --apply", `gsd handoff --base`); the free-route zero-token quota signature (`AGENTS.md` "A free route answers a dispatch with a **zero-token run**", the DeepSeek orchestrator prompt's routing table); the incremental-write and byte-length-proof rules (`references/gsd-path-skill-roster.md`, `references/prompting-glyph-cluster.md`, `gsd inspect chunks` brief text); the fragment repair command (`references/gsd-path-orchestrator.md` "run `gsd.bat fragment-fix`", `gsd fragment-fix --write/--check`).
- The installed helper suite is `~/.commandcode/scripts/gsd`, whose `npm test` is `node --test "test/**/*.test.ts"`; measured at this head it is 273 tests, all passing, ~53 s on Node v24.22.0 arm64. It visits `preapprove` (milestone scoping), `handoff` (remote-default base, collision refusal), the `inspect chunks` brief's incremental-write text, and `needs-user`; it does not visit `fragment-fix` or the quota signature.
- The repository already runs a user-scope leg: `npm test`'s first command is `node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs"`, so a new `scripts/*.test.mjs` file is inside `npm test` with no `package.json` change (package.json:9).
- External-path resolution already exists and is tested: `scripts/run-user-scope-tests.mjs` exports `resolveScanDir` (argument, then `USER_SCOPE_*`/`RUN_USER_SCOPE_*` env keys, then `os.homedir()/.commandcode/scripts`) and `findTestFiles` (`**/*.test.mjs`, skipping `node_modules`/`.git`), and fails fast with the resolved path when it finds nothing (evidence-codebase.md F1-F4, `scripts/run-user-scope-tests.mjs:29-79`).
- Absent-install behaviour is a stated risk, not a discretionary choice: the suite must fail loudly naming the missing path rather than pass vacuously (INTENT.md Risks 1, edge E1, prohibition N1).
- Rules are matched by a named token and by a helper's behaviour, never by a paragraph's wording (INTENT.md Risks 2-3, edge E4, prohibition N2).
- Model policy: free routes only; `reflection/beam:free` at high effort is the recorded default for `plan`, `coder` and `reviewer` (`.project/model-policy.json`, CHARTER.md Model policy).
- GSD Path: the milestone lives on `gsd-path/M016` and integrates into `main` in direct mode (STATE.md; CHARTER.md GSD Path).
- The owner's standing grant `intent,plan,rulings,ship` is recorded for this milestone, quoted verbatim in INTENT.md `## Corrections`; it delegates the plan gate, the edge and prohibition rulings, and the ship gate for M016.

## For the planner

- Walking skeleton: one new test module under `scripts/` that (a) resolves the user-scope install through the existing resolver, failing with the resolved path when it is absent, (b) runs the installed `gsd` helper suite as a child process and fails with the exit status and the failing test name, and (c) asserts each of the five rules by a named token in its installed rules file plus the helper command that implements it. Held-out edges E1-E4 pin absent-install, red-suite propagation, idempotency/no-writes, and token-versus-wording.
- Wave-1, because it invalidates the plan if it fails: reading and running files outside the checkout, and the cost of the installed suite inside `npm test` (measured ~53 s).
- One deliverable, one task. Do not split the checker from its tests: both live in the same declared files and the second consumes the first's exported report shape.
- `files` must be exhaustive and the Verify must name a declared path. The project Verify (`npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`) is SC3's command and belongs to no task unless that task owns SC3.
