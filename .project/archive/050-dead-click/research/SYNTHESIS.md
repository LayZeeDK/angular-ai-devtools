# SYNTHESIS — M050 dead-click

What this milestone measured before it wrote anything, and what those measurements changed.

## The premise, and how much of it survived

The roadmap asked for a surface that reports a recorded event whose consequence never arrived. The
premise assumed a chain is measurable for each recorded event class. T001 measured three:

- **Profiler work** — `pair` and `end` (`extension/agent-main.js:697-698`) are a family and a side, not
  an identity; the file says so itself (`:637`). Two open starts of one kind differ in nothing but `at`,
  so pairing them would be pairing by position, which the intent prohibits.
- **Router** — `id` (`:1639`) is the navigation's own id and the field the shipped navigation narrator
  already keys on (`extension/navigation-narrator.js:451-455`). This is the only chain that can be judged.
- **Boundary** — `boundaryReset` (`:2069`) is a presence bit on the arrival that carries it, and the
  record keeps no reset at all (`measurements.reset-lines`, 12 lines, all the agent's own teardown).

So the surface judges one chain and refuses two, and the refusal is a measured decision rather than a
limitation of effort.

## What the window is

Never a single frame. Work is the union of the frames' `events` (`:1048`, a frame closes one microtask
after it opens, `:747`); router is `routerEvents` (`:1050`, cumulative `:1672`, bound 512 `:1471`);
boundary is `boundary.entries` (`:1051`, `:2256`, bound 128 `:1939`). No list is marked final, so a
finding is true as of the record it was read from.

A dangling start survives into the published record — the frame's close publishes it (`:1048`, dispatch
`:1059`) and no removal line reads an end. The brief's hypothesis that a dangling start is dropped was
measured false.

## What the milestone found outside its own surface

Two gate defects, both the same defect at different layers: a measurement comparing output it had not
produced.

- `scripts/panel-bundle-budget.test.mjs` measured whatever build sat in the git-ignored
  `extension/panel`, so a nine-day-old build of `ddb91a1a` passed the budget for three milestones. It now
  refuses a present-but-stale output by name.
- The plan's project verify ran `npm run check && npm test` with no build, so every verify compared an
  inherited artifact. It now builds first, and `extension/panel/index.html` left the format check because
  it is generated.

The bundle measures 534.42 kB against the untouched 535.44 kB baseline after the repair, a 1,049-byte
recovery from collapsing twenty-one duplicated route objects into one surface list.

## Corrections recorded during the milestone

The brief's claim that `interaction` occurs zero times across `extension/*.js` did not reproduce — seven
occurrences, all in `extension/interaction-story.js`, a reader. The picker claim did: one
`attachInput(window, 'click', onClick, true)` at `extension/overlay.js:507`.

## Not claimed

No page was read and no browser was opened to establish the citation measurements. The four stale
`panel-demo.ts` citations in `research/raw/m047-surface.json` remain unchecked by any suite and are
named, not repaired, here.
