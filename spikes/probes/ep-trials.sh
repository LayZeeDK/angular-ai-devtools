#!/usr/bin/env bash
# Runs one prompt on the edge-dev-aion instance per ONNX Runtime GenAI provider (webgpu, qnn, cpu) and records where the work ran.
# Restores the original genai_config.json afterwards. Usage: bash spikes/probes/ep-trials.sh
root=$(cd "$(dirname "$0")/../.." && pwd)
C="node $root/.claude/skills/control-ai-browsers/scripts/control.mjs"
model_dir="$root/.browsers/edge-dev-aion/EdgeLLMOnDeviceModel/2026.10.2.1"
cfg="$model_dir/genai_config.json"
backup="$root/tmp/aion-genai_config.json.backup"
profile='D:\projects\sandbox\angular-ai-devtools\.browsers\edge-dev-aion'
out="$root/research/ep-trials"
mkdir -p "$out"
cp "$cfg" "$backup"

for provider in webgpu qnn cpu; do
  $C attach edge-dev-aion >/dev/null 2>&1
  $C down edge-dev-aion >/dev/null 2>&1
  node "$root/spikes/probes/set-genai-provider.mjs" "$(cygpath -w "$cfg")" "$provider"
  $C up edge-dev-aion > "$root/tmp/ep-launch-$provider.txt" 2>&1
  echo "up $provider exit $?"
  playwright-cli -s=ep attach --cdp=http://127.0.0.1:9335 >/dev/null 2>&1
  (timeout 240 playwright-cli -s=ep --raw run-code --filename="$root/spikes/probes/ep-prompt.js" > "$out/$provider.json" 2>&1) &
  pwsh -NoProfile -File "$root/spikes/probes/engine-sampler.ps1" "$profile" 90 > "$out/$provider-engines.txt"
  wait
  timeout 30 playwright-cli -s=ep --raw run-code "async page => { await page.goto('about:blank'); return 1; }" >/dev/null 2>&1
  playwright-cli -s=ep detach >/dev/null 2>&1
  echo "== $provider: $(head -c 300 "$out/$provider.json") | $(tr '\n' ' ' < "$out/$provider-engines.txt") | model files: $(ls "$model_dir" 2>/dev/null | wc -l)"
done

$C attach edge-dev-aion >/dev/null 2>&1
$C down edge-dev-aion >/dev/null 2>&1

if [ -d "$model_dir" ]; then
  cp "$backup" "$cfg"
  cmp -s "$backup" "$cfg" && echo "genai_config.json restored"
else
  echo "model folder gone; Edge will download it again"
fi

$C up edge-dev-aion > "$root/tmp/ep-launch-restore.txt" 2>&1
echo "up restored exit $?"
