# Install, uninstall and status

Angular DevTools is a Chrome Web Store extension (`ienfalfjdbdpebioblfackkekamfmbnh`). A developer adds it
from the store page, sees it on the extensions page, and removes it there. In the test harness it is a local
unpacked copy loaded at launch.

## Sub-features

- Install: test harness copy; branded store install.
- Status: test: the copy on disk and whether `up` runs (registered version and enabled state come from
  `doctor`); branded: installed, version, enabled, `disable_reasons`.
- Uninstall: test copy and profiles; branded Remove.

## How to get to it (user POV)

- Store page: `https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh`, the add button, then
  "Add extension" in the confirm dialog (Edge first asks to allow extensions from other stores; the button
  labels in Edge are not measured).
- Extensions page: `chrome://extensions/?id=ienfalfjdbdpebioblfackkekamfmbnh` or `edge://extensions/?id=...`;
  the toggle enables, Remove uninstalls.

## Driving it with control-angular-devtools

Preconditions: none for `status`; a test `install` needs no browser running, a branded one needs Lars at the
browser to click the store button. A test `uninstall` refuses while `up` runs (`down` first).

```bash
node $S install                          # test copy from Edge Dev (read only)
node $S status --browser=chrome-beta     # read only, any branded browser
node $S install --browser=chrome-beta    # opens the store page, polls for Lars's click (default 180 s)
node $S uninstall --browser=chrome-beta  # opens the store page, polls for "Remove from Chrome"
node $S uninstall                        # test copy and profiles
```

End state: test: `doctor` line `extension: Angular DevTools 1.22.0 ENABLED (UNPACKED, ...)`. Branded:
`status` shows `installed true` with the version, and the profile's `Extensions\<id>\<version>_0` folder.

## Gotchas

- Branded install, uninstall and reinstall are proven in Chrome Beta (2026-10-11, measured): install exit 0, uninstall exit 0 once Lars removed it, install exit 0, `status --browser chrome-beta` installed and enabled (1.22.0). The first uninstall timed out (exit 1) because the poll window ran out before Lars clicked; rerun `uninstall` and it exits 0 at once if the entry is gone.
- `chrome://` and `edge://` URLs passed on the command line open an empty window instead of the page (measured in Chrome Beta), which is why `uninstall` opens the store page.
- Right after the click, the profile entry can exist before the manifest version is written; `install` then reads the version from the `<version>_0` folder name.
- After Remove, Chrome may leave the version folder on disk for a while; `uninstall` treats the profile entry
  as the authority and reports leftover folders.
- `enabled` for branded browsers is read from `disable_reasons` and `state` (inferred meaning); the extensions
  page is the authority. Measured 2026-10-11: Edge Dev `installed true, version 1.22.0, enabled true,
  disable_reasons []`; Chrome Beta `installed false`.
- `--profile P` picks the profile read and also passes `--profile-directory=P` to the window it opens (not yet
  run in a branded browser).
- Proof runs never touch `chrome` or `edge`, and never uninstall the copy in `edge-dev`; branded install and
  uninstall proofs run in `chrome-beta`.
