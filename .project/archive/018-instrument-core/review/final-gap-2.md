# Gap Review — 2: The envelope pin is a content hash

Reviewed HEAD: 9d202988379b9aab10e30dd164ab661702736c1e
Gap verdict: pass
Risk: The envelope pin is a content hash
Waves checked: 1, 2, 3, 4

## Checked evidence

- **Check**: `set "NODE_ENV=development" && node --test scripts/registry-envelope-pin.test.mjs`; pin value and tool-registry.ts diff across the two tool commits (git show 5044c2b; git show 4076ec6); repository guard against re-pinning (grep PINNED_ENVELOPE_SHA256)
- **Observed**: Exit 0; 1 test passed; pinned sha256 20859b889b727679929e7c927cf2abeb3c4920cea190d31a69bb08bac080407e equals actual sha256; one-byte mutation assertion failed the pin as expected. Commits 5044c2b and 4076ec6 leave PINNED_ENVELOPE_SHA256 unchanged at 20859b889b727679929e7c927cf2abeb3c4920cea190d31a69bb08bac080407e and touch no bytes of tool-registry.ts. Only scripts/registry-envelope-pin.test.mjs references PINNED_ENVELOPE_SHA256; no CI rule or test prevents a future commit from updating the constant.
- **Reference**: scripts/registry-envelope-pin.test.mjs:55-56, 107-178; git show 5044c2b; git show 4076ec6; grep PINNED_ENVELOPE_SHA256

## Finding

- **Found**: The pin catches accidental edits to the registry core but is a self-asserted constant with no mechanical guard against re-pinning, so it guarantees process discipline rather than tamper-proofing.
- **Fix direction**: none
