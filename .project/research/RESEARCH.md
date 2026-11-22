# RESEARCH — M061 locale-correctness

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`
Milestone: M061 — locale-correctness

## Dispatch

No subagent was dispatched: the roadmap entry lists **no open questions**, so each dimension was read directly at the
base commit and is recorded here as skipped.

- `domain` — skipped → none — R1: the provider entry is already recorded, without its value.
- `stack` — skipped → none — R2: no locale-shaped record exists in this tree.
- `pitfalls` — skipped → none — R3: `provider.provide` is not a usable key; the token is.
- `similar` — skipped → none — M059 met six record censuses at the ship gate; the plan declares them up front.

## Question assignments

## R1 — The provider entry is recorded, and its value is not

`extension/agent-main.js:1149-1155` reads the injector's provider list through `ng.ɵgetInjectorProviders`, and
`:1215-1223` reduces each entry to `{ token, isViewProvider, provider, importPath }`. A `useValue` provider becomes the
kind string `'value'` (`:1182-1185`) — the provided value itself is discarded at that point.

**Consequence:** the locale a page runs under is not recoverable from this record. SC1 is narrowed by C4 to name the
provider *entry* (token, kind, import path) and report the value as `locale-value-not-recorded`. Any criterion that
promised to name the value would be unachievable without a page read, which SC2/N2 forbid.

## R2 — No locale-shaped record exists today

`LOCALE_ID`, `locale` and `i18n` appear in the extension only inside a determinism comment
(`extension/render-phase.js:85`, "no locale-dependent formatting"). No record carries a formatted value, a formatter
identity or a locale.

**Consequence:** this milestone adds the first locale-shaped join. It cannot read a precedent record for the value,
which is why the absence is a first-class state rather than an edge case.

## R3 — `provider.provide` is not a usable key; the token is

`extension/agent-main.js:1675-1676` records the measurement that decided this for the router: "`record.provider.provide`
is deliberately not read: T001 measured 33 of the entry's 90 `provide` names and `Router` is not among them". The
token, resolved through `routerTokenNameOf` (`:1677-1688`), is the reliable identity — it returns the string token, the
token's `name`, or `String(token)`.

**Consequence:** the join matches `LOCALE_ID` by token name and never by position in the provider list, which is E7's
mutant.

## R4 — What the plan inherits from M059's ship gate

Six censuses read `research/raw/` and derive a shape: the record-shapes censuses, the claims census, the
byte-consistency scan and the two gate records. The plan declares all of them, and their suites, at plan time; both
gate records are re-derived as the last commit before the final review, because a recording that derives from the tree
moves with every later suite edit (measured in M060's T007).
