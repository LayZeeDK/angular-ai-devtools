# Evidence — spike-limits

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: custom (spike-limits)
Questions assigned: [RESEARCH] What chunk size and prompt cap do S7, S14, S15 and S19 actually measure, and does any of them change the 3.6 caps?

## Finding: S7, S14, S15 and S19 were never run; only blocked records exist

- **Claim**: S7, S14, S15 and S19 are recorded as blocked, with no measurement artifact. `research/raw/s14-blocked.json`, `s15-blocked.json` and `s19-blocked.json` each hold `verdict: blocked` with precondition "model-browser spike definition/probe not present in this checkout"; no `s7-blocked.json` or `s7-*.json` exists, and `05-spikes.md` lists S14, S15, S20, S23 and S17/S18/S19 as blocked (S7 is simply absent from the run lists). No raw measurement exists for any of the four.
- **Source**: `research/05-spikes.md:209-216`; `research/raw/s14-blocked.json`; `research/raw/s15-blocked.json`; `research/raw/s19-blocked.json`; glob `research/raw/s7*` (no matches).
- **Confidence**: high
- **Why it matters here**: INTENT.md §Risks states these spikes set the chunk size and prompt cap; until measured both numbers stay provisional, and a wrong chunk size shows up as a model answer that ignores the second half of the facts.

## Finding: None of the four spikes measured a chunk size or prompt cap

- **Claim**: Of the four, only S15's stated deliverable is "a per-model table that sets the chunk size and the prompt cap of 3.7"; S7 tests `promptStreaming()` on a Gemma 4 tool session, S14 tests built-in AI availability in workers, and S19 tests whether argument repair raises pass rate. None of their "Done when" rows reports a measured chunk size or prompt cap, and S15's row ends with "Done when: a per-model table ... exists", which it does not.
- **Source**: `docs/feature-proposals.md:974,981-982,986`; `research/15-deterministic-and-ai.md:196-227`.
- **Confidence**: high
- **Why it matters here**: M019 cannot treat any of these spikes as having produced the numbers; the caps remain the provisional values from the proposals, not measurements.

## Finding: S14 was only partly answered, and not on chunking

- **Claim**: S14's worker question was partly answered by `research/20` (dedicated worker from a panel has all seven APIs and `LanguageModel` answers; extension tab lacks Writer/Rewriter/Proofreader; service worker cannot start workers), but S14's open parts (SharedWorker, side panel, offscreen document, content-script negative control, thread sharing, hop cost) are still open, and none of it sets a chunk size or prompt cap.
- **Source**: `research/05-spikes.md:217`; `docs/feature-proposals.md:981`; `research/15-deterministic-and-ai.md:196-213`.
- **Confidence**: high
- **Why it matters here**: even the partial S14 result does not change the 3.6 caps; it only informs where the chunk loop may run.

## Finding: S19 and S7 never ran, so their design rules stay unverified

- **Claim**: S19 ("Not run") is listed in the spikes table as not run, and S7 has no blocked file or result file in the repository; the argument-repair replay in `research/raw/arg-repair-replay.json` is a separate measured replay (21 of 26 invalid calls repaired), not S19's per-model pass-rate run. S7's streaming question is likewise unanswered.
- **Source**: `docs/feature-proposals.md:974,986`; `research/05-spikes.md:209-211`; `research/raw/arg-repair-replay.json` (referenced at `docs/feature-proposals.md:488`).
- **Confidence**: high
- **Why it matters here**: argument repair's effect on pass rate and streaming's effect on context cost remain unmeasured, so neither can override the 3.6 caps.

## Finding: Provisional numbers the code should use (not measurements)

- **Claim**: Until S15 runs, the provisional values from the proposals are: chunks of at most 2,000 tokens (3.7 "Chunked map-reduce"), a chat answer using at most about five prompts, and a reduce step under Aion's usable ~5,400 tokens; the 3.6 caps (system prompt ~120 tokens, tool descriptions under ~200 characters, results capped at 200 characters per page string and 20 items per array, error template with up to 10 valid values) are unchanged because no spike measured a change.
- **Source**: `docs/feature-proposals.md:478-480,517,544`; `research/15-deterministic-and-ai.md:117,181-189,165`.
- **Confidence**: medium
- **Why it matters here**: N2/N4 of INTENT.md forbid raising a cap to make an oversized fact list fit; these provisional numbers are the ceiling until S15 produces a measured table.

## Assigned questions — answers

- [RESEARCH] What chunk size and prompt cap do S7, S14, S15 and S19 actually measure, and does any of them change the 3.6 caps? → None of S7, S14, S15 or S19 were ever run (S14/S15/S19 recorded blocked; S7 has no artifact), so no chunk size or prompt cap was measured and the 3.6 caps remain unchanged; use the provisional values (chunks of at most 2,000 tokens, at most about five prompts per chat answer) until S15 runs.

## Dead ends

- `research/raw/s7*` — no file exists; S7 was never executed and has no blocked record, only its definition in `docs/feature-proposals.md:974`.
- `research/raw/s14-blocked.json`, `s15-blocked.json`, `s19-blocked.json` — each is a one-line blocked record with no measurement; no companion result file exists.
