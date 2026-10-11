# Install, uninstall and status

Angular DevTools is a Chrome Web Store extension (`ienfalfjdbdpebioblfackkekamfmbnh`). A developer adds it
from the store page, sees it on the extensions page, and removes it there. In the test harness it is a local
unpacked copy loaded at launch.

## Sub-features

- Install: test harness copy; branded store install.
- Status: installed version(s) on disk, registered version, enabled state.
- Uninstall: test copy and profiles; branded Remove.

## How to get to it (user POV)

- Store page: `https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh`, "Add to Chrome"
  (Edge: "Get" after allowing extensions from other stores).
- Extensions page: `chrome://extensions/?id=ienfalfjdbdpebioblfackkekamfmbnh` or `edge://extensions/?id=...`;
  the toggle enables, Remove uninstalls.

## Driving it with control-angular-devtools

```bash
node $S install                          # test copy from Edge Dev (read only)
node $S status --browser=chrome-beta     # read only, any branded browser
node $S install --browser=chrome-beta    # opens the store page, polls for Lars's click (default 180 s)
node $S uninstall --browser=chrome-beta  # opens the extensions page, polls for the Remove
node $S uninstall                        # test copy and profiles
```

End state: test: `doctor` line `extension: Angular DevTools 1.22.0 ENABLED (UNPACKED, ...)`. Branded:
`status` shows `installed true` with the version, and the profile's `Extensions\<id>\<version>_0` folder.

## Gotchas

- Branded install and uninstall are unproven (not run in any browser yet).
- After Remove, Chrome may leave the version folder on disk for a while; `uninstall` treats the profile entry
  as the authority and reports leftover folders.
- `enabled` for branded browsers is read from `disable_reasons` (inferred meaning); the extensions page is
  the authority.
- Proof runs never touch `chrome` or `edge`, and never uninstall the copies in `edge` or `edge-dev`.
