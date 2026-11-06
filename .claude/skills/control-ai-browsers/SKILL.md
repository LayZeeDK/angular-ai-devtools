---
name: control-ai-browsers
description: Launch, stop, doctor and drive the per-model browser instances for the built-in AI (Prompt API, Summarizer, Writer, Rewriter, WebMCP) - Chrome Beta 157 with Gemini Nano or Gemma 4, Chrome stable 156 with Gemini Nano, Edge Dev 157 with Aion-1.1-Instruct, Edge stable 155 with Phi-4-mini - each a separate browser process with its own D: profile, features and CDP port, shared by every checkout and GSD Path sidecar of the repository and each loading the repository's unpacked Angular AI DevTools extension, through playwright-cli and raw CDP. Check the command line against the registry, the extension, the model on disk and in on-device-internals Broker State, the CPU or GPU backend and performance class, availability(), contextWindow, structured-output, tool-calling and WebMCP canaries; read the effective features; report, download, initialise, pin and clear models; run a probe or the model benchmark with backend and CPU load recorded; drive the extension's DevTools panel feature (N1, Explain version with AI) end to end; capture JSON evidence. Use before trusting a built-in AI result, after a browser update, to switch, clear or re-download a model, or to prove the extension's Prompt API feature in every browser-model pair.
---

# control-ai-browsers

Controls five browser instances, one per browser and on-device model pair, each started from `instances.json` with its own
`--user-data-dir` under `.commandcode\worktrees\.browsers\<name>` of the primary checkout (D:), `--enable-features`,
`--remote-debugging-port` and the repository's unpacked extension (`extension/`, see Launch).
`scripts/control.mjs` does the deterministic steps; page code runs through playwright-cli attached over CDP. Lars's
own Chrome Beta, Edge Dev and everyday Edge are never touched: the script only acts on a process whose
`--user-data-dir` is an instance profile. For an Angular app, use `control-angular-dev-app`.

## Pick a flow

Pick the instance that serves the model you want. Switching models means choosing another instance; no flag is
flipped and nothing restarts.

| Instance             | Browser           | Port (main checkout) | Model (manifest name)                                            | Default backend | `contextWindow` |
| -------------------- | ----------------- | -------------------- | ---------------------------------------------------------------- | --------------- | --------------- |
| `chrome-beta-nano`   | Chrome Beta 157   | 9333                 | `v3Nano` (GPU variant 2025.8.8.1141, CPU variant 2025.8.21.1028) | `gpu`           | 9,216           |
| `chrome-beta-gemma4` | Chrome Beta 157   | 9334                 | `gemma4-2b-it`                                                   | `gpu`           | 9,216           |
| `edge-dev-aion`      | Edge Dev 157      | 9335                 | `Aion-1.1-Instruct`                                              | `gpu` (only)    | 7,168           |
| `edge-phi4mini`      | Edge stable 155   | 9337                 | `Phi-4-mini-instruct`                                            | `gpu` (only)    | 9,216           |
| `chrome-stable-nano` | Chrome stable 156 | 9338                 | `v3Nano`                                                         | `gpu`           | 9,216           |

`instances.json` is the single source for each instance's browser, executable, main-checkout port, features,
extra switches (`args`), backends, expected model, model folder pattern, Broker State asset, use case and pinned
component roots (`pin`). Other skills look instances up
there, and ask `up <name> --json` or `info <name> --json` for the port an instance runs on.

Shared instances. The profiles (each holding a multi-GB model), the pins and the state files live in the primary
checkout's `.commandcode\worktrees\` (`.browsers\<name>`, `tmp\control-ai-browsers\`), found through
`git rev-parse --git-common-dir`. Every checkout of the repository, a git worktree or a GSD Path sidecar under
`~\.gsd-path\projects\` included, therefore reaches the same running instances on the registry ports. A checkout
never starts empty profiles of its own: those would need a fresh multi-GB download, and the models would land
on C: for a sidecar. Before 2026-10-19 the profiles were per checkout, and every sidecar stalled on profiles with
no model. Because one instance serves every checkout, two agents must not drive the same instance at the same time.

Ports. Every checkout starts at slot 0, the registry ports above. When a port is busy, `up` tries the next slot,
`9600 + 10 * slot + index` (the index being the instance's place in `instances.json`), 10 slots in all, and records
the slot and the port it used (`info --json`: `slot`, `ports`).

| Port      | Kind     | Default                                                     | How it moves                                                                                                                                                                         |
| --------- | -------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| cdp       | derived  | the instance's registry port (9333, 9334, 9335, 9337, 9338) | `up <name> --port=N`, passed as `--remote-debugging-port` (measured: `chrome-beta-nano` listened on 9680, and on its fallback 9690 while a throwaway listener held 9680)             |
| bench app | external | 4222                                                        | the counter fixture of control-angular-dev-app in the main checkout; `spikes/probes/bench.js:4` hard-codes it, so `bench` refuses (exit 2) in a worktree; this skill never starts it |

- `--port=N` sets the port with no fallback for it: a busy `N` exits 2 naming its holder's PID.
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
node .commandcode/skills/control-ai-browsers/scripts/control.mjs up chrome-beta-nano [--backend=gpu|cpu]
```

Starts, through `scripts/pipe-keeper.mjs` (see The extension below), `<exe> --user-data-dir=<profile>
--remote-debugging-port=<port> --remote-debugging-pipe --enable-unsafe-extension-debugging --no-first-run
--no-default-browser-check
[<instance args>] --enable-features=<registry features + backend extras> about:blank`, creating the profile folder
on first use. `edge-dev-aion` adds `--disable-component-update`, so Edge cannot update its model past its manifest
(Gotchas). `--no-ai-features` drops the whole `--enable-features` switch, to measure what a user without flags gets
(research/20); the Edge sign-in switches stay, and `instances` reports the missing features as drift. Before it starts an instance with `pin` roots, `up` compares them with the pin (`model pin`) by version
folder and by contents (each file and its size, as `pin.json` records them). When they differ it checks everything
first (no reparse point at the profile, a component root, a target or the pin folder; the pinned copy matches
`pin.json` and holds no link), copies each pinned folder to `<version>.pinning`, checks the copy, renames it into
place and only then deletes the other versions, with a `[WARN]` naming each (`pinRestored` in the JSON; `~` marks a
replaced folder). A refusal leaves the profile as it was. With no pin yet it warns and goes on; a pin left at
`<pin>.old` by an interrupted `model pin` is put back first, and a `pin.json` that does not check out exits 2. It
refuses (exit 2) when the instance already runs with another configuration (run `down` first), when no slot
of the 10 has a free port (or `--port=N` is busy), or when the profile path resolves through a junction. Ready means `/json/version` answers
and the main process is found by its `--user-data-dir`. It then closes tabs Edge restored from the last session,
leaving one blank tab, and on Chrome turns on "Enable internal debugging pages" (`chrome://chrome-urls`), which
`on-device-internals` needs in a new profile. Measured time to ready: 1.3-2.2 s, once 28 s (Edge Dev). An
instance that already runs as requested (same backend, same port when `--port=N` is given, no drift: the
registry executable, and exactly the switches `up` launches with) is not
restarted: `up` records it and exits 0 with `alreadyRunning: true`. A live instance that does not match exits 2
naming its PID, its port and each difference. This uses the generated-skill contract's exception for skills whose
instances stay running between runs (lars-create-verification `references/generated-skill.md`, "State"): an
instance may stay up while a session still uses it, and other skills call `up` to reach one
(control-vitest-browser-angular). Close it after use (see Cleanup).
`up --json` gives `session` and `evidenceDir` at the top level, also with `alreadyRunning`.

The extension. Each instance's registry `extension` (`extension`, resolved against the primary checkout) names the
unpacked extension the shared instance loads; `up <name> --extension=<dir>` (relative to the current directory)
loads another build, such as a worktree's, and the state file records which (`extensionDir`). Build its panel
first: `npx nx run angular-ai-devtools:build-extension`. The browser reads the extension's files from disk when its
pages open, so a rebuilt panel needs no restart.

- Every browser loads it the same way. Branded Chrome ignores `--load-extension`, and CDP `Extensions.loadUnpacked`
  answers only over `--remote-debugging-pipe`. So `up` starts `node scripts/pipe-keeper.mjs`, which launches the
  browser with the instance's command line plus `--remote-debugging-pipe --enable-unsafe-extension-debugging`,
  loads the extension over the pipe, writes the result to `tmp/control-ai-browsers/extension-<name>-<ms>.json` (one
  file per launch, removed once read) and holds the pipe until the browser exits. The browser exits when the pipe
  closes, and a pipe-loaded extension is not kept in the profile (both measured), so the keeper stays for the
  browser's lifetime. `down` closes the browser, and the keeper exits with it. Both run with the primary checkout
  as their working directory, so a worktree or GSD Path sidecar that started them can be removed while they run
  (measured 2026-10-19; before, a sidecar's keepers held its folder and `isolation.py retire` failed). Measured on Chrome Beta 157, Chrome
  stable 156, Edge Dev 157 and Edge stable 155 (2026-10-19). No extension path is on any command line.
- `up` then turns on developer mode in the profile (`developerPrivate` on the extensions page; it stays on). Edge
  Dev 157 disables an unpacked extension while it is off (`unsupportedDeveloperExtension`).
- `up` prints `extension <id>` and returns `extension: {dir, id}`. A failed load exits 2 and leaves the browser
  running, so `down` it after fixing the extension.
- Every other command, doctor's `extension` check included, reads the loaded folder from the state file, so a
  sidecar's doctor passes against instances the primary checkout started. To try a worktree's build, `down` the
  instance and `up <name> --extension=extension` from that worktree; `up` refuses (exit 2) while the instance runs
  with another folder. `down` and plain `up` go back to the primary checkout's build.
- Both Chrome instances list `OnDeviceAiDefaultEnabled`. Without it, a new Chrome Beta profile has On-Device AI
  switched off and offers no model (Gotchas).

`attach <name>` records the running instance in the state file (`tmp/control-ai-browsers/state-<name>.json`:
the main PID, `tree` (the main process and every process below it, `{pid, ppid, start, commandLine}`, recorded
through `scripts/proctree.mjs`; `up` also records the spawned process right after the spawn), port, session,
backend) and leaves the session attached for ad hoc
`playwright-cli -s=<session>` commands (`ai-<name>-<port>`, from `info`). `down` needs that state file.

## Doctor

```bash
node .commandcode/skills/control-ai-browsers/scripts/control.mjs doctor edge-dev-aion
```

Read-only; one line per check:

| Check                 | Passes when                                                                                                                                                                                                                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `map-fresh`           | always, first; `[WARN]` names the features whose files changed since they were proven (`scripts/fingerprint.mjs`) or that were never proven; never fails doctor                                                                                                                                                       |
| `process`             | one main process of the registry's browser uses the instance profile                                                                                                                                                                                                                                                  |
| `tree`                | adds the live processes below it to the recorded tree, for `down`, and drops records that exited; `[SKIP]` with no state file, or one that records another process                                                                                                                                                    |
| `commandLine`         | executable, the two common arguments and `--enable-features` match the registry for one backend, no other switch is present and none repeats, and from a worktree the port is not the registry's (drift check)                                                                                                        |
| `ports`               | the CDP port listens, a process of the instance's tree holds it, and `/json/version` answers with the right product: `[OK] ports: cdp 9680 (derived), bench app 4222 (external: ...); http://127.0.0.1:9680 answers as Chrome/157.0.8103.6` (measured 2026-10-16); the external bench app port is listed, not checked |
| `tabs`                | always; `[WARN]` when more than one tab is open                                                                                                                                                                                                                                                                       |
| `model.disk`          | a `manifest.json` in the profile names the expected model; `[WARN]` lists other models in the profile                                                                                                                                                                                                                 |
| `model.pin`           | (instances with `pin` roots) every pinned root holds only the pinned version, with the pinned files and sizes; fails naming the difference and the fix, `[WARN]` with no pin yet                                                                                                                                      |
| `model.broker`        | Broker State shows the asset `Ready` and the use case `Available`; a failure carries `mismatch` (the asset is not `Ready` and the disk holds another model version) or `in-flight` (an Installing asset, or on Edge no asset row) with a `fix`                                                                        |
| `backend`             | (with `model.broker` and `performanceClass` read after the page checks when Broker State has not loaded the model manifest yet, as right after a launch) the Broker State backend of the model row whose weights sit in the model folder (CPU or GPU) is the backend the command line asks for                        |
| `performanceClass`    | always; reports `optimization_guide.on_device.performance_class` from `Local State` and Broker State's class                                                                                                                                                                                                          |
| `disk.free`           | always; `[WARN]` under the browser minimum (Chrome 22 GB, Edge 20 GB)                                                                                                                                                                                                                                                 |
| `api.availability`    | `LanguageModel.availability()` is `available`; also reports tool use, Summarizer, Writer, Rewriter, Proofreader, LanguageDetector, Translator en->da, `document.modelContext`                                                                                                                                         |
| `model.contextWindow` | equals the registry value                                                                                                                                                                                                                                                                                             |
| `canary.structured`   | a `responseConstraint` prompt returns parseable JSON                                                                                                                                                                                                                                                                  |
| `canary.tools`        | a tool round trip calls `get_component_count` and the answer names 42, in up to three fresh sessions (skipped for Nano; reported but not required for Phi-4-mini, registry `toolCanary: "report"`)                                                                                                                    |
| `canary.webmcp`       | `typeof document.modelContext === 'object'`                                                                                                                                                                                                                                                                           |
| `account`             | the profile's `Default/Preferences` records no signed-in account (`account_info`) and no completed sync setup                                                                                                                                                                                                         |
| `extension`           | (instances with `extension`) `chrome-extension://<id>/manifest.json`, the id derived from the loaded folder's path (state `extensionDir`, else the primary checkout's `extension/`), names the same extension and version as that folder's `manifest.json`; the `fix` says how to reload it                           |

When availability is not `available`, the four page checks report skipped and doctor exits 1: `create()` on a
missing model waits for a download, and doctor never starts one. Exit 0 healthy, 1 a check failed, 2 the instance
is not running or the command could not run. A run takes 25-50 s, longer under load.

## Drive

- Model lifecycle: `model info|download|init|pin <name>`, `model clear <name> --confirm=<model>` (see Helpers).
- Effective features: `flags <name>` reads the command line from `chrome://version` / `edge://version` and
  compares it with the registry.
- A probe: `run <name> <file.js>`, where the file holds `async page => {...}`. It runs in a new tab that is
  closed afterwards; its return value is the result. Probes: `spikes/probes/probe10.js` (tool round trip),
  `spikes/probes/broker-state.js` (Broker State text).
- The benchmark: `bench [names...]` runs `spikes/probes/bench.js` in each named instance (all of them by default),
  one after another, and records the serving model, the Broker State backend, the performance class and a CPU
  load snapshot before and after each result. It needs the counter fixture on `http://localhost:4222`
  (`bench.js` hard-codes the port). It does not call `spikes/probes/bench-all.sh`, which cannot record backend
  and load per result; it runs the same `bench.js`.
- Ad hoc: `attach <name>`, then `playwright-cli -s=<session> <command>` with the session from `info <name> --json`
  (`ai-<name>-<port>`); `detach <name>` when done. `run-code`
  acts on the current tab, the instance's blank tab; open your own tab for page work and close it. When it
  has to attach the session (not after an ad hoc `attach`), a command first swaps the instance's idle `about:blank`
  tabs for one new blank tab over raw CDP (Gotchas,
  "An idle Edge blank tab").
- The extension's first feature: `panel <name> --url=<Angular page>` (`scripts/panel.mjs`, raw CDP). It opens the
  page, opens DevTools for it with Ctrl+Shift+I, shows the "Angular AI" panel (`Extensions.extensionServer.onShowPanel`
  with the panel's `extension-panel-<uuid>_<n>` key), reloads the page so the panel records the Angular version,
  clicks "Explain version with AI" and reads `.ai-answer` or `.ai-error`. It exits 0 with `answer`, `answerMs`,
  `ngVersion`, `extensionId` and `steps`, or 1 with `error`. `--timeout-min` (default 4) caps the wait for the
  answer. Use the counter fixture of control-angular-dev-app as the page (`up --target counter`). The proof across
  every pair is `verify-ai-browsers` `checks/extension-panel.mjs`. Recipe: `features/extension-panel.md`.
- The panel's other tabs are driven manually in the DevTools panel: "Signal Provenance" (N2, recipes
  `features/signal-provenance.md`) and "DI Doctor" (N3, recipes `features/di-doctor.md`); their proof across every
  pair is `verify-ai-browsers` `checks/signal-provenance.mjs` and `checks/di-doctor.mjs`.
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
node .commandcode/skills/control-ai-browsers/scripts/control.mjs down chrome-beta-nano
```

Reads the state file. When the recorded main process is gone, or its PID now belongs to another process, it sends
no `Browser.close`: it stops what the recorded tree left still running and removes the state file (exit 0); a PID
that now belongs to another process is never touched and exits 2. It refuses (exit 2) when another process owns
the port. Otherwise it reads Broker State (at most 90 s) and, without waiting for it, prints a `[WARN]` when a
model update is in flight or the model is past its manifest, naming asset, version and state (`model` in the
JSON); the next `up` restores a pin. Then it records a last snapshot of the tree, detaches the session, sends CDP `Browser.close` over
the browser websocket and waits up to 60 s for the recorded processes to exit. Then it stops, through
`scripts/proctree.mjs`, every record that still runs as the recorded process (same start time and command line),
children before parents, one PID at a time with a forced stop, never by name; a record still running after that
exits 2 and keeps the state file. It checks the port is free and removes the state file. Evidence stays. A state file from before `proctree.mjs`, with no `tree`, stops nothing and exits 2 (state file kept). Run `attach` to record a running instance afresh; `attach` and `up` keep the records of an earlier state file that still run. Close every instance with `down` once
its work is done (Lars's rule: no unused browser windows); the next `up` starts it again in about 2 s with its
model, extension and developer mode, so nothing is lost. An instance another session is still using stays up. Never run `playwright-cli close`,
`close-all` or `kill-all`: they reach other agents' sessions.

## Helpers

`node .commandcode/skills/control-ai-browsers/scripts/control.mjs <command> ... [--json] [--evidence=<dir>]`

playwright-cli runs as node with `node_modules/@playwright/cli/playwright-cli.js` beside the first
`playwright-cli.cmd` in an absolute PATH folder (an npm global install); without it, page commands fail with
`playwright-cli not found on PATH`.

| Command                                                                 | Does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Exit      |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `instances`                                                             | registry plus live state: PID, backend, drift, tabs, state file                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 0         |
| `up <name> [--backend=gpu\|cpu] [--extension=<dir>] [--no-ai-features]` | restore the pin when the disk differs, start (profile created on first use; every instance with `extension` through `pipe-keeper.mjs`), wait for `/json/version`, one blank tab, write state, report the loaded extension; `--json` has `session`, `evidenceDir` and `extension`                                                                                                                                                                                                                                  | 0 / 2     |
| `attach <name>`                                                         | write state, attach the instance's session (`ai-<name>-<port>`) and leave it attached                                                                                                                                                                                                                                                                                                                                                                                                                             | 0 / 2     |
| `detach <name>`                                                         | detach that session                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 0         |
| `doctor <name>`                                                         | the checks above                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 0 / 1 / 2 |
| `flags <name>`                                                          | effective features from the version page against the registry                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 0 / 1 / 2 |
| `model info <name>`                                                     | disk manifests (name, versions, performance hints, MiB, folder), Broker State, serving model, backend, performance class; disk only when stopped                                                                                                                                                                                                                                                                                                                                                                  | 0 / 2     |
| `model download <name> [--timeout-min=45]`                              | free-space check, Edge "Check for update" on its model components, `create()` from a trusted gesture (click, or Enter on the focused button when the click times out), poll until `available` for `--timeout-min` minutes; the playwright-cli client waits 5 minutes longer, so the page's own timeout result comes back; a value that is not a positive number exits 2; refused on an instance with `--disable-component-update`, whose model comes from the pin (`up`, then `model init` once on a new profile) | 0 / 1 / 2 |
| `model pin <name>`                                                      | instance running with its registry command line (so the switch keeps the updater off), Broker State asset `Ready` and `available` before and after the copy, one version per `pin` root with no link in it; copies them to the primary checkout's `.commandcode/worktrees/tmp/control-ai-browsers/pins/<name>` with `pin.json` (versions, files and sizes) and refuses when the folders changed during the copy                                                                                                   | 0 / 1 / 2 |
| `model init <name>`                                                     | cold and warm `create()`, `contextWindow`, one prompt                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 0 / 2     |
| `model clear <name> --confirm=<model>`                                  | instance must be stopped, and its profile folder must not resolve through a junction; deletes every folder whose `manifest.json` names `<model>`; reports bytes removed and free space                                                                                                                                                                                                                                                                                                                            | 0 / 1 / 2 |
| `run <name> <file.js>`                                                  | run `async page => {...}` in a new tab                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 0 / 2     |
| `panel <name> --url=<app> [--timeout-min=4]`                            | the extension's N1 panel feature end to end: "Explain version with AI" answers through the instance's model                                                                                                                                                                                                                                                                                                                                                                                                       | 0 / 1 / 2 |
| `bench [names...]`                                                      | `bench.js` per instance with backend, performance class and CPU load                                                                                                                                                                                                                                                                                                                                                                                                                                              | 0 / 1 / 2 |
| `down <name>`                                                           | warn on a model update in flight, CDP `Browser.close`, stop what outlived it, confirm the processes and the port are gone                                                                                                                                                                                                                                                                                                                                                                                         | 0 / 1 / 2 |
| `info <name>`                                                           | port, `slot`, `ports` (`{name, port, kind, reason?}`), CDP URL, session, profile, state file, the state without its tree, `tree` at the top level, evidence dir                                                                                                                                                                                                                                                                                                                                                   | 0         |

Exit codes: 0 done or healthy; 1 not healthy or the change did not take; 2 refused or could not run, with the
reason (unknown instance, not running, missing state file, a recorded PID that now belongs to another process, a
record still running after `down`'s last round, port owned by another process, running
instance for `clear`, missing `--confirm`, `--backend=cpu` on Edge, junctioned profile, missing fixture, a numeric
flag (`--timeout-min`, `--port`) whose value is not a decimal number above 0, or for `--port` not a port number;
the line starts with `usage:`). Model
answers, page text and playwright-cli output in a human-readable line are printed with their control characters
escaped.

`scripts/fingerprint.mjs` (a byte copy of lars-create-verification's; never edit it here) keeps the proof manifest
`features/.proven.json`: `node .commandcode/skills/control-ai-browsers/scripts/fingerprint.mjs record --feature <id>
--entries <path>...` records the repository files a feature depends on with their git blob hashes (exit 0 written or
unchanged, 2 refused); `... record --feature <id> --external "<reason>"` records a feature whose source lives
outside the repository; `... fingerprint.mjs check [--feature <id>] [--json]` prints `fresh`, `stale`, `unproven` or
`external` per feature (exit 0 all fresh or external, 1 one stale or unproven, 2 could not run).

`scripts/proctree.mjs` (a byte copy of lars-create-verification's; never edit it here; its tests live there) reads
the process table and records and stops an instance's process tree: `processTable`, `snapshot`, `merge`, `stop`,
`matches`, `describe`. It has no command line of its own and prints nothing.

Every other script has a `node:test` file beside it (`*.test.mjs`); `npm test` at the repository root runs them and
`npm run check` type-checks the scripts.

## Gotchas

Measured 2026-10-11/12 unless marked inferred.

- Edge signs Lars's Windows work account in by itself and turns sync on when an instance profile starts without
  the sign-in switches (measured 2026-10-19: a spike that launched both Edge profiles by hand left each with an
  account and synced store extensions; Lars saw a sync prompt). The switches are the Edge browsers' `browserArgs` in
  `instances.json` (`--disable-sync`, `--disable-features=msImplicitSignin,...`, `--auth-schemes=basic,digest`,
  `--password-store=basic`), so every Edge instance gets them. Launch an instance profile only through `up`, never
  by hand. `up` refuses a profile that holds an account or a completed sync setup, and doctor's `account` check
  fails on one; the fix is to delete the stopped profile and `up` again. Edge policies under `HKCU` would also stop
  it, but they would change Lars's everyday Edge too, so they are not used.
- Keep the instance profiles free of real accounts. The CDP port listens on 127.0.0.1 only, but any local process
  of any user (and, inferred, a Docker container through `host.docker.internal`) can open it and drive the browser
  fully, extension pages included (`--enable-unsafe-extension-debugging`). Web pages cannot reach it.

- A new Chrome Beta profile has On-Device AI switched off (measured 2026-10-19, Chrome Beta 157.0.8103.6). Broker
  State's Manifest Criteria read "Enabled by user setting: false", every use case reads `Not Supported`, and
  `availability()` reads `unavailable`, so `model download` refuses. Pre-stable channels turn the setting on by
  default only when a model was installed before or `OnDeviceAiDefaultEnabled` is on (Chromium
  `optimization_guide_global_state.cc`, `ShouldEnableOnDeviceAiByDefault`). The Chrome instances list that feature.
  The performance class and VRAM were not the blocker, and neither is `#bypass-perf-requirement`, which this build
  lacks. Read the criteria with `run <name> spikes/probes/broker-state.js`; `model info`'s `useCases` mislabels
  that table's rows.
- An idle Edge blank tab blocks playwright-cli (measured 2026-10-19 on `edge-dev-aion` and `edge-phi4mini`). After
  some minutes idle, the instance's `about:blank` tab still answers raw CDP `Runtime.evaluate`, but every
  playwright-cli `run-code` on the session, even `async page => 1+1`, and `newPage()` wait forever. Doctor and
  `model pin` then hang with no output. A command that has to attach now opens a new blank tab and closes the idle ones before it
  attaches. A hang that is already running needs its `control.mjs`, `playwright-cli.js` and `cliDaemon.js`
  processes stopped by PID.
- Edge answers the first F12 in a profile with an "Open DevTools?" prompt in the window. Ctrl+Shift+I opens DevTools
  directly; `panel` sends that.
- `Extensions.loadUnpacked` works only over `--remote-debugging-pipe` with `--enable-unsafe-extension-debugging`.
  The extension it loads is not written to the profile, and Chrome exits as soon as the pipe closes (measured
  2026-10-19). Hence `pipe-keeper.mjs` (Launch).
- A pin restored into a new Edge profile reads `downloadable` until one `create()` requests the asset. `model init`
  does that and installs the pinned files with no download. Edge then rewrites the cache files in the model
  folder, so `model pin` again (features/model-lifecycle.md).
- A Chrome profile starts with internal debugging pages off; `on-device-internals` then shows "Internal debugging
  pages are currently disabled". `up` turns them on; doctor reports it under `model.broker`.
- Pointer clicks can time out in an instance (seen in the first Phi-4-mini profile); focus plus Enter still
  counts as a user gesture. `model download` falls back to it.
- Edge deletes its model manifest at startup when the profile path resolves through a junction (Lars's Edge Dev,
  2026-10-12). `up` refuses such a path.
- Edge Dev 157's default model is Aion, not Phi-4-mini, and a fresh Edge profile can sit at "Foreground Installing
  0%" until "Check for update" is pressed for "Edge LLM On Device Model" and "Edge LLM Runtime" in
  `edge://components` (not under `--disable-component-update`, where the button starts nothing). Phi-4-mini comes only from Edge stable 155 (`edge-phi4mini`).
- Forcing CPU (`OnDeviceModelForceCpuBackend`, or GPU classes the device lacks) makes Edge uninstall its model.
- Edge updates its model past its manifest (measured 2026-10-17): about a minute after launch, with no page call,
  Edge Dev 157's component updater installed runtime 2026.10.12.1 and model 2026.10.15.1, while its "Edge On-Device
  Model Manifest" stays 2026.10.2.1 and names `edge_base_model` 2026.10.2.1. Broker State then reads that asset
  `Not Installed` and `availability()` `unavailable`; the next start deletes the old folders, leaving `downloading`
  for good, which `model download` and "Check for update" cannot fix. `edge-dev-aion` therefore launches with
  `--disable-component-update` (it also stops "Check for update"; the components still load) and keeps a pin that
  `up` restores; see `features/model-lifecycle.md`. The Chrome instances and `edge-phi4mini` run without the switch:
  nothing measured calls for it there, and on Chrome it would also stop the model download (inferred).
- The manifest eventually catches up (measured 2026-10-30 on Edge Dev 158.0.4357.0): with the switch off for one
  launch the manifest advanced to 2026.10.19.1 and `model download` installed model 2026.10.15.1 with runtime
  2026.10.12.1, which doctor passes with 2-3 s canaries. The pin now holds that triple. The 2026.10.2.1 pair hangs
  the canary renderer on 158, so never restore it.
- `up` checks that the instance is not running, then restores the pin, then starts it, with no lock between the
  steps. One instance runs once per checkout; a second `up` of the same instance started at the same moment (or a
  browser started by hand on its profile) could run while the pin is being copied. Do not start one instance twice
  in parallel.
- The pinned Aion folders keep their files and sizes while Edge serves the model (measured 2026-10-17: the model
  folder, cache files included, matched the pin after doctors and canaries), so the content check does not flag a
  healthy profile.
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
