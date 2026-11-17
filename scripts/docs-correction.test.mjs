// @ts-check
// Run: node --experimental-strip-types --test scripts/docs-correction.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

test('AGENTS.md uses the Nx 23 dist/bin entry path', () => {
  const text = readFileSync(join(ROOT, 'AGENTS.md'), 'utf8');
  assert(
    !text.includes('node_modules/nx/bin/nx.js'),
    'old Nx path must be gone',
  );
  assert(
    text.includes('node_modules/nx/dist/bin/nx.js'),
    'new Nx path must be present',
  );
});

test('extension-panel.md states the code Angular version', () => {
  const text = readFileSync(
    join(
      ROOT,
      '.commandcode',
      'skills',
      'control-ai-browsers',
      'features',
      'extension-panel.md',
    ),
    'utf8',
  );
  assert(!text.includes('22.2.2'), 'stale Angular 22.2.2 claim must be gone');
  assert(text.includes('~22.1.0'), 'code Angular version must be stated');
});

test('monitor-ci SKILL.md no longer claims nx.json contains nxCloudId/nxCloudAccessToken', () => {
  const text = readFileSync(
    join(ROOT, '.commandcode', 'skills', 'monitor-ci', 'SKILL.md'),
    'utf8',
  );
  assert(
    !text.includes('for `nxCloudId` or `nxCloudAccessToken`'),
    'old claim must be gone',
  );
  assert(text.includes('contains neither'), 'qualification must be present');
});

// M017 T005: the docs-audit rows the audit rules `fix-doc`. Each case asserts the corrected wording is
// present and the stale wording absent, so it fails on the file at this task's layer base. Where a document
// asserts a fact about another file, the case reads that file and asserts the fact against it, so the
// sentence cannot rot while the page still reads as corrected.
import { readdirSync } from 'node:fs';

function read(rel) {
  return readFileSync(join(ROOT, ...rel.split('/')), 'utf8');
}

function readJson(rel) {
  return JSON.parse(read(rel));
}

test('control-angular-dev-app SKILL.md names the two routes the counter declares', () => {
  const fixture = read('spikes/ng222-app/src/app/app.routes.ts');
  assert(
    fixture.includes("path: 'stale-view',"),
    'the fixture declares /stale-view',
  );
  assert(
    fixture.includes("path: 'stale-view-deferred',"),
    'the fixture declares /stale-view-deferred',
  );
  const text = read('.commandcode/skills/control-angular-dev-app/SKILL.md');
  assert(
    !text.includes('`provideRouter` with no routes'),
    'the empty-router claim must be gone',
  );
  assert(
    text.includes('/stale-view') && text.includes('/stale-view-deferred'),
    'both routes must be named',
  );
  assert(
    text.includes('src/app/app.routes.ts:5-8'),
    'the proving path must be cited',
  );
});

test('control-angular-dev-app features/counter.md states the router lists two routes', () => {
  const text = read(
    '.commandcode/skills/control-angular-dev-app/features/counter.md',
  );
  assert(
    !text.includes('with `routes = []`'),
    'the empty routes array must be gone',
  );
  assert(
    !text.includes('empty route list'),
    'the empty-route-list claim must be gone',
  );
  assert(
    !text.includes('There are no routes'),
    'the no-routes claim must be gone',
  );
  assert(
    text.includes('/stale-view') && text.includes('/stale-view-deferred'),
    'both routes must be named',
  );
  assert(
    text.includes('present: true'),
    'router() must still be described as present',
  );
});

test('control-angular-devtools features/README.md drops the empty-route-list example', () => {
  const text = read(
    '.commandcode/skills/control-angular-devtools/features/README.md',
  );
  assert(
    !text.includes('empty route list'),
    'the empty-route-list example must be gone',
  );
  assert(
    !text.includes('as in the counter'),
    'the counter example must be gone',
  );
  assert(
    text.includes('Router Tree shows only when the app provides the router'),
    'the rule must stay',
  );
});

// The Chromium build this case pins is a fact about Playwright's own install, which no clean worktree
// carries (node_modules is untracked). Resolve the same fact from every in-repo source that holds it,
// strongest first, and report which one answered:
//   1. a playwright-core install whose own version equals the `node_modules/playwright-core` pin in
//      package-lock.json — the root install, or the spike's install only when it pins the same
//      version, because a different install ships a different Chromium (spikes/ng222-app pins 1.63.0
//      and carries 153.0.8010.12), so its build is a different fact and must not be stated here;
//   2. the recorded reading for the pinned playwright-core version, taken 2026-11-01 from
//      node_modules/playwright-core/browsers.json in the primary checkout;
//   3. the documented token, held to the build-and-revision shape, when neither is reachable.
// A fallback is always reported through t.diagnostic, so no run passes on a weaker check silently, and
// the stale-build assertions hold in every mode.
const RECORDED_CHROMIUM = {
  '1.64.1': { browserVersion: '156.0.8078.4', revision: 1248 },
};
const PLAYWRIGHT_INSTALLS = ['', 'spikes/ng222-app/'];

function chromiumBuilds() {
  const pin =
    (readJson('package-lock.json').packages ?? {})[
      'node_modules/playwright-core'
    ]?.version ?? null;
  const matching = [];
  const other = [];
  for (const prefix of PLAYWRIGHT_INSTALLS) {
    const dir = `${prefix}node_modules/playwright-core/`;
    let install;
    let chromium;
    try {
      install = readJson(`${dir}package.json`);
      chromium = readJson(`${dir}browsers.json`).browsers.find(
        (b) => b.name === 'chromium',
      );
    } catch {
      continue; // this checkout does not carry that install
    }
    if (!chromium) continue;
    (install.version === pin ? matching : other).push({
      path: `${dir}browsers.json`,
      version: install.version,
      chromium,
    });
  }
  return { pin, matching, other };
}

test('control-angular-devtools SKILL.md states the Chromium build the installed Playwright pins', (t) => {
  const { pin, matching, other } = chromiumBuilds();
  const installed = matching[0];
  const recorded = pin ? RECORDED_CHROMIUM[pin] : undefined;
  const expected = installed
    ? {
        browserVersion: installed.chromium.browserVersion,
        revision: installed.chromium.revision,
        how: `live ${installed.path} (playwright-core ${pin})`,
      }
    : recorded
      ? {
          browserVersion: recorded.browserVersion,
          revision: recorded.revision,
          how: `recorded 2026-11-01 reading for playwright-core ${pin}; no such install in this worktree`,
        }
      : undefined;
  t.diagnostic(
    expected
      ? `cross-check: ${expected.how}`
      : `cross-check: unavailable — no playwright-core install and no recorded reading for ${pin ?? 'an unknown pin'}; asserting the documented token only`,
  );

  const text = read('.commandcode/skills/control-angular-devtools/SKILL.md');
  assert(!text.includes('154.0.8037.0'), 'the stale build number must be gone');
  assert(
    !text.includes('Chrome for Testing 154'),
    'the stale build must be gone',
  );
  assert(
    text.includes('node_modules/playwright-core/browsers.json'),
    'the proving path must be cited',
  );
  for (const displace of other) {
    assert(
      !text.includes(displace.chromium.browserVersion),
      `${displace.path} pins playwright-core ${displace.version}, not the installed ${pin}; its Chromium must not be stated`,
    );
  }
  if (expected) {
    assert(
      text.includes(expected.browserVersion),
      `the pinned build ${expected.browserVersion} must be stated`,
    );
    assert(
      text.includes(`revision ${expected.revision}`),
      `the pinned revision ${expected.revision} must be stated`,
    );
  } else {
    assert.match(
      text,
      /Chrome for Testing \d+\.\d+\.\d+\.\d+, revision \d+/,
      'the document must state the Chrome for Testing build and its revision',
    );
    const stated = [
      ...text.matchAll(/Chrome for Testing (\d+\.\d+\.\d+\.\d+)/g),
    ].map((match) => match[1]);
    assert.equal(
      new Set(stated).size,
      1,
      `the document must state one build and its revision, not ${stated.join(' / ')}`,
    );
  }
});

test('verify-ai-browsers SKILL.md gives every shipped check a standalone command', () => {
  const checks = readdirSync(
    join(ROOT, '.commandcode', 'skills', 'verify-ai-browsers', 'checks'),
  ).filter((f) => f.endsWith('.mjs') && !f.endsWith('.test.mjs'));
  assert.equal(checks.length, 8, 'the skill ships eight checks');
  const text = read('.commandcode/skills/verify-ai-browsers/SKILL.md');
  for (const file of checks) {
    assert(
      text.includes(`checks/${file}`),
      `the standalone list must name checks/${file}`,
    );
  }
});

test('the maintained control-angular-dev-app SKILL.md carries the maintain rationale verbatim', () => {
  const marker =
    'One skill covers all three targets on purpose (Lars, 2026-10-18)';
  const restored = read('.commandcode/skills/control-angular-dev-app/SKILL.md');
  assert(
    restored.includes(marker),
    'the maintain rationale must be in the maintained copy',
  );
  // The rationale must still read as one paragraph, ending on the decision it records. The
  // cross-copy equality this case used to assert is gone with the mirror (T002).
  const paragraph = (
    restored.split(/\r?\n\r?\n/).find((p) => p.startsWith(marker)) ?? ''
  ).trim();
  assert(paragraph, 'the rationale must stand as a paragraph of its own');
  assert(
    paragraph.endsWith(
      'A maintain pass keeps it whole rather than splitting it per app.',
    ),
    'the rationale must close on the decision to keep the skill whole',
  );
});

test('docs/feature-proposals.md states the built extension and the eleven-draft ledger', () => {
  const text = read('docs/feature-proposals.md');
  const version = readJson('extension/manifest.json').version;
  assert.equal(version, '0.3.0', 'the extension ships at 0.3.0');
  assert(!text.includes('nothing built'), 'the stale status must be gone');
  assert(
    text.includes('version ' + version),
    'the status line must state the shipped version',
  );
  const sections = (read('docs/filing-ledger.md').match(/^## \d+\. /gm) ?? [])
    .length;
  assert.equal(sections, 11, 'the ledger holds eleven drafts');
  assert(
    !text.includes('ten draft upstream reports'),
    'the stale draft count must be gone',
  );
  assert(
    text.includes('eleven draft upstream reports'),
    'the ledger count must be eleven',
  );
});

test('plans/angular-ai-devtools-proposals.handoff.md counts eleven drafts and all five instances', () => {
  const text = read('plans/angular-ai-devtools-proposals.handoff.md');
  assert(!text.includes('ten drafts'), 'the stale draft count must be gone');
  assert(text.includes('eleven drafts'), 'the draft count must be eleven');
  const entries = Object.entries(
    readJson('.commandcode/skills/control-ai-browsers/instances.json')
      .instances,
  );
  assert.equal(entries.length, 5, 'the registry holds five instances');
  for (const [name, instance] of entries) {
    assert(
      typeof instance.port === 'number',
      `${name}: the registry records a port`,
    );
    assert(
      text.includes(`${name} ${instance.port}`),
      `the handoff must document ${name} on ${instance.port}`,
    );
  }
});

test('references/ai-browsers-verification.md attributes the 600 s to the check, not the spec', () => {
  const text = read('references/ai-browsers-verification.md');
  const stateSource = read(
    '.commandcode/skills/verify-ai-browsers/checks/state.mjs',
  );
  assert.match(
    stateSource,
    /timeout:\s*600000/,
    'checks/state.mjs must set the 600 s per-call timeout',
  );
  assert(
    text.includes('checks/state.mjs:321'),
    'the re-attribution must cite the line',
  );
  assert(
    !text.includes('The spec gives `state` 900 s'),
    'the stale attribution must be gone',
  );
  const skill = read('.commandcode/skills/verify-ai-browsers/SKILL.md');
  for (const figure of ['1800000', '900000']) {
    assert(skill.includes(figure), `the skill must record timeoutMs ${figure}`);
    assert(
      text.includes(figure),
      `the reference must keep timeoutMs ${figure}`,
    );
  }
});

test('references/edge-dev-aion-model.md keeps the byte-identical fact, not the older-copy claim', () => {
  const text = read('references/edge-dev-aion-model.md');
  assert(
    !text.includes("Claude Code's older copy"),
    'the "older copy" claim must be gone',
  );
  assert(
    text.includes('byte-identical'),
    'the byte-identical fact must be stated',
  );
  // The two-tree equality this case used to assert cannot run: the mirror it compared is gone
  // (T002). The reference now has to hold to the copy it names, and that copy is the maintained
  // one at .commandcode/skills.
  const model =
    '.commandcode/skills/control-ai-browsers/features/model-lifecycle.md';
  assert(
    text.includes(model),
    'the doc must cite the maintained model-lifecycle.md',
  );
  assert(read(model).length > 0, 'the cited file must carry text');
});

test('research/10-model-capabilities.md names the edge-phi4mini profile path', () => {
  const text = read('research/10-model-capabilities.md');
  const registry = readJson(
    '.commandcode/skills/control-ai-browsers/instances.json',
  );
  assert(
    registry.instances['edge-phi4mini'],
    'the registry names the instance edge-phi4mini',
  );
  assert(
    !registry.instances['edge-dev-phi4mini'],
    'the retired instance name must not be in the registry',
  );
  assert(
    !text.includes('edge-dev-phi4mini'),
    'the retired instance name must be gone from the note',
  );
  const profilePath = `.commandcode/worktrees/${registry.profilesRoot}/edge-phi4mini/EdgeLLMOnDeviceModel/`;
  assert(text.includes(profilePath), `the profile path must be ${profilePath}`);
});

test('AGENTS.md states the shipped interop suite test count', () => {
  const text = read('AGENTS.md');
  const count = (
    read(
      '.commandcode/skills/verify-ai-browsers/checks/interop.test.mjs',
    ).match(/^test\(/gm) ?? []
  ).length;
  assert.equal(count, 10, 'the shipped interop suite holds ten tests');
  assert(
    !text.includes('interop.mjs` (9 tests'),
    'the stale count must be gone',
  );
  assert(
    text.includes('interop.mjs` (' + count + ' tests'),
    'the corrected count must be stated',
  );
});

test('research/08-recent-angular-features.md attributes resource status to the node the recording carries it on', () => {
  const text = read('research/08-recent-angular-features.md');
  const nodes = readJson(
    'research/raw/m036-resource-graph.json',
  ).graph.nodes.filter((node) => String(node.label).startsWith('Resource#'));
  // The measurement the sentence is corrected against: every `Resource#<name>.state` node records
  // `value: null`, and every `Resource#<name>.status` node records the status as its value. Read
  // from the recording itself, so the page cannot rot while still reading as corrected.
  const states = nodes.filter((node) => node.label.endsWith('.state'));
  const statuses = nodes.filter((node) => node.label.endsWith('.status'));
  assert.equal(states.length > 0, true, 'the recording holds .state nodes');
  assert.equal(
    statuses.length,
    states.length,
    'every recorded resource carries one .state node and one .status node',
  );
  for (const node of states) {
    assert.equal(
      node.value,
      null,
      `${node.label} records value: null, so it carries no status`,
    );
  }
  for (const node of statuses) {
    assert.equal(
      typeof node.value,
      'string',
      `${node.label} carries the status the resource reports`,
    );
  }
  // The attribution, on the line the research note cites.
  const lines = text.split(/\r?\n/);
  assert.match(
    lines[136] ?? '',
    /Status comes from the `Resource#<name>\.status` computed node/,
    'line 137 must attribute status to the .status computed node',
  );
  assert.match(
    lines[136] ?? '',
    /every `\.state` node records `value: null`/,
    'line 137 must state what the .state node actually records',
  );
  assert.equal(
    text.includes("Status comes from reading the `state` node's value"),
    false,
    'the state-node attribution must be gone',
  );
  // The field list, on the line it is cited at.
  assert.match(
    lines[169] ?? '',
    /\(state, status, isLoading, extRequest, value\)/,
    'line 170 must name .status among the fields the agent reads',
  );
  assert.equal(
    text.includes('(state, isLoading, extRequest, value)'),
    false,
    'the field list that omitted .status must be gone',
  );
  assert.equal(
    text.includes('`Resource#products.state`'),
    false,
    'no example may read a status off a .state node',
  );
});
