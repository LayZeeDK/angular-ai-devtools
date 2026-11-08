# Instrumentation-free coverage: how much of this project needs the app to change

The owner's question: an application that **already runs in Angular development mode** and **ships a
sourcemap build** — which of the opt-in requirements this project places on it can be removed
entirely, so nobody instruments their code?

Read-only analysis. Every cell cites a `path:line` from a file opened for this document. Claims that
rest on Angular's own behaviour rather than on this repository's code are marked **inferred** and the
measurement that would settle them is named (§6).

---

## 0. The rule applied, and one disagreement stated up front

### 0.1 Vocabulary, used exactly

- **opt-in provider** — an Angular provider, interceptor, overlay or zone arrangement the app installs
  for us.
- **opt-in primitive** — an Angular AI DevTools runtime symbol the app imports and places in its own
  tree: one of our directives, components, services or resources.
- Angular `ɵ`-prefixed internals are **not** an opt-in cost. They get their own `uses-ɵ` table (§1b) and
  are never counted as instrumentation.

### 0.2 What counts as a requirement, per row

A requirement is counted only when the *inspected application* must do something. Three things the
page happens to be are **premises**, not requirements, because the owner's premise grants two of them
and the third is free by the `ɵ` rule:

| Premise | Why it is not a requirement | Evidence |
| --- | --- | --- |
| development build (`window.ng` present) | granted by the owner's premise; also the only way `ɵsetProfiler` is reachable | `extension/agent-main.js:4-7`, `:526-532` |
| Angular ≥ 22.1.3 | a version floor, not an install | `extension/agent-main.js:511-518` |
| `ɵsetProfiler`, `ɵgetSignalGraph`, `ɵgetInjector*`, `ɵcmp` present | free by the brief's `ɵ` rule | `extension/agent-main.js:72-104`, `:822-849` |

### 0.3 Path legend

Full paths appear on first use; afterwards one alias keeps the tables narrow:

- `app/` = `apps/angular-ai-devtools/src/app/`
- `packages/ai-devtools-companion/src/` = `packages/ai-devtools-companion/src/`
- `plans/…backlog.md` = `plans/angular-ai-devtools-program-backlog.md`
- `extension/` and `src/main-world/` are written in full: the two trees hold same-named twins
  (`extension/stale-view-worker.js` beside `src/main-world/stale-view-scan.ts`), and shortening either
  would make a citation ambiguous.

### 0.4 The verdict rule, stated so it can be checked against every row

- **`instrumentation-free`** — no opt-in provider and no opt-in primitive is required for the feature's
  own read. Whatever it still needs is an `ɵ` read, a browser artefact (console output, DOM, the JS
  heap), or a runtime value produced by the app simply running. A live runtime value is *not*
  instrumentation; it is named in §4 as what no static artefact can supply.
- **`reduced-instrumentation`** — a named opt-in requirement drops under a concrete substitution and a
  named one remains.
- **`still-instrumented`** — the opt-in is what produces the fact, so removing it removes the feature.

### 0.5 The disagreement with the concurrent matrix, stated rather than buried

`capability-dependency-matrix.md` scores the zoneless arrangement as `provider: required` in nine rows
(`.project/research/capability-dependency-matrix.md:74-84`). This document scores it as a
**precondition on the inspected app**, in the same class as dev mode, and therefore not an opt-in cost:

- Nothing is *installed for us*. The agent measures the arrangement and refuses when it finds a real
  `ZoneNgZone` — `extension/agent-main.js:546-553`, with the measurement taken by
  `injector.get('NgZone').constructor.name` at `:137-157`. A zoneless app did nothing *for us*; it is
  simply an app that is not zoneful.
- The gate is one predicate with one reason sentence, not nine features' own requirement
  (`extension/agent-main.js:547-551`).

That classification decides how nine rows read, so it must not be silent. It is `undetermined` in the
sense that matters — whether the zoneful case would work if the sentence were removed — and §6 U5 names
the measurement. Until that measurement exists, a reader should treat "zone gate remains" as a note on
**every** row reached through the `angular-ai:state` / `angular-ai:record` channel, not only nine.

---

## 1. Per-feature coverage

`requires today` names only opt-in providers and opt-in primitives. Each row's third and fourth cells
carry a sentence beginning `Premise:` for the `ɵ` reads and runtime values it leans on — those are never
counted as requirements. The third column says what a dev-mode page plus its sourcemap plus browser
artefacts would still give, and where the substitution stops.

| feature | requires today (provider/primitive, named) | with dev-mode + sourcemaps | verdict | evidence (path:line) |
| --- | --- | --- | --- | --- |
| **lint-core** | **none.** The capture is our own `console.error` tap, installed unconditionally when the MAIN-world script loads — `extension/manifest.json:29-38` loads it at `document_idle` even though the code's own comment says document_start (`extension/agent-main.js:1510-1511`). No app symbol is imported | Nothing needed. The join cuts every stack frame before reading anything, so a map has no position to answer: `bodyOf` slices at the first frame and the construct is `Input "<name>"` inside the body. Premise: a console message exists because Angular threw | `instrumentation-free` | tap `extension/agent-main.js:1550-1560`; frame cut `extension/lint-core.js:100,124`; named input `extension/lint-core.js:104`; dev-build capture `extension/lint-core.js:6` |
| **lint-router** | **none.** Reads captured messages plus a route list it is handed | Nothing needed; frames cut, finding is the unmatched URL segment (`extension/router-diagnostic.js:52-53`). Premise: a navigation happened | `instrumentation-free` | `extension/router-diagnostic.js:66,51-53`; panel states `apps/angular-ai-devtools/src/app/panel-router.ts:10,116` |
| **lint-legacy** | **none.** The fact (`{name, standalone}`) is read by the caller from `ɵcmp.standalone` | Nothing needed. The boolean is a `ɵ` metadata read; the modern form is copied from a cited table (`extension/legacy-structure.js:65,109-124`). A map is not involved and is not needed | `instrumentation-free` | `extension/legacy-structure.js:25-27,91,149`; panel renders no hook `app/panel-legacy.ts:11,55` |
| **field-state** | **none.** A pure read of a fact object handed in; no form is read here | Nothing needed to *remove* a requirement — there is none. Premise: validity, per-field error kinds and submit state are live object state (`extension/field-state.js:46-118`) | `instrumentation-free` | `extension/field-state.js:7,46,78-101`; panel `app/panel-fields.ts:9,76` |
| **di-doctor** | **none.** `ng.getInjector` / `ɵ.getInjectorFromNode` plus `ɵgetInjectorResolutionPath`, `ɵgetInjectorMetadata`, `ɵgetInjectorProviders` on the live injector | Nothing needed. Premise: *which* injector answered and its provider records exist only in the running injector. A map cannot say which injector resolved a token | `instrumentation-free` | `extension/agent-main.js:1104-1152`; listener registered outside the install gate `:1496-1507`; no caller for `queryDi` `app/di-doctor.service.ts:31-42` |
| **error-explainer** | **none.** Hooks (`console.error`, `error`, `unhandledrejection`) are ours, installed when the MAIN-world script loads (`extension/manifest.json:29-38`); the digest is static; attribution uses `ng.getOwningComponent` when present | Nothing needed. Premise: the throw happened. Map could supply a *source position* for a frame — a new finding, not this one | `instrumentation-free` | `extension/agent-main.js:1510-1580`; attribution `src/main-world/error-capture.ts:39-58`; digest `extension/error-digest.json:2` |
| **stale-view** | **none.** `ɵgetSignalGraph` through the host element's injector, then a worker regex over `debuggableFnSource` | A map can replace the *text* half: the worker's algorithm is a textual regex (`this.<field> =` / `.set(` / `.update(`), so original source from `sourcesContent` carries the same bytes. What remains is per-instance: `ng.isSignal(instance[field])` needs the live instance | `instrumentation-free` | `extension/agent-main.js:822-849`; `extension/stale-view-worker.js:14,59-62,109`; pure twin `src/main-world/stale-view-scan.ts:91,122,181` |
| **interop** | **none.** Classification is by node label and node text; edges come from the recorded graph | A map/AST can find `toSignal(` and `subject.error(` in original source, so the *classification* is statically substitutable. The producer/consumer edges are graph state and are not | `instrumentation-free` | `src/main-world/interop-keep-list.ts:14,34-41`; graph feed `app/interop.service.ts:7-20,315-330`; graphs from `extension/agent-main.js:1060-1069` |
| **redirect-chain** | **none.** Walks a route-config array it is handed and reads `path`, `redirectTo`, presence of `canActivate`, presence of `loadChildren` | Nothing needed to remove a requirement. The config is app runtime state, but it is reachable without the app changing: resolve `Router` from the root injector and read its `config` (`extension/agent-main.js:315-345` mechanism). Static substitution is conceivable but is AST over `sourcesContent`, `undetermined` at expression precision (§6 U7) | `instrumentation-free` | `extension/redirect-chain.js:8,17,46-48`; panel `app/panel-redirect.ts:25` |
| **sanitizer** | **none.** Warning from our console tap; records from our profiler subscription; bindings are an input the page "declares" | Nothing needed. Premise: the strip happened, at a page-clock instant, inside a profiler window. Static evidence can name `[innerHTML]` bindings and `bypassSecurityTrust*` calls in source, but a strip is an *occurrence*, not a source shape | `instrumentation-free` (with §4 caveat: the `deliberate` branch has no producer — §6 U6) | `extension/sanitizer-triage.js:4,37-43,181-200,201-220,352-360,373-410`; panel `app/panel-sanitizer.ts:47` |
| **signal-provenance** | **none.** Walks the recorded graph's nodes and edges | Nothing needed. Premise: the graph is a live snapshot; node kinds, labels and edges have no static counterpart | `instrumentation-free` | `src/main-world/provenance-tracer.ts:88-140`; consumer `app/signal-provenance.service.ts:74-90`; graph `extension/agent-main.js:822-849` |
| **after-render** | **none.** One `ɵsetProfiler` subscriber's event list, in emission order | Nothing needed. Premise: the ordinals exist because events fired. There is no generated position in a list index, so a map answers nothing | `instrumentation-free` | subscriber `extension/agent-main.js:555-570`; `extension/after-render.js:46,126-170`; panel `app/after-render.ts:34` |
| **linked-state** | **none.** Reads the recorded graph: node kind `linkedSignal`, the source producer of kind `signal`, both stored values | A map/AST can supply the *field names* (labels are a dev-build compile artefact copied from `debugName`); it cannot supply either stored value, and the finding *is* their equality | `instrumentation-free` | `extension/linked-state.js:4,93,221-256`; panel `app/panel-linked-state.ts:10,57` |
| **render-phase** | **none.** Reads `effect` node kind and `consumer` edges; publishes the phase as a named absence | Nothing needed, and one part is permanently out of reach: the phase is absent because Angular's profiler enum has no effect event. A map cannot add an enum member | `instrumentation-free` | `extension/render-phase.js:7-14,107,247-266,293-295`; panel `app/panel-render-phase.ts:10,48` |
| **performance-narrator** | **none.** Walks the frame's ordered work events and subtracts two of the page's own `performance.now()` receipt times | Nothing needed. Premise: both receipt times were measured while the app ran; identity is whatever instance the profiler passed. A map could name a component's template line — a *new* surface, not this duration | `instrumentation-free` | `extension/performance-narrator.js:195,257-300`; receipt clock `extension/agent-main.js:728-736`; panel `app/panel-performance.ts:58` |
| **companion / opt-in** *(added row: the only surface where the app installs anything of ours)* | **`provideAiDevTools()`** — an opt-in **provider**. It returns no provider records on purpose; its whole effect is one own string key on `globalThis`, written inside `isDevMode()` | **Nothing.** A bundle or map can show the *source* imports the package and calls it, which answers a different question ("the app's source mentions us") and cannot answer "this build's injector resolved these symbols by identity". The opt-in *is* the fact | `still-instrumented` | `packages/ai-devtools-companion/src/index.ts:25-29`; write `facade.ts:35-41`; identity table `vetted.ts:14,28-32`; probe `extension/agent-main.js:245-302`; resolved count `:352-396`; the one real install `spikes/ng222-app/src/app/app.config.dev.ts:3,10` |

### 1b. `uses-ɵ` per row — never counted as instrumentation

The brief keeps `ɵ` reads in their own column. They are here rather than in §1 so the five required
columns stay readable; **no row's verdict is affected by anything in this table.**

| feature | `uses-ɵ` | which reads, and where |
| --- | --- | --- |
| lint-core | `no` | nothing — the join reads message text and a digest code list (`extension/lint-core.js:95-104`) |
| lint-router | `no` | `NG_CODE` regex only (`extension/router-diagnostic.js:51`) |
| lint-legacy | `required` | `ɵcmp.standalone`, read by the caller and passed in as a boolean (`extension/legacy-structure.js:25-27,91`) |
| field-state | `no` | none (`extension/field-state.js:7,46`) |
| di-doctor | `required` | `ɵ.getInjectorFromNode` alias, `ɵgetInjectorResolutionPath`, `ɵgetInjectorMetadata`, `ɵgetInjectorProviders` (`extension/agent-main.js:1104-1152`) |
| error-explainer | `optional` | `ɵgetOwningComponent` alias when the unprefixed name is absent (`src/main-world/error-capture.ts:39-58`); `__ngContext__` as a presence test in the pick path (`extension/agent-main.js:1264-1269`) |
| stale-view | `required` | `ɵgetHostElement`, `ɵgetInjectorFromNode`, `ɵgetSignalGraph` (`extension/agent-main.js:822-849`) |
| interop | `required` | `ɵgetSignalGraph` — through the recorded graph it classifies (`extension/agent-main.js:1060-1069`) |
| redirect-chain | `no` | reads a handed array only (`extension/redirect-chain.js:8,17`) |
| sanitizer | `required` | `ɵsetProfiler` — the records the warning is joined to (`extension/agent-main.js:520-532,555-570`) |
| signal-provenance | `required` | `ɵgetSignalGraph` — the graph it walks (`src/main-world/provenance-tracer.ts:88-140`) |
| after-render | `required` | `ɵsetProfiler` — the event list it orders (`extension/after-render.js:126-170`) |
| linked-state | `required` | `ɵgetSignalGraph` — node kinds and both values (`extension/linked-state.js:93,221-256`) |
| render-phase | `required` | `ɵgetSignalGraph` — effect nodes and edges (`extension/render-phase.js:247-266`) |
| performance-narrator | `required` | `ɵsetProfiler` — the frame it narrates (`extension/performance-narrator.js:257-300`) |
| companion / opt-in | `required` | `ɵgetInjectorProviders`, `ɵgetInjectorResolutionPath` for the resolved count (`extension/agent-main.js:352-396`) |

### Counts

| verdict | rows |
| --- | --- |
| `instrumentation-free` | **15** |
| `reduced-instrumentation` | **0** |
| `still-instrumented` | **1** |
| **total** | **16** |

No row is `reduced-instrumentation` because no row has an opt-in to drop: **there is exactly one opt-in
provider in the repository and zero opt-in primitives** (§3). `reduced-instrumentation` is the right
reading for the *non-opt-in* app-side requirements in §3.2, and that is where §5's migration order
comes from.

---

## 2. What "zero primitives" is based on

Not an omission — a measurement of the whole tree:

- `packages/ai-devtools-companion/src` contains three files; a search for `@Directive`, `@Component`,
  `@Injectable`, `InjectionToken` or a `signal(` in `packages/**/*.ts` returns **no matches**. The
  package exports one function and two data exports (`packages/ai-devtools-companion/src/index.ts:14-16`).
- The only import of the package anywhere in this repository is the fixture's dev config
  (`spikes/ng222-app/src/app/app.config.dev.ts:3`) — an app installing our **provider**, not a symbol
  into its tree.
- The provider returns `[]` on purpose, so it adds no DI record to the app at all
  (`packages/ai-devtools-companion/src/index.ts:29`, and the doc comment at `:19-24`).
- Consequently the companion surface's "resolved" count is an *identity comparison* against records
  the app's own Angular already created (`extension/agent-main.js:352-396`); we never ask the app to
  create one for us.

The library's own taste ruling agrees and forbids the alternative: "opt-in runtime instrumentation is
allowed only via providers (e.g. `provideAiDevTools()`), never via dev-server instrumentation"
(`.commandcode/taste/design/taste.md:19`).

---

## 3. Requirement-level table

### 3.1 Every opt-in provider and primitive currently required anywhere

| id | requirement | where it is required | the substitution that would remove it | can it be removed? |
| --- | --- | --- | --- | --- |
| **P1** | `provideAiDevTools()`, installed in the app's bootstrap | `packages/ai-devtools-companion/src/index.ts:25-29`; installed at `spikes/ng222-app/src/app/app.config.dev.ts:10`; probed at `extension/agent-main.js:245-302` | **None that keeps the fact.** A map's `sourcesContent` could show `import { provideAiDevTools }` and a call site, and a bundle could show the minified call; both answer "the source mentions the package", never "this build's injector resolved `Meta`/`Router` by identity" (the comparison at `:387`) nor "the page published an entry this panel accepts" (`:299-301`) | **no — the opt-in is the subject.** This is the one legitimate opt-in in the project and it should not be removed |
| **P2** | the **zone arrangement**: no real `ZoneNgZone` (`zoneMode !== 'zone'`) | `extension/agent-main.js:109-160`, `:546-553`; measured on the portal as four features refusing with one sentence (`AGENTS.md:212-216`; `.project/research/m040-performance-narrator.md:211-215`) | Not a substitution problem. It is a predicate on the app's change detection; the only way it stops being a requirement is **removing our own refusal** — a technical change on our side, provable by measurement (§6 U5). A sourcemap observes no change detection | **no, not by any static artefact**; possibly yes by relaxing the refusal, `undetermined` |
| **PR** | **opt-in primitive: none exists** | `packages/**/*.ts` has no decorated symbol; no app imports one | — | **nothing to remove.** This is the strongest form of the owner's ideal and it is already true |
| **P3** *(negative requirement)* | the app must not be a **production** build | `extension/agent-main.js:526-532,539-545`; `packages/ai-devtools-companion/src/index.ts:26` | none | granted by the premise; not an opt-in |

### 3.2 App-side requirements that are **not** opt-ins, and the substitution for each

These are requirements this project places on the inspected app all the same, and §5's migration order
is drawn from them. They cost the app **no import and no provider**.

| id | requirement (implicit) | mechanism it blocks | substitution | evidence |
| --- | --- | --- | --- | --- |
| **R1** | the app's root element is named **`app-root`** | the root injector, so `zoneMode`, the companion's resolved count, and any injector-based read | **drop the name**: try `getInjector` on candidate roots (the `angular-ai:picked` element's nearest host, `document.body`, `document.documentElement`) or enumerate `ɵ`-annotated elements. The fallback already exists and is partial | `extension/agent-main.js:121-131` (zone), `:326-341` (companion), `:1085-1103` (DI) |
| **R2** | a component is findable by a **CSS selector built from its class name** (`querySelector(componentName)`) | the DI query's element | **drop the name**: the picker already carries the picked element itself across the world boundary by DOM node (`:1503-1507`, `:1383-1393`), so a DI query can be issued from a real node instead of a guessed selector | `extension/agent-main.js:1091-1103` vs `:1503-1507` |
| **R3** | someone hands the join a live object: a form state, a route config, a binding list | `field-state`, `redirect-chain`, `sanitizer`'s `deliberate` branch | **resolve it from `window.ng`'s injector** instead of asking for it: `getInjector(rootElement).get(Router)` gives `Router.config`; `get(NgForm)`/`get(NgModel)` gives the form; the app installs nothing. Caveat with its own citation: the code deliberately refuses `injector.get` for the *companion's vetted identity tokens* because a lookup would instantiate someone else's class (`:312-314`) — that caution is about identity tokens, not about tokens the app already instantiated | `extension/agent-main.js:315-345`; `app/page-reads.ts:14-20` (no transport at all today) |
| **R4** | Angular ≥ 22.1.3 | everything reached through the record | none; a version floor | `extension/agent-main.js:511-518` |
| **R5** | dev mode (`window.ng`) | everything reached through the record | none; the premise | `extension/agent-main.js:526-545` |

**The finding this table produces.** Of the two things that could ever look like instrumentation, one
(P1) is the subject of its own surface and the other (P2) is a refusal we wrote; and every "hand us the
live object" requirement (R3) is already substitutable by resolving the object from the page's own
injector through a dev-mode API. **No feature of this project needs an app-side provider in order to
hand us a live object.** The only scenario that would justify one — an app-implemented service we must
call — does not exist anywhere in the repository.

---

## 4. The honest residue

Per row that is not trivially free, stated as *the artefact the bundle does not contain*. Where the
fact is produced by app code executing, that is said plainly: **sourcemaps cannot supply it.**

**lint-core.** Missing artefact: *the thrown error*. `NG0950` exists because a required input was
unbound at runtime and Angular threw (`extension/lint-core.js:6-14`). A map supplies the *declaration*
`@Input() requiredLabel` in `sourcesContent`, and an AST over it could produce "this input is declared
and never bound" — which is a **different finding**, available without the app changing anything, not a
substitute for this one. Note the compile-time sibling is unreachable by any route: the digest does not
carry `NG8008`, and the dev server serves no page for it (`extension/lint-core.js:24-32`).

**lint-router.** Missing artefact: *the navigation*. `NG04002` exists because a URL was requested that
no route matched; the message and its segment are produced by the router executing. Unchanged by
sourcemaps; a static route index could find a dead `routerLink` in a template instead — again a
different finding, and one that needs template mapping at expression precision, which §6 U2 leaves open.

**field-state.** Missing artefact: *the form's live state* — `valid`, `invalid`, each field's `errors`
kinds, and the submit element's `disabled` reading (`extension/field-state.js:46-118`). A map supplies
the field names and the template's `[disabled]` expression text. It cannot supply validity, and the
pane's own rule forbids deriving one from the other (`app/panel-fields.ts:9-25`, `:70-80`). No app
instrumentation exists to remove; the gap is that **nothing produces this fact today**
(`app/page-reads.ts:14-20`).

**di-doctor.** Missing artefact: *the resolution path* — which injector instance answered, and what
providers it holds (`extension/agent-main.js:1119-1238`). A live injector walk has no static
counterpart; a static index could list *declared* providers and find ones no injector can show (the
backlog names exactly that as a new capability, `plans/angular-ai-devtools-program-backlog.md:424-426`),
never the resolution path. Also measured: the surface rendered **zero rows** on the portal
(`AGENTS.md:213-216`), and `queryDi` has no caller in the panel app (`app/di-doctor.service.ts:31-42`)
— a wiring gap, not a gate.

**error-explainer.** Missing artefact: *the occurrence*. The code→digest join is already static
(`extension/error-digest.json:2`); the throw is not. Component attribution needs
`ng.getOwningComponent` on a live element (`src/main-world/error-capture.ts:39-58`;
used at `extension/agent-main.js:1522-1538`), and no map turns a DOM element into an instance. A map's
genuine contribution here is the *source position of the frame* — a new finding, and the one place
where a map is strictly better than what the surface has.

**stale-view.** Two halves, and only one moves. The *pattern* half is text: the worker regexes
`debuggableFnSource` for `this.<field> =` / `.set(` / `.update(` (`extension/stale-view-worker.js:14,59-62`),
so original source in `sourcesContent` carries equivalent bytes and an AST can find the same writes.
The *confirmation* half is live: `ng.isSignal(instance[field]) === false`
(`extension/stale-view-worker.js:141-152`; twin `src/main-world/stale-view-scan.ts:216-230`) and the node
kinds come from the graph. The artefact the bundle does not contain is **the binding between a source
write and the runtime field it writes** — a map gives a position in a file, never a property on an
instance. Note also that the finding needs the app to *contain* the pattern at all: the fixture carries
a dev-only route for it (`AGENTS.md:53-59`).

**interop.** Same split. Labels (`toSignal.source`, `toSignal.state`) and the `subject.error` token are
statically findable in `sourcesContent`; the producer/consumer edges that make the slice are graph state
(`src/main-world/interop-keep-list.ts:34-41`, `app/interop.service.ts:7-20,315-330`). Missing artefact:
*the edge set*.

**redirect-chain.** Missing artefact: *the route config object*. It is the result of the app calling
`provideRouter(routes)`, so the shape is in the source while the instance is at runtime. A map alone
gives no route semantics — `loadChildren` boundaries and guard presence still come from the config
(`extension/redirect-chain.js:46-48`). Static substitution is plausible via AST over `sourcesContent`
and is `undetermined` at expression precision (§6 U7).

**sanitizer.** Missing artefact: *the strip*. The sanitizer's only signal is a dev-mode `console.warn`
that names no tag, attribute or binding (`extension/sanitizer-triage.js:4-8`); the component comes from
whichever profiler record's template-update window covers that warning's clock reading
(`:181-200,201-220`). Static evidence can enumerate `[innerHTML]` bindings and `bypassSecurityTrust*`
calls, but "a strip happened at 1401 ms" is an event, and its *covering record* is a runtime window.
Separately, the `deliberate` state consumes a `bindings` declaration the page is said to carry
(`:37-43`) that **no code in this repository produces** — see §6 U6.

**signal-provenance.** Missing artefact: *the graph*. Node kinds, labels, and both directions of each
edge exist only in a live snapshot (`src/main-world/provenance-tracer.ts:88-140`). A map can name the
file a template lives in; it cannot say which signal feeds it.

**after-render.** Missing artefact: *the event list*. The finding is an ordering over ordinals in a
recorded list (`extension/after-render.js:126-170`). There is no generated position anywhere in it, so
a map has nothing to map. When the list carries no after-render event the surface says exactly that and
nothing more (`app/after-render.ts:34`).

**linked-state.** Missing artefact: *both stored values*. The labels are a development-build compile
artefact — the compiler rewrites `linkedSignal(...)` to pass the field name as `debugName`
(`extension/linked-state.js:4-16`) — so a static index could supply the *names*. The finding is the
equality of the two values the graph holds now (`:221-256`). No static artefact holds either value.

**render-phase.** Missing artefact: *an effect event in the profiler enum*. Angular's enum declares 26
values and none names an effect (`extension/render-phase.js:7-14`), which is why the phase is a
published absence (`:107,293-295`) rather than a comparison. A map cannot add an enum member; this one
is permanently out of reach for every artefact class. The reads themselves are edges (`:247-266`).

**performance-narrator.** Missing artefact: *two receipt times and an identity*. A duration is one
`performance.now()` reading minus another, both taken while the app ran
(`extension/performance-narrator.js:195`, clock at `extension/agent-main.js:728-736`); identity is
whatever instance the profiler passed, and for `ChangeDetection` the profiler passes none
(`extension/agent-main.js:616-640`). A map can name a component's template line — the backlog lists
that as a *new* surface (`plans/…backlog.md:424-426`) — and cannot supply a missing profiler argument.

**companion.** Missing artefact: *the running table*. The entry is one own string key on the page's
global, valid only when the version string is exactly `0.2202.0` and every symbol is a function the
page accepts (`extension/agent-main.js:245-301`; `:182-186`). A bundle check for the call would let the
panel say "the source installs it", which is precisely the degraded name-matching the vetted table was
built to escape (`packages/ai-devtools-companion/src/vetted.ts:1-10`).

---

## 5. Migration order

Ordered by evidence strength: cheapest and safest first, each proved by a named check. "Drop" means
*remove the requirement from the app*, which for rows R1–R3 means removing our own reliance, not asking
the app for anything.

1. **Drop R2 (class-name-as-selector) first.** Issue di-queries from the picked DOM node the picker
   already has, instead of `querySelector(componentName)`; prove it with one `angular-ai:di-query` on
   an element whose tag is not its class name (a `div` host or an attribute selector) returning a
   `resolutionPath`, cited as a run of `verify-ai-browsers` `checks/di-doctor.mjs`
   (`.commandcode/skills/verify-ai-browsers/checks/di-doctor.mjs:1-10`) with the descriptor's
   `elementTag` in the evidence JSON.
2. **Drop R1 (`app-root`) second.** Try the injector on candidate roots from the DOM, and prove it on
   one page whose root tag is not `app-root` by a state record whose `zoneMode` and
   `companion.resolved` are non-`unknown`/non-zero, i.e. the same `angular-ai:state` payload the
   `checks/state.mjs` claim already reads.
3. **Drop R3 for `redirect-chain` third.** Resolve `Router` from the root injector and read `config`,
   and prove it by a `walk()` answer over the live config on the portal's `/home` — the route the
   performance-narrator measurement already tried and named
   (`.project/research/m040-performance-narrator.md:207-215`).
4. **Then R3 for `field-state`,** resolving the form directive from the injector rather than being
   handed a fact; prove it with a two-field form whose root is invalid with no error kind, asserting
   the join still answers `root-invalid-without-error-kind` rather than a derived verdict
   (`extension/field-state.js:88-95`).
5. **Settle P2 (the zone gate) before any of it is called a win.** Run the record path on a zoneful dev
   page with the refusal disabled and compare cycle framing — this is the one item whose removal would
   change nine rows at once, and §6 U5 is the check.
6. **Never drop P1.** Its removal deletes the only surface whose fact is the opt-in; the honest
   alternative is to keep it and say so, which is what the panel already does with five named
   renderings (`app/companion.ts`).
7. **Do not add a primitive to feed the nine un-fed joins.** Every one of them is a page read *we* owe
   in the MAIN-world agent, not an app import: the port's own doc says the transport is missing, not
   the reader (`app/page-reads.ts:14-20`). A proposal that reaches for a directive or service in the
   app's tree should be refused on the strength of §2.

Ordering rationale: 1 and 2 are pure DOM substitutions with an existing fallback path; 3 and 4 add a
reader inside our own realm and need one new MAIN-world read each; 5 is a measurement whose answer may
be "no"; 6 and 7 are prohibitions.

---

## 6. Undetermined, and what would settle each

| # | question | why the code cannot settle it | the measurement that settles it |
| --- | --- | --- | --- |
| **U1** | Does the target's build ship a resolvable `.map` with `sourcesContent`? | Nothing in this repository reads a map: a search for `sourceMappingURL|sourcesContent|sourceMap` under `extension/`, `src/`, `apps/`, `packages/` finds only our own builds' `sourceMap: true` (`apps/angular-ai-devtools/project.json:48`) and no `fetch(`/`XMLHttpRequest` anywhere in `extension/*.js`. The premise is unmeasured here | one page load: read the `main-*.js` the page downloaded, look for the `sourceMappingURL` comment, fetch it, assert `version`, `mappings` and `sourcesContent` — the backlog's own Q4 item 1 (`plans/…backlog.md:414-415`) |
| **U2** | Does Angular's AOT output map **templates** at expression precision, or only at component granularity? | no map is read anywhere, so nothing could be observed | Q4 item 2 (`plans/…backlog.md:416`): map a known template expression's generated position and compare the returned original range |
| **U3** | Does the injector walk reach the root injector when the app's root tag is not `app-root`? | `extension/agent-main.js:326-341` prefers `app-root` and falls back to `body`/`documentElement`; whether `getInjector(body)` answers is Angular's behaviour, **inferred** here, not measured | one page with a custom root tag (or a portal build whose root selector differs) and one `angular-ai:state` read whose `zoneMode` is not `unknown` |
| **U4** | Does `querySelector(componentName)` ever resolve today? | the fallback at `extension/agent-main.js:1091-1103` is reached only when `elementTag` is absent, and `queryDi` has no caller in the panel (`app/di-doctor.service.ts:31-42`), so the path has never been driven in this build | one `angular-ai:di-query` carrying `componentName: 'AppCounter'` and no `elementTag`, on the counter fixture; a `resolutionPath` with `available: true` would settle it, an empty one proves the path dead |
| **U5** | Is the zoneless arrangement a real requirement, or our own refusal? | `extension/agent-main.js:546-553` refuses; nothing in the repository shows what the profiler does under a `ZoneNgZone` | a zoneful dev page with the refusal line disabled, then compare one recorded cycle's framing against the zoneless fixture's. This also settles the §0.5 disagreement with the matrix's `provider` column |
| **U6** | Does anything produce the `bindings` declaration `sanitizer-triage` consumes? | the join documents the shape (`extension/sanitizer-triage.js:37-43`) but no reader for it exists in `extension/` or `src/`, so the `deliberate` branch is unreachable in this build | grep the whole tree for a producer, then one capture attempt on a page with a `bypassSecurityTrust*` binding and a counter-binding that strips; a `deliberate` finding proves a producer, `none` proves there is none |
| **U7** | Can a static AST index over `sourcesContent` read a component's `standalone` flag and a route config at expression precision? | no parser is installed or invoked in this repository; the only trace of the call site is the fixture's own source (`spikes/ng222-app/src/app/app.config.dev.ts:3,10`), which is not the same artefact as a mapped original | Q4 item 3 (`plans/…backlog.md:417-418`): parse the fixture's original sources and diff the derived route table against `Router.config` read at runtime |
| **U8** | Would a *static* "the source installs `provideAiDevTools()`" answer be acceptable to the owner as the companion surface's verdict? | it is a product decision, not a code fact; the panel's four refusals are built to avoid name-matching (`app/companion.ts:1-30`) | one owner ruling; until then the surface stays `still-instrumented` |

Two things I could **not** determine and did not guess:

- Whether the portal checkout (outside this repository) installs `provideAiDevTools()`. The repository's
  only installation is the fixture (`spikes/ng222-app/src/app/app.config.dev.ts:10`); the portal's
  `package.json` is not in this tree, so any claim about it would be invented.
- Whether `ngDevMode` is ever read by our code. A search under `extension/`, `src/`, `apps/` finds the
  identifier only in a doc comment (`app/feature-fingerprint.ts:17`); the agent's dev-mode test is
  the presence of `ɵsetProfiler` / `ɵgetSignalGraph` (`extension/agent-main.js:520-545`), whose reason
  strings name a production build as a *possibility*, never an assertion (`:529,542`).

---

## 7. The answer, in one paragraph

**Fifteen of sixteen rows place no opt-in requirement on the app at all** — the app imports nothing of
ours, provides nothing of ours and places nothing of ours in its tree; the whole of what they read is
`window.ng`, `ɵ` internals, and the console, DOM and profiler stream a development build already emits.
The single opt-in is `provideAiDevTools()`, and it is not a hand-off of live state — it *is* the fact
the companion surface reports, so removing it removes the surface. Sourcemaps change none of this: they
would not lift a provider (there is only one, and it is the subject), they cannot lift the zone refusal
(a predicate on change detection, not a source position), and they cannot supply any of the runtime
artefacts §4 names — a throw, a navigation, a form's validity, a resolution path, a strip event, a
stored signal value, a receipt time. What sourcemaps *would* buy is a set of **new** findings with no
gate class at all — a template line for a rendered node, a binding that caused a check — which is the
same asymmetry the backlog already identified (`plans/…backlog.md:407-410`). The remaining
app-shaped requirements are ours to remove: one root-tag heuristic, one class-name-as-selector, and
three live objects we could resolve from the page's own injector instead of asking anyone to hand them
over.
