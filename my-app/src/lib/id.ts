/** Short client-generated id — good enough for local-only primary keys (scans, outbox rows). */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
