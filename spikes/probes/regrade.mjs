// Regrades saved bench.js results with the current dependency-question check, without rerunning any model.
// Usage: node spikes/probes/regrade.mjs research/raw/bench/*.json
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const dependsOk = (a) => /\bdouble\b/i.test(a) && /\bcount\b/i.test(a.replace(/app-counter/gi, '')) && !/title|items|increment|nothing|not depend/i.test(a);

for (const file of process.argv.slice(2)) {
  const data = JSON.parse(readFileSync(file, 'utf8'));

  for (const [mode, result] of Object.entries(data.modes)) {
    let before = 0;
    let after = 0;

    for (const q of result.perQ) {
      for (const run of q.runs) {
        const pass = q.q.startsWith('Which signals does double') ? dependsOk(String(run.answer ?? '')) && run.pass : run.pass;
        before += run.pass ? 1 : 0;
        after += pass ? 1 : 0;
      }
    }

    console.log(`${basename(file)} ${mode}: ${before}/15 -> ${after}/15`);
  }
}
