# Running the four-instance `state` verdict

The claim and the check live in `.claude/skills/verify-ai-browsers` (check `checks/state.mjs`); verdicts come
from `lars-verify`'s `verdict.mjs run` with `runs: 2`. This file records what a run costs and what has gone wrong.

## What a run does and costs

- Setup starts all four instances (`chrome-beta-nano`, `chrome-beta-gemma4`, `edge-dev-aion`, `edge-phi4mini`)
  through `control-ai-browsers up`. The condition runs `doctor`, `flags` and `model info` per instance and checks
  that Broker State serves the registry model. Teardown is `down` per instance.
- A warm run's condition takes about 3 minutes; the whole two-run verdict about 10-20 minutes.
- Four browsers with on-device models are heavy. One verdict was stopped by Claude Code for low memory (15 GB of
  32 GB free after cleanup). Start with at least about 10 GB free, and nothing else heavy running.
- Limits: `state.mjs` gives each `control.mjs` call 600 s (`spawnSync` timeout); the spec gives the condition
  900 s.

## Before starting

- Other Claude sessions on this machine may run builds, test suites, Docker or timing benchmarks. Before a
  verdict, ask each live session (`ListAgents`, then `SendMessage`) whether it has heavy work running or queued,
  agree an order, announce "starting", and send "done" once `down` has run and nothing is left listening. A
  timing benchmark needs the machine fully quiet, not just free of heavy jobs.
- Check that ports 9333-9337 and 9992 are free and `playwright-cli list` is empty.

## After a run

- `verdict.mjs lint <verdict.json>` must exit 0.
- Nothing may be left: no listener on 9333-9337 or 9992, no process using a `.browsers/` profile,
  `playwright-cli list` empty. If `down` exits 2 with a `survived` process, run `down` again; it keeps the state
  file until the tree is gone.

## Known failures

- 2026-10-17, inconclusive (`20261017T1200Z-state-rerun`): run 2 passed; in run 1 `edge-phi4mini`'s `doctor`
  hung from 15:32:30 until the 600 s step timeout killed it, so the condition hit 900 s. It wrote no doctor
  evidence. The next verdict, started about 40 minutes later, passed 2/2 with that doctor at about 40 s. Three
  cold up / doctor / down cycles later the same day all passed, in 64, 32 and 20 s (evidence
  `tmp/control-ai-browsers/evidence/phi4mini-hang`). Not reproduced, cause not found; the 600 s step timeout turns
  a hang into an inconclusive verdict. If it hangs again, capture what the doctor was waiting on before re-running.
- 2026-10-17, inconclusive before the Aion pin: `edge-dev-aion` failed when Edge updated its model past its
  manifest mid-run. Fixed by the pin: `references/edge-dev-aion-model.md`.
- An inconclusive verdict is never a pass. Re-run; do not raise the timeouts to make a hang pass.
