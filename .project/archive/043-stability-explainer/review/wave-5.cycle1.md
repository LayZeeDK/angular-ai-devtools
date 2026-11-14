# Review — wave 5, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: c258d440a4ae89603ed0ec2155af6b4a1d9837fe
Wave task: T005 (landed `c258d440`)

Wave 5 exists for one reason and answers one clause: the final review at `46abef82` refused SC2 because
the milestone's only transition was a `node:vm` realm, and this wave drives an inspected page instead. It
adds no behaviour — nothing under `extension/`, `apps/` or `spikes/ng222-app/` moves — and it carries a
recording beside a suite that re-derives every figure in it from the page's own bytes.

## T005 — Drive a settle on an inspected page and record what the page reports: pass

- ✅ **Three paths and one task file, and nothing else.** `git show --stat c258d440` reports
  `.project/tasks/T005-drive-a-settle-on-an-inspected-page.md` +9/−4,
  `research/raw/m043-settle-page.json` +1,148 and `scripts/stability-page-settle.test.mjs` +1,197 — no
  `extension/` path, no `apps/` path and no fixture file, which is what the task declares
  (`.project/tasks/T005-drive-a-settle-on-an-inspected-page.md:11-15`) and what its Log claims (`:96`,
  `:98`).
- ✅ **The drive is an inspected page through this checkout's own extension, not a realm.** The capture
  names the browser instance, the extension it loaded and the fixture that served it
  (`research/raw/m043-settle-page.json:6-22`): `extension/` unpacked over `Extensions.loadUnpacked`
  (`:13`), `chrome-beta-nano` on Chrome/159.0.8154.6 (`:9-10`), the counter fixture on `:4222` at Angular
  22.2.2 (`:16-22`), driven by a `run` probe that adds one init script and then lets the page load itself
  (`:26-31`).
- ✅ **The read attached unstable and settled 17 ms later, from the page's own two readings.** `attachAt`
  112.69999998807907 with `reading {value: false, at: 112.69999998807907}` and
  `settle {state: "no-settle-observed"}` (`research/raw/m043-settle-page.json:1039-1047`; the frame record
  that published it at `:328-341`), then `settle {state: "settled", at: 129.79999995231628}` with
  `reading {value: true, at: 129.79999995231628}` (`:1049-1056`) — `sinceAttachMs` 17.099999964237213
  (`:1056`), which is the join's own subtraction of those two readings and nothing else
  (`extension/stability-narrator.js:205`).
- ✅ **The sequence is the records' own, and an independent second subscription agrees with it.** Two
  values and no third: `false@112.699…` → `true@129.799…` (`research/raw/m043-settle-page.json:1058-1067`),
  and the drive's own observer, subscribed at 100.5 before the read attached, recorded `false` at
  100.59999996423721 and `true` at 129.79999995231628 on the same stream (`:391-408`) — recorded beside
  the sequence and never in place of it (`:1142`).
- ✅ **What held the task is the record's own `routerEvents`, not an inference.** `RouteConfigLoadEnd` at
  123.69999998807907 (`research/raw/m043-settle-page.json:49-61`) and `NavigationEnd` at
  127.59999996423721 (`:275-287`), both after attach and before the settle; the record publishes all
  fifteen arrivals (`:311-327`), and the suite asserts the two that matter against `attachAt` and
  `settle.at` (`scripts/stability-page-settle.test.mjs:812-823`). `isStable` carries no task id, so the
  recording claims no cause for it (`research/raw/m043-settle-page.json:1143`).
- ✅ **It reproduced three times, and the interval is never the record's quiet tail.** The same probe run
  twice more: 32.299999952316284 ms and 8.900000035762787 ms (`research/raw/m043-settle-page.json:409-525`,
  `:526-641`), plus a survey that loaded `/lazy` directly at 9.300000011920929 ms (`:642-700`). The quiet
  tail — attach to the last record dispatched at 626 — is 513.3000000119209 ms (`:1074-1077`), and the pin
  reddens by name if the settle interval ever equals it
  (`scripts/stability-page-settle.test.mjs:594-621`, the mutant at `:877`).
- ✅ **The control measures why the second candidate could not work, and corrects the recording's own
  hypothesis.** A page loaded at `/` was stable at attach (`attachAt` 265.89999997615814, `reading
  {value: true}`, `settle` at 265.89999997615814 — `research/raw/m043-settle-page.json:713-736`); a router
  navigation to `/landing` at 1093 then published `reading {value: false, at: 1093.3999999761581}`
  (`:745-760`) while the same stream emitted `true` at 1099.5 (`:762-781`) — and the section's `settle`
  stayed at 265.89999997615814 (`:753-756`), because `onStabilityEmission` records the first `true` at or
  after attach and never moves it (`extension/agent-main.js:2337-2347`). So a settle later than attach
  requires attaching while a task is pending, not a navigation after a stable attach — the opposite of the
  candidate the task's own Approach proposed (`.project/tasks/T005-drive-a-settle-on-an-inspected-page.md:30-34`),
  and the correction the recording states in its own limits (`research/raw/m043-settle-page.json:1144`).
- ✅ **A measured `0` is still rendered as `0`, and the survey says which routes cannot produce one.** The
  control's join answers `stable` with `settle {state: "settled", at: 265.89999997615814}` and
  `sinceAttachMs: 0`, a number the pane prints as `, 0 ms after attach`
  (`scripts/stability-page-settle.test.mjs:995-1055`, the pane pin at `:1023-1027`). Six routes were
  surveyed (`research/raw/m043-settle-page.json:783-1033`): only `/lazy` answers `transition-observed`;
  `/`, `/redirect` (to `/landing`), `/gated` and `/after-render` were already stable at attach with
  interval `0`; `/resource-states` attached `false` and published `no-settle-observed` for the page's
  life. The suite asserts exactly that partition
  (`scripts/stability-page-settle.test.mjs:1057-1118`).
- ✅ **Every figure is re-derived from the page's own sections, and the pins bite.** A default run requires
  the file's bytes to equal `canonical({...file, derived: derive(file.capture)})`, and the drift mutant
  reddens by byte (`scripts/stability-page-settle.test.mjs:1120-1141`); three mutants each redden a named
  assertion — the settle set to the attach reading (`:826-847`), a transition claimed where the page
  emitted no `true` after attach (`:849-875`), and the interval taken from the quiet tail (`:877`); and
  twelve citations hold each `path:line` to the text that line must still carry
  (`research/raw/m043-settle-page.json:1079-1140`). Unarmed, the recording hashes the same before and after
  the run (`scripts/stability-page-settle.test.mjs:1143`); armed twice it prints the same sha256 both
  times — `c2ce533a4dd5969ab071e5cd1316ed69261d6c9e6c43871c30c8c3d7ed519bd7`, 38,279 bytes at this head
  (`.project/tasks/T005-drive-a-settle-on-an-inspected-page.md:98`).
- ✅ **Verified at this head.** `node --check scripts/stability-page-settle.test.mjs` exit 0; the four
  stability suites 60 tests / 60 pass / 0 fail over 16 suites; `npx prettier --check` clean; `npm run
  check` exit 0 with `verification gate (structure): pass`; and `.project/build/verify-ledger.jsonl:5`
  reads `"result": "pass"` at `c258d440a4ae89603ed0ec2155af6b4a1d9837fe`. The Log's earlier `blocked`
  lines (`.project/tasks/T005-drive-a-settle-on-an-inspected-page.md:99-100`) are the head before the
  shared verification scripts were re-copied, and they are superseded by `:101`, which is the state this
  head carries.

## Intent coverage

### SC2 — The settle time is a reading the page published or a named absence, never an inference: when the stability read emits a change from unstable to stable while the surface is attached, the finding reports the time between the page's own `performance.now()` reading at attach and its reading when `true` arrived, and reports a measured `0` as `0`; a page already stable at attach, a page whose transition happened before attach, and a page that never settles each render the absence `no-settle-observed` with no time and no duration, and no interval taken from the record's quiet tail ever stands in for one.: pass

- ✅ **The first clause is now a page reading.** The criterion asks, when the read emits a change from
  unstable to stable while the surface is attached, for the time between the page's own
  `performance.now()` at attach and its reading when `true` arrived. The recording is that change on
  `/lazy` and the interval is 17.099999964237213 ms
  (`research/raw/m043-settle-page.json:1049-1056`), produced by the shipped read with a second
  subscription watching the same stream (`:391-408`) and repeated three times (`:409-700`).
- ✅ **The measured-`0` clause holds.** SC2 asks that a measured `0` be reported as `0`; the control is
  stable at attach, its interval is `0`, and both the join and the pane carry the number rather than the
  absence (`scripts/stability-page-settle.test.mjs:995-1055`).
- ✅ **Every absence in the second half has a subject.** A page already stable at attach, a page whose
  transition happened before attach, and a page that never settles each render `no-settle-observed` with
  no time and no interval: the survey's stable-at-attach routes settle at attach with interval `0`, and
  `/resource-states` publishes no settle at all (`research/raw/m043-settle-page.json:783-1033`;
  `scripts/stability-page-settle.test.mjs:1057-1118`), while a record with no settle reading carries no
  `sinceAttachMs` key at all (`:948-957`).
- ✅ **No interval from the quiet tail stands in for one.** The quiet tail is a number the file carries —
  513.3000000119209 ms (`research/raw/m043-settle-page.json:1074-1077`) — and the pin reddens by name if it
  ever becomes the settle (`scripts/stability-page-settle.test.mjs:594-621`). The join subtracts the two
  published readings and reads no clock (`extension/stability-narrator.js:194-207`).
- The residual is the subject, not the reading: one route on one fixture, three runs of one probe, one
  browser (`research/raw/m043-settle-page.json:1145`), and the portal's zoneless target was never read
  (`.project/intent/INTENT.md:247-249`). That limits how wide the reading is, and it is recorded rather
  than widened here — the clause is a drive on an inspected page, and this is one.
