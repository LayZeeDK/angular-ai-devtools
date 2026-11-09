# Lessons

- 010-n4-error-explainer — A repair task must record its task file in a commit before its landing commit, otherwise the landing proof cannot satisfy both the task-file-at-base check and the commit-body `Base:` check.
- 010-n4-error-explainer — A GSD verify sidecar ships without `node_modules`, so the project Verify must bridge its own dependencies before it type checks; `scripts/ensure-sidecar-deps.mjs` now does this for every `npm run check`.
- 010-n4-error-explainer — A model pair pinned against an older browser build stops generating rather than failing: doctor passed every row and then hung 17 minutes at the first canary, and the renderer wedged. Check the browser version against the pinned pair before blaming the harness.
- 013-docs-audit-closure — A Verify that parses the whole audit matches `## User rulings` rows before the queue and reads the ruling cell as the queue row: scope every parse to its section, or the same task fails as a regression on every later task.
- 013-docs-audit-closure — A Verify command runs under bash in a verify sidecar, so Windows percent-style environment variables do not expand and backticks inside double quotes are command-substituted; use `$HOME`, `/tmp`, and argv tokens for paths.
- 013-docs-audit-closure — Task files have no trailing newline, so an editor that rewrites the last line breaks the append-only Log rule; append after a newline and re-check the body against the base before landing.
- 013-docs-audit-closure — The final gap review caught what the wave reviews missed: an audit row quoting a sentence its corrected document no longer makes. Cross-wave document-to-audit consistency needs its own gap risk, not a spot check inside a wave.
- 013-docs-audit-closure — `finish` refuses after one failed attempt (`dispatch record is blocked; use round`) and `round` needs a child command the native path does not have; `isolation.py land` is the documented landing helper that keeps the ledger honest in that state.
- 013-docs-audit-closure — A reviewer that names the artifact path but never writes it (identical SHA before and after) is a dispatch failure, not a pass: always compare the collected digest with the previous one.
- 016-orchestration-autonomy — All four free routes can go quiet within the same quarter hour, so a milestone planned around free routes has no fallback rung left; pin the reset time before dispatch and have the owner's paid model written down.
- 016-orchestration-autonomy — A plan whose Held-out `Test` cell reads `path::test_name` blocks `gsd plan-lint` while `check_handoffs.py plan` accepts it; the lint now strips the node id, and the same pass should be checked on both gates before approval.
- 016-orchestration-autonomy — A serial dispatch leaves its declared files in the primary worktree, so a rejected attempt cannot be checkpointed or re-prepared until they are parked outside the tree; the playbook's §31 carries the whole recipe.
- 016-orchestration-autonomy — An Intent-coverage acceptance cell holding `AC1, AC2, AC3` used to be skipped silently and reported as `Intent coverage omits SC1`; write one row per acceptance item.
- 016-orchestration-autonomy — A coder child left four undeclared scratch files in the repo root because the brief never forbade it; every coder brief now names the declared files and forbids scratch files, and the repository-root diff is inspected before landing.

- 019-context-and-jobs — A free coder claimed "exit 0, 7/7 tests passed"; the authoritative finish Verify found 4 failures. A coder's test claim is never evidence: only the isolate Verify is.
- 019-context-and-jobs — verify-weight returned CHUNK for a gate task with ten acceptance criteria; split edge verification from gate verification so each task stays at or under eight.
- 019-context-and-jobs — A milestone that re-inspects documents must own the DOCS-AUDIT remediation in its plan; a regenerated audit made `npm test` red at the build base and cost a plan repair.
- 019-context-and-jobs — Two stale `stage: complete` collect-artifact journals carrying a short-SHA `expected_destination` blocked validate, status and route for every later phase; a completed journal is never pruned by the helper.
- 019-context-and-jobs — The Nx daemon refuses a junction alias of the same worktree ("received a message from a different workspace"); run Nx from the canonical path and never set NX_DAEMON=false.
- 019-context-and-jobs — A child wrote its task's files into the primary worktree; only the pre-finish clean check caught it. Every coder brief must open with the branch proof.
- 019-context-and-jobs — The gap-review template allows exactly one Check/Observed/Reference triple; two gap artifacts were rejected for repeating it, costing two redispatches.
- 021-optin-companion — A Verify that *skips* its load-bearing tests is not a pass: T002 recorded `skipped 4` at its landing because this shell exports `NODE_ENV=production`, so the fixture's `npm ci` dropped devDependencies and the four build-proof tests skipped rather than failed. Provision every workspace a Verify drives with `--include=dev`, and make a held-out or build proof fail — never skip — when the install it needs is absent; read the recorded `verify.json` and refuse `skipped > 0` on a test that carries a criterion.
- 021-optin-companion — A task Verify must not depend on state a previous task created inside its own worktree. T002's fixture install lived in its isolate; when the worktree was retired the landing Verify passed vacuously. Install what you measure, in the same run, from the same tree.
- 021-optin-companion — A retired task worktree leaves a directory whose `.git` is gone, and `isolation.py recover` then blocks the next landing with "not a git repository". `git worktree prune` plus deleting that directory is the repair, safe once the landing commit exists.
- 021-optin-companion — Never open a file for writing before reading it: `open(p, 'w').write(open(p).read())` truncates before the read, and emptied every artifact under `.project/review` in one command. Read to a variable first, then write.
- 022-in-page-overlay — Never repair an activated task's contract in place: the landing proof binds the commit subject, the base SHA and the frontmatter to the task file *at the dispatch base*, so editing the title or the acceptance criteria mid-flight produces an unwinnable chain of subject / base / agent / worktree mismatches. Reset the task to pending, copy its artifacts out, retire its isolate, and re-dispatch from a base whose committed contract is already correct.
- 023-fixture-components - A pre-approval grant recorded while `STATE.milestone` is null is indistinguishable from the previous milestone's consumed grant: `pre-approve --use intent` answers "used or out of scope" and `--grant` answers "already recorded", so the gate deadlocks with no flag to reset it. The grant's substance holds, so approve through the transition and record the anomaly; the real fix is for the record to carry the milestone or a sequence number.

## M023 — a test that cannot fail is worse than a missing test

Three separate held-out suites in one milestone passed while unable to detect the defect they were named for.
`fixture-rebuild-idempotent` ends `assert.ok(true)` and never builds twice; `fixture-aria-order` compares a
reversed list against itself; `fixture-harness-root-boundary` asserts source text rather than the rendered
boundary. The explainer pin was a fourth, caught and repaired in-flight by T008 (`5090132`) after a reviewer
read the file.

The rule that would have caught all four: **read the artifact, never the receipt.** A coder's summary is a
claim about a file. Twice the summary disagreed with the file — once recording `skipped 4`, once claiming a
SHA-256 pin whose digests were computed and never compared. Both were accepted on the summary.

The mechanical form of the rule, to be checked before a held-out task is accepted: name the one-character
change to the product that would leave the test green. If you can name it, the test is not a proof.

Second lesson, from the same milestone's bookkeeping: **a helper that refuses must be read by exit code, not by
output filter.** `review.ps1 -Action close` failed four times in a row while the orchestrator's `Select-String`
matched nothing and reported progress. The stub path was also wrong — stubs written into `.project/review` are
rejected by the completion gate, which cost three cycles.

- 041-navigation-blocking — A gate task's declared files must cover every defect the gate can report: T005 blocked because `npm run check` was red on three defects outside its declared files, so the repair had to widen ownership before the gate could carry a verdict.
- 041-navigation-blocking — A guard whose red names only a count costs a second cycle: the held-out E3 guard failed twice with `expected at least 3 pass summary blocks, got 1` and nothing to read, so T009 now asserts the nested run's own status, signal and tail first and names the first leg that left no evidence.
