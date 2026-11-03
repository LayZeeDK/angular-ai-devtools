// Tests for extension/manifest.json — the first pin this manifest has had.
// Written to survive the third declaration the overlay task adds: every assertion is about a named
// declaration or about every declaration, never about how many there are.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const EXTENSION_DIR = dirname(fileURLToPath(import.meta.url));
const MANIFEST = JSON.parse(readFileSync(join(EXTENSION_DIR, "manifest.json"), "utf8"));
const FILTER = "observer-filter.js";
const RELAY = "relay.js";
const AGENT_MAIN = "agent-main.js";

/** Every file the manifest names, whichever declaration names it. */
function namedFiles(manifest) {
  const files = [];
  if (manifest.background && manifest.background.service_worker) files.push(manifest.background.service_worker);
  for (const declaration of manifest.content_scripts || []) files.push(...(declaration.js || []));
  if (manifest.devtools_page) files.push(manifest.devtools_page);
  for (const icon of Object.values(manifest.icons || {})) files.push(icon);
  return files;
}

function declarationFor(file) {
  const found = (MANIFEST.content_scripts || []).find((declaration) => (declaration.js || []).includes(file));
  assert.ok(found, `no content_scripts declaration lists ${file}`);
  return found;
}

describe("extension/manifest.json", () => {
  it("names only files that exist under extension/", () => {
    const files = namedFiles(MANIFEST);
    assert.ok(files.length > 0, "the manifest must name at least one file");
    for (const file of files) {
      assert.ok(existsSync(join(EXTENSION_DIR, file)), `extension/${file} is named by the manifest but does not exist`);
    }
  });

  it("loads the shared observer filter before the relay, at document_idle", () => {
    const relayDeclaration = declarationFor(RELAY);
    assert.equal(relayDeclaration.js[0], FILTER, "the shared filter must be the first script in the relay's declaration");
    assert.ok(
      relayDeclaration.js.indexOf(FILTER) < relayDeclaration.js.indexOf(RELAY),
      "the filter must be declared before the script that calls it"
    );
    assert.equal(relayDeclaration.run_at, "document_idle", "the relay keeps its shipped run_at");
  });

  it("keeps the MAIN-world agent at document_idle in world MAIN", () => {
    const agentDeclaration = declarationFor(AGENT_MAIN);
    assert.equal(agentDeclaration.run_at, "document_idle", "the agent keeps its shipped run_at");
    assert.equal(agentDeclaration.world, "MAIN", "the agent is the MAIN-world declaration");
  });

  it("sets neither all_frames nor match_about_blank anywhere", () => {
    for (const declaration of MANIFEST.content_scripts || []) {
      assert.ok(!("all_frames" in declaration), "no declaration may set all_frames (AR-5: one frame)");
      assert.ok(!("match_about_blank" in declaration), "no declaration may set match_about_blank");
    }
    assert.ok(!("all_frames" in MANIFEST), "the manifest itself may not set all_frames");
    assert.ok(!("match_about_blank" in MANIFEST), "the manifest itself may not set match_about_blank");
  });
});
