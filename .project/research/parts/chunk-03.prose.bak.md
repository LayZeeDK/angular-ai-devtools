# Chunk 3 — Nx Cloud / Nx CLI agent skills (inventory lines 41–60)

Audited HEAD: 067dc23ced80abcc535166297084626755f438e4

Tool versions used: Nx `v23.3.0` (local, `node_modules/.bin/nx.cmd --version`), `nx-cloud` from the same
install (`node_modules/.bin/nx-cloud.cmd`), Node v24.22.0, jq present on PATH, network reachable (the
Nx Cloud Public API spec and the npm registry answered). No write command was run: every `nx`/`nx-cloud`
call below is `--help`, `--version`, `show`, `api --describe|--list-operations|--print-api-spec`, or a
read of source. No task, generator, import, sync, install or format run was executed.

## .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

- current: the hold test renders `Counter` with `CartService` overridden to `['pear', 'plum']`, clicks Increment once halfway and checks the count rose by one — read `spikes/ng222-app/src/app/counter.spec.ts:56-74` (`it.runIf(Number(import.meta.env.VITE_COUNTER_HOLD_MS) > 0)`, `setup({ cartItems: ['pear', 'plum'] })` at `:61`, `await incrementButton.click()` at `:65`) (`held-counter.md:3`)
- current: during the hold the page shows `Clicks: 3 (double 6, cart 2)` and an Increment button — read `tmp/control-vitest-browser-angular/held-before.yml:3-4` (`paragraph [ref=f1e3]: "Clicks: 3 (double 6, cart 2)"`, `button "Increment" [ref=f1e4]`) (`held-counter.md:5`, `:31`)
- current: `up --hold <ms>` is a real subcommand — read `…/control-vitest-browser-angular/scripts/control.mjs:1874` (`usage: control.mjs <up|doctor|info|down> … [--hold <ms>]`), validation at `:268-275`, `VITE_COUNTER_HOLD_MS` set from `--hold` at `:802-803` (`held-counter.md:27`)
- current: `doctor` has a `mounted-component` check that explains a missing `[ng-version]` host — read `control.mjs:1677-1681` (`held-counter.md:27`)
- current: the host carries `ng-version="22.2.2"` — read `spikes/ng222-app/node_modules/@angular/core/package.json:3` (`"version": "22.2.2"`) (`held-counter.md:6`)
- current: the probe file exists and has the `'mount'`/`'after'` phases — read `spikes/probes/vitest-iframe-probe.js` (5669 bytes; `if (phase === 'after')` at `:19`, profiler install at `:146-155`) (`held-counter.md:37`)
- current: `ng.ɵgetSignalGraph`, `ɵgetDependenciesFromInjectable`, `ɵsetProfiler`, `ɵgetInjectorProviders`, `ɵgetInjectorResolutionPath` all exist in the installed typings — read `spikes/ng222-app/node_modules/@angular/core/types/core.d.ts` (`?getSignalGraph(injector: Injector): DebugSignalGraph;`, `?setProfiler(profiler: Profiler | null): () => void;`, etc.) (`held-counter.md:13`, `:15`, `:17`)
- current: `ng.ɵgetInjectorProviders` refusal message contains "only supports NodeInjector and EnvironmentInjector" — read `spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12312` (`throwError('getInjectorProviders only supports NodeInjector and EnvironmentInjector')`) (`held-counter.md:48`)
- current: the tester frame is named `vitest-iframe` — read `spikes/ng222-app/node_modules/@vitest/browser-playwright/dist/index.js` (frame name string present) (`held-counter.md:22`)
- unverifiable: the signal-graph edge list (`template div -> title, count, double, unnamed items`, `double -> count`, `effect -> count`) — needs a browser run of the probe inside the tester frame
- unverifiable: the `held-after.json` payload `{"text":"Clicks: 4 (double 8, cart 2)Increment","count":4,"cart":["pear","plum"]}` — needs a live drive; no `held-after.json` exists in the tree
- unverifiable: the host element id `rootN` and "`<app-counter>` does not exist under TestBed; select `[ng-version]`" — needs the running tester frame; the id generator is not in the installed packages I could read
- unverifiable: the held-di resolution path (`element -> DynamicTestModule -> Platform: core -> null`) — needs a browser evaluate of `ɵgetInjectorResolutionPath`
- unverifiable: the attach-mode profiler observation (only event ids 6 and 7 in two runs on 2026-10-16 vs 12 events over CDP) — needs an attached browser and a re-run
- unverifiable: "`doctor` exits 0" — needs a browser, a dev server and a running hold

## .commandcode/skills/link-workspace-packages/SKILL.md

- current: the package-manager branch the doc tells you to take resolves to npm — read root `package.json` (no `packageManager` field) and the root listing (`package-lock.json` present, no `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`, `bun.lockb`) (`SKILL.md:12`, `:19`)
- current: root `package.json` declares `"private": true` — read `package.json:2` (`SKILL.md:127`)
- current: the doc's `package.json` result shapes are npm/pnpm/yarn/bun syntax only, with no claim about this repo's `workspaces` field; root `package.json` has none (`SKILL.md:68-74`)
- unverifiable: `pnpm add @org/ui --workspace` and `pnpm add @org/ui --filter @org/app --workspace` (`SKILL.md:36`, `:39`) — pnpm is installed, but running either writes `package.json`, and the workspace has no `pnpm-workspace.yaml`
- unverifiable: `npm install @org/ui --workspace @org/app` (`SKILL.md:71`) — needs an npm-workspace repo to exercise; this repo has no `workspaces` field, and the command writes

## .commandcode/skills/monitor-ci/SKILL.md

- current: "this repository's `nx.json` contains neither" (`nxCloudId`/`nxCloudAccessToken`) — read `nx.json` in full; its only keys are `analytics`, `targetDefaults`, `plugins` (`@nx/playwright/plugin`), `generators` (`SKILL.md:43`)
- current: both deterministic scripts exist — read `scripts/ci-poll-decide.mjs` and `scripts/ci-state-update.mjs` under the skill dir (`SKILL.md:57`, `:58`)
- current: `ci-poll-decide.mjs` takes `<ci_info_json> <poll_count> <verbosity>` plus the documented flags — read `scripts/ci-poll-decide.mjs:14-19` (usage block) and `:32` (`const verbosity = args[2] || 'medium'`) (`SKILL.md:201-215`)
- current: `--timeout`/`--new-cipe-timeout` are passed in minutes and converted to seconds, and `--elapsed-seconds` is the authoritative budget signal — read `ci-poll-decide.mjs:21-24`, `:48-53` (`SKILL.md:217`)
- current: `ci-state-update.mjs cycle-check --code … --agent-triggered --cycle-count --max-cycles --env-rerun-count` — read `scripts/ci-state-update.mjs:12`, `:121-124` (`SKILL.md:298`)
- current: the `post-action` action-type list — read `ci-state-update.mjs:86-93` (`fix-auto-applying`, `apply-mcp`, `env-rerun`, `apply-local-push`, `reject-fix-push`, `local-fix-push`, `auto-fix-push`, `empty-commit-push`) (`SKILL.md:290`)
- current: `--max-cycles` default 10 — read `ci-state-update.mjs:123` (`parseInt(getArg('--max-cycles') || '10', 10)`) (`SKILL.md:26`)
- current: circuit breaker fires after 13 consecutive polls — read `ci-poll-decide.mjs:208` (`if (noProgressCount >= 13) … circuit_breaker`) and `:323` (`'No progress after 13 consecutive polls. Stopping.'`) (`SKILL.md:119`)
- current: the whole documented status vocabulary exists in the decision script — read `ci-poll-decide.mjs:211-302` and the message table `:326-365` (`ci_success`, `cipe_canceled`, `cipe_timed_out`, `polling_timeout`, `circuit_breaker`, `environment_rerun_cap`, `fix_auto_applying`, `fix_auto_apply_skipped`, `fix_needs_review`, `fix_apply_ready`, `fix_needs_local_verify`, `fix_failed`, `no_fix`, `environment_issue`, `self_healing_throttled`, `no_new_cipe`, `cipe_no_tasks`) (`SKILL.md:112-136`)
- current: the context substitutions work — ran `git branch --show-current` → `gsd-path/M052`, `git rev-parse --short HEAD` → `067dc23c`, `git status -sb` first line → `## gsd-path/M052` (`SKILL.md:12-15`)
- unverifiable: `ci_information` / `update_self_healing_fix` MCP tools and the `ci-monitor-subagent (haiku)` agent — no subagent or MCP definition exists in `.commandcode` (the string `ci-monitor-subagent` appears only in this SKILL.md); needs the Claude Code platform's agent and MCP registration
- unverifiable: the WAIT/LIGHT/HEAVY field names (`taskFailureSummaries`, `suggestedFixSummary`, `couldAutoApplyTasks`, …) (`SKILL.md:98-102`) — needs a live `ci_information` response; the Nx Cloud Public API spec has no `taskFailureSummaries` field at all
- unverifiable: the `APPLY` / `REJECT` / `RERUN_ENVIRONMENT_STATE` action vocabulary of `update_self_healing_fix` — needs the MCP tool

## .commandcode/skills/monitor-ci/references/fix-flows.md

- current: `ci-state-update.mjs gate --gate-type local-fix|env-rerun` — read `scripts/ci-state-update.mjs:10` (usage) and `:38`, `:57` (`gateType === 'env-rerun'`) (`fix-flows.md:33`, `:37`)
- current: `nx-cloud apply-locally <shortLink>` is a real command — ran `nx-cloud --help`; `apply-locally` is in the command list (`fix-flows.md:74`)
- current: the decision script really returns `autoApplySkipReason` and `verifiableTaskIds` — read `ci-poll-decide.mjs:429-432` (`result.verifiableTaskIds = …`, `result.autoApplySkipReason = …`) (`fix-flows.md:5`, `:16`)
- unverifiable: UPDATE_FIX / FETCH_HEAVY / FETCH_THROTTLE_INFO subagents and their `APPLY`/`REJECT`/`RERUN_ENVIRONMENT_STATE` payloads — needs the platform agent registry and MCP tools
- unverifiable: `selfHealingSkipMessage` and the `/cipes/{id}` throttle-message parse — needs a live throttled CIPE payload from `ci_information`

## .commandcode/skills/nx-cloud-api/SKILL.md

- current: `npx nx-cloud api --help` documents exactly the flags the doc describes (`-f/--field`, `-p/--path-param`, `--pages` default 1, `--page-size`, `--cursor`, `--format json|ndjson`, `-o/--output`, `-i/--include`, `--nxCloudId`, `--org`) — ran `node_modules/.bin/nx-cloud.cmd api --help`
- current: `npx nx-cloud api` alone prints the usage block — ran it; first line `Usage: npx nx-cloud api <path | link> [options]` (`SKILL.md:17`)
- current: `--print-api-spec` needs no credentials — ran it, exit 0, 315,724 bytes of OpenAPI 3.1 JSON (`SKILL.md:124`)
- current: `--list-operations` and `--describe` need no credentials — ran both, exit 0 (`SKILL.md:124`)
- current: the list wrapper is `{source, pagesFetched, fetchedItemCount, pageLimitReached, nextCursor, items}` — read the `Output:` section of `nx-cloud api --help` (`SKILL.md:139`)
- current: `--page-size` sets `limit`, max 500 — live spec `listCipes` parameter `limit`: "Rows per page, 1..500 (default 100)", `--describe cipes` (`SKILL.md:153`)
- current: exit codes `0` / `1` / `4` / `5` — read the help footer ("Exit codes: 0 success, 1 usage or network error, 4 client error (4xx), 5 server error (5xx)") (`SKILL.md:104-122`)
- current: exit 1 with a single `{"error":…}` record on stderr for an unconfigured workspace — ran `nx-cloud api cipes`; exit 1, one stderr line `{"error":{"type":"network","message":"Unable to authenticate… set the NX_CLOUD_ACCESS_TOKEN environment variable or define an access token in your nx.json."}}` (`SKILL.md:96`, `:115`)
- current: `NX_CLOUD_ACCESS_TOKEN` is the workspace-token variable the command names — same stderr message (`SKILL.md:115`)
- current: 400 `invalid_parameter` for an unknown query parameter — live spec `info.description`: "Repeat a key for list filters … An unknown query param gives 400 `invalid_parameter`" (`SKILL.md:112`)
- current: 429 `rate_limit_exceeded` (or empty body) and the four 503 codes `data_api_at_capacity`, `query_deadline_exceeded`, `audit_log_unavailable`, `rate_limit_unavailable` — read the `errors` block of `nx-cloud api --describe cipes` (`SKILL.md:120-121`)
- current: `npx nx-cloud login --status` exists — ran `nx-cloud login --help`; it lists `--status  Check and report current login status` (`SKILL.md:115`)
- current: `npx nx-cloud decrypt-artifact` exists — read the `nx-cloud --help` command list (`SKILL.md:106`)
- current: full URLs and app links on the configured host resolve — `nx-cloud api --help`: "URLs on the configured Nx Cloud host work too, including app links such as https://cloud.nx.app/cipes/<id>" (`SKILL.md:79`)
- current: `--format ndjson` prints only the rows — help: "With `--format ndjson`, one item per line and nothing else" (`SKILL.md:159`)
- unverifiable: "the command already retried 3 times honoring `Retry-After`" (`SKILL.md:120`, `:121`) — needs a live 429 or 503 from a credentialed workspace
- unverifiable: "Unknown query parameters are always rejected" (`SKILL.md:112`) — my uncredentialed `-f bogusParam=1` failed at authentication before parameter validation; needs a credentialed call
- unverifiable: the literal 404 `not_found` code (`SKILL.md:117`) — the spec states the semantics ("an unknown parent gives 404, never an empty page") but the code string needs a live 404
- unverifiable: `-o` files are "created owner-only" (`SKILL.md:88`) — needs a successful data response to inspect mode bits

## .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

- current: asset links are `returns: file` — ran `nx-cloud api --list-operations`; `downloadTaskAsset` is `{"operationId":"downloadTaskAsset","returns":"file"}` (`extraction-and-calculation.md:44`)
- current: `npx nx-cloud decrypt-artifact` — read the `nx-cloud --help` command list (`:47`)
- current: `task-stats` accepts `-f dateAfter`, `-f dateBefore`, `-f percentiles` — live spec `listTaskStats` parameters: `projectName, target, isCI, dateAfter, dateBefore, percentiles, limit, cursor, sort` (`:21-27`)
- current: completeness is judged by `nextCursor`/`pageLimitReached`, resumable with `--cursor` — `nx-cloud api --help` Navigation and `--pages`/`--cursor` sections (`:30-42`)
- unverifiable: "the command refuses to write a download to a terminal" (`:46`) — needs a live asset download
- unverifiable: "a non-empty gzip payload can contain a valid tar archive whose terminal-output entry is zero bytes" (`:52-60`) — needs a real task artifact

## .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

- current: `npx nx-cloud api --describe 'runs/{runId}/tasks'` resolves the path template — ran it; exit 0, `{"operationId":"listTasks","path":"/nx-cloud/data/v1/runs/{runId}/tasks","returns":"list"}` (`SKILL.md:47`)
- current: the `nx show project` + jq fragment returns the documented object — ran `nx.cmd show project angular-ai-devtools --json` through the doc's filter verbatim; output `{"executor":"@angular/build:unit-test","cache":true,"inputs":["default","^default"],"outputs":null,"options":{…},"selectedConfiguration":null}` (`SKILL.md:90-99`)
- current: `cache: true` on a target is reported by that query — same output, `"cache": true` (`SKILL.md:105-106`)
- current: the task-row projection fields exist — live spec `listTasks` response fields include `items[].id`, `items[].batchId`, `items[].status`, `items[].cacheStatus`, `items[].cacheable`, `items[].hash`, `items[].links` (`SKILL.md:48-54`)
- unverifiable: "A terminal `remote-cache-hit` proves Nx replay worked" and the six classification outcomes (`SKILL.md:118-160`) — needs a real run/task record from a credentialed workspace
- unverifiable: the change gate's approval step (step 5, "get explicit approval before an edit") — needs a person

## .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

- current: `npx nx-cloud api "<link>" -o <private-file>.tar.gz` is the documented download form and `-o` is real — `nx-cloud api --help` `-o, --output <file>` (`:5-6`)
- current: "The API cannot identify an upload path, writer, storage event, or service mutation" — ran `nx-cloud api --list-operations`; no operation for uploads, writers, storage events or mutations exists in the 33 documented routes (`:24`)
- unverifiable: byte count + SHA-256, compression-stream and member-table validation, "byte-identical malformed downloads across retries" (`:11-23`) — needs real cache artifacts

## .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

- current: "Task assets are typed `logs`, `artifact`, or `sandbox-report`" — live spec `downloadTaskAsset` path parameter `type`: "The asset type: `logs`, `artifact`, or `sandbox-report` (the Ultracache report)." (`:3`)
- current: the download form `npx nx-cloud api "<link>" -o <private-file>.tar.gz` — `nx-cloud api --help` `-o` (`:6`)
- unverifiable: "Identify its format from bytes", decoding, and the zero-byte output shape — needs a real log or report asset

## .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

- stale: "the `cipes` filter accepts only terminal statuses" — asserted at `.commandcode/skills/nx-cloud-ci-failure-review/SKILL.md:30`, contradicted by the live Public API spec that ships with the audited Nx 23.3.0: `nx-cloud api --describe cipes` returns `statuses` enum `["NOT_STARTED","IN_PROGRESS","SUCCEEDED","FAILED","CANCELED","TIMED_OUT"]` with "Select statuses. Omit to include every CIPE, in-progress ones included" — no in-tree line contradicts it; the spec is served by the installed CLI, not a file in the checkout
- current: the three values the doc queries (`FAILED`, `TIMED_OUT`, `CANCELED`) are valid `cipes` statuses — same `--describe cipes` enum (`:29`)
- current: the endpoints it names all exist — ran `nx-cloud api --list-operations`: `/cipes`, `/run-groups`, `/run-groups/{runGroupId}`, `/runs`, `/runs/{runId}/tasks`, `/run-groups/{runGroupId}/steps`, `/run-groups/{runGroupId}/instances` (`:35`)
- current: "the public API has no separate workflow routes" — the 33 documented paths contain no `workflows` route; workflows surface as `ci/{ciExecutionId}/jobs/{workflowKey}` (`:38`)
- current: run-group records carry `criticalErrorMessage` — read the full `--print-api-spec` output; the field name is present (`:81`)
- current: both CIPE and run-group lists filter on a `createdAfter`/`createdBefore` window (creation time), not failure time — live spec `listCipes` and `listRunGroups` parameters (`:25`)
- unverifiable: the 24-hour default, the 30-hour creation window and the "maximum normal six-hour CI duration" (`:24-27`) — needs the organization's CI configuration; no CI pipeline definition is in this checkout
- unverifiable: "a semaphore of at most five narrow detail requests" and "fetch logs only after a group reaches the top five" (`:53`) — needs live task groups
- unverifiable: the CODEOWNERS ownership step (`:94`) — no `CODEOWNERS` file exists in this checkout (only inside `node_modules/ecdsa-sig-formatter`), so the rule can only report absent evidence

## .commandcode/skills/nx-generate/SKILL.md

- current: `npx nx list` lists plugins — ran it; prints installed plugins (`@nx/angular`, `@nx/js`, `@nx/playwright`, `@nx/web`, …) (`:31`)
- current: `npx nx list @nx/react` is the right form — ran it; exit 0 with `@nx/react is not currently installed` (`:30`)
- current: `npx nx g <plugin>:<generator> --help` prints the generator's options — ran `nx g @nx/angular:library --help`; prints `NX generate @nx/angular:library [directory] [options,...]` and "From: @nx/angular (v23.3.0)" (`:48`)
- current: `node -e "console.log(require.resolve('@nx/<plugin>/generators.json'));"` resolves — ran it for `@nx/angular` → `…\node_modules\@nx\angular\generators.json` (`:87`)
- current: `--no-interactive` and `--dry-run` exist — `nx generate --help`: `--interactive  When false disables interactive input prompts for options. [boolean] [default: true]`, `-d, --dryRun  Preview the changes without updating files.` (`:19`, `:117-120`)
- current: `nx format:write` exists and overwrites un-formatted files — ran `nx format --help`; `nx format:write  Overwrite un-formatted files.` (`:152`)
- current: `nx run-many -t build,lint,test,typecheck` is a valid command form — ran `nx run-many --help` (`-t, --targets … [required]`); note this workspace has only `build`, `build-extension`, `test`, `generate-error-digest`, `serve`, `serve-static` (`nx show project angular-ai-devtools --json`), which the doc already frames as "just an example" (`:161`)
- unverifiable: the `--directory` placement warning (`--directory=libs` creating `libs/package.json` vs `--directory=libs/my-lib`) (`:96-102`) — needs an `@nx/react` generator run; `@nx/react` is not installed in this workspace

## .commandcode/skills/nx-import/SKILL.md

- current: `nx import` exists with the documented positionals and flags — ran `nx import --help`; `nx import [sourceRepository] [destinationDirectory]`, options `--source`, `--ref`, `--depth`, `--interactive [default: true]`, `--plugins`, `--verbose` (`:10`, `:17`, `:23`, `:66`)
- current: this workspace is on the "after 22.6.0" side and prompts by default — ran `nx --version` → `Local: v23.3.0`; `nx import --help` → `--interactive … [default: true]` (`:9`)
- current: `npx nx reset` exists — ran `nx reset --help`; "Clears cached Nx artifacts and metadata about the workspace and shuts down the Nx Daemon." (`:80`, `:90`)
- current: `npx nx add <plugin>` exists — ran `nx add --help`; `nx add <packageSpecifier>` "Install a plugin and initialize it." (`:89`)
- current: "`@nx/eslint` 23.3.0 peer-depends on `eslint@^9.0.0 || ^10.0.0`" — ran `npm view @nx/eslint@23.3.0 peerDependencies --json` → `{"eslint":"^9.0.0 || ^10.0.0","@nx/jest":"23.3.0","@zkochan/js-yaml":"0.0.7"}` (`:119`)
- unverifiable: "`nx import` responds with .ndjson outputs" (`:9`) — needs an actual import from a source repository (a write)
- unverifiable: `nx sync --yes` (`:80`) — `nx sync --help` lists only `--version` and `--verbose`; proving `--yes` needs to run the sync, which writes workspace files
- unverifiable: `pnpm add -wD eslint@^9 @nx/eslint-plugin typescript-eslint` (`:111`) — writes `package.json`, and this workspace has no `pnpm-workspace.yaml`

## .commandcode/skills/nx-import/references/ESLINT.md

- current: plugin options are set in `nx.json` `plugins[].options` (including `targetName`) — this workspace's own `nx.json:20-27` uses that shape for `@nx/playwright/plugin` (`{"plugin": "@nx/playwright/plugin", "options": {"targetName": "e2e"}}`) (`:15-20`)
- unverifiable: "`@nx/eslint/plugin` … detects both flat config files … and legacy config files" (`:9`) — `@nx/eslint` is not installed; needs the plugin
- unverifiable: "`@nx/eslint` init adds `eslint@^9.8.0` at the workspace root" (`:88`) — needs an `nx add @nx/eslint` run (a write)
- unverifiable: the `typescript-eslint@7.x` / eslint 9 peer conflict and its npm overrides fix (`:60-80`) — needs an npm workspace install

## .commandcode/skills/nx-import/references/GRADLE.md

- current: `nx show projects` works for verifying inferred projects — ran it; returns `ai-devtools-companion`, `angular-ai-devtools-e2e`, `angular-ai-devtools`, `angular-ai-devtools-workspace` (`:8`)
- unverifiable: `@nx/gradle` inferring projects from root `gradlew`/`gradle/wrapper` — `@nx/gradle` is not installed and the checkout has no Gradle files

## .commandcode/skills/nx-import/references/JEST.md

- unverifiable: "`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}` and creates a `test` target" (`:9`) — `@nx/jest` is not installed
- unverifiable: the root `jest.preset.js` content `require('@nx/jest/preset').default` (`:40`) — needs `@nx/jest`
- unverifiable: "`nx add @nx/jest` does NOT create `jest.preset.js`" (`:27-29`) — needs an `nx add` run (a write)

## .commandcode/skills/nx-import/references/NEXT.md

- unverifiable: "`@nx/next/plugin` … creates these targets: `build`, `dev`, `start`, `serve-static`, `build-deps`/`watch-deps`" (`:5-15`) — `@nx/next` and `next` are not installed
- unverifiable: "**No separate typecheck target**" for Next.js (`:17`) — needs a Next.js project in the workspace
- unverifiable: `composePlugins(withNx)` from `@nx/next` (`:23`) — needs `@nx/next`

## .commandcode/skills/nx-import/references/TURBOREPO.md

- current: `nx run-many -t build lint test typecheck` is a valid workspace-validation command — ran `nx run-many --help` (`:52`)
- unverifiable: the config-as-package merge procedure (`:13-46`) — this checkout contains no Turborepo source, `turbo.json`, or `@repo/*` config package, so there is nothing to check the procedure against

## .commandcode/skills/nx-import/references/VITE.md

- unverifiable: "`@nx/vite/plugin` defaults `typecheckTargetName` to `\"vite:typecheck\"`" (`:9`) — `@nx/vite` is not installed
- unverifiable: the `build`/`dev`/`serve`/`preview`/`serve-static` target sets per Vite flavour (`:24-60`, `:120-140`) — needs `@nx/vite`
- unverifiable: the `resolve.alias`/`__dirname`/`baseUrl` fixes (`:17-22`) — needs a non-Nx Vite source repo

## .commandcode/skills/nx-plugins/SKILL.md

- current: `npx nx list` lists plugins — ran it; prints "Installed plugins" and "Also available" (`:8`)
- current: `npx nx add <plugin>` installs and initializes a plugin — ran `nx add --help`; `nx add <packageSpecifier>` "Install a plugin and initialize it." (`:9`)
- unverifiable: `npx nx add @nx/react` (`:9`) — the command exists, but running it installs a package and edits `package.json`

## .commandcode/skills/nx-run-tasks/SKILL.md

- current: `nx show project <projectname> --json` exposes a `targets` section with inferred targets — ran it for `angular-ai-devtools`; six targets including the inferred `@angular/build:unit-test` `test` target (`:14`)
- current: `nx run <project>:<task>` is the single-task form — ran `nx run --help` (errors "Both project and target have to be specified") and `nx run angular-ai-devtools:test --help` (prints the task's options) (`:20-24`)
- current: `-p`, `--exclude`, `--parallel` with default 3 and `--projects=tag:api-*` — ran `nx run-many --help`: `-p, --projects`, `--exclude`, `--parallel … [default is 3]`, and the `tag:` examples (`:30-36`)
- current: `nx affected` with `--base`, `--head`, `--files` — ran `nx affected --help`, which documents all three including the `--files=libs/mylib/src/index.ts` example (`:42-49`)
- current: `--skipNxCache`, `--nxBail`, `--verbose`, `--configuration` on `run-many` and `affected` — ran `nx run-many --help` and `nx affected --help`; both list `-c, --configuration`, `--verbose`, `--nxBail`, `--skipNxCache, --disableNxCache` (`:55-58`)
- current: the package-manager hint resolves to npm here — root `package.json` has no `packageManager` field and the lockfile is `package-lock.json` (`:8`)
- unverifiable: "These flags work with `run` …" (`:55`) — `nx run <project>:<target> --help` prints only task options; proving `--skipNxCache`/`--nxBail`/`--configuration` on `run` requires executing a cached task (a write)

## Counts

| Verdict      | Claims |
| ------------ | ------ |
| current      | 80     |
| stale        | 1      |
| unverifiable | 46     |
| **total**    | 127    |

Unverifiable reasons, grouped: the plugin or package under test is not installed (`@nx/eslint`,
`@nx/jest`, `@nx/vite`, `@nx/next`, `@nx/gradle`, `@nx/react`) 11; needs a browser and the tester iframe 6;
needs a credentialed Nx Cloud response, record or asset 13; needs a command that writes, installs or
executes a task 10; needs the platform's agent/MCP registry 3; needs a person or a file this checkout
does not have 2; no source to check the procedure against (no Turborepo) 1.

Documents with no `current` claim at all: `nx-import/references/JEST.md`, `NEXT.md`, `VITE.md` — every
machine-checkable claim in them names a plugin this workspace does not install.
