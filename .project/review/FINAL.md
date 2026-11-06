# Final Review — M034 lint-legacy

Reviewed HEAD: 578cc51542059e3f0a8babbab10bd86bfcb03f17
Overall verdict: fail (SC5 not met; SC1, SC2, SC3 and SC4 met)

This is the re-run of the gap review after the owner amended SC1 and SC2. The amendment is
disclosed in `.project/intent/INTENT.md:106-114` with the original SC1 and SC2 wording preserved
verbatim at `:110-111` (verified character for character against the pre-amendment headings this
file carried at `578cc51`), dated 2026-11-06, and attributed to the delegated ruling recorded at
`.project/plan/PLAN.md:17-25` — not to convenience. The pre-amendment review, which returned SC1
and SC2 not met at `4118849`, is preserved in git as `578cc51:.project/review/FINAL.md` and is
summarised in the amendment itself.

## Success criteria

### SC1 — On the fixture, a component the page shows as NgModule-declared produces a finding naming the component and stating that it is NgModule-declared, carrying the modern form and its source only from the cited equivalents table.

- **Verdict**: met (amended wording; the pre-amendment wording was judged **not met** at `4118849` —
  that record lives at `578cc51:.project/review/FINAL.md`, SC1 section, and is disclosed in
  `.project/intent/INTENT.md:106-109`)
- **Check**: the targeted suite run `node --experimental-strip-types --test "scripts/legacy-structure.test.mjs" "scripts/legacy-equivalents-capture.test.mjs" "scripts/panel-legacy.test.mjs"` — `tests 42 / pass 42 / fail 0`, including the AC1/E1 diagnostic printing the finding itself.
- **Observed**: under the amended criterion the subject is the structure axis, and it is shipped and
  proven. A component whose `ɵcmp.standalone` is false yields `{state:"finding","component":"SomeDeclaredComponent","structure":"NgModule-declared","modernForm":"removing standalone: false and adding dependencies to their imports array","source":"https://angular.dev/reference/migrations/standalone"}` (suite diagnostic, AC1/E1). The two strings are copied, never composed: `sourcedFor` returns an entry's own `modernForm` and `url` or nothing (`extension/legacy-structure.js:109-121`), the finding carries exactly those two fields (`:125-133`), and the mutant that renders a form no entry sources reddens the sourcing pin by name ("M1 reddens AC6: the finding must carry the modern form the equivalents table sources, verbatim"). The cited table is a real capture — one entry quoting `https://angular.dev/reference/migrations/standalone` with a verbatim 165-char quote, sha256-pinned page text (`209df753…`, 8424 chars) and a retrieval time (`research/raw/m034-equivalents.json:14-33`), and "a default run reads the stored text and fetches nothing" passed. The fixture component the page shows as NgModule-declared is `LegacyModulePage`, declared in the `@NgModule({ id: module.id })` module the recording documents (`research/raw/m034-legacy-diagnostic.json:23-29`).
- **Reference**: `extension/legacy-structure.js:109-133,148-166`; `research/raw/m034-equivalents.json:24-33`; `research/raw/m034-legacy-diagnostic.json:23-29`; `scripts/legacy-structure.test.mjs:338-389,590-616`.
- **Finding**: the amended SC1 is satisfied: the finding names the component, states the structure, and carries the modern form and its source only from the cited equivalents table.
- **Fix direction**: none

### SC2 — The finding is produced from observables the agent already collects - the component's `ɵcmp.standalone` read through the `ng` hooks - with no new page-side instrumentation, no build-log scraping and no dev-server dependency.

- **Verdict**: met (amended wording; the pre-amendment wording was judged **not met** at `4118849` —
  that record lives at `578cc51:.project/review/FINAL.md`, SC2 section, and is disclosed in
  `.project/intent/INTENT.md:106-109`)
- **Check**: the module read in full (`extension/legacy-structure.js`) and the purity and edge tests in the same 42/42 run ("loads in a context with no DOM, no window, no console and no clock", "reads no console, clock or DOM of its own, with all of them in reach (N1)", "names the component it was given, and reads no ɵcmp of its own", "produces no finding from a component's name, selector or file path").
- **Observed**: the module is an IIFE with no imports at all (`extension/legacy-structure.js:57-58`) — no build-log reader, no dev-server client, no network, no console, no DOM (header `:17-21`). Its sole input is the fact `{ name, standalone }`, where `standalone` is documented as "the boolean the caller read from `ɵcmp.standalone` in the page's own realm" (`:23-30`), read at `:88-94`; the suite proves the module never reaches for `ɵcmp` itself — a fact carrying a throwing `ɵcmp` getter still answers correctly (`scripts/legacy-structure.test.mjs:373-388`) and a fact whose flag was never translated yields `metadata-unreadable` (`:462-477`). The purity tests prove loading and joining install and read nothing even with console, clock, document and window in reach (`:299-315`). No new page-side instrumentation exists: the only global the module touches is its own namespace (`:168-183`). The dev server contributes nothing to the pipeline — the table is a one-time captured recording checked against its stored hash, not a runtime fetch (`scripts/legacy-equivalents-capture.test.mjs:519-540`).
- **Reference**: `extension/legacy-structure.js:17-30,57-58,88-94,148-166,168-183`; `scripts/legacy-structure.test.mjs:264-315,373-388,462-477,483-515`; `scripts/legacy-equivalents-capture.test.mjs:519-540`.
- **Finding**: the amended SC2 is satisfied: the finding is produced from exactly the `ɵcmp.standalone` observable the agent already collects, with no new instrumentation, no scraping and no dev-server dependency.
- **Fix direction**: none

### SC3 — A diagnostic whose code the digest does not carry, or which names no construct, reports "cannot tell" with the reason, rather than naming a modern equivalent it cannot source.

- **Verdict**: met
- **Check**: the join's cannot-tell cases and the equivalents suite's held-out mutants in the 42/42 run quoted under SC1 (`node --experimental-strip-types --test "scripts/legacy-structure.test.mjs" "scripts/legacy-equivalents-capture.test.mjs" "scripts/panel-legacy.test.mjs"`).
- **Observed**: three reasons, each printed as a suite diagnostic — `metadata-unreadable`, `already-standalone`, `no-sourced-equivalent` (`{"state":"cannot-tell","reason":"no-sourced-equivalent"}`); a table holding no sourced form for the structure yields cannot-tell naming no form across eleven hostile tables (`scripts/legacy-structure.test.mjs:537-575`), and the sourcing mutant reddens by name (`:590-616`). The recording side holds too: seven held-out mutants redden — a quote the page does not carry, a form no entry sources, edited text behind its hash, an unfetched URL, a foreign retrieval time, a disarmed capture command, a table with no NgModule-declared entry (all `✔` in the run output). The digest half is measured: for the captured code the digest carries it and states what it offers instead (`research/raw/m034-legacy-diagnostic.json:128-146`).
- **Reference**: `extension/legacy-structure.js:63-68,153-163`; `scripts/legacy-structure.test.mjs:394-575,590-616`; `scripts/legacy-equivalents-capture.test.mjs:544-619`; `research/raw/m034-legacy-diagnostic.json:128-146`.
- **Finding**: the protective behaviour SC3 demands — report cannot tell with the reason, never name an equivalent that cannot be sourced — is shipped and proven. Under the re-scope the criterion's subject is the structure axis and the "code the digest does not carry" branch is realized as `no-sourced-equivalent`; this is the reading the previous review recorded at `4118849` and the owner left SC3 unamended.
- **Fix direction**: none

### SC4 — The panel renders the construct, the code and the modern equivalent from a short fact list, and shows the "cannot tell" state, inventing neither a construct nor an equivalent.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "scripts/panel-legacy.test.mjs" "scripts/panel-routes.test.mjs"` — 14 panel tests and 4 route tests, all pass in the runs quoted here, all five panel mutants reddening by name in the run output — and `npx tsc -p apps/angular-ai-devtools/tsconfig.check.json` (echoed `TSC_EXIT_0`).
- **Observed**: `finding()` renders `component:`, `structure:`, `modernForm:` and `source:` from the fact it is handed (`apps/angular-ai-devtools/src/app/panel-legacy.ts:159-188`); `cannotTell()` renders only `reason:` (`:194-203`); a fact carrying a remedy, severity, owner or element renders none of them ("AC3: a fact carrying a remedy, a severity, an owner or an element renders none" passed), and `equivalentSourced: false` forces the form out ("AC2: a finding with no sourced form names no form and says none is recorded", `:55,258-270`). Nothing is invented: the shipped sample fact's `modernForm`/`source` are byte-identical to the cited table entry (`apps/angular-ai-devtools/src/app/panel-demo.ts:81-92` vs `research/raw/m034-equivalents.json:24-33` — both `"removing standalone: false and adding dependencies to their imports array"` at `https://angular.dev/reference/migrations/standalone`), and the route is loader-registered (`apps/angular-ai-devtools/src/app/panel-demo.ts:27`, "E4: every declared route surface has a panel-demo LOADERS key" passed). The "code" the pane carries is the structure the metadata names — `diagnosticCode` in a fact is dropped (`scripts/panel-legacy.test.mjs:30,306`), and no diagnostic code exists to render under the amended SC1 — the reading the wave review and the previous review both recorded.
- **Reference**: `apps/angular-ai-devtools/src/app/panel-legacy.ts:55,159-203,258-270`; `apps/angular-ai-devtools/src/app/panel-demo.ts:27,81-92`; `research/raw/m034-equivalents.json:24-33`; `scripts/panel-legacy.test.mjs:283-409,411-487`.
- **Finding**: the surface renders exactly what its fact list carries, shows the cannot-tell state with its reason, and invents neither a construct nor an equivalent.
- **Fix direction**: none

### SC5 — `npm run check` and `npm test` pass at the head.

- **Verdict**: not met
- **Check**: `npm run check` at this head — it **fails**; `npx prettier --check plans/angular-ai-devtools-program-backlog.md` at this head and on the `4118849` copy of the same file (scratchpad copy checked with `--config .prettierrc`); the verify ledger; `git show 578cc51 --stat`. The full `npm test` was not re-run (~7 minutes, green at `4118849` per the ledger and `.project/review/final-gap-1.md`), per the review brief.
- **Observed**: `npm run check` reaches its final stage and `format:check` fails: `[warn] plans/angular-ai-devtools-program-backlog.md — Code style issues found in the above file. Run Prettier with --write to fix.` Every earlier stage of the chain (`ensure-sidecar-deps`, the root `tsc`, `check:skills`, `check:panel`, `check:extension`, `check:companion`) exited 0, since the chain is `&&`-joined and `format:check` is last. The cause is the amendment commit itself: `578cc51` added the A12 ruling row at `plans/angular-ai-devtools-program-backlog.md:28` (shown by `git show 578cc51 -- plans/…`), and that row is not Prettier-clean at this head, while the same file at `4118849` is ("All matched files use Prettier code style!"). The verify ledger's full-project pass (`npm ci … && npm test`, exit 0) is recorded against `4118849de190cf9a1485547954b98f13e4fb8f3a`, not this head (`​.project/build/verify-ledger.jsonl:1`). Nothing in the milestone's product code fails: the failure is one unformatted markdown row introduced by the criteria-amendment commit.
- **Reference**: `plans/angular-ai-devtools-program-backlog.md:28`; `.project/build/verify-ledger.jsonl:1`; `git show 578cc51 --stat`; `.project/review/final-gap-1.md:3,16`.
- **Finding**: SC5 is not met at `578cc51`: `npm run check` does not pass at the head, and the regression arrived with the amendment commit, after the verify ledger's recorded pass at `4118849`.
- **Fix direction**: run `npx prettier --write plans/angular-ai-devtools-program-backlog.md` (or reformat the A12 row) and re-run `npm run check`; this file is outside this review's writable scope. After the format fix, `npm test` is the only remaining gate leg to demonstrate at the new head.

## Observations

- The amendment is honestly disclosed, not laundered: `## Corrections` preserves the original SC1
  and SC2 wording verbatim (verified character for character by a scratchpad script comparing
  `INTENT.md:110-111` against the pre-amendment headings), dates the amendment 2026-11-06, names
  the failed gap review at `4118849` that motivated it, and attributes the authority to the
  delegated ruling quoted at `.project/plan/PLAN.md:17-25` ("opt-in runtime instrumentation via for
  example providers but not dev server instrumentation") — a ruling, not a convenience.
- The re-recorded verdict claims match the amended criteria character for character: a scratchpad
  script comparing `research/raw/m034-verdict-claims.json` `criterionText` against
  `.project/intent/INTENT.md:36-40` (list ordinals stripped) returned `verbatim=true` for all five
  (SC1 224, SC2 224, SC3 175, SC4 175, SC5 48 chars).
- The fail verdict is now a single, narrow, self-inflicted formatting regression in the amendment
  commit — one Prettier-unclean markdown row in `plans/` — not a defect in the milestone's shipped
  behaviour. The milestone's own evidence is green at this head: 42/42 join/capture/panel tests,
  4/4 route tests, panel `tsc` clean, and the quoted held-out mutants all reddening by name.
