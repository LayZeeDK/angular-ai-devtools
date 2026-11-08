# Capability → application-dependency matrix

What every shipped explainer/surface **requires of the inspected application**, so the value of adding
sourcemap support is readable off one table.

Read-only analysis, 16 rows, every cell cited to a file and line opened for this document.

---

## 0. Definitions, and how to read a cell

### The four gate classes — what the *application* must do

| Class         | What it means                                                                                                                                                                 | Not this                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `dev-mode`    | A development build: `ngDevMode` truthy and `window.ng` (`getComponent`, `getOwningComponent`, `getDirectiveMetadata`, …) present                                                  | A production build that merely contains `ɵ` symbols                       |
| `sourcemap`   | A build that ships a resolvable `.map`, optionally with `sourcesContent`                                                                                                        | A readable dev bundle, a stack frame, or a source URL                     |
| `provider`    | The app installs an Angular provider/interceptor/overlay, or arranges its zone (debug provider; zone.js **or** zoneless)                                                         | A global the extension writes itself                                      |
| `primitive`   | The app imports an **Angular AI DevTools runtime symbol** — one of *our* directives, components, services or resources — and places it in its own tree so it can be inspected    | Our package registering a global, or our provider returning `[]`          |

### Explicitly **not** a gate class: Angular's own `ɵ` symbols

This project may use internals, developer-preview and experimental APIs whether or not they are stable.
`ɵsetProfiler`, `ɵgetSignalGraph`, `ɵgetInjectorProviders`, `ɵcmp`, `ɵgetDirectiveMetadata` and their
siblings cost the application **nothing** and are reported in their own column, `uses-ɵ`, never charged
as opt-in. That is the point of the table: `ɵ` usage is our business, `primitive` usage is the
application's.

`uses-ɵ` values: `required` (the feature reads at least one `ɵ` symbol), `optional` (it reads one when
present and has a non-`ɵ` path), `no`.

### Cell vocabulary

- `required` — the feature cannot work without it.
- `partial` — only one input or one field of the feature needs it; the rest works without.
- `no` — the feature needs nothing of it.

Cell shape: `verdict — reason — path:line`.

**Path legend** (aliases used only to keep the table narrow; each aliases one directory in this repo):

- `ext/` = `extension/`
- `app/` = `apps/angular-ai-devtools/src/app/`
- `mw/` = `src/main-world/`
- `pkg/` = `packages/ai-devtools-companion/src/`

### Version comparisons, quoted verbatim

- `ext/agent-main.js:511,516` — `versionOlderThan(detectedVersion, 22, 1, 3)` →
  `'Angular ' + detectedVersion + ' is not supported; requires 22.1.3 or newer'`
- `ext/agent-main.js:529` — `'ng.ɵsetProfiler not found (production build or not an Angular page)'`
- `ext/agent-main.js:542` — `'ng.ɵgetSignalGraph not found (production build or not an Angular page)'`
- `ext/agent-main.js:550` — `'Zone.js change detection is not supported; use zoneless Angular 22'`
- `ext/stale-view-worker.js:12` — `const SUPPORTED_MIN = { major: 22, minor: 1, patch: 3 };`
- `ext/agent-main.js:182` / `app/companion.ts:114` / `pkg/vetted.ts:14` — `'0.2202.0'`, the companion
  version both realms accept; anything else is `version-unsupported` (`ext/agent-main.js:299-300`).

The `22.1.3` floor is enforced by the page agent before anything else runs, so **every** row below
inherits it whether or not it is restated: `ext/agent-main.js:507-519`.

---

## 1. Matrix

Rows are features. A row is the whole shipped explainer — the page-side read (where one exists), the
pure join in `extension/`, and the panel surface — not the surface file alone.

| #   | Feature                    | `dev-mode`                                                                                                                                        | `sourcemap`                                                                                              | `provider`                                                                                                                                                              | `primitive`                                                                                       | `uses-ɵ`                                                                                | `portal-measured?`                                                                        |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | **lint-core**              | `partial` — the join reads message text only; the measured capture was "a development build" — `ext/lint-core.js:6,124`                            | `no` — every stack frame is cut before the join reads the body — `ext/lint-core.js:100,124`               | `no` — nothing installed; the capture is the extension's own `console.error` tap — `ext/agent-main.js:1553`                                                               | `no` — no AI DevTools symbol in play — `ext/lint-core.js:229`                                      | `no` — no `ɵ` read at all — `ext/lint-core.js:206`                                       | `no` — recorded on the fixture route `/lint-observability` — `ext/lint-core.js:6`          |
| 2   | **lint-router**            | `partial` — same shape; `NG04002` was captured on a dev-*served* page — `ext/router-diagnostic.js:5`; `research/raw/m033-router-diagnostic.json:70` | `no` — body only, frames cut — `ext/router-diagnostic.js:52,66`                                           | `no` — reads captured messages and a route list it is handed — `ext/router-diagnostic.js:5-6`                                                                             | `no` — `ext/router-diagnostic.js:214`                                                              | `no` — `NG_CODE` regex only — `ext/router-diagnostic.js:51`                              | `no` — fixture `/router-lint` — `research/raw/m033-router-diagnostic.json:8`               |
| 3   | **lint-legacy**            | `required` — the fact *is* a read of `ɵcmp.standalone` through the `ng` hooks — `ext/legacy-structure.js:8,27,88`; dev-only claim — `app/tool-registry/app-facts.ts:120` | `no` — needs one boolean and a cited table — `ext/legacy-structure.js:67,68`                              | `no` — nothing installed — `ext/legacy-structure.js:6`                                                                                                                  | `no` — `ext/legacy-structure.js:178`                                                               | `required` — `ɵcmp` — `ext/legacy-structure.js:27`                                       | `no` — the diagnostic never reached the page console — `ext/legacy-structure.js:6`         |
| 4   | **field-state**            | `no` — pure read of a handed fact object — `ext/field-state.js:7`                                                                                  | `no` — validity and error kinds only — `ext/field-state.js:76,90`                                         | `no` — `ext/field-state.js:97`                                                                                                                                           | `no` — `ext/field-state.js:131`                                                                    | `no` — `ext/field-state.js:50`                                                           | `no` — no portal record; input not wired in this build — `app/panel-fields.ts:4-6`         |
| 5   | **di-doctor**              | `required` — `ng.getInjector` / `ɵgetInjectorFromNode` — `ext/agent-main.js:1104-1110`                                                             | `no` — provider records belong to the live injector — `ext/agent-main.js:1146-1152`                       | `required` — the component picker needs recorded cycles ⇒ the zoneless gate — `ext/agent-main.js:547-553`                                                                 | `no` — `app/di-doctor.service.ts:31-38`                                                            | `required` — `ɵgetInjectorResolutionPath` / `ɵgetInjectorMetadata` / `ɵgetInjectorProviders` — `ext/agent-main.js:1120,1139,1146` | `no` — portal run rendered **zero rows** — `AGENTS.md:214`                                 |
| 6   | **error-explainer**        | `partial` — code + digest need nothing; component attribution needs `ng.getOwningComponent` — `mw/error-capture.ts:39-53`, `ext/agent-main.js:1522` | `no` — the digest is a static index shipped in the extension — `ext/error-digest.json:2`                   | `no` — hooks install at document_start regardless of install state — `ext/agent-main.js:1550-1560`                                                                        | `no` — `app/error-explainer.component.ts:14`                                                       | `optional` — the `ɵgetOwningComponent` alias is used when present — `mw/error-capture.ts:53` | `no` — no record found for this surface                                                |
| 7   | **stale-view**             | `required` — graph nodes plus `debuggableFnSource` — `ext/stale-view-worker.js:59-62`, `ext/agent-main.js:835-845`                                 | `no` — matches `Function.prototype.toString` text — `ext/stale-view-worker.js:62`                        | `required` — zoneless; a zoneful page is refused before subscribing — `ext/agent-main.js:547-553`                                                                          | `no` — `app/stale-view-scan.service.ts:23-36` (loads our own worker)                                | `required` — `ɵgetSignalGraph` — `ext/agent-main.js:836`                                 | `no` — the refusal itself was measured on the portal — `AGENTS.md:213`                    |
| 8   | **interop**                | `required` — the kept nodes are graph nodes by label and text — `mw/interop-keep-list.ts:37-39`, `ext/agent-main.js:822-845`                       | `no` — classifies labels/edges, not positions — `mw/interop-keep-list.ts:3`                               | `required` — zoneless — `ext/agent-main.js:547-553`                                                                                                                      | `no` — `app/interop.service.ts:1-6` (imports our keep-list, installs nothing)                      | `required` — `ɵgetSignalGraph` — `ext/agent-main.js:836`                                 | `artefact-only` — the portal's graph is cited as measurement, no verdict — `docs/feature-proposals.md:539` |
| 9   | **redirect-chain**         | `no` — walks the array it is handed — `ext/redirect-chain.js:4-19`                                                                                 | `no` — `path` / `redirectTo` fields only — `ext/redirect-chain.js:46`                                    | `no` — `ext/redirect-chain.js:8`                                                                                                                                          | `no` — `ext/redirect-chain.js:87`                                                                  | `no` — `ext/redirect-chain.js:19`                                                        | `no` — no portal record found                                                          |
| 10  | **sanitizer**              | `required` — "the sanitizer's only signal is a **dev-mode** `console.warn`" — `ext/sanitizer-triage.js:4`                                          | `no` — needs a warning's clock time plus a profiler window — `ext/sanitizer-triage.js:109`                 | `required` — profiler records (⇒ `ɵsetProfiler` installed ⇒ zoneless) — `ext/agent-main.js:555-560,547-553`                                                               | `no` — `app/panel-sanitizer.ts:4-6`                                                                | `required` — `ɵsetProfiler` — `ext/agent-main.js:520-525`                                | `no` — fixture only; no portal record                                                    |
| 11  | **signal-provenance**      | `required` — provenance is computed over recorded checks' graphs — `app/signal-provenance.service.ts:74-77`                                        | `no` — edges and node kinds only — `mw/provenance-tracer.ts:56-88`                                       | `required` — zoneless; no cycles ⇒ nothing to trace — `ext/agent-main.js:547-553`                                                                                          | `no` — `app/n2-signal-provenance.component.ts:1-3`                                                 | `required` — `ɵgetSignalGraph` via `captureGraph` — `ext/agent-main.js:836`              | `no` — the refusal was measured on the portal — `AGENTS.md:213`                          |
| 12  | **after-render**           | `required` — the list is one `ɵsetProfiler` subscriber's events — `ext/after-render.js:4`                                                          | `no` — orders event ordinals; no source position anywhere — `ext/after-render.js:36,46`                    | `required` — zoneless — `ext/agent-main.js:547-553`                                                                                                                       | `no` — `app/after-render.ts:5`                                                                     | `required` — `ɵsetProfiler` — `ext/agent-main.js:555-558`                                | `no` — fixture only                                                                      |
| 13  | **linked-state**           | `required` — labels are a *development-build* compile artefact — `research/raw/m038-linked-state.json:66-67`, `ext/linked-state.js:4,93`             | `no` — compares two stored runtime values — `ext/linked-state.js:86-89`                                    | `required` — zoneless — `ext/agent-main.js:547-553`                                                                                                                       | `no` — `app/panel-linked-state.ts:4-6`                                                             | `required` — `ɵgetSignalGraph` — `ext/agent-main.js:836`                                 | `no` — fixture only                                                                      |
| 14  | **render-phase**           | `required` — an effect is a graph node kind — `ext/render-phase.js:111,318`                                                                         | `no` — reads edges; the phase is a published absence — `ext/render-phase.js:107`                          | `required` — zoneless — `ext/agent-main.js:547-553`                                                                                                                       | `no` — `app/panel-render-phase.ts:4-6`                                                             | `required` — `ɵgetSignalGraph` — `ext/agent-main.js:836`                                 | `artefact-only` — the portal's labelled effect is named as a measurement — `ext/render-phase.js:13-16` |
| 15  | **performance-narrator**   | `required` — the frame is the profiler's work events — `ext/performance-narrator.js:257`, `ext/agent-main.js:24-37`                                | `no` — durations are the page's own receipt times; no position is reported — `ext/performance-narrator.js:94,140` | `required` — zoneless — `ext/agent-main.js:547-553`                                                                                                                       | `no` — `app/panel-performance.ts:4-8`                                                              | `required` — `ɵsetProfiler` — `ext/agent-main.js:520-525`                                | `no` — the portal was "named and refused, not driven" — `.project/research/m040-performance-narrator.md:199-215` |
| 16  | **companion / opt-in** _(added row: the only surface that asks the app to install anything of ours)_ | `required` — the write happens only `if (isDevMode())` — `pkg/index.ts:6,26`                                                | `no` — reads a global table, not code — `pkg/facade.ts:10`                                                 | `required` — `provideAiDevTools()`, a provider the app adds to its bootstrap — `pkg/index.ts:25-29`                                                                        | `no` — the entry carries **Angular's** `Meta` and `Router` classes, not our symbols — `pkg/vetted.ts:30-31` | `required` — `ɵgetInjectorResolutionPath` + `ɵgetInjectorProviders` — `ext/agent-main.js:352-396` | `no` — the page's probe is the page realm's own; no portal verdict        |

### Notes that belong to the whole table

1. **One zone gate is most of the `provider` column.** 9 of the 10 `provider: required` rows are the
   same requirement: the app must not run a real `ZoneNgZone` (`ext/agent-main.js:547-553`). It is
   not implied by a feature's name — it is the agent's own refusal, measured on the live portal as
   four features refusing with that sentence — `AGENTS.md:213`.
2. **No surface asks for a sourcemap.** Grepping `extension/`, `apps/…/src/` and `src/` for
   `sourcemap|sourceMap|sourcesContent|sourceMappingURL` returns only `.map(` array calls; the
   extension performs no `fetch`/`XMLHttpRequest` at all. The `sourcemap` column is `no` in every row
   because nothing shipped reads a map, not because the question was skipped.
3. **`primitive` is empty by construction, not by omission.** The only pipeline where the app installs
   something of ours is row 16, and what it installs is a **provider whose only effect is one global
   property** (`pkg/facade.ts:35-42`), carrying *Angular's* classes as identity tokens
   (`pkg/vetted.ts:30-31`). No directive, component, service or resource of ours is placed in an app's
   tree anywhere in this repository. See §6.
4. **Several surfaces have no live input in this build.** `page-reads.ts` states it outright: "This
   build has no page-request transport" (`app/page-reads.ts:14-19`), and `app_facts` answers
   `host-unavailable` on every real call (`app/panel-context.ts:4-6`). The joins behind lint-core,
   lint-router, field-state, redirect-chain, sanitizer, after-render, linked-state, render-phase and
   performance-narrator are published as globals (`ext/lint-core.js:265-269` and siblings) and are
   exercised by their own `scripts/*.test.mjs` suites; nothing in `app/` imports them — a grep for
   `lintCore|routerDiagnostic|fieldState|legacyStructure|redirectChain` in `apps/…/src/app` returns only
   doc-comment mentions (`app/panel-lint.ts:4,33`). This is a **wiring** fact, not a gate: the gate
   columns say what the app must provide *for the artefact the join reads*, and they stay true whether
   or not the transport lands. It does mean rows 1, 2, 4, 9 have no page currently producing their
   input, so their `dev-mode` verdicts rest on the recorded measurement rather than on a live path.

---

## 2. Counts

| Class        | `required` | `partial` / `optional` | `no` | Rows |
| ------------ | ---------- | ---------------------- | ---- | ---- |
| `dev-mode`   | **11**     | 3                      | 2    | 16   |
| `sourcemap`  | **0**      | 0                      | 16   | 16   |
| `provider`   | **10**     | 0                      | 6    | 16   |
| `primitive`  | **0**      | 0                      | 16   | 16   |
| `uses-ɵ`     | **11**     | 1 (`optional`)         | 4    | 16   |

The single `partial`/`optional` in `uses-ɵ` is `error-explainer`, which uses the `ɵgetOwningComponent`
alias when present and has a plain-`ng` path when it is not (`mw/error-capture.ts:42-54`).

**How many features need no application cooperation at all**

- **All four gate classes `no` — 2 of 16:** `field-state`, `redirect-chain`.
- **No gate class `required`** (nothing the app must *do*; at most a `partial`) — **5 of 16:** the two
  above plus `lint-core`, `lint-router`, `error-explainer`. Each of those three has a `partial` in one
  field only — a build mode for two of them (`ext/lint-core.js:6`, `ext/router-diagnostic.js:5`) and the
  dev-only component attribution for the third (`mw/error-capture.ts:39-53`) — and the rest of the
  feature answers without it.
- **At least one `required` gate — 11 of 16.** Nine of those 11 are the *same* three conditions — a dev
  build, zoneless, profiler present — rather than nine different ones (§1 note 1). The two exceptions:
  `lint-legacy` needs the dev build and component metadata but **no** provider, and `companion` needs a
  provider but not the zone arrangement.
- **`primitive`: 0 of 16** requires the app to install an AI DevTools directive/component/service/
  resource.
- **Static index already substituting for a runtime artefact — 3 rows:** `lint-core` and
  `error-explainer` join against `extension/error-digest.json` (`ext/error-digest.json:2`, `NG0950` at
  `:245`, `NG6100` at `:290`), and `lint-legacy` copies its modern form from the cited equivalents table
  (`ext/legacy-structure.js:68`). Those three prove the project's own pattern: *a table in the
  repository can stand in for an artefact the page cannot supply*. That pattern is the honest analogue
  for sourcemaps, and §3 says why the analogy does not yet lift any gate.

---

## 3. What sourcemaps would change

Verdict per feature. `lift` = a `required` gate would disappear; `narrow` = a `required` gate would
shrink to `partial`; `changes nothing` = the gate would stand exactly as it is.

| Feature                 | Verdict            | Why — and what a static index could and could not stand in for                                                                                                                                                                                       |
| ----------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lint-core               | **changes nothing** | The join deliberately cuts the stack before reading anything (`ext/lint-core.js:100,124`); a map only ever answers questions about stack frames. Its content is `Input "<name>"` inside the body (`ext/lint-core.js:104`) — the body is bytes, not positions. |
| lint-router             | **changes nothing** | Same reason: `bodyOf` drops the frames (`ext/router-diagnostic.js:52,66`) and the finding is the unmatched URL segment (`:53`), which no map carries.                                                                                                  |
| lint-legacy             | **changes nothing** | The gate is a metadata boolean (`ɵcmp.standalone`, `ext/legacy-structure.js:27`). A static index of the component source *could* read `standalone:`/NgModule declarations — but that is an AST index, not a sourcemap, and it would be a second artefact with its own provenance, not a mapping of generated positions. |
| field-state             | **changes nothing** | The fact is live form state (`ext/field-state.js:76,90`), which exists nowhere in a build map.                                                                                                                                                          |
| di-doctor               | **changes nothing** | The claim is about *which injector instance* resolved a token at runtime (`ext/agent-main.js:1146-1152`). A map cannot show which injector answered; only the walking of the live injector does.                                                          |
| error-explainer         | **changes nothing** | Code + digest need no map (the digest is already static, `ext/error-digest.json:2`); component attribution needs `ng.getOwningComponent` (`mw/error-capture.ts:39-53`), and no map turns a DOM element into an instance.                                |
| stale-view              | **changes nothing** | The scan regexes the `debuggableFnSource` text (`ext/stale-view-worker.js:59-62`). A map *could* map a position in that text back to original source and let the same regex run on the original file — but the scan needs the **signal graph** to have nodes at all (`ext/agent-main.js:835-845`), and the graph gate dominates. |
| interop                 | **changes nothing** | Classification is by node label and node text (`mw/interop-keep-list.ts:37-39`), both products of the graph. No map produces a graph node.                                                                                                              |
| redirect-chain          | **changes nothing** | The walk consumes a route-config array (`ext/redirect-chain.js:8,46`). A static route index is conceivable, but a sourcemap carries no route semantics; `loadChildren` boundaries and guard presence would still have to come from the config.        |
| sanitizer               | **changes nothing** | Two runtime artefacts: a dev-mode warning's clock time, and a profiler window (`ext/sanitizer-triage.js:4,109`). A map supplies neither, and the warning's text never names a tag or an attribute (`ext/sanitizer-triage.js:4`).                          |
| signal-provenance       | **changes nothing** | Producers/consumers edges (`mw/provenance-tracer.ts:56-88`) are runtime graph state.                                                                                                                                                                    |
| after-render            | **changes nothing** | Ordinals in a recorded event list (`ext/after-render.js:36,46`). There is no generated position to map.                                                                                                                                                |
| linked-state            | **changes nothing** | The two stored values and their equality are runtime state (`ext/linked-state.js:86-89`). Narrowing is *imaginable* — the labels are a dev-build compile artefact (`research/raw/m038-linked-state.json:66-67`), so a static index could supply the field names — but the finding also needs both values from the graph, so the dev-mode + provider gate does not shrink. |
| render-phase            | **changes nothing** | The phase is a published absence because the profiler enum has no effect event (`ext/render-phase.js:107`); the reads are edges (`:318`). A map cannot add an event to an enum.                                                                        |
| performance-narrator    | **changes nothing** | `durationMs` is one measured receipt time minus another (`ext/performance-narrator.js:94,140`); the identity is whatever instance the profiler passed. A map cannot supply a missing profiler argument — and the backlog's hope for source attribution here is explicitly a *new* surface (`plans/angular-ai-devtools-program-backlog.md:424-426`), not a repair of this one. |
| companion / opt-in      | **changes nothing** | It reads a global table and compares class identity (`ext/agent-main.js:352-396`). Maps are irrelevant.                                                                                                                                                |

**Totals: `lift` 0 — `narrow` 0 — `changes nothing` 16.**

### Would adding sourcemap support itself need anything from the application?

**No.** Three facts settle it:

1. A map is served beside the bundle the app has *already* shipped; nothing new is installed, provided
   or placed in the tree. The backlog's own framing: "Sourcemaps and the script bytes the page already
   downloaded need nothing from the application" (`plans/angular-ai-devtools-program-backlog.md:407-410`).
2. The extension currently performs **no network read at all** — no `fetch(`, no `XMLHttpRequest`, no
   `sourceMappingURL` anywhere under `extension/`. So the work is a new read *inside our own code*, with
   no app-side counterpart, exactly as the `angular-ai:state` record needed none.
3. Whether a map exists **at all** in the target's build is a measurement question, not an app change:
   "Does the portal's `main-*.js` reference a `.map` that resolves, and is `sourcesContent` embedded?"
   (`plans/angular-ai-devtools-program-backlog.md:414-415`), and the same document records what a failure
   there would mean: "If (1) or (2) fails on the zoneless portal, the capability is dev-and-staging only"
   (`:421-422`).

### Would any feature then need only `dev-mode` instead of `dev-mode + provider`?

**None.** No shipped feature's `provider` requirement is a source-location problem:

- 9 of the 10 are the zoneless gate (`ext/agent-main.js:547-553`). That is a change-detection
  arrangement the app makes at bootstrap; a map does not observe or alter change detection. Even a
  perfectly mapped source tree would leave the agent refusing to subscribe on a `ZoneNgZone` page.
- 1 of the 10 is our own provider (row 16), which is an explicit opt-in by design
  (`pkg/index.ts:25-29`, `.commandcode/taste/design/taste.md:19`).

### So what *would* maps buy?

Three things, none of them a lifted gate — and each is a **new** capability, not a repaired one:

1. New findings that need **no gate class at all**, provided the map resolves: a template line for a
   rendered node, and the binding that caused a component to be checked (`plans/…backlog.md:424-426`).
   That is a wider prize than any current row: it would add a row to this table whose `dev-mode`,
   `provider` and `primitive` cells are all `no`.
2. A **weaker** substitute for one Tier-1 runtime field: `ɵcmp.debugInfo` already gives file and line
   (`docs/feature-proposals.md:724`), and it is a field on the compiled class, not a function on `ng`.
   Where `debugInfo` is unavailable but a map resolves, a map is the fallback — for a *new* surface; no
   shipped surface reads `debugInfo` today.
3. Nothing else. The honest summary for a reader of the table: **the shipped features pay the opt-in
   tax because of what they ask the *page*, not because of where they point in the *file*.**

---

## 4. Named-absence vocabulary for static findings

The project's grammar, learned from the shipped joins: `{ state: 'cannot-tell', reason: '<lower-hyphen-token>' }`
(`ext/lint-core.js:86-89`, `ext/after-render.js:46`, `ext/redirect-chain.js:19`); one published token per
absence, compared as a constant rather than prose (`ext/render-phase.js:100-107`,
`ext/performance-narrator.js:94-96`); a reason names the absence and **nothing else** — no construct, no
cause, no element. A frame-level absence is a separate slot from a finding's `reason`
(`ext/render-phase.js:107,293-295` vs `:287-289`).

Tokens proposed for static findings, each with its producing condition. `no-sourcemap` is the owner's
word already, verbatim: "A missing map is `cannot-tell: no-sourcemap`, never a guess from a minified
position" (`plans/angular-ai-devtools-program-backlog.md:429-430`).

| Token                     | Slot            | Producing condition (all of them must hold to produce it)                                                                                                                                     | Never instead                                |
| ------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `no-sourcemap`            | finding reason  | The script that produced the position carries no `sourceMappingURL` comment, or the URL it names does not resolve, or the response is not an object with `version` and `mappings`.                 | `mapped-to-library`, a guessed nearest line   |
| `map-without-sources`     | finding reason  | The map parses but `sources` is absent/empty, so no original file can be named for any position.                                                                                                | naming the bundle                            |
| `sources-content-absent`  | finding reason  | The map resolves and `sources` names files, but carries no `sourcesContent`, so the pane has no text to quote and reading the file itself would be a second transport the app never agreed to.    | quoting a minified line                       |
| `pos-not-mapped`          | finding reason  | The exact generated line/column has no mapping entry (common for template-generated code). Refuse; do not fall back to the nearest mapping.                                                     | nearest-mapping substitution                 |
| `template-map-coarse`     | finding reason  | A mapping resolves, but to the component's class range rather than to the template expression or binding the finding claims. This is the open measurement in Q4 item (2) (`…backlog.md:416`).     | a component-level claim dressed as expression-level |
| `map-mismatched-script`   | finding reason  | The map's `file`/`sources` do not correspond to the script that produced the position (a stale hashed bundle, two builds on one host).                                                          | mapping across builds                         |
| `mapped-to-library`       | finding reason  | The mapping resolves into a framework or `node_modules` chunk, so no *application* source is named. The claim is about the app, so the app is not in it.                                        | naming a framework file as the app's          |

Two conditions on the whole vocabulary:

1. Every static finding carries its provenance as data — `{source: 'static', provenance: 'map'|'ast'|'ts'}`
   — and is never mixed into runtime facts (`plans/…backlog.md:428-431`). That is what keeps
   `no-sourcemap` from being read as a runtime absence like `no-covering-profiler-record`
   (`ext/sanitizer-triage.js:109`).
2. `template-map-coarse` is **not** yet a measurement. Q4 item (2) asks whether "Angular's AOT output
   preserve[s] **template** mapping at expression precision, or only at component granularity"
   (`plans/…backlog.md:416`); until that is answered, the token names a *possible* refusal, and the
   honest interim claim is `undetermined`.

---

## 5. Undetermined, and what would settle each

| #   | Question                                                                                                            | Why the code cannot settle it                                                                                                                                     | What would settle it                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | Is `lint-core`'s `NG0950` diagnostic emitted in a **production** build?                                             | The only recording is a development build (`ext/lint-core.js:6`); the join reads text and cannot tell a build mode apart.                                          | One production-build load of `/lint-observability` and a check of whether the message reaches the console.         |
| 2   | Is `lint-router`'s `NG04002` emitted in a production build?                                                          | Same shape; the capture came from `ng serve` on a dev page (`research/raw/m033-router-diagnostic.json:13,70`).                                                     | One production-build load of `/router-lint`.                                                                      |
| 3   | Does any shipped feature's diagnostic surface change at expression precision with an AOT template map?               | No map is read anywhere in the repo (see §1 note 2), so there is nothing to observe.                                                                              | Q4 item (2), `plans/…backlog.md:416`.                                                                             |
| 4   | Does the zoneless portal's `main-*.js` ship a resolvable `.map` with `sourcesContent`?                              | Not measured in this repository; the backlog lists it as an open premise (`plans/…backlog.md:414-415`).                                                            | Q4 item (1), same file.                                                                                           |
| 5   | Is `di-doctor`'s zero-row portal result a gate or a wiring defect?                                                  | `AGENTS.md:214` records the zero rows but names no cause; the picker needs recorded cycles (`app/di-doctor.service.ts:31-38`, `app/stale-view.component.ts:64-69`), and `angular-ai:di-query` "has no caller and no responder" in the page-read port (`app/page-reads.ts:14-19`). | A portal run with a cycle recorded (i.e. on the zoneless portal, per `AGENTS.md:229-247`), then one `di-query`.    |
| 6   | `portal-measured?` for `error-explainer`, `field-state`, `redirect-chain`                                         | No verdict spec, research doc or measurement in this repository names these surfaces on the portal; `AGENTS.md:202` says 3 of 23 verdict specs drove the portal without naming which.                                                | A `verify-*` run against the portal whose evidence file names the surface.                                        |
| 7   | Whether the static `cannot-tell` tokens in §4 need per-finding or per-load slots                                    | The grammar has both precedents (`ext/field-state.js:50` per read; `ext/sanitizer-triage.js:4-109` per load). Static findings are per-position, so per finding is the closer analogue — but that is a design choice, not a fact in the code. | The Q4 spike's own answer shape.                                                                                  |

Two things I could **not** determine and did not guess at:

- Whether `ngDevMode` is ever read by our code. A grep for `ngDevMode` under `extension/` returns
  **no matches**: the agent's dev-mode test is the presence of `ng.ɵsetProfiler` / `ng.ɵgetSignalGraph`
  (`ext/agent-main.js:520-545`), whose reasons say "production build or not an Angular page"
  (`:529,542`) — the build mode is named as a *possibility*, never asserted.
- Which of the 15 listed surfaces were meant to be "shipped" as opposed to library-only. §1 note 4
  records the split as a fact rather than resolving it.

---

## 6. The `primitive` column: what an app is actually asked to install

Nothing in this repository asks an application to import an AI DevTools **directive, component, service
or resource**. Searches for `@Directive`, `provideAiDevTools`, `aiDevtoolsDirective` and `devtools-`
element prefixes across `apps/`, `src/`, `packages/` and `spikes/` return:

- **one provider**, `provideAiDevTools()`, exported from `packages/ai-devtools-companion/src/index.ts:25`
  and returning an **empty provider list on purpose** — "the entry *is* the contract with the panel, and a
  DI record would be a second contract inside someone else's build" (`pkg/index.ts:19-24`);
- whose entire effect is **one own string key on `globalThis`**
  (`pkg/facade.ts:10,35-42`), written under `isDevMode()` (`pkg/index.ts:26`);
- whose value carries **Angular's own** `Meta` and `Router` classes as identity tokens
  (`pkg/vetted.ts:9-10,30-31`), not symbols of ours;
- read back by the page agent as one of four named states (`ext/agent-main.js:245-302`), versioned at
  `0.2202.0` on both sides (`ext/agent-main.js:182`, `app/companion.ts:114`).

So the shape the brief anticipated — "a directive an app puts on an element, a service it provides, a
resource it registers" — **does not exist in this codebase**. The one artefact of ours an app installs is
a provider, and it is counted in the `provider` column (row 16), not in `primitive`. The project's own
taste ruling matches that shape and forbids the alternative: "opt-in runtime instrumentation is allowed
only via providers (e.g. `provideAiDevTools()`), never via dev-server instrumentation"
(`.commandcode/taste/design/taste.md:19`).

Consequence for the table: `primitive` is `no` in all 16 rows, and the column's emptiness is a
**finding**, not a gap — it is the column that sourcemap support would keep at `no` while adding rows
whose only prerequisite is a resolvable `.map`.
