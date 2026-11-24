---
id: T002
title: Join the schema record into four attribution states, purely
wave: 3
status: done
deps: 
- T001
agent: build_T002
base: 9345945c39827d0342abd3801690513222a86e40
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

- `scripts/schema-attribution.test.mjs` reports 27 tests, 27 pass, 0 fail. The join reads the committed
  `research/raw/m066-schema-record.json` and answers `no-node` for all four fields, because the record states
  `schema.absent: true` and carries `inputs: []`; `no-node` is the measured absence, not a failure of the field.
- Seven mutant blocks, each pinning the untouched module first and asserting its exact first message line. `DECLARED`
  reddens with `DECLARED: a record carrying the node and the input it read must state declared, never no-node`;
  `CANNOT-TELL` with `CANNOT-TELL: a record that names a node and records no input for it must state cannot-tell, never
  declared`; `NO-NODE` with `NO-NODE: the committed record states the schema is absent, so a field it carries no node for
  must state no-node, never cannot-tell`; `NO-RECORD` with `NO-RECORD PARSE: a record that does not parse must state
  no-record, never a state read off a string`; `SINGLE LIST` with `SINGLE LIST: a field outside the declared list must
  state cannot-tell, never no-node`; `INVENTED STATE` with `INVENTED STATE: observed must be the record row copied
  unchanged, never what the facts carry`; `INPUT PRESENCE` with `INPUT PRESENCE: a node whose input was recorded as false
  read something, so it must state declared, never cannot-tell`.
- The single list is proven directly: a write to `FIELD_NAMES[0]`, a `push` and a `length` write each throw, and the
  refusal message names the four field names. `npx prettier --check` on both files is clean, and the suites that
  enumerate `extension/` sources pass at 58 of 58.
- Landed paths: `extension/schema-attribution.js`, `scripts/schema-attribution.test.mjs`, `research/raw/m066-schema-record.json` — each is read from this tree, ready.
