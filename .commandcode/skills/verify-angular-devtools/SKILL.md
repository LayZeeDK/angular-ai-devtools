---
name: verify-angular-devtools
description: Fixed proof checks for the Angular DevTools extension in control-angular-devtools' isolated Playwright Chromium test harness - the extension is loaded and enabled, it attaches to a dev-mode Angular app (connected flag, detection, backend, version), and an in-page AI extension's use of ng.ɵsetProfiler, the __NG_DEVTOOLS_CONNECTED__ flag and the signal graph coexists with it (the angular:di_graph regression recorded). Each check exits 0 pass, 1 claim failed, 2 could not run, for lars-verify to turn into a verdict. Use after installing or updating Angular DevTools, before trusting it for a debugging session, or when a change to the AI extension could disturb it.
---

# verify-angular-devtools

Proves claims about Angular DevTools in the test harness; it never launches or stops anything itself.
`control-angular-devtools` launches, health-checks and drives the harness and the panel, and
`control-angular-dev-app` serves the app: read those skills for every command, flag and gotcha.

## Checks

| Check               | Claim                                                                                                                                                                                                                                                                                                                                                                                                         | Feature file and sub-feature in `control-angular-devtools/features/`                                                     | Needs running                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `extension-enabled` | `doctor`'s `extension` line passes: the copy is loaded `ENABLED` and its service worker runs.                                                                                                                                                                                                                                                                                                                 | `install.md` Status (test)                                                                                               | the harness (`up --app-url`)       |
| `attached`          | `attach` passes: connected flag set, `detectAngular` reports Angular in debug mode, backend installed and ready.                                                                                                                                                                                                                                                                                              | `attach.md` Connected flag, Detection result, Backend injection (handshake and version saved, not judged)                | the harness on a dev-mode app      |
| `coexist`           | `coexist` reports the profiler part (two `ng.ɵsetProfiler` subscribers count while DevTools records, the removed one stops, DevTools recorded the cycles), the connected flag still `true`, and the pane's signal graph listing the same nodes as `ng.ɵgetSignalGraph` (kind and label). With `--di-graph` it runs `angular:di_graph` last and records whether the template node is lost, without judging it. | `profiler.md` Coexistence; `signal-graph.md` Agreement and the `angular:di_graph` regression; `attach.md` Connected flag | the harness on the counter fixture |

Each check's header comment holds its claim, the feature it covers, its usage and the files it writes.

## Run

Through `lars-verify` (`~/.commandcode/skills/lars-verify/references/contract.md`), with
`D=.commandcode/skills/control-angular-devtools/scripts/control.mjs`,
`A=.commandcode/skills/control-angular-dev-app/scripts/control.mjs`, and `APP` standing for the two arguments
`"--target", "counter"` (each side derives its own app port, so a baseline and a head run side by side):

- setup: `{ "argv": ["node", A, "up", APP, "--json"], "as": "app" }`,
  `["node", D, "install", "--from", "tmp/control-angular-devtools/extension"]`, then
  `{ "argv": ["node", D, "up", "--app-url", "{app.url}", "--json"], "as": "up" }`;
- condition: `["node", ".commandcode/skills/verify-angular-devtools/checks/<id>.mjs", "--out", "{up.evidenceDir}"]`, plus
  `"--di-graph"` for `coexist`;
- teardown: `D info --json`, `D down`, `check-teardown.mjs {runDir}/steps/teardown-1.out --artifact <file>`, then
  `A info APP --json`, `A down APP`, `check-teardown.mjs {runDir}/steps/teardown-4.out --no-artifact "supporting
app server; the claim's evidence comes from the control-angular-devtools harness"` (the app is a supporting
  instance: nothing captures from it, and its log proves nothing);
- artifacts: `{up.evidenceDir}/<file>`, where `<file>` is `extension.json`, `attach.json` or
  `coexist-result.json`.

`install --from` takes the harness copy already in the checkout; a bare `install` copies from Lars's Edge Dev
profile, which a proof run never reads.

Standalone, against a harness started by hand:
`node .commandcode/skills/verify-angular-devtools/checks/<id>.mjs --out <dir> [--di-graph]`.

## Gotchas

- One harness per checkout: `up` refuses while a state file exists, so run the checks one at a time.
- `coexist --di-graph` leaves the page's signal graph broken until reload; nothing may run after it on that page.
  `templateLostInPane: true` is the known Angular bug (`research/05-spikes.md`), not a check failure.
- The harness is headed; it opens a window on Lars's desktop for about half a minute per run.
- Not covered: the branded browsers (Chrome, Chrome Beta, Edge, Edge Dev). `control.mjs status --browser <name>`
  reads Lars's own profile, which proof runs never touch, so their install and enabled state has no check.
