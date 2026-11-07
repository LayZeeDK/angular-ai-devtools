# S9 — Which field states Signal Forms exposes for a cross-field rule, and which state explains a disabled submit?

Recorded: 2026-11-08
Verdict: resolved

## Question

Which field states Signal Forms exposes for a cross-field rule, and which state explains a disabled submit?

## Method

Read the fixture that already declares a cross-field rule, and check whether the existing M031 recording carries
any disabled/submit state. Two commands, no new instrumentation.

## Commands and output

```
> Select-String -Path research/raw/m031-field-state.json -Pattern 'disabled'   -> 0 matches
> Select-String -Path research/raw/m031-field-state.json -Pattern 'submit'     -> 0 matches
> Select-String -Path research/raw/m031-field-state.json -Pattern 'kind'       -> 3 matches
> Select-String -Path research/raw/m031-field-state.json -Pattern 'crossField' -> 1 match

spikes/ng222-app/src/app/field-form-page.ts:25-32
  readonly fieldForm = form(this.model, (f) => {
    required(f.name);
    min(f.age, 1);
    max(f.age, 120);
    validate(f, ({ value }) =>
      value().name.length < value().age ? { kind: 'name-too-short-for-age' } : undefined,
    );
  });

spikes/ng222-app/src/app/field-form-page.ts:18
  <button type="submit" id="submit" [disabled]="fieldForm().invalid()">submit</button>

extension/field-state.js:15-19
  function isFieldState(value) { ... value.fields ... value.root ... }
```

## Verdict

resolved

## What this settles

A **cross-field rule attaches to the root field**, not to either input: `validate(f, …)` is declared on the form
root `f` and yields `{ kind: 'name-too-short-for-age' }`, while `required`/`min`/`max` attach to the individual
fields. So the shape a Signal Forms read must expose is `{ fields: { … }, root: { valid, invalid, errors[] } }` —
which `extension/field-state.js` already models, and which M031 already records.

The state that explains a **disabled submit is the root field's `invalid`**, because the fixture binds
`[disabled]="fieldForm().invalid()"`. A field-level error is not sufficient to explain it: a form can be invalid at
the root with every field individually valid (exactly the cross-field case), and it can be field-invalid with submit
enabled if the author binds something else.

The current recording carries **no `disabled` and no `submit` key** (0 matches each), so the submit state is not yet
measured — that is what M037 adds, and it is additive rather than a change to the M031 shape.

## What this does not settle

- Whether Signal Forms ever reports a disabled **field** independently of the root; the fixture binds only the root.
- The rendering of an async rule or a pending state; this form has none.
- Whether `invalid()` and `errors.length > 0` can disagree; not asserted anywhere yet.
