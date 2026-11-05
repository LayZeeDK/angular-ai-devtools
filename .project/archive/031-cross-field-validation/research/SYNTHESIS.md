# Synthesis — M031 cross-field-validation

FRM-1 answers the developer's question "all my fields are valid, why is submit still disabled?" with the form's own verdict: each field's validity, each field's error kinds, the submit state, and the root error kind the form itself carries.

## What it refuses to do

It never names the rule. A cross-field rule is application code; the field state exposes its *verdict* as an error kind, not its identity. Reporting `name-too-short-for-age` is a fact; reporting `crossFieldRule` would be an invention. The suite enforces this with a mutant that reports the function name and reddens.

## Where the work went

Six tasks, four waves. T001 to T004 build the feature. T005 and T006 exist because gates read evidence the earlier tasks had not produced: the panel typecheck never ran against the surface, and both development-build recordings pinned a hash that moves with the checkout path. T006 reaches backwards — M030 shipped with the same latent flakiness.

## What this milestone learned

Record the property, not the sample. A build logs are stable at one path; how many chunks it emits and what they are called by shape are the facts worth asserting. The literal hash was a derived value pinned as a literal, and it made the gate depend on which directory it ran in.
