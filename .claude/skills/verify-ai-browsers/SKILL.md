---
name: verify-ai-browsers
description: Verify the built-in AI in the per-model browser instances (Chrome Beta with Gemini Nano or Gemma 4, Edge Dev with Aion-1.1-Instruct, Edge stable with Phi-4-mini) and report one verdict (verified, not verified, inconclusive) with JSON evidence. Checks each instance's command line against the registry, the model on disk and in on-device-internals Broker State, the CPU or GPU backend, free disk space, availability(), contextWindow, structured-output, tool-calling and WebMCP canaries, twice; and runs a model cycle on one instance (down, clear its model, up, download, initialise, check again). Reuses control-ai-browsers' control script and registry. Use after a browser update, after changing an instance or its backend, or before reporting a built-in AI result as proven.
---

# verify-ai-browsers

Turns `control-ai-browsers` into a verdict. `scripts/verify.mjs` runs that skill's `scripts/control.mjs` steps in
order, repeats the doctor, compares readings and writes `verdict.json`. Same instances, sessions (`ai-<instance>`)
and limits as `control-ai-browsers` (read its `SKILL.md` first); instances come from its `instances.json`. Lars's
own Chrome Beta, Edge Dev and everyday Edge are never touched.

## Launch

The four instances are standing processes; start a stopped one with
`node .claude/skills/control-ai-browsers/scripts/control.mjs up <instance>`. `verify.mjs` starts nothing
itself except in `cycle`, which stops and launches the instance it cycles. A step that cannot run (instance not
running, refusal) makes the verdict `inconclusive`.

## Doctor

`verify.mjs state` is the doctor-based verdict, for every instance or the ones named:

```bash
node .claude/skills/verify-ai-browsers/scripts/verify.mjs state
node .claude/skills/verify-ai-browsers/scripts/verify.mjs state edge-dev-aion chrome-beta-nano
```

Per instance: `control.mjs doctor` twice (a pass counts only when it repeats), `flags` (effective features
against the registry) and `model info`. The instance passes when both doctors and `flags` exit 0, the expected
model's manifest is on disk, and the model Broker State serves (from the weights path) is the expected one. The
verdict is `verified` only when every instance passes. `verdict.json` holds each instance's backend, requested
backend and performance class.

## Drive

The model cycle on one instance proves clearing, download and initialisation end to end:

```bash
node .claude/skills/verify-ai-browsers/scripts/verify.mjs cycle chrome-beta-nano [--timeout-min=45]
```

Steps: `model info` (records the running backend), `attach`, `down`, `model clear --confirm=<registry model>`,
`up --backend=<the backend it ran with>`, `model download`, `model init`, then the `state` checks. Verified
when every step exits 0, `init` reads the registry `contextWindow`, and the state checks pass. `verdict.json`
records `bytesRemoved`, the download gesture, duration and folder size, and the init timings. Measured with
`cycle chrome-beta-nano` (2026-10-12): verified, 4,269,934,855 bytes removed, downloaded again in 138 s by click,
about 4 minutes in all.

Cycle `chrome-beta-nano` or an Edge instance. Do not cycle `chrome-beta-gemma4` to clear Nano there: `cycle`
clears the instance's own model (Gemma 4), and the extra Nano folders in that profile come back by themselves
(`control-ai-browsers/features/model-lifecycle.md`). For single checks or a probe, use `control-ai-browsers`
directly; its `features/` map is the recipe source for both skills.

## Evidence

Each run writes into `tmp/verify-ai-browsers/<YYYYMMDD-HHMMSS>-<mode>/` (git-ignored) or `--evidence=<dir>`: one
JSON per control step plus `verdict.json` with the verdict, the per-instance results and every step's command,
exit code, duration and evidence path. Proof rules: `control-ai-browsers/features/README.md`.

## Cleanup

`verify.mjs` leaves every instance running, as it found it; `cycle` relaunches the instance at the backend it ran
with. Each control step closes the tabs it opened and detaches the session it attached. A run that stops early
can leave the cycled instance stopped: run `control.mjs up <instance>`, then `state` again.

## Helpers

`scripts/verify.mjs state [<instance>...] | cycle <instance> [--timeout-min=45] [--evidence=<dir>]`

| Exit | Verdict |
|---|---|
| 0 | verified |
| 1 | not verified (a check or a model match failed; `verdict.json` names it) |
| 2 | inconclusive (a step was refused or could not run: instance stopped, download refused for space, bad arguments) |

## Gotchas

- `state` takes 1-2 minutes per instance (two doctors, `flags`, `model info`; measured 1.3-2.3 min), longer while
  another session loads the machine.
- `edge-phi4mini` came out `not verified` on 2026-10-12: one of its two doctors failed `canary.structured` with
  `kErrorUnknown`. That is the model, not the harness; report it as found.
- `cycle` needs the instance running at the start: it reads the backend from the live command line and needs a
  state file for `down`.
- A cycle on Nano deletes both variants when both are on disk and downloads back only the one its backend uses.
- Chrome may finish the download before `model download` starts (the profile has the use case Requested); the
  download step then reports `alreadyAvailable` and the cycle still counts.
