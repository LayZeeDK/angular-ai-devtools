# Research Handoff

<!-- Written by the research orchestrator and consumed by decide. -->

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`

## Dispatch

- `domain` — dispatched → `.project/research/evidence-domain.md` — Angular profiler API, signal graph internals, prior art on change-detection causality
- `stack` — dispatched → `.project/research/evidence-stack.md` — Angular `ng.ɵsetProfiler`/signal graph APIs, Prompt API availability across browsers
- `pitfalls` — dispatched → `.project/research/evidence-pitfalls.md` — renderer crashes, browser availability traps, security of panel-local AI
- `similar` — dispatched → `.project/research/evidence-similar.md` — comparable devtools/profilers and reusable lessons

## Question assignments

- `` [RESEARCH] Exact shape of the `ng.ɵsetProfiler` callback and which profiler events identify a component check. `` → `domain`, `stack`, `similar`
- `` [RESEARCH] How to map a profiled component to its node in the signal graph for the trigger walk. `` → `domain`, `stack`, `similar`
- `` [RESEARCH] Availability/downloadability behavior of `LanguageModel` across the four supported browsers with and without feature flags. `` → `stack`, `pitfalls`
- `` [RESEARCH] Which profiler events correspond to "checked because Eager" vs. signal/zone/event triggers? `` → `domain`, `pitfalls`, `similar`