# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: a7a1e28acae204f781a6ccf30ea80423c22a85dd

## T003 — Render the answer and pin every route table: pass

Task landed as `54398884` ("T003: Render the answer and pin every route table"), base `4635df7a`. Every artefact the task's `files:` names landed in that one commit (`git show 54398884 --stat`: 13 files, including `app.routes.ts`, `panel-demo.ts`, `panel-teardown-leak.ts`, `extension/copy-digest.json`, `scripts/panel-routes.test.mjs`, `scripts/copy-check.test.mjs`, `research/raw/m048-surface-copy.json`, `research/raw/m048-surface.json`) — the route, the loader key, the digest rows and the enumerating suites moved together, which is what SC5/E7 demands of one task.

- ✅ SC1: the pane renders `finding` with the code and body, and renders `owner-not-in-the-message` beside the code when the join returned no owner; a mutant that hides the code reddens: the pane renders every line from the join's own answer — `panel-teardown-leak.ts:398` prints the owner only through `fieldLine` behind the `carried` guard at `:265-266`, and both absences come from `absences` as their own groups at `:334-351`, so no owner is ever composed; `node --test scripts/panel-routes.test.mjs` is 4 pass / 0 fail and its E4 drops the loader key to redden naming `teardown-leak`.

### Commands run at this review head

```
$ node --test scripts/panel-routes.test.mjs
✔ E1: the panel routes are one list mapped over one literal, and every surface keeps its path and its own name
✔ E2: the surface functions are still exported for their suites
✔ E3: the demo module renders the surface text it is handed
✔ E4: every declared route surface has a panel-demo LOADERS key
ℹ tests 4  ℹ pass 4  ℹ fail 0

$ node --test scripts/copy-check.test.mjs
T001 surfaces: 30 surfaces, 178 declared sentences, 34 inline sentences, 1 absence
T002 digest: 204 rows for 212 sentences (8 repeat(s)), 43641 bytes against the record's 265275
T002 per surface: … | teardown-leak: clean, 6 sentences
ℹ tests 30  ℹ pass 30  ℹ fail 0

$ node -e "<count PANEL_SURFACES entries and appRoutes path literals>"
PANEL_SURFACES count: 29
teardown-leak member: true
route path literals (incl spread): 9 ["","signal-provenance","di-doctor","error-explainer","stale-view","interop","chat","picker","image-budget"]

$ node -e "<count digest rows and teardown-leak rows>"
digest rows: 204
teardown-leak rows: 6

$ node -e "<count LOADERS keys>"
LOADERS keys: 29
teardown-leak key: true
import() calls: 29

$ node -e "<replay E4's mutant in memory: delete the teardown-leak LOADERS key>"
LOADERS keys (both forms): 29
green tree missing: []
keys after deleting teardown-leak: 28
mutant missing: ["teardown-leak"]
```

### Findings

- **Finding 1 — the pane renders only what the join returns. Severity: informational, not blocking. PASS.**
  Every line `teardownLeakPanel` writes is either a `PANE_SENTENCES` registry sentence (`apps/angular-ai-devtools/src/app/panel-teardown-leak.ts:136-167`) or a field of the answer under a `LABELS` path (`panel-teardown-leak.ts:104-116`); nothing is composed. The owner is rendered only through `fieldLine(LABELS.owner, 'owner', answer, lines)` (`panel-teardown-leak.ts:398`), and `fieldLine` returns without a line where `carried(value)` is false (`panel-teardown-leak.ts:265-266`: `if (!carried(value)) return;`), so a `null` owner the join states (`extension/teardown-leak.js:852-858`, `owner: found.owner`, null unless `message.owner` is a non-empty string at `teardown-leak.js:291-297`) renders no owner line — no last component, no stack name, no arrival-order attribution (SC1, N1). No cause is composed anywhere: the sequence claim reaches the pane only as `claim.values.sequence` printed verbatim by `claimLines` (`panel-teardown-leak.ts:361-380`), and the pane writes no sentence naming a handle or a cause. Both absences render as separate groups in `absenceLines` (`panel-teardown-leak.ts:334-351`), one `absence.state` line, its own registry sentence and its own `because`/`detail` per entry — `owner-not-in-the-message` and `handle-record-not-held` never fold into one line (E5). The demo's sample fact is the join's own answer shape (`panel-demo.ts:998-1056`), and the suite output above shows `teardown-leak: clean, 6 sentences` in the copy digest.
- **Finding 2 — the surface's numbers moved for the right reason. Severity: informational, not blocking. PASS.**
  Verified at this head: `PANEL_SURFACES` carries 29 entries (28 before — the T003 diff adds exactly `'teardown-leak',` at `apps/angular-ai-devtools/src/app/app.routes.ts:91` between `'webmcp',` and `'components',`); the route table carries 9 path literals plus the `...PANEL_SURFACES.map(...)` spread at `app.routes.ts:144-148` = 38 ordered paths (37 before); `LOADERS` carries 29 keys with `'teardown-leak': () => import('./panel-teardown-leak') as never,` at `panel-demo.ts:67`; `extension/copy-digest.json` carries 204 rows, 6 of them `surface: "teardown-leak"` (198 before). The pins that enumerate those tables moved upward in the same commit, none relaxed: `scripts/panel-routes.test.mjs` gained the surface in all four tables plus the E4 mutant naming `missing: teardown-leak` (`scripts/panel-routes.test.mjs:1267-1291`); `scripts/copy-check.test.mjs` moved `29→30`, `198→204`, `206→212`, `172→178` (`scripts/copy-check.test.mjs:2349`, `:2423-2434`); `page-picker.component.spec.ts` moved `expect(appRoutes).toHaveLength(37)` → `38` (diff hunk at old line 481). The mutant replay above reproduces the pin's red path by name, so the pin moved for the reason the log states (T003 Log line 91).
- **Finding 3 — `research/raw/m048-surface.json`'s three changed values are a citation repair, not an edited measurement. Severity: informational, not blocking. PASS.**
  The T003 diff for that record touches exactly: `sampleFact.lineText`/`holds` at `apps/angular-ai-devtools/src/app/panel-demo.ts:450` (`checked: 206` → `checked: 212`), the `sampleFactComment` lineText at `panel-demo.ts:444` (`206` → `212`), and the `statement` prose quoting both. The cited lines themselves changed in the same commit — `panel-demo.ts:450` now reads `'copy-check': { state: 'clean', unexplained: [], checked: 212 },` and `:444` reads `// (`extension/copy-digest.json`): all 212 compared strings are explained…` — because the digest grew to 204 rows and the copy record to 212 sentences when the thirtieth surface joined. The record re-resolved its citation to the line's new content; it did not edit a measurement it took (the record's own `head` field still states `aa90dcd0`, the head it was measured at). This is the same repair M058's T005 made at the same two sites (`git show e1530ab6`: identical `lineText`/`holds` move at `:450` and `:444`, line number held, head field untouched), so the class and the convention match.
- **Finding 4 — `m048-surface.json`'s `head` field no longer corresponds to the values its `statement` quotes. Severity: low, not blocking.**
  The record states `"head": "aa90dcd0…"` (read via `node -e` over the file: `head: aa90dcd0b344d0a7bdd3b1a4d7ae87f5fd772030`) while its `statement` now names "the thirty-surface record this head measures and the 204-row digest authored from it". The M058 precedent repair kept the same convention, and the record's own `notCaptured` in `m048-surface-copy.json` states the citations re-resolve by search rather than by trusting a typed number, so no suite is misled — but a reader who trusts `head` over `statement` reads two different trees. Rationale for not blocking: the gate that reads this record (`scripts/copy-check.test.mjs`) re-resolves every citation by content, and the values themselves re-derive at this head.

### Files read

| File | Status |
|---|---|
| `.project/intent/INTENT.md` | read, 100% (119/119 lines) |
| `.project/tasks/T003-render-the-answer-and-pin-every-route-table.md` | read, 100% (95/95 lines) |
| `apps/angular-ai-devtools/src/app/panel-teardown-leak.ts` | read, 100% (444/444 lines) |
| `apps/angular-ai-devtools/src/app/app.routes.ts` | read, 100% (149/149 lines) |
| `apps/angular-ai-devtools/src/app/panel-demo.ts` | read, 100% (1056/1056 lines) |
| `scripts/panel-routes.test.mjs` | read, 100% (1292/1292 lines) |
| `scripts/copy-check.test.mjs` | not read whole; read via grep hits at lines 2325, 2349, 2423-2434, 2884 and its full T003 diff (22 changed lines) (~2%) |
| `research/raw/m048-surface-copy.json` | not read whole; read via T003 diff hunks and programmatic counts (~5%) |
| `research/raw/m048-surface.json` | not read whole; read via T003 diff, M058 T005 diff and a `node -e` key/head inspection (~3%) |
| `extension/copy-digest.json` | not read whole; `teardown-leak` rows and total count read programmatically (~1%) |
| `extension/teardown-leak.js` | not read in this wave (judged in wave 4) |
| `research/raw/m059-surface.json` | not read in this wave (held for T004 per the task Log) |
| `.project/tasks/T004-re-derive-the-recordings-and-run-the-project-verify.md` | read, 100% (74/74 lines) |

## Intent coverage

### SC1 — A component that touches its injector after teardown produces a finding naming the code `NG0205` and the message body the record carries, and naming the owning component only where the record attributes one — where it does not, the answer reports the named absence `owner-not-in-the-message` beside the code instead of guessing the element or the component (`.project/ROADMAP.md:2096`, `extension/error-digest.json` `NG0205`); a mutant that suppresses the code match, and a mutant that attributes the message to the most recent component, redden.: pass

- ✅ The pane renders `code` and `message` only from the answer's own fields (`panel-teardown-leak.ts:396-397`), and the owner only where the join filled it — `fieldLine` on `answer['owner']` with the `carried` guard (`panel-teardown-leak.ts:398`, `:265-266`); a `null` owner renders no line at all (`panel-teardown-leak.ts:256-258`: "A `null` the join states renders no line … which is how `owner` stays absent"). `owner-not-in-the-message` renders as its own absence group beside the code (`panel-teardown-leak.ts:157-161`, `:334-351`), and the sample fact carries `owner: null` (`panel-demo.ts:1002`). No line of the pane names an element, a stack frame, the last component mounted or the arrival order; the sentence registry forbids it in its own text (`panel-teardown-leak.ts:159`). No owner can be inferred: the pane reads no field the answer does not carry, and `extension/teardown-leak.js`'s `IGNORED` list (`teardown-leak.js:205-216`) keeps `message.component` and `arrivalOrder` out of the answer the pane is handed.

### SC3 — An unsubscribe that ran before the write it was meant to prevent reports no leak rather than a wrong cause (`.project/ROADMAP.md:2102`): where the record shows the handle was released and the diagnostic still arrives, the answer names the sequence it read and the code, and names no handle as the cause; a mutant that renders "leaked subscription" for a released handle reddens.: pass

- ✅ The sequence reaches the pane only as the claim the join states — `claim: 'sequence', values: { sequence: 'release-then-diagnostic', releases: 1, order: 3 }` (`panel-demo.ts:1039-1042`, produced by `extension/teardown-leak.js:715-727` only when the record states one) — and `claimLines` prints those values verbatim (`panel-teardown-leak.ts:369-376`). The pane composes no cause sentence: the finding-state documentation states the rule as a rendering rule (`panel-teardown-leak.ts:46-49`: "No cause. … names no handle as the cause of the diagnostic, because a release is not a leak (SC3, E4)"), and no line of `PANE_SENTENCES` or `LABELS` names a leak, a subscription or a handle as a cause. The absence sentence for `handle-record-not-held` states the opposite (`panel-teardown-leak.ts:164`: "no subscription, no effect, no timer and no handle is named anywhere in this pane").
- ✅ Both absences stay two states: `absenceLines` renders one group per absence entry in the answer's own order (`panel-teardown-leak.ts:338-349`), and the demo fact carries both as two objects (`panel-demo.ts:1003-1018`).

### SC6 — The answer is read on the panel only, and the panel asks nothing of the inspected page: no DOM added to the page, no page-side control, no input and no widget (AR-6, `.project/ROADMAP.md:2101`); a mutant that installs a page-side hook for this answer reddens.: pass

- ✅ `panel-teardown-leak.ts` imports nothing at runtime — the file's only statements are constants, types and pure functions (`panel-teardown-leak.ts:70-443`); its header states the rule ("It reads no console, opens no page, installs no listener, patches nothing and imports nothing at runtime", `panel-teardown-leak.ts:18-20`) and the module body confirms it: no `import`, no `document`, no `window`, no listener registration anywhere in the 444 lines. The surface is reached lazily through the shared `loadPanelDemo` closure (`app.routes.ts:14-15`, `:144-148`), and `scripts/panel-routes.test.mjs` E3 pins that the demo calls no surface directly (`!source.includes('teardownLeakPanel(')`, `scripts/panel-routes.test.mjs:705`). The T003 diff touched only panel-side files and records — no `extension/` page-side write beyond the digest rows (content strings), no page global, no DOM.
