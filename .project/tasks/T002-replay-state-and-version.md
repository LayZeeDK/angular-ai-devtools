---
id: T002
title: Replay the inspected page's state and version to the panel on one request
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/relay.js
  - extension/relay.test.mjs
  - extension/background.js
  - extension/background.test.mjs
  - apps/angular-ai-devtools/src/app/extension-message.service.ts
  - apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
---

# T002 — Replay the inspected page's state and version to the panel on one request

## Context

The page announces `angular-ai:state` once, at the moment `extension/agent-main.js` reaches a terminal answer (`:583-591` clears its 100 ms retry interval on `installed`/`notsupported`), and the relay only forwards live events. The panel registers its `chrome.runtime.onMessage` listener when the panel document loads (`extension-message.service.ts:44-50`), which is *after* the page's content script ran, so `stateReceived()` stays `false` for the normal DevTools session — the "cannot tell" state is today's default rather than an edge case. The version has its own gap: `extension/relay.js:28-41` reads `document.querySelector('[ng-version]')` once per page load and sends `angular-detected`, and `extension-message.service.ts:58-59` writes that version into the cause log with no signal, so no panel code can gate or display it. Both are fixed the same way and in one round trip: the relay latches what it forwards, the panel asks once, and the panel's service writes the answer through the signals the chip and the group gate read.

## Approach

- **Last-known-state replay, not a second announcement.** `extension/relay.js` is the only context that ever sees the page's events, so it latches: keep the last `angular-ai:state` detail it forwarded and the `angular-detected` version it already computes, then answer one request from the panel. Follow the latch shape `relay.js` already uses for `angularDetected`. No new permission, no `chrome.storage`, and **no page-side handler**: `extension/agent-main.js` is not touched, because it announces nothing at all without `window.ng` (`:145-147`) and would be dead on exactly the production page where the version is the only fact available.
- **One request, routed by tab.** The panel names its inspected tab (`chrome.devtools.inspectedWindow.tabId`, already read at `extension-message.service.ts:47`) and `extension/background.js` routes the request to that tab with `chrome.tabs.sendMessage(tabId, …)`; the relay's reply comes back through the sender's callback and is re-emitted to the panel as the two messages the panel already understands. A request with no known tab answers with a named refusal instead of silence.
- **Ordering and idempotency.** A replay must be safe to run after a live announcement: the same payload arriving twice may only overwrite equal values, so `stateReceived` stays `true` and a second detection line is at worst a duplicate cause-log entry (acceptable; do not add dedup state to the service).
- **`appVersion` is the new signal** and it is the only new panel-side state: `signal<string | null>(null)`, written from the replayed `angular-detected` reply *and* from the live `angular-detected` message, so a panel that was open when the page loaded is not worse off.
- **Pitfalls this task must not walk into.** `zoneMode` in the payload reads `noop` on the rejected-Zone path (`extension/agent-main.js:35,163-167`), so a replay must carry it verbatim and never reinterpret it. `readFeatureBits` returns `{}` for a map with no booleans (`extension-message.service.ts:98-110`), so the replay must carry the map as received and leave the empty-vs-missing decision to the adapter. The service must not throw when `chrome.runtime.sendMessage` is absent (a plain page load or a spec), and must send **exactly one** request per construction — a retry loop would paper over a routing failure the reviewer needs to see.
- **Tests.** `extension/relay.test.mjs` and `extension/background.test.mjs` boot the real scripts in a `vm` sandbox; extend each `boot()` with the members the new path uses (`chrome.runtime.onMessage`, `chrome.tabs.sendMessage`) and keep the same style. `extension-message.service.spec.ts` stubs `globalThis.chrome` per case; add `runtime.sendMessage` there and assert the one-request behaviour and all four signals.

## Interface contract

- `ExtensionMessageService` exposes `features: Signal<Readonly<Record<string, boolean>> | null>`, `zoneMode: Signal<string | null>`, `stateReceived: Signal<boolean>`, and `appVersion: Signal<string | null>` (new); the replay round trip is `{ type: 'angular-ai:state-request', tabId }` panel to background, `chrome.tabs.sendMessage(tabId, { type: 'angular-ai:replay-request' })` background to relay, and the relay's reply `{ state: <latched angular-ai:state detail> | null, version: string | null }`, which the background re-emits to the panel as `{ type: 'angular-ai:state', ...state, tabId }` when a state was latched and `{ type: 'angular-detected', version, tabId }` when a version was latched.

## Intent coverage

- None

## Acceptance criteria

1. `extension/relay.js` latches the last `angular-ai:state` payload it forwards and the `angular-detected` version, and answers one `angular-ai:replay-request` by returning exactly that latch, so state that arrived before the request is delivered after it.
2. `extension/background.js` routes `angular-ai:state-request` to the tab id the request names, relays the relay's reply to the panel as the two messages above, and answers a request that names no known tab with a named refusal rather than nothing.
3. `ExtensionMessageService` sends exactly one `angular-ai:state-request` at construction, writes a reply through `features`, `zoneMode` and `stateReceived`, writes the replayed or live version into the new `appVersion` signal, and does not throw when `chrome.runtime.sendMessage` is absent.
4. `extension-message.service.spec.ts` proves: one request per construction; a reply populates all four signals; a live `angular-detected` sets `appVersion`; and no reply leaves `appVersion()` `null` and `stateReceived()` `false`.
5. `extension/relay.test.mjs` and `extension/background.test.mjs` prove the replay end to end over the two scripts: a state forwarded before the request is returned by the request's answer, and the routing names the requested tab id.
6. The milestone adds no DOM to the inspected page and no permission: the only element the relay creates is its existing `angular-ai-devtools-marker`, unchanged in position and text, and `extension/manifest.json` keeps its base bytes.

## Verify

```bash
npm ci --include=dev && npm run check && node --test extension/relay.test.mjs extension/background.test.mjs && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. -->

Heavy: yes

## Log

- 2026-11-02 — created by planner
