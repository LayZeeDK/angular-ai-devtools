# M029 inspect — can the sanitizer decision be observed?

Premise under test (ROADMAP M029): *"Build PBR-1, what the sanitizer stripped and which binding did it."*

## What was read

| Source | Finding |
|---|---|
| `grep -rn "bypassSecurityTrust\|DomSanitizer\|sanitiz\|Sanitizer"` over the repo | **no product code observes sanitization at all.** The only hits are docs, the roadmap, the NG digest, and a taste file. There is no existing hook, no patch point, no capture |
| `packages/core/src/sanitization/html_sanitizer.ts` at `v22.1.8` | the sanitizer emits exactly one signal: `console.warn('WARNING: sanitizing HTML stripped some content, see <XSS url>')` |
| the same file, `ɵɵsanitizeHtml` | the warning is gated on `(typeof ngDevMode === 'undefined' \|\| ngDevMode) && sanitizer.sanitizedSomething` — a **boolean** accumulated by `SanitizingHtmlSerializer`, and it fires **once per sanitize call**, not per stripped node |
| the same file, `sanitizeChildren` | the serializer walks the inert body and drops unsafe elements, but records only `sanitizedSomething = true`; the stripped nodes are **not retained** |

## Verdict: the premise is half false

**True:** a strip is observable, and it is attributable in time — the warning fires inside the sanitize call that a specific binding evaluation triggered, on the element that binding wrote.

**False:** the warning says **neither what was stripped nor which binding**. `sanitizedSomething` is a flag; the dropped nodes are discarded as they are dropped. Nothing in the warning names an element, an attribute, a tag or a template location. "What the sanitizer stripped" cannot be read off the signal — only that something was.

**Also false for production:** the warning exists only in dev mode. A production build strips silently, so no surface can report it there.

## What this means for PBR-1

The honest finding is narrower than the roadmap's sentence and must not borrow the missing half:

- **Reportable:** "the sanitizer stripped content from the binding that wrote this element, at this time."
- **Not reportable:** which tag, attribute or substring was removed.
- **Attribution route:** the binding that wrote the element is already recoverable from the profiler's binding and template events plus the element record the page agent keeps; the warning supplies the *occurrence*, the profiler supplies the *culprit*. The join is by time and element, and it is a join of two records — not a cause invented from one.
- **Prohibition N2 restated for this milestone:** "the sanitizer removed the `<script>` tag" is unsupportable. "The sanitizer stripped content while rendering the binding `[innerHTML]` at `x-page`" is supportable.

## Consequence for the task set

1. The capture must be a **console-message** capture like M027's, not a new tap on the sanitizer.
2. The surface must render the strip as an occurrence and must not name a cause, a tag or a payload.
3. A vetted-bypass path is a *different* signal (`bypassSecurityTrust*` returns a trusted value and suppresses the warning entirely), so "deliberate" is established by the **absence** of the warning where a bypass was used — which is a different proof obligation and must be its own task, not a column on the first.
