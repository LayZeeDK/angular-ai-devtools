# Review — wave 4, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 78b08caadc46ee1c5026244bd6d6ba98def91495

## T006 — Record the bundle shape, not hashes that move with the output path: pass

- ✅ Both suites green at the head: `node --test scripts/ng-context-dev-build.test.mjs scripts/facade-dev-build.test.mjs` → tests 18, suites 0, pass 18, fail 0, cancelled 0, skipped 0, todo 0. The development recording (`research/raw/m022-ng-context.json`) and the facade recording (`research/raw/companion-dev-build.json`) now carry the bundle shape — `entry`, `lazyChunkCount`, `chunkPattern` — plus a `sample` marked "sample is an observation, not an assertion." instead of pinning literal lazy-chunk names such as `chunk-4GZTSCME.js`. The stability test (`two builds at the same output path must emit identical bundle name lists`) passes for both suites.
- ✅ No assertion compares `sample`: `ng-context-dev-build.test.mjs` asserts `recorded.entry` equals the actual entry, `actualLazyChunks.length === recorded.lazyChunkCount`, and each lazy chunk `assert.match(name, chunkPattern)`; `facade-dev-build.test.mjs` asserts the same shape against `recording.build`. `sample` is read only as an observation and never compared.
- ✅ Cross-path check: with the output path changed to `tmp/...-alt` (constants `OUTPUT_DIRECTORIES`/`OUTPUT_PATHS` in the ng-context suite and `OUTPUT_DIR` in the facade suite, plus matching `outputPath`/`directory` in both recordings), both suites still pass — ng-context: tests 10, pass 10, fail 0; facade: tests 8, pass 8, fail 0. The shape assertions (count + pattern) hold; the chunk names stayed identical in this checkout, but the path is now exercised by the constants rather than an env override (none exists).
- ✅ Mutant: setting `lazyChunkCount` to 0 in `research/raw/m022-ng-context.json` makes the suite fail with `the development lazy chunk count must match: 2 vs 0`; restored the recording to `lazyChunkCount: 2` exactly.

## Intent coverage

### SC5 — `npm run check` and `npm test` pass at the head.: pass

- ✅ The project gate's dev-build half is green: both suites above pass (18/18), the recordings agree with the bytes, and the mutant restores cleanly. (`npm run check`/`npm test` themselves are the milestone gate; this wave's contribution to SC5 is the dev-build recording + stability assertion, both green.)

## Counts

- `node --test scripts/ng-context-dev-build.test.mjs scripts/facade-dev-build.test.mjs`: tests 18, suites 0, pass 18, fail 0, cancelled 0, skipped 0, todo 0.
- Cross-path (alt output dir): ng-context tests 10, pass 10, fail 0; facade tests 8, pass 8, fail 0.
- Mutant failure line: `the development lazy chunk count must match: 2 vs 0`.

RESULT: wave 4 pass
Model: I cannot tell what model I am running on from the available context.
