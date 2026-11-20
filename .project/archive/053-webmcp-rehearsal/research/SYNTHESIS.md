# M053 webmcp-rehearsal — synthesis

Four waves, four tasks, reviewed and landed at `abcfc9fb262bcc400831f6a0d0aa804732f87de1`; project
verify and ship gate pass at `93e18f8d80c0796bc21da5ca5432a54a09f22395`. This records what the
milestone measured, what it changed, and the two facts the ship must carry.

## What the milestone set out to show

The panel rehearses a declared WebMCP tool call through the panel's own model, reporting what the
model chose and what the tool returned, with no write to the inspected app and no model turn invented
where none can be made. Nothing in the tree had ever read a tool list through an awaited caller, and
`executeTool` had never been measured at all (INTENT Goal).

## What the measurement changed

The premise "rehearses a declared tool call" assumed two things the tree had never observed: that a
page can declare a tool, and that invoking one is possible without a model turn (INTENT C1). T001
measured both in Chrome/159.0.8154.13 (`research/raw/m053-execute-tool.json`):

- `executeTool` needs one argument of type `Tool` — arity 1, and a descriptor-shaped object, a name
  string or `new Tool()` are each refused with `parameter 1 is not of type 'Tool'`, because `Tool` is
  a global interface with an illegal constructor. A handle cannot be fabricated, and on a page that
  declares no tool there is none to hand it (`measurement.invocation`).
- It answers a Promise in every case measured, refusing as a rejection rather than a synchronous
  throw; what a successful call resolves to is unobserved (`measurement.answerShape.resolvedValueObserved: false`).
- No launch produced a no-model answer: `--no-ai-features` removed `document.modelContext` while
  `LanguageModel.availability()` still answered `available`, so the model and the surface are separate
  facts and the no-model state is unmeasured (`measurement.noModel.observedHere: false`).

Two consequences shaped the build (PLAN C4): the surface keys its refusals on the absent handle
(`no-tool`) and the unreadable list (`unavailable`), never on a missing model, and carries **no
`no-model` state at all**; and T003 ships a page that actually registers a tool, because without one
SC2's success path cannot exist. Registering a tool on a page the demo owns is not N4's prohibited
registration, which forbids registering a tool to observe a list — the page's one script calls
`registerTool` exactly once (`apps/angular-ai-devtools/src/app/panel-webmcp-rehearsal.ts:438`).

## What was built

- **Wave 1 (T001, `0058353f`)** — the measurement, cited line by line and pinned by
  `scripts/webmcp-execute-tool.test.mjs`, which re-reads every citation and reddens a doctored line
  or a filled-in absence by name. Nothing built.
- **Wave 2 (T002, `4ff78407`)** — `extension/webmcp-rehearsal.js`: the awaited caller `readToolsAwaited`
  (M052's carried residual C3 finished — one `getTools()` call, awaited, the resolved list handed to
  the shipped M052 reader unchanged) and the pure join `rehearse` answering `rehearsed`, `no-tool`,
  `refused` or `unavailable` and no fifth state. Held-out E4 and ten redden-by-name mutants, proven
  pure with `document`, `fetch` and `Date` armed as traps.
- **Wave 3 (T003, `0e0eba55`)** — the surface `apps/angular-ai-devtools/src/app/panel-webmcp-rehearsal.ts`
  rendering the four states from an enumerated sentence registry, the demo-owned page
  `REHEARSAL_PAGE` whose script registers exactly one tool, the `webmcp-rehearsal` route and loader,
  and the route-table suites declared in the same landing (the M044 lesson applied: the gate's
  suite-diff allow-list got its two rows before a landing could refuse).
- **Wave 4 (T004, `fa126842` + `abcfc9fb`)** — the records: `research/raw/m053-surface.json` (the
  twenty-fifth surface, 63 citations re-read green), `research/raw/m053-verdict-claims.json` captured
  with its own command, the copy digest authored from the re-measured copy record (169 → 176 rows,
  seven new under `webmcp-rehearsal`), five route records re-cited with 0 stale, and the project
  verify run as the last action.

## Review findings and their resolution

All four waves passed full review at cycle 1 (`.project/review/wave-1.cycle1.md` …
`wave-4.cycle1.md`). The one process correction during the waves was evidentiary, not a product
defect: the wave-4 gate-stability re-derivation initially cited `archive.summary` as the value the
final landing moved, when the moved value was `archive.detail.plainRun.summary` — the held run is
pinned to `capture.head`, not HEAD, so its summary cannot move with the tree. The review was corrected
against the record rather than the record against the review.

## The two facts the ship carries

1. **C4: `executeTool` needs a `Tool` handle that cannot be fabricated**, so the success path needs a
   page that declares a tool — the demo-owned page provides it — and the surface keys its refusal on
   the absent handle, never on a missing model.
2. **A rehearsal has not been observed live.** No browser was launched for this milestone's surface
   and no panel runtime loads `REHEARSAL_PAGE` yet; the `rehearsed` fact is the demo's sample held
   field-for-field to the shipped join by `apps/angular-ai-devtools/src/app/panel-demo.spec.ts:4559-4602`,
   and the final walkthrough was performed through the shipped pane module. The limit is recorded in
   `research/raw/m053-surface.json`'s `notCaptured` and the task Log, and is carried into the ship —
   stated, not closed.

## What this milestone leaves behind

- an awaited caller that finishes M052's residual C3, so `tools` and `empty` are reachable states;
- a surface whose vocabulary is closed at four states, with the unmeasured state deliberately absent;
- and recordings whose every claim is re-derived by their own capture commands, so the next milestone
  re-measures rather than copies.
