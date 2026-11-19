# Chunk 5 — live deliverables, handoff plans and the browser/API research notes 00–11
Audited HEAD: 067dc23ced80abcc535166297084626755f438e4

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| sections 1–11 exist, including "8. Tiers and dependencies" and "10. Risks and spikes" | structure | verified | read the headings (`findstr /n "^## " docs/design/tutor.md`; file is 702 lines) (`docs/design/tutor.md:527`, `docs/design/tutor.md:661`). |
| TS1–TS12 are all defined, one table row each | structure | verified | counted the twelve `\| TS<n>` rows in section 10 (`docs/design/tutor.md:667-678`). |
| the answer to "is the Prompt API exposed in a worker the panel starts" cites `research/19` and `research/20`; both files exist | integration | verified | `dir /b research` lists `19-languagemodel-in-extension-contexts.md` and `20-built-in-ai-without-flags.md` (`docs/design/tutor.md:368`). |
| "892 signal nodes, 47 components" on `/contract/list` | feature | unverifiable | needs the Insurance Portal checkout and a browser session (`docs/design/tutor.md:366`). |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "the extension is at version 0.3.0 (`extension/manifest.json:4`)" | config | verified | read the manifest, line 4 is `"version": "0.3.0"` (`docs/feature-proposals.md:3`). |
| the N1–N4/N24/N25 panel routes are cited at `apps/angular-ai-devtools/src/app/app.routes.ts:9-16` | structure | stale | asserted at `docs/feature-proposals.md:3`, contradicted by `apps/angular-ai-devtools/src/app/app.routes.ts:114-118`, where those route entries actually are (lines 9–16 are the lazy `loadPanelDemo` closure). |
| the eleventh filing draft is cited at `docs/filing-ledger.md:230` | feature | stale | asserted at `docs/feature-proposals.md:27`, contradicted by `docs/filing-ledger.md:265`, where the draft 11 heading (`## 11. Chromium (Blink>AI): LanguageDetector…`) is (line 230 sits inside draft 7). |
| section 7 holds 23 spike rows S1–S23 | structure | verified | counted the `\| S<n>` rows between the section 7 and section 8 headings (`docs/feature-proposals.md:998-1026`). |
| features N1–N37 exist with N26 explicitly dropped | structure | verified | heading scan shows N36/N37 at lines 780–781 and "N6 Removed"/"N26 dropped" notes (`docs/feature-proposals.md:635`, `docs/feature-proposals.md:780-781`). |
| the evidence files the tables cite exist | structure | verified | `research/raw/tool-name-matrix-gemma4-gpu.json`, `research/raw/bench/nano.json`, `research/raw/vitest-attach-gemma4.json`, `research/raw/ssr-*.json`, `spikes/probes/bench.js`, `spikes/probes/arg-repair-replay.mjs`, `spikes/probes/probe9.js` all present (`docs/feature-proposals.md:198`, `:203`, `:372`, `:511`, `:778`). |
| the `packages/core/…`, `packages/router/…`, `packages/upgrade/…` line citations are angular/angular source, not this tree | structure | unverifiable | needs the Angular repo (`docs/feature-proposals.md:48`, `:226`, `:413`, `:478`). |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| eleven drafts, each marked "draft, not filed" | feature | verified | the file has `## 1.` … `## 11.` headings with a `Status: draft, not filed` line under each (`docs/filing-ledger.md:5-288`). |
| the Angular DevTools cross-check evidence points at `.claude/skills/verify-angular-devtools/` | feature | stale | asserted at `docs/filing-ledger.md:57`; the repository has no `.claude` directory (`dir` of the root; `Test-Path` on `.claude` is false) and `~/.claude/skills` has no `verify-angular-devtools`, while the skill exists at `.commandcode/skills/verify-angular-devtools/SKILL.md`. |
| the `list-components` evidence is cited as `.claude/skills/control-pangular-inspector/SKILL.md:172` | feature | stale | asserted at `docs/filing-ledger.md:98`; the file is `.commandcode/skills/control-pangular-inspector/SKILL.md` and the claimed content ("0.0.7 has no `list-components`… 46 tools") is at lines 222 and 224, not 172. |
| draft 5's evidence files exist | structure | verified | `research/raw/tool-name-matrix-gemma4-gpu.json`, `research/s1-results/chrome-gemma4-tool-name-pair.json`, `research/s1-results/chrome-gemma4-crash-doctor.json` (`docs/filing-ledger.md:187`). |
| the S11 matrix probe exists | structure | verified | `spikes/probes/tool-name-matrix.js` is in `dir /b spikes/probes` (`docs/filing-ledger.md:143`). |
| draft 11's evidence exists | structure | verified | `research/20-built-in-ai-without-flags.md` and `research/raw/20-built-in-ai-without-flags.json` (`docs/filing-ledger.md:267`). |
| every upstream claim (Chromium tags/lines, `@pangular-inspector/devtools` 0.0.7 behaviour, `@openng/optimus-ui` 2.0.2 source, playwright-mcp README, the WebMCP spec at `d0e4e0e`) | feature | unverifiable | needs those repositories, packages and issue trackers. |

## Doc: plans/angular-ai-devtools-program-backlog.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| generation 1 is twelve milestones M018–M029 with full entries | feature | verified | heading scan shows `### M018` … `### M029` (`plans/angular-ai-devtools-program-backlog.md:95-200`). |
| the queued items Q1–Q4 and generations 2–7 exist | structure | verified | headings at lines 212–400 (`plans/angular-ai-devtools-program-backlog.md:322`, `:400`). |
| `.project/ROADMAP.md` (cited at line 4) exists | structure | verified | `dir /b .project` lists `ROADMAP.md` (`plans/angular-ai-devtools-program-backlog.md:4`). |
| Q3 refreshes `~/Downloads/angular-ai-devtools-features.*` | feature | unverifiable | a user-profile path outside this workspace (`plans/angular-ai-devtools-program-backlog.md:365`). |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "`docs/feature-proposals.md`, about 1,100 lines (1110 measured 2026-10-31)" | feature | stale | asserted at `plans/angular-ai-devtools-proposals.handoff.md:13`, contradicted by `docs/feature-proposals.md` being 1,148 lines (`find /c /v "" docs\feature-proposals.md`). |
| "**Skills (project):** in `.claude/skills/`" | feature | stale | asserted at `plans/angular-ai-devtools-proposals.handoff.md:35`; there is no `.claude` in the repository (root listing, 27 dirs, none named `.claude`), and the named skills live in `.commandcode/skills/` (`control-ai-browsers`, `control-angular-dev-app`, `control-angular-devtools`, `control-pangular-inspector`, `control-vitest-browser-angular`, `verify-*`). |
| the instance registry is `.claude/skills/control-ai-browsers/instances.json` | config | stale | asserted at `plans/angular-ai-devtools-proposals.handoff.md:42`, contradicted by `.commandcode/skills/control-ai-browsers/instances.json` (read; ports 9333/9334/9335/9337/9338). |
| the five instance ports named (chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337, chrome-stable-nano 9338) match the registry's `instances` block. | config | verified | `plans/angular-ai-devtools-proposals.handoff.md:42` |
| "`research/00` to `research/17`" as the evidence range | feature | stale | asserted at `plans/angular-ai-devtools-proposals.handoff.md:18`, contradicted by `research/` also holding `18-edge-prevent-auto-signin.md`, `19-languagemodel-in-extension-contexts.md` and `20-built-in-ai-without-flags.md`. |
| the companion package "exports `provideAiDevTools()`, `provideAiNgrxDevTools()`, `provideAiRouterDevTools()`, `provideAiNgrxSignalsDevTools()` and `<scope>/vitest` `cdpAttach()`" | feature | stale | asserted at `plans/angular-ai-devtools-proposals.handoff.md:81`, contradicted by `packages/ai-devtools-companion/package.json` (`exports` has only `"."`) and `packages/ai-devtools-companion/src/index.ts:25` (only `provideAiDevTools`); no file under `packages/**` matches `provideAiNgrxDevTools\|provideAiRouterDevTools\|provideAiNgrxSignalsDevTools\|cdpAttach`. |
| "The `globalThis` key is `ngAiDevTools`" | feature | verified | `packages/ai-devtools-companion/src/facade.ts:10` is `export const FACADE_KEY = 'ngAiDevTools';` (`plans/angular-ai-devtools-proposals.handoff.md:81`). |
| "Review history: `tmp/review/`" and "Lars's original request is verbatim in `tmp/review/lars-request.md`" | feature | stale | asserted at `plans/angular-ai-devtools-proposals.handoff.md:44` and `:10`; `tmp/review` does not exist (`dir /b tmp` lists 30+ other entries, no `review`). |
| the probe and fixture inventory it lists exists | structure | verified | `spikes/probes/bench.js`, `regrade.mjs`, `arg-repair-replay.mjs`, `zone-mode.js`, `effect-writes.js`, `tosignal-node.js`, `ssr-*.js`, `vitest-*`; `spikes/ng222-app`, `spikes/ng222-ssr`, `research/raw/`, `research/s1-results/`, `.project/archive/001-run-unrun-spikes` (`plans/angular-ai-devtools-proposals.handoff.md:30`, `:33`). |

## Doc: plans/gsd-path-handoff-M018.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "M018 `instrument-core` shipped and is archived at `.project/archive/018-instrument-core`" | feature | verified | `dir /b .project\archive` lists `018-instrument-core` (`plans/gsd-path-handoff-M018.md:7`). |
| the banner says M019 "is prepared to `plan/done` on `gsd-path/M019` and is ready for `build`" | structure | stale | asserted at `plans/gsd-path-handoff-M018.md:8`; `git branch -a` has no `gsd-path/M019` (current branch is `gsd-path/M052`) and `.project/archive/019-context-and-jobs` exists, so M019 has shipped. |
| "Frozen inventory: **143 documents** from `check_docs_audit.py --repo <root> --emit-inventory`" | feature | stale | asserted at `plans/gsd-path-handoff-M018.md:52`, contradicted by running that command: `python -B "%USERPROFILE%\.commandcode\skills\gsd-path\scripts\check_docs_audit.py" --repo D:\projects\sandbox\angular-ai-devtools --emit-inventory \| find /c /v ""` → 113. |
| `workflow_run.py prepare-inspect` is said to refuse because `.project/research/DOCS-AUDIT.md` exists | structure | verified | that file exists (`dir /b .project\research` → `DOCS-AUDIT.md`, `INSPECT-DELTA.md`, `parts`), so the stated precondition is real (`plans/gsd-path-handoff-M018.md:50`); the refusal itself was not run (see unverifiable below). |
| `pipeline_state.py`, `isolation.py`, `workflow_run.py` exist at the quoted path under `%USERPROFILE%\.commandcode\skills\gsd-path\scripts`, and `INSPECT.md` has 192 lines, so lines 84–111 exist. | structure | verified | `plans/gsd-path-handoff-M018.md:41`, `:52`, `:57` |
| "`isolation.py isolate-verify` requires `--repo --base --name`, and `--base` must be a full 40-character SHA" | command | verified | `isolation.py:5902-5906` defines `isolate-verify` with required `--base` and `--name`, and `isolation.py:163` raises "base must be a full 40-character SHA" (`plans/gsd-path-handoff-M018.md:57`). |
| "Panel initial-bundle budget is **520 KB** (`project.json`, `build-extension`)" | config | verified | `apps/angular-ai-devtools/project.json` `targets.build-extension.options.budgets[0]` is `maximumWarning: "520kb"` (`plans/gsd-path-handoff-M018.md:67`). |
| "M018's envelope must be validated by **six hostile tools**" | feature | verified | `plans/angular-ai-devtools-program-backlog.md:105` says "six hostile tools pass — one write with confirm, one async handle, one image…" (`plans/gsd-path-handoff-M018.md:73`). |
| the `prepare-inspect` refusal and the `gsd report` / `pipeline_state.py route` readings | structure | unverifiable | needs running the pipeline scripts, which mutates pipeline state (`plans/gsd-path-handoff-M018.md:5`, `:50`). |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "each check gives its own `control.mjs` call 600 s (`spawnSync` `timeout: 600000` at `.commandcode/skills/verify-ai-browsers/checks/state.mjs:321`)" | config | verified | `state.mjs:321` is `timeout: 600000,` (`references/ai-browsers-verification.md:32`). |
| extension-panel `timeoutMs` 1800000 at `SKILL.md:49` | config | verified | `verify-ai-browsers/SKILL.md:49` carries `timeoutMs` 1800000 (`references/ai-browsers-verification.md:34`). |
| the `state` step's 900000 timeout is cited as `SKILL.md:49,71` | config | stale | asserted at `references/ai-browsers-verification.md:34`; line 71 is the Gotchas bullet "`state` takes about a minute per instance…" and the `900000` sits on `.commandcode/skills/verify-ai-browsers/SKILL.md:72`. |
| `checks/state.mjs` and `checks/extension-panel.mjs` exist under `.commandcode/skills/verify-ai-browsers/checks/`, and `~/.commandcode/skills/lars-verify/scripts/verdict.mjs` exists with a `lint` command (`verdict.mjs:1311`). | command | verified | `references/ai-browsers-verification.md:3`, `:47` |
| "`extension-panel` also needs the panel built (`npx nx run angular-ai-devtools:build-extension`)" | command | verified | that target exists in `apps/angular-ai-devtools/project.json` (`references/ai-browsers-verification.md:19`). |
| "Ports 9333-9338 belong to the shared instances" | config | verified | `instances.json` holds exactly 9333, 9334, 9335, 9337, 9338 (`references/ai-browsers-verification.md:42`). |
| "Check that port 9992 is free" / "no listener on 9992" | config | unverifiable | needs the live playwright-cli session listing; no file under `.commandcode/skills` or `scripts/` names 9992 (a recursive sweep of the skills tree and `scripts/` found no hit), so it is host state, not a tree fact (`references/ai-browsers-verification.md:42`, `:48`). |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the pin documentation it defers to exists | config | verified | `.commandcode/skills/control-ai-browsers/features/model-lifecycle.md` (`references/edge-dev-aion-model.md:4`). |
| the commands it names are real subcommands | command | verified | `model pin`, `model download`, `model init`, `model clear`, `up`, `down`, `doctor`, `instances`, `info` all appear in `.commandcode/skills/control-ai-browsers/SKILL.md:270-285` (`references/edge-dev-aion-model.md:3`, `:45`, `:67`, `:69`). |
| `edge-dev-aion` runs with `--disable-component-update` and pins three roots | structure | verified | `.commandcode/skills/control-ai-browsers/instances.json` gives `args: ["--disable-component-update"]` and `pin: ["EdgeLLMOnDeviceModel","EdgeLLMRuntime","EdgeOptimizationGuideModelsManifest"]` (`references/edge-dev-aion-model.md:80`). |
| "The pin now holds 2026.10.15.1 / 2026.10.12.1 / 2026.10.19.1" | config | verified | `dir /b .commandcode\worktrees\.browsers\edge-dev-aion\EdgeLLMOnDeviceModel` → `2026.10.15.1`; `…\EdgeOptimizationGuideModelsManifest` → `2026.10.19.1` (`references/edge-dev-aion-model.md:49`). |
| "The 2026.10.2.1 folders are still on disk and in `tmp/control-ai-browsers/pins/edge-dev-aion.2026.10.2.1`" | feature | stale | asserted at `references/edge-dev-aion-model.md:51`; neither `tmp/control-ai-browsers/pins` (the repo `tmp` has no `pins` directory) nor `.commandcode/worktrees/tmp/control-ai-browsers/pins` exists, and the skill's `model pin` writes under `.commandcode/worktrees/tmp/control-ai-browsers/pins/<name>` (SKILL.md:278). |
| the Edge component-updater measurements, the per-channel manifest table, the 842-input `model.onnx` reading and the Edge 158 results | config | unverifiable | need Edge Dev/Canary installs and the model binaries (`references/edge-dev-aion-model.md:20`, `:44`, `:91`, `:113`). |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the probe scripts it names all exist | structure | verified | `spikes/probes/probe5.js`, `probe6.js`, `read-throughput.ps1`, `relaunch-instance.ps1`, `seed-perf-class.mjs`, `set-genai-provider.mjs`, `ep-trials.sh`, `tool-name-matrix.js` (`research/00-browser-probe.md:82`, `:189`, `:230`, `:250`, `:272`, `:281`, `:298`). |
| the per-instance port table matches the registry | config | verified | `.browsers/chrome-beta-nano` 9333, `.browsers/chrome-beta-gemma4` 9334, `.browsers/edge-dev-aion` 9335, `.browsers/edge-phi4mini` 9337 (`research/00-browser-probe.md:138-141` vs `.commandcode/skills/control-ai-browsers/instances.json`). |
| the streaming-quirk citation `probe9.js:18-27` holds | structure | verified | lines 18–27 of `spikes/probes/probe9.js` are the `prompt()` then `promptStreaming()` calls inside try blocks (`research/00-browser-probe.md:105`). |
| the S11 answer it points to exists | structure | verified | `research/raw/tool-name-matrix-gemma4-gpu.json` and `research/11-spike-s1-extension-contexts.md` (`research/00-browser-probe.md:300`, `:114`). |
| the flag-state readings, the C:-vs-D: read speeds (1,464/1,558/1,616 MB/s), the NPU and provider trials, and every per-browser model result | config | unverifiable | need the branded browsers with their models (`research/00-browser-probe.md:40`, `:183`, `:254`). |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "Chrome ships `LanguageModel` to extensions (138+) and the web (148+)", structured output stable, tool calling experimental | feature | unverifiable | needs a Chrome/Edge run at those versions (`research/01-built-in-ai-apis.md:7`). |
| "In Edge the prerelease model is **Aion-1.0-Instruct** (no source for '1.1')" | feature | unverifiable | needs Microsoft/Edge sources; this repo's own registry records the model as `Aion-1.1-Instruct` (`instances.json`), which is a naming choice, not a vendor source (`research/01-built-in-ai-apis.md:8`). |
| "WebMCP is now `document.modelContext` … origin trial in Chrome 149 and Edge 150" and the extension-context claim in section 3 | structure | unverifiable | need those browsers; the in-repo confirmation is `research/11` (itself browser-measured) (`research/01-built-in-ai-apis.md:10`, `:126`). |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the probe and raw files it cites exist | structure | verified | `spikes/probes/zone-mode.js`, `research/raw/zone-mode-portal.json`, `research/raw/zone-mode-portal-zonejs.json` (`research/02-angular-surface.md:275`). |
| no local path is claimed broken: every non-existent path in this document is an angular/angular source path (`packages/core/…`, `packages/router/…`, `packages/platform-browser/…`), matched one-for-one against the file's "How `ng` gets populated" section. | structure | verified | `research/02-angular-surface.md:19-24`, `:281`, `:299` |
| the `ng` global inventory, the DevTools call list and the 22.x feature claims | feature | unverifiable | need the Angular 22.2 source tree and a running DevTools session (`research/02-angular-surface.md:28`, `:119`, `:265`). |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the in-repo path it names exists | structure | verified | `docs/feature-proposals.md` (`research/03-prior-art.md:187`). |
| the Pangular, React DevTools, Chrome DevTools AI, Vue/Nuxt/React Scan/Redux/Svelte/Solid/Million entries and the Chrome DevTools MCP tool list | feature | unverifiable | need those repositories and the installed extensions (`research/03-prior-art.md:13`, `:23`, `:164`, `:218`). |
| the Pangular extension inventory `extension/manifest.json`, `background.js`, `content-script.js`, `detect-angular.js`, `devtools.js`, `panel-bridge.js`, `panel-actions.js` | config | unverifiable | those are Pangular's files, not this repository's (`extension/` here holds `manifest.json`, `background.js`, `devtools.js` and none of the other four), so they need the Pangular checkout (`research/03-prior-art.md:31-34`). |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the proposals cross-reference exists | structure | verified | `docs/feature-proposals.md` (`research/04-ecosystem.md:78`). |
| the Vitest version it observed (5.0.3) matches the fixture's install | config | verified | `spikes/ng222-app/package.json` devDependency `vitest: 5.0.3`, `@vitest/browser 5.0.3` (`research/04-ecosystem.md:129`). |
| the NgRx, Analog, Storybook and RxAngular internals, and the vitest.dev page header reading | feature | unverifiable | need those packages and that page (`research/04-ecosystem.md:19`, `:73`, `:100`, `:129`). |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the S16 evidence and probe scripts exist | structure | verified | `research/raw/s16-meta-lookup.json`, `spikes/probes/s2b.js`, `portal-probe.js`, `zone-mode.js`, `bench.js`, `effect-writes.js`, `tool-session-matrix.js`, `regrade.mjs` (`research/05-spikes.md:18`, `:45`, `:56`, `:70`, `:79`, `:116`, `:133`, `:166`). |
| "S17, S18, S19 recorded **blocked** — … no probe script named for these spikes" | feature | stale | asserted at `research/05-spikes.md:220-222`; S19's probe exists: `spikes/probes/arg-repair-replay.mjs` ("Replays every tool call saved by bench.js through a deterministic validate-and-repair step") with evidence `research/raw/arg-repair-replay.json` (both also cited by `docs/feature-proposals.md:511`). |
| the app it describes is the fixture | feature | verified | `spikes/ng222-app` installs `@angular/core` 22.2.2 (`node -p require('…/@angular/core/package.json').version`) and `spikes/ng222-app/src/app/counter.ts` exists (`research/05-spikes.md:25`). |
| the blocked-spike evidence files exist | structure | verified | `research/raw/s17-blocked.json`, `s18-blocked.json`, `s19-blocked.json`, `s14-blocked.json`, `TS1…TS12-blocked.json`, `E1…E13-blocked.json`, `s4-blocked.json` (`research/05-spikes.md:222`, `:226`, `:232`, `:236`). |
| "served with `ng serve --port 4222`" and every measured count in the benchmark tables | command | unverifiable | need the dev server and the model browsers (`research/05-spikes.md:25`, `:77`, `:164`, `:201`). |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "Skill 1: `angular-developer/SKILL.md` (132 lines)" | feature | stale | asserted at `research/06-angular-skills.md:12`, contradicted by `%USERPROFILE%\.commandcode\skills\angular-developer\SKILL.md` being 147 lines (`find /c /v ""`). |
| "Skill 2: `angular-new-app/SKILL.md` (63 lines)" | feature | verified | that skill's `SKILL.md` is 63 lines (`research/06-angular-skills.md:56`). |
| the rule inventory in section 2 and the feature ideas | structure | unverifiable | they depend on reading the two skills' contents against a dev-mode app (`research/06-angular-skills.md:62`, `:108`). |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "System prompt (116 Aion tokens, 528 characters)" | feature | verified | the quoted block measures exactly 528 characters (extracted the fenced block after the heading; `node -e` length count) (`research/07-prompting-small-models.md:235-247`). |
| the correction's probe and evidence exist | structure | verified | `spikes/probes/tool-name-matrix.js`, `research/raw/tool-name-matrix-gemma4-gpu.json` (`research/07-prompting-small-models.md:361`, `:363`). |
| the measured raw files it cites for the benchmark exist | structure | verified | `research/raw/bench/*.json` (`dir /b research\raw\bench` lists `gemma4.json`, `nano.json`, `nano-gpu.json`) (`research/07-prompting-small-models.md:166`). |
| the per-model prompting guidance, the token counts per model and the tool-calling/structured-output behaviour on each model | feature | unverifiable | need the model browsers (`research/07-prompting-small-models.md:48`, `:127`, `:142`). |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the evidence files exist | structure | verified | `research/raw/m036-resource-graph.json`, `research/raw/zone-mode-portal.json`, `research/raw/zone-mode-portal-zonejs.json`, `research/raw/tosignal-node-portal.json`, and `research/02-angular-surface.md` (`research/08-recent-angular-features.md:130`, `:137`, `:145`, `:247`). |
| the version floor statements match installed versions where they are local | config | verified | the workspace runs `@angular/core` 22.1.8 and the fixture 22.2.2, so the "22.1"/"22.2" sorted rows in the features table stay consistent with this tree (`research/08-recent-angular-features.md:114`). |
| the release notes, the CHANGELOG reads (`CL:1-2`, `CL:370-438`, …) and the GitHub release list | feature | unverifiable | the local changelog is not in this repository and no `@angular/core/CHANGELOG.md` ships in `node_modules` (checked both `node_modules` and the fixture's) (`research/08-recent-angular-features.md:50`, `:52`). |
| the "Newer than the local changelog" rows (22.2.1, 22.2.2, 22.3.0-next.0/next.1) | feature | unverifiable | need the Angular repo at their heads (`research/08-recent-angular-features.md:54`). |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the two `research/05-spikes.md` sections it points to exist | structure | verified | "Root cause hunt…" at line 131 and "Prediction confirmed: Nano gets tool sessions with `AIPromptAPIToolUse` alone" at line 153 (`research/09-nano-tool-session-error.md:144`). |
| the `research/10-model-capabilities.md` "Matrix" it points to exists at line 41. | structure | verified | `research/09-nano-tool-session-error.md:144` |
| every Chromium source citation (tag `156.0.8078.17`, `language_model.cc`, `ai_manager.cc`, `runtime_enabled_features.json5`), the spec at commit `8040b81`, crbug 422803232/417817645 and the prompt-api issues | integration | unverifiable | needs those repositories and trackers (`research/09-nano-tool-session-error.md:22`, `:72`, `:89`, `:113`, `:116`). |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the model manifest citation `.commandcode/worktrees/.browsers/chrome-beta-nano/OptGuideOnDeviceModel/2025.8.21.1028/manifest.json` | config | stale | asserted at `research/10-model-capabilities.md:30`, contradicted by `dir /b .commandcode\worktrees\.browsers\chrome-beta-nano\OptGuideOnDeviceModel` → `2025.8.8.1141` only. |
| "`spikes/probes/bench/nano.json`" as a local file | structure | stale | asserted at `research/10-model-capabilities.md:31`; `spikes/probes/` has `bench.js`, `bench-all.sh`, `bench-summary.mjs` but no `bench/` directory, and `git log --all -- spikes/probes/bench` returns nothing, so the path never existed in this repository. |
| "Copy: `research/raw/bench/nano.json`, but the file was overwritten by the second benchmark round" | structure | verified | `research/raw/bench/nano.json` and `nano-gpu.json` both exist (`research/10-model-capabilities.md:31`). |
| the S11 and S16 evidence exists | structure | verified | `research/raw/matrix-nano-tooluse.json`, `research/raw/tool-name-matrix-gemma4-gpu.json`, `spikes/probes/regrade.mjs` (`research/10-model-capabilities.md:45`, `:88`). |
| the vendor model-card readings (H1/H2/G2/GB/MK/C1/C2 cells), the Hugging Face `tokenizer_config.json` lines and the Aion sample repo's `docs/prompt-guide.md` | config | unverifiable | need those external sources (`research/10-model-capabilities.md:26`, `:46`). |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "`spikes/s1-extension/` (retired in M009; evidence and archived notes live under `.project/archive/001-run-unrun-spikes/`)" | feature | verified | `spikes/` holds only `ng222-app`, `ng222-ssr`, `probes`; `.project/archive/001-run-unrun-spikes` exists (`research/11-spike-s1-extension-contexts.md:11`, `:13`). |
| "`probe5.js` … camelCase tool names, `getComponentCount` and `getComponentInputs` (`probe5.js:15-16`)" | structure | verified | `spikes/probes/probe5.js:15-16` are exactly those two tool declarations (`research/11-spike-s1-extension-contexts.md:75`). |
| the phase-2 evidence files exist | structure | verified | `research/s1-results/chrome-fresh.json`, `edge-fresh.json`, `chrome-gemma4.json`, `edge-aion.json`, `chrome-gemma4-crash-doctor.json`, `chrome-gemma4-tool-name-pair.json`, and `research/raw/tool-name-matrix-gemma4-gpu.json` (`research/11-spike-s1-extension-contexts.md:15`, `:54`, `:80`, `:84`). |
| the standing instances and ports it names match the registry | config | verified | `chrome-beta-gemma4` 9334, `edge-dev-aion` 9335 (`research/11-spike-s1-extension-contexts.md:5`). |
| `probe6.js`/`probe10.js` exist in `spikes/probes/`. | structure | verified | `research/11-spike-s1-extension-contexts.md:11` |
| every context-exposure result, the crash counts and the `NotAllowedError` on `devtools_page` | feature | unverifiable | need the branded browsers with their models (`research/11-spike-s1-extension-contexts.md:73`, `:80`). |

## Counts (recomputed; informational, not audited rows)

- verified: 59
- stale: 18
- unverifiable: 23
- aspirational: 0
- total: 100
