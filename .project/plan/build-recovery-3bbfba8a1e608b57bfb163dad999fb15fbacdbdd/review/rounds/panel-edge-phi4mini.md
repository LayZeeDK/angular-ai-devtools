# Panel verification — edge-phi4mini

Instance `edge-phi4mini` (port 9337), model Phi-4-mini-instruct.
Each flow ran as a `lars-verify` verdict with two runs of the named check.

## N1

- Verdict path: `.commandcode/worktrees/tmp/verdict-extension-panel-edge-phi4mini/verdict.json`
- Verdict: verified
- Claim: On edge-phi4mini the Angular AI DevTools panel drives the inspected page, records change-detection cycles and its Explain button returns a non-empty answer through the Prompt API.
- Runs: head passed all 2 runs.

## N2

- Verdict path: `.commandcode/worktrees/tmp/verdict-signal-provenance-edge-phi4mini/verdict.json`
- Verdict: verified
- Claim: On edge-phi4mini the panel's Signal Provenance view renders a provenance chain from angular-ai:record facts and its Explain button returns a non-empty answer through the panel-local Prompt API.
- Runs: head passed all 2 runs.

## N3

- Verdict path: `.commandcode/worktrees/tmp/verdict-di-doctor-edge-phi4mini/verdict.json`
- Verdict: verified
- Claim: On edge-phi4mini the panel's DI doctor view answers a provider query for a picked component and its Explain button returns a non-empty answer through the panel-local Prompt API.
- Runs: head passed all 2 runs.

## Instance hygiene

The instance and the development page were stopped after the runs; `instances` reported
`edge-phi4mini: stopped`.
