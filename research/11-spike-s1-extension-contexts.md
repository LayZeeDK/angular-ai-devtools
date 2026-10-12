# 11 - Spike S1: the Prompt API in each extension context

Question (feature proposals, section 3.1 and section 7, row S1): can a Manifest V3 extension use `LanguageModel` from each of its contexts, in Chrome Beta 156 and Edge Dev 157?

Status: **phase 1 done** (API exposure, fresh profiles, no model on disk). Phase 2 (`contextWindow` and one tool round trip per context, on the standing Gemma 4 and Aion instances) has not run yet.

Every claim is labelled **[measured]** (observed in a run recorded below) or **[inferred]**.

## Setup

- Extension: `spikes/s1-extension/`. One shared probe, `probe.js`, runs in every context and records `typeof LanguageModel`, `typeof LanguageModelToolCall`, `typeof LanguageModelToolSuccess`, `isSecureContext`, `document.featurePolicy.allowsFeature('language-model')`, `LanguageModel.availability()` with no options and with the tool options (`expectedInputs` text + `tool-response`, `expectedOutputs` text + `tool-call`), and every error text. It calls `LanguageModel.create()` only when availability is `available`, so phase 1 could not start a download. When `available`, it reads `contextWindow` and runs one tool round trip copied from `spikes/probes/probe6.js` (`callID` passed back in `LanguageModelToolSuccess`, two tools, each with one required parameter).
- Each context writes its result to `chrome.storage.local` under its context name. Content scripts relay through the service worker (MAIN world -> `window.postMessage` -> isolated world -> `chrome.runtime.sendMessage` -> service worker); the offscreen document also relays, because it has no `chrome.storage`. `results.html` shows the whole store as JSON.
- Runner: `node spikes/s1-extension/run-s1.mjs --browser chrome|edge --port <n> [--model <label>] [--attach] [--keep-profile]`. It writes `research/s1-results/<browser>-<model>.json`.
- Runs: Chrome Beta `156.0.8078.17` on port 9341, Edge Dev `157.0.4322.0` on port 9342, 2026-10-12 (the evidence files hold the last of several runs per browser; earlier runs differed only before the MAIN-world fix below), each a fresh profile under `.browsers/s1-<browser>-<port>` (deleted after the run), launched with the `--enable-features` lists from the brief plus `--enable-unsafe-extension-debugging --auto-open-devtools-for-tabs --window-size=1800,1100`. Evidence: `research/s1-results/chrome-fresh.json`, `research/s1-results/edge-fresh.json`.

## Result table

Both browsers gave the same values in every cell **[measured]**. Cells read `typeof LanguageModel` / `typeof LanguageModelToolCall` / `availability()` (the tool-options call returned the same value in every context).

| # | Context | Chrome Beta 156 | Edge Dev 157 | Permissions Policy `language-model` | How it was reached |
|---|---|---|---|---|---|
| 1 | `devtools_page` | function / function / **`unavailable`** | function / function / **`unavailable`** | **false** | DevTools auto-opened for the test tab (`--auto-open-devtools-for-tabs`) |
| 2 | DevTools panel (`chrome.devtools.panels.create`) | function / function / `downloadable` | function / function / `downloadable` | true | `Extensions.extensionServer.onShowPanel` evaluated in the `devtools://devtools/bundled/devtools_app.html` target; the panel is an `iframe` target |
| 3 | Side panel | function / function / `downloadable` | function / function / `downloadable` | true | `chrome.sidePanel.open({windowId})` in a click handler on `tab.html`, triggered by a CDP `Input.dispatchKeyEvent` Enter on the focused button; returned without error in both |
| 4 | Service worker | function / function / `downloadable` | function / function / `downloadable` | n/a (no document) | Starts on load |
| 5 | Offscreen document | function / function / `downloadable` | function / function / `downloadable` | true | `chrome.offscreen.createDocument` from the service worker (reason `DOM_PARSER`) |
| 6 | Content script, isolated world | function / function / `downloadable` | function / function / `downloadable` | true | Test page `http://localhost:<p>/s1-test` served by the runner |
| 7 | Content script, MAIN world | function / function / `downloadable` | function / function / `downloadable` | true | Same test page |
| 8 | Extension page in a tab (control) | function / function / `downloadable` | function / function / `downloadable` | true | `Target.createTarget` on `chrome-extension://<id>/tab.html` |

- `isSecureContext` was true in every window context, including the `localhost` test page **[measured]**.
- No probe threw in any context; there is no error text to record in phase 1 **[measured]**.
- 22 to 27 s after the last probe (Chrome 00:25:24 -> 00:25:46, Edge 00:26:21 -> 00:26:48 UTC) the runner read `LanguageModel.availability()` again by `Runtime.evaluate` in every open target. Every value was unchanged: `unavailable` in `devtools.html`, `downloadable` everywhere else **[measured, `late` and `lateReadAt` in the evidence files]**. The `devtools_page` result does not rest on this reading alone: its Permissions Policy check is false (below).
- Not filled in phase 1: `contextWindow` and the tool round trip. No context reported `available`, because the fresh profiles have no model, and the brief forbids a download there. Phase 2 fills them.

## What this settles

- **The Prompt API, including the tool-use types, is exposed in all eight contexts in both browsers** **[measured]**. `LanguageModelToolCall` being a function everywhere shows `AIPromptAPIToolUse` reaches extension pages, the extension service worker, offscreen documents and both content-script worlds.
- **The DevTools panel, the side panel, the service worker and the offscreen document all get a usable `availability()`** (`downloadable`, the same answer as a normal tab) **[measured]**. The panel works because the DevTools frontend delegates `language-model` to it: `featurePolicy.allowsFeature('language-model')` is true there **[measured]**, which matches the `allow=` list in `ExtensionView.ts` described in 01 section 3.
- **The `devtools_page` is blocked by Permissions Policy**: `LanguageModel` exists, but `allowsFeature('language-model')` is false and `availability()` resolves to `unavailable` without throwing **[measured]**. Cause **[inferred]**: the DevTools frontend creates the hidden `devtools_page` iframe without the `allow=` list it gives panel iframes. Consequence for the design: never host a session in the `devtools_page`; it only registers the panel. This settles the "Unconfirmed" row in 01 section 3.
- **Content scripts get web-page semantics as expected**: same values as the page itself in both worlds **[measured]**. Whether the extension-only legacy parameters differ there was not checked.
- **Edge Dev 157 behaves like Chrome Beta 156 in every context** **[measured]**. This settles 01 section 3's Edge question for exposure; it does not yet show that Aion answers from those contexts (phase 2).

## Findings on the way

- **`Extensions.loadUnpacked` works over `--remote-debugging-port`; the pipe is not needed** **[measured]**. It returned the extension id over the port in Chrome Beta 156 and Edge Dev 157, and over `--remote-debugging-pipe` in Chrome Beta 156 as well. It also loaded the extension **without** `--enable-unsafe-extension-debugging` in both browsers: the id came back and the extension's `sw.js` service-worker target appeared in `/json/list` **[measured, scratch test, fresh profiles on 9343 and 9344]**. The runner still passes the flag. Chromium source at tag `156.0.8078.17` agrees: `chrome/browser/devtools/chrome_devtools_session.cc` creates `ExtensionsHandler` with `allow_loading_extensions = (agent host type == browser)`, and `chrome/browser/devtools/protocol/extensions_handler.cc` checks only that value ("Method not available." otherwise); neither file tests for the pipe or the flag **[measured, source read]**. The protocol definition (`devtools-protocol` `pdl/domains/Extensions.pdl`) states no such condition either **[measured]**. Edge source is closed; Edge behaved the same **[measured]**. Phase 2 can therefore load the extension into the standing instances without relaunching them **[inferred]**.
- `--load-extension` was not needed and not measured.
- The extension id is derived from the unpacked path, so it is `adkapcgoeebpdmbepbdjmbhfknkcllcc` in both browsers for this checkout **[measured]**.
- **A file listed in two content-script entries is injected only once per frame: here into the isolated world, whose entry is listed first.** With `probe.js` listed in both the isolated and the MAIN-world entry, the MAIN world got `cs-main.js` but no `probe.js` globals (`typeof s1Probe === 'undefined'`) **[measured, Chrome Beta 156]**. The runner therefore copies `probe.js` to `probe-main.js` on every run, and the MAIN-world entry lists that copy. For the real extension: give the page agent its own bundle file.
- `Extensions.extensionServer.onShowPanel` opened an extension panel in both branded browsers, not only in Chrome for Testing as the control-angular-devtools skill states **[measured]**. The runner keeps a fallback that clicks the DevTools tab titled `S1`; it was not needed.
- `chrome.sidePanel.open()` accepted a CDP-dispatched Enter key as the user gesture in both browsers, and `sidepanel.html` appeared as a `page` target **[measured]**.

## Not checked yet

- `contextWindow`, `create()` and the tool round trip in each context (phase 2).
- Whether `create()` from the service worker needs user activation when the model is `downloadable` (01 section 3 raises it). Phase 2 runs on instances where the model is already `available`, so it will not answer this either.
- Session lifetime in the service worker (suspension after idle) and in the offscreen document.
