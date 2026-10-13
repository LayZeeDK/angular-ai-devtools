# Design principles for the devtools product

- Combine browser built-in AI APIs with plain deterministic TypeScript/JavaScript: process graphs in chunks, validate, sanitize and compute in normal code (main thread or Workers) and reserve the Prompt API and friends for what code cannot do, specifically to mitigate the small 7-9K context windows. Confidence: 0.9
- The product is only a web (browser) extension and must never generate code — no migrations, no app-specific code, not even inside its own DevTools runtime. Findings may name the modern Angular pattern (and an official Angular migration schematic may be named) and explain why something is an anti-pattern, but never produce the fix. Confidence: 0.9
- Prefer public, first-party APIs (the `angular:*` discovery tools) over internal `ɵ`-prefixed symbols; internal APIs and app-side opt-ins (exporting symbols to `globalThis`, WebMCP) are last-resort, clearly labelled stretch prerequisites because they break "works with any app". Confidence: 0.8
- Any `globalThis` runtime export must be a small pre-vetted allowlist of first- and third-party packages (`@angular/*`, `@ngrx/*`), never arbitrary app services looked up by name. Confidence: 0.8
- WebMCP is supported by consuming apps that already expose it, or as an app opt-in prerequisite; the extension does not publish its own tools as WebMCP. Confidence: 0.75
- Text handed to built-in AI APIs must be sanitized: strip license and copyright notices (e.g. the Angular error digest), cap lengths, wrap page-derived strings as untrusted. Confidence: 0.75
- Companion-package naming: `provideAiDevTools()` with per-package secondary entry points such as `provideAiNgrxDevTools()`; casing matters ("Ai" + "DevTools"). Confidence: 0.75
- Avoid a fixed browser/prerequisite only where it is not needed, but a Chrome Beta or Edge Dev prerequisite is acceptable for the AI features. Confidence: 0.7
