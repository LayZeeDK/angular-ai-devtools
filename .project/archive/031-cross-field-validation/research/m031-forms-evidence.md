# M031 inspect — can a disabled submit be explained from Signal Forms field states?

Premise under test (ROADMAP M031): *"Build FRM-1, why fixing one field does not enable submit, from the Signal Forms
field states."*

## What was read

| Source | Finding |
|---|---|
| `grep -rni "form\|valid\|submit"` over `spikes/ng222-app/src/app/*.ts` | **no form anywhere.** The only hits describe the sanitizer's `VALID_ELEMENTS` and one comment about an `[innerHTML]` form. There is no field, no rule, no submit button |
| `extension/agent-main.js` | **no field or form capture.** Its matches are `profile-formatter`, a package `validation` comment, and `Meta` detection — nothing reads a form |
| `spikes/ng222-app/package.json` | `@angular/forms: ^22.2.0` is installed |
| `git ls-tree v22.2.0:packages/forms/signals` in the local clone | **Signal Forms exists**: `BUILD.bazel`, `PACKAGE.md`, `compat`, `index.ts`, `public_api.ts`, `src` |

## Verdict: the premise is half true, and the false half is the interesting one

**True — the API exists and is installed.** Signal Forms ships in the fixture's own Angular version, so a form can be
created and its field states are real values.

**False — the subject does not exist.** There is no form in the fixture at all: no field, no cross-field rule, no submit
button whose disabled state could be explained. As in M028, M029 and M030, the subject must be created before anything can
be read.

**False — "the cross-field rule that keeps submit disabled" is app logic, not Angular state.** A Signal Forms field
exposes **its own** validity and errors. A cross-field rule is a function the application wrote; its verdict reaches the
submit button as a boolean. So FRM-1 can report:

- each field's validity and its errors, and
- whether submit is disabled,

but it **cannot name the rule** that produced the cross-field verdict. When every field is individually valid and submit is
still disabled, the only supportable statement is that a rule outside the field states is holding it — which is exactly
the "cannot tell" state the roadmap already anticipates, promoted from an edge case to a probable outcome.

## Consequence for the milestone

1. A fixture must exist: a small form with two validatable fields, one cross-field rule, and a submit button whose
   `disabled` is bound to the form's validity.
2. The field-state read must come from a place the page agent can reach without a second instrumentation path. The
   candidate is `ng.getComponent(element)`, which the agent does not use today but is the same `window.ng` surface as the
   eight hooks it does use. **T001 must measure whether a form's field state is reachable that way before the walk is
   built** — if it is not, the "cannot tell" state is the honest answer and the milestone must say so rather than invent a
   read.
3. The panel renders the field set and the submit state, and must not name the rule (N2, and the same prohibition M029 and
   M030 each enforced with a mutant).
