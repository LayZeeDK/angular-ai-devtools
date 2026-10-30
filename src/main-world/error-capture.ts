// MAIN-world error capture for M010 (N4: Angular error explainer).
//
// Pure, unit-testable logic: extracts an `NG0xxx` code from a thrown/uncaught
// error, resolves the owning component through `ng.getOwningComponent` (Tier 0,
// dev mode only), and stores captured errors in a bounded ring buffer that drops
// the oldest entry first. The "no owning component" case is reported explicitly
// and never attributed to an unrelated component (N5).
//
// Mapping path (N5): an error is captured -> `resolveOwningComponent` calls
// `ng.getOwningComponent(target)` on the offending element/instance -> the
// returned component instance's constructor name becomes `CapturedError.component`.
// When `getOwningComponent` is missing or returns null/undefined, `component`
// stays `null` and is rendered as "no owning component"; no fallback or guess is
// ever made, so an error is never attributed to a component that did not throw it.

export const CAPACITY = 50;

export const NO_OWN_COMPONENT = "no owning component";
export const NO_OWN_COMPONENT_MESSAGE = NO_OWN_COMPONENT;
export const NO_OWNING_COMPONENT = NO_OWN_COMPONENT;

export const EMPTY_STATE = "No captured errors";
export const EMPTY_MESSAGE = EMPTY_STATE;
export const NO_CAPTURED_ERRORS = EMPTY_STATE;

export interface CapturedError {
  code: string | null;
  message: string;
  component: string | null;
  timestamp: number;
}

export function extractErrorCode(value: unknown): string | null {
  const text =
    value instanceof Error ? `${value.name ?? ""} ${value.message ?? ""}` : String(value ?? "");
  const match = text.match(/NG0\d{3,}/);
  return match ? match[0] : null;
}

export function resolveOwningComponent(ng: any, target?: any): string | null {
  const fn =
    ng && typeof ng === "object"
      ? typeof ng.getOwningComponent === "function"
        ? ng.getOwningComponent
        : typeof ng["\u0152getOwningComponent"] === "function"
        ? ng["\u0152getOwningComponent"]
        : null
      : null;
  // Also accept the Angular-style ɵ-prefixed accessor if present.
  const getter =
    fn ||
    (ng && typeof ng === "object" && typeof ng.ɵgetOwningComponent === "function"
      ? ng.ɵgetOwningComponent
      : null);
  if (typeof getter !== "function") return null;
  let instance: any = null;
  try {
    instance = getter.call(ng, target);
  } catch {
    instance = null;
  }
  if (instance == null) return null;
  if (typeof instance === "string") return instance;
  if (typeof instance.name === "string" && instance.name) return instance.name;
  if (instance.constructor && typeof instance.constructor.name === "string" && instance.constructor.name) {
    return instance.constructor.name;
  }
  try {
    return String(instance);
  } catch {
    return null;
  }
}

export const getOwningComponentName = resolveOwningComponent;

function makeCapturedError(
  message: unknown,
  ng: any,
  target: any,
  timestamp: number,
  codeOverride?: string | null,
): CapturedError {
  return {
    code: codeOverride !== undefined ? codeOverride : extractErrorCode(message),
    message: String(message ?? "").trim(),
    component: resolveOwningComponent(ng, target),
    timestamp,
  };
}

export function captureError(...args: any[]): CapturedError {
  let message: unknown = "";
  let ng: any = null;
  let target: any = null;
  let timestamp = Date.now();
  let codeOverride: string | null | undefined = undefined;

  if (args.length === 0) {
    // nothing
  } else if (typeof args[0] === "string" || args[0] instanceof Error) {
    message = args[0];
    if (args[1] !== undefined) ng = args[1];
    if (args[2] !== undefined) target = args[2];
    if (typeof args[3] === "number") timestamp = args[3];
  } else if (args[0] && typeof args[0] === "object") {
    const o = args[0] as any;
    message = o.message ?? o.error ?? o.reason ?? o;
    if (o.ng !== undefined) ng = o.ng;
    else if (args[1] !== undefined) ng = args[1];
    if (o.target !== undefined) target = o.target;
    else if (o.element !== undefined) target = o.element;
    else if (o.instance !== undefined) target = o.instance;
    else if (args[2] !== undefined) target = args[2];
    if (typeof o.timestamp === "number") timestamp = o.timestamp;
    if (o.code !== undefined) codeOverride = o.code;
    if (typeof args[1] === "number") timestamp = args[1];
  }

  if (codeOverride === null) codeOverride = null;
  return makeCapturedError(message, ng, target, timestamp, codeOverride);
}

export function captureConsoleError(...args: any[]): CapturedError {
  const message = args.map((a) => (a instanceof Error ? a.message : String(a))).join(" ");
  const ng = args.length > 1 && args[args.length - 1] && args[args.length - 1].ng ? args[args.length - 1].ng : null;
  const target = args.length > 1 && args[args.length - 1] && args[args.length - 1].target ? args[args.length - 1].target : null;
  return captureError({ message, ng, target, timestamp: Date.now() });
}

export function captureWindowError(...args: any[]): CapturedError {
  // (message, source, lineno, colno, error, ng?, target?)
  const message = args[0];
  const ng = args[5] !== undefined ? args[5] : null;
  const target = args[6] !== undefined ? args[6] : null;
  return captureError({ message, ng, target, timestamp: Date.now() });
}

export function captureUnhandledRejection(...args: any[]): CapturedError {
  const reason = args[0] && args[0].reason !== undefined ? args[0].reason : args[0];
  const ng = args[1] !== undefined ? args[1] : null;
  const target = args[2] !== undefined ? args[2] : null;
  return captureError({ message: reason, ng, target, timestamp: Date.now() });
}

export class RingBuffer<T = CapturedError> {
  capacity: number;
  private items: T[] = [];

  constructor(capacity: number = CAPACITY) {
    this.capacity = typeof capacity === "number" && capacity > 0 ? capacity : CAPACITY;
    this.items = [];
  }

  push(item: T): void {
    this.items.push(item);
    while (this.items.length > this.capacity) this.items.shift();
  }

  toArray(): T[] {
    return this.items.slice();
  }

  get size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

export function createRingBuffer<T = CapturedError>(capacity: number = CAPACITY): RingBuffer<T> {
  return new RingBuffer<T>(capacity);
}

export function pushToRingBuffer<T>(buffer: T[], item: T, capacity: number = CAPACITY): T[] {
  const next = Array.isArray(buffer) ? buffer.slice() : [];
  next.push(item);
  while (next.length > capacity) next.shift();
  return next;
}

export const pushRing = pushToRingBuffer;
export const pushRingBuffer = pushToRingBuffer;
export const addToRingBuffer = pushToRingBuffer;
export const appendToRingBuffer = pushToRingBuffer;

export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof RingBuffer) return value.isEmpty();
  if (typeof value.size === "number") return value.size === 0;
  if (typeof value.length === "number") return value.length === 0;
  return false;
}

export function componentLabel(component: string | null): string {
  return component == null ? NO_OWN_COMPONENT : String(component);
}

export function isEmptyState(value: any): boolean {
  return isEmpty(value);
}

export const defaultExport = {
  CAPACITY,
  NO_OWN_COMPONENT,
  NO_OWN_COMPONENT_MESSAGE,
  NO_OWNING_COMPONENT,
  EMPTY_STATE,
  EMPTY_MESSAGE,
  NO_CAPTURED_ERRORS,
  extractErrorCode,
  resolveOwningComponent,
  getOwningComponentName: resolveOwningComponent,
  captureError,
  captureConsoleError,
  captureWindowError,
  captureUnhandledRejection,
  RingBuffer,
  createRingBuffer,
  pushToRingBuffer,
  pushRing,
  pushRingBuffer,
  addToRingBuffer,
  appendToRingBuffer,
  isEmpty,
  componentLabel,
  isEmptyState,
};

export default defaultExport;