# Review — wave 2, cycle 1

Wave verdict: blocked
Cycle: 1
Depth: verify-only
Tasks reviewed: 4

## T005 — Attach the one closed-shadow host once at document_start through a new manifest declaration: fail

- ❌ The module's first statement is the guard: with the host already present, a second boot returns before attaching a shadow root, registering a listener or observer, creating a node, or throwing (E7: a second injection attempt leaves exactly one host, changes nothing and does not throw).
- ❌ The host is created with the fixed id, `attachShadow({ mode: "closed" })`, `position: fixed` and `pointer-events: none`, is appended to `document.documentElement`, and after both content scripts boot the document holds exactly one tool-created element while the retired marker id resolves to null (E7: a second injection attempt leaves exactly one host, changes nothing and does not throw).
- ❌ The manifest carries the third declaration for the overlay at `document_start` with no `world` key, the two existing declarations keep `document_idle` (the MAIN-world one with `world: "MAIN"`), and `extension/manifest.test.mjs` pins all three declarations, every named file's existence, the shared filter listed first, and the absence of `all_frames` and `match_about_blank` (SC4).
- ❌ The overlay's own observer passes every record through the shared predicate before acting, and `extension/overlay.test.mjs` proves the corrected SC3 shape: a page-node mutation is passed, a child appended to the host yields zero passed records mentioning the host while the raw list holds one, and the host's own insertion record is absent from the passed list (E6: a mutation inside the host subtree reaches no tool observer while a mutation on a page node does, so deleting the exclusion makes the test fail).
- ❌ Both bites are proven: deleting the predicate call reddens the host half and deleting the `observe()` call reddens the page half, and the shadow root is never the probe (SC3).
- ❌ A source-level pin inside `extension/overlay.test.mjs` asserts one `attachShadow(` call site with `mode: "closed"`, no `innerHTML`, no `document.body` mutation, no `@angular`/`LanguageModel`/`setPrompt` token, no `localStorage|sessionStorage|alert|confirm|prompt|eval|new Function`, and the host id spelled identically in the overlay, the filter and the relay.
- ❌ Every style write in the module targets a node inside the closed root, and the MAIN-world script's forbidden-token scan is neither extended nor weakened; the existing suite stays green.
- ❌ the reviewer passed this task; the cycle blocks on its siblings' missing evidence and cycle 2 re-states it

## T006 — Resolve a picked page element to its owning component in the page realm: fail

- ❌ A capture-phase listener registered on `globalThis` for the pick event reads `event.target`, feature-detects the component getter the way the file already does, and dispatches the descriptor event with a plain payload (SC2).
- ❌ The resolver is `getOwningComponent`: an element inside a component's template resolves to that component, not to the component whose host contains it (E5: an element inside a component's view resolves to that component, not to its host's parent).
- ❌ An element whose `__ngContext__` is undefined answers the no-dev-context outcome with a reason that names the possibility of a production build rather than asserting one, and that outcome is never collapsed into no-component (E4: a picked element with no `__ngContext__` (a production build) yields a named `no-dev-context` outcome, distinct from "no component found").
- ❌ A dev context with no owning instance answers the no-component outcome, and the three outcomes are distinguishable in the dispatched payload.
- ❌ A resolved descriptor carries the host tag name lowercased as the component name, the constructor name as the class name, and the distinct constructor names walked up from the picked element as the path, bounded by ancestor depth with no document-wide query.
- ❌ Every branch is inside a `try/catch` and throws nothing into the page; the payload contains no page object, function or `__ngContext__` value, proven by a JSON round-trip, and no new `globalThis` property and no DOM node is created.
- ❌ `extension/agent-main.test.mjs` drives the listener with a fabricated element and owning instance for every outcome and for the two held-out edges, and the file's existing forbidden-token and one-global pins stay green and unextended.
- ❌ the reviewer passed this task; the cycle blocks on its siblings' missing evidence and cycle 2 re-states it

## T007 — Carry the picker command and its outcomes between the panel and the page: fail

- ❌ The background's down branch validates a numeric `tabId`, answers a named refusal when it is missing, forwards the command to that tab with `chrome.tabs.sendMessage`, and answers another named refusal when no relay answers â€” never silence (SC2).
- ❌ The background re-broadcasts the picker state and the picked payload with the sender's `tabId`, beside the shipped record, state, graph and error-capture types, and no `host:*` type is reused or extended.
- ❌ The relay re-dispatches the command as a window event the overlay consumes, and its replay answer is unchanged for every other message type (SC2).
- ❌ The relay forwards the picker state and the picked payload to `chrome.runtime.sendMessage` in the shipped forwarding shape, and a payload it cannot read is forwarded as received rather than reinterpreted.
- ❌ `ExtensionMessageService` exposes one signal for the picker state and one for the picked descriptor, both null until a message arrives, and a payload that is not one of the three named statuses or not one of the three descriptor shapes never becomes a value (SC2).
- ❌ The panel keeps "no answer yet", "refused" and "answered" apart: an outstanding picker is distinguishable from a cancelled one and from an unavailable one, and no state is inferred from an absence of messages.
- ❌ `extension/background.test.mjs` and `extension/relay.test.mjs` assert the four branches and the no-relay refusal in their own sandboxes, and the panel spec asserts the reader's refusal to invent a state.
- ❌ The relay and the background create no DOM element and add no page-visible global; the marker retirement stands and the existing extension suite stays green.
- ❌ no `verify.json` was recorded at its landing, so its criteria rest on the coder's report only

## T008 — Draw the tracked rect and label in the overlay, and make hover, lock and cancel work: fail

- ❌ The box tracks a picked element through scroll, CSS `zoom` and an ancestor `transform: translate(...) scale(...)`: the drawn box equals `getBoundingClientRect()` within one CSS pixel, and a rotated ancestor draws the axis-aligned box the label documents (E1: a `transform: translate(...) scale(...)` on an ancestor yields the transformed box within one CSS pixel of `getBoundingClientRect`, and a rotated ancestor yields the axis-aligned box the label documents).
- ❌ The label stays inside the viewport at both extreme scroll positions and for a zero-size element â€” which draws a 1 px outline at the point â€” using the visual viewport's box and offsets when present and the document element's client box otherwise (E2: at the document's extreme scroll positions, and for a zero-size element, the label stays inside the viewport and is never clipped outside it).
- ❌ The drawn box is in CSS pixels at `devicePixelRatio` 1 and 2: the ratio is never multiplied into the geometry and never used to rebuild a matrix, so a box computed in device pixels is off by the ratio and fails (E3: at `devicePixelRatio` 1 and 2 the box is drawn in CSS pixels; a box computed in device pixels is off by the ratio and fails).
- ❌ The five inputs and the single frame loop behave as decision 6 fixes: capture-phase scroll, resize, the visual viewport's resize and scroll, a re-registered resolution media-query change, and one animation-frame loop over one dirty flag that recomputes at most once per frame; every listener is detached on cancel and on a completed pick and no observer kind is added.
- ❌ Hover resolves through `document.elementFromPoint`, a hit on the host is read as the tool and not as a candidate, `visualViewport.scale` is read for nothing, and a click locks the pick with hovering stopped and the rect held.
- ❌ The label names the element and its owning component for a resolved pick (host tag name lowercased plus class name), renders a different label for the no-dev-api and no-component outcomes, and emits the unavailable outcome with a reason after 1500 ms without an answer while keeping the rect (SC1, SC2).
- ❌ Every style write targets a node inside the closed root â€” never a page node and never an inline `width`/`top` on the host â€” cancel clears the drawing and detaches everything while the host stays attached, and the overlay adds no button, toast, input or navigation control to the page.
- ❌ The cross-world hop is recorded in `research/raw/m022-pick-hop.json` with the profile, the fixture page, the picked element's tag and the descriptor the page realm returned, the suite asserts the dispatch shape the code owns (`bubbles: true`, `composed: false`, dispatched on the element), and a missing recording fails rather than skipping.
- ❌ no `verify.json` was recorded at its landing, so its criteria rest on the coder's report only

## Intent coverage

### SC1 — The box tracks a picked element through scroll, zoom and a CSS transform, and the label names the element and its component.: fail

- ❌ the drawing evidence was never recorded (T008)

### SC2 — Picking an element resolves to its owning component in the panel, including an element inside a component's view rather than at its host.: fail

- ❌ the panel half rests on T007's unrecorded run

### SC3 — No `MutationObserver` owned by the tool observes the host subtree, asserted by a test that fails when the exclusion is removed.: fail

- ❌ blocked as a whole; cycle 2 credits it

### SC4 — The host is inserted exactly once per page load, asserted across a re-injection attempt.: fail

- ❌ blocked as a whole; cycle 2 credits it

## Summary for orchestrator

The cycle-1 reviewer's file was destroyed when its worktree was retired before collection. This record is
written by the orchestrator from the evidence that existed at the time: T007 and T008 had no recorded
Verify because both landed through the direct `isolation.py land` fallback. Cycle 2 re-judges all four on
recorded evidence and passes.
