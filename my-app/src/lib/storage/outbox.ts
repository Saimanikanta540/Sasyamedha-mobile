import { getDb } from './db';

export type OutboxKind = 'transport' | 'diagnose';
export type OutboxStatus = 'pending' | 'synced' | 'failed';

export interface OutboxEntry<TPayload = Record<string, unknown>> {
  id: string;
  kind: OutboxKind;
  payload: TPayload;
  status: OutboxStatus;
  referenceNumber: string | null;
  createdAt: string;
}

interface OutboxRow {
  id: string;
  kind: OutboxKind;
  payload: string;
  status: OutboxStatus;
  reference_number: string | null;
  created_at: string;
}

function fromRow(row: OutboxRow): OutboxEntry {
  return {
    id: row.id,
    kind: row.kind,
    payload: JSON.parse(row.payload),
    status: row.status,
    referenceNumber: row.reference_number,
    createdAt: row.created_at,
  };
}

export async function listOutbox(): Promise<OutboxEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<OutboxRow>('SELECT * FROM outbox ORDER BY created_at ASC');
  return rows.map(fromRow);
}

export async function enqueueOutbox(
  id: string,
  kind: OutboxKind,
  payload: Record<string, unknown>,
): Promise<OutboxEntry> {
  const db = await getDb();
  const createdAt = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO outbox (id, kind, payload, status, reference_number, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, kind, JSON.stringify(payload), 'pending', null, createdAt],
  );
  return { id, kind, payload, status: 'pending', referenceNumber: null, createdAt };
}

export async function markOutboxSynced(id: string, referenceNumber?: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE outbox SET status = ?, reference_number = ? WHERE id = ?', [
    'synced',
    referenceNumber ?? null,
    id,
  ]);
}

export async function markOutboxFailed(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE outbox SET status = ? WHERE id = ?', ['failed', id]);
}

export async function removeOutboxEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM outbox WHERE id = ?', [id]);
}
