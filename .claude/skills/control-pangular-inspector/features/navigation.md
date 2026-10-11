# Navigation

After a user moves through the app, Pangular explains each navigation: where it started, what triggered it,
which routes the router checked, how long it took, and how it ended.

## Sub-features

- `nav.explain`: `explain-navigation`, newest first, with trigger, initiator and outcome.
- `nav.route`: `inspect-route`, the current URL and active route tree (not run in the proof).
- `nav.routes`: `list-routes` and `lint-routes` on the live route config (not run in the proof).

## How to get to it (user POV)

- Click a sidebar entry in the portal, then ask over MCP.
- The panel's Routes tab.

## Driving it with control-pangular-inspector

Preconditions: baseline; the page on `/home`.

- Navigate like a user: the `run-code` click on CONTRACT > List from SKILL.md Drive -> returns
  `http://localhost:4775/contract/list`.
- Explain: `node $S call explain-navigation --args '{"limit":2}' --out explain-navigation.json` -> newest entry
  `/contract/list` **succeeded**, from `/home`, started by `RouterLink div "List"`.

## Gotchas

- The sidebar entries are `div`s with `routerLink`, so the initiator reads `RouterLink div`, not `a`.
- `explain-navigation` keeps `limits.navigations` (50) per page; a reload starts a new page id and a new list.
