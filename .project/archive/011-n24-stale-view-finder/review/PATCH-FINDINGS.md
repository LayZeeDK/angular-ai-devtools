# Patch Findings

<!-- Written by final review when it blocks and consumed by patch planning. -->

Reviewed HEAD: 683c3af77482c34ec387a62b3b6b431d286b1aa8
State: ship/blocked

## Findings

### P001 — The two stale-view check modules fail the repository type check

- **Source**: `.project/review/final-gap-1.md`
- **Locator**: Risk: project Verify
- **Evidence**: Project Verify failed at the reviewed commit.
- **Fix direction**: Resolve the recorded command failure before shipping.
