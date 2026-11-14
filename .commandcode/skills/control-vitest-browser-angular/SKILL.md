---
name: control-vitest-browser-angular
description: Run, drive, screenshot, inspect and reproduce the ng222-app counter's Vitest Browser Mode tests (Angular 22.2 unit-test builder, vitest-browser-angular, Playwright) in a real Chrome Beta or Edge browser with the built-in AI model, or in Playwright's bundled Chromium, with an unpacked extension loaded into the test browser. Attaches the Vitest run to a per-model instance from control-ai-browsers over CDP, keeps the Counter mounted in the tester iframe on request, and reads window.ng, the signal graph, the profiler, injector and provider records (the CartService override), the extension's content scripts and DevTools panel, and LanguageModel from inside the tester iframe, through playwright-cli and raw CDP. Use to verify a change to the counter's tests or to the Vitest setup in the browser, to prove what an extension sees in a Vitest tester iframe, or to reproduce a failing browser test.
---

# control-vitest-browser-angular

Starts `ng test` in watch mode for `spikes/ng222-app` with its Vitest Browser Mode setup, attached to a running
browser over CDP, so the tests run in a real tab next to an extension you load. It checks the run is worth
driving, lets you drive the Counter inside the tester iframe with playwright-cli, captures evidence, and tears
down only what it started. Skip it for the counter app served by `ng serve`: use `control-angular-dev-app` for that.
Never point it at Lars's own browsers: it only attaches to instances listed in
`.commandcode/skills/control-ai-browsers/instances.json`, or to the Chromium it launches itself.

All commands run from the root of the checkout you drive (the main checkout or a worktree). `S` stands for
`.commandcode/skills/control-vitest-browser-angular/scripts/control.mjs`. Background and measurements:
`research/17-vitest-browser-runtime.md`.

## Pick a flow

| Flow             | Command                                  | Browser                                                                                             | Model                              | Extension load                     |
| ---------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------- |
| Attach (default) | `node $S up [--instance <name>]`         | the per-model instance (default `chrome-beta-gemma4`), on the CDP port control-ai-browsers gives it | yes                                | `Extensions.loadUnpacked` over CDP |
| Bundled          | `node $S up --bundled --extension <dir>` | Playwright's Chromium (Chrome for Testing 153), persistent profile under `tmp/`                     | no (`LanguageModel` `unavailable`) | `--load-extension`                 |

Ports. The main checkout uses slot 0, the defaults below. A git worktree (`.git` is a file) takes slot 1-99
from a hash of the fixture path, so its ports stay the same from run to run: Vitest `51400 + slot`, bundled CDP
`9500 + slot`, apart from control-angular-devtools' 9420-9499 (measured 2026-10-16 in the `verification-skills`
worktree: slot 36, 51436 and 9536). When a
derived port is busy, `up` tries the next slot, 10 slots in all, and records the slot and the ports it used
(`info --json`: `slot`, `ports`). Vitest's default 63315 cannot be used here, because it sits in a Windows
excluded port range.

| Port        | Kind     | Default                 | How it moves                                                                                                                                                                                                                                                                              |
| ----------- | -------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| vitest      | derived  | 51315                   | `--port`, passed as `VITEST_BROWSER_PORT` to `vitest-base.config.mts` (`strictPort`) (measured: listened on 51436, and on its fallback 51437 while a throwaway listener held 51436)                                                                                                       |
| bundled-cdp | derived  | 9350                    | moves with the slot, passed as `VITEST_CDP_PORT` to Chromium's `--remote-debugging-port` (bundled mode only; measured: 9536)                                                                                                                                                              |
| instance    | external | the instance's CDP port | control-ai-browsers owns it: `up` asks `control-ai-browsers up <instance> --json` for it, which starts the instance when it is not running (measured: 9334 for `chrome-beta-gemma4` before control-ai-browsers derived worktree ports, 9681 after, in the `verification-skills` worktree) |

- `--port N` sets the Vitest port with no fallback for it: a busy `N` exits 2 naming its holder's PID; from a
  worktree the main checkout's 51315 is refused. The bundled CDP port still derives and falls back.
- A server that finds its port taken after the check ("already in use" from Vitest's `strictPort`, or another
  process on the CDP port) is stopped, and `up` tries the next slot; each attempt logs to its own file
  (`ng-test.log`, `ng-test-2.log`, ...). A bare `--port` exits 2.
- Attach mode: an instance this run started is stopped again by `down` (through `control-ai-browsers down`), and
  the state records its port as `launchedInstancePort` so a teardown check sees it stopped; an instance that was
  already running is left running.
- One run at a time: `up` refuses while any state file exists.
- The playwright-cli session is `control-vitest-<flowId>-<Vitest port>`, for example
  `control-vitest-chrome-beta-gemma4-51315`; the flow id is the instance name or `bundled`. Never use
  `ai-<instance>-<port>` (control-ai-browsers) or `control-ngdev-*` (control-angular-dev-app).

## Launch

```bash
node .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs up --hold 90000
```

- Underneath: `node spikes/ng222-app/node_modules/@angular/cli/bin/ng.js test -c attach --watch` in
  `spikes/ng222-app`. The `attach` configuration loads `vitest-attach.config.mts`, a custom provider that
  calls `chromium.connectOverCDP(VITEST_CDP_URL)` and opens Vitest's tab in the browser's default context,
  where extensions run. `--bundled` runs `-c extension` (`vitest-extension.config.mts`) instead.
  `up` starts it through the launcher, `control.mjs __serve <that command>`, started detached; the launcher runs
  `ng test` in one hidden console and is the recorded root of the process tree.
  Environment: `VITEST_BROWSER_PORT`, `VITEST_CDP_URL` (attach) or `VITEST_EXTENSION_DIR`, `VITEST_CDP_PORT`,
  `VITEST_USER_DATA_DIR` (bundled).
- `--extension <dir>` loads any unpacked extension, for example the repository's `extension/`. Attach mode works
  without an extension; bundled mode needs one.
- `--hold <ms>` sets `VITE_COUNTER_HOLD_MS`. The spec's hold test then keeps the Counter mounted for that
  long, with `CartService` overridden to `['pear', 'plum']`, and clicks Increment once halfway through. Without
  it, a component exists only for the few milliseconds of each test.
- `--timing-demo` sets `VITE_COUNTER_TIMING_DEMO=1`, which turns on the test that fails on purpose (zoneless
  timing). `--filter <text>` passes the builder's `--filter`.
- `--watch` is explicit: a spawned process has no TTY, and Angular then defaults to one run, after which
  Vitest closes the tab.
- Ready means: a tab whose URL starts with `http://127.0.0.1:<port>/__vitest_test__/` exists in the browser, and
  the log has Vitest's `DEV` (watch) or `RUN` line. Measured in the proof run (2026-10-12): 5.2 s from spawning
  `ng test` to ready, and 19.3 s for the whole `up` including launching the stopped `chrome-beta-gemma4`
  instance. The bundled flow took 9.9 s. In a worktree (2026-10-16): attach 4.4 s with the instance launched, bundled
  21.6 s on a cold cache.
- Attach mode clears the instance's HTTP cache (`Network.clearBrowserCache`) before it loads the extension and
  before `ng test` starts: the browser
  otherwise reused a test chunk an earlier run on the same Vitest port had cached, with that run's `--hold` value
  (measured 2026-10-16: a run without `--hold` held for 90 s).
- Re-run the tests: change or touch a file under `spikes/ng222-app/src` (`touch spikes/ng222-app/src/app/counter.spec.ts`).
  The builder rebuilds and the log shows `RERUN` **[measured]**.

## Doctor

```bash
node .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs doctor
```

Read-only. Each check prints one line (`--json` for the list):

| Check               | Passes when                                                                                                                                                                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `map-fresh`         | always; `[WARN]` names the features whose files changed since they were proven (`scripts/fingerprint.mjs`), or that were never proven; never fails doctor                                                                                                                                    |
| `process-alive`     | the recorded launcher PID (the parent of `ng test`) runs with the recorded start time and command line                                                                                                                                                                                       |
| `tree`              | adds the live processes below the launcher root to the recorded tree, for `down`                                                                                                                                                                                                             |
| `ports`             | every derived port listens and its PID is in the `ng test` tree (bundled Chromium included); the instance's external port is listed, not checked: `[OK] ports: vitest 51436 (derived), instance 9681 (external: control-ai-browsers instance chrome-beta-gemma4; this skill attaches to it)` |
| `test-run`          | the log has Vitest's `DEV` (watch) or `RUN` line and no "An exception occurred" or "Unhandled Error"; reports the last `Tests` summary                                                                                                                                                       |
| `browser-cdp`       | `/json/version` answers on the CDP port                                                                                                                                                                                                                                                      |
| `orchestrator-tab`  | a tab starts with `http://127.0.0.1:<port>/__vitest_test__/`                                                                                                                                                                                                                                 |
| `tester-frame`      | the tab has a child frame named `vitest-iframe` with a default execution context                                                                                                                                                                                                             |
| `dev-build`         | `window.ng` has functions in the tester iframe                                                                                                                                                                                                                                               |
| `vitest-runner`     | `window.__vitest_browser_runner__` is an object in the tester iframe                                                                                                                                                                                                                         |
| `mounted-component` | a `[ng-version]` host exists now; `[WARN]` when no test is running                                                                                                                                                                                                                           |
| `language-model`    | `LanguageModel.availability()` in the tester iframe is `available`; in bundled mode `[WARN]` (no model)                                                                                                                                                                                      |
| `extension-loaded`  | with `--extension`: the extension's service worker target exists; `[SKIP]` without                                                                                                                                                                                                           |

Exit 0 healthy, 1 a check failed (named), 2 could not run (no state file, refused).

## Drive

Attach the run's session to the browser, then select the Vitest tab (the CDP URL and session come from `info`; the
example is a main-checkout run):

```bash
playwright-cli attach --cdp=http://127.0.0.1:9334 --session=control-vitest-chrome-beta-gemma4-51315
playwright-cli -s=control-vitest-chrome-beta-gemma4-51315 tab-list
playwright-cli -s=control-vitest-chrome-beta-gemma4-51315 tab-select <index of "Vitest Browser Runner">
```

- The snapshot includes the tester iframe with `f`-prefixed refs, for example `paragraph [ref=f1e3]: "Clicks: 3
(double 6, cart 2)"` and `button "Increment" [ref=f1e4]`; `click f1e4` clicks inside the iframe **[measured]**.
- For waits and reads inside the iframe, use `run-code` with `page.frame('vitest-iframe')`:
  `async page => { const f = page.frame('vitest-iframe'); await f.waitForFunction(() => ...); return f.evaluate(() => ...); }`
  **[measured]**. Never a fixed sleep.
- Interaction loop: snapshot, one action, fresh snapshot, check the expected change.
- The component host is `<div id="rootN" ng-version>`, not `<app-counter>`: TestBed renders into a div. Find
  it with `document.querySelector('[ng-version]')`.
- Selectors: roles and accessible names (`getByRole('button', { name: 'Increment' })`), then text
  (`getByText(/^Clicks:/)`); the fixture has no test ids.
- Driving needs a mounted component: start with `--hold`, and act within the hold window. Your click counts
  toward the hold test's own expectation only before its halfway click: the test counts up by one from the
  value it reads just before its click.
- Detach (`playwright-cli -s=<session> detach`) when done; `down` detaches too. Never `close`: the browser
  is shared with control-ai-browsers.

Recipes: `features/README.md`.

## Inspect

From the tester iframe (`page.frame('vitest-iframe').evaluate(...)`), measured in research 17:

- `window.ng`: 23 functions, including `getComponent`, `getInjector`, `ɵgetSignalGraph`, `ɵsetProfiler`,
  `ɵgetInjectorProviders`, `ɵgetInjectorResolutionPath`, `ɵgetInjectorMetadata`,
  `ɵgetDependenciesFromInjectable`. No router globals (no router in the test).
- `window.__vitest_browser_runner__` (`config`, `sessionId`, `iframeId`, `testerId`, `runner`, ...).
- `LanguageModel` in attach mode (Gemma 4 answered a prompt from the tester iframe).
- The orchestrator page and the tester iframe share one origin, so a script in the orchestrator can read
  `document.querySelector('iframe[data-vitest]').contentWindow.ng`.
- Extension side (research 17): a DevTools panel reaches the tester iframe with
  `chrome.devtools.inspectedWindow.eval(expr, { frameURL: <tester URL> })`; without `frameURL` it runs in the
  orchestrator, which has no `ng`. No extension in the repository checks this now.
- The test log (`ng-test.log` in the evidence directory): results, failure messages, failure screenshot paths
  (under `spikes/ng222-app/.vitest/attachments/`).
- Not reachable from this skill: the Angular DevTools extension (manual only; it is not loaded into these
  browsers); Vitest's RPC with `VITEST_API_TOKEN` (out of scope, research 04).

## Evidence

The evidence directory is `tmp/control-vitest-browser-angular/<flowId>-<timestamp>/` (git-ignored through
`tmp/`). It holds `ng-test.log` and what you
save there: `snapshot --filename=<dir>/<name>.yml`, `screenshot --filename=<dir>/<name>.png`, `run-code` output
redirected to `<dir>/<name>.json`. `down` keeps it. Proof rules: `features/README.md`.

## Cleanup

```bash
node .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs down
```

It reads the state file, detaches the playwright-cli session and stops the recorded `ng test` tree through
`scripts/proctree.mjs` (in bundled mode the tree includes Vitest's Chromium). `up` records the root right after the
spawn and every process below it once ready, and `doctor` adds what it sees since (`tree` in the state file and
`info --json`). `down` takes a last snapshot below the root, merges it into the record and stops every record
whose live process still has its start time and command line, children before parents, one PID at a time with a
forced stop, never by name; a process whose parent already exited is stopped because it was recorded while the
parent lived. A root whose PID now belongs to another process is never touched and `down` exits 2; so does a
record that still runs after the last round. Both keep the state file, with the merged record, and skip the rest,
so the next `down` finishes it. Otherwise, in attach mode, it closes leftover tabs on the Vitest port, uninstalls
the extension (`Extensions.uninstall`), and stops the instance only if `up` launched it. It also deletes the
bundled profile, removes the state file and keeps the evidence. A recorded PID that no longer runs is not a
refusal. A state file from before `proctree.mjs`, with no `tree`, stops nothing and exits 2 (state file kept). When `control-ai-browsers down` refuses (exit 2), the refusal stands and is noted; only a missing state file there is mended with `attach` and a second `down`. Never `close-all` or `kill-all`.

## Scripts

`node .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs <command> [flags] [--json]`

| Command  | Flags                                                                                                                                                                                  | Does                                                                                                                                                                                                                                                                                       | Exit      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| `up`     | `--instance <name>` (default `chrome-beta-gemma4`) or `--bundled`; `--extension <dir>`; `--hold <ms>`; `--timing-demo`; `--filter <text>`; `--port <n>`; `--timeout <s>` (default 180) | starts the run as above, writes the state file, waits until ready                                                                                                                                                                                                                          | 0 / 2     |
| `doctor` |                                                                                                                                                                                        | the checks above                                                                                                                                                                                                                                                                           | 0 / 1 / 2 |
| `info`   |                                                                                                                                                                                        | the state: flow id, mode, instance, CDP URL, Vitest port, `slot`, `ports` (`{name, port, kind, reason?}`), orchestrator URL, session, evidence dir, extension dir and id, `proc` (`{pid, log}`), `tree` (`{pid, ppid, start, commandLine}`, the root first; `start` in ms since the epoch) | 0 / 2     |
| `down`   |                                                                                                                                                                                        | the cleanup above                                                                                                                                                                                                                                                                          | 0 / 2     |

State file: `tmp/control-vitest-browser-angular/state/<flowId>.json`. Exit codes: 0 done or healthy; 1 not
healthy; 2 refused or could not run, with the reason (a run already recorded, 10 busy slots, a busy `--port`, worktree on
the main port, `control-ai-browsers up` failed, unknown instance, missing state file, a root PID that now belongs to another process, a record still running after `down`'s last round, `--bundled` without an extension, `ng test` exited or
failed to start, a value flag given without its value, a `--timeout` that is not a positive number of seconds or a `--hold`
that is not a positive whole number of milliseconds, and any error a command throws, such as a CDP endpoint that does not
answer: `<command> could not run: <error>`, with `; run down` after a failed `up`). Text a page or an extension controls is printed with its control
characters escaped.

`scripts/fingerprint.mjs` (a byte copy of lars-create-verification's; never edit it here) keeps the proof manifest
`features/.proven.json`:

- `node .commandcode/skills/control-vitest-browser-angular/scripts/fingerprint.mjs record --feature <id> --entries <path>...`
  records the files feature `<id>` depends on (the TypeScript import closure of the repository-relative entries)
  with their git blob hashes; without `--entries` it reuses the recorded ones. Exit 0 written or unchanged, 2 refused.
- `node .commandcode/skills/control-vitest-browser-angular/scripts/fingerprint.mjs check [--feature <id>] [--json]` prints
  `fresh`, `stale`, `unproven` or `external` per feature. Exit 0 every feature fresh or external, 1 one is stale or
  unproven, 2 could not run.

`scripts/proctree.mjs` (a byte copy of lars-create-verification's; never edit it here; its tests live there) records
and stops the run's process tree for `up`, `doctor` and `down`: `processTable`, `snapshot`, `merge`, `stop`, `describe`. It has no
command line of its own and prints nothing.

Every other script has a `node:test` file beside it (`*.test.mjs`); `npm test` at the repository root runs them and
`npm run check` type-checks the scripts.

Shared code: `spikes/probes/vitest-lib.mjs` (CDP client, frame contexts).

## Gotchas

- The Vitest tab opens in the browser's default context only because `vitest-attach.config.mts` sets
  `persistentContext` to `browser.contexts()[0]`. With Vitest's usual `browser.newContext()`, the extension did not
  reach the test page, and the instance stopped answering CDP during that run (research 17, route 2b).
- Vitest's own `connectOptions` cannot attach to these browsers: it needs a Playwright `launchServer`
  endpoint, not CDP.
- Angular's `browsers` option builds its own Playwright provider and drops a user provider, so the `attach` and
  `extension` configurations leave `browsers` unset.
- Vitest 5 takes the browser server port from the project's `test.api`; setting it at the root also starts the
  API server on the same port ("Port ... is already in use"). `vitest-base.config.mts` sets it from a plugin.
- An outside click during an earlier version of the hold test made it fail ("Received: Clicks: 5"); the test now
  counts from the value before its own click (proof run, 2026-10-12).
- `ready` first waited for the first test summary, which a long `--hold` delays by the whole hold (98 s). In
  watch mode Vitest prints `DEV`, not `RUN`, so a wait for `RUN` timed out after 180 s. Ready now accepts `DEV`,
  `RUN` or `RERUN`.
- `up` and `down` wait 250 ms before they exit: exiting while fetch's sockets to the CDP port close aborts Node on Windows
  (`Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`, exit 127; measured after `up --bundled` and an
  attach-mode `down`).
- Killing `ng test` leaves Vitest's tab open in an attached browser; `down` closes tabs on the Vitest port.
- Chrome 137+ branded builds ignore `--load-extension`, hence `Extensions.loadUnpacked` in attach mode (research
  11 and 17).
