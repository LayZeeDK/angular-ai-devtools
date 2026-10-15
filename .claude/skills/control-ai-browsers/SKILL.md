---
name: control-ai-browsers
description: Launch, stop, doctor and drive the per-model browser instances for the built-in AI (Prompt API, Summarizer, Writer, Rewriter, WebMCP) - Chrome Beta 156 with Gemini Nano or Gemma 4, Edge Dev 157 with Aion-1.1-Instruct, Edge stable 155 with Phi-4-mini - each a separate browser process with its own D: profile, features and CDP port, through playwright-cli and raw CDP. Check the command line against the registry, the model on disk and in on-device-internals Broker State, the CPU or GPU backend and performance class, availability(), contextWindow, structured-output, tool-calling and WebMCP canaries; read the effective features; report, download, initialise and clear models; run a probe or the model benchmark with backend and CPU load recorded; capture JSON evidence. Use before trusting a built-in AI result, after a browser update, or to switch, clear or re-download a model.
---

# control-ai-browsers

Controls four browser instances, one per on-device model, each started from `instances.json` with its own
`--user-data-dir` under `.browsers\<name>` (D:), `--enable-features` and `--remote-debugging-port`.
`scripts/control.mjs` does the deterministic steps; page code runs through playwright-cli attached over CDP. Lars's
own Chrome Beta, Edge Dev and everyday Edge are never touched: the script only acts on a process whose
`--user-data-dir` is an instance profile. For an Angular app, use `control-angular-dev-app`.

## Pick a flow

Pick the instance that serves the model you want. Switching models means choosing another instance; no flag is
flipped and nothing restarts.

| Instance | Browser | Port | Model (manifest name) | Default backend | `contextWindow` |
|---|---|---|---|---|---|
| `chrome-beta-nano` | Chrome Beta 156 | 9333 | `v3Nano` (GPU variant 2025.8.8.1141, CPU variant 2025.8.21.1028) | `gpu` | 9,216 |
| `chrome-beta-gemma4` | Chrome Beta 156 | 9334 | `gemma4-2b-it` | `gpu` | 9,216 |
| `edge-dev-aion` | Edge Dev 157 | 9335 | `Aion-1.1-Instruct` | `gpu` (only) | 7,168 |
| `edge-phi4mini` | Edge stable 155 | 9337 | `Phi-4-mini-instruct` | `gpu` (only) | 9,216 |

`instances.json` is the single source for each instance's browser, executable, port, features, backends,
expected model, model folder pattern, Broker State asset and use case. Other skills look instances up there. To
add an instance, add an entry; no command takes features as flags. The playwright-cli session is
`ai-<instance>`; never use `cb`, `ed`, `nano`, `g4`, `aion`, `phi`, `ai-cb`, `ai-ed` or `bench-*`.

Backends (`launch <name> --backend=gpu|cpu`):
- `chrome-beta-nano`: `gpu` adds `OnDeviceModelPerformanceParams:...` so the stored performance class 2 may
  use GPU models; `cpu` adds nothing. Default `gpu`: on CPU Nano's structured output failed 15 of 15 runs.
- `chrome-beta-gemma4`: `cpu` adds `OnDeviceModelForceCpuBackend`; `gpu` adds nothing. Default `gpu` for speed;
  `cpu` scored best in the fallback benchmark (15 of 15) at 2-3 times the latency.
- Edge instances: `gpu` only. `--backend=cpu` exits 2: forcing CPU on Edge deletes the installed model
  (measured twice), and Edge on this machine offers WebGPU variants only.

One instance runs once; two agents must not drive the same instance at the same time. Lars's own profiles: his
Chrome Beta profile sits on D: through a junction and his Edge Dev profile is on C: (his ruling, "Edge Dev:
Option B."). The skill no longer reads or changes them. The old commands that flipped flags in his profiles are
removed rather than kept behind a guard: model switching is now choosing an instance, so they had no remaining
use, and every kept path to his profiles is a way to break them.

## Launch

```bash
node .claude/skills/control-ai-browsers/scripts/control.mjs launch chrome-beta-nano [--backend=gpu|cpu]
```

Starts `<exe> --user-data-dir=<profile> --remote-debugging-port=<port> --no-first-run --no-default-browser-check
--enable-features=<registry features + backend extras> about:blank`, creating the profile folder on first use. It
refuses (exit 2) when the instance already runs with another configuration (run `stop` first), when another
process owns the port, or when the profile path resolves through a junction. Ready means `/json/version` answers
and the main process is found by its `--user-data-dir`. It then closes tabs Edge restored from the last session,
leaving one blank tab, and on Chrome turns on "Enable internal debugging pages" (`chrome://chrome-urls`), which
`on-device-internals` needs in a new profile. Measured time to ready: 1.3-2.2 s, once 28 s (Edge Dev). An
instance that already runs as requested is not restarted (exit 0, `alreadyRunning`).

`attach <name>` records the running instance in the state file (`tmp/control-ai-browsers/state-<name>.json`:
PID, start time, executable, command line, port, session, backend) and leaves the session attached for ad hoc
`playwright-cli -s=ai-<name>` commands. `stop` needs that state file.

## Doctor

```bash
node .claude/skills/control-ai-browsers/scripts/control.mjs doctor edge-dev-aion
```

Read-only; one line per check:

| Check | Passes when |
|---|---|
| `process` | one main process uses the instance profile |
| `commandLine` | executable, port, the two common arguments and `--enable-features` match the registry for one backend (drift check) |
| `port` | `/json/version` answers with the right product and the main PID owns the port |
| `tabs` | always; `[WARN]` when more than one tab is open |
| `model.disk` | a `manifest.json` in the profile names the expected model; `[WARN]` lists other models in the profile |
| `model.broker` | Broker State shows the asset `Ready` and the use case `Available` |
| `backend` | the Broker State backend of the model row whose weights sit in the model folder (CPU or GPU) is the backend the command line asks for |
| `performanceClass` | always; reports `optimization_guide.on_device.performance_class` from `Local State` and Broker State's class |
| `disk.free` | always; `[WARN]` under the browser minimum (Chrome 22 GB, Edge 20 GB) |
| `api.availability` | `LanguageModel.availability()` is `available`; also reports tool use, Summarizer, Writer, Rewriter, Proofreader, LanguageDetector, Translator en->da, `document.modelContext` |
| `model.contextWindow` | equals the registry value |
| `canary.structured` | a `responseConstraint` prompt returns parseable JSON |
| `canary.tools` | a tool round trip calls `get_component_count` and the answer names 42, in up to three fresh sessions (skipped for Nano; reported but not required for Phi-4-mini, registry `toolCanary: "report"`) |
| `canary.webmcp` | `typeof document.modelContext === 'object'` |

When availability is not `available`, the four page checks report skipped and doctor exits 1: `create()` on a
missing model waits for a download, and doctor never starts one. Exit 0 healthy, 1 a check failed, 2 the instance
is not running or the command could not run. A run takes 25-50 s, longer under load.

## Drive

- Model lifecycle: `model info|download|init <name>`, `model clear <name> --confirm=<model>` (see Helpers).
- Effective features: `flags <name>` reads the command line from `chrome://version` / `edge://version` and
  compares it with the registry.
- A probe: `run <name> <file.js>`, where the file holds `async page => {...}`. It runs in a new tab that is
  closed afterwards; its return value is the result. Probes: `spikes/probes/probe10.js` (tool round trip),
  `spikes/probes/broker-state.js` (Broker State text).
- The benchmark: `bench [names...]` runs `spikes/probes/bench.js` in each named instance (all four by default),
  one after another, and records the serving model, the Broker State backend, the performance class and a CPU
  load snapshot before and after each result. It needs the counter fixture on `http://localhost:4222`
  (`bench.js` hard-codes the port). It does not call `spikes/probes/bench-all.sh`, which cannot record backend
  and load per result; it runs the same `bench.js`.
- Ad hoc: `attach <name>`, then `playwright-cli -s=ai-<name> <command>`; `detach <name>` when done. `run-code`
  acts on the current tab, the instance's blank tab; open your own tab for page work and close it.

Every command that opens a tab closes it before it exits, and a session the command attached is detached again.
Wait by polling an observable value (`availability()`, a resolved `create()`, a Broker State asset `Ready`), never
a fixed sleep. Model calls carry a 180 s per-step timeout inside the page. Recipes: `features/README.md`.

## Inspect

- `chrome://on-device-internals` / `edge://on-device-internals` Broker State, read through the shadow roots (the
  same walk as `spikes/probes/broker-state.js`): manifest path and loaded flag, performance class, disk criteria,
  assets, use cases, and models with weights path and backend type. Tools and Event Logs tabs are not read.
- The `Requested` checkboxes per use case (`input[type=checkbox][data-use-case=...]` in the Broker State tab):
  read them with an ad hoc `run`.
- `chrome://version` / `edge://version` `#command_line`: the effective features (`flags`).
- `edge://components`: "Edge LLM On Device Model" and "Edge LLM Runtime" status (`model download` presses their
  "Check for update" buttons, `.button-check-update`).
- `Local State` in the profile: `optimization_guide.on_device.performance_class`.
- Not reachable: extension contexts (DevTools panels, side panels, service workers).

## Evidence

Every command writes its JSON result to `<evidence dir>/<instance>-<command>-<ms>.json` and prints the path. The
default directory is `tmp/control-ai-browsers/evidence/<YYYYMMDD-HHMMSS>/`; pass `--evidence=<dir>` to keep a
run together. The directory is git-ignored and survives `stop`. Add `--json` for the same result on stdout with
`evidence` and `exit` fields. For a model change keep `model info` before and after, the `clear` result
(`bytesRemoved`), the `download` result (gesture, duration, size) and `model init`.

## Cleanup

```bash
node .claude/skills/control-ai-browsers/scripts/control.mjs stop chrome-beta-nano
```

Reads the state file and refuses (exit 2) when the recorded PID's executable, command line or start time differ
from the live process, or when another process owns the port. A recorded PID that no longer runs is not a
refusal: the state file is removed and the exit is 0. Otherwise it detaches the session, sends CDP
`Browser.close` over the browser websocket, waits up to 60 s until no process uses the profile (it never kills),
checks the port is free and removes the state file. Evidence stays. The standing state is all four instances
running, each on one blank tab; `stop` is for a relaunch, a clear, or a proof. Never run `playwright-cli close`,
`close-all` or `kill-all`: they reach other agents' sessions.

## Helpers

`node .claude/skills/control-ai-browsers/scripts/control.mjs <command> ... [--json] [--evidence=<dir>]`

| Command | Does | Exit |
|---|---|---|
| `instances` | registry plus live state: PID, backend, drift, tabs, state file | 0 |
| `launch <name> [--backend=gpu\|cpu]`, alias `up` | start (profile created on first use), wait for `/json/version`, one blank tab, write state | 0 / 2 |
| `attach <name>` | write state, attach `ai-<name>` and leave it attached | 0 / 2 |
| `detach <name>` | detach `ai-<name>` | 0 |
| `doctor <name>` | the checks above | 0 / 1 / 2 |
| `flags <name>` | effective features from the version page against the registry | 0 / 1 / 2 |
| `model info <name>` | disk manifests (name, versions, performance hints, MiB, folder), Broker State, serving model, backend, performance class; disk only when stopped | 0 / 2 |
| `model download <name> [--timeout-min=45]` | free-space check, Edge "Check for update" on its model components, `create()` from a trusted gesture (click, or Enter on the focused button when the click times out), poll until `available` | 0 / 1 / 2 |
| `model init <name>` | cold and warm `create()`, `contextWindow`, one prompt | 0 / 2 |
| `model clear <name> --confirm=<model>` | instance must be stopped; deletes every folder whose `manifest.json` names `<model>`; reports bytes removed and free space | 0 / 1 / 2 |
| `run <name> <file.js>` | run `async page => {...}` in a new tab | 0 / 2 |
| `bench [names...]` | `bench.js` per instance with backend, performance class and CPU load | 0 / 1 / 2 |
| `stop <name>`, alias `down` | CDP `Browser.close`, confirm the processes and the port are gone | 0 / 1 / 2 |
| `info <name>` | port, CDP URL, session, profile, state file, evidence dir | 0 |

Exit codes: 0 done or healthy; 1 not healthy or the change did not take; 2 refused or could not run, with the
reason (unknown instance, not running, missing state file, PID mismatch, port owned by another process, running
instance for `clear`, missing `--confirm`, `--backend=cpu` on Edge, junctioned profile, missing fixture).

## Gotchas

Measured 2026-10-11/12 unless marked inferred.

- A Chrome profile starts with internal debugging pages off; `on-device-internals` then shows "Internal debugging
  pages are currently disabled". `launch` turns them on; doctor reports it under `model.broker`.
- Pointer clicks can time out in an instance (seen in the first Phi-4-mini profile); focus plus Enter still
  counts as a user gesture. `model download` falls back to it.
- Edge deletes its model manifest at startup when the profile path resolves through a junction (Lars's Edge Dev,
  2026-10-12). `launch` refuses such a path.
- Edge Dev 157's default model is Aion, not Phi-4-mini, and a fresh Edge profile can sit at "Foreground Installing
  0%" until "Check for update" is pressed for "Edge LLM On Device Model" and "Edge LLM Runtime" in
  `edge://components`. Phi-4-mini comes only from Edge stable 155 (`edge-phi4mini`).
- Forcing CPU (`OnDeviceModelForceCpuBackend`, or GPU classes the device lacks) makes Edge uninstall its model.
- `availability()` says `available` even when `create()` refuses the requested tool types (research 09); a
  tool canary is the real check. Nano answers tool prompts with `tool_code` text, so its tool canary is skipped.
- Gemma 4 rejects every tool prompt when a tool has an empty `properties` (`UnknownError`); the canary tool has a
  required `scope` parameter. Results go back as `LanguageModelToolSuccess({callID, name, result})`: the field is
  `callID`, and Gemma 4 sends `callID: ""` (Aion sends a hex id).
- Chrome downloads a model the profile has `Requested` without any page call: after `model clear` on a running
  profile, Nano came back within 7-9 minutes. Right after `stop`, `clear`, `launch`, Nano's download finished
  inside the first doctor's canary (which is why doctor now skips canaries unless `available`). `model clear`
  therefore works on a stopped instance and `model download` right after `launch` finds `downloading`.
- The Gemma 4 instance also holds Nano it never serves for the Prompt API (both variants, 6.7 GB, while it ran on CPU;
  after a relaunch on GPU Chrome removed the CPU variant and 4,072 MiB remain): Broker State has
  the base `summarizer_api` and `writing_assistance_api` use cases Requested, and Chrome serves those with Nano
  (`prompt_api`, `summarizer_api`, `writing_assistance_api` and `scam_detection` read `Available` through
  `nano_v3_*`). See `features/model-lifecycle.md` for what was tried; do not clear it there until something stops
  it coming back.
- ReFS (D:) reports freed space late: a 4.27 GB delete showed 0 MiB change in free space. `model clear` reports
  `bytesRemoved` from the folder sizes as the reliable figure.
- D: reads model weights about 30% slower than C: (`spikes/probes/read-throughput.ps1`); that only affects a cold
  `create()`.
- The Nano instance's stored performance class is 2 (VeryLow) and Gemma 4's is 3, on the same GPU; inferred: the
  class was measured while another session loaded the machine. Latency is comparable only at the same backend and
  similar CPU load, which is why `bench` records both.
- Edge restores the last session's tabs on start; `launch` closes them. A new Edge profile opens first-run tabs
  after that (a welcome extension page, `edge://sync-confirmation-dialog/`), so the first doctor reports `tabs`
  `[WARN]` (measured on new `edge-dev-aion` and `edge-phi4mini` profiles, 2026-10-15).
- A hung tab renderer blocks every `run-code` on that session, even `async page => 1+1` (edge-phi4mini, whose only
  tab was an `example.com` page left by an older probe). The browser itself still answers CDP. Recovery without a
  restart: `curl -X PUT "http://127.0.0.1:<port>/json/new?about:blank"`, then `curl http://127.0.0.1:<port>/json/close/<id>`
  for the hung tab (ids from `/json/list`), then rerun the command.
- Phi-4-mini answered the tool canary in prose in all three sessions of two doctors (2026-10-12), and once failed the
  structured canary with `UnknownError: kErrorUnknown` (one of three doctors). Its tool canary is reported only; a
  structured failure still fails doctor.
- Exiting Node while the CDP websocket is still closing trips a libuv assertion on Windows; `stop` waits for the
  close.
- `--raw run-code` prints the function's return value as JSON; returning a string double-encodes it.
- The internals and components pages are localised (Danish UI); match ids, classes and English data strings, not
  button labels. `chrome://chrome-urls`'s debug button is English.
