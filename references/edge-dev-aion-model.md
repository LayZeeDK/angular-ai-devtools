# Edge Dev Aion: why the model is pinned

How to use the pin (`model pin`, the restore on `up`, doctor's `model.pin` row) is in
`.commandcode/skills/control-ai-browsers/features/model-lifecycle.md` (Command Code's copy, which Command Code and
its GSD Path skills drive; `.claude/skills/` holds Claude Code's older copy). This file records why the pin exists, what was
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
- The `state` verdict over the four instances of the time, on that setup: verified, 2/2 runs
  (`tmp/control-ai-browsers/verify/health-check/20261017T1430Z-state-rerun2`).

Measured: `down` and the skill do not cause the break. The command line and features were the same in the broken
and the working state (doctor's `flags` row passed in both); only the model folders differed. A broken download
leaves the same wrong folders, and the restore on `up` covers both.

Why the new model cannot run in Edge 157: see "Can the newest model run? (2026-10-17)" below. In short, it needs
Edge 158 code, and no channel is served a manifest that names it yet.

## Costs of the pin

- Aion stays on 2026.10.2.1 until someone moves it; it gets no fixes Edge ships in newer models.
- A new Aion profile cannot get a working model from Edge, because the updater would hand it the mismatched pair
  (inferred). The pin seeds it instead, and since 2026-10-19 the pin also holds the manifest component
  (`EdgeOptimizationGuideModelsManifest`). A profile that starts under `--disable-component-update` never receives
  one. Measured 2026-10-19: `up` on a new profile restored all three folders, one `model init` requested the asset
  from disk (first create 3.3 s), and doctor exited 0 after a second `model pin`. See "Pin into a new profile" and
  "No pin yet" in model-lifecycle.md.
- `model download` refuses on `edge-dev-aion` while the switch is on.

## When and how to move to a newer model

The signal is the manifest, not the model: wait until "Edge On-Device Model Manifest" names a newer
`edge_base_model`. A newer model alone is the broken case above.

1. Check on a throwaway copy of the profile, never the pinned one: copy `.commandcode/worktrees/.browsers/edge-dev-aion` of the primary checkout (survey for
   reparse points first), launch Edge Dev on the copy without `--disable-component-update`, and read
   `edge://components` once the updater settles. It downloads several GB.
2. If the manifest now names the newer model and the copy's doctor exits 0 with it, remove
   `--disable-component-update` from `edge-dev-aion` in `.commandcode/skills/control-ai-browsers/instances.json`.
3. `up edge-dev-aion`, let the updater bring in the matching set, then `doctor edge-dev-aion` (exit 0).
4. `model pin edge-dev-aion` to save the new pair, and decide whether to put the switch back.
5. Update this file, model-lifecycle.md (Gotchas and "No pin yet") and the version in AGENTS.md in the same commit.

If step 2 fails, keep the pin; the current setup is the known-good fallback.

## Can the newest model run? (2026-10-17)

Measured in a spike worktree on throwaway profile copies, one browser at a time.

What 2026.10.15.1 is. Still `Aion-1.1-Instruct` (its `manifest.json`), rebuilt: a new `model.onnx` whose graph has
842 inputs instead of 58, 784 of them LoRA tensors (`lora_A` / `lora_B` per projection, also stored as
initializers), plus two new adapters, `rewrite_general.onnx_adapter` and `summarize_webpage.onnx_adapter`
(47.6 MB each). `genai_config.json`, the tokenizer and the execution config are byte-identical to 2026.10.2.1.

What Microsoft's update server offers. The real requests were captured from a NetLog (update protocol 4.0, to
`edge.microsoft.com/componentupdater/api/v1/update`) and replayed per channel as a fresh install:

| Edge (arm64) | Manifest | Model | Runtime |
| --- | --- | --- | --- |
| Stable 155.0.4283.62 | 2026.9.18.5 | none | 2026.10.2.1 |
| Beta 156.0.4314.30 | 2026.10.2.1 | none | 2026.10.12.1 |
| Dev 157.0.4329.0 | 2026.10.2.1 | 2026.10.15.1 | 2026.10.12.1 |
| Canary 158.0.4344.0 | 2026.10.2.1 | 2026.10.15.1 | 2026.10.12.1 |

The rollout bucket (`AppRollout` 0 to 0.99) changes nothing. So no channel is served a manifest naming
2026.10.15.1; a Canary or Beta install gets the same mismatch or no new model at all.

Flags and experiments. Edge's experiment config (`config.edge.skype.com`) carries no on-device model or Aion
entry for this client, and Dev 157, Canary 158 and stable 155 ship the same model flags. No flag or experiment
was found that moves the manifest.

Running it anyway. The manifest's variant files (`variants/*/manifest.binarypb`) name the model version as a
protobuf string. Rewriting `2026.10.2.1` to `2026.10.15.1` in both variants makes Edge load the new model:

| Browser | Model | Runtime | Result |
| --- | --- | --- | --- |
| Edge Dev 157 | 2026.10.15.1 | 2026.10.12.1 or 2026.10.2.1 | Ready and `available`, but every prompt returns 32 x U+0018 in under half a second; canaries fail |
| Edge stable 155 | 2026.10.15.1 | 2026.10.12.1 | same garbage |
| Edge Canary 158 | 2026.10.15.1 | 2026.10.12.1 | doctor exit 0 on three launches: structured and tool canaries pass, "Hello!" and "5" answered correctly |
| Edge Canary 158, original manifest | 2026.10.15.1 | 2026.10.12.1 | the usual mismatch: wants 2026.10.2.1, `downloading` |

The patched manifest survived 3.5 minutes without `--disable-component-update` (the updater sees the same
manifest version and leaves it); a real newer manifest from Microsoft would replace it. Edge deletes model and
runtime folders the manifest does not name at startup. Beta 156 was not installed: it sits between two builds that
fail, so it would fail too (inferred).

So the newest Aion runs today only on Edge Canary 158 with a hand-patched manifest, which is unsupported. The
supported path is to wait until Microsoft publishes a manifest naming 2026.10.15.1 (expected once Edge 158 code
reaches Dev; inferred) and then follow "When and how to move to a newer model". Throwaway copies only: the
patch has no place in `edge-dev-aion`, which Edge 157 cannot run it on.

## Not measured

- Whether the patched Canary setup still works after Canary's next daily update.
- Whether Canary 158 also runs 2026.10.15.1 with the older 2026.10.2.1 runtime.
