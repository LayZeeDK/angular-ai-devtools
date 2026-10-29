import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const fragmentPath = path.join(root, '.project', 'review', 'rounds', 'panel-edge-phi4mini.md');

// Verdicts live in the checkout's git-ignored evidence tree, which an isolated
// verify sidecar does not copy. The shared Git dir still names the checkout that
// produced them, so a sidecar resolves the same evidence the primary holds.
function evidenceRoot() {
  try {
    const common = execFileSync('git', ['rev-parse', '--git-common-dir'], { encoding: 'utf8' }).trim();
    return path.resolve(root, common, '..');
  } catch {
    return root;
  }
}

test('fragment exists and names the instance', () => {
  assert.ok(fs.existsSync(fragmentPath), `missing fragment: ${fragmentPath}`);
  const text = fs.readFileSync(fragmentPath, 'utf8');
  assert.match(text, /edge-phi4mini/, 'fragment does not name the instance');
});

for (const flow of ['N1', 'N2', 'N3']) {
  test(`${flow}: fragment cites a verdict.json that exists, parses, and records verified`, () => {
    const text = fs.readFileSync(fragmentPath, 'utf8');
    const sectionMatch = text.match(new RegExp(`## ${flow}\\n([\\s\\S]*?)(?=\\n## |\\s*$)`));
    assert.ok(sectionMatch, `no ## ${flow} section in fragment`);
    const section = sectionMatch[1];

    const wordMatch = section.match(/- Verdict:\s*(\S+)/);
    assert.ok(wordMatch, `${flow}: no Verdict line`);
    assert.equal(wordMatch[1], 'verified', `${flow}: fragment does not record verified`);

    const pathMatch = section.match(/- Verdict path:\s*(.+)/);
    assert.ok(pathMatch, `${flow}: no Verdict path cited`);
    const cited = pathMatch[1].trim().replace(/^`+|`+$/g, '');
    assert.ok(cited.endsWith('verdict.json'), `${flow}: cited path is not a verdict.json`);

    const fromEvidence = path.isAbsolute(cited) ? cited : path.join(evidenceRoot(), cited);
    const verdictPath = fs.existsSync(fromEvidence) ? fromEvidence : path.join(root, cited);
    assert.ok(fs.existsSync(verdictPath), `${flow}: cited verdict.json does not exist: ${verdictPath}`);

    let verdict;
    try {
      verdict = JSON.parse(fs.readFileSync(verdictPath, 'utf8'));
    } catch (e) {
      assert.fail(`${flow}: cited verdict.json is not valid JSON: ${e.message}`);
    }
    assert.equal(verdict.verdict, 'verified', `${flow}: verdict.json does not record verified`);
  });
}
