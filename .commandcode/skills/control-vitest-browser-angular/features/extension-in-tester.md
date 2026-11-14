# Extension in the tester iframe

An unpacked extension loaded by `up --extension <dir>` runs in the same browser as the tests. In attach mode
`LanguageModel` is `available` in the tester iframe; in bundled mode it is not.

## Sub-features

- `ext-loaded` the extension's service worker target exists (`doctor` `extension-loaded`).
- `ext-model` `LanguageModel.availability()` is `available` in the tester iframe (attach mode); `unavailable` in
  bundled mode.

## How to get to it (user POV)

- The extension's own UI in the browser `up` attached to or started.

## Driving it with control-vitest-browser-angular

Preconditions:

- `node $S up --extension extension --hold 90000` (the repository's `extension/`); `doctor` exits 0 with
  `extension-loaded` passing.

- **Loaded.** `doctor --json > <evidenceDir>/doctor.json` records the service worker URL.
- **Model.** `doctor` `language-model`.

## Gotchas

- No test extension with content scripts for the Vitest server exists in the repository, so nothing checks that
  an extension reaches the tester iframe. The repository's `extension/` does not inject there (measured
  2026-11-12: no execution context from its origin in the tester iframe).
- In attach mode `down` uninstalls the extension (its notes say `uninstalled extension <id>`); in bundled mode it
  deletes the profile the extension was loaded into.
- In the bundled flow the extension id comes from its service worker target after `up` (the path decides the id).
