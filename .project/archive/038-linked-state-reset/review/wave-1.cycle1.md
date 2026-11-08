# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 9f8deeddd7c7bb1e8ca09b07d00b013cee3903c9

Written at the reviewed head from the verify ledger entry for T001 (passed at fdcbc3f8) and
the task's own recorded measurement; the suite was re-run unarmed at this head and wrote nothing.

## T001 — Measure the linked-signal label and author the fixture states: pass

- ✅ `node --experimental-strip-types --test "scripts/linked-state-capture.test.mjs" "scripts/after-render-fixture.test.mjs" "scripts/router-config-capture.test.mjs" "scripts/router-diagnostic-capture.test.mjs"` — 41 tests, 41 pass, 0 fail at this head; the same command passed at fdcbc3f8 in `.project/build/verify-ledger.jsonl`
- ✅ a linked signal is identified by its node kind (`linkedSignal`), never by its label, and the label it carries is the field name it is assigned to — `agreeing` and `differing` (`research/raw/m038-linked-state.json`: `labels.linkedSignalLabels`, `labels.labelIsTheFieldName`)
- ✅ the source a linked signal follows is reachable from the graph as the producer both linked signals share — node index 2, kind `signal`, label `source`, value 7 — and the page template never reads it directly (`spikes/ng222-app/src/app/linked-state-page.ts:38`, `research/raw/m038-linked-state.json`: `source.evidence.producerIndicesSharedByBothLinkedSignals`)
- ✅ the fixture carries one matching state (`agreeing` holds 7, its source holds 7) and one differing state (`differing` is written once to `this.source() + 1`, holding 8) (`spikes/ng222-app/src/app/linked-state-page.ts:32`,
  `:42`, `research/raw/m038-linked-state.json`: `subjects.agreeing`, `subjects.differing`)
- ✅ the capture is armed by `M038_CAPTURE` only, and two unarmed runs leave the recording byte-identical (sha256 `b7bd843a30ce9c49f5d14eaf72e5e26179e9105fa65f9d1debe644e04a9375a1`) — "two default runs leave the recording byte-identical (pinned SHA-256)"
- ✅ every route-count pin moved by the new route was re-cut to the measured value, with the failing assertion quoted — "the route table declares all nineteen routes in order"; the measured route pin is 19, not 18

## Intent coverage

### SC3 — Both are produced from what the page already exposes through the signal graph, with no new page-side instrumentation, no build-output and no dev-server dependency.: pass

- ✅ the recording is read through the page's own hook, `ng.ɵgetSignalGraph(ng.getInjector(<app-linked-state-page>))` (`scripts/linked-state-capture.test.mjs:677`), and `extension/linked-state.js` declares no import, no DOM, no clock and no page global beyond its own namespace (purity test, "loads bare, publishes the join and reaches for no host global")
