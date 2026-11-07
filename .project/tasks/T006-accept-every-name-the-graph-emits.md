---
id: T006
title: Accept every name the graph emits
wave: 4
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/resource-lifecycle.js
  - scripts/resource-lifecycle.test.mjs
  - apps/angular-ai-devtools/src/app/panel-resource.ts
  - scripts/panel-resource.test.mjs
  - research/raw/m022-ng-context.json
  - research/raw/m036-verdict-claims.json
  - research/raw/m035-onpush-metadata.json
---

# T006 — Accept every name the graph emits, and stop reusing the unread reason

## Context

The waves 2–3 panel verified three defects in the join and left three stale literals behind. The largest is a guard that
fails on truth: `extension/resource-lifecycle.js:79` gates the identity on `/^Resource#\S+$/`, but
`createDebugNameObject` (`_resource-chunk.mjs:514-518`) applies no sanitisation, so `debugName: 'Order Items'` yields the
real label `Resource#Order Items.status` and is refused as `resource-unnamed`. A resource the developer *did* name is
reported unnamed.

The second is a misused reason: `local` is one of six `ResourceStatus` values (`_api-chunk.d.ts:149`) and `set()` writes
it (`_resource-chunk.mjs:347-358`), so `Resource#<name>.status` genuinely reads `local`; answering it `status-unavailable`
claims a read that succeeded had failed.

The third is stale prose: `research/raw/m022-ng-context.json` and `research/raw/m036-verdict-claims.json` both say the
fixture page is "routed at /resource", while `spikes/ng222-app/src/app/app.routes.ts:29` routes it at `resource-states`.

Also stale: `scripts/panel-resource.test.mjs` lists four reasons under "The four reasons the join can name" when the join
has named five since T005, and `research/raw/m035-onpush-metadata.json` still records a development build the current
fixture no longer produces.

## Approach

Widen the identity gate to accept any `Resource#` followed by a non-empty name, including one containing spaces, while
still refusing a bare `Resource`, an empty name and an untrimmed value. Answer `local` as its own finding that says the
value was set rather than loaded, distinct from the five load statuses. Correct the two route literals to the routed path,
extend the pane's reason list to five and drive `resource-unnamed` through it, and re-record the stale M035 build
recording. Record in the Log that the chained-`loading` case — a resource whose params re-throw `ResourceParamsStatus.LOADING`
while an upstream resource is loading, leaving `extRequest` with no `request` — remains unanswered and is the next gap.

## Interface contract

## Files

- `extension/resource-lifecycle.js`
- `scripts/resource-lifecycle.test.mjs`
- `apps/angular-ai-devtools/src/app/panel-resource.ts`
- `scripts/panel-resource.test.mjs`
- `research/raw/m022-ng-context.json`
- `research/raw/m036-verdict-claims.json`
- `research/raw/m035-onpush-metadata.json`

## Acceptance criteria

1. held-out E2: a graph label whose name contains a space is accepted as a finding, and a bare `Resource`, an empty name, and an untrimmed value are still refused (held-out E2)
2. held-out E2: `local` produces a finding that says the value was set, not `status-unavailable` (held-out E2)
3. both recordings name `resource-states` and no recording says the fixture page is routed at `/resource`
4. the pane's reason list covers all five reasons and `resource-unnamed` is rendered through it
5. the M035 build recording is re-recorded at this head, or its staleness is stated in the file itself

## Verify

```bash
node --experimental-strip-types --test "scripts/resource-lifecycle.test.mjs" && node --experimental-strip-types --test "scripts/panel-resource.test.mjs" && node --experimental-strip-types --test "scripts/recording-consistency.test.mjs"
```

## Intent coverage

- SC1 — the join names what the graph reports, including a name with a space and a locally-set value
- SC4 — the unread reason is reserved for a read that failed

## Log

- dispatched
