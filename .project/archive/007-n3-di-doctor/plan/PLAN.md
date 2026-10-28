# Plan — M007 / N3 (DI doctor)

## Intent
See `.project/intent/INTENT.md`.

## Wave 1 — DI tracer + lookup + path display

Goal: Implement MAIN-world DI tracer, token lookup, and panel path display.
Review depth: full

## Wave 2 — diff display + explain button

Goal: Implement two-component diff display and explain button.
Review depth: full

## Wave 3 — browser test / regression gate

Goal: Browser regression gate.
Review depth: full

## Surface contract

### DevTools panel (Angular AI tab) — T003

Entry: Open Angular AI DevTools panel on spikes/ng222-app
States: empty shows "not supported"/"not found"; loading shows spinner; error shows reason; success shows path
Walkthrough:
1. Select a component and observe resolution path renders.
2. Click explain and see answer when Prompt API available.

Criteria: SC2

## Review stubs
- W001
- W002
- W003

Project verify: npm run check

## Intent coverage

| SC1 | T001 | AC1 |
| SC2 | T002 | AC1 |
| SC2 | T003 | AC1 |
| SC3 | T004 | AC1 |
| SC4 | T005 | AC1 |
| SC5 | T001 | AC1 |
| SC6 | T006 | AC1 |

Project verify: npm run check