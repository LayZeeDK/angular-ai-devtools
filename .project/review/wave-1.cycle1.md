# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1

## T001 — Measure the three gate shapes and publish one record: pass

- ✅ landed at `3f7de7ed`; `gsd land-check --task-id T001` PASS; `node --check scripts/gate-integrity.test.mjs` exit 0; the suite reported 10 tests / 10 pass at landing and 27 / 27 at this HEAD after T004's additions; `npm run check` exit 0; the recording `research/raw/m044-gate-shapes.json` (71,754 B) is re-derived byte-identically by the suite's default path
- ✅ measured at landing: 138 `.project/` references in 141 suites — 16 `archived-by-the-move`, 18 `deliberate-archive-read`, 104 `undecided`, each undecided row carrying its reason; `nx.json` absent from M035's range while the tree at `d94502d1` carries `"cache": true`; one `NavigationSkipped` among 69 events in 8 frames

## Intent coverage

### SC1 — A committed test that resolves a `.project/` path the milestone's own archive move deletes fails the ship gate, naming the file and the path; a milestone whose tests reference no such path passes the same check.: pass
- ✅ Covered by T001; evidence recorded above and in the task Log at its landing commit.

### SC2 — A task log claiming a file change absent from the milestone's range fails the ship gate, naming the task and the file.: pass
- ✅ Covered by T001; evidence recorded above and in the task Log at its landing commit.

### SC4 — A navigation terminal for an already-ended navigation id produces a finding naming the skipped navigation, proven by a pin fed from `research/raw/m041-navigation.json` rather than from a hand-built event list.: pass
- ✅ Covered by T001; evidence recorded above and in the task Log at its landing commit.
