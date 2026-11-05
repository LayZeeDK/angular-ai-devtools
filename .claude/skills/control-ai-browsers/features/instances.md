# Instances

Each on-device model has its own browser instance: a separate browser process with its own profile under
`.browsers\<name>`, its own `--enable-features` set and its own remote-debugging port, all read from
`instances.json`. An instance starts, runs at the CPU or GPU backend asked for, and stops cleanly.

## Sub-features

- `instances-list` shows every registry entry with its PID, backend, drift and open tabs.
- `instances-up` starts an instance (creating its profile on first use) at its default or a named backend.
- `instances-drift` compares the running command line with the registry (doctor's `commandLine` check).
- `instances-features` reads the effective features from the version page.
- `instances-down` closes an instance over CDP and confirms nothing of it is left.

## How to get to it (user POV)

- The browser's own command line, visible on `chrome://version` / `edge://version` under the command line row.
- The profile folders in `.commandcode\worktrees\.browsers\` of the primary checkout (git-ignored). Every
  checkout of the repository, a worktree or a GSD Path sidecar included, uses these profiles and the instances
  running on them, so a model downloaded once serves every checkout.
- `http://127.0.0.1:<port>/json/version` and `/json/list` for the CDP endpoint and its tabs.

## Driving it with control-ai-browsers

Preconditions: the README baseline, except that `up` also works on a stopped instance.

- **List.** Run `C instances`. One line per instance (five), each `[OK]` with PID, `backend gpu` and `1 tab(s)`; a stopped instance
  reads `stopped`.
- **Effective features.** Run `C flags edge-dev-aion`. `[OK]` with the nine Aion features; exit 1 names any
  feature missing or not in the registry.
- **Down and up.** Run `C attach chrome-beta-nano`, `C down chrome-beta-nano` (port free, state file
  removed), then `C up chrome-beta-nano`. The `up` line names the PID, backend and time to ready.
- **Change backend.** Run `C down chrome-beta-gemma4`, then `C up chrome-beta-gemma4 --backend=cpu`; `C doctor
chrome-beta-gemma4` shows `backend` `requested cpu`, Broker State `CPU`. Go back with `down` and `up`.
- **Refusals.** `C up edge-dev-aion --backend=cpu` exits 2 before anything starts. `up` on a running
  instance with another backend exits 2 and says to stop it first.
- **Proof.** The `up`, doctor and `down` JSON in one evidence directory, and `C instances` afterwards.

## Gotchas

- Edge restores the last session's tabs at start; `up` closes them and keeps the blank tab.
- Lars's everyday Edge runs the same `msedge.exe` as `edge-phi4mini`. The script finds instance processes only by
  `--user-data-dir`, so it never sees his.
- Node's `spawn` writes `--user-data-dir=D:\...` without quotes; instances started by hand have quotes. The drift
  check parses both.
- `--backend=cpu` on Edge is refused: forcing CPU deleted the installed model twice.
- An entry's `args` are switches, bare or `--name=value`, that `up` adds after the common ones; drift requires each
  by name and, with a value, as the whole entry, and refuses them on other instances. `edge-dev-aion` has `--disable-component-update` (see model-lifecycle Gotchas).
