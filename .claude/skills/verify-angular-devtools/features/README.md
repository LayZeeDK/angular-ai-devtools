# verify-angular-devtools feature map

The checks `verify.mjs` reports, each mapped to the feature file in `control-angular-devtools/features/`
that holds its recipe, handles and gotchas. Preconditions, driving conventions and proof rules are that
map's README; they apply here unchanged.

| Check in `verdict.json` | Feature | Passes when |
|---|---|---|
| `installed`, `version`, `enabledFromProfile` (branded) | [install.md](../../control-angular-devtools/features/install.md) | the profile registers the extension and has its version folder |
| `loadedEnabled`, `extension` | [install.md](../../control-angular-devtools/features/install.md) | `chrome://extensions` reports `ENABLED`, the service worker runs |
| `attached`, `detection`, `angularVersion` | [attach.md](../../control-angular-devtools/features/attach.md) | flag set, `detectAngular` says Angular in development mode, backend ready |
| `coexist.signalGraph`, `diGraphTemplateLostIn*` | [signal-graph.md](../../control-angular-devtools/features/signal-graph.md) | the pane lists the same nodes as `ng.ɵgetSignalGraph` |
| `coexist.profiler` | [profiler.md](../../control-angular-devtools/features/profiler.md) | own subscribers add and remove cleanly while DevTools records |
| `coexist.flag` | [attach.md](../../control-angular-devtools/features/attach.md) | `__NG_DEVTOOLS_CONNECTED__` is still `true` after the checks |

Not covered: attach, panel and coexist checks in branded browsers (manual: F12, Angular tab).
