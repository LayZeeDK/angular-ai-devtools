---
id: T001
title: Measure a schema-disabled field on the portal and record what the page states
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- scripts/m066-schema-record.mjs
- scripts/m066-schema-record.test.mjs
- research/raw/m066-schema-record.json
---

# T001 — Measure a schema-disabled field on the portal and record what the page states

## Context

The roadmap says the panel names the schema node that declared a field disabled or hidden. C1 measured that no Signal Forms schema is captured anywhere in this repository, so the first task establishes what a page can be asked, before any criterion is claimed to be provable.

## Approach

Drive the portal through the existing browser control skill, read the injector for a schema holder in the shape M065 read `TitleStrategy`, and write one record with three sections: the field states observed, the schema holder resolved or absent, and the input each node read. A capture writes the record only under `M066_CAPTURE=1`; every default run reads it.

## Intent coverage

- SC1, SC2, SC3

## Acceptance criteria

- AC1: the task's `## Log` names the capture, the route it drove, and the value it recorded.
- AC2: the task's `## Log` names the mutant and the field that reddened.
- AC3: the record it writes is committed and read by every default run.

## Files

Every path this task may touch, and nothing else:

- `scripts/m066-schema-record.mjs`
- `scripts/m066-schema-record.test.mjs`
- `research/raw/m066-schema-record.json`

## Interface contract

Byte-identical across the tasks that share it:

```ts
// extension/schema-attribution.js — the only reader of a schema attribution
export function schemaAttribution(record, facts) {
  return { state, field, node, input, reason, observed }
}
```

`state` is one of `declared`, `no-node`, `no-record`, `cannot-tell`. `node` and `input` are present only when the record
carries them; `reason` names why the attribution is absent.

## Verify

```bash
node --check scripts/m066-schema-record.mjs && node --test scripts/m066-schema-record.test.mjs && npm run check
```

## Log

- pending
