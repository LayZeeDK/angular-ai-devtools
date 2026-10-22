# 20 - Built-in AI in extensions without feature flags (2026-10-19)

Question, from Lars: "Have you verified that/whether this is true for Chrome Stable/Beta and Edge Stable/Dev, that
extensions can use Prompt API (and other browser built-in AI APIs) without feature flags? Spike it as proposed or
adapted as necessary."

Earlier claims (research/19 and the panel checks) were all measured with the `control-ai-browsers` instances'
`--enable-features` AI flags on. This spike removes them.

## Setup

Raw results: `raw/20-built-in-ai-without-flags.json`.

- Each instance profile kept its installed model. No profile had flags persisted from `chrome://flags` or
  `edge://flags` (`browser.enabled_labs_experiments` was empty in every Local State, measured).
- The browsers launched with no `--enable-features` at all.
  - Chrome: the three Chrome profiles were launched by a scratch script through `pipe-keeper.mjs`, with the instance
    command line minus `--enable-features`.
  - Edge: the two Edge profiles were launched with `control-ai-browsers up <name> --no-ai-features`, which keeps only
    the Edge sign-in and sync switches.
- The repository extension was loaded over the pipe, with developer mode on.
- Probed contexts: the counter fixture page (Angular 22.2.2), the extension's DevTools panel, the extension service
  worker and, on Edge only, an extension tab (`chrome-extension://<id>/panel/index.html`).
- Per API: whether the global exists, and its `availability()` result. For `LanguageModel` that is `available`, it
  also ran `create()` and one prompt.

## Measured

| Context | Chrome 156 (Nano) and Chrome Beta 157 (Nano, Gemma 4) | Edge 155 (Phi-4-mini) and Edge Dev 157 (Aion) |
|---|---|---|
| Web page | `LanguageModel` available and answers; Summarizer and LanguageDetector available; Translator downloadable; Writer, Rewriter and Proofreader undefined | `LanguageModel` undefined; Summarizer available; LanguageDetector available (155) or downloadable (157); Translator downloadable (155) or unavailable (157); Writer, Rewriter and Proofreader undefined |
| DevTools panel (Edge: also an extension tab) | `LanguageModel` available and answers; Summarizer, Writer, Rewriter and LanguageDetector available; Proofreader and Translator downloadable | `LanguageModel` available and answers; Summarizer, Writer, Rewriter and Proofreader available; LanguageDetector and Translator as in the page |
| Extension service worker | `LanguageModel` available and answers; Summarizer and LanguageDetector available; Translator downloadable; Writer, Rewriter and Proofreader undefined | `LanguageModel` undefined; Summarizer available; LanguageDetector and Translator as in the page; Writer, Rewriter and Proofreader undefined |

## Workers

Lars, 2026-10-19: "What about web workers? Can they be used by MV3 extensions and do they have access to built-in AI
APIs with/without feature flags?" Measured the same day, no flags, raw in `raw/20-built-in-ai-without-flags.json` under `workers`. Each probe
ran in a fresh browser, from a temporary worker file in the extension (deleted after the run).

| Worker | Chrome 156, Chrome Beta 157 (Nano, Gemma 4) | Edge 155, Edge Dev 157 |
|---|---|---|
| Dedicated worker started by the DevTools panel | all seven globals exist. `LanguageModel`, Summarizer, Writer and Rewriter `available`, Proofreader `downloadable`; the prompt answers "OK" (5-43 s, cold) | all seven globals exist. `LanguageModel`, Summarizer, Writer, Rewriter and Proofreader `available`; the prompt answers "OK" (5-7 s) |
| Dedicated worker started by a top-level extension tab | `LanguageModel`, Summarizer, LanguageDetector and Translator exist; Writer, Rewriter and Proofreader undefined (Chrome 156 only) | Summarizer, LanguageDetector and Translator exist; `LanguageModel`, Writer, Rewriter and Proofreader undefined |
| Extension service worker | cannot start one: `Worker` and `SharedWorker` are undefined (Chrome 156) | the same (Edge 155, Edge Dev 157) |
| Any of these, `LanguageDetector.availability()` or `Translator.availability()` | renderer crash: no answer, one Crashpad report per call, the panel shows the sad-face frame | the same |

- So MV3 extensions can use web workers, but only an extension page can start them; the service worker cannot.
- A worker started by the panel is the one place besides the panel itself where the Prompt API works without flags in all four browsers.
- Why a worker started by the panel gets more APIs than one started by an extension tab is not known. Only the
  globals were compared for the tab case (Chrome 156, Edge 155, Edge Dev 157).
- The crash also happens with the AI flags on (Chrome Beta Nano, Edge 155: a tab-started worker calling
  `LanguageDetector.availability()`). Filing draft: `docs/filing-ledger.md` item 11. Never call LanguageDetector or
  Translator from a worker; call them in the panel window, where they answer.

## What it means

- Extension pages (the DevTools panel, and on Edge an extension tab, which Chrome did not get probed for) and a dedicated
  worker the panel starts are the only contexts where the Prompt API works without flags in all four browsers. The
  panel-side call in `ExtensionPromptService` (research/19) therefore runs on an unflagged Chrome or Edge. Writer and
  Rewriter likewise exist only in those contexts.
- On Edge, the web page and the service worker have no `LanguageModel` without flags. On Chrome they do.
- With the flags on (research/19), Edge also served `LanguageModel` in the service worker. That worked only because
  of the flags. The panel worker serves it with or without flags.

## Caveats

- Every profile already had its model installed. On a new Chrome Beta profile, On-Device AI is off until a model
  was installed once or the setting is turned on in `chrome://settings/ai` (control-ai-browsers Gotchas).
  `availability()` then reads `unavailable`.
- The Chrome launches of the first table did not go through `up` (Chrome does not sign accounts in by itself; Edge
  does, so Edge went through `up` only). The worker runs used `up <name> --no-ai-features` everywhere.
- "No `LanguageModel` in the page" was measured on `http://localhost:4222/`, a secure context with no origin-trial
  token, in profiles with no `edge://flags` or `chrome://flags` entries. Not tested: a page with a Prompt API
  origin-trial token, and whether a browser's server-side field trials would turn the API on for a profile later.
