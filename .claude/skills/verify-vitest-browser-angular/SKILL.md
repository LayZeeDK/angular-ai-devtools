---
name: verify-vitest-browser-angular
description: Verify a change or claim about the ng222-app counter's Vitest Browser Mode tests, or about what an extension sees in a Vitest tester iframe, by running the tests in a real Chrome Beta instance with the built-in AI model (or Playwright's bundled Chromium), driving the mounted Counter like a test user, and reporting one verdict (verified, not verified, inconclusive) with evidence. Reuses control-vitest-browser-angular's control script and feature map. Use after changing counter.spec.ts, the Vitest configs or package pins in spikes/ng222-app, when a claim about window.ng, the signal graph, DI overrides, the profiler, content scripts, the DevTools panel or LanguageModel inside the tester iframe needs proof, or before reporting a test-setup fix as done.
---

# verify-vitest-browser-angular

Proves behaviour of the counter's Vitest Browser Mode run and ends in one verdict: verified, not verified, or
inconclusive. It launches and tears down through control-vitest-browser-angular's script and drives through
playwright-cli; this skill adds the proof procedure. It attaches only to instances in
`.claude/skills/control-ai-browsers/instances.json` or to the Chromium the script launches; never to Lars's own
browsers.

Run everything from the repository root (`D:\projects\sandbox\angular-ai-devtools`).
`S` = `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`. Read
`.claude/skills/control-vitest-browser-angular/SKILL.md` (Drive, Inspect, Gotchas) once before the first run.

## Launch

| Claim about | Command | Ready when |
|---|---|---|
| The test results (default specs) | `node $S up --json` | exit 0; `readyInSeconds` about 5 after the instance is up |
| The timing demo failing on purpose | `node $S up --timing-demo --json` | as above |
| The mounted Counter, DI, signals, profiler | `node $S up --extension s1-vitest --hold 90000 --json` | as above; the Counter stays mounted 90 s |
| The same without the model | `node $S up --bundled --extension s1-vitest --hold 90000 --json` | exit 0; `readyInSeconds` about 10 |

`up` launches `chrome-beta-gemma4` through control-ai-browsers when it is not running (19 s for the whole `up`
in the proof run). It refuses (exit 2) while another run is recorded, or when the Vitest port is taken.
Run `node $S down` after any failed `up` so nothing is stranded. Teardown is in Cleanup.

## Doctor

`node $S doctor`. Exit 0 before any drive. It checks the `ng test` process and port ownership, that a run
started, the browser's CDP endpoint, the Vitest tab and its `vitest-iframe`, `window.ng` and
`__vitest_browser_runner__` in the tester, a mounted `[ng-version]` host (warning between tests),
`LanguageModel.availability()` in the tester (warning in bundled mode), and with `--extension` the extension's
service worker and its isolated world in the tester. Exit 1 names the failing check.

## Drive

1. `node $S info --json` for `session`, `cdpUrl`, `evidenceDir`, `proc.log`.
2. Pick the feature file from the map ([features/README.md](features/README.md)). If the claim names an entry
   point, drive that one; a different path does not count.
3. Attach and select the Vitest tab:
   `playwright-cli attach --cdp=<cdpUrl> --session=<session>`, `playwright-cli -s=<session> tab-list`,
   `playwright-cli -s=<session> tab-select <index of "Vitest Browser Runner">`.
4. Loop per step: `playwright-cli -s=<session> snapshot --filename=<evidenceDir>/<n>-before.yml`, one action
   (`click <ref>` with the `f`-prefixed ref of the tester iframe, e.g. `button "Increment" [ref=f1e4]`), wait on
   the end state with `run-code` and `page.frame('vitest-iframe').waitForFunction(...)`, then
   `snapshot --filename=<evidenceDir>/<n>-after.yml` and check the expected change.
5. Read the Angular state the claim depends on with `run-code` returning
   `page.frame('vitest-iframe').evaluate(...)` into `<evidenceDir>/<n>-<what>.json`. Use reads only (`ng.getComponent`,
   `ng.getInjector`, `ng.ɵgetSignalGraph`, `ng.ɵgetDependenciesFromInjectable`); never prove a behaviour with
   setters or `ng.applyChanges`.
6. For a test-result claim, the evidence is the run's own log: copy `proc.log` to
   `<evidenceDir>/ng-test-<step>.log` after the summary line appears, and cite the summary and any failure
   text.
7. `playwright-cli -s=<session> detach` when done.

Verdict per claim:

- **Verified:** doctor exited 0, the expected end state is in the after-snapshot or the read, and for a fix the
  baseline shows the old behaviour (Evidence).
- **Not verified:** doctor exited 0 and the end state or the test summary contradicts the claim.
- **Inconclusive:** doctor failed, the Counter was not mounted when driven (the hold ran out), there is no valid
  baseline, or the run was noisy (a pass that did not repeat).

## Evidence

Everything goes to `<evidenceDir>` (`tmp/control-vitest-browser-angular/<flowId>-<timestamp>/`, git-ignored; it
survives `down`). A proof holds:

- before and after snapshots of every step, and one screenshot of the Vitest tab with the Counter visible
  (`playwright-cli -s=<session> screenshot --filename=<evidenceDir>/<n>.png`);
- the side effect next to the screen: the `ng.*` read for state, DI, signal or profiler claims; the test log for
  result claims; `doctor --json` output for extension and model claims;
- `verdict.md` in the evidence dir: claim, feature ID, entry point, commands with exit codes, artifacts,
  verdict.

Standards: the real user path (clicks in the tester iframe), not setters or test-only hooks beyond the hold
the fixture provides; the action and the resulting state, not only the end screen; no mocks except the
`CartService` override the spec itself makes. A fix needs a baseline: run the same recipe on the old state
in a second worktree (it derives its own Vitest port; one run per checkout, and one browser instance at a time,
so run baseline and change one after the other) and compare. A pass after a fix runs twice before it counts.
A result from one browser says nothing about another: name the browser and version from `doctor`.

## Cleanup

`node $S down`: detaches the session, stops only the recorded `ng test` tree after matching PID start time and
command line, closes leftover Vitest tabs, uninstalls the extension, stops the instance only if `up` launched it,
deletes the bundled profile, removes the state file and keeps the evidence. Exit 2 with "refused" means the PID
now belongs to another process; leave it and tell Lars. Then confirm: `netstat -ano` shows no `LISTENING` on the
Vitest port, and `playwright-cli list` has no `control-vitest-*` session.

## Helpers

- `.claude/skills/control-vitest-browser-angular/scripts/control.mjs` `up|doctor|info|down` with
  `--instance <name>` or `--bundled`, `--extension <dir>|s1-vitest`, `--hold <ms>`, `--timing-demo`,
  `--filter <text>`, `--port N`, `--timeout S`, `--json`. Exit 0 ok, 1 unhealthy (doctor), 2 refused or could
  not run. Full table in control-vitest-browser-angular's Helpers.
- `spikes/probes/vitest-iframe-probe.js`: the read-only `ng.*` probe of the tester iframe (`mount`, `after`,
  `prompt` phases).
- `spikes/probes/vitest-attach.mjs`: the spike runner that also reads the extension's storage and DevTools
  panel; it starts its own `ng test`, so run it only with no control run recorded.

## Gotchas

- Act within the hold: the Counter exists only while a test runs. Re-hold by touching
  `spikes/ng222-app/src/app/counter.spec.ts` (watch mode reruns; the log shows `RERUN`).
- The host is `<div id="rootN" ng-version>`, not `<app-counter>`.
- `doctor`'s `test-run` passes while tests fail on purpose (`--timing-demo`); read the summary for the result.
- Never `playwright-cli close`: the attached browser is a shared instance. Detach.
