# Synthesis

<!-- Written by the decider role. The planner treats Decisions as settled. -->

Milestone M022 (`in-page-overlay`), base revision `867f563`. Inputs read in full: `intent/INTENT.md`,
`research/RESEARCH.md`, `research/evidence-codebase.md`, `research/evidence-exclusion.md`,
`research/evidence-pitfalls.md`, `CHARTER.md`. No row here is `NEEDS-USER`: every question the intent
left open is answered below from the evidence, the three delegated corrections in INTENT § Corrections
(2026-11-03) close the rest, and the one `[RESEARCH]` question is settled first.

## Settled

<!-- Choices closed by an intent constraint or the existing codebase.
     One line each, citing the settling source. No invented runner-ups. -->

- Overlay realm — plain DOM in the ISOLATED world, closed Shadow DOM, no Angular in the inspected page
  (CHARTER AR-2; INTENT § Prohibitions N5).
- Only DOM — the host is the tool's only added element; one widget, no toast, input or navigation in the
  page (CHARTER AR-3, AR-6).
- Single frame — no `all_frames`, no host per frame (CHARTER AR-5; `extension/manifest.json:18-30` sets
  neither `all_frames` nor `match_about_blank`).
- Lock semantics — a click in the page locks and the page reports a descriptor; opening the component is
  a panel action (INTENT § Corrections, 2026-11-03).
- Descriptor boundary — plain data only, never the live `__ngContext__` or any page object (INTENT N2).
- File placement — the overlay is a new `extension/*.js`, not code inside `agent-main.js`
  (`extension/agent-main.test.mjs:1006-1008` forbids `createElement(`, `appendChild(`, `innerHTML` there).
- Cost — the overlay adds no build wiring and no panel bytes: `extension/*.js` load as they sit
  (`extension/manifest.json:18-30`; `apps/angular-ai-devtools/project.json:52-92` writes only
  `extension/panel`).
- Harness — tests sit beside the unit under `node:test` with jsdom (`package.json:11` globs
  `extension/**/*.test.mjs`; `jsdom ^27.1` at `package.json:32`).
- AR-4 scope — one logical observer exists in the tool today: `extension/relay.js:67` and `:75`, one
  per page-load branch, both on `document.documentElement` with `{childList, subtree}` and both
  disconnected on first detection (`extension/relay.js:64-81`). The intent's `[RESEARCH]` question is
  settled by evidence-pitfalls.md § "The tool owns exactly one MutationObserver…" and
  evidence-exclusion.md § "Exactly two observer call sites exist…": both sites are in this
  generation's scope, and nothing else is.

## Decisions

<!-- One block per genuinely open choice the evidence resolved. -->

### 1. Observer exclusion shape — Settled

- **Decision**: exclusion is an early-return **record filter** and nothing else. Both `observe()` calls
  keep their target and options (`document.documentElement`, `{childList: true, subtree: true}`,
  `extension/relay.js:70`, `:78`); the filter runs first in each callback, before `checkAngular()`, and
  in every observer the overlay module adds. The rule the code implements, as one pure predicate:

  > A record is dropped iff `target` is the host, the host's shadow root, or a shadow-including
  > descendant of the host — `t === HOST || t === HOST.shadowRoot || HOST.contains(t) ||
  > (HOST.shadowRoot && HOST.shadowRoot.contains(t))` — **or** any node in `record.addedNodes` or
  > `record.removedNodes` satisfies that same test. Otherwise the record is passed through and the
  > callback behaves as it does today.

  `HOST` is looked up at call time, not captured at load: `document.getElementById("angular-ai-devtools-host")`
  (decision 5 fixes that id). A null host drops nothing, so the predicate is correct whichever content
  script runs first — before the host exists, no record can concern it.
- **Runner-up**: a narrower `observe()` target (e.g. `document.body`, or `[ng-app-root]`). It loses on
  fact, not taste: `MutationObserverInit` has no exclusion member and the host is always a descendant of
  the observed target, so no target can exclude it; narrowing would also silently change the relay's
  Angular detection, a behaviour change to a shipped feature. Also rejected: a filter keyed on
  `record.target` alone — the host's own insertion record has `target === document.body` with the host in
  `addedNodes`, so a target-only filter lets through the one mutation the tool itself performs.
- **Evidence**: evidence-exclusion.md § "Exclusion can only be an early-return record filter, and it must
  test `addedNodes`/`removedNodes` as well as `target`" and § "The closed host still exposes exactly three
  things to a document observer"; evidence-pitfalls.md § "Dropping the exclusion would show the observer an
  insertion, never the host's interior"; `extension/relay.js:64-81`.
- **Confidence**: high
- **Constrains**: one predicate module/function, tested once, imported by both call sites in the same
  isolated world plus the overlay's own observer; the host id becomes a two-file contract; the overlay's
  per-frame style writes must stay inside the closed root, which is what keeps the tool's only light-DOM
  mutation its own insertion.

### 2. The SC3 test, corrected — Settled

- **Decision**: SC3 is asserted against the host's **light tree**, never the shadow root. The corrected
  shape, to be carried verbatim by the plan:

  > **SC3 (corrected).** In `extension/overlay.test.mjs` on jsdom: (1) boot the overlay so the host attaches
  > and its observer registers; (2) collect every record the tool callback passes, and — if the module
  > exports its predicate — the raw pre-filter list; (3) `document.body.appendChild(pageSpan)`, flush a
  > macrotask, expect at least one passed record whose target is `pageSpan`; (4) `host.appendChild(new
  > page.createElement("span"))`, flush, expect **zero** passed records mentioning the host while the raw
  > list holds at least one; (5) expect the host's own insertion record absent from the passed list.
  > Deleting the filter reddens (4) and (5); deleting `observe()` reddens (3). A mutation inside the shadow
  > root is never the probe: a `MutationObserver` receives nothing from inside any shadow root, open or
  > closed, so INTENT E6 as worded passes with the filter deleted.

  At the relay's two sites the same proof rides the existing `vm` harness: `relay.test.mjs`'s stub must
  keep the callback and the `observe()` arguments, the test must supply the host node, and a counting
  `document.querySelector` stub turns "filtered" into an assertion — a host-targeted record leaves the
  `[ng-version]` probe count unchanged, a body-targeted record increments it (`extension/relay.js:41-42`).
- **Runner-up**: a browser check against the served fixture, driven through `control-ai-browsers`. It loses
  because on that fixture `checkAngular()` normally succeeds at `document_idle` and the observer is never
  constructed (`extension/relay.js:74`), so a browser run proves nothing about the filter; the browser stays
  the place for the host-count (SC4) and rect claims, not for SC3.
- **Evidence**: evidence-exclusion.md § "The SC3 probe must mutate the host element, not the shadow root",
  § "The copyable SC3 test, as the plan should write it" and § "The relay harness needs two affordances";
  evidence-pitfalls.md § "The sandbox stub makes the current suite unable to pin the observer's target,
  options or callback" and § "On an already-bootstrapped Angular page this observer is never constructed";
  `extension/relay.test.mjs:41-44`; INTENT E6.
- **Confidence**: medium
  checkout ⇒ wave-1 blocker (see For the planner).
- **Constrains**: E6 is restated by this decision; the plan carries the restatement, not the original
  wording. Two tasks: `relay.test.mjs`'s stub gains target/options/callback capture, and the overlay's pin
  is written after the jsdom flush behaviour is confirmed.

### 3. The picker transport — Settled

- **Decision**: three runtime message types (`angular-ai:picker-command`, `angular-ai:picker-state`,
  `angular-ai:picked`) carried over four DOM event names inside the page (`angular-ai:picker-command`,
  `angular-ai:picker-state`, `angular-ai:pick`, `angular-ai:picked`), no general request bus.
  - **Down (panel → page)**: `chrome.runtime.sendMessage({type:'angular-ai:picker-command', tabId,
    action:'arm'|'cancel'})` → `background.js` validates `tabId` and refuses by name (the
    `angular-ai:state-request` branch at `extension/background.js:30-52` is the pattern) →
    `chrome.tabs.sendMessage(tabId, {type:'angular-ai:picker-command', action})` → the relay's existing
    listener (`extension/relay.js:34-38`) gains a second branch that re-dispatches
    `CustomEvent('angular-ai:picker-command')` on `window` → the overlay arms or cancels.
  - **Up (page → panel)**: the overlay reports the states the panel cannot see through the closed root as
    `angular-ai:picker-state` (`{status:'armed'|'cancelled'|'unavailable', reason?}`); the locked
    descriptor arrives as `angular-ai:picked` (decision 4). Both travel overlay → `window` event → relay's
    shipped `angular-ai:record` forwarding shape (`extension/relay.js:11-31`) → `chrome.runtime.sendMessage`
    → background re-broadcast with `tabId` (the type list at `extension/background.js:10-14` gains both).
  - **Panel side**: `ExtensionMessageService`'s single funnel takes both payloads
    (`extension-message.service.ts:74-79`); the surface is one **lazy** route with a `data-testid` of its
    own, because `component-picker` is already the testid of three selects
    (`n1-update-cause.component.ts:18`, `n2-signal-provenance.component.ts:17`, `n3-di-doctor.component.ts:15`).
  - **Naming**: no `host:*` type is reused or extended — `host:capability` and `host:pick`
    (`extension/background.js:16-26`) are the Prompt API host, not element picking.
- **Runner-up**: implementing `PAGE_HOST` (`apps/angular-ai-devtools/src/app/page-reads.ts:108-111`) as one
  general panel→page transport and riding the picker on it. It loses as scope creep: the five page reads
  have their own vocabulary and declaration list (`page-reads.ts:39-53`) and wiring them is a different
  feature; the picker needs three transitions, not five read kinds. Also rejected: a page-side poll of a
  panel-published value, which has no page-visible place to live without violating AR-3.
- **Evidence**: evidence-codebase.md § "There is still no panel-to-page request transport, and the DI query
  path is dead at its first link" and § "`component-picker` is already the `data-testid` of three different
  panel selects"; `extension/background.js:8-61`; `extension/relay.js:34-38`; INTENT § Corrections
  (2026-11-03, lock on click).
- **Confidence**: high
- **Constrains**: two branches in `background.js`, one in `relay.js`, one new listener pair in
  `agent-main.js`, one lazy panel route; the panel surface must be lazy or the panel bundle pin (520 kB
  warning, 535.44 kB baseline) goes red (`scripts/panel-bundle-budget.test.mjs:55,65`).

### 4. Resolution in the page realm — Settled

- **Decision**: resolution runs in the **MAIN world, inside `extension/agent-main.js`**, because that is the
  only place `ng` and its `ɵ` debug functions exist; the overlay is ISOLATED (AR-2) and an isolated world
  cannot read page JS globals, so the hop carries a **DOM node, never a JS object**: on lock the overlay
  dispatches `new CustomEvent('angular-ai:pick', {bubbles: true, composed: false})` **on the picked element
  itself**, and a MAIN-world listener registered on `globalThis` in the capture phase reads `event.target`.
  The listener registers beside the shipped one at `extension/agent-main.js:896-898`, feature-detects as at
  `:554`, and answers `angular-ai:picked` with plain data.
  - **Descriptor**: `{status:'resolved', elementTag, componentName, className, componentPath}`, where
    `componentName` is `ng.getHostElement(instance).tagName.toLowerCase()` (`agent-main.js:507-517`) and
    `className` is `instance.constructor.name` (`:519-525`) — exactly the identifiers the panel already
    lists, so the picked selection lands where `componentName` is matched
    (`n1-update-cause.component.ts:106-123`). `componentPath` is the distinct constructor names obtained by
    walking `parentElement` up with `getOwningComponent`; bounded by ancestor depth, no `querySelectorAll`.
  - **Resolver**: `getOwningComponent`, not `getComponent` — the latter returns null for an element inside
    a component's view and would fail E5; `getOwningComponent` is what the shipped element chain already
    uses (`agent-main.js:909-917`).
  - **Named outcomes**: `el.__ngContext__ === undefined` ⇒ `{status:'no-dev-context', reason}` (Angular
    sets that property only in dev builds, so a production build lands here and the reason string says the
    page may be a production build rather than asserting it); a dev context with no owning instance ⇒
    `{status:'no-component'}`. The two are never collapsed (E4).
  - **Safety and timing**: every branch is inside `try/catch` and never throws into the page
    (`agent-main.js:483-485`, `:925`). If no `angular-ai:picked` arrives within 1500 ms of the lock, the
    overlay emits `angular-ai:picker-state {status:'unavailable', reason}` and keeps the rect — a bounded
    timer of the shape `agent-main.js:442` already uses.
- **Runner-up**: resolving in the overlay (no `ng` access in the isolated world) or in the panel (no page
  object may cross, N2) — both impossible. Calling `window.__ngRecorder.pick(el)` from the overlay — also
  impossible across worlds, and it would widen the one page-visible global that
  `agent-main.test.mjs:1013-1017` pins. Passing the element in a `detail` object — loses to `event.target`
  because the cross-world semantics of `detail` are unverified in this tree while a DOM node is shared by
  construction (`extension/relay.js:11-31` already proves the MAIN→ISOLATED read direction).
- **Evidence**: evidence-codebase.md § "The panel names a component by its host tag name lowercased, and
  that is what a picker has to emit", § "The overlay cannot live inside `agent-main.js` as things stand"
  (the pin forbids DOM tokens only, not listeners) and § "The page realm's footprint is more than one
  global"; `extension/agent-main.js:552-583, 896-898, 909-917`; INTENT § Corrections (2026-11-03).
- **Confidence**: high
  elements inside a template — the evidence cites no source for that ⇒ wave-1 fixture probe (the mechanism itself is high confidence; this half is medium).
- **Constrains**: one new listener pair in `agent-main.js` with no new page global; two `agent-main.test.mjs`
  cases (E5 inside a view, E4 stubbed no-context); the overlay dispatches `bubbles: true, composed: false`
  so the event cannot leave the light tree and a page bubble-phase listener cannot block the capture
  listener.

### 5. Host identity, attachment and the marker node — Settled

- **Decision**: the marker at `extension/relay.js:50-54` is **retired**; the host is a new element the
  overlay creates with `id="angular-ai-devtools-host"`, `attachShadow({mode:'closed'})`,
  `position: fixed`, `pointer-events: none`, appended to `document.documentElement` (not `document.body`,
  which can still be null at `document_start`). The relay keeps its version latch and `angular-detected`
  message (`relay.js:44-48`, `:57`) and loses only the four lines that build and append the marker.
  - **The "exactly one tool-created element" assertion** (SC4, AR-3) is one count with two halves:
    `document.querySelectorAll('[id^="angular-ai-devtools"]').length === 1` **and**
    `document.getElementById('angular-ai-devtools-marker') === null`, taken after both scripts boot in one
    jsdom document (`extension/overlay.test.mjs`), plus the same count taken by `page.evaluate` in the
    wave-gate browser check across a re-injection. The closed root is what makes the count well-defined:
    the rect and label are not in the document tree, so the host is the only enumerable tool node.
  - **Idempotency** (E7, N3): the overlay's first statement is the guard — if
    `document.getElementById('angular-ai-devtools-host')` exists it returns, attaching no shadow root,
    registering no listener and throwing nothing. The second instance cannot reach the first instance's
    root and does not need to: the first instance's closures still own it.
- **Runner-up**: promoting the marker into the host. It loses three times over: the marker is light DOM
  with inline CSS and page-readable text (`relay.js:51-53`); it is appended to `document.body` from a
  `document_idle` script, too late for a `document_start` host; and it duplicates a status the panel
  already receives as `angular-detected` (`relay.js:57`). Leaving the marker in place loses outright —
  AR-3 is a count, not a shape (INTENT § Corrections, 2026-11-03).
- **Evidence**: evidence-codebase.md § "The tool already adds a DOM node to every Angular page it
  inspects" and § "No content script runs at `document_start`, and nothing pins the manifest";
  `extension/relay.js:41-62`; INTENT SC4, N3, E7; CHARTER AR-3.
- **Confidence**: high
- **Constrains**: `relay.test.mjs` gains an assertion that no marker id is created; the relay boot path is
  the risk (INTENT § Risks: eight browser checks ride it), so retirement is its own task whose gate is the
  existing suite green before the overlay attaches anything; the host id is the same string decision 1's
  predicate reads.

### 6. Rect inputs and recompute cadence — Settled

- **Decision**: five event inputs plus one frame loop, all attached only while a pick is armed or locked
  and detached on cancel or close:
  1. `window.addEventListener('scroll', h, true)` — capture, because an element's scroll does not bubble;
  2. `window.addEventListener('resize', h)`;
  3. `visualViewport.addEventListener('resize', h)` and `visualViewport.addEventListener('scroll', h)` when
     `visualViewport` exists;
  4. `matchMedia('(resolution: ' + devicePixelRatio + 'dppx)')`'s `change`, the listener re-registered on
     every fire (CSS `zoom` and page zoom surface as a DPR change, per INTENT § Corrections 2026-11-03);
  5. `requestAnimationFrame` while a selection exists — the only input that catches a CSS transform on an
     ancestor, which emits no event.
  All five set one dirty flag; the loop reads it and recomputes **at most once per frame**, then clears it.
  Geometry is `el.getBoundingClientRect()` verbatim: already CSS pixels, already the axis-aligned
  transformed box — never multiplied by `devicePixelRatio` (E3) and never rebuilt from a matrix (E1's
  rotated case is documented as the axis-aligned box). Because the host is `position: fixed` inside the
  shadow root, viewport coordinates need no scroll-offset arithmetic, and the only writes are
  `transform`/`width`/`height` on nodes inside the closed root — invisible to every page observer
  (evidence-exclusion.md § 1).
  Label clamping uses `visualViewport.width/height` with `offsetLeft/offsetTop` when present, else
  `documentElement.clientWidth/clientHeight` (E2); a zero-size element draws a 1 px outline at the point
  with the label anchored inside the viewport. `visualViewport.scale` is read for nothing (INTENT § Scope,
  Out). Hover uses `document.elementFromPoint(x, y)`; the host is `pointer-events: none`, and a point that
  still returns the host maps to "the tool, not a candidate".
- **Runner-up**: a `ResizeObserver` on the target and its ancestors. It loses because it would be the
  tool's first observer kind AR-4 does not name, forcing a judgement extension of the exclusion discipline,
  and it still misses scroll entirely. A 100 ms `setInterval` poll loses too: visibly laggy under a
  transform, and the tool already carries three timers.
- **Evidence**: evidence-codebase.md § "Nothing in shipped code measures layout geometry; there is no
  scroll or resize listener anywhere"; evidence-pitfalls.md § "No other observer class exists in the tool";
  evidence-exclusion.md § "A shadow root is a separate node tree…" and § "`elementFromPoint` returns the
  host over the overlay…"; INTENT E1-E3 and § Corrections (2026-11-03, "zoom").
- **Confidence**: high
  CSSWG resolution is younger than the supported browsers) ⇒ wave-1 browser check; the
  `pointer-events: none` host plus the host-means-the-tool mapping makes the answer immaterial to
  correctness.
- **Constrains**: no observer kind is added, so AR-4's surface stays the relay's two sites plus the
  overlay's own; the plan can bound the work to three listener registrations, two `visualViewport` ones, one
  `matchMedia`, one frame loop and three style properties.

### 7. The `document_start` declaration and its pins — Settled

- **Decision**: the manifest gains a **third** `content_scripts` entry —
  `{"matches": ["<all_urls>"], "js": ["overlay.js"], "run_at": "document_start"}` — with **no** `world` key
  (default ISOLATED, AR-2), no `all_frames` and no `match_about_blank`. Both existing entries keep
  `document_idle`, and `agent-main.js` keeps `world: "MAIN"` (`extension/manifest.json:18-30`).
  `relay.js` does **not** move: moving it relocates the marker, the `[ng-version]` probe and the observer's
  live window. `agent-main.js` does **not** move either: it claims `document_start` in a comment
  (`agent-main.js:900`) while the manifest says `document_idle`, and satisfying the comment would silently
  widen N4's error-capture window — a behaviour change to a shipped feature that this milestone must not
  make by accident.
  - **Pin 1**: a new `extension/manifest.test.mjs` reads the manifest and asserts the three declarations'
    `js`, `run_at` and `world`, the absence of `all_frames`/`match_about_blank`, and that every named file
    exists. `npm test` already globs `extension/**/*.test.mjs` (`package.json:11`), so no script changes.
  - **Pin 2**: a **second**, separate blast-radius pin inside `extension/overlay.test.mjs` for the new file —
    `agent-main.test.mjs:1006-1017` is neither extended nor weakened (N7). It asserts: exactly one
    `attachShadow(` call site and it is `mode: "closed"`; no `document.body` mutation (the host goes to
    `documentElement`); no `innerHTML`; no `@angular`/`Angular`/`LanguageModel`/`setPrompt` token; no
    `localStorage|sessionStorage|alert|confirm|prompt|eval|new Function`; and that the host id string is
    spelled identically in `overlay.js` and `relay.js`.
- **Runner-up**: extending `agent-main.test.mjs`'s token scan to the new file. It loses because it would
  blur what that pin is about ("the tool" versus "one file") and because the overlay legitimately needs
  `createElement`, which that scan forbids for the MAIN-world script; a second, stronger pin beside the new
  unit is this repository's own shape (`scripts/panel-bundle-budget.test.mjs`, `scripts/registry-reach.test.mjs`).
- **Evidence**: evidence-codebase.md § "No content script runs at `document_start`, and nothing pins the
  manifest", § "The overlay cannot live inside `agent-main.js` as things stand" and § "`agent-main.js` says
  its error hooks run at `document_start`, but the manifest runs them at `document_idle`";
  `extension/manifest.json:18-30`; INTENT § Constraints, N7; `package.json:11`.
- **Confidence**: high
- **Constrains**: the manifest edit, its pin and the overlay file land as one task; the overlay's idempotency
  guard is what makes the new declaration safe against a re-injection (decision 5).

### 8. What is out of scope for this generation — Settled

- **Decision**: the following stay out, each for a reason the evidence gives:
  - **Observers owned by the skills' control scripts** — `.commandcode/skills/control-ai-browsers/scripts/control.mjs:1293`
    and `spikes/probes/broker-state.js:31` are development tooling outside the extension, and AR-4, narrowed
    by N4, governs only observers the tool owns.
  - **Spec-local observers** — `apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts:460,469` run
    in the panel's Vitest realm, never in an inspected page; they are a test technique, not a call site.
  - **The page-realm element walk** — `agent-main.js`'s per-cycle `document.querySelectorAll("*")`
    (`extension/agent-main.js:552-583`) is a traversal, not an observer, so AR-4 does not reach it; the host
    is matched by `*`, passed to the component getter and skipped because no instance comes back (`:566`).
    Recorded as an accepted per-cycle `try/catch`, not fixed here.
  - **Cross-frame hosts** (AR-5) and **pinch zoom as a rect input** (INTENT § Scope, Out).
  - **`PAGE_HOST`, `queryDi` and the `angular-ai:di-query` path** — `page-reads.ts:108-111`,
    `di-doctor.service.ts:23-26`, `agent-main.js:897` stay as they are: the picker's three messages are not a
    general page-request transport (decision 3), and wiring the five page reads is another feature.
  - **Page-side confirmations, toasts, inputs and navigation** (AR-6), including "open the component", which
    the panel performs.
- **Runner-up**: none. These are scope statements, not choices; each names the evidence that puts it outside.
- **Evidence**: evidence-exclusion.md § "Every other candidate site is out of scope — a spec fixture, dev
  tooling, or not an observer at all"; evidence-pitfalls.md § "No other observer class exists in the tool"
  and § Dead ends; evidence-codebase.md § "There is still no panel-to-page request transport, and the DI query
  path is dead at its first link"; `probes/broker-state.js:31`; CHARTER AR-5, AR-6.
- **Confidence**: high
- **Constrains**: a reviewer who finds a tool-owned observer outside `relay.js` and `overlay.js` is reading
  out-of-scope code; the AR-4 pin asserts those two files only.

## For the planner

- **Wave-1 blockers**: four assumptions to burn down before any UI work.
  1. **jsdom record delivery** — that a light-tree childList mutation on the host reaches a
     `document`-level observer in jsdom and that a macrotask flush makes it observable. Write it on a
     scratch test first; SC3's pin is worthless without it (decision 2, medium).
  2. **The ISOLATED→MAIN hop** — that `new CustomEvent('angular-ai:pick', {bubbles: true})` dispatched on a
     page element by the overlay reaches a MAIN-world capture listener with `event.target` intact, on
     `spikes/ng222-app` in a real browser (decision 4).
  3. **`__ngContext__` presence** — that an element inside a component's template carries `__ngContext__` in
     an Angular 22.2 dev build, and that the fixture's production build does not. E4's whole vocabulary rests
     on it.
  4. **`elementFromPoint` over the tool** — what a point above the overlay returns, with the host at
     `pointer-events: none` (decision 6, medium).
- **Walking skeleton**: one end-to-end slice that touches every seam with the descriptor stubbed — the
  overlay attaches the closed host at `document_start`, the panel arms and cancels through
  background → relay → overlay, the overlay draws a rect for a hard-coded element, and a click reports
  `no-dev-context` from a hard-coded outcome. Manifest edit, transport, host, rect and report path all
  proven before the resolver, the picker's hover and the panel's descriptor surface are built.
- **Pitfalls → tasks**:
  - The marker retirement (INTENT § Risks) is its own task, gated on the existing `relay.test.mjs` suite
    green, before the overlay attaches anything — eight browser checks ride that boot path.
  - One predicate, written and tested once, used by `relay.js`'s two callbacks and the overlay's observer; a
    second hand-written copy is the defect this milestone exists to prevent.
  - The panel surface must be a lazy route with its own `data-testid`; an eager route or the
    `component-picker` testid turns the bundle pin or a driver green for the wrong reason.
  - `background.js`'s `host:*` namespace is not reused (`host:capability`, `host:pick` mean the Prompt API).
  - Per-frame style writes stay inside the closed root; a write to a page node, or a `width`/`top` write on
    the host's inline style, is both an AR-3/N1 break and a record the relay's filter would have to swallow.
  - Each pin lands with the file it gates, and each proves its own failing half (the repository's rule): the
    SC3 pin, the manifest pin, the "exactly one element" count and the overlay's token pin all get a
    deletion that reddens them.

## User rulings

<!-- NEEDS-USER items answered at the synthesis checkpoint. Verbatim-ish. -->

- "should the picker lock on click, or require a confirm in the panel" → **lock on click, navigate from the
  panel**: a click locks and the page reports the descriptor; opening the component is a panel action, so
  AR-6 holds and the page has no navigation control (INTENT § Corrections, 2026-11-03, delegated under the
  standing grant).
- The marker node → "not a second host. Whichever way it is resolved — retired, or promoted into the host — a
  page-DOM assertion pins 'exactly one tool-created element per page', because AR-3 is a count, not a shape"
  (same source). Resolved here as **retired**, with the count in decision 5.
- Resolution → "runs in the page realm and returns a plain descriptor (`componentName`, `elementTag`, path of
  class names) plus a named outcome for the production build" (same source); realised as decision 4.
- "zoom" → CSS `zoom` and CSS transforms on ancestors, including the page-zoom case that surfaces as a
  `devicePixelRatio` change; pinch zoom is out because it moves no layout coordinate (same source).
- AR-3 and AR-4 stand as written: the overlay is the only DOM the tool adds, and every tool-owned
  `MutationObserver` excludes the host subtree (CHARTER § Corrections, AR-3/AR-4, 2026-11-01).

## Still unknown

- **`__ngContext__` semantics** — no evidence file cites a source for "dev-only, set on elements inside a
  template"; the intent asserts it and E4 depends on it. Plan: wave-1 spike. The single artifact that would
  settle it is a `page.evaluate` on `spikes/ng222-app` printing the truthiness of `__ngContext__` on a button
  inside the counter component's template, from a dev build and from `ng build` production output. Until then the descriptor
  reports `no-dev-context` with a reason string that names the possibility of a production build instead of
  asserting one.
- **`elementFromPoint` retargeting over the tool's host** — evidence-exclusion rates the CSSWG resolution
  `medium` and the Blink statement unreadable (sign-in wall). Plan: wave-1 spike; the `pointer-events: none`
  host plus "host means the tool" makes it a comment, not a correctness dependency. The artifact that would
  settle it is one browser `evaluate` returning `document.elementFromPoint` at a point inside the drawn rect,
  in each of the four supported profiles.
- **Which SC1/SC2 claims need a portal-backed verdict** — CHARTER § Constraints requires a portal-backed
  `lars-verify` verdict "wherever verification there is possible and meaningful", and the picker is
  producible on the insurance-portal routes. Plan: wave-gate `lars-verify`; this synthesis decides the code
  shape, not the claim list, and the artifact that settles it is the verdict's `verdict.json`.
- **The measured panel initial total once the picker surface exists** — 535.44 kB is quoted from the pin
  (`scripts/panel-bundle-budget.test.mjs:65`), not re-measured. Plan: accept risk; the surface is lazy, so
  the initial set does not grow, and the pin itself would settle it at the first `build-extension`.
- **Whether a re-injection can adopt a closed root** — it cannot by design (`host.shadowRoot === null`), and
  decision 5 makes the second run a no-op instead. Not a gap, recorded so no later reader "fixes" it by
  reading the root back: the artifact that would change this is a platform change, not a test.
