# Model lifecycle

Which on-device model serves the Prompt API, how big it is and where it lives, and how to switch to another
model, download it with a user gesture, initialise it, and clear one that is no longer wanted.

## Sub-features

- `model-info` reports name, version and size from disk, the Broker State, the flag profile and the serving model.
- `model-switch` changes the flag profile and restarts (Chrome Beta `gemma4` <-> `nano`, Edge Dev `aion` <-> `default`).
- `model-download` starts a download from a real click, reports progress, size and duration, and waits for `available`.
- `model-init` times the first and second session and reads `contextWindow`.
- `model-clear` removes one named model, never Gemma 4 or Aion.

## How to get to it (user POV)

- The flags page entries `gemma4-for-built-in-ai` and `prompt-api-tool-use` (Chrome Beta) or
  `edge-llm-on-device-model-prerelease` (Edge Dev), then Restart.
- `chrome://on-device-internals` / `edge://on-device-internals` > Broker State: assets, use cases, models, the
  free-space criteria, and the "Uninstall Models" button (all models).
- A page calls `LanguageModel.create({ monitor })` from a click; the browser downloads the model.
- The model folders under the profile: Chrome Beta `OptGuideManifestModel\<hash>\<version>` and
  `OptGuideOnDeviceModel\<version>`; Edge Dev `EdgeLLMOnDeviceModel\<version>`, each with a `manifest.json`.

## Driving it with control-ai-browsers

Preconditions: the README baseline, and Broker State "Enough disk space to install" is `true` (the browsers
require 20,480 MiB free on the profile drive before they install anything).

- **Report.** Run `C model info --browser=chrome-beta`. Lines for `gemma4-2b-it` 2026.06.10 (2,374 MiB) and
  `v3Nano` 2025.06.30 (4,072 MiB), Broker State assets `gemma4_component` and `nano_v3_gpu_component` `Ready`,
  profile `gemma4`, serving `gemma4-2b-it`.
- **Switch away.** Run `C model switch nano --browser=chrome-beta` (or `default` on `msedge-dev`). It prints the
  flags-page values, the restart (old and new PID), the profile read from `Local State`, and `LanguageModel`
  availability. Exit 0 when `Local State` matches the profile.
- **Download.** When availability is `downloadable` or `downloading`, run `C model download --browser=<b>`. It
  logs progress every 10 % and ends with the click-to-ready duration and the folders added on disk with MiB.
- **Initialise.** Run `C model init --browser=<b>`. First and second create times, `contextWindow`, and the answer
  to `Say hi in three words.` Measured on Chrome Beta (Gemma 4, warm browser): first create 4,905 ms, second
  1,095 ms, prompt 7,451 ms, `contextWindow` 9,216.
- **Check the new model.** Run `C model info` and `C doctor --expect=<profile>`. `model.serving` names the
  expected model.
- **Clear.** Run `C model clear --confirm=v3Nano --browser=chrome-beta`. Chrome Beta closes, the `v3Nano` folder
  is deleted, Chrome Beta starts again and the JSON holds the Broker State assets and the disk list afterwards.
  `gemma4-2b-it` must still be on disk.
- **Switch back.** Run `C model switch gemma4 --browser=chrome-beta` (or `aion`), then `C doctor` with no
  `--expect`; it must exit 0.
- **Proof.** One evidence directory with `model info` before and after, the switch, download and init JSON.

## Gotchas

- Downloads need 20,480 MiB free on the profile drive (Broker State "Enough disk space to install"). Below that,
  `availability()` still says `downloadable` or `downloading` while the asset stays `Not Installed` 0 % and the
  use cases read `Pending Assets`. Measured on Edge Dev with 15,150 MiB free; `model download` now stops with
  that reason instead of polling.
- Edge Dev: after switching to `default`, the asset `edge_base_model` went `Not Installed` while the Aion folder
  stayed on disk, and the Broker State manifest path moved from `variants\webgpu-fp16-prerelease` to
  `variants\webgpu-fp16`. The default model's name is not measured yet (Microsoft's docs say Phi-4-mini); the
  `default` profile expects a manifest name matching `phi-4-mini`.
- Inferred, not measured: the default model download replaces the single `EdgeLLMOnDeviceModel\2026.10.2.1`
  folder, so switching back to Aion would download Aion again (both variants name the same asset and version).
- Chrome Beta's "Uninstall Models" removes every model (its handler `uninstallModels()` takes no argument), so
  `model clear` deletes the folder with the browser closed instead. After restart Broker State shows
  `nano_v3_gpu_component` `Not Installed`, but Chrome downloaded it again within 7-9 minutes both times (see
  `SKILL.md` Gotchas). Measured clears: 4,719,751,168 and 4,267,655,168 bytes freed.
- Gemini Nano (`nano` profile): `contextWindow` 9,216; first create 9.1 s, second 3 ms, prompt 10.2 s. Tool
  sessions fail with `NotSupportedError: The device is unable to create a session` (tool use is off there).
- Broker State under the `gemma4` profile: the use case to check is `prompt_api_gemma4`; plain `prompt_api`
  can read `Pending Assets` after Nano is cleared.
- `prompt-api-tool-use` also selects model v4, so the `nano` profile turns tool use off; the tool canary is
  skipped there.
