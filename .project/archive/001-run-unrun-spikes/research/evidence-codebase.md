# Evidence — codebase

<!-- Written by the codebase mapper during /gsd-path-inspect. Read by define
     (brownfield mode), researchers (fifth standard dimension), the planner
     (conventions are binding), and reviewers. -->

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-10-15
Checks run: static inspection only; no project build/test/lint was run. (Role rule: project commands are not read-safe, and the repo has no root manifest/script target. The assigned verify worktree under `...\inspect-codebase\.project\` was not invoked because there is no root `package.json` to drive.) Commands run:
- `git ls-files --exclude=node_modules --exclude=.project/archive --exclude=.git` → 278 files
- `git rev-list --count HEAD` → 164 commits
- `git log -1 --format=%H%n%ai` → ecfdbd0bad2a722daea1f6f24dcf129b4902d237, 2026-10-14 23:41 +0200 (matches the brief's baseline SHA)
- `git diff --short` → empty (clean worktree)
- file reads on `spikes/*/package.json`, `.claude/skills/*/SKILL.md`, `spikes/s1-extension/manifest.json`, `spikes/ng222-app/vitest-base.config.mts`, `research/05-spikes.md`, research note headers, and `control.mjs` heads.

## Map

- **Stack**: docs-first research & design repo, not a buildable application. Root has no `package.json`/`tsconfig`/`README`/`AGENTS.md`/`CLAUDE.md` — the only root entry is `.gitignore` plus directories. Runnable code is confined to fixtures/spikes: Angular 22.2.2 (`@angular/* ^22.2.0`, CLI 22.2.2, rxjs ~7.8.0, TypeScript ~6.0.2, npm 11.16.0) in `spikes/ng222-app` and `spikes/ng222-ssr`; Vitest 5.0.3 / `@vitest/browser` 5.0.3 / `@vitest/browser-playwright` 5.0.3 + `playwright` 1.63.0 for Vitest Browser Mode (`spikes/ng222-app/vitest-base.config.mts:1-22`). Scripts are Node ESM `.mjs`. Browser models under test: Chrome Beta 156 (Gemma 4 `gemma4-2b-it`, Gemini Nano v3) and Edge Dev 157 (Aion-1.1-Instruct), Edge stable 155 (Phi-4-mini-instruct), each a per-model profile in gitignored `.browsers/` (`.claude/skills/control-ai-browsers/SKILL.md:19-24`; `instances.json`).
- **Entry points**: no product entry point — the "product" is the design doc `docs/feature-proposals.md` (~1080 lines, the deliverable, `docs/filing-ledger.md`, the run log `docs/afk-run-2026-10-12.md`, and `docs/design/tutor.md`). Runnable fixtures: `spikes/ng222-app` (`src/main.ts` → `bootstrapApplication`, counter), `spikes/ng222-ssr` (`src/main.ts`/`main.server.ts`/`server.ts`, SSR fixture), `spikes/s1-extension` (throwaway MV3 probe, `manifest.json:2-15`). Automation: `scripts/install-*.mjs` (skill installers) and `.claude/skills/<skill>/scripts/control.mjs` (up/doctor/info/down/run/bench) driven by playwright-cli sessions.
- **Architecture**: evidence-first measurement lab. The product is specified, not built, in `docs/`; evidence is `research/00-17` (narrative notes) + `research/raw/*.json` (raw data) + `research/s1-results/` + `research/ep-trials/`, fixtures in `spikes/`, and live evidence in gitignored `tmp/`. Flow: a claim is measured by a probe in a per-model browser instance (`.browsers/`), captured as JSON under `tmp/`, folded into a `research/` note, validated by the review loop (rounds 1-10, stopped by a stop rule), then codified as a numbered feature (N1-N37 / EXT1-EXT6) in proposals; product decisions are ratified by Lars and recorded in the AFK run log §8 (binding). The shipped MV3 devtools extension itself is never authored in this tree.
- **Conventions**: conventional-commit messages (`feat(...)`, `chore(...)`, `docs(...)`, e.g. `ecfdbd0`); zero-padded numbered research notes (`00`-`17`) and numbered spikes (S1-S23, TS1-TS12, E1-E13); evidence labels `[measured]`/`[inferred]`/`[documented]` everywhere (`research/12-legacy-vs-modern-angular.md:13-17`); claims cite a commit or source line (e.g. `5db6fc4`, `r3_injector.ts:352-358`); standalone + zoneless + OnPush + Signal Forms + functional `provide*` + built-in control flow in fixtures (`spikes/ng222-app/src/app/counter.ts:1-25`, `app.config.ts:1-10`); ESM `.mjs` for scripts; test scripts return objects not `JSON.stringify` (`control.mjs:2`).
- **Maturity**: design complete and ratified (proposals 1080 lines; §8 Lars rulings binding; review stopped after round 10; "Nothing is blocked on Lars", `plans/...handoff.md:44-49`). Measurements complete for S1-S3, S11-S12, the four-model benchmark and the S16-area SSR/Vitest fixtures (`research/05-spikes.md:5,104,139,169`). Pending/unrun: S4, S14-S23, E1-E13, TS1-TS12 (`research/05-spikes.md:89,100,500`; proposals §7). Half-built: the real extension is never built in tree (only the S1 probe exists), and the companion package (`provideAiDevTools()` … `<scope>/vitest` `cdpAttach()`) is design-only — "Nothing here is built or run; spike S16 checks its main claim" (`docs/feature-proposals.md:227`).
- **Recent activity**: last ~20 commits cluster on three things — (1) GSD Path / Command Code orchestration wiring (install scripts, Nx/Playwright-cli/MattPocock skill installers, Nx ai-agents-config skills, `ecfdbd0`–`53418a4`); (2) docs/design finalization (Decisions 4 + Vitest Browser results folded in, argument-repair rule, WebMCP tool audit, `docs/` churn); (3) taste/settings bookkeeping (`chore(taste)`/`chore(settings)`). The most recent code change is the arg-repair replay spike `a2c654f feat(spikes): replay saved tool calls through deterministic argument repair` (`research/raw/arg-repair-replay.json`) — i.e. recent work is tooling/process around a frozen design, not product feature work.

## Finding: Repo root has no project manifest, build, or onboarding doc

- **Claim**: The repository root contains only `.gitignore` and 13 directories. There is no `package.json`, `tsconfig.json`, `README.md`, `AGENTS.md`, or `CLAUDE.md` at root; `git ls-files` returns zero root-level files except `.gitignore`. The only `package.json` files live in `spikes/ng222-app` and `spikes/ng222-ssr`.
- **Source**: root `dir /b /a-d` → `.gitignore` only; `git ls-files --exclude=node_modules --exclude=.project/archive --exclude=.git` (278 files, none at root); `spikes/ng222-app/package.json:1-34`; `spikes/ng222-ssr/package.json:1-36`.
- **Confidence**: high
- **Why it matters here**: An inspector or planner reaches for a root manifest and lint/build/test scripts and finds none. The repo is docs-first evidence; every runnable artifact is isolated under `spikes/`, and the only executable "commands" are Node skill scripts, not npm scripts. This redefines what "the codebase builds/runs" means here.

## Finding: The product devtools extension is specified but not built in tree

- **Claim**: `docs/feature-proposals.md` is a ~1080-line design spec for an MV3 Chrome/Edge extension (architecture §3.1–§3.6, tool registry §3.2, features N1-N37), but no shipped extension source exists in the tree — no product `manifest.json`, no panel or service-worker code. The only built extension source is the throwaway S1 probe `spikes/s1-extension/manifest.json`.
- **Source**: `docs/feature-proposals.md` (1080 lines; §§3.1–3.6, 5, N1-N37); `spikes/s1-extension/manifest.json:1-16` ("S1 Prompt API context probe", MV3, devtools_page + side panel + content scripts); `plans/angular-ai-devtools-proposals.handoff.md:7` ("Target … nothing built"; line 9 "Deliverable: docs/feature-proposals.md … nothing built").
- **Confidence**: high
- **Why it matters here**: The codebase-as-product is the design doc + measurement fixtures, not compiled extension code. A brownfield define must not scan for non-existent extension source, and must treat the extension itself as future build work.

## Finding: The opt-in companion package is design-only

- **Claim**: The companion package — `provideAiDevTools()`, `provideAiRouterDevTools()`, `provideAiNgrxDevTools()`, `provideAiNgrxSignalsDevTools()`, and `<scope>/vitest` `cdpAttach()` — is described in proposals §2.2 ("Tier 2: opt-in export") but explicitly "Nothing here is built or run; spike S16 checks its main claim." Its package name remains "a working name, Lars's to choose."
- **Source**: `docs/feature-proposals.md:227,242,257,268-271` (pre-vetted table), `:446-450` (features that improve with it), `:106,227`; `plans/...handoff.md:7-9,78`; `docs/design/tutor.md` (N27).
- **Confidence**: high
- **Why it matters here**: Several Tier-1 features (`router_state`, `wait_for`, and identity-based `di_lookup`/`di_path`) improve with this export; it is a known, ratified but unbuilt gap. The define session must decide whether to build it and where (separate package vs. this repo), and on Lars naming it.

## Finding: `angular:di_graph` and `injector.get` on `ViewContainerRef` corrupt the page signal graph for its lifetime

- **Claim**: Every 22.2 dev-mode app answers the `devtoolstooldiscovery` DOM event with Angular's own `angular:di_graph` and `angular:signal_graph` tools (`window.ng` also exposes 25 functions including the `ɵ`-prefixed tier-1 internals in a `provideRouter` app). Running `angular:di_graph` — or, equivalently, calling `injector.get` on a node-injector `ViewContainerRef` — makes `ng.ɵgetSignalGraph` (and Angular DevTools' signal-graph pane) drop the template node and template-bound signals for the rest of the page's life, while the app keeps working. The design forbids both.
- **Source**: `research/05-spikes.md:11-16` (the 25 `window.ng` functions; `devtoolstooldiscovery` dispatch); `:18-23` (the side effect, isolated to `ViewContainerRef`); `:104-106` (verified against Angular DevTools 1.22.0); `docs/feature-proposals.md:86` (dev-mode tools on the page), `:326-334` (design forbids `angular:di_graph` / `injector.get` on `ViewContainerRef`).
- **Confidence**: high (measured on `spikes/ng222-app`, Angular 22.2.2)
- **Why it matters here**: This is the kind of thing a planner would guess is a safe in-page AI tool; calling it silently degrades Angular DevTools and the signal graph for every subsequent feature (N1, N2, N5 use the graph). It also pins the design to Tier-1 `ng.ɵ*` reads that must be feature-detected (`typeof ng[name] === 'function'`).

## Finding: Unrun spikes and experiments are an explicit backlog

- **Claim**: Proposals §7 and `research/05-spikes.md` record S4, S14-S23, E1-E13 and TS1-TS12 as not run; only S1-S3, S11-S12, the four-model benchmark, and the S16-area SSR/Vitest fixtures are measured.
- **Source**: `research/05-spikes.md:89,100,500-501` (S4/S14-S23/E1-E13/TS1-TS12 "has not run"/"Not run"); `docs/feature-proposals.md` §7 spike rows; `plans/...handoff.md:51-68` (next work, ordered).
- **Confidence**: high
- **Why it matters here**: These are the open measurement pipeline; the define/implement ordering and effort estimate depend on their current status, and several ratified features (router identity lookup, Worker Prompt API, `cdpAttach` guard) hang on them.

## Finding: Execution is skill scripts against gitignored ephemeral state, not npm scripts

- **Claim**: There is no root npm script to run the repo. The runnable commands are `scripts/install-*.mjs` and `.claude/skills/<skill>/scripts/control.mjs` (up/doctor/info/down/run/bench), driven by playwright-cli sessions keyed in `.claude/skills/control-ai-browsers/instances.json` (4 per-model instances); all live evidence and model downloads land in gitignored `tmp/`, `.browsers/`, `.audit/`, `.playwright-cli/`.
- **Source**: `.claude/skills/control-angular-dev-app/SKILL.md:14-15,144,163`; `.claude/skills/control-angular-dev-app/scripts/control.mjs:2,10-13`; `.claude/skills/control-ai-browsers/SKILL.md:8-9,26`; `.gitignore:1-18`.
- **Confidence**: high
- **Why it matters here**: "Build/test/lint/hit the companion package" maps to Node skill scripts that launch per-model browser profiles and write to gitignored scratch — not a deterministic package.json target. This is the surface that is "read-safe" (static ESM scripts) and that any verify sidecar must invoke; it also explains why `tmp/` is empty in a clean tree yet the committed `research/raw/*.json` and `research/s1-results/*.json` are the persisted evidence.

## Finding: Clean tree at baseline; all live state is gitignored

- **Claim**: HEAD = ecfdbd0bad2a722daea1f6f24dcf129b4902d237 (matches the brief baseline), 164 commits, committed 2026-10-14 23:41 +0200; `git diff --short` is empty. Runtime/model/evidence dirs (`.browsers/`, `.audit/`, `.playwright-cli/`, `tmp/`) and `.commandcode/settings.local.json` are gitignored (`.gitignore:1-18`) and absent from `git ls-files`, so the committed tree holds only design + fixtures + probes + skills + raw evidence JSON.
- **Source**: `git rev-parse HEAD` = ecfdbd0bad2a722daea1f6f24dcf129b4902d237; `git rev-list --count HEAD` = 164; `git diff --short` → 0; `.gitignore:1-18`.
- **Confidence**: high
- **Why it matters here**: A static scan sees no model binaries, screenshots, or per-run artifacts — only the design notes, committed probes, committed fixtures, and the committed JSON they were folded into. Defines must not assume local live evidence is reproducible from tree alone.

## Apparent intent

<!-- Inference, clearly flagged — what the project seems to be becoming. -->

- The project is becoming a **shipping Chrome/Edge MV3 devtools extension** that runs the browser's built-in on-device LLMs (Prompt API w/ tool calling and structured output; Summarizer) over **zoneless, standalone Angular 22.2 dev-mode apps**, reading the public `ng.*` surface plus feature-detected Tier-1 `ng.ɵ*` internals (signal graph, injector functions, `ɵsetProfiler`, `ɵgetControlFlowBlocks`, `ɵgetTransferState`, router trio), with a small **id-driven tool registry** (tools take ids, not selectors) and **deterministic-code-first** prompt kits (3.6/3.7) to fit 7-9K-token on-device windows — inferred from the frozen, ratified 1080-line design (`docs/feature-proposals.md`), Lars's binding rulings in §8, and the per-model-browser measurement harness.
- The design is **frozen and ratified**; the immediate next work is the "cheap open spikes" (S16-S19, S14, S15, S20, S23, tutor TS1-TS12) and then **building the extension and the companion package** — inferred from `plans/...handoff.md:43-67` and from the last ~20 commits, which add GSD Path/Command Code orchestration (install scripts, Nx skills) and taste/settings bookkeeping around a stable design rather than product feature code. The recent commit `a2c654f` (arg-repair replay) is the last measurement artifact, not a product feature.
- An open question for define: the review loop stopped after round 10 "by a stop rule" with "Nothing is blocked on Lars" (`plans/...handoff.md:45-49`) — the define step's completion gate and its "closed-findings check over everything changed since `0647e96`" (handoff line 67) need to be carried forward from the review-round playbook, since no AGENTS.md/CLAUDE.md onboards that here.

## Open questions for define

<!-- What only the user can settle about this codebase. -->

- Where does the product extension source (MV3 `manifest.json` + panel + service worker) get added — into this repo (new top-level dir?) or a separate package — given there is no root manifest today and "nothing is built" here?
- Is a root `package.json`/`tsconfig`/`README`/`AGENTS.md` expected as steady state, or is docs-first research-only the intended keep-state of this repo?
- The companion package name is "a working name, Lars's to choose" and its release flow is `nx release` via a Release PR (`docs/feature-proposals.md:243`) — when is it named, versioned, and where does it live?
- S16 (lookup by an exported first-party class, `Meta`) "checks its main claim" (handoff line 55) — what is its status and what is blocking it?
- Which of the unrun spikes (S4, S14-S23, E1-E13, TS1-TS12) does the next phase activate, and is the round-10 stop rule the define step's completion gate?
- The `tmp/review/` round findings and `tmp/review/*-brief-*.md` (including `round10-brief-closed.md`, handoff line 67) are gitignored — are they recoverable from elsewhere, or must the closed-findings check re-run from `0647e96`?

## Blocked areas

<!-- What could not be inspected and why. "none" if clean. -->

- Product extension source: not present in the committed tree (only the S1 probe `spikes/s1-extension/` and the fixtures); the shipped MV3 devtools extension cannot be inspected or run as code — only its design spec can.
- Live per-model browsers, evidence, and model binaries: gitignored under `.browsers/`, `.audit/`, `.playwright-cli/`, and `tmp/` (absent from `git ls-files`); only the committed `research/raw/*.json`, `research/s1-results/*.json`, and `research/ep-trials/*` are statically visible, plus the probes that regenerate them.
- No AGENTS.md/CLAUDE.md/README onboarding doc exists at root to confirm intended conventions beyond the design doc and the `.claude/skills/*/SKILL.md` skill briefs; the codebase mapper's "read AGENTS.md before scanning" could not be satisfied (absent, not missing-required-input).
