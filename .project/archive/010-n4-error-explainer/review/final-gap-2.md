# Gap Review — 2: The captured error crosses four boundaries — the page agent's console hook, the isolated-world relay, the service worker's re-broadcast, and the panel's message service — and the driver re-injects until the panel shows the row, so a break at any boundary still lets the panel look correct.

Reviewed HEAD: b0a40e7eeb2d0007684e2a83b28dac6e05b0cb3b
Gap verdict: pass
Risk: The captured error crosses four boundaries — the page agent's console hook, the isolated-world relay, the service worker's re-broadcast, and the panel's message service — and the driver re-injects until the panel shows the row, so a break at any boundary still lets the panel look correct.
Waves checked: 1, 2

## Checked evidence

- **Check**: read the four boundary sources in this sidecar and the driver, then read the five recorded verdict files without re-running them
- **Observed**: `captureErrorPayload` in `extension/agent-main.js` extracts `NG0\d{3,}` into `code`, carries `message`, resolves `component` via `ng.getOwningComponent`, stamps `timestamp`, and dispatches `angular-ai:error-capture` from `console.error`, `window` `error` and `unhandledrejection`; `extension/relay.js` forwards the event with its full detail through `chrome.runtime.sendMessage`; `extension/background.js` re-broadcasts it with `tabId: sender.tab?.id`; `extension-message.service.ts` appends a `CapturedError` to the bounded `capturedErrors` signal, trimming to `CAPACITY`; `.commandcode/skills/control-ai-browsers/scripts/panel.mjs` selects the captured row whose `error-code` matches `/NG0\d+/`, re-injects `NG0100` up to 8 times until the row appears, then reads `error-code`, `owning-component` and `digest-entry`. The five recorded runs `chrome-stable-nano`, `chrome-beta-gemma4`, `edge-phi4mini`, `edge-dev-aion` and `insurance-portal-2` each report `verdict: "verified"` over two runs whose condition steps exited 0 with `outcome: "pass"`.
- **Reference**: `extension/agent-main.js:519-566`; `extension/relay.js:15-18`; `extension/background.js:8-14`; `apps/angular-ai-devtools/src/app/extension-message.service.ts:65-76`; `src/main-world/error-capture.ts:16`; `.commandcode/skills/control-ai-browsers/scripts/panel.mjs:252-281`; `D:\projects\sandbox\angular-ai-devtools\.commandcode\worktrees\tmp\control-ai-browsers\verify\error-explainer\{chrome-stable-nano,chrome-beta-gemma4,edge-phi4mini,edge-dev-aion,insurance-portal-2}\verdict.json`

## Finding

- **Found**: all four boundaries forward `angular-ai:error-capture` with code, message, component and timestamp; the panel service appends to bounded state; the driver re-injects and reads the NG0-matching row; and all five recorded verdicts passed both runs.
- **Fix direction**: none
