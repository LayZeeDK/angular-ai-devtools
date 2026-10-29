# Panel verification — chrome-stable-nano

Instance `chrome-stable-nano` (port 9338), model v3Nano.
Each flow ran as a `lars-verify` verdict with two runs of the named check.

## N1

- Verdict path: `.commandcode/worktrees/tmp/verdict-extension-panel-chrome-stable-nano/verdict.json`
- Verdict: verified
- Claim: On chrome-stable-nano the Angular AI DevTools panel drives the inspected page, records change-detection cycles and its Explain button returns a non-empty answer through the Prompt API.
- Runs: head passed all 2 runs.

## N2

- Verdict path: `.commandcode/worktrees/tmp/verdict-signal-provenance-chrome-stable-nano/verdict.json`
- Verdict: verified
- Claim: On chrome-stable-nano the panel's Signal Provenance view renders a provenance chain from angular-ai:record facts and its Explain button returns a non-empty answer through the panel-local Prompt API.
- Runs: head passed all 2 runs.

## N3

- Verdict path: `.commandcode/worktrees/tmp/verdict-di-doctor-chrome-stable-nano/verdict.json`
- Verdict: verified
- Claim: On chrome-stable-nano the panel's DI doctor view answers a provider query for a picked component and its Explain button returns a non-empty answer through the panel-local Prompt API.
- Runs: head passed all 2 runs.

## Substitution

This pair replaces `edge-dev-aion`, which answers no panel drive within 20 minutes on this
host. The Aion evidence — two `verdict.mjs` runs at the 600 s/1800 s budgets plus a direct
20-minute `panel` call — is preserved in `panel-edge-dev-aion.md`.

## Instance hygiene

The instance and the development page were stopped after the runs; `instances` reported
`chrome-stable-nano: stopped`.
