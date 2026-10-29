import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const reportPath = resolve(process.cwd(), '.project/review/rounds/panel-verification.md');
const report = readFileSync(reportPath, 'utf8');

const checkout = 'D:\\projects\\github\\LayZeeDK\\HaasStefan__ng-journal-insurance-portal-ai-devtools';

test('portal section names the checkout path', () => {
  assert.ok(report.includes(checkout), 'checkout path must be named');
});

test('portal section names an external dependency', () => {
  assert.match(report, /external dependenc/i);
});

test('portal claim is not verified', () => {
  const portalSection = report.split(/## Insurance portal/i)[1] || '';
  assert.match(portalSection, /not verified|unverifiable/i);
});
