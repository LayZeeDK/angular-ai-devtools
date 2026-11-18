# Panel bundle budget — the sidecar measured 398 bytes more than the primary

Measured while preparing M050's final review. `prepare-final` failed its gap review on
`scripts/panel-bundle-budget.test.mjs`, not on anything M050's tasks changed.

## The three numbers

```
primary tree, HEAD 1aab785f      535,067 B over 9 eager files   (baseline 535,440 B)  pass
prepare-final sidecar, same head 535,465 B over 9 eager files   (baseline 535,440 B)  fail, 25 B over
probe sidecar, no deps bridge    4/4 pass — it has 13 files and no node_modules, so it did not build
```

The failing message lists the same nine eager files, one of them 398 B larger than the primary's:
`chunk-B8BF8DsE.js 326561 B` plus `main.js 101482 B`, `chunk-FCeS4p_v.js 88104 B` and six small ones.

## What follows from the numbers

- The difference is not M050's code. `dead-click` is a lazy route: it enters a lazy chunk, never the
  initial bundle, which is why the eager file list is identical in both trees.
- The difference is not a source difference: both trees are at `1aab785f` with a clean product tree.
- So one of the two measurements is of a different build. The primary reproduces the committed
  `extension/panel` exactly (the tree stays clean after the run), while a sidecar with a bridged
  `node_modules` builds fresh and emits 398 B more.

## The open question, stated rather than guessed

Which of the two the gate should compare. The budget is about what ships, and what ships is the
committed output the primary measures. A gate that fails in a sidecar and passes in the primary is
measuring the build environment, not the bundle.

The next step is a diff, not a tolerance change: build in a probe sidecar with the deps bridge, then
compare the emitted files byte-for-byte against the committed ones. The diff names the cause — a
banner, a minifier difference, a path embedded in a string — and only then is there a decision to make.

## The probe, run — and it reverses the first reading

`npx nx run angular-ai-devtools:build-extension` in the primary checkout, then the same test:

```
before the rebuild   535,067 B over 9 eager files   PASS   (whatever was on disk)
after a fresh build  535,47x B over 9 eager files   FAIL by 0.02 kB (25 B)
```

Two facts decide what this means:

- `extension/panel` is gitignored apart from `index.html` and `favicon.ico` (`git ls-files` shows two
  paths; 31 `chunk-*.js` sit on disk), and the extension build sets `outputHashing: none`, so a stale
  build persists and looks current.
- Therefore the gate was not measuring this milestone at all in the primary tree. It measured a build
  older than the surfaces the recent milestones added, and passed. In the sidecar a build ran first, so
  the sidecar measured the truth and failed.

So the correct reading is the sidecar's: **at this head the panel's initial bundle is 25 B over its
recorded baseline**, and the primary's pass was an artefact of stale output. The earlier claim in this
file that "the primary reproduces the committed output" is wrong — the output is not committed, and the
primary was reading a build from an earlier milestone.

## Why the growth is structural, not accidental

Every panel surface adds two eager entries to `panel-demo.ts`: a `LOADERS` key (`() => import(...)`,
eager because the map is) and a `FACTS` entry. The baseline header records that the panel already sits
above the 520 kB budget the build configures, so the 535.44 kB constant is a ratchet recorded at an
earlier milestone, not the configured budget. A no-growth ratchet is incompatible with a programme that
adds one surface per milestone; the ratchet needs a stated allowance per surface, or the FACTS map
needs to stop being eager.

## What this means for M050

M050's four tasks are landed and its waves are green, but `prepare-final` cannot pass until the budget
question is decided. Nothing in M050's own work caused a regression: its surface is lazy, and the eager
cost it adds is the same loader/fact pair every previous surface added.

