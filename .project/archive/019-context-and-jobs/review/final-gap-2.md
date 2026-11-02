# Gap Review — 2: Wave 1's CHUNK_TOKEN_CAP and chunkFacts are consumed by wave 2's chunked fact list job: the chunk count the panel receives equals the number of chunks the job emitted.

<!-- Written by one final gap reviewer. This file covers exactly one
     cross-wave integration risk named in the review brief. Repeat FINAL.md's
     `Member reviewed HEAD: <member> <full SHA>` lines after Reviewed HEAD. -->

Reviewed HEAD: 5982ad03a4959feaca5fa1bc12d03c88782ecb46
Gap verdict: pass
Risk: Wave 1's CHUNK_TOKEN_CAP and chunkFacts are consumed by wave 2's chunked fact list job: the chunk count the panel receives equals the number of chunks the job emitted.
Waves checked: 1, 2

## Checked evidence

- **Check**: `git rev-parse HEAD` (run in the sidecar; brief's quoted SHA `...fa3bc...` is invalid — the measured SHA above is recorded instead). Also attempted `npx nx run angular-ai-devtools:test --include="**/context-budget.spec.ts,**/chunked-fact-list-job.spec.ts"` from the sidecar realpath; it exited 1 with "Could not find Nx modules" because the sidecar worktree has no `node_modules`. The static reading settled every check, so no dependency install was performed and the test run is recorded as attempted-not-run, not as passing evidence.
- **Observed**: (1) The job imports the cap and the chunker rather than redefining them — `chunked-fact-list-job.ts:32` reads `import { CHUNK_TOKEN_CAP, chunkFacts, type ChunkedFacts } from '../context-budget';`, and a search of `src/app/jobs/` for `const CHUNK_TOKEN_CAP` finds no redefinition. (2) The count the panel receives equals the chunks the job emitted: `execute` seeds `chunksTotal` from `plan.chunkCount` (line 158), pushes each emitted chunk into `emitted` (line 173), and the complete payload returns `chunkCount: emitted.length` alongside that same `emitted` array (lines 184–188), so the count and the chunk list are the same measurement, not a restatement; on the cancelled path no `chunks` field is emitted at all (line 181), so no count can be read against a list the job did not finish. (3) An over-cap list is chunked, never truncated: `chunkFacts` packs greedily and order-preservingly with no drop or shorten path (context-budget.ts:110–146), a single fact over the cap is refused by name with a `RangeError` naming the index and estimate (lines 130–135) which the job surfaces as an `invalid-input` outcome rather than an empty result (job lines 149–155), and `context-budget.ts:130` caps against the imported constant without moving it. Both specs corroborate: `context-budget.spec.ts:141-149` proves an oversized list comes back whole and in order, `:151-157` proves the cap stays 2000 under an oversized fact, and `chunked-fact-list-job.spec.ts:262-296` (E6) proves at two list sizes that `payload.chunkCount === payload.chunks.length === plan.chunkCount` with every chunk arriving whole.
- **Reference**: apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.ts:32,149-155,157-158,173,181,184-191; apps/angular-ai-devtools/src/app/context-budget.ts:30,110-153; apps/angular-ai-devtools/src/app/context-budget.spec.ts:141-157; apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts:102-125,262-296

## Finding

- **Found**: The wave-1 module is the sole definer of `CHUNK_TOKEN_CAP` and `chunkFacts`; the wave-2 job consumes both by import with no local redefinition, derives `chunksTotal` and the payload's `chunkCount` from the same `emitted` array it returns, and hands over-cap lists to the chunker — which splits them whole and in order, refusing an oversized single fact by name instead of truncating or moving the cap. All three sub-checks of the risk hold at the reviewed HEAD.
- **Fix direction**: none
