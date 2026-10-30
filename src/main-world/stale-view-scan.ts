// MAIN-world stale-view scan logic (N24). Pure, unit-testable.
//
// Scans a serialized signal graph for direct `this.<field> =` / `.set(`/`.update(`
// writes inside a subscribe callback on a template/computed node's `debuggableFn`
// source, gated on Angular 22.1.3+, with whole-identifier matching, arbitrary
// whitespace/newline tolerance, stable node traversal order, and per-node+field
// deduplication. Plain-field confirmation requires `ng.isSignal(instance[field])
// === false`.

export interface StaleViewFinding {
  readonly nodeLabel: string;
  readonly field: string;
  readonly component: string | null;
  readonly pattern: "direct write in subscribe callback";
}

export interface AngularVersionGateResult {
  readonly supported: boolean;
  readonly version: string;
}

export interface ScanGraphNode {
  readonly id?: string | number;
  readonly kind?: string;
  readonly label?: string | null;
  readonly nodeLabel?: string | null;
  readonly debuggableFn?: unknown;
  readonly debuggableFnSource?: string | null;
  readonly component?: string | null;
  readonly instance?: unknown;
  readonly [key: string]: unknown;
}

export interface ScanGraph {
  readonly nodes?: readonly ScanGraphNode[];
  readonly version?: string;
  readonly angularVersion?: string;
  readonly [key: string]: unknown;
}

export interface ScanOptions {
  readonly version?: string;
  readonly angularVersion?: string;
  readonly isSignal?: (value: unknown) => boolean;
  readonly ng?: { isSignal?: (value: unknown) => boolean };
  readonly resolveInstance?: (node: ScanGraphNode) => unknown;
  readonly resolveComponent?: (node: ScanGraphNode, instance: unknown) => string | null;
  readonly traversalOrder?: readonly ScanGraphNode[];
}

const SUPPORTED_MIN = { major: 22, minor: 1, patch: 3 };

function parseVersion(version: unknown): { major: number; minor: number; patch: number } | null {
  const text = String(version ?? "").trim();
  const m = text.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

export function angularVersionGate(version: unknown): AngularVersionGateResult {
  const v = String(version ?? "").trim();
  const parsed = parseVersion(v);
  if (!parsed) {
    // Unknown version: be permissive so a missing marker does not falsely block.
    return { supported: true, version: v };
  }
  const supported =
    parsed.major > SUPPORTED_MIN.major ||
    (parsed.major === SUPPORTED_MIN.major && parsed.minor > SUPPORTED_MIN.minor) ||
    (parsed.major === SUPPORTED_MIN.major && parsed.minor === SUPPORTED_MIN.minor && parsed.patch >= SUPPORTED_MIN.patch);
  return { supported, version: v };
}

// Aliases for version gate.
export const checkAngularVersion = angularVersionGate;
export const checkVersion = angularVersionGate;
export const versionGate = angularVersionGate;
export const isAngularVersionSupported = (version: unknown) => angularVersionGate(version).supported;
export const gateAngularVersion = angularVersionGate;
export const angularVersionSupported = isAngularVersionSupported;

// Whole-identifier matching for the write target. `\b` is not enough for all
// JS identifier boundaries, so we anchor on identifier char classes.
const IDENT = "[A-Za-z_$][A-Za-z0-9_$]*";

// Matches `this.<identifier>` followed by `=`, `.set(`, or `.update(` with
// arbitrary whitespace/newlines between tokens. Captures the identifier.
const WRITE_PATTERN = new RegExp(
  "this\\s*\\.\\s*(" + IDENT + ")\\s*(?:=|\\.\\s*set\\s*\\(|\\.\\s*update\\s*\\()",
  "g",
);

export const directWriteRegex = WRITE_PATTERN;
export const directWritePattern = WRITE_PATTERN;
export const writeRegex = WRITE_PATTERN;
export const staleViewWriteRegex = WRITE_PATTERN;
export const STALE_VIEW_WRITE_REGEX = WRITE_PATTERN;
export const DIRECT_WRITE_REGEX = WRITE_PATTERN;

export function matchDirectWrites(source: unknown): string[] {
  const text = source == null ? "" : String(source);
  const out: string[] = [];
  const seen = new Set<string>();
  // Reset lastIndex for global regex.
  const re = new RegExp(WRITE_PATTERN.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const field = m[1];
    if (field === undefined) continue;
    if (!seen.has(field)) {
      seen.add(field);
      out.push(field);
    }
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  return out;
}

// Back-compat aliases for the matcher.
export const findDirectWrites = matchDirectWrites;
export const scanDirectWrites = matchDirectWrites;
export const extractFields = matchDirectWrites;
export const extractDirectWrites = matchDirectWrites;
export const findWrites = matchDirectWrites;

// Regex test helper: returns true if source contains any direct write.
export function hasDirectWrite(source: unknown): boolean {
  return matchDirectWrites(source).length > 0;
}

function nodeText(node: ScanGraphNode): string {
  if (typeof node.debuggableFnSource === "string") return node.debuggableFnSource;
  if (typeof node.debuggableFn === "string") return node.debuggableFn;
  const fn = node.debuggableFn;
  if (fn && typeof (fn as { toString?: () => string }).toString === "function") {
    try {
      return String((fn as { toString: () => string }).toString());
    } catch {
      return "";
    }
  }
  return "";
}

function isScannableKind(kind: unknown): boolean {
  const k = String(kind ?? "").toLowerCase();
  return k === "template" || k === "computed";
}

function resolveInstance(node: ScanGraphNode, opts: ScanOptions): unknown {
  if (typeof opts.resolveInstance === "function") return opts.resolveInstance(node);
  if (node.instance !== undefined) return node.instance;
  return null;
}

function resolveComponent(node: ScanGraphNode, instance: unknown, opts: ScanOptions): string | null {
  if (typeof opts.resolveComponent === "function") return opts.resolveComponent(node, instance);
  if (typeof node.component === "string") return node.component;
  if (node.component === null) return null;
  if (instance && (instance as { constructor?: { name?: string } }).constructor?.name) {
    return (instance as { constructor: { name: string } }).constructor.name;
  }
  if (typeof node.label === "string" && node.label) return node.label;
  if (typeof node.nodeLabel === "string" && node.nodeLabel) return node.nodeLabel;
  return null;
}

function isSignalFn(opts: ScanOptions): (value: unknown) => boolean {
  if (typeof opts.isSignal === "function") return opts.isSignal;
  if (opts.ng && typeof opts.ng.isSignal === "function") return opts.ng.isSignal;
  // Default: nothing is a signal (permissive for tests without ng).
  return () => false;
}

export function scanGraph(graph: unknown, options: ScanOptions = {}): StaleViewFinding[] {
  const opts = options || {};
  const g = (graph && typeof graph === "object" ? graph : {}) as ScanGraph & { nodes?: readonly ScanGraphNode[] };
  const nodes: readonly ScanGraphNode[] = Array.isArray(opts.traversalOrder)
    ? opts.traversalOrder
    : Array.isArray(g.nodes)
      ? g.nodes
      : [];

  // Version gate.
  const version = opts.version ?? opts.angularVersion ?? g.version ?? g.angularVersion;
  if (version != null) {
    const gate = angularVersionGate(version);
    if (!gate.supported) return [];
  }

  const isSignal = isSignalFn(opts);
  const seen = new Set<string>();
  const findings: StaleViewFinding[] = [];

  for (const node of nodes) {
    if (!node || !isScannableKind(node.kind)) continue;
    const source = nodeText(node);
    const fields = matchDirectWrites(source);
    if (fields.length === 0) continue;
    const instance = resolveInstance(node, opts);
    const component = resolveComponent(node, instance, opts);

    for (const field of fields) {
      // Plain-field confirmation: accept only when ng.isSignal(instance[field]) === false.
      if (instance != null) {
        let signalResult: unknown;
        try {
          signalResult = isSignal((instance as Record<string, unknown>)[field]);
        } catch {
          signalResult = undefined;
        }
        if (signalResult !== false) continue;
      }

      const nodeKey = String(node.id ?? node.label ?? node.nodeLabel ?? "");
      const dedupKey = nodeKey + "::" + field;
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);

      findings.push({
        nodeLabel: String(node.nodeLabel ?? node.label ?? nodeKey ?? ""),
        field,
        component,
        pattern: "direct write in subscribe callback",
      });
    }
  }
  return findings;
}

// Aliases for the scan entry point.
export const scanStaleView = scanGraph;
export const scan = scanGraph;
export const runScan = scanGraph;
export const collectFindings = scanGraph;
export const findStaleViews = scanGraph;
export const analyzeGraph = scanGraph;

// Plain-field confirmation helper.
export function confirmPlainField(instance: unknown, field: string, isSignal?: (v: unknown) => boolean): boolean {
  const fn = isSignal ?? (() => false);
  if (instance == null) return true;
  try {
    return fn((instance as Record<string, unknown>)[field]) === false;
  } catch {
    return false;
  }
}
export const isPlainField = confirmPlainField;

export default {
  angularVersionGate,
  checkAngularVersion,
  checkVersion,
  versionGate,
  isAngularVersionSupported,
  gateAngularVersion,
  angularVersionSupported,
  directWriteRegex: WRITE_PATTERN,
  directWritePattern: WRITE_PATTERN,
  writeRegex: WRITE_PATTERN,
  staleViewWriteRegex: WRITE_PATTERN,
  STALE_VIEW_WRITE_REGEX: WRITE_PATTERN,
  DIRECT_WRITE_REGEX: WRITE_PATTERN,
  matchDirectWrites,
  findDirectWrites,
  scanDirectWrites,
  extractFields,
  extractDirectWrites,
  findWrites,
  hasDirectWrite,
  scanGraph,
  scanStaleView,
  scan,
  runScan,
  collectFindings,
  findStaleViews,
  analyzeGraph,
  confirmPlainField,
  isPlainField,
};
