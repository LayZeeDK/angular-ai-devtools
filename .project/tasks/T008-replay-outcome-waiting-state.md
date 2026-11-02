---
id: T008
title: Separate an outstanding or failed replay from the non-Angular refusal
wave: 3
deps: [T002, T004, T006]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/extension-message.service.ts
  - apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
  - apps/angular-ai-devtools/src/app/panel-context.ts
  - apps/angular-ai-devtools/src/app/panel-context.spec.ts
  - apps/angular-ai-devtools/src/app/feature-fingerprint.ts
  - apps/angular-ai-devtools/src/app/feature-fingerprint.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - tests/held-out/feature-fingerprint-chip.test.mjs
---

# T008 — Separate an outstanding or failed replay from the non-Angular refusal

## Context

The final gap review blocked the milestone on one person-visible false claim: a panel opened on a real Angular page renders "No Angular root found on this page" before the one-shot replay answers, and permanently when it never answers, because the classifier's inputs for a silent Angular page and a non-Angular page are the same pair (`final-gap-3.md` § Finding, P001). Wave 2 delivered the relay latch, the one request and the three-state classifier, but `ExtensionMessageService.requestReplay` sends that request with an empty callback, so the panel throws away the only evidence that separates "not answered yet" from "answered, no root". The Surface contract's loading line — "the chip and the list show a waiting line naming that the page has not answered yet" — was never implemented, and it is what this repair adds. The eight-entry fingerprint, the `cannot-tell` state, the group projection, the route entry and the pinned bundle are unchanged.

## Approach

- **Four inputs, one precedence rule.** `featureFingerprint` keeps `stateReceived` and `version` and gains the replay's outcome. A received state still decides first — the fingerprint, or `cannot-tell` when the announced map holds no boolean — and only a page that announced nothing consults the outcome: `outstanding` renders the waiting line, `failed` the transport state, `answered` today's two answers (`cannot-tell` when a version arrived, `no-angular-root` when neither did). That order is what keeps the eight-entry chip byte-identical and keeps `cannot-tell` reachable.
- **The whole new shape.** `ExtensionMessageService` gains `replayOutcome: Signal<'outstanding' | 'answered' | 'failed'>` (initial `'outstanding'`; `'answered'` when the one request's callback receives a reply that is not `{ ok: false }`, `'failed'` for `{ ok: false }` or when the runtime offers no `sendMessage`), `panel-context.ts` carries it unchanged as `PanelContext.replayOutcome` and `PanelSignals.replayOutcome: Signal<'outstanding' | 'answered' | 'failed'>`, and `featureFingerprint` answers `{ kind: 'awaiting-page'; message: string }` while the outcome is `'outstanding'` on a page that announced no state, `{ kind: 'transport-failed'; message: string }` for `'failed'`, and `no-angular-root` only when the outcome is `'answered'` and neither a state nor a version arrived.
- **The answer is already on the wire.** `background.js:36-51` answers the request asynchronously through the send callback: `{ ok: false, reason }` when no relay answered for the tab, `{ ok: true }` after it has re-emitted the latched state and version messages. Read that callback instead of discarding it, and write the outcome last, so a render never sees "answered" while the latched state message is still in flight.
- **Do not touch the extension scripts.** `relay.js`, `background.js` and `agent-main.js` stay byte-identical: the reply already separates an answered replay from a failed one and the panel is the file that threw it away. `manifest.json`, the relay's page badge and the no-DOM rule (AR-3) are untouched with them.
- **`outstanding` must stay reachable, and must end.** The value starts `outstanding`. When the runtime offers no `sendMessage`, or the send throws, record `failed` rather than leaving the panel waiting for an answer nothing will deliver; a callback that never fires legitimately stays `outstanding` for as long as it is true. Keep exactly one request per construction and no retry — the service spec's case pins it.
- **Carry, never narrow.** `buildPanelContext` copies the outcome into `PanelContext` as it arrived, and still returns `facts: {}` with no `supported` key for a page that has not announced state, so `app_facts` keeps answering `host-unavailable` instead of reading silence as a claim.
- **Words that stay distinct (N4).** The waiting line names that the page has not answered yet; the transport line names the extension message transport that delivered no answer. Neither repeats the refusal sentence, neither carries an `entries` field, and the refusal keeps its exact existing text for the answered case.
- **The component adds no decision.** Its one `[attr.data-testid]="state.kind"` branch already renders any non-fingerprint state, so the repair threads `this.ext.replayOutcome` through `panelSignals()` and lets the two new kinds render as themselves — no second classifier, no per-state template branch, no model call (N3).
- **Specs and the held-out suite.** Every `PanelSignals` literal in the four specs and in the held-out suite must name an outcome. The held-out suite's silent-page case today reads a bare `signals({})` and asserts the refusal; that default must become an explicit answered outcome, so the suite proves each of the four outcomes rather than inheriting one. Keep the plain-node load intact: the two pure modules carry type-only imports at most.
- **Pitfalls.** `tool-groups.ts` opens no group while the page has announced nothing, so the projection needs no change — do not widen this repair into it or into its held-out suite; a new group-list state is not part of the fix direction. Do not reword `cannot-tell`'s version-named sentence: the existing specs and the held-out suite assert it.

## Interface contract

- `ExtensionMessageService` exposes `features: Signal<Readonly<Record<string, boolean>> | null>`, `zoneMode: Signal<string | null>`, `stateReceived: Signal<boolean>`, and `appVersion: Signal<string | null>` (new); the replay round trip is `{ type: 'angular-ai:state-request', tabId }` panel to background, `chrome.tabs.sendMessage(tabId, { type: 'angular-ai:replay-request' })` background to relay, and the relay's reply `{ state: <latched angular-ai:state detail> | null, version: string | null }`, which the background re-emits to the panel as `{ type: 'angular-ai:state', ...state, tabId }` when a state was latched and `{ type: 'angular-detected', version, tabId }` when a version was latched.
- `panel-context.ts` exports `PanelSignals` (the four signals above plus `notSupported: boolean` and `notSupportedReason: string | null`), `PanelContext = { readonly facts: Readonly<Record<string, unknown>>; readonly version: string | null; readonly stateReceived: boolean }`, and `buildPanelContext(signals: PanelSignals): PanelContext`; with `stateReceived === false` it returns `facts = {}` with no `supported` key, and with `stateReceived === true` it returns `{ supported: !notSupported, reason: notSupportedReason, zoneMode: zoneMode === 'zone' || zoneMode === 'noop' ? zoneMode : 'unknown', features }` where `features` appears only when the signal is not null, and `version` is the trimmed `appVersion` or null.
- `feature-fingerprint.ts` exports `FeatureFingerprintEntry = { readonly name: string; readonly present: boolean }` and `FeatureFingerprint` = `{ kind: 'no-angular-root'; message: string }` | `{ kind: 'cannot-tell'; message: string; version: string | null }` | `{ kind: 'fingerprint'; entries: readonly FeatureFingerprintEntry[]; text: string; supported: boolean; reason: string | null; zoneMode: 'zone' | 'noop' | null }`, plus `featureFingerprint(context: PanelContext, featureNames: readonly string[]): FeatureFingerprint`, where entries follow the given order, `present` is `facts.features[name] === true`, `text` joins `<name>: present` / `<name>: absent` with a middle dot, and `no-angular-root` means no version and no state.

<!-- The repair's added shape, recorded here beside the shared contract it extends. It is
     outside the bullet list on purpose: the three bullets above must stay byte-identical with
     T002, T004 and T006, which this repair may not edit, and the brief gate rejects a contract
     bullet no other task shares. Binding all the same: `ExtensionMessageService` gains
     `replayOutcome: Signal<'outstanding' | 'answered' | 'failed'>` (initial `'outstanding'`;
     `'answered'` when the one request's callback receives a reply that is not `{ ok: false }`,
     `'failed'` for `{ ok: false }` or when the runtime offers no `sendMessage`), `panel-context.ts`
     carries it unchanged as `PanelContext.replayOutcome` with
     `PanelSignals.replayOutcome: Signal<'outstanding' | 'answered' | 'failed'>`, and
     `FeatureFingerprint` gains `{ kind: 'awaiting-page'; message: string }` for an `'outstanding'`
     outcome on a page that announced no state and `{ kind: 'transport-failed'; message: string }`
     for a `'failed'` one, with `no-angular-root` returned only when the outcome is `'answered'` and
     neither a state nor a version arrived. -->

## Intent coverage

- SC1
- SC3

## Acceptance criteria

1. `ExtensionMessageService` exposes `replayOutcome` starting at `'outstanding'`, and the one `angular-ai:state-request` per construction writes `'answered'` from a reply that is not `{ ok: false }` and `'failed'` from `{ ok: false }` — or from a runtime that offers no `sendMessage` — with exactly one request sent and no throw on either path.
2. `buildPanelContext` copies that outcome into `PanelContext.replayOutcome` unchanged, and still returns `facts: {}` with no `supported` key for a page that announced no state, at every outcome.
3. `featureFingerprint` on a page that announced no state with the outcome `'outstanding'` returns `{ kind: 'awaiting-page'; message }`, where the message names that the page has not answered yet, the result has no `entries` field, and its message is not `No Angular root found on this page`.
4. With the outcome `'failed'` and no state the result is `{ kind: 'transport-failed'; message }` whose message names the extension message transport, carries no `entries` field, and is not the refusal text.
5. SC3 — `no-angular-root` renders only for an `'answered'` outcome with no state and no version; neither an outstanding nor a failed outcome yields it, so the refusal is a conclusion about an answered page rather than a default.
6. SC1 — the eight-entry fingerprint is unchanged: an answered reply carrying state with at least one boolean still returns `kind: 'fingerprint'` with the eight names in the caller's order and byte-identical `text`, and an answered reply with a version and no state still returns `kind: 'cannot-tell'` naming that version.
7. `chat-entry.component.ts` passes `this.ext.replayOutcome` into `buildPanelContext` and renders the two new states through the `data-testid` values `awaiting-page` and `transport-failed`, with no `chip-entry` row rendered in either.
8. The specs and the held-out suite prove the five behaviours: before the answer the chip shows the waiting line and never the refusal; a failed replay shows the transport state; an answered replay without a version shows the refusal; an answered replay with a version and no state still shows `cannot-tell`; and the eight-entry fingerprint is unchanged, with `tests/held-out/feature-fingerprint-chip.test.mjs` covering the pure-module cases under `node --experimental-strip-types`.

## Verify

```bash
npm ci --include=dev && npm run check && node --test tests/held-out/feature-fingerprint-chip.test.mjs && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts --include=apps/angular-ai-devtools/src/app/extension-message.service.spec.ts --include=apps/angular-ai-devtools/src/app/feature-fingerprint.spec.ts --include=apps/angular-ai-devtools/src/app/panel-context.spec.ts
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing installed. -->

Heavy: no

## Review findings

### Risk: Three page classes are distinguishable at the surface without over-claiming

Criterion: Three page classes are distinguishable at the surface without over-claiming

- **Source**: P001 in `PATCH-FINDINGS.md`, quoting `final-gap-3.md` at reviewed HEAD 48b9d321365efac6377873c1babcea0d8b6badb8.
- **Evidence**: BLOCKED. SC1's absence logic, SC3's refusal wording and shape, and N4's `cannot-tell` state are correct in the pure module, but a real Angular page can be shown the non-Angular refusal — transiently on every panel open and permanently on a failed replay — because the classifier cannot distinguish "replay not answered yet" from "no Angular root": both are `stateReceived=false, version=null`. The Surface contract's loading state was never implemented, and the false claim is person-visible, so this is a blocked false claim, not an acceptable transient.
- **Fix direction**: Give the classifier a fourth input that separates an outstanding replay from a concluded "no root" — e.g. a `replayAnswered` (or replay-failed) signal on `ExtensionMessageService`, threaded through `PanelSignals`/`PanelContext` so `featureFingerprint` returns a distinct waiting state (the Surface contract's loading line) while the replay is outstanding, and a transport-named state (not "No Angular root found on this page") when the replay fails. Only after the replay has answered without a version should `no-angular-root` render.

## Log

- 2026-11-02 — created by planner as the wave 3 repair task for the final gap review's P001
