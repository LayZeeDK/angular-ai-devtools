# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 2821d58c77a66007b6097981bb338fa6adf54d46

## T001 — Measure a schema-disabled field on the portal and record what the page states: pass

- ✅ The capture drove `/contract/create` on the Insurance Portal: `policyNumber` `disabled: false` read from its input, two custom elements unread with their reason, `status` carried by no element while its field tree reports `disabled() === true`, and `schema` absent across five injector expressions (100 provider records, 0 schema tokens). 14 tests pass; one flipped value reddens six assertions naming the field.

## Intent coverage

### SC1 — A field whose disabled state a schema node declares produces a finding that names the state, the node and the input that node read; a mutant that reports the node without the input it read reddens it.: pass

- ✅ T001 proves it at `2821d58c`: `.project/build/verify-T001.log` carries the run, and the task's `## Log` names the command and the count it produced.
