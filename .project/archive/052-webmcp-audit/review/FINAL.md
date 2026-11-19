# FINAL — M052 webmcp-audit

Reviewed HEAD: dd8fff6afd75add0c2382b6e5fbba3afe8382ce8

Overall verdict: pass

## What this milestone set out to do

The panel reports which WebMCP tools the inspected app declares, reading the tool list from the page's
model-context API rather than from the DOM, and refuses to describe a tool the page does not expose.
Presence of `document.modelContext` was already a canary (`control.mjs:1953`), so the milestone is about
the **tool list** (intent Correction C1); "whether each can be called" was removed from scope before
planning because it needs a model turn and mutates the page (Correction C2).

## Tasks and waves

| wave | task | landing | what it established |
|---|---|---|---|
| 1 | T001 | `144e82ca` | the measurement: `research/raw/m052-webmcp-api.json` records registration (`registerTool`), a readable tool list (`getTools` returning `{name, description, inputSchema, origin, window}`) with `path:line` citations whose `lineText` is re-checked by `scripts/webmcp-api.test.mjs`, and it states what it does not claim — no call site for `getTools` exists in the tree, so runtime behaviour was not yet observed |
| 2 | T002 | `921cc0a5` | the pure reading `extension/webmcp-audit.js`: `readTools(source)` answers `tools`, `empty` or `cannot-tell` naming the absence; five mutants (DOM-label name, empty-state, collapse, re-registration, invented description) each redden a named pin |
| 3 | T003 | `fa27f1e7` | the surface `apps/angular-ai-devtools/src/app/panel-webmcp.ts` renders the three states; the `webmcp` route is a `PANEL_SURFACES` entry lazy through the shared `loadPanelDemo` closure, and the route-table suites were declared before the landing; the live Chrome Beta 159 observation (`research/raw/m052-webmcp-observation.json`) measured `getTools()` answering a Promise that resolves to `[]` — plan Correction C3 |
| 4 | T004 | `dd8fff6a` | the surface recorded in `research/raw/m052-surface.json` (route `webmcp`, loader key, each state's report field), `research/raw/m052-verdict-claims.json` captured with its own command, the eight recordings the milestone stales re-derived, and the project verify run at the reviewed head |

## Success criteria

### SC1 — Each tool the page declares is named with its own fields, and the fields are read from the API rather than from the DOM. A surface lists every declared tool with the name the API reports and the description it reports, and nothing it does not report. A mutant that renders a tool name from a DOM label instead of the API reddens.

- **Surface**: panel
- **Check**: `node --test scripts/webmcp-audit.test.mjs`
- **Observed**: pass. E1/N1: the DOM-label mutant reddens the API-name pin by name — the tool's name is the string `source.modelContext.getTools()` reported (`name` field per `research/raw/m052-webmcp-api.json` `exposure.toolList.nameField`), never the page's visible label. N2: the reading consumes only `research/raw/m052-webmcp-api.json` (T001's citation-pinned measurement); no hand-written fixture list exists anywhere in the reader's input path. E4 (held-out, per PLAN's Held-out checks table, owned by T002): the description pin `pinDescriptionOnlyWhenReported` passes for a page whose tools carry no descriptions — each tool renders with its name and no invented description — and the invented-description mutant reddens that pin by name, so "the list rendered" did not collapse into "the descriptions were invented". The panel surface renders this state at route `webmcp`: one block per declared tool, the name the API reported and the description only where the descriptor carried one (`apps/angular-ai-devtools/src/app/panel-webmcp.ts:262-275`), walked per the PLAN Surface contract walkthrough steps 1-2.
- **Reference**: .project/build/verify-T002.log — head dd8fff6afd75add0c2382b6e5fbba3afe8382ce8; scripts/webmcp-audit.test.mjs (mutants "the DOM-label mutant", "the description mutant")
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC2 — A tool whose shape cannot be read is reported as cannot-tell, naming the absence. When the API exposes a registration surface but no readable tool list, the surface states that the list is absent rather than rendering an empty list, an inferred signature, or the word "none". A mutant that renders an empty list as "no tools declared" reddens.

- **Surface**: panel
- **Check**: `node --test scripts/webmcp-audit.test.mjs`
- **Observed**: pass. E2/N3: `empty` and `cannot-tell` are distinct states with distinct pins — a page that declares no tools answers `empty` (`pinNoToolsDeclared`), while a source that exposes a registration surface but no readable list answers `cannot-tell` naming the absent list (`pinCannotTellNamesTheAbsence`); the empty-state mutant (an empty list rendered as if nothing was declared) and the collapse mutant (a refusal rendered as a declared-nothing page, which names no absence at all) each redden their pin by name. The live measurement sharpens this: T003's Chrome Beta 159 observation (plan Correction C3) measured `getTools()` answering a Promise resolving to `[]`, and the synchronous reader answers `cannot-tell`/unreadable-list for it rather than inventing an empty-list rendering — the refusal path, not an invented shape.
- **Reference**: .project/build/verify-T002.log — head dd8fff6afd75add0c2382b6e5fbba3afe8382ce8; research/raw/m052-webmcp-observation.json (quoted in .project/plan/PLAN.md Correction C3)
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC3 — The reading is pure over what the page exposes. No network call, no DOM traversal to recover a tool, no re-registration to make a tool observable. Asserted by a poisoned-source test.

- **Check**: `node --test scripts/webmcp-audit.test.mjs`
- **Observed**: pass. E3/N4: the poisoned-source test arms `document`, `fetch` and `Date` as traps and asserts `the-poisoned-globals-change-nothing` — the reader answers the same value with the traps armed, so no network call and no clock enters the reading; the re-registration mutant (a reader that registers a probe tool to have something to report) reddens the no-registration pin by name, and the SC3 suite asserts `registers nothing, invokes nothing, and answers the same source the same way twice`.
- **Reference**: .project/build/verify-T002.log — head dd8fff6afd75add0c2382b6e5fbba3afe8382ce8; scripts/webmcp-audit.test.mjs ("SC3 — registers nothing, invokes nothing")
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

## Project verify

- **Command**: `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test`
- **Result**: pass at the reviewed commit on the rerun ledger entry (exit 0). The first sidecar execution failed with `NX  Could not find Nx modules at "<sidecar>"` — the sidecar was created without its dependency bridge, a host-environment gap diagnosed and fixed outside the repository (a `node_modules` bridge junction at the verify sidecar root, created with the project's own `scripts/sidecar-deps-bridge.mjs`); the failed entry stays in `.project/build/verify-ledger.jsonl` as history and the rerun entry is marked `rerun`.
- **Recorded at**: `dd8fff6a` (ledger: fail entry then `rerun: true` pass entry, exit 0)

## Ship gate

- **Command**: `npm run gate:verification:ship`
- **Result**: `verification gate (ship): pass` — all 14 browser fixture checks load and are tested, 5 contract checks pass, 14 verdicts verified, `scripts-in-step: 3 copies in step`. Receipt: `.project/review/VERIFICATION.json`.

## Residuals the ship carries

- Plan Correction C3: the page-world caller must await `getTools()` before handing the resolved array to the synchronous reader. Until that wiring lands, a promise-shaped getter is reported as `cannot-tell` naming the unreadable list — the SC2 refusal, recorded here rather than silently widening T002 or T003 after they landed.
- T001's `readable` state rests on the tree's recorded prototype measurement and the documented return shape (`observedHere: false`, `needsBrowserToConfirm: true`); T003's live observation then measured the getter's promise behaviour in Chrome Beta 159. Whether `getTools()` returns the declared tools of a page that declares them remains unobserved.

## Provenance

- Each criterion's Check is the task verify recorded in `.project/build/verify-ledger.jsonl` at the reviewed head: T001 `node --test scripts/webmcp-api.test.mjs && npx prettier --check scripts/webmcp-api.test.mjs` (pass), T002 `node --test scripts/webmcp-audit.test.mjs && npx prettier --check extension/webmcp-audit.js scripts/webmcp-audit.test.mjs` (pass), T003 build + route-table suites + `nx test` (pass), T004 the project verify chain (pass on the rerun entry).
- The gap review is `.project/review/final-gap-1.md` (project Verify, pass), generated from the ledger entry by the final-review helper.
