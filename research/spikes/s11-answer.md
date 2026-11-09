# S11 — Can sourcemaps plus a worker-side AST index (tree-sitter WASM or the TypeScript parser) give code insight that runtime introspection cannot reach without the application installing opt-in providers and primitives? Falsify by measuring, in this order: (1) does the zoneless portal ship a resolvable main-*.js.map with embedded sourcesContent; (2) does the AOT output preserve template mapping at expression precision or only component granularity; (3) can web-tree-sitter with its TypeScript, HTML and Angular grammars run in a module worker here, at what wall-clock and memory cost per MB of bundle; (4) the same cost measured in the production panel build. If (1) or (2) fails, the capability is dev-and-staging only, which changes who the feature is for.

Recorded: 2026-11-08
Verdict: unresolved

## Question

Can sourcemaps plus a worker-side AST index (tree-sitter WASM or the TypeScript parser) give code insight that runtime introspection cannot reach without the application installing opt-in providers and primitives? Falsify by measuring, in this order: (1) does the zoneless portal ship a resolvable main-*.js.map with embedded sourcesContent; (2) does the AOT output preserve template mapping at expression precision or only component granularity; (3) can web-tree-sitter with its TypeScript, HTML and Angular grammars run in a module worker here, at what wall-clock and memory cost per MB of bundle; (4) the same cost measured in the production panel build. If (1) or (2) fails, the capability is dev-and-staging only, which changes who the feature is for.

## Method

TODO: the smallest isolated thing that settles it. One command beats three.

## Commands and output

```
TODO: paste the command and its raw output; a spike's evidence is the output, not a summary of it.
```

## Verdict

unresolved

## What this settles

TODO: the milestone decision this answer makes possible.

## What this does not settle

TODO: the neighbouring questions a reader might assume this answered.

## Answer (measured 2026-11-08)

**No.** Sourcemaps would not let any shipped feature drop an opt-in requirement, because no shipped gate is a
source-location problem. Measured over the sixteen shipped/repository features in
`.project/research/capability-dependency-matrix.md`.

| Effect | Count |
|---|---|
| `lift` | 0 |
| `narrow` | 0 |
| `changes nothing` | 16 |

Evidence: the two console joins cut the stack before reading anything (`extension/lint-core.js:100,124`,
`extension/router-diagnostic.js:52,66`); the remaining gates need runtime metadata, graph edges, live values,
observation windows or measured times. Nine of the ten `provider` gates are a change-detection arrangement a map cannot
observe, and no feature would move from `dev-mode + provider` to `dev-mode` only.

**The premise inverted later, in S12.** A sourcemap is itself an application opt-in: the zoneless portal's production
build emits 0 `.map` files and only `development` sets `sourceMap` in `apps/insurance-portal/project.json`. So maps cost
the application a build flag, which is the tax this spike was asked to remove.

**What survives.** Sourcemaps still buy new capability rather than fewer requirements; that question moved to S12 (new
insight class) and is answered there. The lever that does remove a requirement is the dev-mode injector, measured in S13.
