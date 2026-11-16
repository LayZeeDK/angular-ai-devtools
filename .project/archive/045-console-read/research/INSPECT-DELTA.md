# M045 console-read — inspection delta

Base: `02bba9d28a55e4a639aeac2a17ab36660fbdad4f` (the M056 integration merge).
Audited: 2026-11-15.

## What this inspection covered

The frozen inventory held **153 tracked markdown documents** outside `.project/`. They were audited
in **12 chunks** of 7–16 documents by twelve independent readers, each writing its own fragment to
`.project/research/parts/`. `gsd inspect lint` reported **12 fragments, 814 claims, no problems**,
and `gsd inspect assemble` merged them with the gate passing:

```
152 documents with claims · 1 descriptive (an empty taste file) · 814 claims · 175 queue rows
```

Every queue row names a document, a verdict and the evidence that settles it. The verdict split is
`verified` for the large majority, with `stale` and `unverifiable` concentrated in two places:
citations whose line numbers have drifted, and claims whose evidence lives outside this checkout.

## What it found, in classes

- **Citation drift in skill documentation.** `app.routes.ts:5-8` is cited for the `/stale-view`
  routes by two independent chunks; those routes are at 19-20 and the file declares 20 routes.
  `PORTAL_API_PORT` is cited at `control.mjs:69` and is at 84. The Pangular default port is cited at
  `:74` and is at 87 in the `.claude` copy, 104 in `.commandcode`.
- **Documents that disagree with their own evidence.** `research/07` states a "no empty schemas" rule
  that its own raw matrix contradicts. `research/04` was written from vitest v5 guidance while the
  workspace pins vitest 4. `research/spikes/sourcemap-future-scope.md` still says four roadmap
  entries are `pending` and that the file ends after `M043`; they are shipped and it is 1993 lines.
- **A claim about the repository that is false.** `docs/afk-run-2026-10-12.md` says all eight
  `control-`/`verify-` skill pairs are committed; there is no `verify-angular-dev-app` in either tree.
- **Corrupted bytes in audited documents.** Several skill files carry mojibake where arrows and
  `ng.<fn>` names should be, which is why one chunk quoted around them rather than reproducing them.
- **Skill-tree drift.** `.claude/skills/control-ai-browsers` and `.../verify-ai-browsers` are
  byte-identical to their `.commandcode` counterparts; `control-pangular-inspector`,
  `control-vitest-browser-angular` and `control-angular-*` are not. The project rule only promises
  byte copies for the two browser pairs, so this confirms the rule rather than breaking it.

## What this inspection does NOT claim

- It does not claim the **code** was audited. Four `unverifiable` clusters depend on sources that are
  not vendored: portal-side measurements (the insurance-portal checkout is external), the Nx Cloud API
  surface (nx ships a shim and downloads the client at runtime), the Pangular/`angular/skills` clones,
  and Chromium behaviour. Each such row names the lookup that would settle it.
- It does not claim every large document was read line-for-line. Three chunks disclosed that the
  largest files were read as framing, method and claim-bearing sections plus targeted artifact
  lookups. Every row's evidence comes from outside the audited document, so the rows stand on their
  own evidence rather than on a complete read.
- It does not resolve the 175 queue rows. They are the input to M045's scope decision, not work
  already done.

## Why the chunked route, not `prepare-inspect`

`workflow_run.py prepare-inspect` refuses with *"prior inspection evidence requires the re-inspection
contract"* because `DOCS-AUDIT.md` already exists. The chunked route is the documented re-inspection
path, and `finish-inspect` correspondingly wants a prepared active track this milestone does not have.
