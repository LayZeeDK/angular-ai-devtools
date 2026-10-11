---
name: verify-pangular-inspector
description: Verify that Pangular Inspector (@pangular-inspector/devtools 0.0.7) is installed at its exact pin in the Insurance Portal, that the page's overlay is connected, that the MCP endpoint answers live component, signal, provider and navigation reads after a real user navigation, and that the server stays read-only, and report one verdict (verified, not verified, inconclusive) with evidence. Reuses control-pangular-inspector and control-angular-dev-app. Use after installing, updating or reconfiguring Pangular, before trusting its MCP answers in a debugging session, or after a change to the portal's main.ts, proxy or serve target.
---

# verify-pangular-inspector

One command that proves the Pangular setup works end to end on the Insurance Portal and says verified, not
verified or inconclusive. It runs `control-pangular-inspector` (read that skill for every command it calls,
for install and remove, and for the feature map) and launches the app with `control-angular-dev-app`.

`V=.claude/skills/verify-pangular-inspector/scripts/verify.mjs`, run from the repository root.

## Launch

`node $V` - starts the portal (`control-angular-dev-app up --target portal`), starts the devtools server
read-only (`control-pangular-inspector up`), runs the checks below, then stops both. With a portal already
running (started by this checkout's `control-angular-dev-app`), pass `--app-url http://localhost:4775/`;
the app is then left running. `--keep` leaves everything up for manual follow-up (then run both `down`s).

## Doctor

The run calls `control-pangular-inspector doctor` and records every check (`package-pinned`,
`overlay-import`, `process-alive`, `port-owned`, `mcp-origin-guard`, `mcp-initialize`, `read-only`,
`browser-session`, `auth-code`, `dev-build`, `overlay-page-id`, `overlay-connected`, `console-errors`).
Run that doctor by hand while `--keep` holds the servers up.

## Drive

The user path: in session `pangular-9999`, click the sidebar's CONTRACT > List and wait for the table
(`control-pangular-inspector` features/navigation.md). Then the MCP reads, each saved as JSON:
`list-pages` (shows `/contract/list`), the component outline (`ListComponent <ng-journal-list>`),
`inspect-component`, `inspect-signals` and `inspect-providers` on `ng-journal-list`, `explain-navigation`
(`/contract/list` succeeded), `tools/list` (no action tools), and `call navigate` without `--confirm`
(refused, exit 2).

## Evidence

`tmp/verify-pangular-inspector/<yyyymmdd-hhmmss.mmm>/` (git-ignored): `verdict.json` (verdict, failed checks,
every check, `notCovered`, every step with exit code and JSON result) and `control-evidence/` (copied from the
control run: `doctor.json`, the MCP answers, before and after snapshots, a screenshot of the contract list,
`pangular.log`). Proof rules: `control-pangular-inspector/features/README.md`.

## Cleanup

The script stops what it started (`control-pangular-inspector down`, and `control-angular-dev-app down
--target portal` when it launched the portal), unless `--keep`. It also runs `down` after a failed `up`
that left a new state file behind, and never touches a state file that was there before the run (the run is
then inconclusive). Evidence stays.

## Helpers

`scripts/verify.mjs [--app-url <url>] [--keep]`

| Exit | Verdict |
|---|---|
| 0 | verified: setup check, doctor, the user navigation and all eight reads and refusals passed |
| 1 | not verified: a check failed; `verdict.json` names it under `failed` |
| 2 | inconclusive: a step could not run (port busy, launch failed, state file left over) |

## Gotchas

- `control-angular-dev-app up` once printed `ok: true` and then exited 3221226505 (a crash in `process.exit`),
  leaving the portal running while the run reported inconclusive. The script now trusts the printed result and
  stops the portal whenever a new `control-angular-dev-app` state file appeared (crash path not reproduced since).
- The run needs ports 3000, 4775 and 9999 free (or `--app-url` for a portal already up); a busy port gives
  inconclusive, never a stop of someone else's process.
- Setup is checked, not changed: run `control-pangular-inspector install` first when `setup` fails.
- The install and remove round trip is not part of the verdict; it needs the servers stopped
  (`control-pangular-inspector` features/setup.md). The portal has the setup committed (`f102b97`), so
  `remove` there keeps Pangular.
- While the devtools server runs, `control-angular-dev-app doctor --target portal` fails; see
  `control-pangular-inspector` Gotchas.
