# pstack model configuration

Per-role model overrides for pstack skills. Each pstack SKILL.md names its defaults in a Models section; the values here override those defaults. Delete a line to fall back to the skill default. A value of `inherit-parent` or `auto` runs that role on the parent session's model (the `Agent` call omits `model`); an alias entry in a panel list still counts toward that panel's fan-out. A model may carry a reasoning effort, as in `poolside/laguna-s-2.1-free @high` (levels: low, medium, high, xhigh, max); the role then runs through the pstack effort agent of that level, each entry of a panel list on its own. `default effort` sets the level for a value without one; `session` keeps the parent session's effort. `session hook: off` stops the Claude Code or Codex SessionStart hook, or the pstack Pi extension, from injecting the poteto-mode mandate; any other value, or no line, leaves it on.

On Command Code, the model slug is passed to the `agent` tool's `model` parameter. The pstack effort agents (`effort-low`, `effort-medium`, `effort-high`, `effort-xhigh`, `effort-max`) set `reasoningEffort` in their frontmatter and do not pin a model; the caller supplies it. Models without effort control (`poolside/laguna-s-2.1-free`) ignore `reasoningEffort` and run at their default depth. Command Code has no SessionStart hook; the `session hook` line here is inert.

Free models available: `poolside/laguna-s-2.1-free`, `reflection/beam:free`, `minimax/minimax-m3.1-flash:free`, `stealth/glyph-cluster:free`.

# Benchmark results (15 free-model variants on /lars-summarize c514846d transcript, ~2.5MB):
# Winner: reflection/beam:free @medium (49s, 384K tokens, good quality — best speed/quality)
#   beam-medium: 49s, beam-low: 68s, beam-xhigh: 103s, beam-high: 300s, beam-max: 528s (turn limit)
#   minimax-low: 108s, minimax-xhigh: 176s, minimax-medium: 210s, minimax-max: 171s, minimax-high: 113s
#   laguna: 531s
#   glyph-low: 41s (failed), glyph-medium: 304s, glyph-high: 264s, glyph-xhigh: 490s (minimal)
# Note: For summarization, Beam @medium is 11x faster than Laguna with good quality.
# Effort barely matters for simple synthesis — low/medium effort is adequate and 2-3x faster.
# Beam has no ZDR; MiniMax is ZDR-capable. Irrelevant for open-source.

## Winner + fallback chain

Coding roles (feature, refactoring, bug-fix, perf-issue):
  feature, refactoring: poolside/laguna-s-2.1-free, reflection/beam:free @low
  bug-fix: poolside/laguna-s-2.1-free, reflection/beam:free @low
  perf-issue: poolside/laguna-s-2.1-free, reflection/beam:free @low
  hillclimb: reflection/beam:free @low, poolside/laguna-s-2.1-free

Judgment/prose roles (judgment and prose, strongest judgment, reflect):
  judgment and prose, strongest judgment, reflect:
  Primary:   reflection/beam:free @low   (fast, adequate quality)
  Fallback:  poolside/laguna-s-2-1-free

Investigation roles (how, why):
  how explorer: reflection/beam:free @low, minimax/minimax-m3.1-flash:free @xhigh
  how explainer: reflection/beam:free @low, minimax/minimax-m3.1-flash:free @xhigh
  why investigators: reflection/beam:free @low, minimax/minimax-m3.1-flash:free @xhigh
  why synthesizer: reflection/beam:free @low, minimax/minimax-m3.1-flash:free @xhigh

Summarization (for /lars-summarize subagent):
  summarize: reflection/beam:free @medium, minimax/minimax-m3.1-flash:free @xhigh

Arena (unchanged — already multi-model fan-out):
  arena runners: poolside/laguna-s-2.1-free, reflection/beam:free, stealth/glyph-cluster:free
  arena cross-judge pool: poolside/laguna-s-2.1-free, reflection/beam:free, stealth/glyph-cluster:free

Other roles:
  swarm workers: poolside/laguna-s-2.1-free, reflection/beam:free @low
  architect runners: poolside/laguna-s-2.1-free, reflection/beam:free, stealth/glyph-cluster:free
  interrogate reviewers: poolside/laguna-s-2.1-free, reflection/beam:free, stealth/glyph-cluster:free

default effort: session
session hook: off
