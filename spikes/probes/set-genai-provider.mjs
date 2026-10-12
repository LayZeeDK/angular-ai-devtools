// Rewrites the execution provider list in an ONNX Runtime GenAI genai_config.json (Edge's on-device model).
// Usage: node set-genai-provider.mjs <genai_config.json> <webgpu|qnn|cpu>
import { readFileSync, writeFileSync } from 'node:fs';

const [file, provider] = process.argv.slice(2);
const options = {
  webgpu: [{ webgpu: { enableGraphCapture: '1', validationMode: 'disabled' } }],
  qnn: [{ qnn: { backend_path: 'QnnHtp.dll', htp_performance_mode: 'burst' } }],
  cpu: [],
};

if (!options[provider]) {
  console.error(`provider must be one of ${Object.keys(options).join(', ')}`);
  process.exit(2);
}

const config = JSON.parse(readFileSync(file, 'utf8'));
const session = config.model?.decoder?.session_options;

if (!session) {
  console.error('no model.decoder.session_options in ' + file);
  process.exit(2);
}

const before = JSON.stringify(session.provider_options);
session.provider_options = options[provider];
writeFileSync(file, JSON.stringify(config, null, 2));
console.log(`provider_options ${before} -> ${JSON.stringify(session.provider_options)}`);
