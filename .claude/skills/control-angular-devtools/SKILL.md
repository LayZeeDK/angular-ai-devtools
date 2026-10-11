---
name: control-angular-devtools
description: Install, uninstall, check, open and drive the Angular DevTools browser extension (ienfalfjdbdpebioblfackkekamfmbnh) in Chrome, Chrome Beta, Edge or Edge Dev, and in an isolated Playwright Chromium test harness. Use to install or remove Angular DevTools, check it is loaded, enabled and attached to a dev-mode Angular app, read the Angular version it shows, open its panel and read the component tree, signal graph or profiler by script, screenshot the panel, or check that an in-page AI extension coexists with it (ng.ɵsetProfiler subscribers, __NG_DEVTOOLS_CONNECTED__, the signal graph after angular:di_graph). Runs through scripts/control.mjs, playwright-cli and raw CDP.
---

# control-angular-devtools

Manages the Angular DevTools extension and drives its panel. Supported browsers: `chrome`, `chrome-beta`,
`edge`, `edge-dev` (Lars, 2026-10-11, verbatim: "Yes, the skills manage installation and usage of Angular
DevTools. Approve installation and uninstallation in any browser." and "By any browser, I mean Edge, Edge Dev,
Chrome, and Chrome Beta. Not Firefox because it doesn't support Prompt API so isn't relevant for this
project."). `test` is an isolated Playwright Chromium with the extension loaded unpacked; it is the test
harness for proofs and scripted panel work, not a supported target. To drive the Angular app itself
(`ng.*` recipes) use `control-angular-dev-app`; to restart Lars's AI browsers use `control-ai-browsers`.

Rules for proof runs (not for Lars asking for a change): never touch `chrome` or `edge` (his daily browsers);
Chrome Beta and Edge Dev are his project browsers, not daily ones (Lars, 2026-10-11), so branded install and
uninstall proofs run in `chrome-beta`; never uninstall the copy in `edge-dev` (the source of the harness copy); never attach to Chrome Beta or Edge Dev while another
agent restarts them; never use the playwright-cli sessions `cb`, `ed`, `ai-cb`, `ai-ed`, `ng-dev`.

`S=.claude/skills/control-angular-devtools/scripts/control.mjs` below, run from the repository root.

## Pick a flow

| Flow | Browser | Session, ports, profile |
|---|---|---|
| Test harness, main checkout (`.git` is a directory) | Playwright's bundled Chromium (Chrome for Testing 154.0.8037.0 measured), headed | session `ngdt`, CDP port 9420, profile `tmp/control-angular-devtools/profile/main` |
| Test harness, worktree (`.git` is a file) | same | session `ngdt-wt-<hash>`, CDP port 9421-9499 from a hash of the worktree path, profile `.../profile/wt-<hash>`; port 9420 is refused |
| Branded | `--browser chrome|chrome-beta|edge|edge-dev` | Lars's own profile (`--profile Default` by default); nothing launched or stopped by `up`/`down` |

The script derives all of these; `--cdp-port N` overrides the port.

## Launch

Install the extension copy, start the app, then the browser:

```bash
node $S install                                   # copy from Edge Dev's profile, read only
node .claude/skills/control-angular-dev-app/scripts/control.mjs up --target counter --port 4317
node $S up --app-url=http://localhost:4317/
```

- `install` (test): copies the newest `<version>_0` folder from
  `%LOCALAPPDATA%\Microsoft\Edge Dev\User Data\Default\Extensions\ienfalfjdbdpebioblfackkekamfmbnh\` to
  `tmp/control-angular-devtools/extension/<version>/`. `--from edge|chrome|chrome-beta|<dir>` picks another
  source. Never writes to the source. The copy keeps `_metadata/`; Chromium accepted it (0 manifest errors,
  0 warnings, measured), and the manifest's `key` keeps the store ID `ienfalfjdbdpebioblfackkekamfmbnh`.
- `up` writes a playwright-cli config (`tmp/control-angular-devtools/state/<flow>.cli.config.json`) with
  `browser.browserName: chromium`, `launchOptions.channel: chromium`, `headless: false`, `userDataDir`, and
  `args: --disable-extensions-except=<copy> --load-extension=<copy> --auto-open-devtools-for-tabs
  --remote-debugging-port=<port>`, then runs `playwright-cli -s=ngdt --config=<file> open <app-url>`. The
  `--config` / `launchOptions` schema is in playwright-cli 0.1.21's README; no Node launcher is needed.
- Ready when the CDP port lists the extension's `service_worker` target. Measured: 2.9-8 s (2.9 s from a fresh copy and profile, 8 s measured 2026-10-11).
- For the app, prefer `control-angular-dev-app` (it owns the fixture's lifecycle). Without it:
  `npx ng serve --port <free port>` in `spikes/ng222-app`, and stop that PID's tree yourself.

## Doctor

`node $S doctor` (read only). One line per check: `process` (the playwright-cli PID is alive and its start
time and command line match the state), `cdp-port` (answers, owned by the recorded Chromium PID), `extension`
(`chrome.developerPrivate.getExtensionInfo` on `chrome://extensions/?id=...`: name, version, `ENABLED`,
`UNPACKED`, path, error counts; plus the service worker), `app` (`[ng-version]` and `window.ng`, which only a
development build has), `connected-flag`, `devtools-window`. Exit 0 healthy, 1 a check failed, 2 no state.

## Drive

Two drivers, one per surface:

- **The app page:** playwright-cli session `ngdt` (snapshot, one action, fresh snapshot). Selector order:
  roles and accessible names, then the app's own element names. Wait by polling an end state, never a sleep.
- **The Angular DevTools panel:** raw CDP from `control.mjs` (Node 24 `fetch` and `WebSocket`, no
  dependency). `up` opens DevTools for the tab, which shows up on the CDP port as a `devtools://devtools/
  bundled/devtools_app.html` target. `panel` evaluates
  `Extensions.extensionServer.onShowPanel({command: 'showPanel', id: 'chrome-extension://<id>Angular'})` in
  it, then drives the panel's own target `chrome-extension://<id>/index.html` with `Runtime.evaluate`.

```bash
node $S attach                                   # attach markers, Angular version
node $S panel show                               # opens the Angular tab, prints the panel text
node $S panel signal-graph --component=app-counter
node $S panel screenshot                         # PNG of the DevTools window into the evidence dir
node $S coexist [--di-graph]                     # see Inspect
```

Panel handles (read from the live panel, 1.22.0): tabs are buttons/links named `Components`, `Profiler`,
`Injector Tree`, `Router Tree`, and `Transfer State` only for a hydrated (SSR) app; `Router Tree` only when the
app has routes (`devtools-tabs.component.ts`); tree rows are `.node-name`; the `Show Signal Graph` button; graph
nodes are `ng-signal-graph-pane .node-cont.kind-<kind>` with the label and value as text, where kind is
`template`, `signal`, `computed`, `effect`, `linked-signal`, `child-signal-prop`, `resource` or `unknown`
(`signals-visualizer.ts`; the counter shows the first four);
the profiler button has `aria-label` `Start recording` / `Stop recording` and the result reads
`Change detection cycles ... <n> / <total>`.

Feature recipes: `features/README.md`.

## Inspect

- **Loaded and enabled, version:** `doctor`'s `extension` line.
- **Attached to the app (`attach`):** an init script records the page's `message` events, then reloads. The
  markers, read from `shell-browser/src/app/{manifest,content-script,detect-angular,backend,
  devtools-connected-flag}.ts`: `window.__NG_DEVTOOLS_CONNECTED__ === true` (MAIN-world script at
  `document_start`); a `detectAngular` message from `angular-devtools-detect-angular-<url>` with
  `{isAngular, isDebugMode, isIvy, isSupportedAngularVersion, isAngularDevTools}`; `backendInstalled` and
  `handshake` from `angular-devtools-content-script-<url>`; `backendReady` from `angular-devtools-backend-<url>`.
  The backend `<script>` tag is added and removed at once, so the messages are the marker, not the DOM.
  The console also shows `Attempting handshake with backend` from `content_script_bundle.js`.
- **Angular version shown:** the `ng-version` attribute of the first `[ng-version]` element, the same read as
  DevTools' `getAngularVersion()`. Measured: 22.2.2.
- **Coexist (`coexist`):** with the panel open on Profiler and recording, adds two `ng.ɵsetProfiler`
  subscribers, clicks the app, removes one with its returned function, clicks again, stops recording. Passes
  when the removed one stops counting, the other keeps counting and DevTools recorded the cycles. Never call
  `ng.ɵsetProfiler(null)`: it empties the list, DevTools' subscriber included (`render3/profiler.ts`). Then
  checks the connected flag and that the pane's signal graph matches `ng.ɵgetSignalGraph`. `--di-graph` runs
  Angular's `angular:di_graph` tool and re-reads both: the template node disappears from both (measured).
  That breaks the page's signal graph until reload; run it last.
- **Branded browsers:** `status --browser <name>` reads `<User Data>\<profile>\Extensions\<id>\` and
  `Secure Preferences` -> `extensions.settings.<id>` (version, `disable_reasons`, `from_webstore`). Read only.

Not covered by script: the panel inside branded browsers (`onShowPanel` and `UI.panels` are DevTools
frontend internals, proven only in Chrome for Testing 154); opening the panel page directly as
`chrome-extension://<id>/index.html` in a tab (fails: `chrome.devtools` is undefined, `TypeError: Cannot
read properties of undefined (reading 'inspectedWindow')` from `bundle/main.js`); Playwright
`connectOverCDP` reaches the DevTools page but lists the extension frames with empty URLs, so it is not used.

## Evidence

`tmp/control-angular-devtools/evidence/<yyyymmdd-hhmmss>/` (git-ignored), created by `up`: `coexist.json`,
`signal-graph-before.png`, `signal-graph-after-di-graph.png`, `devtools-*.png`. App snapshots go there with
`playwright-cli -s=ngdt snapshot --filename=<evidence dir>/<name>.yml`. Proof rules: `features/README.md`.

## Cleanup

`node $S down`: checks the recorded playwright-cli PID's start time and command line, runs
`playwright-cli -s=ngdt close`, waits for that PID and the Chromium PID to exit (`taskkill /T /F` on the
recorded PID if they do not), deletes the state file, the playwright-cli config and the profile, keeps the evidence. A PID that is
already gone is noted, exit 0. Then stop the app with the tool that started it. Never `close-all` or
`kill-all`. `uninstall` (test) deletes the extension copy and test profiles; it refuses while `up`.

## Helpers

`scripts/control.mjs <command> [options] [--json]`; exit 0 done or healthy, 1 not healthy, 2 refused or
could not run (the reason is printed; `--json` gives `{ok, exit, reason}`). Flags take `--flag value` or
`--flag=value`; an unknown flag, a missing value, a `--browser` outside `test|chrome|chrome-beta|edge|edge-dev` or
a non-numeric `--timeout`/`--cdp-port` exits 2 before anything runs.

| Command | Does | Notes |
|---|---|---|
| `install [--browser test\|chrome\|chrome-beta\|edge\|edge-dev] [--from ...] [--profile P] [--timeout S]` | test: copies the extension. Branded: no-op when installed; else opens the Chrome Web Store page `https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh` in that browser's profile P (`--profile-directory`) and polls the profile every 2 s until the extension appears (default 180 s) | Lars clicks the store's add button and confirms "Add extension"; Edge first asks to allow extensions from other stores |
| `uninstall [--browser ...] [--profile P] [--timeout S]` | test: removes copy and profiles. Branded: no-op when not installed; else opens the Web Store page in profile P (a browser will not open `chrome://` or `edge://` pages from the command line) and polls every 2 s until the profile's `extensions.settings.<id>` entry is gone | Lars clicks "Remove from Chrome" on the store page, or Remove on `chrome://extensions` |
| `status [--browser ...] [--profile P]` | installed, versions on disk, enabled, `disable_reasons` | read only |
| `up --app-url <url> [--cdp-port N]` | launches the test harness | state `tmp/control-angular-devtools/state/<flow>.json`: pid, browserPid, created, commandLine, cdpPort, session, evidenceDir, readyInSeconds |
| `doctor`, `attach`, `info`, `down` | above | `info` prints the state (flow, session, PIDs, CDP port, evidence dir, state path) |
| `panel show\|signal-graph [--component C]\|screenshot [--file F]` | panel driving | `show` prints the panel's text (tabs, tree, selected component) |
| `coexist [--component C] [--click "<locator>"] [--di-graph]` | coexistence checks | defaults fit the counter fixture: `app-counter`, `getByRole('button', { name: 'Increment' })` |

## Gotchas

- playwright-cli prints the PID of its own Node daemon ("opened with pid N"), not Chromium's. The CDP port
  belongs to a child `chrome.exe`; the state keeps both, and `down` waits for both.
- Playwright's init script runs before the extension's MAIN-world `document_start` script (the flag was
  unset in the init script, then set 53 ms in). Order among `document_start` scripts is not a contract: an
  AI extension reads `__NG_DEVTOOLS_CONNECTED__` lazily, never at its own start, and never writes it.
- `attach` traps the flag with an accessor to time it; later reads of its property descriptor see that trap.
- A click resolves before Angular's change detection runs. The first probe read 2 profiler events after a
  click and 16 once the recipe waited for the component text to change and a frame to pass.
- The pane re-reads the graph after change detection; `coexist --di-graph` clicks the app before the second
  read. Without that nudge the pane keeps showing the old graph (inferred, not measured).
- `--auto-open-devtools-for-tabs` needs a headed browser; the window opens on Lars's desktop.
- Branded `enabled` is inferred from the profile: no `disable_reasons` and `state` not 0. Edge Dev read
  `disable_reasons [1,2]` while Lars had it off and `[]` with neither key present after he re-enabled it
  (measured 2026-10-11); the extensions page is the authority.
- The panel id is `chrome-extension://<id>Angular` because the panel title is `Angular`; for a Google-internal
  user the title becomes `Angular & Wiz` (`shell-browser/src/devtools.ts`) and `panel` would not find it
  (inferred, not run).
- Branded install and uninstall need a human click on browser UI (the store's confirm dialog, the Remove
  confirm); the script opens the page and polls. These steps are unproven: not yet run in any branded
  browser. `--profile P` also passes `--profile-directory=P` to the window it opens (not yet run in a branded browser).
