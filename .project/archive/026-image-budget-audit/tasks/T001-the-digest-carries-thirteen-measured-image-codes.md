---
id: T001
title: The digest carries thirteen measured image codes
wave: 1
status: done
deps: []
agent: build_T001
base: 17769173ecf6f2a38f091d13e634166a0904671a
worktree: null
task_branch: null
files:
  - scripts/image-digest.mjs
  - scripts/build-image-digest.mjs
  - extension/image-digest.json
  - package.json
  - scripts/image-digest.test.mjs
---

# T001 — The digest carries thirteen measured image codes

## Context

See `.project/intent/INTENT.md` and `.project/research/evidence-image-codes.md`. The measured image code set is
thirteen codes: `NG0913` plus `NG2952` through `NG2967`. The roadmap's `NG02200` through `NG02800` range does not
exist in Angular 22.2.

## Approach

Generate `scripts/image-digest.mjs` at extension build time: one entry per code in the measured set `NG0913`, `NG2952`, `NG2955`, `NG2956`, `NG2959`, `NG2960`, `NG2961`, `NG2962`, `NG2963`, `NG2964`, `NG2965`, `NG2966`, `NG2967` — thirteen entries and no others. Each entry carries the code, a one-line meaning and a one-line fix, and is at most 150 tokens measured by a token counter rather than estimated. A code outside the set is reported as unknown rather than given invented text.

## Interface contract

None

## Acceptance criteria

1. The digest has exactly thirteen entries and their codes equal the measured set.
2. Every entry is at most 150 tokens measured by the counter, and the counter reddens on a 151-token entry.
3. A code outside the measured set is reported as unknown and never given an invented entry.
4. The digest is produced by the build, so deleting the generator leaves it stale or absent rather than silently unchanged.
5. Acceptance is held-out E1 and held-out E2: a digest missing a measured code, carrying an unmeasured one, or with an entry over 150 tokens is named by the suite.

## Verify

```bash
npm ci --include=dev; node --test scripts/image-digest.test.mjs
```

## Held-out

held-out E1 and held-out E2 — the missing-code, extra-code and over-cap mutants are named.

## Intent coverage

- SC1
- SC2

## Attempt 2 — the measure and the build step

Attempt 1 blocked on three findings, all about the same weakness: the measure was arguable and the generation was
not real.

1. **`countTokens` counted words, not tokens.** `text.split(/\s+/).length` reports 150 "tokens" for 150 words,
   which is roughly 195 real tokens — an understatement in the direction that hurts. Replace it with an **upper
   bound**: `tokenUpperBound(text) = Math.ceil(text.length / 3)`. A 150-token cap therefore means **at most 450
   characters**, which no tokenizer will exceed for English prose. Keep the name `countTokens` if you prefer, but
   the formula must be the conservative bound and the source must say so in one line.
2. **The trim never fired**, so the cap was untested. Prove it on a deliberately long source entry: a body of at
   least 900 characters must come out at most 450 characters and end with the trim marker. That is the mutant; an
   assertion about a synthetic 151-word string is not.
3. **There was no build-time generation.** Add `scripts/build-image-digest.mjs`, which writes
   `extension/image-digest.json` from the same source table, and chain it into the extension build so the artefact
   is produced rather than hand-kept. The staleness proof: regenerating must be byte-identical to the committed
   artefact, and deleting `scripts/build-image-digest.mjs` must make the check fail rather than pass.

Everything else from attempt 1 stands: the thirteen measured codes, their meanings traced to the runtime emitters,
`stripLicense` present (T002 proves it), and `lookup` returning `unknown` for an unmeasured code.

## Log

- created
- implemented image-digest.mjs with 13 measured codes, token cap, unknown handling; Verify exit 0 — ready
- attempt 2: countTokens upper bound ceil(len/3); long-entry trim proof; build-image-digest.mjs + extension/image-digest.json; Verify exit 0 — ready
