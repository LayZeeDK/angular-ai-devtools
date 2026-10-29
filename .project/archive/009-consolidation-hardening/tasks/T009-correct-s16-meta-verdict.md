---
id: T009
title: Correct the S16 "works" verdict where Meta is absent
wave: 5
deps: []
status: done
agent: build_T009
base: eec3c0f8f90259aed91e9b63e91bb2920fce0772
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
- T009 implemented: corrected S16 verdict to works-with-degradation (with reason) in research/raw/s16-meta-lookup.json and research/05-spikes.md; Verify passed.
- 2026-10-29 — orchestrator Verify (isolate gsd-path-task/T009): pass, exit 0; output tail:
  ```
  
  17 vulnerabilities (8 moderate, 7 high, 2 critical)
  
  To address issues that do not require attention, run:
    npm audit fix
  
  To address all issues (including breaking changes), run:
    npm audit fix --force
  
  Run `npm audit` for details.
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  ```
