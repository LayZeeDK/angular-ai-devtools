/*!
 * stale-view-worker.js - dedicated worker for the per-page stale-view scan (N24/T004).
 *
 * Consumes a scan request `{ token, graph }` and returns `{ token, findings }`,
 * where `findings` is produced by the T003 scan algorithm (inlined here so the
 * worker is self-contained in the extension bundle). A result whose `token` does
 * not match the latest issued token is discarded by the caller.
 */
(function (global) {
  "use strict";

  const SUPPORTED_MIN = { major: 22, minor: 1, patch: 3 };
  const IDENT = "[A-Za-z_$][A-Za-z0-9_$]*";
  const WRITE_PATTERN = new RegExp(
    "this\\s*\\.\\s*(" + IDENT + ")\\s*(?:=|\\.\\s*set\\s*\\(|\\.\\s*update\\s*\\()",
    "g",
  );

  function parseVersion(version) {
    const text = String(version == null ? "" : version).trim();
    const m = text.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!m) return null;
    return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
  }

  function angularVersionGate(version) {
    const v = String(version == null ? "" : version).trim();
    const parsed = parseVersion(v);
    if (!parsed) return { supported: true, version: v };
    const supported =
      parsed.major > SUPPORTED_MIN.major ||
      (parsed.major === SUPPORTED_MIN.major && parsed.minor > SUPPORTED_MIN.minor) ||
      (parsed.major === SUPPORTED_MIN.major && parsed.minor === SUPPORTED_MIN.minor && parsed.patch >= SUPPORTED_MIN.patch);
    return { supported: supported, version: v };
  }

  function matchDirectWrites(source) {
    const text = source == null ? "" : String(source);
    const out = [];
    const seen = new Set();
    const re = new RegExp(WRITE_PATTERN.source, "g");
    let m;
    while ((m = re.exec(text)) !== null) {
      const field = m[1];
      if (!seen.has(field)) {
        seen.add(field);
        out.push(field);
      }
      if (m.index === re.lastIndex) re.lastIndex++;
    }
    return out;
  }

  function nodeText(node) {
    if (!node) return "";
    if (typeof node.debuggableFnSource === "string") return node.debuggableFnSource;
    if (typeof node.debuggableFn === "string") return node.debuggableFn;
    const fn = node.debuggableFn;
    if (fn && typeof (fn.toString) === "function") {
      try { return String(fn.toString()); } catch (e) { return ""; }
    }
    return "";
  }

  function isScannableKind(kind) {
    const k = String(kind == null ? "" : kind).toLowerCase();
    return k === "template" || k === "computed";
  }

  function resolveInstance(node, opts) {
    if (opts && typeof opts.resolveInstance === "function") return opts.resolveInstance(node);
    if (node && node.instance !== undefined) return node.instance;
    return null;
  }

  function resolveComponent(node, instance, opts) {
    if (opts && typeof opts.resolveComponent === "function") return opts.resolveComponent(node, instance);
    if (node && typeof node.component === "string") return node.component;
    if (node && node.component === null) return null;
    if (instance && instance.constructor && instance.constructor.name) return instance.constructor.name;
    if (node && typeof node.label === "string" && node.label) return node.label;
    if (node && typeof node.nodeLabel === "string" && node.nodeLabel) return node.nodeLabel;
    return null;
  }

  function isSignalFn(opts) {
    if (opts && typeof opts.isSignal === "function") return opts.isSignal;
    if (opts && opts.ng && typeof opts.ng.isSignal === "function") return opts.ng.isSignal;
    return function () { return false; };
  }

  function scanGraph(graph, options) {
    const opts = options || {};
    const g = (graph && typeof graph === "object") ? graph : {};
    const nodes = Array.isArray(opts.traversalOrder)
      ? opts.traversalOrder
      : Array.isArray(g.nodes) ? g.nodes : [];

    const version = (opts.version != null) ? opts.version
      : (opts.angularVersion != null) ? opts.angularVersion
      : (g.version != null) ? g.version
      : g.angularVersion;
    if (version != null) {
      const gate = angularVersionGate(version);
      if (!gate.supported) return [];
    }

    const isSignal = isSignalFn(opts);
    const seen = new Set();
    const findings = [];

    for (const node of nodes) {
      if (!node || !isScannableKind(node.kind)) continue;
      const source = nodeText(node);
      const fields = matchDirectWrites(source);
      if (fields.length === 0) continue;
      const instance = resolveInstance(node, opts);
      const component = resolveComponent(node, instance, opts);

      for (const field of fields) {
        if (instance != null) {
          let signalResult;
          try { signalResult = isSignal(instance[field]); } catch (e) { signalResult = undefined; }
          if (signalResult !== false) continue;
        }
        const nodeKey = String(node.id != null ? node.id : (node.label != null ? node.label : (node.nodeLabel != null ? node.nodeLabel : "")));
        const dedupKey = nodeKey + "::" + field;
        if (seen.has(dedupKey)) continue;
        seen.add(dedupKey);
        findings.push({
          nodeLabel: String(node.nodeLabel != null ? node.nodeLabel : (node.label != null ? node.label : nodeKey)),
          field: field,
          component: component,
          pattern: "direct write in subscribe callback",
        });
      }
    }
    return findings;
  }

  function handleRequest(data) {
    const req = data || {};
    const token = (req.token != null) ? req.token : (req.id != null ? req.id : null);
    const graph = (req.graph != null) ? req.graph
      : (req.payload && req.payload.graph != null) ? req.payload.graph
      : req.data;
    const findings = scanGraph(graph, req.options || {});
    return { token: token, findings: findings };
  }

  // Worker entry point.
  if (typeof self !== "undefined") {
    self.onmessage = function (e) {
      const result = handleRequest(e && e.data);
      try { self.postMessage(result); } catch (err) { /* ignore */ }
    };
    // Expose for direct (non-worker) callers / tests. These three names are this file's own
    // additions to the worker scope, and the platform's `self` type declares none of them; the
    // property set is handed over with `Object.assign`, which defines exactly those three own
    // properties on the scope, as the assignments it replaces did.
    Object.assign(self, {
      scanGraph: scanGraph,
      matchDirectWrites: matchDirectWrites,
      handleScanRequest: handleRequest,
    });
  }

  // CommonJS / Node module support for tests.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { scanGraph: scanGraph, matchDirectWrites: matchDirectWrites, handleRequest: handleRequest, angularVersionGate: angularVersionGate };
  }

  // Browser global fallback: the same one name, defined on the scope object the file was called
  // with. `globalThis` — and the test harness's plain object — declare no `staleViewScan`, so the
  // property is defined through `Object.assign` rather than written onto the platform's type.
  if (typeof global !== "undefined") {
    Object.assign(global, {
      staleViewScan: { scanGraph: scanGraph, matchDirectWrites: matchDirectWrites, handleRequest: handleRequest },
    });
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
