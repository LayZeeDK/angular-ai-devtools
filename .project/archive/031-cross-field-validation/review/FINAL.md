# Final Review — M031 cross-field-validation

Reviewed HEAD: 1c05e439bf841f4c584f69f006f94b1233c3df4c
Overall verdict: pass

<!-- Both gap lenses passed. Lens 1 ran the full chain green in a clean checkout (536/536) after installing the fixture's dependencies; lens 2 made the finding report the rule's identity and the suite reddened at field-state.test.mjs:66. -->

## Success criteria

### SC1 — On the fixture, a form with two validatable fields and a cross-field rule produces a FRM-1 finding naming each field's validity, the field's own errors, and whether submit is disabled.

- **Verdict**: met
- **Check**: `node --test scripts/field-state.test.mjs` and the capture suite
- **Observed**: 5 pass and 7 pass, 0 fail, 0 skipped. The recording carries each field's `{ valid, invalid, errors }`, the submit state, and the root's `name-too-short-for-age` kind; the module reproduces every one of them.
- **Reference**: `research/raw/m031-field-state.json`; `extension/field-state.js`; T001 `7948945`, T002 `bb8688a`
- **Finding**: the finding reports each field's validity, its own error kinds, the submit state and the form's own root kind.
- **Fix direction**: none

### SC2 — The field state is read through the page agent's existing `window.ng` surface, with no second instrumentation path and no patch of the form.

- **Verdict**: met
- **Check**: the module's inputs, and its `node:vm` world
- **Observed**: the read takes only `window.ng.getComponent` — the surface the page agent already consumed — and with the configuration withheld it returns `cannot-tell` rather than a finding, so nothing new is instrumented.
- **Reference**: `extension/field-state.js`; T002 `bb8688a`
- **Finding**: the finding is derived from existing evidence, not from a new tap.
- **Fix direction**: none

### SC3 — A form whose fields are all individually valid while submit stays disabled reports the form's own cross-field error kind when it carries one, and produces a "cannot tell" state when it carries none — never a rule the finding invents.

- **Verdict**: met
- **Check**: `node --test scripts/field-state.test.mjs`, including the mutant that names the rule
- **Observed**: 7 pass; setting `rootError` to the rule's function name reddens at `scripts/field-state.test.mjs:66:12` with `'nameTooShortForAgeFn'` against `'name-too-short-for-age'`, so the identity is refused on substance.
- **Reference**: `scripts/field-state.test.mjs`; the gap panel's lens 2
- **Finding**: the rule's identity is never reported; the form's own kind is.
- **Fix direction**: none

### SC4 — The panel renders the field set, each field's state and the submit state from a short fact list, and shows the "cannot tell" state.

- **Verdict**: met
- **Check**: `node --test scripts/panel-fields.test.mjs` and the route pin
- **Observed**: 9 pass; the surface renders each field, the submit state and `form: error <kind>`, shows the cannot-tell pane otherwise, and never prints the rule. Three mutants redden by name.
- **Reference**: `apps/angular-ai-devtools/src/app/panel-fields.ts`; T003 `a3f707a`, T005 `b57eede`
- **Finding**: the surface states the form's own verdict and invents nothing.
- **Fix direction**: none

### SC5 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: `npm run check` and `npm test` at a clean checkout
- **Observed**: `npm run check` exit 0; `npm test` exit 0 with 536 tests, 536 pass, 0 fail, measured by the gap panel after installing both dependency sets.
- **Reference**: the gap panel's lens 1; `prepare-final` exit 0 in 6m55s
- **Finding**: the gate is green and the milestone is proved at the reviewed head.
- **Fix direction**: none

## Any expected failures

None. Both gap lenses passed, and the ship Verify exited 0 at this head.

## Observations outside the criteria

- A malformed fact entry — a key whose value is not an object — renders as `invalid` rather than being skipped, because the reader defaults a non-object to `{ valid: false, invalid: true }`. T002 never produces one, so it is recorded rather than changed.
- Only `control-ai-browsers` and `verify-ai-browsers` are byte-pinned between `.commandcode/skills` and `.claude/skills`; the `EPERM` retry this milestone needed had to be applied by hand in two copies because no gate compares the others.
- T006 reaches backwards: M030 shipped with the same path-dependent chunk-hash recording, so its earlier green gates depended on which directory the build ran in. The recordings now assert stability at one path instead.
