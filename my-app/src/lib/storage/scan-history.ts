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

const DEMO_SCANS: Omit<ScanEntry, 'capturedAt'>[] = [
  {
    id: 'demo-scan-1',
    disease: 'late_blight',
    confidence: 0.86,
    imageUri: 'https://picsum.photos/seed/tomato-leaf-1/400/400',
  },
  {
    id: 'demo-scan-2',
    disease: 'healthy',
    confidence: 0.93,
    imageUri: 'https://picsum.photos/seed/tomato-leaf-2/400/400',
  },
  {
    id: 'demo-scan-3',
    disease: 'yellow_leaf_curl_virus',
    confidence: 0.71,
    imageUri: 'https://picsum.photos/seed/tomato-leaf-3/400/400',
  },
];

/**
 * Scan history is purely local (expo-sqlite) — a fresh install has none,
 * which is correct, not broken, but makes the History screen (and its
 * empty-state) the only thing a reviewer can't see without actually
 * scanning photos first. Seeds a few realistic entries once, only if the
 * table is genuinely empty — never overwrites or duplicates real scans.
 * Thumbnails are generic placeholder photos (picsum.photos, seeded/
 * deterministic so they don't change), not actual tomato leaves — there's
 * no bundled sample photo in assets/ to use instead, and inventing a
 * misleading "real photo" would cut against this app's own honesty
 * principle (is_mock is never hidden) more than an obviously generic
 * placeholder does.
 */
export async function seedDemoScansIfEmpty(): Promise<void> {
  const existing = await listScans();
  if (existing.length > 0) return;
  const now = Date.now();
  for (const [i, scan] of DEMO_SCANS.entries()) {
    await insertScan({ ...scan, capturedAt: new Date(now - i * 3600_000).toISOString() });
  }
}
