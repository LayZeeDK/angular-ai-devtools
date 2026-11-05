// MAIN-world interop keep-list classifier (T002). Pure, unit-testable.
//
// A node is kept iff its label is `toSignal.source`/`toSignal.state` (Rule 1)
// OR its text (per nodeText preference order) contains a whole-token
// `subject.error` match (Rule 2). No third, fixture-shaped exception.

export interface InteropNode {
  readonly label?: string | null;
  readonly debuggableFn?: unknown;
  readonly debuggableFnSource?: string | null;
  readonly [key: string]: unknown;
}

export function nodeText(node: InteropNode): string {
  if (typeof node.debuggableFnSource === 'string')
    return node.debuggableFnSource;
  if (typeof node.debuggableFn === 'string') return node.debuggableFn;
  const fn = node.debuggableFn;
  if (
    fn &&
    typeof (fn as { toString?: () => string }).toString === 'function'
  ) {
    try {
      return String((fn as { toString: () => string }).toString());
    } catch {
      return '';
    }
  }
  return '';
}

const SUBJECT_ERROR_RE = /(?<![A-Za-z0-9_$])subject\.error(?![A-Za-z0-9_$])/;

export function isInteropNode(node: InteropNode | null | undefined): boolean {
  if (!node || typeof node !== 'object') return false;
  const label = node.label;
  if (label === 'toSignal.source' || label === 'toSignal.state') return true;
  const text = nodeText(node);
  return SUBJECT_ERROR_RE.test(text);
}

export function keepInteropNodes<T extends InteropNode>(
  nodes: readonly T[] | null | undefined,
): T[] {
  const list = Array.isArray(nodes) ? nodes : [];
  const out: T[] = [];
  for (const n of list) {
    if (isInteropNode(n)) out.push(n);
  }
  return out;
}

export default { isInteropNode, keepInteropNodes, nodeText };
