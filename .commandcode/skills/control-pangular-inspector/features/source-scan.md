# Source scan

With no running app, Pangular's CLI scans the source for routes, components, signals, providers, pipes and
NgRx declarations and answers over a stdio MCP server.

## Sub-features

- `scan.tools`: `get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`,
  `build-meta`; also `explain-render-mode`, `lint-pipes`, `explain-pipe` and the `analog-*` tools
  (`node $S scan nope` prints the full stdio list).
- `scan.root`: `--root` picks the folder to scan.

## How to get to it (user POV)

- `npx pangular mcp --root <dir>` in an MCP client config (stdio).
- The script: `scan <tool>`, which starts that server, calls one tool and stops it.

## Driving it with control-pangular-inspector

Preconditions: the package installed (`node_modules/@pangular-inspector/devtools/bin.mjs` exists; `check`
passes `installed`); no server or browser needed.

- Workspace root: `node $S scan get-components` -> `[]` in the portal (measured).
- App root: `node $S scan get-components --root apps/insurance-portal` -> `AppComponent`, `HomeComponent`,
  `PageNotFoundComponent`, `SidebarComponent` (measured), and a stderr warning that the folder has no
  `angular.json` "so the source scans find nothing"; the warning is wrong here, the `src` folder is scanned.
- `build-meta` for versions: `node $S scan build-meta` -> Angular `22.2.2`, project `@ng-journal/source`,
  TypeScript `6.0.3`, `ssr: false` (measured).

## Gotchas

- The scan reads the `sourceRoot` of each `angular.json` project plus `<root>/src`; it ignores `project.json`
  (only `build-meta` reads it). An Nx workspace with code in `libs/` is mostly invisible to it. Use the live
  tools for anything in `libs/`.
- The stdio server lists no page tools (`inspect-*`, `list-pages`): they need a page, which only the HTTP
  server gets. `--read-only` drops only the action tools.
- Results with `--out` land in `tmp/control-pangular-inspector/scan/`.
