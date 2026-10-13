# Tooling & environment preferences

- Keep browser profiles and downloaded AI models for all browsers used by `control-*` / `verify-*` skills on `D:/`, never `C:/` — including his own Chrome Beta and Edge Dev profiles. Confidence: 0.9
- Keep resource usage low: close unused browser windows and tabs (including ones on his own profiles) and stop leftover dev servers, background shells and model processes as soon as they are no longer needed. Confidence: 0.85
- Clean up unnecessary AI models and other large artifacts after use; `C:` runs low on space on this machine. Confidence: 0.8
- Do not modify, reset or discard his own Chrome Beta / Edge Dev profile data without asking; those profiles must keep their AI feature flags. Confidence: 0.8
- Installing and uninstalling browser extensions (such as Angular DevTools) in Edge, Edge Dev, Chrome and Chrome Beta is pre-approved; Firefox is out of scope. Confidence: 0.8
- Chrome Beta and Edge Dev are the primary AI-capable test targets; Chrome and Edge stable are acceptable, and Phi-4-mini runs on a dedicated Edge stable profile. Confidence: 0.75
- Commits must be authored/committed as `larsbrinknielsen@gmail.com`; his work email and its domain must never appear in commits or documents. Confidence: 0.7
- Prefers interfaces designed for agents when a tool offers several (e.g. MCP/JSON-RPC over a UI panel). Confidence: 0.7
