# Inspect delta — M043 stability-explainer

Measured 2026-11-09 at HEAD `27bfda4092dc0f49fff7ad0d986ca43189193841`, against the docs-audit base
`c9451b1527ae90753315edacd43a30abd2187c6c` — the `Audited HEAD` the audit in force records.

The audit base was recovered from `.project/archive/042-error-boundary/research/DOCS-AUDIT.md`. The active
`.project/research/DOCS-AUDIT.md` is **byte-identical** to that archived copy (SHA-256
`e621a1509962b810fd743dcc60f60c3d50828a81f2e38ece767912615a90026a` for both), so the audit in force is the
M042 one and needs no re-inspection to be named: 152 audited documents, 574 audit rows (340 verified, 16 stale,
0 aspirational, 217 unverifiable, 1 descriptive — `.project/research/DOCS-AUDIT.md:9-15`).

Nothing below was counted by eye. The counts come from `git diff` and the audit's own `## Doc:` inventory,
read by a script; the script's inputs are the two commands in "Numbers".

## Numbers

```bash
git -C . diff --name-only c9451b1527ae90753315edacd43a30abd2187c6c HEAD   # 462 paths
git -C . diff --numstat  c9451b1527ae90753315edacd43a30abd2187c6c HEAD   # per-path +/−
grep -c '^## Doc: ' .project/research/DOCS-AUDIT.md                      # 152 audited documents
```

| Measure | Value |
| --- | --- |
| Audited documents in the audit in force | 152 |
| Audit rows in force | 574 |
| Commits in the span | 311 |
| Paths changed since the audit base | 462 |
| **Audited documents changed** | **19** |
| Non-audit paths changed | 443 |
| Lines changed across those 462 paths | +114,771 / −1,463 |
| Changed `.md` outside bookkeeping (`.project/`) | 0 |

Two shorter segments, same inventory, same command:

| Segment | Paths | Audited docs | Non-audit |
| --- | --- | --- | --- |
| M042's own churn, `b28402ad` ("state: bind next milestone") .. HEAD | 44 | **0** | 44 |
| Since M042 was integrated, `fb84ff3b` .. HEAD | 1 | 0 | 1 — `.project/STATE.md` (+6/−5), this milestone's bind |

**The 1-audited-document-and-31-non-audit figure given to this inspection does not reproduce.** `31b5beb` resolves
to an older `state: bind next milestone` commit: `31b5beb5bb5a..HEAD` is 410 paths with **19** audited documents and
391 non-audit paths, not 1 and 31. What the repository does measure for M042 itself is the `b28402ad..HEAD` row
above: **0** audited documents and 44 non-audit paths (24 of them the M042 archive tree). No segment in this
checkout yields "1 audited document plus 31 non-audit paths"; the nearest true statements are the two rows above,
and they are reported instead.

## The 19 audited documents that changed

Every path has a `## Doc:` section in the audit; the +/- figures are `git diff --numstat`, the reasons are
`git log --oneline c9451b1..HEAD -- <path>`.

| Document | Change | Commits | Reason the commits give |
| --- | --- | --- | --- |
| `.claude/skills/control-ai-browsers/SKILL.md` | +15 / −7 | 6 | Six claims the implementation contradicts; `--target` belongs to the other skill; the 1024-character description limit; the escaper read from `text.mjs`; frontmatter format pass |
| `.commandcode/skills/control-ai-browsers/SKILL.md` | +15 / −7 | 5 | The byte copy of the same set (frontmatter repair instead of the format pass) |
| `.commandcode/skills/control-angular-dev-app/features/README.md` | +3 / −0 | 1 | `74082126` — a route/feature table addition |
| `.commandcode/skills/control-angular-dev-app/features/portal-zoneful-worktree.md` | +86 / −0 | 1 | `74082126` — the pinned zoneful portal worktree, new since the base |
| `.commandcode/taste/angular/taste.md` | +1 / −0 | 1 | `2c0d47d8` — one learned preference, recorded with the spike-answer set |
| `.commandcode/taste/communication/taste.md` | +1 / −0 | 1 | `bc7abcb4` — one learned preference |
| `.commandcode/taste/design/taste.md` | +2 / −0 | 3 | `2c0d47d8`, `ec7b11aa`, `578cc515` — one preference and one extended |
| `.commandcode/taste/tooling/taste.md` | +1 / −0 | 1 | `ec7b11aa` — one learned preference |
| `.commandcode/taste/workflow/taste.md` | +2 / −0 | 2 | `2c0d47d8`, `578cc515` — two learned preferences |
| `AGENTS.md` | +146 / −0 | 5 | Programme-management rules, the verification-gate rule, "verify on the portal first", a project-verify fix pass, the Q1–Q4 queue |
| `plans/angular-ai-devtools-program-backlog.md` | +181 / −40 | 17 | The Q1–Q4 queue (`2c0d47d8`), then rulings A10–A20 (`8e481c8f` … `346715a0`), then Prettier (`3c5063e0`) |
| `research/08-recent-angular-features.md` | +4 / −4 | 2 | `5b8ec9d0`, `6bdd1909` — the resource row now names `Resource#<name>.status`; every `.state` node is `value: null` |
| `research/spikes/README.md` | +30 / −0 | 2 | `2c0d47d8`, `bfc626d9` — the S-answer set's move into `research/spikes/`, and the one byte git changed |
| `research/spikes/capability-dependency-matrix.md` | +305 / −0 | 1 | `2c0d47d8` — new with the spike-record set |
| `research/spikes/instrumentation-free-coverage.md` | +381 / −0 | 1 | `2c0d47d8` — the same |
| `research/spikes/s11-answer.md` | +54 / −0 | 1 | `2c0d47d8` — the S11 answer, moved from `.project/research/` |
| `research/spikes/s12-answer.md` | +554 / −0 | 1 | `2c0d47d8` — the S12 answer, moved |
| `research/spikes/s13-answer.md` | +408 / −0 | 1 | `2c0d47d8` — the S13 answer, moved. This is the document the premise measurement below relies on |
| `research/spikes/sourcemap-future-scope.md` | +573 / −0 | 1 | `2c0d47d8` — new with the spike-record set |

**M042 changed no audited document.** The 19 rows above are the same 19 the M042 delta recorded, with the same
edges (`AGENTS.md` +146/−0, the backlog +181/−40, the seven `research/spikes/` additions). 133 of the 152 audited
documents are byte-identical to the audit base and keep the verdicts the audit records.

## The 443 non-audit paths, grouped

| Directory | Paths | What it is |
| --- | --- | --- |
| `scripts/` | 60 | M032–M042 measure/capture suites, the verification gate, the held-out runners |
| `.project/archive/036-resource-lifecycle/` | 35 | The M036 archive tree |
| `.project/archive/041-navigation-blocking/` | 31 | The M041 archive tree |
| `.project/archive/035-onpush-readiness/` | 26 | The M035 archive tree |
| `research/raw/` | 26 | M022–M042 recordings |
| `.project/archive/042-error-boundary/` | 24 | The M042 archive tree (tasks, reviews, research, plan, intent) |
| `.project/archive/038-linked-state-reset/` | 23 | The M038 archive tree |
| `.project/archive/039-render-phase-effect/` | 23 | The M039 archive tree |
| `.project/archive/040-performance-narrator/` | 21 | The M040 archive tree |
| `.project/archive/037-signal-forms-doctor/` | 20 | The M037 archive tree |
| `apps/angular-ai-devtools/` | 20 | Panel sources and specs for the explainers shipped since M032 |
| `.project/archive/032-lint-core/` | 18 | The M032 archive tree |
| `.project/archive/033-lint-router/` | 17 | The M033 archive tree |
| `.project/archive/034-lint-legacy/` | 15 | The M034 archive tree |
| `extension/` | 15 | The narrators shipped since M032, `agent-main.js` and its tests, the boundary hook, the generated `panel/index.html` |
| `spikes/ng222-app/` | 11 | The counter fixture's routes, pages and specs |
| `.claude/skills/verify-ai-browsers/` | 8 | The eight check scripts, mirrored |
| `.commandcode/skills/verify-ai-browsers/` | 8 | The same |
| `.commandcode/skills/control-angular-dev-app/` | 6 | `control.mjs` and `ng-inspect.js` |
| `.commandcode/skills/control-angular-devtools/` | 6 | `control.mjs`, `fingerprint.mjs`, `proctree.mjs` |
| `.claude/skills/control-ai-browsers/` | 5 | Scripts, mirrored |
| `.commandcode/skills/control-ai-browsers/` | 5 | The same |
| `.commandcode/skills/control-pangular-inspector/` | 5 | Scripts |
| `.commandcode/skills/control-vitest-browser-angular/` | 5 | Scripts |
| `tests/` | 2 | The two held-out guards M041 added |
| `(repo root)` | 2 | `package.json`, `package-lock.json` |
| `.project/CHARTER.md`, `LESSONS.md`, `ROADMAP.md`, `STATE.md`, `model-policy.json`, `research/` | 6 | The active bookkeeping files |
| **Total** | **443** | 32 groups, no group listed path by path |

## What this does not claim

**It records document drift only. No code was audited.** It measures *that* 19 audited documents moved and
*where*; it says nothing about whether any claim in them is still true. No verdict in the audit was re-verified,
no check was run for the delta, and no unchanged document was re-read — 133 of 152 are byte-identical to the base
and keep their recorded verdicts.

**It is not an audit of the M043 premise either.** The second half below reads framework, extension and fixture
sources and runs probes; that is code reading and measurement, it changes no row of the audit, and it is not
evidence about any document's claims.

**It does not close the milestone's question.** The roadmap's goal (`.project/ROADMAP.md:1563`) is measured
below and ruled on; the plan, the tasks and the success criteria are the next phase's work and none is proposed
here.

---

# The M043 premise, measured

## The sentence, verbatim

> Goal: Build the stability explainer: why the app is not stable, and what is still outstanding.

with, from the same section (`.project/ROADMAP.md:1561-1588`):

- Scope: in — "The outstanding work the fixture reports: pending tasks, in-flight requests and unsettled
  resources" (`:1572`); "Each outstanding item joined to the component or service that owns it" (`:1573`);
  "The panel surface rendering what is outstanding and the first item to settle" (`:1574`).
- Success criteria — "an unstable app produces a finding listing the outstanding work with its owners" (`:1583`);
  "a stable app reports stability as measured, not as the absence of a report" (`:1584`).
- Risk — "stability read from a quiet interval is not stability; the observable must come from the reported
  work" (`:1587`).

The question this inspection had to answer is whether any of that is observable from a running page at all.

## 1. The error codes are all runtime, and none of them is a stability signal

Decisive split, measured: a code is a **compile-time** diagnostic when its number is a member of
`@angular/compiler-cli`'s `ErrorCode` enum (121 members, `@angular/compiler-cli/bundles/chunk-FNLXTIAY.js:87`,
formatted `NG${Math.abs(code)}` at `:171`); a code is **runtime** when a `RuntimeError`/`formatRuntimeError` call
carries it in a shipped `fesm2022` bundle. None of the eight named codes is in the compiler enum; all eight are in
the runtime bundles.

| Code | Declared at (22.2.2 install) | Form | Phase | Observable on a running page |
| --- | --- | --- | --- | --- |
| `NG0100` `ExpressionChangedAfterItHasBeenCheckedError` | `@angular/core/fesm2022/_debug_node-chunk.mjs:3613,3617` | `throw new RuntimeError(-100, …)` in `throwErrorIfNoChangesMode` | runtime throw, dev-mode check-no-changes pass (`ApplicationRef.tickImpl` calls `view.checkNoChanges()` — `:13317-13321`) | yes, as a thrown error |
| `NG0910` | `_debug_node-chunk.mjs:3526,3533` | `throw new RuntimeError(-910, …)` in `ɵɵvalidateAttribute` | compile-time **decided**, runtime **thrown**: the compiler emits the validator (`@angular/compiler/fesm2022/compiler.mjs:19687`, `Identifiers.validateAttribute`) | yes, but only where the compiler emitted the validator |
| `NG0912` component-ID collision | `_debug_node-chunk.mjs:10514` | `console.warn(formatRuntimeError(-912, …))` | runtime console warning, `ngDevMode` only | yes |
| `NG0913` oversized image | `@angular/core/fesm2022/core.mjs:1868,1871` | `console.warn(formatRuntimeError(-913, …))` | runtime console warning | yes |
| `NG0950` required input | `core.mjs:37` | `throw new RuntimeError(-950, …)` in `createInputSignal` | runtime throw | yes |
| `NG0951` required child query | `_debug_node-chunk.mjs:10152` | `throw new RuntimeError(-951, …)` | runtime throw | yes |
| `NG0955` **duplicate keys** | `_debug_node-chunk.mjs:14811-14812` | `console.warn(formatRuntimeError(-955, …))` — message: "The provided track expression resulted in duplicated keys…" | runtime console warning | yes |
| `NG0956` **whole-collection re-creation** | `_debug_node-chunk.mjs:15086-15087` | `console.warn(formatRuntimeError(-956, …))` — message: "The configured tracking expression (track by identity) caused re-creation of the entire collection…" | runtime console warning | yes |
| `NG8001` / `NG8002` | compiler-cli `ErrorCode` enum only (`chunk-FNLXTIAY.js:87` area) | diagnostic | **compile-time only** — absent from every core/router `fesm2022` | **no** |
| `NG04002` | `@angular/router/fesm2022/_router-chunk.mjs:3058` | `new RuntimeError(4002, …)` "Cannot match any routes…" | runtime throw | yes |

Two corrections to the brief's list, measured rather than argued: **`NG0956` is not duplicate keys — `NG0955` is;
`NG0956` is the track-by-identity re-creation warning.** And the eight named codes are *not* compile-time: M032/M033's
"NG8xxx are compile-time, only `NG04002` survives at runtime" is confirmed here (`NG8001`/`NG8002` in the compiler
enum only; `NG04002` at `_router-chunk.mjs:3058`), but `NG01xx`–`NG09xx` belong to the other side of that line. The
`NG0950` family present in 22.2.2 is exactly `NG0950`, `NG0951`, `NG0955` and `NG0956` — `-952`, `-953` and `-954`
are carried by no runtime bundle — and every one of them is a runtime throw or a runtime `console.warn`.

What that says about the premise: the panel's `extension/error-digest.json` holds 64 entries with fields
`code`, `title`, `body` and **no phase field** (measured: every entry carries exactly those three keys). 10 of the
64 exist only as compiler diagnostics, 48 are runtime, 2 numbers (1001, 1002) appear on both sides, and 4 match
neither scan — so **a running page can never emit the compiler-only 10**, and the digest's one shape carries both
kinds, which means the digest alone cannot tell a reader which entries a page could ever produce.

And the digest's only stability-named entry is `NG0506 — "Application remains unstable"`
(`extension/error-digest.json:160-162`), which is the hydration timeout: `logWarningOnStableTimedout`
(`@angular/core/fesm2022/core.mjs:671-674`) fires only when `provideClientHydration()` is in the app and
`ApplicationRef.isStable` has not emitted `true` within `APPLICATION_IS_STABLE_TIMEOUT = 10_000`
(`core.mjs:510,673`). It is a warning *about* the observable, not a reader of it, and it needs SSR hydration to
appear at all.

## 2. The one signal the agent already has: the profiler record

The agent subscribes to three streams today — `ng.ɵsetProfiler` (`extension/agent-main.js:520-558`), `Router.events`
(`:1790-1819`) and the resolved `ErrorHandler`'s `onViewError` (`:2169-2226`) — and the profiler is the only one that
carries change-detection work. Reading `onEvent` / `openCycle` / `closeCycle` / `diffEpochs` says precisely what a
repeated change-detection cycle would look like, and what it would not.

**What is recorded.** `closeCycle` (`agent-main.js:1038-1060`) dispatches one `angular-ai:record` per *task*, with
`{ cycleId, startedAt, trigger, zoneMode, events[], routerEvents[], boundary, checks[] }`. `events` is the frame's
flat arrival list of `{ type, pair, end, at, componentName }` entries (`:692-705`), one per profiler event of the
six pairs the file reads. `checks` is an array built from a `Map` keyed by the component **instance**
(`:743,750-760`), so a frame carries at most one row per instance.

**Where a cycle begins and ends.** `openCycle()` is called from exactly one place: `TemplateUpdateStart`
(`:599-601`). It closes in a microtask (`:747`), which is the frame boundary. A `ChangeDetectionStart` with no
template update therefore opens nothing: those arrivals are held in `pendingWorkEvents` (bounded at 64,
`:639-640,707-717`) and either adopted by the next frame that opens in the same task (`:720-724`) or dropped.

**A repeated cycle, in the record.**

- *Same task, same view:* the second pass appends a second `TemplateUpdate` start/end pair to **the same**
  `checks` row — the row's `events` array grows; no new row appears and no field counts the passes.
- *Separately:* each `ApplicationRef.tick()` emits one `ChangeDetectionStart`/`End` pair with **no instance**
  (`@angular/core/fesm2022/_debug_node-chunk.mjs:13300,13328`; `profiler(event, instance = null)` at `:155`), so a
  second pass shows up as a second `pair: "ChangeDetection"` entry with `componentName: null` in `events`. That is
  a count of ticks, attributed to no view.
- *Across tasks:* successive records with increasing `cycleId` and the same `componentName` in each `checks` row.
- *Not at all:* a tick that does no template work never opens a frame, so a repeated CD pass with no template
  update is not a record.

**What it cannot say.** `diffEpochs` (`:1021-1036`) compares each signal-graph node's `epoch` to the previous
frame's for the same instance and returns the changed node ids — it reports *which signal nodes moved*, and it
keys a `WeakMap` by instance, so a `null` instance gets no entry and no delta rather than an empty one. Nothing in
the record reports how many cycles ran, how many are outstanding, whether the app is stable, or what is pending.
A frame carries *work that happened*; the record has no field for *work not yet finished*.

**And silence is not stability.** After install the agent dispatches one `dispatchInitialRecord`
(`agent-main.js:566,1418-1448`) and thereafter only frames. A stable page and an uninstrumented page both produce
no further record. That is the roadmap's own risk line (`ROADMAP.md:1587`) measured in the code: the record cannot
answer "stable", only "this work happened".

The shipped reader of the record is M040's performance narrator (`extension/performance-narrator.js:1-70`), which
mints one interval per start in the frame and reports `measured` / `cannot-tell` / `unmeasured`. A repeated CD pass
is therefore already *readable* as repeated intervals — but it is read as cost, not as stability.

## 3. The published debug keys: 25 on 22.2.2, 24 on 22.1.8, none answers the question

Enumerated from the shipped bundles of both installs (the `ng` expando's two object literals plus every
`publishGlobalUtil('…')` call site):

| Version | Install | Keys | Composition |
| --- | --- | --- | --- |
| 22.1.8 | `node_modules/@angular/core` | **24** | 21 core (`_debug_node-chunk.mjs:12558-12580`) + 3 router (`ɵgetLoadedRoutes`, `ɵgetRouterInstance`, `ɵnavigateByUrl`) |
| 22.2.2 | `spikes/ng222-app/node_modules/@angular/core` | **25** | The same 21 + 1 new (`toggleWatchSignal`, `internalCoreGlobalUtils` — `_debug_node-chunk.mjs:12907-12909`) + the same 3 router |

The delta between the two versions is exactly `toggleWatchSignal`. The 25 are: `applyChanges`, `enableProfiling`,
`getComponent`, `getContext`, `getDirectiveMetadata`, `getDirectives`, `getHostElement`, `getInjector`,
`getListeners`, `getOwningComponent`, `getRootComponents`, `isSignal`, `ɵgetComponentInstanceDeepLinkId`,
`ɵgetControlFlowBlocks`, `ɵgetDependenciesFromInjectable`, `ɵgetInjectorMetadata`, `ɵgetInjectorProviders`,
`ɵgetInjectorResolutionPath`, `ɵgetLoadedRoutes`, `ɵgetRouterInstance`, `ɵgetSignalGraph`, `ɵgetTransferState`,
`ɵnavigateByUrl`, `ɵsetProfiler`, `toggleWatchSignal`.

Which of them answers "is change detection still running":

| Candidate | Verdict, measured |
| --- | --- |
| `ng.applyChanges(component)` | **No, and it would perturb the answer.** It is a writer: `markViewDirty(getComponentViewByInstance(component), 3)` then `detectChanges` on every root component (`_debug_node-chunk.mjs:11917-11921`). Asking it a question starts change detection |
| `ng.getDirtyComponents` | **Does not exist.** Zero matches for the token anywhere under `node_modules/@angular` and `spikes/ng222-app/node_modules/@angular` (both installs) |
| `ng.toggleWatchSignal(id)` | Watches one **signal node's** debug events (`_debug_node-chunk.mjs:12610-12630`), not CD state |
| `ng.ɵgetSignalGraph` / `ɵgetControlFlowBlocks` | Signal and block graphs, with per-node `epoch`. An epoch delta is per-frame work, not a stability state |
| `ng.enableProfiling` / `ng.ɵsetProfiler` | Writers of the profiler hook; `ɵsetProfiler(null)` clears every callback (`:144-153`) |
| `ng.isSignal`, the `get*` family, the injector readers | Identity and injection reads. None carries a scheduling or stability field |

**So: no published debug key exposes a stability state.** The state exists one level down, on
`ApplicationRef` — see next.

## 4. What the page *does* expose, and what it does not

**`ApplicationRef.isStable` is real and needs no app cooperation.** Its getter is
`hasPendingTasksObservable.pipe(map(pending => !pending))` (`@angular/core/fesm2022/_debug_node-chunk.mjs:13221-13222`),
backed by `PendingTasksInternal` (`_pending_tasks-chunk.mjs:2284-2322`) — a `Set` of task ids plus a
`BehaviorSubject<boolean>` that flips on the first `add()` and the last `remove()` (`:2304-2322`) — with
`whenStable()` at `:13229`. It is reachable from a page-side reader with zero application instrumentation: the
agent already performs the exact read for `Router` — `ng.getInjector(host)` → `ɵgetInjectorResolutionPath` →
`ɵgetInjectorProviders` → the provider record whose `token.name` matches → `injector.get(token)`
(`extension/agent-main.js:1470,1765-1784,1808-1819`). That this same route reaches `ApplicationRef` and
`PendingTasks` was measured on the portal on 2026-11-08 (`research/spikes/s13-answer.md:91,107,134`).

**The inventory of outstanding work is not exposed.** `PendingTasksInternal.pendingTasks` is a `Set<number>` whose
`add()` takes no descriptor (`_pending_tasks-chunk.mjs:2304-2312`); the public `PendingTasks` surface is
`add(): () => void` and `run(fn)` and nothing else (`:3176-3206`; `types/core.d.ts:9270-9295`). There is no count,
no list, no kind and no owner in the API. `hasPendingTasks` is a boolean.

**The one ownership surface is an application opt-in.** Angular 22 ships `provideStabilityDebugging()`
(`core.mjs:686-730`; `types/core.d.ts:3101`): it provides a `DebugTaskTrackerImpl` that stores
`new Error('Task stack tracking error')` per open task id (`core.mjs:677-685`) and, after
`APPLICATION_IS_STABLE_TIMEOUT - 1_000` ms, `console.debug`s each open task's **creation stack** under
"PendingTasks keeping application unstable" (`core.mjs:707-724`). That is a stack, not a component: the owner has
to be inferred from a call site, and only an application that opts in has it at all.

**"The first item to settle" is not observable.** The tasks live in an unordered `Set` of integers with no
insertion timestamp crossing any API and no settle-time field anywhere.

## 5. The fixture

Measured by scanning `spikes/ng222-app/src` (the whole fixture, excluding `node_modules`) for each token:

| Token | Fixture |
| --- | --- |
| `resource(` | **4**, all in `spikes/ng222-app/src/app/resource-states.ts` |
| `HttpClient`, `provideHttpClient`, `httpResource(` | **absent** — the fixture issues no in-flight request |
| `PendingTasks` | **absent** |
| `provideStabilityDebugging` | **absent** |
| `ApplicationRef`, `isStable`, `whenStable` | **absent** |
| `appRef.tick(`, `afterEveryRender` | **absent** |
| `effect(` | 3 (`counter.ts`, `stale-view-fixture.ts`, `stale-view-deferred-fixture.ts`) |

**What it can produce today.** One of the four resources never settles on purpose: `LoadingResource`'s loader
returns a promise nothing resolves (`resource-states.ts:61,67-71`), and the template reads all four statuses
(`resource-states.ts:35-54`), so its load effect runs. A loading `resource()` takes a pending task for the duration
of its load — `this.pendingTasks.add()` inside `loadEffect`
(`@angular/core/fesm2022/_resource-chunk.mjs:331,404`), resolved only when the loader settles — so **on
`/resource-states` the app is unstable for the page's lifetime, with no fixture change at all**. That is the
positive half of M043's premise, and it is already installed in the fixture.

**What it cannot produce.** A transition (unstable → stable) needs a task that starts *and* ends; an in-flight
request needs `provideHttpClient` plus a delayed handler; a named owner needs `provideStabilityDebugging()` in
`app.config.ts`; an ordered "first to settle" needs per-task settle data that no API exposes; a repeated
change-detection pass for one view needs a page that ticks twice in a task (or writes a signal twice) —
`appRef.tick(` is absent. Each of those is an addition to the fixture, not something the current one can be
driven to.

**What the agent subscribes to.** Across the 32 authored scripts under `extension/` (the `extension/panel/`
bundles excluded — they are generated build output of the panel app, itself an Angular page):
`ɵsetProfiler` in `agent-main.js` and `after-render.js`; `isStable`, `whenStable`, `PendingTasks`,
`ApplicationRef`, `provideStabilityDebugging` **absent from every one of them**. The panel's routes
(`apps/angular-ai-devtools/src/app/app.routes.ts`) carry `performance`, `navigation`, `error-boundary`,
`resource`, `render-phase` and the rest — there is no stability route.

---

# Ruling

**The roadmap's sentence does not survive as written. It needs narrowing to what a page can observe — the same
shape of narrowing M032/M033 applied to the NG8xxx codes and M042 applied to the portal.**

| Clause (`ROADMAP.md:1563`-`1574`) | Observable from a running page? | Evidence |
| --- | --- | --- |
| "why the app is not stable" — the **cause** | **No.** The only accessor is a boolean stream (`isStable`); nothing reports why it is false | `_debug_node-chunk.mjs:13221-13222`; no key among the 25 carries a reason |
| **that** the app is not stable | **Yes**, with no app cooperation, through the injector read the agent already performs | `_debug_node-chunk.mjs:13221-13229`, `_pending_tasks-chunk.mjs:2292-2322`; `agent-main.js:1765-1784,1808-1819`; `research/spikes/s13-answer.md:91,134` |
| "what is still outstanding" — pending tasks | **No.** `Set<number>`, `add()` takes no descriptor, public API is `add`/`run` only | `_pending_tasks-chunk.mjs:2304-2312,3176-3206`; `core.d.ts:9270-9295` |
| … in-flight requests | **No,** and the fixture issues none | `HttpClient`/`provideHttpClient` absent from `spikes/ng222-app/src` |
| … unsettled resources | **Yes** — and it is already shipped: M036's resource explainer reports exactly "a resource that has not settled… status and the last lifecycle event" via the signal graph | `resource-states.ts:61,67-71`; `_resource-chunk.mjs:331,404`; `ROADMAP.md:1349-1352,1371` |
| "each outstanding item joined to the component or service that owns it" | **Only for resources, or only for an app that opts in.** Resources: via `Resource#<name>` signal-graph labels (M036). Tasks: only through `provideStabilityDebugging()`, and then the "owner" is a stack frame, not a component | `core.mjs:677-730`; `resource-states.ts:8-10`; `research/08-recent-angular-features.md`'s resource row |
| "the first item to settle" | **No.** No per-task data, no settle time, no order crossing any API | `_pending_tasks-chunk.mjs:2304-2322` |
| "a stable app reports stability as measured, not as the absence of a report" (SC2) | **Yes, but not from the record.** The record is silent when nothing ticks; `isStable` is the measurement | `agent-main.js:566,1418-1448,1038-1060` |
| "a repeated change-detection cycle for the same view" (the one signal a page can observe) | **Yes, as repeated *work*:** a second `TemplateUpdate` pair in the same check row, or a second `ChangeDetection` pair with `componentName: null` — never as a per-view cycle count and never as outstanding work | `agent-main.js:573-614,738-748,1038-1060`; `_debug_node-chunk.mjs:155,13300,13328` |

Concretely, what a running page can be made to say is:

> **whether** the app is stable, **when** it settled, and **which work ran** in each frame — including a repeated
> pass over the same view, read as repeated work.

It cannot say: **why** it is unstable, **what** is outstanding, **who** owns it (except resources, by name, and
only for an app that opts into `provideStabilityDebugging()`), or **what settles first**.

Two further consequences of the measurement, stated because they bear on the premise and not on any plan:

1. **Two of the three scope-in bullets are already shipped elsewhere.** "Unsettled resources" is M036
   (`ROADMAP.md:1351,1371`); "the outstanding work the fixture reports" as *per-frame work* is M040
   (`extension/performance-narrator.js:1-70`). What is left of M043's own ground is the stability *state* — the
   `isStable` transition — which no shipped surface reads (`isStable` absent from all 32 authored extension
   scripts).
2. **The scaffolded gap is in the fixture and the agent, not in the framework.** The framework exposes the state
   (`isStable`), the fixture already holds an app unstable forever (`/resource-states`), and the agent already
   knows how to reach the environment injector by token name. What does not exist is any subscription to
   stability and any record field that carries it.

---

## Probes run

All six were scratch scripts outside the repository (session scratch directory, not tracked), reading only
tracked sources and `node_modules`. Nothing in the repository was modified to produce them.

| # | Probe | Input | Exit | Headline output |
| --- | --- | --- | --- | --- |
| 1 | `git diff --name-only` / `--numstat` / `--shortstat` + `git log --oneline` over the audit inventory | base `c9451b15`, HEAD `27bfda40` | 0 | 462 paths, 19 audited documents, 443 non-audit, +114,771/−1,463, 311 commits |
| 2 | Segment counts, same inventory | `c9451b15`, `b28402ad`, `fb84ff3b`, `31b5beb` → HEAD | 0 | 462/19/443; 44/0/44; 1/0/1; 410/19/391 |
| 3 | Published-`ng`-key enumeration over both installs' `fesm2022` | `node_modules/@angular`, `spikes/ng222-app/node_modules/@angular` | 0 | **24** keys on 22.1.8, **25** on 22.2.2; delta `toggleWatchSignal`; `getDirtyComponents` absent from both |
| 4 | Error-code phase classification (compiler `ErrorCode` enum vs core/router `RuntimeError` call sites) | 22.2.2 install | 0 | compiler enum 121 members; core runtime 93 codes; NG0100/0910/0912/0913/0950/0951/0955/0956 runtime-only; NG8001/NG8002 compiler-only; NG04002 at `_router-chunk.mjs:3058` |
| 5 | Digest phase inventory | `extension/error-digest.json` | 0 | 64 entries, fields `code,title,body` only; 10 compiler-only, 48 runtime, 2 shared numbers, 4 matched by neither scan; only stability entry `NG0506` |
| 6 | Fixture / agent capability inventory, token counts per file | `spikes/ng222-app/src`, `extension/` (32 authored scripts) | 0 | 4 `resource(`, no `HttpClient`/`PendingTasks`/`isStable`/`tick`; `ɵsetProfiler` present, `isStable`/`PendingTasks`/`ApplicationRef`/`provideStabilityDebugging` absent from all authored scripts |

The reference citations in this document resolve at HEAD `27bfda40`; the `node_modules` line numbers are those of
the **22.2.2** install under `spikes/ng222-app/` unless a path says `node_modules/@angular` (the 22.1.8 install).
Where the two differ the line numbers are given for 22.2.2 and the 22.1.8 number is stated where it matters
(the `ɵɵvalidateAttribute` throw is at `_debug_node-chunk.mjs:3526/3533` in 22.2.2 and `:3526/3533` in 22.1.8 —
identical; `NG0912` moves `:10514` → `:10319`, `NG0955` `:14811` → `:14450`, `NG0956` `:15086` → `:14722`,
`NG0951` `:10152` → `:9957`).
