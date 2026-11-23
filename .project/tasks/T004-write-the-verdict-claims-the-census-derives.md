---
id: T004
title: Write the verdict claims the census derives
wave: 4
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m064-verdict-claims.json
  - scripts/chunk-failure-claims.test.mjs
---

# T004 — Write the verdict claims the census derives

## Goal

Record the intent's five-column edge table as a claims record whose citations the census can check.

## Context

Every milestone writes its own claims record; the census counts them and refuses a claim no range carries.

## Approach

One record, one suite: eight claims, each with a citation that resolves at this head and a test that reddens when the claim stops being true.

## Interface contract

The join exports exactly this shape, and the surface renders it and nothing else:

```js
{ state, specifier?, routePath?, status?, hash?, consideredCount?, reason? }
```

`state` is one of `missing-import` (the import failed and the record names the specifier), `never-completed` (the
request produced no response status), `resolved` (the import loaded, so there is no failure to report) or
`cannot-tell` (a reason string on its own). No field is synthesised: `hash` is present only when the record carried
one, and `status` only when a response arrived.

## Acceptance criteria

1. SC1: eight claims, one per edge row, each citation resolving at this head.
2. SC2: the never-completed claim is present and a mutant that deletes its citation reddens naming the claim.
3. SC4: no claim names a remedy, a cause or an identity the record did not carry.

## Intent coverage

- SC1
- SC2
- SC4

## Verify

```bash
node --test scripts/chunk-failure-claims.test.mjs
```

## Log

- pending.
