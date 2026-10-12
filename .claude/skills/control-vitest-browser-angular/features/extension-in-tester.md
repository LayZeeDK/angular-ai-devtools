# Extension in the tester iframe

An unpacked extension loaded by `up --extension` runs in the same browser as the tests. With the S1 Vitest
variant (`--extension s1-vitest`), its content scripts inject into the Vitest tab and the tester iframe. In the
MAIN world they see `window.ng` and the Counter. Its DevTools panel can evaluate in the tester frame, and in
attach mode `LanguageModel` is `available` in every extension context except the `devtools_page`.

## Sub-features

- `ext-loaded` the extension's service worker target exists (`doctor` `extension-loaded`).
- `ext-content-script` an isolated world from `chrome-extension://<id>` exists in the tester iframe (`doctor`
  `extension-content-script`); the MAIN-world script records `typeofNg: "object"` and the Counter's count.
- `ext-panel` the DevTools panel's `chrome.devtools.inspectedWindow.eval` with `{ frameURL: <tester URL> }`
  reaches `window.ng` in the tester; without `frameURL` it runs in the orchestrator, which has no `ng`.
- `ext-model` `LanguageModel.availability()` is `available` in the tester iframe and the extension contexts
  (attach mode); `unavailable` in bundled mode.

## How to get to it (user POV)

- The extension's own UI: DevTools on the Vitest tab, panel "S1". Results also land in the extension's
  `chrome.storage.local`, keyed `content_isolated|frame|/`, `content_main|frame|/`, `devtools_panel` and so on.

## Driving it with control-vitest-browser-angular

Preconditions:

- `node $S up --extension s1-vitest --hold 90000`; `doctor` exits 0 with `extension-loaded` and
  `extension-content-script` passing.

- **Content script.** `doctor --json > <evidenceDir>/doctor.json` records the isolated world's name.
- **Storage.** The content-script results appear once the Counter is mounted. To read them, use the spike runner
  (`node spikes/probes/vitest-attach.mjs --route attach --cdp-port <port> --label <label>` after `down`), which
  writes them to `research/raw/vitest-attach-<label>.json` under `extensionStorage`.
- **Panel.** Same runner: `panelInspectedWindowTop` and `panelInspectedWindowTester` in its output.
- **Model.** `doctor` `language-model`; for a prompt, the runner's `iframePrompt` ("OK" from Gemma 4 in 10.8 s,
  research 17).

## Gotchas

- `spikes/s1-extension` itself matches only `https://example.com/*`; use `s1-vitest`, which matches the Vitest
  server in every frame.
- The isolated world sees `typeof window.ng === 'undefined'`; only the MAIN world sees `ng`.
- `down` uninstalls the extension; `Extensions.getExtensions` is then empty.
- In the bundled flow the extension id comes from its service worker target after `up` (the path decides the id).
