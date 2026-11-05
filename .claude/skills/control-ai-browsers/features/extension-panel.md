# Extension panel

Every instance loads the repository's unpacked Angular AI DevTools extension at launch: the primary checkout's
`extension/` (registry `extension`), or the folder `up --extension=<dir>` names. The extension adds a DevTools panel, "Angular AI", built from `apps/angular-ai-devtools`. Its first
feature (N1, "Why did this update?") lists the Angular version the inspected page announced, and "Explain version
with AI" asks the instance's model about it: the panel calls `LanguageModel` (`availability`, `create`, `prompt`)
itself, in its own extension page, so the inspected page can neither read the prompt nor forge the answer. The
answer renders in the panel. Angular detection still comes from the content scripts (`relay.js`, `agent-main.js`).

## Sub-features

- `extension-load`: `up` loads the extension. Branded Chrome ignores `--load-extension`, so every instance starts
  through `scripts/pipe-keeper.mjs`. The keeper launches the browser with `--remote-debugging-pipe
--enable-unsafe-extension-debugging`, calls CDP `Extensions.loadUnpacked`, and holds the pipe until the browser
  exits. `up` then turns developer mode on (Edge Dev 157 disables unpacked extensions without it) and prints the
  extension id.
- `extension-check`: doctor's `extension` line opens `chrome-extension://<id>/manifest.json` and compares the name
  and version with the loaded folder's `manifest.json`. The folder comes from the state file (`extensionDir`) and
  the id from its path, so a stale or wrong load fails here.
- `extension-worktree`: to try a worktree's build, `C down <name>`, then `C up <name> --extension=extension` from
  the worktree (after building its panel). `up` refuses while the instance runs with another folder.
- `extension-panel`: `panel <name> --url=<app>` drives N1 end to end (`scripts/panel.mjs`).

## How to get to it (user POV)

Open an Angular page, open DevTools (Ctrl+Shift+I), choose the "Angular AI" panel, reload the page so the panel
records the Angular version, then press "Explain version with AI". The answer appears under the button, with
`Prompt API: ready` below it.

## Driving it with control-ai-browsers

Preconditions: the README baseline; the panel built (`npx nx run angular-ai-devtools:build-extension`); an Angular
dev page served (the counter fixture below).

- **Build the panel.** `npx nx run angular-ai-devtools:build-extension` writes `extension/panel/` (`main.js`,
  `styles.css` and `index.html` with `<base href="/panel/">`). A cache hit restores the same files. Run it before
  `up` the first time. The browser reads the extension's pages from disk when they open, so a rebuilt panel needs
  no restart (measured on Edge stable 155, 2026-10-19); a change to `background.js` or `manifest.json` needs
  `down` and `up`.
- **Start an Angular page.** `node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter`
  prints the URL (`http://localhost:4222/` in the main checkout).
- **Drive N1.** `C panel <name> --url=http://localhost:4222/`. It logs
  `[OK] <name> panel answered in <ms> ms (Angular ~22.1.0, extension mgkfgkdgobahfcgkdlokpoehblpbkfok): <answer>`
  and exits 0. With `--json` the result has `answer`, `error`, `status`, `answerMs`, `ngVersion`, `extensionId`
  and `steps`. Exit 1 means the panel showed an error or no answer; the line names it.
- **Proof across every pair.** Run `verify-ai-browsers/checks/extension-panel.mjs --evidence <dir> --url <app>`.
  It runs `panel` and the state claim on every instance.
- Measured on 2026-10-19 against the counter fixture, through `up`, `doctor` (exit 0) and `panel`: Chrome Beta 157
  with Nano 12.9 s and with Gemma 4 13.6 s, Chrome stable 156 with Nano 5.6 s, Edge Dev 157 with Aion 3.1 s, Edge
  stable 155 with Phi-4-mini 8.4 s (click to rendered answer).

## Gotchas

- The panel loads only when it is shown, and the page announces Angular once, at load. `panel` therefore shows the
  panel first and then reloads the page. A person who opens the panel after the page has loaded sees "no update
  yet" until they reload.
- Where `LanguageModel` works (measured 2026-10-19 in all five pairs, `research/19`): the DevTools panel page, a
  dedicated worker the panel starts, and the extension service worker. The hidden `devtools.html` page has it, but
  `availability()` reads `unavailable` and `create()` throws "Access denied because the Permission Policy is not
  enabled". Until 2026-10-19 the feature called the model in the inspected page's MAIN world, where the page could
  read the prompt and answer in its place.
- Edge answers the first F12 in a profile with an "Open DevTools?" prompt in the window. `panel` sends
  Ctrl+Shift+I, which opens DevTools directly in both browsers.
- DevTools 157 keys extension panels as `extension-panel-<uuid>_<n>` in `Extensions.extensionServer.clientObjects`.
  `onShowPanel` takes that key. The older `chrome-extension://<id><title>` id (still used by
  control-angular-devtools) opens nothing. The panel frame's URL is `chrome-extension://<id>/panel/`.
- `Extensions.loadUnpacked` answers only over `--remote-debugging-pipe`. An extension loaded that way is gone after
  a relaunch, because it is not written to the profile. Chrome also exits when its pipe closes, which is why the
  keeper lives as long as the browser (all measured on Chrome Beta 157).
- An idle MV3 service worker is not a CDP target, so the extension id is read from the `devtools.html` frame that
  appears when DevTools opens.
