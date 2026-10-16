---
name: control-ai-browsers
description: Launch, stop, doctor and drive the per-model browser instances for the built-in AI (Prompt API, Summarizer, Writer, Rewriter, WebMCP) - Chrome Beta 157 with Gemini Nano or Gemma 4, Edge Dev 157 with Aion-1.1-Instruct, Edge stable 155 with Phi-4-mini - each a separate browser process with its own D: profile, features and CDP port, through playwright-cli and raw CDP. Check the command line against the registry, the model on disk and in on-device-internals Broker State, the CPU or GPU backend and performance class, availability(), contextWindow, structured-output, tool-calling and WebMCP canaries; read the effective features; report, download, initialise and clear models; run a probe or the model benchmark with backend and CPU load recorded; capture JSON evidence. Use before trusting a built-in AI result, after a browser update, or to switch, clear or re-download a model.
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

| Instance | Browser | Port (main checkout) | Model (manifest name) | Default backend | `contextWindow` |
|---|---|---|---|---|---|
| `chrome-beta-nano` | Chrome Beta 157 | 9333 | `v3Nano` (GPU variant 2025.8.8.1141, CPU variant 2025.8.21.1028) | `gpu` | 9,216 |
| `chrome-beta-gemma4` | Chrome Beta 157 | 9334 | `gemma4-2b-it` | `gpu` | 9,216 |
| `edge-dev-aion` | Edge Dev 157 | 9335 | `Aion-1.1-Instruct` | `gpu` (only) | 7,168 |
| `edge-phi4mini` | Edge stable 155 | 9337 | `Phi-4-mini-instruct` | `gpu` (only) | 9,216 |

`instances.json` is the single source for each instance's browser, executable, main-checkout port, features,
backends, expected model, model folder pattern, Broker State asset and use case. Other skills look instances up
there, and ask `up <name> --json` or `info <name> --json` for the port an instance runs on.

Ports. The profiles live under the checkout (`.browsers\<name>`), so every checkout runs its own instances.
The main checkout uses slot 0, the registry ports above. A git worktree (`.git` is a file) takes slot 1-39 from a
hash of the checkout path, so its ports stay the same from run to run: `9600 + 10 * slot + index`, the index being
the instance's place in `instances.json` (measured 2026-10-16 in the `verification-skills` worktree: slot 8,
`chrome-beta-nano` on 9680). When the port is busy, `up` tries the next slot, 10 slots in all, and records the
slot and the port it used (`info --json`: `slot`, `ports`).

| Port | Kind | Default | How it moves |
|---|---|---|---|
| cdp | derived | the instance's registry port (9333, 9334, 9335, 9337) | `up <name> --port=N`, passed as `--remote-debugging-port` (measured: `chrome-beta-nano` listened on 9680, and on its fallback 9690 while a throwaway listener held 9680) |
| bench app | external | 4222 | the counter fixture of control-angular-dev-app in the main checkout; `spikes/probes/bench.js:4` hard-codes it, so `bench` refuses (exit 2) in a worktree; this skill never starts it |

- `--port=N` sets the port with no fallback for it: a busy `N` exits 2 naming its holder's PID; from a worktree
  the registry port is refused.
- A port another process takes after the check (it answers or holds the port instead of this profile's browser)
  stops the browser this run started, and `up` tries the next slot.
- Every other command finds the port an instance runs on from its state file, else from the running browser's
  command line.

To add an instance, add an entry; no command takes features as flags.

The playwright-cli session is `ai-<instance>-<port>`, on the registry port too: playwright-cli keeps one session
namespace for every checkout on the machine, and a teardown check counts every open `<session>-*` as the run's, so
no session name may be a prefix of another checkout's. Read it from `info <name> --json` (`session`). Never use `cb`,
`ed`, `nano`, `g4`, `aion`, `phi`, `ai-cb`, `ai-ed` or `bench-*`.

Backends (`up <name> --backend=gpu|cpu`):
- `chrome-beta-nano`: `gpu` adds `OnDeviceModelPerformanceParams:...` so the low stored performance class (2 on
  Chrome Beta 156, 3 on 157) may use GPU models; `cpu` adds nothing. Default `gpu`: on CPU Nano's structured output failed 15 of 15 runs.
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
node .claude/skills/control-ai-browsers/scripts/control.mjs up chrome-beta-nano [--backend=gpu|cpu]
```

Starts `<exe> --user-data-dir=<profile> --remote-debugging-port=<port> --no-first-run --no-default-browser-check
--enable-features=<registry features + backend extras> about:blank`, creating the profile folder on first use. It
refuses (exit 2) when the instance already runs with another configuration (run `down` first), when no slot
of the 10 has a free port (or `--port=N` is busy), or when the profile path resolves through a junction. Ready means `/json/version` answers
and the main process is found by its `--user-data-dir`. It then closes tabs Edge restored from the last session,
leaving one blank tab, and on Chrome turns on "Enable internal debugging pages" (`chrome://chrome-urls`), which
`on-device-internals` needs in a new profile. Measured time to ready: 1.3-2.2 s, once 28 s (Edge Dev). An
instance that already runs as requested is not restarted (exit 0, `alreadyRunning`). That is an exception to the
generated-skill contract, which has `up` refuse a live instance of its flow: the standing state is all four
instances running (see Cleanup), and other skills call `up` to reach one (control-vitest-browser-angular), so `up`
only records an instance that runs as asked. Claude's decision in the 2026-10-16 review; Lars has not ruled on it.
`up --json` gives `session` and `evidenceDir` at the top level, also with `alreadyRunning`.

`attach <name>` records the running instance in the state file (`tmp/control-ai-browsers/state-<name>.json`:
PID, start time, executable, command line, port, session, backend) and leaves the session attached for ad hoc
`playwright-cli -s=<session>` commands (`ai-<name>-<port>`, from `info`). `down` needs that state file.

## Doctor

```bash
node .claude/skills/control-ai-browsers/scripts/control.mjs doctor edge-dev-aion
```

Read-only; one line per check:

| Check | Passes when |
|---|---|
| `map-fresh` | always, first; `[WARN]` names the features whose files changed since they were proven (`scripts/fingerprint.mjs`) or that were never proven; never fails doctor |
| `process` | one main process uses the instance profile |
| `commandLine` | executable, the two common arguments and `--enable-features` match the registry for one backend, and from a worktree the port is not the registry's (drift check) |
| `ports` | the CDP port listens, the main PID holds it, and `/json/version` answers with the right product: `[OK] ports: cdp 9680 (derived); http://127.0.0.1:9680 answers as Chrome/157.0.8103.6` |
| `tabs` | always; `[WARN]` when more than one tab is open |
| `model.disk` | a `manifest.json` in the profile names the expected model; `[WARN]` lists other models in the profile |
| `model.broker` | Broker State shows the asset `Ready` and the use case `Available` |
| `backend` | (with `model.broker` and `performanceClass` read after the page checks when Broker State has not loaded the model manifest yet, as right after a launch) the Broker State backend of the model row whose weights sit in the model folder (CPU or GPU) is the backend the command line asks for |
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
- Ad hoc: `attach <name>`, then `playwright-cli -s=<session> <command>` with the session from `info <name> --json`
  (`ai-<name>-<port>`); `detach <name>` when done. `run-code`
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
run together. The directory is git-ignored and survives `down`. Add `--json` for the same result on stdout with
`evidence` and `exit` fields. For a model change keep `model info` before and after, the `clear` result
(`bytesRemoved`), the `download` result (gesture, duration, size) and `model init`.

## Cleanup

```bash
node .claude/skills/control-ai-browsers/scripts/control.mjs down chrome-beta-nano
```

Reads the state file and refuses (exit 2) when the recorded PID's executable, command line or start time differ
from the live process, or when another process owns the port. A recorded PID that no longer runs is not a
refusal: the state file is removed and the exit is 0. Otherwise it detaches the session, sends CDP
`Browser.close` over the browser websocket, waits up to 60 s until no process uses the profile (it never kills),
checks the port is free and removes the state file. Evidence stays. The standing state is all four instances
running, each on one blank tab; `down` is for a relaunch, a clear, or a proof. Never run `playwright-cli close`,
`close-all` or `kill-all`: they reach other agents' sessions.

## Helpers

`node .claude/skills/control-ai-browsers/scripts/control.mjs <command> ... [--json] [--evidence=<dir>]`

playwright-cli runs as node with `node_modules/@playwright/cli/playwright-cli.js` beside the first
`playwright-cli.cmd` in an absolute PATH folder (an npm global install); without it, page commands fail with
`playwright-cli not found on PATH`.

| Command | Does | Exit |
|---|---|---|
| `instances` | registry plus live state: PID, backend, drift, tabs, state file | 0 |
| `up <name> [--backend=gpu\|cpu]` | start (profile created on first use), wait for `/json/version`, one blank tab, write state; `--json` has `session` and `evidenceDir` | 0 / 2 |
| `attach <name>` | write state, attach the instance's session (`ai-<name>-<port>`) and leave it attached | 0 / 2 |
| `detach <name>` | detach that session | 0 |
| `doctor <name>` | the checks above | 0 / 1 / 2 |
| `flags <name>` | effective features from the version page against the registry | 0 / 1 / 2 |
| `model info <name>` | disk manifests (name, versions, performance hints, MiB, folder), Broker State, serving model, backend, performance class; disk only when stopped | 0 / 2 |
| `model download <name> [--timeout-min=45]` | free-space check, Edge "Check for update" on its model components, `create()` from a trusted gesture (click, or Enter on the focused button when the click times out), poll until `available` for `--timeout-min` minutes; the playwright-cli client waits 5 minutes longer, so the page's own timeout result comes back; a value that is not a positive number exits 2 | 0 / 1 / 2 |
| `model init <name>` | cold and warm `create()`, `contextWindow`, one prompt | 0 / 2 |
| `model clear <name> --confirm=<model>` | instance must be stopped, and its profile folder must not resolve through a junction; deletes every folder whose `manifest.json` names `<model>`; reports bytes removed and free space | 0 / 1 / 2 |
| `run <name> <file.js>` | run `async page => {...}` in a new tab | 0 / 2 |
| `bench [names...]` | `bench.js` per instance with backend, performance class and CPU load | 0 / 1 / 2 |
| `down <name>` | CDP `Browser.close`, confirm the processes and the port are gone | 0 / 1 / 2 |
| `info <name>` | port, `slot`, `ports` (`{name, port, kind, reason?}`), CDP URL, session, profile, state file, evidence dir | 0 |

Exit codes: 0 done or healthy; 1 not healthy or the change did not take; 2 refused or could not run, with the
reason (unknown instance, not running, missing state file, PID mismatch, port owned by another process, running
instance for `clear`, missing `--confirm`, `--backend=cpu` on Edge, junctioned profile, missing fixture). Model
answers, page text and playwright-cli output in a human-readable line are printed with their control characters
escaped.

`scripts/fingerprint.mjs` (a byte copy of lars-create-verification's; never edit it here) keeps the proof manifest
`features/.proven.json`: `node .claude/skills/control-ai-browsers/scripts/fingerprint.mjs record --feature <id>
--entries <path>...` records the repository files a feature depends on with their git blob hashes (exit 0 written or
unchanged, 2 refused); `... record --feature <id> --external "<reason>"` records a feature whose source lives
outside the repository; `... fingerprint.mjs check [--feature <id>] [--json]` prints `fresh`, `stale`, `unproven` or
`external` per feature (exit 0 all fresh or external, 1 one stale or unproven, 2 could not run).

Each script has a `node:test` file beside it (`*.test.mjs`); `npm test` at the repository root runs them and
`npm run check` type-checks the scripts.

## Gotchas

Measured 2026-10-11/12 unless marked inferred.

- A Chrome profile starts with internal debugging pages off; `on-device-internals` then shows "Internal debugging
  pages are currently disabled". `up` turns them on; doctor reports it under `model.broker`.
- Pointer clicks can time out in an instance (seen in the first Phi-4-mini profile); focus plus Enter still
  counts as a user gesture. `model download` falls back to it.
- Edge deletes its model manifest at startup when the profile path resolves through a junction (Lars's Edge Dev,
  2026-10-12). `up` refuses such a path.
- Edge Dev 157's default model is Aion, not Phi-4-mini, and a fresh Edge profile can sit at "Foreground Installing
  0%" until "Check for update" is pressed for "Edge LLM On Device Model" and "Edge LLM Runtime" in
  `edge://components`. Phi-4-mini comes only from Edge stable 155 (`edge-phi4mini`).
- Forcing CPU (`OnDeviceModelForceCpuBackend`, or GPU classes the device lacks) makes Edge uninstall its model.
- `availability()` says `available` even when `create()` refuses the requested tool types (research 09); a
  tool canary is the real check. Nano answers tool prompts with `tool_code` text, so its tool canary is skipped.
- Gemma 4 rejects every tool prompt when a tool has an empty `properties` (`UnknownError`); the canary tool has a
  required `scope` parameter. Results go back as `LanguageModelToolSuccess({callID, callId, name, result})`: the tool call reports
  `callID` in both browsers, Chrome Beta 156 and 157 read `callID` back, and Edge Dev 157.0.4329 requires `callId`
  ("Required member is undefined" without it, measured 2026-10-15), so the canary sends both. Gemma 4 sends
  `callID: ""` (Aion sends a hex id).
- Chrome downloads a model the profile has `Requested` without any page call: after `model clear` on a running
  profile, Nano came back within 7-9 minutes. Right after `down`, `clear`, `up`, Nano's download finished
  inside the first doctor's canary (which is why doctor now skips canaries unless `available`). `model clear`
  therefore works on a stopped instance and `model download` right after `up` finds `downloading`.
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
- The Nano instance's stored performance class is 3 (Low) on Chrome Beta 157, the same as Gemma 4's (it read 2,
  VeryLow, on 156; measured 2026-10-16). Latency is comparable only at the same backend and similar CPU load, which
  is why `bench` records both.
- Edge restores the last session's tabs on start; `up` closes them. A new Edge profile opens first-run tabs
  after that (a welcome extension page, `edge://sync-confirmation-dialog/`), so the first doctor reports `tabs`
  `[WARN]` (measured on new `edge-dev-aion` and `edge-phi4mini` profiles, 2026-10-15).
- A hung tab renderer blocks every `run-code` on that session, even `async page => 1+1` (edge-phi4mini, whose only
  tab was an `example.com` page left by an older probe). The browser itself still answers CDP. Recovery without a
  restart: `curl -X PUT "http://127.0.0.1:<port>/json/new?about:blank"`, then `curl http://127.0.0.1:<port>/json/close/<id>`
  for the hung tab (ids from `/json/list`), then rerun the command.
- Phi-4-mini answered the tool canary in prose in all three sessions of two doctors (2026-10-12), and once failed the
  structured canary with `UnknownError: kErrorUnknown` (one of three doctors). Its tool canary is reported only; a
  structured failure still fails doctor.
- Exiting Node while the CDP websocket is still closing trips a libuv assertion on Windows; `down` waits for the
  close.
- `--raw run-code` prints the function's return value as JSON; returning a string double-encodes it.
- The internals and components pages are localised (Danish UI); match ids, classes and English data strings, not
  button labels. `chrome://chrome-urls`'s debug button is English.
