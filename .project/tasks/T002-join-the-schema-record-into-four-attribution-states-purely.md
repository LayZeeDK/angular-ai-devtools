---
id: T002
title: Join the schema record into four attribution states, purely
wave: 2
status: pending
deps: 
- T001
agent: null
base: null
worktree: null
task_branch: null
files:
- extension/schema-attribution.js
- scripts/schema-attribution.test.mjs
- research/raw/m066-schema-record.json
---

# T002 — Join the schema record into four attribution states, purely

## Context

The join is the milestone. It reads the record T001 writes and nothing else, and it answers four states so the surface never has to invent one.

## Approach

One pure function over the record and the field facts. `declared` carries the node and the input that node read; `no-node` carries the field state with no attribution; `no-record` carries the absence of a record; `cannot-tell` carries its reason. A recording proxy over the exported field list throws on any write, so a second source of the field state reddens by name.

## Intent coverage

- SC1, SC2

## Acceptance criteria

- AC1: the task's `## Log` names the command that proved it and the string the mutant produced.
- AC2: the task's `## Log` names the command that proved it and the string the mutant produced.
- AC3: the task's `## Log` names the command that proved it and the string the mutant produced.

## Files

Every path this task may touch, and nothing else:

- `extension/schema-attribution.js`
- `scripts/schema-attribution.test.mjs`
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
node --check extension/schema-attribution.js && node --test scripts/schema-attribution.test.mjs && npm run check
```

## Log

- pending
