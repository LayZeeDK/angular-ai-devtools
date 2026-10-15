# Attach to a dev-mode Angular app

On an Angular page the extension sets a flag, detects Angular, injects its backend and shakes hands with it,
and its toolbar icon turns from grey to colour. The Angular tab in DevTools then shows the app; the info
button shows the Angular version.

## Sub-features

- Connected flag `window.__NG_DEVTOOLS_CONNECTED__`.
- Detection result: `isAngular`, `isDebugMode` (development build), `isIvy`, `isSupportedAngularVersion`
  (major 12+ or 0).
- Backend injection and handshake.
- Angular version from `[ng-version]`.

## How to get to it (user POV)

Load any page of the app with the extension enabled; the popup (toolbar icon) says whether the page is a
supported development build.

## Driving it with control-angular-devtools

Preconditions: the test harness is up on a development build (`doctor` exits 0).

```bash
node $S attach
```

Expected (measured on the counter fixture): `flag true (set at ~50 ms); detection {"isIvy":true,
"isAngular":true,"isDebugMode":true,"isSupportedAngularVersion":true,"isAngularDevTools":true};
backendInstalled true; backendReady at ~950 ms; Angular 22.2.2`.

## Gotchas

- `attach` reloads the page to catch messages from the start.
- A production build gives `isDebugMode: false`; the content script still injects the backend (it gates on
  `isAngularDevTools`, `isAngular` and an HTML document, not on `isDebugMode`; built 1.22.0
  `app/content_script_bundle.js`), the popup shows `production.html`, and
  `attach` exits 1 because it requires `isDebugMode`.
- The toolbar icon and popup are browser UI, not checked by script.
