# INTENT — M055 tutor-foundations

Milestone: M055 · tutor-foundations · Generation 3
Branch: gsd-path/M055
Surfaces: panel

## Goal

The panel answers a question about a shipped feature by naming the recorded artefact that proves
it, so an explanation is traceable to a measurement rather than to prose. The premise that a
question can be mapped to *the* recording that proves a claim was tested against the archives
before this surface was shaped, and the three measurements below (C1–C3) decide what the panel may
cite: the criterion-to-artefact side of every answer is read from a record's own fields, the
question-to-criterion side is the one authored mapping this milestone owns, and the claims
derivation's prose is never rendered.

## Verification target

Every claim of this milestone is verified on the Insurance Portal first
(`D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`, served via
`control-angular-dev-app up --target portal`). A fixture is used only when the portal lacks the
runtime artefact the claim needs, and a verdict that reaches a fixture names the portal route tried
(for example `/home`) and the artefact the portal lacks. A verdict that reaches a fixture without
naming both does not count as a verdict.

## Corrections

- C1 2026-11-20: The roadmap's premise "The verdict claims and recordings the shipped milestones archived" (`.project/ROADMAP.md:1929`) was measured against four archives. `.project/archive/051-what-changed` holds 21 files, `.project/archive/052-webmcp-audit` 36, `.project/archive/053-webmcp-rehearsal` 22 and `.project/archive/054-visual-qa` 22 (plus the earlier `.project/archive/020-feature-fingerprint`, 28), and each carries the same six kinds — `MANIFEST.md`, `intent/`, `plan/`, `research/` (`DOCS-AUDIT.md`, `INSPECT-DELTA.md`, `SYNTHESIS.md`), `review/` (`FINAL.md`, `VERIFICATION.json`, `final-gap-1.md`, `wave-n.cycle1.md`), `tasks/` and `build/` (`verify-ledger.jsonl`, `verify-T00n.log`) — with the recent ships recording `Carried forward: 47 DOCS-AUDIT ruling(s)` (`.project/archive/051-what-changed/MANIFEST.md:7`, `.project/archive/052-webmcp-audit/MANIFEST.md:7`, `.project/archive/053-webmcp-rehearsal/MANIFEST.md:7`, `.project/archive/054-visual-qa/MANIFEST.md:7`; 020 records 33 at `.project/archive/020-feature-fingerprint/MANIFEST.md:7`). No archive contains a `research/raw/` recording: `.project/archive/054-visual-qa/MANIFEST.md:19-39` lists none, yet its evidence column cites `research/raw/m054-style-read.json` and `research/raw/m054-surface.json:363-582` (`.project/archive/054-visual-qa/MANIFEST.md:13-15`). The recordings live outside the archives, at the repo root `research/raw/` (137 files, including the `m05*-verdict-claims.json` and `m05*-surface.json` records). Measured verdict: the premise holds for the evidence trail the archives carry, not for the recording files themselves — the archives hold the records that name the recordings, not the recordings. The criteria below are written to survive that: an answer names a path a record states, the panel verifies the named file exists where the record says it lives at answer time, and a file that is gone is the missing-artefact state of SC2, never a dead path rendered (SC3) and never an invented one.
- C2 2026-11-20: Which fields identify a criterion, a recording and a file was measured in the records. In `research/raw/m054-verdict-claims.json` a criterion is named by `claims[].criterion` (`:71`) with its full text at `claims[].criterionText` (`:72`) and the owning milestone at the record's `milestone` field (`:3`); a recording is named by `evidence.recordings` (`:53-56`) and `capture.records` (`:61`); a file is named by `claims[].artefactPath` (`:76`) and `evidence.suites[].path` (`:43`). In `research/raw/m054-surface.json` the recorded question is the `question` field (`:6`) and files are the `sources` entries (`:10-16`), but criterion ids appear only inside prose statements (`:498`), never as a field. Measured verdict: criterion-to-artefact is answerable from the records alone — the verdict-claims records carry criterion, artefact path, recordings and milestone as fields — while question-to-criterion is not: no record carries end-user question vocabulary, so this milestone must author that one mapping, and every row it maps must name a criterion id a record actually contains. The mapping is authored over fields the records hold; nothing is matched by filename similarity, and the criterion-to-artefact side is read from the records at answer time, not hard-coded into the mapping.
- C3 2026-11-20: The known trap was quoted, not fixed. The shared claims derivation writes the same prose for every milestone: `research/raw/m054-verdict-claims.json:75` (and `:90`, `:105`) reads "…a fact about this repository's own gate, its recordings and the tests that hold them, which no route of any page produces. The gate's one `control-ai-browsers run` driver returns an element's toolElements, drawnRect, descriptor and noDevContext readings, and none of the four can say what a stage examines, what a range is derived from or what a mutant reddens…" — word for word the prose at `research/raw/m053-verdict-claims.json:70` and `:85`, with only the substituted criterion text differing; every row is ruled `not-required` (`research/raw/m054-verdict-claims.json:74`, `:89`, `:104`, with `required: 0 / notRequired: 3` at `:10-11`; `research/raw/m053-verdict-claims.json:69`), and M054's record names M041's suite as its own capture command, `scripts/navigation-blocking.test.mjs` (`research/raw/m054-verdict-claims.json:59-60`, echoed in every `proves` list, `:80`). Measured verdict: as written the derivation cannot support a traceability claim — its `reason`, `artefact` and `reading` fields are one template shared across milestones and its `proves` commands cite a suite the recorded milestone never ran. This milestone works around it and does not repair it: the panel cites only the structural fields a record actually carries per milestone (`milestone`, `claims[].criterion`, `claims[].criterionText`, `claims[].artefactPath`, `evidence.recordings`) and renders none of the template prose; whether the derivation itself is repaired is not this milestone's scope.

## Success criteria

1. The panel, for a question whose answer a record contains, names the artefact file, the milestone
   the record belongs to and the criterion the artefact answers, each of the three read from the
   record's own fields — the milestone from the record's `milestone` field, the criterion from its
   criterion field, the file from its artefact-path field — and none of the three composed from a
   filename, a path convention or the record's prose fields; a mutant that assembles an answer by
   file naming or copies the derivation's prose as the answer reddens.

2. A question no record answers is reported as unanswered, naming which absence holds — no criterion
   in any readable record matches the question, a matched criterion names no artefact path, or the
   records cannot be read — and that state is rendered as its own, distinct from an answer whose
   named artefact file is absent where the record says it lives, which names the record and the
   missing path beside the absence; a mutant that renders an unanswered question as an answer, or a
   missing artefact as unanswered, reddens.

3. Nothing is cited that a record does not contain: every artefact path the panel renders is one the
   named record states and a file that exists where the record says it lives at the time the answer
   is served — inside the milestone's archive (`.project/archive/05*/`) when the record names
   archived evidence, at the repo-root path the record names otherwise — and every criterion id
   rendered appears among the named record's own criterion fields; a mutant that renders a path no
   record states, a file that is not there, or a criterion id the record does not carry reddens.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | boundary | criterion SC1 | A record whose artefact-path field names a recording (`research/raw/…`) and one whose field names a suite (`scripts/…test.mjs`) render through the same read — the surface does not branch on path shape, and both answers carry the same three fields. |
| E2 | SC1 | encoding | criterion SC1 | A criterion whose record states more than one artefact path renders each path as the record spells it — a path is not re-rooted, normalised or shortened to make the render match. |
| E3 | SC2 | empty | criterion SC2 | No matching criterion, a matched criterion with no artefact path, and records that cannot be read are three absences stated distinctly, never one blank unanswered state. |
| E4 | SC2 | precision | held-out | A question whose record names an artefact file that no longer exists where the record says it lives renders the missing-artefact state — never the unanswered state — and names the record and the path beside the absence. |
| E5 | SC3 | idempotency | criterion SC3 | A second answer to the same question over the same records names the same artefact, milestone and criterion from the same record fields: the answer is stable across runs, not re-derived differently each time. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | answer from prose alone — render the derivation's `reason`, `artefact` or `reading` fields, which are one template shared across milestones (C3) — instead of the record's structural criterion, artefact-path and milestone fields | criterion SC1 | Quoted and measured in C3. |
| N2 | SC2 | render an unanswered question as an answer with any content, or fold the three absences and the missing-artefact state into one blank state | criterion SC2 | |
| N3 | SC3 | render an artefact path no record states, or a path that is not present where the record says it lives when the answer is served | criterion SC3 | |
| N4 | SC3 | invent, renumber or generalise a criterion id — an id rendered must be one the named record's own criterion fields carry | criterion SC3 | |
| N5 | SC1 | ship a question-to-criterion index that claims to be derived while hard-coding artefact paths or criterion answers into it — the mapping is authored (C2), the criterion-to-artefact side is read from records at answer time | criterion SC1 | |
| N6 | SC1 | obtain the answer through a page-side control, input or widget on the inspected page — AR-6 keeps every interaction in the panel | criterion SC1 | Scope: out says so itself (`.project/ROADMAP.md:1934`). |
