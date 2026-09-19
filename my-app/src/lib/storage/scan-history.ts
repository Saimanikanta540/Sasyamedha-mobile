import { getDb } from './db';

/** Sentinel disease value for a scan captured offline and not yet analyzed. */
export const PENDING_DISEASE = '__pending__';

export interface ScanEntry {
  id: string;
  disease: string;
  confidence: number;
  imageUri: string;
  capturedAt: string;
}

interface ScanRow {
  id: string;
  disease: string;
  confidence: number;
  image_uri: string;
  captured_at: string;
}

function fromRow(row: ScanRow): ScanEntry {
  return {
    id: row.id,
    disease: row.disease,
    confidence: row.confidence,
    imageUri: row.image_uri,
    capturedAt: row.captured_at,
  };
}

export async function listScans(): Promise<ScanEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ScanRow>(
    'SELECT * FROM scan_history ORDER BY captured_at DESC',
  );
  return rows.map(fromRow);
}

export async function getScan(id: string): Promise<ScanEntry | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ScanRow>('SELECT * FROM scan_history WHERE id = ?', [id]);
  return row ? fromRow(row) : null;
}

export async function insertScan(entry: ScanEntry): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO scan_history (id, disease, confidence, image_uri, captured_at) VALUES (?, ?, ?, ?, ?)',
    [entry.id, entry.disease, entry.confidence, entry.imageUri, entry.capturedAt],
  );
}

export async function updateScanResult(
  id: string,
  disease: string,
  confidence: number,
): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE scan_history SET disease = ?, confidence = ? WHERE id = ?', [
    disease,
    confidence,
    id,
  ]);
}

export async function deleteScan(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM scan_history WHERE id = ?', [id]);
}
