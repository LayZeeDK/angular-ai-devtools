import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const SRC = readFileSync(new URL("./background.js", import.meta.url), "utf8");

function boot() {
  const sent = [];
  let listener = null;
  const chrome = {
    runtime: {
      onMessage: { addListener: (cb) => { listener = cb; } },
      sendMessage: (msg) => { sent.push(msg); return true; },
    },
  };
  const sandbox = { chrome, console: { log: () => {} } };
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(SRC, ctx, { filename: "background.js" });
  return { listener, sent };
}

const TYPES = [
  { type: "angular-ai:record", msg: { type: "angular-ai:record", cycle: 1 } },
  { type: "angular-ai:state", msg: { type: "angular-ai:state" } },
  { type: "angular-ai:di-graph", msg: { type: "angular-ai:di-graph" } },
  { type: "angular-detected", msg: { type: "angular-detected" } },
];

describe("background.js", () => {
  for (const { type, msg } of TYPES) {
    it(`re-broadcasts ${type} with tabId from sender`, () => {
      const { listener, sent } = boot();
      assert.equal(typeof listener, "function");
      const before = sent.length;
      const ret = listener(msg, { tab: { id: 7 } }, () => {});
      assert.ok(ret, `${type} listener should return truthy`);
      assert.equal(sent.length, before + 1, `${type} should be re-broadcast`);
      assert.equal(sent[sent.length - 1].type, type);
      assert.equal(sent[sent.length - 1].tabId, 7);
    });
  }

  it("does not re-broadcast unknown type host:pick", () => {
    const { listener, sent } = boot();
    const before = sent.length;
    listener({ type: "host:pick" }, { tab: { id: 7 } }, () => {});
    assert.equal(sent.length, before, "host:pick should not be re-broadcast");
  });

  for (const type of ["angular-ai:record", "angular-ai:state", "angular-ai:di-graph"]) {
    it(`re-broadcasts ${type} even when sender.tab is undefined (tabId: undefined)`, () => {
      const { listener, sent } = boot();
      const before = sent.length;
      const msg = { type };
      if (type === "angular-ai:record") msg.cycle = 1;
      const ret = listener(msg, {}, () => {});
      assert.ok(ret);
      assert.equal(sent.length, before + 1);
      assert.equal(sent[sent.length - 1].tabId, undefined);
    });
  }
});
