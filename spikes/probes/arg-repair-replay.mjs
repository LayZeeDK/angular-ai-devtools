// Replays every tool call saved by bench.js through a deterministic validate-and-repair step and counts how many invalid calls it makes valid.
// Usage: node spikes/probes/arg-repair-replay.mjs research/raw/bench/*.json
import { readFileSync } from 'node:fs';

const selectors = ['app-root', 'app-counter'];
const signalsOf = { 'app-counter': ['title', 'count', 'double', 'items'], 'app-root': [] };
const schema = {
  components_find: ['query'],
  component_details: ['selector'],
  signal_info: ['selector', 'signal'],
};

const distance = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);

  for (let j = 1; j <= b.length; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }

  return d[a.length][b.length];
};

const nearest = (value, options) => {
  const v = String(value ?? '').trim().toLowerCase();
  const exact = options.find((o) => o === v);

  if (exact) {
    return exact;
  }

  const tokens = v.split(/[\s>+~]+/).map((t) => t.replace(/^[.#]+/, '').replace(/[*[\]"=()]/g, '')).filter(Boolean);
  const byToken = options.find((o) => tokens.includes(o));

  if (byToken) {
    return byToken;
  }

  const close = options.filter((o) => distance(v.replace(/^[.#]+/, ''), o) <= 2);

  return close.length === 1 ? close[0] : null;
};

const isValid = (name, args) => {
  if (!schema[name] || Object.keys(args).some((k) => !schema[name].includes(k))) {
    return false;
  }

  if (name === 'components_find') {
    return args.query === '*' || selectors.includes(args.query);
  }

  if (!selectors.includes(args.selector)) {
    return false;
  }

  return name === 'component_details' || signalsOf[args.selector].includes(args.signal);
};

const repair = (name, raw) => {
  let args = raw;

  if (args?.properties && args.type === 'object') {
    args = Object.fromEntries(Object.entries(args.properties).map(([k, v]) => [k, typeof v === 'object' ? v.const ?? v.default ?? '*' : v]));
  }

  const out = Object.fromEntries(Object.entries(args).filter(([k]) => schema[name]?.includes(k)));

  if (name === 'components_find') {
    const q = String(out.query ?? '').trim().toLowerCase();
    out.query = /^\*+$|^all$/.test(q) ? '*' : nearest(q, selectors) ?? q;

    return out;
  }

  const allSignals = Object.values(signalsOf).flat();

  if (allSignals.includes(String(out.selector))) {
    out.selector = Object.keys(signalsOf).find((s) => signalsOf[s].includes(out.selector));
  } else {
    out.selector = nearest(out.selector, selectors) ?? out.selector;
  }

  if (name === 'signal_info') {
    out.signal = nearest(out.signal, signalsOf[out.selector] ?? []) ?? out.signal;
  }

  return out;
};

let total = 0;
let invalid = 0;
let fixed = 0;
const stillInvalid = new Map();

for (const file of process.argv.slice(2)) {
  const data = JSON.parse(readFileSync(file, 'utf8'));

  for (const mode of Object.values(data.modes)) {
    for (const q of mode.perQ) {
      for (const run of q.runs) {
        for (const call of run.calls ?? []) {
          const m = /^(\w+)(\{.*\})$/.exec(String(call));

          if (!m) {
            continue;
          }

          total++;
          const [, name, json] = m;
          const args = JSON.parse(json);

          if (isValid(name, args)) {
            continue;
          }

          invalid++;
          const repaired = repair(name, args);

          if (isValid(name, repaired)) {
            fixed++;
          } else {
            const key = `${name}${JSON.stringify(args)} -> ${JSON.stringify(repaired)}`;
            stillInvalid.set(key, (stillInvalid.get(key) ?? 0) + 1);
          }
        }
      }
    }
  }
}

console.log(JSON.stringify({ total, invalid, fixed, stillInvalid: Object.fromEntries(stillInvalid) }, null, 2));
