# Sourcemap support — effect on the *unshipped* milestones

Read-only analysis. Scope: what sourcemaps (plus a worker-side AST index, optionally `typescript` or
`tree-sitter` WASM) would change for **every roadmap entry not yet shipped** and **every backlog
milestone in the later generations that names a concrete feature**.

The shipped side is settled and is not re-derived here: for the sixteen shipped/repository features
sourcemaps `lift 0 / narrow 0 / changes nothing 16` — `MX:176`, and no shipped gate is a
source-location problem (`MX:196-204`). The whole question is therefore about what does not exist
yet.

---

## 0. Baseline, vocabulary and how to read a cell

### 0.1 Path aliases

Four aliases, each one file, used only to keep table cells narrow. Full paths appear in prose.

| alias | file |
| --- | --- |
| `RM` | `.project/ROADMAP.md` |
| `BL` | `plans/angular-ai-devtools-program-backlog.md` |
| `MX` | `.project/research/capability-dependency-matrix.md` |
| `IFC` | `.project/research/instrumentation-free-coverage.md` |

### 0.2 What is unshipped, measured off the roadmap head

Four roadmap entries carry `Status: pending` and are the entire unshipped current generation:

- `M040 performance-narrator` — `RM:1476`
- `M041 navigation-blocking` — `RM:1506`
- `M042 error-boundary` — `RM:1537`
- `M043 stability-explainer` — `RM:1567`

Nothing follows `M043` in the roadmap; the file ends at `RM:1589`. Everything else is either shipped
or a backlog entry that has not been admitted: "Neither is in `.project/ROADMAP.md` yet — a roadmap
approval admits at most twelve entries and Generation 2 still lists M041–M043" (`BL:362-363`).

One inconsistency worth naming rather than smoothing: `M040` is `pending` in the roadmap
(`RM:1476`) yet `MX:84` measures its code as present and scores it (`ext/performance-narrator.js:257`
cited there). So **M040's gate is measured, not inferred**, even though the milestone is unshipped.
That is the only unshipped roadmap row with a matrix row.

### 0.3 Numbering caveat — roadmap `M###` vs backlog `bM###`

The backlog's §3 numbering and the roadmap's agree through `M023`, then drift by **+2** because the
roadmap inserted `M024 proof-corpus-repair` and `M027 image-warning-capture`. The mapping for the
rows that appear in both:

| backlog | roadmap | milestone |
| --- | --- | --- |
| `bM038` | `M040` | performance-narrator (the gate line confirms it: "S10 (M040)" names error-boundary, `BL:218`) |
| `bM039` | `M041` | navigation-blocking |
| `bM040` | `M042` | error-boundary — and `RM:1536` records `Gate: S10`, matching `BL:218` |
| `bM041` | `M043` | stability-explainer |
| `bM042` | *(none)* | console-read — not yet admitted |

The collision is real: **backlog `M043` is `copy-to-agent` (`BL:222`) while roadmap `M043` is
`stability-explainer` (`RM:1561`)**. Rows below are therefore labelled `M###` when the roadmap is the
source and `bM###` when the backlog is.

### 0.4 Four support tiers — what "sourcemap support" would have to be, concretely

The brief's `sourcemaps effect` column is one value per row, but "sourcemap support" is not one
capability. Four tiers, cheapest first; each names the measurement it depends on, because every one
of those measurements is still open.

| tier | what must exist | what it can answer | depends on |
| --- | --- | --- | --- |
| **T0** | a resolvable map for the script the page downloaded, with `sources` (no `sourcesContent`) | which source modules a chunk or bundle carries; bytes per module | Q4 item 1, `BL:414-415`; `IFC:320` U1 — `undetermined` |
| **T1** | T0 plus `sourcesContent`, and a generated position the runtime already holds (a stack frame, a binding index) | quoting the original line for a position the runtime produced | as T0 |
| **T2** | T1 plus **expression-level template mapping** — the compiled template function mapping to the `.html` range of a binding, not only to the component | which template expression a rendered binding belongs to | Q4 item 2, `BL:416`; `IFC:321` U2; already named as a possible refusal, `template-map-coarse` (`MX:240`, `MX:250-253`) — `undetermined` |
| **T3** | a worker-side AST index over `sourcesContent` (`typescript` or `tree-sitter` WASM) | declaration sites, route tables, and **absences** (a binding that is not there) | Q4 item 3, `BL:417-418`; `IFC:326` U7 — `undetermined`; plus an unresolved CSP question carried in the ledger: MV3 "restricts Wasm to `wasm-unsafe-eval` and the panel already pins its CSP" (`BL:36`) |

A tier marker in the `evidence` column of the tables is the tier the row's fact needs.

### 0.5 The four effect values, and how they were applied

Taken verbatim from the brief, with the discipline used to assign them stated so each cell is
checkable:

- **`unlocks`** — reserved for a fact that cannot exist at all without a static artefact. Assigned
  once (§2.7), and the argument is the *absence* of a construct, which no runtime read can show.
- **`reduces-instrumentation`** — a required provider or primitive could be dropped. **Zero rows**:
  every later opt-in tap exists for an *occurrence*, not a location (§2.7, `bM104`–`bM112`), and the
  one tap that might be reporting only a location (`bM107 binding-provenance`) is a bare name, so its
  drop is `undetermined` rather than claimed.
- **`improves-accuracy`** — the feature answers today, and a source position, static type or read
  site makes the answer checkable. Assigned only where the row's stated fact is about a **binding,
  expression, template construct, declaration site, chunk or frame** — not where the subject is a
  value or an event.
- **`none`** — everything else.

### 0.6 The label rule applied to prose plans

Roadmap and backlog entries are plans, not measurements. Two labels are used:

- **inferred** — a gate (dependency on the app) attributed from prose rather than measured. Every
  such gate cites a register id `IG-n`; §2.0 carries the verbatim sentence each was inferred from.
- **†** — the goal cell is a paraphrase of a bare milestone *name*. Generations 3, 5, 6 and 7 carry
  no goal, scope, gate or criteria sentence at all (`BL:222-227`, `BL:265-272`, `BL:277-281`,
  `BL:286-291`), so both the goal and the gate on those rows are inferred from the name alone.
- **`not-applicable`** — the entry names no concrete feature (a spike, a verification or docs task,
  an ordering ruling).

---

## 1. Counts, stated before the tables so the tables can be checked against them

| effect | rows |
| --- | --- |
| `improves-accuracy` | **41** |
| `unlocks` | **1** |
| `reduces-instrumentation` | **0** |
| `none` | **61** |
| `not-applicable` | **4** |
| **total rows** | **107** |

Breakdown by section: current generation 3/1/0/1/0 · queued 0/0/0/0/4 · generation 2 tail
1/0/0/0/0 · generation 3 9/0/0/14/0 · generation 4 1/0/0/7/0 · generation 5 13/0/0/18/0 ·
generation 6 6/1/0/9/0 · generation 7 8/0/0/12/0 (order: improves / unlocks / reduces / none / n-a).

Tier demand across the 42 affected rows — every row that is not `none` carries exactly one tier
marker in its `evidence` cell: **T0 3 · T1 8 · T2 17 · T3 14.** A third of the benefit (14 of 42) sits
on T3, the tier with the two open measurements (§0.4), and the cheapest tier pays on three rows only.

Two numbers matter more than the totals:

1. **94 of the 103 effect-bearing rows have no gate sentence anywhere in the plan** — their gate is
   inferred from a milestone name in a name list (§2.0, `IG-1`–`IG-8`). The plan admits this shape
   itself: "The roadmap phase copies these verbatim and expands `Scope: out`, `Success criteria`,
   `Risks` and `Open questions` from §4" (`BL:92-93`) — and §4 for generations 3–7 is names only.
2. **The map alone unlocks nothing** — the single `unlocks` is the AST index's (§2.7, `bM098`).
   Every other gain is checkability over a fact the runtime already produces.

---

## 2.0 Inferred-gate register — every gate labelled *inferred*, with its quoted sentence

Rows in §2.1–§2.8 cite these ids. Each entry quotes the sentence verbatim.

| id | rows covered | inferred gate | quoted sentence | cite |
| --- | --- | --- | --- | --- |
| **IG-1** | `M041` | `dev-mode` (page-agent read of the stages the router emits); no `provider`, no `primitive` | "The navigation stages the fixture records, and the one the navigation stopped in." | `RM:1511` |
| **IG-2** | `M042` | `dev-mode` **partial** (boundary/component identity only); nothing else until S10 says the error is readable page-side | "does an Angular error boundary expose the error it caught to a page-side reader?" | `RM:1558` |
| **IG-3** | `M043` | `dev-mode` + `provider` (the counter/zones arrangement that produces settled-vs-unsettled reports); no `primitive` | "The outstanding work the fixture reports: pending tasks, in-flight requests and unsettled resources." | `RM:1572` |
| **IG-4** | `bM042` | `nothing` — our own console tap needs no app cooperation, and no gate is named for `M042`: the gate line names only two milestones | "Gates: S10 (M040), S9 (M035)." | `BL:218` |
| **IG-5** | all 23 of generation 3 (`bM043`–`bM065`) | one per row, inferred from the name's own words; nothing in the plan constrains it | "M043 copy-to-agent · M044 component-search · M045 ui-copy-check · M046 interaction-story · M047 dead-click (S17) · M048 what-changed (S18) · M049 webmcp-audit · M050 webmcp-rehearsal · M051 visual-qa (S5) · M052-M054 tutor-foundations / tutor-signals / tutor-routing (TS1-TS12) · M055 teardown-leak · M056 error-routing · M057 locale-correctness · M058 outlet-explainer · M059 guard-phase · M060 lazy-chunk-failure · M061 title-input-binding · M062 schema-disabled-hidden · M063 formfield-binder · M064 head-state · M065 error-channel-map" | `BL:222-227` |
| **IG-6** | all 31 of generation 5 (`bM066`–`bM096`) | one per row, from the name; the only gate information in the plan is a family list of spikes that does not say which milestone each gates | "Gates: DEF-S1..S5, HYD-S2..S4, ANI-S1, FOR-S1..S4, CF-S1, CF-S2, SUB-S1, BND-S1, BND-S2." | `BL:265-273` |
| **IG-7** | all 16 of generation 6 (`bM097`–`bM112`) | one per row, from the name; the generation states a rule about taps, not a gate | "Rule: every tap lands **with** the milestone it upgrades, never as its own wave." | `BL:277-282` |
| **IG-8** | all 20 of generation 7 (`bM113`–`bM132`) | one per row, from the name; the generation states spike names only | "Gates: S20, S21, S22, S23, TST-S1..S3, RTH-S1, HTT-S1, HTT-S2, HAR-S1, PWT-S2..S5." | `BL:286-292` |

Inferred total: **94 rows** (3 + 1 + 23 + 31 + 16 + 20). Not inferred: `M040` (measured, `MX:84`),
the four queued items (all `not-applicable`), and generation 4's eight rows, whose environments are
stated in their own scope sentences (§2.5).

---

## 2.1 Current generation — the four unshipped roadmap entries

| milestone | goal | needs from the app | sourcemaps effect | evidence |
| --- | --- | --- | --- | --- |
| **M040 performance-narrator** | which component did the work in this frame, and what it cost | `dev-mode` + `provider` (zoneless) + `ɵsetProfiler` — **measured**, not inferred | **improves-accuracy** | `T2` · `MX:84` (dev-mode required, zoneless required, `ɵsetProfiler`); `RM:1481` "ordered by the profile rather than by wall-clock guesses"; the gain is `BL:425-426`; the limit is `MX:173` (the profiler passes no binding argument) |
| **M041 navigation-blocking** | what is holding this navigation, and at which stage | `dev-mode` — inferred `IG-1` | **improves-accuracy** | `T3` · `RM:1511` (the stage is the fact); a map adds the guard/resolver declaration that owns the stage, which today is not named anywhere; `RM:1526` shows the runtime artefact, not a location, is what separates slow from blocked |
| **M042 error-boundary** | why this error reached the boundary that caught it, and what it replaced | `dev-mode` **partial** — inferred `IG-2`; `Gate: S10` stated (`RM:1536`) | **improves-accuracy** | `T1` · `RM:1542-1544` (boundary + replaced subtree, no frame is read); `IFC:209-210` records that the source position of a frame is "a new finding, and the one place where a map is strictly better than what the surface has" |
| **M043 stability-explainer** | why the app is not stable, and what is still outstanding | `dev-mode` + `provider` — inferred `IG-3` | **none** | `RM:1572` (task/request/resource occurrences); `RM:1587` "stability read from a quiet interval is not stability; the observable must come from the reported work" — an occurrence no bundle holds |

## 2.2 Queued items (2026-11-08) — no concrete feature, so no gate

| entry | what it is | needs from the app | sourcemaps effect | evidence |
| --- | --- | --- | --- | --- |
| **Q1** re-target verification to the zoneless portal | a verification re-target; names no product feature | — | **not-applicable** | `BL:322-333` |
| **Q2** portal control behind an adapter | tooling: an adapter plus a "contract canary" on the portal CLI's JSON shape | — | **not-applicable** | `BL:335-363` |
| **Q3** refresh the feature screenshots | a documentation/evidence capture task | — | **not-applicable** | `BL:366-398` |
| **Q4** sourcemap + worker-side AST index spike | the spike, `Gate: S11`, whose four measurements decide the rest of this document | — | **not-applicable** (it *is* the measurement; §4 names each of its four items as a dependency) | `BL:401-434` |

## 2.3 Generation 2 — the one milestone with no roadmap entry yet

| milestone | goal | needs from the app | sourcemaps effect | evidence |
| --- | --- | --- | --- | --- |
| **bM042 console-read** | read a console message and say what it means † | `nothing` (our console tap is at `document_start`) — inferred `IG-4` | **improves-accuracy** | `T1` · `BL:217` (name only); the console message *is* a frame, and the shipped join deliberately cuts every frame before reading anything (`MX:70`), so this is the first surface where a map answers a question the project currently refuses to ask |

## 2.4 Generation 3 — interaction, agent interop, blocks (`bM043`–`bM065`)

Every gate in this table is inferred from the milestone's name (IG-5, `BL:222-227`); every goal is a
name paraphrase (†).

| milestone | goal † | needs from the app | sourcemaps effect | evidence |
| --- | --- | --- | --- | --- |
| **bM043 copy-to-agent** | copy a fact chain out to an outside agent | `nothing` to read; reuses shipped facts | **improves-accuracy** | `T3` · a copied fact with its original `file:line` is checkable by the agent that receives it; the feature's own fact already exists |
| **bM044 component-search** | find a component | `dev-mode` (runtime enumeration) | **improves-accuracy** | `T3` · adds the declaring file and template line, and covers a source-declared component that never rendered — the class of fact `BL:424-425` names |
| **bM045 ui-copy-check** | check user-facing copy | `dev-mode` (rendered text) | **improves-accuracy** | `T3` · template literals are static text; the AST names where each string lives, which the rendered text cannot |
| **bM046 interaction-story** | narrate one interaction | `provider` (recorded cycles) | **none** | the story is a sequence of events fired on interaction |
| **bM047 dead-click (S17)** | a click that does nothing | `provider`; `Gate: S17` stated (`BL:223`) | **none** | "nothing happened" is an absence of effect observed after the event |
| **bM048 what-changed (S18)** | what changed between two states | `provider`; `Gate: S18` stated (`BL:223`) | **none** | a diff of two runtime values |
| **bM049 webmcp-audit** | audit the app's WebMCP tools | `dev-mode` (the registered tool set) | **none** | registration is an act; an AST would find *declared* schemas, which is a different finding, not this one |
| **bM050 webmcp-rehearsal** | rehearse a tool call | `dev-mode` | **none** | the result of a call the app executes |
| **bM051 visual-qa (S5)** | visual check at a moment | `dev-mode`; `Gate: S5` stated (`BL:224`) | **none** | the rendered pixels |
| **bM052 tutor-foundations** | tutor: foundations | `nothing` | **none** | teaching content over shipped facts, no app read (`BL:224`, `TS1-TS12`) |
| **bM053 tutor-signals** | tutor: signals | `nothing` | **none** | same |
| **bM054 tutor-routing** | tutor: routing | `nothing` | **none** | same |
| **bM055 teardown-leak** | a leak surviving destroy | `provider` | **none** | a post-destroy observation |
| **bM056 error-routing** | the path an error took | `dev-mode` **partial** | **improves-accuracy** | `T1` · the origin frame's original `file:line`; `IFC:209-210` |
| **bM057 locale-correctness** | locale data correctness | `dev-mode` (`LOCALE_ID`, registered locales) | **none** | the registered locale is runtime state |
| **bM058 outlet-explainer** | which outlet shows what | `dev-mode` (activated-route tree) | **improves-accuracy** | `T2` · the `<router-outlet>` declaration's template line |
| **bM059 guard-phase** | which guard phase ran | `dev-mode` | **improves-accuracy** | `T3` · the guard function's declaration site; only the phase/verdict is knowable at runtime |
| **bM060 lazy-chunk-failure** | why a chunk failed to load | `dev-mode` | **improves-accuracy** | `T0` · a chunk's map lists the modules it carries, so the failed chunk can name the route file(s) — with the honest caveat that the map may fail when the chunk does |
| **bM061 title-input-binding** | a title/input binding | `dev-mode` | **improves-accuracy** | `T2` · the binding's expression text and line; depends on Q4 item 2 (`BL:416`, `undetermined`) |
| **bM062 schema-disabled-hidden** | the schema's disabled/hidden state | `dev-mode` | **none** | live field state |
| **bM063 formfield-binder** | the form-field binder | `dev-mode` | **improves-accuracy** | `T2` · the binding expression and its line; `BL:416` |
| **bM064 head-state** | head state (title/meta) | `dev-mode` | **none** | the current head values |
| **bM065 error-channel-map** | which channel carried which error | `dev-mode` **partial** | **none** | a channel is an occurrence, not a position |

## 2.5 Generation 4 — design system and Storybook

These are the only later-generation rows whose gate is **stated** rather than inferred, because each
carries a scope sentence. All are panel-side or browser-side; none reads the inspected app.

| milestone | goal | needs from the app | sourcemaps effect | evidence |
| --- | --- | --- | --- | --- |
| **DS-2 tokens** | density/colour/type/motion custom properties, reduced-motion contract | `nothing` | **none** | `BL:242-243` |
| **DS-5 harvest** | harvest the shipped explainer shell across six surfaces | `nothing` | **none** | `BL:244-246` |
| **DS-6 services** | toast, tooltip, clipboard, awaitable `confirm()` via the CDK dialog | `nothing` | **none** | `BL:247-248` |
| **DS-7 harnesses** | HAR-1 and HAR-2 only | `nothing` (drives the panel's own environment) | **none** | `BL:249-251` |
| **DS-8 Playwright** | extension load, panel bundle, `baseHref`, relay path via an ordinary tab | `nothing` | **none** | `BL:252-256` |
| **CAP-1** | five Prompt-API capability states with a cited guide | `nothing` (reads `Platform` from CDK) | **none** | `BL:257` |
| **SHOW-1** | one story per panel state from one pinned fixture corpus | `nothing` | **none** | `BL:258` |
| **Storybook feature set** | preview detection via `window.__STORYBOOK_PREVIEW__`, story index, story-gap finder, ask about a story's component, "why does this story differ" | `nothing` — "Tier 1, third-party reads of globals" | **improves-accuracy** | `T3` · `BL:233`; the effect belongs to the **story-gap finder only** — the other four sub-features are `none`. The gap finder lists "components rendered without a story", so a component that is declared and never rendered is invisible to it without a source inventory — the same class as `BL:424-425` |

## 2.6 Generation 5 — defer, hydration, animation, template blocks (`bM066`–`bM096`)

Gates inferred from names (IG-6, `BL:265-272`); goals paraphrased from names (†). This is where a
map starts paying in bulk: thirteen of thirty-one rows gain.

| milestone | goal † | needs from the app | sourcemaps effect | evidence |
| --- | --- | --- | --- | --- |
| **bM066 defer payload-cost** | what a deferred chunk costs in bytes | `dev-mode` (defer-block read) | **improves-accuracy** | `T0` · a chunk's map lists its source modules, so cost becomes attributable per file; needs only `sources`, not `sourcesContent` |
| **bM067 trigger-payoff** | what a defer trigger bought | `dev-mode` | **none** | timing of a trigger |
| **bM068 nested-order** | the order of nested defer blocks | `dev-mode` | **improves-accuracy** | `T2` · the nesting is a template structure; the map/AST names which block sits inside which, at its line |
| **bM069 error-block** | an `@error` block that showed | `dev-mode` | **improves-accuracy** | `T2` · the block's template line |
| **bM070 layout-shift** | layout shift | `dev-mode` (`PerformanceObserver`) | **none** | a measured shift |
| **bM071 hydration timeline** | the ordering of hydration work | `dev-mode` | **none** | an ordinal in an event list, exactly as `MX:81` records for after-render |
| **bM072 hydration skipped** | why a node's hydration was skipped | `dev-mode` | **improves-accuracy** | `T2` · the skipped node's template line; the identity is runtime, the location is not |
| **bM073 text-mismatch** | server vs client text mismatch | `dev-mode` | **none** | two runtime strings |
| **bM074 dehydrated-state** | transferred state | `dev-mode` | **none** | runtime state |
| **bM075 server-log** | server log lines | `nothing` | **none** | a log artefact from another process |
| **bM076 ssr-payload-budget** | payload budget by bytes | `dev-mode` | **improves-accuracy** | `T0` · per-source byte attribution, same mechanism as `bM066` |
| **bM077 render-vs-hydration** | the time split between them | `dev-mode` | **none** | two receipt times |
| **bM078 dom-drift** | server DOM vs client DOM drift | `dev-mode` | **improves-accuracy** | `T2` · the drifted node's template line; `BL:416` |
| **bM079 animation stuck** | an animation that never finishes | `dev-mode`; ANI-S1 | **none** | animation state at a moment |
| **bM080 view-transitions** | a view transition's state | `dev-mode` | **none** | same |
| **bM081 enter-leave** | enter/leave timing | `dev-mode` | **none** | timing |
| **bM082 render-cost** | the cost of a render | `dev-mode` | **none** | durations, as `MX:84` records for the narrator |
| **bM083 legacy-flag** | a legacy construct flagged | `dev-mode` | **improves-accuracy** | `T3` · and `MX:161` already draws the line for the shipped twin: the source read "is an AST index, not a sourcemap" |
| **bM084 control-flow tap** | tap the block structure | `dev-mode` (`ɵgetControlFlowBlocks`) | **improves-accuracy** | `T2` · each block's original line, which the runtime block record does not carry |
| **bM085 template-block-review** | review a template's blocks | `dev-mode` | **improves-accuracy** | `T2` · block → original line; this is the row that most needs expression-level template mapping (`BL:416`) |
| **bM086 for-keystroke-rebuild** | a rebuild per keystroke | `provider` (recorded cycles) | **none** | an input event and the cycle it caused |
| **bM087 for-input-churn** | input churn | `provider` | **none** | same |
| **bM088 for-empty-blind-spot** | `@for` over an empty list | `dev-mode` | **none** | the list's runtime length |
| **bM089 for-nested-identity** | identity in a nested `@for` | `dev-mode` | **none** | identity at runtime |
| **bM090 for-large-list-cost** | the cost of a large list | `dev-mode` | **none** | durations |
| **bM091 if-branch-timeline** | which branch ran, when | `dev-mode` | **improves-accuracy** | `T2` · the branch's template line |
| **bM092 if-condition-values** | the values an `@if` condition read | `dev-mode` | **improves-accuracy** | `T2` · this is the third expected insight verbatim — "which templates read a signal the runtime graph only names" (`BL:425`); the graph names the signal, only the template expression names the reader |
| **bM093 switch-case-order** | `@case` order | `dev-mode` | **improves-accuracy** | `T2` · the source order of `@case` blocks is static and checkable |
| **bM094 let-binding-values** | `@let` values | `dev-mode` | **improves-accuracy** | `T2` · the `@let` expression's text and line |
| **bM095 defer-placeholder-flash** | a placeholder that flashed | `dev-mode` | **none** | a timing window |
| **bM096 defer-loading-never** | a deferred block that never loaded | `dev-mode` | **none** | a state |

## 2.7 Generation 6 — boundary, service worker, elements, taps (`bM097`–`bM112`)

Gates inferred from names (IG-7, `BL:277-281`); goals paraphrased from names (†).

| milestone | goal † | needs from the app | sourcemaps effect | evidence |
| --- | --- | --- | --- | --- |
| **bM097 boundary-did-not-catch** | a boundary that did not catch | `dev-mode` **partial**; `Gate: S10` stated (`BL:277`) | **improves-accuracy** | `T1` · the error's origin frame in original source, joined to the ErrorHandler (`BL:277`) |
| **bM098 boundary-reset-unreachable** | a boundary whose reset cannot be reached | `dev-mode` | **unlocks** | `T3` · the fact is an **absence**: no reset binding exists in the template. Runtime inspection cannot show a binding that was never written, and the project forbids guessing one (`BL:429-430`). The **map alone gives `none`** — this unlock is the AST index's, and it rests on Q4 item 3 (`BL:417-418`) and `IFC:326` U7, both `undetermined` |
| **bM099 sw stale-asset-set** | a stale asset set after a service-worker update | `nothing` (browser SW state) | **none** | cache contents at runtime |
| **bM100 sw install-churn** | install churn | `nothing` | **none** | install events |
| **bM101 sw safe-mode** | service-worker safe mode | `nothing` | **none** | runtime state |
| **bM102 elements identity** | which component backs a custom element | `dev-mode` | **none** | the identity is complete from the registry; a location adds nothing to the claim |
| **bM103 elements bootstrap** | custom-element bootstrap | `dev-mode` | **none** | bootstrap order |
| **bM104 pending-task-labelling** | label a pending task | `primitive` (opt-in tap) | **none** | the tap's job is to say *which* task existed; a static index cannot |
| **bM105 signal-write-provenance** | which code wrote a signal | `primitive` (opt-in tap) | **improves-accuracy** | `T1` · the tap reports the write; the map resolves that write to original source. The tap cannot be dropped: an AST finds every write site and cannot say which ran |
| **bM106 http-interceptor-chain** | the interceptor chain | `primitive`/`provider` | **improves-accuracy** | `T3` · each interceptor's declaration site; the order stays runtime |
| **bM107 binding-provenance** | which binding wrote a value | `primitive` (opt-in tap) | **improves-accuracy** | `T2` · the binding expression. Whether the tap drops *to nothing* is `undetermined` — the entry is a name, so it is unknown whether it supplies the occurrence or only the location; if only the location, this is the one row that would become `reduces-instrumentation` |
| **bM108 swupdate-events** | `SwUpdate` events | `nothing` | **none** | events |
| **bM109 form-schema-tap** | the app's form schema | `primitive` (opt-in tap) | **improves-accuracy** | `T3` · the schema declaration in source; validity stays runtime |
| **bM110 sanitizer-decisions** | the sanitizer's decisions | `primitive` (opt-in tap) | **none** | a strip is an occurrence at a clock instant, as `MX:79` records for the shipped surface |
| **bM111 guard-verdicts** | guard verdicts | `primitive` (opt-in tap) | **improves-accuracy** | `T3` · the guard's declaration site; the verdict stays runtime |
| **bM112 animation-completion** | animation completion | `primitive` (opt-in tap) | **none** | a completion event |

### 2.7.1 The single `unlocks`, stated so it can be attacked

`bM098` is the only row whose fact cannot exist today. The reason is narrow and worth stating
because it decides the sequencing: **a map maps positions; an AST index can assert an absence.** Every
other row asks "what is at position P" (a map question) or "what is declared where" (an AST
question). `bM098` asks "why can this never happen", and the answer is that a binding is not in the
template — the one shape no runtime reader in this repository can produce (`MX:93-96` records that no
shipped surface reads a map at all; `IFC:320` U1 records the same absence for the whole tree).

---

## 2.8 Generation 7 — test suites (`bM113`–`bM132`)

Gates inferred from names (IG-8, `BL:286-291`); goals paraphrased from names (†).

| milestone | goal † | needs from the app | sourcemaps effect | evidence |
| --- | --- | --- | --- | --- |
| **bM113 test-attach-harness** | the Vitest tester-iframe attach (`cdpAttach`) | `nothing` (harness plumbing) | **none** | `BL:286` |
| **bM114 test timing** | which step was slow | `dev-mode` + the attach harness | **improves-accuracy** | `T1` · a slow step's `.spec.ts` line; the frame is the only handle on it |
| **bM115 query-mismatch** | a query that matched the wrong thing | `dev-mode` | **improves-accuracy** | `T1` · the query's original line |
| **bM116 test-vs-app** | whether the fault is the test or the app | `dev-mode` | **improves-accuracy** | `T1` · **and the strongest `unlocks` candidate in the plan**, downgraded here only because one measurement is missing. Attributing a frame to the `.spec.ts` tree or the `src/app/**` tree is a map question, and a minified position may not be guessed (`BL:429-430`). **`undetermined`**: if Vitest Browser Mode already serves original modules, the frame is already original and the effect is `none`. No file in this repository records the shape of an attach-run `Error.stack`; one failing attach run would settle it |
| **bM117 test-DI** | DI inside the test | `dev-mode` | **improves-accuracy** | `T3` · the provider declaration site |
| **bM118 test-override-ignored** | an override that was ignored | `dev-mode` | **improves-accuracy** | `T3` · the override's declaration site |
| **bM119 test-zone-era-helper** | the zone-era helper in a test | `dev-mode` | **none** | a runtime predicate on the test environment |
| **bM120 test-defer-block** | a `@defer` block under test | `dev-mode` | **improves-accuracy** | `T2` · the block's template line |
| **bM121 router-testing nav** | router navigation in a test | `dev-mode` | **improves-accuracy** | `T3` · the route declaration's line in the test file |
| **bM122 router-testing inputs** | router inputs in a test | `dev-mode` | **improves-accuracy** | `T2` · the binding in the host component's template |
| **bM123 http double-answered** | a request answered twice | `dev-mode` | **none** | an occurrence |
| **bM124 injected-error** | an injected HTTP error | `dev-mode` | **none** | an occurrence |
| **bM125 harness predicate** | a harness predicate | `nothing` | **none** | `BL:289` |
| **bM126 harness ambiguity** | the ambiguous-host harness | `nothing` | **none** | `BL:289` |
| **bM127 harness action** | the action harness | `nothing` | **none** | `BL:289` |
| **bM128 Playwright stability** | Playwright stability | `nothing` | **none** | `BL:290` |
| **bM129 Playwright page-ledger** | the Playwright page ledger | `nothing` | **none** | `BL:290` |
| **bM130 Playwright retry** | Playwright retry | `nothing` | **none** | `BL:290` |
| **bM131 Playwright step-timing** | Playwright step timing | `nothing` | **none** | `BL:290` |
| **bM132 Playwright testability** | Playwright testability — only "if PWT-S5 shows disagreement" (`BL:290-291`) | `nothing` | **none** | `BL:290-291` |

---

## 3. The milestones that would benefit most, and the smallest support that delivers each

Ranked by the value of the *fact gained*, not by the size of the row count. Each states the
`undetermined` measurement it depends on, because none of the four is settled.

### 3.1 `M040 performance-narrator` — the template region a check's cost belongs to

**The fact it cannot get now.** The narrator has `durationMs` (one receipt time minus another,
`MX:84`) and "the identity is whatever instance the profiler passed" (`MX:84`). It cannot say which
part of the component's template the work belongs to. `BL:425-426` names exactly that gap: "the
binding that caused a component to be checked, which the M040 narrator can currently report only as
cost and identity".

**The honest limit, stated because it changes the ask.** The map supplies the component's template
region and, at T2, the list of bindings inside it. It cannot say *which* binding ran: "a map cannot
supply a missing profiler argument" (`MX:173`), and this repository's honesty rule forbids dressing a
list as a cause (`BL:428-431`). So the deliverable fact is "the cost belongs to this template region,
whose bindings are these", and the stronger claim in `BL:425-426` needs a profiler argument that does
not exist today.

**Smallest support that delivers it.** T2 — a resolvable map **with embedded `sourcesContent`** and
expression-level mapping of the compiled template function onto the `.html` range. Depends on Q4
item 1 (`BL:414-415`) and item 2 (`BL:416`), both `undetermined`; if item 2 fails, the gain degrades
to component granularity and the panel must publish `template-map-coarse` rather than an
expression-level claim (`MX:240`).

**It cannot land inside `M040`.** Its scope is fixed (`RM:1480-1489`) and the source attribution is
"explicitly a *new* surface, not a repair of this one" (`MX:173`).

### 3.2 `bM092 if-condition-values` — the template expression that reads the signal

**The fact it cannot get now.** The signal graph names a signal; it cannot name the template
expression reading it. That is the third expected insight verbatim — "which templates read a signal
the runtime graph only names" (`BL:425`) — and it is the insight with the widest reach, because the
shipped interop surface already reports that the graph "cannot name the feeding Observable, the
operator chain, or emission timing" (`RM:472`).

**Smallest support that delivers it.** The same T2 as §3.1 plus the already-shipped signal graph
(`MX:80` for the graph read): `sourcesContent` to show the condition's text, expression-level
template mapping to tie the binding index the runtime knows to that text. No AST index is needed —
the runtime hands the position; only the map is missing.

**Why this row and not its neighbours.** `bM061`, `bM063`, `bM093` and `bM094` are the same fact shape
(a binding, an expression, a block) and ride the same tier; `bM092` is named here because it is the one
of the five that maps onto a sentence the backlog already wrote.

### 3.3 `bM066 defer payload-cost` and `bM076 ssr-payload-budget` — bytes per source module

**The fact they cannot get now.** A cost figure exists per chunk; it cannot be attributed to the
source files the chunk carries, so the answer stays "this block costs 48 kB" rather than "these four
files cost 48 kB".

**Smallest support that delivers it.** **T0 — the cheapest tier in this document.** A resolvable map
with `sources` and *no* `sourcesContent`, *no* template precision, *no* parser. Depends only on Q4
item 1 (`BL:414-415`), the same measurement that gates every other row, so it is the natural first
proof: it fails loudly and cheaply if the portal ships no map, and it succeeds deterministically
against a known build.

### 3.4 `bM116 test-vs-app` — the only plausible map-driven `unlocks`

**The fact it cannot get now.** Whether a failing assertion belongs to the test tree or the app tree.
A bundled frame cannot be attributed to a source path, and `BL:429-430` forbids the guess: "A missing
map is `cannot-tell: no-sourcemap`, never a guess from a minified position."

**Smallest support that delivers it.** T1 — a resolvable map for the test bundle whose `sources`
carry both `.spec.ts` and `src/app/**` paths, plus `sourcesContent` to quote the failing line, plus
the `no-sourcemap` refusal as a real code path rather than prose.

**The measurement that decides whether this is worth anything.** Whether Vitest Browser Mode already
serves original modules — one failing attach run's `Error.stack` settles it, and no file in this
repository records that shape. Until it is measured, this row is `improves-accuracy`, not `unlocks`.

### 3.5 Also worth naming, and why it is not in the top four

`bM098 boundary-reset-unreachable` is the single `unlocks` (§2.7.1), but its support is the **T3 AST
index**, whose cost and CSP status are both unmeasured (`BL:417-418`; the Wasm CSP question at
`BL:36`). It is the most valuable *unlock* and the least advisable *first* work.

---

## 4. The milestones sourcemaps do NOT help, and the one-line reason

Sixty-one rows. Grouped by the artefact that is missing, because the grouping is the finding: in
every case what is needed is produced by app code executing — a value present only at runtime, an
event fired on interaction, or a change-detection cycle — and a bundle cannot describe any of the
three.

### 4.1 A value or an occurrence that exists only while the app runs (31)

- `M043 stability-explainer` — the outstanding item exists only while it is outstanding (`RM:1587`).
- `bM048 what-changed` — a diff of two runtime values.
- `bM049 webmcp-audit` — the *registered* tool set is an act, not a declaration.
- `bM055 teardown-leak` — a post-destroy observation.
- `bM057 locale-correctness` — the registered locale is runtime state.
- `bM062 schema-disabled-hidden` — live field state.
- `bM064 head-state` — the current head values.
- `bM065 error-channel-map` — a channel is an occurrence.
- `bM067 trigger-payoff` — the trigger fired at a moment.
- `bM070 layout-shift` — a measured shift.
- `bM073 text-mismatch` — two runtime strings.
- `bM074 dehydrated-state` — the transferred state itself.
- `bM075 server-log` — produced by another process.
- `bM082 render-cost` — durations; "the profile records events, not durations" (`RM:1496`).
- `bM088 for-empty-blind-spot` — the list's length at runtime.
- `bM089 for-nested-identity` — identity assigned at runtime.
- `bM090 for-large-list-cost` — durations.
- `bM096 defer-loading-never` — the state, not a position.
- `bM099`, `bM100`, `bM101` sw stale-asset-set / install-churn / safe-mode — cache and install state.
- `bM102 elements identity` — the identity is complete without a position.
- `bM103 elements bootstrap` — bootstrap order.
- `bM104 pending-task-labelling` — the tap exists to say *which* task existed.
- `bM108 swupdate-events` — events.
- `bM110 sanitizer-decisions` — a strip is an occurrence at a clock instant (`MX:79`).
- `bM112 animation-completion` — a completion event.
- `bM119 test-zone-era-helper` — a runtime predicate on the environment.
- `bM123 http double-answered`, `bM124 injected-error` — occurrences.
- `bM132 Playwright testability` — conditional on PWT-S5 (`BL:290-291`).

### 4.2 An event only fired on interaction (7)

- `bM046 interaction-story` — the story *is* the event sequence.
- `bM047 dead-click` — "nothing happened" is an absence of effect after a click.
- `bM050 webmcp-rehearsal` — the result of a call the app executes.
- `bM051 visual-qa` — the rendered pixels at a moment.
- `bM086 for-keystroke-rebuild` — an input event and the cycle it caused.
- `bM087 for-input-churn` — the same event, repeated.
- `bM095 defer-placeholder-flash` — a timing window.

### 4.3 A cycle's timing or an ordinal in a recorded list (5)

- `bM071 hydration timeline`, `bM077 render-vs-hydration` — ordinals in an event list, the shape
  already recorded for after-render: "There is no generated position to map" (`MX:81`).
- `bM079 animation stuck`, `bM080 view-transitions`, `bM081 enter-leave` — animation phase at a
  moment.

### 4.4 Panel-side, content-only or harness plumbing (18)

- `bM052`, `bM053`, `bM054` tutor-foundations / tutor-signals / tutor-routing — teaching content over
  facts that already exist.
- DS-2 tokens, DS-5 harvest, DS-6 services, DS-7 harnesses, DS-8 Playwright, CAP-1, SHOW-1 — all
  panel- or browser-side, reading nothing of the inspected app (`BL:242-258`).
- `bM113 test-attach-harness`, `bM125`–`bM127` harness predicate / ambiguity / action,
  `bM128`–`bM131` Playwright stability / page-ledger / retry / step-timing — harness plumbing and
  browser drives with no inspected-app read.

---

## 5. Sequencing implication

### 5.1 Where the capability first pays, in plan order

| position in plan order | first row that needs static support | tier | how much it gains |
| --- | --- | --- | --- |
| current generation (`RM:1476-1567`) | `M040` | T2 | `improves-accuracy` — the template region of a check |
| generation 2 tail (`BL:217-218`) | `bM042` | T1 | `improves-accuracy` — the first frame the project currently cuts (`MX:70`) |
| generation 3 (`BL:222-227`) | `bM043`, `bM044`, `bM045` | T3 | `improves-accuracy` only; each already answers without it |
| generation 4 (`BL:242-258`) | Storybook story-gap finder | T3 | `improves-accuracy` for one sub-feature |
| **generation 5 (`BL:265-272`)** | **`bM066`** | **T0** | the first row where the *cheapest* tier pays, and the first generation that gains in bulk (13 of 31) |
| generation 6 (`BL:277-281`) | `bM098` | T3 | the only `unlocks` |
| generation 7 (`BL:286-291`) | `bM114`, `bM115`, `bM116` | T1 | 8 of 20 |

### 5.2 The answer: nothing moves

**No planned milestone is worth re-ordering, and no planned milestone becomes a prerequisite for
it.** Three reasons, each with its citation:

1. **Every gain before generation 5 is checkability, not capability.** The current generation and
   generations 2–4 gain 14 `improves-accuracy` rows (3 + 1 + 9 + 1) and zero `unlocks`; each of those surfaces answers
   today. This is the same asymmetry already measured on the shipped side — `MX:176` (`lift 0 /
   narrow 0`) — and pulling a capability forward to improve fourteen answers that already exist buys
   nothing that a later upgrade would not also buy.
2. **The `unlocks` is the AST tier, and the AST tier's two measurements are open.** `bM098` needs
   parsing (Q4 item 3, `BL:417-418`; `IFC:326` U7) and a CSP decision the ledger has already
   flagged — MV3 "restricts Wasm to `wasm-unsafe-eval` and the panel already pins its CSP"
   (`BL:36`). Scheduling it before those are measured would be work that depends on an `undetermined`
   result.
3. **The cheapest tier is the one that arrives first in the plan anyway.** T0's only consumer is
   `bM066`/`bM076` at the head of generation 5 (`BL:265`), which means the capability's natural slot
   is a plumbing milestone opening generation 5 — before `bM066`, not before generation 2.

### 5.3 What does move, and it is already ordered

- **The spike moves first, and the plan already says so.** Q4's own ordering is "After Q1 … Before any
  design system work that would style surfaces this feature adds" (`BL:433-434`), and Q1/Q2 already
  rank above generation 2's remaining tail (`BL:319-320`, `BL:362-363`). So S11 lands between the
  verification re-target and generation 2's tail — early enough to settle the tier question before
  the design system locks the shell (A10 at `BL:26`/`BL:231`; A11's grow-by-use subset at
  `BL:27`/`BL:237`).
- **A failed S11 changes who the capability is for, not when it sits.** "If (1) or (2) fails on the
  zoneless portal, the capability is dev-and-staging only. That is still useful, and it changes who
  the feature is for" (`BL:421-422`). A dev-and-staging-only verdict demotes T2 (§3.1, §3.2) to
  optional and leaves T0/T1 intact, which is exactly the generation-5 slot above.
- **The index needs no new plumbing.** The worker boundary and the `worker` host already ship
  (`RM:705`, `RM:749`), so the AST index lands on the M019 boundary rather than opening a new one.
  What is genuinely new is the read: "the extension performs **no network read at all** — no
  `fetch(`, no `XMLHttpRequest`, no `sourceMappingURL` anywhere under `extension/`" (`MX:184-187`), so
  the map fetch is the tool's first fetch, and it is ours alone — nothing to ask the app for
  (`BL:407-409`).

### 5.4 Two facts that argue against bringing it earlier than generation 5

1. **Two of the four insights the capability was justified by have no milestone to land in.**
   `BL:424-426` lists four: a template line for a rendered node; declared-but-never-instantiated
   providers; which templates read a signal; and the binding behind a check. The first has no owner
   in the roadmap or in generations 2–7; the second has no owner either (the nearest shipped surface,
   `di-doctor`, reports the *resolution path*, `MX:74`); the third is nearest to `bM092`; the fourth
   is `M040`'s, with the limit in §3.1. Shipping a capability with two orphans is a design decision
   nobody has made yet — and it is the argument for the spike over the milestone, which is what
   `BL:407-411` already says: "Every explainer shipped so far pays the opt-in tax … That asymmetry is
   the whole prize, and it is unproven on the targets this project actually explains."
2. **The panel budget is the constraint that punishes early adoption.** A 520 KB hard initial-bundle
   ceiling (`RM:732`) makes a parser inside the initial path expensive; a worker-side index
   avoids it only if the worker is off the initial path, which is M019's open risk (`RM:772`).

### 5.5 The sequencing answer in two sentences

**Nothing moves: the current generation and generations 2–4 gain 14 `improves-accuracy` rows and no
`unlocks`, so pulling a sourcemap capability forward would add cost with no new answer, and the first
milestone that cannot exist without static support is `bM098` in generation 6, behind an AST tier
whose parsing cost and CSP status are both unmeasured (`BL:417-418`, `BL:36`).** The capability
should therefore be a plumbing milestone opening generation 5 — immediately before `bM066`, its
cheapest consumer and the first row that needs only T0 — with the S11 spike run right after Q1/Q2 as
Q4 already orders it (`BL:433-434`) so that the tier question is settled before the design system
locks the shell (A10 `BL:26`, A11 `BL:27`).

---

## 6. What is still `undetermined`, and which recommendations rest on it

Per the rule that no recommendation may lean on an unmeasured premise without naming it.

| # | measurement | state | blocks |
| --- | --- | --- | --- |
| 1 | does the target build ship a resolvable `.map` with `sourcesContent`? | `undetermined` — `BL:414-415`, `IFC:320` U1 | every row that is not `none` — all 42 (41 `improves-accuracy` + the one `unlocks`); T0/T1/T2 all presuppose it |
| 2 | does AOT output map templates at expression precision? | `undetermined` — `BL:416`, `IFC:321` U2; already a named refusal token at `MX:240`, `MX:250-253` | §3.1, §3.2, and all 17 T2 rows (`M040`, `bM058`, `bM061`, `bM063`, `bM068`, `bM069`, `bM072`, `bM078`, `bM084`, `bM085`, `bM091`–`bM094`, `bM107`, `bM120`, `bM122`) |
| 3 | is `web-tree-sitter` + grammars installable and runnable in a module worker, and what does a 1–5 MB bundle cost? | `undetermined` — `BL:417-418`, `IFC:326` U7 | every T3 row, including the only `unlocks` (`bM098`) |
| 4 | does MV3 CSP permit the Wasm path? | unmeasured, already flagged — `BL:36` | T3 entirely |
| 5 | what does the production panel build cost when the same questions are asked of the extension itself? | `undetermined` — Q4 item 4, `BL:419` | the AR-7 self-inspection route, which is the safest place to prove T0–T2 (`BL:49`) |
| 6 | does Vitest Browser Mode already serve original modules? | not measured anywhere in this repository | §3.4 / `bM116` — decides `improves-accuracy` vs `unlocks` vs `none` |
| 7 | per-finding or per-load `cannot-tell` slot for static findings | `undetermined` — `MX:267` | the shape of every static finding's refusal |
| 8 | does the injector-reachable surface change at all under a map? | measured: no — `MX:196-204` | nothing; recorded so this document is not read as reopening it |
