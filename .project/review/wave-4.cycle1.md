# Wave 4 review — M036 resource-lifecycle

- Cycle: 1
- Depth: full
- Wave verdict: pass
- Tasks reviewed: T006
- Reviewed HEAD: the commit carrying `T006: Accept every name the graph emits`
- Reviewer: Beam 1.0 Free (high); adjudicated by the orchestrator

## T006 — Accept every name the graph emits: pass

- ✅ The identity gate now accepts a name containing a space, which `createDebugNameObject` can really emit, while a bare `Resource`, an empty name and any untrimmed value are still refused; mutant M8 narrows the gate back and reddens `spaced-name-accepted` (`extension/resource-lifecycle.js:97`).
- ✅ `local` is a sixth status with its own branch answering "set locally (the value was set, not loaded)" before the params gate; mutant M9 restores the old `status-unavailable` answer and reddens `local-is-a-set-value`.
- ✅ `status-unavailable` is now returned only when the status is absent, non-string, empty or outside the six statuses, so the unread reason is reserved for a read that failed (`extension/resource-lifecycle.js:150-152`).
- ✅ The pane's reason list reaches five and `resource-unnamed` is driven through the join; pane mutant M6 gates the reasons on four and reddens `unnamed-reason-rendered`.
- ✅ Both recordings name `resource-states`; the remaining `/resource` references are the panel's own route (`apps/angular-ai-devtools/src/app/app.routes.ts:109`) and unrelated file-path matches.
- ✅ `research/raw/m035-onpush-metadata.json` was re-recorded through its own capture: only `capturedAt`, `url`/`pageUrl` and the two chunk names moved, and every other field is byte-identical, so no number was hand-edited.
- ✅ 36/36 join, 22/22 pane, 7/7 recording-consistency, `tsc` 0 on both projects, prettier clean.

### Observation, informational

- **low** — the gate is permissive by construction beyond its documented refusal set: an embedded NUL or a punctuation-only name would pass, and a full node label misused as an identity cannot be distinguished from a legitimate dotted name. No test pins those, and the reviewer would not block on them.

## Intent coverage

### SC1 — On the fixture, a resource whose state is `loading` produces a finding naming the resource, its current state, and the status of its params, and naming no cause that lives inside the loader: pass

- ✅ `scripts/resource-lifecycle.test.mjs` pins the finding for a loading resource with each supplied field and asserts no cause is constructed; `extension/resource-lifecycle.js` builds exactly `{state, resource, status, params}`.

### SC4 — Where the answer would require the loader's own promise or an HTTP outcome the page does not carry, the module reports "cannot tell" with that reason rather than naming a stuck request: pass

- ✅ The four absence reasons are produced and pinned, and no path emits a loader, stall, timeout or request claim (`scripts/resource-lifecycle.test.mjs`, `assertNoClaim`).
