# Built-in AI browser instances: control map

The maintained source for driving the on-device AI in the per-model instances. Read this index, then the
matching feature file. `C` below stands for `node .commandcode/skills/control-ai-browsers/scripts/control.mjs`.

## Baseline preconditions

- Chrome Beta 157 (156 until it updated itself on 2026-10-16), Edge Dev 157 and Edge stable 155 are installed at the paths in `instances.json`.
- The five instances run, started by `C up <name>` (or `C instances` shows them with no drift): Nano on
  9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338. The instances, their profiles (with the models) and
  their state files belong to the primary checkout (`.commandcode/worktrees/` there). A worktree or a GSD Path
  sidecar reaches the same running instances on the same ports; it never starts empty profiles of its own.
- The panel is built (`npx nx run angular-ai-devtools:build-extension`) before `up`, because every instance loads
  `extension/` when it starts.
- `C doctor <name>` exits 0 for the instance a recipe uses.
- Nobody else drives the same instance during the run. Its session is `ai-<instance>-<port>`; read it from
  `C info <instance> --json` (`session`).

## Driving conventions

- Use the control script for every step it covers; use raw `playwright-cli -s=<session>` only for what it does
  not, after `C attach <instance>`, and `C detach <instance>` afterwards.
- Page code runs in a tab the script opens on `https://example.org/?ai-browsers=<purpose>` (the built-in AI APIs
  are not defined on `about:blank`) and closes in the same command; a `run` or `bench` probe starts on a blank tab
  and navigates itself.
- Choose a model by choosing its instance. Change a backend with `C down <name>` and
  `C up <name> --backend=<b>`, never by editing a command line by hand.
- Wait on observable state (`availability()`, a resolved `create()`, a Broker State asset `Ready`), never a fixed
  sleep.
- Put each run's evidence in one directory: `--evidence=tmp/control-ai-browsers/evidence/<run-id>`.
- End with every instance running at its default backend, on one blank tab, and `C doctor` exiting 0.

## Proof and skip reporting

- A model claim needs three readings: the `manifest.json` name on disk, the Broker State asset or weights path,
  and a page-level result (`availability()`, `contextWindow`, a prompt answer).
- A backend claim needs the Broker State "Backend Type" of the row whose weights sit in the model folder, and the
  command line the instance runs with.
- A latency claim carries the backend and the CPU load at the time (`bench` records both); never compare numbers
  across backends or load.
- A download claim needs the gesture, the click-to-ready duration and the size of the folder that appeared. A
  clear claim needs `bytesRemoved` and the disk list afterwards.
- Report a step that needs Lars as blocked with the exact command; never as passed through another path.
- A canary that passes once after a change runs a second time before it counts.

## Feature entry contract

Each feature file starts with an H1 and one paragraph of behaviour, then four H2s in order: `Sub-features`, `How
to get to it (user POV)`, `Driving it with control-ai-browsers`, `Gotchas`.

## Features

- [Instances](./instances.md): registry, up, backend, drift, effective features, down.
- [Health check](./health-check.md): doctor, availability, canaries, WebMCP.
- [Model lifecycle](./model-lifecycle.md): info, download, init, clear.
- [Probes and benchmarks](./probes.md): run a probe script, the model benchmark.
- [Extension panel](./extension-panel.md): the unpacked extension each instance loads, and its N1 panel feature driven end to end.

## Full sweep

A full pass drives the features in this order.

1. [Instances](./instances.md)
2. [Health check](./health-check.md)
3. [Model lifecycle](./model-lifecycle.md)
4. [Probes and benchmarks](./probes.md)
5. [Extension panel](./extension-panel.md)

## Manual only

- The `on-device-internals` Event Logs and Tools tabs (not read by the script).
- Extension contexts other than the Angular AI panel that `panel` drives (side panels, popups, service worker
  internals).
- Lars's own Chrome Beta, Edge Dev and everyday Edge profiles: the skills never touch them.
