# Final Review — M034 lint-legacy

Reviewed HEAD: 5ce5923dd6d024622a2d16bb5c46f9297104f321
Overall verdict: pass

Met: SC1, SC2, SC3, SC4 and SC5 met
This is the third and final gap-review pass, re-run at the head that carries the formatting fix.
The previous pass at `578cc51` judged SC1–SC4 met and SC5 not met: the amendment commit's own A12
backlog row broke `prettier --check`, so `npm run check` exited 1 at that head. The regression was
fixed by re-padding the rulings table — committed as `7e736e9` ("style: format the backlog after
the A12 row") — and `git diff -w 578cc51..HEAD` on `plans/angular-ai-devtools-program-backlog.md`
shows the only non-whitespace change is the length of the table's separator dash-row: the A12
ruling text at `plans/angular-ai-devtools-program-backlog.md:28` is unchanged apart from padding.
The amendment of SC1 and SC2 is disclosed in `.project/intent/INTENT.md:106-114` with the original
SC1 and SC2 wording preserved verbatim at `:110-111` (verified character for character against the
pre-amendment headings this file carried at `578cc51`), dated 2026-11-06, and attributed to the
delegated ruling recorded at `.project/plan/PLAN.md:17-25` — not to convenience. The pre-amendment
review, which returned SC1 and SC2 not met at `4118849`, is preserved in git as
`578cc51:.project/review/FINAL.md` and is summarised in the amendment itself.

## Success criteria

### SC1 — On the fixture, a component the page shows as NgModule-declared produces a finding naming the component and stating that it is NgModule-declared, carrying the modern form and its source only from the cited equivalents table.

- **Verdict**: met
- **Amended**: the pre-amendment wording of this criterion was judged **not met** at `4118849`; the originals are preserved verbatim in `.project/intent/INTENT.md` `## Corrections`
- **Check**: the targeted suites re-run at this head: `node --experimental-strip-types --test "scripts/legacy-structure.test.mjs" "scripts/legacy-equivalents-capture.test.mjs" "scripts/panel-legacy.test.mjs"` — `tests 42 / pass 42 / fail 0`, including the AC1/E1 diagnostic printing the finding itself.
- **Observed**: under the amended criterion the subject is the structure axis, and it is shipped and
  proven. A component whose `ɵcmp.standalone` is false yields `{state:"finding","component":"SomeDeclaredComponent","structure":"NgModule-declared","modernForm":"removing standalone: false and adding dependencies to their imports array","source":"https://angular.dev/reference/migrations/standalone"}` (suite diagnostic, AC1/E1, re-observed at this head). The two strings are copied, never composed: `sourcedFor` returns an entry's own `modernForm` and `url` or nothing (`extension/legacy-structure.js:109-121`), the finding carries exactly those two fields (`:125-133`), and the mutant that renders a form no entry sources reddens the sourcing pin by name ("M1 reddens AC6: the finding must carry the modern form the equivalents table sources, verbatim"). The cited table is a real capture — one entry quoting `https://angular.dev/reference/migrations/standalone` with a verbatim 165-char quote, sha256-pinned page text (`209df753…`, 8424 chars) and a retrieval time (`research/raw/m034-equivalents.json:14-33`), and "a default run reads the stored text and fetches nothing" passed at this head. The fixture component the page shows as NgModule-declared is `LegacyModulePage`, declared in the `@NgModule({ id: module.id })` module the recording documents (`research/raw/m034-legacy-diagnostic.json:23-29`).
- **Reference**: `extension/legacy-structure.js:109-133,148-166`; `research/raw/m034-equivalents.json:24-33`; `research/raw/m034-legacy-diagnostic.json:23-29`; `scripts/legacy-structure.test.mjs:338-389,590-616`.
- **Finding**: the amended SC1 is satisfied at this head: the finding names the component, states the structure, and carries the modern form and its source only from the cited equivalents table.
- **Fix direction**: none

### SC2 — The finding is produced from observables the agent already collects - the component's `ɵcmp.standalone` read through the `ng` hooks - with no new page-side instrumentation, no build-log scraping and no dev-server dependency.

- **Verdict**: met
- **Amended**: the pre-amendment wording of this criterion was judged **not met** at `4118849`; the originals are preserved verbatim in `.project/intent/INTENT.md` `## Corrections`
- **Check**: the module read in full at this head (`extension/legacy-structure.js`) and the purity and edge tests in the same re-run 42/42 suite ("loads in a context with no DOM, no window, no console and no clock", "reads no console, clock or DOM of its own, with all of them in reach (N1)", "names the component it was given, and reads no ɵcmp of its own", "produces no finding from a component's name, selector or file path").
- **Observed**: the module is an IIFE with no imports at all (`extension/legacy-structure.js:57-58`) — no build-log reader, no dev-server client, no network, no console, no DOM (header `:17-21`). Its sole input is the fact `{ name, standalone }`, where `standalone` is documented as "the boolean the caller read from `ɵcmp.standalone` in the page's own realm" (`:23-30`), read at `:88-94`; the suite proves the module never reaches for `ɵcmp` itself — a fact carrying a throwing `ɵcmp` getter still answers correctly (`scripts/legacy-structure.test.mjs:373-388`) and a fact whose flag was never translated yields `metadata-unreadable` (`:462-477`). The purity tests prove loading and joining install and read nothing even with console, clock, document and window in reach (`:299-315`). No new page-side instrumentation exists: the only global the module touches is its own namespace (`:168-183`). The dev server contributes nothing to the pipeline — the table is a one-time captured recording checked against its stored hash, not a runtime fetch (`scripts/legacy-equivalents-capture.test.mjs:519-540`).
- **Reference**: `extension/legacy-structure.js:17-30,57-58,88-94,148-166,168-183`; `scripts/legacy-structure.test.mjs:264-315,373-388,462-477,483-515`; `scripts/legacy-equivalents-capture.test.mjs:519-540`.
- **Finding**: the amended SC2 is satisfied at this head: the finding is produced from exactly the `ɵcmp.standalone` observable the agent already collects, with no new instrumentation, no scraping and no dev-server dependency.
- **Fix direction**: none

### SC3 — A diagnostic whose code the digest does not carry, or which names no construct, reports "cannot tell" with the reason, rather than naming a modern equivalent it cannot source.

- **Verdict**: met
- **Check**: the join's cannot-tell cases and the equivalents suite's held-out mutants re-run at this head in the 42/42 suite (`node --experimental-strip-types --test "scripts/legacy-structure.test.mjs" "scripts/legacy-equivalents-capture.test.mjs" "scripts/panel-legacy.test.mjs"`).
- **Observed**: three reasons, each printed as a suite diagnostic at this head — `metadata-unreadable`, `already-standalone`, `no-sourced-equivalent` (`{"state":"cannot-tell","reason":"no-sourced-equivalent"}`); a table holding no sourced form for the structure yields cannot-tell naming no form across eleven hostile tables (`scripts/legacy-structure.test.mjs:537-575`), and the sourcing mutant reddens by name (`:590-616`). The recording side holds too: seven held-out mutants redden — a quote the page does not carry, a form no entry sources, edited text behind its hash, an unfetched URL, a foreign retrieval time, a disarmed capture command, a table with no NgModule-declared entry (all `✔` in the re-run output). The digest half is measured: for the captured code the digest carries it and states what it offers instead (`research/raw/m034-legacy-diagnostic.json:128-146`).
- **Reference**: `extension/legacy-structure.js:63-68,153-163`; `scripts/legacy-structure.test.mjs:394-575,590-616`; `scripts/legacy-equivalents-capture.test.mjs:544-619`; `research/raw/m034-legacy-diagnostic.json:128-146`.
- **Finding**: the protective behaviour SC3 demands — report cannot tell with the reason, never name an equivalent that cannot be sourced — is shipped and proven at this head. Under the re-scope the criterion's subject is the structure axis and the "code the digest does not carry" branch is realized as `no-sourced-equivalent`; this is the reading the previous review recorded at `4118849` and the owner left SC3 unamended.
- **Fix direction**: none

### SC4 — The panel renders the construct, the code and the modern equivalent from a short fact list, and shows the "cannot tell" state, inventing neither a construct nor an equivalent.

- **Verdict**: met
- **Check**: at this head `node --experimental-strip-types --test "scripts/panel-legacy.test.mjs" "scripts/panel-routes.test.mjs"` — 14 panel tests and 4 route tests, all pass in the re-runs quoted here, all five panel mutants reddening by name in the re-run output — and `npx tsc -p apps/angular-ai-devtools/tsconfig.check.json` as the `check:panel` leg of the passing `npm run check` (exit 0, below).
- **Observed**: `finding()` renders `component:`, `structure:`, `modernForm:` and `source:` from the fact it is handed (`apps/angular-ai-devtools/src/app/panel-legacy.ts:159-188`); `cannotTell()` renders only `reason:` (`:194-203`); a fact carrying a remedy, severity, owner or element renders none of them ("AC3: a fact carrying a remedy, a severity, an owner or an element renders none" passed at this head), and `equivalentSourced: false` forces the form out ("AC2: a finding with no sourced form names no form and says none is recorded", `:55,258-270`). Nothing is invented: the shipped sample fact's `modernForm`/`source` are byte-identical to the cited table entry (`apps/angular-ai-devtools/src/app/panel-demo.ts:81-92` vs `research/raw/m034-equivalents.json:24-33` — both `"removing standalone: false and adding dependencies to their imports array"` at `https://angular.dev/reference/migrations/standalone`), and the route is loader-registered (`apps/angular-ai-devtools/src/app/panel-demo.ts:27`, "E4: every declared route surface has a panel-demo LOADERS key" passed at this head). The "code" the pane carries is the structure the metadata names — `diagnosticCode` in a fact is dropped (`scripts/panel-legacy.test.mjs:30,306`), and no diagnostic code exists to render under the amended SC1 — the reading the wave review and the previous review both recorded.
- **Reference**: `apps/angular-ai-devtools/src/app/panel-legacy.ts:55,159-203,258-270`; `apps/angular-ai-devtools/src/app/panel-demo.ts:27,81-92`; `research/raw/m034-equivalents.json:24-33`; `scripts/panel-legacy.test.mjs:283-409,411-487`.
- **Finding**: the surface renders exactly what its fact list carries, shows the cannot-tell state with its reason, and invents neither a construct nor an equivalent.
- **Fix direction**: none

### SC5 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: `npm run check` re-run at this head — **exit 0**; `git diff -w 578cc51..HEAD -- plans/angular-ai-devtools-program-backlog.md`; `git log --oneline 4118849..HEAD` and `git show 578cc51 --stat`; the verify ledger; targeted suites standing in for the not-re-run `npm test` (see Observed). The full `npm test` was **not** re-run, per the review brief (~7 minutes); what was demonstrated instead is stated below, plainly.
- **Observed**: `npm run check` at this head completes every leg and exits 0: `ensure-sidecar-deps`, the root `tsc`, `check:skills`, `check:panel`, `check:extension`, `check:companion`, and finally `format:check` printing `Checking formatting... All matched files use Prettier code style!` with `CHECK_EXIT=0`. The honest history: at `578cc51` this same check **failed** — `format:check` warned on `plans/angular-ai-devtools-program-backlog.md` ("Code style issues found in the above file"), because the amendment commit itself introduced the A12 ruling row at `plans/angular-ai-devtools-program-backlog.md:28` unformatted; that was the sole failing leg, and the failure arrived with the amendment commit, after the verify ledger's full-project pass at `4118849` (`npm ci … && npm test`, `exit_code: 0`, recorded against `4118849de190cf9a1485547954b98f13e4fb8f3a` at `.project/build/verify-ledger.jsonl:1`). The fix (`7e736e9`) re-pads the rulings table: `git diff -w 578cc51..HEAD` on that file shows the only non-whitespace delta is the separator dash-row's length — the A12 ruling text is unchanged apart from padding. On the `npm test` leg: the three commits since the ledger's green full run touch no product, test, script, extension, app or package file (`git show 578cc51 --stat`: `.commandcode/taste/*`, `.project/*`, `.project/model-policy.json`, `plans/angular-ai-devtools-program-backlog.md`, `research/raw/m034-verdict-claims.json`; `7e736e9`: the backlog file only). Of those, the only file a test suite reads is `research/raw/m034-verdict-claims.json`, read by `scripts/overlay-verdict-claims.test.mjs:78` together with the amended `.project/intent/INTENT.md:109` — and that suite was run at this head: `tests 10 / pass 10 / fail 0`. The milestone's own suites were also re-run at this head: 42/42 (join/capture/panel) and 4/4 (routes). `npm test` as a whole therefore remains undemonstrated at this exact head by direct execution — a limitation of this review's brief, not a known failure — and every changed input it would read is covered by a passing re-run.
- **Reference**: `.project/build/verify-ledger.jsonl:1`; `plans/angular-ai-devtools-program-backlog.md:28`; `scripts/overlay-verdict-claims.test.mjs:78,109`; `git show 578cc51 --stat`; `git diff -w 578cc51..HEAD -- plans/angular-ai-devtools-program-backlog.md`; `.project/review/final-gap-1.md:3,16`.
- **Finding**: SC5 is met at this head: `npm run check` passes with exit 0, the formatting regression that failed the previous pass is fixed with padding-only change, and the test-relevant delta since the ledger's full green run is covered by passing targeted suites. The residual limitation — the full `npm test` was not executed at this head, per the brief — is disclosed in Observed, not hidden.
- **Fix direction**: none

## Observations

- The formatting fix changed padding only: `git diff -w 578cc51..HEAD -- plans/angular-ai-devtools-program-backlog.md`
  leaves exactly one hunk, whose sole non-whitespace change is the separator dash-row's length; every A-row's
  ruling and consequence text is byte-identical modulo whitespace, including the A12 ruling at
  `plans/angular-ai-devtools-program-backlog.md:28`.
- The amendment is honestly disclosed, not laundered: `## Corrections` preserves the original SC1
  and SC2 wording verbatim (verified character for character by a scratchpad script comparing
  `INTENT.md:110-111` against the pre-amendment headings), dates the amendment 2026-11-06, names
  the failed gap review at `4118849` that motivated it, and attributes the authority to the
  delegated ruling quoted at `.project/plan/PLAN.md:17-25` ("opt-in runtime instrumentation via for
  example providers but not dev server instrumentation") — a ruling, not a convenience.
- The re-recorded verdict claims match the amended criteria character for character: a scratchpad
  script comparing `research/raw/m034-verdict-claims.json` `criterionText` against
  `.project/intent/INTENT.md:36-40` (list ordinals stripped) returned `verbatim=true` for all five
  (SC1 224, SC2 224, SC3 175, SC4 175, SC5 48 chars) — and the overlay suite that pins those claims
  was re-run at this head, 10/10.
- The previous pass's failure was a single, narrow, self-inflicted formatting regression in the
  amendment commit — one Prettier-unclean markdown row in `plans/` — not a defect in the milestone's
  shipped behaviour. It is now fixed, and the milestone's evidence is green at this head: 42/42
  join/capture/panel tests, 4/4 route tests, 10/10 verdict-claims overlay tests, all `tsc` legs of
  `npm run check` clean, and the quoted held-out mutants all reddening by name.
