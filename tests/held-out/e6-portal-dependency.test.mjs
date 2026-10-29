import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const reportPath = path.join(process.cwd(), '.project', 'review', 'rounds', 'panel-verification.md');
const checkout = 'D:\\projects\\github\\LayZeeDK\\HaasStefan__ng-journal-insurance-portal-ai-devtools';

test('Insurance portal section exists', () => {
  const text = fs.readFileSync(reportPath, 'utf8');
  assert.match(text, /## Insurance portal/i, 'missing ## Insurance portal section');
});

test('portal section names the checkout path', () => {
  const text = fs.readFileSync(reportPath, 'utf8');
  const section = text.split(/## Insurance portal/i)[1] || '';
  assert.ok(section.includes(checkout), 'checkout path must be named in the portal section');
});

test('portal section records an external dependency', () => {
  const text = fs.readFileSync(reportPath, 'utf8');
  const section = text.split(/## Insurance portal/i)[1] || '';
  assert.match(section, /external dependenc/i, 'portal section must name the external dependency');
});

test('portal claim is unverifiable and not verified', () => {
  const text = fs.readFileSync(reportPath, 'utf8');
  const section = text.split(/## Insurance portal/i)[1] || '';
  assert.match(section, /unverifiable/i, 'portal claim must be unverifiable');
  assert.doesNotMatch(section, /Verdict:\s*verified/i, 'portal claim must not be verified');
});
