# Handoff — resume M018 (instrument-core)

Written 2026-11-01 at the point where the previous session ran out of context.
The pipeline is in a clean, resumable state: **no sidecars exist, no worktrees are
stranded, nothing is half-written.**

## Where the pipeline is

| Field | Value |
|---|---|
| phase / status | `inspect` / `active` |
| branch | `gsd-path/M018` (bound; `gsd-path/M017` retired locally and on origin) |
| milestone | `null` — generation 1 is not in `ROADMAP.md` yet |
| archive | `null` |
| HEAD | `b165ae2a6b55c7a135a2d83de9ff58da9080651a` |
| base after bind | `88274697e47c5bfe5ea858e0b07ea7b0fd5e398b` |
| previous ship | `f983b0b4f1b9e4a167b2da37ecaf67daa2723834`, integrated at `62a10a7` |

## Already done and durable

- `plans/angular-ai-devtools-program-backlog.md` — on `main` at `8827469`.
  Generation 1 is twelve milestones in full roadmap format; generations 2-7 are
  ordered backlog with their spike gates.
- `.project/CHARTER.md` `## Corrections` — A1-A9, AR-1-AR-7, and the delivery
  structure. Commit `b165ae2`.
- `.project/STATE.md` — opened to `inspect/active` by transition, event
  "M017 shipped and integrated on 62a10a7; bound gsd-path/M018 at 8827469;
  programme 1 open".

## Next command

```
python -B "%USERPROFILE%\.commandcode\skills\gsd-path\scripts\pipeline_state.py" route --repo D:\projects\sandbox\angular-ai-devtools --project-dir .project
```

It returns `run-phase inspect`, normal mode. Follow the **re-inspection** recipe in
`~/.commandcode/skills/gsd-path/INSPECT.md` lines 84-111, not `prepare-inspect`.

## Measured facts that save the next session a detour

- `workflow_run.py prepare-inspect` **refuses** with "prior inspection evidence
  requires the re-inspection contract", because `.project/research/DOCS-AUDIT.md`
  exists. That is expected; do not retry it.
- Frozen inventory: **143 documents** from
  `check_docs_audit.py --repo <root> --emit-inventory`.
- Prior audit `Audited HEAD: bfc4656b0c475769af3ddd162206e7a11776bfe2`, which is an
  ancestor of HEAD, so the changed set carries forward and only changed documents
  need re-auditing.
- `isolation.py isolate-verify` requires `--repo --base --name`, and **`--base` must
  be a full 40-character SHA** — a short SHA is rejected. Suggested names:
  `m018-inspect-docs`, `m018-inspect-codebase`.
- Copy the prior audit out first (`copy .project\research\DOCS-AUDIT.md
  "%TEMP%\prior-audit.md"`); `gsd inspect assemble --prior-audit` consumes it.
- Delete `<docs worktree>/.project/research/parts/` **before** `collect-artifact`, or
  the collector treats the chunk briefs as unexpected paths.

## Constraints the next session must not violate

- Panel initial-bundle budget is **520 KB** (`project.json`,
  `build-extension`). Material + CDK + Aria must fit or be lazily loaded.
- AR-2: no Angular in the inspected page; the overlay is plain DOM in a closed
  Shadow DOM. AR-3: the overlay is the only DOM added to an inspected page. AR-4:
  every `MutationObserver` excludes the tool's host subtree.
- AR-6: confirmations, toasts, inputs and navigation live in the panel.
- M018's envelope must be validated by **six hostile tools** — a write with confirm,
  an async handle, an image result, a two-host read, a wrapped third-party tool, and
  a page-state-dependent schema. That requirement came from the architecture review
  and is what stops the envelope being designed against two friendly reads.
- `@angular/animations` is out. Modern APIs only. No NgModules, no `*ngIf`/`*ngFor`,
  no decorator inputs, no Zone.js assumptions.

## What generation 1 builds

M018 instrument-core, M019 context-and-jobs, M020 feature-fingerprint,
M021 optin-companion, M022 in-page-overlay, M023 fixture-components,
M024 panel-verify-breadth, then M025-M029 (image-budget-audit,
after-render-ordering, trust-bypass-triage, redirect-chain,
cross-field-validation).

**M018 is the next milestone to ship.** Its full roadmap entry is in §3 of
`plans/angular-ai-devtools-program-backlog.md`.

## Two unresolved owner questions carried forward

1. Generation 1 must be admitted into `CHARTER.md`'s `Full scope: in` as a
   Correction when the roadmap phase runs, or the roadmap gate's charter-to-milestone
   bijection fails.
2. The `debugger` permission is granted (A7) but the CDP trace has never been
   exercised on this host; M038 depends on it.
