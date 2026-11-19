# SYNTHESIS — M052 webmcp-audit

## What the milestone established

The panel now reports which WebMCP tools the inspected app declares, reading the tool list from the
page's model-context API rather than from the DOM, and refuses to describe a tool the page does not
expose. The reading is a pure function over whatever carries `modelContext` (`extension/webmcp-audit.js`,
`readTools(source)`), answering a closed three-state vocabulary — `tools`, `empty`, `cannot-tell` —
where `empty` is earned only by an array the getter actually answered and measured empty, and every
way a list can fail to be readable has its own named refusal code. The surface
(`apps/angular-ai-devtools/src/app/panel-webmcp.ts`) renders the reading and nothing else: the name
the API reported, the description only where the descriptor carried one, and the reason's own words
for a refusal.

The measurement that decided the shape is recorded, not assumed. Static reading found that the tree's
whole prior knowledge of the surface was the `typeof document.modelContext` canary
(`control.mjs:1953`) and that no code had ever called a WebMCP member (`research/raw/m052-webmcp-api.json`);
a live Chrome Beta 159 observation then measured `getTools()` answering a **Promise** which, awaited
on a page declaring no tools, resolves to `[]` (`research/raw/m052-webmcp-observation.json`). The
synchronous reader therefore answers the measured API `cannot-tell`/`unreadable-list` — the refusal,
not an invented empty list — and the milestone records that fact in three independent places (plan
Correction C3, the T004 Log, the observation recording) rather than smoothing it.

## What it corrected in itself

The first fact the ship carries is that the API is asynchronous, so the reader lands in `cannot-tell`
until a page-world caller awaits. Wiring that await was not done here: the reader stays pure and
synchronous (SC3, poisoned-source pinned), and the awaiting caller is carried as a declared residual
rather than as a silent widening of T002 or T003 after they landed. That is the milestone's own
correction pattern applied to itself — measure, record the gap where the reviewers will find it, and
keep the landed contracts frozen.

The second: the user-scope pin P3 was pinning a token (`Intent coverage row is unreadable`) that
`git log -S` shows never existed in any revision of `check_handoffs.py`. The test side was wrong, not
the code, so the token was re-pinned to what the code actually raises for a dropped coverage row
(`PLAN.md Intent coverage has no rows`, `scripts/user-scope-autonomy.mjs:105-116`) with the ruling
recorded in the comment — a pin repaired by measurement, not by loosening the check.

## What the milestone carried forward

- `npm test` exits 0 at the shipped head for the first time in recent milestones: the seven failures
  the T004 Log measured at the baseline `b10bffb6` are resolved at `dd8fff6a` (ledger rerun entry:
  first leg 1691 tests / 0 fail, exit 0), with the pre-existing red recorded as baseline history
  rather than inherited silently.
- The copy-digest grammar held under growth: the twenty-fourth surface added eight digest rows and
  one shared `no-reason` text (161 → 169 rows, 165 → 174 sentences) without a grammar change, and the
  record's counts stayed derived from the entries rather than typed beside them.
- The route-table suites now refuse a dropped `webmcp` route or loader by name
  (`scripts/panel-routes.test.mjs` per-surface mutants), so the 052 surface is protected the way the
  M047 and M051 surfaces are.
