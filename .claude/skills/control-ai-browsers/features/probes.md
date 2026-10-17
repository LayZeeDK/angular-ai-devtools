# Probes and benchmarks

Run a Playwright function against an instance's built-in AI in a tab of its own and keep its return value as
evidence: a capability probe, a tool-calling exchange, or the model benchmark with the backend and CPU load it
ran under.

## Sub-features

- `probe-run` runs any `async page => {...}` file in a new tab and closes the tab.
- `probe-tools` runs the two-tool round trip in `spikes/probes/probe10.js`.
- `probe-bench` runs `spikes/probes/bench.js` in one or more instances and records backend, performance class and
  CPU load per result.

## How to get to it (user POV)

- A developer opens DevTools on a page and calls `LanguageModel` by hand; the script does the same in a tab it
  owns.

## Driving it with control-ai-browsers

Preconditions: the README baseline. For `probe-bench`, the ng222-app counter fixture serves
`http://localhost:4222` (`bench.js` hard-codes it; `control-angular-dev-app` launches the fixture). That is
the main checkout's port: in a worktree `control-angular-dev-app` derives another port and refuses 4222, so
`bench` runs from the main checkout only.

- **Broker State text.** Run `C run chrome-beta-nano spikes/probes/broker-state.js --json`. `result` is the
  Broker State text; the tab is gone afterwards (`C instances` shows `1 tab(s)`).
- **Tool round trip.** Run `C run edge-dev-aion spikes/probes/probe10.js --json`. `result.q1.answer` names 42
  and `result.log` lists `get_component_count` and `get_component_inputs`.
- **Benchmark.** Run `C bench edge-dev-aion chrome-beta-gemma4 --json`. `results[i]` holds the serving model,
  `backend`, `performanceClass`, `cpuBefore` and `cpuAfter` (load percent and the five busiest processes), the
  duration and `result`, the `bench.js` return value. Summarise with `node spikes/probes/bench-summary.mjs` on
  files holding those `result` values.
- **Own probe.** Write `async page => { await page.goto('https://example.org/'); return page.evaluate(...); }` to
  a file and run `C run <instance> <file>`.
- **Proof.** The `run` or `bench` JSON in the evidence directory holds the whole return value.

## Gotchas

- Return objects, not strings: `--raw run-code` JSON-encodes the return value, so a string comes back encoded
  twice.
- A probe without its own timeouts can hang the session's renderer; wrap model calls in `Promise.race` with a
  timeout. `bench.js` has a 120 s per-prompt timeout and returns tool exceptions as tool errors.
- The function gets the tab as `page`; `page.context()` is the whole instance profile. Do not close other pages or
  clear storage from a probe.
- A tool response must carry both `callID` (Chrome Beta 156) and `callId` (Edge Dev 157.0.4329 requires it, or the
  round trip ends in `TypeError: ... 'callId' ... Required member is undefined`). `probe10.js`, `bench.js` and
  `doctor`'s `canary.tools` send both; a new probe must too.
- Chrome Beta Nano runs `probe10.js` without error but answers in prose instead of calling the tools (measured
  2026-10-17); the tool round trip is proven on `edge-dev-aion`.
- `bench` does not use `spikes/probes/bench-all.sh`: that script cannot record the backend and load per result,
  and it uses the `bench-*` sessions, which belong to Claude.
- Benchmark latency depends on the backend and on CPU load from other sessions on this machine; compare only
  results with the same backend and similar `cpuBefore`.
