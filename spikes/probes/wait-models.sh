#!/usr/bin/env bash
# Polls LanguageModel.availability() in the per-model browser instances until every one is "available".
# Usage: bash spikes/probes/wait-models.sh [timeout-seconds]
deadline=$((SECONDS + ${1:-2700}))

while [ $SECONDS -lt $deadline ]; do
  all=1
  line=""

  for s in nano g4 aion phi; do
    a=$(timeout 30 playwright-cli -s=$s --raw eval "(async()=>await LanguageModel.availability())()" 2>/dev/null | tr -d '"\r\n')
    line="$line $s=$a"

    if [ "$a" != "available" ]; then
      all=0
    fi
  done

  echo "$(date +%H:%M:%S)$line"

  if [ $all -eq 1 ]; then
    exit 0
  fi

  sleep 30
done

exit 1
