# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: dd8fff6afd75add0c2382b6e5fbba3afe8382ce8

## T001 — Measure what the WebMCP API exposes to a page: pass

- ✅ T001/AC1 — the recording states the exposure with `path:line` citations carrying each cited line's own trimmed text: `research/raw/m052-webmcp-api.json` answers presence from the shipped canary (`research/raw/m052-webmcp-api.json:118-120` cites `.commandcode/skills/control-ai-browsers/scripts/control.mjs:1953`), records that no `getTools`, `registerTool`, `executeTool` or `ontoolchange` call site exists in any code file (`research/raw/m052-webmcp-api.json:58-72`), and spells the tool-list field question in `exposure` (`research/raw/m052-webmcp-api.json:111` onward); `scripts/webmcp-api.test.mjs:109-112` re-reads every cited line from the working tree and requires trimmed equality, so a citation that slid onto a neighbouring line reddens rather than passing review.
- ✅ T001/AC2 — the recording states what it does not claim: the getter's return shape is documented but never observed, so `exposure.present` carries `observedHere: false` (`research/raw/m052-webmcp-api.json:116`) and the `measuredAt` field states plainly that no browser was started and this is a reading of what the tree records, not a measurement of a running one (`research/raw/m052-webmcp-api.json:13`); the pin parses the schema, task and head and re-checks the citations against the tree (`scripts/webmcp-api.test.mjs:184-186`), so drift reddens.
- ✅ T001/AC3 — the diff touches only the recording, the pin and the task contract (`git show 144e82ca --stat`: `research/raw/m052-webmcp-api.json`, `scripts/webmcp-api.test.mjs`, `.project/tasks/T001-…md`); nothing renders, no reading function exists, and no request-time read is written here — the reading is T002's.
- ✅ Observed at the reviewed head: `node --test scripts/webmcp-api.test.mjs && npx prettier --check scripts/webmcp-api.test.mjs` passed (verify ledger, commit `dd8fff6afd75add0c2382b6e5fbba3afe8382ce8`), and the landing commit `144e82ca` carries the same two files the task's `files:` list declares.

## Intent coverage

### SC2 — A tool whose shape cannot be read is reported as cannot-tell, naming the absence. When the API exposes a registration surface but no readable tool list, the surface states that the list is absent rather than rendering an empty list, an inferred signature, or the word "none". A mutant that renders an empty list as "no tools declared" reddens.: pass

- ✅ Covered by T001: the measurement is what makes the distinction decidable rather than assumed — it establishes that the tree's only executable knowledge of the surface is the `typeof` canary (`research/raw/m052-webmcp-api.json:36-41`), that no member has ever been called (`research/raw/m052-webmcp-api.json:58-72`), and that the getter's return shape is documented-not-observed (`research/raw/m052-webmcp-api.json:116`), which is exactly the state of ignorance T002's `cannot-tell` names and the reason `empty` may not be answered without an array the getter actually returned. Evidence recorded above and in the verify ledger.
