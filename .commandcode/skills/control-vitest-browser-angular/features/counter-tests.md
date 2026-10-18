# Counter tests

`spikes/ng222-app/src/app/counter.spec.ts` renders `Counter` with `vitest-browser-angular`'s `render()` and
asserts the DOM. Two tests always run: an Increment click moves "Clicks: 3 (double 6, cart 1)" to "Clicks: 4
(double 8, cart 1)", and a `CartService` override shows "cart 2". Two more run only when their environment
variable is set: a test that fails on purpose because it reads the DOM in the same task as the click, and the
hold test that keeps the Counter mounted.

## Sub-features

- `tests-pass` the two default tests pass (`Tests 2 passed | 2 skipped (4)` without flags).
- `tests-timing-demo` with `VITE_COUNTER_TIMING_DEMO=1` one test fails with
  `expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'`.
- `tests-hold` with `VITE_COUNTER_HOLD_MS=<ms>` the hold test passes after the hold.
- `tests-rerun` touching a source file reruns the suite in watch mode.

## How to get to it (user POV)

- Open the Vitest tab (`orchestratorUrl` from `info`) in the attached browser; results show in
  `<evidenceDir>/ng-test.log`, not in the page (`ui: false`).
- Outside this skill: `npm test` in `spikes/ng222-app` runs the default `headless` configuration once.

## Driving it with control-vitest-browser-angular

Preconditions:

- No run recorded (`node $S info` exits 2 with "no state file").

- **Default run.** `node $S up`, then `node $S doctor`: `test-run` reports `last summary: Tests  2 passed | 2
  skipped (4)`.
- **Timing demo.** `node $S down`, then `node $S up --timing-demo`. `doctor` still exits 0 because the run
  itself works, and `test-run` reports `1 failed | 2 passed | 1 skipped (4)`. The log shows the assertion text
  above and a failure screenshot path under `spikes/ng222-app/.vitest/attachments/failure-screenshots/`.
- **Rerun.** `touch spikes/ng222-app/src/app/counter.spec.ts`; the log gains `RERUN  src/app/counter.spec.ts x1`
  and a new summary.
- Save the log lines you cite: `cp <evidenceDir>/ng-test.log <evidenceDir>/ng-test-<step>.log`.
- **Evidence for a test-result claim** is the run's own log: copy it only after the `Tests` summary line
  appears, and cite the summary and any failure text. `doctor` passing is not a test result.

## Gotchas

- A held run's summary appears only after the hold ends; `doctor` reports "a run is in progress" until then.
- `test-run` passes on a failing test on purpose: it checks the run, not the results. Read the summary.
- The builder's `--filter` matches test names, but the hold test runs only with `--hold`:
  `up --hold <ms> --filter "keeps the counter mounted"` runs it alone (`1 passed | 3 skipped (4)`); without
  `--hold` the same filter reports `4 skipped (4)`.
