# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 44896c3b0e49a7deba417f4b0ccde677419ed932

## T005 — The ship verify runs in a fresh sidecar: pass

- ✅ `npm ci --include=dev; node --test scripts/retired-suites.test.mjs` — reviewer re-ran the contract Verify: npm ci added 994 packages, `node --test scripts/retired-suites.test.mjs` passed 4/4 at 44896c3b (reviewer re-run; task Log records contract Verify exit 0 and `npm run check` exit 0)

## Intent coverage

### SC4 — The ten suites that read `.project/review/rounds/` or `.project/review/specs/` are either deleted with their claim recorded, or re-homed so their claim is asserted from data the suite carries.: pass

- ✅ PLAN.md line 5 now reads `Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npm run check && npm test`` with the why-comment outside the backticks — the exact `Project verify: ` + backticked-command shape `check_handoffs.py` `_line_value` parses (`^Project verify:\s*(.+)$`, comment split on `<!--`, backticks stripped), so a fresh sidecar provisions the fixture install before `npm test`
- ✅ `scripts/retired-suites.test.mjs:91-93` adds `['.project', 'review']` to `NAMING_ALLOWED` as a two-segment prefix with the reason in source beside the others: a review artifact quotes what it reviewed and the ship flow moves it into the archive — every entry in the list carries a stated reason, none annotated loosely
- ✅ The exemption is bounded, proven by planting `scripts/zz-planted-retired-naming-probe.txt` containing `e10-spec-present` (outside every exempt prefix): the walk reddened with exactly `scripts/zz-planted-retired-naming-probe.txt: e10-spec-present` in `no file outside the record names a retired suite` (reviewer re-run, exit 1); after removal the suite returned 4 tests, 4 pass, 0 fail and the tree was restored byte-for-byte (`git status` clean except the pre-existing review stub)
- ✅ Held-out E5 still holds: the first two tests refuse a record missing a row or a claim, subject, reason and successor, and passed unchanged at 44896c3b
