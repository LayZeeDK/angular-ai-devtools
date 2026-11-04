# Synthesis — M025 panel-verify-breadth

## The milestone as the roadmap framed it

`ROADMAP.md` said this milestone existed to "close the gap that `npm run check` never type-checks the panel".
Measuring first showed that premise was already false: `check:panel` has been in the chain since M018 T008 and
`apps/angular-ai-devtools/tsconfig.check.json` type-checks the panel sources today.

## What is genuinely unchecked

`extension/` — eight scripts and one worker that run inside a user's inspected page — is plain JavaScript. No
tsconfig includes it, no stage touches it. That is the real breadth gap, and the milestone was re-scoped onto it.
The intent records the re-scope rather than pretending the roadmap's premise held.

## The three configurations, measured

| Configuration | Errors | Reading |
|---|---|---|
| `strict: true`, whole `extension/` | 7308 | Almost all implicit-any in untyped JS. Not a milestone; a rewrite |
| `strict: false`, whole | 220 | Tractable, but 187 of the 220 are in `extension/panel/**` — **build output**, not source |
| `strict: false`, sources only | 33 | The real target: 19 missing-`chrome` globals + 14 genuine type defects |

The middle row is the trap: measuring a directory that contains the bundler's output counts the bundler, not the
code. Excluding `panel/**` is therefore the decision, and the config states it with its reason.

## Decisions taken

1. **Non-strict first, strict recorded.** `strict: false` in the shipped config, with the 7308 count written into the
   header and asserted by a test. The gap is named, not hidden.
2. **`@types/chrome` rather than hand-written ambient declarations.** 19 of the 33 were the missing global; the
   package is the honest fix and it keeps `chrome.*` typed at call sites.
3. **One exclusion, stated in the config.** `exclude: ["panel/**"]`, proven narrow by `tsc --listFiles` reporting
   nine authored files and none under `panel/`. No allow-list of files that already pass — that pattern hides the
   next defect instead of fixing it.
4. **The check is wired into `npm run check`, not left standalone.** A check nobody runs is a comment.
5. **The chain guard is re-pinned in the same change.** `scripts/panel-typecheck-scope.test.mjs` deep-equals the
   chain against an ordered list; adding a stage means updating that list deliberately, with the reason recorded.

## Rejected

- **Shipping `strict: true` with a suppression file.** That is the "files that already pass" anti-pattern at scale,
  and it would have made SC2's "not suppressed" claim false.
- **A ratchet that fails only when the error count rises.** It converts a type defect into a number, and the number
  is what people edit.
- **Leaving `check:extension` out of `check`.** It would have passed every criterion while proving nothing.
