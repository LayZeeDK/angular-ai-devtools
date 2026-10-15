# Profiler

The Profiler tab records change detection cycles while the developer uses the app, then shows a bar per
cycle. It subscribes through `ng.ɵsetProfiler`, which keeps a list of subscribers in Angular 22.

## Sub-features

- Start and stop recording; cycle count.
- Coexistence: other `ɵsetProfiler` subscribers (an AI extension) added and removed during a recording.

## How to get to it (user POV)

F12 -> Angular tab -> Profiler -> record button -> use the app -> stop.

## Driving it with control-angular-devtools

Preconditions: the test harness is up on the counter fixture (`doctor` exits 0).

```bash
node $S coexist
```

Expected (measured): `own subscribers {"bothOn":{"a":16,"b":16},"afterRemoveA":{"a":16,"b":32}}; DevTools
recorded 2 change detection cycles`.

## Gotchas

- `ng.ɵsetProfiler(null)` clears every subscriber, DevTools' included; remove your own with the function
  `ɵsetProfiler(cb)` returns.
- DevTools' subscriber cannot be listed from the page (the list is module-private); the recording result is
  the evidence that it still runs.
- Wait for the click's change detection before reading counters.
