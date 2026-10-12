# Vitest Browser Mode verification map

The feature files live in one place: `.claude/skills/control-vitest-browser-angular/features/`. This index points
there so the map has one owner; maintain it through `/maintain-verification-skill` naming
`control-vitest-browser-angular`. Baseline preconditions, driving conventions, proof rules and the feature entry
contract are in [that README](../../control-vitest-browser-angular/features/README.md).

## Features

- [Counter tests](../../control-vitest-browser-angular/features/counter-tests.md): default results, the timing
  demo that fails on purpose, the hold test, reruns.
- [Held Counter](../../control-vitest-browser-angular/features/held-counter.md): render, increment from the
  agent, signal graph, DI override, profiler events in the tester iframe.
- [Extension in the tester iframe](../../control-vitest-browser-angular/features/extension-in-tester.md):
  extension loaded, content scripts in the tester, DevTools panel `frameURL`, `LanguageModel`.
