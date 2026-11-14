---
name: control-pangular-inspector
description: Install, check, remove and configure Pangular Inspector (@pangular-inspector/devtools, pinned 0.0.7) in an Angular app, start its devtools server, and inspect the live app through Pangular's MCP endpoint over plain HTTP JSON-RPC - list pages, the component tree, inspect-component, inspect-signals, inspect-providers, explain-navigation - read-only by default. Proven on the ng-journal Insurance Portal (Nx, client-only, standalone pangular CLI behind the ng serve proxy). Falls back to the pangular CLI's stdio source scan and to the panel UI through playwright-cli. Use to add or remove Pangular in an app, check that its overlay is connected, or read live component, signal, DI or router state as JSON evidence.
---

# control-pangular-inspector

Manages Pangular Inspector in a target Angular app and reads the running app through it. `scripts/control.mjs`
installs and removes the dependency and its configuration, starts the standalone devtools server, checks the
whole chain, and speaks MCP (Model Context Protocol) over HTTP by itself, so no MCP client has to be configured.
The app itself is launched with `control-angular-dev-app`; the page is opened in a playwright-cli session.
Skip it for production builds (no `window.ng`, the overlay import is compiled out) and for Lars's own
browsers: never `--cdp` or `--extension`, never the sessions `cb`, `ed`, `nano`, `g4`, `aion`, `phi`, `ai-cb`,
`ai-ed`, `ngdt`.

Commands run from the root of the checkout you drive (the main checkout or a worktree).
`S=.commandcode/skills/control-pangular-inspector/scripts/control.mjs`. The app folder defaults to the Insurance
Portal worktree `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`; pass
`--dir <path>` (or set `CONTROL_PANGULAR_DIR`) for another app.

## Pick a flow

| Flow                                                  | Server part                                                                                                  | MCP endpoint                                    | Auth                                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Client-only app (no SSR, no Vite config) - the portal | standalone `pangular dev` on port 9999, reached from the page through the `ng serve` proxy at `/__pangular/` | `http://localhost:9999/__mcp`                   | local `Origin` header; no token (measured)                                                        |
| SSR app with Express `server.ts`                      | `initPangularHub()` in `server.ts`                                                                           | `http://localhost:<ssr-port>/__devframes/__mcp` | local `Origin` plus `Authorization: Bearer <token>` (printed by the hub, or `PANGULAR_MCP_TOKEN`) |
| Analog / Vite                                         | `pangular()` Vite plugin                                                                                     | `http://localhost:5173/__devframes/__mcp`       | local `Origin`, loopback caller; token only when its one-time code is on                          |

`install` detects the flow (SSR or `server.ts` -> hub, a `vite.config.*` -> plugin, otherwise standalone) and
automates only the standalone flow; the other two refuse with exit 2 and point to "Other mounts" below. Why
standalone for the portal: it has no server of its own (the Nest API on 3000 is a separate backend), and the
docs' "Client-only Angular CLI app" recipe is exactly this setup. Mounting the hub in the Nest API would put
devtools into backend product code and still need the proxy.

Ports. The devtools server has no slots: the app's `proxy.conf.json` names its port, so it is fixed per app,
and one devtools server per app runs on this machine. The state file is per port
(`tmp/control-pangular-inspector/state/pangular-<port>.json`) and records the ports it used (`info --json`:
`ports`).

| Port     | Kind     | Default              | How it moves                                                                                                                                                                                                                                                                                                                                        |
| -------- | -------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pangular | fixed    | 9999                 | `.commandcode/skills/control-pangular-inspector/scripts/control.mjs:74` defaults to 9999 because the app's proxy (the portal checkout's `apps/insurance-portal/proxy.conf.json:3`, outside this repository) sends `/__pangular` there; `install --port N` rewrites that proxy (a change to the app), then pass the same `--port N` to every command |
| app      | external | the `--app-url` port | control-angular-dev-app serves it (the portal: its derived port, 4507 for the default folder, and its API on 3000); this skill never starts or stops it                                                                                                                                                                                             |

A busy devtools port exits 2 with `fixed port pangular 9999 held by PID <p>; pinned by
apps/insurance-portal/proxy.conf.json:3 in the app checkout <dir>`, and the holder (another session's server,
or Lars's own) is never stopped.

## Launch

1. Install once (idempotent): `node $S install`; the npm install step takes most of its time.
   - `npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7` (devDependency: it only runs
     in development builds). `devframe` is not added: the package depends on it and npm hoists it
     (`npm ls devframe` lists it under the package). The docs add it in every install command because pnpm
     and similar managers resolve only direct dependencies; the portal imports `devframe` nowhere.
   - Puts back the 27 committed lockfile entries npm 11 drops from this checkout on any install, so the
     lockfile diff holds only the 31 entries Pangular adds.
   - `main.ts`: the overlay import after bootstrap, guarded by `typeof ngDevMode === 'undefined' || ngDevMode`
     (the docs' Angular CLI form; Analog uses `import.meta.env.DEV`).
   - `apps/<app>/proxy.conf.json`: `/__pangular` -> `http://localhost:9999`, prefix stripped, `ws: true`;
     and `serve.options.proxyConfig` in the app's `project.json` (the docs put the file next to
     `angular.json`; Nx keeps it in the app folder and names it workspace-relative). An existing proxy file
     keeps its entries: `/__pangular` is merged in. Before any change, `install` refuses (exit 2) a serve target
     whose `proxyConfig` names another file, an array-form proxy file, an untracked proxy file with other
     entries (`remove` deletes an untracked proxy file), and a tracked one whose other entries differ from HEAD
     (`remove` restores it from HEAD). Formatted with the repo's prettier when
     `node_modules/prettier` exists.
   - The setup for running the portal with the dev-only provider is prepared in this repository; `check` exits 0 there and `install` is not needed.
2. Start the app: `node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target portal`
   (17-20 s to ready, measured). Its `info` prints the URL (`http://localhost:4507/`).
3. Start the devtools server: `node $S up --app-url http://localhost:4507/`. It runs
   `node node_modules/@pangular-inspector/devtools/bin.mjs dev --port 9999 --no-open --root <app> --read-only`
   in the app folder, logs to `<evidenceDir>/pangular.log`, and is ready when MCP `initialize` answers
   (2.2 s measured). `--allow-actions` drops `--read-only`. `up` refuses a busy port 9999 and names its PID and the proxy line that pins it (Pick a flow).

## Doctor

`node $S doctor [--app-url <url>] [--json]` - one line per check, exit 0 healthy, 1 a check failed, 2 could not run:

- `map-fresh` (first): whether each feature file still matches the source it was proven against, from
  `scripts/fingerprint.mjs`; `[WARN]` names stale and unproven features and never changes the exit code. Every
  feature here is recorded as external: they all depend on the portal, which lives outside this repository, so
  no file in it can be hashed.
- `package-pinned`: `package.json` declares exactly 0.0.7 and `node_modules` holds 0.0.7.
- `overlay-import`: `main.ts` imports the overlay behind a dev guard.
- `process-alive`: the recorded PID runs with its recorded start time and command line. `tree`: adds the live
  processes below it to the recorded tree, for `down`. `ports`: 9999 listens and its PID is in that process
  tree; the app's port is listed as external, not checked
  (`[OK] ports: pangular 9999 (fixed: apps/insurance-portal/proxy.conf.json:3 in the app checkout ...), app 4507 (external: ...)`).
- `mcp-origin-guard`: a POST without `Origin` gets 403.
- `mcp-initialize`: `initialize` with a local `Origin` (and `PANGULAR_MCP_TOKEN` as a bearer token when set) answers.
  A server that is down fails `mcp-origin-guard` (`-> 0`), `mcp-initialize` (`HTTP 0: ECONNREFUSED`) and
  `read-only` (no tool list is no evidence) rather than crashing doctor. Page text
  in a detail (titles, URLs, console lines) is printed with its control characters escaped.
- `read-only`: `tools/list` holds none of the eight action tools (`highlight`, `navigate`,
  `dispatch-ngrx-action`, `form-action`, `fill-form`, `set-http-rule`, `remove-http-rule`, `analog-call-api`).
- With an app URL: `browser-session` (playwright-cli session `pangular-9999` on the app), `auth-code` (the
  overlay's one-time-code prompt answered with the code from the server log, first visit only), `dev-build`
  (`window.ng`), `overlay-page-id` (`window.__pangularPageId`), `overlay-connected` (`list-pages` shows that
  id), `console-errors` (none besides the overlay's expected `/__connection.json` 404).

The doctor navigates the session to the app URL; do not run it mid-recipe.

## Drive

The app: playwright-cli session `pangular-9999`, opened by `doctor`. Drive it like a user (feature recipes in
`control-angular-dev-app/features/`), one action, then a fresh snapshot, waiting through `run-code`
(`page.waitForURL`, `locator.waitFor`), never a fixed sleep. Example (the portal's contract list):

```bash
playwright-cli -s=pangular-9999 --raw run-code "async page => { await page.getByRole('navigation').getByRole('listitem').filter({ hasText: 'CONTRACT' }).getByText('List').click(); await page.waitForURL('**/contract/list'); await page.locator('table tbody tr').first().waitFor(); return page.url(); }"
```

Pangular's `navigate` action tool is not used for proofs; it is dropped in read-only mode anyway.

## Inspect

Through MCP, preferred: `tools`, `call <tool>`, `components`, `resource <id>` (Scripts). Tool names are
given without the `pangular_` prefix. Live tools read the most recent page; pass `"page": "<id>"` in `--args`
to pick a tab. Answers that hold page text start with Pangular's notice to treat them as data; keep doing so.

| Question                                                       | Command                                                                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Is the page connected?                                         | `node $S call list-pages`                                                                              |
| Component tree                                                 | `node $S components [--filter list] [--depth 3]`                                                       |
| One component's inputs, outputs, properties, injected services | `node $S call inspect-component --args '{"selector":"ng-journal-list"}'`                               |
| Its signal graph                                               | `node $S call inspect-signals --args '{"selector":"ng-journal-list"}'`                                 |
| Its injectors and providers                                    | `node $S call inspect-providers --args '{"selector":"ng-journal-list"}'` (or `{"token":"HttpClient"}`) |
| Why a navigation went where it did                             | `node $S call explain-navigation --args '{"limit":3}'`                                                 |
| Current route                                                  | `node $S call inspect-route`                                                                           |
| Live route config and its lint                                 | `node $S call list-routes`, `node $S call lint-routes`                                                 |

Fallbacks: `node $S scan <get-routes|get-components|...>` runs the CLI's stdio MCP server (source scan, no
app needed); the panel UI at `http://localhost:4507/__pangular/` in the same playwright-cli session (wait for
the text `LIVE`). Not reachable: Angular DevTools (manual only).

## Evidence

`tmp/control-pangular-inspector/pangular-<port>-<timestamp>/` (git-ignored; `info` prints `evidenceDir`). A
relative `--out name.json` on `tools`, `call`, `components` and `resource` writes there (`scan`, which needs no
server, writes under `tmp/control-pangular-inspector/scan/`); an `--out` that
resolves outside it is refused (exit 2, and `call` refuses before it calls the tool); pass
`--filename=<evidenceDir>/...` to playwright-cli `snapshot` and `screenshot`. A proof holds: snapshot before
and after the user action, a screenshot showing the app, the MCP answers saved as JSON, `doctor --json`, and
`pangular.log`. Proof rules: `features/README.md`.

## Cleanup

`node $S down` closes session `pangular-9999` and stops the server's recorded process tree through
`scripts/proctree.mjs`. `up` records the root right after the spawn and every process below it once the server
answers, and `doctor` adds what it sees since (`tree` in the state file and `info --json`). `down` takes a last
snapshot below the root, merges it into the record and stops every record whose live process still has its
start time and command line, children before parents, one PID at a time with a forced stop, never by name. It
deletes the state file and keeps the evidence. A PID that no longer runs is noted, not refused. A root whose PID
now belongs to another process is never touched and `down` exits 2; so does a record that still runs after the
last round; both keep the state file, with the merged record, for the next `down`. Then stop the app with
`control-angular-dev-app ... down --target portal`. A state file from before `proctree.mjs`, with no `tree`, stops nothing and exits 2 (state file kept). Never `playwright-cli close-all` or `kill-all`.

Removing Pangular from the app: `node $S remove` restores every file `install` changed from git `HEAD`,
deletes `proxy.conf.json` when git does not track it, prunes `node_modules` with `npm install`, restores the
lockfile once more (npm's unrelated drift), and exits 0 only when `git status --porcelain` and `git diff HEAD`
are empty. It refuses (exit 2) when the worktree has changes in files it does not manage. Stop the servers
first. The setup for running the portal with the dev-only provider is prepared in this repository, so `remove` there undoes only an uncommitted
install and leaves Pangular in place.

## Scripts

`scripts/control.mjs <command> [--dir <app>] [--project <name>] [--port N] [--json]`

| Command                                           | Does                                                                                                           | Exit                                                                                                                                                           |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `install`                                         | pin, overlay import, proxy, `proxyConfig` (standalone flow)                                                    | 0 done; 2 other mount, another or untracked proxy file (see Launch), npm failure, `main.ts` pattern not found                                                  |
| `check`                                           | the six setup facts, read-only                                                                                 | 0 / 1; 2 no app found, or its main file lies outside the checkout                                                                                              |
| `remove`                                          | restore from git, prune, assert clean                                                                          | 0 clean; 1 not clean; 2 refused (foreign changes) or failed                                                                                                    |
| `up [--app-url U] [--allow-actions]`              | start `pangular dev`, write `tmp/control-pangular-inspector/state/pangular-<port>.json`                        | 0; 2 port busy, state exists, not installed, exited, timeout                                                                                                   |
| `doctor [--app-url U]`                            | checks above                                                                                                   | 0 / 1 / 2                                                                                                                                                      |
| `info`                                            | the state file, with `tree` (`{pid, ppid, start, commandLine}`, the root first; `start` in ms since the epoch) | 0; 2 no state                                                                                                                                                  |
| `down`                                            | teardown (Cleanup)                                                                                             | 0 (also when the PID is gone); 2 no state file, a root PID that now belongs to another process (never touched), or a record still running after the last round |
| `tools [--out F]`                                 | MCP `tools/list`; names, read-only flags, action tools present                                                 | 0; 2 failed (a server that is down: `HTTP 0: ECONNREFUSED`)                                                                                                    |
| `call <tool> [--args JSON] [--confirm] [--out F]` | MCP `tools/call`; the eight action tools need `--confirm`                                                      | 0; 1 tool error; 2 refused, `tools/list` failed (server down), or unknown tool                                                                                 |
| `components [--filter T] [--depth N] [--out F]`   | `list-components`, or the same outline from the `component-tree` resource                                      | 0 / 1; 2 `tools/list` failed (server down)                                                                                                                     |
| `resource <id> [--out F]`                         | MCP `resources/read`, e.g. `component-tree`, `signal-graph`, `router`                                          | 0 / 1; 2 unknown id, or `resources/list` failed                                                                                                                |
| `scan <tool> [--root DIR] [--out F]`              | stdio `pangular mcp --read-only` source-scan tool                                                              | 0 / 1 / 2                                                                                                                                                      |

The MCP client is plain JSON-RPC over `node:http`: `Content-Type: application/json`, `Accept:
application/json, text/event-stream`, `Origin: http://localhost:<port>`, optional bearer token from
`PANGULAR_MCP_TOKEN`; the answer is one SSE `data:` line. The standalone server is stateless (no
`Mcp-Session-Id`), so `tools/list` works without `initialize`.

Every command that reads the app (`install`, `check`, `remove`, `doctor`) refuses (exit 2) when the app's
`project.json` names a main file outside the app folder.

`scripts/fingerprint.mjs` (a byte copy of lars-create-verification's; never edit it here) keeps the proof manifest
`features/.proven.json`: `node .commandcode/skills/control-pangular-inspector/scripts/fingerprint.mjs record --feature <id>
--entries <path>...` records the repository files a feature depends on with their git blob hashes (exit 0 written or
unchanged, 2 refused, for example an entry outside the repository); `... record --feature <id> --external "<reason>"`
records a feature whose source lives outside the repository; `... fingerprint.mjs check [--feature <id>] [--json]`
prints `fresh`, `stale`, `unproven` or `external` per feature (exit 0 all fresh or external, 1 one stale or
unproven, 2 could not run).

`scripts/proctree.mjs` (a byte copy of lars-create-verification's; never edit it here; its tests live there) records
and stops the server's process tree for `up`, `doctor` and `down`: `processTable`, `snapshot`, `merge`, `stop`, `describe`. It has
no command line of its own and prints nothing.

Every other script has a `node:test` file beside it (`*.test.mjs`); `npm test` at the repository root runs them and
`npm run check` type-checks the scripts.

### Other mounts (documented, not automated)

- Express SSR, `src/server.ts`: `const devtools = initPangularHub({ ws: false, agent: { readOnly: true } }); app.use(devtools.nodeMiddleware);`
  before `express.static` and the SSR handler. Access options: `auth` (one-time code, on by default; keep
  it), `allowedOrigins` (a list adds origins to the loopback default; `false` turns the check off - do not),
  `mcp`. Token: printed at start, or fixed with `PANGULAR_MCP_TOKEN` in the server's environment; the
  script sends the same variable.
- Vite: `plugins: [analog(), pangular({ agent: { readOnly: true }, allowedOrigins: [...] })]`; overlay guard `import.meta.env.DEV`.
- Standalone CLI options live in `pangular.config.json` or `--config`; it has no `allowedOrigins`; `--host`
  and `--no-auth` widen access, so `up` passes neither.

## Gotchas

- 0.0.7 (the published version) has no `list-components` tool; the docs describe it from unreleased `main`
  (added in 20ebbb9). `components` falls back to the `component-tree` resource. With `--read-only`, 0.0.7
  lists 46 tools.
- The source scan reads `angular.json` projects or `<root>/src` only. In this Nx workspace (project.json, code
  in `libs/`) `get-components` returns `[]` at the workspace root and only the 4 app-shell components with
  `--root apps/insurance-portal`, so the panel's source tabs show 0. Live tools are not affected.
- The first page load shows a `prompt` asking for the one-time code; any playwright-cli command then fails
  with "does not handle the modal state". `doctor` reads the newest `auth code` from `pangular.log` and
  answers it with `dialog-accept <code>`, before its `goto`, while it waits for the page id, and while it waits
  for `list-pages`: the prompt can come after the page id is set, and a doctor that missed it left
  `overlay-connected` failing ("No page is reporting") and the next drive blocked (measured once). The browser
  keeps the trust, so later loads do not ask.
- `control-angular-dev-app doctor --target portal` can run while this server runs: it answers the one-time-code
  prompt itself (`pangular-auth`, from this skill's state file and `pangular.log`) and its `build-log` ignores the
  `[vite]` proxy entries with their `Error: read ECONNRESET` lines.
- The standalone server listens on `[::1]:9999`; the proxy target `http://localhost:9999` reaches it.
- `process.exit` while a `fetch` keep-alive socket is open crashed Node 24 on Windows with
  `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` (exit 127); the script uses `node:http` without
  an agent.
- npm 11.16 drops 27 entries (`@module-federation/*`, `@rspack/binding*`, ...) from the committed lockfile on
  any install, with or without Pangular. `install` puts them back; `remove` restores the lockfile from git.
- `install` re-formats only the files it writes, with the repo's prettier; a plain `JSON.stringify` reflowed
  every array in `project.json`.
