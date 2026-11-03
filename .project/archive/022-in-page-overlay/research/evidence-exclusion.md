# Evidence — exclusion

<!-- AR-4 / SC3 dimension. Platform behaviour is cited from the WHATWG DOM Standard, CSSOM
     View, MDN and the CSSWG issue that owns the hit-testing gap. Repository sites are
     file:line in this checkout. Nothing was executed: the brief forbids builds, tests and
     installs, and the sidecar holds no node_modules. -->

Dimension: custom (exclusion)
Questions assigned: Which `MutationObserver` call sites the tool owns today would observe a host subtree if the exclusion were dropped, and which of them are in this generation's scope?

## Finding: A shadow root is a separate node tree, so `subtree: true` on `document` never reaches inside it — open or closed

- **Claim**: A mutation record is queued only to observers registered on the record target's *inclusive ancestors*, and `subtree: true` extends an observer only to its target's *descendants*; both are plain node-tree relations. A shadow tree's nodes root at the shadow root, not at the host, so an observer on `document`, `document.body` or `document.documentElement` with `{subtree: true}` receives **no** records for mutations inside any shadow root — and `mode: "closed"` has nothing to do with it, because an *open* root is equally opaque.
- **Source**: WHATWG DOM §4.3.2 "Queuing a mutation record", step 2 ("Let nodes be the inclusive ancestors of target") — https://dom.spec.whatwg.org/#queueing-a-mutation-record — and §4.3.1 `observe()` ("`subtree` … mutations to not just target, but also target's descendants"). The spec spells shadow-crossing relations separately as "shadow-including inclusive ancestor" (e.g. §4.2.3 insert, §4.5 adopt).
- **Confidence**: high
- **Why it matters here**: AR-4 cannot be the thing that hides the overlay's drawing from the tool's observers — the shadow root already does that with the filter deleted. So SC3 must not be written as "a mutation inside the shadow root reaches no observer": that assertion is green before and after the filter is removed.

## Finding: The closed host still exposes exactly three things to a document observer: its insertion, its light children, and — only if asked — its attributes

- **Claim**: The host is a light-tree element, so an observer on `document.documentElement` with `{childList: true, subtree: true}` does receive (a) a `childList` record when the host is appended, whose `target` is the *parent* (`document.body`) with the host in `addedNodes`, and (b) any childList mutation on the host itself. Attribute writes on the host (inline style for rect tracking) reach it only if `attributes: true` is in the init — the two shipped observers do not set it.
- **Source**: DOM §4.3.3 `MutationRecord.target` ("For `childList`, it is the node whose children changed") and §4.2.3 insert ("queue a tree mutation record for parent with nodes"); `extension/relay.js:70` and `extension/relay.js:78` (`{ childList: true, subtree: true }`).
- **Confidence**: high
- **Why it matters here**: this is the whole surface an exclusion can act on, and it shows the trap: a filter keyed only on `record.target` does not suppress the host's insertion, because that record's target is the parent. The one mutation the tool itself performs and its own observer provably receives is exactly the one a target-only filter lets through.

## Finding: `composedPath()` truncates at the host for a closed root, so no page listener can see the overlay's inner nodes

- **Claim**: An event's `composedPath()` omits nodes in shadow trees whose root was created with `mode: "closed"`. For a click inside the overlay, the page — and a document-level listener the tool registers in either world — sees a path that stops at the host (`[host, body, html, document, window]`), never the rect or label element. The method returns "an array of the objects on which listeners will be invoked", so its value is only meaningful while a listener is running.
- **Source**: MDN `Event.composedPath()` — "This does not include nodes in shadow trees if the shadow root was created with its `ShadowRoot.mode` closed", with the worked `<open-shadow>`/`<closed-shadow>` example — https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath
- **Confidence**: high
- **Why it matters here**: the picker's click path is safe by construction, and the same fact removes a shortcut: the overlay's own inner nodes can never be an `event.target` the page resolves, so hover state must come from `elementFromPoint` and the tool's own root reference, not from event targets.

## Finding: `elementFromPoint` returns the host over the overlay, but the retarget-to-host rule was only resolved in 2026 — the picker must not lean on it

- **Claim**: CSSOM View defines `document.elementFromPoint(x, y)` as returning "the associated element" of the box that "would be a target for hit testing", and explicitly leaves hit testing out of scope; the CSSWG resolved only on 2026-05-06 that these methods "use the DOM retargeting rules to omit elements inside shadow trees and remove consecutive duplicates". Engines are reported in that thread to retarget today (Gecko by construction, Blink per the thread), so a point over the overlay's host yields the host — but retargeting is mode-independent, so `closed` buys `host.shadowRoot === null`, not a different hit-test result, and the guarantee is younger than the browsers this tool runs in.
- **Source**: https://drafts.csswg.org/cssom-view/#dom-document-elementfrompoint (steps 2 and the "specifics of hit testing are out of scope" note); https://github.com/w3c/csswg-drafts/issues/556 (description by rniwa, 2016; 2026-05-06 resolution); MDN `Document.elementFromPoint` (topmost `Element`; an element from another document's tree resolves to the parent element) — https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint
- **Confidence**: medium
- **Why it matters here**: the picker resolves every hover through `elementFromPoint`, so a point on the tracked rect can return the tool's own host. The host must therefore be `pointer-events: none` and the host identity must map to "the tool, not a candidate", or the picker reports the overlay as the picked element — the defect that reads as a page bug.

## Finding: "Exclusion" can only be an early-return record filter, and it must test `addedNodes`/`removedNodes` as well as `target`

- **Claim**: `MutationObserverInit` has no exclusion member and the host is necessarily a child of an observed ancestor, so no `observe()` target can exclude it; a narrower target is available only to a *new* observer that cares about one page subtree, and even then the host can sit inside that target. In practice AR-4 is a filter at the top of every tool-owned callback that drops each record whose `target` is the host or a shadow-including descendant of it **and** each record whose `addedNodes` or `removedNodes` contains the host or such a descendant.
- **Source**: DOM §4.3.1 `observe()` / `MutationObserverInit` (childList, attributes, characterData, subtree, attributeOldValue, characterDataOldValue, attributeFilter — nothing else) — https://dom.spec.whatwg.org/#dictdef-mutationobserverinit; §4.3.2 for the record contents; `extension/relay.js:70` (`observe(document.documentElement, …)`).
- **Confidence**: high
- **Why it matters here**: the plan can express this as one pure predicate over one host reference, which is this repository's convention; anything written as "observe a narrower target" is unimplementable for the two call sites that exist, and a target-only filter leaves the host's own insertion through.

## Finding: Exactly two observer call sites exist, both in `relay.js`, and both are in this generation's scope

- **Claim**: Shipped code constructs a `MutationObserver` in two places only — `extension/relay.js:67` and `extension/relay.js:75`, one per branch of the same load path — each observing `document.documentElement` with `{ childList: true, subtree: true }` (`:70`, `:78`) and each `disconnect()`ed on the first successful detection (`:68`, `:76`). Both are in scope: they are the widest target the platform allows, they would receive the host's insertion and any light-DOM change on the host, and their live window (from injection until `[ng-version]` appears) is exactly the window in which an overlay attached at `document_start` creates the host.
- **Source**: `extension/relay.js:64-81`; a grep for `Observer|observe(` over `extension/*.js`, `apps/**/*.ts` and `scripts/*.mjs` returns only these two `new MutationObserver` sites, their `.observe()` calls, and the spec-local pair below.
- **Confidence**: high
- **Why it matters here**: SC3 is a two-site assertion rather than a general one, and the ordering makes the host insertion one of the first records either observer sees — so the exclusion is exercised at the only moment these observers are alive.

## Finding: Every other candidate site is out of scope — a spec fixture, dev tooling, or not an observer at all

- **Claim**: (a) `apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts:460-483` builds two observers inside a Vitest spec over a detached fixture and `document.body` — spec-local, out of scope. (b) The page walkers `if (n.shadowRoot) walk(n.shadowRoot)` in `.commandcode/skills/control-ai-browsers/scripts/control.mjs:1293-1294` and `spikes/probes/broker-state.js:31-32` are development tooling, not extension code. (c) `extension/agent-main.js` registers no observer at all; its per-check `document.querySelectorAll("*")` (`:560`) is not a `MutationObserver`, so AR-4 does not reach it — but the host element *is* matched by `*`, passed to Angular's component getter, and skipped only because no instance comes back (`:566`).
- **Source**: `apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts:460,463,469,472,482`; `.commandcode/skills/control-ai-browsers/scripts/control.mjs:1293`; `spikes/probes/broker-state.js:31`; `extension/agent-main.js:552-583` (walk at `:560`, skip at `:566`).
- **Confidence**: high
- **Why it matters here**: it stops the plan widening AR-4 to code the charter does not govern (N4 limits scope to observers the tool owns) while keeping the one adjacent hazard on record: the host is a real element in the per-cycle document walk, so "no observer sees it" and "no traversal sees it" are different claims.

## Finding: Realm does not hide the host — an isolated-world observer sees the same DOM mutations as a MAIN-world one

- **Claim**: Content scripts "share access to the page's DOM" with the page and with each other while keeping separate JavaScript environments, so a `MutationObserver` created in `relay.js` (ISOLATED) receives the same records for the same nodes as one created in `agent-main.js`'s MAIN world or in a new overlay module. Moving the overlay between worlds hides nothing from the other world's observers; only the filter does.
- **Source**: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts — "Although the execution environments of content scripts and the pages that host them are isolated from each other, they share access to the page's DOM"; `extension/manifest.json:18-30` (relay declaration `:19-23`, MAIN-world agent `:24-29`).
- **Confidence**: high
- **Why it matters here**: it closes the shortcut "put the overlay in the other world and the relay will not see it", and it means the exclusion has to be applied once per observer, in every world that owns one — including whichever world the new overlay module lands in.

## Finding: The SC3 probe must mutate the host element, not the shadow root, and must pair it with a page mutation that does arrive

- **Claim**: A test that goes red when the filter is deleted mutates the light-tree host — `host.appendChild(page.createElement("span"))` (childList, `target` = host) and, when the observer's init includes `attributes`, `host.setAttribute(...)` — and separately asserts that a page mutation (`document.body.appendChild(pageSpan)`) *does* reach the observer. Both probes ride the ordinary inclusive-ancestor rule, so neither depends on shadow-DOM behaviour, while the shadow-root probe INTENT E6 describes would pass with the filter deleted.
- **Source**: DOM §4.3.2 (inclusive ancestors); `package.json:32` (`jsdom ^27.1`); `apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts:455-484` — a real `MutationObserver`, records pushed from the callback, `await new Promise((resolve) => setTimeout(resolve, 0))`, then `expect(records).toEqual([])` — the repository's existing shape for exactly this assertion.
- **Confidence**: high
- **Why it matters here**: this is the restatement the plan has to make for SC3 to have bite, and the paired page-mutation half is what stops the assertion passing vacuously (the repository's rule that every pin proves its own failing half).

## Finding: The relay harness needs two affordances before it can assert the filter at its own two sites

- **Claim**: `relay.test.mjs` boots the real `relay.js` in a `vm` sandbox whose `MutationObserver` stub records nothing and throws its callback away, so nothing today can read the `observe()` arguments or drive a record through the callback. Two affordances make the shipped filter assertable without changing behaviour: the stub keeps the callback (and the `observe()` arguments), and the test supplies the host node the filter compares against. Because the relay's callback calls `checkAngular()`, whose probe is `document.querySelector('[ng-version]')` (`extension/relay.js:42`), a counting `querySelector` stub turns "the record was filtered" into an assertion: a host-targeted record leaves the count unchanged, a body-targeted record increments it.
- **Source**: `extension/relay.test.mjs:34-46` (sandbox; stub class at `:41-43`), `extension/relay.js:41-42`, `extension/relay.js:64-81`.
- **Confidence**: high
- **Why it matters here**: it gives the plan a deterministic `node:test` route for both shipped sites — no jsdom and no browser — and it names the seam the filter requires: `relay.js` holds no reference to a host today (its only created node is the marker, `:50-54`), so the host, or an `isToolNode(node)` predicate, must be published by the overlay module and be reachable from the relay's world.

## Finding: The copyable SC3 test, as the plan should write it

- **Claim**: Take the jsdom route beside the overlay module, in `extension/<overlay>.test.mjs` (`package.json:11` already globs `extension/**/*.test.mjs`), and assert in five steps: (1) boot the module so it attaches the host and constructs its observer; (2) collect every record the tool callback passes — and, if the module exports its filter, the raw list before filtering; (3) `document.body.appendChild(pageSpan)`, await a macrotask, expect at least one passed record targeting `pageSpan`; (4) `host.appendChild(lightSpan)` and, only if the init sets `attributes`, `host.setAttribute("data-probe", "1")`, await a macrotask, expect zero passed records mentioning the host while the raw list holds at least one; (5) assert the host's own insertion record is absent from the passed list. Deleting the filter flips (4) and (5) to non-zero; deleting the `observe()` call flips (3) to zero, so the pin also proves it is watching.
- **Source**: `package.json:11` (`node --test "extension/**/*.test.mjs"`), `package.json:32` (`jsdom ^27.1`), `apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts:455-484` (macrotask flush before asserting records), `extension/relay.test.mjs:34-46` (vm-boot precedent).
- **Confidence**: medium
- **Why it matters here**: it is the difference between SC3 shipping as a real assertion and shipping as a green test of the platform's shadow-boundary behaviour; nothing here was executed, so the first task that writes it must confirm the record delivery in jsdom before claiming SC3.

## Assigned questions — answers

- ``Which `MutationObserver` call sites the tool owns today would observe a host subtree if the exclusion were dropped, and which of them are in this generation's scope?`` → Two shipped sites, both in `extension/relay.js` (`new MutationObserver` at `:67` and `:75`, `observe(document.documentElement, { childList: true, subtree: true })` at `:70` and `:78`, `disconnect()` at `:68`/`:76`), and both are in this generation's scope: with the exclusion dropped each receives the `childList` record for the host's own insertion (target `document.body`, host in `addedNodes`) and any light-tree childList change on the host, while nothing inside the closed shadow root ever reaches them — records go only to observers on the target's plain inclusive ancestors, so an *open* root is equally opaque and `closed` is not what protects the overlay's drawing (`https://dom.spec.whatwg.org/#queueing-a-mutation-record`). Nothing else is in scope: `apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts:460-483` is a spec-local fixture, `extension/agent-main.js` owns no observer (its `document.querySelectorAll("*")` at `:560` is a traversal, not an observer), and `control.mjs:1293`/`broker-state.js:31` are development tooling. Exclusion can therefore only mean an early-return filter over records — dropping each record whose `target` is the host or a shadow-including descendant of it, and each record whose `addedNodes`/`removedNodes` contains the host — applied in those two callbacks and in every observer the new overlay module adds, in whichever realm it lives, because content scripts share one DOM; and SC3 must mutate the host element in the light tree, not the shadow root, or deleting the filter changes nothing.

## Dead ends

- `https://raw.githubusercontent.com/web-platform-tests/wpt/master/css/cssom-view/elementsFromPoint-shadowroot.html`, and its jsdelivr mirror — both refused by the fetcher, so the WPT case that would pin engine behaviour for `elementsFromPoint` across a shadow root could not be read; the CSSWG issue was used instead, which is why that finding is `medium`.
- `https://issues.chromium.org/issues/510323353` — sign-in wall; the Blink-side statement of the same bug is unreadable from here, so "Blink retargets today" rests on a comment in the CSSWG thread.
- jsdom's `MutationObserver` behaviour around shadow roots — this checkout holds no `node_modules` and installs are forbidden, so nothing was executed; the recommended assertion is deliberately built on light-tree mutations so that it does not depend on that behaviour.
- A narrower `observe()` target as the exclusion mechanism — no API path: `MutationObserverInit` has no exclusion member, and the host is always a child of an observed ancestor.
- `spikes/probes/broker-state.js:31` and `.commandcode/skills/control-ai-browsers/scripts/control.mjs:1293` as precedent for walking an overlay's shadow root — both walk `open` roots only (`n.shadowRoot` is null for a closed root), so they say nothing about the tool's own host.

