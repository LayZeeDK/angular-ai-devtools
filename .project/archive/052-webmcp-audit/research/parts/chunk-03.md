# Chunk 3 — Nx Cloud / Nx CLI agent skills (inventory lines 41–60)
Audited HEAD: 067dc23ced80abcc535166297084626755f438e4

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the hold test renders `Counter` with `CartService` overridden to `['pear', 'plum']`, clicks Increment once halfway and checks the count rose by one | feature | verified | read `spikes/ng222-app/src/app/counter.spec.ts:56-74` (`it.runIf(Number(import.meta.env.VITE_COUNTER_HOLD_MS) > 0)`, `setup({ cartItems: ['pear', 'plum'] })` at `:61`, `await incrementButton.click()` at `:65`) (`held-counter.md:3`) |
| during the hold the page shows `Clicks: 3 (double 6, cart 2)` and an Increment button | feature | verified | read `tmp/control-vitest-browser-angular/held-before.yml:3-4` (`paragraph [ref=f1e3]: "Clicks: 3 (double 6, cart 2)"`, `button "Increment" [ref=f1e4]`) (`held-counter.md:5`, `:31`) |
| `up --hold <ms>` is a real subcommand | command | verified | read `…/control-vitest-browser-angular/scripts/control.mjs:1874` (`usage: control.mjs <up\|doctor\|info\|down> … [--hold <ms>]`), validation at `:268-275`, `VITE_COUNTER_HOLD_MS` set from `--hold` at `:802-803` (`held-counter.md:27`) |
| `doctor` has a `mounted-component` check that explains a missing `[ng-version]` host | config | verified | read `control.mjs:1677-1681` (`held-counter.md:27`) |
| the host carries `ng-version="22.2.2"` | config | verified | read `spikes/ng222-app/node_modules/@angular/core/package.json:3` (`"version": "22.2.2"`) (`held-counter.md:6`) |
| the probe file exists and has the `'mount'`/`'after'` phases | structure | verified | read `spikes/probes/vitest-iframe-probe.js` (5669 bytes; `if (phase === 'after')` at `:19`, profiler install at `:146-155`) (`held-counter.md:37`) |
| `ng.ɵgetSignalGraph`, `ɵgetDependenciesFromInjectable`, `ɵsetProfiler`, `ɵgetInjectorProviders`, `ɵgetInjectorResolutionPath` all exist in the installed typings | integration | verified | read `spikes/ng222-app/node_modules/@angular/core/types/core.d.ts` (`?getSignalGraph(injector: Injector): DebugSignalGraph;`, `?setProfiler(profiler: Profiler \| null): () => void;`, etc.) (`held-counter.md:13`, `:15`, `:17`) |
| `ng.ɵgetInjectorProviders` refusal message contains "only supports NodeInjector and EnvironmentInjector" | integration | verified | read `spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12312` (`throwError('getInjectorProviders only supports NodeInjector and EnvironmentInjector')`) (`held-counter.md:48`) |
| the tester frame is named `vitest-iframe` | feature | verified | read `spikes/ng222-app/node_modules/@vitest/browser-playwright/dist/index.js` (frame name string present) (`held-counter.md:22`) |
| the signal-graph edge list (`template div -> title, count, double, unnamed items`, `double -> count`, `effect -> count`) | feature | unverifiable | needs a browser run of the probe inside the tester frame |
| the `held-after.json` payload `{"text":"Clicks: 4 (double 8, cart 2)Increment","count":4,"cart":["pear","plum"]}` | structure | unverifiable | needs a live drive; no `held-after.json` exists in the tree |
| the host element id `rootN` and "`<app-counter>` does not exist under TestBed; select `[ng-version]`" | config | unverifiable | needs the running tester frame; the id generator is not in the installed packages I could read |
| the held-di resolution path (`element -> DynamicTestModule -> Platform: core -> null`) | structure | unverifiable | needs a browser evaluate of `ɵgetInjectorResolutionPath` |
| the attach-mode profiler observation (only event ids 6 and 7 in two runs on 2026-10-16 vs 12 events over CDP) | feature | unverifiable | needs an attached browser and a re-run |
| "`doctor` exits 0" | command | unverifiable | needs a browser, a dev server and a running hold |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the package-manager branch the doc tells you to take resolves to npm | feature | verified | read root `package.json` (no `packageManager` field) and the root listing (`package-lock.json` present, no `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`, `bun.lockb`) (`SKILL.md:12`, `:19`) |
| root `package.json` declares `"private": true` | structure | verified | read `package.json:2` (`SKILL.md:127`) |
| the doc's `package.json` result shapes are npm/pnpm/yarn/bun syntax only, with no claim about this repo's `workspaces` field; root `package.json` has none | structure | verified | `SKILL.md:68-74` |
| `pnpm add @org/ui --workspace` and `pnpm add @org/ui --filter @org/app --workspace` (`SKILL.md:36`, `:39`) | structure | unverifiable | pnpm is installed, but running either writes `package.json`, and the workspace has no `pnpm-workspace.yaml` |
| `npm install @org/ui --workspace @org/app` (`SKILL.md:71`) | command | unverifiable | needs an npm-workspace repo to exercise; this repo has no `workspaces` field, and the command writes |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "this repository's `nx.json` contains neither" (`nxCloudId`/`nxCloudAccessToken`) | structure | verified | read `nx.json` in full; its only keys are `analytics`, `targetDefaults`, `plugins` (`@nx/playwright/plugin`), `generators` (`SKILL.md:43`) |
| both deterministic scripts exist | structure | verified | read `scripts/ci-poll-decide.mjs` and `scripts/ci-state-update.mjs` under the skill dir (`SKILL.md:57`, `:58`) |
| `ci-poll-decide.mjs` takes `<ci_info_json> <poll_count> <verbosity>` plus the documented flags | structure | verified | read `scripts/ci-poll-decide.mjs:14-19` (usage block) and `:32` (`const verbosity = args[2] \|\| 'medium'`) (`SKILL.md:201-215`) |
| `--timeout`/`--new-cipe-timeout` are passed in minutes and converted to seconds, and `--elapsed-seconds` is the authoritative budget signal | command | verified | read `ci-poll-decide.mjs:21-24`, `:48-53` (`SKILL.md:217`) |
| `ci-state-update.mjs cycle-check --code … --agent-triggered --cycle-count --max-cycles --env-rerun-count` | config | verified | read `scripts/ci-state-update.mjs:12`, `:121-124` (`SKILL.md:298`) |
| the `post-action` action-type list | feature | verified | read `ci-state-update.mjs:86-93` (`fix-auto-applying`, `apply-mcp`, `env-rerun`, `apply-local-push`, `reject-fix-push`, `local-fix-push`, `auto-fix-push`, `empty-commit-push`) (`SKILL.md:290`) |
| `--max-cycles` default 10 | config | verified | read `ci-state-update.mjs:123` (`parseInt(getArg('--max-cycles') \|\| '10', 10)`) (`SKILL.md:26`) |
| circuit breaker fires after 13 consecutive polls | feature | verified | read `ci-poll-decide.mjs:208` (`if (noProgressCount >= 13) … circuit_breaker`) and `:323` (`'No progress after 13 consecutive polls. Stopping.'`) (`SKILL.md:119`) |
| the whole documented status vocabulary exists in the decision script | structure | verified | read `ci-poll-decide.mjs:211-302` and the message table `:326-365` (`ci_success`, `cipe_canceled`, `cipe_timed_out`, `polling_timeout`, `circuit_breaker`, `environment_rerun_cap`, `fix_auto_applying`, `fix_auto_apply_skipped`, `fix_needs_review`, `fix_apply_ready`, `fix_needs_local_verify`, `fix_failed`, `no_fix`, `environment_issue`, `self_healing_throttled`, `no_new_cipe`, `cipe_no_tasks`) (`SKILL.md:112-136`) |
| the context substitutions work | feature | verified | ran `git branch --show-current` → `gsd-path/M052`, `git rev-parse --short HEAD` → `067dc23c`, `git status -sb` first line → `## gsd-path/M052` (`SKILL.md:12-15`) |
| `ci_information` / `update_self_healing_fix` MCP tools and the `ci-monitor-subagent (haiku)` agent | feature | unverifiable | no subagent or MCP definition exists in `.commandcode` (the string `ci-monitor-subagent` appears only in this SKILL.md); needs the Claude Code platform's agent and MCP registration |
| the WAIT/LIGHT/HEAVY field names (`taskFailureSummaries`, `suggestedFixSummary`, `couldAutoApplyTasks`, …) (`SKILL.md:98-102`) | feature | unverifiable | needs a live `ci_information` response; the Nx Cloud Public API spec has no `taskFailureSummaries` field at all |
| the `APPLY` / `REJECT` / `RERUN_ENVIRONMENT_STATE` action vocabulary of `update_self_healing_fix` | feature | unverifiable | needs the MCP tool |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `ci-state-update.mjs gate --gate-type local-fix\|env-rerun` | config | verified | read `scripts/ci-state-update.mjs:10` (usage) and `:38`, `:57` (`gateType === 'env-rerun'`) (`fix-flows.md:33`, `:37`) |
| `nx-cloud apply-locally <shortLink>` is a real command | command | verified | ran `nx-cloud --help`; `apply-locally` is in the command list (`fix-flows.md:74`) |
| the decision script really returns `autoApplySkipReason` and `verifiableTaskIds` | feature | verified | read `ci-poll-decide.mjs:429-432` (`result.verifiableTaskIds = …`, `result.autoApplySkipReason = …`) (`fix-flows.md:5`, `:16`) |
| UPDATE_FIX / FETCH_HEAVY / FETCH_THROTTLE_INFO subagents and their `APPLY`/`REJECT`/`RERUN_ENVIRONMENT_STATE` payloads | feature | unverifiable | needs the platform agent registry and MCP tools |
| `selfHealingSkipMessage` and the `/cipes/{id}` throttle-message parse | feature | unverifiable | needs a live throttled CIPE payload from `ci_information` |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `npx nx-cloud api --help` documents exactly the flags the doc describes (`-f/--field`, `-p/--path-param`, `--pages` default 1, `--page-size`, `--cursor`, `--format json\|ndjson`, `-o/--output`, `-i/--include`, `--nxCloudId`, `--org`) | command | verified | ran `node_modules/.bin/nx-cloud.cmd api --help` |
| `npx nx-cloud api` alone prints the usage block | command | verified | ran it; first line `Usage: npx nx-cloud api <path \| link> [options]` (`SKILL.md:17`) |
| `--print-api-spec` needs no credentials | integration | verified | ran it, exit 0, 315,724 bytes of OpenAPI 3.1 JSON (`SKILL.md:124`) |
| `--list-operations` and `--describe` need no credentials | feature | verified | ran both, exit 0 (`SKILL.md:124`) |
| the list wrapper is `{source, pagesFetched, fetchedItemCount, pageLimitReached, nextCursor, items}` | feature | verified | read the `Output:` section of `nx-cloud api --help` (`SKILL.md:139`) |
| `--page-size` sets `limit`, max 500 | feature | verified | live spec `listCipes` parameter `limit`: "Rows per page, 1..500 (default 100)", `--describe cipes` (`SKILL.md:153`) |
| exit codes `0` / `1` / `4` / `5` | feature | verified | read the help footer ("Exit codes: 0 success, 1 usage or network error, 4 client error (4xx), 5 server error (5xx)") (`SKILL.md:104-122`) |
| exit 1 with a single `{"error":…}` record on stderr for an unconfigured workspace | command | verified | ran `nx-cloud api cipes`; exit 1, one stderr line `{"error":{"type":"network","message":"Unable to authenticate… set the NX_CLOUD_ACCESS_TOKEN environment variable or define an access token in your nx.json."}}` (`SKILL.md:96`, `:115`) |
| `NX_CLOUD_ACCESS_TOKEN` is the workspace-token variable the command names | command | verified | same stderr message (`SKILL.md:115`) |
| 400 `invalid_parameter` for an unknown query parameter | feature | verified | live spec `info.description`: "Repeat a key for list filters … An unknown query param gives 400 `invalid_parameter`" (`SKILL.md:112`) |
| 429 `rate_limit_exceeded` (or empty body) and the four 503 codes `data_api_at_capacity`, `query_deadline_exceeded`, `audit_log_unavailable`, `rate_limit_unavailable` | feature | verified | read the `errors` block of `nx-cloud api --describe cipes` (`SKILL.md:120-121`) |
| `npx nx-cloud login --status` exists | command | verified | ran `nx-cloud login --help`; it lists `--status  Check and report current login status` (`SKILL.md:115`) |
| `npx nx-cloud decrypt-artifact` exists | command | verified | read the `nx-cloud --help` command list (`SKILL.md:106`) |
| full URLs and app links on the configured host resolve | config | verified | `nx-cloud api --help`: "URLs on the configured Nx Cloud host work too, including app links such as https://cloud.nx.app/cipes/<id>" (`SKILL.md:79`) |
| `--format ndjson` prints only the rows | feature | verified | help: "With `--format ndjson`, one item per line and nothing else" (`SKILL.md:159`) |
| "the command already retried 3 times honoring `Retry-After`" (`SKILL.md:120`, `:121`) | command | unverifiable | needs a live 429 or 503 from a credentialed workspace |
| "Unknown query parameters are always rejected" (`SKILL.md:112`) | feature | unverifiable | my uncredentialed `-f bogusParam=1` failed at authentication before parameter validation; needs a credentialed call |
| the literal 404 `not_found` code (`SKILL.md:117`) | feature | unverifiable | the spec states the semantics ("an unknown parent gives 404, never an empty page") but the code string needs a live 404 |
| `-o` files are "created owner-only" (`SKILL.md:88`) | structure | unverifiable | needs a successful data response to inspect mode bits |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| asset links are `returns: file` | structure | verified | ran `nx-cloud api --list-operations`; `downloadTaskAsset` is `{"operationId":"downloadTaskAsset","returns":"file"}` (`extraction-and-calculation.md:44`) |
| `npx nx-cloud decrypt-artifact` | command | verified | read the `nx-cloud --help` command list (`:47`) |
| `task-stats` accepts `-f dateAfter`, `-f dateBefore`, `-f percentiles` | feature | verified | live spec `listTaskStats` parameters: `projectName, target, isCI, dateAfter, dateBefore, percentiles, limit, cursor, sort` (`:21-27`) |
| completeness is judged by `nextCursor`/`pageLimitReached`, resumable with `--cursor` | feature | verified | `nx-cloud api --help` Navigation and `--pages`/`--cursor` sections (`:30-42`) |
| "the command refuses to write a download to a terminal" (`:46`) | command | unverifiable | needs a live asset download |
| "a non-empty gzip payload can contain a valid tar archive whose terminal-output entry is zero bytes" (`:52-60`) | feature | unverifiable | needs a real task artifact |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `npx nx-cloud api --describe 'runs/{runId}/tasks'` resolves the path template | command | verified | ran it; exit 0, `{"operationId":"listTasks","path":"/nx-cloud/data/v1/runs/{runId}/tasks","returns":"list"}` (`SKILL.md:47`) |
| the `nx show project` + jq fragment returns the documented object | feature | verified | ran `nx.cmd show project angular-ai-devtools --json` through the doc's filter verbatim; output `{"executor":"@angular/build:unit-test","cache":true,"inputs":["default","^default"],"outputs":null,"options":{…},"selectedConfiguration":null}` (`SKILL.md:90-99`) |
| `cache: true` on a target is reported by that query | feature | verified | same output, `"cache": true` (`SKILL.md:105-106`) |
| the task-row projection fields exist | structure | verified | live spec `listTasks` response fields include `items[].id`, `items[].batchId`, `items[].status`, `items[].cacheStatus`, `items[].cacheable`, `items[].hash`, `items[].links` (`SKILL.md:48-54`) |
| "A terminal `remote-cache-hit` proves Nx replay worked" and the six classification outcomes (`SKILL.md:118-160`) | feature | unverifiable | needs a real run/task record from a credentialed workspace |
| the change gate's approval step (step 5, "get explicit approval before an edit") | feature | unverifiable | needs a person |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `npx nx-cloud api "<link>" -o <private-file>.tar.gz` is the documented download form and `-o` is real | command | verified | `nx-cloud api --help` `-o, --output <file>` (`:5-6`) |
| "The API cannot identify an upload path, writer, storage event, or service mutation" | integration | verified | ran `nx-cloud api --list-operations`; no operation for uploads, writers, storage events or mutations exists in the 33 documented routes (`:24`) |
| byte count + SHA-256, compression-stream and member-table validation, "byte-identical malformed downloads across retries" (`:11-23`) | structure | unverifiable | needs real cache artifacts |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | feature | verified | live spec `downloadTaskAsset` path parameter `type`: "The asset type: `logs`, `artifact`, or `sandbox-report` (the Ultracache report)." (`:3`) |
| the download form `npx nx-cloud api "<link>" -o <private-file>.tar.gz` | command | verified | `nx-cloud api --help` `-o` (`:6`) |
| "Identify its format from bytes", decoding, and the zero-byte output shape | feature | unverifiable | needs a real log or report asset |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "the `cipes` filter accepts only terminal statuses" | feature | stale | asserted at `.commandcode/skills/nx-cloud-ci-failure-review/SKILL.md:30`, contradicted by the live Public API spec that ships with the audited Nx 23.3.0: `nx-cloud api --describe cipes` returns `statuses` enum `["NOT_STARTED","IN_PROGRESS","SUCCEEDED","FAILED","CANCELED","TIMED_OUT"]` with "Select statuses. Omit to include every CIPE, in-progress ones included" — no in-tree line contradicts it; the spec is served by the installed CLI, not a file in the checkout |
| the three values the doc queries (`FAILED`, `TIMED_OUT`, `CANCELED`) are valid `cipes` statuses | feature | verified | same `--describe cipes` enum (`:29`) |
| the endpoints it names all exist | structure | verified | ran `nx-cloud api --list-operations`: `/cipes`, `/run-groups`, `/run-groups/{runGroupId}`, `/runs`, `/runs/{runId}/tasks`, `/run-groups/{runGroupId}/steps`, `/run-groups/{runGroupId}/instances` (`:35`) |
| "the public API has no separate workflow routes" | integration | verified | the 33 documented paths contain no `workflows` route; workflows surface as `ci/{ciExecutionId}/jobs/{workflowKey}` (`:38`) |
| run-group records carry `criticalErrorMessage` | feature | verified | read the full `--print-api-spec` output; the field name is present (`:81`) |
| both CIPE and run-group lists filter on a `createdAfter`/`createdBefore` window (creation time), not failure time | feature | verified | live spec `listCipes` and `listRunGroups` parameters (`:25`) |
| the 24-hour default, the 30-hour creation window and the "maximum normal six-hour CI duration" (`:24-27`) | config | unverifiable | needs the organization's CI configuration; no CI pipeline definition is in this checkout |
| "a semaphore of at most five narrow detail requests" and "fetch logs only after a group reaches the top five" (`:53`) | feature | unverifiable | needs live task groups |
| the CODEOWNERS ownership step (`:94`) | feature | unverifiable | no `CODEOWNERS` file exists in this checkout (only inside `node_modules/ecdsa-sig-formatter`), so the rule can only report absent evidence |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `npx nx list` lists plugins | command | verified | ran it; prints installed plugins (`@nx/angular`, `@nx/js`, `@nx/playwright`, `@nx/web`, …) (`:31`) |
| `npx nx list @nx/react` is the right form | command | verified | ran it; exit 0 with `@nx/react is not currently installed` (`:30`) |
| `npx nx g <plugin>:<generator> --help` prints the generator's options | command | verified | ran `nx g @nx/angular:library --help`; prints `NX generate @nx/angular:library [directory] [options,...]` and "From: @nx/angular (v23.3.0)" (`:48`) |
| `node -e "console.log(require.resolve('@nx/<plugin>/generators.json'));"` resolves | command | verified | ran it for `@nx/angular` → `…\node_modules\@nx\angular\generators.json` (`:87`) |
| `--no-interactive` and `--dry-run` exist | structure | verified | `nx generate --help`: `--interactive  When false disables interactive input prompts for options. [boolean] [default: true]`, `-d, --dryRun  Preview the changes without updating files.` (`:19`, `:117-120`) |
| `nx format:write` exists and overwrites un-formatted files | structure | verified | ran `nx format --help`; `nx format:write  Overwrite un-formatted files.` (`:152`) |
| `nx run-many -t build,lint,test,typecheck` is a valid command form | command | verified | ran `nx run-many --help` (`-t, --targets … [required]`); note this workspace has only `build`, `build-extension`, `test`, `generate-error-digest`, `serve`, `serve-static` (`nx show project angular-ai-devtools --json`), which the doc already frames as "just an example" (`:161`) |
| the `--directory` placement warning (`--directory=libs` creating `libs/package.json` vs `--directory=libs/my-lib`) (`:96-102`) | structure | unverifiable | needs an `@nx/react` generator run; `@nx/react` is not installed in this workspace |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `nx import` exists with the documented positionals and flags | structure | verified | ran `nx import --help`; `nx import [sourceRepository] [destinationDirectory]`, options `--source`, `--ref`, `--depth`, `--interactive [default: true]`, `--plugins`, `--verbose` (`:10`, `:17`, `:23`, `:66`) |
| this workspace is on the "after 22.6.0" side and prompts by default | config | verified | ran `nx --version` → `Local: v23.3.0`; `nx import --help` → `--interactive … [default: true]` (`:9`) |
| `npx nx reset` exists | command | verified | ran `nx reset --help`; "Clears cached Nx artifacts and metadata about the workspace and shuts down the Nx Daemon." (`:80`, `:90`) |
| `npx nx add <plugin>` exists | command | verified | ran `nx add --help`; `nx add <packageSpecifier>` "Install a plugin and initialize it." (`:89`) |
| "`@nx/eslint` 23.3.0 peer-depends on `eslint@^9.0.0 \|\| ^10.0.0`" | feature | verified | ran `npm view @nx/eslint@23.3.0 peerDependencies --json` → `{"eslint":"^9.0.0 \|\| ^10.0.0","@nx/jest":"23.3.0","@zkochan/js-yaml":"0.0.7"}` (`:119`) |
| "`nx import` responds with .ndjson outputs" (`:9`) | feature | unverifiable | needs an actual import from a source repository (a write) |
| `nx sync --yes` (`:80`) | feature | unverifiable | `nx sync --help` lists only `--version` and `--verbose`; proving `--yes` needs to run the sync, which writes workspace files |
| `pnpm add -wD eslint@^9 @nx/eslint-plugin typescript-eslint` (`:111`) | feature | unverifiable | writes `package.json`, and this workspace has no `pnpm-workspace.yaml` |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| plugin options are set in `nx.json` `plugins[].options` (including `targetName`) | structure | verified | this workspace's own `nx.json:20-27` uses that shape for `@nx/playwright/plugin` (`{"plugin": "@nx/playwright/plugin", "options": {"targetName": "e2e"}}`) (`:15-20`) |
| "`@nx/eslint/plugin` … detects both flat config files … and legacy config files" (`:9`) | config | unverifiable | `@nx/eslint` is not installed; needs the plugin |
| "`@nx/eslint` init adds `eslint@^9.8.0` at the workspace root" (`:88`) | structure | unverifiable | needs an `nx add @nx/eslint` run (a write) |
| the `typescript-eslint@7.x` / eslint 9 peer conflict and its npm overrides fix (`:60-80`) | feature | unverifiable | needs an npm workspace install |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `nx show projects` works for verifying inferred projects | feature | verified | ran it; returns `ai-devtools-companion`, `angular-ai-devtools-e2e`, `angular-ai-devtools`, `angular-ai-devtools-workspace` (`:8`) |
| `@nx/gradle` inferring projects from root `gradlew`/`gradle/wrapper` | feature | unverifiable | `@nx/gradle` is not installed and the checkout has no Gradle files |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}` and creates a `test` target" (`:9`) | config | unverifiable | `@nx/jest` is not installed |
| the root `jest.preset.js` content `require('@nx/jest/preset').default` (`:40`) | config | unverifiable | needs `@nx/jest` |
| "`nx add @nx/jest` does NOT create `jest.preset.js`" (`:27-29`) | structure | unverifiable | needs an `nx add` run (a write) |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "`@nx/next/plugin` … creates these targets: `build`, `dev`, `start`, `serve-static`, `build-deps`/`watch-deps`" (`:5-15`) | feature | unverifiable | `@nx/next` and `next` are not installed |
| "**No separate typecheck target**" for Next.js (`:17`) | feature | unverifiable | needs a Next.js project in the workspace |
| `composePlugins(withNx)` from `@nx/next` (`:23`) | feature | unverifiable | needs `@nx/next` |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `nx run-many -t build lint test typecheck` is a valid workspace-validation command | command | verified | ran `nx run-many --help` (`:52`) |
| the config-as-package merge procedure (`:13-46`) | config | unverifiable | this checkout contains no Turborepo source, `turbo.json`, or `@repo/*` config package, so there is nothing to check the procedure against |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "`@nx/vite/plugin` defaults `typecheckTargetName` to `\"vite:typecheck\"`" (`:9`) | feature | unverifiable | `@nx/vite` is not installed |
| the `build`/`dev`/`serve`/`preview`/`serve-static` target sets per Vite flavour (`:24-60`, `:120-140`) | feature | unverifiable | needs `@nx/vite` |
| the `resolve.alias`/`__dirname`/`baseUrl` fixes (`:17-22`) | feature | unverifiable | needs a non-Nx Vite source repo |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `npx nx list` lists plugins | command | verified | ran it; prints "Installed plugins" and "Also available" (`:8`) |
| `npx nx add <plugin>` installs and initializes a plugin | command | verified | ran `nx add --help`; `nx add <packageSpecifier>` "Install a plugin and initialize it." (`:9`) |
| `npx nx add @nx/react` (`:9`) | command | unverifiable | the command exists, but running it installs a package and edits `package.json` |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `nx show project <projectname> --json` exposes a `targets` section with inferred targets | command | verified | ran it for `angular-ai-devtools`; six targets including the inferred `@angular/build:unit-test` `test` target (`:14`) |
| `nx run <project>:<task>` is the single-task form | feature | verified | ran `nx run --help` (errors "Both project and target have to be specified") and `nx run angular-ai-devtools:test --help` (prints the task's options) (`:20-24`) |
| `-p`, `--exclude`, `--parallel` with default 3 and `--projects=tag:api-*` | integration | verified | ran `nx run-many --help`: `-p, --projects`, `--exclude`, `--parallel … [default is 3]`, and the `tag:` examples (`:30-36`) |
| `nx affected` with `--base`, `--head`, `--files` | structure | verified | ran `nx affected --help`, which documents all three including the `--files=libs/mylib/src/index.ts` example (`:42-49`) |
| `--skipNxCache`, `--nxBail`, `--verbose`, `--configuration` on `run-many` and `affected` | config | verified | ran `nx run-many --help` and `nx affected --help`; both list `-c, --configuration`, `--verbose`, `--nxBail`, `--skipNxCache, --disableNxCache` (`:55-58`) |
| the package-manager hint resolves to npm here | feature | verified | root `package.json` has no `packageManager` field and the lockfile is `package-lock.json` (`:8`) |
| "These flags work with `run` …" (`:55`) | feature | unverifiable | `nx run <project>:<target> --help` prints only task options; proving `--skipNxCache`/`--nxBail`/`--configuration` on `run` requires executing a cached task (a write) |

## Counts (recomputed; informational, not audited rows)

- verified: 80
- stale: 1
- unverifiable: 46
- aspirational: 0
- total: 127
