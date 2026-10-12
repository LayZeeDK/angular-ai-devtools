---
name: verify
description: Entry point for verifying anything in this repository. Picks the right verify-* skill for the surface under test (built-in AI browser instances, a dev-mode Angular app or the SSR fixture, the Angular DevTools extension, Pangular Inspector, or the counter's Vitest Browser tests) and hands over to it. Use when a playbook or a person asks to verify, prove or check a change and does not name a specific verify-* skill.
---

# Verify (router)

This skill holds no procedure of its own. Pick the row whose surface the claim is about, then invoke that skill with the Skill tool and follow it. When a claim spans two surfaces, run both skills; each reports its own verdict.

| The claim is about | Invoke | Its control twin |
|---|---|---|
| Built-in AI in a browser: model on disk, availability, contextWindow, structured output, tool calling, WebMCP, CPU or GPU backend, model download or clearing | `verify-ai-browsers` | `control-ai-browsers` |
| A dev-mode Angular app: the counter (`spikes/ng222-app`), the SSR fixture (`spikes/ng222-ssr`: server HTML, hydration, transfer state, mismatch), the Insurance Portal, or any app by URL; `ng.*` output, signals, change detection, DI, routing | `verify-angular-dev-app` | `control-angular-dev-app` |
| The Angular DevTools extension: installed, enabled, attached, coexisting with an in-page AI extension | `verify-angular-devtools` | `control-angular-devtools` |
| Pangular Inspector in the Insurance Portal: its pin, overlay, MCP endpoint and live reads | `verify-pangular-inspector` | `control-pangular-inspector` |
| The counter's Vitest Browser Mode tests, or what an extension sees inside a Vitest tester iframe | `verify-vitest-browser-angular` | `control-vitest-browser-angular` |

If no row fits, say so and name the closest skill; do not improvise a procedure here.

Why a router: `pstack:create-verification-skill` names its output `verify` so playbooks can call one skill. This repository keeps one `verify-*` skill per surface, each paired with its `control-*` skill, so this file routes to them instead of merging them (Lars's ruling of 2026-10-12). `pstack:maintain-verification-skill` maintains the `verify-*` skills, not this router; when a `verify-*` skill is added, renamed or removed, update the table above in the same commit.
