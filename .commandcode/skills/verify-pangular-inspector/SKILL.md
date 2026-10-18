---
name: verify-pangular-inspector
description: Fixed proof checks for Pangular Inspector (@pangular-inspector/devtools 0.0.7) on the ng-journal Insurance Portal - the setup is pinned and in place, a real sidebar navigation is followed by live MCP reads (pages, component outline, inspect-component, inspect-signals, inspect-providers, explain-navigation), and the devtools server is read-only. Each check exits 0 pass, 1 claim failed, 2 could not run, for lars-verify to turn into a verdict. Use after installing, updating or reconfiguring Pangular, before trusting its MCP answers, or after a change to the portal's main.ts, proxy or serve target.
---

# verify-pangular-inspector

Proves claims about Pangular Inspector on the Insurance Portal; it never launches or stops anything itself.
`control-pangular-inspector` (with `control-angular-dev-app` for the portal) launches, health-checks and drives
the app: read that skill for every command, flag and gotcha.

## Checks

| Check | Claim | Feature file and sub-feature in `control-pangular-inspector/features/` | Needs running |
|---|---|---|---|
| `setup` | `check` exits 0 with every setup fact passing (exact pin 0.0.7 declared and installed, dev-guarded overlay import, proxy and its serve option). | `setup.md` `setup.check` | nothing |
| `live-reads` | With `doctor` passing, a click on the sidebar's CONTRACT > List reaches `/contract/list` with the table filled, and the MCP answers name `/contract/list` (list-pages), hold `ListComponent <ng-journal-list>` (outline), name `ListComponent` (inspect-component), return `nodes` (inspect-signals) and a `lookupPath` (inspect-providers), and report `/contract/list` as succeeded (explain-navigation). | `navigation.md` `nav.explain`; `live-inspection.md` `live.pages`, `live.tree`, `live.component`, `live.signals`, `live.providers` | the portal and `control-pangular-inspector up` on it |
| `read-only` | `tools/list` offers no action tool, and `call navigate` without `--confirm` is refused (exit 2 with its `refused: navigate ... --confirm` reason). | `README.md` (read-only unless `--allow-actions`) | the portal and `control-pangular-inspector up` on it |

Each check's header comment holds its claim, the feature it covers, its usage and the files it writes.

## Run

Through `lars-verify` (`~/.commandcode/skills/lars-verify/references/contract.md`): the condition is the check, with
`up`'s evidence directory as its output folder. For `live-reads` and `read-only`, with
`P=.commandcode/skills/control-pangular-inspector/scripts/control.mjs` and
`A=.commandcode/skills/control-angular-dev-app/scripts/control.mjs`:

- setup: `{ "argv": ["node", A, "up", "--target", "portal", "--json"], "as": "app" }`, then
  `{ "argv": ["node", P, "up", "--app-url", "{app.url}", "--json"], "as": "up" }`;
- condition: `["node", ".commandcode/skills/verify-pangular-inspector/checks/live-reads.mjs", "--session", "{up.session}",
  "--out", "{up.evidenceDir}"]` (`read-only.mjs` takes `--out` only);
- teardown: `P info --json`, `P down`, `check-teardown.mjs {runDir}/steps/teardown-1.out --artifact
  contract-list.png` (`tools-list.json` for `read-only`), then `A info --target portal --json`,
  `A down --target portal`, `check-teardown.mjs {runDir}/steps/teardown-4.out --no-artifact "supporting portal
  instance; the proof files are in control-pangular-inspector's evidence directory"` (the portal is a supporting
  instance: its session captures nothing, and its log proves nothing);
- artifacts: `{up.evidenceDir}/contract-list.png` and `{up.evidenceDir}/live-reads.json` (`tools-list.json` and
  `navigate-refused.json` for `read-only`).

`setup` needs no setup or teardown: condition `["node", ".commandcode/skills/verify-pangular-inspector/checks/setup.mjs",
"--out", "{runDir}"]`, artifact `setup-check.json`.

Standalone, against instances started by hand:
`node .commandcode/skills/verify-pangular-inspector/checks/<id>.mjs --out <dir> [--session <session>]`.

## Gotchas

- The setup steps need ports 3000 and 9999 free (both fixed: one portal and one devtools server per machine),
  and the portal app falls back to a free slot; `up` refuses a busy fixed port, which makes the run
  inconclusive, never a stop of someone else's process.
- `live-reads` runs `doctor` itself: a `doctor` exit 1 fails the claim, an exit 2 (no server) means it could not
  run.
- `read-only` counts only the `--confirm` refusal from `call navigate` as the pass: `control.mjs` refuses before
  it sends anything, so this half proves the client's refusal; the `tools/list` half proves the server offers no
  action tool.
- `live-reads` treats a closed session (the first snapshot fails) or a drive that times out as could not run;
  a drive that runs and does not reach `/contract/list` fails the claim.
- Not covered: the action tools themselves (read-only by design), the Express hub and Vite plugin mounts, and the
  `install`/`remove` round trip (it runs `npm install` in the portal checkout; see `setup.md`).
