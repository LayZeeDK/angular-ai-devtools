# Tooling & environment preferences

- Keep browser profiles and downloaded AI models for all browsers used by `control-*` / `verify-*` skills on `D:/`, never `C:/` — including his own Chrome Beta and Edge Dev profiles. Confidence: 0.9
- Keep resource usage low: close unused browser windows and tabs (including ones on his own profiles) and stop leftover dev servers, background shells and model processes as soon as they are no longer needed. Confidence: 0.85
- Clean up unnecessary AI models and other large artifacts after use; `C:` runs low on space on this machine. Confidence: 0.8
- Do not modify, reset or discard his own Chrome Beta / Edge Dev profile data without asking; those profiles must keep their AI feature flags. Confidence: 0.8
- Installing and uninstalling browser extensions (such as Angular DevTools) in Edge, Edge Dev, Chrome and Chrome Beta is pre-approved; Firefox is out of scope. Confidence: 0.8
- Prefers global (user-scope) installation of CLI tools and agent skills over local or project-scoped installation; the `command-code` CLI and all skills/agents are installed globally in `~/.commandcode/` and managed via the `command-code` CLI. Confidence: 0.9
- Chrome Beta and Edge Dev are the primary AI-capable test targets; Chrome and Edge stable are acceptable, and Phi-4-mini runs on a dedicated Edge stable profile. Confidence: 0.75
- Commits must be authored/committed as `larsbrinknielsen@gmail.com`; his work email and its domain must never appear in commits or documents. Confidence: 0.7
- Prefers interfaces designed for agents when a tool offers several (e.g. MCP/JSON-RPC over a UI panel). Confidence: 0.7
- Prefers `.mjs` (ESM) script format with `node:` protocol imports for Node.js scripts in `scripts/` (e.g. `install-*-command-code.mjs`). Confidence: 0.9
- Validates JavaScript/Node script syntax with `node --check` before runtime testing. Confidence: 0.75
- Mirrors his global (user-scope) agent setup across coding tools: he ports the Claude configuration (`~/.claude/CLAUDE.md` + `references/*.md`) into the equivalent Command Code files (`~/.commandcode/AGENTS.md`, `references/*.md`, `agents/*.md`) rather than starting fresh. Confidence: 0.75
- Names subagent types with a `<model>-<effort>` pattern to encode both the model and its reasoning effort, and prefixes the free-model roster's types with `free-`. Confidence: 0.8
- Builds custom model-pinned subagent types by reusing the tool's own built-in general-purpose agent prompt as the body verbatim, with only the frontmatter (name/description/model/effort) doing the pinning — never hand-writing a bespoke prompt body. Confidence: 0.85
- Prefers a free-models-only agent setup: the main orchestrator session and every subagent run on free models, with no paid model spawned anywhere. Confidence: 0.65
- Prefers Beam 1.0 Free (`reflection/beam:free`) as the main session model and the taste-learning model, rather than Cat Jam Free (`stealth/cat-jam:free`), to avoid provider capacity (429) errors. Confidence: 0.8
- Wants a fallback/resilience strategy designed into his free-model setup: because free routes can still carry usage caps, a fallback ladder should reroute the same task to the next model on a limit (429 / "capacity" / quota message) rather than stalling, treating a limit as a routing signal and never as a task failure, and keeping routine/long runs on the uncapped routes so capped ones last; his current pairing treats `reflection/beam:free` as primary with `stealth/cat-jam:free` and `poolside/laguna-s-2.1-free` as fallbacks. Confidence: 0.8
- Pre-tests subagent model-route availability with a minimal probe prompt (e.g. a trivial question) before assigning a substantive task; if a route fails with zero tool uses, probe alternatives until one confirms available, then use it for the real work. Confidence: 0.85
- Runs subagents and orchestrator steps in the primary worktree (e.g. D:/projects/sandbox/...) rather than sidecar/inspect worktrees to avoid HEAD and path-mismatch failures that break downstream steps like collect-artifact. Confidence: 0.8
- Skill SKILL.md references use the official Command Code placeholder variables (`${COMMANDCODE_SKILL_DIR}`, `${COMMANDCODE_PROJECT_DIR}`) instead of hardcoded user/machine paths for bundled scripts and project skills. Confidence: 0.65
- When a new free model becomes available in Command Code, updates the global rules, `references/*.md` docs (including a prompting guide), and adds `free-<model>[-<effort>]` subagent types so the free-model setup stays in sync. Confidence: 0.75
- Command Code discovers skills from `.commandcode/skills/` and `.agents/skills/`, not `.claude/skills/`; to surface Claude-side `control-*`/`verify-*` skills in Command Code, either run the equivalent Claude-side skill, generate them in Command Code and copy/move the folder, or point Command Code at `.claude/skills` via the `skills` array in `.commandcode/settings.json` or the `--skill` flag. Confidence: 0.7
- Runs the relevant skill/script test suites after changes and reports pass/fail counts before declaring the work complete. Confidence: 0.75

