# 19 - Where LanguageModel works for the DevTools panel feature (2026-10-19)

Question, from Lars: "Spike and research LanguageModel availability in the DevTool panel and/or workers."

Why it matters: the first feature (N1, "Explain version with AI") called the Prompt API in the inspected page's
MAIN world, through `relay.js` and `agent-main.js`. Those scripts talk over `window` CustomEvents, so any script on
the page can read the prompt and answer first (security review of the change set, simulated in a `vm` harness, not
in a browser). Section 3.1 of `docs/feature-proposals.md` already places the session in the DevTools panel or side
panel page (spike S1, `research/11`).

## Measured

Raw: `raw/19-languagemodel-contexts.json`. Each browser-model pair ran in its `control-ai-browsers` instance, with
the repository extension loaded over the pipe and developer mode on. The page was the counter fixture (Angular
22.2.2). Per context: `typeof LanguageModel`, `availability()`, `create()`, one prompt.

| Context                               | Chrome Beta 157 Nano | Chrome Beta 157 Gemma 4 | Chrome 156 Nano | Edge Dev 157 Aion | Edge 155 Phi-4-mini |
| ------------------------------------- | -------------------- | ----------------------- | --------------- | ----------------- | ------------------- |
| DevTools panel page                   | works, create 4.3 s  | works, 4.5 s            | works, 8.1 s    | works, 3.2 s      | works, 6.5 s        |
| Dedicated worker started by the panel | works                | works, 1.1 s            | works           | works             | works               |
| Extension service worker              | works                | works, 0.9 s            | works           | works             | works               |
| Hidden `devtools.html` page           | refused              | refused                 | refused         | refused           | refused             |

"Works" means `available`, `create()` resolved and the prompt answered "OK". A create time of a few ms means a
session already existed in that browser, so the time is not a cold start. "Refused" means `LanguageModel` exists,
`availability()` reads `unavailable`, and `create()` throws "Access denied because the Permission Policy is not
enabled". That matches S1 phase 2, where the `devtools_page` permissions policy denies `language-model`.

## Documented

- Chromium, "Prompt API for extension" (`docs/experiments/prompt-api-for-extension.md`): extension authors can
  check for the `LanguageModel` entry point from extension window and worker scripts. This is consistent with the
  panel, worker and service worker rows above. [documented]
- Chrome for Developers, Prompt API in extensions: availability values include `unavailable` and `downloadable`
  [documented]. Whether a `downloadable` model can be created from the panel without a gesture in the page was not
  tested here. The panel button is a user gesture in the panel document [inferred].

## Decision applied (Claude, 2026-10-19, recorded in plans/prompt-api-browser-pairs.afk.md)

`ExtensionPromptService` now calls `LanguageModel` in the panel itself, as section 3.1 already prescribes. The page
bridge still carries Angular detection. It no longer carries prompts, so the page can neither read the prompt nor
forge the answer. A Worker started by the panel is the place for long prompts that should not block the panel UI
(tutor design 4.4). The service worker suits work that must outlive the panel.

Without feature flags (research/20): the panel and a worker it starts keep the Prompt API in all four browsers; the
service worker loses it on Edge and cannot start workers. `LanguageDetector` and `Translator` crash the renderer when
called in a worker.

## Not checked

- The side panel and offscreen document in these five pairs (S1 measured them in Chrome Beta 156 and Edge Dev 157).
- Tool calling from the panel session.
- A `downloadable` model created from the panel button.
