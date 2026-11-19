# Chunk 6 — runtime-spike evidence: the legacy/prior-art/SSR/Vitest/Edge notes and the S11–S13 spike answers with their analyses
Audited HEAD: 067dc23ced80abcc535166297084626755f438e4

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "a development build of the 22.2 spike app (unminified, 968 `ngDevMode` references)" | feature | stale | asserted at `research/12-legacy-vs-modern-angular.md:27`, contradicted by `spikes/ng222-app/dist/ng222-app/browser/main.js` now holding 1,029 `ngDevMode` occurrences (`node -e` count over the file), so the bundle was rebuilt after the measurement. |
| "`spike main.js:37258-37267`" and "`spike main.js:37270`" for the `ɵsetClassDebugInfo(Counter, …)` lines | feature | stale | asserted at `research/12-legacy-vs-modern-angular.md:56`, contradicted by `spikes/ng222-app/dist/ng222-app/browser/main.js` being 32,195 lines, so both citations point past EOF. |
| Reading the cited artifact depends on it: the file that `spike main.js` is defined as exists | structure | verified | `spikes/ng222-app/dist/ng222-app/browser/main.js` is present and is the 22.2 fixture build (`research/12-legacy-vs-modern-angular.md:27`). |
| the debug-info payload it quotes holds on the fixture side | structure | verified | `spikes/ng222-app/src/app/counter.ts:15` is `export class Counter {`, matching `filePath: "src/app/counter.ts", lineNumber: 15` (`research/12-legacy-vs-modern-angular.md:56`). |
| the zone-mode evidence it cites exists | structure | verified | `research/raw/zone-mode-portal.json` and `research/raw/zone-mode-portal-zonejs.json` (`research/12-legacy-vs-modern-angular.md:106`, `:120`). |
| the `packages/core/…`, `packages/router/…` and `packages/upgrade/…` line citations | feature | unverifiable | angular/angular source, not this tree (`research/12-legacy-vs-modern-angular.md:11`, `:70`). |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the measured evidence directory `tmp/control-angular-dev-app/portal-4775-2026-10-12T07-18-44-815Z/` | structure | stale | asserted at `research/13-portal-legacy-audit.md:43`; `dir /b tmp\control-angular-dev-app` lists ~110 run directories (`counter-*`, `portal-*`, `ssr-*`, `url-4222-*`) and none is that one. |
| the zoneless-mode evidence exists | structure | verified | `research/raw/zone-mode-portal.json` (`research/13-portal-legacy-audit.md:17`). |
| "Two optimus-ui incompatibilities are drafted in `docs/filing-ledger.md` (6 and 7)" | feature | verified | drafts 6 and 7 are at `docs/filing-ledger.md:189` and `docs/filing-ledger.md:219` (`research/13-portal-legacy-audit.md:43`). |
| every portal file:line (`apps/insurance-portal/project.json:18,10,53`, `libs/claim/…`) and the commits `754aa1e`/`66e8ad6`/`92053b9`/`cc9ce25` | structure | unverifiable | the Insurance Portal checkout is outside this workspace (`research/13-portal-legacy-audit.md:9`, `:17`, `:43`). |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the two in-repo documents it cross-references exist | structure | verified | `docs/feature-proposals.md` (`research/14-ai-devtools-prior-art.md:11`) and `docs/filing-ledger.md` (`:426`). |
| the WebMCP spec at `webmachinelearning/webmcp` `d0e4e0e`, the Chrome WebMCP pages, `GoogleChromeLabs/webmcp-extension` (`extension/content.ts`), playwright-mcp, chrome-devtools-mcp, nuxt-mcp-dev and the Storybook docgen manifest (`docs/definition.ts:359-419`) | config | unverifiable | all external repositories and pages (`research/14-ai-devtools-prior-art.md:79`, `:88`, `:218`, `:234`, `:249`, `:323`). |
| the "measured" labels on Angular's own WebMCP source (`packages/core/src/webmcp/types.ts`, `packages/forms/signals/src/webmcp/registration.ts`) | structure | unverifiable | angular/angular source (`research/14-ai-devtools-prior-art.md:88`, `:90`). |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the attach command is written as `node .claude/skills/control-ai-browsers/scripts/control.mjs attach chrome-beta-gemma4` | command | stale | asserted at `research/15-deterministic-and-ai.md:211`; `~/.claude/skills` has no `control-ai-browsers` and the repository has no `.claude`, while the script exists at `.commandcode/skills/control-ai-browsers/scripts/control.mjs` (its table lists `attach <name>`, `SKILL.md:272`). |
| the tuple/evidence file it cites exists | structure | verified | `research/raw/tosignal-node-portal.json` (`research/15-deterministic-and-ai.md:31`). |
| the retired runner is flagged as retired on the same line and the tree agrees | structure | verified | `spikes/s1-extension/` is absent (`spikes/` holds `ng222-app`, `ng222-ssr`, `probes`) and `.project/archive/001-run-unrun-spikes` exists (`research/15-deterministic-and-ai.md:211`). |
| the worker-context probe steps 1–10 and their "done when" criteria | feature | unverifiable | the spike was not run (`research/15-deterministic-and-ai.md:195-230`). |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| all five probes it names exist | structure | verified | `spikes/probes/ssr-hydration.js`, `ssr-transfer.js`, `ssr-event-replay.js`, `ssr-render-modes.js`, `ssr-defer.js` (`research/16-ssr-runtime.md:220-224`). |
| all five raw files it names exist | structure | verified | `research/raw/ssr-hydration.json`, `ssr-transfer.json`, `ssr-event-replay.json`, `ssr-render-modes.json`, `ssr-defer.json` (`research/16-ssr-runtime.md:38`, `:55`, `:84`, `:116`, `:143`). |
| the fixture endpoint it describes exists | integration | verified | `spikes/ng222-ssr/src/server.ts` is present, so `app.get('/api/items') in src/server.ts` is a real file claim (`research/16-ssr-runtime.md:22`). |
| the SSR measurements themselves (hydration marks, `ng-server-context`/`ngcm`, Transfer State, the absence of `Server-Timing`, the `@defer` and event-replay results) | feature | unverifiable | need the SSR dev server and a browser (`research/16-ssr-runtime.md:34`, `:187`, `:198`). |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the runner "`spikes/probes/vitest-attach.mjs`", including the two run lines that invoke it | structure | stale | asserted at `research/17-vitest-browser-runtime.md:38`, `:124`, `:172`; `dir /b spikes\probes` lists `vitest-lib.mjs` and `vitest-iframe-probe.js` and no `vitest-attach.mjs`. |
| the second probe and the raw evidence exist | structure | verified | `spikes/probes/vitest-iframe-probe.js`, `research/raw/vitest-attach-gemma4.json`, `vitest-chromium-bundled.json`, `vitest-attach-gemma4-newcontext.json`, `vitest-attach-gemma4-doctor-before.json`/`-after.json` (`research/17-vitest-browser-runtime.md:25-39`). |
| the fixture config and the spec it names exist | config | verified | `spikes/ng222-app/vitest-attach.config.mts`, `spikes/ng222-app/src/app/counter.spec.ts` (`research/17-vitest-browser-runtime.md:61`, `:106`). |
| the attach-route results (content scripts in both worlds of the tester iframe, `LanguageModel` present in the iframe, the new-context failure) | structure | unverifiable | need Chrome Beta with Gemma 4 on the attach route (`research/17-vitest-browser-runtime.md:30`, `:81`). |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the skill citation `.commandcode/skills/control-ai-browsers/SKILL.md:311-312` for "the skill relies on the `ms*` switches alone" | feature | stale | asserted at `research/18-edge-prevent-auto-signin.md:8`; line 311 is `## Gotchas` and line 312 is "Measured 2026-10-11/12 unless marked inferred", while the switches are described at `.commandcode/skills/control-ai-browsers/SKILL.md:314-316`. |
| "HKCU Edge policies are deliberately _not_ used" | feature | verified | `reg query "HKCU\Software\Policies\Microsoft\Edge"` returns "ERROR: The system was unable to find the specified registry key or value", so no such policies are applied on this host (`research/18-edge-prevent-auto-signin.md:8`). |
| the `ms*` switch subset it names is what the Edge instances pass | feature | verified | `.commandcode/skills/control-ai-browsers/instances.json` `browsers.edge-dev.browserArgs` contains `msImplicitSignin`, `msImplicitSignInNetworkRetry`, `msProfileSignIn`, `msOneAuthWAM`, `msLoadOneAuthInBackground`, `msSeamlessWebToBrowserSignIn`, `msForceBrowserSignIn`, `msEnableWebToBrowserSignIn`, `msEnableAADWebToBrowserSignIn`, `msEnableProfileAADAccountSSO`, `msEdgeOSAccountInfoSubstrate`, `msPrimaryOSAccountInfoCache`, `msEdgeOSAccountInfoManagerCache`, `msQuickAuthToBrowserSignIn`, `msEdgeSignInAccountPicker`, `msWAMSovereigntySignIn`, `msWAMAdminModeSignIn` (`research/18-edge-prevent-auto-signin.md:49`, `:98`). |
| the Microsoft Learn policy text, WebView2Feedback #5722, the Edge 155/157 auth-library behaviour and the `edge://policy` / `edge://signin-internals` verification steps | feature | unverifiable | need network reads and a live Edge session with those policies applied (`research/18-edge-prevent-auto-signin.md:51`, `:121`, `:129`, `:154`). |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the raw results file exists | structure | verified | `research/raw/19-languagemodel-contexts.json` (`research/19-languagemodel-in-extension-contexts.md:13`). |
| "`ExtensionPromptService` now calls `LanguageModel` in the panel itself" | feature | verified | `apps/angular-ai-devtools/src/app/extension-prompt.service.ts` exists and every panel explainer imports it (`research/19-languagemodel-in-extension-contexts.md:40`). |
| both cross-references exist | structure | verified | `docs/feature-proposals.md` section 3.1 at line 300, and `plans/prompt-api-browser-pairs.afk.md` (`research/19-languagemodel-in-extension-contexts.md:8`, `:38`). |
| the Chromium document `docs/experiments/prompt-api-for-extension.md` and the five browser-model context rows | integration | unverifiable | the document is in the Chromium tree and the rows need those browsers (`research/19-languagemodel-in-extension-contexts.md:31`, `:18`). |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the raw results file exists, including the `workers` section it cites | structure | verified | `research/raw/20-built-in-ai-without-flags.json` (`research/20-built-in-ai-without-flags.md:12`, `:38`). |
| `up <name> --no-ai-features` is a real subcommand form | command | verified | `.commandcode/skills/control-ai-browsers/SKILL.md:271` documents `up <name> [--backend=gpu\|cpu] [--extension=<dir>] [--no-ai-features]` (`research/20-built-in-ai-without-flags.md:19`, `:72`). |
| "Filing draft: `docs/filing-ledger.md` item 11" | feature | verified | draft 11 is at `docs/filing-ledger.md:265` (`research/20-built-in-ai-without-flags.md:53`). |
| the per-context availability matrix, the worker runs, the renderer crash and the Crashpad reports | feature | unverifiable | need the four browsers with their models and no flags (`research/20-built-in-ai-without-flags.md:30`, `:44`, `:53`). |

## Doc: research/spikes/README.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "`.project/research/` holds exactly one file — the carry-forward `DOCS-AUDIT.md`" | structure | stale | asserted at `research/spikes/README.md:17`; `dir /b .project\research` lists `DOCS-AUDIT.md`, `INSPECT-DELTA.md` and `parts`. |
| "that file is 3,352 bytes here" for `s11-answer.md` | structure | verified | `research/spikes/s11-answer.md` measures 3,352 bytes (`research/spikes/README.md:24`). |
| the six documents it tabulates all exist at the paths it gives (`s11-answer.md`, `s12-answer.md`, `s13-answer.md`, `capability-dependency-matrix.md`, `instrumentation-free-coverage.md`, `sourcemap-future-scope.md`). | structure | verified | `research/spikes/README.md:7-15` |
| "`research/raw/m040-work-events.json`" exists, and `archive_milestone.py` contains `require_clean_active_root` (`grep`/read of `%USERPROFILE%\.commandcode\skills\gsd-path\scripts\archive_milestone.py`). | command | verified | `research/spikes/README.md:18`, `:21` |
| "The 16-row capability → application-dependency matrix" | feature | verified | §1 of that file has 16 numbered rows (`research/spikes/README.md:12`). |

## Doc: research/spikes/capability-dependency-matrix.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the matrix has 16 rows and the counts table says `Rows 16` per column | structure | verified | counted the `\| <n> \|` rows between `## 1. Matrix` and `## 2. Counts` (`research/spikes/capability-dependency-matrix.md:63-110`). |
| "`.project/research/m040-performance-narrator.md`" | feature | stale | asserted at `research/spikes/capability-dependency-matrix.md:84`; that path does not exist (`dir /b .project\research`), and the file lives at `.project/archive/040-performance-narrator/research/m040-performance-narrator.md`. |
| the abbreviated citation `mw/error-capture.ts:42-54` resolves to `src/main-world/error-capture.ts:42-54`, which is the `ɵgetOwningComponent` alias branch it describes. | feature | verified | `research/spikes/capability-dependency-matrix.md:127` |

## Doc: research/spikes/instrumentation-free-coverage.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "`(.project/research/capability-dependency-matrix.md:74-84)`" | feature | stale | asserted at `research/spikes/instrumentation-free-coverage.md:60`; that path does not exist and the file is `research/spikes/capability-dependency-matrix.md` (whose rows 6–15 are at lines 75–84). |
| "`(.project/research/m040-performance-narrator.md:207-215)`" | feature | stale | asserted at `research/spikes/instrumentation-free-coverage.md:319`; the file is `.project/archive/040-performance-narrator/research/m040-performance-narrator.md`. |
| the code paths it cites all exist | structure | verified | `extension/agent-main.js`, `stale-view-worker.js`, `manifest.json`, `lint-core.js`, `router-diagnostic.js`, `legacy-structure.js`, `field-state.js`, `redirect-chain.js`, `sanitizer-triage.js`, `after-render.js`, `linked-state.js`, `render-phase.js`, `performance-narrator.js`, `packages/ai-devtools-companion/src/index.ts`, `spikes/ng222-app/src/app/app.config.dev.ts` (`research/spikes/instrumentation-free-coverage.md:32-101`). |

## Doc: research/spikes/s11-answer.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "the two console joins cut the stack before reading anything (`extension/lint-core.js:100,124`, `extension/router-diagnostic.js:52,66`)" | feature | verified | `lint-core.js:100` and `router-diagnostic.js:52` are `const STACK_FRAME = /\n\s+at\s/;`, and lines 124/66 are `function bodyOf(text)` (`research/spikes/s11-answer.md:41`). |
| "Measured over the sixteen shipped/repository features in `.project/research/capability-dependency-matrix.md`" | feature | stale | asserted at `research/spikes/s11-answer.md:36`; that path does not exist; the file is `research/spikes/capability-dependency-matrix.md`. |
| "the zoneless portal's production build emits 0 `.map` files and only `development` sets `sourceMap` in `apps/insurance-portal/project.json`" | structure | unverifiable | needs the portal checkout and its production build (`research/spikes/s11-answer.md:50`). |

## Doc: research/spikes/s12-answer.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "(`lift 0 / narrow 0 / changes nothing 16`, `.project/research/capability-dependency-matrix.md` §3)" | feature | stale | asserted at `research/spikes/s12-answer.md:4`; that path does not exist; the file is `research/spikes/capability-dependency-matrix.md` (its §3 is at line 152). |
| the panel file it names exists | structure | verified | `extension/panel/index.html` (`research/spikes/s12-answer.md:449`). |
| the portal build measurements behind the insight-class answer (resolvable `main-*.js.map` with embedded `sourcesContent`, AOT template mapping precision) | feature | unverifiable | need the portal checkout and a build (`research/spikes/s12-answer.md:33`). |

## Doc: research/spikes/s13-answer.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "8 streams, 7 reachable with no app cooperation" | feature | verified | the stream table has 8 numbered rows and the verdict reads "Seven of eight streams are reachable" (`research/spikes/s13-answer.md:100-228`, `:390`). |
| "Rows are the matrix's rows (`.project/research/capability-dependency-matrix.md` §1)" | feature | stale | asserted at `research/spikes/s13-answer.md:315`; that path does not exist; the file is `research/spikes/capability-dependency-matrix.md`. |
| the target section names `tmp/control-angular-dev-app/state/portal.json` | structure | stale | asserted at `research/spikes/s13-answer.md:34`; `tmp/control-angular-dev-app/state/` exists but is empty, and no run directory under `tmp/control-angular-dev-app` holds a `state/portal.json`. |
| the two control scripts it names exist | structure | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs` and `.commandcode/skills/control-ai-browsers/scripts/control.mjs` (`research/spikes/s13-answer.md:18`, `:22`). |

## Doc: research/spikes/sourcemap-future-scope.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the legend rows `\| \`MX\` \| .project/research/capability-dependency-matrix.md \|` and `\| \`IFC\` \| .project/research/instrumentation-free-coverage.md \|` | feature | stale | asserted at `research/spikes/sourcemap-future-scope.md:24-25`; neither path exists and both files are under `research/spikes/`. |
| the two documents it measures against exist | structure | verified | `.project/ROADMAP.md` and `plans/angular-ai-devtools-program-backlog.md` (`research/spikes/sourcemap-future-scope.md:22-23`). |
| the `bM0xx` milestone ranges it cites are the backlog's generations 3–7 numbering | feature | verified | the backlog has generations 2–7 at lines 212–292, and the file's `bM043`–`bM132` bands are its own labels for them (`research/spikes/sourcemap-future-scope.md:184`, `:231`, `:270`, `:304`). |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "This project was generated using Angular CLI version 22.2.2" | command | verified | `spikes/ng222-app/node_modules/@angular/cli/package.json` reports version 22.2.2 (`spikes/ng222-app/README.md:3`). |
| `ng serve` on `http://localhost:4200/` and `ng test` with Vitest | command | verified | `angular.json` `projects.ng222-app.architect` has `serve` with no port override (CLI default 4200) and `test` with builder `@angular/build:unit-test`, and the fixture installs `vitest 5.0.3` (`spikes/ng222-app/README.md:7-11`, `:39-45`). |
| "For end-to-end (e2e) testing, run: `ng e2e`" | command | stale | asserted at `spikes/ng222-app/README.md:47-52`; `angular.json` `projects.ng222-app.architect` has only `build`, `serve` and `test`, so there is no `e2e` target for that command to run. |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "This fixture was generated with `--skip-tests` and tracks no `*.spec.ts`" | structure | verified | a recursive scan of `spikes/ng222-ssr` (skipping `node_modules`/`dist`) returns zero `*.spec.ts`, and `angular.json` has no `test` target (`spikes/ng222-ssr/README.md:41-45`). |
| "For end-to-end (e2e) testing, run: `ng e2e`" | command | stale | asserted at `spikes/ng222-ssr/README.md:47-52`; `angular.json` `projects.ng222-ssr.architect` has `build` and `serve` only. |
| "generated using Angular CLI version 22.2.2" | command | unverifiable | the fixture has no `node_modules` installed (`spikes/ng222-ssr/node_modules` is absent), so the generating CLI cannot be confirmed; `package.json` declares `@angular/cli ^22.2.2` (`spikes/ng222-ssr/README.md:3`). |

## Counts (recomputed; informational, not audited rows)

- verified: 37
- stale: 17
- unverifiable: 13
- aspirational: 0
- total: 67
