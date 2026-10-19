# Communication & writing preferences

- In design documents say "modern Angular pattern" and "modern Angular feature"; never "blessed" or "ordained" — and neither word may appear in DevTools code, UI or runtime text. Confidence: 0.85
- Casing and exact names matter to him and he corrects them (`provideAiDevTools()` not `provideAiDevtools()`, `provideAiNgrxDevTools()` not `provideAiNgRxDevTools()`). Confidence: 0.8
- Writing style in docs, from his skill rules as applied throughout: plain literal prose, no idioms or metaphors, no em dashes or curly quotes. Confidence: 0.65
- When a design point is unclear he asks "explain this to me" / "what do you mean by ..." and expects a short, direct explanation before he rules. Confidence: 0.7
- His rulings should be recorded verbatim in design docs, dated, with a clearly marked note for any inference drawn from them. Confidence: 0.7
- Claims in research and design files are expected to be labelled with how they were established (measured vs. documented vs. inferred), and an inferred label must not be silently upgraded. Confidence: 0.7
- Model prompting guides should note the model's context window, multimodal/multi-model capabilities, and the tasks it excels at. Confidence: 0.7
- Directly corrects conclusions that conflict with his prior experience (e.g., declaring a capability/environment impossible after past successful runs) and expects the assistant to revise rather than defend. Confidence: 0.7
