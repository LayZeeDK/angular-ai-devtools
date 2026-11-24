---
id: T001
title: Measure a schema-disabled field on the portal and record what the page states
wave: 1
status: done
deps: []
agent: build_T001
base: 5eaed2a15a220db477aa668b7896dd4220c03883
worktree: null
task_branch: null
files:
- scripts/m066-schema-record.mjs
- scripts/m066-schema-record.test.mjs
- research/raw/m066-schema-record.json
---

# T001 — Measure a schema-disabled field on the portal and record what the page states

## Context

The roadmap says the panel names the schema node that declared a field disabled or hidden. C1 measured that no Signal
Forms schema is captured anywhere in this repository, so the first task establishes what a page can be asked, before any
criterion is claimed to be provable.

## Approach

Drive the portal through the existing browser control skill, read the injector for a schema holder in the shape M065 read
`TitleStrategy`, and write one record with three sections: the field states observed, the schema holder resolved or
absent, and the input each node read. A capture writes the record only under `M066_CAPTURE=1`; every default run reads it
and writes nothing.

## Intent coverage

- SC1, SC2, SC3

## Acceptance criteria

- AC1: the `## Log` names the capture, the route it drove, and the value it recorded.
- AC2: the `## Log` names the mutant and the field that reddened.
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

- Captured `/contract/create` on the Insurance Portal, served by the project's own control skill at commit `92d46ec`,
  with `M066_CAPTURE=1 node scripts/m066-schema-record.mjs`, writing `research/raw/m066-schema-record.json`: four fields,
  `policyNumber` `disabled: false` read from `<input id="policyNumber">`; `insuranceStartOn` and `customer` unread because
  both are custom elements with no boolean `disabled`; `status` carried by no element while its field node reports
  `disabled() === true` from the field tree; `schema` absent from every injector read (100 provider records, 0 schema
  tokens); 0 inputs.
- Mutant: `policyNumber.disabled` flipped from `false` to `true` in a temporary copy of the record reddens six assertions
  with `defect: fields[policyNumber].disabled is true but the element read false`. The committed record was never written
  by a default run; its sha256 is unchanged at `de03f2f5`.
- `scripts/m066-schema-record.test.mjs` reports 14 pass, 0 fail with the portal torn down, so the default run is read-only
  and browser-free; `npx prettier --check` on both scripts is clean.
- Landed paths: `scripts/m066-schema-record.mjs`, `scripts/m066-schema-record.test.mjs`, `research/raw/m066-schema-record.json` — each is read from this tree, ready.
