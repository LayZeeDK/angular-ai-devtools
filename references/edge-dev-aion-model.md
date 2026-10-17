# Edge Dev Aion: why the model is pinned

How to use the pin (`model pin`, the restore on `up`, doctor's `model.pin` row) is in
`.claude/skills/control-ai-browsers/features/model-lifecycle.md`. This file records why the pin exists, what was
measured, and when to drop it.

## What Edge ships

Edge Dev gets Aion as three separate components, each updated on its own by the component updater
(`edge://components`):

| Component | Folder in the profile | Role |
| --- | --- | --- |
| Edge On-Device Model Manifest | `EdgeOptimizationGuideModelsManifest\<version>` | names the base model to load (`edge_base_model`) |
| Edge LLM On Device Model | `EdgeLLMOnDeviceModel\<version>` | the model weights |
| Edge LLM Runtime | `EdgeLLMRuntime\<version>` | the inference runtime |

Aion works only when the model and runtime on disk match the version the manifest names.

## What was measured (2026-10-17, Edge Dev 157.0.4329)

- Edge published model 2026.10.15.1 and runtime 2026.10.12.1, but the manifest stayed at 2026.10.2.1 and still
  names `edge_base_model` 2026.10.2.1. "Check for update" on the manifest finds nothing newer.
- A profile that takes the new pair breaks about a minute after launch, with no page call and no interruption:
  Broker State reads the asset `Not Installed`, `prompt_api` `Not Supported` or `Pending Assets`, and
  `LanguageModel.availability()` returns `unavailable` or `downloading`.
- "Check for update" on the model or runtime pulls in the new pair, so it causes the break; it does not repair it.
- With the 2026.10.2.1 pair restored and `--disable-component-update` on the command line, doctor exits 0 (model
  Ready on GPU, every canary prompt passes) through two restarts and 4.5 minutes of watching. Without the switch
  the restored pair broke again 1.5 minutes after launch.
- An update cut short by `down` (once after the runtime landed, once while the model read "Downloading") left the
  folders wrong in the same way; `up` restored the pin each time and doctor exited 0.
- The four-instance `state` verdict on that setup: verified, 2/2 runs
  (`tmp/control-ai-browsers/verify/health-check/20261017T1430Z-state-rerun2`).

Measured: `down` and the skill do not cause the break. The command line and features were the same in the broken
and the working state (doctor's `flags` row passed in both); only the model folders differed. A broken download
leaves the same wrong folders, and the restore on `up` covers both.

Inferred, not proven: that Edge simply published the model ahead of its manifest. Not ruled out: the new model
may need an `edge://flags` entry or a server-side experiment this profile does not have, which could also be what
moves the manifest. The flags were never listed against the ones the registry turns on. See "Open question".

## Costs of the pin

- Aion stays on 2026.10.2.1 until someone moves it; it gets no fixes Edge ships in newer models.
- A new Aion profile probably cannot get a working model from Edge today (inferred, not measured): the updater
  would hand it the mismatched pair. Seed it with a matching pair instead ("No pin yet" in model-lifecycle.md).
- `model download` refuses on `edge-dev-aion` while the switch is on.

## When and how to move to a newer model

The signal is the manifest, not the model: wait until "Edge On-Device Model Manifest" names a newer
`edge_base_model`. A newer model alone is the broken case above.

1. Check on a throwaway copy of the profile, never the pinned one: copy `.browsers/edge-dev-aion` (survey for
   reparse points first), launch Edge Dev on the copy without `--disable-component-update`, and read
   `edge://components` once the updater settles. It downloads several GB.
2. If the manifest now names the newer model and the copy's doctor exits 0 with it, remove
   `--disable-component-update` from `edge-dev-aion` in `.claude/skills/control-ai-browsers/instances.json`.
3. `up edge-dev-aion`, let the updater bring in the matching set, then `doctor edge-dev-aion` (exit 0).
4. `model pin edge-dev-aion` to save the new pair, and decide whether to put the switch back.
5. Update this file, model-lifecycle.md (Gotchas and "No pin yet") and the version in AGENTS.md in the same commit.

If step 2 fails, keep the pin; the current setup is the known-good fallback.

## Open question: a missing flag

The registry turns on `msEdgeLLMOnDeviceModelPrerelease` and `msEdgeLLMOnDeviceModelMuffinToolUseWorkaround`
plus the Prompt API features (`instances.json`). Not yet checked: whether Edge Dev 157 has other model or
manifest flags (search `edge://flags` for "LLM", "on-device", "model") that are off here and that make the
updater fetch a manifest naming 2026.10.15.1. The test, on a throwaway copy without `--disable-component-update`:
list those flags and their state, turn on one candidate at a time, restart, and read `edge://components` and
Broker State. If one moves the manifest and the new pair serves, add it to the registry features and follow the
steps above instead of keeping the pin.

## Not measured

- Whether `edge-phi4mini` (Edge stable, Phi-4-mini) has the same model-ahead-of-manifest exposure.
