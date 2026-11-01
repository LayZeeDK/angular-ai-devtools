# Setup

A developer adds Pangular Inspector to an app as a dev-only tool pinned to one exact version, configured so the page
reports to a devtools server, and can take it out again leaving the app exactly as git has it.

## Sub-features

- `setup.install`: exact pin `@pangular-inspector/devtools@0.0.7` in `devDependencies`, overlay import, proxy, `proxyConfig`.
- `setup.check`: six read-only facts, one line each.
- `setup.remove`: restore from git `HEAD`, prune `node_modules`, assert a clean worktree; undoes an uncommitted
  install only.
- `setup.refuse`: `remove` refuses when files it does not manage are changed; `install` refuses SSR and Vite mounts.

## How to get to it (user POV)

- A command in the app folder (`npm install ...` plus edits to `main.ts`, `project.json`, `proxy.conf.json`).
- The script: `install`, `check`, `remove`.

## Driving it with control-pangular-inspector

Preconditions: the portal worktree clean (`git status --porcelain` empty) or holding only this skill's
changes; no server from this skill running (`remove` changes files a running dev server reads).

- Install: `node $S install --json` -> `changed` lists `package.json`, `package-lock.json`,
  `apps/insurance-portal/src/main.ts`, `apps/insurance-portal/project.json`, `apps/insurance-portal/proxy.conf.json`.
  `git diff --stat` shows the lockfile with insertions only (457 lines measured).
- Check: `node $S check` -> six `[OK]` lines, exit 0.
- Type check: `npm exec -- nx run insurance-portal:typecheck` in the worktree exits 0 with the overlay import.
- Remove: `node $S remove --json` -> exit 0, `gitStatus: []`, `gitDiffStat: ""`; `node $S check` then exits 1
  only where `HEAD` has no Pangular setup.
- The setup is not committed in the portal checkout (its `git log` holds no commit for it), so `check` there
  exits 0 where the worktree carries it with no install (measured), `install` finds the package pinned, and
  `remove` restores `HEAD`, undoing an uncommitted install only (read from `remove` in `scripts/control.mjs`,
  not run in this pass). Taking Pangular out of the portal is a product change for Lars.

## Gotchas

- `install` reads the first Nx app under `apps/` with an `@angular/build:dev-server` serve target; pass
  `--project` in a workspace with several.
- The `main.ts` edit needs the form `bootstrapApplication(...).catch(`; anything else exits 2 and the overlay
  import goes in by hand, in the dev-guarded form SKILL.md Launch step 1 describes. npm has already
  pinned the package by then, so `package.json` and the lockfile are changed.
- npm 11 rewrites this lockfile on any install; see SKILL.md Gotchas.
