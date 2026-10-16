# Navigation

After a user moves through the app, Pangular explains each navigation: where it started, what triggered it,
which routes the router checked, how long each phase took, and how it ended.

## Sub-features

- `nav.explain`: `explain-navigation`, newest first, with trigger, `started by`, phases and outcome
  (`succeeded`, `cancelled`, `redirected`, `failed`, `skipped`, `pending`).
- `nav.route`: `inspect-route`, the current URL, document title and active route tree.
- `nav.routes`: `list-routes` and `lint-routes` on the live route config.

## How to get to it (user POV)

- Click a sidebar entry in the portal, then ask over MCP.
- The panel's Routes tab.

## Driving it with control-pangular-inspector

Preconditions: baseline; the page on `/home`.

- Navigate like a user: the `run-code` click on CONTRACT > List from SKILL.md Drive -> returns
  `http://localhost:4507/contract/list`.
- Explain: `node $S call explain-navigation --args '{"limit":2}' --out explain-navigation.json` -> newest entry
  `` `/contract/list`: **succeeded** ``, trigger `imperative`, `from /home`, `started by RouterLink div "List"`,
  lazy loaded `contract`, `list`.
- Route: `node $S call inspect-route --out inspect-route.json` -> URL `/contract/list`, active routes
  `/contract` (lazy) > `/list` -> `ListComponent`.
- Routes: `node $S call list-routes` (12 routes, measured) and `node $S call lint-routes` (one `info`
  finding, `missing-title`).

## Gotchas

- The sidebar entries are `div`s with `routerLink`, so `started by` reads `RouterLink div`, not `a`. A router
  link click has trigger `imperative`; `started by` appears only when the click came less than 2 s before the
  navigation.
- `limit` on `explain-navigation` defaults to 5 (at most 50). The page keeps `limits.navigations` (50) entries.
- A reload keeps the page id (it lives in `sessionStorage`) but starts an empty navigation list; the first
  navigation before the overlay connected shows "no details".
