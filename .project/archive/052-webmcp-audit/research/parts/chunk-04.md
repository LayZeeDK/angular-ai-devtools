# Chunk 4 — agent-facing skill docs (Nx + the three `verify-*` skills), the `.commandcode/taste/` set, and the project's own records
Audited HEAD: 067dc23ced80abcc535166297084626755f438e4

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "Use `nx show projects` to list projects in the workspace." | structure | verified | ran `npx nx show projects --json`, output `["ai-devtools-companion","angular-ai-devtools-e2e","angular-ai-devtools","angular-ai-devtools-workspace"]` (`.commandcode/skills/nx-workspace/SKILL.md:14`) |
| "filters support explicit names, glob patterns, tag references, directories, and negation" with `-p/--projects`, `--withTarget`, `--type`, `--exclude`, `--affected`, `--json` | command | verified | ran `npx nx show projects --help`; it lists `-p, --projects`, `-t, --withTarget`, `--type [app\|lib\|e2e]`, `--exclude`, `--affected`, `--json`, `--uncommitted`, `--untracked`, `--base`, `--head` (`.commandcode/skills/nx-workspace/SKILL.md:16`) |
| "Use `nx show project <name> --json` to get the full resolved configuration … including inferred targets from plugins" | command | verified | `apps/angular-ai-devtools-e2e/project.json:11` is `"targets": {}` while `nx.json:24-31` registers `@nx/playwright/plugin` with `"targetName": "e2e"`, so the `e2e` target exists only by inference (`.commandcode/skills/nx-workspace/SKILL.md:48`) |
| "`targetDefaults` — Default configuration applied to all targets of a given name" and "`plugins` — Nx plugins and their configuration" | config | verified | `nx.json:3-20` holds `targetDefaults` keyed by `build`, `@angular/build:application` and `@angular/build:unit-test`; `nx.json:24-31` holds the plugin array (`.commandcode/skills/nx-workspace/SKILL.md:111`) |
| "You can read the full project schema at `node_modules/nx/schemas/project-schema.json`" (and the `nx-schema.json` sibling at `:88`) | structure | verified | `dir` finds both files under the installed Nx 23.3 (`.commandcode/skills/nx-workspace/SKILL.md:52`) |
| the `jq` pipelines are runnable on this host | feature | verified | `where jq` answers `C:\Users\LarsGyrupBrinkNielse\AppData\Local\Microsoft\WinGet\Links\jq.exe` (`.commandcode/skills/nx-workspace/SKILL.md:143`) |
| "`nx graph --print`" returns the project graph | feature | unverifiable | needs an `nx graph` run; not executed in this audit (`.commandcode/skills/nx-workspace/SKILL.md:227`) |
| "`nx sync`" then "`nx reset` if sync doesn't fix stale cache" | feature | unverifiable | `nx reset` clears the daemon and cache for every later command this session, so it was not run (`.commandcode/skills/nx-workspace/SKILL.md:285-286`) |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| every listed flag exists | config | verified | ran `npx nx show projects --help`: `--affected`, `--base`, `--head`, `--type`, `--exclude`, `--uncommitted`, `--untracked` are all documented there (`.commandcode/skills/nx-workspace/references/AFFECTED.md:5-27`) |
| `--exclude="*-e2e"` names this workspace's e2e project | structure | verified | `apps/angular-ai-devtools-e2e/project.json:2` is `"name": "angular-ai-devtools-e2e"`, which the glob matches (`.commandcode/skills/nx-workspace/references/AFFECTED.md:17`) |
| `--type app` selects on `projectType` | feature | verified | `apps/angular-ai-devtools-e2e/project.json:4` is `"projectType": "application"` (`.commandcode/skills/nx-workspace/references/AFFECTED.md:14`) |
| `--base=main` and `--base=origin/main` both resolve here | feature | verified | `git branch -a` lists `main` and `remotes/origin/main` (`.commandcode/skills/nx-workspace/references/AFFECTED.md:9-10`) |
| "Affected between two commits … `--base=abc123 --head=def456`" | feature | unverifiable | needs two chosen commits and an affected computation; not run (`.commandcode/skills/nx-workspace/references/AFFECTED.md:12`) |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "Each check exits 0 pass, 1 claim failed, 2 could not run" | command | verified | every one of the eight check headers ends with that exact sentence, e.g. `.commandcode/skills/verify-ai-browsers/checks/state.mjs:11` (`// Exit 0 pass; 1 with \`Error: CLAIM: ...\` when the claim fails; 2 when it could not run.`), and the same line at `error-explainer.mjs:12`, `extension-panel.mjs:13`, `interop.mjs:14`, `stale-view.mjs:11`, `di-doctor.mjs:12`, `signal-provenance.mjs:12`, `model-init.mjs:10` (`.commandcode/skills/verify-ai-browsers/SKILL.md:3`) |
| the eight standalone command lines name real modules | command | verified | `dir` of `.commandcode/skills/verify-ai-browsers/checks` lists exactly `state.mjs`, `model-init.mjs`, `extension-panel.mjs`, `signal-provenance.mjs`, `di-doctor.mjs`, `error-explainer.mjs`, `stale-view.mjs`, `interop.mjs` (plus one `.test.mjs` each) (`.commandcode/skills/verify-ai-browsers/SKILL.md:59-66`) |
| the named artifacts are the ones the checks write | feature | verified | `state.json` (`checks/state.mjs:10`), `model-init.json` (`model-init.mjs:9`), `extension-panel.json` (`extension-panel.mjs:12`), `error-explainer.json` (`error-explainer.mjs:11`) (`.commandcode/skills/verify-ai-browsers/SKILL.md:25-28`, `:38`) |
| `check-teardown.mjs {runDir}/steps/teardown-<n>.out --artifact …` resolves | feature | verified | the script ships at `~/.commandcode/skills/lars-create-verification/scripts/check-teardown.mjs` (`dir` of that skill) (`.commandcode/skills/verify-ai-browsers/SKILL.md:56`) |
| the setup builds the panel with `npx nx run angular-ai-devtools:build-extension` | command | verified | the target is declared at `apps/angular-ai-devtools/project.json:64` (`.commandcode/skills/verify-ai-browsers/SKILL.md:44`) |
| `C model download <instance> --timeout-min=45` is the driver's own default | command | verified | `control.mjs:297` documents "`model download`'s time budgets: the page polls for `--timeout-min` (default 45) minutes after its click" (`.commandcode/skills/verify-ai-browsers/SKILL.md:41`) |
| the extension-panel setup names `control-angular-dev-app up --target counter` and that target exists | command | verified | `control-angular-dev-app/scripts/control.mjs:114` declares `counter:` (`.commandcode/skills/verify-ai-browsers/SKILL.md:18`) |
| the row claims themselves (`state`, `model-init`, `extension-panel`, `signal-provenance`, `di-doctor`, `error-explainer`, `stale-view`, `interop` each exiting 0 on a named instance) | feature | unverifiable | need running Chrome Beta / Edge Dev / Edge stable instances, a downloaded on-device model, the built panel and a served Angular dev page (`.commandcode/skills/verify-ai-browsers/SKILL.md:6-23`) |
| "`edge-phi4mini` has failed `canary.structured` with `kErrorUnknown` in one doctor out of three (2026-10-12)" | feature | unverifiable | needs a live doctor run on that instance (`.commandcode/skills/verify-ai-browsers/SKILL.md:77`) |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the three checks exist at the named ids | structure | verified | `dir` of `.commandcode/skills/verify-angular-devtools/checks` lists `extension-enabled.mjs`, `attached.mjs`, `coexist.mjs` (each with a `.test.mjs`) (`.commandcode/skills/verify-angular-devtools/SKILL.md:6-8`) |
| "artifacts: `{up.evidenceDir}/<file>`, where `<file>` is `extension.json`, `attach.json` or `coexist-result.json`" | structure | verified | the headers write `<dir>/extension.json` (`checks/extension-enabled.mjs:7`), `<dir>/attach.json` (`checks/attached.mjs:9`) and `<dir>/coexist-result.json` (`checks/coexist.mjs:11`) (`.commandcode/skills/verify-angular-devtools/SKILL.md:39`) |
| "Each check's header comment holds its claim, the feature it covers, its usage and the files it writes" | structure | verified | all three headers carry `// Claim:`, `// Usage:`, `// Writes:` and the exit line (`extension-enabled.mjs:2,6,7,8`; `attached.mjs:2,8,9,10`; `coexist.mjs:2,10,11,12`) (`.commandcode/skills/verify-angular-devtools/SKILL.md:20`) |
| "With `--di-graph`" is an accepted flag of the coexist check | config | verified | `checks/coexist.mjs:10` usage line reads `--out <dir> [--di-graph]` (`.commandcode/skills/verify-angular-devtools/SKILL.md:33`) |
| "`install --from` takes the harness copy already in the checkout" | feature | verified | `control-angular-devtools/scripts/control.mjs:2237` documents `install … [--from edge-dev\|edge\|chrome\|chrome-beta\|<dir>]`, and `:1443` reads "install it in … first or pass --from <dir>" (`.commandcode/skills/verify-angular-devtools/SKILL.md:41`) |
| "The harness is headed; it opens a window on Lars's desktop for about half a minute per run" | feature | unverifiable | needs the Playwright Chromium harness to be launched (`.commandcode/skills/verify-angular-devtools/SKILL.md:52`) |
| "Not covered: the branded browsers … `control.mjs status --browser <name>` reads Lars's own profile" | feature | unverifiable | needs a branded-browser profile read (`.commandcode/skills/verify-angular-devtools/SKILL.md:53`) |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "exact pin 0.0.7 declared and installed" | config | verified | `control-pangular-inspector/scripts/control.mjs:103` is `const PINNED = '0.0.7';` (`.commandcode/skills/verify-pangular-inspector/SKILL.md:16`) |
| the three checks and their artifacts exist | structure | verified | `setup.mjs` writes `<dir>/setup-check.json` (`checks/setup.mjs:8`), `read-only.mjs` writes `<dir>/tools-list.json, navigate-refused.json` (`checks/read-only.mjs:9`), and `live-reads.mjs` is present and takes `--session` (`checks/live-reads.mjs` usage line) (`.commandcode/skills/verify-pangular-inspector/SKILL.md:38`, `:42`) |
| "`read-only.mjs` takes `--out` only" | structure | verified | `checks/read-only.mjs:8` usage line is `--out <dir>` with no `--session`, unlike `live-reads.mjs` (`.commandcode/skills/verify-pangular-inspector/SKILL.md:32`) |
| "the setup steps need ports 3000 and 9999 free" | config | verified | 3000 is pinned at `control-angular-dev-app/scripts/control.mjs:101` (`const PORTAL_API_PORT = 3000;`) and 9999 at `control-pangular-inspector/scripts/control.mjs:104` (`const DEFAULT_PORT = 9999;`) (`.commandcode/skills/verify-pangular-inspector/SKILL.md:49`) |
| "`tools/list` offers no action tool, and `call navigate` without `--confirm` is refused" | feature | verified | `control.mjs:107` declares `ACTION_TOOLS`, `control.mjs:536` refuses `ACTION_TOOLS.includes(short(name)) && !confirm`, and `control.mjs:2455` exits 2 (`.commandcode/skills/verify-pangular-inspector/SKILL.md:18`) |
| the `live-reads` claim (a sidebar CONTRACT > List click reaches `/contract/list`, and the six MCP reads answer) | feature | unverifiable | needs the Insurance Portal served with Pangular installed, a running devtools server on 9999 and a browser click (`.commandcode/skills/verify-pangular-inspector/SKILL.md:17`) |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "the Angular unit-test builder is pinned to include only `**/*.spec.ts`" | structure | verified | `apps/angular-ai-devtools/project.json:117-119` sets the `@angular/build:unit-test` target's `include` to `["**/*.spec.ts"]` (`.commandcode/taste/angular/taste.md:14`) |
| "`tsconfig.spec.json` excludes `src/**/*.node.test.ts`" | config | verified | `apps/angular-ai-devtools/tsconfig.spec.json:13-16` excludes `src/**/*.node.test.ts` and `src/**/*.node.spec.ts` (`.commandcode/taste/angular/taste.md:14`) |
| "`node:test` suites are named `*.node.test.ts` and run with `node --experimental-strip-types --test`" | command | verified | `package.json:15` runs `node --experimental-strip-types --test` over `"src/**/*.test.ts"`, and two such suites exist: `apps/angular-ai-devtools/src/app/interop-slice.node.test.ts` and `interop-attribution.node.test.ts` (`.commandcode/taste/angular/taste.md:14`) |
| "signals … and zoneless" with no legacy runtime | feature | verified | `package.json:51-60` lists only `@angular/*`, `rxjs` and `tslib` as runtime dependencies, with no `zone.js` (`.commandcode/taste/angular/taste.md:3`) |
| "Signal Forms (`@angular/forms/signals`) is the target forms API; the Insurance Portal was migrated to it" | integration | unverifiable | a recursive search of this checkout finds no `@angular/forms/signals` reference, and the portal is a separate checkout at `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`, so the migration claim needs that tree (`.commandcode/taste/angular/taste.md:5`) |
| "`inject()` and `@Service()`-style modern authoring are preferred" | integration | unverifiable | `@Service` is Angular's own API, which this repository does not vendor in readable form; needs the Angular 22 source or a compile probe (`.commandcode/taste/angular/taste.md:3`) |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "`provideAiDevTools()` not `provideAiDevtools()`" | feature | verified | `packages/ai-devtools-companion/src/index.ts:25` declares `export function provideAiDevTools(): Provider[] {` (`.commandcode/taste/communication/taste.md:4`) |
| "neither word may appear in DevTools code, UI or runtime text" (blessed / ordained) | feature | verified | a search of `apps/**`, `extension/**` and `packages/**` for `blessed\|ordained` returns no file (`.commandcode/taste/communication/taste.md:3`) |
| "Never call AskUserQuestion; proceed with available context and escalate through the normal channel instead", plus the writing-style and reporting preferences (`:5-12`) | feature | unverifiable | these are agent-behaviour rules with no artefact to contradict; they need the owner or a live session (`.commandcode/taste/communication/taste.md:11`) |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "the page, content scripts, and service worker never host `LanguageModel`" | integration | verified | the only `LanguageModel` reference under `extension/` is the built panel bundle `extension/panel/chunk-Di8Zy6Ss.js` (`globalThis.LanguageModel`, panel-side); the hand-written sources (`background.js`, `relay.js`, `agent-main.js`, `stale-view-worker.js`) carry none (`.commandcode/taste/design/taste.md:12`) |
| "The MAIN-world script is limited to reading the page … it never runs Prompt API" | integration | verified | `extension/manifest.json:34` declares `agent-main.js` as the MAIN-world script and that file contains no `LanguageModel` (`.commandcode/taste/design/taste.md:13`) |
| "A Worker must not call `LanguageDetector` or `Translator` itself" | feature | verified | a search of `extension/` and `apps/angular-ai-devtools/src` for both names returns nothing (`.commandcode/taste/design/taste.md:15`) |
| "Removing `panel/**` from `web_accessible_resources` is conditional" | feature | verified | `extension/manifest.json` carries no `web_accessible_resources` key at all; the panel is reached through `"devtools_page": "devtools.html"` (`extension/manifest.json:51`) (`.commandcode/taste/design/taste.md:11`) |
| "per-package secondary entry points such as `provideAiNgrxDevTools()`" | feature | unverifiable | the package exports only `provideAiDevTools()` (`packages/ai-devtools-companion/src/index.ts:25`; `src/` holds `index.ts`, `facade.ts`, `vetted.ts`, no entry-point folders), so whether the sentence is a naming rule or a shipped artifact needs a ruling (`.commandcode/taste/design/taste.md:9`) |
| "Edge exposes no `LanguageModel` there without flags" | feature | unverifiable | needs Edge Dev/Edge stable with and without the AI feature switches (`.commandcode/taste/design/taste.md:12`) |

## Doc: .commandcode/taste/taste.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the file carries no text, so there is nothing to contradict | structure | verified | reading it returns zero bytes; `.project/research/DOCS-AUDIT.md:1107` classifies it the same way ("`.commandcode/taste/taste.md`" under `## Descriptive docs`) (`.commandcode/taste/taste.md:1`) |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "the configured npm global prefix is `C:\Users\LarsGyrupBrinkNielse\.local\bin` (`~/.npmrc` line 2)" | config | verified | ran `npm prefix -g` → `C:\Users\LarsGyrupBrinkNielse\.local\bin`; `~/.npmrc:2` is `prefix=C:\Users\LarsGyrupBrinkNielse\.local\bin` (`.commandcode/taste/tooling/taste.md:60`) |
| "`D:\packages\npm-global` exists and is populated (`@playwright`, `create-nx-workspace`)" | structure | verified | `dir /b D:\packages\npm-global` lists `@playwright` and `create-nx-workspace` beside 16 other entries (`.commandcode/taste/tooling/taste.md:60`) |
| "verify with `nx test angular-ai-devtools --include=<path>`" | structure | verified | the test target declares an `include` option (`apps/angular-ai-devtools/project.json:117-119`), which is what that flag maps to (`.commandcode/taste/tooling/taste.md:62`) |
| "start AI browser instances only through `control-ai-browsers up`, which adds the Edge sign-in and sync switches" | feature | verified | `instances.json:32` is the `--disable-features=msImplicitSignin,…` switch list on both Edge browsers, and `control.mjs:899` refuses a profile that holds an account (`.commandcode/taste/tooling/taste.md:37`) |
| "install-* scripts (and their tests) live user-scope, not in `scripts/`" | feature | verified | `dir` of `scripts/` lists no `install-*` file, and `~/.commandcode/scripts/install-gsd-path-command-code.mjs` exists (`.commandcode/taste/tooling/taste.md:13`) |
| "on Windows 11 ARM64, `shell_command` uses cmd.exe (not Git Bash)" | feature | verified | `echo %PROCESSOR_ARCHITECTURE%` → `ARM64`, and this audit's own shell rejected `Select-Object` as "not recognized as an internal or external command", i.e. cmd.exe (`.commandcode/taste/tooling/taste.md:35`) |
| TypeScript scripts run on Node 22/24 via `node --experimental-strip-types` | command | verified | `node --version` → `v24.22.0`, and `package.json:15` uses exactly that flag (`.commandcode/taste/tooling/taste.md:14`) |
| "when the same model runs on both channels, keep the Stable instance and drop the Beta/Dev one" | feature | unverifiable | the registry still carries both v3Nano instances (`instances.json:68` chrome-beta-nano, `instances.json:199` chrome-stable-nano), so whether the rule is unapplied or unamended needs the owner (`.commandcode/taste/tooling/taste.md:40`) |
| the PowerShell-5.1 comparison operators (`-lt`, `-gt`, …) and the "prefers the PowerShell tool" half of `:35` | feature | unverifiable | needs a PowerShell 5.1 session, which this audit did not open (`.commandcode/taste/tooling/taste.md:35`) |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "Pair every tool, fixture or runtime the project adopts with a `control-{name}` skill and a `verify-{name}` skill" | feature | stale | asserted at `.commandcode/taste/workflow/taste.md:3`, contradicted by `.commandcode/skills` (dir listing), which holds `control-angular-dev-app` and `control-vitest-browser-angular` with no `verify-` counterpart while only `verify-ai-browsers`, `verify-angular-devtools` and `verify-pangular-inspector` exist |
| "Gitignore `.playwright-cli/`" | command | verified | `.gitignore:1` is `.playwright-cli/` (`.commandcode/taste/workflow/taste.md:63`) |
| "shared project settings stay committed in `.commandcode/settings.json`, while … `.commandcode/settings.local.json`" is gitignored | config | verified | `git ls-files .commandcode/settings.json` lists it as tracked, `git ls-files .commandcode/settings.local.json` lists nothing, and `.gitignore:18` ignores it (`.commandcode/taste/workflow/taste.md:17`) |
| "Generated build artifacts … under `extension/panel/` should be gitignored; only … `index.html` and `favicon.ico` should remain tracked" | feature | verified | `.gitignore:33-35` is `extension/panel/*`, `!extension/panel/index.html`, `!extension/panel/favicon.ico` (`.commandcode/taste/workflow/taste.md:52`) |
| "Keep `spikes/` and `research/` in the repository" | feature | verified | `spikes/ng222-app`, `spikes/ng222-ssr`, `spikes/probes` and `research/00`…`research/20` are all present (`.commandcode/taste/workflow/taste.md:65`) |
| "the `lars-*` verification skills" exist as installed skills | structure | verified | `dir ~/.commandcode/skills` lists `lars-create-verification`, `lars-maintain-verification`, `lars-review`, `lars-verify` (`.commandcode/taste/workflow/taste.md:4`) |
| "check_docs_audit.py … matching the frozen inventory, consistent summary counts, and a populated remediation queue" exists where the rule points | structure | verified | `~/.commandcode/skills/gsd-path/scripts/check_docs_audit.py` is present (`.commandcode/taste/workflow/taste.md:35`) |
| the commit, gate and delegation practices in the rest of the file (`git commit -F`, stage-by-name, the 4-agent cap, `/pstack:*` commands) | structure | unverifiable | the first are process rules with no artefact, and the `pstack` skill family is not installed beside the `lars-*` ones (`dir ~/.commandcode/skills` shows only `setup-pstack`) (`.commandcode/taste/workflow/taste.md:4`) |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "TypeScript is pinned to 6.0.x (`package.json`)" | structure | verified | `package.json:47` is `"typescript": "6.0.3"` (`AGENTS.md:17`) |
| "`npm run check` (type check, root and skills) and `npm test` (node:test, root and skills)" | command | verified | `package.json:7` and `package.json:15` (`AGENTS.md:18`) |
| "Nx CLI entry for this install: `node_modules/nx/dist/bin/nx.js` (Nx 23)" | command | verified | the file exists, and `npx nx show projects --json` runs (`AGENTS.md:19`) |
| "call `%USERPROFILE%\.commandcode\gsd.bat <verb>`" | feature | verified | `C:\Users\LarsGyrupBrinkNielse\.commandcode\gsd.bat` exists (`AGENTS.md:20-21`) |
| "The automatic bridge (`scripts/sidecar-deps-bridge.mjs`)" | structure | verified | the script exists, and `package.json:7` invokes its sibling `scripts/ensure-sidecar-deps.mjs` first (`AGENTS.md:18-24`) |
| "`.commandcode/skills/` is the only maintained copy of the `control-*` and `verify-*` skills … there is no second tree to keep in step" | structure | verified | no `.claude` directory exists in this checkout (`AGENTS.md:40-42`) |
| "`toSignal(this.subject)` at line 14 and an unlabelled `effect` whose body calls `subject.error(...)` at line 22" | feature | verified | `spikes/ng222-app/src/app/stale-view-fixture.ts:14` is `readonly signal = toSignal(this.subject);` and `:22` is `this.subject.error(new Error('interop'));` (`AGENTS.md:55-60`) |
| "The app serves the route (`apps/angular-ai-devtools/src/app/app.routes.ts:24`)" | structure | stale | asserted at `AGENTS.md:63`, contradicted by `apps/angular-ai-devtools/src/app/app.routes.ts:24`, which is a line inside the `PANEL_SURFACES` comment block; `{ path: 'interop', … }` is declared at `:120` |
| "`verify-ai-browsers/checks/interop.mjs` (10 tests, green 2026-11-01: `node --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs` reports `tests 10`, `pass 10`)" | command | verified | ran that command: `ℹ tests 10 / ℹ pass 10 / ℹ fail 0` (`AGENTS.md:64-67`) |
| "DeepSeek V4.1 Flash for every tool-loop role … GLM-5.3 Flash for `reviewer`, `skeptic` and `review_panel`" | feature | stale | asserted at `AGENTS.md:82-84`, contradicted by `.project/model-policy.json`, whose tool-loop roles include `inspect_docs`, `docs_audit` and `research` on `free-glyph-cluster-medium` (`:9`, `:10`, `:14`) and `mechanical_repair` on `paid-deepseek-v4-1-flash-low` (`:15`), and whose review roles are `reviewer_panel_beam`, `reviewer_panel_glyph`, `reviewer_panel_glm` and `gap_review` (`:5-7`) — no role named `reviewer`, `skeptic` or `review_panel` |
| "`.project/review/` is tracked; deleting it is a diff, not a loss" | feature | stale | asserted at `AGENTS.md:297`, contradicted by `git ls-files .project/review` (no rows) and by `.project/`, which holds no `review` directory; every tracked review file lives under `.project/archive/<milestone>/review/` |
| "Measured on 2026-11-07: 15 of 23 verdict specs drove the counter fixture on `:4222` and 3 drove the portal" | feature | unverifiable | needs the `.project/build/verify` evidence root of that date, which this checkout does not carry (`AGENTS.md:213`) |

## Doc: LESSONS.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "`extension/overlay.js:507` registers `attachInput(window, 'click', onClick, true)`" | feature | verified | `findstr /n` on that line returns `507:    attachInput(window, 'click', onClick, true);` (`LESSONS.md:12`) |
| "`attachInput` (`:440`) is the wrapper that calls `addEventListener`" | feature | verified | `extension/overlay.js:440` is `function attachInput(target, type, handler, capture) {` (`LESSONS.md:12-13`) |
| "`onClick` (`:356`) returns unless `armed`" | feature | verified | `extension/overlay.js:356` is `function onClick(event) {` (`LESSONS.md:19`) |
| "Corrected in `research/raw/m049-streams.json` at `74d00e63`" | structure | verified | the file exists and `git cat-file -t 74d00e63` → `commit` (`LESSONS.md:16`) |
| the two archived documents it corrects exist | structure | verified | `.project/archive/049-interaction-story/review/FINAL.md` and `.project/archive/049-interaction-story/research/SYNTHESIS.md` (`LESSONS.md:9-10`) |
| the refuted claim itself ("no file in `extension/` registers a `click`, `pointer*`, `mouse*` or `key*` listener") | structure | unverifiable | falsifying it completely needs an enumeration of every listener registration by target and type; this audit confirmed only the one click listener at `:507` (`LESSONS.md:10-11`) |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | feature | stale | asserted at `docs/afk-run-2026-10-12.md:11`, contradicted by `.commandcode/skills` (dir listing), which holds no `verify-angular-dev-app` and only three `verify-*` skills total (`verify-ai-browsers`, `verify-angular-devtools`, `verify-pangular-inspector`) against five `control-*` |
| "added `.audit/` (local briefs and todos) to `.gitignore`" | feature | verified | `.gitignore:15` is `.audit/` (`docs/afk-run-2026-10-12.md:40`) |
| "Research `research/00`-`10`" | feature | verified | `research/` holds `00-browser-probe.md` through `10-model-capabilities.md` (and `11`-`20`) (`docs/afk-run-2026-10-12.md:29`) |
| "`docs/feature-proposals.md` section 8, \"Rulings from Lars\"" | structure | stale | asserted at `docs/afk-run-2026-10-12.md:27`, contradicted by `docs/feature-proposals.md:1038`, which reads `## 8. Decisions for Lars` |
| "check: `node .claude/skills/control-angular-dev-app/scripts/control.mjs up --target portal` exit 0 twice" | command | stale | asserted at `docs/afk-run-2026-10-12.md:42`, contradicted by the tree: there is no `.claude` directory, so that command cannot be run as written |
| "upstream bugs go to `docs/filing-ledger.md`" | feature | verified | the file exists (`docs/filing-ledger.md`) (`docs/afk-run-2026-10-12.md:19`) |
| the cited commits resolve | feature | verified | `git cat-file -t d5c7125` → `commit` (`:40`) and `git cat-file -t 916fc09` → `commit` (`:57`) (`docs/afk-run-2026-10-12.md:40`, `:57`) |
| "Only the four standing per-model instances run, each on one blank tab, plus Lars's everyday Edge, which is untouched" | feature | unverifiable | needs a live look at the running browsers (`docs/afk-run-2026-10-12.md:15`) |

## Doc: docs/autonomy-gaps.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "ten stops recorded first-hand in the M017 run" | feature | verified | `docs/autonomy-gaps.md` carries exactly ten `## Gap —` headings, at `:21`, `:37`, `:52`, `:66`, `:80`, `:96`, `:110`, `:128`, `:146` and `:164` (`docs/autonomy-gaps.md:6`) |
| the pin citations name the right file and line | config | verified | `scripts/autonomy-gaps.test.mjs:145` is the `G1 prompt pin` test, `:268` the `G9 static pin` test, `scripts/user-scope-autonomy.test.mjs:733` the `P4 serial-retry pin` test, `scripts/docs-audit-disposition.test.mjs:659` the `E6 queue numbers` test (`docs/autonomy-gaps.md:33`, `:160`, `:176`, `:160`) |
| "`node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs` exit 0 — `ℹ tests 15 / ℹ pass 15 / ℹ fail 0`" | command | verified | ran it: `ℹ tests 15`, `ℹ pass 15`, `ℹ fail 0`, with the G1 and G9 titles printed (`docs/autonomy-gaps.md:34`) |
| "`✔ P4 serial-retry pin: a parked serial task is ready and a pending task retaining metadata fails`" | config | verified | that test passes in today's run of `scripts/user-scope-autonomy.test.mjs` (`docs/autonomy-gaps.md:177`) |
| "`node --experimental-strip-types --test scripts/user-scope-autonomy.test.mjs` exit 0 — … `ℹ tests 18 / ℹ pass 18 / ℹ fail 0`" | command | verified | asserted at `docs/autonomy-gaps.md:177`, contradicted today by the same command, which exits 1 with `ℹ tests 18 / ℹ pass 13 / ℹ fail 5`: the failing tests are `health: check() on the real resolved install reports no issues`, `E4: removing a rule token fails naming that file…`, `P3 check_handoffs pin…`, `E1 helper pin…` and `D1 dispatch pin…` in `scripts/user-scope-autonomy.test.mjs` |
| "`scripts/docs-correction.test.mjs` resolves the chromium build from the strongest in-repo source" | structure | verified | the file exists — and "the installed gate at `…\gsd-path\scripts\check_docs_audit.py` was read for this analysis and never edited" — that path exists (`docs/autonomy-gaps.md:153`, `:158`) |
| "the recipe already lives at `C:\Users\LarsGyrupBrinkNielse\.commandcode\references\gsd-path-autonomy-playbook.md` §31" | structure | verified | the file exists (`docs/autonomy-gaps.md:172`) |

## Counts (recomputed; informational, not audited rows)

- verified: 98
- stale: 14
- unverifiable: 23
- aspirational: 0
- total: 135
