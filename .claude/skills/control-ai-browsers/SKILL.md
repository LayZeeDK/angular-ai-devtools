---
name: control-ai-browsers
description: Drive, check and reconfigure the built-in AI (Prompt API, Summarizer, Writer, Rewriter, WebMCP) in Lars's Chrome Beta 156 (Gemma 4 / Gemini Nano) and Edge Dev 157 (Aion / default model) through playwright-cli attached over CDP. Doctor the browsers (required flags, model on disk, on-device-internals Broker State, availability(), contextWindow, structured-output, tool-calling and WebMCP canaries), get or set chrome://flags and edge://flags, report model name, version and size, switch, clear, download and initialise models, restart a browser, run a probe or benchmark script in a tab, and capture JSON evidence. Use before trusting a built-in AI result, after a browser update, or to change which on-device model serves the Prompt API.
---

# control-ai-browsers

Controls the on-device AI in two installed browsers: Chrome Beta and Edge Dev. Deterministic steps run through
`scripts/control.mjs`; it drives the browsers with playwright-cli attached over CDP. Never use it on Chrome stable
or Edge stable (Lars's daily browsers; the script refuses them), and never use `--extension`. To verify an Angular
app, use `control-angular-dev-app`; this skill only covers the browsers and their models.

## Pick a flow

There is one instance per browser, Lars's own installed profile, so there is no worktree isolation: two agents
must not drive the same browser at once. Each browser has a fixed playwright-cli session.

| `--browser=` | Executable | Session | Home profile |
|---|---|---|---|
| `chrome-beta` | `C:\Program Files\Google\Chrome Beta\Application\chrome.exe` | `ai-cb` | `gemma4` |
| `msedge-dev` | `C:\Program Files (x86)\Microsoft\Edge Dev\Application\msedge.exe` | `ai-ed` | `aion` |

A profile is a set of flag values that selects a model:

| Profile | Flags | Model on disk (manifest `BaseModelSpec.name`) | `contextWindow` |
|---|---|---|---|
| `chrome-beta` `gemma4` | `gemma4-for-built-in-ai` Enabled, `prompt-api-tool-use` Enabled | `gemma4-2b-it` 2026.06.10 (2,374 MiB) in `OptGuideManifestModel\<hash>\2026.8.7.929` | 9,216 |
| `chrome-beta` `nano` | both Default | `v3Nano` 2025.06.30 (4,072 MiB) in `OptGuideOnDeviceModel\2025.8.8.1141` | 9,216 |
| `msedge-dev` `aion` | `edge-llm-on-device-model-prerelease` Enabled | `Aion-1.1-Instruct` (1,248 MiB) in `EdgeLLMOnDeviceModel\2026.10.2.1` | 7,168 |
| `msedge-dev` `default` | `edge-llm-on-device-model-prerelease` Default | expected Phi-4-mini (Microsoft docs; not measured, see `features/model-lifecycle.md`) | not measured |

Standing models: `gemma4-2b-it` in Chrome Beta and `Aion-1.1-Instruct` in Edge Dev. Every other model is a
comparison model. C: is short of space, so the rule (Lars, 2026-10-11) is: **a model downloaded only for a
comparison is cleared after use.** Run everything that needs the comparison model while it is loaded (init,
doctor, benchmark), switch back to the home profile, then `model clear` it. Hold one comparison model at a time
across both browsers: finish and clear one browser's before downloading the other's.

The rest of the required set does not change between profiles:

- Chrome Beta: `enable-webmcp-testing@1`, `prompt-api-multimodal-input@1`, `prompt-api@1`, `rewriter-api@1`,
  `summarizer-api@1`, `writer-api@1`.
- Edge Dev: `edge-llm-on-device-model-prerelease-tool-use-workaround@1`, `edge-llm-prompt-api-for-default@1`,
  `edge-llm-prompt-api-tool-use@1`, `edge-llm-rewriter-api-for-default@1`,
  `edge-llm-summarization-api-for-default@1`, `edge-llm-writer-api-for-default@1`, `enable-webmcp-testing@1`.

The WebMCP flag id is `enable-webmcp-testing`. `webmcp-testing` is a different id that both browsers drop.

## Launch

```bash
node .claude/skills/control-ai-browsers/scripts/control.mjs attach --browser=chrome-beta
node .claude/skills/control-ai-browsers/scripts/control.mjs attach --browser=msedge-dev
```

`attach` starts the browser with `--restore-last-session` when its main process is not running, then runs
`playwright-cli -s=<session> attach --cdp=chrome-beta|msedge-dev` and writes a state file
(`tmp/control-ai-browsers/state-<browser>.json`: main PID, its start time, executable, command line). It opens one
tab of its own, `https://example.org/?ai-browsers=home`, and keeps it current (see Gotchas for why). Ready means
the session lists tabs. Attach takes 1-3 s on a running browser.

Remote debugging must be allowed at `chrome://inspect/#remote-debugging` (`edge://inspect/...`). Lars turned it
on in both. One restart re-attached without help; after the next one, and in Chrome Beta without any restart,
new connections were refused (see Gotchas). If attach fails, the script exits 2 with that hint: stop and ask
Lars; do not work around it.

## Doctor

```bash
node .claude/skills/control-ai-browsers/scripts/control.mjs doctor --browser=chrome-beta [--expect=nano]
```

Read-only. Checks against the home profile, or the profile named by `--expect`, each on its own line:

| Check | Passes when |
|---|---|
| `process` | exactly one main process of that executable runs |
| `attach` | the session is attached over CDP |
| `flags.localState` | `Local State` `browser.enabled_labs_experiments` holds the required set and none of the profile's Default flags |
| `flags.page` | each flag on the flags page reads the profile's value; flags the page does not list are reported under `notOnPage` |
| `model.disk` | a `manifest.json` under the model folders names the profile's model |
| `model.broker` | `on-device-internals` Broker State shows the profile's asset `Ready` and use case `prompt_api` `Available` |
| `model.serving` | the model that backs the Prompt API is the profile's model (how it is found: see Model below) |
| `disk.free` | always passes; prints `[WARN]` when free space on the profile volume is under the browser's documented minimum (Chrome 22 GB, Edge 20 GB), next to Broker State's own "Enough disk space to install" line |
| `api.availability` | `LanguageModel.availability()` is `available`; also reports tool-use availability, Summarizer, Writer, Rewriter, Proofreader, LanguageDetector, Translator en->da, `document.modelContext` |
| `model.contextWindow` | equals the profile's value (skipped when the profile has none) |
| `canary.structured` | `prompt()` with a `responseConstraint` JSON Schema returns parseable JSON |
| `canary.tools` | a tool round trip calls `get_component_count {scope}` and the answer names 42 (skipped for `nano`) |
| `canary.webmcp` | `typeof document.modelContext === 'object'` |

Exit 0 healthy, 1 a check failed (named), 2 could not run (browser not running, attach failed, bad arguments).
A run takes about 25 s on Edge Dev and 40 s on Chrome Beta.

## Drive

Everything runs in tabs the script opens on `https://example.org/?ai-browsers=<purpose>` and closes in the same
command. The built-in AI APIs are not defined on `about:blank`; use a real https page.

- Flags: `flags get [ids...]` reads `Local State` and the flags page. `flags set <id> Default|Enabled|Disabled
  [--restart]` sets the `select` inside `flags-app` -> `flags-experiment#<id>` on `chrome://flags` /
  `edge://flags`, dispatches `change`, reloads the page and reads the value back. A flag takes effect only after
  a restart; `--restart` restarts and returns `Local State` afterwards.
- A probe or benchmark: `run <file.js>`, where the file holds `async page => {...}`. It gets a fresh tab of its
  own (the script closes it), and its return value is the result. Existing probes:
  `spikes/probes/probe10.js` (tool round trip), `spikes/probes/bench.js` (the model benchmark; it needs the
  ng222-app fixture on `http://localhost:4222`, which `control-angular-dev-app` launches).
- Ad hoc playwright-cli commands: `playwright-cli -s=ai-cb <command>`. `run-code` acts on the current tab, which
  the script keeps on its home tab; do not `tab-select` one of Lars's tabs and then run code there.

Wait by polling an observable value inside `run-code` (`waitForFunction`, a loop over `availability()`), never by
a fixed sleep. Model calls carry a 180 s per-step timeout inside the page.

Feature recipes: `features/README.md`.

## Model

```bash
node .claude/skills/control-ai-browsers/scripts/control.mjs model info --browser=msedge-dev
node .claude/skills/control-ai-browsers/scripts/control.mjs model switch nano --browser=chrome-beta
node .claude/skills/control-ai-browsers/scripts/control.mjs model download --browser=chrome-beta [--timeout-min=45]
node .claude/skills/control-ai-browsers/scripts/control.mjs model init --browser=chrome-beta
node .claude/skills/control-ai-browsers/scripts/control.mjs model clear --confirm=v3Nano --browser=chrome-beta
```

- `info`: each `manifest.json` under the model folders (name, model version, component version, MiB, folder),
  the Broker State (manifest path, performance class, assets with state and progress, use cases, models with
  weights path), the active profile from `Local State`, and the serving model. Serving model: on Edge Dev, the
  Broker State weights path points into a folder whose `manifest.json` names it (measured). On Chrome Beta both
  models stay on disk, so the script takes the asset the active flag profile selects (`gemma4_component` or
  `nano_v3_gpu_component`) and reads its manifest; that mapping is inferred from the flag-to-feature strings in
  the binary (`gemma4-for-built-in-ai` and `prompt-api-tool-use` both carry
  `AIApiFoundationalModel:model_version/v4`) plus the different `contextWindow` values.
- `switch <profile>`: sets the profile's flags on the flags page, restarts the browser, and reports `Local State`,
  `availability()` and the serving model. When `availability()` says `downloadable` or `downloading`, follow it
  with `model download`, then `model info` to see the new manifest.
- `download`: first reads free space on the profile volume and refuses (exit 2, with the numbers) when it is
  under the browser minimum, when the download would leave it under the minimum (model size from the profile
  table in the script; 4,096 MiB assumed for a model never measured), or (exit 1) when Broker State says there
  is not enough space to install. Do not delete anything else to make room; report the refusal. Otherwise, when
  `availability()` is `downloadable` or `downloading`, it opens a tab, adds a button and clicks it
  (the real user gesture `LanguageModel.create()` needs), records `downloadprogress` events, polls every 5 s until
  `create()` resolves, then waits for `available`. Output: duration from click to ready, progress samples, and
  the folders added on disk with their size. Exits 0 at once when the model is already `available`.
- `init`: in a fresh tab, times the first and second `LanguageModel.create()`, reads `contextWindow`, and runs
  `Say hi in three words.`. Right after a restart or download the first create is the cold one.
- `clear --confirm=<manifest name>`: reports free space before and after and the bytes freed. Refuses without `--confirm`, refuses `gemma4-2b-it` and
  `Aion-1.1-Instruct`, and refuses a name that no installed manifest has. Chrome Beta: Broker State's "Uninstall
  Models" button calls `uninstallModels()` with no argument (read from the page's
  `model_broker_debug.mojom-webui.js`), so it would remove Gemma 4 as well; the script instead closes the browser,
  deletes the model's version folder, starts the browser and returns the Broker State. Edge Dev: when the model
  to clear is the only one on disk, the script clicks "Uninstall Models"; otherwise it uses the same folder
  fallback.
- `restart`: CDP `Browser.close` from `run-code`, waits up to 60 s for the recorded main PID to exit (it never
  kills it), starts the executable with `--restore-last-session`, re-attaches and rewrites the state file. It
  refuses when the state file's PID is not that browser's main process (other executable or other start time).

## Inspect

- `chrome://on-device-internals` / `edge://on-device-internals`: the script clicks the third `[role=tab]` (Broker
  State) with `force: true` and reads the text through all shadow roots. Tools and Event Logs tabs are not read.
- Console and network of a skill tab: `playwright-cli -s=ai-cb console` / `requests` while the tab is current.
- Not reachable: anything in an extension context (DevTools panel, side panel, service worker); `chrome://`
  resources cannot be fetched from page code (CORS), read them through CDP `Page.getResourceContent` after
  `Page.enable`.

## Evidence

Every command writes its JSON result to `<evidence dir>/<browser>-<command>-<ms>.json` and prints the path. The
default directory is `tmp/control-ai-browsers/evidence/<YYYYMMDD-HHMMSS>/`; pass `--evidence=<dir>` to collect a
run in one place. The directory is git-ignored and survives cleanup. For a model change, keep `model info` before
and after, the `download` result (size and duration) and the `init` result. Add `--json` to get the same result
on stdout with `evidence` and `exit` fields.

## Cleanup

```bash
node .claude/skills/control-ai-browsers/scripts/control.mjs cleanup --browser=chrome-beta
```

Closes every tab whose URL holds `ai-browsers=` (the skill's own tabs), runs `playwright-cli -s=<session>
detach`, and removes the state file. It never closes the browser, never closes Lars's tabs, and keeps the evidence.
Never run `playwright-cli close`, `close-all` or `kill-all` on these sessions: `close-all` and `kill-all` reach
other agents' sessions, and Lars's browsers stay running.

## Helpers

`scripts/control.mjs <command> --browser=chrome-beta|msedge-dev [--json] [--evidence=<dir>]`

| Command | Does | Exit |
|---|---|---|
| `attach` | start if needed, attach, write state | 0 / 2 |
| `doctor [--expect=<profile>]` | the checks above | 0 / 1 / 2 |
| `flags get [ids...]` | `Local State` list and flags-page values | 0 / 2 |
| `flags set <id> <Default\|Enabled\|Disabled> [--restart]` | set through the flags page, read back | 0 / 1 / 2 |
| `canary` | structured, tool and WebMCP canaries for the active profile | 0 / 1 / 2 |
| `model info` | disk, Broker State, profile, serving model | 0 / 2 |
| `model switch <profile>` | flags, restart, report | 0 / 1 / 2 |
| `model download [--timeout-min=45]` | real-click download with progress, size, duration | 0 / 1 / 2 |
| `model init` | first and second create, `contextWindow`, one prompt | 0 / 2 |
| `model clear --confirm=<name>` | remove one model (rules above) | 0 / 1 / 2 |
| `restart` | close over CDP, relaunch, re-attach | 0 / 2 |
| `run <file.js>` | run `async page => {...}` in a fresh tab | 0 / 2 |
| `info` | state file, session, evidence dir | 0 |
| `cleanup` | close skill tabs, detach, drop state | 0 |

Exit codes: 0 done or healthy, 1 not healthy or the change did not take, 2 refused or could not run (the reason
names which: missing state file, PID mismatch, protected model, missing `--confirm`, unknown browser, attach
failure, timeout). Profiles live in the `BROWSERS` table at the top of the script; add a model there, not in
command flags.

## Gotchas

Measured on 2026-10-11 unless marked inferred.

- New CDP connections can stop being accepted while existing ones keep working. At 21:38 both browsers refused
  every new `attach` (Chrome Beta closed the socket; Edge Dev, right after the second restart, did the same), while
  another agent's older session on Chrome Beta stayed connected. About 25 minutes later both accepted `attach`
  again; the cause is not known (inferred candidates: a per-client approval prompt, or a limit on clients). The
  script exits 2 with "could not attach"; stop there and ask Lars. `cleanup` detaches, so the next `attach` is a
  new connection: do not detach in the middle of a multi-step job.
- Broker State's "Enough disk space" numbers are read at browser start and go stale; `disk.free` reads the
  volume live. Edge Dev started while C: was under 20 GB left `edge_base_model` `Not Installed` with Aion's files
  still on disk: `availability()` said `downloading` and every `create()` hung until the per-step timeout. It
  needs a restart with enough free space.
- After a restart, a new CDP connection was refused three times out of four (Edge Dev at 21:37 and 22:44).
  Inferred: a browser prompt asks Lars to allow it. A `restart`, `model switch` or folder-delete `model clear`
  therefore stops at re-attach until Lars allows it; the browser itself has restarted.
- Chrome Beta downloads `v3Nano` again by itself after `model clear`: twice, within 7-9 minutes, the 4.0 GB
  folder came back. Broker State showed `summarizer_api` and `writing_assistance_api` re-requested (not by the
  skill's `availability()` calls: measured, none of them sets Requested). `model clear` unchecks Requested for
  those use cases first, which did not stop it. Inferred cause: the `summarizer-api` and `writer-api` flags in the
  required set make Chrome request the base use cases.
- Model downloads need 20,480 MiB free on the profile drive (Broker State "Enough disk space to install").
  `availability()` does not show it: it says `downloading` while nothing downloads.
- `run-code` acts on the session's current tab. When that tab's renderer is busy, every `run-code` hangs, even
  `async page => 1+1`, and a fresh `attach` does not help. It happened on Edge Dev after a canary ran in an
  `example.com` tab: Lars's own `example.com` tabs share that renderer process, so they hung too. Hence the home
  tab on `example.org` and the per-step timeouts. A restart clears a hung renderer.
- The session can drop between commands; the script checks with `tab-list` and re-attaches before each one.
- `--raw run-code` prints the function's return value as JSON; returning a string double-encodes it.
- `chrome://restart` over CDP does not restart. `Browser.close` plus a relaunch does, and remote debugging
  stayed allowed.
- `Local State` lags the flags page: a flag set on the page did not show in `Local State` until the browser
  wrote it (on restart). Doctor reports both sources.
- Edge Dev 157's flags page does not list `edge-llm-prompt-api-tool-use` or
  `edge-llm-on-device-model-prerelease-tool-use-workaround` (neither tab), yet `Local State` keeps them and tool
  calling works. Doctor reports them under `notOnPage`.
- Edge Dev's two variants (`webgpu-fp16` and `webgpu-fp16-prerelease` under
  `EdgeOptimizationGuideModelsManifest\2026.10.2.1\variants`) name the same asset `edge_base_model`, version
  2026.10.2.1, with different hashes, and there is one `EdgeLLMOnDeviceModel` folder.
- Tool calling needs `expectedInputs [{type:'text'},{type:'tool-response'}]` and
  `expectedOutputs [{type:'text'},{type:'tool-call'}]`. Results go back as
  `new LanguageModelToolSuccess({callID, name, result:[...]})`; the field is `callID`. Gemma 4 sends `callID: ""`
  (Aion sends a hex id). Gemma 4 fails every tool prompt when a tool has an empty `properties`;
  `promptStreaming` on a Gemma 4 tool session fails.
- `on-device-internals` text is inside shadow roots: `innerText` returns nothing; walk the shadow roots.
- The flags and internals pages are localised (Lars's UI is Danish); match ids and option values, not labels.
