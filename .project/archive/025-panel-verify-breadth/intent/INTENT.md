# Intent — M025 `panel-verify-breadth`

Lane: milestone
Review panel: off
Finding skeptics: off
Surfaces: none

## Summary

Bring `extension/` under the type check. It is plain JavaScript that nothing type-checks today, and the first real
run finds eleven genuine defects behind twenty missing-global errors.

## Problem

`npm run check` compiles the root scripts, the skill trees, the panel and the companion package. Nothing checks
`extension/`, which holds the content scripts, the overlay, the relay and the picker agent — the code that runs
inside a user's inspected page. A probe over the sources reports 33 errors: 20 from the absent `chrome` ambient
type and 13 genuine type defects, including reading `.detail` off a plain `Event` and `textContent` on a string.

`extension/panel/` is build output and must be excluded: it contributes 187 of the 220 non-strict errors and is
generated, not authored.

## Users

The maintainer running `npm run check` and believing it covers the shipped code; the next agent editing a content
script, who needs a compiler to catch a wrong property; the reviewer citing a green check.

## Success criteria

1. `npm run check` type-checks every authored file under `extension/`, with the generated `extension/panel/` bundle output excluded and the exclusion stated where the config lives.
2. That check reports zero errors, and every non-global defect the probe found — fourteen, not the thirteen estimated in the plan — is fixed at source rather than suppressed.
3. A deliberately wrong property introduced into an extension source makes `npm run check` exit non-zero; an error placed inside `extension/panel/` does not, because that directory is generated.
4. The strict-mode gap is recorded: the check runs at `strict: false`, and the reason (hand-written JS with implicit-any throughout) is stated in the config header.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
| --- | --- | --- | --- | --- |
| E1 | SC3 | boundary | held-out | `scripts/extension-typecheck.test.mjs` — a wrong property in an authored source reddens the check and names the file |
| E2 | SC3 | adjacency | held-out | `scripts/extension-typecheck.test.mjs` — an error inside `extension/panel/` leaves the check green, proving the exclusion is the generated directory and nothing wider |
| E3 | SC3 | empty | held-out | `scripts/extension-typecheck.test.mjs` — a tree with no JavaScript reports no errors rather than failing to start |
| E4 | SC4 | boundary | held-out | `scripts/extension-typecheck.test.mjs` — the config's `strict` is asserted `false` and its header must state the gap |
| E5 | SC1 | boundary | criterion SC1 | `package.json` — `check:extension` is chained into `check`, and the config's only exclude is `panel/**` |
| E6 | SC2 | precision | criterion SC2 | `extension/tsconfig.json` — the check over the sources reports zero errors |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
| --- | --- | --- | --- | --- |
| N1 | SC2 | Suppress a reported error with `@ts-ignore`, `@ts-expect-error` or a cast that changes nothing at runtime | criterion SC2 | the milestone exists to fix what the first run finds; a suppression is the same false green as an unchecked file |
| N2 | SC1 | Exclude an authored extension source from the check | criterion SC1 | `extension/panel/` is generated and is the only exclusion; excluding a written file defeats the breadth |
| N3 | SC3 | Reach green by weakening the check (disabling `checkJs`, narrowing `include` to files that already pass) | criterion SC3 | an allow-list of passing files is the defect this milestone closes |
| N4 | SC4 | Claim the extension is strict-clean | judgment | 7308 strict errors exist; the check runs non-strict and the gap is recorded, not hidden |

## Surfaces

none

## Scope

In: `extension/` sources, a tsconfig for them, the `check` script, and a test proving the check bites.

Out: rewriting the extension in TypeScript; making it strict-clean; changing extension behaviour.

## Constraints

- `extension/panel/` is build output: `main.js` and `chunk-*.js`. Excluded, and the exclusion named in the config.
- `strict: true` is unreachable in one milestone; the check is added at `strict: false` with the gap recorded.
- Adding `@types/chrome` is a devDependency and must not enter the extension bundle.

## Current state

`npm run check` covers root, skills, panel and companion. `extension/` is checked by nothing; a probe reports 33
errors over the sources and 220 including the generated bundle.

## Risks

- `@types/chrome` may conflict with the DOM lib for `CustomEvent`; the fix must not silence real defects.
- Fixing the 13 defects touches shipped content scripts; each fix must be behaviour-preserving and covered by the
  extension's existing tests.

## Open questions

- Whether the strict gap should be a follow-up milestone or a recorded constraint. This intent records it (SC4).

## Corrections

- **2026-11-04, count corrected (delegated ruling).** The initial probe report estimated thirteen non-global defects; the compiler found fourteen once `@types/chrome` resolved the global class. SC2 now records the measured count. No scope change: all fourteen were fixed at source and none suppressed.
