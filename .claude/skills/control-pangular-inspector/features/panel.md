# Panel UI

A developer opens Pangular's full-page panel on the app's own origin and sees the dashboard, the live tabs
and the active configuration. Agents use it only as a fallback or for a screenshot a human will read.

## Sub-features

- `panel.dashboard`: project name, Angular and TypeScript versions, SSR off, `LIVE` badge, Configuration block (`Agent: Read-only`).
- `panel.tabs`: Components, Routes, Signals, Injectors, Store, Forms, Pipes, SSR & HTTP.
- `panel.button`: the amber floating button the overlay adds to the app page.

## How to get to it (user POV)

- `http://localhost:4775/__pangular/` (through the `ng serve` proxy).
- `http://localhost:9999/` directly (trusts only that origin's one-time code).
- The floating button in the bottom-right corner of the app.

## Driving it with control-pangular-inspector

Preconditions: baseline (the doctor has answered the one-time-code prompt in this session).

- Open: `playwright-cli -s=pangular-9999 goto http://localhost:4775/__pangular/` -> title `Pangular Inspector`.
- Wait: `playwright-cli -s=pangular-9999 --raw run-code "async page => { await page.getByText('LIVE').first().waitFor(); return (await page.locator('body').innerText()).slice(0, 400); }"`
  -> the dashboard text with `Angular 22.2.2` and `Agent Read-only`.
- Evidence: `playwright-cli -s=pangular-9999 screenshot --filename=<evidenceDir>/panel-dashboard.png`.
- Return: `playwright-cli -s=pangular-9999 goto http://localhost:4775/` before the next live read.

## Gotchas

- The dashboard's source counts are 0 in this Nx workspace (see source-scan.md); live tabs are unaffected.
- A new browser profile asks for the one-time code again; take it from `pangular.log`.
