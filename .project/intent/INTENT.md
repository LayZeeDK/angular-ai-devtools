# Intent — M029 trust-bypass-triage

Lane: feature
Milestone: trust-bypass-triage
Branch: gsd-path/M029
Review panel: full
Finding skeptics: 2
Surfaces: panel

## Problem

When a template binds untrusted content, Angular's sanitizer silently drops the unsafe parts, and the rendered page
gives the developer no sign that anything was removed. The one signal Angular emits is a dev-mode console warning —
`WARNING: sanitizing HTML stripped some content, see <XSS url>` — which says that a strip happened and nothing more.
Nothing joins that warning to the binding that caused it, so a developer who sees mangled markup has no route from the
symptom to the template line responsible.

Measured before planning (`.project/research/m029-sanitizer-evidence.md`): `packages/core/src/sanitization/html_sanitizer.ts`
at `v22.1.8` warns once per sanitize call, gated on `(typeof ngDevMode === 'undefined' || ngDevMode) &&
sanitizer.sanitizedSomething`, where `sanitizedSomething` is a **boolean**. The stripped nodes are discarded as they are
dropped; the warning names no tag, attribute, element or template location. The repo has no sanitizer observation point
at all — `DomSanitizer`, `bypassSecurityTrust` and `sanitiz` appear only in docs, the roadmap and the NG digest.

## Users

A developer inspecting an Angular page with the panel open, who sees content missing from a rendered element and needs
to know which binding lost it, rather than being told that "the sanitizer stripped something".

## Success criteria

1. On the fixture, a template binding whose value the sanitizer strips produces a PBR-1 finding naming the element and
   the binding that wrote it, and the time the strip occurred.
2. The finding is produced from the console warning the sanitizer already emits, joined to the profiler's binding and
   template events, with no new page-side instrumentation and no patch of the sanitizer.
3. A page where no strip occurred produces no finding, and a warning with no binding record it can be joined to
   produces a "cannot tell" state naming that absence, rather than a guessed binding.
4. The panel renders the finding and its explanation from a short fact list, and shows the "cannot tell" state when the
   warning cannot be attributed.
5. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
|---|---|---|---|---|
| E1 | SC1 | ordering | held-out | `scripts/sanitizer-triage.test.mjs` — a warning inside a binding's write window names that binding and element |
| E2 | SC2 | boundary | held-out | `scripts/sanitizer-triage.test.mjs` — removing the console capture leaves no finding, so nothing else supplied it |
| E3 | SC3 | empty | held-out | `scripts/sanitizer-triage.test.mjs` — a warning with no adjacent binding record yields "cannot tell", never a binding |
| E4 | SC4 | adjacency | held-out | `scripts/panel-sanitizer.test.mjs` — the surface renders the fact list, and the unattributable state |
| E5 | SC5 | boundary | criterion SC5 | the project gate runs at the head |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|---|---|---|---|---|
| N1 | SC2 | N1: patch or wrap the sanitizer, or add a second console reader alongside the page agent's | criterion SC2 | PBR-1 reads the warning Angular already emits; a patched sanitizer would make the finding an artefact of the patch |
| N2 | SC1 | N2: state what was stripped — a tag, an attribute, a substring — when only the boolean warning was observed | criterion SC1 | `sanitizedSomething` records that something was dropped and nothing about what; a named tag would be invented |
| N3 | SC3 | N3: infer production behaviour from a dev-mode warning | criterion SC3 | the warning is gated on `ngDevMode`; a production build strips silently and must not be reported as clean or as stripped |
| N4 | SC4 | N4: render an explanation the fact list does not support | criterion SC4 | the surface shows the facts and the absence state, not prose about either |
| N5 | SC5 | N5: weaken a suite, skip a case, or tolerate a red gate to reach green | criterion SC5 | the gate is the milestone's floor |

## Scope

In: capturing the sanitizer's dev-mode warning; joining it to the binding and template events the profiler already
records; the PBR-1 evidence (element, binding, time); the panel surface; a named "cannot tell" state; a vetted
`bypassSecurityTrust*` path reported as deliberate, proved by the warning's absence where a bypass was used.

Out: patching or wrapping the sanitizer; naming the stripped tag, attribute or substring; claiming anything about a
production build from a dev-mode signal; code generation; `@angular/animations`, SSR and `angular/components`; DOM added
to an inspected page (AR-3).

## Corrections

- **The roadmap's sentence overstates the signal.** It asks for "what the sanitizer stripped and which binding did it";
  the measured warning supplies only *that* a strip occurred. SC1 was written for element, binding and time, and N2
  forbids naming the payload. Recorded at `.project/research/m029-sanitizer-evidence.md`.
- **The vetted-bypass path is an absence, not a column.** A `bypassSecurityTrust*` call suppresses the warning
  entirely, so "deliberate" cannot be read from the warning's content and is proved by the warning not appearing where
  the app used a bypass. It carries its own proof rather than sharing the strip table.

## Risks

- The fixture gains a page that sanitizes content, so the panel's route-list pin in `chat-entry.component.spec.ts` and
  both control-skill feature manifests will go stale, as they did for M028. The plan declares them.
- The join is by time and element across two records. A binding that writes and is stripped in the same tick is
  unambiguous; overlapping writes are not, which is why SC3's "cannot tell" state exists rather than a promise of
  attribution.

## Open questions

- Does the console warning's ordering relative to the profiler's binding events hold in the dev build on this machine?
  T001's capture settles it, and if it does not, the "cannot tell" state is the honest answer rather than an invented
  join.
