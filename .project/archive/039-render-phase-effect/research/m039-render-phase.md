# M039 T001 — the profiler events, the NG0100 message and the effect's edges

Measured 2026-11-08 at `b114e5f` (`gsd-path/M039`), build/active. Recording:
`research/raw/m039-render-phase.json`. Suite: `scripts/render-phase-measure.test.mjs` (28 tests, 28 pass, read-only:
no build, no browser, no write).

## Question

M039 rests on three premises it inherited rather than took: that Angular's `ProfilerEvent` enum declares no effect
event, that the error digest carries one `NG0100` entry, and that the graph's effect node has an empty label and a
single edge. This takes all three again at this head and records what it finds, because SC2 is a cannot-tell
criterion and a cannot-tell nobody measured is a guess in the other direction.

Three questions were also left open by the intent:

| # | Question | Verdict |
|---|---|---|
| 1 | Does the signal graph label an effect on the fixture or the portal, or is the label empty for every effect node? | **answered** — the fixture's effect labels are empty; the portal labels exactly one effect, `Resource.loadEffect` |
| 2 | What does the NG0100 message the portal emits name — a binding, a component, an effect, or nothing? | **unresolved** — no page emitted an NG0100, so nothing was named |
| 3 | Does `ɵgetSignalGraph` carry a node of kind `afterRenderEffectPhase` on a page that uses `afterRenderEffect`, and does any node carry a phase field? | **answered** — declared by `ReactiveNodeKind`, observed nowhere; no node carries a phase field |

**Verdict: `answered`.** The measurement ran and every claim in the recording is re-derivable; question 2 is recorded
as `unresolved` for the measured reason that no target produced the message, not for want of an attempt.

## Commands

```bash
node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter --json
node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target portal --json
node .commandcode/skills/control-ai-browsers/scripts/control.mjs up chrome-beta-gemma4 --json
node .commandcode/skills/control-ai-browsers/scripts/control.mjs run chrome-beta-gemma4 <probe>
node --experimental-strip-types --test "scripts/render-phase-measure.test.mjs"
```

Instance `chrome-beta-gemma4` (CDP 9334), Chrome 158.0.8127.18, was stopped before the run (`instances` reported all
five stopped). Counter fixture on `:4222`, portal on `:4507` (api `:3000`). Both `down`, then `check-teardown` (see
Teardown).

## 1. The profiler's event vocabulary: 26 values, no effect event

Read from the shipped chunk of each install by one reader (`var ProfilerEvent;` → the IIFE block → every
`ProfilerEvent[ProfilerEvent["Name"] = N] = "Name";` assignment), not from a quoted list:

| Package | Manifest | Version | Chunk | Values |
|---|---|---|---|---|
| panel | `node_modules/@angular/core/package.json` | 22.1.8 | `fesm2022/_debug_node-chunk.mjs` | 26 |
| fixture | `spikes/ng222-app/node_modules/@angular/core/package.json` | 22.2.2 | `fesm2022/_debug_node-chunk.mjs` | 26 |

```
0=TemplateCreateStart 1=TemplateCreateEnd 2=TemplateUpdateStart 3=TemplateUpdateEnd
4=LifecycleHookStart 5=LifecycleHookEnd 6=OutputStart 7=OutputEnd
8=BootstrapApplicationStart 9=BootstrapApplicationEnd 10=BootstrapComponentStart 11=BootstrapComponentEnd
12=ChangeDetectionStart 13=ChangeDetectionEnd 14=ChangeDetectionSyncStart 15=ChangeDetectionSyncEnd
16=AfterRenderHooksStart 17=AfterRenderHooksEnd 18=ComponentStart 19=ComponentEnd
20=DeferBlockStateStart 21=DeferBlockStateEnd 22=DynamicComponentStart 23=DynamicComponentEnd
24=HostBindingsUpdateStart 25=HostBindingsUpdateEnd
```

The two lists are identical, the numbers are contiguous, and **no value name contains `effect`** — zero matches for
`/effect/i` over either list. The effect-shaped name in both packages is `afterRenderEffectPhase`, and it is a
`ReactiveNodeKind`, not a `ProfilerEvent`:

```
type ReactiveNodeKind = 'signal' | 'computed' | 'effect' | 'template' | 'linkedSignal'
                      | 'afterRenderEffectPhase' | 'childSignalProp' | 'unknown'
  (node_modules/@angular/core/types/_formatter-chunk.d.ts, identical in the fixture's copy)
```

The page agent hard-codes four of the 26 and drops the rest: `extension/agent-main.js:21-26` declares
`TemplateUpdateStart` 2, `TemplateUpdateEnd` 3, `OutputStart` 6, `OutputEnd` 7 — all four numbers checked against the
installed enum — and `onEvent` (`:562-602`) compares against exactly those four. The suite re-derives the literal, the
line citations and the number-vs-name agreement on every run.

So SC2's premise **survived**: the page has no event that reports an effect, and the render-phase hooks the enum does
carry (`AfterRenderHooksStart` 16, `AfterRenderHooksEnd` 17, `ChangeDetectionStart` 12, `ChangeDetectionEnd` 13) reach
no panel surface today.

## 2. The effect's edges

`DebugSignalGraphEdge` is `{ consumer: number; producer: number }` (`types/core.d.ts`, identical in both installs):
two indices into `nodes`, and nothing else. **A write is not representable as an edge** — the pair names a direction of
dependency (producer feeds consumer), with no field, no value and no moment. N1's prohibition follows from the type,
not from a convention.

The one recording that already held an effect (`research/raw/effect-writes.json`, probe 2026-10-12, Angular 22.2.2,
`app-counter`) reports `kind: "effect"`, `label: ""`, `hasDebuggableFn: true` and the single edge
`effect: -> signal:count`. It holds no `epoch`: the probe copied no epoch field, so the recording cannot state one.

A fresh read of the same page at this head (Chrome 158.0.8127.18, `http://localhost:4222/`,
`ng.ɵgetSignalGraph(ng.getInjector(document.querySelector('app-counter')))`):

| | Recording (2026-10-12) | Fresh read (2026-11-08) |
|---|---|---|
| kind | `effect` | `effect` |
| label | `""` | `""` |
| epoch | not recorded | `1` |
| id | not recorded | `"6"` |
| node index | not recorded | `5` |
| edges | `effect: -> signal:count` | consumer 5 ← producer 2 |
| signal it reads | `count` | `count` |

Four fixture pages carry an effect, and the read shows more than the recording did:

| Route | Element | Effect node | Label | Epoch | Producers |
|---|---|---|---|---|---|
| `/` | `app-counter` | 5 | `""` | 1 | `signal:count` (1) |
| `/stale-view` | `app-stale-view-fixture` | 0 | `""` | 1 | none (0) |
| `/stale-view-deferred` | `app-stale-view-deferred-fixture` | 0 | `""` | 1 | `signal:trigger` (1) |
| `/field-form` | `app-field-form-page` | 100 | `""` | 1 | 3 `linkedSignal`s, all unlabelled |

`/stale-view` is worth naming for E3: an effect whose edges name no producer exists on the fixture today.

The portal answers open question 1 in the other direction. Eight routes, 1421 node occurrences, 163 effect node
occurrences, and the label set is `["", "Resource.loadEffect"]`: every portal effect is unlabelled except one, on each
list page (`/contract/list`, `/claim/list`, `/customer/list`), where `ng-journal-list`'s effect is labelled
`Resource.loadEffect` and its producer is the `linkedSignal` labelled `Resource.extRequest`.

So the intent's risk — "the effect's label may be empty everywhere" — **moved**: it is empty on the fixture and
everywhere on the portal but one framework-labelled effect. SC1's subject still reduces to the recorded edge for every
effect the fixture exposes.

## 3. The phase: declared, not observed

| | Fixture (`/`, `/stale-view`, `/stale-view-deferred`, `/linked-state`, `/field-form`) | Portal (8 routes) |
|---|---|---|
| nodes read | 115 | 1421 (occurrences) |
| nodes of kind `afterRenderEffectPhase` | 0 | 0 |
| nodes carrying a `phase` field | 0 | 0 |
| fields any node carries | `debuggableFn, epoch, id, kind, label, value, watched` | the same seven |

Neither target calls `afterRenderEffect` — zero occurrences under `spikes/ng222-app/src` (re-derived by the suite on
every run) and zero across the portal checkout's `apps/` and `libs/` — so no page this run could read was able to
produce such a node. That is the whole of the claim: the kind is **declared by `ReactiveNodeKind` and observed
nowhere**, and a node kind says nothing about when an effect ran. The verdict is derived, not stated: declared and not
seen ⇒ `declared-not-observed`.

## 4. The live NG0100 attempt: negative, with a substitute named as one

Two attempts, both in development mode (`window.ng` answers; the page logs "Angular is running in development mode."),
both driven through `control.mjs run chrome-beta-gemma4` with a probe that listens to `page.on('console')` and
`page.on('pageerror')`:

| Target | Routes | Clicks | Console messages | Console errors | Page errors | NG0100 | ExpressionChanged |
|---|---|---|---|---|---|---|---|
| counter fixture `:4222` (Angular 22.2.2, zoneless) | 17 | 66 | 117 | 7 | 0 | **0** | **0** |
| Insurance Portal `:4507` (Angular 22.2.2, zoneless) | 9 | 0 (no `<button>` on any route) | — | 36 | 8 | **0** | **0** |

Routes driven on the fixture: `/`, `/stale-view`, `/stale-view-deferred`, `/after-render`, `/components`,
`/field-form`, `/linked-state`, `/onpush-ready`, `/resource-states`, `/image-budget`, `/trust-bypass`,
`/lint-observability`, `/router-lint`, `/legacy-module`, `/landing`, `/gated`, `/redirect`. Every button on each page
was clicked up to three times — on the fixture that is the counter's Increment, which moves the `count` signal the
graph's effect names as its producer, so the effect was repeatedly re-read rather than left idle. Routes driven on the
portal: `/`, `/home`, `/contract`, `/claim`, `/complaint`, `/customer`, `/contract/list`, `/claim/list`,
`/customer/list`.

The sweep did produce other codes, recorded so that "no NG0100" is not confused with "no console output": `NG0950`
(a required input with no value yet, `/lint-observability`), `NG02952` (the `NgOptimizedImage` `sizes` warning the
fixture authors, `/image-budget`), `NG04002` (a click that navigates a route the fixture does not declare, from
`/router-lint`), and `NG0913` (an image-dimension warning the portal itself renders). None of them is an NG0100 and
none is recorded as one.

**No message was captured. It was not fabricated and the error was not manufactured by changing product code.** The
honest substitute is the digest's single `NG0100` entry, and it is recorded as a substitute:

| Field | Value |
|---|---|
| Source | `extension/error-digest.json`, digest version `22.2.x`, 64 entries |
| Entry | index 0, `code: "NG0100"`, title `Expression Changed After Checked` |
| Entries whose code is `NG0100` | **1** |
| Occurrences of `NG0100` in the digest text | **3** — the other two belong to `NG01002` (Missing Control Value), whose code and body both carry the prefix |
| Body | the digest's own words: "Angular throws an ExpressionChangedAfterItHasBeenCheckedError when an expression value has been changed after change detection has completed. Angular only throws this error in development mode. …" (the digest truncates the body) |
| Kind | `digest-entry`, `notACapture: true` |

The recording's `changeDetection.result` is `negative` with an empty `messages` array, and the suite reddens if a
`captured` result ever arrives with no message behind it, or if the substitute loses its `notACapture` marker.

## 5. What the record does not settle

- Which phase an effect ran in. No profiler event reports an effect, so no page read can place one in a phase.
- Whether a node of kind `afterRenderEffectPhase` exists on a page that uses `afterRenderEffect`. Neither target calls
  `afterRenderEffect`, so the kind stays declared and unobserved here; this record says only that.
- Whether a value was written by an effect. An edge is a producer/consumer index pair and the record carries no write,
  no owner and no cause: the write expression the 2026-10-12 probe recording carried appears nowhere in
  `research/raw/m039-render-phase.json`, and the suite fails if it ever does.
- What an NG0100 message names on either target. No target produced one, so nothing was named and nothing is claimed.
- What an empty effect label, or `Resource.loadEffect`, is derived from. The label is recorded as the graph reports it
  and nothing about its construction is claimed.

## 6. The intent's premises, at this head

| Premise | Status |
|---|---|
| "the `ProfilerEvent` enum declares 26 values in both 22.1.8 and 22.2.2 and none is an effect event" | **survived** — re-derived, identical lists, zero effect names |
| "the agent acts on four of them and drops the rest" | **survived** — the literal and the `onEvent` comparisons are re-read on every run |
| "the digest carries one `NG0100` entry" | **survived** — one entry by code, three occurrences by substring, the other two inside `NG01002` |
| "the one recording with an effect shows an empty label and a single edge" | **survived** — and the fresh read adds epoch 1, id `"6"`, node 5, producer `signal:count` |
| "`DebugSignalGraphEdge` is a producer/consumer index pair, so there is no write edge" | **survived** — two members, none write-named |
| "`afterRenderEffectPhase` is declared, not observed" | **survived** — 0 nodes of that kind over 115 fixture nodes and 1421 portal node occurrences |
| "the effect's label may be empty everywhere" | **moved** — empty on the fixture; the portal labels one effect `Resource.loadEffect` |
| "the page records no effect event, so the phase is cannot-tell" | **could not be remeasured as a positive** — the absence is the measurement, and it is unchanged |

## Teardown

`up` was run for `chrome-beta-gemma4`, the counter fixture and the portal; nothing else used the instance beforehand
(`instances` reported all five stopped). Each was closed with `down` and proved with
`check-teardown.mjs <info.json> --artifact <run json>` for the browser and `--no-artifact` for the two dev servers;
the receipt is in the T001 Log.
