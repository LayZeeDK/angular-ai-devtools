---
id: T001
title: Run S16 companion-package Meta-class lookup spike
wave: 1
deps: [T002]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw
  - research/05-spikes.md
  - research/*.md
---

# T001 — Run S16 companion-package Meta-class lookup spike

## Context

S16 gates the companion package's main claim. Per SYNTHESIS, the lookup path is in the page's main world: walk the root component's `ɵgetInjectorResolutionPath`, read each injector's `ɵgetInjectorProviders` records, match by identity against `Meta` (expected absent → "provided, not created yet") and `Router` (expected present, `get` returns instance with matching `url`). Feature-detect each `ɵ` function; target root/environment injector; never `angular:di_graph` or `injector.get` on a `ViewContainerRef`.

## Approach

- Use identity-only matching; a second walk proves no `Meta` record appears.
- Never call `get` on a found `Router` lazily in a way that constructs; isolate failure modes (missing export, name-vs-identity, lazy `get` side effect, first-walk contamination).
- Run via `control-angular-dev-app` against the counter fixture; produce a new timestamped evidence file under `research/raw/`.
- Record exactly one verdict: `works`, `works-with-degradation`, or `fails`, with evidence reference; missing evidence leaves blocked.
- Prohibition N1: do not label measured without committed evidence artifact. N2: never overwrite/delete prior `research/raw/` evidence. N3: do not extend verdict into broader companion-package feasibility claim. N4: only non-daily profiles/control instances.
- Judgment prohibitions Must not: label a spike 'measured' without a committed evidence artifact; overwrite or delete prior `research/raw/` evidence files; extend S16's lookup verdict into a broader companion-package feasibility claim; drive Lars's daily `chrome`/`edge` browsers or branded profiles without explicit approval.

## Interface contract

- None

## Intent coverage

- SC1
- SC2

## Acceptance criteria

1. A new timestamped evidence file exists under `research/raw/` for S16 and is committed.
2. `research/05-spikes.md` (and matching note) records S16 as measured with the evidence path, or blocked with exact precondition.
3. S16 verdict is exactly one of `works` / `works-with-degradation` / `fails` with evidence reference; no broader companion-package feasibility claim.

## Verify

```bash
git diff --check && test -n "$(ls research/raw/*s16* 2>/dev/null || ls research/raw/*S16* 2>/dev/null)" 
```

Heavy: no

## Log

- created by planner