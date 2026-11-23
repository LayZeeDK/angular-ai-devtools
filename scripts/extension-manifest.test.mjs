// M062 T001 — the manifest registration of the outlet record reader.
//
// `extension/outlet-state.js` reduces the router state the page agent already holds, so the manifest
// must load it in the one MAIN-world declaration the agent itself boots in, and it must be the only
// outlet reader the manifest registers: a second registration would be a second place an outlet name
// comes from (INTENT.md SC3 / N3, held-out edge E5).
//
// Measured at this head. The manifest declares three content-script units in the page realm — the
// overlay host at `document_start`, the relay at `document_idle`, and the MAIN-world agent at
// `document_idle` — and no module the manifest names carried an outlet name before this task
// (`grep -ri "\boutlet\b" extension/` returned 0 matches). This suite is the registration half of
// AC1; `scripts/outlet-state.test.mjs` is the source half, and a planted second reader reddens that
// scan. Here the red is a second `outlet`-named module added to the declaration.
//
// Every assertion is about the named declaration rather than about how many declarations there are,
// so a later task that adds one does not redden this file for the wrong reason.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const EXTENSION_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'extension',
);
const MANIFEST = JSON.parse(
  readFileSync(join(EXTENSION_DIR, 'manifest.json'), 'utf8'),
);

const RECORD = 'outlet-state.js';
const AGENT_MAIN = 'agent-main.js';
const SECOND_READER = 'outlet-mirror.js';

const OUTLET_MODULE = /outlet/i;

function declarationsOf(manifest) {
  return manifest.content_scripts ?? [];
}

/** The one declaration that lists a file, or `undefined` when no declaration lists it. */
function declarationFor(manifest, file) {
  return declarationsOf(manifest).find((declaration) =>
    (declaration.js ?? []).includes(file),
  );
}

/** How many declarations list a file: one is the only answer that does not run it twice. */
function declarationCount(manifest, file) {
  return declarationsOf(manifest).filter((declaration) =>
    (declaration.js ?? []).includes(file),
  ).length;
}

/** Every module the manifest registers whose name carries an outlet, in declaration order. */
function outletModules(manifest) {
  const found = [];
  for (const declaration of declarationsOf(manifest)) {
    for (const file of declaration.js ?? []) {
      if (OUTLET_MODULE.test(file)) found.push(file);
    }
  }
  return found;
}

/** A fresh copy of the manifest, so a mutant never touches the object the pins read. */
function copyOf(manifest) {
  return JSON.parse(JSON.stringify(manifest));
}

describe('the outlet record reader the manifest registers', () => {
  it('loads beside the page-realm agent, before the script that reads it', () => {
    const declaration = declarationFor(MANIFEST, RECORD);
    assert.ok(
      declaration,
      `no content_scripts declaration lists ${RECORD}: the record module is never loaded into a page`,
    );
    const agentDeclaration = declarationFor(MANIFEST, AGENT_MAIN);
    assert.ok(
      agentDeclaration,
      `no content_scripts declaration lists ${AGENT_MAIN}`,
    );
    assert.equal(
      declaration,
      agentDeclaration,
      `the record is declared in the same declaration as ${AGENT_MAIN}, which is the reader that holds the router state it reduces`,
    );
    assert.equal(
      declarationCount(MANIFEST, RECORD),
      1,
      `${RECORD} must be named by exactly one declaration, or it installs its namespace twice in a page`,
    );
    assert.equal(
      declaration.world,
      'MAIN',
      'the record runs in the MAIN world, where the router state the agent holds exists',
    );
    assert.equal(
      declaration.run_at,
      'document_idle',
      'and at the shipped run_at of that declaration',
    );
    assert.ok(
      declaration.js.indexOf(RECORD) < declaration.js.indexOf(AGENT_MAIN),
      `${RECORD} must be listed before ${AGENT_MAIN}, the script that calls it`,
    );
    assert.ok(
      existsSync(join(EXTENSION_DIR, RECORD)),
      `extension/${RECORD} is named by the manifest but does not exist`,
    );
  });

  it('is the only outlet reader the manifest registers, and a second registration reddens that pin', (t) => {
    assert.deepEqual(
      outletModules(MANIFEST),
      [RECORD],
      `the manifest registers ${JSON.stringify(outletModules(MANIFEST))} as outlet readers; the record is the only source of an outlet name (N3, E5)`,
    );

    // The mutant: one more outlet-named module, in the declaration that already carries the record.
    const mutated = copyOf(MANIFEST);
    const declaration = declarationFor(mutated, RECORD);
    declaration.js.splice(declaration.js.indexOf(RECORD), 0, SECOND_READER);
    const found = outletModules(mutated);
    assert.deepEqual(
      found,
      [SECOND_READER, RECORD],
      'the mutant must add a module the scan sees, or the pin below proves nothing',
    );

    let failure = null;
    try {
      assert.deepEqual(
        found,
        [RECORD],
        `the manifest registers ${JSON.stringify(found)} as outlet readers; the record is the only source of an outlet name`,
      );
    } catch (error) {
      failure = error;
    }
    assert.ok(failure, 'the second registration must redden the pin');
    assert.match(failure.message, /outlet-mirror\.js/);
    assert.match(failure.message, /only source of an outlet name/);
    t.diagnostic(
      `SC3 registration mutant red: ${failure.message.split('\n')[0]}`,
    );
  });

  it('keeps the manifest unmutated: the pins above read the shipped file', () => {
    assert.deepEqual(
      outletModules(MANIFEST),
      [RECORD],
      'the mutant is a copy, so the shipped manifest still registers one outlet reader',
    );
    assert.equal(
      declarationCount(MANIFEST, SECOND_READER),
      0,
      `and ${SECOND_READER} is not in the shipped manifest`,
    );
  });
});
