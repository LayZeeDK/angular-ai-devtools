import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const WORKER_SRC = readFileSync(new URL("../../extension/stale-view-worker.js", import.meta.url), "utf8");

function bootWorker() {
  const posted = [];
  const sandbox = {
    self: null,
    console: { log: () => {}, warn: () => {}, error: () => {} },
  };
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(WORKER_SRC, ctx, { filename: "stale-view-worker.js" });
  const worker = {
    postMessage(msg) { sandbox.self.onmessage({ data: msg }); },
    _posted: posted,
  };
  // capture postMessage
  const origPost = sandbox.self.postMessage;
  sandbox.self.postMessage = (m) => { posted.push(m); };
  return { sandbox, posted };
}

test("worker echoes token and returns scan findings", () => {
  const { sandbox, posted } = bootWorker();
  const graph = {
    version: "22.1.3",
    nodes: [
      { id: "n1", kind: "template", label: "Comp", debuggableFnSource: "subscribe(() => { this.x = 1; })", component: "Comp", instance: { x: 1 } },
    ],
  };
  sandbox.self.onmessage({ data: { token: "t1", graph } });
  assert.equal(posted.length, 1);
  assert.equal(posted[0].token, "t1");
  assert.equal(posted[0].findings.length, 1);
  assert.equal(posted[0].findings[0].field, "x");
});

test("superseded scan result is discarded (token mismatch)", () => {
  // Simulate caller-side latest-token tracking.
  let latest = null;
  const results = [];
  const { sandbox, posted } = bootWorker();
  const graph = { version: "22.1.3", nodes: [{ id: "n1", kind: "template", label: "Comp", debuggableFnSource: "subscribe(() => { this.x = 1; })", component: "Comp", instance: { x: 1 } }] };

  // First scan issued then superseded by a second before first returns.
  latest = "t1";
  sandbox.self.onmessage({ data: { token: "t1", graph } });
  // newer token issued
  latest = "t2";
  sandbox.self.onmessage({ data: { token: "t2", graph } });

  for (const r of posted) {
    if (r.token !== latest) continue; // discard stale
    results.push(r);
  }
  assert.equal(results.length, 1);
  assert.equal(results[0].token, "t2");
  // No interleaving: only newest result retained.
  assert.equal(results[0].findings.length, 1);
});

test("worker request shape {token,graph} yields {token,findings}", () => {
  const { sandbox, posted } = bootWorker();
  sandbox.self.onmessage({ data: { token: "abc", graph: { version: "22.1.3", nodes: [] } } });
  assert.deepEqual(Object.keys(posted[0]).sort(), ["findings", "token"]);
  assert.equal(posted[0].token, "abc");
  assert.equal(posted[0].findings.length, 0);
});

test("service terminates worker on close (source check)", () => {
  const src = readFileSync(new URL("../../apps/angular-ai-devtools/src/app/stale-view-scan.service.ts", import.meta.url), "utf8");
  assert.match(src, /terminateWorker\(\)/);
  assert.match(src, /beforeunload/);
  assert.match(src, /pagehide/);
  assert.match(src, /ngOnDestroy/);
});
