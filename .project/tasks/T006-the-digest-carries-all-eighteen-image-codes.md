---
id: T006
title: The digest carries all eighteen image codes
wave: 4
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/image-digest.mjs
  - scripts/image-digest.test.mjs
  - extension/image-digest.json
---

# T006 — The digest carries all eighteen image codes

## Context

T001 built the digest over a set of thirteen codes derived by grepping the installed bundles for image wording.
Reverified against the local clone at the installed tag (`D:\projects\github\angular\angular`, tag `v22.1.8`,
read with `git grep`/`git show` so the clone's own checkout is undisturbed), the image directive declares **seventeen**
codes in its own `RuntimeErrorCode` block — the clone's packages/common/src/errors.ts lines 46–63 — and core adds `NG0913`
(the clone's packages/core/src/errors.ts line 130, `IMAGE_PERFORMANCE_WARNING = -913`).

Five codes were missed because their messages do not contain the words the grep looked for: `NG2950`
(`UNEXPECTED_SRC_ATTR`), `NG2951` (`UNEXPECTED_SRCSET_ATTR`), `NG2953` (`UNEXPECTED_INPUT_CHANGE`), `NG2954`
(`REQUIRED_INPUT_MISSING`), `NG2958` (`UNEXPECTED_DEV_MODE_CHECK_IN_PROD_MODE`). `NG2957` does not exist.

## Approach

1. Add the five missing codes, so the digest carries eighteen entries and no others.
2. Take each new meaning from the clone at `v22.1.8` — the enum name gives the subject, and the `formatRuntimeError`
   call site under the clone's ng_optimized_image.ts gives the wording. Name
   the file and line in a comment for each new entry; do not paraphrase from memory.
3. Regenerate `extension/image-digest.json` so the artefact stays byte-identical to a rebuild.
4. Keep the 150-token upper bound (`ceil(len/3)`) and the licence strip unchanged; every new entry passes both.

## Interface contract

None

## Acceptance criteria

1. The digest carries exactly eighteen entries, and their codes equal the enum-derived set: `NG0913`, `NG2950`, `NG2951`, `NG2952`, `NG2953`, `NG2954`, `NG2955`, `NG2956`, `NG2958`–`NG2967`.
2. Each of the five new entries names, in a source comment, the clone file and line its meaning was taken from.
3. Every entry is inside the 450-character bound and free of licence text.
4. Regenerating the artefact is byte-identical, and a digest that omits one of the five reddens naming the missing code.
5. Acceptance is held-out E1 and held-out E2: the missing-code, extra-code and over-cap mutants are named.

## Verify

```bash
npm ci --include=dev; node --test scripts/image-digest.test.mjs
```

## Held-out

held-out E1 and held-out E2 — an omitted code, an extra code and an over-cap entry are each named.

## Intent coverage

- SC1
- SC2

## Log

- created
