# Portal navigation

The Insurance Portal has a fixed header ("Insurance Portal" with the ng-journal logo), a sidebar grouped by
domain (General, Contract, Claim, Complaint, Customer) and a content area. `/` redirects to `/home`, which
shows four tiles linking to the domain lists. Domain routes load lazily, guarded by feature flags; unknown URLs
show "Page Not Found".

## Sub-features

- `nav-home` `/` redirects to `/home`; heading `Home`; tiles Contracts, Claims, Complaints, Customers.
- `nav-tiles` each home tile is a link to `/<domain>/list`.
- `nav-sidebar` sidebar entries `List` and `Create` per domain (Customer has `List` only) and `Home`.
- `nav-active` the active sidebar entry gets a highlighted background.
- `nav-lazy` the router config grows as domain routes load (`__ngc.router()`).
- `nav-not-found` any unknown path renders `Page Not Found` (read from source; not driven yet).

## How to get to it (user POV)

- Open `<url>`.
- Click a home tile (a real link).
- Click a sidebar entry (a `div` with `routerLink`, not a link).
- Type a URL into the address bar (deep link).

## Driving it with control-angular-dev-app

Preconditions:

- `node $S up --target portal`; `node $S doctor --target portal` exits 0 and leaves the page on `/home`.

- **Home.** `playwright-cli -s=<session> snapshot --filename=<evidenceDir>/home.yml` shows
  `heading "Home" [level=1]` and links `Contracts`, `Claims`, `Complaints`, `Customers` with `/url:
  /<domain>/list`.
- **Tile.** `playwright-cli -s=<session> click "getByRole('link', { name: 'Contracts' })"`, then
  `playwright-cli -s=<session> --raw run-code "async page => { await page.waitForURL('**/contract/list'); await
  page.locator('table tbody tr').first().waitFor(); return page.url(); }"` prints `.../contract/list`.
- **Sidebar.** `playwright-cli -s=<session> click "getByRole('navigation').getByRole('listitem').filter({
  hasText: 'CLAIM' }).getByText('Create')"`; the URL becomes `/claim/create`.
- **Router state.** `playwright-cli -s=<session> --raw eval "() => __ngc.router()"`: after visiting
  `/contract/list` the route list contains `/contract/list`, `/contract/create`, `/contract/:id/edit`,
  `/contract/:id/details`.
- **Deep link.** `playwright-cli -s=<session> goto <url>customer/list`; heading `Customers`.
- **Proof.** Screenshot with the header visible:
  `playwright-cli -s=<session> screenshot --filename=<evidenceDir>/nav.png`.

## Gotchas

- Sidebar texts render upper-case through CSS/pipe (`CONTRACT`), and the entries have no link role.
- The header link goes to `https://www.ng-journal.com`; do not click it in a proof.
- `goto` reloads the app and drops `__ngc` unless it was installed by `doctor` or `run-code` (the init script
  re-installs it on every load in the same session).
