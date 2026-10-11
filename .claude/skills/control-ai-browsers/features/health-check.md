# Health check

A page in Chrome Beta or Edge Dev can use the built-in AI: the Prompt API reports `available`, the model answers
under a JSON Schema constraint, completes a tool round trip, and `document.modelContext` (WebMCP) exists.

## Sub-features

- `health-doctor` runs every check against the home or a named profile.
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

- **Full doctor.** Run `C doctor --browser=chrome-beta`. Exit 0 and twelve check lines, each `[OK]` or
  `[SKIP]`.
- **Doctor against another profile.** After a switch, run `C doctor --browser=chrome-beta --expect=nano`. The
  flag and model checks compare with that profile; `canary.tools` is skipped.
- **Canaries only.** Run `C canary --browser=msedge-dev`. JSON with `structured.pass`, `tools.pass` (calls,
  answer, ms, `contextUsage`) and `webmcp.pass`.
- **Proof.** Keep the doctor JSON from the evidence directory; it holds every check's detail.

## Gotchas

- Measured canary times: Edge Dev (Aion) structured 1.8 s, tool round trip 1.9 s; Chrome Beta (Gemma 4)
  structured 6.3 s, tool round trip 9.6 s.
- Gemma 4 sends `callID: ""`; the canary passes it back unchanged and Chrome accepts it.
- A tool with `properties: {}` makes every Gemma 4 tool prompt fail with `UnknownError`; the canary tool has a
  required `scope` parameter for that reason.
- `navigator.modelContext` is `undefined` in both browsers; WebMCP lives on `document.modelContext`.
- `Proofreader` is not defined in either browser, and Translator en->da is `downloadable`; doctor reports these
  without failing.
