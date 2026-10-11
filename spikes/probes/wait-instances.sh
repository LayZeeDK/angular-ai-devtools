#!/usr/bin/env bash
# Polls LanguageModel.availability() in the named per-model instances every 30 s until all are "available" or the timeout passes.
# Usage: bash spikes/probes/wait-instances.sh <timeout-seconds> <session:port>...
root=$(cd "$(dirname "$0")/../.." && pwd)
deadline=$((SECONDS + $1))
shift

while [ $SECONDS -lt $deadline ]; do
  line=""
  all=1

  for spec in "$@"; do
    session=${spec%%:*}
    port=${spec##*:}
    playwright-cli -s="$session" attach --cdp="http://127.0.0.1:$port" >/dev/null 2>&1
    a=$(timeout 40 playwright-cli -s="$session" --raw eval "(async()=>await Promise.race([LanguageModel.availability(), new Promise(r=>setTimeout(()=>r('pending'),15000))]))()" 2>/dev/null | tr -d '"\r\n')
    line="$line $session=${a:-no-answer}"

    if [ "$a" != available ]; then
      all=0
    fi
  done

  sizes=$(du -sm "$root"/.browsers/*/EdgeLLMOnDeviceModel "$root"/.browsers/*/OptGuideOnDeviceModel 2>/dev/null | sed "s#$root/.browsers/##" | tr '\t\n' ': ')
  echo "$(date +%H:%M:%S)$line | $sizes"

  if [ $all -eq 1 ]; then
    exit 0
  fi

  sleep 30
done

exit 1
