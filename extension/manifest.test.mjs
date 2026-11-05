// Tests for extension/manifest.json — the first pin this manifest has had.
// Written to survive the third declaration the overlay task adds: every assertion is about a named
// declaration or about every declaration, never about how many there are.
//
// M028 T003 adds the fourth declaration: `after-render.js` at `document_start`, which executes the
// ordering module T002 shipped but nothing loaded. The new pins below assert that declaration and
// its position, and every pin written before it is kept as it was.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXTENSION_DIR = dirname(fileURLToPath(import.meta.url));
const MANIFEST = JSON.parse(
  readFileSync(join(EXTENSION_DIR, 'manifest.json'), 'utf8'),
);
const FILTER = 'observer-filter.js';
const RELAY = 'relay.js';
const AGENT_MAIN = 'agent-main.js';
const OVERLAY = 'overlay.js';

/** Every file the manifest names, whichever declaration names it. */
function namedFiles(manifest) {
  const files = [];
  if (manifest.background && manifest.background.service_worker)
    files.push(manifest.background.service_worker);
  for (const declaration of manifest.content_scripts || [])
    files.push(...(declaration.js || []));
  if (manifest.devtools_page) files.push(manifest.devtools_page);
  for (const icon of Object.values(manifest.icons || {})) files.push(icon);
  return files;
}

function declarationFor(file) {
  const found = (MANIFEST.content_scripts || []).find((declaration) =>
    (declaration.js || []).includes(file),
  );
  assert.ok(found, `no content_scripts declaration lists ${file}`);
  return found;
}

describe('extension/manifest.json', () => {
  it('names only files that exist under extension/', () => {
    const files = namedFiles(MANIFEST);
    assert.ok(files.length > 0, 'the manifest must name at least one file');
    for (const file of files) {
      assert.ok(
        existsSync(join(EXTENSION_DIR, file)),
        `extension/${file} is named by the manifest but does not exist`,
      );
    }
  });

  it('loads the shared observer filter before the relay, at document_idle', () => {
    const relayDeclaration = declarationFor(RELAY);
    assert.equal(
      relayDeclaration.js[0],
      FILTER,
      "the shared filter must be the first script in the relay's declaration",
    );
    assert.ok(
      relayDeclaration.js.indexOf(FILTER) < relayDeclaration.js.indexOf(RELAY),
      'the filter must be declared before the script that calls it',
    );
    assert.equal(
      relayDeclaration.run_at,
      'document_idle',
      'the relay keeps its shipped run_at',
    );
  });

  it('keeps the MAIN-world agent at document_idle in world MAIN', () => {
    const agentDeclaration = declarationFor(AGENT_MAIN);
    assert.equal(
      agentDeclaration.run_at,
      'document_idle',
      'the agent keeps its shipped run_at',
    );
    assert.equal(
      agentDeclaration.world,
      'MAIN',
      'the agent is the MAIN-world declaration',
    );
  });

  it('runs the overlay host at document_start, in the default world, after the shared filter', () => {
    const overlayDeclaration = declarationFor(OVERLAY);
    assert.equal(
      overlayDeclaration.js[0],
      FILTER,
      'the overlay calls the shared predicate, so the filter is listed first',
    );
    assert.ok(
      overlayDeclaration.js.indexOf(FILTER) <
        overlayDeclaration.js.indexOf(OVERLAY),
      'the filter must be declared before the script that calls it',
    );
    assert.equal(
      overlayDeclaration.run_at,
      'document_start',
      "the host must exist before the page's own scripts run",
    );
    assert.ok(
      !('world' in overlayDeclaration),
      'no world key: the overlay is the default ISOLATED-world script (AR-2)',
    );
    assert.deepEqual(
      overlayDeclaration.matches,
      ['<all_urls>'],
      'the overlay matches the pages the other declarations match',
    );
  });

  it('declares each content-script unit exactly once, and the shared filter in both declarations that use it', () => {
    const declarations = MANIFEST.content_scripts || [];
    for (const unit of [RELAY, AGENT_MAIN, OVERLAY]) {
      const count = declarations.filter((declaration) =>
        (declaration.js || []).includes(unit),
      ).length;
      assert.equal(
        count,
        1,
        `${unit} must be named by exactly one declaration, or it runs twice in a page`,
      );
    }
    const withFilter = declarations.filter((declaration) =>
      (declaration.js || []).includes(FILTER),
    );
    assert.equal(
      withFilter.length,
      2,
      'both isolated-world declarations call the predicate, so both load the filter',
    );
    for (const declaration of withFilter) {
      assert.equal(
        declaration.js[0],
        FILTER,
        'and in each of them the filter is listed before the script that calls it',
      );
    }
  });

  it('sets neither all_frames nor match_about_blank anywhere', () => {
    for (const declaration of MANIFEST.content_scripts || []) {
      assert.ok(
        !('all_frames' in declaration),
        'no declaration may set all_frames (AR-5: one frame)',
      );
      assert.ok(
        !('match_about_blank' in declaration),
        'no declaration may set match_about_blank',
      );
    }
    assert.ok(
      !('all_frames' in MANIFEST),
      'the manifest itself may not set all_frames',
    );
    assert.ok(
      !('match_about_blank' in MANIFEST),
      'the manifest itself may not set match_about_blank',
    );
  });
});
