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
  `Ready`, `serving v3Nano; backend GPU (fastest inference) (requested gpu); performance class 2`.
- **Clear.** Run `C stop chrome-beta-nano`, then `C model clear chrome-beta-nano --confirm=v3Nano`. Every folder
  whose manifest names `v3Nano` is deleted; the JSON holds `bytesRemoved` (4,269,934,855 for the GPU variant) and
  `diskAfter`.
- **Download.** Run `C launch chrome-beta-nano`, then `C model download chrome-beta-nano`. It logs the gesture
  (`click` or `Enter`), samples progress every 5 s, and ends with the duration and the folder added. Measured:
  click, 180 s, 4,072 MiB (2026-10-12, D:). On Edge it first presses "Check for update" on the two model
  components.
- **Initialise.** Run `C model init chrome-beta-nano`. First and second create, `contextWindow` 9,216, the answer
  to `Say hi in three words.`
- **Check.** Run `C doctor chrome-beta-nano`; exit 0.
- **Proof.** One evidence directory with `model info` before, `clear`, `download`, `init`, `model info` after.

## Gotchas

- `model clear` refuses a running instance: deleting files under a running browser is unsafe, and a running
  profile with the use case Requested downloads the model again by itself.
- Chrome starts downloading a Requested model at launch without any page call. After `stop`, `clear`, `launch`,
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
  components; `model download` does that.
- Forcing CPU on Edge uninstalls the model; `launch --backend=cpu` is refused on Edge instances.
- `availability()` can say `available` while `create()` refuses tool types; trust the tool canary instead.
