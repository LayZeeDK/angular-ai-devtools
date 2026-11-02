# Evidence — pitfalls

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: custom (pitfalls)
Questions assigned: [RESEARCH] What chunk size and prompt cap do S7, S14, S15 and S19 actually measure, and does any of them change the 3.6 caps?

## Finding: Too large a chunk makes the model ignore the tail of the facts

- **Claim**: A chunk size above the budget is a quiet failure: the model answers from the first part of the facts and ignores the second half, because the context window is small and fixed (7,168 tokens on Aion, 9,216 on Gemma 4/Nano) and the Prompt API silently evicts the oldest prompt/response pairs on overflow without telling the caller.
- **Source**: `.project/intent/INTENT.md:126-128`; `research/07-prompting-small-models.md:166-179,183`; `research/15-deterministic-and-ai.md:181-189`.
- **Confidence**: high
- **Why it matters here**: INTENT.md names this as the risk for M019 SC4: a fact list over the cap must be chunked rather than silently truncated, and the chunk count the panel sees must be truthful.

## Finding: Too small a chunk loses cross-item reasoning

- **Claim**: Splitting too finely breaks global relations: per-chunk answers lose relations that cross chunks, and a model summarising summaries loses facts at each level; error rates also compound (five chunks at a 0.73 per-chunk pass rate give about 0.21 all-correct), so map steps must be extraction validated by code, not prose.
- **Source**: `research/15-deterministic-and-ai.md:160-165,192`; `docs/feature-proposals.md:517,544`.
- **Confidence**: medium
- **Why it matters here**: M019's chunk size must balance tail-loss against cross-item loss; the provisional 2,000-token cap and the five-prompt chat limit exist to keep both in check.

## Finding: The Prompt API silently evicts older turns on overflow

- **Claim**: On overflow the oldest prompt/response pairs are dropped, with `initialPrompts` never removed; when eviction cannot make room, `prompt()` throws `QuotaExceededError` and nothing is removed, so code must call `measureContextUsage()` before each prompt and compact or refuse rather than let the API decide, because it removes the user's question before old tool results.
- **Source**: `research/07-prompting-small-models.md:183`; `docs/feature-proposals.md:519`.
- **Confidence**: high
- **Why it matters here**: A wrong chunk size combined with silent eviction can drop the question itself, so the budget check must run in code, not rely on the model.

## Finding: A Summarizer must summarise the tool result, not the tool declaration

- **Claim**: A Summarizer path that summarises the tool declaration rather than the tool result is a plausible and quiet failure; the safe design keeps headings, order, ids, names and numbers in code and lets the Summarizer shorten only the free-text parts inside a code-built outline.
- **Source**: `.project/intent/INTENT.md:133`; `.project/ROADMAP.md:774`; `docs/feature-proposals.md:518,704`; `research/15-deterministic-and-ai.md:118-122`.
- **Confidence**: high
- **Why it matters here**: M019's Summarizer job must feed the result value, never the declaration JSON, or the summary will describe the tool instead of the data.

## Finding: Chunked jobs need progress, cancellation and a truthful chunk count

- **Claim**: A chunked job over the cap must report progress and cancel, and a cancelled job must leave no partial fact list behind; the chunk count the panel receives must equal the number of chunks the job emitted.
- **Source**: `.project/intent/INTENT.md:31-32,48,50`; `.project/research/evidence-codebase.md:39-44`.
- **Confidence**: high
- **Why it matters here**: These are SC2 and SC4 and the held-out edges E3, E4, E6; the async-handle outcome carries no progress today, so new machinery is required.

## Assigned questions — answers

- [RESEARCH] What chunk size and prompt cap do S7, S14, S15 and S19 actually measure, and does any of them change the 3.6 caps? → No spike measured them (all four unrun), so the pitfalls above stand against the provisional caps; nothing in the research changes the 3.6 caps.

## Dead ends

- `research/07-prompting-small-models.md` sections 1-3 — contain model prompting and context-budget rules, but no statement that a too-large chunk makes the model ignore the tail beyond the INTENT.md risk line; the tail-ignoring failure is recorded there as the risk, not a measurement.
- `research/10-model-capabilities.md` — compares model tool/structured-output support; no chunk-size or summariser-declaration pitfall.
