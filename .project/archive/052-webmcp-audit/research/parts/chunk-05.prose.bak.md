# Chunk 5 — live deliverables, handoff plans and the browser/API research notes 00–11

Audited HEAD: 067dc23ced80abcc535166297084626755f438e4

Scope: lines 81–100 of `.project/research/parts/inventory.txt` (20 documents). Every claim below was checked against this checkout at the HEAD above; commands were run in `D:\projects\sandbox\angular-ai-devtools`.

## docs/design/tutor.md

- current: sections 1–11 exist, including "8. Tiers and dependencies" and "10. Risks and spikes" — read the headings (`findstr /n "^## " docs/design/tutor.md`; file is 702 lines) (`docs/design/tutor.md:527`, `docs/design/tutor.md:661`).
- current: TS1–TS12 are all defined, one table row each — counted the twelve `| TS<n>` rows in section 10 (`docs/design/tutor.md:667-678`).
- current: the answer to "is the Prompt API exposed in a worker the panel starts" cites `research/19` and `research/20`; both files exist — `dir /b research` lists `19-languagemodel-in-extension-contexts.md` and `20-built-in-ai-without-flags.md` (`docs/design/tutor.md:368`).
- unverifiable: "892 signal nodes, 47 components" on `/contract/list` — needs the Insurance Portal checkout and a browser session (`docs/design/tutor.md:366`).

## docs/feature-proposals.md

- current: "the extension is at version 0.3.0 (`extension/manifest.json:4`)" — read the manifest, line 4 is `"version": "0.3.0"` (`docs/feature-proposals.md:3`).
- stale: the N1–N4/N24/N25 panel routes are cited at `apps/angular-ai-devtools/src/app/app.routes.ts:9-16` — asserted at `docs/feature-proposals.md:3`, contradicted by `apps/angular-ai-devtools/src/app/app.routes.ts:114-118`, where those route entries actually are (lines 9–16 are the lazy `loadPanelDemo` closure).
- stale: the eleventh filing draft is cited at `docs/filing-ledger.md:230` — asserted at `docs/feature-proposals.md:27`, contradicted by `docs/filing-ledger.md:265`, where the draft 11 heading (`## 11. Chromium (Blink>AI): LanguageDetector…`) is (line 230 sits inside draft 7).
- current: section 7 holds 23 spike rows S1–S23 — counted the `| S<n>` rows between the section 7 and section 8 headings (`docs/feature-proposals.md:998-1026`).
- current: features N1–N37 exist with N26 explicitly dropped — heading scan shows N36/N37 at lines 780–781 and "N6 Removed"/"N26 dropped" notes (`docs/feature-proposals.md:635`, `docs/feature-proposals.md:780-781`).
- current: the evidence files the tables cite exist — `research/raw/tool-name-matrix-gemma4-gpu.json`, `research/raw/bench/nano.json`, `research/raw/vitest-attach-gemma4.json`, `research/raw/ssr-*.json`, `spikes/probes/bench.js`, `spikes/probes/arg-repair-replay.mjs`, `spikes/probes/probe9.js` all present (`docs/feature-proposals.md:198`, `:203`, `:372`, `:511`, `:778`).
- unverifiable: the `packages/core/…`, `packages/router/…`, `packages/upgrade/…` line citations are angular/angular source, not this tree — needs the Angular repo (`docs/feature-proposals.md:48`, `:226`, `:413`, `:478`).

## docs/filing-ledger.md

- current: eleven drafts, each marked "draft, not filed" — the file has `## 1.` … `## 11.` headings with a `Status: draft, not filed` line under each (`docs/filing-ledger.md:5-288`).
- stale: the Angular DevTools cross-check evidence points at `.claude/skills/verify-angular-devtools/` — asserted at `docs/filing-ledger.md:57`; the repository has no `.claude` directory (`dir` of the root; `Test-Path` on `.claude` is false) and `~/.claude/skills` has no `verify-angular-devtools`, while the skill exists at `.commandcode/skills/verify-angular-devtools/SKILL.md`.
- stale: the `list-components` evidence is cited as `.claude/skills/control-pangular-inspector/SKILL.md:172` — asserted at `docs/filing-ledger.md:98`; the file is `.commandcode/skills/control-pangular-inspector/SKILL.md` and the claimed content ("0.0.7 has no `list-components`… 46 tools") is at lines 222 and 224, not 172.
- current: draft 5's evidence files exist — `research/raw/tool-name-matrix-gemma4-gpu.json`, `research/s1-results/chrome-gemma4-tool-name-pair.json`, `research/s1-results/chrome-gemma4-crash-doctor.json` (`docs/filing-ledger.md:187`).
- current: the S11 matrix probe exists — `spikes/probes/tool-name-matrix.js` is in `dir /b spikes/probes` (`docs/filing-ledger.md:143`).
- current: draft 11's evidence exists — `research/20-built-in-ai-without-flags.md` and `research/raw/20-built-in-ai-without-flags.json` (`docs/filing-ledger.md:267`).
- unverifiable: every upstream claim (Chromium tags/lines, `@pangular-inspector/devtools` 0.0.7 behaviour, `@openng/optimus-ui` 2.0.2 source, playwright-mcp README, the WebMCP spec at `d0e4e0e`) — needs those repositories, packages and issue trackers.

## plans/angular-ai-devtools-program-backlog.md

- current: generation 1 is twelve milestones M018–M029 with full entries — heading scan shows `### M018` … `### M029` (`plans/angular-ai-devtools-program-backlog.md:95-200`).
- current: the queued items Q1–Q4 and generations 2–7 exist — headings at lines 212–400 (`plans/angular-ai-devtools-program-backlog.md:322`, `:400`).
- current: `.project/ROADMAP.md` (cited at line 4) exists — `dir /b .project` lists `ROADMAP.md` (`plans/angular-ai-devtools-program-backlog.md:4`).
- unverifiable: Q3 refreshes `~/Downloads/angular-ai-devtools-features.*` — a user-profile path outside this workspace (`plans/angular-ai-devtools-program-backlog.md:365`).

## plans/angular-ai-devtools-proposals.handoff.md

- stale: "`docs/feature-proposals.md`, about 1,100 lines (1110 measured 2026-10-31)" — asserted at `plans/angular-ai-devtools-proposals.handoff.md:13`, contradicted by `docs/feature-proposals.md` being 1,148 lines (`find /c /v "" docs\feature-proposals.md`).
- stale: "**Skills (project):** in `.claude/skills/`" — asserted at `plans/angular-ai-devtools-proposals.handoff.md:35`; there is no `.claude` in the repository (root listing, 27 dirs, none named `.claude`), and the named skills live in `.commandcode/skills/` (`control-ai-browsers`, `control-angular-dev-app`, `control-angular-devtools`, `control-pangular-inspector`, `control-vitest-browser-angular`, `verify-*`).
- stale: the instance registry is `.claude/skills/control-ai-browsers/instances.json` — asserted at `plans/angular-ai-devtools-proposals.handoff.md:42`, contradicted by `.commandcode/skills/control-ai-browsers/instances.json` (read; ports 9333/9334/9335/9337/9338).
- current: the five instance ports named (chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337, chrome-stable-nano 9338) match the registry's `instances` block (`plans/angular-ai-devtools-proposals.handoff.md:42`).
- stale: "`research/00` to `research/17`" as the evidence range — asserted at `plans/angular-ai-devtools-proposals.handoff.md:18`, contradicted by `research/` also holding `18-edge-prevent-auto-signin.md`, `19-languagemodel-in-extension-contexts.md` and `20-built-in-ai-without-flags.md`.
- stale: the companion package "exports `provideAiDevTools()`, `provideAiNgrxDevTools()`, `provideAiRouterDevTools()`, `provideAiNgrxSignalsDevTools()` and `<scope>/vitest` `cdpAttach()`" — asserted at `plans/angular-ai-devtools-proposals.handoff.md:81`, contradicted by `packages/ai-devtools-companion/package.json` (`exports` has only `"."`) and `packages/ai-devtools-companion/src/index.ts:25` (only `provideAiDevTools`); no file under `packages/**` matches `provideAiNgrxDevTools|provideAiRouterDevTools|provideAiNgrxSignalsDevTools|cdpAttach`.
- current: "The `globalThis` key is `ngAiDevTools`" — `packages/ai-devtools-companion/src/facade.ts:10` is `export const FACADE_KEY = 'ngAiDevTools';` (`plans/angular-ai-devtools-proposals.handoff.md:81`).
- stale: "Review history: `tmp/review/`" and "Lars's original request is verbatim in `tmp/review/lars-request.md`" — asserted at `plans/angular-ai-devtools-proposals.handoff.md:44` and `:10`; `tmp/review` does not exist (`dir /b tmp` lists 30+ other entries, no `review`).
- current: the probe and fixture inventory it lists exists — `spikes/probes/bench.js`, `regrade.mjs`, `arg-repair-replay.mjs`, `zone-mode.js`, `effect-writes.js`, `tosignal-node.js`, `ssr-*.js`, `vitest-*`; `spikes/ng222-app`, `spikes/ng222-ssr`, `research/raw/`, `research/s1-results/`, `.project/archive/001-run-unrun-spikes` (`plans/angular-ai-devtools-proposals.handoff.md:30`, `:33`).

## plans/gsd-path-handoff-M018.md

- current: "M018 `instrument-core` shipped and is archived at `.project/archive/018-instrument-core`" — `dir /b .project\archive` lists `018-instrument-core` (`plans/gsd-path-handoff-M018.md:7`).
- stale: the banner says M019 "is prepared to `plan/done` on `gsd-path/M019` and is ready for `build`" — asserted at `plans/gsd-path-handoff-M018.md:8`; `git branch -a` has no `gsd-path/M019` (current branch is `gsd-path/M052`) and `.project/archive/019-context-and-jobs` exists, so M019 has shipped.
- stale: "Frozen inventory: **143 documents** from `check_docs_audit.py --repo <root> --emit-inventory`" — asserted at `plans/gsd-path-handoff-M018.md:52`, contradicted by running that command: `python -B "%USERPROFILE%\.commandcode\skills\gsd-path\scripts\check_docs_audit.py" --repo D:\projects\sandbox\angular-ai-devtools --emit-inventory | find /c /v ""` → 113.
- current: `workflow_run.py prepare-inspect` is said to refuse because `.project/research/DOCS-AUDIT.md` exists — that file exists (`dir /b .project\research` → `DOCS-AUDIT.md`, `INSPECT-DELTA.md`, `parts`), so the stated precondition is real (`plans/gsd-path-handoff-M018.md:50`); the refusal itself was not run (see unverifiable below).
- current: `pipeline_state.py`, `isolation.py`, `workflow_run.py` exist at the quoted path under `%USERPROFILE%\.commandcode\skills\gsd-path\scripts`, and `INSPECT.md` has 192 lines, so lines 84–111 exist (`plans/gsd-path-handoff-M018.md:41`, `:52`, `:57`).
- current: "`isolation.py isolate-verify` requires `--repo --base --name`, and `--base` must be a full 40-character SHA" — `isolation.py:5902-5906` defines `isolate-verify` with required `--base` and `--name`, and `isolation.py:163` raises "base must be a full 40-character SHA" (`plans/gsd-path-handoff-M018.md:57`).
- current: "Panel initial-bundle budget is **520 KB** (`project.json`, `build-extension`)" — `apps/angular-ai-devtools/project.json` `targets.build-extension.options.budgets[0]` is `maximumWarning: "520kb"` (`plans/gsd-path-handoff-M018.md:67`).
- current: "M018's envelope must be validated by **six hostile tools**" — `plans/angular-ai-devtools-program-backlog.md:105` says "six hostile tools pass — one write with confirm, one async handle, one image…" (`plans/gsd-path-handoff-M018.md:73`).
- unverifiable: the `prepare-inspect` refusal and the `gsd report` / `pipeline_state.py route` readings — needs running the pipeline scripts, which mutates pipeline state (`plans/gsd-path-handoff-M018.md:5`, `:50`).

## references/ai-browsers-verification.md

- current: "each check gives its own `control.mjs` call 600 s (`spawnSync` `timeout: 600000` at `.commandcode/skills/verify-ai-browsers/checks/state.mjs:321`)" — `state.mjs:321` is `timeout: 600000,` (`references/ai-browsers-verification.md:32`).
- current: extension-panel `timeoutMs` 1800000 at `SKILL.md:49` — `verify-ai-browsers/SKILL.md:49` carries `timeoutMs` 1800000 (`references/ai-browsers-verification.md:34`).
- stale: the `state` step's 900000 timeout is cited as `SKILL.md:49,71` — asserted at `references/ai-browsers-verification.md:34`; line 71 is the Gotchas bullet "`state` takes about a minute per instance…" and the `900000` sits on `.commandcode/skills/verify-ai-browsers/SKILL.md:72`.
- current: `checks/state.mjs` and `checks/extension-panel.mjs` exist under `.commandcode/skills/verify-ai-browsers/checks/`, and `~/.commandcode/skills/lars-verify/scripts/verdict.mjs` exists with a `lint` command (`verdict.mjs:1311`) (`references/ai-browsers-verification.md:3`, `:47`).
- current: "`extension-panel` also needs the panel built (`npx nx run angular-ai-devtools:build-extension`)" — that target exists in `apps/angular-ai-devtools/project.json` (`references/ai-browsers-verification.md:19`).
- current: "Ports 9333-9338 belong to the shared instances" — `instances.json` holds exactly 9333, 9334, 9335, 9337, 9338 (`references/ai-browsers-verification.md:42`).
- unverifiable: "Check that port 9992 is free" / "no listener on 9992" — needs the live playwright-cli session listing; no file under `.commandcode/skills` or `scripts/` names 9992 (a recursive sweep of the skills tree and `scripts/` found no hit), so it is host state, not a tree fact (`references/ai-browsers-verification.md:42`, `:48`).

## references/edge-dev-aion-model.md

- current: the pin documentation it defers to exists — `.commandcode/skills/control-ai-browsers/features/model-lifecycle.md` (`references/edge-dev-aion-model.md:4`).
- current: the commands it names are real subcommands — `model pin`, `model download`, `model init`, `model clear`, `up`, `down`, `doctor`, `instances`, `info` all appear in `.commandcode/skills/control-ai-browsers/SKILL.md:270-285` (`references/edge-dev-aion-model.md:3`, `:45`, `:67`, `:69`).
- current: `edge-dev-aion` runs with `--disable-component-update` and pins three roots — `.commandcode/skills/control-ai-browsers/instances.json` gives `args: ["--disable-component-update"]` and `pin: ["EdgeLLMOnDeviceModel","EdgeLLMRuntime","EdgeOptimizationGuideModelsManifest"]` (`references/edge-dev-aion-model.md:80`).
- current: "The pin now holds 2026.10.15.1 / 2026.10.12.1 / 2026.10.19.1" — `dir /b .commandcode\worktrees\.browsers\edge-dev-aion\EdgeLLMOnDeviceModel` → `2026.10.15.1`; `…\EdgeOptimizationGuideModelsManifest` → `2026.10.19.1` (`references/edge-dev-aion-model.md:49`).
- stale: "The 2026.10.2.1 folders are still on disk and in `tmp/control-ai-browsers/pins/edge-dev-aion.2026.10.2.1`" — asserted at `references/edge-dev-aion-model.md:51`; neither `tmp/control-ai-browsers/pins` (the repo `tmp` has no `pins` directory) nor `.commandcode/worktrees/tmp/control-ai-browsers/pins` exists, and the skill's `model pin` writes under `.commandcode/worktrees/tmp/control-ai-browsers/pins/<name>` (SKILL.md:278).
- unverifiable: the Edge component-updater measurements, the per-channel manifest table, the 842-input `model.onnx` reading and the Edge 158 results — need Edge Dev/Canary installs and the model binaries (`references/edge-dev-aion-model.md:20`, `:44`, `:91`, `:113`).

## research/00-browser-probe.md

- current: the probe scripts it names all exist — `spikes/probes/probe5.js`, `probe6.js`, `read-throughput.ps1`, `relaunch-instance.ps1`, `seed-perf-class.mjs`, `set-genai-provider.mjs`, `ep-trials.sh`, `tool-name-matrix.js` (`research/00-browser-probe.md:82`, `:189`, `:230`, `:250`, `:272`, `:281`, `:298`).
- current: the per-instance port table matches the registry — `.browsers/chrome-beta-nano` 9333, `.browsers/chrome-beta-gemma4` 9334, `.browsers/edge-dev-aion` 9335, `.browsers/edge-phi4mini` 9337 (`research/00-browser-probe.md:138-141` vs `.commandcode/skills/control-ai-browsers/instances.json`).
- current: the streaming-quirk citation `probe9.js:18-27` holds — lines 18–27 of `spikes/probes/probe9.js` are the `prompt()` then `promptStreaming()` calls inside try blocks (`research/00-browser-probe.md:105`).
- current: the S11 answer it points to exists — `research/raw/tool-name-matrix-gemma4-gpu.json` and `research/11-spike-s1-extension-contexts.md` (`research/00-browser-probe.md:300`, `:114`).
- unverifiable: the flag-state readings, the C:-vs-D: read speeds (1,464/1,558/1,616 MB/s), the NPU and provider trials, and every per-browser model result — need the branded browsers with their models (`research/00-browser-probe.md:40`, `:183`, `:254`).

## research/01-built-in-ai-apis.md

- unverifiable: "Chrome ships `LanguageModel` to extensions (138+) and the web (148+)", structured output stable, tool calling experimental — needs a Chrome/Edge run at those versions (`research/01-built-in-ai-apis.md:7`).
- unverifiable: "In Edge the prerelease model is **Aion-1.0-Instruct** (no source for '1.1')" — needs Microsoft/Edge sources; this repo's own registry records the model as `Aion-1.1-Instruct` (`instances.json`), which is a naming choice, not a vendor source (`research/01-built-in-ai-apis.md:8`).
- unverifiable: "WebMCP is now `document.modelContext` … origin trial in Chrome 149 and Edge 150" and the extension-context claim in section 3 — need those browsers; the in-repo confirmation is `research/11` (itself browser-measured) (`research/01-built-in-ai-apis.md:10`, `:126`).

## research/02-angular-surface.md

- current: the probe and raw files it cites exist — `spikes/probes/zone-mode.js`, `research/raw/zone-mode-portal.json`, `research/raw/zone-mode-portal-zonejs.json` (`research/02-angular-surface.md:275`).
- current: no local path is claimed broken: every non-existent path in this document is an angular/angular source path (`packages/core/…`, `packages/router/…`, `packages/platform-browser/…`), matched one-for-one against the file's "How `ng` gets populated" section (`research/02-angular-surface.md:19-24`, `:281`, `:299`).
- unverifiable: the `ng` global inventory, the DevTools call list and the 22.x feature claims — need the Angular 22.2 source tree and a running DevTools session (`research/02-angular-surface.md:28`, `:119`, `:265`).

## research/03-prior-art.md

- current: the in-repo path it names exists — `docs/feature-proposals.md` (`research/03-prior-art.md:187`).
- unverifiable: the Pangular, React DevTools, Chrome DevTools AI, Vue/Nuxt/React Scan/Redux/Svelte/Solid/Million entries and the Chrome DevTools MCP tool list — need those repositories and the installed extensions (`research/03-prior-art.md:13`, `:23`, `:164`, `:218`).
- unverifiable: the Pangular extension inventory `extension/manifest.json`, `background.js`, `content-script.js`, `detect-angular.js`, `devtools.js`, `panel-bridge.js`, `panel-actions.js` — those are Pangular's files, not this repository's (`extension/` here holds `manifest.json`, `background.js`, `devtools.js` and none of the other four), so they need the Pangular checkout (`research/03-prior-art.md:31-34`).

## research/04-ecosystem.md

- current: the proposals cross-reference exists — `docs/feature-proposals.md` (`research/04-ecosystem.md:78`).
- current: the Vitest version it observed (5.0.3) matches the fixture's install — `spikes/ng222-app/package.json` devDependency `vitest: 5.0.3`, `@vitest/browser 5.0.3` (`research/04-ecosystem.md:129`).
- unverifiable: the NgRx, Analog, Storybook and RxAngular internals, and the vitest.dev page header reading — need those packages and that page (`research/04-ecosystem.md:19`, `:73`, `:100`, `:129`).

## research/05-spikes.md

- current: the S16 evidence and probe scripts exist — `research/raw/s16-meta-lookup.json`, `spikes/probes/s2b.js`, `portal-probe.js`, `zone-mode.js`, `bench.js`, `effect-writes.js`, `tool-session-matrix.js`, `regrade.mjs` (`research/05-spikes.md:18`, `:45`, `:56`, `:70`, `:79`, `:116`, `:133`, `:166`).
- stale: "S17, S18, S19 recorded **blocked** — … no probe script named for these spikes" — asserted at `research/05-spikes.md:220-222`; S19's probe exists: `spikes/probes/arg-repair-replay.mjs` ("Replays every tool call saved by bench.js through a deterministic validate-and-repair step") with evidence `research/raw/arg-repair-replay.json` (both also cited by `docs/feature-proposals.md:511`).
- current: the app it describes is the fixture — `spikes/ng222-app` installs `@angular/core` 22.2.2 (`node -p require('…/@angular/core/package.json').version`) and `spikes/ng222-app/src/app/counter.ts` exists (`research/05-spikes.md:25`).
- current: the blocked-spike evidence files exist — `research/raw/s17-blocked.json`, `s18-blocked.json`, `s19-blocked.json`, `s14-blocked.json`, `TS1…TS12-blocked.json`, `E1…E13-blocked.json`, `s4-blocked.json` (`research/05-spikes.md:222`, `:226`, `:232`, `:236`).
- unverifiable: "served with `ng serve --port 4222`" and every measured count in the benchmark tables — need the dev server and the model browsers (`research/05-spikes.md:25`, `:77`, `:164`, `:201`).

## research/06-angular-skills.md

- stale: "Skill 1: `angular-developer/SKILL.md` (132 lines)" — asserted at `research/06-angular-skills.md:12`, contradicted by `%USERPROFILE%\.commandcode\skills\angular-developer\SKILL.md` being 147 lines (`find /c /v ""`).
- current: "Skill 2: `angular-new-app/SKILL.md` (63 lines)" — that skill's `SKILL.md` is 63 lines (`research/06-angular-skills.md:56`).
- unverifiable: the rule inventory in section 2 and the feature ideas — they depend on reading the two skills' contents against a dev-mode app (`research/06-angular-skills.md:62`, `:108`).

## research/07-prompting-small-models.md

- current: "System prompt (116 Aion tokens, 528 characters)" — the quoted block measures exactly 528 characters (extracted the fenced block after the heading; `node -e` length count) (`research/07-prompting-small-models.md:235-247`).
- current: the correction's probe and evidence exist — `spikes/probes/tool-name-matrix.js`, `research/raw/tool-name-matrix-gemma4-gpu.json` (`research/07-prompting-small-models.md:361`, `:363`).
- current: the measured raw files it cites for the benchmark exist — `research/raw/bench/*.json` (`dir /b research\raw\bench` lists `gemma4.json`, `nano.json`, `nano-gpu.json`) (`research/07-prompting-small-models.md:166`).
- unverifiable: the per-model prompting guidance, the token counts per model and the tool-calling/structured-output behaviour on each model — need the model browsers (`research/07-prompting-small-models.md:48`, `:127`, `:142`).

## research/08-recent-angular-features.md

- current: the evidence files exist — `research/raw/m036-resource-graph.json`, `research/raw/zone-mode-portal.json`, `research/raw/zone-mode-portal-zonejs.json`, `research/raw/tosignal-node-portal.json`, and `research/02-angular-surface.md` (`research/08-recent-angular-features.md:130`, `:137`, `:145`, `:247`).
- current: the version floor statements match installed versions where they are local — the workspace runs `@angular/core` 22.1.8 and the fixture 22.2.2, so the "22.1"/"22.2" sorted rows in the features table stay consistent with this tree (`research/08-recent-angular-features.md:114`).
- unverifiable: the release notes, the CHANGELOG reads (`CL:1-2`, `CL:370-438`, …) and the GitHub release list — the local changelog is not in this repository and no `@angular/core/CHANGELOG.md` ships in `node_modules` (checked both `node_modules` and the fixture's) (`research/08-recent-angular-features.md:50`, `:52`).
- unverifiable: the "Newer than the local changelog" rows (22.2.1, 22.2.2, 22.3.0-next.0/next.1) — need the Angular repo at their heads (`research/08-recent-angular-features.md:54`).

## research/09-nano-tool-session-error.md

- current: the two `research/05-spikes.md` sections it points to exist — "Root cause hunt…" at line 131 and "Prediction confirmed: Nano gets tool sessions with `AIPromptAPIToolUse` alone" at line 153 (`research/09-nano-tool-session-error.md:144`).
- current: the `research/10-model-capabilities.md` "Matrix" it points to exists at line 41 (`research/09-nano-tool-session-error.md:144`).
- unverifiable: every Chromium source citation (tag `156.0.8078.17`, `language_model.cc`, `ai_manager.cc`, `runtime_enabled_features.json5`), the spec at commit `8040b81`, crbug 422803232/417817645 and the prompt-api issues — needs those repositories and trackers (`research/09-nano-tool-session-error.md:22`, `:72`, `:89`, `:113`, `:116`).

## research/10-model-capabilities.md

- stale: the model manifest citation `.commandcode/worktrees/.browsers/chrome-beta-nano/OptGuideOnDeviceModel/2025.8.21.1028/manifest.json` — asserted at `research/10-model-capabilities.md:30`, contradicted by `dir /b .commandcode\worktrees\.browsers\chrome-beta-nano\OptGuideOnDeviceModel` → `2025.8.8.1141` only.
- stale: "`spikes/probes/bench/nano.json`" as a local file — asserted at `research/10-model-capabilities.md:31`; `spikes/probes/` has `bench.js`, `bench-all.sh`, `bench-summary.mjs` but no `bench/` directory, and `git log --all -- spikes/probes/bench` returns nothing, so the path never existed in this repository.
- current: "Copy: `research/raw/bench/nano.json`, but the file was overwritten by the second benchmark round" — `research/raw/bench/nano.json` and `nano-gpu.json` both exist (`research/10-model-capabilities.md:31`).
- current: the S11 and S16 evidence exists — `research/raw/matrix-nano-tooluse.json`, `research/raw/tool-name-matrix-gemma4-gpu.json`, `spikes/probes/regrade.mjs` (`research/10-model-capabilities.md:45`, `:88`).
- unverifiable: the vendor model-card readings (H1/H2/G2/GB/MK/C1/C2 cells), the Hugging Face `tokenizer_config.json` lines and the Aion sample repo's `docs/prompt-guide.md` — need those external sources (`research/10-model-capabilities.md:26`, `:46`).

## research/11-spike-s1-extension-contexts.md

- current: "`spikes/s1-extension/` (retired in M009; evidence and archived notes live under `.project/archive/001-run-unrun-spikes/`)" — `spikes/` holds only `ng222-app`, `ng222-ssr`, `probes`; `.project/archive/001-run-unrun-spikes` exists (`research/11-spike-s1-extension-contexts.md:11`, `:13`).
- current: "`probe5.js` … camelCase tool names, `getComponentCount` and `getComponentInputs` (`probe5.js:15-16`)" — `spikes/probes/probe5.js:15-16` are exactly those two tool declarations (`research/11-spike-s1-extension-contexts.md:75`).
- current: the phase-2 evidence files exist — `research/s1-results/chrome-fresh.json`, `edge-fresh.json`, `chrome-gemma4.json`, `edge-aion.json`, `chrome-gemma4-crash-doctor.json`, `chrome-gemma4-tool-name-pair.json`, and `research/raw/tool-name-matrix-gemma4-gpu.json` (`research/11-spike-s1-extension-contexts.md:15`, `:54`, `:80`, `:84`).
- current: the standing instances and ports it names match the registry — `chrome-beta-gemma4` 9334, `edge-dev-aion` 9335 (`research/11-spike-s1-extension-contexts.md:5`).
- current: `probe6.js`/`probe10.js` exist in `spikes/probes/` (`research/11-spike-s1-extension-contexts.md:11`).
- unverifiable: every context-exposure result, the crash counts and the `NotAllowedError` on `devtools_page` — need the branded browsers with their models (`research/11-spike-s1-extension-contexts.md:73`, `:80`).

## Counts

| Verdict | Claims |
| --- | ---: |
| current | 59 |
| stale | 18 |
| unverifiable | 23 |
| **total** | **100** |
