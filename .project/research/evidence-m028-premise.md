# Evidence — M028 `after-render-ordering` premise check

Measured 2026-11-04 at the M028 boundary, before writing the intent. The rule this programme now applies to every
milestone: **inspect begins by trying to falsify the roadmap's own sentence.**

## The roadmap's two load-bearing claims

| Claim | Verdict |
|---|---|
| "the single `ɵsetProfiler` list the page agent already records" | **holds** |
| "On the fixture, a component whose `afterNextRender` reads `offsetWidth`" | **false** |

### The profiler surface exists

`extension/agent-main.js` already declares the enum and subscribes:

```
18: // ProfilerEvent enum values (packages/core/primitives/devtools/src/profiler_types.ts).
21: var ProfilerEvent = {
63:   setProfiler: false,
73:   f.setProfiler = typeof ng.ɵsetProfiler === "function" || typeof ng.setProfiler === "function";
417: var setProfiler = typeof ngObj.ɵsetProfiler === "function" ? ngObj.ɵsetProfiler : …
436: var remover = setProfiler(subscriber);
```

So COR-1 can read one list, and the milestone's prohibition against a second profiler tap is satisfiable.

### The fixture has no `afterNextRender` at all

```
Select-String -Path "spikes/ng222-app/src/**/*.ts" -Pattern "afterNextRender"
→ (no matches)
```

There is no component reading `offsetWidth` in an after-render hook, and no `ɵsetProfiler` call in the fixture either.
SC1's scenario does not exist and must be **created** — a fixture change, as M026's image page had to be.

## What that means for the plan

1. **A task must add the fixture's after-render read** (a component whose `afterNextRender` reads `offsetWidth` before
   layout), with its route, and **must not** add any page-side instrumentation — the profiler subscriber in the
   extension is the only source.
2. Because the fixture gains a route, the **panel's route-list pin** (`chat-entry.component.spec.ts`) and the
   **control-skill feature manifests** will both go stale. M026 paid three tasks for exactly that; this plan should
   declare them up front instead.
3. The "cannot tell" state has a real subject: with no after-render event in the list, the finding must say so rather
   than attribute the zero width to layout.

## Lesson carried in

Two consecutive milestones (M026, M027) had roadmap premises that were false in a way measurement settled in minutes.
This one is false in the same way — the capability exists, the *subject* does not — and the plan is written knowing it
rather than discovering it at the ship gate.
