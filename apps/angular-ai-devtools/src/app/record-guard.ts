/**
 * The record guard shared by the job and tool-registry code — one definition
 * instead of the seven identical private copies this replaced.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
