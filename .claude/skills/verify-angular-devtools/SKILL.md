---
name: verify-angular-devtools
description: Verify that the Angular DevTools extension is installed, enabled, attached to a dev-mode Angular app, shows the right Angular version, and coexists with an in-page AI extension (ng.ɵsetProfiler subscribers, the __NG_DEVTOOLS_CONNECTED__ flag, the signal graph pane, the angular:di_graph regression), and report one verdict with evidence. Covers Chrome, Chrome Beta, Edge and Edge Dev (install state from the profile) and the isolated Playwright Chromium test harness (full checks). Use after installing or updating Angular DevTools, before trusting it for a debugging session, or when a change to the AI extension could disturb it.
---

# verify-angular-devtools

One command that proves Angular DevTools works against an app and says verified, not verified or
inconclusive. It reuses `control-angular-devtools` (its `scripts/control.mjs` and feature map); read that
skill for the commands this one runs and for install and uninstall.

`V=.claude/skills/verify-angular-devtools/scripts/verify.mjs` below, run from the repository root.

## Launch

1. Serve a development build of the app, for example the counter fixture:
   `node .claude/skills/control-angular-dev-app/scripts/control.mjs up --target counter --port 4317`.
2. `node $V --app-url=http://localhost:4317/ [--di-graph]` runs, in the test harness:
   `install`, `up`, `doctor`, `attach`, `coexist [--di-graph]`, `down`. Measured: 20-27 s end to end with `--di-graph` (26-27 s on 2026-10-11).
3. Branded browser: `node $V --browser=chrome-beta` (or `chrome`, `edge`, `edge-dev`) checks the profile
   only; nothing is launched. Proof runs never use `chrome` or `edge`.

## Doctor

`node .claude/skills/control-angular-devtools/scripts/control.mjs doctor` while the harness is up (run
`verify.mjs --keep` to leave it up): process, CDP port, extension enabled and version, development build,
connected flag, DevTools window.

## Drive

`verify.mjs` drives what a developer does: loads the page, opens the Angular tab, selects the component,
opens the signal graph, records a profile while clicking the app. Recipes and handles are in
`control-angular-devtools/features/` (`attach.md`, `signal-graph.md`, `profiler.md`, `install.md`);
this skill's `features/README.md` maps each verdict check to them.

## Evidence

`tmp/verify-angular-devtools/<yyyymmdd-hhmmss.mmm>/` (git-ignored): `verdict.json` (browser, verdict, checks,
every control step with its exit code and JSON result) and `control-evidence/` (copied from the control
run: `coexist.json`, DevTools window screenshots before and after `angular:di_graph`). Rules: the real user
path, before and after state, page-side values next to the panel, a second run before a pass after a fix
counts, and every check not reached is listed under `notCovered`.

## Cleanup

`verify.mjs` runs `control.mjs down` itself (unless `--keep`): the browser it started is closed, its state
and profile removed, evidence kept. Stop the app with the tool that started it
(`control-angular-dev-app ... down --target counter --port 4317`).

## Helpers

`scripts/verify.mjs [--browser test|chrome|chrome-beta|edge|edge-dev] [--app-url <url>] [--di-graph] [--keep]`

| Exit | Verdict |
|---|---|
| 0 | verified: extension loaded and enabled, attached, coexistence checks passed (branded: installed and enabled in the profile) |
| 1 | not verified: a check failed; `verdict.json` names it |
| 2 | inconclusive: a step could not run (no app, port in use, launch failed), `--app-url` missing, or a branded profile lists the extension with `disable_reasons` |

Flags take `--flag value` or `--flag=value`; an unknown flag, a missing value or an unknown `--browser` exits 2
before anything runs.

`--di-graph` adds the `angular:di_graph` check. It reports `diGraphTemplateLostInPane`; `true` is the known
Angular bug (`research/05-spikes.md`), not a verify failure.

## Gotchas

- Branded browsers get the install check only. Enabled state comes from `disable_reasons` and `state` in the
  profile (inferred meaning). Edge Dev read `[1,2]` while Lars had it off and `[]` after he re-enabled it;
  `--browser=edge-dev` exits 0 as of 2026-10-11 (measured). Check `edge://extensions` before trusting it.
- The harness is headed; it opens a window on Lars's desktop for about half a minute.
- Run `verify.mjs` with no other `control-angular-devtools` flow up in the same checkout: `up` refuses
  when a state file exists.
