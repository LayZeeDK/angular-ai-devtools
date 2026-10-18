# Evidence — codebase

<!-- Written by the codebase mapper during /gsd-path-inspect. Read by define
     (brownfield mode), researchers (fifth standard dimension), the planner
     (conventions are binding), and reviewers. -->

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-10-18
Checks run: `npm run check` in verify sidecar (junction to primary node_modules) → exit 0; `npm test` in verify sidecar → 296/296 pass (49 root + 247 skills)

## Map

- **Stack**: Node (npm) + TypeScript 6.0.3 (pinned, package.json devDependencies); ES modules ("type": "module"); Node types ^26.6.5; @opencode/plugin 2.0.29. No Angular runtime dependency in root; Angular appears only in fixture apps under spikes/ (e.g. spikes/ng222-app). Tooling: tsc 6.0.3, node:test.
- **Entry points**: Root npm scripts check/test; installers in scripts/install-*.mjs (plain JS); typed pstack installer scripts/install-pstack-opencode.mjs + test; plugin template scripts/opencode-pstack-plugin.ts. Skills under .claude/skills/*/SKILL.md with scripts/control.mjs and feature recipes.
- **Architecture**: Monorepo of agent skills (control-* and verify-* pairs) plus installers and spike/research artifacts. Each control skill owns a browser-facing control.mjs driver; verify skills mirror them with checks/ and features manifests. Research/docs/plans/spikes hold evidence from milestone M001. M002 added sidecar dependency-bridge documentation and archive artifacts only.
- **Conventions**: Conventional commits with scopes (feat(skills), chore(taste), build:, plan:, ship:, T00x:); node:test for all scripts; TypeScript strict + noUncheckedIndexedAccess + NodeNext; tests beside scripts (*.test.mjs); gitignored tmp/, .browsers/, .audit/, spikes/probes/bench/.
- **Maturity**: Type check passes; 296 tests pass (49 root + 247 skills); M001 and M002 shipped (integrated at dc6e693); many browser-dependent checks require real browsers and are unrun in CI. .browsers holds ~9k files (ignored).
- **Recent activity**: Last commits on main are M002 sidecar-hardening merge (dc6e693) after M001 run-unrun-spikes merge (5953b12); current branch gsd-path/M003 bound at baseline dc6e693. Recent work clusters on verify-sidecar dependency bridge documentation and milestone archives, not source behavior.

## Finding: Repo is a skill/control-script sandbox, not an Angular application

- **Claim**: The root package has no Angular dependency; Angular is only a target of the control skills and appears in spike fixture apps.
- **Source**: package.json (no angular deps); .claude/skills/control-angular-devtools/SKILL.md
- **Confidence**: high
- **Why it matters here**: A planner assuming an Angular codebase would mis-scope work; features are skills and installers, not app code.

## Finding: TypeScript pin is load-bearing

- **Claim**: TypeScript is pinned to 6.0.3 and AGENTS.md warns a stale 7.x install breaks `npm run check`.
- **Source**: package.json ("typescript": "6.0.3"); AGENTS.md lines 7-9
- **Confidence**: high
- **Why it matters here**: Environment hygiene matters; verify sidecar lacked node_modules and needed a junction to run checks.

## Finding: Verify sidecar has no node_modules

- **Claim**: The supplied verify sidecar worktree contains no node_modules directory, so `npm run check` fails unless dependencies are provided.
- **Source**: sidecar directory listing (no node_modules); run of `npm run check` → TS2688 before junction
- **Confidence**: high
- **Why it matters here**: Checks are only runnable with a dependency bridge; record as environment caveat, not code defect.

## Finding: All tests pass at baseline

- **Claim**: At baseline dc6e693, `npm run check` exits 0 and the full test suite passes 296/296.
- **Source**: sidecar runs above
- **Confidence**: high
- **Why it matters here**: Baseline is green; any future failure is a regression, not pre-existing.

## Finding: Large ignored browser profile data

- **Claim**: `.browsers/` contains ~9157 files (git-ignored) and `tmp/` ~5124 files, so working tree is large despite clean git status.
- **Source**: filesystem counts in primary repo; .gitignore
- **Confidence**: high
- **Why it matters here**: Disk/scan cost and noise; these are runtime artifacts, not source.

## Finding: Control skills ship byte-copied helpers

- **Claim**: `scripts/fingerprint.mjs` and `scripts/proctree.mjs` are described as byte copies of lars-create-verification's and must not be edited in place.
- **Source**: .claude/skills/control-angular-devtools/SKILL.md (Helpers/Cleanup sections)
- **Confidence**: high
- **Why it matters here**: Edits to these helpers should go upstream; local changes risk drift.

## Finding: M002 changed documentation and archive only

- **Claim**: Between baselines 5953b12 and dc6e693, the diff added AGENTS.md sidecar-bridge documentation and M002 archive artifacts; no root source, skill, or installer behavior changed.
- **Source**: `git diff --stat 5953b12..dc6e693`
- **Confidence**: high
- **Why it matters here**: A planner should not expect new runtime functionality from M002; its value is operational guidance for sidecar checks.

## Apparent intent

- The project is becoming a comprehensive, verified agent-skill suite for driving and verifying Angular DevTools, AI browsers, and related tooling, with strong emphasis on measured evidence and reproducibility — based on the paired control/verify skills, fingerprinted feature manifests, and the M001 spike ledger.

## Open questions for define

- What is the scope of milestone M003 (no charter/roadmap present in .project at inspect phase)?
- Are the browser-dependent unrun checks expected to be automated or remain manual proofs?
- Should the sidecar dependency gap be fixed by the orchestrator, or is junction usage acceptable?

## Blocked areas

- .browsers/ and tmp/ are git-ignored runtime artifacts; contents not inspected beyond counts.
- Sidecar node_modules absent; checks run via temporary junction to primary node_modules, then removed.