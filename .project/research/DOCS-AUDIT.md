# Docs Audit

Repo root: D:/projects/sandbox/angular-ai-devtools
Audited: 2026-10-15
Audited HEAD: b5d1ccf72bd6bced7299f2006fe7b50512c011d0
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 2257 |
| stale | 0 |
| aspirational | 51 |
| unverifiable | 169 |
| descriptive docs (no testable claims) | 3 |

Worst drift: AI auditors found 5 stale claims the automated scan missed: port 4317 (should be 4222) in verify-angular-devtools, an "eight skills" count (should be 10) in the afk-run decision log, a "six-feature first release" list (should include N34-N37) in feature-proposals, and stale TS source path citations in docs/design/tutor.md. 168 claims are unverifiable because nx-cloud-skill docs reference the external nx-cloud CLI package not installed in this repo.

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Controls four browser instances, one per on-device model, each started from `instances.json` with its own | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `scripts/control.mjs` does the deterministic steps; page code runs through playwright-cli attached over CDP. Lars's | structure | unverifiable | Not found: scripts/control.mjs |
| flipped and nothing restarts. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `instances.json` is the single source for each instance's browser, executable, port, features, backends, | config | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| use GPU models; `cpu` adds nothing. Default `gpu`: on CPU Nano's structured output failed 15 of 15 runs. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| One instance runs once; two agents must not drive the same instance at the same time. Lars's own profiles: his | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| Option B."). The skill no longer reads or changes them. The old commands that flipped flags in his profiles are | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| node .claude/skills/control-ai-browsers/scripts/control.mjs up chrome-beta-nano [--backend=gpu\|cpu] | structure | verified | Exists: .claude/skills/control-ai-browsers/scripts/control.mjs |
| Starts `<exe> --user-data-dir=<profile> --remote-debugging-port=<port> --no-first-run --no-default-browser-check | config | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| refuses (exit 2) when the instance already runs with another configuration (run `down` first), when another | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `on-device-internals` needs in a new profile. Measured time to ready: 1.3-2.2 s, once 28 s (Edge Dev). An | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| instance that already runs as requested is not restarted (exit 0, `alreadyRunning`). | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `attach <name>` records the running instance in the state file (`tmp/control-ai-browsers/state-<name>.json`: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `playwright-cli -s=ai-<name>` commands. `down` needs that state file. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| node .claude/skills/control-ai-browsers/scripts/control.mjs doctor edge-dev-aion | structure | verified | Exists: .claude/skills/control-ai-browsers/scripts/control.mjs |
| When availability is not `available`, the four page checks report skipped and doctor exits 1: `create()` on a | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| missing model waits for a download, and doctor never starts one. Exit 0 healthy, 1 a check failed, 2 the instance | status | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Effective features: `flags <name>` reads the command line from `chrome://version` / `edge://version` and | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - A probe: `run <name> <file.js>`, where the file holds `async page => {...}`. It runs in a new tab that is | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| closed afterwards; its return value is the result. Probes: `spikes/probes/probe10.js` (tool round trip), | structure | verified | Exists: spikes/probes/probe10.js |
| `spikes/probes/broker-state.js` (Broker State text). | structure | verified | Exists: spikes/probes/broker-state.js |
| - The benchmark: `bench [names...]` runs `spikes/probes/bench.js` in each named instance (all four by default), | structure | verified | Exists: spikes/probes/bench.js |
| load snapshot before and after each result. It needs the counter fixture on `http://localhost:4222` | config | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| (`bench.js` hard-codes the port). It does not call `spikes/probes/bench-all.sh`, which cannot record backend | structure | verified | Exists: spikes/probes/bench-all.sh |
| and load per result; it runs the same `bench.js`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| a fixed sleep. Model calls carry a 180 s per-step timeout inside the page. Recipes: `features/README.md`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| same walk as `spikes/probes/broker-state.js`): manifest path and loaded flag, performance class, disk criteria, | structure | verified | Exists: spikes/probes/broker-state.js |
| Every command writes its JSON result to `<evidence dir>/<instance>-<command>-<ms>.json` and prints the path. The | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| node .claude/skills/control-ai-browsers/scripts/control.mjs down chrome-beta-nano | structure | verified | Exists: .claude/skills/control-ai-browsers/scripts/control.mjs |
| Reads the state file and refuses (exit 2) when the recorded PID's executable, command line or start time differ | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| from the live process, or when another process owns the port. A recorded PID that no longer runs is not a | config | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| refusal: the state file is removed and the exit is 0. Otherwise it detaches the session, sends CDP | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| `Browser.close` over the browser websocket, waits up to 60 s until no process uses the profile (it never kills), | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| checks the port is free and removes the state file. Evidence stays. The standing state is all four instances | config | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| `node .claude/skills/control-ai-browsers/scripts/control.mjs <command> ... [--json] [--evidence=<dir>]` | structure | verified | Exists: .claude/skills/control-ai-browsers/scripts/control.mjs |
| Exit codes: 0 done or healthy; 1 not healthy or the change did not take; 2 refused or could not run, with the | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| reason (unknown instance, not running, missing state file, PID mismatch, port owned by another process, running | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - A Chrome profile starts with internal debugging pages off; `on-device-internals` then shows "Internal debugging | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 2026-10-12). `up` refuses such a path. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - `availability()` says `available` even when `create()` refuses the requested tool types (research 09); a | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| `callID` in both browsers, Chrome Beta 156 reads `callID` back, and Edge Dev 157.0.4329 requires `callId` | config | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| ("Required member is undefined" without it, measured 2026-10-15), so the canary sends both. Gemma 4 sends | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| `callID: ""` (Aion sends a hex id). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| `nano_v3_*`). See `features/model-lifecycle.md` for what was tried; do not clear it there until something stops | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - D: reads model weights about 30% slower than C: (`spikes/probes/read-throughput.ps1`); that only affects a cold | structure | verified | Exists: spikes/probes/read-throughput.ps1 |
| restart: `curl -X PUT "http://127.0.0.1:<port>/json/new?about:blank"`, then `curl http://127.0.0.1:<port>/json/close/<id>` | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - Exiting Node while the CDP websocket is still closing trips a libuv assertion on Windows; `down` waits for the | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - `--raw run-code` prints the function's return value as JSON; returning a string double-encodes it. | feature | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| matching feature file. `C` below stands for `node .claude/skills/control-ai-browsers/scripts/control.mjs`. | structure | verified | Exists: .claude/skills/control-ai-browsers/scripts/control.mjs |
| - Chrome Beta 156, Edge Dev 157 and Edge stable 155 are installed at the paths in `instances.json`. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - The four instances run, started by `C up <name>` (or `C instances` shows them with no drift): Nano on | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - `C doctor <name>` exits 0 for the instance a recipe uses. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Nobody else drives the same instance during the run. Sessions are `ai-<instance>` only. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:12 |
| - Page code runs in a tab the script opens on `https://example.org/?ai-browsers=<purpose>` (the built-in AI APIs | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - A model claim needs three readings: the `manifest.json` name on disk, the Broker State asset or weights path, | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - A backend claim needs the Broker State "Backend Type" of the row whose weights sit in the model folder, and the | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| command line the instance runs with. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - A download claim needs the gesture, the click-to-ready duration and the size of the folder that appeared. A | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| clear claim needs `bytesRemoved` and the disk list afterwards. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Report a step that needs Lars as blocked with the exact command; never as passed through another path. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - A canary that passes once after a change runs a second time before it counts. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| Each feature file starts with an H1 and one paragraph of behaviour, then four H2s in order: `Sub-features`, `How | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - [Instances](./instances.md): registry, up, backend, drift, effective features, down. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Health check](./health-check.md): doctor, availability, canaries, WebMCP. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Model lifecycle](./model-lifecycle.md): info, download, init, clear. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Probes and benchmarks](./probes.md): run a probe script, the model benchmark. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| A page in an instance can use its built-in AI: the instance runs as the registry says, its model is on disk and | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - `health-doctor` runs every check against one instance. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - `health-availability` reads `availability()` for LanguageModel (plain and with tool use), Summarizer, Writer, | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - A web page on an https origin calls the APIs; `about:blank` has none of them. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - `chrome://on-device-internals` / `edge://on-device-internals` > Broker State shows the model side. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - **Full doctor.** Run `C doctor chrome-beta-gemma4`. Exit 0 and fourteen check lines, each `[OK]`, `[WARN]` or | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| `[SKIP]`. `backend` reads `requested gpu`, `GPU (fastest inference)`, row `gemma4_gpu_low_tier_model`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Gemma 4 sends `callID: ""`; the canary passes it back unchanged and Chrome accepts it. Edge Dev 157.0.4329 | config | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| requires `callId` on `LanguageModelToolSuccess`; the canary sends `callID` and `callId`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `instances.json`. An instance starts, runs at the CPU or GPU backend asked for, and stops cleanly. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - `instances-list` shows every registry entry with its PID, backend, drift and open tabs. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - `instances-up` starts an instance (creating its profile on first use) at its default or a named backend. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `instances-features` reads the effective features from the version page. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - `instances-down` closes an instance over CDP and confirms nothing of it is left. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:13 |
| - `http://127.0.0.1:<port>/json/version` and `/json/list` for the CDP endpoint and its tabs. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| reads `stopped`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - **Effective features.** Run `C flags edge-dev-aion`. `[OK]` with the nine Aion features; exit 1 names any | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| - **Down and up.** Run `C attach chrome-beta-nano`, `C down chrome-beta-nano` (port free, state file | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| chrome-beta-gemma4` shows `backend` `requested cpu`, Broker State `CPU`. Go back with `down` and `up`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - **Refusals.** `C up edge-dev-aion --backend=cpu` exits 2 before anything starts. `up` on a running | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Lars's everyday Edge runs the same `msedge.exe` as `edge-phi4mini`. The script finds instance processes only by | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Node's `spawn` writes `--user-data-dir=D:/...` without quotes; instances started by hand have quotes. The drift | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - `model-download` starts a download from a trusted gesture, reports progress, size and duration, and waits for | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `model-init` times the cold and warm `create()` and reads `contextWindow`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - A page calls `LanguageModel.create({ monitor })` from a click; the browser downloads the model. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| <version>` (Gemma 4), `EdgeLLMOnDeviceModel/<version>` (Aion, Phi-4-mini), each with a `manifest.json`. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **Check.** Run `C doctor chrome-beta-nano`; exit 0. | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| - `model clear` refuses a running instance: deleting files under a running browser is unsafe, and a running | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Chrome starts downloading a Requested model at launch without any page call. After `down`, `clear`, `up`, | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - The Gemma 4 instance holds Nano that the Prompt API there never uses: both variants (GPU 2025.8.8.1141, | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| `downloading` while nothing downloads. `model download` refuses earlier: free space minus the model's | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| `downloadMib` must stay above the browser minimum in `instances.json` (Chrome 22,528 MiB, Edge 20,480 MiB). | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `availability()` can say `available` while `create()` refuses tool types; trust the tool canary instead. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - `probe-run` runs any `async page => {...}` file in a new tab and closes the tab. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - `probe-tools` runs the two-tool round trip in `spikes/probes/probe10.js`. | structure | verified | Exists: spikes/probes/probe10.js |
| - `probe-bench` runs `spikes/probes/bench.js` in one or more instances and records backend, performance class and | structure | verified | Exists: spikes/probes/bench.js |
| - A developer opens DevTools on a page and calls `LanguageModel` by hand; the script does the same in a tab it | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| `http://localhost:4222` (`bench.js` hard-codes it; `control-angular-dev-app` launches the fixture). That is | config | verified | .claude/skills/control-ai-browsers/features/probes.md:22 |
| the main checkout's port: in a worktree `control-angular-dev-app` derives another port and refuses 4222, so | config | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| `bench` runs from the main checkout only. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - **Broker State text.** Run `C run chrome-beta-nano spikes/probes/broker-state.js --json`. `result` is the | structure | verified | Exists: spikes/probes/broker-state.js |
| Broker State text; the tab is gone afterwards (`C instances` shows `1 tab(s)`). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - **Tool round trip.** Run `C run edge-dev-aion spikes/probes/probe10.js --json`. `result.q1.answer` names 42 | structure | verified | Exists: spikes/probes/probe10.js |
| `backend`, `performanceClass`, `cpuBefore` and `cpuAfter` (load percent and the five busiest processes), the | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:41 |
| duration and `result`, the `bench.js` return value. Summarise with `node spikes/probes/bench-summary.mjs` on | structure | verified | Exists: spikes/probes/bench-summary.mjs |
| - **Own probe.** Write `async page => { await page.goto('https://example.org/'); return page.evaluate(...); }` to | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - A probe without its own timeouts can hang the session's renderer; wrap model calls in `Promise.race` with a | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| timeout. `bench.js` has a 120 s per-prompt timeout and returns tool exceptions as tool errors. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - `spikes/probes/probe10.js` passes only `callID` to `LanguageModelToolSuccess`, so on Edge Dev 157.0.4329 its | structure | verified | Exists: spikes/probes/probe10.js |
| `doctor`'s `canary.tools` covers the round trip there until the probe sends `callId` too. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - `bench` does not use `spikes/probes/bench-all.sh`: that script cannot record the backend and load per result, | structure | verified | Exists: spikes/probes/bench-all.sh |
| and it uses the `bench-*` sessions, which belong to Claude. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Benchmark latency depends on the backend and on CPU load from other sessions on this machine; compare only | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Launches the counter fixture, the SSR fixture or the Insurance Portal on derived ports, or attaches to any running dev-mode | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:22 |
| Angular app by URL; checks the page is an Angular development build; drives it through a named playwright-cli | feature | verified | .claude/skills/control-ai-browsers/features/README.md:12 |
| session; reads Angular state through `window.ng` helpers; captures evidence; tears down only what it started. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| sessions are looked up from there. `S` stands for `.claude/skills/control-angular-dev-app/scripts/control.mjs`. | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/control.mjs |
| A worktree is detected by `.git` being a file. From a worktree, `up` refuses the main checkout's port; use | config | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| node .claude/skills/control-angular-dev-app/scripts/control.mjs up --target counter --json | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/control.mjs |
| - Counter runs `node node_modules/@angular/cli/bin/ng.js serve --port <port>` in the fixture folder. | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - SSR runs `node node_modules/@angular/cli/bin/ng.js serve --port <port> --no-hmr` in `spikes/ng222-ssr`. The | structure | verified | Exists: spikes/ng222-ssr |
| dev server renders every request on the server through `src/server.ts` (development mode, so `window.ng` | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Portal runs two processes in the portal folder: `node node_modules/nx/dist/bin/nx.js run api:serve` with | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `PORT=3000`, and `node node_modules/nx/dist/bin/nx.js run insurance-portal:serve --port=<port>` with `PORT` | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| (`<app-root>`, `<ng-journal-root>`). The doctor then checks the rendered page. | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| - The portal API starts first and the app only after the API answers. Started together, the two cold `nx run` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| processes timed out in the Nx plugin worker ("did not receive a load message within 10 seconds") in 3 of 4 runs | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| (2026-10-11). Started one at a time, 2 of 2 runs passed (2026-10-12). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Measured time to ready, warm caches: counter 2.6-8 s (four runs), SSR 7.5-14.5 s (four runs, 2026-10-12), portal 18.5-20.5 s with the API first (two | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| runs). In a fresh worktree with a cold `.angular` cache: counter 21 s, SSR 19.3 s (2026-10-15). The first | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - `up` refuses (exit 2) a port already in use and names the owning PID; that may be Lars's own server. | config | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| node .claude/skills/control-angular-dev-app/scripts/control.mjs doctor [--target ...\|--url ...] [--json] | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/control.mjs |
| forwarded as `(client)`, including the multi-line NG0500 that `ssr-check.js` provokes on `?mismatch=1`; | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| the overlay opens a `prompt` for a one-time code that blocks every playwright-cli command. Doctor reads the | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| code from control-pangular-inspector's `pangular.log` (via its state file `pangular-9999.json`) and enters it; | config | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `browser-session`: opens (or reuses) the run's session `control-ngdev-<flowId>` and goes to the app URL. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - `angular-root`: an element with `[ng-version]`; prints the version and root tags. `app-marker`: the fixture's | feature | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |
| (last record; `NoopNgZone` = zoneless), plus whether zone.js is loaded and `mark_feature_usage` marks. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| listens on port 9999. Without a server: three `__connection.json` 404/502 and `[pangular] No devtools server | config | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| found` ("it found no devtools server"). With control-pangular-inspector's server: one `__connection.json` 404, | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| which is expected ("expected while a devtools server runs"). | feature | aspirational | Aspirational claim (future/desired state) |
| Exit 0 healthy, 1 a check failed (named), 2 could not run. The doctor also installs the `__ngc` helpers | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| - Router setup shortcut (not a user path): `eval "() => __ngc.navigate('/claim/list')"` calls | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| Recipes per feature: [features/README.md](features/README.md). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| `playwright-cli -s=<session> --raw run-code --filename=.claude/skills/control-angular-dev-app/scripts/ng-inspect.js` | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/ng-inspect.js |
| Also: `playwright-cli -s=<session> console`, `requests` (the portal calls `http://localhost:3000/api/...`), | config | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| SSR target: `playwright-cli -s=<session> --raw run-code --filename=.claude/skills/control-angular-dev-app/scripts/ssr-check.js | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/ssr-check.js |
| id="ng-state">`, `ng-server-context`), loads each page, and returns `window.ng`, the `ngDevMode` hydration | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| counters, every node whose `__ngDebugHydrationInfo__` status is not `hydrated` (with expected and actual DOM) | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| and console errors, plus six named checks and `ok`. It navigates the session's page and ends on `/`. The SSR | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| reads in [features/ssr.md](features/ssr.md) cover transfer state, `@defer` blocks, event replay and render | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| Evidence and logs go to `tmp/control-angular-dev-app/<flowId>-<timestamp>/` (git-ignored; `info` prints it). | feature | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |
| counter line, or the SSR heading "Render mode: server"), the side effect (URL, `requests`, an `__ngc` read saved with `--raw ... > file.json`), and | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| the server log. Proof rules: [features/README.md](features/README.md#proof-and-skip-reporting). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| node .claude/skills/control-angular-dev-app/scripts/control.mjs down [--target ...\|--url ...] | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/control.mjs |
| Checks every recorded PID against its recorded start time and command line, closes the run's playwright-cli | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| session, stops each recorded process tree (`taskkill /T /F` by PID), deletes the state file, keeps the | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| evidence directory. A PID that no longer runs is noted, not refused. Never `playwright-cli close-all` or | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `scripts/control.mjs <command> [--target counter\|ssr\|portal] [--url <url>] [--port N] [--dir <path>] [--timeout S] [--json]` | structure | unverifiable | Not found: scripts/control.mjs |
| `scripts/ng-inspect.js` is a playwright-cli `run-code` file: it installs `__ngc` and returns the doctor's page | structure | unverifiable | Not found: scripts/ng-inspect.js |
| facts. `scripts/ssr-check.js` is a `run-code` file for the SSR target (Inspect). | structure | unverifiable | Not found: scripts/ssr-check.js |
| - Nx 23's CLI entry is `node_modules/nx/dist/bin/nx.js`; the script reads it from `package.json` `bin`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - The portal API port is fixed at 3000, so only one portal flow runs at a time on this machine. | config | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Portal data is generated by faker when the API starts: names, policy numbers and ids change with every | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - The portal loads the Pangular Inspector overlay in development builds (`main.ts`, since the portal commit | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - `/claim/create` shows the heading "Complaint Create" (app bug, reported, not patched). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - Never run Angular's in-page tool `angular:di_graph` and never call `injector.get` on a node injector's | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `ViewContainerRef`: afterwards `ng.ɵgetSignalGraph` loses the template node for the rest of the page's life | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| (research/05-spikes.md). The helpers read providers through `ɵgetInjectorProviders` only. | structure | verified | Exists: research/05-spikes.md |
| the portal loads zone.js yet is zoneless. Read zone mode from the LAST `NgZone` provider record, as the doctor | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Zone.js app lists `NoopNgZone` first and `NgZone` (`useFactory`) last. Measured 2026-10-12 on both fixtures | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - The counter's `effect` writes a signal on purpose (anti-pattern fixture). Do not fix it. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| `?mismatch=text` renders different text on server and client, which hydration overwrites with no error. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| Production prerendering (HTML written at build time) is not what the dev server shows. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - Run commands from the repository root. `S` is `.claude/skills/control-angular-dev-app/scripts/control.mjs`. | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/control.mjs |
| - Counter: `node $S up --target counter`, then `node $S doctor` exits 0. Fresh page state: `count` 3, | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - SSR: `node $S up --target ssr`, then `node $S doctor --target ssr` exits 0 on `/`. Fresh page state: | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Portal: `node $S up --target portal` (API on 3000, app on the derived port, 4775 by default), then | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `node $S doctor --target portal` exits 0. No login. Every flag in | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `apps/insurance-portal/src/assets/feature-flags.manifest.json` decides whether a sidebar entry and its route | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Take `<session>`, `<url>` and `<evidenceDir>` from `node $S info`. Desktop viewport (playwright-cli default). | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Check the side effect next to the screen: the URL, `requests` for API calls, an `__ngc` read for Angular | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| change; report verified, not verified, or inconclusive. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - A recipe that passed once after a fix runs a second time before it counts. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - The external link `https://www.ng-journal.com` in the portal header (leaves the app). | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - [Counter](./counter.md): the ng222-app counter, its signals and its effect. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [SSR and hydration](./ssr.md): server HTML, hydration counters and mismatches, transfer cache, `@defer` | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Portal navigation](./portal-navigation.md): header, sidebar, home tiles, lazy routes, not-found page. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Portal contracts](./portal-contracts.md): list, details, edit and save, create and save. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Portal claims](./portal-claims.md): list, details, create form. | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| - [Portal complaints and customers](./portal-complaints-customers.md): both lists, complaint details, complaint | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| The ng222-app page shows one line, `Clicks: 3 (double 6, cart 1)`, and an `Increment` button. Each click | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - `counter-render` shows title, count, double and cart size on load. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - `counter-signals` exposes the signal graph: template, `title`, `count`, `double`, `items`, one effect. | feature | verified | .claude/skills/control-angular-dev-app/features/counter.md:11 |
| - `counter-effect` the effect writes `lastLogged` on every change (deliberate anti-pattern fixture). | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - Open `<url>` (`http://localhost:4222/`). There are no routes; the counter is the whole page. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - `node $S up --target counter` and `node $S doctor` exit 0 on a fresh page. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `playwright-cli -s=<session> snapshot --filename=<evidenceDir>/counter-after.yml`. The paragraph reads | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| <evidenceDir>/counter-signals.json`. After one click: `count` 4, `double` 8; edges include | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **Dependencies.** `eval "() => __ngc.dependenciesOf('app-counter', 'double')"` returns | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| `dependsOn: ["count"]`. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| - **Change detection.** `eval "() => __ngc.inspect('app-counter').changeDetection"` returns `"OnPush"`; inputs | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - **Effect.** `eval "() => __ngc.inspect('app-counter').state.lastLogged"` returns `{signal: <count>}` | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| returns `["click"]`. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - The effect node has an empty label, so `dependenciesOf` cannot name it; read it from `signals()`. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - `router()` returns `present: true` with an empty route list: `provideRouter(routes)` with `routes = []`. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - Do not fix the effect that writes a signal; other tools use it as a fixture. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Users list insurance claims, open a claim's details, and file a new claim with claim number, date, damage | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| type, the contract's policy number and a description. Data comes from `http://localhost:3000/api/claims`. | config | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| (the facade drops claims whose contract or customer is missing). | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| - Home tile `Claims`; sidebar Claim `List` and `Create`. | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| - **List.** `playwright-cli -s=<session> click "getByRole('link', { name: 'Claims' })"`, wait with | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| tr').first().waitFor(); return page.url(); }"`. Snapshot shows `heading "Claims"` and the five column | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| - **Signals.** `eval "() => __ngc.signals('ng-journal-list').edges.filter(e => /claims\|#state/.test(e))"` | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| returns `template:ng-journal-list -> computed:claims` and `computed:claims -> signal:#state`. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| snapshot shows `heading "Claim Details"` and a customer `link` with `/url: /customer/<id>/details`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - **Create form.** Sidebar Claim `Create`; snapshot shows `combobox "Select damage type"`, | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - **Proof.** Snapshot files and `screenshot --filename=<evidenceDir>/claims.png`. | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| - `/claim/create` shows the heading `Complaint Create`: an app bug, measured; report it, do not patch it in the | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - The list component's signal graph is mostly UI-library styling signals; filter by label (`claims`, `#state`). | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `http://localhost:3000/api/complaints` and `/api/customers`. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| Payments), `Select customer`, Date prefilled with today, Description; `Save` disabled until valid. Save sends | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| `POST /api/complaints` (201), shows a success toast and opens the new complaint's details. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| `**/complaint/list` and a table row; snapshot shows `heading "Complaints"` and the four headers. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| })"`. The URL becomes `/complaint/<id>/details` and `requests` shows | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| `[POST] http://localhost:3000/api/complaints => [201] Created`. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - **API.** `playwright-cli -s=<session> requests` shows `GET http://localhost:3000/api/customers`. | config | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| restarts (`down`, `up`). | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| research/05-spikes.md); query one signal with `dependenciesOf` instead of dumping the graph. | structure | verified | Exists: research/05-spikes.md |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| policy number and start date. Data comes from the API at `http://localhost:3000/api/contracts`. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - `contract-customer-link` the customer name on details links to `/customer/<id>/details`, which shows | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| changes, then sends `PUT /api/contracts` and returns to details with the new value. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| Policynumber textbox, Insurance Start On date field, `Save` disabled until valid; Save sends | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - Portal healthy (`node $S doctor --target portal` exits 0); page on `/home`. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `playwright-cli -s=<session> --raw eval "() => document.querySelectorAll('table tbody tr').length"` returns | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| `20`; snapshot shows the six column headers. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| page.url(); }"`. Snapshot shows `heading "Contract Details Edit"`, the policy number of the clicked row and | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - **API side effect.** `playwright-cli -s=<session> requests` lists `GET http://localhost:3000/api/contracts/<id>`. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| shows its inputs (`withComponentInputBinding` passes the route `id`). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| 'Save' })"`. The URL returns to `/details`, the snapshot shows `"99999999"`, `requests` shows | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| `[PUT] http://localhost:3000/api/contracts => [200]`. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - **Create form.** Sidebar Contract `Create`; snapshot shows heading `Contract Create`, `combobox "Select | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| d.inputValue(); }`, then click `Save`; the URL becomes `/contract/<id>/details` and `requests` shows | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| `[POST] http://localhost:3000/api/contracts => [201] Created`. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - Saving a contract writes into the API's in-memory store; restart the portal flow (`down`, `up`) to reset. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - Typing a date into Insurance Start On (`fill`) shows the text but leaves `Save` disabled; pick the day in | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| shows four tiles linking to the domain lists. Domain routes load lazily, guarded by feature flags; unknown URLs | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - `nav-home` `/` redirects to `/home`; heading `Home`; tiles Contracts, Claims, Complaints, Customers. | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| - `node $S up --target portal`; `node $S doctor --target portal` exits 0 and leaves the page on `/home`. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - **Home.** `playwright-cli -s=<session> snapshot --filename=<evidenceDir>/home.yml` shows | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| `heading "Home" [level=1]` and links `Contracts`, `Claims`, `Complaints`, `Customers` with `/url: | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| page.locator('table tbody tr').first().waitFor(); return page.url(); }"` prints `.../contract/list`. | feature | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |
| - Only the sidebar group headings render upper-case (`CONTRACT`, through the `capitalize` pipe, which calls | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - The last node of every snapshot is the Pangular overlay's `button "Toggle Pangular Inspector"`; it is not | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - The header link goes to `https://www.ng-journal.com`; do not click it in a proof. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| The ng222-ssr page is rendered on the server and hydrated in the browser. It shows the heading | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| `hydratedNodes` 40, no node with a status other than `hydrated`. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - `ssr-event-replay` a click before `main.js` runs is queued in `window._ejsas.ng.q` and replayed after | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Open `<url>` (`http://localhost:4223/`); the nav links `Server route`, `Prerender route` and `Client route` | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - `node $S up --target ssr` and `node $S doctor --target ssr` exit 0 on a fresh page. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| --filename=.claude/skills/control-angular-dev-app/scripts/ssr-check.js > <evidenceDir>/ssr-check.json`. | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/ssr-check.js |
| `ok` is `true` when all six checks pass; `expected-mismatch-detected` is the `?mismatch=1` case. | feature | aspirational | Aspirational claim (future/desired state) |
| returns one entry keyed by a hash, with `u: "/api/items"`, `s: 200`, `b` the body. It re-reads the | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| returns 0 on `/` and 1 after `goto <url>?transfer=0`. The server log counts every hit as `[api] GET /api/items` | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| returns `initial`, `dehydrated`, `["hydrate on interaction", "on idle"]`. Then | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| `click "getByRole('button', { name: 'Deferred click' })"`; the same read returns `complete`, `hydrated`, and | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| the page shows `Deferred clicks: 1`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - **Event replay and render modes.** Run the spike probes `spikes/probes/ssr-event-replay.js` and | structure | verified | Exists: spikes/probes/ssr-event-replay.js |
| `spikes/probes/ssr-render-modes.js` with `--raw run-code --filename=...`. The event-replay probe holds | structure | verified | Exists: spikes/probes/ssr-render-modes.js |
| `main.js` back with `page.route`, clicks `Early click` on `/` and reads `Early clicks: 1` after hydration; the | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| closest component host, not on the node that differs. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Manages the Angular DevTools extension and drives its panel. Supported browsers: `chrome`, `chrome-beta`, | feature | verified | .claude/skills/control-ai-browsers/features/README.md:12 |
| Chrome, and Chrome Beta. Not Firefox because it doesn't support Prompt API so isn't relevant for this | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| Rules for proof runs (not for Lars asking for a change): never touch `chrome` or `edge` (his daily browsers); | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| agent restarts them; never use the playwright-cli sessions `cb`, `ed`, `ai-cb`, `ai-ed`, `ng-dev`. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `S=.claude/skills/control-angular-devtools/scripts/control.mjs` below, run from the repository root. | structure | verified | Exists: .claude/skills/control-angular-devtools/scripts/control.mjs |
| The script derives all of these; `--cdp-port N` overrides the port. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| node $S install                                   # copy from Edge Dev's profile, read only | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| node .claude/skills/control-angular-dev-app/scripts/control.mjs up --target counter --port 4317 | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/control.mjs |
| node $S up --app-url=http://localhost:4317/ | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| source. Never writes to the source. The copy keeps `_metadata/`; Chromium accepted it (0 manifest errors, | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - `up` writes a playwright-cli config (`tmp/control-angular-devtools/state/<flow>.cli.config.json`) with | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| --remote-debugging-port=<port>`, then runs `playwright-cli -s=ngdt --config=<file> open <app-url>`. The | config | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `--config` / `launchOptions` schema is in playwright-cli 0.1.21's README; no Node launcher is needed. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Ready when the CDP port lists the extension's `service_worker` target. Measured: 2.9-8 s (2.9 s from a fresh copy and profile, 8 s measured 2026-10-11). | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| `npx ng serve --port <free port>` in `spikes/ng222-app`, and stop that PID's tree yourself. | structure | verified | Exists: spikes/ng222-app |
| `node $S doctor` (read only). One line per check: `process` (the playwright-cli PID is alive and its start | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| development build has), `connected-flag`, `devtools-window`. Exit 0 healthy, 1 a check failed, 2 no state. | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| - **The Angular DevTools panel:** raw CDP from `control.mjs` (Node 24 `fetch` and `WebSocket`, no | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| dependency). `up` opens DevTools for the tab, which shows up on the CDP port as a `devtools://devtools/ | config | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| it, then drives the panel's own target `chrome-extension://<id>/index.html` with `Runtime.evaluate`. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:12 |
| node $S attach                                   # attach markers, Angular version | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| node $S panel show                               # opens the Angular tab, prints the panel text | command | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |
| node $S panel signal-graph --component=app-counter | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| node $S panel screenshot                         # PNG of the DevTools window into the evidence dir | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| node $S coexist [--di-graph]                     # see Inspect | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| Panel handles (read from the live panel, 1.22.0): tabs are buttons/links named `Components`, `Profiler`, | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:85 |
| app provides the router, even with an empty route list as in the counter (`devtools-tabs.component.ts`); tree rows are `.node-name`; the `Show Signal Graph` button; graph | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| (`signals-visualizer.ts`; the counter shows the first four); | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| the profiler button has `aria-label` `Start recording` / `Stop recording` and the result reads | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| Feature recipes: `features/README.md`. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| devtools-connected-flag}.ts`: `window.__NG_DEVTOOLS_CONNECTED__ === true` (MAIN-world script at | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| The console also shows `Attempting handshake with backend` from `content_script_bundle.js`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| subscribers, clicks the app, removes one with its returned function, clicks again, stops recording. Passes | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| when the removed one stops counting, the other keeps counting and DevTools recorded the cycles. Never call | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `ng.ɵsetProfiler(null)`: it empties the list, DevTools' subscriber included (`render3/profiler.ts`). Then | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| checks the connected flag and that the pane's signal graph matches `ng.ɵgetSignalGraph`. `--di-graph` runs | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| Angular's `angular:di_graph` tool and re-reads both: the template node disappears from both (measured). | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - **Branded browsers:** `status --browser <name>` reads `<User Data>/<profile>/Extensions/<id>/` and | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| read properties of undefined (reading 'inspectedWindow')` from `bundle/main.js`); Playwright | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `tmp/control-angular-devtools/evidence/<yyyymmdd-hhmmss>/` (git-ignored), created by `up`: `coexist.json`, | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `playwright-cli -s=ngdt snapshot --filename=<evidence dir>/<name>.yml`. Proof rules: `features/README.md`. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| `node $S down`: checks the recorded playwright-cli PID's start time and command line, runs | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `playwright-cli -s=ngdt close`, waits for that PID and the Chromium PID to exit (`taskkill /T /F` on the | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| already gone is noted, exit 0. Then stop the app with the tool that started it. Never `close-all` or | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| `kill-all`. `uninstall` (test) deletes the extension copy and test profiles; it refuses while `up`. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| `scripts/control.mjs <command> [options] [--json]`; exit 0 done or healthy, 1 not healthy, 2 refused or | structure | unverifiable | Not found: scripts/control.mjs |
| a non-numeric `--timeout`/`--cdp-port` exits 2 before anything runs. | config | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - playwright-cli prints the PID of its own Node daemon ("opened with pid N"), not Chromium's. The CDP port | command | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |
| - Playwright's init script runs before the extension's MAIN-world `document_start` script (the flag was | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| AI extension reads `__NG_DEVTOOLS_CONNECTED__` lazily, never at its own start, and never writes it. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - `attach` traps the flag with an accessor to time it; later reads of its property descriptor see that trap. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - A click resolves before Angular's change detection runs. The first probe read 2 profiler events after a | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - The pane re-reads the graph after change detection; `coexist --di-graph` clicks the app before the second | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - `--auto-open-devtools-for-tabs` needs a headed browser; the window opens on Lars's desktop. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| user the title becomes `Angular & Wiz` (`shell-browser/src/devtools.ts`) and `panel` would not find it | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| browser. `--profile P` also passes `--profile-directory=P` to the window it opens (not yet run in a branded browser). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `.claude/skills/control-angular-devtools/scripts/control.mjs`. | structure | verified | Exists: .claude/skills/control-angular-devtools/scripts/control.mjs |
| `spikes/ng222-app` (Angular 22.2.2) through `control-angular-dev-app up --target counter --port 4317`. | structure | verified | Exists: spikes/ng222-app |
| - Test harness: `node $S install`, `node $S up --app-url=<app url>`, `node $S doctor` exits 0. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Branded browser: `node $S status --browser <name>` says installed. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Panel: `control.mjs panel ...` and `coexist` (raw CDP into `chrome-extension://<id>/index.html`). | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Record the state before and after the action: the pane's node list and a DevTools window screenshot. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - A claim about a fix runs on the old state and the new one and reports verified, not verified or | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| inconclusive. A result that passed once after a change runs a second time before it counts. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Name every entry point a run did not reach and why (see Manual only); never report it as covered. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - [install.md](install.md) - install, uninstall and status per browser | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [attach.md](attach.md) - extension detects the app, injects its backend, shows the Angular version | feature | verified | .claude/skills/control-angular-devtools/features/attach.md:3 |
| - [signal-graph.md](signal-graph.md) - Components tab, signal graph pane | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [profiler.md](profiler.md) - Profiler tab recording, coexistence with other `ɵsetProfiler` subscribers | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - The panel in branded browsers (press F12, pick the Angular tab): the scripted path uses DevTools frontend | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| Router Tree shows only when the app has routes, Transfer State only for a hydrated (SSR) app. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| On an Angular page the extension sets a flag, detects Angular, injects its backend and shakes hands with it, | feature | verified | .claude/skills/control-angular-devtools/features/attach.md:3 |
| and its toolbar icon turns from grey to colour. The Angular tab in DevTools then shows the app; the info | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| button shows the Angular version. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| node $S attach | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `app/content_script_bundle.js`), the popup shows `production.html`, and | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| `attach` exits 1 because it requires `isDebugMode`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:38 |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - Status: test: the copy on disk and whether `up` runs (registered version and enabled state come from | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Store page: `https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh`, the add button, then | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| Preconditions: none for `status`; a test `install` needs no browser running, a branded one needs Lars at the | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| browser to click the store button. A test `uninstall` refuses while `up` runs (`down` first). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| node $S install                          # test copy from Edge Dev (read only) | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| node $S status --browser=chrome-beta     # read only, any branded browser | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| node $S install --browser=chrome-beta    # opens the store page, polls for Lars's click (default 180 s) | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| node $S uninstall --browser=chrome-beta  # opens the store page, polls for "Remove from Chrome" | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| node $S uninstall                        # test copy and profiles | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `status` shows `installed true` with the version, and the profile's `Extensions/<id>/<version>_0` folder. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - Branded install, uninstall and reinstall are proven in Chrome Beta (2026-10-11, measured): install exit 0, uninstall exit 0 once Lars removed it, install exit 0, verify-angular-devtools's `verify.mj | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| - Right after the click, the profile entry can exist before the manifest version is written; `install` then reads the version from the `<version>_0` folder name. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - `--profile P` picks the profile read and also passes `--profile-directory=P` to the window it opens (not yet | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - Proof runs never touch `chrome` or `edge`, and never uninstall the copy in `edge-dev`; branded install and | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| The Profiler tab records change detection cycles while the developer uses the app, then shows a bar per | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| node $S coexist | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `ɵsetProfiler(cb)` returns. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| the evidence that it still runs. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - Agreement with `ng.ɵgetSignalGraph(ng.getInjector(host))`, which the pane's backend calls. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - The `angular:di_graph` regression: after that tool runs, the template node is gone from both. | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| node $S panel signal-graph --component=app-counter | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| node $S panel screenshot | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| node $S coexist --di-graph        # before/after angular:di_graph, with screenshots | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Manages Pangular Inspector in a target Angular app and reads the running app through it. `scripts/control.mjs` | structure | unverifiable | Not found: scripts/control.mjs |
| installs and removes the dependency and its configuration, starts the standalone devtools server, checks the | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Skip it for production builds (no `window.ng`, the overlay import is compiled out) and for Lars's own | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| `S=.claude/skills/control-pangular-inspector/scripts/control.mjs`. The app folder defaults to the Insurance | structure | verified | Exists: .claude/skills/control-pangular-inspector/scripts/control.mjs |
| `install` detects the flow (SSR or `server.ts` -> hub, a `vite.config.*` -> plugin, otherwise standalone) and | feature | verified | .claude/skills/control-angular-devtools/features/attach.md:3 |
| automates only the standalone flow; the other two refuse with exit 2 and point to "Other mounts" below. Why | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| Ports: 9999 is fixed per app because `proxy.conf.json` names it (`install --port N` writes another one; pass | config | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| the same `--port N` to every command). The portal itself uses its derived port (4775 for the default | config | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| worktree) and API port 3000, both owned by `control-angular-dev-app`. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| 1. Install once (idempotent): `node $S install`; the npm install step takes most of its time. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - `npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7` (devDependency: it only runs | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| in development builds). `devframe` is not added: the package depends on it and npm hoists it | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| (`npm ls devframe` shows 1.2.3). The docs add it in every install command because pnpm and similar | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - Puts back the 27 committed lockfile entries npm 11 drops from this checkout on any install, so the | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - `main.ts`: the overlay import after bootstrap, guarded by `typeof ngDevMode === 'undefined' \|\| ngDevMode` | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| (the docs' Angular CLI form; Analog uses `import.meta.env.DEV`). | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - `apps/<app>/proxy.conf.json`: `/__pangular` -> `http://localhost:9999`, prefix stripped, `ws: true`; | config | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| and `serve.options.proxyConfig` in the app's `project.json` (the docs put the file next to | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `angular.json`; Nx keeps it in the app folder and names it workspace-relative). Formatted with the repo's | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 2. Start the app: `node .claude/skills/control-angular-dev-app/scripts/control.mjs up --target portal` | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/control.mjs |
| (17-20 s to ready, measured). Its `info` prints the URL (`http://localhost:4775/`). | config | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |
| 3. Start the devtools server: `node $S up --app-url http://localhost:4775/`. It runs | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `node node_modules/@pangular-inspector/devtools/bin.mjs dev --port 9999 --no-open --root <app> --read-only` | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| (2.2 s measured). `--allow-actions` drops `--read-only`. `up` refuses a busy port 9999 and names its PID. | config | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| `node $S doctor [--app-url <url>] [--json]` - one line per check, exit 0 healthy, 1 a check failed, 2 could not run: | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - `package-pinned`: `package.json` declares exactly 0.0.7 and `node_modules` holds 0.0.7. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `overlay-import`: `main.ts` imports the overlay behind a dev guard. | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - `process-alive`, `port-owned`: the recorded PID runs with its recorded start time and holds 9999. | config | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| (`window.ng`), `overlay-page-id` (`window.__pangularPageId`), `overlay-connected` (`list-pages` shows that | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| id), `console-errors` (none besides the overlay's expected `/__connection.json` 404). | feature | aspirational | Aspirational claim (future/desired state) |
| Fallbacks: `node $S scan <get-routes\|get-components\|...>` runs the CLI's stdio MCP server (source scan, no | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| app needed); the panel UI at `http://localhost:4775/__pangular/` in the same playwright-cli session (wait for | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| `tmp/control-pangular-inspector/pangular-<port>-<timestamp>/` (git-ignored; `info` prints `evidenceDir`). A | config | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |
| relative `--out name.json` on `tools`, `call`, `components` and `resource` writes there; pass | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| `pangular.log`. Proof rules: `features/README.md`. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| `node $S down` checks the recorded PID against its start time and command line, closes session | command | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| `pangular-9999`, stops that PID's tree (`taskkill /T /F`), deletes the state file, keeps the evidence. A PID | config | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| that no longer runs is noted, not refused; a mismatch is refused with exit 2. Then stop the app with | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| Removing Pangular from the app: `node $S remove` restores every file `install` changed from git `HEAD`, | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| deletes `proxy.conf.json` when git does not track it, prunes `node_modules` with `npm install`, restores the | command | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| lockfile once more (npm's unrelated drift), and exits 0 only when `git status --porcelain` and `git diff HEAD` | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| are empty. It refuses (exit 2) when the worktree has changes in files it does not manage. Stop the servers | status | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| `scripts/control.mjs <command> [--dir <app>] [--project <name>] [--port N] [--json]` | structure | unverifiable | Not found: scripts/control.mjs |
| application/json, text/event-stream`, `Origin: http://localhost:<port>`, optional bearer token from | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - Express SSR, `src/server.ts`: `const devtools = initPangularHub({ ws: false, agent: { readOnly: true } }); app.use(devtools.nodeMiddleware);` | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| script sends the same variable. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - Standalone CLI options live in `pangular.config.json` or `--config`; it has no `allowedOrigins`; `--host` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| and `--no-auth` widen access, so `up` passes neither. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - The source scan reads `angular.json` projects or `<root>/src` only. In this Nx workspace (project.json, code | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| in `libs/`) `get-components` returns `[]` at the workspace root and only the 4 app-shell components with | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - The first page load shows a `prompt` asking for the one-time code; any playwright-cli command then fails | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| with "does not handle the modal state". `doctor` reads the newest `auth code` from `pangular.log` and | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - While this server runs, `control-angular-dev-app doctor --target portal` fails (measured): its own session | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `down`; this skill's own doctor covers the page while Pangular runs. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - The standalone server listens on `[::1]:9999`; the proxy target `http://localhost:9999` reaches it. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - `process.exit` while a `fetch` keep-alive socket is open crashed Node 24 on Windows with | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` (exit 127); the script uses `node:http` without | status | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - npm 11.16 drops 27 entries (`@module-federation/*`, `@rspack/binding*`, ...) from the committed lockfile on | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - `install` re-formats only the files it writes, with the repo's prettier; a plain `JSON.stringify` reflowed | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| every array in `project.json`. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - Run commands from the repository root. `S` is `.claude/skills/control-pangular-inspector/scripts/control.mjs`; | structure | verified | Exists: .claude/skills/control-pangular-inspector/scripts/control.mjs |
| `D` is `.claude/skills/control-angular-dev-app/scripts/control.mjs`. | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/control.mjs |
| - Setup: `node $S check` exits 0 (pin, overlay import, proxy). If not, `node $S install`. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - App: `node $D up --target portal` (API 3000, app 4775 for the default worktree). | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Server: `node $S up --app-url http://localhost:4775/`, then `node $S doctor` exits 0 with | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Take `evidenceDir` and `session` (`pangular-9999`) from `node $S info`. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Check that a read describes the page you drove: `list-pages` shows the page id and URL you expect. | feature | verified | .claude/skills/control-pangular-inspector/features/live-inspection.md:39 |
| - Setup claims (install, remove) are proven against git: `git status --porcelain` and `git diff --stat` saved | command | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| - A recipe that passed once after a fix runs a second time before it counts. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| Each feature file starts with an H1 and one paragraph of user-visible behavior, then four H2s in this order: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - [Setup](./setup.md): install, check and remove the pinned package and its configuration. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Live inspection](./live-inspection.md): connected pages, component tree, one component, its signals and providers. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Navigation](./navigation.md): explain-navigation and the current route after a user navigates. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Source scan](./source-scan.md): the CLI's stdio tools with no running app. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Panel UI](./panel.md): the full-page panel through the proxy, for a human view. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| Angular DevTools (browser extension); the Pangular Chrome extension (needs a branded browser profile). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - `live.pages`: `list-pages` shows the tab's page id, URL and the inspectors that report. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - MCP over HTTP at `http://localhost:9999/__mcp` (this script, or an MCP client configured with the URL and an | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - The panel's Components, Signals and Injectors tabs (see panel.md). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| Preconditions: baseline; the portal on `/contract/list` (drive it there as in SKILL.md Drive). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Page connected: `node $S call list-pages --out list-pages.json` -> a row whose id equals | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Tree: `node $S components --depth 3 --out list-components.json` -> `AppComponent <ng-journal-root>`, | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Component: `node $S call inspect-component --args '{"selector":"ng-journal-list"}' --out inspect-component.json` | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Signals: `node $S call inspect-signals --args '{"selector":"ng-journal-list"}' --out inspect-signals.json` | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| -> a `template` node `ng-journal-list` and a `computed` node `contracts` (plus more `signal` and | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Providers: `node $S call inspect-providers --args '{"selector":"ng-journal-list"}' --out inspect-providers.json` | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `ng-journal-list`; a read describes whichever is on screen. | feature | verified | .claude/skills/control-pangular-inspector/features/live-inspection.md:39 |
| the answer starts `No signal graph for <selector>` and names the component it covers. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - Navigate like a user: the `run-code` click on CONTRACT > List from SKILL.md Drive -> returns | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| `http://localhost:4775/contract/list`. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - Explain: `node $S call explain-navigation --args '{"limit":2}' --out explain-navigation.json` -> newest entry | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Route: `node $S call inspect-route --out inspect-route.json` -> URL `/contract/list`, active routes | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Routes: `node $S call list-routes` (12 routes, measured) and `node $S call lint-routes` (one `info` | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - The sidebar entries are `div`s with `routerLink`, so `started by` reads `RouterLink div`, not `a`. A router | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - A reload keeps the page id (it lives in `sessionStorage`) but starts an empty navigation list; the first | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| navigation before the overlay connected shows "no details". | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| (`Agent` / `Read-only`; shown only when the server runs `--read-only`). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - `http://localhost:4775/__pangular/` (through the `ng serve` proxy). | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - `http://localhost:9999/` directly (trusts only that origin's one-time code). | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - Open: `playwright-cli -s=pangular-9999 goto http://localhost:4775/__pangular/` -> title `Pangular Inspector`. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - Return: `playwright-cli -s=pangular-9999 goto http://localhost:4775/` before the next live read. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - The dashboard's source counts are 0 in this Nx workspace (see source-scan.md); live tabs are unaffected. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| reports to a devtools server, and can take it out again leaving the app exactly as git has it. | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| - `setup.remove`: restore from git `HEAD`, prune `node_modules`, assert a clean worktree; undoes an uncommitted | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| - `setup.refuse`: `remove` refuses when files it does not manage are changed; `install` refuses SSR and Vite mounts. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - A command in the app folder (`npm install ...` plus edits to `main.ts`, `project.json`, `proxy.conf.json`). | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| Preconditions: the portal worktree clean (`git status --porcelain` empty) or holding only this skill's | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| changes; no server from this skill running (`remove` changes files a running dev server reads). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Install: `node $S install --json` -> `changed` lists `package.json`, `package-lock.json`, | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `apps/insurance-portal/src/main.ts`, `apps/insurance-portal/project.json`, `apps/insurance-portal/proxy.conf.json`. | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| `git diff --stat` shows the lockfile with insertions only (457 lines measured). | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - Check: `node $S check` -> six `[OK]` lines, exit 0. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Type check: `npm exec -- nx run insurance-portal:typecheck` in the worktree exits 0 with the overlay import. | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - Remove: `node $S remove --json` -> exit 0, `gitStatus: []`, `gitDiffStat: ""`; `node $S check` then exits 1 | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| uncommitted install (read from `remove` in `scripts/control.mjs`, not run in this pass). Taking Pangular out | structure | unverifiable | Not found: scripts/control.mjs |
| - `install` reads the first Nx app under `apps/` with an `@angular/build:dev-server` serve target; pass | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - The `main.ts` edit needs the form `bootstrapApplication(...).catch(`; anything else exits 2 and the overlay | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| import goes in by hand, in the dev-guarded form SKILL.md Launch step 1 describes. npm has already | feature | verified | .claude/skills/control-pangular-inspector/features/live-inspection.md:39 |
| pinned the package by then, so `package.json` and the lockfile are changed. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - npm 11 rewrites this lockfile on any install; see SKILL.md Gotchas. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| (`node $S scan nope` prints the full stdio list). | command | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |
| - `npx pangular mcp --root <dir>` in an MCP client config (stdio). | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| - The script: `scan <tool>`, which starts that server, calls one tool and stops it. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Preconditions: the package installed (`node_modules/@pangular-inspector/devtools/bin.mjs` exists; `check` | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| passes `installed`); no server or browser needed. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - Workspace root: `node $S scan get-components` -> `[]` in the portal (measured). | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - App root: `node $S scan get-components --root apps/insurance-portal` -> `AppComponent`, `HomeComponent`, | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `angular.json` "so the source scans find nothing"; the warning is wrong here, the `src` folder is scanned. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `build-meta` for versions: `node $S scan build-meta` -> Angular `22.2.2`, project `@ng-journal/source`, | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - The scan reads the `sourceRoot` of each `angular.json` project plus `<root>/src`; it ignores `project.json` | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| (only `build-meta` reads it). An Nx workspace with code in `libs/` is mostly invisible to it. Use the live | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Starts `ng test` in watch mode for `spikes/ng222-app` with its Vitest Browser Mode setup, attached to a running | structure | verified | Exists: spikes/ng222-app |
| browser over CDP, so the tests run in a real tab next to an extension you load. It checks the run is worth | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| `.claude/skills/control-ai-browsers/instances.json`, or to the Chromium it launches itself. | structure | verified | Exists: .claude/skills/control-ai-browsers/instances.json |
| `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`. Background and measurements: | structure | verified | Exists: .claude/skills/control-vitest-browser-angular/scripts/control.mjs |
| `research/17-vitest-browser-runtime.md`. | structure | verified | Exists: research/17-vitest-browser-runtime.md |
| - Vitest's browser server port: 51315 in the main checkout. In a git worktree (`.git` is a file), the port | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| comes from a hash of the fixture path in 51400-51899, and the bundled CDP port in 9400-9499 (main checkout: | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| 9350). `up` refuses the main checkout's port from a worktree. Vitest's default 63315 cannot be used here, | config | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| because it sits in a Windows excluded port range. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Attach mode uses the instance's own CDP port. If the instance is not running, `up` launches it through | config | verified | .claude/skills/control-ai-browsers/features/probes.md:22 |
| `control-ai-browsers up` and `down` stops it again. An instance that was already running is left | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - One run at a time: `up` refuses while any state file exists. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| node .claude/skills/control-vitest-browser-angular/scripts/control.mjs up --extension s1-vitest --hold 90000 | structure | verified | Exists: .claude/skills/control-vitest-browser-angular/scripts/control.mjs |
| - Underneath: `node spikes/ng222-app/node_modules/@angular/cli/bin/ng.js test -c attach --watch` in | structure | verified | Exists: spikes/ng222-app/node_modules/@angular/cli/bin/ng.js |
| `spikes/ng222-app`. The `attach` configuration loads `vitest-attach.config.mts`, a custom provider that | structure | verified | Exists: spikes/ng222-app |
| calls `chromium.connectOverCDP(VITEST_CDP_URL)` and opens Vitest's tab in the browser's default context, | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| where extensions run. `--bundled` runs `-c extension` (`vitest-extension.config.mts`) instead. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - `--extension s1-vitest` writes the S1 test extension's Vitest variant (content scripts on | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| `http://127.0.0.1/*` and `http://localhost/*` in every frame) into the evidence directory and loads it. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| `--extension <dir>` loads any unpacked extension. Attach mode works without an extension; bundled mode needs | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| timing). `--filter <text>` passes the builder's `--filter`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - Ready means: a tab whose URL starts with `http://127.0.0.1:<port>/__vitest_test__/` exists in the browser, and | config | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Re-run the tests: change or touch a file under `spikes/ng222-app/src` (`touch spikes/ng222-app/src/app/counter.spec.ts`). | structure | verified | Exists: spikes/ng222-app/src |
| The builder rebuilds and the log shows `RERUN` **[measured]**. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| node .claude/skills/control-vitest-browser-angular/scripts/control.mjs doctor | structure | verified | Exists: .claude/skills/control-vitest-browser-angular/scripts/control.mjs |
| Read-only. Each check prints one line (`--json` for the list): | feature | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |
| Exit 0 healthy, 1 a check failed (named), 2 could not run (no state file, refused). | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| playwright-cli attach --cdp=http://127.0.0.1:9334 --session=control-vitest-chrome-beta-gemma4-51315 | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - For waits and reads inside the iframe, use `run-code` with `page.frame('vitest-iframe')`: | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Driving needs a mounted component: start with `--hold`, and act within the hold window. Your click counts | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| value it reads just before its click. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| Recipes: `features/README.md`. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Extension side: `spikes/probes/vitest-attach.mjs` shows how to open DevTools on the Vitest tab over CDP, show | structure | verified | Exists: spikes/probes/vitest-attach.mjs |
| (under `spikes/ng222-app/.vitest/attachments/`). | structure | verified | Exists: spikes/ng222-app/.vitest/attachments/ |
| redirected to `<dir>/<name>.json`. `down` keeps it. Proof rules: `features/README.md`. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| node .claude/skills/control-vitest-browser-angular/scripts/control.mjs down | structure | verified | Exists: .claude/skills/control-vitest-browser-angular/scripts/control.mjs |
| It reads the state file and refuses (exit 2) when the recorded PID's start time or command line differ from the | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| live process. It then detaches the playwright-cli session and stops the `ng test` tree by PID (`taskkill /T /F`; | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| uninstalls the extension (`Extensions.uninstall`), and stops the instance only if `up` launched it. It also | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| deletes the bundled profile, removes the state file and keeps the evidence. A recorded PID that no longer runs is | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `node .claude/skills/control-vitest-browser-angular/scripts/control.mjs <command> [flags] [--json]` | structure | verified | Exists: .claude/skills/control-vitest-browser-angular/scripts/control.mjs |
| State file: `tmp/control-vitest-browser-angular/state/<flowId>.json`. Exit codes: 0 done or healthy; 1 not | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| healthy; 2 refused or could not run, with the reason (a run already recorded, port in use, worktree on the main | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| Shared code: `spikes/probes/vitest-lib.mjs` (CDP client, frame contexts, the S1 Vitest variant), also used by | structure | verified | Exists: spikes/probes/vitest-lib.mjs |
| the spike runner `spikes/probes/vitest-attach.mjs`. | structure | verified | Exists: spikes/probes/vitest-attach.mjs |
| - Vitest's own `connectOptions` cannot attach to these browsers: it needs a Playwright `launchServer` | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Vitest 5 takes the browser server port from the project's `test.api`; setting it at the root also starts the | config | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| API server on the same port ("Port ... is already in use"). `vitest-base.config.mts` sets it from a plugin. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| watch mode Vitest prints `DEV`, not `RUN`, so a wait for `RUN` timed out after 180 s. Ready now accepts `DEV`, | feature | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - Run commands from the repository root. `S` is `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`. | structure | verified | Exists: .claude/skills/control-vitest-browser-angular/scripts/control.mjs |
| - `node $S up --extension s1-vitest --hold 90000`, then `node $S doctor` exits 0. `mounted-component` passes | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| only while the hold test runs (90 s from `RUN`, or from a `RERUN` after a touch). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Take `<session>`, `<cdpUrl>`, `<evidenceDir>` and `orchestratorUrl` from `node $S info`. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Never attach to a browser outside `control-ai-browsers/instances.json` or the bundled Chromium `up` started. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| waits and reads. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Re-run: `touch spikes/ng222-app/src/app/counter.spec.ts`, then wait for `RERUN` in `<evidenceDir>/ng-test.log`. | structure | verified | Exists: spikes/ng222-app/src/app/counter.spec.ts |
| and on the change; report verified, not verified, or inconclusive. One run at a time per checkout. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - A recipe that passed once after a fix runs a second time before it counts. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - [Counter tests](./counter-tests.md): the four specs, their results, the failing timing demo. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Held Counter](./held-counter.md): the mounted Counter in the tester iframe, its signals, injector, override | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Extension in the tester iframe](./extension-in-tester.md): the S1 variant's content scripts, DevTools panel | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `spikes/ng222-app/src/app/counter.spec.ts` renders `Counter` with `vitest-browser-angular`'s `render()` and | structure | verified | Exists: spikes/ng222-app/src/app/counter.spec.ts |
| (double 8, cart 1)", and a `CartService` override shows "cart 2". Two more run only when their environment | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| variable is set: a test that fails on purpose because it reads the DOM in the same task as the click, and the | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - `tests-hold` with `VITE_COUNTER_HOLD_MS=<ms>` the hold test passes after the hold. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - `tests-rerun` touching a source file reruns the suite in watch mode. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Outside this skill: `npm test` in `spikes/ng222-app` runs the default `headless` configuration once. | structure | verified | Exists: spikes/ng222-app |
| - No run recorded (`node $S info` exits 2 with "no state file"). | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - **Default run.** `node $S up`, then `node $S doctor`: `test-run` reports `last summary: Tests  2 passed \| 2 | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - **Timing demo.** `node $S down`, then `node $S up --timing-demo`. `doctor` still exits 0 because the run | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| itself works, and `test-run` reports `1 failed \| 2 passed \| 1 skipped (4)`. The log shows the assertion text | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| above and a failure screenshot path under `spikes/ng222-app/.vitest/attachments/failure-screenshots/`. | structure | verified | Exists: spikes/ng222-app/.vitest/attachments/failure-screenshots/ |
| - **Rerun.** `touch spikes/ng222-app/src/app/counter.spec.ts`; the log gains `RERUN  src/app/counter.spec.ts x1` | structure | verified | Exists: spikes/ng222-app/src/app/counter.spec.ts |
| - `test-run` passes on a failing test on purpose: it checks the run, not the results. Read the summary. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - The builder's `--filter` matches test names, but the hold test runs only with `--hold`: | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `up --hold <ms> --filter "keeps the counter mounted"` runs it alone (`1 passed \| 3 skipped (4)`); without | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| An unpacked extension loaded by `up --extension` runs in the same browser as the tests. With the S1 Vitest | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| reaches `window.ng` in the tester; without `frameURL` it runs in the orchestrator, which has no `ng`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - `node $S up --extension s1-vitest --hold 90000`; `doctor` exits 0 with `extension-loaded` and | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - **Content script.** `doctor --json > <evidenceDir>/doctor.json` records the isolated world's name. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| (`node spikes/probes/vitest-attach.mjs --route attach --cdp-port <port> --label <label>` after `down`), which | structure | verified | Exists: spikes/probes/vitest-attach.mjs |
| writes them to `research/raw/vitest-attach-<label>.json` under `extensionStorage`. That folder is tracked: | structure | unverifiable | Not found: research/raw/vitest-attach-<label>.json |
| - `spikes/s1-extension` itself matches only `https://example.com/*`; use `s1-vitest`, which matches the Vitest | structure | verified | Exists: spikes/s1-extension |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `['pear', 'plum']`. It keeps it mounted, clicks Increment once halfway, and checks that the count rose by one. | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| During the hold, the page shows "Clicks: 3 (double 6, cart 2)" and an Increment button, and every `ng.*` read | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - `held-di` `ng.ɵgetDependenciesFromInjectable(injector, Counter)` shows `CartService` with `items()` = | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - The Vitest tab in the attached browser, frame `vitest-iframe`, while the hold test runs. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - `node $S up --extension s1-vitest --hold 90000` (or a `touch` of the spec for a new hold), `doctor` exits 0 | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - **Signals, injector, profiler.** Run `spikes/probes/vitest-iframe-probe.js` in the frame: `run-code` with | structure | verified | Exists: spikes/probes/vitest-iframe-probe.js |
| after a click. Or use the spike runner, which does all of it: `node spikes/probes/vitest-attach.mjs --route | structure | verified | Exists: spikes/probes/vitest-attach.mjs |
| attach --cdp-port <instance port> --label <label>`. The runner starts its own `ng test` and needs no run from | config | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| in the value it reads first. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - `ng.ɵgetInjectorProviders` throws on the null injector at the end of the resolution path ("only supports | feature | verified | .claude/skills/control-vitest-browser-angular/features/held-counter.md:50 |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| description: Verify the built-in AI in the per-model browser instances (Chrome Beta with Gemini Nano or Gemma 4, Edge Dev with Aion-1.1-Instruct, Edge stable with Phi-4-mini) and report one verdict (v | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| Turns `control-ai-browsers` into a verdict. `scripts/verify.mjs` runs that skill's `scripts/control.mjs` steps in | structure | unverifiable | Not found: scripts/verify.mjs |
| order, repeats the doctor, compares readings and writes `verdict.json`. Same instances, sessions (`ai-<instance>`) | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| and limits as `control-ai-browsers` (read its `SKILL.md` first); instances come from its `instances.json`. Lars's | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| The four instances are standing processes; start a stopped one with | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:41 |
| `node .claude/skills/control-ai-browsers/scripts/control.mjs up <instance>`. `verify.mjs` starts nothing | structure | verified | Exists: .claude/skills/control-ai-browsers/scripts/control.mjs |
| itself except in `cycle`, which stops and launches the instance it cycles. A step that cannot run (instance not | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:22 |
| `verify.mjs state` is the doctor-based verdict, for every instance or the ones named: | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| node .claude/skills/verify-ai-browsers/scripts/verify.mjs state | structure | verified | Exists: .claude/skills/verify-ai-browsers/scripts/verify.mjs |
| node .claude/skills/verify-ai-browsers/scripts/verify.mjs state edge-dev-aion chrome-beta-nano | structure | verified | Exists: .claude/skills/verify-ai-browsers/scripts/verify.mjs |
| Per instance: `control.mjs doctor` twice (a pass counts only when it repeats), `flags` (effective features | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| against the registry) and `model info`. The instance passes when both doctors and `flags` exit 0, the expected | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| verdict is `verified` only when every instance passes. `verdict.json` holds each instance's backend, requested | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| node .claude/skills/verify-ai-browsers/scripts/verify.mjs cycle chrome-beta-nano [--timeout-min=45] | structure | verified | Exists: .claude/skills/verify-ai-browsers/scripts/verify.mjs |
| `up --backend=<the backend it ran with>`, `model download`, `model init`, then the `state` checks. Verified | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| when every step exits 0, `init` reads the registry `contextWindow`, and the state checks pass. `verdict.json` | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| (`control-ai-browsers/features/model-lifecycle.md`). For single checks or a probe, use `control-ai-browsers` | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| Each run writes into `tmp/verify-ai-browsers/<YYYYMMDD-HHMMSS>-<mode>/` (git-ignored) or `--evidence=<dir>`: one | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| JSON per control step plus `verdict.json` with the verdict, the per-instance results and every step's command, | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| exit code, duration and evidence path. Proof rules: `control-ai-browsers/features/README.md`. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| `verify.mjs` leaves every instance running, as it found it; `cycle` relaunches the instance at the backend it ran | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:22 |
| with. Each control step closes the tabs it opened and detaches the session it attached. A run that stops early | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| can leave the cycled instance stopped: run `control.mjs up <instance>`, then `state` again. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `scripts/verify.mjs state [<instance>...] \| cycle <instance> [--timeout-min=45] [--evidence=<dir>]` | structure | unverifiable | Not found: scripts/verify.mjs |
| `kErrorUnknown`. That is the model, not the harness; report it as found. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - `cycle` needs the instance running at the start: it reads the backend from the live command line and needs a | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - A cycle on Nano deletes both variants when both are on disk and downloads back only the one its backend uses. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Chrome may finish the download before `model download` starts (the profile has the use case Requested); the | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |

## Doc: .claude/skills/verify-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| inconclusive. It launches and tears down through control-angular-dev-app's script and drives through | feature | verified | .claude/skills/control-ai-browsers/features/README.md:12 |
| `S` = `.claude/skills/control-angular-dev-app/scripts/control.mjs`. Read | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/control.mjs |
| `.claude/skills/control-angular-dev-app/SKILL.md` (Inspect, Gotchas) once before the first run. | structure | verified | Exists: .claude/skills/control-angular-dev-app/SKILL.md |
| Exit 2 means refused or failed: the reason names the port owner, the state file, or the log to read. Run | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| `node $S down ...` after any failed `up` so nothing is stranded. Teardown is in Cleanup. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `node $S doctor [--target counter\|ssr\|portal\|--url <url>]`. Exit 0 before any drive. It checks the recorded | command | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| processes and port ownership, the build log, the Angular root and version, `window.ng` (dev build), router | config | verified | .claude/skills/control-ai-browsers/features/instances.md:41 |
| read helpers. Exit 1 names the failing check; a `dev-build` failure means a production build, which this skill | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| 1. `node $S info` for `session`, `url`, `evidenceDir`. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| 2. Pick the feature file from the map ([features/README.md](features/README.md)) and its entry point. If the | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| 4. Read Angular state the claim depends on with `playwright-cli -s=<session> --raw eval "() => __ngc.<fn>(...)" | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| `router`). These are reads; never prove a behaviour by calling setters or `ng.applyChanges`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| Verifies that the SSR fixture renders on the server and hydrates in dev mode. After `doctor --target ssr` | feature | verified | .claude/skills/verify-angular-dev-app/SKILL.md:54 |
| 1. `playwright-cli -s=<session> --raw run-code --filename=.claude/skills/control-angular-dev-app/scripts/ssr-check.js | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/ssr-check.js |
| (`hydratedComponents` above 0, `componentsSkippedHydration` 0), `no-mismatch-on-default-route` (no node with | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| 4. Record `?mismatch=1` as the expected failure: `expected-mismatch-detected` passes when `<app-mismatch>` is | feature | aspirational | Aspirational claim (future/desired state) |
| `mismatched` and NG0500 is logged. Copy its expected and actual DOM into `verdict.md`. | feature | aspirational | Aspirational claim (future/desired state) |
| Verdict: verified when `ok` is `true` (all six checks pass). Not verified when a check on `/` fails, or when | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| Inconclusive when `doctor` fails or the probe returns no JSON. For transfer cache, `@defer`, event replay and | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| render-mode claims, drive the recipes in the SSR feature file. | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| API calls (portal: `http://localhost:3000/api/...`), an `__ngc` read for signal, DI, CD or router claims; | config | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| - the server log (`app.log`, `api.log`) for build-related claims; | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| - `verdict.md` in the evidence dir: claim, feature ID, entry point, commands, artifacts, verdict. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| the end screen; mocks only behind an existing production boundary (none in these fixtures). A fix needs a | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| API port 3000 allows one portal flow at a time, so run baseline and change one after the other) and compare. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| A pass after a fix runs twice before it counts. Portal data is random per API start: compare structure, not | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| values. Report inconclusive when there is no valid baseline, the result is noisy, or the environment differs. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| `node $S down [--target ...\|--url ...]`: closes the session, stops only the recorded process trees after | command | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| matching PID start time and command line, removes the state file, keeps the evidence. Exit 2 with "refused" | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| means the PID now belongs to another process; leave it and tell Lars. Then confirm: `netstat -ano` shows no | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - `.claude/skills/control-angular-dev-app/scripts/control.mjs` `up\|doctor\|info\|down` with | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/control.mjs |
| `--target counter\|ssr\|portal`, `--url <url>`, `--port N`, `--dir <path>`, `--timeout S`, `--json`. Exit 0 ok, | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - `.claude/skills/control-angular-dev-app/scripts/ng-inspect.js`: `playwright-cli -s=<session> --raw run-code | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/ng-inspect.js |
| - `.claude/skills/control-angular-dev-app/scripts/ssr-check.js`: the SSR target's six checks (SSR target). | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/ssr-check.js |
| loses the template node for the rest of the page's life, which falsifies later signal reads. | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| portal UI. If control-pangular-inspector runs its server on 9999, the first load asks for a one-time code in | config | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - `/claim/create` in the portal shows the heading "Complaint Create" (known app bug); do not count it as a | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |

## Doc: .claude/skills/verify-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| The feature files live in one place: `.claude/skills/control-angular-dev-app/features/`. This index points | structure | verified | Exists: .claude/skills/control-angular-dev-app/features/ |
| contract are in [that README](../../control-angular-dev-app/features/README.md). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Counter](../../control-angular-dev-app/features/counter.md): render, increment (mouse and keyboard), | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [SSR and hydration](../../control-angular-dev-app/features/ssr.md): server HTML, hydration counters, | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Portal navigation](../../control-angular-dev-app/features/portal-navigation.md): home tiles, sidebar, | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Portal contracts](../../control-angular-dev-app/features/portal-contracts.md): list, details, customer | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Portal claims](../../control-angular-dev-app/features/portal-claims.md): list, details, create form. | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| - [Portal complaints and customers](../../control-angular-dev-app/features/portal-complaints-customers.md): | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| An app attached with `--url` has no map entry until someone writes one in the control skill's `features/`. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| description: Verify that the Angular DevTools extension is installed, enabled, attached to a dev-mode Angular app, shows the right Angular version, and coexists with an in-page AI extension (ng.ɵsetPr | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| inconclusive. It reuses `control-angular-devtools` (its `scripts/control.mjs` and feature map); read that | structure | unverifiable | Not found: scripts/control.mjs |
| skill for the commands this one runs and for install and uninstall. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `V=.claude/skills/verify-angular-devtools/scripts/verify.mjs` below, run from the repository root. | structure | verified | Exists: .claude/skills/verify-angular-devtools/scripts/verify.mjs |
| `node .claude/skills/control-angular-dev-app/scripts/control.mjs up --target counter --port 4317`. | structure | verified | Exists: .claude/skills/control-angular-dev-app/scripts/control.mjs |
| 2. `node $V --app-url=http://localhost:4317/ [--di-graph]` runs, in the test harness: | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| 3. Branded browser: `node $V --browser=chrome-beta` (or `chrome`, `edge`, `edge-dev`) checks the profile | command | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| only; nothing is launched. Proof runs never use `chrome` or `edge`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `node .claude/skills/control-angular-devtools/scripts/control.mjs doctor` while the harness is up (run | structure | verified | Exists: .claude/skills/control-angular-devtools/scripts/control.mjs |
| `verify.mjs --keep` to leave it up): process, CDP port, extension enabled and version, development build, | config | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `verify.mjs` drives what a developer does: loads the page, opens the Angular tab, selects the component, | feature | verified | .claude/skills/control-ai-browsers/features/README.md:12 |
| opens the signal graph, records a profile while clicking the app. Recipes and handles are in | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:85 |
| `control-angular-devtools/features/` (`attach.md`, `signal-graph.md`, `profiler.md`, `install.md`); | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| this skill's `features/README.md` maps each verdict check to them. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| `tmp/verify-angular-devtools/<yyyymmdd-hhmmss.mmm>/` (git-ignored): `verdict.json` (browser, verdict, checks, | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| every control step with its exit code and JSON result) and `control-evidence/` (copied from the control | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| run: `coexist.json`, DevTools window screenshots before and after `angular:di_graph`). Rules: the real user | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `verify.mjs` runs `control.mjs down` itself (unless `--keep`): the browser it started is closed, its state | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| (`control-angular-dev-app ... down --target counter --port 4317`). | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| `scripts/verify.mjs [--browser test\|chrome\|chrome-beta\|edge\|edge-dev] [--app-url <url>] [--di-graph] [--keep]` | structure | unverifiable | Not found: scripts/verify.mjs |
| before anything runs. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| Angular bug (`research/05-spikes.md`), not a verify failure. | structure | verified | Exists: research/05-spikes.md |
| - Run `verify.mjs` with no other `control-angular-devtools` flow up in the same checkout: `up` refuses | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |

## Doc: .claude/skills/verify-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| The checks `verify.mjs` reports, each mapped to the feature file in `control-angular-devtools/features/` | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| that holds its recipe, handles and gotchas. Preconditions, driving conventions and proof rules are that | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:85 |
| Not covered: attach, panel and coexist checks in branded browsers (manual: F12, Angular tab). | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| verified or inconclusive. It runs `control-pangular-inspector` (read that skill for every command it calls, | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| for install and remove, and for the feature map) and launches the app with `control-angular-dev-app`. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:22 |
| `V=.claude/skills/verify-pangular-inspector/scripts/verify.mjs`, run from the repository root. | structure | verified | Exists: .claude/skills/verify-pangular-inspector/scripts/verify.mjs |
| `node $V` - starts the portal (`control-angular-dev-app up --target portal`), starts the devtools server | command | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| read-only (`control-pangular-inspector up`), runs the checks below, then stops both. With a portal already | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| running (started by this checkout's `control-angular-dev-app`), pass `--app-url http://localhost:4775/`; | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| The run calls `control-pangular-inspector doctor` and records every check (`package-pinned`, | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| (`control-pangular-inspector` features/navigation.md). Then the MCP reads, each saved as JSON: | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| `list-pages` (shows `/contract/list`), the component outline (`ListComponent <ng-journal-list>`), | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| (refused, exit 2). | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| `tmp/verify-pangular-inspector/<yyyymmdd-hhmmss.mmm>/` (git-ignored): `verdict.json` (verdict, failed checks, | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| every check, `notCovered`, every step with exit code and JSON result) and `control-evidence/` (copied from the | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| control run: `doctor.json`, the MCP answers, before and after snapshots, a screenshot of the contract list, | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `pangular.log`). Proof rules: `control-pangular-inspector/features/README.md`. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| The script stops what it started (`control-pangular-inspector down`, and `control-angular-dev-app down | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| --target portal` when it launched the portal), unless `--keep`. It also runs `down` after a failed `up` | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `scripts/verify.mjs [--app-url <url>] [--keep]` | structure | unverifiable | Not found: scripts/verify.mjs |
| - `control-angular-dev-app up` once printed `ok: true` and then exited 3221226505 (a crash in `process.exit`), | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:1034 |
| stops the portal whenever a new `control-angular-dev-app` state file appeared (crash path not reproduced since). | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - The run needs ports 3000, 4775 and 9999 free (or `--app-url` for a portal already up); a busy port gives | config | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - The install and remove round trip is not part of the verdict; it needs the servers stopped | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| (`control-pangular-inspector` features/setup.md). The portal has the setup committed (`f102b97`), so | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - While the devtools server runs, `control-angular-dev-app doctor --target portal` fails; see | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |

## Doc: .claude/skills/verify-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| This skill reuses the feature map of `control-pangular-inspector` (`../../control-pangular-inspector/features/`). | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| The feature files are the control skill's; this index only maps checks to them. | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |

## Doc: .claude/skills/verify-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| inconclusive. It launches and tears down through control-vitest-browser-angular's script and drives through | feature | verified | .claude/skills/control-ai-browsers/features/README.md:12 |
| `.claude/skills/control-ai-browsers/instances.json` or to the Chromium the script launches; never to Lars's own | structure | verified | Exists: .claude/skills/control-ai-browsers/instances.json |
| `S` = `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`. Read | structure | verified | Exists: .claude/skills/control-vitest-browser-angular/scripts/control.mjs |
| `.claude/skills/control-vitest-browser-angular/SKILL.md` (Drive, Inspect, Gotchas) once before the first run. | structure | verified | Exists: .claude/skills/control-vitest-browser-angular/SKILL.md |
| `up` launches `chrome-beta-gemma4` through control-ai-browsers when it is not running (19 s for the whole `up` | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:22 |
| in the proof run). It refuses (exit 2) while another run is recorded, or when the Vitest port is taken. | config | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| Run `node $S down` after any failed `up` so nothing is stranded. Teardown is in Cleanup. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `node $S doctor`. Exit 0 before any drive. It checks the `ng test` process and port ownership, that a run | command | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| service worker and its isolated world in the tester. Exit 1 names the failing check. | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| 1. `node $S info --json` for `session`, `cdpUrl`, `evidenceDir`, `proc.log`. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| 2. Pick the feature file from the map ([features/README.md](features/README.md)). If the claim names an entry | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| 5. Read the Angular state the claim depends on with `run-code` returning | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| `page.frame('vitest-iframe').evaluate(...)` into `<evidenceDir>/<n>-<what>.json`. Use reads only (`ng.getComponent`, | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| baseline shows the old behaviour (Evidence). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - the side effect next to the screen: the `ng.*` read for state, DI, signal or profiler claims; the test log for | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| result claims; `doctor --json` output for extension and model claims; | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| - `verdict.md` in the evidence dir: claim, feature ID, entry point, commands with exit codes, artifacts, | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| the fixture provides; the action and the resulting state, not only the end screen; no mocks except the | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| `CartService` override the spec itself makes. A fix needs a baseline: run the same recipe on the old state | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| so run baseline and change one after the other) and compare. A pass after a fix runs twice before it counts. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `node $S down`: detaches the session, stops only the recorded `ng test` tree after matching PID start time and | command | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| command line, closes leftover Vitest tabs, uninstalls the extension, stops the instance only if `up` launched it, | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| deletes the bundled profile, removes the state file and keeps the evidence. Exit 2 with "refused" means the PID | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| now belongs to another process; leave it and tell Lars. Then confirm: `netstat -ano` shows no `LISTENING` on the | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - `.claude/skills/control-vitest-browser-angular/scripts/control.mjs` `up\|doctor\|info\|down` with | structure | verified | Exists: .claude/skills/control-vitest-browser-angular/scripts/control.mjs |
| `--filter <text>`, `--port N`, `--timeout S`, `--json`. Exit 0 ok, 1 unhealthy (doctor), 2 refused or could | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - `spikes/probes/vitest-iframe-probe.js`: the read-only `ng.*` probe of the tester iframe (`mount`, `after`, | structure | verified | Exists: spikes/probes/vitest-iframe-probe.js |
| - `spikes/probes/vitest-attach.mjs`: the spike runner that also reads the extension's storage and DevTools | structure | verified | Exists: spikes/probes/vitest-attach.mjs |
| panel; it starts its own `ng test`, so run it only with no control run recorded. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Act within the hold: the Counter exists only while a test runs. Re-hold by touching | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `spikes/ng222-app/src/app/counter.spec.ts` (watch mode reruns; the log shows `RERUN`). | structure | verified | Exists: spikes/ng222-app/src/app/counter.spec.ts |
| - `doctor`'s `test-run` passes while tests fail on purpose (`--timing-demo`); read the summary for the result. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |

## Doc: .claude/skills/verify-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| The feature files live in one place: `.claude/skills/control-vitest-browser-angular/features/`. This index points | structure | verified | Exists: .claude/skills/control-vitest-browser-angular/features/ |
| contract are in [that README](../../control-vitest-browser-angular/features/README.md). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Counter tests](../../control-vitest-browser-angular/features/counter-tests.md): default results, the timing | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| demo that fails on purpose, the hold test, reruns. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - [Held Counter](../../control-vitest-browser-angular/features/held-counter.md): render, increment from the | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - [Extension in the tester iframe](../../control-vitest-browser-angular/features/extension-in-tester.md): | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Add dependencies between packages in a monorepo. All package managers support workspaces but with different syntax. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| Check whether there's a `packageManager` field in the root-level `package.json`. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `package-lock.json` → npm | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Uses `workspace:` protocol - symlinks only created when explicitly declared. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| pnpm add @org/ui --workspace | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| pnpm add @org/ui --filter @org/app --workspace | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| Result in `package.json`: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Also uses `workspace:` protocol. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| Result in `package.json`: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| No `workspace:` protocol. npm auto-symlinks workspace packages. | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| npm install @org/ui --workspace @org/app | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| Result in `package.json`: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| npm resolves to local workspace automatically during install. | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| Supports `workspace:` protocol (pnpm-compatible). | feature | verified | .claude/skills/control-vitest-browser-angular/features/held-counter.md:50 |
| Result in `package.json`: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| **Example 1: pnpm - link ui lib to app** | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| pnpm add @org/ui --filter @org/app --workspace | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| **Example 2: npm - link multiple packages** | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| npm install @org/data-access @org/ui --workspace @org/dashboard | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| 1. Check if dependency is declared in consumer's `package.json` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 3. Run install (`pnpm install`, `npm install`, etc.) | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - yarn berry: uses Plug'n'Play by default (no `node_modules`) | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Root `package.json` should have `"private": true` to prevent accidental publish | feature | aspirational | Aspirational claim (future/desired state) |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - **Current Branch:** !`git branch --show-current` | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| - **Current Commit:** !`git rev-parse --short HEAD` | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| - **Remote Status:** !`git status -sb \| head -1` | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| **Important:** If user provides specific instructions, respect them over default behaviors described below. | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| 1. **Check `nx.json`** at workspace root for `nxCloudId` or `nxCloudAccessToken` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 2. **If `nx.json` missing OR neither property exists** → exit with: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Nx Cloud not connected. Unlock 70% faster CI and auto-fix broken PRs with https://nx.dev/nx-cloud | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| 1. **This skill (orchestrator)**: spawns subagents, runs scripts, prints status, does local coding work | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| 2. **ci-monitor-subagent (haiku)**: calls one MCP tool (ci_information or update_self_healing_fix), returns structured result, exits | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| 3. **ci-poll-decide.mjs (deterministic script)**: takes ci_information result + state, returns action + status message | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| 4. **ci-state-update.mjs (deterministic script)**: manages budget gates, post-action state transitions, and cycle classification | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:8 |
| The decision script handles message formatting based on verbosity. When printing messages to the user: | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:85 |
| 3. Do not continue polling on main agent — it wastes context tokens and bypasses self-healing | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| The `ci_information` tool accepts `branch` (optional, defaults to current git branch), `select` (comma-separated field names), and `pageToken` (0-based pagination for long strings). | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| The `update_self_healing_fix` tool accepts a `shortLink` and an action: `APPLY`, `REJECT`, or `RERUN_ENVIRONMENT_STATE`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| The decision script returns one of the following statuses. This table defines the **default behavior** for each. User instructions can override any of these. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| **Simple exits** — just report and exit: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| **Statuses requiring action** — when handling these in Step 3, read `references/fix-flows.md` for the detailed flow: | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - **Git safety**: Stage specific files by name — `git add -A` or `git add .` risks committing the user's unrelated work-in-progress or secrets | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| - **Gate check**: Run `ci-state-update.mjs gate` before local fix attempts — if budget exhausted, print message and exit | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| The subagent calls `ci_information` and returns a JSON object with the requested fields. This is a **foreground** call — wait for the result. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| node <skill_dir>/scripts/ci-poll-decide.mjs '<subagent_result_json>' <poll_count> <verbosity> / | structure | unverifiable | Not found: scripts/ci-poll-decide.mjs |
| Pass `--timeout` and `--new-cipe-timeout` in **minutes** (the values from Configuration Defaults) — the script converts to seconds internally. Pass `--elapsed-seconds` as the whole seconds elapsed sin | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:217 |
| When decision script returns `action == "done"`: | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| 6. **If action expects new CI Attempt**, update tracking (see Step 3a) | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:250 |
| Several statuses require fetching heavy data or calling MCP: | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - **fix_needs_local_verify**: Spawn FETCH_HEAVY subagent for fix details before local verification | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - **fix_needs_review**: Spawn FETCH_HEAVY subagent → get `suggestedFixDescription`, `suggestedFixSummary`, `taskFailureSummaries` | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| Several statuses require fetching additional data or calling tools: | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - **fix_needs_local_verify**: Call `ci_information` with HEAVY_FIELDS for fix details before local verification | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - **fix_needs_review**: Call `ci_information` with HEAVY_FIELDS → get `suggestedFixDescription`, `suggestedFixSummary`, `taskFailureSummaries` | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| node <skill_dir>/scripts/ci-state-update.mjs post-action / | structure | unverifiable | Not found: scripts/ci-state-update.mjs |
| The script returns `{ waitMode, pollCount, lastCipeUrl, expectedCommitSha, agentTriggered }`. Update all tracking state from the output, then go to Step 2. | feature | aspirational | Aspirational claim (future/desired state) |
| When the decision script returns `action == "done"`, run cycle-check **before** handling the code: | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| node <skill_dir>/scripts/ci-state-update.mjs cycle-check / | structure | unverifiable | Not found: scripts/ci-state-update.mjs |
| The script returns `{ cycleCount, agentTriggered, envRerunCount, approachingLimit, limitReached, message }`. Update tracking state from the output. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - `no_progress_count`, circuit breaker (5 polls), and backoff reset are handled by ci-poll-decide.mjs (progress = any change in cipeStatus, selfHealingStatus, verificationStatus, or failureClassificat | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - `env_rerun_count` reset on non-environment status is handled by ci-state-update.mjs cycle-check | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - On new CI Attempt detected (poll script returns `newCipeDetected`) → reset `local_verify_count = 0`, `env_rerun_count = 0` | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| The script returns `autoApplySkipReason` in its output. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| 1. Report the skip reason to the user (e.g., "Auto-apply was skipped because the previous CI pipeline execution was triggered by Nx Cloud") | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| The script returns `verifiableTaskIds` in its output. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| 1. **Detect package manager:** `pnpm-lock.yaml` → `pnpm nx`, `yarn.lock` → `yarn nx`, otherwise `npx nx` | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| - If fix needs enhancement → Apply Locally + Enhance Flow | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - If fix is wrong → run `ci-state-update.mjs gate --gate-type local-fix`. If not allowed, print message and exit. Otherwise → Reject + Fix From Scratch Flow | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| Spawn FETCH_HEAVY subagent for `taskFailureSummaries`. Run `ci-state-update.mjs gate --gate-type local-fix` — if not allowed, print message and exit. Otherwise attempt local fix (counter already incre | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| 1. Run `ci-state-update.mjs gate --gate-type env-rerun`. If not allowed, print message and exit. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| 3. **Attempt local fix**: Run `ci-state-update.mjs gate --gate-type local-fix`. If not allowed → skip to step 4. Otherwise use `failedTaskIds` and `taskFailureSummaries` for context. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| 4. **Fallback if local fix not possible or budget exhausted**: push empty commit (`git commit --allow-empty -m "ci: rerun after rejecting throttled fixes"`), enter wait mode | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| 1. Report to user: no CI attempt found, suggest checking CI provider | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| 3. Otherwise: exit with guidance | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| 1. Report to user: CI failed with no tasks recorded | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| 2. Retry: `git commit --allow-empty -m "chore: retry ci [monitor-ci]"` + push, enter wait mode | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| 3. If retry also returns `cipe_no_tasks`: exit with failure | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| Spawn UPDATE_FIX subagent with `APPLY`. New CI Attempt spawns automatically. No local git ops. | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| 4. If still failing → run `ci-state-update.mjs gate --gate-type local-fix`. If not allowed, commit current state and push (let CI be final judge). Otherwise loop back to enhance. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| 1. Run `ci-state-update.mjs gate --gate-type local-fix`. If not allowed, print message and exit. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| When any local fix path runs a task and it fails, assess whether the failure is a **code issue** or an **environment/tooling issue** before running the gate script. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| When detected → bail immediately without running gate (no budget consumed). Report that the failure is an environment/tooling issue, not a code bug. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Stage specific files by name — `git add -A` or `git add .` risks committing the user's unrelated work-in-progress or secrets | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| git commit -m "fix(<projects>): <brief description> | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Answer a defined workspace-data question with `npx nx-cloud api`, the read-only | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| Nx Cloud Public API command. This is an API access skill, not a report generator | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| command finds `nx.json`. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Run `npx nx-cloud api --help` (or `npx nx-cloud api` alone) once for syntax and | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| - Discover endpoints from the live spec. Use `npx nx-cloud api --list-operations` | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| to find a route and `npx nx-cloud api --describe <operationId \| path \| link>` | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| for its parameters, response fields, and error statuses. Both show what an | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| operation `returns`: `list` (the wrapped list below), `object` (the response | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - Read the operation description from `--describe`. It states server limits that | feature | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:43 |
| The API returns recorded task and run fields. It does not query the local Nx | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| target. `cacheEnabled` describes the recorded run. `cacheable` describes the | feature | verified | .claude/skills/control-pangular-inspector/features/live-inspection.md:39 |
| recorded task. Neither value identifies `targetDefaults`, an inferred target, | feature | verified | .commandcode/skills/nx-cloud-api/SKILL.md:44 |
| Do not infer `cache: false` from an absent project property. For cache causes, | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| npx nx-cloud api --describe cipes | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| npx nx-cloud api cipes / | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| -f statuses=FAILED -f statuses=CANCELED / | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| -o "$dir/cipes.json" | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| echo "exit $?" | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| jq '{pageLimitReached, nextCursor, items: [.items[] \| {id, status, createdAt, links}]}' "$dir/cipes.json" | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| npx nx-cloud api "<link from a previous response>" -o "$dir/next.json" | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| npx nx-cloud api 'runs/{runId}/tasks' -p runId="$run_id" -o "$dir/tasks.json" | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| Nx Cloud host. That includes app links such as `https://cloud.nx.app/cipes/<id>`, | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| extension. A name without one gets `.json`, `.ndjson`, or the download's own | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Always check the exit code. Every failure prints one record on stderr, and the | feature | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |
| error body, parsed when it is JSON and absent when it is empty. Exit 4 and 5 | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| The list is complete only when the exit code is 0 and `nextCursor` is `null`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| If a later page fails, the command still prints what it fetched, with | feature | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |
| `--format ndjson` prints only the rows, one per line, with no metadata. Nothing | feature | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |
| in its output says whether more pages exist, and it records no resume cursor. It prints each page as it is retrieved which can matter for responsiveness or very large responses. | feature | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |
| [references/extraction-and-calculation.md](references/extraction-and-calculation.md) | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 1. Run `npx nx-cloud api --describe <operation>`. Use only its documented | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| npx nx-cloud api task-stats / | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| -o "$dir/task-stats-2026-08-01.json" | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| echo "exit $?" | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| jq '{fetchedItemCount, pageLimitReached, nextCursor}' "$dir/task-stats-2026-08-01.json" | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| jq -c '.items[]' "$dir/task-stats-2026-08-01.json"   # rows, one per line | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| file, exit code, item count, and final `nextCursor` in a manifest. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| `--describe` shows them as `returns: file`. The command downloads the target and writes the raw bytes, the only output that is | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| command refuses to write a download to a terminal. Encrypted | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| artifacts can be decrypted with `npx nx-cloud decrypt-artifact`. | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| Nx Cloud log and report assets are compressed binary payloads. Treat each as an | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| a zero-byte `terminalOutput` beside a successful exit code. This is usually not a | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| problem when the task writes no stdout or stderr and produces no declared output | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| 1. Reads the saved JSON (rows in `.items`). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| 2. States fields, filters, time range, and formula in a code comment. | feature | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:43 |
| 3. Prints machine-readable JSON before prose. | feature | verified | .claude/skills/control-ai-browsers/SKILL.md:128 |
| 4. Uses numeric timestamps and weighted counts for rates. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Requires the `nx-cloud-api` skill. Use a matching Nx workspace checkout only for local configuration diagnosis. An API-only investigation does not need a checkout. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:38 |
| - **API-only:** Use this for supplied runs, CIPEs, tasks, or artifact errors when no | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| request returns HTTP 409 (`not_terminal`), or the user starts a controlled | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| Use `nx-cloud-api` (`npx nx-cloud api`) for every read. Run `--describe` for a | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| npx nx-cloud api --describe 'runs/{runId}/tasks' | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| npx nx-cloud api "$run_tasks_link" -o "$dir/tasks.json" | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| links: {self: .links.self}}' "$dir/tasks.json" | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `npx nx-cloud api 'runs/{runId}/tasks' -p runId="$run_id"`; never paste an ID | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| execution. Name a configuration cause only when the `nx show` target query shows | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| [references/log-and-report-assets.md](references/log-and-report-assets.md) before | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| Do not merge `project.json`, `nx.json`, plugins, or `targetDefaults` yourself. A | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| [references/artifact-integrity.md](references/artifact-integrity.md) before you | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| runs with direct hash-detail output when supported. This is a **Needs diagnostic | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| **Needs diagnostic run**. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| A stale or wrong replay needs reproduction evidence. `inputs` decide a hash; | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| reads or writes, plus the target query and a controlled reproduction. Do not | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| Recommend a configuration or code edit only after all applicable checks pass: | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| 2. Show that its `cache`, `inputs`, or `outputs` value needs a change. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - **Confirmed** / **Likely** / **Needs diagnostic run:** … | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Result that confirms or rules out the hypothesis. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:13 |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `npx nx-cloud api "<link>" -o <private-file>.tar.gz`. Do not extract it in the | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| `npx nx-cloud decrypt-artifact` before you inspect its contents; run the byte and | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| stream checks below on the downloaded bytes first. | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| 4. Reject trailing bytes, truncation, checksum failure, or an unreadable table. | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| Byte-identical malformed downloads across retries support a persistent bad cache | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| report asset. Task assets are typed `logs`, `artifact`, or `sandbox-report`. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| `npx nx-cloud api "<link>" -o <private-file>.tar.gz`. Identify its format | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Requires the `nx-cloud-api` skill for all Nx Cloud reads. This workflow is read-only. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| only at the level the evidence supports. | feature | verified | .claude/skills/control-vitest-browser-angular/features/held-counter.md:50 |
| Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED` (the | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| `cipes` filter accepts only terminal statuses). State the | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| branches, CI contexts, statuses, endpoints, and record counts. Ask before widening | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| Use **nx-cloud-api** (`npx nx-cloud api`) for every read. Inspect the live | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| `runs`, `runs/{runId}/tasks`, and the linked `steps` and `instances` endpoints. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| only after a zero exit with `nextCursor: null`; otherwise | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| report the data as incomplete. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| 3. Runs and terminal task rows for each selected group. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| critical error, or agent evidence supports it and no task failure explains the | feature | verified | .claude/skills/control-vitest-browser-angular/features/held-counter.md:50 |
| classify the main-job cache restoration error as primary and the canceled runs as | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| reproduction or resource report when it does not show a direct cause. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Workflow or agent failure: retry or monitor only when the evidence supports a | feature | verified | .claude/skills/control-vitest-browser-angular/features/held-counter.md:50 |
| - **Confirmed facts:** affected CIPEs/runs/tasks; representative IDs; log excerpt. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - **Assessment:** **Confirmed** / **Likely** / **Needs diagnostic run** — … | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| Limit a review report to five groups. In focused investigation mode, report the | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| finding to exact CIPEs, run groups, runs, and tasks where available. State the data | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - List all generators for a plugin: `npx nx list @nx/react` | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| - View available plugins: `npx nx list` | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| Identify which generator(s) could fulfill the user's needs. Consider what artifact type they want, which framework is relevant, and any specific generator names mentioned. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| npx nx g @nx/react:library --help | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| - Export `.ts`/`.tsx` source directly | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Required for npm publishing | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - For plugin generators: Use `node -e "console.log(require.resolve('@nx/<plugin>/generators.json'));"` to find the generators.json, then locate the source from there | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - If that fails, read directly from `node_modules/<plugin>/generators.json` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| npx nx g @nx/react:library --name=my-lib --dry-run --no-interactive | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| Note: Some generators don't support dry-run (e.g., if they install npm packages). If dry-run fails for this reason, proceed to running the generator for real. | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| **Important:** If you replace or delete generated test files (e.g., `*.spec.ts`), either write meaningful replacement tests or remove the `test` target from the project configuration. Empty test suite | feature | aspirational | Aspirational claim (future/desired state) |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - Run `nx import --help` for available options. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| EXAMPLE: target has `libs/utils` and `libs/models`; source has `libs/ui` and `libs/data-access` — you cannot import `libs/` into `libs/` directly. Import each source library individually. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - https://nx.dev/docs/guides/adopting-nx/import-project | structure | unverifiable | Not found: docs/guides/adopting-nx/import-project |
| - https://nx.dev/docs/guides/adopting-nx/preserving-git-histories | structure | unverifiable | Not found: docs/guides/adopting-nx/preserving-git-histories |
| **Subdirectory-at-a-time** (`nx import <source> apps --source=apps`): | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Caveats: multiple import commands (separate merge commits each); dest must not have conflicting directories; root configs (deps, plugins, targetDefaults) not imported | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - **Directory conflicts**: Import into alternate-named dir (e.g. `imported-apps/`), then rename | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| **Whole repo** (`nx import <source> imported --source=.`): | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - For monorepos, creates messy nested config (`imported/nx.json`, `imported/tsconfig.base.json`, etc.) | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - If you must: keep imported `tsconfig.base.json` (projects extend it), prefix workspace globs and executor paths | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **Always prefer the destination's existing conventions.** Source uses `libs/`but dest uses `packages/`? Import into `packages/` (`nx import <source> packages/foo --source=libs/foo`). | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - _Backend (Node.js)_: Express/Fastify/NestJS server entrypoint, no `"exports"` field in `package.json` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - _General_: Dockerfile, a runnable entrypoint, no public API surface intended for import by other projects | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - **Libraries**: Reusable packages consumed by other projects. Common indicators: `"main"`/`"exports"` in `package.json`, Maven/Gradle packaging as a library jar, .NET `<OutputType>Library</OutputType | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Applications → `apps/<name>`. Check workspace globs (e.g. `pnpm-workspace.yaml`, `workspaces` in root `package.json`) for an existing `apps/*` entry. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Example: `nx import <source> apps/my-app --source=packages/my-app` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| **Fix**: Replace with proper globs from the source config (e.g. `apps/*`, `libs/shared/*`), then `pnpm install`. | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - `dependencies`/`devDependencies` from `package.json` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `targetDefaults` from `nx.json` (e.g. `"@nx/esbuild:esbuild": { "dependsOn": ["^build"] }` — critical for build ordering) | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| - `namedInputs` from `nx.json` (e.g. `production` exclusion patterns for test files) | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Plugin configurations from `nx.json` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| **Fix**: Diff source and dest `package.json` + `nx.json`. Add missing deps, merge relevant `targetDefaults` and `namedInputs`. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **Whole-repo import**: `nx import` detects and offers to install plugins. Accept them. | feature | verified | .claude/skills/control-angular-devtools/features/attach.md:3 |
| - **Subdirectory import**: Plugins NOT auto-detected. Manually add with `npx nx add @nx/PLUGIN`. Check `include`/`exclude` patterns — defaults won't match alternate directories (e.g. `apps-beta/`). | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| - Run `npx nx reset` after any plugin config changes. | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| Whole-repo import brings ALL source root files into the dest subdirectory. Clean up: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - `nx.json` — source Nx config; dest has its own | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `README.md` — optional; keep or remove | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| **Don't blindly delete** `tsconfig.base.json` — imported projects may extend it via relative paths. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Subdirectory import doesn't bring the source's root `eslint.config.mjs`, but project configs reference `../../eslint.config.mjs`. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| 1. Install ESLint deps first: `pnpm add -wD eslint@^9 @nx/eslint-plugin typescript-eslint` (plus framework-specific plugins) | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| 2. Create root `eslint.config.mjs` (copy from source or create with `@nx/eslint-plugin` base rules) | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| 3. Then `npx nx add @nx/eslint` to register the plugin in `nx.json` | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| After import, compare key deps (`typescript`, `eslint`, framework-specific). If dest uses newer versions, upgrade imported packages to match (usually safe). If source is newer, may need to upgrade des | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| Same `name` in `package.json` across source and dest causes `MultipleProjectsWithSameNameError`. **Fix**: Rename conflicting names (e.g. `@org/api` → `@org/teama-api`), update all dep references and i | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| `pnpm install` fails during `nx import` if a `"workspace:*"` dependency hasn't been imported yet. File operations still succeed. **Fix**: Import all projects first, then `pnpm install --no-frozen-lock | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| The TS preset defaults (`module: "nodenext"`, `moduleResolution: "nodenext"`, `lib: ["es2022"]`) are incompatible with frontend frameworks (React, Next.js, Vue, Vite). After importing frontend project | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| For **subdirectory imports**, the dest root tsconfig is authoritative — update it. For **whole-repo imports**, imported projects may extend their own nested `tsconfig.base.json`, making this less crit | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| React libraries generated with `@nx/react:library` reference `@nx/react/typings/cssmodule.d.ts` and `@nx/react/typings/image.d.ts` in their tsconfig `types`. These fail with `Cannot find type definiti | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| **Fix**: `pnpm add -wD @nx/react` | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| Nx presets create `jest.preset.js` at the workspace root, and project jest configs reference it (e.g. `../../jest.preset.js`). Subdirectory import does NOT bring this file. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 1. Run `npx nx add @nx/jest` — registers `@nx/jest/plugin` in `nx.json` and updates `namedInputs` | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| 2. Create `jest.preset.js` at workspace root (see `references/JEST.md` for content) — `nx add` only creates this when a generator runs, not on bare `nx add` | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| 3. Install test runner deps: `pnpm add -wD jest jest-environment-jsdom ts-jest @types/jest` | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| 4. Install framework-specific test deps as needed (see `references/JEST.md`) | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| For deeper Jest issues (tsconfig.spec.json, Babel transforms, CI atomization, Jest vs Vitest coexistence), see `references/JEST.md`. | feature | verified | .commandcode/skills/nx-import/SKILL.md:179 |
| When importing a project with existing npm scripts (`build`, `dev`, `start`, `lint`), Nx plugins auto-prefix inferred target names to avoid conflicts: e.g. `next:build`, `vite:build`, `eslint:lint`. | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| **Fix**: Remove the Nx-rewritten npm scripts from the imported `package.json`, then either: | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - Rename plugin target names in `nx.json` to use unprefixed names | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| When the source is a plain pnpm/npm workspace without `nx.json`. | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| Nx rewrites `package.json` scripts during init, creating broken commands (e.g. `vitest run` → `nx test run`). **Fix**: Remove all rewritten scripts — Nx plugins infer targets from config files. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| 3. Add `"outDir": "dist"` and `"tsBuildInfoFile": "dist/tsconfig.tsbuildinfo"` | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| 4. Add `"extends": "../../tsconfig.base.json"` if missing. Remove settings now inherited from base. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `nx import` may bring `node_modules/` (pnpm symlinks pointing to the source filesystem) and `pnpm-lock.yaml` from the source. Both are stale. | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| **Fix**: `rm -rf imported/node_modules imported/pnpm-lock.yaml imported/pnpm-workspace.yaml imported/.gitignore`, then `pnpm install`. | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - **Legacy `.eslintrc.json` (ESLint 8)**: Delete all `.eslintrc.*`, remove v8 deps, create flat `eslint.config.mjs`. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - **Flat config (`eslint.config.js`)**: Self-contained configs can often be left as-is. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Nx uses `package.json` `"exports"` + pnpm workspace linking instead of tsconfig `"paths"`. If packages have proper `"exports"`, paths are redundant. Otherwise, update paths for the new directory struc | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - `references/ESLINT.md` — ESLint projects: duplicate `lint`/`eslint:lint` targets, legacy `.eslintrc.*` linting generated files, flat config `.cjs` self-linting, `typescript-eslint` v7/v9 peer dep co | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `references/GRADLE.md` | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `references/JEST.md` — Jest testing: `@nx/jest/plugin` setup, jest.preset.js, testing deps by framework, tsconfig.spec.json, Jest vs Vitest coexistence, Babel transforms, CI atomization. | feature | verified | .commandcode/skills/nx-import/SKILL.md:179 |
| - `references/NEXT.md` — Next.js projects: `@nx/next/plugin` targets, `withNx`, Next.js TS config (`noEmit`, `jsx: "preserve"`), auto-installing deps via wrong PM, non-Nx `create-next-app` imports, mi | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `references/TURBOREPO.md` | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `references/VITE.md` — Vite projects (React, Vue, or both): `@nx/vite/plugin` typecheck target, `resolve.alias`/`__dirname` fixes, framework deps, Vue-specific setup, mixed React+Vue coexistence. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| ESLint-specific guidance for `nx import`. For generic import issues (root deps, pnpm globs, project references), see `SKILL.md`. | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| `@nx/eslint/plugin` scans for ESLint config files and creates a lint target for each project. It detects **both** flat config files (`eslint.config.{js,mjs,cjs,ts,mts,cts}`) and legacy config files (` | feature | verified | .claude/skills/control-angular-devtools/features/attach.md:3 |
| **Auto-installation**: `nx import` auto-detects ESLint config files and offers to install `@nx/eslint`. Accept the offer — it registers the plugin and updates `namedInputs.production` to exclude ESLin | feature | verified | .claude/skills/control-angular-devtools/features/attach.md:3 |
| After import, projects will have **two** lint-related targets if the source `package.json` has a `"lint"` npm script: | feature | aspirational | Aspirational claim (future/desired state) |
| - `lint` — created by Nx from the npm script via `nx:run-script`; no caching intelligence, just wraps `npm run lint` | command | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| **Fix**: Remove the `"lint"` script from each project's `package.json`. Keep `"lint:fix"` if present — there is no plugin-inferred equivalent for auto-fixing. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| When `@nx/eslint/plugin` runs `eslint .` on a project with a legacy `.eslintrc.*` config that uses `parserOptions.project`, it tries to lint **all** files in the project directory including: | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Generated `dist/**/*.d.ts` files (not in tsconfig `include`) | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - The `.eslintrc.js` config file itself (not in tsconfig `include`) | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| This causes `Parsing error: ESLint was configured to run on X using parserOptions.project, however that TSConfig does not include this file`. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| // .eslintrc.json | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| // .eslintrc.js — also ignore the config file itself since module.exports isn't in tsconfig | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| ignorePatterns: ['dist/**', '.eslintrc.js'], | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| When a project uses `eslint.config.cjs` (CJS flat config), `eslint .` lints the config file itself. The `require()` call on line 1 triggers `@typescript-eslint/no-require-imports`. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| The same applies to `eslint.config.js` in a CJS project (no `"type": "module"`) if it uses `require()`. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| `typescript-eslint@7.x` declares `peerDependencies: { "eslint": "^8.56.0" }`, but it is commonly used alongside `"eslint": "^9.0.0"`. npm treats this as a hard peer dep conflict and refuses to install | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| **Fix**: Upgrade `typescript-eslint` from `^7.0.0` to `^8.0.0` directly in the affected workspace package's `package.json`. The `tseslint.config()` API and `tseslint.configs.recommended` are identical | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| // packages/my-package/package.json | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| **Note**: npm's root-level `"overrides"` field does not force versions for workspace packages' direct dependencies — update each package.json individually. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - If you import an entire Gradle repository into a subfolder, files like `gradlew`, `gradlew.bat`, and `gradle/wrapper` will end up inside that imported subfolder. | feature | aspirational | Aspirational claim (future/desired state) |
| - The `@nx/gradle` plugin expects those files at the workspace root to infer Gradle projects/tasks automatically. | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:250 |
| - Because the import lands in a subfolder, Gradle project references can break; review settings and project path references, then fix any errors. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - https://nx.dev/docs/technologies/java/gradle/introduction | structure | unverifiable | Not found: docs/technologies/java/gradle/introduction |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Jest-specific guidance for `nx import`. For the basic "Jest Preset Missing" fix (create `jest.preset.js`, install deps), see `SKILL.md`. This file covers deeper Jest integration issues. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `npx nx add @nx/jest` does two things: | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| 1. **Registers `@nx/jest/plugin` in `nx.json`** — without this, no `test` targets are inferred | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| **Gotcha**: `nx add @nx/jest` does NOT create `jest.preset.js` — that file is only generated when you run a generator (e.g. `@nx/jest:configuration`). For imports, you must create it manually (see "Je | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| **Other gotcha**: If you create `jest.preset.js` manually but skip `npx nx add @nx/jest`, the plugin won't be registered and `nx run PROJECT:test` will fail with "Cannot find target 'test'". You need  | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| The preset provides shared Jest configuration (test patterns, ts-jest transform, resolver, jsdom environment). | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| **Root `jest.preset.js`:** | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| **Project `jest.config.ts`:** | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| export default { | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| preset: '../../jest.preset.js', | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| The `preset` path is relative from the project root to the workspace root. Subdirectory imports preserve the original relative path (e.g. `../../jest.preset.js`), which resolves correctly if the impor | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| pnpm add -wD jest ts-jest @types/jest @nx/jest | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - **Node testing** (APIs, CLIs): no extra deps (Jest defaults to `node` env, but Nx preset defaults to `jsdom`) | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| pnpm add -wD @testing-library/react @testing-library/jest-dom | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| pnpm add -wD babel-jest @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| pnpm add -wD @vue/test-utils | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| Vue projects typically use Vitest (not Jest) — see VITE.md. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| Jest projects need a `tsconfig.spec.json` that includes test files: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| "extends": "./tsconfig.json", | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| "jest.config.ts", | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| "src/**/*.test.ts", | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| "src/**/*.spec.ts", | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| "src/**/*.d.ts" | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Missing `"types": ["jest", "node"]` — causes `describe`/`it`/`expect` to be unrecognized | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Missing `"module": "commonjs"` — Jest doesn't support ESM by default (ts-jest transpiles to CJS) | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - **Jest**: Next.js apps, older React libs, Node libraries | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| **Jest** (in `test-setup.ts`): | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| import '@testing-library/jest-dom'; | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| **Vitest** (in `test-setup.ts`): | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| import '@testing-library/jest-dom/vitest'; | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| If the source used Jest but the dest workspace uses Vitest for that project type, update the import path. Also add `@testing-library/jest-dom` to tsconfig `types` array. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| Nx rewrites `package.json` scripts during init. Test scripts get broken: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| `@nx/jest/plugin` supports splitting tests per-file for CI parallelism: | feature | verified | .claude/skills/control-vitest-browser-angular/features/held-counter.md:50 |
| This creates `test-ci--src/lib/foo.spec.ts` targets for each test file, enabling Nx Cloud distribution. Not relevant during import, but useful for post-import CI setup. | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| 1. **"Cannot find target 'test'"**: `@nx/jest/plugin` not registered in `nx.json`. Run `npx nx add @nx/jest` or manually add the plugin entry. | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| 2. **"Cannot find module 'jest-preset'"**: `jest.preset.js` missing at workspace root. Create it (see SKILL.md). | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 3. **"Cannot find type definition file for 'jest'"**: Missing `@types/jest` or `tsconfig.spec.json` doesn't have `"types": ["jest", "node"]`. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 4. **Tests fail with "Cannot use import statement outside a module"**: `ts-jest` not installed or not configured as transform. Check `jest.config.ts` transform section. | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| 1. `npx nx add @nx/jest` — registers plugin in `nx.json` (does NOT create `jest.preset.js`) | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| 2. Create `jest.preset.js` manually (see "Jest Preset" section above) | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 3. Install deps: `pnpm add -wD jest jest-environment-jsdom ts-jest @types/jest` | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| 5. Verify `tsconfig.spec.json` has `"types": ["jest", "node"]` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 1. Remove rewritten test scripts from `package.json` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 2. `npx nx add @nx/jest` — registers plugin (does NOT create preset) | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| 3. Create `jest.preset.js` manually | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 5. Verify/fix `jest.config.*` — ensure `preset` path points to root `jest.preset.js` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 6. Verify/fix `tsconfig.spec.json` — add `types`, `module`, `include` if missing | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Next.js-specific guidance for `nx import`. For generic import issues (pnpm globs, root deps, project references, name collisions, ESLint, frontend tsconfig base settings, `@nx/react` typings, Jest pre | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| `@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}` and creates these targets: | feature | verified | .claude/skills/control-angular-devtools/features/attach.md:3 |
| - `build` → `next build` (with `dependsOn: ['^build']`) | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| - `start` → `next start` (depends on `build`) | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| **No separate typecheck target** — Next.js runs TypeScript checking as part of `next build`. The `@nx/js/typescript` plugin provides a standalone `typecheck` target for non-Next libraries in the works | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| **Build target conflict**: Both `@nx/next/plugin` and `@nx/js/typescript` define a `build` target. `@nx/next/plugin` wins for Next.js projects (it detects `next.config.*`), while `@nx/js/typescript` h | feature | verified | .claude/skills/control-angular-devtools/features/attach.md:3 |
| Nx-generated Next.js projects use `composePlugins(withNx)` from `@nx/next`. This wrapper is optional for `next build` via the inferred plugin (which just runs `next build`), but it provides Nx-specifi | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| Beyond the generic root deps issue (see SKILL.md), Next.js projects typically need: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| **Core**: `react`, `react-dom`, `@types/react`, `@types/react-dom`, `@types/node`, `@nx/react` (see SKILL.md for `@nx/react` typings) | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| **Testing**: see SKILL.md "Jest Preset Missing" section | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| **ESLint**: `@next/eslint-plugin-next` (in addition to generic ESLint deps from SKILL.md) | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| Next.js detects missing `@types/react` during `next build` and tries to install it using `yarn add` regardless of the actual package manager. In a pnpm workspace, this fails with a "nearest package di | feature | verified | .claude/skills/control-angular-devtools/features/attach.md:3 |
| **Fix**: Install deps at the root before building: `pnpm add -wD @types/react @types/react-dom` | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| Next.js app tsconfigs have unique patterns compared to Vite: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **`noEmit: true`** with `emitDeclarationOnly: false` — Next.js handles emit, TS just checks types. This conflicts with `composite: true` from the TS solution setup. | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:85 |
| - **`"types": ["jest", "node"]`** — includes test types in the main tsconfig (no separate `tsconfig.app.json`) | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **`include`** references `.next/types/**/*.ts` for Next.js auto-generated types | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - **`"jsx": "preserve"`** — Next.js uses its own JSX transform, not React's | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| **Gotcha**: The Next.js tsconfig sets `"noEmit": true` which disables `composite` mode. This is fine because Next.js projects use `next build` for building, not `tsc`. The `@nx/js/typescript` plugin's | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Imported Next.js configs may have `// eslint-disable-next-line @typescript-eslint/no-var-requires` but the project ESLint config enables different rule sets. This produces `Unused eslint-disable direc | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:38 |
| When `@nx/next:init` runs during a whole-repo import, it rewrites the project's `package.json` scripts to prefixed `nx` calls: | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| This is the standard "npm Script Rewriting" issue from SKILL.md, but triggered by `@nx/next:init` rather than Nx init. **Fix**: Remove all rewritten scripts from `package.json` — `@nx/next/plugin` inf | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| For single-project `create-next-app` repos, use whole-repo import into a subdirectory: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| nx import /path/to/source apps/web --ref=main --source=. --no-interactive | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| `next build` auto-generates `next-env.d.ts` at the project root. Add `next-env.d.ts` to the dest root `.gitignore` — it is framework-generated and should not be committed. | feature | aspirational | Aspirational claim (future/desired state) |
| `create-next-app` generates a flat ESLint config using `eslint-config-next` (which bundles its own plugins). This is **self-contained** — no root `eslint.config.mjs` needed, no `@nx/eslint-plugin` dep | feature | verified | .commandcode/skills/nx-generate/SKILL.md:99 |
| Non-Nx Next.js projects have self-contained tsconfigs with `noEmit: true`, their own `lib`, `module`, `moduleResolution`, and `jsx` settings. Since `next build` handles type checking internally, no ts | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:85 |
| **Gotcha**: The `@nx/js/typescript` plugin won't create a `typecheck` target because there's no `tsconfig.lib.json`. This is fine — use `next:build` for type checking. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Non-Nx Next.js projects use `noEmit: true`, which conflicts with Nx's TS solution setup (`composite: true`). If the dest workspace uses project references and you want the Next.js app to participate: | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| 2. Add `extends: "../../tsconfig.base.json"` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| **However**, this is optional for standalone Next.js apps that don't export types consumed by other workspace projects. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `create-next-app` with Tailwind generates `postcss.config.mjs`. This works as-is after import — no path changes needed since PostCSS resolves relative to the project root. | feature | verified | .commandcode/skills/nx-generate/SKILL.md:99 |
| When both Next.js and Vite projects exist in the same workspace. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Both `@nx/next/plugin` and `@nx/vite/plugin` can coexist in `nx.json`. They detect different config files (`next.config.*` vs `vite.config.*`) so there are no conflicts. The `@nx/js/typescript` plugin | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Vite standalone projects (imported as whole-repo) have self-contained tsconfigs without `composite: true`. The `@nx/js/typescript` plugin's typecheck target runs `tsc --build --emitDeclarationOnly` wh | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| 1. Add `extends: "../../tsconfig.base.json"` to the root project tsconfig | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 2. Add `composite: true`, `declaration: true`, `declarationMap: true`, `tsBuildInfoFile` to `tsconfig.app.json` and `tsconfig.spec.json` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 4. Add source files to `tsconfig.spec.json` `include` — specs import app code, and `composite` mode requires all files to be listed | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:38 |
| - `@nx/js/typescript` uses `"typecheck"` | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Next.js projects have NO standalone typecheck target — Next.js runs type checking during `next build` | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| 1. Import Next.js apps into `apps/<name>` (see SKILL.md: "Application vs Library Detection") | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 2. Generic fixes from SKILL.md (pnpm globs, root deps, `.gitkeep` removal, frontend tsconfig base settings, `@nx/react` typings) | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| 3. Install Next.js-specific deps: `pnpm add -wD @next/eslint-plugin-next` | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| 4. ESLint setup (see SKILL.md: "Root ESLint Config Missing") | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| 5. Jest setup (see SKILL.md: "Jest Preset Missing") | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| 1. Import into `apps/<name>` (see SKILL.md: "Application vs Library Detection") | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| 2. Generic fixes from SKILL.md (pnpm globs, stale files cleanup, script rewriting, target name prefixing) | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| 3. (Optional) If app needs to export types for other workspace projects: fix `noEmit` → `composite` (see SKILL.md) | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Source: CNW next preset (Next.js 16, App Router) + `@nx/react:library` shared-ui | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 5. Next.js trying `yarn add @types/react` — fixed by installing at root | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 6. Missing `@nx/eslint`, root `eslint.config.mjs`, ESLint plugins | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| 7. Missing `@nx/jest`, `jest.preset.js`, `jest-environment-jsdom`, `ts-jest` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Source: `create-next-app@latest` (Next.js 16.1.6, App Router, Tailwind v4, flat ESLint config) | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 3. Nx-rewritten npm scripts (`"build": "nx next:build"`, etc.) — removed | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - See VITE.md Scenario 6 for the full multi-import scenario | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Next.js-specific findings: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 2. Stale files: `node_modules/`, `package-lock.json`, `.gitignore` — deleted (npm workspace, no pnpm files) | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| 4. No tsconfig changes needed — `noEmit: true` stays; `next build` handles type checking | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:85 |
| - Source A: CNW next preset (Next.js 16, App Router) — subdirectory import of `apps/` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Source B: CNW react-standalone preset (Vite 7, React 19) — whole-repo import into `apps/vite-app` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| 1. All Scenario 1 fixes for the Next.js app | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 2. Stale files from Vite source: `node_modules/`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.gitignore`, `nx.json` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 3. Removed rewritten scripts from Vite app's `package.json` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 6. Vite `tsconfig.spec.json` `include` missing source files — specs import app code | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 7. Vite tsconfig `moduleResolution: "node"` → `"bundler"`, added `extends: "../../tsconfig.base.json"` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - Nx replaces Turborepo task orchestration, but a clean migration requires handling Turborepo's config packages. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:38 |
| - Migration guide: https://nx.dev/docs/guides/adopting-nx/from-turborepo#easy-automated-migration-example | structure | unverifiable | Not found: docs/guides/adopting-nx/from-turborepo#easy-automated-migration-example |
| - **`@repo/typescript-config`** (or similar) — tsconfig files (`base.json`, `nextjs.json`, `react-library.json`, etc.) | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| These are not code libraries. They distribute config via Node module resolution (e.g., `"extends": "@repo/typescript-config/nextjs.json"`). This is the **default** Turborepo pattern — expect it in vir | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| **Before doing any config merging, check whether the destination workspace uses shared root configuration.** This decides how to handle the config packages. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - If the workspace has a root `tsconfig.base.json` and/or root `eslint.config.mjs` that projects extend, merge the config packages into these root configs (see steps below). | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - If the workspace does NOT have root config files — each project manages its own configuration independently (similar to Turborepo). In this case, **do not create root config files or merge into them | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:8 |
| If unclear, check for the presence of `tsconfig.base.json` at the root or ask the user. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 1. **Read the config package** — trace the full inheritance chain (e.g., `nextjs.json` extends `base.json`). | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 2. **Update root `tsconfig.base.json`** — absorb `compilerOptions` from the base config. Add Nx `paths` for cross-project imports (Turborepo doesn't use path aliases, Nx relies on them). | feature | verified | .commandcode/skills/nx-import/references/TURBOREPO.md:30 |
| 3. **Update each project's `tsconfig.json`**: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Change `"extends"` from `"@repo/typescript-config/<variant>.json"` to the relative path to root `tsconfig.base.json`. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Inline variant-specific overrides from the intermediate config (e.g., Next.js: `"module": "ESNext"`, `"moduleResolution": "Bundler"`, `"jsx": "preserve"`, `"noEmit": true`; React library: `"jsx": "r | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 2. **Update root `eslint.config.mjs`** — absorb base rules (JS recommended, TypeScript-ESLint, Prettier, etc.). Drop `eslint-plugin-turbo`. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| 3. **Update each project's `eslint.config.mjs`** — switch from importing `@repo/eslint-config/<variant>` to extending the root config, adding framework-specific plugins inline. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| 5. If `@nx/eslint` plugin is configured with inferred targets, remove `"lint"` scripts from project `package.json` files. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Delete all `turbo.json` files (root and per-package). | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **Module resolution changes** — from Node package resolution (`@repo/...`) to relative paths (`../../tsconfig.base.json`). | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - https://nx.dev/docs/guides/adopting-nx/from-turborepo | structure | unverifiable | Not found: docs/guides/adopting-nx/from-turborepo |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Vite-specific guidance for `nx import`. For generic import issues (pnpm globs, root deps, project references, name collisions, ESLint, frontend tsconfig base settings, `@nx/react` typings, Jest preset | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| `@nx/vite/plugin` defaults `typecheckTargetName` to `"vite:typecheck"`. If the workspace expects `"typecheck"`, set it explicitly in `nx.json`. If `@nx/js/typescript` is also registered, rename one ta | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:250 |
| Keep both plugins only if the workspace has non-Vite pure TS libraries — `@nx/js/typescript` handles those while `@nx/vite/plugin` handles Vite projects. | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:85 |
| Plugin init loads `vite.config.ts` before deps are available. **Fix**: `pnpm add -wD vite @vitejs/plugin-react` (or `@vitejs/plugin-vue`) first, then `pnpm exec nx add @nx/vite`. | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| **`@/` path alias**: Vite's `resolve.alias` works at runtime but TS needs matching `"paths"`. Set `"baseUrl": "."` in project tsconfig. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| See SKILL.md for the generic noEmit→composite fix. Vite-specific additions: | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Non-Nx Vite projects often have **both** `tsconfig.app.json` and `tsconfig.node.json` with `noEmit` — fix both | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Solution-style tsconfigs (`"files": [], "references": [...]`) may lack `extends`. Add `extends` pointing to the dest root `tsconfig.base.json` so base settings (`moduleResolution`, `lib`) apply. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| React Router 7 (`@react-router/dev`) uses Vite under the hood with a `vite.config.ts` and a `react-router.config.ts`. The `@nx/vite/plugin` detects `vite.config.ts` and creates inferred targets. | feature | verified | .claude/skills/control-angular-devtools/features/attach.md:3 |
| `@nx/vite/plugin` creates `build`, `dev`, `serve` targets. The `build` target invokes the script defined in `package.json` (usually `react-router build`), not `vite build` directly. | feature | verified | .commandcode/skills/nx-import/references/VITE.md:52 |
| React Router 7 uses a single `tsconfig.json` (no `tsconfig.app.json`/`tsconfig.node.json` split). It includes: | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - `"noEmit": true` — replace with composite settings per SKILL.md | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| React Router 7 generates `.react-router/` at the project root for route type generation. Add `.react-router` to the dest root `.gitignore`. | feature | verified | .commandcode/skills/nx-generate/SKILL.md:99 |
| TanStack Start uses Vinxi under the hood, which wraps Vite. Projects have a standard `vite.config.ts` that `@nx/vite/plugin` detects normally. | feature | verified | .claude/skills/control-angular-devtools/features/attach.md:3 |
| `@nx/vite/plugin` creates `build`, `dev`, `preview`, `serve-static`, `typecheck` targets. The `build` target runs `vite build` which invokes the TanStack Start Vinxi pipeline (produces both client and | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| TanStack Start uses a single `tsconfig.json` with `"allowImportingTsExtensions": true` and `"noEmit": true`. Apply the standard noEmit → composite fix. `allowImportingTsExtensions` is compatible with  | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| TanStack Start commonly uses `"#/*": ["./src/*"]` and `"@/*": ["./src/*"]`. These are self-referential — keep as-is for a single-project app. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| `create-tan-stack` initializes a git repo but does NOT make an initial commit. Before importing, commit first: | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| git -C /path/to/source add . && git -C /path/to/source commit -m "Initial commit" | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| Add `"jsx": "react-jsx"` — in `tsconfig.base.json` for single-framework workspaces, per-project for mixed (see Mixed section). | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| import nx from '@nx/eslint-plugin'; | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| import baseConfig from '../../eslint.config.mjs'; | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| export default [ | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| { files: ['**/*.ts', '**/*.tsx'], rules: {} }, | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| React 18 (source) + React 19 (dest): pnpm may hoist mismatched `react-dom`, causing `TypeError: Cannot read properties of undefined (reading 'S')`. **Fix**: Align versions with `pnpm.overrides`. | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| If source used Jest: change import to `@testing-library/jest-dom/vitest` in test-setup.ts, add to tsconfig `types`. | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| Add to `tsconfig.base.json` (single-framework) or per-project (mixed): | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| import { defineComponent } from 'vue'; | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| export default component; | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| 1. `pnpm add -wD eslint@^9 eslint-plugin-vue vue-eslint-parser @vue/eslint-config-typescript @typescript-eslint/parser @nx/eslint-plugin typescript-eslint` | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| 2. Create root `eslint.config.mjs` | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| 3. Then `npx nx add @nx/eslint` | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| import vue from 'eslint-plugin-vue'; | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| import vueParser from 'vue-eslint-parser'; | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| import tsParser from '@typescript-eslint/parser'; | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| import baseConfig from '../../eslint.config.mjs'; | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| export default [ | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.vue'], | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| `vue-eslint-parser` must be an explicit pnpm dependency (strict resolution prevents transitive import). | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| `@nx/vite/plugin` uses `vue-tsc` for Vue projects and `tsc` for React automatically. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| `nx import` copies `package.json` verbatim, so npm scripts come along. For Vite-based projects `@nx/vite/plugin` already infers the same targets from `vite.config.ts` — the npm scripts just shadow the | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| Remove `build`, `dev`, `preview`, and `test` scripts, but move any hardcoded `--port` flag to `vite.config.ts` first: | config | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| // vite.config.ts | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| export default defineConfig({ | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| server: { port: 3000 },  // replaces `vite dev --port 3000` | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - `typecheck` runs `react-router typegen && tsc` — typegen must precede `tsc` or it fails on missing route types | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| 1. Generic fixes from SKILL.md (pnpm globs, root deps, executor paths, frontend tsconfig base settings, `@nx/react` typings) | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| 4. **Vue**: `jsx: "preserve"` + `jsxImportSource: "vue"`; verify `vue-shims.d.ts`; install ESLint deps before `@nx/eslint` | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| 0. Import into `apps/<name>` (see SKILL.md: "Application vs Library Detection") | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| 1. Generic fixes from SKILL.md (stale files cleanup, pnpm globs, rewritten scripts, target name prefixing, noEmit→composite, ESLint handling) | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| 7. Remove redundant npm scripts so `@nx/vite/plugin` infers them natively (see "Redundant npm Scripts" section) | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| 8. **Vue**: Add `outDir` + `**/*.vue.d.ts` to ESLint ignores | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| See SKILL.md for generic multi-import (name collisions, dep refs). Vite-specific: fix tsconfig `references` paths for alternate directories (`../../libs/` → `../../libs-beta/`). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| 1. Ensure source has at least one commit (see SKILL.md: "Source Repo Has No Commits") | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| 2. `nx import` whole-repo into `apps/<name>` (see SKILL.md: "Application vs Library Detection") → auto-installs `@nx/vite`, `@nx/react` | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| 3. Stale file cleanup: `node_modules/`, `package-lock.json`, `.gitignore` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 4. Fix `tsconfig.json`: `noEmit` → `composite + emitDeclarationOnly + outDir + tsBuildInfoFile` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 6. **Keep all npm scripts** — React Router 7 uses framework CLI (`react-router build/dev`), not plain vite (see "Redundant npm Scripts" above) | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| 7. `npm install && nx reset && nx sync --yes` | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| 1. Ensure source has at least one commit — `create-tan-stack` does NOT auto-commit (see SKILL.md) | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| 2. `nx import` whole-repo into `apps/<name>` (see SKILL.md: "Application vs Library Detection") → auto-installs `@nx/vite`, `@nx/vitest` | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| 3. Stale file cleanup: `node_modules/`, `package-lock.json`, `.gitignore` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 4. Fix `tsconfig.json`: `noEmit` → `composite + emitDeclarationOnly + outDir + tsBuildInfoFile` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 7. Move hardcoded `--port` from `dev` script into `vite.config.ts` (`server: { port: N }`) | config | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| 8. Remove redundant npm scripts — `@nx/vite/plugin` infers `build`, `dev`, `preview`, `test` (see "Redundant npm Scripts" above) | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| 9. `npm install && nx reset && nx sync --yes` | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - Dest: CNW ts preset (Nx 22.5.1), npm workspaces, `packages/*` | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - Pre-import fixes: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| 2. `git init && git add . && git commit` in Vite app (no git at all) | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| 3. `git add . && git commit` in TanStack app (git init'd but no commits) | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| - Import: `npm exec nx -- import <source> packages/<name> --source=. --ref=main --no-interactive` | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - Next.js import auto-installed `@nx/eslint`, `@nx/next` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - React Router 7 import auto-installed `@nx/vite`, `@nx/react`, `@nx/docker` (Dockerfile present) | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - TanStack import auto-installed `@nx/vitest` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Post-import fixes: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| 1. Removed stale `node_modules/`, `package-lock.json`, `.gitignore` from each package | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 2. Removed Nx-rewritten scripts from `board-games-nextjs/package.json` (had `"build": "nx next:build"`, etc.) | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 3. Updated root `tsconfig.base.json`: `nodenext` → `bundler`, added `dom`/`dom.iterable` to lib, added `jsx: react-jsx` | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 5. Fixed `noEmit` → `composite + emitDeclarationOnly` in: `board-games-vite/tsconfig.app.json`, `board-games-vite/tsconfig.node.json`, `board-games-react-router/tsconfig.json`, `board-games-tanstack/t | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - All targets green: `build` for all 5 projects; `typecheck` for Vite/React Router/TanStack; `next:build` for Next.js | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - List plugins: `pnpm nx list` | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - Install plugins `pnpm nx add <plugin>`. Example: `pnpm nx add @nx/react`. | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Keep in mind that you might have to prefix things with npx/pnpx/yarn if the user doesn't have nx installed globally. Look at the package.json or lockfile to determine which package manager is in use. | command | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| where `project` is the project name defined in `package.json` or `project.json` (if present). | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| You can pass a `-p` flag to filter to specific projects, otherwise it runs on all projects. You can also use `--exclude` to exclude projects, and `--parallel` to control the number of parallel process | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - `nx affected -t test --files=libs/mylib/src/index.ts` — specify changed files directly | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| This skill provides read-only exploration of Nx workspaces. Use it to understand workspace structure, project configuration, available targets, and dependencies. | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| The project filtering syntax (`-p`/`--projects`) works across many Nx commands including `nx run-many`, `nx release`, `nx show projects`, and more. Filters support explicit names, glob patterns, tag r | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| **Important**: Do NOT read `project.json` directly - it only contains partial configuration. The `nx show project --json` command returns the full resolved config including inferred targets from plugi | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| You can read the full project schema at `node_modules/nx/schemas/project-schema.json` to understand nx project configuration options. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Read `nx.json` directly for workspace-level configuration. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| You can read the full project schema at `node_modules/nx/schemas/nx-schema.json` to understand nx project configuration options. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| cat nx.json | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| cat nx.json \| jq '.targetDefaults' | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| cat nx.json \| jq '.namedInputs' | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| cat nx.json \| jq '.plugins' | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| cat nx.json \| jq '.generators' | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Key nx.json sections: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - ...and much more, read the schema or nx.json for details | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| If the user is asking about affected projects, read the [affected projects reference](references/AFFECTED.md) for detailed commands and examples. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| nx show projects --json \| jq '.[] \| select(startswith("shared-"))' | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - Modern Angular only: standalone components, signals and zoneless. NgZone/zone.js, NgModules (`RouterModule.forRoot`, `HttpClientModule`), class-based guards/resolvers/interceptors, template-driven a | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - RxJS itself is not legacy and should not be excluded; it is fine as long as it stays compatible with OnPush and zoneless, and he expects RxJS-specific and RxJS+Angular-specific features to be design | feature | aspirational | Aspirational claim (future/desired state) |
| - Legacy-support rule: if a feature judged legacy behaves identically to its modern replacement from a runtime DevTools perspective, leave it working with no flag, do not list it as supported, and rem | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Expects him to be told about legacy APIs that a target app actually uses (audit the app, then map legacy → modern replacement). Confidence: 0.75 | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:250 |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - In design documents say "modern Angular pattern" and "modern Angular feature"; never "blessed" or "ordained" — and neither word may appear in DevTools code, UI or runtime text. Confidence: 0.85 | feature | verified | spikes/ng222-app/.angular/cache/22.2.2/ng222-app/vite/deps/core-C4Mibiy-.js:11455 |
| - When a design point is unclear he asks "explain this to me" / "what do you mean by ..." and expects a short, direct explanation before he rules. Confidence: 0.7 | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:250 |
| - Claims in research and design files are expected to be labelled with how they were established (measured vs. documented vs. inferred), and an inferred label must not be silently upgraded. Confidence | feature | aspirational | Aspirational claim (future/desired state) |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - Any `globalThis` runtime export must be a small pre-vetted allowlist of first- and third-party packages (`@angular/*`, `@ngrx/*`), never arbitrary app services looked up by name. Confidence: 0.8 | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - Keep resource usage low: close unused browser windows and tabs (including ones on his own profiles) and stop leftover dev servers, background shells and model processes as soon as they are no longer | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:41 |
| - Clean up unnecessary AI models and other large artifacts after use; `C:` runs low on space on this machine. Confidence: 0.8 | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Chrome Beta and Edge Dev are the primary AI-capable test targets; Chrome and Edge stable are acceptable, and Phi-4-mini runs on a dedicated Edge stable profile. Confidence: 0.75 | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Commits must be authored/committed as `larsbrinknielsen@gmail.com`; his work email and its domain must never appear in commits or documents. Confidence: 0.7 | structure | unverifiable | Path not identifiable |
| - Prefers `.mjs` (ESM) script format with `node:` protocol imports for Node.js scripts in `scripts/` (e.g. `install-*-command-code.mjs`). Confidence: 0.9 | structure | unverifiable | Path not identifiable |
| - Validates JavaScript/Node script syntax with `node --check` before runtime testing. Confidence: 0.75 | command | verified | spikes/ng222-app/.angular/cache/22.2.2/ng222-app/vite/deps/core-C4Mibiy-.js:9480 |
| - Mirrors his global (user-scope) agent setup across coding tools: he ports the Claude configuration (`~/.claude/CLAUDE.md` + `references/*.md`) into the equivalent Command Code files (`~/.commandcode | structure | unverifiable | Not found: .claude/CLAUDE.md |
| - Pre-tests subagent model-route availability with a minimal probe prompt (e.g. a trivial question) before assigning a substantive task; if a route fails with zero tool uses, probe alternatives until  | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Runs subagents and orchestrator steps in the primary worktree (e.g. D:/projects/sandbox/...) rather than sidecar/inspect worktrees to avoid HEAD and path-mismatch failures that break downstream step | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - Do not start Fable subagents on his behalf without asking; if a task fits Fable, ask first, or use Opus during AFK/overnight runs. Confidence: 0.85 | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Long autonomous runs are normal (AFK/overnight lars-mode), and he expects the run to end with a plain what's-done / what's-left report. Confidence: 0.7 | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Prefers atomic, bisect-safe Conventional Commits: each change set is one focused commit that leaves the repo in a working state suitable for `git bisect`, and follows the Conventional Commits format | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| - Project-local config generated by tools (e.g. `.commandcode/settings.json`) should be committed to the repo rather than gitignored or kept machine-local — once confirmed to hold no tokens or machine | structure | verified | Exists: .commandcode/settings.json |
| - Commit taste-file (`taste.md`) changes automatically whenever they are detected — but always in their own dedicated commits, never bundled together with other changes. Confidence: 0.9 | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Splits config into shared vs personal layers: shared project settings stay committed in `.commandcode/settings.json`, while personal/machine-specific config such as permission rules goes in a gitign | structure | verified | Exists: .commandcode/settings.json |
| - Allows all `git` commands without prompting, but `git push` must always stay at "ask" (never auto-approved). Confidence: 0.75 | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| - Writes commit messages to temp files via the `write_file` tool and commits with `git commit -F <path>` when heredocs are unavailable in the shell (e.g. Windows cmd), rather than attempting inline `g | command | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - Reviews `.commandcode/taste/` changes with `git diff` before committing taste files, to verify the recorded preferences match the session's learnings. Confidence: 0.7 | structure | verified | Exists: .commandcode/taste/ |
| - Organizes agent instructions/rules with progressive disclosure: a compact root file (CLAUDE.md / AGENTS.md) that points to a `references/*.md` folder read on demand, rather than one large file. Conf | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Follows existing code conventions and patterns when creating new scripts (e.g. "similar to the other install-*.mjs scripts in scripts/"). Confidence: 0.85 | structure | unverifiable | Path not identifiable |
| - Uses a plan-first workflow: writes implementation plans to `~/.commandcode/plans/`, presents them via `exit_plan_mode`, and waits for approval before implementing. Confidence: 0.75 | structure | unverifiable | Not found: .commandcode/plans/ |
| - Scopes every audit subagent to read ONLY the target docs plus an explicit enumeration of source roots (.claude/skills/*/scripts/, .commandcode/skills/*/scripts/, spikes/, docs/, plans/, research/),  | structure | unverifiable | Not found: .claude/skills/*/scripts/, |
| - Collates parallel subagent partial outputs into a single template-compliant deliverable and validates it programmatically (check_docs_audit.py: disjoint ## Doc: / ## Descriptive docs sections matchi | feature | aspirational | Aspirational claim (future/desired state) |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Lars, verbatim: "You are now running in AFK mode overnight". Started 02:2x local time. Claude runs `lars-mode` `playbooks/afk-run.md`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| **Goal:** finish the research and design deliverable, "AI-assisted Angular DevTools" feature proposals (`docs/feature-proposals.md`), and the control and verify skills Lars asked for, so that every cl | structure | verified | Exists: docs/feature-proposals.md |
| 3. Edge provider trials ran on the standing Aion instance: `genai_config.json` provider set to QNN (NPU) and to CPU, against a WebGPU baseline, with the busiest engine and latency recorded. Aion was r | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 4. The proposals reflect 1 to 3, and one full review round (`playbooks/review-round.md`, ending with a security review) has run on the deliverable. Its findings are resolved or recorded. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| 5. Tree clean: `git status` shows nothing but ignored paths. Only the four standing per-model instances run, each on one blank tab, plus Lars's everyday Edge, which is untouched. | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| **Gates that still hold:** no push, PR, tag or filing (upstream bugs go to `docs/filing-ledger.md`). No deletion of anything Claude did not create. No changes to Lars's own browser profiles beyond rea | structure | verified | Exists: docs/filing-ledger.md |
| - Lars's rulings, verbatim: `docs/feature-proposals.md` section 8, "Rulings from Lars". | structure | verified | Exists: docs/feature-proposals.md |
| - Briefs: `.audit/maintain-brief.md`, `.audit/ai-browsers-rework.md`. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Research `research/00`-`10`, the filing ledger `docs/filing-ledger.md`. | structure | unverifiable | Not found: research/00 |
| - The `lars-create-control-skill` contract (`references/generated-skill.md`). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Global `CLAUDE.md`: prose, git and shell rules. | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Labels, as in `docs/feature-proposals.md`: | structure | verified | Exists: docs/feature-proposals.md |
| - **[documented]**: stated in vendor documentation or in a `research/` file that quotes it, not checked by a run. | structure | unverifiable | Path not identifiable |
| - **[inferred; not sourced in `research/`]**: from Claude's general knowledge (mostly tutoring practice in other learning tools), not checked against any file in this repository. | structure | unverifiable | Path not identifiable |
| Section references such as "3.3" or "N1" point to `docs/feature-proposals.md`; "01", "05" and so on point to `research/01-...`, `research/05-...`. | structure | verified | Exists: docs/feature-proposals.md |
| The tutor teaches modern Angular on the app that the learner already has open: the learner reads a short concept, sees it highlighted in the live page, predicts what the app will do, acts in the app,  | feature | aspirational | Aspirational claim (future/desired state) |
| Proposals section 1 says the AI tutor "has no runtime counterpart in a devtools extension" **[inferred, there]**. That holds for a port of the CLI tutor, which needs project files and code writing. Th | config | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Supported apps are zoneless, standalone Angular 22.2 dev builds (section 1 of the proposals). So no lesson teaches Zone.js change detection, NgModules, template-driven or Reactive Forms, decorator i | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Writes from chat sit behind a per-action confirm, with a read-only switch (Decision 3, 3.5). The tutor has one kind of write, the "Show me" demonstration (section 9, T7), and it uses the same confir | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| 1. **Code finds, chooses and grades; the model words.** Every fact the learner sees is computed by code: which components were checked, which signals changed, which injector provides a token, whether  | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| 3. **The core loop needs no tool calling.** Code knows which data each step needs before it calls the model, so the model gets a pre-computed fact sheet in one structured-output prompt with no tools.  | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| Each lesson runs these stages in order. "Code" is plain TypeScript; "page agent" is the MAIN-world script of 3.1; "panel" is the extension's DevTools panel page. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| Predict-then-observe (`pick-set`, `value`, `order` with an action) is the main type, because it makes the learner commit before the app answers and then shows the measured answer on the same page. Pre | structure | unverifiable | Path not identifiable |
| - Wrong options are chosen by rule, not at random: for "which components will be checked", siblings and ancestors of the right answers that read no signal the action writes; for "which signals change" | command | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - Changes: after three first-try passes in a row, the tutor offers one level up; after two revealed answers in a row, one level down. The learner confirms each change **[inferred design]**. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - `cd-cycles`: per cycle, the trigger and the set of components whose template ran, from `ng.ɵsetProfiler` callbacks, which receive the event and the instance (26 events, `profiler_types.ts:17-157`) * | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - The profiler subscriber is added only while a lesson records, and removed with the remover it returns; the tutor never calls `ɵsetProfiler(null)` (2.2) **[documented rule, proposals 2.2]**. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - The window opens when the learner locks the prediction and closes at the first of: no `ChangeDetectionStart` for 750 ms after the last `ChangeDetectionEnd` with no resource node in a loading state;  | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| Graders are pure functions shipped with the extension. Each returns one shape **[inferred design]**: | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| // e.g. {subject: 'app-cart-summary', relation: 'reads', object: 'total'} | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - `value`: equality after the same parse as `set_writable_field` uses for the field's type (3.4); numbers compare exactly unless the lesson declares a tolerance. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - For each `missing` and `extra` key, the grader adds the facts that explain it: for a component checked but not picked, the chain from the written signal to the signal its template reads; for one pic | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Step mode on: each stage in 2.1 is its own card with a "Next" button. Step mode off: concept and example share a card, and the check shows under the exercise **[inferred design]**. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - Resume reads `chrome.storage.local`, not project files (section 5). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| Lessons are data shipped with the extension. Their text is written by hand; the model never writes a lesson **[inferred design]**. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| needs: { router?: true; ssr?: true; marks?: string[]; spike?: string }; | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| reuses: string[];              // proposals feature ids, e.g. ['N1', 'N2'] | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| Predicates and ranking rules are named functions in the extension's code, not text the model reads or writes **[inferred design]**. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| A lesson appears only when its predicate holds on the current page. Predicates run in the panel over the snapshot that the page agent sends (4.4) **[inferred design]**. Examples: | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - **Concept (core, shipped):** "In a zoneless app, Angular runs change detection when something tells it to: a template listener, a signal that a template reads, or an explicit call. With OnPush, the  | structure | unverifiable | Path not identifiable |
| - **Example (built by code):** the component whose listener the action will hit, highlighted, with the caption "`<listener component>` handles the click; `<reader>` reads `<computed>`". | feature | aspirational | Aspirational claim (future/desired state) |
| - **Misconceptions (T1):** `parent-checks-children` (picked every child of the listener's component), `listener-only` (picked only the listener's component), `all-on-screen` (picked everything). | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| - **Feedback template (wrong, shipped):** "You picked {picked}. Angular checked {observed}. {for each missing: '{c} was checked because it reads {s}, which depends on {w}.'} {for each extra: '{c} was  | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - **Model call (K2):** rewrites that template's filled text as at most three sentences for the level, from the fact sheet in 4.3. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - **Tier 1, reuses N1 and N2.** | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Every K1, K2 and K4 call runs on a fresh `clone()` of a warm tutor base session that holds only the tutor's system prompt, so no history builds up and the oldest-pair eviction of `contextoverflow` c | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Rewriter's options are not described in any `research/` file; 01 lists its status only, and 00 measured it `available` in Chrome stable 154's page and in Edge Dev 157's page, and `downloadable` in C | structure | unverifiable | Path not identifiable |
| - The Prompt API accepts `en`, `ja`, `es`, `de` and `fr` as expected languages in Chrome **[documented, 01 section 1]**, so tutor prompts run in English and K5 translates the result **[inferred design | feature | aspirational | Aspirational claim (future/desired state) |
| The windows are 7,168 tokens on Aion and 9,216 on the Chrome models and Phi-4-mini **[measured, 05]**. The tutor's calls are far smaller than that, by construction: | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - **Pre-computed facts, not data.** The model gets "`app-cart-summary` reads `total`; `total` depends on `items`; `items` was written by the click listener of `app-cart-item`", never a graph **[inferr | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| Every K1, K2 and K4 output passes three checks before it replaces the shipped or templated text; any failure keeps the shipped text and is counted locally **[inferred design]**: | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| On panel open, after the support and model checks **[inferred design]**: | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| - Act stage: each component whose template ran gets a short pulse as the cycle is recorded (like the "highlight updates" option of other framework devtools **[inferred; not sourced in `research/`]**). | structure | unverifiable | Path not identifiable |
| - "Show in Elements" uses `inspect()` through `chrome.devtools.inspectedWindow.eval`, as N13's source route does (Tier 0, 02 sections 2.2 and 3) **[documented, proposals N13]**. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - K3 uses 3.3's routing rule unchanged: native tools on Edge with a `contextWindow` of 7,168 and a passing native canary, the structured-output loop otherwise, unsupported when the structured-output c | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - K1 uses Rewriter first where `Rewriter.availability()` reads `available`, then the Prompt API (4.2). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| So the Tier 0-only part of the tutor is P1-tree, P1-owner, P1-inputs, P1-outputs without its capture, P3-onpush without its capture, P4-errors, the three Signal Forms lessons once S9 passes, and the t | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - **Learner gets:** feedback that names the likely wrong idea ("You may be thinking that a parent's check checks its children; with OnPush, each child is checked only when its own signals or inputs ch | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| - **Learner gets:** "Your app has two findings; learn the concept behind each." An N2 finding (an effect that only writes another signal) opens P2-effect with that effect as the example; an N24 findin | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - **Split:** the finding is code (N2 and N10's rule passes, N24's regex); the lesson is shipped; the model words only the explanation, as N2 already does. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - **Learner gets:** a guided walk through this app: one card per route and per main component ("`app-cart` shows the cart; it reads three signals, one of them a `computed`; it has one component-level  | structure | unverifiable | Path not identifiable |
| - **Split:** code chunks the app by route and by component, builds a fact sheet of at most about 250 tokens per chunk, orders the chunks by the tree, and joins the sentences; the model writes one sent | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - **Tier:** 0 for the tree; 1 for signal and DI counts. **Window fit:** one chunk per call, under 500 tokens with the system prompt; a 47-component page is 47 small calls run in the background queue ( | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - **Learner gets:** a short review exercise days later, on a different example that meets the same precondition, so the learner recalls the idea and not the earlier answer. Spaced retrieval practice i | structure | unverifiable | Path not identifiable |
| - **Tier:** 1. **Window fit:** one step per call. **Status:** the pulses of 6.3 are in this design; the step-through view waits on TS1, because it shows the capture in the most detail. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - **Learner gets:** for an exercise whose action is hard to do by hand, a "Show me" button: the tutor writes one writable signal or plain field with `set_writable_field` and the learner watches the re | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - **Learner gets:** two components from this app side by side that differ in one way (an `Eager` and an OnPush component; a `computed` and an effect that writes a signal), each run through the same ac | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - **Split:** code masks, caches (5.1) and checks; Translator translates. **Tier:** none. **Window fit:** per text; no Prompt API window used. | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| Also inherited from the proposals: S9 (Signal Forms lessons), S10 (an error-boundary lesson), S13 (model identity, which only K3's native route needs), S3 and S4 (K3's tool budget and answer quality), | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - How: a lesson shows a concept, highlights a live example found by a code predicate, asks the learner to predict what the app will do (picking from lists or from the page, never typing code), records | structure | unverifiable | Not found: research/02 |
| - The model rewords shipped text to levels 1-10 and explains the gap between prediction and observation from a fact sheet of about 400 tokens, with no tools; every output passes deterministic checks f | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - Tier 0 + 1; Prompt API with structured output, Rewriter, Translator. Design, risks and spikes: `docs/design/tutor.md`. | structure | verified | Exists: docs/design/tutor.md |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Evidence files (in `research/`, plus the filing ledger in `docs/`): | structure | unverifiable | Path not identifiable |
| - `00-browser-probe.md`: what Claude measured in Lars's browsers (flags, models, context windows, tool calling). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `01-built-in-ai-apis.md`: Prompt API and the other built-in AI APIs, extension availability, WebMCP, Chrome DevTools AI assistance. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `02-angular-surface.md`: the `ng` global at 22.2 with tiers, what Angular DevTools calls, the Angular AI docs, Angular's in-page AI tools. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - `03-prior-art.md`: Pangular Inspector, React DevTools, Chrome DevTools AI assistance and MCP, other framework devtools. The Pangular comparisons describe its source at clone commit `76c09d0`, not th | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `04-ecosystem.md`: NgRx, Analog, Storybook, Vitest Browser Mode, RxAngular. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `05-spikes.md`: runs on a real Angular 22.2.2 app, sizes on the insurance portal, and the model benchmark. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - `06-angular-skills.md`: the official angular/skills repo as a rule source. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `07-prompting-small-models.md`: prompting guidance for the on-device models. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `08-recent-angular-features.md`: Angular 20.0-22.2 features, their runtime visibility, and feature ideas. 08 numbers the new ideas F1-F10, which are N14-N23 here in the same order (F1 = N14, F2 = N1 | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `09-nano-tool-session-error.md`: root cause of Gemini Nano's "unable to create a session" error with native tools. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `10-model-capabilities.md`: what vendors say about tool calling and structured output per model, against the measurements. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `11-spike-s1-extension-contexts.md`: spike S1, the Prompt API and a tool round trip in each extension context. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `12-legacy-vs-modern-angular.md`: every legacy Angular API at 22.2 next to its modern form, whether the extension's tools see the two differently, and the support table from Lars's rule (section 1). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `13-portal-legacy-audit.md`: the legacy APIs found in the insurance portal's source, and the move of its forms to Signal Forms. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `14-ai-devtools-prior-art.md`: AI features of other devtools, MCP servers and coding-agent browser integrations, judged against this design; WebMCP from the app's side; candidate features C1-C11. La | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `15-deterministic-and-ai.md`: which extension context runs which deterministic work and whether it has the built-in AI, the patterns that keep the model's input small (section 3.7), where chunking f | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - `16-ssr-runtime.md`: the SSR spike on the fixture `spikes/ng222-ssr` (commit `c5030a6`): what a server-rendered 22.2 page in development mode exposes (hydration counters and mismatches, transfer sta | structure | verified | Exists: spikes/ng222-ssr |
| - `17-vitest-browser-runtime.md`: the Vitest Browser Mode spike on the counter fixture (commit `c929050`): whether the extension can be present in a Vitest Browser run with Playwright, by attaching to | structure | unverifiable | Not found: research/raw/vitest-*.json |
| - `../docs/filing-ledger.md`: ten draft upstream reports, none filed: one for Angular found in spike S2, two for Pangular Inspector found while building the Pangular control skill, two for Chromium fr | structure | verified | Exists: docs/filing-ledger.md |
| Every feature names the data tier it needs (section 2.2). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - server-side rendering with hydration (`provideClientHydration()`), in development mode with SSR on (`ng serve` running the app's `server.ts`). Measured on the SSR fixture `spikes/ng222-ssr` (Angular | structure | verified | Exists: spikes/ng222-ssr |
| - A Zone.js app gets a "not supported" notice in the panel instead of a chat. The panel decides this with the zone-mode check in `app_facts` (3.3, 3.4). An app that is zoneless but still loads zone.js | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - NgModule apps are unsupported. The panel decides this with the NgModule check in `app_facts` (3.3, 3.4; `research/12` section 2): the app is standalone when some environment injector on the root com | structure | unverifiable | Not found: research/12 |
| - `@angular/upgrade` (hybrid AngularJS) apps are unsupported (Lars's ruling, section 8). A hybrid app provides `NgZone` itself through `internalProvideZoneChangeDetection` (`packages/upgrade/static/sr | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| - `RouterModule.forRoot` publishes no router globals **[measured, 02 section 1.1]**, so router features cannot answer. In an NgModule app the NgModule check refuses the app; in a standalone app that i | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Template-driven and Reactive Forms are not supported: the forms feature (N15) reads Signal Forms only, and N10 flags the legacy forms directives. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - A Zone.js app gets a "not supported" notice in the panel instead of a chat. The panel decides this with the zone-mode check in `app_facts` (3.3, 3.4). An app that is zoneless but still loads zone.js | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - NgModule apps are unsupported. This includes the `RouterModule.forRoot` router setup, which publishes no router globals **[measured, 02 section 1.1]**. The panel has no check that detects an NgModul | feature | verified | .claude/skills/control-angular-devtools/features/attach.md:3 |
| - Template-driven and Reactive Forms are unsupported; the forms feature (N15) reads Signal Forms only." | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| No shipped framework devtools panel uses an on-device model **[inferred from search, 03 section 5]**. Pangular Inspector, Chrome DevTools for agents, agent-react-devtools and the Angular CLI MCP serve | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - `overview.md` (the "Build with AI" page at `angular.dev/ai`) is about apps that call cloud models. Its best practices match 3.3 and 3.5: tools that the developer controls, a human in the loop (3.5's | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `design-patterns.md` gives one of N2's rules. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - WebMCP support gives N9. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - `agent-skills.md` names the `angular/skills` repo, which is the rule source for N10 **[documented, 02 section 4.5; rules counted in 06]**. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| The AI tutor (`ai-tutor.md`) is a persona for a coding agent. It runs through the CLI MCP server and reads project files **[documented, Angular AI docs read in 02 section 4.4]**. So a port of it, whic | structure | verified | Exists: docs/design/tutor.md |
| - Aion-1.1-Instruct (Edge Dev 157) answered all 15 benchmark runs through native tool calls, at 3-6 s per question. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Gemma 4 (Chrome Beta 156) is reliable only through a structured-output loop (13/15 runs on the default GPU low tier, 15/15 on CPU, which needs the `OnDeviceModelForceCpuBackend` command-line feature | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Gemini Nano also runs on that loop, because in native mode it makes no tool calls at all. On the loop it passed 11/15 runs on GPU and 0/15 on CPU, so it is supported on GPU but not reliable, and uns | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Phi-4-mini (Edge stable) is weak at both **[measured, 05; Nano GPU figures regraded with `916fc09`, `spikes/probes/regrade.mjs`]**. | structure | verified | Exists: spikes/probes/regrade.mjs |
| - The browser never runs tools itself: `prompt()` returns `tool-call` parts, and the extension runs them and sends `tool-response` parts back **[measured, 00 and 01]**. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - So the extension needs a routing rule. No API in the evidence names the model, so the rule in 3.3 uses what the extension can observe: native tools only on Edge with a `contextWindow` of 7,168 (Aion | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| 4. **Most of what Angular DevTools shows is reachable from `window.ng` in a MAIN-world script** with no app change **[measured, 02 section 1-2]**. The parts that need internals are already on the page | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| Stretch (app opt-in): N9, agent rehearsal for WebMCP tools. It tests whether a small model can use the app's own tools, so it works only on apps that register WebMCP tools. The brief calls that a stre | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - The earlier probes ran in Lars's own profiles: the first Chrome probe in Chrome stable 154 (00), the first Aion reads in Edge Dev (00), and S2 and the first benchmark round in Edge Dev and Chrome Be | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Which backend a model runs on: that comes only from `on-device-internals` Broker State, or from the stored performance class. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| Benchmark: five questions about the counter app, three runs each, three narrow tools, native tools against the structured-output fallback loop. Details are in 05; all four models ran while another ses | structure | unverifiable | Not found: research/raw/bench/*.json |
| Nano's native passes (2/15 on GPU, 1/15 on CPU) are grader artifacts, not answers: | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - None of the three runs made a tool call **[measured, native runs in `research/raw/bench/nano-gpu.json` and `nano.json`]**. With no tool call, the model had no data to answer from. | structure | verified | Exists: research/raw/bench/nano-gpu.json |
| - Two are question 1 ("How many Angular components are on the page?"), whose check `//b(2\|two)/b/i` (`spikes/probes/bench.js`) passes any text with a standalone "2" or the word "two". Both saved answe | structure | verified | Exists: spikes/probes/bench.js |
| - The third is "Page data indicates that `app-counter` uses `OnPush` change detection", a guess with no tool call that matches the 22.x default **[measured, same files]**. | feature | verified | spikes/ng222-app/node_modules/.vite/vitest/7a7785ec6fcdebf6852283e7e35b5171b95ecf7a/deps/vitest_n_magic-string.js:1408 |
| - Aion (Edge, `contextWindow` 7,168): native tools, if the native canary passes. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - Phi-4-mini (Edge, 9,216): the structured-output loop. It made a tool call in only 5 of 15 native runs, so one native canary would route it by chance. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Every failed run, by class **[measured, counted from `research/raw/bench/*.json` after the `916fc09` regrade]**. The rule for a run that fits two classes: a run whose calls never reach a tool that c | structure | unverifiable | Not found: research/raw/bench/*.json |
| Note on Gemma 4 CPU, native: 2 of its 3 bad-argument runs are invalid selectors that made the harness throw (05). Those two are saved with `calls: []` in `gemma4-cpu.json`, so which tool they called i | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - `create()` with `tools` needs both `expectedOutputs: [{type:'text'}, {type:'tool-call'}]` and `expectedInputs: [{type:'text'}, {type:'tool-response'}]`, or it throws. | feature | aspirational | Aspirational claim (future/desired state) |
| - Tool calls arrive as `LanguageModelToolCall` objects with getter fields `name`, `callID`, `arguments`. `JSON.stringify` shows `{}`. The member is spelled `callID`; `callId` throws. | feature | verified | .claude/skills/control-vitest-browser-angular/features/held-counter.md:50 |
| - Gemma 4 returns `callID: ""`. Pass it back unchanged. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - in Edge benchmark runs (Aion fallback 1, Phi-4-mini 3), where Chromium's crash counter is not known to apply; | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - once on Gemma 4 in Chrome Beta, with snake_case tool names and a required parameter on every tool (native, question 4, run 2: `ERR UnknownError: An unknown error occurred: kErrorUnknown`, `calls: [] | structure | verified | Exists: research/raw/bench/gemma4.json |
| - The earlier finding that empty `properties` causes the failure is confounded, because every failing probe also used camelCase names **[measured, 11]**. The controlled test (`spikes/probes/tool-name- | structure | verified | Exists: spikes/probes/tool-name-matrix.js |
| - Until that test runs, tools use snake_case names and at least one parameter (a required `scope` or `id`). That rule avoids the two known suspects, not every crash: the Gemma 4 run above followed it  | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Streaming on Gemma 4 tool sessions is not established either way. The only test (`spikes/probes/probe9.js:18-27`) called `prompt()`, got a tool call back, and then streamed on a `clone()` of that se | structure | unverifiable | Not found: spikes/probes/probe9.js:18-27 |
| - Cost of that default: the answer clone has none of the tool calls or results, so the tool results from the tool session are appended to it as text, as in the fallback loop (3.3 step 3). The results  | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - The model must be present before `create()` from a page without user activation. The download needs a user gesture **[documented, 01; a click was sufficient, measured, 00]**. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - **Covered by a support statement:** the nine `ɵ` functions in `ExternalCoreGlobalUtils` (lines 105-136): `ɵgetDependenciesFromInjectable`, `ɵgetInjectorProviders`, `ɵgetInjectorResolutionPath`, `ɵge | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - **No support statement:** `toggleWatchSignal` is in `InternalCoreGlobalUtils` (lines 78-97), a "beta" channel that Angular says it can change "more or less as much as we want"; the router trio is in | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| Decision 1 in section 8 lists what would have dropped to Tier 2 had Lars ruled Tier 1 out, and which of those features rest on the group with no support statement. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Never call `ng.ɵsetProfiler(null)`. It clears every profiler, including Angular DevTools' **[measured, `render3/profiler.ts:40-42`]**. Only add callbacks and keep the remover. | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - A lookup with an imported class (`injector.get(Router)`) is impossible from an extension without the opt-in export (below), because the extension's classes are not the app's. A lookup with a token o | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| **Tier 2: opt-in export (stretch, app opt-in, like WebMCP).** Lars approved it on 2026-10-12 and narrowed it twice the same day (Rulings, section 8). Nothing here is built or run; spike S16 (section 7 | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - **What the app installs.** The project publishes a companion npm package (its package name is a working name, Lars's to choose). Its provider function `provideAiDevTools()` (Lars's name) puts a pre- | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - **Publishing rules from Lars's skill (`lars-frontend-dev`, `references/publishing.md`) that apply [documented, Lars's skill]:** one secondary entry point per item; peer dependencies on `@angular/*`  | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - It detects the package by the `globalThis` key and its `version`, and reads only the packages and symbols in its vetted table (below) for that version. It ignores every other key on the object, and  | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - It uses each class as a token: provider records are matched by identity (`record.token === Router`) instead of by token name (3.4), and `injector.get` gets the app's own class. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Safety rule (the same rule as 3.4): it calls `injector.get(exportedClass)` only when a provider record on the path shows that the instance already exists. For a `providedIn: 'root'` class with no re | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - **No code generated.** The extension still generates no code (Lars's ruling "2:", section 8); the companion package is a separate opt-in artifact that the app installs, as it installs `provideStoreD | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| 1. Lookup by class for a vetted token with no provider record yet: a `providedIn: 'root'` service that nothing has injected has no record (`r3_injector.ts:352-358`, 3.4), and the extension can then te | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| 2. Public APIs instead of internals: `Router`'s `routerState`, `url`, `events`, `config` and `navigateByUrl` in place of `ɵgetRouterInstance` and `ɵnavigateByUrl`, which have no support statement; the | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| 3. Third-party state without symbol scans: `getState` in place of the `STATE_SOURCE` scan (6.1); `Store` state and the action stream without `provideStoreDevtools` (6.1); `RxStrategyProvider` by class | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| - **Tier.** Using the package is Tier 2 (app opt-in), like WebMCP. The Tier 1 route stays the default; each feature in sections 3-6 that improves with the export says so in one line. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Analog's `DEBUG_ROUTES`: `@analogjs/router` exports `injectDebugRoutes` and `withDebugRoutes`, not the token (`packages/router/src/index.ts:24-25` at `a377078`) **[measured in Analog source]**, and  | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| Where accessibility roles and names come from (N10's a11y rule and N23). Page JavaScript has no standard API that returns the accessibility tree **[inferred; not checked in `research/`]**. 08 names tw | structure | unverifiable | Path not identifiable |
| - The selected element `$0` is reachable only through `chrome.devtools.inspectedWindow.eval` and `chrome.devtools.panels.elements.onSelectionChanged`, so the DevTools panel uses that second channel fo | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Where the model session lives: spike S1 (`research/11`) **[measured in Chrome Beta 156 and Edge Dev 157]**. | structure | unverifiable | Not found: research/11 |
| - The exception is the hidden `devtools_page`. Its `language-model` permissions policy is denied, `availability()` reads `unavailable`, and `create()` throws `NotAllowedError`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| The extension also answers `devtoolstooldiscovery` with its own tool group, so when chrome-devtools-mcp (with `--categoryExperimentalThirdParty`) drives a browser in which the extension is installed ( | feature | verified | .claude/skills/control-ai-browsers/features/README.md:12 |
| - It calls `injector.get(ViewContainerRef)` on component hosts. After that, `ng.ɵgetSignalGraph` (and `angular:signal_graph`) lose the template node and the signals that only the template reads (`titl | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - `ɵgetDependenciesFromInjectable`'s first statement is `injector.get(token, null, {self: true, optional: true})`, and it throws "Unable to determine instance of ..." when that returns null (`packages | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - On an environment injector, the same `get` constructs a provided service that was not created yet and runs its constructor **[inferred from `R3Injector.get` (`r3_injector.ts:323`, record creation at | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - After that first `get`, the function also calls `get` for each of the class's dependencies along the resolution path (`{self: true, optional: true}` on each injector until one returns a value, and f | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| Before any of the steps below, the panel runs `app_facts` once per page load. It runs two support checks (3.4): the zone-mode check and the NgModule check. If the zone-mode check reads Zone.js change  | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| 1. **Intent and tool subset.** A fresh clone of a warm session gets the question and a list of tool groups, and returns `{groups: [...]}` under `responseConstraint`. Only those groups' tools go into t | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| 3. **Structured-output loop.** Used where `tools` is missing or ignored (Chrome 154 stable with the flag off), and wherever the routing rule below chooses it. The same loop runs on structured output. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - The model returns `{"tool": name, "args": {...}}` or `{"answer": "..."}` under a `responseConstraint` built from the tool schemas. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - Chrome Beta defines `LanguageModelToolCall` and `LanguageModelToolSuccess` and accepts a tool session. Yet its tool prompts failed with `kErrorUnknown` in 00's probes **[measured, 00]**, the same sy | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - The native canary runs only on Edge. On Chrome the routing rule sends the model to the structured-output loop whatever the native canary says, so its result cannot change the route there, and a `kEr | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - The check runs without blocking the chat and stops at the first failure (one failure already marks the model unsupported). A question asked before the check finishes uses the cached result when one  | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - In `research/raw/bench/nano.json` the fallback questions have medians of 34-42 s per question **[measured]**. | structure | verified | Exists: research/raw/bench/nano.json |
| - 14 of the 15 failed runs threw on the JSON parse (`SyntaxError: Unexpected end of JSON input`), and the harness saves such runs with `calls: []` from its catch block, so their calls are not recorded | feature | aspirational | Aspirational claim (future/desired state) |
| - The reverse move, from CPU back to GPU, produces no loop reply to react to, because an unsupported model runs no loop. So while unsupported is the cached result, each panel open runs the structured- | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Native tools when the browser is Edge, `contextWindow` is 7,168 (Aion as measured; Phi-4-mini on Edge stable reports 9,216) and the native canary passes. The structured-output canary does not decide | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - Otherwise, the structured-output loop, if the structured-output canary passes three times out of three. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - **After a `kErrorUnknown` on Chrome, do not retry automatically [inferred design].** The extension stops the question, shows the error, tells the user that Chrome may count it toward its three-crash | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Snake_case names with a required parameter do not prevent the error: the Gemma 4 benchmark run in 2.1 followed that rule and still failed **[measured, `research/raw/bench/gemma4.json`]**. | structure | verified | Exists: research/raw/bench/gemma4.json |
| - 3.6's "retry once on a tool error" covers a tool that returns an error, not a failed session, so it does not apply here. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - In Chrome 156 the tool types are gated by the Blink runtime feature `AIPromptAPIToolUse`, not by the model. With the feature off, `create()` refuses any `tool-call`/`tool-response` type with "unable | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - With the feature on, Gemini Nano opens tool sessions but answered with text instead of a tool call in all three tries **[measured, 05]**. In the benchmark, none of Nano's 15 native GPU runs made a t | structure | verified | Exists: research/raw/bench/nano-gpu.json |
| - Microsoft documents Aion 1.0 Instruct as a text model; no source describes Aion-1.1-Instruct, the version Edge Dev 157 serves. Its tool calls come from Edge's runtime workaround (`msEdgeLLMOnDeviceM | feature | verified | .claude/skills/control-pangular-inspector/features/live-inspection.md:39 |
| **Tools take ids, not selectors.** `find_components` returns short ids (`c3`), and every tool that targets a component takes `{id}`. The evidence **[measured, counted from `research/raw/bench/*.json`; | structure | unverifiable | Not found: research/raw/bench/*.json |
| The names in the table are the names the model receives. Every argument that names something takes a value that a list tool returned or an `enum`, and every tool checks its arguments itself, on every  | feature | verified | spikes/ng222-app/node_modules/.vite/vitest/7a7785ec6fcdebf6852283e7e35b5171b95ecf7a/deps/plugins.D2ut1V9b-DDzazuHB.js:4415 |
| - `di_lookup` checks `token` against both sources: a name in neither `di_path`'s list nor a captured error message returns the error template; a name from an error message that is on no provider recor | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - It walks the `ɵgetInjectorResolutionPath` path and reads `ɵgetInjectorProviders` on each injector; the first injector whose records hold the token is where it resolves, unless injection flags or vie | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - It calls `ɵgetDependenciesFromInjectable` only with `instance.constructor` of a component or directive on the host, never for a service token or a node-injector special token. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - `ɵgetDependenciesFromInjectable` calls `injector.get` for the class and for each of its dependencies along the path (3.2), so it is safe only on a token that is known to be constructed on that injec | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - `getNodeInjectorProviders` appends six tokens registered with `registerSpecialProvider` to every node injector's records (`injector_discovery_utils.ts:219-229`): `Injector`, `ChangeDetectorRef`, `Re | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| **Tools answer the narrow question; the page agent reads the graph.** In S2, given the raw signal graph (nodes plus edges by index), Aion named the wrong dependencies for `double` and Gemma 4 named th | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| Tools whose answers depend on a legacy form that the tools see differently (`research/12` section 2; each is flagged by N10): | structure | unverifiable | Not found: research/12 |
| - `list_signals`, `signal_dependencies` and `signal_trace` see only signal inputs and signal queries; a decorator `@Input()` field or a decorator query is no signal node (`research/12` C1, C3). | structure | unverifiable | Not found: research/12 |
| - `set_writable_field` writes a decorator `@Input()` field as a plain field, while it refuses a signal input; decorator inputs are not supported (`research/12` C1). | structure | unverifiable | Not found: research/12 |
| - `router_state` answers only with `provideRouter` (`RouterModule.forRoot` publishes no router globals, `research/12` R3), and it describes `canMatch` guards; a `canLoad` guard runs only before the fi | structure | unverifiable | Not found: research/12 |
| Tools that improve when the app adds the opt-in export (2.2, "Tier 2: opt-in export"); the Tier 1 route above stays the default **[inferred design]**: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - `router_state`: gets `Router` from the vetted list and reads its public `routerState`, `url`, `events` and `config` instead of going through `ng.ɵgetRouterInstance`, which has no support statement.  | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - `wait_for`: its `navigation` condition reads the vetted `Router`'s public `events` instead of going through `ng.ɵgetRouterInstance`. Tier 2 (app opt-in). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| **`app_facts` reads the change-detection mode from provider records, not from a feature mark or `typeof Zone`, and uses it only as the support check (3.3).** It walks `ɵgetInjectorResolutionPath` from | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Why the last record: a Zone.js app has two `NgZone` records on the same injector. Both bootstrap paths put `provideZonelessChangeDetectionInternal()` before the app's own providers (`application/cre | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Do not use the `provideZoneChangeDetection token` record (`PROVIDED_NG_ZONE`, `ng_zone_scheduling.ts:166`) as the test: `@angular/upgrade` provides the zone through `internalProvideZoneChangeDetecti | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| - `performanceMarkFeature('NgZoneless')` is called only inside the public `provideZonelessChangeDetection()` (`packages/core/src/change_detection/scheduling/zoneless_scheduling_impl.ts:370` on 22.2.x) | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - The insurance portal loads zone.js and calls neither provider. Probe `spikes/probes/zone-mode.js` found one `NgZone` record, with `useClass: NoopNgZone`, and `InjectionToken Zoneless enabled` with ` | structure | verified | Exists: spikes/probes/zone-mode.js |
| - The counter app (`spikes/ng222-app`, no zone.js) also shows `NoopNgZone` (the `control-angular-dev-app` doctor, `8e057fc`, and again with the last-record reading of `3da10e3`) **[measured]**. | structure | verified | Exists: spikes/ng222-app |
| - The Zone.js case was run on a modified portal: with `provideZoneChangeDetection()` added (then reverted), the "Environment Injector" lists, in this order, `NgZone` `useClass: NoopNgZone`, `Zoneless  | structure | verified | Exists: research/raw/zone-mode-portal-zonejs.json |
| - Both functions are among the nine with a support statement (2.2), and `ɵgetInjectorProviders` reads records without instantiating anything (3.2). Pangular also reads the mode from the root injector' | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| Every tool result that contains page text starts with Pangular's notice: page values are data, not instructions **[documented, Pangular docs at `76c09d0` (`security.md`), 03 section 1.5]**. Values who | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Reads run without asking. Writes (`set_writable_field`, navigate, dispatch, form fill) and every WebMCP call, including ones marked `readOnlyHint`, because the hint comes from the app, pause for a c | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - The confirm labels a write that can leave the page (a form submit, an NgRx `dispatch` whose effect calls the server, an app WebMCP call) as "may change server data"; the small models' argument error | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - The tool group that the extension publishes through `devtoolstooldiscovery` (3.2) holds only tools whose `execute` runs entirely in the page's MAIN world on data the page can already read (`ng.*`, t | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Every model output that reaches the user passes a deterministic code-shape check first, in every feature, not only N27: no fenced block and no line that looks like code (an assignment, an arrow, a s | structure | verified | Exists: docs/design/tutor.md |
| - Everything stays on the device. In Chrome, the built-in model sends nothing to Google or a third party **[documented, Chrome get-started docs, 03 section 3.4]**. For Edge, Microsoft's Prompt API pag | structure | unverifiable | Not found: research/14 |
| - **What Aion is:** its tokenizer uses Phi-4's chat and tool tokens, and its config says `qwen3`, a 32,768-token native context and greedy decoding **[measured from its files, 07 section 1.4]**. `msed | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - **Argument repair** (approved by Lars, 2026-10-12, Rulings below). Code checks and repairs a call's arguments before the tool runs. A model's bad argument is a malformed call, and code can often fix | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Replay of the saved benchmark runs (`spikes/probes/arg-repair-replay.mjs`, output `research/raw/arg-repair-replay.json`, commit `a2c654f`): 131 tool calls, 26 with invalid arguments, 21 of those mad | structure | verified | Exists: spikes/probes/arg-repair-replay.mjs |
| 2. Constrained built-in AI fallback, only for calls the deterministic step cannot repair **[inferred design]**: | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - Code validates the result again. The model picks among real options; it never decides validity. | feature | verified | spikes/ng222-app/.angular/cache/22.2.2/ng222-app/vite/deps/core-C4Mibiy-.js:9480 |
| 3. Never repair writes. A write runs only with exact arguments, behind the confirm (3.5) **[inferred design]**. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| 4. Show it. The walkthrough shows every repaired call and what changed **[inferred design]**. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - Validation catches malformed calls, not misunderstood questions. Nano's valid-but-wrong `signal: "count"` passes validation. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| 7. Spike S19 (section 7) reruns `bench.js` with the repair step on. Not run. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| **Principle [inferred design].** Code computes every fact that has an algorithm (counts, diffs, rule checks, graph walks, epoch comparisons), and the model receives only what code cannot do: choose am | feature | verified | spikes/ng222-app/node_modules/.vite/vitest/7a7785ec6fcdebf6852283e7e35b5171b95ecf7a/deps/plugins.D2ut1V9b-DDzazuHB.js:4415 |
| **Patterns (`research/15` section 2) [inferred design unless marked]:** | structure | unverifiable | Not found: research/15 |
| **Execution contexts, short form (`research/15` section 1) [measured for the rows S1 ran, 11; others as marked]:** | structure | unverifiable | Not found: research/15 |
| **Limits (`research/15` section 3).** An open question over the whole page has no known split or merge; the panel answers it from code (a list of findings) and the model explains the finding the user  | structure | unverifiable | Not found: research/15 |
| - Adds over Angular DevTools: its profiler shows time per component and flame graphs. It does not follow the chain from a trigger through signals to each component that was checked; N1 adds that per-c | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - Legacy forms (`research/12` section 2): N1 follows only signal inputs and signal queries (a decorator `@Input()` or query change is no signal epoch change, `research/12` C1, C3), and it explains an  | structure | unverifiable | Not found: research/12 |
| - How: `signal_trace` walks producers from a node back to writable sources; the model narrates the chain with labels (labels come from compiler-inserted `debugName`, `implicit_signal_debug_name_transf | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - a cycle or an effect that writes a signal it reads (possible loop); | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - a `resource` whose params read a signal that changes per keystroke (the `design-patterns.md` advice on separate input and submitted signals, `design-patterns.md:5-39` **[measured]**); | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - How the write rules see writes: the signal graph alone cannot see them. `ng.ɵgetSignalGraph` has read edges only, and a signal that nothing reads is not a node. On `spikes/ng222-app` the effect that | structure | verified | Exists: spikes/ng222-app |
| - Legacy forms (`research/12` section 2): provenance and the pattern rules see only signal inputs and signal queries; decorator inputs and queries are not graph nodes (`research/12` C1, C3). | structure | unverifiable | Not found: research/12 |
| - Deterministic part: the rule pass, the `debuggableFn` scan and the `signal_trace` walk are code (above). The model receives one finding at a time (rule id, component, node label, one line of evidenc | structure | verified | Exists: research/raw/tosignal-node-portal.json |
| - How: `di_path` plus `di_lookup` for both components, then a diff of the two resolution paths. Both read provider records along each path and construct nothing; `ɵgetDependenciesFromInjectable` runs  | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - For a question about the whole app, it runs `di_path` and `di_lookup` over the relevant components. It never runs `angular:di_graph`, which section 3.2 forbids. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Legacy forms (`research/12` section 2): N3 does not support `providedIn: 'any'` tokens, which get one instance per lazy environment injector (`research/12` I2); constructor injection and `inject()`  | structure | unverifiable | Not found: research/12 |
| - With the opt-in export (2.2): for a class on the vetted list (for example `Meta`), N3 matches records by identity and can say "provided at root, not created yet" where it now says "no provider recor | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Deterministic part: code computes both resolution paths, the first injector where they part, and which injector holds the token's record on each side. The model receives that diff (two short injecto | feature | verified | spikes/ng222-app/node_modules/.vite/vitest/7a7785ec6fcdebf6852283e7e35b5171b95ecf7a/deps/plugins.D2ut1V9b-DDzazuHB.js:4415 |
| - The digest's source: the angular repo's `adev/src/content/reference/errors` on the 22.2.x branch, 61 `NG*.md` pages (plus `overview.md` and a `BUILD.bazel`), 95,095 bytes in all, about 24K tokens at | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Adds over Chrome Console Insights: Console Insights' full explanation runs on cloud Gemini under opt-in **[documented, 03 section 3]**; its short "teasers" already run on-device through the Prompt A | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - What the page shows, run on the SSR fixture `spikes/ng222-ssr` (`research/16` sections 1, 2 and 7): | structure | verified | Exists: spikes/ng222-ssr |
| - `defer_blocks`: before the trigger, `ng.ɵgetControlFlowBlocks` returns the block with `state: "initial"`, `incrementalHydrationState: "dehydrated"` and `triggers: ["hydrate on interaction", "on idle | structure | verified | Exists: research/raw/ssr-defer.json |
| - Counters: six `ngDevMode` counters (`hydratedNodes`, `hydratedComponents`, `dehydratedViewsRemoved`, `dehydratedViewsCleanupRuns`, `componentsSkippedHydration`, `deferBlocksWithIncrementalHydration` | structure | unverifiable | Not found: research/16 |
| - Per-node status: `__ngDebugHydrationInfo__` is a DOM expando `{status}` with `hydrated`, `skipped` or `mismatched` **[documented in source, `research/16` section 1]**; on a clean page 34 nodes carry | structure | unverifiable | Not found: research/16 |
| - Correction: a mismatch is recorded on the closest component host (`<app-mismatch>` in the fixture), not on the node that differs. The entry holds `expectedNodeDetails` and `actualNodeDetails`, strin | structure | verified | Exists: research/raw/ssr-hydration.json |
| - Correction: a text-only difference never shows. With `?mismatch=text` the server sends `server text`, the page ends with `client text`, and there is no error and no non-hydrated node **[measured, `r | structure | verified | Exists: research/raw/ssr-hydration.json |
| - Deterministic part: code reads `defer_blocks` and `hydration_status`, keeps only blocks that are not in their final state and components with a mismatch or a skip, and checks the correlations that h | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Not reachable: a mismatch caused by server-only code (the fixture's `<div>` depends on `REQUEST`) shows only as its effect; the server code that caused it, and `REQUEST` itself, stay on the server ( | structure | unverifiable | Not found: research/16 |
| - Tier 1 (`ɵgetControlFlowBlocks`, with a support statement; `__ngDebugHydrationInfo__` and the `ngDevMode` counters, with none). Prompt API with tools. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - With the opt-in export (2.2): the router events come from the vetted `Router`'s public `events` instead of through `ɵgetRouterInstance`, which has no support statement. Tier 2 (app opt-in); the Tier | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - How: `page_snapshot` crops the visible tab to the component box and sends the image with the component's inputs, CSS classes from the host, and computed style subset, as multimodal input. The model  | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - Status: multimodal image input is a documented Prompt API feature and the flag is on in Chrome stable and Beta **[measured flags, 00]**, but Claude did not run an image prompt. Edge's Aion support f | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Deterministic part: code crops the capture to the host box, reads the inputs, host classes and a fixed list of computed style properties, and caps them as in 3.6. The model receives the image and th | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - How: when the page exposes `document.modelContext` (flag `enable-webmcp-testing`, active in Chrome Beta and Edge Dev after a relaunch; `document.modelContext` exposes `registerTool`, `getTools`, `ex | feature | aspirational | Aspirational claim (future/desired state) |
| - Fallback when the browser has no `document.modelContext`: a MAIN-world shim at `document_start` that provides `registerTool`, so Angular's `declareExperimentalWebMcpTool` registers into the extensio | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| - WebMCP tool audit (`research/14` C11, folded in by Lars's ruling of 2026-10-12, section 8; it replaces EXT4). Prompt: "Are my app's tools ready for an agent?" Deterministic rules over `getTools()`,  | structure | unverifiable | Not found: research/14 |
| - a name outside the spec's character set (ASCII letters and digits plus `_`, `-` and `.`, at most 128 code points) **[measured, WebMCP `index.bs`, `research/14` 3.1]**, or over Chrome's recommended 3 | structure | unverifiable | Not found: research/14 |
| - a tool still registered after the user leaves its route, detected as a tool still listed by `getTools()` after a navigation that `router_state` reports **[inferred, `research/14` 3.2]**; | structure | unverifiable | Not found: research/14 |
| - duplicate names: the spec rejects them with `InvalidStateError` **[measured, `index.bs`, `research/14` 3.1]**, and Angular's guide tells developers to expect a throw **[documented, `research/14` 3.4 | structure | unverifiable | Not found: research/14 |
| - Deterministic part: the audit above is code, and so are these checks of each app tool's declaration before any model run: a free-text parameter where an `enum` fits, and a missing `required`. Those  | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| - How: deterministic checks over Tier 0 and Tier 1 data. The model explains each finding: it names the modern Angular pattern and why the flagged use is an anti-pattern or not supported, and writes no | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - `Eager` components (`research/12` D3: not supported, flagged). Since Angular 22.0 a component without `changeDetection` is OnPush (`CHANGELOG.md:859`, measured on the spike app), so `Eager` is an ex | structure | unverifiable | Not found: research/12 |
| - outputs with no template listener (`getListeners`), a heuristic: `getListeners` sees template and host listeners only, so an output subscribed in code shows as unlistened. The finding says that code | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - `@for` blocks whose `trackExpression` is the item itself on object items (`ɵgetControlFlowBlocks` returns `trackExpression`). It checks `@for` only; a `*ngFor` is not supported and gets the legacy r | structure | unverifiable | Not found: research/12 |
| - zone.js loaded while `NgZone` is `NoopNgZone`: `typeof Zone` is defined in an app that passed the zoneless support check (the last `NgZone` provider record is `NoopNgZone`, 3.3 and 3.4). The zone.js | structure | verified | Exists: research/raw/zone-mode-portal.json |
| - Legacy rules, from Lars's rule of 2026-10-12 (section 8): one rule for each legacy form that the tools see differently from its modern form and that a page can reveal (`research/12` section 2, outco | structure | unverifiable | Not found: research/12 |
| - `*ngFor` (`research/12` T2): `ng.getDirectives` on the anchor comments in a component's view returns an `NgForOf` (class name with any leading underscore stripped) **[inferred from source: `ng.getDi | structure | unverifiable | Not found: research/12 |
| - Decorator `@Input()` (`research/12` C1): for each input that `ng.getDirectiveMetadata` lists, the instance property fails `ng.isSignal` **[inferred]**, Tier 0; the class metadata confirms the field: | structure | unverifiable | Not found: research/12 |
| - Decorator queries (`research/12` C3): `propDecorators` entries whose decorator kind (`type.prototype.ngMetadataName`) is `ViewChild`, `ViewChildren`, `ContentChild` or `ContentChildren` without `isS | structure | unverifiable | Not found: research/12 |
| - `Eager` components (`research/12` D3): the `Eager` rule at the top of this list is this rule, and its finding is the "not supported" flag above **[measured: `changeDetection` read on the spike, 02 s | structure | unverifiable | Not found: research/12 |
| - `canLoad` guards (`research/12` R2): a route with a non-empty `canLoad` in `ng.ɵgetRouterInstance(...).config` or in the loaded child routes from `ng.ɵgetLoadedRoutes` **[inferred]**. Tier 1 (router | structure | unverifiable | Not found: research/12 |
| - `RouterModule.forRoot` in a standalone app (`research/12` R3): `ng.ɵgetRouterInstance` is not a function while `ng.getDirectives` on a `router-outlet` element returns a `RouterOutlet` **[inferred]** | structure | unverifiable | Not found: research/12 |
| - Template-driven forms (`research/12` F1): `ng.getDirectives` returns `NgModel` on a form control or `NgForm` on a `<form>` **[inferred]**. Tier 0. Modern form: Signal Forms (`form()`, `[formField]`) | structure | unverifiable | Not found: research/12 |
| - Reactive Forms (`research/12` F2, with `research/12` F3's deprecated sub-APIs reported as F2): `ng.getDirectives` returns `FormControlDirective`, `FormControlName`, `FormGroupDirective`, `FormGroupN | structure | unverifiable | Not found: research/12 |
| - `providedIn: 'any'` and `providedIn: SomeNgModule` (`research/12` I2): a provider record from `ɵgetInjectorProviders` whose class token has `ɵprov.providedIn === 'any'`, or a class with `ɵmod` there | structure | unverifiable | Not found: research/12 |
| - NgModule app (`research/12` S1, with `research/12` S2, S3 and S7): not a finding but the panel's "not supported" notice, like the Zone.js check, and it runs in the startup support check (3.3, `app_f | structure | unverifiable | Not found: research/12 |
| - With the opt-in export (2.2): the router audit and the `canLoad` rule read `config` from the vetted `Router` instead of through `ng.ɵgetRouterInstance`, which has no support statement; the child rou | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Status: `Proofreader` is not defined in Lars's Chrome or Edge builds; `Translator` is `downloadable` and `LanguageDetector` is `available` in both **[measured, 00]**. Proofreading therefore runs on  | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Deterministic part: code collects the visible text per component, drops duplicate strings, runs the Language Detector per string (a task API, no Prompt API session), and batches the remaining string | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Prompt: "Find the component that shows the order total" or "Take me to the settings page and select the theme toggle." | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - Navigation needs `provideRouter`; with `RouterModule.forRoot` the router globals are missing, a form that is not supported (`research/12` R3). | structure | unverifiable | Not found: research/12 |
| - Deterministic part: code filters the components by word overlap between the question and each component's name, selector and visible text, and passes at most 15 candidates (`find_components`, 3.4),  | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - With the opt-in export (2.2): navigation calls the vetted `Router`'s public `navigateByUrl` (still a write behind the confirm, 3.5) and reads the route paths from its `config`, instead of `ng.ɵnavig | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Every answer gets a "Copy for coding agent" action: the question, the tool walkthrough, the facts, and the component source location. Findings go into the copied text as the panel states them (the m | feature | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:43 |
| - `constructor.ɵcmp.debugInfo`, which gives file and line and is what Pangular uses **[measured, 03 section 1.4]**. It is weaker than the Tier 1 functions with a support statement (2.2). It is a field | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Deterministic part: all of it. Code assembles the copied text from the panel's own record of the answer (question, tool calls with arguments, results, location); the optional Summarizer step shorten | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| Taken from `research/08-recent-angular-features.md`, which sources each one in the changelog, GitHub Releases or angular.courses. Experimental and developer-preview Angular features are allowed (Lars' | structure | verified | Exists: research/08-recent-angular-features.md |
| - N15: code reads `FormField.state()` per field (spike S9) and computes which fields block submit (invalid, pending or disabled). The model receives only the blocking fields with their errors, capped  | structure | unverifiable | Not found: research/15 |
| - N16: code finds the boundary whose `@error` view is shown and reads `{$error}` (spike S10) and the owning component's capped inputs. The model receives that one boundary's facts. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - N17: code builds the one navigation's phase list from router events, with the duration of each phase and the route resource that was pending longest. The model receives that list (about 10 lines), n | feature | verified | spikes/ng222-app/node_modules/.vite/vitest/7a7785ec6fcdebf6852283e7e35b5171b95ecf7a/deps/plugins.D2ut1V9b-DDzazuHB.js:4415 |
| - N19: code compares epochs per cycle for the `linkedSignal` node and its source and marks each recompute and each manual `set` that a recompute replaced. The model receives that event list for one `l | command | verified | spikes/ng222-app/node_modules/.vite/vitest/7a7785ec6fcdebf6852283e7e35b5171b95ecf7a/deps/plugins.D2ut1V9b-DDzazuHB.js:4415 |
| - N20: code counts `AfterRender*` profiler events per frame and names the `afterRenderEffect` nodes active in each; a run of frames above a threshold is the finding. The model receives the finding (ef | feature | verified | spikes/ng222-app/node_modules/.vite/vitest/7a7785ec6fcdebf6852283e7e35b5171b95ecf7a/deps/plugins.D2ut1V9b-DDzazuHB.js:4415 |
| - N21: code parses the trace and sums time and count per component in a worker (a trace grows with the recording, 3.7). The model receives the top 10 components as a table, not the trace. | feature | verified | spikes/ng222-app/node_modules/.vite/vitest/7a7785ec6fcdebf6852283e7e35b5171b95ecf7a/deps/plugins.D2ut1V9b-DDzazuHB.js:4415 |
| - N22: code parses the `provideStabilityDebugging()` console lines into pending tasks and groups them by source. The model receives the grouped list, capped at 20 sources. | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| - N23: code computes roles and names (2.2), checks each Aria pattern's rules, and scripts the keyboard probe. The model receives one finding per pattern instance and explains it. | feature | verified | spikes/ng222-app/node_modules/.vite/vitest/7a7785ec6fcdebf6852283e7e35b5171b95ecf7a/deps/plugins.D2ut1V9b-DDzazuHB.js:4415 |
| - N27: code finds each lesson's live example, builds the answer options, records what the app did and grades the prediction. The model receives a fact sheet of about 400 tokens per call, with no tools | structure | verified | Exists: docs/design/tutor.md |
| - N29: code keeps the ring buffer, filters it by level, ranks the messages by word overlap with the question, and caps the result at 20 messages of 200 characters each (3.6). The model receives that c | feature | verified | spikes/ng222-app/node_modules/.vite/vitest/7a7785ec6fcdebf6852283e7e35b5171b95ecf7a/deps/plugins.D2ut1V9b-DDzazuHB.js:4415 |
| - N30: code subscribes to the profiler, decides when the condition is met, and computes the diff (components checked, signals whose epoch changed, each capped at 20). The model receives that diff, nev | feature | verified | spikes/ng222-app/node_modules/.vite/vitest/7a7785ec6fcdebf6852283e7e35b5171b95ecf7a/deps/plugins.D2ut1V9b-DDzazuHB.js:4415 |
| - N31: code reads `ng.ɵgetTransferState(ng.getInjector(<root>))`, which re-reads `<script id="ng-state">` and leaves out Angular's hydration keys (`__nghData__`, `__nghDeferData__`) **[documented in s | structure | unverifiable | Not found: research/16 |
| - N32: all of it is code. At page load code reads `ng-server-context` on the root element (`ssr` or `ssg`) and `ngcm` on `<body>` (client mode) and stores the value with the URL **[measured, `research | structure | verified | Exists: research/raw/ssr-render-modes.json |
| - N33: code reads `window._ejsas.ng` in the page agent before hydration: on the fixture its queue `q` held one entry per early event (`{eventType, targetElement, timeStamp}`), and after hydration `win | structure | verified | Exists: research/raw/ssr-event-replay.json |
| - N34 (`research/17` verdict: supported): code installs `cd_record` in the tester iframe through the page agent, which runs there because the content scripts match the test server's origin with `all_f | structure | unverifiable | Not found: research/17 |
| - N35 (`research/17` verdict: supported for the DOM side): code reads the tester DOM: the `[ng-version]` hosts with their components (`find_components`), and roles and names computed from the DOM (2.2 | structure | unverifiable | Not found: research/17 |
| - N36 (`research/17` verdict: supported with a held or watched test): code runs the same reads (`ng.getComponent`, inputs, signal values, DOM text, `ɵgetInjectorResolutionPath` and the providing injec | structure | unverifiable | Not found: research/17 |
| - N37 (`research/17` verdict: supported): code walks the tester component's resolution path with `di_path` and `di_lookup` (3.4). In the spike, `ɵgetInjectorResolutionPath` gave element (`HTMLDivEleme | structure | unverifiable | Not found: research/17 |
| Legacy forms (`research/12` section 2): | structure | unverifiable | Not found: research/12 |
| - N15 answers only for Signal Forms; template-driven and Reactive Forms directives are not read (`research/12` F1, F2, F3), and N10 flags them. | structure | unverifiable | Not found: research/12 |
| - N17 answers only with `provideRouter` (`research/12` R3) and explains `canMatch` guards; a `canLoad` guard, which runs only before the first load, is not supported (`research/12` R2), and N10 flags  | structure | unverifiable | Not found: research/12 |
| With the opt-in export (2.2) **[inferred design]**: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - N17: reads `Route.resources` from the vetted `Router`'s `config`, `ActivatedRoute.resources` from its `routerState` tree (`router_state.ts:179`, public) and the router events from its `events`, inst | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - N30: `wait_for`'s `navigation` condition reads the vetted `Router`'s `events` (3.4). Tier 2 (app opt-in); the Tier 1 route stays the default. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - N17: Pangular's router view shows each navigation as a story with a phase bar and per-guard verdicts, and its `explain-navigation` tool gives that to an agent. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| Pangular's output goes to an external agent, and the app must install its package and mount its server. New here: an on-device model writes the explanation, and the app installs nothing. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - How: the page agent reads the template node of the selected component in `ng.ɵgetSignalGraph`; that node's `debuggableFn` holds the whole class source (`research/raw/effect-writes.json`). A regex ov | structure | verified | Exists: research/raw/effect-writes.json |
| - Limits: writes through a helper method, through another object, or in minified code are not seen **[inferred]**. Whether the template reads the field is not checked by the regex; the finding is word | structure | verified | Exists: research/13-portal-legacy-audit.md |
| - Adds over Angular DevTools: its property view reads the instance, so it shows the new value next to a page that shows the old one, with no reason **[inferred]**. N24 names the write and the cause. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Not an RxJS flag: RxJS is not legacy (`research/12` X1). The finding is about a plain field written outside change detection; the same write in a `setTimeout` or a `Promise` callback has the same ef | structure | unverifiable | Not found: research/12 |
| - Deterministic part: the regex over `debuggableFn` and the `ng.isSignal` check are code, and so is the finding. The model receives the field name, the component and the matched source text capped at  | feature | verified | spikes/ng222-app/node_modules/.vite/vitest/7a7785ec6fcdebf6852283e7e35b5171b95ecf7a/deps/plugins.D2ut1V9b-DDzazuHB.js:4415 |
| - Tier 1 (`ɵgetSignalGraph` for `debuggableFn`, one of the nine functions with a support statement, from 22.1.3) plus Tier 0 (`ng.getComponent`, `ng.isSignal`). Prompt API with structured output (find | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - How: `list_signals` and `signal_trace` keep the interop nodes that 3.4's library filter would otherwise drop, and code slices the graph around the node in question (Deterministic part, below); the m | structure | verified | Exists: research/raw/tosignal-node-portal.json |
| - What it can explain: that a node comes from `toSignal` (by the `toSignal.*` labels) or from `toObservable` (an effect whose `debuggableFn` contains `subject.error`), the signals a `toObservable` eff | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Adds over Angular DevTools: the signal graph pane draws these nodes with the library's labels and no explanation. N25 says which interop call made each node and where the graph stops. | command | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Not an RxJS flag: RxJS is not legacy (`research/12` X1), and N25 flags nothing. | structure | unverifiable | Not found: research/12 |
| Lars's request (verbatim, 2026-10-12): "Use a subagent to design Angular AI DevTools Tutor." The design is `docs/design/tutor.md`; N27 is not from 08, and its row sits in the N14-N23 table above. | structure | verified | Exists: docs/design/tutor.md |
| - How: a lesson shows a concept, highlights a live example found by a code predicate, asks the learner to predict what the app will do (picking from lists or from the page, never typing code), records | structure | unverifiable | Not found: research/02 |
| - The model rewords shipped text to levels 1-10 and explains the gap between prediction and observation from a fact sheet of about 400 tokens, with no tools; every output passes deterministic checks f | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - Tier 0 + 1; Prompt API with structured output, Rewriter, Translator. Design, risks and spikes: `docs/design/tutor.md`. | structure | verified | Exists: docs/design/tutor.md |
| Every Angular DevTools tab becomes a set of tools, so it can be asked about in chat. These tools repeat what Angular DevTools already shows, so they are not the new part. They also give N1 to N13 thei | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| Note on the Transfer State row: measured on the SSR fixture (`research/16` section 3). `ng.ɵgetTransferState` re-reads `<script id="ng-state">` and leaves out Angular's hydration keys (`__nghData__`,  | structure | unverifiable | Not found: research/16 |
| Note on the watch signal row. Limits **[measured in source, `signal_debug.ts` on 22.2.x]**: `toggleWatchSignal` only writes `console.log("[<name>]:", value)` (line 396; an errored computed goes to `co | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| Legacy forms (`research/12` section 2): the signal graph pane row sees only signal inputs and signal queries (`research/12` C1, C3); the property editing row writes a decorator `@Input()` field as a p | structure | unverifiable | Not found: research/12 |
| With the opt-in export (2.2): the router tree row reads the route config and the active routes from the vetted `Router` (`config`, `routerState`) instead of through `ng.ɵgetRouterInstance`, which has  | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| Reading values, not only detecting: a provider record holds the token and the provider definition, not the instance (`ProviderRecord`, 3.4), so the values this section reads come from one of two place | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - A third place, only in apps that add the opt-in export (2.2, Tier 2): a vetted package class or function from `globalThis`, under the safety rule there. The two places above stay the default. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Detection and data: a MAIN-world shim for `window.__REDUX_DEVTOOLS_EXTENSION__` installed at `document_start`. `provideStoreDevtools()` reads that global in a provider factory and then sends every a | feature | aspirational | Aspirational claim (future/desired state) |
| - Natural-language dispatch: the model proposes `{type, payload}` from observed action shapes; the developer confirms. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:13 |
| - Tier: 0 with the shim if the app has `provideStoreDevtools` or `withDevtools` (common in dev); Tier 1 (third-party) for the `STATE_SOURCE` scan; Tier 2 otherwise for exact history. | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| - With the opt-in export (2.2, `provideAiNgrxDevTools()` and the `@ngrx/signals` entry point): SignalStore state comes from the public `getState` instead of the `STATE_SOURCE` scan, and an app without | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Detection: in the preview iframe, `window.__STORYBOOK_PREVIEW__` (`PreviewWeb.tsx:19` **[measured]**); the story index at `/index.json` **[inferred, 04]**; Storybook MCP at `/mcp` when `@storybook/a | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Out of scope: generating stories, because the extension generates no code (Lars's ruling of 2026-10-12, section 8). | feature | verified | .commandcode/skills/nx-generate/SKILL.md:99 |
| The facts below come from the Vitest Browser spike, `research/17` (2026-10-12, commit `c929050`), run on the counter fixture `spikes/ng222-app` under Angular's `@angular/build:unit-test` builder with  | structure | unverifiable | Not found: research/17 |
| **Detection** **[measured, `research/raw/vitest-attach-gemma4.json`, unless marked]**: | structure | verified | Exists: research/raw/vitest-attach-gemma4.json |
| - Orchestrator page: `http://127.0.0.1:<port>/__vitest_test__/?sessionId=<uuid>`. It has no `window.ng`. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - Tester iframe: `http://127.0.0.1:<port>/?sessionId=<uuid>&iframeId=__vitest_all__`, frame name `vitest-iframe`, attribute `data-vitest="true"`. There is one tester iframe, `__vitest_all__`, because  | structure | unverifiable | Not found: research/04 |
| - Same origin: the orchestrator and the tester share `http://127.0.0.1:<port>`, and a script in the orchestrator read `iframe.contentWindow.ng`, the DOM text and `ng.getComponent(...)` -> `_Counter`. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - The extension detects a Vitest page by the orchestrator URL (`__vitest_test__/`) and the tester frame's `iframeId=` parameter and frame name, which is Tier 0 and enough; it does not need the runner  | feature | verified | .claude/skills/control-angular-devtools/features/attach.md:3 |
| - `openBrowser()` calls `chromium.connectOverCDP(<CDP URL>)` and uses the browser's default context (`browser.contexts()[0]`) as the persistent context, so Vitest's tab opens in the default context, w | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - `close()` closes only the tabs Vitest opened, then disconnects, and the browser keeps running; | feature | verified | spikes/ng222-app/node_modules/@angular/build/node_modules/vite/dist/node/index.d.ts:3744 |
| - the factory turns off `prewarm`, which would otherwise launch a bundled Chromium in parallel (`prewarmBrowser`, `index.js:867-905`) **[documented]**. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| The spike's version is `spikes/ng222-app/vitest-attach.config.mts`, about 30 lines. Angular's `browsers` option cannot carry it: when `browsers` is set, the builder builds its own provider and merges  | structure | verified | Exists: spikes/ng222-app/vitest-attach.config.mts |
| - **It attaches to a real browser only.** It requires a CDP URL. After connecting it checks `browser.version()` and the user agent, and refuses Chromium, Chrome for Testing and HeadlessChrome with a c | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| - **It has an optional launch mode for a branded channel** (`chrome-beta`, `msedge-dev` and so on). Launch mode needs a dedicated `userDataDir` and a debugging port, and refuses to launch without its  | structure | unverifiable | Not found: research/17 |
| - **Internals and peers.** It is the fixture's `CdpAttachProvider`: the default context, a `close()` that closes only its own tabs and disconnects, and no `prewarm`. `vitest`, `@vitest/browser-playwri | feature | verified | spikes/ng222-app/node_modules/@angular/build/node_modules/vite/dist/node/index.d.ts:3744 |
| - Vitest's `connectOptions` cannot reach a CDP browser: it needs a Playwright `launchServer` endpoint **[documented]**. The `preview` provider was not run (below). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| **What the extension sees in the tester iframe, attach route** (Chrome Beta 156, Gemma 4 instance, run at 10:27 UTC) **[measured, `research/raw/vitest-attach-gemma4.json`]**: | structure | verified | Exists: research/raw/vitest-attach-gemma4.json |
| - `LanguageModel` is `available` in the tester iframe's main world, both content-script worlds there, the panel, the service worker and the offscreen document; `devtools_page` reads `unavailable`, as  | config | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - `ng.getComponent`: `_Counter`, `count` 3, `double` 6, `title` "Clicks", `isSignal(count)` true. `ng.ɵgetSignalGraph`: the template node reads `title`, `count`, `double` and the cart's unnamed `items | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| **Restrictions** (what `research/17` did not run): | structure | unverifiable | Not found: research/17 |
| - The attach route ran on Chrome Beta 156 only (156.0.8078.17, the Gemma 4 instance). Edge Dev and Edge stable were not run; the same provider applies to any Chromium browser with a CDP port **[inferr | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| **Features:** N34 (zoneless test-timing explainer), N35 (query mismatch explainer), N36 (test-against-app diff) and N37 (test DI explainer), in the N14-N23 table (section 4) with their `research/17` v | structure | unverifiable | Not found: research/17 |
| - Out of scope: generating tests, test code or test locators, because the extension generates no code (Lars's ruling of 2026-10-12, section 8). Findings name the modern Angular pattern and why. | feature | verified | .commandcode/skills/nx-generate/SKILL.md:99 |
| - Tier: reading `window.__vitest_browser_runner__` (config, provider, session id) is Tier 1 (third-party), because Vitest's own `esm-client-injector.js` sets it and no public entry point exports it (2 | structure | unverifiable | Not found: research/17 |
| - Considered alternative, decided: no plugin. The extension works attached to a real Chrome Beta instance **[measured, `research/raw/vitest-attach-gemma4.json`; attach route above]**, so by the rule L | structure | verified | Exists: research/raw/vitest-attach-gemma4.json |
| - Detection: only the `/_analog/` URLs identify Analog: server function calls to `/_analog/fn/:id`, and page endpoints under `/_analog/pages/`, or `/api/_analog/pages/` when the app has an API directo | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - The opt-in export (2.2) does not help here: `@analogjs/router` does not export `DEBUG_ROUTES` (2.2, "Not on the list"). | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Tier 0 for network patterns; Tier 1 (third-party) for the `DEBUG_ROUTES` lookup by token name, which reads Analog's internal token through `ɵgetInjectorProviders`; opt-in for `withDebugRoutes()`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - With the opt-in export (2.2, `provideAiRxAngularDevTools()`, a working name): `RxStrategyProvider` is matched by identity instead of by token name, and since it is `providedIn: 'root'` **[measured,  | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Caveat: RxAngular's peer range was Angular `^21` when checked, so 22.2 support is unverified **[measured peer range, 04 section 5]**. Lowest priority. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Edge stable with Phi-4-mini (9337), because Edge Dev 157 does not serve Phi-4-mini (00). The 9337 port is in `.claude/skills/control-ai-browsers/instances.json`; 00's table still lists the retired E | structure | verified | Exists: .claude/skills/control-ai-browsers/instances.json |
| The `control-ai-browsers` skill launches, checks and stops them. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:22 |
| - Had Lars ruled Tier 1 out, these would need an app-side re-export (Tier 2): | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - N7's CD and signal parts, N7's router events (router trio), N10's `@for` check, N10's zone.js rule, the zoneless support check in `app_facts` (3.3; a Tier 0 fallback is under the Tier 0-only release | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - N28's change-detection part (`cd_record`), N30 (`wait_for`, 3.4), and N9's route rule in the WebMCP tool audit (`router_state`) (added 2026-10-12 from `research/14`). | structure | unverifiable | Not found: research/14 |
| - N31 (`ɵgetTransferState`; without it, Resource Timing alone cannot tell a cache hit from a request that was never made) and N33 (the `window._ejsas` queue) (added 2026-10-12 from `research/16`). | structure | unverifiable | Not found: research/16 |
| - N34 (`cd_record`, `ɵsetProfiler`), N36's providing injectors (`test_app_diff`) and N37 (`di_path`, `di_lookup`) (added 2026-10-12 from `research/17`). | structure | unverifiable | Not found: research/17 |
| - N27's Tier 1 lessons: everything about signals, change detection, DI, `@defer`, hydration and the router (`docs/design/tutor.md` section 8). | structure | verified | Exists: docs/design/tutor.md |
| - The third-party lookups: Analog's `DEBUG_ROUTES` token (6.4), RxAngular's `RxStrategyProvider` by token name (6.5), the NgRx `STATE_SOURCE` scan (6.1), and reads of the `__STORYBOOK_PREVIEW__` (6.2) | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Of these, the ones that rest on Tier 1 with no support statement (2.2), and so are the most likely to break on an Angular update: the watch signal row and N19 (`toggleWatchSignal`); `router_state`,  | structure | verified | Exists: docs/design/tutor.md |
| - Of those items with no support statement, the opt-in export (2.2, Tier 2) replaces these for apps that opt in **[inferred design]**: the router trio's `ɵgetRouterInstance` and `ɵnavigateByUrl` in `r | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Among the items in the list above, these rest only on the nine functions with a support statement: N1, N3, N14, N20, N25, EXT1, EXT3 and EXT5; N7's CD and signal parts; N28's change-detection part a | structure | verified | Exists: docs/design/tutor.md |
| - The zoneless support check (3.3) is Tier 1. With Tier 0 alone, an app can be confirmed zoneless only when zone.js is not loaded (Zone.js change detection needs zone.js) **[inferred; not checked in s | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - N10's zone.js rule is Tier 1 (3.4, `app_facts`); a Tier 0 version would fire only on the explicit-provider case that Angular already warns about in the console. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Left out although they are Tier 0: N8, which waits on spike S5; N21, which needs the `debugger` permission; and the full accessibility tree for N10 and N23, for the same reason. Leaving out `debugge | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Edge Dev with Aion-1.1-Instruct is the reference for native tool calling: 15/15 runs at 3-6 s. In S1 phase 2, though, Aion picked the wrong tool on one question in all seven extension contexts **[me | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Gemini Nano (fallback loop on GPU, 11/15 after the `916fc09` regrade, one of them a garbled answer that its check accepts, section 9) and Phi-4-mini on Edge stable stay supported on the structured-o | structure | verified | Exists: spikes/probes/regrade.mjs |
| 3. **Writes from chat.** Decided by Lars (2026-10-12, Rulings below): allowed behind a per-action confirm and a read-only switch (section 3.5). Rejected for the record: a read-only first release (B),  | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| 4. **Vitest attach provider in the companion package.** Decided by Lars (2026-10-12, Rulings below): ship. The question was whether the Playwright provider subclass that the Vitest attach route needs  | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - It attaches to a real browser only: it requires a CDP URL, refuses Chromium, Chrome for Testing and HeadlessChrome after checking `browser.version()` and the user agent, and, with the opt-in `requir | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:38 |
| - An optional launch mode for a branded channel (`chrome-beta`, `msedge-dev`) needs its own `userDataDir` and a debugging port, and the extension must already be installed in that profile (Chrome 136  | structure | unverifiable | Not found: research/17 |
| - "By any browser, I mean Edge, Edge Dev, Chrome, and Chrome Beta. Not Firefox because it doesn't support Prompt API so isn't relevant for this project." | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - (2026-10-12) "We are okay to abandon legacy Angular features like NgZone/zone.js (supporting zoneless only), NgModules, class-based vs. functional, template-based forms, and Reactive Forms, and only | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - (2026-10-12) "Decision 3: Option A." Claude's note: writes from chat stay allowed behind a per-action confirm that shows the exact tool and arguments, with a read-only switch that removes every writ | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - (2026-10-12) "Consider constructor injection a legacy feature." Claude's note: constructor injection joins the legacy list in `research/12` (row C5); a dev page shows it per class through a non-empt | structure | unverifiable | Not found: research/12 |
| - (2026-10-12) "If a feature we consider *legacy* works the same from a runtime DevTools perspective, leave it working without any flag. Just don't explicitly list it as supported and if it starts to  | structure | unverifiable | Not found: research/12 |
| - (2026-10-12) "While `@Service` is the modern API, `@Injectable` is an exception to the legacy rule, meaning we support `@Injectable`. For both decorators, both singletons (`providedIn: 'root'` and ` | structure | unverifiable | Not found: research/12 |
| - (2026-10-12) "We don't support `@angular/upgrade` apps." Claude's note: section 1 lists hybrid AngularJS apps as unsupported. The panel needs no check of its own for them: a hybrid app provides `NgZ | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| - (2026-10-12) "Blocked items 1-2: Approve recommendation." Claude's note: item 1 adds the opt-in export as a stretch Tier 2 prerequisite, like WebMCP (2.2); item 2 builds an SSR fixture and runs the  | structure | verified | Exists: docs/afk-run-2026-10-12.md |
| - (2026-10-12) On who writes the export: "Angular AI DevTools publishes an npm package with a `provideAiDevTools()` function or similar." Claude's note: the developer does not write the object; the ap | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - (2026-10-12) "Skill naming: Approve recommendation." Claude's note: the recommendation was to keep the `verify-*` skill names and add a thin `.claude/skills/verify/` router. Claude has added the `ve | structure | unverifiable | Not found: .claude/skills/verify/ |
| - (2026-10-12) "Remove the `verify` routing skill" Claude's note: removed. Claude Code (2.1.286 and later) runs a project skill named `verify` before every commit that changes more than docs or tests, | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Extension contexts ran one question each in S1 phase 2 (11). Not checked there: whether `create()` from the service worker needs user activation when the model is `downloadable`, session lifetime in | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Three Angular 22.2.2 apps were run: the counter app (`spikes/ng222-app`; S2 and the benchmark), the ng-journal insurance portal (S3 sizes and router navigation, 05; the zone-mode probe, `research/ra | structure | verified | Exists: spikes/ng222-app |
| - The benchmark's checks are loose, so a pass is not always a correct answer: | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| - Question 1's check (`//b(2\|two)/b/i`, `spikes/probes/bench.js`) passes any text that contains a standalone "2" or the word "two", including code text with no answer. Only the dependency question was | structure | verified | Exists: spikes/probes/bench.js |
| - Question 2's check passes any answer containing "Clicks". One Nano GPU fallback pass (question 2, third run) is the garbled answer "The input 'title' is connected to the 'Clicks' output." after a co | structure | verified | Exists: research/raw/bench/nano-gpu.json |
| - The non-Nano passes are real answers. Every passing run of Aion, Phi-4-mini and Gemma 4 (GPU and CPU), 83 runs, made at least one tool call **[measured, read run by run from `research/raw/bench/*.js | structure | unverifiable | Not found: research/raw/bench/*.json |
| - SSR ran on the dev server only: what a production server sends for a route prerendered at build time was not run (N32). Also not run: the moment at which N33's page agent reads the event replay queu | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| **Not reachable from a browser extension (SSR, `research/16`).** These facts stay on the server or are gone by the time the extension can look, so no feature answers them: | structure | unverifiable | Not found: research/16 |
| - Server-only DOM work, such as the fixture's `?mismatch=1` `<div>`: the browser sees only its effect, the mismatch (N5) **[measured, `research/raw/ssr-hydration.json`]**. | structure | verified | Exists: research/raw/ssr-hydration.json |
| - The server's view of `REQUEST` and `RESPONSE_INIT`, and the server route table (`app.routes.server.ts`): the page carries only the result, `ng-server-context` or `ngcm` (N32) **[measured, `research/ | structure | verified | Exists: research/raw/ssr-render-modes.json |
| - Requests the server made and did not cache (POST, requests with auth headers, `transferCache: false`): they leave no trace in `ng-state` (N31) **[measured for `transferCache: false`, `research/raw/s | structure | verified | Exists: research/raw/ssr-transfer.json |
| - What was replayed after hydration (N33) **[measured, `research/raw/ssr-event-replay.json`]**. | structure | verified | Exists: research/raw/ssr-event-replay.json |
| - The `ngh` markers and the event replay queue after hydration: removed or emptied, so reachable only from the server HTML or a MAIN-world script that runs from `document_start` **[measured, `research | structure | verified | Exists: research/raw/ssr-render-modes.json |
| - From an isolated-world content script: `__ngDebugHydrationInfo__` (a DOM expando), `ngDevMode`, `window.ng` and `window._ejsas` are page JavaScript state, so only the MAIN-world page agent reads the | structure | unverifiable | Not found: research/11 |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Status: draft, not filed. Found 2026-10-11 during spike S2 (`docs/feature-proposals.md` section 7). | structure | verified | Exists: docs/feature-proposals.md |
| **What happens:** the in-page AI tool `angular:di_graph` (`packages/core/src/debug/ai/di_graph.ts`, registered through `devtoolstooldiscovery` by `registerAiTools()` in dev mode) serializes every elem | command | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| **Evidence:** the two reproduction snippets above are self-contained; the issue text needs nothing else. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| (For Lars only, leave out of the filed issue: the spike app is `spikes/ng222-app` and the probe results are in `research/05-spikes.md`, both in this repository.) | structure | verified | Exists: spikes/ng222-app |
| **Added 2026-10-11 (measured):** Angular DevTools 1.22.0's signal graph pane shows the same loss. Before `angular:di_graph` it shows 6 nodes for the component; after it, 2 nodes (`count`, `effect`), w | structure | verified | Exists: .claude/skills/verify-angular-devtools/ |
| Status: draft, not filed. Found 2026-10-11 while building `.claude/skills/control-pangular-inspector`. | structure | verified | Exists: .claude/skills/control-pangular-inspector |
| **Versions:** `@pangular-inspector/devtools` 0.0.7 (npm), source read at clone commit 76c09d0; Nx 23.1.1, Angular 22.2.2, npm 11.16.0, Node 24.18.0, Windows 11 arm64. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| **What happens:** `sourceRoots()` (`packages/devtools/src/rpc/source-scan.ts:313`) collects `sourceRoot` / `root/src` from `angular.json` projects, plus `<cwd>/src`. An Nx workspace configures project | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| npx pangular mcp --root .                      # get-components -> [] | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| npx pangular mcp --root apps/insurance-portal  # get-components -> 4 app-shell components; stderr warns "no angular.json and no package.json that depends on @angular/core" | command | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| The panel dashboard shows 0 components, routes, signals and providers "discovered in source" while the live tabs work. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| **Expected:** read Nx `project.json` files (`sourceRoot`, or `root` + `src`) next to `angular.json`, or accept several `--root` folders. | feature | aspirational | Aspirational claim (future/desired state) |
| **Evidence:** `.claude/skills/control-pangular-inspector/features/source-scan.md`; rerun with `node .claude/skills/control-pangular-inspector/scripts/control.mjs scan get-components [--root apps/insur | structure | verified | Exists: .claude/skills/control-pangular-inspector/features/source-scan.md |
| Status: draft, not filed. Found 2026-10-11 while building `.claude/skills/control-pangular-inspector`. | structure | verified | Exists: .claude/skills/control-pangular-inspector |
| **Versions:** `@pangular-inspector/devtools` 0.0.7 (npm); `list-components` added in clone commit 20ebbb9; Node 24.18.0, Windows 11 arm64. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| **What happens:** `apps/docs/src/content/agents/tools.md` documents `list-components`. `tools/list` on `pangular dev --read-only` from the npm 0.0.7 package returns 46 tools without it; the tool was a | structure | unverifiable | Not found: docs/src/content/agents/tools.md |
| **Reproduction** in an Angular app with the package installed (`npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7`): | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| node node_modules/@pangular-inspector/devtools/bin.mjs dev --port 9999 --no-open --root . --read-only | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| curl -s http://localhost:9999/__mcp -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H 'Origin: http://localhost:9999' -d '{"jsonrpc":"2.0","id":1,"method":"tools/ | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| The measured run used the skill's client, `node .claude/skills/control-pangular-inspector/scripts/control.mjs tools`, which sends the same JSON-RPC request; the `curl` line is its equivalent and was n | structure | verified | Exists: .claude/skills/control-pangular-inspector/scripts/control.mjs |
| **Evidence:** `.claude/skills/control-pangular-inspector/SKILL.md:172` (0.0.7 has no `list-components`; added in 20ebbb9; 46 tools with `--read-only`). | structure | unverifiable | Not found: .claude/skills/control-pangular-inspector/SKILL.md:172 |
| Status: draft, not filed. Found 2026-10-11 in the root-cause reading of Gemini Nano's "unable to create a session" error (`research/09-nano-tool-session-error.md`, Q3 and Q5; measured behaviour in `re | structure | verified | Exists: research/09-nano-tool-session-error.md |
| **Versions:** Chrome Beta 156.0.8078.17 on Windows 11 arm64, model `v3Nano`. Source read at tag `156.0.8078.17`; the same checks are present on `main` at `157.0.8100.0` with shifted line numbers (09). | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| - `LanguageModel::ExecuteAvailability` always sends an empty `tools` vector to the browser (`third_party/blink/renderer/modules/ai/language_model.cc`, L659-L686, L674). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - `AIManager::CanCreateLanguageModel` runs its only tool gate, `!base::FeatureList::IsEnabled(kAIPromptAPIToolUse)`, only when `options->tools` is non-empty (`chrome/browser/ai/ai_manager.cc`, L774-L7 | feature | aspirational | Aspirational claim (future/desired state) |
| The snippet restates the probe matrix in 05; it was not run in this exact form (inferred). | feature | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:43 |
| **Expected:** `availability()` returns `unavailable` for the tool types when `create()` would refuse them. | feature | aspirational | Aspirational claim (future/desired state) |
| **Existing reports:** 09 found none. The Chromium tracker's search needs sign-in, and web search with `site:issues.chromium.org` had no hits. crbug 422803232 ("Implement function calling support in ch | feature | aspirational | Aspirational claim (future/desired state) |
| **Evidence:** the source links in `research/09-nano-tool-session-error.md` Q3 and Q5 are public and self-contained. | structure | verified | Exists: research/09-nano-tool-session-error.md |
| Status: draft, not filed. Found 2026-10-12 in spike S1 phase 2 (`research/11-spike-s1-extension-contexts.md`, "Finding: camelCase tool names crash Gemma 4's model process"). | structure | verified | Exists: research/11-spike-s1-extension-contexts.md |
| **Reproduction** in a page tab on the Gemma 4 instance, one fresh session per variant, run 70 s apart so Chrome's crash backoff cannot affect a later variant (the S11 matrix, `spikes/probes/tool-name- | structure | verified | Exists: spikes/probes/tool-name-matrix.js |
| tools: [{ name, description: 'Returns how many Angular components are on the page.', inputSchema }], | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| The snippet restates the matrix's calls; the script adds the 70 s wait, a 120 s timeout and `destroy()` per session. | feature | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:43 |
| **Evidence:** `research/raw/tool-name-matrix-gemma4-gpu.json` (the five-variant matrix), `research/s1-results/chrome-gemma4-tool-name-pair.json` (the earlier pair) and `research/s1-results/chrome-gemm | structure | verified | Exists: research/raw/tool-name-matrix-gemma4-gpu.json |
| **What happens:** `Textarea.onInit` (`fesm2022/openng-optimus-ui-textarea.mjs`) runs `this.ngControl.valueChanges.subscribe(...)` whenever an `NgControl` is injected on its host. The Signal Forms `For | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| import { Component, signal } from '@angular/core'; | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| import { form, FormField, required } from '@angular/forms/signals'; | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| import { TextareaModule } from '@openng/optimus-ui/textarea'; | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| export class Repro { | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| **What happens, part 2 (styling):** at runtime `FormField` writes every name in `CONTROL_BINDING_NAMES`, including `invalid`, to matching directive inputs (`cvaControlCreate` in `packages/forms/signal | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| **Expected:** a control library written for `ControlValueAccessor` either works with Signal Forms' metadata bindings (types that accept them, or inputs named differently) or documents the combination; | feature | aspirational | Aspirational claim (future/desired state) |
| Status: draft, not filed. Found 2026-10-12 in the prior-art survey (`research/14-ai-devtools-prior-art.md`, sections 3.1 and 6). | structure | verified | Exists: research/14-ai-devtools-prior-art.md |
| **What happens:** the WebMCP spec draft (`webmachinelearning/webmcp` `index.bs` at `d0e4e0e`) defines `ToolAnnotations` with `readOnlyHint`, `untrustedContentHint`, `consequentialHint` and `debugging` | structure | unverifiable | Not found: research/14 |
| **Expected:** Angular's `Annotations` mirrors the spec's `ToolAnnotations`, or documents why `debugging` is left out. | feature | aspirational | Aspirational claim (future/desired state) |
| **Evidence:** research/14 section 3.1 (spec IDL and Angular source lines). Re-check both at their current heads before filing. | structure | unverifiable | Not found: research/14 |
| Status: draft, not filed. Found 2026-10-12 (`research/14`, sections 3.1 and 6). | structure | unverifiable | Not found: research/14 |
| **Evidence:** research/14 section 3.1. Re-check the page and the spec's current head before filing; the spec may have moved. | structure | unverifiable | Not found: research/14 |
| Status: draft, not filed. Found 2026-10-12 (`research/14`, sections 1.18 and 6). | structure | unverifiable | Not found: research/14 |
| **What happens:** Playwright's source defines `browser_webmcp_list` and `browser_webmcp_call` (capability `core`, on by default, turned off with `--no-webmcp`), and every snapshot response lists the p | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:109 |
| **Evidence:** research/14 section 1.18 (`webmcp.ts` strings). Re-check the README at its current head before filing. | structure | unverifiable | Not found: research/14 |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Research and design for an AI-assisted Angular DevTools browser extension (Chrome and Edge). It uses the browser's built-in AI (the Prompt API with tool calling and structured output; Summarizer, Rewr | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - **Deliverable:** `docs/feature-proposals.md`, about 1,080 lines. | structure | verified | Exists: docs/feature-proposals.md |
| - **Design doc:** `docs/design/tutor.md` (N27, Angular AI DevTools Tutor). | structure | verified | Exists: docs/design/tutor.md |
| - `research/00` to `research/17`; | structure | unverifiable | Not found: research/00 |
| - raw data in `research/raw/`; | structure | verified | Exists: research/raw/ |
| - spike results in `research/s1-results/`. | structure | verified | Exists: research/s1-results/ |
| - **Upstream reports:** `docs/filing-ledger.md`, ten drafts. **None is filed**, and filing needs Lars's explicit yes. | structure | verified | Exists: docs/filing-ledger.md |
| - **Run log:** `docs/afk-run-2026-10-12.md`, which holds every decision Claude made and every ruling, with times. Its "Decision log" table is the place to append. | structure | verified | Exists: docs/afk-run-2026-10-12.md |
| - `spikes/probes/`: bench.js, regrade.mjs, arg-repair-replay.mjs, and the zone-mode, effect-writes, tosignal, ssr-* and vitest-* probes. | structure | verified | Exists: spikes/probes/ |
| - `spikes/ng222-app`: the counter, plus Vitest Browser tests. | structure | verified | Exists: spikes/ng222-app |
| - `spikes/ng222-ssr`: the SSR fixture. | structure | verified | Exists: spikes/ng222-ssr |
| - `spikes/s1-extension`: the test extension. | structure | verified | Exists: spikes/s1-extension |
| - **Skills (project):** in `.claude/skills/`: | structure | verified | Exists: .claude/skills/ |
| The browser instance registry is `.claude/skills/control-ai-browsers/instances.json`. Instances: chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337. Profiles are on | structure | verified | Exists: .claude/skills/control-ai-browsers/instances.json |
| - **S16:** lookup by an exported first-party class (`Meta`), on the counter with the export added by hand. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - **S19:** rerun `bench.js` with argument repair on. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **Probe steps:** S14 and S15 are written in `research/15` section 4. | structure | unverifiable | Not found: research/15 |
| 2. **Tutor spikes TS1-TS12.** These are in `docs/design/tutor.md` section 10; TS1 and TS2 are the riskiest. | structure | verified | Exists: docs/design/tutor.md |
| 3. **Fold every spike result into the proposals.** Add a raw file under `research/raw/`, relabel claims from inferred to measured only with that file, and log the result in the AFK log. | structure | verified | Exists: research/raw/ |
| 4. **A final closed-findings check** over everything changed since `0647e96`, before calling the proposals done. Use one reviewer, briefed like `tmp/review/round10-brief-closed.md`. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - **Agents and models:** ask Lars before spawning any `fable-*` agent; in AFK mode, use `opus-*` instead. (Memory file `fable-needs-approval.md`.) | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - **Shared files:** never run `git checkout`, `git restore` or any whole-file revert on a file a running agent may be editing. (Memory file `no-checkout-shared-files.md`.) Keep one writer per file. Su | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| - **Browsers:** close every browser, tab and dev server you start. Leave Lars's everyday Chrome and Edge, and his app on port 4200, alone. Memory on this machine is tight, so run one dev server at a t | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - The extension generates no code of any kind. Findings name the "modern Angular pattern" and why, and may name an official Angular schematic. Never write "ordained" or "blessed" outside verbatim quot | feature | verified | .commandcode/skills/nx-generate/SKILL.md:99 |
| - **No project skill named `verify`.** Claude Code runs it before every commit; Lars had the router removed. The bundled `/verify` can recreate one at `.claude/skills/verify/` if it is ever run here. | structure | unverifiable | Not found: .claude/skills/verify/ |
| - **Gates:** no push, no PR, and no filing of ledger drafts without Lars's explicit yes. Commit as the gmail identity in `git config user.email`. Never write his work address or its domain anywhere. | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:108 |
| - **`lars-mode`:** working rules, delegation and AFK runs. Use its review-round playbook for any further review. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - **`control-ai-browsers` / `verify-ai-browsers`:** for any spike that needs a model (S14, S15, S20, S23, the tutor spikes). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| All results below are **measured**. The probe ran in a normal page tab (`https://example.com`) through playwright-cli attached to Lars's Chrome. It did NOT run in an extension context, so this is page | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| Conclusion: in this browser and flag state, native tool execution is not active. A design that depends on native tool calling must also work through a fallback loop built on structured output (the mod | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| Not changed: both stable browsers were running (Chrome 23 processes, Edge 20), so editing `Local State` would be overwritten on exit, and the automation extension cannot open `chrome://flags`. This ne | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:41 |
| - Model: **Aion-1.1-Instruct**. Source: `Edge Dev/User Data/EdgeLLMOnDeviceModel/2026.10.2.1/manifest.json` has `"name": "Aion-1.1-Instruct"`. It is an ONNX model (`model.onnx`), and its variant folde | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `create()` with `tools` throws `TypeError: When tools are provided, expectedOutputs must include {type: "tool-call"}` unless `expectedOutputs: [{type:'text'},{type:'tool-call'}]` and `expectedInputs | feature | aspirational | Aspirational claim (future/desired state) |
| - `prompt()` then resolves to an array of `{ type: 'tool-call', value: LanguageModelToolCall }`. The value's fields are getters, so `JSON.stringify` shows `{}`; read `name`, `callID` and `arguments` d | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - Probe scripts: `spikes/probes/probe5.js` / `spikes/probes/probe6.js` (first written in the session scratchpad, now tracked there). | structure | verified | Exists: spikes/probes/probe5.js |
| After the download (probe `probe8.js`): | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **(Superseded, see the correction below.)** First reading: the downloaded model looked like Gemini Nano. `OptGuideOnDeviceModel/2025.8.8.1141/manifest.json` has `"name": "v3Nano"` (4.0 GB). This is  | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - The `v3Nano` folder above is an older download from 2025. The model downloaded today is in the manifest-broker folder: `OptGuideManifestModel/7feacbfe.../2026.8.7.929/manifest.json` names **`gemma4- | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Full round trip on Gemma 4 (`probe10.js`, the same two tools as on Edge Dev): | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Gemma 4 quirks: tool calls arrive with **`callID: ""`** (empty string), and `LanguageModelToolSuccess` accepts that. **`promptStreaming()` on a tool session fails** with `kErrorUnknown`, so use `pro | structure | verified | Exists: docs/feature-proposals.md |
| - Any extension context (DevTools panel, side panel, service worker, offscreen document). Answered: see `research/11-spike-s1-extension-contexts.md` (spike S1). | structure | verified | Exists: research/11-spike-s1-extension-contexts.md |
| Lars asked: "Could we manage multiple Chrome Beta instances - one with Nano and one with Gemma?" and "Same for Edge Dev with Phi-4-mini and Aion-1.1-Instruct." Each instance runs with its own `--user- | config | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - A fresh profile has Chrome's internal debugging pages off, so `chrome://on-device-internals` shows "Internal debugging pages are currently disabled". Turn them on once per profile with the "Enable i | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - Starting the download needs a real user gesture. In the Phi-4-mini instance, pointer clicks from playwright-cli time out (on page buttons and on the internals tabs), but keyboard input works: focus  | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Every criterion passes: performance class High, device capable, 62,956 MiB free against 20,480 required. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - Inferred, not checked: Edge Dev 157 does not currently serve the release ("default", expected Phi-4-mini) component, so the download never starts. Edge stable 155 might; it has not been tried. Super | feature | aspirational | Aspirational claim (future/desired state) |
| Both drives are partitions of the same physical disk, a WD `SDDPTQD-1T00-1124-WD` NVMe SSD. C: is NTFS (666 GB); D: is ReFS (285 GB), Lars's Dev Drive (`fsutil devdrv query` needs admin, so not confir | feature | verified | .claude/skills/control-ai-browsers/features/README.md:12 |
| The probe `spikes/probes/read-throughput.ps1` reads 1 GB sequentially in 4 MB blocks with `FILE_FLAG_NO_BUFFERING`, so the Windows file cache is bypassed. Both targets are identical copies of Aion's ` | structure | verified | Exists: spikes/probes/read-throughput.ps1 |
| D: reads about 30% slower. At these rates, loading Aion (1.3 GB) takes about 0.6 s from C: and 0.85 s from D:; Gemini Nano (4 GB) about 1.8 s against 2.6 s. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| The weights are read when a session first loads the model. Inference afterwards runs from memory or GPU, so the drive affects cold `create()` only (inferred). The cause of the ReFS gap is not isolated | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| Lars asked: "Have you exhausted all options to make Phi-4-mini work in Edge Dev?" and "Find research that confirms whether Aion will replace Phi-4-mini in Edge". | feature | aspirational | Aspirational claim (future/desired state) |
| Microsoft's own statements (page reads via markdown.new): | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Edge Prompt API docs (`https://learn.microsoft.com/en-us/microsoft-edge/web-platform/prompt-api`, updated 2026-10-06) say: "By default, the Prompt API uses the Phi-4-mini model." Aion-1.0-Instruct i | config | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Windows App SDK docs (`https://learn.microsoft.com/en-us/windows/ai/apis/phi-silica`, updated 2026-10-02) say: "Phi Silica is being replaced by Aion Instruct". The timeline: a sideloadable package i | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| Reading (inferred): no source states that Aion replaces Phi-4-mini in Edge. The measurement shows Edge Dev 157 already ships Aion-1.1 as its default. Windows is replacing its own on-device model with  | feature | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:43 |
| Results (measured with `spikes/probes/relaunch-instance.ps1` and `broker-state.js`): | structure | verified | Exists: spikes/probes/relaunch-instance.ps1 |
| 2. **A Low-class device:** stored class seeded to 2 with the profile closed (`spikes/probes/seed-perf-class.mjs`), the manifest folder deleted, then a restart. The class stayed 2, and Edge downloaded  | structure | verified | Exists: spikes/probes/seed-perf-class.mjs |
| - `services/on_device_model/public/mojom/on_device_model_service.mojom:49-56` defines three backends: `kGpu` (WebGPU), `kApu` ("Only available on devices with APU, and need special APU model files"),  | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:109 |
| - It reads the execution provider from the model's `genai_config.json`. Aion's config says `"provider_options": [{"webgpu": {...}}]`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - The runtime's strings mention "the QNN EP package" (Qualcomm's NPU provider). `msedge.dll` also contains `QNNExecutionProvider` and Windows ML provider-download calls (`EnsureExecutionProviderReadyA | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - So in principle, editing `genai_config.json` could point Aion at QNN (NPU) or at CPU (an empty provider list). Inferred: QNN usually needs a model quantized and compiled for the NPU, and Aion ships  | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Next step: run `spikes/probes/set-genai-provider.mjs` (webgpu, qnn, cpu) on the standing Aion instance with `ep-prompt.js` and `engine-sampler.ps1`, once that instance is free, and restore `webgpu`  | structure | verified | Exists: spikes/probes/set-genai-provider.mjs |
| - Windows' own on-device model runs on the Snapdragon NPU through the Windows App SDK: Phi Silica today, Aion Instruct from the November 2026 Insider rollout (`research/00`, "Phi-4-mini in Edge Dev 15 | structure | unverifiable | Not found: research/00 |
| - WebNN with `deviceType: 'npu'` (Edge flag `webnn-onnxruntime`: "Enables using ONNX Runtime for CPU, GPU and NPU inference with the WebNN API") runs a model the page supplies itself, not the browser' | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `spikes/probes/ep-trials.sh` sets the provider list in Aion's `genai_config.json` with `set-genai-provider.mjs`. It restarts the instance through `control-ai-browsers` `stop` and `launch`, runs one pr | structure | verified | Exists: spikes/probes/ep-trials.sh |
| - **Aion can run on CPU in Edge**, but only by editing the downloaded component's config. That is unsupported, and an update of the component overwrites it. Chromium's `OnDeviceModelForceCpuBackend` r | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - **NPU through QNN: no** with this model. Inferred: QNN needs a model compiled for the NPU, and Aion ships as WebGPU fp16. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - The trial runs reported `launch` exit 127, from a libuv assertion after a successful launch. Fixed in `control.mjs`, then re-driven: exit 0. | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| The rule "a tool with empty `properties` makes every Gemma 4 tool prompt fail" is not established. Spike S1 phase 2 (`research/11`) measured Gemma 4's model process crashing with `kErrorUnknown` on ca | structure | unverifiable | Not found: research/11 |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 5. DevTools already uses the on-device Prompt API itself (Console Insights teasers, `BuiltInAi.ts`), which is the closest precedent. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Explainer (spec README): https://github.com/webmachinelearning/prompt-api (read raw README, `main`, fetched 2026-10-11) -- "S1" | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - Chrome docs: https://developer.chrome.com/docs/ai/prompt-api ("Last updated: August 26, 2026") -- "C1" | structure | unverifiable | Not found: docs/ai/prompt-api |
| - [measured, S1] Edge also has an experimental implementation (link to https://learn.microsoft.com/en-us/microsoft-edge/web-platform/prompt-api). Chromium status in S1's stakeholder section still says | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - [measured, S1/C1] `LanguageModel.availability(options)` -> `"unavailable" \| "downloadable" \| "downloading" \| "available"`. Pass the same options you will pass to `create()`/`prompt()` (C1 calls this | feature | aspirational | Aspirational claim (future/desired state) |
| - [measured, C1] Triggering the download needs **user activation** (C1 links to /docs/ai/get-started#user-activation). | structure | unverifiable | Not found: docs/ai/get-started#user-activation |
| - [measured, S1/C1] Legacy `temperature` / `topK` and `LanguageModel.params()` (returns e.g. `{defaultTopK: 3, maxTopK: 128, defaultTemperature: 1, maxTemperature: 2}`) are **deprecated but still func | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - [measured, S1/C1] `session.append(messages)` pre-processes context without generating; can trigger overflow eviction. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:41 |
| - [measured, S1/C1] `session.prompt(input, { signal, responseConstraint, omitResponseConstraintInput, thinking })` returns a string; `session.promptStreaming(...)` returns a `ReadableStream` (async-it | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - [measured, C1] `expectedInputs[].type`: `text`, `image`, `audio`. `expectedOutputs[].type`: `text` only (S1 adds `tool-call` for tools, see below). `languages`: Chrome accepts `"en"`, `"ja"`, `"es"` | feature | aspirational | Aspirational claim (future/desired state) |
| - [measured, C1] **Audio input requires a GPU** in Chrome. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:38 |
| - [measured, C1] Chrome's page links a dedicated guide: https://developer.chrome.com/docs/ai/structured-output-for-prompt-api (not read here). | structure | unverifiable | Not found: docs/ai/structured-output-for-prompt-api |
| - [measured, S1] The model may emit several tool calls at once (parallel calls). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - [measured, S1] `measureContextUsage` counts control tokens, accepts multimodal arrays and an abort `signal`. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - https://chromium.googlesource.com/chromium/src/+/refs/heads/main/chrome/browser/flag_descriptions.h -- "F1" | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - https://chromium.googlesource.com/chromium/src/+/refs/heads/main/chrome/browser/about_flags.cc -- "F2" | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/platform/runtime_enabled_features.json5 -- "R1" | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Edge docs: https://learn.microsoft.com/en-us/microsoft-edge/web-platform/prompt-api (updated_at 2026-10-06) -- "E1" | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - Edge blog 2026-06-02: https://blogs.windows.com/msedgedev/2026/06/02/expanding-on-device-ai-in-microsoft-edge-new-models-and-apis-for-the-web/ -- "E2" | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - [measured, C1] Default model: **Gemini Nano** ("The Prompt API uses the Gemini Nano model in Chrome"). C1 gives no Nano version number; current size is shown at `chrome://on-device-internals`. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - [unresolved] Gemma 4 variant/size (E2B? E4B?) and its context window are not stated in F1/F2. A single non-Google news item claims a ~4 GB Gemma 4 download; not verified (page was paywalled). | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| - [inferred] Lars's Snapdragon X Elite (Windows on ARM64) box: C1 does not list architecture restrictions; CPU path needs 16 GB RAM. Whether Chrome's on-device runtime has an ARM64 Windows GPU/NPU bac | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - [measured, E1] Edge docs cover `responseConstraint` (JSON Schema or regex). **E1 does not mention tool calling** (searched "tool"). [unresolved] Whether Edge's runtime implements `tools` / `AIPrompt | feature | verified | spikes/ng222-app/node_modules/@angular/build/node_modules/vite/dist/node/chunks/dist.js:595 |
| Most direct source: Chromium's renderer client, which sets which AI APIs exist in extension processes: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:41 |
| https://chromium.googlesource.com/chromium/src/+/refs/heads/main/chrome/renderer/chrome_content_renderer_client.cc (`SetRuntimeFeaturesDefaultsBeforeBlinkInitialization`) -- "X1". Also the Blink IDLs  | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - [measured, getstarted https://developer.chrome.com/docs/ai/get-started] "All of these APIs can be used when building Chrome Extensions"; APIs still in an origin trial require registering the extensi | structure | unverifiable | Not found: docs/ai/get-started] |
| - [measured, getstarted] When `availability()` is `downloadable`/`downloading`, `create()` needs **user activation** (`navigator.userActivation.isActive`). [inferred] A service worker has no user acti | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - [measured, getstarted] Precedent: the "Web AI Studio" extension "adds a dedicated panel to Chrome DevTools, making it easy to track models and inspect APIs" (https://web-ai.studio/extension). It sho | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| Recommendation [inferred]: host the session in the DevTools panel page (permission delegated by `ExtensionView.ts`, receives the user's clicks for activation, lives as long as DevTools is open) with a | feature | verified | spikes/ng222-app/node_modules/.vite/vitest/7a7785ec6fcdebf6852283e7e35b5171b95ecf7a/deps/plugins.D2ut1V9b-DDzazuHB.js:4415 |
| Sources: Chrome table https://developer.chrome.com/docs/ai/built-in-apis ("C2", body last updated 2025-09-12, so partly stale); R1 and X1 (Chromium `main`, current); Edge docs https://learn.microsoft. | structure | unverifiable | Not found: docs/ai/built-in-apis |
| Sources: explainer https://github.com/webmachinelearning/webmcp (README on `main`, fetched 2026-10-11) -- "W1"; https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md -- "W2"; | structure | unverifiable | Not found: docs/ai/webmcp |
| - [measured, W1] **The entry point is now `document.modelContext`, not `navigator.modelContext`.** The explainer uses `document.modelContext` throughout; `navigator.modelContext` does not appear in it | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - [measured, W1] **Agent-side API (what an extension needs):** `document.modelContext.getTools({ fromOrigins })` -> array of `{ name, description, inputSchema, origin, window }`; `document.modelContex | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - [measured, W3] "Chrome Extensions can query and execute WebMCP tools with content scripts." W3 also points at a DevTools pane for debugging WebMCP tools: https://developer.chrome.com/docs/devtools/a | structure | unverifiable | Not found: docs/devtools/application/webmcp |
| - [measured, W5] Google's "Example Agentic Chrome Extension" content script reads `document.modelContext.getTools()` and listens for `toolchange`, including in same-origin and cross-origin iframes (`f | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - [measured, W4] **Angular has experimental WebMCP support**: `provideExperimentalWebMcpTools([...])` from `@angular/core` registers tools for the app lifetime; `execute` runs in the injection context | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - How the extension would read page tools [inferred, follows W3/W5]: content script calls `document.modelContext.getTools()` / `executeTool()`, relays tool descriptors to the DevTools panel over `chro | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| Sources: https://developer.chrome.com/docs/devtools/ai-assistance ("D1"); DevTools frontend source https://github.com/ChromeDevTools/devtools-frontend/tree/main/front_end/models/ai_assistance ("D2", R | structure | unverifiable | Not found: docs/devtools/ai-assistance |
| - [measured, D1] Gemini-in-DevTools covers **styling, network, sources, performance**. It is cloud Gemini: needs sign-in, age 18+, supported locations, opt-in under Settings > AI innovations, Google T | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - [measured, D2 `agents/AiAgent.ts`] Loop: up to `MAX_STEPS = 20` model requests per query; tools that need approval emit a `SIDE_EFFECT` event and wait for the user's `confirm()`. | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - [measured, D2 `agents/ExecuteJavascript.ts`] Page JS runs in a dedicated isolated world (`Page.createIsolatedWorld` with its own CSP) and first with `throwOnSideEffect: true`; if it would cause a si | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - [measured, D2 `BuiltInAi.ts`] **DevTools itself already uses the built-in Prompt API** for Console Insights "teasers": `window.LanguageModel.availability/create` with `expectedInputs/Outputs` `en` t | feature | aspirational | Aspirational claim (future/desired state) |
| - Takeaways for the extension [inferred]: copy the context-object pattern (one selected Angular component = one context with an origin), the origin lock, side-effect-free reads by default with explici | feature | aspirational | Aspirational claim (future/desired state) |
| - [unresolved/secondary] Gemini Nano: a third-party write-up (https://www.swyx.io/gemini-nano) reports `inputQuota` 6144 tokens on Chrome 137/138. No Google page states a number. Read `session.context | feature | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:43 |
| - [measured, https://ai.google.dev/gemma/docs/core] Gemma 4 comes in E2B, E4B, 12B, 31B, 26B A4B. "Small models feature a 128K context window, while the medium models support 256K." Weight memory: E2B | structure | unverifiable | Not found: docs/core] |
| - First-run download [measured, C1/E1]: model downloads on first use per browser (shared across origins), needs unmetered network, 22 GB (Chrome) / 20 GB (Edge) free, deleted under 10 GB free; `create | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Hardware gates [measured, C1/E1]: Chrome GPU > 4 GB VRAM or CPU 16 GB RAM / 4 cores; Edge Phi-4-mini GPU >= 5.5 GB VRAM; Aion-1.0 runs on CPU. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - What fits in a prompt [inferred] (Superseded sizing: the measured windows are 9216 in Chrome Beta and 7168 for Aion, `00-browser-probe.md`; the 6K figure below is the third-party number): at ~6K tok | config | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| 5. Extension-context access to `LanguageModel` is read from source (X1/I1 and the DevTools `ExtensionView.ts` `allow` list), not confirmed by a doc or a run. Content scripts and `devtools_page` are st | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Sources: local clone `D:/projects/github/angular/angular` on branch `22.2.x` (CHANGELOG top entry is `22.2.0 (2026-09-23)`, `CHANGELOG.md:1-2`). Paths below are relative to that root unless they start | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| Every claim cites `file:line`. Claims marked **(inferred)** are reasoning from the cited code, not something the code states or a test exercises. | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| - `ng` is the expando key `GLOBAL_PUBLISH_EXPANDO_KEY = 'ng'` (`packages/core/src/render3/util/global_utils.ts:69`). `publishUtil` does `w.ng ??= {}; w.ng[name] = fn` on the `global` object (`global_u | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - `publishDefaultGlobalUtils()` publishes the `externalCoreGlobalUtils` map and the `internalCoreGlobalUtils` map (`global_utils.ts:180-197`). It first calls `setupFrameworkInjectorProfiler()` in brow | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - The application-level wrapper only calls it when `ngDevMode` is truthy: `ngDevMode && _publishDefaultGlobalUtils()` (`packages/core/src/application/application_ref.ts:66-68`). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - It is called from `createPlatform` (`packages/core/src/platform/platform.ts:46`) and `createOrReusePlatformInjector` (`platform.ts:177`), i.e. on every bootstrap path (NgModule and standalone). Both | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Router adds three more entries only from `provideRouter()` in dev mode (`packages/router/src/provide_router.ts:108-113`) via `ɵpublishNonCoreGlobalUtil` (exported at `packages/core/src/core.ts:118`) | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - `ngDevMode` itself: dev mode is "ngDevMode not undefined and truthy" (`packages/core/src/util/is_dev_mode.ts:20-22`); production builds set it to `false` (`is_dev_mode.ts:38-44`), and a URL containi | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| The TypeScript contract lives in three interfaces: `ExternalCoreGlobalUtils` ("any functions which have *ever* been in this set exist in long-lived public Angular versions which DevTools needs to supp | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - The 11 non-`ɵ` names in `ExternalCoreGlobalUtils` plus `enableProfiling` are documented `@publicApi` functions (e.g. `discovery_utils.ts:55`, `change_detection_utils.ts:24`, `chrome_dev_tools_perfor | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - `getSignalGraph`'s docblock says it throws for environment injectors, but the code accepts `R3Injector` and only throws for other types (`signal_debug.ts:270-283`). Trust the code. | feature | verified | .claude/skills/control-vitest-browser-angular/features/held-counter.md:50 |
| - Signal node `label` comes from the node's `debugName` (`signal_debug.ts:140-170`); see 5.3 for where debug names come from. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - In dev mode, every platform creation calls `registerAiTools()` (`platform.ts:48-50`, `platform.ts:178-180`); the platform's destroy path unregisters (`platform.ts:160`). Added in 22.0.0: "register A | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - Mechanism: a `window` listener for the `devtoolstooldiscovery` event that calls `event.respondWith({name: 'Angular', tools: [diGraphTool, signalGraphTool]})` (`packages/core/src/debug/ai/registratio | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - `angular:signal_graph` - input `{target: HTMLElement}` (schema uses `'x-mcp-type': 'HTMLElement'`), returns the `ɵgetSignalGraph` result with `id` and `debuggableFn` stripped (`packages/core/src/deb | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - How an extension can use it without any `ɵ` name: the core spec shows the whole protocol - create `new CustomEvent('devtoolstooldiscovery')`, assign a `respondWith` function onto it, `window.dispatc | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - `respondWith` is an expando on the event object and `execute` returns live objects (DOM elements, values), so dispatch and `execute` must run in the page's MAIN world, not in an isolated content scr | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - This channel is **not WebMCP**. WebMCP registration goes through `document.modelContext.registerTool` (`packages/core/src/webmcp/declare_tool.ts:38-46,82`) and is only used for app-authored tools (s | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| Angular DevTools' page-side code lives in `devtools/projects/ng-devtools-backend/src/lib`. All `ng` access goes through `ngDebugClient()`, which returns `window.ng` as `Partial<GlobalUtils>` and throw | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| Feature gating from the same checks (`shared/ng-debug-api/ng-debug-api.ts:32-111`, aggregated in `supported-apis.ts:24-40`): | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| - DI tab needs `getInjector` + the four `ɵ` injector functions (`ng-debug-api.ts:33-52`). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Router needs all three router globals (`ng-debug-api.ts:72-79`) - absent for `RouterModule.forRoot` apps (1.1). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Profiler is disabled when any root is a Wiz app (`ng-debug-api.ts:55-69`). | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Detection: Angular present = `[ng-version]` exists (`angular-check.ts:22-24,54-60`); dev mode = `typeof ng === 'object'` with `getComponent` or `probe` (`angular-check.ts:13-15,47-52`); hydration =  | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| From `devtools/projects/shell-browser/src/manifest/manifest.chrome.json`: MV3, permissions `scripting`, `activeTab`, `storage`, `debugger`, host `<all_urls>`; a MAIN-world `document_start` script sets | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Tabs are `'Components' \| 'Profiler' \| 'Router Tree' \| 'Injector Tree' \| 'Transfer State'` (`devtools/projects/ng-devtools/src/lib/devtools-tabs/devtools-tabs.component.ts:40`), shown conditionally (`d | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| Full message protocol (the complete set of backend operations) is the `Events` interface at `devtools/projects/protocol/src/lib/messages.ts:400-475`. There is no AI or natural-language feature in Angu | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Positions Angular's templating and signal-based state as a fit for generated content (`overview.md:11-15`). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Three recommended stacks: Genkit (server-side, model-agnostic, needs a Node server such as Angular SSR), Firebase AI Logic (client-side, secure, no key in bundle), Gemini API (direct) (`overview.md: | command | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Best practices: never ship API keys in client files like `environments.ts`; use a proxy or secrets manager (`overview.md:76-86`); use tool calling with the developer in control of which functions ar | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Keep raw input and submitted prompt in two signals; feed only the submitted one to `resource({params})` so the `loader` runs on submit, not per keystroke; read other signals (e.g. `sessionId`) insid | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Streaming: `resource({stream: async () => signal<ResourceStreamItem<T>>})`, updating the inner signal per chunk; template reads `isLoading()/hasValue()/value()/error()` (`design-patterns.md:95-137`) | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| Relevance **(inferred)**: AI-heavy apps will hold their interesting state in `resource`/`linkedSignal` nodes, which `ɵgetSignalGraph` exposes with `debugName` labels when compiled by ngtsc (5.3). | feature | aspirational | Aspirational claim (future/desired state) |
| - What: an emerging standard letting a page expose structured tools to in-browser AI agents (`webmcp.md:3-5`). Angular support is **experimental**, APIs may change outside majors (`webmcp.md:7-9`). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `inputSchema` is JSON Schema; parameter types are inferred from it (`required` removes `undefined`, `additionalProperties: false` narrows) (`webmcp.md:47-97`). Angular does not validate inputs at ru | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Route-scoped tools need `withAutoCleanupInjectors()` or they stay registered after navigation (`webmcp.md:99-137`). That router feature was stabilized in 22.2 (`CHANGELOG.md:40`). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `declareExperimentalWebMcpTool(tool, injector?)` - imperative, in any injection context, auto-unregisters on destroy; prefer root services (`webmcp.md:139-163`; `packages/core/src/webmcp/declare_too | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Signal Forms: `provideExperimentalWebMcpForms()` from `@angular/forms/signals` plus `form(model, schema, {experimentalWebMcpTool: {name, description}})` generates a tool whose JSON schema is inferre | feature | verified | .commandcode/skills/nx-generate/SKILL.md:99 |
| - Name collisions throw; avoid registering in components rendered more than once (`webmcp.md:247-251`). Testing suggestion: `@mcp-b/webmcp-polyfill` (`webmcp.md:257-259`). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - How registration works in code: `declareExperimentalWebMcpTool` returns early during SSR, then looks up `document.modelContext ?? navigator.modelContext` and silently does nothing if `registerTool`  | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - Version: `declareWebMcpTool`/`provideWebMcpTools` landed in 22.0.0 (`CHANGELOG.md:926,940` inside the 22.0.0 section starting `CHANGELOG.md:842`); 22.0.x patches added SSR disable, required descript | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| An interactive tutor delivered through the Angular CLI MCP server (`ai_tutor` tool), launched from an AI editor/CLI by prompting "launch the Angular AI tutor" in a new `ng new` project (`ai-tutor.md:7 | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Agent Skills: two official skills, `angular-developer` (code generation and guidance across signals, forms, DI, routing, SSR, a11y, testing, CLI) and `angular-new-app`; installed with `npx skills ad | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| - Develop with AI: a `best-practices.md` system prompt (sourced from `packages/core/resources/best-practices.md`), per-IDE rules files (GEMINI.md, copilot-instructions, Cursor, AGENTS.md, Windsurf), a | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| From `mcp-server-setup.md`: run `npx @angular/cli mcp` from the IDE's MCP config (`mcp-server-setup.md:9-61`); flags `--read-only` and `--local-only` (`mcp-server-setup.md:114-125`). Default tools (`m | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| All are stable (`angular-cli/packages/angular/cli/src/commands/mcp/mcp-server.ts:34-46`); `EXPERIMENTAL_TOOLS` is empty (`mcp-server.ts:48-52`). `isReadOnly`/`isLocalOnly` map to MCP `readOnlyHint` /  | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Both bootstrap paths add `provideZonelessChangeDetectionInternal()` unconditionally (`packages/core/src/application/create_application.ts:65-70`; `packages/core/src/platform/platform_ref.ts:51-56`). | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - `provideExperimentalZonelessChangeDetection` no longer exists in `packages/core/src` (`rg` returns nothing); the stable `provideZonelessChangeDetection` is `@publicApi 20.2` and warns in dev mode if | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - `ChangeDetectionStrategy.Default` is deprecated in favor of `Eager` (`packages/core/src/change_detection/constants.ts:30-42`); `getDirectiveMetadata` already reports `Eager` (`discovery_utils.ts:323 | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - ngtsc runs `signalMetadataTransform` as a `before` transform (`packages/compiler-cli/src/ngtsc/core/src/compiler.ts:888`), inserting `debugName: '<property name>'` into calls of 13 functions: `signa | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - `enableProfiling()` (public since 21.0) forwards both the render profiler and the DI injector profiler to Chrome's Performance panel (`chrome_dev_tools_performance.ts:364-387`). Deep links `angular- | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Both profilers are multi-subscriber arrays (`render3/profiler.ts:11-44`; `injector_profiler.ts:210-246`), so an AI extension can add its own `ɵsetProfiler` callback alongside Angular DevTools. It mu | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - The DI event stream (`InjectorProfilerEventType.Inject`, `InstanceCreatedByInjector`, `ProviderConfigured`, `EffectCreated`, ... at `injector_profiler.ts:76-110`) is not on `ng`; only `enableProfili | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Per-node `__ngDebugHydrationInfo__` with mismatch details (`hydration/utils.ts:294-390`), the `ngh` attribute for not-yet-hydrated nodes, and the six `ngDevMode` hydration counters (`ng_dev_mode.ts: | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - 22.2 core adds programmatic `ErrorBoundary` APIs and the language service supports `@boundary` blocks (`CHANGELOG.md:18,33`). No debugging hook for boundaries appears in `global_utils.ts` or `contro | feature | verified | .claude/skills/control-vitest-browser-angular/features/held-counter.md:50 |
| - 22.2 router exposes router resources in public API and stabilizes `withAutoCleanupInjectors` (`CHANGELOG.md:38-40`); route tools registered via WebMCP depend on the latter (4.3). | feature | verified | .claude/skills/control-angular-dev-app/features/counter.md:11 |
| - Dev-mode console helpers already exist for signal debugging: `toggleWatchSignal` logs updates via a `DebugWatchNode` held by `WeakRef` so it does not leak (`signal_debug.ts:300-410`). | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - A search of `packages/core/src`, `packages/platform-browser/src`, `packages/router/src`, `packages/common/src`, `packages/forms/src` for writes to `global[...]`, `globalThis.*`, `window.*` found onl | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `overlay (bundled into the app, dev-only dynamic import in main.ts)` -> `RPC push to a local devframe server (Express hub initPangularHub(), Vite plugin, or standalone CLI)` -> `server shared state` - | structure | unverifiable | Not found: docs/CONTEXT.md, |
| Overlay details **[measured: getting-started/overlay.md, packages/devtools/src/change-detection.ts]**: | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Reads the page ~250 ms after change detection (`REFRESH_DEBOUNCE_MS = 250`, triggered through `ng.ɵsetProfiler`), plus a 4 s heartbeat; 3 s polling before bootstrap. Skips unchanged data; sends shor | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Each tab claims a `pageId` in `sessionStorage` (`pangular-page-id`) and exposes `window.__pangularPageId`. Every push carries it and expires. | feature | verified | .claude/skills/control-angular-dev-app/features/counter.md:11 |
| - Exposes helper globals for the extension: `window.__pangularComponentOf(el)`, `__pangularHostOf(pageId,id)`, `__pangularClassOf(pageId,id)` (`overlay.ts:662`, `component-source.ts:47`). | feature | verified | .claude/skills/control-angular-dev-app/features/counter.md:11 |
| Extension (MV3) **[measured: extension/manifest.json, background.js, content-script.js, detect-angular.js, devtools.js, panel-bridge.js, panel-actions.js]**: | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `detect-angular.js` (MAIN world, `document_idle`) checks `[ng-version]` or `window.ng`, retries 10 x 500 ms, posts `__PANGULAR_ANGULAR_DETECTED__`; `content-script.js` relays to the service worker,  | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| - `panel-bridge.js` probes the inspected origin for a devframe connection file (`/__pangular/`, `/__devframes/pangular/`, `/__devframe/`, `/` x `__devframe/__connection.json`, `__connection.json`, 1.5 | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Fixed extension id via manifest `key`; servers trust only that `chrome-extension://` origin by default (`allowedOrigins` for others) **[measured: getting-started/chrome-extension.md]**. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| Inferred consequence **[inferred]**: Pangular needs the app to install a package and mount a server; it cannot inspect an arbitrary dev page. An extension that reads `window.ng` from a MAIN-world scri | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| All rows **[measured]** from `apps/docs/src/content/inspectors/<name>.md` unless noted. "ng?" = can a MAIN-world extension script get the same data from the public/`ɵ` `ng` global: **yes** (read only) | structure | unverifiable | Not found: docs/src/content/inspectors/<name>.md |
| Cross-cutting UI features **[measured: getting-started/popup-and-hub.md headings, chrome-extension.md]**: dock modes with saved layout, deep links (tab hashes, last tab), page picker per tab when seve | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Exact signal write history. `installSignalWriteHook` does `import('@angular/core/primitives/signals')` and calls `setPostSignalSetFn` (`packages/devtools/src/signal-history.ts:189-200`) **[measured] | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - `patchState` / `watchState` for exact NgRx signal-store entries (app must call `registerNgrxSignals`) **[measured: overlay.md]**. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Everything from the source scan, the server (SSR traces, fault rules, TransferState edits, Analog), and installed package versions **[measured: dashboard.md, ssr-http.md]**. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - **MCP server** **[measured: agents/mcp-server.md]**. Two transports: stdio (`npx @pangular-inspector/devtools mcp --root <dir>`, source scan only) and HTTP (`/__devframes/__mcp` on the dev server, l | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| - **Roughly 60 agent tools** (estimate, not counted exactly) across inspectors **[measured: agents/tools.md lists them]** (Count, 2026-10-12: the local clone's `devtools/apps/docs/src/content/agents/t | structure | unverifiable | Not found: docs/src/content/agents/tools.md |
| - **Agent-safety design worth copying wholesale** **[measured: security.md "Page text in agent answers", tools.md, forms.md]**: every tool answer carrying page text starts with a notice such as "Label | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **WebMCP inspection** **[measured: inspectors/forms.md, packages/devtools/src/forms-webmcp.ts]**: for Signal Forms that set `experimentalWebMcpTool` (with `provideExperimentalWebMcpForms()`), the Fo | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - **Devframe browser-agent registry** **[measured: extension/ui/assets/browser-agent-rpc-*.js]**: the bundled panel includes Devframe's `devframe:browser-agent-registry` with `devframe:agent:invoke-cl | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Repo is agent-maintained: `.claude/skills/devtools-*` and `.claude/agents/{ui-engineer,inspector-engineer,a11y-reviewer,devtools-reviewer}.md` **[measured: AGENTS.md]**. | structure | unverifiable | Not found: .claude/skills/devtools-* |
| Sources: https://react.dev/learn/react-developer-tools, https://github.com/facebook/react/tree/main/packages/react-devtools, CHANGELOG at https://raw.githubusercontent.com/facebook/react/main/packages | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - Select-in-page, and since 8.0.0 a React Element pane inside the browser Elements panel showing the component for the inspected DOM node **[measured: CHANGELOG 8.0.0, #35240]**. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Profiler: flamegraph and ranked charts, commit navigation and start/stop hotkeys, component search in the commit view, profile export/import as one JSON object **[measured: CHANGELOG 8.0.0; OVERVIEW | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Suspense tab, on by default in 8.0.0; 7.0.0 added a "suspended by" section listing causes (`await` in Server Components, `React.lazy`, `use()`, suspensey images/CSS/fonts); named Activities listed * | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Console warning/error counts per component, recorded in the backend **[measured: OVERVIEW.md]**. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - A backend in the page next to React and a frontend (extension UI) joined by a message bridge **[measured: OVERVIEW.md]**. The backend attaches through the page global `__REACT_DEVTOOLS_GLOBAL_HOOK__ | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Each commit sends a compact "operations" patch (typed array plus string table), not the full tree. Props/state are fetched lazily with `inspectElement` only for the selected element, polled while se | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - Profiling data stays in the backend during recording and is fetched once with `getProfilingData` after stop **[measured: OVERVIEW.md]**. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| The closest precedent for promptified devtools. Sources: https://developer.chrome.com/docs/devtools/ai-assistance, .../ai-assistance/chat, .../ai-assistance/get-started, .../ai-assistance/data-usage-a | structure | unverifiable | Not found: docs/devtools/ai-assistance, |
| - Agent behaviour: generates and executes JavaScript that calls web APIs in the inspected page to gather facts; shows steps ("Investigating..."), an expandable agent walkthrough with the executed code | feature | verified | .commandcode/skills/nx-generate/SKILL.md:99 |
| - Side-effect gating: when generated code has side effects, the conversation pauses for Continue/Cancel; changes go to the Changes panel. "Apply to workspace" writes CSS edits back to source with a di | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - Runs in the DevTools frontend against the inspected page (JS evaluation plus DevTools actions) **[measured: .../chat for JS execution; CDP wording inferred]**. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Published per-feature data list **[measured: data-usage page]**: Console Insights sends log level, stack trace, related request headers (cookies, auth, `x-*` and response body excluded) and code aro | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| Source: https://github.com/ChromeDevTools/chrome-devtools-mcp README (read directly in this run), docs/tool-reference.md and docs/design-principles.md (researcher). | structure | unverifiable | Not found: docs/tool-reference.md |
| - MCP server plus CLI that lets a coding agent control and inspect a live Chrome via Puppeteer (CDP); uses DevTools frontend code to record traces and extract insights; source-mapped console stacks ** | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Tool groups **[measured: tool-reference.md via researcher]**: input automation (click, fill, fill_form, hover, press_key, type_text, upload_file, ...), navigation (list_pages, navigate_page, new_pag | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Design principles: token-optimized summaries over raw dumps, small deterministic tools, errors that suggest a fix, references (file paths) for heavy payloads **[measured: design-principles.md via re | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Privacy: exposes browser content to the MCP client; may send trace URLs to CrUX (`--no-performance-crux`); usage statistics on by default (`--no-usage-statistics`) **[measured: README]**. | feature | verified | .claude/skills/control-angular-dev-app/features/counter.md:11 |
| **Third-party developer tools API (most relevant finding for this design)** **[measured: https://developer.chrome.com/blog/devtools-for-agents-3p-tools, published 2026-06-18, read directly in this run | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - Page code listens for the `window` event `devtoolstooldiscovery` and calls `event.respondWith({name, description, tools: [{name, description, inputSchema, execute}]})`. The event fires on every navi | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - `execute` runs in the page and returns serializable data; returned DOM elements map to the same uids as `take_snapshot`. Agents call `execute_3p_developer_tool` (input validated against the JSON Sch | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Where the Angular tools live (framework core vs a separate package) and how they register is not stated in the blog **[inferred: needs a follow-up read of the Angular source / chrome-devtools-mcp do | structure | unverifiable | Not found: docs/third-party-developer-tools.md]**. |
| Most entries rest on search-engine summaries rather than full page reads; labels say which. Source list per entry is from the web researcher's file. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Data: `__VUE_DEVTOOLS_GLOBAL_HOOK__` for the extension **[inferred]**; the Vite plugin injects at dev time and uses vite-plugin-vue-inspector for DOM-to-component mapping **[search-summary]**. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Data: runs inside the dev server (Nuxt module + Vite), not as an extension **[inferred]**. antfu's `nuxt-mcp-dev` / `vite-plugin-mcp` expose config, components and pages to MCP clients, experimental | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Features: highlights re-rendering components, flags unnecessary renders caused by reference inequality, script/npm/CLI install, `onRender` API **[search-summary: https://github.com/aidenybai/react-s | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - Features: action list, state and diff views, jump (time travel), skip, reorder, pause recording, lock changes, persist across reloads, import/export history, trace (call stack per action, off by def | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Port: for NgRx and signal stores, an action/patch log with replay and a JSON session export the model can read; per-action trace to answer "who changed this?". ng data: store discovery **yes** (inje | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Features: Svelte tab with component/block/element tree, select a node to view and edit state; needs Svelte 4 compiled with `dev: true`; Chrome and Firefox 121+ **[measured: https://github.com/svelte | command | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Features: debugger that tracks the reactivity graph (signals, memos, stores), Locator (Alt+click a component to open its source, needs a build transform), optional auto-naming of signals and memos;  | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Port: Angular already auto-adds `debugName` to field-initialized signals in dev builds **[measured: Pangular signals.md]**; surface "unnamed" nodes and suggest `{debugName}` so model answers stay re | config | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Features: IDE extension marking slow React components inline with severity; build-time compiler instrumentation feeds runtime data back to the editor; focuses on unnecessary re-renders **[search-sum | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - **Angular CLI MCP server** (experimental): default tools `ai_tutor`, `find_examples`, `get_best_practices`, `list_projects`, `onpush_zoneless_migration`, `search_documentation` (needs internet); exp | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - **agent-react-devtools** (Callstack Incubator): CLI + daemon that connects `react-devtools-core` over WebSocket (port 8097); commands for tree, component, find, count, errors, wait, profile start/st | config | verified | spikes/ng222-app/node_modules/@angular/build/node_modules/vite/dist/node/index.d.ts:3744 |
| - **Prompt API devtools extensions**: the researcher found Prompt API extension samples (extraction, prompt enhancer) but no devtools-panel extension that uses on-device AI for framework inspection ** | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - **Tool calling**: the explainer defines `tools` (name, description, `inputSchema`), `expectedOutputs: [{type: "tool-call"}]`, `expectedInputs: [{type: "tool-response"}]`, open loop where the page ex | feature | aspirational | Aspirational claim (future/desired state) |
| - Hardware: 22 GB free on the profile volume; GPU > 4 GB VRAM or CPU with 16 GB RAM and 4+ cores; "No data is sent to Google or any third party" **[measured: https://developer.chrome.com/docs/ai/get-s | structure | unverifiable | Not found: docs/ai/get-started]**. |
| - Edge: own Prompt API implementation for sites and extensions, Phi-4-mini from Canary/Dev 138.0.3309.2, Aion-1.0-Instruct from 150.0.4070, 20 GB free **[search-summary: https://learn.microsoft.com/mi | config | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| 3. **Zero-install is the main gap Pangular leaves**: it needs an npm package, an overlay import and a server mount. Everything in Components, Signals (sampled), Injectors, Router reads, Forms reads, d | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| 7. **Risks to spike first** **[inferred]**: Prompt API `tools` support on Chrome stable and Edge; real `contextWindow` size per browser; whether a MAIN-world extension script can dispatch `devtoolstoo | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Labels: **[measured]** = read in the local clone or fetched source/doc this session; **[inferred]** = reasoned from those reads or prior knowledge, not verified at runtime. Nothing here was run in a b | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| Local clones used: `D:/projects/github/ngrx/platform` (NgRx 22.0.0, `modules/store/package.json`), `D:/projects/github/analogjs/analog` (`@analogjs/platform` 2.8.0). | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 1. **Token lookup problem.** `ng.getInjector(el).get(Token)` needs the token object. An extension has no import access to app bundles, so it cannot name `Store` or `RxStrategyProvider` directly. Optio | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| 2. **Early injection matters.** A content script with `world: "MAIN"` and `run_at: "document_start"` can install globals (e.g. a fake `__REDUX_DEVTOOLS_EXTENSION__`) before the app reads them. Anythin | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Primary: `window.__REDUX_DEVTOOLS_EXTENSION__` is read in a provider factory, `createReduxDevtoolsExtension()`, `modules/store-devtools/src/provide-store-devtools.ts:34-45` [measured]. It only runs  | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Injector probe: tokens `StoreDevtools`, `STORE_DEVTOOLS_CONFIG`, `IS_EXTENSION_OR_MONITOR_PRESENT` (`provide-store-devtools.ts:23,76-103`) and `Store`, `StateObservable`, `ROOT_STORE_PROVIDER`, `STO | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Only if the app already uses `provideStoreDevtools()` (very common in dev setups): install a **shim `window.__REDUX_DEVTOOLS_EXTENSION__`** at document_start. The factory returns whatever is on `win | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| - Caveat: if the real Redux DevTools extension is installed, whichever defines `window.__REDUX_DEVTOOLS_EXTENSION__` first wins; our shim must proxy to the original (forward `connect/send/subscribe`)  | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:109 |
| (c) **Needs opt-in**: history older than attach time unless shim is installed early; `provideStoreDevtools({maxAge, name, serialize, actionSanitizer})` tuning; action creators registry (`actionCreator | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| (d) **Existing devtools**: Redux DevTools extension (protocol above); `@ngrx/store-devtools` is the in-app half. NgRx also has runtime checks (`runtime_checks.ts`, uses `isDevMode`) that throw on stat | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| - Auto-generate a reducer/selector unit test from a captured action sequence plus before/after states (a recorded trace is a ready test fixture). | feature | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:43 |
| - Natural-language dispatch: "set filter to overdue" -> proposes a concrete `{type, ...payload}` using `actionCreators` or observed action shapes, user confirms, extension dispatches through the shim  | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:13 |
| (a) **Detection** [measured, `modules/signals/src/state-source.ts`] | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Every store/state exposes a symbol-keyed property `STATE_SOURCE`, `Symbol('STATE_SOURCE')` when `ngDevMode` is truthy (line 14-16, empty description otherwise). Scan instances for an own symbol with | feature | verified | .claude/skills/control-angular-dev-app/features/counter.md:11 |
| - Writes: `patchState` requires `isWritableStateSource` (all signals writable, lines 46-53); we can call `signal.set()` directly on the writable signals for "edit state from devtools" [inferred: `patc | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - Change history: `watchState` needs an injector and registers into a module-private `WeakMap` (`STATE_WATCHERS`, line 12) that we cannot reach. Use instead: poll, or run our own `effect()`/`watchStat | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| (c) **Opt-in**: exact action names and glitch-free intermediate states; both need `withDevtools` from the toolkit (below) or app-owned `watchState` hooks. | feature | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:43 |
| (d) **Existing**: `@angular-architects/ngrx-toolkit` `withDevtools(name, ...features)` [measured from `libs/ngrx-toolkit/src/lib/devtools/internal/devtools-syncer.service.ts` and the docs page]: conne | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| (e) **LLM ideas**: "Which store property drives this component?" (match template-bound signals to store keys); suggest `withComputed` to replace recomputed expressions; generate `signalStoreFeature` e | feature | verified | .claude/skills/control-ai-browsers/features/README.md:12 |
| - Modules: `dispatcher.ts`, `events-service.ts` (`Dispatcher`, `Events`, `EVENTS`, `ReducerEvents`), `event-creator.ts`, `with-reducer.ts`, `with-event-handlers.ts`, `inject-dispatch.ts` (`modules/sig | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Analog Angular HMR endpoint: `/@ng/component?c=<id>` served by `liveReloadPlugin` (`packages/vite-plugin-angular/src/lib/live-reload-plugin.ts:7-60`). A request to this URL pattern in the network lo | structure | verified | Exists: docs/feature-proposals.md |
| - Opt-in debug page: `withDebugRoutes()` adds route `__analog/routes` listing route path, source file and Layout/Page (`packages/router/src/lib/debug/index.ts`, `debug.page.ts`); `DEBUG_ROUTES` token  | structure | verified | Exists: docs/feature-proposals.md |
| - Route file convention: `/src/app/pages/*.page.ts`, `[param]`, `[...catchall]`, `(group)` (spec fixtures in `packages/router/src/lib/*.spec.ts`). | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Server endpoints: page server files `*.server.ts` map to `/api/_analog/pages/...` (prefix `/api` when an API dir exists; derivation in `packages/vite-plugin-nitro/src/lib/utils/get-page-handlers.ts: | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - `ANALOG_QUERIES_KEY = '__analogQueries'` (TanStack query integration, `packages/router/tanstack-query/src/constants.ts`) is a transfer-state key, readable from the `TransferState` script tag in SSR  | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Content files: `ANALOG_CONTENT_ROUTE_FILES` and content tokens (`content-files-token.ts`, `content-files-list-token.ts` in `packages/content/src/lib`) are injector-reachable [inferred]. | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| (d) **Existing**: `withDebugRoutes` page; Analog Storybook package (`packages/storybook-angular`, `@analogjs/storybook-angular`, builder `@storybook/builder-vite`, `preset.ts:40`); Analog Vitest packa | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| (e) **LLM ideas**: "route doctor" (compare file-route table with the router state, explain why a URL 404s or which layout wraps which page); generate `.page.ts` + `.server.ts` pair from a description  | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| Versions seen in docs fetched this session: Storybook 10.x docs, up to 10.6 on the AI page [measured]; `@storybook/angular` supports Angular >=18 and <23, with `@storybook/angular-vite` for Angular >= | feature | verified | .claude/skills/control-vitest-browser-angular/features/held-counter.md:50 |
| - Globals in the preview frame [measured, `code/core/src/preview-api/modules/preview-web/`]: `window.__STORYBOOK_PREVIEW__` (assigned in `PreviewWeb.tsx:19`); `__STORYBOOK_STORY_STORE__` is a proxy ov | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Selection state: `__STORYBOOK_PREVIEW__.currentSelection` / `selectionStore` (`PreviewWithSelection.tsx`) holds the active story id [measured names]. | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Dev server MCP: `http://localhost:6006/mcp` when `@storybook/addon-mcp` is added (docs `/docs/ai`) [measured]. Manifest: `features.componentsManifest` (default false) generates manifests used by the | structure | unverifiable | Not found: docs/ai |
| - `index.json` at the Storybook root (standard v7+ endpoint) lists all stories [inferred from general knowledge, high confidence]. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| (c) **Opt-in**: `@storybook/addon-mcp` plus `features.componentsManifest`; a custom Storybook decorator or `preview.ts` hook to emit component-to-story coverage; `@storybook/addon-vitest` for in-UI te | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Orchestrator URL: `<base>__vitest_test__/` (`projectParent.ts:123-124`); tester iframe URL: `<base><sessionId>/<testFile>` (`projectParent.ts:259`); UI `__vitest__/` (favicon `__vitest__/favicon.svg | config | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Extension note: content scripts must use `all_frames: true` and match `http://localhost:63315/*` plus the Vite dev server port; the tester is an iframe inside the orchestrator [inferred]. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| **How a generated test lands in a repo**: devtools generates `<name>.spec.ts` next to the component using `vitest-browser-angular` `render` with the inputs/providers captured from the live component,  | feature | verified | .commandcode/skills/nx-generate/SKILL.md:99 |
| - No window globals, no devtools hook, no `ngDevMode` branches or `console.` calls were found in `state` service, strategy provider, config, or strategies files [measured via regex over those files]. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - DOM/template: `*rxLet`, `*rxFor`, `*rxIf` are directives with selectors `[rxLet]` (`libs/template/let/src/lib/let.directive.ts:100`) etc. In dev mode the extension can find them with `ng.getDirectiv | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Injector tokens: `RxStrategyProvider` (class, `strategy-provider.service.ts:61`), `RX_RENDER_STRATEGIES_CONFIG` (`config.ts:20`), `RX_ACCUMULATOR_FN`, `RX_STATE_SCHEDULER` (`provide-rx-state-config. | command | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Zone config: `window.__zone_symbol__<event>` flags set by `rxZoneConfig` (`zone-configurations/src/lib/zone-config.ts:22-51`) -> detectable global side effects [measured]. | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - RxState current state: public `get()` returns the whole state (`rx-state.service.ts:175-281`) and `$` is the state Observable (line 103) [measured]; the extension calls `get()` on the instance it fi | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - Render strategies: `RxStrategyProvider` exposes the configured strategy names and the primary one (`RX_NATIVE_STRATEGIES`: `local`, `noop`, `native`; `RX_CONCURRENT_STRATEGIES`: `immediate`, `userBl | feature | verified | .claude/skills/control-angular-dev-app/features/counter.md:11 |
| (c) **Opt-in**: change-detection/render timing per strategy requires wrapping strategies (`provideRxRenderStrategies` with custom `work`) to emit render events; a dev-only token that registers each `R | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:38 |
| Open spikes (nothing here was run): whether `ng.ɵgetInjectorProviders`-style APIs are on the `ng` global in 22.2 (Answered: yes, see `02-angular-surface.md` section 1.2 and `05-spikes.md` S2); whether | feature | aspirational | Aspirational claim (future/desired state) |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| App: `spikes/ng222-app`, generated with `@angular/cli@22.2.2 new --routing --ssr=false`, installed `@angular/core` 22.2.2, served with `ng serve --port 4222`. A component `app-counter` (`src/app/count | structure | verified | Exists: spikes/ng222-app |
| - Dispatching `new CustomEvent('devtoolstooldiscovery')` with a `respondWith` expando from the main world returns `{name: 'Angular', tools: [angular:di_graph, angular:signal_graph]}` synchronously. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - Before `di_graph`, `ng.ɵgetSignalGraph(ng.getInjector(host))` returns `template:app-counter, signal:title, signal:count, computed:double (6), signal:items, effect`, with edges `template->title,count | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - Cause, isolated per token: `serializeInjector` calls `injector.get(token, null, {optional: true, self: true})` for every provider record. For the host's records (`Injector, DestroyRef, ElementRef, R | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - Design consequence: the extension never runs `angular:di_graph`, and never calls `injector.get` on node-injector special tokens. DI facts come from `ɵgetInjectorProviders` / `ɵgetInjectorResolutionP | structure | verified | Exists: docs/filing-ledger.md |
| Question: "In the app-counter component, which signals does `double` depend on, and what is its current value?" One tool, `signal_graph {selector}`, returns the raw `ɵgetSignalGraph` nodes (index, kin | structure | verified | Exists: spikes/probes/s2b.js |
| Together with 00's two-tool run, where Gemma 4 misread a value and Aion did not, neither model reads raw structures reliably. **Inferred design rule:** tools answer the narrow question (`signals.depen | structure | verified | Exists: docs/feature-proposals.md |
| - `typeof Zone !== 'undefined'`: this app still loads zone.js. (Answered 2026-10-12, review round 7: loading zone.js does not make it a Zone.js app. It calls neither zone provider, and its root enviro | structure | verified | Exists: spikes/probes/zone-mode.js |
| Harness: `spikes/probes/bench.js`, summarized with `bench-summary.mjs`. It runs against `spikes/ng222-app` and offers three narrow tools: | structure | verified | Exists: spikes/probes/bench.js |
| - `component_details {selector}`, which returns change detection, input values and outputs | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - `signal_info {selector, signal}`, which returns kind, value and direct dependencies by label | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| It asks five questions with checkable answers, three runs each, in two modes: | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| A first Aion run without that follow-up line failed every fallback question by repeating the same call until the step limit. The question "Which change detection strategy?" expects **OnPush**: Angular | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:250 |
| Raw files: none kept (10, "Correction: the benchmark grader passes wrong answers on one question"). Only a Nano `nano.json` existed, and the second round overwrote it. So this table cannot be regraded | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| Reading (inferred, 15 runs per cell is a small sample): | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| N2's rules "an effect whose only job is to write another signal" and "an effect that writes a signal it reads" need to know which signals an effect writes. Claude ran `spikes/probes/effect-writes.js`  | structure | verified | Exists: spikes/probes/effect-writes.js |
| - The effect node has an empty label **[measured]**. So a finding about an effect cannot name it by label, and N2's "unlabeled nodes" rule also flags the effect itself **[inferred]**. (Corrected 2026- | structure | verified | Exists: docs/feature-proposals.md |
| - `debuggableFn` is a field of `ɵgetSignalGraph`'s result type (02, `debug_signal_graph.ts:68-96`), and non-computed nodes carry it since 22.1.3 (02 line 167; 08) **[measured in source]**. `angular:si | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Not tested, and so gaps of the heuristic **[inferred]**: writes made through a called method or through another object, a write without `this.` (for example a local alias), and minified or otherwise | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - The `ɵsetProfiler` events include no effect runs (`profiler_types.ts`), so matching effect runs to epoch changes is not a route either **[measured in source, neutral review round 3]**. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| Design consequence: N2's two write rules scan effect nodes' `debuggableFn` text and label each finding as a heuristic. The graph alone cannot see writes. See `docs/feature-proposals.md`, N2. | structure | verified | Exists: docs/feature-proposals.md |
| Measured with the `verify-angular-devtools` skill: Angular DevTools 1.22.0 ran in an isolated Playwright Chromium against `spikes/ng222-app` on 22.2.2, and Claude reran the check on 2026-10-11. Before | structure | verified | Exists: spikes/ng222-app |
| Probe `spikes/probes/tool-session-matrix.js` calls `LanguageModel.availability(opts)` and `LanguageModel.create(opts)` for nine option sets. It ran in Chrome Beta 156.0.8078.17 on 2026-10-11 under two | structure | verified | Exists: spikes/probes/tool-session-matrix.js |
| - The trigger is a `tool-call` or `tool-response` entry in `expectedInputs`/`expectedOutputs`, not the `tools` list, the language tag or the system prompt. The benchmark's native mode (`bench.js`) alw | feature | aspirational | Aspirational claim (future/desired state) |
| - `availability()` returns `available` for every option set, including the ones `create()` refuses, while the error text says "Please check the result of availability() first." So on this build `avail | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - Side observation: after `model switch`, a freshly loaded `chrome://flags` still shows the "relaunch to take effect" banner, but `chrome://version` shows the switched features on the command line and | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| So the error is the feature gate described in `09-nano-tool-session-error.md`, not the model. Whether Nano ever emits tool calls is a separate quality question for the benchmark. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - **Harness:** `spikes/probes/bench.js` with the corrected grader (`9c1b585`) and a 120 s per-prompt timeout (Superseded: that check still passed answers about the `count` signal itself. `916fc09` fix | structure | verified | Exists: spikes/probes/bench.js |
| - **Instances:** one per model (`research/00`, "Per-model instances"). Backend comes from Broker State; performance class from `optimization_guide.on_device.performance_class` in the instance's `Local | structure | unverifiable | Not found: research/00 |
| Raw files: `research/raw/bench/nano.json` (Nano on CPU), `gemma4.json`, `aion.json` and `phi4mini.json`. The `916fc09` regrade changes none of these rows (measured). | structure | verified | Exists: research/raw/bench/nano.json |
| - Native: it writes `tool_code` blocks with made-up JavaScript as text instead of calling a tool. That matches its lack of documented tool calling (10). | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - Fallback: 15/15 runs failed, 14 of them with "Unexpected end of JSON input" (Corrected after counting `nano.json`: the first version of this line said all 15 failed that way; the fifteenth returned  | structure | verified | Exists: docs/feature-proposals.md |
| - Native: it often describes the tool call in prose ("Use the components_find tool...") instead of making it. Once `kErrorUnknown`. | feature | verified | .claude/skills/control-pangular-inspector/features/live-inspection.md:39 |
| - Nano needs its GPU backend measured before any verdict. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Argument mistakes still dominate the failures, which supports the id-based tool design (3.4) and prompt-kit experiment E1 (`07`). (Narrowed after counting the raw runs: argument mistakes dominate Ai | structure | verified | Exists: docs/feature-proposals.md |
| Same harness and questions as the second round, run while the machine was still under another session's load. Backends were switched as described in `research/00`, "Choosing CPU or GPU per instance". | structure | unverifiable | Not found: research/00 |
| Raw files: `research/raw/bench/nano.json` (CPU), `nano-gpu.json`, `gemma4-cpu.json`. The Gemma 4 GPU row has the same figures as the second round; the only saved file for it is `gemma4.json`. The `916 | structure | verified | Exists: research/raw/bench/nano.json |
| - The CPU backend is what broke Nano's structured output: 0/15 on CPU, 13/15 on GPU (measured; 11/15 after the `916fc09` regrade). On both backends Nano writes `tool_code` text instead of calling tool | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Persona prompt "expert in TypeScript, Angular" (l.13), steps for CLI detection, `npx ng new ... --ai-config=...` (l.27-33), which `ng generate` schematics to use (l.44-58), `npx ng add tailwindcss` (l | command | verified | .claude/skills/control-angular-devtools/SKILL.md:55 |
| Observation (measured): the skills target v22.x (`@Service()` decorator, `di-fundamentals.md:16-31`; `creating-services.md:32-42`). `creating-services.md:74` imports `Injectable` but the code uses `@S | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| Rules in a JSON table `{id, check, severity, message, fix}` where `message` and `fix` are short quotes from the references (e.g. outputs.md:84 "Avoid prefixing with `on`"). Checks are plain JS over `n | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| When the user clicks a finding, put only that rule's snippet into context: one bullet plus a 5-8 line code sample, trimmed from the reference. Example `effects.md:15-16` (2 lines, ~70 tokens) or `sign | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| Expose one tool that returns a rule's `message + fix + code` (cap 600 chars = 150 tokens). The model sees only rule ids and one-line titles (30 rules x ~12 tokens = ~360 tokens) in the prompt. Mirrors | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| From the signal graph (inferred API `ng.ɵgetSignalGraph`) flag: writable signal exposed by a service with no `asReadonly` (`signals-overview.md:27-33`), effect chains that look like state propagation  | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| Walk the router config and report: wildcard not last, eager routes that could be lazy, missing titles, `canActivate` used as the only protection (`define-routes.md:26, 41`; `loading-strategies.md:58-6 | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| For each finding that has a schematic, print the exact command from `migrations.md:14-22` (e.g. `ng generate @angular/core:signal-input-migration`) and the standalone 3-step workflow (`migrations.md:2 | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| `SKILL.md:12` says "analyze the project's Angular version before providing guidance". Use `ng.getComponent`'s framework version (`ng.coreTokens`/`VERSION` is reachable in dev mode, inferred; Supersede | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| The CLI MCP has `get_best_practices`, `onpush_zoneless_migration`, `search_documentation` (`mcp.md:9-15`). The extension could emit a ready-to-paste prompt for an external agent ("run `onpush_zoneless | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| Rewrite each rule in the imperative form used by `signal-forms.md:517-545` (wrong / right two-column table). Small models handle "WRONG -> RIGHT" pairs well (inferred); the table style is already in t | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| Check each `[formField]` element for forbidden attributes (`signal-forms.md:169-187`) and mixed reactive/signal usage (`signal-forms.md:205-208`). Data: DOM attributes + `ng.getDirectives`. Narrow but | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - The clone has no LICENSE file: `ls` of the repo root shows only `.git/`, `BUILD_INFO`, `README.md`, `angular-developer/`, `angular-new-app/`; `git ls-tree -r --name-only` on `origin/main`, `origin/2 | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - `angular-developer/SKILL.md:4` `license: MIT`; `:6` `author: Copyright 2026 Google LLC`. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `angular-new-app/SKILL.md:4` `license: MIT`; `:7` `author: Angular Team @ Google`. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - Short quotes (1-3 lines) with attribution are low risk either way. Bundling a rules JSON derived from the references is a derivative work, so it needs the notice. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Several references are tied to the Angular repo itself (`e2e-testing.md:3-29`, `testing-fundamentals.md:3`), so do not reuse them as general advice. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| No browser was opened for this note. The browser measurements it builds on are in `00-browser-probe.md` and `05-spikes.md`. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| 2. **Tool calls are produced differently per browser.** Chrome's Gemma 4 runtime contains llguidance constrained-decoding code for tool calls (B3); Edge's Aion path puts tool JSON into the system turn | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - **[measured, C1]** C1 documents mechanics, not prompt style: system prompt via `initialPrompts`, n-shot via `user`/`assistant` pairs, `prefix: true` on a trailing assistant message to force a format | feature | verified | spikes/ng222-app/.angular/cache/22.2.2/ng222-app/vite/deps/core-C4Mibiy-.js:11455 |
| - Keep output short; inference speed depends heavily on output length. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| - Prefer simple logic. Split multi-step reasoning into several focused calls chained in code. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - **[measured, D1, D2]** The Chrome team's own on-device prompt (DevTools console insight teasers, `BuiltInAi.ts`): | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - The system prompt names a role ("expert web developer"), states the goal, then gives a bulleted rule list: a length cap stated twice ("maximum length of 200 characters"), one paragraph, no headings  | feature | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:43 |
| - Each answer runs on `clone()` of a base session, with the comment: "Otherwise previous dialog would pollute the context resulting in worse answers." The clone is destroyed afterwards. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - **[measured, B3]** Chrome's runtime is LiteRT-LM. The binary contains `constrained_decoding/llg_fc_tool_calls.cc`, `llg_python_tool_calls.cc`, three tool-call parsers (`fc`, `python`, `json`), a Pyt | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - **[measured, P1]** Tool format: tools go in the system message as a JSON dump between `<\|tool\|>` and `<\|/tool\|>`. The example uses `{"name","description","parameters":{"city":{"description","type":" | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Not measured in Lars's browsers; Edge stable has the Phi-4-mini flags on, but no probe ran there **[measured, 00]**. Superseded: Phi-4-mini was benchmarked in Edge stable 155 (`05-spikes.md`, "Four- | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - **[measured, B1]** `tokenizer.json` special tokens are Phi-4's set: `<\|system\|>`, `<\|user\|>`, `<\|assistant\|>`, `<\|end\|>`, `<\|endofprompt\|>`, `<\|tool\|>`, `<\|/tool\|>`, `<\|tool_call\|>`, `<\|/tool_call\|> | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **[measured, C1, S1]** `responseConstraint` takes a JSON Schema or a RegExp. An unsupported schema feature throws `NotSupportedError`; when the model cannot comply, `SyntaxError`. By default the imp | feature | verified | .claude/skills/control-vitest-browser-angular/features/held-counter.md:50 |
| - Put `maxLength` on `answer` (for example 400) to bound latency (M1: output length drives speed) and to stop whitespace or repetition runs. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:12 |
| - **Constrained decoding guarantees shape, not truth [inferred]:** the measured Aion failures were schema-valid (`selector` was a string). Values still need checking in code. | feature | verified | spikes/ng222-app/node_modules/@angular/build/src/private.d.ts:11 |
| - **`omitResponseConstraintInput` [inferred]:** the fallback loop sends the same schema on every step. If the default prompt includes the schema each time, a per-tool `anyOf` with selector enums could | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - **[measured, C2]** Google's tip: test schemas with the JSON Schema Tester (https://googlechrome.github.io/samples/json-schema-tester/). | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| Applying G3's E2B figures (128K context, Tau2 24.5%) to Chrome's `gemma4-2b-it` "low tier" model assumes 2b = E2B. G3 lists no plain 2B variant **[inferred mapping]**. | feature | verified | spikes/ng222-app/node_modules/@angular/build/node_modules/vite/dist/node/chunks/dist.js:370 |
| - One question = one clone. Start a new clone for the next question and carry over a single line of facts ("Selected: app-counter; last answer: double = 6, depends on count"). | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| - **[measured, G1, G2]** Gemma's native result format writes each string value between `<\|"\|>` tokens, so special characters in strings are treated as literals. **[inferred]** For Gemma 4, return `{ty | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - A flat JSON object of named facts that answers the tool's one question: `{"ok":true,"component":"app-counter","signal":"double","value":6,"dependsOn":["count"]}`. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| - **What is untrusted [inferred]:** the extension writes the keys and shape of every result. Only page-derived string values are untrusted: component and input values, signal values, text content, rou | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| 4. The real defence is capability: every tool is read-only, and any future tool with a side effect needs a user click, not model consent. Prior art agrees (03, Pangular `confirm`, Chrome AI assistance | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| All of section 6 is **[inferred]** design from sections 1-5, except the token counts, which Claude measured with Aion's `tokenizer.json`. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - If a tool returns an error, fix the arguments it names and try once more; otherwise say what you could not find. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - **`##` section marker:** M1 calls it "particularly critical for Gemini Nano". | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| 4. **No empty schemas:** a tool that needs no input gets `scope: {type:'string', enum:['page']}`. (confounded with camelCase names; see Correction at end of 00/07 and research/11) (Answered 2026-10-12 | structure | unverifiable | Not found: research/11 |
| 6. **One tool per narrow question:** `signal_dependencies {selector, signal}` returns `dependsOn`, instead of `signal_graph` returning nodes and edges (05's design rule). | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| 7. **Checked in code on every call:** unknown tool name, missing argument, or a value not in the known set returns a `LanguageModelToolError`. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| [{"name":"list_components","description":"List Angular components on the page. Returns selectors such as app-counter. Call this first when you do not know a selector.","inputSchema":{"type":"object"," | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| {"name":"signal_dependencies","description":"Which signals one signal of a component reads, and its current value.","inputSchema":{"type":"object","properties":{"selector":{"type":"string","descriptio | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - **Call ID spelling:** both measured browsers use `callID` (Edge rejects `callId`; Gemma 4 in Chrome Beta returns `callID: ""`) **[measured, 00]**, while S1 spells it `callId`. Pass both members unti | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| {"ok":true,"component":"app-counter","signal":"double","dependsOn":["count"],"value":6} | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| Proposed only; Claude ran no browser. Each row names the measured failure it targets. Metric is pass rate over the same 15 runs per variant used for the fallback-loop benchmark, plus `contextUsage` an | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - Which tool format (`fc`, `python`, `json`) Chrome uses for Gemma 4, and whether `inputSchema` is grammar-constrained in Chrome. B3 shows the code exists; it does not show it is used for this model. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - How Edge renders a `LanguageModelToolSuccess` for Aion (B2 shows only the token and a log line). | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| The rule "a tool with empty `properties` makes every Gemma 4 tool prompt fail" is not established. Spike S1 phase 2 (`research/11`) measured Gemma 4's model process crashing with `kErrorUnknown` on ca | structure | unverifiable | Not found: research/11 |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - "Consider researcing recent Angular features via https://www.angular.courses/'s sub-pages (using /playwright-cli) and via the Angular changelog or Angular's GitHub Releases." | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| So section 4 (feature ideas) is the main output. Sections 2 and 3 are compact support for it. No idea is ranked down because the Angular feature behind it is experimental or in developer preview; the  | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - `debounced`: site says stable in 22; source says `@experimental 22.0` (`packages/core/src/resource/debounce.ts:32`, `packages/core/src/resource/api.ts:316,331`). Trust the source. | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - `enableProfiling()`: site says experimental in 21; source says `@publicApi v21.0` (`packages/core/src/render3/debug/chrome_dev_tools_performance.ts:370`). | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| `CHANGELOG.md` top entry is 22.2.0 (`CL:1-2`). Minor sections read: 22.2.0 `CL:1-46`, 22.1.0 `CL:370-438`, 22.0.0 `CL:841-1052`, 21.2.0 `CL:1616-1691`, 21.1.0 `CL:1802-1851`, 21.0.0 `CL:2173-2440`, 20 | config | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - 22.3.0-next.0: increment/decrement operators in template expressions. 22.3.0-next.1: `scrollMargin` for `@defer` viewport options. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| The `ng` inventory is `research/02-angular-surface.md` section 1.2. One new channel matters for every row below: | structure | verified | Exists: research/02-angular-surface.md |
| **Feature-usage marks [measured].** `performanceMarkFeature(name)` calls `performance.mark('mark_feature_usage', {detail: {feature}})` once per feature, in dev and prod (`packages/core/src/util/perfor | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| Each idea says what the on-device model adds that a static panel cannot. "Covered" refers to `docs/feature-proposals.md` (N1-N13, sections 5-6). New ideas come first, then extensions of existing propo | structure | verified | Exists: docs/feature-proposals.md |
| - Model adds: connects field state to the user's question and judges it. "Submit is blocked: `email` has a `required` error, `password` is valid but `username` is `pending` on an async validator debou | feature | verified | spikes/ng222-app/node_modules/@angular/build/node_modules/vite/dist/node/index.d.ts:3744 |
| - Model adds: explains which boundary caught what and why the page shows a fallback. "The `@boundary` in `ProductPage` caught `TypeError: price is undefined` from `PriceTag`; `$reset` retries. The inp | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - Tier 0 (inferred: needs a spike on a 22.2 app). Min 22.2. Status: developer preview. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Model adds: decides which tool groups to load before the question. If the app never marked `NgSignalForms`, the forms tools stay out of the session and save context in a 7-9K window; "this app uses  | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Covered: partly. `app.facts` (now `app_facts`) in 3.4 reads only the zoneless mark; step 1 of the model loop (3.3) picks groups from the question only. (Superseded 2026-10-12, review round 8: `app_f | structure | verified | Exists: docs/feature-proposals.md |
| - Tier 1. Min 20.0 (`linkedSignal` stable); the `set` advice needs 22.1. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Model adds: judges against a rule and explains. "`measureHeight` writes a signal in the `write` phase that the template reads, which schedules another CD pass each frame." | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Model adds: produces an artifact from a trace. "In this 4 s recording Angular ran 37 CD passes; `ProductList` took 61% of template time; 12 passes started from `scroll` listeners." | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - Covered: partly. Section 5 has "turn on Angular tracks"; N1 uses `ɵsetProfiler`, not the Performance panel. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| - Data: console output of `provideStabilityDebugging()`, captured by the MAIN-world console hook. Without the provider, fall back to the profiler and resource states (F1). | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| - Data: Aria directive instances via `ng.getDirectives`, roles and names from the accessibility tree (CDP `Accessibility` domain or DOM), a keyboard probe that sends key events. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - No idea was run. F3's `ng.getContext` reading of `{$error, $reset}` and F2's `FormField.state()` access from a MAIN-world script are the two claims to spike first on `spikes/ng222-app`. | structure | verified | Exists: spikes/ng222-app |
| - Angular Aria lives in angular/components; its directive names and statuses come only from angular.courses. | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Measured behaviour: `05-spikes.md`, section "Root cause hunt" (Chrome Beta 156.0.8078.17, Nano profile serving `v3Nano`). This file traces that behaviour through the Chromium source. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - **Ref used:** tag `156.0.8078.17`, the exact build that was measured. Its `chrome/VERSION` reads `156.0.8078.17`. Files were fetched raw from the GitHub mirror on 2026-10-11. Links below point at `h | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| **Definition [measured].** The message is `kExceptionMessageUnableToCreateSession` in [`third_party/blink/renderer/modules/ai/exception_helpers.cc#L68-L70`](https://github.com/chromium/chromium/blob/1 | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| The probe measured **`NotSupportedError`**. So the error comes from the second path. Blink rejects in the renderer, and the browser never receives a `CreateLanguageModel` call. The mojo enum exists, b | feature | verified | spikes/ng222-app/node_modules/.vite/vitest/7a7785ec6fcdebf6852283e7e35b5171b95ecf7a/deps/plugins.D2ut1V9b-DDzazuHB.js:4415 |
| **How the types travel [measured].** `LanguageModel::create` builds a `LanguageModelCreateClient` ([`LM#L590-L591`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/m | feature | aspirational | Aspirational claim (future/desired state) |
| **The check that fails [measured]:** this is in `LanguageModelCreateClient::Create` ([`CC#L264`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_ | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - `ModelClient`'s constructor adds `kToolUse` to every model's capabilities without condition ([`components/optimization_guide/core/model_execution/model_broker_client.cc#L86-L91`](https://github.com/ | feature | aspirational | Aspirational claim (future/desired state) |
| - As a result, the browser's later check `!model_client->capabilities().HasAll(params->capabilities)` in `AIManager::CreateLanguageModelInternal` ([`AIM#L973-L1001`](https://github.com/chromium/chromi | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - `kPromptAPIToolUseChoices` ([`chrome/browser/about_flags.cc#L4907-L4911`](https://github.com/chromium/chromium/blob/156.0.8078.17/chrome/browser/about_flags.cc#L4907-L4911)) sets `--enable-features= | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - `AIManager::CreateLanguageModelInternal` adds `kToolUse` only when `options->tools` is non-empty ([`AIM#L974-L977`](https://github.com/chromium/chromium/blob/156.0.8078.17/chrome/browser/ai/ai_manag | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| Neither layer checks the tool types. [measured] | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| - `LanguageModel::availability` ([`LM#L596-L656`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model.cc#L596-L656)) has no `AIPromptAPIToolUse | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - `LanguageModel::ExecuteAvailability` ([`LM#L659-L686`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model.cc#L659-L686)) sends the tool type | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| 2. **Browser, `AIManager::CanCreateLanguageModel` [measured]** ([`AIM#L737-L804`](https://github.com/chromium/chromium/blob/156.0.8078.17/chrome/browser/ai/ai_manager.cc#L737-L804)): | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - `HasInvalidOutputTypes` counts `kToolCall` as a valid output ([`AIM#L220-L240`](https://github.com/chromium/chromium/blob/156.0.8078.17/chrome/browser/ai/ai_manager.cc#L220-L240)). | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - The only tool gate, `!base::FeatureList::IsEnabled(kAIPromptAPIToolUse)`, runs only when `options->tools` is non-empty ([`AIM#L774-L783`](https://github.com/chromium/chromium/blob/156.0.8078.17/chro | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - What remains is the plain text/image/audio capability check and the language check, run by `CanCreateSession[WithConfig]` with `kPromptApi`. On this device that check returns `available`. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| 3. **Why `"tool-call"` gets past the bindings at all [measured].** The `LanguageModelMessageType` enum includes `"tool-call"` and `"tool-response"` with no `RuntimeEnabled` ([`IDL#L37`](https://github | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - `availability()` and `create()` share [compute language model options availability](https://github.com/webmachinelearning/prompt-api/blob/8040b8143949937e7bdd8dbe715a6d478bd41daf/index.bs#L415-L445) | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - That algorithm appends the "language model content type availability" ([`#L463-L471`](https://github.com/webmachinelearning/prompt-api/blob/8040b8143949937e7bdd8dbe715a6d478bd41daf/index.bs#L463-L47 | feature | aspirational | Aspirational claim (future/desired state) |
| - `create()`'s "initialize the language model" step (`#L322-L324`) throws `NotSupportedError` only when that same availability is `unavailable`. | feature | verified | .claude/skills/control-vitest-browser-angular/features/held-counter.md:50 |
| - So under the spec, a type the user agent does not support makes `availability()` return `unavailable`, and `availability()` and `create()` agree. Chrome 156 does not follow this for tool types. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| **The runtime feature [measured].** `AIPromptAPIToolUse` is defined in [`third_party/blink/renderer/platform/runtime_enabled_features.json5#L489-L500`](https://github.com/chromium/chromium/blob/156.0. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `LanguageModelToolCall` has `[Exposed(Window AIPromptAPI, Worker AIPromptAPIForWorkers), RuntimeEnabled=AIPromptAPIToolUse, SecureContext]` ([`IDL#L69-L79`](https://github.com/chromium/chromium/blob | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - `tools` is declared `[RuntimeEnabled=AIPromptAPIToolUse] sequence<LanguageModelToolDeclaration> tools;` in `LanguageModelCreateCoreOptions` ([`IDL#L151-L153`](https://github.com/chromium/chromium/bl | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - With the feature off, the dictionary member does not exist. The bindings skip the JS property, as they do for any unknown key, and `options_->hasTools()` returns false. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - the `"Tool use feature is not enabled"` reject at [`CC#L363-L371`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model_create_client.cc#L363- | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - [crbug 422803232](https://issues.chromium.org/issues/422803232) is public. Claude fetched its title through the tracker's JSON endpoint: "Feature Work: Implement function calling support in chromium | feature | aspirational | Aspirational claim (future/desired state) |
| - [#223 "Availability API does not provide actionable failure information"](https://github.com/webmachinelearning/prompt-api/issues/223), opened 2026-10-05, about `availability()` collapsing all failu | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - [#158 "Make API features queryable"](https://github.com/webmachinelearning/prompt-api/issues/158) asks for feature detection of tool support and similar. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - [#142 "is Tool calling working?"](https://github.com/webmachinelearning/prompt-api/issues/142), closed. The reported symptom matches ours: the tools were never called. domenic redirected it to the C | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - [#180 "[Tag Review] - Tool Use"](https://github.com/webmachinelearning/prompt-api/issues/180) and [#169 "[Tag Review] - Model selection and availability"](https://github.com/webmachinelearning/promp | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| - **`create()`:** `LanguageModelCreateClient::Create` rejects any `tool-call`/`tool-response` expected type with `NotSupportedError` and reuses the generic "unable to create a session" text. The rejec | feature | aspirational | Aspirational claim (future/desired state) |
| - **`availability()`:** neither the Blink code nor the browser's `CanCreateLanguageModel` checks expected tool types. The browser treats them as no-ops, and Blink never sends `tools` to the browser fr | feature | aspirational | Aspirational claim (future/desired state) |
| - **v3 Nano:** the model is not the cause. Chromium sets `kToolUse` on every model and relies on the Blink gate alone (TODO crbug 422803232). The link to v4 comes only from how the chrome://flags entr | feature | aspirational | Aspirational claim (future/desired state) |
| Answered: this probe ran later. With `AIPromptAPIToolUse` alone, `v3Nano` kept serving and every tool-typed `create()` succeeded; Nano answered in text, not with a tool call. See `05-spikes.md`, "Pred | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| Open question: does Nano then produce tool calls, or does tool-call formatting depend on `OnDeviceModelConversationBackend` and v4? The source read here does not answer that. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| Running this needs a browser session through `control-ai-browsers`, which this research did not open. (Superseded: run later; see the note at the top of this section.) | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - The official Chrome Prompt API page (`https://developer.chrome.com/docs/ai/prompt-api`, fetched via markdown.new) does not mention tools or function calling. It names Gemini Nano as the Prompt API's | structure | unverifiable | Not found: docs/ai/prompt-api |
| - No Google source documents tool calling for Gemini Nano, in Chrome or in Android's ML Kit GenAI Prompt API. For Android, Google promotes tool calling only for Gemma 4 (`https://android-developers.go | feature | verified | spikes/ng222-app/.angular/cache/22.2.2/ng222-app/vite/deps/core-C4Mibiy-.js:11455 |
| - The tool-use flag appears only in Chrome flag reporting about Gemma 4 (PiunikaWeb, `https://piunikaweb.com/2026/06/08/google-chrome-gemma-4-built-in-ai/`). Search summary only. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| Together with the measured matrix, the best reading is this (inferred). Chrome's code lets a Nano session accept tools, but Nano was never trained or documented for tool calls. Google ships tool calli | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Lars asked: "Research which of the models support tool calling and structured output. Compare to your evidence." | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| Sources already cited in `01`, `07` and `09` (C1-C3, S1, E1, E2, P1, G1-G3, B1-B3, the Chromium 156 source reads) are not repeated unless this note adds a new fact or a correction. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - No Google source claims Nano tool calling. MK, the newest official Nano page (2026-07-15), lists text and structured output only **[measured, MK]**. | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| - **Tools.** Microsoft's own positioning reserves tool calling for Aion 1.0 Plan (14B) and describes Instruct as a text-task model **[measured, WB]**. Measured in Edge Dev, Aion-1.1-Instruct called th | feature | verified | .claude/skills/control-pangular-inspector/features/live-inspection.md:39 |
| Sources and measurement agree that Gemma 4 calls tools and returns schema-valid JSON. The gap: GB claims "structured JSON output" as a model feature, but no Gemma page explains whether that means trai | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| `spikes/probes/bench.js:62` grades "Which signals does double in app-counter depend on?" with `/count/i.test(a) && !/title\|items/i.test(a)` **[measured, BJ]**. The regex `/count/i` also matches the "c | structure | unverifiable | Not found: spikes/probes/bench.js:62 |
| In `nano.json` (fallback mode), two of the three passes for this question are wrong answers **[measured, BJ]**: | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - Run 1, no tool call: "I am unable to answer this question without first inspecting the app-counter component, so I cannot determine which signals it depends on." Graded pass. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| - Run 2, it called `signal_info` for `count` instead of `double`: "The `count` signal in `app-counter` depends on nothing." Graded pass. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| - Run 3 is correct: "The signal 'double' in app-counter depends on the 'count' signal." | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| Corrected Nano fallback score: pass@3 5/5, pass^3 **2/5** (reported 3/5), runs **11/15** (reported 13/15). The Nano numbers are not in 05. For the other models, Aion fallback cannot be inflated, becau | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| Answered (2026-10-12): the grader was changed in `9c1b585`, but that check stripped `app-counter` and still passed answers about the `count` signal itself. `916fc09` requires the answer to name `doubl | structure | verified | Exists: spikes/probes/regrade.mjs |
| Each item names the instance (from `.audit/maintain-brief.md`, a local file not in git; the same ports are in `00-browser-probe.md`, "Per-model instances": Chrome Beta Nano on 9333, Gemma 4 on 9334, E | structure | verified | Exists: .claude/skills/control-ai-browsers/instances.json |
| 1. (Answered: grader fixed in `9c1b585` and again in `916fc09`; all four models benchmarked in 05's second round and backend comparison, raw JSON in `research/raw/bench/`; see "Correction" above.) **F | structure | verified | Exists: research/raw/bench/ |
| 2. **Nano native tool benchmark on the `AIPromptAPIToolUse`-only instance** (9333). Run `bench.js` native mode, 15 runs, with every tool having at least one required property. Record whether any `tool | config | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| 3. (Superseded: Edge Dev 157 does not serve Phi-4-mini, 00; Phi-4-mini was measured on Edge stable 155, port 9337, in 05's second round.) **Get Phi-4-mini onto disk** (9336). Check `edge://on-device-i | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| 4. (Partly answered: `bench.js` ran in both modes on Edge stable, port 9337, in 05's second round. The `tool-session-matrix.js` run and the workaround-flag comparison are still open.) **Phi-4-mini too | config | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Gemini Nano v3's chat template and tool format. Tried: Chrome docs C1/C2, ML Kit MK, web search for a Nano v3 model card (third-party results only), the `v3Nano` `manifest.json` in the Nano instance | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Whether Aion 1.1 was trained on tool calls or only shares Phi-4's tokenizer. No model card exists yet. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| - Extension: `spikes/s1-extension/`. One shared probe, `probe.js`, runs in every context and records `typeof LanguageModel`, `typeof LanguageModelToolCall`, `typeof LanguageModelToolSuccess`, `isSecur | structure | verified | Exists: spikes/s1-extension/ |
| - Each context writes its result to `chrome.storage.local` under its context name. Content scripts relay through the service worker (MAIN world -> `window.postMessage` -> isolated world -> `chrome.run | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - Runner: `node spikes/s1-extension/run-s1.mjs --browser chrome\|edge --port <n> [--model <label>] [--attach] [--keep-profile]`. It writes `research/s1-results/<browser>-<model>.json`. Launch mode star | structure | verified | Exists: spikes/s1-extension/run-s1.mjs |
| - Phase 1 ran an earlier revision of the extension: content scripts matched `<all_urls>` and the test page was `http://localhost:<p>/s1-test` from a server inside the runner. For phase 2 the content s | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| - Runs: Chrome Beta `156.0.8078.17` on port 9341, Edge Dev `157.0.4322.0` on port 9342, 2026-10-12 (the evidence files hold the last of several runs per browser; earlier runs differed only before the  | structure | verified | Exists: research/s1-results/chrome-fresh.json |
| - **The Prompt API, including the tool-use types, is exposed in all eight contexts in both browsers** **[measured]**. `LanguageModelToolCall` being a function everywhere shows `AIPromptAPIToolUse` rea | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - **Edge Dev 157 behaves like Chrome Beta 156 in every context** **[measured]**. This settles 01 section 3's Edge question for exposure; phase 2 shows Aion answering from those contexts. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - **`Extensions.loadUnpacked` works over `--remote-debugging-port`; the pipe is not needed** **[measured]**. It returned the extension id over the port in Chrome Beta 156 and Edge Dev 157, and over `- | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - **A file listed in two content-script entries is injected only once per frame: here into the isolated world, whose entry is listed first.** With `probe.js` listed in both the isolated and the MAIN-w | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `Extensions.extensionServer.onShowPanel` opened an extension panel in both branded browsers, not only in Chrome for Testing as the control-angular-devtools skill states **[measured]**. The runner ke | feature | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:43 |
| Runs on 2026-10-12: `chrome-beta-gemma4` (Chrome Beta 156.0.8078.17, `gemma4-2b-it`, GPU) at 02:10-02:12 UTC and `edge-dev-aion` (Edge Dev 157.0.4322.0, `Aion-1.1-Instruct`) at 02:13-02:14 UTC, one in | structure | verified | Exists: research/s1-results/chrome-gemma4.json |
| - The first phase 2 run on Gemma 4 used `probe6.js`'s tool names `getComponentCount` / `getComponentInputs`, each with one required parameter. The DevTools panel, side panel and service worker each fa | structure | verified | Exists: research/s1-results/chrome-gemma4-crash-doctor.json |
| - Whether `create()` from the service worker needs user activation when the model is `downloadable` (01 section 3 raises it). Phase 2 runs on instances where the model is already `available`, so it wi | feature | aspirational | Aspirational claim (future/desired state) |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Lars's ruling, verbatim (2026-10-12): "We are okay to abandon legacy Angular features like NgZone/zone.js (supporting zoneless only), NgModules, class-based vs. functional, template-based forms, and R | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| This file lists, for an Angular 22.2 dev-mode app, each legacy API or pattern next to its modern form, whether 22.2 deprecates it, the migration that converts it, whether a dev-mode page shows which f | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:217 |
| - **[measured]**: Claude observed it in an artifact: the spike app's built bundle (read as a file, not run) or a probe result already recorded in `research/raw/`. | structure | verified | Exists: research/raw/ |
| - `CL:n` = `A/CHANGELOG.md` line n. `CLI-CL:n` = `D:/projects/github/angular/angular-cli/CHANGELOG.md` line n (clone on branch `22.0.x`; its top section is 22.0.6, the 22.0.0 section starts at `CLI-CL | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `G/x:n` = `A/goldens/public-api/x.api.md` line n. The goldens are the public API reports, so a symbol counts as public when it appears there. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - `SC:n` = `A/packages/core/schematics/collection.json` line n (`ng generate @angular/core:<name>` schematics). `MJ:n` = `A/packages/core/schematics/migrations.json` line n (automatic `ng update` migr | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `adev/` = `A/adev/src/content/`. `SK/` = `D:/projects/github/angular/skills` at commit `747c3c2` (research/06). | structure | unverifiable | Not found: research/06 |
| - `spike main.js:n` = `spikes/ng222-app/dist/ng222-app/browser/main.js` line n in this repo, a development build of the 22.2 spike app (unminified, 968 `ngDevMode` references) [measured]. | structure | verified | Exists: spikes/ng222-app/dist/ng222-app/browser/main.js |
| - `A/CHANGELOG.md` `## Deprecations` sections 20.0 to 22.2 (`CL:372`, `CL:698`, `CL:887`, `CL:1804`, `CL:2290`, `CL:2902`, `CL:3501`) and `## Breaking Changes` 21.0 and 22.0 (`CL:846-886`, `CL:2177-22 | config | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - angular-cli: `CLI-CL:169-185` (22.0.0 Deprecations), builders and schematics JSON, `migration-collection.json`. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - adev guides and the style guide; the angular/skills references (research/06). | structure | unverifiable | Not found: research/06 |
| (`spike main.js:37258-37267`), followed by `ɵsetClassDebugInfo(Counter, { className: "Counter", filePath: "src/app/counter.ts", lineNumber: 15 })` (`spike main.js:37270`) [measured]. Library code ship | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - the class decorator kind: `decorators[0].type.prototype.ngMetadataName` is `'Component'`, `'Directive'`, `'NgModule'`, `'Injectable'` or `'Service'` (`core/src/util/decorators.ts:86`; `core/src/di/s | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - constructor parameters: a non-empty `ctorParameters()` means constructor injection [measured shape: `() => []` for `Counter`, which uses `inject()`; `() => [{type: ApplicationRef}]` for `Application | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| Tier 1 (internal static fields on the app's own classes, present only in dev builds with script optimization off) [inferred]. This supersedes research/08 section 3's "no runtime marker for `@Service`" | structure | unverifiable | Not found: research/08 |
| `@let` and `@defer` are additions with no documented legacy counterpart (no guide or deprecation names one), so they get no row; their marks `NgLet` and `NgDefer` show use (research/08 section 3) [doc | structure | unverifiable | Not found: research/08 |
| The earlier rulings of the same day still stand: Zone.js apps and NgModule apps stay "unsupported app" (the panel shows a notice instead of answering). Two later rulings of the same day: `@Injectable` | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - **works, not listed, no flag**: the row is `same`. The app works, the extension says nothing about it, and `docs/feature-proposals.md` section 1 does not list it as supported. If a later Angular ver | structure | verified | Exists: docs/feature-proposals.md |
| - **unsupported app**: Zone.js, NgModule and `@angular/upgrade` apps, by the rulings. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| "Unsupported app" means the panel shows a notice instead of answering, as it already does for Zone.js apps (`docs/feature-proposals.md` section 1). "Supported but flagged" means the app works and a ru | structure | verified | Exists: docs/feature-proposals.md |
| - `adev/src/content/reference/migrations/*.md` were listed, not read line by line; migration names and descriptions come from `SC` and `MJ`. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - No guide sentence was found that calls `RouterModule.forRoot` legacy on its own (R3 rests on the general NgModule guidance), or that names a legacy counterpart for `@let` or `@defer`; those got no s | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - `CHANGELOG.md` sections before 20.0 were not read; versions for tags without a version (for example `HttpClientModule`, class guards, `providedIn: 'any'`) are left blank rather than guessed. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| - 22.2.1 and 22.2.2 (GitHub releases newer than the local CHANGELOG, research/08 section 1.3) were not checked for new deprecations. | structure | unverifiable | Not found: research/08 |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| The portal's `subscribe` callbacks write only signals (for example `next: () => this.loaded.set(true)` in `libs/claim/feature-details/src/lib/details.component.ts:94`, and `this.form().value.set(...)` | structure | verified | Exists: docs/feature-proposals.md |
| - `@Input`/`@Output`/`EventEmitter` (24 hits) are all in `libs/plugins/eslint-rules/src/fixtures/` and one comment in `angular-scope.mjs`: test fixtures for a lint rule that detects legacy inputs. | feature | verified | .claude/skills/control-angular-devtools/features/attach.md:3 |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Why: Lars, on the proposals' line "No shipped framework devtools panel uses an on-device model": "We should still consider prior art DevTools that rely on cloud-based AI, MCP, WebMCP, or anything like | feature | aspirational | Aspirational claim (future/desired state) |
| What this file adds over `03-prior-art.md`: 03 covers Pangular Inspector, React DevTools, Chrome DevTools AI assistance (features and data list), chrome-devtools-mcp, Vue DevTools, Nuxt DevTools, Reac | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| The proposals' limits that each judgement is made against (`docs/feature-proposals.md`): | structure | verified | Exists: docs/feature-proposals.md |
| - the extension is only a browser extension: no server, no dev-server plugin, no npm package in the app (section 8); | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| - it generates no code of any kind (section 8); findings name the modern Angular pattern and why, and may name an official schematic; | feature | verified | .commandcode/skills/nx-generate/SKILL.md:99 |
| - writes from chat go behind a per-action confirm, with a read-only switch (3.5); | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| 03 describes these features but does not judge them against the proposals. Sources are the ones 03 and 01 cite; nothing here was re-read unless a later section says so. The judgement column uses the s | feature | verified | .claude/skills/control-pangular-inspector/features/live-inspection.md:39 |
| How it works **[measured, `mcp-handler.ts`, `tool-registry.ts`]**: a Vite middleware on the Storybook dev server serves an MCP server (`tmcp`, HTTP transport) at `/mcp`. Tools are grouped in three too | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - `declareExperimentalWebMcpTool` returns at once under SSR, reads `document.modelContext ?? navigator.modelContext`, and does nothing unless `registerTool` is a function (a DOM-clobbering guard, `dec | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Implicit Signal Forms tools (`packages/forms/signals/src/webmcp/registration.ts`): registration waits for an `effect` so a form built from a required input is ready (`:24-36`); the schema is inferre | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| Source: the `mcp__claude-in-chrome__*` tool definitions loaded in this Claude Code session (read, not run) **[measured]**. The agent is cloud Claude; the extension reads the page and acts on it. Group | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| Sources, read by the group A subagent (fetch log in its file; every page came back through markdown.new): https://developer.chrome.com/docs/devtools/ai-assistance/chat (updated 2026-05-20), .../data-u | structure | unverifiable | Not found: docs/devtools/ai-assistance/chat |
| Sources (group A): https://learn.microsoft.com/en-us/microsoft-edge/devtools/console/copilot-explain-console (ms.date 2024-03-20, updated 2026-01-15), https://learn.microsoft.com/en-us/microsoft-edge/ | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| Checked (group A): https://firefox-source-docs.mozilla.org/devtools-user/ and https://firefox-source-docs.mozilla.org/ai-agent-tools/index.html **[documented]**, plus a search **[search-summary]**. Fi | command | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| Checked (group A): https://developers.google.com/speed/docs/insights/v5/about (2024-10-21), https://developer.chrome.com/docs/performance/insights, https://developer.chrome.com/docs/lighthouse/overvie | structure | unverifiable | Not found: docs/insights/v5/about |
| Sources (group A): https://docs.sentry.io/product/ai-in-sentry/seer/, .../seer/autofix/, https://docs.sentry.io/product/ai-in-sentry/ai-privacy-and-security/, https://docs.sentry.io/security-legal-pii | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| Sources (group A): https://docs.replay.io/basics/replay-mcp/overview, https://docs.replay.io/reference/replay-mcp/tools, https://docs.replay.io/llms.txt, https://docs.replay.io/basics/replay-qa/agent- | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| Sources (group A): https://docs.logrocket.com/docs/galileo.md (2026-06-11), .../logrocket-galileo-ai-privacy-faq.md (2026-05-18), .../galileo-highlights.md (2025-08-19), .../ask-galileo.md (2026-06-08 | structure | unverifiable | Not found: docs/galileo.md |
| Sources (group B): https://raw.githubusercontent.com/vercel/next-devtools-mcp/main/README.md, https://nextjs.org/docs/app/guides/mcp (Next.js 16.4.0, 2026-10-02), https://nextjs.org/docs/app/guides/ai | structure | unverifiable | Not found: docs/app/guides/mcp |
| Vercel Toolbar and Comments (https://vercel.com/docs/vercel-toolbar, https://vercel.com/docs/comments **[documented]**): no AI, agent or v0 feature on either page. Nothing to judge. | structure | unverifiable | Not found: docs/vercel-toolbar, |
| Sources (group B): `packages/nuxt-mcp-dev/src/tools/runtime.ts`, `scaffold.ts` and `src/prompts/basic.ts` in https://github.com/antfu/nuxt-mcp **[measured]**; its README **[documented]**; https://devt | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| Sources (group B): https://devtools.vuejs.org/ and its features page, the `vuejs/devtools` README and `AGENTS.md` **[documented]**; `raw.githubusercontent.com/vuejs/mcp/main/README.md` returned 404. V | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| Sources (group B): https://raw.githubusercontent.com/sveltejs/mcp/main/README.md, `documentation/docs/30-mcp/40-tools.md`, `50-resources.md`, `70-cli.md` **[documented]**; tool handler names from `pac | structure | unverifiable | Not found: docs/30-mcp/40-tools.md |
| Sources (group B): https://raw.githubusercontent.com/TanStack/devtools/main/README.md, `docs/webmcp-tools.md`, `packages/devtools-webmcp/README.md` **[documented]**; `vitejs/devtools` `packages/core/s | structure | unverifiable | Not found: docs/webmcp-tools.md |
| Sources (group B): https://raw.githubusercontent.com/microsoft/playwright-mcp/main/README.md **[documented]**; local clone `D:/projects/github/microsoft/playwright` (HEAD 2026-09-25), `packages/playwr | feature | verified | .claude/skills/control-ai-browsers/features/README.md:53 |
| Sources (group C): Claude in Chrome, https://support.claude.com/en/articles/12012173-getting-started-with-claude-in-chrome (2026-08-26) and https://claude.com/chrome; VS Code Copilot browser tools, ht | structure | unverifiable | Not found: docs/agents/run/browser-tools |
| Lars, verbatim: "I didn't mean that Angular AI DevTools should export its tools as WebMCP, I meant that it may add a prerequisite for an Angular application to expose WebMCP, or support Angular paplic | feature | aspirational | Aspirational claim (future/desired state) |
| Sources for this section, all read in this run unless marked otherwise: the WebMCP explainer README, `declarative-api-explainer.md` and `implementation-status.md`, and the spec source `index.bs` at `w | structure | unverifiable | Not found: docs/ai/webmcp |
| - Exposure: by default a tool is visible to its own document, same-origin documents in the frame tree and the browser's built-in agent; `exposedTo` widens it to named origins; the `tools` Permissions  | feature | verified | spikes/ng222-app/.angular/cache/22.2.2/ng222-app/vite/deps/core-C4Mibiy-.js:11455 |
| - Consumers today: Brave Leo, ChatGPT Desktop, the Chrome 149 and Edge 150 origin trials, Meta AI on Ray-Ban Display **[documented, implementation-status]**; Playwright MCP lists and calls page tools  | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| 2. **One read tool per thing the page shows**, named `get_<thing>` (lowercase, snake_case, under 30 characters, no dot: dots are legal in the spec but untested on Gemma 4, and uppercase fails there, S | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| 4. **Mark every tool that can reach a server** with `consequentialHint: true`, and every read that returns user-written content with `untrustedContentHint: true` (secure-tools page). The extension con | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| 7. **Do not expose Angular internals through WebMCP** for the extension's sake: the signal graph, DI and change detection come from `ng` (Tier 0 and 1). If an app ever needs to hand the extension some | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - **Naming per session.** As N9 states: app tools go unchanged to Aion's native tools and to the structured-output loop on any model, where the name is only text inside a JSON schema. A native tool se | feature | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:43 |
| - **Confirm.** Every WebMCP call pauses for the confirm, including `readOnlyHint: true` tools, because the hint is the app's claim (3.5). The Google sample runs `readOnlyHint: true` tools without aski | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - **Visibility.** The extension's page agent runs in the page's own origin, so the default exposure covers it and `exposedTo` is not needed **[inferred from the default exposure rule; not run]**. If t | feature | aspirational | Aspirational claim (future/desired state) |
| - **C2. `wait_for` and change-detection diff.** Prompt: "Click submit, then tell me what changed." Two tools after agent-react-devtools (1.0): `wait_for {condition: stable\|navigation}` that returns wh | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - **C4. Open the story for this component.** Prompt: "Show me this component in Storybook." Match `ɵcmp.debugInfo.filePath` against the story index's `importPath` (`/index.json`, Tier 0 by URL) and op | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **C5. "What this tool sends" per tool, and an exclusion list.** No prompt; a panel table after Chrome's data-usage page (1.5): one line per tool naming the fields it sends to the model, and a fixed  | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| - **C6. WebMCP call log and manual run in N9.** No new prompt; N9's report gets the DevTools WebMCP pane's shape (1.5, 3.2): per tool a counter, a log of each call with status, input and output, "neve | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - **C7. A skill file for chrome-devtools-mcp users.** Not a panel feature: a short skill document, after Replay's and TanStack's skills and Next.js's managed `AGENTS.md` block (1.10, 1.17, 1.12), that | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 4. **C2, `wait_for` and change-detection diff.** "What changed after I clicked?" is the incremental read that 03's takeaways and Pangular's `since` markers call for, and it reuses `cd_record` with no  | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| Nothing in this file was run: no browser, no model, no Angular app with WebMCP tools (the brief forbids installs and browser runs). Every "fits" is a reading of documented or measured APIs against the | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - PageSpeed Insights: no Gemini feature was found by page reads and one search; absence is not proof. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - Next.js: `next-devtools-mcp`'s tool source was not read (README only); the `devIndicators` reference page returned 403, so in-browser panel AI features beyond "Copy prompt" are unknown; the `agent-b | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Observations for upstream, not filed (Lars files from the ledger; the brief says edit nothing else, so these are not added to `docs/filing-ledger.md`): | structure | verified | Exists: docs/filing-ledger.md |
| - Playwright MCP's README omits `browser_webmcp_list` and `browser_webmcp_call`, which its source defines (1.18) **[measured for the source; documented for the README]**. | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:109 |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Written 2026-10-12 by Claude for Lars. No browser was run for this note; the probes it needs are spikes S14 and S15 (section 4). Every claim carries a label: | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| Claude reads "offload deterministic computations to the main thread" as "run them as ordinary JavaScript instead of asking the model", not as a preference for the page's main thread. Section 1 says wh | feature | aspirational | Aspirational claim (future/desired state) |
| Project evidence: `research/00`, `01`, `02`, `05`, `07`, `11`, `docs/feature-proposals.md` (cited by section), and `research/raw/tosignal-node-portal.json`. | structure | unverifiable | Not found: research/00 |
| 3. **Workers with built-in AI are possible only when an extension page starts them, and that is read in source, not run.** Chromium enables `AIPromptAPIForWorkers` (and the Summarizer, Writer, Rewrite | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 4. **Eight patterns** (section 2) cut what the model receives by one to two orders of magnitude on the measured data: for example one component's signal graph on the portal is 13,878-25,838 characters | structure | verified | Exists: research/raw/tosignal-node-portal.json |
| The rows 1-6 results above come from S1 (`research/11`), which measured the same values in Chrome Beta 156 and Edge Dev 157 in every context **[measured]**. Rows 7-9 were not run in either browser. | structure | unverifiable | Not found: research/11 |
| - **Reads stay in the MAIN world and are shaped there [inferred design].** The page agent calls `ng.*`, turns each value into the capped result shape of proposals 3.6 (strings at most 200 characters,  | command | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - **When:** every fact that has an algorithm: counts, diffs of two paths, rule checks, graph walks, cycle detection, epoch comparisons, matching an error code to a digest entry. | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| - **What stays deterministic:** the fact itself and whether a finding exists. The proposals already do this for N2's rules, N10's lint, `app_facts` and the support checks (3.3, 3.4). This pattern exte | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| - **Input it buys:** a finding object (rule id, component, node label, one line of evidence) is under 100 tokens, plus at most 150 tokens of rule text from `get_rule` **[inferred]**, against 3,500-6,5 | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - **When:** a question names a node or a component ("where does `total` come from", "what is this `toSignal.source` node"). | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - **What stays deterministic:** the walk. Code takes the k-hop producers and consumers of the node, drops library-internal nodes, and emits named facts (`dependsOn: [...]`) instead of edges by index ( | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:51 |
| - **Limit:** a question about a chain longer than k hops needs `signal_trace`, which is the same walk with a larger k and one line per hop. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - **Map output is extraction, not prose:** each chunk returns fields that code checks (ids that exist, enums), so the merge never parses free text **[inferred design]**. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - **What this note adds:** the cap is set per session from the measured window: before a tool result goes back, code calls `measureContextUsage()` on it and, if it would leave less than the free margi | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| - **Input it buys:** one result stays at a few hundred tokens; `find_components` returns at most 15 entries (3.4), about 600 tokens at about 40 tokens each **[inferred]**. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| - **When:** whenever the model's output drives code: the intent step (3.3 step 1), finding schemas (N2, N10, N24), map steps (2.3). | feature | verified | .claude/skills/control-ai-browsers/features/README.md:12 |
| - **What stays deterministic:** validation and the fallback. Code checks every value (ids exist, rule ids are in the table, labels are in the slice) because constrained decoding guarantees shape, not  | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:702 |
| - **Why a fallback, not a retry loop:** Nano on CPU returned empty or cut-off JSON in 14 of 15 runs (2.1 of the proposals) **[measured]**, and on Chrome each `kErrorUnknown` may count toward the three | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - **Input it buys:** each chunk starts from the base's few hundred tokens instead of carrying earlier chunks; tool declarations cost tokens in every clone (one two-tool round trip used 1,007 tokens on | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **What stays deterministic:** the key and the hit. Every `ɵgetSignalGraph` node carries `epoch` (02 section 1.2, `debug_signal_graph.ts:68-96`) **[measured in source]**. Code keys a slice, a finding | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - **Limits:** a plain field (N24's case) is not a graph node, so its change does not move any epoch **[inferred from 05, "an effect's signal writes"]**; the key must also hold the component's plain-fi | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| - **What code can still do:** the global relations that have an algorithm stay global in code: cycles, reachability, which components read a changed signal, which injector provides a token for every c | feature | verified | .claude/skills/control-angular-devtools/SKILL.md:87 |
| - **The reduce step has its own budget:** 47 map results at about 100 tokens each are about 4,700 tokens, close to Aion's usable 5,400 (2.3), so a reduce over many chunks needs a second level, which a | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| Steps (extend `spikes/s1-extension/`; follow S1's rule that `create()` runs only when `availability()` is `available`, so no download starts): | structure | verified | Exists: spikes/s1-extension/ |
| 1. Add `worker.js`: `importScripts('probe.js'); self.onmessage = async (e) => self.postMessage(await (e.data.roundTrip ? s1RunRoundTrip(e.data.ctx) : s1Probe(e.data.ctx)));`. Also record `typeof Summa | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 2. Add `shared.js`: the same handler on `self.onconnect` ports. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 3. Spawn `new Worker('worker.js')` from `panel.js`, `sidepanel.js`, `offscreen.js` and `tab.js`; spawn `new SharedWorker('shared.js')` from `tab.js`. Each parent stores the worker's result in `chrome. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 5. Add the context names (`devtools_panel_worker`, `side_panel_worker`, `offscreen_worker`, `extension_tab_worker`, `extension_tab_shared_worker`) to `CONTEXTS` in `run-s1.mjs`, and trigger each round | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| 6. Negative control: in `cs-main.js`, create a worker from a `Blob` URL holding a minimal probe (`typeof LanguageModel`, `typeof Summarizer`, `availability()` when defined); post its result to the iso | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 7. Thread check: from `tab.js` (or the panel), ask the offscreen document to run a 2,000 ms busy loop; meanwhile the panel records the longest gap between `requestAnimationFrame` callbacks and the del | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| 9. Run: `node .claude/skills/control-ai-browsers/scripts/control.mjs attach chrome-beta-gemma4`, then `doctor chrome-beta-gemma4` (exit 0), then `node spikes/s1-extension/run-s1.mjs --browser chrome - | structure | verified | Exists: .claude/skills/control-ai-browsers/scripts/control.mjs |
| 10. Record per worker context: `typeof LanguageModel`, `typeof LanguageModelToolCall`, `availability()` with and without tool options, `contextWindow`, the round trip's calls, answer, `contextUsage` a | structure | unverifiable | Not found: research/s1-results/<browser>-<model>-workers.json |
| 3. Run four 2,000-token prompts on four clones one after another, then the same four concurrently with `Promise.all`; record total wall time for both, three runs each. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| 5. Record the backend from Broker State and the CPU load, as `control.mjs bench` does, because the earlier rounds ran under load. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - Any timing of deterministic work on the page thread; the "small work" claims in 1.2 and the summary are **[inferred]**. | feature | verified | .claude/skills/control-angular-dev-app/features/portal-claims.md:1 |
| - The Summarizer's quota and speed (S15), and how a summary of a stack trace reads on these models. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| - The library-node rule beyond Claude's label list (2.2): the per-field repetition rule and the `debuggableFn` rule are not run. | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| development mode, and which SSR feature candidates in `docs/feature-proposals.md` does the page support? | structure | verified | Exists: docs/feature-proposals.md |
| under `spikes/ng222-ssr/node_modules/@angular/*` (file and line named); **[inferred]** = Claude's reading, not | structure | unverifiable | Not found: spikes/ng222-ssr/node_modules/@angular/* |
| - Fixture: `spikes/ng222-ssr`, created with `ng new ng222-ssr --ssr --routing --style css --skip-git | structure | verified | Exists: spikes/ng222-ssr |
| - Routes (`app.routes.server.ts`): `/` `RenderMode.Server`, `/prerender` `RenderMode.Prerender`, `/client` | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Data: `app.get('/api/items')` in `src/server.ts`, logging each hit with its user agent. The dev server runs | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `server.ts`, so the route answers under `ng serve` **[measured, `app.log` lines `[api] GET /api/items ...`]**. | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| - Server: `ng serve --port 4223 --no-hmr` through `control-angular-dev-app` (`--target ssr`). HMR is off | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Browser: the skill's playwright-cli session (headless Chromium 154). Probes in `spikes/probes/ssr-*.js`, | structure | unverifiable | Not found: spikes/probes/ssr-*.js |
| `research/raw/ssr-*.json`. | structure | unverifiable | Not found: research/raw/ssr-*.json |
| Raw: `research/raw/ssr-hydration.json`. | structure | verified | Exists: research/raw/ssr-hydration.json |
| `hydrated`, `skipped`, `mismatched` **[documented, `core/fesm2022/_debug_node-chunk.mjs:2496-2509`]**. On a | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `dehydratedViewsCleanupRuns`, `componentsSkippedHydration`, `deferBlocksWithIncrementalHydration` | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| **[documented, `_pending_tasks-chunk.mjs:616-621`]**. Values per page load **[measured]**: | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `@defer` block hydrated **[measured, `research/raw/ssr-defer.json`]**. | structure | verified | Exists: research/raw/ssr-defer.json |
| Raw: `research/raw/ssr-hydration.json` (`/?mismatch=1`). | structure | verified | Exists: research/raw/ssr-hydration.json |
| the host walk is in `_debug_node-chunk.mjs:2541-2549`, documented]**. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - How the page shows it: one console error, `ERROR RuntimeError: NG0500: During hydration Angular expected | feature | aspirational | Aspirational claim (future/desired state) |
| and there is no error and no non-hydrated node **[measured]**. Hydration matches nodes by type and tag, so | command | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| Raw: `research/raw/ssr-transfer.json`. | structure | verified | Exists: research/raw/ssr-transfer.json |
| - `ng.ɵgetTransferState(ng.getInjector(appRoot))` re-reads `<script id="ng-state">` from the document and | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| leaves out Angular's internal hydration keys **[documented, `_debug_node-chunk.mjs:12893-12903`]**. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| - On `/` it returns one key, a 64-hex-character hash, holding the transfer cache entry `{b, h, s, st, u, rt}`: | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| It shows what the server sent, not what the client cache still holds **[inferred from the source above]**. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - With `?transfer=0` the entry is absent and `ɵgetTransferState` returns `{}`; on `/client` there is no | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| `ng-state` script and it returns `{}` **[measured]**. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| Raw: `research/raw/ssr-transfer.json`; server log of the run (`[api]` lines, 4 new hits during the probe). | structure | verified | Exists: research/raw/ssr-transfer.json |
| **[documented, `platform-browser.mjs:355-372`]**; a later request for the same URL goes to the network | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| Raw: `research/raw/ssr-event-replay.json` (main.js held with `page.route`, one click, then released); | structure | verified | Exists: research/raw/ssr-event-replay.json |
| `research/raw/ssr-defer.json` (incremental hydration). | structure | verified | Exists: research/raw/ssr-defer.json |
| `withEventReplay()` **[documented, `platform-browser.mjs:355`, `core.mjs:638-639`]**. The page sets the | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| everything outside the dehydrated `@defer` block, and the page shows `Early clicks: 1`, so the click was | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| - So an extension sees the queue only if its script runs in the page's main world before `main.js` | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| Raw: `research/raw/ssr-render-modes.json` (each route a full load; raw HTML read with `page.request.get` | structure | verified | Exists: research/raw/ssr-render-modes.json |
| (`CLIENT_RENDER_MODE_FLAG`, **[documented, `core.mjs:550-553`]**). Under `ng serve` the prerender route is | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| rendered per request; a production build writes its HTML at build time (`ng build` printed "Prerendered 1 | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:43 |
| static route" **[measured]**), and what a production server sends for it was not measured. The `ngh` | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| content), so an extension reads them from the server HTML or before hydration **[measured]**. | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| Raw: `research/raw/ssr-defer.json`. | structure | verified | Exists: research/raw/ssr-defer.json |
| - `ɵgetControlFlowBlocks(node)` returns the `@defer` (`type: 0`) and `@for` (`type: 1`) blocks of the view that | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| holds `node`, filtered to blocks inside `node` **[documented, `_debug_node-chunk.mjs:11934-11990`]**. On | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `<body>` it returns `[]`; on `<app-root>` and `<app-page>` both blocks; on `<h1>` only the `@for` **[measured]**. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| Raw: `research/raw/ssr-render-modes.json`. | structure | verified | Exists: research/raw/ssr-render-modes.json |
| - The server's view of `REQUEST`, `RESPONSE_INIT`, and the server route table (`app.routes.server.ts`): the | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| worlds work; research/11 covers the extension contexts]**. | structure | unverifiable | Not found: research/11 |
| - `research/raw/ssr-hydration.json` (1, 2): `spikes/probes/ssr-hydration.js` | structure | verified | Exists: research/raw/ssr-hydration.json |
| - `research/raw/ssr-transfer.json` (3, 4): `spikes/probes/ssr-transfer.js` | structure | verified | Exists: research/raw/ssr-transfer.json |
| - `research/raw/ssr-event-replay.json` (5): `spikes/probes/ssr-event-replay.js` | structure | verified | Exists: research/raw/ssr-event-replay.json |
| - `research/raw/ssr-render-modes.json` (6, 8): `spikes/probes/ssr-render-modes.js` | structure | verified | Exists: research/raw/ssr-render-modes.json |
| - `research/raw/ssr-defer.json` (5, 7): `spikes/probes/ssr-defer.js` | structure | verified | Exists: research/raw/ssr-defer.json |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 2. "Could we support the Angular AI DevTools web extension in Vitest Browser+Playwright attaching to real | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| `LanguageModel` report from the tester iframe, and which of the four section 6.3 candidates does the page | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| (`spikes/ng222-app/node_modules/...`, file named) or a vendor statement; **[inferred]** = Claude's reading, not run. | structure | unverifiable | Not found: spikes/ng222-app/node_modules/... |
| inside the tester iframe **[measured, `research/raw/vitest-attach-gemma4.json`]**. | structure | verified | Exists: research/raw/vitest-attach-gemma4.json |
| Raw files: `research/raw/vitest-attach-gemma4.json` (route 2), `research/raw/vitest-chromium-bundled.json` | structure | verified | Exists: research/raw/vitest-attach-gemma4.json |
| (route 1), `research/raw/vitest-attach-gemma4-newcontext.json` (route 2b), | structure | verified | Exists: research/raw/vitest-attach-gemma4-newcontext.json |
| `research/raw/vitest-attach-gemma4-doctor-before.json` and `-after.json` (the instance's doctor | structure | verified | Exists: research/raw/vitest-attach-gemma4-doctor-before.json |
| around the route 2 run). Probes: `spikes/probes/vitest-attach.mjs` (runner) and | structure | verified | Exists: spikes/probes/vitest-attach.mjs |
| `spikes/probes/vitest-iframe-probe.js` (evaluated in the tester iframe). | structure | verified | Exists: spikes/probes/vitest-iframe-probe.js |
| - Fixture: `spikes/ng222-app` (Angular 22.2.2, zoneless, standalone). Added, all pinned exactly: `vitest` | structure | verified | Exists: spikes/ng222-app |
| `vitest` 5.0.4, and npm 11 failed with `Cannot read properties of null (reading 'explain')` **[measured]**. | feature | verified | .claude/skills/control-pangular-inspector/features/setup.md:16 |
| (`@angular/build/src/builders/unit-test/runners/vitest/browser-provider.js:49-60`) **[documented]**. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `angular.json` `test`: options `runnerConfig: true`; configurations `headless` (default, | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - `vitest-base.config.mts`: Vitest's default browser port 63315 lies in a Windows excluded TCP range on this | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| **[measured]**. Vitest 5 takes the browser server port from the project's `test.api`, not from | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| `test.browser.api` (`vitest/dist/chunks/index.DpLw24bj.js:9579`) **[documented]**. Setting `test.api` at the | config | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| root also started Vitest's API server on the same port ("Port 51315 is already in use") **[measured]**. The | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| - Tests, `src/app/counter.spec.ts`, using `render` from `vitest-browser-angular` and DOM assertions: | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:22 |
| 1. "shows the next count after the user clicks Increment" (passes); | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| 2. "shows the cart size from an overridden CartService" (passes; `providers` with | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:37 |
| 3. "shows the next count in the same task as the click (fails on purpose)", only with | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| `VITE_COUNTER_TIMING_DEMO=1`. It reads `textContent` synchronously after `button.click()` and fails with | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| expects the count to rise by one from its value just before the click. The spike runs below used an | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| `VITE_`-prefixed variables reach the browser as `import.meta.env.<name>` (Vitest browser defines them from | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:109 |
| `test.env`, `@vitest/browser/dist/index.js:3454-3458`) **[documented; measured by test 3 running only when | config | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - Runs: `ng test` (default `headless`) 2 passed, 2 skipped, exit 0; with `VITE_COUNTER_TIMING_DEMO=1` 1 failed, | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| 2 passed, exit 1; `ng test -c attach` against Chrome Beta 2 passed, exit 0 **[measured]**. `ngc -p | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| tsconfig.spec.json --noEmit` and `ngc -p tsconfig.app.json --noEmit` exit 0; a planted type error in a spec | status | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| made the first exit 1, so the check does run **[measured]**. | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| (`@vitest/browser-playwright/dist/index.js:1009-1053`) **[documented]**. There is no `connectOverCDP` call. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| needs a `launchServer` endpoint: Playwright throws "Malformed endpoint. Did you use | feature | verified | .claude/skills/control-vitest-browser-angular/features/held-counter.md:50 |
| (`playwright-core/lib/coreBundle.js`, the `connect` path) **[documented]**. A Playwright server started with | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **Context: always a new one unless persistent.** `createContext` uses | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| `this.persistentContext ?? await browser.newContext(options)` (`index.js:1198`) **[documented]**. Measured with the | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| registered in the time allowed **[measured, `research/raw/vitest-attach-gemma4-newcontext.json`]**. So a new | structure | verified | Exists: research/raw/vitest-attach-gemma4-newcontext.json |
| run, CDP calls began to time out after the tester mounted (`Runtime.evaluate` of the prompt probe, then | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| A relaunch was healthy: doctor exit 0, model `Ready`/`Available`, and `Extensions.getExtensions` empty | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| - **The provider class is exported** (`export { PlaywrightBrowserProvider, playwright }`, `index.js` last line) | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| **[documented]**, so a small subclass can attach. `spikes/ng222-app/vitest-attach.config.mts`: | structure | verified | Exists: spikes/ng222-app/vitest-attach.config.mts |
| `openBrowser()` calls `chromium.connectOverCDP(VITEST_CDP_URL)` and sets | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:20 |
| opened and then calls `browser.close()`. For a CDP connection that disconnects and leaves the browser | feature | verified | spikes/ng222-app/node_modules/@angular/build/node_modules/vite/dist/node/index.d.ts:3744 |
| (`prewarmBrowser`, `index.js:867-905`) **[documented]**. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| (`plugins.js`, `projectOverrides`). `providerFactory` closes over its own `options`, so user | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **Measured on `chrome-beta-gemma4`** (Chrome Beta 156.0.8078.17, port 9334, launched by | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| Run: `node spikes/probes/vitest-attach.mjs --route attach --cdp-port 9334 --label gemma4 --hold 40000` | structure | verified | Exists: spikes/probes/vitest-attach.mjs |
| (10:27 UTC). The runner copies `spikes/s1-extension` to `tmp/vitest-ext/<label>`. In the copy, the content scripts | structure | verified | Exists: spikes/s1-extension |
| match `http://127.0.0.1/*` and `http://localhost/*` with `all_frames: true`, and each result is keyed by frame. | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| The runner loads the copy with `Extensions.loadUnpacked`, runs | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| - **Doctor before and after:** both exit 0. Every check passed, with the same single `[WARN]` (a v3Nano model also | status | verified | .claude/skills/control-ai-browsers/features/health-check.md:27 |
| browser with a CDP port **[inferred]**. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:30 |
| The provider calls `launchPersistentContext` and uses that context for every page (`index.js:1030-1038`, | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| `1198`) **[documented]**. `persistentContext` is ignored when tests run in parallel (`index.js:1026-1029`) | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| Run: `node spikes/probes/vitest-attach.mjs --route chromium --cdp-port 9350 --label bundled --hold 30000`: | structure | verified | Exists: spikes/probes/vitest-attach.mjs |
| passed **[measured, `research/raw/vitest-chromium-bundled.json`]**. `LanguageModel` is a function but | structure | verified | Exists: research/raw/vitest-chromium-bundled.json |
| Not measured. `@vitest/browser-preview` 5.0.3 (`dist/index.js`, read from the registry tarball): | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| `openPage()` sets Vite's `server.open` to the test URL and calls `vite.openBrowser()`. It refuses headless mode | feature | verified | .claude/skills/control-ai-browsers/features/model-lifecycle.md:45 |
| and has no CDP session (`getCommandsContext()` returns `{}`) **[documented]**. Vite opens the system default | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:43 |
| Playwright **[inferred from `locators.js` delegating to `userEvent`]**. Route 2 gives the same browser with | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| All from `research/raw/vitest-attach-gemma4.json` (route 2); route 1 gave the same Angular values **[measured]**. | structure | verified | Exists: research/raw/vitest-attach-gemma4.json |
| - **URLs.** Orchestrator: `http://127.0.0.1:<port>/__vitest_test__/?sessionId=<uuid>`. Tester iframe: | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| `http://127.0.0.1:<port>/?sessionId=<uuid>&iframeId=__vitest_all__`, frame name `vitest-iframe`, attribute | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| sets `isolate: false` (`plugins.js`, `projectDefaults`) **[documented]**; with isolation on, the id would | feature | verified | .claude/skills/control-ai-browsers/features/instances.md:5 |
| - **Same origin.** Orchestrator and tester share the origin `http://127.0.0.1:<port>`. A script in the | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| `createOrReusePlatformInjector` call `publishDefaultGlobalUtils()` (`@angular/core/fesm2022/core.mjs:2323, | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:32 |
| `ɵgetDependenciesFromInjectable` shows `CartService` resolved from the `R3Injector` with | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:21 |
| record with provider keys `provide`, `useValue` **[measured]**. On the null injector it throws | feature | verified | .claude/skills/control-vitest-browser-angular/features/held-counter.md:50 |
| "getInjectorProviders only supports NodeInjector and EnvironmentInjector" **[measured]**. | feature | verified | .claude/skills/control-vitest-browser-angular/features/held-counter.md:50 |
| test needs watch mode or a held test **[inferred]**. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| The extension generates no code, and each finding names the modern Angular pattern and why (Lars's rulings). | feature | verified | .commandcode/skills/nx-generate/SKILL.md:99 |
| would give: in a zoneless app, change detection runs in a later task, so await the interaction and use | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| 3. **Test-against-app diff: supported with a held or watched test.** The same `ng.*` reads work in the tester | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:12 |
| places separately]**. The extension runs in both tabs of one browser under route 2 **[inferred; one tab | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |
| measured here]**. The diff needs the test's component alive, so it needs watch mode or a held test **[inferred | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| - Not measured, and open: Edge Dev or Edge stable under route 2; isolated runs (`isolate: true`, one iframe per | feature | verified | .claude/skills/control-ai-browsers/features/health-check.md:3 |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command: | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files. | config | verified | .claude/skills/control-ai-browsers/features/instances.md:20 |
| To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command: | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |
| Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs. | feature | verified | .claude/skills/control-ai-browsers/features/README.md:29 |
| For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page. | feature | verified | .claude/skills/control-ai-browsers/features/probes.md:34 |

## Descriptive docs

- .commandcode/skills/nx-workspace/references/AFFECTED.md
- .commandcode/taste/taste.md
- AGENTS.md

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 1 | .claude/skills/control-ai-browsers/SKILL.md | `scripts/control.mjs` does the deterministic steps; page code runs through playwright-cli attached over CDP. Lars's | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 2 | .claude/skills/control-angular-dev-app/SKILL.md | which is expected ("expected while a devtools server runs"). | aspirational | fix-doc | Mark as aspirational or implement |
| 3 | .claude/skills/control-angular-dev-app/SKILL.md | `scripts/control.mjs <command> [--target counter\|ssr\|portal] [--url <url>] [--port N] [--dir <path>] [--timeout S] [--json]` | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 4 | .claude/skills/control-angular-dev-app/SKILL.md | `scripts/ng-inspect.js` is a playwright-cli `run-code` file: it installs `__ngc` and returns the doctor's page | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 5 | .claude/skills/control-angular-dev-app/SKILL.md | facts. `scripts/ssr-check.js` is a `run-code` file for the SSR target (Inspect). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 6 | .claude/skills/control-angular-dev-app/features/ssr.md | `ok` is `true` when all six checks pass; `expected-mismatch-detected` is the `?mismatch=1` case. | aspirational | fix-doc | Mark as aspirational or implement |
| 7 | .claude/skills/control-angular-devtools/SKILL.md | `scripts/control.mjs <command> [options] [--json]`; exit 0 done or healthy, 1 not healthy, 2 refused or | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 8 | .claude/skills/control-pangular-inspector/SKILL.md | Manages Pangular Inspector in a target Angular app and reads the running app through it. `scripts/control.mjs` | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 9 | .claude/skills/control-pangular-inspector/SKILL.md | id), `console-errors` (none besides the overlay's expected `/__connection.json` 404). | aspirational | fix-doc | Mark as aspirational or implement |
| 10 | .claude/skills/control-pangular-inspector/SKILL.md | `scripts/control.mjs <command> [--dir <app>] [--project <name>] [--port N] [--json]` | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 11 | .claude/skills/control-pangular-inspector/features/setup.md | uncommitted install (read from `remove` in `scripts/control.mjs`, not run in this pass). Taking Pangular out | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 12 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | writes them to `research/raw/vitest-attach-<label>.json` under `extensionStorage`. That folder is tracked: | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 13 | .claude/skills/verify-ai-browsers/SKILL.md | Turns `control-ai-browsers` into a verdict. `scripts/verify.mjs` runs that skill's `scripts/control.mjs` steps in | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 14 | .claude/skills/verify-ai-browsers/SKILL.md | `scripts/verify.mjs state [<instance>...] \| cycle <instance> [--timeout-min=45] [--evidence=<dir>]` | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 15 | .claude/skills/verify-angular-dev-app/SKILL.md | 4. Record `?mismatch=1` as the expected failure: `expected-mismatch-detected` passes when `<app-mismatch>` is | aspirational | fix-doc | Mark as aspirational or implement |
| 16 | .claude/skills/verify-angular-dev-app/SKILL.md | `mismatched` and NG0500 is logged. Copy its expected and actual DOM into `verdict.md`. | aspirational | fix-doc | Mark as aspirational or implement |
| 17 | .claude/skills/verify-angular-devtools/SKILL.md | inconclusive. It reuses `control-angular-devtools` (its `scripts/control.mjs` and feature map); read that | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 18 | .claude/skills/verify-angular-devtools/SKILL.md | `scripts/verify.mjs [--browser test\|chrome\|chrome-beta\|edge\|edge-dev] [--app-url <url>] [--di-graph] [--keep]` | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 19 | .claude/skills/verify-pangular-inspector/SKILL.md | `scripts/verify.mjs [--app-url <url>] [--keep]` | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 20 | .commandcode/skills/link-workspace-packages/SKILL.md | - Root `package.json` should have `"private": true` to prevent accidental publish | aspirational | fix-doc | Mark as aspirational or implement |
| 21 | .commandcode/skills/monitor-ci/SKILL.md | node <skill_dir>/scripts/ci-poll-decide.mjs '<subagent_result_json>' <poll_count> <verbosity> / | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 22 | .commandcode/skills/monitor-ci/SKILL.md | node <skill_dir>/scripts/ci-state-update.mjs post-action / | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 23 | .commandcode/skills/monitor-ci/SKILL.md | The script returns `{ waitMode, pollCount, lastCipeUrl, expectedCommitSha, agentTriggered }`. Update all tracking state from the output, then go to Step 2. | aspirational | fix-doc | Mark as aspirational or implement |
| 24 | .commandcode/skills/monitor-ci/SKILL.md | node <skill_dir>/scripts/ci-state-update.mjs cycle-check / | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 25 | .commandcode/skills/nx-generate/SKILL.md | **Important:** If you replace or delete generated test files (e.g., `*.spec.ts`), either write meaningful replacement tests or remove the `test` target from the project configuration. Empty test suite | aspirational | fix-doc | Mark as aspirational or implement |
| 26 | .commandcode/skills/nx-import/SKILL.md | - https://nx.dev/docs/guides/adopting-nx/import-project | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 27 | .commandcode/skills/nx-import/SKILL.md | - https://nx.dev/docs/guides/adopting-nx/preserving-git-histories | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 28 | .commandcode/skills/nx-import/references/ESLINT.md | After import, projects will have **two** lint-related targets if the source `package.json` has a `"lint"` npm script: | aspirational | fix-doc | Mark as aspirational or implement |
| 29 | .commandcode/skills/nx-import/references/GRADLE.md | - If you import an entire Gradle repository into a subfolder, files like `gradlew`, `gradlew.bat`, and `gradle/wrapper` will end up inside that imported subfolder. | aspirational | fix-doc | Mark as aspirational or implement |
| 30 | .commandcode/skills/nx-import/references/GRADLE.md | - https://nx.dev/docs/technologies/java/gradle/introduction | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 31 | .commandcode/skills/nx-import/references/NEXT.md | `next build` auto-generates `next-env.d.ts` at the project root. Add `next-env.d.ts` to the dest root `.gitignore` — it is framework-generated and should not be committed. | aspirational | fix-doc | Mark as aspirational or implement |
| 32 | .commandcode/skills/nx-import/references/TURBOREPO.md | - Migration guide: https://nx.dev/docs/guides/adopting-nx/from-turborepo#easy-automated-migration-example | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 33 | .commandcode/skills/nx-import/references/TURBOREPO.md | - https://nx.dev/docs/guides/adopting-nx/from-turborepo | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 34 | .commandcode/taste/angular/taste.md | - RxJS itself is not legacy and should not be excluded; it is fine as long as it stays compatible with OnPush and zoneless, and he expects RxJS-specific and RxJS+Angular-specific features to be design | aspirational | fix-doc | Mark as aspirational or implement |
| 35 | .commandcode/taste/communication/taste.md | - Claims in research and design files are expected to be labelled with how they were established (measured vs. documented vs. inferred), and an inferred label must not be silently upgraded. Confidence | aspirational | fix-doc | Mark as aspirational or implement |
| 36 | .commandcode/taste/tooling/taste.md | - Commits must be authored/committed as `larsbrinknielsen@gmail.com`; his work email and its domain must never appear in commits or documents. Confidence: 0.7 | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 37 | .commandcode/taste/tooling/taste.md | - Prefers `.mjs` (ESM) script format with `node:` protocol imports for Node.js scripts in `scripts/` (e.g. `install-*-command-code.mjs`). Confidence: 0.9 | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 38 | .commandcode/taste/tooling/taste.md | - Mirrors his global (user-scope) agent setup across coding tools: he ports the Claude configuration (`~/.claude/CLAUDE.md` + `references/*.md`) into the equivalent Command Code files (`~/.commandcode | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 39 | .commandcode/taste/workflow/taste.md | - Follows existing code conventions and patterns when creating new scripts (e.g. "similar to the other install-*.mjs scripts in scripts/"). Confidence: 0.85 | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 40 | .commandcode/taste/workflow/taste.md | - Uses a plan-first workflow: writes implementation plans to `~/.commandcode/plans/`, presents them via `exit_plan_mode`, and waits for approval before implementing. Confidence: 0.75 | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 41 | .commandcode/taste/workflow/taste.md | - Scopes every audit subagent to read ONLY the target docs plus an explicit enumeration of source roots (.claude/skills/*/scripts/, .commandcode/skills/*/scripts/, spikes/, docs/, plans/, research/),  | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 42 | .commandcode/taste/workflow/taste.md | - Collates parallel subagent partial outputs into a single template-compliant deliverable and validates it programmatically (check_docs_audit.py: disjoint ## Doc: / ## Descriptive docs sections matchi | aspirational | fix-doc | Mark as aspirational or implement |
| 43 | docs/afk-run-2026-10-12.md | - Research `research/00`-`10`, the filing ledger `docs/filing-ledger.md`. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 44 | docs/design/tutor.md | - **[documented]**: stated in vendor documentation or in a `research/` file that quotes it, not checked by a run. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 45 | docs/design/tutor.md | - **[inferred; not sourced in `research/`]**: from Claude's general knowledge (mostly tutoring practice in other learning tools), not checked against any file in this repository. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 46 | docs/design/tutor.md | The tutor teaches modern Angular on the app that the learner already has open: the learner reads a short concept, sees it highlighted in the live page, predicts what the app will do, acts in the app,  | aspirational | fix-doc | Mark as aspirational or implement |
| 47 | docs/design/tutor.md | Predict-then-observe (`pick-set`, `value`, `order` with an action) is the main type, because it makes the learner commit before the app answers and then shows the measured answer on the same page. Pre | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 48 | docs/design/tutor.md | - **Concept (core, shipped):** "In a zoneless app, Angular runs change detection when something tells it to: a template listener, a signal that a template reads, or an explicit call. With OnPush, the  | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 49 | docs/design/tutor.md | - **Example (built by code):** the component whose listener the action will hit, highlighted, with the caption "`<listener component>` handles the click; `<reader>` reads `<computed>`". | aspirational | fix-doc | Mark as aspirational or implement |
| 50 | docs/design/tutor.md | - Rewriter's options are not described in any `research/` file; 01 lists its status only, and 00 measured it `available` in Chrome stable 154's page and in Edge Dev 157's page, and `downloadable` in C | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 51 | docs/design/tutor.md | - The Prompt API accepts `en`, `ja`, `es`, `de` and `fr` as expected languages in Chrome **[documented, 01 section 1]**, so tutor prompts run in English and K5 translates the result **[inferred design | aspirational | fix-doc | Mark as aspirational or implement |
| 52 | docs/design/tutor.md | - Act stage: each component whose template ran gets a short pulse as the cycle is recorded (like the "highlight updates" option of other framework devtools **[inferred; not sourced in `research/`]**). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 53 | docs/design/tutor.md | - **Learner gets:** a guided walk through this app: one card per route and per main component ("`app-cart` shows the cart; it reads three signals, one of them a `computed`; it has one component-level  | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 54 | docs/design/tutor.md | - **Learner gets:** a short review exercise days later, on a different example that meets the same precondition, so the learner recalls the idea and not the earlier answer. Spaced retrieval practice i | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 55 | docs/design/tutor.md | - How: a lesson shows a concept, highlights a live example found by a code predicate, asks the learner to predict what the app will do (picking from lists or from the page, never typing code), records | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 56 | docs/feature-proposals.md | Evidence files (in `research/`, plus the filing ledger in `docs/`): | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 57 | docs/feature-proposals.md | - `17-vitest-browser-runtime.md`: the Vitest Browser Mode spike on the counter fixture (commit `c929050`): whether the extension can be present in a Vitest Browser run with Playwright, by attaching to | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 58 | docs/feature-proposals.md | - NgModule apps are unsupported. The panel decides this with the NgModule check in `app_facts` (3.3, 3.4; `research/12` section 2): the app is standalone when some environment injector on the root com | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 59 | docs/feature-proposals.md | Benchmark: five questions about the counter app, three runs each, three narrow tools, native tools against the structured-output fallback loop. Details are in 05; all four models ran while another ses | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 60 | docs/feature-proposals.md | - Every failed run, by class **[measured, counted from `research/raw/bench/*.json` after the `916fc09` regrade]**. The rule for a run that fits two classes: a run whose calls never reach a tool that c | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 61 | docs/feature-proposals.md | - `create()` with `tools` needs both `expectedOutputs: [{type:'text'}, {type:'tool-call'}]` and `expectedInputs: [{type:'text'}, {type:'tool-response'}]`, or it throws. | aspirational | fix-doc | Mark as aspirational or implement |
| 62 | docs/feature-proposals.md | - Streaming on Gemma 4 tool sessions is not established either way. The only test (`spikes/probes/probe9.js:18-27`) called `prompt()`, got a tool call back, and then streamed on a `clone()` of that se | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 63 | docs/feature-proposals.md | Where accessibility roles and names come from (N10's a11y rule and N23). Page JavaScript has no standard API that returns the accessibility tree **[inferred; not checked in `research/`]**. 08 names tw | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 64 | docs/feature-proposals.md | - Where the model session lives: spike S1 (`research/11`) **[measured in Chrome Beta 156 and Edge Dev 157]**. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 65 | docs/feature-proposals.md | - 14 of the 15 failed runs threw on the JSON parse (`SyntaxError: Unexpected end of JSON input`), and the harness saves such runs with `calls: []` from its catch block, so their calls are not recorded | aspirational | fix-doc | Mark as aspirational or implement |
| 66 | docs/feature-proposals.md | **Tools take ids, not selectors.** `find_components` returns short ids (`c3`), and every tool that targets a component takes `{id}`. The evidence **[measured, counted from `research/raw/bench/*.json`; | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 67 | docs/feature-proposals.md | Tools whose answers depend on a legacy form that the tools see differently (`research/12` section 2; each is flagged by N10): | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 68 | docs/feature-proposals.md | - `list_signals`, `signal_dependencies` and `signal_trace` see only signal inputs and signal queries; a decorator `@Input()` field or a decorator query is no signal node (`research/12` C1, C3). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 69 | docs/feature-proposals.md | - `set_writable_field` writes a decorator `@Input()` field as a plain field, while it refuses a signal input; decorator inputs are not supported (`research/12` C1). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 70 | docs/feature-proposals.md | - `router_state` answers only with `provideRouter` (`RouterModule.forRoot` publishes no router globals, `research/12` R3), and it describes `canMatch` guards; a `canLoad` guard runs only before the fi | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 71 | docs/feature-proposals.md | - Everything stays on the device. In Chrome, the built-in model sends nothing to Google or a third party **[documented, Chrome get-started docs, 03 section 3.4]**. For Edge, Microsoft's Prompt API pag | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 72 | docs/feature-proposals.md | **Patterns (`research/15` section 2) [inferred design unless marked]:** | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 73 | docs/feature-proposals.md | **Execution contexts, short form (`research/15` section 1) [measured for the rows S1 ran, 11; others as marked]:** | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 74 | docs/feature-proposals.md | **Limits (`research/15` section 3).** An open question over the whole page has no known split or merge; the panel answers it from code (a list of findings) and the model explains the finding the user  | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 75 | docs/feature-proposals.md | - Legacy forms (`research/12` section 2): N1 follows only signal inputs and signal queries (a decorator `@Input()` or query change is no signal epoch change, `research/12` C1, C3), and it explains an  | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 76 | docs/feature-proposals.md | - Legacy forms (`research/12` section 2): provenance and the pattern rules see only signal inputs and signal queries; decorator inputs and queries are not graph nodes (`research/12` C1, C3). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 77 | docs/feature-proposals.md | - Legacy forms (`research/12` section 2): N3 does not support `providedIn: 'any'` tokens, which get one instance per lazy environment injector (`research/12` I2); constructor injection and `inject()`  | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 78 | docs/feature-proposals.md | - Counters: six `ngDevMode` counters (`hydratedNodes`, `hydratedComponents`, `dehydratedViewsRemoved`, `dehydratedViewsCleanupRuns`, `componentsSkippedHydration`, `deferBlocksWithIncrementalHydration` | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 79 | docs/feature-proposals.md | - Per-node status: `__ngDebugHydrationInfo__` is a DOM expando `{status}` with `hydrated`, `skipped` or `mismatched` **[documented in source, `research/16` section 1]**; on a clean page 34 nodes carry | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 80 | docs/feature-proposals.md | - Not reachable: a mismatch caused by server-only code (the fixture's `<div>` depends on `REQUEST`) shows only as its effect; the server code that caused it, and `REQUEST` itself, stay on the server ( | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 81 | docs/feature-proposals.md | - How: when the page exposes `document.modelContext` (flag `enable-webmcp-testing`, active in Chrome Beta and Edge Dev after a relaunch; `document.modelContext` exposes `registerTool`, `getTools`, `ex | aspirational | fix-doc | Mark as aspirational or implement |
| 82 | docs/feature-proposals.md | - WebMCP tool audit (`research/14` C11, folded in by Lars's ruling of 2026-10-12, section 8; it replaces EXT4). Prompt: "Are my app's tools ready for an agent?" Deterministic rules over `getTools()`,  | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 83 | docs/feature-proposals.md | - a name outside the spec's character set (ASCII letters and digits plus `_`, `-` and `.`, at most 128 code points) **[measured, WebMCP `index.bs`, `research/14` 3.1]**, or over Chrome's recommended 3 | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 84 | docs/feature-proposals.md | - a tool still registered after the user leaves its route, detected as a tool still listed by `getTools()` after a navigation that `router_state` reports **[inferred, `research/14` 3.2]**; | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 85 | docs/feature-proposals.md | - duplicate names: the spec rejects them with `InvalidStateError` **[measured, `index.bs`, `research/14` 3.1]**, and Angular's guide tells developers to expect a throw **[documented, `research/14` 3.4 | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 86 | docs/feature-proposals.md | - `Eager` components (`research/12` D3: not supported, flagged). Since Angular 22.0 a component without `changeDetection` is OnPush (`CHANGELOG.md:859`, measured on the spike app), so `Eager` is an ex | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 87 | docs/feature-proposals.md | - `@for` blocks whose `trackExpression` is the item itself on object items (`ɵgetControlFlowBlocks` returns `trackExpression`). It checks `@for` only; a `*ngFor` is not supported and gets the legacy r | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 88 | docs/feature-proposals.md | - Legacy rules, from Lars's rule of 2026-10-12 (section 8): one rule for each legacy form that the tools see differently from its modern form and that a page can reveal (`research/12` section 2, outco | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 89 | docs/feature-proposals.md | - `*ngFor` (`research/12` T2): `ng.getDirectives` on the anchor comments in a component's view returns an `NgForOf` (class name with any leading underscore stripped) **[inferred from source: `ng.getDi | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 90 | docs/feature-proposals.md | - Decorator `@Input()` (`research/12` C1): for each input that `ng.getDirectiveMetadata` lists, the instance property fails `ng.isSignal` **[inferred]**, Tier 0; the class metadata confirms the field: | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 91 | docs/feature-proposals.md | - Decorator queries (`research/12` C3): `propDecorators` entries whose decorator kind (`type.prototype.ngMetadataName`) is `ViewChild`, `ViewChildren`, `ContentChild` or `ContentChildren` without `isS | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 92 | docs/feature-proposals.md | - `Eager` components (`research/12` D3): the `Eager` rule at the top of this list is this rule, and its finding is the "not supported" flag above **[measured: `changeDetection` read on the spike, 02 s | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 93 | docs/feature-proposals.md | - `canLoad` guards (`research/12` R2): a route with a non-empty `canLoad` in `ng.ɵgetRouterInstance(...).config` or in the loaded child routes from `ng.ɵgetLoadedRoutes` **[inferred]**. Tier 1 (router | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 94 | docs/feature-proposals.md | - `RouterModule.forRoot` in a standalone app (`research/12` R3): `ng.ɵgetRouterInstance` is not a function while `ng.getDirectives` on a `router-outlet` element returns a `RouterOutlet` **[inferred]** | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 95 | docs/feature-proposals.md | - Template-driven forms (`research/12` F1): `ng.getDirectives` returns `NgModel` on a form control or `NgForm` on a `<form>` **[inferred]**. Tier 0. Modern form: Signal Forms (`form()`, `[formField]`) | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 96 | docs/feature-proposals.md | - Reactive Forms (`research/12` F2, with `research/12` F3's deprecated sub-APIs reported as F2): `ng.getDirectives` returns `FormControlDirective`, `FormControlName`, `FormGroupDirective`, `FormGroupN | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 97 | docs/feature-proposals.md | - `providedIn: 'any'` and `providedIn: SomeNgModule` (`research/12` I2): a provider record from `ɵgetInjectorProviders` whose class token has `ɵprov.providedIn === 'any'`, or a class with `ɵmod` there | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 98 | docs/feature-proposals.md | - NgModule app (`research/12` S1, with `research/12` S2, S3 and S7): not a finding but the panel's "not supported" notice, like the Zone.js check, and it runs in the startup support check (3.3, `app_f | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 99 | docs/feature-proposals.md | - Navigation needs `provideRouter`; with `RouterModule.forRoot` the router globals are missing, a form that is not supported (`research/12` R3). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 100 | docs/feature-proposals.md | - N15: code reads `FormField.state()` per field (spike S9) and computes which fields block submit (invalid, pending or disabled). The model receives only the blocking fields with their errors, capped  | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 101 | docs/feature-proposals.md | - N31: code reads `ng.ɵgetTransferState(ng.getInjector(<root>))`, which re-reads `<script id="ng-state">` and leaves out Angular's hydration keys (`__nghData__`, `__nghDeferData__`) **[documented in s | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 102 | docs/feature-proposals.md | - N34 (`research/17` verdict: supported): code installs `cd_record` in the tester iframe through the page agent, which runs there because the content scripts match the test server's origin with `all_f | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 103 | docs/feature-proposals.md | - N35 (`research/17` verdict: supported for the DOM side): code reads the tester DOM: the `[ng-version]` hosts with their components (`find_components`), and roles and names computed from the DOM (2.2 | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 104 | docs/feature-proposals.md | - N36 (`research/17` verdict: supported with a held or watched test): code runs the same reads (`ng.getComponent`, inputs, signal values, DOM text, `ɵgetInjectorResolutionPath` and the providing injec | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 105 | docs/feature-proposals.md | - N37 (`research/17` verdict: supported): code walks the tester component's resolution path with `di_path` and `di_lookup` (3.4). In the spike, `ɵgetInjectorResolutionPath` gave element (`HTMLDivEleme | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 106 | docs/feature-proposals.md | Legacy forms (`research/12` section 2): | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 107 | docs/feature-proposals.md | - N15 answers only for Signal Forms; template-driven and Reactive Forms directives are not read (`research/12` F1, F2, F3), and N10 flags them. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 108 | docs/feature-proposals.md | - N17 answers only with `provideRouter` (`research/12` R3) and explains `canMatch` guards; a `canLoad` guard, which runs only before the first load, is not supported (`research/12` R2), and N10 flags  | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 109 | docs/feature-proposals.md | - Not an RxJS flag: RxJS is not legacy (`research/12` X1). The finding is about a plain field written outside change detection; the same write in a `setTimeout` or a `Promise` callback has the same ef | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 110 | docs/feature-proposals.md | - Not an RxJS flag: RxJS is not legacy (`research/12` X1), and N25 flags nothing. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 111 | docs/feature-proposals.md | - How: a lesson shows a concept, highlights a live example found by a code predicate, asks the learner to predict what the app will do (picking from lists or from the page, never typing code), records | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 112 | docs/feature-proposals.md | Note on the Transfer State row: measured on the SSR fixture (`research/16` section 3). `ng.ɵgetTransferState` re-reads `<script id="ng-state">` and leaves out Angular's hydration keys (`__nghData__`,  | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 113 | docs/feature-proposals.md | Legacy forms (`research/12` section 2): the signal graph pane row sees only signal inputs and signal queries (`research/12` C1, C3); the property editing row writes a decorator `@Input()` field as a p | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 114 | docs/feature-proposals.md | - Detection and data: a MAIN-world shim for `window.__REDUX_DEVTOOLS_EXTENSION__` installed at `document_start`. `provideStoreDevtools()` reads that global in a provider factory and then sends every a | aspirational | fix-doc | Mark as aspirational or implement |
| 115 | docs/feature-proposals.md | The facts below come from the Vitest Browser spike, `research/17` (2026-10-12, commit `c929050`), run on the counter fixture `spikes/ng222-app` under Angular's `@angular/build:unit-test` builder with  | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 116 | docs/feature-proposals.md | - Tester iframe: `http://127.0.0.1:<port>/?sessionId=<uuid>&iframeId=__vitest_all__`, frame name `vitest-iframe`, attribute `data-vitest="true"`. There is one tester iframe, `__vitest_all__`, because  | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 117 | docs/feature-proposals.md | - **It has an optional launch mode for a branded channel** (`chrome-beta`, `msedge-dev` and so on). Launch mode needs a dedicated `userDataDir` and a debugging port, and refuses to launch without its  | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 118 | docs/feature-proposals.md | **Restrictions** (what `research/17` did not run): | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 119 | docs/feature-proposals.md | **Features:** N34 (zoneless test-timing explainer), N35 (query mismatch explainer), N36 (test-against-app diff) and N37 (test DI explainer), in the N14-N23 table (section 4) with their `research/17` v | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 120 | docs/feature-proposals.md | - Tier: reading `window.__vitest_browser_runner__` (config, provider, session id) is Tier 1 (third-party), because Vitest's own `esm-client-injector.js` sets it and no public entry point exports it (2 | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 121 | docs/feature-proposals.md | - N28's change-detection part (`cd_record`), N30 (`wait_for`, 3.4), and N9's route rule in the WebMCP tool audit (`router_state`) (added 2026-10-12 from `research/14`). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 122 | docs/feature-proposals.md | - N31 (`ɵgetTransferState`; without it, Resource Timing alone cannot tell a cache hit from a request that was never made) and N33 (the `window._ejsas` queue) (added 2026-10-12 from `research/16`). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 123 | docs/feature-proposals.md | - N34 (`cd_record`, `ɵsetProfiler`), N36's providing injectors (`test_app_diff`) and N37 (`di_path`, `di_lookup`) (added 2026-10-12 from `research/17`). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 124 | docs/feature-proposals.md | - An optional launch mode for a branded channel (`chrome-beta`, `msedge-dev`) needs its own `userDataDir` and a debugging port, and the extension must already be installed in that profile (Chrome 136  | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 125 | docs/feature-proposals.md | - (2026-10-12) "Consider constructor injection a legacy feature." Claude's note: constructor injection joins the legacy list in `research/12` (row C5); a dev page shows it per class through a non-empt | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 126 | docs/feature-proposals.md | - (2026-10-12) "If a feature we consider *legacy* works the same from a runtime DevTools perspective, leave it working without any flag. Just don't explicitly list it as supported and if it starts to  | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 127 | docs/feature-proposals.md | - (2026-10-12) "While `@Service` is the modern API, `@Injectable` is an exception to the legacy rule, meaning we support `@Injectable`. For both decorators, both singletons (`providedIn: 'root'` and ` | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 128 | docs/feature-proposals.md | - (2026-10-12) "Skill naming: Approve recommendation." Claude's note: the recommendation was to keep the `verify-*` skill names and add a thin `.claude/skills/verify/` router. Claude has added the `ve | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 129 | docs/feature-proposals.md | - The non-Nano passes are real answers. Every passing run of Aion, Phi-4-mini and Gemma 4 (GPU and CPU), 83 runs, made at least one tool call **[measured, read run by run from `research/raw/bench/*.js | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 130 | docs/feature-proposals.md | **Not reachable from a browser extension (SSR, `research/16`).** These facts stay on the server or are gone by the time the extension can look, so no feature answers them: | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 131 | docs/feature-proposals.md | - From an isolated-world content script: `__ngDebugHydrationInfo__` (a DOM expando), `ngDevMode`, `window.ng` and `window._ejsas` are page JavaScript state, so only the MAIN-world page agent reads the | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 132 | docs/filing-ledger.md | **Expected:** read Nx `project.json` files (`sourceRoot`, or `root` + `src`) next to `angular.json`, or accept several `--root` folders. | aspirational | fix-doc | Mark as aspirational or implement |
| 133 | docs/filing-ledger.md | **What happens:** `apps/docs/src/content/agents/tools.md` documents `list-components`. `tools/list` on `pangular dev --read-only` from the npm 0.0.7 package returns 46 tools without it; the tool was a | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 134 | docs/filing-ledger.md | **Evidence:** `.claude/skills/control-pangular-inspector/SKILL.md:172` (0.0.7 has no `list-components`; added in 20ebbb9; 46 tools with `--read-only`). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 135 | docs/filing-ledger.md | - `AIManager::CanCreateLanguageModel` runs its only tool gate, `!base::FeatureList::IsEnabled(kAIPromptAPIToolUse)`, only when `options->tools` is non-empty (`chrome/browser/ai/ai_manager.cc`, L774-L7 | aspirational | fix-doc | Mark as aspirational or implement |
| 136 | docs/filing-ledger.md | **Expected:** `availability()` returns `unavailable` for the tool types when `create()` would refuse them. | aspirational | fix-doc | Mark as aspirational or implement |
| 137 | docs/filing-ledger.md | **Existing reports:** 09 found none. The Chromium tracker's search needs sign-in, and web search with `site:issues.chromium.org` had no hits. crbug 422803232 ("Implement function calling support in ch | aspirational | fix-doc | Mark as aspirational or implement |
| 138 | docs/filing-ledger.md | **Expected:** a control library written for `ControlValueAccessor` either works with Signal Forms' metadata bindings (types that accept them, or inputs named differently) or documents the combination; | aspirational | fix-doc | Mark as aspirational or implement |
| 139 | docs/filing-ledger.md | **What happens:** the WebMCP spec draft (`webmachinelearning/webmcp` `index.bs` at `d0e4e0e`) defines `ToolAnnotations` with `readOnlyHint`, `untrustedContentHint`, `consequentialHint` and `debugging` | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 140 | docs/filing-ledger.md | **Expected:** Angular's `Annotations` mirrors the spec's `ToolAnnotations`, or documents why `debugging` is left out. | aspirational | fix-doc | Mark as aspirational or implement |
| 141 | docs/filing-ledger.md | **Evidence:** research/14 section 3.1 (spec IDL and Angular source lines). Re-check both at their current heads before filing. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 142 | docs/filing-ledger.md | Status: draft, not filed. Found 2026-10-12 (`research/14`, sections 3.1 and 6). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 143 | docs/filing-ledger.md | **Evidence:** research/14 section 3.1. Re-check the page and the spec's current head before filing; the spec may have moved. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 144 | docs/filing-ledger.md | Status: draft, not filed. Found 2026-10-12 (`research/14`, sections 1.18 and 6). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 145 | docs/filing-ledger.md | **Evidence:** research/14 section 1.18 (`webmcp.ts` strings). Re-check the README at its current head before filing. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 146 | plans/angular-ai-devtools-proposals.handoff.md | - `research/00` to `research/17`; | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 147 | plans/angular-ai-devtools-proposals.handoff.md | - **Probe steps:** S14 and S15 are written in `research/15` section 4. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 148 | plans/angular-ai-devtools-proposals.handoff.md | - **No project skill named `verify`.** Claude Code runs it before every commit; Lars had the router removed. The bundled `/verify` can recreate one at `.claude/skills/verify/` if it is ever run here. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 149 | research/00-browser-probe.md | - `create()` with `tools` throws `TypeError: When tools are provided, expectedOutputs must include {type: "tool-call"}` unless `expectedOutputs: [{type:'text'},{type:'tool-call'}]` and `expectedInputs | aspirational | fix-doc | Mark as aspirational or implement |
| 150 | research/00-browser-probe.md | - Inferred, not checked: Edge Dev 157 does not currently serve the release ("default", expected Phi-4-mini) component, so the download never starts. Edge stable 155 might; it has not been tried. Super | aspirational | fix-doc | Mark as aspirational or implement |
| 151 | research/00-browser-probe.md | Lars asked: "Have you exhausted all options to make Phi-4-mini work in Edge Dev?" and "Find research that confirms whether Aion will replace Phi-4-mini in Edge". | aspirational | fix-doc | Mark as aspirational or implement |
| 152 | research/00-browser-probe.md | - Windows' own on-device model runs on the Snapdragon NPU through the Windows App SDK: Phi Silica today, Aion Instruct from the November 2026 Insider rollout (`research/00`, "Phi-4-mini in Edge Dev 15 | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 153 | research/00-browser-probe.md | The rule "a tool with empty `properties` makes every Gemma 4 tool prompt fail" is not established. Spike S1 phase 2 (`research/11`) measured Gemma 4's model process crashing with `kErrorUnknown` on ca | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 154 | research/01-built-in-ai-apis.md | - Chrome docs: https://developer.chrome.com/docs/ai/prompt-api ("Last updated: August 26, 2026") -- "C1" | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 155 | research/01-built-in-ai-apis.md | - [measured, S1/C1] `LanguageModel.availability(options)` -> `"unavailable" \| "downloadable" \| "downloading" \| "available"`. Pass the same options you will pass to `create()`/`prompt()` (C1 calls this | aspirational | fix-doc | Mark as aspirational or implement |
| 156 | research/01-built-in-ai-apis.md | - [measured, C1] Triggering the download needs **user activation** (C1 links to /docs/ai/get-started#user-activation). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 157 | research/01-built-in-ai-apis.md | - [measured, C1] `expectedInputs[].type`: `text`, `image`, `audio`. `expectedOutputs[].type`: `text` only (S1 adds `tool-call` for tools, see below). `languages`: Chrome accepts `"en"`, `"ja"`, `"es"` | aspirational | fix-doc | Mark as aspirational or implement |
| 158 | research/01-built-in-ai-apis.md | - [measured, C1] Chrome's page links a dedicated guide: https://developer.chrome.com/docs/ai/structured-output-for-prompt-api (not read here). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 159 | research/01-built-in-ai-apis.md | - [measured, getstarted https://developer.chrome.com/docs/ai/get-started] "All of these APIs can be used when building Chrome Extensions"; APIs still in an origin trial require registering the extensi | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 160 | research/01-built-in-ai-apis.md | Sources: Chrome table https://developer.chrome.com/docs/ai/built-in-apis ("C2", body last updated 2025-09-12, so partly stale); R1 and X1 (Chromium `main`, current); Edge docs https://learn.microsoft. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 161 | research/01-built-in-ai-apis.md | Sources: explainer https://github.com/webmachinelearning/webmcp (README on `main`, fetched 2026-10-11) -- "W1"; https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md -- "W2"; | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 162 | research/01-built-in-ai-apis.md | - [measured, W3] "Chrome Extensions can query and execute WebMCP tools with content scripts." W3 also points at a DevTools pane for debugging WebMCP tools: https://developer.chrome.com/docs/devtools/a | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 163 | research/01-built-in-ai-apis.md | Sources: https://developer.chrome.com/docs/devtools/ai-assistance ("D1"); DevTools frontend source https://github.com/ChromeDevTools/devtools-frontend/tree/main/front_end/models/ai_assistance ("D2", R | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 164 | research/01-built-in-ai-apis.md | - [measured, D2 `BuiltInAi.ts`] **DevTools itself already uses the built-in Prompt API** for Console Insights "teasers": `window.LanguageModel.availability/create` with `expectedInputs/Outputs` `en` t | aspirational | fix-doc | Mark as aspirational or implement |
| 165 | research/01-built-in-ai-apis.md | - Takeaways for the extension [inferred]: copy the context-object pattern (one selected Angular component = one context with an origin), the origin lock, side-effect-free reads by default with explici | aspirational | fix-doc | Mark as aspirational or implement |
| 166 | research/01-built-in-ai-apis.md | - [measured, https://ai.google.dev/gemma/docs/core] Gemma 4 comes in E2B, E4B, 12B, 31B, 26B A4B. "Small models feature a 128K context window, while the medium models support 256K." Weight memory: E2B | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 167 | research/02-angular-surface.md | Relevance **(inferred)**: AI-heavy apps will hold their interesting state in `resource`/`linkedSignal` nodes, which `ɵgetSignalGraph` exposes with `debugName` labels when compiled by ngtsc (5.3). | aspirational | fix-doc | Mark as aspirational or implement |
| 168 | research/03-prior-art.md | `overlay (bundled into the app, dev-only dynamic import in main.ts)` -> `RPC push to a local devframe server (Express hub initPangularHub(), Vite plugin, or standalone CLI)` -> `server shared state` - | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 169 | research/03-prior-art.md | All rows **[measured]** from `apps/docs/src/content/inspectors/<name>.md` unless noted. "ng?" = can a MAIN-world extension script get the same data from the public/`ɵ` `ng` global: **yes** (read only) | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 170 | research/03-prior-art.md | - **Roughly 60 agent tools** (estimate, not counted exactly) across inspectors **[measured: agents/tools.md lists them]** (Count, 2026-10-12: the local clone's `devtools/apps/docs/src/content/agents/t | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 171 | research/03-prior-art.md | - Repo is agent-maintained: `.claude/skills/devtools-*` and `.claude/agents/{ui-engineer,inspector-engineer,a11y-reviewer,devtools-reviewer}.md` **[measured: AGENTS.md]**. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 172 | research/03-prior-art.md | The closest precedent for promptified devtools. Sources: https://developer.chrome.com/docs/devtools/ai-assistance, .../ai-assistance/chat, .../ai-assistance/get-started, .../ai-assistance/data-usage-a | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 173 | research/03-prior-art.md | Source: https://github.com/ChromeDevTools/chrome-devtools-mcp README (read directly in this run), docs/tool-reference.md and docs/design-principles.md (researcher). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 174 | research/03-prior-art.md | - Where the Angular tools live (framework core vs a separate package) and how they register is not stated in the blog **[inferred: needs a follow-up read of the Angular source / chrome-devtools-mcp do | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 175 | research/03-prior-art.md | - **Tool calling**: the explainer defines `tools` (name, description, `inputSchema`), `expectedOutputs: [{type: "tool-call"}]`, `expectedInputs: [{type: "tool-response"}]`, open loop where the page ex | aspirational | fix-doc | Mark as aspirational or implement |
| 176 | research/03-prior-art.md | - Hardware: 22 GB free on the profile volume; GPU > 4 GB VRAM or CPU with 16 GB RAM and 4+ cores; "No data is sent to Google or any third party" **[measured: https://developer.chrome.com/docs/ai/get-s | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 177 | research/04-ecosystem.md | - Dev server MCP: `http://localhost:6006/mcp` when `@storybook/addon-mcp` is added (docs `/docs/ai`) [measured]. Manifest: `features.componentsManifest` (default false) generates manifests used by the | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 178 | research/04-ecosystem.md | Open spikes (nothing here was run): whether `ng.ɵgetInjectorProviders`-style APIs are on the `ng` global in 22.2 (Answered: yes, see `02-angular-surface.md` section 1.2 and `05-spikes.md` S2); whether | aspirational | fix-doc | Mark as aspirational or implement |
| 179 | research/05-spikes.md | - The trigger is a `tool-call` or `tool-response` entry in `expectedInputs`/`expectedOutputs`, not the `tools` list, the language tag or the system prompt. The benchmark's native mode (`bench.js`) alw | aspirational | fix-doc | Mark as aspirational or implement |
| 180 | research/05-spikes.md | - **Instances:** one per model (`research/00`, "Per-model instances"). Backend comes from Broker State; performance class from `optimization_guide.on_device.performance_class` in the instance's `Local | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 181 | research/05-spikes.md | Same harness and questions as the second round, run while the machine was still under another session's load. Backends were switched as described in `research/00`, "Choosing CPU or GPU per instance". | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 182 | research/07-prompting-small-models.md | 4. **No empty schemas:** a tool that needs no input gets `scope: {type:'string', enum:['page']}`. (confounded with camelCase names; see Correction at end of 00/07 and research/11) (Answered 2026-10-12 | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 183 | research/07-prompting-small-models.md | The rule "a tool with empty `properties` makes every Gemma 4 tool prompt fail" is not established. Spike S1 phase 2 (`research/11`) measured Gemma 4's model process crashing with `kErrorUnknown` on ca | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 184 | research/09-nano-tool-session-error.md | **How the types travel [measured].** `LanguageModel::create` builds a `LanguageModelCreateClient` ([`LM#L590-L591`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/m | aspirational | fix-doc | Mark as aspirational or implement |
| 185 | research/09-nano-tool-session-error.md | - `ModelClient`'s constructor adds `kToolUse` to every model's capabilities without condition ([`components/optimization_guide/core/model_execution/model_broker_client.cc#L86-L91`](https://github.com/ | aspirational | fix-doc | Mark as aspirational or implement |
| 186 | research/09-nano-tool-session-error.md | - That algorithm appends the "language model content type availability" ([`#L463-L471`](https://github.com/webmachinelearning/prompt-api/blob/8040b8143949937e7bdd8dbe715a6d478bd41daf/index.bs#L463-L47 | aspirational | fix-doc | Mark as aspirational or implement |
| 187 | research/09-nano-tool-session-error.md | - [crbug 422803232](https://issues.chromium.org/issues/422803232) is public. Claude fetched its title through the tracker's JSON endpoint: "Feature Work: Implement function calling support in chromium | aspirational | fix-doc | Mark as aspirational or implement |
| 188 | research/09-nano-tool-session-error.md | - **`create()`:** `LanguageModelCreateClient::Create` rejects any `tool-call`/`tool-response` expected type with `NotSupportedError` and reuses the generic "unable to create a session" text. The rejec | aspirational | fix-doc | Mark as aspirational or implement |
| 189 | research/09-nano-tool-session-error.md | - **`availability()`:** neither the Blink code nor the browser's `CanCreateLanguageModel` checks expected tool types. The browser treats them as no-ops, and Blink never sends `tools` to the browser fr | aspirational | fix-doc | Mark as aspirational or implement |
| 190 | research/09-nano-tool-session-error.md | - **v3 Nano:** the model is not the cause. Chromium sets `kToolUse` on every model and relies on the Blink gate alone (TODO crbug 422803232). The link to v4 comes only from how the chrome://flags entr | aspirational | fix-doc | Mark as aspirational or implement |
| 191 | research/09-nano-tool-session-error.md | - The official Chrome Prompt API page (`https://developer.chrome.com/docs/ai/prompt-api`, fetched via markdown.new) does not mention tools or function calling. It names Gemini Nano as the Prompt API's | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 192 | research/10-model-capabilities.md | `spikes/probes/bench.js:62` grades "Which signals does double in app-counter depend on?" with `/count/i.test(a) && !/title\|items/i.test(a)` **[measured, BJ]**. The regex `/count/i` also matches the "c | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 193 | research/11-spike-s1-extension-contexts.md | - Whether `create()` from the service worker needs user activation when the model is `downloadable` (01 section 3 raises it). Phase 2 runs on instances where the model is already `available`, so it wi | aspirational | fix-doc | Mark as aspirational or implement |
| 194 | research/12-legacy-vs-modern-angular.md | - `adev/` = `A/adev/src/content/`. `SK/` = `D:/projects/github/angular/skills` at commit `747c3c2` (research/06). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 195 | research/12-legacy-vs-modern-angular.md | - adev guides and the style guide; the angular/skills references (research/06). | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 196 | research/12-legacy-vs-modern-angular.md | Tier 1 (internal static fields on the app's own classes, present only in dev builds with script optimization off) [inferred]. This supersedes research/08 section 3's "no runtime marker for `@Service`" | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 197 | research/12-legacy-vs-modern-angular.md | `@let` and `@defer` are additions with no documented legacy counterpart (no guide or deprecation names one), so they get no row; their marks `NgLet` and `NgDefer` show use (research/08 section 3) [doc | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 198 | research/12-legacy-vs-modern-angular.md | - 22.2.1 and 22.2.2 (GitHub releases newer than the local CHANGELOG, research/08 section 1.3) were not checked for new deprecations. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 199 | research/14-ai-devtools-prior-art.md | Why: Lars, on the proposals' line "No shipped framework devtools panel uses an on-device model": "We should still consider prior art DevTools that rely on cloud-based AI, MCP, WebMCP, or anything like | aspirational | fix-doc | Mark as aspirational or implement |
| 200 | research/14-ai-devtools-prior-art.md | Sources, read by the group A subagent (fetch log in its file; every page came back through markdown.new): https://developer.chrome.com/docs/devtools/ai-assistance/chat (updated 2026-05-20), .../data-u | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 201 | research/14-ai-devtools-prior-art.md | Checked (group A): https://developers.google.com/speed/docs/insights/v5/about (2024-10-21), https://developer.chrome.com/docs/performance/insights, https://developer.chrome.com/docs/lighthouse/overvie | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 202 | research/14-ai-devtools-prior-art.md | Sources (group A): https://docs.logrocket.com/docs/galileo.md (2026-06-11), .../logrocket-galileo-ai-privacy-faq.md (2026-05-18), .../galileo-highlights.md (2025-08-19), .../ask-galileo.md (2026-06-08 | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 203 | research/14-ai-devtools-prior-art.md | Sources (group B): https://raw.githubusercontent.com/vercel/next-devtools-mcp/main/README.md, https://nextjs.org/docs/app/guides/mcp (Next.js 16.4.0, 2026-10-02), https://nextjs.org/docs/app/guides/ai | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 204 | research/14-ai-devtools-prior-art.md | Vercel Toolbar and Comments (https://vercel.com/docs/vercel-toolbar, https://vercel.com/docs/comments **[documented]**): no AI, agent or v0 feature on either page. Nothing to judge. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 205 | research/14-ai-devtools-prior-art.md | Sources (group B): https://raw.githubusercontent.com/sveltejs/mcp/main/README.md, `documentation/docs/30-mcp/40-tools.md`, `50-resources.md`, `70-cli.md` **[documented]**; tool handler names from `pac | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 206 | research/14-ai-devtools-prior-art.md | Sources (group B): https://raw.githubusercontent.com/TanStack/devtools/main/README.md, `docs/webmcp-tools.md`, `packages/devtools-webmcp/README.md` **[documented]**; `vitejs/devtools` `packages/core/s | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 207 | research/14-ai-devtools-prior-art.md | Sources (group C): Claude in Chrome, https://support.claude.com/en/articles/12012173-getting-started-with-claude-in-chrome (2026-08-26) and https://claude.com/chrome; VS Code Copilot browser tools, ht | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 208 | research/14-ai-devtools-prior-art.md | Lars, verbatim: "I didn't mean that Angular AI DevTools should export its tools as WebMCP, I meant that it may add a prerequisite for an Angular application to expose WebMCP, or support Angular paplic | aspirational | fix-doc | Mark as aspirational or implement |
| 209 | research/14-ai-devtools-prior-art.md | Sources for this section, all read in this run unless marked otherwise: the WebMCP explainer README, `declarative-api-explainer.md` and `implementation-status.md`, and the spec source `index.bs` at `w | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 210 | research/14-ai-devtools-prior-art.md | - **Visibility.** The extension's page agent runs in the page's own origin, so the default exposure covers it and `exposedTo` is not needed **[inferred from the default exposure rule; not run]**. If t | aspirational | fix-doc | Mark as aspirational or implement |
| 211 | research/15-deterministic-and-ai.md | Claude reads "offload deterministic computations to the main thread" as "run them as ordinary JavaScript instead of asking the model", not as a preference for the page's main thread. Section 1 says wh | aspirational | fix-doc | Mark as aspirational or implement |
| 212 | research/15-deterministic-and-ai.md | Project evidence: `research/00`, `01`, `02`, `05`, `07`, `11`, `docs/feature-proposals.md` (cited by section), and `research/raw/tosignal-node-portal.json`. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 213 | research/15-deterministic-and-ai.md | The rows 1-6 results above come from S1 (`research/11`), which measured the same values in Chrome Beta 156 and Edge Dev 157 in every context **[measured]**. Rows 7-9 were not run in either browser. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 214 | research/15-deterministic-and-ai.md | 10. Record per worker context: `typeof LanguageModel`, `typeof LanguageModelToolCall`, `availability()` with and without tool options, `contextWindow`, the round trip's calls, answer, `contextUsage` a | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 215 | research/16-ssr-runtime.md | under `spikes/ng222-ssr/node_modules/@angular/*` (file and line named); **[inferred]** = Claude's reading, not | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 216 | research/16-ssr-runtime.md | - Browser: the skill's playwright-cli session (headless Chromium 154). Probes in `spikes/probes/ssr-*.js`, | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 217 | research/16-ssr-runtime.md | `research/raw/ssr-*.json`. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 218 | research/16-ssr-runtime.md | - How the page shows it: one console error, `ERROR RuntimeError: NG0500: During hydration Angular expected | aspirational | fix-doc | Mark as aspirational or implement |
| 219 | research/16-ssr-runtime.md | worlds work; research/11 covers the extension contexts]**. | unverifiable | NEEDS-USER | Find evidence or remove claim |
| 220 | research/17-vitest-browser-runtime.md | (`spikes/ng222-app/node_modules/...`, file named) or a vendor statement; **[inferred]** = Claude's reading, not run. | unverifiable | NEEDS-USER | Find evidence or remove claim |

## User rulings

| Queue # | Ruling | User's words | Planned |
|---------|--------|--------------|---------|

## AI Auditor Supplementary Findings

These stale claims were identified by AI auditor subagents not detected by the automated scan:

| Doc | Claim | Verdict | Class | Suggested action |
|-----|-------|---------|-------|------------------|
| .claude/skills/verify-angular-devtools/SKILL.md | Port 4317 documented for counter fixture; canonical port is 4222 | stale | fix-doc | Update port to 4222 (control-angular-dev-app/scripts/control.mjs:21) |
| .claude/skills/verify-angular-devtools/SKILL.md | On-device inspector claim requires extension installed in profile | aspirational | fix-doc | Mark as aspirational or implement |
| docs/afk-run-2026-10-12.md | "Eight skills" finish condition; repo contains 10 skills | stale | fix-doc | Amend count to 10 skills |
| docs/feature-proposals.md | "Six-feature first release" list predates N34-N37 added 2026-10-12 | stale | fix-doc | Update to include N34-N37 |
| docs/design/tutor.md | Cites packages/core/src/*.ts source paths not present in repo; should use fesm2022 bundle paths | stale | fix-doc | Replace with fesm2022 bundle paths |
