# Synthesis — M028 after-render-ordering

## The decision

The roadmap wanted COR-1 to explain why an `afterNextRender` read saw `0`. Measurement at the milestone boundary showed
the profiler subscriber already existed (`extension/agent-main.js:417`) but the fixture had **no** `afterNextRender`
read at all, so the subject had to be created before anything could be explained.

## Shapes considered

1. **Tap the profiler a second time for after-render ordering.** Rejected: N1 forbids a second source, and two lists
   cannot be joined without trusting one over the other.
2. **Attribute the zero to layout.** Rejected outright by N2 — one observation (read order) cannot establish a cause
   (layout had not run).
3. **Order the events around the read, and name the absence when there are none.** Chosen. The ordering module is pure
   and testable in `node:vm`; the surface renders what it is given; the absence is a first-class state.

## Outcome

M028 ships a fixture read, an ordering module over the events the page agent already records, a panel surface with four
states, and a manifest declaration that makes the module execute in the product. All four recordings the fixture change
invalidated were re-recorded through their own tooling.
