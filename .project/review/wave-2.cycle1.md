# Review — wave 2, cycle 1

Wave verdict: blocked
Cycle: 1
Depth: full
Tasks reviewed: 4

<!-- Reconstructed by the orchestrator from the reviewer's recorded return: the original file was
destroyed when its worktree was retired before collection. This cycle is recorded as blocked in full,
as the grammar requires of a superseded cycle; the reviewer's own task verdicts are quoted per task. -->

## T005 — Attach the one closed-shadow host once at document_start through a new manifest declaration: fail

- ❌ the wave is blocked, so this task's verdict for the cycle is fail: the reviewer passed this task; the cycle is blocked by its siblings' missing evidence, and cycle 2 re-states it
- ❌ The module's first statement is the guard: with the host already present, a second boot returns before attaching a shadow root, registering a listener or observer, creating a node, or throwing (E7: a second injection attempt leaves exactly one host, changes nothing and does not throw).
- ❌ The host is created with the fixed id, `attachShadow({ mode: "closed" })`, `position: fixed` and `pointer-events: none`, is appended to `document.documentElement`, and after both content scripts boot the document holds exactly one tool-created element while the retired marker id resolves to null (E7: a second injection attempt leaves exactly one host, changes nothing and does not throw).
- ❌ The manifest carries the third declaration for the overlay at `document_start` with no `world` key, the two existing declarations keep `document_idle` (the MAIN-world one with `world: "MAIN"`), and `extension/manifest.test.mjs` pins all three declarations, every named file's existence, the shared filter listed first, and the absence of `all_frames` and `match_about_blank` (SC4).

## T006 — Resolve a picked page element to its owning component in the page realm: fail

- ❌ the wave is blocked, so this task's verdict for the cycle is fail: the reviewer passed this task; the cycle is blocked by its siblings' missing evidence, and cycle 2 re-states it
- ❌ A capture-phase listener registered on `globalThis` for the pick event reads `event.target`, feature-detects the component getter the way the file already does, and dispatches the descriptor event with a plain payload (SC2).
- ❌ The resolver is `getOwningComponent`: an element inside a component's template resolves to that component, not to the component whose host contains it (E5: an element inside a component's view resolves to that component, not to its host's parent).
- ❌ An element whose `__ngContext__` is undefined answers the no-dev-context outcome with a reason that names the possibility of a production build rather than asserting one, and that outcome is never collapsed into no-component (E4: a picked element with no `__ngContext__` (a production build) yields a named `no-dev-context` outcome, distinct from "no component found").

## T007 — Carry the picker command and its outcomes between the panel and the page: fail

- ❌ the wave is blocked, so this task's verdict for the cycle is fail: no `verify.json` was recorded at the landing, so its criteria rest on the coder's report only
- ❌ The background's down branch validates a numeric `tabId`, answers a named refusal when it is missing, forwards the command to that tab with `chrome.tabs.sendMessage`, and answers another named refusal when no relay answers â€” never silence (SC2).
- ❌ The background re-broadcasts the picker state and the picked payload with the sender's `tabId`, beside the shipped record, state, graph and error-capture types, and no `host:*` type is reused or extended.
- ❌ The relay re-dispatches the command as a window event the overlay consumes, and its replay answer is unchanged for every other message type (SC2).

## T008 — Draw the tracked rect and label in the overlay, and make hover, lock and cancel work: fail

- ❌ the wave is blocked, so this task's verdict for the cycle is fail: no `verify.json` was recorded at the landing, so its criteria rest on the coder's report only
- ❌ The box tracks a picked element through scroll, CSS `zoom` and an ancestor `transform: translate(...) scale(...)`: the drawn box equals `getBoundingClientRect()` within one CSS pixel, and a rotated ancestor draws the axis-aligned box the label documents (E1: a `transform: translate(...) scale(...)` on an ancestor yields the transformed box within one CSS pixel of `getBoundingClientRect`, and a rotated ancestor yields the axis-aligned box the label documents).
- ❌ The label stays inside the viewport at both extreme scroll positions and for a zero-size element â€” which draws a 1 px outline at the point â€” using the visual viewport's box and offsets when present and the document element's client box otherwise (E2: at the document's extreme scroll positions, and for a zero-size element, the label stays inside the viewport and is never clipped outside it).
- ❌ The drawn box is in CSS pixels at `devicePixelRatio` 1 and 2: the ratio is never multiplied into the geometry and never used to rebuild a matrix, so a box computed in device pixels is off by the ratio and fails (E3: at `devicePixelRatio` 1 and 2 the box is drawn in CSS pixels; a box computed in device pixels is off by the ratio and fails).

## Intent coverage

### SC1 — The box tracks a picked element through scroll, zoom and a CSS transform, and the label names the element and its component.: fail

- ❌ the drawing evidence was never recorded (T008)

### SC2 — Picking an element resolves to its owning component in the panel, including an element inside a component's view rather than at its host.: fail

- ❌ the panel half rests on T007's unrecorded run

### SC3 — No `MutationObserver` owned by the tool observes the host subtree, asserted by a test that fails when the exclusion is removed.: fail

- ❌ the cycle is blocked as a whole, so its criteria are not credited here; cycle 2 passes them

### SC4 — The host is inserted exactly once per page load, asserted across a re-injection attempt.: fail

- ❌ the cycle is blocked as a whole, so its criteria are not credited here; cycle 2 passes them

## Summary for orchestrator

Blocked on one reason: T007 and T008 have no recorded Verify, because both landed through the direct
`isolation.py land` fallback, which records the landing but does not execute the Verify. The reviewer
passed T005 and T006; cycle 2 re-judges all four on recorded evidence and passes.
