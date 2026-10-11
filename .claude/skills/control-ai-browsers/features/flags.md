# Flags

The experimental flags that turn on the built-in AI APIs, tool use, WebMCP and the model choice, read from
`Local State` and from the flags page, and set through the flags page.

## Sub-features

- `flags-get` lists `Local State` `browser.enabled_labs_experiments` and the flags-page value of each id.
- `flags-set` sets one flag to `Default`, `Enabled` or `Disabled` and reads it back.
- `flags-restart` restarts the browser so a flag takes effect, and reads `Local State` again.

## How to get to it (user POV)

- `chrome://flags/#<id>` or `edge://flags/#<id>`, the drop-down next to the flag, then the Restart button.
- `Local State` in `%LOCALAPPDATA%\Google\Chrome Beta\User Data\` or `%LOCALAPPDATA%\Microsoft\Edge Dev\User Data\`
  (the browser writes it; editing it is only safe with the browser closed).

## Driving it with control-ai-browsers

Preconditions: the README baseline.

- **Read the required set.** Run `C flags get --browser=chrome-beta`. `Local State` lists the eight required
  entries; each required id reads `Enabled` on the page.
- **Read one flag.** Run `C flags get smooth-scrolling --browser=msedge-dev`. One line, `Default`.
- **Round trip without restart.** Run `C flags set smooth-scrolling Disabled --browser=chrome-beta`, then
  `C flags set smooth-scrolling Default --browser=chrome-beta`. Each prints the page value it read back after a
  reload. The change never takes effect because no restart happens between them.
- **Set and restart.** Run `C flags set <id> Enabled --restart --browser=<b>`. The JSON holds the restart (old
  and new PID) and `localStateAfter`, which must contain `<id>@1`.
- **Proof.** The flags-set JSON (`applied`, `readBack`) plus, after a restart, `localStateAfter` or a fresh
  `flags get`.

## Gotchas

- `Local State` does not show a page change until the browser writes it; read it after a restart.
- `webmcp-testing` is not the WebMCP flag; the id is `enable-webmcp-testing`. Unknown ids written into `Local
  State` are dropped by the browser.
- Edge Dev 157's page does not list `edge-llm-prompt-api-tool-use` or
  `edge-llm-on-device-model-prerelease-tool-use-workaround`; set those only by editing `Local State` with Edge Dev
  closed. `spikes/probes/enable-flags.mjs` shows the pattern (back up, edit `browser.enabled_labs_experiments`,
  write), but it still adds the invalid `webmcp-testing@1`; remove that entry before reusing it.
- Some option lists have only `Default` and `Enabled` (`prompt-api-tool-use`, `gemma4-for-built-in-ai`); asking
  for `Disabled` returns `no-option:Disabled` and exit 1.
