# Built-in AI probe in Lars's Chrome (2026-10-11)

All results below are **measured**. The probe ran in a normal page tab (`https://example.com`) through playwright-cli attached to Lars's Chrome. It did NOT run in an extension context, so this is page context only.

Browser: Chrome/154.0.0.0, Windows 11 arm64 (Snapdragon X Elite). Flags were as Lars left them; Claude did not change any.

## Availability (`<API>.availability()`)

| API | Result |
|---|---|
| `LanguageModel` (Prompt API) | `available` |
| `Summarizer` | `available` |
| `Writer` | `available` |
| `Rewriter` | `available` |
| `Proofreader` | not defined in page |
| `Translator` (en -> da) | `downloadable` |
| `LanguageDetector` | `available` |
| `navigator.modelContext` (WebMCP) | not defined in page |
| `LanguageModel.params()` | not present (returned null) |

## Session shape

- Session prototype members: `contextUsage`, `contextWindow`, `oncontextoverflow`, `append`, `clone`, `destroy`, `measureContextUsage`, `prompt`, `promptStreaming`. The quota properties are named `contextWindow` / `contextUsage` / `measureContextUsage` in this build (the older explainer names were `inputQuota` / `inputUsage` / `measureInputUsage`).
- `contextWindow` = **9216 tokens**. A one-line system prompt used 9 tokens.
- `LanguageModel.create()` took 21,288 ms on the first (cold) call and 373 ms on the second call.

## Structured output

`prompt(..., { responseConstraint: <JSON Schema> })` returned valid JSON matching the schema (`{"hook":"ngOnInit"}`). **Works.**

## Tool calling

`LanguageModel.create({ tools: [{ name, description, inputSchema, execute }] })` was accepted without error, but the browser **never called `execute`** in either of two attempts:

1. No system prompt: the model asked for a URL and described manual steps (29 s).
2. A system prompt saying the model must call tools: the model printed a fenced `tool_code` block with invented JavaScript (`angular.Components()`) as plain text (2.3 s).

Conclusion: in this browser and flag state, native tool execution is not active. A design that depends on native tool calling must also work through a fallback loop built on structured output (the model returns `{ "tool": ..., "args": ... }` or `{ "answer": ... }` under a `responseConstraint`, and the extension runs the tool and appends the result).

## Flag state (measured 2026-10-11)

Source of "available": flag names and descriptions read from the installed binaries with `rg -a`. Source of "enabled": `browser.enabled_labs_experiments` in each channel's `User Data\Local State`.

| Browser (version in Local State / installed) | Enabled now | Relevant flags available but NOT enabled |
|---|---|---|
| Chrome stable (154.0.8037.98 / same) | `prompt-api@2`, `prompt-api-multimodal-input@1`, `writer-api@1`, `rewriter-api@1` | `prompt-api-tool-use` ("Extends the Prompt API with tool use (function calling) capabilities"), `gemma4-for-built-in-ai` ("Enables all built-in AI APIs ... to use the Gemma 4 model"), `webmcp-testing` ("Enables the WebMCP API"), `webmcp-support` ("Enables WebMCP support in DevTools") |
| Chrome Beta (156.0.8078.17) | `prompt-api@1`, `prompt-api-multimodal-input@1`, `summarizer-api@1`, `writer-api@1`, `rewriter-api@1` | same set as stable (no `webmcp-support` string found in Beta) |
| Edge stable (154.0.4258.62 running / 155.0.4283.45 installed, restart pending) | `edge-llm-prompt-api-for-phi-mini@1`, `edge-llm-summarization-api-for-phi-mini@1`, `edge-llm-writer-api-for-phi-mini@1`, `edge-llm-rewriter-api-for-phi-mini@1` | `edge-llm-prompt-api-tool-use` ("Enables Prompt API tool use ... in Microsoft Edge"), `gemma4-for-built-in-ai` ("Enables all built-in AI APIs ... with the Gemma 4 model"), `edge-llm-on-device-model-prerelease`, `edge-llm-on-device-model-prerelease-tool-use-workaround` ("Enables the Prompt API tool-use workaround for the prerelease on device AI model"), `webmcp-testing` |
| Edge Dev (157.0.4322.0) | `edge-llm-on-device-model-prerelease@1` | `edge-llm-prompt-api-for-default` (renamed from `-for-phi-mini`), `edge-llm-prompt-api-tool-use`, `edge-llm-on-device-model-prerelease-tool-use-workaround` (described in this build as "the Prompt API tool-use workaround for the on-device Aion model family"), `gemma4-for-built-in-ai`, `webmcp-testing` |
| Edge Canary (151.0.4086.0 in Local State) | `edge-llm-prompt-api-for-phi-mini@1`, `edge-llm-on-device-model-prerelease@1`, perf/debug flags | not checked |

Model strings: the Edge 155 and 157 binaries both contain `Aion-1.0-Instruct` and `Aion-1.1-Instruct`. **Inferred:** the "prerelease on-device model" flag selects Aion, because Edge Dev's text for the same workaround flag names "the on-device Aion model family". The Chrome 154 binary contains no "Aion" string.

The probe result above (tools accepted but never executed) fits these flags: `prompt-api-tool-use` is off in Chrome stable, so the tool-calling probe ran without that feature.

Not changed: both stable browsers were running (Chrome 23 processes, Edge 20), so editing `Local State` would be overwritten on exit, and the automation extension cannot open `chrome://flags`. This needs Lars to restart the browsers.

## Flags enabled by Claude (2026-10-11)

Lars asked: "you must confirm that they are enabled, enable them if you can, or escalate to me if you can't", and then: "A Chrome Beta or Edge Dev prerequisite is also acceptable."

Chrome Beta and Edge Dev were not running, so Claude edited `browser.enabled_labs_experiments` in their `Local State` directly. Each original is backed up next to it as `Local State.bak-2026-10-11`. Restoring the backup undoes the change.

- Chrome Beta 156, added: `prompt-api-tool-use@1`, `gemma4-for-built-in-ai@1`, and `webmcp-testing@1` (wrong name, dropped by Chrome; see "Flag name correction"). Chrome Beta is the Gemma 4 browser (gemma4-2b-it, see the correction below).
- Edge Dev 157, added: `edge-llm-{prompt,summarization,writer,rewriter}-api-for-default@1`, `edge-llm-prompt-api-tool-use@1`, `edge-llm-on-device-model-prerelease-tool-use-workaround@1`, and `webmcp-testing@1` (wrong name, dropped). `edge-llm-on-device-model-prerelease@1` was already on. Edge Dev is the Aion browser.
- Chrome stable and Edge stable were left unchanged because they were running.

Lars turned on remote debugging in both browsers (`chrome://inspect/#remote-debugging`). playwright-cli attaches with `attach --cdp=chrome-beta` / `--cdp=msedge-dev`. The session drops after each `run-code`, so the CLI has to re-attach before every run.

## Edge Dev 157 results (Aion), measured

- Model: **Aion-1.1-Instruct**. Source: `Edge Dev\User Data\EdgeLLMOnDeviceModel\2026.10.2.1\manifest.json` has `"name": "Aion-1.1-Instruct"`. It is an ONNX model (`model.onnx`), and its variant folder is `webgpu-fp16-prerelease`. This corrects `01-built-in-ai-apis.md`, which said 1.0 based on the Edge docs.
- Availability: `LanguageModel`, `Summarizer`, `Writer`, `Rewriter` and `LanguageDetector` are `available`. `Translator` is `downloadable`. `Proofreader` is not defined. Neither `navigator.modelContext` nor `document.modelContext` was checked on a WebMCP page, see below.
- `contextWindow` = **7168 tokens**. Warm `create()` takes 2-3 ms; the first `create()` took 3.3 s.
- Structured output (`responseConstraint`): works.
- **Tool calling: works as an open loop.**
  - `create()` with `tools` throws `TypeError: When tools are provided, expectedOutputs must include {type: "tool-call"}` unless `expectedOutputs: [{type:'text'},{type:'tool-call'}]` and `expectedInputs: [{type:'text'},{type:'tool-response'}]` are both given.
  - `prompt()` then resolves to an array of `{ type: 'tool-call', value: LanguageModelToolCall }`. The value's fields are getters, so `JSON.stringify` shows `{}`; read `name`, `callID` and `arguments` directly.
  - The result goes back with `new LanguageModelToolSuccess({ callID, name, result: [{ type: 'object', value }] })` inside `[{ role: 'user', content: [{ type: 'tool-response', value }] }]`. The member is spelled **`callID`**: `callId` throws "Required member is undefined".
  - With two tools, "How many Angular components are on the page?" produced one `getComponentCount {}` call and the answer "There are 42 ..." (2.1 s). "What is the count input of app-counter?" produced `getComponentInputs {"selector":"app-counter"}` and the answer "... is **3**" (1.6 s). Total context use after both: 285 tokens.
  - A `prompt()` sent after a tool call, without a tool response, fails with `UnknownError: kErrorUnknown`.
- Probe scripts: session scratchpad `probe5.js` / `probe6.js`.

## Chrome Beta 156, measured

Before the model download, `LanguageModel`, `Summarizer`, `Writer`, `Rewriter` and `Translator` were all `downloadable`. `LanguageDetector` was `available`. The download started from a real click on a page button (`create()` with a `downloadprogress` monitor) and reached about 21% within 15 s.

After the download (probe `probe8.js`):

- **(Superseded, see the correction below.)** First reading: the downloaded model looked like Gemini Nano. `OptGuideOnDeviceModel\2025.8.8.1141\manifest.json` has `"name": "v3Nano"` (4.0 GB). This is despite `chrome://flags` showing "Gemma 4 for Built-in AI: Enabled" and "Prompt API Tool Use: Enabled". **Inferred, not checked:** Gemma 4 is not offered to this device, or it needs a relaunch to fetch. The `chrome://on-device-internals` Event Logs tab would say which, but it did not respond to automation.
- `contextWindow` = **9216**. `create()` took 3.6 s. A plain prompt answered in 3.8 s, and structured output worked in 2.5 s.
- `LanguageModelToolCall` and `LanguageModelToolSuccess` are defined, and `create()` with `tools` plus `expectedInputs`/`expectedOutputs` succeeds. With a parameterless tool, every tool prompt failed with `UnknownError: kErrorUnknown`; see the correction below for the cause.
- Neither the constructors nor `create()` show that tools work, so detection has to run one canary tool prompt and fall back on error.

### Correction: Gemma 4 is the Prompt API model in Chrome Beta, and tool calling works (measured later the same day)

- The `v3Nano` folder above is an older download from 2025. The model downloaded today is in the manifest-broker folder: `OptGuideManifestModel\7feacbfe...\2026.8.7.929\manifest.json` names **`gemma4-2b-it`** version `2026.06.10.0000` (2.4 GB).
- `chrome://on-device-internals` > Broker State lists the solutions `prompt_api_gemma4`, `summarizer_gemma4` and `writing_assistance_api_gemma4`, plus the backend `gemma4_gpu_low_tier_model` pointing at those weights. The models manifest also carries `prompt_gemma4_4b` and `prompt_gemma4_12b` configs. This device got the 2B "low tier".
- In the binary, the flag `gemma4-for-built-in-ai` maps to the features `OptimizationGuideManifestBroker,AIApiFoundationalModel:model_version/v4`. `prompt-api-tool-use` maps to `AIPromptAPIToolUse,OnDeviceModelConversationBackend,AIApiFoundationalModel:model_version/v4`.
- **Why tool prompts failed with `kErrorUnknown`:** in every failing probe, the first tool had `inputSchema: { type: 'object', properties: {} }`. With a tool whose schema has at least one required property (`get_component_count {scope: string}`), `prompt()` returned a proper tool call (`probe9.js`). **Inferred:** a tool with no parameters breaks Gemma 4's tool prompt. Aion accepted the empty schema.
- Full round trip on Gemma 4 (`probe10.js`, the same two tools as on Edge Dev):
  - "How many ...?" called `get_component_count {"scope":"page"}` and answered "There are 42 Angular components on the page." (5.7 s).
  - "What is the count input of app-counter?" called `get_component_inputs {"selector":"app-counter"}` with the right arguments, but the answer was wrong: "The count input for the `app-counter` component has 3 inputs: "Hello"." The correct value was 3, and Aion got it right (4.5 s).
  - Total `contextUsage` was 1,007 tokens, against 285 for the same exchange on Aion.
- Gemma 4 quirks: tool calls arrive with **`callID: ""`** (empty string), and `LanguageModelToolSuccess` accepts that. **`promptStreaming()` on a tool session fails** with `kErrorUnknown`, so use `prompt()`.

## Flag name correction (measured)

The WebMCP flag's internal name is **`enable-webmcp-testing`**, not `webmcp-testing` (the latter is a different string in the binary). Both browsers silently dropped the `webmcp-testing@1` entry from `Local State`. Claude then set "WebMCP for testing" to Enabled through the `chrome://flags` and `edge://flags` pages over the remote debugging connection, and a reload of each flags page reads `Enabled`. It takes effect after a relaunch. Until then, `document.modelContext` and `navigator.modelContext` are `undefined` in both browsers (measured).

## Not measured

- The model name and version: `chrome://on-device-internals` cannot be opened through the automation extension.
- Any extension context (DevTools panel, side panel, service worker, offscreen document).
- Edge.

## After relaunch with `enable-webmcp-testing` (measured 2026-10-11 ~20:57)

- Navigating to `chrome://restart` / `edge://restart` over CDP does not restart the browser: process start times stayed at 19:58. What worked: CDP `Browser.close` from a playwright-cli `run-code` session (the session is saved), then `chrome.exe --restore-last-session` / `msedge.exe --restore-last-session`. Remote debugging stayed allowed, and `attach --cdp=chrome-beta|msedge-dev` worked again without a new approval.
- Both `Local State` files kept `enable-webmcp-testing@1` after the clean close.
- **WebMCP is live in both browsers:** `typeof document.modelContext === 'object'` (`navigator.modelContext` is `undefined`). The prototype has `registerTool`, `getTools`, `executeTool`, `ontoolchange`, `ontoolactivated` and `ontoolcancel`.
- `LanguageModel.availability()` is `available` in both after the restart.
