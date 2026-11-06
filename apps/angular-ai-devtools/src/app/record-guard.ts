/**
 * The record guard shared by the job and tool-registry code — one definition
 * instead of the seven identical private copies this replaced.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The failure's text, for a message a person reads. An `Error` contributes its message; anything
 * else is coerced, and a value whose `toString` throws contributes a fixed phrase rather than
 * throwing out of the caller's error path.
 */
export function describeFailure(failure: unknown): string {
  if (failure instanceof Error) {
    return failure.message;
  }
  try {
    return String(failure);
  } catch {
    return 'an unprintable failure';
  }
}
