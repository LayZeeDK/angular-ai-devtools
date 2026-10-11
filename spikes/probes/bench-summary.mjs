import { readFileSync } from 'node:fs';

for (const file of process.argv.slice(2)) {
  const text = readFileSync(file, 'utf8');
  let o;

  try {
    o = JSON.parse(text);
  } catch {
    console.log(`== ${file}: not JSON: ${text.slice(0, 300)}`);
    continue;
  }

  console.log(`== ${file}: ${o.ua} contextWindow=${o.contextWindow}`);

  for (const [mode, r] of Object.entries(o.modes)) {
    console.log(`${mode}: pass@3 ${r.passAtK}, pass^3 ${r.passHatK}, runs ${r.runPasses}`);

    for (const q of r.perQ) {
      const failed = q.runs.find((x) => !x.pass);
      console.log(`  ${q.passes}/3 median ${q.medianMs} ms | ${q.q.slice(0, 55)}${failed ? ` | FAIL: ${failed.calls.join(';')} -> ${failed.answer.slice(0, 90)}` : ''}`);
    }
  }
}
