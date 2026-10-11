# Built-in AI browsers: control map

The maintained source for driving the on-device AI in Chrome Beta and Edge Dev. Read this index, then the
matching feature file. `C` below stands for `node .claude/skills/control-ai-browsers/scripts/control.mjs`.

## Baseline preconditions

- Chrome Beta 156 and Edge Dev 157 are installed at the paths in `SKILL.md`, and remote debugging is allowed in
  both (`chrome://inspect/#remote-debugging`, `edge://inspect/#remote-debugging`; Lars turns it on).
- Home profiles: Chrome Beta `gemma4` (Gemma 4 `gemma4-2b-it`), Edge Dev `aion` (`Aion-1.1-Instruct`), with the
  required flag set from `SKILL.md`.
- `C attach --browser=<b>` succeeded and `C doctor --browser=<b>` exits 0.
- Nobody else drives the same browser during the run. Sessions are `ai-cb` and `ai-ed` only.

## Driving conventions

- Use the control script for every step it covers; use raw `playwright-cli -s=ai-cb|ai-ed` only for what it
  does not.
- Page code runs in a tab the script opens on `https://example.org/?ai-browsers=<purpose>`. Never run model code
  in one of Lars's tabs.
- Match flags by id and option value (`Default`, `Enabled`, `Disabled`); the browser UI is localised.
- Wait on observable state (`availability()`, a resolved `create()`, a Broker State asset `Ready`), never a
  fixed sleep.
- Put each run's evidence in one directory: `--evidence=tmp/control-ai-browsers/evidence/<run-id>`.
- End with the browser back on its home profile and `C doctor` exiting 0, then `C cleanup`.

## Proof and skip reporting

- A model claim needs three readings: the `manifest.json` name on disk, the Broker State asset or weights path,
  and a page-level result (`availability()`, `contextWindow`, a prompt answer).
- A flag claim needs the flags-page value and, after a restart, the `Local State` entry.
- A download claim needs the click-to-ready duration and the size of the folder that appeared.
- Record the browser, the profile and the command with every artifact; the script does this in the JSON.
- Report a step that needs Lars (remote-debugging approval, a crash dialog) as blocked with the exact command;
  never as passed through another path.
- A canary that passes once after a change runs a second time before it counts.

## Feature entry contract

Each feature file starts with an H1 and one paragraph of behaviour, then four H2s in order: `Sub-features`, `How
to get to it (user POV)`, `Driving it with control-ai-browsers`, `Gotchas`.

## Manual only

- The `on-device-internals` Event Logs and Tools tabs (not read by the script).
- Extension contexts (DevTools panels, side panels, service workers).
- Approving remote debugging and any browser dialog that asks Lars.

## Features

- [Health check](./health-check.md): doctor, availability, canaries, WebMCP.
- [Flags](./flags.md): read and set chrome://flags and edge://flags, restart.
- [Model lifecycle](./model-lifecycle.md): info, switch, download, init, clear.
- [Probes and benchmarks](./probes.md): run a probe script in a skill tab.
