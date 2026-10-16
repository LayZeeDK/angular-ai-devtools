# Vitest Browser Mode verification map

The maintained source for driving the ng222-app counter's Vitest Browser Mode run through
control-vitest-browser-angular. Read this index, then use the matching feature file as the recipe.

## Baseline preconditions

- Run commands from the repository root. `S` is `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`.
- `node $S up --extension s1-vitest --hold 90000`, then `node $S doctor` exits 0. `mounted-component` passes
  only while the hold test runs (90 s from `RUN`, or from a `RERUN` after a touch).
- Take `<session>`, `<cdpUrl>`, `<evidenceDir>` and `orchestratorUrl` from `node $S info`.
- Attach the session: `playwright-cli attach --cdp=<cdpUrl> --session=<session>`, then `tab-list` and
  `tab-select` the tab titled "Vitest Browser Runner".
- Fresh state of the held Counter: `Clicks: 3 (double 6, cart 2)` (cart overridden to `['pear', 'plum']`).
- Never attach to a browser outside `control-ai-browsers/instances.json` or the bundled Chromium `up` started.

## Driving conventions

- Every command is `playwright-cli -s=<session> ...`. Commands are literal.
- Inside the tester iframe: snapshot refs (`f1e4`) for clicks, `run-code` with `page.frame('vitest-iframe')` for
  waits and reads.
- Roles and accessible names first (`button "Increment"`), text next (`/^Clicks:/`); no test ids exist.
- One action per step; snapshot before and after into `<evidenceDir>`.
- Wait on an end state (`frame.waitForFunction`), never a sleep.
- Re-run: `touch spikes/ng222-app/src/app/counter.spec.ts`, then wait for `RERUN` in `<evidenceDir>/ng-test.log`.

## Proof and skip reporting

- Drive the path a test user takes: clicks in the tester iframe, not component setters or `ng.applyChanges`.
- Capture the action and the state after it: snapshots before and after, one screenshot of the Vitest tab.
- Check the side effect next to the screen: the `ng.*` state read in the frame, and the test result in
  `ng-test.log`.
- No mocks except the `CartService` override the spec itself makes; no test-only hooks beyond the hold.
- A claim that names an entry point is driven through that entry point; a different path does not count.
- For a fix, run the same recipe on the old state (a second worktree, which gets its own derived Vitest port)
  and on the change. One run at a time per checkout and one browser instance at a time, so a baseline and its
  change run one after the other.
- The verdict comes from lars-verify. Verified: `doctor` exited 0, the expected end state is in the
  after-snapshot or the read, and for a fix the baseline shows the old behaviour. Not verified: `doctor`
  exited 0 and the end state or the test summary contradicts the claim. Inconclusive: `doctor` failed, the
  Counter was not mounted when driven (the hold ran out), there is no valid baseline, or a pass did not repeat.
- A recipe that passed once after a fix runs a second time before it counts.
- Name each entry point you did not reach and why; do not count it as covered through another path.
- A result from the bundled flow says nothing about the model; a result from one instance says nothing about
  another browser. Name the browser and version `doctor` reports.

## Feature entry contract

Each feature file has an H1, one paragraph of user-visible behaviour, then four H2s in order:
`Sub-features`, `How to get to it (user POV)`, `Driving it with control-vitest-browser-angular` (starting with
`Preconditions:`), `Gotchas`.

## Manual only

- The Angular DevTools extension: not loaded into these browsers; install it by hand in an instance if needed.
- The Vitest UI (`ui: false` in both runner configs).
- Edge Dev and Edge stable instances: the provider is the same, but no run was made on them.

## Features

- [Counter tests](./counter-tests.md): the four specs, their results, the failing timing demo.
- [Held Counter](./held-counter.md): the mounted Counter in the tester iframe, its signals, injector, override
  and profiler events.
- [Extension in the tester iframe](./extension-in-tester.md): the S1 variant's content scripts, DevTools panel
  and `LanguageModel` reaching the tester iframe.
