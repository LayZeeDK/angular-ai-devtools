# Lessons

- 010-n4-error-explainer — A repair task must record its task file in a commit before its landing commit, otherwise the landing proof cannot satisfy both the task-file-at-base check and the commit-body `Base:` check.
- 010-n4-error-explainer — A GSD verify sidecar ships without `node_modules`, so the project Verify must bridge its own dependencies before it type checks; `scripts/ensure-sidecar-deps.mjs` now does this for every `npm run check`.
- 010-n4-error-explainer — A model pair pinned against an older browser build stops generating rather than failing: doctor passed every row and then hung 17 minutes at the first canary, and the renderer wedged. Check the browser version against the pinned pair before blaming the harness.
