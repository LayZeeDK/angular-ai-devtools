---
id: T005
title: Compute the DOM role and accessible name at read time
wave: 3
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/tool-registry/role-name.ts
  - apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts
---

# T005 — Compute the DOM role and accessible name at read time

## Context

A later Aria explainer has to name what it observed, and the panel currently has no way to say "this
element is a button and its accessible name is X". The computation is small but easy to get quietly
wrong: a role that falls back to `textContent` hides the "no accessible name" case the reviewer must
be able to see (N3), and a cached name answers about an element that no longer exists (E6). This task
ships the role and accessible-name computation as a DI-free, DOM-read-only module with two fixtures —
a control labelled by `aria-label` and a control named only by its content — plus an unlabelled
control that must yield a role and an explicit "no accessible name".

## Approach

- The module is a pure read: it takes an `Element` and returns a value. No mutation, no style write,
  no overlay, no `MutationObserver`, no `document.body` append, and no import from Angular (AR-3: the
  overlay is M022's and the only DOM the tool will ever add to an inspected page; AR-4: every owned
  observer must exclude the tool host subtree, so do not add one).
- Role: an explicit `role` attribute wins (first token when several are listed), otherwise the
  implicit role from an HTML-AAM subset — `button`, `a[href]`, `input[type=checkbox|radio|text]`,
  `select`, `textarea`, `h1`–`h6`, `img`, `table`, `ul`/`ol`, `li`, `nav`, `main`, `dialog`,
  `[role]` wrappers and their `tab`/`tabpanel`/`menuitem`/`option`/`listbox` counterparts. An element
  whose role the subset does not name returns `null`; never guess `generic` and never default to a
  role the subset does not support.
- Name: follow the role's own naming order, not one universal order — `aria-labelledby` (concatenate
  the referenced elements' text), then `aria-label`, then the native source (`<label for>`, a wrapping
  `<label>`, `alt`, `<caption>`), then content only for the roles whose naming source includes content
  (`button`, `link`, `heading`, `option`, `tab`, `menuitem`, `cell`, `columnheader`, `rowheader`,
  `tooltip`). Collapse whitespace and trim the result.
- N3: no `textContent` fallback when the role takes its name from an author source. A button with an
  `aria-label` returns that label even when its text differs; a textbox or checkbox with no label
  returns `{ name: null, reason: 'no accessible name' }` even when it has text content. A fallback
  that always returns something hides exactly the case the Aria explainer must report.
- E6: compute from the live element on every call. No memoisation, no `WeakMap` cache, no snapshot
  taken at construction, and no field on a returned object that a caller could reuse. The spec proves
  it by mutating the label between two reads on the same element and asserting the second answer
  differs.
- Fixtures are built per case with `document.createElement` inside the spec — the app's unit-test
  builder runs in a Node + jsdom environment, so `document` exists. Do not share a module-level
  fixture element between cases: a shared node would mask a cache.
- Keep the module small and dependency-free: it is on the panel's initial-bundle path against a hard
  520 KB budget with ~13.7 KiB of headroom (AR-1).
- Write only the two declared files.

## Interface contract

- None

## Intent coverage

- SC4

## Acceptance criteria

1. `computeRole(element)` returns the explicit `role` attribute's first token when present, else the implicit role from the module's documented HTML-AAM subset, and `null` for an element the subset does not name — never a guessed default.
2. `computeAccessibleName(element, role)` follows the role's naming order — `aria-labelledby`, then `aria-label`, then the native source, then content only for content-named roles — collapses whitespace, and returns the source it used.
3. N3: no `textContent` fallback exists for a role named by an author source. A button whose `aria-label` differs from its text returns the label; a textbox and a checkbox with text content but no label each return `{ name: null, reason: 'no accessible name' }`.
4. E5: a control with `aria-label` and a control named only by its text content each yield both a role and a name, and an unlabelled control yields a role and the explicit "no accessible name" — one case titled `E5 a labelled control and a content-named control both yield a role and a name, and an unlabelled control yields no accessible name`.
5. E6: the name is read from the element at call time — mutating the label between two reads changes the second result, and no cache, memo or construction-time snapshot exists — one case titled `E6 the name is read from the DOM at call time, so changing the label changes the next result`.
6. The result shape is `{ role: string | null; name: string | null; source: 'aria-labelledby' | 'aria-label' | 'native' | 'content' | null; reason: 'no accessible name' | null }`: a non-null `name` carries a non-null `source` and a null `reason`, and a null `name` carries a null `source` and the `no accessible name` reason.
7. `role-name.ts` imports nothing from Angular and performs no DOM write, no observer registration and no append: the reviewer reads the import list and the statement list, which is what AR-3/AR-4 rest on.

## Verify

```bash
npm ci && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts
```

Heavy: no

## Log

- 2026-11-01 — created by planner
