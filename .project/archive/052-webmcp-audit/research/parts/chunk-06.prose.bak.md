# Chunk 6 — runtime-spike evidence: the legacy/prior-art/SSR/Vitest/Edge notes and the S11–S13 spike answers with their analyses

Audited HEAD: 067dc23ced80abcc535166297084626755f438e4

Scope: lines 101–118 of `.project/research/parts/inventory.txt` (18 documents). Every claim below was checked against this checkout at the HEAD above; commands were run in `D:\projects\sandbox\angular-ai-devtools`.

## research/12-legacy-vs-modern-angular.md

- stale: "a development build of the 22.2 spike app (unminified, 968 `ngDevMode` references)" — asserted at `research/12-legacy-vs-modern-angular.md:27`, contradicted by `spikes/ng222-app/dist/ng222-app/browser/main.js` now holding 1,029 `ngDevMode` occurrences (`node -e` count over the file), so the bundle was rebuilt after the measurement.
- stale: "`spike main.js:37258-37267`" and "`spike main.js:37270`" for the `ɵsetClassDebugInfo(Counter, …)` lines — asserted at `research/12-legacy-vs-modern-angular.md:56`, contradicted by `spikes/ng222-app/dist/ng222-app/browser/main.js` being 32,195 lines, so both citations point past EOF.
- current: the file that `spike main.js` is defined as exists — `spikes/ng222-app/dist/ng222-app/browser/main.js` is present and is the 22.2 fixture build (`research/12-legacy-vs-modern-angular.md:27`).
- current: the debug-info payload it quotes holds on the fixture side — `spikes/ng222-app/src/app/counter.ts:15` is `export class Counter {`, matching `filePath: "src/app/counter.ts", lineNumber: 15` (`research/12-legacy-vs-modern-angular.md:56`).
- current: the zone-mode evidence it cites exists — `research/raw/zone-mode-portal.json` and `research/raw/zone-mode-portal-zonejs.json` (`research/12-legacy-vs-modern-angular.md:106`, `:120`).
- unverifiable: the `packages/core/…`, `packages/router/…` and `packages/upgrade/…` line citations — angular/angular source, not this tree (`research/12-legacy-vs-modern-angular.md:11`, `:70`).

## research/13-portal-legacy-audit.md

- stale: the measured evidence directory `tmp/control-angular-dev-app/portal-4775-2026-10-12T07-18-44-815Z/` — asserted at `research/13-portal-legacy-audit.md:43`; `dir /b tmp\control-angular-dev-app` lists ~110 run directories (`counter-*`, `portal-*`, `ssr-*`, `url-4222-*`) and none is that one.
- current: the zoneless-mode evidence exists — `research/raw/zone-mode-portal.json` (`research/13-portal-legacy-audit.md:17`).
- current: "Two optimus-ui incompatibilities are drafted in `docs/filing-ledger.md` (6 and 7)" — drafts 6 and 7 are at `docs/filing-ledger.md:189` and `docs/filing-ledger.md:219` (`research/13-portal-legacy-audit.md:43`).
- unverifiable: every portal file:line (`apps/insurance-portal/project.json:18,10,53`, `libs/claim/…`) and the commits `754aa1e`/`66e8ad6`/`92053b9`/`cc9ce25` — the Insurance Portal checkout is outside this workspace (`research/13-portal-legacy-audit.md:9`, `:17`, `:43`).

## research/14-ai-devtools-prior-art.md

- current: the two in-repo documents it cross-references exist — `docs/feature-proposals.md` (`research/14-ai-devtools-prior-art.md:11`) and `docs/filing-ledger.md` (`:426`).
- unverifiable: the WebMCP spec at `webmachinelearning/webmcp` `d0e4e0e`, the Chrome WebMCP pages, `GoogleChromeLabs/webmcp-extension` (`extension/content.ts`), playwright-mcp, chrome-devtools-mcp, nuxt-mcp-dev and the Storybook docgen manifest (`docs/definition.ts:359-419`) — all external repositories and pages (`research/14-ai-devtools-prior-art.md:79`, `:88`, `:218`, `:234`, `:249`, `:323`).
- unverifiable: the "measured" labels on Angular's own WebMCP source (`packages/core/src/webmcp/types.ts`, `packages/forms/signals/src/webmcp/registration.ts`) — angular/angular source (`research/14-ai-devtools-prior-art.md:88`, `:90`).

## research/15-deterministic-and-ai.md

- stale: the attach command is written as `node .claude/skills/control-ai-browsers/scripts/control.mjs attach chrome-beta-gemma4` — asserted at `research/15-deterministic-and-ai.md:211`; `~/.claude/skills` has no `control-ai-browsers` and the repository has no `.claude`, while the script exists at `.commandcode/skills/control-ai-browsers/scripts/control.mjs` (its table lists `attach <name>`, `SKILL.md:272`).
- current: the tuple/evidence file it cites exists — `research/raw/tosignal-node-portal.json` (`research/15-deterministic-and-ai.md:31`).
- current: the retired runner is flagged as retired on the same line and the tree agrees — `spikes/s1-extension/` is absent (`spikes/` holds `ng222-app`, `ng222-ssr`, `probes`) and `.project/archive/001-run-unrun-spikes` exists (`research/15-deterministic-and-ai.md:211`).
- unverifiable: the worker-context probe steps 1–10 and their "done when" criteria — the spike was not run (`research/15-deterministic-and-ai.md:195-230`).

## research/16-ssr-runtime.md

- current: all five probes it names exist — `spikes/probes/ssr-hydration.js`, `ssr-transfer.js`, `ssr-event-replay.js`, `ssr-render-modes.js`, `ssr-defer.js` (`research/16-ssr-runtime.md:220-224`).
- current: all five raw files it names exist — `research/raw/ssr-hydration.json`, `ssr-transfer.json`, `ssr-event-replay.json`, `ssr-render-modes.json`, `ssr-defer.json` (`research/16-ssr-runtime.md:38`, `:55`, `:84`, `:116`, `:143`).
- current: the fixture endpoint it describes exists — `spikes/ng222-ssr/src/server.ts` is present, so `app.get('/api/items') in src/server.ts` is a real file claim (`research/16-ssr-runtime.md:22`).
- unverifiable: the SSR measurements themselves (hydration marks, `ng-server-context`/`ngcm`, Transfer State, the absence of `Server-Timing`, the `@defer` and event-replay results) — need the SSR dev server and a browser (`research/16-ssr-runtime.md:34`, `:187`, `:198`).

## research/17-vitest-browser-runtime.md

- stale: the runner "`spikes/probes/vitest-attach.mjs`", including the two run lines that invoke it — asserted at `research/17-vitest-browser-runtime.md:38`, `:124`, `:172`; `dir /b spikes\probes` lists `vitest-lib.mjs` and `vitest-iframe-probe.js` and no `vitest-attach.mjs`.
- current: the second probe and the raw evidence exist — `spikes/probes/vitest-iframe-probe.js`, `research/raw/vitest-attach-gemma4.json`, `vitest-chromium-bundled.json`, `vitest-attach-gemma4-newcontext.json`, `vitest-attach-gemma4-doctor-before.json`/`-after.json` (`research/17-vitest-browser-runtime.md:25-39`).
- current: the fixture config and the spec it names exist — `spikes/ng222-app/vitest-attach.config.mts`, `spikes/ng222-app/src/app/counter.spec.ts` (`research/17-vitest-browser-runtime.md:61`, `:106`).
- unverifiable: the attach-route results (content scripts in both worlds of the tester iframe, `LanguageModel` present in the iframe, the new-context failure) — need Chrome Beta with Gemma 4 on the attach route (`research/17-vitest-browser-runtime.md:30`, `:81`).

## research/18-edge-prevent-auto-signin.md

- stale: the skill citation `.commandcode/skills/control-ai-browsers/SKILL.md:311-312` for "the skill relies on the `ms*` switches alone" — asserted at `research/18-edge-prevent-auto-signin.md:8`; line 311 is `## Gotchas` and line 312 is "Measured 2026-10-11/12 unless marked inferred", while the switches are described at `.commandcode/skills/control-ai-browsers/SKILL.md:314-316`.
- current: "HKCU Edge policies are deliberately _not_ used" — `reg query "HKCU\Software\Policies\Microsoft\Edge"` returns "ERROR: The system was unable to find the specified registry key or value", so no such policies are applied on this host (`research/18-edge-prevent-auto-signin.md:8`).
- current: the `ms*` switch subset it names is what the Edge instances pass — `.commandcode/skills/control-ai-browsers/instances.json` `browsers.edge-dev.browserArgs` contains `msImplicitSignin`, `msImplicitSignInNetworkRetry`, `msProfileSignIn`, `msOneAuthWAM`, `msLoadOneAuthInBackground`, `msSeamlessWebToBrowserSignIn`, `msForceBrowserSignIn`, `msEnableWebToBrowserSignIn`, `msEnableAADWebToBrowserSignIn`, `msEnableProfileAADAccountSSO`, `msEdgeOSAccountInfoSubstrate`, `msPrimaryOSAccountInfoCache`, `msEdgeOSAccountInfoManagerCache`, `msQuickAuthToBrowserSignIn`, `msEdgeSignInAccountPicker`, `msWAMSovereigntySignIn`, `msWAMAdminModeSignIn` (`research/18-edge-prevent-auto-signin.md:49`, `:98`).
- unverifiable: the Microsoft Learn policy text, WebView2Feedback #5722, the Edge 155/157 auth-library behaviour and the `edge://policy` / `edge://signin-internals` verification steps — need network reads and a live Edge session with those policies applied (`research/18-edge-prevent-auto-signin.md:51`, `:121`, `:129`, `:154`).

## research/19-languagemodel-in-extension-contexts.md

- current: the raw results file exists — `research/raw/19-languagemodel-contexts.json` (`research/19-languagemodel-in-extension-contexts.md:13`).
- current: "`ExtensionPromptService` now calls `LanguageModel` in the panel itself" — `apps/angular-ai-devtools/src/app/extension-prompt.service.ts` exists and every panel explainer imports it (`research/19-languagemodel-in-extension-contexts.md:40`).
- current: both cross-references exist — `docs/feature-proposals.md` section 3.1 at line 300, and `plans/prompt-api-browser-pairs.afk.md` (`research/19-languagemodel-in-extension-contexts.md:8`, `:38`).
- unverifiable: the Chromium document `docs/experiments/prompt-api-for-extension.md` and the five browser-model context rows — the document is in the Chromium tree and the rows need those browsers (`research/19-languagemodel-in-extension-contexts.md:31`, `:18`).

## research/20-built-in-ai-without-flags.md

- current: the raw results file exists, including the `workers` section it cites — `research/raw/20-built-in-ai-without-flags.json` (`research/20-built-in-ai-without-flags.md:12`, `:38`).
- current: `up <name> --no-ai-features` is a real subcommand form — `.commandcode/skills/control-ai-browsers/SKILL.md:271` documents `up <name> [--backend=gpu|cpu] [--extension=<dir>] [--no-ai-features]` (`research/20-built-in-ai-without-flags.md:19`, `:72`).
- current: "Filing draft: `docs/filing-ledger.md` item 11" — draft 11 is at `docs/filing-ledger.md:265` (`research/20-built-in-ai-without-flags.md:53`).
- unverifiable: the per-context availability matrix, the worker runs, the renderer crash and the Crashpad reports — need the four browsers with their models and no flags (`research/20-built-in-ai-without-flags.md:30`, `:44`, `:53`).

## research/spikes/README.md

- stale: "`.project/research/` holds exactly one file — the carry-forward `DOCS-AUDIT.md`" — asserted at `research/spikes/README.md:17`; `dir /b .project\research` lists `DOCS-AUDIT.md`, `INSPECT-DELTA.md` and `parts`.
- current: "that file is 3,352 bytes here" for `s11-answer.md` — `research/spikes/s11-answer.md` measures 3,352 bytes (`research/spikes/README.md:24`).
- current: the six documents it tabulates all exist at the paths it gives (`s11-answer.md`, `s12-answer.md`, `s13-answer.md`, `capability-dependency-matrix.md`, `instrumentation-free-coverage.md`, `sourcemap-future-scope.md`) (`research/spikes/README.md:7-15`).
- current: "`research/raw/m040-work-events.json`" exists, and `archive_milestone.py` contains `require_clean_active_root` (`grep`/read of `%USERPROFILE%\.commandcode\skills\gsd-path\scripts\archive_milestone.py`) (`research/spikes/README.md:18`, `:21`).
- current: "The 16-row capability → application-dependency matrix" — §1 of that file has 16 numbered rows (`research/spikes/README.md:12`).

## research/spikes/capability-dependency-matrix.md

- current: the matrix has 16 rows and the counts table says `Rows 16` per column — counted the `| <n> |` rows between `## 1. Matrix` and `## 2. Counts` (`research/spikes/capability-dependency-matrix.md:63-110`).
- stale: "`.project/research/m040-performance-narrator.md`" — asserted at `research/spikes/capability-dependency-matrix.md:84`; that path does not exist (`dir /b .project\research`), and the file lives at `.project/archive/040-performance-narrator/research/m040-performance-narrator.md`.
- current: the abbreviated citation `mw/error-capture.ts:42-54` resolves to `src/main-world/error-capture.ts:42-54`, which is the `ɵgetOwningComponent` alias branch it describes (`research/spikes/capability-dependency-matrix.md:127`).

## research/spikes/instrumentation-free-coverage.md

- stale: "`(.project/research/capability-dependency-matrix.md:74-84)`" — asserted at `research/spikes/instrumentation-free-coverage.md:60`; that path does not exist and the file is `research/spikes/capability-dependency-matrix.md` (whose rows 6–15 are at lines 75–84).
- stale: "`(.project/research/m040-performance-narrator.md:207-215)`" — asserted at `research/spikes/instrumentation-free-coverage.md:319`; the file is `.project/archive/040-performance-narrator/research/m040-performance-narrator.md`.
- current: the code paths it cites all exist — `extension/agent-main.js`, `stale-view-worker.js`, `manifest.json`, `lint-core.js`, `router-diagnostic.js`, `legacy-structure.js`, `field-state.js`, `redirect-chain.js`, `sanitizer-triage.js`, `after-render.js`, `linked-state.js`, `render-phase.js`, `performance-narrator.js`, `packages/ai-devtools-companion/src/index.ts`, `spikes/ng222-app/src/app/app.config.dev.ts` (`research/spikes/instrumentation-free-coverage.md:32-101`).

## research/spikes/s11-answer.md

- current: "the two console joins cut the stack before reading anything (`extension/lint-core.js:100,124`, `extension/router-diagnostic.js:52,66`)" — `lint-core.js:100` and `router-diagnostic.js:52` are `const STACK_FRAME = /\n\s+at\s/;`, and lines 124/66 are `function bodyOf(text)` (`research/spikes/s11-answer.md:41`).
- stale: "Measured over the sixteen shipped/repository features in `.project/research/capability-dependency-matrix.md`" — asserted at `research/spikes/s11-answer.md:36`; that path does not exist; the file is `research/spikes/capability-dependency-matrix.md`.
- unverifiable: "the zoneless portal's production build emits 0 `.map` files and only `development` sets `sourceMap` in `apps/insurance-portal/project.json`" — needs the portal checkout and its production build (`research/spikes/s11-answer.md:50`).

## research/spikes/s12-answer.md

- stale: "(`lift 0 / narrow 0 / changes nothing 16`, `.project/research/capability-dependency-matrix.md` §3)" — asserted at `research/spikes/s12-answer.md:4`; that path does not exist; the file is `research/spikes/capability-dependency-matrix.md` (its §3 is at line 152).
- current: the panel file it names exists — `extension/panel/index.html` (`research/spikes/s12-answer.md:449`).
- unverifiable: the portal build measurements behind the insight-class answer (resolvable `main-*.js.map` with embedded `sourcesContent`, AOT template mapping precision) — need the portal checkout and a build (`research/spikes/s12-answer.md:33`).

## research/spikes/s13-answer.md

- current: "8 streams, 7 reachable with no app cooperation" — the stream table has 8 numbered rows and the verdict reads "Seven of eight streams are reachable" (`research/spikes/s13-answer.md:100-228`, `:390`).
- stale: "Rows are the matrix's rows (`.project/research/capability-dependency-matrix.md` §1)" — asserted at `research/spikes/s13-answer.md:315`; that path does not exist; the file is `research/spikes/capability-dependency-matrix.md`.
- stale: the target section names `tmp/control-angular-dev-app/state/portal.json` — asserted at `research/spikes/s13-answer.md:34`; `tmp/control-angular-dev-app/state/` exists but is empty, and no run directory under `tmp/control-angular-dev-app` holds a `state/portal.json`.
- current: the two control scripts it names exist — `.commandcode/skills/control-angular-dev-app/scripts/control.mjs` and `.commandcode/skills/control-ai-browsers/scripts/control.mjs` (`research/spikes/s13-answer.md:18`, `:22`).

## research/spikes/sourcemap-future-scope.md

- stale: the legend rows `| \`MX\` | .project/research/capability-dependency-matrix.md |` and `| \`IFC\` | .project/research/instrumentation-free-coverage.md |` — asserted at `research/spikes/sourcemap-future-scope.md:24-25`; neither path exists and both files are under `research/spikes/`.
- current: the two documents it measures against exist — `.project/ROADMAP.md` and `plans/angular-ai-devtools-program-backlog.md` (`research/spikes/sourcemap-future-scope.md:22-23`).
- current: the `bM0xx` milestone ranges it cites are the backlog's generations 3–7 numbering — the backlog has generations 2–7 at lines 212–292, and the file's `bM043`–`bM132` bands are its own labels for them (`research/spikes/sourcemap-future-scope.md:184`, `:231`, `:270`, `:304`).

## spikes/ng222-app/README.md

- current: "This project was generated using Angular CLI version 22.2.2" — `spikes/ng222-app/node_modules/@angular/cli/package.json` reports version 22.2.2 (`spikes/ng222-app/README.md:3`).
- current: `ng serve` on `http://localhost:4200/` and `ng test` with Vitest — `angular.json` `projects.ng222-app.architect` has `serve` with no port override (CLI default 4200) and `test` with builder `@angular/build:unit-test`, and the fixture installs `vitest 5.0.3` (`spikes/ng222-app/README.md:7-11`, `:39-45`).
- stale: "For end-to-end (e2e) testing, run: `ng e2e`" — asserted at `spikes/ng222-app/README.md:47-52`; `angular.json` `projects.ng222-app.architect` has only `build`, `serve` and `test`, so there is no `e2e` target for that command to run.

## spikes/ng222-ssr/README.md

- current: "This fixture was generated with `--skip-tests` and tracks no `*.spec.ts`" — a recursive scan of `spikes/ng222-ssr` (skipping `node_modules`/`dist`) returns zero `*.spec.ts`, and `angular.json` has no `test` target (`spikes/ng222-ssr/README.md:41-45`).
- stale: "For end-to-end (e2e) testing, run: `ng e2e`" — asserted at `spikes/ng222-ssr/README.md:47-52`; `angular.json` `projects.ng222-ssr.architect` has `build` and `serve` only.
- unverifiable: "generated using Angular CLI version 22.2.2" — the fixture has no `node_modules` installed (`spikes/ng222-ssr/node_modules` is absent), so the generating CLI cannot be confirmed; `package.json` declares `@angular/cli ^22.2.2` (`spikes/ng222-ssr/README.md:3`).

## Counts

| Verdict | Claims |
| --- | ---: |
| current | 37 |
| stale | 17 |
| unverifiable | 13 |
| **total** | **67** |
