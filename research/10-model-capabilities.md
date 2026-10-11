# 10 - Tool calling and structured output per model

Written 2026-10-11 by Claude (researcher agent). No browser was opened for this note. It compares what vendors say about each model, and about each browser's Prompt API, against Claude's measurements in `00`, `05`, `07` and `09`.

Lars asked: "Research which of the models support tool calling and structured output. Compare to your evidence."

## Labels

- **[measured]**: read in a named source (URL, or local file and line) or counted by Claude with a tool.
- **[search-summary]**: seen only in a web-search result summary, not in the page itself. Weaker than a page read.
- **[inferred]**: Claude's reasoning from measured facts; not checked.

Sources already cited in `01`, `07` and `09` (C1-C3, S1, E1, E2, P1, G1-G3, B1-B3, the Chromium 156 source reads) are not repeated unless this note adds a new fact or a correction.

## New sources read for this note

| ID | Source | How read |
|---|---|---|
| H1 | https://huggingface.co/google/gemma-4-E2B-it `README.md` (model card) | curl, page read |
| H2 | https://huggingface.co/google/gemma-4-E2B-it `tokenizer_config.json` and `chat_template.jinja` | curl, file read |
| H3 | https://huggingface.co/microsoft/Phi-4-mini-instruct `tokenizer_config.json` (chat template) and `added_tokens.json` | curl, file read |
| H4 | Phi-4-Mini technical report, https://arxiv.org/html/2503.01743 | markdown.new, page read |
| GB | Gemma 4 launch post, https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/ (published 2026-04-02) | markdown.new, page read |
| MK | ML Kit GenAI Prompt API, https://developers.google.com/ml-kit/genai/prompt/android (last updated 2026-07-15) | markdown.new, page read |
| WB | Windows Developer Blog, Build 2026, https://blogs.windows.com/windowsdeveloper/2026/06/02/build-2026-furthering-windows-as-the-trusted-platform-for-development/ | markdown.new, page read |
| AS | `microsoft/Aion-Instruct-Preview-Sample` (target of https://aka.ms/tryaion from the Phi Silica page), `docs/prompt-guide.md` last committed 2026-10-11 | `gh api`, file read |
| PS | https://learn.microsoft.com/en-us/windows/ai/apis/phi-silica | markdown.new, page read |
| CR | Chromium `third_party/blink/renderer/platform/runtime_enabled_features.json5` at tag `156.0.8078.17`, lines 485-500 | curl, file read |
| B2' | Edge Dev 157.0.4322.0 `msedge.dll`, new strings read with `rg -a` | local binary |
| D1' | `.browsers/chrome-beta-nano/OptGuideOnDeviceModel/2025.8.21.1028/manifest.json`; `.browsers/edge-dev-phi4mini/EdgeLLMOnDeviceModel/` | local disk |
| BJ | `spikes/probes/bench/nano.json` and `spikes/probes/bench.js:62` | local file |

Re-read this session, with new facts noted below: C1 (Chrome Prompt API page, last updated 2026-08-26), C2 (Chrome structured-output page), E1 (Edge Prompt API page, `updated_at` 2026-10-06), E2 (Edge blog 2026-06-02).

## One caveat that applies to every row

In the browsers, structured output is a runtime feature, not a model feature. Chrome and Edge both ship llguidance, a grammar-constrained decoder (07, B2/B3). It forces the output to match the schema whatever the model was trained on. So "the model card does not claim JSON mode" does not predict whether `responseConstraint` works. The model-level JSON column is weak evidence for all four models. **[inferred from 07's binary reads]**

Tool calling is different. The browser only turns the tool list into prompt text (Edge) or into a model-specific template plus grammar (Chrome, inferred in 07). The model still has to decide to call a tool. So model training matters much more for tools than for structured output. **[inferred]**

## Matrix

| Model (browser) | Native tool calling, model level | Native structured/JSON, model level | Prompt API `tools` in its browser | Prompt API `responseConstraint` in its browser | Claude's measured result | Agree? |
|---|---|---|---|---|---|---|
| **Gemini Nano v3** (`v3Nano`; Chrome Beta 156, Chrome stable) | **No source says yes.** No public Gemini Nano v3 model card exists (search, 3 queries) **[search-summary]**. C1 names Nano as the Prompt API model and does not mention tools **[measured, C1 re-read]**. MK (Android) says Nano "emits text output or structured output" and says nothing about tools **[measured, MK]**. Chat template and tool tokens: **unresolved** (07: nothing on disk beyond a canary prompt). | **Yes on Android:** MK says Prompt API "emits text output or structured output" from Gemini Nano **[measured, MK]**. In Chrome, a runtime feature (next column but one). | **Experimental, flag only, not documented.** C1 documents no `tools` **[measured]**. `AIPromptAPIToolUse` is `experimental` on Win/Mac/Linux/ChromeOS at the 156 tag **[measured, CR:492-499]**. The `#prompt-api-tool-use` flag also switches the model to v4, so Nano gets tool sessions only with `--enable-features=AIPromptAPIToolUse` alone (05, 09). No origin trial. | **Stable.** "Structured output support is available as of Chrome version 137" **[measured, C2]**; `AIPromptAPIStructuredOutput` `status: "stable"` at the 156 tag **[measured, CR:485-486]**. No flag. | Tools: with the gating flags, `create()` throws `NotSupportedError` (`nano.json` native 0/15 is this gate, not the model) **[measured, BJ]**. With `AIPromptAPIToolUse` alone: sessions open, and 3 of 3 one-off prompts returned text, no tool call **[measured, `tmp/matrix-nano-tooluse.json`]**. Not benchmarked. Structured output: fallback loop pass@3 5/5, pass^3 **2/5**, runs **11/15** after Claude's re-grade (05's harness reports 3/5 and 13/15; see "Correction" below) **[measured, BJ]**; Chrome stable 154 also returned schema-valid JSON (00). | Tools: **agree** (no source says yes; no call came out). The browser accepting a tool session is not a claim that the model can call tools: Chromium assumes `kToolUse` for every model (09). Structured output: **agree.** |
| **Gemma 4** `gemma4-2b-it` (Chrome Beta 156, `gemma4-for-built-in-ai`) | **Yes.** "native function-calling support" and "Function Calling - Native support for structured tool use" **[measured, H1 lines 41, 122]**. Format: `<\|tool>…<tool\|>` declarations, `<\|tool_call>…<tool_call\|>` calls, `<\|tool_response>…<tool_response\|>` results (G2, already in 07). New: the HF tokenizer config defines a response schema that pulls calls out with the regex `<\|tool_call>(.*?)<tool_call\|>` and an `x-parser: "gemma4-tool-call"` **[measured, H2 `tokenizer_config.json` lines 37-55]**. Training: E2B Tau2 24.5% (07). | **Yes (claim, no mechanism).** "Native support for function-calling, structured JSON output, and native system instructions" **[measured, GB line 80]**. H1 does not mention JSON mode, and no Gemma page describes a JSON mode or constrained decoding **[measured, H1 search; search-summary for ai.google.dev]**. | **Experimental, flag only, not documented.** Same `AIPromptAPIToolUse` gate **[measured, CR]**; on by `#prompt-api-tool-use`, which also selects v4 (01, 09). No Chrome page documents `tools` **[measured, C1]**. Search found no Chrome tool-use doc page **[search-summary]**. | **Stable** (same as Nano) **[measured, C2, CR]**. | Tools: works. Benchmark native pass@3 5/5, pass^3 3/5, 11/15 (05). Quirks: `callID: ""`, a parameterless tool fails with `kErrorUnknown`, `promptStreaming()` fails on tool sessions (00). Structured output: fallback 5/5, 4/5, 13/15 (05; Q4 counts possibly inflated, see "Correction"). | **Agree** for both. |
| **Aion-1.1-Instruct** (Edge Dev 157, `edge-llm-on-device-model-prerelease`) | **No vendor claim; Microsoft points tool calling at a different model.** WB describes Aion 1.0 Instruct as "everyday text intelligence (summarization, rewrite, intents, accessibility)" and Aion 1.0 **Plan** as "a 14-billion parameter reasoning and tool-calling model" **[measured, WB lines 196 and 200]**. No HF card: `huggingface.co/api/models?search=aion&author=microsoft` returned `[]` again on 2026-10-11, so the July open-weights release has not appeared **[measured]**. Format: Phi-4 tool tokens in `tokenizer.json` (`<\|tool\|>`, `<\|tool_call\|>`, `<\|tool_response\|>`) (07, B1). | **No vendor claim.** AS says the Windows preview API "does **not** currently expose ... JSON-schema/regex constrained decoding" and recommends it only where "the runtime supports structured generation" **[measured, AS `docs/prompt-guide.md` lines 30-40, 246-256]**. That is the Windows API, not Edge's; whether the Windows "Aion Instruct" and Edge's Aion-1.1-Instruct are the same weights is **unresolved**. | **Flag only, not documented.** E1 (updated 2026-10-06) has no tools section; it still names the model "Aion-1.0-Instruct" **[measured, E1 re-read]**. Flags in Edge Dev 157: `edge-llm-prompt-api-tool-use` ("Enables Prompt API tool use ... The API may be subject to changes including the supported options. Exploratory AP[I]") and `edge-llm-on-device-model-prerelease-tool-use-workaround` ("Enables the Prompt API tool-use workaround for the on-device Aion model family") **[measured, B2']**. Status: exploratory flag. | **Documented, developer preview.** E1 documents `responseConstraint` with a JSON schema or a regular expression **[measured, E1 lines 412-459]**. The Prompt API itself is a developer preview in Canary/Dev (01). | Tools: works. Native 5/5, 4/5, 14/15; one `kErrorUnknown` (05). Structured output: works (00); fallback 4/5, 4/5, 12/15 (05). | Model level: **disagree on both** (sources silent or pointing elsewhere; measurement says yes), see D2. Browser level: `tools` undocumented but works; `responseConstraint` **agrees** with E1. |
| **Phi-4-mini** (Edge's default; `edge-llm-prompt-api-for-default` in Edge Dev 157) | **Yes.** Card: post-training "for instruction following, function calling" **[measured, P1 line 77]**; "Tool-enabled function-calling format": tools as a JSON dump between `<\|tool\|>` and `<\|/tool\|>` in the system message **[measured, P1 lines 131-136]**. Chat template appends `message['tools']` inside `<\|tool\|>…<\|/tool\|>` in the system turn and has no handling for tool results **[measured, H3]**. Special tokens include `<\|tool_call\|>` (200025), `<\|/tool_call\|>` (200026), `<\|tool_response\|>` (200027) **[measured, H3 `added_tokens.json`]**. Training: "a significantly larger and more diverse set of function calling ... data" than Phi-3.5-Mini; BFCL (0-shot) **70.3** **[measured, H4 line 128 and the language benchmark table]**. Known failure: "could sometimes hallucinate function names or URL's" (P1, in 07). | **No claim.** Neither P1 nor H4 describes a JSON mode or constrained decoding. The "json format" hit in H4 is an evaluation prompt, not a feature **[measured, H4 search]**. | **Flag only, not documented**, and model support unknown. The generic `edge-llm-prompt-api-tool-use` flag exists **[measured, B2']**. Edge's tool-format strings belong to the "Muffin tool-use workaround" (`msEdgeLLMOnDeviceModelMuffinToolUseWorkaround`), whose flag text names "the on-device Aion model family" **[measured, B2']**; "Muffin" = Aion is **[inferred]**. No Phi-specific tool path was found in the binary. | **Documented, developer preview** (same E1 section; E1 says Phi-4-mini is the default model) **[measured, E1 lines 113, 412-459]**. | **Not measured.** `.browsers/edge-dev-phi4mini/EdgeLLMOnDeviceModel/` and `EdgeLLMRuntime/` were empty at 23:27 **[measured, D1']**, so the model has not downloaded. E1 requires a GPU with 5.5 GB VRAM and a High performance class (01); whether this Snapdragon device qualifies is **unresolved**. | **Open.** The model sources say yes for tools; no browser measurement exists. |

## Disagreements and open cells explained

### D1 - Gemini Nano: Chrome accepts a tool session, but no tool call comes out

What each side says:
- Chromium adds `kToolUse` to every model's capabilities without checking the model, with a TODO to read it from model metadata (09, `model_broker_client.cc#L86-L91`). So `create()` succeeding with tools says nothing about the model.
- No Google source claims Nano tool calling. MK, the newest official Nano page (2026-07-15), lists text and structured output only **[measured, MK]**.
- Measured: 3 of 3 tool prompts on the `AIPromptAPIToolUse`-only instance returned text **[measured]**.

So this is not a source-versus-measurement disagreement. The browser surface says "allowed", the model sources say nothing, and the model behaves as untrained. **[inferred]** Three prompts are too few to say "never". The open question in 09 still stands: Chrome's flag bundle pairs tool use with `OnDeviceModelConversationBackend`, which may be what renders tool declarations for v4. If Nano runs without that backend, Nano may never see the tools in a format it could act on. **[inferred]**

### D2 - Aion: no vendor claim for either feature, yet both work in Edge

- **Tools.** Microsoft's own positioning reserves tool calling for Aion 1.0 Plan (14B) and describes Instruct as a text-task model **[measured, WB]**. Measured in Edge Dev, Aion-1.1-Instruct called the right tool 14 of 15 times **[measured, 05]**. The explanation is the runtime: Edge's Aion-only "tool-use workaround" injects the tool JSON into the system turn and parses `<|tool_call|>{...}<|/tool_call|>` out of free text (07, B2). Aion's tokenizer carries Phi-4's tool tokens (07, B1), so it was probably trained on Phi's tool format even though nobody documents it. **[inferred]** The word "workaround" in the flag name suggests Microsoft treats this as a stopgap, not a supported model capability. **[inferred]**
- **Structured output.** AS says Microsoft's Windows Aion API offers no constrained decoding **[measured, AS]**, but Edge's `responseConstraint` worked **[measured, 00]**. Edge's runtime ships llguidance (07, B2), which enforces the schema whatever the model's training. **[inferred]** The AS statement is about a different API surface, and it is dated today, so it is current.
- **Version mismatch (correction carried from 00):** E1 still names the model Aion-1.0-Instruct on 2026-10-06; the disk says Aion-1.1-Instruct **[measured]**. Every vendor statement above is about "1.0".

### D3 - Phi-4-mini: the strongest model-level claim, and no measurement

Of the four models, Phi-4-mini has the best-documented tool calling (a trained format, special tokens, a BFCL score). But Edge's only tool-format text found in the binary is labelled for Aion ("Muffin") **[measured, B2']**. Whether Edge formats tools for Phi-4-mini at all, or rejects `tools` for it, is **unresolved**. Tried: `rg -a` over `msedge.dll` for tool-use strings next to "phi", "aion", "prerelease", "default model" and "workaround"; E1 and E2 (no tools section); `gh api search/code` on `MicrosoftDocs/edge-developer` for `"tool-call"` and `"expectedOutputs"` (no results); web search for the flag name (no hits) **[search-summary]**.

### D4 - Gemma 4: agrees, with one gap

Sources and measurement agree that Gemma 4 calls tools and returns schema-valid JSON. The gap: GB claims "structured JSON output" as a model feature, but no Gemma page explains whether that means training, a JSON mode, or constrained decoding. In Chrome it does not matter, because `responseConstraint` is grammar-constrained (07, B3). **[inferred]**

## Correction: the benchmark grader passes wrong answers on one question

`spikes/probes/bench.js:62` grades "Which signals does double in app-counter depend on?" with `/count/i.test(a) && !/title|items/i.test(a)` **[measured, BJ]**. The regex `/count/i` also matches the "count" inside "app-counter", so any answer that names the component passes.

In `nano.json` (fallback mode), two of the three passes for this question are wrong answers **[measured, BJ]**:
- Run 1, no tool call: "I am unable to answer this question without first inspecting the app-counter component, so I cannot determine which signals it depends on." Graded pass.
- Run 2, it called `signal_info` for `count` instead of `double`: "The `count` signal in `app-counter` depends on nothing." Graded pass.
- Run 3 is correct: "The signal 'double' in app-counter depends on the 'count' signal."

Corrected Nano fallback score: pass@3 5/5, pass^3 **2/5** (reported 3/5), runs **11/15** (reported 13/15). The Nano numbers are not in 05. For the other models, Aion fallback cannot be inflated, because 05 says it failed this question 3 of 3. Exposed are Aion native (14/15), Gemma 4 native (11/15) and Gemma 4 fallback (13/15, where 05 already names two failures on this question, so at most one pass is suspect). Only `nano.json` was kept, so Claude could not re-grade them. **[measured for Nano; inferred risk for the others]**

## What to measure next

Each item names the instance (from `.audit/maintain-brief.md`: Chrome Beta Nano on 9333, Gemma 4 on 9334, Edge Dev Aion on 9335, Phi-4-mini on 9336) and the open cell it settles. Claude ran none of these for this note.

1. **Fix the grader, then rerun the benchmark on all three downloaded models** (9333, 9334, 9335). Change `bench.js:62` to require `\bcount\b` and to fail on an answer that names no signal, or check the tool-call log instead of the text. Save every model's raw JSON next to `nano.json`. Settles: the corrected structured-output and native-tool numbers in the matrix.
2. **Nano native tool benchmark on the `AIPromptAPIToolUse`-only instance** (9333). Run `bench.js` native mode, 15 runs, with every tool having at least one required property. Record whether any `tool-call` item appears. Then repeat once with `OnDeviceModelConversationBackend` added to `--enable-features` (still without `AIApiFoundationalModel:model_version/v4`), if the model stays `v3Nano` per `manifest.json`. Settles: D1, and 09's open question about the conversation backend.
3. **Get Phi-4-mini onto disk** (9336). Check `edge://on-device-internals` > Model Status for the device performance class, then start the download from a user click (`create()` with a `monitor`). If the class is below High, record that Phi-4-mini cannot run on this device and mark the row "not available on this hardware". Settles: D3's precondition.
4. **Phi-4-mini tool and structured-output probes** (9336, after item 3). Run `tool-session-matrix.js`, then `bench.js` in both modes. Also run once with and once without `edge-llm-on-device-model-prerelease-tool-use-workaround`, to see whether Edge's Aion-only tool path is the only one. Settles: the two empty Phi-4-mini browser cells and whether Edge's `tools` works for its default model.
5. **Schema-in-prompt cost on all four** (07's E5). Compare `measureContextUsage(p, {responseConstraint})` with `{..., omitResponseConstraintInput: true}`. A difference means the browser adds the schema to the prompt in addition to constraining decoding. Settles: how much each browser relies on the model reading the schema versus the grammar, which the "one caveat" section above can only infer.
6. **Grammar enforcement check, Chrome versus Edge** (9334, 9335). Declare a tool argument as `enum: ["app-counter"]` and ask about a component that is not in the enum. Chrome emitting only the enum value supports 07's inference that Chrome constrains tool arguments; Edge emitting another value confirms Aion's arguments are parsed from free text. Settles: the "constrained decoding" part of the tool columns for both browsers.

## Unresolved

- Gemini Nano v3's chat template and tool format. Tried: Chrome docs C1/C2, ML Kit MK, web search for a Nano v3 model card (third-party results only), the `v3Nano` `manifest.json` in the Nano instance (name and version only: `2025.08.14.1358`) **[measured, D1']**.
- Whether Edge's Aion-1.1-Instruct and Windows' "Aion Instruct" are the same weights, and therefore whether AS applies to Edge's model.
- Whether Aion 1.1 was trained on tool calls or only shares Phi-4's tokenizer. No model card exists yet.
- How Edge renders tools for Phi-4-mini, if at all (D3).
