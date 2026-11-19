# Chunk 4 — agent-facing skill docs (Nx + the three `verify-*` skills), the `.commandcode/taste/` set, and the project's own records

Audited HEAD: 067dc23ced80abcc535166297084626755f438e4

Working tree note: `git status` at this head reports one modified tracked file, `.commandcode/taste/workflow/taste.md`; the claims below are read from the file as it sits on disk.

## .commandcode/skills/nx-workspace/SKILL.md

- current: "Use `nx show projects` to list projects in the workspace." — ran `npx nx show projects --json`, output `["ai-devtools-companion","angular-ai-devtools-e2e","angular-ai-devtools","angular-ai-devtools-workspace"]` (`.commandcode/skills/nx-workspace/SKILL.md:14`)
- current: "filters support explicit names, glob patterns, tag references, directories, and negation" with `-p/--projects`, `--withTarget`, `--type`, `--exclude`, `--affected`, `--json` — ran `npx nx show projects --help`; it lists `-p, --projects`, `-t, --withTarget`, `--type [app|lib|e2e]`, `--exclude`, `--affected`, `--json`, `--uncommitted`, `--untracked`, `--base`, `--head` (`.commandcode/skills/nx-workspace/SKILL.md:16`)
- current: "Use `nx show project <name> --json` to get the full resolved configuration … including inferred targets from plugins" — `apps/angular-ai-devtools-e2e/project.json:11` is `"targets": {}` while `nx.json:24-31` registers `@nx/playwright/plugin` with `"targetName": "e2e"`, so the `e2e` target exists only by inference (`.commandcode/skills/nx-workspace/SKILL.md:48`)
- current: "`targetDefaults` — Default configuration applied to all targets of a given name" and "`plugins` — Nx plugins and their configuration" — `nx.json:3-20` holds `targetDefaults` keyed by `build`, `@angular/build:application` and `@angular/build:unit-test`; `nx.json:24-31` holds the plugin array (`.commandcode/skills/nx-workspace/SKILL.md:111`)
- current: "You can read the full project schema at `node_modules/nx/schemas/project-schema.json`" (and the `nx-schema.json` sibling at `:88`) — `dir` finds both files under the installed Nx 23.3 (`.commandcode/skills/nx-workspace/SKILL.md:52`)
- current: the `jq` pipelines are runnable on this host — `where jq` answers `C:\Users\LarsGyrupBrinkNielse\AppData\Local\Microsoft\WinGet\Links\jq.exe` (`.commandcode/skills/nx-workspace/SKILL.md:143`)
- unverifiable: "`nx graph --print`" returns the project graph — needs an `nx graph` run; not executed in this audit (`.commandcode/skills/nx-workspace/SKILL.md:227`)
- unverifiable: "`nx sync`" then "`nx reset` if sync doesn't fix stale cache" — `nx reset` clears the daemon and cache for every later command this session, so it was not run (`.commandcode/skills/nx-workspace/SKILL.md:285-286`)

## .commandcode/skills/nx-workspace/references/AFFECTED.md

- current: every listed flag exists — ran `npx nx show projects --help`: `--affected`, `--base`, `--head`, `--type`, `--exclude`, `--uncommitted`, `--untracked` are all documented there (`.commandcode/skills/nx-workspace/references/AFFECTED.md:5-27`)
- current: `--exclude="*-e2e"` names this workspace's e2e project — `apps/angular-ai-devtools-e2e/project.json:2` is `"name": "angular-ai-devtools-e2e"`, which the glob matches (`.commandcode/skills/nx-workspace/references/AFFECTED.md:17`)
- current: `--type app` selects on `projectType` — `apps/angular-ai-devtools-e2e/project.json:4` is `"projectType": "application"` (`.commandcode/skills/nx-workspace/references/AFFECTED.md:14`)
- current: `--base=main` and `--base=origin/main` both resolve here — `git branch -a` lists `main` and `remotes/origin/main` (`.commandcode/skills/nx-workspace/references/AFFECTED.md:9-10`)
- unverifiable: "Affected between two commits … `--base=abc123 --head=def456`" — needs two chosen commits and an affected computation; not run (`.commandcode/skills/nx-workspace/references/AFFECTED.md:12`)

## .commandcode/skills/verify-ai-browsers/SKILL.md

- current: "Each check exits 0 pass, 1 claim failed, 2 could not run" — every one of the eight check headers ends with that exact sentence, e.g. `.commandcode/skills/verify-ai-browsers/checks/state.mjs:11` (`// Exit 0 pass; 1 with \`Error: CLAIM: ...\` when the claim fails; 2 when it could not run.`), and the same line at `error-explainer.mjs:12`, `extension-panel.mjs:13`, `interop.mjs:14`, `stale-view.mjs:11`, `di-doctor.mjs:12`, `signal-provenance.mjs:12`, `model-init.mjs:10` (`.commandcode/skills/verify-ai-browsers/SKILL.md:3`)
- current: the eight standalone command lines name real modules — `dir` of `.commandcode/skills/verify-ai-browsers/checks` lists exactly `state.mjs`, `model-init.mjs`, `extension-panel.mjs`, `signal-provenance.mjs`, `di-doctor.mjs`, `error-explainer.mjs`, `stale-view.mjs`, `interop.mjs` (plus one `.test.mjs` each) (`.commandcode/skills/verify-ai-browsers/SKILL.md:59-66`)
- current: the named artifacts are the ones the checks write — `state.json` (`checks/state.mjs:10`), `model-init.json` (`model-init.mjs:9`), `extension-panel.json` (`extension-panel.mjs:12`), `error-explainer.json` (`error-explainer.mjs:11`) (`.commandcode/skills/verify-ai-browsers/SKILL.md:25-28`, `:38`)
- current: `check-teardown.mjs {runDir}/steps/teardown-<n>.out --artifact …` resolves — the script ships at `~/.commandcode/skills/lars-create-verification/scripts/check-teardown.mjs` (`dir` of that skill) (`.commandcode/skills/verify-ai-browsers/SKILL.md:56`)
- current: the setup builds the panel with `npx nx run angular-ai-devtools:build-extension` — the target is declared at `apps/angular-ai-devtools/project.json:64` (`.commandcode/skills/verify-ai-browsers/SKILL.md:44`)
- current: `C model download <instance> --timeout-min=45` is the driver's own default — `control.mjs:297` documents "`model download`'s time budgets: the page polls for `--timeout-min` (default 45) minutes after its click" (`.commandcode/skills/verify-ai-browsers/SKILL.md:41`)
- current: the extension-panel setup names `control-angular-dev-app up --target counter` and that target exists — `control-angular-dev-app/scripts/control.mjs:114` declares `counter:` (`.commandcode/skills/verify-ai-browsers/SKILL.md:18`)
- unverifiable: the row claims themselves (`state`, `model-init`, `extension-panel`, `signal-provenance`, `di-doctor`, `error-explainer`, `stale-view`, `interop` each exiting 0 on a named instance) — need running Chrome Beta / Edge Dev / Edge stable instances, a downloaded on-device model, the built panel and a served Angular dev page (`.commandcode/skills/verify-ai-browsers/SKILL.md:6-23`)
- unverifiable: "`edge-phi4mini` has failed `canary.structured` with `kErrorUnknown` in one doctor out of three (2026-10-12)" — needs a live doctor run on that instance (`.commandcode/skills/verify-ai-browsers/SKILL.md:77`)

## .commandcode/skills/verify-angular-devtools/SKILL.md

- current: the three checks exist at the named ids — `dir` of `.commandcode/skills/verify-angular-devtools/checks` lists `extension-enabled.mjs`, `attached.mjs`, `coexist.mjs` (each with a `.test.mjs`) (`.commandcode/skills/verify-angular-devtools/SKILL.md:6-8`)
- current: "artifacts: `{up.evidenceDir}/<file>`, where `<file>` is `extension.json`, `attach.json` or `coexist-result.json`" — the headers write `<dir>/extension.json` (`checks/extension-enabled.mjs:7`), `<dir>/attach.json` (`checks/attached.mjs:9`) and `<dir>/coexist-result.json` (`checks/coexist.mjs:11`) (`.commandcode/skills/verify-angular-devtools/SKILL.md:39`)
- current: "Each check's header comment holds its claim, the feature it covers, its usage and the files it writes" — all three headers carry `// Claim:`, `// Usage:`, `// Writes:` and the exit line (`extension-enabled.mjs:2,6,7,8`; `attached.mjs:2,8,9,10`; `coexist.mjs:2,10,11,12`) (`.commandcode/skills/verify-angular-devtools/SKILL.md:20`)
- current: "With `--di-graph`" is an accepted flag of the coexist check — `checks/coexist.mjs:10` usage line reads `--out <dir> [--di-graph]` (`.commandcode/skills/verify-angular-devtools/SKILL.md:33`)
- current: "`install --from` takes the harness copy already in the checkout" — `control-angular-devtools/scripts/control.mjs:2237` documents `install … [--from edge-dev|edge|chrome|chrome-beta|<dir>]`, and `:1443` reads "install it in … first or pass --from <dir>" (`.commandcode/skills/verify-angular-devtools/SKILL.md:41`)
- unverifiable: "The harness is headed; it opens a window on Lars's desktop for about half a minute per run" — needs the Playwright Chromium harness to be launched (`.commandcode/skills/verify-angular-devtools/SKILL.md:52`)
- unverifiable: "Not covered: the branded browsers … `control.mjs status --browser <name>` reads Lars's own profile" — needs a branded-browser profile read (`.commandcode/skills/verify-angular-devtools/SKILL.md:53`)

## .commandcode/skills/verify-pangular-inspector/SKILL.md

- current: "exact pin 0.0.7 declared and installed" — `control-pangular-inspector/scripts/control.mjs:103` is `const PINNED = '0.0.7';` (`.commandcode/skills/verify-pangular-inspector/SKILL.md:16`)
- current: the three checks and their artifacts exist — `setup.mjs` writes `<dir>/setup-check.json` (`checks/setup.mjs:8`), `read-only.mjs` writes `<dir>/tools-list.json, navigate-refused.json` (`checks/read-only.mjs:9`), and `live-reads.mjs` is present and takes `--session` (`checks/live-reads.mjs` usage line) (`.commandcode/skills/verify-pangular-inspector/SKILL.md:38`, `:42`)
- current: "`read-only.mjs` takes `--out` only" — `checks/read-only.mjs:8` usage line is `--out <dir>` with no `--session`, unlike `live-reads.mjs` (`.commandcode/skills/verify-pangular-inspector/SKILL.md:32`)
- current: "the setup steps need ports 3000 and 9999 free" — 3000 is pinned at `control-angular-dev-app/scripts/control.mjs:101` (`const PORTAL_API_PORT = 3000;`) and 9999 at `control-pangular-inspector/scripts/control.mjs:104` (`const DEFAULT_PORT = 9999;`) (`.commandcode/skills/verify-pangular-inspector/SKILL.md:49`)
- current: "`tools/list` offers no action tool, and `call navigate` without `--confirm` is refused" — `control.mjs:107` declares `ACTION_TOOLS`, `control.mjs:536` refuses `ACTION_TOOLS.includes(short(name)) && !confirm`, and `control.mjs:2455` exits 2 (`.commandcode/skills/verify-pangular-inspector/SKILL.md:18`)
- unverifiable: the `live-reads` claim (a sidebar CONTRACT > List click reaches `/contract/list`, and the six MCP reads answer) — needs the Insurance Portal served with Pangular installed, a running devtools server on 9999 and a browser click (`.commandcode/skills/verify-pangular-inspector/SKILL.md:17`)

## .commandcode/taste/angular/taste.md

- current: "the Angular unit-test builder is pinned to include only `**/*.spec.ts`" — `apps/angular-ai-devtools/project.json:117-119` sets the `@angular/build:unit-test` target's `include` to `["**/*.spec.ts"]` (`.commandcode/taste/angular/taste.md:14`)
- current: "`tsconfig.spec.json` excludes `src/**/*.node.test.ts`" — `apps/angular-ai-devtools/tsconfig.spec.json:13-16` excludes `src/**/*.node.test.ts` and `src/**/*.node.spec.ts` (`.commandcode/taste/angular/taste.md:14`)
- current: "`node:test` suites are named `*.node.test.ts` and run with `node --experimental-strip-types --test`" — `package.json:15` runs `node --experimental-strip-types --test` over `"src/**/*.test.ts"`, and two such suites exist: `apps/angular-ai-devtools/src/app/interop-slice.node.test.ts` and `interop-attribution.node.test.ts` (`.commandcode/taste/angular/taste.md:14`)
- current: "signals … and zoneless" with no legacy runtime — `package.json:51-60` lists only `@angular/*`, `rxjs` and `tslib` as runtime dependencies, with no `zone.js` (`.commandcode/taste/angular/taste.md:3`)
- unverifiable: "Signal Forms (`@angular/forms/signals`) is the target forms API; the Insurance Portal was migrated to it" — a recursive search of this checkout finds no `@angular/forms/signals` reference, and the portal is a separate checkout at `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`, so the migration claim needs that tree (`.commandcode/taste/angular/taste.md:5`)
- unverifiable: "`inject()` and `@Service()`-style modern authoring are preferred" — `@Service` is Angular's own API, which this repository does not vendor in readable form; needs the Angular 22 source or a compile probe (`.commandcode/taste/angular/taste.md:3`)

## .commandcode/taste/communication/taste.md

- current: "`provideAiDevTools()` not `provideAiDevtools()`" — `packages/ai-devtools-companion/src/index.ts:25` declares `export function provideAiDevTools(): Provider[] {` (`.commandcode/taste/communication/taste.md:4`)
- current: "neither word may appear in DevTools code, UI or runtime text" (blessed / ordained) — a search of `apps/**`, `extension/**` and `packages/**` for `blessed|ordained` returns no file (`.commandcode/taste/communication/taste.md:3`)
- unverifiable: "Never call AskUserQuestion; proceed with available context and escalate through the normal channel instead", plus the writing-style and reporting preferences (`:5-12`) — these are agent-behaviour rules with no artefact to contradict; they need the owner or a live session (`.commandcode/taste/communication/taste.md:11`)

## .commandcode/taste/design/taste.md

- current: "the page, content scripts, and service worker never host `LanguageModel`" — the only `LanguageModel` reference under `extension/` is the built panel bundle `extension/panel/chunk-Di8Zy6Ss.js` (`globalThis.LanguageModel`, panel-side); the hand-written sources (`background.js`, `relay.js`, `agent-main.js`, `stale-view-worker.js`) carry none (`.commandcode/taste/design/taste.md:12`)
- current: "The MAIN-world script is limited to reading the page … it never runs Prompt API" — `extension/manifest.json:34` declares `agent-main.js` as the MAIN-world script and that file contains no `LanguageModel` (`.commandcode/taste/design/taste.md:13`)
- current: "A Worker must not call `LanguageDetector` or `Translator` itself" — a search of `extension/` and `apps/angular-ai-devtools/src` for both names returns nothing (`.commandcode/taste/design/taste.md:15`)
- current: "Removing `panel/**` from `web_accessible_resources` is conditional" — `extension/manifest.json` carries no `web_accessible_resources` key at all; the panel is reached through `"devtools_page": "devtools.html"` (`extension/manifest.json:51`) (`.commandcode/taste/design/taste.md:11`)
- unverifiable: "per-package secondary entry points such as `provideAiNgrxDevTools()`" — the package exports only `provideAiDevTools()` (`packages/ai-devtools-companion/src/index.ts:25`; `src/` holds `index.ts`, `facade.ts`, `vetted.ts`, no entry-point folders), so whether the sentence is a naming rule or a shipped artifact needs a ruling (`.commandcode/taste/design/taste.md:9`)
- unverifiable: "Edge exposes no `LanguageModel` there without flags" — needs Edge Dev/Edge stable with and without the AI feature switches (`.commandcode/taste/design/taste.md:12`)

## .commandcode/taste/taste.md

- current: the file carries no text, so there is nothing to contradict — reading it returns zero bytes; `.project/research/DOCS-AUDIT.md:1107` classifies it the same way ("`.commandcode/taste/taste.md`" under `## Descriptive docs`) (`.commandcode/taste/taste.md:1`)

## .commandcode/taste/tooling/taste.md

- current: "the configured npm global prefix is `C:\Users\LarsGyrupBrinkNielse\.local\bin` (`~/.npmrc` line 2)" — ran `npm prefix -g` → `C:\Users\LarsGyrupBrinkNielse\.local\bin`; `~/.npmrc:2` is `prefix=C:\Users\LarsGyrupBrinkNielse\.local\bin` (`.commandcode/taste/tooling/taste.md:60`)
- current: "`D:\packages\npm-global` exists and is populated (`@playwright`, `create-nx-workspace`)" — `dir /b D:\packages\npm-global` lists `@playwright` and `create-nx-workspace` beside 16 other entries (`.commandcode/taste/tooling/taste.md:60`)
- current: "verify with `nx test angular-ai-devtools --include=<path>`" — the test target declares an `include` option (`apps/angular-ai-devtools/project.json:117-119`), which is what that flag maps to (`.commandcode/taste/tooling/taste.md:62`)
- current: "start AI browser instances only through `control-ai-browsers up`, which adds the Edge sign-in and sync switches" — `instances.json:32` is the `--disable-features=msImplicitSignin,…` switch list on both Edge browsers, and `control.mjs:899` refuses a profile that holds an account (`.commandcode/taste/tooling/taste.md:37`)
- current: "install-* scripts (and their tests) live user-scope, not in `scripts/`" — `dir` of `scripts/` lists no `install-*` file, and `~/.commandcode/scripts/install-gsd-path-command-code.mjs` exists (`.commandcode/taste/tooling/taste.md:13`)
- current: "on Windows 11 ARM64, `shell_command` uses cmd.exe (not Git Bash)" — `echo %PROCESSOR_ARCHITECTURE%` → `ARM64`, and this audit's own shell rejected `Select-Object` as "not recognized as an internal or external command", i.e. cmd.exe (`.commandcode/taste/tooling/taste.md:35`)
- current: TypeScript scripts run on Node 22/24 via `node --experimental-strip-types` — `node --version` → `v24.22.0`, and `package.json:15` uses exactly that flag (`.commandcode/taste/tooling/taste.md:14`)
- unverifiable: "when the same model runs on both channels, keep the Stable instance and drop the Beta/Dev one" — the registry still carries both v3Nano instances (`instances.json:68` chrome-beta-nano, `instances.json:199` chrome-stable-nano), so whether the rule is unapplied or unamended needs the owner (`.commandcode/taste/tooling/taste.md:40`)
- unverifiable: the PowerShell-5.1 comparison operators (`-lt`, `-gt`, …) and the "prefers the PowerShell tool" half of `:35` — needs a PowerShell 5.1 session, which this audit did not open (`.commandcode/taste/tooling/taste.md:35`)

## .commandcode/taste/workflow/taste.md

- stale: "Pair every tool, fixture or runtime the project adopts with a `control-{name}` skill and a `verify-{name}` skill" — asserted at `.commandcode/taste/workflow/taste.md:3`, contradicted by `.commandcode/skills` (dir listing), which holds `control-angular-dev-app` and `control-vitest-browser-angular` with no `verify-` counterpart while only `verify-ai-browsers`, `verify-angular-devtools` and `verify-pangular-inspector` exist
- current: "Gitignore `.playwright-cli/`" — `.gitignore:1` is `.playwright-cli/` (`.commandcode/taste/workflow/taste.md:63`)
- current: "shared project settings stay committed in `.commandcode/settings.json`, while … `.commandcode/settings.local.json`" is gitignored — `git ls-files .commandcode/settings.json` lists it as tracked, `git ls-files .commandcode/settings.local.json` lists nothing, and `.gitignore:18` ignores it (`.commandcode/taste/workflow/taste.md:17`)
- current: "Generated build artifacts … under `extension/panel/` should be gitignored; only … `index.html` and `favicon.ico` should remain tracked" — `.gitignore:33-35` is `extension/panel/*`, `!extension/panel/index.html`, `!extension/panel/favicon.ico` (`.commandcode/taste/workflow/taste.md:52`)
- current: "Keep `spikes/` and `research/` in the repository" — `spikes/ng222-app`, `spikes/ng222-ssr`, `spikes/probes` and `research/00`…`research/20` are all present (`.commandcode/taste/workflow/taste.md:65`)
- current: "the `lars-*` verification skills" exist as installed skills — `dir ~/.commandcode/skills` lists `lars-create-verification`, `lars-maintain-verification`, `lars-review`, `lars-verify` (`.commandcode/taste/workflow/taste.md:4`)
- current: "check_docs_audit.py … matching the frozen inventory, consistent summary counts, and a populated remediation queue" exists where the rule points — `~/.commandcode/skills/gsd-path/scripts/check_docs_audit.py` is present (`.commandcode/taste/workflow/taste.md:35`)
- unverifiable: the commit, gate and delegation practices in the rest of the file (`git commit -F`, stage-by-name, the 4-agent cap, `/pstack:*` commands) — the first are process rules with no artefact, and the `pstack` skill family is not installed beside the `lars-*` ones (`dir ~/.commandcode/skills` shows only `setup-pstack`) (`.commandcode/taste/workflow/taste.md:4`)

## .project/CHARTER.md

- current: "Review panel: off" is the recorded program default — `.project/CHARTER.md:8` (`.project/CHARTER.md:8`)
- current: "Stack: TypeScript 6.0.x, Nx 23.3, Angular ~22.1" — `package.json:47` pins `"typescript": "6.0.3"`, `:34` `"@nx/angular": "^23.3.0"`, `:54` `"@angular/core": "~22.1.0"` (`.project/CHARTER.md:76`)
- current: the four named pairs exist in the registry with those models — `chrome-stable-nano` (`instances.json:199`, model `v3Nano` at `:221`), `chrome-beta-gemma4` (`:99`, `gemma4-2b-it` at `:124`), `edge-dev-aion` (`:133`, `Aion-1.1-Instruct` at `:162`), `edge-phi4mini` (`:171`, `Phi-4-mini-instruct` at `:190`) (`.project/CHARTER.md:80`)
- stale: "one pair per model with the stable channel preferred" — asserted at `.project/CHARTER.md:82-83`, contradicted by the registry carrying two `v3Nano` instances, `chrome-beta-nano` at `.commandcode/skills/control-ai-browsers/instances.json:68` and `chrome-stable-nano` at `:199`
- current: "`spikes/ng222-app` and `spikes/ng222-ssr` are in-repo" and the inspected app is an Angular 22.2 dev build — both directories exist and `spikes/ng222-app/package.json:18` pins `"@angular/core": "^22.2.0"` (`.project/CHARTER.md:113`)
- current: "`npm run check` (TypeScript pin 6.0.x), `npm test`, and `npx nx run angular-ai-devtools:build-extension`" — `package.json:7` (`check`), `package.json:15` (`test`) and `apps/angular-ai-devtools/project.json:64` (the `build-extension` target) all exist (`.project/CHARTER.md:121`)
- current: "`.project/model-policy.json` is the binding policy" — the file exists and carries 16 roles (`.project/model-policy.json:1-19`) (`.project/CHARTER.md:172`)
- current: the portal checkout path and branch — `git -C D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools rev-parse --abbrev-ref HEAD` → `claude/ai-devtools-spike` (at `92d46ec`) (`.project/CHARTER.md:114-116`)
- current: "The initial-bundle budget of 520 KB is binding" — `apps/angular-ai-devtools/project.json:82-83` sets `build-extension`'s initial `maximumWarning` to `520kb` (`.project/CHARTER.md:293`)
- unverifiable: "Edge Dev stays pinned to Aion model 2026.10.15.1, runtime 2026.10.12.1 and manifest 2026.10.19.1" — the registry pins component names only (`instances.json:151-155`); the versions are recorded in prose at `references/edge-dev-aion-model.md:49`, and only a running instance's doctor `model.pin` row settles what is on disk (`.project/CHARTER.md:83-86`)

## .project/LESSONS.md

- current: "`scripts/ensure-sidecar-deps.mjs` now does this for every `npm run check`" — `package.json:7` opens the `check` chain with `node scripts/ensure-sidecar-deps.mjs`, and `scripts/ensure-sidecar-deps.mjs` exists (`.project/LESSONS.md:4`)
- current: "`M044_CAPTURE=1` over `gate-integrity`, `M056_CAPTURE=1` over `gate-stability-record`" — `scripts/gate-integrity.test.mjs` and `scripts/gate-stability-record.test.mjs` both exist (`.project/LESSONS.md:107`)
- current: "`.project/intent/INTENT.md` is archived" — `.project/` holds no `intent` directory, and `.project/archive/056-gate-phase-stability/intent/INTENT.md` exists (`.project/LESSONS.md:93`)
- current: "`currentIntentPath(root)` in `verdict-claims-intent.mjs`" — `scripts/verdict-claims-intent.mjs:139` is `export function currentIntentPath(root) {`, and `scripts/performance-capture.test.mjs:1983` calls it (`.project/LESSONS.md:94-95`)
- current: "`gate-integrity.test.mjs`'s `NAMING_SUITE` must name a *different* suite" — that edit has landed: `scripts/gate-integrity.test.mjs:2255` is `const NAMING_SUITE = 'scripts/overlay-verdict-claims.test.mjs';` (`.project/LESSONS.md:96`)
- stale: "`scripts/performance-capture.test.mjs:1978` is the row that certificate pins as the naming example" — asserted at `.project/LESSONS.md:97`, contradicted by `scripts/performance-capture.test.mjs:1978`, which is a blank line (the naming test opens at `:1979`), and by the recording, whose row for that file carries `"line": 1991` (`research/raw/m044-gate-shapes.json:1439`)

## .project/ROADMAP.md

- current: "### M052 — webmcp-audit" with "Status: pending" and "Archive: null" — `.project/ROADMAP.md:1828`, `:1834`, `:1835`; `.project/STATE.md:9` binds `gsd-path/M052` on the same head (`.project/ROADMAP.md:1834`)
- current: "Archive: .project/archive/056-gate-phase-stability" for a shipped M056 — the directory exists and carries `MANIFEST.md`, `intent/`, `plan/`, `research/`, `review/`, `tasks/` (`.project/ROADMAP.md:1962`)
- current: M010's success criterion naming `npx nx run angular-ai-devtools:build-extension` — the target exists at `apps/angular-ai-devtools/project.json:64` (`.project/ROADMAP.md:191`)
- current: M001's "Integrated: 5953b1285b4f9ccc025ecee77909624ce709d0bf" resolves — `git cat-file -t 5953b128` → `commit` (`.project/ROADMAP.md:19`)
- unverifiable: the remaining forty-odd `Integrated:` SHAs and every milestone's success criteria were not walked; each needs its own `git cat-file`/range check or the milestone's archive (`.project/ROADMAP.md:19-1992`)

## .project/STATE.md

- current: "branch: gsd-path/M052" and the bound milestone — `git rev-parse --abbrev-ref HEAD` → `gsd-path/M052`; `git log --oneline -3` → `067dc23c state: bind next milestone`, `ea6eb321 taste: record the preferences earned during M051`, `bde53dcc integrate: M051 — merge gsd-path/M051 into main` (`.project/STATE.md:9`)
- current: `milestone: null`, `phase: inspect`, `status: active`, `archive: null` — the frontmatter reads exactly that, and no `.project/tasks` or `.project/intent` directory exists to contradict "no milestone in flight" (`.project/STATE.md:4-8`, `:10`)
- current: the closing log line and its date — `:1088` is `- 2026-11-19 — inspect — router bound next milestone`, and HEAD's committer date is `2026-11-19T14:12:11+01:00` (`git show -s --format=%cI 067dc23c`) (`.project/STATE.md:1088`)
- unverifiable: "One file, always current … every phase updates it on completion" — a process promise about future transitions, not a state a machine can falsify now (`.project/STATE.md:21-23`)

## .project/research/DOCS-AUDIT.md

- current: "Audited HEAD: 337047455bae67f5e05ccf25ecd0909b0c9bf448" exists and is an ancestor of HEAD — `git cat-file -t 3370474…` → `commit`; `git merge-base --is-ancestor 3370474… HEAD` → yes; its commit date is `2026-11-16T21:20:48+01:00`, matching "Audited: 2026-11-16" (`.project/research/DOCS-AUDIT.md:5-6`)
- current: the Summary counts match the rows beneath them — counting the `| <verdict> |` cells gives 399 `verified`, 61 `stale`, 3 `aspirational`, 201 `unverifiable`; subtracting the summary row and the queue's repeat rows (30 stale, 1 aspirational, 100 unverifiable) leaves 398 / 30 / 1 / 100 claim rows, exactly the table at `:9-13` (`.project/research/DOCS-AUDIT.md:9-15`)
- current: "descriptive docs (no testable claims) | 1" — `## Descriptive docs` at `:1106` names exactly one document, `.commandcode/taste/taste.md`, and that file is empty (`.project/research/DOCS-AUDIT.md:1107`)
- current: a sampled `verified` row reproduces — `:627` ("Each check exits 0 pass, 1 claim failed, 2 could not run" verified by `state.mjs:11`) is exactly what that file's line 11 says (`.project/research/DOCS-AUDIT.md:627`)
- stale: the AGENTS.md row quotes "`apps/angular-ai-devtools/src/app/app.routes.ts:14`" as the claim and answers ":24 as `{ path: 'interop', ... }`" — asserted at `.project/research/DOCS-AUDIT.md:712`, contradicted by `AGENTS.md:63` (which now says `:24`, not `:14`) and by `apps/angular-ai-devtools/src/app/app.routes.ts:24`, a line inside a comment block; the interop route is declared at `apps/angular-ai-devtools/src/app/app.routes.ts:120`
- stale: the AGENTS.md row asserting ".claude/skills/ holds byte copies of them", marked verified by "byte comparison of the pairs" — asserted at `.project/research/DOCS-AUDIT.md:711`, contradicted by the tree itself: there is no `.claude` directory in this checkout (`dir .claude` → no such file), so no byte comparison can hold now
- stale: "the milestone is `console-read` (M045) at `phase: shipped`, `status: done`, branch `gsd-path/M045`" — asserted at `.project/research/DOCS-AUDIT.md:785-786` as the contradiction of two plans rows, contradicted today by `.project/STATE.md:4-8` (`milestone: null`, `phase: inspect`, `status: active`, `branch: gsd-path/M052`)
- stale: "`.project/research/` holds only DOCS-AUDIT.md and inspect-inventory.txt" — asserted at `.project/research/DOCS-AUDIT.md:1044`, contradicted by `.project/research/`, which holds `DOCS-AUDIT.md`, `INSPECT-DELTA.md` and `parts/` (no `inspect-inventory.txt`)
- unverifiable: the audit's coverage of the frozen inventory cannot be re-derived from the file alone — it carries 112 `## Doc:` sections and none for the five `.project/` documents the current `parts/inventory.txt` lists, and its remediation queue's rows can only be discharged against the portal checkout, live browsers or the nx-cloud API (`.project/research/DOCS-AUDIT.md:1106-1318`)

## AGENTS.md

- current: "TypeScript is pinned to 6.0.x (`package.json`)" — `package.json:47` is `"typescript": "6.0.3"` (`AGENTS.md:17`)
- current: "`npm run check` (type check, root and skills) and `npm test` (node:test, root and skills)" — `package.json:7` and `package.json:15` (`AGENTS.md:18`)
- current: "Nx CLI entry for this install: `node_modules/nx/dist/bin/nx.js` (Nx 23)" — the file exists, and `npx nx show projects --json` runs (`AGENTS.md:19`)
- current: "call `%USERPROFILE%\.commandcode\gsd.bat <verb>`" — `C:\Users\LarsGyrupBrinkNielse\.commandcode\gsd.bat` exists (`AGENTS.md:20-21`)
- current: "The automatic bridge (`scripts/sidecar-deps-bridge.mjs`)" — the script exists, and `package.json:7` invokes its sibling `scripts/ensure-sidecar-deps.mjs` first (`AGENTS.md:18-24`)
- current: "`.commandcode/skills/` is the only maintained copy of the `control-*` and `verify-*` skills … there is no second tree to keep in step" — no `.claude` directory exists in this checkout (`AGENTS.md:40-42`)
- current: "`toSignal(this.subject)` at line 14 and an unlabelled `effect` whose body calls `subject.error(...)` at line 22" — `spikes/ng222-app/src/app/stale-view-fixture.ts:14` is `readonly signal = toSignal(this.subject);` and `:22` is `this.subject.error(new Error('interop'));` (`AGENTS.md:55-60`)
- stale: "The app serves the route (`apps/angular-ai-devtools/src/app/app.routes.ts:24`)" — asserted at `AGENTS.md:63`, contradicted by `apps/angular-ai-devtools/src/app/app.routes.ts:24`, which is a line inside the `PANEL_SURFACES` comment block; `{ path: 'interop', … }` is declared at `:120`
- current: "`verify-ai-browsers/checks/interop.mjs` (10 tests, green 2026-11-01: `node --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs` reports `tests 10`, `pass 10`)" — ran that command: `ℹ tests 10 / ℹ pass 10 / ℹ fail 0` (`AGENTS.md:64-67`)
- stale: "DeepSeek V4.1 Flash for every tool-loop role … GLM-5.3 Flash for `reviewer`, `skeptic` and `review_panel`" — asserted at `AGENTS.md:82-84`, contradicted by `.project/model-policy.json`, whose tool-loop roles include `inspect_docs`, `docs_audit` and `research` on `free-glyph-cluster-medium` (`:9`, `:10`, `:14`) and `mechanical_repair` on `paid-deepseek-v4-1-flash-low` (`:15`), and whose review roles are `reviewer_panel_beam`, `reviewer_panel_glyph`, `reviewer_panel_glm` and `gap_review` (`:5-7`) — no role named `reviewer`, `skeptic` or `review_panel`
- stale: "`.project/review/` is tracked; deleting it is a diff, not a loss" — asserted at `AGENTS.md:297`, contradicted by `git ls-files .project/review` (no rows) and by `.project/`, which holds no `review` directory; every tracked review file lives under `.project/archive/<milestone>/review/`
- unverifiable: "Measured on 2026-11-07: 15 of 23 verdict specs drove the counter fixture on `:4222` and 3 drove the portal" — needs the `.project/build/verify` evidence root of that date, which this checkout does not carry (`AGENTS.md:213`)

## LESSONS.md

- current: "`extension/overlay.js:507` registers `attachInput(window, 'click', onClick, true)`" — `findstr /n` on that line returns `507:    attachInput(window, 'click', onClick, true);` (`LESSONS.md:12`)
- current: "`attachInput` (`:440`) is the wrapper that calls `addEventListener`" — `extension/overlay.js:440` is `function attachInput(target, type, handler, capture) {` (`LESSONS.md:12-13`)
- current: "`onClick` (`:356`) returns unless `armed`" — `extension/overlay.js:356` is `function onClick(event) {` (`LESSONS.md:19`)
- current: "Corrected in `research/raw/m049-streams.json` at `74d00e63`" — the file exists and `git cat-file -t 74d00e63` → `commit` (`LESSONS.md:16`)
- current: the two archived documents it corrects exist — `.project/archive/049-interaction-story/review/FINAL.md` and `.project/archive/049-interaction-story/research/SYNTHESIS.md` (`LESSONS.md:9-10`)
- unverifiable: the refuted claim itself ("no file in `extension/` registers a `click`, `pointer*`, `mouse*` or `key*` listener") — falsifying it completely needs an enumeration of every listener registration by target and type; this audit confirmed only the one click listener at `:507` (`LESSONS.md:10-11`)

## docs/afk-run-2026-10-12.md

- stale: "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" — asserted at `docs/afk-run-2026-10-12.md:11`, contradicted by `.commandcode/skills` (dir listing), which holds no `verify-angular-dev-app` and only three `verify-*` skills total (`verify-ai-browsers`, `verify-angular-devtools`, `verify-pangular-inspector`) against five `control-*`
- current: "added `.audit/` (local briefs and todos) to `.gitignore`" — `.gitignore:15` is `.audit/` (`docs/afk-run-2026-10-12.md:40`)
- current: "Research `research/00`-`10`" — `research/` holds `00-browser-probe.md` through `10-model-capabilities.md` (and `11`-`20`) (`docs/afk-run-2026-10-12.md:29`)
- stale: "`docs/feature-proposals.md` section 8, \"Rulings from Lars\"" — asserted at `docs/afk-run-2026-10-12.md:27`, contradicted by `docs/feature-proposals.md:1038`, which reads `## 8. Decisions for Lars`
- stale: "check: `node .claude/skills/control-angular-dev-app/scripts/control.mjs up --target portal` exit 0 twice" — asserted at `docs/afk-run-2026-10-12.md:42`, contradicted by the tree: there is no `.claude` directory, so that command cannot be run as written
- current: "upstream bugs go to `docs/filing-ledger.md`" — the file exists (`docs/filing-ledger.md`) (`docs/afk-run-2026-10-12.md:19`)
- current: the cited commits resolve — `git cat-file -t d5c7125` → `commit` (`:40`) and `git cat-file -t 916fc09` → `commit` (`:57`) (`docs/afk-run-2026-10-12.md:40`, `:57`)
- unverifiable: "Only the four standing per-model instances run, each on one blank tab, plus Lars's everyday Edge, which is untouched" — needs a live look at the running browsers (`docs/afk-run-2026-10-12.md:15`)

## docs/autonomy-gaps.md

- current: "ten stops recorded first-hand in the M017 run" — `docs/autonomy-gaps.md` carries exactly ten `## Gap —` headings, at `:21`, `:37`, `:52`, `:66`, `:80`, `:96`, `:110`, `:128`, `:146` and `:164` (`docs/autonomy-gaps.md:6`)
- current: the pin citations name the right file and line — `scripts/autonomy-gaps.test.mjs:145` is the `G1 prompt pin` test, `:268` the `G9 static pin` test, `scripts/user-scope-autonomy.test.mjs:733` the `P4 serial-retry pin` test, `scripts/docs-audit-disposition.test.mjs:659` the `E6 queue numbers` test (`docs/autonomy-gaps.md:33`, `:160`, `:176`, `:160`)
- current: "`node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs` exit 0 — `ℹ tests 15 / ℹ pass 15 / ℹ fail 0`" — ran it: `ℹ tests 15`, `ℹ pass 15`, `ℹ fail 0`, with the G1 and G9 titles printed (`docs/autonomy-gaps.md:34`)
- current: "`✔ P4 serial-retry pin: a parked serial task is ready and a pending task retaining metadata fails`" — that test passes in today's run of `scripts/user-scope-autonomy.test.mjs` (`docs/autonomy-gaps.md:177`)
- stale: "`node --experimental-strip-types --test scripts/user-scope-autonomy.test.mjs` exit 0 — … `ℹ tests 18 / ℹ pass 18 / ℹ fail 0`" — asserted at `docs/autonomy-gaps.md:177`, contradicted today by the same command, which exits 1 with `ℹ tests 18 / ℹ pass 13 / ℹ fail 5`: the failing tests are `health: check() on the real resolved install reports no issues`, `E4: removing a rule token fails naming that file…`, `P3 check_handoffs pin…`, `E1 helper pin…` and `D1 dispatch pin…` in `scripts/user-scope-autonomy.test.mjs`
- current: "`scripts/docs-correction.test.mjs` resolves the chromium build from the strongest in-repo source" — the file exists — and "the installed gate at `…\gsd-path\scripts\check_docs_audit.py` was read for this analysis and never edited" — that path exists (`docs/autonomy-gaps.md:153`, `:158`)
- current: "the recipe already lives at `C:\Users\LarsGyrupBrinkNielse\.commandcode\references\gsd-path-autonomy-playbook.md` §31" — the file exists (`docs/autonomy-gaps.md:172`)

## Counts

| Verdict | Claims |
|---------|--------|
| current | 98 |
| stale | 14 |
| unverifiable | 23 |
| **total** | **135** |

Counted from the verdict lines in this file (`findstr /b /c:"- current:"`, `- stale:`, `- unverifiable:`).
