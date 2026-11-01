---
id: T008
title: Make npm run check type-check the panel and leave npm test green at the head
wave: 4
deps: [T001, T002, T003, T004, T005, T006, T007]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/tsconfig.check.json
  - package.json
  - scripts/panel-typecheck-scope.test.mjs
  - .project/research/DOCS-AUDIT.md
---

# T008 — Make npm run check type-check the panel and leave npm test green at the head

## Context

`npm run check` never type-checks the panel: the root `tsconfig.json` includes three entries — two
absolute `~/.commandcode/scripts/install-pstack-opencode*.mjs` paths and
`scripts/opencode-pstack-plugin.ts` — and `check` is `node scripts/ensure-sidecar-deps.mjs && tsc -p
tsconfig.json && npm run check:skills`, so nothing under `apps/`, `src/` or `extension/` is compiled.
SC5 requires the registry and the extension sources to be type-checked and `npm test` to pass at the
head, and `npm test` is red today for an unrelated reason: the disposition test's inventory rule
reports `plans/gsd-path-handoff-M018.md` as a document `.project/research/DOCS-AUDIT.md` does not
cover, and the audit's `## Remediation queue` section is missing in the working copy, which fails E5
and E7 before they reach their rules. This task closes both halves of the criterion and measures the
panel's initial bundle against the hard 520 KB budget (AR-1) that the registry now sits on.

## Approach

- Measured at this head, so do not re-derive it: `tsc -p apps/angular-ai-devtools/tsconfig.app.json
  --noEmit` fails with five TS6059 errors, because that config's `outDir` implies a `rootDir` of
  `apps/angular-ai-devtools` while the panel imports `../../../../src/main-world/*` and `src/panel/*`.
  A dedicated check config that `extends "./tsconfig.spec.json"` with `noEmit: true`, `outDir: null`,
  `allowImportingTsExtensions: true`, `include: ["src/**/*.ts", "src/**/*.d.ts"]` and `exclude:
  ["src/**/*.node.test.ts", "src/**/*.node.spec.ts"] type-checks the panel, its specs and everything
  it imports with zero errors — measured on this host before this plan was written, and re-measure it
  after the milestone's modules land.
- Do not widen the include to `../../src/main-world/**/*.ts`: that drags
  `src/main-world/provenance-tracer.ts` into the program (a pre-existing TS4104 at line 121) and its
  `node:test` spec (two TS2591 errors plus a TS5097). The panel imports none of it; TypeScript already
  follows the app's real imports into `src/main-world/` and `src/panel/`, which is what the check
  must cover.
- `package.json`: `check` becomes the existing chain with `&& npm run check:panel` appended, and a new
  `check:panel` runs `tsc -p apps/angular-ai-devtools/tsconfig.check.json`. N4 is the constraint:
  `tsc -p tsconfig.json` and `npm run check:skills` still run, the root `tsconfig.json`'s three
  include entries are untouched, and no `@ts-ignore`, `skipLibCheck` widening or `exclude` of panel
  code is used to make the new stage pass. A narrowed check is the defect restated.
- The breadth pin is `scripts/panel-typecheck-scope.test.mjs`: `node:test` + `node:assert/strict`,
  picked up by `npm test`'s `"scripts/**/*.test.mjs"` glob, resolving the repository root from
  `import.meta.url`. It asserts that `check` chains `check:panel`, that `check:panel` names the panel
  config, that the config's include covers `src/**/*.ts`, that the root `tsconfig.json` still lists its
  three entries, and that `tsc -p apps/angular-ai-devtools/tsconfig.check.json --listFiles` lists the
  registry and the tools this milestone added — a registry outside the program cannot appear there.
  Then prove the stage can fail: a temp config under `os.tmpdir()` extending the real one with one
  extra temp file holding a deliberate type error exits non-zero, and the same file fixed exits zero.
  Write nothing into the checkout.
- `npm test` at the head: bring `.project/research/DOCS-AUDIT.md` to a state the gate accepts. Cover
  every document `check_docs_audit.py --emit-inventory` derives (including
  `plans/gsd-path-handoff-M018.md`), keep a `## Remediation queue` holding one classified row per
  non-verified claim, keep the Summary tallies equal to the body, and preserve the `## User rulings`
  prior-prefix property that the gate validates with `--prior-audit`. Do not edit
  `scripts/docs-audit-disposition.test.mjs`, do not delete queue rows to quiet the gate, and do not
  weaken a rule to reach green.
- `npm test` is not hermetic: its second and third stages read `~/.commandcode` and the gate script is
  the installed the installed docs-audit checker. Record the before/after output in the
  Log, including the paths the failing stages named, so a later reader can tell a repo fix from a host
  difference.
- Bundle gate: run `npx nx run angular-ai-devtools:build-extension` and record the emitted initial
  totals. The registry sits on the panel's initial-bundle path; the 520 KB initial budget must not
  warn. The measured baseline before this milestone was ~506.6 KiB eager (~518 798 B) with the 61.6 KB
  error digest inside `main.js`, i.e. ~13.7 KiB of headroom. If the new code pushes the initial total
  over 520 KB, report it rather than raise the budget.
- Verify runs the panel type-check stage, the pin, `npm run check`, `npm test` and the extension
  build; it is the milestone's heaviest command and must not run beside another heavy Verify.

## Interface contract

- None

## Intent coverage

- SC5

## Acceptance criteria

1. `npm run check` gains a final `check:panel` stage that runs `tsc -p apps/angular-ai-devtools/tsconfig.check.json`, and that config type-checks `apps/angular-ai-devtools/src/**/*.ts` plus everything the panel imports from `src/main-world/` and `src/panel/` — the registry, the tools and the specs this milestone added are now covered.
2. N4: nothing is narrowed or removed — `tsc -p tsconfig.json` and `npm run check:skills` still run, the root `tsconfig.json` keeps its three include entries, and the diff adds no `@ts-ignore`, no `skipLibCheck` widening and no exclusion of panel code.
3. `scripts/panel-typecheck-scope.test.mjs` pins the breadth — the `check` chain, the panel config's include, the root tsconfig's intact entries — and proves the stage bites: `--listFiles` lists the milestone's new modules, and a temp copy carrying a deliberate type error fails while the fixed copy passes.
4. `npm test` is green at the head: `.project/research/DOCS-AUDIT.md` covers every document the gate derives including `plans/gsd-path-handoff-M018.md`, carries an accepted `## Remediation queue` with one classified row per non-verified claim, keeps its Summary tallies consistent, and preserves the `## User rulings` prior-prefix property; `scripts/docs-audit-disposition.test.mjs` is unmodified.
5. `npx nx run angular-ai-devtools:build-extension` completes with no initial-budget warning, the measured initial totals are recorded in the Log beside the pre-milestone baseline, and no `*.component.ts` file changed.
6. No gate, check, test or assertion is weakened anywhere in the plan to reach green: the Log records the before and after output of every stage that changed colour, with the paths the failing stage named.

## Verify

```bash
npm ci && node --experimental-strip-types --test scripts/panel-typecheck-scope.test.mjs && npm run check && npm test && npx nx run angular-ai-devtools:build-extension
```

Heavy: yes

## Log

- 2026-11-01 — created by planner
