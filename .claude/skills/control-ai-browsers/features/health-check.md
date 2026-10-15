# Health check

A page in an instance can use its built-in AI: the instance runs as the registry says, its model is on disk and
`Ready` in Broker State on the requested backend, the Prompt API reports `available`, and the model answers under
a JSON Schema constraint, completes a tool round trip, and `document.modelContext` (WebMCP) exists.

## Sub-features

- `health-doctor` runs every check against one instance.
- `health-backend` compares the Broker State backend with the backend on the command line and reports the
  performance class.
- `health-availability` reads `availability()` for LanguageModel (plain and with tool use), Summarizer, Writer,
  Rewriter, Proofreader, LanguageDetector and Translator en->da.
- `health-structured` proves `responseConstraint` output parses.
- `health-tools` proves a tool call and its answer.
- `health-webmcp` proves `document.modelContext` is an object.

## How to get to it (user POV)

- A web page on an https origin calls the APIs; `about:blank` has none of them.
- `chrome://on-device-internals` / `edge://on-device-internals` > Broker State shows the model side.

## Driving it with control-ai-browsers

Preconditions: the README baseline.

- **Full doctor.** Run `C doctor chrome-beta-gemma4`. Exit 0 and fourteen check lines, each `[OK]`, `[WARN]` or
  `[SKIP]`. `backend` reads `requested gpu`, `GPU (fastest inference)`, row `gemma4_gpu_low_tier_model`.
- **Nano.** Run `C doctor chrome-beta-nano`. `canary.tools` is `[SKIP]`; `backend` row `nano_v3_gpu_low_tier_model`.
- **Edge.** Run `C doctor edge-dev-aion`. `backend` row `edge_base_model_gpu`, `GPU (highest quality)`.
- **Proof.** Keep the doctor JSON from the evidence directory; it holds every check's detail.

## Gotchas

- Measured canary times (2026-10-12, machine under another session's load): Aion structured 3.2 s, tool round
  trip 2.5 s; Gemma 4 (GPU) 6.0 s and 9.0 s; Nano (GPU) 2.0-28 s structured.
- Gemma 4 sends `callID: ""`; the canary passes it back unchanged and Chrome accepts it. Edge Dev 157.0.4329
  requires `callId` on `LanguageModelToolSuccess`; the canary sends `callID` and `callId`.
- Doctor skips the page canaries when the model is not `available`: `create()` would wait for, or start, a
  download.
- `navigator.modelContext` is `undefined`; WebMCP lives on `document.modelContext`.
- `Proofreader` is not defined in these builds, and Translator en->da is `downloadable`; doctor reports these
  without failing.
- Phi-4-mini answers the tool canary in prose (all six sessions on 2026-10-12), so `canary.tools` is reported
  only for it; its structured canary failed once with `kErrorUnknown`.
- Stored performance classes on the same GPU: Nano 2 (VeryLow), Gemma 4 3 (Low), Aion and Phi-4-mini 5 (High).
