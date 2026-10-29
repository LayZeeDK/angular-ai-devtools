---
id: T009
title: Correct the S16 "works" verdict where Meta is absent
wave: 5
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/s16-meta-lookup.json
  - research/05-spikes.md
---

# T009 — Correct the S16 "works" verdict where Meta is absent

## Context

M001 F1 (blocking): `research/raw/s16-meta-lookup.json:15-17` and `research/05-spikes.md:15-17` record verdict "works" while `Meta` is absent. Remedy: change the recorded verdict to `works-with-degradation` (or `fails`) and update `research/05-spikes.md` to match. SC1: every defect found by the hardening review is fixed or explicitly accepted with a written reason. SC6: no new feature or public behavior change. N2 (SC6): no public behavior change under a fix. N5 (SC1): no defect recorded fixed without a fix commit or written acceptance.

## Approach

- Correct the verdict string and note in both `research/raw/s16-meta-lookup.json` and `research/05-spikes.md` so they agree and no longer claim "works" where `Meta` is absent.
- Keep the change documentation-only; no code or public behavior change (N2).
- Record the fix commit in the task Log.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. Neither `research/raw/s16-meta-lookup.json` nor `research/05-spikes.md` records "works" for the S16 case where `Meta` is absent.
2. The two files agree on the corrected verdict and note.
3. No code or public behavior change is introduced.

## Verify

```bash
npm ci && node -e "const fs=require('fs');const [j,d]=process.argv.slice(1).map((p)=>fs.readFileSync(p,'utf8'));const v=String(JSON.parse(j).verdict);if(v==='works'){console.error('s16 verdict is still works');process.exit(1);}if(!/works-with-degradation|fails/.test(v)){console.error('unexpected s16 verdict: '+v);process.exit(1);}if(/Verdict:\s*[*][*]works[*][*]/.test(d)){console.error('05-spikes.md still records works');process.exit(1);}" research/raw/s16-meta-lookup.json research/05-spikes.md
```

Heavy: no

## Log

- created by planner