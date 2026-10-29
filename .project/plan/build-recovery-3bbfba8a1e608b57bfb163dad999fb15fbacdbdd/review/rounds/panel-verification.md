# Panel verification

Supported model pairs: chrome-beta-nano, chrome-beta-gemma4, edge-phi4mini, chrome-stable-nano.

## chrome-beta-nano

### N1

- Verdict path: .commandcode/worktrees/tmp/verdict-extension-panel-chrome-beta-nano/verdict.json
- Verdict: verified
- Claim: On chrome-beta-nano, the Angular AI DevTools extension's first feature runs in the DevTools panel: Explain version with AI renders an answer from the Prompt API, and the instance passes the state claim.

### N2

- Verdict path: .commandcode/worktrees/tmp/verdict-signal-provenance-chrome-beta-nano/verdict.json
- Verdict: verified
- Claim: On chrome-beta-nano, the Angular AI DevTools extension's signal provenance flow (N2) runs in the DevTools panel: the Signal Provenance tab renders the provenance chain, and Explain renders an answer from the panel-local Prompt API.

### N3

- Verdict path: .commandcode/worktrees/tmp/verdict-di-doctor-chrome-beta-nano/verdict.json
- Verdict: verified
- Claim: On chrome-beta-nano, the Angular AI DevTools extension's DI doctor flow (N3) runs in the DevTools panel: querying an injector returns angular-ai:di-graph with a DiResolutionPath, and the resolution path renders, explained through the panel-local Prompt API.

## chrome-beta-gemma4

### N1

- Verdict path: .commandcode/worktrees/tmp/verdict-extension-panel-chrome-beta-gemma4/verdict.json
- Verdict: verified
- Claim: On chrome-beta-gemma4, the Angular AI DevTools extension's first feature runs in the DevTools panel: Explain version with AI renders an answer from the Prompt API, and the instance passes the state claim.

### N2

- Verdict path: .commandcode/worktrees/tmp/verdict-signal-provenance-chrome-beta-gemma4/verdict.json
- Verdict: verified
- Claim: On chrome-beta-gemma4, the Angular AI DevTools extension's signal provenance flow (N2) runs in the DevTools panel: the Signal Provenance tab renders the provenance chain, and Explain renders an answer from the panel-local Prompt API.

### N3

- Verdict path: .commandcode/worktrees/tmp/verdict-di-doctor-chrome-beta-gemma4/verdict.json
- Verdict: verified
- Claim: On chrome-beta-gemma4, the Angular AI DevTools extension's DI doctor flow (N3) runs in the DevTools panel: querying an injector returns angular-ai:di-graph with a DiResolutionPath, and the resolution path renders, explained through the panel-local Prompt API.

## edge-phi4mini

### N1

- Verdict path: `.commandcode/worktrees/tmp/verdict-extension-panel-edge-phi4mini/verdict.json`
- Verdict: verified
- Claim: On edge-phi4mini the Angular AI DevTools panel drives the inspected page, records change-detection cycles and its Explain button returns a non-empty answer through the Prompt API.
- Runs: head passed all 2 runs.

### N2

- Verdict path: `.commandcode/worktrees/tmp/verdict-signal-provenance-edge-phi4mini/verdict.json`
- Verdict: verified
- Claim: On edge-phi4mini the panel's Signal Provenance view renders a provenance chain from angular-ai:record facts and its Explain button returns a non-empty answer through the panel-local Prompt API.
- Runs: head passed all 2 runs.

### N3

- Verdict path: `.commandcode/worktrees/tmp/verdict-di-doctor-edge-phi4mini/verdict.json`
- Verdict: verified
- Claim: On edge-phi4mini the panel's DI doctor view answers a provider query for a picked component and its Explain button returns a non-empty answer through the panel-local Prompt API.
- Runs: head passed all 2 runs.

## chrome-stable-nano

### N1

- Verdict path: `.commandcode/worktrees/tmp/verdict-extension-panel-chrome-stable-nano/verdict.json`
- Verdict: verified
- Claim: On chrome-stable-nano the Angular AI DevTools panel drives the inspected page, records change-detection cycles and its Explain button returns a non-empty answer through the Prompt API.
- Runs: head passed all 2 runs.

### N2

- Verdict path: `.commandcode/worktrees/tmp/verdict-signal-provenance-chrome-stable-nano/verdict.json`
- Verdict: verified
- Claim: On chrome-stable-nano the panel's Signal Provenance view renders a provenance chain from angular-ai:record facts and its Explain button returns a non-empty answer through the panel-local Prompt API.
- Runs: head passed all 2 runs.

### N3

- Verdict path: `.commandcode/worktrees/tmp/verdict-di-doctor-chrome-stable-nano/verdict.json`
- Verdict: verified
- Claim: On chrome-stable-nano the panel's DI doctor view answers a provider query for a picked component and its Explain button returns a non-empty answer through the panel-local Prompt API.
- Runs: head passed all 2 runs.

## edge-dev-aion

This instance answers no panel drive within 20 minutes; see `panel-edge-dev-aion.md` for the full evidence.

### N1

- Verdict path: `.commandcode/worktrees/tmp/verdict-extension-panel-edge-dev-aion/verdict.json`
- Verdict: unverifiable
- Claim: On edge-dev-aion the Angular AI DevTools panel drives the inspected page, records change-detection cycles and its Explain button returns a non-empty answer through the Prompt API.
- Reason: `verdict.mjs` returned `inconclusive` — `control.mjs doctor edge-dev-aion` exited `null` (killed at its 600 s budget) in both runs, so the `extension-panel` check refused to drive the panel. `control.mjs flags`, `info` and `model-info` answered for the same instance.
- Recovery: ran the documented idle-blank-tab recovery (every `control.mjs` command swaps idle blank tabs before attaching), brought the instance up fresh, and drove it alone — no other instance or page was open. `doctor` still exceeded the budget.
- Budget: 600 s per control call, 1800 s per verdict; observed `doctor` > 600 s and > 600 s again in a fresh foreground call.
- Route tried: `up edge-dev-aion` → `doctor edge-dev-aion` (twice, 600 s each; second one killed by a 600 s foreground timeout) → `verdict.mjs run` for `extension-panel` with the full 1800 s budget.

### N2

- Verdict path: none — not run (the N1 precondition failed for the same instance)
- Verdict: unverifiable
- Claim: On edge-dev-aion the panel's Signal Provenance view renders a provenance chain from angular-ai:record facts and its Explain button returns a non-empty answer through the panel-local Prompt API.
- Reason: the `signal-provenance` check calls the same `doctor` precondition, which exceeds its 600 s budget on this instance.
- Recovery: same idle-blank-tab recovery, fresh `up`, instance driven alone.
- Budget: 600 s per control call, 1800 s per verdict.
- Route tried: `up` + `doctor` first; no drive was attempted after `doctor` failed twice.

### N3

- Verdict path: none — not run (the N1 precondition failed for the same instance)
- Verdict: unverifiable
- Claim: On edge-dev-aion the panel's DI doctor view answers a provider query for a picked component and its Explain button returns a non-empty answer through the panel-local Prompt API.
- Reason: the `di-doctor` check calls the same `doctor` precondition, which exceeds its 600 s budget on this instance.
- Recovery: same idle-blank-tab recovery, fresh `up`, instance driven alone.
- Budget: 600 s per control call, 1800 s per verdict.
- Route tried: `up` + `doctor` first; no drive was attempted after `doctor` failed twice.

## Insurance portal

- Checkout path: D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools
- Exists on disk: yes
- Verdict: unverifiable
- Reason: no `lars-verify` verdict was taken against the external portal in this milestone; the four supported model pairs were checked against the counter fixture, and the portal checkout is named here so the claim records its external dependency.
- Dependency: external dependency — the insurance-portal checkout was not driven in this run; no verdict was taken there, so the row stays unverifiable.
