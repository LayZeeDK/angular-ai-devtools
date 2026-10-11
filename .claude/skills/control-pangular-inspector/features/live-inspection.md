# Live inspection

With the app open in a browser, an agent asks Pangular what the page holds: which tabs report, the component
tree, one component's inputs, properties and injected services, its signal graph, and its injectors.

## Sub-features

- `live.pages`: `list-pages` shows the tab's page id, URL and the inspectors that report.
- `live.tree`: the component outline (`components`; `list-components` on versions after 0.0.7).
- `live.component`: `inspect-component` for one host tag or instance id.
- `live.signals`: `inspect-signals` nodes and edges for one component.
- `live.providers`: `inspect-providers` lookup path, by selector or by `token`.

## How to get to it (user POV)

- MCP over HTTP at `http://localhost:9999/__mcp` (this script, or an MCP client configured with the URL and an
  `Origin` header).
- The panel's Components, Signals and Injectors tabs (see panel.md).

## Driving it with control-pangular-inspector

Preconditions: baseline; the portal on `/contract/list` (drive it there as in SKILL.md Drive).

- Page connected: `node $S call list-pages --out list-pages.json` -> a row whose id equals
  `playwright-cli -s=pangular-9999 --raw eval "() => window.__pangularPageId"` and URL `/contract/list`.
- Tree: `node $S components --depth 3 --out list-components.json` -> `AppComponent <ng-journal-root>`,
  `SidebarComponent <ng-journal-sidebar>`, `ListComponent <ng-journal-list>`, `HeaderComponent`, `Table <p-table>`.
- Component: `node $S call inspect-component --args '{"selector":"ng-journal-list"}' --out inspect-component.json`
  -> `ListComponent`, path `ng-journal-root > ng-journal-list`.
- Signals: `node $S call inspect-signals --args '{"selector":"ng-journal-list"}' --out inspect-signals.json`
  -> a `template` node `ng-journal-list` and a `computed` node `contracts`.
- Providers: `node $S call inspect-providers --args '{"selector":"ng-journal-list"}' --out inspect-providers.json`
  -> an element injector `ng-journal-list` with its `lookupPath`.

## Gotchas

- The routed list components of the four features share the class name `ListComponent` and the tag
  `ng-journal-list`; a read describes whichever is on screen.
- `inspect-signals` reports one graph per page: the component picked last, else the deepest routed one.
- Instance ids (`cgg06-4`) change with every page load; re-read the tree before using one.
