import { copyFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const local = process.env.LOCALAPPDATA;
const targets = {
  [`${local}/Google/Chrome Beta/User Data/Local State`]: [
    'prompt-api-tool-use@1',
    'gemma4-for-built-in-ai@1',
    'webmcp-testing@1',
  ],
  [`${local}/Microsoft/Edge Dev/User Data/Local State`]: [
    'edge-llm-prompt-api-for-default@1',
    'edge-llm-summarization-api-for-default@1',
    'edge-llm-writer-api-for-default@1',
    'edge-llm-rewriter-api-for-default@1',
    'edge-llm-prompt-api-tool-use@1',
    'edge-llm-on-device-model-prerelease@1',
    'edge-llm-on-device-model-prerelease-tool-use-workaround@1',
    'webmcp-testing@1',
  ],
};

for (const [file, add] of Object.entries(targets)) {
  const backup = `${file}.bak-2026-10-11`;

  if (!existsSync(backup)) {
    copyFileSync(file, backup);
  }

  const state = JSON.parse(readFileSync(file, 'utf8'));
  state.browser ??= {};
  const names = new Set(add.map((f) => f.split('@')[0]));
  const kept = (state.browser.enabled_labs_experiments ?? []).filter((f) => !names.has(f.split('@')[0]));
  state.browser.enabled_labs_experiments = [...kept, ...add];
  writeFileSync(file, JSON.stringify(state));
  console.log(file, '\n  ->', JSON.stringify(state.browser.enabled_labs_experiments));
}
