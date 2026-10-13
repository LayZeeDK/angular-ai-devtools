# Workflow preferences

- Pair every tool, fixture or runtime the project adopts with a `control-{name}` skill and a `verify-{name}` skill, and keep them maintained. He asked for this pair for AI browsers (Chrome Beta / Edge Dev), the Angular dev-app fixtures, Angular DevTools, Pangular Inspector, Vitest Browser and SSR support. Confidence: 0.95
- Works through his own slash commands (`/lars-mode`, `/poteto-mode`, `/lars-frontend-dev`, `/lars-create-control-skill`, `/pstack:create-verification-skill`, `/pstack:maintain-verification-skill`): the expected output of a piece of work is a skill, playbook or research file, not an ad-hoc script. Confidence: 0.8
- When work is blocked, present it as a numbered list of blocked items, each with options and one clearly recommended option. He then replies "approve recommendation", names an option letter, or asks for the item to be explained briefly. Confidence: 0.9
- Do not assume prerequisites (browser feature flags, model downloads, remote-debugging permissions, app state). Confirm them, enable them himself-free when possible, and escalate to him only when the agent genuinely cannot. Confidence: 0.85
- Research the web and prior art instead of relying on assumptions: he asks "did you research on the web whether ...", asks for cloud-AI/MCP/WebMCP prior art to be mined so it can be re-expressed with browser built-in AI, and points at changelogs, releases and third-party sites as sources. Confidence: 0.8
- Do not start Fable subagents on his behalf without asking; if a task fits Fable, ask first, or use Opus during AFK/overnight runs. Confidence: 0.85
- Long autonomous runs are normal (AFK/overnight lars-mode), and he expects the run to end with a plain what's-done / what's-left report. Confidence: 0.7
- Work stays uncommitted and unpushed unless he asks to commit; upstream findings go into a filing ledger as drafts, never filed. Confidence: 0.7
