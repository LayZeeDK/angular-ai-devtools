# 01 - Built-in AI APIs (Chrome and Edge) for an AI-assisted Angular DevTools extension

Status: complete for this pass; open items under "Unresolved". Research date: 2026-10-11.

## Key findings

1. Chrome ships `LanguageModel` to extensions (138+) and the web (148+). Structured output (`responseConstraint`) is stable, no flag needed. Tool calling is behind `chrome://flags/#prompt-api-tool-use`; it is open loop only (the app runs every tool), and turning it on also switches the model to v4, the value `#gemma4-for-built-in-ai` sets.
2. Gemma 4 is real in Chrome as a flag-selected model. In Edge the prerelease model is **Aion-1.0-Instruct** (no source for "1.1"); Phi-4-mini is the default. Superseded: Edge Dev 157's manifest names **Aion-1.1-Instruct**, and it is also Edge Dev 157's default model; see `00-browser-probe.md`, "Edge Dev 157 results (Aion), measured" and "Phi-4-mini in Edge Dev 157: every route tried".
3. Extension contexts: Chromium source force-enables `LanguageModel` for extension workers and keeps the extension-only legacy params. The DevTools frontend creates extension panel iframes with `allow="language-model; summarizer; translator; ..."`, so DevTools panels are deliberately given built-in AI. Side panels and offscreen documents are top-level extension Windows. Content scripts get web-page behavior. All of this comes from reading source, not from a test run; see Unresolved item 5. Answered: spike S1 measured the extension contexts (`11-spike-s1-extension-contexts.md`).
4. WebMCP is now `document.modelContext` (not `navigator`), with an origin trial in Chrome 149 and Edge 150. Extensions read tools from content scripts via `getTools()` / `executeTool()`, and Angular ships `provideExperimentalWebMcpTools`.
5. DevTools already uses the on-device Prompt API itself (Console Insights teasers, `BuiltInAi.ts`), which is the closest precedent.

Labels: **[measured]** = read in a primary source (URL given). **[inferred]** = Claude's reasoning, not stated by a source.

## 1. Prompt API (`LanguageModel`) shape

Sources:
- Explainer (spec README): https://github.com/webmachinelearning/prompt-api (read raw README, `main`, fetched 2026-10-11) -- "S1"
- Chrome docs: https://developer.chrome.com/docs/ai/prompt-api ("Last updated: August 26, 2026") -- "C1"

### Status
- [measured, C1] Chrome ships the Prompt API in **extensions since Chrome 138** and on the **web since Chrome 148** (Intent to Ship). The `aiLanguageModelOriginTrial` extension permission is expired; extension developers should remove it.
- [measured, S1] Edge also has an experimental implementation (link to https://learn.microsoft.com/en-us/microsoft-edge/web-platform/prompt-api). Chromium status in S1's stakeholder section still says "prototyping behind a flag" (stale relative to C1).

### Creation and availability
- [measured, S1/C1] `LanguageModel.availability(options)` -> `"unavailable" | "downloadable" | "downloading" | "available"`. Pass the same options you will pass to `create()`/`prompt()` (C1 calls this "critical").
- [measured, S1/C1] `LanguageModel.create(options)`; options include `initialPrompts`, `expectedInputs`, `expectedOutputs`, `tools`, `signal`, `monitor(m)` (fires `downloadprogress` `ProgressEvent`, `loaded` 0..1, at least a 0 and a 1 event even without download), `samplingMode`, `thinking`, legacy `temperature`/`topK`.
- [measured, C1] Triggering the download needs **user activation** (C1 links to /docs/ai/get-started#user-activation).
- [measured, S1] Download failure rejects `create()` with `NetworkError`.

### Sampling parameters
- [measured, S1/C1] New: `samplingMode` enum (`most-predictable` ... `balanced` (default) ... `most-creative`). On the web it is behind an **origin trial** in Chrome 148.
- [measured, S1/C1] Legacy `temperature` / `topK` and `LanguageModel.params()` (returns e.g. `{defaultTopK: 3, maxTopK: 128, defaultTemperature: 1, maxTemperature: 2}`) are **deprecated but still functional only in extension contexts**; ignored on the web. Passing `samplingMode` together with `topK`/`temperature` rejects with `TypeError`. C1: in extensions "must either specify both `topK` and `temperature` or neither".
- Design note [inferred]: an extension is the one context where `temperature: 0`-like determinism is still reachable via raw params; plan to migrate to `samplingMode: "most-predictable"` because S1 says raw params "may be completely removed".

### Prompts, roles, system prompt
- [measured, S1] Messages use `{ role: "system" | "user" | "assistant", content }`. The system prompt must be message 0 of the first sequence sent to `create()` (`initialPrompts`), `append()`, or `prompt()`; anywhere else -> `TypeError`. Too-large `initialPrompts` -> `QuotaExceededError`.
- [measured, S1/C1] `prefix: true` on a trailing assistant message pre-fills the response (other positions -> `SyntaxError`).
- [measured, S1/C1] `session.append(messages)` pre-processes context without generating; can trigger overflow eviction.
- [measured, S1/C1] `session.prompt(input, { signal, responseConstraint, omitResponseConstraintInput, thinking })` returns a string; `session.promptStreaming(...)` returns a `ReadableStream` (async-iterable chunks).

### Multimodal (`expectedInputs` / `expectedOutputs`)
- [measured, C1] `expectedInputs[].type`: `text`, `image`, `audio`. `expectedOutputs[].type`: `text` only (S1 adds `tool-call` for tools, see below). `languages`: Chrome accepts `"en"`, `"ja"`, `"es"`, `"de"`, `"fr"`.
- [measured, C1] Image inputs: `HTMLImageElement`, `SVGImageElement`, `HTMLVideoElement` (current frame), `HTMLCanvasElement`, `ImageBitmap`, `OffscreenCanvas`, `VideoFrame`, `Blob`, `ImageData`. Audio: `AudioBuffer`, `ArrayBufferView`, `ArrayBuffer`, `Blob`.
- [measured, C1] **Audio input requires a GPU** in Chrome.
- [measured, S1] Cross-origin images not CORS-exposed reject with `SecurityError` (tainted canvases included). Assistant-role image/audio -> `NotSupportedError`. Multimodal prompts must use the explicit array-of-messages form.
- Design note [inferred]: a DevTools extension can feed screenshots from `chrome.tabs.captureVisibleTab()` as a `Blob`/`ImageBitmap` (extension-origin data, so no CORS taint). Not verified.

### Structured output
- [measured, S1/C1] `responseConstraint`: a JSON Schema object or a `RegExp`, on `prompt()`/`promptStreaming()`. Result is a string (`JSON.parse` it). Unsupported schema features -> `NotSupportedError`; model cannot comply -> `SyntaxError`; neither schema nor RegExp -> `TypeError`.
- [measured, S1/C1] By default the constraint is injected into the model input and costs context; measure it with `measureContextUsage(input, { responseConstraint })`. `omitResponseConstraintInput: true` skips that injection (then describe the format in the prompt). `omitResponseConstraintInput` without `responseConstraint` -> `TypeError`.
- [measured, C1] Chrome's page links a dedicated guide: https://developer.chrome.com/docs/ai/structured-output-for-prompt-api (not read here).

### Tool calling (`tools`)
- [measured, S1] Declared at `create()`: `tools: [{ name, description, inputSchema }]`, `inputSchema` a JSON Schema with `type: "object"`. When `tools` is given, `expectedOutputs` must include `{ type: "tool-call" }` and `expectedInputs` must include `{ type: "tool-response" }` (plus `{ type: "tool-call" }` in inputs if you seed history with assistant tool calls).
- [measured, S1] **Open loop only. The browser does NOT run the tool loop.** `prompt()` resolves to an array of `{ type: "text" | "tool-call", value }`; each `LanguageModelToolCall` has `callId`, `name`, `arguments`. The app executes the tool and sends `new LanguageModelToolSuccess({ callId, name, result: [{ type: "text"|"image"|"audio"|"object", value }] })` or `new LanguageModelToolError({ callId, name, errorMessage })` as a `role: "user"` `tool-response` content item. Superseded: in the browsers the member is spelled **`callID`**; `callId` throws "Required member is undefined" (`00-browser-probe.md`, "Edge Dev 157 results (Aion), measured"). A `tool-response` must immediately follow the `tool-call`.
- [measured, S1] Closed loop (an `execute` callback per tool, the user agent loops inside one `prompt()`) is explicitly "a planned future extension and is not yet part of the specification or implemented in browsers".
- [measured, S1] The model may emit several tool calls at once (parallel calls).
- [measured, C1] The Chrome Prompt API page (Aug 2026) does **not** document `tools` at all. Tool calling in Chrome is therefore only confirmed by the explainer; Lars's statement that a flag enables it is consistent with that but not confirmed by a Chrome page. See section 2.
- Design note [inferred]: open loop suits a DevTools agent, since the extension must gate each tool (e.g. reading component state through the content script) and can trim tool results before they eat the context window. S1 lists exactly these reasons for keeping open loop.

### Thinking mode
- [measured, S1] `thinking: { effort: "none" | "low" | "medium" | "high", includeThoughts }`, at `create()` and per `prompt()`; check with `availability({ thinking })`. Thoughts are stripped from history after each turn. Not mentioned on C1 -> [inferred] not shipped in Chrome stable; may depend on the model (Gemma-class models do reasoning; Nano availability unknown).

### Clone, destroy, abort
- [measured, S1/C1] `session.clone({ signal })` forks a session with its context (cheap way to reuse a long system prompt).
- [measured, S1/C1] `session.destroy()` or aborting the `create()` signal: rejects pending `prompt()` and errors streams with `AbortError`, lets the browser unload the model.
- [measured, S1] Per-call `signal`: a queued prompt is dropped; an in-flight prompt is aborted and its prompt/response pair removed from the session; a finished prompt is unaffected. Same rules for `append()`.

### Context window / quota
- [measured, S1] Renamed: `inputUsage` -> `contextUsage`, `inputQuota` -> `contextWindow`, `measureInputUsage()` -> `measureContextUsage()`, `onquotaoverflow` -> `oncontextoverflow`. **Old names are removed on the web and deprecated in extensions** ("will be removed from extension contexts in a future release"). Use the new names.
- [measured, S1/C1] On overflow the oldest prompt/response pairs are evicted (system prompt / `initialPrompts` never) and `contextoverflow` fires. If eviction cannot make room -> `QuotaExceededError` with `requested` and `contextWindow`; nothing removed.
- [measured, S1] `measureContextUsage` counts control tokens, accepts multimodal arrays and an abort `signal`.

### Contexts
- [measured, S1/C1] Available to top-level windows and same-origin iframes; cross-origin iframes need `allow="language-model"`. **Not available in web workers.** S1: "a browser could expose them to extension service workers" (outside web specs). See section 3.

## 2. Models behind the Prompt API, flags, hardware

Sources:
- Chromium `main` source, fetched 2026-10-11 from chromium.googlesource.com (`refs/heads/main`; exact commit not captured because the log endpoint returned 403):
  - https://chromium.googlesource.com/chromium/src/+/refs/heads/main/chrome/browser/flag_descriptions.h -- "F1"
  - https://chromium.googlesource.com/chromium/src/+/refs/heads/main/chrome/browser/about_flags.cc -- "F2"
  - https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/platform/runtime_enabled_features.json5 -- "R1"
- Edge docs: https://learn.microsoft.com/en-us/microsoft-edge/web-platform/prompt-api (updated_at 2026-10-06) -- "E1"
- Edge blog 2026-06-02: https://blogs.windows.com/msedgedev/2026/06/02/expanding-on-device-ai-in-microsoft-edge-new-models-and-apis-for-the-web/ -- "E2"

### Chrome
- [measured, C1] Default model: **Gemini Nano** ("The Prompt API uses the Gemini Nano model in Chrome"). C1 gives no Nano version number; current size is shown at `chrome://on-device-internals`.
- [measured, F1/F2] **Gemma 4 is real and flag-gated**: `chrome://flags/#gemma4-for-built-in-ai` ("Gemma 4 for Built-in AI": "Enables all built-in AI APIs (Prompt, Summarizer, Writer, etc.) to use the Gemma 4 model"). It enables features `OptimizationGuideManifestBroker,AIApiFoundationalModel:model_version/v4`.
- [measured, F1/F2] **Tool calling flag**: `chrome://flags/#prompt-api-tool-use` ("Prompt API Tool Use": "Extends the Prompt API with tool use (function calling) capabilities"). Enabling it turns on `AIPromptAPIToolUse,OnDeviceModelConversationBackend,AIApiFoundationalModel:model_version/v4`, i.e. **tool use switches the foundational model to v4 (the same value the Gemma 4 flag sets)**. [inferred] Tool calling in Chrome therefore runs on Gemma 4, not Gemini Nano. Narrowed: with `--enable-features=AIPromptAPIToolUse` alone, Nano gets tool sessions but answered in text, with no tool call (`05-spikes.md`, "Prediction confirmed: Nano gets tool sessions with `AIPromptAPIToolUse` alone").
- [measured, R1] `AIPromptAPIToolUse` runtime status is `experimental` on Win/Mac/Linux/ChromeOS (not stable, no origin trial).
- [measured, R1] **Structured output is stable**: `AIPromptAPIStructuredOutput` status `stable`. No flag needed for `responseConstraint`. Lars's premise that a flag enables structured output is therefore unnecessary in Chrome [measured for Chrome main; inferred for whatever stable version Lars runs].
- [measured, R1] `AIPromptAPI` stable on Win/Mac/Linux/ChromeOS; `AIPromptAPIMultimodalInput` stable on the same; `AIPromptAPIParams` (`samplingMode`) experimental + origin trial `AIPromptAPIParams`.
- [measured, F1/F2] Other relevant Chrome flags: `#prompt-api` (Prompt API), `#prompt-api-multimodal-input`, `#prompt-api-sampling-mode`, `#on-device-model-speculative-decoding` ("Also enables requisite Gemma 4 and Sampling Mode features"; greedy sampling sessions get speculative decoding), `#decisions-api` (new `DecisionModel` API, runs Gemma 4 on CPU and "switches the other built-in AI APIs to Gemma 4 on the CPU"), `#semantic-embedder-api`, `#writer-api`, `#rewriter-api`, `#proofreader-api`, `#summarizer-api`, `#summarizer-api-performance-preference`, `#enable-webmcp-testing`.
- [unresolved] The older `#optimization-guide-on-device-model` / `#prompt-api-for-gemini-nano` flag names cited by third-party tutorials do not appear in current F2 (searched `about_flags.cc` for `on-device-model` / `OnDeviceModel`; only speculative decoding matched). They have likely been retired or moved; not confirmed.
- [unresolved] Gemma 4 variant/size (E2B? E4B?) and its context window are not stated in F1/F2. A single non-Google news item claims a ~4 GB Gemma 4 download; not verified (page was paywalled).

Hardware (Chrome) [measured, C1]: Windows 10/11, macOS 13+, Linux, ChromeOS Platform 16389.0.0+ on Chromebook Plus. No Android/iOS. >= 22 GB free on the profile volume (model removed if free space drops below 10 GB). GPU with strictly more than 4 GB VRAM **or** CPU with >= 16 GB RAM and >= 4 cores. Audio input requires a GPU. Unmetered network for the first download. Translator and Language Detector work on desktop only.
- [inferred] Lars's Snapdragon X Elite (Windows on ARM64) box: C1 does not list architecture restrictions; CPU path needs 16 GB RAM. Whether Chrome's on-device runtime has an ARM64 Windows GPU/NPU backend is not stated. Check `chrome://on-device-internals` on the machine.

### Edge
- [measured, E1] Prompt API is a **developer preview in Edge Canary and Dev** from 138.0.3309.2, flag `edge://flags` -> "Prompt API for on-device language model". Optional "Enable on device AI model debug logs".
- [measured, E1] Default model **Phi-4-mini** (4B params per E2). Hardware: Windows 10/11 or macOS 13.3+, >= 20 GB free (deleted under 10 GB), **GPU with >= 5.5 GB VRAM**, unmetered network. `edge://on-device-internals` shows "Device performance class"; High or above needed for Phi-4-mini.
- [measured, E1/E2] **The model is "Aion-1.0-Instruct", not "Aion-1.1-Instruct".** Prerelease, Edge Canary/Dev 150.0.4070+, flag "Enable prerelease on-device language model"; when enabled it replaces Phi-4-mini as the default. Smaller and faster, runs on weaker GPUs or CPU only (Medium/Low performance class). E1 says it was "expected to be made available as an open source model in July 2026". Verify with `edge://on-device-internals` -> Model Status -> Model Name. Superseded: Edge Dev 157's manifest names `Aion-1.1-Instruct` (`00-browser-probe.md`, "Edge Dev 157 results (Aion), measured").
- [unresolved] No source found for "Aion-1.1-Instruct" (web search, E1 updated 2026-10-06, E2). Superseded: Edge Dev 157 ships `Aion-1.1-Instruct`, a newer build than the docs describe (`00-browser-probe.md`, "Edge Dev 157 results (Aion), measured").
- [measured, E1] Edge docs cover `responseConstraint` (JSON Schema or regex). **E1 does not mention tool calling** (searched "tool"). [unresolved] Whether Edge's runtime implements `tools` / `AIPromptAPIToolUse` with Phi-4-mini or Aion. [inferred] Edge inherits the Blink IDL and the `AIPromptAPIToolUse` runtime feature from Chromium, so the JS surface may exist behind `--enable-features`, but whether Edge's model backend honors it is unknown. Answered: tool calling works on Aion in Edge Dev 157 (`00-browser-probe.md`, "Edge Dev 157 results (Aion), measured") and was benchmarked on Phi-4-mini in Edge stable 155 (`05-spikes.md`, "Four-model benchmark, second round").
- Lars's statement "Gemma 4 and Aion-1.1-Instruct" is thus: Gemma 4 -> confirmed in Chrome as a flag; Aion -> confirmed as **1.0**, not 1.1. Superseded: Lars's "Aion-1.1-Instruct" is correct for Edge Dev 157 (`00-browser-probe.md`, "Edge Dev 157 results (Aion), measured").

## 3. Extension availability (riskiest unknown)

Most direct source: Chromium's renderer client, which sets which AI APIs exist in extension processes:
https://chromium.googlesource.com/chromium/src/+/refs/heads/main/chrome/renderer/chrome_content_renderer_client.cc (`SetRuntimeFeaturesDefaultsBeforeBlinkInitialization`) -- "X1". Also the Blink IDLs in https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/modules/ai/ -- "I1".

[measured, X1] Inside `if (IsStandaloneContentExtensionProcess())` Chrome enables:
`EnableAIPromptAPIForWorkers`, `EnableAIPromptAPILegacyIdentifiers`, `EnableAIPromptAPILegacyParams`, `EnableAIRewriterAPIForWorkers`, `EnableAISummarizationAPIForWorkers`, `EnableAIWriterAPIForWorkers`, `EnableLanguageDetectionAPIForWorkers`, `EnableTranslationAPIForWorkers`.
[measured, I1] `language_model.idl`: `Exposed(Window AIPromptAPI, Worker AIPromptAPIForWorkers)`, `SecureContext`. Tool types (`LanguageModelToolCall` etc.) use the same exposure plus `RuntimeEnabled=AIPromptAPIToolUse`.

Per context (Chrome):

| Context | `LanguageModel`? | Evidence |
|---|---|---|
| DevTools panel / sidebar pages (`chrome.devtools.panels.create`) | Yes [measured, policy delegation; not run] | A panel is a cross-origin `chrome-extension://` iframe inside the `devtools://` frontend, so Permissions Policy would block it by default. The DevTools frontend delegates explicitly: https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/panels/common/ExtensionView.ts creates the panel iframe with `allow="language-model; summarizer; translator; language-detector; writer; rewriter; proofreader; clipboard-write; autoplay"`. So the DevTools team made built-in AI deliberately available to extension panels. |
| `devtools_page` (hidden background page of the DevTools extension) | Unconfirmed [inferred] | Also an iframe in the DevTools frontend; whether it gets the same `allow` list was not checked. Use the panel instead. |
| Side panel | Yes [measured] | Google's own sample `ai.gemini-on-device` uses `side_panel` + `minimum_chrome_version: "138"`: https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/ai.gemini-on-device |
| Extension service worker | Yes [measured, X1/I1] | `AIPromptAPIForWorkers` is force-enabled only in extension processes; web workers do not get it (C1: "isn't available in Web Workers"). S1 anticipates this ("a browser could expose them to extension service workers"). |
| Offscreen document | Yes [inferred] | A Window document in the extension process; same as side panel. |
| Content script | Probably yes, with web-page semantics [inferred] | Content scripts share the page's `Window` in the page's renderer, which is not an extension process, so X1's extension extras (legacy `temperature`/`topK`, `params()`, old identifiers) do not apply; Chrome 148+ web exposure and the page's Permissions Policy (`language-model`) would govern. Not tested. |
| Inspected page via `chrome.devtools.inspectedWindow.eval` | Page context [inferred] | Runs as page script; same as web. Not a good place to host the model session. |

- [measured, C1] Extensions: Prompt API stable since Chrome 138; the old `aiLanguageModelOriginTrial` permission is expired, no manifest permission is needed.
- [measured, getstarted https://developer.chrome.com/docs/ai/get-started] "All of these APIs can be used when building Chrome Extensions"; APIs still in an origin trial require registering the extension for that trial (https://developer.chrome.com/docs/extensions/how-to/web-platform/origin-trials).
- [measured, getstarted] When `availability()` is `downloadable`/`downloading`, `create()` needs **user activation** (`navigator.userActivation.isActive`). [inferred] A service worker has no user activation, so do the first-time download from a UI page (DevTools panel click) and only then use the model from the worker. Unverified whether Chrome exempts extension workers.
- [measured, getstarted] Precedent: the "Web AI Studio" extension "adds a dedicated panel to Chrome DevTools, making it easy to track models and inspect APIs" (https://web-ai.studio/extension). It shows a DevTools-panel extension built around these APIs ships; it does not prove the panel itself calls `LanguageModel`.
- [measured, X1] Proofreader, Semantic Embedder and Decision Model are **not** in the extension worker list. Proofreader's IDL is `Exposed=(Window,Worker)` behind `AIProofreadingAPI` (experimental/OT).
- Tool use in extensions [inferred]: tool types are gated only by `AIPromptAPIToolUse` (flag/experimental), with the same Window/Worker exposure, so with `#prompt-api-tool-use` enabled they should exist in panels and the extension service worker.

Edge:
- [measured, E1] "allows you to prompt a small language model (SLM) that is built into Microsoft Edge, from your website's or browser extension's JavaScript code". No per-context table.
- [inferred] Edge builds on the same `chrome/renderer` code, so X1's extension-process enablement most likely applies too. Not confirmed from Edge sources (closed). Worth one spike: load an unpacked extension in Edge Canary and log `typeof LanguageModel` in panel, service worker, offscreen and content script.

Recommendation [inferred]: host the session in the DevTools panel page (permission delegated by `ExtensionView.ts`, receives the user's clicks for activation, lives as long as DevTools is open) with an offscreen document as the fallback; avoid the MV3 service worker as the session owner, because it is suspended after ~30 s idle and would lose the session's context.

## 4. Other built-in AI APIs

Sources: Chrome table https://developer.chrome.com/docs/ai/built-in-apis ("C2", body last updated 2025-09-12, so partly stale); R1 and X1 (Chromium `main`, current); Edge docs https://learn.microsoft.com/en-us/microsoft-edge/web-platform/writing-assistance-apis ("E3"), .../proofreader-api ("E4"), .../languagedetector-api, .../translator-api; E2.

| API | Chrome status | Chrome extension service worker (X1) | Edge status |
|---|---|---|---|
| Summarizer (`Summarizer`) | Stable since 138 (C2); `AISummarizationAPI` stable (R1). `preference: "capability"|"speed"|"auto"` option behind `#summarizer-api-performance-preference` (F1) | Yes | Enabled by default since 138.0.3309.2 in Canary/Dev (E3); Phi-4-mini, or Aion-1.0-Instruct with the prerelease flag |
| Writer (`Writer`) | Experimental + origin trial `AIWriterAPI` (R1); C2 says developer trial / OT | Yes | Developer preview, Canary/Dev 138.0.3309.2+, flag "Writer API for on-device language model" (E3) |
| Rewriter (`Rewriter`) | Experimental + origin trial `AIRewriterAPI` (R1) | Yes | Developer preview, flag "Rewriter API for on-device language model" (E3) |
| Proofreader (`Proofreader`) | Experimental + origin trial `AIProofreaderAPI` (R1); "built-in small expert model" (F1) | **No** (not in X1 list) | Developer preview, Canary/Dev 142+, Phi-4-mini (E4) |
| Translator (`Translator`) | Stable since 138, desktop only (C2, R1) | Yes | Shipped in **Edge 148**, task-specific model, 145+ languages (E2) |
| Language Detector (`LanguageDetector`) | Stable since 138, desktop only (C2, R1) | Yes | Shipped in Edge 148 (E2) |
| Semantic Embedder (`SemanticEmbedder`) | New. `AIEmbeddingsAPI` status `test` (R1), flag `#semantic-embedder-api` (F1/F2) | Not forced by X1, but the flag itself enables `AIEmbeddingsAPI,AIEmbeddingsAPIForWorkers` (F2), so with the flag on it should be in workers [inferred] | No source found |
| Decisions API (`DecisionModel`) | New. `AIDecisionModelAPI` experimental, flag `#decisions-api`; "verification, classification, and decisions regarding unstructured data, over a developer-defined schema", runs Gemma 4 on CPU (F1). Explainer: https://github.com/explainers-by-googlers/decisions-api | No | No source found |
| Web Speech on-device | `#web-speech-on-device-small-expert-model` (F1) | n/a | Experimental on-device recognition, `processLocally = true`, Canary/Dev (E2) |

- [measured, every Edge page above] Each Edge page says the API is usable "from your website's or browser extension's JavaScript code".
- [measured, getstarted] Chrome: "All of these APIs can be used when building Chrome Extensions"; origin-trial APIs need the extension registered for the trial.
- [inferred] For this design, Summarizer could condense long component trees/logs before they go into a Prompt API session, and Semantic Embedder could later rank components or docs by relevance, but it is `test` status (needs a flag) and not in extension workers.
- [inferred] Writer/Rewriter/Proofreader add little for a DevTools assistant; skip them.

## 5. WebMCP (`navigator.modelContext`)

Sources: explainer https://github.com/webmachinelearning/webmcp (README on `main`, fetched 2026-10-11) -- "W1"; https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md -- "W2"; Chrome docs https://developer.chrome.com/docs/ai/webmcp (last updated 2026-10-07) -- "W3"; Angular https://angular.dev/ai/webmcp -- "W4"; Google sample extension https://github.com/GoogleChromeLabs/webmcp-extension -- "W5".

- [measured, W1] **The entry point is now `document.modelContext`, not `navigator.modelContext`.** The explainer uses `document.modelContext` throughout; `navigator.modelContext` does not appear in it.
- [measured, W1] Page API: `document.modelContext.registerTool({ name, description, inputSchema, execute }, { signal, exposedTo })`; unregister by aborting the signal. Tool result shape `{ content: [{ type: "text", text }] }` (MCP-like).
- [measured, W1] **Agent-side API (what an extension needs):** `document.modelContext.getTools({ fromOrigins })` -> array of `{ name, description, inputSchema, origin, window }`; `document.modelContext.executeTool(tool, args, { signal })` runs the tool in the owner's context; `toolchange` event when tools are added/removed.
- [measured, W1] Gated by Permissions Policy `tools` (default `self`); cross-origin iframes need `allow="tools"` plus `exposedTo`. A declarative `<form>`-based API is being explored (W3 already documents a Declarative API page).
- [measured, W2/W3] Status: Chrome **origin trial from Chrome 149**, local dev via `chrome://flags/#enable-webmcp-testing` (also F2: `"enable-webmcp-testing"`, `kOsAll`). R1: `WebMCP` runtime feature `experimental` with an origin trial. **Edge: origin trial live in Edge 150** (W2). Firefox and Safari: standards-position issues only. Brave (Leo) and ChatGPT Desktop listed as agent consumers.
- [measured, W3] "Chrome Extensions can query and execute WebMCP tools with content scripts." W3 also points at a DevTools pane for debugging WebMCP tools: https://developer.chrome.com/docs/devtools/application/webmcp (not read).
- [measured, W5] Google's "Example Agentic Chrome Extension" content script reads `document.modelContext.getTools()` and listens for `toolchange`, including in same-origin and cross-origin iframes (`fromOrigins`). It sends prompts to a cloud model (`gemini-3.6-flash` per W3), not the built-in model.
- [measured, W4] **Angular has experimental WebMCP support**: `provideExperimentalWebMcpTools([...])` from `@angular/core` registers tools for the app lifetime; `execute` runs in the injection context (so it can `inject()` services); Signal Forms can be turned into tools. Marked experimental, may change outside majors.
- How the extension would read page tools [inferred, follows W3/W5]: content script calls `document.modelContext.getTools()` / `executeTool()`, relays tool descriptors to the DevTools panel over `chrome.runtime` messaging, and the panel maps them 1:1 into `LanguageModel` `tools` declarations (both use `name` / `description` / JSON Schema `inputSchema`). On a `tool-call` from the model, the panel asks the content script to `executeTool()`, then returns a `LanguageModelToolSuccess`. Requires the page to be in the WebMCP origin trial or the flag on.
- Design note [inferred]: an Angular app using `provideExperimentalWebMcpTools` would already publish tools this extension could consume, which is a natural bridge between "Angular app" and "AI DevTools".

## 6. Chrome DevTools "AI assistance" (precedent)

Sources: https://developer.chrome.com/docs/devtools/ai-assistance ("D1"); DevTools frontend source https://github.com/ChromeDevTools/devtools-frontend/tree/main/front_end/models/ai_assistance ("D2", README, `agents/`, `tools/`, `skills/`, `BuiltInAi.ts`, fetched 2026-10-11).

- [measured, D1] Gemini-in-DevTools covers **styling, network, sources, performance**. It is cloud Gemini: needs sign-in, age 18+, supported locations, opt-in under Settings > AI innovations, Google ToS; enterprise policy controls logging.
- [measured, D2 `agents/`] V1 agents: `StylingAgent`, `NetworkAgent`, `FileAgent` (sources), `PerformanceAgent`, `AccessibilityAgent`, `StorageAgent`, plus `ContextSelectionAgent`.
- [measured, D2 README] Migration under way to **AiAgent2**: one agent that loads Markdown **skills** on demand via a `learnSkills` tool (`skills/`: accessibility, lighthouse, network, performance, sources, storage, styling) and calls typed **tools** (`tools/`: e.g. `ExecuteJavaScript`, `GetStyles`, `ListNetworkRequests`, `GetNetworkRequestDetails`, `ListSources`, `GetSourceContent`, `GetDetailedCallTree`, `GetInsightDetails`, `RecordPerformanceTrace`, `RunLighthouse`, `GetLighthouseAudits`, `ListCookies`, `GetStorageValues`, `GetElementAccessibilityDetails`, `ResolveDevtoolsNodePath`, ...). Tools declare narrow capability interfaces (`PageExecutionCapability`, `StyleMutationCapability`, `OriginLockCapability`).
- [measured, D2 README] Context gathering: each conversation has a `ConversationContext` (a DOM node, a network request, a trace focus, a file) with `getOrigin()`, `getPromptDetails()` (Markdown for the prompt) and `getUserFacingDetails()` (shown under "Analyzing data"). Formatters turn objects into text.
- [measured, D2 README] Security: conversation is **origin-locked**; switching to a different origin forces a new conversation; opaque origins blocked; per-file origins for `file://`; virtual origins for imported traces/HARs; CORS-opaque response bodies redacted; `clearCache()` on error, abort or cross-origin navigation.
- [measured, D2 `agents/AiAgent.ts`] Loop: up to `MAX_STEPS = 20` model requests per query; tools that need approval emit a `SIDE_EFFECT` event and wait for the user's `confirm()`.
- [measured, D2 `agents/ExecuteJavascript.ts`] Page JS runs in a dedicated isolated world (`Page.createIsolatedWorld` with its own CSP) and first with `throwOnSideEffect: true`; if it would cause a side effect, the user must approve before re-running without that guard.
- [measured, D2 `BuiltInAi.ts`] **DevTools itself already uses the built-in Prompt API** for Console Insights "teasers": `window.LanguageModel.availability/create` with `expectedInputs/Outputs` `en` text, a system prompt capping answers at 200 characters, `clone()` per answer ("Otherwise previous dialog would pollute the context"), `promptStreaming` with an `AbortController`, `destroy()` after. It skips the feature without a real GPU (WebGL renderer not SwiftShader) unless `allowWithoutGpu`. This is the closest direct precedent for an on-device DevTools feature.
- Takeaways for the extension [inferred]: copy the context-object pattern (one selected Angular component = one context with an origin), the origin lock, side-effect-free reads by default with explicit approval for writes, and the clone-per-question pattern for short one-shot explanations. The cloud agents' 20-step loops will not fit a ~small on-device context window; plan for 1 to 3 tool rounds.

## 7. Practical limits

- Context window:
  - [unresolved/secondary] Gemini Nano: a third-party write-up (https://www.swyx.io/gemini-nano) reports `inputQuota` 6144 tokens on Chrome 137/138. No Google page states a number. Read `session.contextWindow` at runtime.
  - [measured, https://ai.google.dev/gemma/docs/core] Gemma 4 comes in E2B, E4B, 12B, 31B, 26B A4B. "Small models feature a 128K context window, while the medium models support 256K." Weight memory: E2B 2.9 GB at 8-bit / 1.1 GB at 4-bit; E4B 4.5 GB / 2.5 GB; KV cache for the context comes on top. All Gemma 4 models ship a draft model for speculative decoding (which matches Chrome's `#on-device-model-speculative-decoding`). [unresolved] Which variant Chrome ships and what `contextWindow` Chrome exposes (Chrome may cap it well below 128K for memory). Answered: `gemma4-2b-it`, `contextWindow` 9216 (`00-browser-probe.md`, "Correction: Gemma 4 is the Prompt API model in Chrome Beta").
  - [inferred, from recall, not read this session] Phi-4-mini's model card lists 128K context; Edge's exposed `contextWindow` is not documented. Measure.
  - [measured, S1] Structured-output schemas and (inferred) tool declarations consume context unless `omitResponseConstraintInput` is set; tool declarations have no omit option.
- First-run download [measured, C1/E1]: model downloads on first use per browser (shared across origins), needs unmetered network, 22 GB (Chrome) / 20 GB (Edge) free, deleted under 10 GB free; `create()` needs user activation while `downloadable`. Download size: C1 says check `chrome://on-device-internals`; an unverified news item claims ~4 GB for Gemma 4 [unresolved].
- Hardware gates [measured, C1/E1]: Chrome GPU > 4 GB VRAM or CPU 16 GB RAM / 4 cores; Edge Phi-4-mini GPU >= 5.5 GB VRAM; Aion-1.0 runs on CPU.
- Latency [unresolved]: no primary source gives tokens/second. [inferred] Expect seconds per answer and slower first-token on CPU; Chrome's `#on-device-model-speculative-decoding` (F1) exists to speed up greedy sessions, which suggests latency is a known pain point. DevTools caps its own on-device answers at 200 characters (D2), another hint.
- What fits in a prompt [inferred] (Superseded sizing: the measured windows are 9216 in Chrome Beta and 7168 for Aion, `00-browser-probe.md`; the 6K figure below is the third-party number): at ~6K tokens (if Nano), roughly 20 KB of text total, shared by system prompt, tool declarations, history and output. A whole Angular component tree, change-detection profile or source file will not fit; send one selected component's inputs/outputs/state summary, use tools to fetch more on demand, Summarizer to condense, and `measureContextUsage()` before every prompt. With Gemma 4 the budget may be much larger; design for the small case and scale up from `contextWindow`.
- Session lifetime [measured, S1/C1]: system prompt / `initialPrompts` never evicted; older turns evicted on overflow (`contextoverflow`). [inferred] Keep one long-lived base session with the system prompt and tool declarations and `clone()` per question.

## Unresolved

1. Exact Gemini Nano version and `contextWindow` in Chrome stable today. Tried: C1, C2, get-started, session-management pages, web search. Next: read `session.contextWindow` in a spike. Answered: `contextWindow` is 9216 in Chrome Beta 156 (`00-browser-probe.md`, "Chrome Beta 156, measured"); the Chrome Beta Nano instance (v3Nano 2025.8.21.1028) also reports 9,216 (`05-spikes.md`, "Four-model benchmark, second round"). Chrome stable's value was not read.
2. Gemma 4 variant (E2B vs E4B), download size and `contextWindow` in Chrome. Tried: F1/F2 (names only), web search (one paywalled news item). Next: `chrome://on-device-internals` with `#gemma4-for-built-in-ai` on. Answered: `gemma4-2b-it` (2.4 GB, "low tier"), `contextWindow` 9216 (`00-browser-probe.md`, "Correction: Gemma 4 is the Prompt API model in Chrome Beta").
3. "Aion-1.1-Instruct": no source found. Edge docs (updated 2026-10-06) and the 2026-06-02 blog say Aion-1.0-Instruct. Next: check `edge://on-device-internals` Model Name on Lars's Edge Canary. Answered: Edge Dev 157's manifest names `Aion-1.1-Instruct`, `contextWindow` 7168 (`00-browser-probe.md`, "Edge Dev 157 results (Aion), measured").
4. Tool calling in Edge: Edge Prompt API docs never mention `tools`. Next: spike `LanguageModel.create({ tools: [...] })` in Edge Canary with the prerelease model flag, and look for an Edge flag named like "Prompt API Tool Use". Answered: tool calling works on Aion in Edge Dev 157 (`00-browser-probe.md`, "Edge Dev 157 results (Aion), measured").
5. Extension-context access to `LanguageModel` is read from source (X1/I1 and the DevTools `ExtensionView.ts` `allow` list), not confirmed by a doc or a run. Content scripts and `devtools_page` are still inferred, and Edge ships its own DevTools frontend build, so whether Edge keeps the same `allow` list is unchecked. This is the riskiest item; a 30-minute spike extension that logs `typeof LanguageModel` and `await LanguageModel.availability()` from devtools_page, panel, side panel, offscreen document, service worker and content script in both Chrome and Edge settles it. Answered: spike S1 ran it (`11-spike-s1-extension-contexts.md`).
6. Whether user activation in a DevTools panel iframe satisfies `create()` during first download. Inferred yes, untested.
7. Latency numbers: none from primary sources.
8. Old flag names `#optimization-guide-on-device-model` / `#prompt-api-for-gemini-nano` not found in current `about_flags.cc`; current flag list in section 2 comes from Chromium `main`, which may be ahead of Lars's installed Chrome.
