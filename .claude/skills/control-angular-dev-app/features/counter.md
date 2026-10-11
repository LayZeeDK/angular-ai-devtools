# Counter

The ng222-app page shows one line, `Clicks: 3 (double 6, cart 1)`, and an `Increment` button. Each click
raises the count by one and the doubled value follows. Behind it sit a `title` input, a `count` signal, a
`double` computed, an injected `CartService.items` signal and an effect that copies `count` into `lastLogged`.

## Sub-features

- `counter-render` shows title, count, double and cart size on load.
- `counter-increment` raises count by one per click; double follows.
- `counter-signals` exposes the signal graph: template, `title`, `count`, `double`, `items`, one effect.
- `counter-effect` the effect writes `lastLogged` on every change (deliberate anti-pattern fixture).
- `counter-cd` the component is OnPush by default (no `changeDetection` declared).

## How to get to it (user POV)

- Open `<url>` (`http://localhost:4222/`). There are no routes; the counter is the whole page.
- Press the `Increment` button with the mouse or with keyboard focus plus Enter.

## Driving it with control-angular-dev-app

Preconditions:

- `node $S up --target counter` and `node $S doctor` exit 0 on a fresh page.

- **Render.** Run `playwright-cli -s=<session> snapshot --filename=<evidenceDir>/counter-before.yml`. It
  contains `paragraph: "Clicks: 3 (double 6, cart 1)"` and `button "Increment"`.
- **Increment.** Run `playwright-cli -s=<session> click "getByRole('button', { name: 'Increment' })"`, then
  `playwright-cli -s=<session> snapshot --filename=<evidenceDir>/counter-after.yml`. The paragraph reads
  `Clicks: 4 (double 8, cart 1)`.
- **Signal state.** Run `playwright-cli -s=<session> --raw eval "() => __ngc.signals('app-counter')" >
  <evidenceDir>/counter-signals.json`. After one click: `count` 4, `double` 8; edges include
  `computed:double -> signal:count` and `effect: -> signal:count`.
- **Dependencies.** `eval "() => __ngc.dependenciesOf('app-counter', 'double')"` returns
  `dependsOn: ["count"]`.
- **Change detection.** `eval "() => __ngc.inspect('app-counter').changeDetection"` returns `"OnPush"`; inputs
  show `title: {signal: "Clicks"}`.
- **Effect.** `eval "() => __ngc.inspect('app-counter').state.lastLogged"` equals the count.
- **Button listener.** `eval "() => ng.getListeners(document.querySelector('app-counter button')).map(l => l.name)"`
  returns `["click"]`.
- **Proof.** `playwright-cli -s=<session> screenshot --filename=<evidenceDir>/counter-after.png`.

## Gotchas

- A reload resets the count to 3; there is no persistence.
- The effect node has an empty label, so `dependenciesOf` cannot name it; read it from `signals()`.
- `router()` returns `present: true` with an empty route list: `provideRouter(routes)` with `routes = []`.
- Do not fix the effect that writes a signal; other tools use it as a fixture.
