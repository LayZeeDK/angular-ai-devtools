---
id: T001
title: Measure the stability surface and carry it on the page agent's record
wave: 1
deps: []
status: done
agent: build_agent
base: ef2cc27f4c60e2bc21e659881d7a124deb502222
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - extension/agent-main.test.mjs
  - extension/page-footprint.test.mjs
  - extension/error-boundary.test.mjs
  - apps/angular-ai-devtools/src/app/companion.spec.ts
  - apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts
  - scripts/performance-measure.test.mjs
  - scripts/render-phase-measure.test.mjs
  - scripts/performance-capture.test.mjs
  - scripts/render-phase-capture.test.mjs
  - scripts/navigation-measure.test.mjs
  - scripts/navigation-capture.test.mjs
  - scripts/error-boundary-measure.test.mjs
  - scripts/error-boundary-capture.test.mjs
  - scripts/stability-measure.test.mjs
  - research/raw/m043-stability.json
---

# T001 — Measure the stability surface and carry it on the page agent's record

## Context

The milestone's observable is `ApplicationRef.isStable`, and no shipped file reads it: `isStable`, `whenStable`, `PendingTasks` and `ApplicationRef` are absent from all 32 authored scripts under `extension/`. The reach the intent names is the one the agent already performs for `Router` — `ng.getInjector(host)`, then `ɵgetInjectorResolutionPath`, then `ɵgetInjectorProviders`, then the provider record whose `token.name` matches, then `injector.get(token)` — and whether that walk resolves `ApplicationRef` on a page has never been driven at this head. Two more readings are equally unmeasured and each decides a later task's shape. The getter builds a fresh `map` pipe per access over `hasPendingTasksObservable`, so whether one subscription taken through it stays current through a later `add()`/`remove()` flip is the intent's own open question: it decides whether the agent subscribes once or re-reads per record, and a plan that assumed either would write the wrong record. And the transition: `LoadingResource`'s loader returns `new Promise<never>(() => {})` that nothing resolves (`spikes/ng222-app/src/app/resource-states.ts` at 61 and 67-71), so the counter fixture's `/resource-states` is unstable for the page's lifetime — SC1's positive half is installed already, and that route cannot start and end a task. SC2's positive half may therefore have to come from another subject, and whether one exists is a measurement rather than a plan decision.

The record is the milestone's only page-side artefact, and it does not carry stability today. A reader written against an assumed section would read fields nobody writes, which is the defect three earlier milestones found at a landing gate rather than at plan time, so this task adds the section and this task's recording is the evidence every later task quotes: the state and the emission it was read from, the attach reading, the settle reading or its absence, and the repeated work the frame's own `events` list already holds. `research/raw/m039-render-phase.json`, `research/raw/m040-work-events.json`, `research/raw/m041-navigation.json` and `research/raw/m042-error-boundary.json` cite `extension/agent-main.js` by line — `prevEpochs.set(instance, next);` at 1034, `function closeCycle()` at 1038, the router reach at 1750-1839 — and six suites anchor those citations, so the edit is kept line-neutral and every one of them is declared here.

## Approach

Measure first, then publish, then measure the published shape. The suite derives every claim from three artefacts already in this checkout: the shipped agent's own source, the fixture's installed core, and this repository's own install. The injector walk is driven the way the agent's own suite boots the file — one realm, `ng` mocked, a host element whose injector resolution path carries provider records — on a subject whose records include the `ApplicationRef` token and on one whose records do not, so the recording states what `injector.get` answered in each case and what a page without it can still say. The subscription's currency is recorded against the stream it derives from, with the source anchors for the first `add()` and the last `remove()`, so the recording says whether one subscription stays current and T002 may cite a subscription or the named absence.

The section is additive and plain. It sits beside `events`, `routerEvents`, `boundary` and `checks` in both the frame record and the initial snapshot, is armed from the install path's own answer and never from inside the profiler callback, and is removed by the same reset path as the profiler and router subscriptions. Every field is a number, a boolean or a string the page published, and every field the page did not publish is `null`: the emission's value and the page's own receipt reading, the attach reading, and the settle reading as the page's own reading when `true` arrived or the named absence `no-settle-observed`. Nothing is inferred, and no clock is read by the agent beyond the page's own `performance.now()`.

The drive is armed, not default. A default run re-derives the whole recording from source and writes nothing; `M043_CAPTURE=1` serves the fixture, drives `/resource-states` and any subject that reaches `true`, and writes the recording for a second armed run to prove byte-identical. The transition half is recorded as an answer either way: a subject that produced an unstable-to-stable change names itself and the two readings, and a capture in which none did answers `no-transition-observed` and says so in the recording rather than leaving the reader to infer it.

The added code moves no cited line. Every likely anchor is above the insertion point, so the section lands where nothing is cited, and each suite that reads the agent as its own subject is run to prove it unmoved or re-cut with the failing assertion quoted.

## Interface contract

- Record: the page agent publishes a `stability` section beside its `events`, `routerEvents`, `boundary` and `checks` fields — `{ reachedBy, absence, attachAt, reading, settle, version, coreVersion }` — where `reachedBy` is the token the injector walk resolved or `null`, `absence` is `null` or `no-stability-observable`, `attachAt` is the page's own `performance.now()` at attach, `reading` is `{ value, at }` — the `isStable` emission the state was read from and the page's own reading when it arrived — or `null`, `settle` is `{ state: "settled", at }` or `{ state: "no-settle-observed" }`, `version` is the constant the surface works against, and `coreVersion` is what the page reported, `null` where it reported none.
- Answer: `stability(frame)` answers `{ state, absence, reading, settle, repeats, absences, version, coreVersion }` where `state` is `unstable`, `stable`, `cannot-tell` or `idle`, `settle` is `{ state: "settled", at, sinceAttachMs }` or `{ state: "no-settle-observed" }`, each repeat is `{ pair, componentName, passes }` read from the frame's own `events`, and `absences` lists one named absence per unanswered question.
- Pane answer: `stabilityPanel(answer)` answers `{ state, kind, message, lines, text, cells, blocks }` where each cell holds the text of its own state or the empty string, `lines` carries one line per fact the answer carried, and `blocks` carries one block per reading — the state, the settle reading and the repeated work — each holding its own lines.

## Intent coverage

- SC1
- SC2
- SC6

## Edges

None; E1 to E11 are held by T002, T003 and T004, and this task must not redden any of them.

## Acceptance criteria

1. The reach is measured rather than assumed: the shipped agent's own walk — `ng.getInjector(host)`, `ɵgetInjectorResolutionPath`, `ɵgetInjectorProviders`, the provider record whose `token.name` is `ApplicationRef`, `injector.get(token)` — is driven on a subject whose provider records carry that token and on one whose records do not, and the recording states what `injector.get` returned in each case and what a page without it can still say.
2. The subscription's currency is measured rather than assumed: one subscription taken through the `isStable` getter is recorded against the `hasPendingTasksObservable`-backed stream it derives from, with the source anchors for the first `add()` and the last `remove()` flip, so T002 may cite a subscription that stays current or the named absence where the read could not be confirmed, and the recording says which of the two it is.
3. The read is carried on the record the agent already dispatches — a `stability` section beside `events`, `routerEvents`, `boundary` and `checks` in both the frame record and the initial snapshot — armed from the install path's own answer and never from inside the profiler callback, removed by the reset path, with the profiler still installed once and `ɵsetProfiler(null)` never called.
4. `/resource-states` is driven and recorded as SC1's positive case with no fixture change: the recording carries the page's own emission, the reading it was taken from and the unstable state it produces, and the fixture's never-settling loader is quoted with the anchors that make the page unstable for its lifetime.
5. The settle transition is measured and never assumed: the recording states whether any inspected subject produced an unstable-to-stable change while the read was attached, naming the subject and the two `performance.now()` readings where one did, and answering `no-transition-observed` where none did — so SC2's positive half rests on a measurement and its absence is named rather than inferred.
6. The repeated-work half is re-derived from the frame's own `events` list at this head — a second `TemplateUpdate` start/end pair inside one `checks` row and a second `ChangeDetection` pair carrying `componentName: null`, each recorded as the frame emits it — so T002's passes are read from a recording and not from the intent's quotation.
7. Every claim is re-derived from the installed chunk, the agent's own source or the fixture's install, or is quoted as the recording's own measurement with its source named; a default run writes nothing and adds nothing to any page, `M043_CAPTURE=1` arms the drive, a second armed run at the same head changes no byte, and a missing build or install fails by naming the path it wanted rather than skipping.
8. Every suite that reads `extension/agent-main.js` as its own subject still holds its anchors — `prevEpochs.set(instance, next);` at line 1034, `function closeCycle()` at line 1038 and the router reach at `extension/agent-main.js` lines 1750 to 1839 among them — or is re-cut where the added section moves what it asserts with the failing assertion quoted, and the page footprint bound still holds.

## Verify

```bash
node --check extension/agent-main.js && node --check extension/agent-main.test.mjs && node --check scripts/stability-measure.test.mjs && node --experimental-strip-types --test "scripts/stability-measure.test.mjs" "extension/agent-main.test.mjs" "extension/page-footprint.test.mjs" "extension/error-boundary.test.mjs" "scripts/performance-measure.test.mjs" "scripts/render-phase-measure.test.mjs" "scripts/performance-capture.test.mjs" "scripts/render-phase-capture.test.mjs" "scripts/navigation-measure.test.mjs" "scripts/navigation-capture.test.mjs" "scripts/error-boundary-measure.test.mjs" "scripts/error-boundary-capture.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check extension/agent-main.js extension/agent-main.test.mjs scripts/stability-measure.test.mjs scripts/error-boundary-measure.test.mjs scripts/error-boundary-capture.test.mjs apps/angular-ai-devtools/src/app/companion.spec.ts apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts research/raw/m043-stability.json && npm run check
```

## Held-out

None; E1 to E11 are T002's, T003's and T004's and this task must not redden them.

## Log

- pending
- 2026-11-09 — build — the reach is measured, not assumed: the agent's own five-step walk (ng.getInjector, ɵgetInjectorResolutionPath, ɵgetInjectorProviders, the record whose token.name is ApplicationRef, injector.get(token)) resolves the token on a subject whose records carry it and answers reachedBy null + no-stability-observable on one whose records do not — never unstable, since nothing was read.
- 2026-11-09 — build — one subscription through isStable stays current across a later add()/remove() flip (installed 22.2.2 PendingTasksInternal, driven here: true at subscribe, false across two adds, true again after the last remove, twice over), so the agent subscribes once at attach; /resource-states is unstable for its lifetime (neverSettles at resource-states.ts:61, loader at :69, pending task added at _resource-chunk.mjs:404 and removed only in the load effect's finally at :463), and no inspected subject produced an unstable-to-stable change, so the ruling is transitionProducible: false on a page with answer no-transition-observed — SC2's positive half is not claimed and would need a drive that ends the last pending task after attach.
- 2026-11-09 — build — the record carries it: a stability section ({reachedBy, absence, attachAt, reading, settle, version, coreVersion}) sits after boundary and before checks in both the frame record and the initial snapshot, armed at start():1865 and :1870 and removed by reset():1896; the profiler is installed once and ɵsetProfiler(null) is never called; repeats re-derived from the frame's own events (a second TemplateUpdate pair in one checks row: [2,3,2,3], and a second ChangeDetection pair carrying componentName null, four such entries).
- 2026-11-09 — build — anchors held: var prevEpochs at 42, onEvent at 573-614, prevEpochs.set(instance, next) at 1034, closeCycle at 1038, the router reach at 1750-1839 and prevEpochs = new WeakMap() at 1889 are unmoved (each insertion paid for by merging a two-line comment); installRouterEvents (1845 to 1844), uninstallRouterEvents (1854 to 1852) and start (1864 to 1862) moved and are declared in the recording's record.anchors.moved.
- 2026-11-09 — build — re-cuts, each with the failing assertion quoted: extension/agent-main.test.mjs's two record-key assertions failed with + 'stability' present in actual and now list it after 'boundary'; scripts/error-boundary-measure.test.mjs failed with .project/research/s10-answer.md is missing (the note archived to .project/archive/042-error-boundary/research/) and now resolves the moved document while keeping the citations the m042 recording quotes; scripts/error-boundary-capture.test.mjs read the live intent, which this milestone rebound to the stability criteria, and now reads M042's own intent from .project/archive/042-error-boundary/intent/INTENT.md.
- 2026-11-09 — build — Verify pass at ef2cc27f4c60e2bc21e659881d7a124deb502222: the task's Verify line ran verbatim to exit 0 — node --check x3 clean, 327 node tests pass / 0 fail across the twelve named suites (scripts/stability-measure.test.mjs among them, 14 tests), npx nx run angular-ai-devtools:test 31 files / 346 tests passed, prettier --check clean on the eight named files, npm run check clean (tsc, skill lint, panel/extension/companion checks, verification gate: pass, format:check clean). A default run of scripts/stability-measure.test.mjs writes nothing; two armed runs produced byte-identical research/raw/m043-stability.json (24647 bytes).
- 2026-11-09 — build — landing verdict: the declared 16 paths carry the work (6 changed, all declared), the Log is append-only above this line, the Verify line passed verbatim at ef2cc27f4c60e2bc21e659881d7a124deb502222 and no product path outside the declaration moved — ready
