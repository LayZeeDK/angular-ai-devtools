# Probes and benchmarks

Run a Playwright function against the browser's built-in AI in a tab of its own, and keep its return value as
evidence: a capability probe, a tool-calling exchange, or the model benchmark.

## Sub-features

- `probe-run` runs any `async page => {...}` file in a fresh tab and closes the tab.
- `probe-tools` runs the two-tool round trip in `spikes/probes/probe10.js`.
- `probe-bench` runs `spikes/probes/bench.js` against the ng222-app fixture.

## How to get to it (user POV)

- A developer opens DevTools on a page and calls `LanguageModel` by hand; the script does the same in a tab it
  owns.

## Driving it with control-ai-browsers

Preconditions: the README baseline. For `probe-bench`, the ng222-app fixture serves `http://localhost:4222`
(launch it with `control-angular-dev-app`).

- **Tool round trip.** Run `C run spikes/probes/probe10.js --browser=chrome-beta --json`. `result.q1.answer`
  names 42 and `result.log` lists `get_component_count` and `get_component_inputs`.
- **Benchmark.** Run `C run spikes/probes/bench.js --browser=msedge-dev --json`. `result.modes` holds pass@3 and
  pass^3 per mode; `node spikes/probes/bench-summary.mjs <evidence json>` does not read the wrapper, so pass
  `result` on if you summarise.
- **Own probe.** Write `async page => { await page.goto('https://example.org/'); return page.evaluate(...); }`
  to a file and run `C run <file> --browser=<b>`.
- **Proof.** The `run` JSON in the evidence directory holds the whole return value.

## Gotchas

- `probe10.js` and older probes navigate to `https://example.com`, which shares a renderer with Lars's
  `example.com` tabs; if a probe hangs it freezes those too. New probes should use `https://example.org/`.
- Return objects, not strings: `--raw run-code` JSON-encodes the return value, so a string comes back encoded
  twice.
- A probe without its own timeouts can hang the session (see `SKILL.md` Gotchas). Wrap model calls in
  `Promise.race` with a timeout.
- The function gets the tab as `page`; `page.context()` is Lars's whole browser profile. Do not close other
  pages or clear storage from a probe.
