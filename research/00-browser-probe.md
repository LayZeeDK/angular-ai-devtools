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
- Probe scripts: `spikes/probes/probe5.js` / `spikes/probes/probe6.js` (first written in the session scratchpad, now tracked there).

## Chrome Beta 156, measured

Before the model download, `LanguageModel`, `Summarizer`, `Writer`, `Rewriter` and `Translator` were all `downloadable`. `LanguageDetector` was `available`. The download started from a real click on a page button (`create()` with a `downloadprogress` monitor) and reached about 21% within 15 s.

After the download (probe `probe8.js`):

- **(Superseded, see the correction below.)** First reading: the downloaded model looked like Gemini Nano. `OptGuideOnDeviceModel\2025.8.8.1141\manifest.json` has `"name": "v3Nano"` (4.0 GB). This is despite `chrome://flags` showing "Gemma 4 for Built-in AI: Enabled" and "Prompt API Tool Use: Enabled". **Inferred, not checked:** Gemma 4 is not offered to this device, or it needs a relaunch to fetch. The `chrome://on-device-internals` Event Logs tab would say which, but it did not respond to automation.
- `contextWindow` = **9216**. `create()` took 3.6 s. A plain prompt answered in 3.8 s, and structured output worked in 2.5 s.
- `LanguageModelToolCall` and `LanguageModelToolSuccess` are defined, and `create()` with `tools` plus `expectedInputs`/`expectedOutputs` succeeds. With a parameterless tool, every tool prompt failed with `UnknownError: kErrorUnknown`; see the correction below for the cause. (Confounded with camelCase names; see "Correction (2026-10-12): Gemma 4's tool-prompt failure" at the end of this file and `research/11`.)
- Neither the constructors nor `create()` show that tools work, so detection has to run one canary tool prompt and fall back on error.

### Correction: Gemma 4 is the Prompt API model in Chrome Beta, and tool calling works (measured later the same day)

- The `v3Nano` folder above is an older download from 2025. The model downloaded today is in the manifest-broker folder: `OptGuideManifestModel\7feacbfe...\2026.8.7.929\manifest.json` names **`gemma4-2b-it`** version `2026.06.10.0000` (2.4 GB).
- `chrome://on-device-internals` > Broker State lists the solutions `prompt_api_gemma4`, `summarizer_gemma4` and `writing_assistance_api_gemma4`, plus the backend `gemma4_gpu_low_tier_model` pointing at those weights. The models manifest also carries `prompt_gemma4_4b` and `prompt_gemma4_12b` configs. This device got the 2B "low tier".
- In the binary, the flag `gemma4-for-built-in-ai` maps to the features `OptimizationGuideManifestBroker,AIApiFoundationalModel:model_version/v4`. `prompt-api-tool-use` maps to `AIPromptAPIToolUse,OnDeviceModelConversationBackend,AIApiFoundationalModel:model_version/v4`.
- **Why tool prompts failed with `kErrorUnknown`:** in every failing probe, the first tool had `inputSchema: { type: 'object', properties: {} }`. With a tool whose schema has at least one required property (`get_component_count {scope: string}`), `prompt()` returned a proper tool call (`probe9.js`). **Inferred:** a tool with no parameters breaks Gemma 4's tool prompt. Aion accepted the empty schema. **Superseded:** this cause is not established; the failing probes also used camelCase names (confounded with camelCase names; see "Correction (2026-10-12): Gemma 4's tool-prompt failure" at the end of this file and `research/11`).
- Full round trip on Gemma 4 (`probe10.js`, the same two tools as on Edge Dev):
  - "How many ...?" called `get_component_count {"scope":"page"}` and answered "There are 42 Angular components on the page." (5.7 s).
  - "What is the count input of app-counter?" called `get_component_inputs {"selector":"app-counter"}` with the right arguments, but the answer was wrong: "The count input for the `app-counter` component has 3 inputs: "Hello"." The correct value was 3, and Aion got it right (4.5 s).
  - Total `contextUsage` was 1,007 tokens, against 285 for the same exchange on Aion.
- Gemma 4 quirks: tool calls arrive with **`callID: ""`** (empty string), and `LanguageModelToolSuccess` accepts that. **`promptStreaming()` on a tool session fails** with `kErrorUnknown`, so use `prompt()`. (Superseded: not established. `probe9.js:18-27` streamed on a `clone()` of the session right after `prompt()` returned a tool call, without sending a `tool-response`, and a prompt after an unanswered tool call fails on its own ("Edge Dev 157 results (Aion), measured" above). The failure is measured; its cause is not. The repeat with the tool response sent is spike S7 in `docs/feature-proposals.md`.)

## Flag name correction (measured)

The WebMCP flag's internal name is **`enable-webmcp-testing`**, not `webmcp-testing` (the latter is a different string in the binary). Both browsers silently dropped the `webmcp-testing@1` entry from `Local State`. Claude then set "WebMCP for testing" to Enabled through the `chrome://flags` and `edge://flags` pages over the remote debugging connection, and a reload of each flags page reads `Enabled`. It takes effect after a relaunch. Until then, `document.modelContext` and `navigator.modelContext` are `undefined` in both browsers (measured).

## Not measured

- The model name and version: `chrome://on-device-internals` cannot be opened through the automation extension. Answered: see "Correction: Gemma 4 is the Prompt API model in Chrome Beta" above (manifest and Broker State read).
- Any extension context (DevTools panel, side panel, service worker, offscreen document). Answered: see `research/11-spike-s1-extension-contexts.md` (spike S1).
- Edge. Answered: see "Edge Dev 157 results (Aion), measured" above.

## After relaunch with `enable-webmcp-testing` (measured 2026-10-11 ~20:57)

- Navigating to `chrome://restart` / `edge://restart` over CDP does not restart the browser: process start times stayed at 19:58. What worked: CDP `Browser.close` from a playwright-cli `run-code` session (the session is saved), then `chrome.exe --restore-last-session` / `msedge.exe --restore-last-session`. Remote debugging stayed allowed, and `attach --cdp=chrome-beta|msedge-dev` worked again without a new approval.
- Both `Local State` files kept `enable-webmcp-testing@1` after the clean close.
- **WebMCP is live in both browsers:** `typeof document.modelContext === 'object'` (`navigator.modelContext` is `undefined`). The prototype has `registerTool`, `getTools`, `executeTool`, `ontoolchange`, `ontoolactivated` and `ontoolcancel`.
- `LanguageModel.availability()` is `available` in both after the restart.

## Model cleanup (2026-10-11, on Lars's approval)

Lars ruled: "C:\ is running low on space. Unnecessary models should be cleaned up after use." He then approved clearing two models outside this project's browsers: "Approve both clearings".

- Edge Canary's `Aion-1.0-Instruct` (`Edge SxS\User Data\EdgeLLMOnDeviceModel\2026.5.30.1`, 1.41 GB): folder deleted with the browser not running. Lars uninstalled Edge Canary afterwards, so the Edge Canary row in the flag table above is historical. Its profile folder `%LOCALAPPDATA%\Microsoft\Edge SxS` remains (0.62 GB, measured).
- Chrome stable's Gemini Nano `v3Nano` (`Chrome\User Data\OptGuideOnDeviceModel\2025.8.8.1141`, 3.98 GB): folder deleted after Lars closed Chrome stable (no stable `chrome.exe` left, measured). Chrome stable still has the Prompt API flags on, so it may download the model again on next use.
- C: free space: 22.0 GB at first measurement, 10.84 GB at its lowest during the comparison-model downloads, 25.18 GB after both clears.

## Per-model instances (2026-10-11, measured)

Lars asked: "Could we manage multiple Chrome Beta instances - one with Nano and one with Gemma?" and "Same for Edge Dev with Phi-4-mini and Aion-1.1-Instruct." Each instance runs with its own `--user-data-dir` under `.browsers/` (gitignored, on D:). Its features are set on the command line with `--enable-features`, and it has its own `--remote-debugging-port`. Remote debugging needs no approval on a non-default profile.

| Instance | Port | Features beyond the base API set | Model on disk | Status at 23:45 |
|---|---|---|---|---|
| `.browsers/chrome-beta-nano` | 9333 | `AIPromptAPIToolUse` | `v3Nano` 4.0 GB | available |
| `.browsers/chrome-beta-gemma4` | 9334 | `AIPromptAPIToolUse`, `OnDeviceModelConversationBackend`, `AIApiFoundationalModel:model_version/v4`, `OptimizationGuideManifestBroker` | `gemma4-2b-it` 2.4 GB | available |
| `.browsers/edge-dev-aion` | 9335 | `msEdgeLLMOnDeviceModelMuffinToolUseWorkaround`, `msEdgeLLMOnDeviceModelPrerelease` | Aion 1.3 GB | available |
| `.browsers/edge-dev-phi4mini` | 9336 | none (base set) | nothing | stuck, see below |

Base sets: Chrome `AIPromptAPI,AIPromptAPIMultimodalInput,AISummarizationAPI,AIWriterAPI,AIRewriterAPI,WebMCP`; Edge `AIPromptAPI,AIPromptAPIStructuredOutput,AIPromptAPIToolUse,AIRewriterAPI,AISummarizationAPI,AIWriterAPI,WebMCP`. The Edge names were read from Lars's Edge Dev `edge://version` command line.

Gotchas:
- A fresh profile has Chrome's internal debugging pages off, so `chrome://on-device-internals` shows "Internal debugging pages are currently disabled". Turn them on once per profile with the "Enable internal debugging pages" button on `chrome://chrome-urls`. Edge's instances did not need it.
- Starting the download needs a real user gesture. In the Phi-4-mini instance, pointer clicks from playwright-cli time out (on page buttons and on the internals tabs), but keyboard input works: focus the element, then press Enter or the arrow keys. Cause unknown.

Phi-4-mini instance, after about 35 minutes of `availability()` returning `downloading`:
- Broker State: `edge_base_model 2026.10.2.1 Foreground Installing 0%`, error None.
- `prompt_api` is Pending Assets.
- Every criterion passes: performance class High, device capable, 62,956 MiB free against 20,480 required.
- Manifest variant: `webgpu-fp16`, where Aion's is `webgpu-fp16-prerelease`.
- `EdgeLLMOnDeviceModel` and `EdgeLLMRuntime` are both empty; Aion's runtime folder holds 3.5 MB.
- Earlier, Lars's own Edge Dev profile showed `edge_base_model` Not Installed too (builder report).
- Inferred, not checked: Edge Dev 157 does not currently serve the release ("default", expected Phi-4-mini) component, so the download never starts. Edge stable 155 might; it has not been tried. Superseded: forcing "Check for update" downloads Aion-1.1 as Edge Dev 157's default model, and Phi-4-mini was measured in Edge stable 155; see "Phi-4-mini in Edge Dev 157: every route tried" below.

## Moving Lars's own Chrome Beta and Edge Dev profiles to D: (2026-10-12, measured)

Lars ruled: "I mean use D:/ for profiles and models for all browsers used by control-* and verify-* skills" and "Including *my* Chrome Beta and Edge Dev profiles and models".

Method:
1. Both browsers closed. A survey found no reparse points in either `User Data`.
2. `robocopy /E /COPY:DAT /DCOPY:DAT /XJ` to `D:\browser-profiles\<browser>\User Data`: Chrome Beta 953 files, 6.561 GB; Edge Dev 4,349 files, 2.087 GB. Counts and bytes matched, and robocopy reported 0 failed.
3. Each original was renamed to `User Data.bak`, and a junction now sits at `%LOCALAPPDATA%\<vendor>\<browser>\User Data` pointing to D:.

Results:
- Chrome Beta through the junction: works. Remote debugging needed Lars to allow it again; then `LanguageModel.availability()` is `available`, `LanguageModelToolCall` is defined, and `document.modelContext` is an object.
- **Edge Dev through the junction: broken.** At every startup Edge Dev empties `EdgeOptimizationGuideModelsManifest` (seen twice, the second time after restoring it from the `.bak`). Broker State then shows Manifest Path N/A and Manifest Loaded false, and `availability()` never resolves. The Aion model folder (1.3 GB) stays intact.
- **Edge Dev started with `--user-data-dir="D:\browser-profiles\Edge Dev\User Data"`: works.** The manifest survives startup and `availability()` is `available`.
- Inferred cause: Edge's component handling rejects a profile path that resolves through a reparse point. Chrome Beta does not.

Lars's rulings, 2026-10-12: "Edge Dev: Option B." (move it back to C:) and "Chrome Beta: I don't care about any of that user data from Chrome Beta."
- Edge Dev: junction removed, the untouched `User Data.bak` renamed back to `User Data` on C:, and the D: copy deleted. Started normally, its manifest stays and `availability()` is `available` (measured).
- Chrome Beta: stays on D: through the junction; `User Data.bak` deleted.
- Free space afterwards: C: 30.0 GB, D: 43.3 GB.

## Read speed of model weights: C: vs D: (2026-10-12, measured)

Lars asked: "Could there be a performance penalty from running profiles and (especially) models on D: vs. C:?"

Both drives are partitions of the same physical disk, a WD `SDDPTQD-1T00-1124-WD` NVMe SSD. C: is NTFS (666 GB); D: is ReFS (285 GB), Lars's Dev Drive (`fsutil devdrv query` needs admin, so not confirmed here).

The probe `spikes/probes/read-throughput.ps1` reads 1 GB sequentially in 4 MB blocks with `FILE_FLAG_NO_BUFFERING`, so the Windows file cache is bypassed. Both targets are identical copies of Aion's `model.onnx.data` (1,291,678,720 bytes). Three runs each, alternating:
- C: (Lars's Edge Dev profile): 2,148 / 2,237 / 2,280 MB/s
- D: (`.browsers/edge-dev-aion`): 1,464 / 1,558 / 1,616 MB/s

D: reads about 30% slower. At these rates, loading Aion (1.3 GB) takes about 0.6 s from C: and 0.85 s from D:; Gemini Nano (4 GB) about 1.8 s against 2.6 s.

The weights are read when a session first loads the model. Inference afterwards runs from memory or GPU, so the drive affects cold `create()` only (inferred). The cause of the ReFS gap is not isolated: ReFS read path, Defender handling of the Dev Drive, or the file's layout on D: as written by the browser.

## Phi-4-mini in Edge Dev 157: every route tried (2026-10-12, measured)

Lars asked: "Have you exhausted all options to make Phi-4-mini work in Edge Dev?" and "Find research that confirms whether Aion will replace Phi-4-mini in Edge".

Each experiment used a fresh Edge Dev 157.0.4322.0 profile on D:, with the base feature set and no prerelease feature:
1. **Waiting** (the first instance, 35 minutes): Broker State stayed at `edge_base_model 2026.10.2.1 Foreground Installing 0%`. `edge://components` showed "Edge LLM On Device Model" and "Edge LLM Runtime" at version 0.0.0.0, status New: the component updater had never started them.
2. **Forcing "Check for update"** on both components in `edge://components`: status changed to Downloading. About two minutes later `EdgeLLMOnDeviceModel\2026.10.2.1` held 1,248 MB, and its `manifest.json` names **`Aion-1.1-Instruct`**. Edge Dev 157's default model is Aion, the same as its prerelease model. Both variants in manifest 2026.10.2.1 (`webgpu-fp16` and `webgpu-fp16-prerelease`) name `edge_base_model` 2026.10.2.1.
3. **Seeding the profile before its first start** with Edge stable's Phi-4-mini folder (`EdgeLLMOnDeviceModel\2026.8.19.1`, 2.4 GB): the manifest loaded (2026.10.2.1), Broker State listed no base model, and `prompt_api` was "Not Supported". The seed was ignored.
4. Not tried: the CPU variant through Edge's performance flag. It cannot change the model, because the manifest names Aion for the default.

Conclusion: Edge Dev 157 does not serve Phi-4-mini. Phi-4-mini is available here only from Edge stable 155 (manifest 2026.9.18.5, model 2026.8.19.1). Both experiment profiles were deleted afterwards. Gotcha for the skills: a fresh Edge profile can sit at "Installing 0%" until "Check for update" is pressed for its model components in `edge://components`.

Microsoft's own statements (page reads via markdown.new):
- Edge Prompt API docs (`https://learn.microsoft.com/en-us/microsoft-edge/web-platform/prompt-api`, updated 2026-10-06) say: "By default, the Prompt API uses the Phi-4-mini model." Aion-1.0-Instruct is the prerelease model behind "Enable prerelease on-device language model" in Canary and Dev from 150.0.4070, "expected to be made available as an open source model in July 2026". On devices of Medium or Low performance class, the Prompt API is supported only through Aion. The docs do not mention Aion-1.1, nor any date when Aion becomes the default in Edge.
- Windows App SDK docs (`https://learn.microsoft.com/en-us/windows/ai/apis/phi-silica`, updated 2026-10-02) say: "Phi Silica is being replaced by Aion Instruct". The timeline: a sideloadable package in early October 2026, a rollout to Windows Insider devices in November 2026, and "January 2027 - Aion Instruct rolls out to retail devices and Phi Silica is removed." That is Windows' system model, not Edge's.

Reading (inferred): no source states that Aion replaces Phi-4-mini in Edge. The measurement shows Edge Dev 157 already ships Aion-1.1 as its default. Windows is replacing its own on-device model with Aion on a published timeline. Both point the same way, but Microsoft's Edge docs still describe Phi-4-mini as the default and were last updated 2026-10-06.

## Choosing CPU or GPU per instance (2026-10-12)

Lars asked: "Can we make the Nano instance use the GPU backend? Can we make Gemma 4 and Phi-4-mini use CPU? What about Aion-1.1-Instruct?" He added: "Keep in mind that this machine is CPU-heavy with an NPU but a poor GPU".

How Chrome chooses, read in Chromium 156.0.8078.17 source:
- At startup Chrome measures a performance class and stores it in the profile's `Local State` (`optimization_guide.on_device.performance_class`).
- GPU models are allowed only for the classes in the `OnDeviceModelPerformanceParams` feature parameter `compatible_on_device_performance_classes`, default `3,4,5,6` (`components/optimization_guide/core/optimization_guide_features.cc:120-139`). Low-tier GPU models use `compatible_low_tier_on_device_performance_classes`, default `3,4`.
- `OnDeviceModelForceCpuBackend` is a separate feature, off by default (`services/on_device_model/public/cpp/features.cc:11`). The same string is in Edge Dev 157's binary.

Stored classes, all on the same GPU (16,162 MB VRAM): chrome-beta-nano 2, chrome-beta-gemma4 3, edge-dev-aion 5, edge-phi4mini 5. Inferred: the Nano instance measured its class while another session loaded the machine.

Results (measured with `spikes/probes/relaunch-instance.ps1` and `broker-state.js`):

| Change | Features added | Result |
|---|---|---|
| Nano to GPU | `OnDeviceModelPerformanceParams:compatible_on_device_performance_classes/2%2C3%2C4%2C5%2C6/compatible_low_tier_on_device_performance_classes/2%2C3%2C4` (commas escaped as `%2C`) | Broker State lists "GPU (fastest inference)" backends, and `availability()` turned `downloading` while Chrome fetched Nano's GPU variant. Outcome is recorded below once the download finishes. |
| Gemma 4 to CPU | `OnDeviceModelForceCpuBackend` | Every backend in Broker State reads CPU, and the model stays `available` with no new download. |
| Aion to CPU | `OnDeviceModelForceCpuBackend` (Edge Dev 157) | `availability()` `unavailable`, and Broker State lists no backend. **Edge deleted the installed model**: `EdgeLLMOnDeviceModel` was empty after restoring the normal features, and the model had to be downloaded again. |
| Phi-4-mini to CPU | `OnDeviceModelForceCpuBackend` (Edge stable 155) | Same as Aion: `unavailable`, and the model was deleted. |

Inferred cause for Edge: its manifests offer only WebGPU variants (`webgpu-fp16` and `webgpu-fp32`, with and without `-prerelease`). Forced to CPU, Edge has no variant to run, so it uninstalls the model. Its ONNX runtime does carry `CPUExecutionProvider`, `DmlExecutionProvider` and `QNNExecutionProvider` (Qualcomm NPU), but no flag found selects them. Edge's `edge-llm-on-device-model-performance-param` flag offers only Default, Enabled, "Enabled BypassPerfRequirement" and Disabled.

**Gotcha for the skills: never start an Edge instance with `OnDeviceModelForceCpuBackend`; it deletes the model.**

### Correction: Edge CPU test redone fairly (2026-10-12, measured)

Lars asked: "Did your Edge mistake impact your judgment on whether they could run on CPU?" Partly, yes. The first Edge verdict rested on a read taken seconds after relaunch, before the manifest was confirmed loaded. It used the force-CPU feature, not the performance-class route that Microsoft's Edge docs describe for CPU inferencing ("supported on devices with less capable GPUs or no GPU, via CPU-inferencing"). It was also run on the standing instances, deleting their models.

Redone in a disposable copy of the Aion profile (`.browsers/edge-dev-aion-lowclass`, deleted afterwards):
1. **GPU disallowed for the device's class:** `OnDeviceModelPerformanceParams:compatible_on_device_performance_classes/6/compatible_low_tier_on_device_performance_classes/6`, stored class 5. With the manifest loaded (`true`), every use case was "Not Supported" and `availability()` stayed `unavailable` for over two minutes. Edge deleted the copy's model folder.
2. **A Low-class device:** stored class seeded to 2 with the profile closed (`spikes/probes/seed-perf-class.mjs`), the manifest folder deleted, then a restart. The class stayed 2, and Edge downloaded a new manifest with the same four variants: `webgpu-fp16`, `webgpu-fp16-prerelease`, `webgpu-fp32`, `webgpu-fp32-prerelease`. No CPU variant, and `availability()` stayed `unavailable`.

Verdict: on this machine (Windows 11 ARM64), Edge Dev 157 offers Aion only through WebGPU, whatever the performance class. (Narrowed: this holds for what Edge selects by itself; a CPU run after editing `genai_config.json` is in "Edge provider trials on the standing Aion instance" below.) Inferred: Microsoft's CPU-inferencing route ships to other platforms or later builds. Phi-4-mini (Edge stable) was tested only with the force-CPU switch, and its docs make no CPU claim.

## NPU (2026-10-12)

Lars asked: "Any way to force any of the models on NPU?"

Chrome (Gemini Nano, Gemma 4), measured from Chromium 156.0.8078.17 source:
- `services/on_device_model/public/mojom/on_device_model_service.mojom:49-56` defines three backends: `kGpu` (WebGPU), `kApu` ("Only available on devices with APU, and need special APU model files"), and `kCpu`.
- GitHub code search finds `ModelBackendType::kApu` only in the mojom traits, the fake ChromeML backend and a unit test. Nothing in `chrome/` or `components/` selects it.
- Chrome Beta 156's binary has no APU or NPU strings near the on-device model code.
- Verdict: no NPU route for Chrome's built-in models on Windows. Inferred: the APU backend serves ChromeOS devices.

Edge (Aion, Phi-4-mini), measured from files:
- Edge's model runtime is a downloaded component, `EdgeLLMRuntime\2026.10.2.1\onnxruntime-genai.dll` (ONNX Runtime GenAI).
- It reads the execution provider from the model's `genai_config.json`. Aion's config says `"provider_options": [{"webgpu": {...}}]`.
- The runtime's strings mention "the QNN EP package" (Qualcomm's NPU provider). `msedge.dll` also contains `QNNExecutionProvider` and Windows ML provider-download calls (`EnsureExecutionProviderReadyAsync`).
- So in principle, editing `genai_config.json` could point Aion at QNN (NPU) or at CPU (an empty provider list). Inferred: QNN usually needs a model quantized and compiled for the NPU, and Aion ships as WebGPU fp16.
- The trial was not completed. In a copy of the Aion profile, even the unchanged WebGPU baseline reported `downloading`: the copy did not adopt its model folder, though the files matched the original byte for byte. Cause not found.
- Next step: run `spikes/probes/set-genai-provider.mjs` (webgpu, qnn, cpu) on the standing Aion instance with `ep-prompt.js` and `engine-sampler.ps1`, once that instance is free, and restore `webgpu` afterwards.

Other routes to the NPU, outside the built-in Prompt API (inferred, untested):
- Windows' own on-device model runs on the Snapdragon NPU through the Windows App SDK: Phi Silica today, Aion Instruct from the November 2026 Insider rollout (`research/00`, "Phi-4-mini in Edge Dev 157" sources). An extension could reach it only through a native-messaging host.
- WebNN with `deviceType: 'npu'` (Edge flag `webnn-onnxruntime`: "Enables using ONNX Runtime for CPU, GPU and NPU inference with the WebNN API") runs a model the page supplies itself, not the browser's built-in one.

### Edge provider trials on the standing Aion instance (2026-10-12, measured)

`spikes/probes/ep-trials.sh` sets the provider list in Aion's `genai_config.json` with `set-genai-provider.mjs`. It restarts the instance through `control-ai-browsers` `stop` and `launch`, runs one prompt (`ep-prompt.js`), and restores the original config afterwards (checked with `cmp`; doctor exits 0). Results in `research/ep-trials/`, one run each:

| Provider | Session | create() | First answer |
|---|---|---|---|
| `webgpu` (as shipped) | works | 2,953 ms | 6,290 ms |
| `qnn` (`QnnHtp.dll`, Qualcomm NPU) | fails: `InvalidStateError: The device is unable to create a session to run the model.` | | |
| CPU (empty provider list) | **works** (provider inferred, see below) | 4,623 ms | 14,507 ms |

Corrections to the earlier sections:
- **Aion can run on CPU in Edge**, but only by editing the downloaded component's config. That is unsupported, and an update of the component overwrites it. Chromium's `OnDeviceModelForceCpuBackend` remains destructive on Edge. The earlier "Edge Dev 157 offers Aion only through WebGPU" holds for what Edge selects by itself, not for what its runtime can do. **[inferred]** Which execution provider ran is not observed: the claim rests on the config edit plus the slower `create()` and answer times, with the same answer text as the WebGPU run. No engine observation backs it (see the engine sampler note below).
- **NPU through QNN: no** with this model. Inferred: QNN needs a model compiled for the NPU, and Aion ships as WebGPU fp16.
- The engine sampler (`engine-sampler.ps1`) saw no GPU activity even in the WebGPU run, so it missed the model process. Only the latency and the errors above count as evidence.
- The trial runs reported `launch` exit 127, from a libuv assertion after a successful launch. Fixed in `control.mjs`, then re-driven: exit 0.

## Correction (2026-10-12): Gemma 4's tool-prompt failure

The rule "a tool with empty `properties` makes every Gemma 4 tool prompt fail" is not established. Spike S1 phase 2 (`research/11`) measured Gemma 4's model process crashing with `kErrorUnknown` on camelCase tool names (`getComponentCount`), while the same tool named `get_component_count` worked. Every failing probe behind the empty-`properties` rule also used camelCase names, so the two suspects are confounded. The controlled test that separates them, `spikes/probes/tool-name-matrix.js` (five variants including empty `properties` with a snake_case name), was stopped by a low-memory shutdown before it produced results. Until it runs: snake_case tool names and at least one required parameter, which avoids both suspects. Experiment E3 in `07` should add name style as a factor.
