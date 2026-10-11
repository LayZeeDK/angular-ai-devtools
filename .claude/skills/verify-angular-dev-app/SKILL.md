---
name: verify-angular-dev-app
description: Verify a change or claim in a dev-mode Angular app by driving it in the browser like a user and reporting one verdict with evidence. Covers the ng222-app counter fixture, the ng-journal Insurance Portal (with its API), or any dev-mode Angular app reached by URL; reuses control-angular-dev-app's control script and feature map. Use after changing either fixture, when a claim about ng.* output, signals, change detection, DI or routing needs proof on a real page, or before reporting a UI fix as done.
---

# verify-angular-dev-app

Proves behaviour in a running dev-mode Angular app and ends in one verdict: verified, not verified, or
inconclusive. It launches and tears down through control-angular-dev-app's script and drives through
playwright-cli; this skill adds the proof procedure. Never attach to Lars's Chrome Beta or Edge Dev
(`--cdp`, `--extension`) or use the sessions `cb`, `ed`, `ai-cb`, `ai-ed`.

Run everything from the repository root (`D:\projects\sandbox\angular-ai-devtools`).
`S` = `.claude/skills/control-angular-dev-app/scripts/control.mjs`. Read
`.claude/skills/control-angular-dev-app/SKILL.md` (Inspect, Gotchas) once before the first run.

## Launch

| Target | Command | Ready when |
|---|---|---|
| Counter | `node $S up --target counter --json` | exit 0; `readyInSeconds` about 3; app on 4222 (derived in a worktree) |
| Portal | `node $S up --target portal --json` | exit 0; about 15 s warm; API on 3000, app on 4775 for the default worktree folder |
| Any running dev-mode app | `node $S up --url http://localhost:<port>/ --json` | exit 0 when the URL answers; nothing is started |

Exit 2 means refused or failed: the reason names the port owner, the state file, or the log to read. Run
`node $S down ...` after any failed `up` so nothing is stranded. Teardown is in Cleanup.

## Doctor

`node $S doctor [--target counter|portal|--url <url>]`. Exit 0 before any drive. It checks the recorded
processes and port ownership, the build log, the Angular root and version, `window.ng` (dev build), router
globals, zone mode and console errors (on the portal, the Pangular overlay's errors are a
`pangular-overlay` warning, not a failure), opens the session `control-ngdev-<flowId>` and installs the `__ngc`
read helpers. Exit 1 names the failing check; a `dev-build` failure means a production build, which this skill
cannot verify.

## Drive

1. `node $S info` for `session`, `url`, `evidenceDir`.
2. Pick the feature file from the map ([features/README.md](features/README.md)) and its entry point. If the
   claim names an entry point, drive that one; a different path does not count.
3. Loop per step: `playwright-cli -s=<session> snapshot --filename=<evidenceDir>/<n>-before.yml`, one user
   action (`click`, `fill`, `press`, using role plus name, e.g.
   `click "getByRole('button', { name: 'Increment' })"`), wait on an end state with `run-code` (`waitForURL`,
   `locator(...).waitFor()`), then `snapshot --filename=<evidenceDir>/<n>-after.yml` and check the expected
   change.
4. Read Angular state the claim depends on with `playwright-cli -s=<session> --raw eval "() => __ngc.<fn>(...)"
   > <evidenceDir>/<n>-<fn>.json` (`inspect`, `signals`, `dependenciesOf`, `injectors`, `providers`,
   `router`). These are reads; never prove a behaviour by calling setters or `ng.applyChanges`.

## Evidence

Everything goes to `<evidenceDir>` (`tmp/control-angular-dev-app/<flowId>-<timestamp>/`, git-ignored; it
survives `down`). A proof holds:

- before and after snapshots of every step, and one screenshot with the app identity visible (the counter line,
  or the portal header "Insurance Portal");
- the side effect next to the screen: URL after navigation, `playwright-cli -s=<session> requests` lines for
  API calls (portal: `http://localhost:3000/api/...`), an `__ngc` read for signal, DI, CD or router claims;
- the server log (`app.log`, `api.log`) for build-related claims;
- `verdict.md` in the evidence dir: claim, feature ID, entry point, commands, artifacts, verdict.

Standards: the real user path, not setters or test-only routes; the action and the resulting state, not only
the end screen; mocks only behind an existing production boundary (none in these fixtures). A fix needs a
baseline: run the same recipe on the old state in a second checkout (its own derived port; the portal's fixed
API port 3000 allows one portal flow at a time, so run baseline and change one after the other) and compare.
A pass after a fix runs twice before it counts. Portal data is random per API start: compare structure, not
values. Report inconclusive when there is no valid baseline, the result is noisy, or the environment differs.

## Cleanup

`node $S down [--target ...|--url ...]`: closes the session, stops only the recorded process trees after
matching PID start time and command line, removes the state file, keeps the evidence. Exit 2 with "refused"
means the PID now belongs to another process; leave it and tell Lars. Then confirm: `netstat -ano` shows no
listener on the port, and `playwright-cli list` has no `control-ngdev-*` session. Never `close-all` or
`kill-all`.

## Helpers

- `.claude/skills/control-angular-dev-app/scripts/control.mjs` `up|doctor|info|down` with
  `--target counter|portal`, `--url <url>`, `--port N`, `--dir <path>`, `--timeout S`, `--json`. Exit 0 ok,
  1 unhealthy (doctor), 2 refused or could not run. Full table in control-angular-dev-app's Helpers.
- `.claude/skills/control-angular-dev-app/scripts/ng-inspect.js`: `playwright-cli -s=<session> --raw run-code
  --filename=<path>` installs `__ngc` when `doctor` was not run in this session.

## Gotchas

- `doctor` navigates to the app root; run it before the drive, not between steps.
- Return objects from `eval`, not `JSON.stringify(...)`, or the output is a double-encoded string.
- Never run `angular:di_graph` or `injector.get(ViewContainerRef)` during a proof: `ng.ɵgetSignalGraph`
  loses the template node for the rest of the page's life, which falsifies later signal reads.
- Never `ng.ɵsetProfiler(null)`.
- Since Angular 22.0, no `changeDetection` means OnPush; a claim of "Default" CD is checked against
  `__ngc.inspect(host).changeDetection`.
- The portal's Pangular overlay adds a `button "Toggle Pangular Inspector"` to every snapshot; it is not
  portal UI. If control-pangular-inspector runs its server on 9999, the first load asks for a one-time code in
  a `prompt` that blocks playwright-cli until answered (see control-angular-dev-app Gotchas).
- `/claim/create` in the portal shows the heading "Complaint Create" (known app bug); do not count it as a
  regression of the change under test.
