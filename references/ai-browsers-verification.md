# Running the `state` and `extension-panel` verdicts

The claims and checks live in `.commandcode/skills/verify-ai-browsers` (`checks/state.mjs`,
`checks/extension-panel.mjs`). Verdicts come from `lars-verify`'s `verdict.mjs run` with `runs: 2`. This file records
what a run costs and what has gone wrong.

## What a run does and costs

- Setup starts the verified registry instances through `control-ai-browsers up`, one model per pair with the stable
  channel preferred: `chrome-stable-nano` (Gemini Nano), `chrome-beta-gemma4` (Gemma 4), `edge-phi4mini`
  (Phi-4-mini) and `edge-dev-aion` (Aion-1.1-Instruct). `chrome-beta-nano` serves the same `v3Nano` model as
  `chrome-stable-nano`, so it stays registered as a spare driver and unit-test fixture but is not part of the
  verified set (Lars, 2026-10-30). The instances belong to the primary checkout. A
  worktree or GSD Path sidecar reaches the same running instances, so its setup finds them running
  (`alreadyRunning`) and downloads nothing.
- `state` runs `doctor`, `flags` and `model info` per instance and checks that Broker State serves the registry
  model. A warm run's condition takes about 3 minutes for four instances; the whole two-run verdict takes 10-20
  minutes.
- `extension-panel` also needs the panel built (`npx nx run angular-ai-devtools:build-extension`) before `up`, and an
  Angular page (control-angular-dev-app `up --target counter`). Per instance it runs `panel` (answers took 3-14 s on
  2026-10-19) and then the `state` claim.
- Teardown is `down` per instance the setup started. The instances are shared, so an instance whose `up` reported
  `alreadyRunning` stays up for the other sessions.
- Five instances at once contend for memory, CPU and GPU (Lars, 2026-10-19: "Running all 5 in parallel puts system
  resources in contention. Keep that in mind if something fails."). Measured that day: Claude Code stopped a
  background run when free memory fell to about 3 GB of 32 GB, and one instance exited with no crash report. Prefer
  one or two instances at a time (`up`, check, `down`), and before calling a failure seen with all five up a
  defect, re-run it with that instance alone.
- Browsers with on-device models are heavy. One verdict was stopped by Claude Code for low memory (15 GB of 32 GB
  free after cleanup). Start with at least about 10 GB free, and nothing else heavy running.
- Limits: the checks give each `control.mjs` call 600 s (`spawnSync` timeout). The spec gives `state` 900 s and
  `extension-panel` 1800 s.

## Before starting

- Other agent sessions on this machine (Command Code, OpenCode, Claude Code) may run builds, test suites, Docker
  or timing benchmarks. Before a verdict, agree an order with each live session, announce "starting", and send
  "done" once `down` has run and nothing is left listening. A timing benchmark needs the machine fully quiet, not
  just free of heavy jobs.
- Check that port 9992 is free. Ports 9333-9338 belong to the shared instances; `control-ai-browsers instances`
  shows which run.

## After a run

- `verdict.mjs lint <verdict.json>` must exit 0.
- Nothing the run started may be left: no listener on 9992, no instance the setup started still running (with its
  `pipe-keeper.mjs`), and no playwright-cli session of the run. Instances that were already running stay up. If `down`
  exits 2 with a `survived` process, run `down` again; it keeps the state file until the tree is gone.

## Known failures

- 2026-10-17, inconclusive (`20261017T1200Z-state-rerun`): in run 1, `edge-phi4mini`'s `doctor` hung until the
  600 s step timeout killed it, with no doctor evidence written. On 2026-10-19 the same hang was reproduced on
  `edge-phi4mini` and `edge-dev-aion`. An Edge instance's `about:blank` tab, left idle for some minutes, still
  answered raw CDP, but every playwright-cli `run-code` on it, even `async page => 1+1`, waited forever. Opening a
  new blank tab and closing the idle one cleared it at once. Since then every `control.mjs` command swaps idle
  blank tabs before it attaches (control-ai-browsers Gotchas). That this was the 2026-10-17 cause is inferred from
  the matching symptom; it was not captured then.
- 2026-10-17, inconclusive before the Aion pin: `edge-dev-aion` failed when Edge updated its model past its
  manifest mid-run. Fixed by the pin: `references/edge-dev-aion-model.md`.
- Before 2026-10-19 every checkout had its own profiles, so a sidecar's setup started empty profiles. Chrome Beta
  then offered no model at all (On-Device AI off by default on a new pre-stable profile), and Edge Dev had no pin.
  Both are fixed: the instances are shared, and the Chrome instances list `OnDeviceAiDefaultEnabled`.
- An inconclusive verdict is never a pass. Re-run; do not raise the timeouts to make a hang pass.
