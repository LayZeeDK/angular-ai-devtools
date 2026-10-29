import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const fragmentPath = path.join(root, '.project', 'review', 'rounds', 'panel-chrome-beta-nano.md');

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

test('fragment exists and is readable', () => {
  assert.ok(fs.existsSync(fragmentPath), `missing fragment: ${fragmentPath}`);
  const text = fs.readFileSync(fragmentPath, 'utf8');
  assert.ok(text.length > 0, 'fragment is empty');
});

for (const flow of ['N1', 'N2', 'N3']) {
  test(`${flow}: cited verdict exists and is verified, or fragment records unverifiable with reason and route`, () => {
    const text = fs.readFileSync(fragmentPath, 'utf8');
    const sectionMatch = text.match(new RegExp(`## ${flow}\\n([\\s\\S]*?)(?=\\n## |\\s*$)`));
    assert.ok(sectionMatch, `no ## ${flow} section in fragment`);
    const section = sectionMatch[1];

    const pathMatch = section.match(/Verdict path:\s*(.+)/);
    assert.ok(pathMatch, `${flow}: no Verdict path cited`);
    const cited = pathMatch[1].trim().replace(/^`+|`+$/g, '');
    assert.ok(cited.length > 0, `${flow}: empty verdict path`);

    const fromEvidence = path.isAbsolute(cited) ? cited : path.join(evidenceRoot(), cited);
    const verdictPath = fs.existsSync(fromEvidence) ? fromEvidence : path.isAbsolute(cited) ? cited : path.join(root, cited);
    assert.ok(fs.existsSync(verdictPath), `${flow}: cited verdict.json does not exist: ${verdictPath}`);

    let verdict;
    try {
      verdict = JSON.parse(fs.readFileSync(verdictPath, 'utf8'));
    } catch (e) {
      assert.fail(`${flow}: cited verdict.json is not valid JSON: ${e.message}`);
    }
    assert.ok(verdict && typeof verdict.verdict === 'string', `${flow}: verdict.json has no verdict field`);

    if (verdict.verdict !== 'verified') {
      // must be recorded as unverifiable with reason and route in the fragment
      assert.match(section, /unverifiable/i, `${flow}: non-verified verdict must be recorded as unverifiable`);
      assert.match(section, /reason/i, `${flow}: missing reason for non-verified verdict`);
      assert.match(section, /route/i, `${flow}: missing route for non-verified verdict`);
    } else {
      assert.equal(verdict.verdict, 'verified', `${flow}: verdict is not verified`);
    }
  });
}
