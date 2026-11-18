# M050 dead-click — inspection delta

Measured delta against the audit frozen at `337047455bae67f5e05ccf25ecd0909b0c9bf448`.

## Gate

`check_docs_audit.py --repo .` exits 0 at this head: coverage equals the derived inventory, 525
claims over 111 documents plus one descriptive, and the carried rulings intact.

## Changed since M049's integration

One commit, `74d00e63`, which corrects a research record rather than a document:
`research/raw/m049-streams.json` claimed no extension file registers a UI listener, and
`extension/overlay.js:507` registers one through the `attachInput` wrapper (`:440`). No audited
document changed.

## What this delta does not claim

It does not claim any code was audited as documentation, and it does not re-read a document outside
the audit. The correction above is recorded here because it changes what M050 may assume.

## Consequence for the plan

The roadmap's premise is that the panel reports a click the page recorded which produced no app-side
effect. Measured at `74d00e63`, the click axis does not exist on the page at all:

- `extension/agent-main.js` records no interaction; `interaction` occurs 0 times in it and across the
  twenty-eight `extension/*.js` files.
- The only click listener in `extension/` is the overlay's element picker
  (`extension/overlay.js:507`, `onClick` `:356`): it returns unless armed, then `preventDefault`s and
  locks an element, so it suppresses the page's own handling instead of recording it.
- What the record does pair is three consequence chains: the profiler's `*Start`/`*End` work events
  (`extension/agent-main.js:25-38`), the router's `NavigationStart`→`NavigationEnd`
  (`routerEvents`, `:1474`), and a boundary arrival with its `boundaryReset` flag (`:2069`).

So the milestone's first task must measure those three chains — which consequent each `Start` should
see, what a dangling one looks like in the record, and whether the record bounds the window — and the
intent must state the finding over a recorded consequence that never arrived, never over a click.
