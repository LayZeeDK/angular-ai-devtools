# Signal graph pane

In the Components tab a developer selects a component and clicks "Show Signal Graph". The pane draws the
component's template node, its signals, computeds and effects, with their current values and edges.

## Sub-features

- Component tree selection.
- Signal graph nodes (kind, label, value) and edges.
- Agreement with `ng.ɵgetSignalGraph(ng.getInjector(host))`, which the pane's backend calls.
- The `angular:di_graph` regression: after that tool runs, the template node is gone from both.

## How to get to it (user POV)

F12 -> Angular tab -> Components -> click `app-counter` -> "Show Signal Graph".

## Driving it with control-angular-devtools

Preconditions: the test harness is up on the counter fixture (`doctor` exits 0); `--di-graph` last, since it
breaks the page's signal graph until reload.

```bash
node $S panel signal-graph --component=app-counter
node $S panel screenshot
node $S coexist --di-graph        # before/after angular:di_graph, with screenshots
```

Expected on the fixture before: `template:app-counter, signal:title, signal:count, computed:double,
signal:items, effect:Effect`. After `angular:di_graph` (measured 2026-10-11): pane `signal:count,
effect:Effect`, `ng.ɵgetSignalGraph` `effect, signal:count`.

## Gotchas

- `--di-graph` leaves the page's signal graph broken until reload.
- The pane refreshes after change detection; `coexist --di-graph` clicks the app before re-reading.
- `.node-cont.kind-*` are DevTools 1.22.0 class names; re-read them from the live panel after an update. Other
  kinds the counter lacks: `linked-signal`, `child-signal-prop`, `resource`, `unknown`.
