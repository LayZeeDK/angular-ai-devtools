---
name: verify-ai-browsers
description: Fixed proof checks for the built-in AI in control-ai-browsers' per-model browser instances (Chrome Beta with Gemini Nano or Gemma 4, Edge Dev with Aion-1.1-Instruct, Edge stable with Phi-4-mini) - each instance passes doctor (command line, model on disk and in Broker State, backend, availability(), contextWindow, structured-output, tool and WebMCP canaries) and flags and serves its registry model, and a model cycle (clear, download, initialise) brings an instance's own model back. Each check exits 0 pass, 1 claim failed, 2 could not run, for lars-verify to turn into a verdict. Use after a browser update, after changing an instance or its backend, or before reporting a built-in AI result as proven.
---

# verify-ai-browsers

Proves claims about the per-model browser instances; it never launches or stops anything itself.
`control-ai-browsers` launches, health-checks and drives the instances, and its `instances.json` is the registry
both skills read: read that skill for every command, flag and gotcha.

## Checks

| Check | Claim | Feature file and sub-feature in `control-ai-browsers/features/` | Needs running |
|---|---|---|---|
| `state` | Each named instance (all four when none is named): `doctor` exits 0, `flags` exits 0, `model info` finds the registry model's manifest on disk, and Broker State serves that model. | `health-check.md` `health-doctor`; `instances.md` `instances-features`; `model-lifecycle.md` `model-info` | every named instance |
| `model-init` | `model init` exits 0 with the registry `contextWindow`, and the instance then passes `state`. Run after a model cycle in the setup, it proves clearing, downloading and initialising the instance's own model end to end. | `model-lifecycle.md` `model-init`, after `model-clear` and `model-download` | the instance, its model downloaded |

Each check's header comment holds its claim, the feature it covers, its usage and the files it writes. `state` records each instance's
backend, requested backend and performance class in `state.json`; `model-init` records the init timings and
answer in `model-init.json`.

## Run

Through `lars-verify` (`~/.commandcode/skills/lars-verify/references/contract.md`), with
`C=.commandcode/skills/control-ai-browsers/scripts/control.mjs`:

- `state`: setup `["node", C, "up", "<instance>"]` per instance (exit 0 `alreadyRunning` when it runs as
  configured, the generated-skill contract's exception for standing instances; see control-ai-browsers Launch);
  condition `["node", ".commandcode/skills/verify-ai-browsers/checks/state.mjs", "--evidence", "{runDir}",
  "<instance>", ...]`; artifact `state.json`.
- `model-init` as the model cycle: setup `C up <instance> --backend=<b>`, `C down <instance>`,
  `C model clear <instance> --confirm=<registry model>`, `C up <instance> --backend=<b>`,
  `C model download <instance> --timeout-min=45`, each with `--evidence={runDir}`; condition
  `["node", ".commandcode/skills/verify-ai-browsers/checks/model-init.mjs", "--evidence", "{runDir}", "<instance>"]`;
  artifact `model-init.json`; `timeoutMs` above the download limit (3000000).
- teardown, per instance: `["node", C, "info", "<instance>", "--evidence={runDir}", "--json"]`, `C down <instance>`,
  then `check-teardown.mjs {runDir}/steps/teardown-<n>.out --artifact state.json` (or `model-init.json`), where
  `<n>` is that instance's `info` step.

Standalone, against instances started by hand:
`node .commandcode/skills/verify-ai-browsers/checks/state.mjs --evidence <dir> [<instance>...]` or
`node .commandcode/skills/verify-ai-browsers/checks/model-init.mjs --evidence <dir> <instance>`.

## Gotchas

- `state` takes about a minute per instance (doctor, flags, model info; doctor 10-60 s), longer while another
  session loads the machine; set `timeoutMs` for all four (900000 was enough on 2026-10-16).
- Cycle `chrome-beta-nano` or an Edge instance. Do not cycle `chrome-beta-gemma4` to clear Nano there: the cycle
  clears the instance's own model (Gemma 4), and the extra Nano folders in that profile come back by themselves
  (`control-ai-browsers/features/model-lifecycle.md`). Every run of the cycle downloads the model again (Nano:
  about 4 GB, 85-140 s by click).
- `edge-phi4mini` has failed `canary.structured` with `kErrorUnknown` in one doctor out of three (2026-10-12): that
  is the model, not the check; a `not verified` from it is reported as found.
- A cycle step that fails in the setup (`down`, `model clear`, `up`, `model download`) skips the condition, so
  lars-verify reports the run `inconclusive`; the check itself judges only `model init` and the state after it.
  Read the failing step's output in `{runDir}/steps/` before calling it a harness problem.
- Chrome may finish the download before `model download` starts (the profile has the use case Requested); the
  download step then reports `alreadyAvailable` and the cycle still counts.
