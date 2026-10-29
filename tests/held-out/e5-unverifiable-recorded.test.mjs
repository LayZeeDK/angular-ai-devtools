import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const reportPath = path.join(root, '.project', 'review', 'rounds', 'panel-verification.md');

function evidenceRoot() {
  try {
    const common = execFileSync('git', ['rev-parse', '--git-common-dir'], { encoding: 'utf8' }).trim();
    return path.resolve(root, common, '..');
  } catch {
    return root;
  }
}

function instanceSection(text, name) {
  const re = new RegExp(`## ${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`);
  const m = text.match(re);
  return m ? m[1] : null;
}

function flowSection(section, flow) {
  const re = new RegExp(`### ${flow}\\b\\s*\\n([\\s\\S]*?)(?=\\n### |$)`);
  const m = section.match(re);
  return m ? m[1] : null;
}

const pairs = ['chrome-beta-nano', 'chrome-beta-gemma4', 'edge-phi4mini', 'chrome-stable-nano'];

test('report exists and is readable', () => {
  assert.ok(fs.existsSync(reportPath), `missing report: ${reportPath}`);
  const text = fs.readFileSync(reportPath, 'utf8');
  assert.ok(text.length > 0, 'report is empty');
});

for (const pair of pairs) {
  test(`${pair}: has three flows (N1, N2, N3)`, () => {
    const text = fs.readFileSync(reportPath, 'utf8');
    const sec = instanceSection(text, pair);
    assert.ok(sec, `no ## ${pair} section in report`);
    for (const flow of ['N1', 'N2', 'N3']) {
      const fsec = flowSection(sec, flow);
      assert.ok(fsec, `${pair}: missing ### ${flow} section`);
    }
  });
}

test('every verified row cites an existing verdict.json that parses and records verified', () => {
  const text = fs.readFileSync(reportPath, 'utf8');
  const root_ = evidenceRoot();
  for (const pair of pairs) {
    const sec = instanceSection(text, pair);
    assert.ok(sec, `no ## ${pair} section`);
    for (const flow of ['N1', 'N2', 'N3']) {
      const fsec = flowSection(sec, flow);
      assert.ok(fsec, `${pair} ${flow}: missing flow section`);
      const pathMatch = fsec.match(/Verdict path:\s*(.+)/);
      assert.ok(pathMatch, `${pair} ${flow}: no Verdict path cited`);
      const cited = pathMatch[1].trim().replace(/^`+|`+$/g, '');
      assert.ok(cited.length > 0, `${pair} ${flow}: empty verdict path`);
      const wordMatch = fsec.match(/Verdict:\s*(\w+)/);
      assert.ok(wordMatch, `${pair} ${flow}: no Verdict word`);
      const word = wordMatch[1].toLowerCase();
      if (word !== 'verified') continue;
      const fromEvidence = path.isAbsolute(cited) ? cited : path.join(root_, cited);
      const verdictPath = fs.existsSync(fromEvidence) ? fromEvidence : (path.isAbsolute(cited) ? cited : path.join(root, cited));
      assert.ok(fs.existsSync(verdictPath), `${pair} ${flow}: cited verdict.json does not exist: ${verdictPath}`);
      let verdict;
      try {
        verdict = JSON.parse(fs.readFileSync(verdictPath, 'utf8'));
      } catch (e) {
        assert.fail(`${pair} ${flow}: cited verdict.json is not valid JSON: ${e.message}`);
      }
      assert.ok(verdict && typeof verdict.verdict === 'string', `${pair} ${flow}: verdict.json has no verdict field`);
      assert.equal(verdict.verdict, 'verified', `${pair} ${flow}: verdict.json does not record verified`);
    }
  }
});

test('edge-dev-aion is unverifiable with a reason', () => {
  const text = fs.readFileSync(reportPath, 'utf8');
  const sec = instanceSection(text, 'edge-dev-aion');
  assert.ok(sec, 'no ## edge-dev-aion section in report');
  assert.match(sec, /unverifiable/i, 'edge-dev-aion must be recorded unverifiable');
  assert.match(sec, /reason/i, 'edge-dev-aion must name a reason');
  assert.doesNotMatch(sec, /Verdict:\s*verified/i, 'edge-dev-aion must not be recorded verified');
  // points at the evidence fragment
  assert.match(text, /panel-edge-dev-aion\.md/, 'must point at panel-edge-dev-aion.md');
});
