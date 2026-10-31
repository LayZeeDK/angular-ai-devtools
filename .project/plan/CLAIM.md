# Interop claim (SC6)

lars-verify verdict of verified for the interop claim, end-to-end across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.

| instance | model | route | nodes | limits stated | attribution stated | model answer present | answerMs | extensionId | evidence path |
|---|---|---|---|---|---|---|---|---|---|
| chrome-stable-nano | Gemini Nano | /panel/interop | 1 | yes | yes | yes | 7167 | mgkfgkdgobahfcgkdlokpoehblpbkfok | .project/plan/evidence/T006/interop.json |
| chrome-beta-gemma4 | Gemma 4 | /panel/interop | 1 | yes | yes | yes | 8663 | mgkfgkdgobahfcgkdlokpoehblpbkfok | .project/plan/evidence/T007/interop.json |
| edge-phi4mini | Phi-4-mini | /panel/interop | 1 | yes | yes | yes | 8694 | mgkfgkdgobahfcgkdlokpoehblpbkfok | .project/plan/evidence/T008/interop.json |
| edge-dev-aion | Aion-1.1-Instruct | /panel/interop | 1 | yes | yes | yes | 2536 | mgkfgkdgobahfcgkdlokpoehblpbkfok | .project/plan/evidence/T009/interop.json |

## Verdict

verified

Rule applied: verified only when all four pairs answered with nodes>=1, the limit sentence, the attribution wording and a non-empty model answer.

## Evidence

- .project/plan/evidence/T006/interop.json
- .project/plan/evidence/T007/interop.json
- .project/plan/evidence/T008/interop.json
- .project/plan/evidence/T009/interop.json

Produced by `.commandcode/skills/verify-ai-browsers/checks/interop.mjs`.
