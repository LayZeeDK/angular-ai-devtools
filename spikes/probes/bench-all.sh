#!/usr/bin/env bash
# Runs bench.js once per per-model browser instance, one after another, and writes spikes/probes/bench/<model>.json.
# Needs the counter fixture on http://localhost:4222 and the instances from research/00-browser-probe.md.
set -u
root=$(cd "$(dirname "$0")/../.." && pwd)
out="$root/spikes/probes/bench"
mkdir -p "$out"

for spec in "nano 9333" "gemma4 9334" "aion 9335" "phi4mini 9337"; do
  set -- $spec
  name=$1
  port=$2
  session="bench-$name"
  playwright-cli -s="$session" attach --cdp="http://127.0.0.1:$port" >/dev/null 2>&1
  start=$(date +%s)
  timeout 1800 playwright-cli -s="$session" --raw run-code --filename="$root/spikes/probes/bench.js" > "$out/$name.json" 2>&1
  echo "$name exit $? in $(( $(date +%s) - start )) s"
  playwright-cli -s="$session" detach >/dev/null 2>&1
done

node "$root/spikes/probes/bench-summary.mjs" "$out/nano.json" "$out/gemma4.json" "$out/aion.json" "$out/phi4mini.json"
