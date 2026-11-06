# Angular AI DevTools Tutor (N27): design

> Status: proposal — the tutor is not implemented; this document describes planned design, not shipped behaviour.

Date: 2026-10-12. Author: a design subagent of Claude, for Lars. Status: design only, nothing built or run.

Labels, as in `docs/feature-proposals.md`:

- **[measured]**: read in source or run in Lars's browsers, with the file that records it.
- **[documented]**: stated in vendor documentation or in a `research/` file that quotes it, not checked by a run.
- **[inferred]**: reasoned from measured or documented facts, not run.
- **[inferred design]**: a design choice made here.
- **[inferred recommendation]**: a ranking or priority made here.
- **[inferred; not sourced in `research/`]**: from Claude's general knowledge (mostly tutoring practice in other learning tools), not checked against any file in this repository.

Section references such as "3.3" or "N1" point to `docs/feature-proposals.md`; "01", "05" and so on point to `research/01-...`, `research/05-...`.

## Contents

1. Scope and binding rules
2. Learning loop
3. Curriculum
4. Division of work between deterministic code and built-in AI
5. State and persistence
6. UI
7. Model routing and failure
8. Tiers and dependencies
9. Tutor features beyond the initial sketch
10. Risks and spikes
11. Summary row and N27 text for the proposals

---

## 1. Scope and binding rules

### 1.1 What the tutor is

The tutor teaches modern Angular on the app that the learner already has open: the learner reads a short concept, sees it highlighted in the live page, predicts what the app will do, acts in the app, and the extension measures what the app did and compares it with the prediction. Nobody writes code in the tutor, and the tutor writes none.

It is modelled on Angular's AI tutor, which is a different kind of thing:

|                           | Angular AI tutor (CLI MCP server)                                                                                                                           | Angular AI DevTools Tutor (N27)                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Where it runs             | A coding agent's persona, through the CLI MCP server's `ai_tutor` tool **[documented, 02 section 4.4; tool in source at `ai-tutor.ts:14`, 02 section 4.6]** | A tab in the extension's DevTools panel, on the on-device model                     |
| What the learner works on | A new "Smart Recipe Box" project made with `ng new` **[documented, 02 section 4.4]**                                                                        | Whatever supported app is open in the tab                                           |
| Exercise                  | Write code for a step                                                                                                                                       | Predict, act in the app, observe; pick from lists or from the page, never type code |
| Check                     | The agent reads project files **[documented, 02 section 4.4]**                                                                                              | Plain TypeScript compares the prediction with runtime data measured in the page     |
| Kept from it              | Concept, example, exercise, check; hints; step mode; levels 1-10; skip and jump; resume; the five phases **[documented, 02 section 4.4]**                   | All of these, with different mechanics (sections 2 and 3)                           |

Proposals section 1 says the AI tutor "has no runtime counterpart in a devtools extension" **[inferred, there]**. That holds for a port of the CLI tutor, which needs project files and code writing. This design is a different tutor that needs neither, so that sentence needs a revision when N27 lands (Claude edits the proposals).

### 1.2 Rules that bind this design

From Lars's rulings in proposals section 8 and the brief:

- Browser extension only, and no code generation of any kind, not even at runtime (ruling of 2026-10-12, "2:"). The tutor's shipped text names APIs (`computed`, `linkedSignal`) and patterns; it holds no code written for the app, and every model output passes a code-shape filter (section 4.5) **[inferred design]**.
- Findings and lessons name the "modern Angular pattern" and why (ruling "1:"). The tutor's anti-pattern lessons reuse that wording.
- Supported apps are zoneless, standalone Angular 22.2 dev builds (section 1 of the proposals). So no lesson teaches Zone.js change detection, NgModules, template-driven or Reactive Forms, decorator inputs or decorator queries; the tutor shows the same "not supported" notice as the chat (3.3) and no lessons on an unsupported app **[inferred design]**.
- Writes from chat sit behind a per-action confirm, with a read-only switch (Decision 3, 3.5). The tutor has one kind of write, the "Show me" demonstration (section 9, T7), and it uses the same confirm and the same switch **[inferred design]**.
- Tier 1 is allowed, labelled and feature-detected (Decision 1).
- Grading is deterministic code comparing the learner's answer with measured runtime data, never the model (brief, item 1).

### 1.3 The three rules this design follows for the model

1. **Code finds, chooses and grades; the model words.** Every fact the learner sees is computed by code: which components were checked, which signals changed, which injector provides a token, whether the prediction was right. The model rewords shipped text to the learner's level and explains a gap that code already measured **[inferred design]**.
2. **The proposed tutor can run with no model.** Every card has shipped text, and every grade has a templated feedback text filled from the measured facts. The model's text replaces them when it is ready and passes the output checks (4.5). So an unsupported model (Nano on the CPU backend, 3.3) gives a complete tutor in text-only mode, and a slow model never blocks a card **[inferred design]**. This matters because a single structured-output question measured 25-34 s median on Gemma 4 CPU and 11-14 s on Gemma 4 GPU **[measured, 2.1 benchmark table]**.
3. **The core loop needs no tool calling.** Code knows which data each step needs before it calls the model, so the model gets a pre-computed fact sheet in one structured-output prompt with no tools. Tool calling is used only by "Ask the tutor" (section 7), which is the chat loop of 3.3 **[inferred design]**.

---

## 2. Learning loop

### 2.1 Stages

Each lesson runs these stages in order. "Code" is plain TypeScript; "page agent" is the MAIN-world script of 3.1; "panel" is the extension's DevTools panel page.

| #   | Stage                                                     | What the learner sees and does                                                                                                                                            | What code does                                                                                                                                                                   | What the model does                                                                                    |
| --- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1   | Concept                                                   | A card of 60-150 words, shipped with the extension                                                                                                                        | Picks the shipped segments for the learner's level (2.4)                                                                                                                         | Optional: rewords the card to the level (call kind K1, section 4.2)                                    |
| 2   | Live example                                              | The concept's example in this app, highlighted on the page, with a one-line caption                                                                                       | Finds the best example by the lesson's precondition and ranking rule (3.2); builds the caption from facts ("`app-cart-summary` reads `total`, which is a `computed` of `items`") | None                                                                                                   |
| 3   | Exercise                                                  | A question with a pick control (2.2); a confidence choice (T6, section 9)                                                                                                 | Builds the options from real nodes, including plausible wrong options (2.3); locks the prediction before the act stage                                                           | None                                                                                                   |
| 4   | Act and observe                                           | The learner does one thing in the app (click, type, navigate), or presses "Show me" for a demonstration behind a confirm (T7); the page shows what happened as it happens | Records with the capture the lesson names (2.5); closes the observation window by rule (2.5)                                                                                     | None                                                                                                   |
| 5   | Check                                                     | Right or wrong, with picked, missing and extra items marked on the list and on the page                                                                                   | Grades (2.6); classifies the wrong answer against the lesson's misconception list (T1, section 9); fills the feedback template                                                   | Optional: explains the gap between prediction and observation in at most 400 characters (call kind K2) |
| 6   | Hints (on a wrong answer, or on request before answering) | Up to three hints, in order                                                                                                                                               | Hint 1 is shipped text; hint 2 is shipped text with blanks filled from the data ("look at the components that read `query`"); hint 3 reveals the answer on the page              | Optional: rewords hints 1 and 2 to the level (K1)                                                      |
| 7   | Recap                                                     | Two lines: what was learned and where to see it again in this app                                                                                                         | Builds the recap from the grade and the example key; schedules a review (T4, section 9)                                                                                          | None                                                                                                   |

After a wrong answer the learner can try again on the same exercise. The page has changed by then, so code rebuilds the options from the new state and re-arms the capture **[inferred design]**.

### 2.2 Exercise types (no code)

| Type       | Learner action                                                                         | Example question                                                                    | Grader input                              |
| ---------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------- |
| `pick-set` | Tick items in a list built by code                                                     | "Click the + button once. Which components will Angular check?"                     | Set of component keys                     |
| `pick-one` | Choose one item                                                                        | "Which injector provides `CartService` to this component?"                          | One key                                   |
| `order`    | Put items in order with move-up and move-down buttons (keyboard operable)              | "Order these signals from the writable source to the template that shows the total" | Ordered list of keys                      |
| `value`    | Enter a number, or choose from an `enum` list                                          | "After one click, what value will `double` show?"                                   | A scalar; never an expression             |
| `locate`   | Click a component on the page in pick mode, or select an element in the Elements panel | "Find a component whose template reads a `computed` with two producers"             | One component key, checked by a predicate |
| `classify` | Choose a label for each of 2-5 items                                                   | "For each effect: does it only write another signal?"                               | Map from key to label                     |

`value` takes a number or an `enum` item only. The input field rejects any other text **[inferred design]**, so the exercise cannot become a place to type code.

Predict-then-observe (`pick-set`, `value`, `order` with an action) is the main type, because it makes the learner commit before the app answers and then shows the measured answer on the same page. Predict-observe-explain is a known science-teaching method **[inferred; not sourced in `research/`]**; the `order` type is close to the Parsons problems of programming courses, applied to runtime facts instead of code lines **[inferred; not sourced in `research/`]**.

### 2.3 How code builds the options

- Options are real items from the page: component keys from `find_components`, signal labels from `list_signals`, injectors from `di_path` (3.4) **[inferred design]**.
- Wrong options are chosen by rule, not at random: for "which components will be checked", siblings and ancestors of the right answers that read no signal the action writes; for "which signals change", producers of a changed node that do not change. Plausible wrong options come from the same graph slice as the right ones (4.3) **[inferred design]**.
- The level sets the number of options (2.4).
- Keys, not ids: an option is keyed by component class name (with the dev-build leading underscore stripped, as `find_components` does, 3.4) plus host position for repeated components, and a signal by `<component key>#<label>`. The ids from 3.4's `WeakMap` reset on every page load, so they are kept only for the current page **[inferred design]**.

### 2.4 Levels 1-10

Levels change mostly code-chosen parameters; the model only rewords **[inferred design]**:

| Levels | Shipped segments shown                                                                    | Exercise parameters                                                                          | Hints                                               | Model wording (K1)                      |
| ------ | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------- |
| 1-3    | Core text plus the novice addendum (defines each term the first time)                     | 2-3 options per answer set, chain depth 1, at most 2 wrong options                           | Hint 1 shown with the question                      | Plainer words, each term explained once |
| 4-7    | Core text                                                                                 | 3-5 options, chain depth 2                                                                   | On request                                          | Shipped wording kept, shortened if long |
| 8-10   | Core text plus the expert note (edge cases, the source file in Angular named in the note) | 4-6 options, chain depth up to 3, includes a near miss (a node that changes but is not read) | On request; hint 3 only after a second wrong answer | Shorter, assumes the terms              |

- Start level: chosen by the learner on first open, or set by a three-exercise placement check graded by code (T9, section 9).
- Changes: after three first-try passes in a row, the tutor offers one level up; after two revealed answers in a row, one level down. The learner confirms each change **[inferred design]**.
- The level also filters lessons: each lesson has a minimum level, and lessons under the level stay available but are marked as review **[inferred design]**.

### 2.5 Capture and the observation window

- Capture kinds, each built on a 3.4 tool or its data source:
  - `cd-cycles`: per cycle, the trigger and the set of components whose template ran, from `ng.ɵsetProfiler` callbacks, which receive the event and the instance (26 events, `profiler_types.ts:17-157`) **[measured in source, 02 section 1.2]**. That the template-update events give a per-component "template ran" set is what N1 assumes **[inferred in N1, not run]**.
  - `signal-diff`: `ng.ɵgetSignalGraph` before and after, per component in the lesson's slice; nodes carry `epoch` and `value` (`{kind, id, epoch, label?, value?, debuggableFn?, watched?}`) **[measured in source, 02 section 1.2]**. A node changed when its `epoch` or its value preview changed **[inferred design]**.
  - `defer-state`, `router-events`, `form-state`, `error-events`: from `defer_blocks`, `router_state`, N15's `FormField.state()` (spike S9) and N4's error hooks.
- The profiler subscriber is added only while a lesson records, and removed with the remover it returns; the tutor never calls `ɵsetProfiler(null)` (2.2) **[documented rule, proposals 2.2]**.
- The window opens when the learner locks the prediction and closes at the first of: no `ChangeDetectionStart` for 750 ms after the last `ChangeDetectionEnd` with no resource node in a loading state; the learner presses "Done"; or 10 s. The 750 ms and 10 s values are guesses to tune in spike TS6 **[inferred design]**.
- During the window the page agent only appends small records to an array; slicing, diffing and grading run after it closes, in the panel (4.4), so the tutor's own work does not add change-detection cycles or main-thread time while the app is being observed **[inferred design]**. The highlight overlay sits outside the app's DOM tree (6.3), so it should not trigger Angular change detection **[inferred]**; spike TS7 checks it.

### 2.6 Grading

Graders are pure functions shipped with the extension. Each returns one shape **[inferred design]**:

```ts
interface Grade {
  correct: boolean;
  score: number; // 0..1; for sets: Jaccard of picked and observed
  picked: string[]; // keys
  observed: string[]; // keys, from the capture
  missing: string[]; // observed, not picked
  extra: string[]; // picked, not observed
  misconception?: string; // id from the lesson's misconception list (T1)
  facts: Fact[]; // the facts that explain each missing and extra key
}
interface Fact {
  subject: string;
  relation: string;
  object: string;
  value?: string;
}
// e.g. {subject: 'app-cart-summary', relation: 'reads', object: 'total'}
```

- `pick-set`: correct when `missing` and `extra` are empty.
- `order`: correct when the sequence equals the observed chain; partial score by longest common subsequence.
- `value`: equality after the same parse as `set_writable_field` uses for the field's type (3.4); numbers compare exactly unless the lesson declares a tolerance.
- `locate`: the lesson's precondition predicate (3.2) holds on the picked component.
- `classify`: per-item equality; score is the share right.
- For each `missing` and `extra` key, the grader adds the facts that explain it: for a component checked but not picked, the chain from the written signal to the signal its template reads; for one picked but not checked, "reads no signal that changed" **[inferred design]**.

### 2.7 Step mode, skip, jump and resume

- Step mode on: each stage in 2.1 is its own card with a "Next" button. Step mode off: concept and example share a card, and the check shows under the exercise **[inferred design]**.
- Skip marks a lesson `skipped`, not `passed`. Jump opens any lesson that is eligible on this page; prerequisites are advice ("recommended after S2"), never a lock **[inferred design]**.
- Resume reads `chrome.storage.local`, not project files (section 5).

---

## 3. Curriculum

### 3.1 Lesson shape

Lessons are data shipped with the extension. Their text is written by hand; the model never writes a lesson **[inferred design]**.

```ts
interface Lesson {
  id: string; // 'P2-computed'
  phase: 1 | 2 | 3 | 4 | 5; // the CLI tutor's five phases
  title: string;
  minLevel: number; // 1..10
  minAngular: string; // '22.0.0'
  tier: 0 | 1; // proposals 2.2
  needs: { router?: true; ssr?: true; marks?: string[]; spike?: string };
  precondition: string; // id of a predicate in the shipped predicate table
  exampleRank: string; // id of a ranking rule: which match makes the clearest example
  recommendedAfter: string[]; // lesson ids; advice only
  concept: ShippedText;
  exercise: Exercise;
  misconceptions: { id: string; when: string; text: ShippedText }[]; // `when`: id of a grade pattern
  reuses: string[]; // proposals feature ids, e.g. ['N1', 'N2']
}
interface ShippedText {
  core: string;
  novice?: string;
  expert?: string;
  protected: string[]; // API names, labels and values the wording must keep (4.5)
}
interface Exercise {
  type: 'pick-set' | 'pick-one' | 'order' | 'value' | 'locate' | 'classify';
  question: ShippedText; // may hold slots filled by code: {component}, {signal}
  action?: string; // what the learner does, as text with slots
  capture: string; // capture kind (2.5)
  grader: string;
  options: string; // option-builder rule (2.3)
  hints: [ShippedText, ShippedText]; // hint 3 is always the reveal
  feedback: { right: ShippedText; wrong: ShippedText }; // templates with slots
}
```

Predicates and ranking rules are named functions in the extension's code, not text the model reads or writes **[inferred design]**.

### 3.2 Preconditions

A lesson appears only when its predicate holds on the current page. Predicates run in the panel over the snapshot that the page agent sends (4.4) **[inferred design]**. Examples:

| Predicate                                           | Holds when                                                                                                 |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `has_components(2)`                                 | `find_components` returns at least 2 components                                                            |
| `has_signal_input`                                  | some component has an input that passes `ng.isSignal` (Tier 0, as N10's `@Input()` rule)                   |
| `has_template_listener`                             | `ng.getListeners` on some component host returns a template listener                                       |
| `has_computed_with_producer`                        | some component's graph has a `computed` node with at least one producer that is not library-internal (3.4) |
| `has_chain(d)`                                      | some template reads a node whose producer chain to a writable signal has length `d` or more                |
| `has_effect`                                        | some graph has an effect node                                                                              |
| `has_effect_write`                                  | N2's `debuggableFn` scan finds a `.<name>.set(` or `.<name>.update(` in an effect (from 22.1.3)            |
| `has_linked_signal`, `has_resource`, `has_tosignal` | a node of that kind, or `Resource#` / `toSignal.*` labels (N14, N25)                                       |
| `has_for_block`                                     | `ɵgetControlFlowBlocks` lists a `@for` block                                                               |
| `has_defer_block`                                   | `ɵgetControlFlowBlocks` lists a `@defer` block                                                             |
| `has_component_provider`                            | some node injector on a resolution path has a provider record other than the six special tokens (3.4)      |
| `has_router`                                        | `ng.ɵgetRouterInstance` is a function (`provideRouter` apps)                                               |
| `has_route_resources`                               | a route in the router config has `resources` (N17)                                                         |
| `has_ssr_hydration`                                 | `app_facts` reports hydration on                                                                           |
| `has_signal_form`                                   | the `NgSignalForms` mark plus a `[formField]` element whose state reads (N15, spike S9)                    |
| `has_ng_error`                                      | N4's hooks captured an `NG0`/`NG0xxxx` error on this page load                                             |
| `has_finding(rule)`                                 | N2, N10 or N24 reports a finding for `rule`                                                                |

The scan also records, per route path, which lessons were eligible there, so the tutor can say where it saw a lesson that does not fit the current page (5.2, 7.3) **[inferred design]**.

### 3.3 Lessons

The design calls for 27 lessons across five phases, plus an orientation lesson (O0, the app tour, T3 in section 9) and the lessons made from findings (T2, section 9), which reuse the anti-pattern lessons below. The phase names are the CLI tutor's **[documented, 02 section 4.4]**; the lessons are this design's **[inferred design]**.

Phase 1, fundamentals:

| Id         | Lesson                          | Precondition                            | Exercise                                                                                                                                                      | Data                                               |
| ---------- | ------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| P1-tree    | Components on the page          | `has_components(2)`                     | `locate`: click the component that renders a given visible text                                                                                               | `find_components`, `ng.getHostElement`             |
| P1-owner   | Owner and host                  | `has_components(3)` and one owned child | `pick-one`: who owns the highlighted component                                                                                                                | `ng.getOwningComponent`                            |
| P1-inputs  | Signal inputs carry values down | `has_signal_input`                      | `value`: the value of a named input, then check; for a value that is not a number, code builds an `enum` of the real value plus wrong values of the same type | `inspect_component`                                |
| P1-outputs | Outputs and template listeners  | `has_template_listener`                 | `pick-one` with an action: which component's listener runs on a click                                                                                         | `component_listeners`, `cd-cycles` (`OutputStart`) |
| P1-for     | `@for` and `track`              | `has_for_block`                         | `value` with an action: how many items render after the action; `classify`: is `track` the item itself or a field                                             | `ɵgetControlFlowBlocks` (`trackExpression`)        |

Phase 2, state and signals:

| Id          | Lesson                                   | Precondition                                                           | Exercise                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Data                                      |
| ----------- | ---------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| P2-reads    | What a template reads                    | `has_computed_with_producer` or one writable signal read by a template | `pick-set`: the signals this template reads                                                                                                                                                                                                                                                                                                                                                                                                                                               | `list_signals`, slice (4.3)               |
| P2-computed | `computed` recomputes from its producers | `has_computed_with_producer`                                           | `pick-set` with an action: which signals change                                                                                                                                                                                                                                                                                                                                                                                                                                           | `signal-diff`                             |
| P2-chain    | Derivation chains                        | `has_chain(2)`                                                         | `order`: source to template                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `signal_trace`                            |
| P2-effect   | `effect` against `computed`              | `has_effect`                                                           | `classify`: for each effect, does it only write another signal (the modern Angular pattern for that is `computed` or `linkedSignal`, and why, as N2 words it). N2's scan is a heuristic (it misses writes through helper methods, writes without `this.`, and minified code), so the items include only effects where the scan is decisive: a `.set(` or `.update(` hit, or source text with no call of either; the card says the classification is the extension's reading of the source | N2 write scan                             |
| P2-linked   | `linkedSignal` resets with its source    | `has_linked_signal`                                                    | `value` with two actions: does a manual set survive a source change                                                                                                                                                                                                                                                                                                                                                                                                                       | `signal-diff` (N19)                       |
| P2-resource | Resource states                          | `has_resource`                                                         | `order` with an action: the states the resource passes through                                                                                                                                                                                                                                                                                                                                                                                                                            | `Resource#` nodes sampled per cycle (N14) |
| P2-interop  | Where the graph stops at RxJS            | `has_tosignal`                                                         | `pick-one`: the node where the graph ends                                                                                                                                                                                                                                                                                                                                                                                                                                                 | N25                                       |

Phase 3, component architecture:

| Id          | Lesson                                                               | Precondition                                                          | Exercise                                                                                | Data                                            |
| ----------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------- |
| P3-cd       | What Angular checks after a click, in a zoneless app (worked in 3.4) | `has_template_listener` and `has_computed_with_producer`              | `pick-set` with an action                                                               | `cd-cycles`, `signal-diff` (N1)                 |
| P3-onpush   | OnPush is the default; `Eager` checks every cycle                    | `has_components(2)`; the contrast part only with an `Eager` component | `pick-set` with an action: which components run although they read nothing that changed | `getDirectiveMetadata`, `cd-cycles` (N10, EXT1) |
| P3-stale    | A plain field written outside change detection                       | `has_finding('N24')`                                                  | `value`: what the page shows against what the instance holds                            | N24                                             |
| P3-di-path  | The resolution path                                                  | `has_component_provider`                                              | `classify`: injector kind for each step of the path                                     | `di_path` (N3)                                  |
| P3-di-where | Where a token resolves                                               | `has_component_provider`                                              | `pick-one`: which injector provides the token                                           | `di_lookup` (N3), with its flag caveat (3.4)    |
| P3-shared   | One instance or two                                                  | two components on the page inject the same token                      | `pick-one`: same instance or not                                                        | `di_lookup` on both paths (N3)                  |

Phase 4, advanced features:

| Id           | Lesson                                  | Precondition                              | Exercise                                                                                       | Data                                    |
| ------------ | --------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------- |
| P4-defer     | `@defer` triggers                       | `has_defer_block`                         | `value` (an `enum` of states) with an action: the block's state after scrolling or interacting | `defer_blocks` (N5, EXT3)               |
| P4-hydration | Incremental hydration                   | `has_ssr_hydration` and `has_defer_block` | `pick-set`: which blocks are still dehydrated                                                  | `defer_blocks`, `hydration_status` (N5) |
| P4-routes    | Routes and lazy loading                 | `has_router`                              | `pick-one` with a navigation: does it load a lazy route                                        | `router_state`                          |
| P4-guards    | Guards with `canMatch`                  | `has_router` and a route with guards      | `pick-set` with a navigation: which guards run                                                 | `router_state`                          |
| P4-blocking  | Router resources that hold a navigation | `has_route_resources`                     | `pick-one`: which resource held the navigation                                                 | N17                                     |
| P4-errors    | `NG0` errors and their owner            | `has_ng_error`                            | `pick-one`: the owning component; `pick-one`: the error page's category                        | N4, EXT2                                |

Phase 5, Signal Forms (all wait on spike S9):

| Id        | Lesson                   | Precondition                               | Exercise                                                                 | Data               |
| --------- | ------------------------ | ------------------------------------------ | ------------------------------------------------------------------------ | ------------------ |
| P5-state  | Field state              | `has_signal_form`                          | `classify` with typing in the app's own field: valid, invalid or pending | `form-state` (N15) |
| P5-submit | Why submit is blocked    | `has_signal_form`                          | `pick-one`: the blocking field                                           | N15                |
| P5-async  | Pending async validation | `has_signal_form` and a pending state seen | `order`: the states a field passes through                               | N15                |

Left out on purpose: an error-boundary lesson until spike S10 settles N16's route (proposals section 7); a stability lesson, because N22 is Tier 2 **[inferred design]**.

### 3.4 One lesson in full: P3-cd

- **Concept (core, shipped):** "In a zoneless app, Angular runs change detection when something tells it to: a template listener, a signal that a template reads, or an explicit call. With OnPush, the 22.x default, a component's template runs when a signal it reads has changed, when an input it receives has changed, or when one of its own template listeners has handled an event." Protected terms: `OnPush`, `zoneless`. The OnPush default is **[measured, `CHANGELOG.md:859`, 02 section 5.2]**; that a handled template event marks its own component for a check is **[inferred; no source line in `research/`]**, and spike TS1 confirms it, because the grader and the `listener-only` misconception both count the listener's component as checked. Novice addendum defines "template" and "signal". Expert note: the scheduler and `ChangeDetectionStart` in `profiler_types.ts`.
- **Example (built by code):** the component whose listener the action will hit, highlighted, with the caption "`<listener component>` handles the click; `<reader>` reads `<computed>`".
- **Exercise:** `pick-set`. Question: "Click `<button text>` once. Which components will Angular check?" Options: every component on screen within two levels of the listener's component, up to the level's option count, with at least one reader of a changed signal and one non-reader.
- **Capture:** `cd-cycles` plus `signal-diff` on the slice around the written signal.
- **Grader:** set comparison of picked against the components whose template ran in the cycles in the window.
- **Misconceptions (T1):** `parent-checks-children` (picked every child of the listener's component), `listener-only` (picked only the listener's component), `all-on-screen` (picked everything).
- **Feedback template (wrong, shipped):** "You picked {picked}. Angular checked {observed}. {for each missing: '{c} was checked because it reads {s}, which depends on {w}.'} {for each extra: '{c} was not checked: it reads no signal that changed.'}"
- **Model call (K2):** rewrites that template's filled text as at most three sentences for the level, from the fact sheet in 4.3.
- **Tier 1, reuses N1 and N2.**

---

## 4. Division of work between deterministic code and built-in AI

### 4.1 Where code runs

| Context                                          | Runs                                                                                                                                                                                                             | Why there                                                                                          |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Page agent (MAIN world)                          | Reads `window.ng`, the DOM, `ɵsetProfiler` callbacks, error hooks; builds compact snapshots (keys, kinds, labels, value previews capped at 200 characters and redacted as 3.4 says); draws highlights; pick mode | `window.ng` is visible only in the MAIN world (3.1)                                                |
| Isolated content script                          | Relays and caps messages (3.1)                                                                                                                                                                                   | As in 3.1                                                                                          |
| Panel page (DevTools panel)                      | Lesson state, eligibility, option building, grading, fact sheets, output checks, the model sessions, `chrome.storage`                                                                                            | The session must live in a panel or side panel, never the `devtools_page` **[measured, S1 in 11]** |
| Dedicated Worker started by the panel (optional) | Eligibility over every component, graph slices, chain search, distractor search                                                                                                                                  | Keeps large scans off the panel's main thread (4.4)                                                |

### 4.2 Model call kinds

| Kind | Purpose                                            | API                                                                      | Input                                                    | Output                                        | Tools           |
| ---- | -------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------- | --------------------------------------------- | --------------- |
| K1   | Reword shipped text to the level                   | Rewriter where available; otherwise Prompt API with `responseConstraint` | One shipped text, the level description line             | `{text}`, at most the shipped length plus 30% | none            |
| K2   | Explain the gap between prediction and observation | Prompt API with `responseConstraint`                                     | Concept summary, fact sheet, grade                       | `{text}`, `maxLength` 400 characters          | none            |
| K3   | "Ask the tutor": a free question during a lesson   | The chat loop of 3.3, with the lesson as the context chip                | Question plus chip                                       | Answer with the tool walkthrough (3.3 step 4) | 3.4 tool groups |
| K4   | One sentence per chunk for the app tour (T3)       | Prompt API with `responseConstraint`                                     | One chunk's fact sheet                                   | `{sentence}`, `maxLength` 200                 | none            |
| K5   | Language                                           | Translator, Language Detector                                            | Shipped text or K1/K2 output with protected terms masked | Text in the learner's language                | none            |

- Every K1, K2 and K4 call runs on a fresh `clone()` of a warm tutor base session that holds only the tutor's system prompt, so no history builds up and the oldest-pair eviction of `contextoverflow` cannot remove the question (3.3 step 5) **[inferred design; clone keeps the source's context, documented, 01]**.
- Rewriter's options are not described in any `research/` file; 01 lists its status only, and 00 measured it `available` in Chrome stable 154's page and in Edge Dev 157's page, and `downloadable` in Chrome Beta 156 before the model download **[measured, 00]**. DevTools gives extension panels `rewriter` and `translator` in the iframe `allow` list **[documented, 01 section 3, `ExtensionView.ts`]**; Rewriter in the panel was not run. So K1 detects Rewriter at runtime and falls back to the Prompt API, then to shipped text **[inferred design]**. That Rewriter takes a tone, a length and a free-text context is **[inferred; not sourced in `research/`]**, and the level line would go in that context.
- The Prompt API accepts `en`, `ja`, `es`, `de` and `fr` as expected languages in Chrome **[documented, 01 section 1]**, so tutor prompts run in English and K5 translates the result **[inferred design]**.

### 4.3 Keeping each call inside the window

The windows are 7,168 tokens on Aion and 9,216 on the Chrome models and Phi-4-mini **[measured, 05]**. The tutor's calls are far smaller than that, by construction:

| Part                                     | Budget                                                                                           | Basis                                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Tutor system prompt                      | about 120 tokens                                                                                 | 07 6.1's chat prompt is 116 Aion tokens **[measured, 07]**; the tutor's is the same size **[inferred]**                            |
| Level line                               | about 30 tokens                                                                                  | **[inferred]**                                                                                                                     |
| Concept summary (K2)                     | at most 80 tokens                                                                                | the card's first sentence **[inferred design]**                                                                                    |
| Fact sheet                               | at most 400 tokens (about 1,600 characters at 4 per token; Aion averages 4.5 **[measured, 07]**) | **[inferred design]**                                                                                                              |
| Grade (picked, observed, missing, extra) | at most 120 tokens                                                                               | **[inferred design]**                                                                                                              |
| Schema                                   | unknown until measured                                                                           | the schema is added to the prompt unless `omitResponseConstraintInput` is set **[documented, 01]**; its cost is experiment E5 (07) |
| Answer                                   | `maxLength` 400 characters, about 100 tokens                                                     | **[inferred design]**                                                                                                              |

That totals about 1,000 tokens plus the schema per K2 call **[inferred]**. The same exchange cost 1,007 tokens on Gemma 4 and 285 on Aion **[measured, 00]**, so the budget is checked, not assumed: before each `prompt()` the panel calls `measureContextUsage(input, {responseConstraint})`; above 2,000 tokens it trims the fact sheet in a fixed order (wrong-option facts first, then values, then facts about keys the grade does not name) and measures again; if still above, it shows the shipped text **[inferred design]**.

How the fact sheet stays small:

- **Pre-computed facts, not data.** The model gets "`app-cart-summary` reads `total`; `total` depends on `items`; `items` was written by the click listener of `app-cart-item`", never a graph **[inferred design]**. Neither Aion nor Gemma 4 can be trusted to read index-linked structures (one run each) **[measured, 05 S2 and 00; the trust conclusion inferred in 3.4]**.
- **Graph slices around one node.** From the lesson's focus node: producers up to the level's chain depth (1-3), consumers one step, only the focus component's template and effects; library-internal nodes dropped and counted (3.4); at most 20 nodes; values as `<page>` strings capped at 200 characters and redacted (3.4) **[inferred design]**.
- **Chunked processing with a deterministic merge.** Whole-page work never goes to the model. On the portal's `/contract/list` the compact signal graphs of all components are 54,597 characters, about 14K tokens, and one component holds up to 80 nodes **[measured, 05 S3]**. So eligibility (3.2), example ranking and the per-route record run in code over per-component chunks, and code merges the results (union of capabilities, maximum chain depth). Where text is needed per chunk (the tour, T3), the model writes one sentence per chunk from that chunk's facts, and code joins the sentences in tree order; the model is never asked to merge **[inferred design]**.
- **One model call at a time.** S1 ran sessions one at a time; concurrent prompts were never measured **[measured, 11]**. The panel keeps one queue with two priorities: a call the learner is waiting on goes first; background calls (rewording the next card while the learner reads this one) go after, and are cancelled with an `AbortSignal` when the learner moves on **[inferred design; abort semantics documented, 01]**.

### 4.4 Where a Worker helps, and the open question

- What a Worker can do: a Worker cannot touch `window.ng` or live component instances, and a page-side Worker would be bound by the page's CSP **[inferred]**. So the page agent always extracts the snapshot in the MAIN world and posts plain data out. Everything after that (eligibility over all components, slices, chain and distractor search, grading) can run in the panel or in a dedicated Worker the panel starts **[inferred design]**.
- When to use it: on pages the size of `/contract/list` (892 signal nodes, 47 components **[measured, 05 S3]**), the full eligibility scan is the only tutor computation large enough to block the panel's UI; the Worker keeps the panel responsive while it runs. On small pages the panel's main thread is enough **[inferred]**. This Worker needs no built-in AI API, so it does not depend on the open question below.
- The open question Claude is checking separately: whether the Prompt API is exposed in a dedicated worker started from an extension page. S1 measured window contexts, the service worker and the offscreen document, not dedicated workers **[measured, 11]**. 01 records both that the API "isn't available in Web Workers" on the web (C1) and that Chromium force-enables `AIPromptAPIForWorkers` in extension processes (X1) **[documented, 01 sections 1 and 3]**. This design does not depend on the answer: the model runs in its own process (S1 measured model-process crashes, 11), so an awaited `prompt()` does not block the panel's main thread **[inferred]**, and the tutor runs one call at a time (4.3), so a model session in a Worker would gain little **[inferred]**. If the answer is yes, one use is worth a spike: running the K4 tour chunks in the Worker so the panel's session stays free for the learner's own calls, which only helps if two sessions can run at once (unmeasured).
- Answered 2026-10-19: yes. A dedicated worker started by the DevTools panel has `LanguageModel` and answers in all four browsers, with or without feature flags **[measured, `research/19`, `research/20`]**. K5 still runs in the panel: the Translator and Language Detector crash the extension renderer when called in a worker **[measured, 20; `docs/filing-ledger.md` item 11]**.

### 4.5 Output checks (all deterministic)

Every K1, K2 and K4 output passes three checks before it replaces the shipped or templated text; any failure keeps the shipped text and is counted locally **[inferred design]**:

1. **Protected terms kept:** every term in the text's `protected` list (API names, labels, keys, values in the fact sheet) that appears in the input appears in the output.
2. **Nothing new:** every identifier in backticks and every number in the output appears in the fact sheet, the grade or the shipped text. This catches an invented signal name or value, the failure kind measured as bad arguments in 2.1 **[inferred design]**.
3. **No code:** the output has no fenced block and no line that looks like code (an assignment, an arrow, a semicolon at line end, a call with arguments in backticks longer than a name). This enforces Lars's no-code ruling at runtime **[inferred design]**.

A rejected output is not retried: Aion decodes greedily, so the same input gives the same output **[inferred, 07 section 1.4]**.

### 4.6 Per step: code or model

| Step               | Plain TypeScript (where)                                       | Built-in AI (which API)                            | Window fit                               |
| ------------------ | -------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------- |
| Support check      | `app_facts` zone-mode and NgModule checks (page agent; 3.3)    | none                                               | n/a                                      |
| Model check        | 3.3's startup check, structured-output canary (panel)          | Prompt API                                         | 3.3                                      |
| Eligibility scan   | predicates over per-component chunks, merged (panel or Worker) | none                                               | no model                                 |
| Example choice     | ranking rule (panel)                                           | none                                               | no model                                 |
| Concept card       | segment choice by level (panel)                                | K1: Rewriter or Prompt API                         | one card, under 700 tokens               |
| Options            | option builder over the slice (panel)                          | none                                               | no model                                 |
| Capture            | profiler and graph reads (page agent)                          | none                                               | no model                                 |
| Grade              | grader (panel)                                                 | none                                               | no model                                 |
| Feedback           | template filled from the grade (panel)                         | K2: Prompt API, structured output                  | about 1,000 tokens plus schema, measured |
| Hints 1-2          | shipped text, slots filled (panel)                             | K1                                                 | small                                    |
| Hint 3             | reveal on the page (page agent)                                | none                                               | no model                                 |
| Misconception (T1) | pattern match on the grade (panel)                             | none; its text is shipped                          | no model                                 |
| Ask the tutor      | 3.3's loop and tools (panel, page agent)                       | K3: Prompt API, routed by 3.3                      | 3.3's budget rules                       |
| Tour (T3)          | chunking by route and component, ordering, joining (panel)     | K4: one sentence per chunk                         | one chunk, under 500 tokens              |
| Translation        | masking and unmasking protected terms (panel)                  | K5: Translator; Language Detector for K3 questions | per text                                 |
| Review queue (T4)  | Leitner boxes (panel)                                          | none                                               | no model                                 |

---

## 5. State and persistence

### 5.1 Storage

All tutor state is in `chrome.storage.local`, written by the panel **[inferred design]**. Nothing is read from project files, and nothing leaves the device (3.5). The planned storage shapes live in `chrome.storage.local`:

```ts
interface TutorProfile {
  // key 'tutor:profile'
  version: 1;
  level: number; // 1..10
  stepMode: boolean;
  language: string; // BCP 47, 'en' by default
  aiWording: 'auto' | 'off'; // 'off' = text-only mode by choice
}
interface LessonProgress {
  // key 'tutor:progress:<origin>:<lessonId>'
  status: 'new' | 'in-progress' | 'passed' | 'skipped';
  stage: number; // 1..7, section 2.1
  attempts: number;
  firstTryPass: boolean;
  hintsUsed: 0 | 1 | 2 | 3;
  confidence?: 'sure' | 'unsure' | 'guess'; // T6
  misconceptions: string[];
  updatedAt: string; // ISO time
}
interface OriginState {
  // key 'tutor:origin:<origin>'
  ngVersion: string;
  lastLessonId?: string;
  example?: ExampleKey;
  routesSeen: { path: string; eligible: string[]; seenAt: string }[];
}
interface ExampleKey {
  route: string;
  componentClass: string;
  hostIndex: number;
  signalLabel?: string;
}
interface ReviewItem {
  lessonId: string;
  box: 1 | 2 | 3 | 4 | 5;
  dueAt: string;
} // T4
interface TextCacheEntry {
  key: string;
  text: string;
} // key: text id + level + language + model key
```

- Keyed per origin, because the same lesson can have a different example on another app **[inferred design]**.
- Stored: class names, route paths and signal labels, which are needed to find an example again. Not stored: values, page text, or anything the 3.4 redaction would remove **[inferred design]**. A "Clear tutor data" button removes every `tutor:` key.
- The text cache holds K1 and K4 outputs that passed 4.5, keyed by the text id, the level, the language and 3.3's cache key for the model (user agent and `contextWindow`); it is capped at 200 entries, oldest out **[inferred design]**. A card the learner has seen at a level shows its adapted text at once the next time, which hides the model's latency for repeat visits.

### 5.2 Resume without project files

On panel open, after the support and model checks **[inferred design]**:

1. Read `TutorProfile`, the origin's `OriginState` and the last lesson's `LessonProgress`.
2. Run the eligibility scan on the current page.
3. If the last lesson is eligible, find the stored `ExampleKey` on the page: component class name, then host index, then signal label. Ids from 3.4 are not used, because they reset on every page load. If found, resume at the stored stage; an exercise is re-armed with a fresh prediction, because the app's state may have changed since.
4. If the lesson is eligible but the stored example is gone, offer the best other example.
5. If the lesson is not eligible here, show the routes in `routesSeen` where it was, and offer navigation to one, as a write behind the confirm (N12, 3.5).

This replaces the CLI tutor's "resumes by analyzing the code" **[documented, 02 section 4.4]** with stored progress plus a scan of the live page.

---

## 6. UI

### 6.1 Where the tutor lives

A "Tutor" tab in the extension's DevTools panel ("Angular AI", 3.1), next to the chat **[inferred design]**. The reasons:

- The panel can host model sessions **[measured, S1 in 11]**, shares the warm base session and the startup check with the chat, and is where `chrome.devtools.panels.elements.onSelectionChanged` gives the selected element for `locate` exercises (3.1).
- A side panel can host sessions too **[measured, S1 in 11]** and leaves DevTools closed, which suits a beginner, but it has no `$0` and no `inspectedWindow` **[inferred from 3.1]**. It is a later option that reuses the same components.

Layout: a phase map with the lessons (eligible, not on this page, passed, skipped, review due) on the left; the current card in the middle; the exercise controls under it; a level control and a step-mode switch in the header **[inferred design]**.

### 6.2 Entering a prediction

- `pick-set`, `pick-one`, `classify`: lists built by code (2.3), with check boxes or radio buttons. Hovering an item highlights its host on the page.
- `order`: a list with move-up and move-down buttons and keyboard shortcuts, so it works without dragging.
- `value`: a number field or a select of `enum` items, nothing else (2.2).
- `locate`: "Pick on page" mode. The page agent outlines components under the pointer and takes the next click as the answer; the click is stopped in the capture phase so the app does not receive it **[inferred design]**. The Elements panel selection is the second way: `ng.getOwningComponent($0)` (3.1, section 5 of the proposals).
- Free questions ("Ask the tutor", K3) take natural language. They are questions, not code, and they go through 3.3's loop.

### 6.3 Highlights on the page

- The page agent draws outlines and short labels in one overlay element attached to `document.documentElement`, in a closed shadow root, with `pointer-events: none`, positioned from `getBoundingClientRect()` of each host **[inferred design]**. It is outside every Angular view, so it should add no change-detection work; spike TS7 checks that the overlay adds no cycle.
- Example stage: a steady outline with the caption's key words.
- Act stage: each component whose template ran gets a short pulse as the cycle is recorded (like the "highlight updates" option of other framework devtools **[inferred; not sourced in `research/`]**).
- Check stage: picked and checked, picked and not checked, and checked and not picked get different outline styles plus a text label, so the result does not rely on colour alone; motion respects `prefers-reduced-motion` **[inferred design]**.
- "Reveal" (hint 3) outlines the right answers.
- "Show in Elements" uses `inspect()` through `chrome.devtools.inspectedWindow.eval`, as N13's source route does (Tier 0, 02 sections 2.2 and 3) **[documented, proposals N13]**.

---

## 7. Model routing and failure

### 7.1 Routing

- K1, K2 and K4 are single-turn structured-output prompts with no tools (1.3). So for the core loop, 3.3's routing rule reduces to one question: did the structured-output canary pass three times out of three? If yes, the model words the tutor; if no, the tutor runs in text-only mode **[inferred design, from 3.3]**. Native tools on Aion play no part in the core loop, and every supported model takes the same path through it.
- `responseConstraint` is measured to work on Gemma 4 (GPU and CPU), Aion, Phi-4-mini and Nano on GPU, and to fail on Nano on CPU **[measured, 05; proposals 3.3]**. Those measurements are of the benchmark's tool-choice loop, not of single-turn explanations, so the quality of K2's text per model is untested (TS3, TS4) **[inferred]**.
- K3 uses 3.3's routing rule unchanged: native tools on Edge with a `contextWindow` of 7,168 and a passing native canary, the structured-output loop otherwise, unsupported when the structured-output canary fails, with the manual override **[documented rule, 3.3]**.
- K1 uses Rewriter first where `Rewriter.availability()` reads `available`, then the Prompt API (4.2).

### 7.2 Failure cases

| Case                                                                                                                                                | What the tutor does                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unsupported model (structured-output canary fails; Nano on the CPU backend is the measured case, 15 of 15 fallback runs failed **[measured, 2.1]**) | Text-only mode: shipped text at the level's segments, templated feedback, deterministic grading and hints. "Ask the tutor" is hidden. A banner says why, with 3.3's "Check again" control and the manual override **[inferred design]**                                                                                                                                                                      |
| Model `downloadable`                                                                                                                                | Text-only mode until the learner clicks "Download model"; the click gives the user activation `create()` needs **[documented, 01; a click measured sufficient, 00]**                                                                                                                                                                                                                                         |
| `kErrorUnknown` in Chrome                                                                                                                           | No automatic retry (3.3). The card keeps the shipped text it already shows; the error appears with the extension's crash count (3.3) and a "Try AI wording again" button. Background calls (prefetch of the next card, tour chunks) stop until a call the learner started succeeds, so that prefetch cannot add crashes toward Chrome's three-crash limit **[inferred design; limit measured, 11]**          |
| Output fails a 4.5 check                                                                                                                            | Shipped or templated text stays; no retry (4.5)                                                                                                                                                                                                                                                                                                                                                              |
| Budget exceeded after trimming, or `QuotaExceededError`                                                                                             | Shipped text stays **[inferred design]**                                                                                                                                                                                                                                                                                                                                                                     |
| No answer within 20 s on a call the learner waits on                                                                                                | The shipped text stays; the call goes on in the background and its text replaces the card only if the learner is still on it **[inferred design]**                                                                                                                                                                                                                                                           |
| No lesson fits the page                                                                                                                             | P1-tree needs only two components, so on a supported app with two or more components at least one lesson always fits **[inferred]**. The phase map shows each other lesson with the reason in words ("needs a `computed` with a producer; none on this page") and the routes in `routesSeen` where it was eligible, with navigation behind the confirm (5.2). A one-component page offers the tour (T3) only |
| Unsupported app (Zone.js, NgModule, `@angular/upgrade`)                                                                                             | 3.3's "not supported" notice; no lessons, no model session (3.3)                                                                                                                                                                                                                                                                                                                                             |
| A reload, or a navigation that is not the exercise's own action, during an observation                                                              | The observation is dropped, the prediction is kept, the exercise is re-armed after the page settles **[inferred design]**                                                                                                                                                                                                                                                                                    |
| Production build (no `window.ng`)                                                                                                                   | The extension does nothing (3.5); the tutor says the app must run in development mode                                                                                                                                                                                                                                                                                                                        |

---

## 8. Tiers and dependencies

| Lesson                        | Tier                                             | Reuses                            | Other conditions                                                 |
| ----------------------------- | ------------------------------------------------ | --------------------------------- | ---------------------------------------------------------------- |
| P1-tree                       | 0                                                | N12, section 5 component explorer | none                                                             |
| P1-owner                      | 0                                                | section 5 component explorer      | none                                                             |
| P1-inputs                     | 0                                                | `inspect_component`               | signal inputs only (research/12 C1)                              |
| P1-outputs                    | 0 for listeners; 1 for the `OutputStart` capture | N1, `component_listeners`         | code subscriptions not visible (3.4)                             |
| P1-for                        | 1                                                | N10 `@for` rule                   | from 22.0 (`ɵgetControlFlowBlocks`)                              |
| P2-reads                      | 1                                                | N2, `list_signals`                | none                                                             |
| P2-computed                   | 1                                                | N2, N1                            | none                                                             |
| P2-chain                      | 1                                                | N2 `signal_trace`                 | none                                                             |
| P2-effect                     | 1                                                | N2 write rules                    | from 22.1.3 (`debuggableFn`); heuristic scan, said in the card   |
| P2-linked                     | 1                                                | N19                               | none                                                             |
| P2-resource                   | 1                                                | N14                               | from 22.0                                                        |
| P2-interop                    | 1                                                | N25                               | none                                                             |
| P3-cd                         | 1                                                | N1, N2                            | depends on TS1                                                   |
| P3-onpush                     | 0 for metadata; 1 for the capture                | N10 `Eager` rule, EXT1            | none                                                             |
| P3-stale                      | 1                                                | N24                               | from 22.1.3; only where N24 finds a case                         |
| P3-di-path                    | 1                                                | N3 `di_path`                      | none                                                             |
| P3-di-where                   | 1                                                | N3 `di_lookup`                    | carries `di_lookup`'s flag caveat (3.4)                          |
| P3-shared                     | 1                                                | N3                                | same caveat                                                      |
| P4-defer                      | 1                                                | N5, EXT3                          | none                                                             |
| P4-hydration                  | 1                                                | N5                                | SSR apps only                                                    |
| P4-routes                     | 1                                                | `router_state`                    | `provideRouter` only; router trio has no support statement (2.2) |
| P4-guards                     | 1                                                | `router_state`                    | same                                                             |
| P4-blocking                   | 1                                                | N17                               | 22.2, developer preview                                          |
| P4-errors                     | 0                                                | N4, EXT2                          | an `NG0` error on this page load                                 |
| P5-state, P5-submit, P5-async | 0                                                | N15                               | spike S9                                                         |
| O0 tour (T3)                  | 0 for the tree; 1 for signal facts               | N12, N18                          | none                                                             |

So the Tier 0-only part of the tutor is P1-tree, P1-owner, P1-inputs, P1-outputs without its capture, P3-onpush without its capture, P4-errors, the three Signal Forms lessons once S9 passes, and the tour's tree. Everything about signals, change detection, DI, `@defer` and the router is Tier 1 **[inferred, from the tiers in 3.4]**. The feature therefore takes the proposals' "0 + 1" form, as N3 does.

New in the extension for the tutor: the lesson data and predicate table, the graders, the option builder, the capture recorder's window rule (2.5), the overlay and pick mode (6.2, 6.3), the output checks (4.5) and the storage shapes (5.1). Everything else is a 3.4 tool or an N feature's data **[inferred design]**.

---

## 9. Tutor features beyond the initial sketch

Claude's sketch was the learning loop and the curriculum (sections 2 and 3). The features below are this design's own. Ranking rule: features that reuse data the extension already collects (N1, N2, N3, N10, N24 findings, 3.4 tools) rank above features that need new capture, then by value to a learner, then by window fit **[inferred recommendation]**. Tutoring practices named below come from general knowledge of learning tools **[inferred; not sourced in `research/`]**.

| Rank | Id  | Feature                                         | Built into this design                                               |
| ---- | --- | ----------------------------------------------- | -------------------------------------------------------------------- |
| 1    | T1  | Misconception catalogue                         | yes: 2.1 stage 5, 3.1 `misconceptions`, 3.4                          |
| 2    | T2  | Lessons from the app's own findings             | yes: 3.2 `has_finding`, P2-effect, P3-stale                          |
| 3    | T5  | "Teach me about this" on the selected component | yes: 6.1, 6.2                                                        |
| 4    | T3  | App tour (O0)                                   | yes: 3.3, 4.3, 4.6                                                   |
| 5    | T6  | Confidence before the answer                    | yes: 2.1 stage 3, 5.1                                                |
| 6    | T4  | Spaced review on new examples                   | yes: 2.1 stage 7, 5.1                                                |
| 7    | T8  | Narrated replay of one interaction              | partly: the check stage pulses (6.3); the step-through view is later |
| 8    | T7  | "Show me" demonstrations behind a confirm       | yes, as an option in 2.1 stage 4                                     |
| 9    | T9  | Placement check                                 | yes: 2.4                                                             |
| 10   | T10 | Contrast pairs from the same app                | later                                                                |
| 11   | T11 | Tutor in the learner's language                 | yes: K5                                                              |
| 12   | T12 | Notes for the learner's own records             | later                                                                |

### T1. Misconception catalogue

- **Learner gets:** feedback that names the likely wrong idea ("You may be thinking that a parent's check checks its children; with OnPush, each child is checked only when its own signals or inputs change"), not only "wrong".
- **Data and APIs:** each lesson's misconception list (3.1) holds grade patterns (for example "picked every child of the listener's component"). Intelligent tutoring systems keep such "bug libraries" of known wrong ideas **[inferred; not sourced in `research/`]**.
- **Split:** code matches the grade against the patterns and picks the shipped text; the model may reword it (K1). No model call decides which misconception applies.
- **Tier:** that of the lesson. **Window fit:** no model call needed; K1 on one short text.

### T2. Lessons from the app's own findings

- **Learner gets:** "Your app has two findings; learn the concept behind each." An N2 finding (an effect that only writes another signal) opens P2-effect with that effect as the example; an N24 finding opens P3-stale; an N10 `Eager` finding opens P3-onpush.
- **Data and APIs:** N2, N10 and N24 findings, which already name the modern Angular pattern and why (Lars's ruling); their rule ids map to lesson ids in a shipped table.
- **Split:** the finding is code (N2 and N10's rule passes, N24's regex); the lesson is shipped; the model words only the explanation, as N2 already does.
- **Tier:** 1 (N2, N24), 0 or 1 (N10). **Window fit:** a finding is one fact sheet.
- **Why it ranks high:** it costs a lookup table and teaches with the learner's own code paths at the moment the extension found them **[inferred recommendation]**.

### T5. "Teach me about this" on the selected component

- **Learner gets:** select any element (Elements panel or pick mode), and the tutor lists the lessons this component can serve as the example for, starting with the ones not passed.
- **Data and APIs:** a reverse index built during the eligibility scan: for each component key, the predicates it satisfies; `ng.getOwningComponent($0)` (3.1).
- **Split:** all code. **Tier:** that of each lesson. **Window fit:** no model call.

### T3. App tour (orientation lesson O0)

- **Learner gets:** a guided walk through this app: one card per route and per main component ("`app-cart` shows the cart; it reads three signals, one of them a `computed`; it has one component-level provider"), each card highlighting the component. Product tours in web apps follow the same step-and-highlight pattern **[inferred; not sourced in `research/`]**. It also helps a developer who is new to a team's app.
- **Data and APIs:** `find_components`, `inspect_component`, `list_signals` counts, `di_path` provider counts, `router_state` routes, N18's feature marks.
- **Split:** code chunks the app by route and by component, builds a fact sheet of at most about 250 tokens per chunk, orders the chunks by the tree, and joins the sentences; the model writes one sentence per chunk (K4), and the card falls back to a templated sentence ("`app-cart`: 3 signals, 1 `computed`, 1 provider"). The model never sees two chunks at once and never merges.
- **Tier:** 0 for the tree; 1 for signal and DI counts. **Window fit:** one chunk per call, under 500 tokens with the system prompt; a 47-component page is 47 small calls run in the background queue (4.3), and the templated sentences show at once.

### T6. Confidence before the answer

- **Learner gets:** a "sure, unsure, guess" choice before the act stage, and a running view of how often "sure" was right. A confident wrong answer gets the misconception text first; a right guess is scheduled for review sooner. Confidence-based marking is a known practice **[inferred; not sourced in `research/`]**.
- **Data and APIs:** the choice, stored in `LessonProgress.confidence`.
- **Split:** all code. **Tier:** none (no page data). **Window fit:** no model call.

### T4. Spaced review on new examples

- **Learner gets:** a short review exercise days later, on a different example that meets the same precondition, so the learner recalls the idea and not the earlier answer. Spaced retrieval practice is a known learning method **[inferred; not sourced in `research/`]**.
- **Data and APIs:** `ReviewItem` in `chrome.storage.local` with Leitner boxes (1, 2, 4, 8 and 16 days, a guess to tune); the eligibility scan finds a new example; the example key of the passed lesson is excluded when another exists.
- **Split:** all code; the exercise is the lesson's own. **Tier:** that of the lesson. **Window fit:** no extra model call.

### T8. Narrated replay of one interaction

- **Learner gets:** after an action, a step-through of the recorded cycles: trigger, signal written, each computed that changed, each template that ran, one step per click, with the page highlight following the step. React DevTools' commit-by-commit profiler view is the nearest devtools precedent **[inferred; React DevTools features documented in 03 section 2, the step-through comparison not]**.
- **Data and APIs:** `cd-cycles` and `signal-diff` records (2.5), the same as N1.
- **Split:** code orders the events and builds one fact per step; the model may phrase each step in one sentence (K4 style, one step per call), with a templated sentence first.
- **Tier:** 1. **Window fit:** one step per call. **Status:** the pulses of 6.3 are in this design; the step-through view waits on TS1, because it shows the capture in the most detail.

### T7. "Show me" demonstrations behind a confirm

- **Learner gets:** for an exercise whose action is hard to do by hand, a "Show me" button: the tutor writes one writable signal or plain field with `set_writable_field` and the learner watches the result.
- **Data and APIs:** `set_writable_field` (3.4), the confirm of 3.5, the read-only switch.
- **Split:** code chooses the field and value from the lesson; no model chooses a write. **Tier:** 0, write. **Window fit:** no model call.

### T9. Placement check

- **Learner gets:** three exercises from different phases on first open; the tutor proposes a start level from the grades.
- **Split:** all code. **Tier:** that of the lessons used. **Window fit:** no model call.

### T10. Contrast pairs from the same app (later)

- **Learner gets:** two components from this app side by side that differ in one way (an `Eager` and an OnPush component; a `computed` and an effect that writes a signal), each run through the same action.
- **Split:** code finds pairs from the reverse index (T5); the model explains the measured difference (K2). **Tier:** 1. **Window fit:** two slices of at most 20 nodes, within the 400-token fact sheet. Later, because it needs the pair search and a two-column card.

### T11. Tutor in the learner's language

- **Learner gets:** lesson text and explanations in another language.
- **Data and APIs:** Translator (`downloadable` in Chrome stable 154's page for en to da, and in Edge Dev 157's page) and Language Detector (`available` in both) **[measured, 00]**. Protected terms are replaced by numbered placeholders before translation and restored after; 4.5's checks run on the result **[inferred design]**.
- **Split:** code masks, caches (5.1) and checks; Translator translates. **Tier:** none. **Window fit:** per text; no Prompt API window used.

### T12. Notes for the learner's own records (later)

- **Learner gets:** a plain-text summary of passed lessons, open misconceptions and where each concept appears in this app, copied to the clipboard. It holds no code, as N13's copied text does not.
- **Split:** code builds the list; Summarizer may shorten it **[inferred design]**. **Tier:** none. **Window fit:** the list is built in code; Summarizer gets at most one page of text.

Considered and dropped: streaks, points and badges (they reward speed over understanding in a tool used during real work **[inferred recommendation]**), and a tutor that edits the app's source (forbidden by Lars's no-code ruling).

---

## 10. Risks and spikes

Each spike is the smallest run that settles one unknown. TS numbers are local to this document; S numbers are the proposals' spikes.

| #    | Untested                                                                                                             | Smallest spike                                                                                                                                                           | Done when                                                                                                                                                                                                                                                                                 |
| ---- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TS1  | Whether `ɵsetProfiler` events give a correct per-component "template ran" set for one click (N1's assumption, 2.5)   | On `spikes/ng222-app` and the portal's `/home`: record one click with a profiler callback; compare the template-run set with the components a hand trace says should run | The sets match on both apps, or the gap is described                                                                                                                                                                                                                                      |
| TS2  | Whether `epoch` and value previews from `ng.ɵgetSignalGraph` before and after an action identify the changed signals | Same apps: snapshot the slice before and after one click; diff `epoch` and values                                                                                        | Changed set matches the hand trace                                                                                                                                                                                                                                                        |
| TS3  | Whether K1 rewording keeps meaning and passes 4.5                                                                    | 10 shipped cards at three levels on Aion, Gemma 4 GPU and CPU, Nano GPU and Phi-4-mini; count 4.5 passes; Lars or Claude reads the passing outputs                       | A pass rate per model, and a list of meaning changes that passed the checks                                                                                                                                                                                                               |
| TS4  | Whether K2 explains a grade correctly from the fact sheet                                                            | 15 recorded grades from TS1 on the same models; check each explanation against the grade                                                                                 | A correct-explanation rate per model; below a bar set by Lars, the tutor ships templated feedback only on that model                                                                                                                                                                      |
| TS5  | Whether Rewriter and Translator work in the DevTools panel                                                           | One `availability()` and one call of each from the S1 extension's panel, on Chrome Beta and Edge Dev                                                                     | Works or fails per browser. Availability answered 2026-10-19 without flags (`research/20`): Rewriter `available` in all four browsers; Translator en to da `downloadable` in Chrome 156, Chrome Beta 157 and Edge 155, `unavailable` in Edge Dev 157. The calls themselves are still open |
| TS6  | The observation window rule (750 ms quiet, 10 s cap)                                                                 | A resource-loading action and a plain click on the portal; log cycle times                                                                                               | The quiet period that closes the window on both without cutting a cycle                                                                                                                                                                                                                   |
| TS7  | Whether the overlay or pick mode adds change-detection cycles or blocks app clicks wrongly                           | Overlay on, profiler on, ten clicks; then pick mode with ten picks                                                                                                       | No extra cycles; no click reaches the app in pick mode, every click reaches it outside pick mode                                                                                                                                                                                          |
| TS8  | How many lessons are eligible on real apps                                                                           | Run the eligibility scan (code only) on the counter app and on five portal routes                                                                                        | A per-route list; if a phase has no lesson anywhere, its preconditions are reviewed                                                                                                                                                                                                       |
| TS9  | Whether `ExampleKey` finds the same example after a reload                                                           | Store a key, reload, find it on the counter app and on `/contract/list` (47 components, repeated classes)                                                                | Found on both, or the host-index rule is replaced                                                                                                                                                                                                                                         |
| TS10 | Main-thread cost of the snapshot on large pages                                                                      | Time the page agent's snapshot of all components on `/contract/list`                                                                                                     | A time per snapshot; if long, the scan reads components in chunks across idle callbacks                                                                                                                                                                                                   |
| TS11 | Whether the masked-term placeholders survive Translator                                                              | 20 shipped texts en to da and de                                                                                                                                         | Placeholders intact in every output, or a different mask                                                                                                                                                                                                                                  |
| TS12 | Whether a dedicated Worker from the panel exposes the Prompt API (Claude's separate check)                           | One `typeof LanguageModel` and `availability()` in a Worker started by the S1 extension's panel                                                                          | Exposed or not; only T3's background chunks would use it (4.4)                                                                                                                                                                                                                            |

Also inherited from the proposals: S9 (Signal Forms lessons), S10 (an error-boundary lesson), S13 (model identity, which only K3's native route needs), S3 and S4 (K3's tool budget and answer quality), E5 (schema cost in K2's budget, 07) and E10 (page text as injection inside fact sheets, 07).

Riskiest first: TS1 and TS2, because P3-cd, P2-computed, the replay and most predict-then-observe grading rest on them; then TS4, because a wrong explanation of a correct measurement teaches the wrong idea; then TS8, because a curriculum whose lessons rarely fit real apps fails quietly **[inferred priority]**.

---

## 11. Summary row and N27 text for the proposals

Row for the proposals' feature tables (Claude adds it):

| #   | Feature                   | Why it is new                                                                                                                                                                                 | Tier                        |
| --- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| N27 | Angular AI DevTools Tutor | Teaches modern Angular on the learner's own running app: predict, act, observe; code grades against measured runtime data, and the on-device model only rewords and explains; no code written | 0 + 1 (Decision 1: allowed) |

Section text:

### N27. Angular AI DevTools Tutor

- Prompt: "Teach me signals on this app", or "Teach me about this" with a component selected.
- How: a lesson shows a concept, highlights a live example found by a code predicate, asks the learner to predict what the app will do (picking from lists or from the page, never typing code), records what the app did with N1's and N2's captures, and grades the prediction in plain TypeScript. 27 lessons follow the five phases of Angular's CLI tutor (`research/02` section 4.4) and appear only when the page meets their precondition; N2, N10 and N24 findings open matching lessons.
- The model rewords shipped text to levels 1-10 and explains the gap between prediction and observation from a fact sheet of about 400 tokens, with no tools; every output passes deterministic checks for kept terms, invented names and code. With no usable model, the tutor runs in text-only mode.
- Tier 0 + 1; Prompt API with structured output, Rewriter, Translator. Design, risks and spikes: `docs/design/tutor.md`.
