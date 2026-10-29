import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const reportPath = resolve(process.cwd(), '.project/review/rounds/panel-verification.md');
const report = readFileSync(reportPath, 'utf8');

const pairs = ['chrome-beta-nano', 'chrome-beta-gemma4', 'edge-dev-aion', 'edge-phi4mini'];

test('every non-running pair is recorded non-verified with a named reason', () => {
  for (const pair of pairs) {
    const line = report.split('\n').find((l) => l.includes(pair) && /unverifiable|inconclusive|not verified/.test(l));
    // edge-dev-aion must be non-verified
    if (pair === 'edge-dev-aion') {
      assert.match(report, /edge-dev-aion[\s\S]*?unverifiable/i, `${pair} must be unverifiable`);
      assert.match(report, /edge-dev-aion[\s\S]*?hang/i, `${pair} must name a reason`);
    }
  }
});

test('every verified pair cites an existing verdict.json', () => {
  const verifiedPairs = ['chrome-beta-nano', 'chrome-beta-gemma4', 'edge-phi4mini'];
  for (const pair of verifiedPairs) {
    const re = new RegExp(pair + '[\\s\\S]*?verdict\\.json:\\s*(\\S+verdict\\.json)', 'i');
    const m = report.match(re);
    assert.ok(m, `${pair} must cite a verdict.json`);
    const p = m[1].trim();
    assert.ok(existsSync(p), `verdict.json must exist on disk: ${p}`);
  }
});

test('edge-dev-aion is not marked verified', () => {
  const tableLine = report.split('\n').find((l) => l.startsWith('| edge-dev-aion |'));
  assert.ok(tableLine, 'edge-dev-aion row present');
  assert.match(tableLine, /unverifiable/i);
  assert.doesNotMatch(tableLine, /\|\s*verified\s*\|/i);
});
