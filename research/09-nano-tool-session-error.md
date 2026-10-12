# 09 - Root cause: "The device is unable to create a session to run the model" (Gemini Nano, native tool calling)

Full message: "The device is unable to create a session to run the model. Please check the result of availability() first."

Measured behaviour: `05-spikes.md`, section "Root cause hunt" (Chrome Beta 156.0.8078.17, Nano profile serving `v3Nano`). This file traces that behaviour through the Chromium source.

## Sources and labels

- **Ref used:** tag `156.0.8078.17`, the exact build that was measured. Its `chrome/VERSION` reads `156.0.8078.17`. Files were fetched raw from the GitHub mirror on 2026-10-11. Links below point at `https://github.com/chromium/chromium/blob/156.0.8078.17/<path>#L<n>`.
- **main check:** On the same day `main` was `157.0.8100.0`. Every check cited below has the same substance there: the Blink tool gates, the empty `tools` vector in `ExecuteAvailability`, the browser's handling of tool types, the `kToolUse` assumption in `ModelClient`, and the `AIPromptAPIToolUse` entry. Only the line numbers are shifted.
- **Labels:** **[measured]** means Claude read it in the named file at the named ref. **[inferred]** means a conclusion drawn from that code that no run has tested.

Short names used in links:
- `CC` = `third_party/blink/renderer/modules/ai/language_model_create_client.cc`
- `LM` = `third_party/blink/renderer/modules/ai/language_model.cc`
- `IDL` = `third_party/blink/renderer/modules/ai/language_model_create_options.idl`
- `AIM` = `chrome/browser/ai/ai_manager.cc`

## Q1 - Where the message is defined and which error leads to it

**Definition [measured].** The message is `kExceptionMessageUnableToCreateSession` in [`third_party/blink/renderer/modules/ai/exception_helpers.cc#L68-L70`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/exception_helpers.cc#L68-L70). It is declared in `exception_helpers.h#L25`.

**Mojo enum [measured].** The browser-side error is `blink.mojom.AIManagerCreateClientError.kUnableToCreateSession = 0`, defined in [`third_party/blink/public/mojom/ai/ai_common.mojom#L33-L35`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/public/mojom/ai/ai_common.mojom#L33-L35). Its comment reads "The underlying service fails to create the on-device session."

**The same string is raised on two paths, with different DOMException names [measured]:**

| Path | Where | DOMException name |
|---|---|---|
| Browser sends `OnError(kUnableToCreateSession or kUnableToCalculateTokenSize)`, or the mojo pipe disconnects | [`CC#L477-L481`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model_create_client.cc#L477-L481), [`CC#L496-L498`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model_create_client.cc#L496-L498) | `InvalidStateError` |
| Blink rejects the request itself in `LanguageModelCreateClient::Create`, before anything is sent to the browser | [`CC#L301-L312`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model_create_client.cc#L301-L312) (inputs), [`CC#L334-L344`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model_create_client.cc#L334-L344) (outputs), plus the image/audio and non-text-output rejects at L313-322 and L345-353 | `NotSupportedError` |

The probe measured **`NotSupportedError`**. So the error comes from the second path. Blink rejects in the renderer, and the browser never receives a `CreateLanguageModel` call. The mojo enum exists, but it did not fire in this case. [inferred from the error name, which is measured]

## Q2 - What fails on the `create()` path

**How the types travel [measured].** `LanguageModel::create` builds a `LanguageModelCreateClient` ([`LM#L590-L591`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model.cc#L590-L591)). The constructor runs the availability check first: `LanguageModel::ExecuteAvailability(...)` with `Create` as its callback ([`CC#L249-L251`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model_create_client.cc#L249-L251)). After that, `Create()` converts `expectedInputs`/`expectedOutputs` with `ToMojoExpectations`. That function maps `"tool-call"`/`"tool-response"` to `mojom::AILanguageModelPromptType::kToolCall`/`kToolResponse` (`ai_utils.cc#L226-L229`, `#L299-L313`). The converted lists then go to the browser as `AILanguageModelCreateOptions.expected_inputs/expected_outputs`.

**The check that fails [measured]:** this is in `LanguageModelCreateClient::Create` ([`CC#L264`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model_create_client.cc#L264)).

```cpp
// expectedInputs loop, CC#L301-L312
// Reject tool types without AIPromptAPIToolUse runtime feature enabled.
if ((expected->type == kToolCall || expected->type == kToolResponse) &&
    !RuntimeEnabledFeatures::AIPromptAPIToolUseEnabled(GetExecutionContext())) {
  GetResolver()->Reject(DOMException::Create(
      kExceptionMessageUnableToCreateSession, "NotSupportedError"));
  return;
}
// expectedOutputs loop, CC#L336-L344: same check for kToolCall
```

- **What kind of check it is:** a renderer feature gate on the Blink runtime-enabled feature `AIPromptAPIToolUse`. It does not look at the model or the session. Every case the probe measured is explained by it: tool types only, `tool-call` out only, `tool-response` in only, and `tools` plus tool types. [measured code + measured behaviour]
- **v3 Nano against v4 makes no difference to this check, and the model is never asked [measured].**
  - `ModelClient`'s constructor adds `kToolUse` to every model's capabilities without condition ([`components/optimization_guide/core/model_execution/model_broker_client.cc#L86-L91`](https://github.com/chromium/chromium/blob/156.0.8078.17/components/optimization_guide/core/model_execution/model_broker_client.cc#L86-L91)). The comment there reads: "Tool use is assumed supported since it is gated by RuntimeEnabledFeatures in Blink. TODO(crbug.com/422803232): Expose actual model tool use capability from model metadata instead of assuming support."
  - As a result, the browser's later check `!model_client->capabilities().HasAll(params->capabilities)` in `AIManager::CreateLanguageModelInternal` ([`AIM#L973-L1001`](https://github.com/chromium/chromium/blob/156.0.8078.17/chrome/browser/ai/ai_manager.cc#L973-L1001)) cannot fail on tool use for any model.
  - `OnDeviceModelConversationBackend` is not checked anywhere on this path. [measured for the files read; not searched repo-wide]
- **Why v3 and v4 look linked [measured].** One chrome://flags choice turns on three features at once:
  - `kPromptAPIToolUseChoices` ([`chrome/browser/about_flags.cc#L4907-L4911`](https://github.com/chromium/chromium/blob/156.0.8078.17/chrome/browser/about_flags.cc#L4907-L4911)) sets `--enable-features=AIPromptAPIToolUse,OnDeviceModelConversationBackend,AIApiFoundationalModel:model_version/v4`. This matches the binary strings found earlier.
  - `kGemma4Choices` (`#L4913-L4917`) sets only `OptimizationGuideManifestBroker,AIApiFoundationalModel:model_version/v4`. It does **not** include `AIPromptAPIToolUse`.
  - So the model version is a side effect of the flag bundle. It is not part of the check.
- **Browser-side gates, not reached in this case [measured].**
  - `AIManager::CreateLanguageModelInternal` adds `kToolUse` only when `options->tools` is non-empty ([`AIM#L974-L977`](https://github.com/chromium/chromium/blob/156.0.8078.17/chrome/browser/ai/ai_manager.cc#L974-L977)). If the base::Feature `blink::features::kAIPromptAPIToolUse` is off, it then sends `kUnableToCreateSession`, which Blink turns into `InvalidStateError` (`#L985-L999`).
  - It treats `kToolResponse` in expected outputs as a bad mojo message (`#L981-L984`).

## Q3 - Why `availability()` returns `available` for the same options

Neither layer checks the tool types. [measured]

1. **Blink [measured].**
   - `LanguageModel::availability` ([`LM#L596-L656`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model.cc#L596-L656)) has no `AIPromptAPIToolUse` check. It validates only languages, the permissions policy and the sampling params.
   - `LanguageModel::ExecuteAvailability` ([`LM#L659-L686`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model.cc#L659-L686)) sends the tool types to the browser. It always sends an **empty** `tools` vector (`#L674`), even when `options->tools` is set.
2. **Browser, `AIManager::CanCreateLanguageModel` [measured]** ([`AIM#L737-L804`](https://github.com/chromium/chromium/blob/156.0.8078.17/chrome/browser/ai/ai_manager.cc#L737-L804)):
   - `GetExpectedInputCapabilities` maps only image and audio to capabilities. For `kToolCall`/`kToolResponse` it does `break` with the comment "Tool use capability is signaled by the presence of tool declarations, not by expected input/output types." ([`AIM#L244-L268`](https://github.com/chromium/chromium/blob/156.0.8078.17/chrome/browser/ai/ai_manager.cc#L244-L268))
   - `HasInvalidOutputTypes` counts `kToolCall` as a valid output ([`AIM#L220-L240`](https://github.com/chromium/chromium/blob/156.0.8078.17/chrome/browser/ai/ai_manager.cc#L220-L240)).
   - The only tool gate, `!base::FeatureList::IsEnabled(kAIPromptAPIToolUse)`, runs only when `options->tools` is non-empty ([`AIM#L774-L783`](https://github.com/chromium/chromium/blob/156.0.8078.17/chrome/browser/ai/ai_manager.cc#L774-L783)). Because Blink always sends an empty list from `availability()`, that gate cannot be reached from `availability()` under any flag setting.
   - What remains is the plain text/image/audio capability check and the language check, run by `CanCreateSession[WithConfig]` with `kPromptApi`. On this device that check returns `available`.
3. **Why `"tool-call"` gets past the bindings at all [measured].** The `LanguageModelMessageType` enum includes `"tool-call"` and `"tool-response"` with no `RuntimeEnabled` ([`IDL#L37`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model_create_options.idl#L37)). WebIDL enum values cannot be runtime-gated, so the strings always parse, and only the C++ gate in Q2 rejects them.

**Spec comparison [measured in spec source].** Claude read webmachinelearning/prompt-api `index.bs` at commit `8040b81` (2026-10-06).
- `availability()` and `create()` share [compute language model options availability](https://github.com/webmachinelearning/prompt-api/blob/8040b8143949937e7bdd8dbe715a6d478bd41daf/index.bs#L415-L445).
- That algorithm appends the "language model content type availability" ([`#L463-L471`](https://github.com/webmachinelearning/prompt-api/blob/8040b8143949937e7bdd8dbe715a6d478bd41daf/index.bs#L463-L471)) for **every** expected input and output type, which includes `tool-call` and `tool-response`.
- `create()`'s "initialize the language model" step (`#L322-L324`) throws `NotSupportedError` only when that same availability is `unavailable`.
- So under the spec, a type the user agent does not support makes `availability()` return `unavailable`, and `availability()` and `create()` agree. Chrome 156 does not follow this for tool types.

## Q4 - Why `LanguageModelToolCall` is undefined and `tools` is ignored

**The runtime feature [measured].** `AIPromptAPIToolUse` is defined in [`third_party/blink/renderer/platform/runtime_enabled_features.json5#L489-L500`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/platform/runtime_enabled_features.json5#L489-L500) with `status: experimental` on Win/Mac/Linux/ChromeOS. It has no `base_feature: "none"`, so a `base::Feature` named `AIPromptAPIToolUse` is generated automatically. That feature is disabled by default because the status is not `stable` (file header, `#L120-L135`).
- `--enable-features=AIPromptAPIToolUse` turns on both the base::Feature and the Blink runtime feature. [inferred from the generator rule in the header]
- `#enable-experimental-web-platform-features` turns on only the Blink runtime feature. [inferred]

**Interfaces [measured].**
- `LanguageModelToolCall` has `[Exposed(Window AIPromptAPI, Worker AIPromptAPIForWorkers), RuntimeEnabled=AIPromptAPIToolUse, SecureContext]` ([`IDL#L69-L79`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model_create_options.idl#L69-L79)).
- `LanguageModelToolSuccess` (`#L89-L94`) and `LanguageModelToolError` (`#L108-L113`) carry the same attribute.
- With the feature off, the interface objects are not installed on `window`, so `typeof LanguageModelToolCall === "undefined"`.
- The Nano profile does not enable the feature, because `kGemma4Choices` leaves it out and `prompt-api-tool-use` was at Default.

**`tools` accepted and ignored [measured].**
- `tools` is declared `[RuntimeEnabled=AIPromptAPIToolUse] sequence<LanguageModelToolDeclaration> tools;` in `LanguageModelCreateCoreOptions` ([`IDL#L151-L153`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model_create_options.idl#L151-L153)).
- With the feature off, the dictionary member does not exist. The bindings skip the JS property, as they do for any unknown key, and `options_->hasTools()` returns false.
- Two branches therefore cannot be reached when the feature is off:
  - the `"Tool use feature is not enabled"` reject at [`CC#L363-L371`](https://github.com/chromium/chromium/blob/156.0.8078.17/third_party/blink/renderer/modules/ai/language_model_create_client.cc#L363-L371)
  - the `TypeError` "When tools are provided, expectedOutputs must include {type: "tool-call"}" at `CC#L66-L76`
- So `create({tools})` succeeds and the model never sees the tools. This matches the Nano column of the probe. In the Gemma 4 column the member exists, so that same `TypeError` is thrown, which is also measured.

## Q5 - Bugs and spec issues

- **Chromium.**
  - [crbug 422803232](https://issues.chromium.org/issues/422803232) is public. Claude fetched its title through the tracker's JSON endpoint: "Feature Work: Implement function calling support in chromium", component Blink>AI>Prompt. It is the TODO cited in `ModelClient`, which says per-model tool capability is not implemented yet. [measured]
  - crbug 417817645 is cited in the TODO "Check model capabilities before conversion" (`CC#L323`). The tracker said "Unsigned-in user does not have permission", so its content is unknown.
  - **Unresolved:** Claude found no Chromium bug about `availability()` returning `available` for tool types while `create()` rejects them, or about tool use on Gemini Nano. What Claude tried: the tracker list/search endpoint (HTTP 405 without sign-in), markdown.new on issue pages (sign-in wall only), and web search including `site:issues.chromium.org` (no hits).
- **Spec (webmachinelearning/prompt-api)** [measured, from `gh search issues` and `gh issue view`]:
  - [#223 "Availability API does not provide actionable failure information"](https://github.com/webmachinelearning/prompt-api/issues/223), opened 2026-10-05, about `availability()` collapsing all failures into `unavailable`. Related, but it is not about the disagreement seen here.
  - [#158 "Make API features queryable"](https://github.com/webmachinelearning/prompt-api/issues/158) asks for feature detection of tool support and similar.
  - [#142 "is Tool calling working?"](https://github.com/webmachinelearning/prompt-api/issues/142), closed. The reported symptom matches ours: the tools were never called. domenic redirected it to the Chrome tracker (crbug.new) as an implementation bug.
  - [#180 "[Tag Review] - Tool Use"](https://github.com/webmachinelearning/prompt-api/issues/180) and [#169 "[Tag Review] - Model selection and availability"](https://github.com/webmachinelearning/prompt-api/issues/169) are background.
  - No issue covers availability and create disagreeing on tool types.

## Root cause

In Chrome 156, Blink allows tool use only when the runtime feature `AIPromptAPIToolUse` is on. With the Nano profile it is off: `prompt-api-tool-use` is at Default, and `gemma4-for-built-in-ai` does not include it.

- **`create()`:** `LanguageModelCreateClient::Create` rejects any `tool-call`/`tool-response` expected type with `NotSupportedError` and reuses the generic "unable to create a session" text. The rejection happens in the renderer, before the browser or the model is involved.
- **`availability()`:** neither the Blink code nor the browser's `CanCreateLanguageModel` checks expected tool types. The browser treats them as no-ops, and Blink never sends `tools` to the browser from `availability()`. The answer is therefore `available`.
- **`tools`:** the member is a runtime-enabled dictionary member, so with the feature off the bindings drop it and it is ignored without an error.
- **v3 Nano:** the model is not the cause. Chromium sets `kToolUse` on every model and relies on the Blink gate alone (TODO crbug 422803232). The link to v4 comes only from how the chrome://flags entry is bundled.

**Classification.**
- **`create()` rejecting while the feature is off:** intended behaviour of an experimental, flag-gated feature. The error text is misleading.
- **`availability()` returning `available` for the same options:** a Chromium conformance bug against the spec. The spec computes a content-type availability for every expected type and makes `create()` fail only when that availability is `unavailable`, so the two are meant to agree. This is not a spec gap.

**Confidence.**
- High for the mechanism: every step was read at the measured tag and matches all nine probe cases, including the error name.
- Medium for calling the `availability()` mismatch a bug rather than a known shortcut. The TODOs (417817645, 422803232) suggest the tool-capability work is known to be incomplete, but Claude found no bug filed on the mismatch.

## Next probe (not run)

Answered: this probe ran later. With `AIPromptAPIToolUse` alone, `v3Nano` kept serving and every tool-typed `create()` succeeded; Nano answered in text, not with a tool call. See `05-spikes.md`, "Prediction confirmed: Nano gets tool sessions with `AIPromptAPIToolUse` alone", and `10-model-capabilities.md`, Matrix. The open question below about `OnDeviceModelConversationBackend` was not tested.

`AIPromptAPIToolUse` has its own generated base::Feature. So launching with `--enable-features=AIPromptAPIToolUse` alone, without `AIApiFoundationalModel:model_version/v4` and `OnDeviceModelConversationBackend`, should pass both the Blink gate and the browser gate while `v3Nano` keeps serving. [inferred]

Open question: does Nano then produce tool calls, or does tool-call formatting depend on `OnDeviceModelConversationBackend` and v4? The source read here does not answer that.

Related nuance [inferred]: `#enable-experimental-web-platform-features` would turn on only the Blink runtime feature. In that setup, tool types alone would pass. `tools` plus tool types would reach `CreateLanguageModelInternal`, fail the base::Feature check, and come back as `InvalidStateError` with the same message.

Running this needs a browser session through `control-ai-browsers`, which this research did not open. (Superseded: run later; see the note at the top of this section.)

## Addendum: web sources on Gemini Nano tool calling (Claude, 2026-10-11)

Lars asked whether the web was searched for Gemini Nano tool-calling support. It had not been, specifically, before this addendum. What a targeted search found:
- The official Chrome Prompt API page (`https://developer.chrome.com/docs/ai/prompt-api`, fetched via markdown.new) does not mention tools or function calling. It names Gemini Nano as the Prompt API's model and does not mention Gemma 4 (measured).
- No Google source documents tool calling for Gemini Nano, in Chrome or in Android's ML Kit GenAI Prompt API. For Android, Google promotes tool calling only for Gemma 4 (`https://android-developers.googleblog.com/2026/04/gemma-4-new-standard-for-local-agentic-intelligence.html`). The ML Kit Prompt API's Nano is described as text and image in, text out (InfoQ, `https://www.infoq.com/news/2025/11/android-genai-prompt-api`). These come from search summaries, not page reads.
- Third-party write-ups say the Prompt API has no tool calling (Apidog, about mid-2026) and that function calling on Nano is done by prompting, with weak instruction following (Swyx, Chrome 137: `https://swyx.io/gemini-nano`). Search summaries only.
- The tool-use flag appears only in Chrome flag reporting about Gemma 4 (PiunikaWeb, `https://piunikaweb.com/2026/06/08/google-chrome-gemma-4-built-in-ai/`). Search summary only.

Together with the measured matrix, the best reading is this (inferred). Chrome's code lets a Nano session accept tools, but Nano was never trained or documented for tool calls. Google ships tool calling with Gemma 4. On Nano, the structured-output fallback loop is the supported route.
