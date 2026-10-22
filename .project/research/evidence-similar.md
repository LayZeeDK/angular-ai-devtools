# Evidence — similar

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: similar
Questions assigned: Prompt shape for anti-pattern explanation on small models.

## Finding: Pangular Inspector visualizes reactive provenance but does not auto-detect anti-patterns or explain them with an LLM

- **Claim**: Pangular Inspector's Signals tab draws the reactive graph of a component/injector from `ng.ɵgetSignalGraph`, highlights producers (solid links) and consumers (dashed links) for a selected node, and lists dependencies/consumers per node, but contains no automated anti-pattern detection and no on-device LLM explanation; anti-pattern work (e.g. untracked reads) is left to the developer via `untracked()` guidance in docs.
- **Source**: https://pangular-inspector.dev/inspectors/signals/ (sections "Graph", "Node details", "Find what reruns an effect")
- **Confidence**: high
- **Why it matters here**: Confirms the project's N2 scope (deterministic detector + panel-local Prompt API explanation) is novel relative to the closest Angular devtool; the provenance-chain UX (producers left, consumers right, selection highlight) is a validated pattern to mirror.

## Finding: Vue DevTools Graph tab shows reactive dependencies of the selected component only

- **Claim**: Vue DevTools exposes a "Graph" tab that "shows the reactive dependencies of the selected component" but provides no anti-pattern classification and no LLM explanation; dependency tracing is manual inspection.
- **Source**: https://devtools.vuejs.org/getting-started/features (Graph section)
- **Confidence**: high
- **Why it matters here**: Reinforces that reactive-dependency visualization alone is table stakes; the differentiator (and risk) is the on-device explanation layer, which no comparable tool provides.

## Finding: SolidJS devtools visualizes the reactivity graph without anti-pattern or LLM features

- **Claim**: solid-devtools is a Chrome extension that visualizes and interacts with Solid's reactivity graph and inspects component state/hierarchy; its documented feature set does not include automated anti-pattern detection or LLM explanation.
- **Source**: https://github.com/thetarnav/solid-devtools (README, "The Chrome Extension" section)
- **Confidence**: medium
- **Why it matters here**: Cross-framework corroboration that reactive-graph devtools stop at visualization; N2's detector+explainer is additive and not duplicating existing tooling.

## Finding: React DevTools Profiler surfaces render reasons but not signal provenance (React has no signals)

- **Claim**: React DevTools Profiler highlights unnecessary re-renders and reports commit/render reasons in flame graphs, but React has no first-class signal graph, so it cannot trace signal provenance; it also has no LLM explanation feature.
- **Source**: https://www.ramidabdoub.com/blog/article/react-profiler-complete-guide-2026 ; https://react.dev/reference/react/Profiler
- **Confidence**: medium
- **Why it matters here**: Sets expectation that "why did this recompute" tooling for signals is a gap in the React ecosystem; our Angular-only, signal-graph-based approach is appropriately scoped and avoids overreach.

## Finding: Chrome Prompt API supports structured output via responseConstraint (JSON Schema)

- **Claim**: `session.prompt()` / `promptStreaming()` accept a `responseConstraint` field taking a JSON Schema (or regex), forcing the model to emit parseable structured output; combined with `omitResponseConstraintInput`, the schema need not consume context tokens.
- **Source**: https://developer.chrome.com/docs/ai/prompt-api (section "Pass a JSON Schema")
- **Confidence**: high
- **Why it matters here**: For the anti-pattern explanation, prefer a constrained short JSON answer (e.g. `{ explanation: string }`) over free text, improving reliability on Gemini Nano and simplifying parsing.

## Finding: Gemini Nano prompt-design guidance favors concise, delimited, example-driven, short-output prompts

- **Claim**: Google's prompt-design guidance for on-device Gemini Nano recommends: be concise (verbose preambles hurt), add delimiters (## between components is "particularly critical"), provide well-distributed in-context examples, keep output short, prefer a single focused task over multi-step reasoning, and use lower temperature (start 0.2) for deterministic tasks; use Structured Output API to enforce format.
- **Source**: https://developers.google.com/ml-kit/genai/prompt/android/prompt-design
- **Confidence**: high
- **Why it matters here**: Directly shapes the N2 prompt: short fact list (node kinds/labels/edge directions/anti-pattern names only, per prohibition N1), `##`-delimited sections, a one-shot example, temperature ~0.2, and a constrained short output; avoids multi-step reasoning in one call.

## Finding: Prompt API extensions can tune temperature/topK via LanguageModel.params()

- **Claim**: In Chrome Extensions, sessions can be created with `temperature` and `topK` (both or neither), and `LanguageModel.params()` reports default/max limits (example output: defaultTopK 3, maxTopK 128, defaultTemperature 1, maxTemperature 2).
- **Source**: https://developer.chrome.com/docs/ai/prompt-api (section "Sampling parameters for Chrome Extensions")
- **Confidence**: high
- **Why it matters here**: The panel runs as an extension page, so we can set a low temperature (clamped to reported max) for deterministic anti-pattern explanations instead of relying on default sampling.

## Finding: No comparable devtool performs anti-pattern detection or LLM explanation of reactive provenance

- **Claim**: Across React DevTools (profiler/render reasons), SolidJS devtools (reactivity graph), Vue DevTools (Graph tab), and Pangular Inspector (Signals tab), none detects reactive anti-patterns (untracked reads, write-after-read, side-effecting computeds) nor invokes an on-device LLM to explain them.
- **Source**: https://pangular-inspector.dev/inspectors/signals/ ; https://devtools.vuejs.org/getting-started/features ; https://github.com/thetarnav/solid-devtools ; https://react.dev/reference/react/Profiler
- **Confidence**: medium
- **Why it matters here**: Validates N2's value proposition and confirms there is no existing prompt pattern to copy; the project must design its own short fact-list prompt (existing `buildFactsPrompt` pattern in `extension-prompt.service.ts`).

## Assigned questions — answers

- Prompt shape for anti-pattern explanation on small models. → Use a short, focused fact list (node kinds, labels, edge directions, anti-pattern names only; no values/page data), delimited with `##` sections, with a concise instruction and an in-context example, requesting a short answer (2-3 sentences) at low temperature (start 0.2), and constrain output with `responseConstraint` (JSON Schema) for parseability. Do not ask the model to perform multi-step reasoning in one call; keep deterministic detection in code and use the model only to explain the pre-computed findings. Sources: https://developers.google.com/ml-kit/genai/prompt/android/prompt-design ; https://developer.chrome.com/docs/ai/prompt-api ; existing `buildFactsPrompt` in `apps/angular-ai-devtools/src/app/extension-prompt.service.ts:81-84`.

## Dead ends

- React DevTools profiler for signal provenance — React has no signal graph, so not applicable; render-reason profiling does not map to Angular signals.
- Searching for an existing anti-pattern LLM prompt template in comparable devtools — none exist; all tools are visualization/manual only.
- Multi-step reasoning in a single prompt on Gemini Nano — guidance explicitly warns against; split deterministic detection (code) from explanation (model).