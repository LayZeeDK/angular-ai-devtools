# Panel bundle budget — what the gate measured, and how M050 repaired it

Reconstructed at HEAD `0e8cc563` after `.project/review/` was deleted from the working tree by a coder
who mistook it for generated output. Every number below is quoted from a command run in this session.

## The three measurements, all at `1aab785f`

```
primary checkout, stale output  535,067 B over 9 eager files  baseline 535,440  PASS
prepare-final sidecar, fresh    535,465 B over 9 eager files  baseline 535,440  FAIL by 25 B
primary after a fresh build     535,47x B                      FAIL by 0.02 kB
```

`extension/panel` is git-ignored apart from `index.html` and `favicon.ico` (`git ls-files` shows two
paths; 31 `chunk-*.js` sit on disk) and the extension build sets `outputHashing: none`, so a stale build
persists and reads as current. `npm test` builds nothing. The primary had therefore been passing on a
build of `ddb91a1a`, nine days old.

## What the consultations established

`paid-glm-5-3-flash-high` cloned the repository, rebuilt `ddb91a1a` and reproduced `main.js` at exactly
101,084 B, then rebuilt `1aab785f` and reproduced the sidecar's 535,465 B. It named the drift: six
route-pinning commits, 398 bytes of eager route-table growth, because a route's record and its loader
arrow are eager bytes even where its component is lazy. Every environment candidate — junction bridging,
path or timestamp embedded in output, `NG_BUILD_*`/`NODE_ENV`, digest regeneration, dependency drift —
was tested and exonerated. `free-flint-v1-0` named the precedent: M041's task that held the panel bundle
inside its baseline had repaired the same duplication one layer down. `free-glyph-cluster-medium`
established from the source that the test builds nothing and measures whatever is on disk.

## The repair

Twenty-one panel routes were the same object literal with `path` and `data.surface` holding one string
each. T005 declared the surface names once (`PANEL_SURFACES`) and mapped them over one object literal.

```
after the collapse, fresh build  534.42 kB (534,416 B) over 9 eager files
                                 against the untouched 535.44 kB baseline
```

A 1,049-byte recovery, with the constant and the tolerance untouched. The gate also refuses a
present-but-stale build now, naming the rebuild command, so a nine-day-old artifact can never again be
compared as if it were current.
