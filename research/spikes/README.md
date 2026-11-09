# Spike answers — the S11/S12/S13 set for backlog Q4

Six documents written on 2026-11-08 for the owner's question recorded as **Q4** in
`plans/angular-ai-devtools-program-backlog.md` ("spike: sourcemap plus a worker-side AST index, for code
insight with no opt-in"). They answer three gates and carry three analyses those answers rest on.

| Document | What it is | Verdict as recorded in the file |
| --- | --- | --- |
| `s11-answer.md` | Gate S11 — can a sourcemap plus a worker-side AST index give code insight that runtime introspection cannot reach without opt-ins? | `unresolved` |
| `s12-answer.md` | Gate S12 — does the surface create a *new insight class* rather than remove opt-in instrumentation? | the insight class is real, but its prerequisite is an application-side build flag the portal does not set |
| `s13-answer.md` | Gate S13 — which runtime event streams are reachable through the dev-mode injector with zero application instrumentation? | **answered** — 8 streams, 7 reachable with no app cooperation |
| `capability-dependency-matrix.md` | The 16-row capability → application-dependency matrix the three answers cite as `MX` | read-only analysis, every cell cited to a `path:line` |
| `instrumentation-free-coverage.md` | How much of this project's opt-in requirement can be removed entirely (cited as `IFC`) | read-only analysis |
| `sourcemap-future-scope.md` | What sourcemaps would change for every unshipped roadmap entry and later-generation milestone | read-only analysis |

**Why these files live here and not in `.project/research/`.** They were written after M040 shipped, when
`.project/research/` holds exactly one file — the carry-forward `DOCS-AUDIT.md` that the pending rulings require.
`archive_milestone.py` enforces that (`require_clean_active_root`, "pending DOCS-AUDIT rulings lack an exact active
carry-forward copy"): the active research directory must list nothing but a byte-identical copy of the archived
audit. On 2026-11-08, ahead of M040's archive, the six documents were moved from `.project/research/` to
`research/spikes/` — the same tracked `research/` tree that already holds `research/raw/m040-work-events.json`
and the numbered long-form research documents. No content was deleted or rewritten. One byte did change, and it is
git's doing rather than the move's: this repository carries `* text=auto eol=lf`, so a single stray CRLF in
`s11-answer.md` was written to the index as LF — that file is 3,352 bytes here and was 3,353 before `git add`.
Every other file is byte-for-byte what the spike wrote.

**Reading a path inside them.** The documents were written while they lived in `.project/research/`, so a reference
inside one to `.project/research/<name>.md` for one of the six files above now resolves to
`research/spikes/<name>.md`. The documents are left as measured so their quoted evidence stays byte-for-byte what
the spikes recorded; this note is the correction of record for the move, not an edit to them.
