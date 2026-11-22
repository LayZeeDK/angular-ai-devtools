---
id: T002
title: Answer from the provider record purely
wave: 2
status: done
deps: [T001]
agent: build_T002
base: f5d8030de2aa55b0d6f37ece57130fb515f687f9
worktree: null
task_branch: null
files:
  - extension/locale-correctness.js
  - scripts/locale-correctness.test.mjs
---

# T002 — Answer from the provider record purely

## Goal

Publish `localeCorrectness(records)` as a pure join over the record T001 measured: four states, one named absence, no derived field, proved by mutants that name their defect.

## Context

The join is the milestone: every criterion that names an absence is satisfied or broken here, and the purity is proved the way `error-routing.js` proves it — two `node:vm` contexts with throw-on-touch globals.

## Approach

Write `extension/locale-correctness.js` exposing `localeCorrectness` on `globalThis.angularAiLocaleCorrectness`, returning the six-field object in every state. Pin every state and every absence in `scripts/locale-correctness.test.mjs`, with one mutant per criterion.

## Interface contract

`localeCorrectness(records)` is a pure function of the records it is given. It returns, in every state, one object with six fields: `state`, `token`, `provider`, `importPath`, `absences`, `claims`. `state` is one of `locale-provider-entry`, `locale-token-absent`, `formatted-outside-i18n`, `cannot-tell`. `token` and `provider` are filled only from fields the record carries and are otherwise `null`. `absences` always includes `locale-value-not-recorded` whenever `provider` is not `null`. No field is derived from the rendered text, from `navigator.language`, from a position in the provider list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiLocaleCorrectness(localeCorrectness)`.

## Intent coverage

- SC1
- SC2
- SC3
- SC4

## Acceptance criteria

1. SC1: a record carrying the `LOCALE_ID` provider entry yields `locale-provider-entry` naming token, kind and import path plus `locale-value-not-recorded`; a mutant matching by position reddens by name.
2. SC2: a record with no formatter yields `formatted-outside-i18n` and never reads the page; a mutant that fills the gap from the rendered text reddens.
3. SC3: purity holds — two `node:vm` contexts with throw-on-touch globals produce deep-equal answers; a mutant reading `navigator.language` reddens.
4. SC4: no answer names a remedy, a cause, a schematic or an identity it was not given; a mutant that renders one reddens.

## Verify

```bash
node --test scripts/locale-correctness.test.mjs && npx prettier --check extension/locale-correctness.js scripts/locale-correctness.test.mjs
```

## Log

- pending.
- Landed paths: `extension/locale-correctness.js`, `scripts/locale-correctness.test.mjs`.
- The join matches the token by the walk's own derivation and never by a literal: `isLocaleToken` strips the `InjectionToken` class word and compares the normalised description, so the measured `InjectionToken LocaleId` is recognised, `LOCALE_ID` from a version that publishes a name is recognised, and `InjectionToken LocaleData` is not. Mutant M9 (literal `=== 'LOCALE_ID'`) reddens `locale-token-absent` and names the defect.
- Eleven mutants are proved by string mutation inside the suite, so the shipped bytes are the measured bytes; each names its own failure text, and the file on disk is never rewritten.
- Two mutant proofs were found vacuous while proving them and fixed without weakening an assertion: M3's purity pin ran on a record where the mutant never reaches for `navigator`, and M4's claim was overwritten by the entry claim.
- Suite 22/22 including `prettier --check`; `npx tsc -p extension/tsconfig.json` clean; `node --check` clean.
- **Cross-task contradiction, recorded for a repair wave:** the new module makes T001's record false. `research/raw/m061-record-shapes.json` states `absence['no-formatter-named'].extension.codeHits: 0`, and a module whose code names the locale token cannot keep that true, so `scripts/locale-correctness-shapes.test.mjs` is 15/17 at this head. Excluding `extension/locale-correctness.js` from the same scan reproduces the recorded list exactly, so the module is the sole cause. Neither that suite nor that record is declared by any task in the approved plan.
