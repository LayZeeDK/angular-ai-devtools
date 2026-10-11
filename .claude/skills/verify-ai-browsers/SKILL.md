---
name: verify-ai-browsers
description: Verify the built-in AI in Lars's Chrome Beta (Gemma 4 / Gemini Nano) and Edge Dev (Aion / default model) and report one verdict (verified, not verified, inconclusive) with JSON evidence. Checks required flags, the model on disk and in on-device-internals Broker State, free disk space, availability(), contextWindow, structured-output, tool-calling and WebMCP canaries, twice; and runs a full comparison-model cycle (switch away, download, init, optional benchmark, switch back, clear the comparison model). Reuses control-ai-browsers' control script. Use after a browser update, after changing flags or models, or before reporting a built-in AI result as proven.
---

# verify-ai-browsers

Turns `control-ai-browsers` into a verdict. `scripts/verify.mjs` runs that skill's `scripts/control.mjs` steps in
order, repeats the doctor, compares readings, writes `verdict.json`, and cleans up. Same browsers, sessions and
limits as `control-ai-browsers` (read its `SKILL.md` first): Chrome Beta and Edge Dev only, sessions `ai-cb` and
`ai-ed`, never Chrome or Edge stable, never `--extension`.

Standing models are `gemma4-2b-it` (Chrome Beta) and `Aion-1.1-Instruct` (Edge Dev). C: is short of space, so
**a model downloaded only for a comparison is cleared after use**; the cycle below does that itself. Run one
browser's cycle to the end before starting the other's.

## Launch

Nothing to start beyond the browsers; `verify.mjs` begins with `control.mjs attach`, which starts a browser that is
not running. Remote debugging must be allowed (Lars turns it on). When attach is refused, the verdict is
`inconclusive` and the run stops at that step.

## Doctor

`verify.mjs state` is the doctor-based verdict:

```bash
node .claude/skills/verify-ai-browsers/scripts/verify.mjs state --browser=chrome-beta [--expect=<profile>]
node .claude/skills/verify-ai-browsers/scripts/verify.mjs state --browser=msedge-dev
```

It runs `control.mjs doctor --expect=<profile>` twice (a pass counts only when it repeats), `flags get` and
`model info`, and checks that the serving model and the disk manifest both match the profile (`gemma4-2b-it`,
`v3Nano`, `Aion-1.1-Instruct`, or a `phi-4-mini` name for Edge Dev `default`). Default profile: the home profile
(`gemma4`, `aion`). The doctor's `disk.free` line warns when C: is under the browser's minimum (Chrome 22 GB,
Edge 20 GB).

## Drive

One comparison-model cycle per browser, ending on the home profile with only the standing model on disk:

```bash
node .claude/skills/verify-ai-browsers/scripts/verify.mjs cycle --to=default --browser=msedge-dev
node .claude/skills/verify-ai-browsers/scripts/verify.mjs cycle --to=nano --browser=chrome-beta \
  --run=spikes/probes/bench.js --out=spikes/probes/bench/nano.json
```

Steps: `state` on the home profile; `model switch <to>`; `model download` (returns at once when the model is
already available; a refusal for lack of space ends the away leg and nothing else is deleted); `model init`;
`model info`; with `--run`, that probe while the comparison model is loaded (`--out` saves its return value;
`bench.js` needs the counter fixture: `node .claude/skills/control-angular-dev-app/scripts/control.mjs up --target
counter`, and `down` afterwards); `model switch <home>` with download if needed and init; `model clear
--confirm=<comparison model name read from disk>`; `state` again.

The cycle is verified when every step passed, the model matched at each end, `contextWindow` matched where known
(9,216 Gemma 4, 7,168 Aion), the probe exited 0, `Local State` at the end equals `Local State` at the start, and
the standing model is the only one left on disk. `verdict.json` records free space at the start, each download's
size and duration, the init timings, and the bytes freed by the clear.

`control.mjs` refuses to clear `gemma4-2b-it` or `Aion-1.1-Instruct`. For single checks or another probe, use
`control-ai-browsers` directly; its `features/` map is the recipe source for both skills.

## Evidence

Each run writes into `tmp/verify-ai-browsers/<YYYYMMDD-HHMMSS>-<browser>-<mode>/` (git-ignored) or
`--evidence=<dir>`: one JSON per control step plus `verdict.json` with the verdict, the per-phase results and
every step's command, exit code, duration and evidence path. Proof rules:
`control-ai-browsers/features/README.md`.

## Cleanup

`verify.mjs` ends with `control.mjs cleanup`: closes the skill's own tabs, detaches the session, removes the state
file, keeps the evidence and leaves the browser running. A run that stops early leaves the browser attached; run
`node .claude/skills/control-ai-browsers/scripts/control.mjs cleanup --browser=<b>`.

## Helpers

`scripts/verify.mjs <state|cycle> --browser=chrome-beta|msedge-dev [--to=<profile>] [--expect=<profile>] [--run=<probe.js>] [--out=<json>] [--timeout-min=40] [--evidence=<dir>]`

| Exit | Verdict |
|---|---|
| 0 | verified |
| 1 | not verified (a check or a model match failed; `verdict.json` names it) |
| 2 | inconclusive (a step was refused or could not run: attach refused, download refused for space, bad arguments) |

## Gotchas

- A cycle restarts the browser at least twice. On 2026-10-11 both browsers refused new CDP connections for about
  25 minutes (cause not known). The verdict is then `inconclusive`; the browser may be left on the away profile,
  so report the step and the flags state.
- `verify.mjs` detaches at the end; the next run's attach is a new connection.
- An inconclusive cycle can leave the comparison model on disk. Check `control.mjs model info` and clear it by
  hand once the browser is back on its home profile.
