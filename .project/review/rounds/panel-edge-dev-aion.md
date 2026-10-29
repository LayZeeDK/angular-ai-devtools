# Panel verification — edge-dev-aion

Instance `edge-dev-aion` (port 9335), model Aion-1.1-Instruct, runtime 2026.10.2.1 (pinned).
All three flows are recorded `unverifiable`: the control precondition never passed, so no flow
could be driven.

## N1

- Verdict path: `.commandcode/worktrees/tmp/verdict-extension-panel-edge-dev-aion/verdict.json`
- Verdict: unverifiable
- Claim: On edge-dev-aion the Angular AI DevTools panel drives the inspected page, records change-detection cycles and its Explain button returns a non-empty answer through the Prompt API.
- Reason: `verdict.mjs` returned `inconclusive` — `control.mjs doctor edge-dev-aion` exited `null` (killed at its 600 s budget) in both runs, so the `extension-panel` check refused to drive the panel. `control.mjs flags`, `info` and `model-info` answered for the same instance.
- Recovery: ran the documented idle-blank-tab recovery (every `control.mjs` command swaps idle blank tabs before attaching), brought the instance up fresh, and drove it alone — no other instance or page was open. `doctor` still exceeded the budget.
- Budget: 600 s per control call, 1800 s per verdict; observed `doctor` > 600 s and > 600 s again in a fresh foreground call.
- Route tried: `up edge-dev-aion` → `doctor edge-dev-aion` (twice, 600 s each; second one killed by a 600 s foreground timeout) → `verdict.mjs run` for `extension-panel` with the full 1800 s budget.

## N2

- Verdict path: none — not run (the N1 precondition failed for the same instance)
- Verdict: unverifiable
- Claim: On edge-dev-aion the panel's Signal Provenance view renders a provenance chain from angular-ai:record facts and its Explain button returns a non-empty answer through the panel-local Prompt API.
- Reason: the `signal-provenance` check calls the same `doctor` precondition, which exceeds its 600 s budget on this instance.
- Recovery: same idle-blank-tab recovery, fresh `up`, instance driven alone.
- Budget: 600 s per control call, 1800 s per verdict.
- Route tried: `up` + `doctor` first; no drive was attempted after `doctor` failed twice.

## N3

- Verdict path: none — not run (the N1 precondition failed for the same instance)
- Verdict: unverifiable
- Claim: On edge-dev-aion the panel's DI doctor view answers a provider query for a picked component and its Explain button returns a non-empty answer through the panel-local Prompt API.
- Reason: the `di-doctor` check calls the same `doctor` precondition, which exceeds its 600 s budget on this instance.
- Recovery: same idle-blank-tab recovery, fresh `up`, instance driven alone.
- Budget: 600 s per control call, 1800 s per verdict.
- Route tried: `up` + `doctor` first; no drive was attempted after `doctor` failed twice.

## Evidence

- `verdict.json` above records `inconclusive` with `reason: the pass condition exited 2, not 0 or 1` and the per-run step timings (condition 847 s and 847 s).
- Run 1 condition stderr: `[ERROR] could not run: edge-dev-aion: doctor edge-dev-aion exited null:`
- Instances and page were stopped after the run; no tab was left open.
