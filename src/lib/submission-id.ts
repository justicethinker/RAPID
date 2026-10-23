/**
 * One identifier per form instance. A failed save retries with the same id, so
 * the server can deduplicate network retries and double clicks.
 */
export function createSubmissionId(prefix: 't' | 'f'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
