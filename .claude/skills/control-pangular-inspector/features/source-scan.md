# Source scan

With no running app, Pangular's CLI scans the source for routes, components, signals, providers, pipes and
NgRx declarations and answers over a stdio MCP server.

## Sub-features

- `scan.tools`: `get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`, `build-meta`.
- `scan.root`: `--root` picks the folder to scan.

## How to get to it (user POV)

- `npx pangular mcp --root <dir>` in an MCP client config (stdio).
- The script: `scan <tool>`, which starts that server, calls one tool and stops it.

## Driving it with control-pangular-inspector

Preconditions: the package installed (`check` passes `installed`); no server needed.

- Workspace root: `node $S scan get-components` -> `[]` in the portal (measured).
- App root: `node $S scan get-components --root apps/insurance-portal` -> `AppComponent`, `HomeComponent`,
  `PageNotFoundComponent`, `SidebarComponent`, and a stderr warning that the folder has no `angular.json`.
- `build-meta` for versions: `node $S scan build-meta`.

## Gotchas

- The scan reads `angular.json` projects or `<root>/src` only; an Nx workspace with `project.json` and code
  in `libs/` is mostly invisible to it. Use the live tools for anything in `libs/`.
- Results with `--out` land in `tmp/control-pangular-inspector/scan/`.
