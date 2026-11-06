# Gap Review — 1: project Verify

Reviewed HEAD: c996fd4f6d6666562dcd27141f335f85cfb941a9
Gap verdict: pass
Risk: project Verify
Waves checked: 1, 2, 3

## Checked evidence

- **Check**: `npm run check`, `node node_modules/nx/dist/bin/nx.js test angular-ai-devtools --skip-nx-cache`, `node --experimental-strip-types --test "scripts/lint-core.test.mjs" "scripts/panel-lint.test.mjs" "scripts/lint-observability.test.mjs"`
- **Observed**: `npm run check` exited 0 (format:check passed); nx test exited 0 with 30 test files and 333 tests passed; node test suite exited 0 with 52 tests passed (0 failed).
- **Reference**: `.project/build/verify-ledger.jsonl` (row at commit c996fd4f6d6666562dcd27141f335f85cfb941a9); `scripts/lint-core.test.mjs`, `scripts/panel-lint.test.mjs`, `scripts/lint-observability.test.mjs`

## Finding

- **Found**: The three targeted checks reproduce green at the frozen head with counts matching the wave reviews (333 nx tests; 52 node tests = 22 + 17 + 13); the ledger also records a passing full verify command at this head, but that full command was not rerun here.
- **Fixed**: none
- **Fix direction**: none

## Notes

- Ledger row at head c996fd4f6d6666562dcd27141f335f85cfb941a9: command `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm run check && npm test`, exit_code 0; no duration field was recorded.
- The wave reviews (wave-1/2/3.cycle1.md) quote Reviewed HEAD abfbcded8ad5d31ba151c7e5c464397470a44e3c, an earlier commit than the frozen head, though their quoted counts reproduce here.
- `npm run check` includes `format:check` and it passed ("All matched files use Prettier code style!").
- The combined node run reports only an aggregate 52/52; per-file counts (22/17/13) are taken from the wave reviews, not separately printed by this run.