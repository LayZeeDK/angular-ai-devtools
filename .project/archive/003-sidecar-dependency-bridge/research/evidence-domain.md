# Evidence — domain

Dimension: domain
Questions assigned: Which exact control-skill check commands exist and where are they documented?

## Finding: Root typecheck and test commands are `npm run check` and `npm test`

- **Claim**: The repository's two root verification commands are `npm run check` (which runs `tsc -p tsconfig.json && npm run check:skills`, i.e. `tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json`) and `npm test` (which runs `node --test "scripts/**/*.test.mjs"` plus `npm run test:skills` = `node --test ".claude/skills/**/*.test.mjs"`).
- **Source**: package.json scripts (lines 6-11); AGENTS.md lines 8-10 ("Checks: `npm run check` ... and `npm test`")
- **Confidence**: high
- **Why it matters here**: These are the baseline commands every freshly created verify sidecar must run green (success criteria SC1/SC2); the sidecar dependency bridge must make both work without manual junctions.

## Finding: Every control skill documents a byte-copied `fingerprint.mjs check` command

- **Claim**: Each of the five control skills (`control-angular-dev-app`, `control-angular-devtools`, `control-ai-browsers`, `control-vitest-browser-angular`, `control-pangular-inspector`) documents `node .claude/skills/<skill>/scripts/fingerprint.mjs check [--feature <id>] [--json]`, printing `fresh`, `stale`, `unproven` or `external` per feature, with exit 0 when all features are fresh or external, 1 when one is stale/unproven, and 2 when it could not run.
- **Source**: control-angular-dev-app/SKILL.md Helpers section; control-angular-devtools/SKILL.md Helpers; control-ai-browsers/SKILL.md Helpers; control-vitest-browser-angular/SKILL.md Helpers; control-pangular-inspector/SKILL.md Helpers (all under `.claude/skills/`)
- **Confidence**: high
- **Why it matters here**: `map-fresh` in each skill's `doctor` calls this; sidecar checks must not break fingerprint freshness, and the bridge must not mutate hashed source files.

## Finding: Every control skill documents a read-only `doctor` check command

- **Claim**: Each control skill documents a `doctor` subcommand of its `scripts/control.mjs` that prints one line per check and exits 0 healthy, 1 a check failed, 2 could not run: `control-angular-dev-app doctor`, `control-angular-devtools doctor`, `control-ai-browsers doctor <name>`, `control-vitest-browser-angular doctor`, and `control-pangular-inspector doctor [--app-url <url>]`. Each SKILL.md has a dedicated "Doctor" section listing the exact checks (e.g. `process-alive`, `ports`, `build-log`, `console-errors`, `map-fresh`).
- **Source**: the five control SKILL.md files under `.claude/skills/control-*/SKILL.md` (Doctor sections)
- **Confidence**: high
- **Why it matters here**: Success criterion SC3 requires every control skill's documented check command to run in its verify sidecar without manual bridging; `doctor` is the primary per-skill check command.

## Finding: `control-pangular-inspector` additionally documents a `check` command

- **Claim**: `control-pangular-inspector` is the only control skill with a separate `check` subcommand: `node .claude/skills/control-pangular-inspector/scripts/control.mjs check` verifies six setup facts (package pin 0.0.7, overlay import, proxy, proxyConfig) read-only, exiting 0/1 (or 2 when the app cannot be found); documented in its Helpers table and used by `verify-pangular-inspector`'s `setup` check.
- **Source**: `.claude/skills/control-pangular-inspector/SKILL.md` Helpers table and verify-pangular-inspector/SKILL.md Checks table (`setup`)
- **Confidence**: high
- **Why it matters here**: The M003 sidecar bridge must let this setup check run in a fresh sidecar; it is the one control-side check that is not a `doctor`.

## Finding: Verify skills document their check scripts and how to invoke them

- **Claim**: The three verify skills document exact check scripts and invocation: `verify-ai-browsers` runs `checks/state.mjs` and `checks/model-init.mjs`; `verify-angular-devtools` runs `checks/extension-enabled.mjs`, `checks/attached.mjs`, `checks/coexist.mjs` (with `--di-graph`); `verify-pangular-inspector` runs `checks/setup.mjs`, `checks/live-reads.mjs`, `checks/read-only.mjs`. Each SKILL.md "Run" section gives the exact `node .claude/skills/verify-*/checks/<id>.mjs` commands and the standalone invocation form.
- **Source**: `.claude/skills/verify-ai-browsers/SKILL.md`, `.claude/skills/verify-angular-devtools/SKILL.md`, `.claude/skills/verify-pangular-inspector/SKILL.md` (Run sections); checks directory listings
- **Confidence**: high
- **Why it matters here**: These checks are the SC3 "control/verify skill checks" that must pass in sidecars; their documented commands must remain runnable after the dependency bridge and artifact relocation.

## Finding: Manual sidecar dependency bridge is documented in AGENTS.md

- **Claim**: AGENTS.md's "Verify sidecar dependencies" section documents the manual workaround: create a directory junction `mklink /J <sidecar>\node_modules <primary>\node_modules` before running `npm run check`/`npm test` in a sidecar, then remove it before retiring the sidecar; `isolation.py retire --force` clears stale sidecars.
- **Source**: AGENTS.md lines 12-19
- **Confidence**: high
- **Why it matters here**: M003 must automate this bridge while keeping the manual procedure working (prohibition N3); this is the documented baseline the automatic bridge replaces.

## Assigned questions — answers

- Which exact control-skill check commands exist and where are they documented? → Root: `npm run check`, `npm test` (package.json, AGENTS.md). Per control skill: `doctor` (each SKILL.md Doctor section), `fingerprint.mjs check` (each SKILL.md Helpers section), and `control-pangular-inspector check` (its Helpers table). Per verify skill: the check scripts listed in each verify SKILL.md Run section (`state.mjs`, `model-init.mjs`, `extension-enabled.mjs`, `attached.mjs`, `coexist.mjs`, `setup.mjs`, `live-reads.mjs`, `read-only.mjs`). Sidecar manual bridge: `mklink /J ...` in AGENTS.md.

## Dead ends

- Searched control skills for a top-level "check" command other than pangular-inspector's → none; `doctor` and `fingerprint.mjs check` are the only documented check surfaces for the other four control skills.
- Searched for a central registry/manifest listing check commands → none; commands are documented per-skill in SKILL.md files and invoked through `lars-verify` contracts.