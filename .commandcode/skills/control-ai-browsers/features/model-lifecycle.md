# Model lifecycle

Which on-device model an instance serves, how big it is, where it lives and on which backend; how to download it
with a user gesture, initialise it, and clear it to free space. Switching models means choosing another instance.

## Sub-features

- `model-info` reports every model manifest in the profile (name, versions, performance hints, size, folder), the
  Broker State, the serving model, its backend and the performance class.
- `model-download` starts a download from a trusted gesture, reports progress, size and duration, and waits for
  `available`.
- `model-init` times the cold and warm `create()` and reads `contextWindow`.
- `model-clear` deletes a named model's folders in a stopped instance's profile and reports the bytes removed.
- `model-pin` copies a healthy instance's model components (registry `pin` roots) to its pin folder; `up` restores
  them when the disk differs, and `down` warns when it closes an instance in the middle of a model update.

## How to get to it (user POV)

- `chrome://on-device-internals` / `edge://on-device-internals` > Broker State: assets, use cases with their
  Requested checkboxes, models with weights path and backend, the free-space criteria.
- `edge://components`: "Edge LLM On Device Model" and "Edge LLM Runtime" with "Check for update".
- A page calls `LanguageModel.create({ monitor })` from a click; the browser downloads the model.
- The model folders in the profile: `OptGuideOnDeviceModel\<version>` (Nano), `OptGuideManifestModel\<hash>\
<version>` (Gemma 4), `EdgeLLMOnDeviceModel\<version>` (Aion, Phi-4-mini), each with a `manifest.json`.

## Driving it with control-ai-browsers

Preconditions: the README baseline; Broker State "Enough disk space to install" is `true` (20,480 MiB free on D:).

- **Report.** Run `C model info chrome-beta-nano`. One `v3Nano` line per variant on disk (2025.8.8.1141 hints
  `[2,1]` is the GPU variant, 2025.8.21.1028 hints `[3]` the CPU variant), the asset `nano_v3_gpu_component`
  `Ready`, `serving v3Nano; backend GPU (fastest inference) (requested gpu); performance class 3 (Broker State Low)` on
  Chrome Beta 157 (it read class 2 on 156).
- **Clear.** Run `C down chrome-beta-nano`, then `C model clear chrome-beta-nano --confirm=v3Nano`. Every folder
  whose manifest names `v3Nano` is deleted; the JSON holds `bytesRemoved` (4,269,934,855 for the GPU variant) and
  `diskAfter`.
- **Download.** Run `C up chrome-beta-nano`, then `C model download chrome-beta-nano`. It logs the gesture
  (`click` or `Enter`), samples progress every 5 s, and ends with the duration and the folder added. Measured:
  click, 180 s, 4,072 MiB (2026-10-12, D:); click, 455 s, 4,072 MiB (2026-10-16). On Edge it first presses "Check for update" on the two model
  components.
- **Initialise.** Run `C model init chrome-beta-nano`. First and second create, `contextWindow` 9,216, the answer
  to `Say hi in three words.`
- **Check.** Run `C doctor chrome-beta-nano`; exit 0.
- **Proof.** One evidence directory with `model info` before, `clear`, `download`, `init`, `model info` after.
- **Pin (Aion).** With `edge-dev-aion` running and doctor at exit 0, run `C model pin edge-dev-aion`. It logs
  `pinned EdgeLLMOnDeviceModel 2026.10.2.1, EdgeLLMRuntime 2026.10.2.1, EdgeOptimizationGuideModelsManifest 2026.10.2.1`
  and the folder `.commandcode/worktrees/tmp/control-ai-browsers/pins/edge-dev-aion` of the primary checkout (1.3 GB,
  git-ignored). From then on, an `up` of the stopped instance
  whose disk holds other versions, or the pinned version with other files or sizes, logs
  `[WARN] ... restored it (EdgeLLMRuntime -2026.10.12.1)` (`~<version>` for a replaced folder) and doctor's
  `model.pin` reads `matches the pin`. Measured 2026-10-17 in a worktree copy: twice, an update was let run without
  `--disable-component-update` and interrupted by `down` (once after the runtime landed, once while the model
  component read "Downloading"); each time `up` restored the pin and doctor exited 0.
- **Pin into a new profile.** The pin holds the manifest component too, because a profile that starts under
  `--disable-component-update` never receives one. `up` on a new profile restores all three folders. Broker State
  then reads `edge_base_model` `Not Installed`, `prompt_api` `Pending Usage` and `availability()` `downloadable`
  until one `create()` requests the asset. Run `C model init edge-dev-aion` once. It installs the pinned files from
  disk with no download (measured 2026-10-19: first create 3.3 s, `contextWindow` 7,168). Edge then rewrites the
  cache files in the model folder, so run `C model pin edge-dev-aion` again once doctor's only failure is
  `model.pin`.
- **No pin yet.** Put a matching `EdgeLLMOnDeviceModel\<v>`, `EdgeLLMRuntime\<v>` and
  `EdgeOptimizationGuideModelsManifest\<v>` set (2026.10.2.1) in the pin folder, with a `pin.json` listing each file
  and size in the shape `model pin` writes. Then run `up`, `model init`, `doctor` and `model pin`. On 2026-10-19 the
  set was copied read-only from Lars's stopped Edge Dev profile, which held the same 2026.10.2.1 set. Letting Edge
  fetch it by removing `--disable-component-update` does not work: the updater installs a model past the manifest
  (Gotchas).

## Gotchas

- `model clear` refuses a running instance: deleting files under a running browser is unsafe, and a running
  profile with the use case Requested downloads the model again by itself.
- A new Chrome Beta profile offers no model at all: Broker State's Manifest Criteria read "Enabled by user setting:
  false", every use case reads `Not Supported`, the manifest lists no assets, and `model download` refuses because
  `availability()` is `unavailable`. Pre-stable channels turn the On-Device AI setting (`chrome://settings/ai`, Local
  State `optimization_guide.on_device_foundational_model_user_settings`) off by default unless a model was
  installed before or the `OnDeviceAiDefaultEnabled` feature is on
  (`chrome/browser/optimization_guide/model_execution/optimization_guide_global_state.cc`,
  `ShouldEnableOnDeviceAiByDefault`). Both Chrome instances list that feature. With it, a new profile offered
  `nano_v3_gpu_component` and `gemma4_component` at once, and `model download` took 260 s (Nano, 4,072 MiB) and
  196 s (Gemma 4, 2,374 MiB) on 2026-10-19. The performance class (2 to 4) and the VRAM reading ("16162 MiB actual")
  were never the blocker.
- Chrome starts downloading a Requested model at launch without any page call. After `down`, `clear`, `up`,
  availability read `downloading` straight away, and the first create() finished the 4 GB download.
- The Gemma 4 instance holds Nano that the Prompt API there never uses: both variants (GPU 2025.8.8.1141,
  4,072 MiB; CPU 2025.8.21.1028, 2,730 MiB) while it ran with `--backend=cpu`; after a relaunch on GPU, Chrome
  removed the CPU variant by itself and 4,072 MiB remain. Broker State there has `summarizer_api` and `writing_assistance_api`
  Requested next to the `_gemma4` use cases, and serves the base use cases with Nano. Tried on two copies of the
  profile without the Nano folders (2026-10-12): with `AISummarizationAPI`, `AIWriterAPI` and `AIRewriterAPI`
  removed, Nano came back within 6.5 minutes; with the full feature set it did not come back in 20 minutes, also
  not after a page called `availability()` on all four APIs. So removing those features does not stop it, and the
  trigger is not known (inferred candidates: the persisted Requested use cases, `scam_detection`, or timing of the
  component updater). Unchecking the Requested boxes was not retried on these copies; on Lars's own profile
  (2026-10-11) it did not stop the download. Leave the Nano folders in that profile; clearing them frees space only until Chrome fetches
  Nano again.
- Downloads need 20,480 MiB free on D: (Broker State); below it `availability()` still says `downloadable` or
  `downloading` while nothing downloads. `model download` refuses earlier: free space minus the model's
  `downloadMib` must stay above the browser minimum in `instances.json` (Chrome 22,528 MiB, Edge 20,480 MiB).
- A fresh Edge profile waits at "Foreground Installing 0%" until "Check for update" is pressed for both model
  components; `model download` does that, except on an instance launched with `--disable-component-update`
  (`edge-dev-aion`), where the button starts nothing (measured) and `model download` refuses (exit 2).
- Edge updates its model past its manifest (measured 2026-10-17, Edge Dev 157.0.4329): the component updater
  installs "Edge LLM Runtime" 2026.10.12.1 and "Edge LLM On Device Model" 2026.10.15.1 about a minute after launch,
  with no page call, while "Edge On-Device Model Manifest" stays 2026.10.2.1 (its "Check for update" finds nothing
  newer) and names `edge_base_model` 2026.10.2.1. Broker State then reads that asset `Not Installed`, `prompt_api`
  `Not Supported` and `availability()` `unavailable`; at the next start Edge deletes the old folders and it reads
  `Pending Assets` and `downloading` for good, and `model download` cannot fix it. While the update runs, Broker
  State has no `edge_base_model` row at all and `availability()` still says `available`; the fetch took about 40 s.
  `edge-dev-aion` therefore launches with `--disable-component-update` (watched for 4.5 minutes and two restarts:
  the 2026.10.2.1 pair stayed and stayed `Ready`; the manifest, runtime and model components still load) and keeps
  a pin. Without the switch a restored pair broke again 1.5 minutes after launch.
- Forcing CPU on Edge uninstalls the model; `up --backend=cpu` is refused on Edge instances.
- `availability()` can say `available` while `create()` refuses tool types; trust the tool canary instead.
