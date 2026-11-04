# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 2
Reviewed HEAD: d6d313da51108680b111c877bc3189fa629e32c8

## T001 — The digest carries thirteen measured image codes: pass

- ✅ scripts/image-digest.mjs exports 18 MEASURED_CODES; countTokens = ceil(len/3); trimToTokens caps 450 chars; stripLicense runs in buildEntry; lookup returns 'unknown' for unmeasured codes; 11 tests pass.

## T002 — No licence text reaches a prompt: pass

- ✅ stripLicense applied to meaning and fix in buildEntry before counting; assertNoLicense/guardNoLicense throw on surviving licence text; licence mutants redden the suite.

## Intent coverage

### SC1 — The offline digest carries exactly one entry for each of the eighteen image codes the installed Angular declares — the seventeen in `RuntimeErrorCode`'s image block (`NG2950`–`NG2967`, with no `NG2957`) plus `NG0913` from core — and no entry for a code outside that set.: pass

- ✅ 18 entries equal the measured set (NG0913 + NG2950–NG2967 minus NG2957); lookup('NG9999') returns 'unknown'; NG7777 refused.

### SC2 — Every digest entry is at most 150 tokens, and the digest is generated at extension build time rather than hand-written at runtime.: pass

- ✅ countTokens upper bound ceil(len/3); trimToTokens <= 450 chars ending with marker; build-image-digest.mjs writes extension/image-digest.json byte-identically; deleting the builder fails.

### SC4 — The licence and copyright notice is stripped from every entry before any digest text reaches a prompt.: pass

- ✅ stripLicense applied to meaning and fix in buildEntry before counting; assertNoLicense/guardNoLicense throw on surviving licence text; licence mutants redden the suite.
