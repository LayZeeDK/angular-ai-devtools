# Synthesis — M029 trust-bypass-triage

## The decision

The roadmap asked for "what the sanitizer stripped and which binding did it". Measurement before planning showed the
signal is a single dev-mode console warning gated on a boolean, naming no tag, attribute, element or template location,
and absent entirely from production builds.

## Shapes considered

1. **Patch the sanitizer to record what it drops.** Rejected by N1: the finding would become an artefact of the patch,
   and the patch would have to be shipped into every inspected page.
2. **Diff the bound value against the rendered DOM to recover the payload.** Rejected: the binding value lives in the
   component, not in any record the page agent keeps, so recovering it means reading app state — a new tap.
3. **Join the warning to the profiler record that covers it, and name only what both support.** Chosen. The warning
   supplies the occurrence and its time; the record supplies the component. `cannot-tell` is the expected result for a
   first-render strip, because the page agent's subscription lands after the first write.

## What the measurement changed

SC1 promised the element, the binding and the time. It now promises the element, the component and the time, with the
binding named only where the element's record carries it — recorded in `## Corrections` with the millisecond numbers.
The bypass moved into its own task because a `bypassSecurityTrust*` path suppresses the warning, so "deliberate" is
proved by an absence and needs a contrast, not a column.

## Outcome

M029 ships a capture, a component-level join with an honest absence state, a panel surface with six states, and a bypass
proof whose value is byte-identical to the stripped binding's. Its own ship gate caught two bookkeeping defects on the
way — a recording nobody re-measured, and a build step the plan never ran — both fixed as tasks rather than by widening
a tolerance or skipping a case.
